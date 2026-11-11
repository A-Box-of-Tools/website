# Modificare l'audio — invertire, accelerare o alzare una traccia

Riproducila al contrario, cambiale velocità, tira su una registrazione troppo bassa. Tutto qui, sul tuo dispositivo.

> Riproduci una traccia al contrario, accelerala o rallentala, e alza una registrazione troppo bassa. Tira fuori anche l'audio da un video. Gira nel browser, senza caricare niente.

Questa pagina è uno strumento interattivo che funziona interamente nel tuo browser, all'indirizzo https://abox.tools/it/modificare-audio/ — nulla di ciò che gli affidi viene caricato. Quanto segue è tutto ciò che la pagina dice dello strumento a parole; per usarlo, apri l'indirizzo.

## Qui non si caricano registrazioni, **mai**. Non c'è nessun server.

Il tuo file viene letto, modificato e scritto dal tuo browser, sul tuo hardware. Qui dentro non c'è niente che sappia recuperare o spedire qualcosa, perché questo strumento non ha proprio nessuna funzione di rete. E dall'altra parte di questa pagina non c'è nessun server a cui mandare una registrazione, anche se una funzione del genere ci fosse.

- ✗ Niente caricamenti
- ✗ Nessun account
- ✗ Nessuna filigrana
- ✓ Video dentro, audio fuori
- ✓ Funziona offline

## Come modificare un file audio

1. **Scegli un file.** Trascina sul riquadro un file MP3, WAV, FLAC, M4A, Ogg o Opus, oppure un video, se quello che ti serve è il suono che ci sta dentro. Lo legge il browser direttamente dal tuo disco, e mentre lo fa non parte niente per nessuna destinazione.
2. **Girala al contrario, se è per questo che sei venuto.** Una casella sola. I campioni vengono scritti dall'ultimo al primo, il che è esattamente reversibile: fallo due volte e ti ritrovi il file da cui sei partito, campione per campione.
3. **Imposta la velocità.** Trascina il cursore, scrivi un moltiplicatore, oppure premi uno dei valori pronti. Poi scegli cosa succede all'intonazione: puoi tenerla dov'è, che è quello che serve per una lezione a 1,5×, oppure lasciarla muovere con la velocità, che è quello che fa un nastro e che fa salire o scendere una voce.
4. **Imposta il livello.** Puoi indicare una variazione in decibel, oppure chiedere che la registrazione venga tirata su finché il suo momento più forte non sta appena sotto il tetto. La pagina dice dove finirà quel momento prima ancora che tu prema qualcosa, e ti avverte se l'impostazione che hai scelto lo spingerebbe oltre il fondo scala.
5. **Salvala.** Il lavoro avviene sul tuo hardware, quindi quanto ci mette dipende dal tuo dispositivo e non da una coda. Quello che esce è un WAV, cioè i campioni stessi con un'intestazione davanti: prima viene riprodotto sulla pagina, poi finisce dritto nei download del browser.

## La versione lunga

[Come ripulire un memo vocale prima di mandarlo](https://abox.tools/it/guide/ripulire-un-memo-vocale/): Taglia l'aria morta e le false partenze, poi porta il livello quasi a fondo scala. Due strumenti del browser in fila, nell'ordine che conserva la qualità, e la registrazione non lascia mai la tua macchina.

## Anche nella cassetta

- [Unire e dividere PDF](https://abox.tools/it/unire-pdf/): Pagine spostate senza un giro fino a un server.
- [Compressore di PDF](https://abox.tools/it/comprimere-pdf/): Alleggerisci un documento senza spedirlo da nessuna parte.
- [Oscuratore di PDF](https://abox.tools/it/oscurare-pdf/): Le lettere vengono cancellate dal file, e poi il file viene cercato per dimostrarlo.
- [Immagini in PDF](https://abox.tools/it/immagini-in-pdf/): Metti le tue foto dentro un documento solo.

## Domande

### Il mio audio viene caricato da qualche parte?

No. Lo legge, lo modifica e lo scrive il tuo browser sul tuo hardware. Questo strumento non ha un lato server, e la `Content-Security-Policy` della pagina elenca tutti gli indirizzi che può contattare, nessuno dei quali appartiene a questo sito. Se preferisci verificare invece che crederci, stacca la connessione e inverti una traccia lo stesso.

### Posso tirare fuori l'audio da un video?

Sì, e qui è lo stesso identico lavoro che aprire un MP3. Trascina dentro un MP4, un MOV o un WebM e viene decodificata solo la sua traccia audio: l'immagine non viene mai letta, e quello che esce è un file sonoro senza video dentro. Se è tutto quello che vuoi — il suono, così com'è —, allora [Estrarre l'audio da un video](https://abox.tools/it/estrarre-audio-da-video/) fa lo stesso lavoro in una pagina che non ha nient'altro. Torna qui quando anche il suono va cambiato.

### Cambiare la velocità cambia l'intonazione?

Solo se glielo chiedi. «Tieni l'intonazione» taglia la registrazione in finestre sovrapposte lunghe una cinquantina di millisecondi e le riappoggia più vicine o più lontane, scegliendo ogni posizione in modo che le onde si allineino dove si incrociano, e così una voce resta la stessa voce anche a 1,5×. «Lasciala muovere» invece ricampiona, che è quello che succede a riprodurre un nastro più in fretta: al doppio della velocità sale esattamente di un'ottava.

### Perché salva un WAV invece di un MP3?

Perché nessun browser si porta dietro un encoder MP3, e questo strumento si rifiuta di mandare la tua registrazione a un server che ce l'ha. Un WAV di encoder non ne ha bisogno affatto, visto che sono i campioni con un'intestazione di quarantaquattro byte davanti, quindi è insieme l'opzione onesta e l'unica che non può costare qualità. Pesa di più: una decina di megabyte al minuto in stereo. Lo apre qualunque lettore, telefono o editor, e qualunque cosa voglia un MP3 può farsene uno.

### Quali formati posso aprire?

Quelli che il tuo browser decodifica, il che in pratica vuol dire MP3, WAV, FLAC, M4A e AAC, Ogg Vorbis e Opus, più l'audio dentro i video MP4, M4V, MOV e WebM. Quello che resta fuori è il solito elenco corto: AVI, WMA e quasi tutti gli MKV. Un file che questo browser non legge viene rifiutato con un messaggio che lo dice, invece di piantarsi a metà strada.

### Alzando il volume si distorce?

Solo se la porti oltre il fondo scala, e la pagina te lo dice prima che succeda. L'audio digitale ha un tetto rigido: un campione non può essere più forte del fondo scala, quindi tutto quello che sta sopra viene schiacciato contro il tetto, ed è così che suona la distorsione. «Il più forte possibile» è l'impostazione che non può farlo, perché calcola quanto spazio è rimasto alla registrazione e usa esattamente quello. Tutto quello che sta sotto il tetto è una moltiplicazione e nient'altro: alzala di 6 dB, riabbassala di 6 dB, e i campioni sono dove erano partiti.

### Invertire o cambiare velocità fa perdere qualità?

Invertire no: escono gli stessi campioni nell'altro ordine, il che è esatto. Cambiare la velocità sposta ogni campione, quindi è aritmetica e non una copia. Il ricampionatore però filtra come si deve strada facendo, così accelerare non ripiega le note alte verso il basso come un ronzio metallico, e le finestre del time stretch vengono messe dove le onde si allineano invece che dove è capitato all'aritmetica. Nessuna delle due strade ricodifica niente, perché qui non c'è nessun encoder con cui ricodificare.

### C'è un limite alla durata del file?

Nello strumento non ce n'è nessuno. Il tetto pratico è la memoria: tutta la registrazione viene decodificata dentro questa pagina in una volta sola, e il WAV viene assemblato in memoria prima che tu lo scarichi, quindi un'ora di stereo ha bisogno di poco meno di un gigabyte per lavorare. Un WAV da quattro gigabyte viene rifiutato subito, perché il campo delle dimensioni del formato non sa descriverne uno.

### È gratis, e mi serve un account?

È gratis, e non c'è account, non c'è registrazione, non c'è periodo di prova e non c'è filigrana. Il sito ha della pubblicità, ed è quella che lo mantiene; agli annunci non arriva niente sulla tua registrazione.

## Come si verifica quello che promette

- **Le tue registrazioni non hanno dove andare.** La Content-Security-Policy elenca tutti gli indirizzi che questa pagina può contattare, e nessuno di quegli indirizzi appartiene a questo sito. Non esiste un punto di raccolta in cui il tuo file possa finire, e nel codice non c'è niente che ce lo manderebbe se anche esistesse.
- **Qui dentro niente va a recuperare niente.** Questo strumento non ha proprio nessuna funzione di rete: nessun indirizzo da incollare, niente da scaricare, nessun motore che si scarichi al primo utilizzo. Ogni byte che tocca il tuo audio è arrivato da questa origine nel momento in cui si è caricata la pagina.
- **Il decodificatore è quello che hai già nel browser.** Il file viene consegnato a `decodeAudioData`, lo stesso codice che riproduce una traccia dentro un elemento `<audio>`. Qui non arriva niente per leggere il tuo formato, e per leggerlo non si chiede niente a niente che stia fuori da questa pagina.
- **L'immagine di un video non viene mai decodificata.** Quando trascini qui dentro un video, viene chiesta soltanto la sua traccia audio. I fotogrammi non vengono letti, né decodificati, né disegnati, né guardati: su questa pagina non c'è codice che saprebbe farlo, e il file che esce contiene suono e nient'altro.
- **I campioni vengono scritti, non ricodificati.** Un WAV sono i campioni che questa pagina ha calcolato, con un'intestazione davanti. Nel ciclo non c'è nessun encoder che prenda decisioni sulla tua registrazione, e non c'è niente che si possa chiamare caricamento su cui farne avvenire uno.
- **Cosa carica Google, e cosa non gli arriva.** Gli script della pubblicità e della misurazione arrivano da Google. A nessuno dei due viene passato niente sulla tua registrazione: né un file, né un campione, né un nome, né una dimensione, né una durata, né quanto era forte. Ogni riga che legge, modifica e scrive è servita da questa origine ed è elencata nel repository.
- **Cosa carica il pulsante delle donazioni, e cosa non gli arriva.** Il pulsante «Buy me a coffee» in cima lo disegna uno script di cdnjs.buymeacoffee.com, che prende i caratteri da Google Fonts. È un link e niente di più: non riferisce nessuna visita, e non gli viene passato niente su di te o sul tuo file.
- **Funziona offline.** Stacca la rete e tutto quello che sta su questa pagina continua a funzionare. È la prova più semplice che ci sia.

**Verifica tu stesso.** Niente di quanto sopra va preso per buono. Questa pagina la genera, dai modelli e dalla configurazione del repository, uno script di build che puoi leggere ed eseguire anche tu, e il risultato finisce sul branch `dist`: puoi quindi confrontare quello che viene servito con quello che produce una build dei sorgenti. https://github.com/A-Box-of-Tools/website

I file da leggere per primi sono `config/site.toml` per la Content-Security-Policy, `src/shared/audio-decode.js` per le venti righe che consegnano il tuo file al decodificatore del browser, `src/stretch.js` per il time stretch, `src/speed.js` per il ricampionatore, e `src/shared/wav.js` per l'intestazione che va davanti ai campioni. Nessuno di loro importa qualcosa che sappia fare una richiesta.
