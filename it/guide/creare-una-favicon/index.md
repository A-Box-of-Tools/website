# Come creare una favicon che si legga ancora a sedici pixel

Una favicon non è una piccola immagine del tuo logo. È una serie di immagini a dimensioni fisse, dentro un contenitore che quasi nessuno apre mai, e la più piccola di loro è quella che vedono davvero tutti. Vediamo le dimensioni che ti servono, i file che le stanno accanto, e cosa fare quando il tuo logo alla discesa non sopravvive.

[Apri Da immagine a ICO](https://abox.tools/it/creare-favicon/): Dentro un'immagine sola. Fuori tutte le dimensioni che chiedono un browser, Windows o un Mac.

Ultimo aggiornamento 26 agosto 2026

## La risposta corta

Apri [Da immagine a ICO](https://abox.tools/it/creare-favicon/), trascinaci dentro un'immagine quadrata di almeno 256 pixel, lascia il valore pronto su *favicon per un sito*, e scarica `favicon.ico`. Mettilo alla radice del tuo sito, in modo che risponda a `https://iltuosito.it/favicon.ico`. Quell'indirizzo lo chiede ogni browser, che il tuo HTML lo nomini o no, quindi non c'è nient'altro che tu debba fare per forza.

Tutto quello che segue è la parte che fa la differenza tra un'icona tecnicamente presente e una leggibile: quali dimensioni ci entrano, cosa chiedono invece gli iPhone e Android, e cosa fare quando il tuo logo non sopravvive a essere largo sedici pixel.

## Perché è una serie di dimensioni e non un'immagine sola

Un file `.ico` è un contenitore. Dentro ci sono parecchie immagini complete della stessa cosa a dimensioni diverse, e chi legge il file sceglie quella più vicina alla dimensione che gli serve.

Sembra ridondanza e non lo è. Un browser che disegna la tua icona a sedici pixel ha due possibilità: leggere una versione da sedici pixel che hai disegnato tu, oppure rimpicciolirne sul momento una più grande. La seconda è peggiore, e in modo visibile, perché un rimpicciolimento automatico di un logo dettagliato produce poltiglia, mentre una versione da sedici pixel che hai guardato è qualcosa che hai avuto occasione di semplificare. Tutto il motivo per cui il formato contiene parecchie dimensioni è darti quella occasione.

Per un sito la convenzione sono tre dimensioni, e ognuna ha un motivo:

- **⁦16×16⁩** è la scheda del browser, la barra degli indirizzi, il menu dei segnalibri. È quella che la gente vede. Se ne azzecchi una sola, azzecca questa.
- **⁦32×32⁩** è la barra dei segnalibri, un collegamento sul desktop di Windows al tuo sito, e quasi tutti i browser su uno schermo ad alta densità, che disegnano l'icona della scheda a partire da 32 e la rimpiccioliscono.
- **⁦48×48⁩** è la dimensione a cui Google legge l'icona di un sito per i risultati di ricerca, e la visualizzazione a icone medie di Windows.

Tutto quello che è più grande sta in un PNG accanto all'`.ico` e non dentro, per motivi che tornano qui sotto sui file per il cellulare.

![L'elenco delle preimpostazioni con le dimensioni che ciascuna comprende: sedici, trentadue e quarantotto pixel per un'icona di sito, e un riepilogo di cosa finirà nel file.](https://abox.tools/screens/make-a-favicon/preset.webp)

Un .ico è un contenitore, e questo è l'elenco di cosa ci va dentro. La preimpostazione è una scorciatoia per l'insieme che un browser chiede davvero.

## Il problema dei sedici pixel

È la parte di cui nessuno ti avverte. Sedici pixel sono circa quattro millimetri su uno schermo normale: una griglia di 256 punti in tutto, meno delle lettere di questa frase. Quasi niente di quello che è stato progettato per funzionare su un'insegna, un biglietto da visita o l'intestazione di un sito sopravvive a essere ridotto a quello.

Quello che sparisce, in ordine:

- **Il testo.** Un logotipo rimpicciolito dentro un quadrato è alto circa tre pixel. Non diventa testo piccolo, diventa una barra grigia. È per questo che quasi ogni azienda che ha un simbolo oltre al nome usa il solo simbolo come favicon, e perché quelle che un simbolo non ce l'hanno usano una sola lettera.
- **Le linee sottili.** Un bordo da un pixel su un logo da 512 pixel è un trentaduesimo di pixel a sedici. Si disegna come una foschia grigia lungo il bordo, oppure sparisce.
- **Sfumature e ombre.** Non c'è spazio per una transizione, e un'ombra portata morbida diventa una frangia sporca.
- **Il dettaglio dentro il dettaglio.** L'icona di un documento con sopra della scrittura diventa un rettangolo con una macchia.

La soluzione non è un'impostazione, è un disegno diverso: un marchio semplificato con una o due forme, molto contrasto, e nessun testo oltre a un singolo carattere. Disegna quella versione a 32 o 48 pixel di proposito, e usala come sorgente.

Quello che uno strumento può fare è mostrarti il problema prima che tu lo pubblichi. L'anteprima in [Da immagine a ICO](https://abox.tools/it/creare-favicon/) disegna ogni dimensione alla sua dimensione reale sullo schermo, che è l'unico modo di giudicare questa cosa: un'icona da sedici pixel mostrata a sessantaquattro viene bene e non ti dice niente.

![Una striscia di anteprima con lo stesso marchio disegnato a sedici, trentadue, quarantotto, sessantaquattro e centoventotto pixel.](https://abox.tools/screens/make-a-favicon/sizes.webp)

La versione da sedici pixel, accanto a quella che hai disegnato. È questa immagine a decidere se il marchio andava semplificato.

## Il tuo logo non è quadrato. Riempire o ritagliare?

Un'icona è sempre quadrata, e quasi nessun logo lo è, quindi qualcosa deve succedere. Le risposte sono tre, e non sono ugualmente buone.

**Il riempimento** tiene tutta l'immagine e ci mette dello spazio sopra e sotto. È il comportamento prudente predefinito, ed è la scelta sbagliata per un logotipo largo: far stare in un quadrato una cosa larga tre volte più di quanto sia alta la lascia a occupare un terzo dell'altezza, che a sedici pixel sono cinque pixel di logo e undici di niente.

**Il ritaglio al centro** prende il quadrato più grande dal mezzo. Per un blocco fatto da un simbolo con accanto il nome dell'azienda, spesso taglia dritto attraverso tutti e due. Meglio ritagliare prima tu la sorgente, fino al solo simbolo, e convertire quello.

**Lo stiramento** schiaccia l'immagine per farla entrare. Non c'è quasi nessuna situazione in cui sia giusto, ed è proposto soprattutto perché lo strumento non lo faccia in silenzio.

La risposta generale per un logo largo: non convertire il logo. Converti la parte di lui che funziona da sola.

## Trasparente o sfondo pieno?

Per un sito, trasparente è di solito la scelta giusta. Le schede dei browser sono grigie, bianche o quasi nere a seconda del browser e del tema, e un'icona trasparente sta bene su tutte. Un'icona con lo sfondo bianco dipinto dentro è un rettangolo bianco in una barra delle schede scura.

Ci sono due eccezioni da conoscere:

- **Un logo scuro e nient'altro** sparisce in modalità scura. Se il tuo marchio è per natura nero su bianco, dagli uno sfondo colorato invece che trasparente, oppure un contorno chiaro.
- **L'icona Apple touch deve essere opaca.** iOS la disegna sulla propria tessera arrotondata e rende la trasparenza come nero. Qualunque strumento produca quel file dovrebbe appiattirlo per te; quello di qui lo fa, sul bianco per impostazione predefinita.

## I file che servono a un sito e che non sono l'.ico

`favicon.ico` copre i browser e Windows. Non copre i telefoni, ed è qui che quasi tutte le serie di icone fatte in casa si fermano troppo presto. Ci sono altre tre piattaforme che chiedono i propri file, con nomi propri, e nessuna di loro va a guardare dentro un `.ico`:

- **iOS** legge `apple-touch-icon.png` a ⁦180×180⁩ quando qualcuno aggiunge il tuo sito alla schermata Home. Senza, iOS usa uno screenshot della pagina, che sembra un errore.
- **Android e ogni richiesta di installazione** leggono un manifest per web app, `site.webmanifest`, che punta a PNG da 192 e 512 pixel. Il 512 è anche quello che una web app mostra sulla schermata di avvio.
- **Una tessera del menu Start di Windows** legge `browserconfig.xml`, che punta a un PNG da ⁦150×150⁩. È la meno importante delle tre, e sono quattro righe di XML.

Ce n'è un'altra facile da sbagliare: i launcher Android ritagliano un'icona adattiva nella forma che piace al telefono, che sia un cerchio, un quadrato stondato o un rettangolo arrotondato, e solo l'80% centrale dell'immagine è garantito che sopravviva. Un'icona disegnata da bordo a bordo perde gli angoli. È questo che è un'icona *maskable*: la stessa immagine disegnata di proposito piccola dentro il quadrato, dichiarata a parte nel manifest.

Spuntando il pacchetto per il sito in [Da immagine a ICO](https://abox.tools/it/creare-favicon/) ottieni tutti questi, il manifest, e il blocco di HTML che ci punta. Una cosa che quel blocco lascia fuori di proposito è un `<link>` per `favicon.ico`: quell'indirizzo i browser lo chiedono da soli, e nominarlo anche lì fa recuperare due volte lo stesso file.

## L'icona di un'applicazione Windows è un'altra serie

Se l'icona è per un programma e non per un sito, le dimensioni cambiano. Quello che contiene l'`app.ico` predefinito di Visual Studio è 16, 32, 48 e 256: le tre dimensioni della shell più quella grande da cui attingono il menu Start e le icone molto grandi di Esplora file.

Su uno schermo ad alta densità Windows chiede anche 20, 24, 40, 64 e 96, e se mancano se le ricava dalla dimensione più vicina che ha. Se la cosa conti dipende dalla tua icona: una forma piatta sopravvive al ricampionamento, una dettagliata no. Aggiungerle raddoppia all'incirca il file, che per un'applicazione non è proprio niente, perché il calcolo è del tutto diverso da quello di una favicon, che viene recuperata da ogni visitatore.

Un'altra cosa sulla dimensione: è nella voce da 256 che stanno i byte. Non compressa pesa 264 KB da sola; conservata come PNG dentro l'icona di solito sta sotto i 30. Le voci PNG sono leggibili da Windows Vista in poi, quindi l'unico motivo per evitarle è del software davvero più vecchio di quello, oppure un programma di installazione o uno strumento incorporato che analizza le icone per conto suo.

## Un Mac legge tutt'altro file

Se l'icona è per un'applicazione Mac e non per una Windows, niente di quanto sopra vale, perché macOS l'`.ico` non lo legge proprio. Legge l'`.icns`, che è la stessa idea in un involucro diverso, cioè parecchie dimensioni in un contenitore, con tre differenze da conoscere.

- **Le dimensioni sono fisse.** Apple pubblica dieci slot e non c'è niente da scegliere: 16, 32, 64, 128, 256, 512 e 1024 pixel, con 32, 256 e 512 che compaiono due volte perché ognuna è insieme una dimensione a sé e la versione Retina della dimensione sotto.
- **Arriva a 1024.** Un `.ico` si ferma a 256, ed è per questo che il file icona di un Mac pesa qualche centinaio di kilobyte e una favicon quindici. Per un'applicazione consegnata una volta sola non è niente: è solo una favicon a essere recuperata da ogni visitatore.
- **A 1024 pixel il tuo disegno deve reggere.** I due problemi sono i due estremi della stessa immagine: una favicon deve funzionare quando è minuscola, e l'icona di un Mac deve reggere quando è enorme. Un logo esportato a 512 e ingrandito a 1024 si vede morbido su uno schermo Retina, e l'App Store non lo accetta.

Per usarne uno: il bundle di un'applicazione lo tiene in `TuaApp.app/Contents/Resources/` e lo nomina in `Info.plist`. Per una cartella o un'immagine disco, seleziona l'`.icns` nel Finder, premi Comando-C, poi apri Ottieni informazioni sulla cosa che vuoi cambiare, clicca la piccola icona in alto a sinistra e premi Comando-V.

Spuntando *icona macOS* in [Da immagine a ICO](https://abox.tools/it/creare-favicon/) ne viene scritto uno, con o senza il file Windows accanto. Qualunque cosa esca su tutte e due le piattaforme li vuole tutti e due, ed entrambi vengono disegnati dalla stessa immagine nello stesso passaggio.

## Controllare che abbia funzionato

I browser tengono in cache le favicon più tenacemente di quasi ogni altra cosa, quindi «l'ho caricata e non è cambiato niente» è di solito una cache e non un errore. Ci sono due cose da provare prima di rimetterti a modificare file:

- Apri direttamente `https://iltuosito.it/favicon.ico`. Se il file si scarica c'è, e stai guardando una cache. Se ottieni un 404, non è alla radice.
- Carica il sito in una finestra privata, che di solito ha una cache delle icone tutta sua.

Su Windows, un `.ico` si controlla mettendolo in una cartella e facendo passare Esplora file per le sue dimensioni di visualizzazione: piccole, medie, grandi e molto grandi disegnano voci diverse dello stesso file, così vedi ciascuna come la vedrà il sistema.

Su un Mac, un `.icns` si apre in Anteprima, che elenca ogni slot di lato, e lo stesso trucco funziona nel Finder: mettilo in una cartella e trascina il cursore della dimensione nelle opzioni di visualizzazione per guardarlo passare da un'immagine all'altra di quelle che contiene.

## Niente di tutto questo ha bisogno di un caricamento

Ridimensionare un'immagine è una cosa che ogni browser fa da anni, e un `.ico` è un'intestazione da sei byte, sedici byte per immagine, e poi le immagini. Non c'è nessun passaggio, nel farne uno, che richieda un server, e lo strumento di qui un server non lo usa: la `Content-Security-Policy` della pagina elenca tutti gli indirizzi che può contattare, e nessuno di quelli appartiene a questo sito.

Ed è una cosa a cui qui vale la pena tenere più del solito. Un logo consegnato a un generatore di favicon gratuito è, molto spesso, un marchio non ancora annunciato, perché l'icona è una delle prime cose che si fanno e una delle ultime che si annunciano. Se preferisci verificare invece che crederci, carica la pagina, stacca la connessione e fanne una lo stesso. [È sicuro caricare i propri file sui convertitori online?](https://abox.tools/it/guide/e-sicuro-caricare-i-propri-file/) propone altre tre verifiche che puoi fare su qualunque strumento.
