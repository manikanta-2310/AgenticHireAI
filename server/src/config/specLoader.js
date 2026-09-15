import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SPECS_DIR = path.resolve(__dirname, '../../../specs');

class SpecLoader {
  constructor() {
    this.cache = new Map();
  }

  loadJson(relativePath) {
    const fullPath = path.join(SPECS_DIR, relativePath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Specification file not found at: ${fullPath}`);
    }
    const content = fs.readFileSync(fullPath, 'utf-8');
    return JSON.parse(content);
  }

  getHiringSpec(roleOrFilename) {
    const filename = roleOrFilename.endsWith('.json') ? roleOrFilename : `${roleOrFilename.toLowerCase().replace(/\s+/g, '-')}.json`;
    return this.loadJson(`hiring/${filename}`);
  }

  listHiringSpecs() {
    const hiringDir = path.join(SPECS_DIR, 'hiring');
    if (!fs.existsSync(hiringDir)) return [];
    return fs.readdirSync(hiringDir)
      .filter(f => f.endsWith('.json'))
      .map(file => {
        const spec = this.loadJson(`hiring/${file}`);
        return {
          id: file.replace('.json', ''),
          filename: file,
          ...spec
        };
      });
  }

  getWorkflowSpec(name = 'default-hiring-workflow') {
    const filename = name.endsWith('.json') ? name : `${name}.json`;
    return this.loadJson(`workflow/${filename}`);
  }

  getRetryPolicy() {
    return this.loadJson('system/retry-policy.json');
  }

  getScoringRubric() {
    return this.loadJson('evaluation/scoring-rubric.json');
  }

  getAgentPrompts() {
    return this.loadJson('prompts/agent-prompts.json');
  }

  getEmailTemplates() {
    return this.loadJson('email/email-templates.json');
  }
}

export const specLoader = new SpecLoader();
export default specLoader;
