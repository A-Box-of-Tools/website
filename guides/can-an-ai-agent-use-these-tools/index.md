# Can an AI agent use these tools?

Yes. They are ordinary web pages, with no accounts, no captchas and every control labelled, and an agent drives them the way it drives anything else. The question worth a page is the one behind it: when you hand a file chore to an agent, where does the file go? The answer turns entirely on where the agent's browser is running.

Last updated 6 September 2026

## The short answer

Yes. Every tool here is an ordinary web page: a file picker, some labelled controls, a download button. There is no account to sign into, no captcha to solve, no step that needs a human in particular. An AI agent with a browser drives these pages the way it drives any other — and several things this site already does for people turn out to serve agents for free, which the last section lists.

But “can it press the buttons” is the small question. The one worth a page is what happens to the site's promise — *your file never leaves your machine* — when the machine pressing the buttons is not you. The answer is that the promise survives delegation perfectly, or not at all, depending on one thing: **where the agent's browser is running.**

## Two kinds of agent, one distinction

Agents that use tools come in two shapes, and the difference between them matters more than anything else on this page.

**A local agent** runs on your machine: an assistant installed on your computer, or one steering the browser you are looking at. When an agent like that opens a tool here and hands it your file, the work happens where the work always happens with these pages — in a browser, on your hardware. The file is read from your disk, processed in your browser's memory, and written back to your disk. Nothing about the delegation changed the path the bytes take. An AI chose the settings; the file still never left.

**A cloud agent** runs a browser on its vendor's computer. You attach a file to a chat, the agent works in a virtual machine somewhere else, and whatever it does with these tools happens there. The tools still behave exactly as promised — the file goes no further than the browser it is in — but that browser is not yours, and the upload already happened at the moment you attached the file, before any tool was opened. No page can undo an upload that preceded it.

So the question this site keeps asking — does this job need my file to leave at all? — does not disappear when an agent does the job. It just moves one step earlier, to the choice of agent. A local agent driving a browser-only tool is the rare arrangement where delegation costs no privacy at all: the AI does the work, and the file stays home.

## How to hand a job to an agent

Agents do best with the same brief a colleague would want: the tool, the file, and what done looks like. Some patterns that work:

- **Name the outcome, not just the tool.** “Open abox.tools/compress-image/ and get this photo under 200 KB” gives the agent the number the page will ask for. The [image compressor](https://abox.tools/compress-image/) takes a target size by name, which is exactly the kind of instruction an agent can carry faithfully.
- **Point it at the map.** This site publishes [llms.txt](https://abox.tools/llms.txt) — every tool and guide, with a one-line description each, as plain text in a single fetch. An agent that reads it knows what exists here without crawling anything. And every page has a twin at its own address with `index.md` on the end: the page as Markdown, without the interface around it, for an agent that wants what a tool page says rather than what it looks like.
- **Let it read the page it is on.** Every tool carries its questions and answers in the page itself, and every tool has a guide a link away. An agent that seems unsure of a setting can be told to read the guide first, the same advice a person would get.
- **Chains work.** The jobs this site's workflow guides describe for people — scan, then combine into a [PDF](https://abox.tools/images-to-pdf/); strip [EXIF](https://abox.tools/exif-editor/), then resize — are the jobs agents are best at, because each step's output is the next step's input and nothing in between needs judgement.

## What not to delegate

An agent can drive every tool here. There are two places where driving is not the whole job, and the remainder should stay with you.

**Deciding what must not be seen.** The redaction tools delete what you cover — but choosing what to cover is the job, and an agent that misses one line has produced a file that looks finished and is not. Let an agent operate a redactor if you like; look at the result yourself before it goes anywhere, the same rule those tools' own guides give a human operator.

**Opening what was read.** This site's QR reader refuses to open what it decodes, because reading and following are different acts. The same separation is worth imposing on an agent: an agent that reads a code, a link or an address in a file should report it, not visit it. And an agent steering your own browser is holding whatever that browser is signed into — a reason to give it the same squint you give any tool, which is the next section.

## An agent can check the promise too

The four checks the [upload guide](https://abox.tools/guides/is-it-safe-to-upload-files/) teaches — pull the plug, watch the Network tab, read the Content-Security-Policy, read the code — are all things an agent can run, and they are actually easier for an agent than for a person: reading a CSP header or searching served source for `fetch` calls is mechanical work. If you use an agent to vet tools before trusting them, this site expects to be vetted the same way, and the offline behaviour the checks rely on has [a page of its own](https://abox.tools/guides/how-can-a-web-page-work-offline/).

What this site does for an agent, it does on purpose and for everyone: every control is labelled, because screen readers need names and an agent reads the same names; the pages carry no accounts, no popups and no consent walls to steer around; the source is public and served without a build step, so the code an agent audits is the code that runs; and [llms.txt](https://abox.tools/llms.txt) is the whole box in one fetch. None of that was added for machines. A page that is legible to a person with a screen reader turns out to be legible to everything else as well.

One honest limit: this page is about agents using these tools, not about the agents themselves. What an agent's own vendor sees — your instructions, your screenshots, sometimes your files — is a separate question, and the habit this whole group of guides keeps arriving at is the right lens for it too: ask what actually needs to leave your machine, and in what state.
