# Zo trek je een afbeelding over tot een svg

Een vergrote png is een trap. Een svg is een tekeninstructie, dus scherp op elk formaat — en het een in het ander veranderen heet overtrekken. Het werkt prachtig op vormen en slecht op foto's, en dat verschil is de moeite waard om te begrijpen voordat je begint.

[Open de tool Afbeelding naar SVG](https://abox.tools/nl/afbeelding-naar-svg/): Eén vorm, één omtrek. Wijs aan wat er niet in hoort.

Laatst bijgewerkt 31 augustus 2026

## Het korte antwoord

Open [Afbeelding naar SVG](https://abox.tools/nl/afbeelding-naar-svg/), laat de afbeelding erin vallen en kijk naar de rode lijn. Die lijn is de omtrek zoals hij nu staat, getekend over de pixels waar hij uit komt. Volgt hij de vorm, neem dan het bestand. Zit er iets in dat er niet in hoort — een spikkel, een nietje, een bijschrift, een schaduw —, klik dat dan aan en het verdwijnt.

Alles hieronder gaat over de twee vragen die bepalen of dit überhaupt werkt: **is je afbeelding een vorm of een foto**, en **welke van de twee manieren om de vorm te vinden wil ze**.

![De twee vlakken: links de afbeelding met de rode overgetrokken omtrek eroverheen, rechts de voltooide svg.](https://abox.tools/screens/trace-an-image-into-an-svg/outline.webp)

De omtrek wordt over de afbeelding getekend en niet alleen ernaast. Dat is de enige plek waar de vraag beslist kan worden — een omtrek is goed of fout ten opzichte van die pixels en van niets anders.

## Overtrekken is geen omzetten, en foto's trekken niet over

Een jpeg naar een png omzetten is een omzetting: dezelfde afbeelding, anders beschreven, en onderweg wordt niets beslist. Overtrekken is dat niet. Het gooit bijna alles weg en houdt één ding — de grens van een vorm — en beschrijft die grens dan als curven. Zit er één duidelijke vorm in je afbeelding, dan is dat precies wat je wilde. Is het een foto van een kamer, dan is er geen vorm om te houden, en wat terugkomt is elk vlak van ongeveer dezelfde kleur als eigen klodder.

Dit is geen beperking die nog weggewerkt gaat worden, dus het is de moeite waard om eerlijk te zeggen hoe de getallen eruitzien. Een A4'tje lijntekening trekt over tot drie vormen en zes kilobyte. Een bladzijde handschrift tot vijftig vormen en honderdvijftig. Eén megapixel foto trekt over tot **vierduizend vormen en anderhalve megabyte** — groter dan de jpeg, trager om te openen, en het lijkt niet op de foto. Op dat punt stopt het gereedschap met tekenen en zegt dat, in plaats van het je na het downloaden te laten ontdekken.

![De waarschuwing die verschijnt als een foto wordt overgetrokken: duizenden losse vormen en een heel groot bestand.](https://abox.tools/screens/trace-an-image-into-an-svg/photograph.webp)

Waar een foto op uitkomt die als lijntekening is overgetrokken. Het bestand is nog steeds van jou om te downloaden; de pagina weigert alleen te doen alsof het een tekening is.

Wat goed overtrekt:

- logo's, beeldmerken en monogrammen;
- sjablonen, stempels en snijbestanden;
- handtekeningen en handlettering;
- lijntekeningen, arceringen en stripinkt;
- silhouetten, en alles wat al zwart op wit is.

Er is één fotografische klus die wel werkt, en het is een andere klus: één voorwerp als een massief silhouet uit zijn achtergrond snijden. Daar is de tweede instelling voor.

## De twee manieren om de vorm te vinden

Overtrekken heeft één bit per pixel nodig — erin, of eruit — en er zijn twee manieren om dat te beslissen.

**Licht en donker** vraagt of elke pixel donkerder is dan één niveau, en dat niveau wordt voor je uitgerekend. Dat is precies goed voor inkt op papier, en het is wat je wilt voor elk logo, elke scan en elk sjabloon. Als het fout zit, zit het meestal zichtbaar fout: verschuif de drempel tot de dunne lijnen het overleven zonder dat het papier grijs meekleurt.

**Het onderwerp** stelt een andere vraag, want op een foto heeft de eerste geen antwoord. Een donkerrode figuur op donkergrijze steen is donker op donker: er is geen helderheid die ze scheidt, dus geen drempel kan dat. In plaats daarvan leert dit uit een strook langs de rand van de afbeelding wat de *achtergrond* is, meet het elke pixel daartegen af en houdt het grootste ding over dat het niet is. Een bijschrift in de hoek is niet het grootste ding, dus dat valt weg in plaats van overgetrokken te worden.

Het heeft één faalgeval dat je vooraf wilt kennen: een foto die zo strak is bijgesneden dat het onderwerp aan twee of drie kanten uit beeld loopt. De rand is dan grotendeels onderwerp, dus het model leert de kleuren van het onderwerp zelf en het antwoord komt er binnenstebuiten uit. Daar valt met geen schuif iets aan te doen — de aanname was fout, niet het rekenwerk. Zet *de achtergrond uit de randen leren* uit, vink *klik om in plaats daarvan “dit is achtergrond” te zeggen* aan, en klik de achtergrond twee of drie keer aan.

## Verbeteren wat het fout had, door het aan te wijzen

Een drempel is één getal voor een hele afbeelding, en hij zit altijd ergens fout: een schaduw wordt inkt, een nietje overleeft, het midden van een O loopt dicht. Elk daarvan is een plaatselijke fout met een voor-de-hand-liggende plaatselijke oplossing, en die oplossing is geen volgende schuif — het is het ding aanwijzen.

Klik op alles wat niet in de tekening hoort en het verdwijnt; klik het nog eens en het komt terug. Een klik neemt **het hele vlak van die kleur**, dus één klik verwijdert een hele spikkel of een hele stempel in plaats van een pixel. Op een ingesloten stuk achtergrond klikken vult het juist, en zo gaat een gat dicht dat geen gat hoort te zijn. De regel onder de afbeeldingen zegt vóór je klikt welke van de twee het is en hoe groot, dus een klik die het grootste deel van de afbeelding zou meenemen is nooit een verrassing.

Verbeteringen worden los van de drempel bewaard, dus de schuif daarna verplaatsen gooit ze niet weg, en de afbeelding omkeren keert ze mee om — een spikkel die je verwijderde blijft verwijderd in plaats van terug te komen als een gat in de achtergrond.

## De twee gladheidsgetallen, en wanneer je eraan komt

**Detail** is hoe ver de lijn van de pixels mag afwijken terwijl ze vereenvoudigd wordt. Onder ongeveer één doet het helemaal niets — een traptrede staat een hele pixel naast de lijn waar ze bij hoort, dus een kleinere tolerantie houdt elke trede en er blijft niets over om te vereenvoudigen. Boven ongeveer twee begint het echte curven op te eten. Het wordt per vorm uitgerekend tenzij je anders zegt, want één getal kan niet tegelijk een hele figuur en een twee pixels brede letterstok bedienen.

**Hoekscherpte** is hoe ver de omtrek moet draaien voordat die draai als hoek blijft staan in plaats van tot een curve te worden afgerond. Het is maar de helft van de beslissing — een punt blijft ook een hoek als het ver genoeg van zijn buren af staat, wat elke duidelijke hoek vanzelf vangt —, dus dit getal beslist alleen ooit over de flauwe draaien. Onder ongeveer twintig graden wordt alles een hoek en komt een cirkel terug als veelhoek.

De meeste afbeeldingen hebben aan geen van beide iets te veranderen. Ze zijn de moeite van het kennen waard voor de twee gevallen waarin het wel moet: een scan van heel kleine tekst, die meer detail wil, en een vorm die je op een machine gaat snijden, die meestal minder wil.

## Wat je krijgt, en wat je ermee doet

Eén bestand met één `<path>` erin. Omtrekken draaien de ene kant op en de gaten erin de andere, en dat is wat een vorm met veertig gaten één element laat zijn zonder vulregel om in te stellen — dus Illustrator, Inkscape, Figma, een browser en de meeste snijsoftware lezen hem allemaal hetzelfde.

![De laatste stap: hoeveel vormen en punten de tekening heeft, de grootte en de downloadknop.](https://abox.tools/screens/trace-an-image-into-an-svg/save.webp)

De telling is een blik waard voordat je downloadt. Een tekening is tientallen of honderden punten; duizenden betekent dat de afbeelding een foto was.

De andere kant op — een svg die je al hebt, en een png die je nodig hebt — is [een andere klus met een eigen gids](https://abox.tools/nl/gidsen/een-svg-naar-png-omzetten/). Niets aan overtrekken is omkeerbaar: de svg die hieruit komt is een nieuwe tekening van de vorm, niet de afbeelding waar hij van gemaakt is.
