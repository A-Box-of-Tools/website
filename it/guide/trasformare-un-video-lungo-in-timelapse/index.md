# Come trasformare un video lungo in un timelapse

Un'ora di tramonto, una giornata di cantiere, il tragitto quotidiano attraverso il parabrezza: girato che vale la pena, a una velocità che nessuno starà a guardare. Il lavoro è una decisione sul tempo e una sulla destinazione, e tutto gira nel tuo browser, su un file che non lascia mai la tua macchina.

[Apri Creatore di timelapse](https://abox.tools/it/creare-timelapse/): Un'ora di girato in venti secondi.

Ultimo aggiornamento 26 agosto 2026

## La risposta breve

Apri il [Creatore di timelapse](https://abox.tools/it/creare-timelapse/), trascina dentro la registrazione, e imposta o una velocità — qualsiasi cosa da 1,1× a 1000× — oppure, senza far di conto, quanto deve durare il risultato. Sessanta secondi sono un buon punto di partenza per tutto ciò che va in un feed. Scegli i fotogrammi al secondo, riduci la misura se l'originale è in 4K, ed esporta.

Se la destinazione anima solo GIF, passa poi il clip esportato per il convertitore [Video in GIF](https://abox.tools/it/video-in-gif/); ma leggi prima l'ultima sezione, perché un timelapse è la cosa più costosa che si possa chiedere a una GIF di reggere.

Quel viaggio è già previsto: dopo l'esportazione, una riga sotto il pulsante di download offre di portare il risultato dritto nel convertitore, e la clip arriva già caricata.

## Di' la durata, non la velocità

«Quanto veloce» è la domanda sbagliata, perché la risposta onesta è una divisione che non dovresti dover fare: novanta minuti di girato in un minuto di risultato fanno 90×; una giornata di cantiere in trenta secondi sta più vicina a 3000× che a qualsiasi cosa suggerisca un cursore. Lo strumento prende la durata finale direttamente e si calcola il fattore da solo, così la risposta sopravvive al giorno in cui infili una registrazione più lunga.

A cosa serve ancora un fattore di velocità sono i numeri piccoli. Tra 1,1× e 2× un video resta *guardabile come video* — una lezione, una dimostrazione — e sopra circa 8× smette di essere riproduzione veloce e diventa un timelapse, dove ogni fotogramma in uscita è un campione colto dal flusso del tempo e tutto ciò che sta tra i campioni semplicemente non c'è più.

Quel campionare è anche il motivo per cui il lavoro è rapido. Lo strumento legge solo gli istanti che servono all'uscita — a 100×, circa un centesimo del file — invece di decodificare un'ora per tenerne un minuto.

![La scheda della velocità: una velocità di venti volte, la durata che ne risulta, l'intervallo fra i fotogrammi conservati e una frequenza di fotogrammi.](https://abox.tools/screens/turn-a-long-video-into-a-timelapse/speed.webp)

Di' la durata che vuoi e la velocità viene da sé, o viceversa. L'intervallo è il numero che dice quanto dell'originale viene saltato.

## Fotogrammi e misura, in breve

- **Fotogrammi al secondo.** 30 si legge come movimento fluido per quasi tutto; 60 si guadagna il peso doppio solo quando il movimento è il soggetto, e 24 dà a nuvole e folle un gradevole ticchettio da pellicola.
- **Misura.** Un timelapse si guarda quasi sempre in piccolo. Ridurre il 4K a 1080p porta a un quarto i pixel che l'encoder deve descrivere, e sullo schermo di un telefono nessuno lo saprà mai.

![Il riepilogo della scheda di esportazione: il numero di fotogrammi, l'intervallo, la durata finale, la dimensione stimata e quanto del file va letto.](https://abox.tools/screens/turn-a-long-video-into-a-timelapse/summary.webp)

L'ultima riga è quella da notare: un timelapse legge una frazione del file, ed è per questo che è veloce su una clip che a ricodificarla ci metterebbe un'ora.

## Quando il timelapse vuole essere una GIF

Quasi mai. Un timelapse è cambiamento costante dell'intero quadro — esattamente ciò in cui la compressione GIF è peggiore — così anche uno corto finisce nelle decine di megabyte mentre l'MP4 ne pesa un decimo, più nitido. Pubblica il video ovunque il video si riproduca.

Quando la destinazione davvero anima solo GIF, taglia la sequenza a pochi secondi che girino in loop nella [timeline del convertitore](https://abox.tools/it/video-in-gif/), tieni la larghezza modesta e lascia scendere i fotogrammi a ⁦10–12⁩. La [guida alla GIF parziale](https://abox.tools/it/guide/gif-da-una-parte-di-un-video/) è la versione lunga di quel budget.

## Se lo fai ogni settimana

Che i due passi vivano qui su due pagine è voluto: ogni pagina fa un lavoro, e ognuna può dimostrare da sola che niente lascia la tua macchina. Ma tutto quello che le due pagine eseguono è open source: licenza MIT, una cartella per strumento, moduli ES senza dipendenze con un README che li nomina uno per uno.

Se una macchina su treppiede fa parte della tua routine, punta un agente di codice sul [repository](https://github.com/A-Box-of-Tools/website) e chiedigli di comporre il campionatore e l'encoder GIF in una pagina con la tua velocità e la tua misura già impostate. I moduli sono scritti per essere letti, e portarseli via è esattamente ciò per cui la licenza esiste.
