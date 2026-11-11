# Come modificare una GIF fotogramma per fotogramma

Un editor di GIF qui non c'è, e non serve: uno scompositore che smonta l'animazione in fotogrammi e un creatore che ne costruisce una dai fotogrammi sono un editor con una cartella in mezzo — e la cartella è la parte in cui la modifica la fai tu, con quello che usi già per le immagini.

Ultimo aggiornamento 26 agosto 2026

## La risposta breve

1. **Smontala.** Apri lo [Scompositore di GIF](https://abox.tools/it/dividere-gif-in-fotogrammi/) e trascina dentro la GIF. Ogni fotogramma diventa il suo PNG — come appare sullo schermo, con la trasparenza conservata — e nello ZIP c'è una lista dei tempi: i ritardi per fotogramma scritti per la ricostruzione.
2. **Modifica la cartella.** Cancella i fotogrammi che devono andarsene, ritocca in qualsiasi editor di immagini quelli che devono cambiare, rinomina per riordinare. Una cartella di PNG è un formato che tutto capisce.
3. **Rimettila insieme.** Trascina la cartella sul [Creatore di GIF](https://abox.tools/it/creare-gif/), imposta i tempi di posa — o appoggiati alla lista — scegli la tavolozza, ed esporta.

Tutti e tre i passi girano nel tuo browser. Niente viene caricato in nessun momento, e qui conta più del solito: le GIF che la gente aggiusta sono così spesso registrazioni di schermo con qualcosa di delicato mezzo visibile dentro.

## Cosa può dirti lo scompositore prima di modificare

Lo scompositore mostra, per ogni fotogramma, ritardo, posizione, misura e regola di smaltimento — e quel pannello merita un'occhiata prima di toccare qualsiasi cosa, perché spiega le due sorprese della maggior parte delle GIF.

Prima: i fotogrammi non sono tutti immagini intere. Molte GIF salvano solo i pixel cambiati, rattoppati sopra il fotogramma precedente; lo scompositore offre ogni fotogramma *come appare* o *come è salvato*, e per modificare vuoi quasi sempre *come appare*, così ogni PNG sta in piedi da solo. Seconda: i ritardi vanno per fotogramma, non in un numero solo. La pausa sulla battuta è un ritardo vero su un fotogramma vero, e la lista dei tempi è ciò che lo porta attraverso il viaggio.

Per i tagli soliti, il passo della cartella è perfino facoltativo: tenere un fotogramma ogni due o ogni cinque, o spuntare quelli da tenere, è già dentro lo scompositore — e dimezzare i fotogrammi è la cura dimagrante più efficace che una GIF possa ricevere.

![Il separatore con dodici fotogrammi numerati di un'animazione, ciascuno con il tempo per cui resta a schermo.](https://abox.tools/screens/edit-a-gif-frame-by-frame/apart.webp)

Ogni fotogramma, numerato, con il suo ritardo. Questa è la metà che ti dice cosa stai modificando prima che tu lo modifichi.

## Cosa costa la ricostruzione, con onestà

Una GIF tiene al massimo 256 colori, scelti quando viene costruita. La ricostruzione quantizza i fotogrammi di nuovo — una tavolozza condivisa, o i colori migliori per fotogramma — e su materiale fotografico quella seconda quantizzazione può vedersi. Su registrazioni di schermo e disegni, il carico solito, non si vede: non hanno mai usato 256 colori.

Le altre leve del creatore sono quelle della [guida al budget GIF](https://abox.tools/it/guide/gif-da-una-parte-di-un-video/): meno colori, il dithering di Floyd-Steinberg per le sfumature, e il comportamento del loop — per sempre, una volta, o un numero.

Per vedere se l'operazione è riuscita — e dove abitano davvero i byte — trascina il risultato sull'[Analizzatore di GIF](https://abox.tools/it/analizzare-gif/): traccia i fotogrammi contro i byte, e il fotogramma pesante è di solito una ridipintura completa che qualcuno avrebbe potuto ritagliare.

Il viaggio lo offre il creatore stesso: dopo l'esportazione, una riga sotto il suo pulsante di download porta la GIF appena fatta dritta nell'analizzatore, già caricata.

![Il creatore di GIF con sei fotogrammi in ordine, ciascuno con un campo di ritardo, e una riga per impostare tutti i ritardi in una volta.](https://abox.tools/screens/edit-a-gif-frame-by-frame/together.webp)

E il ritorno. I ritardi vanno rimessi a mano, ed è la parte del viaggio di andata e ritorno che conviene sapere prima.

## Se lo fai ogni settimana

Scomporre, cartella, ricostruire: i passi vivono su pagine separate perché ognuna fa un lavoro, e ognuna può dimostrare da sola che niente lascia la tua macchina. Ma è tutto open source: licenza MIT, una cartella per strumento, moduli ES senza dipendenze i cui README spiegano il decoder, le regole di smaltimento e il quantizzatore.

Se la chirurgia delle GIF è un'incombenza che torna, punta un agente di codice sul [repository](https://github.com/A-Box-of-Tools/website) e chiedigli di piegare la tabella dei fotogrammi dello scompositore e l'encoder del creatore in una pagina dove cancellare un fotogramma è un clic. I moduli sono scritti per essere letti, e portarseli via è esattamente ciò per cui la licenza esiste.
