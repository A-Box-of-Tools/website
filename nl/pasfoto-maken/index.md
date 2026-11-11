# Pasfoto maken — paspoort- en visumfoto's op maat

Kies het land. Hij past die regel toe, precies.

> Maak een paspoort- of visumfoto volgens de gepubliceerde regel van je land: exacte millimeters en dpi, een meelopende hulplijn voor hoofdhoogte en ooglijn, een achtergrondcontrole, een printklaar vel van 10x15 en een bestand dat binnen de KB-grens van het portaal past. Er wordt niets geüpload.

Deze pagina is een interactief hulpmiddel dat volledig in je browser draait, op https://abox.tools/nl/pasfoto-maken/ — niets van wat je het geeft wordt geüpload. Hieronder staat alles wat de pagina er in woorden over zegt; om het te gebruiken, open je het adres.

## Je foto's worden **nooit geüpload**. Er is geen server.

Het uitsnijden, het meten, het uitlezen van de achtergrond en het printen gebeuren allemaal in je eigen browser, op je eigen hardware, met de JPEG-encoder die er al in zit. Deze tool heeft geen enkele netwerkfunctie, niets op te halen en niets te versturen, en al was die er wel, dan zit er aan de andere kant van deze pagina nog steeds geen server waar een foto van je gezicht naartoe kan.

- ✗ Geen upload
- ✗ Geen account
- ✗ Geen watermerk
- ✓ Werkt offline
- ✓ Open source

## Zo maak je een pasfoto die niet teruggestuurd wordt

1. **Kies de foto.** Een telefoonfoto tegen een effen muur, bij daglicht, van zo'n anderhalve meter afstand. De browser leest hem rechtstreeks van je schijf, en er gaat ondertussen niets ergens heen.
2. **Kies het land en het document.** Het paneel laat dan het printformaat, de hoofdhoogteband, de ooglijn, de achtergrondkleur en de uploadgrenzen van die regel zien, samen met de instantie waar elk cijfer vandaan komt en de datum waarop het gelezen is. Niets op die lijst is gegokt, en alles wat je toegestuurd hebt gekregen en er niet op staat vul je in onder “Ergens anders”.
3. **Controleer de vier stippen op je gezicht.** Kruin, kin en elke pupil — die vier punten zijn het hele verhaal van wat de regel meet. Ze worden gezet door de foto zelf op te meten, en de regel eronder zegt welke dat lukte en welke afgeleid moesten worden. Sleep wat verkeerd is geland, of zet hem op *Ik zet ze zelf* en doe alle vier met de hand. Druk dan op *Pas het kader aan* en de uitsnede landt waar dat land hem hebben wil.
4. **Lees de vier controles, en de achtergrond.** Hoofdhoogte, ooglijn, centrering en scheefstand, elk gemeten aan het kader zoals het nu staat en elk met erbij welke kant je op moet slepen als het buiten de norm valt. De achtergrond wordt uit de bovenkant en de zijkanten van de uitsnede gelezen en vergeleken met de kleur die de regel vraagt; de ongelijkmatigheid, waar foto's werkelijk op worden afgekeurd, wordt los van de kleur gemeten.
5. **Neem de drie bestanden mee.** De print, op de exacte millimeter, met de resolutie in het bestand geschreven zodat een winkel hem op het juiste formaat afdrukt. Het vel, met zo veel kopieën als er op een ⁦10 × 15⁩ passen en snijtekens in de tussenruimtes. En de upload, op het pixelformaat dat het portaal eist en binnen de KB-band die het aan beide kanten afdwingt.

## De uitgebreide versie

[Een pasfoto maken die niet teruggestuurd wordt](https://abox.tools/nl/gidsen/zelf-een-pasfoto-maken/): Waar een pasfoto werkelijk op gemeten wordt — hoofdhoogte, ooglijn, achtergrond —, welk land welke getallen wil, en hoe je de pixel- en KB-grenzen van een online formulier haalt.

## Ook in de gereedschapskist

- [Afbeeldingen stacken](https://abox.tools/nl/afbeeldingen-stacken/): Twintig frames tot één, zonder twintig uploads en zonder RAW-converter.
- [Afbeelding onleesbaar maken](https://abox.tools/nl/afbeelding-onleesbaar-maken/): Wat je afdekt wordt uit het bestand gewist, niet erin verstopt.
- [EXIF-lezer & -wisser](https://abox.tools/nl/exif-gegevens-verwijderen/): Zie wat een foto over je vertelt. Haal het er daarna uit.
- [DICOM-viewer](https://abox.tools/nl/dicom-viewer/): CT, MRI, röntgen en echo, met het venster, de header en de metingen.

## Vragen

### Wordt mijn foto ergens naartoe geüpload?

Nee. Het beeld wordt gedecodeerd, uitgesneden, gemeten en weggeschreven door je eigen browser op je eigen hardware, met de JPEG-encoder die de browser al meelevert. Deze tool heeft geen enkele netwerkfunctie: hij haalt nooit iets op en verstuurt nooit iets, en de `Content-Security-Policy` van de pagina noemt elk adres dat ze mag benaderen, waarvan er geen enkele van ons is. Dat is hier meer waard dan bij de meeste tools: het bestand is een foto van je gezicht.

### Welke landen zitten erin?

De tot nu toe overgenomen specificaties zijn de ICAO-norm zelf, de Verenigde Staten (paspoort en de inschrijving voor de visumloterij, die verschillende uploadregels hebben), het Verenigd Koninkrijk, het Schengenvisum, Duitsland, Canada, Australië, India (paspoort, de afdruk van ⁦35 × 45⁩ mm en de formulierfoto en handtekening voor SSC en UPSC), China en Japan. Elke ingang noemt de instantie waar hij vandaan komt en de datum waarop hij gelezen is. Al het andere vul je in onder “Ergens anders”, waar elk cijfer van jou is; en omdat het grootste deel van de wereld op de ICAO-geometrie uitgeeft, begint die ingang daar ook mee.

### Hoe vindt het de kruin, de kin en de ogen zonder gezichtsmodel?

Door iets aan te nemen wat een algemene gezichtsdetector niet mag aannemen en deze tool wel: al deze regels eisen hetzelfde tafereel — één persoon, recht in de camera, tegen een egale, gelijkmatig verlichte muur. De kleur van de muur wordt dus van de rand van de foto gelezen, alles wat die kleur niet is, is de persoon, en het hoogste daarvan is de kruin, haar inbegrepen. De pupillen worden gezocht als het beste paar plekken dat donkerder is dan zijn eigen omgeving, op gelijke hoogte en aan weerszijden van het midden van het hoofd — een vergelijking die plaatselijk is, dus niets erin hangt af van welke kleur een gezicht heeft. De kin is de enige die zo niet te vinden is, want een kaak tegen een hals is een zachte rand zonder kleurverschil; die wordt afgeleid uit de pupillen, die net onder het midden van een hoofd zitten zodra het haar erboven wordt meegeteld, en daarna tegen de omtrek gehouden. Het is allemaal rekenwerk, in `src/detect.js`: geen gewichten, geen inferentie-omgeving, niets opgehaald, en hetzelfde rekenwerk voor elk gezicht. Dat laatste is wat telt, want een meegeleverde detector heeft het ongelijk mis — slechter bij sommige gezichten dan bij andere — en de mensen van wie de foto’s toch al het vaakst worden afgekeurd zijn juist degenen die hij zou laten vallen.

### Hoeveel moet ik vertrouwen op de stippen die het zet?

Genoeg om ervan uit te gaan, niet genoeg om er niet naar te kijken. Bij elk van de vier hoort een foto waarop het misgaat: een muur met een motief of een boekenkast laat geen omtrek over om een hoofd tegen af te steken, een hoofd dat bovenaan is afgesneden heeft helemaal geen kruin in de foto, en een bril, een dikke pony of dichte ogen kunnen de pupillen op het verkeerde kenmerk zetten. Daarom zegt de tool hardop welke van de vier het gemeten heeft en welke het moest afleiden, weigert het botweg bij een foto zonder egale achtergrond in plaats van een antwoord te verzinnen, en laat het elke stip versleepbaar. De uitsnede wordt genomen waar de stippen uiteindelijk staan, nooit waar ze begonnen. Wil je alle vier liever zelf zetten, dan zegt de schakelaar boven de foto *Ik zet ze zelf*, en een stip met de hand verplaatsen zet hem daar vanzelf op: vanaf dat moment zijn ze van jou en beweegt er niets meer aan.

### Wat is die hoofdhoogteregel, en waarom haalt de mijne die nooit?

Al deze specificaties zeggen hoeveel van het beeld het hoofd moet vullen, gemeten van de onderkant van de kin tot de bovenkant van het hoofd, haar inbegrepen; meestal 70 tot 80 procent, wat bij een foto van 45 mm neerkomt op 31,5 tot 36 mm. De gebruikelijke reden dat het misgaat is een selfie: een armlengte is ongeveer 60 cm, wat het gezicht vervormt en het hoofd te groot in beeld zet. De tweede gebruikelijke reden is de kruin: dat is de bovenkant van het haar, niet de haargrens, en wie de haargrens markeert krijgt elk hoofd te klein.

### Waarom moet het bestand minstens 20 KB zijn, en hoe kan het opgevuld worden?

Indiase examenportalen, het Chinese visumformulier en de upload voor het Britse paspoort noemen naast een maximum ook een minimum bestandsgrootte, omdat een bestand daaronder meestal een miniatuur is die iemand per ongeluk uploadde. Een foto van ⁦200 × 230⁩ is 46.000 pixels, en op de beste kwaliteit die een browser wegschrijft kan hij nog steeds op 15 KB uitkomen, zonder mogelijkheid om hem groter te maken door minder te comprimeren. Dus voegt de tool een JPEG-commentaarsegment vol spaties toe. Dat hoort bij de JPEG-standaard, elke decoder slaat het over, en het beeld is bit voor bit hetzelfde beeld: alleen het bestand is langer. De opvulling zegt precies dat, in het Engels, binnenin het bestand.

### Controleert hij de achtergrond, en kan hij er een vervangen?

Hij controleert en vervangt niet. De kleur wordt gelezen uit een strook over de bovenkant van de uitsnede en langs beide zijkanten, boven de schouders, en vergeleken met de kleur van de regel in CIE Lab in plaats van in RGB: twee grijzen die veertig RGB-eenheden uit elkaar liggen zijn niet te onderscheiden, terwijl veertig eenheden blauw een andere kleur is. Ongelijkmatigheid wordt apart gemeten, want een schaduw op een witte muur is waar foto's werkelijk op worden afgekeurd, en dat is geen kleurprobleem. Een achtergrond vervangen betekent iemand uit een plaatje knippen, en dat is een segmentatiemodel; een slecht model eet haar op. Een halve meter verder van de muur gaan staan lost hier meer van op dan welk filter ook.

### Waar is dat vel van ⁦10 x 15⁩ voor?

Een fotohokje rekent een paar euro voor zes foto's. Een fotobalie print een ⁦10 × 15⁩ voor centen, en dat kan er eentje. Dus legt de tool zo veel kopieën van je foto op het papier als erop passen — acht, voor een ⁦35 × 45⁩ op een ⁦10 × 15⁩ — met snijtekens in de tussenruimtes en niets over een plaatje heen gedrukt. Er wordt niets geschaald: elke kopie heeft precies het formaat dat de regel vraagt, want een vel dat ze twee procent kleiner maakte om er nog eentje bij te proppen zou acht foto's van het verkeerde formaat opleveren. Print hem op 100 procent; “passend maken op pagina” is wat een vel verkeerd laat uitkomen.

### Waarom maakt de dpi uit als de pixels hetzelfde zijn?

Omdat een JPEG kan zeggen welk formaat hij is, en zegt hij het niet, dan gokt wat hem afdrukt. De resolutie staat in de JFIF-kop, en een browsercanvas schrijft die kop met het eenhedenveld op “dit is een beeldverhouding, geen resolutie”. Deze tool herschrijft die paar bytes zodat het bestand 300 dpi meldt, en dat is wat ⁦413 × 531⁩ pixels tot een foto van ⁦35 × 45⁩ mm maakt in plaats van een plaatje van geen bepaald formaat. Er wordt daarvoor niets gedecodeerd en er gaat geen kwaliteit verloren.

### Kan hij ook het handtekeningbestand doen?

Ja — de SSC- en UPSC-formulieren willen er een van ⁦140 × 60⁩ pixels tussen 10 en 20 KB, en die staat als eigen specificatie op de lijst. De gezichtshulplijnen gaan daarvoor uit, want een handtekening heeft geen ooglijn; wat er in plaats daarvan gecontroleerd wordt is dat het papier licht is, dat er inkt op staat, en dat de uitsnede geen liniaal of paginarand heeft meegepakt. De 10 KB halen is het lastige deel van die regel, niet onder de 20 blijven.

### Garandeert dit dat mijn aanvraag geaccepteerd wordt?

Nee, en geen enkele tool kan dat eerlijk beloven. Wat hij doet, is de gepubliceerde cijfers precies toepassen en je elke meting laten zien die hij gedaan heeft, zodat de dingen die een formulier automatisch meet — pixelformaat, bestandsgrootte, formaat — kloppen, en de dingen die een mens beoordeelt — hoofdhoogte, ooglijn, de achtergrond — met getallen erbij voor je neus staan. De regels veranderen bovendien: elke specificatie hier zegt van welke instantie hij komt en wanneer hij gelezen is, zodat je hem kunt toetsen aan het formulier dat je voor je hebt in plaats van op een tabel te vertrouwen.

### Is het gratis, en heb ik een account nodig?

Het is gratis, en er komt geen account, geen inlog, geen proefperiode en geen watermerk over je gezicht aan te pas. Er zit ook geen limiet op hoeveel foto's je maakt, omdat er geen server is die daarvoor betaalt. De site draait op advertenties, en die betalen hem; die advertenties krijgen niets over je foto mee.

### Werkt het offline?

Ja. Laad de pagina één keer, verbreek daarna je internetverbinding en hij werkt gewoon door — het regelboek is een bestand dat met de pagina meekomt, geen opzoeking. Dat is meteen de eenvoudigste manier om te bewijzen dat er niets geüpload wordt: een tool die je foto wegstuurde om hem te laten uitsnijden zou stoppen op het moment dat je de stekker eruit trok.

## Hoe je de privacybelofte controleert

- **Een foto van je gezicht verlaat dit apparaat nooit.** Dat weegt hier zwaarder dan bij de meeste tools: het bestand dat deze pagina in handen heeft is een beeld van je gezicht, en wat je ermee gaat doen noemt bovendien het land waarvan je het document aanvraagt. De `Content-Security-Policy` noemt elk adres dat deze pagina mag benaderen, en geen daarvan is van ons. Er is hier geen eindpunt waar je foto verzameld zou kunnen worden.
- **Niets hier haalt iets op.** Er staat nergens in `src/` een `fetch`, een `XMLHttpRequest` of een `sendBeacon`. Het regelboek is een tabel in `src/specs.js`, meegeleverd met de pagina en met haar in de cache gezet: er is geen landenlijst om op te zoeken en niets waartegen je foto op afstand gecontroleerd wordt.
- **Het gezicht wordt gevonden zonder gezichtsmodel.** Er zijn geen gewichten om te downloaden, geen inferentie-omgeving om ze in te draaien en niets dat wordt opgehaald: de kruin komt uit de omtrek van je hoofd tegen de muur erachter, de pupillen uit de plekken van het gezicht die donkerder zijn dan wat eromheen zit. Niets daarvan leest huidskleur, en dat is precies waarom het zo geschreven is — een model dat het mis heeft, heeft het ongelijk mis: slechter bij sommige gezichten dan bij andere. Het is een startpositie en geen oordeel: de pagina zegt welk van de vier punten ze niet kon meten, elke stip blijft versleepbaar, en met *Ik zet ze zelf* staat het helemaal uit.
- **Wat Google laadt, en wat het niet te zien krijgt.** De advertentie- en meetscripts komen van Google, de doneerknop van Buy Me a Coffee. Geen van alle krijgt iets over je foto, je gezicht of het land waarvan je de regel koos. Elke regel die een bestand leest, uitsnijdt, meet of schrijft, wordt vanaf deze herkomst geserveerd en staat in de repository.
- **Het werkt offline.** Verbreek de verbinding en de tool werkt onveranderd door, omdat er nooit een netwerkstap in zat. Eenvoudiger bewijs bestaat er niet.

**Controleer het zelf.** Je hoeft niets van het bovenstaande op ons woord aan te nemen. Een buildscript maakt deze pagina uit de sjablonen en de configuratie in de repository, en dat script kun je lezen en zelf draaien. Het resultaat staat vastgelegd op de branch `dist`, dus je kunt wat er geserveerd wordt vergelijken met wat een build van de bronnen oplevert: https://github.com/A-Box-of-Tools/website

De bestanden die je als eerste wilt lezen zijn `config/site.toml` voor de Content-Security-Policy, `src/specs.js` voor het regelboek — de gepubliceerde cijfers van elk land, met de instantie en de datum waarop elk cijfer gelezen is — `src/detect.js` voor hoe de vier punten gevonden worden — een omtrek en twee donkere plekken, zonder enig model —, `src/geometry.js` voor het rekenwerk dat vier gezette punten in een uitsnede verandert, en `src/jpeg.js` voor de twee wijzigingen aan de kop die de printresolutie in het bestand zetten en een te kleine upload optrekken naar de grootte waar een formulier op staat.
