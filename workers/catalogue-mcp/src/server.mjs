import { McpServer } from '@modelcontextprotocol/server';
import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from '@modelcontextprotocol/ext-apps/server';
import * as z from 'zod/v4';
import { searchCatalogue, validQuery, validateCatalogue } from './search.mjs';

// Workers and sandboxed views prohibit the code generation Zod can use for speed.
z.config({ jitless: true });

export const RESOURCE_URI = 'ui://abox/catalogue.html';
export const SERVER_NAME = 'tools.abox/catalogue';
export const SERVER_BRANDING = Object.freeze({
  title: 'abox.tools public catalogue',
  description: 'Find public browser tools by task or format. No file processing or account.',
  websiteUrl: 'https://abox.tools/',
  icons: [{ src: 'https://abox.tools/icon-192.png', mimeType: 'image/png', sizes: ['192x192'] }]
});
export const UI_META = Object.freeze({
  domain: 'https://mcp.abox.tools',
  csp: { connectDomains: [], resourceDomains: [], frameDomains: [], baseUriDomains: [] },
  prefersBorder: true
});

const catalogueSchemas = new WeakMap();

export function cacheJsonSchema(schema) {
  const standard = schema['~standard'];
  const converters = standard?.jsonSchema;
  if (!converters) return schema;
  const target = 'draft-2020-12';
  let cached;
  try {
    cached = {
      input: converters.input({ target }),
      output: converters.output({ target })
    };
  } catch {
    // Preserve the original schema and the SDK's existing error behavior.
    return schema;
  }
  const convert = (direction, options) => (
    options.target === target && options.libraryOptions === undefined
      ? cached[direction]
      : converters[direction](options)
  );
  return {
    '~standard': {
      version: standard.version,
      vendor: standard.vendor,
      types: standard.types,
      validate: (value, options) => standard.validate(value, options),
      jsonSchema: {
        input: options => convert('input', options),
        output: options => convert('output', options)
      }
    }
  };
}

export function prepareCatalogueSchemas(catalogue) {
  const prepared = catalogueSchemas.get(catalogue);
  if (prepared) return prepared;
  validateCatalogue(catalogue);
  const locales = Object.keys(catalogue.locales);
  const inputSchema = z.object({
    query: z.string().refine(validQuery).meta({ maxLength: 200,
      description: 'Public task, tool name or format keywords only. Never send file contents, filenames, passwords or other private data. Empty lists tools.' }),
    limit: z.number().int().min(1).max(20).default(10),
    locale: z.enum(locales).default('en')
  }).strict();
  const outputSchema = z.object({
    locale: z.enum(locales), total: z.number().int().nonnegative(), hasMore: z.boolean(),
    tools: z.array(z.object({ name: z.string(), description: z.string(),
      url: z.url().regex(/^https:\/\/abox\.tools\//) }).strict()).max(20)
  }).strict();
  // Schemas depend only on the frozen catalogue. Servers and transports still
  // belong to individual requests, as the stateless SDK handler requires.
  const schemas = Object.freeze({
    inputSchema: cacheJsonSchema(inputSchema),
    outputSchema: cacheJsonSchema(outputSchema)
  });
  catalogueSchemas.set(catalogue, schemas);
  return schemas;
}

export function createCatalogueServer(catalogue, viewHtml) {
  if (typeof viewHtml !== 'string' || viewHtml.slice(0, 15).toLowerCase() !== '<!doctype html>') {
    throw new TypeError('Build the actual catalogue app HTML before serving MCP');
  }
  const { inputSchema, outputSchema } = prepareCatalogueSchemas(catalogue);
  const server = new McpServer({ ...SERVER_BRANDING, name: SERVER_NAME, version: catalogue.build.version },
    { maxToolInputElements: 10,
      instructions: 'This public server only finds browser tools. Send short public task or format keywords; never send files, filenames, passwords or private content. A result is a public tool link, not file processing. Open a chosen tool in the browser where processing should happen. Tool pages explain intentional network features. Authentication is not required.' });
  registerAppTool(server, 'find_browser_tools', {
    title: 'Find a browser tool',
    description: 'Search the public abox.tools catalogue by task, name or format. Returns public tool descriptions and links, with an interactive catalogue where supported. Public keywords are sent to this service. Does not open tools, accept files or process private content.',
    inputSchema,
    outputSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    _meta: { ui: { resourceUri: RESOURCE_URI, visibility: ['model', 'app'] } }
  }, async args => {
    const result = searchCatalogue(catalogue, args);
    const text = result.tools.length
      ? result.tools.map(tool => `${tool.name}: ${tool.description}\n${tool.url}`).join('\n\n')
      : 'No public tools match these keywords. Browse https://abox.tools/ or try a shorter public task or format.';
    return { content: [{ type: 'text', text }], structuredContent: result };
  });
  registerAppResource(server, 'abox.tools catalogue', RESOURCE_URI,
    { description: 'Interactive public tool catalogue; opens tools on abox.tools without reading files.',
      mimeType: RESOURCE_MIME_TYPE, _meta: { ui: UI_META } },
    async () => ({ contents: [{ uri: RESOURCE_URI, mimeType: RESOURCE_MIME_TYPE,
      text: viewHtml, _meta: { ui: UI_META } }] }));
  return server;
}
