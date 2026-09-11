# Come invertire un video

Far scorrere un video al contrario sembra il montaggio più semplice che ci sia, ed è quello per cui un file video è fatto peggio. Ecco cosa deve succedere davvero, quanto costa, e l'unico passo che vale la pena fare prima.

[Apri Invertitore di video](https://abox.tools/it/invertire-video/): L'ultimo fotogramma per primo, audio compreso.

Ultimo aggiornamento 26 agosto 2026

## La risposta breve

Apri l'[Invertitore di video](https://abox.tools/it/invertire-video/), trascinaci dentro il video, decidi se vuoi anche l'audio invertito, ed esporta. Quello che esce è lo stesso video con l'ultimo fotogramma per primo, lungo esattamente quanto quello che è entrato.

A differenza del taglio, qui bisogna riscrivere ogni fotogramma, e anche l'audio. Non è il limite di un particolare strumento: è cosa vuol dire invertire. Il resto di questa pagina spiega perché, e cosa significa per il tempo che passerai ad aspettare.

## Perché un video non si può semplicemente riprodurre al contrario

Un file video non è una pila di fotografie. Circa un fotogramma ogni cinquanta è un'immagine intera — un *fotogramma chiave* — e tutto quello che sta in mezzo è una descrizione di cosa è cambiato rispetto ai fotogrammi attorno. È per questo che un'ora di video sta in un telefono.

Vuol dire anche che un decodificatore sa andare solo in avanti. Per mostrarti l'ultimo fotogramma di un video deve trovare il fotogramma chiave prima di quello e decodificare tutto ciò che c'è in mezzo. Chiedigli il penultimo e rifà lo stesso lavoro daccapo.

L'inversione si fa quindi un gruppo alla volta: decodificare un gruppo in avanti, tenere i fotogrammi, passarli al codificatore nell'ordine inverso, spostarsi al gruppo precedente. L'alternativa ovvia — decodificare tutto il video in un elenco e percorrere l'elenco all'indietro — richiede circa 3 MB di memoria per fotogramma in 1080p, cioè 5 GB al minuto, ed è per questo che gli strumenti fatti così crollano su qualunque cosa duri più di qualche secondo.

![La scheda della sorgente: il nome della clip, la sua dimensione, la dimensione del fotogramma, la durata e il codec.](https://abox.tools/screens/reverse-a-video/source.webp)

Quello che lo strumento ha ricavato dal file. Invertire è l'unica operazione che non si può fare al volo, quindi sono questi numeri a decidere se ci sta in memoria.

## Cosa succede all'audio

È qui che gli strumenti per invertire differiscono di più, ed è qui che vale la pena controllare cosa hai ottenuto davvero.

L'audio viene compresso in pacchetti di qualche decina di millisecondi, ciascuno codificato rispetto al precedente. Scrivere quei pacchetti al contrario *non* riproduce una traccia all'indietro: riproduce pezzetti in avanti nell'ordine sbagliato, e suona come un balbettio o un guasto, non come un'inversione. L'unico modo di invertire l'audio per bene è decodificare tutta la traccia, mettere i campioni nell'ordine inverso e ricodificarla.

È quello che succede qui, ed è il motivo per cui l'audio viene ricodificato mentre il [Taglierino per video](https://abox.tools/it/tagliare-video/) e il [Ritagliatore di video](https://abox.tools/it/ritagliare-video/) non lo toccano mai: quei lavori non cambiano *quando* succedono le cose, e questo non cambia nient'altro.

Se vuoi l'immagine al contrario e nessun audio — che è la scelta solita per tutto quello che finisce in un feed che parte muto — togli la spunta. È più veloce, e il file è più piccolo.

![La scheda di esportazione: un cursore di qualità, un interruttore per l'audio e un riepilogo con dimensione in uscita, durata e numero di fotogrammi.](https://abox.tools/screens/reverse-a-video/export.webp)

L'interruttore dell'audio sta qui perché una voce al contrario non è quasi mai quello che si voleva, ed è più facile deciderlo prima dell'esportazione che dopo.

## Cosa costa all'immagine

Una ricodifica. I fotogrammi escono in un ordine per cui niente nel file originale era stato codificato, quindi ognuno va riscritto da capo.

Quello che uno strumento fatto bene non farà è spendere *più* dell'originale. Un video invertito contiene esattamente le stesse immagini di quello che è arrivato, quindi un bitrate più alto non ha niente di nuovo da descrivere: ingrossa il file senza migliorarne l'aspetto. Qui l'impostazione della qualità si muove sotto quel tetto, non sopra.

Come sempre, i passaggi con perdita si sommano. Invertire un originale è una generazione. Invertire l'esportazione di un download di una registrazione dello schermo sono quattro, e si vede.

## Prima taglia, poi inverti

Se il video ha bisogno di entrambe le cose, taglialo prima. Tagliare è gratis — un buon taglierino sposta fotogrammi interi senza decodificarli — e ogni secondo che togli è un secondo che nessuno dovrà decodificare e ricodificare.

Farlo al contrario vuol dire invertire materiale che stai per buttare via. Su un video lungo è la differenza tra un lavoro di pochi secondi e uno di parecchi minuti. La [guida al taglio](https://abox.tools/it/guide/tagliare-un-video/) spiega perché quel primo passo può non costarti niente in qualità.

Lo stesso ordine vale per il ritaglio: taglia, ritaglia, inverti, e paghi una sola ricodifica del video più corto possibile.

## A cosa serve davvero

- **La gag del riavvolgimento.** Qualcosa cade, si rompe o schizza, e l'inversione lo rimette a posto. Si legge come una battuta perché un girato vero riprodotto al contrario è inconfondibile: il fumo si raccoglie, l'acqua risale.
- **Boomerang fatti a mano.** Inverti un video breve e attaccalo all'originale con il [Taglierino per video](https://abox.tools/it/tagliare-video/): ottieni il ciclo avanti-e-indietro senza l'app che di solito lo fa, e della durata che vuoi tu invece che della sua.
- **Le rivelazioni.** Riprendi lo stato finale già in ordine e invertilo, così un piatto finito torna a essere ingredienti o un oggetto montato si smonta. È più facile da girare della versione in avanti, ed è proprio quello il punto.
- **Il parlato al contrario.** Che è interessante solo se l'audio è davvero invertito — vedi sopra.

## Formati, e quanto ci mette

**MP4, M4V e MOV** vengono letti direttamente, qualunque cosa ci sia dentro — H.264, HEVC, AV1 o VP9 — purché il tuo browser sappia decodificare quel codec. È la via veloce: il file viene percorso all'indietro un gruppo di fotogrammi alla volta, alla velocità del tuo dispositivo.

**Tutto il resto che il tuo browser sa riprodurre**, WebM su tutti, viene invertito facendo tornare indietro il lettore del browser dentro il video, un istante alla volta. Funziona, ed è più lento, perché ognuno di quei passi costringe il browser a decodificare dal fotogramma chiave precedente. La pagina dice quale delle due vie sta usando, e perché, prima che tu cominci.

**AVI, WMV, FLV e quasi tutti gli MKV** il browser non sa né leggerli né riprodurli, e lo strumento li rifiuta con un messaggio invece di fallire a metà strada.

In ogni caso questo è uno dei lavori più lenti del sito, perché ogni fotogramma viene decodificato e codificato e alcuni vengono decodificati più di una volta. Un video breve sono secondi; uno lungo in 4K è di quelli che si avviano e si lasciano in pace.

## Perché questo non ha bisogno di un caricamento

Decodificare e ricodificare video in un browser è una cosa recente ed è reale: WebCodecs espone lo stesso codificatore hardware che il tuo telefono usa per registrare, ed è veloce per lo stesso motivo. Il lavoro succede sulla macchina che il file ce l'ha già, che per un video grosso è anche l'unica sistemazione sensata: caricarlo e riscaricare il risultato costa più tempo della codifica.

Lo strumento qui non ha nessuna funzione di rete, e la `Content-Security-Policy` della pagina elenca ogni indirizzo che può contattare, e nessuno appartiene a questo sito. Stacca la connessione e inverti un video lo stesso, se preferisci controllare invece che fidarti.

[È sicuro caricare i propri file sui convertitori online?](https://abox.tools/it/guide/e-sicuro-caricare-i-propri-file/) propone altre tre verifiche da fare su qualunque strumento.
