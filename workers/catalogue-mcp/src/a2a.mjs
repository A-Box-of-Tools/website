import { searchCatalogue, validQuery, validateCatalogue } from './search.mjs';

export const A2A_VERSION = '1.0';
export const A2A_PATH = '/a2a';

const SERVICE_ORIGINS = new Set(['https://mcp.abox.tools', 'https://mcp-dev.abox.tools',
  'http://localhost:8787', 'http://127.0.0.1:8787']);
const OUTPUT_MODES = ['text/plain', 'application/json'];
const TASK_STATES = new Set(['TASK_STATE_UNSPECIFIED', 'TASK_STATE_SUBMITTED', 'TASK_STATE_WORKING',
  'TASK_STATE_COMPLETED', 'TASK_STATE_FAILED', 'TASK_STATE_CANCELED', 'TASK_STATE_INPUT_REQUIRED',
  'TASK_STATE_REJECTED', 'TASK_STATE_AUTH_REQUIRED']);
const DISABLED_STREAMING = new Set(['SendStreamingMessage', 'SubscribeToTask', 'GetExtendedAgentCard']);
const DISABLED_PUSH = new Set(['CreateTaskPushNotificationConfig', 'GetTaskPushNotificationConfig',
  'ListTaskPushNotificationConfigs', 'DeleteTaskPushNotificationConfig']);

class A2aError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

function fail(code = -32602, message = 'Invalid parameters') {
  throw new A2aError(code, message);
}

function record(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    && [Object.prototype, null].includes(Object.getPrototypeOf(value));
}

function fields(value, allowed) {
  if (!record(value) || Object.keys(value).some(key => !allowed.includes(key))) fail();
}

function identifier(value) {
  return typeof value === 'string' && value.length > 0 && validQuery(value);
}

function emptyMetadata(value) {
  if (value !== undefined && (!record(value) || Object.keys(value).length)) fail();
}

function emptyTenant(value) {
  if (value !== undefined && value !== '') fail(-32602, 'Tenant routing is not supported');
}

function historyLength(value) {
  if (value !== undefined && (!Number.isInteger(value) || value < 0 || value > 2147483647)) fail();
}

export function buildAgentCard(catalogue, serviceOrigin = 'https://mcp.abox.tools') {
  validateCatalogue(catalogue);
  if (!SERVICE_ORIGINS.has(serviceOrigin)) throw new TypeError('Use a configured catalogue service origin');
  return {
    name: 'abox.tools public catalogue',
    iconUrl: 'https://abox.tools/icon-192.png',
    description: 'Find public browser tools by task, name or file format. Initial public keywords go to this service. Returns tool descriptions and links; does not accept files, open tools or process private content. Authentication is not required.',
    supportedInterfaces: [{ url: `${serviceOrigin}${A2A_PATH}`, protocolBinding: 'JSONRPC', protocolVersion: A2A_VERSION }],
    provider: { organization: 'abox.tools', url: 'https://abox.tools/' },
    version: catalogue.build.version,
    documentationUrl: `https://github.com/A-Box-of-Tools/website/blob/${catalogue.build.revision}/workers/catalogue-mcp/docs/catalogue-a2a.md`,
    capabilities: { streaming: false, pushNotifications: false, extendedAgentCard: false },
    defaultInputModes: [...OUTPUT_MODES], defaultOutputModes: [...OUTPUT_MODES],
    skills: [{ id: 'find_browser_tools', name: 'Find a browser tool',
      description: 'Send one text part of public keywords, or one application/json data part with query, optional locale (default en) and limit (1–20, default 10). Query is at most 200 Unicode code points; empty lists tools. Search results are public catalogue information, not file processing.',
      tags: ['browser tools', 'catalogue', 'public search'], examples: ['png to webp', 'compress pdf'] }]
  };
}

function outputModes(configuration) {
  if (configuration === undefined) return OUTPUT_MODES;
  fields(configuration, ['acceptedOutputModes', 'taskPushNotificationConfig', 'historyLength', 'returnImmediately']);
  if (configuration.taskPushNotificationConfig !== undefined) fail(-32003, 'Push notifications are not supported');
  historyLength(configuration.historyLength);
  if (configuration.returnImmediately !== undefined && typeof configuration.returnImmediately !== 'boolean') fail();
  const accepted = configuration.acceptedOutputModes;
  if (accepted === undefined) return OUTPUT_MODES;
  if (!Array.isArray(accepted) || !accepted.length || accepted.length > 8
      || accepted.some(value => !identifier(value))) fail();
  const supported = OUTPUT_MODES.filter(mode => accepted.includes(mode));
  if (!supported.length) fail(-32005, 'Only text/plain and application/json outputs are supported');
  return supported;
}

function sendMessage(catalogue, params) {
  fields(params, ['tenant', 'message', 'configuration', 'metadata']);
  emptyTenant(params.tenant);
  emptyMetadata(params.metadata);
  const modes = outputModes(params.configuration);
  const incoming = params.message;
  fields(incoming, ['messageId', 'contextId', 'taskId', 'role', 'parts', 'metadata', 'extensions', 'referenceTaskIds']);
  if (!identifier(incoming.messageId) || incoming.role !== 'ROLE_USER') fail();
  if (incoming.contextId !== undefined && !identifier(incoming.contextId)) fail();
  emptyMetadata(incoming.metadata);
  for (const value of [incoming.extensions, incoming.referenceTaskIds]) {
    if (value !== undefined && (!Array.isArray(value) || value.length)) fail(-32004, 'Extensions and task references are not supported');
  }
  if (incoming.taskId !== undefined && incoming.taskId !== '') {
    if (!identifier(incoming.taskId)) fail();
    fail(-32001, 'Task not found');
  }
  if (!Array.isArray(incoming.parts) || incoming.parts.length !== 1) fail(-32602, 'Send one public keyword part');
  const part = incoming.parts[0];
  if (record(part) && ['raw', 'url', 'filename', 'file'].some(key => Object.hasOwn(part, key))) {
    fail(-32005, 'File inputs are not supported');
  }
  fields(part, ['text', 'data', 'mediaType']);
  const text = Object.hasOwn(part, 'text');
  const data = Object.hasOwn(part, 'data');
  if (text === data) fail(-32602, 'Send exactly one text or data part');
  if (part.mediaType !== undefined && part.mediaType !== (text ? 'text/plain' : 'application/json')) {
    fail(-32005, 'Only public keyword text or application/json search arguments are supported');
  }
  let result;
  try {
    result = searchCatalogue(catalogue, text ? { query: part.text } : part.data);
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
    fail(-32602, 'Use public keywords up to 200 Unicode code points, an available locale and limit 1–20');
  }
  const parts = [];
  if (modes.includes('text/plain')) {
    const description = result.tools.length
      ? result.tools.map(tool => `${tool.name}: ${tool.description}\n${tool.url}`).join('\n\n')
      : 'No public tools match these keywords. Browse https://abox.tools/ or try shorter public task or format keywords.';
    parts.push({ text: description, mediaType: 'text/plain' });
  }
  if (modes.includes('application/json')) parts.push({ data: result, mediaType: 'application/json' });
  // These identifiers correlate this completed exchange only. No message,
  // context, query or result is retained after the response.
  return { message: { messageId: crypto.randomUUID(), contextId: incoming.contextId ?? crypto.randomUUID(),
    role: 'ROLE_AGENT', parts } };
}

function getTask(params, cancel = false) {
  fields(params, cancel ? ['tenant', 'id', 'metadata'] : ['tenant', 'id', 'historyLength']);
  emptyTenant(params.tenant);
  if (!identifier(params.id)) fail();
  if (cancel) emptyMetadata(params.metadata);
  else historyLength(params.historyLength);
  fail(-32001, 'Task not found');
}

function listTasks(params) {
  fields(params, ['tenant', 'contextId', 'status', 'pageSize', 'pageToken', 'historyLength', 'statusTimestampAfter', 'includeArtifacts']);
  emptyTenant(params.tenant);
  historyLength(params.historyLength);
  if (params.contextId !== undefined && !identifier(params.contextId)) fail();
  if (params.status !== undefined && !TASK_STATES.has(params.status)) fail();
  if (params.pageToken !== undefined && params.pageToken !== '') fail(-32602, 'No task pagination token has been issued');
  if (params.includeArtifacts !== undefined && typeof params.includeArtifacts !== 'boolean') fail();
  const size = params.pageSize ?? 50;
  if (!Number.isInteger(size) || size < 1 || size > 100) fail();
  if (params.statusTimestampAfter !== undefined && (typeof params.statusTimestampAfter !== 'string'
      || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,9})?Z$/.test(params.statusTimestampAfter)
      || !Number.isFinite(Date.parse(params.statusTimestampAfter)))) fail();
  return { tasks: [], nextPageToken: '', pageSize: size, totalSize: 0 };
}

function rpcId(value) {
  return value === null || typeof value === 'string' || (typeof value === 'number' && Number.isFinite(value));
}

function respond(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: {
    'Content-Type': 'application/json', 'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff', 'A2A-Version': A2A_VERSION
  } });
}

export function a2aResponse(catalogue, message, headers = new Headers()) {
  const id = record(message) && rpcId(message.id) ? message.id : null;
  try {
    if (!record(message) || message.jsonrpc !== '2.0' || (Object.hasOwn(message, 'id') && !rpcId(message.id))
        || typeof message.method !== 'string' || !identifier(message.method)
        || Object.keys(message).some(key => !['jsonrpc', 'id', 'method', 'params'].includes(key))) {
      fail(-32600, 'Request payload validation error');
    }
    // Notifications have no response, including when their operation would
    // fail. There is no state or side effect to apply for catalogue reads.
    if (!Object.hasOwn(message, 'id')) return new Response(null, { status: 204,
      headers: { 'Cache-Control': 'no-store', 'A2A-Version': A2A_VERSION } });
    // A missing version denotes legacy 0.3 in A2A. This endpoint advertises
    // only 1.0 and never silently applies its wire format to legacy requests.
    if (headers.get('A2A-Version') !== A2A_VERSION) fail(-32009, 'A2A-Version: 1.0 is required');
    if (headers.get('A2A-Extensions')?.trim()) fail(-32004, 'Extensions are not supported');
    const params = message.params === undefined ? {} : message.params;
    if (!record(params)) fail();
    validateCatalogue(catalogue);
    let result;
    if (message.method === 'SendMessage') result = sendMessage(catalogue, params);
    else if (message.method === 'ListTasks') result = listTasks(params);
    else if (message.method === 'GetTask') result = getTask(params);
    else if (message.method === 'CancelTask') result = getTask(params, true);
    else if (DISABLED_STREAMING.has(message.method)) fail(-32004, 'This operation is not supported');
    else if (DISABLED_PUSH.has(message.method)) fail(-32003, 'Push notifications are not supported');
    else fail(-32601, 'Method not found');
    return respond({ jsonrpc: '2.0', id, result });
  } catch (error) {
    const known = error instanceof A2aError;
    const code = known ? error.code : -32603;
    return respond({ jsonrpc: '2.0', id, error: { code, message: known ? error.message : 'Internal error' } },
      code === -32600 ? 400 : known ? 200 : 500);
  }
}
