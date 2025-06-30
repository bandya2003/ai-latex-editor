import React, { useState } from 'react'
import { Send, Bot, User, BookOpen, Bug, FileText, Lightbulb, Edit3, Wand2 } from 'lucide-react'
import { useProjectStore } from '../stores/projectStore'
import { geminiService } from '../services/geminiService'
import { toast } from 'react-toastify'

interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  action?: 'edit' | 'replace' | 'insert'
  latexCode?: string
}

export const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your AI LaTeX assistant powered by Gemini. I can help you explain LaTeX code, fix compilation errors, generate content, and **directly edit your document**. How can I help you today?',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { currentProject, updateProject, explainLatex, fixLatexErrors } = useProjectStore()

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = inputValue
    setInputValue('')
    setIsLoading(true)

    try {
      const context = currentProject?.latex_code ? `Current LaTeX code:\n${currentProject.latex_code}` : undefined
      
      // Check if user wants to edit the document
      const isEditRequest = /\b(edit|modify|change|update|improve|fix|add|remove|replace)\b/i.test(currentInput)
      
      if (isEditRequest && currentProject?.latex_code) {
        const response = await geminiService.editLatexDocument(currentInput, currentProject.latex_code)
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: response.explanation,
          timestamp: new Date(),
          action: 'replace',
          latexCode: response.editedCode
        }
        
        setMessages(prev => [...prev, aiMessage])
      } else {
        const response = await geminiService.chatAssistant(currentInput, context)
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: response,
          timestamp: new Date()
        }
        
        setMessages(prev => [...prev, aiMessage])
      }
    } catch (error) {
      toast.error('Failed to get AI response')
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const applyEdit = async (latexCode: string) => {
    if (!currentProject) return
    
    try {
      await updateProject(currentProject.id, { latex_code: latexCode })
      toast.success('Document updated!')
    } catch (error) {
      toast.error('Failed to update document')
    }
  }

  const quickActions = [
    { 
      icon: BookOpen, 
      label: 'Explain Code', 
      action: () => setInputValue('Explain the current LaTeX code to me') 
    },
    { 
      icon: Bug, 
      label: 'Fix Errors', 
      action: () => setInputValue('Fix any compilation errors in my LaTeX code') 
    },
    { 
      icon: Edit3, 
      label: 'Improve Format', 
      action: () => setInputValue('Improve the formatting and structure of my document') 
    },
    { 
      icon: Wand2, 
      label: 'Add Content', 
      action: () => setInputValue('Add more content to my document sections') 
    }
  ]

  const handleQuickExplain = async () => {
    if (!currentProject?.latex_code) {
      toast.error('No LaTeX code to explain')
      return
    }

    setIsLoading(true)
    try {
      const explanation = await explainLatex(currentProject.latex_code)
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: explanation,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      toast.error('Failed to explain LaTeX code')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickImprove = async () => {
    if (!currentProject?.latex_code) {
      toast.error('No LaTeX code to improve')
      return
    }

    setIsLoading(true)
    try {
      const response = await geminiService.improveLatexDocument(currentProject.latex_code)
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: response.explanation,
        timestamp: new Date(),
        action: 'replace',
        latexCode: response.improvedCode
      }
      
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      toast.error('Failed to improve document')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      {/* AI Assistant Header */}
      <div className="flex items-center space-x-2 p-3 border-b border-gray-200 dark:border-gray-700">
        <Bot className="text-blue-600 dark:text-blue-400" size={20} />
        <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Assistant</h2>
        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
          Powered by Gemini
        </span>
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              disabled={isLoading}
              className="flex items-center space-x-2 p-2 text-xs bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
            >
              <action.icon size={14} className="text-gray-500 dark:text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">{action.label}</span>
            </button>
          ))}
        </div>
        
        {currentProject && (
          <div className="flex space-x-2 mt-2">
            <button
              onClick={handleQuickExplain}
              disabled={isLoading}
              className="flex-1 p-2 text-xs bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg transition-colors disabled:opacity-50"
            >
              Explain Current Project
            </button>
            <button
              onClick={handleQuickImprove}
              disabled={isLoading}
              className="flex-1 p-2 text-xs bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 rounded-lg transition-colors disabled:opacity-50"
            >
              Improve Document
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex items-start space-x-2 max-w-[85%] ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                message.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
              }`}>
                {message.type === 'user' ? <User size={12} /> : <Bot size={12} />}
              </div>
              <div
                className={`rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                
                {/* Show edit actions for AI messages with LaTeX code */}
                {message.type === 'ai' && message.latexCode && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => applyEdit(message.latexCode!)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                      >
                        Apply Changes
                      </button>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        This will update your document
                      </span>
                    </div>
                  </div>
                )}
                
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2 max-w-[85%]">
              <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300">
                <Bot size={12} />
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <div className="mb-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            💡 Try: "Add a conclusion section", "Fix the formatting", "Improve the abstract"
          </p>
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            disabled={isLoading}
            placeholder="Ask me to edit your document..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}