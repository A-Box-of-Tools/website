# Come unire, dividere e riordinare le pagine di un PDF

Mettere insieme due documenti è la cosa più ordinaria che si faccia a un PDF, ed è anche quella che più spesso si fa consegnando entrambi i file al server di uno sconosciuto. Non serve. Qui c'è come farlo, e cosa sparisce in silenzio quando uno strumento rimette in fila le pagine.

[Apri Unire e dividere PDF](https://abox.tools/it/unire-pdf/): Pagine spostate senza un giro fino a un server.

Ultimo aggiornamento 26 agosto 2026

## La risposta corta

Apri [Unire e dividere PDF](https://abox.tools/it/unire-pdf/), trascinaci dentro tutti i file che vuoi usare, e trascina le pagine nell'ordine che ti serve. Poi dici se deve uscirne un documento solo o più di uno, e premi il pulsante. Non viene caricato niente: i file li apre, li smonta e li riscrive il tuo browser.

I tre lavori che si cercano separatamente — unire, dividere, riordinare — stanno in una schermata sola, perché sono un'unica operazione con una risposta diversa alla fine: scegli delle pagine, le metti in un ordine, e decidi in quanti file devono uscire.

## Unire due o più documenti

Scegli il primo file, poi il secondo: le pagine di ciascuno finiscono in fondo all'ordine che stai costruendo, così puoi continuare ad aggiungere file presi da cartelle diverse senza ricominciare. Se sono entrati nell'ordine sbagliato, trascina una pagina per la sua maniglia, oppure usa le frecce su ogni riquadro.

Unire non ricodifica niente. Il contenuto di ogni pagina e ogni carattere, immagine e disegno vettoriale a cui rimanda vengono copiati identici, quindi il testo resta selezionabile e cercabile e una scansione è la stessa scansione. Il file unito di solito è un po' più piccolo dei due file di partenza messi insieme, e non è compressione: è la struttura intorno alle pagine, scritta una volta invece che due.

Le pagine si tengono la loro misura. Unisci una relazione in A4 con un'appendice in formato Letter e ottieni un documento che contiene tutte e due, che è quello che dicono i file. Riscalare le pagine di qualcuno su un unico formato di carta è un'altra operazione, e non una di quelle che uno strumento per unire dovrebbe fare in silenzio.

## Dividere un documento in più file

I modi di tagliare sono quattro, e quale ti serve dipende dal perché stai tagliando:

- **Ogni tot pagine.** Per una scansione lunga di quello che in origine era una pila di documenti separati — dodici buste paga da due pagine l'una.
- **Ai numeri di pagina che indichi tu.** Per una relazione con capitoli che cominciano a pagine che puoi vedere. Ogni numero che scrivi apre un file nuovo.
- **Un file per pagina.** Per tirare fuori da un mucchio un singolo foglio di firme o un certificato.
- **Di nuovo nei file da cui sono arrivate.** Compare solo se hai unito più di un file, ed è utile dopo aver messo mano alle pagine: togliere le pagine bianche da tre scansioni in una volta, e riavere indietro tre file.

Se ti servono solo poche pagine di un documento lungo, dividerlo non serve affatto. Scrivi le pagine che vuoi nella casella degli intervalli — `1-3, 8, 12-` —, premi «Tieni solo queste» e costruisci un documento.

Quando i file in uscita sono più di uno, arrivano dentro a un unico ZIP. Cinquanta download sono cinquanta finestre di salvataggio, che è più o meno il punto in cui chiunque si arrende.

![La scheda di uscita: opzioni per un documento o più, divisione per dimensione, a un numero di pagina, o di nuovo nei file da cui è stato fatto.](https://abox.tools/screens/merge-and-split-pdf-files/output.webp)

Dividere è la stessa operazione dell'unire, fatta al contrario, ed è per questo che è un'impostazione qui e non uno strumento a parte.

## Riordinare, ruotare e togliere pagine

Trascina un riquadro per la sua maniglia per spostarlo. Le frecce su ogni riquadro lo spostano di un posto, oppure lo girano di un quarto di giro alla volta — che è il rimedio per la pagina uscita di traverso dallo scanner. La × la toglie.

Per qualsiasi cosa che riguardi più di un paio di pagine, usa invece la casella degli intervalli. Accetta quello che scriveresti su un foglio: `1-3, 8, 12-`, e anche `dispari`, `pari`, `tutte` e `ultima`. Tieni quelle, togli quelle, o gira quelle. Un caso frequente: una scansione fronte-retro in cui una pagina sì e una no è capovolta è `pari` più due giri.

I numeri sui riquadri si rifanno mentre lavori, quindi vogliono sempre dire «posizione nel documento finito» e non «pagina del file da cui è arrivata». Non viene scritto niente finché non premi il pulsante, quindi non c'è niente da annullare — e «rimetti com'erano» riporta tutto all'ordine di partenza.

![La griglia delle pagine: ogni pagina di due documenti in miniatura, nell'ordine in cui usciranno, con comandi per ruotare, invertire e togliere.](https://abox.tools/screens/merge-and-split-pdf-files/pages.webp)

Tutti e due i documenti, pagina per pagina. Riordinare è trascinare; il campo degli intervalli sopra è per i documenti in cui trascinare porterebbe via un pomeriggio.

## Cosa sopravvive a un rimescolamento e cosa no

Questa è la parte che nessuno strumento ti racconta, ed è il motivo per cui a volte un documento unito sembra rotto in qualche modo che non sai spiegare.

Un PDF non è una pila di pagine. È un grafo, e buona parte di lui riguarda il documento e non una pagina in particolare: il pannello dei segnalibri, i collegamenti, il modulo, l'ordine di lettura che segue uno screen reader, la numerazione che chiama le prime quattro pagine «i, ii, iii, iv». Sposta le pagine e ognuna di quelle cose va ricostruita o lasciata cadere.

- **I segnalibri vengono ricostruiti.** Una voce la cui pagina è ancora lì punta a dove quella pagina è finita. Una voce la cui pagina hai tolto se ne va — a meno che sotto di lei restino delle voci, e allora rimane come intestazione, perché il titolo di un capitolo sta ancora dove sta il capitolo. Unendo più file, i segnalibri di ciascuno vengono annidati sotto un'intestazione col nome del file, ed è quello che rende una relazione unita navigabile.
- **I collegamenti vengono seguiti.** Un collegamento da pagina 2 a pagina 40 sa dove è finita pagina 40, comprese le destinazioni con nome che Word e LaTeX scrivono per ogni titolo. Un collegamento la cui destinazione non è venuta resta senza niente dietro, invece di puntare alla pagina che adesso si trova per caso in quella posizione.
- **I moduli compilati sopravvivono**, e il documento nuovo viene registrato come modulo, così i lettori lo trattano per quello che è. Una stranezza da sapere: due campi con lo stesso nome sono *un* campo solo per qualsiasi lettore, quindi unire due copie dello stesso modulo li lega — scrivi in uno e si riempie anche l'altro.
- **L'ordine di lettura marcato no.** Descrive una sequenza che non esiste più, e per uno screen reader un ordine sbagliato è peggio di nessun ordine. Se la marcatura per l'accessibilità di un documento conta, tieni l'originale accanto.
- **Le etichette di pagina nemmeno.** La numerazione «iii, iv, 1, 2» è un'affermazione su un ordine che hai appena cambiato.
- **Allegati e script del documento nemmeno.** I file allegati appartengono al documento, non a una pagina. Le azioni che eseguono JavaScript, spediscono un modulo da qualche parte o avviano un programma non vengono portate nel tuo file nuovo, che è l'impostazione giusta per pagine arrivate da qualcun altro.

La firma digitale è un caso a parte, e non un limite di qualche strumento: una firma certifica un documento com'era. Sposta una pagina e la firma si rompe, perché è esattamente quello che è lì a dirti.

## File protetti da password

Un PDF cifrato viene rifiutato, compresi quelli con password vuota che producono tante fotocopiatrici da ufficio. Togliere la protezione a un documento è un lavoro diverso dallo spostarne le pagine, e uno strumento che lo facesse in silenzio starebbe facendo qualcosa che non hai chiesto. Aprilo in un lettore con la password e salva prima una copia senza protezione.

## Controllare il risultato

Aprilo, e controlla tre cose: il numero di pagine, l'ordine e — se il documento li aveva — il pannello dei segnalibri e un paio di collegamenti.

La prima lo strumento qui la fa per te prima di offrirti il file. Ogni documento finito viene riaperto dallo stesso codice che ha letto i tuoi originali, e le sue pagine vengono contate camminando l'albero delle pagine invece di credere al numero scritto nel file. Se quel conto non torna con quello che hai chiesto, il download non viene proprio offerto.

## Perché questo non ha bisogno di un server

Unire suona come lavoro da server, e per quasi tutta la vita del web lo è stato. Quello che serve davvero è leggere la struttura del file, copiare in un file nuovo gli oggetti da cui una pagina dipende, e scrivere una tabella di riferimenti incrociati nuova di zecca. Non viene decodificato nessun pixel e non viene disegnato niente. Un browser sa fare tutto questo da anni.

E qui conta più che quasi ovunque, per *quello che* la gente unisce. I documenti che finiscono insieme sono quelli che arrivano da qualche parte: un contratto e la sua pagina di firme, la scansione di un passaporto e un estratto conto, una lettera medica e un modulo di richiesta. Un servizio online per unire li riceve tutti in una volta, già in ordine, dalla stessa persona. È il caricamento più rivelatore che la maggior parte delle persone faccia in vita sua.

Lo strumento qui non ha nessuna funzione di rete, e la `Content-Security-Policy` della pagina elenca ogni indirizzo che può contattare: nessuno di quelli è di questo sito. Caricala, stacca la spina, e unisci qualcosa lo stesso.

[È sicuro caricare i propri file sui convertitori online?](https://abox.tools/it/guide/e-sicuro-caricare-i-propri-file/) mette in fila altri tre controlli come questo.
