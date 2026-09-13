# How to rotate a video without losing quality

A clip that plays on its side was never turned in the first place: the phone wrote a note in the file's header, and something is ignoring the note. Here is what the note says, why fixing it should take seconds and cost nothing, and when it is worth paying for the other way.

[Video-Rotator öffnen](https://abox.tools/de/video-drehen/): Eine Vierteldrehung, eine halbe Drehung, in die andere Richtung. In den Header der Datei geschrieben, sodass kein einziges Einzelbild dekodiert wird und nichts verloren geht.

Zuletzt aktualisiert 13 September 2026

## The short answer

Open the [Video Rotator](https://abox.tools/de/video-drehen/), drop the clip in, press the turn that makes the preview look right, and press the button. The turn is written into the file's header and every frame is copied across as it was, so it takes seconds and loses nothing. The result is opened again to check it says what you asked, and plays under the download the right way up. Nothing is uploaded.

The rest of this is about why that is enough, because most rotators — and most advice — treat a turn as a re-encode, and it is not one.

## Why the clip is sideways in the first place

A phone's camera sensor is landscape. When you hold the phone upright and film, the sensor still sees a landscape picture lying on its side, and the phone stores exactly that: a landscape frame, every frame. What it adds is a note in the file's header — a display matrix, nine numbers — that says “show this turned a quarter to the right.” Every phone, every browser, every modern player and editor reads the note and turns the picture on the way to the screen, which is why the clip looks fine on your phone.

A clip that plays sideways somewhere is a clip whose note is being ignored, or whose note is wrong: a camera that was held the other way from what it guessed, a converter that dropped the header on the way through, an old player that never read it. The frames are not the problem. The note is.

## So the fix is nine numbers, not a re-encode

Rotating the video means writing a different note. The frames stay exactly what they were — not decoded, not re-encoded, not touched — and the file comes out almost exactly the size it went in, in the time it takes to read it once. That is what the [Video Rotator](https://abox.tools/de/video-drehen/) does by default: it composes the turn you chose with whatever the file already said, writes the matrix for the result, and copies every frame and every packet of sound across byte for byte.

Most online rotators decode the clip, turn the pixels, and encode everything again. That costs a generation of quality, takes as long as an encode, and gives you a file that is different in every frame from the one you had — for a job that needed nine numbers. It is done that way because one path that always re-encodes is simpler to write than two, not because the video needed it.

## When baking the turn in is the right call

A few old desktop players ignore the display matrix and show the frames as stored, sideways. If the clip is going to one of those, or going somewhere you cannot check, the header is not enough and the pixels themselves have to be turned. The tool offers that as a checkbox — “bake the turn into the picture” — and it does what the online rotators do: draws every frame turned and encodes it again as H.264, at a bitrate a little over what the source spent so that the second generation has room to say the same thing. It costs a generation of quality and takes as long as an encode, which is why it is the second choice and the page names it as one.

A WebM or MKV whose picture is not H.264 is baked whether you tick the box or not, because an MP4 header can be built round H.264 frames and nothing else; the page says so when it meets one.

## Which way is right?

A quarter turn right is clockwise: the way the top of the picture would move if you turned your phone to the right. The tool shows the first frame turned as chosen, drawn through the same arithmetic the header will carry, so pick the button that makes the preview look correct rather than working it out. A clip that is upside down wants the half turn; a clip that a camera guessed wrongly about usually wants a quarter turn the other way from the one you would expect.

## Why the upload is the strange part

Every online rotator asks for the file first. The whole thing goes up on your connection — a gigabyte of holiday, a lecture, a match — so that a turned copy can come back down, and the upload takes longer than the whole job, before any question of who keeps the file. It is strange because nothing about the job needs a server: reading a header and writing a new one is a few kilobytes of work, and even the baked version uses codecs already inside your browser.

The [Video Rotator](https://abox.tools/de/video-drehen/) does it in the browser. The file is read from your disk in pieces, given a new header, and written again into memory; the page's own security policy names every address it may contact, and none of them is this site's. Unplug from the network and it keeps working, which is the simplest proof there is.

## Check it before you send it

The tool opens its own result again, with the same reader it reads your file with, and holds it to three things: the length it was, the turn you asked for at the size that implies, and the sound it said it would carry. It then plays the result from memory under the download. Watch it for a moment — a turn is the one change you can see at a glance — and then save it. Keep the original too; the ordinary turn loses nothing, but the original is the only copy that is not a copy.
