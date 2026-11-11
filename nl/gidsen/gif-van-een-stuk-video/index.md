# Zo maak je een GIF van een deel van een video

Een GIF van de hele clip is enorm, en bijna alles erin wilde niemand zien. Het werk bestaat eigenlijk uit twee beslissingen — welke seconden, en dan welke instellingen — en allebei gebeuren ze op je eigen machine, want geen van beide tools uploadt iets.

Laatst bijgewerkt 26 augustus 2026

## Het korte antwoord

Voor één doorlopend moment open je de [Video-naar-GIF-omzetter](https://abox.tools/nl/video-naar-gif/), sleep je de video erin en markeer je het stuk op zijn tijdlijn — hij zet alleen om wat tussen de markeringen staat, dus er valt vooraf niets te knippen. Kies een breedte en een beeldsnelheid, en exporteer.

Voor alles wat meer is dan één moment — twee doelpunten uit dezelfde wedstrijd, de aanloop en de clou — zet je de clip eerst in elkaar met de [Videosnijder](https://abox.tools/nl/video-knippen/) en geef je het resultaat daarna aan de omzetter. De snijder voegt zoveel gemarkeerde stukken als je wilt samen tot één bestand zonder ze opnieuw te coderen: die eerste stap kost niets aan kwaliteit en een paar seconden tijd.

De overdracht is één klik: zodra de snijder heeft geëxporteerd, biedt een rij onder de downloadknop aan het resultaat rechtstreeks mee te nemen naar de omzetter, en de clip staat daar al klaar — niets opslaan en opnieuw slepen ertussen.

In beide gevallen is de volgorde dezelfde: eerst over de seconden beslissen, dan de instellingen uitgeven. De rest van deze pagina legt uit waarom die volgorde bij een GIF zoveel zwaarder telt dan bij al het andere dat deze site maakt.

## Waarom elke seconde GIF zo duur is

Een GIF is geen video. Het is een stapel complete plaatjes, elk uit een palet van hooguit 256 kleuren, gecomprimeerd met een methode uit 1987 die niets van beweging weet. Een moderne codec beschrijft wat er tussen beelden *veranderde*; een GIF herhaalt grotendeels wat hetzelfde bleef.

Het praktische gevolg: een GIF van tien seconden, 480 pixels breed, op 12 beelden per seconde weegt doorgaans 5 tot 10 MB — tien keer dezelfde clip als MP4, tegen een fractie van de kwaliteit. De omzetter kan er niets aan doen; zo is het formaat. De [gids over GIF-conversie](https://abox.tools/nl/gidsen/van-een-video-een-gif-maken/) behandelt wanneer een GIF nog de moeite waard is, en wanneer een geluidloze video in een lus beter dient.

Omdat de grootte met elk beeld groeit, zijn hele seconden de goedkoopste megabytes om te besparen. De breedte halveren deelt de grootte ruwweg door vier; de beeldsnelheid halveren deelt hem ruwweg door twee; maar beelden wegknippen die er nooit hadden moeten zijn bespaart hun volle kosten en maakt het resultaat beter — een GIF die bij de actie begint, leest beter dan een die er twee seconden naartoe loopt.

## Wanneer de tijdlijn van de omzetter genoeg is

De tijdlijn van de omzetter markeert één stuk: een begin, een einde, en alles daartussen wordt de GIF. Is het moment dat je wilt doorlopend — hoe lang ook — dan is dat het hele werk, en de snijder ervoor zou dezelfde twee markeringen alleen een tweede huis geven.

Zet de markeringen liever een tikje te strak dan een tikje te los. Een lus verbergt haar naad wanneer het laatste beeld dicht bij het eerste ligt, en elk beeld dat je van de uiteinden afschaaft, betaalt zich terug in bestandsgrootte.

![De sectiekaart: een videobeeld met tijdcode, en in- en uitpunten gemarkeerd op elf en veertien seconden op de balk eronder.](https://abox.tools/screens/make-a-gif-from-part-of-a-video/marks.webp)

De omzetter heeft eigen in- en uitpunten, en voor een stukje van drie seconden uit een langer filmpje zijn die op zichzelf genoeg.

## Wanneer je eerst knipt met de Videosnijder

De snijder verdient zijn plek zodra de GIF meer dan één stuk nodig heeft:

- **Meerdere momenten, één GIF.** Markeer elk stuk met `I` en `O` terwijl de video speelt, herschik als het beste stuk voorop hoort, en exporteer één bestand. De stukken worden gekopieerd, niet opnieuw gecodeerd: het samenvoegen verliest niets.
- **Twee video's, één GIF.** De snijder neemt meer dan één bestand en voegt gemarkeerde stukken over de bestanden heen samen — hij kopieert waar de bestanden het over hun formaat eens zijn, codeert opnieuw waar niet, en zegt welke van de twee hij deed.
- **Je wilt de clip ook als video.** De samengestelde MP4 is het bewaren waard: kleiner en scherper dan elke GIF die eruit komt, en het juiste om te posten overal waar video afspeelt.

Sleep daarna de samengestelde clip in de omzetter en markeer niets: het hele bestand is nu precies de GIF die je bedoelde.

## De instellingen uitgeven

Met de seconden beslist, bepalen drie knoppen de grootte, op volgorde van wat ze kosten:

- **Breedte.** De grootste hefboom. 480 pixels is ruim genoeg voor een chat of een forum; 320 leest nog prima bij schermopnames zonder tekst. De grootte daalt met het kwadraat van de breedte.
- **Beeldsnelheid.** 10 tot 12 beelden per seconde is waar de meeste GIF's wonen; beweging leest nog, en het bestand halveert tegenover 25. Onder de 8 begint het op een diavoorstelling te lijken.
- **Dithering.** Met 256 kleuren gaan zachte verlopen strepen vertonen. Geordende dithering ruilt die strepen voor een fijn patroon; dat oogt meestal beter en comprimeert iets slechter. Probeer de export op beide manieren — het is jouw machine die werkt, dus een tweede poging kost niets en uploadt niets.

## Als je dit elke week doet

Dat de twee stappen hier op twee pagina's wonen is opzet — elke pagina doet één klus, en elke kan op zichzelf bewijzen dat niets je machine verlaat. Maar alles wat beide pagina's uitvoeren is open source: MIT-licentie, één map per tool, ES-modules zonder afhankelijkheden met een README die elke module benoemt.

Dus als dezelfde keten bij je week hoort, hoef je haar niet telkens met de hand af te lopen. Zet een codeeragent op de [repository](https://github.com/A-Box-of-Tools/website) en vraag hem de segmentlogica van de snijder en de GIF-encoder samen te stellen tot één pagina voor precies jouw geval. De modules zijn geschreven om gelezen te worden, en ze meenemen is precies waar de licentie voor is.
