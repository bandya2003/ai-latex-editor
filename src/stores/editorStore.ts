import { create } from 'zustand';

interface EditorState {
  latexCode: string;
  originalText: string;
  documentStructure: {
    title: string;
    abstract: string;
    sections: Array<{ title: string; content: string }>;
    references: string[];
    tables: Array<{ caption: string; content: string }>;
  } | null;
  isCompiling: boolean;
  compilationError: string | null;
  pdfUrl: string | null;
  currentProject: string | null;
  setLatexCode: (code: string) => void;
  setOriginalText: (text: string) => void;
  setDocumentStructure: (structure: any) => void;
  setCompiling: (isCompiling: boolean) => void;
  setCompilationError: (error: string | null) => void;
  setPdfUrl: (url: string | null) => void;
  setCurrentProject: (project: string | null) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  latexCode: `% AI-Generated LaTeX Document
\\documentclass[conference]{IEEEtran}
\\usepackage{amsmath,amssymb,amsfonts}
\\usepackage{algorithmic}
\\usepackage{graphicx}
\\usepackage{textcomp}
\\usepackage{xcolor}

\\title{Your Document Title}
\\author{\\IEEEauthorblockN{Author Name}
\\IEEEauthorblockA{\\textit{Department} \\\\
\\textit{University} \\\\
City, Country \\\\
email@example.com}}

\\begin{document}

\\maketitle

\\begin{abstract}
Your abstract goes here. This is a brief summary of your work.
\\end{abstract}

\\section{Introduction}
Welcome to your AI-powered LaTeX editor. Upload a document or paste text to get started.

\\section{Conclusion}
This is where you conclude your work.

\\begin{thebibliography}{00}
\\bibitem{b1} Author, "Title," Journal, vol. X, no. Y, pp. Z-W, Year.
\\end{thebibliography}

\\end{document}`,
  originalText: '',
  documentStructure: null,
  isCompiling: false,
  compilationError: null,
  pdfUrl: null,
  currentProject: null,
  setLatexCode: (code) => {
    // Clean up previous PDF when code changes
    const currentState = get();
    if (currentState.pdfUrl) {
      URL.revokeObjectURL(currentState.pdfUrl);
    }
    set({ latexCode: code, pdfUrl: null, compilationError: null });
  },
  setOriginalText: (text) => set({ originalText: text }),
  setDocumentStructure: (structure) => set({ documentStructure: structure }),
  setCompiling: (isCompiling) => set({ isCompiling }),
  setCompilationError: (error) => set({ compilationError: error }),
  setPdfUrl: (url) => {
    // Clean up previous PDF URL
    const currentState = get();
    if (currentState.pdfUrl && currentState.pdfUrl !== url) {
      URL.revokeObjectURL(currentState.pdfUrl);
    }
    set({ pdfUrl: url });
  },
  setCurrentProject: (project) => set({ currentProject: project }),
}));