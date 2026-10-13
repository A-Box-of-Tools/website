# Afbeeldingen stacken — een reeks samenvoegen, RAW-bestanden inbegrepen

Twintig frames tot één, zonder twintig uploads en zonder RAW-converter.

> Voeg een reeks foto's samen tot één: middel ze om ruis te doden, neem de mediaan om mensen uit een scène te halen, licht op voor sterrensporen, of focus-stack een macro-opname. Leest CR2, NEF, ARW, DNG, RAF en CR3 door het eigen voorbeeld van de camera eruit te halen. Draait helemaal in je browser.

Deze pagina is een interactief hulpmiddel dat volledig in je browser draait, op https://abox.tools/nl/afbeeldingen-stacken/ — niets van wat je het geeft wordt geüpload. Hieronder staat alles wat de pagina er in woorden over zegt; om het te gebruiken, open je het adres.

## Je foto's worden **nooit geüpload**. Er is geen server.

Elk frame wordt door je eigen browser geopend, gedecodeerd, uitgelijnd, samengevoegd en weggeschreven, op je eigen machine. Een stapel van twintig RAW-bestanden van 60 MB is ongeveer een gigabyte aan foto's, en er verplaatst zich geen byte van: het gereedschap heeft geen enkele netwerkfunctie, en de bestanden worden rechtstreeks van je schijf gelezen door een worker die nergens iets heen kan sturen.

- ✗ Geen upload
- ✗ Geen account
- ✗ Geen watermerk
- ✓ Leest RAW
- ✓ Werkt offline
- ✓ Open source

## Zo stack je een reeks foto's in je browser

1. **Kies de frames.** Een reeks, een bracketserie, een intervalopname of een map met RAW-bestanden. Elk bestand wordt geopend zodra het binnenkomt en de regel vertelt je wat eruit kwam — bij een RAW-bestand de camera, de grootte van het voorbeeld dat erin gevonden is, en hoe weinig van het bestand gelezen hoefde te worden om het te vinden.
2. **Kies de methode die past bij wat je kwijt wilt.** Ruis: gemiddelde, of sigma clipping als er iets bewogen heeft. Mensen, auto's of een overvliegend vliegtuig: mediaan. Een donkere lucht die je als sterrensporen wilt: oplichten. Een macro-opname langs de scherpstelring: focus stacking. De notitie onder het menu zegt wat elke methode doet met jouw aantal frames.
3. **Bepaal of de frames uitgelijnd moeten worden.** Uit de hand: ja, alleen verschuiven. Uit de hand en je draaide ook: verschuiven, draaien en schalen. Vast statief of intervalmeter: nee, en het gaat sneller. Elk frame wordt gemeten tegen het frame dat als referentie gemarkeerd is, en dat is het eerste tot je iets anders zegt: “Als referentie nemen” verzet de markering en laat de lijst in de volgorde staan die je gaf.
4. **Lees de vier getallen, druk dan op de knop.** Voordat er iets draait, zegt de pagina hoe groot het resultaat wordt, ruwweg hoeveel geheugen het kost, hoe vaak de frames gedecodeerd worden en hoeveel van je bestanden er gelezen is. Als de reeks niet in één stuk in het geheugen past, zegt hij dat, en zegt hij welke werkresolutie dat zou oplossen.

## De uitgebreide versie

[Hoe je foto's stackt om ruis te verlagen, of mensen weg te halen](https://abox.tools/nl/gidsen/fotos-stacken-tegen-ruis/): Stacken voegt een reeks frames samen tot één beeld. Welke methode je nodig hebt hangt af van wat je kwijt wilt: ruis, voorbijgangers, of de flinterdunne scherptediepte van een macro-opname. Hoe elke methode werkt, wat hij kost, en waar RAW-bestanden in passen.

## Ook in de gereedschapskist

- [Afbeelding onleesbaar maken](https://abox.tools/nl/afbeelding-onleesbaar-maken/): Wat je afdekt wordt uit het bestand gewist, niet erin verstopt.
- [EXIF-lezer & -wisser](https://abox.tools/nl/exif-gegevens-verwijderen/): Zie wat een foto over je vertelt. Haal het er daarna uit.
- [DICOM-viewer](https://abox.tools/nl/dicom-viewer/): CT, MRI, röntgen en echo, met het venster, de header en de metingen.
- [Afbeelding naar ICO](https://abox.tools/nl/favicon-maken/): Eén plaatje erin. Elk formaat dat een browser, Windows of een Mac vraagt eruit.

## Vragen

### Worden mijn foto's ergens naartoe geüpload?

Nee. Elk frame wordt door je eigen browser op je eigen hardware geopend, gedecodeerd, uitgelijnd, gestackt en weggeschreven. Dit gereedschap heeft geen enkele netwerkfunctie — het haalt nooit iets op en verstuurt nooit iets — en het `Content-Security-Policy` van de pagina noemt elk adres dat hij mag benaderen, en geen daarvan hoort bij deze site. Laad de pagina één keer, trek de stekker uit het internet, en hij werkt nog steeds. Dat telt hier zwaarder dan bij de meeste gereedschappen alleen al door het volume: een stapel van twintig RAW-frames is ongeveer een gigabyte, en een gigabyte aan foto's uploaden om er een gemiddelde van te laten nemen is nu juist waar dit gereedschap voor bestaat om te vermijden.

### Welke RAW-formaten kan het lezen, en hoe?

CR2, CR3, NEF, NRW, ARW, SR2, SRF, DNG, ORF, RAF, RW2, PEF, SRW, 3FR, IIQ, DCR, KDC, MRW, MEF, RWL en nog een paar — en dat is het meeste van wat camera's schrijven. Wat het eruit leest is het JPEG-voorbeeld op volledig formaat dat de camera zelf gerenderd heeft toen de opname gemaakt werd: het beeld op de achterkant van de camera, en het beeld dat je besturingssysteem als miniatuur tekent. Het wordt gevonden door de mappenstructuur van het bestand af te lopen, wat een paar leesacties van een paar kilobyte elk kost, en dan één stuk te nemen. **Het is geen demosaicing van de sensorgegevens.** Het resultaat draagt de witbalans en de beeldstijl van de camera op acht bit per kanaal, in plaats van de twaalf of veertien bit lineaire sensorgegevens die een RAW-converter je zou geven.

### Waarom dan niet de sensorgegevens netjes decoderen?

Omdat dat zou betekenen dat LibRaw of dcraw meegeleverd moet worden — een tweede motor van tientallen megabytes, voor één familie formaten, waarvan het meeste compressieschema's per fabrikant zijn. Die afweging wordt uitgevochten in `docs/what-can-be-built-here.md` in de broncode van deze site, waar camera-RAW al op de uitgesloten lijst stond voordat dit gereedschap bestond. Wat er veranderd is, is niet het antwoord op die vraag maar de ontdekking dat stacken het niet nodig heeft: de voorbeelden zijn op volledige resolutie, ze zijn wat de camera je toch als JPEG gegeven zou hebben, en ze lezen is ongeveer honderd keer sneller dan demosaicing zou zijn. Wil je de sensorgegevens, ontwikkel de frames dan eerst in een RAW-converter en stack de TIFF's of JPEG's die eruit komen — dit gereedschap neemt die ook aan.

### Hoeveel frames kan het aan, en hoe groot?

Zes van de zeven methoden stromen: ze houden één accumulator vast en lezen elk frame precies één keer, dus honderd frames kosten evenveel geheugen als twee en het enige dat groeit is de tijd. De mediaan is de uitzondering, want de middelste waarde van een reeks is niet te weten totdat je hem helemaal hebt, dus die houdt elk frame tegelijk vast — twintig frames van 24 megapixel is ongeveer 1,4 GB, en dat geeft geen enkele browser je. Als dat gebeurt wordt het beeld in horizontale banden gesneden en band voor band gestackt, wat kost dat de frames voor elke band opnieuw gelezen worden. De pagina rekent dit allemaal uit voordat je op de knop drukt en laat je het getal zien, zodat een trage run nooit een verrassing is.

### Wat doet het uitlijnen van de frames nu eigenlijk?

Het zoekt uit hoe ver elk frame ten opzichte van het referentieframe verschoven is en schuift het terug, tot op een fractie van een pixel. De methode is fasecorrelatie: de verschuiving tussen twee beelden komt naar voren als een faseverschil tussen hun spectra, dus één Fouriertransformatie per beeld vindt een verschuiving van tweehonderd pixels net zo goedkoop als een van twee. De tweede instelling haalt ook draaiing en schaal terug, met dezelfde truc toegepast op het spectrum in log-polaire coördinaten. Het is allemaal globaal — één verschuiving, één hoek, één schaal voor het hele frame — dus het corrigeert een camera die bewoog en het kan een onderwerp dat bewoog niet corrigeren, en een foto die een stap naar links genomen is ook niet. Eén zichtbaar gevolg: een frame dat twintig pixels naar links geschoven is, reikt niet meer tot de rechterrand, dus het resultaat wordt bijgesneden tot het deel dat elk frame bedekt. Daarom komt een uitgelijnde stapel er heel iets kleiner uit dan de frames die erin gingen, en het is het enige alternatief voor een donkere rand gemaakt van de frames die er niet waren.

### Welke methode moet ik gebruiken?

**Gemiddelde** voor ruis, op een reeks waarin niets bewoog: het snijdt willekeurige ruis met ongeveer de wortel van het aantal frames. **Mediaan** om dingen weg te halen die er maar een deel van de tijd waren — het klassieke gebruik is een druk plein een stuk of twaalf keer fotograferen en het leeg terugkrijgen. **Sigma clipping** als je allebei wilt: het leert wat elke pixel meestal is en middelt alleen de waarden die daarmee overeenkomen, dus het heeft de immuniteit van de mediaan voor een langsrijdende auto en de ruisreductie van het gemiddelde. **Oplichten** voor sterrensporen, vuurwerk en light painting. **Verdonkeren** om alles helders weg te halen dat bewoog. **Optellen** om één lange belichting na te bootsen. **Focus stacking** voor een macro-opname langs de scherpstelring.

### Waarom is mijn resultaat acht bit als mijn RAW-bestanden veertien zijn?

Omdat wat er gestackt wordt het eigen voorbeeld van de camera is, en dat is een JPEG. Het is het vermelden waard dat stacken een deel terugwint van wat dat kost: zestien acht-bits frames middelen geeft een resultaat met werkelijk fijnere overgangen dan er in één van de frames zaten, want juist de ruis die elk frame anders liet afronden is wat het gemiddelde tussen de niveaus in laat landen. Het rekenwerk gebeurt hier in drijvende komma en wordt één keer helemaal aan het eind afgerond, dus er wordt onderweg niets van weggegooid. Het is nog steeds niet hetzelfde als lineaire sensorgegevens stacken, en dit gereedschap doet niet alsof.

### Kan ik frames van verschillende afmetingen stacken, of van verschillende camera's?

Ja, al is het meestal een vergissing en de moeite waard om te controleren of je het bedoelde. Het resultaat krijgt de grootte van het grootste frame, en elk ander frame wordt passend geschaald en erin gecentreerd. Camera's mengen mengt ook de kleurweergave, dus een gemiddelde van de twee is een gemiddelde van twee verschillende interpretaties van hetzelfde licht. Waar het echt helpt is een reeks die op twee resoluties is opgenomen, of een RAW-bestand en een JPEG van hetzelfde frame.

### Er staat dat de run in banden gaat. Wat betekent dat?

Dat het werkgeheugen dat de methode nodig heeft meer is dan het gereedschap in één keer wil reserveren, dus het beeld wordt in horizontale stroken gesneden en strook voor strook gestackt. Het levert nog steeds precies hetzelfde resultaat; het leest de frames alleen opnieuw voor elke strook, dus het duurt langer, en de pagina vertelt je hoeveel decodeeracties dat worden. De werkresolutie één stap verlagen deelt het geheugen door vier, wat een run in banden bijna altijd terugbrengt tot één doorgang — de notitie zegt welke instelling dat zou doen.

### Waarom gebruikt dit gereedschap een Worker en geen van de andere?

Omdat het het enige is waarvan het werk in minuten gemeten wordt. Elk ander gereedschap hier doet iets dat een seconde of twee kost, waar het werk van de hoofddraad halen ceremonie zou zijn. Twintig grote frames stacken is stevig rekenwerk over honderden megabytes, en op de hoofddraad betekent dat een bevroren pagina: geen voortgangsbalk die beweegt, een Annuleren-knop die niet antwoordt, en uiteindelijk een browser die aanbiedt het tabblad af te sluiten. De Worker is een tweede draad in deze zelfde browser, die een bestand uit deze zelfde map draait, onder dit zelfde beleid. Het is geen server en het is geen netwerkfunctie.

### Is het gratis, en heb ik een account nodig?

Het is gratis, en er is geen account, geen inloggen, geen proefperiode en geen watermerk. Er is ook geen limiet op hoeveel frames je stackt of hoe groot ze zijn, want er is geen server die ervoor betaalt — het werk gebeurt op je eigen machine en het enige plafond is je eigen geheugen. De site draait advertenties, en dat is wat hem betaalt; de adverteerders krijgen niets over je foto's.

## Hoe je de privacybelofte controleert

- **Je foto's kunnen nergens heen.** Het Content-Security-Policy noemt elk adres dat deze pagina mag benaderen, en geen enkel adres daarvan hoort bij deze site. Er is hier geen eindpunt waar je bestanden verzameld zouden kunnen worden, en niets in de code dat ze zou versturen als dat er wel was — geen `fetch`, geen `XMLHttpRequest`, geen `sendBeacon`, niet in `src/` en niet in de worker.
- **De RAW-bestanden worden gelezen, niet geüpload — en nauwelijks gelezen.** Een RAW-bestand van een camera bevat al een JPEG op volledig formaat dat de camera bij het maken van de opname heeft gerenderd. Dit gereedschap vindt het door een paar mappenverwijzingen af te lopen en dan om één stuk te vragen, wat bij een bestand van 60 MB meestal onder de honderd kilobyte blijft. De pagina laat je dat getal zien naast de grootte van je bestanden terwijl je werkt. De sensorgegevens worden helemaal nooit gelezen.
- **Het werk gebeurt in een Worker op deze machine, niet op een server.** Dit is het enige gereedschap hier dat er een gebruikt, want stacken is minuten rekenwerk in plaats van seconden, en een bevroren pagina kan geen voortgang tonen en niet afgebroken worden. Een Worker is een tweede draad in deze zelfde browser — zie `src/worker.js`. Hij krijgt de bestanden zelf, wat gratis is, want een verwijzing naar een bestand is niet de bytes; en hij heeft precies hetzelfde Content-Security-Policy als de pagina, oftewel nergens om ze heen te sturen.
- **Over de reeks wordt nergens iets gemeld.** Hoeveel frames je hebt gestackt, welke camera ze geschreven heeft, hoe ver elk frame verschoven was, welke methode je hebt gekozen en hoe lang het duurde, blijven in het geheugen van deze pagina tot je hem sluit. Er is in deze repository geen eigen analytics-gebeurtenis die er iets van meedraagt, en de ene vraag die deze site na een download stelt, stuurt een duim omhoog of omlaag en de naam van het gereedschap, verder niets.
- **Het werkt offline.** Verbreek de verbinding en het gereedschap is onveranderd, want er heeft nooit een netwerkstap in gezeten. De worker en elke module die hij laadt worden gecachet door de eigen service worker van deze pagina, dus een geïnstalleerde kopie stackt RAW-bestanden met de stekker uit het netwerk.

**Controleer het zelf.** Je hoeft niets van het bovenstaande op ons woord aan te nemen. Een buildscript maakt deze pagina uit de sjablonen en de configuratie in de repository, en dat script kun je lezen en zelf draaien. Het resultaat staat vastgelegd op de branch `dist`, dus je kunt wat er geserveerd wordt vergelijken met wat een build van de bronnen oplevert: https://github.com/A-Box-of-Tools/website

De bestanden die je als eerste wilt lezen zijn `config/site.toml` voor de Content-Security-Policy, `src/raw.js` voor hoe een RAW-bestand geopend wordt door kilobytes te lezen in plaats van megabytes, `src/stack.js` voor het rekenwerk van elke methode, en `src/plan.js` voor waar de geheugen- en decodeergetallen op de pagina vandaan komen — dat zijn de antwoorden van dat bestand, geen schattingen.
