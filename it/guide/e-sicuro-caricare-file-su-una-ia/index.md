# È sicuro caricare file su una IA?

La stessa domanda che la prima guida di questo sito fece sui convertitori, puntata sul posto dove i file vanno davvero adesso. La risposta onesta ha la stessa forma: quasi sempre non succede nulla di male, e non puoi verificarne nulla — più una differenza che conta. Un convertitore trasforma il tuo file senza curarsi di che cosa contiene. A una IA il file lo si manda proprio perché qualcosa lo legga.

Ultimo aggiornamento 27 agosto 2026

## La risposta breve

Allegare un file a una chat di IA è un caricamento. Incollarci del testo, pure. La finestra non sembra un modulo di caricamento — niente barra di avanzamento, niente «il tuo file è in trasferimento» — ma i byte attraversano comunque internet fino ai server di un fornitore, e tutto ciò che [la prima guida di questo gruppo](https://abox.tools/it/guide/e-sicuro-caricare-i-propri-file/) diceva dei caricamenti vale da quell'istante: per quanto viene tenuto, chi può raggiungerlo, quali copie di riserva sopravvivono al timer di cancellazione — ogni risposta è una promessa che prendi sulla fiducia, che nessuno fuori dall'azienda può controllare.

Con la maggior parte dei file, la maggior parte delle volte, non succede nulla di male; i fornitori seri di IA pubblicano regole di conservazione e in genere le rispettano. La ragione per cui la domanda merita una pagina sua è che una IA non è un convertitore con un altro nome. Tre differenze cambiano ciò che fa una persona prudente — e nessuna significa «mai». Significano: manda meno, e mandalo pulito.

## Dove va davvero il file

Sui computer del fornitore, dove parecchie cose possono legittimamente accadergli secondo i termini che hai accettato. Viene conservato per un certo tempo — a volte ore, a volte anni, spesso a seconda del piano e di impostazioni che magari non hai mai aperto. Può essere mostrato a revisori umani, il più delle volte quando un sistema automatico segnala la conversazione. A seconda del fornitore, del piano e di un'impostazione il cui valore predefinito varia, può servire ad addestrare i modelli futuri. E resta nella tua cronologia delle conversazioni, cioè dietro la tua password, su ogni dispositivo che può aprire il tuo account.

Nulla di tutto ciò è nascosto; sta nelle informative. Il punto su cui questo gruppo di guide continua a battere è più stretto: **non puoi controllarne nulla**. Uno strumento che gira nel tuo browser può dimostrare le sue affermazioni a Wi-Fi spento. Un servizio il cui intero valore è un modello che gira sull'hardware di qualcun altro non può, per sua natura, offrirti quella prova. La fiducia può ben essere meritata. Resta fiducia.

## Tre modi in cui una IA non è un convertitore

### 1. Il file viene mandato perché sia letto

Un convertitore ricodifica il tuo file senza curarsi del contenuto; nessun pezzo del meccanismo ci guarda dentro. Una IA è l'opposto: leggere il contenuto è il prodotto. Non c'è nulla di sinistro — è ciò che hai chiesto — ma cambia che cosa significa «sensibile». Il dettaglio compromettente di una foto attraversa un ridimensionamento intatto e inesaminato; la clausola compromettente di un contratto è precisamente il materiale di cui sarà fatto il riassunto.

### 2. Un agente può passarlo oltre

Il server di un convertitore è un vicolo cieco: file dentro, file fuori. Un assistente IA moderno è sempre più un agente con strumenti propri — ricerca web, esecuzione di codice, servizi di terzi che può chiamare. Il contenuto che gli consegni può finire citato in una ricerca, scritto in una sandbox o mandato allo strumento che l'agente giudica utile, e ogni salto aggiunge una parte che tu non hai mai scelto. I buoni agenti su questo sono prudenti; il punto è che il pubblico del tuo file non è più necessariamente una sola azienda.

### 3. La cosa sensibile la incolli apposta

Nessuno carica il proprio contratto di lavoro in un ridimensionatore di immagini. In un chatbot la gente lo incolla ogni giorno, perché «spiegami questa clausola» è esattamente il lavoro che una IA fa bene. I file di cui questa domanda tratta davvero — contratti, referti medici, log con dentro le chiavi, dati di altre persone — sono quelli per cui una IA è più utile, ed è per questo che il consiglio di questa pagina non è «semplicemente non farlo». Il consiglio è la sezione seguente.

## Manda meno, e mandalo pulito

Le quattro verifiche della prima guida qui si traducono male — un chatbot fallisce la prova della spina per costruzione, e la scheda Rete si limita a confermare che tutto parte. Quando «parte?» ha risposta prima ancora di cominciare, la domanda utile diventa: **che cosa deve partire, e in che stato**. In pratica:

- **Manda il passaggio, non l'archivio.** Una domanda su una clausola richiede una clausola, non la cartella dei contratti. Meno parte, meno c'è da conservare, rivedere o inoltrare — e la risposta di solito migliora, non peggiora.
- **Togli ciò che la domanda non richiede.** Una foto appena uscita dal telefono porta coordinate GPS, orari e un numero di serie della fotocamera che nessuna domanda sull'immagine richiede. Il [visore e rimotore di EXIF](https://abox.tools/it/rimuovere-dati-exif/) mostra che cosa viaggia clandestino e lo toglie, nel tuo browser, prima che qualcosa venga allegato.
- **Oscura cancellando, non coprendo.** Se un documento va a una IA con nomi, numeri o identificativi di cui non ha bisogno, rimuovili prima con l'[oscuratore di PDF](https://abox.tools/it/oscurare-pdf/) o l'[oscuratore di immagini](https://abox.tools/it/oscurare-immagine/) — entrambi cancellano ciò che marchi invece di disegnarci sopra, e la differenza ha [una guida tutta sua](https://abox.tools/it/guide/si-puo-recuperare-il-testo-oscurato/). Un modello legge il file più a fondo di qualunque occhiata umana; un segreto coperto a metà non è al sicuro a metà.
- **Le credenziali, fuori del tutto.** Log e file di configurazione entrano nelle chat con dentro ancora chiavi API e token, e un segreto incollato va considerato bruciato — la stessa regola a cui arriva la guida sull'[incollare testo negli strumenti online](https://abox.tools/it/guide/e-sicuro-incollare-testo-in-uno-strumento-online/). Ruota tutto ciò che è sfuggito.

## Quando mandare va benissimo, e quando non serve che parta nulla

Manda il file quando il contenuto non è sensibile e l'aiuto è vero; quando sei sotto termini che hai letto davvero, con impostazioni di conservazione e addestramento che hai davvero scelto; o quando la tua organizzazione ha un accordo che inchioda quelle risposte per iscritto. È l'uso di tutti i giorni, e questa pagina non argomenta contro.

E nota quante volte la risposta a «serve che parta qualcosa?» è no. Le faccende che la gente affida alle chat di IA — comprimi questo, converti quello, togli questi dati, fai stare questo sotto il limite di un modulo — sono lavori che un browser fa sulla tua macchina, e ogni strumento di questo sito li fa senza che il file parta. Un agente IA può perfino guidare quegli strumenti per te, e quando gira in locale la delega non costa nulla — è [la guida precedente](https://abox.tools/it/guide/un-agente-ia-puo-usare-questi-strumenti/). La divisione del lavoro pulita: gli strumenti di questo sito sono il posto dove un file diventa più piccolo, più pulito e privo di ciò che nessun altro deve vedere — sulla tua macchina — e ciò che scegli di mandare dopo esce apposta, nello stato che hai deciso tu.
