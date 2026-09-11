# Zo bewerk je een GIF beeld voor beeld

Een GIF-editor is hier niet, en dat hoeft ook niet: een splitser die de animatie in beelden uiteenlegt en een maker die er een uit beelden opbouwt, zijn samen een editor met een map ertussen — en de map is het deel waarin jij bewerkt, met wat je al voor afbeeldingen gebruikt.

Laatst bijgewerkt 26 augustus 2026

## Het korte antwoord

1. **Haal hem uiteen.** Open de [GIF-splitser](https://abox.tools/nl/gif-splitsen-in-frames/) en sleep de GIF erin. Elk beeld wordt zijn eigen PNG — zoals het op het scherm verschijnt, met de transparantie bewaard — en in de ZIP zit een timinglijst: de vertraging per beeld, opgeschreven voor de heropbouw.
2. **Bewerk de map.** Gooi de beelden weg die weg moeten, retoucheer in elke afbeeldingseditor de beelden die moeten veranderen, hernoem om te herschikken. Een map PNG's is een formaat dat alles begrijpt.
3. **Zet hem weer in elkaar.** Sleep de map op de [GIF-maker](https://abox.tools/nl/gif-maken/), stel de tijden per beeld in — of leun op de lijst — kies het palet en exporteer.

Alle drie de stappen draaien in je browser. Er wordt op geen enkel moment iets geüpload, en dat telt hier zwaarder dan gewoonlijk: de GIF's die mensen herstellen zijn zó vaak schermopnames met iets gevoeligs half in beeld.

## Wat de splitser je kan vertellen vóór je bewerkt

De splitser toont per beeld de vertraging, de positie, het formaat en de verwijderingsregel — en dat paneel verdient een blik voordat je iets aanraakt, want het verklaart de twee verrassingen van de meeste GIF's.

Eén: beelden zijn niet allemaal volledige afbeeldingen. Veel GIF's slaan alleen de veranderde pixels op, gelapt over het vorige beeld; de splitser biedt elk beeld aan *zoals het verschijnt* of *zoals het is opgeslagen*, en voor bewerken wil je vrijwel altijd *zoals het verschijnt*, zodat elke PNG op zichzelf staat. Twee: de vertragingen zijn per beeld, niet één getal. De pauze op de clou is een echte vertraging op een echt beeld, en de timinglijst is wat haar door de rondreis heen draagt.

Voor de gebruikelijke knippen is de mapstap zelfs optioneel: elk tweede of vijfde beeld houden, of aanvinken welke blijven, zit al in de splitser — en de beelden halveren is de effectiefste vermageringskuur die een GIF kan krijgen.

![De splitser met twaalf genummerde frames van een animatie, elk met de tijd dat het blijft staan.](https://abox.tools/screens/edit-a-gif-frame-by-frame/apart.webp)

Elk frame, genummerd, met zijn eigen vertraging. Dit is de helft die je vertelt wat je bewerkt voordat je het bewerkt.

## Wat de heropbouw kost, eerlijk gezegd

Een GIF bevat hoogstens 256 kleuren, gekozen bij de bouw. De heropbouw kwantiseert de beelden opnieuw — één gedeeld palet, of de beste kleuren per beeld — en op fotografisch materiaal kan die tweede kwantisering zichtbaar zijn. Op schermopnames en tekenwerk, de gebruikelijke lading, is hij dat niet: die hebben nooit 256 kleuren gebruikt.

De andere hendels van de maker zijn die van de [GIF-budgetgids](https://abox.tools/nl/gidsen/gif-van-een-stuk-video/): minder kleuren, Floyd-Steinberg-dithering voor verlopen, en het loopgedrag — eeuwig, één keer, of een aantal.

Om te zien of de operatie gelukt is — en waar de bytes echt wonen — sleep het resultaat op de [GIF-analysator](https://abox.tools/nl/gif-analyseren/): die zet beelden tegen bytes uit, en het zware beeld is meestal een volledige overschildering die iemand had kunnen bijsnijden.

De maker biedt die reis zelf aan: na de export neemt een rij onder zijn downloadknop de verse GIF rechtstreeks mee naar de analysator, al geladen.

![De gif-maker met zes frames op volgorde, elk met een vertragingsveld, en een rij om alle vertragingen tegelijk te zetten.](https://abox.tools/screens/edit-a-gif-frame-by-frame/together.webp)

En weer terug. De vertragingen moeten met de hand terug, en dat is het deel van de heen-en-weer dat je van tevoren wilt weten.

## Als je dit elke week doet

Splitsen, map, heropbouwen: de stappen wonen op aparte pagina's omdat elke één klus doet, en elke in z'n eentje kan bewijzen dat niets je machine verlaat. Maar het is allemaal open source: MIT-licentie, één map per gereedschap, ES-modules zonder dependencies waarvan de README's de decoder, de verwijderingsregels en de kwantiseerder uitleggen.

Als GIF-chirurgie een terugkerend klusje is, wijs dan een code-agent naar de [repository](https://github.com/A-Box-of-Tools/website) en vraag hem de beeldtabel van de splitser en de encoder van de maker samen te vouwen tot één pagina waarin een beeld wissen één klik is. De modules zijn geschreven om gelezen te worden, en ze meenemen is precies waar de licentie voor bestaat.
