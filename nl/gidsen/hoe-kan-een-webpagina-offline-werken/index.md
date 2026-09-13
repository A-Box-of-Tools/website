# Hoe kan een webpagina werken zonder wifi?

Omdat de browser een complete kopie bewaarde, en een klein programma dat met de pagina meekomt die kopie serveert wanneer het netwerk het niet kan. De machinerie is standaard en het begrijpen waard, want een tool die losgekoppeld doorwerkt, laat je iets zien dat geen enkel privacybeleid kan laten zien.

Laatst bijgewerkt 26 augustus 2026

## Het korte antwoord

Een webpagina leeft en sterft normaal met haar verbinding, omdat elk bezoek haar opnieuw ophaalt. Maar een pagina kan een klein programma meebrengen, een *service worker*, die de browser naast de pagina installeert en de baas maakt over haar netwerkverkeer. Bij het eerste bezoek bergt die worker een complete kopie op van alles waar de pagina uit bestaat — opmaak, stijlen, scripts — in een cache op je machine. Vanaf dan worden verzoeken uit die kopie beantwoord. Als de wifi sterft, verandert er niets, want er werd toch al niets opgehaald.

Er zit geen magie en geen speciale toestemming in dit alles: het is standaard browsermachinerie, al zo'n tien jaar aan boord van elke grote browser. Wat ongewoon is, is een site die er zo zwaar op leunt als deze — want voor een site waarvan de hele belofte is dat je bestanden nooit vertrekken, is offline geen gemak. Het is het bewijs.

## Wat het overleven van de stekkertruc bewijst

De sterkste controle uit de uploadgids is [de stekker eruit](https://abox.tools/nl/gidsen/is-bestanden-uploaden-veilig/): tool laden, verbinding verbreken, gebruiken. Het loont om precies te zijn over waarom dat werkt. Een tool die je bestand op een server converteert, heeft het netwerk nodig op exact het moment van het werk — knip de draad door en het werk stopt. Een tool die doorgaat, heeft aangetoond, niet beweerd, dat het werk op jouw machine gebeurt; en een pagina die het netwerk niet kan bereiken, kan je bestand nergens heen sturen, wat haar code ook zou willen.

Geen privacybeleid kan dat bieden. Een beleid beschrijft bedoelingen en kan veranderen; een pagina die haar werk doet in vliegtuigmodus is natuurkunde. Daarom werkt elke tool op deze site offline en draagt hij een live-indicator die zegt of je dat op dit moment bent — zodat je hem kunt zien omslaan terwijl je de verbinding uitzet, en de sterkste controle die er is in een seconde of tien kunt draaien.

## Hoe de kopie eerlijk blijft

Twee vragen beslissen of voor-altijd-bewaard een geschenk of een val is, en de machinerie beantwoordt ze allebei:

- **Veroudert de kopie?** De worker kijkt naar een nieuwere versie wanneer er verbinding is en wisselt haar in haar geheel in. Versies gaan in hun geheel omdat de kopie altijd samenhangend moet zijn — half oud, half nieuw is de ene toestand die nooit geserveerd mag worden.
- **Wat is er precies gekopieerd?** Alles wat de pagina nodig heeft en niets anders — en elke tool hier bewaart zijn kopie in zijn eigen vak. De cache van een tool bevat die tool; er één installeren installeert er niet stilletjes tien. De kopie is bovendien te inspecteren: de ontwikkelaarstools van je browser sommen elk gecachet bestand op, en die lijst is dezelfde die de pagina in het openbaar ophaalde.

Het resultaat is een pagina die zich gedraagt als een applicatie die je toevallig installeerde door haar te bezoeken — wat ook letterlijk in de aanbieding is: de adresbalk van de browser installeert elke tool hier als app, met het eigen pictogram van de tool, rechtstreeks openend in de tool, zonder knop op de pagina en zonder vragend script. Dezelfde machinerie, verkleed als snelkoppeling.

## Wat offline niet bewijst

De controle is sterk, niet magisch, en haar grenzen verdienen dezelfde duidelijkheid als haar kracht:

- **Ze bewijst het moment, niet de toekomst.** Werk dat offline gedaan is, bleef op je machine, punt. Een pagina zou in principe gegevens kunnen vasthouden en versturen zodra de verbinding terugkeert — sluit voor de gevoeligste bestanden dus het tabblad voordat je opnieuw verbindt, of controleer ook de andere richting: kijk naar het Netwerk-tabblad terwijl de verbinding terugkomt.
- **Ze bewijst deze pagina, niet de site.** Elke pagina antwoordt voor zichzelf. De ene hier die het netwerk gebruikt, zegt het op haar eigen pagina: de tool om [tekst te delen](https://abox.tools/nl/tekst-delen/), wiens hele vak het verplaatsen van iets tussen twee apparaten is, en die precies uitlegt wat zijn ene verbinding draagt.
- **Het verbergt je niet.** De pagina laden heeft de site je adres al verteld, zoals elke paginalading op het web. Offline gaat over waar je bestanden heengaan, niet over anonimiteit.

Die grenzen zijn waarom de uploadgids vier controles leert in plaats van één — het Netwerk-tabblad, het veiligheidsbeleid in de broncode van de pagina en de leesbare code dekken wat de stekkertruc niet kan. Maar als eerste filter is er geen snellere: kan een tool zijn werk niet doen zonder netwerk, dan heb je geleerd waar het werk gebeurt, en is verder lezen overbodig.
