# The hooks

[← CLAUDE.md](../../CLAUDE.md)

One script, run by Claude Code before every shell command it is about to run,
that refuses two of them. It is wired up by `.claude/settings.json`; without
that entry this folder is inert.

## Why this exists at all

Every rule in this repository that is *enforced* has held. The build refuses a
tool with no README, an import that lands on nothing, a locale list longer than
English, a screenshot whose dimensions were typed by hand. None of those have
gone wrong twice.

Every rule that is only *written down* has drifted. `git add -A` is documented
as the thing never to do **because it was done**, and swept 3,816 generated
files into `main` (#61). The rule was already in the contributing notes when it
happened.

The difference is not how well the rules are written — the prose is the same
prose. It is that one kind is checked by something that does not get tired and
the other is checked by whoever is at the keyboard at 1am. So the two rules with
the worst cost-to-catch ratio are moved from the first kind to the second.

## What it refuses

**`git add -A`, `--all`, `.` and `:/`.** Narrow on purpose: staging explicit
paths is the documented practice, so `git add tools/trim-video/` passes
untouched. It reads each `git add` up to the next shell separator, so
`cd x && git add -A` is caught and an `-A` belonging to some other command on
the line is not blamed on the add.

**A run of a whole test suite** — `python -m unittest`, `node --test`,
`npm test`. CI runs both suites on every push and the build job needs them, so
nothing reaches `dist` past a failure; the Python suite costs the better part of
half an hour locally because most of its cases build the whole site first.

Reproducing one named case is the documented thing to do when CI reports a
failure, so `-k` and `--test-name-pattern` runs pass untouched. That is the
whole reason this is a script rather than a `deny` glob in `settings.json`: a
glob can refuse a command, but it cannot refuse one only when a flag is absent.

## What it deliberately does not refuse

**`og-image.ps1` without `-Only`.** It belongs here by every other measure, and
it is spelled too many ways to match honestly — `.\og-image.ps1`,
`./og-image.ps1`, `powershell -File og-image.ps1`, an absolute path. A guard
that catches three spellings in four is worse than none: it turns a rule
somebody was keeping by hand into one they believe is being kept for them.

**The LF rule.** `.gitattributes` already holds that line at the commit, and the
trap it warns about — Python's `write_text()` — is not a shell command and is
invisible from here.

**A stale `lastmod`.** Whether a change is one a visitor would see is a
judgement, and a guard that guessed would cry wolf on every refactor. It stays
prose, in CLAUDE.md, where a judgement belongs.

## If it gets in the way

It is one small script and it fails open: a payload it cannot read, or a call
with no command in it, is allowed straight through. Deciding whether a rule was
broken is its job, and "I could not tell" is not a reason to stop somebody
working.

To run a whole suite deliberately — which a person is welcome to do — run it in
a terminal rather than through the agent. To take either rule off, remove its
entry from `guard.py`; to take the lot off, drop the `hooks` block from
`.claude/settings.json`.

## Its cost

About 90ms per shell command, which is a Python interpreter starting. It runs on
every `Bash` call rather than on a filtered subset, and that is deliberate: the
permission-rule filter that would have narrowed it matches on a command's
prefix, and `cd somewhere && git add -A` does not start with `git add`. A filter
that missed the commonest way the line actually gets written would be the silent
failure this is meant to prevent.
