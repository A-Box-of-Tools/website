# Audio bewerken — omkeren, versnellen of versterken

Achterstevoren afspelen, de snelheid wijzigen, een zachte opname optillen. Alles hier, op je eigen apparaat.

> Speel een opname achterstevoren af, maak hem sneller of langzamer en zet een zachte opname harder. Haalt ook het geluid uit een video. Draait in je browser en uploadt niets.

Deze pagina is een interactief hulpmiddel dat volledig in je browser draait, op https://abox.tools/nl/audio-bewerken/ — niets van wat je het geeft wordt geüpload. Hieronder staat alles wat de pagina er in woorden over zegt; om het te gebruiken, open je het adres.

## Je opnames worden **nooit geüpload**. Er is geen server.

Je eigen browser leest, bewerkt en schrijft je bestand, op je eigen hardware. Niets hier kan iets ophalen of versturen, want er zit helemaal geen netwerkfunctie in deze tool. En al was die er wel, dan stond aan de andere kant van deze pagina nog steeds geen server om een opname naartoe te sturen.

- ✗ Geen upload
- ✗ Geen account
- ✗ Geen watermerk
- ✓ Video erin, audio eruit
- ✓ Werkt offline

## Zo bewerk je een audiobestand

1. **Kies een bestand.** Sleep een mp3, wav, flac, m4a, Ogg of Opus het vak in, of een video als het je om het geluid daaruit te doen is. De browser leest het rechtstreeks van je schijf, en er gaat ondertussen niets ergens heen.
2. **Draai hem om, als je daarvoor kwam.** Eén vinkje. De samples gaan er achterstevoren uit, en dat is precies omkeerbaar: doe het twee keer en je hebt het bestand terug waarmee je begon, sample voor sample.
3. **Zet de snelheid.** Sleep de schuif, tik een factor in of druk op een van de voorkeuzes. Kies daarna wat er met de toonhoogte gebeurt. Hou hem waar hij is, wat je wilt bij een college op 1,5×, of laat hem meebewegen met de snelheid, wat een bandje doet en wat een stem hoger of lager maakt.
4. **Zet het niveau.** Noem een verandering in decibel, of vraag of de opname opgetild mag worden tot het luidste moment net onder het plafond zit. De pagina zegt je waar dat moment gaat landen voordat je op iets drukt, en waarschuwt zodra de gekozen instelling het voorbij volle schaal zou duwen.
5. **Sla hem op.** Het werk gebeurt op je eigen hardware, dus hoe lang het duurt hangt van je apparaat af en niet van een wachtrij. Wat eruit komt is een wav, oftewel de samples zelf met een kop ervoor. Die wordt eerst op de pagina afgespeeld en gaat daarna rechtstreeks naar de downloads van je browser.

## De uitgebreide versie

[Zo schoon je een spraakmemo op vóór het versturen](https://abox.tools/nl/gidsen/spraakmemo-opschonen/): Knip de dode lucht en de valse starts weg, en breng dan het volume tot vlak onder vol uit. Twee browsergereedschappen op een rij, in de volgorde die de kwaliteit spaart, en de opname verlaat je machine nooit.

## Ook in de gereedschapskist

- [Pdf samenvoegen & splitsen](https://abox.tools/nl/pdf-samenvoegen/): Pagina's verschuiven zonder ritje naar een server.
- [Pdf-compressor](https://abox.tools/nl/pdf-verkleinen/): Een document laten krimpen zonder het ergens heen te sturen.
- [PDF onleesbaar maken](https://abox.tools/nl/pdf-onleesbaar-maken/): De letters worden uit het bestand gewist, en daarna wordt het bestand doorzocht om het te bewijzen.
- [Afbeeldingen naar pdf](https://abox.tools/nl/afbeeldingen-naar-pdf/): Zet je plaatjes in één document.

## Vragen

### Wordt mijn audio ergens heen geüpload?

Nee. Je eigen browser leest, bewerkt en schrijft hem op je eigen hardware. Deze tool heeft geen serverkant, en in de `Content-Security-Policy` van de pagina staat elk adres dat hij mag benaderen, waarvan er geen enkele bij deze site hoort. Controleer je het liever dan dat je het aanneemt, trek dan de stekker uit je internet en keer er alsnog een om.

### Kan ik het geluid uit een video halen?

Ja, en dat is hier dezelfde klus als een mp3 openen. Sleep een mp4, mov of WebM naar binnen en alleen het audiospoor wordt gedecodeerd. Het beeld wordt nooit gelezen, en wat eruit komt is een geluidsbestand zonder video erin. Is dat alles wat je wilt — het geluid, onveranderd —, dan doet [Audio uit video halen](https://abox.tools/nl/audio-uit-video-halen/) hetzelfde werk op een pagina waar verder niets op staat. Kom hier terug als het geluid ook nog bewerkt moet worden.

### Verandert de toonhoogte als ik de snelheid wijzig?

Alleen als je erom vraagt. “Hou de toonhoogte” knipt de opname in overlappende vensters van zo'n vijftig milliseconde en legt die dichter bij elkaar of verder uit elkaar terug. Elke plek wordt daarbij zo gekozen dat de golven op hun kruising uitlijnen, waardoor een stem op 1,5× dezelfde stem blijft. “Laat hem meebewegen” resampelt in plaats daarvan, precies zoals een bandje sneller afspelen doet: twee keer zo snel is exact een octaaf hoger.

### Waarom slaat hij een wav op en geen mp3?

Omdat geen enkele browser een mp3-encoder meelevert, en deze tool weigert je opname naar een server te sturen die er wel een heeft. Een wav heeft helemaal geen encoder nodig, want het zijn de samples met een kop van vierenveertig bytes ervoor. Daarmee is het zowel de eerlijke keuze als de enige die geen kwaliteit kan kosten. Groter is hij wel, ongeveer tien megabyte per minuut in stereo. Elke speler, telefoon en editor opent er een, en alles wat een mp3 wil kan er een van maken.

### Welke formaten kan ik openen?

Alles wat je browser decodeert, in de praktijk dus mp3, wav, flac, m4a en AAC, Ogg Vorbis en Opus, plus de audio in mp4-, m4v-, mov- en WebM-video. Wat wegvalt is hetzelfde korte lijstje als overal elders: avi, wma en de meeste mkv's. Een bestand dat deze browser niet wil lezen wordt geweigerd met een melding die dat zegt, in plaats van halverwege te stranden.

### Gaat het vervormen als ik het harder zet?

Alleen als je het voorbij volle schaal duwt, en de pagina zegt het je voordat je dat doet. Digitale audio heeft een hard plafond, want een sample kan niet harder dan volle schaal. Alles daarboven wordt tegen dat plafond platgeslagen, en zo klinkt vervorming. “Zo hard als het gaat” is de instelling die dat niet kán doen, want die rekent uit hoeveel ruimte de opname nog heeft en gebruikt precies zoveel. Alles onder het plafond is vermenigvuldigen en verder niets: zet hem 6 dB omhoog en weer 6 dB omlaag, en de samples staan waar ze begonnen.

### Kost omkeren of hertimen kwaliteit?

Omkeren niet, want dezelfde samples komen er in de andere volgorde uit en dat is exact. De snelheid wijzigen verschuift elke sample, dus dat is rekenen in plaats van kopiëren. De resampler filtert onderweg netjes, zodat versnellen hoge tonen niet terugvouwt als een metalige rinkel, en de vensters van de uitrekker worden gelegd waar de golven uitlijnen in plaats van waar het rekenwerk toevallig uitkwam. Geen van beide routes codeert iets opnieuw, want er is hier geen encoder om mee te hercoderen.

### Zit er een limiet op de lengte van het bestand?

In de tool zit geen limiet ingebouwd. Het praktische plafond is het geheugen. De hele opname wordt in één keer in deze pagina gedecodeerd, en een wav wordt in het geheugen opgebouwd voordat je hem downloadt, dus een uur stereo heeft iets minder dan een gigabyte werkruimte nodig. Een wav van vier gigabyte wordt ronduit geweigerd, omdat het grootteveld van het formaat er geen kan beschrijven.

### Is het gratis, en heb ik er een account voor nodig?

Het is gratis, en er komt geen account, geen inlog, geen proefperiode en geen watermerk aan te pas. De site draait op advertenties, en die betalen hem. Die advertenties krijgen niets over je opname mee.

## Hoe je de privacybelofte controleert

- **Je opnames kunnen nergens heen.** In de Content-Security-Policy staat elk adres dat deze pagina mag benaderen, en geen daarvan hoort bij deze site. Er is hier geen eindpunt waar je bestand verzameld zou kunnen worden, en in de code staat niets wat het zou versturen als dat eindpunt er wel was.
- **Niets hier haalt iets op.** Deze tool heeft helemaal geen netwerkfunctie: geen adres om te plakken, niets om te downloaden, geen engine die bij het eerste gebruik opgehaald wordt. Elke byte die je audio aanraakt, kwam bij het laden van de pagina van deze herkomst.
- **De decoder is die je al in je browser hebt.** Het bestand gaat naar `decodeAudioData`, dezelfde code die een nummer afspeelt in een `<audio>`-element. Er wordt hier niets meegeleverd om jouw formaat te lezen, en er wordt ook niets buiten deze pagina om gevraagd om het te lezen.
- **Het beeld van een video wordt nooit gedecodeerd.** Sleep je een video naar binnen, dan wordt alleen het audiospoor opgevraagd. De frames worden niet gelezen, niet gedecodeerd, niet getekend en niet bekeken. Er staat geen code op deze pagina die dat zou kunnen, en het bestand dat eruit komt bevat geluid en verder niets.
- **De samples worden opgeschreven, niet opnieuw gecodeerd.** Een wav is niets anders dan de samples die deze pagina uitrekende, met een kop ervoor. Er zit geen encoder in de lus die beslissingen over je opname neemt, en er is niets wat een upload genoemd zou kunnen worden waarop dat zou moeten gebeuren.
- **Wat Google laadt, en wat het niet te zien krijgt.** De advertentie- en meetscripts komen van Google. Geen van beide krijgt iets over je opname mee: geen bestand, geen sample, geen naam, geen grootte, geen lengte, en ook niet hoe hard hij was. Elke regel die leest, bewerkt en schrijft, wordt vanaf deze herkomst geserveerd en staat in de repository.
- **Wat de doneerknop laadt, en wat hij niet te zien krijgt.** De knop “Buy me a coffee” in de kop wordt getekend door een script van cdnjs.buymeacoffee.com en haalt zijn letters bij Google Fonts. Het is een link en verder niets. Hij meldt geen bezoek en krijgt niets over jou of je bestand mee.
- **Het werkt offline.** Verbreek de verbinding en alles op deze pagina doet het nog. Eenvoudiger bewijs bestaat er niet.

**Controleer het zelf.** Je hoeft niets van het bovenstaande op ons woord aan te nemen. Een buildscript maakt deze pagina uit de sjablonen en de configuratie in de repository, en dat script kun je lezen en zelf draaien. Het resultaat staat vastgelegd op de branch `dist`, dus je kunt wat er geserveerd wordt vergelijken met wat een build van de bronnen oplevert: https://github.com/A-Box-of-Tools/website

De bestanden die je als eerste wilt lezen zijn `config/site.toml` voor de Content-Security-Policy, `src/shared/audio-decode.js` voor de twintig regels die je bestand aan de eigen decoder van de browser geven, `src/stretch.js` voor het uitrekken in de tijd, `src/speed.js` voor de resampler, en `src/shared/wav.js` voor de kop die vóór de samples komt. Geen ervan importeert iets wat een verzoek kan doen.
