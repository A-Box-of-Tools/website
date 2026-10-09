# Password e passphrase — sicure e casuali, generate nel browser

Generate qui, dal tuo browser, e non spedite da nessuna parte. Non viene salvato niente e non c'è cronologia.

> Genera una password casuale sicura, o una passphrase diceware da un elenco di 7.776 parole incluso nella pagina. La estrae il generatore crittografico del tuo browser, non viene spedita da nessuna parte e non viene salvata. Gratis, senza registrazione.

Questa pagina è uno strumento interattivo che funziona interamente nel tuo browser, all'indirizzo https://abox.tools/it/generatore-password/ — nulla di ciò che gli affidi viene caricato. Quanto segue è tutto ciò che la pagina dice dello strumento a parole; per usarlo, apri l'indirizzo.

## Qui non si caricano password e passphrase, **mai**. Non c'è nessun server.

Ogni carattere viene da `crypto.getRandomValues`, il generatore crittografico del browser stesso, e ogni parola da un elenco che sta in questa cartella come `src/wordlist.js`. In tutto `src/` non c'è un `fetch`, né un `XMLHttpRequest`, né un `sendBeacon`, quindi non esiste una strada per cui una password generata qui possa arrivare a noi o a chiunque altro. E non viene salvato niente, per cui ricaricare questa pagina distrugge tutte le password che ti ha mostrato.

- ✗ Niente caricamenti
- ✗ Nessun account
- ✗ Non salva niente
- ✓ Funziona offline
- ✓ Codice aperto

## Come generare una password sicura senza che nessun sito la veda

1. **Scegli password o passphrase.** Una password è una sequenza di caratteri casuali: corta da conservare, scomoda da digitare, ed esattamente quello che serve per le centinaia di account che il gestore di password compila al posto tuo. Una passphrase sono parole estratte a caso da un elenco: più lunga, ma ricordabile e pronunciabile, che è quello che ti serve per i pochi segreti che devi digitare a memoria, cioè quello del gestore stesso, quello del portatile, il codice di recupero del telefono.
2. **Imposta la lunghezza, o il numero di parole.** È questa l'impostazione che conta, e le altre in gran parte no. Venti caratteri, o sei parole, sono un minimo ragionevole per qualunque cosa valga la pena proteggere; sali per l'account che permetterebbe di reimpostare tutti gli altri. La lettura qui sotto si muove mentre trascini, così vedi cosa ti porta ogni carattere in più.
3. **Attiva le regole su cui il modulo insisterà.** «Almeno uno per insieme», una cifra alla fine, un simbolo preso dall'elenco breve che accettano tutti i siti. Nessuna di queste cose rende niente più forte, e la prima lo indebolisce un po', cosa che la pagina ha già sottratto. Ma sono il modo di superare un modulo di registrazione senza generarne sei di fila.
4. **Leggi il numero, non il colore.** I bit sono contati a partire dalle impostazioni che hanno prodotto la stringa: la dimensione dell'alfabeto, il numero di estrazioni, e nient'altro. È una misura vera, a differenza dell'indicatore su una pagina di registrazione, che può solo dare un punteggio ai caratteri che ha davanti e non ha modo di sapere se li hai scelti tu o un generatore.
5. **Copiala e mettila da qualche parte prima di andartene.** Qui non c'è cronologia e non c'è modo di richiederla; ricaricare la pagina la distrugge. Incollala prima nel gestore di password e poi nel modulo di registrazione, così chi deve ricordarsela ce l'ha già prima che qualcosa possa andare storto.
6. **Prendine un blocco se ti serve.** Il cursore in fondo ne genera fino a cento in una volta e le salva come file di testo semplice, scritto da questa pagina a partire da quello che è già sul tuo schermo. Utile per aprire account in serie o distribuire credenziali iniziali, e da cancellare appena sono in un posto migliore: un file pieno di password sul disco resta un file pieno di password.

## Anche nella cassetta

- [Formattatore JSON](https://abox.tools/it/formattare-json/): JSON, XML, HTML, CSS e YAML, formattati o convertiti. Niente finisce incollato nel server di qualcun altro.
- [Convertitore da YAML a JSON](https://abox.tools/it/convertire-yaml-in-json/): Tutte e due le direzioni, e ti dice quanto costa ciascuna. Niente di tutto questo finisce incollato nel server di qualcun altro.
- [Formattatore XML](https://abox.tools/it/formattare-xml/): XML sistemato per leggerlo o compattato per spedirlo, e convertito in JSON in tutte e due le direzioni. Niente di tutto questo finisce incollato nel server di qualcun altro.
- [Confronto testi](https://abox.tools/it/confrontare-testi/): Due testi dentro, ogni differenza segnata, riga per riga e parola per parola. Niente finisce incollato nel server di qualcun altro.

## Domande

### Le password vengono spedite da qualche parte o salvate?

Né l'una né l'altra cosa. Nascono nel tuo browser, sul tuo hardware, e questo strumento non ha nessuna funzione di rete: non scarica mai niente e non spedisce mai niente. E non scrive niente nemmeno nell'archiviazione: niente localStorage, nessun cookie, nessuna cronologia. Ricarica la pagina e tutte le password che ti ha mostrato sono sparite, dallo schermo e dalla sua stessa memoria. La `Content-Security-Policy` della pagina elenca ogni indirizzo che può contattare e nessuno è nostro, quindi non c'è un posto dove una password possa essere raccolta nemmeno se qualcosa ci provasse.

### Da dove viene il caso?

Da `crypto.getRandomValues`, il generatore che i browser offrono per uso crittografico, alimentato e rialimentato dalla riserva di entropia del tuo sistema operativo. È la stessa fonte da cui il browser prende il materiale delle chiavi TLS. `Math.random` non è usato da nessuna parte in questo strumento, e la distinzione non è pignoleria: `Math.random` è un generatore aritmetico veloce il cui stato interno completo si ricostruisce da poche uscite consecutive, per cui un generatore di password costruito su di lui produce password che sembrano casuali e che chiunque ne abbia vista una può enumerare tutte.

### Una password generata in un browser vale quanto una di un programma installato?

Per quanto riguarda il caso, sì: è la stessa fonte del sistema operativo in entrambi i casi, raggiunta da una porta diversa. Cambia cos'altro c'è nella stanza. Una scheda del browser convive con le tue estensioni, e un'estensione autorizzata a leggere le pagine può leggere anche questa. Vale per qualunque generatore sul web, questo compreso, ed è il motivo onesto per usare il generatore integrato del tuo gestore di password quando ce l'hai: è la stessa aritmetica, in un processo con meno roba intorno. Questa pagina è per quando non ce l'hai sottomano.

### Password o passphrase, cosa conviene usare?

Una password per tutto quello che digita un gestore al posto tuo, perché non la guarderai mai e la lunghezza lì non costa niente. Una passphrase per le poche cose che devi digitare a memoria o dettare a voce: la password principale del gestore, la chiave di cifratura del disco, un apparecchio che configuri da lontano. Sei parole dell'elenco lungo sono 77 bit, più di una password casuale di dodici caratteri e infinitamente più facili da azzeccare alle quattro del mattino.

### Quanto dovrebbe essere lunga una password?

Venti caratteri sull'alfabeto completo sono circa 130 bit, ben oltre il punto in cui la lunghezza smette di essere il problema. Sedici va benissimo. Dodici è il minimo per qualunque cosa ti dispiacerebbe perdere, ed è il minimo, non l'obiettivo. Sotto quella soglia stai scommettendo che il sito l'abbia salvata come si deve, scommessa che vent'anni di comunicazioni di violazione sconsigliano. La lunghezza batte ogni altra impostazione di questa pagina: un carattere in più porta più di qualsiasi regola su quali caratteri devono comparire.

### Di quante parole dovrebbe essere una passphrase?

Sei dall'elenco lungo, e sette se protegge altre password. La famosa immagine da quattro parole è del 2011, vale 51 bit ed è oggi alla portata di un attacco offline serio. Cinque sono 64. Sei sono 77, oltre quello che un attaccante spenderà mai per un account qualsiasi. Ogni parola in più dall'elenco lungo aggiunge 12,9 bit, e le parole sono l'unica cosa che aggiunge qualcosa: né i trattini né le maiuscole.

### Cos'è un «bit», e perché questa pagina li conta?

Un bit è un raddoppio. Sessanta bit vuol dire che c'erano 2^60 risultati ugualmente probabili che questa pagina avrebbe potuto produrre, quindi chi sa esattamente come funziona ne ha comunque altrettanti da provare. È una proprietà del *procedimento*, non della stringa: la pagina può darlo esatto perché è lei che ha scelto e sa quante scelte ha fatto. È tutta qui la differenza rispetto alla barra colorata di un modulo di registrazione, che legge i caratteri e tira a indovinare. Su quella barra `correct horse battery staple` prende un brutto punteggio e vale 44 bit, mentre `P@ssw0rd!` ne prende uno buono e non vale quasi niente.

### Perché «deve contenere un simbolo» indebolisce una password?

Perché una regola può solo togliere possibilità. Pretendere almeno un carattere per ogni insieme scarta tutte le password a cui non ne era capitato nessuno, e un insieme più piccolo di password possibili è un insieme più piccolo da percorrere. L'effetto è piccolo, circa mezzo bit a una lunghezza normale, ed è reale, e questa pagina lo sottrae invece di dare la cifra che le fa comodo. È calcolato esatto contando le password che la regola permette davvero, e non quelle che scarta.

### Che elenco di parole è, e cambia qualcosa che un attaccante possa scaricarlo?

Sono gli elenchi diceware della Electronic Frontier Foundation, inclusi senza modifiche: 7.776 parole quello lungo e 1.296 quello breve. Sono stati costruiti esattamente per questo: niente di offensivo, nessun omofono, nessuna coppia che unita formi una terza parola, e nell'elenco breve nessuna parola che sia l'inizio di un'altra. E no, non cambia niente che l'elenco sia pubblico: la forza indicata qui dà per scontato che l'attaccante ce l'abbia, che stia leggendo il codice di questa pagina e che conosca tutte le impostazioni che hai usato. L'unica cosa che non sa è quale delle 7.776 è uscita ogni volta. È proprio questa premessa a rendere affidabile il numero.

### Una passphrase non è un attacco a dizionario che aspetta di succedere?

Non quando le parole si scelgono così. Un attacco a dizionario funziona contro le frasi che sceglie una *persona*, perché le persone scelgono parole che stanno bene insieme, in un ordine che ha senso, fra le poche migliaia che usano ogni giorno. Questa pagina sceglie ogni parola in modo indipendente e uniforme da un elenco fisso, senza curarsi di come suona il risultato, ed è per questo che di solito suona male. Un attaccante che conosca l'elenco e il numero di parole si trova comunque davanti 7.776 elevato a quel numero.

### Posso recuperare una password dopo aver lasciato la pagina?

No, ed è voluto. Non viene annotato niente da nessuna parte, quindi non c'è niente da recuperare: nessun pannello della cronologia, nessun elenco delle «generate di recente», nessuna cache. Un generatore in grado di mostrarti la password di martedì scorso sarebbe un generatore che l'ha salvata, e salvata dove ci arrivi tu vuol dire salvata dove ci arriva anche altro. Copiala in un gestore di password prima di andare via.

### È sicuro copiarla negli appunti?

È il rischio di sempre, e conviene conoscerlo più che preoccuparsene. Gli appunti sono condivisi con tutto quello che gira con la tua utenza, di solito sopravvivono fino alla copia successiva, e su certe configurazioni si sincronizzano fra dispositivi. Sono ottimi motivi per incollarla subito dove va e copiare qualcos'altro dopo, e non sono un motivo per digitare a mano una password più debole. Questa pagina non può leggere i tuoi appunti: può solo scriverci, e solo quando premi il pulsante.

### Posso usare la stessa in più posti?

No, ed è l'unico consiglio di questa pagina che conta più di tutti gli altri. Quasi ogni account che viene preso, viene preso con una password che prima era giusta da un'altra parte: un sito viene violato, l'elenco viene pubblicato, e lo stesso indirizzo con la stessa password viene provato ovunque. Una password diversa per ogni sito trasforma una violazione in un account solo invece che in tutti, ed è questo il motivo per tenere un gestore di password, non la forza di una singola password che ci sta dentro.

### È gratis, e serve un account?

È gratis, non c'è account, non c'è accesso, non c'è prova e non c'è limite a quante ne generi. Il sito porta pubblicità, ed è quella a pagarlo; agli annunci non viene passato assolutamente niente di quello che questa pagina genera, nemmeno quanto era lunga o quanto era forte.

### Funziona offline?

Sì. Carica la pagina una volta, poi staccati da internet e continua a generare password. Il caso viene dal tuo apparecchio e l'elenco di parole è già nella pagina. È anche il modo più semplice di dimostrare che non viene scaricato né spedito niente: un generatore che chiedesse i numeri a un server si fermerebbe nel momento in cui stacchi la spina.

## Come si verifica quello che promette

- **La password nasce dove stai leggendo.** La estrae questa pagina, dentro questa pagina, dal caso che il tuo sistema operativo consegna al browser. Per produrla non viene chiesto niente e, una volta che esiste, non viene segnalato niente. Nella `Content-Security-Policy` ci sono tutti gli indirizzi che questa pagina può contattare e nessuno è nostro: qui non c'è un punto di raccolta dove una password generata possa finire, né qualcosa nel codice che ce la manderebbe se ci fosse.
- **Qui non c'è niente che scarichi niente.** In tutto `src/` non c'è un `fetch`, né un `XMLHttpRequest`, né un `sendBeacon`. L'elenco di parole non viene scaricato: è `src/wordlist.js`, servito da questa stessa origine insieme al resto della pagina, e puoi leggerlo.
- **Il caso è quello del browser, ed è quello giusto.** `crypto.getRandomValues` è il generatore che i browser mettono a disposizione per chiavi e token, alimentato e rialimentato dal sistema operativo. `Math.random` non compare da nessuna parte in questa cartella, e sarebbe un difetto vero se ci fosse: il suo stato interno si ricostruisce da una manciata di uscite, il che rende calcolabile ogni password che produrrà a chiunque ne abbia vista una.
- **Non viene salvato niente, quindi non c'è cronologia da cancellare.** Niente localStorage, niente sessionStorage, nessun cookie, nessun parametro nell'indirizzo e nessun `<input>` che il browser si offra di ricordare. Quello che è sullo schermo vive in un solo array nella memoria di questa pagina, e chiudere la scheda è tutta la pulizia che serve. Le uniche copie di quello che nasce qui sono quelle che porti via tu.
- **Cosa carica Google, e cosa non gli viene dato.** Gli script pubblicitari e di misurazione sono di Google, e il pulsante per le donazioni è di Buy Me a Coffee. A nessuno di loro viene passato un carattere di quello che questa pagina genera, né la lunghezza, né la forza, né con quali impostazioni è uscito. Ogni riga che estrae un carattere o una parola è servita da questa origine ed è nel repository.
- **Funziona offline.** Stacca la rete e lo strumento resta lo stesso, perché al suo interno non c'è mai stato un passaggio in rete. È la prova più semplice di tutte: un generatore che chiedesse il caso a un server si fermerebbe nel momento in cui stacchi la spina.

**Verifica tu stesso.** Niente di quanto sopra va preso per buono. Questa pagina la genera, dai modelli e dalla configurazione del repository, uno script di build che puoi leggere ed eseguire anche tu, e il risultato finisce sul branch `dist`: puoi quindi confrontare quello che viene servito con quello che produce una build dei sorgenti. https://github.com/A-Box-of-Tools/website

I file da leggere per primi sono `config/site.toml` per la Content-Security-Policy, `src/random.js` per le quaranta righe che stanno fra questa pagina e ogni password che genera, che hanno un solo ingresso ed è il generatore del browser; `src/generate.js` per come le impostazioni diventano una stringa; e `src/strength.js` per l'aritmetica dietro il numero, che conta invece di indovinare.
