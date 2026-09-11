# Dividere una GIF — ogni fotogramma in un PNG

Ogni fotogramma fuori, nel suo PNG.

> Dividi una GIF animata nei suoi fotogrammi e salva ognuno come PNG, gratis e interamente nel browser. Trasparenza e tempi restano intatti. Non viene caricato niente e funziona anche offline.

Questa pagina è uno strumento interattivo che funziona interamente nel tuo browser, all'indirizzo https://abox.tools/it/dividere-gif-in-fotogrammi/ — nulla di ciò che gli affidi viene caricato. Quanto segue è tutto ciò che la pagina dice dello strumento a parole; per usarlo, apri l'indirizzo.

## Qui non si caricano GIF, **mai**. Non c'è nessun server.

La GIF viene letta, decompressa e disegnata dal tuo browser, e ogni PNG viene codificato nella memoria di questo dispositivo. Dall'altra parte di questa pagina non c'è nessun server a cui mandare un'animazione, nemmeno se qualcosa qui volesse farlo.

- ✗ Niente caricamenti
- ✗ Nessun account
- ✓ Funziona offline
- ✓ Open source
- ✓ I file restano sul tuo dispositivo

## Come dividere una GIF nei suoi fotogrammi

1. **Scegli la GIF.** Trascinala sul selettore oppure cercala a mano. Il browser la legge direttamente dal tuo disco, e la pagina ti dice cosa ha trovato: la dimensione, quanti fotogrammi ha, quanto dura e quante volte si ripete.
2. **Decidi cosa contiene ogni PNG.** **Il fotogramma come appare** è quello che vogliono quasi tutti: l'immagine intera in quel momento dell'animazione. **Solo i pixel che quel fotogramma salva** è la toppa che il file porta davvero, con la sua dimensione e al suo posto, ed è il motivo per cui una GIF resta piccola. Non è l'aspetto dell'animazione.
3. **Decidi cosa succede alla trasparenza.** Il PNG la tiene, ed è l'impostazione onesta. Riempila con un colore se i fotogrammi finiscono in un posto che la trasparenza la ignora e altrimenti la farebbe diventare nera.
4. **Scegli i fotogrammi che ti servono.** Di base tutti. «Tenere un fotogramma ogni due» alleggerisce una registrazione lunga, e le caselle sulla griglia hanno la meglio su quella scelta. La numerazione non cambia mai, quindi il fotogramma 42 si chiama fotogramma 42 per quanti pochi vicini tu ne abbia tenuti.
5. **Scaricali.** Uno alla volta dalla griglia, oppure tutti in un solo ZIP, così c'è una richiesta di salvataggio invece di centinaia. Lo ZIP può portarsi dietro un `frames.txt` con quanto è durato ogni fotogramma, che è l'unica cosa che una cartella di PNG non sa dire da sola.

## La versione lunga

[Come dividere una GIF in fotogrammi](https://abox.tools/it/guide/dividere-una-gif-in-fotogrammi/): Tirare fuori ogni fotogramma di una GIF animata come PNG: perché certi fotogrammi sono solo un pezzetto dell'immagine, che fine fa la trasparenza e come tenere i tempi per rimetterla insieme.

## Anche nella cassetta

- [Analizzatore di GIF](https://abox.tools/it/analizzare-gif/): Fotogrammi, durate, tavolozze e dove è finito ogni byte.
- [Immagini in video](https://abox.tools/it/immagini-in-video/): Trasforma una cartella di immagini in un video.
- [Tagliavideo](https://abox.tools/it/tagliare-video/): Segna i pezzi che vale la pena tenere mentre scorre. Te li ritrovi come un video solo.
- [Ritagliatore di video](https://abox.tools/it/ritagliare-video/): Riduci una clip alla parte che conta.

## Domande

### La mia GIF viene caricata da qualche parte?

No. Il file lo legge, lo decomprime e lo disegna il tuo browser sul tuo hardware, e ogni PNG viene codificato qui in memoria. Questo strumento non ha un lato server, e la `Content-Security-Policy` della pagina elenca ogni indirizzo che può contattare: nessuno appartiene a questo sito. Stacca la connessione e continua a dividere GIF.

### Perché un fotogramma sembra un pezzetto dell'immagine?

Perché è quello che c'è nel file. Una GIF è una prima immagine seguita da toppe: ogni fotogramma successivo salva solo il rettangolo che è cambiato, e tutto il resto sullo schermo è quello che i precedenti hanno lasciato lì. Una testa che parla davanti a un muro fermo salva quindi una faccia per fotogramma e non un'immagine per fotogramma, ed è tutto il motivo per cui il formato non è enorme. \
\
Lo stai vedendo perché è selezionato «Solo i pixel che quel fotogramma salva». Passa a «Il fotogramma come appare» e ogni PNG sarà l'immagine intera, com'è l'animazione in quell'istante.

### La trasparenza si mantiene?

Sì. La trasparenza di una GIF è un bit soltanto: un pixel o è dipinto o è invisibile, e in mezzo non c'è niente. Il PNG salva esattamente quello, quindi i fotogrammi escono con le zone trasparenti intatte. Se preferisci uno sfondo pieno, metti «Zone trasparenti» su riempi con un colore: quel colore viene scritto nel PNG e dopo non si toglie più.

### Perché le durate non sono i numeri che mi aspettavo?

Una GIF salva ogni durata in centesimi di secondo, e dagli anni Novanta i browser portano a un decimo qualsiasi valore sotto i due centesimi: una regola scritta per i mappamondi che giravano all'epoca e mai più tolta. Un fotogramma il cui file dice 0,01 s viene quindi riprodotto a 0,10 s dappertutto. Questo strumento mostra la durata com'è davvero riprodotta e scrive accanto cosa dice il file quando le due cose non coincidono.

### Posso rimettere insieme i fotogrammi?

Sì, con il [Creatore di GIF](https://abox.tools/it/creare-gif/) di questo sito o con qualsiasi altra cosa accetti una cartella di immagini. È a questo che serve il `frames.txt` nello ZIP: dividere un'animazione butta via i tempi, perché un PNG non ha dove annotare quanto è rimasto in scena, quindi l'elenco porta fuori con sé la durata e la posizione di ogni fotogramma.

### In che formati posso salvare i fotogrammi?

PNG, e di proposito solo PNG. Un fotogramma di GIF ha al massimo 256 colori e un bit di trasparenza; il PNG salva esattamente quello e senza perdite, mentre il JPEG butterebbe via la trasparenza, si inventerebbe colori che il fotogramma non ha mai avuto e da un disegno piatto tirerebbe fuori di solito un file *più grande*. Se ti servono dei JPEG, converti i PNG dopo con il [Ridimensionatore di immagini](https://abox.tools/it/ridimensionare-immagine/).

### C'è un limite a quanti fotogrammi legge?

Un limite fisso non c'è. Il tetto vero è la memoria del tuo dispositivo: mentre viene letta, una GIF si espande a circa un byte per pixel per fotogramma, quindi un file piccolo può voler dire moltissima memoria, e questa pagina smette di leggere invece di lasciar morire la scheda. Se succede lo dice, e ti restituisce i fotogrammi che è riuscita a ottenere.

### Apre anche una GIF rovinata?

Di solito sì. I download troncati, il marcatore di fine che manca e un ultimo fotogramma che si interrompe a metà sono cose comunissime, e un lettore che li rifiuta è inutile proprio per i file che la gente vuole smontare di più. Tornano indietro tutti i fotogrammi completi, con una nota su cosa non andava. Viene rifiutato solo un file che non è affatto una GIF.

### È gratis, e mi serve un account?

È gratis, e non c'è account, non c'è registrazione, non c'è periodo di prova. Sui fotogrammi non c'è nemmeno una filigrana. Il sito ha della pubblicità, ed è quella che lo mantiene; agli annunci non arriva niente sui tuoi file.

### Funziona offline?

Sì. Carica la pagina una volta, poi stacca la connessione e continua a funzionare. È anche il modo più semplice per dimostrare che non viene caricato niente, perché uno strumento che spedisse via la tua animazione per elaborarla si fermerebbe nell'istante in cui stacchi la spina.

## Come si verifica quello che promette

- **La tua GIF non ha una strada per uscire.** Nella Content-Security-Policy c'è ogni indirizzo che questa pagina può contattare, e non ne appartiene uno a questo sito. Qui non esiste un recapito dove i tuoi file possano essere raccolti, e nel codice non c'è niente che li manderebbe lì se esistesse. Una volta questa riga diceva `connect-src 'none'`, che non ammetteva eccezioni: la pubblicità è costata quello, e dirlo fa parte dell'accordo.
- **Il lettore di GIF sono due file di questo repository.** Un browser una GIF te la riproduce ma i suoi pezzi non te li consegna, quindi il formato viene letto qui: `src/gif.js` è il contenitore e il decompressore LZW, `src/compose.js` sono le regole di smaltimento che decidono che aspetto ha ogni fotogramma una volta che i precedenti gli stanno sotto. Per aprire un file non si scarica niente, e non c'è nessun motore che arrivi al primo utilizzo.
- **Cosa carica Google, e cosa non gli arriva.** Gli script della pubblicità e della misurazione arrivano da Google. A nessuno dei due viene passato niente sulla tua animazione: né il file, né un fotogramma, né un nome, una dimensione o un conteggio. Ogni riga che legge, decomprime, disegna o codifica un'immagine è servita da questa origine ed è elencata nel repository.
- **Cosa carica il pulsante delle donazioni, e cosa non gli arriva.** Il pulsante «Buy me a coffee» in alto è disegnato da uno script di cdnjs.buymeacoffee.com e prende i caratteri da Google Fonts. Non è niente di più di un collegamento: non segnala nessuna visita e non gli viene passato niente su di te o sui tuoi file. Finché non ci clicchi non succede niente, e quello a cui arriveresti è il sito di qualcun altro.
- **Funziona offline.** Stacca la rete e ogni pezzo di questa pagina continua a funzionare. È la prova più semplice che ci sia: uno strumento che spedisse via la tua animazione per smontarla si fermerebbe nell'istante in cui stacchi la spina.

**Verifica tu stesso.** Niente di quanto sopra va preso per buono. Questa pagina la genera, dai modelli e dalla configurazione del repository, uno script di build che puoi leggere ed eseguire anche tu, e il risultato finisce sul branch `dist`: puoi quindi confrontare quello che viene servito con quello che produce una build dei sorgenti. https://github.com/A-Box-of-Tools/website

I file da leggere per primi sono `config/site.toml` per la Content-Security-Policy, `src/gif.js` per il lettore che decomprime i fotogrammi e `src/compose.js` per le regole con cui vengono sovrapposti: in nessuno dei due c'è una riga che possa raggiungere la rete.
