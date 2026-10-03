# Hoe je een afbeelding naar een exacte bestandsgrootte comprimeert

Iemand heeft je een getal genoemd, 100 KB of 500 KB of 2 MB, en je foto zit er nergens bij in de buurt. Hier staat wat dat getal kost, waar je het aan uitgeeft, en hoe je ziet of het resultaat nog goed genoeg is om te versturen.

[Open de tool Afbeeldingscompressor](https://abox.tools/nl/afbeelding-comprimeren/): Jij noemt de grootte. De rest rekent de tool uit.

Laatst bijgewerkt 26 augustus 2026

## Het korte antwoord

Open de [Afbeeldingscompressor](https://abox.tools/nl/afbeelding-comprimeren/), sleep de foto erin, tik het getal in dat je gekregen hebt, en druk op de knop. Hij codeert het plaatje een paar keer, houdt het beste resultaat dat onder je doel past, en zegt wat dat gekost heeft. Voor de meeste foto's en de meeste doelen is de eerlijke samenvatting dat je het verschil niet zult zien.

De rest van deze pagina is voor wanneer dat niet gebeurt: als het resultaat zacht oogt, als een png nauwelijks beweegt, of als je wilt weten wat de tool werkelijk met je plaatje doet voordat je het naar iemand stuurt.

![De doelkaart: 200 kB ingevuld, knoppen met de gangbare limieten, een formaatmenu en een notitie over wat de tool gaat proberen.](https://abox.tools/screens/compress-an-image-to-a-target-size/target.webp)

Vul het getal in dat je hebt gekregen. Alles eronder is de tool die ernaartoe werkt, in plaats van jij die gokt op een kwaliteitsschuif.

## Waar een groottelimiet eigenlijk om vraagt

Een jpeg of een WebP slaat je foto niet op. Hij slaat er een beschrijving van op, en de kwaliteitsinstelling bepaalt hoe gedetailleerd die beschrijving mag zijn. Draai hem omlaag en het bestand wordt kleiner omdat de beschrijving vager wordt: fijne textuur wordt uitgemiddeld, verlopen krijgen banden, en randen krijgen een vage halo van blokjes.

Een groottelimiet is dus een budget voor detail. De nuttige vraag is niet “haal ik 500 KB”, want elk getal is altijd haalbaar. De nuttige vraag is hoeveel van het plaatje je moet opgeven om daar te komen, en of dat uitmaakt voor waar je het voor gebruikt.

Twee vuistregels. Een foto van een echt tafereel, met gezichten, blad en stof, verbergt compressie goed, omdat het oog geen volkomen vlak gebied heeft waarin het schade opmerkt. Een schermafbeelding, een grafiek, een logo of wat dan ook met grote vlakke kleuren en harde tekstranden laat het meteen zien, en zou meestal een png of een WebP moeten zijn in plaats van een jpeg.

## Waarom er geen formule is, en wat je daaraan doet

Er is geen manier om de kwaliteitsinstelling uit te rekenen die een bestand van 500 KB oplevert. De verhouding tussen die twee hangt volledig af van wat er in het plaatje zit: op dezelfde stand kan een foto van een kale muur er een tiende zo groot uit komen als een foto van een bos. Elke tool die je “kwaliteit: 60” aanbiedt en er het beste van hoopt, gokt namens jou.

De enige betrouwbare methode is proberen. Codeer de afbeelding, kijk naar de grootte, stel bij, codeer opnieuw. Dat met de hand doen is vervelend, en daarom vragen compressors om een kwaliteitsgetal, want zo schuiven ze het vervelende werk naar jou door. Het automatisch doen kost ongeveer acht coderingen, en acht coderingen van een telefoonfoto is een fractie van een seconde op elk apparaat van dit decennium; en daarom vraagt de tool op deze site om de grootte en zoekt hij het zelf uit.

Elke grootte die hij meldt, is een echt gecodeerd bestand en geen schatting. Dat telt wanneer een formulier een harde grens heeft: een schatting die 2% optimistisch is, is een geweigerde upload.

## Geef eerst kwaliteit uit, en pas daarna pixels

Er zijn maar twee manieren om een afbeeldingsbestand kleiner te maken. Je kunt hetzelfde plaatje minder nauwkeurig beschrijven, en dat is kwaliteit. Of je kunt minder pixels beschrijven, en dat is schalen. Ze zijn niet gelijkwaardig, en de volgorde telt.

Kwaliteit gaat eerst, want de eerste 30% of zo van de kwaliteitsverlaging is bij een foto werkelijk onzichtbaar, want je gooit detail weg dat het formaat zorgvuldiger bewaarde dan enig oog kan nagaan. Pixels gaan als tweede, want zodra de kwaliteit ver genoeg zakt dat artefacten zichtbaar worden, ziet een kleiner plaatje op fatsoenlijke kwaliteit er beter uit dan een plaatje op volle grootte dat verpest is. Minder goede pixels winnen het van meer slechte.

Dat is de hele strategie, en die is het weten waard, ook als je een andere tool gebruikt: draai de kwaliteit omlaag tot het er verkeerd begint uit te zien, en maak het plaatje dan kleiner in plaats van hem verder omlaag te draaien.

### Wanneer je met opzet schaalt

Soms waren de pixels nooit nodig. Een foto van 4000 pixels breed die in een kolom van 600 pixels op een webpagina staat, draagt zes keer het detail dat iemand gaat zien. Weet je waar het plaatje uiteindelijk terechtkomt, schaal er dan eerst naartoe en het groottevraagstuk verdwijnt vaak zonder dat er ook maar kwaliteit aan uitgegeven is. [Afbeeldingsformaat wijzigen](https://abox.tools/nl/afbeelding-formaat-wijzigen/) is de tool voor die klus, en [de bijbehorende gids](https://abox.tools/nl/gidsen/formaat-van-een-afbeelding-wijzigen/) gaat over het kiezen van een formaat.

## Een formaat kiezen

Drie formaten zijn het kennen waard, en browsers kunnen ze alle drie schrijven.

- **JPEG** is voor foto's. Het is verliesgevend, het wordt begrepen door alles wat ooit gemaakt is, en voor een plaatje van een echt tafereel is het nog altijd een uitstekende keuze. Transparantie kan het niet opslaan.
- **WebP** is voor dezelfde klus, beter gedaan: ruwweg 25 tot 35% kleiner dan jpeg op een kwaliteit waarvan je het verschil niet ziet, en het houdt transparantie. Elke huidige browser leest het. Een paar oudere desktopprogramma's en sommige zakelijke uploadformulieren nog niet, en dat is de enige echte reden om het niet te gebruiken.
- **PNG** is verliesloos, wat betekent dat het exact is en dat het groot is. Het is het juiste antwoord voor schermafbeeldingen, logo's, lijntekeningen en alles met scherpe randen of vlakke kleur, en het verkeerde antwoord voor een foto.

Legt degene die om het bestand vroeg je niets op, dan brengt WebP je met minder zichtbare schade naar een doel dan jpeg. Gaat het bestand ergens in dat oud is, of in een systeem dat je niet kunt testen, dan is jpeg het veilige antwoord.

## Waarom je png niet veel kleiner wordt

Dit is de meest voorkomende verrassing, en het is geen fout in de tool die je gebruikt. Png is een verliesloos formaat: het slaat de exacte pixels op en het heeft geen kwaliteitsknop om aan te draaien, want zo'n knop zou er een ander formaat van maken. Het enige wat een png-compressor kan doen, is dezelfde pixels slimmer inpakken, en dat levert meestal een paar procent op.

Moet je dus een veel kleiner bestand hebben en moet het een png blijven, dan blijft alleen de grootte over als hendel: minder pixels of minder kleuren. Mag het ophouden een png te zijn, dan is de vraag wat erin zit:

- **Een foto die als png opgeslagen is.** Heel gebruikelijk, meestal per ongeluk, en de makkelijkste winst op deze pagina: hem naar jpeg of WebP omzetten maakt hem vaak vijf tot tien keer kleiner zonder zichtbaar verschil.
- **Een schermafbeelding of een diagram.** Zet om naar WebP, dat ook verliesloos is als je erom vraagt, en dat voor dezelfde pixels meestal kleiner is dan png. Naar jpeg gaan maakt tekstranden vaag.
- **Een logo met transparantie.** WebP houdt de transparantie; jpeg vult hem op met een vaste kleur, en dat is vrijwel nooit wat je wilde.

## Hoe je ziet of het resultaat goed genoeg is

Naar een miniatuur kijken bewijst niets, want op miniatuurformaat ziet alles er prima uit. Twee betere controles:

**Kijk ernaar op volle grootte, naar het vlakste stuk in beeld.** Lucht, huid, een geverfde muur. Compressieschade duikt het eerst op in vloeiende verlopen, als vage blokjes of banden, lang voordat ze gedetailleerde gebieden raakt.

**Lees de meting, als de tool je er een geeft.** De compressor hier decodeert zijn eigen resultaat, vergelijkt het met het origineel en meldt SSIM: een getal dat plaatselijke helderheid, contrast en structuur vergelijkt in plaats van veranderde pixels te tellen, wat veel dichter ligt bij waar een oog zich aan stoort. Boven ruwweg 0,98 zijn de twee plaatjes naast elkaar moeilijk uit elkaar te houden. Onder ongeveer 0,95: kijk voordat je verstuurt. Hij meldt ook PSNR, het klassieke decibelgetal, voor wie dat liever heeft.

Beide worden op je eigen apparaat berekend en aan jou getoond, en daar zijn ze voor: ze maken van “minimaal kwaliteitsverlies” een getal dat je kunt controleren in plaats van een bewering.

![Een resultaatregel met het origineel op 1,4 MB en de gecomprimeerde kopie op 196 kB, de kwaliteit die daar kwam en een link om ze te vergelijken.](https://abox.tools/screens/compress-an-image-to-a-target-size/results.webp)

Wat er echt uit kwam, naast wat erin ging. Via de vergelijklink kom je erachter of dat getal je iets zichtbaars heeft gekost.

## Drie dingen om te weten voordat je het bestand verstuurt

**Comprimeren wist de metagegevens.** Hercoderen betekent het plaatje decoderen tot pixels en die pixels opnieuw coderen, en een canvas vol pixels draagt geen tags. De gps-positie, het cameramodel, de tijdstempels en de rest belanden dus domweg niet in het nieuwe bestand. Meestal is dat mooi meegenomen. Wilde je de tags weg maar het plaatje onaangeroerd, dan is dat een andere klus: de [EXIF-lezer & -wisser](https://abox.tools/nl/exif-gegevens-verwijderen/) herschrijft de container zonder ook maar iets opnieuw te comprimeren, en [de bijbehorende gids](https://abox.tools/nl/gidsen/exif-en-gps-gegevens-verwijderen/) legt uit wat erin zit.

**Comprimeer hetzelfde bestand nooit twee keer.** Elke verliesgevende codering gooit blijvend detail weg, en een al gecomprimeerd plaatje coderen gooit er nog meer weg, inclusief de artefacten uit de eerste ronde, die trouw bewaard blijven ten koste van echt detail. Ga altijd terug naar het origineel en comprimeer één keer.

**Bewaar het origineel.** Van een verliesgevende codering is geen weg terug. Wat je ook verstuurt, bewaar het bestand waarmee je begon ergens.

## Hier hoeft niets voor geüpload te worden

Elke browser levert al jaren een jpeg-, png- en WebP-encoder mee, en dat is dezelfde code die een plaatje uit een canvas opslaat. Een afbeelding comprimeren is een van de klussen waarvoor er geen technische reden is om er überhaupt een server bij te betrekken, en daarom heeft de tool hier er geen: het plaatje wordt op je eigen apparaat gedecodeerd, gecodeerd en gemeten, en er staat in de `Content-Security-Policy` van de pagina geen adres van deze site om het heen te sturen.

De eenvoudigste manier om dat te bevestigen, hier of ergens anders, is de pagina laden, de verbinding verbreken, en toch iets comprimeren. Werkt het nog, dan werd er niets geüpload. [Is het veilig om bestanden naar online omzetters te uploaden?](https://abox.tools/nl/gidsen/is-bestanden-uploaden-veilig/) zet er nog drie zulke controles op een rij.
