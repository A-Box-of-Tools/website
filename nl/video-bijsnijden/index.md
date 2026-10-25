# Video bijsnijden — online een video bijsnijden

Snijd een filmpje terug tot het stuk waar het om gaat.

> Snijd een mp4, mov of WebM bij naar elke vorm: vierkant, 9:16 of een exact pixelkader. Draait in je browser, uploadt niets, houdt het geluid en werkt offline.

Deze pagina is een interactief hulpmiddel dat volledig in je browser draait, op https://abox.tools/nl/video-bijsnijden/ — niets van wat je het geeft wordt geüpload. Hieronder staat alles wat de pagina er in woorden over zegt; om het te gebruiken, open je het adres.

## Je video's worden **nooit geüpload**. Er is geen server.

Je eigen browser decodeert, snijdt en codeert elk frame, op je eigen hardware. Niets hier kan iets ophalen of versturen, want er zit helemaal geen netwerkfunctie in deze tool. En al was die er wel, dan stond aan de andere kant van deze pagina nog steeds geen server om een video naartoe te sturen.

- ✗ Geen upload
- ✗ Geen account
- ✗ Geen watermerk
- ✓ Houdt het geluid
- ✓ Werkt offline

## Zo snijd je een video bij

1. **Kies een video.** Sleep een mp4, mov, m4v of WebM het vak in, of kies er een met de hand. De browser leest hem rechtstreeks van je schijf, en er gaat ondertussen niets ergens heen.
2. **Sleep het kader over het stuk dat je wilt houden.** Sleep binnen het kader om het te verplaatsen en aan een hoek om het formaat te wijzigen. Zet het eerst vast op een vorm, bijvoorbeeld 1:1 voor een vierkante post, 9:16 voor een telefoon of 16:9 voor een breed beeld. Of tik een exact pixelkader in de vier velden eronder. Speel de clip af, of sleep de schuif eronder, om het frame te kiezen waarop je het kader uitlijnt.
3. **Kies hoeveel kwaliteit eraan opgaat.** Het beeld moet opnieuw gecodeerd worden, want een bijgesneden frame is een ander beeld. Met “In balans” blijft het dicht bij wat het bestand al aan dat gebied uitgaf, en met “Beste kwaliteit” gaat er meer aan op. Het geluid blijft staan, tenzij je het uitzet.
4. **Snijd hem bij en download.** Het werk gebeurt op je eigen hardware, dus hoe lang het duurt hangt van je apparaat af en niet van een wachtrij. De gereedgekomen video gaat rechtstreeks naar de downloads van je browser.

## De uitgebreide versie

[Hoe je een video naar een andere vorm bijsnijdt](https://abox.tools/nl/gidsen/een-video-bijsnijden/): Snijd een filmpje terug naar een vierkant, een staande 9:16, of een exact pixelkader. Welke verhouding elk platform wil, waarom bijsnijden wel moet hercoderen en inkorten niet, en wat dat kost.

## Ook in de gereedschapskist

- [Video-omkeerder](https://abox.tools/nl/video-achteruit-afspelen/): Laatste frame eerst, geluid en al.
- [Timelapsemaker](https://abox.tools/nl/timelapse-maken/): Een uur beeldmateriaal in twintig seconden.
- [Framegrabber](https://abox.tools/nl/frame-uit-video-halen/): Een stilstaand beeld op volle kwaliteit, van elk moment.
- [Video naar gif](https://abox.tools/nl/video-naar-gif/): Kies het stuk, het formaat en de beeldsnelheid.

## Vragen

### Wordt mijn video ergens heen geüpload?

Nee. Je eigen browser leest, decodeert, snijdt en codeert hem op je eigen hardware. Deze tool heeft geen serverkant, en in de `Content-Security-Policy` van de pagina staat elk adres dat hij mag benaderen, waarvan er geen enkele bij deze site hoort. Controleer je het liever dan dat je het aanneemt, trek dan de stekker uit je internet en snijd er alsnog een bij.

### Welke videoformaten kan ik bijsnijden?

Mp4, m4v en mov worden rechtstreeks gelezen, wat er ook in zit: H.264, HEVC, AV1 of VP9, zolang je browser die codec kan decoderen. Al het andere dat je browser kan afspelen, en dan denk je meteen aan WebM, wordt bijgesneden door het af te spelen en het resultaat op te nemen. Dat werkt, maar het duurt zo lang als het filmpje zelf. Een bestand dat de browser niet kan lezen en ook niet kan afspelen, in de praktijk avi, wmv, flv en de meeste mkv's, wordt geweigerd met een melding die dat zegt, in plaats van halverwege te stranden.

### Zit er een limiet op de grootte of de lengte van de video?

In de tool zit geen limiet ingebouwd, en het bestand gaat ook niet in één keer het geheugen in, want er wordt een paar megabyte tegelijk doorheen gelopen. Het praktische plafond is de gereedgekomen video, die in het geheugen wordt opgebouwd voordat je hem downloadt, plus de tijd die je apparaat nodig heeft om hem te coderen.

### Blijft het geluid intact?

Op de mp4-route precies. De audio gaat monster voor monster over zonder ooit gedecodeerd te worden, dus het is byte voor byte wat er in het bestand zat. Op de opnameroute wordt hij van de weergave opgevangen en opnieuw gecodeerd, en dat kost een beetje kwaliteit. Hoe dan ook staat er een vinkje klaar om hem er helemaal uit te laten.

### Kost bijsnijden kwaliteit?

Het beeld wordt opnieuw gecodeerd, want een bijgesneden frame is een ander beeld en er bestaat geen manier om het op te slaan zonder de pixels opnieuw weg te schrijven. Wat de tool niet doet, is meer uitgeven dan het origineel aan datzelfde gebied uitgaf, omdat hercoderen daarboven het bestand alleen groter maakt zonder dat het er beter uitziet.

### Kan ik hem ook korter maken?

Hier niet, maar hiernaast wel. Deze tool verandert de vorm van het beeld en verder niets. Het filmpje dat eruit komt is precies zo lang als dat wat erin ging, met zijn timing en zijn geluid intact. Inkorten is een andere klus en dus ook een andere tool: de [Videoknipper](https://abox.tools/nl/video-knippen/) markeert de stukken van een filmpje die het bewaren waard zijn en slaat ze op als één bestand, zonder ook maar één frame opnieuw te coderen.

### Waarom gaan de breedte en de hoogte met stappen van twee?

H.264, de codec in een mp4, slaat het beeld in blokken op en kan een frame met een oneven aantal pixels op een zijde eenvoudigweg niet beschrijven. In plaats van je bijsnijding stilletjes af te ronden nadat je hem hebt ingesteld, biedt het kader van meet af aan alleen even getallen aan.

### Is het gratis, en heb ik er een account voor nodig?

Het is gratis, en er komt geen account, geen inlog, geen proefperiode en geen watermerk aan te pas. De site draait op advertenties, en die betalen hem. Die advertenties krijgen niets over je video mee.

## Hoe je de privacybelofte controleert

- **Je video's kunnen nergens heen.** In de Content-Security-Policy staat elk adres dat deze pagina mag benaderen, en geen daarvan hoort bij deze site. Er is hier geen eindpunt waar je bestand verzameld zou kunnen worden, en in de code staat niets wat het zou versturen als dat eindpunt er wel was.
- **Niets hier haalt iets op.** Deze tool heeft helemaal geen netwerkfunctie: geen adres om te plakken, niets om te downloaden, geen engine die bij het eerste gebruik opgehaald wordt. Elke byte die je video aanraakt, kwam bij het laden van de pagina van deze herkomst.
- **Het decoderen en coderen gebeuren allebei hier.** De frames gaan door WebCodecs in je eigen browser, of door dezelfde afspeelmotor die je het filmpje toch al zou tonen. Het gereedgekomen bestand wordt op dit apparaat in het geheugen opgebouwd en meteen aan een download doorgegeven.
- **Het geluid wordt gekopieerd, niet beluisterd.** Op de mp4-route gaan de audiomonsters over zonder ook maar gedecodeerd te worden. Niets hier maakt er ooit weer geluid van, en zelfs als dat wel gebeurde, was er niets wat ze ergens heen kon doorgeven.
- **Wat Google laadt, en wat het niet te zien krijgt.** De advertentie- en meetscripts komen van Google. Geen van beide krijgt iets over je video mee: geen bestand, geen frame, geen naam, geen grootte, geen lengte, en ook niet de vorm waarnaar je bijsneed. Elke regel die leest, decodeert, bijsnijdt of codeert, wordt vanaf deze herkomst geserveerd en staat in de repository.
- **Wat de doneerknop laadt, en wat hij niet te zien krijgt.** De knop “Buy me a coffee” in de kop wordt getekend door een script van cdnjs.buymeacoffee.com en haalt zijn letters bij Google Fonts. Het is een link en verder niets. Hij meldt geen bezoek en krijgt niets over jou of je video mee.
- **Het werkt offline.** Verbreek de verbinding en alles op deze pagina doet het nog. Eenvoudiger bewijs bestaat er niet.

**Controleer het zelf.** Je hoeft niets van het bovenstaande op ons woord aan te nemen. Een buildscript maakt deze pagina uit de sjablonen en de configuratie in de repository, en dat script kun je lezen en zelf draaien. Het resultaat staat vastgelegd op de branch `dist`, dus je kunt wat er geserveerd wordt vergelijken met wat een build van de bronnen oplevert: https://github.com/A-Box-of-Tools/website

De bestanden die je als eerste wilt lezen zijn `config/site.toml` voor de Content-Security-Policy, `src/shared/mp4-reader.js` voor de lezer die de frames in een mp4 vindt, en `src/transcode.js` voor de lus die ze decodeert, bijsnijdt en codeert. Geen van beide importeert iets wat een verzoek kan doen.
