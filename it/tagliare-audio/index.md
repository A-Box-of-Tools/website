# Tagliare l'audio — tagliare una registrazione online

Segna al volo i pezzi che valgono. Tornano in un file solo, tagliato dove hai detto tu.

> Riproduci una registrazione e segna al volo ogni pezzo che vale la pena tenere, poi salva quei pezzi in un unico file. Tagli esatti al campione, nessun clic ai punti di giunzione, niente caricamenti.

Questa pagina è uno strumento interattivo che funziona interamente nel tuo browser, all'indirizzo https://abox.tools/it/tagliare-audio/ — nulla di ciò che gli affidi viene caricato. Quanto segue è tutto ciò che la pagina dice dello strumento a parole; per usarlo, apri l'indirizzo.

## Qui non si caricano registrazioni, **mai**. Non c'è nessun server.

La tua registrazione viene letta, segnata, tagliata e scritta dal tuo browser, sul tuo hardware. Qui non c'è niente che possa scaricare o mandare qualcosa, perché questo strumento non ha proprio nessuna funzione di rete. E anche se ci fosse una via d'uscita, dall'altra parte di questa pagina non c'è nessun server a cui mandare una registrazione.

- ✗ Niente caricamenti
- ✗ Nessun account
- ✗ Nessuna filigrana
- ✓ Quanti pezzi vuoi
- ✓ Taglia esattamente dove hai segnato
- ✓ Funziona offline

## Come tagliare un file audio

1. **Scegli una registrazione.** Trascina un file MP3, WAV, FLAC, M4A, Ogg o Opus sul selettore, oppure un video, se quello che ti serve è un pezzo del suo audio. Il browser lo legge direttamente dal tuo disco e lo disegna come forma d'onda; nel frattempo non esce niente da nessuna parte.
2. **Riproducila e segna i pezzi che vuoi.** Premi `I` dove un pezzo deve cominciare e `O` dove deve finire. Fallo quante volte vuoi: ogni coppia diventa una riga nella tabella qui sotto e una banda sulla forma d'onda. `U` annulla l'ultima, `Spazio` riproduce e mette in pausa, le frecce saltano cinque secondi, e tenendo `Maiusc` si spostano di dieci millisecondi. Rallenta la riproduzione se il momento è difficile da prendere.
3. **Sistema i segni.** Ogni riga si può riascoltare da sola, ritoccare scrivendoci dentro un tempo esatto, spostare su o giù nell'ordine, o cancellare. Le due estremità del pezzo selezionato si possono anche trascinare lungo la forma d'onda, ed è il modo più rapido per mettere un segno sul silenzio invece che sul respiro che lo precede. Il totale in alto è la durata che avrà la registrazione finita.
4. **Tienili, oppure toglili.** Tenerli è il verso solito: la registrazione finita sono i pezzi che hai segnato, uniti in ordine. Toglierli è l'altro lavoro che la gente vuole e trova di rado: segna gli «ehm», il telefono che squilla o le false partenze, e quello che resta viene unito senza di loro.
5. **Taglia e scarica.** Ogni taglio cade sul campione che hai segnato; qui non c'è nessun arrotondamento a un fotogramma chiave, perché il suono non ne ha. L'unica cosa che vale la pena scegliere è quanta dissolvenza mettere su ogni giunzione: cinque millisecondi bastano a evitare un clic e sono troppo pochi per sentirsi come una dissolvenza. Quello che esce è un WAV, riprodotto prima sulla pagina e poi consegnato dritto ai download del tuo browser.

## La versione lunga

[Come tagliare l'audio senza perdere qualità](https://abox.tools/it/guide/tagliare-un-file-audio/): Dove cade davvero un taglio audio, perché può essere esatto quando quello video non può, perché a volte una giunzione fa click, e cosa sta facendo davvero una dissolvenza di cinque millesimi di secondo.

## Anche nella cassetta

- [Editor audio](https://abox.tools/it/modificare-audio/): Riproducila al contrario, cambiale velocità, tira su una registrazione troppo bassa. Tutto qui, sul tuo dispositivo.
- [Unire e dividere PDF](https://abox.tools/it/unire-pdf/): Pagine spostate senza un giro fino a un server.
- [Compressore di PDF](https://abox.tools/it/comprimere-pdf/): Alleggerisci un documento senza spedirlo da nessuna parte.
- [Oscuratore di PDF](https://abox.tools/it/oscurare-pdf/): Le lettere vengono cancellate dal file, e poi il file viene cercato per dimostrarlo.

## Domande

### Il mio audio viene caricato da qualche parte?

No. Lo legge, lo segna, lo taglia e lo scrive il tuo browser sul tuo hardware. Questo strumento non ha un lato server, e la `Content-Security-Policy` della pagina elenca ogni indirizzo che può contattare: nessuno appartiene a questo sito. Se preferisci controllare invece che fidarti, stacca la connessione e taglia una registrazione lo stesso.

### Posso tenere più pezzi della stessa registrazione?

È esattamente a questo che serve. Premi `I` e `O` quante volte vuoi mentre suona; ogni coppia diventa una riga, e il file finito è ogni riga unita in ordine, con tutto il resto sparito. Quasi tutti i taglierini online ti danno una coppia di maniglie e ti chiedono quale singolo tratto tenere: va benissimo per spuntare un jingle davanti e dietro, e non serve a niente per ascoltare un'ora di intervista una volta sola e tenere le sei risposte che valgono.

### Il taglio cade esattamente dove l'ho segnato?

Sì, su ogni pezzo e in qualsiasi lettore. Questo è l'unico punto in cui l'audio è più semplice del video: una registrazione decodificata è una serie di numeri e ognuno sta in piedi da solo, quindi non esiste l'equivalente di un fotogramma chiave a cui arrotondare e non c'è motivo perché un taglio cominci in anticipo. La pagina mostra il numero di campione da cui parte il risultato, cioè il segno che hai fatto moltiplicato per la frequenza di campionamento e arrotondato al campione intero più vicino.

### Perché una giunzione dovrebbe fare clic, e a cosa serve la dissolvenza?

Perché tagliare dalla metà di una parola alla metà di un'altra mette due forme d'onda che non c'entrano niente una accanto all'altra, e un altoparlante a cui si chiede di saltare tra le due fa un clic. Non è un difetto del taglio: è così che suona una discontinuità. Il rimedio è una dissolvenza di pochi millisecondi da entrambe le parti di ogni giunzione: abbastanza lunga perché il cono ci arrivi, troppo corta per sentirsi come una dissolvenza. Cinque millisecondi è il valore di partenza e si può togliere. La dissolvenza viene messa solo su un bordo che è davvero un taglio, quindi un bordo proprio all'inizio o alla fine della registrazione resta esattamente com'era.

### Posso invece togliere i pezzi brutti?

Sì. Segnali, poi scegli «Toglili»: tutto quello che *non* hai segnato viene unito al posto loro, in ordine. Lo stesso elenco di segni risponde a entrambe le domande, quindi puoi passare dall'uno all'altro e vedere la durata cambiare senza segnare niente due volte.

### Posso salvare i segni e riprenderli dopo?

Sì. «Salva i segni» scrive un file di testo semplice, una riga per pezzo, con inizio e fine separati da una virgola, e «Carica i segni» ne rilegge uno. Vengono offerti due formati, secondi semplici e `HH:MM:SS.mmm`, e tutti e due sono la disposizione che scrive il taglierino per video di questo sito, quindi un file fatto sul video si può trascinare sul suo audio e viceversa. Segnare è un lavoro di precisione e nessuno dovrebbe doverlo fare due volte.

### Quali formati posso aprire?

Tutto quello che il tuo browser decodifica, che in pratica vuol dire MP3, WAV, FLAC, M4A e AAC, Ogg Vorbis e Opus, e l'audio dentro i video MP4, M4V, MOV e WebM. Quello che resta fuori è lo stesso elenchino di sempre: AVI, WMA e quasi tutti gli MKV. Un file che questo browser non riesce a leggere viene rifiutato con un messaggio che lo dice, invece di fallire a metà strada.

### Perché salva un WAV invece di un MP3?

Perché nessun browser porta con sé un codificatore MP3, e questo strumento si rifiuta di mandare la tua registrazione a un server che ce l'ha. Un WAV non ha bisogno di nessun codificatore, sono i campioni con una breve intestazione davanti, quindi è insieme l'opzione onesta e l'unica che non possa costare qualità all'uscita. È più grande: circa dieci megabyte al minuto in stereo. Lo apre qualunque lettore, telefono o programma di montaggio, e chi vuole un MP3 può ricavarlo da lì. Tagliare un MP3 copiandone i frame terrebbe il file piccolo, ma sposterebbe anche ogni taglio al confine di frame più vicino, che è proprio l'arrotondamento che questo strumento esiste per non fare.

### C'è un limite alla durata della registrazione?

Nello strumento non c'è nessun limite. Il tetto vero è la memoria: tutta la registrazione viene decodificata dentro questa pagina in una volta sola, e il WAV viene assemblato in memoria prima che tu lo scarichi, quindi un'ora di stereo ha bisogno di poco meno di un gigabyte per lavorare. Un WAV da quattro gigabyte viene rifiutato del tutto, perché il campo della dimensione del formato stesso non riesce a descriverlo.

### È gratis, e mi serve un account?

È gratis, e non c'è account, non c'è registrazione, non c'è periodo di prova e non c'è filigrana. Il sito ha della pubblicità, ed è quella che lo mantiene; agli annunci non arriva niente sulla tua registrazione.

## Come si verifica quello che promette

- **Le tue registrazioni non hanno una strada per uscire.** Nella Content-Security-Policy c'è ogni indirizzo che questa pagina può contattare, e non ne appartiene uno a questo sito. Qui non esiste un recapito dove il tuo file possa essere raccolto, e nel codice non c'è niente che lo manderebbe lì se esistesse.
- **Qui niente va a prendere niente.** Questo strumento non ha proprio nessuna funzione di rete: non c'è un indirizzo da incollare, non c'è niente da scaricare, non c'è un motore che arrivi al primo utilizzo. Ogni byte che tocca il tuo audio è arrivato da questa origine quando la pagina si è caricata.
- **Il decodificatore è quello che il tuo browser ha già.** Il file viene passato a `decodeAudioData`, lo stesso codice che riproduce una traccia in un elemento `<audio>`. Qui non viene spedito niente per leggere il tuo formato, e per leggerlo non viene chiesto niente nemmeno a qualcosa fuori da questa pagina.
- **L'immagine di un video non viene mai decodificata.** Quando trascini dentro un video, viene chiesta solo la sua traccia audio. I fotogrammi non vengono letti, non decodificati, non disegnati e nemmeno guardati: su questa pagina non c'è codice che potrebbe farlo, e il file che esce contiene suono e niente altro.
- **Il taglio è una copia, in memoria, su questo dispositivo.** Tagliare è un `set` per pezzo e per canale: i campioni che hai tenuto vengono spostati in un nuovo array nell'ordine in cui li hai messi. Gli unici campioni moltiplicati per qualcosa sono le poche centinaia dentro ogni dissolvenza, e la pagina ti dice quanti sono prima che tu prema il pulsante.
- **I campioni vengono scritti, non ricodificati.** Un WAV sono i campioni che questa pagina ha in mano, con un'intestazione davanti. Nel ciclo non c'è nessun codificatore che prenda decisioni sulla tua registrazione, e non c'è niente che si possa chiamare caricamento su cui una cosa del genere possa succedere.
- **Il file dei segni viene fatto nella pagina.** Salvare i tuoi segni scrive un file di testo a partire dai numeri già a schermo, dritto nei tuoi download. Caricarne uno lo legge qui. Né l'uno né l'altro si avvicina a una rete, e nessuno dei due porta altro che tempi.
- **Cosa carica Google, e cosa non gli arriva.** Gli script della pubblicità e della misurazione arrivano da Google. A nessuno dei due viene passato niente sulla tua registrazione: né il file, né un campione, né un nome, una dimensione, una durata o il punto in cui hai tagliato. Ogni riga che legge, taglia e scrive è servita da questa origine ed è elencata nel repository.
- **Cosa carica il pulsante delle donazioni, e cosa non gli arriva.** Il pulsante «Buy me a coffee» in alto è disegnato da uno script di cdnjs.buymeacoffee.com e prende i caratteri da Google Fonts. Non è niente di più di un collegamento: non segnala nessuna visita e non gli viene passato niente su di te o sulla tua registrazione.
- **Funziona offline.** Stacca la rete e tutto quello che c'è su questa pagina continua a funzionare. È la prova più semplice che ci sia.

**Verifica tu stesso.** Niente di quanto sopra va preso per buono. Questa pagina la genera, dai modelli e dalla configurazione del repository, uno script di build che puoi leggere ed eseguire anche tu, e il risultato finisce sul branch `dist`: puoi quindi confrontare quello che viene servito con quello che produce una build dei sorgenti. https://github.com/A-Box-of-Tools/website

I file da leggere per primi sono `config/site.toml` per la Content-Security-Policy, `src/segments.js` per i segni e il file in cui vengono salvati, `src/shared/audio-decode.js` per le venti righe che passano il tuo file al decodificatore del browser, `src/trim.js` per i conti che trasformano un segno in una serie di campioni e per il ciclo che li copia, e `src/shared/wav.js` per l'intestazione che va davanti. Nessuno di loro importa qualcosa in grado di fare una richiesta.
