/**
 * ElizaService - Local pattern-matching chatbot implementation
 */
import AIService from './AIService.js';


import { getBotResponse } from '../eliza.js';

class ElizaService extends AIService {
  constructor() {
    super();
  }

  async getResponse(message, history = []) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const response = getBotResponse(message);
        resolve(response);
      }, 300);
    });
  }

  getName() {
    return 'Eliza (Local)';
  }
}

export default ElizaService;