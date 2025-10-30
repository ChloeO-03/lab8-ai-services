/**
 * GeminiService - Google's Gemini AI
 */
import AIService from './AIService.js';

class GeminiService extends AIService {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
    // UPDATED: Use gemini-2.5-flash (stable version)
    this.endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
    this.maxRetries = 2;
  }

  async getResponse(message, history = []) {
    if (!this.apiKey) {
      throw new Error('Gemini API key is required');
    }

    const contents = this._buildContents(message, history);

    try {
      const response = await this._makeRequest(contents);
      return this._extractText(response);
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error(`Gemini failed: ${error.message}`);
    }
  }

  _buildContents(message, history) {
    const contents = [];

    const recentHistory = history.slice(-10);
    
    recentHistory.forEach(msg => {
      contents.push({
        role: msg.isUser ? 'user' : 'model',
        parts: [{ text: msg.text }]
      });
    });

    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    return contents;
  }

  async _makeRequest(contents, retryCount = 0) {
    try {
      const response = await fetch(`${this.endpoint}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: contents,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment.');
        } else if (response.status === 403) {
          throw new Error('Invalid API key or quota exceeded.');
        } else if (response.status === 400) {
          throw new Error('Invalid request. Please check your input.');
        }
        
        throw new Error(`API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      return await response.json();

    } catch (error) {
      if (retryCount < this.maxRetries && error.message.includes('fetch')) {
        console.log(`Retrying... (${retryCount + 1}/${this.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this._makeRequest(contents, retryCount + 1);
      }
      throw error;
    }
  }

  _extractText(response) {
    try {
      if (!response.candidates || response.candidates.length === 0) {
        throw new Error('No response generated');
      }

      const candidate = response.candidates[0];
      
      if (candidate.finishReason === 'SAFETY') {
        return "I apologize, but I can't respond to that due to safety guidelines.";
      }

      const text = candidate.content?.parts?.[0]?.text;
      
      if (!text) {
        throw new Error('Empty response from AI');
      }

      return text.trim();
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      throw new Error('Failed to parse AI response');
    }
  }

  getName() {
    return 'Gemini 2.5 Flash';
  }

  static isValidApiKey(key) {
    return key && key.length > 20 && key.startsWith('AIzaSy');
  }
}

export default GeminiService;