# Can an AI agent use these tools?

Agents can use the browser interface. To assess where data goes, check where the browser runs, what the agent itself sends and which tool features use the network.

Last updated 12 October 2026

## The short answer

An agent with browser control can use these ordinary web pages: labelled controls, file pickers and downloads, without a site account. Its environment must support the required file access, browser APIs and permissions. Camera permission or a device share sheet may need your participation.

For file processing, the first question is **where the controlled browser runs**. Also check what the agent's own service receives, and whether the requested feature intentionally fetches or shares data. A local browser alone does not settle all three questions.

## Two kinds of agent, one distinction

Agents that use tools come in two shapes, and the difference between them matters more than anything else on this page.

**A locally controlled browser** reads and processes the file on that device. Using a local processing tool here adds no file upload for processing. The agent may still send instructions, screenshots or file context to its vendor; that is governed by the agent's own implementation and settings.

**A cloud browser** runs on the agent vendor's computer. If you attach a file for the agent to use there, it has already left your device. These tools process it inside that remote browser and do not undo the earlier transfer. Intentional sharing or app handoffs are additional actions in either environment.

Specify a local browser when keeping processing on your device matters, check the agent's own data handling, and authorize any deliberate transfer separately. [Online rate lookup and email handoff](https://abox.tools/receipt-invoice-extractor/), [image URL import](https://abox.tools/images-to-video/), [sharing](https://abox.tools/share-text/) and [camera viewing](https://abox.tools/remote-camera/) have documented network boundaries.

## How to hand a job to an agent

Agents do best with the same brief a colleague would want: the tool, the file, and what done looks like. Some patterns that work:

- **Name the outcome, not just the tool.** “Open abox.tools/compress-image/ and get this photo under 200 KB” gives the agent the number the page will ask for. The [image compressor](https://abox.tools/compress-image/) takes a target size by name, which is exactly the kind of instruction an agent can carry faithfully.
- **Point it at the map.** This site publishes [llms.txt](https://abox.tools/llms.txt) — every tool and guide, with a one-line description each, as plain text in a single fetch. An agent that reads it knows what exists here without crawling anything. And every page has a twin at its own address with `index.md` on the end: the page as Markdown, without the interface around it, for an agent that wants what a tool page says rather than what it looks like.
- **Let it read the page it is on.** Every tool carries its questions and answers in the page itself, and every tool has a guide a link away. An agent that seems unsure of a setting can be told to read the guide first, the same advice a person would get.
- **State the checks between steps.** For scan-to-PDF or image-cleanup workflows, tell the agent to inspect page order, crop, readable text and output size. OCR, redaction and choosing what may be shared require judgement and a review of the result.

## What not to delegate

Operating controls is only part of a task. Review decisions that change what another person can see or receive. Two examples:

**Deciding what must not be seen.** The redaction tools delete what you cover — but choosing what to cover is the job, and an agent that misses one line has produced a file that looks finished and is not. Let an agent operate a redactor if you like; look at the result yourself before it goes anywhere, the same rule those tools' own guides give a human operator.

**Opening what was read.** This site's QR reader refuses to open what it decodes, because reading and following are different acts. The same separation is worth imposing on an agent: an agent that reads a code, a link or an address in a file should report it, not visit it. And an agent steering your own browser is holding whatever that browser is signed into — a reason to give it the same squint you give any tool, which is the next section.

## An agent can check the promise too

The four checks the [upload guide](https://abox.tools/guides/is-it-safe-to-upload-files/) teaches — pull the plug, watch the Network tab, read the Content-Security-Policy, read the code — are all things an agent can run, and they are actually easier for an agent than for a person: reading a CSP header or searching served source for `fetch` calls is mechanical work. If you use an agent to vet tools before trusting them, this site expects to be vetted the same way, and the offline behaviour the checks rely on has [a page of its own](https://abox.tools/guides/how-can-a-web-page-work-offline/).

The pages label their controls and publish [llms.txt](https://abox.tools/llms.txt) and Markdown copies for reading. Their source, shared modules and bundled engines are public. The build generates and minifies the served pages, so compare a build with the deployed output when auditing code. Availability of DevTools and WebRTC diagnostics depends on the agent environment.

This guide cannot make a privacy guarantee about an agent vendor. Instructions, screenshots and sometimes files may be sent by the agent even when its browser is local. Treat that data path and the tool's documented network features as part of the task, not as something browser location alone proves.
