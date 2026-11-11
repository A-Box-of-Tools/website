# Come creare una miniatura video dal fotogramma esatto

La differenza tra una miniatura e uno screenshot sta in circa un quarto di secondo: il fotogramma in cui gli occhi sono aperti e il pallone è ancora in aria. Arrivare a quel fotogramma, alla misura della piattaforma, sotto il suo limite di byte, è una catena di tre passi che gira per intero nel tuo browser.

Ultimo aggiornamento 26 agosto 2026

## La risposta breve

1. **Prendi il fotogramma.** Apri l'[Estrattore di fotogrammi](https://abox.tools/it/estrarre-fotogramma-video/), trascina dentro il video e avanza lungo la lista dei fotogrammi del file stesso fino all'istante esatto. Salvalo come PNG: la copia senza perdite, così non è ancora deciso niente.
2. **Inquadra il fotogramma.** Porta il PNG al [Ridimensiona immagini](https://abox.tools/it/ridimensionare-immagine/): ritaglia alla forma della piattaforma — 16:9 per YouTube — e fissa il lato lungo; 1280 pixel è il numero che YouTube chiede davvero.
3. **Centra il tetto.** Chiudi nel [Comprimi immagini](https://abox.tools/it/comprimere-immagine/) con il limite della piattaforma come obiettivo — 2 MB per una miniatura di YouTube — e lasciagli scegliere JPEG o WebP.

Niente nella catena carica niente: cosa che conta quando il video non è pubblicato, e una miniatura si fa proprio perché il video non è ancora pubblico.

## Perché avanzare batte mettere in pausa

Mettere in pausa un player e fare uno screenshot perde due volte. La pausa cade dove il player è riuscito a fermarsi — il punto più vicino, non il fotogramma che intendevi — e lo screenshot è una foto del player: la sua risoluzione, la sua interfaccia, la sua gestione del colore, non quelle del file.

L'estrattore percorre invece la lista dei fotogrammi del file stesso, un fotogramma alla volta in entrambe le direzioni, e ti consegna il fotogramma decodificato in sé, alla piena risoluzione del video. Un quarto di secondo di ricerca ai due lati del momento è di solito dove abita la miniatura: il fotogramma *tra* i due ovvi, dove il movimento si legge e niente è mosso.

Salva la presa come PNG anche se la miniatura finale sarà JPEG o WebP. Il PNG è una copia esatta del fotogramma; ogni decisione con perdita avviene allora una volta sola, alla fine, dentro un budget di byte, invece che due volte, sommandosi.

![Un fermo immagine da un video con il codice di tempo visibile, accanto ai comandi passo passo e di scorrimento e all'istante esatto da cui è stato preso.](https://abox.tools/screens/make-a-video-thumbnail/frame.webp)

Arrivare al fotogramma, invece di mettere in pausa e fare una schermata. La sezione sopra dice in cosa consiste davvero la differenza.

## L'aritmetica della piattaforma

Ritaglia prima di comprimere, per la stessa ragione che dà la [guida alle foto](https://abox.tools/it/guide/preparare-le-foto-per-il-web/): i pixel sono il budget. Un ritaglio 16:9 di un fotogramma 4K portato a ⁦1280×720⁩ lascia che il compressore spenda i suoi 2 MB in qualità che nessuno dovrà strizzare gli occhi per vedere. Il riquadro di ritaglio del ridimensiona si blocca sul 16:9, quindi la forma è un trascinamento e non un calcolo; testo e volti vogliono stare nei due terzi centrali, perché i feed arrotondano gli angoli e sovrappongono la durata in basso a destra.

![Il ridimensionatore con una larghezza di 1280 e un'altezza di 720 inserite, e un riepilogo di come verrà il fermo immagine.](https://abox.tools/screens/make-a-video-thumbnail/size.webp)

E poi l'aritmetica: qualunque cosa chieda la piattaforma, scritta come due numeri.

## Un provino a contatto, quando il momento non si trova

Quando l'attimo giusto è da qualche parte in dieci minuti di girato, l'altra modalità dell'estrattore salva un fermo immagine ogni N secondi e consegna il tutto in uno ZIP. Scorri i fermi come un provino a contatto, segnati il tempo del più vicino, e avanza da lì. È più rapido che strofinare la barra, e lascia una cartella di candidati per il giorno in cui la piattaforma chiederà un'altra forma.

## Se lo fai ogni settimana

Che i passi vivano qui su tre pagine è voluto: ogni pagina fa un lavoro, e ognuna può dimostrare da sola che niente lascia la tua macchina. Ma ogni passo è open source: licenza MIT, una cartella per strumento, moduli ES senza dipendenze con README che spiegano il decoder, il ricampionamento e la ricerca dell'obiettivo di byte.

Se le miniature sono una consegna settimanale, punta un agente di codice sul [repository](https://github.com/A-Box-of-Tools/website) e chiedigli la versione in una pagina: avanzare, ritagliare al preset della tua piattaforma, comprimere al suo tetto, un pulsante. I moduli sono scritti per essere letti, e portarseli via è esattamente ciò per cui la licenza esiste.
