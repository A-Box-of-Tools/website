# Come tagliare un video senza ricodificarlo

Tagliare non cambia l'aspetto di nessun fotogramma, quindi un buon tagliavideo i fotogrammi non li tocca: li sposta in un file nuovo esattamente com'erano. Vediamo cosa ti fa guadagnare, e l'unico punto in cui la cosa si vede.

[Apri Tagliavideo](https://abox.tools/it/tagliare-video/): Segna i pezzi che vale la pena tenere mentre scorre. Te li ritrovi come un video solo.

Ultimo aggiornamento 26 agosto 2026

## La risposta corta

Apri il [tagliavideo](https://abox.tools/it/tagliare-video/), trascinaci dentro la clip, premi `I` e `O` per segnare ogni pezzo che vuoi, quanti ne vuoi, ed esporta. Su un MP4, un MOV o un M4V i fotogrammi che tieni vengono spostati nel file nuovo esattamente com'erano, con gli stessi byte e le stesse impostazioni dell'encoder, e l'audio viene copiato campione per campione senza essere decodificato.

Questo vuol dire che un taglio non ti costa niente in qualità, ed è anche veloce: tirare fuori un minuto da una registrazione di quattro gigabyte costa più o meno quanto costa scrivere quel minuto sul disco, perché i fotogrammi vengono puntati invece che caricati. L'unico punto in cui la cosa si vede è dove il tuo taglio cade davvero, ed è il resto di questa pagina.

## Perché un taglio non deve far perdere qualità

Tagliare non cambia l'aspetto di nessun fotogramma. Ogni fotogramma che tieni deve uscire identico a com'era entrato, quindi non c'è nessun motivo di decodificarlo e ricodificarlo, e ce ne sono parecchi per non farlo, visto che una ricodifica è con perdita e renderebbe tutta la clip leggermente peggiore solo per accorciarla.

Quindi un buon tagliavideo non ricodifica. Legge l'indice del file, calcola quali fotogrammi codificati cadono nel tuo intervallo, e scrive quei byte dentro un contenitore nuovo con un indice nuovo davanti. Su quella strada non viene decodificato proprio niente.

Parecchi strumenti però ricodificano lo stesso, perché decodificare e ricodificare è molto più semplice da realizzare che analizzare il formato del contenitore. Di solito riconosci quale dei due stai usando dal tempo che ci mette: una copia è limitata da quanto in fretta scrive il tuo disco, una ricodifica da quanto in fretta il tuo dispositivo codifica video, che è cento volte più lento.

## I fotogrammi chiave, e perché il tuo taglio può cadere prima

Ecco il vincolo da cui discende tutto quello che riguarda il tagliare.

Il video non è conservato come una sequenza di immagini complete, perché sarebbe enorme. Quasi tutti i fotogrammi sono conservati come una descrizione di quanto differiscono dai vicini, il che vuol dire che da soli non si possono decodificare: servono i fotogrammi attorno. Solo un **fotogramma chiave** sta in piedi da solo come immagine completa, e i fotogrammi chiave di solito distano da uno a dieci secondi.

Quindi se segni un taglio due secondi dopo l'ultimo fotogramma chiave, un tagliavideo che copia i fotogrammi lì non può cominciare: i fotogrammi in corrispondenza del tuo segno sono illeggibili senza la serie che ci porta. Deve per forza portarsi dietro tutto il tratto a partire dal fotogramma chiave che precede il tuo segno.

La parte interessante è cosa ne fa. Il formato del file ha un modo standard per dire *comincia a riprodurre da questo punto*: i fotogrammi in più restano nel file, ma il contenitore ordina al lettore di saltarli. Ogni lettore diffuso lo rispetta, e la clip comincia esattamente dove hai detto tu. Un lettore che invece lo ignora comincerà prima, fino a un intervallo tra fotogrammi chiave.

Lo strumento di qui ti dice in quale dei due casi ti trovi, e di quanto, prima che tu esporti, così è una decisione e non una sorpresa.

## Quando accettare una ricodifica

Il taglio esatto c'è, e funziona ricodificando il tratto iniziale: decodifica dal fotogramma chiave e riscrive una nuova serie di fotogrammi che comincia davvero dove avevi segnato. È più lento e costa un po' di qualità, ma solo su quel tratto iniziale.

Scegli quello quando la clip va in un posto che non rispetterà l'ordine del contenitore, o dove il lettore non lo controlli tu: certi programmi di montaggio, certi sistemi di trasmissione e videoconferenza, certi lettori hardware vecchi. Per tutto il resto, che è quasi tutto, scegli la copia: un browser, un telefono, una piattaforma social, un lettore multimediale.

C'è poi una terza possibilità che non costa niente: sposta il tuo segno. Se lo strumento ti mostra dove sono i fotogrammi chiave, portare il taglio sul più vicino ti dà un taglio esatto senza nessuna ricodifica. Raramente vale la pena rinunciare a una copia per un secondo di differenza.

![La scheda di esportazione: il metodo, un cursore di qualità, un interruttore per l'audio e un riepilogo che conta i pezzi, la durata e la dimensione.](https://abox.tools/screens/trim-a-video/summary.webp)

È nel riepilogo che si prende la decisione di questa sezione: quanto costerà la copia, e quanto costerebbe invece ricodificare.

## Togliere un pezzo in mezzo

Togliere un pezzo è un'operazione diversa dal tenerne uno, e vale la pena sapere che qui è prevista, perché parecchi tagliavideo fanno solo la seconda. Segna la parte che non vuoi, scegli di toglierla, e quello che resta ai due lati viene unito in una clip sola, con l'audio portato dall'altra parte in sincrono.

Nel punto in cui riprende la seconda metà, la giunzione ha lo stesso vincolo dei fotogrammi chiave, per lo stesso motivo. Qui funziona su tutte e due le strade dell'MP4. È l'unica cosa che il ripiego della registrazione qui sotto non sa fare, perché una registrazione si fa in un passaggio solo da una sola testina.

![La linea del tempo con due segmenti marcati, e sotto una tabella con inizio, fine e durata di ciascuno e il totale conservato.](https://abox.tools/screens/trim-a-video/marks.webp)

Due pezzi tenuti da una sola clip. La tabella si modifica, quindi un segno caduto un quinto di secondo tardi si scrive invece di rimarcarlo.

## I formati, e il ripiego

**MP4, M4V e MOV** vengono letti direttamente, qualunque codec ci sia dentro: H.264, HEVC, AV1, VP9. Copiare i fotogrammi non comporta decodificarli, quindi questa strada funziona anche per un codec per cui il tuo browser non ha proprio nessun decodificatore, che è una piacevole conseguenza del non guardare le immagini.

**Tutto il resto che il tuo browser sa riprodurre**, il WebM in primis, viene tagliato riproducendolo e registrando il risultato. Funziona, e ha due costi: richiede tanto tempo quanto è lungo il pezzo, e l'immagine e il suono vengono ricodificati.

**AVI, WMV, FLV e quasi tutti gli MKV** il browser non li sa né leggere né riprodurre, e lo strumento te lo dice invece di piantarsi a metà strada. Convertili prima in MP4 con qualcosa che li gestisca.

## Due cose che altrove vanno storte in silenzio

**La rotazione.** Un telefono filma in orizzontale e nel file scrive un'istruzione di rotazione invece di girare i pixel. Un tagliavideo che copia i fotogrammi deve portarsi dietro quell'istruzione, altrimenti la tua clip verticale esce di traverso, che è poi il modo classico in cui un video tagliato viene rovinato. La strada esatta di qui gira i fotogrammi mentre li ricodifica, e scrive un file che di rotazioni non ha bisogno.

**Il sincrono dell'audio.** Audio e video sono conservati come flussi separati con tempi propri, e non vengono tagliati negli stessi punti. Se al taglio i due non vengono allineati di proposito, il suono slitta. Sulla strada della copia di qui l'audio viene copiato campione per campione senza essere decodificato, quindi è byte per byte quello che c'era nel file, e un segno di montaggio lo tiene in sincrono con l'immagine entro un millesimo di secondo.

## Tagliare non è ritagliare

Sono due parole che vengono usate una per l'altra. Tagliare cambia la durata della clip; ritagliare cambia la forma dell'immagine. Se quello che vuoi è una versione quadrata di un video orizzontale, o le bande nere via dai lati, ti serve il [ritagliatore di video](https://abox.tools/it/ritagliare-video/), che a differenza del tagliare deve ricodificare, per il motivo che spiega [la sua guida](https://abox.tools/it/guide/ritagliare-un-video/).

## Perché questo non ha bisogno di un caricamento, e questo in particolare

Il video è il tipo di file per cui più di ogni altro ci si aspetta di dover caricare qualcosa, perché i file sono pesanti e il lavoro suona gravoso. Tagliare è il caso in cui è meno vero, perché sulla strada della copia il file viene letto a malapena: lo strumento percorre l'indice, calcola quali intervalli di byte tenere, e li riscrive. Caricare un file da quattro gigabyte su un server perché possa fare questo sarebbe il modo più lento possibile di organizzare la cosa.

Ed è anche il tipo di file in cui caricare costa di più, se preferiresti non farlo: un video porta con sé volti, voci, case e luoghi in un modo in cui un documento non lo fa. Lo strumento di qui non ha nessuna funzione di rete, e la `Content-Security-Policy` della pagina elenca tutti gli indirizzi che può contattare, nessuno dei quali appartiene a questo sito.

Se preferisci verificare invece che crederci, stacca la connessione e taglia una clip lo stesso. [È sicuro caricare i propri file sui convertitori online?](https://abox.tools/it/guide/e-sicuro-caricare-i-propri-file/) propone altre tre verifiche come questa.
