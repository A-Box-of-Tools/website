# È sicuro usare un generatore di password online?

Il tuo sospetto è giusto, e conviene tenerlo: una pagina che fabbrica password è esattamente la pagina che non deve ricordarle. La buona notizia è che si può verificare — la casualità nasce sulla tua macchina, gli invii si vedono, e un generatore che si tiene ciò che ha fatto può essere colto sul fatto.

Ultimo aggiornamento 26 agosto 2026

## La risposta breve

Il sospetto dietro questa domanda è esattamente quello giusto, quindi tienilo. Una pagina che fabbrica password è l'unica pagina del web che non ha nulla di delicato da ricevere e tutto di delicato da *tenere*: il suo prodotto è il segreto, e un generatore che trasmettesse ciò che fabbrica non sarebbe uno strumento debole ma una collezione di password. La domanda non è mai se una pagina generatrice sembri affidabile. È se *potrebbe* tenersi la password volendo — e questo, cosa insolita, si può verificare.

Lo decidono tre cose: da dove viene la casualità, se il risultato può lasciare la pagina, e se qualcosa del risultato è prevedibile. Tutte e tre hanno risposte oneste che un visitatore può controllare, il che è più di quanto si possa dire di un'app scaricata che genera in una finestra dentro cui nessuno può guardare.

## Da dove viene la casualità del browser

Ogni generatore serio in un browser attinge allo stesso pozzo: `crypto.getRandomValues`, il generatore casuale crittografico del browser, seminato e riseminato dal sistema operativo con rumore dell'hardware. È la stessa fonte da cui il browser trae le chiavi TLS — la cifratura su cui corre il tuo collegamento con la banca. Non esiste alcun senso utile in cui un programma desktop abbia accesso a casualità migliore di una pagina web; entrambi finiscono allo stesso pozzo del sistema.

Ciò che una pagina *non* deve usare è `Math.random()`, la funzione tuttofare per tirare un dado. I browser la implementano con un generatore veloce il cui stato interno si ricostruisce da una manciata di uscite consecutive — le password costruite su di esso sembrano casuali e sono calcolabili da chiunque ne abbia vista una. Non è teoria; è stato dimostrato contro generatori in circolazione più di una volta. Ed è invisibile dall'esterno, che è l'argomento più forte a favore dei generatori il cui codice si può leggere: la differenza fra le due funzioni è una parola nel sorgente.

C'è un grado di cura più fine ancora. Trasformare parole casuali a 32 bit in «un numero sotto 26» con un semplice resto è leggerissimamente sbilanciato verso le prime lettere; un generatore accurato estrae di nuovo invece di prendere il resto. Il [generatore di qui](https://abox.tools/it/generatore-password/) lo fa — lo sbilanciamento evitato è di circa una parte su 165 milioni, invisibile nell'uso ed esattamente il genere di dettaglio che separa uno strumento costruito per il compito da un frammento copiato da un forum.

## Che cosa potrebbe fare di sbagliato una pagina generatrice

Diamo un nome ai fallimenti, senza giri, perché ognuno si può verificare:

- **Spedire fuori la password.** La pagina genera in locale e poi invia ciò che ha fatto — col clic, con l'analitica, o a lotti più tardi. È il difetto squalificante, e si vede: dev'essere una richiesta di rete, e le richieste si possono osservare.
- **Generare sul server.** La password arriva dalla rete invece di partirne — quindi il gestore l'ha vista per primo, e su come è stata fatta non impari nulla. Stessa verifica, direzione opposta.
- **Generare debole.** `Math.random`, un seme d'orologio, una lista di poche centinaia di parole spacciata per forte. Questa nessuna scheda Rete la cattura; solo il codice leggibile, o un indicatore di forza onesto, contato dai parametri reali.
- **Tenere una cronologia.** Ricordare premurosamente le tue ultime venti password — in una memoria che sopravvive alla scheda, su una macchina magari condivisa.

Il [generatore di password e passphrase](https://abox.tools/it/generatore-password/) di questo sito è costruito contro tutti e quattro per costituzione: `crypto.getRandomValues` e nient'altro, generazione nella pagina, nessuna memorizzazione di alcun tipo, niente cronologia, e una riga di forza che riporta esattamente quanti risultati erano possibili con i tuoi parametri. Le liste di parole per le passphrase sono le liste Diceware della EFF, incluse immutate nella cartella dello strumento.

## Come verificare qualunque generatore, questo compreso

Il metodo completo è scritto nella [guida sul caricare file](https://abox.tools/it/guide/e-sicuro-caricare-i-propri-file/), e questa è la pagina a cui applicarlo prima di ogni altra:

- **Prima stacca la spina.** Carica la pagina, vai offline, *poi* genera. Una password fatta senza connessione non può essere arrivata da fuori né essere partita nell'istante in cui nasceva. Questa pagina continua a funzionare offline; è il suo senso.
- **Guarda la scheda Rete mentre generi.** Premi il bottone e leggi l'elenco: non deve partire nulla. Poi copia la password e guarda di nuovo — la copia è il momento che una pagina disonesta sceglierebbe.
- **Cerca ciò che servirebbe a una collezione.** Un account, una sincronizzazione, una lista dei «generati di recente». Un generatore con memoria possiede una copia.

Una riserva onesta spetta alla fine. Una verifica dice che cosa la pagina ha fatto mentre guardavi; il codice pubblicato e servito leggibile — come tutto su questo sito — dice che cosa fa in generale. Resta la macchina stessa: nessuna pagina web può proteggere una password da un browser compromesso o da un software spia, e un generatore non fa eccezione. Ciò che le verifiche ti comprano è più piccolo e reale — una password che nessun server ha mai visto, fabbricata da un'aritmetica che ti è stato permesso di leggere.
