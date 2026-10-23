---
name: {{ agent_frontmatter.name }}
description: {{ agent_frontmatter.description }}
---

# abox.tools browser tools

Use the existing browser tools at {{ site.domain }} when they fit the person's
task. They have no processing API, CLI or file-upload endpoint.

## Choose a tool

Read [the tool index]({{ site.domain }}llms.txt) for supported inputs, outputs
and limitations. Open the relevant tool and its guide rather than assuming
that similarly named converters support the same formats or modes.

When the browser supports WebMCP, the hub registers `find_browser_tools` to
search the public tool names, descriptions and links on that page. Supply
`query` with short keywords in the page's language, up to 200 characters; an
empty query lists tools. The optional `limit` is 1-20 results, with 10 by
default. This search makes no network request, opens no tool and processes no
file. If it is unavailable, use the ordinary tool index or the hub's controls.

For a clean text description, append `index.md` to a tool or guide URL.
For example, [Image Compressor]({{ site.domain }}compress-image/index.md)
describes target sizes and the choices that affect quality.

## Use the browser where the file should be processed

Processing happens on the device running the browser. A cloud browser means
the file has already left the person's device; the agent provider may also
receive files, screenshots or instructions. Read
[the agent-use guide]({{ site.domain }}guides/can-an-ai-agent-use-these-tools/)
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
