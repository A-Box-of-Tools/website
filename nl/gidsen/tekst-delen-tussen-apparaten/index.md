# Zo deel je tekst en bestanden tussen apparaten zonder ze te uploaden

De gebruikelijke manieren om een notitie of bestand naar een andere machine te brengen laten allemaal een kopie achter: in een map met verzonden items, in een chatgeschiedenis, of op de server van een deelwebsite, achter een verwijderknop die je maar moet geloven. Er is een manier die nergens iets achterlaat, omdat er nooit iets wordt opgeslagen - en het is ook de enige met een naam die je door een kamer kunt roepen.

[Open de tool Tekst en bestanden delen](https://abox.tools/nl/tekst-delen/): Wat je deelt leeft in dit open tabblad. Lezers halen het versleuteld rechtstreeks uit je browser, en het tabblad sluiten beëindigt het - geen server bewaart iets.

Laatst bijgewerkt 27 augustus 2026

## Het korte antwoord

Open [Tekst en bestanden delen](https://abox.tools/nl/tekst-delen/) op de machine die het heeft, schrijf of voeg bij, en druk op *Beginnen met delen*. De pagina geeft het delen een naam als `brave-otter-42`; open op het andere apparaat dezelfde pagina en zet `#brave-otter-42` achter het adres — of volg gewoon de gekopieerde link. Het andere apparaat vraagt eerst voordat het verbindt, jij laat het binnen, en de tekst of het bestand steekt versleuteld over, rechtstreeks van browser naar browser. Sluit het delende tabblad en het is voorbij, overal.

Er is op geen enkel moment iets geüpload. Dat is geen beleid, dat is de vorm van het ding. De rest van deze pagina legt uit waarom dat ertoe doet, en waar de eerlijke grenzen liggen.

![De eerste kaart van de deeltool: een tekstvak met een paar regels vergadernotities, met daarboven een Markdown-schakelaar en een knop om een bestand toe te voegen.](https://abox.tools/screens/share-text-between-devices/write.webp)

Wat er wordt overhandigd. In hetzelfde vak past een boodschappenlijst of een document, en Markdown is een schakelaar en geen aparte stand.

## Waar de gebruikelijke wegen een kopie achterlaten

Mail jezelf een notitie en die bestaat nu in een map verzonden items en een inbox, beide gesynchroniseerd, beide geback-upt, beide over jaren nog doorzoekbaar. Plak een wachtwoord in een chat-app en het staat in de geschiedenis van dat gesprek — en in de cloudback-up van de app — zolang het gesprek bestaat. Gebruik een pastebin of een bestandssite en de inhoud staat op hun server, achter een vervalinstelling en een verwijderknop waarvan je alleen de kleur kunt controleren. Elk van die wegen is een opslagdienst met delen als functie.

Soms is dat precies wat je wilt: een kopie die wacht tot de ander zover is. Maar de meeste snelle deelacties zijn het tegendeel: het andere apparaat staat ernaast, de inhoud is van het moment, en elke bewaarde kopie is pure last. Het wifi-wachtwoord voor een gast, een adres voorgelezen door de telefoon, een foutmelding die een tweede paar ogen nodig heeft, een stukje configuratie op weg naar de machine waar het hoort. Niets daarvan wil een archief.

## Wat “rechtstreeks” werkelijk betekent

Het gereedschap gebruikt WebRTC, dezelfde machinerie als videobellen in de browser: twee browsers openen een versleuteld kanaal naar elkaar en sturen de data daar doorheen, zonder server op het pad. Op hetzelfde netwerk reizen de bytes alleen over het lokale netwerk — twee laptops op dezelfde wifi geven het bestand door de kamer door, niet door het internet.

Eén eerlijk sterretje, dat ook op de pagina van het gereedschap staat: twee browsers kunnen elkaar niet zelf vinden. Een kleine server — de tussenpersoon — brengt degene die de naam intypte samen met degene die eronder deelt, en vervoert een paar kilobyte verbindingsopbouw tussen hen. Hij slaat niets op, en de inhoud passeert hem nooit; zijn volledige broncode is gepubliceerd naast die van het gereedschap. Hij is de introductie, niet het gesprek — en de enige server waarmee iets op deze site praat, wat de reden is dat de pagina van het gereedschap precies uitschrijft wat hij wel en niet kan zien.

Rechtstreeks betekent ook wederzijds: elke browser leert het netwerkadres van de ander, zoals bij een telefoongesprek. De lezende kant weet dat voordat er enige verbinding bestaat, en verbindt alleen uit eigen keuze.

## De naam is het adres, en het enige geheim

Een deellink onderscheidt zich op één praktisch punt van elke andere: hij overleeft het uitspreken. `brave-otter-42` roep je door een kamer, lees je voor door de telefoon of schrijf je over van een whiteboard, en typ je aan de andere kant in zonder dat iemands duimen het begeven. Precies daarvoor zien de namen eruit zoals ze eruitzien.

En het snijdt aan twee kanten: wie een levende naam kent of raadt, kan openen wat erachter zit. Geef iets gevoeligs óf een naam die niemand zou raden, óf leun op de standaard: delen is *privé* zolang je het vinkje niet weghaalt, wat betekent dat elke lezer die aankomt zich moet voorstellen en dat jij, bericht voor bericht, beslist wie er binnenkomt. De introductie reist over het versleutelde rechtstreekse kanaal, dus zelfs de tussenpersoon weet niet wie er klopte.

![De tweede kaart: een linknaam die thursday-notes luidt, een notitie dat de naam het adres en het enige geheim is, en schakelaars voor privé en eenmalig.](https://abox.tools/screens/share-text-between-devices/name.webp)

De naam is het hele adres. Privé betekent dat elke lezer het moet vragen en dat jij hem binnenlaat; eenmalig betekent dat het concept ook op dit apparaat niet blijft staan.

## Wat het sluiten van het tabblad werkelijk beëindigt

Het delen leeft in het delende tabblad en nergens anders, dus dat tabblad sluiten ís het wissen — geen verzoek daartoe. De link sterft binnen een seconde of twee, en lezers die nog kijken zien hun pagina leeg worden. Er is geen serverkopie met een eigen levensloop, geen prullenbak, geen bewaartermijn van dertig dagen. Het concept dat je typte blijft in je eigen browser voor de volgende keer, en zelfs dat gaat uit met de eenmalig-instelling.

Wat niet eindigt, is bezit. Een lezer die de tekst kopieerde of het bestand downloadde terwijl het delen open was, heeft het — precies alsof je het op elke andere manier had overhandigd. Geen gereedschap kan terugsturen ongedaan maken, en eentje dat het beweert liegt tegen je over andermans computer. Stoppen regeert de toekomst — niemand nieuw, niets meer — en dat is het deel dat een dienst met bewaarde kopie je niet kan geven.

## Het onlinesollicitatiegesprek is het ideale geval

Een overdrachtsgereedschap wil beide uiteinden aanwezig, en het sollicitatiegesprek is de ene afspraak waar aanwezigheid gegarandeerd is: jullie kijken elkaar al aan. Het is ook het moment waarop de wegen met een bewaarde kopie het duurst zijn. Wat door de meetingchat gaat, belandt in het transcript van het platform, vastgemaakt aan de opname en aan wie die later krijgt doorgestuurd; en wie met een gedeeld scherm zijn mail of een chat-app opent om een link te halen, zet zijn correspondentie op andermans opname. De deelpagina toont het gedeelde ding en verder niets.

In de praktijk: de portfoliolink, de repository, de PDF van de opdracht, het stukje code dat de typografische aanhalingstekens van het chatvenster niet zou overleven — start het delen voor het gesprek en zeg, als het moment daar is, de naam hardop. `brave-otter-42` komt ongeschonden door een spraakoproep, precies daarvoor zijn de namen zo gevormd, en de andere kant heeft het bestand voordat de zin af is. Privé gelaten maakt het delen van de binnenkomst van je gesprekspartner bovendien iets wat je midden in het gesprek goedkeurt in plaats van een openstaande deur; en als de oproep eindigt, eindigt met het sluiten van het tabblad ook het delen — niets blijft in een transcript wachten om later uit z'n verband te worden herlezen.

Eén eerlijke voorbereiding: interviewers zitten vaker dan de meeste lezers op strenge bedrijfsnetwerken, en juist daar woont het zeldzame paar zonder directe route. Hun netwerk kun je van thuis uit niet testen — maar het gereedschap meldt het mislukken binnen twintig seconden in plaats van te blijven hangen, dus het uitwijkplan kost je ogenblikken, niet het gesprek.

## Wanneer dit het verkeerde gereedschap is

Beide uiteinden moeten aanwezig zijn: dit is een overhandiging, geen brievenbus. Slaapt de ander, gebruik dan iets dat opslaat — bewust. Het delende tabblad moet open en wakker blijven, wat in de praktijk betekent dat een desktop of laptop deelt; telefoons leggen achtergrondtabbladen binnen seconden stil, al lezen ze een delen prima. Offline werken kan niet, als enige op deze site, omdat een andere machine bereiken een netwerkhandeling is — al werkt de editorhelft zonder enige verbinding. En een kleine minderheid van netwerkparen — typisch één uiteinde op het netwerk met gedeelde adressen van een mobiele provider of achter een streng bedrijfsnetwerk — is helemaal niet rechtstreeks te verbinden; het gereedschap zegt dat na twintig seconden ronduit en biedt de lezer een versleuteld tussenstation aan dat de bytes doorgeeft zonder ze te kunnen lezen, in plaats van er stilletjes op over te schakelen.

Voor al het andere — de notitie, het wachtwoord, het configuratiebestand, de video van 100 MB op één wifi-sprong afstand — is de rechtstreekse versie sneller, eenvoudiger, en laat ze de wereld precies achter zoals ze hem aantrof.
