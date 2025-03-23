import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { p as parse_1, i as index, t as traverseModule, l as libExports, _ as _default, g as generateModule } from '../../index-DrWHAuAr.js';
import { fileURLToPath } from 'url';
import '../../index-BrrynTpt.js';
import 'tty';
import 'util';
import 'os';

/**
 * aartisan - AI Integration
 * 
 * Provides integration with AI models for component analysis
 * and enhancement.
 */


/**
 * AI providers status
 */
const aiProviders = {
  gemini: {
    name: 'Gemini',
    available: false,
    capabilities: ['component-analysis', 'metadata-generation', 'accessibility-check']
  },
  cohere: {
    name: 'Cohere',
    available: false,
    capabilities: ['component-analysis', 'metadata-generation', 'semantic-understanding']
  }
};

/**
 * Initializes the AI providers with API keys
 * @param {Object} options - Initialization options
 * @param {string} options.geminiApiKey - Gemini API key
 * @param {string} options.cohereApiKey - Cohere API key
 * @returns {Promise<Object>} Initialized providers
 */
async function initializeProviders(options = {}) {
  // Initialize Gemini if API key is provided
  if (options.geminiApiKey) {
    try {
      // This is where you would initialize the Gemini client
      // For example: await initGeminiClient(options.geminiApiKey);

      // For demonstration, just set as available
      aiProviders.gemini.available = true;
      console.log('Gemini API initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Gemini API:', error.message);
    }
  }

  // Initialize Cohere if API key is provided
  if (options.cohereApiKey) {
    try {
      // This is where you would initialize the Cohere client
      // For example: await initCohereClient(options.cohereApiKey);

      // For demonstration, just set as available
      aiProviders.cohere.available = true;
      console.log('Cohere API initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Cohere API:', error.message);
    }
  }
  return {
    ...aiProviders
  };
}

/**
 * Gets the best available AI provider
 * @returns {Object|null} Best available provider or null
 */
function getBestProvider() {
  if (aiProviders.gemini.available) {
    return {
      id: 'gemini',
      ...aiProviders.gemini
    };
  }
  if (aiProviders.cohere.available) {
    return {
      id: 'cohere',
      ...aiProviders.cohere
    };
  }
  return null;
}

/**
 * Checks if AI integration is available
 * @returns {boolean} Whether AI integration is available
 */
function isAIAvailable() {
  return aiProviders.gemini.available || aiProviders.cohere.available;
}

const traverse = index || traverseModule;
const generate = _default || generateModule;

// Get the __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
path.dirname(__filename);

/**
 * Registers the 'port' command with the provided Commander program
 * @param {import('commander').Command} program - The Commander program instance
 */
function portCommand(program) {
  program.command('port').description('Port an existing React app to use aartisan features').argument('<source>', 'Path to existing React application').option('-o, --output <path>', 'Output directory for the ported application').option('-y, --yes', 'Skip confirmation prompts and use defaults').option('-a, --ai-provider <provider>', 'AI provider to use (gemini, cohere)', 'gemini').option('-k, --api-key <key>', 'API key for the selected AI provider').option('-l, --level <level>', 'Enhancement level (basic, standard, advanced)', 'standard').option('-v, --verbose', 'Enable verbose logging').action(async (source, options) => {
    console.log(chalk.cyan('\n🚢 Porting existing React application...\n'));
    try {
      // Resolve the source path
      const sourcePath = path.resolve(process.cwd(), source);

      // Check if the source exists
      if (!(await fs.pathExists(sourcePath))) {
        console.error(chalk.red(`Error: Source path '${sourcePath}' does not exist`));
        process.exit(1);
      }

      // Determine output path
      let outputPath = options.output;
      if (!outputPath) {
        if (!options.yes) {
          const answers = await inquirer.prompt([{
            type: 'input',
            name: 'output',
            message: 'Where would you like to output the ported application?',
            default: `${path.basename(sourcePath)}-aartisan`
          }]);
          outputPath = answers.output;
        } else {
          outputPath = `${path.basename(sourcePath)}-aartisan`;
        }
      }
      outputPath = path.resolve(process.cwd(), outputPath);

      // Confirm if the output directory exists and is not empty
      if (await fs.pathExists(outputPath)) {
        const files = await fs.readdir(outputPath);
        if (files.length > 0 && !options.yes) {
          const answers = await inquirer.prompt([{
            type: 'confirm',
            name: 'overwrite',
            message: `Directory '${outputPath}' already exists and is not empty. Continue?`,
            default: false
          }]);
          if (!answers.overwrite) {
            console.log(chalk.yellow('\n❌ Porting cancelled.\n'));
            process.exit(0);
          }
        }
      }

      // Initialize AI provider if specified
      if (options.apiKey && (options.aiProvider === 'gemini' || options.aiProvider === 'cohere')) {
        const spinner = ora('Initializing AI provider...').start();
        try {
          await initializeProviders({
            geminiApiKey: options.aiProvider === 'gemini' ? options.apiKey : undefined,
            cohereApiKey: options.aiProvider === 'cohere' ? options.apiKey : undefined
          });
          spinner.succeed(`AI provider (${options.aiProvider}) initialized successfully`);
        } catch (error) {
          spinner.fail(`Failed to initialize AI provider: ${error.message}`);
          console.warn(chalk.yellow('Continuing without AI enhancement...'));
        }
      } else if (!options.yes && !options.apiKey) {
        // Ask if user wants to use AI for enhanced porting
        const answers = await inquirer.prompt([{
          type: 'confirm',
          name: 'useAI',
          message: 'Would you like to use AI for enhanced component analysis? (requires API key)',
          default: false
        }, {
          type: 'list',
          name: 'aiProvider',
          message: 'Which AI provider would you like to use?',
          choices: ['gemini', 'cohere'],
          default: 'gemini',
          when: answers => answers.useAI
        }, {
          type: 'password',
          name: 'apiKey',
          message: answers => `Enter your ${answers.aiProvider} API key:`,
          when: answers => answers.useAI,
          validate: input => input.trim() !== '' || 'API key cannot be empty'
        }]);
        if (answers.useAI) {
          const spinner = ora('Initializing AI provider...').start();
          try {
            await initializeProviders({
              geminiApiKey: answers.aiProvider === 'gemini' ? answers.apiKey : undefined,
              cohereApiKey: answers.aiProvider === 'cohere' ? answers.apiKey : undefined
            });
            spinner.succeed(`AI provider (${answers.aiProvider}) initialized successfully`);
            options.aiProvider = answers.aiProvider;
          } catch (error) {
            spinner.fail(`Failed to initialize AI provider: ${error.message}`);
            console.warn(chalk.yellow('Continuing without AI enhancement...'));
          }
        }
      }

      // Begin porting process
      await portProject(sourcePath, outputPath, options);
    } catch (error) {
      console.error(chalk.red(`\n❌ Error during porting: ${error.message}`));
      if (options.verbose) {
        console.error(error);
      }
      process.exit(1);
    }
  });
}

/**
 * Main function to port a project
 * @param {string} sourcePath - Source project path
 * @param {string} outputPath - Output project path
 * @param {Object} options - Porting options
 */
async function portProject(sourcePath, outputPath, options) {
  const phases = [{
    name: 'Analyzing project structure',
    fn: analyzeProjectStructure
  }, {
    name: 'Copying project files',
    fn: copyProjectFiles
  }, {
    name: 'Transforming components',
    fn: transformComponents
  }, {
    name: 'Integrating Aartisan provider',
    fn: integrateAartisanProvider
  }, {
    name: 'Updating configuration',
    fn: updateConfiguration
  }, {
    name: 'Finalizing project',
    fn: finalizeProject
  }];

  // Project context to be passed between phases
  const context = {
    sourcePath,
    outputPath,
    options,
    projectInfo: {},
    componentMap: new Map(),
    entryPoints: [],
    routeFiles: []
  };

  // Execute each phase
  for (const phase of phases) {
    const spinner = ora(phase.name).start();
    try {
      await phase.fn(context);
      spinner.succeed();
    } catch (error) {
      spinner.fail(`${phase.name} failed: ${error.message}`);
      throw error;
    }
  }

  // Display success message
  console.log(chalk.green('\n✅ Project ported successfully!'));
  console.log(chalk.cyan('\nNext steps:'));
  console.log(`  cd ${path.relative(process.cwd(), outputPath)}`);
  console.log('  npm install');
  console.log('  npm run dev\n');
}

/**
 * Phase 1: Analyze the project structure
 * @param {Object} context - Porting context
 */
async function analyzeProjectStructure(context) {
  const {
    sourcePath,
    options
  } = context;

  // Read package.json to determine project type
  const packageJsonPath = path.join(sourcePath, 'package.json');
  if (await fs.pathExists(packageJsonPath)) {
    const packageJson = await fs.readJson(packageJsonPath);
    context.projectInfo.packageJson = packageJson;

    // Check if it's a React project
    if (!packageJson.dependencies?.react) {
      throw new Error('Not a React project (react not found in dependencies)');
    }

    // Determine build system
    if (packageJson.dependencies?.['next'] || packageJson.devDependencies?.['next']) {
      context.projectInfo.buildSystem = 'next';
    } else if (packageJson.dependencies?.['@remix-run/react'] || packageJson.devDependencies?.['@remix-run/react']) {
      context.projectInfo.buildSystem = 'remix';
    } else if (packageJson.devDependencies?.['vite']) {
      context.projectInfo.buildSystem = 'vite';
    } else if (packageJson.devDependencies?.['webpack']) {
      context.projectInfo.buildSystem = 'webpack';
    } else if (packageJson.devDependencies?.['react-scripts'] || packageJson.dependencies?.['react-scripts']) {
      context.projectInfo.buildSystem = 'cra';
    } else {
      context.projectInfo.buildSystem = 'unknown';
    }

    // Determine TypeScript usage
    context.projectInfo.usesTypeScript = packageJson.devDependencies?.['typescript'] !== undefined || (await fs.pathExists(path.join(sourcePath, 'tsconfig.json')));

    // Determine routing
    context.projectInfo.router = packageJson.dependencies?.['react-router-dom'] ? 'react-router' : packageJson.dependencies?.['@tanstack/react-router'] ? 'tanstack-router' : packageJson.dependencies?.['next'] ? 'next-router' : 'unknown';
  } else {
    throw new Error('package.json not found in source directory');
  }

  // Find React component files
  const extensions = context.projectInfo.usesTypeScript ? ['.tsx', '.jsx', '.js', '.ts'] : ['.jsx', '.js'];
  const componentFiles = [];
  async function findFiles(dir) {
    const entries = await fs.readdir(dir, {
      withFileTypes: true
    });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      // Skip node_modules and other common exclusions
      if (entry.isDirectory() && !['node_modules', 'dist', '.git', 'build'].includes(entry.name)) {
        await findFiles(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (extensions.includes(ext)) {
          componentFiles.push(fullPath);

          // Check if it's an entry point
          if (entry.name === 'main.jsx' || entry.name === 'main.tsx' || entry.name === 'index.jsx' || entry.name === 'index.tsx' || entry.name === 'App.jsx' || entry.name === 'App.tsx') {
            context.entryPoints.push(fullPath);
          }

          // Check if it's a route file
          if (entry.name === 'routes.jsx' || entry.name === 'routes.tsx' || entry.name.includes('Route') || entry.name.includes('router')) {
            context.routeFiles.push(fullPath);
          }
        }
      }
    }
  }
  await findFiles(sourcePath);
  context.componentFiles = componentFiles;
  if (options.verbose) {
    console.log(`Found ${componentFiles.length} potential component files`);
    console.log(`Build system: ${context.projectInfo.buildSystem}`);
    console.log(`TypeScript: ${context.projectInfo.usesTypeScript ? 'Yes' : 'No'}`);
    console.log(`Router: ${context.projectInfo.router}`);
  }
  return context;
}

/**
 * Phase 2: Copy project files to the output directory
 * @param {Object} context - Porting context
 */
async function copyProjectFiles(context) {
  const {
    sourcePath,
    outputPath
  } = context;

  // Create output directory
  await fs.ensureDir(outputPath);

  // Copy all files except node_modules and build artifacts
  await fs.copy(sourcePath, outputPath, {
    filter: src => {
      const relativePath = path.relative(sourcePath, src);
      return !relativePath.startsWith('node_modules') && !relativePath.startsWith('dist') && !relativePath.startsWith('build') && !relativePath.startsWith('.git');
    }
  });
  return context;
}

/**
 * Phase 3: Transform React components
 * @param {Object} context - Porting context
 */
async function transformComponents(context) {
  const {
    componentFiles,
    sourcePath,
    outputPath,
    options
  } = context;
  const enhancementLevel = options.level || 'standard';
  const useAI = isAIAvailable();
  if (useAI && options.verbose) {
    console.log('Using AI for component enhancement');
  }

  // Map containing all component information
  const componentMap = new Map();

  // First pass: identify components
  for (const sourceFilePath of componentFiles) {
    try {
      // Calculate the destination path for this file
      const relativePath = path.relative(sourcePath, sourceFilePath);
      const destFilePath = path.join(outputPath, relativePath);

      // Only read from the source path
      const content = await fs.readFile(sourceFilePath, 'utf-8');

      // Parse the file
      const ast = parse_1(content, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
        tokens: true
      });

      // Find components in the file
      const components = [];
      traverse(ast, {
        // Function components
        FunctionDeclaration(path) {
          if (isReactComponent(path)) {
            const component = extractComponent(path);
            if (component) {
              components.push(component);
            }
          }
        },
        // Arrow function components
        VariableDeclarator(path) {
          if (libExports.isArrowFunctionExpression(path.node.init) && isReactComponent(path)) {
            const component = extractComponent(path);
            if (component) {
              components.push(component);
            }
          }
        },
        // Class components
        ClassDeclaration(path) {
          if (isReactClassComponent(path)) {
            const component = extractClassComponent(path);
            if (component) {
              components.push(component);
            }
          }
        }
      });
      if (components.length > 0) {
        // Store in map with destination path as key, but include source content
        componentMap.set(destFilePath, {
          components,
          content,
          sourceFilePath
        });
      }
    } catch (error) {
      const relativePath = path.relative(sourcePath, sourceFilePath);
      if (options.verbose) {
        console.warn(`Warning: Could not parse ${relativePath}: ${error.message}`);
      }
    }
  }
  context.componentMap = componentMap;

  // Second pass: enhance components
  const enhancedFiles = [];
  for (const [destFilePath, fileInfo] of componentMap.entries()) {
    try {
      let newContent = fileInfo.content;
      let contentModified = false;

      // Choose enhancement strategy based on component
      for (const component of fileInfo.components) {
        if (useAI) {
          // Use AI for enhanced analysis
          const provider = getBestProvider();
          if (provider) {
            try {
              // AI enhancement logic
              const aiEnhancement = await simulateAIAnalysis(component, provider.id);
              component.aiSuggestions = aiEnhancement;
            } catch (error) {
              if (options.verbose) {
                console.warn(`Warning: AI enhancement failed for ${component.name}: ${error.message}`);
              }
            }
          }
        }

        // Apply enhancements based on component type and level
        let enhancedContent;
        if (component.type === 'function' || component.type === 'arrow') {
          enhancedContent = enhanceFunctionComponent(newContent, component, enhancementLevel);
        } else if (component.type === 'class') {
          enhancedContent = enhanceClassComponent(newContent, component, enhancementLevel);
        }

        // Check if content was actually changed
        if (enhancedContent && enhancedContent !== newContent) {
          newContent = enhancedContent;
          contentModified = true;
          if (options.verbose) {
            console.log(`Enhanced component: ${component.name}`);
          }
        } else if (options.verbose) {
          console.log(`No changes applied to component: ${component.name}`);
        }
      }

      // Add necessary imports if content was modified
      if (contentModified) {
        try {
          const withImports = addAartisanImports(newContent, fileInfo.components, enhancementLevel);
          if (withImports !== newContent) {
            newContent = withImports;
            if (options.verbose) {
              console.log(`Added Aartisan imports to file: ${path.relative(outputPath, destFilePath)}`);
            }
          }
        } catch (error) {
          console.warn(`Warning: Failed to add imports: ${error.message}`);
        }

        // Ensure the destination directory exists
        await fs.ensureDir(path.dirname(destFilePath));

        // Write to the destination file path
        await fs.writeFile(destFilePath, newContent, 'utf-8');
        enhancedFiles.push(path.relative(outputPath, destFilePath));
      }
    } catch (error) {
      const relativePath = path.relative(outputPath, destFilePath);
      if (options.verbose) {
        console.warn(`Warning: Could not enhance ${relativePath}: ${error.message}`);
      }
    }
  }
  console.log(`Enhanced ${enhancedFiles.length} component files`);
  return context;
}

/**
 * Phase 4: Integrate Aartisan provider in the app root
 * @param {Object} context - Porting context
 */
async function integrateAartisanProvider(context) {
  const {
    entryPoints,
    outputPath,
    options
  } = context;
  if (entryPoints.length === 0) {
    console.warn(chalk.yellow('Warning: No entry points found, skipping Aartisan provider integration'));
    return context;
  }

  // Find the main entry file first (most likely to contain the rendering logic)
  const mainEntryFiles = entryPoints.filter(file => {
    const filename = path.basename(file).toLowerCase();
    return filename === 'main.jsx' || filename === 'main.tsx' || filename === 'index.jsx' || filename === 'index.tsx';
  });

  // If no main files found, try all entry points
  const filesToCheck = mainEntryFiles.length > 0 ? mainEntryFiles : entryPoints;
  let integrationSuccessful = false;

  // Attempt to integrate with entry files
  for (const entryFile of filesToCheck) {
    const relativePath = path.relative(outputPath, entryFile);
    const outputFilePath = path.join(outputPath, relativePath);
    try {
      const content = await fs.readFile(outputFilePath, 'utf-8');

      // Parse the file
      const ast = parse_1(content, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript']
      });
      let modified = false;

      // Add import for AartisanProvider if not already present
      traverse(ast, {
        Program(path) {
          // Check if AartisanProvider is already imported
          const hasAartisanImport = path.node.body.some(node => libExports.isImportDeclaration(node) && node.source.value.includes('aartisan') && node.specifiers.some(spec => (libExports.isImportSpecifier(spec) || libExports.isImportDefaultSpecifier(spec)) && spec.local.name === 'AartisanProvider'));
          if (!hasAartisanImport) {
            const importDeclaration = libExports.importDeclaration([libExports.importSpecifier(libExports.identifier('AartisanProvider'), libExports.identifier('AartisanProvider'))], libExports.stringLiteral('aartisan/react'));
            path.node.body.unshift(importDeclaration);
            modified = true;
          }
        }
      });

      // Identify common render patterns and wrap App component
      let rootElementFound = false;

      // 1. Look for ReactDOM.createRoot().render(<App />) pattern (React 18)
      traverse(ast, {
        CallExpression(path) {
          if (rootElementFound) return;

          // Find the render() call in createRoot().render()
          if (libExports.isMemberExpression(path.node.callee) && path.node.callee.property && path.node.callee.property.name === 'render') {
            // Check if it's part of createRoot chain
            const calleeObject = path.node.callee.object;
            if (libExports.isCallExpression(calleeObject) && (libExports.isIdentifier(calleeObject.callee) && calleeObject.callee.name === 'createRoot' || libExports.isMemberExpression(calleeObject.callee) && calleeObject.callee.property.name === 'createRoot')) {
              // Found createRoot().render(), now check its argument
              if (path.node.arguments.length > 0) {
                const renderArg = path.node.arguments[0];

                // Only wrap if it's not already wrapped with AartisanProvider
                if (!isWrappedWithAartisanProvider(renderArg)) {
                  path.node.arguments[0] = wrapWithAartisanProvider(renderArg, context);
                  modified = true;
                  rootElementFound = true;
                }
              }
            }
          }
        }
      });

      // 2. Look for ReactDOM.render(<App />, document.getElementById('root')) pattern (React 17 and earlier)
      if (!rootElementFound) {
        traverse(ast, {
          CallExpression(path) {
            if (rootElementFound) return;
            if (libExports.isMemberExpression(path.node.callee) && path.node.callee.object && path.node.callee.object.name === 'ReactDOM' && path.node.callee.property && path.node.callee.property.name === 'render' && path.node.arguments.length >= 2) {
              const renderArg = path.node.arguments[0];

              // Only wrap if it's not already wrapped with AartisanProvider
              if (!isWrappedWithAartisanProvider(renderArg)) {
                path.node.arguments[0] = wrapWithAartisanProvider(renderArg, context);
                modified = true;
                rootElementFound = true;
              }
            }
          }
        });
      }

      // 3. Look for direct render(<App />) pattern (some frameworks)
      if (!rootElementFound) {
        traverse(ast, {
          CallExpression(path) {
            if (rootElementFound) return;
            if (libExports.isIdentifier(path.node.callee) && path.node.callee.name === 'render' && path.node.arguments.length >= 1) {
              const renderArg = path.node.arguments[0];

              // Only wrap if it's not already wrapped with AartisanProvider
              if (!isWrappedWithAartisanProvider(renderArg)) {
                path.node.arguments[0] = wrapWithAartisanProvider(renderArg, context);
                modified = true;
                rootElementFound = true;
              }
            }
          }
        });
      }

      // 4. Look for special patterns like hydrateRoot in Next.js or other frameworks
      if (!rootElementFound) {
        traverse(ast, {
          CallExpression(path) {
            if (rootElementFound) return;

            // Check for hydrateRoot, hydrate, or other framework-specific render functions
            if (libExports.isIdentifier(path.node.callee) && ['hydrateRoot', 'hydrate', 'renderToDOM'].includes(path.node.callee.name) || libExports.isMemberExpression(path.node.callee) && path.node.callee.property && ['hydrateRoot', 'hydrate'].includes(path.node.callee.property.name)) {
              if (path.node.arguments.length >= 2) {
                // For hydrateRoot(container, <App />, ...) the JSX is the second argument
                const renderArg = path.node.arguments[1];
                if (libExports.isJSXElement(renderArg) && !isWrappedWithAartisanProvider(renderArg)) {
                  path.node.arguments[1] = wrapWithAartisanProvider(renderArg, context);
                  modified = true;
                  rootElementFound = true;
                }
              } else if (path.node.arguments.length >= 1) {
                // For some frameworks it might be the first argument
                const renderArg = path.node.arguments[0];
                if (libExports.isJSXElement(renderArg) && !isWrappedWithAartisanProvider(renderArg)) {
                  path.node.arguments[0] = wrapWithAartisanProvider(renderArg, context);
                  modified = true;
                  rootElementFound = true;
                }
              }
            }
          }
        });
      }
      if (modified) {
        // Generate the modified code
        const output = generate(ast, {}, content);
        await fs.writeFile(outputFilePath, output.code);
        console.log(`Integrated AartisanProvider in ${relativePath}`);
        integrationSuccessful = true;
        if (rootElementFound) {
          // If we successfully integrated with the root, we can stop processing
          break;
        }
      } else if (options.verbose) {
        console.log(`No integration point found in ${relativePath}`);
      }
    } catch (error) {
      console.error(`Error processing ${path.relative(outputPath, entryFile)}: ${error.message}`);
      if (options.verbose) {
        console.error(error.stack);
      }
    }
  }

  // If no integration was successful, try to create a wrapper in a new file
  if (!integrationSuccessful && options.createWrapper !== false) {
    try {
      await createWrapperFile(context);
      integrationSuccessful = true;
    } catch (error) {
      console.error(`Error creating wrapper file: ${error.message}`);
      if (options.verbose) {
        console.error(error.stack);
      }
    }
  }
  if (!integrationSuccessful) {
    console.warn(chalk.yellow(`
Warning: Could not automatically integrate AartisanProvider.
You will need to manually add it to your application root.

Example:
import { AartisanProvider } from 'aartisan/react';

// Wrap your app root component
<AartisanProvider config={{ appName: 'Your App Name' }}>
  <App />
</AartisanProvider>
    `));
  }
  return context;
}

/**
 * Helper function to check if an element is already wrapped with AartisanProvider
 * @param {Object} node - Node to check
 * @returns {boolean} Whether it's wrapped with AartisanProvider
 */
function isWrappedWithAartisanProvider(node) {
  if (!node) return false;

  // Check if node is a JSX element with AartisanProvider
  if (libExports.isJSXElement(node) && node.openingElement && node.openingElement.name && node.openingElement.name.name === 'AartisanProvider') {
    return true;
  }

  // Check JSX expressions like {<AartisanProvider>...</AartisanProvider>}
  if (libExports.isJSXExpressionContainer(node) && libExports.isJSXElement(node.expression)) {
    return isWrappedWithAartisanProvider(node.expression);
  }
  return false;
}

/**
 * Helper function to wrap a node with AartisanProvider
 * @param {Object} node - Node to wrap
 * @param {Object} context - Porting context
 * @returns {Object} Wrapped node
 */
function wrapWithAartisanProvider(node, context) {
  // Create config object
  const configExpression = libExports.objectExpression([libExports.objectProperty(libExports.identifier('appName'), libExports.stringLiteral(context.projectInfo.packageJson.name || 'Aartisan App')), libExports.objectProperty(libExports.identifier('appPurpose'), libExports.stringLiteral('web-application'))]);

  // For JSX elements, wrap directly
  if (libExports.isJSXElement(node)) {
    return libExports.jsxElement(libExports.jsxOpeningElement(libExports.jsxIdentifier('AartisanProvider'), [libExports.jsxAttribute(libExports.jsxIdentifier('config'), libExports.jsxExpressionContainer(configExpression))], false), libExports.jsxClosingElement(libExports.jsxIdentifier('AartisanProvider')), [node], false);
  }

  // For JSX expressions, extract the inner element and wrap it
  if (libExports.isJSXExpressionContainer(node) && libExports.isJSXElement(node.expression)) {
    return libExports.jsxExpressionContainer(wrapWithAartisanProvider(node.expression, context));
  }

  // For identifiers (like <App />), create a new JSX element
  if (libExports.isIdentifier(node) || libExports.isJSXIdentifier(node)) {
    const nodeName = node.name;
    return libExports.jsxElement(libExports.jsxOpeningElement(libExports.jsxIdentifier('AartisanProvider'), [libExports.jsxAttribute(libExports.jsxIdentifier('config'), libExports.jsxExpressionContainer(configExpression))], false), libExports.jsxClosingElement(libExports.jsxIdentifier('AartisanProvider')), [libExports.jsxElement(libExports.jsxOpeningElement(libExports.jsxIdentifier(nodeName), [], true), null, [], true)], false);
  }

  // For other types, return as is (this would be unusual)
  return node;
}

/**
 * Create a wrapper file that imports the original App and wraps it with AartisanProvider
 * @param {Object} context - Porting context
 */
async function createWrapperFile(context) {
  const {
    outputPath,
    projectInfo
  } = context;

  // Determine source file path patterns based on project structure
  let appFilePath = path.join(outputPath, 'src', 'App.tsx');
  if (!(await fs.pathExists(appFilePath))) {
    appFilePath = path.join(outputPath, 'src', 'App.jsx');
  }
  if (!(await fs.pathExists(appFilePath))) {
    appFilePath = path.join(outputPath, 'src', 'app.tsx');
  }
  if (!(await fs.pathExists(appFilePath))) {
    appFilePath = path.join(outputPath, 'src', 'app.jsx');
  }

  // If we can't find the App file, we can't create a wrapper
  if (!(await fs.pathExists(appFilePath))) {
    throw new Error("Could not locate App component file");
  }

  // Determine the extension to use
  const ext = path.extname(appFilePath);

  // Create a new wrapper file
  const wrapperFilePath = path.join(outputPath, 'src', `AartisanApp${ext}`);

  // Create wrapper content
  const appFileName = path.basename(appFilePath, ext);
  const wrapperContent = `import { AartisanProvider } from 'aartisan/react';
import ${appFileName} from './${appFileName}';

/**
 * AartisanApp
 * 
 * This component wraps the main App component with the AartisanProvider
 * to provide AI-optimization features throughout the application.
 */
export default function AartisanApp() {
  return (
    <AartisanProvider 
      config={{
        appName: '${projectInfo.packageJson.name || 'Aartisan App'}',
        appPurpose: 'web-application',
        accessibilityLevel: 'AA'
      }}
    >
      <${appFileName} />
    </AartisanProvider>
  );
}
`;

  // Write the wrapper file
  await fs.writeFile(wrapperFilePath, wrapperContent);
  console.log(`Created AartisanProvider wrapper file at ${path.relative(outputPath, wrapperFilePath)}`);

  // Now update the main entry point to use this wrapper
  const entryFiles = [path.join(outputPath, 'src', 'main.tsx'), path.join(outputPath, 'src', 'main.jsx'), path.join(outputPath, 'src', 'index.tsx'), path.join(outputPath, 'src', 'index.jsx')];
  let entryFileUpdated = false;
  for (const entryFile of entryFiles) {
    if (await fs.pathExists(entryFile)) {
      try {
        let content = await fs.readFile(entryFile, 'utf-8');

        // Replace imports of App with AartisanApp
        content = content.replace(/import\s+App\s+from\s+['"]\.\/App['"];?/g, `import App from './AartisanApp';`);
        content = content.replace(/import\s+App\s+from\s+['"]\.\/app['"];?/g, `import App from './AartisanApp';`);
        content = content.replace(/import\s+{\s*App\s*}\s+from\s+['"]\.\/App['"];?/g, `import { App } from './AartisanApp';`);

        // Write the updated content
        await fs.writeFile(entryFile, content);
        console.log(`Updated imports in ${path.relative(outputPath, entryFile)}`);
        entryFileUpdated = true;

        // Only update one entry file
        break;
      } catch (error) {
        console.warn(`Warning: Could not update ${path.relative(outputPath, entryFile)}: ${error.message}`);
      }
    }
  }
  if (!entryFileUpdated) {
    console.warn(chalk.yellow(`
Warning: Created AartisanApp wrapper but could not update entry files.
You will need to manually update your entry file to import from './AartisanApp' instead of './App'.
`));
  }
}

/**
 * Phase 5: Update configuration files
 * @param {Object} context - Porting context
 */
async function updateConfiguration(context) {
  const {
    outputPath,
    projectInfo,
    options
  } = context;

  // Update package.json to add aartisan dependency
  const packageJsonPath = path.join(outputPath, 'package.json');
  if (await fs.pathExists(packageJsonPath)) {
    const packageJson = await fs.readJson(packageJsonPath);

    // Add aartisan to dependencies
    if (!packageJson.dependencies) {
      packageJson.dependencies = {};
    }
    packageJson.dependencies.aartisan = '^0.1.0';

    // Write updated package.json
    await fs.writeJson(packageJsonPath, packageJson, {
      spaces: 2
    });
  }

  // Configure build system
  if (projectInfo.buildSystem === 'vite') {
    await configureVite(outputPath, options);
  } else if (projectInfo.buildSystem === 'webpack') {
    await configureWebpack(outputPath, options);
  } else if (projectInfo.buildSystem === 'cra') {
    await configureCRA(outputPath, options);
  }
  return context;
}

/**
 * Phase 6: Finalize project
 * @param {Object} context - Porting context
 */
async function finalizeProject(context) {
  const {
    outputPath
  } = context;

  // Create a README.md file if it doesn't exist
  const readmePath = path.join(outputPath, 'README.md');
  if (!(await fs.pathExists(readmePath))) {
    const readmeContent = generateReadme(context);
    await fs.writeFile(readmePath, readmeContent);
  } else {
    // Append Aartisan information to existing README
    const existingReadme = await fs.readFile(readmePath, 'utf-8');
    const aartisanInfo = generateAartisanReadmeSection();
    await fs.writeFile(readmePath, `${existingReadme}\n\n${aartisanInfo}`);
  }
  return context;
}

/**
 * Helper: Configure Vite project
 * @param {string} outputPath - Project output path
 * @param {Object} options - Configuration options
 */
async function configureVite(outputPath, options) {
  const viteConfigPaths = [path.join(outputPath, 'vite.config.js'), path.join(outputPath, 'vite.config.ts')];
  let viteConfigPath;
  for (const configPath of viteConfigPaths) {
    if (await fs.pathExists(configPath)) {
      viteConfigPath = configPath;
      break;
    }
  }
  if (!viteConfigPath) {
    if (options.verbose) {
      console.warn('No Vite config file found, skipping Vite configuration');
    }
    return;
  }
  try {
    const content = await fs.readFile(viteConfigPath, 'utf-8');

    // Parse the file
    const ast = parse_1(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
    let modified = false;

    // Add import for aartisan-vite-plugin
    traverse(ast, {
      Program(path) {
        // Check if aartisan is already imported
        const hasAartisanImport = path.node.body.some(node => libExports.isImportDeclaration(node) && node.source.value.includes('aartisan'));
        if (!hasAartisanImport) {
          const importDeclaration = libExports.importDeclaration([libExports.importDefaultSpecifier(libExports.identifier('aartisan'))], libExports.stringLiteral('aartisan/vite-plugin'));
          path.node.body.unshift(importDeclaration);
          modified = true;
        }
      },
      CallExpression(path) {
        // Find the defineConfig call
        if (path.node.callee.name === 'defineConfig') {
          const configArg = path.node.arguments[0];
          if (libExports.isObjectExpression(configArg)) {
            // Find the plugins array
            const pluginsProperty = configArg.properties.find(prop => libExports.isObjectProperty(prop) && prop.key.name === 'plugins');
            if (pluginsProperty && libExports.isArrayExpression(pluginsProperty.value)) {
              // Check if aartisan plugin is already added
              const hasAartisanPlugin = pluginsProperty.value.elements.some(element => libExports.isCallExpression(element) && element.callee.name === 'aartisan');
              if (!hasAartisanPlugin) {
                // Create aartisan plugin call
                const aartisanOptions = libExports.objectExpression([libExports.objectProperty(libExports.identifier('optimizationLevel'), libExports.stringLiteral(options.level || 'standard')), libExports.objectProperty(libExports.identifier('accessibilityFeatures'), libExports.booleanLiteral(true))]);
                const aartisanCall = libExports.callExpression(libExports.identifier('aartisan'), [aartisanOptions]);

                // Add to plugins array
                pluginsProperty.value.elements.push(aartisanCall);
                modified = true;
              }
            }
          }
        }
      }
    });
    if (modified) {
      // Generate the modified code
      const output = generate(ast, {}, content);
      await fs.writeFile(viteConfigPath, output.code);
      if (options.verbose) {
        console.log(`Updated Vite configuration at ${viteConfigPath}`);
      }
    }
  } catch (error) {
    if (options.verbose) {
      console.warn(`Warning: Could not update Vite configuration: ${error.message}`);
    }
  }
}

/**
 * Helper: Configure Webpack project
 * @param {string} outputPath - Project output path
 * @param {Object} options - Configuration options
 */
async function configureWebpack(outputPath, options) {
  // Implementation for webpack configuration
  // This is a placeholder for now
  if (options.verbose) {
    console.log('Webpack configuration is not yet implemented');
  }
}

/**
 * Helper: Configure Create React App project
 * @param {string} outputPath - Project output path
 * @param {Object} options - Configuration options
 */
async function configureCRA(outputPath, options) {
  // Implementation for CRA configuration
  // This is a placeholder for now
  if (options.verbose) {
    console.log('Create React App configuration is not yet implemented');
  }
}

/**
 * Helper: Check if a node is a React component
 * @param {Object} path - Babel path
 * @returns {boolean} Whether it's a React component
 */
function isReactComponent(path) {
  // For function declarations
  if (libExports.isFunctionDeclaration(path.node)) {
    // Check if it returns JSX
    let returnsJSX = false;
    path.traverse({
      ReturnStatement(returnPath) {
        const returnArg = returnPath.node.argument;
        if (libExports.isJSXElement(returnArg) || libExports.isJSXFragment(returnArg)) {
          returnsJSX = true;
        }
      }
    });
    return returnsJSX;
  }

  // For arrow functions
  if (libExports.isVariableDeclarator(path.node) && libExports.isArrowFunctionExpression(path.node.init)) {
    const body = path.node.init.body;
    if (libExports.isJSXElement(body) || libExports.isJSXFragment(body)) {
      return true;
    }

    // Check for JSX in block body
    if (libExports.isBlockStatement(body)) {
      let returnsJSX = false;
      path.get('init').traverse({
        ReturnStatement(returnPath) {
          const returnArg = returnPath.node.argument;
          if (libExports.isJSXElement(returnArg) || libExports.isJSXFragment(returnArg)) {
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
 * Helper: Check if a node is a React class component
 * @param {Object} path - Babel path
 * @returns {boolean} Whether it's a React class component
 */
function isReactClassComponent(path) {
  if (!libExports.isClassDeclaration(path.node)) {
    return false;
  }

  // Check if extends React.Component or Component
  const superClass = path.node.superClass;
  if (!superClass) {
    return false;
  }
  if (libExports.isMemberExpression(superClass)) {
    return superClass.object.name === 'React' && superClass.property.name === 'Component';
  }
  return superClass.name === 'Component';
}

/**
 * Helper: Extract component information
 * @param {Object} path - Babel path
 * @returns {Object|null} Component information
 */
function extractComponent(path) {
  let componentName = '';
  let componentType = '';
  let props = [];

  // Get component name and type
  if (libExports.isFunctionDeclaration(path.node)) {
    componentName = path.node.id.name;
    componentType = 'function';
  } else if (libExports.isVariableDeclarator(path.node)) {
    componentName = path.node.id.name;
    componentType = 'arrow';
  }

  // Skip if component doesn't have a name
  if (!componentName) {
    return null;
  }

  // Extract props
  if (libExports.isFunctionDeclaration(path.node) && path.node.params.length > 0) {
    props = extractProps(path.node.params[0]);
  } else if (libExports.isVariableDeclarator(path.node) && path.node.init.params && path.node.init.params.length > 0) {
    props = extractProps(path.node.init.params[0]);
  }

  // Analyze component code to infer purpose
  const purpose = inferPurpose(componentName);

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
    props,
    purpose,
    jsxElements,
    eventHandlers,
    node: path.node
  };
}

/**
 * Helper: Extract class component information
 * @param {Object} path - Babel path
 * @returns {Object|null} Component information
 */
function extractClassComponent(path) {
  if (!path.node.id) {
    return null;
  }
  const componentName = path.node.id.name;

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
  const purpose = inferPurpose(componentName);
  return {
    name: componentName,
    type: 'class',
    methods,
    jsxElements,
    eventHandlers,
    purpose,
    node: path.node
  };
}

/**
 * Helper: Extract props from a component parameter
 * @param {Object} param - Babel parameter node
 * @returns {Array} Array of prop metadata
 */
function extractProps(param) {
  const props = [];

  // Handle object pattern (destructured props)
  if (libExports.isObjectPattern(param)) {
    param.properties.forEach(prop => {
      if (libExports.isObjectProperty(prop) && libExports.isIdentifier(prop.key)) {
        props.push({
          name: prop.key.name,
          required: false
        });
      } else if (libExports.isRestElement(prop) && libExports.isIdentifier(prop.argument)) {
        props.push({
          name: prop.argument.name,
          isRest: true
        });
      }
    });
  }
  // Handle identifier (props as a single object)
  else if (libExports.isIdentifier(param)) {
    props.push({
      name: param.name,
      isObject: true
    });
  }
  return props;
}

/**
 * Helper: Infer purpose from component name
 * @param {string} componentName - Component name
 * @returns {string} Inferred purpose
 */
function inferPurpose(componentName) {
  // Basic pattern matching for common component types
  if (/button/i.test(componentName)) {
    return 'action-button';
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
  } else if (/nav/i.test(componentName)) {
    return 'navigation';
  } else if (/header/i.test(componentName)) {
    return 'page-header';
  } else if (/footer/i.test(componentName)) {
    return 'page-footer';
  } else if (/modal/i.test(componentName)) {
    return 'modal-dialog';
  } else if (/table/i.test(componentName)) {
    return 'data-table';
  } else if (/chart/i.test(componentName) || /graph/i.test(componentName)) {
    return 'data-visualization';
  } else if (/container/i.test(componentName)) {
    return 'layout-container';
  } else if (/layout/i.test(componentName)) {
    return 'page-layout';
  } else if (/sidebar/i.test(componentName)) {
    return 'navigation-sidebar';
  } else if (/tab/i.test(componentName)) {
    return 'navigation-tab';
  } else if (/dialog/i.test(componentName)) {
    return 'dialog-box';
  } else if (/alert/i.test(componentName) || /notification/i.test(componentName)) {
    return 'notification';
  } else if (/icon/i.test(componentName)) {
    return 'decorative-icon';
  }
  return 'ui-component';
}

/**
 * Helper: Enhance a function component with Aartisan features
 * @param {string} code - Original component code
 * @param {Object} component - Component information
 * @param {string} level - Enhancement level
 * @returns {string} Enhanced component code
 */
function enhanceFunctionComponent(code, component, level) {
  // Special handling for App component
  if (component.name === 'App') {
    // For App component, only use basic directives and avoid hooks
    return addBasicDirectivesToAppComponent(code);
  }

  // Choose enhancement method based on the level
  if (level === 'basic') {
    return addBasicDirectives(code, component);
  } else if (level === 'advanced') {
    return convertToDefineComponent(code, component);
  } else {
    // Default to 'standard' level - using hooks
    return addAIEnhancedHook(code, component);
  }
}

/**
 * Special method for App component to add basic directives without hooks
 * @param {string} code - Original component code
 * @param {Object} component - Component information
 * @returns {string} Enhanced component code
 */
function addBasicDirectivesToAppComponent(code, component) {
  try {
    // Parse the code
    const ast = parse_1(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
    let modified = false;

    // Find the return statement in the App component
    traverse(ast, {
      ReturnStatement(path) {
        // Only process JSX returns
        if (libExports.isJSXElement(path.node.argument)) {
          const jsx = path.node.argument;
          const openingElement = jsx.openingElement;

          // Check if it already has aartisan attributes
          if (!hasAartisanAttributes(openingElement)) {
            // Add data-aartisan attribute
            openingElement.attributes.push(libExports.jsxAttribute(libExports.jsxIdentifier('data-aartisan'), libExports.stringLiteral('true')));

            // Add component purpose attribute
            openingElement.attributes.push(libExports.jsxAttribute(libExports.jsxIdentifier('data-aartisan-purpose'), libExports.stringLiteral('application-root')));

            // Add component name attribute
            openingElement.attributes.push(libExports.jsxAttribute(libExports.jsxIdentifier('data-aartisan-component'), libExports.stringLiteral('App')));
            modified = true;
          }
        }
      }
    });

    // Only generate new code if modifications were made
    if (modified) {
      // Generate the modified code
      const output = generate(ast, {}, code);
      return output.code;
    }

    // If no modifications were made, return the original code
    return code;
  } catch (error) {
    // If parsing fails, return the original code
    console.warn(`Warning: App component enhancement failed: ${error.message}`);
    return code;
  }
}

/**
 * Helper: Enhance a class component with Aartisan features
 * @param {string} code - Original component code
 * @param {Object} component - Component information
 * @param {string} level - Enhancement level
 * @returns {string} Enhanced component code
 */
function enhanceClassComponent(code, component, level) {
  // Class components primarily use the HOC approach
  if (level === 'advanced') {
    return wrapWithAIEnhancementHOC(code, component);
  } else {
    // For basic and standard, add directives to the render method
    return addDirectivesToClassRender(code, component);
  }
}

/**
 * Method 1: Add basic directives to a component
 * @param {string} code - Original component code
 * @param {Object} component - Component information
 * @returns {string} Enhanced component code
 */
function addBasicDirectives(code, component) {
  try {
    // Parse the code
    const ast = parse_1(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
    let modified = false;
    let rootElementsFound = 0;

    // Add directives to the root JSX element
    traverse(ast, {
      JSXElement(path) {
        // Only enhance the root element
        if (isRootJSXElement(path)) {
          rootElementsFound++;
          const openingElement = path.node.openingElement;

          // Check if it already has aartisan attributes
          if (!hasAartisanAttributes(openingElement)) {
            // Add data-aartisan attribute
            openingElement.attributes.push(libExports.jsxAttribute(libExports.jsxIdentifier('data-aartisan'), libExports.stringLiteral('true')));

            // Add component purpose attribute
            openingElement.attributes.push(libExports.jsxAttribute(libExports.jsxIdentifier('data-aartisan-purpose'), libExports.stringLiteral(component.purpose)));

            // Add component name attribute
            openingElement.attributes.push(libExports.jsxAttribute(libExports.jsxIdentifier('data-aartisan-component'), libExports.stringLiteral(component.name)));
            modified = true;
          }
        }
      }
    });

    // Only generate new code if modifications were made
    if (modified) {
      console.log(`Enhanced ${component.name}: Added directives to ${rootElementsFound} JSX root elements`);

      // Generate the modified code
      const output = generate(ast, {}, code);
      return output.code;
    } else {
      console.log(`No enhancements applied to ${component.name} (found ${rootElementsFound} root elements)`);
    }

    // If no modifications were made, return the original code
    return code;
  } catch (error) {
    // If parsing fails, return the original code
    console.warn(`Warning: Basic directive enhancement failed for ${component.name}: ${error.message}`);
    return code;
  }
}

/**
 * Method 2: Add useAIEnhanced hook to a component
 * @param {string} code - Original component code
 * @param {Object} component - Component information
 * @returns {string} Enhanced component code
 */
function addAIEnhancedHook(code, component) {
  try {
    // Parse the code
    const ast = parse_1(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
    let modified = false;

    // Add the hook
    traverse(ast, {
      // For function declarations
      FunctionDeclaration(path) {
        if (path.node.id && path.node.id.name === component.name) {
          modified = addHookToFunction(path, component) || modified;
        }
      },
      // For arrow functions
      VariableDeclarator(path) {
        if (path.node.id && path.node.id.name === component.name && libExports.isArrowFunctionExpression(path.node.init)) {
          modified = addHookToArrowFunction(path, component) || modified;
        }
      }
    });
    if (!modified) {
      // If hook couldn't be added, fall back to basic method
      return addBasicDirectives(code, component);
    }

    // Generate the modified code
    const output = generate(ast, {}, code);
    return output.code;
  } catch (error) {
    // If parsing fails, fall back to basic method
    console.warn(`Warning: Hook enhancement failed for ${component.name}: ${error.message}`);
    return addBasicDirectives(code, component);
  }
}

/**
 * Method 3: Convert to defineComponent approach
 * @param {string} code - Original component code
 * @param {Object} component - Component information
 * @returns {string} Enhanced component code
 */
function convertToDefineComponent(code, component) {
  try {
    // Parse the code
    const ast = parse_1(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });

    // Convert function to defineComponent
    // This is more complex as we need to restructure the component
    // For now, we'll fall back to the hook approach
    return addAIEnhancedHook(code, component);
  } catch (error) {
    console.warn(`Warning: defineComponent conversion failed for ${component.name}: ${error.message}`);
    return addAIEnhancedHook(code, component);
  }
}

/**
 * Method 4: Add directives to class component render method
 * @param {string} code - Original component code
 * @param {Object} component - Component information
 * @returns {string} Enhanced component code
 */
function addDirectivesToClassRender(code, component) {
  try {
    // Parse the code
    const ast = parse_1(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
    let directivesAdded = false;

    // Find render method and add directives
    traverse(ast, {
      ClassMethod(path) {
        if (path.node.key && path.node.key.name === 'render') {
          path.traverse({
            JSXElement(jsxPath) {
              // Only enhance the root element
              if (isRootJSXElement(jsxPath)) {
                const openingElement = jsxPath.node.openingElement;

                // Check if it already has aartisan attributes
                if (!hasAartisanAttributes(openingElement)) {
                  // Add data-aartisan attribute
                  openingElement.attributes.push(libExports.jsxAttribute(libExports.jsxIdentifier('data-aartisan'), libExports.stringLiteral('true')));

                  // Add component purpose attribute
                  openingElement.attributes.push(libExports.jsxAttribute(libExports.jsxIdentifier('data-aartisan-purpose'), libExports.stringLiteral(component.purpose)));

                  // Add component name attribute
                  openingElement.attributes.push(libExports.jsxAttribute(libExports.jsxIdentifier('data-aartisan-component'), libExports.stringLiteral(component.name)));
                  directivesAdded = true;
                }
              }
            }
          });
        }
      }
    });
    if (!directivesAdded) {
      // If directives couldn't be added, keep the original code
      return code;
    }

    // Generate the modified code
    const output = generate(ast, {}, code);
    return output.code;
  } catch (error) {
    console.warn(`Warning: Class directive enhancement failed for ${component.name}: ${error.message}`);
    return code;
  }
}

/**
 * Method 5: Wrap class component with withAIEnhancement HOC
 * @param {string} code - Original component code
 * @param {Object} component - Component information
 * @returns {string} Enhanced component code
 */
function wrapWithAIEnhancementHOC(code, component) {
  // This would be a more extensive transformation
  // For now, we'll use the simpler directives approach
  return addDirectivesToClassRender(code, component);
}

/**
 * Helper: Add useAIEnhanced hook to a function component
 * @param {Object} path - Babel path
 * @param {Object} component - Component information
 */
function addHookToFunction(path, component) {
  // Create the hook call
  const hookCall = libExports.variableDeclaration('const', [libExports.variableDeclarator(libExports.objectPattern([libExports.objectProperty(libExports.identifier('ref'), libExports.identifier('ref'), false, true), libExports.objectProperty(libExports.identifier('aiProps'), libExports.identifier('aiProps'), false, true)]), libExports.callExpression(libExports.identifier('useAIEnhanced'), [libExports.stringLiteral(component.name), libExports.objectExpression([libExports.objectProperty(libExports.identifier('purpose'), libExports.stringLiteral(component.purpose)), libExports.objectProperty(libExports.identifier('interactions'), libExports.arrayExpression(component.eventHandlers.filter(handler => handler && handler.startsWith('on')).map(handler => handler.replace(/^on/, '').toLowerCase()).map(interaction => libExports.stringLiteral(interaction))))])]))]);
  let modified = false;

  // Add hook at the beginning of the function body
  if (libExports.isBlockStatement(path.node.body)) {
    path.node.body.body.unshift(hookCall);

    // Find the return statement with JSX
    let returnFound = false;
    path.traverse({
      ReturnStatement(returnPath) {
        // Only process the first return with JSX
        if (returnFound) return;
        if (libExports.isJSXElement(returnPath.node.argument) || libExports.isJSXExpressionContainer(returnPath.node.argument) && libExports.isJSXElement(returnPath.node.argument.expression)) {
          let jsx = libExports.isJSXElement(returnPath.node.argument) ? returnPath.node.argument : returnPath.node.argument.expression;

          // Add ref and aiProps to the root JSX element
          const openingElement = jsx.openingElement;

          // Add ref attribute if not present
          if (!openingElement.attributes.some(attr => libExports.isJSXAttribute(attr) && attr.name.name === 'ref')) {
            openingElement.attributes.push(libExports.jsxAttribute(libExports.jsxIdentifier('ref'), libExports.jsxExpressionContainer(libExports.identifier('ref'))));
          }

          // Add spread aiProps
          openingElement.attributes.push(libExports.jsxSpreadAttribute(libExports.identifier('aiProps')));
          returnFound = true;
          modified = true;
        }
      }
    });
  }
  return modified;
}

/**
 * Helper: Add useAIEnhanced hook to an arrow function component
 * @param {Object} path - Babel path
 * @param {Object} component - Component information
 */
function addHookToArrowFunction(path, component) {
  // Create the hook call
  const hookCall = libExports.variableDeclaration('const', [libExports.variableDeclarator(libExports.objectPattern([libExports.objectProperty(libExports.identifier('ref'), libExports.identifier('ref'), false, true), libExports.objectProperty(libExports.identifier('aiProps'), libExports.identifier('aiProps'), false, true)]), libExports.callExpression(libExports.identifier('useAIEnhanced'), [libExports.stringLiteral(component.name), libExports.objectExpression([libExports.objectProperty(libExports.identifier('purpose'), libExports.stringLiteral(component.purpose)), libExports.objectProperty(libExports.identifier('interactions'), libExports.arrayExpression(component.eventHandlers.filter(handler => handler && handler.startsWith('on')).map(handler => handler.replace(/^on/, '').toLowerCase()).map(interaction => libExports.stringLiteral(interaction))))])]))]);
  let modified = false;

  // Handle different arrow function body types
  if (libExports.isBlockStatement(path.node.init.body)) {
    // For arrow functions with block bodies
    path.node.init.body.body.unshift(hookCall);

    // Find the return statement with JSX
    let returnFound = false;
    path.get('init').traverse({
      ReturnStatement(returnPath) {
        // Only process the first return with JSX
        if (returnFound) return;
        if (libExports.isJSXElement(returnPath.node.argument) || libExports.isJSXExpressionContainer(returnPath.node.argument) && libExports.isJSXElement(returnPath.node.argument.expression)) {
          let jsx = libExports.isJSXElement(returnPath.node.argument) ? returnPath.node.argument : returnPath.node.argument.expression;
          enhanceJSXElement(jsx);
          returnFound = true;
          modified = true;
        }
      }
    });
  } else if (libExports.isJSXElement(path.node.init.body)) {
    // For arrow functions with JSX expression bodies
    const jsx = path.node.init.body;
    enhanceJSXElement(jsx);

    // Convert to block statement with hook and return
    path.node.init.body = libExports.blockStatement([hookCall, libExports.returnStatement(jsx)]);
    modified = true;
  }
  return modified;
}

/**
 * Helper: Enhance a JSX element with ref and aiProps
 * @param {Object} jsx - JSX element node
 */
function enhanceJSXElement(jsx) {
  if (!jsx || !jsx.openingElement) return;
  const openingElement = jsx.openingElement;

  // Add ref attribute if not present
  if (!openingElement.attributes.some(attr => libExports.isJSXAttribute(attr) && attr.name.name === 'ref')) {
    openingElement.attributes.push(libExports.jsxAttribute(libExports.jsxIdentifier('ref'), libExports.jsxExpressionContainer(libExports.identifier('ref'))));
  }

  // Add spread aiProps
  openingElement.attributes.push(libExports.jsxSpreadAttribute(libExports.identifier('aiProps')));
}

/**
 * Helper: Check if a JSX element is the root element in a component
 * @param {Object} path - Babel path
 * @returns {boolean} Whether it's the root element
 */
function isRootJSXElement(path) {
  // Check if direct child of return statement
  if (libExports.isReturnStatement(path.parent)) {
    return true;
  }

  // Check if direct child of arrow function
  if (libExports.isArrowFunctionExpression(path.parent) && path.parent.body === path.node) {
    return true;
  }

  // Check if inside a JSXExpressionContainer in a return statement
  if (libExports.isJSXExpressionContainer(path.parent) && libExports.isReturnStatement(path.parent.parent)) {
    return true;
  }

  // Check parent chain for potential return statement (handles nested expressions)
  // MODIFIED: adding depth limit to prevent stack overflow
  let currentPath = path.parentPath;
  let depth = 0;
  const MAX_DEPTH = 10; // Prevent infinite recursion

  while (currentPath && depth < MAX_DEPTH) {
    if (libExports.isReturnStatement(currentPath.node)) {
      // Check if this is the primary expression being returned
      const returnArg = currentPath.node.argument;
      if (returnArg === path.node || libExports.isJSXExpressionContainer(returnArg) && returnArg.expression === path.node) {
        return true;
      }
      break;
    }
    currentPath = currentPath.parentPath;
    depth++;
  }
  return false;
}

/**
 * Helper: Check if JSX element has aartisan attributes
 * @param {Object} openingElement - JSX opening element
 * @returns {boolean} Whether it has aartisan attributes
 */
function hasAartisanAttributes(openingElement) {
  return openingElement.attributes.some(attr => libExports.isJSXAttribute(attr) && attr.name.name === 'data-aartisan');
}

/**
 * Helper: Add necessary imports for Aartisan features
 * @param {string} code - Original component code
 * @param {Array} components - Component information
 * @param {string} level - Enhancement level
 * @returns {string} Code with imports added
 */
function addAartisanImports(code, components, level) {
  try {
    // Parse the code
    const ast = parse_1(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
    let importNeeded = false;
    let importType = '';

    // Determine what imports are needed based on the enhancement level and components
    if (level === 'basic') {
      importNeeded = true;
      importType = 'directive';
    } else if (level === 'advanced') {
      importNeeded = true;
      importType = 'defineComponent';
    } else {
      // For standard level, check if any function components use hooks
      importNeeded = components.some(comp => comp.type === 'function' || comp.type === 'arrow');
      importType = 'hook';
    }
    if (!importNeeded) {
      return code;
    }

    // Check if aartisan is already imported
    let hasAartisanImport = false;
    let existingImportPath = null;
    traverse(ast, {
      ImportDeclaration(path) {
        if (path.node.source.value.includes('aartisan')) {
          hasAartisanImport = true;
          existingImportPath = path;
        }
      }
    });

    // Create import specifiers based on the enhancement type
    let importSpecifiers = [];
    if (importType === 'directive') {
      importSpecifiers = [libExports.importSpecifier(libExports.identifier('aiPurpose'), libExports.identifier('aiPurpose')), libExports.importSpecifier(libExports.identifier('aiInteraction'), libExports.identifier('aiInteraction'))];
    } else if (importType === 'hook') {
      importSpecifiers = [libExports.importSpecifier(libExports.identifier('useAIEnhanced'), libExports.identifier('useAIEnhanced'))];
    } else if (importType === 'defineComponent') {
      importSpecifiers = [libExports.importSpecifier(libExports.identifier('defineComponent'), libExports.identifier('defineComponent'))];
    }

    // Add or update import
    if (hasAartisanImport && existingImportPath) {
      // Add to existing import
      importSpecifiers.forEach(specifier => {
        if (!existingImportPath.node.specifiers.some(s => libExports.isImportSpecifier(s) && s.imported.name === specifier.imported.name)) {
          existingImportPath.node.specifiers.push(specifier);
        }
      });
    } else {
      // Add new import
      const importDeclaration = libExports.importDeclaration(importSpecifiers, libExports.stringLiteral('aartisan/react'));
      ast.program.body.unshift(importDeclaration);
    }

    // Generate the modified code
    const output = generate(ast, {}, code);
    return output.code;
  } catch (error) {
    console.warn(`Warning: Failed to add imports: ${error.message}`);
    return code;
  }
}

/**
 * Helper: Simulate AI analysis for a component
 * @param {Object} component - Component information
 * @param {string} providerId - AI provider ID
 * @returns {Promise<Object>} AI analysis results
 */
async function simulateAIAnalysis(component, providerId) {
  // This is a placeholder implementation
  // In a real implementation, this would call the AI provider API

  // Simulate response delay
  await new Promise(resolve => setTimeout(resolve, 100));

  // Generate some basic analysis based on the component properties
  const enhancedPurpose = component.purpose;
  const relatedComponents = [];
  const accessibility = {
    level: 'medium',
    recommendations: []
  };

  // Add some accessibility recommendations based on component type
  if (component.purpose === 'action-button') {
    accessibility.recommendations.push('Ensure button has accessible name');
    accessibility.recommendations.push('Add appropriate ARIA role if needed');
  } else if (component.purpose === 'input-field') {
    accessibility.recommendations.push('Associate label with input');
    accessibility.recommendations.push('Add clear error messages');
  }
  return {
    enhancedPurpose,
    relatedComponents,
    accessibility,
    providerId
  };
}

/**
 * Helper: Generate README content for the ported project
 * @param {Object} context - Porting context
 * @returns {string} README content
 */
function generateReadme(context) {
  const projectName = context.projectInfo.packageJson.name || 'Aartisan Project';
  return `# ${projectName} (Aartisan Enhanced)

This project has been enhanced with [Aartisan](https://github.com/whyismynamerudy/aartisan), the AI Agent Toolkit for React.

## Aartisan Features

- 🧩 **Enhanced Components**: React components are enhanced with semantic metadata
- 🤖 **AI-Optimized**: Components are more easily understood by AI assistants
- 🔌 **Build-time Optimization**: Includes Vite/Webpack integration
- 🧠 **Semantic Context**: Applications provide rich context about their structure and purpose

## Getting Started

1. Install dependencies:

\`\`\`bash
npm install
\`\`\`

2. Start the development server:

\`\`\`bash
npm run dev
\`\`\`

## Using Aartisan Features

The ported application includes several ways to enhance components:

### Component Introspection
\`\`\`jsx
import { defineComponent } from 'aartisan/react';

const Button = defineComponent({
  name: 'Button',
  semantics: {
    purpose: 'interactive-button',
    interactions: ['click']
  },
  render: (props) => (
    <button onClick={props.onClick}>
      {props.children}
    </button>
  )
});
\`\`\`

### React Hooks
\`\`\`jsx
import { useAIEnhanced } from 'aartisan/react';

function ProductCard({ name, price }) {
  const { ref, aiProps } = useAIEnhanced('product-card', {
    purpose: 'display-product',
    interactions: ['view', 'purchase']
  });
  
  return (
    <div ref={ref} {...aiProps}>
      <h3>{name}</h3>
      <p>${price}</p>
    </div>
  );
}
\`\`\`

### Component Directives
\`\`\`jsx
import { aiPurpose } from 'aartisan/directives';

function Header() {
  return (
    <header {...aiPurpose('page-header')}>
      <h1>My App</h1>
    </header>
  );
}
\`\`\`

## Learn More

- [Aartisan Documentation](https://github.com/whyismynamerudy/aartisan)
- [React Documentation](https://react.dev/)
`;
}

/**
 * Helper: Generate Aartisan section for an existing README
 * @returns {string} README section
 */
function generateAartisanReadmeSection() {
  return `
## Aartisan Enhancement

This project has been enhanced with [Aartisan](https://github.com/whyismynamerudy/aartisan), the AI Agent Toolkit for React.

### Aartisan Features

- 🧩 **Enhanced Components**: React components are enhanced with semantic metadata
- 🤖 **AI-Optimized**: Components are more easily understood by AI assistants
- 🔌 **Build-time Optimization**: Includes Vite/Webpack integration
- 🧠 **Semantic Context**: Applications provide rich context about their structure and purpose

See the [Aartisan documentation](https://github.com/whyismynamerudy/aartisan) for more details.
`;
}

export { portCommand };
//# sourceMappingURL=port.js.map
