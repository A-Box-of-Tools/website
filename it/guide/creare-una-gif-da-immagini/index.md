# Come fare una GIF animata da immagini

Fare la GIF è la parte facile. Ottenerne una abbastanza leggera da poterla davvero pubblicare è la parte che vale la pena leggere, perché una GIF non ha un cursore della qualità e a muoverne il peso ci sono solo tre cose.

[Apri Creatore di GIF](https://abox.tools/it/creare-gif/): Trasforma una serie di immagini in una sola animazione.

Ultimo aggiornamento 26 agosto 2026

## La risposta corta

Apri il [creatore di GIF](https://abox.tools/it/creare-gif/), trascinaci dentro le immagini, mettile nell'ordine in cui devono scorrere, imposta per quanto tenere ogni fotogramma, e fai la GIF. Parte già nella pagina, prima ancora che tu la salvi.

Tutto quello che segue riguarda le due cose che dopo vanno storte: il file è molto più grosso del previsto, oppure l'animazione va più piano di quanto dicessero i numeri. Tutte e due hanno cause precise e nessuna delle due è un difetto dello strumento.

## Perché una GIF è molto più grossa di quanto ti aspetti

Una GIF di 20 fotogrammi a 640 pixel sta tranquillamente fra gli 8 e i 15 MB. La stessa animazione in MP4 sono poche centinaia di kilobyte. Non è una GIF fatta male; è com'è il formato.

Ogni altro formato di immagini in movimento che hai usato conserva *differenze*. Un codec video scrive un fotogramma intero e poi, per quelli dopo, soltanto cosa si è mosso e dove — ed è per questo che un video di una persona che parla davanti a uno sfondo fermo costa quasi niente per fotogramma. Una GIF non può farlo. Ogni fotogramma è conservato come pixel interi, passati per un compressore senza perdita, e la cassetta degli attrezzi è tutta qui.

Non c'è nemmeno un'impostazione di qualità, perché non c'è nessun passaggio con perdita da abbassare. Un JPEG al 60 % di qualità è una scelta vera con dietro un cursore vero; una GIF non ha niente del genere. Quindi il peso è grosso modo **area × numero di fotogrammi**, e l'unico modo per spostarlo è spostare uno di quei due numeri.

## Le tre cose che la alleggeriscono davvero

Nell'ordine in cui aiutano:

**1. Falla più piccola.** Non è una fra tante opzioni, è l'opzione. Il peso segue l'area, quindi dimezzare il lato lungo porta il file a un quarto: da 640 px a 320 px trasforma 12 MB in circa 3 MB. Una GIF dentro a una pagina web o a una finestra di chat viene comunque guardata a poche centinaia di pixel. I 480 px sono l'impostazione predefinita proprio per questo, e 320 px è una risposta del tutto rispettabile.

**2. Usa meno fotogrammi.** Dieci fotogrammi tenuti un quinto di secondo l'uno fanno gli stessi due secondi di animazione di venti fotogrammi a un decimo, e metà del file. La fluidità costa byte in proporzione diretta, quindi spendila solo dove il movimento la chiede.

**3. Spegni il dithering, e taglia i colori.** Questa va contro l'intuito. Il dithering sparge un motivo fitto di pixel alternati per fingere i colori che la tavolozza non ha, e quel motivo è *rumore* — cioè esattamente quello che un compressore senza perdita non riesce a comprimere. Su disegni piatti, schermate e disegni al tratto, spegnerlo può togliere un terzo del file e venire anche meglio. Su fotografie baratta un banding visibile con il risparmio, quindi prova entrambi e guarda.

Scendere da 256 a 64 colori aiuta anche lui, anche se meno di quanto la gente speri: accorcia le parole di codice invece di togliere pixel.

Se niente di tutto questo la fa diventare abbastanza leggera, la risposta onesta è che quello che stai facendo è un video. [Trasformare le stesse immagini in un MP4](https://abox.tools/it/guide/trasformare-immagini-in-un-video/) darà forse un decimo del peso, e ovunque una GIF sia accettata per qualcosa che non sia un tag `<img>` — cioè su ogni social network — viene convertita in video al caricamento comunque.

## Quanto veloce può andare davvero una GIF

Il formato conserva il ritardo di ogni fotogramma in centesimi di secondo, il che lascia pensare che tu possa chiedere 0,01 s e ottenere cento fotogrammi al secondo. Non puoi.

Ogni browser alza a un decimo di secondo qualsiasi ritardo sotto i due centesimi. La regola viene dagli anni Novanta, quando le pagine erano piene di animazioni impostate per andare più veloci possibile e le macchine dell'epoca non reggevano, e ha superato tutte le ragioni per cui era stata introdotta. Non è mai stata tolta, e vale oggi per la tua GIF.

L'intervallo pratico quindi è:

- **0,02 s** (50 fotogrammi al secondo) — il massimo che a una GIF è permesso, e più veloce di quanto di solito serva.
- **0,05 s** (20 fotogrammi al secondo) — animazione fluida, ed è da qui che si parte se stai animando un movimento.
- **0,1 s** (10 fotogrammi al secondo) — l'aria classica della GIF. Metà fotogrammi, metà file, e si legge come una scelta voluta.
- **0,5 s e oltre** — una presentazione. Ogni immagine viene guardata, non animata.

Sotto 0,02 s non viene offerto niente, perché è un numero che in ogni browser esistente diventerebbe in silenzio 0,1 s.

## La tavolozza, e cosa sta scegliendo davvero

Un fotogramma di GIF tiene al massimo 256 colori. Una fotografia ne ha decine di migliaia. Qualcosa deve sceglierne 256, e quella scelta è l'aspetto che avrà il risultato — più di qualsiasi altra impostazione.

Lo strumento offre due modi di farla:

**I colori migliori per ogni fotogramma** dà a ogni immagine i suoi 256. È quello che viene più nitido, ed è giusto per una serie di fotografie slegate fra loro, dove ognuna vuole comunque un insieme del tutto diverso.

**Una tavolozza per tutta la GIF** costruisce una tabella sola da tutti i fotogrammi insieme. Usala quando i fotogrammi sono una *sequenza*: la stessa scena, a qualche istante di distanza. Con una tavolozza per fotogramma, qualsiasi cambiamento nell'immagine cambia quali 256 colori vengono scelti, e tutto lo sfondo si sposta un po' di colore a ogni fotogramma. Quel tremolio è la cosa che fa sembrare fatta in casa una GIF fatta in casa. Una tavolozza condivisa lo toglie, e per giunta fa un file più piccolo, perché la tabella viene scritta una volta sola invece che in ogni fotogramma.

Meno colori — 128, 64, 32 — vale la pena provarli su qualsiasi cosa piatta. L'animazione di un logo con dentro otto colori non perde niente a 32, e su una fotografia la differenza si vede subito.

![Le impostazioni di colore: una tavolozza da 128 colori, la scelta fra una tavolozza condivisa e una per fotogramma, retinatura spenta, e un riepilogo di fotogrammi, durata e dimensione stimata.](https://abox.tools/screens/make-a-gif-from-images/colours.webp)

La tavolozza è l'impostazione che pesa di più sulla dimensione, e quella che la maggior parte degli strumenti nasconde. Il riepilogo sotto si muove mentre le cambi.

## La trasparenza è un bit, e la storia finisce lì

Un pixel di GIF o è dipinto del tutto o è del tutto invisibile. In mezzo non c'è niente: niente ombra al 50 %, niente bordo morbido, niente sfumatura.

Quindi se le immagini di partenza hanno trasparenza, accenderla tiene trasparenti le zone trasparenti — ma ogni bordo con antialiasing, che è una sfumatura dalla forma verso il nulla, viene tagliato a metà strada e diventa duro e visibilmente seghettato. Le forme tonde e il testo ne soffrono di più.

Se sai su che colore starà la GIF, appiattirla su quel colore verrà meglio tutte le volte. Tieni la trasparenza solo quando lo sfondo su cui finirà è davvero sconosciuto — e se la risposta è «serve un bordo morbido su qualsiasi sfondo», il formato per quello è il PNG animato o il WebP, non la GIF.

## Ordine, tempi, e far tornare bene il ciclo

Qualche cosa che si fa prima a saperla che a scoprirla:

**L'ordinamento per nome conta come si deve.** Una sequenza di render o di esportazione si ordina come intendevi tu, quindi `frame_2` finisce prima di `frame_10` e non dopo. L'ordinamento per data rimette un rullino nell'ordine in cui è stato scattato, che è quello che vuoi quando i nomi dei file sono ripartiti da 0001.

**Dai più tempo all'ultimo fotogramma.** Un ciclo in cui tutti i fotogrammi durano uguale si legge come implacabile. Tenere l'ultimo mezzo secondo circa dà all'occhio un posto dove posarsi e fa sembrare tutto intenzionale. Ogni fotogramma ha la sua durata apposta per questo.

**Un ciclo non dovrebbe fare un salto.** Dopo l'ultimo fotogramma arriva subito il primo, quindi se quei due sono molto diversi il ciclo strappa. O li rendi simili, o ti appoggi allo stacco tenendo su l'ultimo fotogramma.

**Riprodurre una volta vuol dire una volta.** Certi strumenti scrivono un conteggio di cicli pari a uno, su cui i decodificatori non si sono mai messi del tutto d'accordo: qualcuno lo riproduce due volte. Scegliere «Riproduci una volta» qui non scrive nessuna informazione sul ciclo, e quello ogni decodificatore mai costruito lo tratta allo stesso modo.

![Cinque fotogrammi in ordine, ciascuno con il proprio campo di ritardo, sopra una riga che imposta tutti i ritardi in una volta.](https://abox.tools/screens/make-a-gif-from-images/frames.webp)

Ordine e tempi, modificabili fotogramma per fotogramma. Impostarli tutti insieme è la riga sopra, ed è quello che vuole chiunque abbia più di tre fotogrammi.

## Perché questo non ha bisogno di un server

Fare una GIF sono due lavori che il browser non offre: scegliere la tavolozza e comprimere i pixel con LZW. Nessuno dei due è grande. Fra tutti e due saranno quattrocento righe, sono scritte per esteso nel repository, e girano sulla tua macchina come tutto il resto qui — ed è per questo che la pagina continua a funzionare con la rete staccata.

Il motivo per cui tanti creatori di GIF caricano i tuoi file non è che il lavoro sia difficile. È che il server è dove stanno la pubblicità e gli account. Niente, nel trasformare una serie di fotografie in un'animazione, richiede che le tue fotografie escano dalla stanza in cui sono.

[È sicuro caricare i propri file sui convertitori online?](https://abox.tools/it/guide/e-sicuro-caricare-i-propri-file/) mette in fila quattro controlli che ti diranno la stessa cosa su qualsiasi strumento, questo compreso.
