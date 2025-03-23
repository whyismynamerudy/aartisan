/**
 * aartisan - AI Component Analysis
 * 
 * Analyzes React components using LLMs to extract semantic information
 * and enhance them for AI agent understanding.
 */
import fs from 'fs-extra';
import path from 'path';
import * as parser from '@babel/parser';
import * as traverseModule from '@babel/traverse';
import * as t from '@babel/types';
import * as generateModule from '@babel/generator';
const traverse = traverseModule.default || traverseModule;
const generate = generateModule.default || generateModule;
import { createMetadata } from '../core/metadata.js';
import { getBestProvider, isAIAvailable } from './index.js';

/**
 * Analyzes React components in a directory
 * @param {string} sourceDir - Source directory
 * @param {Object} options - Analysis options
 * @returns {Promise<Object>} Analysis results
 */
export async function analyzeComponents(sourceDir, options = {}) {
  const files = await findReactFiles(sourceDir);
  
  const results = {
    totalFiles: files.length,
    analyzedComponents: 0,
    enhancedComponents: 0,
    components: []
  };
  
  for (const file of files) {
    const fileResults = await analyzeFile(file, options);
    results.analyzedComponents += fileResults.analyzedComponents;
    results.enhancedComponents += fileResults.enhancedComponents;
    results.components.push(...fileResults.components);
  }
  
  return results;
}

/**
 * Finds React files in a directory
 * @param {string} sourceDir - Source directory
 * @returns {Promise<string[]>} List of file paths
 */
async function findReactFiles(sourceDir) {
  const reactExtensions = ['.jsx', '.tsx'];
  const files = [];
  
  // Recursively find files
  async function findFiles(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules
        if (entry.name !== 'node_modules') {
          await findFiles(fullPath);
        }
      } else if (entry.isFile()) {
        // Check extension
        const ext = path.extname(entry.name);
        if (reactExtensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }
  
  await findFiles(sourceDir);
  return files;
}

/**
 * Analyzes a single React file
 * @param {string} filePath - File path
 * @param {Object} options - Analysis options
 * @returns {Promise<Object>} Analysis results
 */
async function analyzeFile(filePath, options) {
  const fileContent = await fs.readFile(filePath, 'utf-8');
  
  // Parse the file
  const ast = parser.parse(fileContent, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
  });
  
  const results = {
    filePath,
    analyzedComponents: 0,
    enhancedComponents: 0,
    components: []
  };
  
  // Find components
  traverse(ast, {
    // Function components
    FunctionDeclaration(path) {
      if (isReactComponent(path)) {
        const component = extractComponent(path, filePath);
        if (component) {
          results.analyzedComponents++;
          results.components.push(component);
        }
      }
    },
    // Arrow function components
    VariableDeclarator(path) {
      if (t.isArrowFunctionExpression(path.node.init) && isReactComponent(path)) {
        const component = extractComponent(path, filePath);
        if (component) {
          results.analyzedComponents++;
          results.components.push(component);
        }
      }
    },
    // Class components
    ClassDeclaration(path) {
      if (isReactClassComponent(path)) {
        const component = extractClassComponent(path, filePath);
        if (component) {
          results.analyzedComponents++;
          results.components.push(component);
        }
      }
    }
  });
  
  // For each component, analyze and enhance
  for (const component of results.components) {
    await enhanceWithAI(component, options);
    results.enhancedComponents++;
  }
  
  return results;
}

/**
 * Analyzes a React component using AI
 * @param {Object} component - Component information
 * @param {Object} options - Analysis options
 * @returns {Promise<Object>} Enhanced component metadata
 */
export async function analyzeComponentWithAI(component, options = {}) {
  if (!isAIAvailable()) {
    return fallbackAnalysis(component);
  }
  
  const provider = getBestProvider();
  if (!provider) {
    return fallbackAnalysis(component);
  }
  
  try {
    if (provider.id === 'gemini') {
      return await analyzeWithGemini(component, options);
    } else if (provider.id === 'cohere') {
      return await analyzeWithCohere(component, options);
    } else {
      return fallbackAnalysis(component);
    }
  } catch (error) {
    console.warn(`AI analysis failed: ${error.message}`);
    return fallbackAnalysis(component);
  }
}

/**
 * Fallback analysis when AI is not available
 * @param {Object} component - Component information
 * @returns {Object} Basic component metadata
 */
function fallbackAnalysis(component) {
  // Infer purpose from component name and structure
  const purpose = inferPurpose(component.name, component.code || '');
  
  // Extract interactions from event handlers
  const interactions = component.eventHandlers
    ? component.eventHandlers
        .filter(handler => handler.startsWith('on'))
        .map(handler => handler.replace(/^on/, '').toLowerCase())
    : inferInteractions(component.code || '');
  
  return createMetadata({
    name: component.name,
    purpose,
    interactions,
    semantics: {
      aiGenerated: false,
      accessibilityLevel: 'medium',
      complexity: determineComplexity(component)
    }
  });
}

/**
 * Analyzes a component using Gemini AI
 * @param {Object} component - Component information
 * @param {Object} options - Analysis options
 * @returns {Promise<Object>} Enhanced component metadata
 */
async function analyzeWithGemini(component, options) {
  // In a real implementation, this would call the Gemini API
  // For demonstration, we'll use a more advanced fallback
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Generate more detailed metadata than the fallback
  const purpose = inferPurpose(component.name, component.code || '');
  
  // Extract interactions from event handlers
  const interactions = component.eventHandlers
    ? component.eventHandlers
        .filter(handler => handler.startsWith('on'))
        .map(handler => handler.replace(/^on/, '').toLowerCase())
    : inferInteractions(component.code || '');
  
  // Add additional semantic information
  const semantics = {
    aiGenerated: true,
    aiModel: 'gemini',
    accessibilityLevel: determineAccessibilityLevel(component),
    complexity: determineComplexity(component),
    suggestedImprovements: suggestImprovements(component)
  };
  
  return createMetadata({
    name: component.name,
    purpose,
    interactions,
    semantics
  });
}

/**
 * Analyzes a component using Cohere AI
 * @param {Object} component - Component information
 * @param {Object} options - Analysis options
 * @returns {Promise<Object>} Enhanced component metadata
 */
async function analyzeWithCohere(component, options) {
  // Similar to Gemini implementation but would use Cohere API
  // For demonstration, we'll use a slightly different fallback
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 250));
  
  const purpose = inferPurpose(component.name, component.code || '');
  
  // Extract interactions from event handlers
  const interactions = component.eventHandlers
    ? component.eventHandlers
        .filter(handler => handler.startsWith('on'))
        .map(handler => handler.replace(/^on/, '').toLowerCase())
    : inferInteractions(component.code || '');
  
  // Add additional semantic information with a slightly different structure
  const semantics = {
    aiGenerated: true,
    aiModel: 'cohere',
    accessibilityLevel: determineAccessibilityLevel(component),
    complexity: determineComplexity(component),
    suggestedImprovements: suggestImprovements(component),
    contentType: determineContentType(component)
  };
  
  return createMetadata({
    name: component.name,
    purpose,
    interactions,
    semantics
  });
}

/**
 * Checks if a node represents a React component
 * @param {Object} path - Babel path
 * @returns {boolean} Whether it's a React component
 */
function isReactComponent(path) {
  // For function declarations
  if (t.isFunctionDeclaration(path.node)) {
    // Check if it returns JSX
    let returnsJSX = false;
    path.traverse({
      ReturnStatement(returnPath) {
        const returnArg = returnPath.node.argument;
        if (t.isJSXElement(returnArg) || t.isJSXFragment(returnArg)) {
          returnsJSX = true;
        }
      }
    });
    return returnsJSX;
  }
  
  // For arrow functions
  if (t.isVariableDeclarator(path.node) && t.isArrowFunctionExpression(path.node.init)) {
    const body = path.node.init.body;
    if (t.isJSXElement(body) || t.isJSXFragment(body)) {
      return true;
    }
    
    // Check for JSX in block body
    if (t.isBlockStatement(body)) {
      let returnsJSX = false;
      path.get('init').traverse({
        ReturnStatement(returnPath) {
          const returnArg = returnPath.node.argument;
          if (t.isJSXElement(returnArg) || t.isJSXFragment(returnArg)) {
            returnsJSX = true;
          }
        }
      });
      return returnsJSX;
    }
  }
  
  return false;
}

/**
 * Checks if a node is a React class component
 * @param {Object} path - Babel path
 * @returns {boolean} Whether it's a React class component
 */
function isReactClassComponent(path) {
  if (!t.isClassDeclaration(path.node)) {
    return false;
  }
  
  // Check if extends React.Component or Component
  const superClass = path.node.superClass;
  if (!superClass) {
    return false;
  }
  
  if (t.isMemberExpression(superClass)) {
    return superClass.object.name === 'React' && superClass.property.name === 'Component';
  }
  
  return superClass.name === 'Component';
}

/**
 * Extracts component information
 * @param {Object} path - Babel path
 * @param {string} filePath - File path
 * @returns {Object|null} Component information
 */
function extractComponent(path, filePath) {
  let componentName = '';
  let componentCode = '';
  let componentType = '';
  let props = {};
  
  // Get component name and type
  if (t.isFunctionDeclaration(path.node)) {
    componentName = path.node.id.name;
    componentType = 'function';
  } else if (t.isVariableDeclarator(path.node)) {
    componentName = path.node.id.name;
    componentType = 'arrow';
  }
  
  // Skip if component doesn't have a name
  if (!componentName) {
    return null;
  }
  
  // Get component code
  const { code } = generate(path.node);
  componentCode = code;
  
  // Extract props
  props = extractProps(path);
  
  // Extract JSX structure (simplified)
  const jsxElements = [];
  path.traverse({
    JSXElement(jsxPath) {
      const element = {
        type: jsxPath.node.openingElement.name.name,
        hasChildren: jsxPath.node.children.length > 0
      };
      jsxElements.push(element);
    }
  });
  
  // Extract event handlers
  const eventHandlers = [];
  path.traverse({
    JSXAttribute(attrPath) {
      const name = attrPath.node.name.name;
      if (name.startsWith('on') && name.length > 2) {
        eventHandlers.push(name);
      }
    }
  });
  
  return {
    name: componentName,
    type: componentType,
    code: componentCode,
    filePath,
    props,
    jsxElements,
    eventHandlers,
    metadata: createMetadata({
      name: componentName
    })
  };
}

/**
 * Extracts class component information
 * @param {Object} path - Babel path
 * @param {string} filePath - File path
 * @returns {Object|null} Component information
 */
function extractClassComponent(path, filePath) {
  if (!path.node.id) {
    return null;
  }
  
  const componentName = path.node.id.name;
  
  // Get component code
  const { code } = generate(path.node);
  
  // Get component methods
  const methods = [];
  path.traverse({
    ClassMethod(methodPath) {
      if (methodPath.node.key) {
        methods.push(methodPath.node.key.name);
      }
    }
  });
  
  // Extract JSX structure from render method
  const jsxElements = [];
  path.traverse({
    ClassMethod(methodPath) {
      if (methodPath.node.key && methodPath.node.key.name === 'render') {
        methodPath.traverse({
          JSXElement(jsxPath) {
            const element = {
              type: jsxPath.node.openingElement.name.name,
              hasChildren: jsxPath.node.children.length > 0
            };
            jsxElements.push(element);
          }
        });
      }
    }
  });
  
  // Extract event handlers
  const eventHandlers = [];
  path.traverse({
    JSXAttribute(attrPath) {
      const name = attrPath.node.name.name;
      if (name.startsWith('on') && name.length > 2) {
        eventHandlers.push(name);
      }
    }
  });
  
  // Analyze component name to infer purpose
  const purpose = inferPurpose(componentName, code);
  
  return {
    name: componentName,
    type: 'class',
    code,
    filePath,
    methods,
    jsxElements,
    eventHandlers,
    purpose,
    metadata: createMetadata({
      name: componentName
    })
  };
}

/**
 * Extracts props from a component
 * @param {Object} path - Babel path
 * @returns {Object} Props information
 */
function extractProps(path) {
  const props = {};
  
  // Function declaration
  if (t.isFunctionDeclaration(path.node) && path.node.params.length > 0) {
    const param = path.node.params[0];
    
    // Destructured props
    if (t.isObjectPattern(param)) {
      param.properties.forEach(prop => {
        if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
          props[prop.key.name] = {
            name: prop.key.name,
            required: false
          };
        }
      });
    }
    // Props as object
    else if (t.isIdentifier(param)) {
      props['_propsObject'] = {
        name: param.name,
        isObject: true
      };
    }
  }
  // Arrow function
  else if (t.isVariableDeclarator(path.node) && 
           t.isArrowFunctionExpression(path.node.init) && 
           path.node.init.params.length > 0) {
    const param = path.node.init.params[0];
    
    // Destructured props
    if (t.isObjectPattern(param)) {
      param.properties.forEach(prop => {
        if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
          props[prop.key.name] = {
            name: prop.key.name,
            required: false
          };
        }
      });
    }
    // Props as object
    else if (t.isIdentifier(param)) {
      props['_propsObject'] = {
        name: param.name,
        isObject: true
      };
    }
  }
  
  return props;
}

/**
 * Enhances a component with AI-generated metadata
 * @param {Object} component - Component information
 * @param {Object} options - Enhancement options
 * @returns {Promise<Object>} Enhanced component
 */
async function enhanceWithAI(component, options) {
  // Check if AI is available and should be used
  if (isAIAvailable() && options.useAI !== false) {
    try {
      const metadata = await analyzeComponentWithAI(component, options);
      component.metadata = metadata;
      return component;
    } catch (error) {
      console.warn(`AI analysis failed for ${component.name}: ${error.message}`);
      // Fall back to basic enhancement
    }
  }
  
  // Basic enhancement without AI
  const analysis = {
    purpose: inferPurpose(component.name, component.code),
    interactions: inferInteractions(component.code),
    accessibilityLevel: 'medium',
    complexity: 'low'
  };
  
  // Enhance component metadata
  component.metadata = createMetadata({
    name: component.name,
    purpose: analysis.purpose,
    interactions: analysis.interactions,
    semantics: {
      accessibilityLevel: analysis.accessibilityLevel,
      complexity: analysis.complexity
    }
  });
  
  return component;
}

/**
 * Infers purpose from component name and code
 * @param {string} name - Component name
 * @param {string} code - Component code
 * @returns {string} Inferred purpose
 */
function inferPurpose(name, code) {
  const nameLower = name.toLowerCase();
  
  // Check for common naming patterns
  if (/button|btn/i.test(nameLower)) {
    return inferButtonPurpose(name, code);
  } else if (/card/i.test(nameLower)) {
    return 'display-card';
  } else if (/list/i.test(nameLower)) {
    return nameLower.includes('item') ? 'list-item' : 'list-container';
  } else if (/form/i.test(nameLower)) {
    return 'input-form';
  } else if (/input|field|select|checkbox|radio|textarea/i.test(nameLower)) {
    return 'input-field';
  } else if (/nav|menu/i.test(nameLower)) {
    return 'navigation';
  } else if (/header/i.test(nameLower)) {
    return 'page-header';
  } else if (/footer/i.test(nameLower)) {
    return 'page-footer';
  } else if (/modal|dialog|popup/i.test(nameLower)) {
    return 'modal-dialog';
  } else if (/table/i.test(nameLower)) {
    return nameLower.includes('row') || nameLower.includes('cell') ? 'table-item' : 'data-table';
  } else if (/chart|graph|plot/i.test(nameLower)) {
    return 'data-visualization';
  } else if (/container|wrapper|layout/i.test(nameLower)) {
    return 'layout-container';
  } else if (/sidebar/i.test(nameLower)) {
    return 'navigation-sidebar';
  } else if (/tab/i.test(nameLower)) {
    return nameLower.includes('panel') ? 'tab-panel' : 'navigation-tab';
  } else if (/alert|notification|toast/i.test(nameLower)) {
    return 'notification';
  } else if (/icon/i.test(nameLower)) {
    return 'decorative-icon';
  } else if (/image|img|photo/i.test(nameLower)) {
    return 'display-image';
  } else if (/video|player/i.test(nameLower)) {
    return 'media-player';
  }
  
  return 'ui-component';
}

/**
 * Infers a more specific button purpose
 * @param {string} name - Component name
 * @param {string} code - Component code
 * @returns {string} Specific button purpose
 */
function inferButtonPurpose(name, code) {
  const nameLower = name.toLowerCase();
  
  if (/submit/i.test(nameLower)) {
    return 'submit-button';
  } else if (/cancel/i.test(nameLower)) {
    return 'cancel-button';
  } else if (/delete|remove/i.test(nameLower)) {
    return 'delete-button';
  } else if (/add|create|new/i.test(nameLower)) {
    return 'create-button';
  } else if (/edit|update/i.test(nameLower)) {
    return 'edit-button';
  } else if (/save/i.test(nameLower)) {
    return 'save-button';
  } else if (/close/i.test(nameLower)) {
    return 'close-button';
  } else if (/back/i.test(nameLower)) {
    return 'navigation-back-button';
  } else if (/next/i.test(nameLower)) {
    return 'navigation-next-button';
  } else if (/toggle/i.test(nameLower)) {
    return 'toggle-button';
  }
  
  return 'action-button';
}

/**
 * Infers possible interactions from component code
 * @param {string} code - Component code
 * @returns {string[]} Inferred interactions
 */
function inferInteractions(code) {
  const interactions = [];
  
  // Look for common event handlers
  if (code.includes('onClick')) {
    interactions.push('click');
  }
  if (code.includes('onChange')) {
    interactions.push('change');
  }
  if (code.includes('onSubmit')) {
    interactions.push('submit');
  }
  if (code.includes('onHover') || code.includes('onMouseOver')) {
    interactions.push('hover');
  }
  if (code.includes('onFocus')) {
    interactions.push('focus');
  }
  if (code.includes('onBlur')) {
    interactions.push('blur');
  }
  if (code.includes('onKeyDown') || code.includes('onKeyPress')) {
    interactions.push('keyboard');
  }
  if (code.includes('onDrag')) {
    interactions.push('drag');
  }
  if (code.includes('onDrop')) {
    interactions.push('drop');
  }
  
  return interactions;
}

/**
 * Determines component complexity
 * @param {Object} component - Component information
 * @returns {string} Complexity level (low, medium, high)
 */
function determineComplexity(component) {
  // Simple heuristic based on JSX elements and event handlers
  const jsxElementCount = component.jsxElements ? component.jsxElements.length : 0;
  const handlerCount = component.eventHandlers ? component.eventHandlers.length : 0;
  
  if (jsxElementCount <= 3 && handlerCount <= 1) {
    return 'low';
  } else if (jsxElementCount <= 10 && handlerCount <= 5) {
    return 'medium';
  } else {
    return 'high';
  }
}

/**
 * Determines component accessibility level
 * @param {Object} component - Component information
 * @returns {string} Accessibility level (low, medium, high)
 */
function determineAccessibilityLevel(component) {
  // This would ideally analyze the component's props and structure
  // For now, return a standard level
  return 'medium';
}

/**
 * Suggests improvements for a component
 * @param {Object} component - Component information
 * @returns {string[]} Suggested improvements
 */
function suggestImprovements(component) {
  const suggestions = [];
  const purpose = component.purpose || (component.metadata && component.metadata.purpose) || '';
  
  // Add suggestions based on component type and purpose
  if (purpose.includes('button')) {
    suggestions.push('Ensure button has a meaningful accessible name');
    suggestions.push('Add aria-label if button only contains an icon');
  } else if (purpose.includes('input')) {
    suggestions.push('Associate label with input using htmlFor attribute');
    suggestions.push('Add appropriate aria-describedby for error messages');
  } else if (purpose.includes('list')) {
    suggestions.push('Use appropriate list semantics (ul/ol)');
    suggestions.push('Add keyboard navigation for interactive lists');
  } else if (purpose.includes('table')) {
    suggestions.push('Add proper table headers with scope attribute');
    suggestions.push('Add caption for table description');
  } else if (purpose.includes('modal')) {
    suggestions.push('Trap focus within modal when open');
    suggestions.push('Add aria-modal="true" to modal container');
  }
  
  // Add general suggestions
  suggestions.push('Add descriptive data-testid attributes for testing');
  
  return suggestions;
}

/**
 * Determines the content type of a component
 * @param {Object} component - Component information
 * @returns {string} Content type
 */
function determineContentType(component) {
  const purpose = component.purpose || (component.metadata && component.metadata.purpose) || '';
  
  if (purpose.includes('data-') || purpose.includes('table')) {
    return 'data';
  } else if (purpose.includes('navigation')) {
    return 'navigation';
  } else if (purpose.includes('form') || purpose.includes('input')) {
    return 'input';
  } else if (purpose.includes('button') || purpose.includes('action')) {
    return 'action';
  } else if (purpose.includes('display') || purpose.includes('card')) {
    return 'display';
  } else if (purpose.includes('layout') || purpose.includes('container')) {
    return 'layout';
  }
  
  return 'content';
}