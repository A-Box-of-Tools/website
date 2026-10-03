# Een video achteruit afspelen

Een clip achterstevoren afspelen klinkt als de simpelste bewerking die er is, en het is degene waar een videobestand het slechtst op gebouwd is. Dit is wat er werkelijk moet gebeuren, wat het kost, en die ene stap die je er beter vóór kunt zetten.

[Open de tool Video-omkeerder](https://abox.tools/nl/video-achteruit-afspelen/): Laatste frame eerst, geluid en al.

Laatst bijgewerkt 26 augustus 2026

## Het korte antwoord

Open de [Video-omkeerder](https://abox.tools/nl/video-achteruit-afspelen/), sleep de clip erin, beslis of je het geluid ook omgekeerd wilt, en exporteer. Wat eruit komt is dezelfde clip met zijn laatste frame eerst, precies even lang als de clip die erin ging.

Anders dan bij inkorten moet hier elk frame opnieuw geschreven worden, en het geluid ook. Dat is geen tekortkoming van een bepaalde tool; dat is wat omkeren is. De rest van deze pagina gaat over het waarom, en over wat het betekent voor hoe lang je zit te wachten.

## Waarom een video niet gewoon achteruit afgespeeld kan worden

Een videobestand is geen stapel foto's. Ongeveer één op de vijftig frames is een heel plaatje — een *keyframe* — en alles ertussen is een beschrijving van wat er veranderde ten opzichte van de frames eromheen. Daarom past een uur video op een telefoon.

Het betekent ook dat een decoder alleen vooruit kan. Om je het laatste frame van een clip te laten zien moet hij het keyframe ervoor opzoeken en alles ertussen decoderen. Vraag om het een-na-laatste en hij doet datzelfde werk opnieuw.

Omkeren gaat daarom per groep: een groep vooruit decoderen, de frames vasthouden, ze in de andere volgorde aan de encoder geven, door naar de groep ervoor. Het voor de hand liggende alternatief — de hele clip in een lijst decoderen en die lijst achterstevoren doorlopen — heeft ongeveer 3 MB geheugen per 1080p-frame nodig, oftewel 5 GB per minuut, en daarom vallen tools die het zo doen om bij alles wat langer duurt dan een paar seconden.

![De bronkaart: de naam van het filmpje, de grootte, de beeldgrootte, de lengte en de codec.](https://abox.tools/screens/reverse-a-video/source.webp)

Wat de tool over het bestand heeft uitgezocht. Omkeren is de enige bewerking die niet gaandeweg kan, dus deze cijfers bepalen of het in het geheugen past.

## Wat er met het geluid gebeurt

Hier lopen omkeertools het meest uiteen, en hier is het de moeite waard om te controleren wat je werkelijk gekregen hebt.

Geluid wordt gecomprimeerd in pakketjes van een paar tientallen milliseconden, elk gecodeerd tegen het vorige. Die pakketjes achterstevoren wegschrijven speelt een spoor *niet* achteruit: het speelt korte stukjes vooruit in de verkeerde volgorde, en dat klinkt als gestotter of een defect, niet als een omkering. De enige manier om geluid netjes om te keren is het hele spoor decoderen, de samples in de andere volgorde zetten en het opnieuw coderen.

Dat is wat hier gebeurt, en daarom wordt het geluid hier hercodeerd terwijl de [Videoknipper](https://abox.tools/nl/video-knippen/) en de [Videobijsnijder](https://abox.tools/nl/video-bijsnijden/) er nooit aan komen: die klussen veranderen niet *wanneer* er iets gebeurt, en deze verandert niets anders.

Wil je het beeld achterstevoren en helemaal geen geluid — de gebruikelijke keuze voor alles wat naar een feed gaat die zonder geluid afspeelt — zet het vinkje dan uit. Het gaat sneller en het bestand wordt kleiner.

![De exportkaart: een kwaliteitsschuif, een schakelaar voor het geluid en een samenvatting met de uitvoergrootte, de lengte en het aantal frames.](https://abox.tools/screens/reverse-a-video/export.webp)

De geluidsschakelaar staat er omdat achterstevoren gesproken tekst bijna nooit is wat iemand wilde, en het makkelijker beslist voor de export dan erna.

## Wat het het beeld kost

Eén hercodering. De frames komen in een volgorde naar buiten waar niets in het oorspronkelijke bestand voor gecodeerd was, dus elk frame moet opnieuw geschreven worden.

Wat een fatsoenlijke tool níét doet, is *meer* uitgeven dan het origineel. Een omgekeerde clip bevat precies dezelfde beelden als de clip die binnenkwam, dus een hogere bitrate heeft niets nieuws te beschrijven: hij maakt het bestand groter zonder dat het er beter uitziet. De kwaliteitsinstelling hier beweegt binnen dat plafond in plaats van erboven.

Zoals altijd stapelen stappen met verlies zich op. Een origineel omkeren is één generatie. De export van een download van een schermopname omkeren is er vier, en dat zie je.

## Eerst knippen, dan omkeren

Heeft de clip allebei nodig, knip hem dan eerst. Knippen is gratis — een goede knipper schuift hele frames door zonder ze te decoderen — en elke seconde die je weghaalt is een seconde die niemand opnieuw hoeft te decoderen en te coderen.

Andersom keer je beeld om dat je zo meteen weggooit. Bij een lange clip is dat het verschil tussen een klus van een paar seconden en een van minuten. De [gids over inkorten](https://abox.tools/nl/gidsen/een-video-inkorten/) legt uit waarom die eerste stap je helemaal geen kwaliteit hoeft te kosten.

Dezelfde volgorde geldt voor bijsnijden: knippen, bijsnijden, omkeren, en je betaalt één hercodering van de kortst mogelijke clip.

## Waar mensen het echt voor gebruiken

- **De terugspoelgrap.** Er valt iets, breekt iets of spat er iets, en omkeren zet het weer terug. Het leest als een grap omdat echt beeld achterstevoren onmiskenbaar is: rook trekt samen, water klimt omhoog.
- **Zelfgemaakte boomerangs.** Keer een korte clip om en plak hem met de [Videoknipper](https://abox.tools/nl/video-knippen/) aan het origineel; je krijgt de heen-en-weerlus zonder de app die hem meestal maakt, en op jouw lengte in plaats van die van de app.
- **Onthullingen.** Film de opgeruimde eindtoestand en keer hem om, zodat een afgemaakt bord weer ingrediënten wordt of iets in elkaar gezets uit elkaar valt. Makkelijker te filmen dan de versie vooruit, en dat is precies het punt.
- **Achterstevoren spraak.** Wat alleen interessant is als het geluid écht omgekeerd is — zie hierboven.

## Formaten, en hoe lang het duurt

**MP4, M4V en MOV** worden rechtstreeks gelezen, wat er ook in zit — H.264, HEVC, AV1 of VP9 — zolang je browser die codec kan decoderen. Dit is de snelle route: het bestand wordt groep frames voor groep frames achterstevoren doorlopen, zo snel als je machine gaat.

**Al het andere dat je browser kan afspelen**, WebM voorop, wordt omgekeerd door de eigen speler van de browser achterstevoren door de clip te stappen, moment voor moment. Het werkt, en het is trager, omdat elk van die stappen de browser dwingt om vanaf het keyframe ervoor te decoderen. De pagina zegt welke van de twee routes ze neemt, en waarom, voordat je begint.

**AVI, WMV, FLV en de meeste MKV's** kan de browser niet lezen en niet afspelen, en de tool weigert ze met een bericht in plaats van halverwege te stranden.

Hoe dan ook is dit een van de tragere klussen op deze site, want elk frame wordt gedecodeerd en gecodeerd en sommige frames worden meer dan eens gedecodeerd. Een korte clip is seconden; een lange in 4K is er een om te starten en dan met rust te laten.

## Waarom dit geen upload nodig heeft

Video decoderen en hercoderen in een browser is nieuw en het is echt: WebCodecs geeft toegang tot dezelfde hardware-encoder die je telefoon gebruikt om video op te nemen, en hij is om dezelfde reden snel. Het werk gebeurt op de machine die het bestand al heeft, wat voor een grote video sowieso de enige zinnige indeling is: hem uploaden en het resultaat terugdownloaden kost meer tijd dan het coderen zelf.

De tool hier heeft geen enkele netwerkfunctie, en de `Content-Security-Policy` van de pagina noemt elk adres dat ze mag benaderen, waarvan er geen enkele van ons is. Trek de stekker uit je internet en keer alsnog een clip om als je het liever controleert dan aanneemt.

[Is het veilig om bestanden naar online-omzetters te uploaden?](https://abox.tools/nl/gidsen/is-bestanden-uploaden-veilig/) zet nog drie controles op een rij die je op elke tool kunt loslaten.
