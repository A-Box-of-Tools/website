# Come ridimensionare un'immagine senza rovinarla

Ridimensionare è l'unico lavoro sulle immagini in cui il danno si decide prima di premere il pulsante, e lo decidono il numero che scrivi e la forma che chiedi. Vediamo cosa fa all'immagine ognuna di quelle scelte, e quali si possono disfare.

[Apri Ridimensionatore di immagini](https://abox.tools/it/ridimensionare-immagine/): Di' la dimensione, disegna il riquadro, scegli il formato.

Ultimo aggiornamento 26 agosto 2026

## La risposta corta

Apri il [ridimensionatore di immagini](https://abox.tools/it/ridimensionare-immagine/), trascinaci dentro la tua immagine, scrivi un numero solo, di solito la larghezza, e lascia vuoto l'altro campo. L'altezza viene dietro alla forma dell'immagine, che è quasi sempre quello che si voleva: «larga 1920» vuol dire «larga 1920 e alta quanto viene».

Tutto quello che segue riguarda cosa fare quando un numero solo non basta: quando ti hanno dato un riquadro con due lati, quando l'immagine deve diventare più grande, o quando una cartella intera di file deve uscire uguale.

![Il passo 3 del ridimensionatore: una larghezza di 1920, un'altezza lasciata vuota che dice automatica, e sotto una riga che dice che photo.jpg è 2400 per 1600 ed esce a 1920 per 1280.](https://abox.tools/screens/resize-an-image/one-number.webp)

Un numero inserito. Lo strumento calcola l'altro e lo dice prima che venga ridimensionato qualsiasi cosa.

## Rimpicciolire è sicuro. Ingrandire no.

Non sono due direzioni della stessa operazione, e vale la pena essere chiari sul perché.

**Rimpicciolire un'immagine** butta via informazione, e lo fa nell'unico modo innocuo: entrano più pixel di quanti ne escano, quindi ogni pixel del risultato è la media di dettaglio davvero misurato. Una copia rimpicciolita bene di solito si vede *meglio* dell'originale guardato a quella dimensione, perché la media toglie il rumore. Non viene inventato niente.

**Ingrandire un'immagine** deve per forza inventare. Il dettaglio non manca dal file: non è mai stato fotografato. Tutto quello che un ingranditore può fare è indovinare i pixel intermedi dai vicini, e un'ipotesi tra due valori noti è una rampa liscia, che è poi il motivo per cui una foto ingrandita si vede morbida invece che nitida. È una copia più grande della stessa immagine, non una più dettagliata.

È per questo che «non ingrandire mai un'immagine oltre la sua dimensione di partenza» è attivo di default nello strumento di qui. Toglilo se ti serve davvero il numero di pixel, per esempio una tipografia che chiede una dimensione minima o un modello che rifiuta qualunque cosa sotto una certa larghezza, ma fallo sapendo che stai comprando pixel e non dettaglio.

Gli ingranditori con apprendimento automatico che sembrano davvero aggiungere dettaglio sono tutt'altra cosa: stanno inventando texture plausibile a partire da un modello di come sono fatte di solito le immagini. Per uno sfondo del desktop va benissimo. Per la fotografia di una persona, di un documento, o di qualunque cosa da cui qualcuno trarrà una conclusione, tieni presente che il dettaglio in più è finzione.

## Tre modi di dire che dimensione vuoi

Quasi tutti gli strumenti, questo compreso, accettano gli stessi tre, e vanno bene per lavori diversi.

- **Pixel esatti.** Usalo quando qualcuno ti ha indicato il numero: un'immagine profilo che deve essere ⁦400×400⁩, un'insegna che deve essere larga 1500. Riempi un lato e lascia che l'altro segua, a meno che non ti abbiano dato tutti e due.
- **Una percentuale.** Usala quando vuoi tutto proporzionalmente più piccolo e la cifra esatta non ti interessa, tipo «metà» per una serie di foto che va dentro un documento.
- **Il lato lungo.** Il più utile dei tre per un lotto misto. «Lato più lungo 1600» fa stare ogni immagine dentro un quadrato da 1600 pixel, che sia verticale od orizzontale, ed è quello che in pratica vuol dire di solito «fammele tutte di una dimensione ragionevole».

## Quando il riquadro ha una forma diversa dall'immagine

È qui che il ridimensionamento si decide davvero. Se dai sia una larghezza sia un'altezza e i due numeri non corrispondono alle proporzioni della tua immagine, qualcosa deve cedere, e le cose che possono cedere sono esattamente quattro:

- **Stare dentro il riquadro.** L'immagine viene tenuta tutta ed esce più piccola del riquadro su un asse. Non si perde niente e non si deforma niente, semplicemente non ottieni le misure esatte che avevi chiesto. È il comportamento giusto per quasi tutto.
- **Riempire il riquadro e tagliare quello che avanza.** Ottieni esattamente le misure che avevi chiesto, e le parti di immagine che sporgono dai bordi spariscono. È giusto per miniature, immagini profilo e copertine, dove la forma è fissa e il soggetto sta in mezzo, ed è sbagliato quando la cosa che conta sta vicino a un bordo.
- **Riempire con lo sfondo.** L'immagine viene tenuta tutta e centrata, con lo spazio che avanza riempito da un colore che scegli tu. È giusto quando un sistema pretende misure esatte e tu non puoi perdere niente dell'immagine: le schede prodotto funzionano spesso così.
- **Stirarla.** L'immagine viene schiacciata o tirata per entrare. Non è mai quello che vuoi, a meno che tu non lo stia facendo apposta, ed è l'unica delle quattro che chiunque riconosce all'istante come sbagliata.

Se ti accorgi di star cercando lo stiramento, quello che probabilmente vuoi è il ritaglio.

![Gli stessi campi con 1200 in tutti e due, e sotto un menu che dice: se le forme non coincidono, stare dentro, la foto intera e un lato più corto di quello chiesto.](https://abox.tools/screens/resize-an-image/fit.webp)

Riempi tutti e due i lati e compare il menu. È l'unica impostazione di questa pagina che può perdere una parte della foto, per questo le quattro risposte qui sotto vanno lette prima di toccarla.

## Ritagliare è un altro lavoro, e spesso è quello giusto

Ridimensionare cambia quanti pixel descrivono tutta l'immagine. Ritagliare cambia quale parte dell'immagine tieni. Capita sorprendentemente spesso di andare a cercare la prima cosa intendendo la seconda, perché «questa deve essere quadrata» è un problema di ritaglio, non di ridimensionamento.

Falli in quest'ordine: prima ritaglia l'inquadratura che vuoi, poi ridimensiona il risultato alla dimensione che ti serve. Farlo al contrario vuol dire scegliere il ritaglio dentro un'immagine che ha già perso pixel.

Lo strumento di qui li fa tutti e due in un passaggio solo proprio per questo: trascina un riquadro, bloccalo su una forma se ti serve una proporzione precisa, poi di' che dimensione deve avere il risultato. Farlo in un passaggio solo vuol dire anche che l'immagine viene codificata una volta sola, il che conta per il motivo della sezione successiva.

### Ritagliare un lotto intero

Un riquadro disegnato su un'immagine viene applicato alle altre come la stessa area *relativa*, cioè le stesse frazioni della larghezza e dell'altezza di ciascun file. Per una cartella di screenshot o di esportazioni tutti della stessa dimensione è esattamente lo stesso rettangolo. Per un lotto misto è la stessa inquadratura invece dello stesso rettangolo, il che di solito è quello che si voleva, ma vale la pena saperlo prima di affidargli cinquanta file.

## Quanto costa la ricodifica, e come tenerla a una sola

Ridimensionare un JPEG o un WebP vuol dire decodificarlo, scalare i pixel e ricodificarli, e quest'ultimo passaggio è con perdita. Non è la scalatura in sé a costarti qualità: è la ricodifica.

Ne seguono due cose. Primo, l'impostazione della qualità in uscita conta, e da qualche parte attorno a ⁦80–85⁩ è invisibile per una fotografia e parecchio più leggera di 100. Secondo, fallo una volta sola: ridimensionare un'immagine che è già stata ridimensionata due volte vuol dire tre generazioni di codifica con perdita, e si vede.

Un PNG questo costo non ce l'ha, perché è senza perdita, e un PNG ridimensionato è esattamente i pixel scalati. Se stai lavorando in più passaggi e il formato finale non è ancora deciso, lavorare in PNG nel frattempo ti evita di accumulare generazioni.

Un dettaglio che vale la pena sapere sullo strumento di qui: un file che non stai cambiando affatto ti viene restituito byte per byte invece che ricodificato. Chiedi «lato più lungo 1600» su un lotto e quelli già sotto i 1600 escono intatti, tag compresi. Uno strumento che li ricodificasse in silenzio ti starebbe costando qualità su file che nessuno gli aveva chiesto di cambiare.

## La trasparenza, e cosa le succede

PNG e WebP sanno conservare la trasparenza. Il JPEG no, perché nel formato un canale alfa non c'è proprio. Quindi salvare un'immagine trasparente come JPEG deve metterci qualcosa dietro, e quel qualcosa è un colore pieno.

Quasi tutti gli strumenti usano il bianco e non te lo dicono, il che va bene finché il tuo logo non finisce su una pagina scura con un rettangolo bianco attorno. Scegli il colore di proposito, oppure salva in PNG o WebP e tieni la trasparenza. Lo stesso colore viene usato dietro una cornice di riempimento, che è l'altro punto in cui la gente ci si imbatte per sorpresa.

## Quale strumento, se ti hanno dato un numero

I numeri che vengono dati sono di due tipi diversi, e servono strumenti diversi.

**«Larga 1200 pixel»** è un problema di misure. Quello giusto è il [ridimensionatore di immagini](https://abox.tools/it/ridimensionare-immagine/): dici quanti pixel vuoi e te li dà.

**«Sotto i 500 KB»** è un problema di peso del file, e ridimensionare è solo uno dei modi di risolverlo. Il [compressore di immagini](https://abox.tools/it/comprimere-immagine/) cerca la qualità più alta che sta nel tuo obiettivo e ridimensiona solo se la qualità da sola non ci arriva, e [la sua guida](https://abox.tools/it/guide/comprimere-un-immagine-a-una-dimensione-esatta/) spiega quanto costa.

## Niente di tutto questo ha bisogno di un caricamento

Decodificare un'immagine, scalarla e ricodificarla sono cose che ogni browser sa fare da anni: è lo stesso meccanismo che una pagina web usa per disegnare un'immagine a una dimensione diversa. Non c'è nessun motivo tecnico per cui la tua foto debba andare fino a un server e tornare per uscirne più piccola, e lo strumento di qui non la manda da nessuna parte, perché la `Content-Security-Policy` della pagina elenca tutti gli indirizzi che può contattare, e nessuno di quelli appartiene a questo sito.

Se preferisci verificare invece che crederci, carica la pagina, stacca la connessione e ridimensiona qualcosa lo stesso. [È sicuro caricare i propri file sui convertitori online?](https://abox.tools/it/guide/e-sicuro-caricare-i-propri-file/) propone altre tre verifiche che puoi fare su qualunque strumento.
