# Formattatore XML — sistemalo, compattalo o trasformalo in JSON

XML sistemato per leggerlo o compattato per spedirlo, e convertito in JSON in tutte e due le direzioni. Niente di tutto questo finisce incollato nel server di qualcun altro.

> Formatta, indenta e compatta XML, e converti XML in JSON o JSON in XML. Il parser gira nel tuo browser e non viene caricato niente, quindi un feed, una fattura o un file di configurazione non lascia mai il tuo dispositivo.

Questa pagina è uno strumento interattivo che funziona interamente nel tuo browser, all'indirizzo https://abox.tools/it/formattare-xml/ — nulla di ciò che gli affidi viene caricato. Quanto segue è tutto ciò che la pagina dice dello strumento a parole; per usarlo, apri l'indirizzo.

## Qui non si caricano file XML e JSON, **mai**. Non c'è nessun server.

Formattare e convertire sono aritmetica su una stringa, fatta qui, in questa pagina. Il parser è scritto a mano e sta in `src/shared/parse-xml.js`, e non c'è nient'altro. Questo strumento non ha nessuna funzione di rete di alcun tipo — niente da scaricare, niente da mandare — e qui conta più di quanto la parola “XML” lasci pensare: quello che arriva in questo formato di solito è una fattura, un estratto conto, una cartella clinica, o una richiesta SOAP con le credenziali di qualcuno nell'intestazione.

- ✗ Niente caricamenti
- ✗ Nessun account
- ✗ Nessun limite di dimensione
- ✓ Funziona offline
- ✓ Open source

## Come formattare XML senza caricarlo

1. **Scegli il lavoro.** Due schede, una casella: *Formatta* sistema l'XML o lo compatta; *Converti* lo trasforma in JSON, o il JSON di nuovo in XML. L'XML che hai appena sistemato è l'XML che converti, senza incollarlo due volte.
2. **Incollalo, oppure trascina il file.** Va bene qualunque cosa tu possa selezionare e copiare, e un file `.xml`, `.svg`, `.rss` o `.xsd` trascinato sul selettore viene letto dal tuo browser e messo nella casella — non c'è nessun passo di caricamento da saltare.
3. **Scegli l'indentazione, o compattalo.** Due spazi, quattro, oppure una tabulazione. Compattarlo è lo stesso documento senza nessuno degli spazi che c'erano solo per leggerlo, e il risultato dice quanti byte ha fatto risparmiare.
4. **Leggi l'errore dove sta l'errore.** Un parser che qui fallisce dice *quale tag* non è stato mai chiuso e su quale riga e colonna, invece di “errore alla riga 1”, che è quello che dice un browser di un documento letto tutto in una volta.
5. **Prenditi il risultato.** Copialo, oppure scaricalo come file, con il nome del formato in cui è uscito.

## Anche nella cassetta

- [Confronto testi](https://abox.tools/it/confrontare-testi/): Due testi dentro, ogni differenza segnata, riga per riga e parola per parola. Niente finisce incollato nel server di qualcun altro.
- [Codificatore e decodificatore Base64](https://abox.tools/it/codifica-base64/): Base64, codifica percentuale, entità HTML, esadecimale ed escape con barra rovesciata, in entrambi i versi. Niente finisce incollato nel server di qualcun altro.
- [Condividere testo e file](https://abox.tools/it/condividere-testo/): La condivisione vive in questa scheda aperta. I lettori la ricevono cifrata, direttamente dal tuo browser, e chiudere la scheda la fa finire: nessun server conserva nulla.
- [Generatore di QR code e codici a barre](https://abox.tools/it/creare-qr-code/): Lo scrivi, e diventa un codice. Per farne uno non parte niente.

## Domande

### Il mio XML viene caricato da qualche parte?

No. Il parser e lo stampatore di questa pagina sono funzioni che girano nel tuo browser, sul tuo hardware. Questo strumento non ha nessuna funzione di rete di alcun tipo — non scarica mai niente e non manda mai niente — e la `Content-Security-Policy` della pagina elenca ogni indirizzo che può contattare, e nessuno di questi è nostro. Per l'XML conta più di quanto la fama del formato lasci pensare: quello che ci arriva dentro di solito è una fattura, un estratto conto, una cartella clinica, o una richiesta SOAP con le credenziali nell'intestazione.

### Risolve le entità esterne?

No, e non c'è niente da disattivare. La risoluzione delle entità esterne è il modo in cui un parser XML viene convinto a leggere file dalla macchina che lo esegue — l'attacco che di solito si scrive XXE — e `src/shared/parse-xml.js` è un lettore scritto a mano senza nessuna risoluzione di entità. Il tuo testo non viene mai consegnato nemmeno al `DOMParser` del browser. Un `DOCTYPE` viene portato avanti senza essere mai eseguito.

### Cosa si perde convertendo XML in JSON?

L'ordine del contenuto misto, i commenti, e la differenza tra un attributo e un elemento figlio — quest'ultima attenuata più che cancellata, perché un attributo diventa un membro il cui nome comincia con `@`. Il testo proprio di un elemento diventa `#text` quando deve stare accanto a qualcos'altro, e i figli ripetuti diventano un array. Ogni valore resta una stringa: l'XML non ha tipi, e decidere che `8080` fosse un numero sarebbe inventare un'informazione.

### Cosa si perde convertendo JSON in XML?

La differenza tra un oggetto vuoto, un array vuoto e una stringa vuota, che diventano tutti e tre un elemento vuoto, e il tipo di ogni valore, perché l'XML non ha tipi. Un array diventa un elemento ripetuto, che è l'unica forma che si rilegge, e a una chiave che un nome di elemento non può reggere vengono sostituiti i caratteri scomodi invece di produrre un documento che nessun parser leggerà.

### Può formattare un SVG, un feed RSS o un file POM?

Sì. Tutti e tre sono XML, e questo legge XML invece di un dialetto particolare. Un SVG sistemato così è più facile da modificare a mano; un feed RSS o Atom di solito viene spedito compattato ed è illeggibile finché qualcosa non lo apre. La disposizione non cambia niente di quello che il documento significa.

### Reindentare l'XML cambia quello che significa?

Per un documento i cui elementi contengono altri elementi, no. Dove può contare è il testo: gli spazi dentro un elemento che contiene parole fanno parte di quel testo, quindi un elemento che contiene solo testo viene lasciato su una riga invece che aperto. Le sezioni `CDATA` vengono copiate esattamente com'erano.

### Perché non usare direttamente il parser XML del browser?

Per quello che dice quando il documento è rotto. Il `DOMParser` restituisce un documento di errore la cui formulazione è diversa in ogni browser e spesso si riduce a “errore alla riga 1”. Un lettore scritto a mano può dire quale tag non è stato mai chiuso, e dove era stato aperto, che è la cosa che ti serviva davvero sapere. Non risolvere le entità esterne è l'altro motivo.

### Quanto può essere grande il file?

Qui non c'è nessun limite impostato, perché non c'è un server che lo paga. Il tetto vero è il tuo dispositivo: qualche megabyte di XML va bene, e con un documento molto lungo la pagina aspetta una pausa nella tua digitazione prima di riformattare, invece di litigarti la tastiera.

### È gratis, e mi serve un account?

È gratis, e non c'è account, non c'è registrazione, non c'è periodo di prova e non c'è limite a quanto incolli. Il sito ha della pubblicità, ed è quella che lo mantiene; agli annunci non arriva niente sul tuo testo.

### Funziona offline?

Sì. Carica la pagina una volta, poi stacca internet e continua a funzionare. È anche il modo più semplice per dimostrare che non viene caricato niente: uno strumento che mandasse via il tuo XML per formattarlo si fermerebbe nel momento in cui stacchi la spina.

## Come si verifica quello che promette

- **Quello che incolli non ha dove andare.** La Content-Security-Policy elenca ogni indirizzo che questa pagina può contattare, e nessuno di questi è nostro. Qui non c'è nessun endpoint dove una fattura incollata possa essere raccolta, e nel codice non c'è niente che ce la manderebbe se ci fosse.
- **Qui niente va a prendere niente.** Non c'è nessun `fetch`, nessun `XMLHttpRequest` e nessun `sendBeacon` da nessuna parte in `src/`. Il parser e lo stampatore sono funzioni di questa pagina che prendono una stringa e restituiscono una stringa.
- **Nessuna entità esterna viene mai risolta.** Un `DOCTYPE` con dentro un'entità esterna è il modo in cui un parser XML viene convinto a leggere un file dalla macchina che sta analizzando, ed è il buco più vecchio del formato. `src/shared/parse-xml.js` è un lettore scritto a mano che non ha nessuna risoluzione di entità — non disattivata, assente — e questa pagina non consegna mai il tuo testo al `DOMParser` del browser stesso.
- **Ogni valore che esce dall'XML è una stringa.** `<port>8080</port>` non dice niente sul fatto che quello sia un numero, quindi il JSON dice `"8080"`. Deciderlo al posto tuo sarebbe inventare un'informazione che poi viaggia come se fosse stata nel file.
- **Cosa carica Google, e cosa non gli arriva.** Gli script della pubblicità e della misurazione arrivano da Google, e il pulsante delle donazioni da Buy Me a Coffee. A nessuno dei due viene passato un carattere del tuo testo. Ogni riga che lo legge, lo analizza o lo scrive è servita da questa origine ed è elencata nel repository.
- **Funziona offline.** Stacca la rete e lo strumento è identico, perché un passo di rete non c'è mai stato. È la prova più semplice che ci sia.

**Verifica tu stesso.** Niente di quanto sopra va preso per buono. Questa pagina la genera, dai modelli e dalla configurazione del repository, uno script di build che puoi leggere ed eseguire anche tu, e il risultato finisce sul branch `dist`: puoi quindi confrontare quello che viene servito con quello che produce una build dei sorgenti. https://github.com/A-Box-of-Tools/website

I file da leggere per primi sono `config/site.toml` per la Content-Security-Policy, `src/shared/parse-xml.js` per il parser che ti dice quale tag non è stato mai chiuso, e `src/convert.js` per il motivo per cui ogni valore esce dall'XML come stringa invece di essere indovinato.
