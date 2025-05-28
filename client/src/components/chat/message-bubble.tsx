import { format } from "date-fns";
import type { Message } from "@shared/schema";
import { Bot, User, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseMessageContent, renderParsedContent } from "@/lib/message-parser";

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

        <div
          className={cn(
            "rounded-2xl p-4 max-w-3xl message-bubble",
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
