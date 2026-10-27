import assert from 'node:assert/strict';
import test from 'node:test';

import { Client, InMemoryTransport } from '@modelcontextprotocol/client';
import { McpServer } from '@modelcontextprotocol/server';
import { registerAppTool } from '@modelcontextprotocol/ext-apps/server';
import * as z from 'zod/v4';

import { cacheJsonSchema } from '../src/server.mjs';
import { validQuery } from '../src/search.mjs';

const target = 'draft-2020-12';
const resourceUri = 'ui://tests/public-catalogue.html';

function fixtureSchemas(locales = ['en', 'de']) {
  return {
    inputSchema: z.object({
      query: z.string().refine(validQuery).meta({ maxLength: 200 }),
      limit: z.number().int().min(1).max(20).default(10),
      locale: z.enum(locales).default('en')
    }).strict(),
    outputSchema: z.object({
      query: z.string(), limit: z.number().int().min(1).max(20),
      locale: z.enum(locales), url: z.url().regex(/^https:\/\/abox\.tools\//)
    }).strict()
  };
}

function validResult(args) {
  return {
    content: [{ type: 'text', text: 'Public catalogue result.' }],
    structuredContent: { ...args, url: 'https://abox.tools/png-to-webp/' }
  };
}

async function fixtureClient(t, schemas = fixtureSchemas(), handler = validResult, prepared = false) {
  const wrap = prepared ? schema => schema : cacheJsonSchema;
  const server = new McpServer({ name: 'schema-cache-tests', version: '0.0.0+test.fixture' },
    { maxToolInputElements: 10 });
  registerAppTool(server, 'find_public_tool', {
    inputSchema: wrap(schemas.inputSchema),
    outputSchema: wrap(schemas.outputSchema),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    _meta: { ui: { resourceUri, visibility: ['model', 'app'] } }
  }, handler);
  const client = new Client({ name: 'schema-cache-test-client', version: '0.0.0+test.fixture' });
  t.after(async () => {
    await client.close();
    await server.close();
  });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  return client;
}

test('fresh SDK servers reuse prepared Zod JSON documents without reconversion', async (t) => {
  function instrument(schema) {
    const standard = schema['~standard'];
    const calls = { input: 0, output: 0 };
    return {
      calls,
      schema: {
        '~standard': {
          ...standard,
          validate: (value, options) => standard.validate(value, options),
          jsonSchema: Object.fromEntries(['input', 'output'].map(direction => [
            direction, options => {
              calls[direction] += 1;
              return standard.jsonSchema[direction](options);
            }
          ]))
        }
      }
    };
  }
  const originals = fixtureSchemas();
  const input = instrument(originals.inputSchema);
  const output = instrument(originals.outputSchema);
  const prepared = {
    inputSchema: cacheJsonSchema(input.schema),
    outputSchema: cacheJsonSchema(output.schema)
  };
  assert.deepEqual(input.calls, { input: 1, output: 1 });
  assert.deepEqual(output.calls, { input: 1, output: 1 });
  const inputDocument = prepared.inputSchema['~standard'].jsonSchema.input({ target });
  const outputDocument = prepared.outputSchema['~standard'].jsonSchema.output({ target });
  for (let instance = 0; instance < 2; instance += 1) {
    const client = await fixtureClient(t, prepared, validResult, true);
    for (let publication = 0; publication < 2; publication += 1) {
      const tool = (await client.listTools()).tools[0];
      assert.deepEqual(tool.inputSchema, inputDocument);
      assert.deepEqual(tool.outputSchema, outputDocument);
      const result = await client.callTool({ name: 'find_public_tool', arguments: { query: 'PNG' } });
      assert.notEqual(result.isError, true);
    }
  }
  assert.deepEqual(input.calls, { input: 1, output: 1 });
  assert.deepEqual(output.calls, { input: 1, output: 1 });
  const alternate = prepared.inputSchema['~standard'].jsonSchema.input({ target: 'draft-07' });
  assert.notEqual(alternate.$schema, inputDocument.$schema);
  assert.deepEqual(input.calls, { input: 2, output: 1 });
  const overridden = prepared.outputSchema['~standard'].jsonSchema.output({
    target,
    libraryOptions: { override: ({ jsonSchema }) => { jsonSchema.description = 'Independent override.'; } }
  });
  assert.equal(overridden.description, 'Independent override.');
  assert.deepEqual(output.calls, { input: 1, output: 2 });
  assert.strictEqual(prepared.inputSchema['~standard'].jsonSchema.input({ target }), inputDocument);
  assert.strictEqual(prepared.outputSchema['~standard'].jsonSchema.output({ target }), outputDocument);
  assert.equal(outputDocument.description, undefined);
  const independent = instrument(fixtureSchemas(['en']).inputSchema);
  const separate = cacheJsonSchema(independent.schema);
  const separateDocument = separate['~standard'].jsonSchema.input({ target });
  assert.notStrictEqual(separateDocument, inputDocument);
  assert.deepEqual(separateDocument.properties.locale.enum, ['en']);
  assert.deepEqual(inputDocument.properties.locale.enum, ['en', 'de']);
  assert.deepEqual(independent.calls, { input: 1, output: 1 });
  assert.deepEqual(input.calls, { input: 2, output: 1 });
  assert.deepEqual(output.calls, { input: 1, output: 2 });
});

test('SDK App tool schemas match the original Zod input and output documents', async (t) => {
  for (const locales of [['en', 'de'], ['en']]) {
    const schemas = fixtureSchemas(locales);
    const client = await fixtureClient(t, schemas);
    const tool = (await client.listTools()).tools[0];
    assert.deepEqual(tool.inputSchema, schemas.inputSchema['~standard'].jsonSchema.input({ target }));
    assert.deepEqual(tool.outputSchema, schemas.outputSchema['~standard'].jsonSchema.output({ target }));
    assert.equal(tool._meta.ui.resourceUri, resourceUri);
    assert.deepEqual(tool._meta.ui.visibility, ['model', 'app']);
    assert.equal(tool.annotations.readOnlyHint, true);
    assert.equal(tool.annotations.destructiveHint, false);
  }
});

test('SDK runtime validation retains defaults and inclusive Unicode and limit bounds', async (t) => {
  const client = await fixtureClient(t);
  const defaulted = await client.callTool({ name: 'find_public_tool', arguments: { query: 'PNG' } });
  assert.notEqual(defaulted.isError, true);
  assert.deepEqual(defaulted.structuredContent, {
    query: 'PNG', limit: 10, locale: 'en', url: 'https://abox.tools/png-to-webp/'
  });
  for (const limit of [1, 20]) {
    const query = '😀'.repeat(200);
    const result = await client.callTool({ name: 'find_public_tool', arguments: { query, limit, locale: 'de' } });
    assert.notEqual(result.isError, true);
    assert.equal(result.structuredContent.query, query);
    assert.equal(result.structuredContent.limit, limit);
    assert.equal(result.structuredContent.locale, 'de');
  }
});

test('SDK input validation retains custom refinements and rejects extra private fields', async (t) => {
  const client = await fixtureClient(t);
  for (const args of [
    { query: '😀'.repeat(201) }, { query: 'PNG\u0000' }, { query: '\uD800' },
    { query: 'PNG', limit: 0 }, { query: 'PNG', limit: 21 },
    { query: 'PNG', limit: null }, { query: 'PNG', locale: 'ja' },
    { query: 'PNG', file: 'private.png' }
  ]) {
    const result = await client.callTool({ name: 'find_public_tool', arguments: args });
    assert.equal(result.isError, true);
    assert.match(result.content[0].text, /Input validation error/);
  }
});

test('SDK output validation still rejects malformed structured content', async (t) => {
  const client = await fixtureClient(t, fixtureSchemas(), args => ({
    content: [{ type: 'text', text: 'Deliberately invalid fixture result.' }],
    structuredContent: { ...args, url: 'https://other.example/private/' }
  }));
  const result = await client.callTool({ name: 'find_public_tool', arguments: { query: 'PNG' } });
  assert.equal(result.isError, true);
  assert.match(result.content[0].text, /Output validation error/);
});

test('other JSON Schema targets and vendor options preserve their requested meaning', () => {
  const original = z.object({ label: z.string().default('public') }).strict();
  const adapted = cacheJsonSchema(original);
  for (const direction of ['input', 'output']) {
    const convert = adapted['~standard'].jsonSchema[direction];
    const originalConvert = original['~standard'].jsonSchema[direction];
    const draft07 = { target: 'draft-07' };
    assert.deepEqual(convert(draft07), originalConvert(draft07));
    assert.notEqual(convert(draft07).$schema, convert({ target }).$schema);
    const options = {
      target,
      libraryOptions: { override: ({ jsonSchema }) => { jsonSchema.description = 'Requested vendor override.'; } }
    };
    assert.deepEqual(convert(options), originalConvert(options));
    assert.equal(convert(options).description, 'Requested vendor override.');
    assert.equal(convert({ target }).description, undefined);
  }
});

test('unrepresentable JSON Schema keeps the original Zod validator and conversion error', async () => {
  const original = z.object({ createdAt: z.date() }).strict();
  const adapted = cacheJsonSchema(original);
  const valid = { createdAt: new Date('2026-01-01T00:00:00Z') };
  assert.deepEqual((await adapted['~standard'].validate(valid)).value, valid);
  assert.ok((await adapted['~standard'].validate({ createdAt: 'not a Date' })).issues.length > 0);
  for (const direction of ['input', 'output']) {
    assert.throws(() => original['~standard'].jsonSchema[direction]({ target }));
    assert.throws(() => adapted['~standard'].jsonSchema[direction]({ target }));
  }
});
