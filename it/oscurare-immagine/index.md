# Oscurare un'immagine — coprire, pixelare o sfocare

Quello che copri viene cancellato dal file, non nascosto dentro.

> Copri un nome, un indirizzo o un numero di conto in una foto o in uno screenshot e salva di nuovo l'immagine: i pixel nascosti spariscono dal file invece di restare sotto un rettangolo. Tutto avviene nel browser.

Questa pagina è uno strumento interattivo che funziona interamente nel tuo browser, all'indirizzo https://abox.tools/it/oscurare-immagine/ — nulla di ciò che gli affidi viene caricato. Quanto segue è tutto ciò che la pagina dice dello strumento a parole; per usarlo, apri l'indirizzo.

## Qui non si caricano immagini, **mai**. Non c'è nessun server.

L'immagine viene decodificata, ridipinta e ricodificata dal tuo browser, con i codec che si porta già dietro. Questo strumento non ha alcuna funzione di rete, né per scaricare né per inviare, e qui pesa più che quasi ovunque altrove su questo sito: le immagini che arrivano a uno strumento del genere sono proprio quelle con ancora leggibile un nome, un indirizzo o un numero di conto.

- ✗ Nessun caricamento
- ✗ Nessun account
- ✗ Nessuna filigrana
- ✓ Funziona offline
- ✓ Codice aperto

## Come oscurare un'immagine perché quel che è coperto sparisca davvero

1. **Scegli l'immagine.** Uno screenshot, una scansione o una foto: qualsiasi cosa il tuo browser sappia aprire. Viene letta direttamente dal disco e intanto non esce niente da nessuna parte.
2. **Traccia un riquadro su ciò che nessuno deve vedere.** E poi un altro per il successivo. Un riquadro si sposta trascinandolo, si ridimensiona dalle maniglie, oppure si raggiunge con Tab e si muove con le frecce. Quello che compare sotto il riquadro è il risultato vero, disegnato dallo stesso codice che scriverà il file.
3. **Scegli nero, pixelatura o sfocatura — e scegli il nero.** Un riempimento nero non lascia proprio niente. Pixelare e sfocare sostituiscono i pixel con medie di sé stessi, il che basta per un volto sullo sfondo e non basta per niente che si legga come testo.
4. **Premi «Oscura e salva», poi controlla il file.** L'immagine che compare dopo è il file finito, decodificato di nuovo. Aprilo in un editor e cerca un livello, oppure prova a selezionare il testo coperto: c'è una sola immagine piatta, e le parti che hai coperto sono state sovrascritte prima che venisse scritta.

## La versione lunga

[Come oscurare un'immagine perché quel che è coperto sparisca davvero](https://abox.tools/it/guide/oscurare-un-immagine/): I rettangoli neri disegnati dalla maggior parte dei programmi stanno sopra l'immagine e si possono spostare. Che cosa distingue un vero oscuramento da una semplice copertura, perché un testo pixelato si può rileggere e come controllare un file prima di mandarlo.

## Anche nella cassetta

- [Visualizzatore e rimozione EXIF](https://abox.tools/it/rimuovere-dati-exif/): Guarda cosa dice di te una foto. Poi toglilo.
- [Visualizzatore DICOM](https://abox.tools/it/visualizzatore-dicom/): TC, RM, radiografie ed ecografie, con la finestra, l'header e le misure.
- [Da immagine a ICO](https://abox.tools/it/creare-favicon/): Dentro un'immagine sola. Fuori tutte le dimensioni che chiedono un browser, Windows o un Mac.
- [Immagine in data URI](https://abox.tools/it/immagine-in-base64/): Tutta l'immagine come una riga di testo, da incollare dritta nel CSS o nell'HTML.

## Domande

### La mia immagine viene caricata da qualche parte?

No. Il file viene decodificato, oscurato e ricodificato dal tuo browser sul tuo hardware. Questo strumento non ha alcuna funzione di rete, non scarica mai niente e non invia mai niente, e la `Content-Security-Policy` della pagina elenca ogni indirizzo che può contattare, nessuno dei quali è nostro. Carica la pagina una volta, scollegati da internet e continua a funzionare.

### La parte coperta sparisce davvero dal file?

Sì, ed è il motivo per cui questo strumento esiste. L'immagine viene decodificata in un buffer di pixel; i riquadri sovrascrivono i pixel al loro interno; il buffer viene poi codificato in un file nuovo. I valori originali sono usciti dalla memoria prima che il codificatore ricevesse qualcosa, quindi non c'è nessun livello da nascondere, nessuna annotazione da togliere e nessuna cronologia da annullare. Puoi verificarlo come verificheresti l'affermazione di chiunque altro: apri il risultato in un editor di immagini e cerca un secondo livello, oppure prova a selezionare il testo che hai coperto.

### Una zona pixelata o sfocata si può recuperare?

A volte, ed è l'unica cosa che vale la pena leggere prima di scegliere. Il riempimento nero sostituisce tutto quello che sta sotto con un colore pieno, quindi non sopravvive niente: né un bordo, né una media, né il numero di caratteri. La pixelatura sostituisce ogni blocco con la media di quel blocco, e una griglia di medie è pur sempre una misura di ciò che c'era sotto: per un testo in un carattere ordinario e di dimensione prevedibile, lavori pubblicati hanno ricostruito l'originale generando le stringhe candidate e confrontandone le medie. La sfocatura è una convoluzione, e le convoluzioni in linea di principio si invertono. Pixela pure un volto sullo sfondo, e copri di nero tutto ciò che si legge come testo.

### Perché un rettangolo nero disegnato in un programma per documenti non è la stessa cosa?

Perché la maggior parte dei programmi salva il rettangolo accanto all'immagine e non dentro. Una forma disegnata in un lettore di PDF, in una presentazione, in un elaboratore di testi o in un editor di immagini a livelli è un oggetto con una posizione, appoggiato sopra la pagina: spostarlo, cancellarlo o aprire il file in un altro programma rimette esattamente ciò che copriva. Giornali, tribunali e ministeri hanno pubblicato documenti oscurati così. Qui il rettangolo non viene salvato affatto: sono valori di pixel scritti sopra quelli che c'erano.

### Toglie anche i dati EXIF e GPS?

Sì, come effetto collaterale. Salvare significa codificare una tela piena di pixel, e una tela non porta con sé nessun tag: luogo, modello della fotocamera, date e miniatura incorporata semplicemente non vengono scritti nel file nuovo. La miniatura qui conta: è una piccola seconda copia dell'immagine, non viene sempre rigenerata quando una foto viene modificata, e una foto oscurata che viaggia con una miniatura non oscurata annulla tutto il lavoro. Se vuoi togliere i metadati senza che l'immagine venga ricodificata, il [Visualizzatore e rimozione EXIF](https://abox.tools/it/rimuovere-dati-exif/) riscrive il contenitore invece dell'immagine.

### Quali formati sa leggere e scrivere?

Legge tutto ciò che il tuo browser sa decodificare, in pratica JPEG, PNG, WebP, GIF, BMP e, sulla maggior parte dei browser attuali, AVIF. Scrive JPEG, PNG e WebP, perché sono i codificatori che i browser si portano dietro. Su «automatico» un JPEG torna JPEG e tutto il resto torna PNG, così una foto resta pesante come una foto e il testo rimasto in vista su uno screenshot resta nitido. La scelta non cambia nulla dell'oscuramento: i pixel sono già spariti quando il codificatore li vede.

### Posso farlo senza mouse?

Sì. «Aggiungi un riquadro al centro» ne mette uno sull'immagine, Tab passa da un riquadro all'altro, le frecce spostano quello selezionato e Alt con le frecce lo ridimensiona; Maiusc porta ogni passo a dieci pixel e Canc lo rimuove. Ogni riquadro ha inoltre, sotto l'immagine, una riga con la sua dimensione, la sua posizione, che cosa fa e un pulsante per toglierlo: l'intero strumento si usa da tastiera e si legge con uno screen reader.

### Funziona sul telefono?

Sì. Tracciare, spostare e ridimensionare passano da eventi puntatore e non da eventi del mouse, quindi un dito funziona allo stesso modo, e le maniglie vengono disegnate più grandi su uno schermo touch. L'immagine a schermo viene ridisegnata a dimensione schermo mentre lavori; il file viene sempre oscurato alla sua piena risoluzione quando premi il pulsante.

### È gratis, e serve un account?

È gratis, e non c'è account, né registrazione, né prova, né filigrana. Non c'è nemmeno un limite alla dimensione dell'immagine, perché non c'è nessun server a pagarla: il lavoro avviene sul tuo dispositivo. Il sito ha pubblicità, ed è quella a pagarlo; agli annunci non viene dato niente delle tue immagini.

## Come si verifica quello che promette

- **Le tue immagini non hanno dove andare.** Nella Content-Security-Policy c'è ogni indirizzo che questa pagina può contattare, e nessuno è nostro. Qui non esiste un punto di raccolta dove i tuoi file possano finire, né nel codice c'è qualcosa che li spedirebbe se esistesse.
- **I pixel coperti spariscono qui, non lungo la strada.** L'immagine viene decodificata in un buffer di pixel, i riquadri vengono scritti dentro quel buffer, e il buffer passa al codificatore. In questa pagina non esiste nessuna versione dell'immagine con i riquadri come livello separato, perché una versione simile non viene mai creata: vedi `src/redact.js`.
- **Qui non si scarica niente.** Non c'è né `fetch`, né `XMLHttpRequest`, né `sendBeacon` da nessuna parte in `src/`. Il lavoro è `getImageData`, tre cicli sui byte e `canvas.toBlob`, tutta roba già installata nel tuo browser.
- **I riquadri non vengono segnalati da nessuna parte.** Dove hai tracciato, quanti sono, quanto sono grandi e quale tipo hai scelto restano nella memoria di questa pagina finché non la chiudi. In questo repository non c'è nessun evento di analytics che porti via qualcosa di tutto ciò, e l'unica domanda che il sito fa dopo un download invia un pollice su o giù e il nome dello strumento, nient'altro.
- **Funziona offline.** Scollegati dalla rete e lo strumento resta lo stesso, perché al suo interno non c'è mai stato un passaggio di rete. È la prova più semplice di tutte, ed è quella da fare prima di oscurare un passaporto.

**Verifica tu stesso.** Niente di quanto sopra va preso per buono. Questa pagina la genera, dai modelli e dalla configurazione del repository, uno script di build che puoi leggere ed eseguire anche tu, e il risultato finisce sul branch `dist`: puoi quindi confrontare quello che viene servito con quello che produce una build dei sorgenti. https://github.com/A-Box-of-Tools/website

I file da leggere per primi sono `config/site.toml` per la Content-Security-Policy, `src/redact.js` per le tre funzioni che sovrascrivono i pixel e `src/preview.js` per capire perché quello che vedi a schermo lo disegnano quelle stesse tre funzioni.
