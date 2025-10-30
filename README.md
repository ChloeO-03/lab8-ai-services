# Lab 8: AI Services Chat Application
COMP 305 Fall 2025



## Project Overview

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

## 🤖 AI Provider Comparison

### Detailed Comparison

| Feature | Eliza (Local) | Gemini 2.5 Flash | ChatGPT (GPT-3.5) |
|---------|---------------|------------------|-------------------|
| **Cost** | Free | Free (1,500/day) | $5 credit (expires) |
| **Setup** | None | No CC needed | Credit card required |
| **Speed** | Instant | ~1.2s | ~1.5s |
| **Intelligence** | ⭐⭐ Basic | ⭐⭐⭐⭐ Advanced | ⭐⭐⭐⭐⭐ Excellent |
| **Privacy** | 100% local | Cloud (Google) | Cloud (OpenAI) |
| **Context Aware** | ❌ No | ✅ Yes | ✅ Yes |
| **Offline** | ✅ Yes | ❌ No | ❌ No |
| **API Key** | ❌ Not needed | ✅ Required | ✅ Required |
| **Rate Limits** | None | 60/min, 1,500/day | 3/min (free tier) |
| **Best For** | Testing, Privacy | Production, Free tier | High-quality responses |


### When to Use Each Provider

#### 🤖 Eliza (Local)
**Use When:**
- ✅ Developing and testing
- ✅ Privacy is critical
- ✅ Offline access needed
- ✅ No budget for AI services
- ✅ Simple pattern-based responses sufficient

**Don't Use When:**
- ❌ Need intelligent, context-aware responses
- ❌ Require natural language understanding
- ❌ Want conversation memory

#### ✨ Gemini 2.5 Flash
**Use When:**
- ✅ Need intelligent AI responses
- ✅ Want free, generous rate limits
- ✅ Building educational projects
- ✅ No credit card available
- ✅ Need context-aware conversations

**Don't Use When:**
- ❌ Maximum privacy required (use Eliza)
- ❌ Need absolute highest quality (use GPT-4)

#### 🧠 ChatGPT (GPT-3.5)
**Use When:**
- ✅ Need industry-leading quality
- ✅ Have budget for AI services
- ✅ Building production applications
- ✅ Want mature, stable API
- ✅ Require best-in-class responses


**Don't Use When:**
- ❌ No credit card available
- ❌ Educational project (use Gemini)
- ❌ Cost is a concern

---

## 🔒 Security & Privacy

### API Key Storage

**Current Implementation (Educational)**
- API keys stored in browser `localStorage`
- ⚠️ **Not production-safe** - keys visible in DevTools
- ✅ Acceptable for educational/learning purposes
- ✅ Keys never committed to Git (`.gitignore`)

**Production Recommendations**
```
❌ Don't: Store keys in frontend localStorage
✅ Do: Use backend API proxy
✅ Do: Store keys in environment variables
✅ Do: Implement rate limiting
✅ Do: Add user authentication


```

**Example Production Architecture:**
```
User Browser → Your Backend API → AI Provider API
             ↑
         (Key stored here)
```

### Privacy Comparison

**Eliza (100% Private)**
- ✅ All processing in browser
- ✅ No data sent anywhere
- ✅ No tracking
- ✅ Complete privacy

**Gemini (Cloud-based)**
- ⚠️ Messages sent to Google servers
- ⚠️ Subject to Google's privacy policy
- ⚠️ May be used for model improvement
- ✅ Encrypted in transit (HTTPS)
- 📖 Privacy policy: https://ai.google.dev/terms


**OpenAI (Cloud-based)**
- ⚠️ Messages sent to OpenAI servers
- ⚠️ Subject to OpenAI's privacy policy
- ⚠️ May be used for model training (opt-out available)
- ✅ Encrypted in transit (HTTPS)
- 📖 Privacy policy: https://openai.com/privacy

### Best Practices
```javascript
// ✅ DO: Validate API keys before using
if (!GeminiService.isValidApiKey(key)) {
  throw new Error('Invalid key format');
}

// ✅ DO: Handle errors gracefully
try {
  const response = await service.getResponse(message);
} catch (error) {
  showUserFriendlyError(error);
}

// ✅ DO: Use HTTPS for all API calls
const endpoint = 'https://api.example.com'; // Not http://

// ❌ DON'T: Commit API keys
// Use .gitignore and environment variables

// ❌ DON'T: Log API keys
console.log('API Key:', apiKey); // Never do this
```

---
### Test Philosophy

- 🎯 **Focus on Eliza** - No API keys needed for tests
- 🚫 **No Real API Calls** - All tests use local Eliza
- ⚡ **Fast Execution** - Tests run in ~30 seconds
- 🔄 **Repeatable** - Tests are deterministic
- 📸 **Screenshots on Failure** - Easy debugging

---


## 🎓 Learning Objectives Achieved

This project demonstrates mastery of:

### Software Engineering Patterns
- ✅ **MVC Architecture** - Separation of concerns
- ✅ **Service Layer Pattern** - Abstraction of external services
- ✅ **Strategy Pattern** - Swappable algorithm implementations
- ✅ **Observer Pattern** - Reactive data flow
- ✅ **Dependency Injection** - Loose coupling

### Technical Skills
- ✅ **API Integration** - RESTful API calls to multiple providers
- ✅ **Async Programming** - Promises, async/await, error handling
- ✅ **E2E Testing** - Playwright test automation
- ✅ **Browser APIs** - localStorage, Fetch API, File API
- ✅ **Error Handling** - Graceful degradation and user feedback
- ✅ **Security** - API key validation and secure storage practices

### Best Practices
- ✅ **Code Organization** - Modular, maintainable structure
- ✅ **Documentation** - Comprehensive comments and README
- ✅ **Git Practices** - Incremental commits with meaningful messages
- ✅ **Testing** - Automated E2E test coverage
- ✅ **Accessibility** - ARIA labels and keyboard navigation


### Deploy to Netlify

1. **Push to GitHub** (same as above)

2. **Connect to Netlify**
   - Go to https://app.netlify.com/
   - Click **Add new site** → **Import an existing project**
   - Connect to Git → Select repository
   - Configure settings:
     - Base directory: `src`
     - Build command: *(leave empty)*
     - Publish directory: `src`
   - Click **Deploy site**

3. **Access Your App**
   - Live at: `https://your-site-name.netlify.app`


### Alternative: GitHub Pages
```bash
# Create gh-pages branch with src/ as root
git subtree push --prefix src origin gh-pages
```

Access at: `https://YOUR-USERNAME.github.io/lab8-ai-services/`

---

## 🐛 Troubleshooting

### Common Issues

**"Failed to load resource: 404" for service files**
```bash
# Check file paths
# Ensure: src/js/services/ElizaService.js exists
# Not: src/services/ElizaService.js

# Verify import paths in controller.js
import ElizaService from './services/ElizaService.js';
```

**"Invalid API key format"**
- Gemini keys start with `AIzaSy`
- OpenAI keys start with `sk-`
- Check for spaces at beginning/end
- Copy entire key

**"Rate limit exceeded"**
- Free tier limits hit
- Wait a few minutes
- Switch to Eliza temporarily
- Check provider dashboard

**Messages not persisting**
- Check if localStorage is enabled
- Not in private/incognito mode
- Try clearing localStorage: `localStorage.clear()`

**Typing indicator doesn't disappear**
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Check browser console for errors
- Verify API key is valid

**Import/Export not working**
- Check browser allows file downloads
- Verify JSON file format
- Try exporting first, then importing same file

---

## License
This project is licensed under the MIT License - see [LICENSE.md](LICENSE.md) for
details.

## Author
Chloe Ogamba


## References

### Documentation
- [MDN Web Docs - Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [Google Gemini API Docs](https://ai.google.dev/docs)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Playwright Documentation](https://playwright.dev/)

### Design Patterns
- [MVC Pattern](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller)

### API Keys
- [Google AI Studio](https://aistudio.google.com/app/apikey)
- [OpenAI Platform](https://platform.openai.com/api-keys)

### Tools
- [Playwright Test](https://playwright.dev/)
- [Netlify](https://www.netlify.com/)

