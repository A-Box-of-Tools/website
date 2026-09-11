# Hash e checksum — MD5, SHA-1, SHA-256, SHA-512

Controlla un download contro il numero pubblicato da chi lo distribuisce, senza mandarlo a nessuno.

> Calcola l'MD5, SHA-1, SHA-256, SHA-384 o SHA-512 di qualsiasi file e confrontalo con il checksum pubblicato dalla pagina di download. Il file viene letto nel browser e non viene mai caricato, di qualunque dimensione sia.

Questa pagina è uno strumento interattivo che funziona interamente nel tuo browser, all'indirizzo https://abox.tools/it/verificare-checksum/ — nulla di ciò che gli affidi viene caricato. Quanto segue è tutto ciò che la pagina dice dello strumento a parole; per usarlo, apri l'indirizzo.

## Qui non si caricano file, **mai**. Non c'è nessun server.

Un checksum è aritmetica sui byte del tuo file, e qui il conto si fa in questa pagina, con il processore di questo dispositivo. Il file viene letto dal disco a pezzi da quattro megabyte e ogni pezzo viene buttato appena è stato contato, quindi da nessuna parte si forma una copia intera: né in memoria, né tantomeno su un server. All'altro capo di questa pagina non c'è nessun server a cui mandare un file, nemmeno se qualcosa qui volesse farlo.

- ✗ Nessun caricamento
- ✗ Nessun limite di dimensione
- ✓ Funziona offline
- ✓ Codice aperto
- ✓ I file restano sul tuo dispositivo

## Come controllare un download con il suo checksum

1. **Scegli il file.** Trascinalo sul riquadro oppure selezionalo a mano. Viene letto a pezzi direttamente dal disco; mentre lo fai non parte niente da nessuna parte, e non c'è una dimensione oltre la quale la pagina si arrende.
2. **Lascia che lo legga.** MD5 e SHA-256 si calcolano di default, in un'unica passata. La barra dice a che punto è e a che velocità. Un'immagine disco grande ci mette più o meno quanto ci metterebbe a essere copiata, perché la quantità di lettura è la stessa.
3. **Incolla quello che dovrebbe venire.** Quello che ti ha dato la pagina di download, in qualunque forma sia: esadecimale nudo, una riga di output di `sha256sum`, un intero file `SHA256SUMS`, oppure l'attributo `integrity` preso da un tag script. Quale algoritmo sia si ricava dalla lunghezza, e la casella giusta si spunta da sola.
4. **Leggi la risposta, non il colore.** La pagina dice in una frase se questo è il file che quel checksum descrive. Se corrisponde, i byte sono identici a quelli misurati da chi lo ha pubblicato. Se non corrisponde non lo sono, e conviene riscaricare prima di aprirlo.
5. **Portati via i checksum, se ti servono.** Copiane uno, copiali tutti, oppure salvali in un piccolo file di testo, nella forma con l'algoritmo davanti che scrivono gli strumenti da riga di comando. Così il nome dell'algoritmo viaggia insieme al numero.

## La versione lunga

[Come controllare un download con il suo checksum](https://abox.tools/it/guide/verificare-il-checksum-di-un-file/): Come confrontare un checksum MD5 o SHA-256 su Windows, macOS e Linux o nel browser, cosa dimostra davvero una corrispondenza, e l'errore che rende inutile tutto l'esercizio.

## Anche nella cassetta

- [Generatore di password e passphrase](https://abox.tools/it/generatore-password/): Generate qui, dal tuo browser, e non spedite da nessuna parte. Non viene salvato niente e non c'è cronologia.
- [Formattatore JSON](https://abox.tools/it/formattare-json/): JSON, XML, HTML, CSS e YAML, formattati o convertiti. Niente finisce incollato nel server di qualcun altro.
- [Convertitore da YAML a JSON](https://abox.tools/it/convertire-yaml-in-json/): Tutte e due le direzioni, e ti dice quanto costa ciascuna. Niente di tutto questo finisce incollato nel server di qualcun altro.
- [Formattatore XML](https://abox.tools/it/formattare-xml/): XML sistemato per leggerlo o compattato per spedirlo, e convertito in JSON in tutte e due le direzioni. Niente di tutto questo finisce incollato nel server di qualcun altro.

## Domande

### Il mio file viene caricato da qualche parte?

No. Lo legge il tuo browser dal tuo disco e lo calcola il tuo processore, a pezzi da quattro megabyte. Questo strumento non ha un lato server, e la `Content-Security-Policy` della pagina elenca ogni indirizzo che può contattare: nessuno è nostro. Stacca la rete e continua a funzionare.

### C'è un limite di dimensione?

No. Il file non sta mai intero da nessuna parte: viene letto a pezzi e ogni pezzo viene contato e buttato, così un'immagine disco da quaranta gigabyte usa gli stessi pochi megabyte di memoria di un file di testo. Quello che costa è tempo, e la pagina te lo dice mentre va avanti. \
\
È il motivo per cui gli algoritmi sono scritti qui invece di essere passati al `crypto.subtle.digest` del browser, che sarebbe più veloce. Quella chiamata prende l'intero messaggio in un solo buffer e non c'è modo di darle un file a pezzi, quindi usarla avrebbe messo la dimensione massima verificabile in balia della memoria che questa scheda riesce a ottenere. Su un telefono sono qualche centinaio di megabyte, e quello che la gente vuole verificare di più sono le immagini disco.

### Il checksum corrisponde. Che cosa è stato dimostrato, esattamente?

Che i byte sul tuo disco sono quelli che qualcuno aveva davanti quando ha scritto quel numero. Nient'altro, e sui limiti conviene essere precisi. \
\
È dimostrato che il download non si è troncato, non è stato rovinato da un disco guasto e non è stato scambiato per strada. **Non** è dimostrato che il file sia innocuo, perché chi pubblica può misurare un malware con la stessa esattezza di qualsiasi altra cosa. Ed è dimostrato molto poco se il checksum arrivava dalla stessa pagina, sulla stessa connessione, del file: chi poteva cambiare una cosa poteva cambiare l'altra. Un checksum vale soprattutto quando ti arriva per una strada diversa: un file `SHA256SUMS` firmato, l'annuncio di rilascio di una distribuzione, un secondo mirror, o un gestore di pacchetti che lo conosce già.

### Non corrisponde. E adesso?

Prima riscarica il file, dallo stesso posto. Un trasferimento interrotto o ripreso è di gran lunga la causa più comune, e la seconda copia di solito risolve. \
\
Se la seconda copia dà la stessa risposta sbagliata, controlla di confrontare la riga giusta: le pagine di rilascio elencano più file, e il checksum della build ARM non corrisponderà mai a quello della x86. Poi controlla la versione. Se è tutto giusto e continua a non corrispondere, non aprire il file. Prendilo da un altro mirror e confronta i due checksum fra loro.

### Quale dovrei usare?

Quello che ha pubblicato chi distribuisce il file. Il senso dell'esercizio è confrontare con il suo numero, e quello non lo scegli tu. \
\
Se invece stai producendo un checksum anziché verificarlo, usa SHA-256. MD5 e SHA-1 sono rotti nel senso che conta: due file diversi con lo stesso valore si possono costruire apposta, in poche ore con MD5 e con una spesa contenuta con SHA-1. Questo non li rende inutili contro gli incidenti, perché un download troncato non finisce per caso sullo stesso valore dell'originale; però significa che nessuno dei due può più dirti che nessuno ci ha messo mano. SHA-384 e SHA-512 vanno benissimo e in pratica non sono migliori: stanno qui perché qualche progetto li pubblica.

### Perché c'è MD5 se è rotto?

Perché è ancora quello che sta stampato. Mirror, download di firmware, pagine di software universitarie e moltissimi siti di produttori hanno pubblicato un MD5 vent'anni fa e da allora non hanno più toccato la pagina. Uno strumento che si rifiutasse di calcolarlo si rifiuterebbe di rispondere alla domanda con cui i suoi visitatori arrivano davvero. \
\
Quello che può fare, invece, è dire quanto vale la risposta, ed è quello che fa la nota accanto alla casella. Un MD5 che corrisponde esclude ancora un download rovinato. Non esclude un download manomesso.

### Quali formati posso incollare nel riquadro di confronto?

Tutti quelli usati di solito, e la pagina capisce da sola quale sia. \
\
Esadecimale nudo, con o senza spazi. Una riga di output di `md5sum` o `sha256sum`, con il nome del file dopo. Un intero file `SHA256SUMS` con quaranta righe: in quel caso viene usata la riga che nomina il tuo file. La forma BSD, `SHA256 (disk.iso) = …`. Un'etichetta davanti, come in `SHA-256: …`. E un attributo di subresource integrity, `sha384-…`, che è in base64 invece che in esadecimale e viene decodificato prima del confronto. \
\
Quale algoritmo sia si ricava dalla lunghezza: 32 caratteri esadecimali sono un MD5, 40 uno SHA-1, 64 uno SHA-256, 96 uno SHA-384 e 128 uno SHA-512. Non ce ne sono due della stessa lunghezza, quindi non c'è niente da scegliere e niente da sbagliare.

### Darà lo stesso risultato di sha256sum o certutil?

Sì, byte per byte. Sono specifiche esatte con vettori di test pubblicati, e ogni algoritmo qui viene verificato a ogni build contro quei vettori e contro l'implementazione del sistema operativo. \
\
L'unica differenza che vedrai è la presentazione. Il `certutil -hashfile` di Windows scrive in maiuscolo e con spazi; questa pagina scrive in minuscolo, che è quello che usa quasi chiunque pubblichi. Il confronto ignora entrambe le cose, quindi un checksum copiato da certutil corrisponde a uno in minuscolo incollato qui.

### Posso confrontare due file fra loro?

Sì, con un passaggio in più: controlla il primo, copia il suo checksum, poi scegli il secondo e incolla quel checksum nel riquadro. Se i due file sono identici, la pagina lo dirà. \
\
Vale la pena saperlo per il caso in cui i checksum sono silenziosamente imbattibili: capire se la copia sul disco di backup è davvero lo stesso file di quella sul portatile, quando tutte e due dichiarano la stessa dimensione e la stessa data.

### Modifica il mio file?

No. Questo strumento legge soltanto. Non c'è un file in uscita, non c'è una ricodifica e non c'è niente che venga riscritto: l'unica cosa che puoi scaricare è un piccolo file di testo con i checksum. Il tuo originale resta intatto sul disco, che è anche la risposta onesta a cosa succede se chiudi la scheda.

### È gratis, e serve un account?

È gratis, e non c'è account, né registrazione, né prova. Non c'è limite alla dimensione del file né a quanti file controlli. Il sito ha pubblicità, che è quello che lo paga; alla pubblicità non viene dato niente sul tuo file.

### Funziona offline?

Sì. Carica la pagina una volta, poi stacca la rete e continua a funzionare. È anche il modo più semplice per dimostrare che non viene caricato niente: uno strumento che mandasse via il tuo file per farlo calcolare si fermerebbe nel momento in cui stacchi la spina.

## Come si verifica quello che promette

- **Il tuo file non ha una strada per uscire.** Nella Content-Security-Policy c'è ogni indirizzo che questa pagina può contattare, e nessuno è nostro. Qui non esiste un punto di raccolta dove il tuo file possa finire, e nel codice non c'è niente che ce lo manderebbe se esistesse. Prima qui si leggeva `connect-src 'none'`, che era assoluto; la pubblicità è costata questo, e dirlo fa parte del patto.
- **Il file non sta mai intero da nessuna parte, di qualsiasi dimensione sia.** Viene letto a pezzi da quattro megabyte, e ogni pezzo entra nello stato in corso e viene buttato. La memoria che questa pagina usa è la stessa per un'immagine disco da quaranta gigabyte e per un file di testo, e non c'è una dimensione oltre la quale si arrende. È anche il motivo per cui non si usa il `crypto.subtle.digest` del browser: quella funzione vuole il file intero in memoria tutto insieme, che è esattamente il tetto che questo strumento esiste per non avere.
- **Cinque algoritmi, cinque file in questo repository.** In `src/md5.js`, `src/sha1.js`, `src/sha256.js` e `src/sha512.js` ci sono le specifiche pubblicate scritte per esteso, una sessantina di righe ciascuna, con le tabelle di costanti scritte invece che calcolate perché niente del risultato dipenda dal browser. Ognuna viene verificata a ogni build contro i vettori di test ufficiali e contro l'implementazione del sistema operativo.
- **Anche il checksum che incolli non va da nessuna parte.** Il confronto avviene qui, nella pagina, contro il valore calcolato qui. Di quel confronto non viene a sapere nessuno: né il valore, né se corrispondeva, né il nome del file. Conta più di quanto sembri: un checksum insieme a un nome di file dice a chi lo raccoglie esattamente quale build di quale programma hai appena scaricato.
- **Cosa carica Google e cosa non riceve.** Gli script pubblicitari e di misurazione arrivano da Google. Nessuno dei due riceve niente sul tuo file: né il file, né il nome, né la dimensione, né uno dei valori calcolati. Ogni riga che legge o elabora un byte è servita da questo dominio ed è nel repository.
- **Cosa carica il pulsante delle donazioni e cosa non riceve.** Il pulsante «Buy me a coffee» in testa alla pagina è disegnato da uno script di cdnjs.buymeacoffee.com e prende i caratteri da Google Fonts. È un link e nient'altro: non segnala la visita e non riceve niente su di te o sui tuoi file. Non succede nulla finché non lo premi, e quello che apriresti è il sito di qualcun altro.
- **Funziona offline.** Stacca la rete e ogni parte di questa pagina continua a funzionare. È la prova più semplice di tutte: uno strumento che mandasse via il tuo file per farlo calcolare si fermerebbe nel momento in cui stacchi la spina.

**Verifica tu stesso.** Niente di quanto sopra va preso per buono. Questa pagina la genera, dai modelli e dalla configurazione del repository, uno script di build che puoi leggere ed eseguire anche tu, e il risultato finisce sul branch `dist`: puoi quindi confrontare quello che viene servito con quello che produce una build dei sorgenti. https://github.com/A-Box-of-Tools/website

I file da leggere per primi sono `config/site.toml` per la Content-Security-Policy, `src/md5.js`, `src/sha1.js`, `src/sha256.js` e `src/sha512.js` per le quattro funzioni di compressione, `src/blocks.js` per il riempimento che hanno in comune e `src/hash.js` per il ciclo che legge il file a pezzi. In nessuno di questi c'è una riga capace di raggiungere la rete.
