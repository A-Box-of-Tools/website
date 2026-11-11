# Invertire un video — riprodurlo al contrario

L'ultimo fotogramma per primo, audio compreso.

> Riproduci un MP4, MOV o WebM al contrario, con anche l'audio invertito. Gira nel browser: non viene caricato niente, non c'è filigrana e funziona offline.

Questa pagina è uno strumento interattivo che funziona interamente nel tuo browser, all'indirizzo https://abox.tools/it/invertire-video/ — nulla di ciò che gli affidi viene caricato. Quanto segue è tutto ciò che la pagina dice dello strumento a parole; per usarlo, apri l'indirizzo.

## Qui non si caricano video, **mai**. Non c'è nessun server.

Ogni fotogramma viene decodificato, girato e ricodificato dal tuo browser, sul tuo hardware. Qui non c'è niente che possa scaricare o mandare qualcosa, perché questo strumento non ha proprio nessuna funzione di rete. E anche se ci fosse una via d'uscita, dall'altra parte di questa pagina non c'è nessun server a cui mandare un video.

- ✗ Niente caricamenti
- ✗ Nessun account
- ✗ Nessuna filigrana
- ✓ Inverte anche l'audio
- ✓ Funziona offline

## Come invertire un video

1. **Scegli un video.** Trascina un MP4, MOV, M4V o WebM sul selettore, oppure cercalo a mano. Il browser lo legge direttamente dal tuo disco, e nel frattempo non esce niente da nessuna parte.
2. **Decidi cosa fare con l'audio.** «Inverti anche l'audio» gira la traccia campione per campione, ed è questo che fa uscire il parlato come parlato riprodotto al contrario invece che come silenzio. Toglilo per un video muto, che è anche più veloce.
3. **Decidi quanta qualità spendere.** L'immagine va ricodificata, perché i fotogrammi escono in un ordine per cui nel file non era codificato niente. «Bilanciato» resta vicino a quello che spendeva l'originale, «Massima qualità» spende di più.
4. **Inverti e scarica.** Il lavoro succede sul tuo hardware, quindi quanto ci mette dipende dal tuo dispositivo e non da una coda. Il video finito va dritto nei download del tuo browser.

## La versione lunga

[Come invertire un video](https://abox.tools/it/guide/invertire-un-video/): Far scorrere un video al contrario: cosa fa l'inversione all'immagine e all'audio, perché non si può fare senza ricodificare, perché è più lenta del taglio, e cosa conviene fare prima.

## Anche nella cassetta

- [Creatore di timelapse](https://abox.tools/it/creare-timelapse/): Un'ora di girato in venti secondi.
- [Estrattore di fotogrammi](https://abox.tools/it/estrarre-fotogramma-video/): Un fermo immagine a piena qualità, da qualsiasi punto.
- [Da video a GIF](https://abox.tools/it/video-in-gif/): Scegli il pezzo, la dimensione e la frequenza dei fotogrammi.
- [Creatore di GIF](https://abox.tools/it/creare-gif/): Trasforma una serie di immagini in una sola animazione.

## Domande

### Il mio video viene caricato da qualche parte?

No. Lo legge, lo decodifica, lo inverte e lo codifica il tuo browser sul tuo hardware. Questo strumento non ha un lato server, e la `Content-Security-Policy` della pagina elenca ogni indirizzo che può contattare: nessuno appartiene a questo sito. Se preferisci controllare invece che fidarti, stacca la connessione e inverti un video lo stesso.

### Quali formati video posso invertire?

MP4, M4V e MOV vengono letti direttamente, qualunque cosa ci sia dentro: H.264, HEVC, AV1 o VP9, purché il tuo browser sappia decodificare quel codec. Tutto il resto che il tuo browser sa riprodurre, WebM su tutti, viene invertito facendo tornare indietro il lettore del browser un passo alla volta: funziona, ma è più lento. Un file che il browser non sa né leggere né riprodurre, che in pratica vuol dire AVI, WMV, FLV e quasi tutti gli MKV, viene rifiutato con un messaggio che lo dice invece di fallire a metà strada. Quello che esce è sempre un MP4.

### Viene invertito anche l'audio?

Sì, a meno che tu non lo tolga. L'intera traccia viene decodificata, i campioni vengono messi nell'ordine inverso e poi si ricodifica in AAC. Quella seconda codifica non si può evitare: un pacchetto audio è qualche decina di millisecondi di suono codificati rispetto al pacchetto precedente, quindi scrivere i pacchetti al contrario farebbe sentire pezzetti riprodotti in avanti nell'ordine sbagliato, e suona come un guasto, non come un'inversione.

### Invertire fa perdere qualità?

L'immagine viene codificata una seconda volta, e questo costa un pochino. Qui non si può evitare come si evita tagliando: un video invertito mostra i suoi fotogrammi in un ordine per cui nel file originale non era codificato niente, quindi ogni fotogramma va riscritto. Quello che lo strumento non fa è spendere più dell'originale, perché codificare oltre quel punto ingrossa il file senza migliorarne l'aspetto.

### C'è un limite alla dimensione o alla durata del video?

Nello strumento non c'è nessun limite, e il file non viene letto tutto in memoria in una volta: viene percorso un gruppo di fotogrammi alla volta, all'indietro. I tetti veri sono il video finito, che viene assemblato in memoria prima che tu lo scarichi, e l'audio, che va tenuto intero perché per invertirlo serve l'ultimo campione prima di poter scrivere il primo.

### Perché con certi file è più lento?

Perché le vie d'ingresso sono due. Un MP4 o un MOV lo legge direttamente questo strumento e lo decodifica un gruppo di fotogrammi alla volta, e va veloce quanto va il tuo dispositivo. Tutto il resto viene invertito chiedendo al lettore del browser un istante del video dopo l'altro, e ognuno di quei salti costringe il browser a decodificare dal fotogramma chiave precedente. La pagina dice quale delle due sta usando, e perché, prima che tu cominci.

### Posso invertire solo una parte del video?

Qui no. Questo strumento inverte tutto: il video che esce dura esattamente quanto quello che è entrato, con l'ultimo fotogramma per primo. Taglia prima la parte che ti serve con il [Taglierino per video](https://abox.tools/it/tagliare-video/), che lo fa senza ricodificare un fotogramma, e poi inverti quello che ne viene fuori.

### È gratis, e mi serve un account?

È gratis, e non c'è account, non c'è registrazione, non c'è periodo di prova e non c'è filigrana. Il sito ha della pubblicità, ed è quella che lo mantiene; agli annunci non arriva niente sul tuo video.

## Come si verifica quello che promette

- **I tuoi video non hanno una strada per uscire.** Nella Content-Security-Policy c'è ogni indirizzo che questa pagina può contattare, e non ne appartiene uno a questo sito. Qui non esiste un recapito dove il tuo file possa essere raccolto, e nel codice non c'è niente che lo manderebbe lì se esistesse.
- **Qui niente va a prendere niente.** Questo strumento non ha proprio nessuna funzione di rete: non c'è un indirizzo da incollare, non c'è niente da scaricare, non c'è un motore che arrivi al primo utilizzo. Ogni byte che tocca il tuo video è arrivato da questa origine quando la pagina si è caricata.
- **Decodifica e codifica sono locali.** I fotogrammi passano da WebCodecs nel tuo browser, oppure dallo stesso motore di riproduzione che ti mostrerebbe il video comunque. Il file finito viene costruito nella memoria di questo dispositivo e consegnato direttamente a un download.
- **Anche l'audio viene girato qui.** Invertire una traccia vuol dire decodificarla, e quella decodifica è quella del browser, che gira su questo dispositivo. Niente la ascolta, niente la conserva e niente potrebbe passarla altrove: qui non c'è un percorso nel codice che spedisca un byte.
- **Cosa carica Google, e cosa non gli arriva.** Gli script della pubblicità e della misurazione arrivano da Google. A nessuno dei due viene passato niente sul tuo video: né il file, né un fotogramma, né un nome, una dimensione o una durata. Ogni riga che legge, decodifica, inverte o codifica è servita da questa origine ed è elencata nel repository.
- **Cosa carica il pulsante delle donazioni, e cosa non gli arriva.** Il pulsante «Buy me a coffee» in alto è disegnato da uno script di cdnjs.buymeacoffee.com e prende i caratteri da Google Fonts. Non è niente di più di un collegamento: non segnala nessuna visita e non gli viene passato niente su di te o sul tuo video.
- **Funziona offline.** Stacca la rete e tutto quello che c'è su questa pagina continua a funzionare. È la prova più semplice che ci sia.

**Verifica tu stesso.** Niente di quanto sopra va preso per buono. Questa pagina la genera, dai modelli e dalla configurazione del repository, uno script di build che puoi leggere ed eseguire anche tu, e il risultato finisce sul branch `dist`: puoi quindi confrontare quello che viene servito con quello che produce una build dei sorgenti. https://github.com/A-Box-of-Tools/website

I file da leggere per primi sono `config/site.toml` per la Content-Security-Policy, `src/timeline.js` per i conti che decidono quale fotogramma esce e quando, e `src/reverse.js` per il ciclo che percorre il file all'indietro, un gruppo di fotogrammi alla volta. Nessuno di loro importa qualcosa in grado di fare una richiesta.
