# Come condividere testo e file tra dispositivi senza caricarli

I modi soliti di portare una nota o un file su un'altra macchina lasciano tutti una copia dietro di sé: nella posta inviata, in una cronologia di chat, o sul server di un sito di condivisione, dietro un bottone di eliminazione a cui bisogna credere sulla parola. C'è un modo che non lascia niente da nessuna parte, perché niente viene mai salvato - ed è anche l'unico con un nome che si può gridare da un capo all'altro di una stanza.

[Apri Condividere testo e file](https://abox.tools/it/condividere-testo/): La condivisione vive in questa scheda aperta. I lettori la ricevono cifrata, direttamente dal tuo browser, e chiudere la scheda la fa finire: nessun server conserva nulla.

Ultimo aggiornamento 27 agosto 2026

## La risposta breve

Apri [Condividere testo e file](https://abox.tools/it/condividere-testo/) sulla macchina che ha la cosa, scrivi o allega, e premi *Inizia a condividere*. La pagina dà alla condivisione un nome come `brave-otter-42`; sull'altro dispositivo apri la stessa pagina e aggiungi `#brave-otter-42` in fondo all'indirizzo — o segui semplicemente il link copiato. L'altro dispositivo chiede prima di connettersi, tu lo fai entrare, e il testo o il file attraversa cifrato, diretto da un browser all'altro. Chiudi la scheda che condivide ed è finita, ovunque.

In nessun momento è stato caricato nulla. Non è una regola scritta: è la forma dell'oggetto. Il resto di questa pagina spiega perché conta, e quali sono i suoi limiti onesti.

![La prima scheda dello strumento di condivisione: una casella di testo con qualche riga di appunti di riunione, e sopra un interruttore Markdown e un pulsante per allegare un file.](https://abox.tools/screens/share-text-between-devices/write.webp)

Quello che viene consegnato. Nella stessa casella ci sta una lista della spesa o un documento, e Markdown è un interruttore e non una modalità a parte.

## Dove le strade solite lasciano una copia

Mandati una nota per email e ora esiste in una cartella di posta inviata e in una casella di arrivo, entrambe sincronizzate, entrambe salvate nei backup, entrambe cercabili fra anni. Incolla una password in un'app di messaggi e resta nella cronologia di quella conversazione — e nel backup su cloud dell'app — finché la conversazione esiste. Usa un pastebin o un sito per depositare file e il contenuto sta sul loro server, dietro un'impostazione di scadenza e un bottone di eliminazione di cui puoi verificare solo il colore. Ognuna di queste strade è un servizio di archiviazione con la condivisione come funzione.

A volte è proprio quello che vuoi: una copia che aspetta finché l'altra persona è pronta. Ma la maggior parte delle condivisioni al volo è il contrario: l'altro dispositivo è lì accanto, il contenuto è momentaneo, e ogni copia salvata è puro peso. La password del Wi-Fi per un ospite, un indirizzo letto al telefono, un messaggio d'errore che ha bisogno di un secondo paio d'occhi, un pezzo di configurazione in viaggio verso la macchina a cui appartiene. Niente di tutto questo vuole un archivio.

## Cosa significa davvero «diretto»

Lo strumento usa WebRTC, la stessa macchina delle videochiamate nel browser: due browser aprono un canale cifrato tra loro e ci fanno passare i dati, senza server sul percorso. Sulla stessa rete i byte viaggiano solo per la rete locale: due portatili sullo stesso Wi-Fi si passano il file attraverso la stanza, non attraverso Internet.

Un asterisco onesto, scritto anche sulla pagina dello strumento: due browser non possono trovarsi da soli. Un piccolo server — il mediatore — mette insieme chi ha digitato il nome e chi condivide sotto quel nome, e porta qualche kilobyte di impostazione della connessione tra i due. Non salva nulla, e il contenuto non gli passa mai attraverso; il suo codice completo è pubblicato accanto a quello dello strumento. È la presentazione, non la conversazione — ed è l'unico server con cui qualcosa parla su questo sito, motivo per cui la pagina dello strumento elenca con precisione cosa può vedere e cosa no.

Diretto significa anche reciproco: ogni browser scopre l'indirizzo di rete dell'altro, come in una telefonata. Il lato che legge lo sa prima che esista qualsiasi connessione, e si connette solo se lo decide.

## Il nome è l'indirizzo, e l'unico segreto

Un link di condivisione si distingue da ogni altro per una cosa molto pratica: sopravvive alla voce. `brave-otter-42` si può gridare da un capo all'altro di una stanza, leggere al telefono o copiare da una lavagna, e ridigitare dall'altra parte senza che a nessuno cedano i pollici. È esattamente per questo che i nomi hanno quell'aspetto.

E taglia in entrambe le direzioni: chiunque conosca o indovini un nome vivo può aprire la condivisione che c'è dietro. Per il delicato, dai alla condivisione un nome che nessuno indovinerebbe, o appoggiati all'impostazione predefinita: le condivisioni sono *private* finché non togli la spunta, il che significa che ogni lettore che arriva deve presentarsi e tu decidi, messaggio per messaggio, chi entra. La presentazione viaggia sul canale diretto cifrato: nemmeno il mediatore sa chi ha bussato.

![La seconda scheda: un nome di collegamento che dice thursday-notes, una nota che spiega che il nome è l'indirizzo e l'unico segreto, e interruttori per privato e per uso singolo.](https://abox.tools/screens/share-text-between-devices/name.webp)

Il nome è tutto l'indirizzo. Privato vuol dire che ogni lettore deve chiedere e sei tu a farlo entrare; uso singolo vuol dire che la bozza non resta nemmeno su questo dispositivo.

## Cosa finisce davvero chiudendo la scheda

La condivisione vive nella scheda che condivide e da nessun'altra parte: chiudere quella scheda è la cancellazione — non una richiesta di cancellazione. Il link muore in un paio di secondi, e i lettori che stanno ancora guardando vedono la loro pagina svuotarsi. Non c'è una copia sul server con il suo ciclo di vita, non c'è cestino, non c'è conservazione di trenta giorni. La bozza che hai scritto resta nel tuo browser per la prossima volta, e perfino quello si spegne con l'impostazione usa e getta.

Quello che non finisce è il possesso. Un lettore che ha copiato il testo o scaricato il file mentre la condivisione era aperta, ce l'ha: esattamente come se gliel'avessi consegnato in qualsiasi altro modo. Nessuno strumento può disfare un invio, e uno che lo affermasse ti starebbe mentendo sul computer di qualcun altro. Terminare governa il futuro — nessuno di nuovo, niente di più — ed è la parte che un servizio con copia salvata non può darti.

## Il colloquio online è il caso ideale

Uno strumento di passaggio di mano vuole entrambe le estremità presenti, e il colloquio è l'unico appuntamento in cui la presenza è garantita: vi state già guardando. È anche il momento in cui le vie a copia conservata costano di più. Ciò che attraversa la chat della riunione finisce nella trascrizione della piattaforma, legata alla registrazione e a chiunque la riceva dopo; e aprire la posta o un'app di messaggi per recuperare un link mentre lo schermo è condiviso mette la tua corrispondenza sulla registrazione di qualcun altro. La pagina di condivisione mostra la cosa condivisa e nient'altro.

In pratica: il link del portfolio, il repository, il PDF della prova, il pezzo di codice che non sopravvivrebbe alle virgolette tipografiche della chat — avvia la condivisione prima della chiamata e, al momento giusto, di' il nome ad alta voce. `brave-otter-42` attraversa intatto una chiamata vocale, che è esattamente la forma per cui i nomi sono fatti, e l'altra parte ha il file prima che la frase finisca. Lasciata privata, la condivisione rende anche l'ingresso dell'esaminatore qualcosa che approvi in piena chiamata, non una porta lasciata aperta; e quando la chiamata finisce, chiudere la scheda chiude con lei la condivisione — niente resta in una trascrizione ad aspettare di essere riletto fuori contesto.

Una preparazione onesta: gli esaminatori stanno su reti aziendali strette più spesso della maggior parte dei lettori, ed è lì che vive la rara coppia senza percorso diretto. La loro rete non si prova da casa — ma lo strumento annuncia il fallimento entro venti secondi invece di restare appeso, così il ripiego ti costa qualche istante, non il colloquio.

## Quando questo è lo strumento sbagliato

Entrambi i capi devono essere presenti: questa è una consegna a mano, non una cassetta delle lettere. Se l'altra persona dorme, usa qualcosa che salva — sapendolo. La scheda che condivide deve restare aperta e sveglia, il che in pratica significa che condivide un computer fisso o un portatile; i telefoni sospendono le schede in background in pochi secondi, ma leggono una condivisione benissimo. Non può funzionare offline, unico su questo sito, perché raggiungere un'altra macchina è un atto di rete — la metà editor però funziona senza nessuna connessione. E una piccola minoranza di coppie di reti — tipicamente un capo sulla rete a indirizzi condivisi di un operatore mobile o dietro una rete aziendale severa — non si può unire direttamente; lo strumento lo dice chiaro dopo venti secondi e offre al lettore un ripetitore cifrato che inoltra i byte senza poterli leggere, invece di passarci di nascosto.

Per tutto il resto — la nota, la password, il file di configurazione, il video da 100 MB a un salto di Wi-Fi — la versione diretta è più veloce, più semplice, e lascia il mondo esattamente come l'ha trovato.
