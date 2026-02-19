export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Book {
  id: string;
  title: string;
  author?: string | null;
  description?: string | null;
  cover_url?: string | null;
  metadata?: Json | null;
  created_at?: string;
  updated_at?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  reading_preferences?: string | null;
  favorite_genres?: string | null;
  reading_goals?: string | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  book_id: string;
  title?: string | null;
  created_at?: string;
  updated_at?: string;
}
