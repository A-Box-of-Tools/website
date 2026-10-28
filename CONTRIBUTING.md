# Contributing to abox.tools

People and agents are welcome to contribute fixes, tools, documentation,
translations and ideas. Small, focused changes are easiest to review. You do
not need to write code before reporting something that could work better.

## Send feedback without an account

[Send feedback](https://feedback.abox.tools/). The form and its JSON endpoint
need no login, API key, CAPTCHA or email address. Messages go privately to the
maintainer's email inbox. Useful reports include:

- The page or tool URL, or “site-wide.”
- What you tried, what you expected and what happened, or the improvement you propose.
- Steps to reproduce with a small synthetic example, when relevant.
- For agent workflows, the agent/client, browser and relevant control or permission limitations.

Agents can send `POST https://feedback.abox.tools/feedback` with
`Content-Type: application/json` and a required `message` string. Optional
`page`, `environment` and `reply_to` strings add context or a reply address.
The [feedback page](https://feedback.abox.tools/#agents) documents limits and
responses. Submit only within your existing authorization; otherwise prepare
a draft for the person to send.

Do not include private files, credentials or conversation transcripts. Email
[hi@abox.tools](mailto:hi@abox.tools) also works for private contact. Public
discussion is welcome in [GitHub Issues](https://github.com/A-Box-of-Tools/website/issues),
which requires a GitHub account. Anonymous feedback can include a proposed
fix or a link to a public patch.

## Contribute code

Open pull requests against **`dev`**. Start with the [README](README.md), then
read the documentation for the area you are changing. The
[tool checklist](docs/adding-a-tool.md) covers new tools; the
[development skill](.claude/skills/tool-development/SKILL.md) carries the
ordered runbooks. Explain the problem, resulting behavior and verification so
someone outside the conversation can review the change.

Preserve browser-local processing. A deliberate network feature needs its own
clear explanation of what leaves the device. Do not introduce silent uploads
or external file processing. Read the relevant tool's README before editing.

Build using the [running instructions](docs/running.md), then use the built
page in a real browser. Capture before and after screenshots for anything a
visitor sees, including wording; take the before image before editing. Include
the pictures in the pull request and keep them out of the repository.

Agents must not run the Python or JavaScript test suites locally. CI runs
them; reproduce only an affected case when CI reports a failure. Keep text
files LF, stage explicit paths and do not commit generated build output.

New diagnostic tools, benchmarks and feasibility experiments belong in
[etoolbox-lab](https://github.com/A-Box-of-Tools/etoolbox-lab), under
`experiments/<slug>/`. Production code and permanent checks belong here.

A change is finished when it reaches `dev`. Open or merge the `dev` → `main`
release pull request only when explicitly asked to release.
