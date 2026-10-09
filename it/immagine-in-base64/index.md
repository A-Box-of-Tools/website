# Immagine in data URI — codificare in base64 una figura per il CSS o l'HTML

Tutta l'immagine come una riga di testo, da incollare dritta nel CSS o nell'HTML.

> Trasforma un PNG, un JPEG, un SVG o un WebP in un data URI da incollare nel CSS o nell'HTML. Gli SVG li codifica in percentuale invece che in base64, così restano leggibili e più corti. Gira nel browser e non carica niente.

Questa pagina è uno strumento interattivo che funziona interamente nel tuo browser, all'indirizzo https://abox.tools/it/immagine-in-base64/ — nulla di ciò che gli affidi viene caricato. Quanto segue è tutto ciò che la pagina dice dello strumento a parole; per usarlo, apri l'indirizzo.

## Qui non si caricano immagini, **mai**. Non c'è nessun server.

La codifica avviene dentro il browser che stai usando, sul tuo hardware. È aritmetica su byte che la pagina ha già: niente encoder, niente server, nessun passaggio di rete da lasciare fuori. Questo strumento non ha nessuna funzione di rete, non c'è niente da recuperare e niente da spedire, e dall'altra parte di questa pagina non c'è nessun server a cui mandare un'immagine, anche se una funzione del genere ci fosse.

- ✗ Niente caricamenti
- ✗ Nessun account
- ✗ Nessuna ricodifica
- ✓ Funziona offline
- ✓ Open source

## Come trasformare un'immagine in un data URI

1. **Scegli le immagini.** Trascinale sul riquadro, oppure selezionale a mano. Le legge il browser direttamente dal tuo disco, e mentre lo fa non parte niente per nessuna destinazione.
2. **Di' dove va a finire il risultato.** L'URI da solo, una regola CSS, una proprietà personalizzata, un tag `<img>` oppure del Markdown. Ognuno di questi mette l'URI tra virgolette, che è poi il dettaglio da cui dipende se un SVG incorporato funziona o smette di funzionare in silenzio.
3. **Leggi quanto è costato.** Ogni risultato dice in quanti caratteri si è trasformato, quanto è più grande del file di partenza, e se incorporare qualcosa di quella dimensione sia una buona idea. Il base64 aggiunge un terzo; se quel terzo valga una richiesta risparmiata dipende interamente dalla dimensione, e la pagina ti dice da che parte della linea ti trovi.
4. **Guarda gli avvisi.** Se l'immagine porta con sé EXIF, un profilo colore o XMP, te lo nomina insieme a quanti byte del tuo risultato sono quella roba lì. Se l'estensione non concorda con il formato vero, la pagina segue il formato e te lo dice. E se il tuo browser non riesce a disegnare il risultato, dice anche questo.
5. **Copia, oppure scarica.** Un pulsante per ogni risultato, e uno per tutti insieme. Le proprietà personalizzate escono avvolte in un blocco `:root`, pronte da incollare in cima a un foglio di stile.

## La versione lunga

[Quando mettere un'immagine dentro il tuo CSS, e quando no](https://abox.tools/it/guide/inserire-un-immagine-nel-css/): Quanto costa un data URI, perché il base64 aggiunge un terzo e il gzip non lo restituisce, perché un SVG non va mai messo in base64, e l'errore di virgolette che rompe in silenzio gli SVG incorporati.

## Anche nella cassetta

- [Da SVG a immagine](https://abox.tools/it/svg-in-png/): La dimensione la dici tu. Un vettoriale non ne ha una sua da perdere.
- [Immagine in SVG](https://abox.tools/it/immagine-in-svg/): Una forma, un contorno. Indica quello che non dovrebbe esserci.
- [Confronto di altezze](https://abox.tools/it/confrontare-altezze/): Scrivi le altezze, portati via l'immagine. Per disegnarla non viene mandato niente.
- [Compressore di immagini](https://abox.tools/it/comprimere-immagine/): La dimensione la dici tu. Il resto lo calcola lui.

## Domande

### La mia immagine viene caricata da qualche parte?

No. Il file lo legge e lo codifica il tuo browser sul tuo hardware, con due funzioni che si ritrova già. Questo strumento non ha nessuna funzione di rete: non recupera mai niente e non spedisce mai niente. La `Content-Security-Policy` della pagina elenca poi tutti gli indirizzi che può contattare, e nessuno di quelli appartiene a questo sito.

### Cos'è un data URI?

Un modo di scrivere un intero file dove di solito andrebbe un indirizzo web. Invece di `url("logo.png")`, che dice al browser di andare a recuperare qualcosa, scrivi `url("data:image/png;base64,iVBORw0...")`, che l'immagine ce l'ha già dentro. Il browser la decodifica sul posto. L'effetto pratico è una richiesta in meno, perché l'immagine arriva insieme al foglio di stile o alla pagina invece che dopo.

### Perché il mio SVG non è in base64?

Perché per lui il base64 è la codifica sbagliata. Un SVG è testo, e un URL il testo lo sa già portare: c'è solo una manciata di caratteri da proteggere. Codificando in percentuale quelli e lasciando stare il resto viene fuori un URI che di solito è un quinto più corto del base64 dello stesso file, e che nel foglio di stile riesci ancora a leggere, con i nomi degli elementi, i colori e il `viewBox` tutti ancora lì da modificare. C'è comunque una casella per forzare il base64, per quella rara catena di strumenti che ci insiste.

### Di quanto ingrandisce la mia immagine il base64?

Di circa un terzo. Tre byte di file diventano quattro caratteri di base64, cioè il 33% prima ancora del `data:image/png;base64,` che ci va davanti. È il minimo, ed è inevitabile, perché è quanto costa scrivere byte qualunque usando soltanto i caratteri che un URL consente. È anche il motivo per cui la pagina ti mette il numero di caratteri accanto alla dimensione del file, invece di lasciartelo scoprire a foglio di stile pubblicato.

### Quando conviene davvero incorporare un'immagine?

Quando è piccola e serve subito. Un'icona da 2 KB dentro un foglio di stile che ogni pagina carica è un guadagno netto: un giro in meno, e l'immagine c'è nel momento stesso in cui c'è il CSS. Oltre i 10 KB circa lo scambio si rovescia. Un'immagine incorporata non è più un file a sé, quindi non può stare in cache per conto suo, non può essere recuperata in parallelo con altro, e viene riscaricata per intero ogni volta che cambia il file attorno: una fotografia da 200 KB in un foglio di stile sono 200 KB aggiunti al percorso critico di ogni pagina del sito. La pagina ti dice da che parte di quella linea cade ogni risultato.

### Il gzip annulla quello che il base64 aggiunge?

Meno di quanto si creda. Il base64 di un file già compresso, e un PNG, un JPEG e un WebP lo sono tutti, si comprime male, perché di ridondanza da trovare al compressore non ne è rimasta quasi più; di solito ti torna indietro qualcosa come un decimo di quel terzo che il base64 aveva aggiunto, non tutto. Un SVG codificato in percentuale è il caso opposto: è ancora testo, quindi si comprime più o meno come prima, che è un'altra ragione per non metterlo in base64.

### Questo cambia in qualche modo la mia immagine?

No, ed è una differenza voluta rispetto a quasi tutti gli strumenti di qui. Niente viene decodificato in pixel e ricodificato: i byte usciti dal tuo disco sono gli stessi byte che entrano nell'URI. Un JPEG resta esattamente il JPEG che era, alla stessa qualità e con le stesse dimensioni. È per questo che il risultato si può chiamare lo stesso file, e non una copia.

### Quindi anche i miei dati EXIF e GPS finiscono nel foglio di stile?

Sì, ed è la parte a cui vale la pena pensare prima di incollare. Siccome non viene ricodificato niente, tutto quello che ha scritto la fotocamera viaggia insieme all'immagine: la posizione, l'orario, il numero di serie della fotocamera. Su una foto da telefono possono essere 30 KB del file, che diventano 40 KB di base64 sul percorso critico della tua pagina, più un indirizzo di casa dentro qualcosa che finirà depositato in un repository. La pagina legge quanti metadati ci sono in un JPEG, un PNG o un WebP e te lo dice. Per toglierli prima, c'è il [visualizzatore e rimozione EXIF](https://abox.tools/it/rimuovere-dati-exif/).

### Perché ha usato un tipo diverso dall'estensione del mio file?

Perché l'estensione può sbagliarsi e i byte no. Un file chiamato `logo.png` che in realtà era stato esportato come JPEG è abbastanza comune da costringere qualunque strumento per immagini a farci i conti, e un data URI che dichiara il tipo sbagliato semplicemente non compare: non c'è nessun ripiego e non c'è nessun messaggio d'errore che valga la pena leggere. Quindi il tipo si legge dai primi byte del file, che dicono cos'è senza ambiguità in tutti i formati di qui, e la pagina ti avverte quando i due non concordano.

### L'anteprima è vuota. Cosa è andato storto?

Probabilmente niente che riguardi l'URI. HEIC e TIFF producono tutti e due data URI perfettamente validi che nessun browser tranne Safari disegna, quindi l'immagine mancherà anche ovunque tu la incolli: convertila prima in PNG, JPEG o WebP con il [compressore di immagini](https://abox.tools/it/comprimere-immagine/) o con il [ridimensionatore di immagini](https://abox.tools/it/ridimensionare-immagine/). Se invece il formato è uno di quelli comuni, è probabile che sia il file stesso a essere danneggiato: l'anteprima è disegnata a partire dall'URI che questa pagina ha costruito, quindi se resta vuota vuol dire che l'immagine non si è decodificata.

### C'è un limite di dimensione per un data URI?

Non uno in cui andrai a sbattere nel CSS o in un tag `<img>`: lì i browser moderni non impongono nessun tetto pratico. Quello che i browser limitano davvero è scrivere un data URI nella barra degli indirizzi, cosa che ormai quasi tutti rifiutano per qualunque contenuto non banale, per ragioni di sicurezza che con questo uso non c'entrano niente. Il limite vero è quello di sopra: molto prima che si rompa qualcosa di tecnico, la pagina che lo contiene è diventata più lenta di quanto sarebbe stata con un normale file immagine.

### È gratis, e mi serve un account?

È gratis, e non c'è account, non c'è registrazione, non c'è periodo di prova e non c'è filigrana. Non c'è nemmeno un limite al numero o alla dimensione dei file, perché non c'è nessun server che li paga: il lavoro lo fa il tuo dispositivo. Il sito ha della pubblicità, ed è quella che lo mantiene; agli annunci non arriva niente sulle tue immagini.

### Funziona offline?

Sì. Carica la pagina una volta, poi stacca la connessione e continua a funzionare. È anche il modo più semplice per dimostrare che non viene caricato niente, perché uno strumento che spedisse via le tue immagini per codificarle si fermerebbe nell'istante in cui stacchi la spina.

## Come si verifica quello che promette

- **Le tue immagini non hanno dove andare.** La Content-Security-Policy elenca tutti gli indirizzi che questa pagina può contattare, e nessuno di quegli indirizzi appartiene a questo sito. Non esiste un punto di raccolta in cui i tuoi file possano finire, e nel codice non c'è niente che ce li manderebbe se anche esistesse.
- **Qui dentro niente va a recuperare niente.** In `src/` non c'è né un `fetch`, né un `XMLHttpRequest`, né un `sendBeacon`. La codifica sono `btoa` ed `encodeURIComponent`, due funzioni che il browser ha dalla nascita e che prendono byte e restituiscono testo senza andare da nessuna parte.
- **L'anteprima è la prova.** L'immagine accanto a ogni risultato è disegnata a partire dal data URI che questa pagina ha appena costruito, e non dal tuo file. Se compare è perché l'URI è corretto, sul tuo dispositivo, senza nessun server di mezzo; e se non compare, la pagina te lo dice invece di consegnarti qualcosa di rotto.
- **L'avviso sui metadati è dalla tua parte.** Un data URI copia il file esattamente com'è, quindi la posizione GPS di una fotografia viaggia dentro il tuo foglio di stile insieme alla fotografia. Questa pagina legge quanti metadati ci sono e te lo dice, perché l'alternativa è che tu lo scopra a commit fatto.
- **Cosa carica Google, e cosa non gli arriva.** Gli script della pubblicità e della misurazione arrivano da Google, il pulsante delle donazioni da Buy Me a Coffee. A nessuno di loro viene passato niente sulle tue immagini. Ogni riga che legge o codifica un file è servita da questa origine ed è elencata nel repository.
- **Funziona offline.** Stacca la rete e lo strumento resta identico, perché al suo interno non c'è mai stato un passaggio di rete. È la prova più semplice che ci sia.

**Verifica tu stesso.** Niente di quanto sopra va preso per buono. Questa pagina la genera, dai modelli e dalla configurazione del repository, uno script di build che puoi leggere ed eseguire anche tu, e il risultato finisce sul branch `dist`: puoi quindi confrontare quello che viene servito con quello che produce una build dei sorgenti. https://github.com/A-Box-of-Tools/website

I file da leggere per primi sono `config/site.toml` per la Content-Security-Policy, `src/encode.js` per le due codifiche e il ragionamento dietro ciascuna, `src/sniff.js` per come il tipo di media viene letto dal file invece che dal suo nome, e `src/metadata.js` per il controllo che dice quanta parte di quello che stai per incollare non è l'immagine.
