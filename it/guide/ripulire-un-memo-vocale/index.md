# Come ripulire un memo vocale prima di mandarlo

Un memo vocale arriva con trenta secondi di fruscio da tasca, due false partenze e un livello deciso dalla distanza del telefono. Renderlo mandabile sono due passi — tagliare, poi alzare — e girano entrambi nel tuo browser, che è dove deve stare una registrazione della tua voce che dice cose private.

[Apri Editor audio](https://abox.tools/it/modificare-audio/): Riproducila al contrario, cambiale velocità, tira su una registrazione troppo bassa. Tutto qui, sul tuo dispositivo.

Ultimo aggiornamento 26 agosto 2026

## La risposta breve

1. **Taglia.** Apri il [Tagliaudio](https://abox.tools/it/tagliare-audio/), trascina dentro il memo e segna le parti da tenere con `I` e `O` mentre suona. La forma d'onda mostra i silenzi e le false partenze come tratti piatti, quindi gran parte del taglio si fa a occhio. Esporta un solo file.
2. **Alza.** Porta quel file all'[Editor audio](https://abox.tools/it/modificare-audio/) e normalizza: il livello sale fin quasi al fondo scala, il massimo che una registrazione può essere senza distorcere. Esporta, e manda quello.

Il viaggio tra i due non richiede download: appena il tagliaudio esporta, una riga sotto il suo pulsante di download offre di portare il risultato dritto nell'editor, e il memo arriva già caricato.

Entrambi i passi girano sulla tua macchina. Un memo vocale è più o meno la cosa più personale che un file possa essere, e i soliti siti di «migliora l'audio online» se ne prendono una copia come prezzo del cursore.

![L'editor audio con una registrazione caricata: la sua durata, il suo formato, la sua frequenza di campionamento e un picco di circa meno sei decibel.](https://abox.tools/screens/clean-up-a-voice-memo/source.webp)

Quello che lo strumento ricava prima che tu tocchi qualsiasi cosa. Il livello di picco è il numero che decide se alzare il volume è sicuro.

## Perché tagliare prima di alzare

Perché normalizzare legge il file intero per trovarne il momento più forte, e in un memo grezzo il momento più forte è spesso proprio la cosa che stai per cancellare: il tonfo del telefono appoggiato, il colpo di tosse prima della seconda ripresa. Normalizza prima e quel picco fissa il tetto, così la voce esce bassa com'è entrata. Taglia via la zavorra e la cosa più forte rimasta è la voce stessa, che è quella su cui il margine va speso.

Il tagliaudio taglia sul campione esatto e sfuma ogni giuntura per pochi millisecondi, così un taglio in mezzo al rumore della stanza non può schioccare. Solo le giunture: l'audio intatto tra di esse viene copiato, non ricodificato.

## Cosa sistema l'editor, e cosa no

Normalizzare sistema il *basso*. Non sistema il rumoroso: il livello del condizionatore sale con quello della voce, perché è una registrazione sola e ci stanno dentro insieme. Ciò che tiene un memo comprensibile è soprattutto il taglio — l'aria morta è il posto dove il rumore si sente da solo — più il controllo di velocità a beneficio di chi ascolta: 1,25× tenendo l'intonazione è il trucco dei podcast, e funziona altrettanto bene su un memo che divaga.

L'editor scrive WAV — campioni esatti, nessun encoder in mezzo — quindi il file pesa più dell'originale compresso. Per un memo che si misura in minuti è un prezzo giusto per non impilare mai una seconda codifica con perdita sopra la prima fatta dal telefono; il messenger che lo manderà lo comprimerà comunque un'altra volta, e quella dovrebbe essere l'unica.

![L'editor: un controllo di velocità a 1,25, un controllo di volume a più quattro decibel e un riepilogo della durata, della velocità e del picco che ne derivano.](https://abox.tools/screens/clean-up-a-voice-memo/edit.webp)

Velocità e volume, con sotto il riepilogo di quello che faranno. Niente viene applicato fino all'esportazione, quindi entrambi si possono spostare e rimettere a posto.

## La stessa catena, registrazioni più lunghe

Un'intervista, una lezione, una riunione: la catena è la stessa, il taglio rende solo di più. Segna le domande che contano, lascia andare il resto, e i segni stessi si salvano come semplice file di testo e si ricaricano, il che trasforma una pulizia lunga in qualcosa che si può posare e riprendere. Per l'audio che vive dentro un video, l'editor tira fuori la traccia anche da un MP4 o un MOV senza toccare l'immagine: il primo passo per fare di una chiamata registrata qualcosa di ascoltabile in viaggio.

## Se lo fai ogni settimana

Tagliare e alzare vivono su due pagine apposta: ognuna fa un lavoro, e ognuna può dimostrare da sola che la registrazione non ha mai lasciato la tua macchina. Ma entrambe sono open source: licenza MIT, una cartella per strumento, moduli ES senza dipendenze i cui README spiegano i tagli al campione esatto e lo scrittore di WAV.

Se i memo ti piovono addosso ogni giorno, punta un agente di codice sul [repository](https://github.com/A-Box-of-Tools/website) e chiedigli la versione in una pagina: forma d'onda, segni, normalizzazione all'esportazione. I moduli sono scritti per essere letti, e portarseli via è esattamente ciò per cui la licenza esiste.
