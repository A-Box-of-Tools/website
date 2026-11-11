# Come impilare fotografie per ridurre il rumore, o togliere le persone

Una raffica di fotogrammi contiene più informazione di qualsiasi singolo fotogramma. Farne la media annulla il rumore; prendere il valore centrale di ogni pixel cancella tutto quello che c'era solo una parte del tempo. Quale dei due ti serve dipende interamente da che cosa si è mosso.

[Apri Impilatore di immagini](https://abox.tools/it/impilare-immagini/): Venti fotogrammi in uno, senza venti caricamenti e senza un convertitore RAW.

Ultimo aggiornamento 26 agosto 2026

## La risposta breve

Apri l'[Impilatore di immagini](https://abox.tools/it/impilare-immagini/), trascinaci dentro tutta la raffica, e scegli il metodo in base a quello di cui stai cercando di liberarti:

- **Rumore**, e non si è mosso niente — media.
- **Rumore**, e qualcosa si è mosso — sigma clipping.
- **Persone, macchine, un aereo** — mediana.
- **Un cielo scuro che vuoi come scie stellari** — schiarisci.
- **Una macro con quasi nessuna profondità di campo** — focus stacking.

Lascia acceso l'allineamento se la fotocamera era nelle tue mani e spegnilo se stava su un treppiede. I file RAW possono entrare direttamente; non c'è bisogno di svilupparli prima.

Tutto quello che segue spiega perché quelle cinque righe sono così.

## Perché una raffica contiene più di un fotogramma solo

Una fotografia scattata con poca luce è l'immagine più il rumore, e il rumore è diverso ogni volta. È quest'ultima parte che fa funzionare l'impilamento. Scatta la stessa inquadratura sedici volte e l'immagine è identica in tutte e sedici mentre il rumore no, quindi farne la media lascia l'immagine e annulla quasi tutto il rumore.

Il miglioramento è la radice quadrata del numero di fotogrammi. Quattro fotogrammi dimezzano il rumore. Sedici lo riducono a un quarto. Cento lo tagliano di dieci volte. È una curva brutale su cui stare — passare da sedici a sessantaquattro fotogrammi ti compra di nuovo lo stesso miglioramento, per quattro volte gli scatti — ed è per questo che quasi ogni pila pratica sta tra gli otto e i trenta fotogrammi.

C'è un secondo guadagno, più silenzioso. Fare la media di sedici fotogrammi a otto bit dà un risultato con gradazioni più fini di quelle che aveva ognuno di loro, perché è proprio il rumore che faceva arrotondare ogni fotogramma in modo diverso a permettere alla media di cadere tra un livello e l'altro. Impilare una serie rumorosa non toglie soltanto il rumore: recupera del tono che un singolo fotogramma aveva quantizzato via.

## La domanda che sceglie il metodo

Non «che cosa voglio tenere» ma **che cosa era diverso da un fotogramma all'altro**. Tutto il resto viene di conseguenza.

### Non si è mosso niente: media

La media semplice. È la riduzione del rumore più efficace disponibile su una serie in cui l'unica differenza tra i fotogrammi è il rumore, ed è la più facile da rovinare: un fotogramma con dentro un uccello mette un uccello sbiadito su tutta la pila, perché una media non ha nessuna opinione su un valore che non va d'accordo con gli altri. Lo include e basta.

### Qualcosa ha attraversato l'inquadratura: mediana

Allinea una dozzina di fotografie di una piazza affollata e guarda un pixel. Nella maggior parte è pavimentazione; in una o due è il cappotto di qualcuno. Ordina quei dodici valori, prendi quello centrale e ottieni pavimentazione, perché il cappotto non è mai stato in maggioranza.

Fallo per ogni pixel e la piazza viene fuori vuota. È il trucco dietro ogni articolo del tipo «togli i turisti dalla tua foto delle vacanze», e non ha bisogno di niente di più ingegnoso di una raffica e di pazienza. L'unica cosa che pretende è che **nessuna parte della scena sia occupata per più di metà del tempo**. Una persona ferma in otto dei tuoi dodici fotogrammi è la maggioranza su quei pixel, e la mediana se la tiene.

### Tutte e due le cose: sigma clipping

La mediana butta via quasi tutta l'informazione per ottenere la sua robustezza — undici dei tuoi dodici valori vengono scartati a ogni pixel, quindi riduce il rumore molto meno di quanto farebbe una media della stessa serie.

Il sigma clipping è il compromesso, ed è di solito la scelta predefinita giusta per qualsiasi serie del mondo reale. Guarda ogni pixel attraverso tutti i fotogrammi, ricava che cosa di solito è e quanto varia, e poi fa la media solo dei valori che vanno d'accordo con quello. Una macchina che ha attraversato un fotogramma viene esclusa da quei pixel; ogni altro fotogramma continua a contare dappertutto. Ottieni l'immunità della mediana alle cose che si sono mosse e quasi tutta la riduzione del rumore della media.

La soglia è in deviazioni standard, e due è il punto di partenza solito. Più bassa rifiuta di più, e comincia a rifiutare dettaglio vero insieme alla macchina.

### Contano solo le cose luminose: schiarisci

Tieni il valore più chiaro che ogni pixel abbia mai avuto. Fotografa il cielo notturno come duecento esposizioni da trenta secondi e schiariscile insieme, e ogni stella disegna il suo arco sul risultato — una scia stellare, montata a partire da esposizioni brevi che singolarmente non hanno mai bruciato. Lo stesso metodo rimette insieme un fuoco d'artificio dai fotogrammi della sua stessa esplosione, e un light painting da un giro per una stanza buia con una torcia.

Il suo contrario, scurisci, è quello silenzioso della coppia: un pixel resta chiaro solo se era chiaro in *ogni* fotogramma, quindi i riflessi in una finestra, i fari di passaggio e le gocce di pioggia illuminate da un flash spariscono tutti.

### Il soggetto è più profondo della messa a fuoco: focus stacking

Una macro a f/8 ha forse un millimetro a fuoco, che per un insetto non basta. La risposta è scattare venti fotogrammi lungo la ghiera di messa a fuoco e tenere, di ognuno, solo la parte che in quel fotogramma era nitida. Lo strumento misura quanto ogni pixel differisce dai suoi vicini — molto su un bordo, quasi zero su una sfocatura — e prende il vincitore.

Questo metodo vuole un treppiede più di tutti gli altri, perché spostare la ghiera di messa a fuoco a mano sposta la fotocamera, e un fotogramma scattato da un pochino più lontano non è la stessa immagine a una messa a fuoco diversa.

![L'elenco delle modalità, media, mediana, più chiaro, più scuro, con sotto un piano che dà la dimensione in uscita, la memoria necessaria e quanto va letto di ciascun file.](https://abox.tools/screens/stack-photos-to-reduce-noise/plan.webp)

La modalità è la domanda di questa sezione. Il piano sotto è lo strumento che dice quanto costerà la passata prima di avviarla.

## Allineare i fotogrammi

Impilare è aritmetica pixel per pixel, quindi dà per scontato che un certo pixel sia la stessa parte della scena in ogni fotogramma. A mano libera non lo è: una raffica deriva di decine di pixel, e farne la media produce una sfocatura invece di un'immagine pulita. È il singolo motivo più comune per cui un primo tentativo di impilamento delude.

Quindi i fotogrammi vengono prima misurati rispetto a uno di loro e rimessi al loro posto, con la precisione di una frazione di pixel. Tre impostazioni:

- **Solo traslazione** va bene per quasi tutto quello che è fatto a mano libera. Corregge la deriva e il tremolio.
- **Traslazione, rotazione e scala** per una serie in cui stavi anche ruotando leggermente, o in cui uno zoom è strisciato. Costa una misurazione in più per fotogramma e non costa proprio niente quando i fotogrammi risultano dritti.
- **Nessuno** per un treppiede bloccato o una sequenza da intervallometro, dove i fotogrammi sono già allineati e misurarli è tempo sprecato.

Quello che nessun allineamento può sistemare è un soggetto che si è mosso invece di una fotocamera che si è mossa, e non può sistemare nemmeno una fotografia scattata un passo più a sinistra. Spostarsi di lato cambia di quanto le cose vicine si spostano rispetto a quelle lontane, e nessuna correzione unica descrive tutte e due insieme. Ruotare sul posto va bene; camminare no.

![Il risultato: l'immagine impilata, con una nota su quanto ogni fotogramma è stato spostato per allinearsi al primo.](https://abox.tools/screens/stack-photos-to-reduce-noise/result.webp)

I numeri dell'allineamento meritano una lettura. Una raffica a mano libera si sposta di qualche pixel per fotogramma, ed è quello che l'allineatore disfa senza dire niente.

## Dove si inseriscono i file RAW

Puoi trascinare dentro direttamente CR2, CR3, NEF, ARW, DNG, RAF, RW2, ORF e gli altri, e vale la pena essere precisi su che cosa succede loro, perché non è quello che fa un convertitore RAW.

Ogni file RAW contiene già un **JPEG a piena risoluzione che la fotocamera ha prodotto nel momento dello scatto**. È quello che ti mostra il retro della fotocamera ed è quello che il tuo sistema operativo disegna come miniatura. L'impilatore trova quell'immagine e usa quella. Non decodifica i dati del sensore.

Due conseguenze, una buona e una che vale la pena sapere:

- **È veloce.** Trovare l'anteprima vuol dire leggere qualche kilobyte di directory e poi una fetta, quindi un fotogramma da 60 MB si apre più o meno alla velocità di un JPEG. Venti si aprono nel tempo che un convertitore RAW spenderebbe su uno. La pagina ti mostra quanto poco dei tuoi file ha davvero letto.
- **È la resa della fotocamera, non la tua.** Otto bit per canale, con il bilanciamento del bianco e lo stile immagine su cui la fotocamera era impostata — non i dodici o quattordici bit di dati lineari del sensore che ti darebbe un convertitore.

Per la riduzione del rumore, le scie stellari, il togliere i passanti e il focus stacking, quel baratto conviene quasi sempre: le anteprime sono a piena risoluzione e sono quello che avresti ottenuto comunque come JPEG. Se stai tirando su le ombre con forza, o stai impilando per astrofotografia dove l'ultimo pezzo di gamma dinamica è tutto il punto, sviluppa prima i fotogrammi in un convertitore RAW e impila i TIFF o i JPEG che ti dà. Quelli entrano allo stesso modo.

## Quanto costa farlo girare

Vale la pena saperlo perché è la differenza tra una pila che prende otto secondi e una che ne prende due minuti.

Sei metodi su sette hanno bisogno di ricordare una cosa sola. Un massimo corrente non si cura dei fotogrammi che ha già visto, e nemmeno un totale corrente, quindi quei metodi leggono ogni fotogramma esattamente una volta e usano la stessa memoria per cento fotogrammi che per due.

La mediana non può lavorare così, perché non puoi sapere il valore centrale di un insieme finché non lo hai tutto. Venti fotogrammi da 24 megapixel sono circa 1,4 GB di pixel tenuti insieme, che nessun browser ti concede, quindi l'immagine viene tagliata in bande orizzontali e impilata una banda per volta — corretto, e più lento, perché i fotogrammi vengono riletti per ogni banda.

Lo strumento calcola tutto questo prima che tu prema il pulsante e te lo dice: quanto sarà grande il risultato, più o meno quanta memoria serve, e quante volte i tuoi fotogrammi verranno decodificati. Se dice che l'esecuzione sarà a bande, abbassare di un passo la risoluzione di lavoro divide per quattro la memoria e quasi sempre la riporta a un passaggio unico — e se stai impilando per togliere il rumore, la mezza risoluzione sarebbe comunque venuta più pulita della piena.

## Scattare pensando all'impilamento

Quasi tutta la qualità di una pila viene decisa prima che qualsiasi software la veda.

- **Scatta più fotogrammi di quanti pensi ti servano.** La curva della radice quadrata è spietata all'inizio e clemente alla fine: passare da quattro a nove fotogrammi è un cambiamento visibile più grande che passare da venti a quaranta.
- **Non cambiare l'esposizione tra un fotogramma e l'altro.** L'impilamento dà per scontato che i fotogrammi siano della stessa scena alla stessa luminosità. Blocca l'esposizione, o lo strumento starà facendo la media di due immagini diverse.
- **Per togliere le persone, aspetta tra un fotogramma e l'altro.** Una raffica scattata in due secondi becca la stessa persona nello stesso posto in ogni fotogramma, e la mediana se la tiene. Dieci fotogrammi a qualche secondo di distanza funzionano molto meglio di cinquanta in raffica.
- **Per le scie stellari, tieni corte le pause.** Schiarisci disegna esattamente quello che i fotogrammi hanno registrato, quindi una pausa tra un'esposizione e l'altra diventa un trattino visibile in ogni scia.

## Niente di tutto questo esce dalla tua macchina

Una pila di venti fotogrammi RAW è circa un gigabyte di fotografie, che sono parecchie da consegnare a un sito web per farne fare la media. L'[Impilatore di immagini](https://abox.tools/it/impilare-immagini/) legge i file dal tuo disco e fa l'aritmetica nel tuo browser. Non c'è un passaggio di caricamento, non c'è un account e non c'è una coda, e puoi verificare questa affermazione come verificheresti quella di chiunque: apri il pannello di rete del tuo browser mentre gira, oppure semplicemente stacca la rete e impilali lo stesso.

La domanda collegata — come capire, per uno strumento qualsiasi, se consegnargli un file fosse necessario — ha [una guida tutta sua](https://abox.tools/it/guide/e-sicuro-caricare-i-propri-file/).
