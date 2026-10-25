# XML-formatter — uitleggen, plat persen of omzetten naar JSON

XML uitgelegd om te lezen of plat geperst om te versturen, en beide kanten op omgezet naar JSON. Niets ervan wordt in de server van iemand anders geplakt.

> Formatteer, laat inspringen en verklein XML, en zet XML om naar JSON of JSON naar XML. De parser draait in je browser en er wordt niets geüpload, dus een feed, een factuur of een configuratiebestand blijft op je eigen apparaat.

Deze pagina is een interactief hulpmiddel dat volledig in je browser draait, op https://abox.tools/nl/xml-formatteren/ — niets van wat je het geeft wordt geüpload. Hieronder staat alles wat de pagina er in woorden over zegt; om het te gebruiken, open je het adres.

## Je XML- en JSON-bestanden worden **nooit geüpload**. Er is geen server.

Formatteren en omzetten zijn rekenen aan een tekenreeks, hier, in deze pagina. De parser is met de hand geschreven en staat in `src/shared/parse-xml.js`, en meer is er niet. Dit gereedschap heeft überhaupt geen netwerkfunctie — niets op te halen, niets te versturen — en dat weegt hier zwaarder dan het woord ‚XML‘ doet vermoeden, want wat in dit formaat binnenkomt is meestal een factuur, een bankafschrift, een medisch dossier of een SOAP-bericht met iemands inloggegevens in de kop.

- ✗ Geen upload
- ✗ Geen account
- ✗ Geen groottelimiet
- ✓ Werkt offline
- ✓ Open source

## Zo formatteer je XML zonder het te uploaden

1. **Kies de klus.** Twee tabbladen, één vak: *Formatteren* legt XML uit of perst het plat; *Omzetten* maakt er JSON van, of van JSON weer XML. De XML die je net hebt uitgelegd is de XML die je omzet, zonder hem twee keer te plakken.
2. **Plak het, of zet het bestand neer.** Alles wat je kunt selecteren en kopiëren werkt, en een `.xml`-, `.svg`-, `.rss`- of `.xsd`-bestand dat je op de kiezer zet wordt door je eigen browser gelezen en in het vak gezet — er is geen uploadstap om over te slaan.
3. **Kies de inspringing, of pers het plat.** Twee spaties, vier, of een tab. Plat persen is hetzelfde document zonder elke spatie die er alleen stond om het te kunnen lezen, en het resultaat zegt hoeveel bytes dat scheelde.
4. **Lees de fout waar de fout zit.** Een parser die hier vastloopt zegt *welke tag* nooit gesloten is en op welke regel en kolom, in plaats van ‚fout op regel 1‘, wat een browser zegt over een document dat hij in één keer las.
5. **Neem het resultaat mee.** Kopieer het, of download het als bestand, genoemd naar het formaat waarin het eruit kwam.

## Ook in de gereedschapskist

- [Tekstvergelijker](https://abox.tools/nl/tekst-vergelijken/): Twee teksten erin, elk verschil gemarkeerd, regel voor regel en woord voor woord. Er wordt niets in andermans server geplakt.
- [Base64-codeerder & -decodeerder](https://abox.tools/nl/base64-coderen/): Base64, procentcodering, HTML-entiteiten, hex en backslash-escapes, beide kanten op. Er wordt niets in andermans server geplakt.
- [Tekst en bestanden delen](https://abox.tools/nl/tekst-delen/): Wat je deelt leeft in dit open tabblad. Lezers halen het versleuteld rechtstreeks uit je browser, en het tabblad sluiten beëindigt het - geen server bewaart iets.
- [QR- & barcodegenerator](https://abox.tools/nl/qr-code-maken/): Tik het in, en het wordt een code. Er wordt niets verstuurd om er een te maken.

## Vragen

### Wordt mijn XML ergens geüpload?

Nee. De parser en de printer op deze pagina zijn functies die in je eigen browser draaien, op je eigen hardware. Dit gereedschap heeft überhaupt geen netwerkfunctie — het haalt nooit iets op en stuurt nooit iets weg — en in het `Content-Security-Policy` van de pagina staat elk adres dat ze mag benaderen, en geen daarvan is van ons. Dat weegt bij XML zwaarder dan de reputatie van het formaat doet vermoeden: wat erin binnenkomt is meestal een factuur, een bankafschrift, een medisch dossier, of een SOAP-verzoek met inloggegevens in de kop.

### Lost het externe entiteiten op?

Nee, en er valt niets uit te zetten. Het oplossen van externe entiteiten is de manier waarop een XML-parser wordt overgehaald bestanden te lezen van de machine waarop hij draait — de aanval die meestal XXE wordt geschreven — en `src/shared/parse-xml.js` is een met de hand geschreven lezer zonder enige entiteitsafhandeling. Je tekst wordt ook nooit aan de eigen `DOMParser` van de browser gegeven. Een `DOCTYPE` wordt doorgegeven zonder ooit uitgevoerd te worden.

### Wat gaat er verloren bij het omzetten van XML naar JSON?

De volgorde van gemengde inhoud, de commentaren, en het verschil tussen een attribuut en een kindelement — dat laatste eerder verzacht dan gewist, want een attribuut wordt een lid waarvan de naam met `@` begint. De eigen tekst van een element wordt `#text` zodra hij naast iets anders moet staan, en herhaalde kinderen worden een array. Elke waarde blijft een tekenreeks: XML heeft geen types, en beslissen dat `8080` een getal was zou informatie verzinnen zijn.

### Wat gaat er verloren bij het omzetten van JSON naar XML?

Het verschil tussen een leeg object, een lege array en een lege tekenreeks, die alle drie een leeg element worden, en het type van elke waarde, want XML heeft geen types. Een array wordt een herhaald element, de enige vorm die terugleest, en bij een sleutel die een elementnaam niet kan dragen worden de lastige tekens vervangen in plaats van dat er een document uitkomt dat geen enkele parser leest.

### Kan het een SVG, een RSS-feed of een POM-bestand formatteren?

Ja. Alle drie zijn XML, en dit leest XML in plaats van een bepaald dialect ervan. Een zo uitgelegde SVG is makkelijker met de hand te bewerken; een RSS- of Atom-feed wordt meestal plat geperst verstuurd en is onleesbaar tot iets hem openvouwt. Aan wat het document betekent verandert de opmaak niets.

### Verandert opnieuw laten inspringen wat de XML betekent?

Bij een document waarvan de elementen andere elementen bevatten niet. Waar het wel kan uitmaken is tekst: witruimte binnen een element dat woorden bevat hoort bij die tekst, dus een element dat niets dan tekst bevat blijft op één regel staan in plaats van opengevouwen te worden. `CDATA`-secties worden precies overgenomen zoals ze waren.

### Waarom niet gewoon de eigen XML-parser van de browser gebruiken?

Vanwege wat hij zegt als het document stuk is. De `DOMParser` geeft een foutdocument terug waarvan de bewoording in elke browser anders is en dat vaak neerkomt op ‚fout op regel 1‘. Een met de hand geschreven lezer kan zeggen welke tag nooit gesloten is, en waar hij geopend werd, en dat is precies wat je moest weten. Geen externe entiteiten oplossen is de andere reden.

### Hoe groot mag het bestand zijn?

Er is hier geen limiet ingesteld, want er is geen server die ervoor betaalt. Het echte plafond is je eigen apparaat: een paar megabyte XML gaat prima, en bij een heel lang document wacht de pagina op een pauze in je typen voordat ze opnieuw formatteert, in plaats van met je om het toetsenbord te vechten.

### Is het gratis, en heb ik een account nodig?

Het is gratis, en er is geen account, geen inloggen, geen proefperiode en geen limiet op hoeveel je plakt. De site draait op advertenties, want die betalen hem; de advertenties krijgen niets over je tekst.

### Werkt het offline?

Ja. Laad de pagina één keer, trek daarna de stekker uit het internet en ze blijft werken. Dat is meteen de eenvoudigste manier om te bewijzen dat er niets geüpload wordt: gereedschap dat je XML wegstuurt om geformatteerd te worden zou stoppen op het moment dat je de stekker eruit trekt.

## Hoe je de privacybelofte controleert

- **Wat je plakt kan nergens heen.** In het Content-Security-Policy staat elk adres dat deze pagina mag benaderen, en geen daarvan is van ons. Er is hier geen eindpunt waar een geplakte factuur opgehaald zou kunnen worden, en er staat ook niets in de code dat hem erheen zou sturen als dat er wel was.
- **Niets hier haalt iets op.** Er is nergens in `src/` een `fetch`, een `XMLHttpRequest` of een `sendBeacon` te vinden. De parser en de printer zijn functies in deze pagina die een tekenreeks aannemen en een tekenreeks teruggeven.
- **Externe entiteiten worden nooit opgelost.** Een `DOCTYPE` met een externe entiteit erin is de manier waarop een XML-parser wordt overgehaald een bestand te lezen van de machine die aan het parsen is, en het is het oudste gat in het formaat. `src/shared/parse-xml.js` is een met de hand geschreven lezer waar helemaal geen entiteitsafhandeling in zit — niet uitgezet, afwezig — en deze pagina geeft je tekst ook nooit aan de eigen `DOMParser` van de browser.
- **Elke waarde die uit XML komt is een tekenreeks.** `<port>8080</port>` zegt niets over de vraag of dat een getal is, dus zegt de JSON `"8080"`. Dat voor je beslissen zou informatie verzinnen die daarna meereist alsof ze in het bestand had gestaan.
- **Wat Google laadt, en wat het niet krijgt.** De advertentie- en meetscripts komen van Google en de donatieknop van Buy Me a Coffee. Geen van hen krijgt een teken van je tekst. Elke regel die hem leest, parseert of schrijft wordt vanaf deze origin geserveerd en staat in de repository.
- **Het werkt offline.** Trek de netwerkstekker eruit en het gereedschap is onveranderd, want er zat nooit een netwerkstap in. Dat is het eenvoudigste bewijs dat er is.

**Controleer het zelf.** Je hoeft niets van het bovenstaande op ons woord aan te nemen. Een buildscript maakt deze pagina uit de sjablonen en de configuratie in de repository, en dat script kun je lezen en zelf draaien. Het resultaat staat vastgelegd op de branch `dist`, dus je kunt wat er geserveerd wordt vergelijken met wat een build van de bronnen oplevert: https://github.com/A-Box-of-Tools/website

De bestanden die je als eerste wilt lezen zijn `config/site.toml` voor de Content-Security-Policy, `src/shared/parse-xml.js` voor de parser die je vertelt welke tag nooit is gesloten, en `src/convert.js` voor waarom elke waarde als tekenreeks uit de XML komt in plaats van geraden te worden.
