# Come unire delle immagini in un unico PDF

Qualcuno ti ha chiesto «un PDF solo» e tu hai undici fotografie di fogli di carta. Vediamo quali scelte cambiano davvero il risultato, cioè la dimensione della pagina, l'ordine, la qualità e quello che il documento dice di te, e quali invece puoi ignorare.

[Apri Immagini in PDF](https://abox.tools/it/immagini-in-pdf/): Metti le tue foto dentro un documento solo.

Ultimo aggiornamento 26 agosto 2026

## La risposta corta

Apri [Immagini in PDF](https://abox.tools/it/immagini-in-pdf/), trascinaci dentro le foto, sposta le tessere finché l'ordine non è giusto, e crea il documento. Le impostazioni predefinite sono quelle che vuole quasi chiunque: pagine A4, un margine piccolo, e le fotografie copiate dentro senza essere ricodificate.

Le cose su cui vale la pena pensarci due volte sono quattro: l'ordine, la dimensione della pagina, l'impostazione della qualità e quello che il documento finito dice di te. Le trovi qui sotto nell'ordine in cui, di solito, vanno storte.

![Un'anteprima della prima pagina del PDF, con accanto un riepilogo: quattro pagine, formato pagina uguale a ciascuna immagine e quattro immagini su quattro copiate senza ritocchi.](https://abox.tools/screens/combine-images-into-a-pdf/preview.webp)

L'anteprima è il controllo che conta: è la pagina finita, nella forma che avrà la pagina finita.

## Sistema l'ordine prima di ogni altra cosa

L'ordine delle pagine è di gran lunga la cosa che si sbaglia più spesso, perché i nomi dei file si ordinano in modi che nessuno si aspetta. `IMG_2.jpg` viene dopo `IMG_10.jpg` in un ordine alfabetico, perché il confronto è carattere per carattere e `1` viene prima di `2`. Una cartella di scansioni chiamate da `pagina1` a `pagina12` arriverà nell'ordine sbagliato in quasi qualunque strumento.

Per le fotografie ordinare per data di scatto di solito è più affidabile, perché le pagine le hai fotografate nell'ordine in cui stavano. In ogni caso, controlla le tessere prima di premere il pulsante, invece di controllare il PDF dopo.

## La qualità: la parte che quasi tutti gli strumenti sbagliano in silenzio

Un PDF sa portare direttamente i dati JPEG. È una proprietà del formato: i byte compressi di un JPEG si possono lasciar cadere nel documento così come sono, e il lettore li decodifica come farebbe un browser.

Conta perché vuol dire che una fotografia non deve perdere niente entrando in un PDF. Non viene mai decodificata e non viene mai ricompressa, e l'immagine nel documento è bit per bit l'immagine nel tuo file. Molti strumenti però la ricodificano lo stesso, perché è più semplice disegnare tutto su un canvas e codificare in modo uniforme, e il risultato è una generazione di qualità persa per niente.

Gli altri formati non possono viaggiare così. PNG, WebP, HEIC e compagnia non hanno un filtro corrispondente nel PDF, quindi vanno convertiti. Su come, la scelta è tua:

- **Ricodifica come JPEG** (il comportamento predefinito). File più leggero, un piccolo costo di qualità, ed è la risposta giusta per le fotografie.
- **Senza perdita.** Conserva i pixel esatti al prezzo di un documento molto più pesante. È la risposta giusta per screenshot, schemi e qualunque cosa con dentro testo o bordi netti, dove gli artefatti del JPEG si vedono subito.

## La dimensione della pagina, e quando «adatta all'immagine» è meglio

Una dimensione di pagina standard, cioè A4, Letter, Legal, A3, A5 o Tabloid, mette ogni immagine su una pagina di quella misura, scalata per stare dentro il tuo margine. Usane una quando il documento andrà in stampa, o quando qualcuno di ufficiale lo archivierà.

«Esattamente la dimensione di ogni immagine» rende invece ogni pagina uguale alla sua immagine, quindi non c'è spazio bianco e non c'è nessuna scalatura. Usalo quando il PDF è un contenitore di immagini invece che un documento: un portfolio, una serie di screenshot, un fumetto. Stampato però viene male, perché ogni pagina ha una dimensione diversa.

Un margine vale la pena averlo su qualunque cosa verrà stampata. Le stampanti di casa non sanno stampare fino al bordo del foglio, e una fotografia messa da bordo a bordo esce tagliata.

### Pagine verticali da fotografie orizzontali

Se hai fotografato dei fogli di carta con il telefono tenuto di traverso, ogni immagine sarà orizzontale e starà piccola in mezzo a una pagina verticale. La soluzione è ruotarne ciascuna di un quarto di giro prima di costruire il documento, ed è una scelta per singola immagine e non generale, perché di solito qualcuna è entrata dal verso giusto.

![Le impostazioni di pagina: formato, orientamento, come l'immagine incontra la pagina, il margine e il colore di sfondo.](https://abox.tools/screens/combine-images-into-a-pdf/layout.webp)

Formato e adattamento decidono insieme se una foto si vede intera o ritagliata sulla carta. L'opzione che ricalca ogni immagine evita del tutto la domanda.

## Cosa dice di te il PDF finito

Un PDF porta con sé un blocco di informazioni sul documento: autore, produttore, data di creazione, a volte il titolo. A seconda di cosa l'abbia scritto, ci possono finire il nome del tuo account, il nome del tuo dispositivo e l'ora esatta in cui l'hai fatto.

Vale la pena pensarci, perché un PDF è una cosa che le persone mandano ad altre persone: una candidatura, una richiesta di rimborso, un documento per il padrone di casa. I metadati viaggiano insieme a lui, e qualunque lettore può mostrarli.

Lo strumento di qui quel blocco lo lascia vuoto tranne che per il proprio nome: nessun nome di file, nessun nome di dispositivo, nessun nome utente, e nessuna data di creazione se non spunti la casella apposta. Se usi un altro strumento, vale la pena aprire una volta le proprietà del risultato per vedere cosa ci ha scritto.

Una cosa a margine, sulle immagini stesse. Se le tue fotografie portano con sé tag EXIF e GPS, quello che gli succede dipende dalla strada: un JPEG copiato dentro senza ricodifica si tiene quello che aveva, mentre un'immagine che viene ricodificata perde i tag come effetto collaterale. Se la cosa ti interessa, ripulisci prima le foto con il [visualizzatore e rimozione EXIF](https://abox.tools/it/rimuovere-dati-exif/), e [la sua guida](https://abox.tools/it/guide/rimuovere-i-dati-exif-e-gps/) spiega cosa c'è là dentro.

## Se il PDF esce troppo pesante

Le fotografie da telefono sono pesanti, e venti di loro fanno un documento che la mail rifiuterà. Ci sono tre cose da provare, in ordine:

**Rimpicciolisci il lato più lungo.** La fotografia da 4000 pixel di un foglio di carta porta molto più dettaglio di quanto ne userà qualunque lettore o stampante. Portare il lato lungo a qualcosa come 2000 pixel di solito divide il file per quattro e non cambia niente che qualcuno possa vedere su una pagina.

**Usa il JPEG invece del senza perdita** per qualunque cosa sia fotografica. Il senza perdita è la risposta giusta per gli schemi e quella sbagliata per la foto di una pagina.

**Comprimi il documento finito.** Il [compressore di PDF](https://abox.tools/it/comprimere-pdf/) lavora su quanto grande viene disegnata ogni immagine sulla pagina invece che sul suo numero di pixel, che è poi la misura che conta; [la sua guida](https://abox.tools/it/guide/ridurre-le-dimensioni-di-un-pdf/) spiega quanto costa.

Nello strumento non c'è nessun limite al numero di immagini che puoi usare. Il tetto pratico è la memoria del tuo dispositivo, perché il documento finito viene assemblato lì prima che tu lo scarichi: la prima cosa a sentirlo è qualche centinaio di foto da telefono a piena risoluzione, e rimpicciolire il lato più lungo sposta quel tetto parecchio più in là.

## Cosa questo non ti darà

Un PDF fatto di fotografie è un PDF pieno di immagini. Le parole che ci sono dentro non sono testo: non le puoi cercare, non le puoi copiare, e uno screen reader non le può leggere. È una proprietà di quello da cui sei partito, non della conversione.

Se ti serve testo cercabile ti serve l'OCR, che è un altro lavoro. E se il documento originale esiste ancora come documento da qualche parte, esportarlo direttamente in PDF batterà sempre il fotografarlo: più leggero, più nitido, cercabile.

## Perché questo non ha bisogno di un caricamento

Scrivere un PDF vuol dire scrivere un file strutturato: un'intestazione, un insieme di oggetti, una tabella di riferimenti incrociati. Non c'è niente lì dentro che un browser non sappia fare, e niente in questo lavoro che richieda alle immagini di andare da qualche parte.

Ed è una cosa a cui qui vale la pena tenere, per quello che la gente mette in questi documenti. Documenti d'identità, estratti conto, referti medici, contratti firmati: tutto il motivo per cui una persona sta facendo un PDF è di solito che lo sta mandando a un'istituzione. Lo strumento di qui non ha nessuna funzione di rete, e la `Content-Security-Policy` della pagina elenca tutti gli indirizzi che può contattare, nessuno dei quali appartiene a questo sito.

[È sicuro caricare i propri file sui convertitori online?](https://abox.tools/it/guide/e-sicuro-caricare-i-propri-file/) spiega come verificarlo da solo, qui come altrove.
