# Come preparare le foto del telefono per il web

Una foto del telefono è nel formato sbagliato, quattro volte troppo grande, e sa dove abiti. Renderla pubblicabile è una catena corta — convertire, inquadrare, comprimere — e ogni passo gira sul tuo dispositivo, che è esattamente dove devono stare le foto con dentro le tue coordinate.

Ultimo aggiornamento 26 agosto 2026

## La risposta breve

1. **Prima le foto dell'iPhone:** passa i file HEIC per il [convertitore HEIC](https://abox.tools/it/heic-in-jpg/) e scegli di lasciare fuori i metadati. Ti dice, prima di convertire qualsiasi cosa, quali foto portano coordinate GPS. Le foto già in JPEG saltano questo passo.
2. **Inquadratura e misura:** trascina il lotto sul [Ridimensiona immagini](https://abox.tools/it/ridimensionare-immagine/). Fissa un lato lungo — 1600 pixel vanno bene per la maggior parte delle pagine, 2000 se i lettori ingrandiranno — oppure ritaglia l'intero lotto alla stessa proporzione con un clic.
3. **Centra il budget:** chiudi nel [Comprimi immagini](https://abox.tools/it/comprimere-immagine/), che accetta un obiettivo in kilobyte invece di un cursore di qualità, e restituisce il lotto in un solo zip.

Tutto gira nel tuo browser. Gli originali — risoluzione piena, GPS e tutto — non lasciano mai la tua macchina, ed è questo il motivo di farlo in locale invece che su un sito di conversione.

## Dove vanno i metadati

Il rischio silenzioso di una foto del telefono non sono i pixel; sono le etichette. I metadati EXIF registrano la fotocamera, gli orari e, su quasi ogni telefono, le coordinate GPS di dove la foto è stata scattata. Pubblicala e potresti star pubblicando il tuo indirizzo in una forma che chiunque guardi sa leggere.

Il fatto utile di questa catena è che delle etichette si occupa da sola. Ridimensionare e comprimere ridisegnano entrambi l'immagine dai pixel, e pixel ridisegnati non portano etichette: quello che esce dai passi 2 o 3 è pulito senza che tu lo chieda. I due casi che chiedono una decisione:

- **Convertire HEIC:** il convertitore può portarsi dietro i metadati o lasciarli fuori — è una casella — e avvisa quali foto hanno il GPS a bordo. Per qualsiasi cosa pubblica, fuori.
- **Una foto che non ridimensioni:** se i pixel devono restare intatti, byte per byte, usa l'[editor EXIF](https://abox.tools/it/rimuovere-dati-exif/), che toglie le etichette senza ricodificare l'immagine. La [guida ai metadati](https://abox.tools/it/guide/rimuovere-i-dati-exif-e-gps/) è la versione lunga.

## Perché ridimensionare prima di comprimere

Perché i pixel sono il budget. Una foto da 12 megapixel strizzata abbastanza da stare in 300 KB si vede peggio, e si nota, di una da 2 megapixel compressa con dolcezza nello stesso spazio: gli stessi kilobyte si spalmano su sei volte l'area. Decidere prima la misura a cui verrà mostrata lascia che il compressore spenda il budget in qualità invece che in risoluzione che nessuno vedrà.

Il compressore ridimensiona da solo quando non c'è altro modo di raggiungere l'obiettivo, ma lo tratta come ultima spiaggia. Fare l'inquadratura tu nel ridimensiona tiene la decisione — cosa tagliare, quale bordo conta — dove deve stare.

La [guida al ridimensionamento](https://abox.tools/it/guide/ridimensionare-un-immagine/) e la [guida alla compressione](https://abox.tools/it/guide/comprimere-un-immagine-a-una-dimensione-esatta/) vanno più a fondo ciascuna sulla propria metà, compreso cosa misurano davvero i numeri della qualità.

![Il ridimensionatore impostato sul lato lungo, con 1600 inserito e lati lunghi predefiniti accanto.](https://abox.tools/screens/get-photos-ready-for-the-web/long-edge.webp)

Prima il lato lungo, perché è l'unica impostazione che tratta allo stesso modo una foto verticale e una orizzontale.

## Tutto il lotto in una volta

Ogni strumento della catena prende una cartella intera in un solo trascinamento: il convertitore fa ogni HEIC, raffiche comprese, il ridimensiona mette la stessa inquadratura su tutto il set o ti lascia ritagliare ogni foto a modo suo, e il compressore restituisce il tutto in un unico zip. Venti foto costano appena più attenzione di una: il tempo macchina è della tua macchina, ed è meno di quanto sarebbe durato qualsiasi caricamento.

![Tre righe di risultato, ciascuna con una foto ridotta da megabyte a circa 150 kB, con la qualità a cui è arrivata.](https://abox.tools/screens/get-photos-ready-for-the-web/quality.webp)

E poi la qualità, su tutto il gruppo in una volta. L'ordine conta: la sezione qui sopra dice perché.

## Se lo fai ogni settimana

Che la catena viva qui su tre o quattro pagine è voluto: ogni pagina fa un lavoro, e ognuna dimostra da sola che niente lascia la tua macchina. Ma ogni passo è open source: licenza MIT, una cartella per strumento, moduli ES senza dipendenze con README che spiegano il decoder, il ricampionamento e la ricerca della misura obiettivo.

Se le tue foto prendono ogni volta la stessa forma — stesso lato lungo, stesso budget, stesse etichette via — punta un agente di codice sul [repository](https://github.com/A-Box-of-Tools/website) e chiedigli di comporre quei moduli in un'unica zona di trascinamento con i tuoi preset già dentro. I moduli sono scritti per essere letti, e portarseli via è esattamente ciò per cui la licenza esiste.
