# Hoe je afbeeldingen samenvoegt tot één pdf

Iemand heeft om “één pdf” gevraagd en jij hebt elf foto's van papier. Dit gaat over de keuzes die het resultaat werkelijk veranderen, namelijk het paginaformaat, de volgorde, de kwaliteit en wat het document over je zegt, en over welke je rustig kunt negeren.

[Open de tool Afbeeldingen naar pdf](https://abox.tools/nl/afbeeldingen-naar-pdf/): Zet je plaatjes in één document.

Laatst bijgewerkt 26 augustus 2026

## Het korte antwoord

Open [Afbeeldingen naar pdf](https://abox.tools/nl/afbeeldingen-naar-pdf/), sleep de plaatjes erin, sleep de tegels tot de volgorde klopt, en maak het document. De standaardinstellingen zijn wat de meeste mensen willen: A4-pagina's, een kleine marge, en foto's die erin gekopieerd worden zonder opnieuw gecodeerd te worden.

De vier dingen die een tweede gedachte waard zijn, zijn de volgorde, het paginaformaat, de kwaliteitsinstelling, en wat het gereedgekomen document over je zegt. In die volgorde van hoe vaak ze misgaan.

![Een voorbeeld van de eerste pagina van de pdf, met ernaast een samenvatting: vier pagina's, paginaformaat gelijk aan elke afbeelding en vier van de vier afbeeldingen onaangeroerd overgenomen.](https://abox.tools/screens/combine-images-into-a-pdf/preview.webp)

Het voorbeeld is de controle die telt: het is de afgewerkte pagina, in de vorm die de afgewerkte pagina krijgt.

## Zorg eerst dat de volgorde klopt

Paginavolgorde is veruit het meest voorkomende wat misgaat, omdat bestandsnamen sorteren op manieren die niemand verwacht. `IMG_2.jpg` komt in een alfabetische sortering ná `IMG_10.jpg`, omdat er teken voor teken vergeleken wordt en `1` vóór `2` komt. Een map met scans die `pagina1` tot `pagina12` heten, komt in vrijwel elke tool in de verkeerde volgorde binnen.

Sorteren op opnamedatum is bij foto's meestal betrouwbaarder, omdat je de pagina's gefotografeerd hebt in de volgorde waarin ze lagen. Hoe dan ook: controleer de tegels voordat je op de knop drukt, in plaats van de pdf achteraf.

## Kwaliteit: het stuk dat de meeste tools stilletjes verkeerd doen

Een pdf kan JPEG-gegevens rechtstreeks meedragen. Dat is een eigenschap van het formaat: de gecomprimeerde bytes van een jpeg kunnen er zo in gezet worden, en de lezer decodeert ze net zoals een browser dat zou doen.

Dat telt, want het betekent dat een foto onderweg naar een pdf niets hoeft te verliezen. Hij wordt nooit gedecodeerd en nooit opnieuw gecomprimeerd; het plaatje in het document is bit voor bit het plaatje in je bestand. Veel tools coderen toch opnieuw, omdat het eenvoudiger is om alles op een canvas te renderen en uniform te coderen. Het resultaat is een generatie kwaliteit die voor niets verloren gaat.

Andere formaten kunnen niet zo meeliften. Png, WebP, HEIC en de rest hebben geen bijpassend filter in pdf, dus die moeten omgezet worden. Je hebt daar een keuze in:

- **Opnieuw coderen als jpeg** (de standaard). Kleinste bestand, een klein kwaliteitsverlies, en het juiste antwoord voor foto's.
- **Verliesloos.** Bewaart de exacte pixels ten koste van een veel groter document. Het juiste antwoord voor schermafbeeldingen, diagrammen en alles met tekst of scherpe randen erin, waar JPEG-artefacten meteen opvallen.

## Paginaformaat, en wanneer “pas op het plaatje” beter is

Een standaardpaginaformaat als A4, Letter, Legal, A3, A5 of Tabloid zet elke afbeelding op een pagina van dat formaat, geschaald om binnen je marge te passen. Gebruik er een wanneer het document geprint gaat worden, of wanneer iemand van een instantie het gaat archiveren.

“Precies de grootte van elk plaatje” laat elke pagina zijn afbeelding volgen, dus er is geen witruimte en helemaal geen schaling. Gebruik het wanneer de pdf een houder voor plaatjes is in plaats van een document: een portfolio, een set schermafbeeldingen, een strip. Geprint ziet het er verkeerd uit, want elke pagina heeft een ander formaat.

Een marge is het waard bij alles wat geprint gaat worden. Printers voor thuis kunnen niet tot aan de rand van het papier printen, en een foto die van rand tot rand staat komt er afgeknipt uit.

### Staande pagina's van liggende foto's

Heb je pagina's papier gefotografeerd met een telefoon op zijn kant, dan is elke afbeelding liggend en staat hij klein midden op een staande pagina. Ze elk een kwartslag draaien voordat je het document bouwt is wat dat oplost, en het is een keuze per afbeelding in plaats van een keuze voor alles, want meestal zijn er een paar wel goed om gegaan.

![De pagina-instellingen: formaat, oriëntatie, hoe de afbeelding de pagina ontmoet, de marge en de achtergrondkleur.](https://abox.tools/screens/combine-images-into-a-pdf/layout.webp)

Paginaformaat en passing bepalen samen of een foto heel te zien is of op het papier bijgesneden. De optie die elke afbeelding volgt omzeilt de vraag helemaal.

## Wat de gereedgekomen pdf over je zegt

Een pdf draagt een informatieblok over het document mee: auteur, producent, aanmaakdatum, soms de titel. Afhankelijk van wat hem schreef kan daar je accountnaam in staan, je apparaatnaam, en het exacte tijdstip waarop je hem maakte.

Daar mag je over nadenken, want een pdf is iets wat mensen naar andere mensen sturen: een sollicitatie, een claim, een document voor een verhuurder. De metagegevens reizen mee, en elke lezer kan ze tonen.

De tool hier laat dat blok leeg op zijn eigen naam na: geen bestandsnamen, geen apparaatnaam, geen gebruikersnaam, en geen aanmaakdatum tenzij je het vinkje aanzet dat erom vraagt. Gebruik je een andere tool, dan is het de moeite waard om de eigenschappen van het resultaat één keer te openen om te zien wat hij geschreven heeft.

Los daarvan: de afbeeldingen zelf. Dragen je foto's EXIF- en gps-tags mee, dan hangt het van de route af wat ermee gebeurt. Een jpeg die zonder hercodering meegekopieerd wordt, houdt wat erin zat; een afbeelding die wel opnieuw gecodeerd wordt, verliest de tags als bijwerking. Maakt het uit, wis de foto's dan eerst met de [EXIF-lezer & -wisser](https://abox.tools/nl/exif-gegevens-verwijderen/). In [de bijbehorende gids](https://abox.tools/nl/gidsen/exif-en-gps-gegevens-verwijderen/) staat wat erin zit.

## Als de pdf te groot uitvalt

Telefoonfoto's zijn groot, en twintig ervan maken een document dat e-mail weigert. Drie dingen om te proberen, op volgorde:

**Verklein de langste zijde.** Een foto van 4000 pixels van een vel papier draagt veel meer detail dan welke lezer of printer ook gaat gebruiken. De lange zijde terugbrengen naar zoiets als 2000 pixels viert meestal het bestand en verandert niets wat iemand op een pagina kan zien.

**Gebruik jpeg in plaats van verliesloos** voor alles wat fotografisch is. Verliesloos is het juiste antwoord voor diagrammen en het verkeerde voor een foto van een pagina.

**Comprimeer het gereedgekomen document.** De [Pdf-compressor](https://abox.tools/nl/pdf-verkleinen/) werkt op basis van hoe groot elke afbeelding op de pagina getekend wordt in plaats van op basis van zijn aantal pixels, en dat is de meting die ertoe doet; [de bijbehorende gids](https://abox.tools/nl/gidsen/een-pdf-kleiner-maken/) gaat over wat dat kost.

In de tool zit geen limiet op hoeveel afbeeldingen je kunt gebruiken. Het praktische plafond is het geheugen van je eigen apparaat, want het gereedgekomen document wordt daar opgebouwd voordat je het downloadt. Bij een paar honderd telefoonfoto's op volle resolutie merk je dat het eerst, en verklein je de langste zijde, dan schuift dat plafond een heel eind op.

## Wat dit je niet gaat opleveren

Een pdf die van foto's gemaakt is, is een pdf vol plaatjes. De woorden erin zijn geen tekst: je kunt er niet in zoeken, ze niet kopiëren, en een schermlezer kan ze niet voorlezen. Dat is een eigenschap van waarmee je begon, niet van de omzetting.

Heb je doorzoekbare tekst nodig, dan heb je ocr nodig, en dat is een andere klus. En bestaat het originele document ergens nog als document, dan wint dat rechtstreeks naar pdf exporteren het altijd van het fotograferen, want dat is kleiner, scherper en doorzoekbaar.

## Waarom hier niets voor geüpload hoeft te worden

Een pdf schrijven is een gestructureerd bestand schrijven: een kop, een set objecten, een kruisverwijzingstabel. Er zit niets in wat een browser niet kan, en er is niets aan de klus dat vereist dat de plaatjes ergens heen reizen.

En dat is hier het waard om om te geven, vanwege wat mensen in deze documenten stoppen. Identiteitspapieren, bankafschriften, brieven van de dokter, getekende contracten. De hele reden dat iemand überhaupt een pdf maakt, is meestal dat hij hem naar een instantie stuurt. De tool hier heeft geen enkele netwerkfunctie, en de `Content-Security-Policy` van de pagina noemt elk adres dat hij mag benaderen; geen ervan hoort bij deze site.

[Is het veilig om bestanden naar online omzetters te uploaden?](https://abox.tools/nl/gidsen/is-bestanden-uploaden-veilig/) zet uiteen hoe je dat zelf controleert, hier of ergens anders.
