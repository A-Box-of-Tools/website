# Comprimere un'immagine — a una dimensione esatta

La dimensione la dici tu. Il resto lo calcola lui.

> Comprimi un JPEG, un PNG o un WebP a una dimensione esatta: 100 KB, 2 MB, quello che ti serve. Gira tutto nel browser, senza caricare niente, senza account e anche offline.

Questa pagina è uno strumento interattivo che funziona interamente nel tuo browser, all'indirizzo https://abox.tools/it/comprimere-immagine/ — nulla di ciò che gli affidi viene caricato. Quanto segue è tutto ciò che la pagina dice dello strumento a parole; per usarlo, apri l'indirizzo.

## Qui non si caricano immagini, **mai**. Non c'è nessun server.

La compressione avviene dentro il browser che stai usando, sul tuo hardware, con gli encoder che si porta già dietro. Questo strumento non ha nessuna funzione di rete: non c'è niente da recuperare e niente da spedire. E dall'altra parte di questa pagina non c'è nessun server a cui mandare una foto, anche se una funzione del genere ci fosse.

- ✗ Niente caricamenti
- ✗ Nessun account
- ✗ Nessun limite di dimensione
- ✓ Funziona offline
- ✓ Open source

## Come comprimere un'immagine a una dimensione precisa

1. **Scegli le immagini.** Trascinale sul riquadro, oppure selezionale a mano. Le legge il browser direttamente dal tuo disco, e mentre lo fa non parte niente per nessuna destinazione.
2. **Scrivi la dimensione che ti hanno imposto.** 100 KB per il modulo di caricamento che continua a rifiutare la tua foto, 500 KB per il portale dove hai fatto domanda, 2 MB per una pagina che deve aprirsi in fretta. Le quattro più comuni sono già dei pulsanti.
3. **Premi «Comprimi alla dimensione obiettivo».** Ogni immagine viene codificata più volte, mentre lo strumento si stringe attorno alla qualità più alta che ci sta dentro. Quello che è già sotto l'obiettivo resta esattamente com'è.
4. **Guarda quanto è costato, poi scarica.** Ogni risultato dice in che formato è stato scritto, a che qualità, se le dimensioni in pixel sono cambiate e quanto somiglia all'originale una volta misurato. Con «Confronta» le due immagini si mettono una accanto all'altra.

## La versione lunga

[Come comprimere un'immagine a un peso esatto](https://abox.tools/it/guide/comprimere-un-immagine-a-una-dimensione-esatta/): Un modulo di caricamento vuole 500 KB e la tua foto pesa 4 MB. Quanto costa davvero un limite di peso, quale impostazione muovere per prima, e perché un PNG non si rimpicciolisce come un JPEG.

## Anche nella cassetta

- [Ridimensionatore di immagini](https://abox.tools/it/ridimensionare-immagine/): Di' la dimensione, disegna il riquadro, scegli il formato.
- [Da HEIC a JPG](https://abox.tools/it/heic-in-jpg/): Le foto che fa un iPhone, in un formato che apre chiunque.
- [Creatore di foto tessera](https://abox.tools/it/foto-tessera/): Scegli il paese. Applica quella norma, esattamente.
- [Impilatore di immagini](https://abox.tools/it/impilare-immagini/): Venti fotogrammi in uno, senza venti caricamenti e senza un convertitore RAW.

## Domande

### La mia immagine viene caricata da qualche parte?

No. Il file lo decodifica, lo comprime e lo misura il tuo browser sul tuo hardware, con gli encoder JPEG, PNG e WebP che si porta già dietro. Questo strumento non ha nessuna funzione di rete: non recupera mai niente e non spedisce mai niente. La `Content-Security-Policy` della pagina elenca poi tutti gli indirizzi che può contattare, e nessuno di quelli appartiene a questo sito.

### Come fa a centrare una dimensione esatta?

Provando. Non esiste una formula che trasformi un'impostazione di qualità in un numero di byte, perché dipende interamente dall'immagine, quindi lo strumento la codifica più volte e cerca la risposta. Parte dall'estremo alto della scala di qualità e si stringe dimezzando, e in questo modo trova la qualità più alta che ci sta in circa otto codifiche. Ogni dimensione che vedi sulla pagina è un file davvero codificato, non una stima.

### Cosa vuol dire qui «perdita minima»?

Tre cose precise. Primo: un'immagine già sotto il tuo obiettivo viene passata così com'è, byte per byte, invece di essere ricodificata. Secondo: si spende prima la qualità e poi la risoluzione, e solo fino a una soglia sotto la quale gli artefatti di compressione cominciano a vedersi; oltre quella soglia lo strumento rimpicciolisce l'immagine e rialza la qualità, perché pochi pixel buoni si vedono meglio di tanti pixel rovinati. Terzo: una volta trovato un risultato che ci sta, la ricerca risale finché il budget non è speso, così non ti ritrovi un file da 300 KB quando ne avevi chiesti 500.

### Cosa sono i valori SSIM e PSNR su ogni risultato?

Sono la misura di quanto è costata la compressione, presa decodificando il risultato e confrontandolo con l'immagine di partenza. SSIM confronta luminosità, contrasto e struttura locali, e questo si avvicina molto più di un conteggio di pixel cambiati a ciò che l'occhio nota davvero: sopra lo 0,98 circa le due immagini è difficile distinguerle anche mettendole una accanto all'altra. PSNR è il classico valore in decibel. Li calcola entrambi il tuo dispositivo e li mostra entrambi, perché l'affermazione della perdita minima si possa verificare invece che soltanto leggere.

### Quali formati sa leggere e scrivere?

Legge tutto quello che il browser sa decodificare, che in pratica vuol dire JPEG, PNG, WebP, GIF, BMP e, sulla maggior parte dei browser di oggi, anche AVIF. Scrive JPEG, PNG e WebP, perché quelli sono gli encoder che i browser si portano dietro. Su «automatico» tiene il formato con cui è arrivato il file, e passa a WebP solo quando tenerlo avrebbe voluto dire ridimensionare o perdere qualità in modo visibile.

### Perché un PNG non si riesce a comprimere granché?

Perché il PNG è senza perdita: non ha nessuna manopola della qualità da girare. L'unico modo per rimpicciolire un PNG è dargli meno pixel o meno colori, quindi con il PNG selezionato lo strumento arriva all'obiettivo soltanto ridimensionando. Se l'immagine è una fotografia, JPEG o WebP ci arrivano molto più vicino con una resa che si vede benissimo; se invece è un logo o uno screenshot con la trasparenza, WebP la trasparenza te la tiene, mentre il JPEG la riempirebbe di bianco.

### Comprimere un'immagine ne rimuove i dati EXIF e GPS?

Sì, come effetto collaterale. Comprimere vuol dire decodificare l'immagine in pixel e ricodificare quei pixel, e un canvas pieno di pixel non porta con sé nessun tag: posizione, modello della fotocamera, orari e tutto il resto semplicemente non vengono scritti nel file nuovo. Se invece vuoi togliere i metadati e lasciare l'immagine intatta, usa il [visualizzatore e rimozione EXIF](https://abox.tools/it/rimuovere-dati-exif/), che riscrive il contenitore senza ricomprimere niente.

### È gratis, e mi serve un account?

È gratis, e non c'è account, non c'è registrazione, non c'è periodo di prova e non c'è filigrana. Non c'è nemmeno un limite al numero o alla dimensione dei file, perché non c'è nessun server che li paga: il lavoro lo fa il tuo dispositivo. Il sito ha della pubblicità, ed è quella che lo mantiene; agli annunci non arriva niente sulle tue immagini.

### Funziona offline?

Sì. Carica la pagina una volta, poi stacca la connessione e continua a funzionare. È anche il modo più semplice per dimostrare che non viene caricato niente, perché uno strumento che spedisse via le tue immagini per comprimerle si fermerebbe nell'istante in cui stacchi la spina.

## Come si verifica quello che promette

- **Le tue immagini non hanno dove andare.** La Content-Security-Policy elenca tutti gli indirizzi che questa pagina può contattare, e nessuno di quegli indirizzi appartiene a questo sito. Non esiste un punto di raccolta in cui i tuoi file possano finire, e nel codice non c'è niente che ce li manderebbe se anche esistesse.
- **Qui dentro niente va a recuperare niente.** In `src/` non c'è né un `fetch`, né un `XMLHttpRequest`, né un `sendBeacon`. La compressione è `canvas.toBlob`, cioè l'encoder già installato nel browser.
- **I numeri sono misurati, non riferiti.** Le dimensioni, il valore di qualità e il confronto SSIM vengono calcolati tutti su questa pagina e mostrati a te. In questo repository non esiste nessun evento di analytics che porti con sé un nome di file, una dimensione, un conteggio o un risultato.
- **Cosa carica Google, e cosa non gli arriva.** Gli script della pubblicità e della misurazione arrivano da Google, il pulsante delle donazioni da Buy Me a Coffee. A nessuno di loro viene passato niente sulle tue immagini. Ogni riga che legge, comprime o misura un file è servita da questa origine ed è elencata nel repository.
- **Funziona offline.** Stacca la rete e lo strumento resta identico, perché al suo interno non c'è mai stato un passaggio di rete. È la prova più semplice che ci sia.

**Verifica tu stesso.** Niente di quanto sopra va preso per buono. Questa pagina la genera, dai modelli e dalla configurazione del repository, uno script di build che puoi leggere ed eseguire anche tu, e il risultato finisce sul branch `dist`: puoi quindi confrontare quello che viene servito con quello che produce una build dei sorgenti. https://github.com/A-Box-of-Tools/website

I file da leggere per primi sono `config/site.toml` per la Content-Security-Policy, `src/compress.js` per la ricerca che decide quanta qualità spendere, e `src/measure.js` per il confronto da cui esce il valore di «corrispondenza visiva».
