# Da SVG a PNG — rasterizzare un vettoriale in PNG, JPEG o WebP a qualunque dimensione

La dimensione la dici tu. Un vettoriale non ne ha una sua da perdere.

> Converti un SVG in PNG, JPEG o WebP a qualunque dimensione, dentro il tuo browser. Di' la larghezza, un moltiplicatore o un riquadro, e ti arrivano anche le copie @2x e @3x. Trasparenza conservata, niente caricamenti.

Questa pagina è uno strumento interattivo che funziona interamente nel tuo browser, all'indirizzo https://abox.tools/it/svg-in-png/ — nulla di ciò che gli affidi viene caricato. Quanto segue è tutto ciò che la pagina dice dello strumento a parole; per usarlo, apri l'indirizzo.

## Qui non si caricano file SVG, **mai**. Non c'è nessun server.

Il disegno lo rasterizza lo stesso motore che l'ha appena messo sul tuo schermo. Il tuo file viene letto dal tuo disco, il suo tag radice viene riscritto alla dimensione che hai chiesto da un centinaio di righe in `src/svg.js` che puoi leggere, e viene disegnato su un canvas che il tuo browser si porta già dietro. Questo strumento non ha nessuna funzione di rete, non c'è niente da recuperare e niente da spedire, e dall'altra parte di questa pagina non c'è nessun server a cui mandare un logo, anche se una funzione del genere ci fosse.

- ✗ Niente caricamenti
- ✗ Nessun account
- ✗ Nessuna filigrana
- ✓ Funziona offline
- ✓ Open source

## Come convertire un SVG in PNG senza caricarlo

1. **Scegli l'SVG.** Trascinane uno sul riquadro, oppure prendi una cartella intera e convertili tutti in un colpo solo. Il file lo legge il browser direttamente dal tuo disco, e mentre lo fa non parte niente per nessuna destinazione. Ogni riga dice che dimensione crede di avere il file, e lo dice in modo diverso a seconda che quella dimensione venga dal suo `viewBox` oppure sia stata data per scontata perché il file non ne dichiara nessuna.
2. **Di' quanto grande.** Un moltiplicatore della dimensione del file è la risposta più rapida, ed è quella giusta per un lotto, perché ogni disegno viene scalato dal proprio punto di partenza e una serie di icone resta in proporzione. Altrimenti indica una larghezza, un'altezza, il lato più lungo, o un riquadro con tutti e due i lati dati. Qui un numero grande non ha la penale che avrebbe con una fotografia, perché il disegno viene ridisegnato a quella dimensione, non stirato fino a lì.
3. **Aggiungi le copie ad alta densità, se ti servono.** Un telefono e un portatile Retina disegnano due o tre pixel fisici per ogni pixel CSS, quindi un logo da 200 pixel ha bisogno dietro di un file da 400 o 600 pixel. Chiedi `@2x` e `@3x` ed escono nominate come se le aspettano Xcode, gli strumenti di Android e l'`image-set()` del CSS, e ognuna è esattamente il doppio o il triplo della prima invece che arrotondata per conto suo.
4. **Scegli il formato e decidi sulla trasparenza.** PNG, a meno che tu non abbia un motivo: è senza perdita, tiene la trasparenza, e le tinte piatte ci si comprimono bene. Il JPEG di trasparenza non ne ha, quindi un colore di sfondo viene dipinto che tu ne scelga uno o no, e senza sceglierlo ogni pixel trasparente esce nero. Il WebP fa tutte e due le cose e produce un file più leggero, al prezzo del software abbastanza vecchio da non saperlo leggere.
5. **Guarda l'anteprima prima di scaricare.** È disegnata dallo stesso codice che scrive il file, dal tuo file, sul tuo dispositivo. Quando un disegno diventa pixel cambiano due cose, e tutte e due si vedono qui: un tratto da un capello, che era largo mezzo pixel, diventa grigio, e il testo viene disegnato con un carattere che questo computer ha già, non con uno recuperato dal web.
6. **Prendi i file.** Un download per file, oppure tutto il lotto in un unico zip. I nomi seguono l'SVG da cui vengono, con `@2x` e `@3x` sulle copie, e due file che avrebbero avuto lo stesso nome vengono numerati invece che sostituirsi a vicenda in silenzio.

## La versione lunga

[Come convertire un SVG in PNG alla dimensione giusta](https://abox.tools/it/guide/convertire-un-svg-in-png/): Un vettoriale non ha una dimensione in pixel sua, quindi il numero lo scegli tu. Da dove viene quel numero per uno schermo, per l'icona di un'app e per una stampante, e cosa cambia quando un disegno diventa pixel.

## Anche nella cassetta

- [Immagine in SVG](https://abox.tools/it/immagine-in-svg/): Una forma, un contorno. Indica quello che non dovrebbe esserci.
- [Confronto di altezze](https://abox.tools/it/confrontare-altezze/): Scrivi le altezze, portati via l'immagine. Per disegnarla non viene mandato niente.
- [Compressore di immagini](https://abox.tools/it/comprimere-immagine/): La dimensione la dici tu. Il resto lo calcola lui.
- [Ridimensionatore di immagini](https://abox.tools/it/ridimensionare-immagine/): Di' la dimensione, disegna il riquadro, scegli il formato.

## Domande

### Il mio SVG viene caricato da qualche parte?

No. Il file lo legge il tuo browser sul tuo hardware, lo disegna su un canvas con lo stesso motore che rende ogni altra immagine che vedi, e te lo restituisce come download. Questo strumento non ha nessuna funzione di rete: non recupera mai niente e non spedisce mai niente. La `Content-Security-Policy` della pagina elenca poi tutti gli indirizzi che può contattare, e nessuno di quelli appartiene a questo sito.

### A che dimensione dovrei rasterizzare un SVG?

A quella che chiede la cosa che lo legge, moltiplicata per il rapporto di pixel del dispositivo su cui verrà visto. Un logo che occupa 200 pixel CSS ha bisogno di 400 per un portatile Retina e di 600 per un telefono recente, che è poi quello che sono qui le copie `@2x` e `@3x`. Per l'icona di un'app o per una scheda su uno store, lo store nomina un numero esatto ed è quello il numero. Quando invece nessuno ti ha detto niente, 1024 sul lato più lungo è un default utile: abbastanza grande per quasi ogni uso e abbastanza piccolo da mandare via mail.

### Ingrandirlo fa perdere qualità?

No, e questo è l'unico posto in cui quella risposta è onestamente no. Un vettoriale sono istruzioni invece che pixel, quindi il browser ridisegna le curve a qualunque dimensione gli si chieda: quattromila pixel tirati fuori da un'icona da 24 pixel sono nitidi esattamente come lo erano i 24. Quello che non puoi fare è il percorso inverso, perché una volta che è un PNG sono pixel come qualunque altra cosa; rasterizza quindi alla dimensione che ti serve, invece di ridimensionare il risultato dopo.

### Il mio SVG non ha larghezza né altezza. Che dimensione ottengo?

Quella del `viewBox`, se ce n'è uno: la sua larghezza e la sua altezza sono unità utente e non pixel, ma sono gli unici numeri che stanno nel file, e un browser li tratta come la dimensione naturale del disegno. Se non c'è nemmeno un viewBox, la pagina scrive *presunta* accanto alla riga e usa ⁦300 × 150⁩, che è la dimensione a cui l'avrebbe disegnato un `<img>`. In un caso e nell'altro puoi indicare la dimensione che vuoi e il file viene disegnato a quella.

### Perché il testo nel PNG viene diverso?

Perché il carattere dentro l'SVG non c'è. Un SVG che disegna del testo nomina un carattere e lascia che sia la macchina a trovarlo, e un file che se lo tira da Google Fonts con un `@import` qui non ottiene niente: a un SVG disegnato attraverso un `<img>` non è concesso recuperare niente, che è la stessa regola che gli impedisce di chiamare casa con il tuo file. La soluzione ogni grafico la conosce già: converti il testo in tracciati nel programma di disegno prima di esportare. A quel punto è geometria, e viene uguale dappertutto.

### Può convertire più file insieme?

Sì. Ogni SVG dell'elenco viene reso con le stesse impostazioni e il lotto si scarica in un unico zip. Per un lotto l'impostazione giusta di solito è un moltiplicatore, cioè «4× la dimensione che il file chiede», perché ogni disegno viene scalato dalla propria dimensione invece che forzato tutto allo stesso numero di pixel. Clicca una riga qualsiasi per mettere quella nell'anteprima.

### C'è un limite di dimensione?

Quello del browser, non il nostro. Un canvas si arrende da qualche parte oltre i 16.384 pixel per lato, e Safari su iPhone o iPad si ferma attorno ai 16,7 megapixel di area, cioè ⁦4096 × 4096⁩. Sopra quella soglia la pagina ti avverte, invece di restituirti un'immagine vuota, che è quello che fa un browser quando è a corto: `toBlob` non restituisce proprio niente, senza nemmeno un errore che si spieghi. Oltre i 100 megapixel lo strumento si rifiuta, perché sono 400 MB di canvas prima ancora che sia stato codificato un byte.

### Cosa succede alla trasparenza?

Viene conservata, in PNG e in WebP. Il JPEG un canale alfa non ce l'ha, quindi dietro tutta l'immagine viene dipinto un colore, che tu ne chieda uno o no: senza, tutto quello che è trasparente uscirebbe nero, cosa che sembra un difetto e invece è il JPEG. Anche scegliere un colore di sfondo con il PNG è una cosa perfettamente normale da volere, perché appiattisce il disegno su quel colore invece di lasciare un buco.

### Può leggere un SVG che contiene uno script o un'immagine esterna?

Può leggerlo, e disegnerà esattamente le parti che un browser è disposto a disegnare. Un SVG caricato attraverso un `<img>` si trova in *secure static mode*: gli script non girano, i riferimenti esterni non vengono recuperati, e l'animazione non parte, quindi quello che ottieni è il primo fotogramma. Un file che ha dentro un `<image>` remoto esce perciò con quella parte mancante. È il browser che si rifiuta per conto tuo, ed è il motivo per cui questa pagina può aprire senza rischi un file che non ha mai visto.

### Che differenza c'è tra questo e il ridimensionatore di immagini?

Il punto di partenza. Il ridimensionatore di immagini parte da pixel, un JPEG o un PNG, quindi per ingrandirli deve inventare dettaglio che non c'è mai stato. Questo parte da un disegno, quindi non c'è niente da inventare e nessun limite superiore di cui preoccuparsi. Se quello che hai è un SVG, è questo a darti un risultato nitido; se quello che hai è una fotografia, è l'altro.

### È gratis, e mi serve un account?

È gratis, e non c'è account, non c'è registrazione, non c'è periodo di prova e non c'è filigrana. Non c'è nemmeno un limite al numero o alla dimensione dei file, perché non c'è nessun server che li paga: il lavoro lo fa il tuo dispositivo. Il sito ha della pubblicità, ed è quella che lo mantiene; agli annunci non arriva niente sui tuoi file.

### Funziona offline?

Sì. Carica la pagina una volta, poi stacca la connessione e continua a funzionare. È anche il modo più semplice per dimostrare che non viene caricato niente, perché uno strumento che spedisse via il tuo disegno per farlo rendere si fermerebbe nell'istante in cui stacchi la spina.

## Come si verifica quello che promette

- **Il tuo disegno non ha dove andare.** La Content-Security-Policy elenca tutti gli indirizzi che questa pagina può contattare, e nessuno di quegli indirizzi appartiene a questo sito. Non esiste un punto di raccolta in cui i tuoi file possano finire, e nel codice non c'è niente che ce li manderebbe se anche esistesse.
- **Qui dentro niente va a recuperare niente.** In `src/` non c'è né un `fetch`, né un `XMLHttpRequest`, né un `sendBeacon`. Tutto il rasterizzatore è un `<img>` che contiene un blob del tuo file, un `drawImage` su un canvas e un `canvas.toBlob`.
- **Un SVG è un documento, e questa è la modalità in cui non può agire.** Un SVG può portare con sé uno `<script>`, un `<image href="https://…">` remoto, un foglio di stile e un carattere web. Disegnato attraverso un `<img>` si trova però in quella che la specifica chiama *secure static mode*: lo script non gira e non viene recuperato nemmeno uno di quegli indirizzi. È una garanzia del browser e non una promessa nostra, ed è il motivo per cui questa pagina può aprire un file che non ha mai visto senza che il file possa chiamare casa.
- **Cosa carica Google, e cosa non gli arriva.** Gli script della pubblicità e della misurazione arrivano da Google, il pulsante delle donazioni da Buy Me a Coffee. A nessuno di loro viene passato niente sul tuo disegno. Ogni riga che legge, dimensiona o disegna un file è servita da questa origine ed è elencata nel repository.
- **Funziona offline.** Stacca la rete e lo strumento resta identico, perché al suo interno non c'è mai stato un passaggio di rete. È la prova più semplice che ci sia.

**Verifica tu stesso.** Niente di quanto sopra va preso per buono. Questa pagina la genera, dai modelli e dalla configurazione del repository, uno script di build che puoi leggere ed eseguire anche tu, e il risultato finisce sul branch `dist`: puoi quindi confrontare quello che viene servito con quello che produce una build dei sorgenti. https://github.com/A-Box-of-Tools/website

I file da leggere per primi sono `config/site.toml` per la Content-Security-Policy, `src/svg.js` per come viene letta la dimensione dichiarata da un file e come ne viene riscritto il tag radice, e `src/render.js` per le otto righe che rasterizzano: un <img>, un `drawImage` e un `toBlob`, senza niente in mezzo.
