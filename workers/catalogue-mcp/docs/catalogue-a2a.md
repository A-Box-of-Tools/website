# Public catalogue over A2A

This service offers one bounded skill: finding public abox.tools tool names,
descriptions and canonical links. It uses the same generated catalogue and
search rules as the MCP tool. It exposes only public keywords and the
documented catalogue options, with no file, filename, arbitrary-URL,
credential or upload field. Do not send private content. File processing
still happens on the chosen tool's ordinary browser page.

The A2A 1.0 JSON-RPC interface is `POST /a2a` on the separately deployed
catalogue service. The Agent Card's `supportedInterfaces` gives its actual
service URL. A card is only advertised after that endpoint is deployed and
verified. Authentication is not required. There are no accounts, issued
identities, OAuth endpoints or signed-card claims.

## Send a search

Requests use `Content-Type: application/json` and `A2A-Version: 1.0`.
An absent version denotes legacy 0.3 under the A2A specification; this service
supports only 1.0 and returns `VersionNotSupportedError` instead of applying
the wrong wire format. No A2A extensions are supported.

```json
{
  "jsonrpc": "2.0",
  "id": "public-search-1",
  "method": "SendMessage",
  "params": {
    "message": {
      "messageId": "client-public-message-1",
      "role": "ROLE_USER",
      "parts": [{ "text": "png to webp" }]
    }
  }
}
```

For an explicit catalogue language or result limit, replace the text part
with a single structured part:

```json
{
  "data": { "query": "PNG", "locale": "de", "limit": 5 },
  "mediaType": "application/json"
}
```

`query` is required and limited to 200 Unicode code points. Empty keywords
list tools. `locale` defaults to `en` and must be an actual generated language;
`limit` defaults to 10 and must be an integer from 1 through 20. Extra data
fields are rejected. Text input always uses those defaults. Only one text or
data part is accepted; file parts and filenames are rejected. Message and
request metadata must be absent or empty. This keeps the interface's inputs
limited to the public search contract.

The response contains `result.message` with `role: "ROLE_AGENT"`, a fresh
`messageId`, a `contextId` and typed response parts. It is a completed direct
message, with no task object or `kind` discriminator. By default one
`text/plain` part gives useful tool descriptions and addresses, and one
`application/json` data part contains the same typed search result:
`locale`, `total`, `hasMore` and `tools`. Each tool has `name`, `description`
and a canonical HTTPS `url`. No client-provided destination is opened or fetched.

The optional `configuration.acceptedOutputModes` can request either supported
media type. A request that accepts neither returns `ContentTypeNotSupportedError`.
`returnImmediately` has no effect because every response is a direct message.
There is no retained conversation, message history or task state. An input
`contextId` is only an opaque correlation label; it does not retrieve earlier
messages or grant access to any resource.

## Operations and errors

The interface uses the A2A 1.0 PascalCase method names and ProtoJSON enum
names. It does not accept legacy method names such as `message/send`.

- `SendMessage` performs the public search and returns a direct message.
- `ListTasks` returns an empty page with `tasks`, `nextPageToken`, `pageSize`
  and `totalSize`; this service never creates tasks.
- `GetTask` and `CancelTask` return `TaskNotFoundError` for valid task IDs.
- `SendStreamingMessage`, `SubscribeToTask` and `GetExtendedAgentCard` return
  `UnsupportedOperationError`.
- Push-notification operations return `PushNotificationNotSupportedError`.
- Unknown methods return the JSON-RPC method-not-found error.

Valid JSON-RPC exchanges use HTTP 200 even when the RPC result is an error.
Notifications without an ID return an empty HTTP 204 response; these read-only
queries have no state or side effect to apply. Null and fractional request IDs
are accepted as JSON-RPC permits, although clients should prefer string IDs.
Malformed JSON receives JSON-RPC parse error -32700 with HTTP 400.
Malformed request envelopes return HTTP 400; unexpected internal failures
return HTTP 500 with a generic error. Responses carry `A2A-Version: 1.0` and
are not cached. Error messages do not echo search text, file names or payloads.

The surrounding Worker enforces Host, browser Origin, rate limits and the
16 KiB request-body cap before this adapter runs. Native clients can omit
Origin. The same separately configured service limits apply to A2A and MCP;
adding a protocol does not create a second quota. No request-body or query
logging is added.

## Specification references

- [A2A 1.0 protocol and Agent Card](https://a2a-protocol.org/v1.0.0/specification/)
- [Normative protocol definitions](https://a2a-protocol.org/v1.0.0/definitions/)
- [A2A and MCP](https://a2a-protocol.org/v1.0.0/topics/a2a-and-mcp/)

The adapter needs no additional dependency or identity service. CI runs its
protocol, input-boundary and capability tests; a deployment also needs real
HTTP requests and operation-specific CPU/outcome checks on the Free plan.
