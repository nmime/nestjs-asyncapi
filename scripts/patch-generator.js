#!/usr/bin/env node
/**
 * Patches @asyncapi/generator to fix bugs in parser.js:
 * Bug 1: Uses 'this.methodName' instead of 'parser.methodName' in module exports
 * Bug 2: Local 'const parser = NewParser(...)' shadows the module-level 'parser'
 */

const fs = require('fs');
const path = require('path');

const parserPath = path.join(
  __dirname,
  '..',
  'node_modules',
  '@asyncapi',
  'generator',
  'lib',
  'parser.js'
);

if (!fs.existsSync(parserPath)) {
  console.log('Skipping patch: @asyncapi/generator not installed yet');
  process.exit(0);
}

let content = fs.readFileSync(parserPath, 'utf8');

// Check if already fully patched (no 'this.' calls remain)
if (!content.includes('this.sanitizeTemplateApiVersion') &&
    !content.includes('this.usesNewAPI') &&
    !content.includes('this.getProperApiDocument')) {
  console.log('Already patched @asyncapi/generator parser.js');
  process.exit(0);
}

// All fixes needed
const fixes = [
  // Fix 'this.' to 'parser.' for module exports methods
  ['this.sanitizeTemplateApiVersion', 'parser.sanitizeTemplateApiVersion'],
  ['this.usesNewAPI', 'parser.usesNewAPI'],
  ['this.getProperApiDocument', 'parser.getProperApiDocument'],
  // Fix variable shadowing: rename local 'parser' to 'newParser'
  ['const parser = NewParser(', 'const newParser = NewParser('],
  ['await parser.parse(asyncapi, options)', 'await newParser.parse(asyncapi, options)'],
];

let patched = false;
for (const [from, to] of fixes) {
  if (content.includes(from)) {
    content = content.split(from).join(to);
    patched = true;
  }
}

if (patched) {
  fs.writeFileSync(parserPath, content);
  console.log('Patched @asyncapi/generator parser.js - fixed this binding and variable shadowing');
} else {
  console.log('No patching needed for @asyncapi/generator');
}
