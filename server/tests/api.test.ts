import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { storage } from '../storage';

// Mock the server setup for testing
const createTestApp = async () => {
  const express = require('express');
  const session = require('express-session');
  const { registerRoutes } = require('../routes');
  
  const app = express();
  
  app.use(express.json());
  app.use(session({
    secret: 'test-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
  }));
  
  await registerRoutes(app);
  return app;
};

describe('API Endpoints', () => {
  let app: any;
  let testUser: any;
  let authCookie: string[];

  beforeAll(async () => {
    // Create test app
    app = await createTestApp();
  });

  beforeEach(async () => {
    // Create test user for each test
    const testUsername = `test_user_${Date.now()}`;
    testUser = await storage.createUser({
      username: testUsername,
      password: 'test_password_123'
    });
  });

  describe('Authentication', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          username: `new_user_${Date.now()}`,
          password: 'secure_password_123'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('username');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          username: testUser.username,
          password: 'test_password_123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', testUser.id);
      expect(response.body).toHaveProperty('username', testUser.username);
      
      // Save auth cookie for subsequent tests
      authCookie = response.headers['set-cookie'];
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          username: testUser.username,
          password: 'wrong_password'
        });

      expect(response.status).toBe(401);
    });

    it('should get current user when authenticated', async () => {
      // First login
      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          username: testUser.username,
          password: 'test_password_123'
        });

      authCookie = loginResponse.headers['set-cookie'];

      // Then get user info
      const response = await request(app)
        .get('/api/user')
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', testUser.id);
      expect(response.body).toHaveProperty('username', testUser.username);
    });

    it('should logout successfully', async () => {
      // First login
      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          username: testUser.username,
          password: 'test_password_123'
        });

      authCookie = loginResponse.headers['set-cookie'];

      // Then logout
      const response = await request(app)
        .post('/api/logout')
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
    });
  });

  describe('Conversations', () => {
    beforeEach(async () => {
      // Login before each conversation test
      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          username: testUser.username,
          password: 'test_password_123'
        });
      authCookie = loginResponse.headers['set-cookie'];
    });

    it('should create a new conversation', async () => {
      const response = await request(app)
        .post('/api/conversations')
        .set('Cookie', authCookie)
        .send({
          title: 'Test Conversation'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title', 'Test Conversation');
      expect(response.body).toHaveProperty('userId', testUser.id);
    });

    it('should get user conversations', async () => {
      // Create a conversation first
      await request(app)
        .post('/api/conversations')
        .set('Cookie', authCookie)
        .send({
          title: 'Test Conversation'
        });

      const response = await request(app)
        .get('/api/conversations')
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('title', 'Test Conversation');
    });

    it('should delete a conversation', async () => {
      // Create a conversation first
      const createResponse = await request(app)
        .post('/api/conversations')
        .set('Cookie', authCookie)
        .send({
          title: 'Test Conversation to Delete'
        });

      const conversationId = createResponse.body.id;

      // Delete the conversation
      const response = await request(app)
        .delete(`/api/conversations/${conversationId}`)
        .set('Cookie', authCookie);

      expect(response.status).toBe(204);
    });

    it('should require authentication for conversation operations', async () => {
      const response = await request(app)
        .get('/api/conversations');

      expect(response.status).toBe(401);
    });
  });

  describe('Messages', () => {
    let testConversation: any;

    beforeEach(async () => {
      // Login before each message test
      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          username: testUser.username,
          password: 'test_password_123'
        });
      authCookie = loginResponse.headers['set-cookie'];

      // Create a test conversation
      const conversationResponse = await request(app)
        .post('/api/conversations')
        .set('Cookie', authCookie)
        .send({
          title: 'Test Message Conversation'
        });
      testConversation = conversationResponse.body;
    });

    it('should get messages for a conversation', async () => {
      const response = await request(app)
        .get(`/api/conversations/${testConversation.id}/messages`)
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should send a message (without AI response for testing)', async () => {
      // Mock the Anthropic API call to avoid actual API calls in tests
      const originalCreate = require('../routes').anthropic?.beta?.messages?.create;
      if (originalCreate) {
        require('../routes').anthropic.beta.messages.create = jest.fn().mockResolvedValue({
          content: [{ type: 'text', text: 'Test AI response' }],
          usage: { input_tokens: 10, output_tokens: 15 },
          thinking: 'Test thinking process'
        });
      }

      const response = await request(app)
        .post(`/api/conversations/${testConversation.id}/messages`)
        .set('Cookie', authCookie)
        .send({
          role: 'user',
          content: 'Hello, this is a test message.'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('userMessage');
      expect(response.body.userMessage).toHaveProperty('content', 'Hello, this is a test message.');
    });

    it('should validate message data', async () => {
      const response = await request(app)
        .post(`/api/conversations/${testConversation.id}/messages`)
        .set('Cookie', authCookie)
        .send({
          // Missing required fields
        });

      expect(response.status).toBe(400);
    });

    it('should require authentication for message operations', async () => {
      const response = await request(app)
        .get(`/api/conversations/${testConversation.id}/messages`);

      expect(response.status).toBe(401);
    });
  });

  describe('File Upload', () => {
    beforeEach(async () => {
      // Login before each file test
      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          username: testUser.username,
          password: 'test_password_123'
        });
      authCookie = loginResponse.headers['set-cookie'];
    });

    it('should require authentication for file upload', async () => {
      const testFileContent = 'This is a test file.';
      
      const response = await request(app)
        .post('/api/files/upload')
        .attach('file', Buffer.from(testFileContent), {
          filename: 'test.txt',
          contentType: 'text/plain'
        });

      expect(response.status).toBe(401);
    });

    it('should reject upload without file', async () => {
      const response = await request(app)
        .post('/api/files/upload')
        .set('Cookie', authCookie);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'No file uploaded');
    });

    it('should validate file types', async () => {
      const testFileContent = 'This is a test file.';
      
      const response = await request(app)
        .post('/api/files/upload')
        .set('Cookie', authCookie)
        .attach('file', Buffer.from(testFileContent), {
          filename: 'test.xyz',
          contentType: 'application/xyz'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('Security', () => {
    it('should require authentication for protected routes', async () => {
      const protectedRoutes = [
        { method: 'get', path: '/api/user' },
        { method: 'get', path: '/api/conversations' },
        { method: 'post', path: '/api/conversations' },
        { method: 'post', path: '/api/files/upload' }
      ];

      for (const route of protectedRoutes) {
        const response = await request(app)[route.method](route.path);
        expect(response.status).toBe(401);
      }
    });

    it('should validate request data format', async () => {
      // Login first
      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          username: testUser.username,
          password: 'test_password_123'
        });
      authCookie = loginResponse.headers['set-cookie'];

      // Test invalid conversation creation
      const response = await request(app)
        .post('/api/conversations')
        .set('Cookie', authCookie)
        .send({
          // Missing title
        });

      expect(response.status).toBe(400);
    });

    it('should handle database errors gracefully', async () => {
      // Test with non-existent conversation ID
      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          username: testUser.username,
          password: 'test_password_123'
        });
      authCookie = loginResponse.headers['set-cookie'];

      const response = await request(app)
        .get('/api/conversations/99999/messages')
        .set('Cookie', authCookie);

      expect(response.status).toBe(404);
    });
  });

  describe('Data Validation', () => {
    beforeEach(async () => {
      // Login before each test
      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          username: testUser.username,
          password: 'test_password_123'
        });
      authCookie = loginResponse.headers['set-cookie'];
    });

    it('should validate conversation title length', async () => {
      const longTitle = 'a'.repeat(300); // Over 255 character limit
      
      const response = await request(app)
        .post('/api/conversations')
        .set('Cookie', authCookie)
        .send({
          title: longTitle
        });

      expect(response.status).toBe(400);
    });

    it('should validate user registration data', async () => {
      // Test missing username
      let response = await request(app)
        .post('/api/register')
        .send({
          password: 'test123'
        });
      expect(response.status).toBe(400);

      // Test missing password
      response = await request(app)
        .post('/api/register')
        .send({
          username: 'testuser'
        });
      expect(response.status).toBe(400);
    });

    it('should prevent duplicate usernames', async () => {
      const username = `duplicate_test_${Date.now()}`;
      
      // First registration should succeed
      const firstResponse = await request(app)
        .post('/api/register')
        .send({
          username,
          password: 'test123'
        });
      expect(firstResponse.status).toBe(201);

      // Second registration with same username should fail
      const secondResponse = await request(app)
        .post('/api/register')
        .send({
          username,
          password: 'test456'
        });
      expect(secondResponse.status).toBe(400);
    });
  });
});