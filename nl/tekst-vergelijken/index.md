# Tekstvergelijker — twee teksten vergelijken, naast elkaar

Twee teksten erin, elk verschil gemarkeerd, regel voor regel en woord voor woord. Er wordt niets in andermans server geplakt.

> Vergelijk twee teksten en zie elk verschil, regel voor regel en woord voor woord, naast elkaar of in één kolom. De vergelijking draait in je browser en er wordt niets geüpload: nog niet uitgebrachte code verlaat je machine dus nooit.

Deze pagina is een interactief hulpmiddel dat volledig in je browser draait, op https://abox.tools/nl/tekst-vergelijken/ — niets van wat je het geeft wordt geüpload. Hieronder staat alles wat de pagina er in woorden over zegt; om het te gebruiken, open je het adres.

## Je teksten worden **nooit geüpload**. Er is geen server.

Een vergelijking is rekenwerk op twee tekenreeksen, hier gedaan, in deze pagina. Het algoritme is dat van Myers — hetzelfde dat `git diff` gebruikt —, met de hand geschreven in `src/diff.js`, waar je het kunt nalezen. Deze tool heeft geen enkele netwerkfunctie, niets op te halen en niets te versturen, en dat telt hier: wat mensen vergelijken zijn contracten, configuratiebestanden en nog niet uitgebrachte code, altijd in paren.

- ✗ Geen upload
- ✗ Geen account
- ✗ Geen groottelimiet
- ✓ Werkt offline
- ✓ Open source

## Zo vergelijk je twee teksten zonder ze te uploaden

1. **Plak de twee teksten, of sleep de twee bestanden.** Het origineel links, de gewijzigde versie rechts. Twee bestanden die je tegelijk op de kiezer sleept landen aan weerskanten, in de volgorde waarin je ze losliet; wissel de kanten om als het andersom was.
2. **Kies hoe je het leest.** Naast elkaar, of in één kolom. Een telefoon begint in één kolom, want naast elkaar vraagt twee kolommen tekst en op een telefoon past er ongeveer één; het menu staat er hoe dan ook naast.
3. **Negeer wat er niet toe doet.** Witruimte, hoofd- en kleine letters, lege regels — elk apart te negeren, zodat een opnieuw geformatteerd bestand niet leest als honderd wijzigingen. Standaard wordt het ongewijzigde middenstuk opgevouwen tot een telling, met drie regels aan weerszijden van elke wijziging.
4. **Lees wat er veranderde.** Verwijderde regels zijn links gemarkeerd, toegevoegde rechts, en binnen een gewijzigde regel zijn de woorden die verschillen uitgelicht — een diff van twee alinea's toont dus het woord dat verschoof en niet twee hele alinea's.
5. **Neem de patch mee.** De download is een `.patch` in het unified-formaat, precies wat een codereview, `git apply` en elke diff-viewer verwachten. Kopiëren zet hetzelfde op je klembord.

## De uitgebreide versie

[Zo vergelijk je twee JSON-bestanden](https://abox.tools/nl/gidsen/twee-json-bestanden-vergelijken/): Formatteer beide bestanden hetzelfde, sorteer de sleutels, en vergelijk dan. Waarom een rauwe JSON-diff vooral ruis is, hoe je beide kanten in de browser in canonieke vorm brengt, en wat er overleeft tot in de patch.

## Ook in de gereedschapskist

- [Base64-codeerder & -decodeerder](https://abox.tools/nl/base64-coderen/): Base64, procentcodering, HTML-entiteiten, hex en backslash-escapes, beide kanten op. Er wordt niets in andermans server geplakt.
- [Tekst en bestanden delen](https://abox.tools/nl/tekst-delen/): Wat je deelt leeft in dit open tabblad. Lezers halen het versleuteld rechtstreeks uit je browser, en het tabblad sluiten beëindigt het - geen server bewaart iets.
- [QR- & barcodegenerator](https://abox.tools/nl/qr-code-maken/): Tik het in, en het wordt een code. Er wordt niets verstuurd om er een te maken.
- [Qr- & barcodescanner](https://abox.tools/nl/qr-code-scannen/): Richt je camera erop, of sleep er een foto van hierheen. Het wordt hier gelezen, en nergens anders.

## Vragen

### Worden mijn teksten ergens naartoe geüpload?

Nee. De vergelijking is een functie die in je eigen browser draait, op je eigen hardware. Deze tool heeft geen enkele netwerkfunctie: hij haalt nooit iets op en verstuurt nooit iets, en de `Content-Security-Policy` van de pagina noemt elk adres dat ze mag benaderen, waarvan er geen enkele van ons is. Dat is de reden om hem te gebruiken voor een contract, een configuratiebestand of niet uitgebrachte code: zoiets in andermans vergelijker plakken is beide versies tegelijk weggeven.

### Wat doet die vergelijking eigenlijk?

Hij zoekt de kortste reeks bewerkingen die de linkertekst in de rechtertekst verandert, met het algoritme van Myers, hetzelfde dat `git diff` gebruikt. Dat het de kortste is, is precies wat een diff leesbaar maakt: een regel die in het midden wordt ingevoegd hoort als één invoeging te verschijnen en niet alsof elke regel erna veranderd is. Binnen een gewijzigde regel worden ook de woorden gemarkeerd die verschillen, dus een diff van twee alinea's laat het verschoven woord zien in plaats van twee hele alinea's.

### Kan hij twee bestanden vergelijken in plaats van twee plakjes tekst?

Ja. Sleep ze allebei tegelijk op de kiezer en ze landen aan weerskanten, in de volgorde waarin je ze losliet. Je browser leest ze in deze pagina, en verder gaan ze nergens heen. Wissel de kanten om als je ze verkeerd om hebt neergezet.

### Wat komt er uit een vergelijking, en kan ik dat toepassen?

De download is een unified diff: het `@@ -3,5 +3,5 @@`-formaat dat `git apply`, `patch` en elk code-reviewhulpmiddel lezen. Kopiëren doet hetzelfde naar je klembord. Wat op het scherm staat is een weergave daarvan: naast elkaar, of in één kolom, met de onveranderde stukken tot een aantal ingeklapt tenzij je ze allemaal vraagt.

### Kan hij witruimte, hoofdletters of lege regels negeren?

Ja, elk apart. Witruimte negeren laat een opnieuw geformatteerd bestand als ongewijzigd vergelijken; hoofd- en kleine letters negeren behandelt `Error` en `error` als hetzelfde woord; lege regels negeren slaat de regels over die niets dragen. De tellers boven het resultaat zeggen dan dat de twee gelijk zijn zodra de verschillen die je vroeg te negeren genegeerd zijn — wat niet dezelfde bewering is als identiek, en de pagina houdt die twee beweringen uit elkaar.

### Hoe groot mag de vergelijking zijn?

Hier is geen limiet ingesteld, want er is geen server die ervoor betaalt. Twee teksten van twintigduizend regels met een handvol wijzigingen vergelijken meteen, want het gedeelde begin en einde worden weggeknipt voordat het echte werk begint. Een vergelijking van twee teksten die helemaal niets gemeen hebben stopt vroeg en zegt dat, in plaats van een minuut te besteden aan het bewijzen van het vanzelfsprekende; en een heel lange vergelijking tekent de eerste paar duizend regels en laat de rest aan de gedownloade patch.

### Is het gratis, en heb ik een account nodig?

Het is gratis, en er komt geen account, geen inlog, geen proefperiode en geen limiet op hoeveel je plakt aan te pas. De site draait op advertenties, en die betalen hem; die advertenties krijgen niets over je tekst mee.

### Werkt het offline?

Ja. Laad de pagina één keer, verbreek daarna je internetverbinding en hij werkt gewoon door. Dat is meteen de eenvoudigste manier om te bewijzen dat er niets geüpload wordt, want een tool die je teksten wegstuurde om ze te laten vergelijken zou ermee ophouden zodra je de stekker eruit trok.

## Hoe je de privacybelofte controleert

- **Wat je plakt kan nergens heen.** In de Content-Security-Policy staat elk adres dat deze pagina mag benaderen, en geen daarvan is van ons. Er is hier geen eindpunt waar een geplakt token verzameld zou kunnen worden, en er staat ook niets in de code dat het daarheen zou sturen als dat er wel was.
- **Niets hier haalt iets op.** Er staat nergens in `src/` een `fetch`, een `XMLHttpRequest` of een `sendBeacon`. De vergelijking is een functie in deze pagina die twee tekenreeksen aanneemt en teruggeeft wat er veranderde.
- **Het algoritme is het standaardalgoritme, integraal na te lezen.** Het kortste-bewerkingsscript-algoritme van Myers, hetzelfde dat `git diff` gebruikt, met de hand geschreven in `src/diff.js` met de beslissingen erbij becommentarieerd. De tests in `tests/js/text-diff.test.js` bewijzen dat de verwijderingen de linkertekst weer opbouwen en de invoegingen de rechter, en dat is wat correct betekent voor een diff.
- **Wat Google laadt, en wat het niet te zien krijgt.** De advertentie- en meetscripts komen van Google, de doneerknop van Buy Me a Coffee. Geen van alle krijgt één teken van je tekst mee. Elke regel die hem leest, ontleedt of wegschrijft, wordt vanaf deze herkomst geserveerd en staat in de repository.
- **Het werkt offline.** Verbreek de verbinding en de tool werkt onveranderd door, omdat er nooit een netwerkstap in zat. Eenvoudiger bewijs bestaat er niet.

**Controleer het zelf.** Je hoeft niets van het bovenstaande op ons woord aan te nemen. Een buildscript maakt deze pagina uit de sjablonen en de configuratie in de repository, en dat script kun je lezen en zelf draaien. Het resultaat staat vastgelegd op de branch `dist`, dus je kunt wat er geserveerd wordt vergelijken met wat een build van de bronnen oplevert: https://github.com/A-Box-of-Tools/website

De bestanden die je als eerste wilt lezen zijn `config/site.toml` voor de Content-Security-Policy en `src/diff.js` voor het algoritme van Myers, de woord-voor-woordronde binnen elke gewijzigde regel en de drie beveiligingen die voorkomen dat een pathologische vergelijking de pagina bevriest.
