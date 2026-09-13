# Zo scan je meerdere pagina's naar één kleine PDF

Het klusje is zelden één pagina. Het is een contract met zijn handtekeningenblad, of een jaar aan bonnetjes, en aan het eind een mailbox die alles boven een paar megabyte weigert. Drie tools dekken de hele weg, en het papierwerk blijft er van begin tot eind bij op je eigen machine.

Laatst bijgewerkt 26 augustus 2026

## Het korte antwoord

Fotografeer elke pagina en sleep daarna alle foto's in één keer op de [Documentscanner](https://abox.tools/nl/documenten-scannen/). Die vindt de hoeken van elke pagina, trekt elke foto recht en schrijft *één PDF met één pagina per foto* — er is geen aparte samenvoegstap, en de pagina's staan in de volgorde waarin je ze toevoegde.

Twee tools pakken op waar de scanner stopt. Is een deel van het document al een PDF — het contract dat ze je mailden, rond jouw gescande handtekeningenblad — vlecht ze dan in elkaar met de [PDF-samenvoeger](https://abox.tools/nl/pdf-samenvoegen/). En is het afgewerkte bestand nog groter dan de mailbox toestaat, dan krijgt de [PDF-verkleiner](https://abox.tools/nl/pdf-verkleinen/) het onder de limiet.

Beide overnames zijn één klik: zodra de scanner zijn PDF heeft geschreven, biedt een rij onder de downloadknop aan het resultaat rechtstreeks mee te nemen naar de samenvoeger of de compressor, al geladen — en de samenvoeger geeft zijn eigen resultaat op dezelfde manier door aan de compressor.

Niets in de keten uploadt iets. Dat telt hier zwaarder dan bijna waar ook: wat gescand wordt zijn contracten, identiteitsbewijzen en medische papieren, en de gebruikelijke apps hiervoor sturen elke pagina langs hun servers.

## De foto's goed nemen

De scanner redt verrassend veel — schuine opnames, ongelijk lamplicht, een schaduw over de pagina — maar hij kan niet redden wat de camera nooit heeft vastgelegd. Drie gewoontes dekken het meeste:

- **Vul het kader**, met een rand tafel zichtbaar rond elke zijde. De hoeken worden gevonden door de pagina tegen de achtergrond te zoeken; een pagina die uit de foto loopt, heeft geen hoek om te vinden.
- **Schiet van bovenaf**, ongeveer loodrecht. Perspectief wordt gecorrigeerd, maar de verre rand van een scherende opname heeft minder pixels, en de correctie kan er geen verzinnen.
- **Eén pagina per foto**, in leesvolgorde. Achteraf herschikken werkt ook, maar de volgorde waarin je fotografeert is de volgorde die je krijgt, en op volgorde fotograferen is gratis.

De [scangids](https://abox.tools/nl/gidsen/een-document-scannen-met-je-telefoon/) behandelt de rest — hoe de hoeken worden gevonden, wanneer je ze zelf versleept, en wat de zwart-witmodus met de bestandsgrootte doet.

![De scanner met drie gefotografeerde pagina's in een strook, de eerste open en met de hoeken gemarkeerd.](https://abox.tools/screens/scan-multiple-pages-into-one-pdf/pages.webp)

Drie pagina's, samen gefotografeerd en rechtgetrokken. Elk houdt zijn eigen hoeken, dus één mislukte foto bederft de reeks niet.

## Wanneer de samenvoeger zijn plek verdient

De scanner combineert *foto's*. De samenvoeger combineert *PDF's* — en het midden van een echt klusje is vaak allebei: een zojuist gefotografeerd ondertekend blad, in een document dat als bestand aankwam. Scan eerst je pagina's, sleep dan de scan en de originele PDF samen in de samenvoeger, schuif de pagina's op hun plek, en exporteer één document. Bladwijzers en interne links van het origineel worden herbouwd op de pagina's die overblijven, en ingevulde formuliervelden gaan mee.

Hetzelfde geldt voor scans van verschillende dagen: de PDF van elke sessie valt erin als een blok pagina's, en de samenvoeger is waar de blokken één bestand worden.

![De pdf-bouwer met de drie opgeschoonde pagina's in de lijst, boven de instellingen voor paginaformaat, oriëntatie en marge.](https://abox.tools/screens/scan-multiple-pages-into-one-pdf/document.webp)

En daarna diezelfde drie pagina's als één document, de stap waarin de samenvoeger zijn plek verdient.

## Onder de groottelimiet komen

Probeer eerst de goedkope hefboom, en die zit in de scanner: voor pagina's die inkt op papier zijn — tekst, formulieren, bonnetjes — slaat de zwart-witmodus elke pagina op met één bit per pixel, en de PDF landt meestal ruim onder een megabyte per pagina zonder iets te comprimeren. Kleur is haar kosten alleen waard waar de kleur iets betekent.

Wil het bestand dan nog niet weg — kleurenpagina's, of een samenvoeging die andermans scan binnenhaalde — dan laat de verkleiner eerst zien waar de grootte echt zit, en codeert daarna de pagina-afbeeldingen opnieuw tegen de resolutie waarop ze getoond worden. Hij controleert ook dat het resultaat opent voordat hij het aanbiedt, wat fijn is wanneer het bestand een contract met een deadline is.

## Als je dit elke week doet

Dat de stappen hier op drie pagina's wonen is opzet — elke pagina doet één klus, en elke bewijst op zichzelf dat het papierwerk je machine nooit heeft verlaten. Maar alles ervan is open source: MIT-licentie, één map per tool, ES-modules zonder afhankelijkheden met README's die de hoekenzoeker, het paginakopiëren van de samenvoeger en het budget van de verkleiner uitleggen.

Landt hetzelfde klusje elke week op je bureau, zet dan een codeeragent op de [repository](https://github.com/A-Box-of-Tools/website) en vraag hem die modules samen te stellen tot één pagina ervoor — scannen recht een samengevoegd, verkleind document in, met je voorblad al op zijn plek. De modules zijn geschreven om gelezen te worden, en ze meenemen is precies waar de licentie voor is.
