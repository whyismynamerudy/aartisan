/**
 * aartisan - Metadata system
 * 
 * Handles creation, validation, and enhancement of semantic metadata
 * for AI agent understanding.
 */

/**
 * Creates a metadata object with semantic information
 * @param {Object} options - Metadata options
 * @param {string} options.name - Component/element name
 * @param {string} options.purpose - Purpose of the component/element
 * @param {string[]} options.interactions - Possible interactions
 * @param {Object} options.props - Props description
 * @param {Object} options.semantics - Additional semantic information
 * @returns {Object} Metadata object
 */
export function createMetadata({
    name,
    purpose,
    interactions = [],
    props = {},
    semantics = {}
  } = {}) {
    return {
      name,
      purpose,
      interactions,
      props,
      semantics,
      timestamp: new Date().toISOString(),
      version: '0.1.0'
    };
  }
  
  /**
   * Retrieves metadata from an enhanced element
   * @param {Object} element - Enhanced element
   * @returns {Object|null} Metadata or null if not enhanced
   */
  export function getMetadata(element) {
    if (element && element.__aartisan) {
      return element.__aartisan;
    }
    return null;
  }
  
  /**
   * Enhances existing metadata with additional information
   * @param {Object} metadata - Existing metadata
   * @param {Object} enhancement - Additional metadata to merge
   * @returns {Object} Enhanced metadata
   */
  export function enhanceMetadata(metadata, enhancement) {
    return {
      ...metadata,
      ...enhancement,
      semantics: {
        ...(metadata.semantics || {}),
        ...(enhancement.semantics || {})
      },
      // Keep original timestamp but add update timestamp
      created: metadata.timestamp || metadata.created || new Date().toISOString(),
      updated: new Date().toISOString()
    };
  }
  
  /**
   * Validates metadata for completeness and correctness
   * @param {Object} metadata - Metadata to validate
   * @returns {Object} Validation result { valid: boolean, errors: string[] }
   */
  export function validateMetadata(metadata) {
    const errors = [];
    
    if (!metadata) {
      return { valid: false, errors: ['Metadata is null or undefined'] };
    }
    
    // Check required fields
    if (!metadata.name) {
      errors.push('Missing required field: name');
    }
    
    if (!metadata.purpose) {
      errors.push('Missing required field: purpose');
    }
    
    // Check types
    if (metadata.interactions && !Array.isArray(metadata.interactions)) {
      errors.push('Field "interactions" must be an array');
    }
    
    if (metadata.props && typeof metadata.props !== 'object') {
      errors.push('Field "props" must be an object');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }