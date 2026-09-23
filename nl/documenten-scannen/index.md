# Documentscanner — een foto van een pagina, rechtgetrokken

Fotografeer de pagina. Je krijgt iets terug dat eruitziet als een scan.

> Maak van een telefoonfoto van een pagina een rechtgetrokken, gelijkmatig belichte PDF. De hoeken worden voor je gevonden, het perspectief wordt teruggedraaid, de schaduw wordt eruit gedeeld. Draait helemaal in je browser: er wordt niets geüpload.

Deze pagina is een interactief hulpmiddel dat volledig in je browser draait, op https://abox.tools/nl/documenten-scannen/ — niets van wat je het geeft wordt geüpload. Hieronder staat alles wat de pagina er in woorden over zegt; om het te gebruiken, open je het adres.

## Je documenten worden **nooit geüpload**. Er is geen server.

De foto wordt door je eigen browser gedecodeerd, rechtgetrokken, opgeschoond en in een PDF geschreven, met niets anders dan rekenwerk en de codecs die hij al meebrengt. Dit gereedschap heeft geen enkele netwerkfunctie — niets op te halen, niets te versturen — en waarom dat hier uitmaakt is waar mensen pagina's van fotograferen: een paspoort, een loonstrook, een huurcontract, een formulier dat een instantie heeft gevraagd te „scannen en terug te sturen”.

- ✗ Geen upload
- ✗ Geen account
- ✗ Geen watermerk
- ✓ Werkt offline
- ✓ Open source

## Zo scan je een document met de camera van je telefoon

1. **Fotografeer de pagina.** Van boven, met de hele pagina in beeld en de vier hoeken zichtbaar of bijna. Hij hoeft niet recht van voren en hij hoeft niet gelijkmatig belicht: de hoek en de schaduw zijn waar dit gereedschap voor is. Wat wel uitmaakt is het beeld vullen — een pagina die van de andere kant van de kamer gefotografeerd is, heeft geen detail meer om terug te halen.
2. **Controleer de vier hoeken.** Ze worden voor je gevonden zodra de foto gelezen is, en de pagina zegt het als hij het niet zeker weet — een pagina op een bureau van dezelfde kleur als het papier heeft werkelijk een rand die nauwelijks te zien is. Druk ergens op de foto en de dichtstbijzijnde hoek komt naar je vinger toe, of bereik er een met `Tab` en verplaats hem met de pijltjestoetsen.
3. **Kies wat er met het licht moet gebeuren.** „Kleur, gelijkgetrokken” meet het papier over de pagina heen en deelt het eruit, zodat de schaduw verdwijnt en een stempel of een handtekening zijn kleur houdt. „Zwart-wit” gaat verder en is wat een scan klein genoeg maakt om te mailen. Wat je op het scherm ziet is het echte resultaat, gemaakt door dezelfde code die het bestand schrijft.
4. **Voeg de andere pagina's toe.** Elke foto die je toevoegt wordt een volgende pagina van hetzelfde document, in de volgorde waarin ze staan, en elke pagina houdt haar eigen hoeken. De pijltjes bij een pagina in de strook verplaatsen haar naar voren of naar achteren.
5. **Sla de PDF op, en open hem voordat je hem verstuurt.** Het document wordt hier opgebouwd, in het geheugen van deze pagina. Er is niets geüpload om het te maken, en er is nergens iets over gemeld.

## De uitgebreide versie

[Hoe je een document scant met je telefoon](https://abox.tools/nl/gidsen/een-document-scannen-met-je-telefoon/): Wat een foto van een pagina scheidt van een scan ervan: de hoek, het ongelijke licht en de bestandsgrootte. Hoe je de foto maakt, wat je daarna herstelt, en waarom er nergens een server aan te pas komt.

## Ook in de gereedschapskist

- [Audio uit video halen](https://abox.tools/nl/audio-uit-video-halen/): Sleep er een video in en haal het geluid eruit. Het beeld wordt nooit gedecodeerd en er wordt niets geüpload.
- [Audioknipper](https://abox.tools/nl/audio-knippen/): Markeer tijdens het afspelen wat het waard is. Je krijgt het terug als één bestand, geknipt waar jij het zei.
- [Audiobewerker](https://abox.tools/nl/audio-bewerken/): Achterstevoren afspelen, de snelheid wijzigen, een zachte opname optillen. Alles hier, op je eigen apparaat.
- [Pdf samenvoegen & splitsen](https://abox.tools/nl/pdf-samenvoegen/): Pagina's verschuiven zonder ritje naar een server.

## Vragen

### Wordt mijn document ergens naartoe geüpload?

Nee. De foto wordt door je eigen browser op je eigen hardware gedecodeerd, rechtgetrokken, opgeschoond en in een PDF geschreven. Dit gereedschap heeft geen enkele netwerkfunctie — het haalt nooit iets op en verstuurt nooit iets — en het `Content-Security-Policy` van de pagina noemt elk adres dat hij mag benaderen, en geen daarvan hoort bij deze site. Laad de pagina één keer, trek de stekker uit het internet, en hij werkt nog steeds.

### Hoe vindt hij de hoeken van de pagina zonder model?

Door te zoeken naar de vier lange rechte randen waaruit een rechthoek bestaat. De foto wordt verkleind, de gradiënt wordt genomen — waar het beeld verandert, en in welke richting — en elke pixel die op een rand ligt stemt op de rechte lijn waar hij op zou liggen. De sterke lijnen worden tot kandidaat-rechthoeken gekoppeld, en elke kandidaat krijgt een score door zijn vier zijden af te lopen en te vragen hoeveel van elke zijde er werkelijk een rand onder heeft, en of die vier samen de grens van één ding zijn: een pagina is lichter dan wat eromheen ligt, of donkerder, maar op alle vier de zijden hetzelfde, en dat is wat voorkomt dat een regel tekst voor de onderkant van de pagina wordt aangezien. Er zijn geen gewichten, er wordt niets gedownload, en het rekenwerk is hetzelfde rekenwerk voor elk document dat erdoorheen gaat.

### De hoeken die hij gevonden heeft kloppen niet. Wat nu?

Sleep ze. De hoeken zijn een beginpositie en nooit een beslissing: de scan wordt genomen van waar de vier uiteindelijk staan. Druk ergens op de foto en de dichtstbijzijnde hoek springt naar je vinger, wat makkelijker is dan een klein handvat raken, en de pijltjestoetsen verplaatsen de hoek met de focus één pixel per keer. De pagina vertelt je ook wanneer de hoeken een gok zijn in plaats van een vondst, en markeert die pagina in de strook — een pagina die op een bureau van ongeveer zijn eigen kleur ligt is de gebruikelijke reden, want daar valt echt bijna geen rand te vinden.

### Waarom komt de rechtgetrokken pagina in de goede vorm uit en niet platgedrukt?

Omdat de vorm uit het perspectief wordt teruggerekend en niet van de randen wordt afgemeten. Een pagina die schuin gefotografeerd is heeft een verkorte verre rand, dus de voor de hand liggende methode — neem het langste paar tegenoverliggende randen en noem dat de verhouding — levert een zichtbaar gedrongen A4 op, en dat is wat de meeste webscanners je geven. Een foto van een rechthoek draagt in werkelijkheid genoeg informatie om zowel de verhouding van de rechthoek als de brandpuntsafstand van de camera terug te rekenen, mits de camera een gewone is; dat is een resultaat van Zhang en He uit 2003, en dat is wat `src/geometry.js` doet. Waar de foto recht van voren genomen is, is er geen perspectief om mee te werken en is dat ook niet nodig, want dan zijn de randen exact — dus valt hij daarop terug, en de pagina zegt welke van de twee het antwoord gaf.

### Wat doet het „opschonen” nu eigenlijk met het beeld?

Het deelt het licht eruit. De eigen helderheid van het papier wordt over de pagina heen gemeten — een raster van vakjes, en in elk vakje een hoog percentiel van de helderheid, dat tekst te donker en te schaars is om te verschuiven — en elke pixel wordt gedeeld door het papier zoals dat op dat punt geschat is. Wat overblijft is de inkt, gelijkmatig belicht, zonder de schaduw en zonder de afval van licht naar de randen. Dat is niet hetzelfde als het contrast verhogen: het contrast van een gefotografeerde pagina verhogen maakt het lichte deel wit, het donkere deel zwart, en wat er in het donkere deel staat onleesbaar, en daarom maken „automatische niveaus” deze beelden slechter in plaats van beter.

### Waarom is de zwart-witmodus zoveel kleiner?

Omdat een beeld met twee kleuren erin werkelijk een fractie is van de gegevens van een beeld met zestien miljoen, en het wordt hier ook zo opgeslagen: één bit per pixel, acht per byte ingepakt en exact gecomprimeerd, en niet als een JPEG van een zwart-witbeeld. Op dezelfde pagina's komt het er ongeveer achttien keer kleiner uit dan de kleurmodus, dus een contract van twintig pagina's blijft onder een megabyte in plaats van rond de vijftien te landen. De drempel is die van Sauvola, die elke pixel beoordeelt tegen het gemiddelde en de spreiding van zijn eigen omgeving in plaats van tegen één getal voor de hele pagina — en dat is wat het schrift binnen een schaduw leesbaar houdt. Hij kent geen halftonen, dus een pagina met een foto erop kan beter een van de andere modi nemen.

### Kan ik meerdere pagina's in één PDF zetten?

Ja. Elke foto die je toevoegt wordt een volgende pagina, in de volgorde waarin ze staan, en elke pagina houdt haar eigen hoeken — dus een stapel pagina's die na elkaar gefotografeerd is wordt één document. De pijltjes bij elke pagina in de strook verplaatsen haar naar voren of naar achteren. De opschoon-instelling wordt met opzet door allemaal gedeeld: pagina's in één document die verschillend opgeschoond zijn, zien eruit als twee documenten.

### Leest hij de tekst, zodat ik de PDF kan doorzoeken?

Nee. Er is geen tekstlaag en geen tekenherkenning: wat eruit komt is een beeld van de pagina op een pagina. Het goed doen zou een OCR-motor betekenen, en dat zijn tientallen megabytes aan model om te downloaden — en een documentscanner die een model ophaalde voordat hij je loonstrook kon lezen, zou een documentscanner zijn met een reden om over loonstroken naar huis te bellen. Als je de tekst nodig hebt, levert de zwart-witmodus precies het soort bestand op waar OCR-software op je eigen machine het beste mee werkt.

### Hij is wazig geworden. Waarom?

Bijna altijd omdat de pagina klein was in de foto. Het paneel onder het voorbeeld zegt hoeveel van het beeld de pagina vulde en ongeveer hoeveel punten per inch dat oplevert op een vel van dat formaat — onder zo'n 150 DPI ziet een afgedrukte scan er slap uit, en geen enkel gereedschap kan iets doen aan detail dat nooit in het bestand heeft gezeten. Ga dichterbij staan in plaats van in te zoomen, houd stil, en laat de camera scherpstellen op de pagina voordat je op de knop drukt. Bewegingsonscherpte is de andere oorzaak, en die is ook niet terug te halen.

### Is het gratis, en heb ik een account nodig?

Het is gratis, en er is geen account, geen inloggen, geen proefperiode, geen paginalimiet en geen watermerk. Er is ook geen limiet op de grootte van de foto's, want er is geen server die ervoor betaalt — het werk gebeurt op je eigen machine. De site draait advertenties, en dat is wat hem betaalt; de adverteerders krijgen niets over je documenten.

## Hoe je de privacybelofte controleert

- **Je documenten kunnen nergens heen.** Het Content-Security-Policy noemt elk adres dat deze pagina mag benaderen, en geen enkel adres daarvan hoort bij deze site. Er is hier geen eindpunt waar je foto's verzameld zouden kunnen worden, en niets in de code dat ze zou versturen als dat er wel was.
- **Er is geen model, dus er valt niets te downloaden en niets te vragen.** De vier hoeken van een pagina vinden gebeurt met rekenwerk: de gradiënt van het beeld, een stem voor de rechte lijnen erin, en een controle van wat er werkelijk onder elke zijde van de winnende rechthoek ligt. Geen gewichten, geen inferentie-runtime, niets dat bij het eerste gebruik opgehaald wordt, en niets dat zich bij het document van iemand anders anders gedraagt dan bij het jouwe — zie `src/detect.js`.
- **Het document draagt geen datum, geen auteur en geen machinenaam.** Een scan is iets dat mensen naar andere mensen sturen, meestal omdat een instantie erom gevraagd heeft. Het enige wat er behalve de pagina's zelf in de PDF geschreven wordt is de naam van dit gereedschap, en een titel als je er een typt. Er is geen aanmaakdatum, geen auteur, geen serienummer en niets dat is afgeleid van je klok, je bestandsnamen of je computer — zie `src/document.js`.
- **Hier haalt niets iets op.** Er staat geen `fetch`, geen `XMLHttpRequest` en geen `sendBeacon` ergens in `src/`. Het werk is `getImageData`, wat lussen over de bytes, en de eigen JPEG-encoder van de browser — allemaal al geïnstalleerd op je machine.
- **Het werkt offline.** Verbreek de verbinding en het gereedschap is onveranderd, want er heeft nooit een netwerkstap in gezeten. Dat is het eenvoudigste bewijs van allemaal — en het bewijs dat het waard is te draaien voordat je een paspoort scant.

**Controleer het zelf.** Je hoeft niets van het bovenstaande op ons woord aan te nemen. Een buildscript maakt deze pagina uit de sjablonen en de configuratie in de repository, en dat script kun je lezen en zelf draaien. Het resultaat staat vastgelegd op de branch `dist`, dus je kunt wat er geserveerd wordt vergelijken met wat een build van de bronnen oplevert: https://github.com/A-Box-of-Tools/website

De bestanden die je als eerste wilt lezen zijn `config/site.toml` voor de Content-Security-Policy, `src/detect.js` voor hoe de hoeken zonder enig model gevonden worden, `src/warp.js` voor het rechttrekken, en `src/clean.js` voor hoe het ongelijke licht eruit gedeeld wordt.
