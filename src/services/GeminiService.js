/**
 * GeminiService - Google's Gemini AI integration
 * 
 * This service integrates with Google's Gemini Pro API to provide
 * advanced AI responses using large language models.
 * 
 * API Documentation: https://ai.google.dev/docs
 * Get API Key: https://makersuite.google.com/app/apikey
 * @extends AIService
 */

import AIService from "./AIService.js";

class GeminiService extends AIService {
    /**
   * Initialize the Gemini service with API credentials
   * 
   * @param {string} apiKey - Google Gemini API key (starts with 'AIzaSy')
   */

    constructor (apiKey) {
        super(); // Call parent constructor

        // Store API credentials
        this.apiKey = apiKey;

        //Gemini API endpoint for text generation
        this.endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

        // Maximum retry attempts for failed requests
        this.maxRetries = 2; 
    }
    /**
   * Get response from Gemini AI
   * 
   * This method builds the request with conversation history,
   * makes the API call, and extracts the response text.
   * 
   * @param {string} message - User's input message
   * @param {Array} history - Previous conversation messages for context
   * @returns {Promise<string>} Gemini's AI-generated response
   * @throws {Error} If API key is missing or request fails
   */

    async getResponse (message, history = []) {
        // Validate that we have an API key
        if(!this.apiKey) {
            throw new Error ('Gemini API key is required');
        }
        // Build the request payload with conversation history
        const contents = this._buildContents(message,history);
        try {
            const response = await this._makeRequest(contents);
            // Extract and return the text from the response
            return this._extractText(response);
        } catch (error) {
            // Log error for debugging
            console.error('Gemini API error:', error);

            throw new Error(`Gemini failed: ${error.message}`);
        }  
    }
    /**
   * Build request contents array with conversation history
   * 
   * The Gemini API expects an array of message objects with roles
   * (user or model) and content. We include recent history to give
   * the AI context about the conversation.
   * 
   * @private
   * @param {string} message - Current user message
   * @param {Array} history - Array of previous message objects
   * @returns {Array} Formatted contents array for API request
   */

    _buildContents(message,history) {
        const contents = [];
        // Include the last 10 messages for context
        const recentHistory = history.slice(-10);

        // Convert each message to Gemini's expected format
        recentHistory.forEach(msg => {
            contents.push({
                role: msg.isUser ? 'user': 'model', // 'model' is Gemini's term for AI responses
                parts: [{ text: msg.text}]
            });
        });

        // Add the current user message
        contents.psu ({
            role: 'user',
            parts: [{ text:message}]
        });
        return contents;
    }
    
    /**
   * Extract text response from Gemini API response object
   * 
   * The API response has a complex nested structure. This method
   * safely extracts the actual text while handling edge cases like
   * safety blocks or empty responses.
   * 
   * @private
   * @param {Object} response - Raw API response object
   * @returns {string} Extracted response text
   * @throws {Error} If response is invalid or empty
   */

    _extractText(response) {
        try {
            // Validate response has candidates array
            if(!response.candidates || response.candidates.length === 0) {
                throw new Error('No response generated');
            }
            // Get the first (and usually only) candidate
            const candidate = response.candidates[0];

            // Check if response was blocked by safety filters
            if(candidate.finishReason === 'SAFETY') {
                return "I apologize, but I can't respond to that due to safety guidelines.";
            }
            // Navigate the nested structure to get the text
            const text = candidate.content?.parts?.[0]?.text;

            // Validate we got the actual text
            if(!text) {
                throw new Error ('Empty response from AI');
            }
            return text.trim();
        } catch (error) {
            // Log parsing error for debugging
            console.error('Error arsing Gemini response:', error);

            throw new Error('Failed to parse AI response');
        }
    }
    /**
   * Return the display name for this service
   * 
   * @returns {string} Service name for UI display
   */
  getName() {
    return 'Gemini Pro';
  }
  /**
   * Validate API key format
   * 
   * Gemini API keys have a specific format that starts with 'AIzaSy'
   * This static method allows validation before creating a service instance.
   * 
   * @static
   * @param {string} key - API key to validate
   * @returns {boolean} True if key format appears valid
   */

  static isValidApiKey(key) {
    // Check key exists, has reasonable length, adn correct prefix
    return key && key.length > 20 && key.startsWith('AIzaSy');
  }
}

export default GeminiService;