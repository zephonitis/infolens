import React, { useState, useEffect } from 'react';
import { ConversationSidebar } from './components/chat/ConversationSidebar';
import { ChatInterface } from './components/chat/ChatInterface';
import { useConversations } from './hooks/useConversations';
import { FileText } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [userId] = useState('demo-user-123'); // In production, get from auth
  const [sessionId] = useState(uuidv4());

  const {
    conversations,
    activeConversation,
    activeConversationId,
    loading,
    createNewConversation,
    updateConversation,
    selectConversation,
  } = useConversations(userId);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleNewConversation = async () => {
    await createNewConversation();
  };

  const handleConversationSelect = (conversationId: string) => {
    selectConversation(conversationId);
  };

  const handleConversationUpdate = (updatedConversation: any) => {
    updateConversation(updatedConversation);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading InfoLens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background text-foreground">
      <ConversationSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleConversationSelect}
        onNewConversation={handleNewConversation}
        darkMode={darkMode}
        onToggleDarkMode={setDarkMode}
      />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="px-4" style={{paddingTop: '16px', paddingBottom: '16px'}}>
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">InfoLens</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              {activeConversation ? activeConversation.title : 'Conversational Knowledge Assistant'}
            </p>
          </div>
        </header>

        {/* Chat Interface */}
        <div className="flex-1 overflow-hidden">
          <ChatInterface
            conversation={activeConversation}
            onConversationUpdate={handleConversationUpdate}
            userId={userId}
            sessionId={sessionId}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
