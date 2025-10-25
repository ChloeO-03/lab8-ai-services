/**
 * app.js - Application entry point
 * Initializes the MVC architecture
 */
import ChatController from './controller.js';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing Eliza Chat Application...');
  
  // Create the controller (which creates Model and View)
  const app = new ChatController();
  
  // Make it available globally for debugging (optional)
  window.chatApp = app;
  
  console.log('Application ready!');
  console.log('Try typing messages to chat with Eliza.');
  console.log('You can edit/delete your messages, export/import chat history, and more!');
});