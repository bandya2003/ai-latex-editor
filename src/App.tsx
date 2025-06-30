import React, { useState, useEffect } from 'react'
import { ToastContainer } from 'react-toastify'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { Sidebar } from './components/Sidebar'
import { Editor } from './components/Editor'
import { Preview } from './components/Preview'
import { AIAssistant } from './components/AIAssistant'
import { Header } from './components/Header'
import { AuthModal } from './components/auth/AuthModal'
import { ThemeProvider } from './contexts/ThemeContext'
import { useAuthStore } from './stores/authStore'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { user } = useAuthStore()

  // Show auth modal if not authenticated
  useEffect(() => {
    if (!user) {
      setShowAuthModal(true)
    } else {
      setShowAuthModal(false)
    }
  }, [user])

  return (
    <ThemeProvider>
      <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <Header onToggleAI={() => setShowAIAssistant(!showAIAssistant)} />
        
        {user ? (
          <div className="flex-1 overflow-hidden">
            <PanelGroup direction="horizontal">
              <Panel defaultSize={25} minSize={20} maxSize={35}>
                <Sidebar />
              </Panel>
              
              <PanelResizeHandle className="w-2 bg-gray-200 dark:bg-gray-700 hover:bg-blue-300 dark:hover:bg-blue-600 transition-colors" />
              
              <Panel defaultSize={50} minSize={30}>
                <PanelGroup direction="vertical">
                  <Panel defaultSize={showAIAssistant ? 70 : 100} minSize={40}>
                    <Editor />
                  </Panel>
                  
                  {showAIAssistant && (
                    <>
                      <PanelResizeHandle className="h-2 bg-gray-200 dark:bg-gray-700 hover:bg-blue-300 dark:hover:bg-blue-600 transition-colors" />
                      <Panel defaultSize={30} minSize={20} maxSize={50}>
                        <AIAssistant />
                      </Panel>
                    </>
                  )}
                </PanelGroup>
              </Panel>
              
              <PanelResizeHandle className="w-2 bg-gray-200 dark:bg-gray-700 hover:bg-blue-300 dark:hover:bg-blue-600 transition-colors" />
              
              <Panel defaultSize={25} minSize={20} maxSize={40}>
                <Preview />
              </Panel>
            </PanelGroup>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Welcome to AI LaTeX Editor
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Sign in to start creating amazing LaTeX documents with AI assistance.
              </p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Get Started
              </button>
            </div>
          </div>
        )}

        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => !user && setShowAuthModal(false)} 
        />

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
        />
      </div>
    </ThemeProvider>
  )
}

export default App