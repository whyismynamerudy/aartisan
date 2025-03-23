import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

/**
 * Rollup configuration for building the aartisan package
 */
export default [
  // Main package bundle
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.js',
      format: 'es',
      sourcemap: true
    },
    external: [
      'react',
      'react-dom',
      'fs',
      'path',
      'fs-extra',
      '@babel/core',
      '@babel/parser',
      '@babel/traverse',
      '@babel/types',
      '@babel/generator',
      'chalk',
      'commander',
      'figlet',
      'inquirer',
      'ora'
    ],
    plugins: [
      nodeResolve(),
      commonjs(),
      json(),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' } }],
          '@babel/preset-react'
        ]
      })
    ]
  },
  
  // React integration
  {
    input: 'src/react/index.js',
    output: {
      file: 'dist/react/index.js',
      format: 'es',
      sourcemap: true
    },
    external: [
      'react',
      'react-dom',
      '../core/index.js',
      '../core/metadata.js'
    ],
    plugins: [
      nodeResolve(),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' } }],
          '@babel/preset-react'
        ]
      })
    ]
  },
  
  // Core functionality
  {
    input: 'src/core/index.js',
    output: {
      file: 'dist/core/index.js',
      format: 'es',
      sourcemap: true
    },
    external: [
      './metadata.js'
    ],
    plugins: [
      nodeResolve(),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' } }]
        ]
      })
    ]
  },
  
  // Vite plugin
  {
    input: 'src/vite-plugin/index.js',
    output: {
      file: 'dist/vite-plugin/index.js',
      format: 'es',
      sourcemap: true
    },
    external: [
      'path',
      'fs',
      'fs-extra',
      '@rollup/pluginutils',
      '@babel/core',
      '@babel/parser',
      '@babel/traverse',
      '@babel/types',
      '@babel/generator',
      './transforms.js'
    ],
    plugins: [
      nodeResolve(),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' } }]
        ]
      })
    ]
  },
  
  // Individual module entry points
  {
    input: {
      'core/metadata': 'src/core/metadata.js',
      'react/hooks': 'src/react/hooks.js',
      'react/directives': 'src/react/directives.js',
      'react/provider': 'src/react/provider.jsx',
      'react/defineComponent': 'src/react/defineComponent.jsx',
      'react/hoc': 'src/react/hoc.jsx',
      'vite-plugin/transforms': 'src/vite-plugin/transforms.js',
      'ai/analyze': 'src/ai/analyze.js',
      'ai/index': 'src/ai/index.js'
    },
    output: {
      dir: 'dist',
      format: 'es',
      sourcemap: true,
      entryFileNames: '[name].js'
    },
    external: [
      'react',
      'react-dom',
      'path',
      'fs',
      'fs-extra',
      '@babel/core',
      '@babel/parser',
      '@babel/traverse',
      '@babel/types',
      '@babel/generator',
      '@rollup/pluginutils'
    ],
    plugins: [
      nodeResolve(),
      commonjs(),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' } }],
          '@babel/preset-react'
        ]
      })
    ]
  },

  // CLI commands
  {
    input: {
      'cli/commands/create': 'src/cli/commands/create.js',
      'cli/commands/analyze': 'src/cli/commands/analyze.js',
      'cli/commands/port': 'src/cli/commands/port.js',
      'cli/commands/annotate': 'src/cli/commands/annotate.js',
      'cli/utils/project': 'src/cli/utils/project.js',
      'cli/utils/templates': 'src/cli/utils/templates.js',
      'cli/utils/llm-providers': 'src/cli/utils/llm-providers.js',
    },
    output: {
      dir: 'dist',
      format: 'es',
      sourcemap: true,
      entryFileNames: '[name].js'
    },
    external: [
      'path',
      'fs',
      'fs-extra',
      'chalk',
      'commander',
      'figlet',
      'inquirer',
      'ora',
      'url'
    ],
    plugins: [
      nodeResolve(),
      commonjs(),
      json(),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' } }]
        ]
      })
    ]
  }
];