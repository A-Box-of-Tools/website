# SVG naar afbeelding — een vector op elk formaat naar png, jpeg of WebP

Noem het formaat. Een vector heeft er zelf geen om te verliezen.

> Zet een svg om naar png, jpeg of WebP op elk formaat, in je browser. Noem de breedte, een factor of een kader; krijg er @2x- en @3x-kopieën bij. Transparantie blijft, er wordt niets geüpload.

Deze pagina is een interactief hulpmiddel dat volledig in je browser draait, op https://abox.tools/nl/svg-naar-png/ — niets van wat je het geeft wordt geüpload. Hieronder staat alles wat de pagina er in woorden over zegt; om het te gebruiken, open je het adres.

## Je svg-bestanden worden **nooit geüpload**. Er is geen server.

Het tekenwerk wordt gerasterd door dezelfde motor die het zojuist op je scherm zette. Je bestand wordt van je schijf gelezen, zijn worteltag wordt naar het gevraagde formaat herschreven door honderd regels in `src/svg.js` die je kunt lezen, en het wordt op een canvas getekend dat je browser toch al meelevert. Deze tool heeft geen enkele netwerkfunctie, dus er valt niets op te halen en niets te versturen. En al was die er wel, dan stond aan de andere kant van deze pagina nog steeds geen server om een logo naartoe te sturen.

- ✗ Geen upload
- ✗ Geen account
- ✗ Geen watermerk
- ✓ Werkt offline
- ✓ Open source

## Zo zet je een svg om naar een png zonder hem te uploaden

1. **Kies de svg.** Sleep er een het vak in, of kies een map vol en zet ze in één keer om. De browser leest het bestand rechtstreeks van je schijf, en er gaat ondertussen niets ergens heen. Bij elke regel staat welk formaat het bestand denkt te hebben, en dat wordt er anders bij gezegd wanneer dat formaat uit de `viewBox` kwam of aangenomen is omdat het bestand er geen opgeeft.
2. **Zeg hoe groot.** Een factor van het eigen formaat van het bestand is het snelste antwoord, en voor een stapel ook het juiste. Elke tekening wordt dan vanaf zijn eigen beginpunt geschaald, waardoor een set iconen onderling in verhouding blijft. Anders noem je een breedte, een hoogte, de langste zijde, of een kader met beide zijden erbij. Een groot getal kost je hier niets, anders dan bij een foto, want de tekening wordt op dat formaat opnieuw getekend en er niet naartoe uitgerekt.
3. **Voeg de hi-dpi-kopieën toe als je ze nodig hebt.** Een telefoon en een Retina-laptop tekenen twee of drie apparaatpixels per CSS-pixel, dus een logo van 200 pixels heeft een bestand van 400 of 600 pixels achter zich nodig. Vraag om `@2x` en `@3x` en ze komen eruit met de namen die Xcode, het gereedschap van Android en CSS `image-set()` alle drie verwachten, en elk is precies twee of drie keer de eerste in plaats van apart afgerond.
4. **Kies het bestandstype en beslis over transparantie.** Png, tenzij je een reden hebt om iets anders te nemen, want het is verliesloos, het houdt transparantie en vlakke kleur comprimeert er goed in. Jpeg kent helemaal geen transparantie, dus daar wordt hoe dan ook een achtergrondkleur in geschilderd, of je er nu een kiest of niet. Kies je er geen, dan komt elke transparante pixel er zwart uit. WebP doet allebei en maakt een kleiner bestand, alleen leest software die oud genoeg is het niet.
5. **Kijk naar de voorvertoning voordat je downloadt.** Die wordt getekend door dezelfde code die het bestand schrijft, uit jouw bestand, op jouw apparaat. Zodra een tekening pixels wordt veranderen er twee dingen, en allebei zie je ze hier. Een haarlijn die een halve pixel breed was wordt grijs, en tekst wordt getekend in een lettertype dat deze computer heeft in plaats van in een dat van het web gehaald wordt.
6. **Neem de bestanden mee.** Eén download per bestand, of de hele stapel als één zip. De namen volgen de svg waar ze uit kwamen, met `@2x` en `@3x` op de kopieën, en twee bestanden die dezelfde naam gekregen zouden hebben, worden genummerd in plaats van dat de een de ander stilletjes vervangt.

## De uitgebreide versie

[Hoe je een svg naar een png omzet op het juiste formaat](https://abox.tools/nl/gidsen/een-svg-naar-png-omzetten/): Een vector heeft zelf geen pixelformaat, dus het getal kies jij. Waar dat getal vandaan komt voor een scherm, een app-icoon en een printer, en wat er verandert wanneer een tekening pixels wordt.

## Ook in de gereedschapskist

- [Afbeelding naar SVG](https://abox.tools/nl/afbeelding-naar-svg/): Eén vorm, één omtrek. Wijs aan wat er niet in hoort.
- [Lengtevergelijker](https://abox.tools/nl/lengtes-vergelijken/): Typ de lengtes, neem de afbeelding mee. Er wordt niets verstuurd om hem te tekenen.
- [Afbeeldingscompressor](https://abox.tools/nl/afbeelding-comprimeren/): Jij noemt de grootte. De rest rekent de tool uit.
- [Afbeeldingsformaat wijzigen](https://abox.tools/nl/afbeelding-formaat-wijzigen/): Noem het formaat. Sleep het kader. Kies het bestandstype.

## Vragen

### Wordt mijn svg ergens heen geüpload?

Nee. Je eigen browser leest het bestand op je eigen hardware, tekent het op een canvas met dezelfde motor die elk ander plaatje rendert dat je ziet, en geeft het als download terug. Deze tool heeft geen enkele netwerkfunctie en haalt dus nooit iets op en verstuurt nooit iets. In de `Content-Security-Policy` van de pagina staat bovendien elk adres dat hij mag benaderen, en geen daarvan hoort bij deze site.

### Op welk formaat moet ik een svg rasteren?

Op wat het ding dat hem leest vraagt, vermenigvuldigd met de pixelverhouding van het scherm waarop hij gezien wordt. Een logo dat 200 CSS-pixels beslaat, heeft er 400 nodig voor een Retina-laptop en 600 voor een recente telefoon, en dat zijn hier de `@2x`- en `@3x`-kopieën. Voor een app-icoon of een winkelvermelding noemt de winkel een exact getal, en dat is het getal. Heeft niets je iets verteld, dan is 1024 op de langste zijde een bruikbare standaard: groot genoeg voor vrijwel elk gebruik en klein genoeg om te mailen.

### Kost het groter maken kwaliteit?

Nee, en dit is de ene plek waar dat antwoord eerlijk nee is. Een vector is instructies in plaats van pixels, dus de browser tekent de krommen opnieuw op welk formaat er ook gevraagd wordt. 4000 pixels uit een icoon van 24 pixels is precies zo scherp als die 24 was. Wat je niet kunt, is de andere kant op: zodra het een png is, is het pixels als al het andere, dus raster op het formaat dat je nodig hebt in plaats van het resultaat later te schalen.

### Mijn svg heeft geen breedte of hoogte. Welk formaat krijg ik?

De `viewBox`, als die er is. De breedte en hoogte daarvan zijn gebruikerseenheden en geen pixels, maar het zijn de enige getallen in het bestand en een browser behandelt ze als het natuurlijke formaat van de tekening. Is er ook geen viewBox, dan zet de pagina *aangenomen* naast de regel en gebruikt ze ⁦300 × 150⁩, en dat is waarop een `<img>` hem getekend zou hebben. Hoe dan ook kun je zelf het gewenste formaat noemen en wordt het bestand op dat formaat getekend.

### Waarom ziet de tekst er in de png anders uit?

Omdat het lettertype niet in de svg zit. Een svg die tekst tekent noemt een lettertype en laat het aan de machine over om het te vinden, en een bestand dat er een met een `@import` van Google Fonts haalt, krijgt hier niets, want een svg die via een `<img>` getekend wordt mag niets ophalen. Dat is dezelfde regel die hem belet met jouw bestand naar huis te bellen. De oplossing kent elke ontwerper al: zet de tekst in het tekenprogramma om naar paden voordat je exporteert. Dan is het meetkunde, en dan ziet het er overal hetzelfde uit.

### Kan hij meerdere bestanden tegelijk omzetten?

Ja. Elke svg op de lijst wordt met dezelfde instellingen gerenderd en de stapel komt binnen als één zip. Voor een stapel is een factor meestal de juiste instelling, dus zoiets als “4× het formaat dat het bestand vraagt”. Elke tekening wordt dan vanaf zijn eigen formaat geschaald in plaats van dat ze allemaal naar hetzelfde aantal pixels gedwongen worden. Klik op een regel om die in de voorvertoning te zetten.

### Zit er een groottelimiet op?

Die van de browser, niet die van ons. Een canvas geeft het ergens voorbij 16.384 pixels op een zijde op, en Safari op een iPhone of iPad stopt al bij zo'n 16,7 megapixel oppervlak, oftewel ⁦4096 × 4096⁩. Daarboven waarschuwt de pagina je in plaats van je een leeg plaatje te geven, want dat is wat een browser doet zodra hij op is. `toBlob` geeft dan helemaal niets terug, zonder foutmelding die zichzelf uitlegt. Voorbij 100 megapixel weigert de tool, omdat dat 400 MB canvas is nog voordat er één byte gecodeerd is.

### Wat gebeurt er met transparantie?

Die blijft, in png en in WebP. Jpeg heeft helemaal geen alfakanaal, dus daar wordt hoe dan ook een kleur achter het hele plaatje geschilderd, of je er nu om vraagt of niet. Zonder die kleur zou alles wat transparant is er zwart uit komen, en dat ziet eruit als een fout in plaats van als jpeg. Ook bij png is een achtergrondkleur kiezen een volstrekt normale wens, want dan wordt de tekening op die kleur platgeslagen in plaats van dat er een gat blijft.

### Kan hij een svg lezen met een script of een externe afbeelding erin?

Lezen kan hij, en hij tekent precies de delen die een browser bereid is te tekenen. Een svg die via een `<img>` geladen wordt zit in *secure static mode*. Scripts draaien dan niet, externe verwijzingen worden niet opgehaald en animatie speelt niet, dus je krijgt het eerste frame. Een bestand met een externe `<image>` erin komt er dus uit met dat deel eruit. Dat is de browser die namens jou weigert, en juist daarom kan deze pagina veilig een bestand openen dat ze nooit eerder gezien heeft.

### Wat is het verschil tussen dit en Afbeeldingsformaat wijzigen?

De bron. [Afbeeldingsformaat wijzigen](https://abox.tools/nl/afbeelding-formaat-wijzigen/) begint bij pixels, bij een jpeg of een png, dus daar moet groter maken detail verzinnen dat er nooit geweest is. Dit begint bij een tekening, dus valt er niets te verzinnen en is er geen bovengrens om je druk over te maken. Heb je een svg, dan levert deze je een scherp resultaat. Heb je een foto, dan zit je bij die andere goed.

### Is het gratis, en heb ik een account nodig?

Het is gratis, en er komt geen account, geen inlog, geen proefperiode en geen watermerk aan te pas. Er zit ook geen limiet op het aantal bestanden of op de grootte ervan, omdat er geen server is die daarvoor betaalt: het werk gebeurt op je eigen apparaat. De site draait op advertenties, en die betalen hem. Die advertenties krijgen niets over je bestanden mee.

### Werkt het offline?

Ja. Laad de pagina één keer, verbreek daarna je internetverbinding en hij werkt gewoon door. Dat is meteen de eenvoudigste manier om te bewijzen dat er niets geüpload wordt, want een tool die je tekenwerk wegstuurde om het te laten renderen zou ermee ophouden zodra je de stekker eruit trok.

## Hoe je de privacybelofte controleert

- **Je tekenwerk kan nergens heen.** In de Content-Security-Policy staat elk adres dat deze pagina mag benaderen, en geen daarvan hoort bij deze site. Er is hier geen eindpunt waar je bestanden verzameld zouden kunnen worden, en in de code staat niets wat ze zou versturen als dat eindpunt er wel was.
- **Niets hier haalt iets op.** In `src/` staat nergens een `fetch`, een `XMLHttpRequest` of een `sendBeacon`. De hele rasteraar bestaat uit een `<img>` met een blob van je eigen bestand erin, één `drawImage` op een canvas, en één `canvas.toBlob`.
- **Een svg is een document, en dit is de modus waarin het niets kan doen.** Een svg kan een `<script>`, een externe `<image href="https://…">`, een stylesheet en een weblettertype meedragen. Getekend via een `<img>` zit hij in wat de specificatie *secure static mode* noemt, en dan draait het script niet en wordt geen van die adressen opgehaald. Dat is een garantie van de browser en geen belofte van ons, en juist daarom kan deze pagina een bestand openen dat ze nooit eerder gezien heeft zonder dat dat bestand naar huis kan bellen.
- **Wat Google laadt, en wat het niet te zien krijgt.** De advertentie- en meetscripts komen van Google, de doneerknop van Buy Me a Coffee. Geen van alle krijgt iets over je tekening mee. Elke regel die een bestand leest, op formaat zet of tekent, wordt vanaf deze herkomst geserveerd en staat in de repository.
- **Het werkt offline.** Verbreek de verbinding en de tool werkt onveranderd door, omdat er nooit een netwerkstap in zat. Eenvoudiger bewijs bestaat er niet.

**Controleer het zelf.** Je hoeft niets van het bovenstaande op ons woord aan te nemen. Een buildscript maakt deze pagina uit de sjablonen en de configuratie in de repository, en dat script kun je lezen en zelf draaien. Het resultaat staat vastgelegd op de branch `dist`, dus je kunt wat er geserveerd wordt vergelijken met wat een build van de bronnen oplevert: https://github.com/A-Box-of-Tools/website

De bestanden die je als eerste wilt lezen zijn `config/site.toml` voor de Content-Security-Policy, `src/svg.js` voor hoe het eigen formaat van een bestand gelezen wordt en hoe zijn worteltag herschreven wordt, en `src/render.js` voor de acht regels die het rasteren doen: een <img>, een `drawImage` en een `toBlob`, met niets ertussen.
