# DICOM-viewer — een .dcm-scan openen in je browser

CT, MRI, röntgen en echo, met het venster, de header en de metingen.

> Open CT-, MRI-, röntgen- en echoscans in je browser. Venster en niveau, een hele serie doorbladeren, meten in millimeters, elke DICOM-tag lezen en precies zien wat er in het bestand de patiënt aanwijst. Er wordt niets geüpload.

Deze pagina is een interactief hulpmiddel dat volledig in je browser draait, op https://abox.tools/nl/dicom-viewer/ — niets van wat je het geeft wordt geüpload. Hieronder staat alles wat de pagina er in woorden over zegt; om het te gebruiken, open je het adres.

## Je scans worden **nooit geüpload**. Er is geen server.

De scan wordt door je eigen browser geopend en gedecodeerd: de header, de pixels, het venster, de metingen. Aan de andere kant van deze pagina staat geen server om medische gegevens naartoe te sturen, ook niet als iets hier dat zou willen, en niets over het bestand — niet de naam van de patiënt, niet het onderzoek, niet de bestandsnaam — wordt aan wie dan ook doorgegeven.

- ✗ Geen upload
- ✗ Geen account
- ✓ Werkt offline
- ✓ Open source
- ✓ Bestanden blijven op je apparaat

## Zo open je een DICOM-bestand

1. **Kies de bestanden.** Eén `.dcm`-bestand, of de hele map van het schijfje — een CT of een MRI is één bestand per coupe, en ze allemaal tegelijk erin slepen is wat de serie weer in elkaar zet. De bestanden worden door de browser rechtstreeks van je schijf gelezen; er wordt ondertussen niets ergens heen gestuurd.
2. **Kies de serie.** Een onderzoek bevat er meestal meerdere: de scout, en dan elke acquisitie. Elke serie wordt gestapeld in de volgorde waarin het apparaat hem heeft opgenomen, afgeleid uit waar elke coupe in het lichaam ligt en niet uit de nummering, die niet altijd dezelfde kant op loopt.
3. **Zet het venster.** Dit is de knop die een scan leesbaar maakt, en die een fotobewerker niet heeft. Sleep over het beeld om het venster breder te maken en omhoog of omlaag om het midden te verschuiven, of kies een van de vensters met een naam — long, bot, hersenen, zacht weefsel — op een CT, waar de eenheden op elk apparaat ter wereld dezelfde zijn.
4. **Blader door de stapel.** De schuif onder het beeld gaat door de coupes heen, en de pijltjestoetsen doen hetzelfde zodra je op het beeld hebt geklikt. Een bestand met meerdere frames — een echolus, een angiogram — speelt af met de knop ernaast.
5. **Meet iets.** Ga naar Meten en sleep een lijn. Waar het bestand zegt hoe ver zijn pixels uit elkaar liggen, staat het antwoord in millimeters en wordt er rekening gehouden met pixels die niet vierkant zijn; waar het bestand dat niet zegt, staat het antwoord in pixels en zegt het dat er ook bij in plaats van een schaal te verzinnen.
6. **Lees de header.** Elk element in het bestand, met zijn nummer, hoe de standaard het noemt en wat erin staat, doorzoekbaar. Daarboven de lijst van wat er in dit ene bestand de patiënt aanwijst — en dat is heel wat meer dan de naam.
7. **Neem mee wat je nodig hebt.** Het beeld op het scherm als PNG, met het venster dat je hebt gezet en zonder iets erin gebrand, of de hele header als platte tekst. Allebei worden ze in de pagina opgebouwd uit wat er al is.

## De uitgebreide versie

[Hoe je een DICOM-bestand opent, en wat erin zit](https://abox.tools/nl/gidsen/een-dicom-bestand-openen/): Wat er op een ziekenhuisschijfje staat, waarom de bestanden geen extensie hebben, hoe je een .dcm-scan in een browser opent, wat venster en niveau nu eigenlijk doet, en wat een scan behalve het beeld over de patiënt meedraagt.

## Ook in de gereedschapskist

- [Afbeelding naar ICO](https://abox.tools/nl/favicon-maken/): Eén plaatje erin. Elk formaat dat een browser, Windows of een Mac vraagt eruit.
- [Afbeelding naar data-URI](https://abox.tools/nl/afbeelding-naar-base64/): Het hele plaatje als één regel tekst. Plak hem zo in je CSS of HTML.
- [SVG naar afbeelding](https://abox.tools/nl/svg-naar-png/): Noem het formaat. Een vector heeft er zelf geen om te verliezen.
- [Afbeelding naar SVG](https://abox.tools/nl/afbeelding-naar-svg/): Eén vorm, één omtrek. Wijs aan wat er niet in hoort.

## Vragen

### Wordt mijn scan ergens naartoe geüpload?

Nee. Het bestand wordt door je eigen browser op je eigen hardware gelezen, gedecodeerd en getekend. Dit gereedschap heeft geen serverkant, en het `Content-Security-Policy` van de pagina noemt elk adres dat hij mag benaderen — geen daarvan hoort bij deze site. Trek de stekker uit het netwerk en hij opent nog steeds scans. \
\
Dat is hier meer waard dan op welke andere pagina van deze site ook. Een DICOM-bestand draagt de naam, de geboortedatum en het patientennummer in zijn header, dus er een uploaden naar een viewer betekent dat je een vreemde een medisch dossier geeft, en geen plaatje.

### Welke DICOM-bestanden kan hij openen?

Ongecomprimeerde bestanden in elk van de drie basis-transfer-syntaxes — implicit en explicit little endian, en de ingetrokken big-endian — plus deflated, RLE Lossless, baseline JPEG en JPEG Lossless, en dat laatste is waarmee de meeste CT- en MRI-onderzoeken op een ziekenhuisschijfje zijn gecomprimeerd. \
\
Hij kan JPEG 2000, JPEG-LS en de MPEG- en HEVC-syntaxes voor video niet decoderen. Daar zijn codecs voor nodig die megabytes aan gecompileerde bibliotheek zijn, en een pagina die er een zou ophalen wanneer het uitkomt, zou geen pagina zijn die offline werkt. Een bestand in zo'n vorm gaat toch open: de hele header wordt gelezen en getoond, en in plaats van het beeld staat er een regel die de codec noemt, in plaats van een gebroken-plaatje-icoon dat je niets vertelt.

### Wat is „venster en niveau”, en waarom heb ik dat nodig?

Een CT-coupe bevat zo'n vierduizend verschillende waarden en je scherm laat tweehonderdzesenvijftig grijstinten zien. Het venster is de keuze welk stuk van dat bereik ze allemaal krijgt: alles eronder is zwart, alles erboven is wit, en wat ertussen zit wordt over de grijstinten verdeeld. \
\
Daarom lijkt hetzelfde bestand bij twee instellingen een andere scan, en daarom kun je long en bot niet tegelijk zien. Op een CT zijn de getallen Hounsfield-eenheden, en die zijn absoluut vastgelegd — water is 0 en lucht is −1000 — dus de vensters met een naam op deze pagina zijn dezelfde getallen die een radioloog aan een werkstation gebruikt. Op een MRI of een echo bestaat zo'n schaal niet, en het venster dat opengaat is het venster waar het bestand zelf om vraagt.

### Waarom staat er dat mijn meting in pixels is?

Omdat dat bestand niet zegt hoe groot een pixel is. Pixel Spacing (0028,0030) is het veld dat dat draagt, in millimeters, en heel veel echobeelden, gescande documenten en secondary captures hebben het gewoon niet. \
\
Waar het er wel is, staat de meting in millimeters en wordt elke as met zijn eigen afstand gemeten, wat uitmaakt bij beelden waarvan de pixels niet vierkant zijn. Waar het er niet is, is het eerlijke antwoord een aantal pixels, en dat zegt hij er ook bij in plaats van een schaal te kiezen en het resultaat als een lengte te presenteren.

### Hij heeft mijn map als meerdere series geopend. Waarom?

Omdat dat is wat erin zit. Een onderzoek bestaat uit series — het scout-beeld, en dan elke acquisitie of reconstructie — en elk bestand zegt bij welke het hoort in Series Instance UID (0020,000E). Het uitklapmenu is daaruit opgebouwd en niet uit de map, waarin ze meestal allemaal door elkaar in één lijst met namen staan. \
\
Binnen een serie worden de coupes op volgorde gezet naar waar ze in het lichaam liggen, afgeleid uit Image Position en Image Orientation. Instance Number is de voor de hand liggende sleutel en is de terugval en niet de eerste keuze: hij wordt toegekend door wat de bestanden ook geschreven heeft en hoeft niet dezelfde kant op te lopen als de patiënt.

### Wat betekent de lijst „wat de patiënt aanwijst”?

Het is elk veld in je bestand dat de persoon van wie de scan is benoemt, of dat inperkt wie het zou kunnen zijn, van dit bestand op jouw machine afgelezen. De lijst komt uit PS3.15 van de DICOM-standaard — het deel dat zegt wat eruit moet voordat een dataset gedeïdentificeerd genoemd mag worden. \
\
Hij staat er omdat waar mensen zich in vergissen niet is dat er een naam in een scan staat. Het is hoeveel er verder nog in staat: de geboortedatum, het aanvraagnummer, de verwijzend arts, de instelling, het serienummer van het apparaat, en de UID's van het onderzoek, die perfecte sleutels terug zijn naar het archief dat het bestand gemaakt heeft. Een scan waarbij alleen de naam is weggehaald is niet anoniem. \
\
Dit gereedschap laat het je alleen zien. Het schrijft niets en verandert niets, dus het kan er ook niets van weghalen.

### Kan hij een scan anonimiseren?

Nee, en hij doet met opzet niet alsof. Deze pagina leest; er staat geen code in die een DICOM-bestand schrijft. Wat hij wél doet is je precies vertellen wat er in het jouwe zit, en dat is het deel dat lastig te achterhalen is en waar mensen zich in vergissen. \
\
Een gereedschap dat de identificatoren eruit haalt is een aparte klus met een veel hogere lat — het moet het bestand herschrijven zonder de pixels aan te raken, de UID's consistent vervangen over een heel onderzoek, en gelijk hebben over de privé-elementen waar sommige apparaten een tweede kopie van de naam in verstoppen. Dat staat op de roadmap van deze site en wordt niet aan een viewer vastgeplakt.

### Kan hij een bestand openen zonder .dcm-extensie, of een kapot bestand?

Ja op allebei. Er wordt niet naar de extensie gekeken: wat gecontroleerd wordt is het bestand zelf. Een dataset die zonder de gebruikelijke 128 bytes preambule geschreven is — en zo ziet een scan eruit die rechtstreeks van het netwerk komt — wordt gelezen door de codering af te leiden uit het eerste element, en de pagina zegt dat hij dat gedaan heeft. \
\
Een bestand dat halverwege ophoudt wordt gelezen tot zover het komt. Alles vóór de schade wordt getoond, met een notitie erbij die zegt bij welke byte hij gestopt is. Dat is nu juist het geval waarin een viewer het hardst nodig is, dus het hele bestand weggooien om de laatste twaalf bytes zou verkeerd gedrag zijn.

### Is dit een diagnostische viewer?

Nee. Het is geen medisch hulpmiddel, het heeft geen enkele regelgevingsbeoordeling doorlopen, en niets hiervan hoort gebruikt te worden om een klinische beslissing te nemen. Je scherm is niet gekalibreerd, de browser is geen gevalideerde renderketen, en geen van beide is vanuit een webpagina op te lossen. \
\
Waar hij wel goed voor is, is al het andere waarvoor mensen een scan openen: kijken wat er op een schijfje staat, een coupe eruit halen voor een college of een artikel, een header lezen, uitzoeken waarom een ander programma het bestand weigert, en zien wat een scan meedraagt over de persoon van wie hij is.

### Verandert hij mijn bestand?

Nee. Dit gereedschap leest alleen. Er is geen uitvoerbestand, geen hercodering en geen knop hier die een DICOM schrijft — wat je kunt downloaden is een PNG van het beeld op het scherm en een kopie van de header als platte tekst. Je origineel blijft onaangeroerd op je schijf.

### Is het gratis, en heb ik een account nodig?

Het is gratis, en er is geen account, geen inloggen en geen proefperiode. Er is geen limiet op de bestandsgrootte of op hoeveel bestanden je opent, behalve het geheugen van je eigen machine. De site draait advertenties, en dat is wat hem betaalt; de adverteerders krijgen niets over je bestand.

### Werkt het offline?

Ja. Laad de pagina één keer, verbreek daarna de internetverbinding en hij blijft werken. Dat is meteen de eenvoudigste manier om te bewijzen dat er niets geüpload wordt: een gereedschap dat je scan wegstuurt om hem te laten tekenen, stopt op het moment dat je de stekker eruit trekt.

## Hoe je de privacybelofte controleert

- **Je scan kan nergens heen.** Het Content-Security-Policy noemt elk adres dat deze pagina mag benaderen, en geen enkel adres daarvan hoort bij deze site. Er is hier geen eindpunt waar je bestand verzameld zou kunnen worden, en niets in de code dat het zou versturen als dat er wel was. Er stond eerst `connect-src 'none'`, wat absoluut was; advertenties toevoegen heeft dat gekost, en dat erbij zeggen hoort bij de afspraak.
- **Hier weegt dit zwaarder dan op de andere pagina's.** Een DICOM-bestand is geen plaatje met wat metagegevens eraan. Het is een medisch dossier met een plaatje erin: de naam van de patiënt, de geboortedatum, het patientennummer, het aanvraagnummer, de verwijzend arts, de instelling en het serienummer van het apparaat zijn allemaal velden in de header, en ze reizen met het bestand mee waar het ook heen gaat. Er een uploaden naar een website om ernaar te kijken betekent dat je dat allemaal afgeeft aan wie die website beheert. Dat is precies wat deze pagina bestaat om niet te doen.
- **De lezer is veertien bestanden in deze repository.** Niets hier gebruikt een bibliotheek die ergens vandaan gehaald wordt. `src/dicom.js` loopt door het bestand, `src/dictionary.js` weet hoe de tags heten, `src/pixels.js` maakt van de bytes weer metingen, `src/rle.js` en `src/jpeg-lossless.js` pakken de twee gecomprimeerde vormen uit die deze pagina kan decoderen, en `src/window.js` zet wat er gemeten is om naar de grijstinten van je scherm.
- **De identificatoren staan er voor jou, en voor niemand anders.** De pagina drukt elk veld in je bestand af dat de persoon van wie de scan is benoemt of afbakent, want dat is de vraag waar iemand die op het punt staat een coupe te delen antwoord op nodig heeft, en geen enkele viewer geeft dat. Het komt op het scherm voor je te staan en gaat nergens anders heen: er is in deze repository geen analytics-gebeurtenis die er iets van meedraagt, en de pagina zou er ook geen kunnen versturen als die er wel was.
- **Hij leest. Hij schrijft niet.** Er is hier geen knop die je bestand verandert, en geen code die dat zou kunnen. Wat je mee kunt nemen is een PNG van het beeld op het scherm en een tekstkopie van de header, allebei in de pagina opgebouwd uit wat er al staat. Je origineel blijft onaangeroerd op je schijf, wat meteen het eerlijke antwoord is op wat er gebeurt als je het tabblad sluit.
- **Wat Google laadt, en wat het niet krijgt.** De scripts voor advertenties en meting komen van Google. Geen van beide krijgt iets over je bestand: niet de pixels, niet een miniatuur, niet een naam, een tag, een patiënt of een bestandsnaam. Elke regel die een scan inleest, decodeert of tekent wordt vanaf deze oorsprong geserveerd en staat in de repository.
- **Wat de donatieknop laadt, en wat hij niet krijgt.** De „Buy me a coffee”-knop bovenaan wordt getekend door een script van cdnjs.buymeacoffee.com en haalt zijn letters bij Google Fonts. Het is een link en verder niets: hij meldt geen bezoek, en hij krijgt niets over jou of je bestanden. Er gebeurt niets tenzij je erop klikt, en waar je dan terechtkomt is de site van iemand anders.
- **Het werkt offline.** Verbreek de verbinding en elk onderdeel van deze pagina blijft werken. Dat is het eenvoudigste bewijs van allemaal: een gereedschap dat je scan wegstuurt om hem te laten tekenen, stopt op het moment dat je de stekker eruit trekt.

**Controleer het zelf.** Je hoeft niets van het bovenstaande op ons woord aan te nemen. Een buildscript maakt deze pagina uit de sjablonen en de configuratie in de repository, en dat script kun je lezen en zelf draaien. Het resultaat staat vastgelegd op de branch `dist`, dus je kunt wat er geserveerd wordt vergelijken met wat een build van de bronnen oplevert: https://github.com/A-Box-of-Tools/website

De bestanden die je als eerste wilt lezen zijn `config/site.toml` voor de Content-Security-Policy, `src/dicom.js` voor de parser die door het bestand loopt, `src/pixels.js` voor het decoderen van de pixels, `src/jpeg-lossless.js` voor de codec waarmee de meeste ziekenhuizen exporteren, en `src/window.js` voor het venster en het niveau — en in geen daarvan staat een regel die het netwerk zou kunnen bereiken.
