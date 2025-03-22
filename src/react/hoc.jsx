import React, { forwardRef, useId } from 'react';
import { useAartisanContext } from './provider.jsx';
import { createMetadata } from '../core/metadata.js';

/**
 * Higher-order component to enhance a component with AI metadata
 * @param {Object} options - Enhancement options
 * @param {string} options.name - Component name
 * @param {Object} options.semantics - Semantic metadata
 * @returns {Function} HOC wrapper function
 */
export function withAIEnhancement(options = {}) {
  const { name, semantics = {} } = options;
  
  // Create metadata
  const metadata = createMetadata({
    name: name || 'EnhancedComponent',
    purpose: semantics.purpose,
    interactions: semantics.interactions,
    semantics
  });
  
  // Return the HOC
  return (WrappedComponent) => {
    // Create an enhanced component
    const EnhancedComponent = forwardRef((props, ref) => {
      const componentId = useId();
      const { registerComponent, unregisterComponent } = useAartisanContext();
      
      // Register on mount
      React.useEffect(() => {
        registerComponent(componentId, {
          ...metadata,
          instanceProps: props
        });
        
        return () => {
          unregisterComponent(componentId);
        };
      }, []);
      
      // Data attributes for AI understanding
      const aiProps = {
        'data-aartisan': true,
        'data-aartisan-id': componentId,
        'data-aartisan-name': metadata.name,
        'data-aartisan-purpose': semantics.purpose || ''
      };
      
      // Render the wrapped component with AI props
      return <WrappedComponent {...props} {...aiProps} ref={ref} />;
    });
    
    // Add metadata and display name
    EnhancedComponent.displayName = `withAIEnhancement(${
      WrappedComponent.displayName || WrappedComponent.name || 'Component'
    })`;
    EnhancedComponent.__aartisan = metadata;
    
    return EnhancedComponent;
  };
}

/**
 * Higher-order component to provide AI context
 * @param {Object} context - AI context data
 * @returns {Function} HOC wrapper function
 */
export function withAIContext(context = {}) {
  return (WrappedComponent) => {
    // Create a context provider component
    const WithAIContext = (props) => {
      const { updateSemanticContext } = useAartisanContext();
      
      // Update context on mount
      React.useEffect(() => {
        updateSemanticContext(context);
      }, []);
      
      // Render the wrapped component
      return <WrappedComponent {...props} />;
    };
    
    // Add display name
    WithAIContext.displayName = `withAIContext(${
      WrappedComponent.displayName || WrappedComponent.name || 'Component'
    })`;
    
    return WithAIContext;
  };
}