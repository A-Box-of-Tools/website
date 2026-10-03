# Comprimere un PDF — ridurre il peso di un documento

Alleggerisci un documento senza spedirlo da nessuna parte.

> Riduci il peso di un PDF senza caricarlo. Il file lo legge, lo ricomprime e lo riscrive il tuo browser, e prima di toccare qualunque cosa lo strumento ti mostra dove sta davvero il peso.

Questa pagina è uno strumento interattivo che funziona interamente nel tuo browser, all'indirizzo https://abox.tools/it/comprimere-pdf/ — nulla di ciò che gli affidi viene caricato. Quanto segue è tutto ciò che la pagina dice dello strumento a parole; per usarlo, apri l'indirizzo.

## Qui non si caricano documenti, **mai**. Non c'è nessun server.

Il documento viene aperto, smontato e riscritto in memoria su questo dispositivo, da codice servito da questo indirizzo. Qui dentro non c'è niente in grado di fare un caricamento, e dall'altra parte di questa pagina non c'è nessun server che potrebbe riceverlo.

- ✗ Niente caricamenti
- ✗ Nessun account
- ✓ Funziona offline
- ✓ Open source
- ✓ I file restano sul tuo dispositivo

## Come ridurre il peso di un PDF

1. **Scegli un PDF.** Trascinalo sul riquadro, oppure selezionalo a mano. Lo legge il browser direttamente dal tuo disco, e mentre lo fa non parte niente per nessuna destinazione.
2. **Guarda dove sta il peso.** La ripartizione è il senso del secondo passo. Se la barra è quasi tutta immagini, questo strumento ha qualcosa su cui lavorare. Se è quasi tutta caratteri e contenuto delle pagine te lo dirà, e il risparmio onesto sarà di qualche punto percentuale: meglio saperlo prima di perderci un minuto.
3. **Di' quanto stringere.** Le impostazioni con un nome sono risoluzioni, non voti vaghi: 96 DPI per leggere su uno schermo, 130 per mandarlo via mail, 220 per qualcosa che deve ancora andare in stampa. Ognuna viene misurata su quanto grande la figura viene davvero disegnata sulla pagina, così una foto messa lì come miniatura non finisce trattata come una scansione a pagina intera.
4. **Comprimi, e leggi la riga che dice che è stato verificato.** Quando la riscrittura è finita, il file prodotto viene riaperto dallo stesso lettore che sta su questa pagina e le sue pagine vengono contate. Se il conto non torna con l'originale, l'operazione viene dichiarata fallita e non ti viene offerto nessun download.

## La versione lunga

[Come alleggerire un PDF, e perché alcuni non si rimpiccioliscono](https://abox.tools/it/guide/ridurre-le-dimensioni-di-un-pdf/): Dove sta davvero il peso di un PDF, perché una scansione si comprime dell'80% e un contratto quasi non si muove, cosa vogliono dire qui i DPI, e cosa un compressore non dovrebbe mai fare al tuo documento.

## Anche nella cassetta

- [Oscuratore di PDF](https://abox.tools/it/oscurare-pdf/): Le lettere vengono cancellate dal file, e poi il file viene cercato per dimostrarlo.
- [Immagini in PDF](https://abox.tools/it/immagini-in-pdf/): Metti le tue foto dentro un documento solo.
- [Scanner per documenti](https://abox.tools/it/scansionare-documenti/): Fotografa la pagina. Ti torna indietro qualcosa che sembra scansionato.
- [Estrarre l'audio da un video](https://abox.tools/it/estrarre-audio-da-video/): Trascina dentro un video e portati via il suono. L'immagine non viene mai decodificata, e non viene caricato niente.

## Domande

### Il mio PDF viene caricato da qualche parte?

No. Il file lo legge, lo ricomprime e lo scrive il tuo browser sul tuo hardware. Questo strumento non ha un lato server, e la `Content-Security-Policy` della pagina elenca tutti gli indirizzi che può contattare, nessuno dei quali appartiene a questo sito. Di funzioni di rete facoltative non ne ha proprio.

### Di quanto si alleggerirà il mio PDF?

Dipende interamente da cosa c'è dentro, ed è per questo che lo strumento misura e ti mostra prima di comprimere qualunque cosa. Un documento scansionato è quasi tutto fotografie e di solito esce dal 60 al 90% più leggero. Un contratto o una tesi invece sono testo, disegno vettoriale e caratteri incorporati, tutte cose che erano già compresse da quello che le ha prodotte: lì il risparmio è di solito di qualche punto percentuale e viene dal reimpacchettare il file e dal buttare quello che non è più richiamato da nessuno. Qualunque strumento prometta una percentuale fissa senza aver guardato il tuo file sta tirando a indovinare.

### Comprimere un PDF fa perdere qualità?

Le figure che ha dentro vengono ricodificate, quindi sì, per quelle. Il resto non viene toccato: il testo resta testo, selezionabile e ricercabile, i caratteri restano interi e il disegno vettoriale viene copiato tale e quale. Lo strumento si rifiuta anche di peggiorare un'immagine per niente, perché se una ricodifica non esce più leggera dell'originale, i byte originali tornano intatti nel documento.

### Cosa sono qui i DPI, e perché me li chiede?

Un PDF registra quanto grande viene disegnata ogni figura sulla pagina, quindi lo strumento può ricavarne la risoluzione effettiva: una scansione da 4000 pixel stesa su venti centimetri di carta porta circa 500 pixel per pollice. Niente su uno schermo, e ben poco sulla carta, sa farsene qualcosa, quindi i pixel oltre l'impostazione che scegli sono i primi a essere buttati, perché costano qualità che nessuno può vedere. È quella misura a fare in modo che un logo messo piccolo non finisca trattato come una scansione a pagina intera.

### Può aprire un PDF protetto da password?

No, ed è voluto. Un documento cifrato viene rifiutato con un messaggio che lo dice, anche quando la password è vuota, che è poi il modo in cui salvano moltissimi scanner e fotocopiatrici. Togliere la protezione a un file è un lavoro diverso dal comprimerlo, e uno strumento che lo facesse in silenzio starebbe facendo qualcosa che non gli hai chiesto.

### Ci sono PDF che non riesce a comprimere?

Qualche immagine al loro interno, sì. Le immagini JPEG 2000, JBIG2 e in codifica fax (CCITT) non hanno un decodificatore in nessun browser, quindi passano intatte e vengono segnalate come tali; le ultime due, per giunta, sono codec pensati per il bianco e nero puro e di solito sono già vicine al minimo. Anche le immagini CMYK vengono lasciate stare, perché ricodificarle rischia di spostare i colori che una stampante produrrebbe. Tutto quello che lo strumento salta viene nominato nei risultati, con il motivo.

### Il file compresso si aprirà ancora dappertutto?

Sì. Il file in uscita è scritto in PDF 1.5, che ogni lettore uscito dal 2003 in poi capisce, e lo strumento te lo dimostra sul tuo dispositivo: riapre il file finito e ne conta le pagine prima di offrirtelo. Moduli, link, segnalibri, la struttura di accessibilità e gli eventuali allegati incorporati vengono portati dall'altra parte; quello che resta indietro è il materiale a cui niente, dentro il documento, faceva più riferimento.

### È gratis, e mi serve un account?

È gratis, e non c'è account, non c'è registrazione, non c'è periodo di prova e non c'è limite di dimensione oltre a quello che consente la memoria del tuo dispositivo. Il sito ha della pubblicità, ed è quella che lo mantiene; agli annunci non arriva niente sul tuo documento.

### Funziona offline?

Sì. Carica la pagina una volta, poi stacca la connessione e continua a funzionare. È anche il modo più semplice per dimostrare che non viene caricato niente, perché uno strumento che spedisse via il tuo documento per comprimerlo si fermerebbe nell'istante in cui stacchi la spina.

## Come si verifica quello che promette

- **Il tuo documento non ha dove andare.** La Content-Security-Policy elenca tutti gli indirizzi che questa pagina può contattare, e nessuno di quegli indirizzi appartiene a questo sito. Questo strumento non aggiunge niente a quella lista, perché non ha una funzione di rete propria, nemmeno facoltativa. Non esiste un punto di raccolta in cui il tuo file possa finire, e nel codice non c'è niente che ce lo manderebbe se anche esistesse.
- **Il formato sta tutto in questo repository.** Un PDF è un elenco di oggetti più una tabella che dice dove comincia ciascuno. `src/objects.js` legge quella sintassi, `src/reader.js` segue la tabella, `src/writer.js` ne scrive una nuova, e nessuno dei tre importa qualcosa che sappia fare una richiesta. Non viene scaricata nessuna libreria e non viene generato niente su un server.
- **I file cifrati vengono respinti invece che aperti.** Un PDF con una password sopra viene rifiutato, compreso quello che gli scanner producono con la password vuota e che tecnicamente si aprirebbe. Togliere la protezione a un documento è un lavoro diverso dall'alleggerirlo, e farlo in silenzio, per conto tuo, sarebbe una cosa quantomeno sorprendente.
- **Toglie, non aggiunge.** Il file finito non porta con sé data di creazione, né riga del produttore, né il nome dello strumento che l'ha fatto. Con la casella spuntata perde anche il pacchetto XMP e i blocchi privati che i programmi di impaginazione si lasciano dietro: lo stesso ragionamento dello strumento EXIF, applicato a un contenitore diverso.
- **Cosa carica Google, e cosa non gli arriva.** Gli script della pubblicità e della misurazione arrivano da Google. A nessuno dei due viene passato niente sul tuo documento: né un file, né una pagina, né un nome, né una dimensione, né un numero di pagine. Ogni riga che legge, decodifica o scrive un PDF è servita da questa origine ed è elencata nel repository.
- **Cosa carica il pulsante delle donazioni, e cosa non gli arriva.** Il pulsante «Buy me a coffee» in cima lo disegna uno script di cdnjs.buymeacoffee.com, che prende i caratteri da Google Fonts. È un link e niente di più: non riferisce nessuna visita, e non gli viene passato niente su di te o sul tuo documento. Finché non ci clicchi non succede niente, e quello a cui arriveresti è il sito di qualcun altro.
- **Funziona offline.** Stacca la rete e tutto quello che sta su questa pagina continua a funzionare. È la prova più semplice che ci sia, perché uno strumento che spedisse via il tuo documento per comprimerlo si fermerebbe.

**Verifica tu stesso.** Niente di quanto sopra va preso per buono. Questa pagina la genera, dai modelli e dalla configurazione del repository, uno script di build che puoi leggere ed eseguire anche tu, e il risultato finisce sul branch `dist`: puoi quindi confrontare quello che viene servito con quello che produce una build dei sorgenti. https://github.com/A-Box-of-Tools/website

I file da leggere per primi sono `config/site.toml` per la Content-Security-Policy, e `src/reader.js` e `src/writer.js` per tutta la lettura e la riscrittura, che non sanno né l'uno né l'altro raggiungere la rete.
