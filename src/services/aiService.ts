// AI Service for LaTeX generation and processing
export interface DocumentStructure {
  title: string;
  abstract: string;
  sections: Array<{ title: string; content: string }>;
  references: string[];
  tables: Array<{ caption: string; content: string }>;
}

export class AIService {
  private static instance: AIService;

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  // Parse document structure from text
  async parseDocumentStructure(text: string): Promise<DocumentStructure> {
    // Simulate AI parsing - in production, this would call your AI API
    await new Promise(resolve => setTimeout(resolve, 1500));

    const lines = text.split('\n').filter(line => line.trim());
    
    // Simple heuristic parsing
    const structure: DocumentStructure = {
      title: this.extractTitle(lines),
      abstract: this.extractAbstract(text),
      sections: this.extractSections(text),
      references: this.extractReferences(text),
      tables: this.extractTables(text)
    };

    return structure;
  }

  // Generate LaTeX from document structure
  async generateLatex(structure: DocumentStructure): Promise<string> {
    // Simulate AI LaTeX generation
    await new Promise(resolve => setTimeout(resolve, 2000));

    let latex = `\\documentclass[conference]{IEEEtran}
\\usepackage{amsmath,amssymb,amsfonts}
\\usepackage{algorithmic}
\\usepackage{graphicx}
\\usepackage{textcomp}
\\usepackage{xcolor}
\\usepackage{cite}

\\title{${structure.title || 'Document Title'}}
\\author{\\IEEEauthorblockN{Author Name}
\\IEEEauthorblockA{\\textit{Department} \\\\
\\textit{University} \\\\
City, Country \\\\
email@example.com}}

\\begin{document}

\\maketitle

`;

    // Add abstract if present
    if (structure.abstract) {
      latex += `\\begin{abstract}
${structure.abstract}
\\end{abstract}

`;
    }

    // Add sections
    structure.sections.forEach(section => {
      latex += `\\section{${section.title}}
${section.content}

`;
    });

    // Add references if present
    if (structure.references.length > 0) {
      latex += `\\begin{thebibliography}{${structure.references.length.toString().padStart(2, '0')}}
`;
      structure.references.forEach((ref, index) => {
        latex += `\\bibitem{b${index + 1}} ${ref}
`;
      });
      latex += `\\end{thebibliography}

`;
    }

    latex += `\\end{document}`;

    return latex;
  }

  // Generate LaTeX directly from text (simplified approach)
  async generateLatexFromText(text: string): Promise<string> {
    const structure = await this.parseDocumentStructure(text);
    return this.generateLatex(structure);
  }

  private extractTitle(lines: string[]): string {
    // Look for the first non-empty line as potential title
    const firstLine = lines[0]?.trim();
    if (firstLine && firstLine.length < 100 && !firstLine.includes('.')) {
      return firstLine;
    }
    return 'Document Title';
  }

  private extractAbstract(text: string): string {
    const abstractMatch = text.match(/(?:abstract|summary)[\s\n]*:?\s*([^.]+(?:\.[^.]*){0,3}\.)/i);
    return abstractMatch ? abstractMatch[1].trim() : '';
  }

  private extractSections(text: string): Array<{ title: string; content: string }> {
    const sections: Array<{ title: string; content: string }> = [];
    
    // Simple section detection based on common patterns
    const sectionPatterns = [
      /(?:^|\n)(introduction|background|methodology|methods|results|discussion|conclusion|related work)[\s\n]*:?\s*([^]*?)(?=(?:^|\n)(?:introduction|background|methodology|methods|results|discussion|conclusion|related work|references|bibliography)|\n\n|$)/gi
    ];

    sectionPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const title = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
        const content = match[2].trim().substring(0, 500) + (match[2].length > 500 ? '...' : '');
        if (content.length > 20) {
          sections.push({ title, content });
        }
      }
    });

    // If no sections found, create a generic introduction
    if (sections.length === 0) {
      const firstParagraph = text.split('\n\n')[0] || text.substring(0, 300);
      sections.push({
        title: 'Introduction',
        content: firstParagraph
      });
    }

    return sections;
  }

  private extractReferences(text: string): string[] {
    const references: string[] = [];
    
    // Look for reference patterns
    const refPatterns = [
      /(?:references|bibliography)[\s\n]*:?\s*([^]*?)$/i,
      /\[?\d+\]?\s*([A-Z][^.]*\.[^.]*\.[^.]*\.)/g
    ];

    refPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const cleaned = match.replace(/^\[?\d+\]?\s*/, '').trim();
          if (cleaned.length > 20 && !references.includes(cleaned)) {
            references.push(cleaned);
          }
        });
      }
    });

    return references.slice(0, 10); // Limit to 10 references
  }

  private extractTables(text: string): Array<{ caption: string; content: string }> {
    const tables: Array<{ caption: string; content: string }> = [];
    
    // Simple table detection (this would be more sophisticated in production)
    const tablePattern = /table\s+\d+[:\s]*([^]*?)(?=\n\n|table\s+\d+|$)/gi;
    let match;
    
    while ((match = tablePattern.exec(text)) !== null) {
      tables.push({
        caption: `Table ${tables.length + 1}`,
        content: match[1].trim()
      });
    }

    return tables;
  }
}