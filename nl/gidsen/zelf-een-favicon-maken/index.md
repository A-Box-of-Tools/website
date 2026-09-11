# Hoe je een favicon maakt die op zestien pixels nog leesbaar is

Een favicon is geen klein plaatje van je logo. Het is een set plaatjes op vaste formaten, in een houder die de meeste mensen nooit openen, en de kleinste ervan is degene die iedereen werkelijk ziet. Dit gaat over welke formaten je nodig hebt, welke bestanden ernaast horen, en wat je doet wanneer je logo de reis omlaag niet overleeft.

[Open de tool Afbeelding naar ICO](https://abox.tools/nl/favicon-maken/): Eén plaatje erin. Elk formaat dat een browser, Windows of een Mac vraagt eruit.

Laatst bijgewerkt 26 augustus 2026

## Het korte antwoord

Open [Afbeelding naar ICO](https://abox.tools/nl/favicon-maken/), sleep er een vierkant plaatje van minstens 256 pixels in, laat de voorkeuze op *Website-favicon* staan, en download `favicon.ico`. Zet hem in de wortel van je site, zodat hij antwoordt op `https://jouwsite.nl/favicon.ico`. Dat adres wordt door elke browser opgevraagd, of je HTML het nu noemt of niet, dus meer hoef je strikt genomen niet te doen.

Alles hieronder is het deel dat het verschil maakt tussen een icoon dat er technisch is en een dat leesbaar is: welke formaten erin gaan, wat iPhones en Android in plaats daarvan vragen, en wat je doet wanneer je logo het niet overleeft om zestien pixels breed te zijn.

## Waarom het een set formaten is en geen enkel plaatje

Een `.ico`-bestand is een houder. Erin zitten meerdere complete plaatjes van hetzelfde ding op verschillende formaten, en wat het bestand leest kiest degene die het dichtst bij het benodigde formaat zit.

Dat klinkt als overbodigheid en dat is het niet. Een browser die je icoon op zestien pixels tekent heeft twee mogelijkheden: een versie van zestien pixels lezen die jij getekend hebt, of ter plekke een grotere verkleinen. Het tweede is slechter, en dat zie je ook, want een automatische verkleining van een gedetailleerd logo levert pap op, terwijl een versie van zestien pixels waar jij naar gekeken hebt iets is dat je hebt kunnen vereenvoudigen. De hele reden dat het formaat meerdere maten bevat, is om je die kans te geven.

Drie formaten is de conventie voor een website, en elk heeft een reden:

- **⁦16×16⁩**, voor het browsertabblad, de adresbalk en het bladwijzermenu. Dit is degene die mensen zien. Krijg je er maar één goed, krijg dan deze goed.
- **⁦32×32⁩**, voor een bladwijzerbalk, een Windows-bureaubladsnelkoppeling naar je site, en de meeste browsers op een hi-dpi-scherm, die het tabbladicoon uit 32 halen en verkleinen.
- **⁦48×48⁩**, het formaat waarop Google een site-icoon voor zoekresultaten leest, en de middelgrote pictogramweergave van Windows.

Alles wat groter is hoort in een png naast de `.ico`, niet erin, om redenen die bij de mobiele bestanden hieronder aan bod komen.

![De lijst met voorinstellingen en de formaten die elk bevat: zestien, tweeëndertig en achtenveertig pixels voor een site-icoon, en een samenvatting van wat er in het bestand komt.](https://abox.tools/screens/make-a-favicon/preset.webp)

Een .ico is een houder, en dit is de lijst van wat erin gaat. De voorinstelling is een sluiproute naar de set die een browser echt opvraagt.

## Het zestienpixelprobleem

Dit is het deel waar niemand je voor waarschuwt. Zestien pixels is zo'n vier millimeter op een gewoon scherm: een raster van 256 puntjes in totaal, minder dan het aantal letters in deze zin. Vrijwel niets dat ontworpen is om op een bord, een visitekaartje of een websitekop te werken, overleeft het om daartoe teruggebracht te worden.

Wat er verdwijnt, op volgorde:

- **Tekst.** Een woordmerk dat in een vierkant gekrompen wordt, is zo'n drie pixels hoog. Het wordt geen kleine tekst, het wordt een grijze balk. Daarom gebruikt vrijwel elk bedrijf dat naast een naam ook een symbool heeft alleen het symbool als favicon, en gebruiken de bedrijven zonder symbool één letter.
- **Dunne lijnen.** Een rand van één pixel op een logo van 512 pixels is bij zestien een tweeëndertigste pixel. Hij verschijnt als een vage grijze waas langs de rand, of hij verdwijnt.
- **Verlopen en schaduwen.** Er is geen ruimte voor een overgang. Een zachte slagschaduw wordt een vuile rafel.
- **Detail binnen detail.** Een icoon van een document met schrift erop wordt een rechthoek met een vlek.

De oplossing is geen instelling maar een andere tekening: een vereenvoudigd merk met één of twee vormen, hoog contrast, en geen tekst behalve één teken. Teken die versie met opzet op 32 of 48 pixels en gebruik hem als bron.

Wat een tool wel kan, is je het probleem laten zien voordat je het publiceert. De voorvertoning in [Afbeelding naar ICO](https://abox.tools/nl/favicon-maken/) tekent elk formaat op zijn echte formaat op het scherm, en dat is de enige manier om dit te beoordelen. Een icoon van zestien pixels dat op vierenzestig getoond wordt ziet er prima uit en zegt je dus niets.

![Een voorbeeldstrook met hetzelfde merkteken getekend op zestien, tweeëndertig, achtenveertig, vierenzestig en honderdachtentwintig pixels.](https://abox.tools/screens/make-a-favicon/sizes.webp)

De versie van zestien pixels, naast die je hebt ontworpen. Dit is het beeld dat bepaalt of het merkteken vereenvoudigd moest worden.

## Je logo is niet vierkant. Opvullen of bijsnijden?

Een icoon is altijd vierkant en de meeste logo's niet, dus er moet iets gebeuren. Er zijn drie antwoorden en ze zijn niet even goed.

**Opvullen** houdt het hele plaatje en zet er ruimte boven en onder. Het is de veilige standaard en de verkeerde keuze voor een breed woordmerk: iets dat drie keer breder is dan hoog in een vierkant passen, laat het een derde van de hoogte innemen, en dat is bij zestien pixels vijf pixels logo en elf pixels niets.

**Bijsnijden naar het midden** neemt het grootste vierkant uit het midden. Bij een combinatie van symbool en bedrijfsnaam ernaast snijdt dat vaak dwars door allebei. Beter is het om de bron eerst zelf bij te snijden tot alleen het symbool, en dat om te zetten.

**Uitrekken** drukt het plaatje plat om te passen. Er is vrijwel geen situatie waarin dit juist is, en het wordt vooral aangeboden zodat de tool het niet stilletjes doet.

Het algemene antwoord voor een breed logo: zet het logo niet om. Zet het deel ervan om dat op zichzelf werkt.

## Transparant of een vaste achtergrond?

Transparant is voor een website meestal juist. Browsertabbladen zijn grijs, wit of bijna zwart, afhankelijk van de browser en het thema, en een transparant icoon staat op alle drie. Een icoon met een wit vlak erin geschilderd is een witte rechthoek in een donkere tabbalk.

Twee uitzonderingen die het weten waard zijn:

- **Een logo dat donker is en verder niets** verdwijnt in de donkere modus. Is je merk van nature zwart op wit, geef het dan een gekleurde achtergrond in plaats van een transparante, of een lichte omlijning.
- **Het Apple-touch-icoon moet ondoorzichtig zijn.** iOS tekent het op zijn eigen afgeronde tegel en maakt transparantie zwart. Elke tool die dat bestand maakt hoort het voor je plat te slaan; die hier doet dat, standaard op wit.

## De bestanden die een website nodig heeft en die de .ico niet zijn

`favicon.ico` dekt browsers en Windows. Het dekt geen telefoons, en hier houden de meeste zelfgemaakte icoonsets te vroeg op. Drie andere platforms vragen om hun eigen bestanden, onder hun eigen namen, en geen ervan kijkt in een `.ico`:

- **iOS** leest `apple-touch-icon.png` op ⁦180×180⁩ wanneer iemand je site aan zijn beginscherm toevoegt. Zonder dat bestand gebruikt iOS een schermafbeelding van de pagina, en dat ziet eruit als een vergissing.
- **Android en elke installatievraag** lezen een webapp-manifest, oftewel `site.webmanifest`, dat naar png's van 192 en 512 pixels wijst. Die 512 is ook wat een webapp op zijn startscherm toont.
- **Een tegel in het Windows-startmenu** leest `browserconfig.xml`, dat naar een png van ⁦150×150⁩ wijst. Van de drie de minst belangrijke, en het is vier regels XML.

Er is er nog een die makkelijk misgaat: Android-launchers snijden een adaptief icoon bij naar de vorm die de telefoon leuk vindt, of dat nu een cirkel, een squircle of een afgerond vierkant is, en alleen de middelste 80% van het beeld overleeft gegarandeerd. Een icoon dat van rand tot rand getekend is, raakt zijn hoeken kwijt. Dat is wat een *maskeerbaar* icoon is: hetzelfde plaatje met opzet klein binnen het vierkant getekend, apart opgegeven in het manifest.

De websiteset aanvinken in [Afbeelding naar ICO](https://abox.tools/nl/favicon-maken/) levert al deze bestanden op, plus het manifest en het blok HTML dat ernaar wijst. Eén ding dat dat blok met opzet weglaat, is een `<link>` voor `favicon.ico`: browsers vragen dat adres uit zichzelf op, en het er ook nog bij noemen zorgt dat hetzelfde bestand twee keer opgehaald wordt.

## Een Windows-app-icoon is een andere set

Is het icoon voor een programma in plaats van een site, dan veranderen de formaten. Wat de standaard-`app.ico` van Visual Studio zelf bevat, is 16, 32, 48 en 256: de drie shellformaten plus de grote waar het startmenu en de extra grote weergave van Verkenner uit tekenen.

Op een hi-dpi-scherm vraagt Windows ook om 20, 24, 40, 64 en 96, en herbemonstert die vanaf het dichtstbijzijnde formaat dat het heeft wanneer ze ontbreken. Of dat uitmaakt hangt van je icoon af: een vlakke vorm overleeft de herbemonstering, een gedetailleerde niet. Ze toevoegen verdubbelt ruwweg het bestand, en voor een programma stelt dat helemaal niets voor. Het rekensommetje ligt daar volstrekt anders dan bij een favicon, die door elke bezoeker opgehaald wordt.

Nog iets over grootte: bij het item van 256 zitten de bytes. Ongecomprimeerd opgeslagen is het in zijn eentje 264 KB; als png in het icoon opgeslagen meestal onder de 30. PNG-items zijn sinds Windows Vista leesbaar, dus de enige reden om ze te mijden is software die werkelijk ouder is dan dat, of een installatieprogramma of ingebedde tool die iconen zelf ontleedt.

## Een Mac leest een heel ander bestand

Is het icoon voor een Mac-programma in plaats van een Windows-programma, dan geldt niets van het bovenstaande: macOS leest helemaal geen `.ico`. Het leest `.icns`, hetzelfde idee in een andere verpakking, ook weer meerdere formaten in één houder, met drie verschillen die het weten waard zijn.

- **De formaten liggen vast.** Apple publiceert tien plekken en er valt niets te kiezen: 16, 32, 64, 128, 256, 512 en 1024 pixels, waarbij 32, 256 en 512 twee keer voorkomen omdat elk zowel een eigen formaat is als de Retina-versie van het formaat eronder.
- **Het gaat tot 1024.** Een `.ico` stopt bij 256, en daarom is een Mac-icoonbestand een paar honderd kilobyte en een favicon vijftien. Voor een programma dat één keer uitgeleverd wordt is dat niets; alleen een favicon wordt door elke bezoeker opgehaald.
- **1024 pixels is wat je tekenwerk moet overleven.** De twee problemen zijn tegenovergestelde uiteinden van hetzelfde plaatje: een favicon moet werken wanneer hij piepklein is, en een Mac-icoon moet standhouden wanneer hij enorm is. Een logo dat op 512 geëxporteerd is en naar 1024 opgeblazen wordt, oogt zacht op een Retina-scherm, en de App Store neemt het niet aan.

Om er een te gebruiken: een applicatiebundel bewaart hem in `JouwApp.app/Contents/Resources/` en noemt hem in `Info.plist`. Voor een map of een schijfkopie: selecteer de `.icns` in de Finder, druk op Command-C, kies daarna Toon info op het ding dat je wilt wijzigen, klik op het kleine icoon linksboven en druk op Command-V.

*macOS-icoon* aanvinken in [Afbeelding naar ICO](https://abox.tools/nl/favicon-maken/) schrijft er een, met of zonder het Windows-bestand ernaast. Alles wat op beide platforms uitkomt wil ze allebei, en ze worden allebei in dezelfde ronde uit hetzelfde plaatje getekend.

## Controleren of het gelukt is

Browsers houden favicons hardnekkiger in de cache dan vrijwel iets anders, dus “ik heb hem geüpload en er verandert niets” is meestal een cache in plaats van een fout. Twee dingen om te proberen voordat je weer bestanden gaat bewerken:

- Open `https://jouwsite.nl/favicon.ico` rechtstreeks. Wordt het bestand gedownload, dan staat het er en kijk je naar een cache. Krijg je een 404, dan staat het niet in de wortel.
- Laad de site in een privévenster, dat meestal een eigen icooncache heeft.

Op Windows kun je een `.ico` controleren door hem in een map te zetten en Verkenner door zijn weergaveformaten te laten lopen: klein, middelgroot, groot en extra groot tekenen verschillende items uit hetzelfde bestand, dus je kunt ze zien zoals het systeem ze ziet.

Op een Mac gaat een `.icns` open in Voorvertoning, dat elke plek langs de zijkant opsomt. Dezelfde truc werkt in de Finder: zet hem in een map en sleep de formaatschuif in de weergaveopties om hem tussen de plaatjes erin te zien wisselen.

## Hier hoeft niets voor geüpload te worden

Een plaatje schalen is iets wat elke browser al jaren doet, en een `.ico` is een kop van zes bytes, zestien bytes per afbeelding, en dan de afbeeldingen. Er zit geen stap in het maken ervan die een server vereist, en de tool hier gebruikt er geen: de `Content-Security-Policy` van de pagina noemt elk adres dat hij mag benaderen, en geen ervan hoort bij deze site.

Dat is hier meer dan gewoonlijk het waard om om te geven. Een logo dat aan een gratis favicongenerator gegeven wordt, is nogal eens een merk dat nog niet uit is, want het icoon hoort bij de eerste dingen die gemaakt worden en bij de laatste die aangekondigd worden. Controleer je het liever dan dat je het aanneemt, laad dan de pagina, trek de stekker uit je internet en maak er alsnog een. [Is het veilig om bestanden naar online omzetters te uploaden?](https://abox.tools/nl/gidsen/is-bestanden-uploaden-veilig/) zet nog drie controles op een rij die je op elke tool kunt loslaten.
