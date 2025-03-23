import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import fs from 'fs-extra';
import { glob } from 'glob';
import * as parser from '@babel/parser';
import * as traverseModule from '@babel/traverse';
import * as generateModule from '@babel/generator';
import * as t from '@babel/types';
import { 
  findRelatedFiles, 
  enhanceWithLLM, 
  validateApiKey 
} from '../utils/llm-providers.js';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const traverse = traverseModule.default || traverseModule;
const generate = generateModule.default || generateModule;

/**
 * Registers the 'annotate' command with the provided Commander program
 * @param {import('commander').Command} program - The Commander program instance
 */
export function annotateCommand(program) {
  program
    .command('annotate')
    .description('Enhance components with LLM-powered semantic analysis')
    .argument('[source]', 'Path to source directory to analyze', '.')
    .option('-p, --provider <provider>', 'LLM provider to use (cohere, gemini)', 'cohere')
    .option('-k, --api-key <key>', 'API key for the LLM provider (Cohere)')
    .option('-g, --gemini-api-key <key>', 'API key for the Gemini provider')
    .option('-v, --verbose', 'Enable verbose logging')
    .option('-d, --dry-run', 'Show the proposed changes without applying them')
    .action(async (source, options) => {
      console.log(chalk.cyan('\n🧠 Enhancing components with LLM-powered analysis...\n'));
      
      try {
        console.log(chalk.blue(`[DEBUG] Starting annotate command with source: ${source}`));
        console.log(chalk.blue(`[DEBUG] Provider: ${options.provider}, Verbose: ${options.verbose}, Dry run: ${options.dryRun}`));
        
        // Resolve the source path
        const sourcePath = path.resolve(process.cwd(), source);
        console.log(chalk.blue(`[DEBUG] Resolved source path: ${sourcePath}`));
        
        // Check if the source exists
        if (!await fs.pathExists(sourcePath)) {
          console.error(chalk.red(`Error: Source path '${sourcePath}' does not exist`));
          process.exit(1);
        }
        
        // Handle provider-specific API keys
        if (options.provider === 'gemini') {
          // For Gemini provider
          if (!options.geminiApiKey && !options.apiKey) {
            console.log(chalk.blue('[DEBUG] No Gemini API key provided via command line, checking environment variables'));
            // Try to read from environment variable
            const envKey = process.env.GEMINI_API_KEY;
            
            if (envKey) {
              options.geminiApiKey = envKey;
              console.log(chalk.blue(`[DEBUG] Found Gemini API key in environment variable GEMINI_API_KEY`));
            } else {
              console.error(chalk.red(`Error: No API key provided for Gemini and none found in environment variables`));
              console.log(`You can provide a Gemini API key using the --gemini-api-key option or by setting the GEMINI_API_KEY environment variable.`);
              process.exit(1);
            }
          } else if (options.geminiApiKey) {
            console.log(chalk.blue('[DEBUG] Using provided --gemini-api-key for Gemini'));
          } else if (options.apiKey) {
            console.log(chalk.blue('[DEBUG] Using provided --api-key for Gemini'));
            options.geminiApiKey = options.apiKey;
          }
        } else {
          // For Cohere provider (default) or any other
          if (!options.apiKey) {
            console.log(chalk.blue('[DEBUG] No API key provided via command line, checking environment variables'));
            // Try to read from environment variable based on provider
            const envKey = options.provider === 'cohere' 
              ? process.env.COHERE_API_KEY 
              : process.env.GEMINI_API_KEY;
            
            if (envKey) {
              options.apiKey = envKey;
              console.log(chalk.blue(`[DEBUG] Found API key in environment variable ${options.provider === 'cohere' ? 'COHERE_API_KEY' : 'GEMINI_API_KEY'}`));
            } else {
              console.error(chalk.red(`Error: No API key provided for ${options.provider} and none found in environment variables`));
              console.log(`You can provide an API key using the --api-key option or by setting the ${options.provider === 'cohere' ? 'COHERE_API_KEY' : 'GEMINI_API_KEY'} environment variable.`);
              process.exit(1);
            }
          }
        }
        
        // Find React component files
        const spinner = ora('Scanning for components with LLM directives...').start();
        console.log(chalk.blue(`[DEBUG] Starting scan for component files in ${sourcePath}`));
        const componentFiles = await findComponentFiles(sourcePath);
        
        if (componentFiles.length === 0) {
          spinner.fail('No React component files found.');
          process.exit(0);
        }
        
        console.log(chalk.blue(`[DEBUG] Found ${componentFiles.length} potential component files`));
        
        // Find components with @aartisan:analyze directives
        console.log(chalk.blue('[DEBUG] Searching for components with @aartisan:analyze directives'));
        const componentsToAnalyze = await findComponentsWithDirectives(componentFiles);
        spinner.succeed(`Found ${componentsToAnalyze.length} components with LLM analysis directives.`);
        
        if (options.verbose) {
          console.log(chalk.blue('[DEBUG] Components to analyze:'));
          componentsToAnalyze.forEach((comp, idx) => {
            console.log(chalk.blue(`[DEBUG] ${idx + 1}. ${comp.name} (${comp.filePath})`));
          });
        }
        
        if (componentsToAnalyze.length === 0) {
          console.log(chalk.yellow('No components with @aartisan:analyze directives found.'));
          console.log('Add // @aartisan:analyze to a component to enable LLM-powered enhancement.');
          process.exit(0);
        }
        
        // Validate API key based on provider
        spinner.start('Validating API key...');
        console.log(chalk.blue(`[DEBUG] Validating ${options.provider} API key`));
        const isValidKey = await validateApiKey(
          options.provider, 
          options.provider === 'gemini' ? (options.geminiApiKey || options.apiKey) : options.apiKey
        );
        if (!isValidKey) {
          spinner.fail(`Invalid API key for ${options.provider}`);
          process.exit(1);
        }
        spinner.succeed(`${options.provider} API key validated successfully`);
        
        // Gather codebase context for relevant components
        spinner.start('Gathering context from codebase...');
        console.log(chalk.blue('[DEBUG] Starting codebase context gathering'));
        
        // Note: For Gemini, we still use Cohere for reranking if a Cohere API key is available
        // This is because Gemini doesn't have a dedicated reranking API
        const contextGatheringOptions = { ...options };
        if (options.provider === 'gemini' && !options.apiKey) {
          // Try to get Cohere API key from environment for reranking
          const cohereEnvKey = process.env.COHERE_API_KEY;
          if (cohereEnvKey) {
            contextGatheringOptions.apiKey = cohereEnvKey;
            contextGatheringOptions.provider = 'cohere';
            console.log(chalk.blue('[DEBUG] Using Cohere API key from environment for context reranking'));
          }
        }
        
        const contextMap = await gatherCodebaseContext(componentsToAnalyze, componentFiles, contextGatheringOptions);
        spinner.succeed('Gathered contextual information for analysis.');
        
        if (options.verbose) {
          console.log(chalk.blue('[DEBUG] Context map summary:'));
          for (const [filePath, context] of contextMap.entries()) {
            console.log(chalk.blue(`[DEBUG] ${filePath} -> ${context.length} related files`));
          }
        }
        
        // Process each component with the LLM
        for (const component of componentsToAnalyze) {
          spinner.start(`Enhancing ${component.name}...`);
          console.log(chalk.blue(`[DEBUG] Starting enhancement for component ${component.name}`));
          
          try {
            // Generate enhancement with LLM
            console.log(chalk.blue(`[DEBUG] Getting context for ${component.filePath}`));
            const context = contextMap.get(component.filePath) || [];
            console.log(chalk.blue(`[DEBUG] Found ${context.length} context items`));
            
            console.log(chalk.blue('[DEBUG] Calling enhanceComponentWithLLM'));
            const enhancedCode = await enhanceComponentWithLLM(
              component, 
              context,
              options
            );
            
            if (options.dryRun) {
              spinner.succeed(`Generated enhancement for ${component.name} (dry run, not applying changes)`);
              console.log(chalk.gray('─'.repeat(80)));
              console.log(enhancedCode);
              console.log(chalk.gray('─'.repeat(80)));
            } else {
              // Apply the changes to the file
              console.log(chalk.blue(`[DEBUG] Applying enhancement to file ${component.filePath}`));
              await applyEnhancement(component.filePath, enhancedCode);
              spinner.succeed(`Enhanced ${component.name} with LLM-powered analysis`);
            }
          } catch (error) {
            spinner.fail(`Failed to enhance ${component.name}: ${error.message}`);
            console.error(chalk.red(`[ERROR] Enhancement failed: ${error.message}`));
            if (options.verbose) {
              console.error(error);
            }
          }
        }
        
        console.log(chalk.green('\n✅ LLM enhancement complete!'));
        
      } catch (error) {
        console.error(chalk.red(`\n❌ Error during LLM enhancement: ${error.message}`));
        console.error(chalk.red(`[ERROR] Stack trace: ${error.stack}`));
        if (options.verbose) {
          console.error(error);
        }
        process.exit(1);
      }
    });
}

/**
 * Finds React component files in a directory
 * @param {string} sourcePath - Source directory path
 * @returns {Promise<string[]>} Array of file paths
 */
async function findComponentFiles(sourcePath) {
  // Look for .jsx, .tsx, .js, .ts files
  const filePatterns = [
    '**/*.jsx',
    '**/*.tsx',
    '**/*.js',
    '**/*.ts'
  ];
  
  // Exclusion patterns
  const ignorePatterns = [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.git/**'
  ];
  
  console.log(chalk.blue(`[DEBUG] Searching for component files with patterns: ${filePatterns.join(', ')}`));
  console.log(chalk.blue(`[DEBUG] Ignoring: ${ignorePatterns.join(', ')}`));
  
  // Find files using glob
  const files = [];
  for (const pattern of filePatterns) {
    console.log(chalk.blue(`[DEBUG] Globbing with pattern: ${pattern}`));
    const matches = await glob(pattern, {
      cwd: sourcePath,
      ignore: ignorePatterns,
      absolute: true
    });
    
    console.log(chalk.blue(`[DEBUG] Found ${matches.length} files with pattern ${pattern}`));
    files.push(...matches);
  }
  
  console.log(chalk.blue(`[DEBUG] Total files found: ${files.length}`));
  return files;
}

/**
 * Finds components with @aartisan:analyze directives
 * @param {string[]} filePaths - Array of file paths
 * @returns {Promise<Array<{name: string, filePath: string, code: string, directiveNode: Object}>>} Components to analyze
 */
async function findComponentsWithDirectives(filePaths) {
  const components = [];
  
  console.log(chalk.blue(`[DEBUG] Searching for @aartisan:analyze directives in ${filePaths.length} files`));
  
  for (const filePath of filePaths) {
    try {
      const code = await fs.readFile(filePath, 'utf-8');
      
      // Skip if file doesn't contain the directive string
      if (!code.includes('@aartisan:analyze')) {
        continue;
      }
      
      console.log(chalk.blue(`[DEBUG] Found potential directive in ${filePath}`));
      
      // Parse the file
      console.log(chalk.blue(`[DEBUG] Parsing file: ${filePath}`));
      const ast = parser.parse(code, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
        tokens: true
      });
      
      // Track components with directives
      traverse(ast, {
        // Function declarations
        FunctionDeclaration(path) {
          const directive = hasAartisanDirective(path);
          if (directive) {
            console.log(chalk.blue(`[DEBUG] Found function component with directive: ${path.node.id.name}`));
            const component = {
              name: path.node.id.name,
              filePath,
              code: generate(path.node, {}, code).code,
              directiveNode: directive,
              componentNode: path.node,
              type: 'function'
            };
            components.push(component);
          }
        },
        
        // Arrow function expressions
        VariableDeclarator(path) {
          if (t.isArrowFunctionExpression(path.node.init)) {
            const directive = hasAartisanDirective(path);
            if (directive && path.node.id) {
              console.log(chalk.blue(`[DEBUG] Found arrow function component with directive: ${path.node.id.name}`));
              const component = {
                name: path.node.id.name,
                filePath,
                code: generate(path.node, {}, code).code,
                directiveNode: directive,
                componentNode: path.node,
                type: 'arrow'
              };
              components.push(component);
            }
          }
        },
        
        // Class components
        ClassDeclaration(path) {
          const directive = hasAartisanDirective(path);
          if (directive) {
            console.log(chalk.blue(`[DEBUG] Found class component with directive: ${path.node.id.name}`));
            const component = {
              name: path.node.id.name,
              filePath,
              code: generate(path.node, {}, code).code,
              directiveNode: directive,
              componentNode: path.node,
              type: 'class'
            };
            components.push(component);
          }
        }
      });
    } catch (error) {
      console.warn(chalk.yellow(`Warning: Could not parse ${filePath}: ${error.message}`));
      console.error(chalk.red(`[ERROR] Parse error: ${error.stack}`));
    }
  }
  
  console.log(chalk.blue(`[DEBUG] Found ${components.length} total components with directives`));
  return components;
}

/**
 * Checks if a node has an @aartisan:analyze directive
 * @param {Object} path - Babel path
 * @returns {Object|null} The directive node if found, null otherwise
 */
function hasAartisanDirective(path) {
  const node = path.node;
  
  // Check for leading comments
  if (node.leadingComments) {
    for (const comment of node.leadingComments) {
      if (comment.value.includes('@aartisan:analyze')) {
        return comment;
      }
    }
  }
  
  // Check parent node comments for variable declarations
  if (t.isVariableDeclarator(node) && path.parentPath.node.leadingComments) {
    for (const comment of path.parentPath.node.leadingComments) {
      if (comment.value.includes('@aartisan:analyze')) {
        return comment;
      }
    }
  }
  
  return null;
}

/**
 * Gathers context from the codebase for each component
 * @param {Array} components - Components to analyze
 * @param {string[]} allFiles - All component files
 * @param {Object} options - Command options
 * @returns {Promise<Map<string, Array>>} Map of file path to context
 */
async function gatherCodebaseContext(components, allFiles, options) {
  const contextMap = new Map();
  
  console.log(chalk.blue(`[DEBUG] Gathering codebase context for ${components.length} components`));
  
  // For each component, find related files
  for (const component of components) {
    console.log(chalk.blue(`[DEBUG] Finding context for component: ${component.name}`));
    
    // Prepare a query about the component
    const query = `Component named ${component.name} defined in React that ${inferComponentPurpose(component.name)}`;
    console.log(chalk.blue(`[DEBUG] Context query: "${query}"`));
    
    // Read all files that might have relevant context
    console.log(chalk.blue(`[DEBUG] Reading ${allFiles.length - 1} potential context files`));
    const fileContents = await Promise.all(
      allFiles.filter(fp => fp !== component.filePath)
        .map(async (filePath) => {
          try {
            const content = await fs.readFile(filePath, 'utf-8');
            return {
              filePath,
              content
            };
          } catch (error) {
            if (options.verbose) {
              console.warn(chalk.yellow(`Warning: Could not read ${filePath}: ${error.message}`));
            }
            return null;
          }
        })
    );
    
    // Filter out null values and prepare for reranking
    const validFiles = fileContents.filter(f => f !== null);
    console.log(chalk.blue(`[DEBUG] Successfully read ${validFiles.length} files for context`));
    
    // If using Cohere, use rerank to find most relevant contexts
    console.log(chalk.blue(`[DEBUG] Finding related files using ${options.provider} provider`));
    console.time('findRelatedFiles');
    const relatedFiles = await findRelatedFiles(query, validFiles, options);
    console.timeEnd('findRelatedFiles');
    console.log(chalk.blue(`[DEBUG] Found ${relatedFiles.length} related files for ${component.name}`));
    
    // Store the context for this component
    contextMap.set(component.filePath, relatedFiles);
  }
  
  return contextMap;
}

/**
 * Enhances a component using an LLM
 * @param {Object} component - Component to enhance
 * @param {Array} context - Context information
 * @param {Object} options - Command options
 * @returns {Promise<string>} Enhanced component code
 */
async function enhanceComponentWithLLM(component, context, options) {
  console.log(chalk.blue(`[DEBUG] Starting LLM enhancement for component ${component.name}`));
  
  // Read the aartisan React hooks and directives files for context
  // Determine the proper paths based on the installed package structure
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  console.log(chalk.blue(`[DEBUG] Current directory: ${__dirname}`));
  
  const distRootDir = path.resolve(__dirname, '../../..');
  console.log(chalk.blue(`[DEBUG] Dist root directory: ${distRootDir}`));
  
  const reactHooksFile = path.join(distRootDir, 'dist/react/hooks.js');
  const reactDirectivesFile = path.join(distRootDir, 'dist/react/directives.js');
  const hocFile = path.join(distRootDir, 'dist/react/hoc.js');
  const defineComponentFile = path.join(distRootDir, 'dist/react/defineComponent.js');
  
  console.log(chalk.blue(`[DEBUG] Reading Aartisan documentation files:`));
  console.log(chalk.blue(`[DEBUG] - Hooks: ${reactHooksFile}`));
  console.log(chalk.blue(`[DEBUG] - Directives: ${reactDirectivesFile}`));
  console.log(chalk.blue(`[DEBUG] - HOC: ${hocFile}`));
  console.log(chalk.blue(`[DEBUG] - defineComponent: ${defineComponentFile}`));
  
  let aartisanDocs = '';
  
  try {
    // Read aartisan documentation
    console.log(chalk.blue('[DEBUG] Reading hooks documentation'));
    const hooksContent = await fs.readFile(reactHooksFile, 'utf-8');
    
    console.log(chalk.blue('[DEBUG] Reading directives documentation'));
    const directivesContent = await fs.readFile(reactDirectivesFile, 'utf-8');
    
    console.log(chalk.blue('[DEBUG] Reading HOC documentation'));
    const hocContent = await fs.readFile(hocFile, 'utf-8');
    
    console.log(chalk.blue('[DEBUG] Reading defineComponent documentation'));
    const defineComponentContent = await fs.readFile(defineComponentFile, 'utf-8');
    
    aartisanDocs = `
    // Aartisan Hooks API
    ${hooksContent}
    
    // Aartisan Directives API
    ${directivesContent}
    
    // Aartisan HOC API
    ${hocContent}
    
    // Aartisan defineComponent API
    ${defineComponentContent}
    `;
    
    console.log(chalk.blue(`[DEBUG] Successfully loaded all Aartisan documentation (${aartisanDocs.length} chars)`));
  } catch (error) {
    console.warn(chalk.yellow(`Warning: Could not load some Aartisan documentation: ${error.message}`));
    console.error(chalk.red(`[ERROR] Documentation error: ${error.stack}`));
  }
  
  // Prepare context summary
  console.log(chalk.blue(`[DEBUG] Creating context summary from ${context.length} files`));
  const contextSummary = context.map(file => 
    `// Context from ${path.basename(file.filePath)}:\n${file.content.slice(0, 500)}...`
  ).join('\n\n');
  
  console.log(chalk.blue(`[DEBUG] Context summary length: ${contextSummary.length} characters`));
  
  // Create the prompt
  console.log(chalk.blue('[DEBUG] Creating enhancement prompt'));
  const prompt = createEnhancementPrompt(component, contextSummary, aartisanDocs);
  console.log(chalk.blue(`[DEBUG] Prompt created with ${prompt.length} characters`));
  
  // Use our centralized enhanceWithLLM function from the provider utilities
  console.log(chalk.blue(`[DEBUG] Calling enhanceWithLLM with ${options.provider} provider`));
  console.time('enhanceWithLLM');
  const result = await enhanceWithLLM(prompt, options);
  console.timeEnd('enhanceWithLLM');
  console.log(chalk.blue(`[DEBUG] Enhancement complete, received ${result.length} characters of code`));
  
  return result;
}

/**
 * Creates a prompt for enhancing a component
 * @param {Object} component - The component to enhance
 * @param {string} context - Context information
 * @param {string} aartisanDocs - Aartisan documentation
 * @returns {string} The prompt for the LLM
 */
function createEnhancementPrompt(component, context, aartisanDocs) {
  console.log(chalk.blue(`[DEBUG] Building enhancement prompt for ${component.name}`));
  
  const prompt = `You're a React expert helping enhance components with semantic metadata using the Aartisan library. 

Your task is to analyze a React component marked with "// @aartisan:analyze" directive and enhance it with the most appropriate Aartisan enhancement method.

# COMPONENT TO ENHANCE:
\`\`\`jsx
${component.code}
\`\`\`

# CONTEXT FROM CODEBASE:
${context}

# AARTISAN ENHANCEMENT APPROACHES:

1. useAIEnhanced hook (Best for function components):
\`\`\`jsx
import { useAIEnhanced } from 'aartisan/react';

function MyComponent(props) {
  const { ref, aiProps } = useAIEnhanced('component-name', {
    purpose: 'description-of-purpose',
    interactions: ['click', 'hover', etc]
  });
  
  return <div ref={ref} {...aiProps}>...</div>;
}
\`\`\`

2. Directives approach (For simple components):
\`\`\`jsx
import { aiPurpose, aiInteraction } from 'aartisan/react';

function MyComponent(props) {
  return <div {...aiPurpose('description-of-purpose')}>...</div>;
}
\`\`\`

3. withAIEnhancement HOC (Best for class components):
\`\`\`jsx
import { withAIEnhancement } from 'aartisan/react';

class MyComponent extends React.Component {
  render() { return <div>...</div>; }
}

export default withAIEnhancement({
  name: 'MyComponent',
  semantics: { purpose: 'description', interactions: [] }
})(MyComponent);
\`\`\`

4. defineComponent approach (For comprehensive enhancement):
\`\`\`jsx
import { defineComponent } from 'aartisan/react';

const MyComponent = defineComponent({
  name: 'MyComponent',
  semantics: {
    purpose: 'description-of-purpose',
    interactions: ['click', 'hover', etc]
  },
  render: (props) => <div>...</div>
});
\`\`\`

# INSTRUCTIONS:
1. Analyze the component to understand its purpose, functionality, and type (function, class, etc.)
2. Choose the most appropriate enhancement approach based on the component type
3. Enhance the component while preserving ALL original functionality
4. Remove the "// @aartisan:analyze" comment (it's no longer needed)
5. Return ONLY the enhanced component code

# IMPORTANT GUIDELINES:
- For function components: Use useAIEnhanced hook unless the component is very simple
- For class components: Use withAIEnhancement HOC
- Keep imports organized at the top of the file
- Be specific in describing the component's purpose and interactions
- Preserve all props, state management, and event handlers
- Ensure code is valid JSX that can directly replace the original component
- The component's behavior must remain 100% unchanged - only add Aartisan enhancement

Please output ONLY the enhanced component code with no additional explanation or comments.`;

  console.log(chalk.blue(`[DEBUG] Prompt created with sections:
- Component to enhance
- Context from codebase
- Aartisan enhancement approaches
- Instructions
- Guidelines`));
  
  return prompt;
}

/**
 * Applies the enhancement to the component file
 * @param {string} filePath - Path to the component file
 * @param {string} enhancedCode - Enhanced component code
 * @returns {Promise<void>}
 */
async function applyEnhancement(filePath, enhancedCode) {
  console.log(chalk.blue(`[DEBUG] Applying enhancement to file: ${filePath}`));
  
  // Read the original file
  console.log(chalk.blue('[DEBUG] Reading original file'));
  const originalCode = await fs.readFile(filePath, 'utf-8');
  
  // Parse the file to locate the component
  console.log(chalk.blue('[DEBUG] Parsing file to locate component with directive'));
  const ast = parser.parse(originalCode, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
  });
  
  // Find all import declarations in the file
  const importEndPosition = findImportEndPosition(ast);
  console.log(chalk.blue(`[DEBUG] End position of imports: ${importEndPosition}`));
  
  // Find the component with the directive
  let componentStart = 0;
  let componentEnd = 0;
  let componentFound = false;
  
  console.log(chalk.blue('[DEBUG] Traversing AST to find component with directive'));
  traverse(ast, {
    FunctionDeclaration(path) {
      if (hasAartisanDirective(path)) {
        componentStart = path.node.start;
        componentEnd = path.node.end;
        componentFound = true;
        console.log(chalk.blue(`[DEBUG] Found function component at positions ${componentStart}-${componentEnd}`));
        path.stop();
      }
    },
    VariableDeclaration(path) {
      for (const declarator of path.node.declarations) {
        if (t.isVariableDeclarator(declarator) && 
            t.isArrowFunctionExpression(declarator.init) &&
            hasAartisanDirective(path)) {
          componentStart = path.node.start;
          componentEnd = path.node.end;
          componentFound = true;
          console.log(chalk.blue(`[DEBUG] Found arrow function component at positions ${componentStart}-${componentEnd}`));
          path.stop();
        }
      }
    },
    ClassDeclaration(path) {
      if (hasAartisanDirective(path)) {
        componentStart = path.node.start;
        componentEnd = path.node.end;
        componentFound = true;
        console.log(chalk.blue(`[DEBUG] Found class component at positions ${componentStart}-${componentEnd}`));
        path.stop();
      }
    }
  });
  
  if (!componentFound) {
    console.error(chalk.red('[ERROR] Could not locate component in file'));
    throw new Error('Could not locate component in file');
  }
  
  // Check if the enhanced code has imports
  const enhancedImports = extractImports(enhancedCode);
  console.log(chalk.blue(`[DEBUG] Found ${enhancedImports.length} imports in enhanced code`));
  
  // Merge with existing imports
  let newCode;
  if (enhancedImports.length > 0) {
    console.log(chalk.blue('[DEBUG] Detected imports in enhanced code - merging with existing imports'));
    
    // Extract only the component part from the enhanced code
    const componentContent = extractComponentContent(enhancedCode);
    
    // Construct the file with merged imports
    const combinedImports = mergeImports(originalCode.substring(0, importEndPosition), enhancedImports);
    
    newCode = 
      combinedImports + 
      originalCode.substring(importEndPosition, componentStart) + 
      componentContent + 
      originalCode.substring(componentEnd);
  } else {
    // Just replace the component section
    newCode = 
      originalCode.substring(0, componentStart) + 
      enhancedCode + 
      originalCode.substring(componentEnd);
  }
  
  // Check if there's an actual change
  if (newCode === originalCode) {
    console.warn(chalk.yellow('[DEBUG] No changes detected after replacement'));
  } else {
    console.log(chalk.blue(`[DEBUG] Code changed. New code length: ${newCode.length}, Original length: ${originalCode.length}`));
  }
  
  // Write the modified file
  console.log(chalk.blue(`[DEBUG] Writing modified file to: ${filePath}`));
  await fs.writeFile(filePath, newCode);
  console.log(chalk.green(`[DEBUG] Successfully wrote enhanced code to ${filePath}`));
}

/**
 * Find the position where import statements end
 * @param {Object} ast - Babel AST
 * @returns {number} End position
 */
function findImportEndPosition(ast) {
  let lastImportEnd = 0;
  
  traverse(ast, {
    ImportDeclaration(path) {
      if (path.node.end > lastImportEnd) {
        lastImportEnd = path.node.end;
      }
    }
  });
  
  return lastImportEnd;
}

/**
 * Extract import statements from code
 * @param {string} code - Source code
 * @returns {Array} Array of import statements
 */
function extractImports(code) {
  const imports = [];
  const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+)?['"]([^'"]+)['"]/g;
  
  let match;
  while ((match = importRegex.exec(code)) !== null) {
    // Extract the full import statement
    const startPos = match.index;
    let endPos = match.index + match[0].length;
    
    // Find the end of the statement (including semicolon if present)
    if (code.charAt(endPos) === ';') {
      endPos++;
    }
    
    imports.push({
      statement: code.substring(startPos, endPos),
      module: match[1]
    });
  }
  
  return imports;
}

/**
 * Merge existing imports with new imports
 * @param {string} existingImportsBlock - Block of existing import statements
 * @param {Array} newImports - Array of new import statements
 * @returns {string} Merged imports block
 */
function mergeImports(existingImportsBlock, newImports) {
  // Extract existing imports
  const existingImports = extractImports(existingImportsBlock);
  const existingModules = new Set(existingImports.map(imp => imp.module));
  
  // Add any new imports that don't exist
  let result = existingImportsBlock;
  for (const newImport of newImports) {
    if (!existingModules.has(newImport.module)) {
      result += '\n' + newImport.statement;
    }
  }
  
  return result;
}

/**
 * Extract just the component content from generated code
 * @param {string} code - Generated code
 * @returns {string} Component code without imports
 */
function extractComponentContent(code) {
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
  });
  
  let componentStart = 0;
  
  // Find the beginning of the component definition
  traverse(ast, {
    FunctionDeclaration(path) {
      if (componentStart === 0 && path.node.id) {
        componentStart = path.node.start;
        path.stop();
      }
    },
    VariableDeclaration(path) {
      if (componentStart === 0) {
        for (const declarator of path.node.declarations) {
          if (t.isVariableDeclarator(declarator) && 
              (t.isArrowFunctionExpression(declarator.init) || 
               t.isFunctionExpression(declarator.init))) {
            componentStart = path.node.start;
            path.stop();
          }
        }
      }
    },
    ClassDeclaration(path) {
      if (componentStart === 0) {
        componentStart = path.node.start;
        path.stop();
      }
    }
  });
  
  if (componentStart > 0) {
    return code.substring(componentStart);
  }
  
  // Fallback: try to find pattern like "const Component = " or "function Component"
  const functionMatch = code.match(/function\s+\w+\s*\(/);
  if (functionMatch) {
    return code.substring(functionMatch.index);
  }
  
  const constMatch = code.match(/const\s+\w+\s*=/);
  if (constMatch) {
    return code.substring(constMatch.index);
  }
  
  // Last resort - return everything after imports
  const lastImportIndex = code.lastIndexOf('import ');
  if (lastImportIndex >= 0) {
    const afterLastImport = code.indexOf(';', lastImportIndex);
    if (afterLastImport >= 0) {
      return code.substring(afterLastImport + 1).trim();
    }
  }
  
  // If all else fails, return the original code
  return code;
}

/**
 * Infers the purpose of a component from its name
 * @param {string} componentName - Component name
 * @returns {string} Inferred purpose description
 */
function inferComponentPurpose(componentName) {
  // Basic heuristic based on common naming patterns
  if (/button/i.test(componentName)) {
    return "provides a clickable button interface element";
  } else if (/card/i.test(componentName)) {
    return "displays content in a card-like container";
  } else if (/list/i.test(componentName)) {
    return "shows multiple items in a list format";
  } else if (/form/i.test(componentName)) {
    return "collects user input through a form";
  } else if (/input/i.test(componentName)) {
    return "accepts user text input";
  } else if (/header/i.test(componentName)) {
    return "displays the top section of a page or component";
  } else if (/footer/i.test(componentName)) {
    return "displays the bottom section of a page or component";
  } else if (/nav/i.test(componentName)) {
    return "provides navigation functionality";
  } else if (/modal/i.test(componentName)) {
    return "displays content in a modal dialog";
  } else if (/menu/i.test(componentName)) {
    return "shows a list of selectable options";
  } else if (/table/i.test(componentName)) {
    return "displays data in a tabular format";
  } else if (/chart|graph/i.test(componentName)) {
    return "visualizes data graphically";
  }
  
  return "is a React UI component";
}