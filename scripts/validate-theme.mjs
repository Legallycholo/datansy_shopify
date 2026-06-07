#!/usr/bin/env node
/**
 * GSMPRO theme validation — run before deploy / as part of Phase 13 QA.
 * Usage: node scripts/validate-theme.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const sectionsDir = path.join(root, 'sections');
const templatesDir = path.join(root, 'templates');
const snippetsDir = path.join(root, 'snippets');

let errors = 0;
let warnings = 0;

function fail(msg) {
  console.error('ERROR:', msg);
  errors += 1;
}

function warn(msg) {
  console.warn('WARN:', msg);
  warnings += 1;
}

function ok(msg) {
  console.log('OK:', msg);
}

const sectionTypes = new Set(
  fs.readdirSync(sectionsDir)
    .filter((f) => f.endsWith('.liquid'))
    .map((f) => f.replace(/\.liquid$/, ''))
);

function walkJsonFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...walkJsonFiles(full));
    else if (entry.name.endsWith('.json')) results.push(full);
  }
  return results;
}

function validateSectionSchemas() {
  for (const file of fs.readdirSync(sectionsDir).filter((f) => f.endsWith('.liquid'))) {
    const content = fs.readFileSync(path.join(sectionsDir, file), 'utf8');
    const match = content.match(/\{%\s*schema\s*%\}([\s\S]*?)\{%\s*endschema\s*%\}/);
    if (!match) {
      fail(`${file}: missing {% schema %}`);
      continue;
    }
    try {
      const schema = JSON.parse(match[1]);
      if (schema.name && schema.name.length > 25) {
        warn(`${file}: schema name "${schema.name}" exceeds 25 chars (Theme Editor limit)`);
      }
    } catch (e) {
      fail(`${file}: invalid schema JSON — ${e.message}`);
    }
  }
  ok(`Section schemas parsed (${sectionTypes.size} sections)`);
}

function validateTemplates() {
  const templateFiles = walkJsonFiles(templatesDir);
  for (const file of templateFiles) {
    let json;
    try {
      json = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (e) {
      fail(`${path.relative(root, file)}: invalid JSON — ${e.message}`);
      continue;
    }
    const rel = path.relative(root, file);
    for (const section of Object.values(json.sections || {})) {
      if (!section.type) {
        fail(`${rel}: section missing type`);
        continue;
      }
      if (!sectionTypes.has(section.type)) {
        fail(`${rel}: unknown section type "${section.type}"`);
      }
    }
  }
  ok(`Templates validated (${templateFiles.length} JSON templates)`);
}

function validateSectionGroups() {
  for (const name of ['header-group.json', 'footer-group.json']) {
    const file = path.join(sectionsDir, name);
    if (!fs.existsSync(file)) {
      fail(`Missing ${name}`);
      continue;
    }
    const json = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const section of Object.values(json.sections || {})) {
      if (!sectionTypes.has(section.type)) {
        fail(`${name}: unknown section type "${section.type}"`);
      }
    }
  }
  ok('Section groups (header/footer) validated');
}

function validateRequiredFiles() {
  const required = [
    'layout/theme.liquid',
    'config/settings_schema.json',
    'config/settings_data.json',
    'locales/es.default.json',
    'templates/index.json',
    'templates/product.json',
    'templates/collection.json',
    'templates/cart.json',
    'sections/header.liquid',
    'sections/footer.liquid'
  ];
  for (const rel of required) {
    if (!fs.existsSync(path.join(root, rel))) fail(`Missing required file: ${rel}`);
  }
  ok('Required theme files present');
}

function validateDeprecatedLiquid() {
  const deprecated = [
    { pattern: /\{%\s*include\s+/, label: '{% include %} (use {% render %})' },
    { pattern: /\{%\s*section\s+/, label: '{% section %} in non-json context' }
  ];
  const dirs = [sectionsDir, snippetsDir, path.join(root, 'layout')];
  for (const dir of dirs) {
    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.liquid'))) {
      const content = fs.readFileSync(path.join(dir, file), 'utf8');
      for (const { pattern, label } of deprecated) {
        if (pattern.test(content)) warn(`${path.join(path.basename(dir), file)}: uses ${label}`);
      }
    }
  }
  ok('Deprecated Liquid scan complete');
}

console.log('GSMPRO theme validation\n');
validateRequiredFiles();
validateSectionSchemas();
validateSectionGroups();
validateTemplates();
validateDeprecatedLiquid();

console.log(`\nSummary: ${errors} error(s), ${warnings} warning(s)`);
process.exit(errors > 0 ? 1 : 0);
