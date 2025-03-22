import { useState } from 'react';
import { defineComponent } from 'aartisan/react';

// Define a semantically enhanced button component
const Button = defineComponent({
  name: 'Button',
  semantics: {
    purpose: 'trigger-action',
    interactions: ['click']
  },
  render: ({ onClick, children, variant = 'primary' }) => (
    <button 
      onClick={onClick}
      className={`px-4 py-2 rounded font-medium ${
        variant === 'primary' 
          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
          : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
      }`}
    >
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
    <div className="flex flex-col items-center space-y-4 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold">Count: {count}</h2>
      <div className="flex space-x-4">
        <Button onClick={onDecrement} variant="secondary">-</Button>
        <Button onClick={onIncrement}>+</Button>
      </div>
    </div>
  )
});

export default function Home() {
  const [count, setCount] = useState(0);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <section className="bg-blue-50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Welcome to Aartisan</h2>
        <p className="mb-4">
          This is a minimal app template created with Aartisan - the AI Agent Toolkit for React.
          Components are enhanced with semantic metadata to help AI agents understand them better.
        </p>
        <p>
          Edit <code className="bg-gray-100 px-1 py-0.5 rounded text-blue-600">src/routes/home.tsx</code> to get started.
        </p>
      </section>
      
      <div className="flex justify-center">
        <Counter 
          count={count}
          onIncrement={() => setCount(prev => prev + 1)}
          onDecrement={() => setCount(prev => prev - 1)}
        />
      </div>
    </div>
  );
}