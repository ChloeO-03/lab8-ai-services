/**
 * ChatController - Coordinates between Model, View, and AI Services
 * NEW: Uses service layer pattern for swappable AI providers
 * Supports: Eliza (Local), Gemini Pro, and ChatGPT (OpenAI)
 */
import ChatModel from './model.js';
import ChatView from './view.js';
import ElizaService from './services/ElizaService.js';
import GeminiService from './services/GeminiService.js';
import OpenAIService from './services/OpenAIService.js';

class ChatController {
  constructor() {
    this.model = new ChatModel('eliza-chat-messages');
    this.view = new ChatView();
    
    // Service layer - start with Eliza
    this.currentService = new ElizaService();
    
    // Store API keys for different providers
    this.geminiApiKey = null;
    this.openaiApiKey = null;
    
    this._initialize();
  }

  /**
   * Initialize the application
   * @private
   */
  _initialize() {
    console.log('Controller: Starting initialization...');
    
    // CRITICAL: Bind ALL View event handlers to Controller methods FIRST
    // This must happen BEFORE bindEvents() is called
    this.view.onMessageSubmit = this.handleSendMessage.bind(this);
    this.view.onMessageEdit = this.handleEditMessage.bind(this);
    this.view.onMessageDelete = this.handleDeleteMessage.bind(this);
    this.view.onClearAll = this.handleClearAll.bind(this);
    this.view.onExport = this.handleExport.bind(this);
    this.view.onImport = this.handleImport.bind(this);
    this.view.onProviderChange = this.handleProviderChange.bind(this);
    this.view.onApiKeySubmit = this.handleApiKeySubmit.bind(this);

    console.log('Controller: Handlers bound to view');

    // Activate event listeners in the View
    this.view.bindEvents();
    
    console.log('Controller: View events bound');

    // Subscribe to Model changes (Observer pattern)
    this.model.subscribe((messages) => {
      this.view.renderMessages(messages);
    });
    
    console.log('Controller: Subscribed to model changes');

    // Load saved API keys from localStorage
    this._loadSavedApiKeys();

    // Initial render
    this._loadInitialMessages();

    console.log('ChatController initialized with service layer');
  }

  /**
   * Load saved API keys from localStorage
   * @private
   */
  _loadSavedApiKeys() {
    try {
      // Load Gemini API key
      const savedGeminiKey = localStorage.getItem('gemini_api_key');
      if (savedGeminiKey) {
        this.geminiApiKey = savedGeminiKey;
        console.log('Gemini API key loaded from storage');
      }
      
      // Load OpenAI API key
      const savedOpenAIKey = localStorage.getItem('openai_api_key');
      if (savedOpenAIKey) {
        this.openaiApiKey = savedOpenAIKey;
        console.log('OpenAI API key loaded from storage');
      }
      
      // Update UI to show which keys are available
      this.view.setApiKeyStatus(true);
      
    } catch (error) {
      console.warn('Could not load saved API keys:', error);
    }
  }

  /**
   * Load and display initial messages
   * @private
   */
  _loadInitialMessages() {
    try {
      this.view.showLoading();
      const messages = this.model.getAll();
      this.view.renderMessages(messages);
    } catch (error) {
      console.error('Error loading messages:', error);
      this.view.showError('Failed to load messages');
    }
  }

  /**
   * Handle AI provider change (Eliza vs Gemini vs OpenAI)
   * @param {string} provider - Provider name ('eliza', 'gemini', or 'openai')
   */
  handleProviderChange(provider) {
    console.log('Switching to provider:', provider);

    if (provider === 'eliza') {
      // Switch to local Eliza service
      this.currentService = new ElizaService();
      this.view.showProviderStatus('Using Eliza (Local)', 'success');
      this.view.hideApiKeyInput();
      
    } else if (provider === 'gemini') {
      // Check if we have Gemini API key saved
      if (this.geminiApiKey) {
        this.currentService = new GeminiService(this.geminiApiKey);
        this.view.showProviderStatus('Using Gemini 2.5 Flash', 'success');
        this.view.hideApiKeyInput();
      } else {
        // No key - prompt user to enter one
        this.view.showApiKeyInput();
        this.view.showProviderStatus('Gemini API key required (starts with AIzaSy)', 'warning');
        // Keep using Eliza until key is provided
        this.currentService = new ElizaService();
      }
      
    } else if (provider === 'openai') {
      // Check if we have OpenAI API key saved
      if (this.openaiApiKey) {
        this.currentService = new OpenAIService(this.openaiApiKey, 'gpt-3.5-turbo');
        this.view.showProviderStatus('Using ChatGPT (GPT-3.5 Turbo)', 'success');
        this.view.hideApiKeyInput();
      } else {
        // No key - prompt user to enter one
        this.view.showApiKeyInput();
        this.view.showProviderStatus('OpenAI API key required (starts with sk-)', 'warning');
        // Keep using Eliza until key is provided
        this.currentService = new ElizaService();
      }
    }
  }

  /**
   * Handle API key submission
   * Validates and saves API key based on current provider
   * @param {string} apiKey - User's API key
   */
  handleApiKeySubmit(apiKey) {
    // Get current provider from dropdown
    const currentProvider = this.view.providerSelect.value;
    
    console.log('Submitting API key for provider:', currentProvider);
    
    if (currentProvider === 'gemini') {
      // Validate Gemini key format
      if (!GeminiService.isValidApiKey(apiKey)) {
        this.view.showError('Invalid Gemini API key format. Should start with "AIzaSy"');
        return;
      }
      
      // Save Gemini key
      this.geminiApiKey = apiKey;
      try {
        localStorage.setItem('gemini_api_key', apiKey);
      } catch (error) {
        console.warn('Could not save Gemini API key:', error);
      }
      
      // Activate Gemini service
      this.currentService = new GeminiService(this.geminiApiKey);
      this.view.showProviderStatus('Gemini 2.5 Flash activated!', 'success');
      
    } else if (currentProvider === 'openai') {
      // Validate OpenAI key format
      if (!OpenAIService.isValidApiKey(apiKey)) {
        this.view.showError('Invalid OpenAI API key format. Should start with "sk-"');
        return;
      }
      
      // Save OpenAI key
      this.openaiApiKey = apiKey;
      try {
        localStorage.setItem('openai_api_key', apiKey);
      } catch (error) {
        console.warn('Could not save OpenAI API key:', error);
      }
      
      // Activate OpenAI service with GPT-3.5-turbo model
      this.currentService = new OpenAIService(this.openaiApiKey, 'gpt-3.5-turbo');
      this.view.showProviderStatus('ChatGPT (GPT-3.5 Turbo) activated!', 'success');
    }
    
    // Update UI
    this.view.hideApiKeyInput();
    this.view.setApiKeyStatus(true);
    this.view.showSuccess('API key saved successfully');
  }

  /**
   * Handle sending a new message
   * @param {string} text - User's message text
   */
  async handleSendMessage(text) {
    console.log('Controller: handleSendMessage called with:', text);
    
    try {
      // Add user message immediately
      this.model.create(text, true);

      // Show typing indicator
      this.view.setInputDisabled(true);
      this.view.showTypingIndicator();

      // Get conversation history for context
      const history = this.model.getAll();

      // Get AI response using current service
      const botResponse = await this.currentService.getResponse(text, history);

      // Hide typing indicator
      this.view.hideTypingIndicator();

      // Add bot response
      this.model.create(botResponse, false);

      this.view.setInputDisabled(false);

    } catch (error) {
      console.error('Error getting AI response:', error);
      this.view.hideTypingIndicator();
      this.view.setInputDisabled(false);
      
      // Add error message to chat
      const errorMsg = `Sorry, I encountered an error: ${error.message}. ${
        error.message.includes('API key') ? 'Please check your API key.' : 
        error.message.includes('quota') ? 'Try again later or use Eliza mode.' :
        error.message.includes('Rate limit') ? 'Rate limit exceeded. Please wait a moment.' :
        'Please try again.'
      }`;
      
      this.model.create(errorMsg, false);
      this.view.showError(error.message);
    }
  }

  /**
   * Handle editing a message and automatically regenerate AI response
   * @param {string} messageId - ID of message to edit
   * @param {string} newText - New message text
   */
  async handleEditMessage(messageId, newText) {
    try {
      // Update the message
      const updated = this.model.update(messageId, newText);
      
      if (!updated) {
        this.view.showError('Message not found');
        return;
      }
      
      console.log('Message updated, regenerating AI response...');
      this.view.showSuccess('Message updated - regenerating AI response...');

      // Get all messages
      const allMessages = this.model.getAll();
      
      // Find the index of the edited message
      const editedIndex = allMessages.findIndex(m => m.id === messageId);

      if (editedIndex === -1) {
        console.error('Could not find edited message in history');
        return;
      }

      // Delete all messages AFTER the edited one (they're now outdated)
      const messagesToDelete = allMessages.slice(editedIndex + 1);
      messagesToDelete.forEach(msg => {
        console.log('Deleting outdated message:', msg.id);
        this.model.delete(msg.id);
      });

      // Show typing indicator
      this.view.setInputDisabled(true);
      this.view.showTypingIndicator();

      try {
        // Get updated history (after deletions)
        const history = this.model.getAll();

        // Get new AI response for edited message
        const botResponse = await this.currentService.getResponse(newText, history);

        // Hide typing indicator
        this.view.hideTypingIndicator();
        
        // Add new bot response
        this.model.create(botResponse, false);
        
        // Re-enable input
        this.view.setInputDisabled(false);

        console.log('AI response regenerated successfully');
        
      } catch (error) {
        // Handle errors during AI response generation
        console.error('Error regenerating AI response:', error);
        this.view.hideTypingIndicator();
        this.view.setInputDisabled(false);

        // Add error message to chat
        const errorMsg = `Sorry, I couldn't regenerate a response: ${error.message}. ${
          error.message.includes('API key') ? 'Please check your API key.' : 
          error.message.includes('quota') ? 'Try again later or use Eliza mode.' :
          'Please try again.'
        }`;

        this.model.create(errorMsg, false);
        this.view.showError('Failed to regenerate response: ' + error.message);
      }
      
    } catch (error) {
      console.error('Error editing message:', error);
      this.view.showError(error.message);
    }
  }

  /**
   * Handle deleting a message
   * @param {string} messageId - ID of message to delete
   */
  handleDeleteMessage(messageId) {
    try {
      const deleted = this.model.delete(messageId);
      
      if (deleted) {
        this.view.showSuccess('Message deleted');
      } else {
        this.view.showError('Message not found');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      this.view.showError('Failed to delete message');
    }
  }

  /**
   * Handle clearing all messages
   */
  handleClearAll() {
    try {
      this.model.clear();
      this.view.showSuccess('All messages cleared');
    } catch (error) {
      console.error('Error clearing messages:', error);
      this.view.showError('Failed to clear messages');
    }
  }

  /**
   * Handle exporting chat history
   */
  handleExport() {
    try {
      const jsonData = this.model.exportToJSON();
      
      // Create download
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      this.view.showSuccess('Chat exported');
    } catch (error) {
      console.error('Error exporting chat:', error);
      this.view.showError('Failed to export chat');
    }
  }

  /**
   * Handle importing chat history
   * @param {string} jsonString - JSON string to import
   */
  handleImport(jsonString) {
    try {
      const confirmed = confirm(
        'Importing will replace all current messages. Continue?'
      );
      
      if (!confirmed) return;

      this.model.importFromJSON(jsonString);
      this.view.showSuccess('Chat imported successfully');
    } catch (error) {
      console.error('Error importing chat:', error);
      this.view.showError('Failed to import chat: ' + error.message);
    }
  }

  /**
   * Get current statistics
   * @returns {Object} Statistics object
   */
  getStats() {
    return this.model.getStats();
  }

  /**
   * Get current service name (for debugging)
   * @returns {string} Service name
   */
  getCurrentServiceName() {
    return this.currentService.getName();
  }
}

export default ChatController;