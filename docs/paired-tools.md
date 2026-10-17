# Pairing tools through shared parts

Share Text & Files, Share a Browser Tab, Local Walkie-Talkie, Voice Oncall and Remote Camera use the
same pairing primitives. They live under `shared/js/`, have no dependencies,
and are copied into each tool by `js_parts`, so every built tool remains a
complete folder with versioned imports and its own service-worker cache.

## A common starting point

Each tool names the `paired-tools` CSS part and starts with a
`data-pairing-nearby` card, before its `data-pairing-setup` controls. The shared
`partials/paired-network.html` help is translated through `ui.tool` and explains
Wi-Fi, phone hotspots, the internet requirement for discovery and
pairing, and device isolation. This is setup guidance, not a claim that a web
page can enable a hotspot or that every hotspot permits direct connections.

Choosing a nearby entry never starts pairing or requests media. Camera and
Walkie-Talkie fill their invitation, Voice Oncall selects the pager, and Share
Tab fills its code; a separate Connect, Join or Request action follows. Keyboard
selection keeps focus in Voice Oncall's native radio group.
Share Text opens its existing consent page in another tab so an unsent draft
is retained. Its Connect action still precedes the introduction to the host.
An active session cannot be replaced by choosing another nearby entry.

The visual order does not alter when discovery is permitted: Share Tab still
requires Find nearby tabs; the other
four tools retain their automatic directory browsing. Host discoverability
defaults and approval rules remain tool-specific and are stated on each page.
All five tools use internet introductions for pairing. The user chooses a
nearby entry, invitation link or code rather than a connection method. A saved
page cache does not replace the introduction service. A healthy direct session
may outlive a brief internet interruption, but new peers and recovery still
depend on the service. Local reachability and the tools' existing approval,
password and media boundaries remain separate requirements.

## Shared pairing primitives

The library has two layers. `peer-pairing.js` owns a signaling socket's
callbacks and timers. `foreground-recovery.js` observes page lifecycle events
and supplies an optional bounded retry controller. `peer-network.js` already
owns ICE configuration and local candidate/SDP filtering; `peer-discovery.js`
and `room-names.js` supply the existing discovery and room-name primitives.
Both voice tools also share their authenticated protocol in `voice-session.js`.

## Choosing the pairing service

Add `"peer-endpoint"` to the tool's `js_parts` and use `rendezvousEndpoint()`
for both discovery and session sockets. It selects the separate development
service, `wss://rendezvous-dev.abox.tools`, on localhost, 127.0.0.1 and HTTPS
`abox-preview.pages.dev` or its subdomains. Other page addresses, including
production and unknown or malformed addresses, use
`wss://rendezvous.abox.tools`. The choice comes only from the page address;
query strings and invitation fragments cannot choose a server.

Both WSS origins belong in the tool's `connect-src` policy. A development
outage remains a development outage: there is no fallback to production.
Consequently local builds and preview deployments need the development
worker and pair only with pages selecting that same service. This separates
rooms, discovery and runtime bindings from the live worker.

## Owning an introduction

Add `"peer-pairing"` to a tool's `js_parts`, then import `PairingSocket` from
`./shared/peer-pairing.js`. Wrap the socket the tool creates for its own
endpoint. Pass a `current` predicate that checks the active session and the
identity of that socket. The wrapper checks it before dispatching events,
sending frames or running a timer; `close()` permanently retires the wrapper
before clearing its handlers and timers. An old socket cannot acquire the
authority of its replacement.

`listen({ open, message, close, error })` installs guarded callbacks. Messages
remain raw events: authentication, frame limits, parsing, ordering and terminal
controls belong to the protocol adapter. Opening a WebSocket is never proof
that a participant has authenticated or that a viewer has been approved.

`send(frame)` sends strings unchanged and serializes objects as JSON. It returns
false for a retired socket, a socket that is not open, a full configured buffer,
or a failed send. `maxBuffered` is optional, and `onSendError` lets an adapter
report or recover from a thrown send. Callers must handle a false return when
their protocol requires delivery.

`after(name, delay, callback)` and `every(name, delay, callback)` own named
deadlines and recurring work. Replacing or clearing a timer invalidates even a
callback already queued by the browser. `clear(name)` cancels that work.
`probe({ timeout, onTimeout, accept })` sends one ping and waits for an accepted
raw message. Its default acceptance rule is the exact string `pong`; repeated
probes share the pending deadline. Accepted messages still reach the adapter.
`cancelProbe()` cancels the pending probe. These helpers do not choose retry
timing or tear down healthy WebRTC peers when introductions disappear.

## Returning to a page

Add `"foreground-recovery"` to `js_parts` and import `observeForeground`.
It routes visibility, pageshow, online, pagehide and blur events to the
callbacks a tool supplies. Visible/online/pageshow events coalesce into one
foreground callback in a microtask, with visibility checked again on delivery.
Hidden and suspended pages invalidate pending work; pagehide holds foreground
callbacks until pageshow. The optional restore callback runs before foreground
recovery, so an adapter can restore its own suspended state first. The returned
disposer removes listeners and invalidates queued callbacks.

The observer does not call recovery at registration. A tool's Start or Connect
action remains the only source of new session intent. The foreground callback
must check that intent before probing, reconnecting or replacing media. A
hidden callback may release a held Talk button without stopping healthy
hands-free audio. Media permissions, track replacement, mute state and explicit
Stop remain the tool's responsibility.

The separate `foregroundRecovery(retry, options)` helper is Share Text's bounded
retry scheduler. It exposes `start`, `ready`, `pause`, `foreground`, `stop` and
`active`; its caller supplies the eligibility check, delay, limit and exhausted
callback. `start` requires existing consent, `ready` requires the tool's actual
introduction, and `stop` invalidates queued retries. This controller is optional:
camera and voice keep their established retry schedules and readiness rules.

## What each adapter retains

| Tool | Pairing and recovery decisions |
|---|---|
| Share Text & Files | Explicit Connect, Local/direct/relay selection, private admission tokens, reader mode and partial-file retirement. Reader recovery is ready after the private/text introduction; socket open alone does not reset its retry budget. |
| Local Walkie-Talkie | Host/listener credentials, room generations, receive-only listeners, local ICE and explicit Talk. |
| Voice Oncall | Host/caller credentials, password checks, generations, moderation, a receive-only host and explicit Talk. |
| Remote Camera | Per-viewer approval and acknowledgement, media readiness, viewer limits, same-link recovery, admitted-pong checks and atomic camera/microphone replacement. |
| Share a Browser Tab | A click and browser-tab-only capture, internet introductions with opt-in code-only nearby discovery, host-only ICE without STUN or TURN, and mandatory approval and acknowledgement before video. Discovery opens only after an opted-in host starts or a viewer chooses Find nearby tabs; selecting a result only fills the invitation. One viewer can watch. An ended track requires a new picker choice; returning cannot recapture. |

Recovery must not widen a transport policy, re-enable a microphone, lose an
approval requirement or restore a session the user ended. The socket and
lifecycle parts never request devices, save session intent, or choose a
server. `peer-endpoint.js` makes only the fixed environment choice described
above. These primitives require no worker protocol changes.

## Connection reports

`connection-diagnostics.js` supplies the bounded in-tab collector used by
Remote Camera. Add `"connection-diagnostics"` to `js_parts`, import
`createDiagnostics`, and pass the instance to the protocol adapter. A built
module's `?v=` hash identifies the tool version; browser identification is
reduced from `navigator.userAgent` to allowlisted family/version/platform
fields. An exported Camera report also contains the static tool slug
`remote-camera`.

Adapters record stage keys, connection states, relative timings, aggregate
candidate and transport counts, and allowlisted error operation/name keys.
Do not retain addresses, raw candidates or SDP, room names or credentials,
viewer notes, content/media, raw user agents or exception messages. Attempts,
events and errors are bounded. Finishing an attempt removes its listeners and
sampling timer while retaining its summary, so failure and explicit Stop do
not erase useful evidence or authorize recovery.

The Camera UI creates JSON only when the user requests Copy connection report
or Download JSON. Clipboard/download failure reveals a labelled readonly field
for manual selection. Reports remain in memory until the tab reloads and are
never uploaded or saved automatically. Collect reports from both devices to
compare progress; their states alone do not establish a network or browser
cause. Diagnostic sampling and export must never change admission, candidate
policy, media state or session lifetime.

The shared unit tests exercise socket retirement, timers, probes and page
lifecycle coalescing. Existing session tests and browser QA exercise each
adapter's permissions, direct connections and recovery. A browser can still
suspend a locked phone; sharing this code makes recovery consistent but does
not change the operating system's background execution policy.
