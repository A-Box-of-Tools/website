# Come ritagliare un video in una forma diversa

Ritagliare cambia la forma dell'immagine, e questo vuol dire scrivere fotogrammi nuovi: non c'è modo di aggirarlo, e qualunque strumento dica il contrario sta facendo un'altra cosa. Vediamo quanto costa e come spenderlo bene.

[Apri Ritagliatore di video](https://abox.tools/it/ritagliare-video/): Riduci una clip alla parte che conta.

Ultimo aggiornamento 26 agosto 2026

## La risposta corta

Apri il [ritagliatore di video](https://abox.tools/it/ritagliare-video/), trascinaci dentro la clip, trascina il riquadro sulla parte che vuoi tenere, oppure bloccalo su una forma se te ne hanno data una, ed esporta. La clip che esce è lunga esattamente come quella che è entrata, con i suoi tempi e il suo audio intatti.

A differenza del tagliare, questo lavoro deve scrivere fotogrammi nuovi. Non è la mancanza di un particolare strumento, è il ritaglio in sé. Il resto di questa pagina riguarda quanto costa e come tenerlo basso.

## Perché ritagliare non può evitare una ricodifica

Un taglio tiene fotogrammi interi, quindi un buon tagliavideo li sposta dall'altra parte intatti e non decodifica proprio niente. Un ritaglio tiene invece una parte di ogni fotogramma, e una parte di fotogramma è un'immagine diversa. Non c'è modo di conservare un'immagine diversa senza riscrivere i pixel da capo.

Un'eccezione stretta c'è, e vale la pena conoscerla per riconoscere quando qualcuno la sta rivendicando. Il video è codificato a blocchi, e se un ritaglio cadesse esattamente sui confini dei blocchi su tutti e quattro i lati, in linea di principio una parte dei dati si potrebbe riusare. In pratica le dimensioni stesse del fotogramma, i vettori di movimento e la predizione vanno riscritti comunque, quindi non c'è niente di reale costruito così. Dai per scontato che un ritaglio voglia dire una ricodifica.

Quello che un ritagliatore ben educato farà è non spendere *più* di quanto spendesse l'originale sulla stessa zona. Codificare una zona ritagliata a un bitrate più alto della sorgente rende il file solo più pesante, e non può rimettere dentro dettaglio che l'originale non aveva.

![La scheda di esportazione: un menu di formato, un cursore di qualità, un interruttore per l'audio e un riepilogo con dimensione in uscita, quanta inquadratura resta e durata.](https://abox.tools/screens/crop-a-video/export.webp)

Questa scheda esiste perché l'immagine va ricodificata. Il riepilogo è lo strumento che dice quanto costerà prima di farlo.

## Le forme che ti stanno davvero chiedendo

Quasi tutti i ritagli si fanno perché da qualche parte c'è una proporzione obbligatoria. L'elenco corto è questo:

- **9:16, verticale.** Storie, reel, short, TikTok. A schermo pieno su un telefono tenuto normalmente. È il motivo più comune per cui qualcuno ritaglia un video.
- **1:1, quadrato.** I post nei feed di parecchie piattaforme. Funziona da qualunque verso chi guarda tenga il telefono, ed è per questo che resiste.
- **4:5, leggermente verticale.** La forma più grande che certi feed consentono, quindi prende più schermo di un quadrato senza essere un video verticale pieno.
- **16:9, orizzontale.** Lo standard del video in generale. Di solito ritagli *verso* questa forma solo per togliere le bande nere, oppure *da* questa forma per ottenere una delle precedenti.

Blocca il riquadro sulla proporzione invece di trascinarlo a occhio, perché sbagliare di qualche pixel vuol dire che la piattaforma ritaglia il tuo ritaglio, e su dove farlo non ti consulterà.

![La scheda di ritaglio: un fotogramma del video con un riquadro quadrato al centro e campi numerici con sinistra, alto, larghezza e altezza.](https://abox.tools/screens/crop-a-video/box.webp)

Il riquadro si trascina o si scrive, e i numeri dicono esattamente cosa resta. Un quadrato ricavato da una clip panoramica è la richiesta più comune.

## Rendere verticale una clip orizzontale

È il caso comune più difficile, e conviene dirlo chiaramente: ritagliare è un compromesso, non una soluzione.

Un video 16:9 ritagliato a 9:16 tiene circa il 32% della larghezza dell'immagine. Tutto quello che sta ai lati sparisce, e in uno scatto orizzontale ai lati di solito c'è il contesto. Se due persone parlano ai due estremi dell'inquadratura, non c'è un solo ritaglio che le tenga entrambe.

Scegli il ritaglio guardando la clip una volta e chiedendoti dove sta davvero il soggetto per la maggior parte del tempo. Se la risposta è «si muove», un ritaglio fisso è lo strumento sbagliato e quello che ti serve è un programma di montaggio che sappia spostare il ritaglio nel tempo. Se la risposta è «al centro, quasi sempre», un ritaglio centrato va benissimo e richiede dieci secondi.

C'è poi un'alternativa da ricordare: molte piattaforme accettano un video orizzontale e ci mettono loro le bande. Il ritaglio serve per quando vuoi lo schermo pieno, non per quando vuoi che il video venga accettato.

## Perché larghezza e altezza si muovono di due in due

Se noti che il riquadro di ritaglio rifiuta i numeri dispari, a fare il difficile è il codec e non l'interfaccia.

L'H.264, il codec dentro un MP4, conserva il colore a metà risoluzione in orizzontale e in verticale, perché l'occhio è molto meno sensibile al dettaglio di colore che a quello di luminosità. Questo vuol dire che l'immagine viene gestita a unità di due pixel, e non c'è modo di descrivere un fotogramma con un numero dispari di pixel su un lato.

Gli strumenti se la cavano in due modi: arrotondando il tuo ritaglio dopo che l'hai impostato, cosa che sposta il riquadro di un pixel senza dirtelo, oppure proponendo fin dall'inizio solo numeri pari. Qui succede la seconda.

## Cosa succede al suono

Con un MP4, niente. Ritagliare cambia l'immagine e non ha nessun motivo di toccare l'audio, quindi l'audio viene copiato dall'altra parte campione per campione senza essere mai decodificato: byte per byte quello che c'era nel file.

Quando invece si passa per la registrazione, descritta qui sotto, il suono viene catturato dalla riproduzione e ricodificato, e questo costa un po' di qualità. In tutti e due i casi c'è una casella per lasciarlo fuori del tutto, che vale la pena usare quando la clip va in un posto che la riproduce muta comunque e tu vuoi il file più leggero.

## I formati, e quanto ci mette

**MP4, M4V e MOV** vengono letti direttamente, qualunque cosa ci sia dentro, che sia H.264, HEVC, AV1 o VP9, purché il tuo browser sappia decodificare quel codec. A differenza del tagliare, il ritagliare deve decodificare, quindi qui il codec conta in un modo in cui là non conta.

**Tutto il resto che il tuo browser sa riprodurre**, il WebM in primis, viene ritagliato riproducendolo e registrando il risultato, cosa che funziona e richiede tanto tempo quanto è lunga la clip.

**AVI, WMV, FLV e quasi tutti gli MKV** il browser non li sa né leggere né riprodurre, e lo strumento li rifiuta con un messaggio invece di piantarsi a metà strada.

Su una clip lunga aspettati che un ritaglio richieda tempo vero, perché ogni fotogramma viene decodificato e ricodificato. Nello strumento non c'è nessun limite, e il file viene percorso qualche megabyte alla volta invece di essere caricato tutto insieme; il tetto pratico è il video finito, che viene assemblato in memoria prima che tu lo scarichi.

## Ritaglia prima di fare qualunque altra cosa

Se una clip ha bisogno sia di essere accorciata sia di essere ritagliata, accorciala per prima: è gratis, e ogni secondo che tagli è un secondo che nessuno deve ricodificare. Poi ritaglia una volta sola la clip più corta.

Farlo al contrario vuol dire ritagliare riprese che stai per buttare, cosa che costa tempo e qualità per niente. Il [tagliavideo](https://abox.tools/it/tagliare-video/) è qui accanto, e [la sua guida](https://abox.tools/it/guide/tagliare-un-video/) spiega perché quel passaggio non deve costarti proprio niente.

Più in generale, ogni passaggio con perdita si somma. Un ritaglio di un originale è una generazione. Un ritaglio di un taglio di un'esportazione di uno scaricamento sono quattro, e si vede.

## Perché questo non ha bisogno di un caricamento

Decodificare e ricodificare video in un browser è una cosa recente ed è una cosa vera: WebCodecs espone lo stesso encoder hardware che il tuo telefono usa per registrare video, ed è veloce per lo stesso motivo. Il lavoro avviene sul dispositivo che il file ce l'ha già, il che per un video da parecchi gigabyte è anche l'unica disposizione che abbia senso, visto che caricarlo e riscaricare il risultato costa più tempo della codifica.

Lo strumento di qui non ha nessuna funzione di rete, e la `Content-Security-Policy` della pagina elenca tutti gli indirizzi che può contattare, nessuno dei quali appartiene a questo sito. Se preferisci verificare invece che crederci, stacca la connessione e ritaglia una clip lo stesso.

[È sicuro caricare i propri file sui convertitori online?](https://abox.tools/it/guide/e-sicuro-caricare-i-propri-file/) propone altre tre verifiche che puoi fare su qualunque strumento.
