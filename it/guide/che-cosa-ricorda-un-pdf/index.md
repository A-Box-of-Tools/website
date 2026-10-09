# Che cosa ricorda un PDF

Più delle sue pagine. Un PDF porta di norma il nome del suo autore, il programma che lo ha prodotto, il file che era prima di diventare un PDF — e, se è stato modificato in un certo modo molto diffuso, ogni versione precedente di sé, cancellazioni comprese. Niente di tutto questo compare sullo schermo.

Ultimo aggiornamento 26 agosto 2026

## La risposta breve

Un PDF non è un'immagine delle sue pagine. È un contenitore, e le pagine sono solo la parte del carico che viene mostrata. Intorno a loro il formato ha posto per un blocco di informazioni sul documento, una seconda copia XML dello stesso, commenti, dati dei moduli, file allegati — e, attraverso un modo molto comune di salvare le modifiche, versioni precedenti complete del documento, impilate sotto quella corrente.

Niente di tutto ciò è un difetto. Ogni pezzo è stato progettato per un lavoro ragionevole, e dentro un'organizzazione quasi tutto è innocuo o utile. Il problema è l'attraversamento del confine: nel momento in cui un PDF esce — verso una controparte, una lista di distribuzione, un fascicolo pubblico — tutto ciò che ricorda parte con lui, e ciò che ricorda non compare su nessuna pagina. Si controlla ciò che un documento dice e si spedisce ciò che il file contiene, e sono due cose diverse.

## La targhetta: /Info e il pacchetto XMP

Ogni PDF può portare un dizionario di informazioni sul documento: autore, titolo, date di creazione e modifica, e i nomi dei programmi che lo hanno creato e prodotto. La maggior parte porta una seconda copia, più ricca, degli stessi fatti come XML incorporato, chiamata XMP. Nessuna delle due si mostra con le pagine; entrambe sono a un pannello delle proprietà di distanza.

I valori si riempiono da soli, ed è questo a renderli perdenti. *Autore* è tipicamente il nome dell'account con cui è stato installato il sistema operativo: un nome vero e completo, su documenti che i loro autori credevano anonimi: candidature, perizie, reclami, offerte. *Titolo* è di norma il nome del file da cui il PDF è stato esportato, così `Bozza-v7-riserve-legali.docx` sopravvive dentro il PDF lucidato che doveva sostituirla. La riga del produttore data il software; le date smentiscono le versioni ufficiali. Su ciò che i PDF istituzionali confessano in questo blocco sono stati scritti interi studi.

## Il ripristino involontario: salvataggi incrementali

Il pezzo più tagliente del contenitore è quello di cui il formato va più fiero. Il PDF ammette gli *aggiornamenti incrementali*: invece di riscrivere il file, un editor può accodare le proprie modifiche alla fine e lasciare intatto tutto ciò che precede. Il visore legge il file dalla fine e mostra la versione più recente; le vecchie sono ancora lì, byte per byte, nello stesso file.

Salvare accodando è veloce e a prova di crash — e significa che un documento modificato così contiene la propria storia. Il testo «cancellato» non se n'è andato: è superato, e recuperarlo è questione di leggere il file com'era prima dell'ultima coda. Un rettangolo nero tirato sopra un nome, in un editor che salva incrementalmente, produce un file che contiene il nome *due volte* — una sotto il rettangolo, una nella storia — il che raddoppia il fallimento descritto nella [guida all'oscuratura](https://abox.tools/it/guide/si-puo-recuperare-il-testo-oscurato/).

Il rimedio è una riscrittura completa: aprire il file, tenere ciò che la versione corrente usa davvero, scrivere un file nuovo senza passato. È ciò che fa per costruzione il [compressore di PDF](https://abox.tools/it/comprimere-pdf/) di qui: una riscrittura non può fare a meno di abbandonare la storia, e lo strumento conta il materiale superato che si è lasciato dietro nel suo prospetto delle dimensioni — che è anche il modo più facile di scoprire che il tuo file una storia ce l'aveva.

## La stiva: commenti, campi, allegati, livelli

Il resto della memoria è più ordinario, e trapela lo stesso:

- **Commenti e annotazioni**: la conversazione della revisione, in viaggio col documento revisionato, visibile a chiunque pensi di guardare.
- **I campi dei moduli** conservano i valori compilati come dati anche dove una pagina appiattita non li mostra più.
- **Gli allegati**: un PDF può incorporare file interi, di qualunque tipo, e i visori li mostrano in un pannello laterale che i più non hanno mai aperto. Il foglio di calcolo dietro il grafico a volte viaggia allegato al grafico.
- **I livelli di contenuto opzionale** possono tenere contenuto di pagina spento anziché rimosso: presente per intero, mostrato mai.

Ognuna di queste cose è un dato che le pagine non mostrano, in un file che la gente giudica dalle pagine.

## Spedire un PDF senza la sua memoria

Lo schema in tutto questo: che cosa sopravvive lo decide il modo in cui il file è stato scritto, quindi il rimedio è farlo passare per qualcosa che scrive senza memoria, sulla tua macchina — la storia di un documento è esattamente ciò che non va caricato sul server di uno sconosciuto, argomento che [la guida sul caricare file](https://abox.tools/it/guide/e-sicuro-caricare-i-propri-file/) svolge per intero. Tre strumenti di questo sito scrivono PDF, e tutti e tre sono stati costruiti per lasciare fuori la memoria:

- Lo strumento per [unire e dividere PDF](https://abox.tools/it/unire-pdf/) scrive un'uscita **senza alcun dizionario di informazioni**: niente autore, niente date, nessuna riga che nomini il software. Ciò che copia dai tuoi originali è ciò che le loro pagine usano, non il loro bagaglio. C'è [una guida](https://abox.tools/it/guide/unire-e-dividere-file-pdf/).
- Il [compressore di PDF](https://abox.tools/it/comprimere-pdf/) riscrive il file per intero — storia superata abbandonata, pacchetto XMP e dati privati delle applicazioni non conservati — e dettaglia ciò che ha tolto. Anche lui [con una guida](https://abox.tools/it/guide/ridurre-le-dimensioni-di-un-pdf/).
- Lo strumento per [oscurare un PDF](https://abox.tools/it/oscurare-pdf/), per quando la memoria è proprio il punto: a ogni passaggio ripulisce il blocco di informazioni, il pacchetto XMP, i segnalibri, i commenti, i valori dei campi e gli allegati, oltre all'oscuratura stessa — [la sua guida](https://abox.tools/it/guide/oscurare-un-pdf/) percorre tutto.

E il collaudo rispecchia la falla: giudica il file, non le pagine. Apri il pannello delle proprietà e leggi che cosa resta; cerca nel file grezzo una parola rimossa; guarda il prospetto del compressore su ciò che il tuo documento si portava addosso. Un PDF senza memoria non ha nulla da confessare, chiunque lo legga.
