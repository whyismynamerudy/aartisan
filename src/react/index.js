/**
 * aartisan - React integration
 * Main React module exports
 */

// Export component definition
export { defineComponent } from './defineComponent.jsx';

// Export provider
export { AartisanProvider, useAartisanContext } from './provider.jsx';

// Export hooks
export { 
  useAIEnhanced,
  useAIContext, 
  useAIInteraction
} from './hooks.js';

// Export directives
export { 
  directive, 
  aiPurpose, 
  aiInteraction, 
  aiDescription 
} from './directives.js';

// Export higher-order components
export { 
  withAIEnhancement,
  withAIContext
} from './hoc.jsx';