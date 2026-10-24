# È sicuro incollare testo in uno strumento online?

Incollare non sembra caricare, ed è questa la trappola: gli stessi byte lasciano la tua macchina in ogni caso, se la pagina li spedisce. Qui si parla di che cosa porta davvero con sé una config o un log incollati — e di come capire se lo strumento davanti a te ha anche solo un posto dove mandarli.

Ultimo aggiornamento 26 agosto 2026

## La risposta breve

Incollare testo in una pagina web può avere esattamente le stesse conseguenze di caricarvi un file. Se non lo si sente, è perché il gesto arriva da un posto sicuro: fra due tue finestre, incollare sposta testo da un luogo che controlli a un altro luogo che controlli. Su una pagina web, il secondo luogo è una casella di testo che uno script può leggere — e ciò che accade dopo dipende interamente dalla pagina, non dal gesto.

Parecchi strumenti a forma di incolla fanno il loro lavoro su un server: la pagina spedisce via il tuo testo, il server formatta, valida o confronta, il risultato torna indietro. Niente sullo schermo dice quale delle due specie stai usando. La casella di testo è uguale in entrambi i casi; anche il bottone «Formatta». La differenza è una richiesta di rete, invisibile finché non la si cerca.

## Che cosa porta davvero un incolla

Ciò che finisce negli strumenti online è di rado prosa. È il testo di lavoro del mestiere di qualcuno, e il genere conta, perché alcune delle stringhe più delicate dell'informatica sono proprio quelle che si incollano nei formattatori a mezzanotte:

- **I file di configurazione** esistono per contenere ciò che un programma non deve scriversi dentro, e quelle cose sono password di database, chiavi API e segreti di firma. Una config incollata intera li porta tutti.
- **Log e stack trace** portano token di sessione nelle URL, indirizzi email, nomi di macchine interne e, ogni tanto, il corpo di una richiesta con dentro i dati personali di qualcuno.
- **Le risposte delle API** sono istantanee di dati di produzione — clienti veri, saldi veri — incollate in un posto comodo per leggerle.
- **Qualunque cosa dalla forma di base64** che finisce in un decodificatore è stata codificata, di solito, perché contava: un token in fase di debug, un certificato, un'intestazione di autenticazione.

Una chiave transitata dal server di uno sconosciuto va considerata esposta nell'istante in cui te ne accorgi: revocata e riemessa, il che su un sistema in produzione è un pomeriggio che nessuno aveva messo in conto. Il punto non è che i siti di formattazione raccolgano credenziali. È che non puoi sapere che cosa un server registra, e un segreto la cui esposizione non puoi escludere è un segreto che devi ruotare.

## Perché lo strumento non ha bisogno che il testo parta

Ecco il fatto tecnico che chiude la questione: formattare, validare, convertire e confrontare testo sono fra i lavori più facili dell'informatica. Analizzare JSON, indentare XML, confrontare due file, codificare base64: un browser lo fa in millisecondi, in locale, e ne è capace da anni. Un server non aggiunge nulla al lavoro. Quando uno strumento a incolla carica il tuo testo, è un residuo di architettura o una comodità del gestore, mai una necessità del lavoro.

È di questo che gli strumenti di testo di questo sito sono il controesempio. Il [formattatore JSON](https://abox.tools/it/formattare-json/) analizza, formatta e converte JSON, XML, HTML, CSS e YAML; il [confronto testi](https://abox.tools/it/confrontare-testi/) segna ogni differenza fra due testi, riga per riga e parola per parola; il [codificatore e decodificatore base64](https://abox.tools/it/codifica-base64/) va in entrambe le direzioni fra un testo e le sue codifiche. Tutti e tre girano sulla tua macchina, e ciò che incolli non ha nessun posto dove andare: queste pagine non contengono alcun percorso di codice che potrebbe spedirlo.

Due di loro hanno già la propria guida: [formattare JSON senza caricarlo](https://abox.tools/it/guide/formattare-json/) e [confrontare due file JSON](https://abox.tools/it/guide/confrontare-due-file-json/).

## Capire quale delle due specie stai usando

Le verifiche sono le stesse di uno strumento per file, e sono scritte per intero nella [guida sul caricare file](https://abox.tools/it/guide/e-sicuro-caricare-i-propri-file/). La versione breve, in chiave di incolla:

- **Stacca la spina.** Carica la pagina, disconnettiti, incolla, premi il bottone. Uno strumento locale prosegue; uno su server si ferma. Trenta secondi, nessuna competenza, impossibile da falsificare.
- **Guarda la scheda Rete mentre premi Formatta.** Una richiesta che parte in quell'istante, grande all'incirca quanto il tuo incolla, è il tuo incolla che parte. Nessuna richiesta, nessun caricamento.
- **Diffida degli extra premurosi.** Un bottone «condividi questo frammento», una cronologia dei tuoi incolla sincronizzata fra dispositivi, un link da mandare a un collega: ognuno è possibile solo se il testo è stato salvato su un server. Le funzioni sono confessioni: una pagina che può mostrare il tuo incolla a qualcun altro se l'è tenuto.

E un'abitudine batte tutte e tre le verifiche: incollare meno. Un validatore non ha bisogno della password vera per validare la forma di una config: `"REDACTED"` si analizza identica. E per l'incolla che è esso stesso il segreto, la regola si riduce a qualcosa di ancora più semplice: l'unica pagina che dovrebbe mai ricevere una password è la pagina di accesso a cui appartiene.
