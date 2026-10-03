# Hoe je van een video een gif maakt

Gif is een formaat uit 1987 dat hele plaatjes opslaat in plaats van beweging, dus een gif die van een video gemaakt is, is altijd groot. Dit gaat over welke van de drie instellingen je verzet wanneer hij te groot is, en hoeveel elk ervan je oplevert.

[Open de tool Video naar gif](https://abox.tools/nl/video-naar-gif/): Kies het stuk, het formaat en de beeldsnelheid.

Laatst bijgewerkt 26 augustus 2026

## Het korte antwoord

Open de [Video-naar-gif-omzetter](https://abox.tools/nl/video-naar-gif/), sleep het filmpje erin, markeer de seconden die je wilt, en laat de breedte op 480 en de snelheid op 12 beelden per seconde staan. Dat is de instelling die de meeste gifs willen. Komt het bestand te groot uit, breng dan de breedte omlaag voordat je iets anders aanraakt, want dat is de instelling die dubbel betaalt.

De rest van deze pagina gaat over waarom, want “mijn gif is 14 MB” is het probleem dat iedereen werkelijk heeft, en welke knop je moet draaien is niet vanzelfsprekend.

## Waarom een gif van een video zo enorm is

Een videocodec slaat *beweging* op. Hij schrijft om de paar seconden één volledig plaatje en daarna, voor elk frame ertussen, een beschrijving van hoe dat plaatje bewoog: dit blok pixels schoof vier naar links, dit gebied werd iets donkerder. Een filmpje van vijf seconden kan een paar honderd kilobyte zijn omdat het grotendeels instructies zijn over een plaatje dat je al hebt.

Gif heeft daar niets van. Het was in 1989 af, voordat dat allemaal bestond. Elk frame is een plaatje, op zichzelf gecomprimeerd met een schema dat voor schermafbeeldingen van een spreadsheet ontworpen is. Er zit nergens in het formaat bewegingsschatting, en er is geen manier om er een toe te voegen.

Het getal om te verwachten is dus **tien keer de grootte van de video**, en geen enkele omzetter praat je daaruit. Wat een goede wel kan, is daar bovenop niets verspillen, en je de drie instellingen geven die het werkelijk bepalen.

![De sectiekaart: een videobeeld met tijdcode en een balk die een stuk van vier seconden gemarkeerd toont binnen een filmpje van twintig.](https://abox.tools/screens/turn-a-video-into-a-gif/section.webp)

Eerst het stuk, want elke instelling eronder wordt vermenigvuldigd met het aantal seconden dat je hebt gehouden.

## De drie instellingen, en wat elk ervan kost

Alles aan de grootte van een gif komt neer op hoeveel pixels erin zitten, en dat is de lengte maal de snelheid maal de oppervlakte van één frame.

- **Het stuk, lineair.** Twee keer zo lang is twee keer zoveel frames en ongeveer twee keer het bestand. Dit is degene die de meeste mensen al begrijpen, en het is het waard om er meedogenloos in te zijn: een gif die in drie seconden zijn punt maakt, is ook een betere gif dan een kleinere.
- **De breedte, kwadratisch.** De breedte halveren halveert de hoogte mee, dus het is een *kwart* van de pixels. Van 640 naar 320 gaan bespaart niet iets minder dan de helft; het bespaart zo'n driekwart. Dit is de instelling waar niemand als eerste naar grijpt en degene die het beste betaalt.
- **De beeldsnelheid, lineair.** Tien beelden per seconde is tweederde van de grootte van vijftien. Het is ook de instelling waarbij het verlies het zichtbaarst is, want beweging die te traag is, leest als kapot in plaats van als klein.

Een uitgewerkt voorbeeld. Zes seconden telefoonfilmpje op zijn eigen ⁦1080×1920⁩ en 30 fps is 180 frames van twee miljoen pixels: zo'n 350 miljoen pixels, en dat is geen gif maar een gijzeling. Diezelfde zes seconden op 480 breed en 12 fps is 72 frames van 400.000 pixels, oftewel 30 miljoen en dus ongeveer een twaalfde, en dat ziet eruit als wat mensen met een gif bedoelen.

![De exportkaart: een breedte van 480, een framesnelheid, een ditherkeuze en een samenvatting die de frames en de grootte schat.](https://abox.tools/screens/turn-a-video-into-a-gif/size.webp)

Drie instellingen en een schatting die met ze meebeweegt. Welke je als eerste uitgeeft is het onderwerp van deze sectie.

## Welke beeldsnelheid je kiest

Twaalf is hier de standaard en verrassend vaak het juiste antwoord. Het is de snelheid die handgetekende animatie al een eeuw gebruikt: snel genoeg dat het oog het als doorlopende beweging leest, traag genoeg dat je niet betaalt voor beelden die niemand kan zien.

- **5 tot 8**: een diavoorstellinggevoel. Prima voor een trage pan of een schermopname waarin niets snel beweegt.
- **10 tot 15**: normaal. Leest als beweging. Vrijwel elke gif die het maken waard is, zit hierin.
- **20 tot 25**: vloeiend, en ruwweg twee keer de grootte van 12 voor een verschil dat de meeste kijkers niet kunnen benoemen. Het waard bij snelle beweging, een sportfragment, alles met een zweeppan erin.

Er is een hard plafond dat je net zo goed kunt kennen: gif slaat op hoe lang elk frame in beeld blijft in honderdsten van een seconde, en elke browser behandelt een vertraging onder twee honderdsten als tien. Vijftig beelden per seconde is dus het echte maximum, en een bestand dat om 100 vraagt speelt stilletjes op 10. Een omzetter die je 60 fps aanbiedt, negeert dat of staat op het punt je te verrassen.

## 256 kleuren, en waar rasteren voor is

De andere helft van de ouderdom van het formaat: een gif draagt één tabel van hoogstens 256 kleuren mee, en elke pixel is een nummer dat daarin wijst. Een videoframe heeft er tot zestien miljoen. Vrijwel dat alles wordt weggegooid, en hóe het weggegooid wordt is grotendeels hoe een gif eruitziet.

Een goede omzetter telt de kleuren in *jouw* filmpje en kiest er 256 die daarbij passen, in plaats van een vaste set te gebruiken. Een opname van een bos krijgt 256 groenen; een opname van een zonsondergang krijgt 256 oranjes. Dat is wat de tool hier doet, over elk frame van het stuk in plaats van alleen het eerste, zodat een kleur die pas aan het eind voorkomt toch een plek krijgt.

**Rasteren** is wat er gebeurt waar de kleur die je nodig hebt toch ontbreekt. In plaats van een heel gebied naar de dichtstbijzijnde beschikbare kleur af te ronden, wat een vloeiende lucht in vier vlakke banden met zichtbare stappen ertussen verandert, wisselt het de twee dichtstbijzijnde kleuren in een fijn patroon af, en op normale kijkafstand mengt je oog ze tot de kleur die er niet is.

- **Laat het aan** bij alles wat fotografisch is: luchten, huid, verlopen, schaduwen, film.
- **Zet het uit** bij vlakke kleur: schermopnames, lijntekeningen, logo's, tekenfilms, alles met grote gebieden van één tint. Er is geen verloop om te beschermen, en het bestand is er kleiner en schoner zonder.

Eén detail dat het weten waard is als je omzetters vergelijkt. De voor de hand liggende manier om te rasteren is foutdiffusie, die de meeste beeldbewerkers gebruiken, en daarbij hangt het resultaat van elke pixel af van de pixels eromheen. In een animatie betekent dat dat een achtergrond die niet beweegt in elk frame toch anders rastert, dus hij kruipt zichtbaar, en elk frame moet volledig opgeslagen worden omdat elke pixel technisch veranderd is. Het alternatief, een geordend raster, hangt alleen af van waar een pixel zit, dus een stilstaande achtergrond blijft volkomen stil. Dat is wat deze tool gebruikt, en het is waarom zijn bestanden zowel kleiner als rustiger zijn.

## Wanneer je helemaal geen gif moet maken

De vraag waard, want het eerlijke antwoord is vaak “niet doen”. Een stille, herhalende mp4 of WebM is ongeveer een tiende van de grootte van dezelfde animatie als gif, speelt hetzelfde af, en is waar elk sociaal platform je gif toch al in omzet nadat je hem geüpload hebt.

Hou de gif waar de bestemming er werkelijk een nodig heeft:

- ergens waar alleen een afbeelding geaccepteerd wordt, zoals een hoop chat-, forum-, wiki- en e-mailsoftware;
- een README of documentatiepagina, waar een gif inline speelt en een video een speler nodig heeft;
- een presentatie of een document dat offline moet blijven bewegen;
- een emoji, een sticker of een reactie, klein genoeg dat het hele rekenwerk hierboven niet uitmaakt.

Waar het geluid ertoe doet, beantwoordt de vraag zichzelf: gif heeft nooit audio gehad en zal die nooit hebben. Knip in plaats daarvan de video, want de [Videoknipper](https://abox.tools/nl/video-knippen/) haalt er een stuk uit zonder er ook maar één frame van te hercoderen.

## Onder een groottelimiet komen

De reden dat iemand een gif afstelt is meestal een limiet aan de andere kant. Ruwweg op volgorde van hoe hard ze bijten:

- **E-mail**: 10 tot 25 MB voor het hele bericht, en een bijlage in de buurt daarvan wordt onderweg door iets weggehaald of teruggestuurd. Mik er ruim onder.
- **Chat en forums**: vaak 8 tot 10 MB, soms veel minder voor een inline voorvertoning in plaats van een download.
- **Een GitHub-README**: 10 MB per bestand, en alles boven een paar megabyte laat de pagina op een telefoon kapot aanvoelen.
- **Sticker- en emojiplekken**: vaak een paar honderd kilobyte, wat een kleine breedte en een kort stuk betekent, en niet een lagere beeldsnelheid.

De volgorde om te proberen wanneer je eroverheen zit: maak het stuk korter, halveer daarna de breedte, verlaag daarna de snelheid, en zet daarna het rasteren uit. De eerste twee zijn samen meer waard dan de laatste twee bij elkaar.

## Hier hoeft niets voor geüpload te worden

Een video naar een gif omzetten is decoderen, schalen, kleuren tellen en comprimeren, vier dingen die een browser al jaren op eigen kracht kan. De tool die bovenaan gelinkt staat doet het allemaal op je eigen apparaat: het bestand wordt van je schijf gelezen, de frames worden door je browser gedecodeerd, en de gif wordt in het geheugen opgebouwd en aan je downloads gegeven.

Dat is hier meer dan gewoonlijk het waard om om te geven. De filmpjes die mensen in gifs veranderen zijn persoonlijk: een moment uit een familievideo, een schermopname van iets op het werk, een paar seconden van een gesprek. Een omzetter die die geüpload wil hebben, vraagt om een kopie ervan, en er is geen technische reden meer om ja te zeggen.
