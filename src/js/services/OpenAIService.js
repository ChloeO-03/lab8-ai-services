/**
 * OpenAIService - OpenAI's ChatGPT AI integration
 * 
 * This service integrates with OpenAI's GPT models to provide
 * advanced AI responses using large language models.
 * 
 * API Documentation: https://platform.openai.com/docs/api-reference
 * Get API Key: https://platform.openai.com/api-keys
 * 
 * Advantages:
 * - Very powerful (GPT-4, GPT-3.5-turbo)
 * - $5 free credit for new accounts
 * - High-quality responses
 * - Context-aware (uses conversation history)
 * 
 * Disadvantages:
 * - Requires API key
 * - Internet connection required
 * - Privacy concerns (data sent to OpenAI)
 * - Free credits expire after 3 months
 * - Rate limits on free tier
 * 
 * @extends AIService
 */
import AIService from '/src/js/services/AIService.js';

class OpenAIService extends AIService {
  /**
   * Initialize the OpenAI service with API credentials
   * 
   * @param {string} apiKey - OpenAI API key (starts with 'sk-')
   * @param {string} model - Model to use (default: gpt-3.5-turbo)
   */
  constructor(apiKey, model = 'gpt-3.5-turbo') {
    super();
    
    // Store API credentials
    this.apiKey = apiKey;
    this.model = model; // gpt-3.5-turbo, gpt-4, gpt-4-turbo, etc.
    
    // OpenAI API endpoint
    this.endpoint = 'https://api.openai.com/v1/chat/completions';
    
    // Maximum retry attempts for failed requests
    this.maxRetries = 2;
  }

  /**
   * Get response from ChatGPT
   * 
   * This method builds the request with conversation history,
   * makes the API call, and extracts the response text.
   * 
   * @param {string} message - User's input message
   * @param {Array} history - Previous conversation messages for context
   * @returns {Promise<string>} ChatGPT's AI-generated response
   * @throws {Error} If API key is missing or request fails
   */
  async getResponse(message, history = []) {
    // Validate that we have an API key
    if (!this.apiKey) {
      throw new Error('OpenAI API key is required');
    }

    // Build the request messages with conversation history
    const messages = this._buildMessages(message, history);

    try {
      // Make the API request with retry logic
      const response = await this._makeRequest(messages);
      
      // Extract and return the text from the response
      return this._extractText(response);
    } catch (error) {
      // Log error for debugging
      console.error('OpenAI API error:', error);
      
      // Throw user-friendly error message
      throw new Error(`ChatGPT failed: ${error.message}`);
    }
  }

  /**
   * Build request messages array with conversation history
   * 
   * OpenAI's API expects an array of message objects with roles
   * (system, user, assistant). We include recent history to give
   * ChatGPT context about the conversation.
   * 
   * @private
   * @param {string} message - Current user message
   * @param {Array} history - Array of previous message objects
   * @returns {Array} Formatted messages array for API request
   */
  _buildMessages(message, history) {
    const messages = [];

    // Add system message to set ChatGPT's behavior
    messages.push({
      role: 'system',
      content: 'You are a helpful AI assistant in a chat application. Be concise, friendly, and helpful.'
    });

    // Include the last 10 messages for context
    // Too much history can hit token limits and increase costs
    const recentHistory = history.slice(-10);
    
    // Convert each message to OpenAI's expected format
    recentHistory.forEach(msg => {
      messages.push({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.text
      });
    });

    // Add the current user message
    messages.push({
      role: 'user',
      content: message
    });

    return messages;
  }

  /**
   * Make HTTP request to OpenAI API with retry logic
   * 
   * This method handles the actual API call, including error handling,
   * retry logic for network failures, and response validation.
   * 
   * @private
   * @param {Array} messages - Formatted message array
   * @param {number} retryCount - Current retry attempt (for recursion)
   * @returns {Promise<Object>} Parsed JSON response from API
   * @throws {Error} If request fails after all retries
   */
  async _makeRequest(messages, retryCount = 0) {
    try {
      // Make POST request to OpenAI API
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}` // OpenAI uses Bearer token
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          temperature: 0.7,        // Creativity level (0-2)
          max_tokens: 500,         // Maximum response length
          top_p: 1,                // Nucleus sampling
          frequency_penalty: 0,    // Reduce repetition
          presence_penalty: 0      // Encourage new topics
        })
      });

      // Check if request was successful
      if (!response.ok) {
        // Try to parse error details from response
        const errorData = await response.json().catch(() => ({}));
        
        // Handle specific HTTP error codes
        if (response.status === 401) {
          // Authentication failed
          throw new Error('Invalid API key. Check your OpenAI API key.');
        } else if (response.status === 429) {
          // Rate limit exceeded
          throw new Error('Rate limit exceeded. Please wait a moment or upgrade your plan.');
        } else if (response.status === 400) {
          // Bad request (malformed input)
          throw new Error('Invalid request. Please check your input.');
        } else if (response.status === 500 || response.status === 503) {
          // OpenAI server error
          throw new Error('OpenAI servers are experiencing issues. Please try again later.');
        }
        
        // Generic error with details if available
        throw new Error(`API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      // Parse and return successful response
      return await response.json();

    } catch (error) {
      // Retry logic for network failures (not API errors)
      // Only retry if we haven't exceeded max retries and error is network-related
      if (retryCount < this.maxRetries && error.message.includes('fetch')) {
        console.log(`Retrying OpenAI request... (${retryCount + 1}/${this.maxRetries})`);
        
        // Wait before retrying (exponential backoff: 1s, 2s, 3s...)
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        
        // Recursive retry
        return this._makeRequest(messages, retryCount + 1);
      }
      
      // If we've exhausted retries or it's not a network error, throw it
      throw error;
    }
  }

  /**
   * Extract text response from OpenAI API response object
   * 
   * The API response has a complex nested structure. This method
   * safely extracts the actual text while handling edge cases like
   * content filtering or empty responses.
   * 
   * @private
   * @param {Object} response - Raw API response object
   * @returns {string} Extracted response text
   * @throws {Error} If response is invalid or empty
   */
  _extractText(response) {
    try {
      // Validate response has choices array
      if (!response.choices || response.choices.length === 0) {
        throw new Error('No response generated');
      }

      // Get the first (and usually only) choice
      const choice = response.choices[0];
      
      // Check if response was filtered by content policy
      if (choice.finish_reason === 'content_filter') {
        return "I apologize, but I can't respond to that due to content policy guidelines.";
      }

      // Navigate the nested structure to get the text
      // Structure: choices[0].message.content
      const text = choice.message?.content;
      
      // Validate we got actual text
      if (!text) {
        throw new Error('Empty response from AI');
      }

      // Return trimmed text (remove leading/trailing whitespace)
      return text.trim();
      
    } catch (error) {
      // Log parsing error for debugging
      console.error('Error parsing OpenAI response:', error);
      
      // Throw user-friendly error
      throw new Error('Failed to parse AI response');
    }
  }

  /**
   * Return the display name for this service
   * 
   * @returns {string} Service name for UI display
   */
  getName() {
    // Include model name for clarity
    return `ChatGPT (${this.model})`;
  }

  /**
   * Validate API key format
   * 
   * OpenAI API keys have a specific format that starts with 'sk-'
   * This static method allows validation before creating a service instance.
   * 
   * @static
   * @param {string} key - API key to validate
   * @returns {boolean} True if key format appears valid
   */
  static isValidApiKey(key) {
    // Check key exists, has reasonable length, and correct prefix
    // OpenAI keys are typically 51+ characters and start with 'sk-'
    return key && key.length > 40 && key.startsWith('sk-');
  }

  /**
   * Get available models list
   * 
   * @static
   * @returns {Array} List of available OpenAI models
   */
  static getAvailableModels() {
    return [
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo (Fast & Cheap)', cost: 'Low' },
      { id: 'gpt-4', name: 'GPT-4 (Most Capable)', cost: 'High' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo (Fast GPT-4)', cost: 'Medium' },
      { id: 'gpt-4o', name: 'GPT-4o (Latest)', cost: 'Medium' }
    ];
  }
}

// Export for use in controller
export default OpenAIService;