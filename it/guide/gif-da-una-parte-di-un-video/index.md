# Come fare una GIF da una parte di un video

Una GIF fatta dal clip intero è enorme, e quasi tutto quello che contiene non lo voleva vedere nessuno. Il lavoro in realtà sono due decisioni: prima quali secondi, poi quali impostazioni. Tutte e due avvengono sul tuo dispositivo, perché nessuno dei due strumenti carica niente.

Ultimo aggiornamento 26 agosto 2026

## La risposta breve

Per un solo momento continuo, apri il convertitore [Video in GIF](https://abox.tools/it/video-in-gif/), trascina dentro il video e segna la sezione sulla sua timeline: converte solo quello che sta tra i segni, quindi non c'è niente da tagliare in anticipo. Scegli larghezza e fotogrammi al secondo, ed esporta.

Per tutto ciò che è più di un momento — due gol della stessa partita, la preparazione e la battuta finale — monta prima il clip con il [Tagliavideo](https://abox.tools/it/tagliare-video/), poi passa il risultato al convertitore. Il tagliavideo unisce quante parti segnate vuoi in un solo file senza ricodificarle: quel primo passo non costa niente in qualità e pochi secondi in tempo.

Il passaggio è un clic: appena il tagliavideo esporta, una riga sotto il suo pulsante di download offre di portare il risultato dritto nel convertitore, e la clip arriva già caricata — niente da salvare e ritrascinare nel mezzo.

In entrambi i casi l'ordine è lo stesso: prima decidere i secondi, poi spendere le impostazioni. Il resto di questa pagina spiega perché quell'ordine conta molto più per una GIF che per qualsiasi altra cosa questo sito produca.

## Perché ogni secondo di GIF costa così tanto

Una GIF non è video. È una pila di immagini complete, ciascuna presa da una tavolozza di al massimo 256 colori, compressa con un metodo del 1987 che del movimento non sa nulla. Un codec moderno descrive cosa è *cambiato* tra i fotogrammi; una GIF in gran parte ripete quello che è rimasto uguale.

La conseguenza pratica: una GIF di dieci secondi, larga 480 pixel, a 12 fotogrammi al secondo pesa di norma ⁦5–10⁩ MB, dieci volte lo stesso clip in MP4, con una frazione della qualità. Il convertitore non c'entra; il formato è fatto così. La [guida alla conversione in GIF](https://abox.tools/it/guide/trasformare-un-video-in-gif/) spiega quando una GIF vale ancora la pena e quando serve meglio un video muto in loop.

Siccome il peso cresce con ogni fotogramma, i megabyte più economici da risparmiare sono secondi interi. Dimezzare la larghezza divide il peso circa per quattro; dimezzare i fotogrammi lo divide circa per due; ma tagliare materiale che non doveva esserci risparmia il suo costo intero e migliora il risultato: una GIF che parte sull'azione si legge meglio di una che ci arriva camminando per due secondi.

## Quando basta la timeline del convertitore

La timeline del convertitore segna una sezione: un inizio, una fine, e tutto quello che sta in mezzo diventa la GIF. Se il momento che vuoi è continuo, lungo quanto vuoi, quello è già tutto il lavoro, e mettere il tagliavideo davanti darebbe soltanto una seconda casa agli stessi due segni.

Metti i segni un filo più stretti che larghi. Un loop nasconde la cucitura quando l'ultimo fotogramma sta vicino al primo, e ogni fotogramma raspato via dalle estremità si ripaga in peso del file.

![La scheda della sezione: un fotogramma di video con il codice di tempo, e i punti di ingresso e uscita marcati a undici e quattordici secondi sulla barra sotto.](https://abox.tools/screens/make-a-gif-from-part-of-a-video/marks.webp)

Il convertitore ha i suoi punti di ingresso e uscita, e per un pezzo di tre secondi preso da una clip più lunga bastano da soli.

## Quando tagliare prima con il Tagliavideo

Il tagliavideo si guadagna il posto appena la GIF ha bisogno di più di un pezzo:

- **Più momenti, una GIF.** Segna ogni parte con `I` e `O` mentre il video scorre, riordina se il pezzo migliore deve aprire, ed esporta un solo file. Le parti vengono copiate, non ricodificate: il montaggio non perde niente.
- **Due video, una GIF.** Il tagliavideo accetta più di un file e unisce parti segnate attraverso di essi: copia dove i file concordano sul formato, ricodifica dove no, e dice quale delle due cose ha fatto.
- **Vuoi il clip anche come video.** L'MP4 montato vale la pena di tenerlo: è più piccolo e più nitido di qualsiasi GIF che ne uscirà, ed è la cosa giusta da pubblicare ovunque il video si riproduca.

Poi trascina il clip montato nel convertitore e non segnare niente: il file intero ormai è esattamente la GIF che intendevi.

## Spendere le impostazioni

Decisi i secondi, tre controlli fissano il peso, in ordine di quanto costano:

- **Larghezza.** La leva più grossa. 480 pixel bastano e avanzano per una chat o un forum; 320 si legge ancora bene per registrazioni di schermo senza testo. Il peso scende con il quadrato della larghezza.
- **Fotogrammi al secondo.** Tra 10 e 12 abita la maggior parte delle GIF; il movimento si legge ancora e il file si dimezza rispetto a 25. Sotto 8 comincia a sembrare una proiezione di diapositive.
- **Dithering.** Con 256 colori le sfumature morbide fanno bande. Il dithering ordinato scambia le bande con una trama fine; di solito rende meglio e comprime un po' peggio. Prova a esportare in tutti e due i modi: lavora la tua macchina, quindi un secondo tentativo non costa niente e non carica niente.

## Se lo fai ogni settimana

Che i due passi vivano qui su due pagine è voluto: ogni pagina fa un lavoro, e ognuna può dimostrare da sola che niente lascia la tua macchina. Ma tutto quello che le due pagine eseguono è open source: licenza MIT, una cartella per strumento, moduli ES senza dipendenze con un README che li nomina uno per uno.

Quindi se questa catena fa parte della tua settimana, non serve ripercorrerla a mano ogni volta. Punta un agente di codice sul [repository](https://github.com/A-Box-of-Tools/website) e chiedigli di comporre la logica dei segmenti del tagliavideo e l'encoder GIF in una sola pagina fatta per il tuo caso. I moduli sono scritti per essere letti, e portarseli via è esattamente ciò per cui la licenza esiste.
