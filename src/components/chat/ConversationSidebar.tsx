import React from 'react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Switch } from '../ui/switch';
import { Conversation } from '../../types';
import { Plus, MessageSquare, Sun, Moon, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
  darkMode: boolean;
  onToggleDarkMode: (enabled: boolean) => void;
  className?: string;
}

export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  darkMode,
  onToggleDarkMode,
  className
}) => {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const groupedConversations = conversations.reduce((groups, conversation) => {
    const dateKey = formatDate(conversation.updated_at);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(conversation);
    return groups;
  }, {} as Record<string, Conversation[]>);

  return (
    <div className={cn("w-64 bg-muted/30 border-r flex flex-col h-full", className)}>
      {/* Conversations List */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-4 py-4">
          {Object.entries(groupedConversations).map(([dateGroup, convs]) => (
            <div key={dateGroup}>
              <h3 className="text-xs font-medium text-muted-foreground px-2 mb-2">
                {dateGroup}
              </h3>
              <div className="space-y-1">
                {convs.map((conversation) => (
                  <Button
                    key={conversation.id}
                    variant={activeConversationId === conversation.id ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start text-left h-auto p-2",
                      "hover:bg-accent/50 transition-colors"
                    )}
                    onClick={() => onSelectConversation(conversation.id)}
                  >
                    <div className="flex items-start gap-2 w-full">
                      <MessageSquare className="w-4 h-4 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {conversation.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {conversation.messages.length} message{conversation.messages.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          ))}
          
          {conversations.length === 0 && (
            <div className="text-center py-8 px-4">
              <MessageSquare className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No conversations yet. Start by asking a question!
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* New Conversation Button */}
      <div className="px-4 pb-4">
        <Button
          onClick={onNewConversation}
          className="w-full justify-start gap-2"
          variant="outline"
        >
          <Plus className="w-4 h-4" />
          New Conversation
        </Button>
      </div>

      {/* Footer */}
      <div className="px-4 py-4 border-t">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4" />
            <span className="text-sm">Dark mode</span>
            <Moon className="w-4 h-4" />
          </div>
          <Switch
            checked={darkMode}
            onCheckedChange={onToggleDarkMode}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          <span className="text-sm">Settings</span>
        </div>
      </div>
    </div>
  );
};
