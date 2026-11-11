# Zo maak je een videominiatuur van precies het juiste beeld

Het verschil tussen een miniatuur en een schermafdruk is ongeveer een kwart seconde: het beeld waarin de ogen open zijn en de bal nog in de lucht hangt. Bij dat beeld komen, op het formaat van het platform, onder zijn bytegrens, is een keten van drie stappen die volledig in je browser draait.

Laatst bijgewerkt 26 augustus 2026

## Het korte antwoord

1. **Pak het beeld.** Open de [Beeldgrijper](https://abox.tools/nl/frame-uit-video-halen/), sleep de video erin en stap door de beeldlijst van het bestand zelf naar het exacte moment. Sla het op als PNG: de verliesvrije kopie, zodat er nog niets besloten is.
2. **Kadreer het beeld.** Breng de PNG naar [Afbeelding verkleinen](https://abox.tools/nl/afbeelding-formaat-wijzigen/): snijd naar de vorm van het platform — 16:9 voor YouTube — en zet de lange zijde vast; 1280 pixels is het getal waar YouTube echt om vraagt.
3. **Land op het plafond.** Eindig bij [Afbeelding comprimeren](https://abox.tools/nl/afbeelding-comprimeren/) met de grens van het platform als doel — 2 MB voor een YouTube-miniatuur — en laat het JPEG of WebP kiezen.

Niets in de keten uploadt iets — wat telt wanneer de video niet gepubliceerd is, en een miniatuur maak je nu juist omdat de video nog niet openbaar is.

## Waarom stappen wint van pauzeren

Een speler pauzeren en een schermafdruk maken verliest twee keer. De pauze valt waar de speler kon stoppen — de dichtstbijzijnde plek, niet het beeld dat je bedoelde — en de schermafdruk is een foto van de speler: zijn resolutie, zijn interface, zijn kleurbehandeling, niet die van het bestand.

De grijper loopt in plaats daarvan door de beeldlijst van het bestand zelf, beeld voor beeld in beide richtingen, en levert het gedecodeerde beeld zelf af, op de volledige resolutie van de video. Een kwart seconde zoeken aan weerszijden van het moment is meestal waar de miniatuur woont: het beeld *tussen* de twee voor de hand liggende, waar de beweging leesbaar is en niets bewogen is.

Sla de vangst op als PNG, ook als de uiteindelijke miniatuur JPEG of WebP wordt. De PNG is een exacte kopie van het beeld; elke beslissing met verlies gebeurt dan één keer, aan het eind, binnen een bytebudget, in plaats van twee keer, stapelend.

![Een stilstaand beeld uit een video met de tijdcode zichtbaar, naast de stap- en schuifknoppen en het precieze moment waar het vandaan komt.](https://abox.tools/screens/make-a-video-thumbnail/frame.webp)

Naar het frame toe stappen, in plaats van pauzeren en een schermafbeelding maken. De sectie hierboven zegt waar het verschil echt in zit.

## De rekensom van het platform

Snijd vóór je comprimeert, om dezelfde reden die de [fotogids](https://abox.tools/nl/gidsen/fotos-klaarmaken-voor-het-web/) geeft: pixels zijn het budget. Een 16:9-snede uit een 4K-beeld teruggebracht naar ⁦1280×720⁩ laat de compressor zijn 2 MB uitgeven aan kwaliteit waar niemand naar hoeft te turen. Het snijkader van de verkleiner klikt vast op 16:9, dus de vorm is een sleep en geen som; tekst en gezichten willen in het middelste tweederde blijven, want feeds ronden de hoeken af en leggen de duur rechtsonder overheen.

![De verkleiner met een breedte van 1280 en een hoogte van 720 ingevuld, en een samenvatting van hoe het beeld eruit komt.](https://abox.tools/screens/make-a-video-thumbnail/size.webp)

En dan het rekenwerk: wat het platform ook vraagt, ingetypt als twee getallen.

## Een contactvel, als het moment zich niet laat vinden

Als het juiste moment ergens in tien minuten beeld verstopt zit, slaat de andere stand van de grijper elke N seconden een stilstaand beeld op en levert de partij als ZIP. Blader door de beelden als door een contactvel, noteer de tijd van het dichtstbijzijnde, en stap vandaar verder. Het is sneller dan de balk schrobben, en je houdt er een map kandidaten aan over voor de dag dat het platform om een andere vorm vraagt.

## Als je dit elke week doet

Dat de stappen hier op drie pagina's wonen is opzet: elke pagina doet één klus, en elke kan in z'n eentje bewijzen dat niets je machine verlaat. Maar elke stap is open source: MIT-licentie, één map per gereedschap, ES-modules zonder dependencies met README's die de decoder, het herbemonsteren en het zoeken naar het bytedoel uitleggen.

Als miniaturen een wekelijkse klus zijn, wijs dan een code-agent naar de [repository](https://github.com/A-Box-of-Tools/website) en vraag om de één-pagina-versie: stappen, snijden naar jouw platformpreset, comprimeren tot zijn plafond, één knop. De modules zijn geschreven om gelezen te worden, en ze meenemen is precies waar de licentie voor bestaat.
