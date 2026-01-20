#!/usr/bin/env node
/**
 * Test script to verify AsyncAPI 3.0 document structure
 */

const yaml = require('js-yaml');
const { AsyncapiTransformer } = require('../dist/lib/services/asyncapi.transformer');

const transformer = new AsyncapiTransformer();

// Create test denormalized docs similar to what the scanner produces
const denormalizedDocs = [
  {
    root: { name: '/test/channel', description: 'Test channel' },
    operations: {
      pub: {
        channel: '/test/channel',
        operationId: 'sendTestMessage',
        summary: 'Send a test message',
        message: {
          name: 'TestMessage',
          title: 'Test Message',
          payload: { type: 'object' }
        }
      },
      sub: {
        channel: '/test/channel',
        operationId: 'receiveTestMessage',
        summary: 'Receive a test message',
        message: {
          name: 'TestMessage',
          title: 'Test Message',
          payload: { type: 'object' }
        }
      }
    }
  }
];

const result = transformer.normalizeChannels(denormalizedDocs);

// Create full document
const doc = {
  asyncapi: '3.0.0',
  info: { title: 'Test API', version: '1.0.0' },
  channels: result.channels,
  operations: result.operations,
  components: { schemas: {} }
};

console.log('Generated AsyncAPI 3.0 document:');
console.log(yaml.dump(doc, { lineWidth: -1 }));

// Validate structure
let errors = [];

// Check channels have address (3.0 requirement) and embedded messages
for (const [id, channel] of Object.entries(result.channels)) {
  if (!channel.address) {
    errors.push(`Channel ${id} missing 'address' field`);
  }
  if (channel.messages) {
    for (const [msgId, msg] of Object.entries(channel.messages)) {
      if (msg.$ref) {
        errors.push(`Channel ${id} message ${msgId} uses $ref (should be embedded)`);
      }
      if (!msg.name) {
        errors.push(`Channel ${id} message ${msgId} missing name`);
      }
    }
  }
}

// Check operations have action and channel ref
for (const [id, op] of Object.entries(result.operations)) {
  if (!op.action) {
    errors.push(`Operation ${id} missing 'action' field`);
  }
  if (!op.channel || !op.channel.$ref) {
    errors.push(`Operation ${id} missing 'channel.$ref' field`);
  }
  if (op.action !== 'send' && op.action !== 'receive') {
    errors.push(`Operation ${id} has invalid action: ${op.action}`);
  }
  // Check operation references channel messages
  if (op.messages) {
    for (const msgRef of op.messages) {
      if (!msgRef.$ref || !msgRef.$ref.includes('/channels/')) {
        errors.push(`Operation ${id} has invalid message ref: ${JSON.stringify(msgRef)}`);
      }
    }
  }
}

if (errors.length > 0) {
  console.error('\nValidation errors:');
  errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
} else {
  console.log('\n✓ AsyncAPI 3.0 document structure is valid!');
  console.log('✓ Channels have embedded messages (no $ref)');
  console.log('✓ Operations have action (send/receive) and channel reference');
  process.exit(0);
}
