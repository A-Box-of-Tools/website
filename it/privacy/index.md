# Privacy e cookie

La versione corta: i tuoi file non vengono mai caricati, perché non c'è nessun posto dove caricarli. Tutto il resto di questa pagina riguarda la pubblicità, il contatore delle visite e l'hosting, cioè le parti che coinvolgono davvero altre aziende.

Ultimo aggiornamento 3 settembre 2026

## I tuoi file

Ogni strumento di questo sito fa il proprio lavoro dentro il tuo browser, sul tuo hardware. Quando scegli un file, a leggerlo è la pagina che hai già aperto. A noi non viene mandato, perché non esiste un nostro server a cui mandarlo: questo sito è un insieme di file statici, senza backend, senza database e senza archiviazione.

Vuol dire che non riceviamo, non vediamo, non conserviamo, non registriamo e non trattiamo mai:

- i tuoi file, interi o in parte
- miniature o anteprime di essi
- i loro nomi, dimensioni, misure o formati
- quanti ne hai scelti, o cosa ci hai fatto
- niente di quello che ci viene letto dentro, dati EXIF e GPS compresi

Non è una promessa sulle nostre intenzioni. Ogni pagina porta con sé una `Content-Security-Policy` che elenca tutti gli indirizzi che la pagina può contattare, e a farla rispettare è il browser. Nessuno di quegli indirizzi è nostro. Puoi leggere la policy in cima al sorgente di qualunque pagina, oppure aprire il pannello Rete del tuo browser e guardare: non c'è una sola richiesta che porti con sé il tuo file.

I file che produci con uno strumento vengono consegnati al meccanismo di download del tuo browser e salvati dove gli dici tu. Nemmeno in quel passaggio siamo coinvolti.

## L'unica eccezione, e dove vale

Lo strumento [Immagini in video](https://abox.tools/it/immagini-in-video/) ha una funzione «aggiungi da un indirizzo web». Se ci incolli dentro un indirizzo, il tuo browser recupera quell'immagine dal server che hai nominato, e **quel server vede il tuo indirizzo IP** e quale file hai chiesto. È inevitabile, ed è tutta la natura di quella funzione.

Succede solo per gli indirizzi che scrivi tu, è costruita in modo che le immagini possano entrare ma i dati non possano uscire, e la pagina di quello strumento la spiega più nel dettaglio. Nessun altro strumento di questo sito è in grado di fare una richiesta in uscita con dentro qualcosa di tuo.

## Cosa viene raccolto, e da chi

Questo sito è gratuito ed è pagato dalla pubblicità. Vuol dire che su queste pagine girano due prodotti di Google, e su quasi tutte un pulsante per le donazioni. Ecco l'elenco completo.

### Google AdSense — la pubblicità

Google serve gli annunci e decide quali vedi. Per farlo può impostare e leggere cookie o identificatori simili nel tuo browser, e riceve il tuo indirizzo IP, una posizione approssimativa ricavata da esso, il tuo user agent, e su quale pagina eri. A seconda delle tue impostazioni e di dove ti trovi, gli annunci possono essere personalizzati usando un profilo che Google ha su di te, costruito in gran parte a partire dalla tua attività su altri siti.

Noi non riceviamo niente di tutto questo, non lo possiamo vedere, e a Google non mandiamo mai niente sui tuoi file. Il resoconto di Google su come usa i dati dei siti che ospitano la sua pubblicità sta su [policies.google.com/technologies/partner-sites](https://policies.google.com/technologies/partner-sites).

### Google Analytics — il contatore delle visite

Usiamo Google Analytics 4 per contare le visite alle pagine, così sappiamo su quali strumenti vale la pena lavorare. Registra la pagina che hai guardato, all'incirca quando, un identificatore generato a caso e conservato nel tuo browser, una posizione approssimativa, il tipo di dispositivo e di browser, e il sito da cui sei arrivato.

È configurato per non fare nient'altro, e la configurazione è un file che puoi leggere: `analytics.js`, accanto a ogni pagina, imposta un contatore di visualizzazioni e non contiene proprio nessun evento personalizzato. Su questo sito non c'è niente che gli passi un file, un nome di file, una misura o un conteggio, perché qui non c'è codice che saprebbe farlo.

### Buy Me a Coffee — il pulsante delle donazioni

La pagina principale e le pagine degli strumenti hanno un pulsante per le donazioni, che si carica dai server di Buy Me a Coffee. Caricarlo vuol dire che la loro CDN vede il tuo indirizzo IP e che eri su questo sito, e i caratteri del pulsante vengono presi da Google Fonts, che vede anch'essa il tuo indirizzo IP. Non viene mandato nient'altro, e finché non ci clicchi davvero non succede altro; da quel momento sei sul loro sito e sotto le loro condizioni. Questa pagina e la [pagina dei termini](https://abox.tools/it/termini/) il pulsante non lo disegnano.

### Hosting

Il sito è servito da GitHub Pages, dietro Cloudflare. Come qualunque host web, elaborano le richieste che fa il tuo browser, e quindi il tuo indirizzo IP, la pagina richiesta e il tuo user agent, per consegnare la pagina e per tenere il servizio in piedi e al sicuro. Non abbiamo accesso ai registri per singolo visitatore di nessuno dei due.

### Il mediatore dello strumento di condivisione

Uno strumento, [Condividere testo e file](https://abox.tools/it/condividere-testo/), porta testo e file direttamente da un browser all'altro, e una connessione diretta ha bisogno di una presentazione. Così quella pagina, unica del sito, apre un WebSocket verso un piccolo server nostro, che mette insieme i due capi di un nome di link e passa fra loro l'impostazione della connessione. Non vede mai il testo né i file: viaggiano sulla connessione cifrata che ha presentato. Vede il nome di link, quando ciascun lato si connette e se ne va, e gli indirizzi IP, e Cloudflare, che lo fa girare, tiene un registro di ogni connessione per sette giorni. È l'unico registro per singolo visitatore di questo sito che possiamo leggere. La pagina dello strumento lo descrive per intero, e il suo codice completo sta nel repository.

## Cookie

Non impostiamo nessun cookie nostro. Non abbiamo un accesso e non abbiamo una sessione, e c'è una sola preferenza che ci capiti di ricordare.

**La lingua che scegli.** Se scegli una lingua dal selettore, quella scelta viene scritta nella memoria locale del tuo browser, sotto il nome `abox-lang`, così la pagina successiva che apri è nella lingua che hai chiesto. Non è un cookie: non viene mai mandata a noi né a nessun altro, resta sul dispositivo su cui stai leggendo, e cancellare i dati dei siti dal tuo browser la rimuove. Se non scegli mai una lingua non viene scritto proprio niente — una pagina mostrata nella lingua del tuo browser è stata abbinata lì per lì e subito dimenticata.

Ogni cookie o identificatore simile che puoi trovare qui appartiene a Google ed è impostato dagli script pubblicitari e di misurazione descritti sopra. Servono a misurare le visite, e a scegliere e limitare gli annunci.

### Come spegnerlo

- La personalizzazione degli annunci si può disattivare, per tutti i siti in una volta, su [My Ad Center](https://myadcenter.google.com/).
- Google Analytics si può bloccare dappertutto con il [componente aggiuntivo di rinuncia](https://tools.google.com/dlpage/gaoptout) di Google.
- Le impostazioni del tuo browser possono bloccare o cancellare i cookie di terze parti, e qualunque blocca-contenuti impedisce a questi script di caricarsi fin dall'inizio.

Bloccare tutto ci sta benissimo. **Ogni strumento di questo sito funziona con gli script bloccati, e funziona con la rete staccata del tutto.** Qui non c'è niente trattenuto dietro un annuncio.

## I tuoi diritti sui dati

Non abbiamo nessun dato personale su di te, quindi non c'è niente che possiamo mostrarti, correggere, esportare o cancellare: una richiesta fatta a noi, sinceramente, tornerebbe indietro vuota.

I dati descritti sopra sono in mano a Google, che ne è titolare per conto proprio. Le richieste che li riguardano vanno fatte a loro, tramite [il tuo account Google](https://myaccount.google.com/) o i loro contatti per la privacy.

## Minori

Questo sito non si rivolge ai minori e non chiede a nessuno la propria età, perché non chiede niente a nessuno. Non raccogliamo consapevolmente nessun dato personale da chicchessia, di qualunque età.

## Modifiche, e come raggiungerci

Se questa pagina cambia, la data in cima cambia con lei, e la modifica sta nella cronologia pubblica dei commit insieme a tutto il resto.

Le domande su tutto questo possono andare a [hi@abox.tools](mailto:hi@abox.tools), oppure essere aperte come issue sul [repository](https://github.com/A-Box-of-Tools/website), dove la risposta è visibile a chiunque altro se lo stia chiedendo.
