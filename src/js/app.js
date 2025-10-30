/**
 * app.js - Application entry point
 */
import ChatController from './controller.js';

// CRITICAL: Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('=== DOM LOADED ===');
  console.log('Initializing AI Chat Application...');
  
  // Verify HTML elements exist
  const form = document.getElementById('message-form');
  const input = document.getElementById('message-input');
  console.log('Form exists in DOM:', !!form);
  console.log('Input exists in DOM:', !!input);
  
  // Create the controller
  const app = new ChatController();
  
  // Make available globally for debugging
  window.chatApp = app;
  
  console.log('=== APPLICATION READY ===');
  console.log('Try typing a message!');
});