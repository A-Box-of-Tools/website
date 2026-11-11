# Scanner per documenti — la foto di una pagina, raddrizzata

Fotografa la pagina. Ti torna indietro qualcosa che sembra scansionato.

> Trasforma la foto di una pagina scattata col telefono in un PDF raddrizzato e illuminato in modo uniforme. Gli angoli te li trova lui, la prospettiva viene annullata, l'ombra viene divisa via. Funziona interamente nel tuo browser: non viene caricato niente.

Questa pagina è uno strumento interattivo che funziona interamente nel tuo browser, all'indirizzo https://abox.tools/it/scansionare-documenti/ — nulla di ciò che gli affidi viene caricato. Quanto segue è tutto ciò che la pagina dice dello strumento a parole; per usarlo, apri l'indirizzo.

## Qui non si caricano documenti, **mai**. Non c'è nessun server.

La foto viene decodificata, raddrizzata, ripulita e scritta in un PDF dal tuo browser, usando soltanto aritmetica e i codec che si porta già dietro. Questo strumento non ha nessuna funzione di rete — niente da recuperare, niente da mandare — e il motivo per cui qui la cosa conta è di che cosa si fotografano le pagine: un passaporto, una busta paga, un contratto d'affitto, un modulo che un ufficio ha chiesto di «scansionare e rispedire».

- ✗ Nessun caricamento
- ✗ Nessun account
- ✗ Nessuna filigrana
- ✓ Funziona offline
- ✓ Codice aperto

## Come scansionare un documento con la fotocamera del telefono

1. **Fotografa la pagina.** Dall'alto, con tutta la pagina nell'inquadratura e i quattro angoli visibili o quasi. Non deve essere perfettamente frontale e non deve essere illuminata in modo uniforme: l'inclinazione e l'ombra sono il motivo per cui questo strumento esiste. Quello che conta è riempire l'inquadratura — una pagina fotografata da metà stanza non ha dentro nessun dettaglio da recuperare.
2. **Controlla i quattro angoli.** Te li trova lui quando la foto viene letta, e la pagina lo dice quando non ne è sicura — una pagina su una scrivania dello stesso colore della carta ha davvero un bordo difficile da vedere. Premi in un punto qualsiasi della foto e l'angolo più vicino viene al tuo dito, oppure raggiungine uno con `Tab` e spostalo con i tasti freccia.
3. **Scegli che cosa fare con la luce.** «Colore, uniformato» misura la carta lungo tutta la pagina e la divide via, così l'ombra sparisce e un timbro o una firma si tengono il loro colore. «Bianco e nero» va oltre ed è quello che rende una scansione abbastanza piccola da mandarla per email. Quello che vedi sullo schermo è il risultato vero, prodotto dallo stesso codice che scrive il file.
4. **Aggiungi le altre pagine.** Ogni foto che aggiungi diventa un'altra pagina dello stesso documento, nell'ordine in cui sono elencate, e ognuna si tiene i suoi angoli. Le frecce su una pagina nella striscia la spostano più avanti o più indietro.
5. **Salva il PDF, e aprilo prima di mandarlo.** Il documento viene scritto qui, nella memoria di questa pagina. Per farlo non è stato caricato niente, e di lui non è stato riferito niente da nessuna parte.

## La versione lunga

[Come scansionare un documento col telefono](https://abox.tools/it/guide/scansionare-un-documento-col-telefono/): Che cosa separa la fotografia di una pagina dalla scansione di quella pagina: l'inclinazione, la luce irregolare e la dimensione del file. Come scattare la foto, che cosa sistemare dopo, e perché niente di tutto questo ha bisogno di un server.

## Anche nella cassetta

- [Estrarre l'audio da un video](https://abox.tools/it/estrarre-audio-da-video/): Trascina dentro un video e portati via il suono. L'immagine non viene mai decodificata, e non viene caricato niente.
- [Taglierino audio](https://abox.tools/it/tagliare-audio/): Segna al volo i pezzi che valgono. Tornano in un file solo, tagliato dove hai detto tu.
- [Editor audio](https://abox.tools/it/modificare-audio/): Riproducila al contrario, cambiale velocità, tira su una registrazione troppo bassa. Tutto qui, sul tuo dispositivo.
- [Unire e dividere PDF](https://abox.tools/it/unire-pdf/): Pagine spostate senza un giro fino a un server.

## Domande

### Il mio documento viene caricato da qualche parte?

No. La foto viene decodificata, raddrizzata, ripulita e scritta in un PDF dal tuo browser sul tuo hardware. Questo strumento non ha nessuna funzione di rete — non va mai a prendere niente e non manda mai niente — e la `Content-Security-Policy` della pagina elenca ogni indirizzo che può contattare, nessuno dei quali appartiene a questo sito. Carica la pagina una volta, stacca la rete, e continua a funzionare.

### Come fa a trovare gli angoli della pagina senza un modello?

Cercando i quattro lunghi bordi dritti di cui è fatto un rettangolo. La foto viene rimpicciolita, se ne prende il gradiente — dove l'immagine cambia, e in quale direzione — e ogni pixel che sta su un bordo vota per la linea dritta su cui si troverebbe. Le linee forti vengono accoppiate in rettangoli candidati, e ogni candidato prende un punteggio percorrendo i suoi quattro lati e chiedendosi quanta parte di ognuno abbia davvero un bordo sotto, e se i quattro insieme siano il contorno di una cosa sola: una pagina è più chiara di quello che le sta intorno, o più scura, ma lo è nello stesso modo su tutti e quattro i lati, ed è questo che impedisce di scambiare una riga di testo per il fondo della pagina. Non ci sono pesi, non viene scaricato niente, e l'aritmetica è la stessa per ogni documento che ci passa dentro.

### Gli angoli che ha trovato sono sbagliati. E adesso?

Trascinali. Gli angoli sono una posizione di partenza e mai una decisione: la scansione viene presa da dove finiscono tutti e quattro. Premi in un punto qualsiasi della foto e l'angolo più vicino salta al tuo dito, che è più facile che centrare una maniglia piccola, e i tasti freccia spostano l'angolo che ha il fuoco un pixel per volta. La pagina ti dice anche quando gli angoli sono un'ipotesi e non un ritrovamento, e segna quella pagina nella striscia — una pagina appoggiata su una scrivania più o meno del suo stesso colore è il motivo solito, perché lì di bordo da trovare non ce n'è quasi.

### Perché la pagina raddrizzata viene fuori della forma giusta, e non schiacciata?

Perché la forma viene ricavata dalla prospettiva e non misurata sui bordi. Una pagina fotografata di sbieco ha il bordo lontano accorciato, quindi il metodo ovvio — prendere la coppia di bordi opposti più lunga e chiamare quello il rapporto — produce un A4 visibilmente tozzo, che è quello che ti dà la maggior parte degli scanner sul web. La fotografia di un rettangolo porta in realtà abbastanza informazione da ricavare sia il rapporto d'aspetto del rettangolo sia la lunghezza focale della fotocamera, a patto solo che la fotocamera sia una normale; è un risultato di Zhang e He del 2003, ed è quello che fa `src/geometry.js`. Dove la foto è stata scattata frontale non c'è prospettiva da cui partire e non serve, perché allora i bordi sono esatti — quindi ripiega su quelli, e la pagina dice quale delle due ha risposto.

### Che cosa fa davvero all'immagine la «ripulitura»?

Divide via la luce. La luminosità propria della carta viene misurata lungo tutta la pagina — una griglia di riquadri, e in ogni riquadro un percentile alto della luminosità, che il testo è troppo scuro e troppo rado per spostare — e ogni pixel viene diviso per la carta stimata in quel punto. Quello che resta è l'inchiostro, illuminato in modo uniforme, senza più l'ombra e senza la caduta di luce. Non è la stessa cosa che alzare il contrasto: alzare il contrasto di una pagina fotografata rende bianca la parte chiara, nera la parte scura e illeggibile quello che c'è scritto nella parte scura, ed è per questo che i «livelli automatici» peggiorano queste immagini invece di migliorarle.

### Perché la modalità bianco e nero è così tanto più piccola?

Perché un'immagine con dentro due colori è davvero una frazione dei dati di un'immagine con sedici milioni, e qui viene salvata proprio così: un bit per pixel, impacchettati otto per byte e compressi in modo esatto, e non come il JPEG di un'immagine in bianco e nero. Sulle stesse pagine viene fuori circa diciotto volte più piccola della modalità a colori, così un contratto di venti pagine sta sotto il megabyte invece di arrivare a una quindicina. La soglia è quella di Sauvola, che decide ogni pixel confrontandolo con la media e la dispersione del suo vicinato invece che con un numero unico per tutta la pagina — ed è questo che tiene leggibile quello che è scritto dentro un'ombra. Non ha mezzitoni, quindi una pagina con sopra una fotografia conviene farla con una delle altre modalità.

### Posso mettere più pagine in un solo PDF?

Sì. Ogni foto che aggiungi diventa un'altra pagina, nell'ordine in cui sono elencate, e ogni pagina si tiene i suoi angoli — così una pila di pagine fotografate una dopo l'altra diventa un documento solo. Le frecce su ogni pagina nella striscia la spostano più avanti o più indietro. L'impostazione della ripulitura è condivisa da tutte apposta: pagine dello stesso documento ripulite in modo diverso sembrano due documenti.

### Legge il testo, così posso cercare dentro il PDF?

No. Non c'è un livello di testo e non c'è riconoscimento dei caratteri: quello che esce è l'immagine della pagina su una pagina. Farlo per bene vorrebbe dire un motore OCR, che sono decine di megabyte di modello da scaricare — e uno scanner per documenti che andasse a prendere un modello prima di poter leggere la tua busta paga sarebbe uno scanner per documenti con un motivo per telefonare a casa a proposito di buste paga. Se ti serve il testo, la modalità bianco e nero produce esattamente il tipo di file su cui il software OCR sulla tua macchina lavora meglio.

### È venuta sfocata. Perché?

Quasi sempre perché la pagina era piccola nella foto. Il pannello sotto l'anteprima dice quanta parte dell'inquadratura ha riempito la pagina e più o meno a quanti punti per pollice corrisponde su un foglio di quella misura — sotto i 150 DPI circa una scansione stampata sembra molle, e non c'è strumento che possa fare qualcosa per un dettaglio che nel file non c'è mai stato. Avvicinati invece di zoomare, stai fermo, e lascia che la fotocamera metta a fuoco la pagina prima di premere. Il mosso è l'altra causa, e non è recuperabile nemmeno quello.

### È gratis, e serve un account?

È gratis, e non c'è un account, né un accesso, né una prova, né un limite di pagine, né una filigrana. Non c'è nemmeno un limite alla dimensione delle foto, perché non c'è un server a pagarlo — il lavoro succede sulla tua macchina. Il sito ospita pubblicità, ed è quella che lo paga; agli inserzionisti non viene dato niente dei tuoi documenti.

## Come si verifica quello che promette

- **I tuoi documenti non hanno nessun posto dove andare.** La Content-Security-Policy elenca ogni indirizzo che questa pagina può contattare, e nemmeno uno appartiene a questo sito. Qui non c'è un endpoint dove le tue foto possano essere raccolte, e non c'è niente nel codice che le manderebbe se ci fosse.
- **Non c'è nessun modello, quindi non c'è niente da scaricare e niente da chiedere.** Trovare i quattro angoli di una pagina si fa con l'aritmetica: il gradiente dell'immagine, un voto per le linee dritte che ci sono dentro, e una verifica di che cosa ci sia davvero sotto ogni lato del rettangolo che vince. Nessun peso, nessun runtime di inferenza, niente da recuperare al primo uso, e niente che si comporti in modo diverso sul documento di qualcun altro rispetto al tuo — vedi `src/detect.js`.
- **Il documento non porta né data, né autore, né nome della macchina.** Una scansione è una cosa che si manda ad altre persone, di solito perché un ufficio l'ha chiesta. L'unica cosa scritta nel PDF oltre alle pagine stesse è il nome di questo strumento, più un titolo se ne scrivi uno. Non c'è una data di creazione, non c'è un autore, non c'è un numero di serie e non c'è niente ricavato dal tuo orologio, dai tuoi nomi di file o dal tuo computer — vedi `src/document.js`.
- **Qui dentro niente va a prendere niente.** In `src/` non c'è nessun `fetch`, nessun `XMLHttpRequest` e nessun `sendBeacon`. Il lavoro è `getImageData`, qualche ciclo sui byte e l'encoder JPEG del browser — tutta roba già installata sulla tua macchina.
- **Funziona offline.** Stacca la rete e lo strumento è identico, perché un passaggio di rete non c'è mai stato. È la prova più semplice di tutte — e quella che vale la pena fare prima di scansionare un passaporto.

**Verifica tu stesso.** Niente di quanto sopra va preso per buono. Questa pagina la genera, dai modelli e dalla configurazione del repository, uno script di build che puoi leggere ed eseguire anche tu, e il risultato finisce sul branch `dist`: puoi quindi confrontare quello che viene servito con quello che produce una build dei sorgenti. https://github.com/A-Box-of-Tools/website

I file da leggere per primi sono `config/site.toml` per la Content-Security-Policy, `src/detect.js` per come gli angoli vengono trovati senza nessun modello, `src/warp.js` per il raddrizzamento, e `src/clean.js` per come la luce irregolare viene divisa via.
