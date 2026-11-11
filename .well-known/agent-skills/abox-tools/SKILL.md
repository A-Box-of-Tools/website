---
name: "abox-tools"
description: "Use this skill when a person asks to find or use a browser tool for a supported file or text task, including image, PDF and structured-data work. Choose a matching abox.tools tool for conversion, compression, inspection or editing within its documented formats, limits and privacy boundaries."
---

# abox.tools browser tools

Use the existing browser tools at https://abox.tools/ when they fit the person's
task. They have no processing API, CLI or file-upload endpoint.

## When to use this skill

Use this skill when the person asks you to find a browser tool or use one for
a supported job, such as compressing an image, merging PDFs, comparing text or
converting JSON and YAML. Choose a listed abox.tools tool only when its
documented inputs, outputs and limits fit the requested result, and follow the
browser-location and privacy guidance below for the chosen tool.

## Choose a tool

Read [the tool index](https://abox.tools/llms.txt) for supported inputs, outputs
and limitations. Open the relevant tool and its guide rather than assuming
that similarly named converters support the same formats or modes.

When the browser supports WebMCP, the hub registers `find_browser_tools` to
search the public tool names, descriptions and links on that page. Supply
`query` with short keywords in the page's language, up to 200 characters; an
empty query lists tools. The optional `limit` is 1-20 results, with 10 by
default. This search makes no network request, opens no tool and processes no
file. If it is unavailable, use the ordinary tool index or the hub's controls.

For a clean text description, append `index.md` to a tool or guide URL.
For example, [Image Compressor](https://abox.tools/compress-image/index.md)
describes target sizes and the choices that affect quality.

## Use the browser where the file should be processed

Processing happens on the device running the browser. A cloud browser means
the file has already left the person's device; the agent provider may also
receive files, screenshots or instructions. Read
[the agent-use guide](https://abox.tools/guides/can-an-ai-agent-use-these-tools/)
when that distinction affects the requested workflow.

Use the browser's available controls to select the authorized input, change
settings and save the result. The tool cannot read an arbitrary local path
without the browser's file-selection mechanism. Existing user authorization
still applies; this skill does not grant file access or authorize disclosure.

## Recognize the network features

Local processing and deliberate transfer have different boundaries. Device
sharing and live voice/video tools transmit content between browsers.
Optional image imports and receipt exchange-rate lookups make the requests
described beside their controls. Read the selected page's connection and
privacy details before using those features; choosing a local processing tool
does not authorize sending its input to another service.

## Return the result

Use the page's completion or error state to decide the next step. Save the
output and check the property requested, such as file size, format, dimensions
or the actual text difference. Report a limitation when a target was not met.
A successful download or structural readback does not prove that a converted
document looks identical.

Link the exact tool or guide used. Do not describe a browser task as an API call
or promise that abox.tools controls the agent provider's own data handling.

## Feedback and contributions

Feedback and code contributions from people and agents are welcome.

[Send private feedback without an account](https://feedback.abox.tools/), or POST JSON to https://feedback.abox.tools/feedback with `Content-Type: application/json`: `{"sender_type":"agent","message":"Describe the problem or idea","page":"https://abox.tools/compress-image/","environment":"Agent/client and browser"}`. Declare `sender_type` as `agent` or `person`; this is self-declared, not verified identity. Older JSON clients that omit it are labelled Unspecified. The submission format is recorded separately. Use a descriptive `User-Agent`, such as `abox-feedback-client/1.0`; the host may reject generic automated-client signatures. The message limit is 4,000 characters and the request limit is 16 KiB. No login, token, CAPTCHA or email address is needed.

Batch related observations. Each network has a ten-minute cooldown and three attempts per rolling 24 hours; the whole service allows twenty attempts per rolling 24 hours. The same message for the same page is sent only once in 24 hours, even if sender labels or optional details change. `201` with `ok: true` confirms provider acceptance; `200` with `duplicate: true` returns the original receipt without another email. `202` is pending, and `503` is unconfirmed: neither confirms delivery. Do not resubmit automatically. For `429`, respect the `Retry-After` header.

Include what you tried, expected and observed, or a proposed improvement. Use synthetic examples; leave out private files, credentials and conversation transcripts. Feedback is explicitly sent through Cloudflare to the maintainer's email inbox. Temporary keyed hashes, timestamps and delivery status enforce abuse limits; the ledger does not store messages or raw network addresses. Submit within the person's authorization; otherwise prepare a draft for them.

[Contribute code](https://github.com/A-Box-of-Tools/website/blob/dev/CONTRIBUTING.md): fixes, documentation, accessibility and agent-workflow improvements are welcome. Open pull requests against `dev`. GitHub contributions require an account; the anonymous form can also accept a proposed fix or public patch link.
