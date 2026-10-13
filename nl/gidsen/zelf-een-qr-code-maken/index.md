# Hoe je een qr-code maakt die ook op andermans telefoon scant

Een qr-code maken kost een seconde. Er een maken die werkt op een natte menukaart, in een bushokje, of op een telefoon op armlengte in slecht licht kost vier beslissingen, en alle vier neem je voordat je iets afdrukt. Hier staat wat elk ervan doet.

[Open de tool QR- & barcodegenerator](https://abox.tools/nl/qr-code-maken/): Tik het in, en het wordt een code. Er wordt niets verstuurd om er een te maken.

Laatst bijgewerkt 26 augustus 2026

## Het korte antwoord

Open de [QR- & barcodegenerator](https://abox.tools/nl/qr-code-maken/), plak je link, laat het niveau op **M** en de marge op **4** staan, en download de svg. Druk hem minstens twee centimeter breed af, op iets mats, donker op licht. Scan daarna de gedrukte versie met een telefoon die niet de jouwe is, voordat je er duizend bestelt.

Daarmee is vrijwel elk geval gedekt. De rest van deze pagina gaat over wat je doet wanneer het er geen van is: een code die tegen een stootje moet kunnen, een code met een logo erop, een code die op iets kleins komt, en de ene beslissing die makkelijk misgaat op een manier die je pas een jaar later merkt.

## Wat er werkelijk in een qr-code zit

Een tekenreeks. Meer is het niet. Een qr-code scannen geeft de telefoon een stuk tekst. Al het andere, of dat nu een pagina openen is, verbinding maken met een netwerk of aanbieden een contact te bewaren, is de telefoon die de vorm van die tekst herkent en aanbiedt ernaar te handelen.

Er bestaat dus niet zoiets als een “wifi-qr-code” als soort code. Er bestaat een qr-code met `WIFI:T:WPA;S:Mijn Netwerk;P:het wachtwoord;;` erin, en elke telefoon van het afgelopen decennium weet hoe hij dat leest. De generator laat je precies daarom de uiteindelijke tekenreeks zien: doet een code niet wat je verwachtte, dan is die tekenreeks het enige dat het bekijken waard is.

Het betekent ook dat een qr-code na het afdrukken niet meer te wijzigen is, niet naar huis kan bellen en niet kan verlopen. Dat verandert pas als iemand er een link naar zijn eigen server in gezet heeft, en daar gaat het laatste deel hier over.

![Een afgemaakte QR-code met de feiten eronder: de symbologie, de versie, het foutcorrectieniveau en het aantal tekens dat erin past.](https://abox.tools/screens/make-a-qr-code/result.webp)

Wat er in de code zit, gezegd in de termen die de rest van deze gids gebruikt. De versie groeit met de inhoud mee, en daarom doen de twee instellingen eronder ertoe.

## Beslissing één: het foutcorrectieniveau

Een qr-code draagt naast de gegevens een set controlewoorden mee, zo uitgerekend dat een lezer kan herbouwen wat hij niet kon zien. Daarom scant een code met een afgescheurde hoek nog steeds. Hoeveel van die controlewoorden erin zitten is het niveau, en er zijn er vier:

- **L**: ongeveer 7% van de code mag verloren gaan.
- **M**: ongeveer 15%.
- **Q**: ongeveer 25%.
- **H**: ongeveer 30%.

Meer correctie is niet gratis: de controlegegevens gaan in hetzelfde vierkant, dus dezelfde tekst op H heeft een groter en dichter code nodig dan op L. Ruwweg verdubbelt de stap van L naar H het aantal modules voor dezelfde tekenreeks, en dichtere modules zijn moeilijker voor een camera om te onderscheiden. Er zit hier een echte afweging in en het antwoord hangt af van waar de code heen gaat.

**L** is voor een scherm: een code in een dia, een e-mail, een webpagina. Er gaat niets aan beschadigen en elke extra module maakt hem moeilijker te lezen op afstand.

**M** is de standaard en het juiste antwoord voor het meeste drukwerk. Papier dat wat beduimeld raakt, een flyer, een visitekaartje.

**Q en H** zijn voor codes die het zwaar krijgen: een menukaart die dagelijks afgenomen wordt, een sticker op een machine in een werkplaats, een etiket op een krat, een code in een raam met volle zon. H is ook wat een logo in het midden mogelijk maakt, zoals hieronder staat.

![De QR-opties: een menu voor het foutcorrectieniveau op midden, en een stille zone van vier modules.](https://abox.tools/screens/make-a-qr-code/options.webp)

Beide gaan erover dat de code de echte wereld overleeft, een vouw, een logo, een slechte druk, en beide worden gezet voordat hij getekend wordt.

## Beslissing twee: de marge, die bij de code hoort

De witruimte om een qr-code heen is geen opvulling, en het is geen ontwerpkeuze. Een lezer gebruikt hem om te vinden waar het symbool ophoudt. De specificatie vraagt om vier modules stille ruimte aan elke kant, en een code die tot de rand teruggeknipt is, is veruit de meest voorkomende reden dat een gedrukte code faalt.

Dat is het waard om ronduit te zeggen, want terugknippen is zo'n natuurlijke handeling. De code lijkt te veel wit om zich heen te hebben, dus wordt hij in de opmaak bijgesneden, of op een gekleurd vlak gezet dat tot tegen de vierkantjes loopt, of op een foto geplaatst. Elk daarvan haalt de grens weg die de lezer ging gebruiken.

Ziet de code er met zijn marge te groot uit, maak de code dan kleiner. Haal de marge er niet af.

## Beslissing drie: hoe groot je hem afdrukt

De vuistregel die het contact met de werkelijkheid overleefd heeft is **één op tien**: een code moet ongeveer een tiende zo breed zijn als de afstand waarvandaan hij gescand wordt.

- Een visitekaartje of een menukaart, op 30 cm gelezen: zo'n 2 cm breed.
- Een poster die je van twee meter leest: zo'n 20 cm.
- Een bushokje of een etalage die je van vijf meter leest: zo'n 50 cm.

Twee centimeter is een ondergrens en geen doel. Onder ongeveer 1,5 cm gaat een gewone telefoon worstelen, hoe goed het drukwerk ook is, omdat de losse modules de grootte van een pixel in zijn camera naderen.

Minder tekst betekent minder modules betekent een code die bij een gegeven afdrukformaat op afstand leesbaar is. Dat is meteen een goede reden om een code naar `example.com/x` te laten wijzen in plaats van naar een url met honderd tekens aan volgparameters erachter.

En druk af vanaf de **svg**. Een qr-code bestaat uit randen, en een png heeft een vast aantal pixels om ze van te maken; vergroot er een en elke rand wordt zacht, en dat is precies waar een scanner moeite mee heeft. Een svg is de vierkantjes als instructies, dus die komt scherp uit op een visitekaartje of een billboard.

## Kleur, contrast, en de twee fouten

Een lezer meet het verschil tussen de donkere modules en de lichte, dus contrast is het hele verhaal. Er gaan geregeld twee dingen mis:

**Lichte code op een donkere achtergrond.** Het ziet er opvallend uit, en een flink aantal lezers weigert het ronduit: die zoeken naar donker-op-licht en proberen de omkering niet. Sommige wel. Je weet niet welke jouw klanten hebben.

**Te weinig verschil.** Middengrijs op wit, of twee merkkleuren van vergelijkbaar gewicht, kunnen op het scherm prima meten en op papier falen zodra inktuitvloeiing en de automatische belichting van een telefoon meedoen. Kleur je een code, hou het donkere deel dan werkelijk donker.

Mat wint het van glans voor alles dat onder een lamp gescand wordt, en allebei winnen ze het van op een foto afdrukken. Transparante achtergronden zijn nuttig om een code op een gekleurd vlak te zetten, maar kijk wel wat er werkelijk achter komt, want een transparante code op een donker vlak is de eerste fout hierboven met extra stappen.

## Een logo in het midden

Dit werkt, en het werkt dankzij de foutcorrectie in plaats van ondanks. Op niveau H mag ruwweg 30% van de modules vernield zijn en is de code nog leesbaar. Een logo dat wat minder dan dat bedekt, in het midden, waar geen zoekpatroon zit, is dus schade die de lezer herstelt.

Drie dingen om je aan te houden. Gebruik niveau H. Hou het logo onder ongeveer een vijfde van de oppervlakte, ruim onder de theoretische grens, want drukwerk is niet het enige dat aan je marge knabbelt. En bedek nooit de drie grote vierkanten in de hoeken of de kleinere daarbij in de buurt: dat is hoe een lezer het symbool überhaupt vindt en richt, en geen enkele hoeveelheid foutcorrectie herbouwt ze.

Test hem daarna op echte telefoons. Een logo brengt een code van “werkt altijd” naar “werkt met zoveel marge”, en de enige manier om te weten hoeveel marge er over is, is het te proberen.

## De beslissing waar mensen spijt van krijgen: statisch of “dynamisch”

Zoek naar een qr-generator en de meeste resultaten willen dat je een account maakt, omdat ze *dynamische* codes verkopen. Een dynamische code bevat jouw link niet. Hij bevat een korte link naar de eigen server van de generator, die naar de jouwe doorstuurt.

Wat je daarvoor terugkrijgt is echt: je kunt na het afdrukken wijzigen waar de code heen wijst, en je krijgt een telling van elke scan. Voor een campagne met een oplage van zes cijfers is dat betalen waard.

Wat het kost is ook echt, en dat is het weten waard vooraf in plaats van achteraf:

- **De code stopt met werken wanneer zij stoppen met werken.** Sluit de dienst, loopt het domein af, of verloopt de gratis laag, dan is elke code die je gedrukt hebt dood, en tegen die tijd hangen ze op tienduizend menukaarten.
- **Elke scan is andermans data.** De doorverwijzing ziet het IP-adres, het tijdstip en het apparaat van iedereen die je code scant.
- **De link is van hen, niet van jou.** Wie hem scant ziet een onbekend domein voorbijflitsen, en dat is precies waar mensen wordt verteld argwanend over te zijn.

De middenweg kost niets: zet een statische qr-code om een korte url *op je eigen domein*, en stuur die zelf door. Je houdt de mogelijkheid om de bestemming te wijzigen, je houdt de statistieken, en niets aan de code hangt af van het voortbestaan van een bedrijf dat je nooit ontmoet hebt.

De [generator hier](https://abox.tools/nl/qr-code-maken/) maakt alleen statische codes, en er is geen account aan te maken. Wat je typt is wat de code bevat.

## Voordat je er duizend afdrukt

Scan de code. Niet die op je scherm, maar de gedrukte proef, op de plek waar hij komt te hangen, met een andere telefoon dan die waarop je hem gemaakt hebt. Dat kost een minuut en vangt de hele soort problemen waar deze pagina over gaat: een marge die de opmaak opgegeten heeft, een link die zijn `https://` mist, een kleur die op papier anders meet, een code die op een formaat gedrukt is dat op een bureau werkt en niet op een muur.

En kijk wat er ná de scan gebeurt. Een code die een pagina opent die op een telefoon onleesbaar is, is een code die gefaald heeft, ook al scande hij.

## Hier hoeft niets voor geüpload te worden

Een qr-code is rekenwerk op een tekenreeks. Er is geen bestand te versturen en er is niets wat een server kan en een browser niet, en daarom doet de [tool hier](https://abox.tools/nl/qr-code-maken/) het allemaal op je eigen apparaat en werkt hij met de stekker eruit.

Dat telt zwaarder dan het klinkt, vanwege wat mensen in qr-codes stoppen. Het meest voorkomende gebruik van het wififormaat is het werkelijke wachtwoord van een netwerk, ingetikt op een webpagina. Het is het weten waard of die pagina ergens had om het heen te sturen.
