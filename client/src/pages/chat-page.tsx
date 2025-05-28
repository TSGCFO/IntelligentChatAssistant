import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Conversation } from "@shared/schema";
import ChatSidebar from "@/components/chat/chat-sidebar";
import ChatArea from "@/components/chat/chat-area";

export default function ChatPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const { data: conversations = [], refetch: refetchConversations } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  const handleNewConversation = () => {
    setSelectedConversationId(null);
  };

  const handleSelectConversation = (conversationId: number) => {
    setSelectedConversationId(conversationId);
  };

  return (
    <div className="h-screen flex bg-background">
      <ChatSidebar
        conversations={conversations}
        selectedConversationId={selectedConversationId}
        onNewConversation={handleNewConversation}
        onSelectConversation={handleSelectConversation}
        onConversationCreated={refetchConversations}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      
      <ChatArea
        conversationId={selectedConversationId}
        onConversationCreated={(newConversationId) => {
          setSelectedConversationId(newConversationId);
          refetchConversations();
        }}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
    </div>
  );
}
