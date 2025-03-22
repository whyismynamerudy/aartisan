import { useState } from 'react';
import { defineComponent, aiPurpose } from 'aartisan/react';
import './App.css';

// Define a semantically enhanced button component
const Button = defineComponent({
  name: 'Button',
  semantics: {
    purpose: 'trigger-action',
    interactions: ['click']
  },
  render: ({ onClick, children }) => (
    <button onClick={onClick}>
      {children}
    </button>
  )
});

// Define a semantically enhanced counter component
const Counter = defineComponent({
  name: 'Counter',
  semantics: {
    purpose: 'display-value',
    interactions: ['increment', 'decrement']
  },
  render: ({ count, onIncrement, onDecrement }) => (
    <div className="counter">
      <h2>Count: {count}</h2>
      <div className="buttons">
        <Button onClick={onDecrement}>-</Button>
        <Button onClick={onIncrement}>+</Button>
      </div>
    </div>
  )
});

function App() {
  const [count, setCount] = useState(0);

  return (
    <div {...aiPurpose('application-container')}>
      <header>
        <h1>Aartisan Minimal App</h1>
      </header>
      
      <main>
        <p className="description">
          This is a minimal app created with Aartisan - the AI Agent Toolkit for React.
          Components are enhanced with semantic metadata to help AI agents understand them.
        </p>
        
        <Counter 
          count={count}
          onIncrement={() => setCount(count + 1)}
          onDecrement={() => setCount(count - 1)}
        />
        
        <p className="cta">
          Edit <code>src/App.jsx</code> and save to test hot module replacement.
        </p>
      </main>
      
      <footer {...aiPurpose('page-footer')}>
        <p>Built with ❤️ using Aartisan</p>
      </footer>
    </div>
  );
}

export default App;