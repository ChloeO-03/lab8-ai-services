/**
 * ElizaService - Local pattern-matching chatbot implementation
 * 
 * This service wraps the Eliza pattern-matching logic in the AIService interface.
 * It provides a consistent API for the controller to interact with.
 * @extends AIService
 */
import AIService from "./AIService.js";
import {getBotResponse} from '../eliza.js';

class ElizaService extends AIService {
    /**
   * Initialize the Eliza service
   * No configuration needed for local service
   */

    constructor() {
        super(); // Call parent constructor
    }
    /**
   * Get response from Eliza pattern-matching algorithm
   * 
   * Note: Eliza doesn't use conversation history, but we accept it
   * as a parameter to maintain consistency with the AIService interface
   * 
   * @param {string} message - User's input message
   * @param {Array} history - Conversation history (not used by Eliza)
   * @returns {Promise<string>} Eliza's pattern-matched response
   */

    async getResponse(message,history = []) {
        return new Promise((resolve) => {
            // Add delay to simulate thinking
            setTimeout(() => {
                // get response from the Eliza pattern matching engine
                const response = getBotResponse(message);
                resolve(message);
            }, 300);
        });
    }
    /**
   * Return the display name for this service
   * 
   * @returns {string} Service name for UI display
   */
  getName() {
    return 'Eliza (Local)';

    }
}

export default ElizaService;
