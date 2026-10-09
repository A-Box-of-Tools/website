# Codificatore e decodificatore Base64 — e URL, entità HTML, esadecimale ed escape

Base64, codifica percentuale, entità HTML, esadecimale ed escape con barra rovesciata, in entrambi i versi. Niente finisce incollato nel server di qualcun altro.

> Codifica e decodifica Base64 in entrambi gli alfabeti, codifica URL in percentuale, fai l'escape delle entità HTML e leggi esadecimale ed escape con barra rovesciata. Gira tutto nel tuo browser e non viene caricato niente: un token non lascia mai il tuo dispositivo.

Questa pagina è uno strumento interattivo che funziona interamente nel tuo browser, all'indirizzo https://abox.tools/it/codifica-base64/ — nulla di ciò che gli affidi viene caricato. Quanto segue è tutto ciò che la pagina dice dello strumento a parole; per usarlo, apri l'indirizzo.

## Qui non si caricano testi, **mai**. Non c'è nessun server.

Ogni codifica qui è aritmetica su una stringa, fatta qui, in questa pagina. I codec sono scritti a mano e stanno in `src/encode.js`; e non c'è altro. Questo strumento non ha nessuna funzione di rete, niente da scaricare e niente da mandare, e qui conta più che quasi ovunque: quello che la gente incolla in un decodificatore Base64 online è un token, e incollare un token nel sito di qualcun altro vuol dire consegnarglielo.

- ✗ Niente caricamenti
- ✗ Nessun account
- ✗ Nessun limite di dimensione
- ✓ Funziona offline
- ✓ Open source

## Come codificare o decodificare Base64 senza caricarlo

1. **Scegli la codifica.** Base64 in entrambi gli alfabeti, codifica percentuale per un valore singolo o per un URL intero, le cinque entità HTML, i byte in esadecimale e gli escape con barra rovesciata di un letterale stringa. La nota sotto il menu dice a cosa serve ciascuna.
2. **Scegli il verso.** *Codifica* prende testo in chiaro e produce la forma codificata; *Decodifica* riporta la forma codificata a testo in chiaro. Il risultato segue la tua digitazione: cambiare verso è un clic, e niente da riscrivere.
3. **Incollalo, oppure trascina il file.** Va bene qualunque cosa tu possa selezionare e copiare. Un file trascinato sul selettore lo legge il tuo browser e lo mette nella casella: qui non c'è nessun passaggio di caricamento da saltare.
4. **Leggi l'errore, se c'è.** Un decodificatore che fallisce qui dice cosa ha trovato — un carattere che il Base64 non usa, riempimento nel posto sbagliato, byte che non sono testo — invece di restituire qualcosa di plausibile e sbagliato.
5. **Prenditi il risultato.** Copialo, oppure scaricalo come file di testo. I contatori sotto la casella dicono quanti byte sono entrati e quanti sono usciti.

## Anche nella cassetta

- [Condividere testo e file](https://abox.tools/it/condividere-testo/): La condivisione vive in questa scheda aperta. I lettori la ricevono cifrata, direttamente dal tuo browser, e chiudere la scheda la fa finire: nessun server conserva nulla.
- [Generatore di QR code e codici a barre](https://abox.tools/it/creare-qr-code/): Lo scrivi, e diventa un codice. Per farne uno non parte niente.
- [Lettore di QR code e codici a barre](https://abox.tools/it/leggere-qr-code/): Punta la fotocamera, o trascina qui una foto. Si legge qui, e da nessun'altra parte.
- [Hash e checksum](https://abox.tools/it/verificare-checksum/): Controlla un download contro il numero pubblicato da chi lo distribuisce, senza mandarlo a nessuno.

## Domande

### Il mio testo viene caricato da qualche parte?

No. Ogni codificatore e ogni decodificatore di questa pagina è una funzione che gira nel tuo browser, sul tuo hardware. Questo strumento non ha nessuna funzione di rete: non scarica mai niente e non manda mai niente, e la `Content-Security-Policy` della pagina elenca ogni indirizzo che può contattare, nessuno dei quali appartiene a questo sito. È questo il motivo per usarlo con un token di accesso o un cookie di sessione: incollare una di queste cose nel decodificatore di qualcun altro vuol dire gliela stai dando.

### Il Base64 qui è lo stesso Base64 di tutti gli altri?

Sì: viene verificato contro i vettori di test dell'RFC 4648 e non contro sé stesso. Si decodificano entrambi gli alfabeti, quindi un JWT scritto con `-` e `_` si legge bene quanto uno scritto con `+` e `/`, e un input spezzato a 64 caratteri viene ricongiunto per te. La codifica passa dai byte UTF-8, quindi una lettera accentata o un'emoji sopravvive al giro di andata e ritorno.

### Base64 è una cifratura?

No, e prenderlo per una cifratura è l'errore classico. Base64 è una grafia: gli stessi byte, scritti in un alfabeto che sopravvive a un URL, a una mail o a una stringa JSON. Chiunque può rileggerlo — questa pagina lo fa in un millisecondo —, quindi non nasconde niente e non protegge niente. Se quello che hai è segreto, gli serve una cifratura vera prima di essere codificato, non al suo posto.

### Perché la decodifica è fallita?

Perché quello che è stato incollato non è esattamente quello che il codec credeva di ricevere, e l'errore dice in che senso: un carattere fuori dall'alfabeto Base64, riempimento nel posto sbagliato, un segno di percento senza due cifre esadecimali dietro, oppure byte che dal Base64 si decodificano ma non sono testo UTF-8 — il che di solito vuol dire che l'originale era un file e non una stringa. Il `atob` del browser avrebbe restituito qualcosa di plausibile al suo posto; sentirselo dire è tutto il senso di incollare qualcosa in un decodificatore.

### Che differenza c'è tra le due codifiche per indirizzi web?

Un valore singolo, o l'indirizzo intero. Codificare *un valore* fa l'escape di tutto ciò a cui un URL dà un significato — le barre, i punti interrogativi, le e commerciali —, che è quello che vuoi per un singolo parametro della query. Codificare un *URL intero* lascia l'indirizzo funzionante: le barre e il `?` restano, e vengono mascherati solo i caratteri che un URL non può proprio portare. La prima usata su un indirizzo intero rompe l'indirizzo; la seconda usata su un valore perde dove il valore finisce.

### Quanto può essere grande il file?

Qui non c'è nessun limite impostato, perché non c'è nessun server che lo paghi. Il tetto vero è il tuo dispositivo: qualche megabyte di testo va benissimo, e su un documento molto lungo la pagina aspetta una pausa nella tua digitazione prima di ricodificare, invece di litigarti la tastiera.

### È gratis, e mi serve un account?

È gratis, e non c'è account, non c'è registrazione, non c'è periodo di prova e non c'è limite a quanto incolli. Il sito ha della pubblicità, ed è quella che lo mantiene; agli annunci non arriva niente sul tuo testo.

### Funziona offline?

Sì. Carica la pagina una volta, poi stacca la connessione e continua a funzionare. È anche il modo più semplice per dimostrare che non viene caricato niente, perché uno strumento che spedisse via il tuo testo per decodificarlo si fermerebbe nell'istante in cui stacchi la spina.

## Come si verifica quello che promette

- **Quello che incolli non ha una strada per uscire.** Nella Content-Security-Policy c'è ogni indirizzo che questa pagina può contattare, e non ne appartiene uno a questo sito. Qui non esiste un recapito dove un token incollato possa essere raccolto, e nel codice non c'è niente che lo manderebbe lì se esistesse.
- **Qui niente va a prendere niente.** In `src/` non c'è da nessuna parte un `fetch`, un `XMLHttpRequest` o un `sendBeacon`. Ogni codificatore e ogni decodificatore sono funzioni di questa pagina che prendono una stringa e restituiscono una stringa.
- **Il decodificatore ti dice quando qualcosa non va.** Il `atob` del browser accetta input che dovrebbe rifiutare e restituisce qualcosa di plausibile. Il Base64 di qui è scritto a mano e verificato contro i vettori di prova della RFC 4648, e quando quello che hai incollato non è Base64 lo dice, e dice perché. I test in `tests/js/text-encode.test.js` verificano esattamente questo.
- **Cosa carica Google, e cosa non gli arriva.** Gli script della pubblicità e della misurazione arrivano da Google, il pulsante delle donazioni da Buy Me a Coffee. A nessuno di loro arriva un carattere del tuo testo. Ogni riga che lo legge, lo analizza o lo scrive è servita da questa origine ed è elencata nel repository.
- **Funziona offline.** Stacca la rete e lo strumento resta identico, perché al suo interno non c'è mai stato un passaggio di rete. È la prova più semplice che ci sia.

**Verifica tu stesso.** Niente di quanto sopra va preso per buono. Questa pagina la genera, dai modelli e dalla configurazione del repository, uno script di build che puoi leggere ed eseguire anche tu, e il risultato finisce sul branch `dist`: puoi quindi confrontare quello che viene servito con quello che produce una build dei sorgenti. https://github.com/A-Box-of-Tools/website

I file da leggere per primi sono `config/site.toml` per la Content-Security-Policy e `src/encode.js` per il Base64 verificato contro i vettori di prova della RFC 4648 invece che contro sé stesso, e che rifiuta gli input sbagliati invece di restituire qualcosa di plausibile come fa `atob`.
