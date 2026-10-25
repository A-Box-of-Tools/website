# Afbeelding naar ICO — favicon-, Windows- en macOS-icoonmaker

Eén plaatje erin. Elk formaat dat een browser, Windows of een Mac vraagt eruit.

> Zet een PNG, JPEG of SVG om in een echte .ico met meerdere formaten, of in een macOS-.icns, in je browser. Favicon, Windows-app-icoon, Mac-app-icoon, plus de Apple- en Android-bestanden die een site nodig heeft. Er wordt niets geüpload.

Deze pagina is een interactief hulpmiddel dat volledig in je browser draait, op https://abox.tools/nl/favicon-maken/ — niets van wat je het geeft wordt geüpload. Hieronder staat alles wat de pagina er in woorden over zegt; om het te gebruiken, open je het adres.

## Je afbeeldingen worden **nooit geüpload**. Er is geen server.

Het schalen en de icoonbestanden zelf komen allebei in je eigen browser tot stand. Het plaatje wordt getekend door het canvas dat je browser toch al meelevert, en elke container, of dat nu de Windows-`.ico` is of de macOS-`.icns`, wordt uit die pixels opgebouwd door een paar honderd regels in `src/ico.js` en `src/icns.js` die je gewoon kunt lezen. Deze tool heeft geen enkele netwerkfunctie, dus er valt niets op te halen en niets te versturen. En al was die er wel, dan stond aan de andere kant van deze pagina nog steeds geen server om een logo naartoe te sturen.

- ✗ Geen upload
- ✗ Geen account
- ✗ Geen watermerk
- ✓ Werkt offline
- ✓ Open source

## Zo maak je een .ico-bestand zonder iets te uploaden

1. **Kies het plaatje.** Sleep een PNG, JPEG, WebP of SVG het vak in, of kies er meerdere en zet ze in één keer om. Vierkant werkt het makkelijkst, en alles vanaf 256 pixels heeft genoeg detail voor elk formaat. De browser leest het rechtstreeks van je schijf, en er gaat ondertussen niets ergens heen.
2. **Kies de bestanden die je nodig hebt.** Windows en een browser lezen `.ico`, terwijl een Mac `.icns` leest en naar het andere niet omkijkt. Vink er een aan, of allebei als wat je maakt op allebei uitkomt. Een website wil ook nog de extra Apple-, Android- en tegelplaatjes, en daar is het derde vakje voor.
3. **Zeg waar het icoon voor is.** Een website-favicon is 16, 32 en 48 pixels. Een Windows-programma wil 256 er ook bij, en een programma dat op een hi-dpi-laptop goed moet staan wil de tussenformaten die Windows op 125% en 150% schaling vraagt. Kies de voorkeuze die bij de klus past, of vink de formaten zelf aan. Bij elk formaat op de lijst staat wat erom vraagt. Bij de `.icns` heb je die keuze niet, want Apple noemt precies tien plekken en alle tien gaan erin.
4. **Regel de vorm en de achtergrond.** Een icoon is vierkant en de meeste logo's zijn dat niet. Vul je het op, dan blijft het hele plaatje staan met ruimte erboven en eronder. Snijd je bij, dan wordt het midden genomen. Rek je uit, dan wordt het platgedrukt. Transparantie blijft transparantie, tenzij je er een kleur achter kiest.
5. **Kijk naar die van 16 pixels vóór je downloadt.** Op dat formaat wordt het icoon het vaakst gezien, en daar verdwijnen dunne lijnen en kleine letters. Elk vierkantje in de voorvertoning wordt op zijn echte formaat uit je eigen bestand getekend. Is de kleinste een vlek, dan helpt geen enkele instelling en moet de tekening eenvoudiger.
6. **Neem de bestanden mee.** Eén .ico met elk formaat erin, en die heet `favicon.ico` als je daarom vroeg, want daar kijken browsers naar. Vinkte je de .icns aan, dan komt die ernaast te staan, klaar om in een Mac-applicatiebundel te gaan. Vink je ook de websiteset aan, dan krijg je er de Apple-, Android- en Windows-tegelplaatjes bij, plus het manifest en het blok HTML om in je pagina te plakken. Alles wat meer is dan één bestand komt binnen als één zip.

## De uitgebreide versie

[Hoe je een favicon maakt die op zestien pixels nog leesbaar is](https://abox.tools/nl/gidsen/zelf-een-favicon-maken/): Welke formaten een favicon.ico werkelijk nodig heeft, welke extra bestanden iPhones, Android en een Mac vragen, en waarom een logo dat op een poster werkt bij zestien pixels verdwijnt.

## Ook in de gereedschapskist

- [Afbeelding naar data-URI](https://abox.tools/nl/afbeelding-naar-base64/): Het hele plaatje als één regel tekst. Plak hem zo in je CSS of HTML.
- [SVG naar afbeelding](https://abox.tools/nl/svg-naar-png/): Noem het formaat. Een vector heeft er zelf geen om te verliezen.
- [Afbeelding naar SVG](https://abox.tools/nl/afbeelding-naar-svg/): Eén vorm, één omtrek. Wijs aan wat er niet in hoort.
- [Lengtevergelijker](https://abox.tools/nl/lengtes-vergelijken/): Typ de lengtes, neem de afbeelding mee. Er wordt niets verstuurd om hem te tekenen.

## Vragen

### Wordt mijn afbeelding ergens heen geüpload?

Nee. Je eigen browser decodeert en schaalt het plaatje op je eigen hardware, en de .ico wordt uit die pixels opgebouwd door code die vanaf deze pagina geserveerd wordt. Deze tool heeft geen enkele netwerkfunctie en haalt dus nooit iets op en verstuurt nooit iets. In de `Content-Security-Policy` van de pagina staat bovendien elk adres dat hij mag benaderen, en geen daarvan hoort bij deze site.

### Welke formaten horen er in een favicon.ico?

16, 32 en 48, en dat is geen kwestie van voorkeur. Op 16 tekent een browser het icoon in een tabblad, 32 gebruikt Windows voor een bureaubladsnelkoppeling en gebruiken verschillende browsers voor een bladwijzer, en op 48 leest Google een site-icoon. Alles wat groter is hoort in een PNG naast de .ico in plaats van erin, en precies dat levert de websiteset hier op.

### Welke formaten heeft een Windows-app-icoon nodig?

16, 32, 48 en 256, precies wat de standaard-app.ico van Visual Studio zelf ook bevat. Op 16 zit de titelbalk en de kleine Verkennerweergave, op 32 het bureaublad en de taakbalk, op 48 de middelgrote pictogrammen van Verkenner, en op 256 het startmenu en de extra grote weergave. Op een hi-dpi-scherm vraagt Windows ook om 20, 24, 40, 64 en 96, en ontbreken die, dan herbemonstert het ze vanaf het dichtstbijzijnde formaat dat het wel heeft. Met de voorkeuze “elke schaal” zet je ze er gewoon in.

### Waarom is het bestand groter dan het plaatje waarmee ik begon?

Omdat een .ico niet één plaatje is maar meerdere, en de kleine daarvan ongecomprimeerd worden opgeslagen zodat alles ze kan lezen. Een item van ⁦32×32⁩ is precies 4.264 bytes, wat er ook in zit, en een ongecomprimeerd item van ⁦256×256⁩ is 264 KB. Daarom worden formaten boven 64 standaard als PNG opgeslagen. Kies je “PNG voor elk formaat”, dan krijg je het kleinste bestand; kies je ongecomprimeerd voor elk formaat, dan krijg je het best leesbare.

### Wat is het verschil tussen de PNG- en de ongecomprimeerde items?

Alleen hoe de pixels binnen de .ico opgeslagen worden. Een ongecomprimeerd item is de oorspronkelijke Windows-indeling, met een bitmapkop, de pixels ondersteboven en een transparantiemasker van één bit, en elke Windows-versie die ooit is uitgekomen kan dat lezen. Een PNG-item is een heel PNG-bestand dat in het icoon is gestopt, op de grote formaten drie tot tien keer zo klein, maar pas begrepen vanaf Windows Vista. Standaard wordt allebei ingezet waar het wint: ongecomprimeerd tot 64 pixels en PNG daarboven.

### Kan hij een icoon groter dan 256 pixels maken?

Nee, en niets kan dat. Het formaat slaat elke zijde in één byte op, en 0 is vergeven omdat het 256 betekent. Daar ligt het plafond, dus een .ico met een plaatje van 512 pixels erin is geen groter icoon maar een kapot icoon. Heb je 512 nodig, dan heb je een PNG nodig, en die zit in de websiteset voor Android en voor het startscherm van een webapp.

### Blijft de transparantie behouden?

Ja, in beide soorten items. Daarnaast wordt het oude masker van één bit naast het alfakanaal geschreven, zodat software die te oud is om het alfa te lezen het icoon toch uitknipt in plaats van een zwart blok te tekenen. Eén bestand wordt met opzet wel ondoorzichtig gemaakt, en dat is het Apple-touch-icoon in de websiteset. iOS zet dat op zijn eigen tegel en maakt transparantie zwart, dus wordt het op je achtergrondkleur platgeslagen, standaard wit.

### Mijn logo is een breed woordmerk. Wat gebeurt daarmee?

Er moet iets gebeuren, want een icoon is vierkant. Opvullen houdt het geheel maar maakt het klein, en een woordmerk dat in een vierkant van 16 pixels wordt gepast is zo'n drie pixels hoog en dus onleesbaar. Bijsnijden naar het midden werkt meestal beter. Haal het symbool uit het geheel en gebruik alleen dat, zoals vrijwel elk merk voor zijn favicon doet. In de voorvertoning zie je welke van de twee het overleeft voordat je iets downloadt.

### Wat zit er in de websiteset, en heb ik het allemaal nodig?

Zeven PNG's, een webapp-manifest, een browserconfig.xml en een blok HTML om te plakken. Je hebt ze nodig omdat een .ico alleen browsers en Windows dekt. Een iPhone-beginscherm leest namelijk een PNG van 180 pixels onder een eigen naam, Android en elke installatievraag lezen het manifest, en een tegel die aan het startmenu is vastgezet leest de XML. Geen van drieën kijkt in een .ico. Alles wordt hier gemaakt, op jouw apparaat, en in de zip zit een briefje waarop staat waar elk bestand voor is.

### Kan hij ook een macOS-icoon maken?

Ja. Vink *macOS-icoon* aan en je krijgt een `.icns` naast de `.ico`, of in plaats daarvan. Het is een andere container voor hetzelfde idee, en geen van beide systemen leest die van de ander: Windows wil .ico en een Mac-applicatiebundel wil .icns. Bij de formaten heb je daar niets te kiezen, want Apple publiceert precies tien plekken, namelijk 16, 32, 64, 128, 256, 512 en 1024 pixels, waarvan er drie twee keer voorkomen als de Retina-versie van het formaat eronder. Alle tien gaan erin, getekend uit zeven renders, en daarom is een .icns het grotere bestand.

### Hoe gebruik ik het .icns-bestand?

Voor een programma gaat het in de bundel in `JouwApp.app/Contents/Resources/`, en noem je het in `Info.plist` onder `CFBundleIconFile`. Elke Mac-inpaktool heeft daar een veld voor. Wil je het ergens anders voor gebruiken, selecteer het bestand dan in de Finder en druk op Command-C. Kies daarna Toon info op de map of schijfkopie die je wilt wijzigen, klik op het kleine icoon linksboven en druk op Command-V.

### Is de .icns hetzelfde als wat iconutil maakt?

Dezelfde tien plekken met dezelfde vierlettertypen, en PNG in elk daarvan, precies wat `iconutil` uit een `.iconset`-map maakt. Er is één bewust verschil. De tool van Apple schrijft ook een `TOC` -element, een index van de types en lengtes die volgen. Dat is een optimalisatie en geen onderdeel van het formaat, want een lezer zonder index loopt de elementen van begin tot eind door en komt op hetzelfde antwoord uit. Een verkeerde index is erger dan geen index, dus hij blijft weg.

### Kan ik meerdere plaatjes tegelijk omzetten?

Ja. Elk plaatje op de lijst wordt zijn eigen .ico met dezelfde instellingen, en de stapel komt binnen als één zip met een map per plaatje. Anders zouden er twee favicon.ico heten en zou de een de ander overschrijven. Elke uitvoer die je aanvinkte wordt voor elk plaatje gemaakt. Klik op een regel om dat plaatje in de voorvertoning te zetten.

### Is het gratis, en heb ik een account nodig?

Het is gratis, en er komt geen account, geen inlog, geen proefperiode en geen watermerk aan te pas. Er zit ook geen limiet op het aantal bestanden of op de grootte ervan, omdat er geen server is die daarvoor betaalt: het werk gebeurt op je eigen apparaat. De site draait op advertenties, en die betalen hem. Die advertenties krijgen niets over je afbeeldingen mee.

### Werkt het offline?

Ja. Laad de pagina één keer, verbreek daarna je internetverbinding en hij werkt gewoon door. Dat is meteen de eenvoudigste manier om te bewijzen dat er niets geüpload wordt, want een tool die je logo wegstuurde om het te laten omzetten zou ermee ophouden zodra je de stekker eruit trok.

## Hoe je de privacybelofte controleert

- **Je logo kan nergens heen.** In de Content-Security-Policy staat elk adres dat deze pagina mag benaderen, en geen daarvan hoort bij deze site. Er is hier geen eindpunt waar je bestanden verzameld zouden kunnen worden, en in de code staat niets wat ze zou versturen als dat eindpunt er wel was.
- **Niets hier haalt iets op.** In `src/` staat nergens een `fetch`, een `XMLHttpRequest` of een `sendBeacon`. Het schalen is één `drawImage` op een canvas, en elk icoon is een kop die `src/ico.js` of `src/icns.js` vóór die pixels schrijft, hier in deze pagina.
- **Het bestand wordt beschreven vanuit zijn eigen bytes.** De lijst formaten die naast een klaar icoon staat, is niet de lijst formaten waar je om vroeg. Die wordt teruggelezen uit het bestand dat zojuist geschreven is, door `readIcoDirectory` of `readIcnsElements`. Was een schrijver het ooit oneens met de instellingen, dan zou de pagina dat dus zeggen, in plaats van dat jij erachter kwam toen Windows niets tekende en macOS een leeg vel papier.
- **Wat Google laadt, en wat het niet te zien krijgt.** De advertentie- en meetscripts komen van Google, de doneerknop van Buy Me a Coffee. Geen van alle krijgt iets over je plaatje mee. Elke regel die een bestand leest, schaalt of schrijft, wordt vanaf deze herkomst geserveerd en staat in de repository.
- **Het werkt offline.** Verbreek de verbinding en de tool werkt onveranderd door, omdat er nooit een netwerkstap in zat. Eenvoudiger bewijs bestaat er niet.

**Controleer het zelf.** Je hoeft niets van het bovenstaande op ons woord aan te nemen. Een buildscript maakt deze pagina uit de sjablonen en de configuratie in de repository, en dat script kun je lezen en zelf draaien. Het resultaat staat vastgelegd op de branch `dist`, dus je kunt wat er geserveerd wordt vergelijken met wat een build van de bronnen oplevert: https://github.com/A-Box-of-Tools/website

De bestanden die je als eerste wilt lezen zijn `config/site.toml` voor de Content-Security-Policy, `src/ico.js` en `src/icns.js` voor de twee icoonformaten, waarbij het ene de directory, de items en het masker bevat en het andere de tien benoemde plekken van Apple, en `src/sizes.js` voor waar elk formaat op de pagina vandaan komt.
