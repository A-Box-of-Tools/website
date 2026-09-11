# Afbeeldingen naar video — een mp4-diavoorstelling maken

Maak van een map vol afbeeldingen een video.

> Maak van jpg-, png- of WebP-afbeeldingen een mp4-diavoorstelling, gratis en volledig in je browser. Er wordt niets geüpload, je hoeft je niet aan te melden, en het werkt offline.

Deze pagina is een interactief hulpmiddel dat volledig in je browser draait, op https://abox.tools/nl/afbeeldingen-naar-video/ — niets van wat je het geeft wordt geüpload. Hieronder staat alles wat de pagina er in woorden over zegt; om het te gebruiken, open je het adres.

## Je afbeeldingen worden **nooit geüpload**. Er is geen server.

Je eigen browser codeert elk frame, en de video wordt op dit apparaat in het geheugen opgebouwd. Bij de encoder komt het netwerk nooit te pas, en al deed hij dat wel, dan stond aan de andere kant van deze pagina nog steeds geen server om een afbeelding naartoe te sturen.

- ✗ Geen upload
- ✗ Geen account
- ✓ Werkt offline
- ✓ Open source
- ✓ Bestanden blijven op je apparaat

## Zo maak je van afbeeldingen een video

1. **Kies je afbeeldingen.** Sleep een map het vak in, of kies de bestanden met de hand. De browser leest ze rechtstreeks van je schijf, en er gaat ondertussen niets ergens heen.
2. **Zet ze op volgorde en bepaal hoe lang elke afbeelding blijft staan.** Sleep om te herordenen. De vasthoudtijd kun je in frames of in seconden opgeven, voor alle afbeeldingen tegelijk of per afbeelding apart.
3. **Kies een resolutie en beeldsnelheid.** Met “Volg de hoogste resolutie” wordt je grootste afbeelding aangehouden. De voorkeuzes dekken 4K, 1080p, 720p, vierkant en staand, en past geen daarvan, dan stel je het formaat zelf in.
4. **Maak de video en download hem.** Het coderen gebeurt op je eigen hardware, dus hoe lang het duurt hangt van je apparaat af en niet van een wachtrij. De gereedgekomen mp4 gaat rechtstreeks naar de downloads van je browser.

## De uitgebreide versie

[Hoe je van een map vol afbeeldingen een video maakt](https://abox.tools/nl/gidsen/van-afbeeldingen-een-video-maken/): Maak een mp4-diavoorstelling van foto's: wat beeldsnelheid en duur werkelijk regelen, wat je doet met plaatjes van de verkeerde vorm, en waarom er geen geluidsspoor in zit.

## Ook in de gereedschapskist

- [Videoknipper](https://abox.tools/nl/video-knippen/): Markeer tijdens het afspelen wat het bewaren waard is. Krijg het terug als één video.
- [Videobijsnijder](https://abox.tools/nl/video-bijsnijden/): Snijd een filmpje terug tot het stuk waar het om gaat.
- [Video-omkeerder](https://abox.tools/nl/video-achteruit-afspelen/): Laatste frame eerst, geluid en al.
- [Timelapsemaker](https://abox.tools/nl/timelapse-maken/): Een uur beeldmateriaal in twintig seconden.

## Vragen

### Worden mijn afbeeldingen ergens heen geüpload?

Nee. Je eigen browser leest, stelt samen en codeert je afbeeldingen, op je eigen hardware. Deze tool heeft geen serverkant, en in de `Content-Security-Policy` van de pagina staat elk adres dat hij mag benaderen, waarvan er geen enkele bij deze site hoort. De enige uitzondering is de optionele functie “toevoegen vanaf een webadres”, die een afbeelding ophaalt die jij er zelf in plakt. Die server ziet dan je IP-adres.

### Welke afbeeldingsformaten kan ik gebruiken?

Elk formaat voor stilstaand beeld dat je browser kan decoderen, in de praktijk dus jpg, png, WebP, gif, AVIF en op Apple-apparaten ook HEIC. Er valt hier geen aparte lijst bij te houden, omdat het decoderen het werk van de browser is en niet van ons.

### Welk videoformaat levert het op?

Mp4 met H.264-video, en dat speelt vrijwel overal af. In een browser zonder WebCodecs valt de tool terug op het opnemen van WebM, oftewel hetzelfde beeld in een container die minder editors accepteren.

### Kan ik dit gebruiken voor een renderreeks uit Blender of After Effects?

Ja, een genummerde renderreeks is precies waar dit voor bedoeld is. Voeg de frames toe die je renderer schreef, laat de vasthoudtijd op één frame per stuk staan en zet de beeldsnelheid gelijk aan die van de render. “Sorteer op naam” telt zoals je zou verwachten, dus `frame_2` landt vóór `frame_10` in plaats van erna. \
\
Eén ding weet je liever voordat je begint. H.264 heeft geen alfakanaal, dus transparantie wordt op de achtergrondkleur platgeslagen in plaats van doorgegeven. Moet het alfa blijven, stel de frames dan in je editor samen.

### Kan ik een timelapse van foto's maken?

Ja, en dat is dezelfde klus als een renderreeks. Hou elke foto één frame vast en kies een beeldsnelheid. Op 30 fps wordt elke dertig foto's één seconde video, en op 12 fps lopen diezelfde foto's tweeënhalve seconde. \
\
Met “Sorteer op datum” zet je een camerarol terug in de volgorde waarin hij geschoten is, en dat telt zodra de bestandsnamen weer bij 0001 begonnen zijn. Foto's van verschillende formaten leveren geen probleem op, want “Volg de hoogste resolutie” kiest de videogrootte zo dat er geen enkele verkleind hoeft te worden.

### Zit er een limiet op het aantal afbeeldingen of de lengte van de video?

In de tool zit geen limiet ingebouwd. Het praktische plafond is het geheugen van je eigen apparaat, omdat de gereedgekomen video daar wordt opgebouwd voordat je hem downloadt. Bij heel grote 4K-diavoorstellingen merk je dat het eerst.

### Is het gratis, en heb ik een account nodig?

Het is gratis, en er komt geen account, geen inlog en geen proefperiode aan te pas. De site draait op advertenties, en die betalen hem. Die advertenties krijgen niets over je afbeeldingen mee.

### Werkt het offline?

Ja. Laad de pagina één keer, verbreek daarna je internetverbinding en hij werkt gewoon door. Dat is meteen de eenvoudigste manier om te bewijzen dat er niets geüpload wordt, want een tool die je afbeeldingen wegstuurde om ze te laten verwerken zou ermee ophouden zodra je de stekker eruit trok.

### Kan ik muziek of een soundtrack toevoegen?

Nog niet. Deze tool levert alleen beeld, want de mp4 die hij schrijft heeft één videospoor en geen audiospoor. Heb je toch een soundtrack nodig, zet die er dan achteraf in een video-editor bij.

## Hoe je de privacybelofte controleert

- **Je afbeeldingen kunnen nergens heen.** In de Content-Security-Policy staat elk adres dat deze pagina mag benaderen, en geen daarvan hoort bij deze site. Er is hier geen eindpunt waar je bestanden verzameld zouden kunnen worden, en in de code staat niets wat ze zou versturen als dat eindpunt er wel was. Hier stond ooit `connect-src 'none'`, en dat was absoluut. Advertenties toevoegen heeft dat gekost, en het hardop zeggen hoort bij de afspraak.
- **Het coderen gebeurt hier.** WebCodecs draait in je eigen browser, en het gereedgekomen bestand gaat rechtstreeks naar een download. Deze app heeft geen serverkant.
- **Wat Google laadt, en wat het niet te zien krijgt.** De advertentie- en meetscripts komen van Google. Geen van beide krijgt iets over je afbeeldingen mee: geen bestand, geen miniatuur, geen naam, geen grootte, geen aantal. Elke regel die een afbeelding leest, decodeert, samenstelt of codeert, wordt vanaf deze herkomst geserveerd en staat in de repository.
- **Wat de doneerknop laadt, en wat hij niet te zien krijgt.** De knop “Buy me a coffee” in de kop wordt getekend door een script van cdnjs.buymeacoffee.com en haalt zijn letters bij Google Fonts. Het is een link en verder niets. Hij meldt geen bezoek en krijgt niets over jou of je afbeeldingen mee. Er gebeurt niets tenzij je erop klikt, en waar je dan naartoe klikt is de site van iemand anders.
- **Eén bewuste uitzondering.** Gebruik je “Toevoegen vanaf een webadres”, dan wordt die server benaderd om de afbeelding op te halen en ziet hij je IP-adres. Er wordt alleen opgehaald wat jij er zelf in plakt, en het verkeer gaat maar één kant op, want `img-src` staat open en `connect-src` niet. De teller hieronder noemt elke herkomst van buiten die benaderd is.
- **Het werkt offline.** Verbreek de verbinding en alles doet het nog, op het laden vanaf een webadres na. Eenvoudiger bewijs bestaat er niet.

**Controleer het zelf.** Je hoeft niets van het bovenstaande op ons woord aan te nemen. Een buildscript maakt deze pagina uit de sjablonen en de configuratie in de repository, en dat script kun je lezen en zelf draaien. Het resultaat staat vastgelegd op de branch `dist`, dus je kunt wat er geserveerd wordt vergelijken met wat een build van de bronnen oplevert: https://github.com/A-Box-of-Tools/website

De bestanden die je als eerste wilt lezen zijn `config/site.toml` voor de Content-Security-Policy, en `src/encoder.js` voor de codeerlus, waar het netwerk nooit aan te pas komt.
