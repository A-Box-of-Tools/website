# Come oscurare un PDF perché il testo sparisca davvero

Un rettangolo nero sopra un nome e un nome cancellato sono identici sullo schermo. Uno dei due sopravvive a essere selezionato e copiato. Ecco la differenza, i posti in cui una parola si nasconde e che non stanno affatto sulla pagina, e il controllo da trenta secondi che ti dice quale dei due hai.

[Apri Oscuratore di PDF](https://abox.tools/it/oscurare-pdf/): Le lettere vengono cancellate dal file, e poi il file viene cercato per dimostrarlo.

Ultimo aggiornamento 26 agosto 2026

## La risposta breve

Apri l'[Oscuratore di PDF](https://abox.tools/it/oscurare-pdf/), trascinaci dentro il documento, scrivi le parole che devono sparire, spunta quelle che intendi davvero, e premi «Togli». Le lettere vengono cancellate dalle istruzioni con cui la pagina si disegna, le stesse parole vengono tolte dai segnalibri, dai commenti, dai campi dei moduli e dalle proprietà del documento, e il file finito viene riaperto e cercato davanti a te prima che ti venga offerto.

Tutto quello che segue spiega perché è quest'ultima frase quella che conta, e come capire se lo strumento che usi già può dire la stessa cosa.

## Il fallimento di cui si parla

Disegna un rettangolo nero sopra un nome in un lettore di PDF. Quello che vedi è un nome con sopra un rettangolo nero. Quello che quasi tutti i lettori *salvano* è un documento che contiene il nome e, a parte, un rettangolo con una posizione, una dimensione e un colore.

Un rettangolo disegnato così è un'**annotazione**: un oggetto che sta accanto alla pagina e non dentro di essa. Il testo che ci sta sotto è esattamente com'era. Seleziona l'area e premi copia, oppure passa sul file un qualsiasi estrattore di testo, oppure aprilo in un programma che disegna le annotazioni in modo diverso, e il nome torna fuori. Sullo schermo non c'è niente che distingua questo da un oscuramento vero, ed è proprio per questo che continua a succedere a organizzazioni che hanno degli avvocati alle dipendenze.

Ha pubblicato atti giudiziari, valutazioni dei servizi, contratti e — nel dicembre 2025 — nomi anneriti in una diffusione di massa di documenti del Dipartimento di Giustizia statunitense, che sono stati leggibili nel giro di poche ore dalla pubblicazione. Lo schema è sempre lo stesso. Il rettangolo era l'annotazione, e l'annotazione non è mai stata il testo.

## Che cosa fa invece un oscuramento vero

Una pagina di un PDF è un elenco di istruzioni: imposta questo font, sposta la penna qui, disegna questi glifi. Le parole sulla pagina esistono in un posto solo, come operandi di quelle istruzioni di disegno:

```
BT /F1 12 Tf 72 700 Td (Gentile signor Rossi) Tj ET
```

Oscurare il nome vuol dire **cancellare quelle lettere da quella istruzione** e riscrivere la pagina. Dopo di che non c'è più niente da recuperare, non perché il file lo nasconda bene ma perché le lettere nel file non ci sono. Non c'è un rettangolo con qualcosa sotto, perché sotto non c'è niente.

Una cosa va rimessa, altrimenti il risultato è visibilmente sbagliato. Il testo viene disegnato facendo avanzare una penna lungo la pagina, quindi cancellare cinque lettere tira il resto della riga indietro di cinque lettere: le colonne smettono di allinearsi e i totali scivolano sotto le intestazioni sbagliate. Uno strumento che fa questo lavoro come si deve misura di quanto sarebbero avanzate le lettere tolte e rimette quella distanza come un'istruzione di spaziatura, che sposta la penna senza disegnare niente.

Il rettangolo nero, se c'è, viene disegnato *dopo*, sopra un vuoto che è già vuoto. È una cortesia verso chi legge il documento — un segno che qualcosa è stato tolto — e non è l'oscuramento. È tutta qui la distinzione, in una frase: in un oscuramento vero il rettangolo è un ornamento; in uno finto il rettangolo *è* l'oscuramento.

![La scheda di ricerca: due termini inseriti, con il conteggio delle corrispondenze e un elenco di ogni punto in cui compaiono nel documento.](https://abox.tools/screens/redact-a-pdf/find.webp)

Tu dici cosa deve sparire e lo strumento trova ogni occorrenza, comprese quelle a pagina tre che nessuno ricordava.

## I quattro posti in cui una parola si nasconde e che non sono la pagina

È la parte che frega chi la prima parte l'ha fatta come si deve. Un PDF porta testo in più posti contemporaneamente, e un lettore li mostra, li cerca o li copia tutti. Togliere un nome dalla pagina e lasciarlo in uno di questi non vuol dire averlo tolto.

- **Le proprietà del documento.** Titolo, autore e il nome del file da cui questo è stato esportato. Un documento alle cui pagine è stato tolto un nome e le cui proprietà dicono ancora `bozza 3 transazione Rossi.docx` non è oscurato. Di solito c'è una seconda copia delle stesse informazioni in un pacchetto XMP, che deve sparire anche lui.
- **I segnalibri.** L'indice laterale di un lettore è un elenco di titoli con attaccati dei numeri di pagina — e un titolo è una riga di testo su cui la pagina non ha nessun controllo.
- **I campi dei moduli e i commenti.** Quello che qualcuno ha scritto in un modulo è conservato due volte: una come valore del campo e una come l'aspetto che il lettore disegna. Devono sparire tutte e due. Una nota adesiva si porta dietro il suo testo e il nome di chi l'ha scritta.
- **Il testo di sostituzione.** Un PDF può dichiarare che una sequenza di glifi «si scrive» in un altro modo, così che una legatura o una riga spezzata da un trattino si copi come la parola che rappresenta. Vuol dire che un documento può mostrare una cosa e passarne un'altra a chi preme Ctrl+C, e un oscuramento che togliesse solo quello che era disegnato lascerebbe la frase intatta per chiunque selezioni il paragrafo.

Gli allegati sono il quinto. Un PDF può portarsi dentro interi altri file, e niente di quello che fai alle pagine li tocca.

![La scheda della pagina: il testo di una pagina, estratto e selezionabile, con i termini trovati evidenziati.](https://abox.tools/screens/redact-a-pdf/page.webp)

Questa è la parte che sorprende. Un PDF non è un'immagine: le sue parole possono essere selezionate, cercate e copiate da chiunque lo riceva.

## Come controllare un file, in trenta secondi

Fallo su qualsiasi cosa tu stia per mandare, qualunque strumento l'abbia prodotta. È il controllo che avrebbe pescato ognuno dei fallimenti pubblicati.

1. **Apri il file finito e premi Ctrl+F** (Cmd+F su un Mac). Cerca la parola che hai tolto. Un oscuramento vero non restituisce niente. Se il lettore salta a un rettangolo nero, la parola è ancora lì dentro e il rettangolo ci sta semplicemente sopra.
2. **Seleziona l'area annerita e copiala.** Trascina sopra il rettangolo, premi Ctrl+C e incolla in una casella di testo. Se arriva qualcosa, hai trovato lo stesso fallimento dall'altra direzione.
3. **Seleziona tutto il documento e copia anche quello.** Ctrl+A e poi Ctrl+C, incolla in un editor di testo qualsiasi, e leggi che cosa viene fuori. È il più utile dei tre, perché ti mostra il documento come lo vede un estrattore di testo — compreso del testo che non sapevi ci fosse, cosa che su una pagina scansionata è normale.
4. **Guarda le proprietà** — File → Proprietà nella maggior parte dei lettori — e il pannello dei segnalibri. Sono tutti e due posti in cui un nome sopravvive a un oscuramento perfetto sulla pagina.

L'[Oscuratore di PDF](https://abox.tools/it/oscurare-pdf/) esegue per te il primo e il terzo di questi controlli e ti mostra il conto, perché uno strumento che afferma di avere tolto qualcosa non è una prova, mentre una ricerca nel file finito lo è.

## I documenti scansionati sono un problema diverso

Una scansione è la fotografia di una pagina. Le parole che ci stanno sopra sono pixel, non testo, e nessuna quantità di modifiche al livello di testo le tocca — perché un livello di testo non c'è, oppure perché quello che c'è descrive l'immagine invece di esserla.

Quasi tutti gli scanner e gli strumenti PDF moderni aggiungono sopra l'immagine un livello di testo invisibile, scritto dal riconoscimento ottico dei caratteri, perché la pagina si possa cercare. Quel livello è testo vero e si può togliere. Vale la pena toglierlo: è quello che avrebbero trovato una ricerca, una copia e ogni sistema automatico che legge documenti. Non cambia niente dell'immagine, in cui le parole restano perfettamente leggibili per chiunque guardi la pagina.

Quindi per una scansione la sequenza onesta è: togli le parole dal livello di testo, poi occupati dell'immagine a parte — il che vuol dire riscrivere dei pixel. È quello che fa l'[oscuratore di immagini](https://abox.tools/it/guide/oscurare-un-immagine/), e la guida che gli sta accanto spiega perché una sfocatura o un mosaico non bastano per il testo.

## Perché non stamparlo e riscansionarlo

Perché funziona, e ti costa tutto il resto. Stampare una pagina oscurata e riscansionarla produce davvero un documento senza nessun livello di testo da cui perdere — e un documento che nessuno può cercare, che nessun lettore di schermo può leggere, che è da cinque a cinquanta volte più grande, e la cui qualità è quella che è saltata in mente allo scanner dell'ufficio. Si regge anche sul fatto che la pagina si sia stampata come si vedeva: un'annotazione può essere marcata come visibile a schermo e non su carta, e quando il tuo rettangolo nero era proprio quello, il foglio che esce dalla stampante ha sopra il nome.

Lo stesso ragionamento vale per l'«appiattisci in immagine», che certi strumenti propongono come oscuramento. Converte ogni pagina nella fotografia di se stessa. Se le parole erano coperte e non cancellate, adesso la copertura è permanente — ma insieme se n'è andato tutto il resto del documento, e il file che mandi è un file con cui nessuno può lavorare.

## Perché è il lavoro che meno di tutti vale la pena caricare

A un servizio di oscuramento va dato il file non oscurato. È tutta lì la transazione: la versione privata arriva per prima, intatta, ed è la versione che sta sul disco di qualcun altro. Qualunque cosa dica l'informativa sulla privacy, sulla sequenza non si discute — il documento su cui stavi attento è quello che hai consegnato.

Quello che la gente oscura rende la cosa peggiore di come suona. Dichiarazioni di testimoni, lettere mediche, estratti conto che vanno a un padrone di casa, un contratto con dentro il nome di un cliente che va a un altro cliente, un atto con sopra un indirizzo di casa. Quelli sono i documenti, ed è esattamente per questo che lo strumento che li tratta non dovrebbe avere un server dall'altra parte.

Tutto quello che fa [l'oscuratore di questo sito](https://abox.tools/it/oscurare-pdf/) succede nel tuo browser: il file viene letto, modificato, scritto e controllato sulla tua macchina, e nemmeno le parole che cerchi escono mai dalla scheda. Stacca la rete e continua a funzionare, che è la prova più semplice che esista del fatto che non viene mandato niente da nessuna parte. Vedi [è sicuro caricare i propri file](https://abox.tools/it/guide/e-sicuro-caricare-i-propri-file/) per capire che cosa comporta davvero un caricamento.
