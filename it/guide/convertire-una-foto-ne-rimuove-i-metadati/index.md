# Convertire una foto ne rimuove i metadati?

A volte, ed entrambe le risposte hanno già scottato qualcuno. Ricodificare attraverso un canvas spoglia tutto; un convertitore accurato trasporta tutto; l'immagine è identica in entrambi i casi. L'unica mossa affidabile è smettere di prevedere e guardare il file.

Ultimo aggiornamento 26 agosto 2026

## La risposta breve

A volte. Convertire, ridimensionare o comprimere una foto ne rimuove i metadati quando lo strumento ricostruisce l'immagine dai pixel, e li conserva quando lo strumento li ricopia apposta — e nulla sullo schermo dice quale delle due cose sia successa. L'immagine appare uguale in entrambi i casi, perché i metadati non sono mai stati parte dell'immagine.

Entrambi gli esiti sorprendono, in direzioni opposte. Qualcuno conta sul fatto che «solo ridimensionare» cancelli la posizione, e la posizione sopravvive. Qualcun altro conta che la data di scatto sopravviva a un cambio di formato, e non c'è più. I due errori hanno la stessa cura: smettere di prevedere ciò che uno strumento probabilmente ha fatto, e guardare ciò che il file contiene davvero.

## Che cosa viaggia accanto, e perché è separato

Un file fotografico è due cose in un contenitore: l'immagine codificata, e un blocco di etichette che la riguardano — EXIF, spesso con XMP e un profilo colore. Le etichette dicono tipicamente quando la foto è stata scattata, fotocamera e obiettivo, l'esposizione, le coordinate GPS di dove ti trovavi, e spesso una piccola miniatura incorporata — a volte dell'immagine com'era *prima* di una modifica, ed è così che un ritaglio può mancare proprio ciò che ritagliava. Il giro completo di quel blocco è nella [guida EXIF](https://abox.tools/it/guide/rimuovere-i-dati-exif-e-gps/).

Il punto che decide tutto: le etichette stanno *accanto* ai pixel, non dentro. Uno strumento che decodifica l'immagine riceve pixel e nessuna etichetta; ciò che scrive in uscita contiene solo ciò che sceglie di rimetterci. Uno strumento che modifica il file senza ricodificare può lasciare le etichette intatte — o togliere esattamente quelle e nient'altro.

## Perché ricodificare spoglia, e copiare conserva

Quasi tutto il lavoro sulle immagini in un browser passa da un canvas: decodificare il file in pixel grezzi, trasformarli, codificare un file nuovo. Un canvas non porta etichette, quindi il file nuovo non ne ha — non per scelta ma per costruzione. Per questo il [compressore di immagini](https://abox.tools/it/comprimere-immagine/) e lo strumento per [ridimensionare le immagini](https://abox.tools/it/ridimensionare-immagine/) di qui producono uscite senza EXIF, senza GPS e senza XMP, e le loro pagine lo dicono: è inevitabile, e vale la pena saperlo quando volevi conservare la data.

Un convertitore, al contrario, può sforzarsi di preservare. Il [convertitore da HEIC a JPG](https://abox.tools/it/heic-in-jpg/) di questo sito fa esattamente questo: solleva il blocco dei metadati dal contenitore HEIC e lo installa nel JPEG, date, GPS e tutto, perché una conversione dev'essere la stessa foto con un altro cappotto. (Un'etichetta viene riscritta apposta: l'orientamento, perché l'immagine non si coricasse; e il blocco entra solo nell'uscita JPEG — il menù dei formati lo dice.) Due strumenti onesti, comportamenti opposti, ciascuno giusto per il proprio compito — ed è proprio per questo che indovinare dal tipo di strumento non funziona.

Fuori dal browser il quadro è altrettanto misto, con la stessa logica sotto. Screenshot ed esportazioni sono codifiche fresche: niente metadati di fotocamera. Le app di messaggi ricomprimono forte, quindi le foto mandate come foto perdono in genere le loro etichette — ma lo stesso file mandato «come documento» viaggia byte per byte, etichette comprese. Allegati di posta e dischi cloud spostano i file immutati. Lo schema regge: ricostruito significa spogliato, copiato significa conservato.

## Controllare invece di supporre

Il controllo richiede meno di un minuto: apri il file di uscita — non l'originale — nel [visore e rimotore EXIF](https://abox.tools/it/rimuovere-dati-exif/) e leggi che cosa c'è. Analizza il file sulla tua macchina e mostra ogni etichetta, miniatura incorporata compresa. Niente lì dentro, niente trapelato. Ancora lì, e vedi esattamente che cosa.

Da tutto quanto sopra discendono tre abitudini:

- **Quando l'obiettivo è la privacy, rimuovi deliberatamente.** Spoglia le etichette con lo strumento EXIF — modifica il file senza ricodificare, quindi l'immagine non perde nulla — e poi controlla il risultato. Non affidarti a un ridimensionamento che spoglia per caso.
- **Quando l'obiettivo è conservare la memoria, converti con uno strumento che dichiara di preservare** — e controlla anche quello, perché «probabilmente l'ha tenuto» fallisce nell'altra direzione: un archivio fotografico con le date evaporate è anch'esso una perdita.
- **Controlla il file che spedisci davvero**, dopo l'ultimo passo della tua catena. Ogni strumento decide per sé, e conta solo il contenuto del file finale.

E se lo strumento di controllo è a sua volta una pagina web, la domanda di sempre vale anche per lui: un visore di metadati riceve la tua foto, GPS compreso. Quello di qui gira interamente nel tuo browser senza spedire nulla da nessuna parte, e [la guida sul caricare file](https://abox.tools/it/guide/e-sicuro-caricare-i-propri-file/) mostra come verificare quell'affermazione invece di crederci.
