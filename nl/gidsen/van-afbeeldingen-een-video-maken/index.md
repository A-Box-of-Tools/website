# Hoe je van een map vol afbeeldingen een video maakt

Een diavoorstelling maak je zo, en je rendert hem net zo makkelijk twee keer, omdat twee van de instellingen niet betekenen wat ze lijken te betekenen. Hier staat wat die twee werkelijk regelen, en wat je het beste kiest.

[Open de tool Afbeeldingen naar video](https://abox.tools/nl/afbeeldingen-naar-video/): Maak van een map vol afbeeldingen een video.

Laatst bijgewerkt 26 augustus 2026

## Het korte antwoord

Open [Afbeeldingen naar video](https://abox.tools/nl/afbeeldingen-naar-video/), sleep de plaatjes erin, zet ze op volgorde, stel in hoe lang elk wordt vastgehouden, en maak de video. Je krijgt een mp4 met H.264-video, die vrijwel overal afspeelt.

De twee instellingen die het vaakst een tweede ronde nodig hebben zijn de duur en de resolutie, en die zijn het begrijpen waard vóór de eerste render in plaats van erna.

## Beeldsnelheid en duur zijn niet hetzelfde

Dit is de verwarring die mensen een nieuwe render kost.

**Duur** is hoe lang elk plaatje in beeld blijft. Dat is de instelling waar het je werkelijk om gaat. Drie seconden is een prettige standaard voor een diavoorstelling waar iemand naar kijkt; één tot twee seconden voelt kwiek; alles boven de vijf sleept, tenzij er commentaar overheen ligt.

**Beeldsnelheid** is hoe vaak per seconde de video dat plaatje herhaalt. Aan hoe de diavoorstelling eruitziet verandert dat niets, want een stilstaand beeld dat drie seconden blijft staan ziet er op 24 beelden per seconde precies zo uit als op 60. Aan de bestandsgrootte en de codeertijd verandert het wel degelijk iets.

Kies voor een gewone diavoorstelling dus een lage beeldsnelheid. 24 of 30 is ruim voldoende. De reden om hoger te gaan is beweging in de video: een pan of zoom over elke foto, of een overvloeier ertussen, waar een lage beeldsnelheid als zichtbaar stappen te zien is.

![De instellingen voor resolutie en framesnelheid, met een samenvatting die de afbeeldingen, de totale duur, de frames en de geschatte grootte telt.](https://abox.tools/screens/turn-images-into-a-video/summary.webp)

Framesnelheid en duur zijn niet hetzelfde, en in de samenvatting wordt dat duidelijk: als je de een verandert beweegt het aantal frames, niet de lengte.

## Resolutie, en plaatjes van de verkeerde vorm

Een video heeft één beeldformaat voor zijn hele lengte. Je foto's delen dat vrijwel zeker niet allemaal, dus er moet iets gebeuren met de foto's die niet passen. Juist daar hoor je met opzet een keuze te maken.

Begin met de resolutie kiezen op basis van waar de video heen gaat:

- **⁦1920×1080⁩** voor alles wat algemeen is. Overal ondersteund, speelt overal, en het is wat de meeste mensen met hd bedoelen.
- **⁦1080×1920⁩**, dezelfde getallen andersom, voor een bestemming waar de telefoon voorop staat: verhalen, reels en shorts.
- **⁦3840×2160⁩** alleen als de plaatjes werkelijk zoveel detail hebben en de bestemming het gaat tonen. Het is vier keer zoveel pixels, vier keer de codeertijd, en ruwweg vier keer het bestand.

Beslis daarna wat er met de afwijkers gebeurt. Elk plaatje binnen het beeld passen houdt het geheel en laat balken aan de zijkanten staan. Dat is veilig, en het juiste antwoord wanneer de plaatjes zwaarder wegen dan de presentatie. Het beeld vullen en de overloop afsnijden ziet er beter uit en snijdt bij een paar de bovenkant eraf. Staande en liggende foto's in één video mengen is het geval waar geen goed antwoord bestaat; van tevoren beslissen welke kant je liever fout zit, scheelt een nieuwe render.

## Volgorde, en de bestandsnaamval

Zoals bij elke stapelklus sorteren bestandsnamen op een manier die niet de manier is waarop jij telde. `foto2.jpg` komt in een alfabetische sortering ná `foto10.jpg`, omdat er teken voor teken vergeleken wordt.

Sorteren op opnamedatum klopt meestal voor foto's van een gebeurtenis, omdat je ze genomen hebt in de volgorde waarin ze gebeurden. De tegels slepen klopt voor alles waar het verhaal niet chronologisch is. Controleer het vóór je rendert: de video is het ene product waarbij de volgorde herstellen betekent dat je de hele klus opnieuw doet.

![Zes afbeeldingen in de volgorde waarin ze voorbijkomen, elk met een duurveld, boven een rij die alle duren tegelijk zet.](https://abox.tools/screens/turn-images-into-a-video/order.webp)

De volgorde is de lijst, en de lijst kun je slepen. Hij komt uit de volgorde waarin je ze hebt toegevoegd, en dat is niet de volgorde die de bestandsnamen suggereren.

## Er zit geen geluidsspoor in, en dat is niet niks

De mp4 die deze tool schrijft heeft één videospoor en helemaal geen audiospoor. Heeft je diavoorstelling muziek of commentaar nodig, dan heb je voor die stap een video-editor nodig.

Het is het weten waard waarom, en niet alleen dát: audio toevoegen betekent een muziekbestand decoderen, het naar AAC coderen, en het in de container met de video verweven. Alle drie zijn echt werk, en ze slecht doen levert een bestand op dat tijdens het afspelen uit de pas gaat lopen. Het staat op de lijst in plaats van half af te zijn.

Een praktische opmerking als je er achteraf muziek onder zet: kies eerst het nummer en stel de duur per plaatje zo in dat de diavoorstelling dicht bij de lengte van het liedje uitkomt. De muziek inkorten om bij de video te passen klinkt altijd slechter dan de video op de muziek passen.

## Wat eruit komt, en wat je doet als het niet afspeelt

Mp4 met H.264 is het doel, en dat is de breedst afspeelbare combinatie die er is. In een browser zonder WebCodecs valt de tool terug op het opnemen van WebM, oftewel hetzelfde beeld in een container die minder editors en sociale platforms accepteren.

Kom je met een WebM te zitten en weigert iets hem, dan is de oplossing een browser met WebCodecs in plaats van een omzetting: huidige versies van Chrome, Edge en Safari hebben het alle drie. Opnieuw renderen is beter dan omzetten, want omzetten betekent nog een generatie verliesgevende codering.

In de tool zit geen limiet op hoeveel plaatjes je kunt gebruiken. Het plafond is het geheugen van je eigen apparaat, want de gereedgekomen video wordt daar opgebouwd voordat je hem downloadt. Bij een lange 4K-diavoorstelling merk je dat het eerst.

## Het bestand kleiner maken

Is het resultaat te groot voor waar het heen gaat, dan op volgorde van wat werkelijk helpt:

**Verlaag de beeldsnelheid.** Bij een stilstaande diavoorstelling kost dit niets zichtbaars en is het de grootste enkele besparing die er te halen valt.

**Verlaag de resolutie.** 1080p in plaats van 4K is een kwart van de pixels, en op een telefoonscherm merkt niemand het.

**Maak hem korter.** Drie seconden per plaatje in plaats van vijf is 40% van de lengte eraf en 40% van het bestand eraf, en meestal een betere diavoorstelling.

De bronfoto's eerst verkleinen helpt niet veel. De video wordt hoe dan ook op de resolutie gecodeerd die jij koos, dus een foto van 4000 pixels en een van 2000 leveren in een 1080p-video vrijwel hetzelfde aantal bytes op. Het maakt het coderen wel sneller, en het schuift dat geheugenplafond op.

## Waarom hier geen server voor nodig is, met één uitzondering erbij gezegd

Video coderen was ooit het duidelijkste geval voor uploaden: browsers konden het niet en een machine met FFmpeg wel. WebCodecs heeft dat veranderd door de hardware-encoder bloot te leggen die al in je apparaat zit, en dat is dezelfde die je telefoon gebruikt om live video op te nemen. De frames samenstellen is een canvas. Geen van beide stappen heeft iets anders nodig dan je eigen hardware.

Eén uitzondering bij deze tool, hardop gezegd in plaats van weggemoffeld: de optionele functie “toevoegen vanaf een webadres” haalt een afbeelding op bij een adres dat jij erin plakt, en de server op dat adres ziet je IP en wat je opvroeg. Dat hoort bij de functie in plaats van dat het een gebrek is, en het is de enige netwerkstap in de hele tool. Gebruik je hem niet, dan verlaat er helemaal niets je apparaat.

[Is het veilig om bestanden naar online omzetters te uploaden?](https://abox.tools/nl/gidsen/is-bestanden-uploaden-veilig/) zet vier controles op een rij die je hetzelfde vertellen over elke tool, deze inbegrepen.
