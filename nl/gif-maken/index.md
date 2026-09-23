# GIF maken — afbeeldingen tot geanimeerde GIF

Maak van een stel plaatjes één animatie.

> Maak van JPG-, PNG- of WebP-afbeeldingen een geanimeerde GIF, gratis en helemaal in je browser. Je bepaalt de volgorde, de snelheid en het formaat. Er wordt niets geüpload en het werkt offline.

Deze pagina is een interactief hulpmiddel dat volledig in je browser draait, op https://abox.tools/nl/gif-maken/ — niets van wat je het geeft wordt geüpload. Hieronder staat alles wat de pagina er in woorden over zegt; om het te gebruiken, open je het adres.

## Je afbeeldingen worden **nooit geüpload**. Er is geen server.

Elk frame wordt door je eigen browser getekend, gekwantiseerd en gecomprimeerd, en de klaargemaakte GIF wordt in het geheugen van dit apparaat opgebouwd. Aan de andere kant van deze pagina zit geen server waar een plaatje naartoe zou kunnen, ook al zou iets hier dat willen.

- ✗ Geen upload
- ✗ Geen account
- ✓ Werkt offline
- ✓ Open source
- ✓ Bestanden blijven op je apparaat

## Zo maak je een GIF van afbeeldingen

1. **Kies je afbeeldingen.** Sleep een map op de kiezer, of zoek de bestanden met de hand op. De browser leest ze rechtstreeks van je schijf, en er gaat ondertussen niets ergens heen.
2. **Zet ze in de volgorde waarin ze moeten spelen.** Sleep aan het handvat, of gebruik de pijltjes. “Sorteer op naam” telt zoals je verwacht, dus `frame_2` komt voor `frame_10`.
3. **Bepaal hoe lang elk frame blijft staan.** Een halve seconde per frame is een diavoorstelling; een twintigste is animatie. Geef alle frames in één keer dezelfde tijd, of laat er eentje langer hangen.
4. **Kies een formaat, en hoe de kleuren gekozen worden.** Een GIF groeit met zijn oppervlak en zijn aantal frames, en er is geen kwaliteitsschuif die dat weer terugbrengt, dus het formaat is de instelling die het meest uitmaakt. 256 kleuren per frame ziet er het best uit en is de standaard; één gedeeld palet is kleiner en rustiger.
5. **Maak de GIF en download hem.** Hij wordt op je eigen hardware gebouwd, dus hoe lang het duurt hangt af van je machine en niet van een wachtrij. De klaargemaakte animatie speelt op de pagina voordat je hem opslaat.

## De uitgebreide versie

[Van afbeeldingen een geanimeerde GIF maken](https://abox.tools/nl/gidsen/van-afbeeldingen-een-gif-maken/): Maak van een reeks plaatjes één geanimeerde GIF: hoe snel een GIF echt kan spelen, wat de palet-instelling verandert, en de drie dingen die het bestand werkelijk kleiner maken.

## Ook in de gereedschapskist

- [GIF-splitser](https://abox.tools/nl/gif-splitsen-in-frames/): Elk frame eruit, als eigen PNG.
- [GIF-analyse](https://abox.tools/nl/gif-analyseren/): Frames, vertragingen, paletten, en waar elke byte heen ging.
- [Afbeeldingen naar video](https://abox.tools/nl/afbeeldingen-naar-video/): Maak van een map vol afbeeldingen een video.
- [Videoknipper](https://abox.tools/nl/video-knippen/): Markeer tijdens het afspelen wat het bewaren waard is. Krijg het terug als één video.

## Vragen

### Worden mijn afbeeldingen ergens naartoe geüpload?

Nee. Je afbeeldingen worden gelezen, getekend, gekwantiseerd en gecomprimeerd door je eigen browser op je eigen hardware. Deze tool heeft geen serverkant, en de `Content-Security-Policy` van de pagina noemt elk adres dat ze mag benaderen: geen daarvan is van ons. Trek de stekker eruit en hij maakt nog steeds GIF's.

### Welke afbeeldingsformaten kan ik gebruiken?

Elk stilstaand-beeldformaat dat je browser kan decoderen, wat in de praktijk JPG, PNG, WebP, GIF, AVIF en, op Apple-apparaten, HEIC betekent. Er is hier geen aparte lijst die bijgehouden moet worden, want decoderen is het werk van de browser en niet van ons.

### Waarom is mijn GIF zo groot?

Omdat een GIF elk frame als hele pixels opslaat. Er is geen bewegingscompensatie, niets wordt opgeslagen als “hetzelfde als vorige keer maar verschoven”, en er is geen kwaliteitsknop: de grootte is ruwweg het oppervlak maal het aantal frames, en maar drie dingen brengen hem omlaag. \
\
Maak hem kleiner: het formaat halveren maakt het bestand een kwart. Gebruik minder frames, of laat elk frame langer staan. Ga naar 64 of 32 kleuren en zet dithering uit, wat bij vlak werk minder kost dan het klinkt en bij foto's heel veel. Past het dan nog niet, dan is het eerlijke antwoord dat wat je maakt een video is, en dat een MP4 daarvan misschien een tiende zo groot is.

### Hoe snel kan een GIF spelen?

Niet zo snel als het getal suggereert. Het formaat slaat de duur van elk frame op in honderdsten van een seconde, en browsers trekken sinds de jaren negentig alles onder twee honderdsten op naar een tiende seconde. Die regel is geschreven voor de draaiende wereldbollen van toen en is nooit meer weggehaald. Een duur van 0,01 s speelt dus niet op 100 frames per seconde, maar op 10. Daarom biedt deze tool je niets onder 0,02 s aan, en 0,05 s, oftewel 20 frames per seconde, is ongeveer het snelste wat de moeite waard is om te vragen.

### Wat verandert de paletinstelling?

Een GIF-frame bevat hooguit 256 kleuren, en iets moet die kiezen. \
\
**De beste kleuren voor elk frame** kiest er voor elk plaatje apart 256, wat er het scherpst uitziet en het juiste antwoord is voor een reeks losstaande foto's. **Eén palet voor de hele GIF** bouwt één tabel uit alle frames tegelijk. Dat geeft een kleiner bestand, en het haalt het flikkeren weg dat je krijgt als het palet tussen frames van dezelfde scène heen en weer schiet. Dat is dus wat je pakt als de frames een reeks zijn en geen verzameling.

### Kan ik een transparante achtergrond houden?

Ja, als je afbeeldingen die hebben: zet “Transparantie” op “Transparante vlakken houden”. Eén ding om te weten voordat je dat doet. Transparantie in een GIF is één bit, een pixel is onzichtbaar of helemaal geverfd en daartussen zit niets, dus geanti-aliasde randen, zachte schaduwen en alles wat vervaagt krijgen in plaats daarvan een harde rand. Gaat je animatie op een achtergrond waarvan je de kleur kent, dan ziet hij er beter uit als je hem op die kleur plaatslaat.

### Zit er een limiet op het aantal afbeeldingen?

Er zit geen limiet in de tool. Het echte plafond is het geheugen van je eigen apparaat en je geduld met het bestand dat eruit komt: de plaatjes worden een voor een gelezen, dus honderd frames gaat prima, maar honderd frames op 640 px is ook een enorme GIF. Zie hierboven, “Waarom is mijn GIF zo groot?”

### Is het gratis, en heb ik een account nodig?

Het is gratis, en er komt geen account, geen inlog en geen proefperiode aan te pas. Op het resultaat zit ook geen watermerk. De site draait op advertenties, en die betalen hem; die advertenties krijgen niets over je afbeeldingen mee.

### Werkt het offline?

Ja. Laad de pagina één keer, verbreek daarna je internetverbinding en hij werkt gewoon door. Dat is meteen de eenvoudigste manier om te bewijzen dat er niets geüpload wordt, want een tool die je afbeeldingen wegstuurde om ze te laten verwerken zou ermee ophouden zodra je de stekker eruit trok.

## Hoe je de privacybelofte controleert

- **Je afbeeldingen kunnen nergens heen.** In de Content-Security-Policy staat elk adres dat deze pagina mag benaderen, en geen daarvan is van ons. Er is hier geen eindpunt waar je bestanden verzameld zouden kunnen worden, en er staat ook niets in de code dat ze daarheen zou sturen als dat er wel was. Hier stond ooit `connect-src 'none'`, en dat was absoluut. Advertenties hebben dat gekost, en dat erbij zeggen hoort bij de afspraak.
- **De encoder bestaat uit vier bestanden in deze repository.** Een GIF heeft een kleurkwantiseerder en een LZW-compressor nodig, en de browser levert geen van beide, dus staan ze hier allebei uitgeschreven, in `src/quantize.js` en `src/lzw.js`, met de container in `src/gif.js`. Er wordt niets opgehaald om er een te maken, en er komt geen engine binnen bij het eerste gebruik.
- **Wat Google laadt, en wat het niet te zien krijgt.** De advertentie- en meetscripts komen van Google. Geen van beide krijgt iets over je afbeeldingen mee: geen bestand, geen miniatuur, geen naam, geen formaat en geen aantal. Elke regel die een afbeelding leest, decodeert, tekent of comprimeert, wordt vanaf deze herkomst geserveerd en staat in de repository.
- **Wat de doneerknop laadt, en wat die niet te zien krijgt.** De knop “Buy me a coffee” in de kop wordt getekend door een script van cdnjs.buymeacoffee.com en haalt zijn letters bij Google Fonts. Het is niet meer dan een link: hij meldt geen bezoek en krijgt niets over jou of je afbeeldingen mee. Er gebeurt niets zolang je er niet op klikt, en waar je dan op zou klikken is de site van iemand anders.
- **Het werkt offline.** Verbreek de verbinding en alles op deze pagina blijft werken. Eenvoudiger bewijs bestaat er niet: een tool die je plaatjes wegstuurde om er een GIF van te laten maken zou stoppen op het moment dat je de stekker eruit trok.

**Controleer het zelf.** Je hoeft niets van het bovenstaande op ons woord aan te nemen. Een buildscript maakt deze pagina uit de sjablonen en de configuratie in de repository, en dat script kun je lezen en zelf draaien. Het resultaat staat vastgelegd op de branch `dist`, dus je kunt wat er geserveerd wordt vergelijken met wat een build van de bronnen oplevert: https://github.com/A-Box-of-Tools/website

De bestanden die je als eerste wilt lezen zijn `config/site.toml` voor de Content-Security-Policy, `src/quantize.js` voor het palet waar elk frame naartoe wordt teruggebracht, en `src/lzw.js` en `src/gif.js` voor de compressor en het bestand waar hij in schrijft. In geen daarvan staat een regel die het netwerk zou kunnen bereiken.
