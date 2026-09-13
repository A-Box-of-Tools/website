# Come trasformare una cartella di immagini in un video

Una presentazione è una cosa semplice da fare e facilissima da dover rifare da capo, perché due delle impostazioni non vogliono dire quello che sembra. Vediamo cosa controlla ciascuna e cosa conviene scegliere.

[Apri Immagini in video](https://abox.tools/it/immagini-in-video/): Trasforma una cartella di immagini in un video.

Ultimo aggiornamento 26 agosto 2026

## La risposta corta

Apri [Immagini in video](https://abox.tools/it/immagini-in-video/), trascinaci dentro le foto, mettile in ordine, imposta quanto viene tenuta ciascuna e crea il video. Quello che ti ritrovi è un MP4 con video H.264, che si riproduce praticamente ovunque.

Le due impostazioni che più spesso costringono a un secondo giro sono la durata e la risoluzione, e conviene capirle prima del primo render invece che dopo.

## La frequenza dei fotogrammi e la durata non sono la stessa cosa

È la confusione che fa sprecare a tutti un render.

La **durata** è quanto ogni immagine resta sullo schermo, ed è l'impostazione che ti interessa davvero. Tre secondi sono un buon valore predefinito per una presentazione che qualcuno si guarda; uno o due secondi danno un ritmo svelto; oltre i cinque si trascina, a meno che non ci sia una voce sopra.

La **frequenza dei fotogrammi** è quante volte al secondo il video ripete quell'immagine. Di come si presenta la presentazione non cambia niente, visto che un'immagine ferma tenuta per tre secondi si vede identica a 24 fotogrammi al secondo e a 60, mentre cambia parecchio il peso del file e il tempo di codifica.

Quindi per una presentazione semplice scegli una frequenza bassa: 24 o 30 abbondano. L'unico motivo per salire è il movimento dentro il video, come una panoramica o uno zoom su ogni foto, o una dissolvenza incrociata tra l'una e l'altra, perché lì una frequenza bassa si vede come scatti.

![Le impostazioni di risoluzione e frequenza, con un riepilogo che conta le immagini, la durata totale, i fotogrammi e la dimensione stimata.](https://abox.tools/screens/turn-images-into-a-video/summary.webp)

Frequenza e durata sono due cose diverse, e nel riepilogo diventa evidente: cambiando l'una si muove il numero di fotogrammi, non la durata.

## La risoluzione, e le immagini della forma sbagliata

Un video ha una sola dimensione di fotogramma per tutta la sua durata. Le tue fotografie quasi certamente non ne condividono una, quindi a quelle che non ci stanno deve succedere qualcosa, e quel qualcosa è la scelta che vale la pena fare di proposito.

Comincia scegliendo la risoluzione in base a dove va il video:

- **⁦1920×1080⁩** per qualunque cosa generica. È supportato universalmente, si riproduce dappertutto, ed è quello che quasi tutti intendono per HD.
- **⁦1080×1920⁩**, cioè gli stessi numeri al contrario, per una destinazione pensata per il telefono: storie, reel, short.
- **⁦3840×2160⁩** solo se le immagini hanno davvero tutto quel dettaglio e la destinazione lo mostrerà. Sono quattro volte i pixel, quattro volte il tempo di codifica, e all'incirca quattro volte il file.

Poi decidi cosa succede a quelle che non corrispondono. Far stare ogni immagine dentro il fotogramma la tiene tutta e lascia delle bande ai lati: è la scelta prudente, ed è quella giusta quando le immagini contano più della presentazione. Riempire il fotogramma e tagliare quello che avanza viene meglio, ma a qualcuna taglierà la testa. Mescolare foto verticali e orizzontali in un solo video è il caso in cui una risposta buona non c'è, e decidere in anticipo da che parte preferisci sbagliare ti risparmia un secondo render.

## L'ordine, e la trappola dei nomi di file

Come in ogni lavoro a lotti, i nomi dei file si ordinano in un modo che non è quello in cui hai contato tu: `foto2.jpg` viene dopo `foto10.jpg` in un ordine alfabetico, perché il confronto è carattere per carattere.

Per le fotografie di un evento ordinare per data di scatto di solito è giusto, visto che le hai scattate nell'ordine in cui le cose sono successe. Trascinare le tessere è invece la strada per tutto quello in cui la storia non è cronologica. Controlla prima di renderizzare, perché il video è l'unica cosa in cui sistemare l'ordine vuol dire rifare tutto il lavoro.

![Sei immagini nell'ordine in cui scorreranno, ciascuna con un campo di durata, sopra una riga che imposta tutte le durate in una volta.](https://abox.tools/screens/turn-images-into-a-video/order.webp)

L'ordine è l'elenco, e l'elenco si trascina. Viene dall'ordine in cui le hai aggiunte, che non è quello suggerito dai nomi dei file.

## Non c'è colonna sonora, e non è un dettaglio

L'MP4 che questo strumento scrive ha una sola traccia video e nessuna traccia audio. Se la tua presentazione ha bisogno di musica o di una voce fuori campo, per quel passaggio ti servirà un programma di montaggio.

Vale la pena sapere il perché e non solo il fatto: aggiungere l'audio vuol dire decodificare un file musicale, codificarlo in AAC e intrecciarlo con il video dentro il contenitore. Tutte e tre sono lavoro vero, e farle male produce un file che perde il sincrono mentre scorre. Meglio tenerlo in lista che farlo a metà.

Una nota pratica, se poi la musica la aggiungi: scegli prima il brano e imposta la durata per immagine in modo che la presentazione esca vicina alla lunghezza della canzone. Tagliare la musica per farla stare nel video suona sempre peggio che far stare il video nella musica.

## Cosa esce, e cosa fare se non si riproduce

L'obiettivo è l'MP4 con H.264, che è la combinazione più ampiamente riproducibile che ci sia. In un browser senza WebCodecs lo strumento ripiega sulla registrazione in WebM, cioè le stesse riprese dentro un contenitore che meno programmi di montaggio e meno piattaforme social accettano.

Se ti ritrovi con un WebM e qualcosa lo rifiuta, la soluzione è un browser che supporti WebCodecs, non una conversione: le versioni attuali di Chrome, Edge e Safari lo fanno tutte. Rifare il render è meglio che convertire, perché convertire vuol dire un'altra generazione di codifica con perdita.

Nello strumento non c'è nessun limite al numero di immagini che puoi usare. Il tetto è la memoria del tuo dispositivo, perché il video finito viene assemblato lì prima che tu lo scarichi, e la prima cosa a sentirlo è una lunga presentazione in 4K.

## Alleggerire il file

Se il risultato è troppo pesante per il posto dove sta andando, ecco cosa aiuta davvero, in ordine:

**Abbassa la frequenza dei fotogrammi.** Per una presentazione di immagini ferme non costa niente di visibile, ed è il singolo risparmio più grande a disposizione.

**Abbassa la risoluzione.** 1080p invece di 4K è un quarto dei pixel, e sullo schermo di un telefono non se ne accorgerà nessuno.

**Accorciala.** Tre secondi a immagine invece di cinque sono il 40% in meno di durata e il 40% in meno di file, e di solito anche una presentazione migliore.

Rimpicciolire prima le fotografie di partenza non aiuta granché, perché il video viene comunque codificato alla risoluzione che hai scelto: una foto da 4000 pixel e una da 2000 producono quasi lo stesso numero di byte in un video 1080p. Rende però la codifica più rapida, e sposta quel tetto di memoria.

## Perché questo non ha bisogno di un server, con un'eccezione dichiarata

Codificare video era il caso più chiaro a favore del caricamento: i browser non lo sapevano fare, e un server con FFmpeg sì. WebCodecs ha cambiato le cose esponendo l'encoder hardware che il tuo dispositivo ha già, lo stesso che il tuo telefono usa per registrare video in tempo reale. Comporre i fotogrammi, invece, è un canvas. Nessuno dei due passaggi ha bisogno di altro che del tuo hardware.

Su questo strumento in particolare c'è un'eccezione, e la diciamo invece di seppellirla: la funzione facoltativa «aggiungi da un indirizzo web» recupera un'immagine da un indirizzo che incolli tu, e il server a quell'indirizzo vede il tuo IP e cosa hai chiesto. È insita nella funzione e non è un suo difetto, ed è l'unico passaggio di rete di tutto lo strumento. Se non la usi, dal tuo dispositivo non esce proprio niente.

[È sicuro caricare i propri file sui convertitori online?](https://abox.tools/it/guide/e-sicuro-caricare-i-propri-file/) propone quattro verifiche che ti diranno la stessa cosa su qualunque strumento, questo compreso.
