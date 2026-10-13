# Zo maak je telefoonfoto's klaar voor het web

Een telefoonfoto heeft het verkeerde formaat, is vier keer te groot en weet waar je woont. Haar postbaar maken is een korte keten — omzetten, kadreren, comprimeren — en elke stap draait op je eigen machine, precies waar foto's met jouw GPS erin thuishoren.

Laatst bijgewerkt 26 augustus 2026

## Het korte antwoord

1. **iPhone-foto's eerst:** haal alle HEIC-bestanden door de [HEIC-omzetter](https://abox.tools/nl/heic-naar-jpg/), en kies ervoor de metadata weg te laten. Hij vertelt je, voordat er iets wordt omgezet, welke foto's GPS-coördinaten dragen. Foto's die al JPEG zijn, slaan deze stap over.
2. **Kadreren en schalen:** sleep de partij op de [Afbeeldingsschaler](https://abox.tools/nl/afbeelding-formaat-wijzigen/). Stel een lange zijde in — 1600 pixels past bij de meeste pagina's, 2000 als lezers gaan inzoomen — of snijd de hele partij met één klik op dezelfde verhouding bij.
3. **Het budget halen:** eindig in de [Afbeeldingsverkleiner](https://abox.tools/nl/afbeelding-comprimeren/), die een doel in kilobytes neemt in plaats van een kwaliteitsschuif, en een partij als één zip teruggeeft.

Alles draait in je browser. De originelen — volle resolutie, GPS en al — verlaten je machine nooit, en dat is precies de reden om dit lokaal te doen in plaats van via een conversiesite.

## Waar de metadata heen gaat

Het stille risico van een telefoonfoto zijn niet de pixels; het zijn de labels. EXIF-metadata legt de camera vast, de tijdstempels en — op bijna elke telefoon — de GPS-coördinaten van waar de foto is genomen. Post dat en je publiceert misschien je huisadres in een vorm die elke kijker kan lezen.

Het nuttige feit van deze keten is dat ze de labels zelf afhandelt. Schalen en comprimeren tekenen het beeld allebei opnieuw vanuit pixels, en opnieuw getekende pixels dragen geen labels — dus alles wat uit stap 2 of 3 komt is schoon zonder dat je erom vraagt. De twee gevallen die een beslissing vragen:

- **HEIC omzetten:** de omzetter kan de metadata meenemen of weglaten — het is een vinkje — en hij waarschuwt welke foto's GPS aan boord hebben. Voor alles wat openbaar wordt: weglaten.
- **Een foto die je niet schaalt:** moeten de pixels byte voor byte onaangeroerd blijven, gebruik dan de [EXIF-bewerker](https://abox.tools/nl/exif-gegevens-verwijderen/), die de labels verwijdert zonder het beeld opnieuw te coderen. De [metadatagids](https://abox.tools/nl/gidsen/exif-en-gps-gegevens-verwijderen/) is de lange versie.

## Waarom schalen vóór comprimeren

Omdat pixels het budget zijn. Een foto van 12 megapixel, hard genoeg geperst voor een vak van 300 KB, ziet er zichtbaar slechter uit dan een foto van 2 megapixel die zachtjes in hetzelfde vak is gecomprimeerd — dezelfde kilobytes worden over zes keer de oppervlakte uitgesmeerd. Eerst de weergavegrootte beslissen laat de verkleiner zijn budget uitgeven aan kwaliteit in plaats van aan resolutie die niemand zal zien.

De verkleiner schaalt uit zichzelf wanneer het doel anders niet te halen is, maar behandelt dat als laatste redmiddel. Het kadreren zelf in de schaler doen houdt de beslissing — wat eraf gaat, welke rand telt — waar ze hoort.

De [schaalgids](https://abox.tools/nl/gidsen/formaat-van-een-afbeelding-wijzigen/) en de [compressiegids](https://abox.tools/nl/gidsen/afbeelding-naar-exact-formaat-comprimeren/) gaan elk dieper op hun helft in, ook op wat de kwaliteitscijfers echt meten.

![De verkleiner op langste zijde gezet, met 1600 ingevuld en vaste lange zijdes ernaast.](https://abox.tools/screens/get-photos-ready-for-the-web/long-edge.webp)

Eerst de lange zijde, want dat is de enige instelling die een staande en een liggende foto hetzelfde behandelt.

## De hele partij in één keer

Elke tool in de keten neemt een map vol bestanden in één sleep: de omzetter doet elke HEIC inclusief burstopnames, de schaler legt één kadrering over de hele set of laat je elke foto anders bijsnijden, en de verkleiner geeft het geheel terug als één zip. Twintig foto's kosten nauwelijks meer van je aandacht dan één — de machinetijd is die van jouw machine, en hij is korter dan welke upload dan ook geweest zou zijn.

![Drie resultaatregels, elk met een foto teruggebracht van megabytes naar ongeveer 150 kB, met de kwaliteit waarop elk uitkwam.](https://abox.tools/screens/get-photos-ready-for-the-web/quality.webp)

En daarna de kwaliteit, over de hele stapel tegelijk. De volgorde doet ertoe: de sectie hierboven zegt waarom.

## Als je dit elke week doet

Dat de keten hier op drie of vier pagina's woont is opzet — elke pagina doet één klus, en elke bewijst op zichzelf dat niets je machine verlaat. Maar elke stap is open source: MIT-licentie, één map per tool, ES-modules zonder afhankelijkheden met README's die de decoder, het herbemonsteren en het zoeken naar de doelgrootte uitleggen.

Nemen je foto's elke keer dezelfde vorm aan — zelfde lange zijde, zelfde budget, zelfde labels-eruit — zet dan een codeeragent op de [repository](https://github.com/A-Box-of-Tools/website) en vraag hem die modules samen te stellen tot één sleepvak met jouw voorinstellingen erin gebakken. De modules zijn geschreven om gelezen te worden, en ze meenemen is precies waar de licentie voor is.
