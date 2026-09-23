# Come scansionare un documento col telefono

Qualcuno ti ha chiesto di «scansionare e rispedire» un modulo, e tu hai un telefono e non hai uno scanner. La distanza tra la fotografia di una pagina e la scansione di quella pagina è più piccola di quanto sembri, e non riguarda soprattutto l'inclinazione — ecco che cosa le separa davvero, e che cosa fare per ogni pezzo.

[Apri Scanner per documenti](https://abox.tools/it/scansionare-documenti/): Fotografa la pagina. Ti torna indietro qualcosa che sembra scansionato.

Ultimo aggiornamento 26 agosto 2026

## La risposta breve

Metti la pagina su qualcosa che non sia dello stesso colore della pagina, mettiti sopra, riempi l'inquadratura e scatta una fotografia. Poi apri lo [Scanner per documenti](https://abox.tools/it/scansionare-documenti/), controlla i quattro angoli che ha trovato, scegli «colore, uniformato» o «bianco e nero», e salva il PDF.

Il lavoro è tutto qui. Il resto spiega che cosa sta sistemando ognuno di quei passaggi, perché sapere quale pezzo fa che cosa è quello che ti permette di capire, in tre secondi, se la cosa che stai per mandare verrà accettata.

## Che cosa separa davvero una foto da una scansione

Tre cose, e non contano allo stesso modo.

- **L'inclinazione.** Una fotografia è scattata da dove stavi tu, quindi la pagina è un quadrilatero e non un rettangolo. È quella che notano tutti ed è la più facile da annullare.
- **La luce.** Uno scanner trascina una luce uniforme lungo la pagina. Una stanza no: c'è una zona chiara sotto la lampada, un angolo in penombra lontano da lì, e molto spesso la tua stessa ombra su un lato. È questa che fa sembrare una fotografia una fotografia, ed è quella che si cerca di sistemare con il «contrasto automatico», che la peggiora.
- **La dimensione.** La fotografia da dodici megapixel di una pagina sono dai tre ai cinque megabyte. Venti fotografie così sono un documento che rimbalzerà su metà dei server di posta a cui verrà mandato.

## Scattare la foto

Cinque cose, in ordine di quanta differenza fanno:

- **Riempi l'inquadratura.** È l'unica che non si può sistemare dopo. Un dettaglio che nella fotografia non c'era non è nel file, e una pagina fotografata da metà stanza è una pagina che nessuno può leggere a nessuna risoluzione. Avvicinati invece di zoomare: a meno che il telefono non passi a un secondo obiettivo più lungo, zoomare è un ritaglio dello stesso sensore — butta via esattamente i pixel che stai cercando di tenere.
- **Mettila su qualcosa di un altro colore.** Una pagina bianca su una scrivania bianca non ha quasi nessun bordo da far trovare a qualcuno — né al software, né a te, quando poi ti tocca trascinare gli angoli a mano. Un tavolo scuro, un libro, un cappotto: qualsiasi cosa.
- **Non metterti tra la pagina e la luce.** La tua stessa ombra sulla pagina è il singolo motivo più comune per cui una scansione fatta col telefono viene male. Girati di novanta gradi e sparisce.
- **Lascia che metta a fuoco, poi stai fermo.** Il mosso non lo recupera nessuno strumento, e nemmeno una messa a fuoco sbagliata. Tocca la pagina sullo schermo, aspetta che si assesti, poi premi il pulsante.
- **Fai entrare tutta la pagina, angoli compresi.** Non perché gli angoli siano preziosi, ma perché sono quello su cui viene misurato il raddrizzamento. Una pagina che esce dal bordo dell'inquadratura funziona lo stesso — il bordo della fotografia fa le veci del bordo della pagina — ma una pagina con tre angoli nell'inquadratura e uno tirato a indovinare è una pagina che verrà fuori leggermente sbagliata.

## Raddrizzare: perché la forma conta più dell'inclinazione

Annullare l'inclinazione è un pezzo di aritmetica ben capito. Quattro angoli di un rettangolo visti da un punto qualsiasi determinano la trasformazione che li rimette a posto, e applicarla a ogni pixel dà una pagina piatta. Qualsiasi strumento che dice di raddrizzare una pagina fa quello.

La parte che va storta in silenzio è *quanto grande* debba essere la pagina piatta. Il metodo ovvio è misurare i lati del quadrilatero e usarne il rapporto — e una fotografia scattata di sbieco accorcia il lato lontano, quindi un foglio A4 viene fuori visibilmente tozzo. Continua a sembrare una scansione. Semplicemente ogni riga di testo ha l'altezza sbagliata, e sullo schermo non c'è niente che lo dica.

La risposta migliore è che l'informazione la porta la prospettiva stessa: a patto solo che la fotocamera sia una normale, la fotografia di un rettangolo basta per ricavare sia le proporzioni vere del rettangolo sia la lunghezza focale della fotocamera. Lo [Scanner per documenti](https://abox.tools/it/scansionare-documenti/) che sta qui fa questo, e poi ti dice che forma è venuta fuori la pagina e se è un foglio standard — così una pagina che dice «1:1,41, che è la forma di un A4 o di un A5» è una pagina a cui puoi smettere di pensare.

![La foto di un foglio su una scrivania, scattata di sbieco, con un quadrilatero rilevato disegnato sui suoi angoli e maniglie per correggerli.](https://abox.tools/screens/scan-a-document-with-your-phone/corners.webp)

Gli angoli, trovati e poi trascinati se sono stati trovati male. Metterli giusti è quello che trasforma una foto in una scansione.

## La luce: dividi, non stirare

Aumentare il contrasto di una pagina illuminata in modo irregolare rende bianca la parte chiara e nera la parte scura, e quello che c'è scritto nella parte scura sparisce insieme a lei. Il problema non è mai stato che il contrasto fosse troppo basso. È che la carta non ha la stessa luminosità in un angolo e nell'altro, quindi non esiste una regolazione unica che vada bene per tutta la pagina.

Quello che funziona è stimare quanto è luminosa la carta *in ogni punto* e dividere per quella. La carta è la maggioranza chiara di qualsiasi piccola porzione di una pagina, quindi misurare la luminosità su una griglia di piccoli riquadri e prendere in ognuno un valore alto dà la forma della luce — il testo è troppo scuro e troppo rado per spostarla. Dividi per quella e quello che resta è l'inchiostro, illuminato in modo uniforme, senza più l'ombra e con la carta tornata bianca.

È quello che fanno «colore, uniformato» e «scala di grigi». Scegli il colore quando il colore fa parte del documento: un timbro, una firma a inchiostro blu, una riga evidenziata, qualsiasi cosa su cui qualcuno potrebbe poi chiedere se fosse originale.

![La scheda di pulizia: la pagina raddrizzata, una scelta di modalità e un cursore di intensità.](https://abox.tools/screens/scan-a-document-with-your-phone/clean.webp)

La luce divisa invece che stirata. Le modalità vanno da uno schiarimento leggero al bianco e nero pieno, e la sezione sotto dice quale usare e quando.

## Il bianco e nero, e perché il file diventa improvvisamente piccolo

Una pagina salvata come fotografia sono milioni di pixel con sedici milioni di colori possibili ciascuno, e il codec spende le sue energie su gradienti sottili che una pagina di testo non ha. Una pagina salvata in bianco e nero è un bit per pixel — inchiostro o carta — e si comprime come la cosa straordinariamente ripetitiva che è.

La differenza non è piccola: sulle stesse pagine è qualcosa come diciotto volte. Un contratto di venti pagine che come fotografie arriva a quindici megabyte, come pagine a un bit sta sotto il megabyte — che è la differenza tra un documento che si può mandare per email e uno che no, ed è il motivo per cui ogni scanner da ufficio ce l'ha come impostazione predefinita.

Il rovescio della medaglia è che non ci sono mezzitoni: una fotografia sulla pagina diventa un pasticcio di puntini. Usalo per le pagine stampate e scritte, che è quello che sono la maggior parte dei documenti, e usa la scala di grigi per qualsiasi cosa abbia sopra un'immagine.

Un dettaglio che vale la pena sapere, perché spiega perché uno strumento buono riesce dove uno cattivo produce una pagina con un angolo nero: la decisione tra inchiostro e carta va presa *localmente*. Una soglia unica per tutta la pagina non può funzionare quando la carta nell'ombra è più scura dell'inchiostro nella luce — e su una pagina fotografata molto spesso lo è. Decidere ogni pixel contro la media del suo piccolo vicinato è quello che tiene leggibile la scrittura dentro un'ombra.

## Più pagine, un documento solo

Fotografa le pagine in ordine, aggiungile tutte insieme, e diventano le pagine di un solo PDF nell'ordine in cui sono state aggiunte. Due cose a cui stare attenti:

- **I nomi dei file non si ordinano come pensi.** `pagina2.jpg` viene dopo `pagina10.jpg` in un ordinamento alfabetico, perché il confronto è carattere per carattere. Controlla l'ordine nella striscia prima di salvare, e non nel PDF dopo.
- **La ripulitura è un'impostazione unica per tutto il documento**, ed è voluto. Pagine ripulite in modo diverso sembrano due documenti pinzati insieme, che è esattamente l'impressione che una scansione dovrebbe evitare. Scegli la modalità che va bene per la pagina peggiore.

## Prima di mandarlo

- **Apri il PDF.** Non l'anteprima — il file. Ogni pagina, per il verso giusto, senza niente tagliato a un bordo.
- **Leggi la cosa più piccola che c'è sulla pagina.** Un numero di riferimento, una data, un numero di conto. Se non riesci a leggerla sullo schermo al 100%, non ci riesce nemmeno la persona a cui la stai mandando.
- **Controlla che gli angoli non siano stati tagliati.** Quello che sta sul bordo di un modulo è un numero di pagina, una riga per la firma, o la casella che qualcuno poi dirà che mancava.
- **Controlla che cosa dice il documento su di te.** Un PDF ha campi per l'autore, il produttore e la data di creazione, e quasi tutti gli strumenti li riempiono. Se questo conti o no dipende da chi lo riceve, ma vale la pena sapere che c'è.

## Perché niente di tutto questo ha bisogno di un caricamento

Ogni passaggio qui sopra è aritmetica su un'immagine che la tua macchina ha già decodificato: quattro angoli, una trasformazione, una divisione, una soglia, e un contenitore scritto un byte alla volta. Non c'è dentro niente che un server possa fare e un browser no, e niente che abbia bisogno di scaricare un modello per farlo.

Il che vale la pena di soppesare, per via di che cosa sono questi file. La gente non fotografa pagine a caso. Fotografa un passaporto, una busta paga, un contratto d'affitto, un modulo medico, un contratto — documenti con sopra un nome, un indirizzo e un numero di conto, scansionati proprio perché un ente li ha chiesti. Caricarne uno su un sito per farne raddrizzare gli angoli consegna a uno sconosciuto il documento intero. Vedi [come capire se uno strumento ha davvero bisogno dei tuoi file](https://abox.tools/it/guide/e-sicuro-caricare-i-propri-file/) per i quattro controlli che separano gli strumenti che devono vedere il tuo file da quelli che semplicemente lo fanno.
