# Come creare un codice QR e provare che si legge

L'errore costoso del QR non è fare il codice: è scoprire sul posto che i manifesti si leggono verso un refuso. Generare e verificare qui sono due strumenti, e far girare il secondo prima della tiratura costa un minuto e acchiappa quasi tutto quello che la tiratura avrebbe spedito.

[Apri Lettore di QR code e codici a barre](https://abox.tools/it/leggere-qr-code/): Punta la fotocamera, o trascina qui una foto. Si legge qui, e da nessun'altra parte.

Ultimo aggiornamento 26 agosto 2026

## La risposta breve

1. **Crealo.** Apri il [Generatore di QR e codici a barre](https://abox.tools/it/creare-qr-code/), scegli il lavoro — un link, una rete Wi-Fi, una scheda contatto — e controlla la stringa esatta che il codice conterrà, che la pagina mostra invece di nascondere. Esporta l'SVG per la stampa, il PNG per gli schermi.
2. **Stampane uno.** Alla misura vera, sulla carta vera, prima della tiratura da duecento.
3. **Provalo.** Fotografa la prova di stampa con un telefono — di sbieco, nella luce del posto — e trascina la foto sul [Lettore di QR e codici a barre](https://abox.tools/it/leggere-qr-code/). Mostra il contenuto decodificato e, per un link, l'host che raggiunge davvero. Se corrisponde a ciò che intendevi, la tiratura è al sicuro.

Entrambi gli strumenti girano nel tuo browser e non mandano niente da nessuna parte: per un codice Wi-Fi vuol dire che la password che contiene non è mai stata battuta nel sito di qualcun altro.

![Il generatore di QR con un indirizzo inserito, che mostra il codice finito e i suoi dati: la versione, il livello di correzione degli errori e quanto spazio resta.](https://abox.tools/screens/make-a-qr-code-and-prove-it-scans/made.webp)

Il codice, fatto.

## Cosa acchiappa davvero la verifica

- **Il refuso.** Il guasto più comune non è il codice: è l'URL dentro. Rileggerlo è l'unico controllo che prova ciò che è davvero codificato invece di ciò che credevi di aver incollato.
- **Misura e distanza.** Un codice letto dall'altra parte di una sala vuole moduli più grossi di uno su un biglietto da visita. Fotografare la prova da dove starà la gente è il test onesto; i livelli di correzione d'errore del generatore dicono ad alta voce cosa costa ciascuno in densità.
- **I colori.** I codici stampati chiaro su scuro si leggono; le tavolozze di marca a basso contrasto spesso no. Il lettore regge più della maggior parte dei telefoni: se fatica *lui* con la foto, il telefono più vecchio dell'atrio non ha alcuna possibilità.
- **La piega e il riflesso.** La correzione Reed-Solomon fa sì che un codice in parte coperto si legga ancora, fino al livello che hai scelto. Un manifesto destinato alle intemperie merita il livello più alto e il codice un po' più fitto che costa.

![Il lettore, a cui è stata data quella stessa immagine: riferisce l'indirizzo contenuto nel codice, la simbologia e dove nell'immagine l'ha trovato.](https://abox.tools/screens/make-a-qr-code-and-prove-it-scans/read.webp)

E la stessa immagine riletta da un altro strumento, l'unica prova che smaschera un codice venuto male. Il lettore mostra cosa ha trovato, e non lo apre.

## Lo stesso lettore, per i codici che non sono tuoi

Verificare è anche il modo sicuro di aprire il QR stampato da qualcun altro. Il lettore mostra l'indirizzo intero e l'host che raggiunge davvero *prima che qualcosa si apra*, e nomina i trucchi che travestono un link: un nome utente davanti alla @, un alfabeto sosia, un reindirizzamento. L'adesivo sul parchimetro merita quell'ispezione; il badge del convegno pure. Niente viene aperto al posto tuo, e niente di ciò che leggi viene mandato da nessuna parte.

## Se lo fai ogni settimana

Creare e controllare vivono su due pagine apposta: ognuna fa un lavoro, e ognuna può dimostrare da sola che niente lascia la tua macchina. Ma entrambe sono open source: licenza MIT, moduli ES senza dipendenze — l'encoder del generatore e il decoder Reed-Solomon del lettore, ciascuno con un README che lo spiega.

Se dei codici partono ogni settimana dalla tua scrivania, punta un agente di codice sul [repository](https://github.com/A-Box-of-Tools/website) e chiedigli una pagina che genera e fa subito ripassare il codice disegnato per il decoder: un autotest a ogni esportazione. I moduli sono scritti per essere letti, e portarseli via è esattamente ciò per cui la licenza esiste.
