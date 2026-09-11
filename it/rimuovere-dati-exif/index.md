# Dati EXIF — rimuovere i metadati da una foto

Guarda cosa dice di te una foto. Poi toglilo.

> Guarda i dati EXIF e GPS nascosti in una foto, modificali, oppure togli tutto con un clic. Nel browser, senza caricare niente, e senza che la foto venga mai ricodificata.

Questa pagina è uno strumento interattivo che funziona interamente nel tuo browser, all'indirizzo https://abox.tools/it/rimuovere-dati-exif/ — nulla di ciò che gli affidi viene caricato. Quanto segue è tutto ciò che la pagina dice dello strumento a parole; per usarlo, apri l'indirizzo.

## Qui non si caricano foto, **mai**. Non c'è nessun server.

Il file viene aperto, analizzato e riscritto dal tuo browser. Questo strumento non ha nessuna funzione di rete: non c'è niente da recuperare e niente da spedire. E dall'altra parte di questa pagina non c'è nessun server a cui mandare una foto, anche se una funzione del genere ci fosse.

- ✗ Niente caricamenti
- ✗ Nessun account
- ✓ Funziona offline
- ✓ Open source
- ✓ Non ricodifica mai l'immagine

## Come rimuovere i dati EXIF da una foto

1. **Scegli le foto.** Trascinale sul riquadro, oppure selezionale a mano. Le legge il browser direttamente dal tuo disco, e mentre lo fa non parte niente per nessuna destinazione.
2. **Leggi cosa contengono, se ti va.** L'elenco dei riscontri nomina le cose che vale la pena sapere, cioè la posizione GPS, gli orari e i numeri di serie, e viene prima della tabella completa di tutti i tag.
3. **Premi «Rimuovi tutti i metadati».** Per quasi tutti il lavoro è tutto qui. Ogni tag, i blocchi XMP e IPTC, i commenti e la miniatura incorporata se ne vanno, su tutte le foto dell'elenco in una volta sola.
4. **Oppure modifica invece di rimuovere.** Cambia una data, correggi una riga di copyright, butta la posizione tenendo le impostazioni della fotocamera, e poi salva quella foto per conto suo.

## La versione lunga

[Cosa dice di te una foto, e come toglierlo](https://abox.tools/it/guide/rimuovere-i-dati-exif-e-gps/): Una foto fatta con un telefono di solito porta con sé il punto esatto in cui è stata scattata, l'ora al secondo e il numero di serie della fotocamera. Cosa c'è là dentro, chi può leggerlo, e come toglierlo senza toccare l'immagine.

## Anche nella cassetta

- [Visualizzatore DICOM](https://abox.tools/it/visualizzatore-dicom/): TC, RM, radiografie ed ecografie, con la finestra, l'header e le misure.
- [Da immagine a ICO](https://abox.tools/it/creare-favicon/): Dentro un'immagine sola. Fuori tutte le dimensioni che chiedono un browser, Windows o un Mac.
- [Immagine in data URI](https://abox.tools/it/immagine-in-base64/): Tutta l'immagine come una riga di testo, da incollare dritta nel CSS o nell'HTML.
- [Da SVG a immagine](https://abox.tools/it/svg-in-png/): La dimensione la dici tu. Un vettoriale non ne ha una sua da perdere.

## Domande

### La mia foto viene caricata da qualche parte?

No. Il file lo legge, lo analizza e lo riscrive il tuo browser sul tuo hardware. Questo strumento non ha nessuna funzione di rete: non recupera mai niente e non spedisce mai niente. La `Content-Security-Policy` della pagina elenca poi tutti gli indirizzi che può contattare, e nessuno di quelli appartiene a questo sito.

### Cos'è l'EXIF, e cos'altro si nasconde in una foto?

L'EXIF è un blocco di tag che la fotocamera scrive accanto all'immagine: la marca e il modello, le impostazioni di esposizione, la data e l'ora al secondo, spesso una posizione GPS e a volte un numero di serie. Le foto però portano spesso anche altro: un pacchetto XMP di XML lasciato da un programma di ritocco, un blocco IPTC con didascalia e firma, un profilo colore, una piccola seconda copia dell'immagine come miniatura, e una maker note di dati non documentati del produttore. Questo strumento li elenca tutti.

### Rimuovere i metadati peggiora la qualità dell'immagine?

No, ed è il motivo principale per usare uno strumento come questo invece di risalvare la foto. I metadati stanno nel contenitore attorno all'immagine compressa, non dentro l'immagine. Rimuoverli vuol dire cancellare voci da un elenco e riscrivere l'elenco; i dati compressi dell'immagine vengono copiati byte per byte, quindi il risultato decodifica esattamente gli stessi pixel. Non viene decodificato niente e non viene ricompresso niente.

### Quali formati di file gestisce?

JPEG, PNG e WebP. HEIC e AVIF vengono riconosciuti ma non riscritti, perché sono formati costruiti con box annidati e hanno bisogno di un analizzatore diverso: lo strumento te lo dice, invece di produrre un file rotto. Nemmeno un TIFF nudo viene gestito, perché in un TIFF i metadati e i pixel sono indirizzati dagli stessi offset.

### La mia foto risulterà ruotata dopo la rimozione dei metadati?

Può succedere, e c'è un'impostazione apposta. I telefoni di solito registrano l'immagine come l'ha vista il sensore e aggiungono un tag Orientation che dice come girarla. Togli quel tag e certi visualizzatori ti mostrano la foto di traverso. L'opzione «tieni il tag di orientamento», attiva di default, riscrive un minuscolo blocco EXIF che contiene soltanto quel tag, e lo fa solo quando la foto ne aveva davvero bisogno. Toglila se preferisci che il file non porti EXIF di nessun tipo.

### Rimuove la posizione GPS?

Sì. Rimuovere tutto rimuove l'intera directory GPS, e puoi anche cancellare la sola posizione tenendo il resto. La posizione è mostrata prima in gradi decimali, perché «51 gradi, 30 primi, 26 secondi» non rende evidente che una foto nomina l'edificio in cui è stata scattata.

### Posso cambiare un tag invece di cancellarlo?

Sì. I tag di testo, le date, l'ISO, l'orientamento e la risoluzione si possono modificare tutti, e qualche tag comune si può aggiungere a una foto che non ne ha. Un avvertimento però: scrivere il file ricostruisce il blocco EXIF, e una maker note contiene offset che puntano dentro il blocco originale, quindi una maker note ricostruita potrebbe poi non essere più leggibile dal software del produttore. Se la cosa ti interessa, cancellala oppure lascia il file com'è.

### È gratis, e mi serve un account?

È gratis, e non c'è account, non c'è registrazione e non c'è periodo di prova. Il sito ha della pubblicità, ed è quella che lo mantiene; agli annunci non arriva niente sulle tue foto.

### Funziona offline?

Sì. Carica la pagina una volta, poi stacca la connessione e continua a funzionare. È anche il modo più semplice per dimostrare che non viene caricato niente, perché uno strumento che spedisse via le tue foto per elaborarle si fermerebbe nell'istante in cui stacchi la spina.

## Come si verifica quello che promette

- **Le tue foto non hanno dove andare.** La Content-Security-Policy elenca tutti gli indirizzi che questa pagina può contattare, e nessuno di quegli indirizzi appartiene a questo sito. Non esiste un punto di raccolta in cui i tuoi file possano finire, e nel codice non c'è niente che ce li manderebbe se anche esistesse.
- **Qui dentro niente va a recuperare niente.** A differenza degli altri strumenti di questa cassetta, questo non ha nemmeno la funzione «carica da un indirizzo web», e di passaggi di rete facoltativi non ne ha proprio. In `src/` non c'è né un `fetch`, né un `XMLHttpRequest`, né un `sendBeacon`.
- **I metadati che leggiamo non vengono mai riferiti.** La tua posizione GPS viene mostrata su questa pagina e non va da nessun'altra parte. In questo repository non esiste nessun evento di analytics che porti con sé un tag, un nome di file, una dimensione o un conteggio.
- **Cosa carica Google, e cosa non gli arriva.** Gli script della pubblicità e della misurazione arrivano da Google. A nessuno dei due viene passato niente sulle tue foto. Ogni riga che legge, analizza o riscrive un file è servita da questa origine ed è elencata nel repository.
- **Cosa carica il pulsante delle donazioni, e cosa non gli arriva.** Il pulsante «Buy me a coffee» in cima lo disegna uno script di cdnjs.buymeacoffee.com, che prende i caratteri da Google Fonts. È un link e niente di più: non riferisce nessuna visita, e non gli viene passato niente su di te o sui tuoi file. Finché non ci clicchi non succede niente, e quello a cui arriveresti è il sito di qualcun altro.
- **Funziona offline.** Stacca la rete e lo strumento resta identico, perché al suo interno non c'è mai stato un passaggio di rete. È la prova più semplice che ci sia.

**Verifica tu stesso.** Niente di quanto sopra va preso per buono. Questa pagina la genera, dai modelli e dalla configurazione del repository, uno script di build che puoi leggere ed eseguire anche tu, e il risultato finisce sul branch `dist`: puoi quindi confrontare quello che viene servito con quello che produce una build dei sorgenti. https://github.com/A-Box-of-Tools/website

I file da leggere per primi sono `config/site.toml` per la Content-Security-Policy, `src/tiff.js` per l'analizzatore EXIF, e `src/jpeg.js` per la prova che l'immagine in sé viene sempre e solo copiata.
