# Video achteruit — een video achterstevoren afspelen

Laatste frame eerst, geluid en al.

> Speel een MP4, MOV of WebM achterstevoren af, met het geluid ook omgekeerd. Draait in je browser: er wordt niets geüpload, er komt geen watermerk aan te pas en het werkt offline.

Deze pagina is een interactief hulpmiddel dat volledig in je browser draait, op https://abox.tools/nl/video-achteruit-afspelen/ — niets van wat je het geeft wordt geüpload. Hieronder staat alles wat de pagina er in woorden over zegt; om het te gebruiken, open je het adres.

## Je video's worden **nooit geüpload**. Er is geen server.

Elk frame wordt door je eigen browser gedecodeerd, omgedraaid en opnieuw gecodeerd, op je eigen hardware. Niets hier kan iets ophalen of versturen, want er zit helemaal geen netwerkfunctie in deze tool. En al was die er wel, dan zit er aan de andere kant van deze pagina nog steeds geen server waar een video naartoe kan.

- ✗ Geen upload
- ✗ Geen account
- ✗ Geen watermerk
- ✓ Keert het geluid om
- ✓ Werkt offline

## Zo speel je een video achteruit af

1. **Kies een video.** Sleep een MP4, MOV, M4V of WebM op de kiezer, of zoek er met de hand een op. De browser leest hem rechtstreeks van je schijf, en er gaat ondertussen niets ergens heen.
2. **Beslis wat er met het geluid gebeurt.** “Het geluid ook omkeren” draait het spoor sample voor sample om, en dat is wat spraak eruit laat komen als spraak die achterstevoren speelt in plaats van als stilte. Zet het uit voor een stille clip, wat bovendien sneller gaat.
3. **Beslis hoeveel kwaliteit je uitgeeft.** Het beeld moet opnieuw gecodeerd worden, want de frames komen in een volgorde naar buiten waar niets in het bestand voor gecodeerd was. “In balans” blijft dicht bij wat het origineel uitgaf; “Beste kwaliteit” geeft meer uit.
4. **Keer hem om en download.** Het werk gebeurt op je eigen hardware, dus hoe lang het duurt hangt af van je machine en niet van een wachtrij. De klaargemaakte video gaat rechtstreeks naar de downloads van je browser.

## De uitgebreide versie

[Een video achteruit afspelen](https://abox.tools/nl/gidsen/een-video-achteruit-afspelen/): Een clip achterstevoren afspelen: wat omkeren met het beeld en het geluid doet, waarom het niet zonder hercoderen kan, waarom het trager is dan inkorten, en wat je eerst moet doen.

## Ook in de gereedschapskist

- [Timelapsemaker](https://abox.tools/nl/timelapse-maken/): Een uur beeldmateriaal in twintig seconden.
- [Framegrabber](https://abox.tools/nl/frame-uit-video-halen/): Een stilstaand beeld op volle kwaliteit, van elk moment.
- [Video naar gif](https://abox.tools/nl/video-naar-gif/): Kies het stuk, het formaat en de beeldsnelheid.
- [GIF-maker](https://abox.tools/nl/gif-maken/): Maak van een stel plaatjes één animatie.

## Vragen

### Wordt mijn video ergens naartoe geüpload?

Nee. Hij wordt gelezen, gedecodeerd, omgekeerd en gecodeerd door je eigen browser op je eigen hardware. Deze tool heeft geen serverkant, en de `Content-Security-Policy` van de pagina noemt elk adres dat ze mag benaderen: geen daarvan is van ons. Wil je het liever controleren dan aannemen, trek dan de stekker uit je internet en keer alsnog een clip om.

### Welke videoformaten kan ik omkeren?

MP4, M4V en MOV worden rechtstreeks gelezen, wat er ook in zit: H.264, HEVC, AV1 of VP9, zolang je browser die codec kan decoderen. Al het andere dat je browser kan afspelen, WebM voorop, wordt omgekeerd door de eigen speler van de browser achterstevoren door de clip te stappen. Dat werkt, maar is trager. Een bestand dat de browser niet kan lezen én niet kan afspelen, in de praktijk AVI, WMV, FLV en de meeste MKV's, wordt geweigerd met een bericht dat dat zegt in plaats van halverwege te stranden. Wat eruit komt is altijd een MP4.

### Wordt het geluid ook omgekeerd?

Ja, tenzij je het uitzet. Het hele spoor wordt gedecodeerd, de samples worden in de andere volgorde gezet en het wordt opnieuw als AAC gecodeerd. Die tweede codering is niet te vermijden: een audiopakket is een paar tientallen milliseconden geluid, gecodeerd tegen het pakket ervoor, dus de pakketten achterstevoren wegschrijven zou korte stukjes vooruit afspelen in de verkeerde volgorde, en dat klinkt als een defect en niet als een omkering.

### Kost omkeren kwaliteit?

Het beeld wordt een tweede keer gecodeerd, en dat kost een beetje. Hier is dat niet te vermijden zoals bij inkorten wel kan: een omgekeerde clip toont zijn frames in een volgorde waar niets in het oorspronkelijke bestand voor gecodeerd was, dus elk frame moet opnieuw geschreven worden. Wat de tool niet doet, is méér uitgeven dan het origineel deed, want daarboven coderen maakt het bestand alleen groter zonder dat het er beter uitziet.

### Zit er een limiet op de grootte of de lengte van de video?

Er zit geen limiet in de tool, en het bestand wordt niet in één keer in het geheugen gelezen: het wordt groep frames voor groep frames achterstevoren doorlopen. De echte plafonds zijn de klaargemaakte video, die in het geheugen wordt samengesteld voordat je hem downloadt, en het geluid, dat heel moet blijven omdat omkeren de laatste sample nodig heeft voordat het de eerste kan wegschrijven.

### Waarom duurt het bij het ene bestand langer dan bij het andere?

Omdat er twee ingangen zijn. Een MP4 of MOV wordt door deze tool zelf gelezen en groep frames voor groep frames gedecodeerd, en dat gaat zo snel als je machine gaat. Al het andere wordt omgekeerd door de eigen speler van de browser om het ene moment van de clip na het andere te vragen, en elk van die sprongen dwingt de browser om vanaf het keyframe ervoor te decoderen. De pagina zegt welke van de twee ze gebruikt, en waarom, voordat je begint.

### Kan ik maar een stuk van een clip omkeren?

Hier niet. Deze tool keert het hele ding om: de clip die eruit komt duurt precies even lang als de clip die erin ging, met het laatste frame eerst. Knip eerst het stuk dat je wilt met de [Videoknipper](https://abox.tools/nl/video-knippen/), die dat doet zonder ook maar één frame opnieuw te coderen, en keer daarna om wat daaruit komt.

### Is het gratis, en heb ik een account nodig?

Het is gratis, en er komt geen account, geen inlog, geen proefperiode en geen watermerk aan te pas. De site draait op advertenties, en die betalen hem; die advertenties krijgen niets over je video mee.

## Hoe je de privacybelofte controleert

- **Je video's kunnen nergens heen.** In de Content-Security-Policy staat elk adres dat deze pagina mag benaderen, en geen daarvan is van ons. Er is hier geen eindpunt waar je bestand verzameld zou kunnen worden, en er staat ook niets in de code dat het daarheen zou sturen als dat er wel was.
- **Niets hier haalt iets op.** Deze tool heeft helemaal geen netwerkfunctie: geen adres om te plakken, niets om te downloaden, geen engine die bij het eerste gebruik binnenkomt. Elke byte die je video aanraakt kwam van deze herkomst toen de pagina laadde.
- **Het decoderen en coderen gebeuren lokaal.** De frames gaan door WebCodecs in je eigen browser, of door dezelfde afspeelmotor die je de clip toch al zou laten zien. Het klaargemaakte bestand wordt in het geheugen van dit apparaat opgebouwd en gaat rechtstreeks naar een download.
- **Het geluid wordt hier ook omgedraaid.** Een spoor omkeren betekent het decoderen, en dat decoderen is dat van de browser zelf, op dit apparaat. Niets luistert mee, niets bewaart het en niets zou het ergens heen kunnen doorgeven: er is hier geen enkel pad in de code dat een byte verstuurt.
- **Wat Google laadt, en wat het niet te zien krijgt.** De advertentie- en meetscripts komen van Google. Geen van beide krijgt iets over je video mee: geen bestand, geen frame, geen naam, geen grootte en geen lengte. Elke regel die leest, decodeert, omkeert of codeert wordt vanaf deze herkomst geserveerd en staat in de repository.
- **Wat de doneerknop laadt, en wat die niet te zien krijgt.** De knop “Buy me a coffee” in de kop wordt getekend door een script van cdnjs.buymeacoffee.com en haalt zijn letters bij Google Fonts. Het is niet meer dan een link: hij meldt geen bezoek en krijgt niets over jou of je video mee.
- **Het werkt offline.** Verbreek de verbinding en alles op deze pagina blijft werken. Eenvoudiger bewijs bestaat er niet.

**Controleer het zelf.** Je hoeft niets van het bovenstaande op ons woord aan te nemen. Een buildscript maakt deze pagina uit de sjablonen en de configuratie in de repository, en dat script kun je lezen en zelf draaien. Het resultaat staat vastgelegd op de branch `dist`, dus je kunt wat er geserveerd wordt vergelijken met wat een build van de bronnen oplevert: https://github.com/A-Box-of-Tools/website

De bestanden die je als eerste wilt lezen zijn `config/site.toml` voor de Content-Security-Policy, `src/timeline.js` voor het rekenwerk dat bepaalt welk frame wanneer naar buiten komt, en `src/reverse.js` voor de lus die het bestand achterstevoren doorloopt, groep frames voor groep frames. Geen van alle importeert iets dat een verzoek kan doen.
