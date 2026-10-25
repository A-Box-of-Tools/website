# JSON-formatter — netjes neerzetten, platdrukken of omzetten

JSON, XML, HTML, CSS en YAML, geformatteerd of omgezet. Er wordt niets in andermans server geplakt.

> Formatteer en verklein JSON, XML, HTML, CSS en YAML, en zet JSON om naar YAML of XML en terug. De parsers draaien in je browser en er wordt niets geüpload: een token of een configuratiebestand verlaat je machine dus nooit.

Deze pagina is een interactief hulpmiddel dat volledig in je browser draait, op https://abox.tools/nl/json-formatteren/ — niets van wat je het geeft wordt geüpload. Hieronder staat alles wat de pagina er in woorden over zegt; om het te gebruiken, open je het adres.

## Je tekst en code worden **nooit geüpload**. Er is geen server.

Formatteren en omzetten zijn rekenwerk op een tekenreeks, hier gedaan, in deze pagina. De parsers zijn met de hand geschreven en staan in `src/`: `shared/parse-json.js`, `shared/parse-xml.js`, `css.js`, `shared/parse-yaml.js`; en meer is er niet. Deze tool heeft geen enkele netwerkfunctie, niets op te halen en niets te versturen, en dat telt hier zwaarder dan bijna waar ook op deze site: wat mensen in een formatter plakken zijn toegangstokens, sessiecookies, klantgegevens en nog niet uitgebrachte code.

- ✗ Geen upload
- ✗ Geen account
- ✗ Geen groottelimiet
- ✓ Werkt offline
- ✓ Open source

## Zo formatteer of zet je JSON om zonder het te uploaden

1. **Kies de klus.** Twee tabbladen, één vak: *Formatteren* zet JSON, XML, HTML, CSS en YAML netjes neer of drukt ze plat; *Omzetten* maakt van JSON YAML of XML en terug. De tekst die je net formatteerde is de tekst die je omzet, zonder hem twee keer te plakken.
2. **Plak hem, of sleep het bestand.** Alles wat je kunt selecteren en kopiëren werkt. Een bestand dat je op de kiezer sleept wordt door je eigen browser gelezen en in het vak gezet: er is hier geen uploadstap om over te slaan.
3. **Laat hem de taal uitzoeken, of zeg het.** Het menu zegt waarvoor hij de tekst hield, en dat corrigeren is één klik. Een gok is niet meer dan een startpunt, en daarom wordt hij getoond in plaats van stilletjes toegepast.
4. **Kies de inspringing, of pers het plat.** Twee spaties, vier, of een tab. Platgeperst is hetzelfde document met elke spatie die er alleen stond om het te kunnen lezen eruit gehaald, en het resultaat zegt hoeveel bytes dat scheelde.
5. **Lees de fout waar de fout zit.** Een parser die het hier opgeeft zegt wat hij aantrof en op welke regel en kolom, in plaats van “onverwacht token op positie 4193”. Dat is meestal genoeg om een configuratiebestand te repareren zonder verder iets te openen.
6. **Neem het resultaat mee.** Kopieer het, of download het als bestand, genoemd naar de taal waarin het eruit kwam.

## De uitgebreide versie

[JSON formatteren zonder het aan iemand te geven](https://abox.tools/nl/gidsen/json-formatteren/): JSON in je eigen browser uitlijnen, controleren en verkleinen: wat een formatteerder nooit aan je bestand mag veranderen, hoe je de foutmelding leest, en waarom het uitmaakt in welk vak je het plakt.

## Ook in de gereedschapskist

- [YAML-naar-JSON-omzetter](https://abox.tools/nl/yaml-naar-json-omzetten/): Beide richtingen, en het zegt wat elke richting kost. Niets ervan wordt in de server van iemand anders geplakt.
- [XML-formatter](https://abox.tools/nl/xml-formatteren/): XML uitgelegd om te lezen of plat geperst om te versturen, en beide kanten op omgezet naar JSON. Niets ervan wordt in de server van iemand anders geplakt.
- [Tekstvergelijker](https://abox.tools/nl/tekst-vergelijken/): Twee teksten erin, elk verschil gemarkeerd, regel voor regel en woord voor woord. Er wordt niets in andermans server geplakt.
- [Base64-codeerder & -decodeerder](https://abox.tools/nl/base64-coderen/): Base64, procentcodering, HTML-entiteiten, hex en backslash-escapes, beide kanten op. Er wordt niets in andermans server geplakt.

## Vragen

### Wordt mijn tekst ergens naartoe geüpload?

Nee. Elke parser en elke schrijver op deze pagina is een functie die in je eigen browser draait, op je eigen hardware. Deze tool heeft geen enkele netwerkfunctie: hij haalt nooit iets op en verstuurt nooit iets, en de `Content-Security-Policy` van de pagina noemt elk adres dat ze mag benaderen, waarvan er geen enkele van ons is. Dat is de reden om hem te gebruiken voor een toegangstoken, een sessiecookie of een klantgegeven: zoiets in andermans formatter plakken is het weggeven.

### Verandert JSON formatteren iets anders dan de opmaak?

Nee, en dat is lastiger dan het klinkt. Sleutels houden de volgorde waarin je ze schreef: een formatter die op `JSON.parse` is gebouwd verplaatst sleutels die op gehele getallen lijken stilletjes naar voren, dus `{"10":a,"2":b}` komt terug als `{"2":b,"10":a}`. Getallen houden de cijfers die je typte, dus een id van twintig cijfers raakt zijn laatste drie niet kwijt aan een double en `1e999` wordt geen `null`. Dubbele sleutels blijven allebei staan, want de standaard zegt niet welke wint en er eentje weggooien zou voor jou kiezen zijn.

### Welke talen kan hij formatteren?

JSON, XML, HTML, CSS en YAML. JSON, XML, HTML en CSS kunnen ook platgeperst worden; YAML niet, want zijn korte vorm is flowstijl, en die is onleesbaar, en onleesbaar is het tegenovergestelde van de reden om een bestand in YAML te houden. JavaScript staat er met opzet niet bij: zie de vraag daarover hieronder.

### Waarom formatteert hij geen JavaScript, Python of SQL?

Omdat een programmeertaal netjes neerzetten betekent dat je hem echt moet ontleden, en een formatter die het bijna goed doet is erger dan geen: hij levert code op die er prima uitziet en iets anders doet. JSON, XML, CSS en YAML hebben grammatica's die klein genoeg zijn om met de hand te lezen en met tests te controleren die je zelf kunt draaien. Een JavaScript-formatter is Prettier, en dat is een megabyte parser, die thuishoort in je editor en niet op een webpagina.

### Mijn YAML zegt no en de JSON kwam eruit als tekenreeks. Waarom?

Omdat het een tekenreeks ís, en dit YAML 1.2 leest en geen 1.1. In YAML 1.1 waren `yes`, `no`, `on` en `off` booleans, en dat is de beroemde bug die de landcode van Noorwegen in `false` verandert. YAML 1.2 heeft dat geschrapt en deze tool ook: alleen `true`, `false`, `null` en `~` worden als iets anders dan tekst gelezen. De andere kant op worden die woorden *tussen aanhalingstekens* teruggeschreven, ook al zou deze tool ze zonder die tekens ook als tekst lezen, want wat het bestand daarna opent misschien niet. PyYAML staat nog altijd standaard op 1.1. Streng lezen en behoudend schrijven is de enige combinatie die beide kanten op klopt.

### Wat gaat er verloren bij het omzetten van YAML naar JSON?

Opmerkingen, want JSON heeft er geen plek voor. Ankers, aliassen en tags worden botweg geweigerd in plaats van geraden: elk daarvan zegt iets wat JSON niet kan zeggen, en een omzetter die stilletjes een uitleg koos zou je een document geven dat niet is wat het bestand zei. De andere kant op gaat er niets verloren: elk JSON-document is al een YAML-document.

### Wat gaat er verloren bij het omzetten van JSON naar XML?

Het verschil tussen een leeg object, een lege array en een lege tekenreeks, die alle drie een leeg element worden, en het type van elke waarde, want XML heeft geen types. Daarom laat de omgekeerde omzetting alles tekenreeks in plaats van te besluiten dat `8080` een getal was. Een array wordt een herhaald element, want dat is de enige vorm die weer teruggelezen kan worden, en bij een sleutel die een elementnaam niet kan dragen worden de lastige tekens vervangen, in plaats van een document uit te spugen dat geen enkele parser leest.

### Verandert HTML opnieuw inspringen hoe de pagina eruitziet?

Dat kan, en daar is deze tool eerlijk over. Witruimte tussen twee inline-elementen is een spatie tussen twee woorden, dus die verplaatsen is niet gratis. Twee dingen houden dat in toom: `<pre>` en `<textarea>` worden precies overgenomen zoals ze waren, en een element dat niets dan tekst bevat blijft op één regel staan. Al het andere wordt netjes neergezet.

### Hoe groot mag het bestand zijn?

Hier is geen limiet ingesteld, want er is geen server die ervoor betaalt. Het echte plafond is je eigen machine: een paar megabyte JSON gaat prima, en bij een heel lang document wacht de pagina op een pauze in je typen voordat ze opnieuw formatteert, in plaats van met je om het toetsenbord te vechten.

### Is het gratis, en heb ik een account nodig?

Het is gratis, en er komt geen account, geen inlog, geen proefperiode en geen limiet op hoeveel je plakt aan te pas. De site draait op advertenties, en die betalen hem; die advertenties krijgen niets over je tekst mee.

### Werkt het offline?

Ja. Laad de pagina één keer, verbreek daarna je internetverbinding en hij werkt gewoon door. Dat is meteen de eenvoudigste manier om te bewijzen dat er niets geüpload wordt, want een tool die je tekst wegstuurde om hem te laten formatteren zou ermee ophouden zodra je de stekker eruit trok.

## Hoe je de privacybelofte controleert

- **Wat je plakt kan nergens heen.** In de Content-Security-Policy staat elk adres dat deze pagina mag benaderen, en geen daarvan is van ons. Er is hier geen eindpunt waar een geplakt token verzameld zou kunnen worden, en er staat ook niets in de code dat het daarheen zou sturen als dat er wel was.
- **Niets hier haalt iets op.** Er staat nergens in `src/` een `fetch`, een `XMLHttpRequest` of een `sendBeacon`. Elke parser en elke schrijver zijn functies in deze pagina die een tekenreeks aannemen en een tekenreeks teruggeven.
- **De formatters houden wat ze kregen.** Een JSON-object komt terug met zijn sleutels in de volgorde waarin je ze schreef en met zijn getallen gespeld zoals jij ze spelde, want `src/shared/parse-json.js` is een parser en geen aanroep van `JSON.parse`, die sleutels die op gehele getallen lijken naar voren haalt en een id van twintig cijfers in de dichtstbijzijnde double verandert. De tests in `tests/js/text-format.test.js` controleren precies dat.
- **Wat Google laadt, en wat het niet te zien krijgt.** De advertentie- en meetscripts komen van Google, de doneerknop van Buy Me a Coffee. Geen van alle krijgt één teken van je tekst mee. Elke regel die hem leest, ontleedt of wegschrijft, wordt vanaf deze herkomst geserveerd en staat in de repository.
- **Het werkt offline.** Verbreek de verbinding en de tool werkt onveranderd door, omdat er nooit een netwerkstap in zat. Eenvoudiger bewijs bestaat er niet.

**Controleer het zelf.** Je hoeft niets van het bovenstaande op ons woord aan te nemen. Een buildscript maakt deze pagina uit de sjablonen en de configuratie in de repository, en dat script kun je lezen en zelf draaien. Het resultaat staat vastgelegd op de branch `dist`, dus je kunt wat er geserveerd wordt vergelijken met wat een build van de bronnen oplevert: https://github.com/A-Box-of-Tools/website

De bestanden die je als eerste wilt lezen zijn `config/site.toml` voor de Content-Security-Policy, `src/shared/parse-json.js` voor de parser die je sleutels in de volgorde laat staan waarin je ze schreef, en `src/convert.js` voor waarom een omzetting één parser en één schrijver is, zonder iets ertussen dat beide formaten tegelijk kent.
