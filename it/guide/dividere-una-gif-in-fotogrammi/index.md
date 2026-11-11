# Come dividere una GIF in fotogrammi

Tirare fuori i fotogrammi costa un trascinamento e un pulsante. Quello che vale la pena capire è cosa sia davvero un «fotogramma» di una GIF, perché il formato conserva qualcosa di piuttosto diverso da quello che vedi — ed è per quello che il quattordicesimo fotogramma è un rettangolo con dentro la bocca di qualcuno.

[Apri Divisore di GIF](https://abox.tools/it/dividere-gif-in-fotogrammi/): Ogni fotogramma fuori, nel suo PNG.

Ultimo aggiornamento 26 agosto 2026

## La risposta corta

Apri il [divisore di GIF](https://abox.tools/it/dividere-gif-in-fotogrammi/), trascinaci dentro la GIF, e ogni fotogramma compare come PNG da scaricare — uno alla volta, o tutti insieme in un unico ZIP. Lascia stare le impostazioni e ottieni esattamente quello che quasi tutti intendono: ogni fotogramma come immagine intera, com'è in quel momento dell'animazione.

Il resto di questa pagina riguarda le tre cose che dopo sorprendono: un fotogramma che è solo un pezzetto, una trasparenza che altrove diventa nera, e i tempi, che non esistono più appena i fotogrammi sono file separati.

## Cos'è davvero un fotogramma di una GIF

Una GIF non è una pila di immagini. È *un'*immagine, seguita da una serie di toppe.

Ogni fotogramma dopo il primo conserva solo il rettangolo che è cambiato, insieme a una regola su cosa fare della tela subito dopo. Tutto il resto sullo schermo è semplicemente quello che ci hanno lasciato i fotogrammi precedenti. Una persona che parla davanti a un muro fermo costa un rettangolo di faccia per fotogramma invece di un'immagine intera per fotogramma, ed è tutta lì la ragione per cui un formato senza compensazione del movimento e senza passaggi con perdita non è del tutto inservibile.

Ci sono quindi due risposte diverse, e ugualmente oneste, a «dammi il fotogramma 14», e lo strumento le offre entrambe:

**Il fotogramma com'è a vedersi.** L'immagine intera in quel momento: il quattordicesimo disegnato sopra a tutto quello che viene prima. È l'impostazione predefinita, ed è quello che vuoi per un provino a contatto, una miniatura, un fermo immagine da pubblicare, o dei fotogrammi che finiscono in un programma di montaggio.

**Solo i pixel che quel fotogramma conserva.** La toppa in sé, alla sua misura, nella sua posizione, con tutto quello che non porta lasciato trasparente. Il fotogramma 14 potrebbe essere ⁦60 × 40⁩ pixel di bocca. È la vista che spiega dove sono finiti i byte di una GIF, ed è quella che vuoi se stai lavorando sull'animazione invece di raccogliere immagini da lei.

Quando un fotogramma conservato sembra un frammento, il tuo file non ha niente che non va. Quello è il file.

![Dodici fotogrammi numerati di un'animazione, ciascuno mostrato come immagine intera con il tempo per cui resta a schermo.](https://abox.tools/screens/split-a-gif-into-frames/frames.webp)

Ogni fotogramma come immagine intera, che non è quello che c'è nel file: questa sezione parla della differenza.

## La regola di smaltimento, e perché certi fotogrammi lasciano buchi

Ogni fotogramma porta con sé anche una di quattro istruzioni su cosa succede al suo rettangolo prima che venga disegnato il successivo. Lo strumento la mostra sotto a ogni fotogramma nella vista di quello che è conservato:

**Resta sullo schermo.** Quella solita. La toppa resta dov'è arrivata e il fotogramma dopo ci disegna sopra.

**Pulisce la sua area dopo.** Il rettangolo viene cancellato prima che atterri il fotogramma successivo. È quello che fa un'animazione con un oggetto trasparente che si muove, ed è anche la causa classica delle GIF che sfarfallano.

**Rimette quello che c'era sotto.** La tela torna com'era prima che questo fotogramma disegnasse — un timbro, e poi un annulla. Rara, e quella che i lettori di GIF fatti in casa sbagliano più spesso.

Un dettaglio che vale la pena sapere se confronti gli strumenti: la specifica dice che «pulisce la sua area» dovrebbe rimettere il *colore di sfondo*, ma tutti i browser dagli anni Novanta in poi puliscono verso il *trasparente*, perché è quello che davano per scontato le animazioni dell'epoca. Questo strumento segue i browser di proposito, così i fotogrammi che ottieni sono i fotogrammi che hai visto.

![La scheda delle impostazioni: la scelta fra il fotogramma come appare e la toppa grezza conservata nel file, con un colore di sfondo per le parti trasparenti.](https://abox.tools/screens/split-a-gif-into-frames/settings.webp)

La modalità come appare ripete le regole di smaltimento e ti consegna immagini. L'altra ti consegna quello che c'è davvero nel file, buchi compresi.

## Che fine fa la trasparenza

La trasparenza della GIF è un bit. Un pixel o è dipinto o è invisibile, e in mezzo non c'è niente — niente bordi morbidi, niente ombre parziali. È per questo che una GIF con lo sfondo trasparente ha quel contorno duro e un po' seghettato.

Il PNG conserva esattamente quello, senza perdita, così i fotogrammi escono con la trasparenza intatta e non viene inventato niente. Tienila, se i fotogrammi vanno da qualche parte che di trasparenza se ne intende.

Riempila con un colore, se invece non è così. I programmi che ignorano un canale alfa di solito lo disegnano nero, quindi un fotogramma che nel browser stava benissimo arriva con lo sfondo nero — e una toppa conservata, che è trasparente quasi ovunque, arriva come un rettangolo nero con dentro una bocca. Scegliere il colore prima è il rimedio. Viene scritto nel PNG e non si torna indietro, che è l'unica ragione per cui non è l'impostazione predefinita.

## I tempi, che i fotogrammi non possono portarsi dietro

Un PNG non ha nessun posto dove annotare quanto è rimasto sullo schermo. Dividi un'animazione in PNG e i tempi spariscono, il che conta nel momento esatto in cui vuoi rimetterla insieme.

A questo serve il `frames.txt` dentro allo ZIP. Elenca ritardo, posizione e misura di ogni fotogramma, così l'animazione si può ricostruire nel [creatore di GIF](https://abox.tools/it/creare-gif/) o altrove. Costa un paio di kilobyte, e non c'è modo di rimetterlo insieme dopo.

Due cose sui ritardi delle GIF che prendono in contropiede tutti:

**L'unità è il centesimo di secondo**, quindi il passo più fine che il formato ha è 0,01 s. Una GIF esattamente a 30 fps non esiste: 0,03 s a fotogramma fanno 33,3 fps e 0,04 s fanno 25.

**Qualsiasi cosa sotto 0,02 s viene riprodotta a 0,10 s.** I browser lo limitano dagli anni Novanta — una regola scritta per i mappamondi rotanti dell'epoca e mai più tolta. Una GIF il cui file dice 0,01 s per fotogramma dichiara 100 fps e va a 10. Lo strumento mostra il ritardo com'è davvero riprodotto, e accanto dice cosa c'è nel file quando i due non coincidono, perché è proprio quello scarto la ragione per cui una GIF divisa e rimessa insieme può uscire più lenta dell'originale.

## I numeri dei fotogrammi, e perché hanno gli zeri davanti

I fotogrammi escono come `nome-001.png`, `nome-002.png`, numerati da uno e riempiti di zeri fino alla larghezza dell'ultimo numero. Non è un ornamento: `fotogramma9.png` si ordina *dopo* `fotogramma10.png` in qualsiasi gestore di file e in quasi tutti i programmi che importano una sequenza, perché ordinano testo e non numeri. I nomi con gli zeri si ordinano bene dappertutto, e ogni programma di montaggio che importa una sequenza di immagini se li aspetta così.

Alleggerire un'animazione lunga con «tieni un fotogramma su due» non rinumera niente. Il fotogramma 42 si chiama ancora 42, così i file si allineano con l'originale e con l'elenco dei tempi.

## Perché questo non ha bisogno di un server

Leggere una GIF sono due lavori: camminare per i blocchi del file, e disfare la compressione LZW dentro cui i suoi pixel sono avvolti. Insieme fanno qualche centinaio di righe, sono scritte per esteso nel repository, e girano sulla tua macchina — ed è per questo che la pagina continua a funzionare con la rete staccata.

Il tuo browser una GIF sa già riprodurla, ma i pezzi non te li consegna: un `<img>` ti dà un'animazione, disegnarne una su una tela ti dà per sempre il primo fotogramma, e l'unica interfaccia che fa di più a Safari manca. Così qui il formato viene letto per conto proprio, allo stesso modo in ogni browser — e leggerselo da soli è anche quello che rende possibile mostrarti le toppe e le regole di smaltimento.

[È sicuro caricare i propri file sui convertitori online?](https://abox.tools/it/guide/e-sicuro-caricare-i-propri-file/) mette in fila quattro controlli che ti diranno la stessa cosa su qualsiasi strumento, questo compreso.
