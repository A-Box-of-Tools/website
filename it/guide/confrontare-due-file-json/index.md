# Come confrontare due file JSON

Confronta due file JSON così come arrivano e quasi tutto quello che si accende non è niente: indentazione, a capo, chiavi in un altro ordine. Il rimedio non è un diff più furbo — è passare prima i due file per lo stesso formattatore, così che restino solo le differenze vere. Entrambi i passi girano nel tuo browser, che è dove devono stare i file di configurazione con dentro dei segreti.

[Apri Confronto testi](https://abox.tools/it/confrontare-testi/): Due testi dentro, ogni differenza segnata, riga per riga e parola per parola. Niente finisce incollato nel server di qualcun altro.

Ultimo aggiornamento 26 agosto 2026

## La risposta breve

1. Apri il [Formattatore JSON](https://abox.tools/it/formattare-json/), incolla il primo file, imposta l'indentazione a due spazi e spunta *Ordina le chiavi di ogni oggetto*. Copia il risultato.
2. Apri il [Confronto testi](https://abox.tools/it/confrontare-testi/) e incollalo nella casella di sinistra.
3. Fai lo stesso con il secondo file, nella casella di destra.

Quello che si accende adesso è vero: un valore cambiato, una chiave comparsa, una voce sparita. Le differenze di formattazione e le chiavi riordinate che avrebbero affogato un diff qualsiasi non ci sono più, perché i due lati erano scritti uguali prima che il confronto cominciasse.

Nessuna delle due pagine ha alcuna funzione di rete, ed è bene saperlo: il JSON che la gente confronta è così spesso un file di configurazione con le credenziali ancora dentro.

## Perché un diff JSON grezzo è quasi solo rumore

A JSON gli spazi non importano, e all'ordine delle chiavi non dà alcun significato. Lo stesso documento può essere una riga o quattrocento, con le chiavi nell'ordine in cui sono state battute o in quello che una libreria ha emesso, e gli strumenti riscrivono entrambe le cose senza chiedere. Un lato minificato, l'altro disteso; uno salvato a mano, l'altro da un serializzatore che ordina alfabeticamente: un diff di righe vede due file estranei.

I due casi peggiori bastano a fare il punto. Un file **minificato** è una riga, quindi un diff contro di lui è un'unica riga cambiata, gigantesca: vero e inutile. E due file con **lo stesso contenuto in un altro ordine** si confrontano come tutto-cambiato, quando la risposta onesta sarebbe «niente».

![Le opzioni di confronto: vista affiancata o in linea, un interruttore per mostrare solo le righe cambiate e interruttori per ignorare spazi, maiuscole e righe vuote.](https://abox.tools/screens/compare-two-json-files/options.webp)

Sono questi a impedire che un confronto segnali ogni riga solo perché un file è stato salvato con una fine riga diversa.

## Cosa sistema la forma canonica del formattatore

Passare i due file per lo stesso formattatore con le stesse impostazioni è esattamente ciò che serve a un diff: una grafia per documento.

- **La stessa indentazione** mette ogni chiave sulla sua riga: il diff lavora allora riga per riga, e le sue marcature di parola possono indicare l'unico valore cambiato dentro una riga.
- **Le chiavi ordinate** mettono i due lati nello stesso ordine, e l'ordine smette di essere una differenza. Si ordina per come le chiavi si leggono, non per punti di codice — `item2` prima di `item10` — e si applica identico ai due lati.
- **Nient'altro si muove.** Questo formattatore tiene i numeri con le cifre che hai scritto e tiene le chiavi doppie invece di risolverle: portare in forma canonica non può inventare da sé una differenza. La [guida al formattatore](https://abox.tools/it/guide/formattare-json/) spiega perché è più raro di quanto dovrebbe.

Un'avvertenza onesta: l'uscita ordinata è il documento con le chiavi spostate. Se uno strumento a valle tiene all'ordine delle chiavi — pochi lo fanno, ma esistono — tratta le copie ordinate come la cosa confrontata, non come sostitute degli originali.

## Leggere il risultato, e portarselo via

Il confronto marca a sinistra le righe tolte, a destra quelle aggiunte, e dentro una riga cambiata evidenzia le parole che differiscono: su una forma canonica è tipicamente l'unico valore passato da `false` a `true`. Il mezzo immutato si ripiega in un conteggio, così una configurazione di duemila righe con tre ritocchi si legge come tre brevi passaggi.

Il download è una patch unificata, un `.patch`: il formato che la revisione del codice capisce. Descrive le forme canoniche, che è di solito quello che una revisione vuole comunque: la modifica, senza la riformattazione.

La stessa ricetta funziona per tutto il resto che le due pagine parlano. YAML e XML si portano in forma canonica allo stesso modo; e per due file della stessa forma da fonti diverse, gli interruttori di ignoranza del confronto — spazi, maiuscole, righe vuote — sono una versione più leggera della stessa idea.

![Due versioni di una configurazione JSON affiancate, con le righe cambiate evidenziate: un numero di versione, un numero di tentativi, un'opzione aggiunta e una regione aggiunta.](https://abox.tools/screens/compare-two-json-files/diff.webp)

Quattro differenze vere, e nient'altro segnalato. Leggerle è la metà facile; il lavoro l'hanno fatto le impostazioni qui sopra.

## Se lo fai ogni settimana

Formattare due volte, incollare due volte: i passi vivono su due pagine perché ogni pagina fa un lavoro, e ognuna può dimostrare da sola che niente di quello che hai incollato è andato da nessuna parte. Ma entrambe sono open source: licenza MIT, moduli ES senza dipendenze — il parser del formattatore tiene ordine delle chiavi e cifre, il diff è l'algoritmo di Myers — ciascuno con un README che lo spiega.

Se questo fa parte delle tue giornate, punta un agente di codice sul [repository](https://github.com/A-Box-of-Tools/website) e chiedigli una pagina a due caselle che porta in forma canonica mentre confronta: `parseJson`, `printJson` e `compareText` sono a tre import di distanza. I moduli sono scritti per essere letti, e portarseli via è esattamente ciò per cui la licenza esiste.
