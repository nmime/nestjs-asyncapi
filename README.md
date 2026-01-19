# NestJS AsyncAPI

[![npm version](https://img.shields.io/npm/v/nestjs-asyncapi.svg)](https://www.npmjs.com/package/nestjs-asyncapi)
[![npm downloads](https://img.shields.io/npm/dm/nestjs-asyncapi.svg)](https://www.npmjs.com/package/nestjs-asyncapi)
[![license](https://img.shields.io/npm/l/nestjs-asyncapi.svg)](https://github.com/flamewow/nestjs-asyncapi/blob/main/LICENSE)

[AsyncAPI](https://www.asyncapi.com/) module for [NestJS](https://github.com/nestjs/nest). Generate AsyncAPI documentation for event-based services (WebSockets, microservices, etc.) similar to [@nestjs/swagger](https://github.com/nestjs/swagger).

## Features

- Decorator-based AsyncAPI documentation
- Support for WebSocket gateways and controllers
- HTML documentation generation
- YAML/JSON spec export
- Compatible with NestJS 9, 10, and 11

## Demo

- [Live Preview](https://flamewow.github.io/nestjs-asyncapi/live-preview)
- [AsyncAPI Playground](https://playground.asyncapi.io/?load=https://raw.githubusercontent.com/asyncapi/asyncapi/v2.1.0/examples/simple.yml)

## Installation

```bash
npm install nestjs-asyncapi
```

To skip Chromium installation (used by AsyncAPI generator for PDF generation):

```bash
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm install nestjs-asyncapi
```

## Quick Start

### 1. Configure AsyncAPI in your bootstrap function

```typescript
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AsyncApiModule, AsyncApiDocumentBuilder } from 'nestjs-asyncapi';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const asyncApiOptions = new AsyncApiDocumentBuilder()
    .setTitle('Feline')
    .setDescription('Feline server description here')
    .setVersion('1.0')
    .setDefaultContentType('application/json')
    .addSecurity('user-password', { type: 'userPassword' })
    .addServer('feline-ws', {
      url: 'ws://localhost:3000',
      protocol: 'socket.io',
    })
    .build();

  const asyncapiDocument = await AsyncApiModule.createDocument(app, asyncApiOptions);
  await AsyncApiModule.setup('/async-api', app, asyncapiDocument);

  await app.listen(3000);
}

bootstrap();
```

### 2. Add decorators to your controllers/gateways

The module automatically explores `Controllers` and `WebSocketGateway` classes. Use `@AsyncApi()` decorator for other classes that need AsyncAPI documentation.

```typescript
import { Controller } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { AsyncApiPub, AsyncApiSub } from 'nestjs-asyncapi';

class CreateFelineDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  breed: string;
}

@Controller()
class FelineController {
  @AsyncApiPub({
    channel: 'feline/created',
    message: {
      payload: CreateFelineDto,
    },
  })
  async publishFelineCreated() {
    // Publish logic
  }

  @AsyncApiSub({
    channel: 'feline/create',
    message: {
      payload: CreateFelineDto,
    },
  })
  async onCreateFeline() {
    // Subscribe logic
  }
}
```

## Templates

This package includes support for multiple AsyncAPI templates:

| Template | Description |
|----------|-------------|
| `@asyncapi/html-template` | Static HTML documentation (default) |
| `@asyncapi/nodejs-template` | Node.js service using Hermes package |
| `@asyncapi/nodejs-ws-template` | Node.js service with WebSockets support |

## Examples

For detailed examples, check out the [sample application](https://github.com/flamewow/nestjs-asyncapi/tree/main/sample).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

---

If you find this library helpful, please consider giving it a star on [GitHub](https://github.com/flamewow/nestjs-asyncapi).
