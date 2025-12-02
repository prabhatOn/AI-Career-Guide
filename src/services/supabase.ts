import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/env';
import { Database } from '../types/database';

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

// Auth helpers
export const authService = {
  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  getSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },
};

// Chat helpers
export const chatService = {
  createChat: async (userId: string, title: string) => {
    const { data, error } = await supabase
      .from('chats')
      .insert({ user_id: userId, title })
      .select()
      .single();
    return { data, error };
  },

  getUserChats: async (userId: string) => {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    return { data, error };
  },

  updateChatTitle: async (chatId: string, title: string) => {
    const { data, error } = await supabase
      .from('chats')
      .update({ title, updated_at: new Date().toISOString() })
      .eq('id', chatId)
      .select()
      .single();
    return { data, error };
  },

  deleteChat: async (chatId: string) => {
    // Delete messages first
    await supabase.from('messages').delete().eq('chat_id', chatId);
    // Delete chat
    const { error } = await supabase.from('chats').delete().eq('id', chatId);
    return { error };
  },
};

// Message helpers
export const messageService = {
  createMessage: async (chatId: string, role: 'user' | 'assistant', content: string) => {
    const { data, error } = await supabase
      .from('messages')
      .insert({ chat_id: chatId, role, content })
      .select()
      .single();
    
    // Update chat's updated_at timestamp
    await supabase
      .from('chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chatId);
    
    return { data, error };
  },

  getChatMessages: async (chatId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });
    return { data, error };
  },

  deleteMessage: async (messageId: string) => {
    const { error } = await supabase.from('messages').delete().eq('id', messageId);
    return { error };
  },
};
