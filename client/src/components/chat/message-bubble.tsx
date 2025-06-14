import { useState } from "react";
import { format } from "date-fns";
import type { Message } from "@shared/schema";
import { Bot, User, Search, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { parseMessageContent, renderParsedContent } from "@/lib/message-parser";
import ThinkingDisplay from "./thinking-display";

interface MessageBubbleProps {
  message: Message;
  isUser: boolean;
  isTyping?: boolean;
}

export default function MessageBubble({
  message,
  isUser,
  isTyping,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyMessageToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content || "");
      setCopied(true);
      toast({
        title: "Message copied",
        description: "Message content has been copied to clipboard",
      });
      
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy message to clipboard",
        variant: "destructive",
      });
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 24) {
      return format(date, "h:mm a");
    } else {
      return format(date, "MMM d, h:mm a");
    }
  };

  const hasSearchMetadata =
    message.metadata &&
    typeof message.metadata === "object" &&
    "webSearch" in message.metadata;

  return (
    <div
      className={cn("flex items-start space-x-3", isUser ? "justify-end" : "")}
    >
      {!isUser && (
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-primary-foreground" />
        </div>
      )}

      <div className={cn("flex-1", isUser ? "flex justify-end" : "")}>
        {!isUser && hasSearchMetadata && (
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-3 max-w-3xl">
            <div className="flex items-center space-x-2 text-sm text-blue-700 dark:text-blue-300">
              <Search className="w-4 h-4" />
              <span>Found relevant information from web search</span>
            </div>
          </div>
        )}

        {!isUser && message.metadata && typeof message.metadata === "object" && "thinking" in message.metadata && message.metadata.thinking && (
          <ThinkingDisplay thinking={message.metadata.thinking as string} />
        )}

        <div className="relative group max-w-3xl">
          {!isTyping && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <Button
                variant="ghost"
                size="sm"
                onClick={copyMessageToClipboard}
                className="h-8 w-8 p-0 bg-background/80 hover:bg-background border border-border"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          )}

          <div
            className={cn(
              "rounded-2xl p-4 message-bubble",
              isUser
                ? "bg-primary text-primary-foreground rounded-tr-md"
                : "bg-muted text-foreground rounded-tl-md",
            )}
          >
            {isTyping ? (
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            ) : (
              <div>
                {message.content ? 
                  renderParsedContent(parseMessageContent(message.content)) : 
                  "No content available"
                }
              </div>
            )}
          </div>
        </div>

        {!isTyping && (
          <div
            className={cn(
              "flex items-center space-x-2 mt-2 text-xs text-muted-foreground",
              isUser ? "justify-end mr-11" : "",
            )}
          >
            <span>{formatTime(new Date(message.createdAt))}</span>
            <span>•</span>
            <span>{isUser ? "You" : "Claude"}</span>
            {!isUser && hasSearchMetadata && (
              <>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <Search className="w-3 h-3 text-blue-500" />
                  <span>Web search used</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-accent-foreground" />
        </div>
      )}
    </div>
  );
}