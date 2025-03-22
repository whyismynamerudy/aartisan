export { analyzeComponents } from './analyze.js';
import 'fs-extra';
import 'path';
import '@babel/parser';
import '@babel/traverse';
import '@babel/types';
import '@babel/generator';
import '../core/metadata.js';

/**
 * aartisan - AI Integration
 * 
 * Provides integration with AI models for component analysis
 * and enhancement.
 */


/**
 * AI providers status - placeholders for now
 */
const aiProviders = {
  gemini: {
    name: 'Gemini',
    available: false,
    capabilities: ['component-analysis', 'metadata-generation']
  },
  cohere: {
    name: 'Cohere',
    available: false,
    capabilities: ['component-analysis', 'metadata-generation']
  }
};

/**
 * Initializes the AI providers with API keys
 * @param {Object} options - Initialization options
 * @param {string} options.geminiApiKey - Gemini API key
 * @param {string} options.cohereApiKey - Cohere API key
 * @returns {Promise<Object>} Initialized providers
 */
async function initializeProviders(options = {}) {
  // This is a placeholder implementation
  // In a real implementation, this would initialize the API clients

  return {
    gemini: options.geminiApiKey ? {
      name: 'Gemini',
      available: true,
      capabilities: ['component-analysis', 'metadata-generation']
    } : aiProviders.gemini,
    cohere: options.cohereApiKey ? {
      name: 'Cohere',
      available: true,
      capabilities: ['component-analysis', 'metadata-generation']
    } : aiProviders.cohere
  };
}

/**
 * Gets the best available AI provider
 * @returns {Object|null} Best available provider or null
 */
function getBestProvider() {
  if (aiProviders.gemini.available) {
    return {
      id: 'gemini',
      ...aiProviders.gemini
    };
  }
  if (aiProviders.cohere.available) {
    return {
      id: 'cohere',
      ...aiProviders.cohere
    };
  }
  return null;
}

/**
 * Checks if AI integration is available
 * @returns {boolean} Whether AI integration is available
 */
function isAIAvailable() {
  return aiProviders.gemini.available || aiProviders.cohere.available;
}

export { aiProviders, getBestProvider, initializeProviders, isAIAvailable };
//# sourceMappingURL=index.js.map
