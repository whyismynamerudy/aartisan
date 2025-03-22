#!/usr/bin/env node

import chalk from 'chalk';
import figlet from 'figlet';
import { program } from 'commander';
import { createCommand } from '../src/cli/commands/create.js';
import { analyzeCommand } from '../src/cli/commands/analyze.js';
import { portCommand } from '../src/cli/commands/port.js';

// Display ASCII art banner
console.log(
  chalk.cyan(
    figlet.textSync('Aartisan', {
      font: 'Big',
      horizontalLayout: 'default',
      verticalLayout: 'default',
    })
  )
);

console.log(chalk.cyan('\n📦 AI Agent Toolkit for React - Create AI-optimized React apps\n'));

// Set up the CLI program
program
  .name('aartisan')
  .description('AI Agent Toolkit for React - Create React applications optimized for AI interaction')
  .version('0.1.0');

// Register commands
createCommand(program);
analyzeCommand(program);
portCommand(program);

// Display help by default if no command is provided
if (process.argv.length <= 2) {
  program.help();
}

// Parse arguments
program.parse(process.argv);