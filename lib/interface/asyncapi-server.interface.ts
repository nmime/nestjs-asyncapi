import { ReferenceObject, ServerObject } from './openapi-spec.interface';
import { AmqpServerBinding, KafkaServerBinding } from '../binding';
import {
  AsyncServerVariableObject,
  AsyncTagObject,
  ExternalDocumentationObject,
  SecurityObject,
} from './asyncapi-common.interfaces';

// ============================================================================
// AsyncAPI 2.x Server Interface (backward compatibility)
// ============================================================================

export interface AsyncServerObject extends Omit<ServerObject, 'variables'> {
  variables?: Record<string, AsyncServerVariableObject>;
  protocol: string;
  protocolVersion?: string;
  security?: SecurityObject[];
  bindings?: Record<string, KafkaServerBinding | AmqpServerBinding>;
}

// ============================================================================
// AsyncAPI 3.0 Server Interface
// ============================================================================

export interface AsyncServerObject3 {
  host: string;
  pathname?: string;
  protocol: string;
  protocolVersion?: string;
  title?: string;
  summary?: string;
  description?: string;
  variables?: Record<string, AsyncServerVariableObject>;
  security?: ReferenceObject[];
  tags?: AsyncTagObject[];
  externalDocs?: ExternalDocumentationObject;
  bindings?: Record<string, KafkaServerBinding | AmqpServerBinding>;
}
