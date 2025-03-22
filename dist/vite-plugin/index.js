import { createFilter } from '@rollup/pluginutils';
import { generateMetadata, transformJSX } from './transforms.js';

/**
 * aartisan - Vite plugin
 * 
 * Provides build-time optimizations and transformations for AI agent understanding.
 */

/**
 * Default plugin options
 * @type {Object}
 */
const defaultOptions = {
  include: ['**/*.jsx', '**/*.tsx'],
  exclude: ['node_modules/**'],
  optimizationLevel: 'standard',
  // 'basic', 'standard', 'advanced'
  accessibilityFeatures: true,
  culturalContexts: ['global'],
  injectMetadata: true,
  verbose: false
};

/**
 * Creates an aartisan Vite plugin
 * @param {Object} options - Plugin options
 * @returns {Object} Vite plugin
 */
function aartisanPlugin(options = {}) {
  const resolvedOptions = {
    ...defaultOptions,
    ...options
  };

  // Create filter for file processing
  const filter = createFilter(resolvedOptions.include, resolvedOptions.exclude);

  // Metadata cache for components
  const metadataCache = new Map();
  return {
    name: 'aartisan-vite-plugin',
    // Configuration hook
    config(config) {
      if (resolvedOptions.verbose) {
        console.log('[Aartisan] Plugin initialized with options:', resolvedOptions);
      }
      return config;
    },
    // Transform hook for JSX files
    async transform(code, id) {
      // Skip if file doesn't match filter
      if (!filter(id)) {
        return null;
      }

      // Skip if not a JSX/TSX file
      if (!id.endsWith('.jsx') && !id.endsWith('.tsx')) {
        return null;
      }
      try {
        // Transform JSX with aartisan enhancements
        const result = await transformJSX(code, id, resolvedOptions);

        // Store metadata in cache
        if (result.metadata && result.metadata.length > 0) {
          metadataCache.set(id, result.metadata);
        }
        if (resolvedOptions.verbose) {
          console.log(`[Aartisan] Transformed ${id} (${result.metadata?.length || 0} components found)`);
        }
        return {
          code: result.code,
          map: result.map
        };
      } catch (error) {
        // Log error but don't break the build
        console.error(`[Aartisan] Error transforming ${id}:`, error);
        return null;
      }
    },
    // Build hook to generate metadata
    async buildEnd() {
      if (resolvedOptions.injectMetadata && metadataCache.size > 0) {
        if (resolvedOptions.verbose) {
          console.log(`[Aartisan] Generating metadata for ${metadataCache.size} files`);
        }

        // Generate metadata file
        try {
          await generateMetadata(metadataCache, resolvedOptions);
        } catch (error) {
          console.error('[Aartisan] Error generating metadata:', error);
        }
      }
    }
  };
}

export { aartisanPlugin as default };
//# sourceMappingURL=index.js.map
