# Wanneer je een plaatje in je CSS zet, en wanneer niet

Een afbeelding die in een stylesheet geschreven staat komt daar gewoon mee mee, zonder tweede verzoek en zonder wachten. Alleen houdt hij daarmee ook op een bestand te zijn, waardoor hij niet los in de cache kan en opnieuw gedownload wordt zodra er iets eromheen verandert. Dit gaat over waar die ruil het waard is, en waar hij dat stilletjes niet is.

[Open de tool Afbeelding naar data-URI](https://abox.tools/nl/afbeelding-naar-base64/): Het hele plaatje als één regel tekst. Plak hem zo in je CSS of HTML.

Laatst bijgewerkt 26 augustus 2026

## Het korte antwoord

Open [Afbeelding naar data-URI](https://abox.tools/nl/afbeelding-naar-base64/), sleep het plaatje erin, kies *Een CSS custom property*, en plak de regel boven aan je stylesheet. Gebruik hem daarna als `background-image: var(--logo)` waar je hem nodig hebt.

Doe dat wanneer het plaatje klein is, zoals een icoontje, een opsommingsteken, een pijltje of een patroon, en op elke pagina nodig is. Doe het niet met een foto. Alles hieronder gaat over waarom die twee zinnen verschillen, en hoe je ziet naar welke van de twee je kijkt.

## Wat een data-URI eigenlijk is

Een adres dat het ding bevat in plaats van ernaar te wijzen. Waar een stylesheet normaal zou zeggen

```
background-image: url("logo.png");
```

en de browser `logo.png` gaat ophalen, zegt een data-URI

```
background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...");
```

en valt er niets op te halen: het plaatje is er al, uitgeschreven in tekens. Er zijn drie delen. `data:` is het schema. `image/png` is het mediatype, en de browser gelooft dat volledig, en daarover hieronder meer. Alles na de komma is het bestand.

Dat is het hele idee. Het is geen truc of een hack; het staat sinds 1998 in de standaarden en werkt in elke browser die sindsdien uitgekomen is.

## Wat het je oplevert: één heen-en-weer minder

De besparing is geen bandbreedte. Het is het verzoek.

Een browser kan pas om `logo.png` vragen als hij de stylesheet gelezen heeft die het noemt, en die stylesheet kan hij pas lezen als hij hem opgehaald heeft. Een gewone achtergrondafbeelding zit dus minstens twee heen-en-weren diep in het laden van de pagina, en op een telefoon op een traag netwerk kan een heen-en-weer een paar honderd milliseconde zijn, hoe klein het bestand ook is. Een pijltje van 600 bytes kost bijna niets om te versturen en kan toch een kwart seconde kosten om aan te komen.

Ingesloten komt hij met de stylesheet mee. Dat is het hele voordeel, en voor een klein icoontje boven de vouw is het een echt voordeel.

## Wat het kost: een derde, en dan de caching

**Base64 doet er ongeveer een derde bij.** Drie bytes bestand worden vier tekens, want dat is wat het kost om willekeurige bytes op te schrijven met alleen de tekens die een URL toestaat. Er bestaat geen slimme encoder die eromheen komt. Een png van 9 KB is 12 KB stylesheet.

**Compressie geeft het niet terug.** Dit is het stuk dat mensen wegredeneren. Gzip en Brotli werken door herhaling te vinden, en een png, een jpeg en een WebP zijn al gecomprimeerd. Er zit dus heel weinig herhaling meer in, en base64 voegt er geen toe. In de praktijk krijg je zoiets als een tiende van die derde terug, niet het geheel. (Een svg is het omgekeerde geval, en daar gaat het volgende deel over.)

**Het houdt op een bestand te zijn.** Dat is de kostenpost die niet opduikt in enige meting die je waarschijnlijk doet, en het is degene die op omvang telt:

- **Hij kan niet los in de cache.** Een gewone afbeelding wordt één keer opgehaald en een jaar lang hergebruikt. Een ingesloten is onderdeel van de stylesheet, dus hij leeft en sterft met het cache-item van die stylesheet.
- **Iets veranderen downloadt alles opnieuw.** Herstel een marge, lever een nieuwe stylesheet uit, en elke bezoeker downloadt het ingesloten plaatje er weer bij, terwijl dat plaatje in twee jaar niet veranderd is.
- **Hij staat op het kritieke pad.** Een stylesheet blokkeert het renderen. Een afbeelding niet. Een plaatje insluiten verplaatst het van de tweede categorie naar de eerste: de pagina kan niet tekenen tot het geheel, plaatje inbegrepen, is aangekomen.
- **Hij kan niet parallel opgehaald worden.** Browsers downloaden veel dingen tegelijk. Een ingesloten plaatje is geen apart ding, dus daar krijgt het niets van mee.

Ruwe drempels, die aangeven waar het advies verandert en niet waar een browser iets anders doet: onder ongeveer 2 KB is het een duidelijke winst; tot zo'n 10 KB is het meestal nog de moeite waard voor iets dat op elke pagina staat; voorbij 50 KB is het een vergissing zonder foutmelding. [De tool](https://abox.tools/nl/afbeelding-naar-base64/) zegt in welke band elk resultaat valt, met het aantal tekens ernaast.

![De uitvoerkaart: een CSS-regel met een data-URI in base64, met ernaast de oorspronkelijke bestandsgrootte en die van de codering.](https://abox.tools/screens/embed-an-image-in-css/output.webp)

De gecodeerde kopie is ongeveer een derde groter dan het bestand waar hij vandaan komt. Dat zijn de kosten waar deze sectie over gaat, en ze staan er in plaats van ontdekt te moeten worden.

## Maak nooit base64 van een svg

Dit is veruit de meest voorkomende fout bij ingesloten afbeeldingen, en hij wordt door exporteurs en bouwplug-ins net zo vaak gemaakt als door mensen.

Een svg is tekst. Een URL draagt tekst al. Er hoeft maar een handvol tekens ontsnapt te worden, namelijk `%`, `#`, `<`, `>` en het aanhalingsteken waar je hem in gezet hebt. Al het andere kan precies blijven zoals het is. Zo coderen levert een URI op die meestal zo'n vijfde korter is dan de base64 van hetzelfde bestand, en die daarna comprimeert als tekst in plaats van als ruis.

Hij is bovendien nog leesbaar:

```
background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E...");
```

Je ziet de `viewBox`. Je kunt de vulkleur in je editor wijzigen zonder iets te decoderen. Maak van hetzelfde bestand base64 en het wordt een muur van letters die niemand ooit nog aanraakt. [Afbeelding naar data-URI](https://abox.tools/nl/afbeelding-naar-base64/) doet dit automatisch voor alles wat een svg blijkt te zijn, en heeft een vinkje voor de zeldzame toolchain die op `;base64` staat.

## De aanhalingsfout die alleen svg's breekt

CSS laat je `url()` zonder aanhalingstekens schrijven, en voor een gewone bestandsnaam is dat prima:

```
background-image: url(logo.png);
```

Doe hetzelfde met een procentgecodeerde svg en het breekt. Een `url()`-token zonder aanhalingstekens eindigt bij de eerste spatie, haakje, aanhalingsteken of stuurteken, en een svg zit vol spaties, tussen elk attribuut en elk getal in een pad. De declaratie is dan ongeldig, CSS gooit ongeldige declaraties stilletjes weg, en je krijgt geen achtergrond en geen foutmelding.

De oplossing is aanhalingstekens, elke keer:

```
background-image: url("data:image/svg+xml,%3Csvg ... %3E");
```

Daarom hoeft een encoder spaties ook niet te ontsnappen, want die zijn volstrekt legaal binnen een URL tussen aanhalingstekens, en elke spatie als `%20` ontsnappen zou drie tekens kosten per spatie in het bestand. De twee beslissingen horen bij elkaar: zet de URI tussen aanhalingstekens en je kunt de spaties met rust laten. Elke vorm die de tool oplevert staat precies daarom tussen aanhalingstekens.

## Het mediatype moet kloppen

Een data-URI geeft zijn eigen type op, en de browser gelooft hem op zijn woord. Er is geen terugval op snuffelen zoals bij een opgehaald bestand: zeg `image/png` over iets dat in werkelijkheid een jpeg is en het plaatje verschijnt niet, zonder een melding op enige nuttige plek.

En dat telt, want bestandsextensies liegen. Een foto die als jpeg geëxporteerd is en `logo.png` hernoemd, is een gewoon ding om op een schijf tegen te komen. De eerste paar bytes van een afbeeldingsbestand zeggen daarentegen ondubbelzinnig wat het is, want elk formaat heeft een handtekening. Een tool hoort dus het bestand te lezen en niet zijn naam. Die hier doet dat, en zegt het je wanneer de twee het oneens zijn.

Twee formaten zijn het weten waard omdat ze op een verwarrende manier falen. **HEIC**, waarin een iPhone fotografeert, en **TIFF**, wat scanners opleveren, maken allebei volkomen geldige data-URI's die geen enkele browser behalve Safari wil tekenen. De URI is niet kapot; het formaat is domweg niet een dat het web ondersteunt. Zet eerst om.

## De metagegevens die je niet wilde publiceren

Een data-URI is een kopie van het bestand, byte voor byte. Er wordt niets gedecodeerd en hercodeerd, en meestal is dat juist de bedoeling omdat er geen kwaliteit verloren gaat. Alleen betekent het ook dat al het andere in het bestand gewoon meekomt.

Een foto die zo van een telefoon komt draagt EXIF mee: de gps-coördinaten van waar hij genomen is, de tijdstempel, het cameramodel en vaak het serienummer. Dat kan 30 KB van het bestand zijn. Ingesloten wordt het 40 KB base64 in je stylesheet, op het kritieke pad van elke pagina, plus een woonadres dat naar een repository gecommit wordt, in een vorm waar niemand ooit aan denkt te kijken.

Haal het er eerst uit met de [EXIF-lezer & -wisser](https://abox.tools/nl/exif-gegevens-verwijderen/), die de container herschrijft zonder het plaatje aan te raken; daar is ook [een gids voor](https://abox.tools/nl/gidsen/exif-en-gps-gegevens-verwijderen/). Afbeelding naar data-URI leest hoeveel metagegevens er in een jpeg, png of WebP zitten en zegt het voordat je iets kopieert.

## Waar je hem zet, als je hem eenmaal hebt

Komt het plaatje in één regel voor, zet de URI dan in die regel. Komt het in meer dan één voor, en bij icoontjes is dat meestal zo zodra je de hover-toestand en het donkere thema meetelt, declareer hem dan één keer als custom property:

```
:root {
  --icon-search: url("data:image/svg+xml,%3Csvg ... %3E");
}

.search-field { background-image: var(--icon-search); }
.search-button::before { content: var(--icon-search); }
```

Een URI van 3 KB die in vier regels geplakt is, is 12 KB stylesheet en vier plekken om te bewerken wanneer het icoon verandert. De custom property is één van elk. Het is ook de vorm die themawisseling laat werken: herdefinieer `--icon-search` binnen een mediaquery en elk gebruik ervan volgt.

Voor een `<img>`-tag in plaats van CSS: zet er `width` en `height` bij. Een ingesloten afbeelding laadt ogenblikkelijk, dus een ontbrekend formaat is een layoutverschuiving die te snel gaat om te zien en die toch tegen je telt. De uitzondering is svg: een die alleen een `viewBox` meedraagt heeft zelf geen pixelformaat, en de standaard ⁦300×150⁩ van de browser op de tag zetten pint een schaalbaar plaatje vast op een formaat dat niemand gekozen heeft.

Laat de `alt` leeg tenzij je er iets waars in te zetten hebt. Alleen jij weet of het plaatje betekenis draagt of versiering is, en een beschrijving die uit een bestandsnaam geraden is, is voor iemand met een schermlezer erger dan helemaal geen beschrijving.

![De vormkaart: knoppen die kiezen wat eruit moet komen, een CSS-achtergrondregel, een img-element of alleen de URI, en een schakelaar voor base64 of platte SVG.](https://abox.tools/screens/embed-an-image-in-css/shape.webp)

Waar het heen gaat bepaalt wat eruit komt, dus dat wordt eerst gevraagd in plaats van als knip-en-plakoefening te blijven liggen.

## Wanneer het antwoord “niet doen” is

Is het plaatje gecodeerd groter dan ongeveer 50 KB, dan is insluiten het verkeerde gereedschap en lost geen enkele zorgvuldigheid bij het coderen dat op. De alternatieven, op volgorde van proberen:

- **Maak het kleiner.** De meeste afbeeldingen die te groot zijn om in te sluiten, zijn sowieso te groot. De [Afbeeldingscompressor](https://abox.tools/nl/afbeelding-comprimeren/) brengt een foto naar een grootte die jij noemt, en [Afbeeldingsformaat wijzigen](https://abox.tools/nl/afbeelding-formaat-wijzigen/) brengt de pixelafmetingen terug tot wat de opmaak werkelijk gebruikt, en heel vaak zit daar het echte probleem.
- **Teken het opnieuw als svg.** Een icoontje dat als png van 40 KB geëxporteerd is, is vaak een svg van 900 bytes. Dat is geen compressieverschil maar een formaatverschil, en het lost meteen het retinaprobleem op.
- **Laat het een bestand en laad het vooruit.** `<link rel="preload" as="image">` start het ophalen meteen zonder de bytes op het kritieke pad te zetten. Het levert het meeste voordeel van insluiten op en niets van de cachekosten.

## Hier hoeft niets voor geüpload te worden

Een bestand als base64 coderen is rekenen. Het zijn twee functies die de browser al sinds het begin heeft, `btoa` en `encodeURIComponent`, en er is werkelijk geen technische reden voor een plaatje om naar een server en terug te reizen om anders opgeschreven te worden. Elke omzetter die je bestand daarvoor uploadt, uploadt het om zijn eigen redenen en niet om die van jou.

[De tool hier](https://abox.tools/nl/afbeelding-naar-base64/) stuurt het nergens heen: de `Content-Security-Policy` van de pagina noemt elk adres dat hij mag benaderen, en geen ervan hoort bij deze site. Laad de pagina, trek de stekker uit het internet, en codeer er toch iets, als je liever controleert dan het aanneemt. [Is het veilig om bestanden naar online omzetters te uploaden?](https://abox.tools/nl/gidsen/is-bestanden-uploaden-veilig/) zet nog drie controles op een rij die je op elke tool kunt loslaten.
