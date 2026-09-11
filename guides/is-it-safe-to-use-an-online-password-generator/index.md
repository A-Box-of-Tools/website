# Is it safe to use an online password generator?

Your suspicion is correct and worth keeping: a page that makes passwords is exactly the page that must not remember them. The good news is that this is checkable — randomness is made on your machine, sending is visible, and a generator can be caught keeping what it made.

Last updated 26 August 2026

## The short answer

The suspicion behind this question is exactly right, so keep it. A page that makes passwords is the one page on the web with nothing sensitive to receive and everything sensitive to *keep*: its output is the secret, and a generator that transmitted what it made would not be a weak tool but a password collection. The question is never whether a generator page looks trustworthy. It is whether it could keep the password if it wanted to — and that, unusually, you can check.

Three things decide it: where the randomness comes from, whether the result can leave the page, and whether anything about the result is predictable. All three have honest answers a visitor can verify, which is more than can be said for a downloaded app that generates in a window you cannot see into.

## Where browser randomness comes from

Every serious generator in a browser draws from one well: `crypto.getRandomValues`, the browser's cryptographic random number generator, seeded and continuously reseeded by the operating system from hardware noise. It is the same source the browser draws on for TLS keys — the encryption your bank connection runs on. There is no meaningful sense in which a desktop program has access to better randomness than a web page; both end at the same operating system well.

What a page must *not* use is `Math.random()`, the general-purpose roll-a-dice function. Browsers implement it with a fast generator whose internal state can be reconstructed from a handful of consecutive outputs — meaning passwords built on it look random and are computable by anyone who has seen one of them. This is not theoretical; it has been demonstrated against shipped generators more than once. It is also invisible from the outside, which is the strongest argument for generators whose code can be read: the difference between the two functions is one word in the source.

There is a subtler grade of care past that. Turning random 32-bit words into “a number below 26” with a simple remainder is very slightly biased toward the low letters; a careful generator redraws instead of taking the remainder. The [generator here](https://abox.tools/password-generator/) does — the bias it avoids is about one part in 165 million, which is invisible in use and exactly the kind of thing that separates a tool built for the job from a code snippet pasted off a forum.

## What a bad generator page could do

Name the failure modes plainly, because each one is checkable:

- **Send the password out.** The page generates locally, then posts what it made — with the click, with analytics, or batched later. This is the disqualifying one, and it is visible: it has to be a network request, and requests can be watched.
- **Generate on the server.** The password arrives over the network instead of leaving over it — so the operator saw it first, and you learn nothing about how it was made. Same check, other direction.
- **Generate weakly.** `Math.random`, a timestamp seed, a wordlist of a few hundred entries presented as strong. No network tab catches this one; only readable source does, or an honest strength readout counted from the actual settings.
- **Keep a history.** Helpfully remembering your last twenty passwords — in storage that outlives the tab, on a machine that might be shared.

The [Password & Passphrase Generator](https://abox.tools/password-generator/) on this site is built against all four by construction: `crypto.getRandomValues` and nothing else, generation in the page, no storage of any kind, no history, and a strength line that reports exactly how many results were possible with your settings. The wordlists for passphrases are the EFF diceware lists, shipped in the tool's own folder, unchanged.

## How to check any generator, including this one

The full method is written up in [the guide on uploading](https://abox.tools/guides/is-it-safe-to-upload-files/), and this is the page to apply it to before any other:

- **Pull the plug first.** Load the page, go offline, *then* generate. A password made with no connection cannot have been fetched and cannot have been sent at the moment it was made. This page keeps working offline; that is the point of it.
- **Watch the Network tab while you generate.** Press the button and watch the list: nothing should leave. Then copy the password, and watch again — the copy is the moment a dishonest page would choose.
- **Look for what a collection would need.** An account, a sync feature, a “recently generated” list. A generator with a memory has a copy.

One honest caveat belongs at the end. A check tells you what the page did while you watched; code that is published and served readable — as everything on this site is — tells you what it does in general. That still leaves the machine itself: no web page can protect a password from a compromised browser or keylogging malware, and a generator is no exception. What the checks buy you is smaller and real — a password no server ever saw, made by arithmetic you were allowed to read.
