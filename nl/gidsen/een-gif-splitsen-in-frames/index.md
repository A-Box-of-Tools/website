# Een GIF splitsen in frames

De frames eruit halen kost één sleep en één knop. Wat de moeite van het begrijpen waard is, is wat een “frame” van een GIF eigenlijk is, want het formaat bewaart iets anders dan wat je ziet — en dat verschil is waarom je veertiende frame een rechthoek met iemands mond is.

[Open de tool GIF-splitser](https://abox.tools/nl/gif-splitsen-in-frames/): Elk frame eruit, als eigen PNG.

Laatst bijgewerkt 26 augustus 2026

## Het korte antwoord

Open de [GIF-splitser](https://abox.tools/nl/gif-splitsen-in-frames/), sleep de GIF erin, en elk frame verschijnt als een PNG die je kunt downloaden — stuk voor stuk, of allemaal tegelijk als één zipbestand. Laat de instellingen met rust en je krijgt precies wat de meeste mensen bedoelen: elk frame als het hele plaatje, zoals het er op dat moment van de animatie uitziet.

De rest van deze pagina gaat over de drie dingen die daarna verbazen: een frame dat maar een klein lapje is, transparantie die ergens anders zwart wordt, en timing die niet meer bestaat zodra de frames losse bestanden zijn.

## Wat een GIF-frame eigenlijk is

Een GIF is geen stapel plaatjes. Het is *één* plaatje, gevolgd door een reeks lapjes.

Elk frame na het eerste bewaart alleen de rechthoek die veranderd is, plus een regel over wat er daarna met het doek moet gebeuren. Al het andere op het scherm is simpelweg wat de eerdere frames daar hebben achtergelaten. Iemand die voor een stilstaande muur staat te praten kost een rechthoek gezicht per frame in plaats van een heel plaatje per frame, en dat is de hele reden dat een formaat zonder bewegingscompensatie en zonder verliesgevende stap niet volslagen onbruikbaar is.

Er zijn dus twee verschillende, even eerlijke antwoorden op “geef me frame 14”, en het hulpmiddel biedt ze allebei:

**Het frame zoals het eruitziet.** Het hele plaatje op dat moment: frame 14 getekend boven op alles wat eraan voorafging. Dat is de standaard, en dat is wat je wilt voor een contactblad, een miniatuur, een beeld om te posten, of frames die een videobewerker in gaan.

**Alleen de pixels die dat frame bewaart.** Het lapje zelf, op zijn eigen formaat, op zijn eigen plek, met alles wat het niet meedraagt doorzichtig gelaten. Frame 14 is dan misschien ⁦60 × 40⁩ pixels mond. Dat is de weergave die verklaart waar de bytes van een GIF gebleven zijn, en die je wilt als je de animatie aan het bewerken bent in plaats van er plaatjes uit te oogsten.

Er is niets mis met je bestand als een bewaard frame op een fragment lijkt. Dat ís het bestand.

![Twaalf genummerde frames van een animatie, elk als hele afbeelding met de tijd dat het blijft staan.](https://abox.tools/screens/split-a-gif-into-frames/frames.webp)

Elk frame als hele afbeelding, wat niet is wat er in het bestand staat: deze sectie gaat over dat verschil.

## De opruimregel, en waarom sommige frames gaten achterlaten

Elk frame draagt ook een van vier instructies over wat er met zijn rechthoek gebeurt voordat het volgende frame getekend wordt. Het hulpmiddel toont die onder elk frame in de weergave van wat er bewaard is:

**Blijft staan.** De gewone. Het lapje blijft waar het geland is en het volgende frame tekent eroverheen.

**Wist zijn gebied daarna.** De rechthoek wordt schoongeveegd voordat het volgende frame landt. Dit is wat een animatie met een bewegend doorzichtig voorwerp doet, en het is ook de klassieke oorzaak van flikkerende GIF's.

**Zet terug wat eronder zat.** Het doek gaat terug naar hoe het eruitzag voordat dit frame tekende — een stempel, en dan een ongedaan maken. Zeldzaam, en de regel die zelfgebouwde GIF-lezers het vaakst fout doen.

Eén detail dat handig is als je hulpmiddelen vergelijkt: de specificatie zegt dat “wist zijn gebied” de *achtergrondkleur* terug moet zetten, maar elke browser sinds de jaren negentig wist naar *doorzichtig*, omdat de animaties van toen daarvan uitgingen. Dit hulpmiddel volgt bewust de browsers, zodat de frames die je krijgt de frames zijn die je gezien hebt.

![De instellingenkaart: de keuze tussen het frame zoals het verschijnt en de ruwe lap zoals hij in het bestand staat, met een achtergrondkleur voor de doorzichtige delen.](https://abox.tools/screens/split-a-gif-into-frames/settings.webp)

De stand zoals het verschijnt speelt de opruimregels na en geeft je afbeeldingen. De andere geeft je wat er werkelijk in het bestand staat, gaten en al.

## Wat er met de transparantie gebeurt

GIF-transparantie is één bit. Een pixel is geverfd of onzichtbaar, en daartussen zit niets — geen zachte randen, geen halve schaduwen. Daarom heeft een GIF met een doorzichtige achtergrond die harde, licht gekartelde omtrek.

PNG bewaart precies dat, zonder verlies, dus de frames komen er met hun transparantie ongeschonden uit en er wordt niets verzonnen. Houd hem als de frames ergens naartoe gaan waar men transparantie begrijpt.

Vul hem anders met een kleur. Software die een alfakanaal negeert, tekent het meestal zwart, dus een frame dat er in de browser prima uitzag komt aan met een zwarte achtergrond — en een bewaard lapje, dat bijna overal doorzichtig is, komt aan als een zwarte rechthoek met een mond erin. De kleur vooraf kiezen lost dat op. Hij wordt in de PNG geschreven en kan achteraf niet meer weg, en dat is de enige reden dat het niet de standaard is.

## De timing, die de frames niet mee kunnen dragen

Een PNG heeft geen plek om vast te leggen hoe lang hij in beeld stond. Splits een animatie in PNG's en de timing is weg, en dat telt op het moment dat je het weer in elkaar wilt zetten.

Daar is de `frames.txt` in het zipbestand voor. Die noemt van elk frame de vertraging, de plek en het formaat, zodat de animatie opnieuw gebouwd kan worden in de [GIF-maker](https://abox.tools/nl/gif-maken/) of ergens anders. Het kost een paar kilobyte en er is geen manier om het later terug te rekenen.

Twee dingen over GIF-vertragingen die iedereen verrassen:

**De eenheid is honderdsten van een seconde**, dus de fijnste stap die het formaat kent is 0,01 s. Een GIF van precies 30 fps bestaat niet; 0,03 s per frame is 33,3 fps en 0,04 s is 25.

**Alles onder 0,02 s wordt op 0,10 s afgespeeld.** Browsers begrenzen dat al sinds de jaren negentig — een regel geschreven voor de draaiende wereldbollen van die tijd en nooit meer weggehaald. Een GIF waarvan het bestand 0,01 s per frame zegt, claimt 100 fps en speelt op 10. Het hulpmiddel toont de vertraging zoals hij echt gespeeld wordt, en zet ernaast wat het bestand bewaart wanneer die twee uiteenlopen, want dat gat is de reden dat een GIF die je splitst en weer opbouwt trager kan uitkomen dan het origineel.

## Framenummers, en waarom er nullen voor staan

Frames komen eruit als `naam-001.png`, `naam-002.png`, genummerd vanaf één en aangevuld tot de breedte van het laatste nummer. Dat is geen versiering: `frame9.png` sorteert in elke bestandsbeheerder en in de meeste software die een reeks importeert *na* `frame10.png`, omdat ze tekst sorteren en geen getallen. Aangevulde namen sorteren overal goed, en elke videobewerker die een beeldreeks importeert verwacht ze zo.

Een lange animatie uitdunnen met “houd elk tweede frame” hernummert niets. Frame 42 heet nog steeds frame 42, zodat de bestanden naast het origineel en naast de tijdenlijst blijven kloppen.

## Waarom hier geen server voor nodig is

Een GIF lezen zijn twee klussen: door de blokken van het bestand lopen, en de LZW-compressie ongedaan maken waarin de pixels verpakt zitten. Samen zijn dat een paar honderd regels, ze staan uitgeschreven in de repository, en ze draaien op je eigen apparaat — en daarom blijft de pagina het doen met de netwerkstekker eruit.

Je browser kan al een GIF afspelen, maar geeft de onderdelen niet af: een `<img>` geeft je een animatie, er een op een doek tekenen geeft je voor altijd het eerste frame, en de ene API die meer doet ontbreekt in Safari. Dus wordt het formaat hier zelf gelezen, in elke browser op dezelfde manier — en dat het zelf gelezen wordt, is ook wat het mogelijk maakt om je de lapjes en de opruimregels te laten zien.

[Is het veilig om bestanden naar online omzetters te uploaden?](https://abox.tools/nl/gidsen/is-bestanden-uploaden-veilig/) zet vier controles op een rij die je over elk hulpmiddel hetzelfde vertellen, dit hulpmiddel inbegrepen.
