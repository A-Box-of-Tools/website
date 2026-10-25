# QR & barcode — een qr-code of barcode maken, offline

Tik het in, en het wordt een code. Er wordt niets verstuurd om er een te maken.

> Maak een qr-code voor een link, een wifinetwerk of een visitekaartje, of een EAN-13-, UPC-A-, Code 128- of Code 39-barcode. Download als svg of png. Het gebeurt allemaal in je browser.

Deze pagina is een interactief hulpmiddel dat volledig in je browser draait, op https://abox.tools/nl/qr-code-maken/ — niets van wat je het geeft wordt geüpload. Hieronder staat alles wat de pagina er in woorden over zegt; om het te gebruiken, open je het adres.

## Je codes en de tekst erin worden **nooit geüpload**. Er is geen server.

Een qr-code is niet meer dan rekenwerk op een tekenreeks, dus er valt geen bestand te versturen en er is geen dienst om iets aan te vragen. Elke stap gebeurt in zo'n duizend regels JavaScript in deze pagina die je gewoon kunt lezen: de modus kiezen, de versie bepalen, de Reed-Solomon-foutcorrectie, het masker, de strepen van een barcode en het controlecijfer eronder. Deze tool heeft geen enkele netwerkfunctie, en dat telt hier zwaarder dan op de meeste pagina's, want wat er gecodeerd wordt is vaak een wifiwachtwoord.

- ✗ Geen upload
- ✗ Geen account
- ✗ Verloopt niet
- ✓ Werkt offline
- ✓ Open source

## Zo maak je een qr-code zonder iets te uploaden

1. **Kies het soort code.** Een qr-code kan van alles bevatten en is waar een telefooncamera naar zoekt, dus dat is het antwoord tenzij iemand je iets anders verteld heeft. Een barcode bevat een nummer, en welke je nodig hebt bepaalt degene die hem gaat scannen. Een winkel wil een EAN-13 of een UPC-A, een verzenddoos een ITF-14, en alles wat intern blijft is meestal Code 128.
2. **Zeg wat erin gaat.** Een link is het gewone geval, en met de vakjes erboven bouw je de andere formaten die telefoons kennen: een wifinetwerk dat aanbiedt zichzelf te verbinden, een visitekaartje dat aanbiedt bewaard te worden, een e-mail, een sms, een telefoonnummer of een plek op de kaart. Wat je ook kiest, de uiteindelijke tekenreeks staat op de pagina, en meer dan dat bevat een qr-code nooit.
3. **Kies hoeveel schade hij mag oplopen.** De vier niveaus stoppen er meer of minder foutcorrectie in, en meer correctie levert een grotere, dichtere code op. L is genoeg voor een scherm, M voor gewoon papier, en H voor iets dat betast, klein gedrukt of in de zon voor een raam geplakt wordt. Een code op een menukaart die elke dag afgenomen wordt is Q of H waard.
4. **Zet de grootte, de marge en de kleuren.** De marge hoort bij de code. De specificatie vraagt om vier modules stille ruimte eromheen, en die wegknippen is veruit de meest voorkomende reden dat een gedrukte code niet scant. Hou donker op licht aan, met echt contrast, want een scanner leest het verschil tussen die twee. Lichtgrijs op wit gaat dus niet werken, en licht op donker mislukt bij een flink aantal lezers ronduit.
5. **Controleer hem met de telefoon die je hebt.** Scan hem van je scherm voordat je er duizend afdrukt. Dat kost tien seconden en het vangt precies de fouten die een voorvertoning niet kan vangen: een wifiwachtwoord met een teken dat ontsnapt moest worden, een link die zijn `https://` miste, of een barcodenummer dat een cijfer tekortkomt.
6. **Neem de svg.** Dat is de code als instructies in plaats van als pixels, dus hij drukt op elk formaat af zonder zacht te worden. En juist een zachte rand is wat een scanner niet kan onderscheiden. Accepteert datgene waar je in plakt geen svg, neem dan de png erbij. Die wordt getekend op een heel aantal pixels per module, dus ook die heeft geen vervaagde randen.

## De uitgebreide versie

[Hoe je een qr-code maakt die ook op andermans telefoon scant](https://abox.tools/nl/gidsen/zelf-een-qr-code-maken/): Welk foutcorrectieniveau je kiest, waarom de witte marge om een qr-code heen bij de code hoort, hoe groot je hem afdrukt, en wat de 'dynamische' code van een gratis generator je later kost.

## Ook in de gereedschapskist

- [Qr- & barcodescanner](https://abox.tools/nl/qr-code-scannen/): Richt je camera erop, of sleep er een foto van hierheen. Het wordt hier gelezen, en nergens anders.
- [Hash en checksum](https://abox.tools/nl/checksum-controleren/): Controleer een download tegen het getal dat de maker erbij zette, zonder hem naar iemand te sturen.
- [Wachtwoord- & wachtwoordzingenerator](https://abox.tools/nl/wachtwoord-generator/): Hier gemaakt, door je eigen browser, en nergens naartoe gestuurd. Er wordt niets opgeslagen en er is geen geschiedenis.
- [JSON-formatter](https://abox.tools/nl/json-formatteren/): JSON, XML, HTML, CSS en YAML, geformatteerd of omgezet. Er wordt niets in andermans server geplakt.

## Vragen

### Wordt er iets van wat ik typ ergens heen gestuurd?

Nee. Een qr-code is rekenwerk op een tekenreeks, en dat rekenwerk draait in je eigen browser op je eigen apparaat. Deze tool heeft geen enkele netwerkfunctie en haalt dus nooit iets op en verstuurt nooit iets. In de `Content-Security-Policy` van de pagina staat bovendien elk adres dat hij mag benaderen, en geen daarvan hoort bij deze site. Dat weegt hier zwaarder dan op de meeste pagina's, want wat mensen het vaakst in een qr-code zetten is het wachtwoord van hun wifi.

### Verlopen deze codes, of stoppen ze later met werken?

Nee, en dat kan ook niet. Wat je typt is wat de code bevat, dus scan je hem, dan krijg je precies die tekenreeks terug, voor altijd. De codes die wel verlopen zijn die met het adres van iemand anders erin. Een “dynamische” qr-code bevat namelijk een link naar de server van de generator, die naar de jouwe doorstuurt. Daardoor kunnen zij elke scan tellen, veranderen waar hij heen gaat, of hem uitzetten zodra een proefperiode eindigt. Hier wordt nergens doorheen doorgestuurd.

### Is het gratis, en mag ik het commercieel gebruiken?

Het is gratis, er komt geen account, geen watermerk en geen limiet op hoeveel je er maakt aan te pas, en je mag het resultaat op een product, een poster of een winkelpui zetten. QR Code is een geregistreerd handelsmerk van Denso Wave, dat verklaard heeft het niet te zullen inzetten tegen mensen die de codes gebruiken. De specificatie is gepubliceerd als ISO/IEC 18004 en is vrij te implementeren, en precies dat doet deze pagina. De site draait op advertenties, en die betalen hem.

### Welk foutcorrectieniveau moet ik kiezen?

M, tenzij je een reden hebt om iets anders te nemen. L maakt de kleinste code en is prima op een scherm, M overleeft gewoon gebruik, en Q en H zijn voor een code die klein gedrukt, gelamineerd, op een raam geplakt of deels door een logo bedekt wordt. Elke stap omhoog stopt er meer controlegegevens in, en dat vraagt bij dezelfde hoeveelheid tekst om een groter symbool. Van L naar H gaan verdubbelt ruwweg het aantal modules voor dezelfde tekenreeks.

### Hoeveel kan er in een qr-code?

Op het grootste formaat, 177 modules in het vierkant, gaan er tot 7.089 cijfers in, 4.296 hoofdletters en cijfers, of 2.953 bytes van al het andere. Dat is dan bij de zwakste foutcorrectie; bij de sterkste blijft er ongeveer een derde daarvan over. In de praktijk is de grens niet het formaat maar de scanner. Voorbij een paar honderd tekens worden de modules zo klein dat een gewone telefooncamera ze op armlengte niet meer uit elkaar houdt. Een lange code is meestal een teken dat er een korte link in hoort.

### Waarom is mijn code groter als ik de link in kleine letters schrijf?

Omdat een qr-code een modus heeft voor hoofdletters en cijfers die twee tekens in elf bits propt, en zo'n modus niet heeft voor kleine letters, die elk acht bits kosten. Een url geschreven als `HTTPS://EXAMPLE.COM/PAGE` kan een derde kleiner uitvallen dan dezelfde url in kleine letters. Het schema en de host zijn hoofdletterongevoelig, dus daar verandert schreeuwen niets aan behalve de grootte. Het pad achter de host is dat niet, dus laat dat met rust.

### Kan hij een qr-code ook lezen, en niet alleen maken?

Deze pagina niet, maar die ernaast wel: [de lezer](https://abox.tools/nl/qr-code-scannen/) neemt een foto, een schermafbeelding of je camera en geeft de tekst terug. Het is een aanzienlijk grotere klus dan er een tekenen — het symbool in een afbeelding vinden, corrigeren voor de hoek waaronder hij genomen is en de schade repareren zijn drie problemen die deze pagina niet heeft — en daarom is het eigen gereedschap en geen knop hier. Het werkt op dezelfde voorwaarden als al het andere: niets geüpload, en geen camerabeeld bewaard.

### Waar is de marge voor, en kan ik hem kleiner maken?

De witruimte om een qr-code heen hoort bij de code. Een lezer vindt daaraan waar het symbool ophoudt, en de specificatie vraagt om vier modules aan elke kant, terwijl een barcode er zo'n tien wil. Je kunt hem hier op nul zetten en het plaatje ziet er dan netter uit, maar een flink aantal scanners ziet hem dan helemaal niet meer, zeker tegen een drukke achtergrond. Kom je ruimte tekort, maak de code dan kleiner in plaats van zijn marge weg te knippen.

### Welke barcode heb ik nodig?

Die waar degene die hem scant om vraagt. EAN-13 is de winkelbarcode buiten Noord-Amerika en UPC-A de Noord-Amerikaanse, en voor allebei heb je een nummer nodig dat GS1 aan jou uitgeeft, omdat het nummer je bedrijf identificeert en niet alleen het product. EAN-8 is de korte versie voor kleine verpakkingen en ITF-14 gaat op de verzenddoos. Code 128 en Code 39 bevatten naast cijfers ook tekst en hebben helemaal geen registratie nodig, waardoor ze het juiste antwoord zijn voor alles wat intern blijft: bedrijfsmiddelen, schappen en werkbonnen.

### Wat is een controlecijfer, en waarom zette de tool er een bij?

Het is het laatste cijfer van een winkelbarcode, uitgerekend uit de cijfers ervoor, zodat een scanner een verkeerde lezing van een goede kan onderscheiden. EAN-13 wil twaalf cijfers en rekent het dertiende uit, UPC-A wil er elf en rekent het twaalfde uit. Tik je het korte nummer, dan zet deze pagina het erbij. Tik je het volledige nummer, dan controleert hij het cijfer dat je gaf en weigert hij als het niet klopt, in plaats van het stilletjes te corrigeren. Een fout cijfer dat stil hersteld wordt levert namelijk een etiket op dat scant als het product van iemand anders.

### Kan ik een logo midden in een qr-code zetten?

Hier niet, maar het is wel het weten waard waarom het elders werkt. Dat komt door de foutcorrectie. Op niveau H mag ruwweg 30% van de modules vernield zijn en blijft de code toch leesbaar, dus een logo dat wat minder dan dat in het midden bedekt, waar geen zoekpatroon zit, is herstelbare schade. Haal de code op niveau H door je beeldbewerker, hou het logo onder ongeveer een vijfde van de oppervlakte, en vertrouw er niet op maar test het met een echte telefoon.

### Waarom is de svg beter dan de png?

Omdat een code uit randen bestaat en een png maar een vast aantal pixels heeft om ze van te maken. Vergroot er een en elke rand wordt zacht, en juist daar heeft een scanner moeite mee. Een printer op 1200 dpi die een png van 512 pixels krijgt, mag het verschil zelf verzinnen. Een svg bevat de vierkantjes als instructies, dus die drukt scherp af op een visitekaartje en op een billboard. De png hier wordt getekend op een heel aantal pixels per module, en beter dan dat kan een png niet.

### Werkt het offline?

Ja. Laad de pagina één keer, verbreek daarna je internetverbinding en hij werkt gewoon door. Dat is meteen de eenvoudigste manier om te bewijzen dat er niets geüpload wordt, want een tool die je tekst wegstuurde om er een code van te laten tekenen zou ermee ophouden zodra je de stekker eruit trok.

## Hoe je de privacybelofte controleert

- **Wat je typt kan nergens heen.** In de Content-Security-Policy staat elk adres dat deze pagina mag benaderen, en geen daarvan hoort bij deze site. Er is hier geen eindpunt waar een wifiwachtwoord verzameld zou kunnen worden, en in de code staat niets wat het zou versturen als dat eindpunt er wel was.
- **Niets hier haalt iets op.** In `src/` staat nergens een `fetch`, een `XMLHttpRequest` of een `sendBeacon`. De code wordt met rekenwerk uit de tekenreeks opgebouwd en als svg getekend, hier in deze pagina, op jouw eigen apparaat.
- **De code wijst niet naar ons.** Wat je typt is wat de code bevat. Verschillende gratis generatoren geven je een code terug met een link naar hun eigen site erin, die daarna naar de jouwe doorstuurt. Zo tellen zij elke scan mee, en houdt de code op met werken op de dag dat zij het domein niet meer betalen of besluiten dat de gratis laag verlopen is. Hier wordt niets ingekort, doorgestuurd of gevolgd, want de tekenreeks die op de pagina staat is de tekenreeks in het plaatje.
- **De png wordt gemaakt uit de svg die op het scherm staat.** De download is geen tweede rendering die het met de voorvertoning oneens zou kunnen zijn. Dezelfde opmaak gaat naar de browser en wordt op een canvas geschilderd. Daarom kan het ook zonder ergens contact mee te leggen, want er valt geen lettertype op te halen en geen plaatje in te laden.
- **Wat Google laadt, en wat het niet te zien krijgt.** De advertentie- en meetscripts komen van Google, de doneerknop van Buy Me a Coffee. Geen van alle krijgt iets van wat je typt mee. Elke regel die een tekenreeks in een code verandert, wordt vanaf deze herkomst geserveerd en staat in de repository.
- **Het werkt offline.** Verbreek de verbinding en de tool werkt onveranderd door, omdat er nooit een netwerkstap in zat. Eenvoudiger bewijs bestaat er niet.

**Controleer het zelf.** Je hoeft niets van het bovenstaande op ons woord aan te nemen. Een buildscript maakt deze pagina uit de sjablonen en de configuratie in de repository, en dat script kun je lezen en zelf draaien. Het resultaat staat vastgelegd op de branch `dist`, dus je kunt wat er geserveerd wordt vergelijken met wat een build van de bronnen oplevert: https://github.com/A-Box-of-Tools/website

De bestanden die je als eerste wilt lezen zijn `config/site.toml` voor de Content-Security-Policy, `src/qr-encode.js` en `src/qr.js` voor de qr-code zelf, waarbij het ene de modi, de versie en de blokken bevat en het andere de patronen, het masker en de formaatbits, verder `src/gf256.js` voor de foutcorrectie en `src/barcode.js` voor de gestreepte.
