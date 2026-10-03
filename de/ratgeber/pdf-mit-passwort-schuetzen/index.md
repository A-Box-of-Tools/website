# Ein PDF mit Passwort schützen und verstehen, was es bewirkt

Ein PDF-Passwort hält Unbefugte tatsächlich fern. Einschränkungen für Drucken oder Kopieren bitten nur darum. Beides ist sinnvoll; der Unterschied entscheidet, welchen Schutz Sie zusagen können.

[PDF-Schutz öffnen](https://abox.tools/de/pdf-schuetzen/): Ein Dokument sperren, das Sie zum Sperren lieber keiner Website in die Hand geben.

Zuletzt aktualisiert 12. September 2026

## Die kurze Antwort

Öffnen Sie das Werkzeug [PDF schützen](https://abox.tools/de/pdf-schuetzen/), ziehen Sie das Dokument hinein, geben Sie ein Passwort zweimal ein und drücken Sie die Schaltfläche. Die Datei wird im Browser mit AES-256 verschlüsselt. Die Seite öffnet das Ergebnis vor dem Download erneut: einmal ohne Passwort, was abgelehnt werden muss, und einmal damit. Nichts wird hochgeladen. Ohne Internet funktioniert es genauso.

Der Rest erklärt, was Sie damit bewirken. Ein Passwort und eine Einschränkung sind verschieden. Davon hängt ab, welche Schutzwirkung Sie zusagen können.

## Die zwei Schutzmöglichkeiten für PDF

Ein PDF hat Platz für zwei Passwörter. Die Anzeige in Lesern ähnelt sich so stark, dass viele Menschen den Unterschied nie kennenlernen.

Das **Öffnungspasswort**, auch *Benutzerpasswort*, ist ein echtes Schloss. Der Dateiinhalt wird verschlüsselt, der Schlüssel vom Passwort abgeleitet. Das Passwort steht nirgends im Dokument. Ohne es kann niemand die Datei lesen: weder der Empfänger noch eine Website oder das Programm, das sie erzeugt hat.

Die **Einschränkungen** für Drucken, Kopieren und Bearbeiten, gesteuert vom *Eigentümerpasswort*, sind eine Bitte. Eine Datei, die ohne Passwortabfrage öffnet, *muss alles enthalten, was zur Ableitung ihres Schlüssels nötig ist*, denn der Leser hat ihn gerade abgeleitet. Ein separates Feld mit Berechtigungsbits hindert den Leser am Drucken. Leser beachten es freiwillig. Adobe hat das von Anfang an so dokumentiert; jeder Leser darf darauf verzichten. Das Werkzeug [PDF entsperren auf dieser Website](https://abox.tools/de/ratgeber/pdf-entsperren/) tut das.

Die Einschränkungen sind trotzdem sinnvoll. Die meisten Leser beachten sie. „Drucken verbieten“ sagt, wie Sie die Datei verwendet sehen möchten. Sie sollten sich nur nicht darauf *verlassen*. Soll die falsche Person den Inhalt nicht lesen, setzen Sie ein Öffnungspasswort. Möchten Sie Drucke vermeiden, wählen Sie das Kontrollkästchen und verstehen Sie es als Bitte.

## Welche Verschlüsselung passt

Das Werkzeug bietet zwei Verfahren. Ohne besonderen Grund ist die Voreinstellung richtig.

- **AES-256**, das PDF-2.0-Verfahren von 2017, ist voreingestellt. Das Passwort durchläuft eine absichtlich aufwendige Hashberechnung mit datenabhängig wechselnder Rundenzahl. Dadurch ist spezielle Hardware zum Passwort-Raten schwieriger zu bauen. Leser seit Acrobat X von 2010 unterstützen es: Browser, Handys und aktuelle Desktopreader. Der Schutz ist so stark wie das Passwort.
- **AES-128**, das Verfahren von 2005, ist für Leser vor 2010 gedacht, die die Datei öffnen müssen. Die Verschlüsselung selbst ist gut. Schwächer ist die vorgelagerte Schlüsselableitung von 1994. Sie ist so billig, dass sich Passwörter wesentlich leichter raten lassen, als die Schlüssellänge vermuten lässt. Kennen Sie den Zielreader nicht, wählen Sie 256.

Beide sind weit besser als die erste PDF-Verschlüsselung mit einem 40-Bit-Schlüssel von 1994, den ein Laptop vollständig durchsuchen kann. Leser bezeichnen trotzdem alles mit denselben Worten. Sagt jemand, ein Dokument sei „passwortgeschützt“ und deshalb sicher, fragen Sie nach der Generation. Das Werkzeug [PDF entsperren](https://abox.tools/de/pdf-entsperren/) nennt sie für jede eingelegte Datei.

## Warum das Passwort mehr zählt als das Verfahren

AES-256 bietet keinen Umweg durch die Verschlüsselung. Ohne Passwort bleibt nur Raten, und die Hashberechnung soll jeden Versuch bremsen. Langsam ist nicht unmöglich. Ein Wort mit sechs Zeichen lässt sich mit einigen Millionen Versuchen erraten, ein merkbarer langer Satz nicht. Die Seite zählt beim Tippen Zeichen und warnt bei einer kurzen Eingabe. Die Regel bleibt einfach: Das Dokument ist so sicher wie sein Passwort, und ein langes kostet nichts.

Daraus folgen zwei Dinge. Geben Sie das Passwort zweimal ein. Die Seite verlangt das, weil ein Tippfehler in einem starken Passwort eine unlesbare Datei hinterlässt. Behalten Sie außerdem das Original. Der Schutz schreibt eine neue Datei; das Original bleibt unverändert und ist bei Verlust des Passworts die wichtige Kopie.

## Wenn Sie es vergessen

Dann ist das Dokument verloren. Das sollten Sie hier erfahren und nicht erst auf einer Website zur „PDF-Passwortwiederherstellung“, die zuerst Ihre Datei nimmt. Solche Dienste raten: mit Wörterbüchern, Mustern und schließlich allen Kombinationen. Gegen ein starkes Passwort im aktuellen Verfahren kommen sie nicht zum Ziel. Meist laden sie das Dokument auf einen Server, und viele verlangen Geld, bevor sie über den Erfolg berichten.

Diese Website errät keine Passwörter. Das Entsperrwerkzeug enthält keine entsprechende Schleife. Das Schutzwerkzeug verlangt das Passwort gerade deshalb zweimal, weil es keinen Rückweg gibt. Das ist eine bewusste Grenze.

## Warum der Upload der merkwürdige Teil ist

Was schützen Sie? Einen Kontoauszug, Vertrag, Arztbrief, Steuerunterlagen oder eine Passkopie für einen Vermieter. Ein Dokument, das Sie mit einem Passwort versehen möchten, wollen Sie meist nicht in fremden Händen sehen.

Jedes Onlinewerkzeug dafür verlangt zuerst das ungeschützte Original und anschließend das Passwort. Beides gelangt an einen Server, dessen Aufbewahrung Sie nicht prüfen können. Um etwas privat zu machen, haben Sie es damit vollständig zusammen mit dem Schlüssel an jemanden Unbekannten geschickt.

Das ist unnötig. Ein PDF zu schützen ist Rechnen mit Bytes: Schlüssel ableiten, Verschlüsselung anwenden, Datei schreiben. Ein Browser kann alle drei Schritte. Das [Werkzeug hier](https://abox.tools/de/pdf-schuetzen/) lässt Dokument und Passwort im Tab. Die Sicherheitsrichtlinie nennt jede erlaubte Kontaktadresse; keine gehört zu dieser Website. Es funktioniert ohne Netzwerk. Prüfen Sie das selbst, indem Sie die Verbindung trennen und es trotzdem verwenden.

Die allgemeinere Erklärung steht in [Ist es sicher, Dateien hochzuladen?](https://abox.tools/de/ratgeber/ist-das-hochladen-von-dateien-sicher/). Dieselbe Frage für besonders sensible Dokumente behandelt [Ist es sicher, einen Kontoauszug hochzuladen?](https://abox.tools/de/ratgeber/ist-das-hochladen-eines-kontoauszugs-sicher/).

## Zwei Änderungen an der Datei und eine ausbleibende

**Eine Signatur wird ungültig.** Bei einem digital signierten Dokument macht das Schützen die Signatur ungültig. Sie deckt die exakten Bytes der ursprünglichen Datei ab; der Schutz schreibt eine neue. Jedes Programm hätte dieselbe Wirkung. Brauchen Sie beides, schützen Sie zuerst und signieren Sie die geschützte Kopie.

**Die Größe ändert sich etwas.** Verschlüsselung ergänzt jeden Datenstrom und jede Zeichenfolge um sechzehn Bytes. Gleichzeitig entfallen beim Neuschreiben veraltete Objektkopien aus früheren Bearbeitungen. Welche Wirkung überwiegt, hängt von der Datei ab.

**Die Seiten selbst bleiben gleich.** Nichts wird neu gerendert, kodiert oder umgebrochen. Zeichenanweisungen, eingebettete Schriften und Bilder werden genau so verschlüsselt, wie sie vorlagen. Mit dem Passwort bleibt Text auswählbar, Scans behalten ihre Auflösung und nichts verschiebt sich.

## Ein vorhandenes Passwort ändern

Das Format hat Platz für ein Schloss. Eine bereits mit Öffnungspasswort geschützte Datei kann kein zweites darüber erhalten. Das Werkzeug verweist deshalb auf [PDF entsperren](https://abox.tools/de/pdf-entsperren/), das den alten Schutz im selben Browser entfernt. Bringen Sie die entsperrte Kopie zurück und setzen Sie das neue Passwort. Dateien mit bloßen Einschränkungen, die sich ohne Passwort öffnen und nicht drucken lassen, werden unmittelbar angenommen. Die Seite erklärt, dass Ihre Einstellungen die vorhandenen ersetzen.

## Vor dem Schützen

Ein Öffnungspasswort schließt die übrigen Werkzeuge aus, bis die Datei wieder entsperrt ist. Erledigen Sie daher vorher die anderen Aufgaben: [zusammenführen oder teilen](https://abox.tools/de/pdf-zusammenfuegen/), [verkleinern](https://abox.tools/de/pdf-verkleinern/) und besonders [unerwünschte Inhalte wirklich entfernen](https://abox.tools/de/pdf-schwaerzen/). Das Passwort schützt vor Fremden, aber nicht davor, was der berechtigte Empfänger lesen kann.
