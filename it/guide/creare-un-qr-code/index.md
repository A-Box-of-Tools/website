# Come fare un QR code che si legga anche sul telefono di qualcun altro

Fare un QR code richiede un secondo. Farne uno che funzioni su un menu bagnato, su una pensilina dell'autobus o su un telefono tenuto a distanza di braccio con poca luce richiede quattro decisioni, e tutte e quattro si prendono prima di stampare qualunque cosa. Vediamo cosa fa ciascuna.

[Apri Generatore di QR code e codici a barre](https://abox.tools/it/creare-qr-code/): Lo scrivi, e diventa un codice. Per farne uno non parte niente.

Ultimo aggiornamento 26 agosto 2026

## La risposta corta

Apri il [generatore di QR code e codici a barre](https://abox.tools/it/creare-qr-code/), incolla il tuo link, lascia il livello su **M** e il margine su **4**, e scarica l'SVG. Stampalo largo almeno due centimetri, su qualcosa di opaco, scuro su chiaro. Poi scansiona la prova stampata con un telefono che non è il tuo, prima di ordinarne mille.

Copre quasi ogni caso. Il resto di questa pagina riguarda cosa fare quando non è uno di quelli: un codice che deve sopravvivere a essere maneggiato, un codice con sopra un logo, un codice che va su qualcosa di piccolo, e l'unica decisione facile da sbagliare in un modo di cui ti accorgi solo un anno dopo.

## Cosa c'è davvero dentro un QR code

Una stringa. È tutto lì. Scansionare un QR code consegna al telefono un pezzo di testo, e tutto il resto, cioè aprire una pagina, collegarsi a una rete, proporre di salvare un contatto, è il telefono che riconosce la forma di quel testo e propone di agire di conseguenza.

Quindi il «QR code del Wi-Fi» come tipo di codice non esiste. Esiste un QR code che contiene `WIFI:T:WPA;S:La mia rete;P:la password;;`, che ogni telefono fatto nell'ultimo decennio sa leggere. Il generatore ti mostra la stringa finita esattamente per questo: quando un codice non fa quello che ti aspettavi, la stringa è l'unica cosa che vale la pena guardare.

Vuol dire anche che un QR code non si può cambiare dopo che è stato stampato, non può chiamare casa, e non può scadere, a meno che qualcuno non ci abbia messo dentro un link al proprio server, che è l'argomento dell'ultima sezione di qui.

![Un codice QR finito con i suoi dati sotto: la simbologia, la versione, il livello di correzione degli errori e il numero di caratteri che contiene.](https://abox.tools/screens/make-a-qr-code/result.webp)

Cosa c'è nel codice, detto con i termini che usa il resto di questa guida. La versione cresce con il contenuto, ed è per questo che contano le due impostazioni sotto.

## Decisione uno: il livello di correzione d'errore

Un QR code porta con sé una serie di parole di controllo accanto ai dati, calcolate in modo che un lettore possa ricostruire quello che non è riuscito a vedere. È per questo che un codice con un angolo strappato si legge lo stesso. Quante siano quelle parole di controllo è il livello, e i livelli sono quattro:

- **L**, si può perdere circa il 7% del codice.
- **M**, circa il 15%.
- **Q**, circa il 25%.
- **H**, circa il 30%.

Più correzione non è gratis: i dati di controllo entrano nello stesso quadrato, quindi lo stesso testo a H ha bisogno di un codice più grande e più fitto che a L. All'incirca, passare da L a H raddoppia il numero di moduli per la stessa stringa, e moduli più fitti sono più difficili da risolvere per una fotocamera. Qui c'è uno scambio vero, e la risposta dipende da dove va il codice.

**L** è per uno schermo: un codice in una diapositiva, in una mail, in una pagina web. Non c'è niente che lo danneggerà, e ogni modulo in più lo rende più difficile da leggere a distanza.

**M** è il valore predefinito ed è la risposta giusta per quasi tutte le stampe: carta che verrà maneggiata un po', un volantino, un biglietto da visita.

**Q e H** sono per i codici che verranno maltrattati: un menu pulito tutti i giorni, un adesivo su una macchina in officina, un'etichetta su una cassa, un codice in una vetrina che prende il sole diretto. H è anche quello che rende possibile un logo in mezzo, come vedi più sotto.

![Le opzioni del QR: un menu del livello di correzione degli errori impostato su medio e una zona di rispetto di quattro moduli.](https://abox.tools/screens/make-a-qr-code/options.webp)

Entrambe servono a far sopravvivere il codice al mondo reale, una piega, un logo, una brutta stampa, ed entrambe si impostano prima che venga disegnato.

## Decisione due: il margine, che è parte del codice

Lo spazio bianco attorno a un QR code non è imbottitura, e non è una scelta grafica. Un lettore lo usa per capire dove finisce il simbolo. La specifica chiede quattro moduli di spazio libero su ogni lato, e un codice tagliato al bordo è di gran lunga il motivo più comune per cui un codice stampato fallisce.

Vale la pena essere schietti, perché tagliare è una cosa così naturale da fare. Il codice sembra avere troppo bianco attorno, quindi viene ritagliato nell'impaginazione, oppure appoggiato su un pannello colorato che arriva fin contro i quadrati, oppure messo su una fotografia. Ognuna di queste cose toglie il confine che il lettore stava per usare.

Se il codice con il suo margine sembra troppo grande, rimpicciolisci il codice. Non togliere il margine.

## Decisione tre: quanto grande stamparlo

La regola pratica che ha retto al contatto con la realtà è **uno a dieci**: un codice deve essere largo circa un decimo della distanza da cui verrà scansionato.

- Un biglietto da visita o un menu, letto a 30 cm: circa 2 cm di lato.
- Un manifesto letto da due metri: circa 20 cm.
- Una pensilina o una vetrina letta da cinque metri: circa 50 cm.

Due centimetri sono un pavimento più che un obiettivo. Sotto 1,5 cm circa un telefono comune comincia a faticare a prescindere da quanto sia buona la stampa, perché i singoli moduli si avvicinano alla dimensione di un pixel della sua fotocamera.

Meno testo vuol dire meno moduli, e meno moduli vuol dire un codice che a parità di dimensione di stampa si legge da più lontano. È un buon motivo per far puntare un codice a `esempio.it/x` invece che a un URL con in fondo cento caratteri di parametri di tracciamento.

E stampa dall'**SVG**. Un QR code è fatto di bordi, e un PNG ha un numero fisso di pixel con cui farli: ingrandiscine uno e ogni bordo si ammorbidisce, che è esattamente quello con cui uno scanner fa fatica. Un SVG sono i quadrati scritti come istruzioni, quindi esce nitido su un biglietto da visita come su un cartellone.

## Colore, contrasto, e i due errori

Un lettore misura la differenza tra i moduli scuri e quelli chiari, quindi il contrasto è tutto. Ci sono due cose che vanno storte con regolarità.

**Codice chiaro su sfondo scuro.** Fa colpo, e parecchi lettori lo rifiutano subito, perché cercano scuro su chiaro e l'inversione non la provano nemmeno. Qualcuno la prova. Quali abbiano i tuoi clienti non lo saprai.

**Differenza insufficiente.** Grigio medio su bianco, o due colori aziendali di peso simile, possono misurare bene sullo schermo e fallire su carta una volta che entrano in gioco lo spandimento dell'inchiostro e l'esposizione automatica di un telefono. Se stai colorando un codice, tieni la parte scura davvero scura.

L'opaco batte il lucido per qualunque cosa verrà scansionata sotto una luce, e tutti e due battono lo stampare sopra una fotografia. Gli sfondi trasparenti sono utili per mettere un codice su un pannello colorato, ma controlla cosa ci finisce davvero dietro, perché un codice trasparente su un pannello scuro è il primo errore qui sopra con qualche passaggio in più.

## Un logo in mezzo

Funziona, e funziona grazie alla correzione d'errore e non a suo dispetto. Al livello H si può distruggere all'incirca il 30% dei moduli e il codice si legge lo stesso, quindi un logo che ne copre parecchi di meno, al centro, dove non c'è nessun pattern di ricerca, è un danno che il lettore ripara.

Ci sono tre cose a cui attenersi. Usa il livello H. Tieni il logo sotto un quinto circa dell'area, ben al di sotto del limite teorico, perché la stampa non è l'unica cosa che ti mangia il margine. E non coprire mai i tre quadrati grandi negli angoli né quelli più piccoli lì vicino: sono il modo in cui un lettore trova e orienta il simbolo fin dall'inizio, e nessuna quantità di correzione d'errore li ricostruisce.

Poi provalo su telefoni veri. Un logo porta un codice da «funziona sempre» a «funziona con questo margine», e l'unico modo per sapere quanto margine resta è provare.

## La decisione di cui ci si pente: statico o «dinamico»

Cerca un generatore di QR code e quasi tutti i risultati vogliono che tu faccia un account, perché vendono codici *dinamici*. Un codice dinamico il tuo link non ce l'ha dentro: contiene un link corto al server del generatore, che rimanda al tuo.

Quello che ci guadagni è reale: puoi cambiare dove punta il codice dopo che è stato stampato, e ottieni un conteggio di ogni scansione. Per una campagna con una tiratura a sei cifre, vale i soldi che costa.

Quello che costa è altrettanto reale, e vale la pena saperlo prima e non dopo:

- **Il codice smette di funzionare quando smettono loro.** Se il servizio chiude, il dominio scade, o il piano gratuito finisce, ogni codice che hai stampato muore, e a quel punto sono su diecimila menu.
- **Ogni scansione è un dato di qualcun altro.** Il rimando vede l'indirizzo IP, l'ora e il dispositivo di ogni persona che scansiona il tuo codice.
- **Il link è loro, non tuo.** Chiunque lo scansioni vede passare un dominio sconosciuto, che è esattamente quello di cui alla gente viene detto di diffidare.

La via di mezzo non costa niente: metti un QR code statico attorno a un URL corto *sul tuo dominio*, e reindirizzalo tu. Ti tieni la possibilità di cambiare la destinazione, ti tieni le statistiche, e niente del codice dipende dal fatto che un'azienda che non hai mai incontrato esista ancora l'anno prossimo.

Il [generatore di qui](https://abox.tools/it/creare-qr-code/) fa solo codici statici, e non ha nessun account da creare. Quello che scrivi è quello che il codice contiene.

## Prima di stamparne mille

Scansiona il codice. Non quello sullo schermo, ma la prova stampata, nel posto dove andrà, con un telefono che non è quello su cui l'hai fatto. Ci vuole un minuto e prende tutta la categoria di problemi di cui parla questa pagina: un margine che l'impaginazione si è mangiata, un link a cui manca l'`https://`, un colore che su carta ha misurato in modo diverso, un codice stampato a una dimensione che funziona su una scrivania e non su un muro.

E controlla cosa succede dopo la scansione. Un codice che apre una pagina illeggibile su un telefono è un codice fallito, anche se si è letto.

## Niente di tutto questo richiede di caricare qualcosa

Un QR code è aritmetica su una stringa. Non c'è nessun file da spedire e non c'è niente che un server sappia fare e un browser no, ed è per questo che lo [strumento di qui](https://abox.tools/it/creare-qr-code/) fa tutto sul tuo dispositivo e funziona con la rete staccata.

Conta più di quanto sembri, per quello che la gente mette nei QR code. L'uso più comune del formato Wi-Fi è la password vera di una rete, digitata dentro una pagina web. Vale la pena sapere se quella pagina aveva un posto dove mandarla.
