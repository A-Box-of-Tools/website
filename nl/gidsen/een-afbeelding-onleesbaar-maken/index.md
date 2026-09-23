# Een afbeelding zo onleesbaar maken dat het afgedekte echt weg is

Iets afdekken en iets weghalen zien er op het scherm hetzelfde uit en zijn totaal niet hetzelfde. Hier staat het verschil, staan de twee manieren die meer achterlaten dan mensen denken, en staan de controles waarmee je ziet welke van de twee je zojuist hebt gedaan.

[Open de tool Afbeelding onleesbaar maken](https://abox.tools/nl/afbeelding-onleesbaar-maken/): Wat je afdekt wordt uit het bestand gewist, niet erin verstopt.

Laatst bijgewerkt 26 augustus 2026

## Het korte antwoord

Open [Afbeelding onleesbaar maken](https://abox.tools/nl/afbeelding-onleesbaar-maken/), sleep de afbeelding erin, teken een vakje over alles wat niemand mag zien en klik op ‘Onleesbaar maken en opslaan’. Gebruik het zwarte vlak voor alles wat als tekst te lezen is. Het bestand dat je terugkrijgt heeft andere pixelwaarden waar de vakjes lagen: er zit geen rechthoek in om weg te schuiven, want er zit helemaal geen rechthoek in.

Alles hieronder gaat over waarom die laatste zin het hele punt is, en hoe je merkt of een programma dat je al gebruikt hetzelfde van zichzelf kan zeggen.

## Afdekken en weghalen zien er op het scherm hetzelfde uit

Teken een zwarte rechthoek over een naam in een pdf-lezer, een presentatie, een tekstverwerker of een beeldbewerker met lagen. Wat je ziet is een naam met een zwarte rechthoek erover. Wat je hebt *opgeslagen* is in de meeste van die programma's een document dat de naam bevat en, los daarvan, een rechthoek met een positie, een formaat en een kleur.

Wie dat bestand opent kan de rechthoek verplaatsen, verwijderen, of het document openen in een programma dat de lagen in een andere volgorde tekent. De naam zit er nog steeds in. Aan het scherm zie je niet welke van de twee zojuist is gebeurd, en juist daarom blijft dit gebeuren bij organisaties met een eigen juridische afdeling.

Zo zijn processtukken, overheidsrapporten, contracten en meer dan één ingescand krantendocument naar buiten gekomen. Het patroon is telkens hetzelfde: de rechthoek was de aantekening, en de aantekening was niet de afbeelding.

## Wat een echte redactie is

Een afbeelding is een raster van getallen, één per pixel. Hem onleesbaar maken betekent **andere getallen in het raster schrijven** en daarna het raster opslaan. Daarna valt er niets te herstellen, niet omdat het bestand het goed verstopt maar omdat de waarden er niet in staan. Dat is de enige versie hiervan die het overleeft dat iemand nieuwsgierig het bestand opent.

Daar volgen drie dingen uit, en zo hoort een onleesbaar gemaakt bestand eruit te zien:

- **Het resultaat is één platte afbeelding.** Geen lagen, geen objecten, geen lijst met aantekeningen, niets om aan en uit te zetten. Als je gereedschap een bestand met een laag erin teruggeeft, heeft het afgedekt in plaats van weggehaald.
- **Het is een nieuw bestand, geen bewerkt oud bestand.** De pixels zijn door een decoder en een encoder gegaan, dus wat eruit komt is geschreven vanuit het onleesbaar gemaakte raster.
- **De metadata zijn ook weg**, als bijeffect. Een raster van pixels draagt geen cameramodel, geen gps-positie en geen tijdstempel. Wat er anders in had gezeten staat in [wat een foto over je vertelt](https://abox.tools/nl/gidsen/exif-en-gps-gegevens-verwijderen/).

Dat laatste verdient uitleg, want er zit nog een val in. Veel foto's dragen een **ingebedde miniatuur** mee: een kleine tweede kopie van de afbeelding, geschreven toen het bestand werd aangemaakt en niet altijd opnieuw aangemaakt als de afbeelding bewerkt wordt. Een foto die onleesbaar is gemaakt door gereedschap dat het bestand ter plekke bewerkt in plaats van opnieuw te coderen, kan dus op reis gaan met een miniatuur van het onbewerkte origineel. Het is een kleine afbeelding, en hij is ruimschoots groot genoeg om er een naam op te lezen.

![De opslaankaart: een formaatmenu, een kwaliteitsschuif en een notitie dat de afgedekte pixels uit het geschreven bestand worden gehaald.](https://abox.tools/screens/redact-an-image/save.webp)

Opslaan is de stap die het echt maakt. Wat eruit komt is een nieuw bestand zonder die pixels, niet het origineel met een rechthoek erop.

## Zwart, pixelen of blurren, en waarom dat niet hetzelfde is

Alle drie overschrijven de pixels. Maar één laat niets achter.

### Zwart vlak

Elke pixel in het vakje krijgt dezelfde kleur. Van wat er stond blijft niets over: geen omtrek, geen gemiddelde helderheid, niet het aantal tekens, niet de lengte van het woord. Het is de enige van de drie waarbij de vraag ‘zou dit ongedaan te maken zijn?’ een rond nee als antwoord heeft, en het is wat je gebruikt voor een naam, een adres, een rekeningnummer, een kenteken, een handtekening of een barcode.

### Pixelen

Het vakje wordt in blokken gesneden en elk blok krijgt de gemiddelde kleur van dat blok. De oorspronkelijke pixels zijn echt weg, maar een raster van gemiddelden is nog altijd een meting van wat eronder lag, en bij tekst kan die meting genoeg zijn.

De aanval is niet subtiel. Tekst komt uit een kleine verzameling mogelijkheden: een lettertype, een grootte, een positie en een reeks tekens. Wie vermoedt wat voor gegeven er stond kan elke kandidaat op dezelfde manier renderen, hem met hetzelfde blokraster pixelen en de gemiddelden met die van jou vergelijken. Meestal past er precies één. Dat is op echte gepixelde screenshots aangetoond, en er is gepubliceerde software die het doet.

Doorslaggevend is **uit hoeveel blokken het raster bestaat**. Twee blokken over een woord zijn twee getallen, en met twee getallen identificeer je geen tekst. Veertig blokken over datzelfde woord zijn veertig getallen, en veertig is ruim voldoende. Daarom noemt dit gereedschap het aantal blokken van het fijnste raster op de afbeelding in plaats van een instelling ‘sterk’ te noemen: het getal is het feit, en het bijvoeglijk naamwoord is een mening erover.

### Blurren

Elke pixel wordt een gewogen gemiddelde van zijn buren. Dat is een convolutie, en convoluties zijn in principe omkeerbaar: het origineel terughalen uit een geblurde kopie is een standaardprobleem met standaardsoftware, en het lukt het best in precies het geval dat hier telt, namelijk scherpe tekst die met een kleine straal geblurd is.

Daarmee zijn pixelen en blurren niet nutteloos. Een gezicht op de achtergrond van een straatfoto, een huisnummer aan de overkant, het scherm van een collega achter je in een videogesprek: dat kan allemaal prima, en de afbeelding blijft er een afbeelding door. De regel is simpel: **als het als tekst te lezen is, maak het zwart.**

![De editor: een foto met een dekkend vlak over een deel ervan, de keuze tussen zwart, pixelen en vervagen, een sterkteschuif en een samenvatting van de gemarkeerde gebieden.](https://abox.tools/screens/redact-an-image/cover.webp)

Drie manieren om iets af te dekken, en ze zijn niet gelijkwaardig. Deze sectie gaat over welke ervan het overleeft als iemand hem probeert terug te draaien.

## Vier controles voordat je het verstuurt

Samen kosten ze een minuut en ze werken op het resultaat van elk gereedschap, dit meegerekend. Een bewering die je kunt controleren is meer waard dan een bewering die je moet aannemen.

1. **Probeer de tekst te selecteren.** Open het bestand en sleep over het afgedekte gebied. Als er iets oplicht, staat de tekst nog in het document en kijk je naar een vorm die eroverheen getekend is.
2. **Open het in een editor en zoek naar lagen.** Eén laag, met een naam als ‘Achtergrond’, is hoe een onleesbaar gemaakte afbeelding eruitziet. Een apart rechthoekobject betekent dat het origineel eronder ligt.
3. **Kijk naar de miniatuur.** Sommige bestandsbeheerders en viewers tonen de ingebedde miniatuur in plaats van de afbeelding opnieuw te lezen. Laat de kleine versie nog zien wat je hebt afgedekt, dan is het bestand bewerkt in plaats van opnieuw opgebouwd.
4. **Zoom helemaal in op de randen van het vakje.** Een redactie die op de pixels is toegepast heeft precies op de grens een harde rand. Een zachte of halfdoorzichtige rand betekent dat er iets met een dekkingspercentage overheen getekend is, en een dekking onder de 100 % is een kopie van het origineel met een waas erover.

## Bijsnijden is beter dan afdekken, waar het kan

Zit het ding dat je wilt verbergen aan de rand van de afbeelding, zoals een koptekst met een rekeningnaam, een browsertabblad of een taakbalk met je gebruikersnaam, dan is wegsnijden sterker dan afdekken en levert het ook een schoner bestand op. Er is geen vakje om wantrouwig over te zijn, want daar staat helemaal niets meer.

[Afbeeldingsformaat wijzigen](https://abox.tools/nl/afbeelding-formaat-wijzigen/) snijdt bij, en [die gids](https://abox.tools/nl/gidsen/formaat-van-een-afbeelding-wijzigen/) beschrijft wat het verder doet. Voor wat er middenin staat gebruik je dit gereedschap.

## Een screenshot is vaak het grootste lek

Op een screenshot is de afbeelding zelden het enige dat je identificeert. Kijk voordat je er een verstuurt naar wat er om het stuk heen staat dat je wilde laten zien: de venstertitel, de adresbalk en de suggestielijst eronder, open tabbladen, een melding, de tijd en de datum, de taakbalk, een ingelogde avatar in de hoek, de naam van het wifinetwerk. Elk daarvan kan je plaatsen, en geen ervan was waar je naar keek toen je de opname maakte.

## Hier is geen upload voor nodig

Een afbeelding lezen, over een deel van de pixels heen schrijven en hem opnieuw coderen kan elke browser al jaren. Er is geen technische reden waarom de foto van je paspoort, je loonstrook of je bankafschrift naar de server van een vreemde en terug zou moeten reizen om er een zwart vakje op te krijgen. En dat zijn precies de afbeeldingen die dit soort gereedschap onder ogen krijgt.

Dit gereedschap stuurt ze nergens heen: in de `Content-Security-Policy` van de pagina staat elk adres dat hij mag benaderen, en geen daarvan is van ons. Laad de pagina, trek de internetverbinding eruit en maak toch iets onleesbaar als je liever controleert dan gelooft. [Is het veilig om bestanden naar online omzetters te uploaden?](https://abox.tools/nl/gidsen/is-bestanden-uploaden-veilig/) geeft nog drie controles die je op elk gereedschap kunt uitvoeren.
