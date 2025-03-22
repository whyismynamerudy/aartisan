# Aartisan - AI Agent Toolkit for React

Aartisan (AI Agent Toolkit for React) is a toolkit for creating React applications optimized for AI agent interaction. It helps developers build React apps with semantically enhanced components that are more understandable by AI agents, making them more accessible and navigable.

## Features

- 🚀 **CLI for Creating AI-Optimized React Applications**: Quickly scaffold new projects with AI optimization built-in
- 🧩 **Component Enhancement System**: Multiple approaches to enhance components with semantic metadata
- 🔌 **Vite Plugin Integration**: Build-time optimization and code transformation
- 🤖 **LLM Integration**: Automatic component analysis and enhancement (requires API key)
- 🧠 **Semantic Metadata**: Make your components self-describing for AI assistants

## Installation

```bash
# Install globally
npm install -g aartisan

# Or use via npx
npx aartisan create my-app
```

## Usage

### Creating a New Project

```bash
# Create a new project with interactive prompts
aartisan create my-app

# Use a specific template
aartisan create my-app --template e-commerce

# Skip prompts with yes flag
aartisan create my-app --template minimal --yes
```

### Analyzing Existing Components

```bash
# Analyze components in a directory
aartisan analyze src/components

# Specify output format
aartisan analyze src/components --format json
```

### Porting an Existing App

```bash
# Port an existing React app to use aartisan
aartisan port ./my-existing-app --output ./my-aartisan-app
```

## Component Enhancement Approaches

### 1. Component Introspection System

```jsx
import { defineComponent } from 'aartisan/react';

const ProductCard = defineComponent({
  name: 'ProductCard',
  semantics: {
    purpose: 'display-product',
    interactions: ['view-details', 'add-to-cart'],
  },
  render: (props) => (
    <div className="card">
      <img src={props.image} alt={props.name} />
      <h3>{props.name}</h3>
      <p>${props.price}</p>
      <button>Add to Cart</button>
    </div>
  )
});
```

### 2. Component Directives

```jsx
import { directive } from 'aartisan/directives';

// Define a directive
const aiPurpose = directive((element, purpose) => {
  element.setAttribute('data-ai-purpose', purpose);
});

// Use in a component
function ProductCard({ name, price }) {
  return (
    <div {...aiPurpose('product-display')}>
      <h3>{name}</h3>
      <p>${price}</p>
      <button {...aiPurpose('add-to-cart')}>Add to Cart</button>
    </div>
  );
}
```

### 3. Hooks-Based Approach

```jsx
import { useAIEnhanced } from 'aartisan/hooks';

function ProductCard(props) {
  const { ref, aiProps } = useAIEnhanced('product-card', {
    purpose: 'display-product',
    interactions: ['view', 'purchase']
  });
  
  return (
    <div ref={ref} {...aiProps}>
      {/* Component content */}
    </div>
  );
}
```

### 4. LLM-Powered Comment Directives

```jsx
// @aartisan:analyze
function ProductCard({ name, price, image, onAddToCart }) {
  return (
    <div className="product-card">
      <img src={image} alt={name} />
      <h3>{name}</h3>
      <p className="price">${price}</p>
      <button onClick={onAddToCart}>Add to Cart</button>
    </div>
  );
}
```

## Vite Plugin Configuration

```js
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import aartisan from 'aartisan-vite-plugin';

export default defineConfig({
  plugins: [
    react(),
    aartisan({
      optimizationLevel: 'advanced', // 'basic', 'standard', 'advanced'
      accessibilityFeatures: true,
      culturalContexts: ['global', 'western', 'eastern']
    })
  ]
});
```

## AI Integration

Aartisan can use LLMs (like Gemini or Cohere) to automatically analyze and enhance components. This requires an API key.

```js
// Configure in your application
import { initializeProviders } from 'aartisan/ai';

// Initialize AI providers
await initializeProviders({
  geminiApiKey: process.env.GEMINI_API_KEY,
  // or
  cohereApiKey: process.env.COHERE_API_KEY
});
```

## Documentation

For more detailed documentation, examples, and API reference, please visit the [full documentation](https://github.com/yourusername/aartisan).

## License

MIT