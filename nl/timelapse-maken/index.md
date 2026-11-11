# Timelapse maken — online een video versnellen

Een uur beeldmateriaal in twintig seconden.

> Maak van een lange video een timelapse: 10x, 60x of elke snelheid die je intypt. Draait in je browser, uploadt niets, zet er geen watermerk op en werkt offline.

Deze pagina is een interactief hulpmiddel dat volledig in je browser draait, op https://abox.tools/nl/timelapse-maken/ — niets van wat je het geeft wordt geüpload. Hieronder staat alles wat de pagina er in woorden over zegt; om het te gebruiken, open je het adres.

## Je video's worden **nooit geüpload**. Er is geen server.

Je eigen browser kiest, decodeert en hercodeert elk frame, op je eigen hardware. Niets hier kan iets ophalen of versturen, want er zit helemaal geen netwerkfunctie in deze tool. En al was die er wel, dan stond aan de andere kant van deze pagina nog steeds geen server om een video naartoe te sturen.

- ✗ Geen upload
- ✗ Geen account
- ✗ Geen watermerk
- ✓ Elke snelheid die je intypt
- ✓ Werkt offline

## Zo maak je een timelapse van een video

1. **Kies een video.** Sleep een mp4, mov, m4v of WebM op het keuzevak, of zoek er met de hand een op. De browser leest hem rechtstreeks van je schijf, en ondertussen gaat er niets weg.
2. **Zeg hoeveel sneller.** Druk op een van de snelheden of typ je eigen snelheid in. Wil je liever zeggen hoe lang het resultaat moet worden, bijvoorbeeld “pas dit in twintig seconden”, typ dat dan in, want dan volgt de snelheid daaruit.
3. **Controleer het interval.** De regel onder de snelheid zegt wat er echt gaat gebeuren: om de zoveel seconden van het origineel één frame. Dat is het getal dat je op een camera zou instellen, en het getal dat je het beste even naloopt voordat je begint.
4. **Maak hem en download hem.** Het werk gebeurt op je eigen hardware, dus hoe lang het duurt hangt af van je apparaat en niet van een wachtrij. De gereedgekomen video gaat rechtstreeks naar de downloads van je browser.

## De uitgebreide versie

[Zo maak je van een lange video een timelapse](https://abox.tools/nl/gidsen/lange-video-naar-timelapse/): Een uur beeld in een minuut die je uitkijkt: hoe je de snelheid kiest, waarom de einduur opgeven wint van rekenen, en wanneer het resultaat een GIF moet worden.

## Ook in de gereedschapskist

- [Framegrabber](https://abox.tools/nl/frame-uit-video-halen/): Een stilstaand beeld op volle kwaliteit, van elk moment.
- [Video naar gif](https://abox.tools/nl/video-naar-gif/): Kies het stuk, het formaat en de beeldsnelheid.
- [GIF-maker](https://abox.tools/nl/gif-maken/): Maak van een stel plaatjes één animatie.
- [GIF-splitser](https://abox.tools/nl/gif-splitsen-in-frames/): Elk frame eruit, als eigen PNG.

## Vragen

### Wordt mijn video ergens naartoe geüpload?

Nee. Je eigen browser leest hem, decodeert hem, kiest de frames en codeert ze, op je eigen hardware. Deze tool heeft geen serverkant, en in de `Content-Security-Policy` van de pagina staat elk adres dat ze mag benaderen — geen daarvan hoort bij deze site. Controleer je liever zelf dan dat je het aanneemt, trek dan de stekker uit je internet en maak alsnog een timelapse.

### Wat betekent die snelheid precies?

De verhouding tussen wat erin gaat en wat eruit komt. Op 60× wordt een uur beeldmateriaal een minuut, ongeacht de framerate waarmee je het afspeelt. Daaronder pakt de tool om de *snelheid ÷ framerate* seconden één frame: 60× op 30 frames per seconde is er één per twee seconden. De pagina laat dat interval zien voordat je begint, want dat is het getal dat zegt wat er echt gebeurt.

### Welke videoformaten kan ik versnellen?

Mp4, m4v en mov worden rechtstreeks gelezen, wat er ook in zit: H.264, HEVC, AV1 of VP9, zolang je browser die codec kan decoderen. Al het andere dat je browser kan afspelen, WebM voorop, wordt gelezen door de eigen speler van de browser naar elk moment te laten springen, en dat werkt bij elk formaat dat hij afspeelt. Een bestand dat de browser noch kan lezen noch kan afspelen — in de praktijk avi, wmv, flv en de meeste mkv's — wordt met een melding geweigerd in plaats van halverwege te stranden. Wat eruit komt is altijd een mp4.

### Waarom heeft de timelapse geen geluid?

Omdat er niets te bewaren valt. Geluid op dertig keer de snelheid is geen spraak en geen muziek meer maar een piepje, en het alternatief — de audio op de originele snelheid onder beeld dat er allang vandoor is — zou een ander filmpje zijn dan je vroeg. Het spoor gaat er dus af, en dat is meteen de belangrijkste reden waarom een uur video als een paar megabyte terugkomt. Wil je het geluid apart, dan bewaart de [Audiobewerker](https://abox.tools/nl/audio-bewerken/) het.

### Gaat dit sneller dan de hele video omzetten?

Veel sneller, en daarvoor wordt het bestand rechtstreeks gelezen. Een frame is alleen te decoderen door bij het keyframe ervoor te beginnen, maar nergens staat dat de frames ertussen bewaard moeten blijven. Een timelapse op 60× van een uur decodeert daardoor een paar duizend frames in plaats van honderdduizend. Het overzicht zegt precies hoeveel er gelezen worden voordat je op de knop drukt.

### Kost het kwaliteit?

De frames die bewaard blijven worden een tweede keer gecodeerd, en dat kost een beetje. Daar is niet omheen te komen, want het gereedgekomen filmpje toont ze op momenten waarvoor in het originele bestand niets gecodeerd was. Waar deze tool wél meer aan uitgeeft dan de andere videotools hier is de bitrate, en dat is met opzet: twee frames die twee seconden uit elkaar liggen hebben veel minder gemeen dan twee frames die een dertigste seconde uit elkaar liggen, dus een codec kan minder hergebruiken en een getal dat op gewoon beeldmateriaal is afgestemd zou blokkerig uitpakken.

### Zit er een grens aan de grootte of de lengte?

In de tool zit geen grens, en het bestand gaat ook niet in één keer het geheugen in: er worden alleen korte stukjes rond elk moment gelezen. De praktische bovengrens is de gereedgekomen timelapse, die in het geheugen wordt opgebouwd voordat je hem downloadt, en een timelapse is per definitie kort. Het overzicht laat vooraf zien hoe groot hij ongeveer wordt.

### Kan ik maar een stuk van het filmpje versnellen?

Hier niet. Deze tool pakt het hele filmpje, van het eerste frame tot het laatste. Knip het stuk dat je wilt er eerst uit met de [Videoknipper](https://abox.tools/nl/video-knippen/), die dat doet zonder ook maar één frame opnieuw te coderen, en versnel daarna wat daaruit komt.

### Is het gratis, en heb ik een account nodig?

Het is gratis, en er is geen account, geen inlog, geen proefperiode en geen watermerk. De site wordt betaald met advertenties, en die krijgen niets over je video mee.

## Hoe je de privacybelofte controleert

- **Je video's kunnen nergens heen.** In de Content-Security-Policy staat elk adres dat deze pagina mag benaderen, en geen daarvan hoort bij deze site. Er is hier geen eindpunt waar je bestand verzameld zou kunnen worden, en in de code staat niets wat het zou versturen als dat eindpunt er wel was.
- **Niets hier haalt iets op.** Deze tool heeft helemaal geen netwerkfunctie: geen adres om te plakken, niets om te downloaden, geen engine die bij het eerste gebruik opgehaald wordt. Elke byte die je video aanraakt, kwam bij het laden van de pagina van deze herkomst.
- **Het decoderen en coderen gebeuren allebei hier.** De frames gaan door WebCodecs in je eigen browser, of door dezelfde afspeelmotor die je het filmpje toch al zou tonen. Het gereedgekomen bestand wordt op dit apparaat in het geheugen opgebouwd en meteen aan een download doorgegeven.
- **Het grootste deel van het bestand wordt niet eens gelezen.** Een timelapse heeft om de zoveel seconden één frame nodig, dus leest de tool alleen het korte stukje bestand rond elk van die momenten en slaat de rest over. Dat is een keuze om het snel te houden en niet om de privacy, maar het is toch goed om te weten: zelfs hier, op je eigen apparaat, gaat het grootste deel van je video nooit open.
- **Wat Google laadt, en wat het niet te zien krijgt.** De advertentie- en meetscripts komen van Google. Geen van beide krijgt iets over je video mee: geen bestand, geen frame, geen naam, geen grootte en geen lengte. Elke regel die leest, decodeert, kiest of codeert, wordt vanaf deze herkomst geserveerd en staat in de repository.
- **Wat de doneerknop laadt, en wat hij niet te zien krijgt.** De knop “Buy me a coffee” in de kop wordt getekend door een script van cdnjs.buymeacoffee.com en haalt zijn letters bij Google Fonts. Het is een link en verder niets. Hij meldt geen bezoek en krijgt niets over jou of je video mee.
- **Het werkt offline.** Trek de stekker uit het netwerk en alles op deze pagina blijft gewoon werken. Een eenvoudiger bewijs bestaat er niet.

**Controleer het zelf.** Je hoeft niets van het bovenstaande op ons woord aan te nemen. Een buildscript maakt deze pagina uit de sjablonen en de configuratie in de repository, en dat script kun je lezen en zelf draaien. Het resultaat staat vastgelegd op de branch `dist`, dus je kunt wat er geserveerd wordt vergelijken met wat een build van de bronnen oplevert: https://github.com/A-Box-of-Tools/website

De bestanden die je als eerste wilt lezen zijn `config/site.toml` voor de Content-Security-Policy, `src/plan.js` voor de rekensom die bepaalt uit welk moment elk frame komt, en `src/decode.js` voor de lus die alleen de stukken van het bestand leest die die momenten nodig hebben. Geen van beide importeert iets wat een verzoek kan doen.
