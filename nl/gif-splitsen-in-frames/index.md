# GIF splitsen — elk frame als eigen PNG

Elk frame eruit, als eigen PNG.

> Splits een geanimeerde GIF in losse frames en sla elk frame op als PNG, gratis en helemaal in je browser. Transparantie en timing blijven behouden. Er wordt niets geüpload en het werkt offline.

Deze pagina is een interactief hulpmiddel dat volledig in je browser draait, op https://abox.tools/nl/gif-splitsen-in-frames/ — niets van wat je het geeft wordt geüpload. Hieronder staat alles wat de pagina er in woorden over zegt; om het te gebruiken, open je het adres.

## Je GIF's worden **nooit geüpload**. Er is geen server.

De GIF wordt door je eigen browser gelezen, uitgepakt en getekend, en elke PNG wordt in het geheugen van dit apparaat gemaakt. Aan de andere kant van deze pagina zit geen server waar een animatie naartoe zou kunnen, ook al zou iets hier dat willen.

- ✗ Geen upload
- ✗ Geen account
- ✓ Werkt offline
- ✓ Open source
- ✓ Bestanden blijven op je apparaat

## Zo splits je een GIF in frames

1. **Kies de GIF.** Sleep hem op de kiezer of zoek hem met de hand op. De browser leest hem rechtstreeks van je schijf, en de pagina vertelt wat ze aantrof: het formaat, het aantal frames, hoe lang hij speelt en hoe vaak hij zich herhaalt.
2. **Bepaal wat er in elke PNG komt.** **Het frame zoals het eruitziet** is wat vrijwel iedereen wil: het hele plaatje op dat moment van de animatie. **Alleen de pixels die dat frame opslaat** is de lap die het bestand werkelijk bevat, op zijn eigen formaat en op zijn eigen plek. Daardoor blijft een GIF klein, en zo ziet de animatie er juist niet uit.
3. **Bepaal wat er met de transparantie gebeurt.** PNG houdt die vast, en dat is de eerlijke standaardkeuze. Vul hem met een kleur als de frames ergens heen gaan waar transparantie genegeerd wordt en het anders zwart wordt.
4. **Kies de frames die je wilt.** Standaard allemaal. “Elk tweede frame houden” dunt een lange opname uit, en de vinkjes in het raster gaan daar overheen. De nummering verandert nooit, dus frame 42 heet frame 42, hoe weinig van zijn buren je ook hebt bewaard.
5. **Download ze.** Eén frame tegelijk uit het raster, of allemaal als één ZIP zodat je één opslaanvraag krijgt in plaats van honderden. In de ZIP kan een `frames.txt` mee met hoe lang elk frame bleef staan, en dat is het enige wat een map vol PNG's niet uit zichzelf kan vertellen.

## De uitgebreide versie

[Een GIF splitsen in frames](https://abox.tools/nl/gidsen/een-gif-splitsen-in-frames/): Elk frame van een geanimeerde GIF als PNG: waarom sommige frames maar een klein lapje van het plaatje zijn, wat er met de transparantie gebeurt, en hoe je de timing bewaart om het weer in elkaar te zetten.

## Ook in de gereedschapskist

- [GIF-analyse](https://abox.tools/nl/gif-analyseren/): Frames, vertragingen, paletten, en waar elke byte heen ging.
- [Afbeeldingen naar video](https://abox.tools/nl/afbeeldingen-naar-video/): Maak van een map vol afbeeldingen een video.
- [Videoknipper](https://abox.tools/nl/video-knippen/): Markeer tijdens het afspelen wat het bewaren waard is. Krijg het terug als één video.
- [Videobijsnijder](https://abox.tools/nl/video-bijsnijden/): Snijd een filmpje terug tot het stuk waar het om gaat.

## Vragen

### Wordt mijn GIF ergens naartoe geüpload?

Nee. Het bestand wordt gelezen, uitgepakt en getekend door je eigen browser op je eigen hardware, en elke PNG wordt hier in het geheugen gemaakt. Deze tool heeft geen serverkant, en de `Content-Security-Policy` van de pagina noemt elk adres dat ze mag benaderen: geen daarvan is van ons. Trek de stekker eruit en hij splitst nog steeds GIF's.

### Waarom lijkt één frame op een klein stukje van het plaatje?

Omdat dat is wat er in het bestand staat. Een GIF is een eerste plaatje gevolgd door lappen: elk volgend frame slaat alleen de rechthoek op die veranderde, en al het andere op het scherm is wat de frames ervoor daar achterlieten. Een pratend hoofd voor een stilstaande muur slaat dus per frame een gezicht op in plaats van een plaatje, en dat is precies waarom het formaat niet enorm is. \
\
Je ziet dat omdat “Alleen de pixels die dat frame opslaat” aanstaat. Zet het op “Het frame zoals het eruitziet” en elke PNG is het hele plaatje zoals de animatie er op dat moment uitziet.

### Blijft de transparantie behouden?

Ja. Transparantie in een GIF is één bit, want een pixel is of geverfd of onzichtbaar en daartussen zit niets, en PNG slaat precies dat op. De frames komen er dus uit met hun transparante vlakken intact. Wil je liever een dichte achtergrond, zet “Transparante vlakken” dan op vullen met een kleur. Die wordt in de PNG geschreven en kan er daarna niet meer uit.

### Waarom kloppen de vertragingen niet met wat ik verwachtte?

Een GIF slaat elke vertraging op in honderdsten van een seconde, en browsers trekken sinds de jaren negentig alles onder twee honderdsten op naar een tiende seconde. Die regel is geschreven voor de draaiende wereldbollen van toen en is nooit meer weggehaald. Een frame waarvan het bestand 0,01 s zegt, wordt dus overal op 0,10 s afgespeeld. Deze tool laat de vertraging zien zoals hij echt gespeeld wordt, en zet ernaast wat het bestand opslaat als die twee verschillen.

### Kan ik de frames weer aan elkaar zetten?

Ja, met de [GIF-maker](https://abox.tools/nl/gif-maken/) op deze site of met alles wat een map met afbeeldingen aanneemt. Daar is de `frames.txt` in de ZIP voor: bij het splitsen gaat de timing verloren, want een PNG heeft nergens plek om vast te leggen hoe lang hij bleef staan, dus draagt die lijst de vertraging en de positie van elk frame mee naar buiten.

### In welke formaten kunnen de frames worden opgeslagen?

In PNG, en met opzet alleen in PNG. Een GIF-frame heeft hooguit 256 kleuren en één bit transparantie; PNG slaat dat precies en zonder verlies op, terwijl JPEG de transparantie zou weggooien, kleuren zou verzinnen die het frame nooit had, en van vlak werk meestal een *groter* bestand maakt. Heb je toch JPEG's nodig, zet de PNG's dan daarna om met de [Formaatwijzigingstool](https://abox.tools/nl/afbeelding-formaat-wijzigen/).

### Zit er een limiet op het aantal frames dat hij leest?

Er is geen vaste limiet. Het echte plafond is het geheugen van je eigen apparaat: tijdens het lezen groeit een GIF naar ongeveer één byte per pixel per frame, dus een klein bestand kan heel veel geheugen zijn, en deze pagina stopt liever met lezen dan het tabblad te laten sterven. Gebeurt dat, dan zegt ze het en geeft ze de frames terug die ze wel had.

### Opent hij ook een beschadigde GIF?

Meestal wel. Afgebroken downloads, een ontbrekende eindmarkering en een laatste frame dat midden in de stroom ophoudt komen allemaal veel voor, en een lezer die die weigert is nutteloos voor precies de bestanden die mensen het liefst uit elkaar willen halen. Alle frames die compleet zijn komen terug, met een briefje over wat er mis was. Alleen een bestand dat helemaal geen GIF is wordt meteen geweigerd.

### Is het gratis, en heb ik een account nodig?

Het is gratis, en er komt geen account, geen inlog en geen proefperiode aan te pas. Op de frames zit ook geen watermerk. De site draait op advertenties, en die betalen hem; die advertenties krijgen niets over je bestanden mee.

### Werkt het offline?

Ja. Laad de pagina één keer, verbreek daarna je internetverbinding en hij werkt gewoon door. Dat is meteen de eenvoudigste manier om te bewijzen dat er niets geüpload wordt, want een tool die je animatie wegstuurde om hem te verwerken zou ermee ophouden zodra je de stekker eruit trok.

## Hoe je de privacybelofte controleert

- **Je GIF kan nergens heen.** In de Content-Security-Policy staat elk adres dat deze pagina mag benaderen, en geen daarvan is van ons. Er is hier geen eindpunt waar je bestanden verzameld zouden kunnen worden, en er staat ook niets in de code dat ze daarheen zou sturen als dat er wel was. Hier stond ooit `connect-src 'none'`, en dat was absoluut. Advertenties hebben dat gekost, en dat erbij zeggen hoort bij de afspraak.
- **De GIF-lezer bestaat uit twee bestanden in deze repository.** Een browser speelt een GIF wel af, maar geeft je de onderdelen niet, dus wordt het formaat hier zelf gelezen: `src/gif.js` is de container en de LZW-uitpakker, `src/compose.js` zijn de opruimregels die bepalen hoe elk frame eruitziet als de frames ervoor eronder liggen. Er wordt niets opgehaald om een bestand te openen, en er komt geen engine binnen bij het eerste gebruik.
- **Wat Google laadt, en wat het niet te zien krijgt.** De advertentie- en meetscripts komen van Google. Geen van beide krijgt iets over je animatie mee: geen bestand, geen frame, geen naam, geen formaat en geen aantal. Elke regel die een plaatje leest, uitpakt, tekent of wegschrijft, wordt vanaf deze herkomst geserveerd en staat in de repository.
- **Wat de doneerknop laadt, en wat die niet te zien krijgt.** De knop “Buy me a coffee” in de kop wordt getekend door een script van cdnjs.buymeacoffee.com en haalt zijn letters bij Google Fonts. Het is niet meer dan een link: hij meldt geen bezoek en krijgt niets over jou of je bestanden mee. Er gebeurt niets zolang je er niet op klikt, en waar je dan op zou klikken is de site van iemand anders.
- **Het werkt offline.** Verbreek de verbinding en alles op deze pagina blijft werken. Eenvoudiger bewijs bestaat er niet: een tool die je animatie wegstuurde om hem uit elkaar te halen zou stoppen op het moment dat je de stekker eruit trok.

**Controleer het zelf.** Je hoeft niets van het bovenstaande op ons woord aan te nemen. Een buildscript maakt deze pagina uit de sjablonen en de configuratie in de repository, en dat script kun je lezen en zelf draaien. Het resultaat staat vastgelegd op de branch `dist`, dus je kunt wat er geserveerd wordt vergelijken met wat een build van de bronnen oplevert: https://github.com/A-Box-of-Tools/website

De bestanden die je als eerste wilt lezen zijn `config/site.toml` voor de Content-Security-Policy, `src/gif.js` voor de lezer die de frames uitpakt en `src/compose.js` voor de regels waarmee ze op elkaar worden gelegd. In geen van beide staat een regel die het netwerk zou kunnen bereiken.
