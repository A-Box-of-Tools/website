# Eine Kontoauszug-CSV prüfen, bevor Sie ihr vertrauen

Eine Tabelle kann perfekt aussehen und trotzdem falsche Beträge oder fehlende Buchungen enthalten. Vergleichen Sie sie mit dem Auszug: gedruckte Salden prüfen die Zahlen, die Originalzeilen den Rest.

Zuletzt aktualisiert 29. September 2026

## Die kurze Antwort

Eine sauber geöffnete CSV-Datei kann trotzdem falsche Beträge, fehlende Buchungen oder falsch gelesene Daten enthalten. Vergleichen Sie sie mit dem Originalauszug: erst Zeilen, Daten und Beschreibungen, dann die Beträge anhand der gedruckten laufenden Salden.

Behalten Sie das PDF neben der umgewandelten Datei. Ein erfolgreicher Download beweist nur, dass ein Konverter eine Datei erstellt hat. Diese Prüfungen helfen zu klären, ob sie den Auszug richtig wiedergibt.

## Suchen Sie vor der Umwandlung nach einem Export

Bietet Ihre Bank einen CSV-Download für den benötigten Zeitraum, beginnen Sie damit. Ein direkter Export vermeidet die Rekonstruktion einer Tabelle aus auf PDF-Seiten verteiltem Text. Prüfen Sie Konto, Zeitraum und Spaltenbedeutung. Eine mögliche Fehlerquelle entfällt aber.

Manchmal gibt es nur das PDF: ein alter Auszug, ein geschlossenes Konto oder ein zugesandtes Dokument. Dann ist eine Umwandlung sinnvoll.

## Ein kleiner Beispielauszug

Dieser fiktive Girokontoauszug beginnt mit **1,250.00**. Positive Beträge erhöhen das Guthaben, negative verringern es. Die letzte Spalte ist auf dem Auszug gedruckt und wurde nicht nachträglich in der Tabelle berechnet.

Vier fiktive Buchungen mit einem Anfangssaldo von 1,250.00

| Datum | Beschreibung | Betrag | Gedruckter Saldo |
| --- | --- | --- | --- |
| 2026-08-03 | Gehaltszahlung | +800.00 | 2,050.00 |
| 2026-08-04 | Lebensmittel | -43.20 | 2,006.80 |
| 2026-08-05 | Kaffee | -6.80 | 2,000.00 |
| 2026-08-06 | Überweisung | -125.00 | 1,875.00 |

Jede Zeile erlaubt eine Prüfung: **vorheriger Saldo + Betrag mit Vorzeichen = neuer Saldo**. Für Lebensmittel gilt `2050.00 + (-43.20) = 2006.80`, für Kaffee `2006.80 + (-6.80) = 2000.00`.

Angenommen, die CSV-Datei liest den Lebensmittelbetrag als **-48.20**. Alle Zellen sind gefüllt, aber `2050.00 + (-48.20) = 2001.80`. Die Abweichung vom gedruckten Saldo beträgt **5.00**. Damit kennen Sie die konkrete Zeile, die im PDF geprüft werden muss.

Behalten Sie bei der Prüfung die gedruckten Salden. Ersetzen Sie sie durch Formeln aus den umgewandelten Beträgen, stimmt die Tabelle nur mit sich selbst überein, einschließlich möglicher Fehler.

Prüfen Sie vor den Vorzeichen, was der Saldo bedeutet. Ein Kreditkartenauszug kann die Schuld zeigen: Einkäufe erhöhen sie, Rückzahlungen verringern sie. Positive und negative Beträge bedeuten dort nicht zwingend dasselbe wie im Girokontobeispiel.

## Warum der Endsaldo nicht genügt

Anfangssaldo plus alle Beträge mit dem Endsaldo zu vergleichen ist sinnvoll, doch Fehler können sich aufheben. Ist eine Zahlung um 5.00 zu groß und eine andere um 5.00 zu klein gelesen, stimmt die Summe trotzdem.

Jeder verfügbare laufende Saldo bietet einen weiteren Vergleich. Gibt es nur einen Saldo pro Tagesende, vergleichen Sie ihn mit dem vorherigen gedruckten Saldo plus allen dazwischenliegenden Beträgen.

Auch das hat Grenzen. Zwei fehlende Buchungen von **-20.00 und +20.00** ändern den Saldo nicht. Die Prüfung über diese Lücke kann bestehen. Vergleichen Sie daher zusätzlich die Reihenfolge und Zahl der Originalzeilen.

Ein passender Saldo bestätigt weder Datum noch Zahlungsempfänger und beweist nicht die Echtheit des Auszugs. Er prüft nur die Beziehung der verfügbaren Beträge und Salden.

## Prüfen Sie Daten vor jedem Sortieren

`03/04/2026` kann der 3. April oder der 4. März sein. `18/04/2026` kann die Konvention klären, doch ein kurzer Auszug enthält vielleicht keinen solchen Hinweis. Prüfen Sie Zeitraum und Darstellung der Bank, statt eine Vermutung zu übernehmen.

Prüfen Sie nach dem Öffnen der CSV-Datei erneut: Ihr Tabellenprogramm kann Daten anders deuten als der Konverter. Behalten Sie die ursprüngliche Reihenfolge bis zum Abschluss der Prüfung. Sortierte, teilweise falsch gelesene Daten erschweren den Zeilenvergleich und stören die Saldofolge.

Bei Daten ohne Jahr muss auch der Auszugszeitraum geprüft werden, besonders zwischen Dezember und Januar. Prüfen Sie Zahlenkonventionen: `1,240.00` und `1.240,00` können denselben Betrag meinen. Die importierten Zellen müssen diesen Wert erhalten.

## Lesen Sie Beschreibungen und trennen Sie Summen

Eine zweizeilige Beschreibung bleibt eine einzige Buchung. Prüfen Sie, ob die Fortsetzung bei ihr geblieben ist. Beachten Sie besonders Seitenumbrüche, an denen wiederholte Überschriften und Übertragssalden wie zusätzliche Zeilen aussehen können.

Ein PDF kann auch Kontozusammenfassungen, Zwischensummen und Zahlungsdetails enthalten. Sie gehören zur Dokumentextraktion, dürfen aber nicht als zusätzliche Buchungen importiert werden. Identifizieren Sie die Buchungstabelle und trennen Sie Zusammenfassungszeilen vor dem Import.

Zwei Zahlungen mit gleichem Datum, Empfänger und Betrag können beide echt sein. Vergleichen Sie Positionen und Referenzen mit dem Auszug, bevor Sie eine löschen. Eine doppelte Extraktion und eine wiederholte Zahlung brauchen verschiedene Korrekturen.

## Was der Konverter hier prüft

[PDF zu CSV](https://abox.tools/de/pdf-in-csv-umwandeln/) erkennt Tabellen anhand der Textausrichtung, verbindet umgebrochene Zellen und behält Summen sowie Abschnittsbezeichnungen. Bei mehreren Tabellen wählen Sie die benötigte. Für mehrdeutige Daten gibt es eine Einstellung der Datumsreihenfolge; Daten ohne Jahr bleiben wie gedruckt.

Erkennt das Werkzeug eine laufende Saldokette, meldet es, ob die verfügbaren Vergleiche übereinstimmen. Prüfen Sie selbst die Beträge vor dem ersten gedruckten Saldo gegen den Anfangssaldo sowie die Beträge nach dem letzten. Eine erfolgreiche Meldung gilt nur für die tatsächlich möglichen Vergleiche.

Ohne erkannte Saldokette gibt es kein Prüfurteil. **Keine Meldung ist keine Bestätigung.** Weder ein stilles Ergebnis noch passende Salden garantieren die Richtigkeit der gesamten Datei. Die Vorschau zeigt höchstens 25 Zeilen pro Tabelle. Prüfen Sie den Rest in der heruntergeladenen Datei.

Gescannte Seiten benötigen Texterkennung, die dieses Werkzeug nicht bietet. Die Umwandlung läuft im Browser. Der separate Ratgeber zum [Upload eines Kontoauszugs an einen Konverter](https://abox.tools/de/ratgeber/ist-das-hochladen-eines-kontoauszugs-sicher/) behandelt den Datenschutz.

## Vor dem Import in andere Programme

Prüfen Sie die Importvorschau des Zielprogramms ebenso sorgfältig. Wählen Sie das richtige Bank- oder Kreditkartenkonto, bestätigen Sie das Datumsformat und ordnen Sie Datum, Beschreibung und Betrag den richtigen Spalten zu. Das sind eigene Entscheidungen nach der PDF-Extraktion. Die [CSV-Importanleitung von Intuit](https://quickbooks.intuit.com/learn-support/en-uk/help-article/bank-transactions/prepare-csv-file-bank-upload-quickbooks/L4BjLWckq_GB_en_GB) zeigt die Anforderungen eines Produkts.

- Bestätigen Sie Konto und Auszugszeitraum.
- Prüfen Sie nach dem Öffnen Daten, Vorzeichen und Zahlenformate.
- Vergleichen Sie Buchungszeilen einschließlich Seitenumbrüchen mit dem Original.
- Prüfen Sie verfügbare Anfangs-, laufende und Endsalden.
- Untersuchen Sie Abweichungen und wiederholte Zeilen vor einer Änderung.
- Behalten Sie Originalauszug und eine Kopie der geprüften CSV-Datei.
