import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertConversationSchema, insertMessageSchema } from "@shared/schema";
import Anthropic, { toFile } from '@anthropic-ai/sdk';
import multer from 'multer';
import { promises as fs } from 'fs';
import path from 'path';

// Using Claude Sonnet 4 model "claude-sonnet-4-20250514" which was released May 14, 2025
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY || "default_key",
});

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'text/csv',
      'application/json',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not supported'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // Get user's conversations
  app.get("/api/conversations", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const conversations = await storage.getUserConversations(req.user!.id);
      res.json(conversations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create a new conversation
  app.post("/api/conversations", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const result = insertConversationSchema.safeParse({
        ...req.body,
        userId: req.user!.id,
      });
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid conversation data" });
      }
      
      const conversation = await storage.createConversation(result.data);
      res.status(201).json(conversation);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get messages for a conversation
  app.get("/api/conversations/:id/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const conversationId = parseInt(req.params.id);
      const conversation = await storage.getConversation(conversationId);
      
      if (!conversation || conversation.userId !== req.user!.id) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      const messages = await storage.getConversationMessages(conversationId);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Send a message and get AI response
  app.post("/api/conversations/:id/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const conversationId = parseInt(req.params.id);
      const conversation = await storage.getConversation(conversationId);
      
      if (!conversation || conversation.userId !== req.user!.id) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      const result = insertMessageSchema.safeParse({
        ...req.body,
        conversationId,
      });
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid message data" });
      }
      
      // Save user message
      const userMessage = await storage.createMessage(result.data);
      
      // Get conversation history for context
      const messages = await storage.getConversationMessages(conversationId);
      
      // Prepare messages for Anthropic API
      const anthropicMessages = messages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));

      // Get AI response with extended thinking
      const anthropicResponse = await anthropic.beta.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: anthropicMessages,
        system: `You are Claude, an AI assistant created by Anthropic. You have access to web search and domain-specific knowledge to help users with detailed conversations. Be helpful, accurate, and engaging in your responses.`,
        thinking: {
          type: "enabled",
          budget_tokens: 10000
        }
      });

      const aiContent = anthropicResponse.content[0].type === 'text' 
        ? anthropicResponse.content[0].text 
        : 'Sorry, I could not generate a response.';

      // Extract thinking content if available
      const thinkingContent = (anthropicResponse as any).thinking || null;

      // Save AI response
      const aiMessage = await storage.createMessage({
        conversationId,
        role: 'assistant',
        content: aiContent,
        metadata: {
          model: 'claude-sonnet-4-20250514',
          usage: anthropicResponse.usage,
          thinking: thinkingContent,
        },
      });

      // Update conversation timestamp
      await storage.updateConversationTimestamp(conversationId);

      res.json({ userMessage, aiMessage });
    } catch (error: any) {
      console.error('Error in chat endpoint:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Delete a conversation
  app.delete("/api/conversations/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const conversationId = parseInt(req.params.id);
      const conversation = await storage.getConversation(conversationId);
      
      if (!conversation || conversation.userId !== req.user!.id) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      await storage.deleteConversation(conversationId);
      res.sendStatus(204);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Upload file to Claude Files API
  app.post("/api/files/upload", upload.single('file'), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Read the uploaded file
      const fileBuffer = await fs.readFile(req.file.path);
      
      // Upload to Claude Files API
      const uploadResponse = await (anthropic as any).files.upload({
        file: toFile(fileBuffer, req.file.originalname, { type: req.file.mimetype }),
        purpose: 'user_data'
      });

      // Clean up temporary file
      await fs.unlink(req.file.path);

      res.json({
        file_id: uploadResponse.id,
        filename: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
        upload_date: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('File upload error:', error);
      // Clean up temporary file on error
      if (req.file?.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('Error cleaning up file:', unlinkError);
        }
      }
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
