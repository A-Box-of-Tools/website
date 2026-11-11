# Wachtwoord & wachtwoordzin — sterk en willekeurig, in je browser gemaakt

Hier gemaakt, door je eigen browser, en nergens naartoe gestuurd. Er wordt niets opgeslagen en er is geen geschiedenis.

> Genereer een sterk willekeurig wachtwoord, of een diceware-wachtwoordzin uit een meegeleverde lijst van 7.776 woorden. Getrokken door de cryptografische generator van je browser, nergens naartoe gestuurd en nergens opgeslagen. Gratis, zonder registratie.

Deze pagina is een interactief hulpmiddel dat volledig in je browser draait, op https://abox.tools/nl/wachtwoord-generator/ — niets van wat je het geeft wordt geüpload. Hieronder staat alles wat de pagina er in woorden over zegt; om het te gebruiken, open je het adres.

## Je wachtwoorden en wachtwoordzinnen worden **nooit geüpload**. Er is geen server.

Elk teken komt uit `crypto.getRandomValues`, de eigen cryptografische generator van de browser, en elk woord uit een lijst die als `src/wordlist.js` in deze map meekomt. Er staat nergens in `src/` een `fetch`, een `XMLHttpRequest` of een `sendBeacon`, dus er is geen weg waarlangs een hier gemaakt wachtwoord bij ons of bij wie dan ook terecht kan komen. Er wordt ook niets opgeslagen, waardoor het herladen van deze pagina elk wachtwoord vernietigt dat ze je ooit heeft laten zien.

- ✗ Geen upload
- ✗ Geen account
- ✗ Niets opgeslagen
- ✓ Werkt offline
- ✓ Opensource

## Zo maak je een sterk wachtwoord zonder dat een website het ziet

1. **Kies een wachtwoord of een wachtwoordzin.** Een wachtwoord is een reeks willekeurige tekens: kort om te bewaren, vervelend om te typen, en precies wat je nodig hebt voor de honderden accounts die je wachtwoordmanager voor je invult. Een wachtwoordzin bestaat uit woorden die willekeurig uit een lijst zijn getrokken: langer, maar te onthouden en uit te spreken, en dat heb je nodig voor de paar geheimen die je uit je hoofd moet typen, zoals dat van de wachtwoordmanager zelf, dat van je laptop en de herstelcode van je telefoon.
2. **Zet de lengte, of het aantal woorden.** Dit is de instelling die ertoe doet en de rest grotendeels niet. Twintig tekens, of zes woorden, is een redelijke ondergrens voor alles wat het beschermen waard is, en ga hoger voor het account waarmee iemand alle andere zou kunnen resetten. De uitslag eronder beweegt mee terwijl je sleept, dus je ziet wat elk extra teken oplevert.
3. **Zet de regels aan waar het formulier op gaat staan.** „Minstens één uit elke groep”, een cijfer aan het eind, een leesteken uit de korte lijst die elke site accepteert. Niets daarvan maakt iets sterker, en het eerste maakt het zelfs iets zwakker, wat de pagina er al af heeft getrokken. Maar zo kom je door een registratieformulier zonder er zes achter elkaar te genereren.
4. **Lees het getal, niet de kleur.** De bits worden geteld uit de instellingen die de tekenreeks hebben opgeleverd: de grootte van het alfabet, het aantal trekkingen, en verder niets. Dat is een echte meting, anders dan de meter op een registratiepagina, die alleen de tekens voor zich kan beoordelen en onmogelijk kan weten of jij ze koos of een generator.
5. **Kopieer het en zet het ergens neer voor je weggaat.** Er is hier geen geschiedenis en geen manier om het terug te vragen, want de pagina herladen vernietigt het. Plak het eerst in de wachtwoordmanager en pas daarna in het registratieformulier, zodat degene die het moet onthouden het al heeft voordat er iets mis kan gaan.
6. **Neem een stapel als je die nodig hebt.** De schuifregelaar onderaan maakt er tot honderd tegelijk en bewaart ze als tekstbestand, door deze pagina geschreven uit wat al op je scherm staat. Handig om accounts aan te maken of startgegevens uit te delen, en het is het waard om het bestand te wissen zodra ze op een betere plek staan, want een bestand vol wachtwoorden op je schijf blijft een bestand vol wachtwoorden.

## Ook in de gereedschapskist

- [JSON-formatter](https://abox.tools/nl/json-formatteren/): JSON, XML, HTML, CSS en YAML, geformatteerd of omgezet. Er wordt niets in andermans server geplakt.
- [YAML-naar-JSON-omzetter](https://abox.tools/nl/yaml-naar-json-omzetten/): Beide richtingen, en het zegt wat elke richting kost. Niets ervan wordt in de server van iemand anders geplakt.
- [XML-formatter](https://abox.tools/nl/xml-formatteren/): XML uitgelegd om te lezen of plat geperst om te versturen, en beide kanten op omgezet naar JSON. Niets ervan wordt in de server van iemand anders geplakt.
- [Tekstvergelijker](https://abox.tools/nl/tekst-vergelijken/): Twee teksten erin, elk verschil gemarkeerd, regel voor regel en woord voor woord. Er wordt niets in andermans server geplakt.

## Vragen

### Worden de wachtwoorden ergens naartoe gestuurd of opgeslagen?

Geen van beide. Ze ontstaan in je browser, op je eigen apparaat, en dit gereedschap heeft helemaal geen netwerkfunctie: het haalt nooit iets op en stuurt nooit iets weg. Er wordt ook niets in de opslag geschreven: geen localStorage, geen cookie, geen geschiedenis. Herlaad de pagina en elk wachtwoord dat ze je heeft laten zien is weg, van het scherm en uit haar eigen geheugen. In de `Content-Security-Policy` van de pagina staat elk adres dat ze mag benaderen en geen daarvan is van ons, dus er is nergens waar een wachtwoord verzameld kan worden, ook niet als iets het zou proberen.

### Waar komt het toeval vandaan?

Uit `crypto.getRandomValues`, de generator die browsers leveren voor cryptografisch gebruik, gevoed en steeds opnieuw gevoed door de entropievoorraad van je eigen besturingssysteem. Het is dezelfde bron waaruit de browser zijn TLS-sleutelmateriaal haalt. `Math.random` wordt nergens in dit gereedschap gebruikt, en dat onderscheid is geen muggenzifterij: `Math.random` is een snelle rekenkundige generator waarvan de volledige interne toestand uit een paar opeenvolgende uitkomsten valt te reconstrueren. Een wachtwoordgenerator die daarop gebouwd is levert wachtwoorden op die willekeurig lijken en die iedereen die er één van heeft gezien kan opsommen.

### Is een wachtwoord uit een browser net zo goed als een uit een programma op je computer?

Wat het toeval betreft wel, want het is in beide gevallen dezelfde bron van het besturingssysteem, alleen via een andere deur bereikt. Wat verschilt is wat er verder in de kamer staat. Een browsertabblad draait naast je extensies, en een extensie die pagina's mag lezen kan ook deze lezen. Dat geldt voor elke webgenerator, deze inbegrepen, en het is de eerlijke reden om de ingebouwde generator van je wachtwoordmanager te gebruiken als je die hebt: het is hetzelfde rekenwerk, in een proces waar minder naast staat. Deze pagina is voor als je er geen bij de hand hebt.

### Wachtwoord of wachtwoordzin, wat kun je het beste gebruiken?

Een wachtwoord voor alles wat een wachtwoordmanager voor je typt, want je gaat er nooit naar kijken en lengte kost daar niets. Een wachtwoordzin voor de paar dingen die je uit je hoofd moet typen of hardop moet doorgeven: het hoofdwachtwoord van de manager, de sleutel van je schijfversleuteling, een apparaat dat je op afstand inricht. Zes woorden uit de lange lijst zijn 77 bits, sterker dan een willekeurig wachtwoord van twaalf tekens en oneindig veel makkelijker om om vier uur 's nachts goed in te typen.

### Hoe lang moet een wachtwoord zijn?

Twintig tekens uit het volledige alfabet is ongeveer 130 bits, ruim voorbij het punt waarop lengte nog het probleem is. Zestien is prima. Twaalf is de ondergrens voor alles wat je niet kwijt wilt, en dat is de ondergrens en niet het doel. Daaronder vertrouw je erop dat de site het netjes heeft opgeslagen, en twintig jaar meldingen van datalekken raden die gok af. Lengte wint van elke andere instelling op deze pagina: één teken erbij levert meer op dan welke regel dan ook over welke tekens erin moeten staan.

### Uit hoeveel woorden moet een wachtwoordzin bestaan?

Uit zes van de lange lijst, en uit zeven als hij andere wachtwoorden bewaakt. Het bekende plaatje met vier woorden is van 2011, is 51 bits waard en ligt vandaag binnen het bereik van een serieuze offlineaanval. Vijf is 64. Zes is 77, meer dan een aanvaller ooit aan een gewoon account besteedt. Elk extra woord uit de lange lijst voegt 12,9 bits toe, en de woorden zijn het enige wat iets toevoegt: de streepjes en de hoofdletters niet.

### Wat is een „bit”, en waarom telt deze pagina ze?

Een bit is een verdubbeling. Zestig bits betekent dat er 2^60 even waarschijnlijke uitkomsten waren die deze pagina had kunnen opleveren, dus wie precies weet hoe ze werkt heeft er nog steeds zoveel te proberen. Het is een eigenschap van het *proces* en niet van de tekenreeks: de pagina kan het exact geven omdat zij degene was die koos en weet hoeveel keuzes ze maakte. Dat is het verschil met de gekleurde balk op een registratieformulier, die de tekens leest en gokt. Op die balk scoort `correct horse battery staple` slecht en is 44 bits waard, en scoort `P@ssw0rd!` goed en is bijna niets waard.

### Waarom maakt „moet een leesteken bevatten” een wachtwoord zwakker?

Omdat een regel alleen maar mogelijkheden kan wegnemen. Minstens één teken uit elke groep eisen schrapt elk wachtwoord waar er toevallig geen in zat, en een kleinere verzameling mogelijke wachtwoorden is een kleinere verzameling om te doorzoeken. Het effect is klein, ongeveer een halve bit bij een gebruikelijke lengte, en het is echt, en deze pagina trekt het eraf in plaats van het vleiende getal te noemen. Het wordt exact bepaald door de wachtwoorden te tellen die de regel werkelijk toelaat, en niet die ze uitsluit.

### Welke woordenlijst is dit, en maakt het uit dat een aanvaller hem kan downloaden?

Het zijn de diceware-lijsten van de Electronic Frontier Foundation, ongewijzigd meegeleverd: 7.776 woorden in de lange en 1.296 in de korte. Ze zijn precies hiervoor gebouwd: niets aanstootgevends, geen homoniemen, geen paren die aan elkaar geplakt een derde woord vormen, en in de korte lijst geen woord dat het begin van een ander is. En nee, het maakt niet uit dat de lijst openbaar is: de sterkte die hier staat gaat ervan uit dat de aanvaller hem heeft, de broncode van deze pagina leest en elke instelling kent die je hebt gebruikt. Het enige wat hij niet weet is welke van de 7.776 er elke keer uit kwam. Juist die aanname maakt het getal te vertrouwen.

### Is een wachtwoordzin niet gewoon een woordenboekaanval die staat te wachten?

Niet als de woorden zo gekozen worden. Een woordenboekaanval werkt tegen zinnen die *mensen* bedenken, want mensen kiezen woorden die bij elkaar passen, in een volgorde die klopt, uit de paar duizend die ze dagelijks gebruiken. Deze pagina kiest elk woord onafhankelijk en gelijk verdeeld uit een vaste lijst, zonder zich erom te bekommeren of het resultaat lekker leest, en daarom leest het meestal niet lekker. Een aanvaller die de lijst en het aantal woorden kent staat nog steeds voor 7.776 tot de macht dat aantal.

### Kan ik een wachtwoord terugkrijgen nadat ik de pagina heb verlaten?

Nee, en dat is met opzet. Er wordt nergens iets vastgelegd, dus er valt niets terug te halen: geen geschiedenisvenster, geen lijst met „onlangs gegenereerd”, geen cache. Een generator die je het wachtwoord van afgelopen dinsdag kan laten zien is een generator die het heeft opgeslagen, en opgeslagen waar jij erbij kunt betekent opgeslagen waar iets anders erbij kan. Kopieer het naar een wachtwoordmanager voor je wegklikt.

### Is het veilig om het naar het klembord te kopiëren?

Het is het gewone risico, en je kunt het beter kennen dan je erover zorgen maken. Het klembord wordt gedeeld met alles wat onder jouw account draait, het blijft meestal staan tot de volgende kopie, en op sommige systemen wordt het tussen apparaten gesynchroniseerd. Dat is een goede reden om het meteen te plakken waar het hoort en daarna iets anders te kopiëren, en geen reden om in plaats daarvan met de hand een zwakker wachtwoord te typen. Deze pagina kan je klembord niet lezen: ze kan er alleen naartoe schrijven, en alleen als jij op de knop drukt.

### Mag ik hetzelfde wachtwoord op meer dan één plek gebruiken?

Nee, en dat is het enige advies op deze pagina dat boven alle andere gaat. Bijna elk account dat wordt overgenomen, wordt overgenomen met een wachtwoord dat eerst ergens anders klopte: een site wordt gekraakt, de lijst wordt gepubliceerd, en hetzelfde adres met hetzelfde wachtwoord wordt overal geprobeerd. Een uniek wachtwoord per site maakt van een datalek één account in plaats van allemaal, en dát is de reden om een wachtwoordmanager te gebruiken, niet de sterkte van een afzonderlijk wachtwoord dat erin staat.

### Is het gratis, en heb ik een account nodig?

Het is gratis, er is geen account, geen aanmelding, geen proefperiode en geen grens aan hoeveel je er genereert. De site draagt advertenties en daarvan wordt hij betaald; de advertenties krijgen helemaal niets over wat deze pagina maakt, ook niet hoe lang of hoe sterk het was.

### Werkt het offline?

Ja. Laad de pagina één keer, verbreek daarna de verbinding met internet en ze blijft wachtwoorden maken. Het toeval komt van je eigen apparaat en de woordenlijst zit al in de pagina. Het is meteen de eenvoudigste manier om te bewijzen dat er niets wordt opgehaald of verstuurd: een generator die zijn getallen bij een server zou halen, valt stil op het moment dat je de stekker eruit trekt.

## Hoe je de privacybelofte controleert

- **Het wachtwoord ontstaat waar je dit leest.** Het wordt op deze pagina getrokken, door deze pagina, uit het toeval dat je eigen besturingssysteem aan de browser doorgeeft. Er wordt niets opgevraagd om het te maken en er wordt niets gemeld zodra het er is. In de `Content-Security-Policy` staat elk adres dat deze pagina mag benaderen en geen daarvan is van ons, dus er is hier geen plek waar een gegenereerd wachtwoord terecht zou kunnen komen, en er staat ook niets in de code dat het daarheen zou sturen als die plek er wel was.
- **Er haalt hier niets iets op.** Er staat nergens in `src/` een `fetch`, een `XMLHttpRequest` of een `sendBeacon`. De woordenlijst wordt niet gedownload: het is `src/wordlist.js`, vanaf deze eigen herkomst geserveerd samen met de rest van de pagina, en je kunt hem lezen.
- **Het toeval is dat van de browser, en het is de juiste soort.** `crypto.getRandomValues` is de generator die browsers leveren voor sleutels en tokens, gevoed en steeds opnieuw gevoed door het besturingssysteem. `Math.random` komt nergens in deze map voor, en het zou een echte fout zijn als dat wel zo was, want zijn interne toestand valt uit een handvol uitkomsten te reconstrueren. Daarmee is elk wachtwoord dat hij ooit zal maken uit te rekenen door iedereen die er één van heeft gezien.
- **Er wordt niets opgeslagen, dus er is geen geschiedenis om te wissen.** Geen localStorage, geen sessionStorage, geen cookie, geen URL-parameter en geen `<input>` die de browser zou aanbieden te onthouden. Wat op het scherm staat leeft in één array in het geheugen van deze pagina, en het tabblad sluiten is het hele opruimwerk. De enige kopieën van wat hier ontstaat zijn de kopieën die je zelf meeneemt.
- **Wat Google laadt, en wat het niet krijgt.** De advertentie- en meetscripts komen van Google en de donatieknop van Buy Me a Coffee. Geen van alle krijgt één teken van wat deze pagina maakt, ook de lengte niet, de sterkte niet en de instellingen niet waarmee het eruit kwam. Elke regel die een teken of een woord trekt wordt vanaf deze herkomst geserveerd en staat in de repository.
- **Het werkt offline.** Verbreek de verbinding en het gereedschap is onveranderd, want er heeft nooit een netwerkstap in gezeten. Dat is het eenvoudigste bewijs dat er is: een generator die zijn toeval bij een server ophaalt, zou stilvallen op het moment dat je de stekker eruit trekt.

**Controleer het zelf.** Je hoeft niets van het bovenstaande op ons woord aan te nemen. Een buildscript maakt deze pagina uit de sjablonen en de configuratie in de repository, en dat script kun je lezen en zelf draaien. Het resultaat staat vastgelegd op de branch `dist`, dus je kunt wat er geserveerd wordt vergelijken met wat een build van de bronnen oplevert: https://github.com/A-Box-of-Tools/website

De bestanden die je als eerste wilt lezen zijn `config/site.toml` voor de Content-Security-Policy, `src/random.js` voor de veertig regels die tussen deze pagina en elk wachtwoord staan dat ze maakt, want die hebben precies één invoer en dat is de generator van de browser zelf; `src/generate.js` voor hoe de instellingen een tekenreeks worden; en `src/strength.js` voor het rekenwerk achter het getal, dat telt in plaats van raadt.
