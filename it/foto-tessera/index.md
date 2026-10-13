# Foto tessera — passaporto e visto a norma

Scegli il paese. Applica quella norma, esattamente.

> Fai una foto per passaporto o visto secondo la norma pubblicata del tuo paese: millimetri e DPI esatti, una guida dal vivo per l'altezza della testa e la linea degli occhi, il controllo dello sfondo, un foglio 10x15 pronto da stampare e un file schiacciato dentro il limite in KB del portale. Non viene caricato niente.

Questa pagina è uno strumento interattivo che funziona interamente nel tuo browser, all'indirizzo https://abox.tools/it/foto-tessera/ — nulla di ciò che gli affidi viene caricato. Quanto segue è tutto ciò che la pagina dice dello strumento a parole; per usarlo, apri l'indirizzo.

## Qui non si caricano foto, **mai**. Non c'è nessun server.

Il ritaglio, le misure, la lettura dello sfondo e la stampa girano tutti nel tuo browser, sul tuo hardware, con il codificatore JPEG che si porta già dietro. Questo strumento non ha nessuna funzione di rete, niente da scaricare e niente da mandare. E anche se ci fosse una via d'uscita, dall'altra parte di questa pagina non c'è nessun server a cui mandare una fotografia della tua faccia.

- ✗ Niente caricamenti
- ✗ Nessun account
- ✗ Nessuna filigrana
- ✓ Funziona offline
- ✓ Open source

## Come fare una foto tessera che non torni indietro

1. **Scegli la fotografia.** Una foto col telefono davanti a un muro liscio, di giorno, scattata da un metro e mezzo circa. Il browser la legge direttamente dal tuo disco, e nel frattempo non esce niente da nessuna parte.
2. **Scegli il paese e il documento.** Il pannello mostra allora la misura di stampa, la fascia di altezza della testa, la linea degli occhi, il colore dello sfondo e i limiti di caricamento di quella norma, insieme all'autorità da cui viene ogni numero e alla data in cui è stato letto. Niente in quell'elenco è tirato a indovinare, e qualsiasi cosa ti sia stata mandata e non ci sia si inserisce sotto «Da qualunque altra parte».
3. **Controlla i quattro puntini sul tuo viso.** Sommità del capo, mento e ciascuna pupilla: quei quattro punti sono tutto quello che la norma misura. Vengono messi misurando la foto stessa, e la riga sotto dice quali ci è riuscita e quali ha dovuto ricavare. Trascina quello caduto male, oppure passa a *Li metto io* e falli tutti e quattro a mano. Poi premi *Adatta il riquadro* e il ritaglio finisce dove lo vuole quel paese.
4. **Leggi i quattro controlli, e lo sfondo.** Altezza della testa, linea degli occhi, centratura e inclinazione, ognuno misurato sul riquadro com'è adesso e ognuno che dice da che parte trascinare se è fuori. Lo sfondo viene letto dalla parte alta e dai lati del ritaglio e confrontato con il colore che la norma chiede; la disomogeneità, che è quello che fa davvero respingere le foto, viene misurata a parte rispetto al colore.
5. **Prenditi i tre file.** La stampa, ai millimetri esatti e con la risoluzione scritta dentro il file, così un negozio la stampa nella misura giusta. Il foglio, con tante copie quante ne tiene un ⁦10 × 15⁩ e i segni di taglio negli spazi. E il caricamento, alla dimensione in pixel che il portale pretende e dentro la fascia in KB che impone da entrambe le parti.

## La versione lunga

[Come farsi una foto tessera che non torna indietro](https://abox.tools/it/guide/fare-una-foto-tessera/): Cosa viene misurato davvero in una foto tessera — altezza della testa, linea degli occhi, sfondo —, quali numeri vuole ciascun paese, e come stare dentro ai limiti in pixel e in KB di un modulo online.

## Anche nella cassetta

- [Impilatore di immagini](https://abox.tools/it/impilare-immagini/): Venti fotogrammi in uno, senza venti caricamenti e senza un convertitore RAW.
- [Oscuratore di immagini](https://abox.tools/it/oscurare-immagine/): Quello che copri viene cancellato dal file, non nascosto dentro.
- [Visualizzatore e rimozione EXIF](https://abox.tools/it/rimuovere-dati-exif/): Guarda cosa dice di te una foto. Poi toglilo.
- [Visualizzatore DICOM](https://abox.tools/it/visualizzatore-dicom/): TC, RM, radiografie ed ecografie, con la finestra, l'header e le misure.

## Domande

### La mia foto viene caricata da qualche parte?

No. L'immagine viene decodificata, ritagliata, misurata e scritta dal tuo browser sul tuo hardware, con il codificatore JPEG che il browser ha già. Questo strumento non ha nessuna funzione di rete: non scarica mai niente e non manda mai niente, e la `Content-Security-Policy` della pagina elenca ogni indirizzo che può contattare, nessuno dei quali appartiene a questo sito. Qui vale più che sulla maggior parte degli strumenti: il file è una fotografia della tua faccia.

### Quali paesi sono coperti?

Le specifiche trascritte finora sono lo standard ICAO stesso, gli Stati Uniti (passaporto e iscrizione alla lotteria dei visti, che hanno regole di caricamento diverse), il Regno Unito, il visto Schengen, la Germania, il Canada, l'Australia, l'India (passaporto, la stampa ⁦35 × 45⁩ mm e la foto e la firma per i moduli SSC e UPSC), la Cina e il Giappone. Ogni voce nomina l'autorità da cui viene e la data in cui è stata letta. Tutto il resto si inserisce sotto «Da qualunque altra parte», dove ogni numero lo scrivi tu; e siccome quasi tutto il mondo rilascia seguendo la geometria ICAO, quella voce parte proprio da lì.

### Come trova la sommità del capo, il mento e gli occhi senza un modello di volti?

Dando per scontato qualcosa che un riconoscitore di volti generico non può dare per scontato e questo strumento sì: ognuna di queste norme pretende la stessa scena — una persona, di fronte all’obiettivo, davanti a un muro liscio e illuminato in modo uniforme. Il colore del muro viene quindi letto dal bordo della foto, tutto ciò che non è quel colore è la persona, e la sua parte più alta è la sommità del capo, capelli compresi. Le pupille si cercano come la coppia migliore di macchie più scure di ciò che le circonda, alla stessa altezza e ai due lati del centro della testa: un confronto locale, quindi niente in esso dipende dal colore di un viso. Il mento è l’unico che così non si trova, perché una mascella davanti a un collo è un bordo morbido senza cambio di colore; viene ricavato dalle pupille, che stanno un po’ sotto la metà di una testa, una volta contati i capelli che ha sopra, e poi confrontato con il contorno. È tutta aritmetica, in `src/detect.js`: nessun peso, nessun motore di inferenza, niente scaricato, e la stessa aritmetica per ogni volto. Quest’ultima parte è quella che conta, perché un riconoscitore distribuito insieme allo strumento sbaglia in modo disuguale — peggio su certi volti che su altri — e le persone le cui foto vengono già respinte più spesso sono proprio quelle che lascerebbe a piedi.

### Quanto posso fidarmi dei puntini che mette?

Abbastanza per partire, non abbastanza da non guardarli. Ognuno dei quattro ha una foto su cui sbaglia: un muro a motivi o una libreria non lascia nessun contorno contro cui ritagliare una testa, una testa tagliata in alto non ha la sommità del capo nella foto, e occhiali, una frangia folta o gli occhi chiusi possono mettere le pupille sul tratto sbagliato. Perciò lo strumento dice a chiare lettere quali dei quattro ha misurato e quali ha dovuto ricavare, davanti a una foto senza sfondo liscio rifiuta invece di inventarsi una risposta, e lascia ogni puntino trascinabile. Il ritaglio viene preso da dove finiscono i puntini, mai da dove sono partiti. Se preferisci metterli tutti e quattro tu, l’interruttore sopra la foto dice *Li metto io*, e spostare un puntino a mano ci passa da solo: da quel momento sono tuoi e niente li sposterà.

### Cos'è la regola dell'altezza della testa, e perché la mia non la rispetta mai?

Ognuna di queste specifiche dice quanta parte dell'inquadratura deve occupare la testa, misurata dal sotto del mento alla sommità del capo, capelli compresi: di solito dal 70 all'80 per cento, che per una foto da 45 mm fa da 31,5 a 36 mm. Il motivo più comune per cui non torna è il selfie: un braccio è lungo circa 60 cm, il che deforma il viso e mette la testa troppo grande nell'inquadratura. Il secondo motivo più comune è la sommità del capo: è la cima dei capelli, non l'attaccatura, e segnare l'attaccatura fa venire ogni testa troppo piccola.

### Perché il file deve pesare almeno 20 KB, e come si fa a riempirlo?

I portali degli esami indiani, il modulo del visto cinese e il caricamento del passaporto britannico indicano una dimensione minima oltre a una massima, perché un file sotto quella soglia di solito è una miniatura caricata per sbaglio. Una fotografia da ⁦200 × 230⁩ ha 46.000 pixel, e alla qualità migliore che un browser scriverà può ancora fermarsi a 15 KB, senza nessun modo di farla più grande comprimendo di meno. Quindi lo strumento aggiunge un segmento di commento JPEG pieno di spazi. Fa parte dello standard JPEG, ogni decodificatore lo salta, e l'immagine è bit per bit la stessa immagine: solo il file è più lungo. Il riempimento dice esattamente questo, in inglese, dentro il file.

### Controlla lo sfondo, e può sostituirlo?

Controlla e non sostituisce. Il colore viene letto da una fascia in cima al ritaglio e lungo i due lati, sopra le spalle, e confrontato con il colore della norma in CIE Lab invece che in RGB: due grigi distanti quaranta unità RGB sono indistinguibili, mentre quaranta unità di blu fanno un altro colore. La disomogeneità viene misurata a parte, perché è un'ombra su un muro bianco a far respingere davvero le fotografie, e non è un problema di colore. Sostituire uno sfondo vuol dire ritagliare una persona da un'immagine, cioè un modello di segmentazione, e uno fatto male si mangia i capelli. Allontanarsi di trenta centimetri dal muro risolve più casi di questi di qualunque filtro.

### A cosa serve il foglio ⁦10 x 15⁩?

Una cabina si fa pagare qualche euro per sei fotografie. Un banco fotografico stampa un ⁦10 × 15⁩ per pochi centesimi, e lo fa chiunque. Così lo strumento dispone sul foglio tante copie della tua foto quante ne entrano — otto, per un ⁦35 × 45⁩ su un ⁦10 × 15⁩ — con i segni di taglio negli spazi e niente stampato sopra un'immagine. Non viene ridimensionato niente: ogni copia ha esattamente la misura che la norma chiede, perché un foglio che le rimpicciolisse del due per cento per farcene stare una in più sarebbero otto fotografie tutte della misura sbagliata. Stampalo al 100 per cento; è «adatta alla pagina» a far venire il foglio sbagliato.

### Perché i DPI contano, se i pixel sono gli stessi?

Perché un JPEG può dire quanto è grande, e se non lo dice, chi lo stampa tira a indovinare. La risoluzione sta nell'intestazione JFIF, e una tela del browser scrive quell'intestazione con il campo delle unità impostato su «questo è un rapporto d'aspetto, non una risoluzione». Questo strumento riscrive quei pochi byte perché il file dichiari 300 dpi, ed è quello a trasformare ⁦413 × 531⁩ pixel in una fotografia da ⁦35 × 45⁩ mm invece che in un'immagine di nessuna dimensione precisa. Per farlo non viene decodificato niente e non si spende qualità.

### Riesce a fare anche il file della firma?

Sì: i moduli SSC e UPSC ne vogliono una da ⁦140 × 60⁩ pixel e tra 10 e 20 KB, ed è nell'elenco come specifica a sé. La guida del volto viene spenta, perché una firma non ha una linea degli occhi, e quello che si controlla al suo posto è che la carta sia chiara, che ci sia inchiostro sopra e che il ritaglio non abbia preso dentro una riga del quaderno o il bordo della pagina. Arrivare a 10 KB è la parte difficile di quella regola, non restare sotto i 20.

### Questo garantisce che la mia domanda venga accettata?

No, e nessuno strumento onestamente può. Quello che fa è applicare esattamente i numeri pubblicati e mostrarti ogni misura che ha preso, così quello che un modulo misura da solo — dimensione in pixel, peso del file, formato — è giusto, e quello che misura una persona — altezza della testa, linea degli occhi, sfondo — ce l'hai davanti con i numeri accanto. E poi le regole cambiano: ogni specifica qui dice da quale autorità viene e quando è stata letta, così puoi confrontarla con il modulo che hai davanti invece di fidarti di una tabella.

### È gratis, e mi serve un account?

È gratis, e non c'è account, non c'è registrazione, non c'è periodo di prova e non c'è una filigrana stampata sulla tua faccia. Non c'è nemmeno un limite a quante fotografie fai, perché non c'è nessun server che le paga. Il sito ha della pubblicità, ed è quella che lo mantiene; agli annunci non arriva niente sulla tua fotografia.

### Funziona offline?

Sì. Carica la pagina una volta, poi stacca la connessione e continua a funzionare: il prontuario è un file servito con la pagina, non una consultazione. È anche il modo più semplice per dimostrare che non viene caricato niente, perché uno strumento che spedisse via la tua fotografia per ritagliarla si fermerebbe nell'istante in cui stacchi la spina.

## Come si verifica quello che promette

- **Una fotografia della tua faccia non lascia mai questo dispositivo.** Qui conta più che sulla maggior parte degli strumenti: il file che questa pagina maneggia è un'immagine della tua faccia, e quello che stai per farci nomina anche il paese di cui stai chiedendo il documento. La `Content-Security-Policy` elenca ogni indirizzo che questa pagina può contattare, e non ne appartiene uno a questo sito. Qui non esiste un recapito dove la tua fotografia possa essere raccolta.
- **Qui niente va a prendere niente.** In `src/` non c'è da nessuna parte un `fetch`, un `XMLHttpRequest` o un `sendBeacon`. Il prontuario è una tabella in `src/specs.js`, servita con la pagina e messa in cache con lei: non c'è nessun elenco di paesi da consultare e niente con cui confrontare la tua foto a distanza.
- **Il volto viene trovato senza un modello di volti.** Non ci sono pesi da scaricare, né un motore di inferenza per eseguirli, né niente che venga richiesto alla rete: la sommità del capo esce dal contorno della testa contro il muro dietro, le pupille dalle zone del viso più scure di quello che le circonda. Niente di tutto ciò legge il colore della pelle, ed è proprio per questo che è scritto così — un modello che sbaglia sbaglia in modo disuguale, peggio su certi volti che su altri. È una posizione di partenza e non un verdetto: la pagina dice quale dei quattro punti non è riuscita a misurare, ogni puntino resta trascinabile, e con *Li metto io* è spento del tutto.
- **Cosa carica Google, e cosa non gli arriva.** Gli script della pubblicità e della misurazione arrivano da Google, il pulsante delle donazioni da Buy Me a Coffee. A nessuno di loro viene passato niente sulla tua fotografia, sulla tua faccia o su quale norma hai scelto. Ogni riga che legge, ritaglia, misura o scrive un file è servita da questa origine ed è elencata nel repository.
- **Funziona offline.** Stacca la rete e lo strumento resta identico, perché al suo interno non c'è mai stato un passaggio di rete. È la prova più semplice che ci sia.

**Verifica tu stesso.** Niente di quanto sopra va preso per buono. Questa pagina la genera, dai modelli e dalla configurazione del repository, uno script di build che puoi leggere ed eseguire anche tu, e il risultato finisce sul branch `dist`: puoi quindi confrontare quello che viene servito con quello che produce una build dei sorgenti. https://github.com/A-Box-of-Tools/website

I file da leggere per primi sono `config/site.toml` per la Content-Security-Policy, `src/specs.js` per il prontuario, cioè i numeri pubblicati di ogni paese, con l'autorità e la data in cui ciascuno è stato letto, `src/detect.js` per come vengono trovati i quattro punti — un contorno e due macchie scure, senza nessun modello —, `src/geometry.js` per i conti che trasformano quattro punti segnati in un ritaglio, e `src/jpeg.js` per le due modifiche all'intestazione che scrivono la risoluzione di stampa nel file e portano un caricamento troppo leggero alla dimensione su cui un modulo insiste.
