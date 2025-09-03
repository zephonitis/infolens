import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { Message } from '../../types';
import { User, Bot, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';

interface MessageBubbleProps {
  message: Message;
  isTyping?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isTyping = false }) => {
  const [showSources, setShowSources] = useState(false);
  const isUser = message.role === 'user';

  return (
    <div className={cn(
      "flex gap-3 max-w-4xl mx-auto px-4 py-6",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      <Avatar className="w-8 h-8 shrink-0">
        <AvatarFallback className={cn(
          isUser ? "bg-primary text-primary-foreground" : "bg-secondary"
        )}>
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </AvatarFallback>
      </Avatar>

      <div className={cn(
        "flex flex-col gap-2 max-w-[80%]",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "rounded-lg px-4 py-3 text-sm",
          isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted border"
        )}>
          {isTyping ? (
            <TypingIndicator />
          ) : (
            <ReactMarkdown 
              className="prose prose-sm max-w-none dark:prose-invert"
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                code: ({ children }) => (
                  <code className="bg-muted px-1 py-0.5 rounded text-xs">{children}</code>
                ),
                pre: ({ children }) => (
                  <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">{children}</pre>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="w-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSources(!showSources)}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              {showSources ? <ChevronUp className="w-3 h-3 mr-1" /> : <ChevronDown className="w-3 h-3 mr-1" />}
              {message.sources.length} source{message.sources.length !== 1 ? 's' : ''}
            </Button>

            {showSources && (
              <div className="mt-2 space-y-2">
                {message.sources.map((source, index) => (
                  <div key={source.document_id} className="bg-muted/50 border rounded-lg p-3 text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Document {index + 1}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          Score: {(source.relevance_score * 100).toFixed(1)}%
                        </span>
                        <ExternalLink className="w-3 h-3 text-muted-foreground" />
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-2 line-clamp-3">
                      {source.content}
                    </p>
                    {source.metadata && (
                      <div className="flex gap-2 flex-wrap">
                        {Object.entries(source.metadata).map(([key, value]) => (
                          <span key={key} className="bg-background px-2 py-1 rounded text-xs">
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <span className="text-xs text-muted-foreground">
          {message.timestamp.toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-current rounded-full animate-typing" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-current rounded-full animate-typing" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-current rounded-full animate-typing" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="ml-2 text-muted-foreground">Wexa co-worker is processing...</span>
    </div>
  );
};
