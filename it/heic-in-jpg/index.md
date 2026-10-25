# Da HEIC a JPG — convertire le foto dell'iPhone

Le foto che fa un iPhone, in un formato che apre chiunque.

> Converti in JPG le foto HEIC dell'iPhone, nel browser. Il decodificatore gira sul tuo dispositivo: niente caricamenti, nessun account, funziona offline, e la data e i dati della fotocamera possono venire dietro.

Questa pagina è uno strumento interattivo che funziona interamente nel tuo browser, all'indirizzo https://abox.tools/it/heic-in-jpg/ — nulla di ciò che gli affidi viene caricato. Quanto segue è tutto ciò che la pagina dice dello strumento a parole; per usarlo, apri l'indirizzo.

## Qui non si caricano foto, **mai**. Non c'è nessun server.

La decodifica avviene nel browser che stai usando, sul tuo hardware. L'HEIC è l'unico formato di immagine che un browser non apre da solo, quindi questa pagina il decodificatore se lo porta dietro: circa 1,4 MB, serviti da questo sito e messi in cache dopo la prima visita. È tutta lì la ragione per cui ogni altro convertitore HEIC ti chiede di caricare, perché mettono il codec su un server e le tue foto lì devono andarci. Questo invece il codec lo tiene qui. Su questa pagina non c'è proprio nessuna funzione di rete, e dall'altra parte non c'è nessun server a cui mandare una foto.

- ✗ Niente caricamenti
- ✗ Nessun account
- ✗ Nessun limite di dimensione
- ✓ Funziona offline
- ✓ Open source

## Come convertire le foto HEIC in JPG

1. **Scegli le foto HEIC.** Trascinale sul riquadro, oppure selezionale a mano, direttamente da un backup del telefono o da una cartella sul computer. Le legge il browser dal tuo disco, e mentre lo fa non parte niente per nessuna destinazione. L'elenco dice cos'è ognuna e cosa ha dentro.
2. **Guarda cosa portano con sé le foto.** Ogni riga nomina la data dello scatto e la fotocamera, e dice, in verde perché è la parte che vale la pena notare, se il file contiene coordinate GPS. Tutto questo si legge dal contenitore senza decodificare l'immagine, quindi non costa niente e compare subito.
3. **Scegli un formato, e decidi sui dettagli.** JPEG, a meno che tu non abbia un motivo: è il formato che si apre dappertutto, che è poi tutto il senso del convertire. Il cursore della qualità è su 92, l'impostazione a cui una fotografia si distingue a fatica dall'originale. La casella decide se la data, la fotocamera e la posizione vengono dietro.
4. **Premi «Converti», e scarica.** Il decodificatore arriva alla prima conversione, circa 1,4 MB una volta sola, e ogni foto dopo di quella viene decodificata e scritta sul tuo dispositivo. Un file solo ti dà un pulsante di download; più file ti danno anche uno zip.

## La versione lunga

[La foto che il tuo telefono ha salvato, e il formato che non apre niente](https://abox.tools/it/guide/convertire-heic-in-jpg/): Gli iPhone salvano le foto in HEIC, e mezza internet non riesce ad aprirne una. Cos'è il formato, perché solo Safari lo decodifica, quanto costa convertire all'immagine, e come farlo senza caricare le foto da nessuno.

## Anche nella cassetta

- [Creatore di foto tessera](https://abox.tools/it/foto-tessera/): Scegli il paese. Applica quella norma, esattamente.
- [Impilatore di immagini](https://abox.tools/it/impilare-immagini/): Venti fotogrammi in uno, senza venti caricamenti e senza un convertitore RAW.
- [Oscuratore di immagini](https://abox.tools/it/oscurare-immagine/): Quello che copri viene cancellato dal file, non nascosto dentro.
- [Visualizzatore e rimozione EXIF](https://abox.tools/it/rimuovere-dati-exif/): Guarda cosa dice di te una foto. Poi toglilo.

## Domande

### La mia foto viene caricata da qualche parte?

No. Il file lo legge, lo decodifica e lo scrive il tuo browser sul tuo hardware. Questo strumento non ha nessuna funzione di rete: non recupera mai niente e non spedisce mai niente. La `Content-Security-Policy` della pagina elenca poi tutti gli indirizzi che può contattare, e nessuno di quelli appartiene a questo sito. L'unica cosa che si carica davvero è il decodificatore stesso, e arriva da questo sito, una volta sola, prima ancora che la tua foto sia coinvolta.

### Perché questa pagina scarica 1,4 MB la prima volta?

Perché l'HEIC è l'unico formato di immagine che un browser non apre. È un fotogramma HEVC dentro un contenitore a box, e solo Safari, su hardware Apple, ha un decodificatore per lui: Chrome, Firefox ed Edge il file lo rifiutano e basta. Quindi un convertitore HEIC un decodificatore deve prenderlo da qualche parte, e i posti da cui può arrivare sono due, il server oppure la pagina. Ogni altro convertitore ha scelto il server, ed è esattamente per questo che tutti hanno bisogno che le tue foto vengano caricate. Questo invece si porta dietro `libheif` compilato in WebAssembly. È servito da questo sito, messo in cache dopo la prima visita, ed è tutto il prezzo del fatto che le tue foto non vadano da nessuna parte.

### Il JPEG conserva la data, la fotocamera e la posizione?

Se lo vuoi, ed è una casella sulla pagina. Lasciandola attiva, il blocco EXIF viene copiato fuori dall'HEIC e scritto nel JPEG esattamente come l'aveva scritto il telefono, così la foto convertita si ordina ancora per il giorno dello scatto e non per il giorno della conversione, che è poi la lamentela abituale sui convertitori HEIC. Un tag viene cambiato, e uno solo: l'orientamento, che viene messo su «dritto», perché la rotazione è già stata applicata ai pixel e un visualizzatore che la applicasse di nuovo metterebbe di traverso ogni foto verticale. Togli la spunta e il JPEG esce con l'immagine e nient'altro.

### Toglie le coordinate GPS?

Ti dice che ci sono, e poi fa quello che le chiedi. La riga di ogni foto dice se il file porta con sé delle coordinate prima ancora che tu converta qualunque cosa, il che è più di quanto faccia il telefono. Togliendo la spunta a «tieni la data, la fotocamera e le impostazioni», le coordinate restano fuori dal JPEG insieme a tutto il resto; lasciandola, ci vengono dietro. Se invece vuoi passare in rassegna i tag nel dettaglio, o toglierli da foto che sono già JPEG, lo strumento giusto è il [visualizzatore e rimozione EXIF](https://abox.tools/it/rimuovere-dati-exif/), che lo fa senza ricomprimere l'immagine.

### L'immagine viene ricompressa?

Sì, e non può essere altrimenti: HEIC e JPEG sono codec diversi, quindi non c'è modo di passare dall'uno all'altro senza decodificare l'immagine e ricodificarla. Quello che puoi controllare è quanto costa. Il cursore della qualità parte da 92, e a 92 una fotografia si distingue a fatica dall'originale; nel menu c'è anche il PNG, per il caso in cui non vuoi nessuna perdita e non ti spaventa un file da cinque a dieci volte più pesante.

### E se il file si chiama .jpg ma in realtà è un HEIC?

Funziona lo stesso. Ogni file trascinato qui viene identificato dai suoi primi byte e non dal nome, perché il nome è quello che ha deciso l'ultima applicazione che ha toccato il file, e un HEIC arrivato chiamandosi «.jpg» è uno dei modi più comuni in cui una persona finisce per cercare uno strumento come questo. Un file che invece è davvero un JPEG o un PNG viene rifiutato con un messaggio che lo dice, invece di essere convertito in una copia di sé stesso.

### Può convertire una Live Photo, o una raffica?

Le immagini ferme che contiene, sì. Un HEIC può contenere più di un'immagine, e ognuna di quelle che contiene viene convertita e chiamata come l'originale con un numero in fondo. La metà video di una Live Photo è un file a parte, che il telefono tiene accanto all'HEIC, quindi qui dentro non c'è niente da convertire. Le mappe di profondità e le miniature stanno nel contenitore ma non sono immagini che qualcuno abbia chiesto, e vengono lasciate stare.

### Perché non mi prende l'AVIF?

Perché non c'è niente da farci. L'AVIF è lo stesso contenitore dell'HEIC con dentro AV1 al posto di HEVC, e ogni browser attuale lo decodifica nativamente, quindi un convertitore ti spedirebbe un megabyte di motore per risolverti un problema che non hai. Se ti serve un AVIF come JPEG, leggono l'AVIF e scrivono JPEG sia il [compressore di immagini](https://abox.tools/it/comprimere-immagine/) sia il [ridimensionatore di immagini](https://abox.tools/it/ridimensionare-immagine/), usando il decodificatore che il tuo browser ha già.

### È gratis, e mi serve un account?

È gratis, e non c'è account, non c'è registrazione, non c'è periodo di prova e non c'è filigrana. Non c'è nemmeno un limite al numero o alla dimensione dei file, perché non c'è nessun server che li paga: il lavoro lo fa il tuo dispositivo. Il sito ha della pubblicità, ed è quella che lo mantiene; agli annunci non arriva niente sulle tue foto.

### Funziona offline?

Sì, decodificatore compreso. Carica la pagina una volta, poi stacca la connessione e continua a lavorare sulle tue foto esattamente come prima. È anche la prova più forte che ci sia del fatto che non viene caricato niente: un convertitore che spedisse via i tuoi HEIC per decodificarli si fermerebbe nell'istante in cui stacchi la spina, e questo non si ferma.

## Come si verifica quello che promette

- **Le tue foto non hanno dove andare.** La Content-Security-Policy elenca tutti gli indirizzi che questa pagina può contattare, e nessuno di quegli indirizzi appartiene a questo sito. Non esiste un punto di raccolta in cui i tuoi file possano finire, e nel codice non c'è niente che ce li manderebbe se anche esistesse.
- **Il decodificatore è arrivato da qui, e da qui non si muove.** L'HEIC è HEVC dentro un formato a box, e nessun browser tranne Safari ne decodifica uno, quindi questa pagina si porta dietro `libheif` compilato in WebAssembly: circa 1,4 MB, depositati in questo repository, serviti da questa origine e messi in cache dal service worker come ogni altro file di qui. Non viene recuperato da una CDN, perché una CDN metterebbe un terzo sulla strada di ogni visita e impedirebbe allo strumento di funzionare offline. Il binario sta dentro lo script invece che accanto proprio perché per avviarlo non serva nessun fetch.
- **Qui dentro niente va a recuperare niente.** In nessun file scritto per questo strumento c'è un `fetch`, un `XMLHttpRequest` o un `sendBeacon`. Il motore incorporato, come ogni build Emscripten, si porta dentro i percorsi di caricamento che andrebbero a prendere un `.wasm` da un indirizzo; quelle strade non vengono prese, perché il binario è già in mano. E se anche venissero prese, `connect-src` nomina gli endpoint di misurazione di Google e nient'altro, quindi il browser rifiuterebbe. La prova è la policy, non la promessa.
- **I metadati vengono letti qui e riferiti a te.** L'elenco sulla pagina dice cosa porta con sé ogni foto, cioè la data, la fotocamera e se dentro ci sono coordinate GPS, perché è una cosa che potresti voler sapere prima di consegnare il JPEG a qualcuno. Lo legge dal file `src/boxes.js` dentro questo browser, viene mostrato su questa pagina, e poi viene scritto nel tuo JPEG oppure lasciato fuori, esattamente come decidi tu. In questo repository non esiste nessun evento di analytics che porti con sé un nome di file, una data, una coordinata o un conteggio.
- **Cosa carica Google, e cosa non gli arriva.** Gli script della pubblicità e della misurazione arrivano da Google, il pulsante delle donazioni da Buy Me a Coffee. A nessuno di loro viene passato niente sulle tue foto. Ogni riga che legge, decodifica o scrive un file è servita da questa origine ed è elencata nel repository.
- **Funziona offline.** Carica la pagina una volta, stacca la connessione, e lo strumento resta identico, decodificatore compreso, che è in cache insieme a lei. È la prova più semplice che ci sia, e qui vale più che in qualunque altro punto di questo sito: un convertitore che spedisse via le tue foto per decodificarle non ci riuscirebbe in nessun modo.

**Verifica tu stesso.** Niente di quanto sopra va preso per buono. Questa pagina la genera, dai modelli e dalla configurazione del repository, uno script di build che puoi leggere ed eseguire anche tu, e il risultato finisce sul branch `dist`: puoi quindi confrontare quello che viene servito con quello che produce una build dei sorgenti. https://github.com/A-Box-of-Tools/website

I file da leggere per primi sono `config/site.toml` per la Content-Security-Policy, `src/heif.js` per come viene caricato il decodificatore e cosa gli è concesso fare, `src/boxes.js` per l'analisi del contenitore che trova i metadati della foto, e `src/exif.js` per quello che succede a quei metadati mentre entrano in un JPEG. Il motore in sé è `vendor/libheif.js`, non modificato, con la sua licenza accanto.
