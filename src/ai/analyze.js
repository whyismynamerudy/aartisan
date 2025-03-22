/**
 * aartisan - AI Component Analysis
 * 
 * Analyzes React components using LLMs to extract semantic information
 * and enhance them for AI agent understanding.
 */
import fs from 'fs-extra';
import path from 'path';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import generate from '@babel/generator';
import { createMetadata } from '../core/metadata.js';

// Import AI providers (placeholder for now)
// import { analyzeWithGemini } from './gemini.js';
// import { analyzeWithCohere } from './cohere.js';

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
  traverse.default(ast, {
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
    return t.isJSXElement(body) || t.isJSXFragment(body);
  }
  
  return false;
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
  let propTypes = {};
  
  // Get component name
  if (t.isFunctionDeclaration(path.node)) {
    componentName = path.node.id.name;
  } else if (t.isVariableDeclarator(path.node)) {
    componentName = path.node.id.name;
  }
  
  // Skip if component doesn't have a name
  if (!componentName) {
    return null;
  }
  
  // Get component code
  const { code } = generate.default(path.node);
  componentCode = code;
  
  // Extract props
  const props = extractProps(path);
  
  return {
    name: componentName,
    code: componentCode,
    filePath,
    props,
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
  // For now, just return a simple analysis
  // In a full implementation, this would call the LLM API
  
  // Placeholder analysis
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
  // Basic pattern matching for common component types
  if (/button/i.test(name)) {
    return 'action-button';
  } else if (/card/i.test(name)) {
    return 'display-card';
  } else if (/list/i.test(name)) {
    return 'list-container';
  } else if (/form/i.test(name)) {
    return 'input-form';
  } else if (/input/i.test(name)) {
    return 'input-field';
  } else if (/nav/i.test(name)) {
    return 'navigation';
  } else if (/header/i.test(name)) {
    return 'page-header';
  } else if (/footer/i.test(name)) {
    return 'page-footer';
  } else if (/modal/i.test(name)) {
    return 'modal-dialog';
  }
  
  return 'ui-component';
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
  
  return interactions;
}