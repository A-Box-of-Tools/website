# Password & Passphrase Generator

Makes a random password out of characters, or a diceware passphrase out of a
wordlist that ships in this folder, and says exactly how strong the result is.
Everything happens in the page. There is no network step, and there is no
storage step either.

This is the first tool here whose **output** is the secret. Everywhere else on
the site the promise protects a file you already had; here the thing being
protected did not exist until this page made it, which sharpens the claim
rather than changing it. A generator that transmitted its output would not be a
weak tool — it would be a password collection.

---

## The pieces

| File | What it is |
|---|---|
| `src/random.js` | the only source of randomness, and the rejection that keeps it uniform |
| `src/wordlist.js` | the two EFF diceware lists, bundled unchanged |
| `src/generate.js` | settings in, string out |
| `src/strength.js` | how many results were possible, counted exactly |
| `src/main.js` | the interface |

`tests/js/password.test.js` covers all four of the first ones.

---

## Where the randomness comes from, and where it does not

`crypto.getRandomValues`, and nothing else. It is the browser's cryptographic
generator, seeded and reseeded by the operating system, and it is the same
source the browser draws TLS key material from.

`Math.random` appears nowhere in this folder and must not be added. Browsers
implement it with xorshift128+, whose internal state can be reconstructed from
a handful of consecutive outputs; a password generator built on it produces
passwords that look random and are computable by anybody who has seen one of
them. That is not a theoretical objection — it has been demonstrated against
shipped generators more than once.

### Why the modulo is not simply taken

`getRandomValues` fills 32-bit words. Turning one into a number below `bound`
with `value % bound` is biased whenever `bound` does not divide 2³², which is
almost always: the first `2³² mod bound` values come up one time in 2³² more
often than the rest. Over a 26-letter alphabet that is a bias of about one part
in 165 million.

It is a tiny effect and it is a real reduction in strength, and avoiding it
costs a loop. `randomInt` computes the largest multiple of `bound` that fits in
32 bits and draws again for anything at or above it. For every alphabet this
tool can build, the loop ends on the first try more than 99.999% of the time.

The unit test for this cannot be statistical — no amount of sampling finds a
bias of one in 165 million. It replaces `crypto.getRandomValues` with a script
whose first value is the one that has to be rejected, and asserts the second
one came back.

---

## "At least one of each" is done by rejection, not by patching

The common implementation generates freely and then overwrites a random
position with a digit to satisfy the rule. That biases the result: the
character that was overwritten is gone from the distribution, and an attacker
who knows the tool knows that one position in every password is drawn from ten
values rather than ninety-four.

This throws the whole candidate away and draws another, which leaves every
remaining password exactly as likely as every other. The cost is a loop, and
the loop has a thousand-attempt ceiling — not because anybody reaches it (the
worst case this page can be set to succeeds about one time in twenty) but so
that a future setting which makes the rule impossible fails loudly rather than
hanging the tab.

---

## The strength number is counted, not scored

A meter on a sign-up form reads the finished string and guesses how it was
made, because guessing is the only thing available to it. This page did the
choosing, so it can count instead: the alphabet it drew from, the number of
independent draws, and nothing else.

Two consequences worth stating out loud, because they are the whole reason the
number is trustworthy:

* **The rules that cost strength are subtracted.** "At least one of each" makes
  the set of possible passwords smaller. `passwordSpace` counts that smaller
  set exactly, by inclusion–exclusion over the character classes, rather than
  quoting the flattering `N^length`.
* **The decorations that add nothing are counted as nothing.** Capitalising
  every word and joining with a hyphen are rules an attacker reads off this
  page, so they multiply the count by one. A random digit *between* the words is
  a real choice and is counted.

The counting is in `BigInt`. 95¹²⁸ and 7776¹² do not fit in a double, and
inclusion–exclusion subtracts enormous numbers from each other, which is
exactly where a floating-point approximation stops being harmless. The exact
integer is converted to a bit count once, at the end, by taking the exponent
from the bit length and the fraction from the top 53 bits.

`tests/js/password.test.js` checks the formula against brute force — every
string of the given length actually enumerated and counted — for alphabets
small enough to enumerate. A wrong sign in the inclusion–exclusion cannot agree
with that.

### The crack-time estimate, and why it is a phrase

It assumes an offline attack at 10¹¹ guesses a second against a fast hash,
which is roughly a rack of consumer graphics cards against the SHA-256 or MD5
that keeps turning up in breach dumps. Against a password hash chosen properly
— bcrypt, Argon2 — the same hardware manages a few thousand a second and every
answer moves up by about 25 bits.

It is quoted as one of eight phrases rather than as a number, and that is not a
shortcut. "18 billion years" carries an air of measurement that a guess about
hardware in ten years' time cannot support. The bucket is honest about being a
category.

The rate is deliberately the pessimistic end, and the estimate uses half the
search space, because the average attack succeeds halfway through. Both are
choices in the direction that flatters this page least, which is the direction
to make them in.

---

## The wordlist

`src/wordlist.js` holds the Electronic Frontier Foundation's two diceware
lists, unchanged: 7,776 words (six dice throws, 12.925 bits each) and 1,296
(four throws, 10.340 bits each).

They are not generated here and should not be regenerated here. Assembling a
good list is the hard half of a passphrase tool: it means removing homophones
and confusable spellings, removing anything offensive in any language a reader
might speak, keeping every word long enough to hear correctly, and — for the
short list — making sure no word is the beginning of another, which is what
lets a phrase from it be typed with autocomplete or split back into words with
no separator. The EFF lists were built against exactly those failures by people
who went looking for them.

That the list is public is not a weakness to apologise for. It is the
assumption the arithmetic is done under: the strength quoted is the number of
words drawn, with the attacker assumed to hold the list, to be reading this
page's source, and to know every setting used. Nothing is claimed for obscurity,
because obscurity here would evaporate on first inspection.

**Licence.** The wordlists are © Electronic Frontier Foundation, published at
<https://www.eff.org/dice> and used under
[CC BY 3.0 US](https://creativecommons.org/licenses/by/3.0/us/). They are the
one thing in this folder that is not MIT, and the header of `src/wordlist.js`
says so beside them. See the repository [`LICENSE`](../../LICENSE).

Four words on the long list carry a hyphen of their own — `drop-down`,
`felt-tip`, `t-shirt`, `yo-yo` — which is worth knowing before writing a test
that splits a hyphen-joined phrase back into words. It works about 399 times
out of 400.

---

## Nothing is stored

There is no history, no "recently generated" list, no localStorage, no
sessionStorage, no cookie, no URL parameter, and no `<input>` the browser will
offer to remember. What is on screen lives in one array in `main.js` and dies
with the document.

That is a feature request that will keep arriving and should keep being
refused. A generator that can show you last Tuesday's password is a generator
that stored it, and stored somewhere you can reach is stored somewhere else can.

---

## Why the words on the page are in `body.html`

The strength readout can say thirteen different things — five verdicts, eight
crack-time phrases — and all thirteen are `data-` attributes on the
`#strength` element in `body.html`, read once at boot.

`body.html` is translated for every language the site is served in;
`src/*.js` is not (see the repository README, "The strings still in the
JavaScript"). Putting the vocabulary in the markup is what makes the loudest
dynamic text on the page arrive in the reader's own language. Everything else
`main.js` writes is a number, a character or a word from the list, which needs
no translating.

---

## The feedback panel is hooked to Copy, not to the download

`shared/feedback.js` asks "did this do the job?" once, after a download, and
watches for `a[download][href]`, `button[id^="download"]` or `[data-download]`.
On every other tool those are the same thing. Here they are not: the batch text
file is the rare case, and what almost everybody does with the result is copy
it. So the Copy button carries `data-download`, which is exactly what that third
selector is for. Without it the panel would only ever be shown to the small
fraction of visitors who asked for a hundred at once.

---

## What this deliberately does not do

* **No password strength checker for a password you type.** It would mean
  either scoring the string, which is the thing this page argues against, or
  asking you to type an existing password into a web page, which is the thing
  this whole site argues against. The two objections are independent and each
  is enough on its own.
* **No "pronounceable" passwords.** They are generated by a grammar, the
  grammar is far smaller than the alphabet it draws on, and the entropy is
  therefore much lower than the length suggests — which is precisely the kind
  of gap between appearance and strength this tool exists to close. A
  passphrase is the honest answer to the same wish.
* **No PIN mode.** A four-digit PIN is 13 bits. There is nothing to generate
  that a die could not do better, and a page that offered it would be lending
  the word "strong" to something that is not.
* **No password manager.** Storing them is a different product with a different
  threat model, and doing it badly in a browser tab would undo everything this
  page is for.
