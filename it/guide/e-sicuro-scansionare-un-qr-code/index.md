# È sicuro scansionare un QR code?

La scansione in sé lo è. Un QR code è un pezzo di testo, e puntarci la fotocamera non fa altro che leggere quel testo. Tutto ciò che può andare storto succede un tocco dopo, quando qualcosa apre ciò che è stato letto — e quel tocco puoi trattenerlo.

Ultimo aggiornamento 26 agosto 2026

## La risposta breve

Scansionare è sicuro. Un QR code è un breve pezzo di testo disegnato a quadratini, e puntarci la fotocamera fa esattamente una cosa: rilegge quel testo. La lettura non può installare nulla, non può visitare nulla e non può toccare nulla sul tuo telefono, per la stessa ragione per cui guardare un indirizzo scritto non ti ci porta.

Il pericolo comincia un passo dopo, quando qualcosa *apre* ciò che è stato letto — e l'intero trucco di ogni truffa coi QR code sta nel far avvenire quel passo prima che tu abbia visto dove stai andando. Il testo dentro il codice è un indirizzo che nessuno può leggere a occhio nudo, e quasi tutti i telefoni gli rispondono con un unico tocco premuroso. Tieni separati il leggere e l'aprire, e alla truffa non resta nulla su cui lavorare.

## Che cosa è davvero un QR code

Sotto i quadratini non c'è che una stringa di caratteri: qualche migliaio al massimo, di solito molti meno. Un indirizzo web, il nome di una rete Wi-Fi con la sua password, una scheda di contatto, una riga di testo. Il formato fu progettato nel 1994 per seguire pezzi d'auto in una fabbrica Toyota, e non contiene istruzioni di alcun tipo. Un QR code non può «contenere un virus» più di quanto possa contenerlo un cartello stradale.

Ciò che può contenere è un testo che *chiede* qualcosa al tuo telefono: aprire questo indirizzo, unirsi a questa rete, salvare questo contatto. Ognuna di queste è una richiesta, non un comando. Il codice propone; decide ciò che lo ha scansionato. Un lettore che ti mostra il testo e aspetta è del tutto innocuo. Un lettore che agisce da sé sul testo ha consegnato la decisione a chi ha stampato il codice — e questa è tutta la differenza fra una scansione sicura e una pericolosa.

Una nota a margine, per onestà: il programma che decodifica può avere difetti, come ogni programma che interpreta un input, e nei lettori ce ne sono stati negli anni. Ma quel rischio appartiene al lettore, non al codice, e non è su quello che contano le truffe. Contano sul tocco.

## Il trucco dell'adesivo

La truffa diventata abbastanza comune da meritarsi un nome — quishing — è di una semplicità quasi imbarazzante: stampare un proprio codice, incollarlo sopra uno vero, aspettare. Su un parchimetro, dove il falso porta a una pagina di pagamento che somiglia a quella del comune. Sul tavolo di un ristorante, sopra il menù. Sull'avviso di giacenza infilato sotto la porta, accanto alle parole «non ti abbiamo trovato».

Nota che cosa lo fa funzionare. Non è raffinatezza tecnica: non ce n'è alcuna. È che un QR code è l'unico tipo di indirizzo che una persona non può leggere prima di seguirlo. Un indirizzo web storto scritto in lettere si tradisce davanti a chiunque lo guardi; lo stesso indirizzo disegnato a quadratini è identico a uno onesto. Quando puoi finalmente vedere dove portava il codice, ci sei già, su una pagina costruita per somigliare a quella che ti aspettavi, che ti chiede il numero della carta.

La difesa non è smettere di scansionare. È guardare l'indirizzo *fra* la scansione e la visita, il che costa circa due secondi e smonta il trucco per intero.

## Tre modi in cui un indirizzo mente

Due secondi di sguardo bastano, ma solo se sai che cosa guardare. Sono tre le forme dall'aria onesta che un indirizzo storto assume, e tutte e tre vale la pena conoscerle di vista.

### 1. Il nome prima della @

Un indirizzo web può portare un nome utente, scritto prima di una `@`: tutto ciò che precede la `@` è decorazione, e la destinazione vera comincia dopo. `tuabanca.it@evil.example` non va alla tua banca. Va a `evil.example`, portandosi dietro «tuabanca.it» come nome utente privo di significato. L'occhio legge l'inizio di un indirizzo; il browser ne legge la fine.

### 2. Lettere che non sono le lettere che sembrano

Gli alfabeti si sovrappongono. Una `а` cirillica si disegna esattamente come una `a` latina, e un indirizzo scritto con l'una è un indirizzo diverso che sullo schermo appare identico. Il trucco ha un nome — attacco omografo — ed è il motivo per cui una destinazione può coincidere lettera per lettera con quella di cui ti fidi e trovarsi comunque altrove.

### 3. La prima tappa onesta

L'indirizzo nel codice può essere genuinamente rispettabile — un accorciatore di link, un reindirizzamento pubblicitario, il tracciamento dei clic di un motore di ricerca — e limitarsi a *inoltrarti* verso un posto che non lo è. Il primo indirizzo regge all'esame; la destinazione la decide un server quando sei già in cammino. Un indirizzo accorciato in un codice stampato non prova nulla di male, ma significa che l'indirizzo che puoi controllare non è quello a cui arriverai.

## Come scansionarne uno senza rischi

La regola sta in una frase: **prima leggere, poi aprire, e mai lasciare che un solo gesto faccia entrambe le cose.** In pratica:

- Usa un lettore che ti mostri il testo decodificato e si fermi lì. Quasi tutte le fotocamere dei telefoni mostrano la destinazione in un piccolo riquadro prima di aprirla: leggi il riquadro invece di toccarlo per riflesso, e leggi la *fine* dell'indirizzo, non l'inizio.
- Sii più diffidente dove la posta è più alta e la superficie è pubblica: tutto ciò che finisce in un pagamento, tutto ciò che vive all'aperto. Il codice di un parchimetro merita più riflessione di quello sulla targhetta di un museo.
- Un codice che porta dritto a una pagina di accesso o di dati della carta è il momento di fermarsi e digitare invece l'indirizzo che già conosci. La versione legittima di quella pagina non è mai a più di qualche tasto di distanza.
- I codici Wi-Fi e le schede di contatto meritano la stessa pausa: uno chiede al telefono di ricordare una rete, l'altra di salvare una persona. Entrambe le cose vanno benissimo se le accetti sapendolo, e nessuna delle due dovrebbe avvenire in silenzio.

## Come si comporta il lettore di qui

Questo sito ha un [lettore di QR code e codici a barre](https://abox.tools/it/leggere-qr-code/), ed è costruito sulla regola che questa pagina ha appena difeso: **non apre mai nulla.** Il testo decodificato è stampato per intero, l'host che l'indirizzo raggiungerebbe davvero è estratto su una riga propria, e i tre travestimenti qui sopra vengono controllati e nominati quando compaiono. Aprire il link è un bottone a parte, premuto dopo aver letto — o mai.

La lettura in sé avviene sulla tua macchina. L'immagine che scansioni viene decodificata nel browser e non è inviata da nessuna parte, così un codice che ti insospettisce può essere esaminato senza che nessuno — questo sito compreso — sappia che cosa diceva; la pagina continua a funzionare a Wi-Fi spento, che è il modo più semplice di verificare l'affermazione. E un contenuto apertamente ostile, come un indirizzo `javascript:` che eseguirebbe codice in chi lo apre, non riceve alcun link e viene chiamato con il suo nome.

Esiste anche l'altra metà: un [generatore di QR code](https://abox.tools/it/creare-qr-code/) che disegna i codici sulla tua macchina, e una guida compagna su come [creare un codice e provare che si legge](https://abox.tools/it/guide/creare-un-codice-qr-e-provare-che-si-legge/) prima di mandarlo in stampa. E se dietro la tua domanda c'era quella più larga — che cosa fa davvero consegnare qualunque cosa a un sito web — quella ha [una pagina tutta sua](https://abox.tools/it/guide/e-sicuro-caricare-i-propri-file/).
