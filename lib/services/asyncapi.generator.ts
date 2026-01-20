import Generator from '@asyncapi/generator';
import fs from 'fs/promises';
import jsyaml from 'js-yaml';
import os from 'os';
import path from 'path';
import {
  AsyncApiDocument,
  AsyncApiTemplateOptions,
  GeneratorOptions,
} from '../interface';

export class AsyncapiGenerator {
  private readonly templateOptions?: AsyncApiTemplateOptions;

  constructor(templateOptions?: AsyncApiTemplateOptions) {
    this.templateOptions = templateOptions;
  }

  public async generate(contract: AsyncApiDocument): Promise<string> {
    const yaml = jsyaml.dump(contract);
    const tmpDir = path.join(
      os.tmpdir(),
      `asyncapi-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );

    const generator: GeneratorOptions = new Generator(
      '@asyncapi/html-template',
      tmpDir,
      {
        forceWrite: true,
        templateParams: {
          singleFile: true,
          ...this.templateOptions,
        },
      },
    );

    await generator.generateFromString(yaml, {
      resolve: {
        file: false,
      },
    });

    const htmlPath = path.join(tmpDir, 'index.html');
    const html = await fs.readFile(htmlPath, 'utf-8');

    // Clean up temp directory
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});

    return html;
  }
}
