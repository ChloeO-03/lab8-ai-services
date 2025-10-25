/**
 * ChatView - Handles all UI rendering and updates
 * Responsibilities: DOM manipulation, rendering, NO business logic
 */
class ChatView {
  constructor() {
    // Cache DOM elements
    this.chatContainer = document.getElementById('chat-messages');
    this.messageForm = document.getElementById('message-form');
    this.messageInput = document.getElementById('message-input');
    this.messageCount = document.getElementById('message-count');
    this.lastSaved = document.getElementById('last-saved');
    this.exportBtn = document.getElementById('export-btn');
    this.importBtn = document.getElementById('import-btn');
    this.clearBtn = document.getElementById('clear-btn');
    this.importFile = document.getElementById('import-file');

    // Event handlers (will be bound by Controller)
    this.onMessageSubmit = null;
    this.onMessageEdit = null;
    this.onMessageDelete = null;
    this.onClearAll = null;
    this.onExport = null;
    this.onImport = null;
  }

  /**
   * Initialize event listeners
   * Controller will set the handler functions
   */
  bindEvents() {
    console.log('View: Binding events');
    
    // Form submission
    if (this.messageForm && this.onMessageSubmit) {
      this.messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = this.messageInput.value.trim();
        if (text) {
          this.onMessageSubmit(text);
          this.messageInput.value = '';
          this.messageInput.focus();
        }
      });
    }

    // Clear all button
    if (this.clearBtn && this.onClearAll) {
      this.clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all messages? This cannot be undone.')) {
          this.onClearAll();
        }
      });
    }

    // Export button
    if (this.exportBtn && this.onExport) {
      this.exportBtn.addEventListener('click', () => {
        this.onExport();
      });
    }

    // Import button triggers file input
    if (this.importBtn && this.importFile) {
      this.importBtn.addEventListener('click', () => {
        this.importFile.click();
      });
    }

    // Import file selection
    if (this.importFile && this.onImport) {
      this.importFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            this.onImport(event.target.result);
          };
          reader.readAsText(file);
          // Reset input so same file can be selected again
          e.target.value = '';
        }
      });
    }

    // Event delegation for edit/delete buttons
    if (this.chatContainer) {
      this.chatContainer.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-btn');
        const editBtn = e.target.closest('.edit-btn');

        if (deleteBtn) {
          const messageId = deleteBtn.dataset.messageId;
          if (confirm('Delete this message?')) {
            this.onMessageDelete && this.onMessageDelete(messageId);
          }
        } else if (editBtn) {
          const messageId = editBtn.dataset.messageId;
          this._enterEditMode(messageId);
        }
      });
    }
  }

  /**
   * Render all messages
   * @param {Array<Object>} messages - Array of message objects
   */
  renderMessages(messages) {
    if (!this.chatContainer) return;

    // Show empty state if no messages
    if (messages.length === 0) {
      this.chatContainer.innerHTML = `
        <div class="empty-state">
          <p>No messages yet. Start a conversation!</p>
        </div>
      `;
      this._updateStats(0, null);
      return;
    }

    // Clear and render all messages
    this.chatContainer.innerHTML = '';
    messages.forEach(message => {
      const messageElement = this._createMessageElement(message);
      this.chatContainer.appendChild(messageElement);
    });

    // Auto-scroll to latest message
    this._scrollToBottom();

    // Update stats
    const lastMessage = messages[messages.length - 1];
    this._updateStats(messages.length, lastMessage.timestamp);
  }

  /**
   * Create a message element (component-style)
   * @private
   * @param {Object} message - Message object
   * @returns {HTMLElement} Message element
   */
  _createMessageElement(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.isUser ? 'user-message' : 'bot-message'}`;
    messageDiv.dataset.messageId = message.id;

    // Message content
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const textDiv = document.createElement('div');
    textDiv.className = 'message-text';
    textDiv.textContent = message.text;
    
    contentDiv.appendChild(textDiv);

    // Metadata (timestamp and edited indicator)
    const metaDiv = document.createElement('div');
    metaDiv.className = 'message-meta';
    
    const timeSpan = document.createElement('span');
    timeSpan.className = 'message-time';
    timeSpan.textContent = this._formatTimestamp(message.timestamp);
    metaDiv.appendChild(timeSpan);

    if (message.edited) {
      const editedSpan = document.createElement('span');
      editedSpan.className = 'edited-indicator';
      editedSpan.textContent = '(edited)';
      metaDiv.appendChild(editedSpan);
    }

    contentDiv.appendChild(metaDiv);

    // Actions (only for user messages)
    if (message.isUser) {
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'message-actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'edit-btn';
      editBtn.dataset.messageId = message.id;
      editBtn.textContent = 'Edit';
      editBtn.setAttribute('aria-label', 'Edit message');

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.dataset.messageId = message.id;
      deleteBtn.textContent = 'Delete';
      deleteBtn.setAttribute('aria-label', 'Delete message');

      actionsDiv.appendChild(editBtn);
      actionsDiv.appendChild(deleteBtn);
      contentDiv.appendChild(actionsDiv);
    }

    messageDiv.appendChild(contentDiv);
    return messageDiv;
  }

  /**
   * Enter edit mode for a message (simplified with prompt)
   * @private
   * @param {string} messageId - Message ID
   */
  _enterEditMode(messageId) {
    const messageElement = this.chatContainer.querySelector(`[data-message-id="${messageId}"]`);
    if (!messageElement) return;

    const textDiv = messageElement.querySelector('.message-text');
    const currentText = textDiv.textContent;
    
    const newText = prompt('Edit message:', currentText);
    
    if (newText && newText.trim() && this.onMessageEdit) {
      this.onMessageEdit(messageId, newText);
    }
  }

  /**
   * Update statistics display
   * @private
   * @param {number} count - Message count
   * @param {number} timestamp - Last message timestamp
   */
  _updateStats(count, timestamp) {
    if (this.messageCount) {
      this.messageCount.textContent = count;
    }

    if (this.lastSaved && timestamp) {
      this.lastSaved.textContent = this._formatTimestamp(timestamp);
    } else if (this.lastSaved) {
      this.lastSaved.textContent = 'Never';
    }
  }

  /**
   * Format timestamp to readable string
   * @private
   * @param {number} timestamp - Unix timestamp
   * @returns {string} Formatted time
   */
  _formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    // Show full date and time
    return date.toLocaleString();
  }

  /**
   * Scroll chat container to bottom
   * @private
   */
  _scrollToBottom() {
    if (this.chatContainer) {
      this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }
  }

  /**
   * Show loading state
   */
  showLoading() {
    if (this.chatContainer) {
      this.chatContainer.innerHTML = '<div class="loading">Loading messages...</div>';
    }
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    alert('Error: ' + message);
  }

  /**
   * Show success message
   * @param {string} message - Success message
   */
  showSuccess(message) {
    console.log('Success:', message);
  }

  /**
   * Disable/enable input
   * @param {boolean} disabled - Whether to disable input
   */
  setInputDisabled(disabled) {
    if (this.messageInput) {
      this.messageInput.disabled = disabled;
    }
  }
}

// Export for use in other modules
export default ChatView;