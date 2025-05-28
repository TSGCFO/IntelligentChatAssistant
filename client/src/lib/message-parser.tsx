import CodeBlock from "@/components/chat/code-block";

export interface ParsedMessagePart {
  type: 'text' | 'code';
  content: string;
  language?: string;
}

export function parseMessageContent(content: string): ParsedMessagePart[] {
  const parts: ParsedMessagePart[] = [];
  
  // Regex to match code blocks with optional language specification
  const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before the code block
    if (match.index > lastIndex) {
      const textContent = content.slice(lastIndex, match.index);
      if (textContent.trim()) {
        parts.push({
          type: 'text',
          content: textContent
        });
      }
    }

    // Add the code block
    const language = match[1] || undefined;
    const codeContent = match[2].trim();
    
    if (codeContent) {
      parts.push({
        type: 'code',
        content: codeContent,
        language
      });
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after the last code block
  if (lastIndex < content.length) {
    const remainingText = content.slice(lastIndex);
    if (remainingText.trim()) {
      parts.push({
        type: 'text',
        content: remainingText
      });
    }
  }

  // If no code blocks were found, return the entire content as text
  if (parts.length === 0) {
    parts.push({
      type: 'text',
      content: content
    });
  }

  return parts;
}

export function renderParsedContent(parts: ParsedMessagePart[]) {
  return parts.map((part, index) => {
    if (part.type === 'code') {
      return (
        <CodeBlock
          key={index}
          code={part.content}
          language={part.language}
          className="my-3"
        />
      );
    } else {
      return (
        <div key={index} className="whitespace-pre-wrap">
          {part.content}
        </div>
      );
    }
  });
}