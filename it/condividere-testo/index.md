# Condividere testo e file — dal tuo browser al loro, senza caricare niente

La condivisione vive in questa scheda aperta. I lettori la ricevono cifrata, direttamente dal tuo browser, e chiudere la scheda la fa finire: nessun server conserva nulla.

> Manda testo o file da un browser all'altro su una connessione diretta e cifrata. Un nome di link pronunciabile, aggiornamento in tempo reale mentre scrivi, approvazione lettore per lettore - e mai niente su nessun server. Gratis, senza registrazione.

Questa pagina è uno strumento interattivo che funziona interamente nel tuo browser, all'indirizzo https://abox.tools/it/condividere-testo/ — nulla di ciò che gli affidi viene caricato. Quanto segue è tutto ciò che la pagina dice dello strumento a parole; per usarlo, apri l'indirizzo.

## Qui non si caricano testi e file condivisi, **mai**. Non c'è nessun server.

Quello che condividi qui viaggia dal tuo browser a quello di ogni lettore su un canale WebRTC cifrato da estremo a estremo, e in nessun altro posto. L'unico server coinvolto — nominato nella `Content-Security-Policy` di questa pagina, codice nel repository — presenta i due browser l'uno all'altro e poi si fa da parte: non salva nulla, e il contenuto non gli passa mai attraverso. Non c'è cronologia né account. Chiudi questa scheda e la condivisione finisce ovunque insieme, anche sulle pagine aperte dei lettori.

- ✗ Niente salvato
- ✗ Nessun account
- ✓ Cifrato da estremo a estremo
- ✓ Finisce con la tua scheda
- ✓ Open source

## Come condividere testo e file senza caricarli da nessuna parte

1. **Scrivi il testo, o allega i file.** L'editor è la condivisione: quello che contiene quando un lettore si connette è quello che riceve, e ogni modifica successiva raggiunge i lettori connessi in tempo reale, mentre scrivi. I file viaggiano sullo stesso canale, fino a 200 MB l'uno; i lettori vedono l'elenco e scaricano solo ciò che chiedono, così nessuno spende banda per un file che non voleva.
2. **Attiva Markdown se il testo merita una formattazione.** Un solo interruttore. Titoli, grassetti, elenchi, codice e link si renderizzano in tempo reale accanto all'editor mentre scrivi, e i lettori ricevono la vista formattata di default, con un commutatore per tornare al sorgente. Il renderer viaggia con questa pagina e fa l'escape di tutto: il testo condiviso non può diventare script sulla macchina di un lettore, chiunque l'abbia scritto.
3. **Dai un nome al link, o tieni il suggerimento.** Il nome è l'indirizzo: `brave-otter-42` si può gridare da un capo all'altro di una stanza, leggere al telefono o copiare da una lavagna. È anche l'unico segreto: per qualcosa di privato scegli un nome che nessuno indovinerebbe, o affidati all'interruttore privato. Un nome sotto cui qualcun altro sta già condividendo viene rifiutato, e il tuo torna libero appena smetti.
4. **Decidi chi entra.** Privato è l'impostazione predefinita: a ogni lettore viene chiesto di presentarsi — un nome, un indizio, qualsiasi cosa tu possa riconoscere — e tu vedi il messaggio con un bottone per farlo leggere o mandarlo via. La presentazione viaggia sul canale diretto, così nemmeno il mediatore sa chi ha bussato. Togli la spunta per una condivisione aperta, leggibile da chiunque abbia il nome.
5. **Avvia la condivisione, e lascia la scheda aperta.** La scheda è il server: la condivisione è raggiungibile finché resta aperta e sveglia, e non un momento di più. Anche un portatile che si chiude la termina. Copia il link, o di' semplicemente il nome: un lettore può digitarlo come `#nome` in fondo all'indirizzo di questa pagina.
6. **Dall'altra parte: prima il consenso, poi bussare.** Chi apre il link scopre che qualcuno sta condividendo, viene avvisato che una connessione diretta mostra a ciascun lato l'indirizzo di rete dell'altro, e si connette solo se lo decide. In una condivisione privata si presenta e ti aspetta. Quello che riceve si aggiorna in tempo reale mentre scrivi, e sparisce quando chiudi la scheda.

## La versione lunga

[Come condividere testo e file tra dispositivi senza caricarli](https://abox.tools/it/guide/condividere-testo-tra-dispositivi/): Portare testo o file da un browser all'altro su una connessione diretta e cifrata: senza mandarsi email, senza cronologia di chat, senza account, e senza che nessun server tenga una copia.

## Anche nella cassetta

- [Generatore di QR code e codici a barre](https://abox.tools/it/creare-qr-code/): Lo scrivi, e diventa un codice. Per farne uno non parte niente.
- [Lettore di QR code e codici a barre](https://abox.tools/it/leggere-qr-code/): Punta la fotocamera, o trascina qui una foto. Si legge qui, e da nessun'altra parte.
- [Hash e checksum](https://abox.tools/it/verificare-checksum/): Controlla un download contro il numero pubblicato da chi lo distribuisce, senza mandarlo a nessuno.
- [Generatore di password e passphrase](https://abox.tools/it/generatore-password/): Generate qui, dal tuo browser, e non spedite da nessuna parte. Non viene salvato niente e non c'è cronologia.

## Domande

### Viene caricato qualcosa, da qualche parte?

No. Testo e file vanno dal tuo browser a quello di ogni lettore su un canale WebRTC cifrato, direttamente. L'unico server coinvolto porta la presentazione — qualche kilobyte di negoziazione della connessione — e mai il contenuto. Da lui non c'è niente da rubare, sequestrare o perdere: non tiene un byte di tuo, e una stanza smette di esistere appena ti disconnetti.

### E allora perché questo strumento parla con un server, proprio su questo sito?

Perché due browser non possono trovarsi da soli: qualcosa deve mettere insieme chi ha digitato `brave-otter-42` con chi condivide sotto quel nome, e portare l'offerta di connessione tra i due. Quel qualcosa è il mediatore, l'unica dipendenza di rete di questa pagina, nominato nella sua `Content-Security-Policy` e pubblicato nello stesso repository della pagina. È il server più piccolo capace di fare il lavoro: non salva nulla, non legge nulla e si fa da parte appena i due browser hanno un canale diretto.

### Che cosa può vedere esattamente quel server?

Che un nome di link è in uso, quando chi condivide e i lettori si connettono e se ne vanno, i loro indirizzi IP e l'impostazione della connessione cifrata che si scambiano. Non il testo, non i file, non i loro nomi o dimensioni, non chi è stato ammesso a una condivisione privata, e non ciò che qualcuno ha scritto presentandosi: tutto questo viaggia sul canale diretto, cifrato da estremo a estremo, che non passa dal server. Cloudflare, che fa girare il server, tiene un registro di ogni connessione per sette giorni: il nome di link, l'indirizzo e l'ora. Nient'altro sopravvive alla condivisione.

### Cosa succede quando chiudo la scheda?

La condivisione finisce ovunque insieme. Il link smette di funzionare in un paio di secondi, e i lettori che hanno ancora la pagina aperta vedono sparire la propria copia, con una nota che la condivisione è terminata. Non è una richiesta di cancellazione a un server: non c'è nessuna copia sul server da cancellare. La scheda era l'unico posto in cui la condivisione esisteva, e chiuderla è tutta la pulizia che serve.

### Un lettore può tenersi quello che ho condiviso?

Finché la condivisione è aperta, sì: condividere è questo. Un lettore può copiare il testo o scaricare un file, e ciò che ha preso è suo, esattamente come se gliel'avessi dato in qualsiasi altro modo. Quello che terminare garantisce è il futuro: nessuno di nuovo può arrivarci, e le pagine aperte smettono di mostrarlo. Nessuno strumento può disfare un invio già arrivato, e questa pagina non finge il contrario.

### Che cos'è la modalità privata?

L'impostazione predefinita. A ogni lettore che arriva viene detto che la condivisione è privata e viene chiesto di presentarsi; tu vedi il messaggio — «sono Alice, quella dello stand-up» — con i bottoni per farlo leggere o mandarlo via, e non viene inviato nulla finché non decidi. La presentazione viaggia sul canale diretto già cifrato, così il server non sa mai chi ha bussato né cosa hai deciso. Con la spunta tolta prima di condividere, resta una condivisione aperta.

### Perché il lettore vedrà il mio indirizzo IP?

Perché la connessione è davvero diretta, e una connessione diretta corre tra due indirizzi: ogni capo conosce per forza quello dell'altro, come in una telefonata. Il lettore viene avvisato prima che esista qualsiasi connessione e si connette solo se lo decide; fino ad allora tu non sai nemmeno che ha aperto il link. Se quello scambio non va bene per una certa condivisione, l'alternativa è un servizio che passa da un server — con lo scambio opposto.

### Quanto possono essere grandi i file, e quanto è veloce?

Fino a 200 MB per file, di qualsiasi tipo, e veloce quanto la più lenta delle due connessioni: non c'è un server in mezzo a frenare o contare. Due macchine sullo stesso Wi-Fi trasferiscono a velocità di rete locale, e i byte non escono dall'edificio. I lettori scaricano ogni file su richiesta, quindi allegare qualcosa di grosso non costa nulla finché qualcuno non lo vuole davvero.

### Funziona offline?

Onestamente: a metà. L'editor sì — la pagina si carica, la tua bozza è lì, il Markdown si renderizza, e puoi scrivere e salvare senza nessuna rete. Condividere no, e non può: raggiungere il browser di un'altra persona è un atto di rete, e la presentazione ha bisogno del mediatore. È l'unico strumento di questo sito il cui compito è impossibile offline, e lasciar intendere altro sarebbe disonesto.

### E se non riusciamo a connetterci?

La maggior parte delle coppie di browser si raggiunge direttamente una volta presentata; una minoranza no, di solito quando uno dei due lati sta sulla rete a indirizzi condivisi di un operatore mobile o dietro una rete aziendale severa. Questa pagina non passa mai a un ripetitore di nascosto — cambierebbe ciò che questo strumento è senza dirlo —: dopo venti secondi dice chiaramente che una connessione diretta non c'è stata, e ne offre uno al lettore: un ripetitore gestito da Cloudflare che inoltra i byte cifrati tra i due browser e non può leggerli, perché la chiave non lascia mai i due capi. Il lettore lo sceglie esplicitamente, sulla propria pagina, dopo aver saputo cosa vede — entrambi gli indirizzi, come la connessione diretta —, e nemmeno lì viene conservato nulla. Il tuo lato della condivisione non cambia: il tuo browser continua a inviare a quel solo lettore, come farebbe se stesse dietro una VPN.

### Renderizzare Markdown è sicuro, se chiunque può condividere qualsiasi cosa?

Questa domanda è il motivo per cui il renderer sono ottanta righe nel codice di questa pagina e non una libreria. Ogni carattere passa per l'escape prima che venga emesso qualunque tag, può nascere solo un insieme fisso di tag innocui, e i link accettano solo `http`, `https` e `mailto`: un link `javascript:` resta testo inerte. Il testo condiviso non può diventare script sulla tua macchina, chiunque l'abbia scritto, e le ottanta righe puoi leggerle.

### Due persone possono condividere sotto lo stesso nome?

Non contemporaneamente. Una condivisione viva per nome, imposta dal mediatore: chi arriva secondo viene rifiutato e invitato a scegliere un altro nome. Appena una condivisione finisce, il suo nome torna libero — il che significa anche che un link conservato vale quanto la condivisione che ha dietro: lo stesso nome, la settimana prossima, può essere di qualcun altro. Tratta un link come qualcosa che appartiene a un momento, non a una persona.

### È gratis, e serve un account?

Gratis, niente account, niente registrazione, e nessun limite degno di nota: sedici lettori simultanei per condivisione. Il sito porta pubblicità, che è ciò che lo paga; gli annunci non ricevono nulla di ciò che questa pagina condivide, e il mediatore sta comodamente in un piano gratuito proprio perché non salva niente e non fa quasi niente.

## Come si verifica quello che promette

- **Il contenuto va al tuo lettore, e in nessun altro posto.** Testo e file viaggiano su un canale dati WebRTC: una connessione diretta, cifrata con DTLS, tra il tuo browser e quello di ogni lettore. Su quel percorso non c'è nessun server. Sulla stessa rete i byte non escono nemmeno dall'edificio: due portatili sullo stesso Wi-Fi se li passano in locale. L'unica eccezione è un lettore la cui rete non si può raggiungere direttamente e che allora sceglie, sulla propria pagina, un ripetitore cifrato: inoltra lo stesso testo cifrato e non può leggerlo.
- **Che cos'è il mediatore, e tutto quello che vede.** Una connessione diretta ha bisogno di una presentazione, così questa pagina — unica del sito — apre un WebSocket verso un nostro server. Quel server mette insieme chi ha digitato un nome di link con chi condivide sotto quel nome, passa qualche kilobyte di negoziazione e non trattiene nulla: non scrive mai un archivio, e una stanza smette di esistere appena chi condivide si disconnette. Può vedere che un nome è in uso, quando ognuno arriva e se ne va, e gli indirizzi IP. Non può vedere il testo, i file, chi è stato fatto entrare né cosa ha scritto qualcuno: perfino il bussare a una condivisione privata viaggia sul canale diretto cifrato. Il suo codice completo sta nel repository, accanto a quello di questo strumento. Quello che sopravvive a una condivisione è una cosa sola: Cloudflare, che fa girare il server, tiene un registro di ogni connessione per sette giorni, con il nome di link, l'indirizzo e l'ora, mai il contenuto.
- **Niente viene salvato: chiudere la scheda è la cancellazione.** La condivisione esiste solo finché la tua scheda è aperta. Chiudila e i nuovi lettori non trovano più nulla, e chi sta guardando vede sparire la propria copia — anche se ciò che qualcuno aveva copiato o scaricato prima è suo, come qualsiasi cosa gli avessi consegnato a mano. La bozza che scrivi resta nella memoria del tuo browser, così la prossima volta è ancora lì, e solo lì; segnata come usa e getta, non resta da nessuna parte.
- **Il nome del link è l'unico segreto, e la modalità privata il lucchetto.** Chiunque conosca o indovini un nome può aprire la condivisione che c'è dietro. Per questo i suggerimenti sono tre parole a caso, per questo qualsiasi cosa delicata merita un nome non indovinabile — o l'interruttore privato, attivo di default: ogni lettore che arriva deve presentarsi, sul canale diretto, e non viene inviato nulla finché non lo fai entrare tu.
- **Una connessione diretta mostra a ciascun lato l'indirizzo dell'altro.** È questo che significa peer-to-peer, e il lettore lo sa prima che accada: aprire un link di condivisione chiede solo al mediatore se qualcuno sta condividendo; poi la pagina dice chiaramente che connettersi rivela a ciascun lato l'indirizzo IP dell'altro, e aspetta un clic. Fino a quel clic, chi condivide non sa nemmeno che il lettore esiste.
- **Cosa carica Google, e cosa non riceve.** Gli script di pubblicità e misurazione vengono da Google, il bottone per le donazioni da Buy Me a Coffee. Nessuno di loro riceve il testo, i file, i loro nomi o dimensioni, né chi si è connesso. L'eccezione è l'indirizzo stesso di questa pagina: il link di un lettore porta il nome del link, e lo script di pubblicità legge l'indirizzo. Una condivisione che deve restare privata vuole l'interruttore privato. Ogni riga che tocca il contenuto è servita da questa origine e sta nel repository.

**Verifica tu stesso.** Niente di quanto sopra va preso per buono. Questa pagina la genera, dai modelli e dalla configurazione del repository, uno script di build che puoi leggere ed eseguire anche tu, e il risultato finisce sul branch `dist`: puoi quindi confrontare quello che viene servito con quello che produce una build dei sorgenti. https://github.com/A-Box-of-Tools/website

I file da leggere per primi sono `config/site.toml` per la Content-Security-Policy, `src/main.js` per le due metà dello scambio — la scheda di chi condivide e quella del lettore sono lo stesso file — e `src/markdown.js` per il renderer che lavora su testo arrivato dall'altro capo del filo, e che perciò fa l'escape di tutto prima di emettere qualsiasi cosa. Il codice completo del server è `workers/rendezvous/worker.js`, nello stesso repository: una stanza per nome di link, che non tiene altro che le connessioni aperte.
