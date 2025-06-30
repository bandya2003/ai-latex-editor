import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  created_at: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
  
  // Actions
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,

      signIn: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          })

          if (error) throw error

          if (data.user) {
            // Get user profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single()

            set({ 
              user: {
                id: data.user.id,
                email: data.user.email!,
                name: profile?.full_name || data.user.email!,
                avatar: profile?.avatar_url || undefined,
                created_at: data.user.created_at
              }
            })
          }
        } catch (error: any) {
          set({ error: error.message })
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      signUp: async (email: string, password: string, fullName: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName
              }
            }
          })

          if (error) throw error

          if (data.user) {
            set({ 
              user: {
                id: data.user.id,
                email: data.user.email!,
                name: fullName,
                avatar: undefined,
                created_at: data.user.created_at
              }
            })
          }
        } catch (error: any) {
          set({ error: error.message })
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      signOut: async () => {
        set({ isLoading: true })
        
        try {
          const { error } = await supabase.auth.signOut()
          if (error) throw error
          
          set({ user: null })
        } catch (error: any) {
          set({ error: error.message })
        } finally {
          set({ isLoading: false })
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user })
    }
  )
)