/**
 * aartisan - JSX transformation utilities
 */
import * as babel from '@babel/core';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import generate from '@babel/generator';
import path from 'path';
import fs from 'fs-extra';

/**
 * Transforms JSX code for AI optimization
 * @param {string} code - Source code
 * @param {string} fileName - File name
 * @param {Object} options - Transformation options
 * @returns {Object} Transformed code and metadata
 */
export async function transformJSX(code, fileName, options) {
  // Parse the code
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
  });
  
  // Store component metadata
  const metadata = [];
  
  // Traverse the AST
  traverse.default(ast, {
    // Find component declarations
    FunctionDeclaration(path) {
      if (isReactComponent(path)) {
        processComponent(path, metadata, options);
      }
    },
    // Find arrow function components
    VariableDeclarator(path) {
      if (t.isArrowFunctionExpression(path.node.init) && isReactComponent(path)) {
        processComponent(path, metadata, options);
      }
    },
    // Find comment directives
    Program(path) {
      path.traverse({
        // Look for comment directives
        JSXElement(jsxPath) {
          const comments = getLeadingComments(jsxPath);
          if (comments.some(comment => comment.includes('@aartisan'))) {
            processCommentDirectives(jsxPath, comments, metadata, options);
          }
        }
      });
    }
  });
  
  // Generate the transformed code
  const output = generate.default(ast, {
    retainLines: true,
    comments: true
  }, code);
  
  return {
    code: output.code,
    map: output.map,
    metadata
  };
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
 * Processes a component and extracts metadata
 * @param {Object} path - Babel path
 * @param {Array} metadata - Metadata array
 * @param {Object} options - Options
 */
function processComponent(path, metadata, options) {
  let componentName = '';
  let props = [];
  
  // Get component name
  if (t.isFunctionDeclaration(path.node)) {
    componentName = path.node.id.name;
  } else if (t.isVariableDeclarator(path.node)) {
    componentName = path.node.id.name;
  }
  
  // Extract props
  if (t.isFunctionDeclaration(path.node) && path.node.params.length > 0) {
    props = extractProps(path.node.params[0]);
  } else if (t.isVariableDeclarator(path.node) && 
             path.node.init.params && 
             path.node.init.params.length > 0) {
    props = extractProps(path.node.init.params[0]);
  }
  
  // Extract purpose from comments or content
  const purpose = inferPurpose(path, componentName);
  
  // Add to metadata
  metadata.push({
    name: componentName,
    props,
    purpose,
    fileName: path.hub.file.opts.filename
  });
  
  // Add data attributes to JSX if advanced optimization is enabled
  if (options.optimizationLevel === 'advanced') {
    addDataAttributes(path, componentName, purpose);
  }
}

/**
 * Extracts props from a component parameter
 * @param {Object} param - Babel parameter node
 * @returns {Array} Array of prop metadata
 */
function extractProps(param) {
  const props = [];
  
  // Handle object pattern (destructured props)
  if (t.isObjectPattern(param)) {
    param.properties.forEach(prop => {
      if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
        props.push({
          name: prop.key.name,
          required: false
        });
      } else if (t.isRestElement(prop) && t.isIdentifier(prop.argument)) {
        props.push({
          name: prop.argument.name,
          isRest: true
        });
      }
    });
  } 
  // Handle identifier (props as a single object)
  else if (t.isIdentifier(param)) {
    props.push({
      name: param.name,
      isObject: true
    });
  }
  
  return props;
}

/**
 * Infers the purpose of a component from its code and name
 * @param {Object} path - Babel path
 * @param {string} componentName - Component name
 * @returns {string} Inferred purpose
 */
function inferPurpose(path, componentName) {
  // Check for common naming patterns
  if (/button/i.test(componentName)) {
    return 'interactive-button';
  } else if (/card/i.test(componentName)) {
    return 'display-card';
  } else if (/list/i.test(componentName)) {
    return 'list-container';
  } else if (/item/i.test(componentName)) {
    return 'list-item';
  } else if (/form/i.test(componentName)) {
    return 'input-form';
  } else if (/input/i.test(componentName)) {
    return 'input-field';
  } else if (/header/i.test(componentName)) {
    return 'page-header';
  } else if (/footer/i.test(componentName)) {
    return 'page-footer';
  } else if (/nav/i.test(componentName)) {
    return 'navigation';
  } else if (/modal/i.test(componentName)) {
    return 'modal-dialog';
  }
  
  return 'ui-component';
}

/**
 * Gets leading comments from a node
 * @param {Object} path - Babel path
 * @returns {Array} Array of comment strings
 */
function getLeadingComments(path) {
  const comments = [];
  const node = path.node;
  
  if (node.leadingComments) {
    node.leadingComments.forEach(comment => {
      comments.push(comment.value.trim());
    });
  }
  
  return comments;
}

/**
 * Processes comment directives for a component
 * @param {Object} path - Babel path
 * @param {Array} comments - Comment strings
 * @param {Array} metadata - Metadata array
 * @param {Object} options - Options
 */
function processCommentDirectives(path, comments, metadata, options) {
  // Extract directives
  const directives = {};
  comments.forEach(comment => {
    // Match @aartisan:key value
    const matches = comment.match(/@aartisan:(\w+)(?:\s+(.+))?/g);
    if (matches) {
      matches.forEach(match => {
        const [, key, value] = match.match(/@aartisan:(\w+)(?:\s+(.+))?/);
        directives[key] = value || true;
      });
    }
  });
  
  // If we have directives, add data attributes
  if (Object.keys(directives).length > 0) {
    const openingElement = path.node.openingElement;
    
    // Add data-aartisan attribute
    openingElement.attributes.push(
      t.jsxAttribute(
        t.jsxIdentifier('data-aartisan'),
        t.stringLiteral('true')
      )
    );
    
    // Add other directive attributes
    Object.entries(directives).forEach(([key, value]) => {
      if (value !== true) {
        openingElement.attributes.push(
          t.jsxAttribute(
            t.jsxIdentifier(`data-aartisan-${key}`),
            t.stringLiteral(value)
          )
        );
      }
    });
    
    // Add to metadata
    metadata.push({
      elementType: openingElement.name.name,
      directives,
      fileName: path.hub.file.opts.filename
    });
  }
}

/**
 * Adds data attributes to a component's JSX
 * @param {Object} path - Babel path
 * @param {string} componentName - Component name
 * @param {string} purpose - Component purpose
 */
function addDataAttributes(path, componentName, purpose) {
  path.traverse({
    JSXElement(jsxPath) {
      // Only add to the root JSX element in the component
      if (jsxPath.parent && 
          (t.isReturnStatement(jsxPath.parent) || 
           t.isArrowFunctionExpression(jsxPath.parent))) {
        const openingElement = jsxPath.node.openingElement;
        
        // Add data-aartisan attribute
        openingElement.attributes.push(
          t.jsxAttribute(
            t.jsxIdentifier('data-aartisan'),
            t.stringLiteral('true')
          )
        );
        
        // Add component name attribute
        openingElement.attributes.push(
          t.jsxAttribute(
            t.jsxIdentifier('data-aartisan-component'),
            t.stringLiteral(componentName)
          )
        );
        
        // Add purpose attribute
        if (purpose) {
          openingElement.attributes.push(
            t.jsxAttribute(
              t.jsxIdentifier('data-aartisan-purpose'),
              t.stringLiteral(purpose)
            )
          );
        }
      }
    }
  });
}

/**
 * Generates a metadata file with component information
 * @param {Map} metadataCache - Metadata cache
 * @param {Object} options - Options
 * @returns {Promise<void>}
 */
export async function generateMetadata(metadataCache, options) {
  const outputFile = path.resolve(process.cwd(), 'dist', 'aartisan-metadata.json');
  
  // Ensure output directory exists
  await fs.ensureDir(path.dirname(outputFile));
  
  // Merge all metadata
  const allMetadata = [];
  metadataCache.forEach((fileMetadata, fileName) => {
    fileMetadata.forEach(item => {
      allMetadata.push({
        ...item,
        fileName: path.relative(process.cwd(), fileName)
      });
    });
  });
  
  // Add global metadata
  const metadata = {
    version: '0.1.0',
    generated: new Date().toISOString(),
    optimizationLevel: options.optimizationLevel,
    accessibilityFeatures: options.accessibilityFeatures,
    culturalContexts: options.culturalContexts,
    components: allMetadata
  };
  
  // Write metadata file
  await fs.writeJson(outputFile, metadata, { spaces: 2 });
  
  if (options.verbose) {
    console.log(`[Aartisan] Metadata generated at ${outputFile}`);
    console.log(`[Aartisan] Found ${allMetadata.length} components`);
  }
}