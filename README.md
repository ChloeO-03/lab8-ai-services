# Lab 8: AI Services Chat Application

A sophisticated chat application demonstrating the MVC (Model-View-Controller) architecture pattern with a flexible service layer that supports multiple AI providers. Built to showcase professional software engineering practices including the Strategy pattern, dependency injection, and comprehensive E2E testing.


---

## 🎯 Project Overview

This application refactors a traditional chatbot to support swappable AI services through the Service Layer pattern, allowing users to seamlessly switch between:

- **🤖 Eliza (Local)** - Classic pattern-matching chatbot (free, private, offline)
- **✨ Google Gemini 2.5 Flash** - Advanced AI with natural language understanding
- **🧠 OpenAI ChatGPT (GPT-3.5)** - Industry-leading conversational AI

The project demonstrates key software engineering principles:
- **Service Layer Pattern** - Abstraction layer for AI providers
- **Strategy Pattern** - Swappable algorithm implementations
- **MVC Architecture** - Separation of concerns
- **Observer Pattern** - Reactive data updates
- **Dependency Injection** - Loose coupling between components

## ✨ Features

### Core Functionality
- 💬 **Real-time Chat** - Send and receive AI-powered messages
- ✏️ **Message Editing** - Edit messages with automatic AI response regeneration
- 🗑️ **Message Management** - Delete individual messages or clear all
- 📥 **Export/Import** - Save and restore chat history as JSON
- 🔄 **Provider Switching** - Seamlessly switch between AI services
- 💾 **Persistence** - Chat history saved in localStorage
- 🎨 **Responsive Design** - Works on desktop and mobile

### Technical Features
- 🏗️ **MVC Architecture** - Clean separation of Model, View, and Controller
- 🔌 **Service Layer Pattern** - Swappable AI implementations
- 🎭 **Strategy Pattern** - Runtime provider selection
- 🔔 **Observer Pattern** - Automatic UI updates
- ⚡ **Async/Await** - Proper asynchronous handling
- 🛡️ **Error Handling** - Graceful degradation
- ♿ **Accessibility** - ARIA labels and keyboard navigation
- 🧪 **E2E Testing** - Playwright test suite

---

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Node.js 16+ and npm (for testing)
- Git


## 📖 Usage Guide

### Getting Started

1. **Open the application** in your browser
2. **Select an AI provider** from the dropdown at the top
3. **Start chatting!**

### Using Eliza (Local)

1. Select **"Eliza (Local)"** from the AI Provider dropdown
2. Type your message and press Enter or click Send
3. Eliza responds instantly using pattern matching
4. **No setup required** - works offline and completely free


### Using Gemini Pro (Cloud AI)

1. **Get API Key**
   - Visit https://aistudio.google.com/app/apikey
   - Sign in with Google account
   - Click "Create API Key"
   - Copy the key (starts with `AIzaSy`)

2. **Configure in App**
   - Select **"Gemini Pro"** from dropdown
   - Paste your API key when prompted
   - Click "Save Key"
   - Key is stored in browser localStorage

3. **Start Chatting**
   - Type your message
   - Gemini responds with intelligent, context-aware answers
   - Conversation history is maintained


### Using ChatGPT (OpenAI)

1. **Get API Key**
   - Visit https://platform.openai.com/api-keys
   - Create account (requires credit card)
   - Create new API key (starts with `sk-`)
   - Copy the key

2. **Configure in App**
   - Select **"ChatGPT"** from dropdown
   - Paste your API key when prompted
   - Click "Save Key"

3. **Start Chatting**
   - High-quality responses from GPT-3.5-turbo
   - Excellent context understanding  

### Advanced Features

**Editing Messages**
1. Click the **"Edit"** button on any user message
2. Enter new text in the prompt
3. AI automatically regenerates its response
4. All subsequent messages are removed

**Deleting Messages**
1. Click the **"Delete"** button on any message
2. Confirm deletion
3. Message is removed from history

**Exporting Chat**
1. Click **"📥 Export Chat"** button
2. JSON file downloads automatically
3. Contains all messages with metadata 

**Importing Chat**
1. Click **"📤 Import Chat"** button
2. Select a previously exported JSON file
3. Confirm to replace current messages
4. Chat history is restored

**Clearing All Messages**
1. Click **"🗑️ Clear All"** button
2. Confirm action
3. All messages are permanently deleted

---

### Service Layer (Strategy Pattern)

The service layer implements the Strategy pattern, allowing runtime selection of AI providers without changing the controller:
```javascript
// All services implement the same interface
interface AIService {
  async getResponse(message, history): string
  getName(): string
}

// Swap implementations at runtime
controller.currentService = new ElizaService();
controller.currentService = new GeminiService(apiKey);
controller.currentService = new OpenAIService(apiKey);
```


**Benefits:**
- ✅ Add new AI providers without changing existing code
- ✅ Test with mock services
- ✅ Switch providers at runtime
- ✅ No tight coupling to specific implementations


**Author**: Chloe Ogamba
---