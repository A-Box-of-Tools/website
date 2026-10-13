# JSON formatteren zonder het aan iemand te geven

JSON formatteren hoort de witruimte te veranderen en verder niets. De meeste hulpmiddelen die het aanbieden veranderen meer, en geen van alle zegt het erbij. Dit is waar je op let, hoe je de fout leest wanneer het bestand niet te ontleden is, en waarom het vak waar je een configuratiebestand in plakt een gedachte waard is.

[Open de tool JSON-formatter](https://abox.tools/nl/json-formatteren/): JSON, XML, HTML, CSS en YAML, geformatteerd of omgezet. Er wordt niets in andermans server geplakt.

Laatst bijgewerkt 26 augustus 2026

## Het korte antwoord

Open [Tekst & code](https://abox.tools/nl/json-formatteren/), plak de JSON in het vak, en lees hem. De opmaak gebeurt terwijl je typt, de taal wordt uit de tekst afgeleid, en er wordt met twee spaties ingesprongen tenzij je iets anders zegt. Er wordt niets geüpload, want er is nergens heen te gaan: de ontleder is een paar honderd regels JavaScript die draaien in het tabblad dat je al open hebt.

Alles hieronder is wat de moeite waard is om te weten voordat je een configuratiebestand in een van de alternatieven plakt: wat een formatteerder mag veranderen, wat de meeste toch veranderen, en hoe je de fout leest wanneer het bestand helemaal niet te ontleden is.

![Twee panelen: links één regel JSON, rechts hetzelfde document opgemaakt met twee spaties inspringing.](https://abox.tools/screens/format-json-without-uploading-it/panes.webp)

Eén regel erin, iets leesbaars eruit. Daarvoor is er niets ergens heen gestuurd.

## Wat formatteren is, en wat niet

JSON heeft bijna geen syntaxis. Een object, een array, een tekenreeks, een getal, en de drie woorden `true`, `false` en `null`. Tussen die stukken betekent witruimte niets: het bestand

```
{"name":"thing","tags":["local","offline"]}
```

en het bestand

```
{
  "name": "thing",
  "tags": [
    "local",
    "offline"
  ]
}
```

zijn hetzelfde document. Formatteren is het werk om van het eerste naar het tweede te komen, en *dat is de hele klus*. Alles wat een formatteerder verder met je bestand doet — herschikken, afronden, weglaten — is een verandering van wat het document zegt, aangebracht zonder dat erom gevraagd is.

Drie van die veranderingen komen vaak genoeg voor om te benoemen, omdat ze geruisloos zijn en omdat een formatteerder die in één middag geschreven is ze standaard doet.

## De drie dingen die een formatteerder niet mag veranderen

### De volgorde van je sleutels

Dit is degene waar mensen in trappen. De voor de hand liggende manier om een JSON-formatteerder in JavaScript te schrijven is `JSON.parse` aanroepen en daarna `JSON.stringify` met een insprong, en dat duo bewaart de volgorde niet van sleutels die op gehele getallen lijken:

```
Object.keys(JSON.parse('{"10":"a","2":"b","x":"c"}'))
// ['2', '10', 'x']
```

Het is niemands bug. JavaScript-objecten zijn zo gespecificeerd dat getalachtige sleutels vooraan komen, in oplopende numerieke volgorde, en elke waarde die door `JSON.parse` gaat wordt een JavaScript-object. Een zo gebouwde formatteerder gooit een bestand dat op id, poortnummer, jaartal of HTTP-statuscode gesleuteld is door elkaar, en doet dat zonder een woord.

Of het uitmaakt hangt van het bestand af. JSON-objecten zijn in principe ongeordend, dus technisch is er niets stuk — maar de diff met de versie in je repository wordt enorm, de review onleesbaar, en als iets verderop het bestand op volgorde leest, verandert het gedrag.

### De cijfers van je getallen

JSON zegt niet hoe groot een getal mag zijn, en JavaScript wel: elk getal is een double. Een formatteerder die naar een double ontleedt en die weer uitprint, verliest dus alles wat een double niet kan bevatten.

```
JSON.stringify(JSON.parse('{"id":123456789012345678901}'))
// {"id":123456789012345680000}

JSON.stringify(JSON.parse('{"size":1e999}'))
// {"size":null}
```

Een id van eenentwintig cijfers — een Twitter-id, een Snowflake-id, een bankreferentie — komt terug als een ander getal, en een waarde die te groot is voor een double komt terug als `null`. Beide bestanden laten zich nog steeds ontleden, en geen van beide is het bestand waarmee je begon.

De uitweg is getallen helemaal niet te ontleden. Een formatteerder hoeft alleen te weten waar een getal begint en eindigt om het document op te maken; de waarde heeft hij nooit nodig, dus het veilige is de cijfers precies over te nemen zoals ze er stonden. Dat is wat het hulpmiddel hier doet.

### Je dubbele sleutels

`{"a": 1, "a": 2}` is geldige JSON, en de standaard weigert te zeggen welke van de twee wint. In de praktijk zijn ontleders het oneens: de meeste houden de laatste, sommige de eerste, een enkele weigert het document. Een formatteerder die er stilletjes één uitpoept heeft die beslissing voor je genomen, en het veel nuttiger feit verstopt dat er twee waren — wat bijna altijd een fout in het bestand is, en er een die je zou willen zien.

## Wanneer het bestand niet te ontleden is

De meeste JSON die faalt is niet exotisch. Het is een van zo'n zes dingen, en de fout vertelt je welke, als hij tenminste zegt waar het zit in termen die je kunt terugvinden. Een verschuiving als `positie 4193` doet dat niet; een regel en een kolom wel.

- **Een komma te veel aan het eind.** `{"a": 1,}` mag in JavaScript en niet in JSON. De vaakst voorkomende enkele oorzaak, meestal blijven staan na het wissen van het laatste item van een lijst.
- **Enkele aanhalingstekens.** `{'a': 1}` is een JavaScript-objectliteraal, geen JSON. Tekenreeksen en sleutels staan allebei tussen dubbele aanhalingstekens, en sleutels staan er altijd tussen.
- **Een sleutel zonder aanhalingstekens.** `{a: 1}`, dezelfde fout van de andere kant — meestal doordat er iets uit code geplakt is in plaats van uit een bestand.
- **Opmerkingen.** `// zoals dit` is ook geen JSON. Het is JSONC, dat de instellingen van VS Code en `tsconfig.json` gebruiken, en het laat zich nergens anders ontleden. Moet een opmerking blijven, dan is de afspraak een sleutel: `"_comment": "..."`.
- **Een echte regelovergang of tab in een tekenreeks.** Die moeten als `\n` en `\t` geschreven worden. Dit gaat meestal mis wanneer een shellopdracht of een certificaat met de hand in een waarde geplakt is.
- **Een getal dat JSON niet toestaat.** Nullen vooraan (`01`), een losse decimale punt (`.5`), `NaN`, `Infinity` en `+1` zijn allemaal dingen die mensen schrijven en geen ervan is JSON.

Eentje die geen fout is en er wel op lijkt: een bestand dat begint met een byte-order mark. Die is in de meeste editors onzichtbaar, het is geen witruimte, en hij maakt het allereerste teken van het document onverwacht. Staat de fout op regel 1, kolom 1 van een bestand dat er perfect uitziet, dan is dat het.

![Dezelfde tool met een kapot document: een fout die de regel en de kolom van een komma te veel noemt, en het invoerpaneel met de schuldige regel.](https://abox.tools/screens/format-json-without-uploading-it/error.webp)

Als het niet te lezen is, zegt de melding waar. Een komma te veel is de meest voorkomende oorzaak en met het blote oog het lastigst te zien.

## Verkleinen, en hoe weinig het meestal oplevert

De witruimte eruit persen is dezelfde bewerking achterstevoren, en het is goed nuchter te zijn over wat het je koopt. Witruimte is bijzonder herhalend, en elke server en elke browser tussen jou en een lezer comprimeert het antwoord al met gzip of Brotli, en die zijn juist heel goed in dat soort herhaling.

Verkleinde JSON is dus vaak dertig procent kleiner als bestand en maar een paar procent kleiner over de lijn. Waar het zich wél terugverdient, zijn de plekken zonder compressie ervoor: een waarde in een databasekolom, een veld in een logregel, een lading in een QR-code, of een document dat je zo meteen als Base64 in een header zet.

Wat het kost is leesbaarheid, en staat het bestand in een repository dan kost het je ook de diffs — een bestand van één regel verandert helemaal zodra er ook maar iets in verandert. Verklein op de weg naar buiten uit je editor, niet op de weg naar binnen.

## De sleutels sorteren, en wanneer niet

De sleutels van elk object sorteren wordt hier als keuze aangeboden en niet standaard toegepast, want het is een echte verandering aan het bestand en de waarde ervan hangt helemaal af van wat je zo gaat doen.

Het helpt wanneer je twee documenten vergelijkt die hetzelfde zouden moeten zeggen — de configuratie van twee omgevingen, een API-antwoord voor en na een wijziging — en een van de twee zijn sleutels in een andere volgorde noemt. Beide eerst sorteren maakt van een diff van alles een diff van de twee regels die echt verschillen.

Het schaadt wanneer de volgorde iets deed. Een `package.json` heeft afspraken over wat vooraan komt; een met de hand geschreven configuratie zet verwante instellingen vaak bij elkaar; en een bestand waarvan een hulpmiddel de sleutels sorteerde en dat daarna is vastgelegd, levert één enorme, nietszeggende commit op. Sorteer een kopie, niet het origineel.

Eén detail dat het weten waard is: hier wordt gesorteerd naar hoe de sleutels gelezen worden en niet naar hun codepunten, dus `item2` komt vóór `item10` in plaats van erna. Op codepunt sorteren is wat `item10` midden tussen de enen zet, en dat is technisch juist en nutteloos voor een lezer.

## Twee JSON-bestanden vergelijken

De betrouwbare manier is beide eerst op dezelfde manier te formatteren. Twee documenten die hetzelfde zeggen kunnen op elke regel verschillen als de een verkleind was en de ander niet, en geen enkele diff kan daar doorheen kijken.

Dus: formatteer de eerste, formatteer de tweede, en vergelijk dan de twee uitkomsten. Alle drie de stappen staan hier op dezelfde pagina — het tabblad *Vergelijken* deelt het vak met *Formatteren* precies hierom. Noemen de twee hun sleutels ook nog in verschillende volgorde, sorteer ze dan allebei terwijl je ze formatteert, en de vergelijking krimpt tot het verschil dat je zocht.

## Het stuk dat niemand op de pagina zet

Zoek naar een JSON-formatteerder en je vindt tientallen sites met een vak erop. In dat vak plakken is een upload. Wat er ook in je klembord zat — een API-antwoord met het adres van een klant erin, een configuratiebestand met een verbindingsreeks, een token waar je aan het debuggen was — is naar een machine gestuurd waar jij niet over gaat, en het is nu hun logbestand, hun foutrapport en hun back-up.

Dit is geen aanname over kwade wil. Een volstrekt goedbedoelende site houdt nog steeds toegangslogs bij, draait nog steeds analytics, en heeft nog steeds een hostingpartij. De veiligste gegevens zijn de gegevens die nooit vertrokken zijn, en voor een klus die volledig uit tekstbewerking bestaat is er geen enkele reden om te vertrekken.

Twee controles, en ze werken op elke site die deze belofte doet, niet alleen op deze:

1. **Open de DevTools, kijk naar het tabblad Netwerk, en formatteer iets.** Als je tekst verstuurd wordt, is er een verzoek dat hem draagt. Iets anders kan tegelijk niet waar zijn.
2. **Verbreek de internetverbinding en probeer het opnieuw.** Een hulpmiddel dat het werk in je browser doet merkt er niets van. Een hulpmiddel dat je tekst ergens heen stuurt houdt op met werken, onmiddellijk en volledig.

Er is een langere versie van allebei, met nog twee controles, in [is bestanden uploaden veilig](https://abox.tools/nl/gidsen/is-bestanden-uploaden-veilig/).

## En YAML, XML en de rest?

Dezelfde pagina leest XML, HTML, CSS en YAML, en zet om tussen JSON en de eerste en de laatste daarvan. Twee dingen zijn het meenemen waard van hierboven, want het is hetzelfde argument in een ander pak:

- **YAML naar JSON omzetten verliest de opmerkingen**, want JSON heeft nergens plek voor er een. Ankers en aliassen — YAML's manier om “dezelfde knoop twee keer” te zeggen — zijn ook niet uit te drukken, en worden hier geweigerd in plaats van geraden.
- **`no` is een tekenreeks.** In YAML 1.1 waren `yes`, `no`, `on` en `off` booleans, en daarom kwam een lijst landcodes met Noorwegen erin vroeger terug met `false` erin. YAML 1.2 heeft dat laten vallen en dit ook — maar die woorden worden nog altijd tussen aanhalingstekens teruggeschreven, want wat het bestand hierna opent kan een 1.1-lezer zijn.
