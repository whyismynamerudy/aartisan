import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import { createProject } from '../utils/project.js';
import { getAvailableTemplates } from '../utils/templates.js';
import 'fs-extra';
import 'url';

/**
 * Registers the 'create' command with the provided Commander program
 * @param {import('commander').Command} program - The Commander program instance
 */
function createCommand(program) {
  program.command('create').description('Create a new AI-optimized React application').argument('[name]', 'Name of the application').option('-t, --template <template>', 'Template to use (minimal, e-commerce)').option('-y, --yes', 'Skip confirmation prompts and use defaults').action(async (name, options) => {
    console.log(chalk.cyan('\n🚀 Creating a new AI-optimized React project...\n'));

    // Interactive mode if name is not provided or template is not specified
    if (!name || !options.template || !options.yes) {
      const availableTemplates = await getAvailableTemplates();
      const answers = await inquirer.prompt([{
        type: 'input',
        name: 'name',
        message: 'What is the name of your project?',
        default: name || 'my-aartisan-app',
        when: !name,
        validate: input => input.trim() !== '' || 'Project name cannot be empty'
      }, {
        type: 'list',
        name: 'template',
        message: 'Which template would you like to use?',
        choices: availableTemplates.map(template => ({
          name: `${template.name} - ${template.description}`,
          value: template.id
        })),
        default: 'minimal',
        when: !options.template
      }, {
        type: 'confirm',
        name: 'confirm',
        message: answers => `Create new project ${chalk.cyan(name || answers.name)} with template ${chalk.cyan(options.template || answers.template)}?`,
        default: true,
        when: !options.yes
      }]);

      // Exit if user cancels
      if (answers.confirm === false) {
        console.log(chalk.yellow('\n❌ Project creation cancelled.\n'));
        process.exit(0);
      }

      // Get the name and template from answers or original options
      name = name || answers.name;
      options.template = options.template || answers.template;
    }

    // Project directory path
    const projectDir = path.resolve(process.cwd(), name);

    // Create project with loading spinner
    const spinner = ora('Creating project files...').start();
    try {
      await createProject(projectDir, options.template);
      spinner.succeed(`Project ${chalk.green(name)} created successfully!`);

      // Display next steps
      console.log('\n' + chalk.cyan('Next steps:'));
      console.log(`  cd ${name}`);
      console.log('  npm install');
      console.log('  npm run dev\n');
      console.log(chalk.cyan('Happy coding with aartisan! 🎉\n'));
    } catch (error) {
      spinner.fail(`Failed to create project: ${error.message}`);
      console.error(chalk.red(error));
      process.exit(1);
    }
  });
}

export { createCommand };
//# sourceMappingURL=create.js.map
