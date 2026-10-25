# Zo maak je van een lange video een timelapse

Een uur zonsondergang, een dag op de bouwplaats, de dagelijkse rit door de voorruit: beeld dat de moeite waard is, op een snelheid waar niemand naar blijft kijken. Het werk is één beslissing over tijd en één over de bestemming, en alles draait in je browser, op een bestand dat je machine nooit verlaat.

[Open de tool Timelapsemaker](https://abox.tools/nl/timelapse-maken/): Een uur beeldmateriaal in twintig seconden.

Laatst bijgewerkt 26 augustus 2026

## Het korte antwoord

Open de [Timelapse-maker](https://abox.tools/nl/timelapse-maken/), sleep de opname erin, en stel óf een snelheid in — alles van 1,1× tot 1000× — óf, zonder te rekenen, hoe lang het resultaat moet duren. Zestig seconden is een goed vertrekpunt voor alles wat een feed in gaat. Kies de beelden per seconde, verklein als het origineel 4K is, en exporteer.

Als de bestemming alleen GIF's animeert, haal de geëxporteerde clip dan daarna door de [Video-naar-GIF](https://abox.tools/nl/video-naar-gif/)-omzetter; maar lees eerst de laatste sectie, want een timelapse is het duurste dat je een GIF kunt laten dragen.

Die reis is ingebouwd: na de export biedt een rij onder de downloadknop aan het resultaat rechtstreeks mee te nemen naar de omzetter, en de clip staat daar al klaar.

## Zeg de duur, niet de snelheid

"Hoe snel" is de verkeerde vraag, want het eerlijke antwoord is een deelsom die je niet zou moeten hoeven maken: negentig minuten beeld in één minuut resultaat is 90×; een bouwdag in dertig seconden zit dichter bij 3000× dan bij wat een schuifje suggereert. Het gereedschap neemt de einduur rechtstreeks aan en rekent de factor zelf uit, zodat het antwoord de dag overleeft waarop je er een langere opname in gooit.

Waar een snelheidsfactor nog wél voor dient, zijn de kleine getallen. Tussen 1,1× en 2× blijft een video *kijkbaar als video* — een college, een demonstratie — en boven ongeveer 8× houdt hij op versneld afspelen te zijn en wordt hij een timelapse, waarin elk uitvoerbeeld een monster is dat uit de tijdstroom is geplukt en alles tussen de monsters er simpelweg niet meer is.

Dat bemonsteren is ook waarom het werk snel is. Het gereedschap leest alleen de momenten die de uitvoer nodig heeft — bij 100× zo'n honderdste van het bestand — in plaats van een uur te decoderen om er een minuut van te houden.

![De snelheidskaart: een snelheid van twintig keer, de lengte die daaruit volgt, het interval tussen de frames die blijven, en een framesnelheid.](https://abox.tools/screens/turn-a-long-video-into-a-timelapse/speed.webp)

Noem de lengte die je wilt en de snelheid volgt, of andersom. Het interval is het getal dat zegt hoeveel van het origineel wordt overgeslagen.

## Beelden en formaat, in het kort

- **Beelden per seconde.** 30 leest als vloeiende beweging voor bijna alles; 60 verdient zijn dubbele gewicht alleen als de beweging het onderwerp is, en 24 geeft wolken en mensenmassa's een prettige filmtik.
- **Formaat.** Een timelapse wordt bijna altijd klein bekeken. 4K terugbrengen naar 1080p kwart de pixels die de encoder moet beschrijven, en op een telefoonscherm zal niemand het ooit weten.

![De samenvatting van de exportkaart: het aantal frames, het interval, de uiteindelijke lengte, de geschatte grootte en hoeveel van het bestand gelezen moet worden.](https://abox.tools/screens/turn-a-long-video-into-a-timelapse/summary.webp)

De laatste regel is de opvallende: een timelapse leest een fractie van het bestand, en daarom is dit snel bij een filmpje dat een uur zou kosten om opnieuw te coderen.

## Wanneer de timelapse een GIF wil zijn

Bijna nooit. Een timelapse is voortdurende verandering van het hele beeld — precies waar GIF-compressie het slechtst in is — dus zelfs een korte komt in de tientallen megabytes terecht terwijl de MP4 een tiende daarvan weegt, scherper. Plaats de video overal waar video afspeelt.

Als de bestemming werkelijk alleen GIF's animeert, knip de reeks dan terug tot een paar seconden die rondlopen in de [tijdlijn van de omzetter](https://abox.tools/nl/video-naar-gif/), houd de breedte bescheiden en laat de beelden zakken naar ⁦10–12⁩. De [gids voor de deel-GIF](https://abox.tools/nl/gidsen/gif-van-een-stuk-video/) is de lange versie van dat budget.

## Als je dit elke week doet

Dat de twee stappen hier op twee pagina's wonen is opzet: elke pagina doet één klus, en elke kan in z'n eentje bewijzen dat niets je machine verlaat. Maar alles wat de twee pagina's uitvoeren is open source: MIT-licentie, één map per gereedschap, ES-modules zonder dependencies met een README die ze stuk voor stuk benoemt.

Als een camera op statief bij je routine hoort, wijs dan een code-agent naar de [repository](https://github.com/A-Box-of-Tools/website) en vraag hem de bemonstering en de GIF-encoder samen te vouwen tot één pagina met jouw snelheid en jouw formaat al ingesteld. De modules zijn geschreven om gelezen te worden, en ze meenemen is precies waar de licentie voor bestaat.
