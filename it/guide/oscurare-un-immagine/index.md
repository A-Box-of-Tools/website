# Come oscurare un'immagine perché quel che è coperto sparisca davvero

Coprire una cosa e toglierla sembrano identiche a schermo e non sono affatto la stessa cosa. Qui c'è la differenza, i due modi che lasciano più tracce di quanto si creda, e i controlli che ti dicono quale delle due hai appena fatto.

[Apri Oscuratore di immagini](https://abox.tools/it/oscurare-immagine/): Quello che copri viene cancellato dal file, non nascosto dentro.

Ultimo aggiornamento 26 agosto 2026

## La risposta breve

Apri l'[Oscuratore di immagini](https://abox.tools/it/oscurare-immagine/), trascinaci dentro l'immagine, traccia un riquadro su ogni cosa che nessuno deve vedere e premi «Oscura e salva». Usa il riempimento nero per tutto ciò che si legge come testo. Il file che ti torna indietro ha valori di pixel diversi dove stavano i riquadri: non c'è nessun rettangolo da spostare, perché non c'è proprio nessun rettangolo.

Tutto il resto spiega perché quest'ultima frase è il punto, e come capire se un programma che già usi può dire lo stesso di sé.

## Coprire e togliere sembrano identiche a schermo

Disegna un rettangolo nero sopra un nome in un lettore di PDF, in una presentazione, in un elaboratore di testi o in un editor di immagini a livelli. Quello che vedi è un nome con sopra un rettangolo nero. Quello che hai *salvato*, nella maggior parte di quei programmi, è un documento che contiene il nome e, separatamente, un rettangolo con una posizione, una dimensione e un colore.

Chiunque apra quel file può spostare il rettangolo, cancellarlo, o aprire il documento in un programma che disegna i livelli in un altro ordine. Il nome è ancora lì dentro. A schermo non si vede quale delle due cose sia appena successa, ed è esattamente per questo che continua a capitare a organizzazioni che hanno un ufficio legale.

Così sono finiti in pubblico atti giudiziari, relazioni ministeriali, contratti e più di un documento scansionato da un giornale. Lo schema è sempre lo stesso: il rettangolo era l'annotazione, e l'annotazione non era l'immagine.

## Che cos'è un oscuramento vero

Un'immagine è una griglia di numeri, uno per pixel. Oscurarla vuol dire **scrivere numeri diversi nella griglia** e poi salvare la griglia. Dopo di che non c'è niente da recuperare, non perché il file lo nasconda bene, ma perché quei valori nel file non ci sono. È l'unica versione di questa cosa che regga all'apertura da parte di qualcuno di curioso.

Ne discendono tre conseguenze, ed è così che dovrebbe presentarsi un file oscurato:

- **Il risultato è un'immagine piatta.** Nessun livello, nessun oggetto, nessun elenco di annotazioni, niente da accendere e spegnere. Se il tuo strumento restituisce un file con dentro un livello, ha coperto invece di togliere.
- **È un file nuovo, non uno vecchio modificato.** I pixel sono passati per un decodificatore e un codificatore, quindi quello che esce è scritto a partire dalla griglia già oscurata.
- **Spariscono anche i metadati**, come effetto collaterale. Una griglia di pixel non porta con sé modello della fotocamera, posizione GPS o data. Che cosa ci sarebbe stato altrimenti lo racconta [che cosa dice di te una foto](https://abox.tools/it/guide/rimuovere-i-dati-exif-e-gps/).

Su quest'ultimo punto vale la pena fermarsi, perché nasconde una trappola in più. Molte foto portano con sé una **miniatura incorporata**: una piccola seconda copia dell'immagine, scritta quando il file è stato creato e non sempre rigenerata quando l'immagine viene modificata. Una foto oscurata da uno strumento che modifica il file sul posto, invece di ricodificarlo, può viaggiare con una miniatura dell'originale non oscurato. È un'immagine piccola, ed è ampiamente abbastanza grande perché ci si legga sopra un nome.

![La scheda di salvataggio: un menu di formato, un cursore di qualità e una nota che dice che i pixel coperti vengono tolti dal file scritto.](https://abox.tools/screens/redact-an-image/save.webp)

Salvare è il passo che rende la cosa reale. Quello che esce è un file nuovo senza quei pixel, non l'originale con sopra un rettangolo.

## Nero, pixelatura o sfocatura: perché non sono equivalenti

Tutti e tre sovrascrivono i pixel. Uno solo non lascia niente dietro di sé.

### Riempimento nero

Ogni pixel del riquadro diventa lo stesso colore. Di quello che c'era non sopravvive niente: né un contorno, né una luminosità media, né il numero di caratteri, né la lunghezza della parola. È l'unico dei tre in cui la domanda «si potrebbe annullare?» ha per risposta un no secco, ed è quello da usare per un nome, un indirizzo, un numero di conto, una targa, una firma o un codice a barre.

### Pixelatura

Il riquadro viene tagliato in blocchi e ogni blocco diventa il colore medio di quel blocco. I pixel originali spariscono davvero, ma una griglia di medie è pur sempre una misura di ciò che c'era sotto, e per un testo quella misura può bastare.

L'attacco non è sottile. Un testo viene da un insieme piccolo di possibilità: un carattere, una dimensione, una posizione, una stringa. Chi sospetta che genere di dato ci fosse può generare ogni stringa candidata allo stesso modo, pixelarla con la stessa griglia di blocchi e confrontare le medie con le tue. La corrispondenza di solito è unica. È stato dimostrato su screenshot pixelati veri, ed esiste software pubblicato che lo fa.

Quello che decide è **di quanti blocchi è fatta la pixelatura**. Due blocchi su una parola sono due numeri, e con due numeri non si identifica una stringa. Quaranta blocchi sulla stessa parola sono quaranta numeri, e quaranta bastano e avanzano. Per questo l'Oscuratore di immagini dice di quanti blocchi è fatta la pixelatura più fine presente nell'immagine, invece di chiamare «forte» una impostazione: il numero è il fatto, l'aggettivo è un'opinione sul fatto.

### Sfocatura

Ogni pixel diventa una media pesata dei suoi vicini. Questa è una convoluzione, e le convoluzioni in linea di principio si invertono: recuperare l'originale da una copia sfocata è un problema standard con software standard, e riesce meglio proprio nel caso che qui conta, cioè un testo nitido sfocato con un raggio piccolo.

Niente di tutto questo rende inutili pixelatura e sfocatura. Un volto sullo sfondo di una foto in strada, un numero civico di fronte, lo schermo di un collega dietro di te in videochiamata: vanno benissimo, e l'immagine continua a sembrare un'immagine. La regola è semplice: **se si legge come testo, coprilo di nero.**

![L'editor: una foto con un riquadro pieno su una parte, la scelta fra nero, pixel e sfocatura, un cursore di intensità e un riepilogo delle zone marcate.](https://abox.tools/screens/redact-an-image/cover.webp)

Tre modi di coprire qualcosa, e non sono equivalenti. Questa sezione parla di quale dei tre sopravvive a qualcuno che provi a disfarlo.

## Quattro controlli prima di mandarlo

In tutto richiedono un minuto e funzionano sul risultato di qualsiasi strumento, questo compreso. Un'affermazione che puoi controllare vale più di una che ti viene chiesto di accettare.

1. **Prova a selezionare il testo.** Apri il file e trascina sulla zona coperta. Se qualcosa si evidenzia, il testo è ancora nel documento e quello che stai guardando è una forma disegnata sopra.
2. **Aprilo in un editor e cerca i livelli.** Un livello solo, chiamato qualcosa come «Sfondo», è l'aspetto che ha un'immagine oscurata. Un oggetto rettangolo a parte vuol dire che sotto c'è l'originale.
3. **Guarda la miniatura.** Alcuni gestori di file e visualizzatori mostrano la miniatura incorporata invece di rileggere l'immagine. Se la versione piccola mostra ancora ciò che hai coperto, il file è stato modificato invece che ricostruito.
4. **Ingrandisci al massimo i bordi del riquadro.** Un oscuramento applicato ai pixel ha un bordo netto esattamente sul confine. Un bordo morbido o semitrasparente vuol dire che qualcosa è stato disegnato sopra con un'opacità, e un'opacità sotto il 100 % è una copia dell'originale con una velatura.

## Dove puoi, ritaglia invece di coprire

Se la cosa che vuoi nascondere sta sul bordo dell'immagine, per esempio un'intestazione con il nome di un conto, una scheda del browser o una barra delle applicazioni con il tuo nome utente, ritagliarla è più forte che coprirla e dà anche un file più pulito. Non c'è nessun riquadro di cui sospettare, perché lì non c'è più niente.

Il [Ridimensionatore di immagini](https://abox.tools/it/ridimensionare-immagine/) ritaglia, e [la sua guida](https://abox.tools/it/guide/ridimensionare-un-immagine/) racconta che cos'altro fa. Per quello che sta in mezzo, usa l'oscuratore.

## Uno screenshot è spesso il caso peggiore

In uno screenshot l'immagine quasi mai è l'unica cosa che ti identifica. Prima di mandarne uno, guarda che cosa circonda la parte che volevi mostrare: il titolo della finestra, la barra degli indirizzi con la sua lista di suggerimenti, le schede aperte, una notifica, l'ora e la data, la barra delle applicazioni, un avatar con la sessione aperta in un angolo, il nome della rete wifi. Ognuna di queste cose può dire dove sei, e nessuna era quello che stavi guardando quando hai fatto lo scatto.

## Per tutto questo non serve nessun caricamento

Leggere un'immagine, scrivere sopra alcuni dei suoi pixel e ricodificarla sono cose che ogni browser sa fare da anni. Non c'è nessuna ragione tecnica perché la foto del tuo passaporto, della tua busta paga o del tuo estratto conto debba andare sul server di uno sconosciuto e tornare indietro solo per farsi mettere sopra un riquadro nero. E sono proprio quelle le immagini che arrivano a uno strumento del genere.

Quello di qui non le manda da nessuna parte: nella `Content-Security-Policy` della pagina c'è ogni indirizzo che può contattare, e nessuno è nostro. Carica la pagina, scollegati da internet e oscura qualcosa lo stesso, se preferisci controllare invece che fidarti. [È sicuro caricare i propri file sui convertitori online?](https://abox.tools/it/guide/e-sicuro-caricare-i-propri-file/) propone altri tre controlli che puoi fare su qualsiasi strumento.
