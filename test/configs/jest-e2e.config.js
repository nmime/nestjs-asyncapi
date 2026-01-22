const { baseConfig } = require('./jest-base.config.js');

/** @type {import('ts-jest').JestConfigWithTsJest} */
const e2eConfig = {
  ...baseConfig,
  testRegex: '.\\.e2e-spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        astTransformers: {
          before: ['test/configs/jest-swagger-plugin.js'],
        },
      },
    ],
  },
};

module.exports = e2eConfig;
