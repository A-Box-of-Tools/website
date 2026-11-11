# Oscura un PDF — le parole escono, non ci va sopra un rettangolo

Le lettere vengono cancellate dal file, e poi il file viene cercato per dimostrarlo.

> Togli le parole da un PDF invece di disegnarci sopra un rettangolo nero. Le lettere vengono cancellate dalle istruzioni con cui la pagina si disegna, il file finito viene riaperto e cercato per dimostrare che non ci sono più, e non viene caricato niente.

Questa pagina è uno strumento interattivo che funziona interamente nel tuo browser, all'indirizzo https://abox.tools/it/oscurare-pdf/ — nulla di ciò che gli affidi viene caricato. Quanto segue è tutto ciò che la pagina dice dello strumento a parole; per usarlo, apri l'indirizzo.

## Qui non si caricano documenti, **mai**. Non c'è nessun server.

Il documento che scegli viene aperto, letto, modificato e riscritto in memoria su questa macchina, da codice servito da questo indirizzo. Qui dentro non c'è niente che possa fare un caricamento, e dall'altra parte di questa pagina non c'è nessun server che possa riceverlo. Né il file né le parole che hai cercato escono dalla scheda.

- ✗ Nessun caricamento
- ✗ Nessun account
- ✓ Funziona offline
- ✓ Codice aperto
- ✓ I file restano sul tuo dispositivo

## Come oscurare un PDF in modo che le parole spariscano davvero

1. **Scegli il PDF.** Un documento per volta, apposta: l'oscuramento è un lavoro che va guardato pagina per pagina, e uno strumento che ti lasciasse spuntare delle parole in un file e le applicasse in silenzio a un altro è esattamente il modo in cui parte la cosa sbagliata. Viene letto direttamente dal tuo disco dal browser.
2. **Di' che cosa deve sparire.** Scrivi le parole — un nome, un indirizzo, un riferimento — e ogni punto in cui compaiono viene elencato con la riga su cui si trova e una casella da spuntare. I cercatori accanto alla casella cercano indirizzi email, numeri di carta, IBAN, codici fiscali e numeri di previdenza, e numeri di telefono. Vengono proposti, mai spuntati per te: uno schema non sa distinguere un numero di telefono da un riferimento.
3. **Leggi la pagina e prendi le parole da lì.** Il pannello mostra il testo del documento come è davvero conservato, nell'ordine in cui lo copierebbe un lettore. Clicca una parola qualsiasi per toglierla e ricliccala per tenerla. Tutto quello che è barrato è quello che sparirà — il che rende questa la revisione oltre che la selezione, ed è una cosa che vale la pena fare su ogni pagina prima di premere il pulsante.
4. **Toglile, e leggi la riga che dice che è stato verificato.** Le lettere vengono cancellate, il vuoto che hanno lasciato viene tenuto aperto, ci viene disegnato sopra un rettangolo nero se lo hai chiesto, e le stesse parole vengono tolte dai segnalibri, dai commenti, dai campi dei moduli e dalle proprietà del documento. Poi il file finito viene riaperto qui e cercato. Se una parola che hai tolto si trova ancora, non ottieni nessun download e un messaggio che te lo dice.

## La versione lunga

[Come oscurare un PDF perché il testo sparisca davvero](https://abox.tools/it/guide/oscurare-un-pdf/): Un rettangolo nero disegnato in un lettore di PDF di solito lascia le parole lì sotto, e un copia-incolla se le riprende di netto. Che cosa toglie un oscuramento vero, i quattro posti in cui una parola si nasconde fuori dalla pagina, e come controllare un file prima di mandarlo.

## Anche nella cassetta

- [Immagini in PDF](https://abox.tools/it/immagini-in-pdf/): Metti le tue foto dentro un documento solo.
- [Scanner per documenti](https://abox.tools/it/scansionare-documenti/): Fotografa la pagina. Ti torna indietro qualcosa che sembra scansionato.
- [Estrarre l'audio da un video](https://abox.tools/it/estrarre-audio-da-video/): Trascina dentro un video e portati via il suono. L'immagine non viene mai decodificata, e non viene caricato niente.
- [Taglierino audio](https://abox.tools/it/tagliare-audio/): Segna al volo i pezzi che valgono. Tornano in un file solo, tagliato dove hai detto tu.

## Domande

### In che cosa è diverso dal disegnare un rettangolo nero in un lettore di PDF?

Un rettangolo disegnato in un lettore è un'annotazione: un oggetto con una posizione, salvato accanto alla pagina. Il testo che ci sta sotto è intatto. Chiunque selezioni quell'area e prema copia, o apra il file in un altro programma, o ci passi sopra un qualsiasi estrattore di testo, si riprende le parole. Certi lettori offrono un comando «oscura» che la rimozione la applica davvero — e parecchi offrono solo il disegno. Questo strumento non ha nessun rettangolo da spostare: le lettere vengono tagliate via dalle istruzioni di disegno della pagina, e il rettangolo nero, se lo lasci acceso, viene disegnato dopo sopra un vuoto che è già vuoto.

### Come faccio a sapere che le parole sono sparite davvero?

Perché lo strumento controlla, sulla tua macchina, e ti mostra il conto. Quando il file è stato scritto viene riaperto dallo stesso lettore che sta in questa pagina, ogni pagina viene riletta, ogni segnalibro, commento, campo di modulo e proprietà viene raccolto, e ogni parola che hai tolto viene cercata. La riga dei risultati dice quante ce n'erano e quante ne restano. Se la risposta non è quella che dovrebbe essere, l'operazione fallisce e non viene offerto niente da scaricare. Puoi anche controllare da te, dopo, in un lettore qualsiasi: premi Ctrl+F e cerca la parola.

### Il resto della pagina si sposta quando si toglie una parola?

No. Il testo viene disegnato facendo avanzare una penna lungo la pagina, quindi cancellare cinque lettere tirerebbe normalmente il resto della riga indietro di cinque lettere. La larghezza esatta di quello che è stato tolto viene misurata sulle metriche del font stesso e rimessa come un'istruzione di spaziatura, che sposta la penna senza disegnare niente. Le colonne restano allineate e i totali restano sotto le loro intestazioni.

### Può oscurare un documento scansionato?

Non l'immagine, e lo dice invece di fare finta. Una scansione è la fotografia di una pagina: le parole sono pixel e non c'è testo da togliere. Quello che una scansione spesso porta con sé è un livello di testo invisibile che l'OCR dello scanner ha scritto sopra l'immagine perché la pagina si possa cercare — questo strumento quel livello lo trova, ne toglie quello che scegli, e ti dice sulla pagina che l'immagine è rimasta com'era. Così una ricerca e una copia smettono di trovare la parola, e una persona che guarda la pagina continua a leggerla. Per un'immagine, è l'[oscuratore di immagini](https://abox.tools/it/oscurare-immagine/) a riscrivere i pixel stessi.

### E le parti di un documento che non stanno su una pagina?

Vengono gestite, perché sono il punto da cui di solito un oscuramento perde. Le stesse parole vengono tolte dai segnalibri, dai commenti e dalle note adesive, da quello che è stato scritto nei campi dei moduli, dal testo che viene dato a un lettore di schermo, e dal testo di sostituzione che un lettore copia *al posto* delle lettere sulla pagina — quest'ultimo esiste perché le legature e le parole spezzate a fine riga si copino come si deve, e può contenere una frase intera. Le proprietà del documento e il pacchetto XMP vengono rimossi del tutto. Gli allegati e qualunque cosa parta all'apertura del file vengono buttati via, perché in nessuno dei due si possono cercare le parole che stai togliendo.

### I miei documenti vengono caricati da qualche parte?

No. Il file viene letto, modificato e scritto dal tuo browser sul tuo hardware. Questo strumento non ha un lato server, e la `Content-Security-Policy` della pagina elenca ogni indirizzo che può contattare — nessuno dei quali appartiene a questo sito. Quello che scrivi nella casella di ricerca viene confrontato con del testo nella memoria di questa scheda e non va da nessuna parte nemmeno lui.

### Perché non posso trascinare un riquadro sulla pagina come negli altri strumenti?

Perché disegnare una pagina vuol dire un motore di rendering PDF completo — font, sfumature, trasparenza, modalità di fusione — che è un megabyte o più di motore da scaricare e far girare, e questo sito non ne spedisce nessuno. Il che si scopre essere adatto al lavoro: trascinare un rettangolo seleziona un'*area di carta*, e un'area di carta non è la stessa cosa del testo che ci sta sotto, ed è così che comincia il fallimento del rettangolo nero. Quello che ottieni invece è il testo del documento, nell'ordine di lettura, con ogni parola cliccabile. Ed è anche l'unica vista capace di dirti quello che un'immagine della pagina non può: se le parole che hai davanti siano testo o no.

### Il file finito si aprirà dappertutto?

Sì. Il risultato viene scritto come PDF 1.5, o la versione più alta di cui aveva bisogno il file che gli hai dato, e la 1.5 la capisce ogni lettore uscito dal 2003 in poi. Sulla pagina non viene ricodificato niente: i font, le immagini e il disegno vettoriale passano byte per byte, quindi quello che resta del testo resta selezionabile e ricercabile esattamente com'era.

### Può aprire un PDF protetto da password?

No, ed è voluto. Un documento cifrato viene rifiutato con un messaggio che lo dice, anche quando la password è vuota — che è il modo in cui salvano parecchi scanner e fotocopiatrici. Togliere la protezione a un file è un lavoro diverso dal togliergli delle parole, e uno strumento che lo facesse in silenzio starebbe facendo una cosa che non hai chiesto.

### C'è un limite di dimensione, e costa qualcosa?

Nello strumento non c'è nessun limite scritto. Il limite è la tua macchina: il documento viene tenuto in memoria mentre ci si lavora, quindi un portatile regge qualche centinaio di megabyte senza lamentarsi e comincia a faticare da lì in su. È gratis, non c'è un account, non c'è un accesso e non c'è una prova. Il sito ospita pubblicità, ed è quella che lo paga; agli inserzionisti non viene dato niente dei tuoi documenti.

### Funziona offline?

Sì. Carica la pagina una volta, poi stacca la rete e continua a funzionare. È anche il modo più semplice per dimostrare che non viene caricato niente: uno strumento che mandasse via il tuo documento per farlo oscurare altrove si fermerebbe nell'istante in cui stacchi la spina.

## Come si verifica quello che promette

- **Un rettangolo nero non è un oscuramento, e qui non ne viene disegnato uno sopra niente.** In quasi tutti i programmi che si offrono di oscurare una pagina — un lettore di PDF, un elaboratore di testi, un programma di grafica — il rettangolo è un oggetto salvato accanto al testo e non dentro di esso. Il testo è ancora lì, nello stesso file, nello stesso punto, e selezionare l'area e premere copia te lo restituisce. Quel modo di sbagliare ha pubblicato atti giudiziari, rapporti dei servizi e, nel dicembre 2025, nomi anneriti in una diffusione di massa di documenti del Dipartimento di Giustizia statunitense che erano leggibili nel giro di poche ore. Questo strumento cancella le lettere dalle istruzioni che disegnano la pagina. Non c'è un rettangolo con qualcosa sotto, perché sotto non c'è niente.
- **Il file finito viene riaperto e cercato, qui, prima che ti venga offerto.** Finché non succede, ogni affermazione qui sopra è questo strumento che si corregge i compiti da solo. Quindi i byte che stanno per diventare il tuo download vengono ripassati allo stesso lettore come se li avesse mandati uno sconosciuto, ogni pagina viene riletta, ogni segnalibro, commento, campo di modulo e proprietà del documento viene raccolto, e le parole che hai tolto vengono cercate. Il conto sta nei risultati. Se è sopravvissuto qualcosa, l'operazione viene dichiarata fallita e non c'è nessun download.
- **Le parole non escono mai dalla scheda, e non ne esce nemmeno la ricerca.** La Content-Security-Policy elenca ogni indirizzo che questa pagina può contattare, e nemmeno uno appartiene a questo sito. Questo strumento non aggiunge niente a quella lista: non ha una funzione di rete propria, nemmeno facoltativa. Quello che scrivi nella casella di ricerca è una stringa confrontata con del testo nella memoria di questa scheda, e non c'è nessun posto dove l'uno o l'altro possano andare.
- **L'oscuramento è il lavoro che meno di tutti sopravvive a un caricamento.** Quello che si oscura è il motivo per cui non va caricato. La dichiarazione di un testimone, una lettera medica, un estratto conto che va a un padrone di casa, un contratto con dentro il nome di un cliente che va a un altro cliente. Consegnare quella roba al server di uno sconosciuto perché ne tolga la parte privata vuol dire che la parte privata arriva per prima, intatta, ed è quella la versione che loro si tengono. Questa pagina non ha un'altra metà.
- **Quello che resta viene copiato intatto.** Gli unici byte che cambiano in una pagina sono le istruzioni di scrittura del testo di cui facevano parte le lettere tolte. Ogni altra istruzione, e ogni font, immagine e linea a cui la pagina fa riferimento, viene copiata esattamente come è arrivata — non viene ridisegnato, ricodificato o riflusso niente. La larghezza di quello che è stato tolto viene misurata e rimessa come un'istruzione di spaziatura, così il resto della riga resta dove il documento lo aveva messo.
- **Non può togliere parole da una fotografia, e dice quali pagine sono.** Una pagina scansionata è un'immagine. Le parole che ci stanno sopra sono pixel, non testo, e qui dentro niente può toccarle. Se la scansione porta con sé il livello invisibile e ricercabile che produce l'OCR di uno scanner, questo strumento quel livello lo toglie — ed è quello che avrebbero trovato una ricerca e una copia — e dice chiaramente sulla pagina che l'immagine continua a mostrare le parole. Coprire quell'immagine è un altro lavoro; l'[oscuratore di immagini](https://abox.tools/it/oscurare-immagine/) è lo strumento che riscrive i pixel.
- **Il documento smette di dire da dove viene.** Le proprietà e il pacchetto XMP se ne vanno a ogni esecuzione: nessuna riga di produttore, nessuna data di creazione, nessun autore, nessun titolo, e nessuno dei blocchi privati che un programma di impaginazione si lascia dietro. Un file alle cui pagine è stato tolto un nome e le cui proprietà dicono ancora `bozza 3 transazione Rossi.docx` non è stato oscurato, e non è una cosa da lasciare a una casella da spuntare.
- **I file cifrati vengono respinti invece che aperti.** Un PDF con una password viene rifiutato, compreso quello che gli scanner producono con la password vuota e che tecnicamente si aprirebbe. Togliere la protezione a un documento è un lavoro diverso dal togliergli delle parole, e farlo in silenzio sarebbe una cosa sorprendente da parte di uno strumento che agisce per conto tuo.
- **Che cosa carica Google, e che cosa non gli viene dato.** Gli script della pubblicità e della misurazione arrivano da Google. A nessuno dei due viene passato niente del tuo documento: non un file, non una pagina, non un nome, una dimensione, un numero di pagine o una parola che hai cercato. Ogni riga che legge, modifica o scrive un PDF è servita da questa origine ed è elencata nel repository.
- **Che cosa carica il pulsante delle donazioni, e che cosa non gli viene dato.** Il pulsante «Buy me a coffee» in cima è disegnato da uno script di cdnjs.buymeacoffee.com e prende i caratteri da Google Fonts. È un link e niente di più: non segnala nessuna visita e non gli viene passato niente su di te o sui tuoi documenti. Non succede nulla se non lo clicchi, e quello a cui arriveresti cliccando è il sito di qualcun altro.
- **Funziona offline.** Stacca la rete e tutto quello che c'è su questa pagina continua a funzionare. È la prova più semplice di tutte: uno strumento che mandasse via il tuo documento per farlo oscurare altrove si fermerebbe.

**Verifica tu stesso.** Niente di quanto sopra va preso per buono. Questa pagina la genera, dai modelli e dalla configurazione del repository, uno script di build che puoi leggere ed eseguire anche tu, e il risultato finisce sul branch `dist`: puoi quindi confrontare quello che viene servito con quello che produce una build dei sorgenti. https://github.com/A-Box-of-Tools/website

I file da leggere per primi sono `config/site.toml` per la Content-Security-Policy, `src/shared/pdf-text.js` per come ogni parola di una pagina viene trovata e localizzata, e `src/edit.js` per la cancellazione vera e propria — che cosa viene tagliato dalle istruzioni della pagina e che cosa viene rimesso perché il resto della riga non si sposti. Nessuno di questi può raggiungere la rete, e non possono nemmeno il lettore e lo scrittore che stanno lì accanto.
