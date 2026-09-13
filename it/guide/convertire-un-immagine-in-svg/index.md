# Come ricalcare un'immagine in un SVG

Un PNG ingrandito è una scala. Un SVG sono istruzioni per disegnare, quindi è nitido a qualsiasi dimensione — e trasformare l'uno nell'altro si chiama ricalco. Funziona benissimo sulle forme e male sulle fotografie, e la differenza vale la pena capirla prima di cominciare.

[Apri Immagine in SVG](https://abox.tools/it/immagine-in-svg/): Una forma, un contorno. Indica quello che non dovrebbe esserci.

Ultimo aggiornamento 31 agosto 2026

## La risposta breve

Apri [Immagine in SVG](https://abox.tools/it/immagine-in-svg/), trascinaci l'immagine e guarda la linea rossa. Quella linea è il contorno così com'è adesso, disegnato sopra i pixel da cui è venuto. Se segue la forma, prendi il file. Se dentro c'è qualcosa che non dovrebbe esserci — un puntino, una graffetta, una didascalia, un'ombra — clicca quella cosa e sparisce.

Tutto quello che segue sono le due domande che decidono se la cosa funziona del tutto: **la tua immagine è una forma o una fotografia**, e **quale dei due modi di trovare la forma le serve**.

![I due riquadri: a sinistra l'immagine con il contorno rosso ricalcato sopra, a destra l'SVG finito.](https://abox.tools/screens/trace-an-image-into-an-svg/outline.webp)

Il contorno è disegnato sopra l'immagine e non solo accanto. È l'unico posto in cui la questione si può decidere — un contorno è giusto o sbagliato rispetto a quei pixel e a nient'altro.

## Ricalcare non è convertire, e le fotografie non si ricalcano

Convertire un JPEG in PNG è una conversione: la stessa immagine, descritta in un altro modo, e per strada non si decide niente. Il ricalco non è questo. Butta via quasi tutto e tiene una cosa sola — il confine di una forma — e poi descrive quel confine come curve. Se la tua immagine ha dentro una forma chiara, è esattamente quello che volevi. Se è la foto di una stanza, non c'è nessuna forma da tenere, e quello che torna è ogni macchia di colore simile diventata una chiazza a sé.

Non è un limite in attesa di essere superato dall'ingegneria, quindi vale la pena dire chiaramente come sono i numeri. Una pagina A4 di disegno al tratto si ricalca in tre forme e sei kilobyte. Una pagina di scrittura a mano, in cinquanta forme e centocinquanta. Un solo megapixel di fotografia si ricalca in **quattromila forme e un megabyte e mezzo** — più grande del JPEG, più lento da aprire, e non somiglia alla fotografia. A quel punto lo strumento smette di disegnare e lo dice, invece di lasciartelo scoprire dopo il download.

![L'avviso mostrato quando si ricalca una fotografia: migliaia di forme separate e un file enorme.](https://abox.tools/screens/trace-an-image-into-an-svg/photograph.webp)

A cosa si riduce una fotografia ricalcata come disegno al tratto. Il file resta tuo da scaricare; la pagina si rifiuta solo di fingere che sia un disegno.

Cosa si ricalca bene:

- loghi, marchi e monogrammi;
- stencil, timbri e file da taglio;
- firme e lettering a mano;
- disegni al tratto, tratteggi e chine da fumetto;
- silhouette, e qualsiasi cosa già in nero su bianco.

C'è un lavoro fotografico che funziona davvero, ed è un lavoro diverso: ritagliare un oggetto dal suo sfondo come silhouette piena. È a questo che serve la seconda impostazione.

## I due modi di trovare la forma

Il ricalco ha bisogno di un bit per pixel — dentro, o fuori — e ci sono due modi per deciderlo.

**Chiaro e scuro** chiede se ogni pixel è più scuro di un livello, e il livello viene calcolato per te. È esattamente giusto per inchiostro su carta, ed è quello che vuoi per ogni logo, scansione e stencil. Quando sbaglia, di solito sbaglia in un modo che si vede: sposta la soglia finché i tratti sottili sopravvivono senza che la carta diventi grigia con loro.

**Il soggetto** fa un'altra domanda, perché su una fotografia la prima non ha risposta. Una figura rosso scuro in piedi su pietra grigio scuro è scuro su scuro: non c'è luminosità che le separi, quindi nessuna soglia può farlo. Invece questo impara che cos'è lo *sfondo* da una fascia lungo il bordo dell'immagine, misura ogni pixel rispetto a quello e tiene la cosa più grande che non lo è. Una didascalia nell'angolo non è la cosa più grande, quindi viene scartata invece di essere ricalcata.

Ha un fallimento che vale la pena conoscere in anticipo: una fotografia ritagliata così stretta che il soggetto esce da due o tre lati. Il bordo è allora per lo più soggetto, quindi il modello impara i colori del soggetto stesso e la risposta viene fuori al rovescio. Niente di questo si sistema spostando un cursore — era sbagliata l'ipotesi, non l'aritmetica. Disattiva *impara lo sfondo dai bordi*, spunta *il clic dice invece «questo è sfondo»* e clicca lo sfondo due o tre volte al suo posto.

## Sistemare quello che ha sbagliato, indicandolo

Una soglia è un numero solo per un'immagine intera, ed è sempre sbagliata da qualche parte: un'ombra diventa inchiostro, una graffetta sopravvive, il centro di una O si riempie. Ognuno di questi è un errore locale con un rimedio locale ovvio, e il rimedio non è un altro cursore — è indicare la cosa.

Clicca qualsiasi cosa che non dovrebbe stare nel disegno e sparisce; cliccala di nuovo e torna. Un clic prende **tutta la macchia di quel colore**, quindi un clic toglie un puntino intero o un timbro intero invece di un pixel. Cliccare un pezzo di sfondo chiuso lo riempie invece, ed è così che un buco che non dovrebbe essere un buco si chiude. La riga sotto le immagini dice quale dei due è e quanto è grande prima che tu clicchi, quindi un clic che si porterebbe via quasi tutta l'immagine non è mai una sorpresa.

Le correzioni vengono tenute separate dalla soglia, quindi spostare il cursore dopo non le butta via, e invertire l'immagine le inverte insieme — un puntino che hai cancellato resta cancellato invece di ricomparire come un buco bucato nello sfondo.

## I due numeri della levigatura, e quando toccarli

**Dettaglio** è quanto la linea può allontanarsi dai pixel mentre viene semplificata. Sotto circa uno non fa niente del tutto — un gradino della scala sta un pixel intero fuori dalla linea a cui appartiene, quindi una tolleranza più piccola tiene ogni gradino e non resta niente da semplificare. Sopra circa due comincia a mangiarsi curve vere. Viene calcolato per forma a meno che tu non dica altrimenti, perché un numero solo non può servire allo stesso tempo una figura intera e l'asta di due pixel di una lettera.

**Nettezza degli angoli** è quanto il contorno deve girare perché quella svolta resti un angolo invece di venire arrotondata in una curva. È solo metà della decisione — un vertice viene tenuto come angolo anche se sta abbastanza lontano dai suoi vicini, il che cattura da solo ogni angolo evidente — quindi questo numero decide sempre e solo le svolte dolci. Sotto circa venti gradi tutto diventa un angolo e un cerchio torna come un poligono.

La maggior parte delle immagini non ha bisogno di toccare né l'uno né l'altra. Vale la pena conoscerli per i due casi in cui serve: la scansione di un testo molto piccolo, che vuole più dettaglio, e una forma che andrai a tagliare su una macchina, che di solito ne vuole meno.

## Cosa ottieni, e cosa farci

Un file con un solo `<path>` dentro. I contorni girano in un verso e i buchi dentro di loro nell'altro, ed è questo che permette a una forma con quaranta buchi di essere un solo elemento senza regola di riempimento da impostare — quindi Illustrator, Inkscape, Figma, un browser e quasi tutti i software da taglio lo leggono allo stesso modo.

![L'ultimo passo: quante forme e punti ha il disegno, la sua dimensione e il pulsante di download.](https://abox.tools/screens/trace-an-image-into-an-svg/save.webp)

Il conteggio merita un'occhiata prima di scaricare. Un disegno sono decine o centinaia di punti; migliaia vuol dire che l'immagine era una fotografia.

Andare nella direzione opposta — un SVG che hai già, e un PNG che ti serve — è [un lavoro diverso con la sua guida](https://abox.tools/it/guide/convertire-un-svg-in-png/). Niente del ricalco è reversibile: l'SVG che esce da qui è un disegno nuovo della forma, non l'immagine da cui è stato fatto.
