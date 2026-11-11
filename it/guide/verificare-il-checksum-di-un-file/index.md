# Come controllare un download con il suo checksum

La riga di esadecimale sotto un link di download sta lì perché tu possa dimostrare che il file è arrivato intatto. Confrontarla richiede un minuto. Sapere quanto vale quel confronto, e quale abitudine lo rende inutile, richiede il resto di questa pagina.

[Apri Hash e checksum](https://abox.tools/it/verificare-checksum/): Controlla un download contro il numero pubblicato da chi lo distribuisce, senza mandarlo a nessuno.

Ultimo aggiornamento 26 agosto 2026

## La risposta breve

Apri [Hash e checksum](https://abox.tools/it/verificare-checksum/), trascinaci sopra il file che hai scaricato e incolla nel riquadro in fondo il checksum preso dalla pagina di download. La pagina ricava dalla lunghezza di quale algoritmo si tratta e risponde con una frase.

Se corrisponde, i byte sul tuo disco sono quelli che ha misurato chi pubblica il file. Se non corrisponde, riscarica il file prima di aprirlo. Tutto il resto di questa pagina è ciò che quella frase lascia fuori.

## Che cos'è il numero sotto il link di download

È il risultato di una funzione di hash: un calcolo che legge ogni byte di un file e produce una risposta corta e di lunghezza fissa. Lo stesso file dà sempre la stessa risposta, e un file che differisce di un solo bit ne dà una completamente diversa. Non una quasi uguale: una senza alcun rapporto. Tutto si regge su questa proprietà.

Siccome la risposta è corta e il file no, il calcolo butta via informazione, e ci sono per forza molti file che condividono una data risposta. Trovarne uno apposta è la parte difficile, e quanto sia difficile è ciò che distingue fra loro gli algoritmi qui sotto.

In un checksum non c'è niente di segreto e niente di reversibile. È un'impronta, pubblicata perché due persone possano mettersi d'accordo sul fatto di avere in mano la stessa cosa.

## Quale algoritmo hai davanti

Non devi sceglierlo tu: lo ha già scelto chi pubblica, e il tuo compito è calcolare lo stesso. Si riconosce dalla sola lunghezza:

- **32 caratteri esadecimali** — MD5.
- **40** — SHA-1.
- **64** — SHA-256, ed è quello che vedrai più spesso.
- **96** — SHA-384.
- **128** — SHA-512.

Non ce ne sono due della stessa lunghezza, ed è per questo che lo strumento riesce a riconoscere un valore incollato senza che glielo si dica. Una stringa di 63 caratteri non è il checksum di niente: è uno SHA-256 che ha perso un carattere per strada verso gli appunti.

![La scheda dei risultati: le impronte MD5, SHA-1, SHA-256 e SHA-512 di un file, ciascuna con un pulsante per copiarla.](https://abox.tools/screens/verify-a-file-checksum/digests.webp)

Tutte insieme, perché quale usare lo decide chi ha pubblicato il file, non tu.

## Sul tuo computer, senza browser

Ogni sistema operativo porta con sé qualcosa che fa questo, e conoscere il comando vale la pena anche se poi usi una pagina web. Alla domanda "come faccio a sapere che il vostro sito ha calcolato onestamente" non c'è risposta migliore che passare lo stesso file nello strumento arrivato insieme al computer.

**Windows**, in PowerShell:

```
Get-FileHash .\disk.iso -Algorithm SHA256
```

Le macchine più vecchie hanno invece `certutil -hashfile disk.iso SHA256`, che stampa in maiuscolo e con gli spazi. In un confronto fra checksum le maiuscole non contano mai: quelle lettere sono cifre, non parole.

**macOS**:

```
shasum -a 256 disk.iso
```

**Linux**:

```
sha256sum disk.iso
```

Tutti e tre stampano la stessa stringa per lo stesso file, e questo sito pure. Sono specifiche esatte con vettori di test pubblicati: non c'è spazio perché un'implementazione abbia un'opinione.

## Confrontarli senza rovinarsi gli occhi

Non leggere sessantaquattro caratteri su due schermi per poi decidere che si somigliano. La gente controlla i primi quattro e gli ultimi quattro e si ferma, e quello è esattamente il confronto che un attaccante si organizzerebbe per superare; è anche il modo in cui passa un errore in buona fede.

Incollali tutti e due in qualcosa che confronti al posto tuo. Da riga di comando è a questo che serve l'opzione `-c`:

```
sha256sum -c SHA256SUMS
```

Nel browser è il riquadro di confronto di [Hash e checksum](https://abox.tools/it/verificare-checksum/), che prende il valore nella forma in cui chi pubblica lo ha scritto: esadecimale nudo, una riga di `sha256sum`, un intero file `SHA256SUMS`, la forma `SHA256 (disk.iso) = …`, oppure un `integrity="sha384-…"` preso da un tag script. E risponde sì o no con una frase.

![La scheda di confronto: un checksum incollato in un campo e un verdetto che dice che corrisponde al file.](https://abox.tools/screens/verify-a-file-checksum/compare.webp)

Incolla quello che diceva la pagina di download e lascia confrontare allo strumento. Leggere sessantaquattro caratteri a schermo è il passo che questo toglie di mezzo.

## Che cosa dimostra esattamente una corrispondenza

Che i byte sul tuo disco sono quelli che qualcuno aveva davanti quando ha scritto quel numero. È una cosa davvero utile da sapere ed è più ristretta di quanto quasi tutti diano per scontato, quindi conviene elencare che cosa copre e che cosa no.

**Una corrispondenza esclude:**

- un download interrotto prima della fine che ti ha lasciato un file dall'aria completa;
- una corruzione in transito, su un disco che sta cedendo o per un cavo USB fatto male;
- il file sbagliato: la build ARM invece della x86, o il rilascio del mese scorso;
- un mirror che serve in silenzio qualcosa di diverso da quello che dichiara.

**Una corrispondenza non esclude:**

- **che il file sia malevolo.** Chi pubblica può misurare un malware con la stessa esattezza di qualsiasi altra cosa. Un checksum dice "questo è quello che hanno distribuito", mai "questo è sicuro";
- **che chi pubblica sia stato compromesso.** Se qualcuno ha sostituito il file sul server, ha sostituito il checksum lì sotto nello stesso minuto. Il che ci porta alla sezione seguente.

## L'errore che rende inutile tutto l'esercizio

Prendere il checksum dalla stessa pagina, sulla stessa connessione, da cui arriva il file.

Pensa a che cosa ti stai difendendo. Se il timore è un download rovinato, il checksum può venire da qualsiasi parte e il controllo funziona. Se il timore è che qualcuno abbia manomesso il file, allora chi poteva cambiare il file poteva cambiare la riga di esadecimale stampata sotto, perché tutti e due arrivavano dallo stesso server sulla stessa connessione. Staresti chiedendo al falsario di confermare la firma.

Un checksum vale di più quando ti arriva per una strada che il file non ha fatto:

- un file `SHA256SUMS` con firma GPG staccata, verificata contro una chiave che avevi già: è quello che pubblicano le distribuzioni ed è la vera risposta;
- l'annuncio di rilascio su una mailing list, o un tag in un repository di codice, invece della pagina di download;
- un secondo mirror su un dominio diverso, e i due poi confrontati fra loro;
- un gestore di pacchetti, che fa questo per te contro chiavi arrivate insieme al sistema operativo.

Niente di tutto questo rende inutile controllare un checksum pubblicato sulla stessa pagina. Prende il download rotto, che è il guasto che alla gente capita davvero. Solo, non raccontarti che abbia preso altro.

## MD5 e SHA-1 sono rotti. Usali lo stesso, a volte

Tutti e due sono rotti nel senso più forte che qui conta: le *collisioni* si possono costruire apposta. Due file diversi con lo stesso MD5 si fabbricano su hardware normale dal 2004, e nel 2017 un gruppo ha prodotto due PDF diversi con lo stesso SHA-1. Nel 2020 la variante a prefisso scelto di quell'attacco è scesa a qualche decina di migliaia di dollari di calcolo affittato.

In pratica vuol dire questo: un MD5 che corrisponde non ti dice più che nessuno ha messo mano al file, perché chi avesse voluto avrebbe potuto costruire un file diverso con lo stesso numero. Continua a dirti che il download non si è troncato e non si è corrotto, perché un incidente casuale non finisce su una collisione: nessun incidente ha mai avuto quelle probabilità.

Quindi se chi pubblica ha stampato solo un MD5, controllalo: vale più che non controllare niente. E se sei tu a pubblicare, stampa uno SHA-256.

## Non corrisponde. E adesso?

1. **Riscarica il file**, dallo stesso posto. Un trasferimento interrotto o ripreso è di gran lunga la causa più comune, e la seconda copia di solito chiude la questione.
2. **Controlla di essere sulla riga giusta.** Le pagine di rilascio elencano più file: il checksum dell'installer non corrisponderà mai a quello dell'archivio, né quello ARM a quello x86.
3. **Controlla la versione.** Una pagina di checksum salvata nei segnalibri è vecchia dal giorno in cui esce una revisione.
4. **Prova un altro mirror** e confronta fra loro i checksum dei due file. Due mirror che concordano fra loro e discordano dal numero pubblicato sono un problema diverso da un mirror che discorda da entrambi.
5. **Nel frattempo non aprirlo.** Un file che sbaglia il proprio checksum nel migliore dei casi è danneggiato e nel peggiore non è il file che avevi chiesto.

## Perché farlo nel browser

Perché la riga di comando non è dove sta la maggior parte delle persone, e perché l'alternativa ovvia, un sito che ti chiede di caricare il file, è una cosa strana da fare con un installer di cui già dubiti. Mandare un file da qualche parte per scoprire se è stato manomesso per strada aggiunge un posto in più in cui può essere manomesso.

[Hash e checksum](https://abox.tools/it/verificare-checksum/) legge il file a pezzi da quattro megabyte sul tuo computer, quindi non c'è nessun caricamento, nessun limite di dimensione e niente di cui fidarsi oltre alla pagina stessa, che puoi leggere e che continua a funzionare con la rete staccata. Se preferisci fidarti del tuo sistema operativo, lancia il comando della sezione qui sopra e confronta le due risposte. Coincideranno.
