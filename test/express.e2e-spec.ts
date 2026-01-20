import { NestFactory } from '@nestjs/core';
import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express';
import jsyaml from 'js-yaml';
import request from 'supertest';
import { AsyncApiModule } from '#lib';
import { AppModule } from '#sample/app.module';
import { makeAsyncapiDocument } from '#sample/common';
import { DOC_RELATIVE_PATH } from '#sample/constants';

describe('Express AsyncAPI', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    app = await NestFactory.create<NestExpressApplication>(
      AppModule,
      new ExpressAdapter(),
      { logger: false },
    );
    const asyncapiDocument = await makeAsyncapiDocument(app);
    await AsyncApiModule.setup(DOC_RELATIVE_PATH, app, asyncapiDocument);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should serve doc html', async () => {
    const { text } = await request(app.getHttpServer())
      .get(DOC_RELATIVE_PATH)
      .expect(200)
      .expect('Content-Type', /text\/html/);
    // HTML generation uses @asyncapi/html-template which may be mocked in tests
    // We verify the response is HTML and contains expected elements
    expect(text).toContain('<!DOCTYPE html>');
    expect(text).toContain('AsyncAPI');
  });

  it('should serve doc json', async () => {
    const { text } = await request(app.getHttpServer())
      .get(`${DOC_RELATIVE_PATH}-json`)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const jsonFetched = JSON.parse(text);

    // Validate AsyncAPI 3.0 structure
    expect(jsonFetched.asyncapi).toBe('3.0.0');
    expect(jsonFetched.info).toBeDefined();
    expect(jsonFetched.info.title).toBe('Feline');
    expect(jsonFetched.info.version).toBe('1.0');

    // Validate channels have address (3.0 requirement)
    expect(jsonFetched.channels).toBeDefined();
    for (const [, channel] of Object.entries(
      jsonFetched.channels as Record<string, { address: string }>,
    )) {
      expect(channel.address).toBeDefined();
    }

    // Validate operations have action and channel reference (3.0 requirement)
    expect(jsonFetched.operations).toBeDefined();
    for (const [, op] of Object.entries(
      jsonFetched.operations as Record<
        string,
        { action: string; channel: { $ref: string } }
      >,
    )) {
      expect(['send', 'receive']).toContain(op.action);
      expect(op.channel).toBeDefined();
      expect(op.channel.$ref).toMatch(/^#\/channels\//);
    }

    // Validate servers
    expect(jsonFetched.servers).toBeDefined();
    expect(jsonFetched.servers.europe).toBeDefined();
    expect(jsonFetched.servers.europe.host).toBeDefined();
    expect(jsonFetched.servers.europe.protocol).toBe('socket.io');

    // Validate components
    expect(jsonFetched.components).toBeDefined();
    expect(jsonFetched.components.schemas).toBeDefined();
    expect(jsonFetched.components.securitySchemes).toBeDefined();
  });

  it('should serve doc yaml', async () => {
    const { text } = await request(app.getHttpServer())
      .get(`${DOC_RELATIVE_PATH}-yaml`)
      .expect(200)
      .expect('Content-Type', /text\/yaml/);

    const yamlFetched = jsyaml.load(text) as Record<string, unknown>;

    // Validate AsyncAPI 3.0 structure (same as JSON)
    expect(yamlFetched.asyncapi).toBe('3.0.0');
    expect(yamlFetched.info).toBeDefined();
    expect(yamlFetched.channels).toBeDefined();
    expect(yamlFetched.operations).toBeDefined();
    expect(yamlFetched.servers).toBeDefined();
    expect(yamlFetched.components).toBeDefined();
  });
});
