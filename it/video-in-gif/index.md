# Da video a GIF — convertire un video in una GIF

Scegli il pezzo, la dimensione e la frequenza dei fotogrammi.

> Trasforma un pezzo di un MP4, un MOV o un WebM in una GIF animata. Scegli il pezzo, la larghezza e la frequenza dei fotogrammi: i fotogrammi li legge e la GIF la scrive il tuo browser. Niente caricamenti.

Questa pagina è uno strumento interattivo che funziona interamente nel tuo browser, all'indirizzo https://abox.tools/it/video-in-gif/ — nulla di ciò che gli affidi viene caricato. Quanto segue è tutto ciò che la pagina dice dello strumento a parole; per usarlo, apri l'indirizzo.

## Qui non si caricano video, **mai**. Non c'è nessun server.

Ogni fotogramma viene letto, ridimensionato, quantizzato e scritto dal tuo browser, sul tuo hardware. Qui dentro non c'è niente che sappia recuperare o spedire qualcosa, perché questo strumento non ha proprio nessuna funzione di rete. E dall'altra parte di questa pagina non c'è nessun server a cui mandare un video, anche se una funzione del genere ci fosse.

- ✗ Niente caricamenti
- ✗ Nessun account
- ✗ Nessuna filigrana
- ✓ Qualunque durata
- ✓ Funziona offline

## Come trasformare un video in una GIF

1. **Scegli un video.** Trascina un MP4, un MOV, un M4V o un WebM sul riquadro, oppure selezionane uno a mano. Lo legge il browser direttamente dal tuo disco, e mentre lo fa non parte niente per nessuna destinazione.
2. **Segna il pezzo.** Fai scorrere la clip e premi `I` dove deve cominciare e `O` dove deve finire, oppure trascina le maniglie sulla barra. Una GIF dura qualche secondo, ed è questa l'impostazione che decide se il file sarà leggero o enorme, molto più delle altre due.
3. **Scegli la larghezza e la frequenza dei fotogrammi.** 480 pixel di larghezza e 12 fotogrammi al secondo vanno bene per quasi tutto quello a cui serve una GIF. Dimezzare la larghezza divide i pixel per quattro; e dodici fotogrammi al secondo si leggono come movimento senza farti pagare quelli che nessuno vede.
4. **Falla, e scarica.** I fotogrammi vengono letti, viene scelta una sola tavolozza di 256 colori per tutta l'animazione, e ogni fotogramma viene scritto come la sola parte dell'immagine che è cambiata. Quando è finita si riproduce sulla pagina, ed è lo stesso identico file che ti dà il download.

## La versione lunga

[Come trasformare un video in una GIF](https://abox.tools/it/guide/trasformare-un-video-in-gif/): Quale pezzo, quale larghezza e quale frequenza scegliere, perché una GIF di un video pesa dieci volte il video, e quando usarne una.

## Anche nella cassetta

- [Creatore di GIF](https://abox.tools/it/creare-gif/): Trasforma una serie di immagini in una sola animazione.
- [Divisore di GIF](https://abox.tools/it/dividere-gif-in-fotogrammi/): Ogni fotogramma fuori, nel suo PNG.
- [Analizzatore di GIF](https://abox.tools/it/analizzare-gif/): Fotogrammi, durate, tavolozze e dove è finito ogni byte.
- [Immagini in video](https://abox.tools/it/immagini-in-video/): Trasforma una cartella di immagini in un video.

## Domande

### Il mio video viene caricato da qualche parte?

No. Lo legge, lo campiona e lo converte il tuo browser sul tuo hardware. Questo strumento non ha un lato server, e la `Content-Security-Policy` della pagina elenca tutti gli indirizzi che può contattare, nessuno dei quali appartiene a questo sito. Se preferisci verificare invece che crederci, stacca la connessione e fai una GIF lo stesso.

### Quali formati video posso convertire?

MP4, M4V e MOV vengono letti direttamente, qualunque cosa ci sia dentro: H.264, HEVC, AV1 o VP9, purché il tuo browser sappia decodificare quel codec. Tutto il resto che il browser sa riprodurre, il WebM in primis, viene invece letto portando il lettore su ogni istante, cosa più lenta e un filo meno esatta su quale fotogramma finisca dove. Un file che il browser non sa né leggere né riprodurre, e in pratica sono AVI, WMV, FLV e quasi tutti gli MKV, viene rifiutato con un messaggio che lo dice, invece di piantarsi a metà strada.

### Perché la mia GIF è così pesante?

Perché la GIF è un formato del 1987 che conserva immagini intere invece del movimento. Non c'è modo di farne una da una clip di cinque secondi che sia leggera come l'MP4 di cinque secondi da cui viene: una GIF tratta da un video pesa abitualmente dieci volte il video. Le tre impostazioni che la decidono davvero sono, in quest'ordine, quanto è lungo il pezzo, quanto è larga l'immagine e quanti fotogrammi al secondo. Dimezzare la larghezza divide i pixel per quattro, e sono i pixel a costare.

### Perché solo 256 colori?

È il formato: una GIF porta con sé una tabella di al massimo 256 colori e conserva ogni pixel come un numero che punta lì dentro. Questo strumento sceglie quei 256 contando i colori di ogni fotogramma del tuo pezzo e dividendoli in 256 gruppi con il median cut, che è il metodo classico, così la tavolozza si adatta alla tua clip invece di essere un insieme fisso di colori. Dove un colore manca, il dithering mescola i due più vicini, così una sfumatura resta una sfumatura invece di diventare a strisce.

### Cosa fa l'impostazione del dithering?

Scambia un po' di rumore per molte meno bande. Con il dithering attivo, un cielo che altrimenti diventerebbe quattro fasce piatte resta una sfumatura, al prezzo di una texture leggera e di un file più pesante. Senza, l'immagine è più piatta e il file più leggero, il che va benissimo per le registrazioni dello schermo, i disegni al tratto e qualunque cosa sia già fatta di tinte piatte. Il dithering usato qui è ordinato e non a diffusione dell'errore, così uno sfondo che non cambia resta perfettamente fermo tra un fotogramma e l'altro invece di tremolare.

### C'è un limite alla durata o alla dimensione?

Il limite riguarda il pezzo, ed è dettato dalla memoria e non da una regola: mentre viene scelta la tavolozza ogni suo fotogramma viene tenuto insieme agli altri, quindi la pagina calcola quanto costerebbero le tue impostazioni e te lo dice prima che tu cominci. Piuttosto si rifiuta, che è meglio di una scheda che finisce la memoria e sparisce. Un pezzo più corto, una larghezza minore o una frequenza più bassa lo fanno scendere tutti e tre.

### Tiene l'audio?

Una GIF il suono non lo può portare. Non esiste nessuna versione del formato che abbia l'audio, ed è il motivo principale per cui il web ha sostituito quasi ovunque le GIF con video muti che si ripetono. Se il suono conta, tieni il video: il [tagliavideo](https://abox.tools/it/tagliare-video/) ne ritaglia un pezzo senza ricodificare un fotogramma.

### È gratis, e mi serve un account?

È gratis, e non c'è account, non c'è registrazione, non c'è periodo di prova e non c'è filigrana. Il sito ha della pubblicità, ed è quella che lo mantiene; agli annunci non arriva niente sul tuo video.

## Come si verifica quello che promette

- **I tuoi video non hanno dove andare.** La Content-Security-Policy elenca tutti gli indirizzi che questa pagina può contattare, e nessuno di quegli indirizzi appartiene a questo sito. Non esiste un punto di raccolta in cui il tuo file possa finire, e nel codice non c'è niente che ce lo manderebbe se anche esistesse.
- **Qui dentro niente va a recuperare niente.** Questo strumento non ha proprio nessuna funzione di rete: nessun indirizzo da incollare, niente da scaricare, nessun motore che si scarichi al primo utilizzo. Ogni byte che tocca il tuo video è arrivato da questa origine nel momento in cui si è caricata la pagina.
- **La decodifica avviene in locale.** I fotogrammi passano per WebCodecs dentro il tuo browser, oppure per lo stesso motore di riproduzione che ti mostrerebbe la clip comunque. Quale dei due sia stato usato è scritto in cima alla pagina, perché cambia il modo in cui i fotogrammi vengono scelti e devi poterlo vedere.
- **La GIF viene scritta qui, in codice che puoi leggere.** La tavolozza, il dithering e la compressione LZW sono un seicento righe nella cartella di questo strumento. Non c'è nessun servizio di codifica, non c'è nessuna libreria recuperata all'avvio, e in nessun punto di tutto questo un'immagine potrebbe essere spedita da qualche parte.
- **Cosa carica Google, e cosa non gli arriva.** Gli script della pubblicità e della misurazione arrivano da Google. A nessuno dei due viene passato niente sul tuo video: né un file, né un fotogramma, né un nome, né una dimensione, né una durata, né il pezzo che hai segnato. Ogni riga che legge, campiona, quantizza o codifica è servita da questa origine ed è elencata nel repository.
- **Cosa carica il pulsante delle donazioni, e cosa non gli arriva.** Il pulsante «Buy me a coffee» in cima lo disegna uno script di cdnjs.buymeacoffee.com, che prende i caratteri da Google Fonts. È un link e niente di più: non riferisce nessuna visita, e non gli viene passato niente su di te o sul tuo video.
- **Funziona offline.** Stacca la rete e tutto quello che sta su questa pagina continua a funzionare. È la prova più semplice che ci sia.

**Verifica tu stesso.** Niente di quanto sopra va preso per buono. Questa pagina la genera, dai modelli e dalla configurazione del repository, uno script di build che puoi leggere ed eseguire anche tu, e il risultato finisce sul branch `dist`: puoi quindi confrontare quello che viene servito con quello che produce una build dei sorgenti. https://github.com/A-Box-of-Tools/website

I file da leggere per primi sono `config/site.toml` per la Content-Security-Policy, `src/frames.js` per i due modi in cui i fotogrammi vengono letti da un video, `src/quantize.js` per la tavolozza, e `src/gif.js` per il file in sé, LZW compreso. Nessuno di loro importa qualcosa che sappia fare una richiesta.
