import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import type { Message } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import MessageBubble from "./message-bubble";
import {
  Menu,
  Send,
  Paperclip,
  Download,
  Trash2,
  Search,
  Database,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatAreaProps {
  conversationId: number | null;
  onConversationCreated: (conversationId: number) => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export default function ChatArea({
  conversationId,
  onConversationCreated,
  isSidebarOpen,
  onToggleSidebar,
}: ChatAreaProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], refetch: refetchMessages } = useQuery<Message[]>({
    queryKey: ["/api/conversations", conversationId, "messages"],
    enabled: !!conversationId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { conversationId?: number; message: string }) => {
      let targetConversationId = data.conversationId;

      // Create a new conversation if none exists
      if (!targetConversationId) {
        const conversationResponse = await apiRequest("POST", "/api/conversations", {
          title: data.message.slice(0, 50) + (data.message.length > 50 ? "..." : ""),
        });
        const newConversation = await conversationResponse.json();
        targetConversationId = newConversation.id;
        onConversationCreated(targetConversationId);
      }

      // Send the message
      const response = await apiRequest("POST", `/api/conversations/${targetConversationId}/messages`, {
        role: "user",
        content: data.message,
      });

      return response.json();
    },
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      if (conversationId) {
        refetchMessages();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsTyping(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage || sendMessageMutation.isPending) return;

    sendMessageMutation.mutate({
      conversationId: conversationId || undefined,
      message: trimmedMessage,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const autoResizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    autoResizeTextarea();
  }, [message]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className="lg:hidden"
            >
              <Menu className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-semibold text-foreground">
                {conversationId ? "Conversation" : "New Conversation"}
              </h1>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                  Claude Online
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 chat-messages">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && !conversationId && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Welcome to AI Chat
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                I'm Claude, your AI assistant powered by Anthropic. I have access to web search and domain-specific knowledge to help you with detailed conversations. What would you like to explore today?
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isUser={msg.role === "user"}
            />
          ))}

          {isTyping && (
            <MessageBubble
              message={{
                id: -1,
                conversationId: conversationId || 0,
                role: "assistant",
                content: "",
                createdAt: new Date(),
                metadata: null,
              }}
              isUser={false}
              isTyping={true}
            />
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-background">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-end space-x-3">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  placeholder="Ask me anything... I can search the web and access domain-specific knowledge."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="min-h-[50px] max-h-32 pr-12 resize-none auto-resize"
                  rows={1}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-3 bottom-3"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
              </div>

              <Button
                type="submit"
                disabled={!message.trim() || sendMessageMutation.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {/* Tool Status Indicators */}
            <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <Search className="w-3 h-3" />
                <span>Web Search</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <Database className="w-3 h-3" />
                <span>Knowledge Base</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-400">
                <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                <Settings className="w-3 h-3" />
                <span>AI Agents (Coming Soon)</span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
