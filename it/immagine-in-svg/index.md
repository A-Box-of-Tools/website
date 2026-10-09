# Immagine in SVG — ricalcare un logo, uno stencil o una silhouette in curve

Una forma, un contorno. Indica quello che non dovrebbe esserci.

> Ricalca un'immagine in bianco e nero in un vero contorno SVG, nel browser. Loghi, stencil, firme, disegni al tratto e silhouette diventano curve che puoi scalare a qualsiasi dimensione. Un clic toglie quello che il ricalco ha preso di troppo. Non viene caricato niente.

Questa pagina è uno strumento interattivo che funziona interamente nel tuo browser, all'indirizzo https://abox.tools/it/immagine-in-svg/ — nulla di ciò che gli affidi viene caricato. Quanto segue è tutto ciò che la pagina dice dello strumento a parole; per usarlo, apri l'indirizzo.

## Qui non si caricano immagini, **mai**. Non c'è nessun server.

L'immagine viene letta dal disco dal tuo browser, ridotta a un bit per pixel da `src/mask.js`, percorsa lungo il bordo da `src/contour.js` e rivestita di curve da `src/fit.js` — circa seicento righe che puoi leggere, senza nessun motore dietro e niente da scaricare per farle girare. Questo strumento non ha nessuna funzione di rete: niente da prendere, niente da mandare, e nessun server dall'altra parte di questa pagina a cui mandare un disegno anche se ci fosse.

- ✗ Nessun caricamento
- ✗ Nessun account
- ✗ Nessuna filigrana
- ✓ Funziona offline
- ✓ Open source

## Come ricalcare un'immagine in un SVG senza caricarla

1. **Scegli l'immagine.** Un logo, uno stencil, una firma, un timbro, un disegno scansionato, una silhouette. Qualsiasi cosa con una forma chiara dentro si ricalca bene; la foto di una stanza no, e più in basso c'è un avviso chiaro invece di una sorpresa alla fine. Il file viene letto direttamente dal tuo disco e intanto niente viene mandato da nessuna parte.
2. **Di' che cos'è la forma.** Un disegno su carta si separa per **chiaro e scuro**, e il livello viene calcolato per te. La foto di un oggetto no — una figura rosso scuro su pietra grigio scuro è scuro su scuro, e nessuna luminosità le separa. Quella vuole **il soggetto**, che impara che cos'è lo sfondo da una fascia lungo il bordo dell'immagine e tiene tutto quello che non lo è.
3. **Guarda la linea rossa, non le impostazioni.** Il contorno viene disegnato sopra i pixel da cui è venuto, perché è l'unico posto in cui la questione si può decidere: un contorno è giusto o sbagliato rispetto a quei pixel e a nient'altro. Trascina una delle due immagini per spostarle entrambe, e gira la rotellina per ingrandire abbastanza da vedere cosa fa davvero la linea.
4. **Togli con un clic quello che non dovrebbe esserci.** Un puntino, una graffetta, un timbro, una didascalia, un'ombra. Un clic prende tutta la macchia di quel colore invece di un pixel, quindi stai indicando una forma; cliccala di nuovo per rimetterla. Cliccare un pezzo di sfondo chiuso lo riempie invece, ed è così che un buco che non dovrebbe essere un buco si chiude.
5. **Regola la levigatura solo se serve.** *Dettaglio* è quanto la linea può allontanarsi dai pixel mentre viene semplificata, e viene calcolato per forma a meno che tu non dica altrimenti. *Nettezza degli angoli* decide quanto il contorno deve girare perché quella svolta resti un angolo invece di venire arrotondata. La maggior parte delle immagini non ha bisogno di toccare né l'uno né l'altra.
6. **Prendi l'SVG.** Un file, un solo `<path>`, nessuna regola di riempimento di cui preoccuparsi: i contorni girano in un verso e i buchi nell'altro, ed è questo che fa di una forma con quaranta buchi un solo elemento. Si apre in Illustrator, Inkscape, Figma, un browser e una macchina da taglio.

## La versione lunga

[Come ricalcare un'immagine in un SVG](https://abox.tools/it/guide/convertire-un-immagine-in-svg/): Trasforma un logo, uno stencil, una firma o una silhouette in un vero contorno vettoriale nel browser. Quali immagini si ricalcano bene, quali non lo faranno mai, e come sistemare le parti che il ricalco sbaglia.

## Anche nella cassetta

- [Confronto di altezze](https://abox.tools/it/confrontare-altezze/): Scrivi le altezze, portati via l'immagine. Per disegnarla non viene mandato niente.
- [Compressore di immagini](https://abox.tools/it/comprimere-immagine/): La dimensione la dici tu. Il resto lo calcola lui.
- [Ridimensionatore di immagini](https://abox.tools/it/ridimensionare-immagine/): Di' la dimensione, disegna il riquadro, scegli il formato.
- [Da HEIC a JPG](https://abox.tools/it/heic-in-jpg/): Le foto che fa un iPhone, in un formato che apre chiunque.

## Domande

### La mia immagine viene caricata da qualche parte?

No. Il file viene letto dal tuo browser sul tuo hardware, ricalcato da poche centinaia di righe di JavaScript servite da questa origine, e restituito come download. Questo strumento non ha nessuna funzione di rete — non va mai a prendere niente e non manda mai niente — e la `Content-Security-Policy` della pagina elenca ogni indirizzo che può contattare, nessuno dei quali appartiene a questo sito.

### Trasformerà la mia fotografia in un SVG?

Non in modo utile, e la pagina te lo dirà invece di lasciartelo scoprire dopo il download. Il ricalco trasforma ogni macchia di colore simile in una forma a sé, quindi una fotografia torna come migliaia di chiazze sovrapposte e un file molte volte più grande del JPEG, che si apre lentamente e non somiglia alla fotografia. Quello che si ricalca bene è un'immagine con una *forma* dentro: un logo, uno stencil, una firma, un disegno al tratto, una silhouette. Per la fotografia di un solo oggetto, l'impostazione *il soggetto* lo ritaglierà come un'unica silhouette piena, che è una cosa diversa e davvero utile.

### Qual è la differenza tra i due modi di trovare la forma?

La domanda che fanno. **Chiaro e scuro** chiede se ogni pixel è più scuro di un livello, che è esattamente giusto per inchiostro su carta e inutile quando il soggetto e lo sfondo sono ugualmente scuri. **Il soggetto** chiede che cos'è lo sfondo — lo impara da una fascia lungo il bordo dell'immagine, misura ogni pixel rispetto a quello e tiene la cosa più grande che non lo è. Funziona sulla fotografia di un oggetto su uno sfondo più o meno uniforme, e fallisce su un'immagine ritagliata così stretta che il soggetto esce da tre lati, perché i bordi da cui impara sono allora il soggetto stesso. Quando succede, puoi indicare tu lo sfondo al suo posto.

### Perché la forma ricalcata ha dei buchi, o perde le parti sottili?

Perché li aveva l'immagine, una volta diventata un bit per pixel. Attiva *cosa ha ricevuto il ricalco* per vederlo: sotto circa dodici pixel l'occhio di una lettera si è già riempito e le sue aste si sono già fuse, e nessun ricalco recupera un buco che non c'è. I rimedi stanno a monte — sposta la soglia, o parti da una scansione più grande. In modalità *il soggetto*, *chiudi i vuoti fino a* sigilla i buchi piccoli e *riempilo tutto* chiude ogni buco che lo sfondo non riesce a raggiungere dal bordo dell'immagine.

### Posso sistemare le parti che ha sbagliato?

Sì, ed è a questo che serve quasi tutto il terzo passo. Clicca qualsiasi cosa che non dovrebbe stare nel disegno e sparisce; cliccala di nuovo e torna. Un clic prende tutta la macchia di quel colore, quindi un clic toglie un puntino intero o un timbro intero invece di un pixel. Cliccare un pezzo di sfondo chiuso lo riempie. Le correzioni vengono tenute separate dalla soglia, quindi spostare il cursore dopo non le butta via.

### Quanto sarà grande l'SVG?

Per una forma, meno dell'immagine: una silhouette ricalcata di solito pesa da uno a cinque kilobyte, e un logo qualcuno in più. La pagina te lo dice esattamente, accanto al download. Per una fotografia sarà enorme, che è il segno più chiaro che è lo strumento sbagliato per quel file — e la pagina smette di disegnare e lo dice oltre circa un migliaio di forme separate.

### Ricalca a colori?

No. Questo fa una forma di un solo colore, che è il caso che viene fuori come un disegno invece che come una brutta fotocopia. Ricalcare a colori vuol dire quantizzare a pochi colori e ricalcare ciascuno come un livello a sé, e il risultato delude quasi tutti quelli che lo chiedono. Se ti serve il colore, ricalca la forma qui e riempila nel tuo programma di disegno.

### Cosa posso fare con l'SVG dopo?

Scalarlo a qualsiasi dimensione senza che diventi sfocato, ricolorarlo con un solo attributo, animarlo, stamparlo, o mandarlo a una macchina da taglio o a un laser. È un solo `<path>` senza regola di riempimento da sbagliare, quindi Illustrator, Inkscape, Figma, un browser e quasi tutti i software CNC lo leggono allo stesso modo.

### C'è un limite alla dimensione dell'immagine?

Quello della tua macchina, non il nostro. Una pagina A4 scansionata a 300 dpi — circa nove megapixel — si ricalca in una frazione di secondo. Le immagini più grandi funzionano; ci mettono solo di più, e il lavoro avviene sul tuo processore invece che in una coda da qualche parte.

### È gratis, e mi serve un account?

È gratis, e non c'è nessun account, nessun accesso, nessuna prova e nessuna filigrana. Non c'è nemmeno un limite al numero o alla dimensione dei file, perché non c'è nessun server che li paga — il lavoro avviene sulla tua macchina. Il sito ha della pubblicità, ed è quella che lo paga; agli annunci non viene dato niente sui tuoi file.

### Funziona offline?

Sì. Carica la pagina una volta, poi stacca internet e continua a funzionare. È anche il modo più semplice per dimostrare che non viene caricato niente: uno strumento che mandasse via la tua immagine per ricalcarla si fermerebbe nel momento in cui stacchi la spina.

## Come si verifica quello che promette

- **La tua immagine non ha nessun posto dove andare.** La Content-Security-Policy elenca ogni indirizzo che questa pagina può contattare, e nessuno appartiene a questo sito. Non c'è nessun punto qui in cui i tuoi file potrebbero venire raccolti, e niente nel codice che li manderebbe lì se ci fosse.
- **Niente qui va a prendere niente.** Non c'è nessun `fetch`, nessun `XMLHttpRequest` e nessun `sendBeacon` da nessuna parte in `src/`. Lo strumento intero è aritmetica sui pixel di una sola immagine: una soglia, un giro lungo il bordo di quello che ha trovato, e un po' di adattamento di curve.
- **Non c'è nessun motore da scaricare.** Il ricalco di solito è il programma di qualcun altro, e sul web significa parecchi megabyte di codice compilato che arrivano prima del primo clic. Qui non c'è niente del genere. Il tutto sono poche centinaia di righe di JavaScript normale servite da questa origine, ed è anche per questo che la pagina funziona nel momento in cui si apre invece che dopo un'attesa.
- **Cosa carica Google, e cosa non gli viene dato.** Gli script di pubblicità e misurazione vengono da Google, e il pulsante per le donazioni da Buy Me a Coffee. A nessuno di loro viene passato niente sulla tua immagine. Ogni riga che la legge, la soglia o la ricalca è servita da questa origine ed è nel repository.
- **Funziona offline.** Stacca la rete e lo strumento è identico, perché non c'è mai stato un passaggio di rete dentro. È la prova più semplice di tutte.

**Verifica tu stesso.** Niente di quanto sopra va preso per buono. Questa pagina la genera, dai modelli e dalla configurazione del repository, uno script di build che puoi leggere ed eseguire anche tu, e il risultato finisce sul branch `dist`: puoi quindi confrontare quello che viene servito con quello che produce una build dei sorgenti. https://github.com/A-Box-of-Tools/website

I file da leggere per primi sono `config/site.toml` per la Content-Security-Policy, `src/mask.js` per come un'immagine diventa un bit per pixel, `src/contour.js` per il giro lungo il bordo della forma, `src/fit.js` per come una scala diventa curve, e `src/subject.js` per come si ricava lo sfondo quando non c'è chiaro e scuro da cui separare.
