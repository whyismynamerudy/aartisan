import React, { forwardRef, useEffect, useId } from 'react';
import { createMetadata } from '../core/metadata.js';
import { useAartisanContext } from './provider.jsx';

/**
 * Defines a semantically enhanced React component
 * @param {Object} options - Component options
 * @param {string} options.name - Component name
 * @param {Object} options.semantics - Semantic metadata
 * @param {string} options.semantics.purpose - Purpose of the component
 * @param {string[]} options.semantics.interactions - Possible interactions
 * @param {Object} options.props - Props description
 * @param {Function|React.Component} options.render - Component render function or class
 * @returns {React.ForwardRefExoticComponent} Enhanced React component
 */
export function defineComponent({
  name,
  semantics = {},
  props = {},
  render
}) {
  // Create component metadata
  const metadata = createMetadata({
    name,
    purpose: semantics.purpose,
    interactions: semantics.interactions,
    props,
    semantics
  });
  
  // Create the enhanced component
  const EnhancedComponent = forwardRef((props, ref) => {
    const { registerComponent, unregisterComponent, debug } = useAartisanContext();
    const componentId = useId();
    
    useEffect(() => {
      // Register component when mounted
      registerComponent(componentId, {
        ...metadata,
        instanceProps: props
      });
      
      // Unregister when unmounted
      return () => {
        unregisterComponent(componentId);
      };
    }, []);
    
    // Log render if in debug mode
    if (debug) {
      console.log(`[Aartisan] Rendering ${name}`, { props, metadata });
    }
    
    // Add semantic metadata to rendered output
    const dataAttributes = {
      'data-aartisan': true,
      'data-aartisan-id': componentId,
      'data-aartisan-name': name,
      'data-aartisan-purpose': semantics.purpose || ''
    };
    
    // Call the render function with props and ref
    const rendered = render({ ...props, ref });
    
    // If the rendered result is a React element, clone it and add metadata
    if (React.isValidElement(rendered)) {
      return React.cloneElement(rendered, {
        ...rendered.props,
        ...dataAttributes,
        ref: rendered.ref || ref
      });
    }
    
    // Otherwise, wrap it in a div with metadata
    return (
      <div {...dataAttributes}>
        {rendered}
      </div>
    );
  });
  
  // Add metadata to component for introspection
  EnhancedComponent.displayName = `Aartisan(${name})`;
  EnhancedComponent.__aartisan = metadata;
  
  // Add static methods for metadata access
  EnhancedComponent.getMetadata = () => metadata;
  EnhancedComponent.getSemantics = () => semantics;
  
  return EnhancedComponent;
}