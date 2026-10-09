# Un agente IA può usare questi strumenti?

Sì. Sono pagine web comuni, senza account, senza captcha e con ogni comando etichettato, e un agente le guida come guida tutto il resto. La domanda che merita una pagina è quella dietro: quando affidi a un agente una faccenda con i file, il file dove va? La risposta dipende per intero da dove gira il browser dell'agente.

Ultimo aggiornamento 6 settembre 2026

## La risposta breve

Sì. Ogni strumento qui è una pagina web comune: un selettore di file, qualche comando etichettato, un pulsante di download. Non c'è nessun account in cui entrare, nessun captcha da risolvere, nessun passaggio che richieda un umano in particolare. Un agente IA con un browser guida queste pagine come guida qualunque altra — e parecchie cose che questo sito già fa per le persone tornano utili agli agenti gratis; l'ultima sezione le elenca.

Ma «sa premere i pulsanti?» è la domanda piccola. Quella che merita una pagina è che cosa succede alla promessa di questo sito — *il tuo file non lascia mai la tua macchina* — quando la macchina che preme i pulsanti non sei tu. La risposta è che la promessa sopravvive alla delega perfettamente, o per niente, a seconda di una cosa sola: **dove gira il browser dell'agente.**

## Due specie di agente, una distinzione

Gli agenti che usano strumenti vengono in due forme, e la differenza fra le due pesa più di tutto il resto di questa pagina.

**Un agente locale** gira sulla tua macchina: un assistente installato sul tuo computer, o uno che conduce il browser che hai davanti. Quando un agente così apre qui uno strumento e gli porge il tuo file, il lavoro avviene dove avviene sempre con queste pagine — in un browser, sul tuo hardware. Il file viene letto dal tuo disco, elaborato nella memoria del tuo browser, riscritto sul tuo disco. La delega non ha cambiato nulla del percorso dei byte. Un'IA ha scelto le impostazioni; il file, comunque, non è mai partito.

**Un agente nel cloud** fa girare un browser sul computer del suo fornitore. Tu alleghi un file a una chat, l'agente lavora in una macchina virtuale da qualche altra parte, e qualunque cosa faccia con questi strumenti avviene là. Gli strumenti mantengono ancora esattamente la promessa — il file non va oltre il browser in cui si trova — ma quel browser non è il tuo, e il caricamento è già avvenuto nell'istante in cui hai allegato il file, prima che qualsiasi strumento fosse aperto. Nessuna pagina può disfare un caricamento che l'ha preceduta.

Quindi la domanda che questo sito continua a fare — questo lavoro ha bisogno che il mio file parta? — non sparisce quando il lavoro lo fa un agente. Arretra solo di un passo, alla scelta dell'agente. Un agente locale che guida uno strumento tutto dentro il browser è la combinazione rara in cui delegare non costa privacy: l'IA fa il lavoro, e il file resta a casa.

## Come affidare un lavoro a un agente

Gli agenti rendono meglio con lo stesso incarico che vorrebbe un collega: lo strumento, il file, e che aspetto ha il lavoro finito. Alcuni schemi che funzionano:

- **Nomina il risultato, non solo lo strumento.** «Apri abox.tools/comprimere-immagine/ e porta questa foto sotto i 200 KB» dà all'agente il numero che la pagina chiederà. Il [compressore di immagini](https://abox.tools/it/comprimere-immagine/) accetta una dimensione obiettivo per nome — esattamente il genere di istruzione che un agente sa eseguire con fedeltà.
- **Mostragli la mappa.** Questo sito pubblica [llms.txt](https://abox.tools/llms.txt): ogni strumento e ogni guida, con una riga di descrizione ciascuno, in testo semplice e in una sola richiesta. Un agente che lo legge sa che cosa esiste qui senza esplorare nulla. E ogni pagina ha un gemello al proprio indirizzo con `index.md` in coda: la pagina in Markdown, senza l'interfaccia intorno, per un agente che vuole ciò che la pagina di uno strumento dice, e non come appare.
- **Lascialo leggere la pagina su cui sta.** Ogni strumento porta le sue domande e risposte nella pagina stessa, e ogni strumento ha una guida a un link di distanza. A un agente che sembra incerto su un'impostazione si può dire di leggere prima la guida — lo stesso consiglio che riceverebbe una persona.
- **Le catene funzionano.** I lavori che le guide di concatenazione di questo sito descrivono alle persone — scansionare e poi riunire in un [PDF](https://abox.tools/it/immagini-in-pdf/); togliere i dati [EXIF](https://abox.tools/it/rimuovere-dati-exif/) e poi ridimensionare — sono i lavori in cui gli agenti eccellono, perché l'uscita di ogni passo è l'ingresso del successivo e nulla, in mezzo, chiede giudizio.

## Che cosa non delegare

Un agente può guidare ogni strumento di qui. In due punti guidare non è tutto il lavoro, e il resto dovrebbe restare a te.

**Decidere che cosa non deve vedersi.** Gli strumenti di oscuramento cancellano ciò che copri — ma scegliere che cosa coprire *è* il lavoro, e un agente a cui sfugge una riga ha prodotto un file che sembra finito e non lo è. Lascia pure che un agente manovri l'oscuratore; il risultato guardalo tu, prima che vada da qualunque parte — la stessa regola che le guide di quegli strumenti danno a un operatore umano.

**Aprire ciò che è stato letto.** Il lettore di QR code di questo sito si rifiuta di aprire ciò che decodifica, perché leggere e seguire sono atti diversi. La stessa separazione vale la pena imporla a un agente: un agente che legge un codice, un link o un indirizzo in un file deve riferirlo, non visitarlo. E un agente che conduce il tuo stesso browser ha in mano tutto ciò a cui quel browser è collegato con le sue sessioni — una ragione per guardarlo con lo stesso occhio critico di qualunque strumento, che è l'argomento della sezione seguente.

## Anche un agente può verificare la promessa

Le quattro verifiche che la guida sul [caricare file](https://abox.tools/it/guide/e-sicuro-caricare-i-propri-file/) insegna — staccare la spina, guardare la scheda Rete, leggere la Content-Security-Policy, leggere il codice — un agente può eseguirle tutte, e anzi gli riescono più facili che a una persona: leggere un'intestazione CSP o cercare le chiamate a `fetch` nel sorgente servito è lavoro meccanico. Se usi un agente per vagliare gli strumenti prima di fidarti, questo sito si aspetta di essere vagliato allo stesso modo — e il comportamento offline su cui quelle verifiche poggiano ha [una pagina tutta sua](https://abox.tools/it/guide/come-fa-una-pagina-web-a-funzionare-offline/).

Ciò che questo sito fa per un agente lo fa apposta e per tutti: ogni comando è etichettato, perché i lettori di schermo hanno bisogno di nomi e un agente legge quegli stessi nomi; le pagine non hanno account, né finestre a comparsa, né muri di consenso da aggirare; il sorgente è pubblico e servito senza passaggio di build, così il codice che un agente ispeziona è il codice che gira; e [llms.txt](https://abox.tools/llms.txt) è l'intera scatola in una richiesta. Niente di tutto questo è stato aggiunto per le macchine. Una pagina leggibile per una persona con un lettore di schermo si rivela leggibile anche per tutto il resto.

Un limite onesto: questa pagina parla di agenti che usano questi strumenti, non degli agenti in sé. Ciò che vede il fornitore di un agente — le tue istruzioni, le tue schermate, a volte i tuoi file — è una domanda a parte, e l'abitudine a cui questo gruppo di guide continua ad arrivare è la lente giusta anche per lei: chiediti che cosa deve davvero lasciare la tua macchina, e in che stato.
