import React, { forwardRef, useId } from 'react';
import { useAartisanContext } from './provider.js';
import { createMetadata } from '../core/metadata.js';

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

export { withAIContext, withAIEnhancement };
//# sourceMappingURL=hoc.js.map
