/**
 * AIService - Base interface for all AI services
 * Defines the contract that all AI services must implement
 */
class AIService {
    /**
   * Get AI response for a message
   * @param {string} message - User's message
   * @param {Array} history - Conversation history (optional)
   * @returns {Promise<string>} AI response
   */

    async getResponse(message, history = []) {
        // This is an abstract method - subclasses must override it
        throw new Error('getResponse() must be implemented by subclass');
    }

    /**
   * Get the name of this service
   * @returns {string} Service name
   */
  getName() {
    return 'Unknown Service';
  }
}

// Export for use in other modules
export default AIService;

