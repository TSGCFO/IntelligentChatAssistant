import { useState } from "react";
import { ChevronDown, ChevronRight, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ThinkingDisplayProps {
  thinking: string;
  className?: string;
}

export default function ThinkingDisplay({ thinking, className }: ThinkingDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!thinking) return null;

  return (
    <div className={cn("mb-3", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground p-2 h-auto"
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
        <Brain className="w-4 h-4" />
        <span>View thinking process</span>
      </Button>
      
      {isExpanded && (
        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Claude's Thinking Process
            </span>
          </div>
          <div className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap font-mono bg-blue-100/50 dark:bg-blue-900/20 p-3 rounded border">
            {thinking}
          </div>
        </div>
      )}
    </div>
  );
}