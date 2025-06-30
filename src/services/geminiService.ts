import { GoogleGenerativeAI } from '@google/generative-ai'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

if (!API_KEY) {
  console.error('VITE_GEMINI_API_KEY not found in environment variables')
  throw new Error('Missing Gemini API key. Please add VITE_GEMINI_API_KEY to your .env file')
}

const genAI = new GoogleGenerativeAI(API_KEY)

export class GeminiService {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  async generateLatexFromText(text: string): Promise<string> {
    const prompt = `
Convert the following text into a professional LaTeX document. 
Create a complete, compilable LaTeX document with:
- Appropriate document class (article, report, or book)
- Necessary packages (amsmath, graphicx, etc.)
- Proper structure (title, sections, etc.)
- Professional formatting
- Clean, readable code

Text to convert:
${text}

Return ONLY the LaTeX code, no explanations or markdown formatting:
`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const latexCode = response.text()
      
      // Clean up the response to ensure it's pure LaTeX
      return latexCode.replace(/```latex\n?/g, '').replace(/```\n?/g, '').trim()
    } catch (error) {
      console.error('Gemini API error:', error)
      throw new Error('Failed to generate LaTeX from text. Please check your API key and try again.')
    }
  }

  async explainLatexCode(latexCode: string): Promise<string> {
    const prompt = `
Explain this LaTeX code in simple, clear terms for someone learning LaTeX:

${latexCode}

Please provide:
1. What this code does overall
2. Key commands and their purposes
3. Document structure explanation
4. Any suggestions for improvement

Keep the explanation beginner-friendly and well-structured:
`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Gemini API error:', error)
      throw new Error('Failed to explain LaTeX code. Please try again.')
    }
  }

  async fixLatexErrors(latexCode: string, errorMessage: string): Promise<string> {
    const prompt = `
Fix the errors in this LaTeX code:

LaTeX Code:
${latexCode}

Error Message:
${errorMessage}

Please:
1. Identify the specific errors
2. Provide the corrected LaTeX code
3. Explain what was wrong and how you fixed it

Return the corrected code and explanation:
`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Gemini API error:', error)
      throw new Error('Failed to fix LaTeX errors. Please try again.')
    }
  }

  async editLatexDocument(instruction: string, currentCode: string): Promise<{ editedCode: string; explanation: string }> {
    const prompt = `
You are a LaTeX editing assistant. The user wants to modify their LaTeX document.

Current LaTeX code:
${currentCode}

User instruction: ${instruction}

Please:
1. Make the requested changes to the LaTeX code
2. Ensure the code remains valid and compilable
3. Preserve the overall structure unless specifically asked to change it
4. Return the modified code and explain what you changed

Format your response as:
EXPLANATION: [Brief explanation of what you changed]

EDITED_CODE:
[The complete modified LaTeX code]
`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      // Parse the response to extract explanation and code
      const explanationMatch = text.match(/EXPLANATION:\s*(.*?)(?=EDITED_CODE:|$)/s)
      const codeMatch = text.match(/EDITED_CODE:\s*([\s\S]*?)$/s)
      
      const explanation = explanationMatch ? explanationMatch[1].trim() : 'I made the requested changes to your document.'
      const editedCode = codeMatch ? codeMatch[1].trim().replace(/```latex\n?/g, '').replace(/```\n?/g, '') : currentCode
      
      return { editedCode, explanation }
    } catch (error) {
      console.error('Gemini API error:', error)
      throw new Error('Failed to edit LaTeX document. Please try again.')
    }
  }

  async improveLatexDocument(currentCode: string): Promise<{ improvedCode: string; explanation: string }> {
    const prompt = `
Improve this LaTeX document by enhancing its formatting, structure, and professional appearance:

Current LaTeX code:
${currentCode}

Please improve:
1. Document structure and organization
2. Typography and formatting
3. Package usage and optimization
4. Code readability and comments
5. Professional appearance

Keep the content the same but make it look more professional.

Format your response as:
EXPLANATION: [Brief explanation of improvements made]

IMPROVED_CODE:
[The complete improved LaTeX code]
`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      // Parse the response to extract explanation and code
      const explanationMatch = text.match(/EXPLANATION:\s*(.*?)(?=IMPROVED_CODE:|$)/s)
      const codeMatch = text.match(/IMPROVED_CODE:\s*([\s\S]*?)$/s)
      
      const explanation = explanationMatch ? explanationMatch[1].trim() : 'I improved the formatting and structure of your document.'
      const improvedCode = codeMatch ? codeMatch[1].trim().replace(/```latex\n?/g, '').replace(/```\n?/g, '') : currentCode
      
      return { improvedCode, explanation }
    } catch (error) {
      console.error('Gemini API error:', error)
      throw new Error('Failed to improve LaTeX document. Please try again.')
    }
  }

  async chatAssistant(message: string, context?: string): Promise<string> {
    const prompt = `
You are a helpful LaTeX assistant. Answer this question about LaTeX clearly and concisely:

${context ? `Current LaTeX context:\n${context}\n\n` : ''}

User question: ${message}

Provide a helpful, accurate response about LaTeX. If the question is about the current code, reference it specifically. If the user wants to edit or modify their document, let them know you can help with that too:
`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Gemini API error:', error)
      throw new Error('Failed to get AI response. Please try again.')
    }
  }

  // Test the API connection
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.model.generateContent('Say "Hello" if you can read this.')
      const response = await result.response
      return response.text().toLowerCase().includes('hello')
    } catch (error) {
      console.error('Gemini connection test failed:', error)
      return false
    }
  }
}

export const geminiService = new GeminiService()

// Test the connection on initialization
geminiService.testConnection().then(success => {
  if (success) {
    console.log('✅ Gemini API connected successfully')
  } else {
    console.error('❌ Gemini API connection failed')
  }
}).catch(error => {
  console.error('❌ Gemini API test error:', error)
})