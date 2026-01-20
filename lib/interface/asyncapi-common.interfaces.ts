import {
  InfoObject,
  SchemaObject,
  ServerVariableObject,
  ReferenceObject as SwaggerReferenceObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import {
  AmqpChannelBinding,
  AmqpMessageBinding,
  AmqpOperationBinding,
  AmqpServerBinding,
  KafkaChannelBinding,
  KafkaMessageBinding,
  KafkaOperationBinding,
  KafkaServerBinding,
} from '../binding';
import { AsyncOperationPayload } from './asyncapi-operation-payload.interface';
import {
  AsyncServerObject,
  AsyncServerObject3,
} from './asyncapi-server.interface';

// Re-export ReferenceObject for use in other modules
export type ReferenceObject = SwaggerReferenceObject;

// ============================================================================
// AsyncAPI 3.0 Document Interface
// ============================================================================

export interface AsyncApiDocument {
  asyncapi: string;
  id?: string;
  info: InfoObject;
  servers?: Record<string, AsyncServerObject | AsyncServerObject3>;
  channels: AsyncChannelsObject | AsyncChannelsObject3;
  operations?: AsyncOperationsObject3;
  components?: AsyncComponentsObject;
  tags?: AsyncTagObject[];
  externalDocs?: ExternalDocumentationObject;
  defaultContentType?: string;
}

// ============================================================================
// AsyncAPI 2.x Channel Interfaces (backward compatibility)
// ============================================================================

export type AsyncChannelsObject = Record<string, AsyncChannelObject>;
export interface AsyncChannelObject {
  description?: string;
  subscribe?: AsyncOperationObject;
  publish?: AsyncOperationObject;
  parameters?: Record<string, ParameterObject>;
  bindings?: Record<string, KafkaChannelBinding | AmqpChannelBinding>;
}

// ============================================================================
// AsyncAPI 3.0 Channel Interfaces
// ============================================================================

export type AsyncChannelsObject3 = Record<string, AsyncChannelObject3>;
export interface AsyncChannelObject3 {
  address: string;
  title?: string;
  summary?: string;
  description?: string;
  messages?: Record<string, ReferenceObject | AsyncMessageObject>;
  parameters?: Record<string, ParameterObject | ReferenceObject>;
  servers?: ReferenceObject[];
  bindings?: Record<string, KafkaChannelBinding | AmqpChannelBinding>;
  tags?: AsyncTagObject[];
  externalDocs?: ExternalDocumentationObject;
}

// ============================================================================
// AsyncAPI 3.0 Operation Interfaces
// ============================================================================

export type AsyncOperationsObject3 = Record<string, AsyncOperationObject3>;
export interface AsyncOperationObject3 {
  action: 'send' | 'receive';
  channel: ReferenceObject;
  title?: string;
  summary?: string;
  description?: string;
  security?: SecurityObject[];
  tags?: AsyncTagObject[];
  externalDocs?: ExternalDocumentationObject;
  bindings?: Record<string, KafkaOperationBinding | AmqpOperationBinding>;
  traits?: ReferenceObject[];
  messages?: ReferenceObject[];
  reply?: AsyncReplyObject;
}

export interface AsyncReplyObject {
  address?: AsyncReplyAddressObject;
  channel?: ReferenceObject;
  messages?: ReferenceObject[];
}

export interface AsyncReplyAddressObject {
  location: string;
  description?: string;
}

export interface AsyncServerVariableObject extends ServerVariableObject {
  examples?: string[];
}

export type SecurityObject = Record<string, string[]>;

export interface AsyncComponentsObject {
  schemas?: Record<string, SchemaObject>;
  messages?: Record<string, AsyncMessageObject>;
  securitySchemes?: Record<string, AsyncSecuritySchemeObject>;
  parameters?: Record<string, ParameterObject>;
  correlationIds?: Record<string, AsyncCorrelationObject>;
  operationTraits?: Record<string, AsyncOperationTraitObject>;
  messageTraits?: Record<string, AsyncMessageTraitObject>;
  serverBindings?: Record<string, KafkaServerBinding | AmqpServerBinding>;
  channelBindings?: Record<string, KafkaChannelBinding | AmqpChannelBinding>;
  operationBindings?: Record<
    string,
    KafkaOperationBinding | AmqpOperationBinding
  >;
  messageBindings?: Record<string, KafkaMessageBinding | AmqpMessageBinding>;
}

export interface AsyncMessageObject extends AsyncMessageTraitObject {
  payload?: {
    type?: AsyncOperationPayload;
    $ref?: AsyncOperationPayload;
  };
}

export type MessageType = AsyncMessageObject | ReferenceObject;
export interface OneOfMessageType {
  oneOf: MessageType[];
}

export type AsyncOperationMessage = OneOfMessageType | MessageType;

export interface AsyncOperationObject {
  channel: string;
  operationId?: string;
  summary?: string;
  description?: string;
  tags?: AsyncTagObject[];
  externalDocs?: ExternalDocumentationObject;
  bindings?: Record<string, KafkaOperationBinding | AmqpOperationBinding>;
  traits?: Record<string, AsyncOperationTraitObject>;
  message?: AsyncOperationMessage;
}

export interface AsyncOperationTraitObject {
  operationId?: string;
  summary?: string;
  description?: string;
  tags?: AsyncTagObject[];
  externalDocs?: ExternalDocumentationObject;
  bindings?: Record<string, KafkaOperationBinding | AmqpOperationBinding>;
}

export interface AsyncMessageTraitObject {
  messageId?: string;
  headers?: SchemaObject;
  correlationId?: AsyncCorrelationObject;
  schemaFormat?: string;
  contentType?: string;
  name?: string;
  title?: string;
  summary?: string;
  description?: string;
  tags?: AsyncTagObject[];
  externalDocs?: ExternalDocumentationObject;
  bindings?: Record<string, KafkaMessageBinding | AmqpMessageBinding>;
}

export interface AsyncCorrelationObject {
  description?: string;
  location: string;
}

export interface AsyncTagObject {
  name: string;
  description?: string;
  externalDocs?: ExternalDocumentationObject;
}

export interface AsyncSecuritySchemeObject {
  type: SecuritySchemeType;
  description?: string;
  name?: string;
  in?: string;
  scheme?: string;
  bearerFormat?: string;
  flows?: OAuthFlowsObject;
  openIdConnectUrl?: string;
}

export declare type SecuritySchemeType =
  | 'userPassword'
  | 'apiKey'
  | 'X509'
  | 'symmetricEncryption'
  | 'asymmetricEncryption'
  | 'http'
  | 'oauth2'
  | 'openIdConnect';

export interface OAuthFlowsObject {
  implicit?: OAuthFlowObject;
  password?: OAuthFlowObject;
  clientCredentials?: OAuthFlowObject;
  authorizationCode?: OAuthFlowObject;
}

export interface OAuthFlowObject {
  authorizationUrl?: string;
  tokenUrl?: string;
  refreshUrl?: string;
  scopes: ScopesObject;
}

export type ScopesObject = Record<string, unknown>;

export type ParameterObject = BaseParameterObject;

export interface BaseParameterObject {
  description?: string;
  schema?: SchemaObject | ReferenceObject;
  location?: string;
}

export interface ExternalDocumentationObject {
  description?: string;
  url: string;
}
