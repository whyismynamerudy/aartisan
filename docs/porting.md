# Aartisan Porting Guide

The Aartisan Porting Tool helps you convert existing React applications into AI-optimized applications using the Aartisan framework. This guide covers how to use the porting tool, understand its features, and get the most out of your AI-enhanced React components.

## Overview

The `port` command analyzes your existing React codebase and enhances it with Aartisan's semantic metadata system, making your components more understandable to AI agents. It preserves all your original functionality while adding a layer of AI optimization.

## Features

- **Project Analysis**: Scans and analyzes your React component structure
- **Component Enhancement**: Adds semantic metadata to components based on their purpose and behavior
- **AI Integration**: Optional enhancement using Gemini or Cohere AI models
- **Configuration Updating**: Automatically updates build configuration (Vite, Webpack, etc.)
- **Multiple Enhancement Strategies**: Uses the most appropriate enhancement method for each component

## Usage

```bash
# Basic usage
npx aartisan port ./my-react-app

# Specify output directory
npx aartisan port ./my-react-app -o ./my-enhanced-app

# Use AI enhancement (with Gemini)
npx aartisan port ./my-react-app --ai-provider gemini --api-key YOUR_API_KEY

# Use AI enhancement (with Cohere)
npx aartisan port ./my-react-app --ai-provider cohere --api-key YOUR_API_KEY

# Set enhancement level
npx aartisan port ./my-react-app --level advanced

# Skip confirmation prompts
npx aartisan port ./my-react-app --yes

# Enable verbose logging
npx aartisan port ./my-react-app --verbose
```

## Enhancement Levels

The porting tool offers three levels of component enhancement:

### Basic Enhancement (`--level basic`)

Uses a straightforward approach that adds data attributes to existing components:

```jsx
// Original component
function Button({ onClick, children }) {
  return <button onClick={onClick}>{children}</button>;
}

// Enhanced with basic level
function Button({ onClick, children }) {
  return (
    <button 
      onClick={onClick}
      data-aartisan="true"
      data-aartisan-purpose="action-button"
      data-aartisan-component="Button"
    >
      {children}
    </button>
  );
}
```

### Standard Enhancement (`--level standard`, default)

Uses Aartisan's hook-based approach for richer semantic metadata:

```jsx
// Original component
function ProductCard({ name, price, onAddToCart }) {
  return (
    <div className="product-card">
      <h3>{name}</h3>
      <p>${price}</p>
      <button onClick={onAddToCart}>Add to Cart</button>
    </div>
  );
}

// Enhanced with standard level
import { useAIEnhanced } from 'aartisan/react';

function ProductCard({ name, price, onAddToCart }) {
  const { ref, aiProps } = useAIEnhanced('ProductCard', {
    purpose: 'display-product',
    interactions: ['click']
  });
  
  return (
    <div ref={ref} {...aiProps} className="product-card">
      <h3>{name}</h3>
      <p>${price}</p>
      <button onClick={onAddToCart}>Add to Cart</button>
    </div>
  );
}
```

### Advanced Enhancement (`--level advanced`)

Uses Aartisan's `defineComponent` approach for the most comprehensive metadata:

```jsx
// Original component
function Button({ onClick, children, variant = 'primary' }) {
  return (
    <button 
      onClick={onClick}
      className={variant === 'primary' ? 'btn-primary' : 'btn-secondary'}
    >
      {children}
    </button>
  );
}

// Enhanced with advanced level
import { defineComponent } from 'aartisan/react';

const Button = defineComponent({
  name: 'Button',
  semantics: {
    purpose: 'action-button',
    interactions: ['click']
  },
  render: ({ onClick, children, variant = 'primary' }) => (
    <button 
      onClick={onClick}
      className={variant === 'primary' ? 'btn-primary' : 'btn-secondary'}
    >
      {children}
    </button>
  )
});
```

## AI Enhancement

When you provide an API key for Gemini or Cohere, the porting tool uses AI to:

1. **Analyze Component Purpose**: More accurately determine what your component does
2. **Suggest Semantic Metadata**: Generate richer, more accurate semantic descriptions
3. **Identify Potential Issues**: Highlight accessibility and semantic clarity issues
4. **Enhance Component Relationships**: Understand how components interact with each other

### AI Provider Differences

- **Gemini**: Excels at accessibility analysis and component purpose detection
- **Cohere**: Stronger at semantic analysis and understanding component relationships

## Project Structure

After porting, your project will have these Aartisan-specific additions:

- **AartisanProvider**: Added to your application root
- **Enhanced Components**: Modified with appropriate semantic metadata
- **Updated Configuration**: Build system configured with Aartisan plugins
- **Documentation**: README updated with Aartisan information

## Build System Integration

### Vite

For Vite projects, the tool adds the Aartisan plugin to `vite.config.js`:

```js
// Updated vite.config.js
import aartisan from 'aartisan/vite-plugin';

export default defineConfig({
  plugins: [
    react(),
    aartisan({
      optimizationLevel: 'standard',
      accessibilityFeatures: true
    })
  ]
});
```

### Webpack & Create React App

For Webpack and CRA projects, similar configurations are added to maintain compatibility.

## Troubleshooting

### Common Issues

- **Component not enhanced**: Some complex components may not be automatically enhanced. Use verbose mode to identify them.
- **Build errors after porting**: Ensure all dependencies are installed with `npm install`.
- **AI enhancement failures**: Check your API key and internet connection.

### Manual Fixes

If automatic porting misses some components, you can manually enhance them using:

```jsx
// For function components
import { useAIEnhanced } from 'aartisan/react';

// For class components
import { withAIEnhancement } from 'aartisan/react';
```

## Best Practices

1. **Start with standard level**: Begin with the default enhancement level before trying advanced.
2. **Use AI enhancement when possible**: AI-based enhancement provides the most accurate metadata.
3. **Review after porting**: Check enhanced components to ensure they maintain original functionality.
4. **Customize semantic metadata**: Refine the AI-generated metadata for more accurate descriptions.

## Next Steps

After porting your application:

1. Review the enhanced components
2. Add the Aartisan Provider to any entry points that were missed
3. Fine-tune component metadata where needed
4. Add Aartisan hooks to any components that were not automatically enhanced