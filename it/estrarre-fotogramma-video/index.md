# Estrarre un fotogramma — salvare un'immagine da un video

Un fermo immagine a piena qualità, da qualsiasi punto.

> Salva qualsiasi fotogramma di un MP4, MOV o WebM come PNG o JPEG a dimensione piena. Avanza fotogramma per fotogramma, oppure prendine uno ogni pochi secondi. Gira nel browser: non viene caricato niente.

Questa pagina è uno strumento interattivo che funziona interamente nel tuo browser, all'indirizzo https://abox.tools/it/estrarre-fotogramma-video/ — nulla di ciò che gli affidi viene caricato. Quanto segue è tutto ciò che la pagina dice dello strumento a parole; per usarlo, apri l'indirizzo.

## Qui non si caricano video, **mai**. Non c'è nessun server.

I fotogrammi li trova, li decodifica e li disegna il tuo browser, sul tuo hardware. Qui non c'è niente che possa scaricare o mandare qualcosa, perché questo strumento non ha proprio nessuna funzione di rete. E anche se ci fosse una via d'uscita, dall'altra parte di questa pagina non c'è nessun server a cui mandare un video.

- ✗ Niente caricamenti
- ✗ Nessun account
- ✗ Nessuna filigrana
- ✓ Risoluzione piena
- ✓ Funziona offline

## Come estrarre un fotogramma da un video

1. **Scegli un video.** Trascina un MP4, MOV, M4V o WebM sul selettore, oppure cercalo a mano. Il browser lo legge direttamente dal tuo disco, e nel frattempo non esce niente da nessuna parte.
2. **Trova il momento.** Riproducilo e fermati dove vuoi, oppure trascina il cursore: su un MP4 il cursore si muove di un fotogramma per scatto, quindi tra quello che vedi e quello che salvi non c'è nessun arrotondamento. Le frecce avanzano di un fotogramma alla volta, e tenendo `Maiusc` di dieci.
3. **Scegli un formato.** Il PNG salva il fotogramma esattamente com'è stato decodificato, ed è questo che qui vuol dire «piena qualità». JPEG e WebP sono più piccoli e sono una seconda compressione sopra quella del video: va benissimo per un'anteprima, non per qualcosa che verrà ritoccato dopo.
4. **Prendine uno, o prendine una serie.** Un fotogramma singolo va dritto nei tuoi download. «Ogni N secondi» percorre il video una volta e prende un fermo immagine a ogni tacca, utile per provini a contatto e miniature, e arrivano in un solo ZIP invece che in cento richieste di salvataggio.

## La versione lunga

[Come salvare un fotogramma di un video come immagine](https://abox.tools/it/guide/estrarre-un-fotogramma-da-un-video/): Tirare fuori un fermo immagine alla risoluzione vera del video: perché uno screenshot del lettore in pausa non è la stessa immagine, in che formato salvarlo e come finire sul fotogramma che si voleva davvero.

## Anche nella cassetta

- [Da video a GIF](https://abox.tools/it/video-in-gif/): Scegli il pezzo, la dimensione e la frequenza dei fotogrammi.
- [Creatore di GIF](https://abox.tools/it/creare-gif/): Trasforma una serie di immagini in una sola animazione.
- [Divisore di GIF](https://abox.tools/it/dividere-gif-in-fotogrammi/): Ogni fotogramma fuori, nel suo PNG.
- [Analizzatore di GIF](https://abox.tools/it/analizzare-gif/): Fotogrammi, durate, tavolozze e dove è finito ogni byte.

## Domande

### Il mio video viene caricato da qualche parte?

No. Lo legge e lo decodifica il tuo browser sul tuo hardware. Questo strumento non ha un lato server, e la `Content-Security-Policy` della pagina elenca ogni indirizzo che può contattare: nessuno appartiene a questo sito. Se preferisci controllare invece che fidarti, stacca la connessione ed estrai un fotogramma lo stesso.

### Cosa vuol dire davvero «piena qualità»?

Due cose. Il fermo immagine viene salvato alla risoluzione del video, non alla dimensione dell'anteprima sulla pagina: da un video 4K esce un'immagine da ⁦3840 x 2160⁩. E scegliendo il PNG, il fotogramma viene salvato esattamente com'è uscito dal decodificatore, quindi il file contiene l'immagine che contiene il video, senza un secondo giro di compressione sopra. Uno screenshot della finestra di un lettore non ti dà né l'una né l'altra cosa: ha la dimensione della finestra ed è preso dopo che il lettore l'ha ridimensionata e le ha applicato la gestione del colore.

### Da quali formati video posso prendere un fotogramma?

MP4, M4V e MOV vengono letti direttamente, qualunque cosa ci sia dentro: H.264, HEVC, AV1 o VP9, purché il tuo browser sappia decodificare quel codec. Quella è la via esatta, dove lo strumento può puntare al singolo fotogramma. Tutto il resto che il tuo browser sa riprodurre, WebM su tutti, viene gestito spostando il lettore e disegnando quello che mostra: salva comunque un'immagine a dimensione piena, ma cade sul fotogramma scelto dal lettore invece che su quello che hai chiesto tu. Un file che il browser non sa né leggere né riprodurre, che in pratica vuol dire AVI, WMV, FLV e quasi tutti gli MKV, viene rifiutato con un messaggio che lo dice.

### Posso avanzare di un fotogramma alla volta?

Su un MP4 sì, ed esattamente: lo strumento legge l'elenco dei fotogrammi del file stesso, quindi le frecce si spostano tra le immagini che ci sono davvero, anche su un video con la cadenza ballerina, dove un passo fisso di un trentesimo di secondo andrebbe alla deriva. Sulla via della riproduzione quell'elenco non c'è, quindi un passo è una spinta di circa un fotogramma, e la pagina lo dice.

### Perché il mio video verticale del telefono qui è dritto?

Perché la rotazione è stata applicata di proposito. Un telefono riprende in orizzontale e scrive un quarto di giro dentro il file invece di ruotare i pixel, quindi il fotogramma che un decodificatore consegna è coricato e ogni lettore lo raddrizza mentre lo porta al tuo schermo. Uno strumento che salta quel passaggio salva un'immagine plausibile del momento giusto, ma di traverso. Questo legge la rotazione dalla traccia e la applica prima di disegnare qualsiasi cosa.

### C'è un limite alla dimensione o alla durata del video?

Nello strumento non c'è nessun limite, e il file non viene letto tutto in memoria in una volta: viene percorso pochi megabyte alla volta, ed è per questo che un video lungo si apre veloce come uno corto. I fermi immagine che prendi restano nella pagina finché non li scarichi, quindi il tetto vero sono qualche centinaio di PNG in 4K, non il video.

### Posso ridimensionare o ritagliare l'immagine dopo?

Qui no, ma qui accanto sì. Questo strumento salva il fotogramma com'è; cambiarne la dimensione o la forma è un lavoro a parte con le sue decisioni dentro, e il [Ridimensionatore di immagini](https://abox.tools/it/ridimensionare-immagine/) fa entrambe le cose, sempre senza caricare niente. Per rendere il file più piccolo senza cambiare l'immagine c'è il [Compressore di immagini](https://abox.tools/it/comprimere-immagine/).

### È gratis, e mi serve un account?

È gratis, e non c'è account, non c'è registrazione, non c'è periodo di prova e non c'è filigrana. Il sito ha della pubblicità, ed è quella che lo mantiene; agli annunci non arriva niente sul tuo video.

## Come si verifica quello che promette

- **I tuoi video non hanno una strada per uscire.** Nella Content-Security-Policy c'è ogni indirizzo che questa pagina può contattare, e non ne appartiene uno a questo sito. Qui non esiste un recapito dove il tuo file possa essere raccolto, e nel codice non c'è niente che lo manderebbe lì se esistesse.
- **Qui niente va a prendere niente.** Questo strumento non ha proprio nessuna funzione di rete: non c'è un indirizzo da incollare, non c'è niente da scaricare, non c'è un motore che arrivi al primo utilizzo. Ogni byte che tocca il tuo video è arrivato da questa origine quando la pagina si è caricata.
- **La decodifica è locale.** I fotogrammi passano da WebCodecs nel tuo browser, oppure dallo stesso motore di riproduzione che ti mostrerebbe il video comunque. L'immagine viene disegnata su una tela di questo dispositivo e consegnata direttamente a un download.
- **Il file viene letto pochi megabyte alla volta.** Un video è l'unico tipo di file qui che non sta in memoria in modo affidabile, quindi non viene mai caricato tutto insieme. Il lettore prende una finestra attorno al fotogramma che hai chiesto, ed è anche il motivo per cui un video da due gigabyte si apre veloce come uno piccolo.
- **Cosa carica Google, e cosa non gli arriva.** Gli script della pubblicità e della misurazione arrivano da Google. A nessuno dei due viene passato niente sul tuo video: né il file, né un fotogramma, né un nome, una dimensione, una durata o il momento su cui ti sei fermato. Ogni riga che legge, decodifica o disegna è servita da questa origine ed è elencata nel repository.
- **Cosa carica il pulsante delle donazioni, e cosa non gli arriva.** Il pulsante «Buy me a coffee» in alto è disegnato da uno script di cdnjs.buymeacoffee.com e prende i caratteri da Google Fonts. Non è niente di più di un collegamento: non segnala nessuna visita e non gli viene passato niente su di te o sul tuo video.
- **Funziona offline.** Stacca la rete e tutto quello che c'è su questa pagina continua a funzionare. È la prova più semplice che ci sia.

**Verifica tu stesso.** Niente di quanto sopra va preso per buono. Questa pagina la genera, dai modelli e dalla configurazione del repository, uno script di build che puoi leggere ed eseguire anche tu, e il risultato finisce sul branch `dist`: puoi quindi confrontare quello che viene servito con quello che produce una build dei sorgenti. https://github.com/A-Box-of-Tools/website

I file da leggere per primi sono `config/site.toml` per la Content-Security-Policy, `src/shared/mp4-reader.js` per il lettore che trova i fotogrammi dentro un MP4 e `src/frames.js` per la parte che decodifica quello che hai chiesto. Nessuno dei due importa qualcosa in grado di fare una richiesta.
