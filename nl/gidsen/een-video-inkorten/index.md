# Hoe je een video inkort zonder hem opnieuw te coderen

Inkorten verandert niets aan hoe een frame eruitziet, dus een goede knipper raakt ze niet aan, maar verplaatst ze precies zoals ze waren naar een nieuw bestand. Hier staat wat je dat oplevert, en de ene plek waar het zichtbaar wordt.

[Open de tool Videoknipper](https://abox.tools/nl/video-knippen/): Markeer tijdens het afspelen wat het bewaren waard is. Krijg het terug als één video.

Laatst bijgewerkt 26 augustus 2026

## Het korte antwoord

Open de [Videoknipper](https://abox.tools/nl/video-knippen/), sleep het filmpje erin, druk op `I` en `O` om elk stuk te markeren dat je wilt, zo vaak als je wilt, en exporteer. Bij een mp4, mov of m4v gaan de frames die je houdt precies zoals ze waren naar het nieuwe bestand: dezelfde bytes, dezelfde encoderinstellingen, alles hetzelfde. Het geluid gaat monster voor monster mee zonder ooit gedecodeerd te worden.

Dat betekent dat een knip je geen kwaliteit kost, en het is snel: een minuut uit een opname van vier gigabyte halen kost ongeveer wat het kost om die minuut naar schijf te schrijven, omdat naar de frames gewezen wordt in plaats van dat ze geladen worden. De ene plek waar dit zichtbaar wordt, is waar je knip werkelijk landt, en daar gaat de rest van deze pagina over.

## Waarom een knip helemaal geen kwaliteit hoeft te kosten

Inkorten verandert niets aan hoe een frame eruitziet. Elk frame dat je houdt hoort er precies zo uit te komen als het erin ging, dus is er geen reden om het te decoderen en opnieuw te coderen, en alle reden om dat juist niet te doen. Een hercodering is namelijk verliesgevend en zou het hele filmpje een beetje slechter maken alleen om het korter te krijgen.

Een goede knipper hercodeert dus niet. Hij leest de index van het bestand, rekent uit welke gecodeerde frames binnen jouw bereik vallen, en schrijft die bytes naar een nieuwe container met een nieuwe index ervoor. Op die route wordt er helemaal niets gedecodeerd.

Genoeg tools hercoderen toch, want decoderen en opnieuw coderen is veel eenvoudiger te bouwen dan het containerformaat ontleden. Je kunt meestal zien welke soort je gebruikt aan hoe lang het duurt: een kopie wordt begrensd door hoe snel je schijf schrijft, en een hercodering door hoe snel je apparaat video codeert, en dat is honderd keer trager.

## Keyframes, en waarom je knip eerder kan landen

Dit is de beperking waar alles rond inkorten uit volgt.

Video wordt niet opgeslagen als een reeks complete plaatjes. Dat zou enorm zijn. De meeste frames worden opgeslagen als een beschrijving van hoe ze van hun buren verschillen, wat betekent dat ze niet op zichzelf te decoderen zijn, want je hebt de frames eromheen nodig. Alleen een **keyframe** staat als compleet plaatje op zichzelf, en keyframes liggen meestal een tot tien seconden uit elkaar.

Markeer je dus een knip twee seconden na het laatste keyframe, dan kan een knipper die frames kopieert daar niet beginnen. De frames op je markering zijn onleesbaar zonder de reeks die ernaartoe leidt. Hij moet het hele stuk vanaf het keyframe vóór je markering meenemen.

Wat hij daaraan doet, is het interessante deel. Het bestandsformaat heeft een standaardmanier om te zeggen *begin hier met afspelen*. De extra frames zitten dus wel in het bestand, maar de container draagt de speler op ze over te slaan. Elke gangbare speler respecteert dat, en het filmpje begint precies waar jij zei. Een speler die het negeert begint eerder, tot aan het keyframegat.

De tool hier zegt je vóór het exporteren in welk geval je zit en met hoeveel, dus het is een beslissing in plaats van een verrassing.

## Wanneer je een hercodering accepteert

Er is een exacte knip, en die werkt door het openingsstuk opnieuw te coderen: decoderen vanaf het keyframe, en een nieuwe reeks frames wegschrijven die werkelijk begint waar jij markeerde. Hij is trager, en hij kost een beetje kwaliteit, alleen op dat openingsstuk.

Kies hem wanneer het filmpje ergens heen gaat waar de instructie van de container niet gerespecteerd wordt, of waar je de speler niet in de hand hebt: sommige video-editors, sommige omroep- en vergadersystemen, sommige oudere hardwarespelers. Kies de kopie voor al het andere, en dat is vrijwel alles: een browser, een telefoon, een sociaal platform, een mediaspeler.

Een derde optie die niets kost: verplaats je markering. Laat de tool je zien waar de keyframes zitten, dan levert de knip naar het dichtstbijzijnde schuiven je een exacte knip zonder ook maar te hercoderen. Het is zelden een seconde verschil waard om een kopie op te geven.

![De exportkaart: de methode, een kwaliteitsschuif, een schakelaar voor het geluid en een samenvatting die de stukken, de lengte en de grootte telt.](https://abox.tools/screens/trim-a-video/summary.webp)

In de samenvatting valt de beslissing van deze sectie: wat de kopie kost, en wat opnieuw coderen in plaats daarvan zou kosten.

## Een stuk uit het midden halen

Een stuk eruit knippen is een andere handeling dan er een houden, en het is het weten waard dat het ondersteund wordt, want veel knippers doen alleen het tweede. Markeer het stuk dat je niet wilt, kies ervoor het eruit te knippen, en wat aan weerszijden overblijft wordt tot één filmpje aan elkaar gezet met het geluid gelijk mee.

De naad heeft dezelfde keyframebeperking op het punt waar de tweede helft weer begint, om dezelfde reden. Het werkt hier op beide mp4-routes. Het is het ene ding dat de opnameterugval hieronder niet kan, want een opname wordt in één ronde vanaf één afspeelkop gemaakt.

![De tijdlijn met twee gemarkeerde stukken, en eronder een tabel met het begin, het eind en de lengte van elk, plus het totaal dat blijft.](https://abox.tools/screens/trim-a-video/marks.webp)

Twee stukken bewaard uit één filmpje. De tabel is te bewerken, dus een markering die een vijfde seconde te laat viel typ je in plaats van hem opnieuw te zetten.

## Formaten, en de terugval

**Mp4, m4v en mov** worden rechtstreeks gelezen, welke codec er ook in zit, of dat nu H.264, HEVC, AV1 of VP9 is. Frames kopiëren houdt niet in dat ze gedecodeerd worden, dus deze route werkt zelfs voor een codec waarvoor je browser helemaal geen decoder heeft, en dat is een prettig gevolg van niet naar de plaatjes kijken.

**Al het andere dat je browser kan afspelen**, WebM het meest voor de hand liggend, wordt ingekort door het af te spelen en het resultaat op te nemen. Dat werkt, en het heeft twee kosten: het duurt zo lang als het stuk is, en beeld en geluid worden opnieuw gecodeerd.

**Avi, wmv, flv en de meeste mkv's** kan de browser niet lezen en niet afspelen, en de tool zegt dat in plaats van halverwege te stranden. Zet die eerst om naar mp4 met iets dat ze wel aankan.

## Twee dingen die elders stilletjes misgaan

**Draaiing.** Een telefoon filmt liggend en schrijft een draai-instructie in het bestand in plaats van de pixels te draaien. Een knipper die frames kopieert moet die instructie meenemen, of je staande filmpje komt er op zijn kant uit, en dat is de klassieke manier waarop een ingekorte video verpest wordt. De exacte route hier draait de frames terwijl hij ze hercodeert en schrijft een bestand dat helemaal geen draaiing nodig heeft.

**Geluidssynchronisatie.** Audio en video worden als aparte stromen met hun eigen timing opgeslagen, en ze worden niet op dezelfde punten afgehakt. Worden de twee bij de knip niet met opzet uitgelijnd, dan loopt het geluid weg. Op de kopieerroute hier wordt de audio monster voor monster gekopieerd zonder gedecodeerd te worden, dus het is byte voor byte wat er in het bestand zat, en een bewerkingsmarkering houdt hem tot op een duizendste seconde gelijk met het beeld.

## Inkorten is niet bijsnijden

Twee woorden die door elkaar gebruikt worden. Inkorten verandert de lengte van het filmpje; bijsnijden verandert de vorm van het beeld. Wil je een vierkante versie van een liggende video, of moeten de zwarte balken van de zijkanten af, dan is dat de [Videobijsnijder](https://abox.tools/nl/video-bijsnijden/). Anders dan inkorten moet die wel hercoderen, om de reden die [de bijbehorende gids](https://abox.tools/nl/gidsen/een-video-bijsnijden/) uitlegt.

## Waarom hier niets voor geüpload hoeft te worden, en juist hier niet

Video is het bestandstype waarvan mensen het meest verwachten dat het geüpload moet worden, omdat de bestanden groot zijn en het werk zwaar klinkt. Inkorten is het geval waarin dat het minst waar is: op de kopieerroute wordt het bestand nauwelijks gelezen. De tool loopt de index door, rekent uit welke bytebereiken hij houdt, en schrijft die weg. Een bestand van vier gigabyte naar een server uploaden zodat die dat kan doen, zou de traagst denkbare manier zijn om het te regelen.

Het is ook het bestandstype waarbij uploaden het meest kost als je dat liever niet doet: video draagt gezichten, stemmen, huizen en locaties mee op een manier die een document niet doet. De tool hier heeft geen enkele netwerkfunctie, en de `Content-Security-Policy` van de pagina noemt elk adres dat hij mag benaderen; geen ervan hoort bij deze site.

Trek de stekker uit het internet en kort er toch een in, als je liever controleert dan het aanneemt. [Is het veilig om bestanden naar online omzetters te uploaden?](https://abox.tools/nl/gidsen/is-bestanden-uploaden-veilig/) zet er nog drie zulke controles op een rij.
