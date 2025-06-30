import React, { useState } from 'react';
import { Eye, Download, ZoomIn, ZoomOut, RotateCcw, AlertCircle, Loader2 } from 'lucide-react';
import { useProjectStore } from '../stores/projectStore';
import { LatexCompiler } from '../services/latexCompiler';
import { toast } from 'react-toastify';

export const Preview: React.FC = () => {
  const { currentProject } = useProjectStore();
  const [zoom, setZoom] = useState(100);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [compilationError, setCompilationError] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);

  const handleCompile = async () => {
    if (!currentProject?.latex_code?.trim()) {
      toast.error('No LaTeX code to compile');
      return;
    }

    setIsCompiling(true);
    setCompilationError(null);
    
    // IMPORTANT: Clean up previous PDF URL first
    if (pdfUrl) {
      LatexCompiler.cleanupPdfUrl(pdfUrl);
      setPdfUrl(null);
    }

    try {
      toast.info('Compiling LaTeX document...');
      
      const compiler = LatexCompiler.getInstance();
      
      // Force a fresh compilation by adding a timestamp comment
      const timestampedCode = `% Compiled at ${new Date().toISOString()}\n${currentProject.latex_code}`;
      
      const result = await compiler.compileLatex(timestampedCode);

      if (result.success && result.pdfUrl) {
        setPdfUrl(result.pdfUrl);
        toast.success('Document compiled successfully!');
      } else {
        setCompilationError(result.error || 'Unknown compilation error');
        toast.error('Compilation failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setCompilationError(errorMessage);
      toast.error('Compilation failed');
    } finally {
      setIsCompiling(false);
    }
  };

  const handleDownloadPdf = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${currentProject?.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'document'}.pdf`;
      link.click();
      toast.success('PDF downloaded!');
    }
  };

  // Clean up PDF URL when component unmounts or project changes
  React.useEffect(() => {
    return () => {
      if (pdfUrl) {
        LatexCompiler.cleanupPdfUrl(pdfUrl);
      }
    };
  }, [pdfUrl]);

  // Clear PDF when project changes
  React.useEffect(() => {
    if (pdfUrl) {
      LatexCompiler.cleanupPdfUrl(pdfUrl);
      setPdfUrl(null);
    }
    setCompilationError(null);
  }, [currentProject?.id]);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Preview Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">PDF Preview</h2>
        <div className="flex items-center space-x-2">
          {pdfUrl && (
            <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded px-2 py-1">
              <button
                onClick={() => setZoom(Math.max(50, zoom - 10))}
                className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                title="Zoom Out"
              >
                <ZoomOut size={14} />
              </button>
              <span className="text-xs text-gray-600 dark:text-gray-400 min-w-[3rem] text-center">
                {zoom}%
              </span>
              <button
                onClick={() => setZoom(Math.min(200, zoom + 10))}
                className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                title="Zoom In"
              >
                <ZoomIn size={14} />
              </button>
              <button
                onClick={() => setZoom(100)}
                className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                title="Reset Zoom"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          )}
          
          {pdfUrl && (
            <button
              onClick={handleDownloadPdf}
              className="px-2 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm font-medium"
              title="Download PDF"
            >
              <Download size={14} />
            </button>
          )}
          
          <button
            onClick={handleCompile}
            disabled={isCompiling || !currentProject?.latex_code?.trim()}
            className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center space-x-1"
          >
            {isCompiling ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Compiling...</span>
              </>
            ) : (
              <span>Compile</span>
            )}
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 relative overflow-hidden">
        {compilationError ? (
          <div className="h-full flex items-center justify-center p-6">
            <div className="text-center max-w-md">
              <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Compilation Error
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                There was an error compiling your LaTeX document.
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-left">
                <pre className="text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap overflow-auto max-h-32">
                  {compilationError}
                </pre>
              </div>
              <button
                onClick={handleCompile}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : isCompiling ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto mb-4 text-blue-500 animate-spin" size={48} />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Compiling Document
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Please wait while we compile your LaTeX document...
              </p>
            </div>
          </div>
        ) : pdfUrl ? (
          <div className="h-full overflow-auto bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
            <div 
              className="bg-white shadow-lg"
              style={{ 
                transform: `scale(${zoom / 100})`, 
                transformOrigin: 'center top',
                maxWidth: '100%',
                maxHeight: '100%'
              }}
            >
              <img
                src={pdfUrl}
                alt="PDF Preview"
                className="max-w-full h-auto"
                style={{ minHeight: '600px' }}
                key={pdfUrl} // Force re-render when URL changes
              />
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Eye className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Preview Available
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Compile your LaTeX document to see the PDF preview.
              </p>
              <button
                onClick={handleCompile}
                disabled={!currentProject?.latex_code?.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Compile Document
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};