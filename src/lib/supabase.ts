import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  user_id: string
  title: string
  description: string | null
  latex_code: string
  original_text: string | null
  document_type: string
  status: string
  created_at: string
  updated_at: string
}

export interface AIInteraction {
  id: string
  user_id: string
  project_id: string | null
  interaction_type: string
  prompt: string
  response: string
  model: string
  tokens_used: number
  created_at: string
}