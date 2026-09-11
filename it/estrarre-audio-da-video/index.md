# Estrarre l'audio da un video — il suono da solo, in WAV

Trascina dentro un video e portati via il suono. L'immagine non viene mai decodificata, e non viene caricato niente.

> Tira fuori il suono da un MP4, MOV o WebM e salvalo come WAV. Il video non lascia il tuo dispositivo e la sua immagine non viene mai decodificata: tutto il lavoro gira nel tuo browser.

Questa pagina è uno strumento interattivo che funziona interamente nel tuo browser, all'indirizzo https://abox.tools/it/estrarre-audio-da-video/ — nulla di ciò che gli affidi viene caricato. Quanto segue è tutto ciò che la pagina dice dello strumento a parole; per usarlo, apri l'indirizzo.

## Qui non si caricano video, **mai**. Non c'è nessun server.

Il decodificatore è quello che il tuo browser ha già, lo stesso percorso di codice che riproduce un file in un elemento `<video>`, e gli viene chiesta la traccia audio e nient'altro. Scrivere un WAV significa mettere un'intestazione di quarantaquattro byte davanti ai campioni, in `src/shared/wav.js`. Non c'è nessun codificatore di mezzo, nessun passo di caricamento, e questa pagina non ha nessuna funzione di rete di alcun tipo.

- ✗ Niente caricamenti
- ✗ Nessun account
- ✗ Nessun limite di dimensione
- ✓ Funziona offline
- ✓ Open source

## Come estrarre l'audio da un video senza caricarlo

1. **Trascina dentro il video.** Un MP4, MOV, M4V o WebM, da un telefono, da una fotocamera, da un registratore di schermo o da un download. Lo legge il tuo browser; non c'è nessun passo di caricamento da saltare.
2. **Leggi cosa ha trovato.** La durata, il numero di canali e la frequenza di campionamento, presi direttamente dal file. Se il file non ha dichiarato la sua frequenza la pagina lo dice, invece di ricampionare in silenzio sostenendo che non è stato toccato niente.
3. **Scegli il mono, se lo vuoi più piccolo.** Lasciare i canali come sono tiene la registrazione esattamente com'era. Il missaggio in mono dimezza il file ed è quello che vuole una trascrizione o una registrazione vocale; fa la media dei canali invece di buttarne via uno.
4. **Ascoltalo prima di salvarlo.** Il lettore riproduce il file che sta per essere scaricato, non il video: quindi se suona bene, il download è giusto.
5. **Portatelo via, oppure passalo avanti.** Scarica il WAV, oppure mandalo direttamente al tagliatore o all'editor senza salvarlo prima.

## Anche nella cassetta

- [Taglierino audio](https://abox.tools/it/tagliare-audio/): Segna al volo i pezzi che valgono. Tornano in un file solo, tagliato dove hai detto tu.
- [Editor audio](https://abox.tools/it/modificare-audio/): Riproducila al contrario, cambiale velocità, tira su una registrazione troppo bassa. Tutto qui, sul tuo dispositivo.
- [Unire e dividere PDF](https://abox.tools/it/unire-pdf/): Pagine spostate senza un giro fino a un server.
- [Compressore di PDF](https://abox.tools/it/comprimere-pdf/): Alleggerisci un documento senza spedirlo da nessuna parte.

## Domande

### Il mio video viene caricato da qualche parte?

No. La decodifica e la scrittura avvengono entrambe nel tuo browser, sul tuo hardware. Questo strumento non ha nessuna funzione di rete di alcun tipo — non scarica mai niente e non manda mai niente — e la `Content-Security-Policy` della pagina elenca ogni indirizzo che può contattare, e nessuno di questi è nostro. Se preferisci verificare invece che fidarti, stacca internet ed estrai il suono lo stesso.

### Può darmi un MP3?

No, e non farà finta di poterlo fare. Nessun browser include un codificatore MP3, e l'unico modo per arrivarne a uno è mandare il tuo video a un server che ce l'ha, che è l'unica cosa per cui questo sito esiste per non farla. Quello che ottieni è un WAV: i campioni con un'intestazione di quarantaquattro byte davanti, che non ha bisogno di nessun codificatore e non può costare qualità. È più grande, circa dieci megabyte al minuto in stereo, e lo apre qualunque lettore, telefono o programma di montaggio. Qualsiasi cosa voglia un MP3 può farne uno da lì in un secondo.

### L'immagine viene mai guardata?

No, e qui non c'è niente che potrebbe guardarla. Al decodificatore del browser viene passato il file e gli viene chiesta la sua traccia audio; la traccia video non viene mai decodificata, mai disegnata e non arriva nemmeno al codice di questa pagina. In `src/` non c'è nessun decodificatore video da eseguire. Il file che esce contiene suono e nient'altro.

### Dice che non è stato possibile leggere audio, ma il video si vede benissimo.

Allora quasi sicuramente il video non ha traccia audio. Una registrazione dello schermo fatta senza microfono selezionato è muta, e lo è anche una clip esportata da un programma di montaggio con l'audio silenziato: entrambe si riproducono perfettamente, perché c'è un'immagine da mostrare. Il messaggio nomina questo caso per primo perché è il più probabile dei due; l'altro è un formato che questo browser non leggerà. Apri il file in un lettore e cerca un controllo del volume che non fa niente: è il modo più rapido per capire quale dei due hai.

### Quali formati video posso aprire?

Quelli che il tuo browser decodifica, che in pratica vuol dire MP4, M4V, MOV e WebM, e tutti i formati audio oltre a questi. Quello che resta fuori è la stessa breve lista di ogni altra parte del sito: AVI, WMV e la maggior parte degli MKV. Un file che il tuo browser non leggerà viene rifiutato con un messaggio che lo dice, invece di fallire a metà strada.

### Si perde qualità?

Niente oltre a quello che il video aveva già fatto al proprio audio quando è stato creato. I campioni che il decodificatore restituisce vengono scritti così come sono: non c'è una seconda codifica, quindi non c'è una seconda generazione di perdita. L'unica cosa da sapere è la frequenza di campionamento: quella del file viene letta per prima dalla sua intestazione e la decodifica viene fatta a quella frequenza, così la tua registrazione non viene ricampionata in silenzio. Se un file non ne dichiara nessuna, la pagina dice quale ha assunto.

### Perché il WAV è molto più grande del video?

Perché un WAV non è compresso e la traccia audio del video lo era. Il suono in qualità CD occupa circa dieci megabyte al minuto in stereo, qualunque cosa contenga; la traccia AAC dentro un MP4 forse un decimo di quello. Il missaggio in mono lo dimezza. È il prezzo del non ricodificare, e si paga una volta sola: qualunque cosa con cui aprirai il file dopo potrà comprimerlo.

### Quanto può essere lungo il video?

Qui non c'è nessun limite impostato, perché non c'è un server che lo paga. Il tetto vero è la memoria del tuo dispositivo: il file viene letto per intero e tutta la traccia audio viene tenuta come campioni, quindi una registrazione molto lunga su un dispositivo piccolo può restare senza spazio. Qualche ora di video di solito va bene, e un telefono ne reggerà meno di un portatile.

### Posso accorciarlo o alzare il volume?

Sì, ma non qui: questa pagina fa un lavoro solo. Quando c'è un risultato compare una fila di link accanto al download che lo porta direttamente nel [tagliatore audio](https://abox.tools/it/tagliare-audio/) o nell'[editor audio](https://abox.tools/it/modificare-audio/) senza salvarlo prima, e senza che nemmeno loro lo carichino.

### È gratis, e mi serve un account?

È gratis, e non c'è account, non c'è registrazione, non c'è periodo di prova e non c'è limite a quanti video apri. Il sito ha della pubblicità, ed è quella che lo mantiene; agli annunci non arriva niente sul tuo file.

### Funziona offline?

Sì. Carica la pagina una volta, poi stacca internet e continua a funzionare. È anche il modo più semplice per dimostrare che non viene caricato niente: uno strumento che mandasse via il tuo video per elaborarlo si fermerebbe nel momento in cui stacchi la spina.

## Come si verifica quello che promette

- **Il tuo video non ha dove andare.** La Content-Security-Policy elenca ogni indirizzo che questa pagina può contattare, e nessuno di questi è nostro. Qui non c'è nessun endpoint dove un file possa essere raccolto, e nel codice non c'è niente che ce lo manderebbe se ci fosse.
- **L'immagine non viene decodificata affatto.** Viene chiesta solo la traccia audio. I fotogrammi non vengono letti, né decodificati, né disegnati, né guardati — su questa pagina non c'è codice che potrebbe farlo — e il file che esce contiene suono e nient'altro. Non è una promessa di autocontrollo: a `decodeAudioData` vengono passati i byte e restituisce suono, e in `src/` non c'è nessun decodificatore video da eseguire.
- **Il decodificatore è quello che il tuo browser ha già.** Qui non viene spedito niente per leggere il tuo formato, e non viene chiesto niente a niente fuori da questa pagina per leggerlo. Quali file funzionano è quindi esattamente quello che il tuo browser già riproduce.
- **I campioni vengono scritti così come sono, non ricodificati.** Un WAV sono i campioni restituiti dal decodificatore con un'intestazione davanti. Non c'è nessun codificatore di mezzo che prenda decisioni sulla tua registrazione, e non c'è niente che si possa descrivere come un caricamento su cui una cosa del genere possa avvenire.
- **Cosa carica Google, e cosa non gli arriva.** Gli script della pubblicità e della misurazione arrivano da Google, e il pulsante delle donazioni da Buy Me a Coffee. A nessuno di loro viene passato niente sul tuo video: né il file, né un campione, né un nome, una dimensione o una durata.
- **Funziona offline.** Stacca la rete e lo strumento è identico, perché un passo di rete non c'è mai stato. È la prova più semplice che ci sia.

**Verifica tu stesso.** Niente di quanto sopra va preso per buono. Questa pagina la genera, dai modelli e dalla configurazione del repository, uno script di build che puoi leggere ed eseguire anche tu, e il risultato finisce sul branch `dist`: puoi quindi confrontare quello che viene servito con quello che produce una build dei sorgenti. https://github.com/A-Box-of-Tools/website

I file da leggere per primi sono `config/site.toml` per la Content-Security-Policy, `src/shared/audio-decode.js` per l'unico decodificatore che c'è e per il motivo per cui l'immagine non viene mai chiesta, e `src/shared/samplerate.js` per la lettura dell'intestazione che impedisce alla tua registrazione di essere ricampionata in silenzio.
