# Immagini in video — fare una presentazione in MP4

Trasforma una cartella di immagini in un video.

> Trasforma immagini JPG, PNG o WebP in un video MP4, gratis e interamente dentro il tuo browser. Non viene caricato niente, non serve iscriversi, e funziona offline.

Questa pagina è uno strumento interattivo che funziona interamente nel tuo browser, all'indirizzo https://abox.tools/it/immagini-in-video/ — nulla di ciò che gli affidi viene caricato. Quanto segue è tutto ciò che la pagina dice dello strumento a parole; per usarlo, apri l'indirizzo.

## Qui non si caricano immagini, **mai**. Non c'è nessun server.

Ogni fotogramma lo codifica il tuo browser, e il video viene costruito in memoria su questo dispositivo. L'encoder la rete non la tocca mai, e dall'altra parte di questa pagina non c'è nessun server a cui mandare un'immagine, nemmeno se la toccasse.

- ✗ Niente caricamenti
- ✗ Nessun account
- ✓ Funziona offline
- ✓ Open source
- ✓ I file restano sul tuo dispositivo

## Come trasformare delle immagini in un video

1. **Scegli le immagini.** Trascina una cartella sul riquadro, oppure seleziona i file a mano. Li legge il browser direttamente dal tuo disco, e mentre lo fa non parte niente per nessuna destinazione.
2. **Mettile in ordine e imposta quanto dura ciascuna.** Trascina per riordinare. La durata la puoi dare in fotogrammi o in secondi, e puoi darla per tutte le immagini insieme oppure una alla volta.
3. **Scegli una risoluzione e una frequenza di fotogrammi.** «Segui la risoluzione più alta» va dietro alla tua immagine più grande; i valori pronti coprono 4K, 1080p, 720p, quadrato e verticale, e se nessuno di questi va bene c'è una dimensione personalizzata.
4. **Crea il video e scaricalo.** La codifica gira sul tuo hardware, quindi quanto ci mette dipende dal tuo dispositivo e non da una coda. L'MP4 finito finisce dritto nei download del browser.

## La versione lunga

[Come trasformare una cartella di immagini in un video](https://abox.tools/it/guide/trasformare-immagini-in-un-video/): Fai una presentazione in MP4 con le tue foto: cosa controllano davvero la frequenza dei fotogrammi e la durata, come gestire le immagini della forma sbagliata, e perché il risultato non ha colonna sonora.

## Anche nella cassetta

- [Tagliavideo](https://abox.tools/it/tagliare-video/): Segna i pezzi che vale la pena tenere mentre scorre. Te li ritrovi come un video solo.
- [Ritagliatore di video](https://abox.tools/it/ritagliare-video/): Riduci una clip alla parte che conta.
- [Invertitore di video](https://abox.tools/it/invertire-video/): L'ultimo fotogramma per primo, audio compreso.
- [Creatore di timelapse](https://abox.tools/it/creare-timelapse/): Un'ora di girato in venti secondi.

## Domande

### Le mie immagini vengono caricate da qualche parte?

No. Le tue immagini le legge, le compone e le codifica il tuo browser sul tuo hardware. Questo strumento non ha un lato server, e la `Content-Security-Policy` della pagina elenca tutti gli indirizzi che può contattare, nessuno dei quali appartiene a questo sito. L'unica eccezione è la funzione facoltativa «aggiungi da un indirizzo web», che va a recuperare un'immagine incollata da te, e quel server vede il tuo indirizzo IP.

### Quali formati di immagine posso usare?

Qualunque formato di immagine ferma che il tuo browser sappia decodificare, il che in pratica vuol dire JPG, PNG, WebP, GIF, AVIF e, sui dispositivi Apple, HEIC. Qui non c'è nessun elenco a parte da tenere aggiornato, perché la decodifica è compito del browser e non nostro.

### Che formato video produce?

MP4 con video H.264, che si riproduce praticamente ovunque. In un browser senza WebCodecs lo strumento ripiega sulla registrazione in WebM, cioè le stesse riprese dentro un contenitore che meno programmi di montaggio accettano.

### Posso usarlo per una sequenza di render di Blender o After Effects?

Sì: una sequenza di render numerata è esattamente il motivo per cui esiste. Aggiungi i fotogrammi che ha scritto il tuo renderer, lascia la durata a un fotogramma ciascuno, e imposta la frequenza in modo che corrisponda al render. «Ordina per nome» conta come ti aspetti, quindi `frame_2` finisce prima di `frame_10` e non dopo. \
\
Una cosa da sapere prima di cominciare: l'H.264 un canale alfa non ce l'ha, quindi la trasparenza viene appiattita sul colore di sfondo invece che portata dall'altra parte. Se ti serve tenere l'alfa, componi i fotogrammi nel tuo programma di montaggio.

### Posso fare un timelapse con delle foto?

Sì, ed è lo stesso lavoro di una sequenza di render: tieni ogni foto per un fotogramma solo e scegli una frequenza. A 30 fps ogni trenta foto diventano un secondo di video; a 12 fps quelle stesse foto durano due secondi e mezzo. \
\
«Ordina per data» rimette un rullino nell'ordine in cui è stato scattato, cosa che conta quando i nomi dei file sono ripartiti da 0001. Foto di dimensioni diverse non sono un problema, perché «segui la risoluzione più alta» dimensiona il video in modo che nessuna venga rimpicciolita.

### C'è un limite al numero di immagini o alla durata del video?

Nello strumento non c'è nessun limite. Il tetto pratico è la memoria del tuo dispositivo, perché il video finito viene assemblato lì prima che tu lo scarichi. La prima cosa a sentirlo sono le presentazioni 4K molto lunghe.

### È gratis, e mi serve un account?

È gratis, e non c'è account, non c'è registrazione e non c'è periodo di prova. Il sito ha della pubblicità, ed è quella che lo mantiene; agli annunci non arriva niente sulle tue immagini.

### Funziona offline?

Sì. Carica la pagina una volta, poi stacca la connessione e continua a funzionare. È anche il modo più semplice per dimostrare che non viene caricato niente, perché uno strumento che spedisse via le tue immagini per elaborarle si fermerebbe nell'istante in cui stacchi la spina.

### Posso aggiungere della musica o una colonna sonora?

Non ancora. Lo strumento produce soltanto video: l'MP4 che scrive ha una sola traccia video e nessuna traccia audio. Se ti serve una colonna sonora, aggiungila dopo in un programma di montaggio.

## Come si verifica quello che promette

- **Le tue immagini non hanno dove andare.** La Content-Security-Policy elenca tutti gli indirizzi che questa pagina può contattare, e nessuno di quegli indirizzi appartiene a questo sito. Non esiste un punto di raccolta in cui i tuoi file possano finire, e nel codice non c'è niente che ce li manderebbe se anche esistesse. Prima qui c'era scritto `connect-src 'none'`, che era assoluto; aggiungere la pubblicità è costato quello, e dirlo fa parte del patto.
- **La codifica avviene in locale.** WebCodecs gira dentro il tuo browser e il file finito viene consegnato direttamente a un download. Questa applicazione un lato server non ce l'ha.
- **Cosa carica Google, e cosa non gli arriva.** Gli script della pubblicità e della misurazione arrivano da Google. A nessuno dei due viene passato niente sulle tue immagini: né un file, né una miniatura, né un nome, né una dimensione, né un conteggio. Ogni riga che legge, decodifica, compone o codifica un'immagine è servita da questa origine ed è elencata nel repository.
- **Cosa carica il pulsante delle donazioni, e cosa non gli arriva.** Il pulsante «Buy me a coffee» in cima lo disegna uno script di cdnjs.buymeacoffee.com, che prende i caratteri da Google Fonts. È un link e niente di più: non riferisce nessuna visita, e non gli viene passato niente su di te o sulle tue immagini. Finché non ci clicchi non succede niente, e quello a cui arriveresti è il sito di qualcun altro.
- **Un'eccezione voluta.** Se usi «Aggiungi da un indirizzo web», quel server viene contattato per recuperare l'immagine e vedrà il tuo indirizzo IP. Vengono recuperate solo le immagini che incolli tu, e solo in entrata: `img-src` è aperto, `connect-src` no. Il contatore qui sotto elenca ogni origine esterna contattata.
- **Funziona offline.** Stacca la rete e tutto quello che sta qui continua a funzionare, tranne il caricamento da un indirizzo web. È la prova più semplice che ci sia.

**Verifica tu stesso.** Niente di quanto sopra va preso per buono. Questa pagina la genera, dai modelli e dalla configurazione del repository, uno script di build che puoi leggere ed eseguire anche tu, e il risultato finisce sul branch `dist`: puoi quindi confrontare quello che viene servito con quello che produce una build dei sorgenti. https://github.com/A-Box-of-Tools/website

I file da leggere per primi sono `config/site.toml` per la Content-Security-Policy, e `src/encoder.js` per il ciclo di codifica, che la rete non la tocca mai.
