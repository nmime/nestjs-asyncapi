import {
  AsyncChannelObject3,
  AsyncChannelsObject3,
  AsyncMessageObject,
  AsyncOperationObject,
  AsyncOperationObject3,
  AsyncOperationsObject3,
  DenormalizedDoc,
  OneOfMessageType,
  ReferenceObject,
} from '../interface';

interface TransformedDocument {
  channels: AsyncChannelsObject3;
  operations: AsyncOperationsObject3;
  componentMessages: Record<string, AsyncMessageObject>;
}

interface ChannelData {
  description?: string;
  bindings?: AsyncChannelObject3['bindings'];
  parameters?: AsyncChannelObject3['parameters'];
  messages: Record<string, AsyncMessageObject | ReferenceObject>;
  pubOperations: AsyncOperationObject[];
  subOperations: AsyncOperationObject[];
}

export class AsyncapiTransformer {
  /**
   * Transforms denormalized docs into AsyncAPI 3.0 format with separate
   * channels and operations objects.
   */
  public normalizeChannels(
    denormalizedDocs: DenormalizedDoc[],
  ): TransformedDocument {
    // Group by channel address and collect all operations and messages
    const channelDataMap = new Map<string, ChannelData>();

    for (const doc of denormalizedDocs) {
      if (!doc.root?.name) continue;

      const channelAddress = doc.root.name;

      if (!channelDataMap.has(channelAddress)) {
        channelDataMap.set(channelAddress, {
          description: doc.root.description,
          bindings: doc.root.bindings,
          parameters: doc.root.parameters,
          messages: {},
          pubOperations: [],
          subOperations: [],
        });
      }

      const channelData = channelDataMap.get(channelAddress)!;

      // Process publish operations (app sends message)
      if (doc.operations?.pub) {
        channelData.pubOperations.push(doc.operations.pub);
        this.extractMessages(doc.operations.pub, channelData.messages);
      }

      // Process subscribe operations (app receives message)
      if (doc.operations?.sub) {
        channelData.subOperations.push(doc.operations.sub);
        this.extractMessages(doc.operations.sub, channelData.messages);
      }
    }

    // Build the AsyncAPI 3.0 channels and operations
    const channels: AsyncChannelsObject3 = {};
    const operations: AsyncOperationsObject3 = {};
    const componentMessages: Record<string, AsyncMessageObject> = {};

    for (const [address, data] of channelDataMap) {
      const channelId = this.addressToChannelId(address);

      // Build the channel object
      channels[channelId] = this.buildChannel(address, data);

      // Collect messages for components
      for (const [msgName, msg] of Object.entries(data.messages)) {
        if (!componentMessages[msgName]) {
          componentMessages[msgName] = msg as AsyncMessageObject;
        }
      }

      // Build send operations (from pub - app publishes/sends)
      for (let i = 0; i < data.pubOperations.length; i++) {
        const op = data.pubOperations[i];
        const opId = this.buildOperationId(op, channelId, 'send', i, data.pubOperations.length);
        operations[opId] = this.buildOperation(
          'send',
          channelId,
          op,
          data.messages,
        );
      }

      // Build receive operations (from sub - app subscribes/receives)
      for (let i = 0; i < data.subOperations.length; i++) {
        const op = data.subOperations[i];
        const opId = this.buildOperationId(op, channelId, 'receive', i, data.subOperations.length);
        operations[opId] = this.buildOperation(
          'receive',
          channelId,
          op,
          data.messages,
        );
      }
    }

    return { channels, operations, componentMessages };
  }

  /**
   * Converts a channel address to a valid channel ID.
   * Replaces special characters with underscores.
   */
  private addressToChannelId(address: string): string {
    return address.replace(/[^a-zA-Z0-9_]/g, '_');
  }

  /**
   * Builds a unique operation ID from the operation metadata.
   */
  private buildOperationId(
    op: AsyncOperationObject,
    channelId: string,
    action: 'send' | 'receive',
    index: number,
    total: number,
  ): string {
    if (op.operationId) {
      return op.operationId;
    }
    const suffix = total > 1 ? `_${index}` : '';
    return `${channelId}_${action}${suffix}`;
  }

  /**
   * Builds an AsyncAPI 3.0 channel object.
   */
  private buildChannel(address: string, data: ChannelData): AsyncChannelObject3 {
    const channel: AsyncChannelObject3 = {
      address,
    };

    if (data.description) {
      channel.description = data.description;
    }

    if (data.parameters && Object.keys(data.parameters).length > 0) {
      channel.parameters = data.parameters;
    }

    if (data.bindings && Object.keys(data.bindings).length > 0) {
      channel.bindings = data.bindings;
    }

    // Add messages to the channel
    if (Object.keys(data.messages).length > 0) {
      channel.messages = {};
      for (const msgName of Object.keys(data.messages)) {
        // Store message reference in channel
        channel.messages[msgName] = {
          $ref: `#/components/messages/${msgName}`,
        };
      }
    }

    return channel;
  }

  /**
   * Builds an AsyncAPI 3.0 operation object.
   */
  private buildOperation(
    action: 'send' | 'receive',
    channelId: string,
    op: AsyncOperationObject,
    channelMessages: Record<string, AsyncMessageObject | ReferenceObject>,
  ): AsyncOperationObject3 {
    const operation: AsyncOperationObject3 = {
      action,
      channel: { $ref: `#/channels/${channelId}` },
    };

    if (op.summary) {
      operation.summary = op.summary;
    }

    if (op.description) {
      operation.description = op.description;
    }

    if (op.tags && op.tags.length > 0) {
      operation.tags = op.tags;
    }

    if (op.externalDocs) {
      operation.externalDocs = op.externalDocs;
    }

    if (op.bindings && Object.keys(op.bindings).length > 0) {
      operation.bindings = op.bindings;
    }

    // Build message references for this operation
    const messageRefs = this.buildMessageReferences(op, channelId, channelMessages);
    if (messageRefs.length > 0) {
      operation.messages = messageRefs;
    }

    return operation;
  }

  /**
   * Builds message references for an operation.
   */
  private buildMessageReferences(
    op: AsyncOperationObject,
    channelId: string,
    channelMessages: Record<string, AsyncMessageObject | ReferenceObject>,
  ): ReferenceObject[] {
    const refs: ReferenceObject[] = [];

    if (!op.message) {
      return refs;
    }

    const message = op.message as AsyncMessageObject | OneOfMessageType;

    if ('oneOf' in message) {
      // Multiple messages
      for (const msg of message.oneOf) {
        const msgName = this.getMessageName(msg as AsyncMessageObject);
        if (msgName && channelMessages[msgName]) {
          refs.push({ $ref: `#/channels/${channelId}/messages/${msgName}` });
        }
      }
    } else {
      // Single message
      const msgName = this.getMessageName(message);
      if (msgName && channelMessages[msgName]) {
        refs.push({ $ref: `#/channels/${channelId}/messages/${msgName}` });
      }
    }

    return refs;
  }

  /**
   * Extracts messages from an operation and adds them to the messages map.
   */
  private extractMessages(
    op: AsyncOperationObject,
    messages: Record<string, AsyncMessageObject | ReferenceObject>,
  ): void {
    if (!op.message) return;

    const message = op.message as AsyncMessageObject | OneOfMessageType;

    if ('oneOf' in message) {
      // Multiple messages (oneOf)
      for (const msg of message.oneOf) {
        const asyncMsg = msg as AsyncMessageObject;
        const name = this.getMessageName(asyncMsg);
        if (name && !messages[name]) {
          messages[name] = this.transformMessage(asyncMsg);
        }
      }
    } else {
      // Single message
      const name = this.getMessageName(message);
      if (name && !messages[name]) {
        messages[name] = this.transformMessage(message);
      }
    }
  }

  /**
   * Gets the message name from a message object.
   */
  private getMessageName(msg: AsyncMessageObject): string | undefined {
    return msg.name;
  }

  /**
   * Transforms a message object for AsyncAPI 3.0.
   */
  private transformMessage(msg: AsyncMessageObject): AsyncMessageObject {
    return {
      ...msg,
      // name is already set
    };
  }
}
