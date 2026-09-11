# Qr-code & barcode scannen — vanaf een afbeelding of met je camera

Richt je camera erop, of sleep er een foto van hierheen. Het wordt hier gelezen, en nergens anders.

> Lees een qr-code vanaf een foto, een schermafbeelding of je camera, en zie precies waar de link heen gaat voordat je hem opent. Ook EAN, UPC, Code 128, Code 39 en ITF. Er wordt niets geüpload.

Deze pagina is een interactief hulpmiddel dat volledig in je browser draait, op https://abox.tools/nl/qr-code-scannen/ — niets van wat je het geeft wordt geüpload. Hieronder staat alles wat de pagina er in woorden over zegt; om het te gebruiken, open je het adres.

## Je afbeeldingen en de codes die erin zitten worden **nooit geüpload**. Er is geen server.

Een code lezen is rekenwerk op pixels, en de pixels zijn er al. Het symbool vinden, de hoek eruit rekenen, het masker ongedaan maken, de schade repareren met Reed-Solomon en de bits weer uitlezen: dat gebeurt allemaal in zo'n tweeduizend regels JavaScript in deze pagina die je gewoon kunt lezen. **De camera is dezelfde belofte, geen uitzondering erop:** een beeld komt als pixels dit tabblad binnen, wordt bekeken, en is weg. Er wordt niets opgenomen, niets bewaard, en deze pagina heeft geen enkele netwerkfunctie om er iets mee te versturen.

- ✗ Geen upload
- ✗ Geen account
- ✗ Niets opgenomen
- ✓ Werkt offline
- ✓ Open source

## Hoe je een qr-code leest zonder de afbeelding te uploaden

1. **Geef hem de afbeelding.** Sleep een foto of een schermafbeelding op het vak, plak er een rechtstreeks in, of druk op de cameraknop. Meerdere tegelijk mag: elk wordt apart gelezen en elk krijgt zijn eigen antwoord. Een schermafbeelding van een code die al op je scherm staat is de snelste weg en de betrouwbaarste, want daar komt geen lens, geen hoek en geen licht aan te pas.
2. **Zorg dat het hele symbool in beeld is, marge en al.** Het wit rondom een code hoort bij de code: daaraan ziet een lezer waar het symbool ophoudt. Een foto die tot de rand van de blokjes is bijgesneden is verreweg de meest voorkomende reden dat er een niet gelezen wordt. Ongeveer de helft van het beeld vullen met de code is ongeveer goed; dichterbij en de hoeken vallen buiten de foto.
3. **Lees het adres voordat je iets besluit.** Waarom je een code op een poster, een parkeerautomaat of een brief scant, is om te weten te komen waar hij heen gaat — en dat is nou net wat de camera van je telefoon je eigenlijk niet laat doen. Hier staat de host op een eigen regel. Is het geen naam die je verwachtte, dan heb je al waarvoor je kwam en valt er niets meer te openen.
4. **Neem de waarschuwingen serieus, juist de zachte.** Een kaal `http://`-adres, een naam in een alfabet dat niet is wat het lijkt, een linkverkorter, of wat dan ook vóór een `@` in het adres — elk daarvan wordt benoemd waar het voorkomt. Geen van alle bewijst op zichzelf iets. Alle zijn tien seconden waard voordat je erheen gaat.
5. **Lukt het niet, verander dan eerst het licht en pas daarna iets anders.** Bijna elke mislukking is een drempelprobleem: een weerspiegeling dwars over het midden, een schaduw over een hoek, of een scherm dat onder een hoek is gefotografeerd die de achtergrondverlichting vangt. Ga zo staan dat de glans niet op de code valt, of zet het cameralampje aan. Helpt dat niet, maak dan één vlakke foto recht van voren en sleep die erin — een stilstaand beeld krijgt een veel grondiger zoektocht dan een live beeld kan krijgen.
6. **Ziet het antwoord er raar uit, kijk dan naar het bemonsterde beeld.** Klap “hoe deze gelezen is” open en kijk naar het roostertje. Dat is wat deze pagina dacht dat de code was, teruggetekend uit de modules die ze bemonsterd heeft. Een lezer die een symbool verkeerd las en het tot iets plausibels heeft gerepareerd laat dat daar zien, en nergens anders.

## De uitgebreide versie

[Zo maak je een QR-code en bewijs je dat hij scant](https://abox.tools/nl/gidsen/qr-code-maken-en-bewijzen-dat-hij-scant/): Genereer de code en controleer hem dan met de lezer van dezelfde site: de exacte inhoud, de echte link, op drukformaat en vanaf een foto, vóór de oplage. Alles in de browser, niets geüpload.

## Ook in de gereedschapskist

- [Hash en checksum](https://abox.tools/nl/checksum-controleren/): Controleer een download tegen het getal dat de maker erbij zette, zonder hem naar iemand te sturen.
- [Wachtwoord- & wachtwoordzingenerator](https://abox.tools/nl/wachtwoord-generator/): Hier gemaakt, door je eigen browser, en nergens naartoe gestuurd. Er wordt niets opgeslagen en er is geen geschiedenis.
- [JSON-formatter](https://abox.tools/nl/json-formatteren/): JSON, XML, HTML, CSS en YAML, geformatteerd of omgezet. Er wordt niets in andermans server geplakt.
- [YAML-naar-JSON-omzetter](https://abox.tools/nl/yaml-naar-json-omzetten/): Beide richtingen, en het zegt wat elke richting kost. Niets ervan wordt in de server van iemand anders geplakt.

## Vragen

### Wordt de afbeelding ergens naartoe geüpload?

Nee, en wat eruit gelezen wordt ook niet. De afbeelding wordt op een canvas in deze pagina gedecodeerd en daar gelezen, door JavaScript dat van deze site komt. Deze tool heeft geen enkele netwerkfunctie — hij haalt nooit iets op en stuurt nooit iets — en de `Content-Security-Policy` van de pagina noemt elk adres dat hij mag benaderen, en geen daarvan is van ons. Het eenvoudigste bewijs is de verbinding verbreken: hij blijft gewoon werken.

### Neemt de camera iets op?

Nee. Een camerabeeld komt als pixels dit tabblad binnen, wordt op een canvas getekend, bekeken, en ongeveer een tiende seconde later overschreven door het volgende. Er wordt niets naar schijf geschreven en er blijft niets staan. De stream stopt zodra je op stoppen drukt, wanneer het tabblad naar de achtergrond gaat en wanneer je de pagina verlaat — en het lampje op je camera is de indicator om op te vertrouwen, want geen enkele pagina kan dat uitzetten.

### Waarom laat hij me de link zien in plaats van hem te openen?

Omdat dat het nuttige deel is. Een qr-code is een adres dat je niet kunt lezen, en juist daarom werkt een sticker over de code van een parkeerautomaat: tegen de tijd dat je weet waar hij heen ging, ben je er al. Hier staat de tekenreeks er helemaal, de host staat apart op een eigen regel, en openen is een aparte knop die je pas indrukt nadat je het gelezen hebt. Dat is één klik extra, en het is de klik die dit formaat altijd al nodig had.

### Wat kan hij lezen?

Qr-codes in alle versies van 1 tot en met 40, op alle vier de foutcorrectieniveaus, in numerieke, alfanumerieke, byte- en kanjimodus, waarbij ECI-tekensets en symbolen uit een aaneengeschakelde reeks gemeld worden in plaats van stilletjes weggegooid. Aan de gestreepte kant: EAN-13, EAN-8, UPC-A, UPC-E, ITF-14, Interleaved 2 of 5, Code 128 en Code 39. Data Matrix, PDF417, Aztec en MaxiCode leest hij niet.

### Hij leest mijn code niet. Wat is er mis?

Negen van de tien keer is het een van drie dingen. De witte marge is weggesneden, en een lezer gebruikt die om te zien waar het symbool ophoudt. Er ligt een weerspiegeling of een schaduw over een deel van de code, zodat geen enkele drempelwaarde de donkere blokjes van de lichte scheidt. Of de code is zo klein in beeld dat zijn modules niet meer dan een of twee pixels breed zijn. Verander het licht, vul ongeveer de helft van het beeld, en fotografeer recht van voren in plaats van schuin.

### Kan hij een beschadigde of deels bedekte code lezen?

Vaak wel, en dat is het formaat dat werkt zoals het bedoeld is, niet iets knaps van hier. Elke qr-code draagt Reed-Solomon-controlegegevens, en een symbool dat op niveau H gemaakt is kan ongeveer 30% van zijn modules verliezen en toch exact herbouwd worden. De pagina zegt onder “hoe deze gelezen is” hoeveel codewoorden ze heeft moeten repareren, zodat je ziet hoe krap het was. Wat hij niet doet, is gokken: een symbool dat verder beschadigd is dan de controle aankan wordt als onleesbaar gemeld in plaats van verkeerd beantwoord.

### Waarom zegt hij dat hij niet kan vertellen waar een bit.ly-link heen gaat?

Omdat dat uitzoeken betekent dat je het aan bit.ly moet vragen, en dat is een netwerkverzoek. Al het andere dat deze pagina beweert rust erop dat er hier geen code is die met iets contact maakt, en daar stiekem een uitzondering op maken zou minder waard zijn dan het antwoord. Dus wordt de verkorter benoemd en blijft wat hij verbergt eerlijk onbekend. Wil je hem oplossen, plak hem dan in iets dat wél bereid is om te vragen.

### Is het eigenlijk wel veilig om een qr-code te scannen?

Er een scannen is veilig. Er gehoor aan geven is het risico, en dat is een echt risico: codes die over de echte heen zijn geplakt op parkeerautomaten, op restauranttafels en op briefjes van de pakketbezorger zijn inmiddels gewoon genoeg om een naam te hebben. Wat ze laat werken, is dat niemand een code kan lezen door ernaar te kijken. Hem lezen zonder hem te openen — wat deze pagina doet — haalt dat hele voordeel weg, en de tien seconden die het kost om naar de host te kijken zijn de hele verdediging.

### Wat is dat roostertje onder elk resultaat?

De modules die deze pagina echt uit je afbeelding bemonsterd heeft, teruggetekend met één blokje per module. Het staat er zodat de lezing met het oog te controleren is in plaats van te geloven: lijkt dat rooster op de code die je gefotografeerd hebt, dan kwam het antwoord erboven uit de juiste pixels. Bijna geen enkele lezer laat je dit zien, en het is het verschil tussen gereedschap dat je kunt controleren en gereedschap dat je moet geloven.

### Leest hij meerdere codes in één afbeelding?

Eén per afbeelding, voorlopig. Sleep er meerdere tegelijk in en elk wordt apart gelezen, en de camera leest code na code terwijl je hem beweegt, en houdt elke nieuwe die hij nog niet gezien heeft. Eén foto met een vel vol codes erop is een klus voor bijsnijden, of voor de camera één voor één erop richten.

### Waarom noemt hij mijn barcode anders dan wat ik gevraagd had?

Omdat een barcode zijn eigen naam niet bij zich draagt. UPC-A is een EAN-13 waarvan het eerste cijfer een nul is, ITF-14 is Interleaved 2 of 5 met veertien cijfers en een geldig controlecijfer, en Code 128 in zijn numerieke modus lijkt nergens anders op. Wat deze pagina meldt is wat de strepen zeggen plus wat het controlecijfer bevestigt, en dat is alles wat het symbool zelf weet.

### Werkt het offline?

Ja. Laad de pagina één keer, verbreek dan de verbinding en hij blijft werken, camera en al. Dat is ook de eenvoudigste manier om te bewijzen dat er niets geüpload wordt: een lezer die je afbeelding wegstuurt om te laten decoderen, stopt op het moment dat je de stekker eruit trekt.

## Hoe je de privacybelofte controleert

- **De afbeelding wordt nooit geüpload, en de camera is geen uitzondering.** Een foto die je hierheen sleept wordt op een canvas in deze pagina gedecodeerd en daar gelezen. Een camerabeeld is precies hetzelfde, maar dan dertig keer per seconde: het wordt op dat canvas getekend, bekeken en overschreven door het volgende. Er wordt er geen enkele opgenomen, er blijft er geen enkele staan, en dat het cameralampje uitgaat als je op stoppen drukt is het hele verhaal.
- **Hier haalt niets iets op.** Er is geen `fetch`, geen `XMLHttpRequest` en geen `sendBeacon` ergens in `src/`, en de `Content-Security-Policy` van de pagina laat geen enkel adres over waar deze oorsprong iets heen zou kunnen sturen, ook al was er wel iets. Daarom kan deze pagina je niet vertellen waar een verkorte link uitkomt: dat uitzoeken zou vragen betekenen, en ze vraagt niets.
- **Hij laat je het adres zien. Hij opent het nooit.** Een gedrukte qr-code is een adres dat niemand kan lezen, en dat is precies wat een sticker eroverheen voor iemand de moeite waard maakt. Hier wordt niets geopend. De hele tekenreeks staat er voor je om te bekijken, de host waar je echt zou uitkomen staat apart, en de trucs die het ene adres op het andere laten lijken — een gebruikersnaam vóór een `@`, een naam geschreven in een alfabet waarvan de letters onze vorm hebben, een omleiding — worden benoemd waar ze voorkomen.
- **Hij laat je ook zien wat hij bemonsterd heeft.** Onder elk qr-resultaat staat een afbeelding van de modules die deze pagina echt uit je foto heeft gelezen. Lijkt dat op de code die je gescand hebt, dan klopt het antwoord erboven; lijkt het op ruis, dan niet. Een lezer die je alleen een tekenreeks geeft en verder niets valt zo niet te controleren.
- **Wat Google laadt, en wat het niet krijgt.** De advertentie- en meetscripts komen van Google, en de doneerknop van Buy Me a Coffee. Geen van alle krijgt een afbeelding, een camerabeeld of iets wat daaruit gelezen is. Elke regel die pixels in een tekenreeks verandert wordt vanaf deze oorsprong geserveerd en staat in de repository.
- **Het werkt offline.** Verbreek de verbinding en de tool is onveranderd, camera en al, want er heeft nooit een netwerkstap in gezeten. Dat is het eenvoudigste bewijs dat er is.

**Controleer het zelf.** Je hoeft niets van het bovenstaande op ons woord aan te nemen. Een buildscript maakt deze pagina uit de sjablonen en de configuratie in de repository, en dat script kun je lezen en zelf draaien. Het resultaat staat vastgelegd op de branch `dist`, dus je kunt wat er geserveerd wordt vergelijken met wat een build van de bronnen oplevert: https://github.com/A-Box-of-Tools/website

De bestanden die je als eerste wilt lezen zijn `config/site.toml` voor de Content-Security-Policy, `src/binarize.js` en `src/detect.js` voor het vinden van een symbool in een foto — de drempelwaarde, de zoekpatronen en de perspectiefcorrectie —, `src/qr-decode.js` voor het teruglezen, `src/reed-solomon.js` voor het repareren van wat verkeerd gelezen is, `src/linear.js` voor de gestreepte, en `src/camera.js`, dat elke regel in deze pagina is die een camera aanraakt.
