#!/usr/bin/env node

import chalk from 'chalk';
import figlet from 'figlet';
import { program } from 'commander';
import { createCommand } from '../dist/cli/commands/create.js';
import { analyzeCommand } from '../dist/cli/commands/analyze.js';
import { portCommand } from '../dist/cli/commands/port.js';

// Display ASCII art banner with neon green to purple gradient
const asciiArt = figlet.textSync('Aartisan', {
  font: 'Big',
  horizontalLayout: 'default',
  verticalLayout: 'default',
});

// Create gradient effect by coloring each line
const lines = asciiArt.split('\n');
const totalLines = lines.length;

const gradientBanner = lines.map((line, index) => {
  // Calculate position in the gradient from 0 to 1
  const pos = index / (totalLines - 1);
  
  // Interpolate between neon green and purple
  // Neon green: RGB(57, 255, 20)
  // Purple: RGB(177, 13, 201)
  
  // Simple linear interpolation between colors
  const r = Math.round(57 + (177 - 57) * pos);
  const g = Math.round(255 + (13 - 255) * pos);
  const b = Math.round(20 + (201 - 20) * pos);
  
  return chalk.rgb(r, g, b)(line);
}).join('\n');

console.log(gradientBanner);

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