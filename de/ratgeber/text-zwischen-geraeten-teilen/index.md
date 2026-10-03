# So teilen Sie Text und Dateien zwischen Geräten, ohne sie hochzuladen

Die üblichen Wege, eine Notiz oder Datei auf einen anderen Rechner zu bringen, hinterlassen alle eine Kopie: im Gesendet-Ordner, im Chatverlauf oder auf dem Server einer Sharing-Seite, hinter einem Löschknopf, dem man vertrauen muss. Es gibt einen Weg, der nirgendwo etwas hinterlässt, weil nie etwas gespeichert wird - und es ist zugleich der einzige mit einem Namen, den man durch einen Raum rufen kann.

[Text & Dateien teilen öffnen](https://abox.tools/de/text-teilen/): Die Freigabe lebt in diesem offenen Tab. Leser holen sie verschlüsselt direkt aus Ihrem Browser, und mit dem Schließen des Tabs endet sie - auf keinem Server ist irgendetwas gespeichert.

Zuletzt aktualisiert 27. August 2026

## Die kurze Antwort

Öffnen Sie [Text & Dateien teilen](https://abox.tools/de/text-teilen/) auf dem Gerät, das die Sache hat, schreiben Sie oder hängen Sie an, und drücken Sie *Freigabe starten*. Die Seite gibt der Freigabe einen Namen wie `brave-otter-42`; auf dem anderen Gerät öffnen Sie dieselbe Seite und setzen `#brave-otter-42` ans Ende der Adresse — oder folgen einfach dem kopierten Link. Das andere Gerät fragt vor dem Verbinden nach, Sie lassen es ein, und Text oder Datei wandern verschlüsselt direkt von einem Browser in den anderen. Schließen Sie den teilenden Tab, ist die Freigabe vorbei, überall.

Hochgeladen wurde dabei zu keinem Zeitpunkt etwas. Das ist keine Richtlinie, sondern die Bauform. Der Rest dieser Seite erklärt, warum das zählt und wo die ehrlichen Grenzen liegen.

![Die erste Karte des Teilen-Werkzeugs: ein Textfeld mit ein paar Zeilen Besprechungsnotizen, darüber ein Markdown-Schalter und eine Schaltfläche zum Anhängen einer Datei.](https://abox.tools/screens/share-text-between-devices/write.webp)

Was übergeben wird. In dasselbe Feld passt eine Einkaufsliste ebenso wie ein Dokument, und Markdown ist ein Schalter und kein eigener Modus.

## Wo die üblichen Wege eine Kopie hinterlassen

Mailen Sie sich eine Notiz, existiert sie jetzt in einem Gesendet-Ordner und einem Posteingang, beide synchronisiert, beide gesichert, beide noch in Jahren durchsuchbar. Fügen Sie ein Passwort in eine Chat-App ein, liegt es im Verlauf dieser Unterhaltung — und im Cloud-Backup der App —, solange es die Unterhaltung gibt. Nehmen Sie ein Pastebin oder eine Datei-Drop-Seite, liegt der Inhalt auf deren Server, hinter einer Ablaufeinstellung und einem Löschknopf, von denen Sie nur die Farbe des Knopfes prüfen können. Jeder dieser Wege ist ein Speicherdienst, der Teilen als Funktion trägt.

Manchmal ist genau das gewollt — eine Kopie, die wartet, bis der andere so weit ist. Aber die meisten schnellen Freigaben sind das Gegenteil: Das andere Gerät steht daneben, der Inhalt ist flüchtig, und jede gespeicherte Kopie ist reine Last. Das WLAN-Passwort für den Gast, eine Adresse am Telefon, eine Fehlermeldung, die ein zweites Augenpaar braucht, ein Konfigurationsschnipsel auf dem Weg zu der Maschine, auf die er gehört. Nichts davon will ein Archiv.

## Was „direkt“ wirklich heißt

Das Werkzeug benutzt WebRTC, dieselbe Maschinerie wie Videoanrufe im Browser: Zwei Browser öffnen einen verschlüsselten Kanal zueinander und schicken Daten hindurch, ohne Server im Weg. Im selben Netz reisen die Bytes nur durchs lokale Netz — zwei Laptops im selben WLAN reichen die Datei durchs Zimmer, nicht durchs Internet.

Ein ehrliches Sternchen, das auch auf der Werkzeugseite steht: Zwei Browser können einander nicht allein finden. Ein kleiner Server — der Vermittler — bringt die Person, die den Namen eingetippt hat, mit der zusammen, die darunter teilt, und trägt ein paar Kilobyte Verbindungsaufbau zwischen ihnen. Er speichert nichts, und der Inhalt läuft nie durch ihn hindurch; sein vollständiger Quelltext ist neben dem des Werkzeugs veröffentlicht. Er ist die Vorstellung, nicht das Gespräch — und der eine Server, mit dem irgendetwas auf dieser Website spricht, weshalb die Werkzeugseite genau ausbuchstabiert, was er sehen kann und was nicht.

Direkt heißt auch gegenseitig: Jeder Browser erfährt die Netzadresse des anderen, wie bei einem Telefonat. Die lesende Seite erfährt das, bevor irgendeine Verbindung existiert, und verbindet sich nur durch eigene Entscheidung.

## Der Name ist die Adresse, und das einzige Geheimnis

Ein Freigabe-Link unterscheidet sich von jedem anderen in einem praktischen Punkt: Er übersteht das Aussprechen. `brave-otter-42` lässt sich durch einen Raum rufen, am Telefon vorlesen oder von einer Tafel abschreiben und am anderen Ende eintippen, ohne dass jemandem die Daumen ausgehen. Genau dafür sehen die Namen so aus, wie sie aussehen.

Es schneidet in beide Richtungen: Wer einen lebenden Namen kennt oder errät, kann die Freigabe dahinter öffnen. Geben Sie allem Heiklen entweder einen Namen, den niemand erraten würde, oder stützen Sie sich auf die Voreinstellung — Freigaben sind *privat*, solange Sie das Häkchen nicht entfernen: Jeder ankommende Leser muss sich vorstellen, und Sie entscheiden, Nachricht für Nachricht, wer hineinkommt. Die Vorstellung reist über den verschlüsselten Direktkanal, nicht einmal der Vermittler erfährt also, wer gefragt hat.

![Die zweite Karte: ein Linkname, der thursday-notes lautet, ein Hinweis, dass der Name die Adresse und das einzige Geheimnis ist, und Schalter für privat und einmalig.](https://abox.tools/screens/share-text-between-devices/name.webp)

Der Name ist die ganze Adresse. Privat heißt, dass jeder Lesende fragen muss und Sie ihn hereinlassen; einmalig heißt, dass auch auf diesem Gerät kein Entwurf bleibt.

## Was das Schließen des Tabs wirklich beendet

Die Freigabe lebt im teilenden Tab und nirgendwo sonst, deshalb ist das Schließen dieses Tabs die Löschung — kein Antrag auf eine. Der Link stirbt binnen ein, zwei Sekunden, und Leser, die noch auf die Freigabe schauen, sehen ihre Seite leer werden. Es gibt keine Serverkopie mit eigenem Lebenszyklus, keinen Papierkorb, keine dreißigtägige Aufbewahrung. Der Entwurf, den Sie getippt haben, bleibt in Ihrem eigenen Browser, damit er beim nächsten Mal da ist, und selbst das lässt sich mit der Einmalig-Einstellung abschalten.

Was es nicht beendet, ist Besitz. Ein Leser, der den Text kopiert oder die Datei heruntergeladen hat, solange die Freigabe offen war, hat sie — genau als hätten Sie sie ihm auf jedem anderen Weg gegeben. Kein Werkzeug kann zurückholen, und eines, das es behauptete, würde Sie über den Rechner eines anderen belügen. Das Beenden regelt die Zukunft — niemand Neues, nichts weiter —, und das ist der Teil, den ein Dienst mit gespeicherter Kopie Ihnen nicht geben kann.

## Ein Online-Vorstellungsgespräch ist der Idealfall

Ein Übergabe-Werkzeug will beide Seiten anwesend, und ein Vorstellungsgespräch ist der eine Termin, bei dem Anwesenheit garantiert ist: Sie sehen einander bereits. Es ist zugleich der Moment, in dem die speichernden Wege am teuersten sind. Was durch den Meeting-Chat geht, landet im Protokoll der Plattform, hängt an der Aufzeichnung und an jedem, dem sie später geschickt wird; und wer bei geteiltem Bildschirm ein Postfach oder eine Chat-App öffnet, um einen Link zu holen, legt seine Korrespondenz auf die Aufnahme eines anderen. Die Freigabeseite zeigt das Geteilte und sonst nichts.

In der Praxis: der Portfolio-Link, das Repository, das PDF der Hausaufgabe, der Code-Schnipsel, der die typografischen Anführungszeichen des Chatfensters nicht überleben würde — starten Sie die Freigabe vor dem Gespräch, und wenn der Moment kommt, sagen Sie den Namen laut. `brave-otter-42` übersteht einen Sprachanruf unversehrt, genau dafür sind die Namen geformt, und die andere Seite hat die Datei, bevor der Satz zu Ende ist. Privat belassen, macht die Freigabe den Eintritt des Gegenübers zu etwas, das Sie mitten im Gespräch freigeben, statt zu einer offen stehenden Tür; und endet der Anruf, endet mit dem Schließen des Tabs auch die Freigabe — nichts wartet in einem Protokoll darauf, später aus dem Zusammenhang gerissen zu werden.

Eine ehrliche Vorbereitung: Interviewer sitzen öfter als die meisten Leser in strengen Firmennetzen, und genau dort lebt das seltene Paar ohne direkten Pfad. Deren Netz lässt sich von zu Hause nicht testen — aber das Werkzeug meldet das Scheitern binnen zwanzig Sekunden, statt zu hängen, und so kostet der Ausweichweg Augenblicke, nicht das Gespräch.

## Wann dies das falsche Werkzeug ist

Beide Enden müssen anwesend sein: Dies ist eine Übergabe, kein Briefkasten. Schläft die andere Person, nehmen Sie etwas, das speichert — wissentlich. Der teilende Tab muss offen und wach bleiben, was praktisch heißt, dass ein Desktop oder Laptop teilt; Telefone legen Hintergrund-Tabs binnen Sekunden schlafen, lesen eine Freigabe aber tadellos. Offline kann es nicht arbeiten, als einziges Werkzeug dieser Website, denn eine andere Maschine zu erreichen ist ein Netzvorgang — die Editor-Hälfte funktioniert allerdings ganz ohne Verbindung. Und eine kleine Minderheit von Netzpaaren — typischerweise ein Ende im Mobilfunknetz eines Anbieters mit geteilten Adressen oder hinter einem strengen Firmennetz — lässt sich gar nicht direkt verbinden; das Werkzeug sagt das nach zwanzig Sekunden klar und bietet dem Leser ein verschlüsseltes Relais an, das die Bytes weiterreicht, ohne sie lesen zu können, statt stillschweigend auf eines zu wechseln.

Für alles andere — die Notiz, das Passwort, die Konfigurationsdatei, das 100-MB-Video, das einen WLAN-Sprung entfernt ist — ist der direkte Weg schneller, einfacher, und hinterlässt die Welt genau so, wie er sie vorgefunden hat.
