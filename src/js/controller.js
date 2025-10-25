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
   * Handle sending a new message
   * @param {string} text - User's message text
   */
  handleSendMessage(text) {
    try {
      // Add user message
      this.model.create(text, true);

      // Get bot response using Eliza
      const botResponse = getBotResponse(text);

      // Add bot response after a short delay (more natural)
      setTimeout(() => {
        this.model.create(botResponse, false);
      }, 500);

    } catch (error) {
      console.error('Error sending message:', error);
      this.view.showError('Failed to send message');
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
}

// Export for use in app.js
export default ChatController;