import {
  ExternalDocumentationObject,
  SecuritySchemeObject,
  TagObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { isUndefined, negate, pickBy } from 'lodash';
import {
  AsyncApiDocument,
  AsyncSecuritySchemeObject,
  AsyncServerObject,
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

  public addServer(name: string, server: AsyncServerObject): this {
    this.document.servers[name] = server;
    return this;
  }

  public addServers(
    servers: { name: string; server: AsyncServerObject }[],
  ): this {
    for (const { name, server } of servers) {
      this.addServer(name, server);
    }

    return this;
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
