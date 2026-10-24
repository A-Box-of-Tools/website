# EXIF-lezer & -wisser — metagegevens uit een foto halen

Zie wat een foto over je vertelt. Haal het er daarna uit.

> Bekijk de EXIF- en gps-gegevens die in een foto verstopt zitten, bewerk ze, of wis alles in één klik. Alles in je browser, en de foto wordt nooit opnieuw gecodeerd.

Deze pagina is een interactief hulpmiddel dat volledig in je browser draait, op https://abox.tools/nl/exif-gegevens-verwijderen/ — niets van wat je het geeft wordt geüpload. Hieronder staat alles wat de pagina er in woorden over zegt; om het te gebruiken, open je het adres.

## Je foto's worden **nooit geüpload**. Er is geen server.

Je eigen browser opent het bestand, ontleedt het en schrijft het opnieuw. Deze tool heeft geen enkele netwerkfunctie, dus er valt niets op te halen en niets te versturen. En al was die er wel, dan stond aan de andere kant van deze pagina nog steeds geen server om een foto naartoe te sturen.

- ✗ Geen upload
- ✗ Geen account
- ✓ Werkt offline
- ✓ Open source
- ✓ Codeert het plaatje nooit opnieuw

## Zo haal je de EXIF-gegevens uit een foto

1. **Kies je foto's.** Sleep ze het vak in of kies ze met de hand. De browser leest ze rechtstreeks van je schijf, en er gaat ondertussen niets ergens heen.
2. **Lees wat erin zit, als je dat wilt.** De bevindingenlijst noemt eerst de dingen die het weten waard zijn, zoals de gps-positie, de tijdstempels en de serienummers. Daarna komt de volledige tabel met elke tag.
3. **Druk op “Alle metagegevens verwijderen”.** Voor de meeste mensen is dat de hele klus. Elke tag, de XMP- en IPTC-blokken, de opmerkingen en de ingesloten miniatuur gaan er in één keer af, bij elke foto op de lijst.
4. **Of bewerk in plaats van te wissen.** Wijzig een datum, corrigeer een auteursrechtregel, laat de locatie vallen en hou de camera-instellingen. Sla die foto daarna apart op.

## De uitgebreide versie

[Wat een foto over je zegt, en hoe je het eruit haalt](https://abox.tools/nl/gidsen/exif-en-gps-gegevens-verwijderen/): Een foto van een telefoon draagt meestal de exacte plek waar hij genomen is, de tijd op de seconde, en het serienummer van de camera. Wat erin zit, wie het kan lezen, en hoe je het eruit haalt zonder het plaatje aan te raken.

## Ook in de gereedschapskist

- [DICOM-viewer](https://abox.tools/nl/dicom-viewer/): CT, MRI, röntgen en echo, met het venster, de header en de metingen.
- [Afbeelding naar ICO](https://abox.tools/nl/favicon-maken/): Eén plaatje erin. Elk formaat dat een browser, Windows of een Mac vraagt eruit.
- [Afbeelding naar data-URI](https://abox.tools/nl/afbeelding-naar-base64/): Het hele plaatje als één regel tekst. Plak hem zo in je CSS of HTML.
- [SVG naar afbeelding](https://abox.tools/nl/svg-naar-png/): Noem het formaat. Een vector heeft er zelf geen om te verliezen.

## Vragen

### Wordt mijn foto ergens heen geüpload?

Nee. Je eigen browser leest het bestand, ontleedt het en schrijft het opnieuw, op je eigen hardware. Deze tool heeft geen enkele netwerkfunctie en haalt dus nooit iets op en verstuurt nooit iets. In de `Content-Security-Policy` van de pagina staat bovendien elk adres dat hij mag benaderen, en geen daarvan hoort bij deze site.

### Wat is EXIF, en wat zit er nog meer in een foto verstopt?

EXIF is een blok tags dat een camera naast het plaatje schrijft: het merk en model, de belichtingsinstellingen, de datum en tijd op de seconde nauwkeurig, vaak een gps-positie en soms een serienummer. Foto's dragen vaak nog meer mee. Denk aan een XMP-pakket met XML uit een fotobewerker, een IPTC-blok met bijschrift- en naamsvermeldingsvelden, een kleurprofiel, een kleine tweede kopie van het beeld als miniatuur, en een makernotitie met ongedocumenteerde fabrikantgegevens. Deze tool zet het allemaal op een rij.

### Gaat er beeldkwaliteit verloren als de metagegevens eruit gaan?

Nee, en dat is meteen de belangrijkste reden om zo'n tool te gebruiken in plaats van de foto opnieuw op te slaan. Metagegevens zitten in de container om het gecomprimeerde plaatje heen, niet erin. Ze verwijderen komt neer op items uit een lijst schrappen en die lijst weer wegschrijven. De gecomprimeerde beeldgegevens gaan byte voor byte mee, waardoor het resultaat naar precies dezelfde pixels decodeert. Er wordt niets gedecodeerd en niets opnieuw gecomprimeerd.

### Welke bestandsformaten kan hij aan?

JPEG, PNG en WebP. HEIC en AVIF worden wel herkend maar niet herschreven, want het zijn doosformaten die uit geneste atomen bestaan en die een andere parser nodig hebben. De tool zegt dat dan ook, in plaats van een kapot bestand te maken. Een kale TIFF gaat evenmin, omdat in een TIFF dezelfde offsets zowel de metagegevens als de pixels aanwijzen.

### Staat mijn foto gedraaid nadat de metagegevens eruit zijn?

Dat kan, en daar is een instelling voor. Telefoons leggen een foto meestal vast zoals de sensor hem zag en zetten er een Orientation-tag bij die zegt hoe hij gedraaid moet worden. Haal je die tag eruit, dan tonen sommige kijkers de foto op zijn kant. De optie “hou de oriëntatietag” staat daarom standaard aan en schrijft een piepklein EXIF-blok terug met niets anders dan die ene tag erin, en alleen wanneer de foto hem echt nodig had. Zet hem uit als je liever hebt dat het bestand helemaal geen EXIF draagt.

### Haalt hij de gps-locatie eruit?

Ja. Alles verwijderen haalt de hele gps-directory weg, en je kunt de locatie ook los weghalen en de rest laten staan. De positie komt eerst in decimale graden in beeld, omdat je aan “51 graden, 30 minuten, 26 seconden” niet ziet dat een foto het gebouw noemt waarin hij genomen is.

### Kan ik een tag wijzigen in plaats van hem te verwijderen?

Ja. Teksttags, datums, de ISO, de oriëntatie en de resolutie zijn allemaal te bewerken, en een paar veelvoorkomende tags kun je toevoegen aan een foto die ze niet heeft. Er zit wel één kanttekening aan. Het bestand schrijven bouwt het EXIF-blok opnieuw op, en een makernotitie bevat offsets naar het oorspronkelijke blok, waardoor een herbouwde makernotitie daarna misschien niet meer leesbaar is voor de eigen software van de fabrikant. Maakt dat voor jou uit, verwijder hem dan of laat het bestand onbewerkt.

### Is het gratis, en heb ik er een account voor nodig?

Het is gratis, en er komt geen account, geen inlog en geen proefperiode aan te pas. De site draait op advertenties, en die betalen hem. Die advertenties krijgen niets over je foto's mee.

### Werkt het offline?

Ja. Laad de pagina één keer, verbreek daarna je internetverbinding en hij werkt gewoon door. Dat is meteen de eenvoudigste manier om te bewijzen dat er niets geüpload wordt, want een tool die je foto's wegstuurde om ze te laten verwerken zou ermee ophouden zodra je de stekker eruit trok.

## Hoe je de privacybelofte controleert

- **Je foto's kunnen nergens heen.** In de Content-Security-Policy staat elk adres dat deze pagina mag benaderen, en geen daarvan hoort bij deze site. Er is hier geen eindpunt waar je bestanden verzameld zouden kunnen worden, en in de code staat niets wat ze zou versturen als dat eindpunt er wel was.
- **Niets hier haalt iets op.** Anders dan de andere tools in deze doos heeft deze geen functie om iets vanaf een webadres te laden, en ook verder geen enkele optionele netwerkstap. In `src/` staat nergens een `fetch`, een `XMLHttpRequest` of een `sendBeacon`.
- **De metagegevens die we lezen gaan nooit verder.** Je gps-positie komt op deze pagina te staan en gaat nergens anders heen. In deze repository zit geen eigen analytics-gebeurtenis die een tag, een bestandsnaam, een grootte of een aantal meedraagt.
- **Wat Google laadt, en wat het niet te zien krijgt.** De advertentie- en meetscripts komen van Google. Geen van beide krijgt iets over je foto's mee. Elke regel die een bestand leest, ontleedt of herschrijft, wordt vanaf deze herkomst geserveerd en staat in de repository.
- **Wat de doneerknop laadt, en wat hij niet te zien krijgt.** De knop “Buy me a coffee” in de kop wordt getekend door een script van cdnjs.buymeacoffee.com en haalt zijn letters bij Google Fonts. Het is een link en verder niets. Hij meldt geen bezoek en krijgt niets over jou of je bestanden mee. Er gebeurt niets tenzij je erop klikt, en waar je dan naartoe klikt is de site van iemand anders.
- **Het werkt offline.** Verbreek de verbinding en de tool werkt onveranderd door, omdat er nooit een netwerkstap in zat. Eenvoudiger bewijs bestaat er niet.

**Controleer het zelf.** Je hoeft niets van het bovenstaande op ons woord aan te nemen. Een buildscript maakt deze pagina uit de sjablonen en de configuratie in de repository, en dat script kun je lezen en zelf draaien. Het resultaat staat vastgelegd op de branch `dist`, dus je kunt wat er geserveerd wordt vergelijken met wat een build van de bronnen oplevert: https://github.com/A-Box-of-Tools/website

De bestanden die je als eerste wilt lezen zijn `config/site.toml` voor de Content-Security-Policy, `src/tiff.js` voor de EXIF-parser, en `src/jpeg.js` voor het bewijs dat het plaatje zelf alleen maar gekopieerd wordt.
