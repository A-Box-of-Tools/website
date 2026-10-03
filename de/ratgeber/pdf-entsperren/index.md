# Ein PDF entsperren und die Art des Schutzes erkennen

„Geschützt“ bezeichnet zwei verschiedene Dinge: ein echtes Öffnungspasswort und einen Hinweis in der Datei, der den Leser bittet, nicht zu drucken. Der Unterschied ist in einer Sekunde erkennbar und entscheidet alles Weitere.

[PDF-Entsperrer öffnen](https://abox.tools/de/pdf-entsperren/): Die meisten gesperrten PDFs brauchen gar kein Passwort. Dieses Werkzeug sagt Ihnen, welche Sorte Sie haben, bevor es sie anrührt.

Zuletzt aktualisiert 10. September 2026

## Die kurze Antwort

Öffnen Sie das Werkzeug [PDF entsperren](https://abox.tools/de/pdf-entsperren/) und ziehen Sie das Dokument hinein. Binnen einer Sekunde zeigt es, welcher von zwei völlig verschiedenen Fällen vorliegt:

- **Das Dokument öffnet sich, lässt sich aber nicht drucken oder kopieren.** Ein Passwort ist unnötig. Drücken Sie die Schaltfläche, und die Einschränkungen verschwinden. Das ist der weitaus häufigere Fall.
- **Das Dokument verlangt vor dem Öffnen ein Passwort.** Sie benötigen dieses Passwort. Weder diese noch eine andere ehrliche Seite kann es für Sie herausfinden.

Die folgenden Abschnitte erklären den Unterschied. Sie sollten ihn kennen, bevor Sie ein Dokument einem Entsperrdienst geben.

## Die zwei Schlösser und warum nur eines ein Schloss ist

Ein PDF hat Platz für zwei Passwörter. Leser stellen sie fast gleich dar, und daraus entsteht die Verwirrung.

Das **Benutzerpasswort**, meist Öffnungspasswort genannt, ist echter Schutz. Der Dateiinhalt wird verschlüsselt; der Schlüssel stammt aus diesem Passwort. Das Passwort steht nirgends im Dokument. Ohne es kann niemand die Datei lesen: weder Sie noch eine Website oder das Programm, das sie erzeugt hat.

Das **Eigentümerpasswort** steuert dagegen die *Einschränkungen* für Drucken, Kopieren, Bearbeiten und Formularausfüllen. Häufig hat ein Dokument nur ein Eigentümerpasswort und kein Benutzerpasswort. Es öffnet sich dann per Doppelklick, verweigert aber das Drucken.

Eine Datei, die ohne Nachfrage öffnet, *muss alles enthalten, was zur Ableitung ihres Schlüssels nötig ist*. Ihr Leser hat ihn gerade ohne Ihre Hilfe abgeleitet. Der Inhalt ist also mit einem für jeden berechenbaren Schlüssel verschlüsselt. Ein separates Feld mit Berechtigungsbits hindert den Leser am Drucken. Leser beachten es freiwillig. Adobe hat das von Anfang an als Vereinbarung dokumentiert. Es ist eine Bitte, keine technische Barriere.

Deshalb lassen sich Einschränkungen sofort entfernen, ein unbekanntes Öffnungspasswort dagegen nicht. Es sind keine zwei Stärken desselben Schlosses. Eines ist ein Schloss, das andere ein Hinweis an der Tür.

## So erkennen Sie den Fall ohne jedes Werkzeug

Öffnen Sie die Datei per Doppelklick.

- **Sie verlangt ein Passwort.** Das ist das Benutzerpasswort. Sie benötigen es.
- **Sie öffnet sich, aber eine Funktion ist ausgegraut**, etwa Drucken, Kopieren oder Formularfelder, und die Titelleiste oder Dokumenteigenschaften zeigen „Geschützt“. Dann liegen nur entfernbare Einschränkungen vor.

In den meisten Lesern finden Sie Einzelheiten in den Dokumenteigenschaften unter Sicherheit. Dort steht jede Berechtigung als erlaubt oder nicht erlaubt. [PDF entsperren](https://abox.tools/de/pdf-entsperren/) zeigt dieselbe Liste und zusätzlich das Verschlüsselungsverfahren und seine heutige Schutzwirkung.

## Was „verschlüsselt“ bedeutet, hängt vom Alter des Verfahrens ab

Zwei Dokumente können beide „passwortgeschützt“ heißen und technisch dreißig Jahre auseinanderliegen. Das Format durchlief fünf Generationen:

- **RC4 mit 40 Bit** (PDF 1.1, 1994). An die damaligen US-Exportgrenzen angepasst. Der Schlüssel ist kurz genug, um ihn auf gewöhnlicher Hardware vollständig zu durchsuchen.
- **RC4 mit 128 Bit** (PDF 1.4, 2001). Ein 128-Bit-Schlüssel wird nicht vollständig durchsucht, doch RC4 gilt seit 2013 als gebrochen. TLS verbot es 2015; Browser entfernten es Anfang des Folgejahres.
- **AES-128** (PDF 1.6, 2005). Eine moderne Verschlüsselung mit vorgelagerter Schlüsselableitung von 1994. Der Cipher ist gut, doch die Ableitung ist billig genug, dass sich Passwörter leichter raten lassen, als die Schlüssellänge vermuten lässt.
- **AES-256, erster Versuch** (2008). Adobes später zurückgezogene Erweiterung. Der Passwort-Hash war billig genug, um ihn mit der hohen Hashgeschwindigkeit einer Grafikkarte anzugreifen.
- **AES-256, PDF 2.0** (2017). Absichtlich aufwendig berechnet und das weiterhin sinnvolle Verfahren. Der Schutz ist so stark wie das Passwort.

Sagt jemand, sein Dokument sei wegen eines Passworts sicher, fragen Sie nach dem Verfahren. Ein zwanzig Jahre alter Arbeitsablauf kann noch die erste Generation erzeugen.

## Wenn das Öffnungspasswort verloren ist

Dann ist das Dokument verloren. Das sollten Sie klar erfahren, bevor Sie mehrere Websites durchprobieren, die zuerst jeweils Ihre Datei nehmen.

Die Suchergebnisse enthalten viele Werkzeuge zur „PDF-Passwortwiederherstellung“. Sie raten mit Wörterbüchern, Mustern und allen Kombinationen. Bei kurzen Passwörtern geht das schnell, bei langen kommt es nicht zum Ziel. Manche laufen lokal, die meisten laden das Dokument auf einen Server. Viele verlangen Geld vor der Auskunft über den Erfolg. Bei einer neueren Datei mit einem starken Passwort kommen sie nicht hinein.

[PDF entsperren](https://abox.tools/de/pdf-entsperren/) rät keine Passwörter und bietet das nicht an. Es enthält weder Wörterbuch noch entsprechende Schleife; der Quellcode ist lesbar. Das ist eine bewusste Grenze. Bei den ältesten Dokumenten könnte eine Suche tatsächlich funktionieren, deshalb ist die Ablehnung ausdrücklich dokumentiert.

Versuchen Sie zuerst den Absender. Er hat das Passwort meist noch. Firmendokumente verwenden oft dasselbe Passwort innerhalb einer Abteilung oder vorhersehbare Angaben wie Geburtsdatum oder die letzten Kontoziffern. Banken und Gehaltssysteme tun das regelmäßig. Das Passwort steht meist in der Begleit-E-Mail, die vielleicht schon gelöscht wurde.

## Sollten Sie es hochladen?

Was enthalten die zu entsperrenden Dokumente? Kontoauszüge ohne Druckfreigabe, Gehaltsabrechnungen, Arztbriefe, Verträge ohne Kopierfreigabe und Steuerunterlagen. Geschützt wurden sie meist, weil ihr Inhalt als schützenswert galt.

Bei einem Upload erhält die Website zuerst den gesamten privaten Inhalt. Hat die Datei ein Öffnungspasswort, senden Sie meist auch dieses mit. Was aufbewahrt wird, wie lange und wer Zugriff hat, können Sie von außen nicht prüfen, unabhängig von den Angaben der Seite.

Das ist unnötig. PDF-Entsperren ist Rechnen mit Bytes: Schlüssel ableiten, Verschlüsselung anwenden, Datei schreiben. Ein Browser kann alles. Das [Werkzeug hier](https://abox.tools/de/pdf-entsperren/) lässt Dokument und Passwort im Tab und funktioniert ohne Netzwerk. Prüfen Sie das selbst: Trennen Sie die Verbindung und verwenden Sie es trotzdem.

Die allgemeinere Erklärung steht in [Ist es sicher, Dateien hochzuladen?](https://abox.tools/de/ratgeber/ist-das-hochladen-von-dateien-sicher/). Die besonders sensible Variante behandelt [Ist es sicher, einen Kontoauszug hochzuladen?](https://abox.tools/de/ratgeber/ist-das-hochladen-eines-kontoauszugs-sicher/).

## Zwei Änderungen an der Datei und eine ausbleibende

**Eine Signatur wird ungültig.** Bei einem digital signierten Dokument macht das Entfernen der Verschlüsselung die Signatur ungültig. Sie deckt die exakten Bytes der ursprünglichen Datei ab; das Entsperren schreibt eine neue. Jedes Programm hätte dieselbe Wirkung. Behalten Sie das weiterhin signierte Original.

**Die Datei wird meist etwas kleiner.** Beim Neuschreiben bleiben veraltete Objektkopien aus früheren Bearbeitungen zurück. Das ist ein Nebeneffekt, nicht das Ziel.

**Die Seiten selbst bleiben gleich.** Nichts wird neu gerendert, kodiert oder umgebrochen. Zeichenanweisungen, eingebettete Schriften und Bilder werden unverändert übernommen. Text bleibt auswählbar, Scans behalten ihre Auflösung und nichts verschiebt sich. Liefert ein Werkzeug ein unschärferes Dokument oder Text als Bild, hat es mehr als nur entsperrt.

## Ist es erlaubt?

Das ist eine Frage Ihrer Rechte am Dokument, nicht der Technik. Die Antwort hängt von der Datei und Ihrem Aufenthaltsort ab.

Technisch sind Einschränkungen ein Feld, das Leser vereinbarungsgemäß beachten. Sie waren nie eine kryptografische Barriere. Alltägliche Anwendungen sind der eigene nicht druckbare Kontoauszug, ein bezahlter nicht kopierbarer Bericht, ein Scan zum Umordnen oder ein auszufüllendes Formular. Gehört das Dokument nicht Ihnen zur Nutzung, verschafft das Entfernen eines Berechtigungsbits keine Rechte daran.

## Danach

Ein entsperrtes Dokument ist gewöhnliches PDF, mit dem die übrigen Werkzeuge arbeiten können: [zusammenführen oder teilen](https://abox.tools/de/pdf-zusammenfuegen/), [verkleinern](https://abox.tools/de/pdf-verkleinern/) oder [einen Namen wirklich entfernen](https://abox.tools/de/pdf-schwaerzen/). War privater Inhalt der Grund für den Schutz, ist Letzteres oft der nächste sinnvolle Schritt.
