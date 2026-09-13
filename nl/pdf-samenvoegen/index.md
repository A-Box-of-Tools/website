# Pdf samenvoegen — en pagina's splitsen en herordenen

Pagina's verschuiven zonder ritje naar een server.

> Voeg pdf's samen, splits er een in meerdere en sleep pagina's in de volgorde die je wilt, allemaal binnen je eigen browser. Er wordt niets geüpload, er komt geen account aan te pas, en het klaargemaakte bestand wordt opnieuw geopend en nageteld voordat het je aangeboden wordt.

Deze pagina is een interactief hulpmiddel dat volledig in je browser draait, op https://abox.tools/nl/pdf-samenvoegen/ — niets van wat je het geeft wordt geüpload. Hieronder staat alles wat de pagina er in woorden over zegt; om het te gebruiken, open je het adres.

## Je documenten worden **nooit geüpload**. Er is geen server.

Elk document dat je kiest wordt geopend, uit elkaar gehaald en weer weggeschreven in het geheugen van dit apparaat, door code die vanaf dit adres geserveerd is. Niets hier kan een upload doen, en aan de andere kant van deze pagina zit geen server om er een aan te nemen.

- ✗ Geen upload
- ✗ Geen account
- ✓ Werkt offline
- ✓ Open source
- ✓ Bestanden blijven op je apparaat

## Zo voeg je een pdf samen, splits je hem of herorden je hem

1. **Kies je pdf's.** Sleep ze op de kiezer of zoek ze met de hand op, en voeg er later gerust nog meer toe: de pagina's van elk bestand komen achteraan de lopende volgorde te staan, en juist daardoor kun je twee mappen los van elkaar samenvoegen. De browser leest ze rechtstreeks van je schijf.
2. **Zet de pagina's in de volgorde die je wilt.** Sleep een pagina aan zijn handvat, of duw hem met de pijltjes. Draai er een die scheef gescand is, haal er een weg, of typ `1-3, 8, 12-` in het vak om er in één keer een hele reeks te bewaren, te verwijderen of te draaien. De nummers worden onderweg hernummerd, dus wat je ziet is altijd wat het klaargemaakte bestand wordt.
3. **Zeg of het één document wordt of meerdere.** Eén is het gebruikelijke antwoord. De rest zijn manieren om te knippen: om de zoveel pagina's, bij paginanummers die jij noemt, één bestand per pagina, of terug in de bestanden waar de pagina's vandaan kwamen. Meer dan één bestand krijg je als één ZIP, zodat het één keer opslaan is in plaats van vijftig keer.
4. **Bouw het, en lees de regel die zegt dat het nagekeken is.** Als de documenten geschreven zijn, wordt elk daarvan door dezelfde lezer op deze pagina opnieuw geopend en worden zijn pagina's geteld. Klopt dat niet met wat je gevraagd had, dan wordt de run als mislukt gemeld en krijg je geen download aangeboden.

## De uitgebreide versie

[Pdf-pagina's samenvoegen, splitsen en herschikken](https://abox.tools/nl/gidsen/pdf-bestanden-samenvoegen-en-splitsen/): Pdf's combineren, er één in meerdere knippen en pagina's verplaatsen: wat de herschikking overleeft, wat geen enkel hulpmiddel kan meenemen, en waarom je je documenten hiervoor nergens hoeft te uploaden.

## Ook in de gereedschapskist

- [Pdf-compressor](https://abox.tools/nl/pdf-verkleinen/): Een document laten krimpen zonder het ergens heen te sturen.
- [PDF onleesbaar maken](https://abox.tools/nl/pdf-onleesbaar-maken/): De letters worden uit het bestand gewist, en daarna wordt het bestand doorzocht om het te bewijzen.
- [Afbeeldingen naar pdf](https://abox.tools/nl/afbeeldingen-naar-pdf/): Zet je plaatjes in één document.
- [Documentscanner](https://abox.tools/nl/documenten-scannen/): Fotografeer de pagina. Je krijgt iets terug dat eruitziet als een scan.

## Vragen

### Worden mijn pdf's ergens naartoe geüpload?

Nee. Ze worden gelezen, gekopieerd en geschreven door je eigen browser op je eigen hardware. Deze tool heeft geen serverkant, en de `Content-Security-Policy` van de pagina noemt elk adres dat ze mag benaderen: geen daarvan is van ons. Deze tool heeft helemaal geen optionele netwerkfunctie.

### Hoeveel bestanden kan ik samenvoegen, en hoe groot mogen ze zijn?

Er staat geen limiet in de tool geschreven. De limiet is je eigen apparaat: de documenten blijven in het geheugen zolang eraan gewerkt wordt, dus een laptop voegt een paar honderd megabyte zonder morren samen en gaat ergens daarboven worstelen. Er wordt niets in rekening gebracht, afgeknepen, van een watermerk voorzien of in een wachtrij gezet, want er is niemand aan de andere kant om dat te doen.

### Kost samenvoegen of splitsen kwaliteit?

Nee. Op een pagina wordt niets opnieuw gecodeerd, opnieuw getekend of opnieuw gecomprimeerd. De inhoudsstroom van elke pagina en elk lettertype, plaatje en vectortekening waar hij naar verwijst worden byte voor byte overgenomen, dus tekst blijft selecteerbaar en doorzoekbaar en een foto is dezelfde foto. Het enige wat verandert is de volgorde van de pagina's en de structuur eromheen.

### Wat gebeurt er met bladwijzers en links?

Allebei worden ze opnieuw opgebouwd in plaats van weggegooid. Een bladwijzer waarvan de pagina nog in de uitvoer zit wijst naar waar die pagina heen verhuisd is; een waarvan je de pagina hebt weggehaald verdwijnt, tenzij er nog items onder hangen, en dan blijft hij staan als kopje. Bij het samenvoegen van meerdere bestanden komen de bladwijzers van elk bestand onder een kopje met zijn naam. Links tussen pagina's worden op dezelfde manier meegenomen, inclusief de benoemde bestemmingen die Word en LaTeX schrijven, en een link waarvan het doel niet mee is gekomen blijft liever zonder werking achter dan de lezer ergens verkeerd heen te sturen. Links naar webadressen blijven zoals ze zijn.

### Wat gaat er niet mee?

Vier dingen, en de tool zegt het bij de resultaten in plaats van in de kleine lettertjes. De getagde leesvolgordeboom die schermlezers gebruiken, de paginalabels (de nummering “iii, iv, 1, 2”), ingebedde bijlagen, en elke actie die noch “ga naar een pagina” noch “open een webadres” is, de JavaScript van het document daarbij. De eerste twee beschrijven een volgorde die niet meer bestaat zodra pagina's verplaatst zijn; het laatste is niet iets waar je om vroeg in een nieuw bestand. Als de tagging van een document er voor jou toe doet, bewaar het origineel er dan bij.

### Blijven ingevulde formulieren bestaan?

Ja. Formuliervelden en wat erin getypt is komen met hun pagina's mee, en het nieuwe document wordt als formulier geregistreerd zodat lezers het ook zo behandelen. Eén ding om te weten bij het samenvoegen: twee velden met dezelfde naam zijn voor elke lezer één veld, dus als je twee kopieën van hetzelfde formulier samenvoegt, vult een vakje op de ene pagina hetzelfde vakje op de andere in. De tool merkt dat geval op en zegt het erbij.

### Kan hij een pdf met wachtwoord openen?

Nee, en dat is met opzet. Een versleuteld document wordt geweigerd met een bericht dat dat zegt, ook als het wachtwoord leeg is, en zo slaan heel wat scanners en kopieerapparaten op. De beveiliging van een bestand afhalen is een andere klus dan zijn pagina's verschuiven, en een tool die dat stilletjes deed zou iets doen waar je niet om gevraagd had.

### Waarom zijn er geen paginavoorbeelden?

Omdat een pagina tekenen een volledige pdf-renderer betekent, met lettertypen, verlopen, transparantiegroepen en overvloeimodi, en dat is een megabyte of meer aan engine om op te halen en te draaien voor een setje miniaturen. Wat de tegels in plaats daarvan tonen is waar het herordenen echt op draait: het paginanummer, de vorm en het formaat van het papier, de draaiing waarmee hij geschreven wordt, en uit welk bestand hij kwam. Een liggende scan in een stapel staande pagina's valt zo nog steeds meteen op.

### Gaat het klaargemaakte bestand overal open?

Ja. De uitvoer wordt geschreven als pdf 1.5, of in de hoogste versie die een van de bestanden die je gaf nodig had, en 1.5 wordt begrepen door elke lezer die sinds 2003 is uitgekomen. De tool bewijst dat bovendien op je eigen apparaat: hij opent elk klaargemaakt bestand opnieuw en telt de pagina's door de paginaboom te doorlopen, voordat hij het je aanbiedt.

### Is het gratis, en heb ik een account nodig?

Het is gratis, en er komt geen account, geen inlog en geen proefperiode aan te pas, en geen andere groottelimiet dan wat het geheugen van je eigen apparaat toelaat. De site draait op advertenties, en die betalen hem; die advertenties krijgen niets over je documenten mee.

### Werkt het offline?

Ja. Laad de pagina één keer, verbreek daarna je internetverbinding en hij werkt gewoon door. Dat is meteen de eenvoudigste manier om te bewijzen dat er niets geüpload wordt, want een tool die je documenten wegstuurde om ze te laten samenvoegen zou ermee ophouden zodra je de stekker eruit trok.

## Hoe je de privacybelofte controleert

- **Je documenten kunnen nergens heen.** In de Content-Security-Policy staat elk adres dat deze pagina mag benaderen, en geen daarvan is van ons. Deze tool voegt daar niets aan toe, want hij heeft geen eigen netwerkfunctie, zelfs geen optionele. Er is hier geen eindpunt waar je bestanden verzameld zouden kunnen worden, en er staat ook niets in de code dat ze daarheen zou sturen als dat er wel was.
- **Samenvoegen is de klus die het meest de moeite waard is om níét te uploaden.** De documenten die mensen bij elkaar zetten zijn juist die die ergens vandaan komen: een contract met zijn handtekeningpagina, een paspoortscan met een bankafschrift, een doktersbrief met een aanvraagformulier. Een online samenvoeger heeft ze dan allemaal, op één plek, al op volgorde. Deze heeft een pagina in je browser en geen andere helft.
- **Het hele formaat staat in deze repository.** Een pdf is een lijst objecten en een tabel van waar elk object begint. `src/objects.js` leest die syntaxis, `src/reader.js` volgt de tabel, `src/assemble.js` kopieert pagina's tussen documenten en `src/writer.js` schrijft het resultaat weg. Geen van de vier importeert iets dat een verzoek kan doen. Er wordt geen bibliotheek opgehaald en er wordt niets op een server gerenderd.
- **Versleutelde bestanden worden geweigerd in plaats van geopend.** Een pdf met een wachtwoord erop wordt geweigerd, ook het soort dat scanners maken met een leeg wachtwoord en dat technisch gezien open zou gaan. De beveiliging van een document afhalen is een andere klus dan zijn pagina's verschuiven, en het stilletjes doen zou een verrassend eigenzinnige zet zijn voor een tool.
- **Het klaargemaakte bestand zegt niets over waar het gemaakt is.** Geen producerregel, geen aanmaakdatum, geen naam van de tool. Het draagt ook het XMP-pakket en de privéblokken niet mee die een opmaakprogramma achterlaat: die horen bij het document dat er eerst was, niet bij het document dat je net hebt gebouwd. Alles wat in de pagina's zelf staat wordt exact gekopieerd: deze tool verplaatst pagina's, hij herschrijft niet wat erop staat.
- **Acties die niet “ga naar een pagina” zijn, gaan niet mee.** Een pdf kan instructies bevatten die bij het openen uitgevoerd worden: speel dit af, verstuur dit formulier naar dat adres, voer deze JavaScript uit. Pagina's die door deze tool gaan houden hun links naar andere pagina's en naar webadressen, en raken de rest kwijt. Dat je andermans pagina's herordent, is geen reden om het scriptwerk van hun document mee te nemen naar jouw nieuwe bestand.
- **Wat Google laadt, en wat het niet te zien krijgt.** De advertentie- en meetscripts komen van Google. Geen van beide krijgt iets over je documenten mee: geen bestand, geen pagina, geen naam, geen grootte en geen aantal pagina's. Elke regel die een pdf leest, kopieert of schrijft, wordt vanaf deze herkomst geserveerd en staat in de repository.
- **Wat de doneerknop laadt, en wat die niet te zien krijgt.** De knop “Buy me a coffee” in de kop wordt getekend door een script van cdnjs.buymeacoffee.com en haalt zijn letters bij Google Fonts. Het is niet meer dan een link: hij meldt geen bezoek en krijgt niets over jou of je documenten mee. Er gebeurt niets zolang je er niet op klikt, en waar je dan op zou klikken is de site van iemand anders.
- **Het werkt offline.** Verbreek de verbinding en alles op deze pagina blijft werken. Eenvoudiger bewijs bestaat er niet: een tool die je documenten wegstuurde om ze te laten samenvoegen zou ermee ophouden.

**Controleer het zelf.** Je hoeft niets van het bovenstaande op ons woord aan te nemen. Een buildscript maakt deze pagina uit de sjablonen en de configuratie in de repository, en dat script kun je lezen en zelf draaien. Het resultaat staat vastgelegd op de branch `dist`, dus je kunt wat er geserveerd wordt vergelijken met wat een build van de bronnen oplevert: https://github.com/A-Box-of-Tools/website

De bestanden die je als eerste wilt lezen zijn `config/site.toml` voor de Content-Security-Policy en `src/assemble.js` voor het hele kopieerwerk: hoe een pagina uit het ene document gelicht wordt en in het andere terechtkomt, en wat er met opzet achterblijft. Dat bestand kan het netwerk niet bereiken, en de lezer en de schrijver ernaast evenmin.
