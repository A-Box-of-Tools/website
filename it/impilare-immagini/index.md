# Impila immagini — unisci una raffica, file RAW compresi

Venti fotogrammi in uno, senza venti caricamenti e senza un convertitore RAW.

> Unisci una raffica di fotografie in una sola: fanne la media per uccidere il rumore, prendi la mediana per togliere le persone da una scena, schiarisci per le scie stellari, oppure fai il focus stacking di una macro. Legge CR2, NEF, ARW, DNG, RAF e CR3 tirando fuori l'anteprima della fotocamera. Funziona interamente nel tuo browser.

Questa pagina è uno strumento interattivo che funziona interamente nel tuo browser, all'indirizzo https://abox.tools/it/impilare-immagini/ — nulla di ciò che gli affidi viene caricato. Quanto segue è tutto ciò che la pagina dice dello strumento a parole; per usarlo, apri l'indirizzo.

## Qui non si caricano fotografie, **mai**. Non c'è nessun server.

Ogni fotogramma viene aperto, decodificato, allineato, combinato e scritto dal tuo browser, sulla tua macchina. Una pila di venti file RAW da 60 MB è circa un gigabyte di fotografie, e non se ne sposta un byte: lo strumento non ha nessuna funzione di rete, e i file vengono letti direttamente dal tuo disco da un worker che non ha nessun posto dove mandare niente.

- ✗ Nessun caricamento
- ✗ Nessun account
- ✗ Nessuna filigrana
- ✓ Legge il RAW
- ✓ Funziona offline
- ✓ Codice aperto

## Come impilare una serie di fotografie nel browser

1. **Scegli i fotogrammi.** Una raffica, una serie a forcella, una sequenza da intervallometro, o una cartella di file RAW. Ognuno viene aperto man mano che arriva e la sua riga ti dice che cosa ne è venuto fuori — per un file RAW, la fotocamera, la dimensione dell'anteprima trovata dentro, e quanto poco del file si è dovuto leggere per trovarla.
2. **Scegli il metodo in base a quello che stai cercando di perdere.** Rumore: media, oppure sigma clipping se qualcosa si è mosso. Persone, macchine o un aereo di passaggio: mediana. Un cielo scuro che vuoi trasformare in scie stellari: schiarisci. Una macro scattata lungo la ghiera di messa a fuoco: focus stacking. La nota sotto il menù dice che cosa fa ognuno di questi al tuo particolare numero di fotogrammi.
3. **Decidi se i fotogrammi vanno allineati.** A mano libera: sì, solo traslazione. A mano libera e stavi anche ruotando: traslazione, rotazione e scala. Treppiede bloccato o intervallometro: no, e sarà più veloce. Ogni fotogramma viene misurato rispetto a quello segnato come riferimento, che è il primo finché non dici altro: «Prendi come riferimento» sposta il segno e lascia l'elenco nell'ordine in cui l'hai messo.
4. **Leggi le quattro cifre, poi premi il pulsante.** Prima che parta qualsiasi cosa, la pagina dice quanto sarà grande il risultato, più o meno quanta memoria prenderà, quante volte i fotogrammi verranno decodificati e quanto dei tuoi file è stato letto. Se la serie non entra in memoria in un pezzo solo lo dice, e dice quale risoluzione di lavoro lo sistemerebbe.

## La versione lunga

[Come impilare fotografie per ridurre il rumore, o togliere le persone](https://abox.tools/it/guide/impilare-foto-per-ridurre-il-rumore/): Impilare unisce una raffica di fotogrammi in un'immagine sola. Quale metodo usare dipende da che cosa stai cercando di perdere: il rumore, i passanti, o la poca profondità di campo di una macro. Come funziona ognuno, quanto costa, e dove si inseriscono i file RAW.

## Anche nella cassetta

- [Oscuratore di immagini](https://abox.tools/it/oscurare-immagine/): Quello che copri viene cancellato dal file, non nascosto dentro.
- [Visualizzatore e rimozione EXIF](https://abox.tools/it/rimuovere-dati-exif/): Guarda cosa dice di te una foto. Poi toglilo.
- [Visualizzatore DICOM](https://abox.tools/it/visualizzatore-dicom/): TC, RM, radiografie ed ecografie, con la finestra, l'header e le misure.
- [Da immagine a ICO](https://abox.tools/it/creare-favicon/): Dentro un'immagine sola. Fuori tutte le dimensioni che chiedono un browser, Windows o un Mac.

## Domande

### Le mie fotografie vengono caricate da qualche parte?

No. Ogni fotogramma viene aperto, decodificato, allineato, impilato e scritto dal tuo browser sul tuo hardware. Questo strumento non ha nessuna funzione di rete — non va mai a prendere niente e non manda mai niente — e la `Content-Security-Policy` della pagina elenca ogni indirizzo che può contattare, nessuno dei quali appartiene a questo sito. Carica la pagina una volta, stacca la rete, e continua a funzionare. Qui conta più che nella maggior parte degli strumenti semplicemente per una questione di volume: una pila di venti fotogrammi RAW è circa un gigabyte, e caricare un gigabyte di fotografie per farne fare la media è esattamente la cosa che questo strumento esiste per evitare.

### Quali formati RAW riesce a leggere, e come?

CR2, CR3, NEF, NRW, ARW, SR2, SRF, DNG, ORF, RAF, RW2, PEF, SRW, 3FR, IIQ, DCR, KDC, MRW, MEF, RWL e qualcun altro — che è quasi tutto quello che scrivono le fotocamere. Quello che ne legge è l'anteprima JPEG a piena risoluzione che la fotocamera stessa ha prodotto nel momento dello scatto: l'immagine sul retro della fotocamera, e quella che il tuo sistema operativo disegna come miniatura. Viene trovata percorrendo la struttura di directory del file, il che costa qualche lettura da pochi kilobyte l'una, e poi prendendo una sola fetta. **Non è un demosaicing dei dati del sensore.** Il risultato si porta dietro il bilanciamento del bianco e lo stile immagine della fotocamera a otto bit per canale, invece dei dodici o quattordici bit di dati lineari del sensore che ti darebbe un convertitore RAW.

### E allora perché non decodificare per bene i dati del sensore?

Perché vorrebbe dire incorporare LibRaw o dcraw — un secondo motore da decine di megabyte, per una sola famiglia di formati, fatto per la maggior parte di schemi di compressione diversi per ogni produttore. Quel baratto è discusso in `docs/what-can-be-built-here.md` nel sorgente di questo sito, dove il RAW delle fotocamere sta nella lista delle cose escluse da prima che questo strumento esistesse. Quello che è cambiato non è la risposta a quella domanda, ma la scoperta che per impilare non serve: le anteprime sono a piena risoluzione, sono quello che la fotocamera ti avrebbe dato comunque come JPEG, e leggerle è circa cento volte più veloce di quanto sarebbe il demosaicing. Se vuoi i dati del sensore, sviluppa prima i fotogrammi in un convertitore RAW e impila i TIFF o i JPEG che produce — questo strumento prende anche quelli.

### Quanti fotogrammi regge, e quanto grandi?

Sei metodi su sette lavorano in flusso: tengono un solo accumulatore e leggono ogni fotogramma esattamente una volta, quindi cento fotogrammi costano la stessa memoria di due e l'unica cosa che cresce è il tempo. La mediana è l'eccezione, perché il valore centrale di un insieme non si può sapere finché non lo hai tutto, quindi tiene tutti i fotogrammi insieme — venti fotogrammi da 24 megapixel sono circa 1,4 GB, che nessun browser ti concede. Quando succede, l'immagine viene tagliata in bande orizzontali e impilata una banda per volta, il che costa rileggere i fotogrammi per ogni banda. La pagina calcola tutto questo prima che tu prema il pulsante e ti mostra il numero, così un'esecuzione lenta non è mai una sorpresa.

### Che cosa fa davvero l'allineamento dei fotogrammi?

Trova di quanto si è spostato ogni fotogramma rispetto al fotogramma di riferimento e lo rimette a posto, con la precisione di una frazione di pixel. Il metodo è la correlazione di fase: lo spostamento tra due immagini compare come una differenza di fase tra i loro spettri, quindi una trasformata di Fourier per ciascuna trova uno scarto di duecento pixel al prezzo di uno da due pixel. La seconda impostazione ricava anche rotazione e scala, con lo stesso trucco applicato allo spettro in coordinate log-polari. È tutto globale — una traslazione, un angolo, una scala per tutto il fotogramma — quindi corregge una fotocamera che si è mossa e non può correggere un soggetto che si è mosso, né una fotografia scattata un passo più a sinistra. Una conseguenza visibile: un fotogramma spostato di venti pixel a sinistra non arriva più al bordo destro, quindi il risultato viene tagliato alla parte che tutti i fotogrammi coprono. È per questo che una pila allineata torna indietro appena appena più piccola dei fotogrammi che ci sono entrati, ed è l'unica alternativa a un bordo scuro fatto dei fotogrammi che lì non c'erano.

### Quale metodo dovrei usare?

**Media** per il rumore, su una serie in cui non si è mosso niente: taglia il rumore casuale di circa la radice quadrata del numero di fotogrammi. **Mediana** per togliere le cose che c'erano solo una parte del tempo — l'uso classico è fotografare una piazza affollata una dozzina di volte e ottenerla vuota. **Sigma clipping** quando vuoi tutte e due le cose: impara che cosa un pixel di solito è e fa la media solo dei valori che vanno d'accordo, quindi ha l'immunità della mediana a una macchina di passaggio e la riduzione del rumore della media. **Schiarisci** per scie stellari, fuochi d'artificio e light painting. **Scurisci** per togliere qualsiasi cosa luminosa si sia mossa. **Somma** per simulare una sola lunga esposizione. **Focus stacking** per una macro scattata lungo la ghiera di messa a fuoco.

### Perché il mio risultato è a otto bit se i miei file RAW sono a quattordici?

Perché quello che viene impilato è l'anteprima della fotocamera, che è un JPEG. Vale la pena dire che impilare recupera una parte di quello che questo costa: fare la media di sedici fotogrammi a otto bit dà un risultato con gradazioni davvero più fini di quelle che aveva ognuno di loro, perché è proprio il rumore che rendeva diverso l'arrotondamento di ogni fotogramma a permettere alla media di cadere tra un livello e l'altro. Qui l'aritmetica è fatta in virgola mobile e arrotondata una volta sola alla fine, quindi in mezzo non se ne butta via niente. Non è comunque la stessa cosa che impilare dati lineari di sensore, e questo strumento non fa finta del contrario.

### Posso impilare fotogrammi di dimensioni diverse, o di fotocamere diverse?

Sì, anche se di solito è un errore e vale la pena controllare di averlo voluto. Il risultato ha la dimensione del fotogramma più grande, e ogni altro fotogramma viene scalato per entrarci e centrato dentro. Mescolare fotocamere mescola anche la resa del colore, quindi la media delle due è la media di due interpretazioni diverse della stessa luce. Dove aiuta davvero è una serie scattata a due risoluzioni, o un file RAW e un JPEG dello stesso fotogramma.

### Dice che l'esecuzione sarà a bande. Che cosa vuol dire?

Che la memoria di lavoro di cui il metodo ha bisogno è più di quella che lo strumento è disposto ad allocare in una volta sola, quindi l'immagine verrà tagliata in strisce orizzontali e impilata una striscia per volta. Produce comunque esattamente lo stesso risultato; semplicemente rilegge i fotogrammi per ogni striscia, quindi ci mette di più, e la pagina ti dice quante decodifiche saranno. Abbassare di un passo la risoluzione di lavoro divide per quattro la memoria, il che quasi sempre trasforma un'esecuzione a bande in un passaggio unico — la nota dice quale impostazione lo farebbe.

### Perché questo strumento usa un Worker e nessuno degli altri lo fa?

Perché è l'unico il cui lavoro si misura in minuti. Ogni altro strumento qui fa qualcosa che prende un secondo o due, dove spostare il lavoro fuori dal thread principale sarebbe cerimonia. Impilare venti fotogrammi grandi è aritmetica compatta su centinaia di megabyte, e sul thread principale vuol dire una pagina congelata: nessuna barra di avanzamento che si muove, un pulsante Annulla che non risponde, e alla fine un browser che si offre di chiudere la scheda. Il Worker è un secondo thread in questo stesso browser, che esegue un file di questa stessa cartella, sotto questa stessa policy. Non è un server e non è una funzione di rete.

### È gratis, e serve un account?

È gratis, e non c'è un account, né un accesso, né una prova, né una filigrana. Non c'è nemmeno un limite a quanti fotogrammi impili o a quanto sono grandi, perché non c'è un server a pagarlo — il lavoro succede sulla tua macchina e l'unico tetto è la tua memoria. Il sito ospita pubblicità, ed è quella che lo paga; agli inserzionisti non viene dato niente delle tue fotografie.

## Come si verifica quello che promette

- **Le tue fotografie non hanno nessun posto dove andare.** La Content-Security-Policy elenca ogni indirizzo che questa pagina può contattare, e nemmeno uno appartiene a questo sito. Qui non c'è un endpoint dove i tuoi file possano essere raccolti, e non c'è niente nel codice che li manderebbe se ci fosse — nessun `fetch`, nessun `XMLHttpRequest`, nessun `sendBeacon`, né in `src/` né nel worker.
- **I file RAW vengono letti, non caricati — e letti appena.** Un file RAW di una fotocamera contiene già un JPEG a piena risoluzione che la fotocamera ha prodotto nel momento dello scatto. Questo strumento lo trova percorrendo qualche voce di directory e poi chiedendo una sola fetta, che su un file da 60 MB di solito sta sotto il centinaio di kilobyte. La pagina ti mostra quella cifra accanto alla dimensione dei tuoi file mentre lavori. I dati del sensore non vengono letti mai.
- **Il lavoro succede in un Worker su questa macchina, non su un server.** È l'unico strumento qui dentro che ne usa uno, perché impilare è questione di minuti di aritmetica e non di secondi, e una pagina congelata non può mostrare un avanzamento né essere annullata. Un Worker è un secondo thread in questo stesso browser — vedi `src/worker.js`. Gli vengono passati i file stessi, cosa che non costa niente, perché il riferimento a un file non sono i byte; e ha esattamente la stessa Content-Security-Policy della pagina, vale a dire nessun posto dove mandarli.
- **Della serie non viene riferito niente da nessuna parte.** Quanti fotogrammi hai impilato, quale fotocamera li ha scritti, di quanto si era spostato ognuno, quale metodo hai scelto e quanto ci è voluto restano nella memoria di questa pagina finché non la chiudi. In questo repository non c'è un evento di analytics personalizzato che ne porti un pezzo, e l'unica domanda che questo sito fa dopo un download manda un pollice su o giù e il nome dello strumento, niente altro.
- **Funziona offline.** Stacca la rete e lo strumento è identico, perché un passaggio di rete non c'è mai stato. Il worker e ogni modulo che carica sono messi in cache dal service worker di questa pagina, quindi una copia installata impila file RAW con la rete staccata.

**Verifica tu stesso.** Niente di quanto sopra va preso per buono. Questa pagina la genera, dai modelli e dalla configurazione del repository, uno script di build che puoi leggere ed eseguire anche tu, e il risultato finisce sul branch `dist`: puoi quindi confrontare quello che viene servito con quello che produce una build dei sorgenti. https://github.com/A-Box-of-Tools/website

I file da leggere per primi sono `config/site.toml` per la Content-Security-Policy, `src/raw.js` per come un file RAW viene aperto leggendo kilobyte invece di megabyte, `src/stack.js` per l'aritmetica di ogni metodo, e `src/plan.js` per sapere da dove vengono le cifre di memoria e di decodifica mostrate sulla pagina — sono le risposte di quel file, non delle stime.
