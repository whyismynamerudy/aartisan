/**
 * aartisan - Core functionality
 */
import { createMetadata, getMetadata, enhanceMetadata } from './metadata.js';

// Export metadata system
export {
  createMetadata,
  getMetadata,
  enhanceMetadata
};

/**
 * Creates a semantically enhanced component or element
 * @param {Object} element - The React element or component to enhance
 * @param {Object} semantics - Semantic metadata for the element
 * @returns {Object} Enhanced element
 */
export function enhance(element, semantics = {}) {
  return {
    ...element,
    __aartisan: {
      ...semantics,
      enhanced: true,
      version: '0.1.0'
    }
  };
}

/**
 * Checks if an element has been enhanced with aartisan metadata
 * @param {Object} element - Element to check
 * @returns {boolean} Whether the element is enhanced
 */
export function isEnhanced(element) {
  return element && element.__aartisan && element.__aartisan.enhanced === true;
}

/**
 * Creates a semantic context object for AI agent understanding
 * @param {Object} options - Context options
 * @returns {Object} Semantic context object
 */
export function createContext(options = {}) {
  return {
    type: 'aartisan-context',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    ...options
  };
}