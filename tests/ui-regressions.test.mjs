import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

function read(relativePath) {
  return readFileSync(path.join(projectRoot, relativePath), 'utf8');
}

function getSourceFiles() {
  return globSync('src/**/*.{ts,tsx,css}', {
    cwd: projectRoot,
    absolute: false,
  });
}

test('source files do not contain broken CSS variable references with stray spaces', () => {
  const brokenRefs = [];

  for (const file of getSourceFiles()) {
    const source = read(file);
    if (/var\(--color-\s+bg-(?:elevated|surface|base|inset)\)/.test(source)) {
      brokenRefs.push(file);
    }
  }

  assert.deepEqual(brokenRefs, []);
});

test('source files do not contain broken disabled Tailwind variants with spaces', () => {
  const brokenVariants = [];

  for (const file of getSourceFiles()) {
    const source = read(file);
    if (/disabled:\s+(?:bg-|cursor|opacity)/.test(source)) {
      brokenVariants.push(file);
    }
  }

  assert.deepEqual(brokenVariants, []);
});

test('mermaid diagrams do not hardcode the dark theme', () => {
  const source = read('src/components/MermaidDiagram.tsx');

  assert.equal(source.includes("theme: 'dark'"), false);
});
