# Audio knippen zonder kwaliteitsverlies

Een audioknip valt op het exacte moment dat je markeerde, in elke speler, altijd — en dat geldt voor video niet. Hier staat waarom, wat de enige echte adder onder het gras is, en wat je eraan doet.

[Open de tool Audioknipper](https://abox.tools/nl/audio-knippen/): Markeer tijdens het afspelen wat het waard is. Je krijgt het terug als één bestand, geknipt waar jij het zei.

Laatst bijgewerkt 26 augustus 2026

## Het korte antwoord

Open de [Audioknipper](https://abox.tools/nl/audio-knippen/), sleep de opname erin, druk op `I` en `O` om elk stuk te markeren dat je wilt houden — zoveel als je wilt — en exporteer. Elke knip valt op het exacte sample dat je markeerde, de bewaarde samples komen eruit zoals ze erin gingen, en de naden krijgen een fade van vijf milliseconden zodat ze niet kunnen klikken.

Dat is de hele klus. De rest van deze pagina gaat over waarom die nauwkeurigheid echt is en geen verkooppraatje, en over het ene ding dat wél misgaat wanneer je twee stukken geluid aan elkaar zet.

## Waarom een audioknip exact kan zijn terwijl een videoknip dat niet kan

Video wordt niet opgeslagen als een rij complete plaatjes — dat zou enorm zijn. De meeste frames zijn opgeslagen als een beschrijving van hoe ze van hun buren verschillen, dus ze zijn niet los te decoderen. Alleen een **keyframe** staat op zichzelf, en keyframes liggen doorgaans één tot tien seconden uit elkaar. Een knipper die frames kopieert kan daarom niet beginnen waar jij wilt: hij moet bij een keyframe beginnen, en daarom begint een ingekorte video soms een seconde of twee vóór je markering. [De videogids](https://abox.tools/nl/gidsen/een-video-inkorten/) gaat daar grotendeels over.

Geluid kent daar niets van. Zodra een opname gedecodeerd is, is het een rij getallen — één per kanaal, tienduizenden keren per seconde — en elk van die getallen staat helemaal op zichzelf. Sample 1.234.567 heeft sample 1.234.566 niet nodig om iets te betekenen. Een knip kan dus op elk willekeurig sample vallen, en “precies waar je markeerde” betekent precies dat: jouw markering in seconden, maal de bemonsteringsfrequentie, afgerond op het dichtstbijzijnde hele sample. Bij 48 kHz is die afronding hooguit tien microseconden.

Er is ook geen gedrag dat van de speler afhangt. Een ingekorte video leunt op een bewerkingsmarkering die de meeste spelers respecteren en sommige negeren; een ingekorte WAV is gewoon de samples, dus er blijft niets over waar een speler het oneens over kan zijn.

## De adder: een naad is een sprong

Dit is wat er bij het knippen van geluid echt misgaat, en de reden dat een goede knipper daar een instelling voor heeft.

Geluid is een golf. Als je midden in het ene woord knipt en meteen midden in het andere doorgaat, hebben het sample aan het eind van het eerste stuk en het sample aan het begin van het tweede geen enkele relatie: de golfvorm kan in één sample van bijna bovenin zijn bereik naar bijna onderin springen. Een luidsprekerconus die die sprong moet maken, maakt het scherpste geluid waartoe hij in staat is, en dat hoor jij als een **klik** op de naad.

Dit heeft niets met kwaliteitsverlies te maken en niets met het formaat. Het gebeurt bij een volmaakt verliesvrije knip in een volmaakt schone opname. Zo klinkt een sprong nu eenmaal. Een knipper die op het exacte sample knipt en verder niets doet, klikt bij sommige naden en bij andere niet, puur afhankelijk van waar in de golfvorm de twee uiteinden toevallig lagen.

## Wat een fade van vijf milliseconden echt doet

De oplossing is het niveau vlak voor de knip naar stilte te brengen en er vlak na weer uit, zodat er geen sprong meer te maken valt. Meer is een “fade” hier niet: een helling over een paar honderd samples aan elke rand.

De lengte is het interessante deel. Vijf milliseconden zijn ongeveer tweehonderdveertig samples bij 48 kHz. Dat is lang genoeg voor de conus om de afstand af te leggen — de klik is helemaal weg — en veel te kort om als fade gehoord te worden: vijf milliseconden is ruwweg een vijfde van de tijd die één medeklinker kost. Je zult het niveau niet zien bewegen. Je zult alleen merken dat de naad schoon is.

Langere fades worden aangeboden omdat sommig materiaal ze wil. Twintig of vijftig milliseconden is de moeite waard bij het aan elkaar zetten van muziek, waar wat onderbroken wordt een aangehouden noot is en geen lettergreep, en de kortste helling nog een hoorbare plop kan laten staan. Spraak heeft bijna nooit meer dan vijf nodig.

Een fade hoort alleen op een rand die *werkelijk* een knip is. Begint een stuk helemaal aan het begin van de opname, dan is er ervoor niets weggehaald — het bestand begon daar al voordat er iets ingekort werd — en het laten opkomen zou een bewerking zijn waar niemand om vroeg. Het hulpmiddel hier legt fades alleen waar een naad bestaat, en daarom laat niets inkorten elk sample onaangeroerd.

![De exportkaart: een menu voor bitdiepte, een fadelengte in milliseconden en een samenvatting die de delen, de lassen en de lengte telt.](https://abox.tools/screens/trim-an-audio-file/export.webp)

De fade wordt alleen bij een las toegepast, en dat is het detail dat telt: een fade aan het begin van een opname zou een verandering zijn waar niemand om vroeg.

## Een MP3 inkorten, en waarom er een WAV uit komt

Je kunt een MP3, een M4A, een Ogg of een Opus-bestand openen en inkorten. Wat terugkomt is een WAV, en het is eerlijker om de ruil die dat is te benoemen dan hem als een functie te verkopen.

Er zijn twee manieren om gecomprimeerde audio in te korten. De ene knipt de gecomprimeerde gegevens rechtstreeks en verplaatst hele gecodeerde blokken naar een nieuw bestand zonder ze te decoderen. Dat houdt het bestand klein en kost geen kwaliteit — maar een MP3-blok duurt zo'n zesentwintig milliseconden, dus elke knip wordt afgerond op de dichtstbijzijnde blokgrens, en dat is de audioversie van het keyframeprobleem. Het is bovendien werk dat aan het formaat vastzit: een MP3-lezer kort geen enkel Opus-bestand in.

De andere manier is decoderen, op het exacte sample knippen en de samples wegschrijven. Er wordt niets afgerond, elk formaat dat de browser kan afspelen werkt hetzelfde, en de fades zijn überhaupt mogelijk — je kunt geen helling leggen over een niveau dat je niet gedecodeerd hebt. De prijs is dat de samples in een of ander formaat teruggeschreven moeten worden, en geen enkele browser levert een MP3- of AAC-encoder die hier bruikbaar is. Een WAV heeft geen encoder nodig: het zijn de samples met een korte kop ervoor, dus die stap kan niets verliezen.

De praktische gevolgen: wat eruit komt is veel groter dan wat erin ging — ruwweg tien megabyte per minuut in stereo — en het is niet *beter* dan de MP3 waar het uit komt, want de compressie die al gebeurd is valt niet terug te draaien. Alles opent een WAV, en wat een MP3 nodig heeft kan er in één stap een van maken.

## Meerdere stukken tegelijk markeren

De meeste online knippers geven je één paar handgrepen en vragen welk enkele stuk je wilt houden. Voor echte opnamen beantwoordt dat de verkeerde vraag. Een uur interview heeft niet één goed stuk; het heeft er zes, verspreid, en je vindt ze door het één keer te beluisteren.

Markeer dus terwijl je luistert: `I` waar een stuk begint, `O` waar het eindigt, zo vaak als je wilt. Elk paar wordt een regel die je kunt bijstellen of verslepen, en een balk op de golfvorm. Het afgeronde bestand zijn die regels, op volgorde aan elkaar gezet.

Dezelfde lijst markeringen beantwoordt ook de omgekeerde vraag. Wil je juist de eh's, de rinkelende telefoon en de valse starts kwijt, markeer dan *die* en zet het om naar “knip deze eruit” — dan wordt alles wat je niet markeerde aan elkaar gezet. Het zijn in beide gevallen dezelfde markeringen, dus je kunt heen en weer schakelen en de eindlengte zien veranderen zonder iets twee keer te markeren.

Markeren is nauwkeurig werk, en een gesloten tabblad zou dat niet mogen kosten; daarom worden de markeringen als een gewoon tekstbestand opgeslagen en weer geladen. De indeling is die welke de [Videoknipper](https://abox.tools/nl/video-knippen/) schrijft, wat betekent dat markeringen die op een video gemaakt zijn op de eruit gehaalde audio gelegd kunnen worden, en andersom.

## Kijk naar de golfvorm

Geluid markeren door heen en weer te spoelen is gokken; het met je ogen markeren niet. Stilte ziet eruit als stilte, een kuch ziet eruit als een kuch, en de vier seconden ruimtegeluid voordat iemand begint te praten zijn meteen zichtbaar in plaats van dat je ze moet zoeken.

Dat telt het zwaarst bij de markeringen die mensen net iets fout zetten: het begin van een zin wil meestal in de stilte *vóór* de ademhaling zitten en niet erna, en het einde wil meestal nog een tel ruimtegeluid in plaats van een knip op de laatste medeklinker. Allebei zijn ze duidelijk op het plaatje en op gehoor alleen bijna niet te raken. Sleep de uiteinden van een gemarkeerd stuk langs de golfvorm om ze bij te stellen.

![Een golfvorm met twee gemarkeerde stukken, de stiltes tussen de zinnen duidelijk zichtbaar, en een tabel met het begin, het eind en de lengte van elk stuk.](https://abox.tools/screens/trim-an-audio-file/marks.webp)

De stiltes zijn waar iemand ophield met praten. Dat is wat een golfvorm het kijken waard maakt, in tegenstelling tot een stopwatch.

## Inkorten is geen faden, en het is geen bewerken

Drie woorden die door elkaar gebruikt worden. Inkorten verandert welke delen van de opname overleven. Een fade — de muzikale soort, over seconden — is een bewust effect op het niveau, en de paar milliseconden hierboven zijn dat niet; die zijn klikverwijdering, die toevallig dezelfde rekensom gebruikt.

Wil je de opname achterstevoren, sneller, langzamer zonder dat de toonhoogte meebeweegt, of luider omdat hij te zacht is opgenomen, dan is dat de [Audiobewerker](https://abox.tools/nl/audio-bewerken/). Het is dezelfde decoder en dezelfde WAV-schrijver; er zit alleen andere rekenkunde tussen.

## Waarom hier geen upload voor nodig is

Inkorten is rekenen over een rij getallen. De browser heeft de decoder al — het is dezelfde die het bestand in een `<audio>`-element afspeelt — en zodra de samples gedecodeerd zijn, is er een deel van houden en de rest laten vallen een kopie. In die beschrijving zit geen stap die een server beter zou kunnen, en de reis erheen en terug zou het traagste deel van de hele klus zijn.

Het is bovendien een bestandssoort waarbij uploaden meer kost dan mensen denken. Opnamen zijn stemmen: interviews, colleges, gesprekken, spraakberichten, therapiesessies, een kind dat iets zegt wat je wilt bewaren. Het hulpmiddel hier heeft geen enkele netwerkfunctie, en de `Content-Security-Policy` van de pagina noemt elk adres dat ze mag benaderen, en geen daarvan is van deze site.

Trek de internetverbinding eruit en kort alsnog een opname in, als je liever zelf kijkt dan het aanneemt. [Is het veilig om bestanden naar online omzetters te uploaden?](https://abox.tools/nl/gidsen/is-bestanden-uploaden-veilig/) zet nog drie van zulke controles op een rij.
