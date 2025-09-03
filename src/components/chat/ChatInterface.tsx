import React, { useState, useEffect, useRef } from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { Message, QueryRequest, Conversation } from '../../types';
import { apiService } from '../../services/api';
import { v4 as uuidv4 } from 'uuid';

interface ChatInterfaceProps {
  conversation?: Conversation;
  onConversationUpdate: (conversation: Conversation) => void;
  userId: string;
  sessionId: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  conversation,
  onConversationUpdate,
  userId,
  sessionId
}) => {
  const [messages, setMessages] = useState<Message[]>(conversation?.messages || []);
  const [isLoading, setIsLoading] = useState(false);
  const [typingMessage, setTypingMessage] = useState<Message | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversation) {
      setMessages(conversation.messages);
    } else {
      setMessages([]);
    }
  }, [conversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: uuidv4(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Show typing indicator
    const typingMsg: Message = {
      id: 'typing',
      content: '',
      role: 'assistant',
      timestamp: new Date(),
    };
    setTypingMessage(typingMsg);

    try {
      console.log('Sending query to Wexa co-worker:', content);
      
      const queryRequest: QueryRequest = {
        user_id: userId,
        session_id: sessionId,
        query: content,
      };

      const response = await apiService.sendQuery(queryRequest);
      console.log('Received response from Wexa co-worker:', response);

      const assistantMessage: Message = {
        id: uuidv4(),
        content: response.answer,
        role: 'assistant',
        timestamp: new Date(),
        sources: response.sources,
      };

      setTypingMessage(null);
      setMessages(prev => [...prev, assistantMessage]);

      // Update conversation
      if (conversation) {
        const updatedConversation: Conversation = {
          ...conversation,
          messages: [...conversation.messages, userMessage, assistantMessage],
          updated_at: new Date(),
        };
        onConversationUpdate(updatedConversation);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setTypingMessage(null);
      
      const errorMessage: Message = {
        id: uuidv4(),
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1">
        <div className="min-h-full">
          {messages.length === 0 && !typingMessage ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md mx-auto px-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🤖</span>
                </div>
                <h2 className="text-xl font-bold mb-2">Welcome to InfoLens</h2>
                <p className="text-muted-foreground mb-4">
                  I'm your AI co-worker powered by InfoLens. Ask me anything about your knowledge base, 
                  and I'll process your queries through our intelligent pipeline.
                </p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>💡 Try asking: "Show me ATM configuration details for 2024"</p>
                  <p>📊 Or: "What are the latest software updates?"</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {typingMessage && (
                <MessageBubble message={typingMessage} isTyping />
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={isLoading}
        placeholder={
          messages.length === 0 
            ? "Ask me anything about your knowledge base..." 
            : "Continue the conversation..."
        }
      />
    </div>
  );
};
