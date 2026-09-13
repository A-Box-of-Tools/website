# Analizzatore di GIF — cosa c'è davvero dentro una GIF

Fotogrammi, durate, tavolozze e dove è finito ogni byte.

> Smonta una GIF nel browser: ogni fotogramma con la sua durata e il suo smaltimento, le tavole dei colori, le ripetizioni e il conto byte per byte di dove è finito il peso del file. Non viene caricato niente.

Questa pagina è uno strumento interattivo che funziona interamente nel tuo browser, all'indirizzo https://abox.tools/it/analizzare-gif/ — nulla di ciò che gli affidi viene caricato. Quanto segue è tutto ciò che la pagina dice dello strumento a parole; per usarlo, apri l'indirizzo.

## Qui non si caricano GIF, **mai**. Non c'è nessun server.

Il file lo apre e lo smonta il tuo browser: la struttura a blocchi, la decompressione LZW e ogni fotogramma disegnato su questa pagina succedono su questo dispositivo. Dall'altra parte di questa pagina non c'è nessun server a cui mandare un file, nemmeno se qualcosa qui volesse farlo.

- ✗ Niente caricamenti
- ✗ Nessun account
- ✓ Funziona offline
- ✓ Open source
- ✓ I file restano sul tuo dispositivo

## Come analizzare una GIF

1. **Scegli una GIF.** Trascinala sul selettore oppure cercala a mano. Il browser la legge direttamente dal tuo disco, e nel frattempo non esce niente da nessuna parte.
2. **Leggi prima il riepilogo.** Le dimensioni della tela, il numero di fotogrammi, quanto l'animazione dichiara di durare e quanto dura davvero. Le ultime due si discostano più spesso di quanto la gente si aspetti, e il motivo è nella sezione successiva.
3. **Guarda cosa salta all'occhio.** Ogni riga lì è misurata sul tuo file: durate che nessun browser rispetterà, un blocco di ripetizione che manca, tavole dei colori a cui non punta niente, metadati più grandi di certi fotogrammi. Niente è un'ipotesi su cosa volevi fare.
4. **Guarda dove sono finiti i byte.** Ogni byte del file sta in esattamente una riga, e le righe fanno il file. Se la maggior parte non sta in «pixel compressi», il resto della tabella ti dice dov'è invece.
5. **Scorri i fotogrammi.** Ognuno mostra la sua durata, il suo rettangolo, il suo metodo di smaltimento e la sua dimensione. Passa da «la tela dopo ogni fotogramma» a «solo quello che ogni fotogramma salva»: con il secondo vedi se il file è ottimizzato, perché una GIF fatta bene salva rettangolini e una fatta male salva ogni volta l'immagine intera.
6. **Portati via il resoconto se ti serve.** Tutta l'analisi in testo semplice, da incollare in un messaggio o da tenere accanto al file. Viene costruito nella pagina da quello che è già sul tuo schermo.

## La versione lunga

[Cosa c'è davvero dentro una GIF](https://abox.tools/it/guide/cosa-ce-dentro-una-gif/): Fotogrammi, ritardi, metodi di smaltimento e tavolozze spiegati, perché i browser rifiutano i ritardi più veloci, e come capire dove se n'è andato davvero il peso di una GIF.

## Anche nella cassetta

- [Immagini in video](https://abox.tools/it/immagini-in-video/): Trasforma una cartella di immagini in un video.
- [Tagliavideo](https://abox.tools/it/tagliare-video/): Segna i pezzi che vale la pena tenere mentre scorre. Te li ritrovi come un video solo.
- [Ritagliatore di video](https://abox.tools/it/ritagliare-video/): Riduci una clip alla parte che conta.
- [Invertitore di video](https://abox.tools/it/invertire-video/): L'ultimo fotogramma per primo, audio compreso.

## Domande

### La mia GIF viene caricata da qualche parte?

No. Il file lo legge, lo decomprime e lo disegna il tuo browser sul tuo hardware. Questo strumento non ha un lato server, e la `Content-Security-Policy` della pagina elenca ogni indirizzo che può contattare: nessuno appartiene a questo sito. Stacca la connessione e continua ad analizzare GIF.

### Perché la mia GIF va più lenta di quanto dicono le durate?

Perché ogni browser si rifiuta di rispettare una durata sotto i due centesimi di secondo e tiene il fotogramma per un decimo. La regola è stata scritta dentro Netscape nel 1996, per i mappamondi che giravano e i cartelli «lavori in corso» dell'epoca, ed è stata ricopiata in ogni browser da allora: non l'ha mai tolta nessuno. \
\
Quindi una GIF i cui fotogrammi dicono tutti 0,01 s non va a 100 fotogrammi al secondo. Va a 10, cioè da cinque a dieci volte più lenta di quanto intendesse il programma che l'ha fatta. Questa pagina mostra tutti e due i numeri, quello che dice il file e quello che farà davvero, e segna i fotogrammi coinvolti. Il rimedio, nel programma che ha scritto il file, è scrivere 0,02 invece di 0,01.

### Cosa vuol dire «smaltimento»?

Cosa lasciare sullo schermo quando il tempo di un fotogramma è finito, ed è il campo che decide se un'animazione viene bene o sbava. \
\
**Lasciarlo dov'è** vuol dire che il fotogramma successivo dipinge sopra questo, ed è quello che serve quando i fotogrammi sono opachi e si coprono a vicenda. **Tornare allo sfondo** cancella prima il rettangolo del fotogramma, ed è quello che serve alla trasparenza: senza, le parti trasparenti del fotogramma dopo lasciano vedere il precedente sotto. **Ripristinare quello che c'era sotto** rimette quello che c'era prima che questo fotogramma disegnasse, ed è così che si salva un oggetto piccolo che si muove su uno sfondo fermo. E **non specificato** vuol dire che il file non l'ha detto, e ogni visualizzatore lo tratta come «lasciarlo dov'è».

### Perché la mia GIF è così grande?

La tabella «Dove sono finiti i byte» risponde per il tuo file preciso invece che in generale, e le risposte possibili sono poche. \
\
Se quasi tutto è in **pixel compressi**, il file è semplicemente tanta immagine: una GIF salva ogni fotogramma come pixel interi, senza compensazione del movimento e senza una manopola della qualità, quindi il peso è più o meno l'area per il numero di fotogrammi. Meno fotogrammi, dimensioni più piccole o meno colori sono le uniche leve. \
\
Se una fetta grossa è in **tavole dei colori**, il file scrive una tavolozza per fotogramma, da 768 byte l'una. Se una fetta grossa è in **metadati**, un editor si è lasciato dietro un pacchetto XMP, e si può togliere senza toccare l'immagine. E se i fotogrammi coprono tutti la tela intera, il codificatore non si è mai chiesto quale parte fosse cambiata davvero, e su qualunque cosa ripresa o registrata quello è quasi tutto il file.

### Che differenza c'è tra le due viste dei fotogrammi?

**La tela dopo ogni fotogramma** è quello che un visualizzatore mostra in quel momento: questo fotogramma disegnato sopra quello che hanno lasciato i precedenti. **Solo quello che ogni fotogramma salva** è il rettangolo che il file tiene davvero per quel fotogramma, da solo e con niente sotto. \
\
La seconda è quella interessante. Una GIF può salvare di un fotogramma solo la parte di immagine che è cambiata, ed è per questo che la registrazione dello schermo di una finestra quasi ferma può essere piccola. Se in un file ogni fotogramma è la tela intera, quel lavoro non l'ha fatto nessuno, e guardando l'animazione non te ne accorgi: te ne accorgi solo guardando cosa c'è salvato.

### Dice che nel mio file c'è un commento o dell'XMP. Cos'è?

Testo che viaggia insieme all'immagine e che nessun visualizzatore disegna. Un blocco di commento di solito è il nome del programma che ha scritto il file. Un pacchetto XMP è l'XML che un editor di immagini scrive per annotare cosa ha fatto, e può portarsi dietro la cronologia delle modifiche, la versione del programma e a volte il nome dell'autore. \
\
Questa pagina li stampa tutti e due per intero, perché la domanda interessante sui metadati è cosa dicono, non che esistano. Vengono mostrati a te e a nessun altro: niente in questo repository li legge a qualcuno.

### Riesce ad aprire una GIF rotta?

Ci prova, e ti dice dove ha rinunciato. Un file che finisce a metà di un blocco, che ha un byte dove dovrebbe esserci un marcatore o che porta un fotogramma i cui dati compressi finiscono in anticipo mostrerà comunque tutto quello che era leggibile fino a quel punto, con il problema scritto in cima. È proprio il caso in cui un analizzatore serve di più, quindi buttare via tutto il file per un byte sbagliato sarebbe il comportamento sbagliato.

### Modifica il mio file?

No. Questo strumento legge soltanto. Non c'è un file in uscita, non c'è una ricodifica e qui non c'è nessun pulsante che scriva una GIF: l'unica cosa che puoi scaricare è una copia dell'analisi in testo semplice. Il tuo originale resta intatto sul tuo disco, che è anche la risposta onesta a cosa succede se chiudi la scheda.

### È gratis, e mi serve un account?

È gratis, e non c'è account, non c'è registrazione, non c'è periodo di prova. Non c'è nemmeno un limite alla dimensione del file oltre alla memoria del tuo dispositivo. Il sito ha della pubblicità, ed è quella che lo mantiene; agli annunci non arriva niente sul tuo file.

### Funziona offline?

Sì. Carica la pagina una volta, poi stacca la connessione e continua a funzionare. È anche il modo più semplice per dimostrare che non viene caricato niente, perché uno strumento che spedisse via la tua GIF per analizzarla si fermerebbe nell'istante in cui stacchi la spina.

## Come si verifica quello che promette

- **La tua GIF non ha una strada per uscire.** Nella Content-Security-Policy c'è ogni indirizzo che questa pagina può contattare, e non ne appartiene uno a questo sito. Qui non esiste un recapito dove il tuo file possa essere raccolto, e nel codice non c'è niente che lo manderebbe lì se esistesse. Una volta questa riga diceva `connect-src 'none'`, che non ammetteva eccezioni: la pubblicità è costata quello, e dirlo fa parte dell'accordo.
- **Il lettore sono quattro file di questo repository.** Qui niente usa il decodificatore GIF del browser per capire cosa c'è nel file, perché quel decodificatore non ti dice dove è finito un byte. Quindi il formato viene letto a mano: `src/gif.js` percorre i blocchi, `src/lzw.js` espande i pixel, `src/frames.js` li impila e `src/budget.js` rimette insieme i pezzi e controlla che facciano il peso del file.
- **Commenti e metadati li vedi tu, e nessun altro.** Una GIF può portarsi dietro un blocco di commento, un pacchetto XMP che descrive una modifica o un profilo colore, e questa pagina li stampa tutti. Finiscono sullo schermo davanti a te e da nessun'altra parte: in questo repository non c'è un evento di misurazione che ne porti via qualcosa, e la pagina non potrebbe mandarlo nemmeno se ci fosse.
- **Cosa carica Google, e cosa non gli arriva.** Gli script della pubblicità e della misurazione arrivano da Google. A nessuno dei due viene passato niente sul tuo file: né il file, né una miniatura, né un nome, un peso, un numero di fotogrammi o un commento. Ogni riga che legge, decomprime o disegna una GIF è servita da questa origine ed è elencata nel repository.
- **Cosa carica il pulsante delle donazioni, e cosa non gli arriva.** Il pulsante «Buy me a coffee» in alto è disegnato da uno script di cdnjs.buymeacoffee.com e prende i caratteri da Google Fonts. Non è niente di più di un collegamento: non segnala nessuna visita e non gli viene passato niente su di te o sui tuoi file. Finché non ci clicchi non succede niente, e quello a cui arriveresti è il sito di qualcun altro.
- **Funziona offline.** Stacca la rete e ogni pezzo di questa pagina continua a funzionare. È la prova più semplice che ci sia: uno strumento che spedisse via la tua GIF per analizzarla si fermerebbe nell'istante in cui stacchi la spina.

**Verifica tu stesso.** Niente di quanto sopra va preso per buono. Questa pagina la genera, dai modelli e dalla configurazione del repository, uno script di build che puoi leggere ed eseguire anche tu, e il risultato finisce sul branch `dist`: puoi quindi confrontare quello che viene servito con quello che produce una build dei sorgenti. https://github.com/A-Box-of-Tools/website

I file da leggere per primi sono `config/site.toml` per la Content-Security-Policy, `src/gif.js` per il lettore di blocchi che percorre il file, `src/lzw.js` per il decompressore e `src/budget.js` per la contabilità dei byte: in nessuno dei tre c'è una riga che possa raggiungere la rete.
