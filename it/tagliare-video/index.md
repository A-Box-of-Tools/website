# Tagliare un video — accorciarlo online

Segna i pezzi che vale la pena tenere mentre scorre. Te li ritrovi come un video solo.

> Guarda un video e segna ogni pezzo che vale la pena tenere mentre scorre, poi salva quei pezzi come un file solo. Gira nel browser, non carica niente, non ricodifica niente e funziona offline.

Questa pagina è uno strumento interattivo che funziona interamente nel tuo browser, all'indirizzo https://abox.tools/it/tagliare-video/ — nulla di ciò che gli affidi viene caricato. Quanto segue è tutto ciò che la pagina dice dello strumento a parole; per usarlo, apri l'indirizzo.

## Qui non si caricano video, **mai**. Non c'è nessun server.

Il tuo video viene letto, segnato, tagliato e scritto dal tuo browser, sul tuo hardware. Qui dentro non c'è niente che sappia recuperare o spedire qualcosa, perché questo strumento non ha proprio nessuna funzione di rete. E dall'altra parte di questa pagina non c'è nessun server a cui mandare un video, anche se una funzione del genere ci fosse.

- ✗ Niente caricamenti
- ✗ Nessun account
- ✗ Nessuna filigrana
- ✓ Quanti pezzi vuoi
- ✓ Nessuna qualità persa
- ✓ Funziona offline

## Come tagliare un video

1. **Scegli un video.** Trascina un MP4, un MOV, un M4V o un WebM sul riquadro. Lo legge il browser direttamente dal tuo disco, e mentre lo fa non parte niente per nessuna destinazione. Trascinane parecchi e vengono uniti, nell'ordine in cui li hai messi.
2. **Fallo scorrere, e segna i pezzi che vuoi.** Premi `I` dove un pezzo deve cominciare e `O` dove deve finire, tutte le volte che vuoi: ogni coppia diventa una riga nella tabella qui sotto e una fascia sulla linea del tempo. `U` toglie l'ultima, `Spazio` avvia e mette in pausa, e le frecce saltano di cinque secondi alla volta. Se il momento è difficile da prendere, rallenta la riproduzione.
3. **Sistema i segni.** Ogni riga la puoi riprodurre per conto suo, correggere scrivendoci dentro un tempo esatto, spostare su o giù nell'ordine, oppure cancellare. I due estremi del pezzo selezionato si possono anche trascinare lungo la linea del tempo. Il totale in cima è quanto durerà il video finito.
4. **Tienili, oppure toglili.** Tenere è il verso abituale: il video finito sono i pezzi che hai segnato, uniti in ordine. Toglierli è quell'altro lavoro che si vuole spesso e si trova raramente: segna le pubblicità, i silenzi o le false partenze, e quello che resta viene unito senza di loro.
5. **Taglia, e scarica.** «Tieni ogni byte» sposta i fotogrammi dall'altra parte intatti: è rapido e non può costare qualità, ma ogni pezzo comincia dal fotogramma chiave che precede il tuo segno. «Taglia esattamente qui» decodifica e riscrive l'immagine, così ogni pezzo parte dal fotogramma che hai scelto tu. La pagina ti dice quale dei due stai per ottenere, e quanto costa, prima che tu prema il pulsante.

## La versione lunga

[Come tagliare un video senza ricodificarlo](https://abox.tools/it/guide/tagliare-un-video/): Accorciare una clip non deve costare un solo byte di qualità. Perché a volte un taglio cade prima di dove l'hai segnato, cosa c'entra un fotogramma chiave, e quando accettare una ricodifica.

## Anche nella cassetta

- [Ritagliatore di video](https://abox.tools/it/ritagliare-video/): Riduci una clip alla parte che conta.
- [Invertitore di video](https://abox.tools/it/invertire-video/): L'ultimo fotogramma per primo, audio compreso.
- [Creatore di timelapse](https://abox.tools/it/creare-timelapse/): Un'ora di girato in venti secondi.
- [Estrattore di fotogrammi](https://abox.tools/it/estrarre-fotogramma-video/): Un fermo immagine a piena qualità, da qualsiasi punto.

## Domande

### Il mio video viene caricato da qualche parte?

No. Lo legge, lo segna, lo taglia e lo scrive il tuo browser sul tuo hardware. Questo strumento non ha un lato server, e la `Content-Security-Policy` della pagina elenca tutti gli indirizzi che può contattare, nessuno dei quali appartiene a questo sito. Se preferisci verificare invece che crederci, stacca la connessione e taglia un video lo stesso.

### Posso tenere più pezzi dello stesso video?

È esattamente per questo che esiste. Premi `I` e `O` tutte le volte che vuoi mentre scorre: ogni coppia diventa una riga, e il video finito è ogni riga unita in ordine, con tutto il resto sparito. Quasi tutti i tagliavideo online ti danno una coppia di maniglie e ti chiedono quale unico tratto tenere, il che va benissimo per rifilare l'inizio e la fine di una clip e non serve a niente quando devi guardare un'ora di riprese una volta sola e tenere i sei momenti che valgono.

### Tagliare fa perdere qualità?

Non per la strada normale, e non nel modo che conta. Tagliare non cambia l'aspetto di nessun fotogramma, quindi i fotogrammi vengono spostati nel file nuovo esattamente com'erano: gli stessi byte, le stesse impostazioni dell'encoder, tutto uguale. L'unica strada di qui che ricodifica qualcosa è il taglio esatto, e lo dice sul pulsante.

### Perché un pezzo comincia prima di dove l'ho segnato?

Per come è conservato il video, e solo sui lettori che ignorano una parte standard del formato. Quasi tutti i fotogrammi sono conservati come una descrizione di quanto differiscono dai vicini, quindi senza i vicini non si possono decodificare; solo un fotogramma chiave sta in piedi da solo, e i fotogrammi chiave di solito distano da uno a dieci secondi. Un taglio che copia i fotogrammi deve perciò portarsi dietro la serie a partire dal fotogramma chiave che precede il tuo segno, e nel file scrive *comincia a riprodurre dal tuo segno*, cosa che ogni lettore diffuso rispetta. Se ti serve esatto su qualunque lettore, scegli «Taglia esattamente qui», che ricodifica. La pagina ti dice in quale dei due casi ti trovi, e di quanto, prima che tu esporti.

### Posso invece togliere le pubblicità?

Sì. Segnale, poi scegli «Toglili»: viene unito tutto quello che *non* hai segnato, in ordine. Lo stesso elenco di segni risponde a tutte e due le domande, quindi puoi passare dall'una all'altra e vedere la durata cambiare senza segnare niente due volte.

### Posso salvare i miei segni e riprenderli dopo?

Sì. «Salva i segni» scrive un file di testo semplice, una riga per pezzo con un inizio e una fine separati da una virgola, e «Carica i segni» ne rilegge uno. I formati offerti sono due, secondi semplici e `HH:MM:SS.mmm`, e tutti e due rispettano la disposizione che altri strumenti fatti così usano già, quindi un file scritto qui lo puoi consegnare a uno di quelli e un file scritto là lo puoi trascinare su questa pagina. Segnare è un lavoro paziente, e nessuno dovrebbe doverlo fare due volte.

### Quali formati video posso tagliare?

MP4, M4V e MOV vengono letti direttamente, qualunque cosa ci sia dentro: H.264, HEVC, AV1 o VP9. Copiare i fotogrammi non comporta decodificarli, quindi questa strada funziona anche per un codec per cui il tuo browser non ha proprio nessun decodificatore. Tutto il resto che il browser sa riprodurre, il WebM in primis, viene invece tagliato riproducendolo e registrando il risultato, il che funziona, richiede tanto tempo quanto è lungo il risultato, e può tenere un pezzo solo. Un file che il browser non sa né leggere né riprodurre, e in pratica sono AVI, WMV, FLV e quasi tutti gli MKV, viene rifiutato con un messaggio che lo dice, invece di piantarsi a metà strada.

### C'è un limite alla dimensione o alla durata del video?

Nello strumento non ce n'è nessuno, e sulla strada della copia il file viene letto a malapena: i fotogrammi che tieni vengono puntati invece che caricati, quindi tenere quattro minuti da una registrazione di quattro gigabyte costa più o meno quanto costa scrivere quei quattro minuti sul disco. Il taglio esatto invece percorre il file qualche megabyte alla volta. In tutti e due i casi il tetto pratico è il file finito, che viene assemblato in memoria prima che tu lo scarichi.

### L'audio sopravvive?

Su tutte e due le strade dell'MP4 viene copiato campione per campione senza essere mai decodificato, quindi è byte per byte quello che c'era nel file, e un segno di montaggio tiene ogni pezzo allineato con la sua immagine entro un millesimo di secondo. L'unica eccezione è quando unisci video separati il cui audio è descritto in modo diverso, per esempio con frequenze di campionamento diverse: lì non c'è modo di metterli tutti e due in una traccia sola senza decodificarli, e la pagina te lo dice prima di farlo. Sulla strada della registrazione viene invece catturato dalla riproduzione e ricodificato. In tutti e due i casi c'è una casella per lasciarlo fuori del tutto.

### È gratis, e mi serve un account?

È gratis, e non c'è account, non c'è registrazione, non c'è periodo di prova e non c'è filigrana. Il sito ha della pubblicità, ed è quella che lo mantiene; agli annunci non arriva niente sul tuo video.

## Come si verifica quello che promette

- **I tuoi video non hanno dove andare.** La Content-Security-Policy elenca tutti gli indirizzi che questa pagina può contattare, e nessuno di quegli indirizzi appartiene a questo sito. Non esiste un punto di raccolta in cui il tuo file possa finire, e nel codice non c'è niente che ce lo manderebbe se anche esistesse.
- **Qui dentro niente va a recuperare niente.** Questo strumento non ha proprio nessuna funzione di rete: nessun indirizzo da incollare, niente da scaricare, nessun motore che si scarichi al primo utilizzo. Ogni byte che tocca il tuo video è arrivato da questa origine nel momento in cui si è caricata la pagina.
- **Per la strada normale non viene nemmeno decodificato niente.** Tagliare non cambia l'aspetto di nessun fotogramma, quindi i fotogrammi codificati dei pezzi che hai segnato vengono spostati nel file nuovo esattamente come sono stati trovati. Ognuno viene conservato come una fetta del file che sta sul tuo disco, cioè un appunto che dice quali byte e non i byte stessi, e il tuo browser li legge per la prima volta mentre scrive il download. Qui dentro non c'è niente che ritrasformi mai il tuo video in un'immagine.
- **Il file dei segni viene fatto nella pagina.** Salvare i tuoi segni scrive un file di testo a partire dai numeri già sullo schermo, direttamente nei tuoi download. Caricarne uno lo legge qui. Nessuno dei due si avvicina a una rete, e nessuno dei due porta con sé altro che tempi.
- **L'audio viene copiato, non ascoltato.** Su tutte e due le strade dell'MP4 i campioni audio passano dall'altra parte senza essere decodificati per niente: qui dentro non c'è niente che li ritrasformi in suono, e non ci sarebbe niente in grado di passarli da qualche parte nemmeno se lo facesse.
- **Dove i fotogrammi vengono davvero decodificati, succede qui.** Il taglio esatto, e l'anteprima per un file che questo browser non riproduce, passano per WebCodecs sul tuo dispositivo. È lo stesso decodificatore che ti mostrerebbe il video comunque, e gira nello stesso posto.
- **Cosa carica Google, e cosa non gli arriva.** Gli script della pubblicità e della misurazione arrivano da Google. A nessuno dei due viene passato niente sul tuo video: né un file, né un fotogramma, né un nome, né una dimensione, né una durata, né dove l'hai tagliato. Ogni riga che legge, taglia e scrive è servita da questa origine ed è elencata nel repository.
- **Cosa carica il pulsante delle donazioni, e cosa non gli arriva.** Il pulsante «Buy me a coffee» in cima lo disegna uno script di cdnjs.buymeacoffee.com, che prende i caratteri da Google Fonts. È un link e niente di più: non riferisce nessuna visita, e non gli viene passato niente su di te o sul tuo video.
- **Funziona offline.** Stacca la rete e tutto quello che sta su questa pagina continua a funzionare. È la prova più semplice che ci sia.

**Verifica tu stesso.** Niente di quanto sopra va preso per buono. Questa pagina la genera, dai modelli e dalla configurazione del repository, uno script di build che puoi leggere ed eseguire anche tu, e il risultato finisce sul branch `dist`: puoi quindi confrontare quello che viene servito con quello che produce una build dei sorgenti. https://github.com/A-Box-of-Tools/website

I file da leggere per primi sono `config/site.toml` per la Content-Security-Policy, `src/segments.js` per i segni e il file in cui vengono salvati, `src/shared/mp4-reader.js` per il lettore che trova i fotogrammi dentro un MP4, `src/ranges.js` per l'aritmetica che trasforma un segno in una serie di campioni, e `src/copy.js` per il ciclo che sposta quei campioni nel file nuovo. Nessuno di loro importa qualcosa che sappia fare una richiesta.
