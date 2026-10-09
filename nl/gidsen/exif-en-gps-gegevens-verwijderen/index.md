# Wat een foto over je zegt, en hoe je het eruit haalt

Een plaatje dat zo van een telefoon komt, draagt doorgaans de coördinaten van de plek waar het genomen is, de tijd op de seconde, en genoeg over de camera om het aan elke andere foto van hetzelfde apparaat te knopen. Niets daarvan is op het scherm te zien. Dit is wat erin zit en hoe je het verwijdert.

[Open de tool EXIF-lezer & -wisser](https://abox.tools/nl/exif-gegevens-verwijderen/): Zie wat een foto over je vertelt. Haal het er daarna uit.

Laatst bijgewerkt 26 augustus 2026

## Het korte antwoord

Open de [EXIF-lezer & -wisser](https://abox.tools/nl/exif-gegevens-verwijderen/), sleep de foto's erin, en druk op “Alle metagegevens verwijderen”. Elke tag, de XMP- en IPTC-blokken, de opmerkingen en de ingesloten miniatuur gaan er in één keer af, bij elke foto op de lijst. Het plaatje zelf blijft onaangeroerd: niet opnieuw gecomprimeerd, niet gedecodeerd, geen pixel veranderd.

Voordat je dat doet, is het de moeite waard om te kijken wat erin zat. Het is meestal meer dan mensen verwachten, en die lijst is het argument om dit überhaupt te doen.

## Wat er werkelijk in een foto zit

Een jpeg is niet alleen een gecomprimeerd plaatje. Het is een container, en naast het plaatje zitten een paar blokken informatie die je camera, telefoon of fotobewerker daar geschreven heeft.

- **EXIF.** De belangrijkste. Merk en model van de camera, de lens, de belichtingsinstellingen, de ISO, de datum en tijd op de seconde nauwkeurig, de oriëntatie waarin het plaatje getoond hoort te worden, en op een telefoon met locatievoorzieningen aan voor de camera ook nog een gps-positie tot op een paar meter nauwkeurig. Vaak zit er daarnaast een serienummer van de camerabody in.
- **Gps.** Technisch een onderdeel van EXIF, en het apart noemen waard omdat het degene is die het zwaarst weegt. Hij staat er in graden, minuten en seconden, en dat is een notatie die er bijzonder goed in slaagt niet op een adres te lijken.
- **XMP.** Een pakketje XML dat fotobewerkers schrijven. Het kan je naam meedragen, je software, waarderingen, trefwoorden, een bewerkingsgeschiedenis, en een kopie van een deel van de EXIF-velden. Juist daarom is alleen EXIF verwijderen niet genoeg.
- **IPTC.** Een ouder blok met bijschrift-, naamsvermeldings-, credit- en auteursrechtvelden, in gebruik bij pers en stockfotografie.
- **De ingesloten miniatuur.** Een kleine tweede kopie van het beeld. Hij wordt gemaakt wanneer het bestand geschreven wordt, en hij wordt niet altijd opnieuw gemaakt wanneer het plaatje bewerkt wordt. Zo kan een bijgesneden foto rondreizen met een miniatuur van precies wat eraf gesneden is.
- **De makernotitie.** Een ongedocumenteerd blok fabrikantgegevens. Niemand buiten de fabrikant weet alles wat erin zit.

![De inspecteur: een miniatuur van een foto naast een lijst van wat erin is gevonden, waaronder het merk en model van de camera, de datum van de opname en GPS-coördinaten.](https://abox.tools/screens/remove-exif-and-gps-data/inside.webp)

Wat een foto van een telefoon echt met zich meedraagt. De meeste mensen hebben nooit gekeken, en daarom bestaat deze gids.

## Wie het werkelijk ziet

Dit is het stuk waarover je nauwkeurig moet zijn, want zowel de alarmerende als de wegwuivende versie klopt niet.

**De meeste grote sociale netwerken wissen metagegevens wanneer je post.** Facebook, Instagram en X coderen geüploade afbeeldingen opnieuw en laten de tags daarbij vallen. Vriendelijk bedoeld is dat niet, want zij houden de gegevens aan hun eigen kant, maar het betekent wel dat een foto die daar gepost wordt niet aan elke kijker zijn coördinaten geeft.

**Vrijwel al het andere houdt ze.** Een e-mailbijlage. Een bestand dat via de meeste chat-apps als “document” verstuurd wordt in plaats van als foto. Een plaatje op een forum, een marktplaatsadvertentie, een persoonlijke site, een gedeelde schijf, een bugmelding, een supportticket. In al die gevallen komt het bestand intact aan, en iedereen die het downloadt kan de tags lezen met gereedschap dat met zijn besturingssysteem meekomt.

De realistische risico's zijn alledaags in plaats van dramatisch: een advertentie met foto's die thuis genomen zijn, een foto van een kind die op hun school gemaakt is, een schijnbaar anoniem account dat foto's post die allemaal hetzelfde cameraserienummer delen, een “vorige week genomen” dat in maart genomen is.

## Waarom niet gewoon opnieuw opslaan?

Een foto opnieuw opslaan via een fotobewerker of een compressor haalt de metagegevens er wel degelijk uit, want het plaatje wordt gedecodeerd tot pixels en opnieuw gecodeerd, en een canvas vol pixels draagt geen tags. Het werkt dus, alleen kost het je kwaliteit, omdat die hercodering verliesgevend is.

De metagegevens fatsoenlijk verwijderen kost helemaal niets. De tags zitten in de container *om* het gecomprimeerde plaatje heen, niet erin, dus ze wissen is items uit een lijst schrappen en de lijst weer wegschrijven. De gecomprimeerde beeldgegevens gaan byte voor byte mee en het resultaat decodeert naar precies dezelfde pixels. Dat is de hele reden om een metagegevenstool te gebruiken in plaats van een omzetter.

De uitzondering is wanneer je toch al ging hercoderen. Ben je de foto al aan het comprimeren of schalen, dan gaan de tags als bijwerking mee en heb je geen tweede stap nodig.

## Het ene ding om te houden: de oriëntatie

Telefoons draaien het plaatje niet wanneer jij de telefoon draait. Ze leggen het vast zoals de sensor het zag en voegen een Orientation-tag toe die zegt hoe het gedraaid moet worden om te tonen. Wis elke tag en sommige kijkers tonen je foto op zijn kant.

Daarom heeft de tool hier een optie “hou de oriëntatietag”, die standaard aanstaat. Die schrijft een piepklein EXIF-blok terug met die ene tag en verder niets, en alleen voor foto's die hem echt nodig hadden. De gps, de tijdstempels, het serienummer en de rest zijn nog steeds weg.

Zet hem uit als je liever hebt dat het bestand helemaal geen EXIF draagt, maar controleer het resultaat dan wel voordat je het verstuurt, want een foto op zijn kant is de gebruikelijke uitkomst.

![De opschoonkaart: een knop om alles te verwijderen, met schakelaars om het oriëntatielabel en het kleurprofiel te behouden.](https://abox.tools/screens/remove-exif-and-gps-data/strip.webp)

Alles eruit, op de twee dingen na die het bewaren waard zijn. De oriëntatie is degene die, als hij weggaat, de halve reeks op zijn kant legt.

## Bewerken in plaats van verwijderen

Alles verwijderen is voor de meeste mensen het juiste antwoord. Soms niet: een fotograaf wil misschien de auteursrechtregel en de camera-instellingen houden en alleen de locatie kwijt; een archivaris moet misschien een datum corrigeren die fout was omdat de cameraklok dat was.

Allebei kan. De locatie kan los verwijderd worden, en teksttags, datums, ISO, oriëntatie en resolutie kunnen ter plekke bewerkt worden.

Eén kanttekening die voor elke tool geldt die dit doet, niet alleen voor deze: het bestand schrijven bouwt het EXIF-blok opnieuw op, en een makernotitie bevat offsets naar het *originele* blok. Een herbouwde makernotitie is daarom misschien niet meer leesbaar voor de eigen software van de fabrikant. Maakt dat uit, verwijder dan de makernotitie of laat het bestand onbewerkt.

## Formaten, en die het zo niet kunnen

Jpeg, png en WebP zijn alle drie netjes te herschrijven, en dat zijn de drie die de tool hier aankan.

HEIC, wat een iPhone standaard opslaat, en AVIF zijn doosformaten die uit geneste atomen bestaan en die een heel andere parser nodig hebben. De tool herkent ze en zegt dat, in plaats van een kapot bestand te maken. Heb je een HEIC, dan haalt hem naar jpeg omzetten de metagegevens er als bijwerking van de omzetting uit.

Een kale TIFF gaat ook niet, en om een interessantere reden: in een TIFF worden de metagegevens en de pixelgegevens door dezelfde offsets aangewezen, dus tags verwijderen betekent de adressering van het plaatje zelf herschrijven. Dat kan, en het is een andere klus.

## Een gewoonte die het waard is

Controleer vóór je post in plaats van erna. De tags lezen kost een paar seconden en de bevindingenlijst noemt de dingen die het weten waard zijn zoals de positie, de tijdstempels en de serienummers, nog vóór de volledige tabel met elke tag. Je hoeft dus niet te weten waar je op moet letten.

De positie wordt eerst in decimale graden getoond, met opzet. “51 graden, 30 minuten, 26 seconden” maakt niet duidelijk dat een foto het gebouw noemt waarin hij genomen is. Een paar decimalen die je in een kaart kunt plakken wel.

## Upload de foto niet om erachter te komen wat erin zit

Er zit een bijzondere ironie in de gebruikelijke manier waarop dit probleem opgelost wordt: iemand die zich zorgen maakt over wat zijn foto prijsgeeft, uploadt hem naar een website om erachter te komen. Die site heeft nu de foto, de coördinaten, de tijdstempel en het serienummer, en een kopie van het plaatje op een schijf die van hen is.

Er is geen reden voor. De container om een jpeg heen lezen en herschrijven is een paar honderd regels ontleedwerk die een browser prima draait, en daarom heeft de tool hier helemaal geen netwerkfunctie: geen `fetch`, geen `XMLHttpRequest`, niets dat een bestand zou kunnen versturen ook al probeerde er iets. Laad hem één keer, verbreek de verbinding, en hij werkt door.

[Is het veilig om bestanden naar online omzetters te uploaden?](https://abox.tools/nl/gidsen/is-bestanden-uploaden-veilig/) zet uiteen hoe je die bewering controleert, op deze site en op elke andere. Bij dit bestandstype is dat het meest de moeite waard.
