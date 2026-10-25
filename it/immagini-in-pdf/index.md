# Immagini in PDF — convertitore da JPG a PDF

Metti le tue foto dentro un documento solo.

> Unisci immagini JPG, PNG o WebP in un unico PDF, gratis e interamente dentro il tuo browser. Le foto entrano senza essere ricodificate, e non viene caricato niente.

Questa pagina è uno strumento interattivo che funziona interamente nel tuo browser, all'indirizzo https://abox.tools/it/immagini-in-pdf/ — nulla di ciò che gli affidi viene caricato. Quanto segue è tutto ciò che la pagina dice dello strumento a parole; per usarlo, apri l'indirizzo.

## Qui non si caricano immagini, **mai**. Non c'è nessun server.

Il documento viene scritto in memoria su questo dispositivo, una pagina alla volta, da codice servito da questo indirizzo. Qui dentro non c'è niente in grado di fare un caricamento, e dall'altra parte di questa pagina non c'è nessun server che potrebbe riceverlo.

- ✗ Niente caricamenti
- ✗ Nessun account
- ✓ Funziona offline
- ✓ Open source
- ✓ I file restano sul tuo dispositivo

## Come trasformare delle immagini in un PDF

1. **Scegli le immagini.** Trascina una cartella sul riquadro, oppure seleziona i file a mano. Li legge il browser direttamente dal tuo disco, e mentre lo fa non parte niente per nessuna destinazione.
2. **Metti le pagine in ordine, e gira quelle che ne hanno bisogno.** Un'immagine diventa una pagina, nell'ordine che vedi. Trascina una tessera per la sua maniglia se vuoi spostarla, oppure usa le frecce; i pulsanti di rotazione girano una pagina di un quarto alla volta, che è quello che di solito serve a una scansione storta.
3. **Scegli una dimensione di pagina.** Con «adatta la pagina a ogni immagine» ogni pagina diventa esattamente la sua immagine, senza niente di ritagliato e senza bande bianche. Le dimensioni con un nome, cioè A4, Letter, Legal e le altre, mettono invece ogni immagine su una pagina fissa, con un margine se ne vuoi uno.
4. **Crea il PDF e scaricalo.** Il documento viene scritto sul tuo dispositivo, quindi quanto ci mette dipende dal tuo hardware e non da una coda. Il file finito finisce dritto nei download del browser.

## La versione lunga

[Come unire delle immagini in un unico PDF](https://abox.tools/it/guide/unire-immagini-in-un-pdf/): Trasforma foto o scansioni in un unico PDF: dimensione della pagina, ordine e rotazione, perché un JPEG non deve perdere qualità entrando, e cosa dice un PDF alla persona a cui lo mandi.

## Anche nella cassetta

- [Scanner per documenti](https://abox.tools/it/scansionare-documenti/): Fotografa la pagina. Ti torna indietro qualcosa che sembra scansionato.
- [Estrarre l'audio da un video](https://abox.tools/it/estrarre-audio-da-video/): Trascina dentro un video e portati via il suono. L'immagine non viene mai decodificata, e non viene caricato niente.
- [Taglierino audio](https://abox.tools/it/tagliare-audio/): Segna al volo i pezzi che valgono. Tornano in un file solo, tagliato dove hai detto tu.
- [Editor audio](https://abox.tools/it/modificare-audio/): Riproducila al contrario, cambiale velocità, tira su una registrazione troppo bassa. Tutto qui, sul tuo dispositivo.

## Domande

### Le mie immagini vengono caricate da qualche parte?

No. Le tue immagini le legge, e il PDF lo scrive, il tuo browser sul tuo hardware. Questo strumento non ha un lato server, e la `Content-Security-Policy` della pagina elenca tutti gli indirizzi che può contattare, nessuno dei quali appartiene a questo sito. A differenza di qualche altro strumento di qui, questo di funzioni di rete facoltative non ne ha proprio.

### Convertire in PDF fa perdere qualità?

Non per un JPEG, con l'impostazione predefinita. Il PDF i dati JPEG li sa portare direttamente, quindi una fotografia viene copiata nel documento byte per byte: non viene mai decodificata e non viene mai ricompressa, e l'immagine nel PDF è l'immagine che c'era nel file. Gli altri formati vanno invece ricodificati, perché il PDF per loro non ha un filtro, a meno che tu non scelga l'impostazione senza perdita, che li conserva esattamente al prezzo di un file più pesante.

### Quali formati di immagine posso usare?

Qualunque immagine ferma che il tuo browser sappia decodificare, il che in pratica vuol dire JPG, PNG, WebP, GIF, AVIF e, sui dispositivi Apple, HEIC. Qui non c'è nessun elenco a parte da tenere aggiornato, perché la decodifica è compito del browser e non nostro.

### Posso scegliere la dimensione della pagina e l'ordine delle pagine?

Sì. Le pagine possono essere A4, Letter, Legal, A3, A5, Tabloid, una dimensione che scrivi tu, oppure esattamente la dimensione di ogni immagine. Trascina le tessere per riordinarle, ordinale per nome o per data, ruotane una qualsiasi di un quarto di giro, e imposta un margine in millimetri.

### Quante immagini posso mettere in un PDF?

Nello strumento non c'è nessun limite. Il tetto pratico è la memoria del tuo dispositivo, perché il documento finito viene assemblato lì prima che tu lo scarichi. La prima cosa a sentirlo è qualche centinaio di foto da telefono a piena risoluzione; rimpicciolire il lato più lungo, nelle impostazioni, sposta quel tetto parecchio più in là.

### Il PDF contiene i nomi dei miei file o un orario?

No, a meno che tu non lo chieda. Il blocco di informazioni del documento resta vuoto tranne che per il nome di questo strumento: nessun nome di file, nessun nome di dispositivo, nessun nome utente, e nessuna data di creazione se non spunti la casella apposta. È voluto, perché un PDF è una cosa che le persone mandano ad altre persone.

### È gratis, e mi serve un account?

È gratis, e non c'è account, non c'è registrazione e non c'è periodo di prova. Il sito ha della pubblicità, ed è quella che lo mantiene; agli annunci non arriva niente sulle tue immagini.

### Funziona offline?

Sì. Carica la pagina una volta, poi stacca la connessione e continua a funzionare. È anche il modo più semplice per dimostrare che non viene caricato niente, perché uno strumento che spedisse via le tue immagini per farne un documento si fermerebbe nell'istante in cui stacchi la spina.

## Come si verifica quello che promette

- **Le tue immagini non hanno dove andare.** La Content-Security-Policy elenca tutti gli indirizzi che questa pagina può contattare, e nessuno di quegli indirizzi appartiene a questo sito. Questo strumento non aggiunge niente a quella lista, perché non ha una funzione di rete propria, nemmeno facoltativa. Non esiste un punto di raccolta in cui i tuoi file possano finire, e nel codice non c'è niente che ce li manderebbe se anche esistesse.
- **Il PDF viene scritto qui.** Un PDF è un elenco di oggetti più una tabella che dice dove comincia ciascuno, e `src/shared/pdf-page-writer.js` scrive tutti e due. Non viene scaricata nessuna libreria, non viene generato niente su un server, e il file finito viene consegnato a un download direttamente dalla memoria.
- **Al documento non viene detto niente su di te.** Quasi tutti gli strumenti timbrano un PDF con un orario e il nome del programma che l'ha fatto. Questo scrive un titolo, un autore e una data solo se li digiti tu: i nomi dei file delle tue immagini nel documento non compaiono mai, e non ci compare niente sul tuo dispositivo.
- **Cosa carica Google, e cosa non gli arriva.** Gli script della pubblicità e della misurazione arrivano da Google. A nessuno dei due viene passato niente sulle tue immagini: né un file, né una miniatura, né un nome, né una dimensione, né un conteggio. Ogni riga che legge, decodifica o scrive un'immagine è servita da questa origine ed è elencata nel repository.
- **Cosa carica il pulsante delle donazioni, e cosa non gli arriva.** Il pulsante «Buy me a coffee» in cima lo disegna uno script di cdnjs.buymeacoffee.com, che prende i caratteri da Google Fonts. È un link e niente di più: non riferisce nessuna visita, e non gli viene passato niente su di te o sulle tue immagini. Finché non ci clicchi non succede niente, e quello a cui arriveresti è il sito di qualcun altro.
- **Funziona offline.** Stacca la rete e tutto quello che sta su questa pagina continua a funzionare. È la prova più semplice che ci sia, perché uno strumento che spedisse via le tue foto per farne un documento si fermerebbe.

**Verifica tu stesso.** Niente di quanto sopra va preso per buono. Questa pagina la genera, dai modelli e dalla configurazione del repository, uno script di build che puoi leggere ed eseguire anche tu, e il risultato finisce sul branch `dist`: puoi quindi confrontare quello che viene servito con quello che produce una build dei sorgenti. https://github.com/A-Box-of-Tools/website

I file da leggere per primi sono `config/site.toml` per la Content-Security-Policy, e `src/shared/pdf-page-writer.js` e `src/document.js` per tutta la scrittura del file, che la rete non la tocca mai.
