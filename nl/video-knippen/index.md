# Video knippen — online een video inkorten

Markeer tijdens het afspelen wat het bewaren waard is. Krijg het terug als één video.

> Bekijk een video, markeer tijdens het afspelen elk stuk dat het bewaren waard is en sla die stukken op als één bestand. Draait in je browser, uploadt niets, codeert niets opnieuw en werkt offline.

Deze pagina is een interactief hulpmiddel dat volledig in je browser draait, op https://abox.tools/nl/video-knippen/ — niets van wat je het geeft wordt geüpload. Hieronder staat alles wat de pagina er in woorden over zegt; om het te gebruiken, open je het adres.

## Je video's worden **nooit geüpload**. Er is geen server.

Je eigen browser leest, markeert, knipt en schrijft je video, op je eigen hardware. Niets hier kan iets ophalen of versturen, want er zit helemaal geen netwerkfunctie in deze tool. En al was die er wel, dan stond aan de andere kant van deze pagina nog steeds geen server om een video naartoe te sturen.

- ✗ Geen upload
- ✗ Geen account
- ✗ Geen watermerk
- ✓ Zoveel stukken als je wilt
- ✓ Geen kwaliteitsverlies
- ✓ Werkt offline

## Zo knip je een video

1. **Kies een video.** Sleep een mp4, mov, m4v of WebM het vak in. De browser leest hem rechtstreeks van je schijf, en er gaat ondertussen niets ergens heen. Sleep er meerdere naar binnen, dan worden ze aan elkaar gezet in de volgorde waarin je ze erin zette.
2. **Speel hem af en markeer de stukken die je wilt.** Druk op `I` waar een stuk moet beginnen en op `O` waar het moet eindigen, zo vaak als je wilt. Elk paar wordt een regel in de tabel eronder en een band op de tijdlijn. Met `U` neem je de laatste terug, met de `spatiebalk` speel je af en pauzeer je, en met de pijltjes spring je vijf seconden tegelijk. Krijg je het moment lastig te pakken, zet het afspelen dan langzamer.
3. **Werk de markeringen bij.** Elke regel kun je apart afspelen, opnieuw timen door er een exacte tijd in te tikken, in de volgorde omhoog of omlaag schuiven, of verwijderen. De twee uiteinden van het geselecteerde stuk sleep je desgewenst over de tijdlijn. Het totaal bovenaan is wat de gereedgekomen video gaat duren.
4. **Hou ze, of knip ze eruit.** Houden is de gebruikelijke kant op, en dan bestaat de gereedgekomen video uit de stukken die je markeerde, op volgorde aan elkaar gezet. Ze eruit knippen is die andere klus die mensen willen en zelden vinden. Markeer de reclames, de stiltes of de valse starts, en wat overblijft wordt zonder die aan elkaar gezet.
5. **Knip hem, en download.** Met “Hou elke byte” gaan de frames onaangeroerd over. Dat gaat snel en het kan geen kwaliteit kosten, alleen begint elk stuk dan bij het keyframe vóór je markering. “Knip precies hier” decodeert het beeld en schrijft het opnieuw, zodat elk stuk begint op het frame dat je koos. Voordat je op de knop drukt, zegt de pagina welke van de twee je krijgt en wat dat kost.

## De uitgebreide versie

[Hoe je een video inkort zonder hem opnieuw te coderen](https://abox.tools/nl/gidsen/een-video-inkorten/): Een filmpje knippen hoeft geen enkele byte kwaliteit te kosten. Waarom een knip soms eerder landt dan waar je hem markeerde, wat een keyframe daarmee te maken heeft, en wanneer je een hercodering accepteert.

## Ook in de gereedschapskist

- [Videobijsnijder](https://abox.tools/nl/video-bijsnijden/): Snijd een filmpje terug tot het stuk waar het om gaat.
- [Video-omkeerder](https://abox.tools/nl/video-achteruit-afspelen/): Laatste frame eerst, geluid en al.
- [Timelapsemaker](https://abox.tools/nl/timelapse-maken/): Een uur beeldmateriaal in twintig seconden.
- [Framegrabber](https://abox.tools/nl/frame-uit-video-halen/): Een stilstaand beeld op volle kwaliteit, van elk moment.

## Vragen

### Wordt mijn video ergens heen geüpload?

Nee. Je eigen browser leest, markeert, knipt en schrijft hem op je eigen hardware. Deze tool heeft geen serverkant, en in de `Content-Security-Policy` van de pagina staat elk adres dat hij mag benaderen, waarvan er geen enkele bij deze site hoort. Controleer je het liever dan dat je het aanneemt, trek dan de stekker uit je internet en knip er alsnog een.

### Kan ik meerdere stukken uit dezelfde video houden?

Daar is dit juist voor. Druk zo vaak je wilt op `I` en `O` terwijl hij speelt. Elk paar wordt een regel, en de gereedgekomen video is elke regel op volgorde aan elkaar gezet, met al het andere weg. De meeste online knippers geven je één paar grepen en vragen welk enkel stuk je wilt houden. Dat is prima om een filmpje aan de voor- en achterkant bij te snijden, en volstrekt waardeloos als je een uur beeldmateriaal één keer wilt doorkijken om de zes momenten te houden die de moeite waard zijn.

### Kost knippen kwaliteit?

Op de gewone route niet, en zeker niet op de manier die ertoe doet. Knippen verandert niets aan hoe een frame eruitziet, dus de frames gaan precies zoals ze waren naar het nieuwe bestand: dezelfde bytes, dezelfde encoderinstellingen, alles hetzelfde. De enige route hier die iets opnieuw codeert is het exacte knippen, en dat staat gewoon op de knop.

### Waarom begint een stuk eerder dan waar ik het markeerde?

Door de manier waarop video opgeslagen wordt, en alleen bij spelers die een standaardonderdeel van het formaat negeren. De meeste frames worden bewaard als een beschrijving van hoe ze van hun buren verschillen, dus ze zijn zonder die buren niet te decoderen. Alleen een keyframe staat op zichzelf, en keyframes liggen meestal een tot tien seconden uit elkaar. Een knip die frames kopieert moet dus de reeks vanaf het keyframe vóór je markering meenemen, en in het bestand staat dan *begin met afspelen bij jouw markering*, waar elke gangbare speler zich aan houdt. Moet het in elke speler exact zijn, kies dan “Knip precies hier”, want die codeert opnieuw. Voordat je exporteert, zegt de pagina in welk geval je zit en om hoeveel het gaat.

### Kan ik in plaats daarvan de reclames eruit knippen?

Ja. Markeer ze en kies daarna “Knip ze eruit”, dan wordt juist alles wat je *niet* gemarkeerd hebt op volgorde aan elkaar gezet. Dezelfde lijst markeringen beantwoordt allebei de vragen, dus je kunt ertussen wisselen en de lengte zien veranderen zonder ook maar iets twee keer te markeren.

### Kan ik mijn markeringen opslaan en er later op terugkomen?

Ja. “Markeringen opslaan” schrijft een gewoon tekstbestand met één regel per stuk, waarin een begin en een eind door een komma gescheiden worden, en “Markeringen laden” leest er een terug. Er worden twee formaten aangeboden, gewone seconden en `HH:MM:SS.mmm`, en allebei houden zich aan de indeling die andere tools die zo werken al gebruiken, dus een bestand dat hier geschreven is kun je aan zo'n tool geven en een bestand dat daar geschreven is kun je op deze pagina slepen. Markeren is nauwkeurig werk en niemand hoort het twee keer te doen.

### Welke videoformaten kan ik knippen?

Mp4, m4v en mov worden rechtstreeks gelezen, wat er ook in zit: H.264, HEVC, AV1 of VP9. Frames kopiëren houdt niet in dat ze gedecodeerd worden, dus deze route werkt zelfs voor een codec waarvoor je browser helemaal geen decoder heeft. Al het andere dat je browser kan afspelen, en dan denk je meteen aan WebM, wordt geknipt door het af te spelen en het resultaat op te nemen. Dat werkt, maar het duurt zo lang als het resultaat zelf en het kan maar één stuk houden. Een bestand dat de browser niet kan lezen en ook niet kan afspelen, in de praktijk avi, wmv, flv en de meeste mkv's, wordt geweigerd met een melding die dat zegt, in plaats van halverwege te stranden.

### Zit er een limiet op de grootte of lengte van de video?

In de tool zit geen limiet ingebouwd, en op de kopieerroute wordt het bestand nauwelijks gelezen. Naar de frames die je houdt wordt alleen gewezen in plaats van dat ze geladen worden, dus vier minuten overhouden uit een opname van vier gigabyte kost ongeveer evenveel als die vier minuten naar schijf schrijven. Het exacte knippen loopt een paar megabyte tegelijk door het bestand. Hoe dan ook is het praktische plafond het gereedgekomen bestand, dat in het geheugen wordt opgebouwd voordat je het downloadt.

### Blijft het geluid intact?

Op beide mp4-routes gaat het monster voor monster over zonder ooit gedecodeerd te worden, dus het is byte voor byte wat er in het bestand zat, en een bewerkingsmarkering houdt elk stuk tot op een duizendste seconde gelijk met zijn beeld. Er is één uitzondering, en dat is het aan elkaar zetten van losse video's waarvan het geluid anders beschreven is, bijvoorbeeld met verschillende bemonsteringsfrequenties. Die krijg je niet in één spoor zonder ze te decoderen, en de pagina zegt dat voordat ze het doet. Op de opnameroute wordt het van de weergave opgevangen en opnieuw gecodeerd. Hoe dan ook staat er een vinkje klaar om het er helemaal uit te laten.

### Is het gratis, en heb ik er een account voor nodig?

Het is gratis, en er komt geen account, geen inlog, geen proefperiode en geen watermerk aan te pas. De site draait op advertenties, en die betalen hem. Die advertenties krijgen niets over je video mee.

## Hoe je de privacybelofte controleert

- **Je video's kunnen nergens heen.** In de Content-Security-Policy staat elk adres dat deze pagina mag benaderen, en geen daarvan hoort bij deze site. Er is hier geen eindpunt waar je bestand verzameld zou kunnen worden, en in de code staat niets wat het zou versturen als dat eindpunt er wel was.
- **Niets hier haalt iets op.** Deze tool heeft helemaal geen netwerkfunctie: geen adres om te plakken, niets om te downloaden, geen engine die bij het eerste gebruik opgehaald wordt. Elke byte die je video aanraakt, kwam bij het laden van de pagina van deze herkomst.
- **Op de gewone route wordt er niet eens iets gedecodeerd.** Knippen verandert niets aan hoe een frame eruitziet, dus de gecodeerde frames van de stukken die je markeerde gaan precies zoals ze gevonden werden naar het nieuwe bestand. Elk frame wordt opgeslagen als een plakje van het bestand op je schijf, oftewel een aantekening welke bytes het zijn en niet de bytes zelf, en je browser leest ze pas voor het eerst terwijl hij de download schrijft. Niets hier maakt ooit weer een beeld van je video.
- **Het markeringenbestand wordt in de pagina gemaakt.** Sla je je markeringen op, dan wordt er een tekstbestand geschreven uit de getallen die al op het scherm staan, en dat gaat rechtstreeks naar je downloads. Laad je er een, dan wordt hij hier ingelezen. Geen van beide komt bij een netwerk in de buurt, en geen van beide draagt iets anders dan tijden.
- **Het geluid wordt gekopieerd, niet beluisterd.** Op beide mp4-routes gaan de audiomonsters over zonder ook maar gedecodeerd te worden. Niets hier maakt er ooit weer geluid van, en zelfs als dat wel gebeurde, was er niets wat ze ergens heen kon doorgeven.
- **Waar frames wel gedecodeerd worden, gebeurt dat hier.** Het exacte knippen, en de voorvertoning van een bestand dat deze browser niet afspeelt, gaan door WebCodecs op je eigen apparaat. Dat is dezelfde decoder die je de video toch al zou tonen, draaiend op dezelfde plek.
- **Wat Google laadt, en wat het niet te zien krijgt.** De advertentie- en meetscripts komen van Google. Geen van beide krijgt iets over je video mee: geen bestand, geen frame, geen naam, geen grootte, geen lengte, en niet waar je knipte. Elke regel die leest, knipt en schrijft, wordt vanaf deze herkomst geserveerd en staat in de repository.
- **Wat de doneerknop laadt, en wat hij niet te zien krijgt.** De knop “Buy me a coffee” in de kop wordt getekend door een script van cdnjs.buymeacoffee.com en haalt zijn letters bij Google Fonts. Het is een link en verder niets. Hij meldt geen bezoek en krijgt niets over jou of je video mee.
- **Het werkt offline.** Verbreek de verbinding en alles op deze pagina doet het nog. Eenvoudiger bewijs bestaat er niet.

**Controleer het zelf.** Je hoeft niets van het bovenstaande op ons woord aan te nemen. Een buildscript maakt deze pagina uit de sjablonen en de configuratie in de repository, en dat script kun je lezen en zelf draaien. Het resultaat staat vastgelegd op de branch `dist`, dus je kunt wat er geserveerd wordt vergelijken met wat een build van de bronnen oplevert: https://github.com/A-Box-of-Tools/website

De bestanden die je als eerste wilt lezen zijn `config/site.toml` voor de Content-Security-Policy, `src/segments.js` voor de markeringen en het bestand waarin ze opgeslagen worden, `src/shared/mp4-reader.js` voor de lezer die de frames in een mp4 vindt, `src/ranges.js` voor het rekenwerk dat een markering in een reeks samples verandert, en `src/copy.js` voor de lus die die samples naar het nieuwe bestand verplaatst. Geen ervan importeert iets wat een verzoek kan doen.
