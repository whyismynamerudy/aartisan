import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import path from 'path';
import fs from 'fs-extra';

/**
 * Registers the 'port' command with the provided Commander program
 * @param {import('commander').Command} program - The Commander program instance
 */
export function portCommand(program) {
  program
    .command('port')
    .description('Port an existing React app to use aartisan features')
    .argument('<source>', 'Path to existing React application')
    .option('-o, --output <path>', 'Output directory for the ported application')
    .option('-y, --yes', 'Skip confirmation prompts and use defaults')
    .action(async (source, options) => {
      console.log(chalk.cyan('\n🚢 Porting existing React application...\n'));
      
      try {
        // Resolve the source path
        const sourcePath = path.resolve(process.cwd(), source);
        
        // Check if the source exists
        if (!await fs.pathExists(sourcePath)) {
          console.error(chalk.red(`Error: Source path '${sourcePath}' does not exist`));
          process.exit(1);
        }
        
        // Determine output path
        let outputPath = options.output;
        if (!outputPath) {
          if (!options.yes) {
            const answers = await inquirer.prompt([
              {
                type: 'input',
                name: 'output',
                message: 'Where would you like to output the ported application?',
                default: `${path.basename(sourcePath)}-aartisan`
              }
            ]);
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
            const answers = await inquirer.prompt([
              {
                type: 'confirm',
                name: 'overwrite',
                message: `Directory '${outputPath}' already exists and is not empty. Continue?`,
                default: false
              }
            ]);
            
            if (!answers.overwrite) {
              console.log(chalk.yellow('\n❌ Porting cancelled.\n'));
              process.exit(0);
            }
          }
        }
        
        // For now, just display a placeholder message
        const spinner = ora('Porting application...').start();
        
        // Simulate porting delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        spinner.succeed('Application ported successfully! (Placeholder)');
        console.log(chalk.green('\n✅ Porting complete'));
        console.log(chalk.cyan('\nThis command is a placeholder. Full implementation coming soon.'));
      } catch (error) {
        console.error(chalk.red(`\n❌ Error during porting: ${error.message}`));
        process.exit(1);
      }
    });
}