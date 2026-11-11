# Come comprimere un'immagine a un peso esatto

Qualcuno ti ha detto un numero, che siano 100 KB, 500 KB o 2 MB, e la tua foto non ci si avvicina nemmeno. Vediamo quanto costa quel numero, su cosa conviene spenderlo, e come capire se il risultato è ancora abbastanza buono da mandare.

[Apri Compressore di immagini](https://abox.tools/it/comprimere-immagine/): La dimensione la dici tu. Il resto lo calcola lui.

Ultimo aggiornamento 26 agosto 2026

## La risposta corta

Apri il [compressore di immagini](https://abox.tools/it/comprimere-immagine/), trascinaci dentro la foto, scrivi il numero che ti hanno dato e premi il pulsante. Codifica l'immagine più volte, tiene il risultato migliore che sta sotto il tuo obiettivo, e ti dice quanto è costato. Per quasi tutte le fotografie e quasi tutti gli obiettivi, il riassunto onesto è che la differenza non riuscirai a vederla.

Il resto di questa pagina è per quando non va così: quando il risultato si vede morbido, quando un PNG quasi non si muove, o quando vuoi sapere cosa sta davvero facendo lo strumento alla tua immagine prima di mandarla a qualcuno.

![La scheda dell'obiettivo: 200 kB inseriti, pulsanti con i limiti più comuni, un menu di formato e una nota su quello che lo strumento proverà a fare.](https://abox.tools/screens/compress-an-image-to-a-target-size/target.webp)

Scrivi il numero che ti hanno dato. Tutto quello che sta sotto è lo strumento che lavora per arrivarci, invece di te che tiri a indovinare su un cursore.

## Cosa chiede davvero un limite di peso

Un JPEG o un WebP la tua fotografia non la conserva. Ne conserva una descrizione, e l'impostazione della qualità decide quanto dettagliata quella descrizione può essere. Abbassala e il file si alleggerisce perché la descrizione si fa più vaga: la texture fine viene mediata via, le sfumature fanno bande, e i bordi si prendono un lieve alone di blocchi.

Quindi un limite di peso è un budget di dettaglio. La domanda utile non è «riesco a centrare i 500 KB», perché qualunque numero lo si centra sempre, ma «quanta parte dell'immagine devo cedere per arrivarci, e conta per quello che ci devo fare?».

Due regole a occhio e croce. La fotografia di una scena reale, con volti, fogliame e tessuti, nasconde bene la compressione, perché l'occhio non ha nessuna zona perfettamente piatta in cui notare il danno. Uno screenshot, un grafico, un logo o qualunque cosa con grandi tinte piatte e bordi netti di testo lo mostrano subito, e di solito dovrebbero essere un PNG o un WebP invece che un JPEG.

## Perché non esiste una formula, e cosa farci

Non c'è modo di calcolare l'impostazione di qualità che produce un file da 500 KB. Il rapporto tra le due cose dipende interamente da cosa c'è nell'immagine: alla stessa impostazione, la fotografia di un muro liscio potrebbe uscire un decimo della fotografia di un bosco. Qualunque strumento ti proponga «qualità: 60» e speri sta tirando a indovinare per conto tuo.

L'unico metodo affidabile è provare: codifica l'immagine, guarda il peso, correggi, codifica di nuovo. Farlo a mano è noioso, ed è per questo che i compressori chiedono invece un numero di qualità, così la noia la spostano addosso a te. Farlo automaticamente sono all'incirca otto codifiche, e otto codifiche di una foto da telefono sono una frazione di secondo su qualunque dispositivo fatto in questo decennio: è il motivo per cui lo strumento di questo sito chiede il peso e la ricerca la fa da sé.

Ogni peso che riporta è un file davvero codificato, non una stima. Conta quando un modulo ha un limite rigido, perché una stima ottimista del 2% è un caricamento rifiutato.

## Spendi la qualità prima dei pixel

Per alleggerire il file di un'immagine ci sono solo due strade. Puoi descrivere la stessa immagine in modo meno preciso, ed è la qualità, oppure puoi descrivere meno pixel, ed è il ridimensionamento. Non sono equivalenti, e l'ordine conta.

Prima va la qualità, perché su una fotografia il primo 30% circa di riduzione è davvero invisibile: stai buttando via dettaglio che il formato conservava con più cura di quanta ne possa verificare un occhio. Poi vanno i pixel, perché una volta che la qualità scende abbastanza da rendere visibili gli artefatti, un'immagine più piccola a una qualità decente si vede meglio di un'immagine a piena dimensione ma rovinata. Pochi pixel buoni battono tanti pixel cattivi.

È tutta lì la strategia, e vale la pena conoscerla anche se usi un altro strumento: abbassa la qualità finché non comincia a venire male, poi rimpicciolisci l'immagine invece di abbassarla ancora.

### Quando ridimensionare di proposito

A volte i pixel non servivano proprio. Una foto larga 4000 pixel mostrata in una colonna larga 600 pixel dentro una pagina web porta sei volte il dettaglio che qualcuno vedrà. Se sai già dove finirà l'immagine, ridimensionala prima a quella misura e il problema del peso spesso sparisce senza spendere nessuna qualità. Lo strumento per quel lavoro è il [ridimensionatore di immagini](https://abox.tools/it/ridimensionare-immagine/), e [la sua guida](https://abox.tools/it/guide/ridimensionare-un-immagine/) spiega come scegliere una dimensione.

## Scegliere un formato

Vale la pena conoscere tre formati, e i browser sanno scriverli tutti e tre.

- **Il JPEG** è per le fotografie. È con perdita, lo capisce qualunque cosa sia mai stata costruita, e per l'immagine di una scena reale resta un'ottima scelta. La trasparenza non la sa conservare.
- **Il WebP** è per lo stesso lavoro, fatto meglio: dal 25 al 35% circa più leggero del JPEG a una qualità che non si distingue, e tiene la trasparenza. Lo legge ogni browser attuale. Qualche vecchia applicazione da scrivania e qualche modulo di caricamento aziendale ancora no, ed è l'unico motivo vero per non usarlo.
- **Il PNG** è senza perdita, il che vuol dire che è esatto ed è pesante. È la risposta giusta per screenshot, loghi, disegni al tratto e qualunque cosa con bordi netti o tinte piatte, ed è la risposta sbagliata per una fotografia.

Se non hai vincoli da parte di chi ti ha chiesto il file, il WebP ti porta all'obiettivo con meno danno visibile del JPEG. Se il file va dentro qualcosa di vecchio, o dentro un sistema che non puoi provare, il JPEG è la risposta sicura.

## Perché il tuo PNG non si alleggerirà granché

È la sorpresa più comune, e non è un difetto dello strumento che stai usando. Il PNG è un formato senza perdita: conserva i pixel esatti, e una manopola della qualità da girare non ce l'ha, perché girarne una lo renderebbe un formato diverso. Tutto quello che un compressore PNG può fare è impacchettare gli stessi pixel in modo più furbo, e di solito vale qualche punto percentuale.

Quindi se ti serve per forza un file molto più leggero e deve restare un PNG, l'unica leva che ti resta è la dimensione: meno pixel, o meno colori. Se invece può smettere di essere un PNG, la domanda diventa cosa c'è dentro:

- **Una fotografia salvata come PNG.** Comunissimo, di solito per sbaglio, ed è il guadagno più facile di questa pagina: convertirla in JPEG o WebP spesso la rende da cinque a dieci volte più leggera senza nessun cambiamento visibile.
- **Uno screenshot o uno schema.** Converti in WebP, che è anche senza perdita quando glielo chiedi ed è in genere più leggero del PNG a parità di pixel. Passare al JPEG invece rende sfocati i bordi del testo.
- **Un logo con trasparenza.** Il WebP la trasparenza la tiene; il JPEG la riempirà di un colore pieno, che non è quasi mai quello che volevi.

## Come capire se il risultato è abbastanza buono

Guardare una miniatura non dimostra niente, perché a dimensione miniatura viene bene tutto. Ci sono due controlli migliori.

**Guardala a dimensione piena, sulla cosa più piatta dell'inquadratura.** Cielo, pelle, un muro dipinto. Il danno da compressione si vede prima nelle sfumature morbide, come blocchi o bande leggere, molto prima di toccare le zone dettagliate.

**Leggi la misura, se lo strumento te ne dà una.** Il compressore di qui decodifica il proprio risultato, lo confronta con l'originale e riporta l'SSIM: un numero che confronta luminosità, contrasto e struttura locali invece di contare i pixel cambiati, il che è molto più vicino a ciò che dà fastidio a un occhio. Sopra lo 0,98 circa le due immagini è difficile separarle anche una accanto all'altra. Sotto lo 0,95 circa, guarda prima di mandare. Riporta anche il PSNR, il classico valore in decibel, per chi lo preferisce.

Li calcola entrambi il tuo dispositivo e li mostra entrambi a te, ed è tutto il senso di averli: trasformano «perdita di qualità minima» da affermazione in un numero che puoi verificare.

![Una riga di risultato con l'originale a 1,4 MB e la copia compressa a 196 kB, la qualità con cui ci è arrivata e un link per confrontarle.](https://abox.tools/screens/compress-an-image-to-a-target-size/results.webp)

Quello che è uscito davvero, accanto a quello che è entrato. Il link di confronto è il modo per scoprire se quel numero ti è costato qualcosa di visibile.

## Tre cose da sapere prima di mandare il file

**Comprimere toglie i metadati.** Ricodificare vuol dire decodificare l'immagine in pixel e ricodificare quei pixel, e un canvas pieno di pixel non porta con sé nessun tag, quindi la posizione GPS, il modello della fotocamera, gli orari e il resto semplicemente non vengono scritti nel file nuovo. Di solito è un vantaggio. Se invece volevi togliere i tag lasciando l'immagine intatta, è un altro lavoro: il [visualizzatore e rimozione EXIF](https://abox.tools/it/rimuovere-dati-exif/) riscrive il contenitore senza ricomprimere niente, e [la sua guida](https://abox.tools/it/guide/rimuovere-i-dati-exif-e-gps/) spiega cosa c'è là dentro.

**Non comprimere mai lo stesso file due volte.** Ogni codifica con perdita butta via dettaglio per sempre, e codificare un'immagine già compressa ne butta via ancora, compresi gli artefatti del primo passaggio, che conserva fedelmente a spese di dettaglio vero. Torna sempre all'originale e comprimi una volta sola.

**Tieni l'originale.** Da una codifica con perdita non si torna indietro. Qualunque cosa tu mandi, tieni da qualche parte il file da cui sei partito.

## Niente di tutto questo ha bisogno di un caricamento

Ogni browser si porta dietro da anni un encoder JPEG, PNG e WebP: è lo stesso codice che salva un'immagine da un canvas. Comprimere un'immagine è uno dei lavori che non hanno nessun motivo tecnico per coinvolgere un server, ed è per questo che lo strumento di qui un server non ce l'ha. L'immagine viene decodificata, codificata e misurata sul tuo dispositivo, e nella `Content-Security-Policy` della pagina non c'è nessun indirizzo appartenente a questo sito a cui spedirla.

Il modo più semplice per confermarlo, qui come altrove, è caricare la pagina, staccare la connessione e comprimere qualcosa lo stesso. Se funziona ancora, non veniva caricato niente. [È sicuro caricare i propri file sui convertitori online?](https://abox.tools/it/guide/e-sicuro-caricare-i-propri-file/) propone altre tre verifiche come questa.
