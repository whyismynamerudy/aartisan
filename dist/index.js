import React, { useState, useEffect, createContext as createContext$1, useContext, forwardRef, useId, useRef } from 'react';

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
function createMetadata({
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
function getMetadata(element) {
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
function enhanceMetadata(metadata, enhancement) {
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
 * aartisan - Core functionality
 */

/**
 * Creates a semantically enhanced component or element
 * @param {Object} element - The React element or component to enhance
 * @param {Object} semantics - Semantic metadata for the element
 * @returns {Object} Enhanced element
 */
function enhance(element, semantics = {}) {
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
function isEnhanced(element) {
  return element && element.__aartisan && element.__aartisan.enhanced === true;
}

/**
 * Creates a semantic context object for AI agent understanding
 * @param {Object} options - Context options
 * @returns {Object} Semantic context object
 */
function createContext(options = {}) {
  return {
    type: 'aartisan-context',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    ...options
  };
}

// Create the context
const AartisanContext = /*#__PURE__*/createContext$1(null);

/**
 * Provider component for Aartisan functionality
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {Object} props.config - Configuration options
 * @param {boolean} props.debug - Enable debug mode
 * @returns {React.ReactElement} Provider component
 */
function AartisanProvider({
  children,
  config = {},
  debug = false
}) {
  const [contextValue, setContextValue] = useState(() => ({
    config,
    debug,
    semanticContext: createContext(config),
    enhancedComponents: new Map(),
    version: '0.1.0'
  }));

  // Update context if config or debug changes
  useEffect(() => {
    setContextValue(prevContext => ({
      ...prevContext,
      config,
      debug,
      semanticContext: createContext(config)
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
  const unregisterComponent = id => {
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
  const updateSemanticContext = newContext => {
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
  return /*#__PURE__*/React.createElement(AartisanContext.Provider, {
    value: value
  }, children);
}

/**
 * Hook to access the Aartisan context
 * @returns {Object} Aartisan context
 */
function useAartisanContext() {
  const context = useContext(AartisanContext);
  if (!context) {
    throw new Error('useAartisanContext must be used within an AartisanProvider');
  }
  return context;
}

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
function defineComponent({
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
  const EnhancedComponent = /*#__PURE__*/forwardRef((props, ref) => {
    const {
      registerComponent,
      unregisterComponent,
      debug
    } = useAartisanContext();
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
      console.log(`[Aartisan] Rendering ${name}`, {
        props,
        metadata
      });
    }

    // Add semantic metadata to rendered output
    const dataAttributes = {
      'data-aartisan': true,
      'data-aartisan-id': componentId,
      'data-aartisan-name': name,
      'data-aartisan-purpose': semantics.purpose || ''
    };

    // Call the render function with props and ref
    const rendered = render({
      ...props,
      ref
    });

    // If the rendered result is a React element, clone it and add metadata
    if (/*#__PURE__*/React.isValidElement(rendered)) {
      return /*#__PURE__*/React.cloneElement(rendered, {
        ...rendered.props,
        ...dataAttributes,
        ref: rendered.ref || ref
      });
    }

    // Otherwise, wrap it in a div with metadata
    return /*#__PURE__*/React.createElement("div", dataAttributes, rendered);
  });

  // Add metadata to component for introspection
  EnhancedComponent.displayName = `Aartisan(${name})`;
  EnhancedComponent.__aartisan = metadata;

  // Add static methods for metadata access
  EnhancedComponent.getMetadata = () => metadata;
  EnhancedComponent.getSemantics = () => semantics;
  return EnhancedComponent;
}

/**
 * Hook to enhance a component for AI understanding
 * @param {string} name - Component name
 * @param {Object} semantics - Semantic metadata
 * @returns {Object} - Ref and props to apply to the component
 */
function useAIEnhanced(name, semantics = {}) {
  const elementRef = useRef(null);
  const componentId = useId();
  const {
    registerComponent,
    unregisterComponent,
    debug
  } = useAartisanContext();

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
  return {
    ref: elementRef,
    aiProps
  };
}

/**
 * Hook to access and update AI context
 * @param {Object} initialContext - Initial context data
 * @returns {Object} Context and update function
 */
function useAIContext(initialContext = {}) {
  const {
    semanticContext,
    updateSemanticContext
  } = useAartisanContext();

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
function useAIInteraction(interactions = {}) {
  const {
    debug
  } = useAartisanContext();
  const [activeInteraction, setActiveInteraction] = useState(null);

  // Wrap handlers to include metadata
  const enhancedInteractions = Object.entries(interactions).reduce((acc, [name, handler]) => {
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
  }, {});
  return {
    interactions: enhancedInteractions,
    activeInteraction,
    isInteracting: activeInteraction !== null
  };
}

/**
 * aartisan - Directive system
 * 
 * Provides a way to add semantic metadata to JSX elements
 * through attribute-like directives.
 */

/**
 * Creates a directive function to enhance elements
 * @param {Function} fn - Directive implementation
 * @returns {Function} Directive function
 */
function directive(fn) {
  return (...args) => {
    return (props = {}) => {
      const element = document.createElement('div');

      // Apply the directive to the element
      fn(element, ...args);

      // Convert DOM attributes to React props
      const attributeProps = {};
      for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i];
        attributeProps[attr.name] = attr.value;
      }
      return {
        ...props,
        ...attributeProps
      };
    };
  };
}

/**
 * Directive to specify the purpose of an element
 * @type {Function}
 */
const aiPurpose = directive((element, purpose) => {
  element.setAttribute('data-aartisan', 'true');
  element.setAttribute('data-aartisan-purpose', purpose);
});

/**
 * Directive to specify possible interactions
 * @type {Function}
 */
const aiInteraction = directive((element, interaction) => {
  element.setAttribute('data-aartisan', 'true');
  element.setAttribute('data-aartisan-interaction', interaction);
});

/**
 * Directive to add a description for AI understanding
 * @type {Function}
 */
const aiDescription = directive((element, description) => {
  element.setAttribute('data-aartisan', 'true');
  element.setAttribute('data-aartisan-description', description);
});

function _extends() {
  return _extends = Object.assign ? Object.assign.bind() : function (n) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
    }
    return n;
  }, _extends.apply(null, arguments);
}

/**
 * Higher-order component to enhance a component with AI metadata
 * @param {Object} options - Enhancement options
 * @param {string} options.name - Component name
 * @param {Object} options.semantics - Semantic metadata
 * @returns {Function} HOC wrapper function
 */
function withAIEnhancement(options = {}) {
  const {
    name,
    semantics = {}
  } = options;

  // Create metadata
  const metadata = createMetadata({
    name: name || 'EnhancedComponent',
    purpose: semantics.purpose,
    interactions: semantics.interactions,
    semantics
  });

  // Return the HOC
  return WrappedComponent => {
    // Create an enhanced component
    const EnhancedComponent = /*#__PURE__*/forwardRef((props, ref) => {
      const componentId = useId();
      const {
        registerComponent,
        unregisterComponent
      } = useAartisanContext();

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
      return /*#__PURE__*/React.createElement(WrappedComponent, _extends({}, props, aiProps, {
        ref: ref
      }));
    });

    // Add metadata and display name
    EnhancedComponent.displayName = `withAIEnhancement(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
    EnhancedComponent.__aartisan = metadata;
    return EnhancedComponent;
  };
}

/**
 * Higher-order component to provide AI context
 * @param {Object} context - AI context data
 * @returns {Function} HOC wrapper function
 */
function withAIContext(context = {}) {
  return WrappedComponent => {
    // Create a context provider component
    const WithAIContext = props => {
      const {
        updateSemanticContext
      } = useAartisanContext();

      // Update context on mount
      React.useEffect(() => {
        updateSemanticContext(context);
      }, []);

      // Render the wrapped component
      return /*#__PURE__*/React.createElement(WrappedComponent, props);
    };

    // Add display name
    WithAIContext.displayName = `withAIContext(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
    return WithAIContext;
  };
}

/**
 * aartisan - AI Agent Toolkit for React
 * Main package entry point
 */


// Version information
const version = '0.1.0';

// Package metadata
const metadata = {
  name: 'aartisan',
  description: 'AI Agent Toolkit for React - Create React applications optimized for AI interaction',
  repository: 'https://github.com/whyismynamerudy/aartisan',
  author: 'Your Name',
  license: 'MIT'
};

export { AartisanProvider, aiDescription, aiInteraction, aiPurpose, createContext, createMetadata, defineComponent, directive, enhance, enhanceMetadata, getMetadata, isEnhanced, metadata, useAIContext, useAIEnhanced, useAIInteraction, useAartisanContext, version, withAIContext, withAIEnhancement };
//# sourceMappingURL=index.js.map
