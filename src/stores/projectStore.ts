import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { geminiService } from '../services/geminiService'
import type { Project, AIInteraction } from '../lib/supabase'

interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  isLoading: boolean
  error: string | null
  
  // Actions
  loadProjects: () => Promise<void>
  createProject: (title: string, description?: string) => Promise<Project>
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  setCurrentProject: (project: Project | null) => void
  generateLatexFromText: (text: string) => Promise<void>
  explainLatex: (latexCode: string) => Promise<string>
  fixLatexErrors: (latexCode: string, errorMessage: string) => Promise<string>
  logAIInteraction: (type: string, prompt: string, response: string, projectId?: string) => Promise<void>
  clearError: () => void
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,

  loadProjects: async () => {
    set({ isLoading: true, error: null })
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) throw error
      
      set({ projects: data || [] })
    } catch (error: any) {
      set({ error: error.message })
    } finally {
      set({ isLoading: false })
    }
  },

  createProject: async (title: string, description?: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('projects')
        .insert({
          title,
          description,
          user_id: user.id,
          latex_code: `\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}
\\usepackage{graphicx}

\\title{${title}}
\\author{Your Name}
\\date{\\today}

\\begin{document}

\\maketitle

\\section{Introduction}
Welcome to your new LaTeX document.

\\end{document}`
        })
        .select()
        .single()

      if (error) throw error
      
      const newProject = data as Project
      set(state => ({ 
        projects: [newProject, ...state.projects],
        currentProject: newProject
      }))
      
      return newProject
    } catch (error: any) {
      set({ error: error.message })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  updateProject: async (id: string, updates: Partial<Project>) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      const updatedProject = data as Project
      set(state => ({
        projects: state.projects.map(p => p.id === id ? updatedProject : p),
        currentProject: state.currentProject?.id === id ? updatedProject : state.currentProject
      }))
    } catch (error: any) {
      set({ error: error.message })
      throw error
    }
  },

  deleteProject: async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      set(state => ({
        projects: state.projects.filter(p => p.id !== id),
        currentProject: state.currentProject?.id === id ? null : state.currentProject
      }))
    } catch (error: any) {
      set({ error: error.message })
      throw error
    }
  },

  setCurrentProject: (project: Project | null) => {
    set({ currentProject: project })
  },

  generateLatexFromText: async (text: string) => {
    const { currentProject } = get()
    if (!currentProject) return

    set({ isLoading: true, error: null })
    
    try {
      const latexCode = await geminiService.generateLatexFromText(text)
      
      await get().updateProject(currentProject.id, {
        latex_code: latexCode,
        original_text: text
      })

      await get().logAIInteraction('generate', text, latexCode, currentProject.id)
    } catch (error: any) {
      set({ error: error.message })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  explainLatex: async (latexCode: string) => {
    const { currentProject } = get()
    
    try {
      const explanation = await geminiService.explainLatexCode(latexCode)
      
      await get().logAIInteraction('explain', latexCode, explanation, currentProject?.id)
      
      return explanation
    } catch (error: any) {
      set({ error: error.message })
      throw error
    }
  },

  fixLatexErrors: async (latexCode: string, errorMessage: string) => {
    const { currentProject } = get()
    
    try {
      const fixedCode = await geminiService.fixLatexErrors(latexCode, errorMessage)
      
      await get().logAIInteraction('fix_errors', `${latexCode}\n\nError: ${errorMessage}`, fixedCode, currentProject?.id)
      
      return fixedCode
    } catch (error: any) {
      set({ error: error.message })
      throw error
    }
  },

  logAIInteraction: async (type: string, prompt: string, response: string, projectId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase
        .from('ai_interactions')
        .insert({
          user_id: user.id,
          project_id: projectId,
          interaction_type: type,
          prompt: prompt.substring(0, 1000), // Limit prompt length
          response: response.substring(0, 2000), // Limit response length
          model: 'gemini-pro',
          tokens_used: Math.ceil((prompt.length + response.length) / 4) // Rough token estimate
        })
    } catch (error) {
      console.error('Error logging AI interaction:', error)
    }
  },

  clearError: () => set({ error: null })
}))