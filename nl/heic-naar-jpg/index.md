# HEIC naar JPG — iPhone-foto's omzetten

De foto's die een iPhone maakt, in een formaat dat overal opengaat.

> Zet HEIC-foto's van een iPhone om naar JPG in je browser. De decoder draait op je eigen apparaat, dus er wordt niets geüpload. Werkt offline, en de datum en cameragegevens mogen mee.

Deze pagina is een interactief hulpmiddel dat volledig in je browser draait, op https://abox.tools/nl/heic-naar-jpg/ — niets van wat je het geeft wordt geüpload. Hieronder staat alles wat de pagina er in woorden over zegt; om het te gebruiken, open je het adres.

## Je foto's worden **nooit geüpload**. Er is geen server.

Het decoderen gebeurt in je eigen browser, op je eigen hardware. HEIC is het ene beeldformaat dat een browser niet uit zichzelf opent, en daarom draagt deze pagina de decoder mee: zo'n 1,4 MB, geserveerd vanaf deze site en na het eerste bezoek in de cache. Precies daar zit de reden dat elke andere HEIC-omzetter je om een upload vraagt, want die zetten de codec op een server en dan moeten je foto's daarheen. Deze zet de codec hier neer. Er zit op deze pagina helemaal geen netwerkfunctie, en aan de andere kant staat geen server om een foto naartoe te sturen.

- ✗ Geen upload
- ✗ Geen account
- ✗ Geen groottelimiet
- ✓ Werkt offline
- ✓ Open source

## Zo zet je HEIC-foto's om naar JPG

1. **Kies je HEIC-foto's.** Sleep ze het vak in of kies ze met de hand, zo uit een telefoonback-up of een map op je bureaublad. De browser leest ze van je schijf, en er gaat ondertussen niets ergens heen. Op de lijst staat wat elk bestand is en wat erin zit.
2. **Kijk wat de foto's meedragen.** Bij elke regel staat de datum waarop hij gemaakt is, de camera, en in het groen, want dat is het stuk dat opvalt, of het bestand gps-coördinaten bevat. Dat wordt uit de container gelezen zonder het plaatje te decoderen, dus het kost je niets en het staat er meteen.
3. **Kies een formaat, en beslis over de details.** JPEG, tenzij je een reden hebt om iets anders te nemen, want dat is het formaat dat overal opengaat en daar was het omzetten om begonnen. De kwaliteitsschuif staat op 92, de stand waarop een foto nauwelijks van het origineel te onderscheiden is. Met het vinkje bepaal je of de datum, de camera en de locatie meegaan.
4. **Druk op “Omzetten” en download.** De decoder komt binnen bij de eerste omzetting, zo'n 1,4 MB en dan nooit meer, en elke foto daarna wordt op je eigen apparaat gedecodeerd en geschreven. Bij één bestand krijg je een downloadknop, bij meerdere krijg je er een zip bij.

## De uitgebreide versie

[De foto die je telefoon opsloeg, en het formaat dat niets wil openen](https://abox.tools/nl/gidsen/heic-naar-jpg-omzetten/): iPhones slaan foto's op als HEIC, en het halve internet kan er geen openen. Wat het formaat is, waarom alleen Safari het decodeert, wat omzetten het plaatje kost, en hoe je het doet zonder de foto's aan iemand te uploaden.

## Ook in de gereedschapskist

- [Pasfotomaker](https://abox.tools/nl/pasfoto-maken/): Kies het land. Hij past die regel toe, precies.
- [Afbeeldingen stacken](https://abox.tools/nl/afbeeldingen-stacken/): Twintig frames tot één, zonder twintig uploads en zonder RAW-converter.
- [Afbeelding onleesbaar maken](https://abox.tools/nl/afbeelding-onleesbaar-maken/): Wat je afdekt wordt uit het bestand gewist, niet erin verstopt.
- [EXIF-lezer & -wisser](https://abox.tools/nl/exif-gegevens-verwijderen/): Zie wat een foto over je vertelt. Haal het er daarna uit.

## Vragen

### Wordt mijn foto ergens heen geüpload?

Nee. Je eigen browser leest, decodeert en schrijft het bestand op je eigen hardware. Deze tool heeft geen enkele netwerkfunctie en haalt dus nooit iets op en verstuurt nooit iets. In de `Content-Security-Policy` van de pagina staat bovendien elk adres dat hij mag benaderen, en geen daarvan hoort bij deze site. Het enige wat wel laadt is de decoder zelf, en die komt van deze site, één keer, voordat je foto er ook maar bij betrokken is.

### Waarom downloadt deze pagina de eerste keer 1,4 MB?

Omdat HEIC het ene beeldformaat is dat een browser niet opent. Het is een HEVC-frame in een doosformaat, en alleen Safari heeft er op Apple-hardware een decoder voor. Chrome, Firefox en Edge weigeren het bestand domweg. Een HEIC-omzetter heeft dus ergens een decoder nodig, en die kan maar van twee plekken komen: van een server of van de pagina. Elke andere omzetter koos de server, en precies daarom willen ze allemaal je foto's geüpload hebben. Deze draagt in plaats daarvan `libheif` mee, gecompileerd naar WebAssembly, geserveerd vanaf deze site en na het eerste bezoek in de cache. Dat is de volledige prijs van je foto's die nergens heen gaan.

### Houdt de JPEG de datum, de camera en de locatie?

Als je dat wilt, en daar staat een vinkje voor op de pagina. Blijft het aan, dan wordt het EXIF-blok uit de HEIC gekopieerd en precies zo in de JPEG geschreven als de telefoon het schreef. De omgezette foto sorteert daardoor nog op de dag waarop hij gemaakt is in plaats van op de dag waarop hij omgezet werd, en dat is nu juist de gebruikelijke klacht over HEIC-omzetters. Er verandert precies één tag, namelijk de oriëntatie. Die gaat op “rechtop”, omdat de draaiing al op de pixels is toegepast en een kijker die hem nog eens toepaste elke staande foto op zijn kant zou leggen. Zet je het vinkje uit, dan komt de JPEG eruit met het plaatje en verder niets.

### Haalt hij gps-coördinaten eruit?

Hij zegt je eerst dát ze er zijn, en doet daarna wat jij vraagt. Bij elke foto staat vóór het omzetten al of het bestand coördinaten meedraagt, en dat is meer dan de telefoon doet. Zet je het vinkje “hou de datum, de camera en de instellingen” uit, dan blijven ze samen met al het andere uit de JPEG. Laat je het aan, dan gaan ze mee. Wil je de tags stuk voor stuk doorlopen, of ze weghalen bij foto's die al JPEG zijn, dan is de [EXIF-lezer & -wisser](https://abox.tools/nl/exif-gegevens-verwijderen/) de tool daarvoor, en die doet het zonder het plaatje opnieuw te comprimeren.

### Wordt het plaatje opnieuw gecomprimeerd?

Ja, en dat kan ook niet anders, want HEIC en JPEG zijn verschillende codecs en je komt niet van de ene naar de andere zonder het plaatje te decoderen en opnieuw te coderen. Wat je wel in de hand hebt is wat dat kost. De kwaliteitsschuif staat standaard op 92, waarop een foto heel moeilijk van het origineel te onderscheiden is, en PNG staat op het menu voor als je helemaal geen verlies wilt en het niet erg vindt dat het bestand vijf tot tien keer zo groot wordt.

### En als het bestand .jpg heet maar eigenlijk een HEIC is?

Dan werkt het nog steeds. Elk bestand dat hier naar binnen gaat wordt aan zijn eerste bytes herkend en niet aan zijn naam, want die naam is wat de laatste app die het bestand aanraakte ervan gemaakt heeft. Een HEIC die binnenkomt onder de naam “.jpg” is trouwens een van de gebruikelijkste redenen dat mensen zo'n tool gaan zoeken. Een bestand dat werkelijk een JPEG of een PNG is, wordt geweigerd met een melding die dat zegt, in plaats van omgezet te worden in een kopie van zichzelf.

### Kan hij een Live Photo of een burst omzetten?

De stilstaande beelden erin, ja. Een HEIC kan meer dan één plaatje bevatten, en elk plaatje dat erin zit wordt omgezet en naar het origineel genoemd met een nummer erachter. De videohelft van een Live Photo is een apart bestand dat de telefoon naast de HEIC bewaart, dus dat zit hier niet in om om te zetten. Dieptekaarten en miniaturen zitten wel in de container, maar dat zijn geen plaatjes waar iemand om vroeg, en die blijven met rust.

### Waarom neemt hij mijn AVIF niet aan?

Omdat er niets aan te doen valt. AVIF is dezelfde container als HEIC, alleen met AV1 erin in plaats van HEVC, en elke huidige browser decodeert er vanzelf een. Een omzetter zou dus een megabyte engine meesturen om een probleem op te lossen dat je niet hebt. Heb je een AVIF nodig als JPEG, dan lezen de [Afbeeldingscompressor](https://abox.tools/nl/afbeelding-comprimeren/) en de [Afbeeldingsformaat wijzigen](https://abox.tools/nl/afbeelding-formaat-wijzigen/) allebei AVIF en schrijven ze JPEG met de decoder die je browser al heeft.

### Is het gratis, en heb ik er een account voor nodig?

Het is gratis, en er komt geen account, geen inlog, geen proefperiode en geen watermerk aan te pas. Er zit ook geen limiet op het aantal bestanden of op de grootte ervan, omdat er geen server is die daarvoor betaalt: het werk gebeurt op je eigen apparaat. De site draait op advertenties, en die betalen hem. Die advertenties krijgen niets over je foto's mee.

### Werkt het offline?

Ja, decoder en al. Laad de pagina één keer, verbreek daarna je internetverbinding en hij werkt precies zo door aan je foto's. Dat is meteen het sterkste bewijs dat er niets geüpload wordt, want een omzetter die je HEIC's wegstuurde om ze te laten decoderen zou ermee ophouden zodra je de stekker eruit trok. Deze niet.

## Hoe je de privacybelofte controleert

- **Je foto's kunnen nergens heen.** In de Content-Security-Policy staat elk adres dat deze pagina mag benaderen, en geen daarvan hoort bij deze site. Er is hier geen eindpunt waar je bestanden verzameld zouden kunnen worden, en in de code staat niets wat ze zou versturen als dat eindpunt er wel was.
- **De decoder kwam hiervandaan, en hij gaat nergens heen.** HEIC is HEVC in een doosformaat, en behalve Safari decodeert geen enkele browser er een. Daarom levert deze pagina `libheif` mee, gecompileerd naar WebAssembly: zo'n 1,4 MB, vastgelegd in deze repository, geserveerd vanaf deze herkomst en door de service worker in de cache gezet als elk ander bestand hier. Hij komt niet van een CDN, want dat zou bij elk bezoek een derde partij in het pad zetten en de tool offline laten stoppen. Het binaire deel zit in het script in plaats van ernaast, juist zodat er geen fetch nodig is om het te starten.
- **Niets hier haalt iets op.** In geen enkel bestand dat voor deze tool geschreven is staat een `fetch`, een `XMLHttpRequest` of een `sendBeacon`. De meegeleverde engine bevat, zoals elke Emscripten-build, de laadpaden die een `.wasm` van een URL zouden halen. Die worden niet genomen, omdat het binaire deel al in huis is. En gebeurde het toch, dan noemt `connect-src` de meeteindpunten van Google en verder niets, dus zou de browser het weigeren. Het bewijs is de policy, niet de belofte.
- **De metagegevens worden hier gelezen en aan jou gemeld.** De lijst op de pagina zegt wat elke foto meedraagt: de datum, de camera, en of er gps-coördinaten in zitten. Dat wil je misschien weten voordat je de JPEG aan iemand geeft. `src/boxes.js` leest het in deze browser uit het bestand, toont het op deze pagina, en schrijft het in je JPEG of laat het weg, geheel zoals jij kiest. In deze repository zit geen eigen analytics-gebeurtenis die een bestandsnaam, een datum, een coördinaat of een aantal meedraagt.
- **Wat Google laadt, en wat het niet te zien krijgt.** De advertentie- en meetscripts komen van Google, de doneerknop van Buy Me a Coffee. Geen van alle krijgt iets over je foto's mee. Elke regel die een bestand leest, decodeert of schrijft, wordt vanaf deze herkomst geserveerd en staat in de repository.
- **Het werkt offline.** Laad de pagina één keer, verbreek de verbinding, en de tool werkt onveranderd door, want de decoder zit mee in de cache. Eenvoudiger bewijs bestaat er niet, en hier weegt het zwaarder dan waar dan ook op deze site: een omzetter die je foto's wegstuurde om ze te laten decoderen zou dat onmogelijk voor elkaar krijgen.

**Controleer het zelf.** Je hoeft niets van het bovenstaande op ons woord aan te nemen. Een buildscript maakt deze pagina uit de sjablonen en de configuratie in de repository, en dat script kun je lezen en zelf draaien. Het resultaat staat vastgelegd op de branch `dist`, dus je kunt wat er geserveerd wordt vergelijken met wat een build van de bronnen oplevert: https://github.com/A-Box-of-Tools/website

De bestanden die je als eerste wilt lezen zijn `config/site.toml` voor de Content-Security-Policy, `src/heif.js` voor hoe de decoder geladen wordt en wat hij mag, `src/boxes.js` voor het ontleden van de container die de metagegevens van de foto vindt, en `src/exif.js` voor wat er met die metagegevens gebeurt op weg naar een JPEG. De engine zelf is `vendor/libheif.js`, ongewijzigd, met zijn licentie ernaast.
