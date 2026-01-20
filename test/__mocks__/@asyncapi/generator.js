/**
 * Mock for @asyncapi/generator to avoid ESM issues in Jest tests.
 */

const fs = require('fs');
const path = require('path');

class MockGenerator {
  constructor(templateName, targetDir, options = {}) {
    this.templateName = templateName;
    this.targetDir = targetDir;
    this.options = options;
  }

  async generateFromString(yaml) {
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>AsyncAPI Documentation</title>
</head>
<body>
  <h1>AsyncAPI Documentation</h1>
  <p>Mock HTML generated for testing</p>
  <pre>${yaml.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
</body>
</html>`;

    // Create the target directory and write the file
    fs.mkdirSync(this.targetDir, { recursive: true });
    fs.writeFileSync(path.join(this.targetDir, 'index.html'), html, 'utf-8');

    return html;
  }

  async generate(asyncapi) {
    return this.generateFromString(JSON.stringify(asyncapi, null, 2));
  }
}

module.exports = MockGenerator;
module.exports.default = MockGenerator;
