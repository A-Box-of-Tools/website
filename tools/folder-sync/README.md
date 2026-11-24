# Folder Sync

Keeps a folder the same on two devices. Each device chooses a folder, one
starts a sync and approves the other, the two compare their folders, and the
visitor decides what moves before anything does. Files cross an encrypted
WebRTC connection made directly between the two browsers.

## What crosses, and when

Nothing about either folder is sent before the host approves the joining
device. Pairing follows [Share a Browser Tab](../share-tab/README.md): an
encrypted control channel first, then the guest's request with an optional
note, the host's approval, and the guest's acknowledgement. Only then does
each side send `folder` (its name, mode and totals) and its listing.

A listing is one `[path, size, modified]` row per file, sent in parts of at
most 32 KiB of UTF-8 so a frame stays well under the data channel's message
cap whatever script the names are in. The other side sees every row,
including files that will never be copied; the page says so.

When both sides hold a path at one size under two dates, neither listing can
say whether the bytes differ. Each side asks the other for a fingerprint of
those files and computes its own. `src/fingerprint.js` digests eight-megabyte
blocks with `crypto.subtle` and digests the block digests together with the
length, because `crypto.subtle` has no streaming form and a video should not
have to fit in memory to be compared. Only fingerprints cross.

Files cross only when someone presses Sync now, and only those in the plan.

## The plan, and why nothing is deleted

`src/plan.js` turns two listings into rows: only here, only there, newer
here, newer there, different with the same date, or a name that differs from
another only in case. The newer copy replaces the older by default; the same
date with different contents, and any case clash, default to leaving both
alone. Every row can be changed before syncing.

There is no deletion, on purpose. Without a record of the last sync there is
no way to tell a file deleted on one device from a file created on the
other, and getting that wrong destroys work. A record would be persistent
state about somebody's file names, kept in their browser, and that is a
separate decision from this tool's first version.

Case clashes are refused rather than resolved. README.md here and Readme.md
there are two names on Linux and one file on Windows or a Mac, so copying
either could overwrite the other. Two names on one side that fold to the
same name are treated the same way.

Either side may press Sync now. The plan travels with the request as
`[path, destination]` rows, and the receiving side checks every row against
its own listing and its own mode with `acceptActions()`. A device set to Send
only refuses any row that would write into it, whatever the other side
decided; one row it would not have allowed refuses the whole run. If both
press at once, the host's run goes first and the guest's is refused as busy.

## Moving the bytes

`src/transfer.js` runs one lane per run and direction, a data channel named
`folder-sync-files:<run>` opened by the side that has the files. A frame
still in flight from a cancelled run dies with its lane rather than landing
in the next run's file.

The receiving side pulls. It asks for four files ahead so that small files do
not each wait a round trip, and the sending side serves them in order. A data
channel's backpressure only watches the sender's buffer, not the receiver's
disk, so the receiver also acknowledges the bytes it has written and the
sender never runs more than 8 MiB ahead. That keeps the receiving page's
memory flat for a file of any size. A minute without one frame from the
other side is a stall and ends the run.

Chunks are 64 KiB on the wire, but every write is a round trip to the
browser process, so the receiver gathers sixteen of them into one 1 MiB
write. On one machine that took a 160 MB file from about 15 MB/s to about
25 MB/s; on a real network the network is usually the slower part.

The sending side checks each file's size and date again just before sending
it. A file changed since the comparison is skipped as changed rather than
sent as something the other side did not agree to. Chromium also refuses to
read a `File` whose file changed underneath it, and that ends the file as
unreadable.

## Writing whole files

`src/folder.js` writes through `createWritable()`, which writes to a sibling
`.crswap` file and moves it over the original only when the stream closes.
A cancelled or broken transfer therefore leaves the old file exactly as it
was. A file or folder that did not exist before an interrupted write is
removed again, so a cancelled sync leaves no empty files behind. A `.crswap`
found while reading a folder is a write caught half-way and is never synced.

A web page cannot set a file's modification date, so every received file is
dated when it was written. The next comparison would see the copies as same
size, different date, and fingerprint them again. To avoid re-reading a
whole folder after each sync, the receiver reports each written file's new
date back on the lane (`stored`), and both sides remember the pair of
entries as equal for as long as the link lasts. Equal fingerprints are
remembered the same way. None of this is saved; a new session fingerprints
again.

## Which names are synced

`src/paths.js` holds every synced path to the strictest of Windows, macOS and
Linux: no control characters, no `\ / : * ? " < > |`, no trailing dot or
space, no reserved device name such as `NUL.txt`, at most 255 characters a
name, 1024 a path and 32 levels deep. Paths are composed to NFC, so a
decomposed name from a Mac matches the same name from Windows. Operating
system litter (`.DS_Store`, `Thumbs.db`, `desktop.ini`, AppleDouble files,
recycle bins), Chromium's `.crswap` files and Office and LibreOffice lock
files are left out. Everything left out is counted and listed beside the
folder, so nothing disappears silently.

A peer's listing is held to the same rules in `src/listing.js`. One row that
breaks them refuses the listing and ends the link: an honest page never sends
one, because its own walk left those names out.

## Browsers

| Browser | Folder | Receives into |
|---|---|---|
| Chromium on a computer | `showDirectoryPicker`, readable again later | the folder, with the visitor's permission |
| Firefox, Safari | `<input webkitdirectory>`, a read-only snapshot | a ZIP |
| No folder support | none; Receive only | a ZIP |

Write permission is asked for inside the click that picks the folder, when
the chosen mode receives, so that a sync started from the other device can
write without a prompt nobody is there to answer. If it is missing when the
other device asks, this side refuses the run with `permission` and says so.
A ZIP is held in memory and capped at 512 MB and 20,000 files.

## Direct only

There is no Cloud relay, unlike the other five Connect Devices tools. A relay
forwards a little text or a stream of video through a metered service; this
one would forward whole folders, and whether that is worth paying for is not
a decision for a first version to make on the site's behalf. Direct uses no
STUN or TURN and accepts host candidates only, in both directions and inside
SDP, through `peer-transport.js`. The devices must reach each other on a
shared network.

The room namespace is `folder-sync`, which the rendezvous must list in its
tool allowlist; an older Worker refuses the tool with 400 before a socket
opens. Discovery, private groups, host claims and approval receipts are the
shared parts described in [the pairing guide](../../docs/paired-tools.md).

## Limits, deliberate

50,000 files a folder, one partner at a time with up to four waiting, 500
plan rows drawn on the page (the rest keep their defaults), and a 512 MB ZIP.
