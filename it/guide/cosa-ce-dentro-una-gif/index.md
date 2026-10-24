# Cosa c'è davvero dentro una GIF

Una GIF è una pila di rettangoli, ognuno con un cronometro e una tavolozza, e quasi tutte le lamentele sul formato nascono da una di queste tre cose. Qui c'è cosa fa ogni pezzo, e come scoprire su quale di loro il tuo file sta spendendo il suo peso.

[Apri Analizzatore di GIF](https://abox.tools/it/analizzare-gif/): Fotogrammi, durate, tavolozze e dove è finito ogni byte.

Ultimo aggiornamento 26 agosto 2026

## La risposta corta

Una GIF è una tela, un elenco di rettangoli da dipingerci sopra, e una tavolozza che dice cosa significano i numeri dentro a quei rettangoli. Ogni rettangolo si porta dietro tre cose: quanto tenerlo su, cosa farne subito dopo, e se serve una tavolozza tutta sua.

Quasi tutto quello che del formato sorprende viene fuori da quell'elenco. Se la tua GIF è enorme, è perché i rettangoli sono ogni volta l'intera tela, oppure perché ci sono dentro trecento tavolozze. Se va troppo piano, è perché i ritardi stanno sotto a un pavimento che nessun browser scavalca. Se sbrodola, è il campo che si chiama *smaltimento*.

Per vedere quale delle tre sia, su un file preciso, apri l'[analizzatore di GIF](https://abox.tools/it/analizzare-gif/) e trascinacelo dentro. Il resto di questa pagina spiega cosa vogliono dire i numeri.

![La scheda di riepilogo di una GIF: la sua versione, la dimensione della tela, la dimensione del file, il numero di fotogrammi, quante volte si ripete e quanti colori usa.](https://abox.tools/screens/whats-inside-a-gif/facts.webp)

Tutto quello che un lettore non mostra mai, ricavato da un file.

## I fotogrammi sono rettangoli, non immagini

Questa è la parte che sorprende chi le GIF le ha sempre e solo viste andare. Un fotogramma non è un'immagine dell'animazione in quel momento. È un rettangolo, con una posizione e una misura sue, dipinto sopra a quello che i fotogrammi precedenti hanno lasciato lì.

Quel rettangolo può essere l'intera tela, e in un file fatto male lo è sempre. Ma una GIF ha il permesso di conservare solo la parte dell'immagine che è cambiata dall'ultimo fotogramma — e dove quasi tutta l'immagine sta ferma, è la differenza fra un file da 12 MB e uno da 900 KB. È per questo che la registrazione di una finestra quasi immobile può essere piccola, e che la stessa registrazione uscita da un convertitore sbadato non lo è.

Guardando l'animazione non puoi capire quale delle due hai. Sono identiche. L'unico modo di vederlo è guardare cosa conserva ogni fotogramma, ed è una vista che l'analizzatore ha proprio per questo: mettila su *solo quello che ogni fotogramma conserva* e vedrai o una fila di forme piccole su sfondo trasparente, il che vuol dire che l'encoder ha fatto il suo lavoro, o l'immagine intera una volta dietro l'altra, il che vuol dire che non l'ha fatto.

In questo formato non c'è compensazione del movimento da nessuna parte. Niente viene mai conservato come «uguale a prima ma spostato di quattro pixel a sinistra», come farebbe un codec video. Il trucco del rettangolo che cambia è l'unico risparmio che la GIF ha, e vale moltissimo.

## I ritardi, e il pavimento che ogni browser fa rispettare

Ogni fotogramma conserva per quanto tenerlo, in centesimi di secondo. È l'unica unità che il formato ha, quindi il più veloce che un file possa chiedere è 0,01 secondi — cento fotogrammi al secondo — e il più lungo sono circa 655 secondi.

Cento fotogrammi al secondo non li avrà. **Ogni browser arrotonda a 0,10 qualsiasi ritardo sotto 0,02 secondi.** La regola è stata scritta dentro a Netscape Navigator nel 1996, per i mappamondi rotanti e i cartelli animati «lavori in corso» dell'epoca, e da allora ogni browser l'ha copiata. Non l'ha mai tolta nessuno, e non la toglierà nessuno.

Quindi una GIF i cui fotogrammi dicono tutti 0,01 s va a dieci fotogrammi al secondo, non a cento. Va dieci volte più piano di quanto volesse chi l'ha fatta, e il file non lo lascia intuire: i ritardi che ci sono dentro sono esattamente quelli chiesti. È la sorpresa più comune del formato, ed è per questo che l'analizzatore riporta due durate — quella che dice il file, e quella che un browser ne farà davvero.

Il rimedio, ovunque il file venga fatto, è scrivere 0,02 invece di 0,01. Così si ottengono 50 fotogrammi al secondo, che è il soffitto vero, ed è più veloce di quanto serva a chiunque. In pratica 0,05 s — venti fotogrammi al secondo — è più o meno la velocità massima che valga la pena chiedere.

C'è un'altra cosa che i ritardi ti raccontano. Se sono tutti uguali, il file è stato fatto da una serie di fotogrammi a passo fisso. Se sono sparsi — 0,04 qui, 0,11 là —, qualcosa ha convertito un video buttando via fotogrammi e allungando i vicini per coprire i buchi. E se l'ultimo è molto più lungo degli altri, è voluto: è così che si fa fermare un'animazione prima che riparta.

## Lo smaltimento: il campo che decide se sbrodola

Ogni fotogramma dice cosa deve restare sullo schermo quando il suo tempo è finito. Le risposte possibili sono quattro e vale la pena conoscerle, perché tre dei quattro modi in cui un'animazione può venire storta sono questo campo messo male.

- **Lascialo lì.** Il fotogramma dopo dipinge dritto sopra. Giusto quando i fotogrammi sono coprenti e si coprono l'un l'altro per intero, ed è la scelta più economica, perché non c'è niente da pulire.
- **Torna allo sfondo.** Il rettangolo del fotogramma viene cancellato prima che disegni il successivo. È quello che la trasparenza pretende: senza, le parti trasparenti del fotogramma dopo lasciano vedere quello prima sotto, e un'animazione di immagini separate diventa un mucchio di immagini.
- **Rimetti quello che c'era sotto.** Quello che stava sulla tela prima che questo fotogramma disegnasse viene rimesso a posto. È così che si conserva un oggetto piccolo che si muove su uno sfondo fermo — ogni fotogramma dipinge l'oggetto, poi lo sfondo torna, e l'unica cosa mai scritta è il rettangolo dell'oggetto.
- **Non specificato.** Il file non l'ha detto. Tutti i visualizzatori lo trattano come «lascialo lì», il che di solito è giusto e ogni tanto è il motivo per cui una GIF trasparente sbrodola.

Un dettaglio in cui la specifica e la realtà prendono strade diverse. «Torna allo sfondo» indica un colore di sfondo scritto nell'intestazione del file, e ogni browser lo ignora e pulisce verso il trasparente. Lo fanno da venticinque anni. Un file che conta sulla comparsa di quel colore di sfondo verrà giusto a chi l'ha fatto, dentro al programma con cui l'ha fatto, e sbagliato ovunque altro.

## Le tavolozze, e i 768 byte che costano

Un pixel di una GIF non è un colore. È un numero che punta dentro a una tabella di al massimo 256 colori, ognuno scritto su tre byte. Una tabella piena è quindi 768 byte, e un file può averne una condivisa da tutto, oppure una per fotogramma, oppure tutte e due.

Sono legittime entrambe le sistemazioni, e barattano cose diverse:

- **Una tabella condivisa** costa 768 byte per tutto il file, e tiene i colori fermi da un fotogramma all'altro. Lo sfarfallio delle GIF — quel luccichio sgradevole sui file fatti da un video — molto spesso non è che la tavolozza che sobbalza da un fotogramma al successivo.
- **Una tabella per fotogramma** lascia che ogni fotogramma usi colori che la condivisa non ha, cosa che conta quando la scena cambia del tutto. Costa 768 byte ogni volta. Su un'animazione da 300 fotogrammi fanno 230 KB di tavolozze prima ancora che sia conservato un pixel.

C'è un secondo costo, più silenzioso. La lunghezza di una tavolozza deve essere una potenza di due, quindi un fotogramma che usa nove colori si prende comunque una tabella da sedici, e uno che ne usa 130 se ne prende comunque 256. Un po' di arrotondamento è inevitabile. Un file le cui tabelle dichiarano cinquemila colori a cui i suoi pixel non si riferiscono mai è un'altra cosa: tavolozze costruite per un'immagine diversa da quella finita nel fotogramma. L'analizzatore segna le voci non usate, così quella forma si vede a colpo d'occhio.

## Dove finiscono davvero i byte

Ogni byte di una GIF sta in uno di pochi posti, e vale la pena sapere quali siano prima di decidere che un file è troppo grosso.

- **Pixel compressi.** Su un file sano, quasi tutto. L'immagine stessa, passata per LZW — uno schema di compressione del 1984 pensato per le schermate dei fogli di calcolo, ed è per questo che se la cava bene sui colori piatti e male sulle fotografie.
- **Tavolozze.** 768 byte per tabella piena, come sopra.
- **Intestazioni per fotogramma.** Otto byte di tempi e undici di descrittore per ogni fotogramma. Su un file normale niente; su un'animazione di duemila fotogrammi minuscoli, 38 KB.
- **L'imballaggio a blocchi.** I dati compressi vengono tagliati in tratti da al massimo 255 byte, ognuno con davanti un byte di lunghezza. Circa un byte ogni 256, inevitabile, e degno di essere visto perché altrimenti è invisibile.
- **Metadati.** Commenti, profili di colore e pacchetti XMP. Questo è quello che produce i risultati davvero assurdi: un programma di fotoritocco può lasciarsi dietro 40 KB di XML che descrivono una modifica fatta anni fa, e su una GIF piccola quello è quasi tutto il file. Nessun visualizzatore ne disegna niente.

Il motivo per guardare questa roba come tabella invece di tirare a indovinare è che la risposta cambia da file a file, e il rimedio viene dalla risposta. Un file fatto per il 95 % di pixel compressi è semplicemente tanta immagine, e ci aiuteranno solo meno fotogrammi, una misura più piccola o meno colori. Un file fatto per il 30 % di tavolozze o per il 40 % di XMP ha un problema molto più economico.

![Una barra che scompone una GIF per destinazione dei suoi byte, con una riga per fotogramma che ne dà la dimensione e la quota sul file.](https://abox.tools/screens/whats-inside-a-gif/budget.webp)

Dove sono finiti davvero i byte, fotogramma per fotogramma. Una GIF troppo grossa lo è quasi sempre per un motivo che questo rende evidente.

## Il ciclo non fa parte del formato

Nella specifica della GIF non c'è nessun campo che dica che un'animazione si ripete. Il ciclo viene da un blocco che Netscape si è inventata nel 1995 — una «estensione applicativa» con dentro la stringa `NETSCAPE2.0` — che tutti hanno implementato lo stesso e che oggi sta dentro a ogni GIF animata di internet.

Il che vuol dire che un file senza quel blocco parte una volta sola e si ferma, in ogni browser, e a chi l'ha fatto sembra rotto. Se un'animazione passa una volta e basta, è quel blocco che manca; è fra le prime cose che vale la pena controllare, ed è invisibile in qualsiasi visualizzatore.

Il blocco può anche dire un numero di volte — riproduci cinque volte e fermati. Zero vuol dire per sempre, ed è quello che dice quasi ogni file.

## Le altre cose che una GIF può portarsi dietro

Tre blocchi che non contengono immagini e che ogni visualizzatore salta:

- **Commenti.** Testo libero, di solito il nome di quello che ha scritto il file, ogni tanto qualcosa che l'autore non avrebbe scelto di pubblicare. Non lo mostra niente, e ogni copia del file se lo porta dietro.
- **XMP.** I metadati XML di Adobe: cosa ha modificato il file, quando, a volte chi. Arriva con una coda magica di 258 byte in fondo, un trucco per far tornare le lunghezze dei blocchi, ed è per questo che leggerlo ingenuamente riempie lo schermo di binario.
- **Testo semplice.** Un blocco della specifica del 1989 che chiede al visualizzatore di disegnare del testo sopra all'immagine in una griglia di celle. Non l'ha mai implementato niente. Se un file ne ha uno, quello che c'è scritto non comparirà.

Vale la pena conoscerli tutti e tre prima di mandare un file da qualche parte: sono le parti di una GIF che possono dire qualcosa su di te, e sopravvivono a ogni copia e a ogni nuovo caricamento, a meno che qualcosa non le tolga apposta.

## Leggere un file rovinato

Le GIF si troncano — un download che si è fermato, un file recuperato da un disco che stava morendo, qualcosa di cui un'applicazione ha scritto metà. Siccome il formato è un flusso di blocchi e non una struttura indicizzata, una GIF troncata di solito si legge lo stesso fino al punto in cui si ferma: ogni fotogramma prima della rottura è intatto e completo.

Vale la pena saperlo perché quasi tutti i programmi il file lo rifiutano e basta. Un analizzatore che legge fin dove riesce e dice dove si è fermato almeno ti dice quanto è sopravvissuto, e se quello che manca è un fotogramma o gli ultimi duecento.

Esiste anche il problema opposto: byte seduti *dopo* il segno di fine del file. Ogni decodificatore si ferma a quel segno, quindi non vengono mai letti né disegnati, e di solito sono un secondo file appiccicato al primo da qualcosa che è andato storto. Sono peso puro, e tagliarli via non fa perdere niente.

## Niente di tutto questo ha bisogno di un caricamento

Leggere la struttura di una GIF non è un lavoro impegnativo — è una passeggiata dentro a un elenco di blocchi e un piccolo decompressore — e non c'è mai stata una ragione tecnica per mandare il file a un server per farlo. L'[analizzatore di GIF](https://abox.tools/it/analizzare-gif/) qui fa tutto dentro alla pagina: la passeggiata fra i blocchi, l'LZW, i fotogrammi disegnati sullo schermo e i conti dei byte.

Qui conta più che in quasi ogni altro lavoro, perché i file che più si ha voglia di smontare sono spesso quelli su cui si è meno sicuri di volerli condividere — qualcosa recuperato, qualcosa che ti ha mandato qualcuno, qualcosa con dentro un blocco di commento che non hai ancora letto. Il [discorso lungo sul caricare i file](https://abox.tools/it/guide/e-sicuro-caricare-i-propri-file/) vale qui quanto in qualsiasi altro punto di questo sito.
