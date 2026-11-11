# YAML naar JSON — en JSON terug naar YAML

Beide richtingen, en het zegt wat elke richting kost. Niets ervan wordt in de server van iemand anders geplakt.

> Zet YAML om naar JSON en JSON naar YAML in je browser. Het leest YAML 1.2, dus yes en no blijven tekenreeksen, en het zegt precies wat elke richting kost. Er wordt niets geüpload, dus een configuratiebestand blijft op je eigen apparaat.

Deze pagina is een interactief hulpmiddel dat volledig in je browser draait, op https://abox.tools/nl/yaml-naar-json-omzetten/ — niets van wat je het geeft wordt geüpload. Hieronder staat alles wat de pagina er in woorden over zegt; om het te gebruiken, open je het adres.

## Je YAML- en JSON-bestanden worden **nooit geüpload**. Er is geen server.

Omzetten is rekenen aan een tekenreeks, hier, in deze pagina. De twee parsers zijn met de hand geschreven en staan in `src/` — `shared/parse-yaml.js` en `shared/parse-json.js` — en meer is er niet. Dit gereedschap heeft überhaupt geen netwerkfunctie — niets op te halen, niets te versturen — en dat weegt hier zwaarder dan bijna overal anders op deze site: een YAML-bestand is meestal een deployconfiguratie, en een deployconfiguratie zit meestal vol hostnamen, bucketnamen en geheimen.

- ✗ Geen upload
- ✗ Geen account
- ✗ Geen groottelimiet
- ✓ Werkt offline
- ✓ Open source

## Zo zet je YAML om naar JSON zonder het te uploaden

1. **Kies de richting.** *YAML naar JSON* of *JSON naar YAML*. De opmerking onder het menu zegt wat die richting kost voordat je iets plakt, en niet erna.
2. **Plak het, of zet het bestand neer.** Alles wat je kunt selecteren en kopiëren werkt. Een bestand dat je op de kiezer zet wordt door je eigen browser gelezen en in het vak gezet — er is geen uploadstap om over te slaan — en een `.json`- of `.yaml`-extensie kiest de richting alvast voor je.
3. **Kies de inspringing.** Twee spaties, vier, of een tab. De tab wordt alleen voor JSON aangeboden: YAML is in termen van spaties gedefinieerd, en een tab is daarin geen geldige inspringing.
4. **Lees de fout waar de fout zit.** Een parser die hier vastloopt zegt wat hij aantrof en op welke regel en kolom, in plaats van ‚onverwacht token op positie 4193‘. Dat is meestal genoeg om een configuratiebestand te repareren zonder iets anders te openen.
5. **Neem het resultaat mee.** Kopieer het, of download het als bestand, genoemd naar het formaat waarin het eruit kwam.

## Ook in de gereedschapskist

- [XML-formatter](https://abox.tools/nl/xml-formatteren/): XML uitgelegd om te lezen of plat geperst om te versturen, en beide kanten op omgezet naar JSON. Niets ervan wordt in de server van iemand anders geplakt.
- [Tekstvergelijker](https://abox.tools/nl/tekst-vergelijken/): Twee teksten erin, elk verschil gemarkeerd, regel voor regel en woord voor woord. Er wordt niets in andermans server geplakt.
- [Base64-codeerder & -decodeerder](https://abox.tools/nl/base64-coderen/): Base64, procentcodering, HTML-entiteiten, hex en backslash-escapes, beide kanten op. Er wordt niets in andermans server geplakt.
- [Tekst en bestanden delen](https://abox.tools/nl/tekst-delen/): Wat je deelt leeft in dit open tabblad. Lezers halen het versleuteld rechtstreeks uit je browser, en het tabblad sluiten beëindigt het - geen server bewaart iets.

## Vragen

### Wordt mijn YAML ergens geüpload?

Nee. Beide parsers en beide printers op deze pagina zijn functies die in je eigen browser draaien, op je eigen hardware. Dit gereedschap heeft überhaupt geen netwerkfunctie — het haalt nooit iets op en stuurt nooit iets weg — en in het `Content-Security-Policy` van de pagina staat elk adres dat ze mag benaderen, en geen daarvan is van ons. Dat is precies de reden om het voor een deployconfiguratie te gebruiken: die zitten vol hostnamen, bucketnamen en af en toe een geheim dat iemand wilde verplaatsen, en er een in de omzetter van iemand anders plakken is hem weggeven.

### Wat gaat er verloren bij het omzetten van YAML naar JSON?

De commentaren, want JSON heeft nergens plaats voor een. Ankers, aliassen en tags worden ronduit geweigerd in plaats van geraden — ze zeggen elk iets wat JSON niet kan zeggen, en een omzetter die stilletjes een uitleg koos zou je een document geven dat niet is wat het bestand zei. De andere richting verliest niets: elk JSON-document is al een YAML-document.

### Mijn YAML zegt no en de JSON kwam eruit als tekenreeks. Waarom?

Omdat het er een is, en dit YAML 1.2 leest in plaats van 1.1. In YAML 1.1 waren `yes`, `no`, `on` en `off` booleans, en dat is de beroemde bug die de landcode van Noorwegen in `false` verandert. YAML 1.2 heeft dat laten vallen en dit ook: alleen `true`, `false`, `null` en `~` worden als iets anders dan tekst gelezen. De andere kant op worden die woorden *tussen aanhalingstekens* teruggeschreven, ook al zou dit ze zonder ook als tekst lezen, want wat het bestand daarna opent doet dat misschien niet. PyYAML gebruikt nog steeds 1.1 als standaard. Streng lezen en behoudend schrijven is de enige combinatie die beide kanten op klopt.

### Blijft de volgorde van mijn sleutels bewaard?

Ja, beide kanten op, en dat is lastiger dan het klinkt. Een omzetter die op `JSON.parse` gebouwd is schuift sleutels die op gehele getallen lijken stilletjes naar voren, dus `{"10":a,"2":b}` komt terug als `{"2":b,"10":a}`. Getallen houden de cijfers die je typte, dus een rekeningnummer van twintig cijfers raakt zijn laatste drie niet kwijt aan een double. Wil je ze *wel* gesorteerd, dan is er een vinkje, en dat sorteert naar hoe de sleutels lezen in plaats van naar hun codepunten.

### Kan het meerdere YAML-documenten tegelijk omzetten?

Nee, en het zegt dat in plaats van er een te kiezen. Een bestand met `---`-scheidingen bevat meer dan één document, en JSON heeft geen vorm die ‚meerdere documenten‘ betekent — een array zou een bewering zijn die het bestand nooit deed. Zet ze een voor een om.

### Waarom is er hier geen YAML-formatter?

Omdat YAML geen samengeperste vorm heeft die het schrijven waard is: de korte is flow-stijl, die onleesbaar is, en onleesbaar is het tegendeel van de reden om een bestand in YAML te houden. JSON, XML, HTML en CSS uitleggen is het werk van de [JSON-formatter](https://abox.tools/nl/json-formatteren/), en die legt YAML ook uit.

### Hoe groot mag het bestand zijn?

Er is hier geen limiet ingesteld, want er is geen server die ervoor betaalt. Het echte plafond is je eigen apparaat: een paar megabyte YAML gaat prima, en bij een heel lang document wacht de pagina op een pauze in je typen voordat ze omzet, in plaats van met je om het toetsenbord te vechten.

### Is het gratis, en heb ik een account nodig?

Het is gratis, en er is geen account, geen inloggen, geen proefperiode en geen limiet op hoeveel je plakt. De site draait op advertenties, want die betalen hem; de advertenties krijgen niets over je tekst.

### Werkt het offline?

Ja. Laad de pagina één keer, trek daarna de stekker uit het internet en ze blijft werken. Dat is meteen de eenvoudigste manier om te bewijzen dat er niets geüpload wordt: gereedschap dat je configuratie wegstuurt om omgezet te worden zou stoppen op het moment dat je de stekker eruit trekt.

## Hoe je de privacybelofte controleert

- **Wat je plakt kan nergens heen.** In het Content-Security-Policy staat elk adres dat deze pagina mag benaderen, en geen daarvan is van ons. Er is hier geen eindpunt waar een geplakte configuratie opgehaald zou kunnen worden, en er staat ook niets in de code dat hem erheen zou sturen als dat er wel was.
- **Niets hier haalt iets op.** Er is nergens in `src/` een `fetch`, een `XMLHttpRequest` of een `sendBeacon` te vinden. Beide parsers en beide printers zijn functies in deze pagina die een tekenreeks aannemen en een tekenreeks teruggeven.
- **Het leest YAML 1.2, dus Noorwegen blijft Noorwegen.** In YAML 1.1 was `no` een boolean, en dat is de beroemde bug die de landcode van Noorwegen in `false` verandert. Dit leest 1.2, waar het de tekenreeks is waar het op lijkt. De andere kant op worden die woorden *tussen aanhalingstekens* teruggeschreven, want wat het bestand daarna opent kan nog steeds een 1.1-lezer zijn. `tests/js/text-convert.test.js` controleert beide helften.
- **Een omzetting die niet eerlijk kan zijn stopt liever.** Een anker, een alias of een tag in de YAML beëindigt de omzetting met een melding op welke regel het staat, in plaats van een JSON-document dat stilletjes iets anders betekent. JSON heeft geen manier om ‚dezelfde node twee keer‘ te zeggen, en een uitleg kiezen zou voor jou beslissen zijn.
- **Wat Google laadt, en wat het niet krijgt.** De advertentie- en meetscripts komen van Google en de donatieknop van Buy Me a Coffee. Geen van hen krijgt een teken van je tekst. Elke regel die hem leest, parseert of schrijft wordt vanaf deze origin geserveerd en staat in de repository.
- **Het werkt offline.** Trek de netwerkstekker eruit en het gereedschap is onveranderd, want er zat nooit een netwerkstap in. Dat is het eenvoudigste bewijs dat er is.

**Controleer het zelf.** Je hoeft niets van het bovenstaande op ons woord aan te nemen. Een buildscript maakt deze pagina uit de sjablonen en de configuratie in de repository, en dat script kun je lezen en zelf draaien. Het resultaat staat vastgelegd op de branch `dist`, dus je kunt wat er geserveerd wordt vergelijken met wat een build van de bronnen oplevert: https://github.com/A-Box-of-Tools/website

De bestanden die je als eerste wilt lezen zijn `config/site.toml` voor de Content-Security-Policy, `src/shared/parse-yaml.js` voor de lezer die een anker weigert in plaats van te raden wat het betekende, en `src/convert.js` voor waarom een omzetting één parser en één printer is, met niets ertussen dat beide formaten tegelijk kent.
