# Guide use-case review — 13 October 2026

[← README](../README.md) · [Guide conventions](guides.md)

This review covers all 75 guides on `dev`. The English pass expanded 74 and
kept the recently revised Remote Camera guide, whose nursery, pet, entryway and
DIY workflows already supplied both ordinary and less obvious uses. The same
use-case coverage and corrected limitations are now translated into Simplified
Chinese, German, Spanish, Brazilian Portuguese, French and Japanese.

Each maintained language has 75 complete guide bodies and translated article
metadata. Image Layout and Remote Camera previously had English guide fallbacks;
both guides are now translated in full. Older sharing translations also lacked
the local-network section, which is included in this update. The eight frozen
language archives remain outside the selected scope.

“Common” here is an editorial judgement about the job a reader arrives with,
supported by the tool's current controls and representative primary references.
It is not a measured popularity ranking: no search-query or usage export was
available for this review. The additional cases use existing capabilities, rather
than promise planned features. Each expanded article gives a path or settings,
an output check and relevant limits near the beginning.

The review also corrected claims that would make those paths misleading:
image passthrough can preserve metadata; video Copy cuts and later edit-timeline
handoffs have limits; slideshow seconds differ from its one-frame default;
QR decoding does not resolve redirects; receipt duplicate warnings are advisory;
and current application rules decide whether an ID-photo export is usable.

## Coverage by article

“Expanded” means the article gained a concrete use-case section and, where
needed, nearby corrections. “Already covered” means the existing article met the
same review criteria. The final column records limits readers need to complete
the job; it is not a second specification for the tool.

| Guide | Review | Common job | Useful additional case | Important limit or check |
|---|---|---|---|---|
| [arrange images](../pages/guides/arrange-images/body.html) | Expanded | Contact-sheet shortlist and before/after strip with fit, size and format choices. | Ordered support screenshots or assembly instructions as a vertical PNG strip. | One still output; no cell captions or filename labels; long strips meet canvas limits. |
| [can an ai agent use these tools](../pages/guides/can-an-ai-agent-use-these-tools/body.html) | Expanded | Application attachment preparation | Repeatable expense-packet brief | Agent data handling and human review remain separate |
| [can blacked out text be recovered](../pages/guides/can-blacked-out-text-be-recovered/body.html) | Expanded | Support screenshots and document copies | Reusable training example | Check every occurrence and scanned pixels |
| [check a bank statement csv](../pages/guides/check-a-bank-statement-csv/body.html) | Expanded | Monthly imports and personal spending review | Older or closed-account history | Overlap, transaction meaning and destination mapping need review |
| [clean up a voice memo](../pages/guides/clean-up-a-voice-memo/body.html) | Expanded | Voice memo cleanup; interviews, lectures and meetings already covered. | Language practice and rehearsal excerpts at 0.75x with pitch kept. | WAV size; peak normalization cannot balance speakers or remove noise; full-result listening. |
| [combine images into a pdf](../pages/guides/combine-images-into-a-pdf/body.html) | Expanded | Added checklist-ordered application/reimbursement packets with explicit paper size, fit and output checks. | Warranty record with receipt, serial-number label and fault photos. | One image per page; no OCR or existing PDF import; originals retained. |
| [compare two json files](../pages/guides/compare-two-json-files/body.html) | Expanded | Added staging/production comparison with case and whitespace kept meaningful. | Before/after API responses using identical request inputs. | Arrays keep order; number/string spellings can differ; no schema/equivalence proof; patch covers formatted copies. |
| [compress a video](../pages/guides/compress-a-video/body.html) | Expanded | Email and upload size targets; screen recordings. | Readable bug report and product demonstration clips. | Combined attachment allowance, decimal MB, measured result and destination playback; loss of text detail. |
| [compress an image to a target size](../pages/guides/compress-an-image-to-a-target-size/body.html) | Expanded | Application dimensions plus byte limit; per-photo attachment budget. | Readable receipt or screenshot copy for support. | Per-image target; pass-through retains format/metadata; PNG shrinks via dimensions; separate converter for lossless WebP. |
| [convert a gif to mp4](../pages/guides/convert-a-gif-to-mp4/body.html) | Expanded | Smaller tutorial, product animation and presentation clips. | Website player animation with deliberate looping and backdrop. | MP4 does not carry GIF looping/transparency; smaller file is not guaranteed; lost palette detail is not restored. |
| [convert a video to mp4](../pages/guides/convert-a-video-to-mp4/body.html) | Expanded | Screen recordings, camera MOV and MKV compatibility already covered. | Presentation handoff and accessible working copies of camera archives. | Audio omission, 4 GB writer limit, conversion is not compression, non-identity MP4 edit lists refused. |
| [convert an svg to png](../pages/guides/convert-an-svg-to-png/body.html) | Expanded | Logo for slides/documents with transparency and size checks. | Consistent @2x/@3x or batch icon assets. | Raster output is one-way; fonts and linked artwork may be absent; small hairlines vanish. |
| [convert avif to jpg](../pages/guides/convert-avif-to-jpg/body.html) | Expanded | Document or upload compatibility with byte-size verification. | Tested compatibility copy for an older frame/printer/device. | New JPEG may be larger; transparency/HDR/metadata and all but first sequence frame are lost. |
| [convert heic to jpg](../pages/guides/convert-heic-to-jpg/body.html) | Expanded | Phone album import with capture-date and portrait-orientation checks. | Public listing/share copy with metadata disabled. | Filesystem dates differ from EXIF dates; preservation only HEIC-to-JPEG; keep originals and Live Photo videos. |
| [convert png to webp](../pages/guides/convert-png-to-webp/body.html) | Expanded | Lossless documentation screenshot conversion with actual coding check. | Transparent product cutouts tested against light/dark backgrounds. | Canvas alpha/colour values may shift; sizes unchanged; publishing system must accept format. |
| [convert webp to jpg](../pages/guides/convert-webp-to-jpg/body.html) | Expanded | Presentation, print order or upload copy with deliberate matte colour. | Trial conversion for an older photo frame. | JPEG is lossy/opaque, may grow; first frame only; no animation extraction. |
| [convert yaml and json](../pages/guides/convert-yaml-and-json/body.html) | Expanded | Added application configuration migration with string/boolean/list review and receiver validation. | Compare environments that use different configuration formats. | Supported YAML subset only; comments lost; anchors/aliases/tags and multi-document streams refused. |
| [crop a video](../pages/guides/crop-a-video/body.html) | Expanded | Vertical and square social/family clips; existing ratio guidance retained. | Focused software tutorial or workbench demonstration. | Static crop, even dimensions, re-encoding, content can leave the box, no automatic following. |
| [does converting a photo remove its metadata](../pages/guides/does-converting-a-photo-remove-its-metadata/body.html) | Expanded | Archive conversion versus public sharing | Check already-small passthrough outputs | Inspect final file; preservation depends on output and options |
| [edit a gif frame by frame](../pages/guides/edit-a-gif-frame-by-frame/body.html) | Expanded | Dropping, reordering and retouching frames already covered. | Remove a stray notification; pause an instruction on its finished state. | Manual timing restoration, repeated sensitive frames, palette re-quantization, no automatic timing import. |
| [embed an image in css](../pages/guides/embed-an-image-in-css/body.html) | Expanded | Reusable small decorative CSS mark; meaningful images need text alternatives. | Self-contained offline HTML handout/report. | Data-image policy differs by destination; encoded bytes retain metadata; large files carry overhead. |
| [extract audio from a video](../pages/guides/extract-audio-from-a-video/body.html) | Expanded | Audio-only lecture, presentation and interview listening. | Voiceover/podcast working track for further editing. | WAV only; mixed soundtrack not separated/transcribed; Float32 and channel preservation; mono cancellation. |
| [extract receipts and invoices](../pages/guides/extract-receipts-and-invoices/body.html) | Expanded | Trip/project reimbursement and bookkeeping handoff | Warranty purchase index | No line items, categorization, payment proof or stored history |
| [format and check xml](../pages/guides/format-and-check-xml/body.html) | Expanded | Added readable API/feed debugging, escaping and receiver checks. | Review XML-to-JSON configuration migration. | No XSD/DTD validation or entity fetching; conversion loses comments and mixed-content order. |
| [format json without uploading it](../pages/guides/format-json-without-uploading-it/body.html) | Expanded | Added API/configuration debugging with language choice, Go to error and value review; corrected obsolete Compare tab claim. | Minified offline-label or byte-limited field payload with delivery read-back. | No schema validation or automatic sensitive-field removal; other formatters may also be local. |
| [get photos ready for the web](../pages/guides/get-photos-ready-for-the-web/body.html) | Expanded | Blog gallery and consistently framed product catalogue. | Separate large zoom view and crisp diagrams/screenshots. | Example sizes not universal; batch crop requires inspection; unchanged outputs retain metadata. |
| [grab a frame from a video](../pages/guides/grab-a-frame-from-a-video/body.html) | Expanded | Video cover, document stills and existing contact-sheet capture. | Recipe/repair/exercise instructions; project progress record; website poster. | Exact frame selection only on reader path; no motion-blur recovery; HDR/10-bit canvas output is 8-bit SDR. |
| [how can a web page work offline](../pages/guides/how-can-a-web-page-work-offline/body.html) | Expanded | Travel and weak-connection processing | Cache every tool in a multi-step workflow | Caching is per tool, not working-file storage |
| [is base64 encryption](../pages/guides/is-base64-encryption/body.html) | Expanded | API text decoding and encoding mismatches | Canonical spelling and round-trip inspection | UTF-8 text; no JWT signature verification or binary-file workflow |
| [is it safe to paste into an online tool](../pages/guides/is-it-safe-to-paste-into-an-online-tool/body.html) | Expanded | API syntax debugging and config regressions | Prepare a minimal support example | Formatting is not application validation; inspect exported text |
| [is it safe to scan a qr code](../pages/guides/is-it-safe-to-scan-a-qr-code/body.html) | Expanded | Menu/payment destination inspection | Equipment-label and emailed-image checks | No redirect resolution or destination safety verdict |
| [is it safe to upload a bank statement](../pages/guides/is-it-safe-to-upload-a-bank-statement/body.html) | Expanded | Budgets/bookkeeping and requested statement submission | Older statement recovery | Text PDFs only; conversion is not authentication |
| [is it safe to upload a photo of your id](../pages/guides/is-it-safe-to-upload-a-photo-of-your-id/body.html) | Expanded | Application portrait versus existing ID copy | Permitted purpose-limited support copy | Authority decides edits, photographer and required fields |
| [is it safe to upload files](../pages/guides/is-it-safe-to-upload-files/body.html) | Expanded | Oversized attachments and document packets | Synthetic rehearsal of an unfamiliar converter | Check each feature and combined attachment limits |
| [is it safe to upload files to an ai](../pages/guides/is-it-safe-to-upload-files-to-an-ai/body.html) | Expanded | Passage explanation and configuration debugging | Synthetic question before real-data attachment | Review vendor terms, context and agent data paths |
| [is it safe to use an online password generator](../pages/guides/is-it-safe-to-use-an-online-password-generator/body.html) | Expanded | New account passwords and manual-entry passphrases | Separate password for a protected PDF | Accepted characters, saving and independent random choices |
| [make a boomerang video](../pages/guides/make-a-boomerang-video/body.html) | Expanded | Jump/splash/turn boomerangs already covered. | Product motion and small interaction previews. | No boomerang button; both halves need deliberate sound policy; exact cuts/joins can re-encode; destination controls MP4 looping. |
| [make a favicon](../pages/guides/make-a-favicon/body.html) | Expanded | Website favicon and mobile home-screen set. | Desktop utility/internal shortcut icon files. | Merge existing manifest carefully; inspect tiny previews and test target platform; no installer/cursor output. |
| [make a gif from images](../pages/guides/make-a-gif-from-images/body.html) | Expanded | Photo comparisons and short screenshot instructions. | Stop motion/render sequences with shared palette and deliberate loop. | No caption or crop controls; GIF transparency/palette limits; destination animation support varies. |
| [make a gif from part of a video](../pages/guides/make-a-gif-from-part-of-a-video/body.html) | Expanded | Reaction/action sections and multi-moment assembly already covered. | Bug reproduction and craft/product instruction with causal context. | GIF lacks audio; small text readability; multi-section Copy requires compatible/keyframe starts; incoming playback edits refused. |
| [make a height comparison chart](../pages/guides/make-a-height-comparison-chart/body.html) | Expanded | Family and fictional-character height charts | Cast/prop and product scale reference | Entered-height illustration, not physical clearance measurement |
| [make a passport photo](../pages/guides/make-a-passport-photo/body.html) | Expanded | Document/application-route checks before crop/export; permitted visa preparation. | Issuer-permitted staff/student/event badge and separate signature upload. | UK digital cropping, Canadian professional photography and US editing rules respected; no acceptance promise or universal portal sizes. |
| [make a pdf smaller](../pages/guides/make-a-pdf-smaller/body.html) | Expanded | Added size-limit iteration from the original using actual presets and measured output. | Separate screen-reading copy of a photo-heavy report. | No automatic target size; skipped formats/text-heavy files may not shrink; visual checks required. |
| [make a qr code](../pages/guides/make-a-qr-code/body.html) | Expanded | Added guest Wi-Fi and contact-card workflows with printed device/action checks. | Equipment labels linking to a stable manual/setup URL. | Static payload; guest password is readable; no guaranteed print size/logo area; destination needs a connection. |
| [make a qr code and prove it scans](../pages/guides/make-a-qr-code-and-prove-it-scans/body.html) | Expanded | Added final-layout menu/event/manual proof including the destination action. | Contact-card import check and individual label-sheet proofs. | Reader does not resolve redirects; one code per image; success here does not guarantee every phone. |
| [make a video thumbnail](../pages/guides/make-a-video-thumbnail/body.html) | Expanded | Upload thumbnail chain and contact-sheet candidates already covered. | Website poster and presentation cover with small-preview readability. | Platform-specific format/shape/device byte limits; no title/overlay tool; source dimensions cannot gain detail through enlargement. |
| [merge and split pdf files](../pages/guides/merge-and-split-pdf-files/body.html) | Expanded | Added checklist application packet and requested-page extract with concrete range and output checks. | Share only certificate/appendix pages while redacting private text on retained pages. | No page-content thumbnails; ranges count current positions; form-name collisions and signature limitations remain. |
| [open a dicom file](../pages/guides/open-a-dicom-file/body.html) | Expanded | Disc inventory and codec troubleshooting | Viewing an approved teaching dataset | No diagnosis, completeness verdict or anonymisation |
| [preview a google business profile](../pages/guides/preview-a-google-business-profile/body.html) | Expanded | New listing and client approval | Overnight-status rehearsal and proposed/existing comparison | Approximation, local time and no publishing or ranking verdict |
| [protect a pdf](../pages/guides/protect-a-pdf/body.html) | Expanded | Added private attachment workflow with recipient-reader test and separate password delivery. | Unlock/edit/protect to replace an old password. | Restrictions alone do not close a document; copies already delivered keep their existing passwords. |
| [redact a pdf](../pages/guides/redact-a-pdf/body.html) | Expanded | Added statement/invoice sharing with explicit terms, candidate review and downloaded-file checks. | Reusable invoice/report for training. | Patterns and zero matches are not a privacy audit; unknown font mappings and scanned pixels need separate handling. |
| [redact an image](../pages/guides/redact-an-image/body.html) | Expanded | Bug-report screenshot and document excerpt with solid fill. | Parcel-label QR/barcode coverage; precise source-coordinate boxes. | One image at a time; surrounding clues/box size remain; blur/pixelation are not reliable anonymity; inspect actual download. |
| [remove exif and gps data](../pages/guides/remove-exif-and-gps-data/body.html) | Expanded | Public copies inspected with preservation policies explicit. | Camera-clock date correction and photo-library validation. | Orientation/ICC may remain; filenames/pixel clues separate; AVIF creates PNG; EXIF dates may omit timezone. |
| [resize an image](../pages/guides/resize-an-image/body.html) | Expanded | Square avatar and product tile with output-size/fit checks. | Same border crop on equal-size screenshots. | No enlargement by default; relative crop differs on mixed dimensions; batch output size shared; pass-through retains tags. |
| [reverse a video](../pages/guides/reverse-a-video/body.html) | Expanded | Rewind gags, boomerangs, reveals and reversed speech already covered. | Craft/sports technique inspection and reusable product reveals. | Whole-clip reversal and re-encoding; separate crop/reverse incur separate encodes; sound storage and codec support. |
| [rotate a video](../pages/guides/rotate-a-video/body.html) | Expanded | Sideways phone clips and upside-down camera recordings. | Projector/presentation or old-player compatibility check with Bake fallback. | Destination matrix support; sound may be copied, encoded or omitted; no arbitrary-angle straightening or flip. |
| [scan a document with your phone](../pages/guides/scan-a-document-with-your-phone/body.html) | Expanded | Added reimbursement receipt/signed-form workflow with faint-detail and cleanup checks. | Keep a legible warranty receipt record. | Still-photo input only; no OCR; no curved-book flattening; preserve originals. |
| [scan multiple pages into one pdf](../pages/guides/scan-multiple-pages-into-one-pdf/body.html) | Expanded | Added checklist application/school submission with back sides, ordering and duplicate checks. | Warranty/support packet combining scanned paper and existing confirmation PDF through the merger. | No OCR/PDF import; cleanup applies to the set; page count alone misses duplicates. |
| [share text between devices](../pages/guides/share-text-between-devices/body.html) | Expanded | Laptop-to-phone text/file handoff | Live workshop or support materials | Both ends present; private approval, awake tab and 200 MB/file |
| [split a gif into frames](../pages/guides/split-a-gif-into-frames/body.html) | Expanded | Still harvesting, video-editor frames and rebuild timing already covered. | Contact sheet and sprite-animation reference using built-in sheet download. | Visible vs stored frames; sheet canvas/512 MiB planning limits; ZIP timing list; no automatic resizing. |
| [stack photos to reduce noise](../pages/guides/stack-photos-to-reduce-noise/body.html) | Expanded | Static low-light burst and median landmark cleanup. | Focus-stacked jewellery/parts/specimens. | Stars vs foreground move differently; median needs background majority; no subject-motion repair; 8-bit output/RAW previews. |
| [trace an image into an svg](../pages/guides/trace-an-image-into-an-svg/body.html) | Expanded | Scanned logo/lettering and vinyl/stencil preparation. | Single-object photographic silhouette. | No editable text or restored multicolour original; no stencil bridges/cutter-width compensation; busy/soft edges may fail. |
| [trim a video](../pages/guides/trim-a-video/body.html) | Expanded | Keep excerpts, cut unwanted middle sections and compatible joins already covered. | Bug report and contextual interview excerpts; safe removal of private opening. | Copy retains hidden initial preroll and is not privacy removal; keyframe gate; exact method re-encodes; native playback check. |
| [trim an audio file](../pages/guides/trim-an-audio-file/body.html) | Expanded | Interview excerpts and removal of false starts already covered. | Clean voiceover takes and ordered rehearsal/language-practice excerpts. | One source at a time, WAV size/depth, no syllable recovery, full-result listening. |
| [turn a long video into a timelapse](../pages/guides/turn-a-long-video-into-a-timelapse/body.html) | Expanded | Sunset, building work and travel already covered. | Repair, drawing, painting and assembly progression. | Whole clip, no audio, sampling can miss brief events, edited timeline refusal, speed limit. |
| [turn a video into a gif](../pages/guides/turn-a-video-into-a-gif/body.html) | Expanded | Reaction GIFs, README/docs and image-only destinations already covered. | Bug reproduction and short software/craft instructions. | Memory planning and phone default, no audio, no crop/captions, destination-specific upload limits. |
| [turn images into a video](../pages/guides/turn-images-into-a-video/body.html) | Expanded | Event/photo slideshows with explicit seconds setting. | Stop motion, render sequences and regularly spaced project progress images. | One-frame default; frame vs seconds unit, hard cuts only, no soundtrack, 4 GB output/encoder limits. |
| [unlock a pdf](../pages/guides/unlock-a-pdf/body.html) | Expanded | Added own-statement printing with protection report, working password when needed and output checks. | Unlock a copier scan, edit/merge, and protect the completed packet. | No password recovery or certificate-key handling; rewrites invalidate signatures and do not grant rights. |
| [verify a file checksum](../pages/guides/verify-a-file-checksum/body.html) | Expanded | Added source-to-destination SHA-256 copy verification and batch-manifest row inspection. | Validate backup/release file selections before deleting source copies. | Basename ambiguity; hashes check bytes rather than publisher trust or malware; archives and extracted files differ. |
| [watch camera from another device](../pages/guides/watch-camera-from-another-device/body.html) | Already covered | Nursery, pets, entryways and DIY inspection | Under-sink and cable-routing inspection | Live video only, no audio, recording, alerts or remote relay; visible awake source |
| [watermark a pdf](../pages/guides/watermark-a-pdf/body.html) | Expanded | Recipient-specific copies already covered; added clean-original reload, page-shape and visibility checks. | Draft review copy or first-page-only cover label. | Removable image stamp; no access control/redaction; unstamped later pages with first-page-only; no page-rendered preview. |
| [what 20 converters do with your file](../pages/guides/what-20-converters-do-with-your-file/body.html) | Expanded | Converter selection for an exact feature | Repeatable team selection note and change check | Historical observations, not a current ranking or universal verdict |
| [what a pdf remembers](../pages/guides/what-a-pdf-remembers/body.html) | Expanded | CV/proposal/public-report distribution | Reusable specification or support example | Full rewrite is not comprehensive sanitisation; preserve signed original |
| [whats inside a dicom file](../pages/guides/whats-inside-a-dicom-file/body.html) | Expanded | Second-opinion transfer preparation | Teaching/research and minimal compatibility report | Viewer is read-only and cannot certify de-identification |
| [whats inside a gif](../pages/guides/whats-inside-a-gif/body.html) | Expanded | File size, delays, disposal, looping, metadata and damaged-file diagnosis already covered. | Actionable creator handoff report for large or incorrectly playing tutorial assets. | Read-only analysis/report; no repair, optimization or metadata removal. |

## Representative primary references

The article links are the maintained references for the claims they make. These
sources helped check the workflow families and changing destination rules:

- [MDN responsive images](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images)
  and [video poster images](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/poster).
- [YouTube thumbnail instructions](https://support.google.com/youtube/answer/72431?hl=en),
  checked on 13 October 2026. Recommendations and size limits depend on upload route.
- [UK passport photos](https://www.gov.uk/photos-for-passports),
  [Canadian passport photos](https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-passports/photos.html)
  and [US paper passport photos](https://travel.state.gov/en/passports/apply/help/photos.html).
- [Google Business Profile representation guidelines](https://support.google.com/business/answer/3038177?hl=en).
- [Intuit's CSV import guidance](https://quickbooks.intuit.com/learn-support/en-us/help-article/bank-transactions/format-csv-files-excel-bank-transactions-quickbooks/L4BjLWckq_US_en_US)
  and [CRA electronic record keeping](https://www.canada.ca/en/revenue-agency/services/forms-publications/publications/ic05-1/electronic-record-keeping.html).
- [DENSO QR margins](https://www.qrcode.com/en/howto/code.html),
  [RFC 8259 JSON](https://www.rfc-editor.org/rfc/rfc8259.html) and
  [YAML 1.2.2](https://yaml.org/spec/1.2.2/).
- [DICOM confidentiality profiles](https://dicom.nema.org/medical/dicom/current/output/chtml/part15/chapter_E.html).

## Verification

A clean build of the whole maintained site checks generated guide links and
metadata. Browser review covers representative image, PDF, JSON, video,
receipt and privacy articles, with a narrow-layout check. Before/after captures
belong to the pull request and are not committed as source files. The repository
test suites are left to CI, as required by the project's guide workflow.
