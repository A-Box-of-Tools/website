# Is het veilig om een online wachtwoordgenerator te gebruiken?

Je argwaan klopt, dus houd hem vast: een pagina die wachtwoorden maakt, is precies de pagina die ze niet mag onthouden. Het goede nieuws is dat dit controleerbaar is — willekeur ontstaat op je eigen machine, versturen is zichtbaar, en een generator die bewaart wat hij maakte, kan op heterdaad betrapt worden.

Laatst bijgewerkt 26 augustus 2026

## Het korte antwoord

De argwaan achter deze vraag is precies de juiste, dus houd hem vast. Een pagina die wachtwoorden maakt, is de ene pagina op het web die niets gevoeligs te ontvangen heeft en alles gevoeligs te *bewaren*: haar uitvoer is het geheim, en een generator die zou versturen wat hij maakt, zou geen zwak gereedschap zijn maar een wachtwoordverzameling. De vraag is nooit of een generatorpagina er betrouwbaar uitziet. De vraag is of ze het wachtwoord zou *kunnen* bewaren als ze wilde — en dat is, ongewoon genoeg, te controleren.

Drie dingen beslissen het: waar de willekeur vandaan komt, of het resultaat de pagina kan verlaten, en of iets aan het resultaat voorspelbaar is. Alle drie hebben eerlijke antwoorden die een bezoeker kan natrekken — meer dan je kunt zeggen van een gedownload programma dat genereert in een venster waar niemand in kan kijken.

## Waar browserwillekeur vandaan komt

Elke serieuze generator in een browser put uit één bron: `crypto.getRandomValues`, de cryptografische toevalsgenerator van de browser, door het besturingssysteem gevoed en bijgevoed met hardware-ruis. Het is dezelfde bron waar de browser TLS-sleutels uit haalt — de versleuteling waar je bankverbinding op draait. Er bestaat geen zinvolle betekenis waarin een desktopprogramma betere willekeur zou hebben dan een webpagina; beide eindigen bij dezelfde bron van het systeem.

Wat een pagina *niet* mag gebruiken is `Math.random()`, de huis-tuin-en-keukenfunctie om een dobbelsteen te werpen. Browsers implementeren die met een snelle generator waarvan de interne toestand te reconstrueren is uit een handvol opeenvolgende uitkomsten — wachtwoorden erop gebouwd zien er willekeurig uit en zijn berekenbaar voor iedereen die er één gezien heeft. Dit is niet theoretisch; het is meer dan eens aangetoond tegen uitgeleverde generatoren. En het is van buiten onzichtbaar, wat het sterkste argument is voor generatoren waarvan de code te lezen valt: het verschil tussen de twee functies is één woord in de bron.

Er is nog een fijnere graad van zorg. Van willekeurige 32-bitswoorden “een getal onder 26” maken met een simpele rest is héél licht scheef richting de eerste letters; een zorgvuldige generator trekt opnieuw in plaats van de rest te nemen. De [generator hier](https://abox.tools/nl/wachtwoord-generator/) doet dat — de vermeden scheefheid is ongeveer één op 165 miljoen, in het gebruik onzichtbaar en precies het soort detail dat een voor de klus gebouwd gereedschap scheidt van een van een forum geplakt knipsel.

## Wat een slechte generatorpagina zou kunnen doen

Noem de faalwijzen bij naam, want elk ervan is controleerbaar:

- **Het wachtwoord naar buiten sturen.** De pagina genereert lokaal en post dan wat ze maakte — bij de klik, met de statistieken, of later gebundeld. Dit is de diskwalificerende fout, en ze is zichtbaar: het moet een netwerkverzoek zijn, en verzoeken zijn te bekijken.
- **Op de server genereren.** Het wachtwoord komt over het netwerk aan in plaats van erover te vertrekken — de beheerder zag het dus eerst, en over hoe het gemaakt is leer je niets. Zelfde controle, andere richting.
- **Zwak genereren.** `Math.random`, een tijdstempel als kiem, een woordenlijst van een paar honderd woorden die als sterk wordt verkocht. Deze vangt geen enkel Netwerk-tabblad; alleen leesbare broncode, of een eerlijke sterkteregel die uit de echte instellingen geteld is.
- **Een geschiedenis bijhouden.** Behulpzaam je laatste twintig wachtwoorden onthouden — in opslag die het tabblad overleeft, op een machine die gedeeld kan zijn.

De [wachtwoord- en wachtzinnengenerator](https://abox.tools/nl/wachtwoord-generator/) van deze site is tegen alle vier gebouwd, door constructie: `crypto.getRandomValues` en niets anders, generatie in de pagina, geen opslag van welke soort ook, geen geschiedenis, en een sterkteregel die exact meldt hoeveel uitkomsten er met jouw instellingen mogelijk waren. De woordenlijsten voor wachtzinnen zijn de Diceware-lijsten van de EFF, ongewijzigd meegeleverd in de map van het gereedschap.

## Hoe je elke generator controleert, deze inbegrepen

De volledige methode staat in [de gids over uploaden](https://abox.tools/nl/gidsen/is-bestanden-uploaden-veilig/), en dit is de pagina om haar vóór alle andere op toe te passen:

- **Trek eerst de stekker eruit.** Laad de pagina, ga offline, genereer *dan* pas. Een wachtwoord dat zonder verbinding gemaakt is, kan niet opgehaald zijn en niet verstuurd zijn op het moment van maken. Deze pagina blijft offline werken; dat is het punt ervan.
- **Kijk naar het Netwerk-tabblad terwijl je genereert.** Druk op de knop en lees de lijst: er mag niets vertrekken. Kopieer dan het wachtwoord en kijk opnieuw — het kopiëren is het moment dat een oneerlijke pagina zou kiezen.
- **Zoek naar wat een verzameling nodig zou hebben.** Een account, een synchronisatiefunctie, een lijst “onlangs gegenereerd”. Een generator met geheugen heeft een kopie.

Eén eerlijke kanttekening hoort aan het einde. Een controle vertelt wat de pagina deed terwijl je keek; code die gepubliceerd is en leesbaar wordt uitgeleverd — zoals alles op deze site — vertelt wat ze in het algemeen doet. Blijft over: de machine zelf. Geen webpagina kan een wachtwoord beschermen tegen een gecompromitteerde browser of meelezende malware, en een generator evenmin. Wat de controles je opleveren is kleiner en echt — een wachtwoord dat geen server ooit zag, gemaakt door rekenwerk dat je mocht lezen.
