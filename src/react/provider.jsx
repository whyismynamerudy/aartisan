import React, { createContext, useContext, useState, useEffect } from 'react';
import { createContext as createAIContext } from '../core/index.js';

// Create the context
const AartisanContext = createContext(null);

/**
 * Provider component for Aartisan functionality
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {Object} props.config - Configuration options
 * @param {boolean} props.debug - Enable debug mode
 * @returns {React.ReactElement} Provider component
 */
export function AartisanProvider({ 
  children, 
  config = {}, 
  debug = false 
}) {
  const [contextValue, setContextValue] = useState(() => ({
    config,
    debug,
    semanticContext: createAIContext(config),
    enhancedComponents: new Map(),
    version: '0.1.0'
  }));
  
  // Update context if config or debug changes
  useEffect(() => {
    setContextValue(prevContext => ({
      ...prevContext,
      config,
      debug,
      semanticContext: createAIContext(config)
    }));
  }, [config, debug]);
  
  /**
   * Registers an enhanced component in the context
   * @param {string} id - Component ID
   * @param {Object} metadata - Component metadata
   */
  const registerComponent = (id, metadata) => {
    setContextValue(prevContext => {
      const enhancedComponents = new Map(prevContext.enhancedComponents);
      enhancedComponents.set(id, metadata);
      
      return {
        ...prevContext,
        enhancedComponents
      };
    });
    
    if (debug) {
      console.log(`[Aartisan] Registered component: ${id}`, metadata);
    }
  };
  
  /**
   * Unregisters a component from the context
   * @param {string} id - Component ID
   */
  const unregisterComponent = (id) => {
    setContextValue(prevContext => {
      const enhancedComponents = new Map(prevContext.enhancedComponents);
      enhancedComponents.delete(id);
      
      return {
        ...prevContext,
        enhancedComponents
      };
    });
    
    if (debug) {
      console.log(`[Aartisan] Unregistered component: ${id}`);
    }
  };
  
  /**
   * Updates the semantic context
   * @param {Object} newContext - New context data
   */
  const updateSemanticContext = (newContext) => {
    setContextValue(prevContext => ({
      ...prevContext,
      semanticContext: {
        ...prevContext.semanticContext,
        ...newContext,
        updated: new Date().toISOString()
      }
    }));
  };
  
  const value = {
    ...contextValue,
    registerComponent,
    unregisterComponent,
    updateSemanticContext
  };
  
  return (
    <AartisanContext.Provider value={value}>
      {children}
    </AartisanContext.Provider>
  );
}

/**
 * Hook to access the Aartisan context
 * @returns {Object} Aartisan context
 */
export function useAartisanContext() {
  const context = useContext(AartisanContext);
  if (!context) {
    throw new Error('useAartisanContext must be used within an AartisanProvider');
  }
  return context;
}