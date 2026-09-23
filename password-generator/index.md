# Password & passphrase — a strong random one, made in your browser

Made here, by your own browser, and never sent anywhere. Nothing is stored and there is no history.

> Make a strong random password, or a diceware passphrase from a bundled 7,776-word list. Drawn by your browser's own cryptographic generator, never sent anywhere, never stored. Free, no sign-up.

This page is an interactive tool that runs entirely in your browser, at https://abox.tools/password-generator/ — nothing you give it is uploaded. What follows is everything the page says about the tool in words; to use it, open the address.

## Your passwords and passphrases are **never uploaded**. There is no server.

Every character comes from `crypto.getRandomValues`, the browser's own cryptographic generator, and every word from a list that ships in this folder as `src/wordlist.js`. There is no `fetch`, no `XMLHttpRequest` and no `sendBeacon` anywhere in `src/`, so there is no code path by which a password made here could reach us or anybody else — and nothing is written to storage either, so reloading this page destroys every password it has ever shown you.

- ✗ No upload
- ✗ No account
- ✗ Nothing stored
- ✓ Works offline
- ✓ Open source

## How to make a strong password without a website seeing it

1. **Choose a password or a passphrase.** A password is a run of random characters: short to store, awkward to type, and exactly right for the hundreds of accounts your password manager fills in for you. A passphrase is words drawn at random from a list: longer, but rememberable and sayable, which is what you need for the few secrets you have to type from memory — the password manager's own, your laptop's, your phone's recovery code.
2. **Set the length, or the number of words.** This is the setting that matters and the others mostly are not. Twenty characters, or six words, is a sensible floor for anything worth protecting; go up from there for the account that would let somebody reset all the others. The reading underneath moves as you drag, so you can see what each extra character buys.
3. **Turn on the rules the form is going to insist on.** “At least one of each”, a digit on the end, a symbol from the short list every site accepts. None of these makes anything stronger — the first one makes it very slightly weaker, and the page has already subtracted that — but they are how you get past a sign-up form without generating six in a row.
4. **Read the number, not the colour.** The bits are counted from the settings that produced the string: the size of the alphabet, the number of draws, and nothing else. That is a real measurement, unlike the meter on a sign-up page, which can only score the characters in front of it and has no way of knowing whether you chose them or a generator did.
5. **Copy it, and put it somewhere, before you leave.** There is no history here and no way to ask for it back; reloading the page destroys it. Paste it into the password manager first and into the sign-up form second, so that the one that has to remember it has it before anything can go wrong.
6. **Take a batch if you need one.** The slider at the bottom makes up to a hundred at once and will save them as a plain text file, written by this page from what is already on your screen. Useful for seeding accounts or handing out starter credentials, and worth deleting the moment they are somewhere better: a file full of passwords on your disk is still a file full of passwords.

## Also in the box

- [JSON Formatter](https://abox.tools/json-formatter/): JSON, XML, HTML, CSS and YAML, formatted or converted. Nothing is pasted into anyone else's server.
- [YAML to JSON Converter](https://abox.tools/yaml-to-json/): Both directions, and it says what each one costs. Nothing is pasted into anyone else's server.
- [XML Formatter](https://abox.tools/xml-formatter/): XML laid out to read or squeezed to ship, and converted to JSON both ways. Nothing is pasted into anyone else's server.
- [Text Diff](https://abox.tools/text-diff/): Two texts in, every difference marked, line by line and word by word. Nothing is pasted into anyone else's server.

## Questions

### Are the passwords sent anywhere, or stored?

Neither. They are made in your browser, on your own hardware, and this tool has no network feature of any kind — it never fetches anything and never sends anything. Nothing is written to storage either: no localStorage, no cookie, no history. Reload the page and every password it has shown you is gone, from the screen and from its own memory. The page's `Content-Security-Policy` names every address it may contact and none of them is ours, so there is nowhere for a password to be collected even if something tried.

### Where does the randomness come from?

`crypto.getRandomValues`, the generator browsers provide for cryptographic use, seeded and reseeded by your operating system's own entropy pool. It is the same source a browser uses for TLS key material. `Math.random` is not used anywhere in this tool, and that distinction is not pedantry: `Math.random` is a fast arithmetic generator whose entire internal state can be reconstructed from a few consecutive outputs, so a password generator built on it produces passwords that look random and can be enumerated by anybody who has seen one of them.

### Is a password made in a browser as good as one from a desktop program?

For the randomness, yes — it is the same operating-system source either way, reached through a different door. What differs is what else is in the room. A browser tab runs alongside your extensions, and an extension with permission to read pages can read this one. That is true of every web-based generator including this one, and it is the honest reason to use your password manager's built-in generator when you have one: it is the same arithmetic, in a process with less standing beside it. This page is for when you do not have one to hand.

### Password or passphrase — which should I actually use?

A password for everything a password manager types for you, because you will never look at it and length is free. A passphrase for the few things you have to type from memory or read aloud: the password manager's master password, a disk encryption key, a device you set up by remote control. Six words from the long list is 77 bits, which is stronger than a twelve-character random password and enormously easier to get right at four in the morning.

### How long should a password be?

Twenty characters over the full alphabet is about 130 bits and is past the point where length stops being the thing to worry about. Sixteen is fine. Twelve is the floor for anything you would mind losing, and it is the floor rather than the target. Below that you are relying on the site having stored it properly, which is a bet the last twenty years of breach notifications suggest you should not take. Length beats every other setting on the page; adding one character is worth more than any rule about which characters have to appear.

### How many words should a passphrase have?

Six from the long list, and seven if it guards other passwords. The famous four-word picture was drawn in 2011, is 51 bits, and is within reach of a serious offline attack today. Five is 64. Six is 77, which is past anything an attacker will spend on one ordinary account. Every extra word from the long list adds 12.9 bits, and the words are the only part that adds anything — the hyphens and the capitals do not.

### What is a “bit”, and why does this page count them?

A bit is a doubling. Sixty bits means there were 2^60 equally likely results this page could have produced, so an attacker who knows exactly how it works still has that many to try. It is a property of the *process*, not of the string: the page can quote it exactly because it is the thing that did the choosing and knows how many choices it made. That is the difference between this and the coloured bar on a sign-up form, which reads the characters and guesses. On that bar, `correct horse battery staple` scores badly and is worth 44 bits, and `P@ssw0rd!` scores well and is worth almost nothing.

### Why does “must contain a symbol” make a password weaker?

Because a rule can only ever remove possibilities. Requiring at least one character from every set rules out every password that happened not to have one, and a smaller set of possible passwords is a smaller number to search. The effect is small — about half a bit at a typical length — and it is real, and this page subtracts it rather than quoting the flattering figure. It is worked out exactly, by counting the passwords the rule actually allows rather than the ones it does not.

### Which wordlist is this, and does it matter that an attacker can download it?

It is the Electronic Frontier Foundation's diceware lists, bundled unchanged: 7,776 words for the long one and 1,296 for the short. They were built for exactly this — nothing offensive, no homophones, no pairs that run together into a third word, and in the short list no word that is the beginning of another. And no, it does not matter that the list is public: the strength quoted here assumes an attacker has it, is looking at this page's source, and knows every setting you used. The only thing they do not know is which of the 7,776 came up each time. That assumption is what makes the number trustworthy.

### Is a passphrase not just a dictionary attack waiting to happen?

Not when the words are chosen this way. A dictionary attack works against phrases *people* pick, because people pick words that go together, in an order that makes sense, out of the few thousand they use every day. This page picks each word independently, uniformly, from a fixed list, with no regard for whether the result reads well — which is why it usually does not. An attacker who knows the list and the length still faces 7,776 to the power of the number of words.

### Can I get a password back after I have left the page?

No, and that is deliberate. Nothing is written down anywhere, so there is nothing to recover: no history panel, no “recently generated” list, no cache. A generator that could show you last Tuesday's password would be a generator that had stored it, and stored where you could reach it means stored where something else could. Copy it into a password manager before you navigate away.

### Is copying it to the clipboard safe?

It is the ordinary risk, and it is worth knowing rather than worrying about. The clipboard is shared with everything else running as you, it usually survives until the next copy, and on some setups it syncs between devices. That is a good reason to paste it where it belongs immediately and copy something else afterwards, and not a reason to type a weaker password by hand instead. This page cannot read your clipboard; it can only write to it, and only when you press the button.

### Should I use the same one in more than one place?

No, and it is the one piece of advice on this page that outranks everything else on it. Almost every account taken over is taken over with a password that was correct somewhere else first: a site is breached, the list is published, and the same address and password are tried everywhere. A unique password per site turns a breach into one account instead of all of them, and it is the reason to keep a password manager — not the strength of any individual password it holds.

### Is it free, and do I need an account?

It is free, there is no account, no sign-in, no trial, and no limit on how many you generate. The site carries advertising, which is what pays for it; the ads are not given anything at all about what this page makes, including how long it was or how strong.

### Does it work offline?

Yes. Load the page once, then disconnect from the internet, and it keeps making passwords. The randomness comes from your own machine and the wordlist is already in the page. That is also the simplest way to prove nothing is being fetched or sent: a generator that asked a server for its numbers would stop the moment you unplugged.

## How the privacy claim is verifiable

- **The password is made where you are reading this.** It is drawn in this page, by this page, out of the randomness your own operating system hands the browser. Nothing is requested to produce it and nothing is reported once it exists. The `Content-Security-Policy` names every address this page may contact, and not one of them belongs to this site: there is no endpoint here that a generated password could be collected at, and nothing in the code that would send it if there were.
- **Nothing here fetches anything.** There is no `fetch`, no `XMLHttpRequest` and no `sendBeacon` anywhere in `src/`. The wordlist is not downloaded; it is `src/wordlist.js`, served from this origin with the rest of the page, and you can read it.
- **The randomness is the browser's, and it is the right kind.** `crypto.getRandomValues` is the generator browsers provide for keys and tokens, seeded and reseeded by the operating system. `Math.random` appears nowhere in this folder, and it would be a real flaw if it did: its internal state can be recovered from a handful of outputs, which makes every password it will ever produce computable by anybody who has seen one of them.
- **Nothing is stored, so there is no history to clear.** No localStorage, no sessionStorage, no cookie, no URL parameter and no `<input>` the browser will offer to remember. What is on screen exists in one array in this page's memory, and closing the tab is the whole of the cleanup. The only copies of anything made here are the ones you take away.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google, and the donate button from Buy Me a Coffee. None of them is handed a character of what this page makes, or its length, or its strength, or which settings produced it. Every line that draws a character or a word is served from this origin and listed in the repository.
- **It works offline.** Disconnect from the network and the tool is unchanged, because there was never a network step in it. That is the simplest proof of all: a generator that asked a server for its randomness would stop the moment you unplugged.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, `src/random.js` for the forty lines that stand between this page and every password it makes — it has exactly one input, and that input is the browser's own generator — `src/generate.js` for how the settings turn into a string, and `src/strength.js` for the arithmetic behind the number, which counts rather than guesses.
