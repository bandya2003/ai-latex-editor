import React, { useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, Plus, Search, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { useProjectStore } from '../stores/projectStore'
import { useAuthStore } from '../stores/authStore'

export const Sidebar: React.FC = () => {
  const [textInput, setTextInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewProjectForm, setShowNewProjectForm] = useState(false)
  const [newProjectTitle, setNewProjectTitle] = useState('')
  
  const { 
    projects, 
    currentProject, 
    isLoading, 
    loadProjects, 
    createProject, 
    deleteProject,
    setCurrentProject, 
    generateLatexFromText 
  } = useProjectStore()
  
  const { user } = useAuthStore()

  useEffect(() => {
    if (user) {
      loadProjects()
    }
  }, [user, loadProjects])

  const handleCreateProject = async () => {
    if (!newProjectTitle.trim()) {
      toast.error('Please enter a project title')
      return
    }

    try {
      await createProject(newProjectTitle.trim())
      setNewProjectTitle('')
      setShowNewProjectForm(false)
      toast.success('Project created!')
    } catch (error) {
      toast.error('Failed to create project')
    }
  }

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(projectId)
        toast.success('Project deleted')
      } catch (error) {
        toast.error('Failed to delete project')
      }
    }
  }

  const handleGenerateLatex = async () => {
    if (!textInput.trim()) {
      toast.error('Please enter some text first')
      return
    }

    if (!currentProject) {
      toast.error('Please select or create a project first')
      return
    }

    try {
      await generateLatexFromText(textInput)
      setTextInput('')
      toast.success('LaTeX generated successfully!')
    } catch (error) {
      toast.error('Failed to generate LaTeX')
    }
  }

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file && file.type === 'text/plain') {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        setTextInput(text)
      }
      reader.readAsText(file)
    } else {
      toast.error('Please upload a text file (.txt)')
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/plain': ['.txt'] },
    maxFiles: 1,
    disabled: isLoading
  })

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Upload Section */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : isLoading
              ? 'border-gray-200 bg-gray-50 dark:bg-gray-700/50 cursor-not-allowed'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
          }`}
        >
          <input {...getInputProps()} />
          {isLoading ? (
            <Loader2 className="mx-auto mb-2 text-blue-500 animate-spin" size={20} />
          ) : (
            <Upload className="mx-auto mb-2 text-gray-400" size={20} />
          )}
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {isLoading 
              ? 'Processing...' 
              : isDragActive 
              ? 'Drop file here' 
              : 'Drop text files or click to browse'
            }
          </p>
        </div>
      </div>

      {/* Text Input Section */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Or paste your text:
        </label>
        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          disabled={isLoading}
          className="w-full h-20 p-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          placeholder="Paste your document text here..."
        />
        <button 
          onClick={handleGenerateLatex}
          disabled={isLoading || !textInput.trim() || !currentProject}
          className="w-full mt-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <span>Generate LaTeX with AI</span>
          )}
        </button>
      </div>

      {/* Projects Section */}
      <div className="flex-1 p-4 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Projects</h3>
          <button 
            onClick={() => setShowNewProjectForm(true)}
            className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <Plus size={16} />
          </button>
        </div>

        {showNewProjectForm && (
          <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <input
              type="text"
              value={newProjectTitle}
              onChange={(e) => setNewProjectTitle(e.target.value)}
              placeholder="Project title..."
              className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleCreateProject()}
              autoFocus
            />
            <div className="flex space-x-2 mt-2">
              <button
                onClick={handleCreateProject}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowNewProjectForm(false)
                  setNewProjectTitle('')
                }}
                className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        
        <div className="mb-3">
          <div className="relative">
            <Search className="absolute left-2 top-2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => setCurrentProject(project)}
              className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer group transition-colors ${
                currentProject?.id === project.id
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <FileText className="text-blue-500 flex-shrink-0" size={16} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {project.title}
                </p>
                {project.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {project.description}
                  </p>
                )}
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {new Date(project.updated_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={(e) => handleDeleteProject(project.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          
          {filteredProjects.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <FileText className="mx-auto mb-2 text-gray-400" size={32} />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {searchTerm ? 'No projects found' : 'No projects yet'}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {searchTerm ? 'Try a different search term' : 'Create your first project to get started'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}