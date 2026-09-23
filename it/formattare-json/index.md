# Formattatore JSON — mettilo in ordine, comprimilo o convertilo

JSON, XML, HTML, CSS e YAML, formattati o convertiti. Niente finisce incollato nel server di qualcun altro.

> Formatta e minimizza JSON, XML, HTML, CSS e YAML, e converti JSON in YAML o XML e viceversa. I parser girano nel tuo browser e non viene caricato niente: un token o un file di configurazione non lascia mai il tuo dispositivo.

Questa pagina è uno strumento interattivo che funziona interamente nel tuo browser, all'indirizzo https://abox.tools/it/formattare-json/ — nulla di ciò che gli affidi viene caricato. Quanto segue è tutto ciò che la pagina dice dello strumento a parole; per usarlo, apri l'indirizzo.

## Qui non si caricano testi e codice, **mai**. Non c'è nessun server.

Formattare e convertire sono aritmetica su una stringa, fatta qui, in questa pagina. I parser sono scritti a mano e stanno in `src/`: `shared/parse-json.js`, `shared/parse-xml.js`, `css.js`, `shared/parse-yaml.js`; e non c'è altro. Questo strumento non ha nessuna funzione di rete, niente da scaricare e niente da mandare, e qui conta più che quasi in qualsiasi altro punto di questo sito: quello che la gente incolla in un formattatore sono token di accesso, cookie di sessione, dati di clienti e codice non ancora pubblicato.

- ✗ Niente caricamenti
- ✗ Nessun account
- ✗ Nessun limite di dimensione
- ✓ Funziona offline
- ✓ Open source

## Come formattare o convertire JSON senza caricarlo

1. **Scegli il lavoro.** Due schede, una casella sola: *Formatta* mette in ordine o comprime JSON, XML, HTML, CSS e YAML; *Converti* trasforma JSON in YAML o XML e viceversa. Il testo che hai appena formattato è il testo che converti, senza incollarlo due volte.
2. **Incollalo, oppure trascina il file.** Va bene qualunque cosa tu possa selezionare e copiare. Un file trascinato sul selettore lo legge il tuo browser e lo mette nella casella: qui non c'è nessun passaggio di caricamento da saltare.
3. **Lascia che capisca il linguaggio, oppure diglielo.** Il menu dice come ha letto il testo, e correggerlo è un clic. Un'ipotesi è solo un punto di partenza, ed è per questo che viene mostrata invece che applicata in silenzio.
4. **Scegli il rientro, oppure comprimi tutto.** Due spazi, quattro, o una tabulazione. Comprimere è lo stesso documento senza ogni spazio che c'era solo per leggerlo, e il risultato dice quanti byte ha fatto risparmiare.
5. **Leggi l'errore dov'è l'errore.** Un parser che qui fallisce dice cosa ha trovato e a quale riga e colonna, invece di «token inatteso alla posizione 4193». Di solito basta a sistemare un file di configurazione senza aprire nient'altro.
6. **Prenditi il risultato.** Copialo, oppure scaricalo come file, con il nome del linguaggio in cui è uscito.

## La versione lunga

[Come formattare JSON senza darlo a nessuno](https://abox.tools/it/guide/formattare-json/): Come impaginare, controllare e minificare JSON nel proprio browser: cosa un formattatore non deve mai cambiare del tuo file, come si legge il messaggio di errore, e perché conta in che casella lo incolli.

## Anche nella cassetta

- [Convertitore da YAML a JSON](https://abox.tools/it/convertire-yaml-in-json/): Tutte e due le direzioni, e ti dice quanto costa ciascuna. Niente di tutto questo finisce incollato nel server di qualcun altro.
- [Formattatore XML](https://abox.tools/it/formattare-xml/): XML sistemato per leggerlo o compattato per spedirlo, e convertito in JSON in tutte e due le direzioni. Niente di tutto questo finisce incollato nel server di qualcun altro.
- [Confronto testi](https://abox.tools/it/confrontare-testi/): Due testi dentro, ogni differenza segnata, riga per riga e parola per parola. Niente finisce incollato nel server di qualcun altro.
- [Codificatore e decodificatore Base64](https://abox.tools/it/codifica-base64/): Base64, codifica percentuale, entità HTML, esadecimale ed escape con barra rovesciata, in entrambi i versi. Niente finisce incollato nel server di qualcun altro.

## Domande

### Il mio testo viene caricato da qualche parte?

No. Ogni parser e ogni scrittore di questa pagina è una funzione che gira nel tuo browser, sul tuo hardware. Questo strumento non ha nessuna funzione di rete: non scarica mai niente e non manda mai niente, e la `Content-Security-Policy` della pagina elenca ogni indirizzo che può contattare, nessuno dei quali appartiene a questo sito. È questo il motivo per usarlo con un token di accesso, un cookie di sessione o i dati di un cliente: incollare una di queste cose nel formattatore di qualcun altro vuol dire gliela stai dando.

### Formattare JSON cambia qualcosa oltre alla disposizione?

No, ed è più difficile di quanto sembri. Le chiavi mantengono l'ordine in cui le hai scritte: un formattatore costruito su `JSON.parse` sposta in silenzio in cima le chiavi che sembrano interi, quindi `{"10":a,"2":b}` torna indietro come `{"2":b,"10":a}`. I numeri mantengono le cifre che hai digitato, quindi un id di venti cifre non perde le ultime tre per colpa di un double e `1e999` non diventa `null`. Le chiavi doppie restano entrambe, perché lo standard non dice quale vince e buttarne una vorrebbe dire scegliere al posto tuo.

### Quali linguaggi sa formattare?

JSON, XML, HTML, CSS e YAML. JSON, XML, HTML e CSS si possono anche comprimere; YAML no, perché la sua forma breve è lo stile in flusso, che è illeggibile, e illeggibile è l'opposto del motivo per cui si tiene un file in YAML. JavaScript di proposito non è nell'elenco: vedi la domanda più sotto.

### Perché non formatta JavaScript, Python o SQL?

Perché mettere in ordine un linguaggio di programmazione vuol dire analizzarlo per bene, e un formattatore che ci va quasi è peggio di nessun formattatore: produce codice che sembra a posto e fa un'altra cosa. JSON, XML, CSS e YAML hanno grammatiche abbastanza piccole da essere lette a mano e verificate con test che puoi eseguire. Un formattatore JavaScript è Prettier, che è un megabyte di parser, e il suo posto è nel tuo editor, non su una pagina web.

### Il mio YAML dice no e il JSON è uscito come stringa. Perché?

Perché è una stringa, e qui si legge YAML 1.2 e non 1.1. In YAML 1.1, `yes`, `no`, `on` e `off` erano booleani, ed è il famoso baco che trasforma il codice del paese della Norvegia in `false`. YAML 1.2 l'ha tolto, e lo toglie anche questo: solo `true`, `false`, `null` e `~` vengono letti come qualcosa di diverso dal testo. Nell'altro verso, quelle parole vengono riscritte *tra virgolette*, anche se questo strumento le leggerebbe come testo pure senza, perché quello che aprirà il file dopo magari no. PyYAML usa ancora 1.1 come impostazione predefinita. Leggere in modo severo e scrivere in modo prudente è l'unica combinazione giusta in entrambi i versi.

### Cosa si perde convertendo YAML in JSON?

I commenti, perché JSON non ha dove metterli. Ancore, alias e tag vengono rifiutati del tutto invece che indovinati: ognuno di loro dice qualcosa che JSON non sa dire, e un convertitore che scegliesse in silenzio un'interpretazione ti consegnerebbe un documento che non è quello che diceva il file. Nell'altro verso non si perde niente: ogni documento JSON è già un documento YAML.

### Cosa si perde convertendo JSON in XML?

La differenza tra un oggetto vuoto, un array vuoto e una stringa vuota, che diventano tutti un elemento vuoto, e il tipo di ogni valore, perché XML non ha tipi: ed è per questo che la conversione inversa lascia tutto come stringa invece di decidere che `8080` fosse un numero. Un array diventa un elemento ripetuto, che è l'unica forma che si rilegge, e a una chiave che un nome di elemento non può contenere vengono sostituiti i caratteri scomodi, invece di produrre un documento che nessun parser leggerà.

### Rifare i rientri dell'HTML cambia l'aspetto della pagina?

Può cambiarlo, e qui lo si dice onestamente. Lo spazio tra due elementi inline è uno spazio tra due parole, quindi spostarlo non è gratis. Due cose tengono la cosa a bada: `<pre>` e `<textarea>` vengono copiati esattamente com'erano, e un elemento che contiene solo testo resta su una riga. Tutto il resto viene messo in ordine.

### Quanto può essere grande il file?

Qui non c'è nessun limite impostato, perché non c'è nessun server che lo paghi. Il tetto vero è il tuo dispositivo: qualche megabyte di JSON va benissimo, e su un documento molto lungo la pagina aspetta una pausa nella tua digitazione prima di riformattare, invece di litigarti la tastiera.

### È gratis, e mi serve un account?

È gratis, e non c'è account, non c'è registrazione, non c'è periodo di prova e non c'è limite a quanto incolli. Il sito ha della pubblicità, ed è quella che lo mantiene; agli annunci non arriva niente sul tuo testo.

### Funziona offline?

Sì. Carica la pagina una volta, poi stacca la connessione e continua a funzionare. È anche il modo più semplice per dimostrare che non viene caricato niente, perché uno strumento che spedisse via il tuo testo per formattarlo si fermerebbe nell'istante in cui stacchi la spina.

## Come si verifica quello che promette

- **Quello che incolli non ha una strada per uscire.** Nella Content-Security-Policy c'è ogni indirizzo che questa pagina può contattare, e non ne appartiene uno a questo sito. Qui non esiste un recapito dove un token incollato possa essere raccolto, e nel codice non c'è niente che lo manderebbe lì se esistesse.
- **Qui niente va a prendere niente.** In `src/` non c'è da nessuna parte un `fetch`, un `XMLHttpRequest` o un `sendBeacon`. Ogni parser e ogni scrittore sono funzioni di questa pagina che prendono una stringa e restituiscono una stringa.
- **I formattatori tengono quello che gli è stato dato.** Un oggetto JSON torna indietro con le chiavi nell'ordine in cui le hai scritte e i numeri scritti come li hai scritti tu, perché `src/shared/parse-json.js` è un parser e non una chiamata a `JSON.parse`, che riordina le chiavi che sembrano interi e trasforma un id di venti cifre nel double più vicino. I test in `tests/js/text-format.test.js` controllano esattamente questo.
- **Cosa carica Google, e cosa non gli arriva.** Gli script della pubblicità e della misurazione arrivano da Google, il pulsante delle donazioni da Buy Me a Coffee. A nessuno di loro arriva un carattere del tuo testo. Ogni riga che lo legge, lo analizza o lo scrive è servita da questa origine ed è elencata nel repository.
- **Funziona offline.** Stacca la rete e lo strumento resta identico, perché al suo interno non c'è mai stato un passaggio di rete. È la prova più semplice che ci sia.

**Verifica tu stesso.** Niente di quanto sopra va preso per buono. Questa pagina la genera, dai modelli e dalla configurazione del repository, uno script di build che puoi leggere ed eseguire anche tu, e il risultato finisce sul branch `dist`: puoi quindi confrontare quello che viene servito con quello che produce una build dei sorgenti. https://github.com/A-Box-of-Tools/website

I file da leggere per primi sono `config/site.toml` per la Content-Security-Policy, `src/shared/parse-json.js` per il parser che tiene le tue chiavi nell'ordine in cui le hai scritte, e `src/convert.js` per capire perché una conversione è un parser e uno scrittore, senza niente in mezzo che conosca i due formati insieme.
