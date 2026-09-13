# Rotate a video

[← All tools](../README.md) · [The tool](https://abox.tools/rotate-video/)

Turns a video a quarter turn either way or upside down, in the browser,
without the file going anywhere and, ordinarily, without a frame being
decoded: the turn is written into the track's display matrix and every
frame and packet is copied across as it was. "Bake it in" — draw every
frame turned and encode it again — is offered for the few players that
ignore the matrix and required for a WebM or MKV whose picture is not
H.264.

It is the roadmap's "Rotate" line built as the line was worded — "for the
clip that was filmed sideways, and not one frame is decoded to do it" —
and, as that entry said, nearly every part of it already existed: the MP4
reader carries the sample entry and matrix out whole, the writer writes a
matrix back, and the converter's copy path became `shared/js/copy-tracks.js`
the day before this was built.

## The nine numbers

A phone that films sideways stores the frames as the sensor saw them and
writes a rotation into `tkhd` as a 3×3 display matrix, which every player
applies on the way to the screen. `src/plan.js` is the arithmetic:

- **`rotationMatrix(rotation, codedWidth, codedHeight)`** writes the 36
  bytes for 0, 90, 180 or 270 degrees clockwise, translation included, so
  the turned picture stays in the positive quadrant (a matrix without the
  translation shows black in some players). The four numbers the MP4 reader
  turns back into a rotation are the same four, and
  `tests/js/rotate-video.test.js` proves it by writing a track with the
  writer and reading it back with the reader.
- **`turned(rotation, turn)`** composes the file's own rotation with the
  visitor's: a portrait phone clip (already 90) given a quarter turn right
  becomes 180, and the preview shows exactly that.
- **`shownSize`** is the display size that implies - what the page says
  and the check reads back. It is *not* what goes into `tkhd`'s width and
  height: those stay the stored frame's size, the way a phone writes them,
  because the matrix does the turning and Chrome shows a stretched picture
  when the header says the turned size as well; **`canCopy`** says whether the frames can go
  across at all (any codec out of an MP4/MOV; H.264 only out of a Matroska
  file, since an `avc1` entry is the only one built here).

## The two paths

`src/rotate.js`:

- **Copy** — `copyPicture` from the shared part with a matrix, width and
  height override; every frame a `Blob` slice of the source, never read
  until the browser writes the result out. The sound goes the converter's
  three ways: AAC copied, a decodable codec streamed through
  `shared/js/reencode-sound.js`, anything else left out. The B-frame
  composition shift and the between-track delay are placed as edits by the
  shared `place`, so a copied clip stays in sync.
- **Bake** — `shared/js/reencode-video.js` with the track described as
  "shown turned this far, at this size": `drawScaled` applies the rotation
  as it draws, so the frames come out of the canvas already upright and are
  written with no matrix at all. The bitrate is a fifth over what the
  source spent, held between a floor and a ceiling per pixel.

## The preview

`src/preview.js` decodes the first keyframe (and up to sixty samples after
it, for a decoder that holds one back) into an `ImageBitmap`, and the page
redraws it through the same `drawScaled` the encoder uses with the rotation
chosen. What the preview shows is therefore what the header says, not a CSS
turn that could disagree with it. A picture the browser will not decode
gets no preview and a note; the turn is still written.

## The check

`verify()` in `src/main.js` reopens the result with the MP4 reader and holds
it to its length, to the rotation and display size the plan asked for (0
and the baked frame size after a bake), and to a sound track when one was
promised. The result then plays from a `blob:` URL under the download,
which is the check that matters most: a turn is the one change a person
can see at a glance.

## Tests

`tests/js/rotate-video.test.js`: the matrix bytes for each turn and the
round trip through the writer and reader, the composition of turns, the
shown size, what can be copied, the bake bitrate at its floor and ceiling,
and the words. The codecs are WebCodecs and are checked in a browser; the
build's page and the "Try an example" button are how.

## What it does not do

- Arbitrary angles, or a flip. The display matrix could express both, and
  nothing that plays a video would agree on what to do with them.
- Write anything but MP4, for the reason the converter gives.
- Read AVI, WMV, FLV or MPEG-2, or copy a non-H.264 picture out of a
  Matroska file — that one is baked instead, and the box says so.
