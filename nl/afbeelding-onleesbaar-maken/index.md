# Afbeelding onleesbaar maken — zwart maken, pixelen of blurren

Wat je afdekt wordt uit het bestand gewist, niet erin verstopt.

> Dek een naam, een adres of een rekeningnummer in een foto of screenshot af en sla de afbeelding opnieuw op, zodat de verborgen pixels echt uit het bestand zijn en niet onder een rechthoek blijven liggen. Alles gebeurt in de browser.

Deze pagina is een interactief hulpmiddel dat volledig in je browser draait, op https://abox.tools/nl/afbeelding-onleesbaar-maken/ — niets van wat je het geeft wordt geüpload. Hieronder staat alles wat de pagina er in woorden over zegt; om het te gebruiken, open je het adres.

## Je afbeeldingen worden **nooit geüpload**. Er is geen server.

Je eigen browser decodeert de afbeelding, schildert eroverheen en codeert hem opnieuw, met de codecs die hij toch al meebrengt. Dit gereedschap heeft geen enkele netwerkfunctie, niet om iets op te halen en niet om iets te versturen, en dat weegt hier zwaarder dan bijna overal anders op deze site, want wie een afbeelding onleesbaar wil maken heeft er meestal een voor zich waar nog een naam, een adres of een rekeningnummer op te lezen is.

- ✗ Geen upload
- ✗ Geen account
- ✗ Geen watermerk
- ✓ Werkt offline
- ✓ Open source

## Zo maak je een afbeelding onleesbaar zodat het afgedekte echt weg is

1. **Kies de afbeelding.** Een screenshot, een scan of een foto: alles wat je browser kan openen. Hij wordt rechtstreeks van je schijf gelezen en er gaat ondertussen niets ergens heen.
2. **Sleep een vakje over wat niemand mag zien.** En daarna een volgende. Een vakje versleep je, je verandert het formaat met de grepen, of je bereikt het met Tab en werkt met de pijltjestoetsen. Wat er onder het vakje verschijnt is het echte resultaat, getekend door dezelfde code die straks het bestand schrijft.
3. **Kies zwart, pixelen of blurren — en kies zwart.** Een zwart vlak laat helemaal niets over. Pixelen en blurren vervangen de pixels door gemiddelden van zichzelf, en dat is genoeg voor een gezicht op de achtergrond en niet genoeg voor iets dat als tekst te lezen is.
4. **Klik op ‘Onleesbaar maken en opslaan’ en controleer het bestand.** De afbeelding die daarna verschijnt is het klaargemaakte bestand, opnieuw gedecodeerd. Open het in een editor en zoek naar een laag, of probeer de afgedekte tekst te selecteren: er is één platte afbeelding, en wat je hebt afgedekt was overschreven voordat hij werd geschreven.

## De uitgebreide versie

[Een afbeelding zo onleesbaar maken dat het afgedekte echt weg is](https://abox.tools/nl/gidsen/een-afbeelding-onleesbaar-maken/): De zwarte vakken die de meeste programma's tekenen liggen op de afbeelding en kunnen worden weggeschoven. Wat een echte redactie onderscheidt van een afdekking, waarom gepixelde tekst terug te lezen is en hoe je een bestand controleert voordat je het verstuurt.

## Ook in de gereedschapskist

- [EXIF-lezer & -wisser](https://abox.tools/nl/exif-gegevens-verwijderen/): Zie wat een foto over je vertelt. Haal het er daarna uit.
- [DICOM-viewer](https://abox.tools/nl/dicom-viewer/): CT, MRI, röntgen en echo, met het venster, de header en de metingen.
- [Afbeelding naar ICO](https://abox.tools/nl/favicon-maken/): Eén plaatje erin. Elk formaat dat een browser, Windows of een Mac vraagt eruit.
- [Afbeelding naar data-URI](https://abox.tools/nl/afbeelding-naar-base64/): Het hele plaatje als één regel tekst. Plak hem zo in je CSS of HTML.

## Vragen

### Wordt mijn afbeelding ergens naartoe geüpload?

Nee. Je eigen browser decodeert het bestand op je eigen hardware, maakt het onleesbaar en codeert het opnieuw. Dit gereedschap heeft geen enkele netwerkfunctie, het haalt nooit iets op en stuurt nooit iets, en in de `Content-Security-Policy` van de pagina staat elk adres dat hij mag benaderen, waarvan er geen enkele van ons is. Laad de pagina één keer, trek de internetverbinding eruit en hij werkt gewoon door.

### Is het afgedekte deel echt weg uit het bestand?

Ja, en daarom bestaat dit gereedschap. De afbeelding wordt gedecodeerd naar een buffer met pixels; de vakjes overschrijven de pixels die erbinnen liggen; daarna wordt de buffer als een nieuw bestand gecodeerd. De oorspronkelijke waarden zijn uit het geheugen verdwenen voordat de encoder iets krijgt, dus er is geen laag om te verbergen, geen aantekening om te verwijderen en geen geschiedenis om ongedaan te maken. Je kunt het controleren zoals je iemand anders zijn bewering zou controleren: open het resultaat in een beeldbewerker en zoek naar een tweede laag, of probeer de tekst die je hebt afgedekt te selecteren.

### Kan een gepixeld of geblurd gebied worden hersteld?

Soms, en dit is het enige dat je echt moet lezen voordat je kiest. Een zwart vlak vervangt alles eronder door één kleur, dus er blijft niets over: geen rand, geen gemiddelde, niet eens het aantal tekens. Pixelen vervangt elk blok door het gemiddelde van dat blok, en een raster van gemiddelden is nog altijd een meting van wat eronder lag: voor tekst in een gewoon lettertype op een voorspelbare grootte is dat in gepubliceerd onderzoek genoeg geweest om het origineel te reconstrueren, door kandidaat-teksten te renderen en hun gemiddelden te vergelijken. Blurren is een convolutie, en convoluties zijn in principe omkeerbaar. Pixel dus gerust een gezicht op de achtergrond, en maak alles wat als tekst te lezen is zwart.

### Waarom is een zwarte rechthoek uit een tekstprogramma niet hetzelfde?

Omdat de meeste programma's de rechthoek naast de afbeelding opslaan en niet erin. Een vorm die je tekent in een pdf-lezer, een presentatie, een tekstverwerker of een beeldbewerker met lagen is een object met een positie dat bovenop de pagina ligt, en wie het verplaatst, verwijdert of het bestand in een ander programma opent krijgt precies terug wat eronder zat. Kranten, rechtbanken en ministeries hebben op die manier documenten gepubliceerd. Hier wordt de rechthoek helemaal niet opgeslagen: het zijn pixelwaarden die over de vorige heen geschreven zijn.

### Verdwijnen de EXIF- en GPS-gegevens ook?

Ja, als bijeffect. Opslaan betekent hier dat een canvas vol pixels wordt gecodeerd, en een canvas draagt geen tags, dus de locatie, het cameramodel, de tijdstempels en de ingebedde miniatuur worden simpelweg niet in het nieuwe bestand geschreven. Die miniatuur doet er hier toe: het is een kleine tweede kopie van de afbeelding, hij wordt niet altijd opnieuw aangemaakt als een foto bewerkt wordt, en een onleesbaar gemaakte foto die met een ongeschonden miniatuur op reis gaat doet al het werk teniet. Wil je de metadata kwijt zonder dat de afbeelding opnieuw gecodeerd wordt, dan herschrijft de [EXIF-lezer & -wisser](https://abox.tools/nl/exif-gegevens-verwijderen/) in plaats daarvan de container.

### Welke formaten kan het lezen en schrijven?

Het leest alles wat je browser kan decoderen, in de praktijk dus JPEG, PNG, WebP, GIF, BMP en op de meeste huidige browsers ook AVIF. Het schrijft JPEG, PNG en WebP, want dat zijn de encoders die browsers meebrengen. Op ‘automatisch’ komt een JPEG terug als JPEG en al het andere als PNG, waardoor een foto een fotoformaat houdt en de tekst die op een screenshot wél zichtbaar blijft scherp blijft. Voor het onleesbaar maken maakt de keuze niets uit: de pixels zijn al weg voordat de encoder ze ziet.

### Kan het ook zonder muis?

Ja. ‘Vakje in het midden toevoegen’ zet er een op de afbeelding, met Tab spring je tussen de vakjes, de pijltjestoetsen verplaatsen het vakje met focus en Alt met de pijltjes verandert het formaat; met Shift is elke stap tien pixels en met Delete verdwijnt het. Bij elk vakje hoort bovendien een regel onder de afbeelding met het formaat, de positie, wat het doet en een knop om het te verwijderen, dus het hele gereedschap is met het toetsenbord te bedienen en met een schermlezer te lezen.

### Werkt het op een telefoon?

Ja. Tekenen, verplaatsen en formaat wijzigen gaan via pointergebeurtenissen en niet via muisgebeurtenissen, dus een vinger werkt net zo, en de grepen worden op een aanraakscherm groter getekend. De afbeelding op het scherm wordt tijdens het werken op schermformaat opnieuw getekend; het bestand zelf wordt altijd op de volle resolutie onleesbaar gemaakt zodra je op de knop drukt.

### Is het gratis, en heb ik een account nodig?

Het is gratis, en er is geen account, geen inlog, geen proefperiode en geen watermerk. Er is ook geen limiet aan de grootte van de afbeelding, want er is geen server die ervoor betaalt: het werk gebeurt op je eigen apparaat. De site draait advertenties, en die betalen hem; de advertenties krijgen niets over je afbeeldingen te zien.

## Hoe je de privacybelofte controleert

- **Je afbeeldingen kunnen nergens heen.** In de Content-Security-Policy staat elk adres dat deze pagina mag benaderen, en geen daarvan is van ons. Er is hier geen eindpunt waar je bestanden terecht zouden kunnen komen, en in de code staat ook niets dat ze erheen zou sturen als dat er wel was.
- **De afgedekte pixels verdwijnen hier, niet onderweg naar buiten.** De afbeelding wordt gedecodeerd naar een buffer met pixels, de vakjes worden in die buffer geschreven en de buffer gaat naar de encoder. Er bestaat op deze pagina geen versie van de afbeelding met de vakjes als aparte laag, want die versie wordt nooit gemaakt. Zie `src/redact.js`.
- **Hier haalt niets iets op.** Er is geen `fetch`, geen `XMLHttpRequest` en geen `sendBeacon` ergens in `src/`. Het werk is `getImageData`, drie lussen over de bytes en `canvas.toBlob`, en dat zit allemaal al in je browser.
- **De vakjes worden nergens gemeld.** Waar je hebt getekend, hoeveel het er zijn, hoe groot ze zijn en welke soort je koos, blijft in het geheugen van deze pagina tot je hem sluit. In deze repository staat geen enkele analytics-gebeurtenis die daar iets van meeneemt, en de ene vraag die de site na een download stelt stuurt een duim omhoog of omlaag en de naam van het gereedschap, verder niets.
- **Het werkt offline.** Verbreek de verbinding en het gereedschap is hetzelfde, want er heeft nooit een netwerkstap in gezeten. Dat is het eenvoudigste bewijs van allemaal, en het bewijs dat je wilt draaien voordat je een paspoort onleesbaar maakt.

**Controleer het zelf.** Je hoeft niets van het bovenstaande op ons woord aan te nemen. Een buildscript maakt deze pagina uit de sjablonen en de configuratie in de repository, en dat script kun je lezen en zelf draaien. Het resultaat staat vastgelegd op de branch `dist`, dus je kunt wat er geserveerd wordt vergelijken met wat een build van de bronnen oplevert: https://github.com/A-Box-of-Tools/website

De bestanden die je als eerste wilt lezen zijn `config/site.toml` voor de Content-Security-Policy, `src/redact.js` voor de drie functies die de pixels overschrijven en `src/preview.js` voor de reden dat wat je op het scherm ziet door diezelfde drie functies wordt getekend.
