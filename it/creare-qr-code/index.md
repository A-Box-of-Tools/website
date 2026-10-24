# QR e codici a barre — creare un QR code o un codice a barre, offline

Lo scrivi, e diventa un codice. Per farne uno non parte niente.

> Fai un QR code per un link, una rete Wi-Fi o un biglietto da visita, oppure un codice a barre EAN-13, UPC-A, Code 128 o Code 39. Scaricalo come SVG o PNG. Succede tutto dentro il tuo browser.

Questa pagina è uno strumento interattivo che funziona interamente nel tuo browser, all'indirizzo https://abox.tools/it/creare-qr-code/ — nulla di ciò che gli affidi viene caricato. Quanto segue è tutto ciò che la pagina dice dello strumento a parole; per usarlo, apri l'indirizzo.

## Qui non si caricano codici né il testo che ci metti dentro, **mai**. Non c'è nessun server.

Un QR code è aritmetica su una stringa: non c'è nessun file da spedire e nessun servizio da interpellare. Ogni passaggio avviene in un migliaio di righe di JavaScript dentro questa pagina, che puoi leggere: la scelta della modalità, la scelta della versione, la correzione d'errore Reed-Solomon, la maschera, le barre di un codice a barre e la cifra di controllo sotto. Questo strumento non ha nessuna funzione di rete, il che qui conta più che su quasi tutte le altre pagine, perché quello che si finisce per codificare è spesso la password del Wi-Fi.

- ✗ Niente caricamenti
- ✗ Nessun account
- ✗ Nessuna scadenza
- ✓ Funziona offline
- ✓ Open source

## Come fare un QR code senza caricare niente

1. **Scegli il tipo di codice.** Un QR code contiene qualunque cosa ed è quello che la fotocamera di un telefono va a cercare, quindi è la risposta giusta a meno che qualcuno non ti abbia detto altro. Un codice a barre contiene un numero, e quale ti serve lo decide chi dovrà scansionarlo: un negozio vuole un EAN-13 o un UPC-A, un cartone da spedizione un ITF-14, e qualunque cosa a uso interno di solito è Code 128.
2. **Di' cosa ci va dentro.** Un link è il caso comune, e i campi qui sopra costruiscono gli altri formati che i telefoni conoscono: una rete Wi-Fi che si propone di collegarsi da sola, un biglietto da visita che si propone di essere salvato, una mail, un SMS, un numero di telefono, un punto su una mappa. Qualunque cosa tu scelga, la stringa finita viene mostrata sulla pagina, ed è tutto quello che un QR code contiene.
3. **Scegli quanti danni può sopportare.** I quattro livelli mettono dentro più o meno correzione d'errore, e più correzione vuol dire un codice più grande e più fitto. L basta per uno schermo, M per la carta comune, e H per qualcosa che verrà maneggiato, stampato piccolo o attaccato a una vetrina al sole. Un codice su un menu che viene pulito tutti i giorni vale un Q o un H.
4. **Imposta la dimensione, il margine e i colori.** Il margine è parte del codice: quattro moduli di spazio libero attorno sono quelli che chiede la specifica, e tagliarlo è di gran lunga il motivo più comune per cui un codice stampato non si legge. Scuro su chiaro, con un contrasto vero: uno scanner legge la differenza tra i due, quindi il grigino su bianco non va bene, e il chiaro su scuro su parecchi lettori fallisce del tutto.
5. **Provalo con il telefono che hai.** Prima di stamparne mille, scansiona quello che hai sullo schermo. Ci vogliono dieci secondi e prende tutta quella categoria di errori che un'anteprima non può prendere: una password del Wi-Fi con un carattere che andava protetto, un link a cui mancava l'`https://`, un numero di codice a barre a cui manca una cifra.
6. **Prendi l'SVG.** È il codice scritto come istruzioni invece che come pixel, quindi si stampa a qualunque dimensione senza diventare morbido, e un bordo morbido è esattamente quello che uno scanner non riesce a risolvere. Prendi anche il PNG se la cosa in cui stai incollando un SVG non lo accetta: è disegnato a un numero intero di pixel per modulo, quindi nemmeno lui ha bordi sfocati.

## La versione lunga

[Come fare un QR code che si legga anche sul telefono di qualcun altro](https://abox.tools/it/guide/creare-un-qr-code/): Quale livello di correzione d'errore scegliere, perché il margine bianco attorno a un QR code è parte del codice, quanto grande stamparlo, e quanto ti costa dopo il codice «dinamico» di un generatore gratuito.

## Anche nella cassetta

- [Lettore di QR code e codici a barre](https://abox.tools/it/leggere-qr-code/): Punta la fotocamera, o trascina qui una foto. Si legge qui, e da nessun'altra parte.
- [Hash e checksum](https://abox.tools/it/verificare-checksum/): Controlla un download contro il numero pubblicato da chi lo distribuisce, senza mandarlo a nessuno.
- [Generatore di password e passphrase](https://abox.tools/it/generatore-password/): Generate qui, dal tuo browser, e non spedite da nessuna parte. Non viene salvato niente e non c'è cronologia.
- [Formattatore JSON](https://abox.tools/it/formattare-json/): JSON, XML, HTML, CSS e YAML, formattati o convertiti. Niente finisce incollato nel server di qualcun altro.

## Domande

### Quello che scrivo viene mandato da qualche parte?

No. Un QR code è aritmetica su una stringa, e quell'aritmetica gira nel tuo browser sul tuo dispositivo. Questo strumento non ha nessuna funzione di rete: non recupera mai niente e non spedisce mai niente. La `Content-Security-Policy` della pagina elenca poi tutti gli indirizzi che può contattare, e nessuno di quelli appartiene a questo sito. Qui la cosa conta più che su quasi tutte le altre pagine, perché quello che si mette più spesso in un QR code è la password del proprio Wi-Fi.

### Questi codici scadono, o smettono di funzionare?

No, e non possono. Quello che scrivi è quello che il codice contiene, quindi scansionarlo restituisce esattamente quella stringa per sempre. I codici che scadono sono quelli che hanno dentro l'indirizzo di qualcun altro: un QR code «dinamico» contiene un link al server del generatore, che rimanda al tuo, e questo vuol dire che loro possono contare ogni scansione, cambiare dove porta, o spegnerlo quando finisce una prova. Qui non si passa attraverso niente.

### È gratis, e posso usarlo per lavoro?

È gratis, non c'è account, non c'è filigrana e non c'è limite a quanti ne fai, e il risultato lo puoi mettere su un prodotto, un manifesto o una vetrina. QR Code è un marchio registrato di Denso Wave, che ha dichiarato che non lo farà valere contro chi usa i codici, e la specifica è pubblicata come ISO/IEC 18004 ed è libera da implementare, che è poi quello che fa questa pagina. Il sito ha della pubblicità, ed è quella che lo mantiene.

### Quale livello di correzione d'errore devo scegliere?

M, a meno che tu non abbia un motivo. L fa il codice più piccolo e va benissimo su uno schermo; M sopravvive a un uso normale; Q e H sono per un codice che verrà stampato piccolo, plastificato, attaccato a una vetrina o coperto in parte da un logo. Ogni scalino in su mette dentro più dati di controllo, e a parità di testo questo richiede un simbolo più grande: passare da L a H all'incirca raddoppia il numero di moduli per la stessa stringa.

### Quanto può contenere un QR code?

Alla dimensione massima, 177 moduli per lato, ci stanno fino a 7.089 cifre, 4.296 tra lettere maiuscole e cifre, o 2.953 byte di qualunque altra cosa, e questo con la correzione d'errore più debole; con la più forte è circa un terzo. In pratica però il limite non è il formato ma lo scanner: oltre qualche centinaio di caratteri i moduli diventano così piccoli che la fotocamera di un telefono comune non li risolve a distanza di braccio. Un codice lungo di solito è il segno che al suo posto ci vorrebbe un link corto.

### Perché il mio codice è più grande se scrivo il link in minuscolo?

Perché un QR code ha una modalità per maiuscole e cifre che impacchetta due caratteri in undici bit, e una modalità del genere per il minuscolo non ce l'ha, quindi lì ogni carattere costa otto bit. Un URL scritto `HTTPS://ESEMPIO.IT/PAGINA` può essere un terzo più piccolo dello stesso URL in minuscolo. Lo schema e l'host non distinguono maiuscole e minuscole, quindi urlarli non cambia niente tranne la dimensione; il percorso dopo l'host invece le distingue, quindi quello lascialo stare.

### Sa anche leggere un QR code, oltre a farlo?

Non questa pagina, ma quella accanto sì: [il lettore](https://abox.tools/it/leggere-qr-code/) prende una foto, uno screenshot o la tua fotocamera e ti restituisce la stringa. È un lavoro parecchio più grosso che disegnarne uno — trovare il simbolo dentro un'immagine, correggere l'angolo da cui è stata scattata e riparare i danni sono tre problemi che questa pagina non ha —, ed è per questo che è uno strumento a sé e non un bottone qui. Funziona alle stesse condizioni di tutto il resto: niente caricato, e nessun fotogramma della fotocamera conservato.

### A cosa serve il margine, e posso ridurlo?

Lo spazio bianco attorno a un QR code è parte del codice. Un lettore lo usa per capire dove finisce il simbolo, e la specifica chiede quattro moduli su ogni lato; un codice a barre ne vuole una decina. Qui puoi metterlo a zero, e la figura verrà più ordinata mentre parecchi scanner non la vedranno affatto, soprattutto su uno sfondo movimentato. Se il problema è lo spazio, rimpicciolisci il codice invece di tagliargli il margine.

### Quale codice a barre mi serve?

Quello che chiede chi lo scansiona. L'EAN-13 è il codice a barre da negozio fuori dal Nord America e l'UPC-A è quello nordamericano, e tutti e due hanno bisogno di un numero assegnato a te da GS1, perché il numero identifica la tua azienda e non solo il prodotto. L'EAN-8 è la versione corta per le confezioni piccole. L'ITF-14 va sul cartone da spedizione. Code 128 e Code 39 contengono testo oltre alle cifre e non hanno bisogno di nessuna registrazione, il che li rende la risposta giusta per qualunque cosa a uso interno: beni, scaffali, schede di lavoro.

### Cos'è una cifra di controllo, e perché lo strumento ne ha aggiunta una?

È l'ultima cifra di un codice a barre da negozio, calcolata a partire da quelle che la precedono, così che uno scanner possa distinguere una lettura sbagliata da una buona. L'EAN-13 vuole dodici cifre e calcola la tredicesima; l'UPC-A ne vuole undici e calcola la dodicesima. Se scrivi il numero corto, questa pagina te la aggiunge. Se scrivi il numero intero, controlla quella che hai dato, e se non torna rifiuta invece di correggerla in silenzio, perché una cifra sbagliata sistemata di nascosto è un'etichetta che si legge come il prodotto di qualcun altro.

### Posso mettere un logo in mezzo a un QR code?

Non qui, ma il motivo per cui altrove funziona vale la pena saperlo: a renderlo possibile è la correzione d'errore. Al livello H si può distruggere all'incirca il 30% dei moduli e il codice si legge lo stesso, quindi un logo che ne copre parecchi di meno al centro, dove non c'è nessun pattern di ricerca, è un danno riparabile. Passa il codice nel tuo programma di grafica al livello H, tieni il logo sotto un quinto circa dell'area, e provalo con un telefono vero invece di fidarti.

### Perché l'SVG è meglio del PNG?

Perché un codice sono bordi, e un PNG ha un numero fisso di pixel con cui farli. Ingrandiscine uno e ogni bordo si ammorbidisce; un bordo morbido è esattamente quello con cui uno scanner fa fatica, e a una stampante da 1200 dpi a cui dai un PNG da 512 pixel stai chiedendo di inventarsi la differenza. Un SVG sono i quadrati scritti come istruzioni, quindi stampa nitido su un biglietto da visita come su un cartellone. Il PNG di qui è disegnato a un numero intero di pixel per modulo, che è il meglio che un PNG possa fare.

### Funziona offline?

Sì. Carica la pagina una volta, poi stacca la connessione e continua a funzionare. È anche il modo più semplice per dimostrare che non viene caricato niente, perché uno strumento che spedisse via il tuo testo per farne disegnare un codice si fermerebbe nell'istante in cui stacchi la spina.

## Come si verifica quello che promette

- **Quello che scrivi non ha dove andare.** La Content-Security-Policy elenca tutti gli indirizzi che questa pagina può contattare, e nessuno di quegli indirizzi appartiene a questo sito. Non esiste un punto di raccolta in cui una password del Wi-Fi possa finire, e nel codice non c'è niente che ce la manderebbe se anche esistesse.
- **Qui dentro niente va a recuperare niente.** In `src/` non c'è né un `fetch`, né un `XMLHttpRequest`, né un `sendBeacon`. Il codice viene costruito dalla stringa per via aritmetica e disegnato come SVG, su questa pagina, sul tuo dispositivo.
- **Il codice non punta a noi.** Quello che scrivi è quello che il codice contiene. Parecchi generatori gratuiti ti restituiscono invece un codice che contiene un link al loro sito, che poi rimanda al tuo: così ogni scansione la contano loro, e il codice smette di funzionare il giorno in cui smettono di pagare il dominio o decidono che il piano gratuito è scaduto. Qui non si accorcia niente, non si rimanda da nessuna parte e non si traccia niente, e la stringa mostrata sulla pagina è la stringa che sta dentro la figura.
- **Il PNG è fatto a partire dall'SVG che hai sullo schermo.** Il download non è una seconda resa che potrebbe non concordare con l'anteprima: lo stesso markup viene consegnato al browser e dipinto su un canvas. È anche il motivo per cui si può fare senza contattare niente, perché non c'è nessun carattere tipografico da recuperare e nessuna immagine da caricare lì dentro.
- **Cosa carica Google, e cosa non gli arriva.** Gli script della pubblicità e della misurazione arrivano da Google, il pulsante delle donazioni da Buy Me a Coffee. A nessuno di loro viene passato niente di quello che scrivi. Ogni riga che trasforma una stringa in un codice è servita da questa origine ed è elencata nel repository.
- **Funziona offline.** Stacca la rete e lo strumento resta identico, perché al suo interno non c'è mai stato un passaggio di rete. È la prova più semplice che ci sia.

**Verifica tu stesso.** Niente di quanto sopra va preso per buono. Questa pagina la genera, dai modelli e dalla configurazione del repository, uno script di build che puoi leggere ed eseguire anche tu, e il risultato finisce sul branch `dist`: puoi quindi confrontare quello che viene servito con quello che produce una build dei sorgenti. https://github.com/A-Box-of-Tools/website

I file da leggere per primi sono `config/site.toml` per la Content-Security-Policy, `src/qr-encode.js` e `src/qr.js` per il QR code in sé, con le modalità, la versione e i blocchi nel primo e i pattern fissi, la maschera e i bit di formato nel secondo, poi `src/gf256.js` per la correzione d'errore e `src/barcode.js` per quelli a righe.
