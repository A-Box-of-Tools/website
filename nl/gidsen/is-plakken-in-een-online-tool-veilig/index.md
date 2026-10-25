# Is het veilig om tekst in een online tool te plakken?

Plakken voelt niet als uploaden, en dat is de val: dezelfde bytes verlaten je machine hoe dan ook als de pagina ze verstuurt. Dit gaat over wat een geplakte config of log werkelijk meedraagt — en over hoe je ziet of de tool voor je neus überhaupt ergens heen kan sturen.

Laatst bijgewerkt 26 augustus 2026

## Het korte antwoord

Tekst in een webpagina plakken kan precies zulke gevolgen hebben als er een bestand naartoe uploaden. Dat het niet zo voelt, komt doordat het gebaar uit een veilige buurt stamt: tussen twee eigen vensters verplaatst plakken tekst van een plek onder jouw beheer naar een andere plek onder jouw beheer. Op een webpagina is die tweede plek een tekstvak dat een script kan lezen — en wat er daarna gebeurt, bepaalt de pagina, niet het gebaar.

Heel wat tools in plakvorm doen hun werk op een server: de pagina stuurt je tekst weg, de server formatteert, valideert of vergelijkt, en het resultaat komt terug. Niets op het scherm vertelt welke van de twee soorten je gebruikt. Het tekstvak ziet er hetzelfde uit; de knop “Formatteren” ook. Het verschil is één netwerkverzoek, onzichtbaar tot je ernaar kijkt.

## Wat een plak werkelijk meedraagt

Wat in online tools belandt, is zelden proza. Het is de werktekst van iemands vak, en het genre doet ertoe, want een paar van de gevoeligste tekenreeksen in de informatica zijn precies die welke om middernacht in formatters worden geplakt:

- **Configuratiebestanden** bestaan om te bevatten wat een programma niet hard mag inbakken, en die dingen zijn databasewachtwoorden, API-sleutels en ondertekeningsgeheimen. Een config die in zijn geheel geplakt wordt, draagt ze allemaal.
- **Logs en stacktraces** dragen sessietokens in URL's, e-mailadressen, interne machinenamen en af en toe de body van een verzoek met iemands persoonsgegevens erin.
- **API-antwoorden** zijn momentopnamen van productiedata — echte klanten, echte saldi — ergens gemakkelijks geplakt om gelezen te worden.
- **Alles wat op base64 lijkt** en in een decoder beland, werd meestal gecodeerd omdat het ertoe deed: een token dat gedebugd wordt, een certificaat, een authenticatieheader.

Een sleutel die langs de server van een vreemde is gereisd, moet als blootgelegd gelden op het moment dat je het merkt: intrekken en opnieuw uitgeven, wat op een productiesysteem een middag is die niemand had ingepland. Het punt is niet dat formatter-sites inloggegevens oogsten. Het punt is dat je niet kunt weten wat een server logt, en een geheim waarvan je de blootstelling niet kunt uitsluiten, is een geheim dat je moet vervangen.

## Waarom de tool je tekst niet nodig heeft

Hier is het technische feit dat de vraag beslecht: tekst formatteren, valideren, converteren en vergelijken behoren tot de makkelijkste klussen in de informatica. JSON parsen, XML inspringen, twee bestanden vergelijken, base64 coderen — een browser doet het in milliseconden, lokaal, en kan dat al jaren. Een server voegt niets aan de klus toe. Wanneer een plak-tool je tekst uploadt, is dat een architectuurrestje of een gemak voor de beheerder, nooit een noodzaak van het werk.

Daarvan zijn de teksttools van deze site het tegenvoorbeeld. De [JSON-formatter](https://abox.tools/nl/json-formatteren/) parseert, formatteert en converteert JSON, XML, HTML, CSS en YAML; de [tekstvergelijker](https://abox.tools/nl/tekst-vergelijken/) markeert elk verschil tussen twee teksten, regel voor regel en woord voor woord; de [base64-codeerder en -decodeerder](https://abox.tools/nl/base64-coderen/) gaat beide kanten op tussen tekst en zijn coderingen. Alle drie draaien ze op jouw machine, en wat je plakt heeft nergens heen te gaan — deze pagina's dragen geen codepad dat het zou kunnen versturen.

Twee ervan hebben al een eigen gids: [JSON formatteren zonder het te uploaden](https://abox.tools/nl/gidsen/json-formatteren/) en [twee JSON-bestanden vergelijken](https://abox.tools/nl/gidsen/twee-json-bestanden-vergelijken/).

## Hoe je ziet welke soort je gebruikt

De controles zijn dezelfde als bij een bestandstool, en ze staan volledig in [de gids over uploaden](https://abox.tools/nl/gidsen/is-bestanden-uploaden-veilig/). De korte plakversie:

- **Trek de stekker eruit.** Laad de pagina, verbreek de verbinding, plak, druk op de knop. Een lokale tool gaat door; een servertool valt stil. Dertig seconden, geen expertise, niet te vervalsen.
- **Kijk naar het Netwerk-tabblad terwijl je op Formatteren drukt.** Een verzoek dat op dat moment vertrekt, ongeveer zo groot als je plak, is je plak die vertrekt. Geen verzoek, geen upload.
- **Wantrouw de behulpzame extra's.** Een knop “deel dit fragment”, een geschiedenis van je recente plakken over apparaten heen, een link voor een collega — elk daarvan kan alleen als de tekst op een server is opgeslagen. Functies zijn bekentenissen: een pagina die jouw plak aan iemand anders kan laten zien, heeft hem gehouden.

En één gewoonte verslaat alle drie de controles: minder plakken. Een validator heeft het echte wachtwoord niet nodig om de vorm van een config te controleren — `"REDACTED"` parseert identiek. En voor de plak die zelf het geheim is, krimpt de regel tot iets nog eenvoudigers: de enige pagina die ooit een wachtwoord hoort te ontvangen, is de inlogpagina waar het bij hoort.
