import {
  ExternalDocumentationObject,
  ReferenceObject,
  SecuritySchemeObject,
  TagObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { isUndefined, negate, pickBy } from 'lodash';
import {
  AsyncApiDocument,
  AsyncSecuritySchemeObject,
  AsyncServerObject,
  AsyncServerObject3,
} from './interface';

export type AsyncApiVersion = '3.0.0' | '2.6.0' | '2.5.0' | '2.4.0' | '2.3.0' | '2.2.0' | '2.1.0' | '2.0.0' | '1.2.0' | '1.1.0' | '1.0.0';

export class AsyncApiDocumentBuilder {
  private readonly buildDocumentBase = (): Omit<
    AsyncApiDocument,
    'channels'
  > => ({
    asyncapi: '3.0.0',
    info: {
      title: '',
      description: '',
      version: '1.0.0',
      contact: {},
    },
    tags: [],
    servers: {},
    components: {},
  });

  private readonly document: Omit<AsyncApiDocument, 'channels'> =
    this.buildDocumentBase();

  /**
   * Sets the AsyncAPI specification version.
   * Supported versions: 3.0.0, 2.6.0, 2.5.0, 2.4.0, 2.3.0, 2.2.0, 2.1.0, 2.0.0, 1.2.0, 1.1.0, 1.0.0
   * @default '3.0.0'
   */
  public setAsyncApiVersion(version: AsyncApiVersion): this {
    this.document.asyncapi = version;
    return this;
  }

  public setTitle(title: string): this {
    this.document.info.title = title;
    return this;
  }

  public setDescription(description: string): this {
    this.document.info.description = description;
    return this;
  }

  public setVersion(version: string): this {
    this.document.info.version = version;
    return this;
  }

  public setTermsOfService(termsOfService: string): this {
    this.document.info.termsOfService = termsOfService;
    return this;
  }

  public setContact(name: string, url: string, email: string): this {
    this.document.info.contact = { name, url, email };
    return this;
  }

  public setLicense(name: string, url: string): this {
    this.document.info.license = { name, url };
    return this;
  }

  /**
   * Adds a server to the AsyncAPI document.
   * Accepts both AsyncAPI 2.x format (with url) and 3.0 format (with host/pathname).
   * If a 2.x format server is provided, it will be automatically converted to 3.0 format.
   */
  public addServer(
    name: string,
    server: AsyncServerObject | AsyncServerObject3,
  ): this {
    // Check if it's a 2.x format server (has url property)
    if ('url' in server && server.url) {
      this.document.servers[name] = this.convertServerTo3(
        server as AsyncServerObject,
      );
    } else {
      this.document.servers[name] = server as AsyncServerObject3;
    }
    return this;
  }

  public addServers(
    servers: { name: string; server: AsyncServerObject | AsyncServerObject3 }[],
  ): this {
    for (const { name, server } of servers) {
      this.addServer(name, server);
    }

    return this;
  }

  /**
   * Converts an AsyncAPI 2.x server object to 3.0 format.
   * Parses the url to extract host and pathname.
   */
  private convertServerTo3(server: AsyncServerObject): AsyncServerObject3 {
    const { url, protocol, protocolVersion, description, variables, bindings } =
      server;

    // Parse the URL to extract host and pathname
    // URL format: protocol://host:port/pathname or just host:port/pathname
    let host = url;
    let pathname: string | undefined;

    // Remove protocol prefix if present (e.g., "ws://", "amqp://")
    const protocolMatch = url.match(/^[a-z]+:\/\//i);
    if (protocolMatch) {
      host = url.substring(protocolMatch[0].length);
    }

    // Extract pathname
    const pathIndex = host.indexOf('/');
    if (pathIndex !== -1) {
      pathname = host.substring(pathIndex);
      host = host.substring(0, pathIndex);
    }

    // Convert security from 2.x format to 3.0 format (references)
    let security: ReferenceObject[] | undefined;
    if (server.security && server.security.length > 0) {
      security = server.security.map((sec) => {
        const schemeName = Object.keys(sec)[0];
        return { $ref: `#/components/securitySchemes/${schemeName}` };
      });
    }

    const server3: AsyncServerObject3 = {
      host,
      protocol,
    };

    if (pathname) {
      server3.pathname = pathname;
    }

    if (protocolVersion) {
      server3.protocolVersion = protocolVersion;
    }

    if (description) {
      server3.description = description;
    }

    if (variables && Object.keys(variables).length > 0) {
      server3.variables = variables;
    }

    if (security) {
      server3.security = security;
    }

    if (bindings && Object.keys(bindings).length > 0) {
      server3.bindings = bindings;
    }

    return server3;
  }

  public setExternalDoc(description: string, url: string): this {
    this.document.externalDocs = { description, url };
    return this;
  }

  public setDefaultContentType(contentType: string) {
    this.document.defaultContentType = contentType;
    return this;
  }

  public addTag(
    name: string,
    description = '',
    externalDocs?: ExternalDocumentationObject,
  ): this {
    this.document.tags = this.document.tags.concat(
      pickBy(
        {
          name,
          description,
          externalDocs,
        },
        negate(isUndefined),
      ) as TagObject,
    );
    return this;
  }

  public addSecurity(name: string, options: AsyncSecuritySchemeObject): this {
    this.document.components.securitySchemes = {
      ...(this.document.components.securitySchemes || {}),
      [name]: options,
    };
    return this;
  }

  public addBearerAuth(
    options: SecuritySchemeObject = {
      type: 'http',
    },
    name = 'bearer',
  ): this {
    this.addSecurity(name, {
      scheme: 'bearer',
      bearerFormat: 'JWT',
      ...options,
    });
    return this;
  }

  public addOAuth2(
    options: SecuritySchemeObject = {
      type: 'oauth2',
    },
    name = 'oauth2',
  ): this {
    this.addSecurity(name, {
      type: 'oauth2',
      flows: {},
      ...options,
    });
    return this;
  }

  public addApiKey(
    options: SecuritySchemeObject = {
      type: 'apiKey',
    },
    name = 'api_key',
  ): this {
    this.addSecurity(name, {
      type: 'apiKey',
      in: 'header',
      name,
      ...options,
    });
    return this;
  }

  public addBasicAuth(
    options: SecuritySchemeObject = {
      type: 'http',
    },
    name = 'basic',
  ): this {
    this.addSecurity(name, {
      type: 'http',
      scheme: 'basic',
      ...options,
    });
    return this;
  }

  public addCookieAuth(
    cookieName = 'connect.sid',
    options: SecuritySchemeObject = {
      type: 'apiKey',
    },
    securityName = 'cookie',
  ): this {
    this.addSecurity(securityName, {
      type: 'apiKey',
      in: 'cookie',
      name: cookieName,
      ...options,
    });
    return this;
  }

  public build(): Omit<AsyncApiDocument, 'components' | 'channels'> {
    return this.document;
  }
}
