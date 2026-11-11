# Quando mettere un'immagine dentro il tuo CSS, e quando no

Un'immagine scritta dentro un foglio di stile arriva insieme a lui: nessuna seconda richiesta, nessuna attesa. Però smette anche di essere un file, e quindi non può stare in cache per conto suo e viene riscaricata ogni volta che cambia qualcosa attorno. Vediamo dove quello scambio conviene e dove invece, in silenzio, non conviene.

[Apri Immagine in data URI](https://abox.tools/it/immagine-in-base64/): Tutta l'immagine come una riga di testo, da incollare dritta nel CSS o nell'HTML.

Ultimo aggiornamento 26 agosto 2026

## La risposta corta

Apri [Immagine in data URI](https://abox.tools/it/immagine-in-base64/), trascinaci dentro l'immagine, scegli *una proprietà personalizzata CSS*, e incolla la riga in cima al tuo foglio di stile. Poi usala come `background-image: var(--logo)` dove ti serve.

Fallo quando l'immagine è piccola, tipo un'icona, un punto elenco, una freccetta o un motivo, e serve su ogni pagina. Non farlo con una fotografia. Tutto quello che segue riguarda il perché quelle due frasi sono diverse, e come capire quale delle due hai davanti.

## Cos'è davvero un data URI

Un indirizzo che contiene la cosa invece di puntarci. Dove un foglio di stile direbbe normalmente

```
background-image: url("logo.png");
```

e il browser va a recuperare `logo.png`, un data URI dice

```
background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...");
```

e non c'è niente da recuperare, perché l'immagine è già lì, scritta in caratteri. Le parti sono tre. `data:` è lo schema. `image/png` è il tipo di media, e il browser ci crede completamente, ma su questo torniamo più sotto. Tutto quello che sta dopo la virgola è il file.

È tutta lì l'idea. Non è un trucco né un espediente: sta negli standard dal 1998 e funziona in ogni browser uscito da allora.

## Cosa ci guadagni: un giro in meno

Il risparmio non è di banda. È della richiesta.

Un browser non può chiedere `logo.png` finché non ha letto il foglio di stile che lo nomina, e non può leggere il foglio di stile finché non l'ha recuperato. Quindi una normale immagine di sfondo sta ad almeno due giri di profondità nel caricamento della pagina, e su un telefono con una rete lenta un giro può valere un paio di centinaia di millisecondi a prescindere da quanto sia leggero il file. Una freccetta da 600 byte costa quasi niente da trasferire e può comunque costare un quarto di secondo per arrivare.

Incorporata, arriva insieme al foglio di stile. È tutto lì il vantaggio, e per una piccola icona che compare nella prima schermata è un vantaggio vero.

## Cosa costa: un terzo, e poi la cache

**Il base64 aggiunge circa un terzo.** Tre byte di file diventano quattro caratteri, perché è quello che ci vuole per scrivere byte qualunque usando soltanto i caratteri che un URL consente. Non c'è nessun encoder furbo che lo eviti. Un PNG da 9 KB sono 12 KB di foglio di stile.

**La compressione non te lo restituisce.** È la parte che la gente dà per scontata. Gzip e Brotli funzionano trovando ridondanza, e un PNG, un JPEG e un WebP sono già stati compressi: di ridondanza ne è rimasta pochissima, e il base64 non ne aggiunge. In pratica ti torna indietro qualcosa come un decimo di quel terzo, non tutto. (Un SVG è il caso opposto, e la sezione successiva parla di quello.)

**Smette di essere un file.** È il costo che non compare in nessuna misura che è probabile tu prenda, ed è quello che conta quando le dimensioni crescono:

- **Non può stare in cache per conto suo.** Un'immagine normale viene recuperata una volta e riusata per un anno. Una incorporata è parte del foglio di stile, quindi vive e muore con la voce di cache del foglio di stile.
- **Cambiare qualunque cosa fa riscaricare tutto.** Sistemi un margine, pubblichi un nuovo foglio di stile, e ogni visitatore si riscarica insieme a lui l'immagine incorporata: un'immagine che non cambia da due anni.
- **Sta sul percorso critico.** Un foglio di stile blocca il disegno della pagina. Un'immagine no. Incorporare un'immagine la sposta dalla seconda categoria alla prima, e la pagina non può dipingersi finché non è arrivato tutto, immagine compresa.
- **Non può essere recuperata in parallelo.** I browser scaricano molte cose insieme. Un'immagine incorporata non è una cosa a sé, quindi di tutto questo non ha niente.

Le soglie, a occhio e croce, sono i punti in cui cambia il consiglio e non quelli in cui un browser fa qualcosa di diverso: sotto i 2 KB circa è un guadagno netto; fino ai 10 KB circa di solito ne vale ancora la pena per qualcosa che sta su ogni pagina; oltre i 50 KB è un errore senza messaggio d'errore. [Lo strumento](https://abox.tools/it/immagine-in-base64/) ti dice in quale fascia cade ogni risultato, con accanto il numero di caratteri.

![La scheda di uscita: una regola CSS con un URI di dati in base64, e accanto la dimensione del file originale e quella codificata.](https://abox.tools/screens/embed-an-image-in-css/output.webp)

La copia codificata è circa un terzo più grande del file da cui viene. È il costo di cui parla questa sezione, ed è scritto invece di essere lasciato scoprire.

## Non mettere mai un SVG in base64

È l'errore di gran lunga più comune nelle immagini incorporate, e lo fanno gli esportatori e i plugin di compilazione tanto quanto le persone.

Un SVG è testo. Un URL il testo lo sa già portare. C'è solo una manciata di caratteri da proteggere, cioè `%`, `#`, `<`, `>` e la virgoletta con cui l'hai avvolto, e tutto il resto si può lasciare esattamente com'è. Codificarlo così ti dà un URI che di solito è circa un quinto più corto del base64 dello stesso file, e che poi si comprime come testo invece che come rumore.

Ed è anche ancora leggibile:

```
background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E...");
```

Il `viewBox` lo vedi. Il colore di riempimento lo puoi cambiare nel tuo editor senza decodificare niente. Metti in base64 lo stesso file e diventa un muro di lettere che nessuno toccherà mai più. [Immagine in data URI](https://abox.tools/it/immagine-in-base64/) lo fa automaticamente per tutto quello che risulta essere un SVG, e ha una casella per quella rara catena di strumenti che insiste su `;base64`.

## L'errore di virgolette che rompe solo gli SVG

Il CSS ti lascia scrivere `url()` senza virgolette, e per un normale nome di file va bene:

```
background-image: url(logo.png);
```

Fai lo stesso con un SVG codificato in percentuale e si rompe. Un token `url()` senza virgolette finisce al primo spazio, parentesi, virgoletta o carattere di controllo, e un SVG è pieno di spazi, tra ogni attributo e ogni numero di un tracciato. La dichiarazione risulta allora non valida, il CSS scarta in silenzio le dichiarazioni non valide, e tu non ottieni né sfondo né errore.

La soluzione sono le virgolette, tutte le volte:

```
background-image: url("data:image/svg+xml,%3Csvg ... %3E");
```

È anche il motivo per cui un encoder non ha bisogno di proteggere gli spazi, perché dentro un URL tra virgolette sono perfettamente leciti, e proteggere ognuno come `%20` costerebbe tre caratteri per ogni spazio del file. Le due decisioni vanno insieme: metti l'URI tra virgolette, e gli spazi li puoi lasciare stare. Ogni forma che lo strumento produce è tra virgolette esattamente per questo.

## Il tipo di media deve essere giusto

Un data URI dichiara il proprio tipo, e il browser gli crede sulla parola. Non c'è nessun ripiego che vada a fiutare il contenuto come succede per un file recuperato: di' `image/png` di qualcosa che in realtà è un JPEG e l'immagine non compare, senza un messaggio in nessun posto utile.

E conta perché le estensioni mentono. Una foto esportata come JPEG e rinominata `logo.png` è una cosa che si trova normalmente su un disco. I primi byte di un file immagine, invece, dicono cos'è senza ambiguità, perché ogni formato ha una firma, quindi uno strumento dovrebbe leggere il file e non il suo nome. Quello di qui lo fa, e ti dice quando i due non concordano.

Ci sono due formati che vale la pena conoscere perché falliscono in modo confuso. **HEIC**, cioè come fotografa un iPhone, e **TIFF**, cioè quello che producono gli scanner, fanno tutti e due data URI perfettamente validi che nessun browser tranne Safari disegna. L'URI non è rotto: è il formato a non essere fra quelli che il web supporta. Converti prima.

## I metadati che non volevi pubblicare

Un data URI è una copia del file, byte per byte. Niente viene decodificato e ricodificato, che di solito è il senso della cosa, perché così non si perde qualità, ma vuol dire anche che tutto il resto che c'è nel file viene dietro.

Una fotografia appena uscita da un telefono porta con sé l'EXIF: le coordinate GPS del posto in cui è stata scattata, l'orario, il modello della fotocamera e spesso il suo numero di serie. Possono essere 30 KB del file. Incorporati, diventano 40 KB di base64 nel tuo foglio di stile, sul percorso critico di ogni pagina, più un indirizzo di casa depositato in un repository, in una forma che a nessuno verrà mai in mente di guardare.

Toglilo prima con il [visualizzatore e rimozione EXIF](https://abox.tools/it/rimuovere-dati-exif/), che riscrive il contenitore senza toccare l'immagine, e c'è anche [una guida apposta](https://abox.tools/it/guide/rimuovere-i-dati-exif-e-gps/). Immagine in data URI legge quanti metadati ci sono in un JPEG, un PNG o un WebP e te lo dice prima che tu copi qualunque cosa.

## Dove metterlo, una volta che ce l'hai

Se l'immagine compare in una sola regola, metti l'URI in quella regola. Se compare in più di una, e le icone di solito lo fanno, una volta che conti lo stato al passaggio del mouse e il tema scuro, dichiarala una volta come proprietà personalizzata:

```
:root {
  --icona-cerca: url("data:image/svg+xml,%3Csvg ... %3E");
}

.campo-ricerca { background-image: var(--icona-cerca); }
.pulsante-ricerca::before { content: var(--icona-cerca); }
```

Un URI da 3 KB incollato in quattro regole sono 12 KB di foglio di stile e quattro punti da modificare quando l'icona cambia. La proprietà personalizzata è uno di ciascuno. È anche la forma che fa funzionare i temi: ridefinisci `--icona-cerca` dentro una media query e ogni suo uso segue.

Per un tag `<img>` invece che per il CSS, metti `width` e `height`. Un'immagine incorporata si carica all'istante, quindi una dimensione mancante è uno spostamento di layout che avviene troppo in fretta per essere visto e ti viene contato lo stesso. L'eccezione è l'SVG: uno che porta solo un `viewBox` non ha una dimensione in pixel sua, e scrivere sul tag il ⁦300×150⁩ predefinito del browser inchioda un'immagine scalabile a una dimensione che non ha scelto nessuno.

Lascia vuoto l'`alt` a meno che tu non abbia qualcosa di vero da metterci. Solo tu sai se l'immagine porta un significato oppure è decorazione, e per chi usa uno screen reader una descrizione indovinata da un nome di file è peggio che nessuna descrizione.

![La scheda della forma: pulsanti che scelgono cosa deve uscire, una regola di sfondo CSS, un tag img o il solo URI, e un interruttore fra base64 e SVG in chiaro.](https://abox.tools/screens/embed-an-image-in-css/shape.webp)

Dove va decide cosa esce, quindi la domanda viene fatta per prima invece di essere lasciata come esercizio di copia e incolla.

## Quando la risposta è «non farlo»

Se l'immagine, una volta codificata, supera i 50 KB circa, incorporare è lo strumento sbagliato e nessuna cura nella codifica lo sistema. Le alternative, nell'ordine in cui vale la pena provarle:

- **Rendila più leggera.** Quasi tutte le immagini troppo pesanti da incorporare sono troppo pesanti in generale. Il [compressore di immagini](https://abox.tools/it/comprimere-immagine/) porta una fotografia a un peso che dici tu, e il [ridimensionatore di immagini](https://abox.tools/it/ridimensionare-immagine/) taglia le misure in pixel a quello che il layout usa davvero, che molto spesso è il problema vero.
- **Ridisegnala come SVG.** Un'icona esportata come PNG da 40 KB è spesso un SVG da 900 byte. Non è una differenza di compressione, è una differenza di formato, e risolve anche il problema del retina.
- **Lasciala come file e precaricala.** `<link rel="preload" as="image">` avvia il recupero subito senza spostare i byte sul percorso critico. Ottiene quasi tutto il vantaggio dell'incorporare e niente del costo di cache.

## Niente di tutto questo ha bisogno di un caricamento

Codificare un file in base64 è aritmetica. Sono due funzioni che il browser ha dalla nascita, `btoa` ed `encodeURIComponent`, e non c'è nessun motivo tecnico, proprio nessuno, per cui un'immagine debba andare fino a un server e tornare per essere scritta in un altro modo. Qualunque convertitore carichi il tuo file per fare questo lo sta caricando per motivi suoi, non tuoi.

[Lo strumento di qui](https://abox.tools/it/immagine-in-base64/) non lo manda da nessuna parte: la `Content-Security-Policy` della pagina elenca tutti gli indirizzi che può contattare, e nessuno di quelli appartiene a questo sito. Se preferisci verificare invece che crederci, carica la pagina, stacca la connessione e codifica qualcosa lo stesso. [È sicuro caricare i propri file sui convertitori online?](https://abox.tools/it/guide/e-sicuro-caricare-i-propri-file/) propone altre tre verifiche che puoi fare su qualunque strumento.
