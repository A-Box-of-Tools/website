# Cosa c'è dentro un file DICOM?

Più dell'esame. Un file DICOM è una cartella clinica con un'immagine dentro: il tuo nome, la tua data di nascita e il tuo numero d'ospedale viaggiano nello stesso file dei pixel — e conta soprattutto nel momento esatto in cui ti mettono in mano un CD e vai a cercare un visore.

Ultimo aggiornamento 26 agosto 2026

## La risposta breve

Un file DICOM — il `.dcm` sul CD che l'ospedale ti consegna — non è un formato d'immagine come il JPEG. È un formato di cartella clinica con un'immagine dentro. Prima che i pixel comincino, il file porta un'intestazione di centinaia di etichette, e fra queste, di norma: il nome completo del paziente, data di nascita, sesso e numero d'ospedale; data, ora e descrizione dell'esame; il medico richiedente; la struttura e l'apparecchio, fino al numero di serie; e un insieme di identificatori univoci che fungono da chiavi verso l'archivio che li ha prodotti.

Niente di tutto questo si vede quando l'immagine è sullo schermo, ed è esattamente così che lo si dimentica. L'esame è la cartella. Tratta il file come il documento che è, non come l'immagine che contiene.

## Perché proprio questo file si carica con tanta leggerezza

La trappola in pratica: dopo un esame ti consegnano un disco o un download, provi ad aprirlo, e niente sulla macchina vuole saperne — DICOM non è un formato che il software comune parli. Così cerchi «aprire file dcm online», e quasi tutto ciò che trovi è una casella di caricamento. Attimi dopo, una cartella clinica completa e identificata — nome, data di nascita, numeri d'ospedale, descrizioni d'esame dal sapore di diagnosi e tutto — sta sul server di chiunque quel giorno fosse ben posizionato.

Nota la sagoma: è di nuovo il problema del documento d'identità — un file delicato, un momento d'attrito, un motore di ricerca — ma con un file delicato al quadrato. Un passaporto dice chi sei; un esame dice chi sei *e che cosa si stava indagando*. L'argomento generale sui caricamenti ha [una pagina sua](https://abox.tools/it/guide/e-sicuro-caricare-i-propri-file/); questo è il file per cui quell'argomento non ha bisogno di alcun condimento.

Aprire il file in locale è l'intera cura, ed è a questo che serve il [visualizzatore DICOM](https://abox.tools/it/visualizzatore-dicom/) di qui: l'esame, un vero controllo di finestra, una cartella reimpilata nella sua serie, misure in millimetri, ogni etichetta dell'intestazione leggibile — senza che nulla lasci la tua macchina. Il passo passo è nella [guida per aprirlo](https://abox.tools/it/guide/aprire-un-file-dicom/).

## «Ho tolto il nome» non è de-identificare

L'errore successivo è più fine e meglio intenzionato: condividere un esame — con un servizio di secondo parere, un ricercatore, un forum — dopo aver cancellato l'etichetta ovvia. Lo standard stesso è brutale su quanto ciò sia poco. Il profilo di de-identificazione di DICOM elenca le etichette da trattare prima che un insieme di dati possa dirsi de-identificato, e corre per *centinaia* di voci, perché l'identità abita in più posti del campo del nome:

- **Identificatori diretti oltre il nome** — data di nascita, ID paziente, numero di pratica, i nomi del medico e della struttura.
- **Chiavi** — gli identificatori univoci stampigliati in ogni file: non dicono chi sei, ma esattamente *quale cartella sei*, per qualunque sistema abbia visto l'originale.
- **Quasi-identificatori** — data e ora dell'esame, modello e numero di serie dell'apparecchio, distretto corporeo, età del paziente: vaghi uno a uno, stretti insieme.
- **I pixel stessi** — l'ecografia e alcune altre modalità imprimono il nome del paziente dritto nell'immagine, dove nessuna modifica di etichette arriva. (Per un'immagine esportata è lavoro da [oscuratura a livello di pixel](https://abox.tools/it/oscurare-immagine/), non da strumento di metadati.)

Per questo il visore di qui ha un pannello che elenca esattamente che cosa, nel tuo file, identifica il paziente, e quanto direttamente — costruito dalla lista dello standard stesso. E per questo il visore si limita a *leggere*: non contiene codice che scriva un file DICOM, perché «anonimizzato» è una promessa la cui asticella sta ben più in alto di quella che un visore salta — e uno strumento che la mantenesse a metà sarebbe peggio di uno che non la fa mai.

## Trattare un esame come la cartella che è

Le abitudini cadono da sole da tutto quanto sopra:

- **Guardalo in locale.** Un visore che funziona a Wi-Fi spento — questo lo fa — ha dimostrato dove avviene il lavoro. Anche il visore fornito sul disco, se gira sulla tua macchina, va bene.
- **Condividi per canali medici quando il contenuto è il punto.** Spedire uno studio a un altro ospedale è un problema risolto, con dietro un'infrastruttura che risponde di sé; un'email personale con uno `.zip` di file `.dcm` è una copia della tua cartella nei server di posta, a tempo indeterminato.
- **Se devi condividere un file, prima sappi che cosa contiene.** Leggi l'intestazione e il pannello dell'identità, così ciò che passi è una decisione e non una sorpresa — e tratta la de-identificazione a regola d'arte come un servizio che il tuo centro di imaging ti deve su richiesta, non come una casella che improvvisi.
- **Ricorda che il disco sopravvive alla commissione.** La copia nella cartella dei download e il CD nel cassetto sono anch'essi cartelle complete, come la scansione del documento che nessuno ricorda di aver cancellato.

Niente di tutto questo dice di non condividere mai un esame: i secondi pareri sono ciò per cui le copie esistono. Dice: il file è un documento su di te, e le due domande a cui questo intero gruppo di guide continua ad arrivare sono le giuste anche qui — a chi lo si consegna, e se quella consegna doveva avvenire del tutto.
