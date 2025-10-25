/**
 * ChatController - Coordinates between Model and View
 * Responsibilities: Handle user actions, update Model, refresh View
 * NO direct DOM manipulation, NO direct data storage
 */
import ChatModel from './model.js';
import ChatView from './view.js';
import ElizaService from '../services/ElizaService.js';
import GeminiService from '../services/GeminiService.js';

class ChatController {
  constructor() {
    this.model = new ChatModel('eliza-chat-messages');
    // Create the View (UI Layer)
    this.view = new ChatView();

    this.currentService = new ElizaService();

    // Store Gemini API key (loaded from localStorage if available)
    this.geminiAPiKey = null

    this._initialize();

  }

  /**
   * Initialize the application
   * @private
   */
  _initialize() {
    // Bind View event handlers to Controller methods
    this.view.onMessageSubmit = this.handleSendMessage.bind(this);
    this.view.onMessageEdit = this.handleEditMessage.bind(this);
    this.view.onMessageDelete = this.handleDeleteMessage.bind(this);
    this.view.onClearAll = this.handleClearAll.bind(this);
    this.view.onExport = this.handleExport.bind(this);
    this.view.onImport = this.handleImport.bind(this);


    // AI provider management events
    this.view.onProviderChange = this.handleProviderChange.bind(this);
    this.view.onApiKeySubmit = this.handleApiKeySubmit(this);
    
    // Set up View event listeners
    this.view.bindEvents();

    // Subscribe to Model changes (Observer pattern)
    this.model.subscribe((messages) => {
      this.view.renderMessages(messages);
    });

    // Try to load previously saved API key from localStorage
    this._loadSavedApiKey();

    // Load and display existing messages from storage
    this._loadInitialMessages();

    console.log('ChatController initialized with service layer');
  }
  /**
   * Load saved API key from localStorage
   * 
   * If user has previously entered an API key, we reload it
   * so they don't have to enter it again each session.
   * 
   * Security Note: Storing API keys in localStorage is NOT production-safe.
   * For production, use server-side storage or secure environment variables.
   * 
   * @private
   */

  _loadSavedApiKey () {
    try {
      // Try to retrieve saved key
      const savedKey = localStorage.getItem('gemini_api_key');

      if(savedKey) {
        // Store in controller instance
        this.geminiAPiKey = savedKey;

        this.view.setApiKeyStatus(true);
      }
    } catch (error) {
      console.warn('Could not load saved API key:', error);
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
   * Handle AI provider change (user selects Eliza or Gemini)
   * 
   * This is where the Strategy Pattern shines - we can swap
   * AI implementations without changing any other code.
   * 
   * @param {string} provider - Provider name ('eliza' or 'gemini')
   */

  handleProviderChange(provider) {
    console.log('Switching to provider:', provider);

    if(provider === 'eliza') {
      // Switch to local Eliza service
      this.currentService = new ElizaService();

    //Update the UI
    this.view.showProviderStatus ('Using Eliza (local)', 'success');
    this.view.hideApiKeyInput();

    } else if (provder === 'gemini') {
      // Check if we have the API key saved
      if (this.geminiAPiKey) {
        this.currentService = new GeminiService(this.geminiAPiKey);
        this.view.showProviderStatus('USing Gemini Pro', 'success');
        this.view.hideApiKeyInput();
      } else {
        // If there is no key, prompt user to enter one
        this.view.showApiKeyInput();
        this.view.showProviderStatus('Gemini API key requireed', 'warning');

        // Keep using Eliza unitl key is provided
        this.currentService = new ElizaService();
      }
    }
    
  }

  /**
   * Handle API key submission
   * 
   * When user enters their Gemini API key, validate it,
   * save it, and activate the Gemini service.
   * 
   * @param {string} apiKey - User's Gemini API key
   */

  handleApiKeySubmit(apiKey) {
    // Validate key format before saving
    if(!GeminiService.isValidApiKey(apiKey)) {
      this.view.showError('Invalid API key format. Should start with "AIzaSy" ');
      return;
    }
    this.geminiAPiKey = apiKey;

    //Save to localStorage for future sessions
    try {
      localStorage.setItem('gemini_api_key',apiKey);
    } catch (error) {
      console.warn('could not save API key:', error);
    }
    // Activate Gemini service with the new key
    this.currentService = new GeminiService(this.geminiAPiKey);

    // Update UI
    this.view.hideApiKeyInput();
    this.view.setApiKeyStatus(true);
    this.view.showProviderStatus('Gemini Pro activated!', 'success');
    this.view.showSuccess('API key saved successfully');
  }


  /**
   * Handle sending a new message
   * @param {string} text - User's message text
   */
  async handleSendMessage(text) {
    try {
      // Add user message
      this.model.create(text, true);

      // Disable input whle waiting for AI response
      this.view.setInputDisabled(true);
      this.view.showTypingIndicator();

      const history = this.model.getAll();

      // Get AI response using current service
      const botResponse = await this.currentService.getResponse(text,history);

      this.view.hideTypingIndicator();

      this.model.create(botResponse,false);

      this.view.setInputDisabled(false);

    } catch (error) {
      console.error('Error getting AI response:', error);

      this.view.hideTypingIndicator();
      this.view.setInputDisabled(false);

      const errorMsg = `Sorry, I encountered an error: ${error.message}. ${
        error.message.includes('API key') ? 'Please check your API key.' :
        error.message.includes('quota') ? 'Try again later or use Eliza mode.' :
        'Pease try again'
      }`;
      // Add error emssage to chat so user sees it
      this.model.create(errorMsg,fasle);

      //Also show alert
      this.view.showError(error.message);
    }
  }

  /**
   * Handle editing a message
   * @param {string} messageId - ID of message to edit
   * @param {string} newText - New message text
   */
  handleEditMessage(messageId, newText) {
    try {
      const updated = this.model.update(messageId, newText);
      
      if (updated) {
        this.view.showSuccess('Message updated');
      } else {
        this.view.showError('Message not found');
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
      a.download = `eliza-chat-${Date.now()}.json`;

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
   * Get current statistics (for potential stats display)
   * @returns {Object} Statistics object
   */
  getStats() {
    return this.model.getStats();
  }
  /**
   * Get current AI service name
   * 
   * Useful for debugging - check which AI is currently active
   * 
   * @returns {string} Service name
   */

  getCurrentServiceName() {
    return this.currentService.getName();
  }
}

// Export for use in app.js
export default ChatController;