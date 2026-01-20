/**
 * Mock for @asyncapi/generator to avoid ESM issues in Jest tests.
 * The actual HTML generation is not tested, but the document structure is.
 */

class MockGenerator {
  constructor(templateName, targetDir, options = {}) {
    this.templateName = templateName;
    this.targetDir = targetDir;
    this.options = options;
  }

  async generateFromString(yaml) {
    return `<!DOCTYPE html>
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
  }

  async generate(asyncapi) {
    return this.generateFromString(JSON.stringify(asyncapi, null, 2));
  }
}

module.exports = MockGenerator;
module.exports.default = MockGenerator;
