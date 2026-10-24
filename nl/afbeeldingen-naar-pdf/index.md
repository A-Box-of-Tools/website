# Afbeeldingen naar pdf — jpg-naar-pdf-omzetter

Zet je plaatjes in één document.

> Voeg jpg-, png- of WebP-afbeeldingen samen tot één pdf, gratis en volledig in je browser. Foto's gaan erin zonder opnieuw gecodeerd te worden, en er wordt niets geüpload.

Deze pagina is een interactief hulpmiddel dat volledig in je browser draait, op https://abox.tools/nl/afbeeldingen-naar-pdf/ — niets van wat je het geeft wordt geüpload. Hieronder staat alles wat de pagina er in woorden over zegt; om het te gebruiken, open je het adres.

## Je afbeeldingen worden **nooit geüpload**. Er is geen server.

Het document wordt op dit apparaat in het geheugen geschreven, pagina voor pagina, door code die vanaf dit adres geserveerd wordt. Niets hier kan een upload doen, en aan de andere kant van deze pagina staat geen server die er een zou kunnen ontvangen.

- ✗ Geen upload
- ✗ Geen account
- ✓ Werkt offline
- ✓ Open source
- ✓ Bestanden blijven op je apparaat

## Zo maak je van afbeeldingen een pdf

1. **Kies je afbeeldingen.** Sleep een map het vak in, of kies de bestanden met de hand. De browser leest ze rechtstreeks van je schijf, en er gaat ondertussen niets ergens heen.
2. **Zet de pagina's op volgorde, en draai wat gedraaid moet.** Eén afbeelding wordt één pagina, in de volgorde die je ziet staan. Sleep een tegel aan zijn handvat om hem te verplaatsen, of doe het met de pijltjes. De draaiknoppen draaien een pagina een kwartslag tegelijk, en meer heeft een scheve scan meestal niet nodig.
3. **Kies een paginaformaat.** Met “Pas de pagina op elke afbeelding aan” wordt elke pagina precies zijn eigen plaatje, zonder dat er iets bijgesneden wordt en zonder witte banen. De benoemde formaten, van A4 en Letter tot Legal en de rest, zetten elk plaatje juist op een vaste pagina, met een marge als je die wilt.
4. **Maak de pdf en download hem.** Het document wordt op je eigen apparaat geschreven, dus hoe lang het duurt hangt van je hardware af en niet van een wachtrij. Het gereedgekomen bestand gaat rechtstreeks naar de downloads van je browser.

## De uitgebreide versie

[Hoe je afbeeldingen samenvoegt tot één pdf](https://abox.tools/nl/gidsen/afbeeldingen-samenvoegen-tot-een-pdf/): Maak van foto's of scans één pdf: paginaformaat, volgorde en draaiing, waarom een jpeg onderweg geen kwaliteit hoeft te verliezen, en wat een pdf vertelt aan degene naar wie je hem stuurt.

## Ook in de gereedschapskist

- [Documentscanner](https://abox.tools/nl/documenten-scannen/): Fotografeer de pagina. Je krijgt iets terug dat eruitziet als een scan.
- [Audio uit video halen](https://abox.tools/nl/audio-uit-video-halen/): Sleep er een video in en haal het geluid eruit. Het beeld wordt nooit gedecodeerd en er wordt niets geüpload.
- [Audioknipper](https://abox.tools/nl/audio-knippen/): Markeer tijdens het afspelen wat het waard is. Je krijgt het terug als één bestand, geknipt waar jij het zei.
- [Audiobewerker](https://abox.tools/nl/audio-bewerken/): Achterstevoren afspelen, de snelheid wijzigen, een zachte opname optillen. Alles hier, op je eigen apparaat.

## Vragen

### Worden mijn afbeeldingen ergens heen geüpload?

Nee. Je eigen browser leest je afbeeldingen en schrijft de pdf, op je eigen hardware. Deze tool heeft geen serverkant, en in de `Content-Security-Policy` van de pagina staat elk adres dat hij mag benaderen, waarvan er geen enkele bij deze site hoort. Anders dan sommige andere tools hier heeft deze helemaal geen optionele netwerkfunctie.

### Kost omzetten naar pdf kwaliteit?

Voor een JPEG niet, op de standaardinstelling. Pdf kan JPEG-gegevens rechtstreeks meedragen, dus een foto gaat byte voor byte het document in. Hij wordt nooit gedecodeerd en nooit opnieuw gecomprimeerd, en het plaatje in de pdf is precies het plaatje in het bestand. Andere formaten moeten wel opnieuw gecodeerd worden, omdat pdf er geen filter voor heeft. Kies je de verliesloze instelling, dan blijven ze exact bewaard, alleen wordt het bestand dan groter.

### Welke afbeeldingsformaten kan ik gebruiken?

Elk stilstaand beeld dat je browser kan decoderen, in de praktijk dus jpg, png, WebP, gif, AVIF en op Apple-apparaten ook HEIC. Er valt hier geen aparte lijst bij te houden, omdat het decoderen het werk van de browser is en niet van ons.

### Kan ik het paginaformaat en de volgorde van de pagina's kiezen?

Ja. Pagina's kunnen A4, Letter, Legal, A3, A5 of Tabloid zijn, een formaat dat je zelf intikt, of precies de grootte van elk plaatje. Sleep de tegels om ze te herordenen, sorteer ze op naam of datum, draai er een een kwartslag, en stel een marge in millimeters in.

### Hoeveel afbeeldingen kan ik in één pdf zetten?

In de tool zit geen limiet ingebouwd. Het praktische plafond is het geheugen van je eigen apparaat, omdat het gereedgekomen document daar wordt opgebouwd voordat je het downloadt. Bij een paar honderd telefoonfoto's op volle resolutie merk je dat het eerst. Verklein je in de instellingen de langste zijde, dan schuift dat plafond een heel eind op.

### Staan mijn bestandsnamen of een tijdstempel in de pdf?

Nee, tenzij je erom vraagt. Het informatieblok van het document blijft leeg op de naam van deze tool na. Er komen geen bestandsnamen in, geen apparaatnaam, geen gebruikersnaam, en geen aanmaakdatum tenzij je het vinkje daarvoor aanzet. Dat is met opzet zo, want een pdf is nu eenmaal iets wat mensen naar andere mensen sturen.

### Is het gratis, en heb ik een account nodig?

Het is gratis, en er komt geen account, geen inlog en geen proefperiode aan te pas. De site draait op advertenties, en die betalen hem. Die advertenties krijgen niets over je afbeeldingen mee.

### Werkt het offline?

Ja. Laad de pagina één keer, verbreek daarna je internetverbinding en hij werkt gewoon door. Dat is meteen de eenvoudigste manier om te bewijzen dat er niets geüpload wordt, want een tool die je afbeeldingen wegstuurde om er een document van te laten maken zou ermee ophouden zodra je de stekker eruit trok.

## Hoe je de privacybelofte controleert

- **Je afbeeldingen kunnen nergens heen.** In de Content-Security-Policy staat elk adres dat deze pagina mag benaderen, en geen daarvan hoort bij deze site. Deze tool voegt niets aan die lijst toe, want hij heeft geen eigen netwerkfunctie, ook geen optionele. Er is hier geen eindpunt waar je bestanden verzameld zouden kunnen worden, en in de code staat niets wat ze zou versturen als dat eindpunt er wel was.
- **De pdf wordt hier geschreven.** Een pdf is een lijst objecten plus een tabel van waar elk object begint, en `src/shared/pdf-page-writer.js` schrijft ze allebei. Er wordt geen bibliotheek opgehaald en er wordt niets op een server gerenderd, en het gereedgekomen bestand gaat rechtstreeks vanuit het geheugen naar een download.
- **Het document krijgt niets over jou te horen.** De meeste tools stempelen een pdf met een tijdstempel en de naam van het programma dat hem maakte. Deze schrijft alleen een titel, een auteur en een datum als je die zelf intikt. De bestandsnamen van je plaatjes komen nooit in het document voor, en over je apparaat staat er evenmin iets in.
- **Wat Google laadt, en wat het niet te zien krijgt.** De advertentie- en meetscripts komen van Google. Geen van beide krijgt iets over je afbeeldingen mee: geen bestand, geen miniatuur, geen naam, geen grootte, geen aantal. Elke regel die een plaatje leest, decodeert of schrijft, wordt vanaf deze herkomst geserveerd en staat in de repository.
- **Wat de doneerknop laadt, en wat hij niet te zien krijgt.** De knop “Buy me a coffee” in de kop wordt getekend door een script van cdnjs.buymeacoffee.com en haalt zijn letters bij Google Fonts. Het is een link en verder niets. Hij meldt geen bezoek en krijgt niets over jou of je afbeeldingen mee. Er gebeurt niets tenzij je erop klikt, en waar je dan naartoe klikt is de site van iemand anders.
- **Het werkt offline.** Verbreek de verbinding en alles op deze pagina doet het nog. Eenvoudiger bewijs bestaat er niet, want een tool die je plaatjes wegstuurde om er een document van te laten maken zou ermee ophouden.

**Controleer het zelf.** Je hoeft niets van het bovenstaande op ons woord aan te nemen. Een buildscript maakt deze pagina uit de sjablonen en de configuratie in de repository, en dat script kun je lezen en zelf draaien. Het resultaat staat vastgelegd op de branch `dist`, dus je kunt wat er geserveerd wordt vergelijken met wat een build van de bronnen oplevert: https://github.com/A-Box-of-Tools/website

De bestanden die je als eerste wilt lezen zijn `config/site.toml` voor de Content-Security-Policy, en `src/shared/pdf-page-writer.js` en `src/document.js` voor het hele schrijfwerk aan het bestand, waar het netwerk nooit aan te pas komt.
