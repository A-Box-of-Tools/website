# Hoe je foto's stackt om ruis te verlagen, of mensen weg te halen

Een reeks frames bevat meer informatie dan één frame ervan. Ze middelen heft de ruis op; de middelste waarde van elke pixel nemen wist alles wat er maar een deel van de tijd was. Welke van de twee je wilt hangt volledig af van wat er bewoog.

[Open de tool Afbeeldingen stacken](https://abox.tools/nl/afbeeldingen-stacken/): Twintig frames tot één, zonder twintig uploads en zonder RAW-converter.

Laatst bijgewerkt 26 augustus 2026

## Het korte antwoord

Open [Afbeeldingen stacken](https://abox.tools/nl/afbeeldingen-stacken/), sleep de hele reeks erin, en kies de methode op wat je kwijt wilt:

- **Ruis**, en er bewoog niets — gemiddelde.
- **Ruis**, en er bewoog iets — sigma clipping.
- **Mensen, auto's, een vliegtuig** — mediaan.
- **Een donkere lucht die je als sterrensporen wilt** — oplichten.
- **Een macro-opname met vrijwel geen scherptediepte** — focus stacking.

Laat het uitlijnen aan staan als de camera in je handen was en zet het uit als hij op een statief stond. RAW-bestanden kunnen er rechtstreeks in; ze hoeven niet eerst ontwikkeld te worden.

Alles hieronder gaat over waarom die vijf regels zijn wat ze zijn.

## Waarom een reeks meer bevat dan één frame

Een foto die bij weinig licht gemaakt is, is het beeld plus ruis, en de ruis is elke keer anders. Dat laatste is wat stacken laat werken. Maak dezelfde opname zestien keer en het beeld is in alle zestien identiek terwijl de ruis dat niet is, dus ze middelen laat het beeld staan en heft de meeste ruis op.

De verbetering is de wortel van het aantal frames. Vier frames halveren de ruis. Zestien brengen hem terug tot een kwart. Honderd snijden hem met tien. Dat is een genadeloze kromme om op te zitten — van zestien naar vierenzestig frames gaan koopt je dezelfde verbetering nog eens, voor vier keer zoveel opnames — en het is de reden dat vrijwel elke praktische stapel ergens tussen de acht en dertig frames zit.

Er is een tweede, stillere winst. Zestien acht-bits frames middelen geeft een resultaat met fijnere overgangen dan er in één van de frames zaten, want juist de ruis die elk frame anders liet afronden is wat het gemiddelde tussen de niveaus in laat landen. Een ruizige reeks stacken haalt niet alleen ruis weg; het haalt toon terug die een enkel frame had weggekwantiseerd.

## De vraag die de methode kiest

Niet „wat wil ik houden” maar **wat was er anders tussen de frames**. De rest volgt daaruit.

### Er bewoog niets: gemiddelde

Het gewone gemiddelde. Het is de meest doeltreffende ruisverlaging die er is voor een reeks waarin het enige verschil tussen de frames de ruis is, en het is het makkelijkst te bederven: één frame met een vogel erin zet een vage vogel over de hele stapel, want een gemiddelde heeft geen mening over een waarde die het niet eens is met de rest. Het telt hem gewoon mee.

### Er kwam iets door het beeld: mediaan

Leg een stuk of twaalf foto's van een druk plein op elkaar en kijk naar één pixel. In de meeste is hij bestrating; in een of twee is hij iemands jas. Sorteer die twaalf waarden en neem de middelste, en je krijgt bestrating, want de jas was nooit in de meerderheid.

Doe dat voor elke pixel en het plein komt er leeg uit. Dit is de truc achter elk artikel over „toeristen uit je vakantiefoto halen”, en het heeft niets slimmers nodig dan een reeks en geduld. Het ene dat het eist is dat **geen enkel deel van de scène meer dan de helft van de tijd bezet is**. Iemand die in acht van je twaalf frames stil blijft staan, is op die pixels de meerderheid, en de mediaan houdt hem.

### Allebei: sigma clipping

De mediaan gooit de meeste informatie weg om zijn robuustheid te krijgen — elf van je twaalf waarden worden bij elke pixel weggedaan, dus hij verlaagt de ruis veel minder dan een gemiddelde van dezelfde reeks zou doen.

Sigma clipping is het compromis, en het is meestal de juiste standaardkeuze voor elke reeks uit de praktijk. Het kijkt naar elke pixel over alle frames heen, zoekt uit wat hij meestal is en hoeveel hij varieert, en middelt dan alleen de waarden die daarmee overeenkomen. Een auto die door één frame reed wordt bij die pixels uitgesloten; elk ander frame telt overal nog steeds mee. Je krijgt de immuniteit van de mediaan voor dingen die bewogen en het meeste van de ruisverlaging van het gemiddelde.

De drempel staat in standaardafwijkingen, en twee is het gebruikelijke uitgangspunt. Lager verwerpt meer, en begint echt detail samen met de auto te verwerpen.

### Alleen de heldere dingen tellen: oplichten

Houd de helderste waarde die elke pixel ooit had. Fotografeer de nachthemel als tweehonderd belichtingen van dertig seconden en licht ze samen op, en elke ster tekent zijn eigen boog over het resultaat — een sterrenspoor, samengesteld uit korte belichtingen die afzonderlijk nooit zijn volgelopen. Dezelfde methode stelt vuurwerk samen uit de frames van zijn eigen explosie, en een light painting uit een wandeling door een donkere kamer met een zaklamp.

De tegenhanger, verdonkeren, is de stille van het paar: een pixel blijft alleen helder als hij in *elk* frame helder was, dus weerspiegelingen in een raam, langskomende koplampen en door een flits aangelichte regendruppels verdwijnen allemaal.

### Het onderwerp is dieper dan de scherpstelling: focus stacking

Een macro-opname op f/8 heeft misschien een millimeter scherp, en dat is niet genoeg voor een insect. Het antwoord is twintig frames langs de scherpstelring maken en van elk alleen het deel houden dat daarin scherp was. Het gereedschap meet hoeveel elke pixel van zijn buren verschilt — veel op een rand, bijna nul op een vervaging — en neemt de winnaar.

Deze wil meer dan alle andere een statief, want de scherpstelring met de hand verdraaien verplaatst de camera, en een frame dat van iets verder weg genomen is, is niet hetzelfde beeld op een andere scherpstelling.

![De lijst met modi, gemiddelde, mediaan, lichtste, donkerste, met eronder een plan met de uitvoergrootte, het benodigde geheugen en hoeveel van elk bestand gelezen moet worden.](https://abox.tools/screens/stack-photos-to-reduce-noise/plan.webp)

De modus is de vraag van deze sectie. Het plan eronder is de tool die zegt wat de ronde kost voordat hij begint.

## De frames uitlijnen

Stacken is rekenwerk per pixel, dus het gaat ervan uit dat een bepaalde pixel in elk frame hetzelfde deel van de scène is. Uit de hand is dat niet zo: een reeks drijft tientallen pixels weg, en dat middelen levert een vervaging op in plaats van een schoon beeld. Dat is veruit de meest voorkomende reden dat een eerste poging tot stacken tegenvalt.

Dus worden de frames eerst tegen één van hun aantal gemeten en teruggeschoven, tot op een fractie van een pixel. Drie instellingen:

- **Alleen verschuiven** is goed voor vrijwel alles uit de hand. Het corrigeert het wegdrijven en het wiebelen.
- **Verschuiven, draaien en schalen** voor een reeks waarbij je ook licht draaide, of waarbij een zoom wegkroop. Het kost één meting meer per frame en helemaal niets als de frames recht blijken te zijn.
- **Geen** voor een vast statief of een intervalreeks, waarbij de frames al uitgelijnd zijn en ze opmeten verspilde tijd is.

Wat geen enkele uitlijning kan herstellen is een onderwerp dat bewoog in plaats van een camera die bewoog, en een foto die een stap naar links genomen is ook niet. Opzij bewegen verandert hoeveel de dichtbije dingen verschuiven ten opzichte van de verre, en geen enkele correctie beschrijft die twee tegelijk. Op je plek draaien is prima; lopen niet.

![Het resultaat: de gestapelde afbeelding, met een notitie over hoever elk frame verschoven moest worden om op het eerste te passen.](https://abox.tools/screens/stack-photos-to-reduce-noise/result.webp)

De uitlijncijfers zijn het lezen waard. Een reeks uit de hand schuift een paar pixels per frame, en dat is precies wat de uitlijner stilletjes ongedaan maakt.

## Waar RAW-bestanden in passen

Je kunt CR2, CR3, NEF, ARW, DNG, RAF, RW2, ORF en de rest er rechtstreeks in slepen, en het is de moeite waard precies te zijn over wat ermee gebeurt, want het is niet wat een RAW-converter doet.

Elk RAW-bestand bevat al een **JPEG op volledig formaat dat de camera gerenderd heeft toen de opname gemaakt werd**. Het is wat de achterkant van de camera je laat zien en wat je besturingssysteem als miniatuur tekent. De stacker vindt dat beeld en gebruikt dat. Hij decodeert de sensorgegevens niet.

Twee gevolgen, één goed en één om te weten:

- **Het is snel.** Het voorbeeld vinden betekent een paar kilobyte mappenstructuur lezen en dan één stuk, dus een frame van 60 MB opent ongeveer net zo snel als een JPEG. Twintig ervan openen in de tijd die een RAW-converter aan één zou besteden. De pagina laat je zien hoe weinig van je bestanden hij werkelijk gelezen heeft.
- **Het is de weergave van de camera, niet die van jou.** Acht bit per kanaal, met de witbalans en de beeldstijl waarop de camera stond — niet de twaalf of veertien bit lineaire sensorgegevens die je van een converter zou krijgen.

Voor ruisverlaging, sterrensporen, voorbijgangers weghalen en focus stacking is die afweging vrijwel altijd de moeite waard: de voorbeelden zijn op volledige resolutie en ze zijn wat je toch als JPEG gekregen zou hebben. Trek je de schaduwen hard omhoog, of stack je voor astrofotografie waar juist het laatste stukje dynamisch bereik het hele punt is, ontwikkel de frames dan eerst in een RAW-converter en stack de TIFF's of JPEG's die eruit komen. Die gaan er op dezelfde manier in.

## Wat het kost om te draaien

De moeite waard om te weten, want het is het verschil tussen een stapel die acht seconden kost en één die twee minuten kost.

Zes van de zeven methoden hoeven maar één ding te onthouden. Een lopend maximum geeft niets om de frames die het al gezien heeft, en een lopende som ook niet, dus die methoden lezen elk frame precies één keer en gebruiken voor honderd frames evenveel geheugen als voor twee.

De mediaan kan zo niet werken, want je kunt de middelste waarde van een reeks niet weten totdat je hem helemaal hebt. Twintig frames van 24 megapixel is ongeveer 1,4 GB aan pixels die tegelijk vastgehouden worden, en dat geeft geen enkele browser je, dus wordt het beeld in horizontale banden gesneden en band voor band gestackt — correct, en trager, want de frames worden voor elke band opnieuw gelezen.

Het gereedschap rekent dit allemaal uit voordat je op de knop drukt en vertelt het je: hoe groot het resultaat wordt, ruwweg hoeveel geheugen het nodig heeft, en hoe vaak je frames gedecodeerd worden. Zegt het dat de run in banden gaat, dan deelt de werkresolutie één stap verlagen het geheugen door vier en maakt er bijna altijd weer één doorgang van — en stack je om ruis te verlagen, dan zou half formaat er toch al schoner uitgezien hebben dan volledig.

## Ervoor fotograferen

Het meeste van de kwaliteit van een stapel wordt beslist voordat er software aan te pas komt.

- **Maak meer frames dan je denkt nodig te hebben.** De wortelkromme is onverbiddelijk aan de onderkant en mild aan de bovenkant: van vier naar negen frames gaan is een groter zichtbaar verschil dan van twintig naar veertig.
- **Verander de belichting niet tussen de frames.** Stacken gaat ervan uit dat de frames dezelfde scène op dezelfde helderheid zijn. Zet de belichting vast, of het gereedschap middelt twee verschillende beelden.
- **Wacht tussen de frames als je mensen weg wilt halen.** Een reeks die in twee seconden gemaakt is, vangt dezelfde persoon in elk frame op dezelfde plek, en de mediaan houdt hem. Tien frames met een paar seconden ertussen werkt veel beter dan vijftig in een reeks.
- **Houd de gaten kort voor sterrensporen.** Oplichten tekent precies wat de frames vastgelegd hebben, dus een pauze tussen de belichtingen wordt een zichtbare onderbreking in elk spoor.

## Niets hiervan verlaat je machine

Een stapel van twintig RAW-frames is ongeveer een gigabyte aan foto's, en dat is veel om aan een website te geven om er een gemiddelde van te laten nemen. [Afbeeldingen stacken](https://abox.tools/nl/afbeeldingen-stacken/) leest de bestanden van je eigen schijf en doet het rekenwerk in je eigen browser. Er is geen uploadstap, geen account en geen wachtrij, en je kunt die bewering nakijken zoals je die van wie dan ook zou nakijken: open het netwerkpaneel van je browser terwijl hij draait, of trek eenvoudigweg de stekker uit het internet en stack ze toch.

De verwante vraag — hoe je voor elk willekeurig gereedschap ziet of het een bestand afgeven nodig was — heeft [een eigen gids](https://abox.tools/nl/gidsen/is-bestanden-uploaden-veilig/).
