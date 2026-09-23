# Come creare un video boomerang

Un boomerang è un clip che va avanti, poi indietro, e ricomincia. Nessuno strumento qui ha un pulsante boomerang; nasce da tre che fanno ciascuno il proprio lavoro — tagliare, invertire, unire — e l'intera catena gira sul tuo dispositivo.

Ultimo aggiornamento 26 agosto 2026

## La risposta breve

1. **Taglia il momento.** Apri il [Tagliavideo](https://abox.tools/it/tagliare-video/), segna il secondo o due che devono oscillare avanti e indietro, ed esportali come clip a parte.
2. **Inverti una copia.** Trascina quel clip nell'[Invertitore video](https://abox.tools/it/invertire-video/), lascia fuori l'audio, ed esporta. Ora hai lo stesso momento due volte, una per verso.
3. **Unisci le due.** Di nuovo nel Tagliavideo, trascina dentro entrambi i file, segna ciascuno per intero, metti prima la versione in avanti, ed esporta un solo file.

Nessun passaggio richiede un download intermedio: dopo ogni esportazione, una riga sotto il pulsante di download offre di portare il risultato dritto nello strumento successivo — nell'invertitore dopo il primo taglio, di nuovo nel tagliavideo dopo l'inversione — e il file arriva già caricato.

Quel file è il boomerang. Pubblicalo così com'è ovunque il video muto giri in loop, oppure passalo per il convertitore [Video in GIF](https://abox.tools/it/video-in-gif/) se la destinazione anima solo GIF. Ogni passo avviene nel tuo browser; niente di questa catena viene caricato, in nessun punto, da nessuno.

## Perché tagliare per primo

Invertire deve decodificare e ricodificare ogni fotogramma che tocca; la [guida all'inversione](https://abox.tools/it/guide/invertire-un-video/) spiega perché non c'è modo più economico. Tagliare, invece, è quasi gratis: il tagliavideo fa passare i fotogrammi interi senza ricodificarli.

L'ordine è quindi tutto il trucco. Inverti un clip di due secondi e il passo costoso lavora su due secondi; inverti l'originale e lavora su tutto, e la maggior parte la stai per buttare. Su una ripresa da telefono di qualsiasi durata, tagliare prima è la differenza tra un boomerang in meno di un minuto e una barra di avanzamento da fissare.

Taglia stretto. Un boomerang si legge al meglio quando oscilla su un solo movimento — un salto, uno schizzo, una giravolta — e ogni fotogramma tenuto si paga due volte, una per verso.

![Il taglierino video con un segmento marcato fra i tre e i cinque virgola sei secondi, e una tabella con inizio, fine e durata.](https://abox.tools/screens/make-a-boomerang-video/section.webp)

Un secondo o due è tutto quello che è un boomerang. Tagliare prima è quello che tiene basso il costo dell'inversione, e nella tabella si decide la durata.

## Cosa fare dell'audio

Lascialo fuori, e fallo al passaggio dell'inversione: l'invertitore ha una casella esattamente per questo. L'audio di un boomerang suonerebbe in avanti e poi all'indietro; il suono invertito è inconfondibilmente strano, e quasi ovunque un boomerang finisca viene comunque riprodotto muto. Senza audio, poi, l'inversione è più rapida e i due file più leggeri.

Se proprio lo tieni, il tagliavideo unirà comunque i due clip; ma la cucitura che l'occhio perdona, l'orecchio non la perdona.

## L'unione, e cosa ti dirà il tagliavideo

I due file da unire sono parenti stretti — uno è stato fatto dall'altro — ma sono passati per encoder diversi e non è detto che concordino byte per byte sul formato. Il tagliavideo controlla. Dove i due concordano copia i fotogrammi così come sono; dove no, ricodifica una volta e lo dice sul pannello di esportazione, invece di lasciarti indovinare.

Ordina le parti prima di esportare: prima l'andata, poi il ritorno. Un boomerang che parte dal ritorno si legge come un errore.

Una rifinitura che vale i suoi dieci secondi: togli un fotogramma dall'inizio del clip invertito prima di unire. L'ultimo fotogramma dell'andata e il primo del ritorno sono la stessa immagine, e mostrarla due volte fa esitare la sterzata per un attimo.

![Lo strumento di inversione: un riepilogo con dimensione in uscita, durata e numero di fotogrammi, e un interruttore per l'audio.](https://abox.tools/screens/make-a-boomerang-video/reverse.webp)

La seconda metà. L'interruttore dell'audio conta qui più che altrove, per il motivo che dice la sezione sopra.

## Video o GIF alla fine

Tieni l'MP4 se la destinazione riproduce video: è molto più piccolo, molto più nitido, e gira in loop altrettanto bene. Converti in GIF solo quando il posto ne pretende una, e allora tieni d'occhio il contatore: una GIF paga ogni fotogramma, e un boomerang è il suo clip due volte. La [guida alla GIF parziale](https://abox.tools/it/guide/gif-da-una-parte-di-un-video/) copre le leve di larghezza e fotogrammi che la tengono sotto un limite di peso.

## Se lo fai ogni settimana

Tre pagine per un effetto sono volute: ogni strumento fa un lavoro, e ogni pagina può dimostrare da sola che il tuo materiale non lascia mai la macchina. Ma tutti e tre sono open source: licenza MIT, una cartella per strumento, moduli ES senza dipendenze sotto `src/` con README che li spiegano.

Se i boomerang sono parte regolare del tuo lavoro, punta un agente di codice sul [repository](https://github.com/A-Box-of-Tools/website) e chiedigli di piegare la camminata sui fotogrammi dell'invertitore e l'unione del tagliavideo in una pagina con un solo pulsante. I moduli sono scritti per essere letti, e portarseli via è esattamente ciò per cui la licenza esiste.
