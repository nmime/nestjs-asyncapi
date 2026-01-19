# NestJS AsyncAPI

[![npm version](https://img.shields.io/npm/v/nestjs-asyncapi.svg)](https://www.npmjs.com/package/nestjs-asyncapi)
[![npm downloads](https://img.shields.io/npm/dm/nestjs-asyncapi.svg)](https://www.npmjs.com/package/nestjs-asyncapi)
[![license](https://img.shields.io/npm/l/nestjs-asyncapi.svg)](https://github.com/nmime/nestjs-asyncapi/blob/main/LICENSE)

[AsyncAPI](https://www.asyncapi.com/) module for [NestJS](https://github.com/nestjs/nest). Generate AsyncAPI documentation for event-based services (WebSockets, microservices, Kafka, AMQP, etc.) similar to [@nestjs/swagger](https://github.com/nestjs/swagger).

## Features

- **AsyncAPI 3.0 support** (default) - Latest specification
- **Full backward compatibility** - Supports AsyncAPI 2.x (2.6.0 - 2.0.0) and 1.x (1.2.0 - 1.0.0)
- Decorator-based documentation
- Support for WebSocket gateways and controllers
- Kafka and AMQP bindings support
- HTML documentation generation
- YAML/JSON spec export
- Compatible with NestJS 9, 10, and 11

## Demo

- [Live Preview](https://flamewow.github.io/nestjs-asyncapi/live-preview)
- [AsyncAPI Playground](https://playground.asyncapi.io/)

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

### 2. Specify AsyncAPI Version (Optional)

By default, the module uses AsyncAPI 3.0.0. You can specify a different version:

```typescript
const asyncApiOptions = new AsyncApiDocumentBuilder()
  .setAsyncApiVersion('3.0.0')  // Default - AsyncAPI 3.0
  // .setAsyncApiVersion('2.6.0')  // Use AsyncAPI 2.6
  // .setAsyncApiVersion('2.5.0')  // Use AsyncAPI 2.5
  // .setAsyncApiVersion('1.2.0')  // Use AsyncAPI 1.x
  .setTitle('My API')
  .build();
```

**Supported versions:** `3.0.0`, `2.6.0`, `2.5.0`, `2.4.0`, `2.3.0`, `2.2.0`, `2.1.0`, `2.0.0`, `1.2.0`, `1.1.0`, `1.0.0`

### 3. Add decorators to your controllers/gateways

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

## API Endpoints

When you call `AsyncApiModule.setup('/async-api', app, document)`, the following endpoints are available:

| Endpoint | Description |
|----------|-------------|
| `/async-api` | HTML documentation |
| `/async-api-json` | JSON specification |
| `/async-api-yaml` | YAML specification |

## Examples

For detailed examples, check out the [sample application](https://github.com/nmime/nestjs-asyncapi/tree/main/sample).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Credits

This project is a fork of the original [nestjs-asyncapi](https://github.com/flamewow/nestjs-asyncapi) by [Ilya Moroz](https://github.com/flamewow). Thank you for the excellent foundation!

## License

MIT - see [LICENSE](LICENSE) for details.

---

If you find this library helpful, please consider giving it a star on [GitHub](https://github.com/nmime/nestjs-asyncapi).
