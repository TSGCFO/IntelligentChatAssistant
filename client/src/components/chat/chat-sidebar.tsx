import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import type { Conversation } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Bot, 
  User, 
  Search, 
  Database, 
  Settings, 
  LogOut,
  Menu,
  X,
  MoreVertical,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatSidebarProps {
  conversations: Conversation[];
  selectedConversationId: number | null;
  onNewConversation: () => void;
  onSelectConversation: (id: number) => void;
  onConversationCreated: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function ChatSidebar({
  conversations,
  selectedConversationId,
  onNewConversation,
  onSelectConversation,
  onConversationCreated,
  isOpen,
  onToggle,
}: ChatSidebarProps) {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [toolsEnabled, setToolsEnabled] = useState({
    webSearch: true,
    knowledgeBase: true,
  });

  const deleteConversationMutation = useMutation({
    mutationFn: async (conversationId: number) => {
      await apiRequest("DELETE", `/api/conversations/${conversationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      onConversationCreated();
      toast({
        title: "Conversation deleted",
        description: "The conversation has been removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteConversation = (conversationId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteConversationMutation.mutate(conversationId);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffHours / 24;

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes < 1 ? "Just now" : `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h ago`;
    } else if (diffDays < 7) {
      return `${Math.floor(diffDays)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed lg:relative inset-y-0 left-0 z-50 w-80 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
              <h2 className="font-semibold text-lg text-sidebar-foreground">AI Chat</h2>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onNewConversation}
                className="hover:bg-sidebar-accent"
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="lg:hidden hover:bg-sidebar-accent"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* User Profile */}
          <div className="flex items-center justify-between p-3 bg-sidebar-accent rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-accent-foreground" />
              </div>
              <span className="text-sm font-medium text-sidebar-foreground">
                {user?.username}
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hover:bg-sidebar-accent">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => logoutMutation.mutate()}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Tools Section */}
        <div className="p-4 border-b border-sidebar-border">
          <h3 className="text-sm font-medium text-sidebar-foreground mb-3">AI Tools</h3>
          <div className="space-y-2">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start hover:bg-sidebar-accent",
                toolsEnabled.webSearch && "bg-sidebar-accent"
              )}
              onClick={() =>
                setToolsEnabled(prev => ({ ...prev, webSearch: !prev.webSearch }))
              }
            >
              <Search className="w-4 h-4 mr-3 text-primary" />
              <span className="text-sm">Web Search</span>
              <div
                className={cn(
                  "ml-auto w-2 h-2 rounded-full",
                  toolsEnabled.webSearch ? "bg-green-500" : "bg-gray-300"
                )}
              />
            </Button>

            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start hover:bg-sidebar-accent",
                toolsEnabled.knowledgeBase && "bg-sidebar-accent"
              )}
              onClick={() =>
                setToolsEnabled(prev => ({ ...prev, knowledgeBase: !prev.knowledgeBase }))
              }
            >
              <Database className="w-4 h-4 mr-3 text-primary" />
              <span className="text-sm">Knowledge Base</span>
              <div
                className={cn(
                  "ml-auto w-2 h-2 rounded-full",
                  toolsEnabled.knowledgeBase ? "bg-green-500" : "bg-gray-300"
                )}
              />
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start opacity-60 cursor-not-allowed"
              disabled
            >
              <Settings className="w-4 h-4 mr-3 text-gray-400" />
              <span className="text-sm">AI Agents</span>
              <span className="text-xs text-muted-foreground ml-auto">Coming Soon</span>
            </Button>
          </div>
        </div>

        {/* Conversation History */}
        <div className="flex-1 p-4">
          <h3 className="text-sm font-medium text-sidebar-foreground mb-3">
            Recent Conversations
          </h3>
          
          <ScrollArea className="flex-1">
            <div className="space-y-2">
              {conversations.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-8">
                  No conversations yet.<br />
                  Start a new chat to begin!
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={cn(
                      "group flex items-start justify-between p-3 rounded-lg transition-colors cursor-pointer hover:bg-sidebar-accent",
                      selectedConversationId === conversation.id && "bg-sidebar-accent"
                    )}
                    onClick={() => onSelectConversation(conversation.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-sidebar-foreground truncate">
                        {conversation.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(new Date(conversation.updatedAt))}
                      </p>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => handleDeleteConversation(conversation.id, e)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
}
