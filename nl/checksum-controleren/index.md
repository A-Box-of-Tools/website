# Hash en checksum — MD5, SHA-1, SHA-256, SHA-512

Controleer een download tegen het getal dat de maker erbij zette, zonder hem naar iemand te sturen.

> Bereken de MD5, SHA-1, SHA-256, SHA-384 of SHA-512 van elk bestand en vergelijk die met de checksum op de downloadpagina. Het bestand wordt in je browser gelezen en nooit geüpload, hoe groot het ook is.

Deze pagina is een interactief hulpmiddel dat volledig in je browser draait, op https://abox.tools/nl/checksum-controleren/ — niets van wat je het geeft wordt geüpload. Hieronder staat alles wat de pagina er in woorden over zegt; om het te gebruiken, open je het adres.

## Je bestanden worden **nooit geüpload**. Er is geen server.

Een checksum is rekenwerk over de bytes van je bestand, en dat rekenwerk gebeurt hier, op deze pagina, met de processor van dit apparaat. Het bestand wordt in stukken van vier megabyte van je schijf gelezen en elk stuk gaat weg zodra het meegeteld is, dus er ontstaat nergens een hele kopie: niet in het geheugen en al helemaal niet op een server. Aan de andere kant van deze pagina zit geen server om een bestand naartoe te sturen, ook niet als iets hier dat zou willen.

- ✗ Geen upload
- ✗ Geen maximum
- ✓ Werkt offline
- ✓ Open source
- ✓ Bestanden blijven op je apparaat

## Zo controleer je een download tegen zijn checksum

1. **Kies het bestand.** Sleep het op het vak of kies het met de hand. Het wordt in stukken rechtstreeks van je schijf gelezen; er gaat ondertussen niets ergens heen, en er is geen grootte waarbij de pagina het opgeeft.
2. **Laat het lezen.** MD5 en SHA-256 worden standaard berekend, in één keer doorlezen. De balk laat zien hoe ver het is en hoe snel het gaat. Een grote schijfkopie duurt ongeveer zo lang als kopiëren zou duren, want het is evenveel leeswerk.
3. **Plak wat eruit hoort te komen.** Wat de downloadpagina je gaf, in welke vorm dan ook: kale hex, een regel uitvoer van `sha256sum`, een heel `SHA256SUMS`-bestand, of het `integrity`-attribuut van een scripttag. Welk algoritme het is volgt uit de lengte, en het juiste vakje vinkt zichzelf aan.
4. **Lees het antwoord, niet de kleur.** De pagina zegt in één zin of dit het bestand is dat die checksum beschrijft. Klopt het, dan zijn de bytes gelijk aan die welke de maker heeft gemeten. Klopt het niet, dan zijn ze dat niet, en dan haal je de download beter opnieuw op voordat je hem opent.
5. **Neem de checksums mee als je ze nodig hebt.** Kopieer er één, kopieer ze allemaal, of bewaar ze als klein tekstbestand, in de vorm met het algoritme ervoor die de opdrachtregelprogramma's ook schrijven. Zo reist de naam van het algoritme met het getal mee.

## De uitgebreide versie

[Zo controleer je een download tegen zijn checksum](https://abox.tools/nl/gidsen/de-checksum-van-een-download-controleren/): Hoe je een MD5- of SHA-256-checksum vergelijkt op Windows, macOS en Linux of in je browser, wat een treffer werkelijk bewijst, en de fout waardoor de hele exercitie niets meer voorstelt.

## Ook in de gereedschapskist

- [Wachtwoord- & wachtwoordzingenerator](https://abox.tools/nl/wachtwoord-generator/): Hier gemaakt, door je eigen browser, en nergens naartoe gestuurd. Er wordt niets opgeslagen en er is geen geschiedenis.
- [JSON-formatter](https://abox.tools/nl/json-formatteren/): JSON, XML, HTML, CSS en YAML, geformatteerd of omgezet. Er wordt niets in andermans server geplakt.
- [YAML-naar-JSON-omzetter](https://abox.tools/nl/yaml-naar-json-omzetten/): Beide richtingen, en het zegt wat elke richting kost. Niets ervan wordt in de server van iemand anders geplakt.
- [XML-formatter](https://abox.tools/nl/xml-formatteren/): XML uitgelegd om te lezen of plat geperst om te versturen, en beide kanten op omgezet naar JSON. Niets ervan wordt in de server van iemand anders geplakt.

## Vragen

### Wordt mijn bestand ergens geüpload?

Nee. Je eigen browser leest het van je schijf en je eigen processor rekent eraan, in stukken van vier megabyte. Dit gereedschap heeft geen serverkant, en de `Content-Security-Policy` van de pagina noemt elk adres dat ze mag benaderen: geen daarvan is van ons. Verbreek de verbinding en het blijft werken.

### Is er een maximum aan de bestandsgrootte?

Nee. Het bestand staat nergens in zijn geheel: het wordt in stukken gelezen en elk stuk wordt meegeteld en weggegooid, dus een schijfkopie van veertig gigabyte gebruikt net zo weinig geheugen als een tekstbestand. Wat het kost is tijd, en de pagina zegt onderweg hoeveel. \
\
Dat is ook de reden dat de algoritmes hier uitgeschreven staan in plaats van dat ze aan `crypto.subtle.digest` van de browser worden gegeven, wat sneller zou zijn. Die aanroep neemt het hele bericht in één buffer aan en er is geen manier om hem een bestand in stukken te voeren, dus dan had de grootste controleerbare bestandsgrootte afgehangen van hoeveel geheugen dit tabblad toevallig krijgt. Op een telefoon is dat een paar honderd megabyte, en wat mensen het liefst controleren zijn schijfkopieën.

### De checksum klopt. Wat is daarmee precies bewezen?

Dat de bytes op je schijf dezelfde zijn als die iemand voor zich had toen hij dat getal opschreef. Meer niet, en over de grenzen daarvan is het de moeite waard precies te zijn. \
\
Bewezen is dat de download niet halverwege is afgebroken, niet door een stervende schijf is aangetast en onderweg niet is verwisseld. **Niet** bewezen is dat het bestand ongevaarlijk is, want een maker kan malware net zo nauwkeurig meten als al het andere. En er is heel weinig bewezen als de checksum van dezelfde pagina en over dezelfde verbinding kwam als het bestand: wie het ene kon veranderen, kon het andere ook veranderen. Een checksum is het meest waard als hij je langs een andere weg bereikt: een ondertekend `SHA256SUMS`-bestand, de release-aankondiging van een distributie, een tweede mirror, of een pakketbeheerder die hem al kent.

### Hij klopt niet. Wat nu?

Haal het bestand eerst opnieuw op, van dezelfde plek. Een afgebroken of hervatte overdracht is verreweg de meest voorkomende oorzaak, en een tweede kopie lost het meestal op. \
\
Geeft die tweede kopie hetzelfde verkeerde antwoord, kijk dan of je met de juiste regel vergelijkt: releasepagina's noemen meerdere bestanden, en de checksum van de ARM-build zal nooit kloppen met die van de x86-build. Controleer daarna het versienummer. Klopt dat allemaal en klopt de checksum nog steeds niet, open het bestand dan niet. Haal het van een andere mirror en vergelijk de twee checksums met elkaar.

### Welke moet ik gebruiken?

Die de maker heeft gepubliceerd. Het gaat erom dat je met hun getal vergelijkt, en dat kun je niet voor hen kiezen. \
\
Maak je zelf een checksum in plaats van er een te controleren, neem dan SHA-256. MD5 en SHA-1 zijn gebroken in de zin die telt: twee verschillende bestanden met dezelfde uitkomst zijn met opzet te maken, bij MD5 in een paar uur en bij SHA-1 tegen overzienbare kosten. Tegen ongelukken zijn ze daarmee niet waardeloos, want een afgebroken download komt niet per ongeluk op dezelfde uitkomst uit, maar ze kunnen je niet meer vertellen dat er niemand aan gezeten heeft. SHA-384 en SHA-512 zijn prima en in de praktijk niet beter; ze staan hier omdat sommige projecten ze publiceren.

### Waarom staat MD5 er nog als het gebroken is?

Omdat het nog steeds is wat er staat afgedrukt. Mirrors, firmwaredownloads, softwarepagina's van universiteiten en heel veel fabrikantensites publiceerden twintig jaar geleden een MD5 en hebben die pagina daarna niet meer aangeraakt. Een hulpmiddel dat weigerde er een te berekenen, zou weigeren de vraag te beantwoorden waarmee zijn bezoekers werkelijk komen. \
\
Wat het wel kan doen is zeggen wat het antwoord waard is, en dat doet de regel naast het vakje. Een MD5 die klopt sluit nog altijd een beschadigde download uit. Een opzettelijk veranderde sluit hij niet uit.

### Welke formaten kan ik in het vergelijkvak plakken?

Alle gebruikelijke, en de pagina zoekt zelf uit welk het is. \
\
Kale hex, met of zonder spaties erin. Een regel uitvoer van `md5sum` of `sha256sum`, met de bestandsnaam erachter. Een heel `SHA256SUMS`-bestand van veertig regels; dan wordt de regel gebruikt die jouw bestand noemt. De BSD-vorm, `SHA256 (disk.iso) = …`. Een label ervoor, zoals in `SHA-256: …`. En een subresource-integrity-attribuut, `sha384-…`, dat in base64 staat in plaats van in hex en eerst wordt gedecodeerd. \
\
Welk algoritme het is volgt uit de lengte: 32 hextekens is een MD5, 40 een SHA-1, 64 een SHA-256, 96 een SHA-384 en 128 een SHA-512. Er zijn er geen twee even lang, dus er valt niets te kiezen en niets fout te doen.

### Geeft het hetzelfde als sha256sum of certutil?

Ja, byte voor byte. Het zijn exacte specificaties met gepubliceerde testvectoren, en elk algoritme hier wordt bij elke build tegen die vectoren en tegen de implementatie van het besturingssysteem gecontroleerd. \
\
Het enige verschil dat je ziet is de weergave. De `certutil -hashfile` van Windows schrijft in hoofdletters en met spaties; deze pagina schrijft in kleine letters, wat bijna iedere maker gebruikt. De vergelijking negeert allebei, dus een checksum die uit certutil is gekopieerd klopt met een kleine-letterversie die je hier plakt.

### Kan ik twee bestanden met elkaar vergelijken?

Ja, met één stap extra: controleer het eerste, kopieer de checksum, kies daarna het tweede en plak die checksum in het vak. Zijn de twee bestanden gelijk, dan zegt de pagina dat. \
\
Dat is het weten waard voor het geval waarin checksums stilletjes op hun best zijn: uitzoeken of de kopie op de back-upschijf werkelijk hetzelfde bestand is als die op de laptop, terwijl allebei dezelfde grootte en dezelfde datum melden.

### Verandert het mijn bestand?

Nee. Dit gereedschap leest alleen. Er is geen uitvoerbestand, geen hercodering en niets wat wordt teruggeschreven: het enige wat je kunt downloaden is een klein tekstbestand met de checksums. Je origineel blijft onaangeroerd op je schijf staan, wat meteen het eerlijke antwoord is op de vraag wat er gebeurt als je het tabblad sluit.

### Is het gratis, en heb ik een account nodig?

Het is gratis, en er is geen account, geen aanmelding en geen proefperiode. Er is geen maximum aan de bestandsgrootte en geen maximum aan hoeveel bestanden je controleert. De site heeft advertenties, en die betalen hem; de advertenties krijgen niets over je bestand.

### Werkt het offline?

Ja. Laad de pagina één keer, verbreek daarna de verbinding en ze blijft werken. Dat is meteen de eenvoudigste manier om te bewijzen dat er niets wordt geüpload: een hulpmiddel dat je bestand wegstuurt om het te laten berekenen, stopt op het moment dat je de stekker eruit trekt.

## Hoe je de privacybelofte controleert

- **Je bestand kan geen kant op.** In de Content-Security-Policy staat elk adres dat deze pagina mag benaderen, en geen daarvan is van ons. Er is hier geen eindpunt waar je bestand kan belanden, en er staat niets in de code dat het erheen zou sturen als dat er wel was. Hier stond vroeger `connect-src 'none'`, en dat was absoluut; de advertenties hebben dat gekost, en dat hoort erbij gezegd te worden.
- **Het bestand staat nergens in zijn geheel, hoe groot het ook is.** Het wordt in stukken van vier megabyte gelezen, en elk stuk gaat in de lopende berekening en verdwijnt weer. Deze pagina gebruikt daardoor evenveel geheugen voor een schijfkopie van veertig gigabyte als voor een tekstbestand, en er is geen grootte waarbij ze het opgeeft. Daarom wordt ook `crypto.subtle.digest` van de browser niet gebruikt: die functie wil het hele bestand in één keer in het geheugen, en dat is precies het plafond dat dit gereedschap niet wil hebben.
- **Vijf algoritmes, vijf bestanden in deze repository.** In `src/md5.js`, `src/sha1.js`, `src/sha256.js` en `src/sha512.js` staan de gepubliceerde specificaties uitgetypt, een stuk of zestig regels per stuk, met de constantentabellen uitgeschreven in plaats van berekend, zodat niets aan de uitkomst van je browser kan afhangen. Elk algoritme wordt bij elke build gecontroleerd tegen de officiële testvectoren en tegen de implementatie van het besturingssysteem zelf.
- **De checksum die je plakt gaat ook nergens heen.** Die wordt hier op de pagina vergeleken met de waarde die hier berekend is. Niemand komt iets over die vergelijking te weten: niet de waarde, niet of hij klopte, niet de naam van het bestand. Dat weegt zwaarder dan het klinkt, want een checksum plus een bestandsnaam vertelt degene die het opvangt precies welke build van welk programma je zojuist hebt binnengehaald.
- **Wat Google laadt, en wat het niet krijgt.** De advertentie- en meetscripts komen van Google. Geen van beide krijgt iets over je bestand: niet het bestand, niet de naam, niet de grootte en geen van de berekende waarden. Elke regel die een byte leest of verwerkt komt van dit domein en staat in de repository.
- **Wat de donatieknop laadt, en wat die niet krijgt.** De knop „Buy me a coffee” bovenaan wordt getekend door een script van cdnjs.buymeacoffee.com en haalt zijn letters bij Google Fonts. Het is een link en verder niets: hij meldt geen bezoek en krijgt niets over jou of je bestanden. Er gebeurt niets zolang je er niet op klikt, en wat je dan opent is de site van iemand anders.
- **Het werkt offline.** Verbreek de verbinding en elk onderdeel van deze pagina blijft werken. Dat is het eenvoudigste bewijs dat er is: een hulpmiddel dat je bestand wegstuurt om het te laten berekenen, stopt op het moment dat je de stekker eruit trekt.

**Controleer het zelf.** Je hoeft niets van het bovenstaande op ons woord aan te nemen. Een buildscript maakt deze pagina uit de sjablonen en de configuratie in de repository, en dat script kun je lezen en zelf draaien. Het resultaat staat vastgelegd op de branch `dist`, dus je kunt wat er geserveerd wordt vergelijken met wat een build van de bronnen oplevert: https://github.com/A-Box-of-Tools/website

De bestanden die je als eerste wilt lezen zijn `config/site.toml` voor de Content-Security-Policy, `src/md5.js`, `src/sha1.js`, `src/sha256.js` en `src/sha512.js` voor de vier compressiefuncties, `src/blocks.js` voor de opvulling die ze delen en `src/hash.js` voor de lus die je bestand in stukken leest. In geen van die bestanden staat een regel die het netwerk kan bereiken.
