# Come salvare un fotogramma di un video come immagine

Mettere in pausa il lettore e premere il tasto di cattura dà l'immagine di una finestra. A volte basta così. Qui c'è in che cosa consiste la differenza, e come arrivare al fotogramma vero quando conta.

[Apri Estrattore di fotogrammi](https://abox.tools/it/estrarre-fotogramma-video/): Un fermo immagine a piena qualità, da qualsiasi punto.

Ultimo aggiornamento 26 agosto 2026

## La risposta corta

Apri l'[estrattore di fotogrammi](https://abox.tools/it/estrarre-fotogramma-video/), trascinaci dentro il video, trova il momento e premi *Estrai questo fotogramma*. Nei download arriva il fotogramma alla risoluzione del video stesso — ⁦3840 × 2160⁩ da un video in 4K, qualunque fosse la dimensione dell'anteprima nella pagina.

Lascia il formato su PNG, a meno che il peso del file non sia un problema. Il resto di questa pagina spiega perché quelle due frasi non sono la stessa cosa di uno screenshot, e quando la differenza conta davvero.

## Perché lo screenshot di un lettore in pausa è un'altra immagine

Un modo per farlo ce l'hanno già tutti: pausa, tasto di cattura, ritaglio dei comandi. Funziona, e per mandarlo al volo è esattamente la fatica giusta. Solo che nel frattempo all'immagine sono successe quattro cose, e nessuna si torna indietro:

- **È grande quanto la finestra, non quanto il video.** Un video in 4K dentro un lettore a mezzo schermo dà l'immagine di un lettore a mezzo schermo. Ogni pixel che stava nel file e non sullo schermo non c'è più.
- **È stata riscalata.** Qualunque cosa abbia fatto il lettore per far entrare il fotogramma in quella finestra — ammorbidire, contrastare o semplicemente ricampionare — è cotta dentro.
- **È passata dalla catena di visualizzazione.** Gestione del colore, e su un video HDR una mappatura dei toni scelta per il tuo monitor e non per il file.
- **Di solito ci sono sopra i mobili.** Comandi, barra di avanzamento, traccia dei sottotitoli, puntatore.

Un estrattore di fotogrammi salta tutte e quattro: decodifica il fotogramma che il file contiene davvero e scrive quei pixel lì. L'immagine è grande quanto il video, e nessuno ci ha disegnato sopra.

## Finire sul fotogramma giusto

Questa è la parte che quasi tutti gli strumenti sbagliano in silenzio, e vale la pena sapere cosa guardare, in uno qualsiasi di loro.

Un video non è una striscia di immagini nell'ordine in cui le guardi. Quasi tutti i fotogrammi sono conservati come descrizione di quanto differiscono da altri fotogrammi, e in qualsiasi file con fotogrammi B l'ordine in cui sono scritti non è quello in cui vengono mostrati. Uno strumento che porta un lettore su un istante e prende quello che compare è in balìa di come quel lettore arrotonda; e uno che va «avanti di un fotogramma» aggiungendo un trentesimo di secondo sbaglia su ogni video che non sia esattamente a 30 fps — cioè su quasi tutti i video di telefono, perché variano il numero di fotogrammi al variare della luce.

La via d'uscita è leggere l'elenco dei fotogrammi che il file si porta dietro e chiamarli per il posto che occupano lì dentro. Su un MP4 lo strumento qui fa proprio questo: il cursore si sposta di un fotogramma per scatto, le frecce di uno, e può dirti che sei sul fotogramma 812 di 3.540 perché li ha contati. Sui formati che non riesce a leggere direttamente lo dice, e si sposta di circa un fotogramma invece di far finta.

Una prova veloce per qualsiasi estrattore: avanza di qualche fotogramma su una scena molto mossa. Se ogni tanto l'immagine non cambia, o salta di due, lo strumento sta tirando a indovinare sui tempi.

![Il cercatore di fotogrammi: un fermo immagine con il codice di tempo impresso, una barra di scorrimento, pulsanti passo passo e campi con l'istante esatto e il numero di fotogramma.](https://abox.tools/screens/grab-a-frame-from-a-video/find.webp)

Andare fotogramma per fotogramma è il modo per centrare quello che volevi. L'istante e il numero di fotogramma indicano la stessa cosa, e si possono scrivere entrambi.

## In che formato salvarlo

Le risposte vere sono solo tre, e la scelta dipende da che fine fa l'immagine dopo.

- **PNG** — quello predefinito, e l'unico che conserva il fotogramma esatto. Scegli questo se il fermo immagine verrà ritoccato, stampato, confrontato con un altro fotogramma o tenuto. È anche il più pesante: metti in conto qualche megabyte da 1080p e circa otto da 4K, perché un'immagine fotografica non è quello in cui la compressione del PNG va bene.
- **JPEG** — un decimo del peso, e accettato ovunque. Scegli questo per una miniatura, un'anteprima o qualsiasi cosa vada dritta in un documento o in una chat. È un secondo giro di compressione con perdita sopra a quella del video, quindi è il punto di partenza sbagliato per lavorarci ancora.
- **WebP** — ancora più leggero a parità di qualità visibile, e ormai supportato dove conta. L'unico distinguo è il software vecchio: qualche programma da scrivania continua a non aprirlo.

Una cosa va detta chiaramente: un fotogramma tirato fuori da un video è già un'immagine compressa. Salvarlo in PNG non annulla quella compressione e non recupera il dettaglio che il codec ha buttato via quando il video è stato girato. Quello che il PNG ti dà è che niente venga buttato via *due volte*. Se il fermo immagine va poi corretto di colore o ritagliato, conta; se lo mandi a qualcuno, no.

## Estrarne tanti in una volta

Un fermo immagine ogni tot secondi è un lavoro diverso da un fermo immagine in un punto, e capita più spesso di quanto sembri: un provino a contatto di una registrazione lunga, miniature da cui scegliere una copertina, un campione regolare del girato per controllare fuoco ed esposizione lungo una giornata di riprese.

Imposta un intervallo, premi il pulsante della serie, e lo strumento percorre il video una volta prendendo un'immagine a ogni tacca. Due note pratiche. Tieni l'intervallo largo su un video lungo — un'immagine al secondo da un'ora di girato fa 3.600 immagini, ed è per questo che lo strumento ferma una serie a 500. E per questo lavoro scegli il JPEG, se non hai motivo di fare altrimenti: cento PNG in 4K sono quasi un gigabyte tenuto nella pagina prima ancora che tu ne abbia scaricato uno.

Tornano indietro in un unico ZIP, con il timecode nel nome, così si mettono in fila nell'ordine in cui sono successe e ognuna si ritrova nel video.

![Tre fermi immagine presi dalla stessa clip, in miniatura con i loro tempi, e un pulsante per salvarli tutti insieme.](https://abox.tools/screens/grab-a-frame-from-a-video/shots.webp)

Prendine diversi e scegli dopo. Restano nella pagina finché non li salvi, e salvarli è un pulsante.

## I video verticali, e il classico fermo immagine di traverso

Se ti è mai capitato di tirare fuori un fotogramma da un video di telefono e di trovarlo coricato, il motivo è questo. Un telefono riprende in orizzontale e scrive un quarto di giro dentro al file invece di girare i pixel. I lettori leggono quel quarto di giro e lo applicano; uno strumento che legge soltanto i pixel no, e il risultato è un'immagine perfettamente buona del momento giusto, ruotata di 90 gradi.

Il file non ha niente che non va, e rimetterla dritta dopo non costa altro che la seccatura. Lo strumento qui legge la rotazione sulla traccia e la applica prima di disegnare, così un video verticale dà un'immagine verticale.

## Quello che non si recupera

Un fermo immagine può essere buono solo quanto il fotogramma da cui viene, e due cose lo limitano qualunque strumento si usi.

**Il mosso è dentro al fotogramma.** Se il soggetto si muoveva durante l'esposizione, ogni fotogramma di quel movimento è mosso, e lì dentro non c'è nessun fotogramma nitido da trovare. Girare con un tempo di otturazione più corto è l'unico rimedio, e deve succedere prima della ripresa.

**Anche la compressione è dentro al fotogramma.** Il video è compresso molto più di una fotografia, e molto più ancora sui fotogrammi in mezzo ai fotogrammi chiave. Se un fermo immagine sembra a quadretti, prova a spostarti di uno o due fotogrammi da una parte o dall'altra: un fotogramma chiave è scritto per intero e spesso è visibilmente più pulito dei vicini.

E se poi l'immagine deve avere un'altra misura o un'altra forma, fallo come passaggio a parte: il [ridimensionatore di immagini](https://abox.tools/it/ridimensionare-immagine/) ridimensiona, ritaglia e converte, e [la sua guida](https://abox.tools/it/guide/ridimensionare-un-immagine/) racconta quanto costa ciascuna di quelle cose.

## Perché questo non ha bisogno di un caricamento

Decodificare video dentro un browser è una cosa recente ed è vera: WebCodecs mette a disposizione lo stesso decodificatore hardware che il tuo telefono usa per riprodurre i video. Il lavoro succede sulla macchina che il file ce l'ha già, che per un video da diversi gigabyte è anche l'unica sistemazione sensata — caricare un'ora di 4K per riavere indietro un'immagine da 8 MB è un pessimo scambio in tutte le direzioni.

Lo strumento qui non ha nessuna funzione di rete, e la `Content-Security-Policy` della pagina elenca ogni indirizzo che può contattare: nessuno di quelli è di questo sito. Stacca internet ed estrai un fotogramma lo stesso, se preferisci controllare invece che fidarti.

[È sicuro caricare i propri file sui convertitori online?](https://abox.tools/it/guide/e-sicuro-caricare-i-propri-file/) mette in fila altri tre controlli che puoi fare su qualsiasi strumento.
