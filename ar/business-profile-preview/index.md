# Business Profile Preview — see your Google listing before it goes live

Type it, and it becomes the card Google would draw. Nothing is sent to draw it.

> See how your Google Business Profile will look before it goes live: the knowledge panel, the phone card and the search result, drawn from the name, category, hours, rating and photo you type. Import an existing listing by pasting it. Download as PNG or SVG. It all happens in your browser.

هذه الصفحة أداة تفاعلية تعمل بالكامل داخل متصفحك، على العنوان https://abox.tools/ar/business-profile-preview/ — ولا يُرفَع أي شيء تعطيه إياها. وفيما يلي كل ما تقوله الصفحة عن الأداة بالكلمات؛ لاستخدامها، افتح العنوان.

## profiles and the pictures of them لا تُرفع **أبدا**. لا يوجد خادم.

Every field you type is drawn into a picture by about a thousand lines of JavaScript in this page that you can read, and there is no step in that which contacts anybody. Not to look your business up, not to check an address, not to draw a star. This tool has no network feature of any kind — which matters here because a business profile is a home address as often as it is a shopfront, and a telephone number that goes to somebody's own phone.

- ✗ No upload
- ✗ No account
- ✗ No watermark
- ✓ Works offline
- ✓ Open source

## How to preview a Google Business Profile before it goes live

1. **Start from the listing you already have, if there is one.** Open your business on Google, select the whole card — the name, the stars, and the lines under them — copy it, and paste it into the fold at the top of this page. The name, category, rating, review count, address, phone number, website and a full week of opening hours are all recognised, and the page reports back exactly which of them it filled in so that a wrong guess is visible rather than quietly signed off. A Business Profile API export opens too, if you have one.
2. **Get the name and the category right first.** They carry more weight than everything else together. The name is the only field cut short on all three surfaces, and the search result is where it is cut shortest — so a name with the town and the trade bolted onto the end reads as an ellipsis to the people most likely to be looking. The category is the line a local result has room for when it has room for nothing else, and it is the phrase a search actually matches against.
3. **Fill the week in, and look at what it says.** The status line is the one part of a listing that changes by itself: *Open · Closes 9 PM* becomes *Closed · Opens 9 AM Tue* without anybody touching it. This page works it out from the hours and your own clock, so switching a day to closed shows you immediately what somebody looking you up that evening is told. A window that ends before it starts — 22:00 to 02:00 — is read as running past midnight, which is what a bar means by it.
4. **Check which buttons you have earned.** No address, no *Directions*. No website, no *Website*. No phone number, no *Call*. Those three fields turn into the row of buttons under the name, and a profile missing one is a profile a reader cannot act on without going somewhere else first. It is the fastest thing to check on the preview and the most common thing missing from a real listing.
5. **Look at all three surfaces, not the first one.** The same profile is cut to three different lengths. The knowledge panel is generous and is what people see when they already know your name; the phone card is what most of your visitors actually get; the local pack entry is the narrow one, and it is where somebody who has never heard of you decides between you and two competitors. A description that reads well in the first is invisible in the third.
6. **Take the picture away.** The PNG comes out at the surface's own size, or at twice or three times it, which is the only enlargement that cannot move where a line broke. Take the SVG as well if it is going into a document — it is one self-contained file with the photograph inside it, so it prints sharp and carries no link to anywhere. The saved profile is the third download, and it is what to keep if you are going to come back to this.

## النسخة الأطول

[How to preview a Google Business Profile before it goes live](https://abox.tools/ar/guides/preview-a-google-business-profile/): What your Google listing will look like on a desktop search, on a phone and in the local pack: how long a name survives, why the category does more work than the description, which fields turn into buttons, and what the Open or Closed line says when nobody is watching.

## أسئلة

### Is this made by Google?

No. This site is not affiliated with, endorsed by or connected to Google in any way, and Google Business Profile is Google's trademark, used here only to say what the page is a preview of. What you are looking at is a drawing made in your own browser out of what you typed — not a screenshot, not a live view of your listing, and not connected to your Google account. Nothing you do here changes your real profile; to do that you have to go to Google.

### Can it import my existing profile automatically?

No, and it is worth being clear about why: fetching your listing would mean this page could contact a server, and a page that can contact a server is a page that can send your fields to one. That ability is the thing this whole site is built to not have. So the import works the other way round — you copy your listing and paste it in, and the page reads what it can out of the text and tells you which fields it filled. A Business Profile API export in JSON opens directly.

### Is anything I type sent anywhere?

No. There is no `fetch`, no `XMLHttpRequest` and no `sendBeacon` anywhere in this tool's code, and the page's `Content-Security-Policy` names every address it may contact, none of which belongs to this site. That matters more here than on most pages: a business profile is very often somebody's home address and a phone number that rings in their pocket.

### How accurate is the mock-up?

Accurate about what fits and approximate about how it looks. The type on the real thing is Google Sans, which is not a font on your machine, and the spacing moves with every release of Search and Maps — so treat the exact pixels as an impression. What is exact is the part worth previewing: how much of your name survives at each width, whether the category still reads on the narrowest surface, and which buttons your fields have earned.

### Why does my brand-new listing show no stars at all?

Because that is what Google shows, and because five empty stars is what one star looks like at a glance. Leave the rating and the review count empty and the card says there are no reviews yet, which is the honest preview of a profile nobody has reviewed. Put a number in both and the stars appear, filled by the fraction the number actually is — a 4.6 is four stars and three fifths of a fifth, not five.

### What does the Open or Closed line actually depend on?

The week you filled in, and the clock on the machine you are reading this on. There is no time zone field, because a listing does not have one either: Google shows a visitor the status in the business's own local time, and the closest this page can get to that without asking anybody anything is your clock. So the line here is exactly right if you are in the same time zone as the business, and shifted if you are not — which the page says under the week rather than leaving you to find out.

### Can I use the picture in a proposal, a pitch deck or a client report?

Yes. There is no watermark, no account, no limit on how many you make, and nothing in the file that points back here. It is your own fields drawn into a picture on your own machine. The one thing worth saying to whoever receives it is what it is — a mock-up of how a listing would look — because a drawing this recognisable is easy to mistake for a screenshot of something that already exists.

### What is the difference between the three previews?

Width, and therefore how much survives. The **knowledge panel** is the tall card on the right of a desktop search for your name: the most generous, and the one you see when you look yourself up. The **phone** card is what most of your visitors actually get. The **search result** is one entry of the local pack, the three-business block with a map above it, which is the narrowest and is where somebody who has never heard of you chooses between you and two competitors.

### Does the photo I add get uploaded?

No. It is decoded in this page, redrawn onto a canvas at a size the card can use, and embedded in the picture as data. Two things fall out of that: the file never leaves your machine, and everything it recorded about where and when it was taken is gone, because a canvas has no metadata. If the original matters to you, keep the original — what goes into the mock-up is a copy.

### Can I save what I typed and come back to it?

Yes, as a file. *Save the profile* writes JSON to your disk with every field and the photograph in it, and opening that file here again puts it all back. Nothing is stored in this browser between visits and there is no account to log into, which is deliberate: a business's address, phone number and opening hours are not ours to keep.

### Does it work offline?

Yes. Load the page once, then disconnect from the internet and it keeps working — the fields, the drawing, the PNG, all of it. That is also the simplest way to prove nothing is being uploaded: a tool that sent your details away to have a card drawn would stop the moment you unplugged.

## كيف يمكن التحقق من وعد الخصوصية

- **There is nowhere for what you type to go.** The Content-Security-Policy names every address this page may contact, and not one of them belongs to this site. There is no endpoint here that an address or a phone number could be collected at, and nothing in the code that would send it if there were.
- **Nothing here fetches anything.** There is no `fetch`, no `XMLHttpRequest` and no `sendBeacon` anywhere in `src/`. That is also why the tool cannot look your listing up for you, and why importing one means pasting it in: the ability to go and get it is exactly the ability to send something away.
- **The photograph is read here and stripped on the way in.** A cover photo is decoded in this page and redrawn onto a canvas before it reaches the picture, which bounds its size and drops everything the file recorded about where and when it was taken. What ends up inside the mock-up is the picture, not the file you chose.
- **The download is the thing on screen.** The PNG is not a second rendering that might disagree with the preview: the same markup is handed to the browser and painted onto a canvas. It is also why the download works with the network unplugged — there is no font to fetch and no linked image inside it, so the picture is one self-contained file.
- **A saved profile is a file, not an account.** The JSON this page writes goes to your disk and nowhere else, and opening it again is the only way this tool remembers anything. Nothing is stored in the browser between visits, because a business's address and opening hours are not ours to keep.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google, and the donate button from Buy Me a Coffee. None of them is handed anything you type — the irony is noted, and the separation is real: every line that turns your fields into a picture is served from this origin and listed in the repository.
- **It works offline.** Disconnect from the network and the tool is unchanged, because there was never a network step in it. That is the simplest proof of all.

**تحقّق بنفسك.** لا شيء مما سبق عليك تصديقه دون تحقق. تُولَّد هذه الصفحة من القوالب والإعدادات في المستودع بواسطة سكربت بناء يمكنك قراءته وتشغيله بنفسك، والنتيجة موجودة في فرع `dist` — فقارِن إذن بين ما يُقدَّم فعلا وما ينتجه بناء المصادر: https://github.com/A-Box-of-Tools/website

الملفات الجديرة بالقراءة أولا هي `config/site.toml` من أجل سياسة أمان المحتوى (Content-Security-Policy), `src/surfaces.js` for the three cards themselves — every coordinate in them is written out — `src/profile.js` for the one piece of arithmetic on the page, which is whether the place is open at this moment, and `src/parse-listing.js` for what happens to a listing you paste in.
