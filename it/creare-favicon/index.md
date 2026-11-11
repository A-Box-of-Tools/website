# Creare una favicon — icone per il web, per Windows e per macOS

Dentro un'immagine sola. Fuori tutte le dimensioni che chiedono un browser, Windows o un Mac.

> Converti un PNG, un JPEG o un SVG in un vero .ico multidimensione o in un .icns per macOS, nel browser. Favicon, icona per app Windows, icona per app Mac, più i file Apple e Android che servono a un sito. Non viene caricato niente.

Questa pagina è uno strumento interattivo che funziona interamente nel tuo browser, all'indirizzo https://abox.tools/it/creare-favicon/ — nulla di ciò che gli affidi viene caricato. Quanto segue è tutto ciò che la pagina dice dello strumento a parole; per usarlo, apri l'indirizzo.

## Qui non si caricano immagini, **mai**. Non c'è nessun server.

Il ridimensionamento e i file icona veri e propri avvengono tutti e due dentro il tuo browser. L'immagine viene disegnata sul canvas che il browser si porta già dietro, e ogni contenitore, l'`.ico` di Windows come l'`.icns` di macOS, viene assemblato a partire da quei pixel da un paio di centinaia di righe in `src/ico.js` e `src/icns.js` che puoi leggere. Questo strumento non ha nessuna funzione di rete, non c'è niente da recuperare e niente da spedire, e dall'altra parte di questa pagina non c'è nessun server a cui mandare un logo, anche se una funzione del genere ci fosse.

- ✗ Niente caricamenti
- ✗ Nessun account
- ✗ Nessuna filigrana
- ✓ Funziona offline
- ✓ Open source

## Come fare un file .ico senza caricare niente

1. **Scegli l'immagine.** Trascina sul riquadro un PNG, un JPEG, un WebP o un SVG, oppure scegline parecchie e convertile in un colpo solo. Quadrata è la strada più semplice, e qualunque immagine da 256 pixel in su ha abbastanza dettaglio per tutte le dimensioni. La legge il browser direttamente dal tuo disco, e mentre lo fa non parte niente per nessuna destinazione.
2. **Scegli i file che ti servono.** Windows e i browser leggono l'`.ico`; un Mac legge l'`.icns` e l'altro non lo guarda nemmeno. Spunta uno dei due, oppure entrambi se quello che stai facendo esce su tutti e due. Un sito web vuole anche le immagini in più per Apple, Android e le tessere, ed è la terza casella.
3. **Di' a cosa serve l'icona.** Una favicon per un sito è 16, 32 e 48 pixel; un'applicazione Windows vuole anche 256; un'applicazione che deve venire bene su un portatile ad alta densità vuole le dimensioni intermedie che Windows chiede al 125% e al 150%. Scegli il valore pronto che corrisponde al lavoro, oppure spunta tu le dimensioni una per una: ognuna, nell'elenco, dice chi la chiede. L'`.icns` questa scelta non ce l'ha, perché Apple nomina esattamente dieci slot e ci entrano tutti e dieci.
4. **Sistema la forma e lo sfondo.** Un'icona è quadrata e quasi nessun logo lo è. Con il riempimento l'immagine viene tenuta tutta, con dello spazio sopra e sotto; con il ritaglio viene preso il centro; con lo stiramento viene schiacciata. La trasparenza resta trasparenza, a meno che tu non scelga un colore da metterci dietro.
5. **Guarda quella da 16 pixel prima di scaricare.** È la dimensione a cui l'icona verrà vista più spesso, ed è dove i tratti sottili e le scritte piccole spariscono. Ogni quadrato dell'anteprima è disegnato alla sua dimensione vera a partire dal tuo file. Se la più piccola è una macchia, la soluzione è un disegno più semplice, non un'impostazione diversa.
6. **Prendi i file.** Un .ico con tutte le dimensioni dentro, chiamato `favicon.ico` quando è quello che hai chiesto, perché è l'indirizzo che i browser vanno a cercare. Un .icns accanto, se hai spuntato anche quello, pronto da mettere nel bundle di un'applicazione Mac. Spunta pure il pacchetto per il sito e ti arrivano anche le immagini Apple e Android, la tessera di Windows, il manifest e il blocco di HTML da incollare nella tua pagina. Qualunque cosa vada oltre il file singolo si scarica in un unico zip.

## La versione lunga

[Come creare una favicon che si legga ancora a sedici pixel](https://abox.tools/it/guide/creare-una-favicon/): Di quali dimensioni ha davvero bisogno un favicon.ico, quali file in più chiedono iPhone, Android e un Mac, e perché un logo che funziona su un manifesto sparisce a sedici pixel.

## Anche nella cassetta

- [Immagine in data URI](https://abox.tools/it/immagine-in-base64/): Tutta l'immagine come una riga di testo, da incollare dritta nel CSS o nell'HTML.
- [Da SVG a immagine](https://abox.tools/it/svg-in-png/): La dimensione la dici tu. Un vettoriale non ne ha una sua da perdere.
- [Immagine in SVG](https://abox.tools/it/immagine-in-svg/): Una forma, un contorno. Indica quello che non dovrebbe esserci.
- [Confronto di altezze](https://abox.tools/it/confrontare-altezze/): Scrivi le altezze, portati via l'immagine. Per disegnarla non viene mandato niente.

## Domande

### La mia immagine viene caricata da qualche parte?

No. L'immagine la decodifica e la ridimensiona il tuo browser sul tuo hardware, e l'.ico viene assemblato a partire da quei pixel da codice servito da questa pagina. Questo strumento non ha nessuna funzione di rete: non recupera mai niente e non spedisce mai niente. La `Content-Security-Policy` della pagina elenca poi tutti gli indirizzi che può contattare, e nessuno di quelli appartiene a questo sito.

### Quali dimensioni dovrebbe contenere un favicon.ico?

16, 32 e 48. Non è una preferenza: 16 è quello che un browser disegna in una scheda, 32 è quello che Windows usa per un collegamento sul desktop e che parecchi browser usano per un segnalibro, e 48 è la dimensione a cui Google legge l'icona di un sito. Tutto quello che è più grande sta in un PNG accanto all'.ico e non dentro, ed è esattamente quello che qui produce il pacchetto per il sito.

### Di quali dimensioni ha bisogno l'icona di un'applicazione Windows?

16, 32, 48 e 256, che è quello che contiene l'app.ico predefinito di Visual Studio. 16 è la barra del titolo e la visualizzazione a icone piccole di Esplora file, 32 il desktop e la barra delle applicazioni, 48 le icone medie, e 256 il menu Start e le icone molto grandi. Su uno schermo ad alta densità Windows chiede anche 20, 24, 40, 64 e 96, e se non le trova se le ricava dalla dimensione più vicina che ha: il valore pronto «tutte le scale» gliele mette dentro.

### Perché il file è più pesante dell'immagine da cui sono partito?

Perché un .ico non è un'immagine, sono parecchie, e le piccole vengono conservate non compresse perché possa leggerle chiunque. Una voce 32x32 pesa esattamente 4.264 byte qualunque cosa contenga, e una voce 256x256 non compressa pesa 264 KB: è per questo che di default le dimensioni sopra i 64 vengono conservate come PNG. Scegliendo «PNG per tutte le dimensioni» ottieni il file più leggero possibile; scegliendo non compresso per tutte, quello più compatibile.

### Che differenza c'è tra le voci PNG e quelle non compresse?

Solo il modo in cui i pixel vengono conservati dentro l'.ico. Una voce non compressa è la disposizione Windows originale, cioè un'intestazione bitmap, i pixel a testa in giù e una maschera di trasparenza a un bit, e sanno leggerla tutte le versioni di Windows mai uscite. Una voce PNG è un intero file PNG infilato dentro l'icona: alle dimensioni grandi è da tre a dieci volte più leggera, ma l'hanno capita solo da Windows Vista in poi. Il default usa ciascuna delle due dove vince, quindi non compressa fino a 64 pixel e PNG sopra.

### Può fare un'icona più grande di 256 pixel?

No, e non può nessuno. Il formato conserva ogni lato in un byte solo, e lo 0 è già preso, perché vuol dire 256. Quello è il tetto, quindi un .ico che contiene un'immagine da 512 pixel non è un'icona più grande, è un'icona rotta. Se ti servono 512, ti serve un PNG, ed è quello che il pacchetto per il sito include per Android e per la schermata di avvio di una web app.

### Conserva la trasparenza?

Sì, in tutti e due i tipi di voce, e scrive anche la vecchia maschera a un bit accanto al canale alfa, così il software troppo vecchio per leggere l'alfa ritaglia comunque l'icona invece di disegnare un rettangolo nero. L'unico file reso opaco di proposito è l'icona Apple touch del pacchetto per il sito: iOS la sovrappone alla propria tessera e trasforma la trasparenza in nero, quindi viene appiattita sul tuo colore di sfondo, bianco se non dici altro.

### Il mio logo è un logotipo largo. Cosa gli succede?

Qualcosa deve succedergli, perché un'icona è quadrata. Il riempimento tiene tutto e lo rimpicciolisce, e un logotipo fatto entrare in un quadrato da 16 pixel è alto tre pixel e non si legge. Di solito funziona meglio ritagliare il centro: isola il simbolo dal logo e usa quello, come fa quasi ogni marchio per la propria favicon. L'anteprima ti mostra quale dei due sopravvive, prima che tu scarichi qualunque cosa.

### Cosa c'è nel pacchetto per il sito, e mi serve tutto?

Sette PNG, un manifest per web app, un browserconfig.xml e un blocco di HTML da incollare. Ti servono perché un .ico copre i browser e Windows e nient'altro: la schermata Home di un iPhone legge un PNG da 180 pixel con un nome tutto suo, Android e ogni richiesta di installazione leggono il manifest, e una tessera appuntata al menu Start legge l'XML. Nessuno di questi va a guardare dentro un .ico. Viene generato tutto qui, sul tuo dispositivo, e nello zip c'è una nota che dice a cosa serve ogni file.

### Può fare anche un'icona per macOS?

Sì: spunta *icona macOS* e ottieni un `.icns` accanto all'`.ico`, oppure al posto suo. È un contenitore diverso per la stessa idea, e nessuno dei due sistemi legge quello dell'altro, perché Windows vuole .ico e il bundle di un'applicazione Mac vuole .icns. Lì le dimensioni non sono una scelta, perché Apple pubblica esattamente dieci slot: 16, 32, 64, 128, 256, 512 e 1024 pixel, con tre di questi che compaiono due volte come versione Retina della dimensione sotto. Ci entrano tutti e dieci, disegnati da sette rese, ed è per questo che un .icns è il file più pesante.

### Come si usa il file .icns?

Per un'applicazione, va nel bundle in `TuaApp.app/Contents/Resources/` e va nominato in `Info.plist` sotto `CFBundleIconFile`; ogni strumento di impacchettamento per Mac ha un campo apposta. Per tutto il resto, seleziona il file nel Finder, premi Comando-C, poi apri Ottieni informazioni sulla cartella o sull'immagine disco che vuoi cambiare, clicca la piccola icona in alto a sinistra e premi Comando-V.

### L'.icns è uguale a quello che fa iconutil?

Gli stessi dieci slot con gli stessi tipi da quattro lettere, e un PNG in ognuno, che è quello che `iconutil` produce da una cartella `.iconset`. C'è una differenza, ed è voluta: lo strumento di Apple scrive anche un elemento `TOC` , cioè un indice dei tipi e delle lunghezze che seguono. È un'ottimizzazione e non una parte del formato, visto che un lettore che non ce l'ha percorre gli elementi da un capo all'altro e arriva alla stessa risposta, e un indice sbagliato è peggio di nessun indice, quindi qui viene lasciato fuori.

### Posso convertire più immagini insieme?

Sì. Ogni immagine dell'elenco diventa il proprio .ico con le stesse impostazioni, e il lotto si scarica in un unico zip con una cartella per immagine, altrimenti due di loro si chiamerebbero tutte e due favicon.ico e una sovrascriverebbe l'altra. Ogni uscita che hai spuntato viene fatta per ogni immagine. Clicca una riga qualsiasi per mettere quell'immagine nell'anteprima.

### È gratis, e mi serve un account?

È gratis, e non c'è account, non c'è registrazione, non c'è periodo di prova e non c'è filigrana. Non c'è nemmeno un limite al numero o alla dimensione dei file, perché non c'è nessun server che li paga: il lavoro lo fa il tuo dispositivo. Il sito ha della pubblicità, ed è quella che lo mantiene; agli annunci non arriva niente sulle tue immagini.

### Funziona offline?

Sì. Carica la pagina una volta, poi stacca la connessione e continua a funzionare. È anche il modo più semplice per dimostrare che non viene caricato niente, perché uno strumento che spedisse via il tuo logo per convertirlo si fermerebbe nell'istante in cui stacchi la spina.

## Come si verifica quello che promette

- **Il tuo logo non ha dove andare.** La Content-Security-Policy elenca tutti gli indirizzi che questa pagina può contattare, e nessuno di quegli indirizzi appartiene a questo sito. Non esiste un punto di raccolta in cui i tuoi file possano finire, e nel codice non c'è niente che ce li manderebbe se anche esistesse.
- **Qui dentro niente va a recuperare niente.** In `src/` non c'è né un `fetch`, né un `XMLHttpRequest`, né un `sendBeacon`. Il ridimensionamento è un `drawImage` su un canvas, e ogni icona è un'intestazione scritta davanti a quei pixel da `src/ico.js` o da `src/icns.js`, su questa pagina.
- **Il file viene descritto a partire dai suoi byte.** L'elenco di dimensioni che compare accanto a un'icona finita non è l'elenco delle dimensioni che hai chiesto. Viene riletto dal file appena scritto, da `readIcoDirectory` o da `readIcnsElements`, così se uno scrittore non concordasse con le impostazioni la pagina te lo direbbe, invece di lasciartelo scoprire quando Windows non disegna niente e macOS disegna un foglio bianco.
- **Cosa carica Google, e cosa non gli arriva.** Gli script della pubblicità e della misurazione arrivano da Google, il pulsante delle donazioni da Buy Me a Coffee. A nessuno di loro viene passato niente sulla tua immagine. Ogni riga che legge, ridimensiona o scrive un file è servita da questa origine ed è elencata nel repository.
- **Funziona offline.** Stacca la rete e lo strumento resta identico, perché al suo interno non c'è mai stato un passaggio di rete. È la prova più semplice che ci sia.

**Verifica tu stesso.** Niente di quanto sopra va preso per buono. Questa pagina la genera, dai modelli e dalla configurazione del repository, uno script di build che puoi leggere ed eseguire anche tu, e il risultato finisce sul branch `dist`: puoi quindi confrontare quello che viene servito con quello che produce una build dei sorgenti. https://github.com/A-Box-of-Tools/website

I file da leggere per primi sono `config/site.toml` per la Content-Security-Policy, `src/ico.js` e `src/icns.js` per i due formati di icona, con la directory, le voci e la maschera nel primo e i dieci slot con nome di Apple nel secondo, e `src/sizes.js` per l'origine di ogni dimensione che vedi sulla pagina.
