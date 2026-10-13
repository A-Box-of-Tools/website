# Van afbeeldingen een geanimeerde GIF maken

De GIF maken is het makkelijke deel. Er een krijgen die klein genoeg is om ook echt te posten, dat is het deel dat het lezen waard is, want een GIF heeft geen kwaliteitsschuif en er zijn maar drie dingen die aan zijn omvang trekken.

[Open de tool GIF-maker](https://abox.tools/nl/gif-maken/): Maak van een stel plaatjes één animatie.

Laatst bijgewerkt 26 augustus 2026

## Het korte antwoord

Open de [GIF-maker](https://abox.tools/nl/gif-maken/), sleep de plaatjes erin, zet ze in de volgorde waarin ze moeten spelen, stel in hoe lang elk frame blijft staan, en maak de GIF. Hij speelt op de pagina nog voordat je hem opslaat.

Alles hieronder gaat over de twee dingen die daarna misgaan: het bestand is veel groter dan verwacht, of de animatie speelt trager dan de getallen beloofden. Allebei hebben ze een duidelijke oorzaak en geen van beide is een fout van het hulpmiddel.

## Waarom een GIF zoveel groter is dan je denkt

Een GIF van 20 frames op 640 pixels is routineus 8 tot 15 MB. Dezelfde animatie als MP4 is een paar honderd kilobyte. Dat is geen slecht gemaakte GIF; dat is wat het formaat is.

Elk ander bewegendbeeldformaat dat je gebruikt hebt bewaart *verschillen*. Een videocodec schrijft één volledig beeld en daarna, voor de frames erna, alleen wat er bewoog en waarheen — en daarom kost een video van iemand die voor een stilstaande achtergrond praat bijna niets per frame. Een GIF kan dat niet. Elk frame wordt als hele pixels opgeslagen, door een verliesvrije compressor gehaald, en dat is de hele gereedschapskist.

Er is ook geen kwaliteitsinstelling, want er is geen verliesgevende stap om lager te zetten. Een JPEG op 60 % kwaliteit is een echte keuze met een echte schuif erachter; een GIF heeft niets vergelijkbaars. De omvang is dus ruwweg **oppervlak × aantal frames**, en de enige manier om eraan te trekken is aan een van die twee getallen te trekken.

## De drie dingen die hem werkelijk kleiner maken

In de volgorde waarin ze helpen:

**1. Maak hem kleiner.** Dit is niet een van meerdere opties, dit is de optie. Omvang is oppervlak, dus de lange zijde halveren maakt het bestand vier keer kleiner: van 640 px naar 320 px verandert 12 MB in zo'n 3 MB. Een GIF op een webpagina of in een chatvenster wordt toch al op een paar honderd pixels bekeken. Daarom staat het hulpmiddel standaard op 480 px, en 320 px is een volstrekt respectabel antwoord.

**2. Gebruik minder frames.** Tien frames die elk een vijfde seconde blijven staan zijn dezelfde twee seconden animatie als twintig frames op een tiende, en het halve bestand. Vloeiendheid kost bytes in rechte evenredigheid, dus geef ze alleen uit waar de beweging erom vraagt.

**3. Zet dithering uit, en haal de kleuren omlaag.** Deze gaat tegen het gevoel in. Dithering strooit een fijn patroon van afwisselende pixels om de kleuren te faken die het palet niet heeft, en dat patroon is *ruis* — precies wat een verliesvrije compressor niet kan inpakken. Op vlakke tekeningen, schermafbeeldingen en lijnwerk kan het uitzetten een derde van het bestand schelen en er ook nog beter uitzien. Op foto's ruil je zichtbare bandvorming voor de winst, dus probeer beide en kijk.

Van 256 naar 64 kleuren gaan helpt ook, al minder dan mensen hopen: het maakt de codewoorden korter in plaats van dat het pixels weghaalt.

Krijgt niets daarvan hem klein genoeg, dan is het eerlijke antwoord dat wat je aan het maken bent een video is. [Dezelfde plaatjes tot een MP4 maken](https://abox.tools/nl/gidsen/van-afbeeldingen-een-video-maken/) wordt misschien een tiende van de omvang, en overal waar een GIF voor iets anders dan een `<img>`-element geaccepteerd wordt — elk sociaal netwerk inbegrepen — wordt hij bij het uploaden toch naar video omgezet.

## Hoe snel een GIF echt kan spelen

Het formaat bewaart de vertraging van elk frame in honderdsten van een seconde, wat de indruk wekt dat je 0,01 s kunt vragen en honderd frames per seconde krijgt. Dat kan niet.

Elke browser trekt een vertraging onder twee honderdsten omhoog naar een tiende seconde. De regel komt uit de jaren negentig, toen pagina's vol stonden met animaties die zo snel mogelijk moesten spelen en de machines van toen dat niet overleefden, en hij heeft elke reden voor zijn invoering overleefd. Hij is nooit weggehaald, en hij geldt vandaag voor jouw GIF.

Het praktische bereik is dus:

- **0,02 s** (50 frames per seconde) — het snelste wat een GIF mag zijn, en sneller dan meestal nodig is.
- **0,05 s** (20 frames per seconde) — vloeiende animatie, en de plek om te beginnen als je beweging animeert.
- **0,1 s** (10 frames per seconde) — de klassieke GIF-look. De helft van de frames, de helft van het bestand, en het leest als een keuze.
- **0,5 s en meer** — een diavoorstelling. Elk plaatje wordt bekeken in plaats van geanimeerd.

Alles onder 0,02 s wordt niet aangeboden, want dat is een getal dat in elke browser die er is stilletjes 0,1 s zou worden.

## Het palet, en wat het eigenlijk uitkiest

Een GIF-frame houdt hooguit 256 kleuren vast. Een foto heeft er tienduizenden. Iets moet er 256 uitkiezen, en die keuze bepaalt hoe het resultaat eruitziet — meer dan welke andere instelling ook.

Het hulpmiddel biedt er twee manieren voor:

**De beste kleuren voor elk frame** geeft elk plaatje zijn eigen 256. Dat oogt het scherpst, en het is juist voor een reeks losstaande foto's, waar elke foto toch een compleet andere set wil.

**Eén palet voor de hele GIF** bouwt één tabel uit alle frames tegelijk. Gebruik die wanneer de frames een *reeks* zijn — hetzelfde tafereel, een paar momenten uit elkaar. Met een palet per frame verandert elke wijziging in het beeld welke 256 kleuren gekozen worden, en verschuift de hele achtergrond bij elk frame een beetje van kleur. Die trilling is wat een zelfgemaakte GIF zelfgemaakt laat lijken. Een gedeeld palet haalt hem weg, en levert er een kleiner bestand bij op, want de tabel wordt één keer geschreven in plaats van in elk frame.

Minder kleuren — 128, 64, 32 — is het proberen waard op alles wat vlak is. Een logo-animatie met acht kleuren erin verliest niets op 32, en op een foto zie je het verschil meteen.

![De kleurinstellingen: een palet van 128 kleuren, de keuze tussen één gedeeld palet en één per frame, dithering uit, en een samenvatting van frames, duur en geschatte grootte.](https://abox.tools/screens/make-a-gif-from-images/colours.webp)

Het palet is de instelling met de grootste invloed op de grootte, en degene die de meeste tools verstoppen. De samenvatting eronder beweegt mee terwijl je ze verandert.

## Transparantie is één bit, en dat is het hele verhaal

Een GIF-pixel is volledig geverfd of volledig onzichtbaar. Daartussen zit niets: geen schaduw op 50 %, geen zachte rand, geen uitvloeiing.

Hebben je bronplaatjes dus transparantie, dan houdt het aanzetten ervan de doorzichtige delen doorzichtig — maar elke antialiased rand, die een overgang van de vorm naar niets is, wordt halverwege afgekapt tot een harde, zichtbaar gekartelde rand. Ronde vormen en tekst lijden het meest.

Weet je op welke kleur de GIF komt te liggen, dan ziet hem plat maken op die kleur er elke keer beter uit. Houd de transparantie alleen wanneer de achtergrond waarop hij landt echt onbekend is — en is het antwoord “hij heeft op elke achtergrond een zachte rand nodig”, dan is het formaat daarvoor geanimeerde PNG of WebP, geen GIF.

## Volgorde, timing, en een lus die goed zit

Een paar dingen die sneller te weten dan te ontdekken zijn:

**Sorteren op naam telt goed.** Een render- of exportreeks sorteert zoals je bedoelde, dus `frame_2` komt vóór `frame_10` in plaats van erna. Sorteren op datum zet een rolletje terug in de volgorde waarin het geschoten is, en dat wil je wanneer de bestandsnamen weer bij 0001 begonnen zijn.

**Geef het laatste frame langer.** Een lus waarin elk frame even lang duurt leest als meedogenloos. Het laatste frame een halve seconde of zo vasthouden geeft het oog ergens rust en laat het geheel bedoeld lijken. Elk frame heeft daarvoor zijn eigen standtijd.

**Een lus hoort niet te springen.** Op het laatste frame volgt onmiddellijk het eerste, dus zijn die twee heel verschillend, dan klapt de lus. Maak ze op elkaar lijkend, of leun in de snede door het laatste frame vast te houden.

**Eén keer spelen betekent één keer.** Sommige hulpmiddelen schrijven een lusteller van één, waar decoders het nooit helemaal over eens zijn geworden — een enkele speelt het twee keer. “Eén keer spelen” schrijft hier helemaal geen lusinformatie, en daar gaat elke ooit gebouwde decoder hetzelfde mee om.

![Vijf frames op volgorde, elk met een eigen vertragingsveld, boven een rij die alle vertragingen tegelijk zet.](https://abox.tools/screens/make-a-gif-from-images/frames.webp)

Volgorde en timing, allebei per frame te wijzigen. Ze allemaal tegelijk zetten is de rij erboven, en dat is wat iedereen met meer dan drie frames wil.

## Waarom hier geen server voor nodig is

Een GIF maken zijn twee klussen die de browser niet aanbiedt: het palet kiezen, en de pixels met LZW inpakken. Geen van beide is groot. Samen zijn het misschien vierhonderd regels, ze staan uitgeschreven in de repository, en ze draaien op je eigen apparaat zoals al het andere hier — en daarom blijft de pagina het doen met de netwerkstekker eruit.

Dat zoveel GIF-makers uploaden, komt niet doordat de klus moeilijk is. Het komt doordat een server de plek is waar de advertenties en de accounts zitten. Niets aan het veranderen van een stel foto's in een animatie vereist dat jouw foto's de kamer verlaten waarin ze zijn.

[Is het veilig om bestanden naar online omzetters te uploaden?](https://abox.tools/nl/gidsen/is-bestanden-uploaden-veilig/) zet vier controles op een rij die je over elk hulpmiddel hetzelfde vertellen, dit hulpmiddel inbegrepen.
