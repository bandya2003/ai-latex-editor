import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Editor } from '../../src/components/Editor';
import { ThemeProvider } from '../../src/contexts/ThemeContext';

// Mock Monaco Editor
vi.mock('@monaco-editor/react', () => ({
  default: ({ onChange, value }: any) => (
    <textarea
      data-testid="monaco-editor"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    />
  )
}));

// Mock Zustand store
vi.mock('../../src/stores/editorStore', () => ({
  useEditorStore: () => ({
    latexCode: '\\documentclass{article}\n\\begin{document}\nHello World\n\\end{document}',
    setLatexCode: vi.fn(),
    isCompiling: false
  })
}));

const renderEditor = () => {
  return render(
    <ThemeProvider>
      <Editor />
    </ThemeProvider>
  );
};

describe('Editor Component', () => {
  it('renders editor with LaTeX code', () => {
    renderEditor();
    
    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
    expect(screen.getByDisplayValue(/\\documentclass{article}/)).toBeInTheDocument();
  });

  it('displays editor header with actions', () => {
    renderEditor();
    
    expect(screen.getByText('LaTeX Editor')).toBeInTheDocument();
    expect(screen.getByTitle('Copy LaTeX')).toBeInTheDocument();
    expect(screen.getByTitle('Download LaTeX')).toBeInTheDocument();
  });

  it('handles copy to clipboard', async () => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve())
      }
    });

    renderEditor();
    
    const copyButton = screen.getByTitle('Copy LaTeX');
    fireEvent.click(copyButton);
    
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });
  });

  it('handles download LaTeX file', () => {
    // Mock URL.createObjectURL and document.createElement
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
    
    const mockClick = vi.fn();
    const mockAnchor = {
      href: '',
      download: '',
      click: mockClick
    };
    
    vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any);

    renderEditor();
    
    const downloadButton = screen.getByTitle('Download LaTeX');
    fireEvent.click(downloadButton);
    
    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(mockClick).toHaveBeenCalled();
  });
});