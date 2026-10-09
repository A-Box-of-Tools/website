# Confronto testi — confronta due testi, fianco a fianco

Due testi dentro, ogni differenza segnata, riga per riga e parola per parola. Niente finisce incollato nel server di qualcun altro.

> Confronta due testi e guarda ogni differenza, riga per riga e parola per parola, fianco a fianco o in una colonna. Il confronto gira nel tuo browser e non viene caricato niente: il codice non ancora pubblicato non lascia mai il tuo dispositivo.

Questa pagina è uno strumento interattivo che funziona interamente nel tuo browser, all'indirizzo https://abox.tools/it/confrontare-testi/ — nulla di ciò che gli affidi viene caricato. Quanto segue è tutto ciò che la pagina dice dello strumento a parole; per usarlo, apri l'indirizzo.

## Qui non si caricano testi, **mai**. Non c'è nessun server.

Un confronto è aritmetica su due stringhe, fatta qui, in questa pagina. L'algoritmo è quello di Myers — lo stesso che usa `git diff` —, scritto a mano in `src/diff.js`, dove puoi leggerlo. Questo strumento non ha nessuna funzione di rete, niente da scaricare e niente da mandare, e qui conta: quello che la gente confronta sono contratti, file di configurazione e codice non ancora pubblicato, sempre in coppia.

- ✗ Niente caricamenti
- ✗ Nessun account
- ✗ Nessun limite di dimensione
- ✓ Funziona offline
- ✓ Open source

## Come confrontare due testi senza caricarli

1. **Incolla i due testi, oppure trascina i due file.** L'originale a sinistra, la versione cambiata a destra. Due file trascinati insieme sul selettore finiscono uno per parte, nell'ordine in cui li hai lasciati; scambia i lati se era al contrario.
2. **Scegli come leggerlo.** Fianco a fianco, o in una colonna. Un telefono parte con una colonna, perché fianco a fianco servono due colonne di testo e su un telefono ce ne sta più o meno una; il menu comunque è lì accanto.
3. **Ignora quello che non conta.** Spazi, maiuscole e minuscole, righe vuote — ognuno si può ignorare, così un file riformattato non si legge come cento modifiche. Per impostazione la parte centrale senza modifiche viene ripiegata in un conteggio, con tre righe tenute da ogni lato di ogni modifica.
4. **Leggi cos'è cambiato.** Le righe tolte sono segnate a sinistra, quelle aggiunte a destra, e dentro una riga cambiata sono evidenziate le parole che differiscono — così il diff di due paragrafi mostra la parola che si è spostata e non due paragrafi interi.
5. **Prenditi la patch.** Il download è un `.patch` in formato unificato, che è quello che si aspettano una revisione del codice, `git apply` e qualsiasi visualizzatore di differenze. Copia mette la stessa cosa negli appunti.

## La versione lunga

[Come confrontare due file JSON](https://abox.tools/it/guide/confrontare-due-file-json/): Formatta i due file allo stesso modo, ordina le chiavi, poi confrontali. Perché un diff JSON grezzo è quasi solo rumore, come portare i due lati in forma canonica nel browser, e cosa sopravvive fino alla patch.

## Anche nella cassetta

- [Codificatore e decodificatore Base64](https://abox.tools/it/codifica-base64/): Base64, codifica percentuale, entità HTML, esadecimale ed escape con barra rovesciata, in entrambi i versi. Niente finisce incollato nel server di qualcun altro.
- [Condividere testo e file](https://abox.tools/it/condividere-testo/): La condivisione vive in questa scheda aperta. I lettori la ricevono cifrata, direttamente dal tuo browser, e chiudere la scheda la fa finire: nessun server conserva nulla.
- [Generatore di QR code e codici a barre](https://abox.tools/it/creare-qr-code/): Lo scrivi, e diventa un codice. Per farne uno non parte niente.
- [Lettore di QR code e codici a barre](https://abox.tools/it/leggere-qr-code/): Punta la fotocamera, o trascina qui una foto. Si legge qui, e da nessun'altra parte.

## Domande

### I miei testi vengono caricati da qualche parte?

No. Il confronto è una funzione che gira nel tuo browser, sul tuo hardware. Questo strumento non ha nessuna funzione di rete: non scarica mai niente e non manda mai niente, e la `Content-Security-Policy` della pagina elenca ogni indirizzo che può contattare, nessuno dei quali appartiene a questo sito. È questo il motivo per usarlo con un contratto, un file di configurazione o del codice non pubblicato: incollare queste cose nel diff di qualcun altro vuol dire consegnare tutte e due le versioni in un colpo solo.

### Cosa fa davvero il confronto?

Trova l'insieme più corto di modifiche che trasforma il testo di sinistra in quello di destra, con l'algoritmo di Myers, lo stesso che usa `git diff`. È il fatto che sia il più corto a rendere leggibile un confronto: una riga inserita in mezzo dovrebbe comparire come un inserimento e non come se fossero cambiate tutte le righe successive. Dentro una riga modificata vengono segnate anche le parole che differiscono, quindi il confronto di due paragrafi mostra la parola che si è spostata e non due paragrafi interi.

### Può confrontare due file invece di due incollate?

Sì. Trascinali entrambi insieme sul selettore e finiscono uno per parte, nell'ordine in cui li hai lasciati. Li legge il tuo browser dentro questa pagina, che è l'unico posto in cui vanno. Scambia i lati se li hai messi al contrario.

### Cosa esce da un confronto, e posso applicarlo?

Il download è un diff unificato, cioè il formato `@@ -3,5 +3,5 @@` che leggono `git apply`, `patch` e qualsiasi strumento di revisione del codice. Copiare fa la stessa cosa negli appunti. Quello che vedi a schermo ne è una vista: affiancata, oppure su una colonna, con le parti immutate ridotte a un conteggio a meno che non le chieda tutte.

### Può ignorare spazi, maiuscole o righe vuote?

Sì, ognuno per conto suo. Ignorare gli spazi fa sì che un file riformattato risulti identico; ignorare maiuscole e minuscole tratta `Error` ed `error` come la stessa parola; ignorare le righe vuote salta le righe che non contengono niente. I contatori sopra il risultato dicono allora che i due sono uguali una volta ignorate le differenze che hai chiesto di ignorare — che non è la stessa affermazione di identici, e la pagina tiene le due affermazioni separate.

### Quanto può essere grande il confronto?

Qui non c'è nessun limite impostato, perché non c'è nessun server che lo paghi. Due testi da ventimila righe con una manciata di modifiche si confrontano all'istante, perché l'inizio e la fine in comune vengono tagliati prima che cominci il lavoro vero. Il confronto di due testi che non hanno assolutamente niente in comune si ferma presto e lo dice, invece di passare un minuto a dimostrare l'ovvio; e un confronto molto lungo disegna le prime migliaia di righe e lascia il resto alla patch scaricata.

### È gratis, e mi serve un account?

È gratis, e non c'è account, non c'è registrazione, non c'è periodo di prova e non c'è limite a quanto incolli. Il sito ha della pubblicità, ed è quella che lo mantiene; agli annunci non arriva niente sul tuo testo.

### Funziona offline?

Sì. Carica la pagina una volta, poi stacca la connessione e continua a funzionare. È anche il modo più semplice per dimostrare che non viene caricato niente, perché uno strumento che spedisse via i tuoi testi per confrontarli si fermerebbe nell'istante in cui stacchi la spina.

## Come si verifica quello che promette

- **Quello che incolli non ha una strada per uscire.** Nella Content-Security-Policy c'è ogni indirizzo che questa pagina può contattare, e non ne appartiene uno a questo sito. Qui non esiste un recapito dove un token incollato possa essere raccolto, e nel codice non c'è niente che lo manderebbe lì se esistesse.
- **Qui niente va a prendere niente.** In `src/` non c'è da nessuna parte un `fetch`, un `XMLHttpRequest` o un `sendBeacon`. Il confronto è una funzione di questa pagina che prende due stringhe e restituisce cos'è cambiato.
- **L'algoritmo è quello standard, leggibile per intero.** L'algoritmo del più corto script di modifica di Myers, lo stesso che usa `git diff`, scritto a mano in `src/diff.js` con le decisioni commentate. I test in `tests/js/text-diff.test.js` dimostrano che le cancellazioni ricostruiscono il testo di sinistra e le inserzioni quello di destra, che è quello che vuol dire corretto per un diff.
- **Cosa carica Google, e cosa non gli arriva.** Gli script della pubblicità e della misurazione arrivano da Google, il pulsante delle donazioni da Buy Me a Coffee. A nessuno di loro arriva un carattere del tuo testo. Ogni riga che lo legge, lo analizza o lo scrive è servita da questa origine ed è elencata nel repository.
- **Funziona offline.** Stacca la rete e lo strumento resta identico, perché al suo interno non c'è mai stato un passaggio di rete. È la prova più semplice che ci sia.

**Verifica tu stesso.** Niente di quanto sopra va preso per buono. Questa pagina la genera, dai modelli e dalla configurazione del repository, uno script di build che puoi leggere ed eseguire anche tu, e il risultato finisce sul branch `dist`: puoi quindi confrontare quello che viene servito con quello che produce una build dei sorgenti. https://github.com/A-Box-of-Tools/website

I file da leggere per primi sono `config/site.toml` per la Content-Security-Policy e `src/diff.js` per l'algoritmo di Myers, il passaggio parola per parola dentro ogni riga cambiata e le tre protezioni che impediscono a un confronto patologico di bloccare la pagina.
