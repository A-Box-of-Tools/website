# Creare un timelapse — velocizzare un video online

Un'ora di girato in venti secondi.

> Trasforma un video lungo in un timelapse: 10x, 60x o la velocità che scrivi tu. Gira nel browser, non carica niente, non mette filigrane e funziona anche offline.

Questa pagina è uno strumento interattivo che funziona interamente nel tuo browser, all'indirizzo https://abox.tools/it/creare-timelapse/ — nulla di ciò che gli affidi viene caricato. Quanto segue è tutto ciò che la pagina dice dello strumento a parole; per usarlo, apri l'indirizzo.

## Qui non si caricano video, **mai**. Non c'è nessun server.

Ogni fotogramma viene scelto, decodificato e ricodificato dal tuo browser, sul tuo hardware. Qui dentro non c'è niente che sappia recuperare o spedire qualcosa, perché questo strumento non ha proprio nessuna funzione di rete. E dall'altra parte di questa pagina non c'è nessun server a cui mandare un video, anche se una funzione del genere ci fosse.

- ✗ Nessun caricamento
- ✗ Nessun account
- ✗ Nessuna filigrana
- ✓ La velocità che scrivi tu
- ✓ Funziona offline

## Come creare un timelapse da un video

1. **Scegli un video.** Trascina un MP4, un MOV, un M4V o un WebM sul riquadro, oppure selezionane uno a mano. Lo legge il browser direttamente dal tuo disco, e mentre lo fa non parte niente per nessuna destinazione.
2. **Di' quanto più veloce.** Premi una delle velocità, oppure scrivi la tua. Se preferisci dire quanto deve durare il risultato, del tipo «che stia in venti secondi», scrivi quello e la velocità viene da sé.
3. **Controlla l'intervallo.** La riga sotto la velocità dice cosa sta davvero per succedere: un fotogramma ogni tot secondi dell'originale. È il numero che si imposterebbe su una macchina fotografica, ed è quello da rileggere prima di partire.
4. **Crealo e scaricalo.** Il lavoro avviene sul tuo hardware, quindi quanto ci mette dipende dal tuo dispositivo e non da una coda. Il video finito va dritto nei download del browser.

## La versione lunga

[Come trasformare un video lungo in un timelapse](https://abox.tools/it/guide/trasformare-un-video-lungo-in-timelapse/): Un'ora di girato in un minuto guardabile: come scegliere la velocità, perché dire la durata finale batte fare i conti, e quando il risultato deve diventare una GIF.

## Anche nella cassetta

- [Estrattore di fotogrammi](https://abox.tools/it/estrarre-fotogramma-video/): Un fermo immagine a piena qualità, da qualsiasi punto.
- [Da video a GIF](https://abox.tools/it/video-in-gif/): Scegli il pezzo, la dimensione e la frequenza dei fotogrammi.
- [Creatore di GIF](https://abox.tools/it/creare-gif/): Trasforma una serie di immagini in una sola animazione.
- [Divisore di GIF](https://abox.tools/it/dividere-gif-in-fotogrammi/): Ogni fotogramma fuori, nel suo PNG.

## Domande

### Il mio video viene caricato da qualche parte?

No. È il tuo browser a leggerlo, decodificarlo, sceglierne i fotogrammi e codificarli, sul tuo hardware. Questo strumento non ha un lato server, e la `Content-Security-Policy` della pagina elenca tutti gli indirizzi che può contattare: nessuno appartiene a questo sito. Se preferisci controllare invece che fidarti, stacca la connessione e crea un timelapse lo stesso.

### Cosa vuol dire esattamente la velocità?

È il rapporto fra quello che entra e quello che esce. A 60× un'ora di girato diventa un minuto, a qualsiasi frequenza tu lo riproduca. Sotto, lo strumento prende un fotogramma ogni *velocità ÷ fotogrammi al secondo*: 60× a 30 fotogrammi al secondo è uno ogni due secondi. La pagina ti mostra quell'intervallo prima di partire, perché è il numero che dice cosa sta succedendo davvero.

### Quali formati video posso velocizzare?

MP4, M4V e MOV vengono letti direttamente, qualunque cosa contengano: H.264, HEVC, AV1 o VP9, purché il tuo browser sappia decodificare quel codec. Tutto il resto che il browser sa riprodurre, WebM in primo luogo, viene letto portando il lettore su ogni singolo istante, e funziona con ogni formato che sappia aprire. Un file che il browser non sa né leggere né riprodurre, in pratica AVI, WMV, FLV e quasi tutti gli MKV, viene rifiutato con un messaggio che lo dice, invece di piantarsi a metà strada. Quello che esce è sempre un MP4.

### Perché il timelapse non ha audio?

Perché non c'è niente che valga la pena tenere. Il suono a trenta volte la sua velocità non è né parlato né musica, è un pigolio; e l'alternativa, lasciare l'audio alla velocità originale sotto un'immagine che gli è scappata avanti, sarebbe una clip diversa da quella che hai chiesto. La traccia quindi cade, ed è anche gran parte del motivo per cui un'ora di video esce come pochi megabyte. Se quello che ti serve è l'audio da solo, l'[Editor audio](https://abox.tools/it/modificare-audio/) lo salva.

### È più veloce che convertire tutto il video?

Molto di più, ed è proprio per questo che il file viene letto direttamente. Un fotogramma si può decodificare solo partendo dal fotogramma chiave che lo precede, ma niente dice che quelli in mezzo vadano tenuti: un timelapse a 60× di un'ora decodifica qualche migliaio di fotogrammi invece di centomila. Il riepilogo dice esattamente quanti ne leggerà prima che tu prema il pulsante.

### Si perde qualità?

I fotogrammi tenuti vengono codificati una seconda volta, e questo costa un po'. Non si può evitare, perché la clip finita li mostra in momenti per cui nel file originale non era codificato niente. Quello su cui questo strumento spende più degli altri strumenti video qui è il bitrate, ed è voluto: due fotogrammi distanti due secondi hanno molto meno in comune di due distanti un trentesimo di secondo, quindi il codec ha meno da riutilizzare e una cifra pensata per il girato normale uscirebbe a blocchi.

### C'è un limite di dimensione o di durata?

Nello strumento non c'è nessun limite, e il file non finisce nemmeno in memoria tutto insieme: vengono letti solo brevi tratti attorno a ogni istante. Il tetto pratico è il timelapse finito, che viene montato in memoria prima che tu lo scarichi, e un timelapse è corto per definizione. Il riepilogo mostra più o meno quanto peserà prima di partire.

### Posso velocizzare solo una parte della clip?

Qui no. Questo strumento prende tutto, dal primo fotogramma all'ultimo. Taglia prima il pezzo che vuoi con il [Tagliavideo](https://abox.tools/it/tagliare-video/), che lo fa senza ricodificare un solo fotogramma, e poi velocizza quello che ne esce.

### È gratis, e serve un account?

È gratis, e non c'è nessun account, nessuna registrazione, nessuna prova e nessuna filigrana. Il sito è pagato dalla pubblicità, e agli annunci non viene passato niente sul tuo video.

## Come si verifica quello che promette

- **I tuoi video non hanno dove andare.** La Content-Security-Policy elenca tutti gli indirizzi che questa pagina può contattare, e nessuno di quegli indirizzi appartiene a questo sito. Non esiste un punto di raccolta in cui il tuo file possa finire, e nel codice non c'è niente che ce lo manderebbe se anche esistesse.
- **Qui dentro niente va a recuperare niente.** Questo strumento non ha proprio nessuna funzione di rete: nessun indirizzo da incollare, niente da scaricare, nessun motore che si scarichi al primo utilizzo. Ogni byte che tocca il tuo video è arrivato da questa origine nel momento in cui si è caricata la pagina.
- **La decodifica e la codifica avvengono in locale.** I fotogrammi passano per WebCodecs dentro il tuo browser, oppure per lo stesso motore di riproduzione che ti mostrerebbe la clip comunque. Il file finito viene costruito in memoria su questo dispositivo e consegnato direttamente a un download.
- **La maggior parte del file non viene nemmeno letta.** Un timelapse ha bisogno di un fotogramma ogni pochi secondi, così lo strumento legge il breve tratto di file attorno a ciascuno di quei momenti e salta tutto il resto. È una scelta di velocità e non di riservatezza, ma vale la pena saperlo lo stesso: anche qui, sul tuo dispositivo, la maggior parte del tuo video non viene mai aperta.
- **Cosa carica Google, e cosa non gli arriva.** Gli script della pubblicità e della misurazione arrivano da Google. A nessuno dei due viene passato niente sul tuo video: né un file, né un fotogramma, né un nome, né una dimensione, né una durata. Ogni riga che legge, decodifica, sceglie o codifica è servita da questa origine ed è elencata nel repository.
- **Cosa carica il pulsante delle donazioni, e cosa non gli arriva.** Il pulsante «Buy me a coffee» in cima lo disegna uno script di cdnjs.buymeacoffee.com, che prende i caratteri da Google Fonts. È un link e niente di più: non riferisce nessuna visita, e non gli viene passato niente su di te o sul tuo video.
- **Funziona offline.** Stacca la rete e tutto quello che sta su questa pagina continua a funzionare. È la prova più semplice che ci sia.

**Verifica tu stesso.** Niente di quanto sopra va preso per buono. Questa pagina la genera, dai modelli e dalla configurazione del repository, uno script di build che puoi leggere ed eseguire anche tu, e il risultato finisce sul branch `dist`: puoi quindi confrontare quello che viene servito con quello che produce una build dei sorgenti. https://github.com/A-Box-of-Tools/website

I file da leggere per primi sono `config/site.toml` per la Content-Security-Policy, `src/plan.js` per i conti che decidono da quale istante arriva ogni fotogramma, e `src/decode.js` per il ciclo che legge solo le parti del file di cui quegli istanti hanno bisogno. Nessuno dei due importa qualcosa che sappia fare una richiesta.
