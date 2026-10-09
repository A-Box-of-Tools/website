# Audio uit video halen — het geluid apart, als WAV

Sleep er een video in en haal het geluid eruit. Het beeld wordt nooit gedecodeerd en er wordt niets geüpload.

> Haal het geluid uit een MP4, MOV of WebM en bewaar het als WAV. De video blijft op je eigen apparaat en het beeld wordt nooit gedecodeerd, want het hele karwei draait in je eigen browser.

Deze pagina is een interactief hulpmiddel dat volledig in je browser draait, op https://abox.tools/nl/audio-uit-video-halen/ — niets van wat je het geeft wordt geüpload. Hieronder staat alles wat de pagina er in woorden over zegt; om het te gebruiken, open je het adres.

## Je video's worden **nooit geüpload**. Er is geen server.

De decoder is degene die je browser al heeft, hetzelfde codepad dat een bestand afspeelt in een `<video>`-element, en er wordt om het geluidsspoor gevraagd en om niets anders. Een WAV schrijven is een kop van vierenveertig bytes voor de samples zetten, en dat staat in `src/shared/wav.js`. Er zit geen encoder in de lus, er is geen uploadstap en deze pagina heeft überhaupt geen netwerkfunctie.

- ✗ Geen upload
- ✗ Geen account
- ✗ Geen groottelimiet
- ✓ Werkt offline
- ✓ Open source

## Zo haal je de audio uit een video zonder hem te uploaden

1. **Sleep de video erin.** Een MP4, MOV, M4V of WebM, van een telefoon, een camera, een schermopnemer of een download. Je eigen browser leest hem, dus er is geen uploadstap om over te slaan.
2. **Lees wat er gevonden is.** De duur, het aantal kanalen en de samplefrequentie, rechtstreeks uit het bestand. Als het bestand zijn frequentie niet opgaf zegt de pagina dat, in plaats van stilletjes opnieuw te bemonsteren en te beweren dat er niets is aangeraakt.
3. **Kies mono als het kleiner moet.** De kanalen met rust laten houdt de opname precies zoals hij was. Naar mono mixen halveert het bestand en is wat een transcriptie of een spraakopname wil; het middelt de kanalen in plaats van er een weg te gooien.
4. **Luister ernaar voordat je het bewaart.** De speler speelt het bestand dat zo dadelijk gedownload wordt, niet de video, dus als het goed klinkt is de download goed.
5. **Neem het mee, of geef het door.** Download de WAV, of stuur hem meteen door naar de knipper of de editor zonder hem eerst te bewaren.

## Ook in de gereedschapskist

- [Audioknipper](https://abox.tools/nl/audio-knippen/): Markeer tijdens het afspelen wat het waard is. Je krijgt het terug als één bestand, geknipt waar jij het zei.
- [Audiobewerker](https://abox.tools/nl/audio-bewerken/): Achterstevoren afspelen, de snelheid wijzigen, een zachte opname optillen. Alles hier, op je eigen apparaat.
- [Pdf samenvoegen & splitsen](https://abox.tools/nl/pdf-samenvoegen/): Pagina's verschuiven zonder ritje naar een server.
- [Pdf-compressor](https://abox.tools/nl/pdf-verkleinen/): Een document laten krimpen zonder het ergens heen te sturen.

## Vragen

### Wordt mijn video ergens geüpload?

Nee. Het decoderen en het schrijven gebeuren allebei in je eigen browser, op je eigen hardware. Dit gereedschap heeft überhaupt geen netwerkfunctie — het haalt nooit iets op en stuurt nooit iets weg — en in het `Content-Security-Policy` van de pagina staat elk adres dat ze mag benaderen, en geen daarvan is van ons. Als je liever controleert dan gelooft: trek de stekker uit het internet en haal het geluid er toch uit.

### Kan ik er een MP3 uit krijgen?

Nee, en het doet ook niet alsof. Geen enkele browser levert een MP3-encoder mee, en de enige weg naar een encoder is je video naar een server sturen die er een heeft, en dat is precies het enige dat deze site bestaat om niet te doen. Wat je krijgt is een WAV: de samples met een kop van vierenveertig bytes ervoor, waar helemaal geen encoder bij nodig is en wat geen kwaliteit kan kosten. Hij is groter, ongeveer tien megabyte per minuut in stereo, en elke speler, telefoon en editor opent er een. Wat een MP3 wil, kan er in een seconde een van maken.

### Wordt er ooit naar het beeld gekeken?

Nee, en er is hier niets dat ernaar zou kunnen kijken. De decoder van de browser krijgt het bestand en wordt om het geluidsspoor gevraagd; het videospoor wordt nooit gedecodeerd, nooit getekend en bereikt de code van deze pagina niet eens. In `src/` staat geen videodecoder die zou kunnen draaien. In het bestand dat eruit komt zit geluid en verder niets.

### Er staat dat er geen geluid gelezen kon worden, maar de video speelt prima.

Dan heeft de video vrijwel zeker helemaal geen geluidsspoor. Een schermopname zonder gekozen microfoon is stil, en een clip die een editor met gedempt geluid heeft geëxporteerd ook: allebei spelen ze perfect, omdat er beeld te tonen is. Het bericht noemt dit als eerste omdat het de waarschijnlijkste van de twee oorzaken is; de andere is een formaat dat deze browser niet leest. Open het bestand in een speler en zoek een volumeknop die niets doet, want dat is de snelste manier om te zien welke van de twee je hebt.

### Welke videoformaten kan ik openen?

Wat je browser decodeert, wat in de praktijk MP4, M4V, MOV en WebM betekent, en daarnaast elk audioformaat. Wat erbuiten valt is hetzelfde korte lijstje als overal elders op deze site: AVI, WMV en de meeste MKV's. Een bestand dat je browser niet leest wordt geweigerd met een bericht dat dat zegt, in plaats van halverwege te stranden.

### Gaat er kwaliteit verloren?

Niets bovenop wat de video zijn eigen audio al had aangedaan toen hij gemaakt werd. De samples die de decoder teruggeeft worden opgeschreven zoals ze zijn, dus er is geen tweede codering en daarom ook geen tweede generatie verlies. Het enige om te weten is de samplefrequentie: die van het bestand zelf wordt eerst uit de kop gelezen en het decoderen gebeurt op die frequentie, waardoor je opname niet stilletjes opnieuw bemonsterd wordt. Geeft een bestand er geen op, dan zegt de pagina welke frequentie ze heeft aangenomen.

### Waarom is de WAV zoveel groter dan de video?

Omdat een WAV niet gecomprimeerd is en het geluidsspoor van de video dat wel was. Geluid op cd-kwaliteit is ongeveer tien megabyte per minuut in stereo, wat er ook op staat; het AAC-spoor in een MP4 misschien een tiende daarvan. Naar mono mixen halveert het. Dat is de prijs van niet opnieuw coderen, en die betaal je één keer, want waar je het bestand daarna ook in opent kan het comprimeren.

### Hoe lang mag de video zijn?

Er is hier geen limiet ingesteld, want er is geen server die ervoor betaalt. Het echte plafond is het geheugen van je eigen apparaat: het bestand wordt ingelezen en het hele geluidsspoor blijft als samples in het geheugen staan, dus bij een heel lange opname op een klein apparaat kan de ruimte opraken. Een paar uur video gaat doorgaans prima, en een telefoon houdt het korter vol dan een laptop.

### Kan ik het inkorten of harder maken?

Ja, maar niet hier, want deze pagina doet één klus. Zodra er een resultaat is, staat er naast de download een rij links die het meteen doorzet naar de [audioknipper](https://abox.tools/nl/audio-knippen/) of de [audio-editor](https://abox.tools/nl/audio-bewerken/), zonder het eerst te bewaren en zonder dat een van beide het alsnog uploadt.

### Is het gratis, en heb ik een account nodig?

Het is gratis, en er is geen account, geen inloggen, geen proefperiode en geen limiet op hoeveel video's je opent. De site draait op advertenties, want die betalen hem; de advertenties krijgen niets over je bestand.

### Werkt het offline?

Ja. Laad de pagina één keer, trek daarna de stekker uit het internet en ze blijft werken. Dat is meteen de eenvoudigste manier om te bewijzen dat er niets geüpload wordt: gereedschap dat je video wegstuurt om verwerkt te worden zou stoppen op het moment dat je de stekker eruit trekt.

## Hoe je de privacybelofte controleert

- **Je video kan nergens heen.** In het Content-Security-Policy staat elk adres dat deze pagina mag benaderen, en geen daarvan is van ons. Er is hier geen eindpunt waar een bestand opgehaald zou kunnen worden, en er staat ook niets in de code dat het erheen zou sturen als dat er wel was.
- **Het beeld wordt helemaal niet gedecodeerd.** Er wordt alleen om het geluidsspoor gevraagd. De beeldjes worden niet gelezen, niet gedecodeerd, niet getekend en niet bekeken, want op deze pagina staat geen code die dat zou kunnen, en in het bestand dat eruit komt zit geluid en verder niets. Dat is geen belofte over terughoudendheid: `decodeAudioData` krijgt de bytes en geeft geluid terug, en in `src/` staat geen videodecoder die zou kunnen draaien.
- **De decoder is degene die je browser al heeft.** Er wordt hier niets meegeleverd om jouw formaat te lezen, en er wordt ook niets buiten deze pagina om gevraagd om het te lezen. Welke bestanden werken is daarom precies wat je browser al afspeelt.
- **De samples worden opgeschreven, niet opnieuw gecodeerd.** Een WAV zijn de samples die de decoder teruggaf met een kop ervoor. Er zit geen encoder in de lus die beslissingen neemt over jouw opname, en er is niets dat je een upload zou kunnen noemen waarop dat zou gebeuren.
- **Wat Google laadt, en wat het niet krijgt.** De advertentie- en meetscripts komen van Google en de donatieknop van Buy Me a Coffee. Geen van hen krijgt iets over je video: geen bestand, geen sample, geen naam, grootte of duur.
- **Het werkt offline.** Trek de netwerkstekker eruit en het gereedschap is onveranderd, want er zat nooit een netwerkstap in. Dat is het eenvoudigste bewijs dat er is.

**Controleer het zelf.** Je hoeft niets van het bovenstaande op ons woord aan te nemen. Een buildscript maakt deze pagina uit de sjablonen en de configuratie in de repository, en dat script kun je lezen en zelf draaien. Het resultaat staat vastgelegd op de branch `dist`, dus je kunt wat er geserveerd wordt vergelijken met wat een build van de bronnen oplevert: https://github.com/A-Box-of-Tools/website

De bestanden die je als eerste wilt lezen zijn `config/site.toml` voor de Content-Security-Policy, `src/shared/audio-decode.js` voor de enige decoder die er is en waarom er nooit om het beeld wordt gevraagd, en `src/shared/samplerate.js` voor het uitlezen van de kop waardoor je opname niet stilletjes opnieuw bemonsterd wordt.
