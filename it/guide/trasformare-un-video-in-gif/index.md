# Come trasformare un video in una GIF

La GIF è un formato del 1987 che conserva immagini intere invece del movimento, quindi una GIF fatta da un video è sempre pesante. Vediamo quale delle tre impostazioni muovere quando pesa troppo, e quanto ti fa guadagnare ciascuna.

[Apri Da video a GIF](https://abox.tools/it/video-in-gif/): Scegli il pezzo, la dimensione e la frequenza dei fotogrammi.

Ultimo aggiornamento 26 agosto 2026

## La risposta corta

Apri il [convertitore da video a GIF](https://abox.tools/it/video-in-gif/), trascinaci dentro la clip, segna i secondi che vuoi, e lascia la larghezza a 480 e la frequenza a 12 fotogrammi al secondo. È l'impostazione che vuole quasi ogni GIF. Se il file esce troppo pesante, abbassa la larghezza prima di toccare qualunque altra cosa, perché è quella che rende il doppio.

Il resto di questa pagina riguarda il perché, visto che «la mia GIF pesa 14 MB» è il problema che hanno davvero tutti, e quale manopola girare non è per niente ovvio.

## Perché una GIF fatta da un video è così enorme

Un codec video conserva il *movimento*. Scrive un'immagine completa ogni due secondi circa e poi, per ogni fotogramma in mezzo, una descrizione di come quell'immagine si è spostata: questo blocco di pixel è scivolato di quattro a sinistra, questa zona si è un po' scurita. Una clip di cinque secondi può pesare qualche centinaio di kilobyte proprio perché quasi tutta è fatta di istruzioni su un'immagine che hai già.

La GIF di tutto questo non ha niente. È stata finita nel 1989, prima che esistesse. Ogni fotogramma è un'immagine, compressa per conto suo con uno schema pensato per gli screenshot di un foglio di calcolo. Nel formato non c'è nessuna stima del movimento, e non c'è modo di aggiungerne una.

Quindi il numero da aspettarsi è **dieci volte il peso del video**, e non c'è convertitore che ti possa convincere del contrario. Quello che un buon convertitore può fare è non sprecare niente sopra a quel numero, e darti le tre impostazioni che lo decidono davvero.

![La scheda della sezione: un fotogramma di video con il codice di tempo e una barra che mostra un pezzo di quattro secondi marcato dentro una clip di venti.](https://abox.tools/screens/turn-a-video-into-a-gif/section.webp)

Prima la sezione, perché ogni impostazione sotto viene moltiplicata per i secondi che hai tenuto.

## Le tre impostazioni, e quanto costa ciascuna

Tutto quello che riguarda il peso di una GIF si riduce a quanti pixel contiene, cioè la durata per la frequenza per l'area di un fotogramma.

- **Il pezzo, che cresce lineare.** Il doppio della durata sono il doppio dei fotogrammi e all'incirca il doppio del file. È quello che quasi tutti capiscono già, e vale la pena essere spietati: una GIF che dice quello che deve dire in tre secondi è una GIF migliore oltre che più leggera.
- **La larghezza, che cresce al quadrato.** Dimezzare la larghezza dimezza anche l'altezza, quindi è un *quarto* dei pixel. Passare da 640 a 320 non risparmia poco meno della metà: risparmia circa tre quarti. È l'impostazione che nessuno va a cercare per prima, ed è quella che rende meglio.
- **La frequenza dei fotogrammi, di nuovo lineare.** Dieci fotogrammi al secondo pesano due terzi di quindici. È anche l'impostazione in cui la perdita si vede di più, perché un movimento troppo lento si legge come rotto e non come leggero.

Facciamo un esempio. Sei secondi di una clip da telefono alla sua ⁦1080×1920⁩ e a 30 fps sono 180 fotogrammi da due milioni di pixel: circa 350 milioni di pixel, che non è una GIF, è un agguato. Gli stessi sei secondi a 480 di larghezza e 12 fps sono invece 72 fotogrammi da 400.000 pixel, cioè 30 milioni, all'incirca un dodicesimo, e si presentano come quello che la gente intende per GIF.

![La scheda di esportazione: una larghezza di 480, una frequenza di fotogrammi, una scelta di retinatura e un riepilogo che stima fotogrammi e dimensione.](https://abox.tools/screens/turn-a-video-into-a-gif/size.webp)

Tre impostazioni e una stima che si muove con loro. Quale spendere per prima è l'argomento di questa sezione.

## Quale frequenza scegliere

Dodici è il valore predefinito di qui, ed è la risposta giusta sorprendentemente spesso. È la frequenza che l'animazione disegnata a mano usa da un secolo: abbastanza rapida perché l'occhio la legga come movimento continuo, abbastanza lenta da non farti pagare fotogrammi che nessuno può vedere.

- **⁦5–8⁩** è effetto presentazione. Va bene per una panoramica lenta o per una registrazione dello schermo dove non si muove niente in fretta.
- **⁦10–15⁩** è la fascia normale, quella che si legge come movimento. Quasi ogni GIF che valga la pena fare sta qui dentro.
- **⁦20–25⁩** è fluido, e pesa all'incirca il doppio di 12 per una differenza che quasi nessuno saprebbe nominare. Vale la pena per il movimento veloce, una clip sportiva, qualunque cosa con dentro una panoramica a frusta.

C'è poi un tetto rigido che tanto vale conoscere: la GIF conserva quanto ogni fotogramma resta sullo schermo in centesimi di secondo, e ogni browser tratta un ritardo sotto i due centesimi come dieci. Quindi il massimo vero sono 50 fotogrammi al secondo, e un file che ne chiede 100 andrà in silenzio a 10. Un convertitore che ti propone 60 fps o sta ignorando la cosa, o sta per sorprenderti.

## 256 colori, e a cosa serve il dithering

L'altra metà dell'età del formato: una GIF porta con sé una tabella di al massimo 256 colori, e ogni pixel è un numero che punta lì dentro. Un fotogramma di video ne ha fino a sedici milioni. Quasi tutti vengono buttati, e il modo in cui vengono buttati è la maggior parte di come si presenta una GIF.

Un buon convertitore conta i colori nella *tua* clip e ne sceglie 256 che le si addicono, invece di usare un insieme fisso. Un'inquadratura di un bosco riceve 256 verdi, una di un tramonto riceve 256 arancioni. È quello che fa lo strumento di qui, su ogni fotogramma del pezzo e non solo sul primo, così anche un colore che compare solo alla fine ottiene un posto.

Il **dithering** è quello che succede dove il colore che ti serve manca comunque. Invece di arrotondare tutta una zona al colore disponibile più vicino, cosa che trasforma un cielo morbido in quattro fasce piatte con gradini visibili in mezzo, alterna i due colori più vicini secondo uno schema fine, e a una normale distanza di visione il tuo occhio li mescola in quello che non c'è.

- **Lascialo attivo** per qualunque cosa fotografica: cieli, pelle, sfumature, ombre, pellicola.
- **Spegnilo** per le tinte piatte: registrazioni dello schermo, disegni al tratto, loghi, cartoni animati, qualunque cosa con grandi aree di una sola tinta. Non c'è nessuna sfumatura da proteggere, e senza il file è più leggero e più pulito.

Un dettaglio da sapere, se ti capita di confrontare dei convertitori. Il modo ovvio di fare dithering è la diffusione dell'errore, quella che usa quasi ogni programma di grafica, e fa dipendere il risultato di ogni pixel dai pixel attorno. In un'animazione questo vuol dire che uno sfondo che non si muove viene comunque ditherato in modo diverso a ogni fotogramma, quindi brulica visibilmente, e ogni fotogramma va conservato per intero perché tecnicamente ogni pixel è cambiato. L'alternativa, un dithering ordinato, dipende solo da dove sta un pixel, quindi uno sfondo fermo resta perfettamente fermo. È quello che usa questo strumento, ed è il motivo per cui i suoi file sono insieme più leggeri e più tranquilli.

## Quando non fare affatto una GIF

Vale la pena chiederselo, perché la risposta onesta è spesso «non farla». Un MP4 o un WebM muto che si ripete pesa circa un decimo della stessa animazione come GIF, si comporta allo stesso modo, ed è quello in cui ogni piattaforma social converte comunque la tua GIF dopo che l'hai caricata.

Tieni la GIF dove la destinazione ne ha davvero bisogno:

- un posto che accetta solo un'immagine, come parecchi programmi di chat, forum, wiki e posta;
- un README o una pagina di documentazione, dove una GIF si riproduce nel testo e un video ha bisogno di un lettore;
- una presentazione o un documento che deve continuare a muoversi offline;
- un'emoji, uno sticker, una reazione: cose abbastanza piccole perché tutta l'aritmetica del peso qui sopra non conti.

Dove conta il suono, la domanda si risponde da sola: la GIF l'audio non l'ha mai avuto e non lo avrà mai. Taglia invece il video, perché il [tagliavideo](https://abox.tools/it/tagliare-video/) ne tira fuori un pezzo senza ricodificarne un fotogramma.

## Stare sotto un limite di peso

Quasi tutto il motivo per cui si mette a punto una GIF è un limite dall'altra parte. Più o meno in ordine di quanto mordono:

- **Posta.** Da 10 a 25 MB per tutto il messaggio, e un allegato vicino a quella soglia viene tolto o respinto da qualcosa lungo la strada. Punta molto più in basso.
- **Chat e forum.** Di solito da 8 a 10 MB, a volte molto meno per un'anteprima nel testo invece che per un download.
- **Un README su GitHub.** 10 MB per file, e qualunque cosa oltre un paio di megabyte fa sembrare rotta la pagina su un telefono.
- **Gli spazi per sticker ed emoji.** Spesso qualche centinaio di kilobyte, il che vuol dire una larghezza piccola e un pezzo corto, non una frequenza più bassa.

Quando sei sopra, l'ordine in cui provare è questo: accorcia il pezzo, poi dimezza la larghezza, poi abbassa la frequenza, poi spegni il dithering. Le prime due valgono più delle ultime due messe insieme.

## Niente di tutto questo ha bisogno di un caricamento

Convertire un video in una GIF vuol dire decodificare, ridimensionare, contare i colori e comprimere: quattro cose che un browser sa fare da solo da anni. Lo strumento collegato in cima le fa tutte sul tuo dispositivo, perché il file viene letto dal tuo disco, i fotogrammi vengono decodificati dal tuo browser, e la GIF viene assemblata in memoria e consegnata ai tuoi download.

Ed è una cosa a cui qui vale la pena tenere più del solito. Le clip che la gente trasforma in GIF sono personali: un momento di un video di famiglia, la registrazione dello schermo di qualcosa al lavoro, qualche secondo di una videochiamata. Un convertitore che vuole che vengano caricate ti sta chiedendo una copia di quelle cose, e per dire di sì non è rimasto nessun motivo tecnico.
