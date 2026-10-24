# Afbeelding naar SVG — een logo, een sjabloon of een silhouet overtrekken tot curven

Eén vorm, één omtrek. Wijs aan wat er niet in hoort.

> Trek een zwart-witafbeelding over tot een echte svg-omtrek, in je browser. Logo's, sjablonen, handtekeningen, lijntekeningen en silhouetten worden curven die je naar elk formaat kunt schalen. Klik weg wat het overtrekken verkeerd meenam. Er wordt niets geüpload.

Deze pagina is een interactief hulpmiddel dat volledig in je browser draait, op https://abox.tools/nl/afbeelding-naar-svg/ — niets van wat je het geeft wordt geüpload. Hieronder staat alles wat de pagina er in woorden over zegt; om het te gebruiken, open je het adres.

## Je afbeeldingen worden **nooit geüpload**. Er is geen server.

Je eigen browser leest de afbeelding van je schijf, `src/mask.js` maakt er één bit per pixel van, `src/contour.js` loopt langs de rand van de vorm en `src/fit.js` past er curven op — zo'n zeshonderd regels die je kunt lezen, zonder engine erachter en zonder dat er iets gedownload wordt om ze te draaien. Dit gereedschap heeft geen enkele netwerkfunctie: niets om op te halen, niets om te versturen, en geen server aan de andere kant van deze pagina om een tekening naartoe te sturen, ook al zou die functie er zijn.

- ✗ Geen upload
- ✗ Geen account
- ✗ Geen watermerk
- ✓ Werkt offline
- ✓ Open source

## Zo trek je een afbeelding over tot een svg zonder haar te uploaden

1. **Kies de afbeelding.** Een logo, een sjabloon, een handtekening, een stempel, een gescande tekening, een silhouet. Alles met een duidelijke vorm erin trekt goed over; een foto van een kamer niet, en verderop staat daar een eerlijke waarschuwing over in plaats van een verrassing aan het eind. Het bestand wordt rechtstreeks van je schijf gelezen en er wordt ondertussen niets ergens heen gestuurd.
2. **Zeg wat de vorm is.** Een tekening op papier scheidt op **licht en donker**, en het niveau wordt voor je uitgerekend. Een foto van één voorwerp niet — een donkerrode figuur op donkergrijze steen is donker op donker, en geen helderheid scheidt ze. Die wil **het onderwerp**, dat uit een strook langs de rand van de afbeelding leert wat de achtergrond is en alles houdt wat dat niet is.
3. **Kijk naar de rode lijn, niet naar de instellingen.** De omtrek wordt getekend over de pixels waar hij uit komt, want dat is de enige plek waar de vraag beslist kan worden: een omtrek is goed of fout ten opzichte van die pixels en van niets anders. Sleep een van beide afbeeldingen om ze allebei te verschuiven, en rol het wieltje om ver genoeg in te zoomen om te zien wat de lijn echt doet.
4. **Klik weg wat er niet in hoort.** Een spikkel, een nietje, een stempel, een bijschrift, een schaduw. Een klik neemt het hele vlak van die kleur in plaats van één pixel, dus je wijst een vorm aan; klik hem nog eens om hem terug te zetten. Op een ingesloten stuk achtergrond klikken vult het juist, en zo gaat een gat dicht dat geen gat hoort te zijn.
5. **Pas de gladheid alleen aan als het moet.** *Detail* is hoe ver de lijn van de pixels mag afwijken terwijl ze vereenvoudigd wordt, en wordt per vorm uitgerekend tenzij je anders zegt. *Hoekscherpte* bepaalt hoe ver de omtrek moet draaien voordat die draai als hoek blijft staan in plaats van rond te worden afgeslepen. De meeste afbeeldingen hebben aan geen van beide iets te veranderen.
6. **Neem de svg.** Eén bestand, één `<path>`, geen vulregel om je druk over te maken: de omtrekken draaien de ene kant op en de gaten de andere, en dat is wat van een vorm met veertig gaten één element maakt. Hij opent in Illustrator, Inkscape, Figma, een browser en een snijmachine.

## De uitgebreide versie

[Zo trek je een afbeelding over tot een svg](https://abox.tools/nl/gidsen/een-afbeelding-naar-svg-omzetten/): Maak van een logo, een sjabloon, een handtekening of een silhouet een echte vectoromtrek in je browser. Welke afbeeldingen goed overtrekken, welke dat nooit zullen doen, en hoe je verbetert wat de overtrekker fout doet.

## Ook in de gereedschapskist

- [Lengtevergelijker](https://abox.tools/nl/lengtes-vergelijken/): Typ de lengtes, neem de afbeelding mee. Er wordt niets verstuurd om hem te tekenen.
- [Afbeeldingscompressor](https://abox.tools/nl/afbeelding-comprimeren/): Jij noemt de grootte. De rest rekent de tool uit.
- [Afbeeldingsformaat wijzigen](https://abox.tools/nl/afbeelding-formaat-wijzigen/): Noem het formaat. Sleep het kader. Kies het bestandstype.
- [HEIC naar JPG](https://abox.tools/nl/heic-naar-jpg/): De foto's die een iPhone maakt, in een formaat dat overal opengaat.

## Vragen

### Wordt mijn afbeelding ergens geüpload?

Nee. Het bestand wordt door je eigen browser op je eigen hardware gelezen, overgetrokken door een paar honderd regels JavaScript van deze oorsprong, en als download teruggegeven. Dit gereedschap heeft geen enkele netwerkfunctie — het haalt nooit iets op en verstuurt nooit iets — en de `Content-Security-Policy` van de pagina noemt elk adres dat ze mag benaderen, waarvan geen enkel van deze site is.

### Maakt dit van mijn foto een svg?

Niet op een bruikbare manier, en de pagina zegt het je in plaats van het je na het downloaden te laten ontdekken. Overtrekken maakt van elk vlak met ongeveer dezelfde kleur een eigen vorm, dus een foto komt terug als duizenden overlappende klodders en een bestand dat vele malen groter is dan de jpeg, traag opent en niet op de foto lijkt. Wat goed overtrekt is een afbeelding met een *vorm* erin: een logo, een sjabloon, een handtekening, een lijntekening, een silhouet. Voor een foto van één voorwerp snijdt de instelling *het onderwerp* het uit als één silhouet, en dat is iets anders en werkelijk nuttig.

### Wat is het verschil tussen de twee manieren om de vorm te vinden?

De vraag die ze stellen. **Licht en donker** vraagt of elke pixel donkerder is dan één niveau, wat precies goed is voor inkt op papier en nutteloos als onderwerp en achtergrond even donker zijn. **Het onderwerp** vraagt wat de achtergrond is — het leert dat uit een strook langs de rand van de afbeelding, meet elke pixel ertegen af en houdt het grootste ding dat het niet is. Dat werkt op een foto van één voorwerp tegen een redelijk effen achtergrond, en faalt op een afbeelding die zo strak is bijgesneden dat het onderwerp er aan drie kanten uitloopt, want de randen waar het van leert zijn dan het onderwerp zelf. Je kunt in dat geval zelf de achtergrond aanwijzen.

### Waarom heeft de overgetrokken vorm gaten, of raakt hij dunne delen kwijt?

Omdat de afbeelding die al had zodra ze één bit per pixel werd. Zet *wat de overtrekker kreeg* aan om het te zien: onder ongeveer twaalf pixels is het oog van een letter al dichtgelopen en zijn de stokken al versmolten, en geen overtrekken haalt een gat terug dat er niet is. De oplossingen zitten eerder in de keten — verschuif de drempel, of begin met een grotere scan. In de stand *het onderwerp* dicht *gaten sluiten tot* kleine gaten en sluit *helemaal opvullen* elk gat dat de achtergrond vanaf de rand van de afbeelding niet kan bereiken.

### Kan ik de delen die het fout had verbeteren?

Ja, en daar is de derde stap grotendeels voor. Klik op alles wat niet in de tekening hoort en het verdwijnt; klik het nog eens en het komt terug. Een klik neemt het hele vlak van die kleur, dus één klik verwijdert een hele spikkel of een hele stempel in plaats van een pixel. Op een ingesloten stuk achtergrond klikken vult het. Verbeteringen worden los van de drempel bewaard, dus de schuif daarna verplaatsen gooit ze niet weg.

### Hoe groot wordt de svg?

Voor een vorm kleiner dan de afbeelding: een overgetrokken silhouet is meestal één tot vijf kilobyte, en een logo een paar meer. De pagina zegt het precies, naast de download. Voor een foto wordt hij enorm, wat het duidelijkste teken is dat dit het verkeerde gereedschap is voor dat bestand — en voorbij ongeveer duizend losse vormen stopt de pagina met tekenen en zegt dat.

### Trekt het in kleur over?

Nee. Dit maakt één vorm in één kleur, en dat is het geval dat eruit komt als een tekening in plaats van als een slechte fotokopie. In kleur overtrekken betekent terugbrengen tot een paar kleuren en elk daarvan als eigen laag overtrekken, en het resultaat stelt de meeste mensen die erom vragen teleur. Heb je kleur nodig, trek de vorm dan hier over en vul hem in je tekenprogramma.

### Wat kan ik daarna met de svg?

Hem naar elk formaat schalen zonder dat hij zacht wordt, hem met één attribuut een andere kleur geven, animeren, afdrukken, of naar een snijmachine of een laser sturen. Het is één `<path>` zonder vulregel om fout te zetten, dus Illustrator, Inkscape, Figma, een browser en de meeste CNC-software lezen hem allemaal hetzelfde.

### Zit er een grens aan de grootte van de afbeelding?

Die van je machine, niet die van ons. Een A4'tje gescand op 300 dpi — zo'n negen megapixel — trekt over in een fractie van een seconde. Grotere afbeeldingen werken ook; ze duren alleen langer, en het werk gebeurt op je eigen processor in plaats van in een wachtrij ergens.

### Is het gratis, en heb ik een account nodig?

Het is gratis, en er is geen account, geen inloggen, geen proefperiode en geen watermerk. Er zit ook geen grens aan het aantal of de grootte van de bestanden, want er is geen server die ervoor betaalt — het werk gebeurt op je eigen machine. De site draagt advertenties, en die betalen ervoor; de advertenties krijgen niets over je bestanden.

### Werkt het offline?

Ja. Laad de pagina één keer, verbreek dan de internetverbinding, en ze blijft werken. Dat is ook de simpelste manier om te bewijzen dat er niets wordt geüpload: een gereedschap dat je afbeelding wegstuurde om overgetrokken te worden zou stilvallen zodra je de stekker eruit trok.

## Hoe je de privacybelofte controleert

- **Je afbeelding kan nergens heen.** De Content-Security-Policy noemt elk adres dat deze pagina mag benaderen, en geen daarvan is van deze site. Er is hier geen eindpunt waar je bestanden verzameld zouden kunnen worden, en niets in de code dat ze erheen zou sturen als het er was.
- **Niets hier haalt iets op.** Er staat nergens in `src/` een `fetch`, een `XMLHttpRequest` of een `sendBeacon`. Het hele gereedschap is rekenwerk op de pixels van één afbeelding: een drempel, een wandeling langs de rand van wat het vond, en wat curven passen.
- **Er is geen engine om te downloaden.** Overtrekken is meestal het programma van iemand anders, en op het web betekent dat een paar megabyte gecompileerde code die binnenkomt vóór de eerste klik. Dat is hier niet. Het hele ding is een paar honderd regels gewoon JavaScript van deze oorsprong, en daarom werkt de pagina ook zodra ze opent in plaats van na een wachttijd.
- **Wat Google laadt, en wat het niet krijgt.** De advertentie- en meetscripts komen van Google, en de doneerknop van Buy Me a Coffee. Geen van hen krijgt iets over je afbeelding in handen. Elke regel die haar leest, drempelt of overtrekt wordt van deze oorsprong geserveerd en staat in de repository.
- **Het werkt offline.** Verbreek de netwerkverbinding en het gereedschap is onveranderd, want er zat nooit een netwerkstap in. Dat is het simpelste bewijs van allemaal.

**Controleer het zelf.** Je hoeft niets van het bovenstaande op ons woord aan te nemen. Een buildscript maakt deze pagina uit de sjablonen en de configuratie in de repository, en dat script kun je lezen en zelf draaien. Het resultaat staat vastgelegd op de branch `dist`, dus je kunt wat er geserveerd wordt vergelijken met wat een build van de bronnen oplevert: https://github.com/A-Box-of-Tools/website

De bestanden die je als eerste wilt lezen zijn `config/site.toml` voor de Content-Security-Policy, `src/mask.js` voor hoe een afbeelding één bit per pixel wordt, `src/contour.js` voor de wandeling langs de rand van de vorm, `src/fit.js` voor hoe een trap curven wordt, en `src/subject.js` voor hoe de achtergrond wordt bepaald als er geen licht en donker is om op te scheiden.
