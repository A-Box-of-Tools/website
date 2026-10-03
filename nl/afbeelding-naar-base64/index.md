# Afbeelding naar data-URI — een plaatje base64-coderen voor CSS of HTML

Het hele plaatje als één regel tekst. Plak hem zo in je CSS of HTML.

> Maak van een PNG, JPEG, SVG of WebP een data-URI die je in CSS of HTML kunt plakken. SVG's worden procentgecodeerd in plaats van base64, dus ze blijven leesbaar en korter. Draait in je browser; er wordt niets geüpload.

Deze pagina is een interactief hulpmiddel dat volledig in je browser draait, op https://abox.tools/nl/afbeelding-naar-base64/ — niets van wat je het geeft wordt geüpload. Hieronder staat alles wat de pagina er in woorden over zegt; om het te gebruiken, open je het adres.

## Je afbeeldingen worden **nooit geüpload**. Er is geen server.

Het coderen gebeurt in je eigen browser, op je eigen hardware. Het is niet meer dan rekenen op bytes die de pagina al heeft: geen encoder, geen server, en geen netwerkstap om weg te laten. Deze tool heeft geen enkele netwerkfunctie, dus er valt niets op te halen en niets te versturen. En al was die er wel, dan stond aan de andere kant van deze pagina nog steeds geen server om een plaatje naartoe te sturen.

- ✗ Geen upload
- ✗ Geen account
- ✗ Geen hercodering
- ✓ Werkt offline
- ✓ Open source

## Zo maak je van een afbeelding een data-URI

1. **Kies je afbeeldingen.** Sleep ze het vak in of kies ze met de hand. De browser leest ze rechtstreeks van je schijf, en er gaat ondertussen niets ergens heen.
2. **Zeg waar het resultaat heen gaat.** De URI op zichzelf, een CSS-regel, een custom property, een `<img>`-tag of Markdown. Ze zetten de URI allemaal tussen aanhalingstekens, en dat is het detail dat bepaalt of een ingesloten SVG werkt of stilletjes niet.
3. **Lees wat het gekost heeft.** Bij elk resultaat staat hoeveel tekens het geworden is, hoeveel groter dat is dan het bestand, en of iets van dit formaat inline zetten een goed idee is. Base64 doet er een derde bij, en of die derde een uitgespaard verzoek waard is hangt volledig van de grootte af. De pagina zegt daarom aan welke kant van de streep je zit.
4. **Lees de waarschuwingen.** Draagt het plaatje EXIF, een kleurprofiel of XMP mee, dan staat dat erbij, met hoeveel bytes van je resultaat dat is. Klopt de extensie niet met het werkelijke formaat, dan gaat de pagina op het formaat af en zegt ze het je. En kan je browser het resultaat niet tekenen, dan hoor je dat ook.
5. **Kopieer, of download.** Eén knop per resultaat, en één voor alles tegelijk. De custom properties komen eruit in een `:root`-blok, klaar om boven aan een stylesheet te plakken.

## De uitgebreide versie

[Wanneer je een plaatje in je CSS zet, en wanneer niet](https://abox.tools/nl/gidsen/een-afbeelding-in-css-zetten/): Wat een data-URI kost, waarom base64 er een derde bij doet en gzip dat niet teruggeeft, waarom een svg nooit base64 hoort te zijn, en de aanhalingsfout die ingesloten svg's stilletjes breekt.

## Ook in de gereedschapskist

- [SVG naar afbeelding](https://abox.tools/nl/svg-naar-png/): Noem het formaat. Een vector heeft er zelf geen om te verliezen.
- [Afbeelding naar SVG](https://abox.tools/nl/afbeelding-naar-svg/): Eén vorm, één omtrek. Wijs aan wat er niet in hoort.
- [Lengtevergelijker](https://abox.tools/nl/lengtes-vergelijken/): Typ de lengtes, neem de afbeelding mee. Er wordt niets verstuurd om hem te tekenen.
- [Afbeeldingscompressor](https://abox.tools/nl/afbeelding-comprimeren/): Jij noemt de grootte. De rest rekent de tool uit.

## Vragen

### Wordt mijn afbeelding ergens heen geüpload?

Nee. Je eigen browser leest en codeert het bestand op je eigen hardware, met twee functies die de browser toch al heeft. Deze tool heeft geen enkele netwerkfunctie en haalt dus nooit iets op en verstuurt nooit iets. In de `Content-Security-Policy` van de pagina staat bovendien elk adres dat hij mag benaderen, en geen daarvan hoort bij deze site.

### Wat is een data-URI?

Een manier om een heel bestand op te schrijven op de plek waar normaal een webadres staat. In plaats van `url("logo.png")`, waarmee je de browser opdraagt iets te gaan halen, schrijf je `url("data:image/png;base64,iVBORw0...")`, met het plaatje er zelf in. De browser decodeert het ter plekke. In de praktijk scheelt dat één verzoek, want het plaatje komt mee met de stylesheet of de pagina in plaats van erna.

### Waarom is mijn SVG geen base64?

Omdat base64 er de verkeerde codering voor is. Een SVG is tekst, en een URL kan tekst al meedragen, want er hoeft maar een handvol tekens ontsnapt te worden. Codeer je alleen die als procenttekens en laat je de rest met rust, dan krijg je een URI die meestal een vijfde korter is dan de base64 van hetzelfde bestand en die je in je stylesheet gewoon kunt blijven lezen. De elementnamen, de kleuren en de `viewBox` staan er allemaal nog om te bewerken. Voor de zeldzame toolchain die op base64 staat, is er een vinkje.

### Hoeveel groter maakt base64 mijn afbeelding?

Ongeveer een derde. Drie bytes bestand worden vier tekens base64, en dat is 33% nog vóór de `data:image/png;base64,` die ervoor komt. Die ondergrens ontloop je niet, want zoveel kost het nu eenmaal om willekeurige bytes op te schrijven met alleen de tekens die een URL toestaat. Daarom zet de pagina het aantal tekens naast de bestandsgrootte, in plaats van je het te laten ontdekken zodra de stylesheet live staat.

### Wanneer is het eigenlijk een goed idee om een afbeelding inline te zetten?

Als hij klein is en je hem meteen nodig hebt. Een icoontje van 2 KB in een stylesheet die op elke pagina geladen wordt is pure winst: één heen-en-weer minder, en het plaatje is er zodra de CSS er is. Voorbij zo'n 10 KB kantelt de ruil. Een inline plaatje is namelijk geen apart bestand meer, dus het kan niet los in de cache, het kan niet parallel met iets anders opgehaald worden, en bij elke wijziging van het bestand eromheen wordt het volledig opnieuw gedownload. Een foto van 200 KB in een stylesheet legt er dus 200 KB bij op het kritieke pad van elke pagina op de site. Bij elk resultaat zegt de pagina aan welke kant van die streep het valt.

### Maakt gzip de base64-overhead weer ongedaan?

Minder dan mensen verwachten. Base64 van een bestand dat al gecomprimeerd is, en een PNG, een JPEG en een WebP zijn dat alle drie, comprimeert slecht, omdat er bijna geen herhaling meer over is die de compressor kan vinden. Je krijgt er meestal zoiets als een tiende van terug van de derde die base64 erbij deed, en niet het geheel. Bij een procentgecodeerde SVG ligt het net andersom. Dat is nog steeds tekst, dus die comprimeert ongeveer net zo goed als daarvoor, en dat is nog een reden om er geen base64 van te maken.

### Verandert dit ook maar iets aan mijn afbeelding?

Nee, en dat is een bewust verschil met de meeste tools hier. Er wordt niets naar pixels gedecodeerd en opnieuw gecodeerd, want de bytes die van je schijf kwamen zijn precies de bytes die de URI in gaan. Een JPEG blijft de JPEG die hij was, op dezelfde kwaliteit en met dezelfde afmetingen. Daarom mag je het resultaat hetzelfde bestand noemen en niet een kopie ervan.

### Dus mijn EXIF- en gps-gegevens gaan ook de stylesheet in?

Ja, en daar wil je over nadenken voordat je plakt. Omdat er niets opnieuw gecodeerd wordt, reist alles wat de camera schreef gewoon met het plaatje mee: de locatie, de tijdstempel en het serienummer van de camera. Bij een telefoonfoto kan dat 30 KB van het bestand zijn, wat 40 KB base64 wordt op het kritieke pad van je pagina, plus een woonadres in iets dat naar een repository gecommit gaat worden. De pagina leest hoeveel metagegevens er in een JPEG, PNG of WebP zitten en zegt het je. Wil je ze er eerst uit halen, gebruik dan de [EXIF-lezer & -wisser](https://abox.tools/nl/exif-gegevens-verwijderen/).

### Waarom koos hij een ander type dan de extensie van mijn bestand?

Omdat de extensie fout kan zijn en de bytes niet. Een bestand dat `logo.png` heet maar in werkelijkheid als JPEG geëxporteerd is, komt zo vaak voor dat elke beeldtool ermee om moet kunnen. En een data-URI die het verkeerde type opgeeft verschijnt domweg niet, zonder terugval en zonder foutmelding die het lezen waard is. Daarom wordt het type uit de eerste paar bytes van het bestand gelezen, die in elk formaat hier ondubbelzinnig zeggen wat het is, en hoor je het zodra de twee elkaar tegenspreken.

### De voorvertoning is leeg. Wat ging er mis?

Waarschijnlijk niets aan de URI. HEIC en TIFF leveren allebei volkomen geldige data-URI's op die geen enkele browser behalve Safari wil tekenen, waardoor het plaatje overal ontbreekt waar je het plakt. Zet het daarom eerst om naar PNG, JPEG of WebP met de [Afbeeldingscompressor](https://abox.tools/nl/afbeelding-comprimeren/) of [Afbeeldingsformaat wijzigen](https://abox.tools/nl/afbeelding-formaat-wijzigen/). Gaat het om een alledaags formaat, dan is het bestand zelf waarschijnlijk beschadigd. De voorvertoning wordt namelijk getekend uit de URI die deze pagina bouwde, dus een lege betekent dat het plaatje niet decodeerde.

### Zit er een groottelimiet op een data-URI?

Geen die je in CSS of in een `<img>`-tag tegenkomt, want moderne browsers leggen daar geen praktisch plafond op. Wat browsers wel beperken is een data-URI in de adresbalk tikken, en dat weigeren de meeste inmiddels voor alles wat niet triviaal is, om veiligheidsredenen die niets met dit gebruik te maken hebben. De echte grens is die hierboven. Lang voordat er technisch iets breekt, is de pagina waar hij in zit al trager dan hij met een gewoon afbeeldingsbestand geweest zou zijn.

### Is het gratis, en heb ik een account nodig?

Het is gratis, en er komt geen account, geen inlog, geen proefperiode en geen watermerk aan te pas. Er zit ook geen limiet op het aantal bestanden of op de grootte ervan, omdat er geen server is die daarvoor betaalt: het werk gebeurt op je eigen apparaat. De site draait op advertenties, en die betalen hem. Die advertenties krijgen niets over je afbeeldingen mee.

### Werkt het offline?

Ja. Laad de pagina één keer, verbreek daarna je internetverbinding en hij werkt gewoon door. Dat is meteen de eenvoudigste manier om te bewijzen dat er niets geüpload wordt, want een tool die je afbeeldingen wegstuurde om ze te laten coderen zou ermee ophouden zodra je de stekker eruit trok.

## Hoe je de privacybelofte controleert

- **Je afbeeldingen kunnen nergens heen.** In de Content-Security-Policy staat elk adres dat deze pagina mag benaderen, en geen daarvan hoort bij deze site. Er is hier geen eindpunt waar je bestanden verzameld zouden kunnen worden, en in de code staat niets wat ze zou versturen als dat eindpunt er wel was.
- **Niets hier haalt iets op.** In `src/` staat nergens een `fetch`, een `XMLHttpRequest` of een `sendBeacon`. Het coderen gebeurt met `btoa` en `encodeURIComponent`, twee functies die de browser al sinds het begin heeft en die allebei bytes aannemen en tekst teruggeven zonder ook maar ergens heen te gaan.
- **De voorvertoning is het bewijs.** Het plaatje naast elk resultaat wordt getekend uit de data-URI die deze pagina zojuist bouwde, en dus niet uit je bestand. Het verschijnt omdat de URI klopt, op jouw apparaat, zonder dat er een server aan te pas komt. Verschijnt het niet, dan zegt de pagina dat, in plaats van je iets kapots aan te reiken.
- **De metagegevenswaarschuwing staat aan jouw kant.** Een data-URI kopieert het bestand exact, waardoor de gps-positie van een foto gewoon meereist je stylesheet in. Deze pagina leest hoeveel daarvan erin zit en zegt het je, want anders kom je er pas achter als het al gecommit is.
- **Wat Google laadt, en wat het niet te zien krijgt.** De advertentie- en meetscripts komen van Google, de doneerknop van Buy Me a Coffee. Geen van alle krijgt iets over je plaatjes mee. Elke regel die een bestand leest of codeert, wordt vanaf deze herkomst geserveerd en staat in de repository.
- **Het werkt offline.** Verbreek de verbinding en de tool werkt onveranderd door, omdat er nooit een netwerkstap in zat. Eenvoudiger bewijs bestaat er niet.

**Controleer het zelf.** Je hoeft niets van het bovenstaande op ons woord aan te nemen. Een buildscript maakt deze pagina uit de sjablonen en de configuratie in de repository, en dat script kun je lezen en zelf draaien. Het resultaat staat vastgelegd op de branch `dist`, dus je kunt wat er geserveerd wordt vergelijken met wat een build van de bronnen oplevert: https://github.com/A-Box-of-Tools/website

De bestanden die je als eerste wilt lezen zijn `config/site.toml` voor de Content-Security-Policy, `src/encode.js` voor de twee coderingen en de redenering achter elk, `src/sniff.js` voor hoe het mediatype uit het bestand gelezen wordt en niet uit zijn naam, en `src/metadata.js` voor de controle die zegt hoeveel van wat je op het punt staat te plakken niet het plaatje is.
