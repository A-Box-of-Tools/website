# Pdf-pagina's samenvoegen, splitsen en herschikken

Twee documenten aan elkaar plakken is het gewoonste wat iemand met een pdf doet, en het wordt het vaakst gedaan door beide bestanden aan de server van een vreemde te geven. Dat hoeft niet. Hier staat hoe het wel gaat, en wat er stilletjes verdwijnt wanneer een hulpmiddel pagina's herschikt.

[Open de tool Pdf samenvoegen & splitsen](https://abox.tools/nl/pdf-samenvoegen/): Pagina's verschuiven zonder ritje naar een server.

Laatst bijgewerkt 26 augustus 2026

## Het korte antwoord

Open [Pdf samenvoegen & splitsen](https://abox.tools/nl/pdf-samenvoegen/), sleep elk bestand erin dat je wilt gebruiken, en sleep de pagina's in de volgorde die je wilt. Zeg dan of het er als één document of als meerdere uit moet komen, en druk op de knop. Er wordt niets geüpload: de bestanden worden door je eigen browser geopend, uit elkaar gehaald en weer weggeschreven.

De drie klussen waar mensen apart naar zoeken — samenvoegen, splitsen, herschikken — zijn één scherm, want het is één handeling met een andere afloop: kies pagina's, zet ze op volgorde, en beslis in hoeveel bestanden ze eruit komen.

## Twee of meer documenten samenvoegen

Kies het eerste bestand en daarna het tweede; de pagina's van elk bestand komen achteraan de lopende volgorde, dus je kunt bestanden uit verschillende mappen blijven toevoegen zonder opnieuw te beginnen. Zijn ze in de verkeerde volgorde binnengekomen, sleep dan een pagina aan zijn greep, of gebruik de pijlen op elke tegel.

Samenvoegen hercodeert niets. De inhoud van elke pagina en elk lettertype, elke afbeelding en elke vectortekening waarnaar die verwijst worden één-op-één overgezet, dus tekst blijft selecteerbaar en doorzoekbaar en een scan is dezelfde scan. Het samengevoegde bestand is meestal iets kleiner dan de twee invoerbestanden bij elkaar, en dat is geen compressie: het is de structuur rond de pagina's, die één keer in plaats van twee keer wordt geschreven.

Pagina's houden hun eigen formaat. Voeg een A4-rapport samen met een bijlage op Letter-formaat en je krijgt een document met allebei erin, want dat is wat de bestanden zeggen. Andermans pagina's naar één papierformaat schalen is een andere handeling, en niet een die een samenvoeger stilletjes zou moeten doen.

## Eén document in meerdere splitsen

Er zijn vier manieren om te knippen, en welke je wilt hangt af van waaróm je knipt:

- **Om de zoveel pagina's.** Voor een lange scan van iets dat oorspronkelijk een stapel losse documenten was — twaalf loonstroken van twee pagina's elk.
- **Op paginanummers die je noemt.** Voor een rapport met hoofdstukken die op zichtbare pagina's beginnen. Elk nummer dat je intikt begint een nieuw bestand.
- **Eén bestand per pagina.** Om één handtekeningblad of certificaat uit een partij te trekken.
- **Terug naar de bestanden waar ze vandaan kwamen.** Wordt alleen aangeboden als je meer dan één bestand hebt samengevoegd, en is handig na het bewerken: haal in één keer de blanco pagina's uit drie scans, en krijg er drie bestanden voor terug.

Wil je maar een paar pagina's uit een lang document, dan hoef je het helemaal niet te splitsen. Tik de gewenste pagina's in het bereikvak — `1-3, 8, 12-` —, druk op “Alleen deze houden” en bouw één document.

Meer dan één uitvoerbestand wordt als één zipbestand overhandigd. Vijftig downloads zijn vijftig opslagvensters, en daar haakt zo ongeveer iedereen af.

![De uitvoerkaart: opties voor één document of meerdere, splitsen op grootte, bij een paginanummer, of terug naar de bestanden waaruit het is gemaakt.](https://abox.tools/screens/merge-and-split-pdf-files/output.webp)

Splitsen is dezelfde handeling als samenvoegen, andersom uitgevoerd, en daarom is het hier een instelling en geen aparte tool.

## Herschikken, draaien en pagina's weghalen

Sleep een tegel aan zijn greep om hem te verplaatsen. De pijlen op elke tegel schuiven hem één plek op, of draaien hem een kwartslag per keer — en dat is de oplossing voor de pagina die scheef uit de scanner kwam. De × haalt hem weg.

Voor alles wat over meer dan een paar pagina's gaat, gebruik je beter het bereikvak. Het neemt aan wat je op papier zou schrijven: `1-3, 8, 12-`, en ook `oneven`, `even`, `alle` en `laatste`. Houd die, haal die weg, of draai die. Een veelvoorkomende: een dubbelzijdige scan waarbij elke tweede pagina op zijn kop staat, is `even` en twee kwartslagen.

De nummers op de tegels worden onderweg opnieuw genummerd, dus ze betekenen altijd “plek in het afgeronde document” en niet “pagina in het bestand waar hij vandaan kwam”. Er wordt niets geschreven tot je op de knop drukt, dus er valt niets ongedaan te maken — en “terug zoals ze binnenkwamen” zet de oorspronkelijke volgorde van alles weer terug.

![Het paginaraster: elke pagina van twee documenten als miniatuur, in de volgorde waarin ze eruit komen, met knoppen om te draaien, om te keren en te verwijderen.](https://abox.tools/screens/merge-and-split-pdf-files/pages.webp)

Allebei de documenten, pagina voor pagina. Herschikken is slepen; het bereikveld erboven is voor de documenten waar slepen een hele middag zou kosten.

## Wat een herschikking overleeft, en wat niet

Dit is het deel dat geen enkel hulpmiddel je vertelt, en de reden dat een samengevoegd document soms subtiel kapot aanvoelt.

Een pdf is geen stapel pagina's. Het is een graaf, en een flink deel ervan gaat over het document in plaats van over een pagina: het bladwijzerpaneel, de koppelingen, het formulier, de leesvolgorde die een schermlezer aanhoudt, de nummering die de eerste vier pagina's “i, ii, iii, iv” noemt. Verplaats de pagina's en elk daarvan moet opnieuw opgebouwd of laten vallen worden.

- **Bladwijzers worden opnieuw opgebouwd.** Een regel waarvan de pagina er nog is, wijst naar waar die pagina naartoe is gegaan. Een regel waarvan je de pagina hebt weggehaald verdwijnt — tenzij er onder hem regels overleven, dan blijft hij staan als kop, want een hoofdstuktitel staat nog steeds waar het hoofdstuk is. Bij het samenvoegen van meerdere bestanden komen de bladwijzers van elk bestand onder een kop met de bestandsnaam te hangen, en dat is wat een samengevoegd rapport überhaupt doorbladerbaar maakt.
- **Koppelingen worden gevolgd.** Een koppeling van pagina 2 naar pagina 40 weet waar pagina 40 gebleven is, inclusief de benoemde bestemmingen die Word en LaTeX voor elke kop schrijven. Een koppeling waarvan het doel niet is meegekomen blijft met niets achter, in plaats van te wijzen naar de pagina die nu toevallig op die plek staat.
- **Ingevulde formulieren overleven**, en het nieuwe document wordt als formulier aangemeld zodat lezers het ook als zodanig behandelen. Eén eigenaardigheid om te weten: twee velden met dezelfde naam zijn voor elke lezer *één* veld, dus het samenvoegen van twee kopieën van hetzelfde formulier koppelt ze — wat je in het ene tikt, vult het andere.
- **De getagde leesvolgorde niet.** Die beschrijft een reeks die niet meer bestaat, en een verkeerde is voor een schermlezer erger dan geen. Doet de toegankelijkheidstagging van een document ertoe, houd het origineel dan ernaast.
- **Pagina-aanduidingen ook niet.** De nummering “iii, iv, 1, 2” is een uitspraak over een volgorde die je zojuist veranderd hebt.
- **Bijlagen en documentscripts ook niet.** Bestanden die aan het document hangen, horen bij het document en niet bij een pagina. Acties die JavaScript uitvoeren, een formulier ergens heen sturen of een programma starten, gaan niet mee je nieuwe bestand in, en dat is de juiste standaardkeuze voor pagina's die van iemand anders komen.

Een digitale handtekening is een geval apart, en geen beperking van welk hulpmiddel dan ook: een handtekening bevestigt een document zoals het toen was. Verplaats een pagina en hij is verbroken, want dat is precies wat hij hoort te melden.

## Bestanden met een wachtwoord

Een versleutelde pdf wordt geweigerd, ook de soort met een leeg wachtwoord die veel kantoorkopieerapparaten maken. De beveiliging van een document weghalen is een andere klus dan zijn pagina's verplaatsen, en een hulpmiddel dat dat stilletjes deed zou iets doen waar je niet om vroeg. Open het met het wachtwoord in een lezer en bewaar eerst een onbeveiligde kopie.

## Het resultaat controleren

Open het en controleer drie dingen: het aantal pagina's, de volgorde en — als het document ze had — het bladwijzerpaneel en een koppeling of twee.

Het eerste doet het hulpmiddel hier voor je, voordat het je het bestand aanbiedt. Elk afgerond document wordt opnieuw geopend door dezelfde code die je originelen las, en zijn pagina's worden geteld door de paginaboom te belopen in plaats van het getal te geloven dat in het bestand staat. Klopt dat niet met wat je gevraagd hebt, dan wordt er helemaal geen download aangeboden.

## Waarom hier geen server voor nodig is

Samenvoegen klinkt als serverwerk, en het grootste deel van het bestaan van het web was het dat ook. Wat er in feite bij komt kijken is de bestandsstructuur ontleden, de objecten waar een pagina van afhangt naar een nieuw bestand kopiëren, en een verse kruisverwijzingstabel schrijven. Er wordt geen pixel gedecodeerd en er wordt niets getekend. Een browser kan dat alles al jaren.

En dat telt hier zwaarder dan bijna overal, vanwege *wat* mensen samenvoegen. De documenten die gecombineerd worden zijn de documenten die ergens vandaan komen: een contract en zijn handtekeningpagina, een gescand paspoort en een bankafschrift, een doktersbrief en een aanvraagformulier. Een online samenvoeger ontvangt ze allemaal tegelijk, al op volgorde, van één persoon. Het is de meest onthullende upload die de meeste mensen ooit doen.

Het hulpmiddel hier heeft helemaal geen netwerkfunctie, en de `Content-Security-Policy` van de pagina noemt elk adres dat ze mag benaderen, en geen daarvan is van deze site. Laad hem, trek de stekker eruit, en voeg alsnog iets samen.

[Is het veilig om bestanden naar online omzetters te uploaden?](https://abox.tools/nl/gidsen/is-bestanden-uploaden-veilig/) zet nog drie van zulke controles op een rij.
