# Is base64 versleuteling?

Nee. Base64 is een kostuumwissel, geen slot: wie het herkent, draait het in milliseconden terug, zonder enige sleutel. Maar de vraag verdient een echt antwoord, want codering, versleuteling en hashing lijken op het scherm op elkaar en konden in wat ze beloven niet meer verschillen.

Laatst bijgewerkt 26 augustus 2026

## Het korte antwoord

Nee. Base64 is een *codering*: een manier om willekeurige gegevens op te schrijven met slechts vierenzestig veilige tekens, zodat ze de reis overleven door systemen die voor kale tekst gebouwd zijn. Het heeft geen sleutel, geen geheim en geen enkele veiligheidseigenschap. Decoderen vereist herkennen, meer niet — een mens kost dat één blik, een computer één milliseconde.

Toch is de vraag het waard, want de verwarring is universeel en soms duur. Een base64-reeks *ziet er* door elkaar gehusseld uit — `cGFzc3dvcmQ=` zegt het oog niets — en wat er gehusseld uitziet, belandt in het laatje “veilig”. Echte producten zijn verscheept met wachtwoorden die zo “beschermd” waren. De remedie is één onderscheid, één keer geleerd: **coderen is voor machines, versleutelen is voor geheimen, hashen is voor vingerafdrukken.** Drie klussen, drie gereedschappen, en maar één ervan beschermt iets.

## Codering: door iedereen terug te draaien

Een codering verandert hoe gegevens *geschreven* worden, nooit wat ze zeggen. E-mailbijlagen, afbeeldingen in stylesheets, tokens in adressen — overal moeten willekeurige bytes door kanalen die alleen tekst betrouwbaar dragen, en base64 is het standaardkostuum: drie bytes erin, vier tekens eruit, gemaakt van letters, cijfers en twee leestekens, met `=` als opvulsel aan het einde. Die `=` is het herkenningsteken, en wie hem eenmaal kent, ziet base64 overal.

De eigenschap die alles bepaalt: het recept is openbaar en draait achterstevoren precies zo. Er valt niets te weten, dus er valt niets niet te weten. Procentcodering in adressen (`%20` voor een spatie), HTML-entiteiten (`&amp;`), hexadecimaal en backslash-escapes zijn hetzelfde idee in andere kleren, en de [base64-codeerder en -decodeerder](https://abox.tools/nl/base64-coderen/) hier spreekt ze allemaal, in beide richtingen, op je eigen machine. Een gevonden reeks decoderen is exact zo legitiem als haar lezen, want een codering was nooit een slot.

## Versleuteling: terug te draaien door de sleutelhouder

Versleuteling is degene die inhoud werkelijk beschermt. Ze transformeert gegevens met een *sleutel*, en de wiskunde is zo ingericht dat terugrekenen zonder sleutel niet gewoon moeilijk is maar rekenkundig buiten bereik — terwijl het mét sleutel onmiddellijk lukt. Het geheim woont volledig in de sleutel, niet in de methode: de algoritmen zijn gepubliceerd, gestandaardiseerd, en juist daardoor sterk.

Hier bijt de visuele verwarring, want versleutelde bytes worden routineus base64-gecodeerd om te kunnen reizen — eerst door een sleutel gehusseld, dan gekostumeerd voor het vervoer. Twee lagen, twee klussen. Het JSON Web Token is het schoolvoorbeeld: drie stukken base64, verbonden door punten, waarvan de eerste twee voor iedereen die het probeert naar leesbare JSON *decoderen*. Mensen plakken dagelijks tokens in openbare webdecodeerders, in de veronderstelling dat het geheel verzegeld was; de eerlijke beschrijving is dat een JWT een briefkaart met fraudebestendige handtekening is, geen envelop.

## Hashing: door niemand terug te draaien

Een hash loopt maar één kant op. Stuur eender hoeveel gegevens door SHA-256 en er komt een getal van vaste grootte uit — hetzelfde getal elke keer voor dezelfde gegevens, een compleet ander getal voor gegevens die één bit verschillen, en geen weg terug van het getal naar de gegevens, voor niemand, sleutel of geen sleutel. Het is geen kostuum en geen slot; het is een *vingerafdruk*.

Dat maakt het tot het juiste gereedschap voor de twee klussen die het toebehoren. Controleren dat een gedownload bestand exact het bestand van de uitgever is — vingerafdrukken vergelijken, wat het gereedschap [checksum controleren](https://abox.tools/nl/checksum-controleren/) op je machine doet, met [een eigen gids](https://abox.tools/nl/gidsen/de-checksum-van-een-download-controleren/). En wachtwoorden bewaren: een goed gerunde dienst bewaart alleen de hash van het jouwe, zodat zelfs zijn gestolen database het wachtwoord niet bevat. Wanneer een site je je vergeten wachtwoord kan mailen, heeft ze je verteld dat ze het nooit gehasht heeft — en wanneer een config het hare “beveiligt” als `cGFzc3dvcmQ=`, heeft ze je verteld dat ze het alleen maar codeerde.

## Ze uit elkaar houden in het wild

Een werkende vuistregel voor de reeks voor je neus:

- **Decodeert hij naar iets leesbaars?** Dan was het codering. Letters, cijfers, misschien `+` en `/`, vaak `=` aan het eind — haal hem door een decodeerder en kijk.
- **Decodeert hij naar binaire ruis?** Dan was de base64 alleen het kostuum, en is wat eronder zit versleuteld, gecomprimeerd, of nooit tekst geweest — de codering zegt je in beide gevallen niets.
- **Vaste lengte, hexadecimale tekens, decodeert nooit?** 64 hexadecimale tekens is het silhouet van SHA-256; 32 dat van MD5. Hashes decoderen niet; ze komen alleen overeen, of niet.

En de praktische moraal bij elk: vertrouw geheimhouding nooit toe aan een codering; bouw nooit zelf versleuteling wanneer je platform haar meelevert; bewaar een wachtwoord nooit anders dan gehasht. De reeks die je decodeert om te kijken, kan intussen zelf het gevoelige deel zijn — een token dat gedebugd wordt is dat meestal — en daarom draait de [decodeerder hier](https://abox.tools/nl/base64-coderen/) waar het geheim al is, op je eigen machine, en daarom heeft [wat plakken in een webtool werkelijk doet](https://abox.tools/nl/gidsen/is-plakken-in-een-online-tool-veilig/) een eigen pagina.
