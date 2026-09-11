# Privacy & cookies

De korte versie: je bestanden worden nooit geüpload, want er is nergens om ze naartoe te uploaden. Al het andere op deze pagina gaat over de advertenties, de bezoekersteller en de hosting, oftewel de onderdelen waar wél andere bedrijven bij betrokken zijn.

Laatst bijgewerkt 3 september 2026

## Je bestanden

Elke tool op deze site doet zijn werk binnen je eigen browser, op je eigen hardware. Kies je een bestand, dan wordt het gelezen door de pagina die je al open hebt staan. Het wordt niet naar ons gestuurd, want er is geen server van ons om het naartoe te sturen. Deze site is een verzameling statische bestanden, zonder backend, zonder database en zonder opslag.

Dat betekent dat wij nooit het volgende ontvangen, zien, opslaan, loggen of verwerken:

- je bestanden, geheel of gedeeltelijk
- miniaturen of voorvertoningen daarvan
- hun namen, groottes, afmetingen of formaten
- hoeveel je er koos, of wat je ermee deed
- wat er ook maar uit gelezen wordt, EXIF- en gps-gegevens inbegrepen

Dit is geen belofte over onze bedoelingen. Elke pagina draagt een `Content-Security-Policy` die elk adres noemt dat de pagina mag benaderen, en de browser dwingt hem af. Geen van die adressen is van ons. Je kunt de policy boven aan de broncode van elke pagina lezen, of het tabblad Netwerk van je browser openen en meekijken: geen enkel verzoek draagt je bestand.

Bestanden die je met een tool maakt, worden aan het eigen downloadmechanisme van je browser gegeven en opgeslagen waar jij dat zegt. Ook bij die stap zijn wij niet betrokken.

## De ene uitzondering, en waar die geldt

De tool [Afbeeldingen naar video](https://abox.tools/nl/afbeeldingen-naar-video/) heeft een functie “toevoegen vanaf een webadres”. Plak je daar een adres in, dan haalt je browser die afbeelding op bij de server die je noemde, en **die server ziet je IP-adres** en welk bestand je opvroeg. Dat is onvermijdelijk, en het is de hele aard van de functie.

Het gebeurt alleen ooit voor adressen die je zelf intikt, het is zo gebouwd dat afbeeldingen naar binnen kunnen maar gegevens niet naar buiten, en de eigen pagina van die tool legt het uitgebreider uit. Geen enkele andere tool op deze site kan een uitgaand verzoek doen met iets van jou erin.

## Wat er verzameld wordt, en door wie

Deze site is gratis en wordt betaald met advertenties. Dat betekent dat er twee Google-producten op deze pagina's draaien, en op de meeste ervan een doneerknop. Dit is de hele lijst.

### Google AdSense: de advertenties

Google serveert de advertenties en bepaalt welke je te zien krijgt. Om dat te doen mag het cookies of vergelijkbare identificatoren in je browser zetten en lezen, en het ontvangt je IP-adres, een globale locatie die daaruit afgeleid wordt, je user agent, en op welke pagina je was. Afhankelijk van je instellingen en waar je bent, kunnen de advertenties gepersonaliseerd worden aan de hand van een profiel dat Google over je heeft, grotendeels opgebouwd uit je gedrag op andere sites.

Wij ontvangen daar niets van, we kunnen het niet zien, en we sturen Google nooit iets over je bestanden. Googles eigen uitleg over hoe het gegevens gebruikt van sites die zijn advertenties draaien, staat op [policies.google.com/technologies/partner-sites](https://policies.google.com/technologies/partner-sites).

### Google Analytics: de bezoekersteller

We gebruiken Google Analytics 4 om paginabezoeken te tellen, zodat we weten aan welke tools het werken waard is. Het legt vast welke pagina je bekeek, ongeveer wanneer, een willekeurig gegenereerde identificator die in je browser bewaard wordt, een globale locatie, je apparaat- en browsertype, en de site die je doorstuurde.

Het is zo ingesteld dat het verder niets doet, en die instelling is een bestand dat je kunt lezen: `analytics.js` naast elke pagina zet een paginaweergaveteller op en bevat helemaal geen eigen gebeurtenissen. Niets op deze site geeft het een bestand, een bestandsnaam, een afmeting of een aantal door, want er staat hier geen code die dat zou kunnen.

### Buy Me a Coffee: de doneerknop

De hubpagina en de toolpagina's dragen een doneerknop, die van de servers van Buy Me a Coffee geladen wordt. Hem laden betekent dat hun CDN je IP-adres ziet en dat je op deze site was, en de letters van de knop worden bij Google Fonts opgehaald, dat eveneens je IP-adres ziet. Er wordt verder niets verstuurd, en er gebeurt niets meer tenzij je er echt op klikt, en op dat moment zit je op hun site onder hun voorwaarden. Deze pagina en de [pagina Voorwaarden](https://abox.tools/nl/voorwaarden/) tekenen de knop niet.

### Hosting

De site wordt geserveerd door GitHub Pages, achter Cloudflare. Zoals elke webhost verwerken zij de verzoeken die je browser doet, waaronder je IP-adres, de opgevraagde pagina en je user agent, om de pagina te leveren en de dienst draaiend en veilig te houden. Wij hebben van geen van beide toegang tot logboeken per bezoeker.

### De tussenpersoon van het deelgereedschap

Eén gereedschap, [Tekst en bestanden delen](https://abox.tools/nl/tekst-delen/), brengt tekst en bestanden rechtstreeks van de ene browser naar de andere, en een rechtstreekse verbinding vraagt om een introductie. Daarom opent die pagina, als enige op deze site, één WebSocket naar een kleine server van ons, die de twee uiteinden van een linknaam bij elkaar brengt en de opbouw van de verbinding tussen hen doorgeeft. De tekst en de bestanden ziet hij nooit, want die reizen over de versleutelde verbinding die hij tot stand bracht. Hij ziet wel de linknaam, wanneer elke kant verbindt en vertrekt, en de IP-adressen, en Cloudflare, dat hem draait, bewaart zeven dagen lang een logboek van elke verbinding. Het is het enige logboek per bezoeker op deze site dat wij kunnen lezen. De pagina van het gereedschap beschrijft hem volledig, en zijn volledige broncode staat in de repository.

## Cookies

We zetten geen eigen cookies. We hebben geen login en geen sessie, en er is maar één voorkeur die we ooit onthouden.

**De taal die je kiest.** Kies je een taal in de taalschakelaar, dan wordt die keuze in de lokale opslag van je browser gezet, onder de naam `abox-lang`, zodat de volgende pagina die je opent in de taal staat waar je om vroeg. Een cookie is het niet: het wordt nooit naar ons of naar wie dan ook verstuurd, het blijft op het apparaat waarop je dit leest, en het verdwijnt zodra je de sitegegevens van je browser wist. Kies je nooit een taal, dan wordt er helemaal niets weggeschreven, want een pagina die in de eigen taal van je browser verschijnt is ter plekke bepaald en meteen weer vergeten.

Elk cookie of vergelijkbare identificator die je hier tegenkomt, is van Google en wordt gezet door de advertentie- en analytics-scripts die hierboven beschreven zijn. Ze worden gebruikt om bezoeken te meten en om advertenties te kiezen en te begrenzen.

### Hoe je het uitzet

- Advertentiepersonalisatie kun je voor alle sites tegelijk uitzetten in [My Ad Center](https://myadcenter.google.com/).
- Google Analytics kun je overal blokkeren met Googles [opt-out-browserextensie](https://tools.google.com/dlpage/gaoptout).
- De eigen instellingen van je browser kunnen cookies van derden blokkeren of wissen, en elke contentblokkeerder voorkomt dat deze scripts überhaupt laden.

Alles blokkeren vinden wij prima. **Elke tool op deze site werkt met de scripts geblokkeerd, en werkt met het netwerk volledig losgekoppeld.** Er wordt hier niets achter een advertentie gehouden.

## Je rechten op de gegevens

Wij hebben geen persoonsgegevens over je, dus er is niets wat we je kunnen tonen, corrigeren, exporteren of verwijderen. Een verzoek aan ons zou eerlijk gezegd leeg terugkomen.

De hierboven beschreven gegevens liggen bij Google, dat daarvoor zijn eigen verwerkingsverantwoordelijke is. Verzoeken daarover moeten naar hen, via [je Google-account](https://myaccount.google.com/) of hun privacycontacten.

## Kinderen

Deze site is niet op kinderen gericht en vraagt niemand naar zijn leeftijd, want ze vraagt niemand om wat dan ook. Wij verzamelen bewust van niemand persoonsgegevens, van welke leeftijd ook.

## Wijzigingen, en hoe je ons bereikt

Verandert deze pagina, dan verandert de datum bovenaan mee, en de bewerking staat samen met al het andere in de openbare commitgeschiedenis.

Vragen hierover kunnen naar [hi@abox.tools](mailto:hi@abox.tools), of als issue opgeworpen worden op [de repository](https://github.com/A-Box-of-Tools/website), waar het antwoord zichtbaar is voor iedereen die zich hetzelfde afvraagt.
