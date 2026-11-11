# Come fa una pagina web a funzionare senza Wi-Fi?

Perché il browser ne ha tenuto una copia completa, e un piccolo programma consegnato con la pagina serve quella copia ogni volta che la rete non può. Il macchinario è standard e merita di essere capito, perché uno strumento che lavora scollegato ti sta mostrando qualcosa che nessuna informativa sulla privacy può mostrare.

Ultimo aggiornamento 26 agosto 2026

## La risposta breve

Una pagina web di norma vive e muore con la sua connessione, perché ogni visita la va a riprendere. Ma una pagina può portare con sé un piccolo programma chiamato *service worker*, che il browser installa accanto a lei e mette al comando del suo traffico di rete. Alla prima visita, quel worker ripone una copia completa di tutto ciò di cui la pagina è fatta — markup, stili, script — in una cache sulla tua macchina. Da lì in poi, le richieste trovano risposta in quella copia. Quando il Wi-Fi muore, non cambia nulla, perché tanto non si stava riprendendo niente.

In tutto questo non c'è magia né permessi speciali: è macchinario standard del browser, presente in tutti i browser principali da circa un decennio. L'insolito è un sito che ci si appoggia forte quanto questo — perché per un sito la cui intera promessa è che i tuoi file non partono mai, l'offline non è una comodità. È la prova.

## Che cosa dimostra sopravvivere alla spina staccata

La verifica più forte della guida sul caricare è [staccare la spina](https://abox.tools/it/guide/e-sicuro-caricare-i-propri-file/): caricare lo strumento, scollegarsi, usarlo. Vale la pena essere precisi sul perché funziona. Uno strumento che converte il tuo file su un server ha bisogno della rete nell'istante esatto in cui lavora: taglia il filo e il lavoro si ferma. Uno strumento che continua ha dimostrato, non affermato, che il lavoro avviene sulla tua macchina; e una pagina che non può raggiungere la rete non può spedire il tuo file da nessuna parte, qualunque cosa il suo codice desideri.

Nessuna informativa sulla privacy può offrire questo. Un'informativa descrive intenzioni e può cambiare; una pagina che fa il suo lavoro in modalità aereo è fisica. Per questo ogni strumento di questo sito funziona offline e porta un indicatore in tempo reale che dice se in questo momento lo sei — così puoi guardarlo scattare mentre spegni la connessione, ed eseguire la verifica più forte che esista in una decina di secondi.

## Come la copia resta onesta

Due domande decidono se il conservato-per-sempre è un regalo o una trappola, e il macchinario risponde a entrambe:

- **La copia invecchia?** Il worker controlla se c'è una versione più nuova quando una connessione esiste e la scambia in blocco. Le versioni vanno in blocco perché la copia dev'essere sempre coerente: metà vecchia e metà nuova è l'unico stato che non va mai servito.
- **Che cosa è stato copiato, esattamente?** Tutto ciò che serve alla pagina e nient'altro — e ogni strumento di qui tiene la propria copia nel proprio scomparto. La cache di uno strumento contiene quello strumento; installarne uno non ne installa dieci in silenzio. La copia è anche ispezionabile: gli strumenti per sviluppatori del tuo browser elencano ogni file in cache, e l'elenco è lo stesso che la pagina ha scaricato alla luce del sole.

Il risultato è una pagina che si comporta come un'applicazione che hai installato visitandola — cosa che è anche letteralmente in offerta: la barra degli indirizzi del browser installa qualunque strumento di qui come app, con l'icona propria dello strumento, che si apre dritta sullo strumento, senza bottoni sulla pagina e senza script che chiedono. Lo stesso macchinario, vestito da scorciatoia.

## Che cosa l'offline non prova

La verifica è forte, non magica, e i suoi limiti meritano la stessa chiarezza della sua forza:

- **Prova l'istante, non il futuro.** Il lavoro fatto offline è rimasto sulla tua macchina, punto. Una pagina potrebbe in linea di principio trattenere dati e spedirli al ritorno della connessione — quindi, per i file più delicati, chiudi la scheda prima di riconnetterti, o verifica anche l'altra direzione: guarda la scheda Rete mentre la connessione torna.
- **Prova questa pagina, non il sito.** Ogni pagina risponde per sé. L'unica di qui che usa la rete lo dice sulla propria pagina: lo strumento per [condividere testo](https://abox.tools/it/condividere-testo/), il cui intero mestiere è spostare qualcosa fra due dispositivi, e che spiega esattamente che cosa trasporta la sua unica connessione.
- **Non ti nasconde.** Caricare la pagina ha già detto al sito il tuo indirizzo, come ogni caricamento di pagina sul web. L'offline riguarda dove vanno i tuoi file, non l'anonimato.

Questi limiti sono il motivo per cui la guida sul caricare insegna quattro verifiche invece di una: la scheda Rete, la politica di sicurezza nel sorgente della pagina e il codice leggibile coprono ciò che la spina staccata non può. Ma come primo filtro nessuno è più rapido: se uno strumento non riesce a fare il suo lavoro a rete spenta, hai imparato dove il lavoro avviene, e non serve leggere oltre.
