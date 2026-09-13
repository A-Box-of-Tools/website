# Kan een AI-agent deze tools gebruiken?

Ja. Het zijn gewone webpagina's, zonder accounts, zonder captcha's en met elke knop benoemd, en een agent bedient ze zoals hij al het andere bedient. De vraag die een pagina verdient zit erachter: als je een bestandsklusje aan een agent geeft, waar gaat het bestand dan heen? Het antwoord hangt volledig af van waar de browser van de agent draait.

Laatst bijgewerkt 6 september 2026

## Het korte antwoord

Ja. Elke tool hier is een gewone webpagina: een bestandskiezer, wat benoemde knoppen, een downloadknop. Er is geen account om op in te loggen, geen captcha om op te lossen, geen stap die per se een mens vraagt. Een AI-agent met een browser bedient deze pagina's zoals hij elke andere bedient — en een aantal dingen die deze site toch al voor mensen doet, blijkt agents gratis van dienst te zijn; de laatste sectie somt ze op.

Maar “kan hij de knoppen indrukken” is de kleine vraag. De vraag die een pagina verdient: wat gebeurt er met de belofte van deze site — *je bestand verlaat je machine nooit* — wanneer de machine die de knoppen indrukt niet jij bent? Het antwoord is dat de belofte de delegatie volmaakt overleeft, of helemaal niet, afhankelijk van één ding: **waar de browser van de agent draait.**

## Twee soorten agents, één onderscheid

Agents die tools gebruiken komen in twee gedaanten, en het verschil daartussen weegt zwaarder dan al het andere op deze pagina.

**Een lokale agent** draait op jouw machine: een assistent die op je computer is geïnstalleerd, of eentje die de browser bestuurt waar je naar kijkt. Wanneer zo'n agent hier een tool opent en hem je bestand aanreikt, gebeurt het werk waar het met deze pagina's altijd gebeurt — in een browser, op jouw hardware. Het bestand wordt van je schijf gelezen, in het geheugen van je browser verwerkt en naar je schijf teruggeschreven. De delegatie heeft niets veranderd aan het pad dat de bytes nemen. Een AI koos de instellingen; het bestand is nog altijd niet vertrokken.

**Een cloudagent** draait een browser op de computer van zijn leverancier. Jij hangt een bestand aan een chat, de agent werkt in een virtuele machine ergens anders, en wat hij ook met deze tools doet, het gebeurt daar. De tools houden zich nog precies aan hun belofte — het bestand komt niet verder dan de browser waarin het zit — maar die browser is niet de jouwe, en de upload was al gebeurd op het moment dat je het bestand bijvoegde, voordat er ook maar één tool open was. Geen pagina kan een upload ongedaan maken die eraan voorafging.

De vraag die deze site blijft stellen — heeft dit klusje nodig dat mijn bestand überhaupt vertrekt? — verdwijnt dus niet wanneer een agent het klusje doet. Ze schuift alleen een stap naar voren, naar de keuze van de agent. Een lokale agent die een tool bestuurt die helemaal in de browser leeft, is de zeldzame opstelling waarin delegeren geen privacy kost: de AI doet het werk, en het bestand blijft thuis.

## Hoe je een klusje aan een agent geeft

Agents werken het best met dezelfde briefing die een collega zou willen: de tool, het bestand, en hoe klaar eruitziet. Een paar patronen die werken:

- **Noem de uitkomst, niet alleen de tool.** “Open abox.tools/afbeelding-comprimeren/ en krijg deze foto onder de 200 KB” geeft de agent het getal waar de pagina om zal vragen. De [afbeeldingscompressor](https://abox.tools/nl/afbeelding-comprimeren/) neemt een doelgrootte bij naam aan — precies het soort opdracht dat een agent trouw kan uitvoeren.
- **Wijs hem de kaart.** Deze site publiceert [llms.txt](https://abox.tools/llms.txt): elke tool en elke gids, met één regel beschrijving per stuk, als platte tekst in één keer ophalen. Een agent die het leest, weet wat hier bestaat zonder iets af te struinen. En elke pagina heeft een tweeling op haar eigen adres met `index.md` erachter: de pagina als Markdown, zonder de interface eromheen, voor een agent die wil weten wat een hulpmiddelpagina zegt in plaats van hoe ze eruitziet.
- **Laat hem de pagina lezen waar hij op staat.** Elke tool draagt zijn vragen en antwoorden in de pagina zelf, en elke tool heeft een gids op één link afstand. Tegen een agent die over een instelling lijkt te twijfelen kun je zeggen dat hij eerst de gids leest — hetzelfde advies dat een mens zou krijgen.
- **Kettingen werken.** De klussen die de workflow-gidsen van deze site voor mensen beschrijven — scannen en dan samenvoegen tot een [PDF](https://abox.tools/nl/afbeeldingen-naar-pdf/); [EXIF](https://abox.tools/nl/exif-gegevens-verwijderen/) strippen en dan verkleinen — zijn de klussen waar agents het best in zijn, omdat de uitvoer van elke stap de invoer van de volgende is en niets ertussen oordeel vraagt.

## Wat je niet delegeert

Een agent kan elke tool hier bedienen. Op twee plekken is bedienen niet het hele werk, en de rest hoort bij jou te blijven.

**Beslissen wat niet gezien mag worden.** De lakgereedschappen verwijderen wat je afdekt — maar kiezen wat je afdekt *is* het werk, en een agent die één regel mist heeft een bestand afgeleverd dat af lijkt en het niet is. Laat een agent gerust het lakgereedschap bedienen; bekijk het resultaat zelf voordat het ergens heen gaat — dezelfde regel die de gidsen van die tools een menselijke bediener meegeven.

**Openen wat gelezen is.** De QR-lezer van deze site weigert te openen wat hij decodeert, omdat lezen en volgen verschillende handelingen zijn. Dezelfde scheiding is het waard om een agent op te leggen: een agent die een code, een link of een adres in een bestand leest, hoort het te melden, niet te bezoeken. En een agent die jouw eigen browser bestuurt, heeft alles in handen waar die browser op is ingelogd — een reden om hem net zo kritisch te bekijken als elke tool, waar de volgende sectie over gaat.

## Een agent kan de belofte ook controleren

De vier controles die de gids over [bestanden uploaden](https://abox.tools/nl/gidsen/is-bestanden-uploaden-veilig/) leert — de stekker eruit, het Netwerk-tabblad bekijken, de Content-Security-Policy lezen, de code lezen — kan een agent allemaal uitvoeren, en ze zijn voor hem zelfs makkelijker dan voor een mens: een CSP-header lezen of geserveerde bron doorzoeken op `fetch`-aanroepen is mechanisch werk. Als je een agent tools laat keuren voordat je ze vertrouwt, verwacht deze site op dezelfde manier gekeurd te worden — en het offline gedrag waar die controles op leunen heeft [een eigen pagina](https://abox.tools/nl/gidsen/hoe-kan-een-webpagina-offline-werken/).

Wat deze site voor een agent doet, doet ze expres en voor iedereen: elke knop is benoemd, omdat schermlezers namen nodig hebben en een agent dezelfde namen leest; de pagina's kennen geen accounts, geen popups en geen toestemmingsmuren om omheen te sturen; de broncode is openbaar en wordt zonder buildstap geserveerd, zodat de code die een agent doorlicht de code is die draait; en [llms.txt](https://abox.tools/llms.txt) is de hele doos in één keer ophalen. Niets daarvan is voor machines toegevoegd. Een pagina die leesbaar is voor een mens met een schermlezer blijkt leesbaar voor al het andere ook.

Eén eerlijke grens: deze pagina gaat over agents die deze tools gebruiken, niet over de agents zelf. Wat de leverancier van een agent ziet — je instructies, je schermafbeeldingen, soms je bestanden — is een aparte vraag, en de gewoonte waar deze hele groep gidsen steeds bij uitkomt is ook daarvoor de juiste bril: vraag je af wat je machine werkelijk moet verlaten, en in welke staat.
