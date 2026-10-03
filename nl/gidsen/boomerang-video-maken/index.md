# Zo maak je een boomerangvideo

Een boomerang is een clip die vooruit speelt, dan achteruit, en dat in een lus. Geen tool hier heeft een boomerangknop; hij ontstaat uit drie tools die elk hun ene klus doen — knippen, omkeren, samenvoegen — en de hele keten draait op je eigen machine.

Laatst bijgewerkt 26 augustus 2026

## Het korte antwoord

1. **Knip het moment.** Open de [Videosnijder](https://abox.tools/nl/video-knippen/), markeer de seconde of twee die heen en weer moeten zwaaien, en exporteer ze als eigen clip.
2. **Keer een kopie om.** Sleep die clip in de [Video-omkeerder](https://abox.tools/nl/video-achteruit-afspelen/), laat het geluid weg en exporteer. Nu heb je hetzelfde moment twee keer, één keer per richting.
3. **Voeg de twee samen.** Terug in de Videosnijder sleep je beide bestanden erin, markeer je elk in zijn geheel, zet je de voorwaartse versie voorop en exporteer je één bestand.

Geen van de sprongen heeft tussendoor een download nodig: na elke export biedt een rij onder de downloadknop aan het resultaat rechtstreeks mee te nemen naar het volgende gereedschap — de omkeerder na de eerste knip, de snijder weer na de omkering — en het bestand staat daar al klaar.

Dat bestand is de boomerang. Post het zoals het is overal waar geluidloze video in een lus draait, of haal het door de [Video-naar-GIF-omzetter](https://abox.tools/nl/video-naar-gif/) als de bestemming alleen GIF's animeert. Elke stap gebeurt in je browser; niets uit deze keten wordt geüpload, op geen enkel punt, naar niemand.

## Waarom eerst knippen

Omkeren moet elk beeld dat het aanraakt decoderen en opnieuw coderen — de [gids over omkeren](https://abox.tools/nl/gidsen/een-video-achteruit-afspelen/) legt uit waarom er geen goedkopere weg is. Knippen daarentegen is bijna gratis: de snijder geeft hele beelden door zonder ze opnieuw te coderen.

De volgorde is dus de hele truc. Keer een clip van twee seconden om en de dure stap werkt op twee seconden; keer het origineel om en hij werkt op alles, waarvan je het meeste zo weggooit. Bij een telefoonopname van welke lengte ook is eerst knippen het verschil tussen een boomerang in minder dan een minuut en een voortgangsbalk waar je achter zit.

Knip strak. Een boomerang leest het best wanneer hij over één beweging zwaait — een sprong, een plons, een draai — en elk beeld dat je houdt wordt twee keer betaald, één keer per richting.

![De videoknipper met een stuk gemarkeerd tussen drie en vijf komma zes seconden, en een tabel met begin, eind en lengte.](https://abox.tools/screens/make-a-boomerang-video/section.webp)

Een seconde of twee, meer is een boomerang niet. Eerst knippen houdt het omkeren goedkoop, en in de tabel wordt de lengte bepaald.

## Wat er met het geluid moet

Laat het weg, en doe dat bij de omkeerstap — de omkeerder heeft daar precies een vinkje voor. Het geluid van een boomerang zou vooruit spelen en dan achteruit; omgekeerd geluid klinkt onmiskenbaar vreemd, en bijna elke plek waar een boomerang belandt, speelt hem toch gedempt af. Zonder geluid gaat het omkeren bovendien sneller en worden beide bestanden kleiner.

Houd je het toch, dan voegt de snijder de twee clips nog steeds samen — maar de naad die het oog vergeeft, vergeeft het oor niet.

## Het samenvoegen, en wat de snijder je vertelt

De twee samengevoegde bestanden zijn naaste familie — het ene is uit het andere gemaakt — maar ze zijn door verschillende encoders gegaan en hoeven het byte voor byte niet eens te zijn over hun formaat. De snijder controleert dat. Waar de twee overeenkomen kopieert hij de beelden rechtstreeks; waar niet, codeert hij één keer opnieuw en zegt dat op het exportpaneel, in plaats van je te laten raden.

Orden de delen voor het exporteren: vooruit eerst, omgekeerd daarna. Een boomerang die met de terugzwaai begint, leest als een vergissing.

Eén verfijning die de extra tien seconden waard is: knip één beeld van het begin van de omgekeerde clip voordat je samenvoegt. Het laatste beeld van de heenweg en het eerste van de terugweg zijn hetzelfde plaatje, en het twee keer tonen laat de bocht een tel haperen.

![De omkeertool: een samenvatting met de uitvoergrootte, de lengte en het aantal frames, en een schakelaar voor het geluid.](https://abox.tools/screens/make-a-boomerang-video/reverse.webp)

De tweede helft. De geluidsschakelaar telt hier zwaarder dan waar ook, om de reden die de sectie hierboven geeft.

## Video of GIF aan het eind

Houd de MP4 als de bestemming video afspeelt — die is veel kleiner, veel scherper, en lust net zo goed. Zet alleen om naar GIF als de plek er een eist, en let dan op de meter: een GIF betaalt elk beeld, en een boomerang is zijn clip twee keer. De [gids over de deel-GIF](https://abox.tools/nl/gidsen/gif-van-een-stuk-video/) behandelt de hefbomen breedte en beeldsnelheid die hem onder een groottelimiet houden.

## Als je dit elke week doet

Drie pagina's voor één effect is opzet — elke tool doet één klus, en elke pagina kan op zichzelf bewijzen dat je beelden de machine nooit verlaten. Maar alle drie zijn open source: MIT-licentie, één map per tool, ES-modules zonder afhankelijkheden onder `src/`, met README's die ze uitleggen.

Horen boomerangs vast bij je werk, zet dan een codeeragent op de [repository](https://github.com/A-Box-of-Tools/website) en vraag hem de beeldenloop van de omkeerder en het samenvoegen van de snijder te vouwen tot één pagina met één knop. De modules zijn geschreven om gelezen te worden, en ze meenemen is precies waar de licentie voor is.
