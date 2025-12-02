import React, { createContext, useContext, useState, useCallback } from 'react';
import { Chat, Message } from '../types/database';
import { chatService, messageService } from '../services/supabase';
import { geminiService } from '../services/gemini';
import { useAuth } from './AuthContext';

interface ChatContextType {
  chats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  loading: boolean;
  sending: boolean;
  loadChats: () => Promise<void>;
  createNewChat: () => Promise<Chat | null>;
  selectChat: (chatId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  refreshChats: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const loadChats = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await chatService.getUserChats(user.id);
      if (error) throw error;
      setChats(data || []);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createNewChat = useCallback(async (): Promise<Chat | null> => {
    if (!user) return null;

    try {
      const { data, error } = await chatService.createChat(user.id, 'New Conversation');
      if (error) throw error;
      if (data) {
        setChats(prev => [data, ...prev]);
        setCurrentChat(data);
        setMessages([]);
        return data;
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
    return null;
  }, [user]);

  const selectChat = useCallback(async (chatId: string) => {
    setLoading(true);
    try {
      const chat = chats.find(c => c.id === chatId);
      if (chat) {
        setCurrentChat(chat);
        const { data, error } = await messageService.getChatMessages(chatId);
        if (error) throw error;
        setMessages(data || []);
      }
    } catch (error) {
      console.error('Error selecting chat:', error);
    } finally {
      setLoading(false);
    }
  }, [chats]);

  const sendMessage = useCallback(async (content: string) => {
    if (!currentChat || !user || !content.trim()) return;

    setSending(true);
    try {
      // Save user message
      const { data: userMessage, error: userError } = await messageService.createMessage(
        currentChat.id,
        'user',
        content
      );
      if (userError) throw userError;
      if (userMessage) {
        setMessages(prev => [...prev, userMessage]);
      }

      // Update chat title if this is the first message
      if (messages.length === 0) {
        const title = await geminiService.generateChatTitle(content);
        await chatService.updateChatTitle(currentChat.id, title);
        setCurrentChat(prev => prev ? { ...prev, title } : null);
        setChats(prev => prev.map(c => c.id === currentChat.id ? { ...c, title } : c));
      }

      // Generate AI response
      const conversationHistory = geminiService.formatMessageHistory([
        ...messages,
        { role: 'user', content }
      ]);
      
      const aiResponse = await geminiService.generateCareerGuidance(
        content,
        conversationHistory
      );

      // Save AI message
      const { data: aiMessage, error: aiError } = await messageService.createMessage(
        currentChat.id,
        'assistant',
        aiResponse
      );
      if (aiError) throw aiError;
      if (aiMessage) {
        setMessages(prev => [...prev, aiMessage]);
      }

      // Update chat timestamp in list
      const now = new Date().toISOString();
      setChats(prev => {
        const updated = prev.map(c => 
          c.id === currentChat.id ? { ...c, updated_at: now } : c
        );
        return updated.sort((a, b) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
      });

    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  }, [currentChat, user, messages]);

  const deleteChat = useCallback(async (chatId: string) => {
    try {
      const { error } = await chatService.deleteChat(chatId);
      if (error) throw error;
      
      setChats(prev => prev.filter(c => c.id !== chatId));
      if (currentChat?.id === chatId) {
        setCurrentChat(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  }, [currentChat]);

  const refreshChats = useCallback(async () => {
    await loadChats();
  }, [loadChats]);

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChat,
        messages,
        loading,
        sending,
        loadChats,
        createNewChat,
        selectChat,
        sendMessage,
        deleteChat,
        refreshChats,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
