# Over abox.tools

Eén persoon, in Ontario, die de tools bouwt die hij steeds nodig had en steeds niet vertrouwde. Alles hier draait op je eigen apparaat, de code is openbaar, en op deze pagina staan de redenen achter allebei.

Laatst bijgewerkt 27 augustus 2026

## Wat dit is

abox.tools is een verzameling kleine tools die elk één ding doen: een foto verkleinen, een video inkorten, twee pdf’s samenvoegen, nakijken wat er werkelijk in een QR-code staat. Het zijn er op dit moment 44, en er hoort een [bibliotheek met gidsen](https://abox.tools/nl/gidsen/) bij over de klussen waar ze voor zijn.

Het bijzondere is niet wat ze doen, maar waar ze het doen. Ze draaien allemaal volledig in je browser, op je eigen hardware, met de decoders en encoders die je browser toch al meebrengt. Niets van wat je opent wordt ergens naartoe gestuurd. Er staat achter deze pagina’s ook geen server om het naartoe te sturen, want de hele site bestaat uit statische bestanden en de tools zijn gewone JavaScript-modules die ernaast worden geserveerd.

Dat is het product. De rest van deze pagina gaat over waarom het de moeite waard is om het zo te bouwen, en wie dat doet.

## Wie het maakt

Eén persoon, in zijn eentje, in Ontario in Canada. Dit is geen bedrijf. Er is geen team, geen investeerder, geen moederbedrijf en geen plan om door een van die drie te worden opgekocht. Post komt aan op [hi@abox.tools](mailto:hi@abox.tools) en wordt gelezen door degene die de code schreef; op de [contactpagina](https://abox.tools/nl/contact/) staat waar dat adres wel en niet goed voor is.

De site verschijnt bewust zonder persoonlijke naam eronder. Het is een klein project en geen persoonlijk merk, en wat hier vertrouwen verdient is niet een naam onder een pagina, maar [de code](https://github.com/A-Box-of-Tools/website), die iedereen kan lezen, en het gedrag van de pagina’s zelf, dat iedereen in een seconde of dertig kan nakijken met de ontwikkelaarstools open. Die twee zijn controleerbaar. Een naam eronder niet.

## Waarom het zo gebouwd is

De gewone manier om zulke tools te bouwen is: bestand uploaden, het werk op een server doen, resultaat terugsturen. Dat is makkelijker, het werkt op elk apparaat, en zo doet bijna elke „gratis online converter” het.

Het betekent ook dat je je bestand aan een vreemde geeft. Bij een meme maakt dat niets uit. Bij de scan van een paspoort, een medisch beeld, een ondertekend contract of een foto met je adres in de metadata maakt het alles uit. Zodra het bestand op andermans machine staat, hangt af van diens beleid en diens zorgvuldigheid wat ermee gebeurt, en geen van beide kun je controleren. De privacyverklaring van zo’n site is een belofte en geen grendel.

Browsers zijn zo goed geworden dat die belofte niet meer nodig is. Ze kunnen JPEG, PNG en WebP lezen en schrijven, video uitpakken en decoderen, een bestand hashen, een QR-code lezen en een pdf schrijven. Als het werk op je eigen machine kan gebeuren, dan is „houden ze mijn bestand dan?” geen vraag meer over iemands bedoelingen, maar een vraag over wat de code technisch kan. En die kun je zelf beantwoorden.

Dat is het hele argument, en er is een gids die het netjes uitwerkt: [is het veilig om bestanden naar een website te uploaden?](https://abox.tools/nl/gidsen/is-bestanden-uploaden-veilig/)

## Nakijken in plaats van vertrouwen

Alles hierboven is bedoeld om getoetst te worden. Vier manieren, van weinig naar veel moeite:

- **Trek de stekker eruit.** Laad een willekeurige toolpagina, ga offline en gebruik hem toch. Hij blijft werken, want er heeft nooit een netwerkstap in gezeten. Een tool die je bestand wegstuurt om het te verwerken zou blijven hangen.
- **Kijk mee met het netwerk.** Open de ontwikkelaarstools, ga naar het tabblad Netwerk en verwerk een bestand. Geen enkel verzoek draagt je bestand, een miniatuur ervan, de bestandsnaam of één byte van de inhoud. Wat je ziet is de pagina, de scripts, de advertenties en de bezoekersteller.
- **Lees de regel die de pagina zichzelf oplegt.** Elke pagina draagt een `Content-Security-Policy` die elk adres noemt waarmee hij contact mag maken, en geen daarvan hoort bij deze site. Zelfs een fout in de code zou geen bestand ergens naartoe kunnen sturen, omdat de browser de verbinding zou weigeren.
- **Lees de code.** Die is [volledig openbaar](https://github.com/A-Box-of-Tools/website), zonder buildstap en zonder bundler: wat in de repository staat is byte voor byte wat je browser uitvoert. Bij elke tool hoort een README die uitlegt hoe hij werkt, en elke toolpagina noemt de bestanden die je het eerst wilt lezen.

Er is precies één bewuste uitzondering op „geen netwerk”, en die staat uitgebreid op zijn eigen pagina: [Tekst delen](https://abox.tools/nl/tekst-delen/) verplaatst tekst tussen twee van je eigen apparaten, en dat kan nu eenmaal niet zonder netwerk. Het opent één verbinding naar een tussenstation dat niets bewaart en dat alleen te horen krijgt dat twee browsers aan elkaar voorgesteld willen worden.

## Hoe de tools gebouwd en gecontroleerd worden

Een tool gaat live als hij werkt op echte bestanden, niet als hij werkt op het bestand waartegen hij geschreven is. In de praktijk betekent dat: hem met de hand in een browser gebruiken op lastige gevallen. De video zonder keyframe precies waar je wilt knippen, de HEIC van een telefoon die de container net iets verkeerd schrijft, de pdf met een half ingesloten lettertype. Dat is wat mensen werkelijk hebben, en dat is precies wat een test niet vindt die geschreven is door dezelfde persoon als de fout.

Daaronder ligt een geautomatiseerde testsuite over allebei de helften: de generator die de site bouwt, en de modules die de browser uitvoert. Hij draait bij elke wijziging, en na een fout wordt er niets gepubliceerd. Waar hetzelfde werk in meerdere tools zit, en een stuk of wat van ze lezen MP4-bestanden, controleert een test of de kopieën het nog met elkaar eens zijn, zodat een reparatie aan de één de andere niet stilletjes fout laat staan.

De gidsen gaan langs dezelfde meetlat. Hun schermafbeeldingen worden door een script van de gebouwde site geplukt in plaats van getekend of nagebootst, dus een plaatje in een gids toont de pagina zoals die er vandaag echt uitziet.

## Hoe dit betaald wordt

Met advertenties, en met donaties van mensen die de tools nuttig vinden. Dat is het hele verdienmodel, en het is de moeite waard om precies te zijn over wat het wel en niet inhoudt.

**Er valt niets te kopen.** Geen account, geen aanmelding, geen gratis laag met een betaalde erboven, geen watermerk dat je moet afkopen, geen limiet op bestandsgrootte, geen daglimiet en geen functie die achtergehouden wordt. Wat op de site staat is het geheel.

**Je bestanden horen niet bij de afspraak.** De advertenties zijn van Google en het tellen gebeurt met Google Analytics, en geen van beide krijgt te horen wat je opent, wat je maakt, hoe het heette of hoe groot het was, want geen van beide scripts krijgt het ooit onder ogen, en het beveiligingsbeleid van de pagina zou het versturen weigeren als een van de twee het probeerde. Wat die twee wél verzamelen, en hoe je ze allebei uitzet, staat op de [privacypagina](https://abox.tools/nl/privacy/). Elke tool blijft werken met allebei geblokkeerd.

**De tools worden niet voor de advertenties geschreven.** Geen enkele tool hier bestaat omdat een zoekwoord geld waard was, en geen enkele is trager, omslachtiger of pagina’s langer gemaakt om meer vertoningen te verkopen. Wat er hierna gebouwd wordt, wordt in het openbaar uitgevochten, in [ROADMAP.md](https://github.com/A-Box-of-Tools/website/blob/main/ROADMAP.md), een alinea per idee, inclusief de redenen waarom een paar voor de hand liggende voorstellen zijn afgewezen.

## Talen

De site verschijnt in vijftien talen. Elke taal is een echte vertaling en geen machinerondje dat is blijven liggen: de namen van de tools, de uitleg, de gidsen en de adressen zelf zijn vertaald, en een pagina wordt pas in een taal opgenomen als die taal er ook werkelijk geschreven is. Een taal waar nog aan gewerkt wordt blijft leesbaar, maar blijft buiten de sitemap en buiten de taalkiezer, zodat niemand wordt uitgenodigd op een pagina die half Engels is.

Post wordt in het Engels beantwoord, en dat is het enige eerlijke dat je over een project van deze omvang kunt zeggen.

## Wat deze site niet doet

- Om een account vragen, of om je e-mailadres.
- Een bestand dat je hier opent uploaden, bewaren, doorkijken of vasthouden.
- Een watermerk op een resultaat zetten, of een functie achterhouden voor een betaalde laag.
- Een netwerkstap toevoegen aan een tool die er geen nodig heeft.
- Op een toolpagina iets beweren wat de code in de repository niet doet.

Zie je een van die dingen toch gebeuren, dan is dat tegelijk een fout en een gebroken belofte, en dan is het de moeite waard om het te melden. De [contactpagina](https://abox.tools/nl/contact/) is de snelste weg.
