# De foto die je telefoon opsloeg, en het formaat dat niets wil openen

Een iPhone slaat foto's op als HEIC, wat kleiner en beter is dan jpeg en wat een hoop software nog steeds weigert te openen. Dit gaat over wat het formaat werkelijk is, wat omzetten het plaatje kost, en waarom vrijwel elke omzetter wil dat je het eerst uploadt.

[Open de tool HEIC naar JPG](https://abox.tools/nl/heic-naar-jpg/): De foto's die een iPhone maakt, in een formaat dat overal opengaat.

Laatst bijgewerkt 26 augustus 2026

## Het korte antwoord

Open de [HEIC-naar-JPG-omzetter](https://abox.tools/nl/heic-naar-jpg/), sleep de foto's erin, en druk op “Omzetten”. Laat de kwaliteitsschuif staan waar hij staat en laat “hou de datum, de camera en de instellingen” aangevinkt, tenzij je een reden hebt om dat niet te doen. Je krijgt jpeg's terug, elk met een downloadknop, of een zip als het er meerdere zijn.

Er wordt daarbij niets geüpload. Dat is ongebruikelijk voor juist deze klus, en waarom dat zo is, is de interessante helft van deze pagina.

![De optiekaart: een formaatmenu op JPEG, een kwaliteitsschuif op 85 en een schakelaar om de datum, de camera en de plek van het origineel te bewaren.](https://abox.tools/screens/convert-heic-to-jpg/options.webp)

De hele omzetting zijn deze drie. Bij de schakelaar voor metadata is het even stilstaan waard, en de sectie hieronder zegt waarom.

## Wat HEIC eigenlijk is

HEIC is niet echt een beeldformaat op de manier waarop jpeg dat is. Het is een container, opgebouwd uit dezelfde doosstructuur als een mp4, met daarin een stilstaand frame **HEVC**-video. HEVC, ook H.265 genoemd, is de codec die die van je oude camcorder verving, en hij is heel goed: een iPhone-foto in HEIC is ruwweg de helft van de grootte van dezelfde foto als jpeg op dezelfde kwaliteit.

Apple stapte er in iOS 11 op over, in 2017, en zette het als standaard. Wat betekent dat, tenzij iemand naar Instellingen gegaan is en “Meest compatibel” gekozen heeft, elke foto die zijn telefoon het grootste deel van een decennium gemaakt heeft in een formaat staat dat:

- Windows niet voorvertoont zonder een uitbreiding uit de Store;
- de meeste uploadformulieren op het web ronduit weigeren;
- waar een hoop oudere desktopsoftware nooit van gehoord heeft;
- en dat geen enkele webbrowser behalve Safari wil tonen.

Met de foto is niets mis. Het is een beter bestand dan de jpeg geweest zou zijn. Hij is alleen geschreven in een taal die het grootste deel van de wereld nooit geleerd heeft.

## Waarom alleen Safari er een opent

Dit is het stuk dat elke omzetter verklaart die je ooit gebruikt hebt, dus het is een alinea waard.

HEVC decoderen vraagt om een HEVC-decoder, en HEVC is gepatenteerd. De licentieverlening wordt door meer dan één patentpool geregeld, en een decoder meeleveren betekent iemand betalen. Browsers gaan daarmee om door op het besturingssysteem te leunen. Chrome speelt HEVC-*video* gewoon af op een machine waarvan de hardware al een gelicentieerde decoder heeft, alleen is die route aangesloten op videoweergave en niet op stilstaand beeld. Een HEIC die aan `<img>` gegeven wordt, wordt dus geweigerd, in Chrome, Firefox en Edge, op elk besturingssysteem.

Safari op Apple-hardware is de uitzondering, omdat macOS en iOS de decoder hebben en Safari hem mag aanroepen. Overal elders is het plaatje voor de browser domweg niet te decoderen.

Wat een omzetter precies twee mogelijkheden laat, en de keuze daartussen is het hele verhaal van dit soort tools.

## Waarom vrijwel elke HEIC-omzetter een upload wil

Mogelijkheid één: zet de decoder op een server. De foto wordt geüpload, gedecodeerd op een machine die je nooit gezien hebt, opnieuw gecodeerd als jpeg, en teruggestuurd. Dat is wat vrijwel elke “gratis online HEIC-omzetter” doet, en daarom hebben ze allemaal je bestanden nodig. Luiheid is dat niet, want de browser kan het werkelijk niet op eigen kracht.

Wat het kost is het waard om ronduit te zeggen. Foto's van een telefoon zijn de meest persoonlijke bestanden die de meeste mensen hebben, en een HEIC die zo van een iPhone komt, draagt doorgaans de coördinaten van waar hij genomen is mee, tot op een paar meter nauwkeurig, samen met de datum op de seconde en een camera-aanduiding. Een map ervan naar een gratis dienst uploaden betekent zowel de plaatjes als dat weggeven. Wat er daarna gebeurt wordt bepaald door een privacybeleid dat je niet gelezen hebt, op een server die je niet kunt inspecteren, in een rechtsgebied dat je niet gekozen hebt.

Mogelijkheid twee: zet de decoder op de pagina. Dat is wat [deze](https://abox.tools/nl/heic-naar-jpg/) doet. Hij draagt `libheif` mee, gecompileerd naar WebAssembly, als een bestand dat vanaf deze site geserveerd wordt: zo'n 1,4 MB, één keer gedownload en daarna in de cache. Je browser draait het op je eigen apparaat, op je eigen hardware, en de foto gaat nergens heen. Laad de pagina één keer en je kunt de stekker helemaal uit het internet trekken en hij werkt door, en dat is iets wat geen enkele uploadende omzetter kan en het eenvoudigste bewijs dat er is.

Die 1,4 MB is de hele prijs. Zit je op een verbinding met een datalimiet, dan is het een echte kostenpost en het weten waard; daarom zegt de pagina het hardop in plaats van het stilletjes te downloaden.

## Wat omzetten het plaatje kost

HEIC en jpeg zijn verschillende codecs, dus er is geen weg ertussen die niet inhoudt dat het plaatje gedecodeerd en opnieuw gecodeerd wordt. Die tweede codering is verliesgevend. In de praktijk telt dat veel minder dan het klinkt:

- **Op kwaliteit 92**, waar de omzetter begint, is een foto op elk normaal kijkformaat heel moeilijk van het origineel te onderscheiden. Je zoekt naar verschillen in vloeiende verlopen, zoals een strakke lucht, en die vind je meestal niet.
- **De jpeg wordt groter.** Meestal ergens tussen een derde groter en twee keer zo groot, want jpeg is een codec uit 1992 en HEVC niet. Dat is de ruil: een groter bestand dat alles opent.
- **Twee keer omzetten is wat je moet vermijden.** Elke verliesgevende codering kost een beetje. Zet om vanaf de originele HEIC, niet vanaf een jpeg die iemand al voor je gemaakt heeft, en doe het één keer.

Wil je helemaal geen verlies, dan staat png op het formaatmenu. Wees voorbereid op het bestand: een foto als png is meestal vijf tot tien keer zo groot als de jpeg, omdat de compressie van png ontworpen is voor vlakke kleur en lijntekeningen en niet voor gras en huid.

## De datum, de camera en de coördinaten

De gebruikelijke klacht over HEIC-omzetters is dat de foto's terugkomen zonder de dag waarop ze genomen zijn, zodat een vakantie aan foto's onderaan de bibliotheek sorteert onder de datum van vandaag. Dat gebeurt omdat omzetten via een canvas je pixels geeft en verder niets, want een canvas bevat geen tags. Tenzij een omzetter de metagegevens apart gaat ophalen, zijn ze dus domweg weg.

De tool hier kopieert het EXIF-blok uit de HEIC en schrijft het in de jpeg, dus de datum overleeft het. Er is een vinkje, en dat staat standaard aan. Zet het uit en de jpeg komt eruit met het plaatje en verder niets.

Kijk voordat je beslist naar de lijst: bij elke foto staat op de regel of het bestand gps-coördinaten meedraagt, en het staat er voordat er iets omgezet wordt. Gaan de foto's ergens openbaar heen, dan is dat de regel om te lezen. Gaan ze je eigen bibliotheek in, dan is de metagegevens houden vrijwel zeker wat je wilt.

Eén tag verandert er hoe je ook kiest, en het is het weten waard waarom. Een HEIC legt zijn draaiing op twee plekken vast: in de container, en in het EXIF-blok. De decoder past de draaiing van de container toe tijdens het decoderen, dus de pixels die overhandigd worden staan al rechtop. Zou het EXIF dan nog zeggen “draai dit 90 graden”, dan zou een kijker het nog eens doen en zou elke staande foto er op zijn kant uit komen. De oriëntatietag wordt daarom op rechtop gezet en al het andere wordt precies gekopieerd zoals de telefoon het schreef.

Wil je de tags in detail doorlopen, of ze weghalen bij foto's die al jpeg zijn, dan is dat een andere klus en is er [een gids voor](https://abox.tools/nl/gidsen/exif-en-gps-gegevens-verwijderen/).

## Dingen waar mensen op stuklopen

- **Een HEIC die “.jpg” heet.** Komt heel vaak voor: iets heeft hem onderweg hernoemd zonder hem om te zetten, en daarom gaat hij nog steeds niet open. Elk bestand dat op de omzetter gesleept wordt, wordt aan zijn eerste bytes herkend en niet aan zijn naam, dus zo een werkt gewoon. Het is ook waarom een bestand dat werkelijk een jpeg is dat te horen krijgt in plaats van omgezet te worden in een kopie van zichzelf.
- **Eén bestand, meerdere plaatjes.** Een burst of een Live Photo kan meer dan één stilstaand beeld bevatten. Ze worden allemaal omgezet, en de extra worden genummerd achter de originele naam. De videohelft van een Live Photo is een apart bestand dat de telefoon naast de HEIC bewaart, dus dat zit er niet in om om te zetten.
- **AVIF is geen HEIC.** Ze lijken op elkaar, met dezelfde container en een andere codec erin, maar elke huidige browser opent een AVIF vanzelf. Er valt dus niets om te zetten, en de tool zegt dat ook, in plaats van te doen alsof hij werkt.
- **Het probleem bij de bron stoppen.** Op de telefoon: Instellingen → Camera → Structuren → Meest compatibel. Nieuwe foto's zijn vanaf dan jpeg's. Het gebruikt meer opslag en het raakt de foto's die je al hebt niet aan, maar het betekent dat je dit nooit meer hoeft te doen.
- **Delen zet soms al om.** Een foto via AirDrop of e-mail naar een niet-Apple-apparaat sturen levert vaak een jpeg op, omdat iOS op de uitgang omzet. Is een foto toch als HEIC aangekomen, dan is hij binnengekomen via een route die dat niet deed.

## Hoe je ziet of een omzetter uploadt

Dit geldt voor elke tool, niet alleen voor deze, en het kost een seconde of vijftien.

1. Open de pagina, open daarna de ontwikkelaarsgereedschappen van je browser en ga naar het tabblad Netwerk.
2. Zet een foto om, en kijk mee. Een tool die op je eigen apparaat decodeert, doet op dat moment helemaal geen verzoek. Een tool die uploadt doet er een ter grootte van je foto, en die grootte kun je zien.
3. Of, eenvoudiger: laad de pagina, verbreek de internetverbinding, en probeer iets om te zetten. Een tool die je foto wegstuurde om hem te laten decoderen, houdt op met werken. Een die de decoder meedraagt niet.

De omzetter hier is gebouwd om allebei de controles te doorstaan, en er staat een langere versie van dit betoog in [is het veilig om bestanden te uploaden](https://abox.tools/nl/gidsen/is-bestanden-uploaden-veilig/).
