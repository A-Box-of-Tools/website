# Unire PDF — e dividere e riordinare le pagine

Pagine spostate senza un giro fino a un server.

> Metti insieme PDF, dividine uno in più file e trascina le pagine nell'ordine che vuoi, tutto dentro il tuo browser. Non viene caricato niente, non serve un account, e il file finito viene riaperto e ricontato prima di essere offerto.

Questa pagina è uno strumento interattivo che funziona interamente nel tuo browser, all'indirizzo https://abox.tools/it/unire-pdf/ — nulla di ciò che gli affidi viene caricato. Quanto segue è tutto ciò che la pagina dice dello strumento a parole; per usarlo, apri l'indirizzo.

## Qui non si caricano documenti, **mai**. Non c'è nessun server.

Ogni documento che scegli viene aperto, smontato e riscritto nella memoria di questo dispositivo, da codice servito da questo indirizzo. Qui non c'è niente che possa fare un caricamento, e dall'altra parte di questa pagina non c'è nessun server a riceverlo.

- ✗ Niente caricamenti
- ✗ Nessun account
- ✓ Funziona offline
- ✓ Open source
- ✓ I file restano sul tuo dispositivo

## Come unire, dividere o riordinare un PDF

1. **Scegli i tuoi PDF.** Trascinali sul selettore oppure cercali a mano, e aggiungine altri più avanti: le pagine di ogni file finiscono in fondo all'ordine corrente, ed è questo che rende possibile unire due cartelle in due momenti diversi. Il browser li legge direttamente dal tuo disco.
2. **Metti le pagine nell'ordine che vuoi.** Trascina una pagina per la sua maniglia, oppure spostala con le frecce. Gira quella che è stata scansionata di traverso, togline una, oppure scrivi `1-3, 8, 12-` nella casella per tenere, togliere o girare tutta una serie in un colpo solo. I numeri si rinumerano man mano, quindi quello che vedi è sempre quello che sarà il file finito.
3. **Di' se esce un documento o più d'uno.** Uno è la risposta solita. Il resto sono modi di tagliare: ogni tot pagine, ai numeri di pagina che indichi tu, un file per pagina, oppure di nuovo dentro i file da cui le pagine venivano. Più di un file viene consegnato in un solo ZIP, così è un salvataggio invece di cinquanta.
4. **Costruiscilo, e leggi la riga che dice che è stato controllato.** Quando i documenti sono scritti, ognuno viene riaperto dallo stesso lettore di questa pagina e le sue pagine vengono contate. Se il conto non torna con quello che avevi chiesto, l'operazione viene segnalata come fallita e non viene offerto nessun download.

## La versione lunga

[Come unire, dividere e riordinare le pagine di un PDF](https://abox.tools/it/guide/unire-e-dividere-file-pdf/): Mettere insieme più PDF, tagliarne uno in tanti e spostare le pagine: cosa sopravvive al rimescolamento, cosa nessuno strumento riesce a portarsi dietro, e perché niente di tutto questo richiede di caricare i tuoi documenti da qualche parte.

## Anche nella cassetta

- [Compressore di PDF](https://abox.tools/it/comprimere-pdf/): Alleggerisci un documento senza spedirlo da nessuna parte.
- [Oscuratore di PDF](https://abox.tools/it/oscurare-pdf/): Le lettere vengono cancellate dal file, e poi il file viene cercato per dimostrarlo.
- [Immagini in PDF](https://abox.tools/it/immagini-in-pdf/): Metti le tue foto dentro un documento solo.
- [Scanner per documenti](https://abox.tools/it/scansionare-documenti/): Fotografa la pagina. Ti torna indietro qualcosa che sembra scansionato.

## Domande

### I miei PDF vengono caricati da qualche parte?

No. Li legge, li copia e li scrive il tuo browser sul tuo hardware. Questo strumento non ha un lato server, e la `Content-Security-Policy` della pagina elenca ogni indirizzo che può contattare: nessuno appartiene a questo sito. Questo strumento non ha proprio nessuna funzione di rete, nemmeno facoltativa.

### Quanti file posso unire, e quanto possono essere grandi?

Nello strumento non è scritto nessun limite. Il limite è il tuo dispositivo: i documenti restano in memoria mentre ci si lavora, quindi un portatile unisce qualche centinaio di megabyte senza fiatare e comincia a soffrire da qualche parte più su. Non viene addebitato, rallentato, marchiato né messo in coda niente, perché dall'altra parte non c'è nessuno che possa fare una di queste cose.

### Unire o dividere fa perdere qualità?

No. Sulla pagina non viene ricodificato, ridisegnato o ricompresso niente. Il flusso di contenuto di ogni pagina e ogni carattere, immagine e disegno vettoriale a cui rimanda vengono copiati byte per byte, quindi il testo resta selezionabile e cercabile e una fotografia è la stessa fotografia. Le uniche cose che cambiano sono l'ordine delle pagine e la struttura attorno.

### Cosa succede a segnalibri e collegamenti?

Vengono ricostruiti tutti e due invece che buttati. Un segnalibro la cui pagina è ancora nel risultato punta a dove quella pagina è finita; quello la cui pagina hai tolto sparisce, a meno che sotto non gli siano rimaste delle voci, e in quel caso resta come titolo. Unendo più file, i segnalibri di ciascuno finiscono sotto un titolo col suo nome. I collegamenti tra pagine vengono seguiti allo stesso modo, comprese le destinazioni con nome che scrivono Word e LaTeX, e un collegamento la cui destinazione non è venuta resta senza niente dietro invece di mandare chi legge nel posto sbagliato. I collegamenti a indirizzi web restano come sono.

### Cosa non viene portato dietro?

Quattro cose, e lo strumento lo dice nei risultati invece che in fondo in piccolo. L'albero dell'ordine di lettura con i tag che usano i lettori di schermo, le etichette di pagina (la numerazione «iii, iv, 1, 2»), gli allegati incorporati, e qualsiasi azione che non sia «vai a una pagina» né «apri un indirizzo web», il JavaScript del documento compreso. Le prime due descrivono un ordine che, una volta spostate le pagine, non esiste più; l'ultima non è una cosa che hai chiesto di portarti in un file nuovo. Se i tag di un documento ti interessano, tieni anche l'originale.

### I moduli compilati sopravvivono?

Sì. I campi modulo e quello che ci è stato scritto dentro arrivano insieme alle loro pagine, e il documento nuovo viene registrato come modulo, così i lettori lo trattano per quello che è. Una cosa da sapere quando si unisce: due campi con lo stesso nome sono un campo solo per qualunque lettore, quindi se unisci due copie dello stesso modulo, riempire una casella su una pagina la riempirà anche sull'altra. Lo strumento se ne accorge e te lo dice.

### Riesce ad aprire un PDF protetto da password?

No, ed è voluto. Un documento cifrato viene rifiutato con un messaggio che lo dice, anche quando la password è vuota, che è il modo in cui salvano tanti scanner e fotocopiatrici. Togliere la protezione a un file è un lavoro diverso dallo spostare le sue pagine, e uno strumento che lo facesse in silenzio starebbe facendo qualcosa che non hai chiesto.

### Perché non ci sono le anteprime delle pagine?

Perché disegnare una pagina vuol dire un motore PDF completo, con caratteri, sfumature, gruppi di trasparenza e metodi di fusione, cioè un megabyte o più di motore da scaricare e far girare per quattro miniature. Quello che le caselle mostrano al posto loro è ciò su cui il riordino lavora davvero: il numero di pagina, la forma e la dimensione del foglio, la rotazione con cui verrà scritta e da quale file è uscita. Una scansione orizzontale in mezzo a una pila di pagine verticali si vede lo stesso al primo colpo d'occhio.

### Il file finito si aprirà dappertutto?

Sì. L'uscita viene scritta come PDF 1.5, o nella versione più alta che uno dei file che gli hai dato richiedeva, e la 1.5 la capisce ogni lettore uscito dal 2003 in poi. Lo strumento lo dimostra anche sul tuo dispositivo: riapre ogni file finito e ne conta le pagine percorrendo l'albero delle pagine prima di offrirtelo.

### È gratis, e mi serve un account?

È gratis, e non c'è account, non c'è registrazione, non c'è periodo di prova e non c'è limite di dimensione oltre a quello che consente la memoria del tuo dispositivo. Il sito ha della pubblicità, ed è quella che lo mantiene; agli annunci non arriva niente sui tuoi documenti.

### Funziona offline?

Sì. Carica la pagina una volta, poi stacca la connessione e continua a funzionare. È anche il modo più semplice per dimostrare che non viene caricato niente, perché uno strumento che spedisse via i tuoi documenti per unirli si fermerebbe nell'istante in cui stacchi la spina.

## Come si verifica quello che promette

- **I tuoi documenti non hanno una strada per uscire.** Nella Content-Security-Policy c'è ogni indirizzo che questa pagina può contattare, e non ne appartiene uno a questo sito. Questo strumento a quell'elenco non aggiunge niente: non ha una funzione di rete sua, nemmeno facoltativa. Qui non esiste un recapito dove i tuoi file possano essere raccolti, e nel codice non c'è niente che li manderebbe lì se esistesse.
- **Unire è il lavoro che più vale la pena non caricare.** I documenti che la gente mette insieme sono proprio quelli che vengono da qualche parte: un contratto e la sua pagina delle firme, la scansione di un passaporto e un estratto conto, una lettera del medico e un modulo di richiesta. Un servizio online se li ritrova tutti, in un posto solo, già ordinati. Questo ha una pagina nel tuo browser e nessun'altra metà.
- **L'intero formato sta in questo repository.** Un PDF è un elenco di oggetti e una tabella di dove comincia ciascuno. `src/objects.js` legge quella sintassi, `src/reader.js` segue la tabella, `src/assemble.js` copia le pagine da un documento all'altro e `src/writer.js` scrive il risultato. Nessuno dei quattro importa qualcosa in grado di fare una richiesta. Non si scarica nessuna libreria e non viene disegnato niente su un server.
- **I file cifrati vengono respinti invece che aperti.** Un PDF con una password addosso viene rifiutato, compreso quello che gli scanner producono con la password vuota e che tecnicamente si aprirebbe. Togliere la protezione a un documento è un lavoro diverso dallo spostare le sue pagine, e farlo in silenzio sarebbe una sorpresa poco gradita da parte di uno strumento.
- **Il file finito non dice dove è stato fatto.** Nessuna riga di produttore, nessuna data di creazione, nessun nome dello strumento. E non si porta dietro nemmeno il pacchetto XMP o i blocchi privati che un programma di impaginazione lascia indietro: quelli appartengono al documento che c'era prima, non a quello che hai appena costruito. Tutto quello che sta nelle pagine viene copiato esattamente: questo strumento sposta pagine, non riscrive quello che c'è sopra.
- **Le azioni che non sono «vai a una pagina» non vengono copiate.** Un PDF può portarsi dietro istruzioni che partono all'apertura: riproduci questo, manda questo modulo a quell'indirizzo, esegui questo JavaScript. Le pagine che passano da qui tengono i loro collegamenti ad altre pagine e a indirizzi web, e perdono il resto. Riordinare le pagine di qualcun altro non è un motivo per portarsi lo scripting del suo documento dentro il tuo file nuovo.
- **Cosa carica Google, e cosa non gli arriva.** Gli script della pubblicità e della misurazione arrivano da Google. A nessuno dei due viene passato niente sui tuoi documenti: né un file, né una pagina, né un nome, una dimensione o un numero di pagine. Ogni riga che legge, copia o scrive un PDF è servita da questa origine ed è elencata nel repository.
- **Cosa carica il pulsante delle donazioni, e cosa non gli arriva.** Il pulsante «Buy me a coffee» in alto è disegnato da uno script di cdnjs.buymeacoffee.com e prende i caratteri da Google Fonts. Non è niente di più di un collegamento: non segnala nessuna visita e non gli viene passato niente su di te o sui tuoi documenti. Finché non ci clicchi non succede niente, e quello a cui arriveresti è il sito di qualcun altro.
- **Funziona offline.** Stacca la rete e tutto quello che c'è su questa pagina continua a funzionare. È la prova più semplice che ci sia: uno strumento che spedisse via i tuoi documenti per unirli si fermerebbe.

**Verifica tu stesso.** Niente di quanto sopra va preso per buono. Questa pagina la genera, dai modelli e dalla configurazione del repository, uno script di build che puoi leggere ed eseguire anche tu, e il risultato finisce sul branch `dist`: puoi quindi confrontare quello che viene servito con quello che produce una build dei sorgenti. https://github.com/A-Box-of-Tools/website

I file da leggere per primi sono `config/site.toml` per la Content-Security-Policy e `src/assemble.js` per tutta la copia, cioè per come una pagina viene tirata fuori da un documento e messa in un altro, e per cosa viene lasciato indietro di proposito. Non può raggiungere la rete, e non possono nemmeno il lettore e lo scrittore che gli stanno accanto.
