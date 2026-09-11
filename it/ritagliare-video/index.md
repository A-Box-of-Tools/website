# Ritagliare un video — cambiare l'inquadratura online

Riduci una clip alla parte che conta.

> Ritaglia un MP4, un MOV o un WebM in qualunque forma: quadrata, 9:16 o un riquadro di pixel esatto. Gira nel browser, non carica niente, tiene l'audio e funziona offline.

Questa pagina è uno strumento interattivo che funziona interamente nel tuo browser, all'indirizzo https://abox.tools/it/ritagliare-video/ — nulla di ciò che gli affidi viene caricato. Quanto segue è tutto ciò che la pagina dice dello strumento a parole; per usarlo, apri l'indirizzo.

## Qui non si caricano video, **mai**. Non c'è nessun server.

Ogni fotogramma viene decodificato, ritagliato e codificato dal tuo browser, sul tuo hardware. Qui dentro non c'è niente che sappia recuperare o spedire qualcosa, perché questo strumento non ha proprio nessuna funzione di rete. E dall'altra parte di questa pagina non c'è nessun server a cui mandare un video, anche se una funzione del genere ci fosse.

- ✗ Niente caricamenti
- ✗ Nessun account
- ✗ Nessuna filigrana
- ✓ Tiene l'audio
- ✓ Funziona offline

## Come ritagliare un video

1. **Scegli un video.** Trascina un MP4, un MOV, un M4V o un WebM sul riquadro, oppure selezionane uno a mano. Lo legge il browser direttamente dal tuo disco, e mentre lo fa non parte niente per nessuna destinazione.
2. **Trascina il riquadro sulla parte che vuoi tenere.** Trascina al suo interno per spostarlo, e un angolo qualsiasi per ridimensionarlo. Se preferisci, bloccalo prima su una forma, 1:1 per un post quadrato, 9:16 per un telefono, 16:9 per un'inquadratura larga, oppure scrivi un riquadro di pixel esatto nei quattro campi qui sotto. Riproduci il clip, o trascina il cursore qui sotto, per scegliere il fotogramma su cui allinei il riquadro.
3. **Scegli quanta qualità spendere.** L'immagine va codificata di nuovo, perché un fotogramma ritagliato è un'immagine diversa. «Equilibrato» la tiene vicina a quello che il file spendeva già su quella zona, «Massima qualità» spende di più. L'audio resta, a meno che tu non lo tolga.
4. **Ritaglia e scarica.** Il lavoro avviene sul tuo hardware, quindi quanto ci mette dipende dal tuo dispositivo e non da una coda. Il video finito finisce dritto nei download del browser.

## La versione lunga

[Come ritagliare un video in una forma diversa](https://abox.tools/it/guide/ritagliare-un-video/): Riduci una clip a un quadrato, a un verticale 9:16 o a un riquadro di pixel esatto. Quale proporzione vuole ogni piattaforma, perché ritagliare deve ricodificare mentre tagliare no, e quanto costa.

## Anche nella cassetta

- [Invertitore di video](https://abox.tools/it/invertire-video/): L'ultimo fotogramma per primo, audio compreso.
- [Creatore di timelapse](https://abox.tools/it/creare-timelapse/): Un'ora di girato in venti secondi.
- [Estrattore di fotogrammi](https://abox.tools/it/estrarre-fotogramma-video/): Un fermo immagine a piena qualità, da qualsiasi punto.
- [Da video a GIF](https://abox.tools/it/video-in-gif/): Scegli il pezzo, la dimensione e la frequenza dei fotogrammi.

## Domande

### Il mio video viene caricato da qualche parte?

No. Lo legge, lo decodifica, lo ritaglia e lo codifica il tuo browser sul tuo hardware. Questo strumento non ha un lato server, e la `Content-Security-Policy` della pagina elenca tutti gli indirizzi che può contattare, nessuno dei quali appartiene a questo sito. Se preferisci verificare invece che crederci, stacca la connessione e ritaglia una clip lo stesso.

### Quali formati video posso ritagliare?

MP4, M4V e MOV vengono letti direttamente, qualunque cosa ci sia dentro: H.264, HEVC, AV1 o VP9, purché il tuo browser sappia decodificare quel codec. Tutto il resto che il browser sa riprodurre, il WebM in primis, viene invece ritagliato riproducendolo e registrando il risultato, il che funziona ma richiede tanto tempo quanto è lunga la clip. Un file che il browser non sa né leggere né riprodurre, e in pratica sono AVI, WMV, FLV e quasi tutti gli MKV, viene rifiutato con un messaggio che lo dice, invece di piantarsi a metà strada.

### C'è un limite alla dimensione o alla durata del video?

Nello strumento non ce n'è nessuno, e il file non viene letto in memoria tutto insieme, ma percorso qualche megabyte alla volta. Il tetto pratico è il video finito, che viene assemblato in memoria prima che tu lo scarichi, insieme al tempo che il tuo dispositivo impiega a codificarlo.

### L'audio sopravvive?

Con un MP4 sopravvive esattamente com'è: viene copiato campione per campione senza essere mai decodificato, quindi è byte per byte quello che c'era nel file. Quando invece si passa per la registrazione viene catturato dalla riproduzione e ricodificato, e questo costa un po' di qualità. In entrambi i casi c'è una casella per lasciarlo fuori del tutto.

### Ritagliare fa perdere qualità?

L'immagine viene codificata di nuovo, perché un fotogramma ritagliato è un'immagine diversa e non c'è modo di conservarla senza riscrivere i pixel da capo. Quello che lo strumento non fa è spendere più di quanto spendesse l'originale sulla stessa zona, visto che ricodificare al di sopra rende il file solo più pesante senza renderlo più bello.

### Posso anche accorciarlo?

Non qui, ma qui accanto. Questo strumento cambia la forma dell'immagine e nient'altro: la clip che esce è lunga esattamente come quella che è entrata, con i suoi tempi e il suo audio intatti. Accorciare è un lavoro a parte, ed è uno strumento a parte: il [tagliavideo](https://abox.tools/it/tagliare-video/) segna i pezzi di una clip che vale la pena tenere e li salva come un file solo, senza ricodificare un fotogramma.

### Perché larghezza e altezza si muovono di due in due?

L'H.264, il codec dentro un MP4, conserva l'immagine a blocchi e non ha modo di descrivere un fotogramma con un numero dispari di pixel su un lato. Invece di arrotondare in silenzio il tuo ritaglio dopo che l'hai impostato, il riquadro propone fin dall'inizio solo numeri pari.

### È gratis, e mi serve un account?

È gratis, e non c'è account, non c'è registrazione, non c'è periodo di prova e non c'è filigrana. Il sito ha della pubblicità, ed è quella che lo mantiene; agli annunci non arriva niente sul tuo video.

## Come si verifica quello che promette

- **I tuoi video non hanno dove andare.** La Content-Security-Policy elenca tutti gli indirizzi che questa pagina può contattare, e nessuno di quegli indirizzi appartiene a questo sito. Non esiste un punto di raccolta in cui il tuo file possa finire, e nel codice non c'è niente che ce lo manderebbe se anche esistesse.
- **Qui dentro niente va a recuperare niente.** Questo strumento non ha proprio nessuna funzione di rete: nessun indirizzo da incollare, niente da scaricare, nessun motore che si scarichi al primo utilizzo. Ogni byte che tocca il tuo video è arrivato da questa origine nel momento in cui si è caricata la pagina.
- **La decodifica e la codifica avvengono in locale.** I fotogrammi passano per WebCodecs dentro il tuo browser, oppure per lo stesso motore di riproduzione che ti mostrerebbe la clip comunque. Il file finito viene costruito in memoria su questo dispositivo e consegnato direttamente a un download.
- **L'audio viene copiato, non ascoltato.** Quando il file è un MP4, i campioni audio passano dall'altra parte senza essere decodificati per niente: qui dentro non c'è niente che li ritrasformi in suono, e non ci sarebbe niente in grado di passarli da qualche parte nemmeno se lo facesse.
- **Cosa carica Google, e cosa non gli arriva.** Gli script della pubblicità e della misurazione arrivano da Google. A nessuno dei due viene passato niente sul tuo video: né un file, né un fotogramma, né un nome, né una dimensione, né una durata, né la forma in cui l'hai ritagliato. Ogni riga che legge, decodifica, ritaglia o codifica è servita da questa origine ed è elencata nel repository.
- **Cosa carica il pulsante delle donazioni, e cosa non gli arriva.** Il pulsante «Buy me a coffee» in cima lo disegna uno script di cdnjs.buymeacoffee.com, che prende i caratteri da Google Fonts. È un link e niente di più: non riferisce nessuna visita, e non gli viene passato niente su di te o sul tuo video.
- **Funziona offline.** Stacca la rete e tutto quello che sta su questa pagina continua a funzionare. È la prova più semplice che ci sia.

**Verifica tu stesso.** Niente di quanto sopra va preso per buono. Questa pagina la genera, dai modelli e dalla configurazione del repository, uno script di build che puoi leggere ed eseguire anche tu, e il risultato finisce sul branch `dist`: puoi quindi confrontare quello che viene servito con quello che produce una build dei sorgenti. https://github.com/A-Box-of-Tools/website

I file da leggere per primi sono `config/site.toml` per la Content-Security-Policy, `src/shared/mp4-reader.js` per il lettore che trova i fotogrammi dentro un MP4, e `src/transcode.js` per il ciclo che li decodifica, li ritaglia e li codifica. Nessuno dei due importa qualcosa che sappia fare una richiesta.
