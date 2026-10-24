# Come scansionare più pagine in un PDF piccolo

La commissione raramente è una pagina. È un contratto con il suo foglio delle firme, o un anno di ricevute, e alla fine una casella di posta che rifiuta tutto quello che supera pochi megabyte. Tre strumenti coprono l'intero percorso, e le carte restano sul tuo dispositivo per tutto il tempo.

Ultimo aggiornamento 26 agosto 2026

## La risposta breve

Fotografa ogni pagina, poi trascina tutte le foto in una volta sullo [Scanner di documenti](https://abox.tools/it/scansionare-documenti/). Trova gli angoli di ogni pagina, raddrizza ogni foto e scrive *un PDF con una pagina per foto*: non c'è un passaggio di combinazione da fare, e le pagine stanno nell'ordine in cui le hai aggiunte.

Due strumenti proseguono dove lo scanner si ferma. Se una parte del documento *è* già un PDF — il contratto arrivato per mail, intorno al tuo foglio delle firme scansionato — intrecciali con l'[Unisci PDF](https://abox.tools/it/unire-pdf/). E se il file finito pesa ancora più di quanto la casella accetti, il [Comprimi PDF](https://abox.tools/it/comprimere-pdf/) lo porta sotto il limite.

Entrambe le staffette sono a un clic: quando lo scanner ha scritto il suo PDF, una riga sotto il pulsante di download offre di portare il risultato dritto nell'unificatore o nel compressore, già caricato — e l'unificatore passa il proprio risultato al compressore allo stesso modo.

Niente nella catena carica niente. Qui conta più che quasi ovunque: quello che si scansiona sono contratti, documenti d'identità e carte mediche, e le app abituali per questo fanno passare ogni pagina dai loro server.

## Fare bene le foto

Lo scanner recupera moltissimo — scatti inclinati, luce di lampada disuguale, un'ombra di traverso sulla pagina — ma non può recuperare quello che la fotocamera non ha mai catturato. Tre abitudini coprono quasi tutto:

- **Riempi l'inquadratura**, con un margine di tavolo visibile intorno a ogni bordo. Gli angoli si trovano cercando la pagina contro lo sfondo; una pagina che esce dalla foto non ha angoli da trovare.
- **Scatta dall'alto**, più o meno in perpendicolare. La prospettiva si corregge, ma il bordo lontano di uno scatto radente ha meno pixel, e la correzione non può inventarli.
- **Una pagina per foto**, in ordine di lettura. Riordinare dopo funziona, ma l'ordine in cui scatti è l'ordine che ottieni, e scattare in ordine è gratis.

La [guida alla scansione](https://abox.tools/it/guide/scansionare-un-documento-col-telefono/) copre il resto: come si trovano gli angoli, quando trascinarli tu, e cosa fa la modalità bianco e nero al peso del file.

![Lo scanner con tre pagine fotografate in una striscia, la prima aperta e con gli angoli marcati.](https://abox.tools/screens/scan-multiple-pages-into-one-pdf/pages.webp)

Tre pagine, fotografate e raddrizzate insieme. Ognuna tiene i propri angoli, così una foto venuta male non rovina il gruppo.

## Quando l'unione si guadagna il posto

Lo scanner combina *foto*. L'unisci PDF combina *PDF*, e il centro di una commissione vera spesso è entrambe le cose: un foglio firmato fotografato adesso, dentro un documento arrivato come file. Scansiona prima le tue pagine, poi trascina la scansione e il PDF originale insieme nell'unisci, sposta le pagine al loro posto ed esporta un documento solo. I segnalibri e i collegamenti interni dell'originale vengono ricostruiti sulle pagine sopravvissute, e i campi modulo compilati vengono dietro.

Lo stesso vale per scansioni fatte in giorni diversi: il PDF di ogni sessione cade dentro come un blocco di pagine, e l'unisci è il posto dove i blocchi diventano un file.

![Il costruttore di PDF con le tre pagine pulite nell'elenco, sopra le impostazioni di formato, orientamento e margine.](https://abox.tools/screens/scan-multiple-pages-into-one-pdf/document.webp)

E poi quelle stesse tre pagine come un unico documento, il passo per cui l'unificatore si guadagna il posto.

## Restare sotto il limite di peso

Prova prima la leva economica, e sta dentro lo scanner: per pagine che sono inchiostro su carta — testo, moduli, ricevute — la modalità bianco e nero salva ogni pagina a un bit per pixel, e il PDF atterra di solito ben sotto il megabyte a pagina senza comprimere niente. Il colore vale il suo costo solo dove il colore significa qualcosa.

Quando il file ancora non vuole partire — pagine a colori, o un'unione che ha portato dentro la scansione di qualcun altro — il comprimi comincia mostrando dove sta davvero il peso, poi ricodifica le immagini di pagina contro la risoluzione a cui vengono mostrate. Controlla anche che il risultato si apra prima di offrirlo, cosa che si apprezza quando il file è un contratto con una scadenza.

## Se lo fai ogni settimana

Che i passi vivano qui su tre pagine è voluto: ogni pagina fa un lavoro, e ognuna dimostra da sola che le carte non hanno mai lasciato la tua macchina. Ma è tutto open source: licenza MIT, una cartella per strumento, moduli ES senza dipendenze con README che spiegano il trova-angoli, la copia delle pagine dell'unisci e il budget del comprimi.

Se la stessa commissione ti atterra sulla scrivania ogni settimana, punta un agente di codice sul [repository](https://github.com/A-Box-of-Tools/website) e chiedigli di comporre quei moduli in una pagina fatta per lei: scansionare dritto dentro un documento unito e compresso, con la tua pagina di accompagnamento già al suo posto. I moduli sono scritti per essere letti, e portarseli via è esattamente ciò per cui la licenza esiste.
