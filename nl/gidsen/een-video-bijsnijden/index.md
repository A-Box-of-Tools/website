# Hoe je een video naar een andere vorm bijsnijdt

Bijsnijden verandert de vorm van het beeld, en dus moeten er nieuwe frames geschreven worden. Daar kom je niet onderuit, en elke tool die iets anders beweert doet iets anders. Hier staat wat het kost, en hoe je het goed uitgeeft.

[Open de tool Videobijsnijder](https://abox.tools/nl/video-bijsnijden/): Snijd een filmpje terug tot het stuk waar het om gaat.

Laatst bijgewerkt 26 augustus 2026

## Het korte antwoord

Open de [Videobijsnijder](https://abox.tools/nl/video-bijsnijden/), sleep het filmpje erin, sleep het kader over het stuk dat je wilt houden, of zet het vast op een vorm als je er een opgelegd hebt gekregen, en exporteer. Het filmpje dat eruit komt is precies zo lang als dat wat erin ging, met zijn timing en zijn geluid intact.

Anders dan inkorten moet dit nieuwe frames schrijven. Dat is geen gebrek van een bepaalde tool; dat is wat bijsnijden is. De rest van deze pagina gaat over wat dat kost en hoe je het klein houdt.

## Waarom bijsnijden niet om een hercodering heen kan

Een inkorting houdt hele frames, dus een goede knipper zet ze onaangeroerd over en wordt er helemaal niets gedecodeerd. Een bijsnijding houdt een deel van elk frame, en een deel van een frame is een ander beeld. Zo'n ander beeld sla je nu eenmaal niet op zonder de pixels opnieuw weg te schrijven.

Er is een smalle uitzondering, en die is het kennen waard zodat je hem herkent wanneer iemand er een beroep op doet. Video wordt in blokken gecodeerd, en als een bijsnijding aan alle vier de kanten precies op blokgrenzen landde, zou een deel van de gegevens in principe hergebruikt kunnen worden. In de praktijk moeten de afmetingen van het frame zelf, de bewegingsvectoren en de voorspelling toch herschreven worden, dus er wordt niets echts zo gebouwd. Ga ervan uit dat een bijsnijding een hercodering betekent.

Wat een fatsoenlijke bijsnijder wél doet, is niet *meer* uitgeven dan het origineel aan datzelfde gebied uitgaf. Een bijgesneden gebied op een hogere bitsnelheid coderen dan zijn bron maakt het bestand alleen groter; het kan geen detail terugzetten dat het origineel niet had.

![De exportkaart: een formaatmenu, een kwaliteitsschuif, een schakelaar voor het geluid en een samenvatting met de uitvoergrootte, hoeveel beeld er blijft en de lengte.](https://abox.tools/screens/crop-a-video/export.webp)

Deze kaart bestaat omdat het beeld opnieuw gecodeerd moet worden. De samenvatting is de tool die zegt wat dat kost voordat hij het doet.

## De vormen waar je werkelijk om gevraagd wordt

Het meeste bijsnijden gebeurt omdat ergens een beeldverhouding vereist is. Het korte lijstje:

- **9:16, staand.** Verhalen, reels, shorts, TikTok. Schermvullend op een telefoon die normaal vastgehouden wordt. Veruit de meest voorkomende reden dat iemand überhaupt een video bijsnijdt.
- **1:1, vierkant.** Berichten in de tijdlijn op verschillende platforms. Werkt hoe de kijker zijn telefoon ook vasthoudt, en daarom blijft het bestaan.
- **4:5, licht staand.** De grootste vorm die sommige tijdlijnen toelaten, dus hij pakt meer van het scherm dan een vierkant zonder een volledig verticale video te zijn.
- **16:9, breed.** De standaard voor video in het algemeen. Je snijdt hier meestal alleen *naartoe* om zwarte balken weg te halen, of *vanaf* om een van de bovenstaande te krijgen.

Zet het kader op de verhouding vast in plaats van op het oog te slepen. Een paar pixels ernaast betekent dat het platform jouw bijsnijding bijsnijdt, en het overlegt niet met je over waar.

![De uitsnijkaart: een videobeeld met een vierkant kader in het midden, en getalvelden voor links, boven, breedte en hoogte.](https://abox.tools/screens/crop-a-video/box.webp)

Het kader sleep of typ je, en de getallen zeggen precies wat er blijft. Een vierkant uit een breedbeeldfilmpje is het meest gevraagd.

## Een liggend filmpje staand maken

Dit is het lastigste veelvoorkomende geval, en het is de moeite waard om helder te zijn dat bijsnijden een compromis is in plaats van een oplossing.

Een 16:9-video die naar 9:16 bijgesneden wordt, houdt ongeveer 32% van de beeldbreedte. Wat aan de zijkanten zit is weg, en in een liggende opname zit de context nu juist meestal aan de zijkanten. Praten er twee mensen aan weerszijden van het beeld, dan houdt geen enkele uitsnede ze allebei.

Kies de uitsnede door het filmpje één keer te bekijken en je af te vragen waar het onderwerp het grootste deel van de tijd werkelijk zit. Is het antwoord “het beweegt”, dan is een vaste uitsnede het verkeerde gereedschap en wil je een editor die de uitsnede in de tijd kan meebewegen. Is het antwoord “grotendeels in het midden”, dan is een gecentreerde uitsnede prima en kost het tien seconden.

Het alternatief dat het onthouden waard is: veel platforms accepteren een liggende video en zetten er zelf balken omheen. Bijsnijden is voor wanneer je het volle scherm wilt, niet voor wanneer je wilt dat de video geaccepteerd wordt.

## Waarom de breedte en hoogte met stappen van twee gaan

Merk je dat het bijsnijdkader oneven getallen weigert, dan is dat de codec die moeilijk doet en niet de bediening.

H.264, de codec in een mp4, slaat kleur horizontaal en verticaal op halve resolutie op, omdat het oog veel minder gevoelig is voor kleurdetail dan voor helderheid. Dat betekent dat het beeld in eenheden van twee pixels behandeld wordt en dat er geen manier is om een frame met een oneven aantal pixels op een zijde te beschrijven.

Tools gaan daarmee om door je uitsnede af te ronden nadat je hem ingesteld hebt, wat je kader zonder mededeling een pixel verschuift, of door van meet af aan alleen even getallen aan te bieden. Het tweede is wat hier gebeurt.

## Wat er met het geluid gebeurt

Op de mp4-route niets. Bijsnijden verandert het beeld en heeft geen reden om de audio aan te raken, dus de audio wordt monster voor monster overgezet zonder ooit gedecodeerd te worden, dus het is byte voor byte wat er in het bestand zat.

Op de opnameterugval, hieronder beschreven, wordt het geluid van de weergave opgevangen en opnieuw gecodeerd, wat een beetje kwaliteit kost. Hoe dan ook is er een vinkje om het er helemaal uit te laten, en dat is het gebruiken waard wanneer het filmpje ergens heen gaat waar het toch gedempt speelt en je het kleinste bestand wilt.

## Formaten, en hoe lang het duurt

**Mp4, m4v en mov** worden rechtstreeks gelezen, wat er ook in zit, of dat nu H.264, HEVC, AV1 of VP9 is, zolang je browser die codec kan decoderen. Anders dan bij inkorten moet er bij bijsnijden wél gedecodeerd worden, dus doet de codec hier ertoe op een manier die daar niet gold.

**Al het andere dat je browser kan afspelen**, WebM het meest voor de hand liggend, wordt bijgesneden door het af te spelen en het resultaat op te nemen, wat werkt en zo lang duurt als het filmpje is.

**Avi, wmv, flv en de meeste mkv's** kan de browser niet lezen en niet afspelen, en de tool weigert ze met een melding in plaats van halverwege te stranden.

Reken erop dat een bijsnijding bij een lang filmpje echte tijd kost, want elk frame wordt gedecodeerd en opnieuw gecodeerd. In de tool zit geen limiet, en het bestand wordt een paar megabyte tegelijk doorlopen in plaats van in zijn geheel geladen; het praktische plafond is de gereedgekomen video, die in het geheugen wordt opgebouwd voordat je hem downloadt.

## Snijd bij vóór je iets anders doet

Moet een filmpje zowel ingekort als bijgesneden worden, kort dan eerst in. Dat kost je niets, en elke seconde die je eraf haalt is een seconde die niemand hoeft te hercoderen. Snijd daarna het kortere filmpje één keer bij.

Andersom betekent beeldmateriaal bijsnijden dat je op het punt staat weg te gooien, en dat kost tijd en kwaliteit voor niets. De [Videoknipper](https://abox.tools/nl/video-knippen/) staat ernaast, en [de bijbehorende gids](https://abox.tools/nl/gidsen/een-video-inkorten/) legt uit waarom die stap je helemaal niets hoeft te kosten.

Algemener: elke verliesgevende stap stapelt op. Eén bijsnijding van een origineel is één generatie. Een bijsnijding van een inkorting van een export van een download is er vier, en dat zie je.

## Waarom hier niets voor geüpload hoeft te worden

Video decoderen en hercoderen in een browser is recent en het is echt: WebCodecs legt dezelfde hardware-encoder bloot die je telefoon gebruikt om video op te nemen, en het is om diezelfde reden snel. Het werk gebeurt op het apparaat dat het bestand al heeft, en bij een video van meerdere gigabytes is dat ook de enige opstelling die hout snijdt, want hem uploaden en het resultaat downloaden kost meer tijd dan het coderen zelf.

De tool hier heeft geen enkele netwerkfunctie, en de `Content-Security-Policy` van de pagina noemt elk adres dat hij mag benaderen; geen ervan hoort bij deze site. Trek de stekker uit het internet en snijd er toch een bij, als je liever controleert dan het aanneemt.

[Is het veilig om bestanden naar online omzetters te uploaden?](https://abox.tools/nl/gidsen/is-bestanden-uploaden-veilig/) zet nog drie controles op een rij die je op elke tool kunt loslaten.
