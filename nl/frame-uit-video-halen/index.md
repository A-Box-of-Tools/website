# Frame uit video halen — een beeld uit een video opslaan

Een stilstaand beeld op volle kwaliteit, van elk moment.

> Sla elk frame van een MP4, MOV of WebM op als PNG of JPEG op volle grootte. Stap frame voor frame door de clip, of pak er om de zoveel seconden een. Draait in je browser: er wordt niets geüpload.

Deze pagina is een interactief hulpmiddel dat volledig in je browser draait, op https://abox.tools/nl/frame-uit-video-halen/ — niets van wat je het geeft wordt geüpload. Hieronder staat alles wat de pagina er in woorden over zegt; om het te gebruiken, open je het adres.

## Je video's worden **nooit geüpload**. Er is geen server.

De frames worden gevonden, gedecodeerd en getekend door je eigen browser, op je eigen hardware. Niets hier kan iets ophalen of versturen, want er zit helemaal geen netwerkfunctie in deze tool. En al was die er wel, dan zit er aan de andere kant van deze pagina nog steeds geen server waar een video naartoe kan.

- ✗ Geen upload
- ✗ Geen account
- ✗ Geen watermerk
- ✓ Volledige resolutie
- ✓ Werkt offline

## Zo haal je een frame uit een video

1. **Kies een video.** Sleep een MP4, MOV, M4V of WebM op de kiezer, of zoek er met de hand een op. De browser leest hem rechtstreeks van je schijf, en er gaat ondertussen niets ergens heen.
2. **Zoek het moment.** Speel hem af en stop waar je wilt, of sleep de schuif. Bij een MP4 gaat de schuif per stap precies één frame verder, dus er wordt niets afgerond tussen wat je ziet en wat je opslaat. De pijltjestoetsen stappen één frame tegelijk, en met `Shift` tien.
3. **Kies een formaat.** PNG bewaart het frame precies zoals het gedecodeerd is, en dat is wat “volle kwaliteit” hier betekent. JPEG en WebP zijn kleiner en zijn een tweede compressie bovenop die van de video zelf, wat prima is voor een voorbeeld en niet voor iets dat daarna nog bewerkt wordt.
4. **Pak er een, of pak een reeks.** Eén frame gaat rechtstreeks naar je downloads. “Om de N seconden” loopt de clip één keer door en neemt bij elke markering een beeld, handig voor contactvellen en miniaturen, en ze komen als één ZIP in plaats van honderd opslaanvragen.

## De uitgebreide versie

[Een frame uit een video opslaan als afbeelding](https://abox.tools/nl/gidsen/een-frame-uit-een-video-halen/): Haal een stilstaand beeld uit een video op de echte resolutie: waarom een schermafbeelding van een gepauzeerde speler niet hetzelfde plaatje is, in welk formaat je het bewaart, en hoe je precies op het frame belandt dat je bedoelde.

## Ook in de gereedschapskist

- [Video naar gif](https://abox.tools/nl/video-naar-gif/): Kies het stuk, het formaat en de beeldsnelheid.
- [GIF-maker](https://abox.tools/nl/gif-maken/): Maak van een stel plaatjes één animatie.
- [GIF-splitser](https://abox.tools/nl/gif-splitsen-in-frames/): Elk frame eruit, als eigen PNG.
- [GIF-analyse](https://abox.tools/nl/gif-analyseren/): Frames, vertragingen, paletten, en waar elke byte heen ging.

## Vragen

### Wordt mijn video ergens naartoe geüpload?

Nee. Hij wordt gelezen en gedecodeerd door je eigen browser op je eigen hardware. Deze tool heeft geen serverkant, en de `Content-Security-Policy` van de pagina noemt elk adres dat ze mag benaderen: geen daarvan is van ons. Wil je het liever controleren dan aannemen, trek dan de stekker uit je internet en pak alsnog een frame.

### Wat betekent “volle kwaliteit” nu eigenlijk?

Twee dingen. Het beeld wordt opgeslagen in de resolutie van de video zelf, niet op de grootte van het voorbeeld op de pagina: een 4K-clip geeft een plaatje van ⁦3840 x 2160⁩. En met PNG gekozen wordt het frame opgeslagen precies zoals het uit de decoder kwam, dus het bestand bevat het beeld dat de video bevat, zonder een tweede ronde compressie eroverheen. Een schermafdruk van een spelervenster geeft je geen van beide: die heeft de grootte van het venster en wordt genomen nadat de speler hem geschaald en kleurbeheerd heeft.

### Uit welke videoformaten kan ik een frame halen?

MP4, M4V en MOV worden rechtstreeks gelezen, wat er ook in zit: H.264, HEVC, AV1 of VP9, zolang je browser die codec kan decoderen. Dat is het exacte pad, waarop de tool afzonderlijke frames kan aanwijzen. Al het andere dat je browser kan afspelen, WebM voorop, wordt afgehandeld door de speler naar het moment te sturen en te tekenen wat hij toont. Dat levert nog steeds een plaatje op volle grootte op, maar landt op het frame dat de speler koos in plaats van op het frame dat jij vroeg. Een bestand dat de browser niet kan lezen én niet kan afspelen, in de praktijk AVI, WMV, FLV en de meeste MKV's, wordt geweigerd met een bericht dat dat zegt.

### Kan ik één frame tegelijk stappen?

Bij een MP4 ja, en precies: de tool leest de eigen framelijst van het bestand, dus de pijltjestoetsen bewegen tussen de beelden die er echt in zitten, ook bij een clip waarvan de beeldsnelheid zwabbert en een vaste stap van een dertigste seconde zou weglopen. Op het afspeelpad bestaat zo'n lijst niet, dus is een stap een duwtje van ongeveer één frame, en de pagina zegt dat erbij.

### Waarom staat mijn staande telefoonvideo hier wel rechtop?

Omdat de draaiing met opzet is toegepast. Een telefoon filmt liggend en schrijft een kwartslag in het bestand in plaats van de pixels te draaien, dus het frame dat een decoder afgeeft ligt op zijn kant en elke speler draait het onderweg naar je scherm. Een tool die die stap overslaat slaat een geloofwaardig plaatje van het goede moment op, maar dan liggend. Deze leest de draaiing van het spoor af en past hem toe voordat er iets getekend wordt.

### Zit er een limiet op de grootte of de lengte van de video?

Er zit geen limiet in de tool, en het bestand wordt niet in één keer in het geheugen gelezen: het wordt een paar megabyte tegelijk doorlopen, en daarom opent een lange clip net zo snel als een korte. De beelden die je pakt blijven in de pagina tot je ze downloadt, dus het echte plafond is een paar honderd 4K-PNG's en niet de video zelf.

### Kan ik het beeld daarna verkleinen of bijsnijden?

Hier niet, maar hiernaast wel. Deze tool slaat het frame op zoals het is; de grootte of de vorm veranderen is een aparte klus met eigen keuzes erin, en de [Formaatwijzigingstool](https://abox.tools/nl/afbeelding-formaat-wijzigen/) doet allebei, ook zonder iets te uploaden. Het bestand kleiner maken zonder het beeld te veranderen doet de [Afbeeldingscompressor](https://abox.tools/nl/afbeelding-comprimeren/).

### Is het gratis, en heb ik een account nodig?

Het is gratis, en er komt geen account, geen inlog, geen proefperiode en geen watermerk aan te pas. De site draait op advertenties, en die betalen hem; die advertenties krijgen niets over je video mee.

## Hoe je de privacybelofte controleert

- **Je video's kunnen nergens heen.** In de Content-Security-Policy staat elk adres dat deze pagina mag benaderen, en geen daarvan is van ons. Er is hier geen eindpunt waar je bestand verzameld zou kunnen worden, en er staat ook niets in de code dat het daarheen zou sturen als dat er wel was.
- **Niets hier haalt iets op.** Deze tool heeft helemaal geen netwerkfunctie: geen adres om te plakken, niets om te downloaden, geen engine die bij het eerste gebruik binnenkomt. Elke byte die je video aanraakt kwam van deze herkomst toen de pagina laadde.
- **Het decoderen gebeurt lokaal.** De frames gaan door WebCodecs in je eigen browser, of door dezelfde afspeelmotor die je de clip toch al zou laten zien. Het beeld wordt op een canvas op dit apparaat getekend en gaat rechtstreeks naar een download.
- **Het bestand wordt een paar megabyte tegelijk gelezen.** Een video is het enige soort bestand hier dat niet betrouwbaar in het geheugen past, dus het wordt nooit in zijn geheel geladen. De lezer pakt een venster rond het frame dat je vroeg, en daarom opent een clip van twee gigabyte net zo snel als een kleine.
- **Wat Google laadt, en wat het niet te zien krijgt.** De advertentie- en meetscripts komen van Google. Geen van beide krijgt iets over je video mee: geen bestand, geen frame, geen naam, geen grootte, geen lengte en niet het moment waarop je stopte. Elke regel die leest, decodeert of tekent wordt vanaf deze herkomst geserveerd en staat in de repository.
- **Wat de doneerknop laadt, en wat die niet te zien krijgt.** De knop “Buy me a coffee” in de kop wordt getekend door een script van cdnjs.buymeacoffee.com en haalt zijn letters bij Google Fonts. Het is niet meer dan een link: hij meldt geen bezoek en krijgt niets over jou of je video mee.
- **Het werkt offline.** Verbreek de verbinding en alles op deze pagina blijft werken. Eenvoudiger bewijs bestaat er niet.

**Controleer het zelf.** Je hoeft niets van het bovenstaande op ons woord aan te nemen. Een buildscript maakt deze pagina uit de sjablonen en de configuratie in de repository, en dat script kun je lezen en zelf draaien. Het resultaat staat vastgelegd op de branch `dist`, dus je kunt wat er geserveerd wordt vergelijken met wat een build van de bronnen oplevert: https://github.com/A-Box-of-Tools/website

De bestanden die je als eerste wilt lezen zijn `config/site.toml` voor de Content-Security-Policy, `src/shared/mp4-reader.js` voor de lezer die de frames in een MP4 vindt, en `src/frames.js` voor het deel dat het gevraagde frame decodeert. Geen van beide importeert iets dat een verzoek kan doen.
