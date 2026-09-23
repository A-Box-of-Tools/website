# Base64 è una cifratura?

No. Base64 è un cambio d'abito, non una serratura: chiunque lo riconosca lo disfa in millisecondi, senza nessuna chiave. Ma la domanda merita una risposta vera, perché codifica, cifratura e hash si somigliano sullo schermo e non potrebbero promettere cose più diverse.

Ultimo aggiornamento 26 agosto 2026

## La risposta breve

No. Base64 è una *codifica*: un modo di scrivere qualunque dato usando soltanto sessantaquattro caratteri innocui, perché sopravviva al passaggio in sistemi costruiti per il testo semplice. Non ha chiave, non ha segreto e non ha proprietà di sicurezza di alcun tipo. Decodificarlo richiede di riconoscerlo, e nient'altro: a una persona costa un'occhiata, a un computer un millisecondo.

La domanda merita comunque, perché la confusione è universale e ogni tanto costosa. Una stringa base64 *sembra* mescolata — `cGFzc3dvcmQ=` non dice nulla all'occhio — e ciò che sembra mescolato finisce archiviato sotto «sicuro». Prodotti veri sono usciti con password «protette» così. La cura è una distinzione imparata una volta sola: **la codifica è per le macchine, la cifratura per i segreti, l'hash per le impronte.** Tre lavori, tre strumenti, e uno solo protegge qualcosa.

## Codifica: reversibile da chiunque

Una codifica cambia il modo in cui i dati sono *scritti*, mai ciò che dicono. Allegati di posta, immagini incorporate nei fogli di stile, token negli indirizzi: ovunque, byte arbitrari devono attraversare canali che trasportano con affidabilità solo testo, e base64 è l'abito standard: tre byte entrano, quattro caratteri escono, fatti di lettere, cifre e due segni, con `=` a riempire la coda. Quel `=` finale è il segno di riconoscimento, e una volta imparato si vede base64 dappertutto.

La proprietà che definisce tutto: la ricetta è pubblica e gira uguale all'indietro. Non c'è nulla da sapere, quindi non c'è nulla da non sapere. Il percent-encoding degli indirizzi (`%20` per uno spazio), le entità HTML (`&amp;`), l'esadecimale e gli escape con la barra rovesciata sono la stessa idea in vesti diverse, e il [codificatore e decodificatore base64](https://abox.tools/it/codifica-base64/) di qui li parla tutti, in entrambe le direzioni, sulla tua macchina. Decodificare una stringa trovata è esattamente legittimo quanto leggerla, perché una codifica non è mai stata una serratura.

## Cifratura: reversibile per chi ha la chiave

La cifratura è quella che protegge davvero un contenuto. Trasforma i dati con una *chiave*, e la matematica è disposta in modo che disfare la trasformazione senza la chiave non sia semplicemente difficile ma fuori portata del calcolo — mentre con la chiave è immediato. Il segreto abita per intero nella chiave, non nel metodo: gli algoritmi sono pubblicati, standardizzati, e più forti proprio per questo.

È qui che la confusione visiva morde, perché i byte cifrati vengono abitualmente codificati in base64 per poter viaggiare: mescolati da una chiave, poi vestiti per il trasporto. Due strati, due lavori. Il JSON Web Token è il caso di scuola: tre pezzi di base64 uniti da punti, di cui i primi due si *decodificano* in JSON leggibile per chiunque ci provi. La gente incolla token nei decodificatori web pubblici ogni giorno, avendo dato per scontato che il tutto fosse sigillato; la descrizione onesta è che un JWT è una cartolina con firma a prova di falso, non una busta.

## Hash: reversibile da nessuno

Un hash corre in una direzione sola. Fai passare qualunque quantità di dati per SHA-256 e ne esce un numero di dimensione fissa: lo stesso numero ogni volta per gli stessi dati, un numero completamente diverso per dati che differiscono di un bit, e nessuna strada dal numero ai dati, per nessuno, chiave o non chiave. Non è un abito e non è una serratura; è un'*impronta*.

È questo a renderlo lo strumento giusto per i due lavori che gli appartengono. Verificare che un file scaricato sia esattamente quello pubblicato dall'editore — confrontare impronte, che è ciò che lo strumento per [verificare i checksum](https://abox.tools/it/verificare-checksum/) fa sulla tua macchina, con [una guida sua](https://abox.tools/it/guide/verificare-il-checksum-di-un-file/). E conservare password: un servizio ben tenuto conserva solo l'hash della tua, così che perfino il suo database rubato non contenga la password. Quando un sito può spedirti per posta la password dimenticata, ti ha detto che non l'ha mai hashata — e quando una config «protegge» la sua come `cGFzc3dvcmQ=`, ti ha detto che l'ha soltanto codificata.

## Distinguerli sul campo

Una scorciatoia che funziona, per la stringa che hai davanti:

- **Si decodifica in qualcosa di leggibile?** Era codifica. Lettere, cifre, magari `+` e `/`, spesso `=` in coda: passala in un decodificatore e guarda.
- **Si decodifica in rumore binario?** Allora il base64 era solo l'abito, e ciò che veste è cifrato, compresso, o non è mai stato testo: la codifica non ti dice nulla in entrambi i casi.
- **Lunghezza fissa, caratteri esadecimali, non si decodifica mai?** 64 caratteri esadecimali è la sagoma di SHA-256; 32, quella di MD5. Gli hash non si decodificano; coincidono, oppure no.

E la morale pratica di ciascuno: mai affidare un segreto a una codifica; mai costruirsi la cifratura quando la piattaforma la fornisce; mai conservare una password come qualcosa di diverso da un hash. La stringa che decodifichi per controllare può essere intanto lei stessa la parte delicata — un token in fase di debug lo è di solito — ed è per questo che il [decodificatore di qui](https://abox.tools/it/codifica-base64/) gira dove il segreto già si trova, sulla tua macchina, e per questo [che cosa fa davvero incollare in uno strumento web](https://abox.tools/it/guide/e-sicuro-incollare-testo-in-uno-strumento-online/) ha una pagina sua.
