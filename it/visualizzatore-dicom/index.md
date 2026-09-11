# Visualizzatore DICOM — apri una scansione .dcm nel browser

TC, RM, radiografie ed ecografie, con la finestra, l'header e le misure.

> Apri scansioni TC, RM, radiografie ed ecografie nel browser. Finestra e livello, scorri un'intera serie, misura in millimetri, leggi ogni tag DICOM e vedi esattamente che cosa nel file identifica il paziente. Non viene caricato niente.

Questa pagina è uno strumento interattivo che funziona interamente nel tuo browser, all'indirizzo https://abox.tools/it/visualizzatore-dicom/ — nulla di ciò che gli affidi viene caricato. Quanto segue è tutto ciò che la pagina dice dello strumento a parole; per usarlo, apri l'indirizzo.

## Qui non si caricano scansioni, **mai**. Non c'è nessun server.

La scansione viene aperta e decodificata dal tuo browser: l'header, i pixel, la finestra, le misure. Dall'altra parte di questa pagina non c'è nessun server a cui mandare dati sanitari, nemmeno se qualcosa qui dentro volesse farlo, e niente di questo file — non il nome del paziente, non lo studio, non il nome del file — viene riferito a qualcuno.

- ✗ Nessun caricamento
- ✗ Nessun account
- ✓ Funziona offline
- ✓ Codice aperto
- ✓ I file restano sul tuo dispositivo

## Come aprire un file DICOM

1. **Scegli i file.** Un file `.dcm`, oppure l'intera cartella del disco — una TC o una RM è un file per slice, e trascinarli tutti insieme è quello che rimette insieme la serie. I file vengono letti direttamente dal tuo disco dal browser; mentre lo fai non viene mandato niente da nessuna parte.
2. **Scegli la serie.** Uno studio di solito ne contiene diverse: lo scout, poi ogni acquisizione. Ognuna viene impilata nell'ordine in cui l'apparecchio l'ha presa, ricavato da dove ogni slice si trova nel corpo e non dalla numerazione, che non va sempre nella stessa direzione.
3. **Imposta la finestra.** È il comando che rende leggibile una scansione, ed è quello che un editor di immagini non ha. Trascina sopra l'immagine per allargare la finestra e in alto o in basso per spostarne il centro, oppure scegli una delle finestre con un nome — polmone, osso, cervello, tessuti molli — su una TC, dove le unità sono le stesse su ogni apparecchio del mondo.
4. **Scorri la pila.** Il cursore sotto l'immagine si muove tra le slice, e i tasti freccia fanno lo stesso una volta che hai cliccato sull'immagine. Un file multi-frame — un loop ecografico, un angiogramma — parte con il pulsante lì accanto.
5. **Misura qualcosa.** Passa a Misura e traccia una linea. Dove il file dice quanto sono distanti i suoi pixel, la risposta è in millimetri e tiene conto dei pixel che non sono quadrati; dove il file non lo dice, la risposta è in pixel e lo dichiara, invece di inventarsi una scala.
6. **Leggi l'header.** Ogni elemento del file, con il suo numero, il nome che gli dà lo standard e quello che contiene, ricercabile. Sopra, l'elenco di che cosa in questo file identifica il paziente — che è parecchio di più del nome.
7. **Prendi quello che ti serve.** Il fotogramma sullo schermo come PNG, con la finestra che hai impostato e niente scritto sopra, oppure tutto l'header in testo semplice. Sono costruiti tutti e due nella pagina a partire da quello che c'è già.

## La versione lunga

[Come aprire un file DICOM, e che cosa c'è dentro](https://abox.tools/it/guide/aprire-un-file-dicom/): Che cosa c'è su un disco dell'ospedale, perché i file non hanno estensione, come aprire una scansione .dcm in un browser, che cosa fa davvero finestra e livello, e che cosa si porta dietro una scansione sul paziente oltre all'immagine.

## Anche nella cassetta

- [Da immagine a ICO](https://abox.tools/it/creare-favicon/): Dentro un'immagine sola. Fuori tutte le dimensioni che chiedono un browser, Windows o un Mac.
- [Immagine in data URI](https://abox.tools/it/immagine-in-base64/): Tutta l'immagine come una riga di testo, da incollare dritta nel CSS o nell'HTML.
- [Da SVG a immagine](https://abox.tools/it/svg-in-png/): La dimensione la dici tu. Un vettoriale non ne ha una sua da perdere.
- [Immagine in SVG](https://abox.tools/it/immagine-in-svg/): Una forma, un contorno. Indica quello che non dovrebbe esserci.

## Domande

### La mia scansione viene caricata da qualche parte?

No. Il file viene letto, decodificato e disegnato dal tuo browser sul tuo hardware. Questo strumento non ha un lato server, e la `Content-Security-Policy` della pagina elenca ogni indirizzo che può contattare — nessuno dei quali appartiene a questo sito. Stacca la rete e continua ad aprire scansioni. \
\
Qui questo vale più che in qualsiasi altra pagina del sito. Un file DICOM porta nell'header il nome del paziente, la data di nascita e il numero di cartella, quindi caricarne uno su un visualizzatore vuol dire consegnare a uno sconosciuto una cartella clinica, non un'immagine.

### Quali file DICOM riesce ad aprire?

File non compressi in una qualsiasi delle tre transfer syntax di base — implicit e explicit little endian, e quella big endian ritirata — più deflated, RLE Lossless, JPEG baseline e JPEG Lossless, che è quello con cui è compressa la maggioranza degli studi TC e RM su un disco ospedaliero. \
\
Non sa decodificare JPEG 2000, JPEG-LS, né le sintassi MPEG e HEVC usate per il video. Servono codec che sono megabyte di libreria compilata, e una pagina che ne scaricasse uno alla bisogna non sarebbe una pagina che funziona offline. Un file in una di queste si apre lo stesso: tutto l'header viene letto e mostrato, e al posto dell'immagine c'è una riga che nomina il codec, invece dell'icona di immagine rotta che non dice niente.

### Che cosa sono «finestra e livello», e perché mi servono?

Una slice TC contiene circa quattromila valori distinti e il tuo schermo mostra duecentocinquantasei grigi. La finestra è la scelta di quale fetta di quell'intervallo se li prende tutti: sotto è tutto nero, sopra è tutto bianco, e quello che sta in mezzo viene distribuito sui grigi. \
\
È per questo che lo stesso file sembra una scansione diversa con due impostazioni, e perché polmone e osso non si possono vedere insieme. Su una TC i numeri sono unità Hounsfield, che sono definite in assoluto — l'acqua è 0 e l'aria è −1000 — quindi le finestre con un nome su questa pagina sono gli stessi numeri che usa un radiologo alla sua postazione. Su una RM o un'ecografia una scala così non c'è, e la finestra che si apre è quella che chiede il file stesso.

### Perché dice che la mia misura è in pixel?

Perché quel file non dice quanto è grande un pixel. È Pixel Spacing (0028,0030) a portare quel dato, in millimetri, e moltissime immagini ecografiche, documenti scansionati e secondary capture semplicemente non ce l'hanno. \
\
Dove c'è, la misura è in millimetri e ogni asse viene misurato con la sua spaziatura, cosa che conta sulle immagini i cui pixel non sono quadrati. Dove non c'è, la risposta onesta è un conteggio di pixel, e lo dice invece di scegliersi una scala e presentare il risultato come una lunghezza.

### Ha aperto la mia cartella come più serie. Perché?

Perché è quello che c'è dentro. Uno studio è fatto di serie — lo scout, poi ogni acquisizione o ricostruzione — e ogni file dichiara a quale appartiene in Series Instance UID (0020,000E). Il menù è costruito da lì e non dalla cartella, che di solito le tiene tutte mescolate in un unico elenco di nomi. \
\
Dentro una serie le slice vengono messe in ordine in base a dove ognuna si trova nel corpo, ricavato da Image Position e Image Orientation. Instance Number è la chiave ovvia ed è il ripiego, non la prima scelta: lo assegna qualunque cosa abbia scritto i file e non è detto che corra nella stessa direzione del paziente.

### Che cosa vuol dire l'elenco «che cosa identifica il paziente»?

È ogni campo del tuo file che nomina la persona di cui è la scansione, o che restringe il campo su chi potrebbe essere, letto da questo file sulla tua macchina. L'elenco viene da PS3.15 dello standard DICOM — la parte che dice che cosa deve sparire prima che un dataset possa dirsi de-identificato. \
\
C'è perché la cosa che si sbaglia non è pensare che una scansione abbia dentro un nome. È quanto altro ha dentro: la data di nascita, il numero di accettazione, il medico richiedente, la struttura, il numero di serie dell'apparecchio e gli UID dello studio, che sono chiavi perfette per tornare all'archivio che ha prodotto il file. Una scansione a cui è stato cancellato il nome e nient'altro non è anonima. \
\
Questo strumento si limita a mostrartelo. Non scrive niente e non cambia niente, quindi non può toglierne nemmeno un pezzo.

### Può anonimizzare una scansione?

No, e non fa finta di poterlo fare. Questa pagina legge; non ha codice che scriva un file DICOM. Quello che fa è dirti esattamente che cosa c'è nel tuo, che è la parte difficile da scoprire e la parte su cui la gente si sbaglia. \
\
Uno strumento che toglie gli identificatori è un lavoro a sé, con un'asticella molto più alta — deve riscrivere il file senza toccare i pixel, sostituire gli UID in modo coerente su tutto lo studio, e non sbagliarsi sugli elementi privati in cui certi apparecchi nascondono una seconda copia del nome. Sta nella roadmap di questo sito, non attaccato a un visualizzatore.

### Può aprire un file senza estensione .dcm, o rovinato?

Sì a entrambe le cose. L'estensione non viene guardata: quello che si controlla è il file. Un dataset scritto senza il solito preambolo di 128 byte — che è l'aspetto di una scansione presa direttamente dalla rete — viene letto ricavandone la codifica dal primo elemento, e la pagina dice che è quello che ha fatto. \
\
Un file che si interrompe a metà viene letto fin dove arriva. Tutto quello che precede il danno viene mostrato, con una nota che dice a quale byte si è fermato. È il caso in cui un visualizzatore serve di più, quindi buttare via tutto il file per i suoi ultimi dodici byte sarebbe il comportamento sbagliato.

### È un visualizzatore diagnostico?

No. Non è un dispositivo medico, non è passato per nessuna valutazione regolatoria, e niente di quello che c'è qui va usato per prendere una decisione clinica. Il tuo schermo non è calibrato, il browser non è una catena di rendering validata, e nessuna delle due cose si può sistemare da dentro una pagina web. \
\
Va benissimo invece per tutto il resto per cui si apre una scansione: controllare che cosa c'è su un disco, tirare fuori una slice per una lezione o per un articolo, leggere un header, capire perché un altro programma rifiuta il file, e vedere che cosa si porta dietro una scansione sulla persona di cui è.

### Modifica il mio file?

No. Questo strumento si limita a leggere. Non c'è un file in uscita, non c'è una ricodifica e non c'è un pulsante che scriva un DICOM — quello che puoi scaricare è un PNG del fotogramma sullo schermo e una copia dell'header in testo semplice. L'originale resta intatto sul tuo disco.

### È gratis, e serve un account?

È gratis, e non c'è un account, né un accesso né una prova. Non c'è un limite alla dimensione dei file o a quanti ne apri, oltre alla memoria della tua macchina. Il sito ospita pubblicità, ed è quella che lo paga; agli inserzionisti non viene dato niente del tuo file.

### Funziona offline?

Sì. Carica la pagina una volta, poi stacca la rete e continua a funzionare. È anche il modo più semplice per dimostrare che non viene caricato niente: uno strumento che mandasse via la tua scansione per farla disegnare altrove si fermerebbe nell'istante in cui stacchi la spina.

## Come si verifica quello che promette

- **La tua scansione non ha nessun posto dove andare.** La Content-Security-Policy elenca ogni indirizzo che questa pagina può contattare, e nemmeno uno appartiene a questo sito. Qui non c'è un endpoint dove il tuo file possa essere raccolto, e non c'è niente nel codice che lo manderebbe se ci fosse. Prima diceva `connect-src 'none'`, che era assoluto; aggiungere la pubblicità è costato quello, e dirlo fa parte del patto.
- **Qui questo pesa più che nelle altre pagine.** Un file DICOM non è un'immagine con sopra dei metadati. È una cartella clinica con dentro un'immagine: il nome del paziente, la data di nascita, il numero di cartella, il numero di accettazione, il medico che ha richiesto l'esame, la struttura e il numero di serie dell'apparecchio sono tutti campi dell'header, e viaggiano con il file ovunque vada. Caricarne uno su un sito per guardarlo vuol dire consegnare tutto questo a chi gestisce quel sito. È precisamente la cosa che questa pagina esiste per non fare.
- **Il lettore sono quattordici file in questo repository.** Niente qui dentro usa una libreria scaricata da qualche parte. `src/dicom.js` percorre il file, `src/dictionary.js` sa come si chiamano i tag, `src/pixels.js` riporta i byte a essere misure, `src/rle.js` e `src/jpeg-lossless.js` espandono le due forme compresse che questa pagina sa decodificare, e `src/window.js` mappa quello che è stato misurato sui grigi del tuo schermo.
- **Gli identificatori sono elencati per te, e per nessun altro.** La pagina stampa ogni campo del tuo file che nomina o restringe la persona di cui è la scansione, perché è la domanda a cui ha bisogno di rispondere chi sta per condividere una slice, e nessun visualizzatore risponde. Finisce sullo schermo davanti a te e non va da nessun'altra parte: in questo repository non c'è un evento di analytics che ne porti un pezzo, e la pagina non potrebbe mandarlo neanche se ci fosse.
- **Legge. Non scrive.** Qui non c'è un pulsante che cambi il tuo file, e non c'è codice che potrebbe. Quello che puoi portarti via è un PNG del fotogramma sullo schermo e una copia dell'header in testo semplice, costruiti tutti e due nella pagina a partire da quello che c'è già. L'originale resta intatto sul tuo disco, che è anche la risposta onesta a cosa succede se chiudi la scheda.
- **Che cosa carica Google, e che cosa non gli viene dato.** Gli script della pubblicità e della misurazione arrivano da Google. A nessuno dei due viene passato niente del tuo file: non i pixel, non una miniatura, non un nome, un tag, un paziente o un nome di file. Ogni riga che analizza, decodifica o disegna una scansione è servita da questa origine ed è elencata nel repository.
- **Che cosa carica il pulsante delle donazioni, e che cosa non gli viene dato.** Il pulsante «Buy me a coffee» in cima è disegnato da uno script di cdnjs.buymeacoffee.com e prende i caratteri da Google Fonts. È un link e niente di più: non segnala nessuna visita e non gli viene passato niente su di te o sui tuoi file. Non succede nulla se non lo clicchi, e quello a cui arriveresti cliccando è il sito di qualcun altro.
- **Funziona offline.** Stacca la rete e ogni parte di questa pagina continua a funzionare. È la prova più semplice di tutte: uno strumento che mandasse via la tua scansione per farla disegnare altrove si fermerebbe nell'istante in cui stacchi la spina.

**Verifica tu stesso.** Niente di quanto sopra va preso per buono. Questa pagina la genera, dai modelli e dalla configurazione del repository, uno script di build che puoi leggere ed eseguire anche tu, e il risultato finisce sul branch `dist`: puoi quindi confrontare quello che viene servito con quello che produce una build dei sorgenti. https://github.com/A-Box-of-Tools/website

I file da leggere per primi sono `config/site.toml` per la Content-Security-Policy, `src/dicom.js` per il parser che percorre il file, `src/pixels.js` per la decodifica dei pixel, `src/jpeg-lossless.js` per il codec con cui esporta la maggior parte degli ospedali, e `src/window.js` per la finestra e il livello — e in nessuno di questi c'è una riga che potrebbe raggiungere la rete.
