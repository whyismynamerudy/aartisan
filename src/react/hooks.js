import { useRef, useEffect, useState, useCallback, useId } from 'react';
import { useAartisanContext } from './provider.jsx';
import { createMetadata } from '../core/metadata.js';

/**
 * Hook to enhance a component for AI understanding
 * @param {string} name - Component name
 * @param {Object} semantics - Semantic metadata
 * @returns {Object} - Ref and props to apply to the component
 */
export function useAIEnhanced(name, semantics = {}) {
  const elementRef = useRef(null);
  const componentId = useId();
  const { registerComponent, unregisterComponent, debug } = useAartisanContext();
  
  // Create metadata
  const metadata = createMetadata({
    name,
    purpose: semantics.purpose,
    interactions: semantics.interactions,
    semantics
  });
  
  // Register component when mounted
  useEffect(() => {
    if (elementRef.current) {
      registerComponent(componentId, metadata);
      
      return () => {
        unregisterComponent(componentId);
      };
    }
  }, [componentId, registerComponent, unregisterComponent]);
  
  // Data attributes for the component
  const aiProps = {
    'data-aartisan': true,
    'data-aartisan-id': componentId,
    'data-aartisan-name': name,
    'data-aartisan-purpose': semantics.purpose || ''
  };
  
  return { ref: elementRef, aiProps };
}

/**
 * Hook to access and update AI context
 * @param {Object} initialContext - Initial context data
 * @returns {Object} Context and update function
 */
export function useAIContext(initialContext = {}) {
  const { semanticContext, updateSemanticContext } = useAartisanContext();
  
  // Initialize context if provided
  useEffect(() => {
    if (Object.keys(initialContext).length > 0) {
      updateSemanticContext(initialContext);
    }
  }, []);
  
  return {
    context: semanticContext,
    updateContext: updateSemanticContext
  };
}

/**
 * Hook to define and handle AI interactions
 * @param {Object} interactions - Map of interaction handlers
 * @returns {Object} Interaction handlers
 */
export function useAIInteraction(interactions = {}) {
  const { debug } = useAartisanContext();
  const [activeInteraction, setActiveInteraction] = useState(null);
  
  // Wrap handlers to include metadata
  const enhancedInteractions = Object.entries(interactions).reduce(
    (acc, [name, handler]) => {
      acc[name] = (...args) => {
        if (debug) {
          console.log(`[Aartisan] Interaction: ${name}`, args);
        }
        
        setActiveInteraction(name);
        const result = handler(...args);
        setActiveInteraction(null);
        
        return result;
      };
      return acc;
    },
    {}
  );
  
  return {
    interactions: enhancedInteractions,
    activeInteraction,
    isInteracting: activeInteraction !== null
  };
}