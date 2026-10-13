# Zo controleer je een download tegen zijn checksum

De regel hex onder een downloadlink staat er zodat je kunt aantonen dat het bestand ongeschonden is aangekomen. Hem vergelijken kost een minuut. Weten wat die vergelijking waard is, en welke gewoonte haar waardeloos maakt, kost de rest van deze pagina.

[Open de tool Hash en checksum](https://abox.tools/nl/checksum-controleren/): Controleer een download tegen het getal dat de maker erbij zette, zonder hem naar iemand te sturen.

Laatst bijgewerkt 26 augustus 2026

## Het korte antwoord

Open [Hash en checksum](https://abox.tools/nl/checksum-controleren/), sleep het bestand dat je hebt gedownload erop, en plak de checksum van de downloadpagina in het vak onderaan. De pagina leidt uit de lengte af welk algoritme het getal is en antwoordt met een zin.

Klopt het, dan zijn de bytes op je schijf de bytes die de maker heeft gemeten. Klopt het niet, download het bestand dan opnieuw voordat je het opent. Alles hieronder is wat die zin weglaat.

## Wat het getal onder de downloadlink is

De uitkomst van een hashfunctie: een berekening die elke byte van een bestand leest en er een kort antwoord van vaste lengte van maakt. Hetzelfde bestand geeft altijd hetzelfde antwoord, en een bestand dat één bit afwijkt geeft een volstrekt ander antwoord. Niet een bijna gelijk antwoord, maar een dat er niets mee te maken heeft. Op die eigenschap steunt het hele idee.

Omdat het antwoord kort is en het bestand niet, gooit de berekening informatie weg, en zijn er onvermijdelijk veel bestanden die hetzelfde antwoord opleveren. Er met opzet een vinden is het moeilijke deel, en hoe moeilijk dat is, is wat de algoritmes hieronder van elkaar onderscheidt.

Aan een checksum is niets geheim en niets omkeerbaar. Het is een vingerafdruk, gepubliceerd zodat twee mensen het erover eens kunnen worden dat ze hetzelfde in handen hebben.

## Welk algoritme je voor je hebt

Je hoeft niet te kiezen: de maker heeft dat al gedaan, en jouw werk is hetzelfde uit te rekenen. Je ziet het aan de lengte alleen:

- **32 hextekens** — MD5.
- **40** — SHA-1.
- **64** — SHA-256, en dit zie je het vaakst.
- **96** — SHA-384.
- **128** — SHA-512.

Er zijn er geen twee even lang, en daarom kan het gereedschap een geplakte waarde herkennen zonder dat het je iets hoeft te vragen. Een reeks van 63 tekens is de checksum van niets: het is een SHA-256 die onderweg naar het klembord een teken kwijtraakte.

![De resultatenkaart: de MD5-, SHA-1-, SHA-256- en SHA-512-controlegetallen van één bestand, elk met een kopieerknop.](https://abox.tools/screens/verify-a-file-checksum/digests.webp)

Allemaal tegelijk, want welke je moet gebruiken bepaalt wie het bestand heeft gepubliceerd, en niet jij.

## Op je eigen apparaat, zonder browser

Elk besturingssysteem heeft iets aan boord dat dit kan, en de opdracht kennen is de moeite waard, ook als je er een webpagina voor gebruikt. Op de vraag "hoe weet ik dat jullie site eerlijk gerekend heeft" bestaat geen beter antwoord dan hetzelfde bestand door het gereedschap te halen dat bij je computer zat.

**Windows**, in PowerShell:

```
Get-FileHash .\disk.iso -Algorithm SHA256
```

Oudere machines hebben in plaats daarvan `certutil -hashfile disk.iso SHA256`, dat in hoofdletters en met spaties schrijft. Hoofdletters doen bij een checksumvergelijking nooit ter zake: die letters zijn cijfers, geen woorden.

**macOS**:

```
shasum -a 256 disk.iso
```

**Linux**:

```
sha256sum disk.iso
```

Alle drie drukken voor hetzelfde bestand dezelfde reeks af, en deze site ook. Het zijn exacte specificaties met gepubliceerde testvectoren; er is geen ruimte voor een implementatie om er een mening op na te houden.

## Vergelijken zonder scheel te gaan kijken

Lees geen vierenzestig tekens van twee schermen af om vervolgens te besluiten dat ze hetzelfde lijken. Mensen controleren de eerste vier en de laatste vier en houden op, en dat is precies de vergelijking die een aanvaller zou zorgen te doorstaan. Het is ook de manier waarop een eerlijke vergissing erdoorheen glipt.

Plak ze allebei in iets dat voor je vergelijkt. Op de opdrachtregel is de optie `-c` daarvoor:

```
sha256sum -c SHA256SUMS
```

In de browser is het het vergelijkvak van [Hash en checksum](https://abox.tools/nl/checksum-controleren/), dat de waarde aanneemt in de vorm waarin de maker hem heeft opgeschreven: kale hex, een regel `sha256sum`, een heel `SHA256SUMS`-bestand, de vorm `SHA256 (disk.iso) = …`, of een `integrity="sha384-…"` uit een scripttag. Het antwoord komt als zin.

![De vergelijkkaart: een controlegetal in een vak geplakt, en een oordeel dat het bij het bestand hoort.](https://abox.tools/screens/verify-a-file-checksum/compare.webp)

Plak wat de downloadpagina zei en laat de tool vergelijken. Vierenzestig tekens van een scherm aflezen is de stap die hiermee verdwijnt.

## Wat een treffer precies bewijst

Dat de bytes op je schijf de bytes zijn die iemand voor zich had toen die dat getal opschreef. Dat is echt nuttig om te weten en het is smaller dan de meeste mensen aannemen, dus het loont om op te sommen wat het wel en niet dekt.

**Een treffer sluit uit:**

- een download die te vroeg stopte en je een bestand naliet dat er compleet uitziet;
- beschadiging onderweg, op een schijf die het begeeft, of door een slechte USB-kabel;
- het verkeerde bestand: de ARM-build in plaats van de x86-build, of de release van vorige maand;
- een mirror die stilletjes iets anders uitdeelt dan hij zegt.

**Een treffer sluit niet uit:**

- **dat het bestand kwaadaardig is.** Een maker kan malware net zo nauwkeurig meten als al het andere. Een checksum zegt "dit is wat ze hebben uitgeleverd", nooit "dit is veilig";
- **dat de maker gekraakt is.** Wie het bestand op de server heeft vervangen, heeft de checksum eronder in dezelfde minuut vervangen. Waarmee we bij de volgende paragraaf zijn.

## De fout waardoor de hele exercitie niets meer voorstelt

De checksum van dezelfde pagina en over dezelfde verbinding halen als het bestand.

Bedenk waartegen je je verdedigt. Gaat het om een beschadigde download, dan mag de checksum overal vandaan komen en werkt de controle. Gaat het erom dat iemand aan het bestand heeft gezeten, dan kon degene die het bestand kon veranderen ook de regel hex eronder veranderen, want allebei kwamen ze van dezelfde server over dezelfde verbinding. Je zou de vervalser vragen de handtekening te bevestigen.

Een checksum is het meest waard als hij je bereikt langs een weg die het bestand niet heeft genomen:

- een `SHA256SUMS`-bestand met een losse GPG-handtekening, gecontroleerd tegen een sleutel die je al had. Dat is wat distributies publiceren en dat is het echte antwoord;
- de release-aankondiging op een mailinglijst, of een tag in een coderepository, in plaats van de downloadpagina;
- een tweede mirror op een ander domein, en de twee daarna met elkaar vergeleken;
- een pakketbeheerder, die dit voor je doet tegen sleutels die met het besturingssysteem zijn meegeleverd.

Niets hiervan maakt het controleren van een checksum op dezelfde pagina nutteloos. Het vangt de kapotte download, en dat is de storing die mensen werkelijk overkomt. Praat jezelf alleen niet aan dat het meer heeft gevangen.

## MD5 en SHA-1 zijn gebroken. Gebruik ze toch, soms

Allebei zijn ze gebroken in de sterkste zin die hier telt: *botsingen* zijn met opzet te bouwen. Twee verschillende bestanden met dezelfde MD5 zijn sinds 2004 op gewone hardware te maken, en in 2017 leverde een team twee verschillende PDF's met dezelfde SHA-1 af. In 2020 zakte de variant met zelfgekozen begin naar enkele tienduizenden dollars aan gehuurde rekentijd.

In de praktijk betekent dat dit: een MD5 die klopt vertelt je niet meer dat niemand aan het bestand heeft gezeten, want wie dat wilde had een ander bestand met hetzelfde getal kunnen bouwen. Hij vertelt je nog steeds dat de download niet is afgebroken of beschadigd, want een willekeurig ongeluk komt niet op een botsing uit: die kans heeft nog nooit een ongeluk gehad.

Heeft de maker dus alleen een MD5 afgedrukt, controleer die dan. Dat is meer waard dan niet controleren. En publiceer je zelf, druk dan een SHA-256 af.

## Hij klopt niet. Wat nu?

1. **Download hem opnieuw**, van dezelfde plek. Een afgebroken of hervatte overdracht is verreweg de meest voorkomende oorzaak, en een tweede kopie lost het meestal op.
2. **Kijk of je de juiste regel hebt.** Releasepagina's noemen meerdere bestanden: de checksum van het installatieprogramma zal nooit kloppen met die van het archief, en die van ARM nooit met die van x86.
3. **Controleer de versie.** Een checksumpagina in je bladwijzers is verouderd op de dag dat er een tussenrelease uitkomt.
4. **Probeer een andere mirror** en vergelijk de checksums van de twee bestanden met elkaar. Twee mirrors die het onderling eens zijn en van het gepubliceerde getal afwijken, is een ander probleem dan één mirror die van beide afwijkt.
5. **Open hem ondertussen niet.** Een bestand dat zijn checksum niet haalt, is in het beste geval beschadigd en in het slechtste niet het bestand dat je vroeg.

## Waarom dit in een browser doen

Omdat de opdrachtregel niet is waar de meeste mensen zitten, en omdat het voor de hand liggende alternatief, een website die je vraagt het bestand te uploaden, een vreemde manier is om om te gaan met een installatieprogramma waarover je al twijfelt. Een bestand ergens heen sturen om uit te zoeken of er onderweg aan gezeten is, voegt precies één plek toe waar eraan gezeten kan worden.

[Hash en checksum](https://abox.tools/nl/checksum-controleren/) leest het bestand in stukken van vier megabyte op je eigen apparaat, dus er is geen upload, geen maximum en niets om op te vertrouwen behalve de pagina zelf, die je kunt lezen en die blijft werken met de netwerkkabel eruit. Vertrouw je liever je eigen besturingssysteem, voer dan de opdracht uit de paragraaf hierboven uit en vergelijk de twee antwoorden. Ze zullen gelijk zijn.
