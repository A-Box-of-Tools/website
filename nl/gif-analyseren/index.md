# GIF analyseren — wat er echt in een GIF zit

Frames, vertragingen, paletten, en waar elke byte heen ging.

> Haal een GIF uit elkaar in je browser: elk frame met zijn vertraging en opruimregel, de kleurtabellen, het aantal herhalingen en een byte-voor-byte overzicht van waar de bestandsgrootte heen ging. Er wordt niets geüpload.

Deze pagina is een interactief hulpmiddel dat volledig in je browser draait, op https://abox.tools/nl/gif-analyseren/ — niets van wat je het geeft wordt geüpload. Hieronder staat alles wat de pagina er in woorden over zegt; om het te gebruiken, open je het adres.

## Je GIF's worden **nooit geüpload**. Er is geen server.

Het bestand wordt door je eigen browser geopend en uit elkaar gehaald: de blokstructuur, het uitpakken van de LZW-compressie en elk frame dat op deze pagina getekend wordt, gebeuren op dit apparaat. Aan de andere kant van deze pagina zit geen server waar een bestand naartoe zou kunnen, ook al zou iets hier dat willen.

- ✗ Geen upload
- ✗ Geen account
- ✓ Werkt offline
- ✓ Open source
- ✓ Bestanden blijven op je apparaat

## Zo analyseer je een GIF

1. **Kies een GIF.** Sleep hem op de kiezer of zoek hem met de hand op. De browser leest hem rechtstreeks van je schijf, en er gaat ondertussen niets ergens heen.
2. **Lees eerst de samenvatting.** De canvasgrootte, het aantal frames, hoe lang de animatie zegt te duren en hoe lang hij werkelijk speelt. Die laatste twee lopen vaker uiteen dan mensen verwachten, en de reden staat in de volgende sectie.
3. **Kijk naar wat eruit springt.** Elke regel daar is aan jouw bestand gemeten: vertragingen die geen enkele browser aanhoudt, een ontbrekend herhalingsblok, kleurtabellen waar niets naar verwijst, metadata die groter is dan sommige frames. Niets ervan is een gok naar wat je bedoeld had.
4. **Zie waar de bytes heen gingen.** Elke byte van het bestand staat in precies één rij, en de rijen zijn samen het bestand. Zit het meeste niet in “gecomprimeerde pixels”, dan zegt de rest van de tabel waar het wel zit.
5. **Loop de frames langs.** Elk frame toont zijn vertraging, zijn rechthoek, zijn opruimregel en zijn grootte. Wissel tussen “het canvas na elk frame” en “alleen wat elk frame opslaat”. Met het tweede zie je of het bestand geoptimaliseerd is, want een goed gemaakte GIF slaat minuscule rechthoekjes op en een slecht gemaakte elke keer het hele plaatje.
6. **Neem het rapport mee als je het nodig hebt.** De hele analyse als platte tekst, om in een bericht te plakken of naast het bestand te bewaren. Het wordt in de pagina opgebouwd uit wat al op je scherm staat.

## De uitgebreide versie

[Wat er werkelijk in een GIF zit](https://abox.tools/nl/gidsen/wat-zit-er-in-een-gif/): Frames, vertragingen, opruimmethoden en kleurtabellen uitgelegd, waarom browsers de snelste vertragingen weigeren, en hoe je uitzoekt waar de bestandsgrootte van een GIF echt heen is.

## Ook in de gereedschapskist

- [Afbeeldingen naar video](https://abox.tools/nl/afbeeldingen-naar-video/): Maak van een map vol afbeeldingen een video.
- [Videoknipper](https://abox.tools/nl/video-knippen/): Markeer tijdens het afspelen wat het bewaren waard is. Krijg het terug als één video.
- [Videobijsnijder](https://abox.tools/nl/video-bijsnijden/): Snijd een filmpje terug tot het stuk waar het om gaat.
- [Video-omkeerder](https://abox.tools/nl/video-achteruit-afspelen/): Laatste frame eerst, geluid en al.

## Vragen

### Wordt mijn GIF ergens naartoe geüpload?

Nee. Het bestand wordt gelezen, uitgepakt en getekend door je eigen browser op je eigen hardware. Deze tool heeft geen serverkant, en de `Content-Security-Policy` van de pagina noemt elk adres dat ze mag benaderen: geen daarvan is van ons. Trek de stekker eruit en hij analyseert nog steeds GIF's.

### Waarom speelt mijn GIF trager af dan de vertragingen zeggen?

Omdat elke browser weigert een vertraging onder twee honderdsten van een seconde aan te houden en het frame in plaats daarvan een tiende laat staan. De regel is in 1996 in Netscape geschreven, voor de draaiende wereldbollen en bordjes met “in aanbouw” van toen, en is sindsdien in elke browser overgenomen; niemand heeft hem ooit weggehaald. \
\
Een GIF waarvan alle frames 0,01 s zeggen, speelt dus niet op 100 frames per seconde. Hij speelt op 10, vijf tot tien keer trager dan wat de maker ervan bedoelde. Deze pagina laat beide getallen zien, wat het bestand zegt en wat het echt gaat doen, en markeert de frames die het treft. De oplossing zit in het programma dat het bestand maakte: schrijf 0,02 in plaats van 0,01.

### Wat betekent “opruimen”?

Wat er op het scherm blijft staan als de tijd van een frame om is, en het is het veld dat bepaalt of een animatie er goed uitziet of uitsmeert. \
\
**Laten staan** betekent dat het volgende frame eroverheen schildert, en dat wil je als frames dekkend zijn en elkaar bedekken. **Terug naar de achtergrond** veegt eerst de rechthoek van het frame schoon, en dat heeft transparantie nodig: zonder dat laten de doorzichtige stukken van het volgende frame het vorige eronder zien. **Herstellen wat eronder zat** zet terug wat er stond voordat dit frame tekende, en zo wordt een klein bewegend voorwerp op een stilstaande achtergrond opgeslagen. En **niet opgegeven** betekent dat het bestand niets zei, en elke viewer behandelt dat als “laten staan”.

### Waarom is mijn GIF zo groot?

De tabel “Waar de bytes heen gingen” beantwoordt dat voor jouw bestand in plaats van in het algemeen, en er zijn maar een paar mogelijke antwoorden. \
\
Zit bijna alles in **gecomprimeerde pixels**, dan is het bestand eenvoudigweg veel plaatje: een GIF slaat elk frame op als hele pixels, zonder bewegingscompensatie en zonder kwaliteitsknop, dus de grootte is ruwweg de oppervlakte maal het aantal frames. Minder frames, een kleiner formaat of minder kleuren zijn de enige knoppen. \
\
Zit een grote plak in **kleurtabellen**, dan schrijft het bestand een palet per frame van 768 bytes per stuk. Zit een grote plak in **metadata**, dan heeft een bewerkingsprogramma een XMP-pakket achtergelaten, en dat kan eruit zonder het plaatje aan te raken. En als alle frames het hele canvas beslaan, heeft de encoder nooit uitgezocht welk deel er echt veranderde, en bij alles wat gefilmd of opgenomen is, is dat het grootste deel van het bestand.

### Wat is het verschil tussen de twee frameweergaven?

**Het canvas na elk frame** is wat een viewer op dat moment laat zien: dit frame getekend bovenop wat de frames ervoor achterlieten. **Alleen wat elk frame opslaat** is de rechthoek die het bestand werkelijk voor dat frame bevat, op zichzelf, met niets eronder. \
\
De tweede is de interessante. Een GIF mag van een frame alleen het veranderde deel opslaan, en daarom kan een schermopname van een vrijwel stilstaand venster klein zijn. Is elk frame in jouw bestand het volledige canvas, dan heeft niemand dat werk gedaan, en aan de animatie zie je dat niet: alleen aan wat er opgeslagen is.

### Er staat dat mijn bestand een opmerking of XMP bevat. Wat is dat?

Tekst die met het plaatje meereist en die geen enkele viewer tekent. Een opmerkingenblok is meestal de naam van het programma dat het bestand schreef. Een XMP-pakket is de XML die een fotobewerker schrijft om vast te leggen wat hij deed, en dat kan de bewerkingsgeschiedenis, de programmaversie en soms de naam van de maker bevatten. \
\
Deze pagina drukt beide volledig af, want de interessante vraag bij metadata is wat erin staat, niet dat het er is. Jij krijgt het te zien en verder niemand: niets in deze repository leest er iets van aan wie dan ook voor.

### Kan hij een kapotte GIF openen?

Hij probeert het, en vertelt waar hij het opgaf. Een bestand dat midden in een blok ophoudt, dat een byte heeft waar een blokmarkering hoort, of dat een frame draagt waarvan de gecomprimeerde data te vroeg opraakt, laat nog steeds alles zien wat tot dat punt leesbaar was, met het probleem bovenaan benoemd. Dat is precies het geval waarvoor je een analyse het hardst wilt, dus het hele bestand weggooien om één slechte byte zou verkeerd zijn.

### Verandert hij mijn bestand?

Nee. Deze tool leest alleen. Er is geen uitvoerbestand, geen hercodering en geen knop hier die een GIF schrijft: het enige wat je kunt downloaden is een kopie van de analyse als platte tekst. Je origineel ligt onaangeroerd op je schijf, wat meteen het eerlijke antwoord is op de vraag wat er gebeurt als je het tabblad sluit.

### Is het gratis, en heb ik een account nodig?

Het is gratis, en er komt geen account, geen inlog en geen proefperiode aan te pas. Er zit geen limiet op de bestandsgrootte behalve het geheugen van je eigen apparaat. De site draait op advertenties, en die betalen hem; die advertenties krijgen niets over je bestand mee.

### Werkt het offline?

Ja. Laad de pagina één keer, verbreek daarna je internetverbinding en hij werkt gewoon door. Dat is meteen de eenvoudigste manier om te bewijzen dat er niets geüpload wordt, want een tool die je GIF wegstuurde om hem te laten analyseren zou ermee ophouden zodra je de stekker eruit trok.

## Hoe je de privacybelofte controleert

- **Je GIF kan nergens heen.** In de Content-Security-Policy staat elk adres dat deze pagina mag benaderen, en geen daarvan is van ons. Er is hier geen eindpunt waar je bestand verzameld zou kunnen worden, en er staat ook niets in de code dat het daarheen zou sturen als dat er wel was. Hier stond ooit `connect-src 'none'`, en dat was absoluut. Advertenties hebben dat gekost, en dat erbij zeggen hoort bij de afspraak.
- **De lezer bestaat uit vier bestanden in deze repository.** Niets hier gebruikt de eigen GIF-decoder van de browser om uit te zoeken wat er in het bestand zit, want die decoder vertelt niet waar een byte heen ging. Dus wordt het formaat met de hand gelezen: `src/gif.js` loopt de blokken langs, `src/lzw.js` pakt de pixels uit, `src/frames.js` stapelt ze en `src/budget.js` telt de onderdelen weer op en controleert of ze samen de grootte van het bestand zijn.
- **Opmerkingen en metadata krijg jij te zien, en verder niemand.** Een GIF kan een opmerkingenblok bevatten, een XMP-pakket dat een bewerking beschrijft, of een kleurprofiel, en deze pagina drukt ze allemaal af. Ze komen op het scherm voor je neus te staan en gaan verder nergens heen: er is in deze repository geen enkel analytics-event dat er iets van meedraagt, en de pagina zou het niet kunnen versturen als dat er wel was.
- **Wat Google laadt, en wat het niet te zien krijgt.** De advertentie- en meetscripts komen van Google. Geen van beide krijgt iets over je bestand mee: niet het bestand, geen miniatuur, geen naam, geen grootte, geen aantal frames en geen opmerking. Elke regel die een GIF leest, uitpakt of tekent, wordt vanaf deze herkomst geserveerd en staat in de repository.
- **Wat de doneerknop laadt, en wat die niet te zien krijgt.** De knop “Buy me a coffee” in de kop wordt getekend door een script van cdnjs.buymeacoffee.com en haalt zijn letters bij Google Fonts. Het is niet meer dan een link: hij meldt geen bezoek en krijgt niets over jou of je bestanden mee. Er gebeurt niets zolang je er niet op klikt, en waar je dan op zou klikken is de site van iemand anders.
- **Het werkt offline.** Verbreek de verbinding en alles op deze pagina blijft werken. Eenvoudiger bewijs bestaat er niet: een tool die je GIF wegstuurde om hem te laten analyseren zou stoppen op het moment dat je de stekker eruit trok.

**Controleer het zelf.** Je hoeft niets van het bovenstaande op ons woord aan te nemen. Een buildscript maakt deze pagina uit de sjablonen en de configuratie in de repository, en dat script kun je lezen en zelf draaien. Het resultaat staat vastgelegd op de branch `dist`, dus je kunt wat er geserveerd wordt vergelijken met wat een build van de bronnen oplevert: https://github.com/A-Box-of-Tools/website

De bestanden die je als eerste wilt lezen zijn `config/site.toml` voor de Content-Security-Policy, `src/gif.js` voor de bloklezer die het bestand doorloopt, `src/lzw.js` voor het uitpakken en `src/budget.js` voor de byteboekhouding. In geen daarvan staat een regel die het netwerk zou kunnen bereiken.
