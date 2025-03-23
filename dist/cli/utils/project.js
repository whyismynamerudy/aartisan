import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Templates directory path (relative to this file)
const templatesDir = path.resolve(__dirname, '../../../templates');

/**
 * Creates a new project by copying template files and customizing them
 * @param {string} projectDir - Target project directory path
 * @param {string} templateName - Template name to use
 */
async function createProject(projectDir, templateName = 'minimal') {
  // Validate template exists
  const templateDir = path.join(templatesDir, templateName);
  if (!(await fs.pathExists(templateDir))) {
    throw new Error(`Template '${templateName}' not found`);
  }

  // Check if target directory already exists
  if (await fs.pathExists(projectDir)) {
    // Check if directory is empty
    const files = await fs.readdir(projectDir);
    if (files.length > 0) {
      throw new Error(`Directory '${projectDir}' already exists and is not empty`);
    }
  } else {
    // Create the project directory
    await fs.mkdir(projectDir, {
      recursive: true
    });
  }

  // Copy template files to target directory
  await fs.copy(templateDir, projectDir);

  // Customize the project (replace placeholders, etc.)
  await customizeProject(projectDir, path.basename(projectDir));
  return projectDir;
}

/**
 * Customizes project files by replacing placeholders
 * @param {string} projectDir - Project directory path
 * @param {string} projectName - Name of the project
 */
async function customizeProject(projectDir, projectName) {
  // Modify package.json
  const packageJsonPath = path.join(projectDir, 'package.json');
  if (await fs.pathExists(packageJsonPath)) {
    const packageJson = await fs.readJson(packageJsonPath);

    // Update project name
    packageJson.name = projectName;

    // Write back the modified package.json
    await fs.writeJson(packageJsonPath, packageJson, {
      spaces: 2
    });
  }

  // Additional customization could go here (e.g., update README.md, etc.)
}

export { createProject };
//# sourceMappingURL=project.js.map
