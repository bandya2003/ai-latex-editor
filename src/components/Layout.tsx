import React, { useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Sidebar } from './Sidebar';
import { Editor } from './Editor';
import { Preview } from './Preview';
import { AIAssistant } from './AIAssistant';
import { Header } from './Header';

export const Layout: React.FC = () => {
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header onToggleAI={() => setShowAIAssistant(!showAIAssistant)} />
      
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
    </div>
  );
};