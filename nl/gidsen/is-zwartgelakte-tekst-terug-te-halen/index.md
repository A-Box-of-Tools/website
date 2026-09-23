# Is zwartgelakte tekst terug te halen?

Ongemakkelijk vaak wel — met het tekstselectiegereedschap, niet met een laboratorium. De meeste zwarte rechthoeken worden *over* de woorden getekend en ernaast opgeslagen, en de woorden reizen eronder mee. Deze pagina is de catalogus van de manieren waarop dat gebeurt, en van wat verwijderen in plaats daarvan moet betekenen.

Laatst bijgewerkt 26 augustus 2026

## Het korte antwoord

Ongemakkelijk vaak wel. Niet met forensische middelen: door het zwartgelakte gebied te selecteren en op kopiëren te drukken. De meeste gereedschappen waar mensen naar grijpen als iets verborgen moet worden, tekenen een rechthoek *over* de inhoud en slaan hem *ernaast* op, en alles eronder reist mee in het bestand, geduldig, tot iemand kijkt.

Dit is geen zeldzame fout van slordige mensen. Ze heeft namen uit rechtbankstukken gepubliceerd, ongelakte cijfers uit overheidsrapporten — en in één massale vrijgave van dossierstukken in december 2025 zwartgelakte namen die binnen uren leesbaar waren. De mensen achter die fouten hadden advocaten en procedures. Wat ze niet hadden, is het onderscheid waar deze pagina over gaat: het verschil tussen bedekken en verwijderen.

## De rechthoek die een object is

In een pdf-lezer, een tekstverwerker, een presentatieprogramma of een beeldbewerker met lagen is een getekend zwart vak geen verf. Het is een *object*: een vorm met een positie, een maat en een kleur, in het bestand opgeslagen als eigen ding, vóór tekst die er nog volledig in staat. Het document zegt niet “dit woord is weg”; het zegt “dit woord staat hier, en er staat een rechthoek voor”.

Al het andere volgt daaruit. Selecteer het gebied en kopieer, en het klembord ontvangt de tekst, omdat kopiëren de tekstlaag leest en de versiering ervoor negeert. Open het bestand in een editor en de rechthoek is gewoon opzij te schuiven. Exporteer naar een ander formaat en de lagen worden mogelijk in een andere volgorde platgeslagen. Op het scherm is het vak identiek aan een echte weglakking, en precies daarom overleeft de fout elke controle: het oog controleert de pagina, en de pagina ziet er goed uit.

Pdf voegt er een stillere variant aan toe. Een pdf mag verklaren dat een reeks glyfen iets anders “spelt” dan wat er getekend staat — een toegankelijkheidsfunctie genaamd `/ActualText` — en kopiëren leest de verklaring in plaats van de inkt. Een document kan dus een woord lekken dat niet eens zichtbaar op de pagina staat.

## De vervaging die rekenwerk is

Pixeleren voelt veiliger dan het is. Een mozaïek is een raster van gemiddelden, en een gemiddelde is een *meting* van wat eronder lag: klein en met verlies, maar toch een meting. Voor tekst in een bekend lettertype op een voorspelbare grootte is dat genoeg gebleken om haar terug te lezen: neem elke aannemelijke reeks, teken haar, pixeleer haar op dezelfde manier, en houd de kandidaat over wiens mozaïek past. Niets daarvan vergt een laboratorium; het is een lus en een vergelijking.

Vervagen is in principe erger. Een vervaging is een convolutie — elke uitvoerpixel een gewogen gemiddelde van zijn buren — en convoluties laten zich vaak goed genoeg terugrekenen: deconvolutie is standaardgereedschap in de fotografie, geen exotische aanval. Beide effecten delen bovendien een gebrek dat niets met wiskunde te maken heeft: ze adverteren dat er iets verborgen is en ongeveer hoe lang het is — wat bij een wachtwoord van zes tekens al een aanwijzing is.

Een egale vulling heeft geen van die eigenschappen. Eén kleur, van rand tot rand, draagt van niets een meting. Daarom is dat de standaard in het gereedschap om een [afbeelding onleesbaar te maken](https://abox.tools/nl/afbeelding-onleesbaar-maken/), daarom zeggen de opties pixeleren en vervagen op hun eigen etiket wat ze niet beloven, en daarom meldt de sterkteregelaar een getal in plaats van een bijvoeglijk naamwoord.

## De kopieën die een bestand van zijn verleden bewaart

De derde familie van fouten heeft met het bedekken niets te maken. Bestanden onthouden, op manieren die niets op het scherm laat zien:

- **De metadata van een foto bevat vaak een miniatuur** van het beeld zoals het vóór de bewerking was. Snijd je adres uit een foto, en het EXIF-blok kan nog een verkleinde versie van het onbijgesneden origineel bevatten. De [EXIF-bekijker en -verwijderaar](https://abox.tools/nl/exif-gegevens-verwijderen/) toont dat blok en haalt het eruit; er is [een gids](https://abox.tools/nl/gidsen/exif-en-gps-gegevens-verwijderen/).
- **Sommige editors slaan ter plekke op zonder af te kappen.** Een beroemd paar fouten uit 2023 — in het schermafbeeldingsgereedschap van een telefoon en het knipprogramma van een desktop — liet na het bijsnijden de bytes van het origineel in het bestand achter, zodat het “weggesneden” deel uit de restanten te reconstrueren was.
- **Pdf's kunnen hun eigen geschiedenis meedragen.** Een pdf die met incrementele opslag bewerkt is, hangt de wijzigingen aan het einde van het bestand en laat de eerdere versie er intact in staan, verwijderingen inbegrepen.

De rode draad: wat een viewer toont en wat een bestand bevat zijn verschillende vragen, en een weglakking die alleen op het oog gecontroleerd is, heeft alleen de eerste beantwoord.

## Wat verwijderen werkelijk vergt

Een echte weglakking verandert de gegevens, niet het beeld, en ze is te controleren langs dezelfde weg waarlangs ze kan falen: door het bestand te ondervragen, niet het scherm.

Voor een afbeelding betekent dat: de pixels onder het vak houden op te bestaan voordat er ook maar een bestand geschreven wordt. Dat is precies wat het gereedschap om een [afbeelding onleesbaar te maken](https://abox.tools/nl/afbeelding-onleesbaar-maken/) doet — de bedekte waarden worden in het geheugen overschreven en pas daarna aan de encoder gegeven, zodat de uitvoer zwarte pixels bevat waar de inhoud stond, geen zwarte inkt ervoor. De stap-voor-stapversie staat in [de gids voor het onleesbaar maken van een afbeelding](https://abox.tools/nl/gidsen/een-afbeelding-onleesbaar-maken/).

Voor een pdf betekent het: de glyfen worden verwijderd uit de instructies die de pagina tekenen, samen met de verborgen dragers — `/ActualText`-verklaringen, bladwijzers, opmerkingen, formuliervelden. Dat doet het gereedschap om een [pdf onleesbaar te maken](https://abox.tools/nl/pdf-onleesbaar-maken/), en daarna doet het het belangrijkste: het opent zijn eigen uitvoer opnieuw en doorzoekt die op de verwijderde woorden, en **heeft er iets overleefd, dan is er geen download**. De rondleiding staat in [de gids voor het onleesbaar maken van een pdf](https://abox.tools/nl/gidsen/een-pdf-onleesbaar-maken/).

En welk gereedschap je ook gebruikt, waar dan ook: de keuring is aan jou. Selecteer over het weggelakte gebied en kopieer; doorzoek het bestand op het verwijderde woord; open het in een andere viewer. Is de inhoud verwijderd, dan kan niets hem vinden — en of een gereedschap dit in je browser doet, zonder dat je bestand de machine verlaat, is óók een bewering die je kunt controleren in plaats van geloven: [de gids over uploaden](https://abox.tools/nl/gidsen/is-bestanden-uploaden-veilig/) laat zien hoe. Weglakken is de ene klus waarbij het bestand per definitie gevoelig is — en dus de laatste die langs de server van een vreemde zou moeten gaan.
