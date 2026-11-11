# Verwijdert het converteren van een foto de metadata?

Soms, en beide antwoorden hebben al mensen gebrand. Hercoderen via een canvas stroopt alles af; een zorgvuldige converter draagt alles over; het beeld ziet er in beide gevallen hetzelfde uit. De enige betrouwbare zet is stoppen met voorspellen en in het bestand kijken.

Laatst bijgewerkt 26 augustus 2026

## Het korte antwoord

Soms. Een foto converteren, verkleinen of comprimeren verwijdert de metadata wanneer het gereedschap het beeld opnieuw opbouwt uit pixels, en bewaart ze wanneer het gereedschap ze opzettelijk overdraagt — en niets op het scherm vertelt je welke van de twee er gebeurde. Het beeld ziet er in beide gevallen hetzelfde uit, omdat metadata nooit deel van het beeld was.

Beide uitkomsten verrassen, in tegengestelde richtingen. Iemand rekent erop dat “alleen even verkleinen” de locatie wist, en ze overleeft. Iemand anders rekent erop dat de opnamedatum een formaatwissel overleeft, en ze is weg. De twee vergissingen hebben dezelfde remedie: stoppen met voorspellen wat een gereedschap waarschijnlijk deed, en kijken wat het bestand werkelijk bevat.

## Wat er meereist, en waarom het gescheiden is

Een fotobestand is twee dingen in één omhulsel: het gecodeerde beeld, en een blok etiketten erover — EXIF, vaak met XMP en een kleurprofiel erbij. De etiketten vermelden doorgaans wanneer de foto genomen is, camera en lens, de belichting, de gps-coördinaten van waar je stond, en dikwijls een kleine ingebedde miniatuur — soms van het beeld zoals het *vóór* een bewerking was, en zo kan een bijsnijding missen wat ze wegsneed. De volledige rondleiding door dat blok staat in [de EXIF-gids](https://abox.tools/nl/gidsen/exif-en-gps-gegevens-verwijderen/).

Het punt dat alles beslist: de etiketten liggen *naast* de pixels, niet erin. Een gereedschap dat het beeld decodeert, krijgt pixels en geen etiketten; wat het wegschrijft bevat alleen wat het terug kiest te leggen. Een gereedschap dat het bestand bewerkt zonder te hercoderen, kan de etiketten onaangeroerd laten — of precies die verwijderen en niets anders.

## Waarom hercoderen afstroopt, en kopiëren bewaart

Het meeste beeldwerk in een browser loopt via een canvas: het bestand decoderen tot rauwe pixels, ze transformeren, een vers bestand coderen. Een canvas draagt geen etiketten, dus het verse bestand heeft er geen — niet uit beleid maar uit bouw. Daarom leveren de [afbeeldingscompressor](https://abox.tools/nl/afbeelding-comprimeren/) en het gereedschap om het [formaat van een afbeelding te wijzigen](https://abox.tools/nl/afbeelding-formaat-wijzigen/) hier uitvoer zonder EXIF, gps en XMP, en hun pagina's zeggen het: het is onvermijdelijk — en goed om te weten wanneer je de opnamedatum wilde houden.

Een converter kan daarentegen moeite doen om te bewaren. De [HEIC-naar-JPG-converter](https://abox.tools/nl/heic-naar-jpg/) van deze site doet precies dat: hij tilt het metadatablok uit de HEIC-container en zet het in de JPEG, data, gps en al — omdat een conversie dezelfde foto in een andere jas hoort te zijn. (Eén etiket wordt bewust herschreven: de oriëntatie, zodat het beeld niet kantelt; en het blok past alleen in de JPEG-uitvoer — het formaatmenu zegt het erbij.) Twee eerlijke gereedschappen, tegengesteld gedrag, elk juist voor zijn taak — en precies daarom werkt gokken op soort gereedschap niet.

Buiten de browser is het beeld even gemengd, met dezelfde logica eronder. Schermafbeeldingen en exports zijn verse coderingen: geen camerametadata. Berichtenapps hercomprimeren stevig, dus foto's die als foto verstuurd worden verliezen meestal hun etiketten — maar hetzelfde bestand “als document” verstuurd, reist byte voor byte, etiketten inbegrepen. E-mailbijlagen en clouddiensten verplaatsen bestanden ongewijzigd. Het patroon houdt: opnieuw opgebouwd betekent afgestroopt, gekopieerd betekent bewaard.

## Controleren in plaats van aannemen

De controle duurt nog geen minuut: open het uitvoerbestand — niet het origineel — in de [EXIF-bekijker en -verwijderaar](https://abox.tools/nl/exif-gegevens-verwijderen/) en lees wat erin staat. Hij ontleedt het bestand op je eigen machine en toont elk etiket, de ingebedde miniatuur inbegrepen. Niets erin, niets gelekt. Nog wel erin, en je ziet precies wat.

Uit al het bovenstaande volgen drie gewoontes:

- **Als het doel privacy is, verwijder dan opzettelijk.** Stroop de etiketten af met het EXIF-gereedschap — het bewerkt het bestand zonder te hercoderen, dus het beeld verliest niets — en controleer daarna het resultaat. Vertrouw niet op een verkleining die toevallig afstroopt.
- **Als het doel het bewaren van de gegevens is, converteer dan met een gereedschap dat zegt te bewaren** — en controleer ook dat, want “waarschijnlijk bewaard” faalt in de andere richting: een fotoarchief met verdampte data is ook een verlies.
- **Controleer het bestand dat je werkelijk verstuurt**, na de laatste stap in je keten. Elk gereedschap beslist voor zichzelf, en alleen de inhoud van het eindbestand telt.

En als het controleergereedschap zelf een webpagina is, geldt de gebruikelijke vraag ook voor hem — een metadatabekijker ontvangt je foto, gps en al. Die van hier draait volledig in je browser zonder iets ergens heen te sturen, en [de gids over uploaden](https://abox.tools/nl/gidsen/is-bestanden-uploaden-veilig/) laat zien hoe je die bewering controleert in plaats van gelooft.
