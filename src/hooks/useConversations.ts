import { useState, useEffect } from 'react';
import { Conversation } from '../types';
import { apiService } from '../services/api';
import { v4 as uuidv4 } from 'uuid';

export const useConversations = (userId: string) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  useEffect(() => {
    loadConversations();
  }, [userId]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await apiService.getConversations(userId);
      setConversations(data);
      if (data.length > 0 && !activeConversationId) {
        setActiveConversationId(data[0].id);
      }
    } catch (err) {
      setError('Failed to load conversations');
      console.error('Error loading conversations:', err);
      // For demo purposes, create a mock conversation
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const createNewConversation = async (title?: string) => {
    try {
      const newTitle = title || `New Conversation ${new Date().toLocaleString()}`;
      
      // For demo purposes, create locally without API call
      const newConversation: Conversation = {
        id: uuidv4(),
        title: newTitle,
        messages: [],
        created_at: new Date(),
        updated_at: new Date(),
      };

      setConversations(prev => [newConversation, ...prev]);
      setActiveConversationId(newConversation.id);
      
      return newConversation;
    } catch (err) {
      setError('Failed to create conversation');
      console.error('Error creating conversation:', err);
      throw err;
    }
  };

  const updateConversation = (updatedConversation: Conversation) => {
    setConversations(prev => 
      prev.map(c => 
        c.id === updatedConversation.id ? updatedConversation : c
      )
    );
  };

  const selectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
  };

  const deleteConversation = (conversationId: string) => {
    setConversations(prev => prev.filter(c => c.id !== conversationId));
    if (activeConversationId === conversationId) {
      const remaining = conversations.filter(c => c.id !== conversationId);
      setActiveConversationId(remaining.length > 0 ? remaining[0].id : undefined);
    }
  };

  return {
    conversations,
    activeConversation,
    activeConversationId,
    loading,
    error,
    createNewConversation,
    updateConversation,
    selectConversation,
    deleteConversation,
    refreshConversations: loadConversations,
  };
};
