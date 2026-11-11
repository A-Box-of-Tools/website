# Base64-codeerder & -decodeerder — en URL's, HTML-entiteiten, hex en escapes

Base64, procentcodering, HTML-entiteiten, hex en backslash-escapes, beide kanten op. Er wordt niets in andermans server geplakt.

> Codeer en decodeer Base64 in beide alfabetten, procentcodeer URL's, escape HTML-entiteiten en lees hex en backslash-escapes. Het draait allemaal in je browser en er wordt niets geüpload: een token verlaat je machine dus nooit.

Deze pagina is een interactief hulpmiddel dat volledig in je browser draait, op https://abox.tools/nl/base64-coderen/ — niets van wat je het geeft wordt geüpload. Hieronder staat alles wat de pagina er in woorden over zegt; om het te gebruiken, open je het adres.

## Je teksten worden **nooit geüpload**. Er is geen server.

Elke codering hier is rekenwerk op een tekenreeks, hier gedaan, in deze pagina. De codecs zijn met de hand geschreven en staan in `src/encode.js`; en meer is er niet. Deze tool heeft geen enkele netwerkfunctie, niets op te halen en niets te versturen, en dat telt hier zwaarder dan bijna waar ook: wat mensen in een online Base64-decodeerder plakken is een token, en een token in andermans website plakken is het afgeven.

- ✗ Geen upload
- ✗ Geen account
- ✗ Geen groottelimiet
- ✓ Werkt offline
- ✓ Open source

## Zo codeer of decodeer je Base64 zonder het te uploaden

1. **Kies de codering.** Base64 in beide alfabetten, procentcodering voor één waarde of een hele URL, de vijf HTML-entiteiten, hexbytes en de backslash-escapes van een tekenreeksliteral. Het briefje onder het menu zegt waar elk voor dient.
2. **Kies de richting.** *Coderen* neemt platte tekst en maakt er de gecodeerde vorm van; *Decoderen* brengt de gecodeerde vorm terug naar platte tekst. Het resultaat volgt je typen: van richting wisselen is één klik, zonder iets opnieuw te tikken.
3. **Plak hem, of sleep het bestand.** Alles wat je kunt selecteren en kopiëren werkt. Een bestand dat je op de kiezer sleept wordt door je eigen browser gelezen en in het vak gezet: er is hier geen uploadstap om over te slaan.
4. **Lees de fout, als die er is.** Een decodeerder die hier faalt zegt wat hij aantrof — een teken dat Base64 niet gebruikt, opvulling op de verkeerde plek, bytes die geen tekst zijn — in plaats van iets aannemelijks en fouts terug te geven.
5. **Neem het resultaat mee.** Kopieer het, of download het als tekstbestand. De tellers onder het vak zeggen hoeveel bytes erin gingen en hoeveel eruit kwamen.

## Ook in de gereedschapskist

- [Tekst en bestanden delen](https://abox.tools/nl/tekst-delen/): Wat je deelt leeft in dit open tabblad. Lezers halen het versleuteld rechtstreeks uit je browser, en het tabblad sluiten beëindigt het - geen server bewaart iets.
- [QR- & barcodegenerator](https://abox.tools/nl/qr-code-maken/): Tik het in, en het wordt een code. Er wordt niets verstuurd om er een te maken.
- [Qr- & barcodescanner](https://abox.tools/nl/qr-code-scannen/): Richt je camera erop, of sleep er een foto van hierheen. Het wordt hier gelezen, en nergens anders.
- [Hash en checksum](https://abox.tools/nl/checksum-controleren/): Controleer een download tegen het getal dat de maker erbij zette, zonder hem naar iemand te sturen.

## Vragen

### Wordt mijn tekst ergens naartoe geüpload?

Nee. Elke codeerder en elke decodeerder op deze pagina is een functie die in je eigen browser draait, op je eigen hardware. Deze tool heeft geen enkele netwerkfunctie: hij haalt nooit iets op en verstuurt nooit iets, en de `Content-Security-Policy` van de pagina noemt elk adres dat ze mag benaderen, waarvan er geen enkele van ons is. Dat is de reden om hem te gebruiken voor een toegangstoken of een sessiecookie: zoiets in andermans decodeerder plakken is het weggeven.

### Is de Base64 hier dezelfde Base64 als overal?

Ja: hij wordt getoetst aan de testvectoren uit RFC 4648 en niet aan zichzelf. Beide alfabetten decoderen, dus een JWT geschreven met `-` en `_` leest net zo makkelijk als een met `+` en `/`, en invoer die op 64 tekens is afgebroken wordt voor je aaneengeplakt. Coderen gaat via UTF-8-bytes, dus een letter met een accent of een emoji overleeft de heen- en terugweg.

### Is Base64 versleuteling?

Nee, en het daarvoor aanzien is de klassieke fout. Base64 is een spelling: dezelfde bytes, geschreven in een alfabet dat een URL, een e-mail of een JSON-tekenreeks overleeft. Iedereen kan het terugvertalen — deze pagina doet het in een milliseconde —, dus het verbergt niets en beschermt niets. Als wat je hebt geheim is, heeft het echte versleuteling nodig voordat het gecodeerd wordt, niet in plaats daarvan.

### Waarom mislukte het decoderen?

Omdat wat er geplakt is net niet is wat de codec verteld werd dat het was, en de fout zegt waar het aan ligt: een teken buiten het Base64-alfabet, opvulling op de verkeerde plek, een procentteken zonder twee hexcijfers erachter, of bytes die wel uit Base64 te decoderen zijn maar geen UTF-8-tekst zijn — wat meestal betekent dat het origineel een bestand was en geen tekenreeks. De `atob` van de browser had in plaats daarvan iets aannemelijks teruggegeven; het te horen krijgen is precies waarom je iets in een decodeerder plakt.

### Wat is het verschil tussen de twee webadres-coderingen?

Eén waarde, of het hele adres. *Eén waarde* coderen escapet alles waar een URL betekenis aan geeft — schuine strepen, vraagtekens, ampersands —, wat je wilt voor één parameter in een querystring. Een *hele URL* coderen laat het adres werken: de schuine strepen en het `?` blijven staan, en alleen de tekens die een URL helemaal niet kan dragen worden ge-escapet. Het eerste op een heel adres toepassen breekt het adres; het tweede op een waarde toepassen verliest waar de waarde ophoudt.

### Hoe groot mag het bestand zijn?

Hier is geen limiet ingesteld, want er is geen server die ervoor betaalt. Het echte plafond is je eigen machine: een paar megabyte tekst gaat prima, en bij een heel lang document wacht de pagina op een pauze in je typen voordat ze opnieuw codeert, in plaats van met je om het toetsenbord te vechten.

### Is het gratis, en heb ik een account nodig?

Het is gratis, en er komt geen account, geen inlog, geen proefperiode en geen limiet op hoeveel je plakt aan te pas. De site draait op advertenties, en die betalen hem; die advertenties krijgen niets over je tekst mee.

### Werkt het offline?

Ja. Laad de pagina één keer, verbreek daarna je internetverbinding en hij werkt gewoon door. Dat is meteen de eenvoudigste manier om te bewijzen dat er niets geüpload wordt, want een tool die je tekst wegstuurde om hem te laten decoderen zou ermee ophouden zodra je de stekker eruit trok.

## Hoe je de privacybelofte controleert

- **Wat je plakt kan nergens heen.** In de Content-Security-Policy staat elk adres dat deze pagina mag benaderen, en geen daarvan is van ons. Er is hier geen eindpunt waar een geplakt token verzameld zou kunnen worden, en er staat ook niets in de code dat het daarheen zou sturen als dat er wel was.
- **Niets hier haalt iets op.** Er staat nergens in `src/` een `fetch`, een `XMLHttpRequest` of een `sendBeacon`. Elke codeerder en elke decodeerder zijn functies in deze pagina die een tekenreeks aannemen en een tekenreeks teruggeven.
- **De decodeerder zegt het als er iets mis is.** De `atob` van de browser accepteert invoer die hij zou moeten weigeren en geeft iets aannemelijks terug. De Base64 hier is met de hand geschreven en wordt gecontroleerd tegen de testvectoren van RFC 4648, en als wat je plakte geen Base64 is, zegt hij dat, en zegt hij waarom. De tests in `tests/js/text-encode.test.js` controleren precies dat.
- **Wat Google laadt, en wat het niet te zien krijgt.** De advertentie- en meetscripts komen van Google, de doneerknop van Buy Me a Coffee. Geen van alle krijgt één teken van je tekst mee. Elke regel die hem leest, ontleedt of wegschrijft, wordt vanaf deze herkomst geserveerd en staat in de repository.
- **Het werkt offline.** Verbreek de verbinding en de tool werkt onveranderd door, omdat er nooit een netwerkstap in zat. Eenvoudiger bewijs bestaat er niet.

**Controleer het zelf.** Je hoeft niets van het bovenstaande op ons woord aan te nemen. Een buildscript maakt deze pagina uit de sjablonen en de configuratie in de repository, en dat script kun je lezen en zelf draaien. Het resultaat staat vastgelegd op de branch `dist`, dus je kunt wat er geserveerd wordt vergelijken met wat een build van de bronnen oplevert: https://github.com/A-Box-of-Tools/website

De bestanden die je als eerste wilt lezen zijn `config/site.toml` voor de Content-Security-Policy en `src/encode.js` voor de Base64 die tegen de testvectoren van RFC 4648 wordt gecontroleerd in plaats van tegen zichzelf, en die foute invoer weigert in plaats van iets aannemelijks terug te geven zoals `atob` doet.
