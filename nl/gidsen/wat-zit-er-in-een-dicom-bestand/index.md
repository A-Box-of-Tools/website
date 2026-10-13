# Wat zit er in een DICOM-bestand?

Meer dan de scan. Een DICOM-bestand is een medisch dossier met een beeld erin: je naam, je geboortedatum en je ziekenhuisnummer reizen in hetzelfde bestand als de pixels — wat het meest telt op precies het moment dat iemand je een cd in handen drukt en je een viewer gaat zoeken.

Laatst bijgewerkt 26 augustus 2026

## Het korte antwoord

Een DICOM-bestand — de `.dcm` op de cd die een ziekenhuis je meegeeft — is geen beeldformaat zoals JPEG. Het is een dossierformaat met een beeld erin. Voordat de pixels beginnen, draagt het bestand een header van honderden labels, en daaronder, routineus: de volledige naam van de patiënt, geboortedatum, geslacht en ziekenhuisnummer; datum, tijd en omschrijving van het onderzoek; de verwijzend arts; de instelling en het apparaat, tot het serienummer aan toe; en een set unieke identificatoren die als sleutels terug het archief in werken dat ze voortbracht.

Niets daarvan is te zien wanneer het beeld op het scherm staat, en precies zo raakt het vergeten. De scan is het dossier. Behandel het bestand als het document dat het is, niet als het plaatje dat het bevat.

## Waarom juist dit bestand zo achteloos geüpload wordt

De val in de praktijk: na een onderzoek krijgt iemand een schijfje of een download mee, probeert het te openen, en niets op de machine wil — DICOM is geen formaat dat gewone software spreekt. Dus zoekt hij “dcm bestand openen online”, en het meeste wat hij vindt is een uploadvak. Even later staat een compleet, geïdentificeerd medisch dossier — naam, geboortedatum, ziekenhuisnummers, onderzoeksomschrijvingen met de smaak van een diagnose en al — op de server van wie die dag toevallig goed scoorde.

Let op de vorm: het is opnieuw het probleem van het identiteitsbewijs — een gevoelig bestand, een moment wrijving, een zoekmachine — maar met een bestand dat in de tweede graad gevoelig is. Een paspoort lekt wie je bent; een scan lekt wie je bent *en wat er werd onderzocht*. Het algemene betoog over uploaden heeft [een eigen pagina](https://abox.tools/nl/gidsen/is-bestanden-uploaden-veilig/); dit is het bestand waarvoor dat betoog geen enkele kruiding nodig heeft.

Het bestand lokaal openen is de hele remedie, en daarvoor is de [DICOM-viewer](https://abox.tools/nl/dicom-viewer/) hier: de scan, een echte venster/niveau-regeling, een map teruggestapeld tot zijn serie, metingen in millimeters, elk headerlabel leesbaar — en niets verlaat je machine. Het stappenplan staat in [de gids om er een te openen](https://abox.tools/nl/gidsen/een-dicom-bestand-openen/).

## “Ik heb de naam verwijderd” is geen de-identificatie

De volgende fout is fijner en beter bedoeld: een scan delen — met een second-opiniondienst, een onderzoeker, een forum — na het wissen van het voor de hand liggende label. De standaard zelf is bot over hoe weinig dat is. DICOM's eigen de-identificatieprofiel somt de labels op die behandeld moeten zijn voordat een dataset ge-de-identificeerd mag heten, en het loopt tot in de *honderden* posten, omdat identiteit op meer plekken woont dan het naamveld:

- **Directe identificatoren voorbij de naam** — geboortedatum, patiëntnummer, dossiernummer, de namen van arts en instelling.
- **Sleutels** — de unieke identificatoren die in elk bestand gestempeld staan: ze zeggen niet wie je bent, maar wel exact *welk dossier je bent*, voor elk systeem dat het origineel ooit zag.
- **Quasi-identificatoren** — datum en tijd van het onderzoek, model en serienummer van het apparaat, lichaamsdeel, leeftijd van de patiënt: elk vaag, samen smal.
- **De pixels zelf** — echografie en sommige andere modaliteiten branden de naam van de patiënt recht in het beeld, waar geen labelbewerking bijkan. (Voor een geëxporteerd beeld is dat werk voor [weglakken op pixelniveau](https://abox.tools/nl/afbeelding-onleesbaar-maken/), niet voor een metadatatool.)

Daarom heeft de viewer hier een paneel dat exact opsomt wat er in jouw bestand de patiënt identificeert, en hoe direct — gebouwd uit de lijst van de standaard zelf. En daarom kan de viewer alleen *lezen*: hij bevat geen code die een DICOM-bestand schrijft, want “geanonimiseerd” is een belofte met een veel hogere lat dan een viewer haalt — en een gereedschap dat haar half hield, zou erger zijn dan een dat haar nooit doet.

## Een scan behandelen als het dossier dat hij is

De gewoontes vallen vanzelf uit al het bovenstaande:

- **Bekijk hem lokaal.** Een viewer die werkt met de wifi uit — deze doet dat — heeft bewezen waar het werk gebeurt. De meegeleverde viewer op het schijfje, als die op jouw machine draait, is ook prima.
- **Deel via medische kanalen wanneer de inhoud het punt is.** Een onderzoek naar een ander ziekenhuis sturen is een opgelost probleem met aanspreekbare infrastructuur erachter; een persoonlijke e-mail met een `.zip` vol `.dcm`-bestanden is een kopie van je dossier in mailservers, voor onbepaalde tijd.
- **Moet je een bestand delen, weet dan eerst wat erin zit.** Lees de header en het identiteitspaneel, zodat wat je doorgeeft een besluit is in plaats van een verrassing — en beschouw “netjes ge-de-identificeerd” als een dienst die je beeldcentrum je op verzoek verschuldigd is, niet als een vinkje dat je improviseert.
- **Bedenk dat het schijfje de boodschap overleeft.** De kopie in de downloadmap en de cd in de la zijn óók complete dossiers, net als de ID-scan die niemand zich herinnert gewist te hebben.

Niets hiervan zegt dat je nooit een scan mag delen — second opinions zijn waar de kopieën voor bestaan. Het zegt: het bestand is een document over jou, dus de twee vragen waar deze hele groep gidsen telkens bij uitkomt, zijn ook hier de juiste — aan wie wordt het overhandigd, en moest die overhandiging überhaupt gebeuren.
