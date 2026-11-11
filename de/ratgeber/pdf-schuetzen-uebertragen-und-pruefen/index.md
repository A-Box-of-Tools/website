# Ein PDF schützen, übertragen und prüfen

Bereiten Sie das Dokument zuerst vor, schützen Sie seinen endgültigen Inhalt und prüfen Sie dann genau die angekommene Datei. Ein Passwort regelt das Öffnen des PDFs; eine Prüfsumme prüft, ob die empfangenen Bytes der versendeten Kopie entsprechen.

Zuletzt aktualisiert 22. Oktober 2026

## Das Dokument vor dem Schutz fertigstellen

Sie möchten eine erfundene Datei `committee-papers.pdf` an eine andere Person senden. Sie soll sich nur mit Passwort öffnen lassen, und Sie möchten prüfen, ob die heruntergeladene Kopie genau der versendeten Endfassung entspricht. Das sind getrennte Aufgaben: Der Schutz regelt das Öffnen, eine Prüfsumme vergleicht Bytes und die Übertragung bringt diese Bytes zum Empfänger.

1. Das Dokument fertigstellen und prüfen.
2. Ein einzigartiges Passwort erzeugen und eine Kopie des PDFs schützen.
3. SHA-256 für genau diese geschützte Kopie berechnen.
4. Sie übertragen und den Empfänger die Prüfsumme vergleichen lassen.

Schließen Sie Bearbeitung, Seitenauswahl, Schwärzung und Komprimierung zuerst ab. Ein Passwortschutz entfernt keine Angabe, deren Löschung Sie vergessen haben. Eine Prüfsumme sagt nicht, ob die richtigen Seiten im Paket sind. Bewahren Sie das Original sicher auf. Jede spätere Änderung der geschützten Datei erfordert eine neue Prüfsumme.

## Ein Passwort zum Öffnen des PDFs verlangen

Erzeugen Sie mit dem [Passwort- und Passphrasengenerator](https://abox.tools/de/passwort-generator/) ein langes, einzigartiges Zufallspasswort. Speichern Sie es dort, wo Sie sicher wieder darauf zugreifen können, beispielsweise in Ihrem Passwortmanager. Verwenden Sie weder ein Kontopasswort erneut noch ein Passwort, das in einem Ratgeber abgedruckt ist. Der [Generator-Ratgeber](https://abox.tools/de/ratgeber/sind-online-passwortgeneratoren-sicher/) erklärt die lokale Erzeugung.

Laden Sie das fertige Dokument in den [PDF-Schutz](https://abox.tools/de/pdf-schuetzen/) und legen Sie das Öffnungspasswort fest. Einschränkungen beim Drucken oder Kopieren sind eine andere Funktion: Ein Dokument, das sich ohne Passwort öffnet, erfüllt das Ziel dieses Ablaufs nicht. Behalten Sie die Voreinstellung AES-256 bei, sofern eine geprüfte Kompatibilitätsanforderung keinen anderen Ansatz verlangt. Der [Ratgeber zum PDF-Schutz](https://abox.tools/de/ratgeber/pdf-mit-passwort-schuetzen/) erläutert die Einstellungen und ihre Grenzen.

Laden Sie `committee-papers-protected.pdf` herunter. Wählen Sie einen Dateinamen, der nicht selbst private Informationen preisgibt. Die Verschlüsselung eines Dokuments verbirgt den Namen des Anhangs nicht.

## Den geschützten Download testen

Öffnen Sie die heruntergeladene Datei in einem PDF-Leseprogramm und prüfen Sie, dass es das Öffnungspasswort verlangt. Verwenden Sie das gespeicherte Passwort und lesen Sie danach die Seiten. Merkt sich das Leseprogramm Passwörter, beginnen Sie eine neue Sitzung. Eine bereits entsperrte Vorschau zeigt nicht, was ein erstmaliger Empfänger sehen wird.

Prüfen Sie, ob der Empfänger passwortgeschützte PDFs verwenden kann und die Datei die Grenze des Übertragungswerkzeugs einhält. Text und Dateien teilen begrenzt eine einzelne Datei derzeit auf 200 MB. Muss das Dokument kleiner werden, kehren Sie zum Original zurück, komprimieren und prüfen Sie es und schützen Sie dann diese Fassung. Erledigen Sie das, bevor Sie ihren Hashwert berechnen.

Bewahren Sie Original und Passwort sicher auf. Geht das Passwort verloren, kann die geschützte Kopie unlesbar bleiben. Für die folgenden Schritte ist die verschlüsselte Kopie der Anhang. Wählen Sie nicht versehentlich das Original.

## Den Hashwert der endgültigen verschlüsselten Bytes berechnen

Wählen Sie `committee-papers-protected.pdf` in [Hash und Prüfsumme](https://abox.tools/de/pruefsumme-berechnen/) und verwenden Sie das SHA-256-Ergebnis. Kopieren Sie den vollständigen Hashwert: SHA-256 hat 64 hexadezimale Zeichen. Nur Anfang oder Ende zu vergleichen ist eine schwächere Prüfung. Der [Prüfsummen-Ratgeber](https://abox.tools/de/ratgeber/pruefsumme-vergleichen/) erklärt den Vergleich mit einem erwarteten Hashwert.

Zwei PDFs können identisch aussehen und dennoch unterschiedliche Hashwerte haben. Selbst wenn dasselbe Original zweimal getrennt verschlüsselt wird, können unterschiedliche Bytes entstehen. Berechnen Sie den Hashwert des tatsächlich heruntergeladenen geschützten PDFs, nicht den einer früheren Fassung oder einer vom Leseprogramm unverschlüsselt gespeicherten Kopie.

| Arbeitsbestandteil | Verwendung |
| --- | --- |
| Original-PDF | Für spätere Änderungen sicher aufbewahren |
| Geschütztes PDF | Genau diese Datei hashen, übertragen und prüfen |
| Öffnungspasswort | Nur an den vorgesehenen Empfänger weitergeben |
| Erwarteter SHA-256-Wert | Zum Vergleich über einen vertrauenswürdigen Kanal übermitteln |

## Die geschützte Kopie übertragen

Öffnen Sie [Text und Dateien teilen](https://abox.tools/de/text-teilen/), wählen Sie den geschützten Download und laden Sie den Empfänger ein. Behalten Sie den privaten Zugang bei und genehmigen Sie das vorgesehene Empfangsgerät. Lassen Sie den sendenden Tab geöffnet, bis der Empfänger den Download abgeschlossen hat. Der [Ratgeber zum Teilen](https://abox.tools/de/ratgeber/text-zwischen-geraeten-teilen/) erklärt Verbindungsoptionen und Fehlerbehebung.

Dieser Schritt verwendet bewusst ein Netzwerk. Beim üblichen Ablauf zwischen Geräten vermittelt ein öffentlicher Rendezvous-Dienst den Kontakt zwischen den Browsern. Auch der Modus für das lokale Netzwerk braucht diese Vermittlung. Bei Direct wird die Datei direkt zwischen den Gegenstellen übertragen. Die Wahl von Cloud relay leitet dagegen verschlüsselten WebRTC-Verkehr über den Relay-Dienst. Der Vermittlungsdienst transportiert keine Dateiinhalte. Der Passwortschutz bleibt auch auf dem heruntergeladenen PDF erhalten.

Übermitteln Sie das Passwort über einen getrennten vertrauenswürdigen Kanal. Geben Sie auch den erwarteten Hashwert über einen authentifizierten Kanal weiter, etwa Ihre bereits bestehende Unterhaltung mit dem Empfänger. Eine ausgetauschte Datei und ein gemeinsam ausgetauschter Hashwert könnten zueinander passen. Ein Hashwert, der nur neben einem nicht vertrauenswürdigen Download steht, belegt daher dessen Herkunft nicht.

## Die empfangene Datei vor einer Änderung vergleichen

Laden Sie auf dem Empfangsgerät die Datei herunter und öffnen Sie [Hash und Prüfsumme](https://abox.tools/de/pruefsumme-berechnen/). Wählen Sie das empfangene PDF, verwenden Sie SHA-256 und vergleichen Sie den gesamten Hashwert mit dem vertrauenswürdigen erwarteten Wert. Das Vergleichsfeld des Werkzeugs erspart Ihnen, ein einzelnes falsches Zeichen mit bloßem Auge finden zu müssen.

Ein übereinstimmender SHA-256-Wert ist ein starker Beleg dafür, dass die empfangenen Bytes der vom Absender gehashten Kopie entsprechen. Er identifiziert allein weder den Urheber noch bestätigt er die Richtigkeit des Inhalts oder macht das Öffnen sicher. Dieser Ablauf setzt ein erwartetes Dokument von einem bekannten Absender voraus.

Unterscheiden sich die Hashwerte, prüfen Sie zuerst, ob beide Personen denselben Algorithmus und die geschützte Kopie gewählt haben. Ein ähnlich benanntes Original, ein neuer verschlüsselter Export oder eine später gespeicherte Fassung können die Abweichung erklären. Klären Sie das, bevor Sie die empfangene Kopie als verifiziert bezeichnen. Entschlüsseln und speichern Sie die Datei vor dem Vergleich nicht erneut, denn das würde ihre Bytes verändern.

Wenn der Vergleich erfolgreich ist, öffnen Sie dieselbe Datei mit dem Passwort und prüfen Sie, ob die vorgesehenen Seiten lesbar sind. Hashen und Lesen beantworten unterschiedliche Fragen. Diese letzte Prüfung bleibt deshalb wichtig.

## Die Übertragung nach bestätigtem Empfang beenden

Schließen Sie den sendenden Tab, nachdem der Empfänger das Dokument heruntergeladen, geprüft und geöffnet hat. Damit endet die laufende Bereitstellung. Eine bereits heruntergeladene Kopie wird dadurch nicht gelöscht, und das PDF-Passwort bietet weder ein Ablaufdatum noch einen Widerruf aus der Ferne. Wer Datei und Passwort hat, kann den Zugang behalten.

Die abgeschlossene Übergabe lässt sich konkret beschreiben: Das PDF verlangt ein Öffnungspasswort, die empfangene verschlüsselte Datei entspricht dem erwarteten SHA-256-Wert, und der vorgesehene Empfänger kann die vorgesehenen Seiten lesen. Beschränken Sie die Weitergabe von Einladung und Passwort auf diesen Empfänger.
