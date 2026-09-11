# Audio knippen — opnames online inkorten

Markeer tijdens het afspelen wat het waard is. Je krijgt het terug als één bestand, geknipt waar jij het zei.

> Speel een opname af en markeer onderweg elk stuk dat het waard is, en sla die stukken daarna op als één bestand. Knippen tot op de sample, geen klik bij de overgangen, niets geüpload.

Deze pagina is een interactief hulpmiddel dat volledig in je browser draait, op https://abox.tools/nl/audio-knippen/ — niets van wat je het geeft wordt geüpload. Hieronder staat alles wat de pagina er in woorden over zegt; om het te gebruiken, open je het adres.

## Je opnames worden **nooit geüpload**. Er is geen server.

Je opname wordt gelezen, gemarkeerd, geknipt en weggeschreven door je eigen browser, op je eigen hardware. Niets hier kan iets ophalen of versturen, want er zit helemaal geen netwerkfunctie in deze tool. En al was die er wel, dan zit er aan de andere kant van deze pagina nog steeds geen server waar een opname naartoe kan.

- ✗ Geen upload
- ✗ Geen account
- ✗ Geen watermerk
- ✓ Zo veel stukken als je wilt
- ✓ Knipt precies waar je markeerde
- ✓ Werkt offline

## Zo kort je een audiobestand in

1. **Kies een opname.** Sleep een MP3-, WAV-, FLAC-, M4A-, Ogg- of Opus-bestand op de kiezer, of een video als je een stuk van het geluid daarvan wilt. De browser leest hem rechtstreeks van je schijf en tekent hem als golfvorm; er gaat ondertussen niets ergens heen.
2. **Speel hem af en markeer de stukken die je wilt.** Druk op `I` waar een stuk moet beginnen en op `O` waar het moet ophouden. Doe dat zo vaak je wilt: elk paar wordt een rij in de tabel eronder en een band op de golfvorm. `U` neemt de laatste terug, `Spatie` speelt af en pauzeert, de pijltjestoetsen springen vijf seconden, en met `Shift` erbij verschuiven ze tien milliseconden. Zet het afspelen langzamer als het moment lastig te pakken is.
3. **Werk de markeringen bij.** Elke rij kun je apart afspelen, opnieuw instellen door er een exacte tijd in te typen, in de volgorde omhoog of omlaag schuiven, of verwijderen. De twee uiteinden van het geselecteerde stuk kun je ook langs de golfvorm slepen, en dat is de snelste manier om een markering op de stilte te zetten in plaats van op de ademhaling ervoor. Het totaal bovenaan is wat de klaargemaakte opname gaat duren.
4. **Houden, of eruit knippen.** Houden is de gewone kant op: de klaargemaakte opname is de gemarkeerde stukken, op volgorde aan elkaar geplakt. Ze eruit knippen is de andere klus die mensen willen en zelden vinden: markeer de ehms, de rinkelende telefoon of de valse starts, en wat overblijft wordt zonder die stukken aan elkaar gezet.
5. **Knip het, en download.** Elk knip landt op de sample die je markeerde; er wordt hier niets afgerond naar een keyframe, want geluid heeft die niet. Het enige wat je hoeft te kiezen is hoeveel fade er op elke overgang komt: vijf milliseconden is genoeg om een klik tegen te houden en veel te kort om als fade te horen. Wat eruit komt is een WAV, die eerst op de pagina wordt afgespeeld en daarna rechtstreeks naar de downloads van je browser gaat.

## De uitgebreide versie

[Audio knippen zonder kwaliteitsverlies](https://abox.tools/nl/gidsen/een-audiobestand-inkorten/): Waar een audioknip werkelijk valt, waarom die exact kan zijn terwijl een videoknip dat niet kan, waarom een naad soms klikt, en wat een fade van vijf milliseconden echt doet.

## Ook in de gereedschapskist

- [Audiobewerker](https://abox.tools/nl/audio-bewerken/): Achterstevoren afspelen, de snelheid wijzigen, een zachte opname optillen. Alles hier, op je eigen apparaat.
- [Pdf samenvoegen & splitsen](https://abox.tools/nl/pdf-samenvoegen/): Pagina's verschuiven zonder ritje naar een server.
- [Pdf-compressor](https://abox.tools/nl/pdf-verkleinen/): Een document laten krimpen zonder het ergens heen te sturen.
- [PDF onleesbaar maken](https://abox.tools/nl/pdf-onleesbaar-maken/): De letters worden uit het bestand gewist, en daarna wordt het bestand doorzocht om het te bewijzen.

## Vragen

### Wordt mijn audio ergens naartoe geüpload?

Nee. Hij wordt gelezen, gemarkeerd, geknipt en weggeschreven door je eigen browser op je eigen hardware. Deze tool heeft geen serverkant, en de `Content-Security-Policy` van de pagina noemt elk adres dat ze mag benaderen: geen daarvan is van ons. Wil je het liever controleren dan aannemen, trek dan de stekker uit je internet en knip alsnog een opname.

### Kan ik meerdere stukken van dezelfde opname houden?

Daar is dit voor. Druk zo vaak als je wilt op `I` en `O` terwijl hij speelt; elk paar wordt een rij, en het klaargemaakte bestand is elke rij op volgorde aan elkaar, met al het andere weg. De meeste online-knippers geven je één paar hendels en vragen welk enkel stuk je wilt houden. Dat is prima om een tune voor- en achteraan bij te knippen, en volstrekt nutteloos als je een uur interview één keer wilt beluisteren en de zes goede antwoorden wilt overhouden.

### Landt het knip precies waar ik het markeerde?

Ja, bij elk stuk en in elke speler. Dit is de ene plek waar audio eenvoudiger is dan video: een gedecodeerde opname is een reeks getallen en elk getal staat op zichzelf, dus er is geen equivalent van een keyframe om naar terug te ronden en geen reden waarom een knip te vroeg zou beginnen. De pagina laat het samplenummer zien waarop het resultaat begint, en dat is jouw markering maal de samplefrequentie, afgerond op de dichtstbijzijnde hele sample.

### Waarom zou een overgang klikken, en waar is die fade voor?

Omdat knippen van het midden van het ene woord naar het midden van het andere twee golfvormen naast elkaar zet die niets met elkaar te maken hebben, en een luidspreker die daartussen moet springen maakt een klik. Het is geen fout in het knip: zo klinkt een discontinuïteit. De oplossing is een fade van een paar milliseconden aan weerskanten van elke overgang: lang genoeg om de conus te laten volgen, veel te kort om als fade te horen. Vijf milliseconden is de standaard en kan uit. Een fade komt alleen op een rand die ook echt een knip is, dus een rand helemaal aan het begin of eind van de opname blijft precies zoals hij was.

### Kan ik de slechte stukken er juist uit knippen?

Ja. Markeer ze en kies dan “Eruit knippen”: alles wat je *niet* markeerde wordt in plaats daarvan aan elkaar gezet, op volgorde. Dezelfde lijst markeringen beantwoordt allebei de vragen, dus je kunt wisselen en de lengte zien veranderen zonder ook maar iets twee keer te markeren.

### Kan ik mijn markeringen opslaan en er later op terugkomen?

Ja. “Markeringen opslaan” schrijft een gewoon tekstbestand — één regel per stuk, een begin en een eind gescheiden door een komma — en “Markeringen laden” leest er een terug. Er worden twee formaten aangeboden, kale seconden en `HH:MM:SS.mmm`, en allebei zijn het de indeling die de videoknipper op deze site schrijft, dus een bestand dat je op de video maakte kun je op zijn audio loslaten en andersom. Markeren is precisiewerk en niemand zou het twee keer moeten doen.

### Welke formaten kan ik openen?

Alles wat je browser decodeert, wat in de praktijk MP3, WAV, FLAC, M4A en AAC, Ogg Vorbis en Opus betekent, plus het geluid in MP4-, M4V-, MOV- en WebM-video. Wat erbuiten valt is hetzelfde korte lijstje als overal: AVI, WMA en de meeste MKV's. Een bestand dat deze browser niet leest wordt geweigerd met een bericht dat dat zegt, in plaats van halverwege te stranden.

### Waarom slaat hij een WAV op in plaats van een MP3?

Omdat geen enkele browser een MP3-encoder meelevert, en deze tool weigert je opname naar een server te sturen die er wel een heeft. Een WAV heeft helemaal geen encoder nodig — het zijn de samples met een korte kop ervoor — dus het is tegelijk de eerlijke keuze en de enige die op de uitweg geen kwaliteit kan kosten. Hij is wel groter: ongeveer tien megabyte per minuut in stereo. Elke speler, telefoon en editor opent er een, en wat een MP3 wil kan er daaruit een maken. Een MP3 knippen door zijn frames te kopiëren zou het bestand klein houden, maar zou ook elk knip naar de dichtstbijzijnde framegrens verschuiven, en dat is precies de afronding waarvoor deze tool bestaat om hem niet te doen.

### Zit er een limiet op de lengte van de opname?

Er zit geen limiet in de tool. Het echte plafond is geheugen: de hele opname wordt in één keer in deze pagina gedecodeerd, en de WAV wordt in het geheugen opgebouwd voordat je hem downloadt, dus een uur stereo heeft iets minder dan een gigabyte nodig om in te werken. Een WAV van vier gigabyte wordt meteen geweigerd, omdat het groottveld van het formaat zelf er geen kan beschrijven.

### Is het gratis, en heb ik een account nodig?

Het is gratis, en er komt geen account, geen inlog, geen proefperiode en geen watermerk aan te pas. De site draait op advertenties, en die betalen hem; die advertenties krijgen niets over je opname mee.

## Hoe je de privacybelofte controleert

- **Je opnames kunnen nergens heen.** In de Content-Security-Policy staat elk adres dat deze pagina mag benaderen, en geen daarvan is van ons. Er is hier geen eindpunt waar je bestand verzameld zou kunnen worden, en er staat ook niets in de code dat het daarheen zou sturen als dat er wel was.
- **Niets hier haalt iets op.** Deze tool heeft helemaal geen netwerkfunctie: geen adres om te plakken, niets om te downloaden, geen engine die bij het eerste gebruik binnenkomt. Elke byte die je audio aanraakt kwam van deze herkomst toen de pagina laadde.
- **De decoder is degene die al in je browser zit.** Het bestand wordt aan `decodeAudioData` gegeven, dezelfde code die een nummer afspeelt in een `<audio>`-element. Er wordt hier niets meegeleverd om jouw formaat te lezen, en er wordt ook niets buiten deze pagina om gevraagd om het te lezen.
- **Het beeld van een video wordt helemaal niet gedecodeerd.** Sleep je een video naar binnen, dan wordt alleen zijn geluidsspoor opgevraagd. De frames worden niet gelezen, niet gedecodeerd, niet getekend en niet bekeken: er staat geen code op deze pagina die dat zou kunnen, en het bestand dat eruit komt bevat geluid en verder niets.
- **Het knippen is een kopie, in het geheugen, op dit apparaat.** Knippen is één `set` per stuk per kanaal: de samples die je hield worden naar een nieuwe array verplaatst, in de volgorde waarin jij ze zette. De enige samples die met iets vermenigvuldigd worden zijn de paar honderd binnen elke fade, en de pagina zegt er hoeveel dat zijn voordat je op de knop drukt.
- **De samples worden opgeschreven, niet opnieuw gecodeerd.** Een WAV is de samples die deze pagina vasthoudt met een kop ervoor. Er zit geen encoder in de lus die beslissingen over je opname neemt, en er is niets wat je een upload zou kunnen noemen waarop dat zou gebeuren.
- **Het markeringenbestand wordt in de pagina gemaakt.** Je markeringen opslaan schrijft een tekstbestand uit de getallen die al op het scherm staan, rechtstreeks naar je downloads. Er een laden leest het hier. Geen van beide komt in de buurt van een netwerk, en geen van beide draagt iets anders dan tijden.
- **Wat Google laadt, en wat het niet te zien krijgt.** De advertentie- en meetscripts komen van Google. Geen van beide krijgt iets over je opname mee: geen bestand, geen sample, geen naam, geen grootte, geen lengte en niet waar je geknipt hebt. Elke regel die leest, knipt en schrijft wordt vanaf deze herkomst geserveerd en staat in de repository.
- **Wat de doneerknop laadt, en wat die niet te zien krijgt.** De knop “Buy me a coffee” in de kop wordt getekend door een script van cdnjs.buymeacoffee.com en haalt zijn letters bij Google Fonts. Het is niet meer dan een link: hij meldt geen bezoek en krijgt niets over jou of je opname mee.
- **Het werkt offline.** Verbreek de verbinding en alles op deze pagina blijft werken. Eenvoudiger bewijs bestaat er niet.

**Controleer het zelf.** Je hoeft niets van het bovenstaande op ons woord aan te nemen. Een buildscript maakt deze pagina uit de sjablonen en de configuratie in de repository, en dat script kun je lezen en zelf draaien. Het resultaat staat vastgelegd op de branch `dist`, dus je kunt wat er geserveerd wordt vergelijken met wat een build van de bronnen oplevert: https://github.com/A-Box-of-Tools/website

De bestanden die je als eerste wilt lezen zijn `config/site.toml` voor de Content-Security-Policy, `src/segments.js` voor de markeringen en het bestand waarin ze opgeslagen worden, `src/shared/audio-decode.js` voor de twintig regels die je bestand aan de eigen decoder van de browser geven, `src/trim.js` voor het rekenwerk dat van een markering een reeks samples maakt en de lus die ze kopieert, en `src/shared/wav.js` voor de kop die ervoor komt. Geen daarvan importeert iets dat een verzoek kan doen.
