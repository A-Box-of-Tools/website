# Si può recuperare il testo coperto di nero?

Sgradevolmente spesso, sì — con lo strumento di selezione del testo, non con un laboratorio. La maggior parte dei rettangoli neri viene disegnata *sopra* le parole e salvata accanto a loro, e le parole viaggiano lì sotto. Questa pagina è il catalogo dei modi in cui succede, e di che cosa deve significare, invece, rimuovere.

Ultimo aggiornamento 26 agosto 2026

## La risposta breve

Sgradevolmente spesso, sì. Non con la scienza forense: selezionando l'area annerita e premendo copia. La maggior parte degli strumenti a cui la gente ricorre quando qualcosa va nascosto disegna un rettangolo *sopra* il contenuto e lo salva *accanto* a esso, e tutto ciò che sta sotto viaggia nel file, con pazienza, finché qualcuno non guarda.

Non è un errore raro commesso da gente sbadata. Ha pubblicato nomi tratti da atti giudiziari, cifre non oscurate di rapporti ufficiali — e, in un rilascio di massa di documenti processuali nel dicembre 2025, nomi anneriti che si leggevano nel giro di ore. Le persone dietro quegli errori avevano avvocati e procedure. Ciò che non avevano è la distinzione di cui parla questa pagina: la differenza fra coprire e rimuovere.

## Il rettangolo che è un oggetto

In un lettore PDF, in un elaboratore di testi, in un programma di presentazioni o in un editor di immagini a livelli, un riquadro nero disegnato non è vernice. È un *oggetto*: una forma con posizione, dimensione e colore, salvata nel file come cosa a sé, davanti a un testo che resta interamente presente. Il documento non dice «questa parola non c'è più»; dice «questa parola è qui, e davanti c'è un rettangolo».

Tutto discende da lì. Seleziona l'area e copia, e gli appunti ricevono il testo, perché copiare legge lo strato del testo e ignora la decorazione che gli sta davanti. Apri il file in un editor e il rettangolo si sposta, semplicemente. Esporta in un altro formato e i livelli possono venire appiattiti in un altro ordine. Sullo schermo il riquadro è identico a un'oscuratura vera, ed è esattamente per questo che l'errore sopravvive alle revisioni: l'occhio controlla la pagina, e la pagina sembra a posto.

Il PDF aggiunge una variante più silenziosa. Un PDF può dichiarare che una sequenza di glifi «compita» qualcosa di diverso da ciò che è disegnato — una funzione di accessibilità chiamata `/ActualText` — e copiare legge la dichiarazione invece dell'inchiostro. Un documento può quindi far trapelare una parola che sulla pagina non è nemmeno visibile.

## La sfocatura che è aritmetica

La pixellatura sembra più sicura di quanto sia. Un mosaico è una griglia di medie, e una media è una *misurazione* di ciò che c'era sotto: piccola e con perdita, ma pur sempre una misurazione. Per un testo in un carattere noto a una dimensione prevedibile, è bastata a rileggerlo: prendere ogni stringa plausibile, disegnarla, pixellarla nello stesso modo, e tenere la candidata il cui mosaico combacia. Niente di tutto ciò richiede un laboratorio; è un ciclo e un confronto.

La sfocatura è peggio in linea di principio. Una sfocatura è una convoluzione — ogni pixel in uscita, una media pesata dei suoi vicini — e le convoluzioni si invertono abbastanza bene, abbastanza spesso, da fare della deconvoluzione uno strumento normale della fotografia, non un attacco esotico. I due effetti condividono anche un difetto che non ha nulla di matematico: annunciano che qualcosa è nascosto e all'incirca quanto è lungo, il che per una password di sei caratteri è già un indizio.

Un riempimento uniforme non ha nessuna di queste proprietà. Un solo colore, da bordo a bordo, non trasporta la misurazione di niente. Per questo è l'impostazione predefinita dello strumento per [oscurare un'immagine](https://abox.tools/it/oscurare-immagine/) qui, per questo le sue opzioni di pixellatura e sfocatura dicono sulla loro stessa etichetta ciò che non promettono, e per questo il controllo dell'intensità riporta un numero invece di un aggettivo.

## Le copie che un file conserva del proprio passato

La terza famiglia di fallimenti non ha nulla a che fare con la copertura. I file ricordano, in modi che nulla sullo schermo mostra:

- **I metadati di una foto includono spesso una miniatura** dell'immagine com'era prima della modifica. Ritaglia via il tuo indirizzo da una foto, e il blocco EXIF può conservare ancora l'originale non ritagliato in piccolo. Il [visore e rimotore EXIF](https://abox.tools/it/rimuovere-dati-exif/) mostra quel blocco e lo toglie; c'è [una guida](https://abox.tools/it/guide/rimuovere-i-dati-exif-e-gps/).
- **Alcuni editor salvano sul posto senza troncare.** Una celebre coppia di difetti del 2023 — nello strumento di annotazione degli screenshot di un telefono e in quello di cattura di un sistema desktop — lasciava nel file i byte dell'immagine originale dopo il ritaglio, così la parte «ritagliata via» si ricostruiva dagli avanzi.
- **I PDF possono portarsi dietro la propria storia.** Un PDF modificato con salvataggi incrementali accoda i cambiamenti alla fine del file e vi lascia intatta la versione precedente, cancellazioni comprese.

Il filo comune: ciò che un visore mostra e ciò che un file contiene sono due domande diverse, e un'oscuratura verificata solo a occhio ha risposto soltanto alla prima.

## Che cosa serve per rimuovere davvero

Un'oscuratura vera cambia i dati, non la vista, e si verifica per la stessa via per cui può fallire: interrogando il file, non lo schermo.

Per un'immagine significa che i pixel sotto il riquadro smettono di esistere prima che un file venga scritto. È esattamente ciò che fa lo strumento per [oscurare un'immagine](https://abox.tools/it/oscurare-immagine/): i valori coperti vengono sovrascritti in memoria e solo allora consegnati al codificatore, così l'uscita contiene pixel neri dove stava il contenuto, non inchiostro nero davanti. La versione passo passo è nella [guida all'oscuratura di un'immagine](https://abox.tools/it/guide/oscurare-un-immagine/).

Per un PDF significa che i glifi vengono cancellati dalle istruzioni che disegnano la pagina, insieme ai portatori nascosti: dichiarazioni `/ActualText`, segnalibri, commenti, campi dei moduli. È ciò che fa lo strumento per [oscurare un PDF](https://abox.tools/it/oscurare-pdf/), che poi fa la cosa più importante: riapre la propria uscita e vi cerca le parole rimosse, e **se qualcosa è sopravvissuto, il download non c'è**. Il percorso completo è nella [guida all'oscuratura di un PDF](https://abox.tools/it/guide/oscurare-un-pdf/).

E qualunque strumento tu usi, ovunque, il collaudo spetta a te: seleziona sopra l'area oscurata e copia; cerca nel file la parola rimossa; aprilo in un altro visore. Se il contenuto è stato rimosso, niente può trovarlo — e che uno strumento faccia tutto questo nel tuo browser, senza che il file lasci la macchina, è anch'essa un'affermazione che puoi verificare invece di credere: [la guida sul caricare file](https://abox.tools/it/guide/e-sicuro-caricare-i-propri-file/) mostra come. Oscurare è l'unico lavoro in cui il file è delicato per definizione, il che ne fa l'ultimo che dovrebbe transitare dal server di uno sconosciuto.
