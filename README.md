# Aartisan - AI Agent Toolkit for React

Aartisan is a comprehensive toolkit for creating React applications that are optimized for AI agent interaction. It helps developers build semantically enhanced components that are more understandable to AI assistants, making your applications more accessible and navigable for both humans and AI.

## 🚀 Features

- **CLI for AI-Optimized React Applications**: Quickly scaffold new projects or enhance existing ones
- **Component Enhancement System**: Multiple approaches to add semantic metadata to your components
- **Semantic Understanding**: Make your components self-describing for AI assistants
- **Vite Plugin Integration**: Build-time optimization and code transformation
- **LLM Integration**: Optional AI-powered component analysis and enhancement

## 📦 Installation

```bash
# Install globally
npm install -g aartisan

# Or use via npx
npx aartisan create my-app
```

## 🛠️ Usage

### Creating a New Project

```bash
# Create a new project with interactive prompts
aartisan create my-app

# Use a specific template
aartisan create my-app --template minimal
```

### Porting an Existing React App

```bash
# Basic usage
aartisan port ./my-react-app --output ./my-aartisan-app
```

### Annotating Components with LLM

```bash
# Enhance components with AI-powered annotations
aartisan annotate ./src/components

# Specify an API key
aartisan annotate ./src/components --api-key YOUR_API_KEY --provider gemini
```

## 🧩 Component Enhancement Approaches

Aartisan offers several methods to enhance your React components with semantic metadata:

### 1. Component Introspection System

The `defineComponent` function provides a comprehensive way to define components with semantic metadata.

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

### 2. Hooks-Based Approach

For function components, the `useAIEnhanced` hook provides a simple way to add metadata.

```jsx
import { useAIEnhanced } from 'aartisan/hooks';

function ProductCard(props) {
  const { ref, aiProps } = useAIEnhanced('product-card', {
    purpose: 'display-product',
    interactions: ['view', 'purchase']
  });
  
  return (
    <div ref={ref} {...aiProps}>
      <h3>{props.name}</h3>
      <p>${props.price}</p>
      <button onClick={props.onAddToCart}>Add to Cart</button>
    </div>
  );
}
```

### 3. Directives Approach

For simpler enhancement needs, use directives to add semantic attributes.

```jsx
import { aiPurpose } from 'aartisan/directives';

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

### 4. Higher-Order Components (HOC)

Ideal for class components or when you want to enhance a component without modifying its implementation.

```jsx
import { withAIEnhancement } from 'aartisan/react';

class ProductCard extends React.Component {
  render() {
    return (
      <div className="card">
        <h3>{this.props.name}</h3>
        <p>${this.props.price}</p>
        <button>Add to Cart</button>
      </div>
    );
  }
}

export default withAIEnhancement({
  name: 'ProductCard',
  semantics: {
    purpose: 'display-product',
    interactions: ['add-to-cart']
  }
})(ProductCard);
```

### 5. LLM-Powered Comment Directives

Add comment directives that will be processed by the `annotate` command.

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

## ⚙️ Vite Plugin Configuration

Aartisan includes a Vite plugin for build-time optimization.

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

## 🤖 AI Integration

Aartisan can use LLMs to automatically analyze and enhance components. This requires an API key from Gemini or Cohere.

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

## 🧠 Context Provider

Use the AartisanProvider at the root of your application to create a shared semantic context:

```jsx
import { AartisanProvider } from 'aartisan/react';

function App() {
  return (
    <AartisanProvider 
      config={{
        appName: 'My E-commerce App',
        appPurpose: 'online-shopping',
        accessibilityLevel: 'AA'
      }}
    >
      <YourApp />
    </AartisanProvider>
  );
}
```

## 📋 CLI Commands

Aartisan provides several commands to help you work with your React applications:

- `create`: Create a new AI-optimized React application
- `port`: Convert an existing React app to use Aartisan features
- `annotate`: Enhance components with LLM-powered semantic analysis

## 🔍 Example

Here's a complete example of an enhanced component:

```jsx
import { useAIEnhanced, useAIContext } from 'aartisan/react';

function ProductDetails({ product, onAddToCart }) {
  const { ref, aiProps } = useAIEnhanced('product-details', {
    purpose: 'display-product-information',
    interactions: ['view', 'add-to-cart']
  });
  
  const { context } = useAIContext();
  
  return (
    <div ref={ref} {...aiProps} className="product-details">
      <img src={product.image} alt={product.name} />
      <h2>{product.name}</h2>
      <p className="price">${product.price}</p>
      <p className="description">{product.description}</p>
      <button 
        onClick={() => {
          onAddToCart(product);
          // Context aware of product state
          context.lastProductAdded = product.id;
        }}
        className="add-to-cart-btn"
      >
        Add to Cart
      </button>
    </div>
  );
}
```
## ⭐️ Performance Improvement 
We've run experiments using Gemini-2.0-Flash and Cohere command-a-03-2025 models on multiple tasks using the concert ticketing template web app. The raw experiment results can be found in the experiment directory, and the visualizations of the aggregate results below illustrate substantial improvements in the AI agents' task completion performance on the web app under the Aartisan framework.

![image](https://github.com/user-attachments/assets/98956d4b-f5cb-4ce6-8f87-3a62194df571)

## 📚 Documentation

For detailed documentation on specific features:

- [Component Enhancement Guide](docs/component-enhancement.md)
- [Porting Guide](docs/porting.md)
- [AI Integration](docs/ai-integration.md)
- [Vite Plugin Options](docs/vite-plugin.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT
