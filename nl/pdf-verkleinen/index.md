# Pdf comprimeren — een pdf kleiner maken

Een document laten krimpen zonder het ergens heen te sturen.

> Maak een pdf kleiner zonder hem te uploaden. Je eigen browser leest het bestand, comprimeert het opnieuw en schrijft het weg, en je ziet eerst waar de grootte werkelijk zit.

Deze pagina is een interactief hulpmiddel dat volledig in je browser draait, op https://abox.tools/nl/pdf-verkleinen/ — niets van wat je het geeft wordt geüpload. Hieronder staat alles wat de pagina er in woorden over zegt; om het te gebruiken, open je het adres.

## Je documenten worden **nooit geüpload**. Er is geen server.

Het document wordt op dit apparaat in het geheugen geopend, uit elkaar gehaald en weer weggeschreven, door code die vanaf dit adres geserveerd wordt. Niets hier kan een upload doen, en aan de andere kant van deze pagina staat geen server die er een zou kunnen ontvangen.

- ✗ Geen upload
- ✗ Geen account
- ✓ Werkt offline
- ✓ Open source
- ✓ Bestanden blijven op je apparaat

## Zo maak je een pdf kleiner

1. **Kies een pdf.** Sleep hem het vak in of kies hem met de hand. De browser leest hem rechtstreeks van je schijf, en er gaat ondertussen niets ergens heen.
2. **Kijk waar de grootte zit.** Om die uitsplitsing draait de tweede stap. Bestaat de balk vooral uit afbeeldingen, dan heeft deze tool iets om mee te werken. Bestaat hij vooral uit lettertypen en pagina-inhoud, dan zegt hij dat, en is de eerlijke besparing een paar procent. Dat weet je liever voordat je er een minuut in steekt.
3. **Zeg hoe hard er geknepen mag worden.** De benoemde instellingen zijn resoluties en geen vage rapportcijfers: 96 dpi om van een scherm te lezen, 130 om te mailen, 220 voor iets dat nog geprint moet worden. Elk daarvan wordt afgemeten aan hoe groot het plaatje werkelijk op de pagina getekend wordt, waardoor een foto die als miniatuur staat niet als een paginagrote scan wordt behandeld.
4. **Comprimeer, en lees de regel die zegt dat het nagekeken is.** Zodra het herschrijven klaar is, opent dezelfde lezer op deze pagina het gereedgekomen bestand opnieuw en telt hij de pagina's. Klopt dat niet met het origineel, dan wordt de ronde als mislukt gemeld en krijg je geen download aangeboden.

## De uitgebreide versie

[Hoe je een pdf kleiner maakt, en waarom sommige niet krimpen](https://abox.tools/nl/gidsen/een-pdf-kleiner-maken/): Waar de grootte van een pdf werkelijk zit, waarom een scan 80% krimpt en een contract nauwelijks beweegt, wat dpi hier betekent, en wat een compressor nooit met je document hoort te doen.

## Ook in de gereedschapskist

- [PDF onleesbaar maken](https://abox.tools/nl/pdf-onleesbaar-maken/): De letters worden uit het bestand gewist, en daarna wordt het bestand doorzocht om het te bewijzen.
- [Afbeeldingen naar pdf](https://abox.tools/nl/afbeeldingen-naar-pdf/): Zet je plaatjes in één document.
- [Documentscanner](https://abox.tools/nl/documenten-scannen/): Fotografeer de pagina. Je krijgt iets terug dat eruitziet als een scan.
- [Audio uit video halen](https://abox.tools/nl/audio-uit-video-halen/): Sleep er een video in en haal het geluid eruit. Het beeld wordt nooit gedecodeerd en er wordt niets geüpload.

## Vragen

### Wordt mijn pdf ergens heen geüpload?

Nee. Je eigen browser leest het bestand, comprimeert het opnieuw en schrijft het weg, op je eigen hardware. Deze tool heeft geen serverkant, en in de `Content-Security-Policy` van de pagina staat elk adres dat hij mag benaderen, waarvan er geen enkele bij deze site hoort. Optionele netwerkfuncties heeft hij ook niet.

### Hoeveel kleiner wordt mijn pdf?

Dat hangt volledig af van wat erin zit, en daarom meet de tool het en laat hij het je zien voordat hij ook maar iets comprimeert. Een gescand document bestaat vrijwel geheel uit foto's en komt er meestal 60 tot 90% kleiner uit. Een contract of een scriptie bestaat uit tekst, vectortekeningen en ingebedde lettertypen, die allemaal al gecomprimeerd waren door wat ze maakte. Daar is de besparing meestal een paar procent, uit het opnieuw inpakken van het bestand en het weglaten van wat nergens meer naar verwijst. Elke tool die je een vast percentage belooft zonder naar je bestand te kijken, staat te gokken.

### Kost een pdf comprimeren kwaliteit?

De plaatjes erin worden opnieuw gecodeerd, dus daarvoor geldt: ja. Verder blijft alles onaangeroerd. De tekst blijft tekst, selecteerbaar en doorzoekbaar, de lettertypen blijven heel en de vectortekeningen worden exact overgenomen. De tool weigert bovendien een plaatje voor niets slechter te maken, want komt een hercodering niet kleiner uit dan het origineel, dan gaan de originele bytes onaangeroerd terug het document in.

### Wat is dpi hier, en waarom wordt ernaar gevraagd?

Een pdf legt vast hoe groot elk plaatje op de pagina getekend wordt, waardoor de tool de effectieve resolutie kan uitrekenen. Een scan van 4000 pixels die over twintig centimeter papier gelegd wordt, draagt zo'n 500 pixels per inch. Niets op een scherm en heel weinig op papier kan daar iets mee, dus de pixels boven de instelling die jij kiest gaan er als eerste af. Ze kosten kwaliteit die niemand kan zien. Door die meting wordt een klein geplaatst logo niet hetzelfde behandeld als een paginagrote scan.

### Kan hij een pdf met een wachtwoord openen?

Nee, en dat is met opzet. Een versleuteld document wordt geweigerd met een melding die dat ook zegt, zelfs wanneer het wachtwoord leeg is, en zo slaan veel scanners en kopieerapparaten nu eenmaal op. De beveiliging van een bestand halen is een andere klus dan het comprimeren, en een tool die dat stilletjes deed, zou iets doen waar je niet om gevraagd hebt.

### Zijn er pdf's die hij niet kan comprimeren?

Sommige afbeeldingen erin, ja. Voor JPEG 2000, JBIG2 en faxgecodeerde (CCITT) afbeeldingen heeft geen enkele browser een decoder, dus die gaan onaangeroerd door en worden als zodanig gemeld. De laatste twee zijn tweekleurencodecs en zitten meestal toch al bijna op hun kleinst. CMYK-afbeeldingen blijven ook met rust, omdat hercoderen de kleuren kan verschuiven die een drukker eruit zou krijgen. Alles wat de tool overslaat staat bij de resultaten, met de reden erbij.

### Gaat het gecomprimeerde bestand overal nog open?

Ja. De uitvoer wordt geschreven als pdf 1.5, en dat begrijpt elke lezer die sinds 2003 is uitgekomen. De tool bewijst dat ook nog eens op je eigen apparaat, want hij opent het gereedgekomen bestand opnieuw en telt de pagina's voordat hij het je aanbiedt. Formulieren, links, bladwijzers, de toegankelijkheidsstructuur en eventuele ingesloten bijlagen gaan mee. Wat achterblijft is het materiaal waar niets in het document nog naar verwees.

### Is het gratis, en heb ik er een account voor nodig?

Het is gratis, en er komt geen account, geen inlog en geen proefperiode aan te pas. Een limiet op de bestandsgrootte is er ook niet, behalve wat het geheugen van je eigen apparaat toelaat. De site draait op advertenties, en die betalen hem. Die advertenties krijgen niets over je document mee.

### Werkt het offline?

Ja. Laad de pagina één keer, verbreek daarna je internetverbinding en hij werkt gewoon door. Dat is meteen de eenvoudigste manier om te bewijzen dat er niets geüpload wordt, want een tool die je document wegstuurde om het te laten comprimeren zou ermee ophouden zodra je de stekker eruit trok.

## Hoe je de privacybelofte controleert

- **Je document kan nergens heen.** In de Content-Security-Policy staat elk adres dat deze pagina mag benaderen, en geen daarvan hoort bij deze site. Deze tool voegt niets aan die lijst toe, want hij heeft geen eigen netwerkfunctie, ook geen optionele. Er is hier geen eindpunt waar je bestand verzameld zou kunnen worden, en in de code staat niets wat het zou versturen als dat eindpunt er wel was.
- **Het hele formaat staat in deze repository.** Een pdf is een lijst objecten plus een tabel van waar elk object begint. `src/objects.js` leest die syntaxis, `src/reader.js` volgt de tabel en `src/writer.js` schrijft een nieuwe. Geen van de drie importeert iets wat een verzoek kan doen. Er wordt geen bibliotheek opgehaald en er wordt niets op een server gerenderd.
- **Versleutelde bestanden gaan er niet in.** Een pdf met een wachtwoord erop wordt geweigerd, ook het soort dat scanners maken met een leeg wachtwoord en dat technisch gezien gewoon zou opengaan. De beveiliging van een document afhalen is een andere klus dan het kleiner maken, en een tool die dat stiekem voor je deed, zou je onaangenaam verrassen.
- **Er gaat iets uit in plaats van in.** Het gereedgekomen bestand draagt geen aanmaakdatum, geen producentregel en geen naam van de tool die het maakte. Staat het vinkje aan, dan verliest het ook het XMP-pakket en de privéblokken die opmaakprogramma's achterlaten. Dat is hetzelfde argument als bij de EXIF-tool, alleen toegepast op een andere container.
- **Wat Google laadt, en wat het niet te zien krijgt.** De advertentie- en meetscripts komen van Google. Geen van beide krijgt iets over je document mee: geen bestand, geen pagina, geen naam, geen grootte, geen aantal pagina's. Elke regel die een pdf leest, decodeert of schrijft, wordt vanaf deze herkomst geserveerd en staat in de repository.
- **Wat de doneerknop laadt, en wat hij niet te zien krijgt.** De knop “Buy me a coffee” in de kop wordt getekend door een script van cdnjs.buymeacoffee.com en haalt zijn letters bij Google Fonts. Het is een link en verder niets. Hij meldt geen bezoek en krijgt niets over jou of je document mee. Er gebeurt niets tenzij je erop klikt, en waar je dan naartoe klikt is de site van iemand anders.
- **Het werkt offline.** Verbreek de verbinding en alles op deze pagina doet het nog. Eenvoudiger bewijs bestaat er niet, want een tool die je document wegstuurde om het te laten comprimeren zou ermee ophouden.

**Controleer het zelf.** Je hoeft niets van het bovenstaande op ons woord aan te nemen. Een buildscript maakt deze pagina uit de sjablonen en de configuratie in de repository, en dat script kun je lezen en zelf draaien. Het resultaat staat vastgelegd op de branch `dist`, dus je kunt wat er geserveerd wordt vergelijken met wat een build van de bronnen oplevert: https://github.com/A-Box-of-Tools/website

De bestanden die je als eerste wilt lezen zijn `config/site.toml` voor de Content-Security-Policy, en `src/reader.js` en `src/writer.js` voor het hele lees- en herschrijfwerk. Geen van beide kan bij het netwerk.
