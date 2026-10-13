# Is het veilig om bestanden naar online omzetters te uploaden?

Meestal is het eerlijke antwoord “waarschijnlijk wel, maar je kunt het niet nagaan”. Hier staat wat uploaden werkelijk met je bestand doet, waarom de meeste tools het nog steeds doen, en vier tests die je vertellen of degene vóór je het nodig heeft.

Laatst bijgewerkt 26 augustus 2026

## Het korte antwoord

Voor de meeste bestanden, de meeste tijd, is uploaden prima. Fatsoenlijke omzetters verwijderen binnen een paar uur wat je stuurt en hebben geen belangstelling voor je vakantiefoto's.

Het probleem is niet dat ze liegen. Het is dat **je geen manier hebt om na te gaan of ze dat doen**. Zodra een bestand je apparaat verlaat, is elke belofte over wat er daarna gebeurt een belofte die je op vertrouwen aanneemt: hoe lang het bewaard blijft, wie erbij kan, of het gekopieerd wordt naar een back-up die de verwijdertimer overleeft, wat ermee gebeurt als het bedrijf verkocht of gekraakt wordt. Niets daarvan is van buitenaf te zien.

De nuttige vraag is dus niet “vertrouw ik deze site?” Het is **“moet mijn bestand voor deze klus überhaupt weg?”** Voor een groot en groeiend aantal klussen is het antwoord nee, en wanneer het antwoord nee is, houdt de vertrouwensvraag op er een te zijn die je moet beantwoorden.

## Wat “uploaden” werkelijk doet

Wanneer een omzetter je vraagt een bestand te kiezen en je daarna een voortgangsbalk laat zien, kopieert je browser het hele bestand, byte voor byte, over het internet naar een computer die van iemand anders is. Die computer schrijft het naar een schijf, draait de omzetting, schrijft het resultaat naar diezelfde schijf, en geeft je een link.

Op dat moment bestaat je bestand op minstens drie plekken die jij niet gekozen hebt: de schijf van de server, de logboeken die het verzoek vastlegden, en vaak een contentdistributienetwerk dat het resultaat in de cache zette zodat de download snel is. Een verwijderbeleid moet alle drie bereiken. De meeste zeggen dat ze dat doen. Je kunt er geen van controleren.

Ook het weten waard: het bestand is niet het enige dat aankomt. De bestandsnaam gaat mee, en alles in het bestand dat je niet kunt zien eveneens. Een foto die zo van een telefoon komt, draagt doorgaans de exacte gps-coördinaten van waar hij genomen is, het tijdstip, het serienummer van de camera, en soms een ingesloten miniatuur van het originele beeld van vóór je bijsnijding. Mensen die voorzichtig zijn met het plaatje zijn dat vaak niet met dat, omdat niets op het scherm het ze laat zien.

## Waarom de meeste tools toch uploaden

Niet omdat ze je bestanden willen hebben. Omdat er het grootste deel van het bestaan van het web geen alternatief was. Een browser kon geen video decoderen, geen afbeelding op een gekozen kwaliteit hercoderen, en geen bestandsformaat ontleden; een server met FFmpeg en ImageMagick wel. Uploaden was geen verdienmodel, het was de enige plek waar het werk kon gebeuren.

Dat is recent en stilletjes opgehouden waar te zijn. Browsers leveren tegenwoordig WebAssembly mee, dat dezelfde gecompileerde codecs op bijna volle snelheid draait, WebCodecs, dat de hardware-video-encoder blootlegt die al in je apparaat zit, en een Canvas-API die afbeeldingen rechtstreeks kan decoderen en hercoderen. Het werk waar vroeger een server voor nodig was, draait nu op het apparaat dat het bestand al heeft.

Genoeg tools uploaden nog steeds, en daar zijn eerlijke redenen voor: een bestaande verwerkingsketen die niemand wil herschrijven, een formaat zonder decoder aan de browserkant, een klus die werkelijk te zwaar is voor een telefoon. Er is ook een minder eerlijke reden, en dat is dat een server de plek is waar accounts, quota's en betaalde lagen wonen. Een tool die volledig in je browser draait, is moeilijk af te rekenen.

## Vier controles die je zelf kunt doen

Deze werken op elke tool, ook op deze. Voor geen ervan hoef je iemand op zijn woord te geloven, en de eerste kost een seconde of tien.

### 1. Trek de stekker eruit

Laad de pagina, zet daarna je wifi uit of trek de kabel eruit, en probeer hem te gebruiken. Een tool die zijn werk in je browser doet, gaat precies zo door. Een tool die uploadt stopt onmiddellijk, want het ding dat het werk doet is niet meer bereikbaar.

Dit is de sterkste test die er is, en de moeilijkste om te veinzen, omdat hij niet met een formulering te beantwoorden valt. Óf de omzetting komt zonder netwerk klaar, óf niet.

### 2. Hou het tabblad Netwerk in de gaten

Open de ontwikkelaarsgereedschappen van je browser, kies Netwerk, en gebruik daarna de tool. Elk verzoek dat de pagina doet, staat er met zijn grootte bij. Is je foto van 4 MB geüpload, dan staat er een verzoek van 4 MB in die lijst. Is het grootste dat de pagina verlaat een paar kilobyte advertentie, dan is dat niet gebeurd.

Sorteer op grootte en kijk bovenaan. Je hoeft de verzoeken niet te begrijpen; je hoeft alleen op te merken of er een de grootte van je bestand heeft.

### 3. Lees de Content-Security-Policy

Bekijk de broncode van de pagina en zoek bovenin naar `Content-Security-Policy`. Het is een lijst van de adressen die die pagina mag benaderen, en je browser dwingt hem af in plaats van de goede bedoelingen van de site. Een verzoek aan iets dat niet op de lijst staat wordt dus geweigerd, wat de code ook probeert.

De richtlijn die ertoe doet is `connect-src`, die bepaalt waar de pagina gegevens heen mag sturen. Noemt hij een adres dat bij de site hoort waar je bent, dan kan de pagina je bestand daarheen sturen. Noemt hij niets, of alleen derden zoals een advertentienetwerk, dan kan hij dat niet.

Een pagina zonder Content-Security-Policy is geen bewijs van iets slechts. Het betekent alleen dat juist deze controle je niets te vertellen heeft.

### 4. Lees de code

Het minst handig, het meest sluitend. Publiceert een tool zijn broncode en serveert hij die zonder bouwstap, dan zijn de bestanden die je browser ophaalde de bestanden die je kunt lezen. Zoek erin op `fetch`, `XMLHttpRequest` en `sendBeacon`, want dat zijn de drie manieren waarop een pagina iets kan versturen, en kijk wat ze meekrijgen.

De meeste mensen zullen dit niet doen. Het doet er nog steeds toe dat het kán, want een bewering die niemand kan nagaan is eigenlijk geen bewering.

## Wat “draait in je browser” niet betekent

Het is de moeite waard hier nauwkeurig te zijn, want de uitdrukking wordt losjes gebruikt en deze site moet zich aan dezelfde lat houden die ze voorstelt.

- **Het betekent niet helemaal geen verzoeken.** De pagina zelf kwam over het netwerk binnen, en de meeste gratis tools dragen advertenties of analytics die met iemand praten. De bewering gaat over je *bestand*, niet over verkeer in het algemeen.
- **Het verbergt je IP-adres niet.** Elke site die je bezoekt ziet het, deze inbegrepen. Lokaal verwerken gaat over de inhoud van je bestanden, niet over anonimiteit.
- **Het overleeft geen functie die iets ophaalt.** Een tool waarin je een webadres kunt plakken, moet dat adres benaderen, en die server komt je IP te weten en wat je opvroeg. Dat hoort bij de functie en is er geen gebrek in, maar het blijft een echte uitzondering, en een tool hoort dat gewoon te zeggen in plaats van het af te ronden.
- **Het is niet hetzelfde als “wij verwijderen je bestanden”.** De tweede zin gaat over wat een bedrijf besluit te doen. De eerste gaat over wat technisch mogelijk is. Maar één van de twee is te controleren.

## Wanneer uploaden werkelijk prima is

Dit is geen betoog dat elke upload een vergissing is. Stuur het bestand wanneer de inhoud niet gevoelig is en de klus zo makkelijker gaat; wanneer het werk werkelijk te zwaar is voor je apparaat; wanneer het formaat geen decoder aan de browserkant heeft; of wanneer je een dienst gebruikt waar je al een relatie mee hebt en waarvan je de voorwaarden echt gelezen hebt.

Wees voorzichtiger wanneer het bestand iets bevat dat je niet openbaar zou posten: identiteitsdocumenten, medische scans, contracten, alles met een adres of een gezicht dat je niet wilde delen, of een foto waarvan je de locatiegegevens niet bekeken hebt. Voor die is een tool die je kunt controleren te verkiezen boven een tool die je moet vertrouwen. Niet omdat die vertrouwde je waarschijnlijk verraadt, maar omdat de vraag bij de controleerbare niet eens opkomt.

## Hoe deze site op die vier controles scoort

Het zou een rare gids zijn die je vertelde te controleren en zichzelf dan om vrijstelling vroeg. Dus, op volgorde:

- **Trek de stekker eruit.** Open hier een tool, verbreek de verbinding, en hij werkt door. Elke toolpagina heeft een live-indicator die zegt of je op dit moment online bent, zodat je hem kunt zien veranderen.
- **Tabblad Netwerk.** Zet iets om en lees de lijst. Niets draagt je bestand, een miniatuur ervan, zijn naam, zijn grootte, of iets wat eruit gelezen is. Er staat op deze site geen eigen analytics-gebeurtenis die daar iets van te versturen heeft.
- **Content-Security-Policy.** Die staat boven aan de broncode van elke pagina. `connect-src` noemt de advertentie- en meeteindpunten van Google en de doneerknop, en verder niets. **Geen adres op die lijst hoort bij deze site**, want deze site heeft geen server, want het zijn statische bestanden. Er is dus nergens waar een bestand heen gestuurd zou kunnen worden, ook al probeerde er iets het.
- **Code.** Elke regel is [openbaar](https://github.com/A-Box-of-Tools/website). De build haalt opmerkingen en witruimte weg en verder niets, en je kunt hem zelf draaien en het resultaat vergelijken met wat er geserveerd wordt.

De uitzonderingen, hardop gezegd in plaats van weggemoffeld: deze site draagt advertenties van Google en een bezoekersteller, die allebei met Google praten en waarvan geen van beide iets over je bestanden meekrijgt; en de tool [Afbeeldingen naar video](https://abox.tools/nl/afbeeldingen-naar-video/) kan een afbeelding ophalen bij een adres dat jij erin plakt, wat betekent dat die server je IP ziet. De [privacypagina](https://abox.tools/nl/privacy/) zet ze allebei volledig uiteen.

Elke tool hier werkt zo: een [afbeeldingscompressor](https://abox.tools/nl/afbeelding-comprimeren/) die een grootte haalt die jij noemt, een [videobijsnijder](https://abox.tools/nl/video-bijsnijden/), een [EXIF-lezer en -wisser](https://abox.tools/nl/exif-gegevens-verwijderen/) voor de verborgen gegevens die hoger op deze pagina beschreven staan, [afbeeldingen naar video](https://abox.tools/nl/afbeeldingen-naar-video/), en [afbeeldingen naar pdf](https://abox.tools/nl/afbeeldingen-naar-pdf/). Allemaal gratis, geen account, en geen ervan heeft ergens om je bestanden heen te sturen.

![Het paneel op een toolpagina: een regel die zegt dat de bestanden de browser nooit verlaten, de feiten die dat dragen, en een live controle die meldt dat de pagina geen enkel netwerkverzoek heeft gedaan.](https://abox.tools/screens/is-it-safe-to-upload-files/pledge.webp)

De laatste van de vier controles, beantwoord op de pagina in plaats van in een alinea: de telling doet de pagina over zichzelf, en dezelfde telling kun je in je eigen browser maken.
