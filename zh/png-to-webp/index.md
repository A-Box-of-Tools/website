# PNG to WebP — smaller, transparency and all

The same picture, often a third off, with the see-through parts intact.

> Convert PNG images to WebP in your browser, losslessly or smaller still. Transparency is kept either way. Nothing is uploaded, there is no account, and it works offline.

本页是一个完全在你的浏览器里运行的交互式工具，地址是 https://abox.tools/zh/png-to-webp/。你交给它的任何内容都不会被上传。下面是这个页面用文字对该工具的全部说明；要使用它，请打开这个地址。

## 你的pictures**不会上传**。这里根本没有服务器。

The converting runs in your own browser, on your own hardware. Every browser has written WebP since 2020, so the encoder was already on your machine before you arrived — there is nothing to download and nothing to wait for. That is why this page can promise what it promises: there is no network feature on it at all, and no server on the other end to send a picture to.

- ✗ No upload
- ✗ No account
- ✗ No size limit
- ✓ Works offline
- ✓ Open source

## How to convert a PNG to WebP

1. **Choose your PNG files.** Drop them onto the picker or select them by hand. Every file is identified by its first bytes rather than by its name, so a file that is really a JPEG is turned away with a line saying so rather than converted into a copy of itself. A row that has see-through parts says so, because that is the part people are most worried about losing.
2. **Pick lossless, or pick smaller.** Lossless keeps every solid pixel the PNG had and still comes out smaller — the right answer for screenshots, diagrams, logos and anything with text in it. Smaller turns on a quality slider and is the right answer for photographs, where nobody can see the difference and the saving is enormous.
3. **Press “Convert”, and read what it says it did.** Each result gives the new size and how it compares, and then says which coding the browser actually wrote — lossless, or lossy at the quality you chose. That line is read out of the finished file rather than repeated back from the setting.
4. **Download, one at a time or all at once.** One file gives you a download button; two or more give you a zip of the lot as well. Files that share a name get a number added before the extension, so nothing quietly replaces anything else in the archive.

## 说得更细的版本

[The same picture, a third smaller, with the transparency intact](https://abox.tools/zh/guides/convert-png-to-webp/): WebP is smaller than PNG even without losing anything - and far smaller if you let it. Which of the two you want depends on what is in the picture. What each mode does, what it saves, and how to convert without uploading.

## 常见问题

### Is my picture uploaded anywhere?

No. The file is read, decoded and written by your own browser on your own hardware. This tool has no network feature of any kind — it never fetches anything and never sends anything — and the page's `Content-Security-Policy` names every address it may contact, none of which belongs to this site.

### Does the transparency survive?

Yes, in both modes, and that is the main reason people convert a PNG to WebP rather than to a JPEG. WebP has a real alpha channel, so a logo with a see-through background arrives with a see-through background — there is no colour to pick and nothing gets flattened. The row for each file says whether it has any transparency in it before you convert, and the result says the transparency came across.

### What is the difference between lossless and smaller?

Lossless means every solid pixel in the WebP is the pixel the PNG had, and the file is smaller anyway — usually by a fifth to a third, because WebP's lossless coding is simply better than PNG's. The one footnote is about half-transparent pixels, and it has a question of its own below. Smaller means WebP's lossy coding, which throws away detail you were unlikely to notice and can take a photograph to a tenth of its size. The rule of thumb: anything with text, flat colour or sharp edges wants lossless, and photographs want the other one.

### You say “every solid pixel”. What about the half-transparent ones?

They can shift very slightly, and it is a canvas that does it rather than WebP. A browser stores a picture on a canvas with its colour already multiplied by its transparency, and that multiplication cannot be undone exactly — the fainter a pixel is, the less of its original colour survives the arithmetic. Every browser-based converter has this property, including this one, because the canvas is how the picture gets from one format to the other. \
\
What it means in practice: a pixel that is fully solid comes through bit for bit, and so does one that is fully invisible. In between, the colour stored underneath can move — measured here at up to 63 out of 255 on pixels that are less than a quarter opaque, and at most 4 on the rest. You cannot see any of it, because the pixels whose colour moves most are the ones showing least of it: a nearly-invisible pixel contributes nearly-invisible colour whatever number is stored in it. The anti-aliased edge of a logo is the only place this exists at all, and it looks the same afterwards. \
\
If you need a PNG kept as an exact archival copy, keep the PNG. If you need one to look identical and weigh a third less, that is what this does.

### How do you know it was really lossless?

Because the finished file is read back and checked, rather than the setting being repeated to you. A WebP stores its pixels in one of two chunks — `VP8L` for the lossless coding and `VP8` for the lossy one — and this page looks at which chunk came out and says so on the row. It has to work that way: a canvas has no lossless flag, so asking for it means asking for the top of the quality range and trusting the browser to take the hint. Every current browser does. This page checks anyway.

### Will a WebP actually open everywhere?

On the web, yes — Chrome, Edge, Firefox and Safari have all shown WebP since 2020, so there is no longer a fallback to think about for a website. Away from the browser it is patchier: Windows and macOS both preview them now, but some older desktop software, a few upload forms and a lot of e-readers still will not take one. If you are converting for something that refuses a WebP, you want the [WebP to JPG](https://abox.tools/zh/webp-to-jpg/) converter, which is this tool pointed the other way.

### Why is my PNG so big in the first place?

Because PNG is lossless and photographs are not compressible that way. A PNG is excellent for a screenshot or a logo, where large areas repeat, and terrible for a photograph, where almost nothing does — a phone photo saved as a PNG is routinely ten times the JPEG of the same picture. That is exactly the case where the lossy setting here earns its place. If the file needs to come in under a particular figure, the [Image Compressor](https://abox.tools/zh/compress-image/) takes a target size rather than a quality.

### Does it keep the date, camera and location?

No. The picture is drawn onto a canvas and a canvas holds pixels and nothing else, so any metadata around them is left behind. For a PNG that is usually nothing of consequence — most carry no camera data at all — but if you need to see what a file holds, the [EXIF Viewer & Remover](https://abox.tools/zh/exif-editor/) reads and writes it without re-compressing the picture.

### Can it do a whole folder at once?

Yes. Drop in as many as you like — there is no limit on the number or the size, because there is no server paying for them. Each one gets its own row and its own download, and two or more give you a zip of the lot with the total saving at the top.

### Is it free, and do I need an account?

It is free, and there is no account, no sign-in, no trial and no watermark. The site carries advertising, which is what pays for it; the ads are not given anything about your pictures.

### Does it work offline?

Yes. Load the page once, then disconnect from the internet and it keeps working exactly as before. That is also the strongest proof available that nothing is being uploaded: a converter that sent your files away to be processed would stop the moment you unplugged, and this one does not.

## 这条隐私承诺怎么核实

- **Your pictures have nowhere to go.** The Content-Security-Policy names every address this page may contact, and not one of them belongs to this site. There is no endpoint here that your files could be collected at, and nothing in the code that would send them if there were.
- **The transparency survives, which is the usual reason people ask.** WebP has an alpha channel exactly as PNG does, so a logo with a see-through background comes out with a see-through background and there is no colour to choose and nothing to flatten. That is the difference between this page and the [WebP to JPG](https://abox.tools/zh/webp-to-jpg/) one next door, which has to ask, because a JPEG has no alpha channel at all.
- **Lossless is checked, not claimed.** A canvas has no switch for lossless WebP — the browser picks the coding from the quality it is handed, and every current one writes the lossless coding at the top of the range. That is engine behaviour rather than a guarantee in the specification, so this page does not take it on trust: every file it writes is read back, and the row tells you whether the bytes are really the lossless coding. If a browser ever stops honouring it, you will be told on the day instead of finding out later.
- **What a canvas does not carry across.** The picture is decoded and drawn onto a canvas, and a canvas holds pixels and nothing else, so any text chunks, ICC colour profile or XMP block in the PNG do not survive. The pixels do — that is what lossless means here — but the metadata around them does not. If that matters, the [EXIF Viewer & Remover](https://abox.tools/zh/exif-editor/) is the tool that reads and writes it.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google, and the donate button from Buy Me a Coffee. None of them is handed anything about your pictures. Every line that reads, decodes or writes a file is served from this origin and listed in the repository.
- **It works offline.** Load the page once and disconnect from the network, and the tool is unchanged. That is the simplest proof of all: a converter that sent your pictures away to be converted could not possibly manage it.

**你可以自己核对。**上面这些不用你信。这个页面是仓库里的模板和配置生成出来的，构建脚本你能读，也能自己跑一遍，跑出来的结果就提交在 `dist` 分支上。拿实际发给你的内容，跟你自己从源码构建出来的结果对一遍就知道了： https://github.com/A-Box-of-Tools/website

最值得先读的几个文件：`config/site.toml` 里是 Content-Security-Policy, and `src/shared/image-convert.js` for the conversion — in particular `encodeWebp`, which writes the file and then reads its own RIFF chunks back to find out whether the browser really wrote the lossless coding it was asked for.
