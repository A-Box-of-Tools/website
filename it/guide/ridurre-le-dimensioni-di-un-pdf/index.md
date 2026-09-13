# Come alleggerire un PDF, e perché alcuni non si rimpiccioliscono

Un PDF che non entra nel limite di una mail è quasi sempre un PDF pieno di immagini. Vediamo come capire se il tuo lo è, quanto costa comprimerlo, e perché qualunque strumento prometta una percentuale fissa il tuo file non l'ha guardato.

[Apri Compressore di PDF](https://abox.tools/it/comprimere-pdf/): Alleggerisci un documento senza spedirlo da nessuna parte.

Ultimo aggiornamento 26 agosto 2026

## La risposta corta

Apri il [compressore di PDF](https://abox.tools/it/comprimere-pdf/), trascinaci dentro il documento, e guarda cosa ti dice prima di cambiare qualunque cosa. Legge il file e ti mostra dove sta davvero il peso: immagini, caratteri, testo e disegno, più tutto quello a cui nel documento non fa più riferimento nessuno. Quella schermata di solito risponde già alla domanda.

Se quasi tutto il peso sono immagini, puoi aspettarti un grande risparmio. Se sono caratteri e testo, no, e non ci riesce nessuno strumento. Quale dei due hai in mano è tutta la storia, e vale dieci secondi di sguardo.

## Dove sta davvero il peso di un PDF

Un PDF è un contenitore per parecchi tipi diversi di cosa, e non si comprimono allo stesso modo.

- **Immagini.** Fotografie e scansioni. Quasi sempre il grosso di un PDF pesante, e l'unica parte con vero spazio dentro.
- **Caratteri incorporati.** Un carattere intero può pesare centinaia di kilobyte; un sottoinsieme dei soli segni davvero usati pesa molto meno. In ogni caso, sono già stati compressi da quello che ha prodotto il file.
- **Testo e disegno vettoriale.** Istruzioni invece di pixel: traccia questa linea, metti questa parola qui. Già compatti, e già compressi.
- **Oggetti a cui non punta più niente.** I PDF li accumulano. Modificare un documento spesso aggiunge la modifica in coda invece di riscrivere il file, quindi una vecchia versione di una pagina può restare lì dentro all'infinito. Reimpacchettare il file li butta.

Quindi i due documenti che la gente porta a un compressore di PDF hanno prospettive completamente diverse. Un documento scansionato è in sostanza una pila di fotografie, e di solito esce dal 60 al 90% più leggero. Un contratto, una tesi o un rapporto esportato sono invece testo, disegno e caratteri, tutti già compressi dal software che li ha scritti, e lì il risparmio è di solito di qualche punto percentuale, che viene dal reimpacchettamento e dal buttare quello a cui nessuno fa più riferimento.

Qualunque strumento prometta «fino al 90% più leggero» senza aver guardato il tuo file ti sta citando il caso migliore del primo tipo per il secondo.

![La scheda dell'inventario: un verdetto che dice che la maggior parte del file sono immagini, una barra che scompone la dimensione e un elenco di quanto pesa ciascuna parte.](https://abox.tools/screens/make-a-pdf-smaller/inventory.webp)

Dove sta davvero la dimensione, prima che si cambi qualcosa. Quasi ogni PDF grosso lo è per il motivo che mostra questa barra.

## Cosa c'entrano i DPI

Un PDF non contiene solo un'immagine: registra anche quanto grande viene disegnata quell'immagine sulla pagina. E questo ti dà qualcosa di più utile del numero di pixel, cioè la risoluzione effettiva.

Una scansione larga 4000 pixel stesa su venti centimetri di carta porta circa 500 pixel per pollice. Uno schermo ne mostra un centinaio. Una buona stampante da ufficio lavora a 300 e di molto di più non sa farsene. Tutto quello che sta sopra è dettaglio che niente, nel futuro del documento, mostrerà mai, ed è di solito la maggior parte del file.

È per questo che un compressore di PDF sensato chiede dei DPI invece di una percentuale di qualità. Butta per primi i pixel sopra la tua cifra, perché quelli non costano niente che qualcuno possa vedere, e solo dopo comincia a spendere qualità vera.

A occhio e croce: **150 DPI** per un documento che verrà letto sullo schermo, **⁦200–300⁩** per qualcosa che verrà stampato, **⁦72–100⁩** per una bozza che nessuno terrà. Misurare su quanto grande viene disegnata l'immagine è anche il motivo per cui un logo messo piccolo non finisce trattato come una scansione a pagina intera: il logo è già vicino alla propria risoluzione effettiva, e non c'è niente da prendere.

![La scheda delle impostazioni: preimpostazioni, una risoluzione in DPI, un cursore di qualità e un interruttore per togliere i metadati, con una stima di quanto peserà il risultato.](https://abox.tools/screens/make-a-pdf-smaller/settings.webp)

Le due manopole che contano sono la risoluzione e la qualità. Cosa fa ciascuna a una pagina di testo e a una di fotografie è l'argomento di questa sezione.

## Cosa dovrebbe e cosa non dovrebbe toccare una compressione

Le immagini vengono ricodificate, quindi quelle perdono un po'. Tutto il resto non dovrebbe essere toccato affatto, e vale la pena controllare che lo strumento che usi la regola la rispetti:

- **Il testo resta testo.** Selezionabile, cercabile, copiabile. Un compressore che appiattisce le pagine in immagini produrrà un file molto leggero e ti distruggerà il documento: non lo puoi cercare, gli screen reader non lo possono leggere, e indietro non si torna.
- **I caratteri restano interi.** Sostituire i caratteri cambia come si presenta il documento sul dispositivo di qualcun altro, che è l'unica cosa che il PDF esiste per impedire.
- **Il disegno vettoriale viene copiato tale e quale.** È già leggero, e rasterizzarlo lo renderebbe insieme più pesante e peggiore.
- **Moduli, link, segnalibri, struttura di accessibilità e allegati passano dall'altra parte.** Sono cose facili da perdere in una riscrittura e di cui raramente ci si accorge, finché a qualcuno non ne serve una.

C'è poi una regola collegata che un compressore dovrebbe seguire e che molti non seguono: se ricodificare un'immagine non la fa uscire davvero più leggera dell'originale, i byte originali vanno rimessi dentro. Peggiorare un'immagine senza risparmiare niente è il caso di pura perdita, e su immagini che erano già compresse bene succede più spesso di quanto si creda.

## Le immagini che non si possono comprimere

Alcune immagini dentro un PDF vengono saltate, e un buon strumento le nomina invece di lasciarle fuori dall'aritmetica in silenzio:

- **Immagini JPEG 2000, JBIG2 e in codifica fax (CCITT).** Nessun browser si porta dietro un decodificatore per nessuna delle tre, quindi passano intatte. Le ultime due sono in bianco e nero e di solito sono già vicine al minimo.
- **Immagini CMYK.** Lasciate stare di proposito, perché ricodificarle rischia di spostare i colori che produrrebbe una stampante, che è una cosa sorprendente da fare a un documento che qualcuno sta per stampare.

## Cose da provare prima di comprimere

A volte il file è pesante per un motivo a cui la compressione è la risposta sbagliata.

**È stato scansionato quando non ce n'era bisogno?** Un documento stampato e poi scansionato è una pila di fotografie di testo. Se l'originale esiste ancora da qualche parte come documento, esportarlo in PDF produrrà un file di una frazione del peso, che per giunta è cercabile.

**È stato esportato con impostazioni da stampa?** I programmi di videoscrittura e di grafica esportano spesso in qualità di stampa per impostazione predefinita. Riesportare per lo schermo dal file sorgente di solito batte il comprimere l'esportazione.

**Deve per forza essere un file solo?** Il limite di una mail vale per messaggio. Dividere un documento da 200 pagine in capitoli a volte è la soluzione onesta.

## I file cifrati, e perché un compressore dovrebbe rifiutarli

Un PDF protetto da password lo strumento di qui lo rifiuta, ed è una scelta voluta e non una funzione mancante. Vale anche quando la password è vuota, che è poi il modo in cui salvano moltissimi scanner e fotocopiatrici.

Togliere la protezione a un documento è un lavoro diverso dal comprimerlo. Uno strumento che lo facesse in silenzio starebbe facendo qualcosa che non gli hai chiesto, a un file che qualcuno aveva deliberatamente bloccato, e ti restituirebbe una copia che non ha più la proprietà che gli si voleva dare. Se è quello che vuoi, togli prima tu la protezione, di proposito.

## Controllare il risultato

Aprilo. Guarda le immagini a ingrandimento pieno, controlla che il testo sia ancora selezionabile, e verifica il numero di pagine.

L'ultima cosa lo strumento di qui la fa al posto tuo, prima di offrirti il file: riapre il documento che ha appena scritto e ne conta le pagine, sul tuo dispositivo. Scrive anche in PDF 1.5, che ogni lettore uscito dal 2003 in poi capisce, quindi «si apre sul mio computer» è un ragionevole surrogato di «si apre sul loro».

## Perché questo non ha bisogno di un server

Comprimere un PDF sembra un lavoro da server, e per quasi tutta la vita del web lo è stato. Quello che comporta davvero è analizzare la struttura del file, trovare i flussi delle immagini, decodificarli e ricodificarli con i codec che un browser si porta già dietro, e riscrivere il documento. Tutto questo ormai gira in un browser.

E conta per questo tipo di file più che per quasi tutti gli altri, per quello che la gente ci comprime: contratti, referti medici, estratti conto, documenti d'identità, dichiarazioni dei redditi. Lo strumento di qui non ha proprio nessuna funzione di rete, e la `Content-Security-Policy` della pagina elenca tutti gli indirizzi che può contattare, nessuno dei quali appartiene a questo sito. Caricala, stacca la spina, e comprimi qualcosa lo stesso.

[È sicuro caricare i propri file sui convertitori online?](https://abox.tools/it/guide/e-sicuro-caricare-i-propri-file/) propone altre tre verifiche come quella.
