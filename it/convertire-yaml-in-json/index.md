# Da YAML a JSON — e da JSON di nuovo a YAML

Tutte e due le direzioni, e ti dice quanto costa ciascuna. Niente di tutto questo finisce incollato nel server di qualcun altro.

> Converti YAML in JSON e JSON in YAML nel tuo browser. Legge YAML 1.2, quindi yes e no restano stringhe, e dice esattamente cosa perde ogni direzione. Non viene caricato niente: un file di configurazione non lascia mai il tuo dispositivo.

Questa pagina è uno strumento interattivo che funziona interamente nel tuo browser, all'indirizzo https://abox.tools/it/convertire-yaml-in-json/ — nulla di ciò che gli affidi viene caricato. Quanto segue è tutto ciò che la pagina dice dello strumento a parole; per usarlo, apri l'indirizzo.

## Qui non si caricano file YAML e JSON, **mai**. Non c'è nessun server.

Convertire è aritmetica su una stringa, fatta qui, in questa pagina. I due parser sono scritti a mano e stanno in `src/` — `shared/parse-yaml.js` e `shared/parse-json.js` — e non c'è nient'altro. Questo strumento non ha nessuna funzione di rete di alcun tipo — niente da scaricare, niente da mandare — e qui conta più che quasi ovunque su questo sito: un file YAML di solito è una configurazione di deploy, e una configurazione di deploy di solito è piena di nomi di host, nomi di bucket e segreti.

- ✗ Niente caricamenti
- ✗ Nessun account
- ✗ Nessun limite di dimensione
- ✓ Funziona offline
- ✓ Open source

## Come convertire YAML in JSON senza caricarlo

1. **Scegli la direzione.** *Da YAML a JSON* oppure *da JSON a YAML*. La nota sotto il menù dice cosa perde quella direzione prima che tu incolli qualcosa, non dopo.
2. **Incollalo, oppure trascina il file.** Va bene qualunque cosa tu possa selezionare e copiare. Un file trascinato sul selettore viene letto dal tuo browser e messo nella casella — non c'è nessun passo di caricamento da saltare — e un'estensione `.json` o `.yaml` ti imposta la direzione.
3. **Scegli l'indentazione.** Due spazi, quattro, oppure una tabulazione. La tabulazione è offerta solo per il JSON: lo YAML è definito in termini di spazi, e una tabulazione non è un'indentazione valida al suo interno.
4. **Leggi l'errore dove sta l'errore.** Un parser che qui fallisce dice cosa ha trovato e su quale riga e colonna, invece di “token inatteso alla posizione 4193”. Di solito basta per sistemare un file di configurazione senza aprire nient'altro.
5. **Prenditi il risultato.** Copialo, oppure scaricalo come file, con il nome del formato in cui è uscito.

## Anche nella cassetta

- [Formattatore XML](https://abox.tools/it/formattare-xml/): XML sistemato per leggerlo o compattato per spedirlo, e convertito in JSON in tutte e due le direzioni. Niente di tutto questo finisce incollato nel server di qualcun altro.
- [Confronto testi](https://abox.tools/it/confrontare-testi/): Due testi dentro, ogni differenza segnata, riga per riga e parola per parola. Niente finisce incollato nel server di qualcun altro.
- [Codificatore e decodificatore Base64](https://abox.tools/it/codifica-base64/): Base64, codifica percentuale, entità HTML, esadecimale ed escape con barra rovesciata, in entrambi i versi. Niente finisce incollato nel server di qualcun altro.
- [Condividere testo e file](https://abox.tools/it/condividere-testo/): La condivisione vive in questa scheda aperta. I lettori la ricevono cifrata, direttamente dal tuo browser, e chiudere la scheda la fa finire: nessun server conserva nulla.

## Domande

### Il mio YAML viene caricato da qualche parte?

No. Tutti e due i parser e tutti e due gli stampatori di questa pagina sono funzioni che girano nel tuo browser, sul tuo hardware. Questo strumento non ha nessuna funzione di rete di alcun tipo — non scarica mai niente e non manda mai niente — e la `Content-Security-Policy` della pagina elenca ogni indirizzo che può contattare, e nessuno di questi è nostro. È proprio questo il motivo per usarlo su una configurazione di deploy: sono piene di nomi di host, nomi di bucket e ogni tanto di un segreto che qualcuno voleva spostare, e incollarne una nel convertitore di qualcun altro vuol dire dargliela.

### Cosa si perde convertendo YAML in JSON?

I commenti, perché JSON non ha dove metterli. Ancore, alias e tag vengono rifiutati del tutto invece che indovinati — ognuno di loro dice qualcosa che JSON non sa dire, e un convertitore che scegliesse di nascosto un'interpretazione ti darebbe un documento che non è quello che diceva il file. L'altra direzione non perde niente: ogni documento JSON è già un documento YAML.

### Il mio YAML dice no e il JSON è uscito come stringa. Perché?

Perché è una stringa, e qui si legge YAML 1.2 invece di 1.1. In YAML 1.1 `yes`, `no`, `on` e `off` erano booleani, ed è il famoso bug che trasforma il codice della Norvegia in `false`. YAML 1.2 ha lasciato perdere, e anche questo: solo `true`, `false`, `null` e `~` vengono letti come qualcosa di diverso dal testo. Nell'altra direzione quelle parole vengono riscritte *tra virgolette*, anche se qui verrebbero lette come testo pure senza, perché quello che aprirà il file dopo magari no. PyYAML usa ancora la 1.1 come impostazione predefinita. Leggere in modo severo e scrivere in modo prudente è l'unica combinazione giusta in tutte e due le direzioni.

### Mantiene l'ordine delle mie chiavi?

Sì, in tutte e due le direzioni, ed è più difficile di quanto sembri. Un convertitore costruito su `JSON.parse` sposta di nascosto in testa le chiavi che sembrano interi, quindi `{"10":a,"2":b}` torna come `{"2":b,"10":a}`. I numeri tengono le cifre che hai scritto, quindi un id di conto da venti cifre non perde le ultime tre per colpa di un double. Se invece li *vuoi* ordinati c'è una casella, e ordina in base a come si leggono le chiavi invece che ai loro code point.

### Può convertire più documenti YAML in una volta?

No, e lo dice invece di sceglierne uno. Un file con separatori `---` contiene più di un documento, e JSON non ha nessuna forma che voglia dire “più documenti”: un array sarebbe un'affermazione che il file non ha mai fatto. Convertili uno alla volta.

### Perché qui non c'è un formattatore YAML?

Perché lo YAML non ha una forma compattata che valga la pena scrivere: la forma corta è lo stile flow, che è illeggibile, e illeggibile è il contrario del motivo per cui si tiene un file in YAML. Sistemare JSON, XML, HTML e CSS è il lavoro del [formattatore JSON](https://abox.tools/it/formattare-json/), e quello sistema anche lo YAML.

### Quanto può essere grande il file?

Qui non c'è nessun limite impostato, perché non c'è un server che lo paga. Il tetto vero è il tuo dispositivo: qualche megabyte di YAML va bene, e con un documento molto lungo la pagina aspetta una pausa nella tua digitazione prima di convertire, invece di litigarti la tastiera.

### È gratis, e mi serve un account?

È gratis, e non c'è account, non c'è registrazione, non c'è periodo di prova e non c'è limite a quanto incolli. Il sito ha della pubblicità, ed è quella che lo mantiene; agli annunci non arriva niente sul tuo testo.

### Funziona offline?

Sì. Carica la pagina una volta, poi stacca internet e continua a funzionare. È anche il modo più semplice per dimostrare che non viene caricato niente: uno strumento che mandasse via la tua configurazione per convertirla si fermerebbe nel momento in cui stacchi la spina.

## Come si verifica quello che promette

- **Quello che incolli non ha dove andare.** La Content-Security-Policy elenca ogni indirizzo che questa pagina può contattare, e nessuno di questi è nostro. Qui non c'è nessun endpoint dove una configurazione incollata possa essere raccolta, e nel codice non c'è niente che ce la manderebbe se ci fosse.
- **Qui niente va a prendere niente.** Non c'è nessun `fetch`, nessun `XMLHttpRequest` e nessun `sendBeacon` da nessuna parte in `src/`. Tutti e due i parser e tutti e due gli stampatori sono funzioni di questa pagina che prendono una stringa e restituiscono una stringa.
- **Legge YAML 1.2, quindi la Norvegia resta la Norvegia.** In YAML 1.1 `no` era un booleano, ed è il famoso bug che trasforma il codice della Norvegia in `false`. Questo legge la 1.2, dove è la stringa che sembra. Nell'altra direzione quelle parole vengono riscritte *tra virgolette*, perché quello che aprirà il file dopo potrebbe essere ancora un lettore 1.1. `tests/js/text-convert.test.js` controlla tutte e due le metà.
- **Una conversione che non può essere onesta si ferma.** Un'ancora, un alias o un tag nello YAML chiudono la conversione con un messaggio che dice su quale riga si trovano, invece di un documento JSON che di nascosto vuol dire un'altra cosa. JSON non ha modo di dire “lo stesso nodo due volte”, e scegliere un'interpretazione sarebbe scegliere al posto tuo.
- **Cosa carica Google, e cosa non gli arriva.** Gli script della pubblicità e della misurazione arrivano da Google, e il pulsante delle donazioni da Buy Me a Coffee. A nessuno dei due viene passato un carattere del tuo testo. Ogni riga che lo legge, lo analizza o lo scrive è servita da questa origine ed è elencata nel repository.
- **Funziona offline.** Stacca la rete e lo strumento è identico, perché un passo di rete non c'è mai stato. È la prova più semplice che ci sia.

**Verifica tu stesso.** Niente di quanto sopra va preso per buono. Questa pagina la genera, dai modelli e dalla configurazione del repository, uno script di build che puoi leggere ed eseguire anche tu, e il risultato finisce sul branch `dist`: puoi quindi confrontare quello che viene servito con quello che produce una build dei sorgenti. https://github.com/A-Box-of-Tools/website

I file da leggere per primi sono `config/site.toml` per la Content-Security-Policy, `src/shared/parse-yaml.js` per il lettore che rifiuta un'ancora invece di indovinare cosa volesse dire, e `src/convert.js` per il motivo per cui una conversione è un parser e uno stampatore, senza niente in mezzo che conosca tutti e due i formati insieme.
