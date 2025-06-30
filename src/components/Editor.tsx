import React, { useRef, useEffect } from 'react'
import MonacoEditor from '@monaco-editor/react'
import { Copy, Download, RefreshCw, HelpCircle, Save } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { useProjectStore } from '../stores/projectStore'
import { toast } from 'react-toastify'

export const Editor: React.FC = () => {
  const { isDark } = useTheme()
  const { 
    currentProject, 
    updateProject, 
    explainLatex, 
    generateLatexFromText,
    isLoading 
  } = useProjectStore()
  
  const editorRef = useRef(null)

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor
    
    // Configure LaTeX language
    monaco.languages.register({ id: 'latex' })
    monaco.languages.setMonarchTokensProvider('latex', {
      tokenizer: {
        root: [
          [/\\[a-zA-Z@]+/, 'keyword'],
          [/\\[^a-zA-Z@]/, 'keyword'],
          [/%.*$/, 'comment'],
          [/\{/, 'delimiter.bracket'],
          [/\}/, 'delimiter.bracket'],
          [/\[/, 'delimiter.square'],
          [/\]/, 'delimiter.square'],
          [/\$\$/, 'string'],
          [/\$/, 'string'],
        ]
      }
    })

    // Set theme colors
    monaco.editor.defineTheme('latex-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '#569CD6' },
        { token: 'comment', foreground: '#6A9955' },
        { token: 'string', foreground: '#CE9178' },
        { token: 'delimiter.bracket', foreground: '#FFD700' },
      ],
      colors: {
        'editor.background': '#1f2937',
        'editor.lineHighlightBackground': '#374151'
      }
    })

    monaco.editor.defineTheme('latex-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '#0000FF' },
        { token: 'comment', foreground: '#008000' },
        { token: 'string', foreground: '#A31515' },
        { token: 'delimiter.bracket', foreground: '#FF8C00' },
      ],
      colors: {
        'editor.background': '#ffffff',
        'editor.lineHighlightBackground': '#f5f5f5'
      }
    })
  }

  const handleCodeChange = (value: string | undefined) => {
    if (currentProject && value !== undefined) {
      updateProject(currentProject.id, { latex_code: value })
    }
  }

  const copyToClipboard = () => {
    if (currentProject?.latex_code) {
      navigator.clipboard.writeText(currentProject.latex_code)
      toast.success('LaTeX code copied to clipboard!')
    }
  }

  const downloadLatex = () => {
    if (currentProject?.latex_code) {
      const blob = new Blob([currentProject.latex_code], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${currentProject.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.tex`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('LaTeX file downloaded!')
    }
  }

  const handleExplainLatex = async () => {
    if (!currentProject?.latex_code) {
      toast.error('No LaTeX code to explain')
      return
    }

    try {
      const explanation = await explainLatex(currentProject.latex_code)
      toast.success('LaTeX explanation generated!')
      
      // You could show this in a modal or sidebar
      console.log('LaTeX Explanation:', explanation)
    } catch (error) {
      toast.error('Failed to explain LaTeX code')
    }
  }

  const handleRegenerateLatex = async () => {
    if (!currentProject?.original_text) {
      toast.error('No original text to regenerate from')
      return
    }

    try {
      await generateLatexFromText(currentProject.original_text)
      toast.success('LaTeX regenerated!')
    } catch (error) {
      toast.error('Failed to regenerate LaTeX')
    }
  }

  if (!currentProject) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-gray-800">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Project Selected
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Select a project from the sidebar or create a new one to start editing.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Editor Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {currentProject.title}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Last updated: {new Date(currentProject.updated_at).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExplainLatex}
            disabled={isLoading}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors disabled:opacity-50"
            title="Explain LaTeX"
          >
            <HelpCircle size={16} />
          </button>
          <button
            onClick={handleRegenerateLatex}
            disabled={isLoading || !currentProject.original_text}
            className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors disabled:opacity-50"
            title="Regenerate LaTeX"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={copyToClipboard}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
            title="Copy LaTeX"
          >
            <Copy size={16} />
          </button>
          <button
            onClick={downloadLatex}
            className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors"
            title="Download LaTeX"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1">
        <MonacoEditor
          height="100%"
          language="latex"
          theme={isDark ? 'latex-dark' : 'latex-light'}
          value={currentProject.latex_code}
          onChange={handleCodeChange}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            lineNumbers: 'on',
            renderWhitespace: 'selection',
            wordWrap: 'on',
            automaticLayout: true,
            scrollBeyondLastLine: false,
            formatOnType: true,
            formatOnPaste: true,
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
          }}
        />
      </div>
    </div>
  )
}