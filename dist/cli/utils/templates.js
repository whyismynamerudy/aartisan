import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Templates directory path (relative to this file)
const templatesDir = path.resolve(__dirname, '../../../templates');

/**
 * Retrieves the list of available templates
 * @returns {Promise<Array<{id: string, name: string, description: string}>>} List of available templates
 */
async function getAvailableTemplates() {
  // Ensure templates directory exists
  if (!(await fs.pathExists(templatesDir))) {
    throw new Error(`Templates directory not found: ${templatesDir}`);
  }

  // Read template directories
  const templates = [];
  const templateDirs = await fs.readdir(templatesDir);
  for (const templateId of templateDirs) {
    const templateDir = path.join(templatesDir, templateId);
    const stats = await fs.stat(templateDir);
    if (stats.isDirectory()) {
      // Read template.json metadata if it exists
      let name = templateId;
      let description = '';
      const metadataPath = path.join(templateDir, 'template.json');
      if (await fs.pathExists(metadataPath)) {
        try {
          const metadata = await fs.readJson(metadataPath);
          name = metadata.name || name;
          description = metadata.description || description;
        } catch (err) {
          console.warn(`Warning: Could not parse template metadata for '${templateId}'`);
        }
      }
      templates.push({
        id: templateId,
        name: formatTemplateName(name),
        description
      });
    }
  }
  return templates;
}

/**
 * Formats a template name for display
 * @param {string} name - Raw template name
 * @returns {string} Formatted template name
 */
function formatTemplateName(name) {
  return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export { getAvailableTemplates };
//# sourceMappingURL=templates.js.map
