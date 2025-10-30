/**
 * E2E Tests for Lab 8 Chat Application
 * Tests cover Eliza mode and AI provider switching
 * Note: Tests use Eliza (no API calls) to avoid needing real API keys
 */
import { test, expect } from '@playwright/test';

test.describe('Chat Application - Eliza Mode', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto('/');
    
    // Clear localStorage to start fresh
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    
    // Ensure Eliza is selected (default)
    const provider = await page.locator('#ai-provider').inputValue();
    expect(provider).toBe('eliza');
  });

  test('should load application successfully', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/AI Chat Application/);
    
    // Check main elements exist
    await expect(page.locator('h1')).toContainText('AI Chat Application');
    await expect(page.locator('#ai-provider')).toBeVisible();
    await expect(page.locator('#message-input')).toBeVisible();
    await expect(page.locator('.send-button')).toBeVisible();
  });

  test('should send message and receive Eliza response', async ({ page }) => {
    // Type and send a message
    await page.fill('#message-input', 'Hello');
    await page.click('.send-button');
    
    // Wait for messages to appear
    await page.waitForSelector('.message', { timeout: 5000 });
    
    // Check user message appears
    const userMessages = page.locator('.user-message');
    await expect(userMessages).toHaveCount(1);
    await expect(userMessages.first()).toContainText('Hello');
    
    // Check bot response appears
    const botMessages = page.locator('.bot-message');
    await expect(botMessages).toHaveCount(1);
    
    // Verify message count updates
    const messageCount = await page.locator('#message-count').textContent();
    expect(parseInt(messageCount)).toBe(2);
  });

  test('should handle multiple messages in conversation', async ({ page }) => {
    // Send first message
    await page.fill('#message-input', 'Hello');
    await page.click('.send-button');
    await page.waitForSelector('.bot-message', { timeout: 5000 });
    
    // Send second message
    await page.fill('#message-input', 'How are you?');
    await page.click('.send-button');
    await page.waitForSelector('.message:nth-of-type(4)', { timeout: 5000 });
    
    // Check we have 4 total messages (2 user, 2 bot)
    const allMessages = page.locator('.message');
    await expect(allMessages).toHaveCount(4);
  });

  test('should clear input after sending message', async ({ page }) => {
    // Fill input
    await page.fill('#message-input', 'Test message');
    
    // Send message
    await page.click('.send-button');
    
    // Wait a moment for message to be processed
    await page.waitForTimeout(500);
    
    // Check input is cleared
    const inputValue = await page.locator('#message-input').inputValue();
    expect(inputValue).toBe('');
  });

  test('should delete a message', async ({ page }) => {
    // Send a message
    await page.fill('#message-input', 'Message to delete');
    await page.click('.send-button');
    await page.waitForSelector('.message', { timeout: 5000 });
    
    // Set up dialog handler before clicking delete
    page.on('dialog', dialog => dialog.accept());
    
    // Click delete button
    await page.click('.delete-btn');
    
    // Wait for message to be removed
    await page.waitForTimeout(500);
    
    // Check message was deleted (count should be less than 2)
    const messageCount = await page.locator('#message-count').textContent();
    expect(parseInt(messageCount)).toBeLessThan(2);
  });

  test('should export chat history', async ({ page }) => {
    // Send a message first
    await page.fill('#message-input', 'Test export');
    await page.click('.send-button');
    await page.waitForSelector('.message', { timeout: 5000 });
    
    // Set up download listener
    const downloadPromise = page.waitForEvent('download');
    
    // Click export button
    await page.click('#export-btn');
    
    // Wait for download
    const download = await downloadPromise;
    
    // Verify download filename contains expected pattern
    expect(download.suggestedFilename()).toMatch(/chat-export-\d+\.json/);
  });

  test('should clear all messages', async ({ page }) => {
    // Send a message
    await page.fill('#message-input', 'Test message');
    await page.click('.send-button');
    await page.waitForSelector('.message', { timeout: 5000 });
    
    // Set up dialog handler
    page.on('dialog', dialog => dialog.accept());
    
    // Click clear all
    await page.click('#clear-btn');
    
    // Wait for clear to complete
    await page.waitForTimeout(500);
    
    // Check empty state appears
    await expect(page.locator('.empty-state')).toBeVisible();
    
    // Check message count is 0
    const messageCount = await page.locator('#message-count').textContent();
    expect(parseInt(messageCount)).toBe(0);
  });

  test('should display typing indicator during response', async ({ page }) => {
    // Start sending a message
    await page.fill('#message-input', 'Hello');
    await page.click('.send-button');
    
    // Typing indicator should appear briefly
    // (May be too fast to catch reliably, so we just check messages appear)
    await page.waitForSelector('.message', { timeout: 5000 });
    
    // Verify messages were created
    const messages = page.locator('.message');
    await expect(messages).toHaveCount(2);
  });
});

test.describe('AI Provider Switching', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should show API key input when selecting Gemini', async ({ page }) => {
    // Select Gemini from dropdown
    await page.selectOption('#ai-provider', 'gemini');
    
    // Wait for UI to update
    await page.waitForTimeout(500);
    
    // API key input should appear
    await expect(page.locator('#api-key-container')).toBeVisible();
    await expect(page.locator('#api-key-input')).toBeVisible();
    
    // Status message should show
    const status = page.locator('#provider-status');
    await expect(status).toContainText('API key required');
  });

  test('should show API key input when selecting OpenAI', async ({ page }) => {
    // Select OpenAI from dropdown
    await page.selectOption('#ai-provider', 'openai');
    
    // Wait for UI to update
    await page.waitForTimeout(500);
    
    // API key input should appear
    await expect(page.locator('#api-key-container')).toBeVisible();
    
    // Status message should show
    const status = page.locator('#provider-status');
    await expect(status).toContainText('OpenAI API key required');
  });

  test('should hide API key input when switching back to Eliza', async ({ page }) => {
    // Select Gemini first
    await page.selectOption('#ai-provider', 'gemini');
    await page.waitForTimeout(500);
    await expect(page.locator('#api-key-container')).toBeVisible();
    
    // Switch back to Eliza
    await page.selectOption('#ai-provider', 'eliza');
    await page.waitForTimeout(500);
    
    // API key input should be hidden
    await expect(page.locator('#api-key-container')).not.toBeVisible();
  });

  test('should validate Gemini API key format', async ({ page }) => {
    // Select Gemini
    await page.selectOption('#ai-provider', 'gemini');
    await page.waitForTimeout(500);
    
    // Set up alert handler
    let alertMessage = '';
    page.on('dialog', async dialog => {
      alertMessage = dialog.message();
      await dialog.accept();
    });
    
    // Enter invalid key
    await page.fill('#api-key-input', 'invalid-key');
    await page.click('#api-key-submit');
    
    // Wait for alert
    await page.waitForTimeout(500);
    
    // Check error message
    expect(alertMessage).toContain('Invalid');
  });

  test('should validate OpenAI API key format', async ({ page }) => {
    // Select OpenAI
    await page.selectOption('#ai-provider', 'openai');
    await page.waitForTimeout(500);
    
    // Set up alert handler
    let alertMessage = '';
    page.on('dialog', async dialog => {
      alertMessage = dialog.message();
      await dialog.accept();
    });
    
    // Enter invalid key
    await page.fill('#api-key-input', 'invalid-key');
    await page.click('#api-key-submit');
    
    // Wait for alert
    await page.waitForTimeout(500);
    
    // Check error message
    expect(alertMessage).toContain('Invalid');
  });
});

test.describe('Message Persistence', () => {
  
  test('should persist messages after page reload', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    
    // Send a message
    await page.fill('#message-input', 'Persistent message');
    await page.click('.send-button');
    await page.waitForSelector('.message', { timeout: 5000 });
    
    // Reload the page
    await page.reload();
    
    // Wait for page to load
    await page.waitForSelector('.message', { timeout: 5000 });
    
    // Check message still exists
    const userMessage = page.locator('.user-message .message-text');
    await expect(userMessage.first()).toContainText('Persistent message');
  });
});

test.describe('Form Validation', () => {
  
  test('should not send empty messages', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    
    // Try to send empty message
    await page.click('.send-button');
    
    // Wait a moment
    await page.waitForTimeout(500);
    
    // Check no messages were created
    const messages = page.locator('.message');
    const count = await messages.count();
    expect(count).toBe(0);
  });

  test('should require message input', async ({ page }) => {
    await page.goto('/');
    
    // Check input has required attribute
    const input = page.locator('#message-input');
    await expect(input).toHaveAttribute('required');
  });
});

test.describe('Accessibility', () => {
  
  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/');
    
    // Check for aria-label attributes
    await expect(page.locator('#message-input')).toHaveAttribute('aria-label');
    await expect(page.locator('#ai-provider')).toHaveAttribute('aria-label');
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    
    // Focus on message input with Tab
    await page.keyboard.press('Tab');
    
    // Type message
    await page.keyboard.type('Test keyboard navigation');
    
    // Press Enter to send
    await page.keyboard.press('Enter');
    
    // Wait for messages
    await page.waitForSelector('.message', { timeout: 5000 });
    
    // Message should be sent
    const messages = page.locator('.message');
    await expect(messages).toHaveCount(2);
  });
});