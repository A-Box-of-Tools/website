# Video naar gif — een video omzetten naar een gif

Kies het stuk, het formaat en de beeldsnelheid.

> Maak van een stuk mp4, mov of WebM een bewegende gif. Kies het stuk, de breedte en de beeldsnelheid, en je browser leest de frames en schrijft de gif. Er wordt niets geüpload.

Deze pagina is een interactief hulpmiddel dat volledig in je browser draait, op https://abox.tools/nl/video-naar-gif/ — niets van wat je het geeft wordt geüpload. Hieronder staat alles wat de pagina er in woorden over zegt; om het te gebruiken, open je het adres.

## Je video's worden **nooit geüpload**. Er is geen server.

Je eigen browser leest, schaalt, kwantiseert en schrijft elk frame, op je eigen hardware. Niets hier kan iets ophalen of versturen, want er zit helemaal geen netwerkfunctie in deze tool. En al was die er wel, dan stond aan de andere kant van deze pagina nog steeds geen server om een video naartoe te sturen.

- ✗ Geen upload
- ✗ Geen account
- ✗ Geen watermerk
- ✓ Elke lengte
- ✓ Werkt offline

## Zo maak je van een video een gif

1. **Kies een video.** Sleep een mp4, mov, m4v of WebM het vak in, of kies er een met de hand. De browser leest hem rechtstreeks van je schijf, en er gaat ondertussen niets ergens heen.
2. **Markeer het stuk.** Speel het filmpje af en druk op `I` waar het moet beginnen en op `O` waar het moet eindigen, of sleep de grepen op de balk. Een gif duurt een paar seconden, en deze instelling bepaalt veel sterker dan de andere twee of het bestand klein of enorm wordt.
3. **Kies de breedte en de beeldsnelheid.** 480 pixels breed en 12 beelden per seconde past bij vrijwel alles waar een gif voor bedoeld is. Halveer je de breedte, dan vier je het aantal pixels, en twaalf beelden per seconde leest al als beweging zonder dat je betaalt voor de beelden die niemand ziet.
4. **Maak hem, en download.** De frames worden gelezen, er wordt één palet van 256 kleuren gekozen voor de hele animatie, en elk frame wordt geschreven als alleen het deel van het beeld dat veranderde. Hij speelt op de pagina zodra hij klaar is, en dat is hetzelfde bestand dat de download je geeft.

## De uitgebreide versie

[Hoe je van een video een gif maakt](https://abox.tools/nl/gidsen/van-een-video-een-gif-maken/): Welk stuk, welke breedte en welke beeldsnelheid je kiest, waarom een gif van een video tien keer zo groot is als de video, en wanneer je er überhaupt een gebruikt.

## Ook in de gereedschapskist

- [GIF-maker](https://abox.tools/nl/gif-maken/): Maak van een stel plaatjes één animatie.
- [GIF-splitser](https://abox.tools/nl/gif-splitsen-in-frames/): Elk frame eruit, als eigen PNG.
- [GIF-analyse](https://abox.tools/nl/gif-analyseren/): Frames, vertragingen, paletten, en waar elke byte heen ging.
- [Afbeeldingen naar video](https://abox.tools/nl/afbeeldingen-naar-video/): Maak van een map vol afbeeldingen een video.

## Vragen

### Wordt mijn video ergens heen geüpload?

Nee. Je eigen browser leest, bemonstert en zet hem om, op je eigen hardware. Deze tool heeft geen serverkant, en in de `Content-Security-Policy` van de pagina staat elk adres dat hij mag benaderen, waarvan er geen enkele bij deze site hoort. Controleer je het liever dan dat je het aanneemt, trek dan de stekker uit je internet en maak er alsnog een gif van.

### Welke videoformaten kan ik omzetten?

Mp4, m4v en mov worden rechtstreeks gelezen, wat er ook in zit: H.264, HEVC, AV1 of VP9, zolang je browser die codec kan decoderen. Al het andere dat je browser kan afspelen, en dan denk je meteen aan WebM, wordt gelezen door de speler naar elk moment te laten springen. Dat gaat trager en het is iets minder precies over welk frame waar landt. Een bestand dat de browser niet kan lezen en ook niet kan afspelen, in de praktijk avi, wmv, flv en de meeste mkv's, wordt geweigerd met een melding die dat zegt, in plaats van halverwege te stranden.

### Waarom is mijn gif zo groot?

Omdat gif een formaat uit 1987 is dat hele plaatjes opslaat in plaats van beweging. Een gif van vijf seconden krijg je nooit zo klein als de mp4 van vijf seconden waar hij uit kwam, want een gif van een video is routineus tien keer zo groot als die video. Drie instellingen bepalen het werkelijk, in deze volgorde: hoe lang het stuk is, hoe breed het beeld is, en hoeveel beelden per seconde er zijn. Halveer je de breedte, dan vier je het aantal pixels, en het zijn nu juist de pixels die kosten.

### Waarom maar 256 kleuren?

Zo zit het formaat in elkaar. Een gif draagt één tabel van hoogstens 256 kleuren mee en slaat elke pixel op als een nummer daarin. Deze tool kiest die 256 door de kleuren in elk frame van je stuk te tellen en ze met mediaansnede, de standaardmethode, in 256 groepen te splitsen. Zo past het palet bij jouw filmpje in plaats van dat het een vaste set kleuren is. Waar een kleur ontbreekt, mengt het rasteren de twee dichtstbijzijnde, zodat een verloop een verloop blijft in plaats van dat er strepen ontstaan.

### Wat doet de rasterinstelling?

Die ruilt een beetje ruis in voor een hoop bandvorming. Zet je hem aan, dan blijft een lucht die anders vier vlakke banden zou worden een verloop, ten koste van een vage textuur en een groter bestand. Zet je hem uit, dan wordt het beeld vlakker en het bestand kleiner, en dat past bij schermopnames, lijntekeningen en alles wat al uit vlakke kleur bestaat. Het raster dat hier gebruikt wordt is geordend en niet van het foutdiffusietype, waardoor een onveranderde achtergrond tussen frames volkomen stil blijft in plaats van te flikkeren.

### Zit er een limiet op de lengte of de grootte?

Alleen het stuk is begrensd, en dan door het geheugen in plaats van door een regel. Terwijl het palet gekozen wordt, worden alle frames ervan tegelijk vastgehouden, dus rekent de pagina uit wat jouw instellingen zouden kosten en zegt ze dat voordat je begint. Weigeren doet ze liever dan het tabblad zonder geheugen te laten vallen. Een korter stuk, een kleinere breedte of een lagere beeldsnelheid brengen het allemaal omlaag.

### Blijft het geluid behouden?

Een gif kan geen geluid meedragen. Er bestaat geen versie van het formaat met audio, en dat is de belangrijkste reden dat het web gifs grotendeels vervangen heeft door stille video in een lus. Doet het geluid ertoe, hou dan de video aan: de [Videoknipper](https://abox.tools/nl/video-knippen/) knipt er een stuk uit zonder ook maar één frame opnieuw te coderen.

### Is het gratis, en heb ik er een account voor nodig?

Het is gratis, en er komt geen account, geen inlog, geen proefperiode en geen watermerk aan te pas. De site draait op advertenties, en die betalen hem. Die advertenties krijgen niets over je video mee.

## Hoe je de privacybelofte controleert

- **Je video's kunnen nergens heen.** In de Content-Security-Policy staat elk adres dat deze pagina mag benaderen, en geen daarvan hoort bij deze site. Er is hier geen eindpunt waar je bestand verzameld zou kunnen worden, en in de code staat niets wat het zou versturen als dat eindpunt er wel was.
- **Niets hier haalt iets op.** Deze tool heeft helemaal geen netwerkfunctie: geen adres om te plakken, niets om te downloaden, geen engine die bij het eerste gebruik opgehaald wordt. Elke byte die je video aanraakt, kwam bij het laden van de pagina van deze herkomst.
- **Het decoderen gebeurt hier.** De frames gaan door WebCodecs in je eigen browser, of door dezelfde afspeelmotor die je het filmpje toch al zou tonen. Welke van de twee het geworden is staat boven aan de pagina, omdat het verandert hoe de frames gekozen worden en je dat hoort te kunnen zien.
- **De gif wordt hier geschreven, in code die je kunt lezen.** Het palet, het rasteren en de LZW-compressie beslaan zo'n zeshonderd regels in de eigen map van deze tool. Er is geen encoderdienst, geen bibliotheek die tijdens het draaien opgehaald wordt, en nergens een plek waar een plaatje heen gestuurd zou kunnen worden.
- **Wat Google laadt, en wat het niet te zien krijgt.** De advertentie- en meetscripts komen van Google. Geen van beide krijgt iets over je video mee: geen bestand, geen frame, geen naam, geen grootte, geen lengte, en niet het stuk dat je markeerde. Elke regel die leest, bemonstert, kwantiseert of codeert, wordt vanaf deze herkomst geserveerd en staat in de repository.
- **Wat de doneerknop laadt, en wat hij niet te zien krijgt.** De knop “Buy me a coffee” in de kop wordt getekend door een script van cdnjs.buymeacoffee.com en haalt zijn letters bij Google Fonts. Het is een link en verder niets. Hij meldt geen bezoek en krijgt niets over jou of je video mee.
- **Het werkt offline.** Verbreek de verbinding en alles op deze pagina doet het nog. Eenvoudiger bewijs bestaat er niet.

**Controleer het zelf.** Je hoeft niets van het bovenstaande op ons woord aan te nemen. Een buildscript maakt deze pagina uit de sjablonen en de configuratie in de repository, en dat script kun je lezen en zelf draaien. Het resultaat staat vastgelegd op de branch `dist`, dus je kunt wat er geserveerd wordt vergelijken met wat een build van de bronnen oplevert: https://github.com/A-Box-of-Tools/website

De bestanden die je als eerste wilt lezen zijn `config/site.toml` voor de Content-Security-Policy, `src/frames.js` voor de twee manieren waarop de frames uit een video gelezen worden, `src/quantize.js` voor het palet, en `src/gif.js` voor het bestand zelf, LZW en al. Geen ervan importeert iets wat een verzoek kan doen.
