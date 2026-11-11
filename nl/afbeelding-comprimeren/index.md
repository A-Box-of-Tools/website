# Afbeelding comprimeren — naar een exacte grootte

Jij noemt de grootte. De rest rekent de tool uit.

> Comprimeer een JPEG, PNG of WebP naar een exacte grootte: 100 KB, 2 MB, wat je maar wilt. Draait volledig in je browser, uploadt niets en werkt offline.

Deze pagina is een interactief hulpmiddel dat volledig in je browser draait, op https://abox.tools/nl/afbeelding-comprimeren/ — niets van wat je het geeft wordt geüpload. Hieronder staat alles wat de pagina er in woorden over zegt; om het te gebruiken, open je het adres.

## Je afbeeldingen worden **nooit geüpload**. Er is geen server.

Het comprimeren gebeurt in je eigen browser, op je eigen hardware, met de encoders die daar toch al in zitten. Deze tool heeft geen enkele netwerkfunctie, dus er valt niets op te halen en niets te versturen. En al was die er wel, dan stond aan de andere kant van deze pagina nog steeds geen server om een foto naartoe te sturen.

- ✗ Geen upload
- ✗ Geen account
- ✗ Geen groottelimiet
- ✓ Werkt offline
- ✓ Open source

## Zo comprimeer je een afbeelding naar een bepaalde grootte

1. **Kies je afbeeldingen.** Sleep ze het vak in of kies ze met de hand. De browser leest ze rechtstreeks van je schijf, en er gaat ondertussen niets ergens heen.
2. **Tik de grootte in die je is opgelegd.** 100 KB voor het uploadformulier dat je foto steeds weigert, 500 KB voor het sollicitatieportaal, 2 MB voor een pagina die snel moet laden. De vier die het vaakst voorkomen staan als knop klaar.
3. **Klik op “Comprimeren naar het doel”.** Elke afbeelding wordt een paar keer gecodeerd terwijl de tool inzoomt op de hoogste kwaliteit die er nog in past. Wat al onder het doel zit, blijft precies zoals het was.
4. **Kijk wat het gekost heeft en download.** Bij elk resultaat staat in welk formaat het geschreven is, op welke kwaliteit, of de afmetingen veranderd zijn en hoe dicht het gemeten bij het origineel blijft. Met “Vergelijken” zet je de twee plaatjes naast elkaar.

## De uitgebreide versie

[Hoe je een afbeelding naar een exacte bestandsgrootte comprimeert](https://abox.tools/nl/gidsen/afbeelding-naar-exact-formaat-comprimeren/): Een uploadformulier wil 500 KB en je foto is 4 MB. Wat een groottelimiet werkelijk kost, welke instelling je als eerste verzet, en waarom een png niet krimpt zoals een jpeg.

## Ook in de gereedschapskist

- [Afbeeldingsformaat wijzigen](https://abox.tools/nl/afbeelding-formaat-wijzigen/): Noem het formaat. Sleep het kader. Kies het bestandstype.
- [HEIC naar JPG](https://abox.tools/nl/heic-naar-jpg/): De foto's die een iPhone maakt, in een formaat dat overal opengaat.
- [Pasfotomaker](https://abox.tools/nl/pasfoto-maken/): Kies het land. Hij past die regel toe, precies.
- [Afbeeldingen stacken](https://abox.tools/nl/afbeeldingen-stacken/): Twintig frames tot één, zonder twintig uploads en zonder RAW-converter.

## Vragen

### Wordt mijn afbeelding ergens heen geüpload?

Nee. Je eigen browser decodeert, comprimeert en meet het bestand op je eigen hardware, met de JPEG-, PNG- en WebP-encoders die de browser al meelevert. Deze tool heeft geen enkele netwerkfunctie en haalt dus nooit iets op en verstuurt nooit iets. In de `Content-Security-Policy` van de pagina staat bovendien elk adres dat hij mag benaderen, en geen daarvan hoort bij deze site.

### Hoe komt hij precies op een exacte grootte uit?

Door het te proberen. Er bestaat geen formule die een kwaliteitsinstelling omrekent naar een aantal bytes, want dat hangt volledig van het plaatje af. Daarom codeert de tool de afbeelding een aantal keer en zoekt hij het antwoord. Hij begint bovenaan het kwaliteitsbereik en halveert zich naar beneden, waardoor hij de hoogste passende kwaliteit in een stuk of acht rondes te pakken heeft. Elke grootte die je op de pagina ziet, is een echt gecodeerd bestand en geen schatting.

### Wat betekent “minimaal verlies” hier eigenlijk?

Drie concrete dingen. Om te beginnen gaat een afbeelding die al onder je doel zit byte voor byte door zonder opnieuw gecodeerd te worden. Verder gaat er eerst kwaliteit op en pas daarna resolutie, en alleen tot een ondergrens waaronder compressieartefacten zichtbaar worden. Voorbij dat punt maakt de tool het plaatje kleiner en draait hij de kwaliteit weer omhoog, omdat minder goede pixels er beter uitzien dan meer verpeste. En zodra er een passend resultaat is, kruipt de zoektocht weer omhoog tot het budget op is, zodat je geen bestand van 300 KB krijgt als je om 500 KB vroeg.

### Wat zijn die SSIM- en PSNR-cijfers bij elk resultaat?

Een meting van wat de compressie gekost heeft, gedaan door het resultaat te decoderen en met het originele plaatje te vergelijken. SSIM vergelijkt plaatselijke helderheid, contrast en structuur, en dat ligt veel dichter bij waar een oog zich aan stoort dan het tellen van veranderde pixels. Boven de 0,98 zijn de twee naast elkaar nauwelijks uit elkaar te houden. PSNR is het klassieke decibelgetal. Ze worden allebei op je eigen apparaat berekend, en ze staan er allebei bij zodat je de bewering over weinig verlies kunt natrekken in plaats van hem te moeten geloven.

### Welke formaten kan hij lezen en schrijven?

Hij leest alles wat je browser kan decoderen, in de praktijk dus JPEG, PNG, WebP, GIF, BMP en in de meeste browsers van nu ook AVIF. Schrijven doet hij in JPEG, PNG en WebP, want dat zijn de encoders die browsers meeleveren. Op “automatisch” houdt hij het formaat waarin je bestand binnenkwam, en stapt hij alleen over op WebP wanneer vasthouden een verkleining of een zichtbaar kwaliteitsverlies had gekost.

### Waarom valt een PNG niet ver te comprimeren?

Omdat PNG verliesloos is en er dus geen kwaliteitsknop aan zit om aan te draaien. Een PNG kleiner maken kan alleen met minder pixels of minder kleuren, dus met PNG geselecteerd haalt de tool een doel puur via het formaat. Is het plaatje een foto, dan komen JPEG of WebP veel dichter bij je doel, op een kwaliteit waarvan je zelf kunt zien dat hij prima is. Gaat het om een logo of een schermafbeelding met transparantie, dan houdt WebP die transparantie die JPEG met wit zou opvullen.

### Verdwijnen de EXIF- en gps-gegevens als ik een afbeelding comprimeer?

Ja, als bijwerking. Comprimeren betekent dat het plaatje tot pixels wordt gedecodeerd en dat die pixels opnieuw worden gecodeerd, en een canvas vol pixels draagt geen tags. De locatie, het cameramodel, de tijdstempels en al het andere belanden daardoor domweg niet in het nieuwe bestand. Wil je de metagegevens kwijt maar het plaatje onaangeroerd houden, gebruik dan de [EXIF-lezer & -wisser](https://abox.tools/nl/exif-gegevens-verwijderen/), want die schrijft de container opnieuw zonder ook maar iets opnieuw te comprimeren.

### Is het gratis, en heb ik er een account voor nodig?

Het is gratis, en er komt geen account, geen inlog, geen proefperiode en geen watermerk aan te pas. Er zit ook geen limiet op het aantal bestanden of op de grootte ervan, omdat er geen server is die daarvoor betaalt: het werk gebeurt op je eigen apparaat. De site draait op advertenties, en die betalen hem. Die advertenties krijgen niets over je afbeeldingen mee.

### Werkt het offline?

Ja. Laad de pagina één keer, verbreek daarna je internetverbinding en hij werkt gewoon door. Dat is meteen de eenvoudigste manier om te bewijzen dat er niets geüpload wordt, want een tool die je afbeeldingen wegstuurde om ze te laten comprimeren zou ermee ophouden zodra je de stekker eruit trok.

## Hoe je de privacybelofte controleert

- **Je afbeeldingen kunnen nergens heen.** In de Content-Security-Policy staat elk adres dat deze pagina mag benaderen, en geen daarvan hoort bij deze site. Er is hier geen eindpunt waar je bestanden verzameld zouden kunnen worden, en in de code staat niets wat ze zou versturen als dat eindpunt er wel was.
- **Niets hier haalt iets op.** In `src/` staat nergens een `fetch`, een `XMLHttpRequest` of een `sendBeacon`. Het comprimeren gebeurt met `canvas.toBlob`, de encoder die al in je browser zit.
- **De cijfers worden gemeten, niet gemeld.** De groottes, het kwaliteitscijfer en de SSIM-vergelijking worden allemaal op deze pagina berekend en aan jou getoond. In deze repository zit geen eigen analytics-gebeurtenis die een bestandsnaam, een grootte, een aantal of een resultaat meedraagt.
- **Wat Google laadt, en wat het niet te zien krijgt.** De advertentie- en meetscripts komen van Google, de doneerknop van Buy Me a Coffee. Geen van alle krijgt iets over je foto's mee. Elke regel die een bestand leest, comprimeert of meet, wordt vanaf deze herkomst geserveerd en staat in de repository.
- **Het werkt offline.** Verbreek de verbinding en de tool werkt onveranderd door, omdat er nooit een netwerkstap in zat. Eenvoudiger bewijs bestaat er niet.

**Controleer het zelf.** Je hoeft niets van het bovenstaande op ons woord aan te nemen. Een buildscript maakt deze pagina uit de sjablonen en de configuratie in de repository, en dat script kun je lezen en zelf draaien. Het resultaat staat vastgelegd op de branch `dist`, dus je kunt wat er geserveerd wordt vergelijken met wat een build van de bronnen oplevert: https://github.com/A-Box-of-Tools/website

De bestanden die je als eerste wilt lezen zijn `config/site.toml` voor de Content-Security-Policy, `src/compress.js` voor de zoektocht die bepaalt hoeveel kwaliteit eraan opgaat, en `src/measure.js` voor de vergelijking achter het cijfer “visuele overeenkomst”.
