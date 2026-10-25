# Cosa dice di te una foto, e come toglierlo

Un'immagine appena uscita da un telefono porta di solito le coordinate del posto in cui è stata scattata, l'ora al secondo e abbastanza informazioni sulla fotocamera da legarla a ogni altra foto dello stesso dispositivo. Niente di tutto questo si vede sullo schermo. Vediamo cosa c'è là dentro e come toglierlo.

[Apri Visualizzatore e rimozione EXIF](https://abox.tools/it/rimuovere-dati-exif/): Guarda cosa dice di te una foto. Poi toglilo.

Ultimo aggiornamento 26 agosto 2026

## La risposta corta

Apri il [visualizzatore e rimozione EXIF](https://abox.tools/it/rimuovere-dati-exif/), trascinaci dentro le foto e premi «Rimuovi tutti i metadati». Ogni tag, i blocchi XMP e IPTC, i commenti e la miniatura incorporata se ne vanno, su tutte le foto dell'elenco in una volta sola. L'immagine in sé non viene toccata: non ricompressa, non decodificata, non cambiata di un pixel.

Prima di farlo, però, vale la pena guardare cosa c'era là dentro. Di solito è più di quanto la gente si aspetti, e quell'elenco è la ragione stessa per cui si fa tutto questo.

## Cosa c'è davvero dentro una foto

Un JPEG non è solo un'immagine compressa. È un contenitore, e accanto all'immagine stanno parecchi blocchi di informazioni che la tua fotocamera, il tuo telefono o il tuo programma di ritocco ci hanno scritto.

- **EXIF.** Il principale. Marca e modello della fotocamera, obiettivo, impostazioni di esposizione, ISO, la data e l'ora al secondo, l'orientamento in cui l'immagine va mostrata, e, su un telefono con i servizi di localizzazione attivi per la fotocamera, una posizione GPS accurata a pochi metri. Spesso anche il numero di serie del corpo macchina.
- **GPS.** Tecnicamente è parte dell'EXIF, e vale la pena nominarlo a parte perché è quello che conta di più. È scritto in gradi, primi e secondi, un formato che riesce benissimo a non sembrare un indirizzo.
- **XMP.** Un pacchetto di XML che scrivono i programmi di ritocco. Può portare il tuo nome, il tuo software, valutazioni, parole chiave, cronologia delle modifiche e una copia di alcuni campi EXIF, ed è il motivo per cui rimuovere solo l'EXIF non basta.
- **IPTC.** Un blocco più vecchio con campi di didascalia, firma, crediti e copyright, usato nella stampa e nella fotografia d'archivio.
- **La miniatura incorporata.** Una piccola seconda copia dell'immagine. Viene generata quando il file viene scritto e non sempre viene rigenerata quando l'immagine viene modificata: è così che una foto ritagliata può viaggiare con una miniatura di quello che è stato ritagliato via.
- **La maker note.** Un blocco non documentato di dati del produttore. Nessuno fuori dal produttore sa tutto quello che c'è dentro.

![L'ispettore: la miniatura di una foto accanto a un elenco di quello che è stato trovato dentro, fra cui marca e modello della fotocamera, la data dello scatto e coordinate GPS.](https://abox.tools/screens/remove-exif-and-gps-data/inside.webp)

Cosa porta con sé davvero una foto fatta con il telefono. Quasi nessuno ha mai guardato, ed è il motivo per cui questa guida esiste.

## Chi lo vede davvero

È la parte su cui vale la pena essere precisi, perché sia la versione allarmata sia quella sbrigativa sono sbagliate.

**Quasi tutti i grandi social network tolgono i metadati quando pubblichi.** Facebook, Instagram e X ricodificano le immagini caricate e nel farlo buttano i tag. Non è una gentilezza, perché i dati dalla loro parte se li tengono, ma vuol dire che una foto pubblicata su quei servizi non consegna le proprie coordinate a chiunque la guardi.

**Quasi tutto il resto li tiene.** Un allegato di posta. Un file mandato con quasi ogni applicazione di chat come «documento» invece che come foto. Un'immagine su un forum, un annuncio di un mercatino, un sito personale, un'unità condivisa, una segnalazione di bug, un ticket di assistenza. In tutti questi casi il file arriva intatto, e chiunque lo scarichi può leggerne i tag con strumenti che gli sono arrivati insieme al sistema operativo.

I rischi realistici sono banali più che drammatici: un annuncio fotografato in casa, la foto di un bambino scattata a scuola, un account apparentemente anonimo che pubblica foto che condividono tutte lo stesso numero di serie della fotocamera, uno «scattata la settimana scorsa» che era di marzo.

## Perché non risalvarla e basta?

Risalvare una foto passando da un programma di ritocco o da un compressore i metadati li rimuove davvero, perché l'immagine viene decodificata in pixel e ricodificata, e un canvas pieno di pixel non porta con sé nessun tag. Funziona, e ti costa qualità, perché quella ricodifica è con perdita.

Rimuovere i metadati come si deve invece non costa proprio niente. I tag stanno nel contenitore *attorno* all'immagine compressa e non dentro, quindi toglierli vuol dire cancellare voci da un elenco e riscrivere l'elenco. I dati compressi dell'immagine vengono copiati byte per byte e il risultato decodifica esattamente gli stessi pixel. È tutto lì il motivo per usare uno strumento per i metadati invece di un convertitore.

L'eccezione è se dovevi ricodificare comunque. Se stai già comprimendo o ridimensionando la foto, i tag se ne vanno come effetto collaterale e un secondo passaggio non ti serve.

## L'unica cosa da tenere: l'orientamento

I telefoni non ruotano l'immagine quando giri il telefono. La registrano come l'ha vista il sensore e aggiungono un tag Orientation che dice come va girata per mostrarla. Togli tutti i tag e certi visualizzatori ti mostreranno la foto di traverso.

È per questo che lo strumento di qui ha un'opzione «tieni il tag di orientamento», attiva di default. Riscrive un minuscolo blocco EXIF che contiene quel solo tag e nient'altro, e lo fa solo per le foto che ne avevano davvero bisogno. Il GPS, gli orari, il numero di serie e il resto se ne vanno lo stesso.

Toglila se preferisci che il file non porti EXIF di nessun tipo, e poi controlla il risultato prima di mandarlo, perché una foto di traverso è l'esito abituale.

![La scheda di pulizia: un pulsante per togliere tutto, con interruttori per conservare l'etichetta di orientamento e il profilo colore.](https://abox.tools/screens/remove-exif-and-gps-data/strip.webp)

Via tutto, tranne le due cose che vale la pena tenere. L'orientamento è quello che, andandosene, mette mezzo rullino di traverso.

## Modificare invece di rimuovere

Rimuovere tutto è la risposta giusta per quasi chiunque. A volte però non lo è: un fotografo può volere che la riga di copyright e le impostazioni della fotocamera restino e che se ne vada solo la posizione; un archivista può aver bisogno di correggere una data sbagliata perché sbagliato era l'orologio della fotocamera.

Si può fare in tutti e due i casi. La posizione si può cancellare per conto suo, e i tag di testo, le date, l'ISO, l'orientamento e la risoluzione si possono modificare sul posto.

Un avvertimento che vale per ogni strumento che fa questo lavoro, non solo per questo: scrivere il file ricostruisce il blocco EXIF, e una maker note contiene offset che puntano dentro il blocco *originale*. Una maker note ricostruita potrebbe quindi non essere più leggibile dal software del produttore. Se la cosa ti interessa, cancella la maker note oppure lascia il file com'è.

## I formati, e quelli che non si possono fare così

JPEG, PNG e WebP si possono riscrivere tutti in modo pulito, e sono i tre che lo strumento di qui gestisce.

L'HEIC, quello che un iPhone salva di default, e l'AVIF sono formati costruiti con box annidati, e hanno bisogno di un analizzatore del tutto diverso. Lo strumento li riconosce e te lo dice, invece di produrre un file rotto. Se hai un HEIC, convertirlo in JPEG ne rimuoverà i metadati come effetto collaterale della conversione.

Nemmeno un TIFF nudo viene gestito, e per un motivo più interessante: in un TIFF i metadati e i dati dei pixel sono indirizzati dagli stessi offset, quindi rimuovere dei tag vuol dire riscrivere l'indirizzamento stesso dell'immagine. È fattibile, ed è un altro lavoro.

## Un'abitudine che vale la pena prendere

Controlla prima di pubblicare invece che dopo. Leggere i tag richiede qualche secondo, e l'elenco dei riscontri nomina le cose che vale la pena sapere, cioè la posizione, gli orari e i numeri di serie, prima della tabella completa di tutti i tag, così non devi sapere in anticipo cosa cercare.

La posizione è mostrata prima in gradi decimali, e di proposito. «51 gradi, 30 primi, 26 secondi» non rende evidente che una foto nomina l'edificio in cui è stata scattata. Una coppia di decimali che puoi incollare in una mappa sì.

## Non caricare la foto per scoprire cosa c'è dentro

C'è un'ironia particolare nel modo abituale in cui questo problema viene risolto: una persona preoccupata di cosa riveli la propria foto la carica su un sito per scoprirlo. E adesso il sito ha la foto, le coordinate, l'orario e il numero di serie, più una copia dell'immagine su un disco che è suo.

Non ce n'è motivo. Leggere e riscrivere il contenitore attorno a un JPEG sono qualche centinaio di righe di analisi che un browser esegue benissimo, ed è per questo che lo strumento di qui non ha proprio nessuna funzione di rete: nessun `fetch`, nessun `XMLHttpRequest`, niente che potrebbe spedire un file nemmeno se qualcosa ci provasse. Caricalo una volta, stacca la connessione, e continua a funzionare.

[È sicuro caricare i propri file sui convertitori online?](https://abox.tools/it/guide/e-sicuro-caricare-i-propri-file/) spiega come verificare quell'affermazione su questo sito come su qualunque altro, e questo è il tipo di file su cui vale più la pena verificare.
