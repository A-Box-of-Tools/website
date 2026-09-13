# Hoe je een svg naar een png omzet op het juiste formaat

Het omzetten is de makkelijke helft. Of het resultaat ergens goed voor is hangt af van de ene vraag waarop niemand je het antwoord aanreikt: hoeveel pixels? Hier staat waar dat getal vandaan komt, en wat een tekening onderweg naar pixels verliest.

[Open de tool SVG naar afbeelding](https://abox.tools/nl/svg-naar-png/): Noem het formaat. Een vector heeft er zelf geen om te verliezen.

Laatst bijgewerkt 26 augustus 2026

## Het korte antwoord

Open [SVG naar afbeelding](https://abox.tools/nl/svg-naar-png/), sleep het bestand erin, en noem een formaat. Heeft niets je verteld welk formaat je moet gebruiken, dan is **1024 pixels op de langste zijde** een goede standaard: groot genoeg voor vrijwel alles en klein genoeg om te mailen. Laat het bestandstype op png staan, laat de achtergrond op transparant staan, en neem het bestand mee.

Alles hieronder gaat over wat je doet wanneer die standaard niet volstaat: wanneer er een getal voor je vastgelegd is, wanneer het naar de drukker gaat, of wanneer het er verkeerd uit komt.

![De voorbeeldkaart: de tekening gerenderd op het gevraagde formaat, met eronder de afmetingen in pixels.](https://abox.tools/screens/convert-an-svg-to-png/preview.webp)

De tool tekent het voordat hij het opslaat, en op het formaat waarop hij het opslaat. Wat er mis is met de export zie je hier het eerst.

## Waarom het formaat jouw beslissing is en niet die van het bestand

Een jpeg is een raster van gemeten pixels; de vraag hoe groot hij is heeft een antwoord. Een svg is helemaal geen plaatje, het is een set instructies van het type “teken hier een cirkel, dit pad in die kleur”, en instructies hebben geen formaat. Een browser kan ze op 16 pixels of op 4000 uitvoeren en het resultaat is even scherp, want hij schaalt niets. Hij tekent opnieuw.

Daarom kan de omzetting geen getal voor je kiezen, en daarom kost het je niets om een groot getal te kiezen. Dit is de ene beeldklus waarbij “maak het groter” gratis is.

De meeste svg-bestanden dragen wel een `width`- en `height`-attribuut mee, en een tool laat dat ook zien, maar het is een standaardwaarde en geen grens. Een icoon dat `width="24"` zegt, zegt alleen dat degene die het tekende een werkbalk van 24 pixels voor ogen had.

## Waar het getal werkelijk vandaan komt

**Voor een website.** Neem de ruimte die de afbeelding op de pagina inneemt in CSS-pixels en vermenigvuldig met de pixeldichtheid van de schermen waar het je om gaat. Een logo in een vak van 200 pixels breed heeft een bestand van 400 pixels nodig voor een Retina-laptop en 600 voor een recente telefoon. Dat is alles wat `@2x` en `@3x` betekenen, en daarom bespaart een tool die ze schrijft je het sommetje drie keer te maken.

**Voor een app-icoon, een winkelvermelding of een favicon.** Het getal is gepubliceerd en er valt niets uit te rekenen: precies wat de pagina van de winkel zegt. Voor een favicon raster je helemaal niet, maar [maak je een .ico](https://abox.tools/nl/gidsen/zelf-een-favicon-maken/), die meerdere formaten in één bestand bevat, omdat een browsertabblad, een bladwijzer en een Windows-snelkoppeling alle drie om een ander vragen.

**Voor drukwerk.** Vermenigvuldig de fysieke maat in inches met de resolutie van de printer. Een logo dat op een visitekaartje twee inch breed komt op 300 dpi is 600 pixels; hetzelfde logo over een A4-pagina, op 8,3 inch, is zo'n 2500. Drukkers vragen standaard om 300 dpi, en voor een grootformaatbanner die je van de overkant van een zaal ziet is 150 ruim voldoende.

**Voor een sociale voorvertoning of een OG-afbeelding.** Het platform noemt een kader, meestal ⁦1200 × 630⁩ voor linkvoorvertoningen, en dat kader heeft een andere vorm dan je logo. Daar is de instelling “opvullen” voor: de tekening gecentreerd op zijn eigen verhoudingen, met een achtergrondkleur die de rest vult, in plaats van een uitgerekt logo dat iedereen vertelt dat je niet gekeken hebt.

Gelden er twee van deze, neem dan de grootste. Een png die groter is dan nodig is een iets grotere download; een die te klein is valt later niet meer te herstellen, om de reden in het volgende deel.

![De formaatkaart: een menu met manieren om het formaat te noemen, op breedte gezet, met 1024 ingevuld en vaste breedtes ernaast.](https://abox.tools/screens/convert-an-svg-to-png/size.webp)

Vijf manieren om hetzelfde te zeggen. Welke de juiste is hangt ervan af of je een getal hebt gekregen of een plek waar het heen moet.

## Je kunt niet terug

Rasteren is eenrichtingsverkeer. Zodra de tekening een png is, is het pixels als elk ander plaatje, en hem daarna vergroten moet detail verzinnen dat nooit gemeten is, met hetzelfde zachte, uitgesmeerde resultaat dat je van een vergrote foto krijgt.

Bewaar dus de svg. Dat is het origineel, het is vrijwel altijd het kleinere bestand, en elk toekomstig formaat komt er perfect uit. De png is een export voor één bepaald gebruik, en heb je een ander formaat nodig, dan is opnieuw exporteren de juiste zet en niet je export schalen.

Er bestaat software die beweert een png terug naar een svg om te zetten. Wat die doet is traceren: gokken welke krommen een raster van pixels zouden kunnen verklaren. Het werkt redelijk op vlak tweekleurig tekenwerk en levert dure onzin op bij al het andere, en het haalt nooit terug wat de originele tekening had.

## Drie dingen veranderen zodra het pixels wordt

Een gerasterde svg die er verkeerd uitziet, ziet er vrijwel altijd verkeerd uit om een van deze drie redenen, en alle drie zijn het weten waard vóór je exporteert in plaats van erna.

**Tekst wordt getekend in het lettertype dat het apparaat heeft.** Een svg met tekst erin bevat het lettertype niet, maar noemt er een en laat het aan de renderer over om het te vinden. Is het lettertype niet geïnstalleerd, dan wordt er een vervanger gebruikt, en die vervanger heeft andere letterbeelden en andere breedtes, dus de tekst kan verschuiven of overlopen. Een bestand dat zijn lettertype van een webadres haalt, is er nog slechter aan toe: een svg die via een `<img>` gerasterd wordt, mag helemaal niets ophalen, dus er komt niets aan.

De oplossing is die elke ontwerper al kent: **zet tekst om naar contouren** voordat je de svg exporteert (Illustrator noemt het Create Outlines, Figma noemt het Flatten, Inkscape noemt het Object to Path). De letters worden meetkunde, het lettertype doet er niet meer toe, en het plaatje ziet er op elk apparaat hetzelfde uit. Doe het wel op een kopie, want tekst die naar contouren omgezet is valt niet meer als tekst te bewerken.

**Haarlijnen worden grijs of verdwijnen.** Een lijn die op jouw gekozen formaat op minder dan één pixel uitkomt, kan niet als een volle lijn getekend worden, dus wordt hij vaag getekend. Daarom ziet een fijn logo dat op 64 pixels gerasterd is er verwassen uit terwijl hetzelfde bestand op 512 er perfect uitziet. Is een klein formaat de eis, dan is het antwoord een vereenvoudigde tekening met zwaardere lijnen en niet een andere exportinstelling, en dat is dezelfde reden waarom een favicon een symbool is en geen woordmerk.

**Animatie stopt.** Een bewegende svg rastert naar één stilstaand beeld: wat het eerste frame ook is. Er is geen exportinstelling die dat verandert. Heb je de beweging nodig, dan heb je een gif of een video nodig, op een andere manier gemaakt.

## Transparantie, en welk bestandstype je kiest

**Png**, tenzij je een reden hebt. Het is verliesloos, het houdt transparantie, en vlakke kleur met harde randen comprimeert er goed in, en daar bestaat een tekening nu juist vooral uit. Een gerasterd logo is meestal een *kleinere* png dan het een jpeg zou zijn, en bovendien een schonere.

**Jpeg** heeft helemaal geen transparantie. Elke transparante pixel moet een kleur worden, en kiest er niets een voor je, dan wordt hij zwart, en daar komt dat logo-op-een-zwart-vlak vandaan dat mensen voor een fout aanzien. Bovendien is jpeg verliesgevend op de manier die juist bij dit soort plaatjes het meest opvalt: een krans van spikkels om elke harde rand. Gebruik het wanneer iets erop staat.

**WebP** doet alles wat png doet, in een kleiner bestand, en wordt door elke huidige browser gelezen. De reden om het niet te gebruiken is wat er ná de browser gebeurt: oudere software, sommige drukkers en een flink aantal uploadformulieren openen er nog steeds geen.

Een achtergrondkleur kiezen bij png is ook een volstrekt gewone wens. Transparantie is alleen nuttig wanneer datgene waar de afbeelding op landt een kleur is die je niet kunt voorspellen; weet je al dat het een witte pagina is, dan voorkomt platslaan op wit een hele soort verrassingen.

## Als de export leeg of verkeerd uit komt

**Niets dan lege ruimte.** Meestal een ontbrekend `xmlns`-attribuut op het wortelelement. Een bestand zonder dat attribuut is voor een afbeeldingstag geen svg, en het tekent als niets. Het bestand in een browser openen is de snelle test: laat de browser ook niets zien, dan is het bestand het probleem en niet de omzetter.

**De tekening is klein, linksboven in de hoek.** Het bestand heeft een `width` en `height` maar geen `viewBox`, dus er is geen coördinatenstelsel om te schalen en het tekenwerk houdt zijn oorspronkelijke eenheden op een groter canvas. Een goede omzetter zet er een viewBox in voor je; heeft die van jou dat niet gedaan, dan lost `viewBox="0 0 *breedte* *hoogte*"` met de hand aan het wortelelement toevoegen het op, en het bestand is platte tekst dus dat kan.

**Een deel van het plaatje ontbreekt.** Iets in het bestand wees naar een adres in plaats van het tekenwerk zelf te bevatten: een ingesloten foto die als link opgeslagen is, een stylesheet, een lettertype. Een rasteraar die weigert die op te halen doet het juiste, en het is dezelfde weigering die belet dat een svg die je ergens gedownload hebt terugrapporteert aan wie hem gemaakt heeft. Exporteer opnieuw uit het tekenprogramma met de afbeeldingen ingesloten.

**Hij weigert een heel groot formaat.** Browsers begrenzen hoe groot een canvas mag zijn, en ze zijn het niet eens over waar: voorbij ruwweg 16.000 pixels op een zijde komt er niets terug, en Safari op een iPhone of iPad geeft het veel eerder op, bij zo'n ⁦4096 × 4096⁩. Een tool die je waarschuwt behoedt je voor een leeg bestand, want dat is wat een browser oplevert wanneer hij op is, in plaats van een foutmelding.

## Hier hoeft niets voor geüpload te worden

Een svg rasteren is iets wat elke browser duizenden keren per dag doet, met dezelfde machinerie die een icoon op een webpagina tekent. Er is geen technische reden voor je tekenwerk om naar een server en terug te reizen om er als png uit te komen, en de tool hier stuurt het nergens heen: de `Content-Security-Policy` van de pagina noemt elk adres dat hij mag benaderen, en geen ervan hoort bij deze site.

Dat telt bij svg zwaarder dan gewoonlijk, want een svg is een document en geen plaatje. Er kan een script en een extern adres in zitten, en een logo dat je van een bureau kreeg is een bestand dat je niet zelf geschreven hebt. Via een afbeeldingstag getekend zit het in wat de specificatie *secure static mode* noemt: het script kan niet draaien en het adres wordt nooit benaderd. De browser dwingt dat af, niet de website.

Laad de pagina, trek de stekker uit het internet, en zet er toch iets om, als je liever controleert dan het aanneemt. [Is het veilig om bestanden naar online omzetters te uploaden?](https://abox.tools/nl/gidsen/is-bestanden-uploaden-veilig/) zet nog drie controles op een rij die je op elke tool kunt loslaten.
