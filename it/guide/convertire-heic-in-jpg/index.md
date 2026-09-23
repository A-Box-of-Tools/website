# La foto che il tuo telefono ha salvato, e il formato che non apre niente

Un iPhone salva le foto in HEIC, che è più leggero e migliore del JPEG e che moltissimo software si rifiuta ancora di aprire. Vediamo cos'è davvero quel formato, quanto costa all'immagine convertirlo, e perché quasi ogni convertitore vuole prima che tu glielo carichi.

[Apri Da HEIC a JPG](https://abox.tools/it/heic-in-jpg/): Le foto che fa un iPhone, in un formato che apre chiunque.

Ultimo aggiornamento 26 agosto 2026

## La risposta corta

Apri il [convertitore da HEIC a JPG](https://abox.tools/it/heic-in-jpg/), trascinaci dentro le foto e premi «Converti». Lascia il cursore della qualità dov'è e lascia spuntato «tieni la data, la fotocamera e le impostazioni», a meno che tu non abbia un motivo per non farlo. Ti tornano indietro dei JPEG, con un pulsante di download ciascuno, oppure uno zip se sono parecchi.

Mentre lo fai non viene caricato niente. Per questo lavoro in particolare è una cosa insolita, e il perché è la metà interessante di questa pagina.

![La scheda delle opzioni: un menu di formato su JPEG, un cursore di qualità a 85 e un interruttore per conservare data, fotocamera e luogo dell'originale.](https://abox.tools/screens/convert-heic-to-jpg/options.webp)

Tutta la conversione sta in questi tre. L'interruttore dei metadati è quello su cui vale la pena fermarsi, e la sezione più sotto dice perché.

## Cos'è davvero l'HEIC

L'HEIC non è propriamente un formato di immagine nel modo in cui lo è il JPEG. È un contenitore, la stessa struttura a box con cui è costruito un MP4, con dentro un fotogramma fermo di video **HEVC**. L'HEVC, chiamato anche H.265, è il codec che ha sostituito quello che usava la tua vecchia videocamera, ed è molto buono: una foto dell'iPhone in HEIC pesa all'incirca la metà della stessa foto in JPEG a parità di qualità.

Apple ci è passata con iOS 11, nel 2017, e l'ha messo come predefinito. Questo vuol dire che, a meno che qualcuno non sia entrato in Impostazioni e abbia scelto «Massima compatibilità», ogni foto che il suo telefono ha scattato in quasi un decennio è in un formato che:

- Windows non mostra in anteprima senza un'estensione dallo Store;
- quasi tutti i moduli di caricamento web rifiutano subito;
- moltissimo software da scrivania più vecchio non ha mai sentito nominare;
- e che nessun browser tranne Safari mostra.

La foto sta benissimo. È un file migliore di quanto sarebbe stato il JPEG. È semplicemente scritta in una lingua che quasi tutto il mondo non ha mai imparato.

## Perché lo apre solo Safari

È la parte che spiega ogni convertitore che tu abbia mai usato, quindi vale un paragrafo.

Decodificare l'HEVC richiede un decodificatore HEVC, e l'HEVC è brevettato. Le licenze sono amministrate da più di un consorzio di brevetti, e spedire un decodificatore vuol dire pagare qualcuno. I browser se la cavano appoggiandosi al sistema operativo, tanto che Chrome riproduce *video* HEVC su un computer il cui hardware ha già un decodificatore con licenza, ma quella strada è cablata per la riproduzione video e non per le immagini ferme. Quindi un HEIC consegnato a un `<img>` viene rifiutato, in Chrome, in Firefox e in Edge allo stesso modo, su qualunque sistema operativo.

Safari su hardware Apple è l'eccezione, perché macOS e iOS il decodificatore ce l'hanno e a Safari è concesso chiederlo. Dappertutto altrove l'immagine per il browser è semplicemente indecodificabile.

Il che lascia a un convertitore esattamente due possibilità, e la scelta tra le due è tutta la storia di questo tipo di strumento.

## Perché quasi ogni convertitore HEIC vuole un caricamento

Possibilità uno: mettere il decodificatore su un server. La foto viene caricata, decodificata su un computer che non hai mai visto, ricodificata come JPEG e rispedita indietro. È quello che fa quasi ogni «convertitore HEIC online gratuito», ed è il motivo per cui hanno tutti bisogno dei tuoi file. Non è pigrizia: il browser davvero non ce la fa da solo.

Su quanto costa vale la pena essere schietti. Le foto di un telefono sono i file più personali che quasi chiunque possieda, e un HEIC appena uscito da un iPhone porta con sé di solito le coordinate del posto in cui è stato scattato, precise a pochi metri, insieme alla data al secondo e a un identificatore della fotocamera. Caricare una cartella di quelle su un servizio gratuito vuol dire consegnare sia le immagini sia tutto questo. Cosa succede dopo lo regola un'informativa che non hai letto, su un server che non puoi ispezionare, in una giurisdizione che non hai scelto.

Possibilità due: mettere il decodificatore nella pagina. È quello che fa [questo](https://abox.tools/it/heic-in-jpg/). Si porta dietro `libheif`, compilato in WebAssembly, come file servito da questo sito: circa 1,4 MB, scaricati una volta e poi messi in cache. Il tuo browser lo esegue sul tuo dispositivo, sul tuo hardware, e la foto non va da nessuna parte. Carica la pagina una volta e puoi staccare del tutto la connessione: continua a funzionare, cosa che nessun convertitore che carica può fare, ed è la prova più semplice che ci sia.

L'1,4 MB è tutto il prezzo. Se sei su una connessione a consumo è un costo vero e vale la pena saperlo, ed è per questo che la pagina lo dice a voce alta invece di scaricarlo in silenzio.

## Quanto costa all'immagine la conversione

HEIC e JPEG sono codec diversi, quindi non c'è nessuna strada che eviti di decodificare l'immagine e ricodificarla, e quella seconda codifica è con perdita. In pratica però conta molto meno di quanto sembri:

- **Alla qualità 92**, da cui parte il convertitore, una fotografia è molto difficile da distinguere dall'originale a qualunque normale dimensione di visione. Le differenze si cercano nelle sfumature morbide, come un cielo terso, e di solito non si trovano.
- **Il JPEG sarà più pesante.** Di solito tra un terzo in più e il doppio, perché il JPEG è un codec del 1992 e l'HEVC no. È lo scambio: un file più pesante che apre chiunque.
- **Quello da evitare è convertire due volte.** Ogni codifica con perdita costa un po'. Converti dall'HEIC originale e non da un JPEG che qualcuno ha già fatto per te, e fallo una volta sola.

Se non vuoi nessuna perdita, nel menu dei formati c'è il PNG. Preparati al peso: una fotografia come PNG pesa di solito da cinque a dieci volte il JPEG, perché la compressione del PNG è stata pensata per le tinte piatte e i disegni al tratto, non per l'erba e la pelle.

## La data, la fotocamera e le coordinate

La lamentela abituale sui convertitori HEIC è che le foto tornano indietro avendo perso il giorno dello scatto, così un'intera vacanza di immagini finisce in fondo alla libreria sotto la data di oggi. Succede perché convertire passando per un canvas ti dà pixel e nient'altro, dato che un canvas tag non ne contiene, quindi se un convertitore non va a prendere i metadati a parte, quelli sono semplicemente spariti.

Lo strumento di qui copia il blocco EXIF fuori dall'HEIC e lo scrive nel JPEG, così la data sopravvive. C'è una casella, ed è spuntata di default. Toglila e il JPEG esce con l'immagine e nient'altro.

Prima di decidere, guarda l'elenco: la riga di ogni foto dice se il file porta con sé delle coordinate GPS, e lo dice prima che venga convertito qualcosa. Se le foto vanno in un posto pubblico, è quella la riga da leggere. Se vanno nella tua libreria, tenere i metadati è quasi certamente quello che vuoi.

Un tag viene cambiato qualunque cosa tu scelga, e vale la pena sapere perché. Un HEIC registra la propria rotazione in due posti, nel contenitore e nel blocco EXIF. Il decodificatore applica la rotazione del contenitore mentre decodifica, quindi i pixel che consegna sono già dritti. Se poi l'EXIF continuasse a dire «ruota questa di 90 gradi», un visualizzatore lo farebbe di nuovo e ogni foto verticale uscirebbe di traverso. Quindi il tag di orientamento viene messo su «dritto», e tutto il resto viene copiato esattamente come l'aveva scritto il telefono.

Se invece quello che vuoi è passare in rassegna i tag nel dettaglio, o toglierli da foto che sono già JPEG, è un altro lavoro e c'è [una guida apposta](https://abox.tools/it/guide/rimuovere-i-dati-exif-e-gps/).

## Cose su cui la gente inciampa

- **Un HEIC chiamato «.jpg».** Comunissimo: qualcosa lungo la strada l'ha rinominato senza convertirlo, ed è per questo che continua a non aprirsi. Ogni file trascinato sul convertitore viene identificato dai suoi primi byte invece che dal nome, quindi uno di questi funziona benissimo. È anche il motivo per cui a un file che è davvero un JPEG viene detto che lo è, invece di convertirlo in una copia di sé stesso.
- **Un file, parecchie immagini.** Una raffica o una Live Photo può contenere più di un fermo immagine. Vengono convertite tutte, e quelle in più vengono numerate dopo il nome originale. La metà video di una Live Photo è un file a parte che il telefono tiene accanto all'HEIC, quindi lì dentro non c'è niente da convertire.
- **L'AVIF non è l'HEIC.** Si somigliano, perché il contenitore è lo stesso e cambia il codec dentro, ma ogni browser attuale apre un AVIF nativamente, quindi non c'è niente da convertire e lo strumento te lo dice invece di fingere di lavorare.
- **Fermare il problema alla fonte.** Sul telefono: Impostazioni → Fotocamera → Formati → Massima compatibilità. Da lì in poi le foto nuove sono JPEG. Occupa più spazio e non tocca le foto che hai già, ma vuol dire non doverlo rifare mai più.
- **A volte la condivisione converte già.** Mandare una foto con AirDrop o per mail a un dispositivo non Apple spesso consegna un JPEG, perché iOS converte in uscita. Se una foto è arrivata comunque come HEIC, è passata da una strada che non lo faceva.

## Come capire se un convertitore sta caricando

Vale per qualunque strumento, non solo per questo, e richiede una quindicina di secondi.

1. Apri la pagina, poi apri gli strumenti per sviluppatori del tuo browser e vai al pannello Rete.
2. Converti una foto, e guarda. Uno strumento che decodifica sul tuo dispositivo in quel momento non fa proprio nessuna richiesta. Uno strumento che carica ne fa una della dimensione della tua foto, e la dimensione la vedi.
3. Oppure, più semplicemente: carica la pagina, stacca la connessione e prova a convertire qualcosa. Uno strumento che spediva via la tua foto per farla decodificare si ferma. Uno che si porta dietro il decodificatore no.

Il convertitore di qui è costruito per superare tutte e due le verifiche, e c'è una versione più lunga di questo ragionamento in [è sicuro caricare i propri file](https://abox.tools/it/guide/e-sicuro-caricare-i-propri-file/).
