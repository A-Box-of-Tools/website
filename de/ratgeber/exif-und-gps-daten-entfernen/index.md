# Was ein Foto über Sie verrät, und wie Sie es herausbekommen

Ein Bild direkt aus dem Handy trägt in aller Regel die Koordinaten des Aufnahmeorts, die Uhrzeit auf die Sekunde genau und genug über die Kamera, um es mit jedem anderen Foto desselben Geräts zu verknüpfen. Auf dem Bildschirm sehen Sie davon nichts. Hier steht, was da drinsteckt und wie Sie es wieder loswerden.

[EXIF-Betrachter & -Entferner öffnen](https://abox.tools/de/exif-daten-entfernen/): Sehen, was ein Foto über Sie verrät. Und es dann herausnehmen.

Zuletzt aktualisiert 26. August 2026

## Die kurze Antwort

Öffnen Sie den [EXIF-Betrachter & -Entferner](https://abox.tools/de/exif-daten-entfernen/), ziehen Sie die Fotos hinein und klicken Sie auf „Alle Metadaten entfernen“. Jedes Tag, der XMP- und der IPTC-Block, die Kommentare und das eingebettete Vorschaubild sind damit weg, bei allen Fotos auf der Liste in einem Rutsch. Das Bild selbst bleibt unangetastet: nicht neu komprimiert, nicht dekodiert, kein Pixel verändert.

Vorher lohnt sich allerdings ein Blick darauf, was da eigentlich stand. Es ist meist mehr, als man erwartet, und diese Liste ist das eigentliche Argument dafür, das hier überhaupt zu tun.

## Was wirklich in einem Foto steckt

Ein JPEG ist nicht bloß ein komprimiertes Bild, sondern ein Behälter. Neben dem Bild sitzen mehrere Blöcke voller Angaben, die Ihre Kamera, Ihr Handy oder Ihr Bildbearbeitungsprogramm dort hineingeschrieben haben.

- **EXIF.** Der wichtigste Block. Hersteller und Modell der Kamera, Objektiv, Belichtungseinstellungen, ISO, Datum und Uhrzeit auf die Sekunde, die Ausrichtung, in der das Bild gezeigt werden soll, und auf einem Handy, dessen Kamera die Ortungsdienste nutzen darf, eine GPS-Position auf wenige Meter genau. Häufig obendrein die Seriennummer des Kameragehäuses.
- **GPS.** Technisch gehört es zu EXIF, verdient aber eine eigene Zeile, weil es am schwersten wiegt. Notiert wird es in Grad, Minuten und Sekunden, also in einem Format, das hervorragend darin ist, nicht wie eine Adresse auszusehen.
- **XMP.** Ein Päckchen XML, das Bildbearbeitungsprogramme hinterlassen. Darin können Ihr Name stehen, Ihre Software, Bewertungen, Stichwörter, die Bearbeitungshistorie und eine Kopie einiger EXIF-Felder, weshalb es nicht genügt, allein EXIF zu löschen.
- **IPTC.** Ein älterer Block mit Feldern für Bildunterschrift, Urheberzeile, Quelle und Copyright, üblich in Presse und Bildagenturen.
- **Das eingebettete Vorschaubild.** Eine kleine zweite Kopie des Bildes. Sie entsteht beim Schreiben der Datei und wird beim Bearbeiten nicht immer neu erzeugt. So kann ein zugeschnittenes Foto mit einer Vorschau dessen unterwegs sein, was Sie weggeschnitten haben.
- **Die Maker Note.** Ein undokumentierter Block mit Herstellerdaten. Was da alles drinsteht, weiß außerhalb des Herstellers niemand vollständig.

![Der Inspektor: eine Miniatur eines Fotos neben einer Liste des Gefundenen, darunter Kamerahersteller und -modell, das Aufnahmedatum und GPS-Koordinaten.](https://abox.tools/screens/remove-exif-and-gps-data/inside.webp)

Was ein Foto vom Telefon tatsächlich mit sich trägt. Die wenigsten haben je nachgesehen, und deshalb gibt es diesen Ratgeber.

## Wer das tatsächlich zu sehen bekommt

Hier lohnt sich Genauigkeit, denn sowohl die alarmierte als auch die abwiegelnde Darstellung liegt daneben.

**Die großen sozialen Netzwerke entfernen Metadaten beim Posten.** Facebook, Instagram und X kodieren hochgeladene Bilder neu und werfen die Tags dabei weg. Freundlichkeit ist das nicht, denn auf ihrer Seite behalten sie die Daten. Immerhin reicht ein dort gepostetes Foto seine Koordinaten nicht an jeden Betrachter weiter.

**Fast alles andere behält sie.** Ein E-Mail-Anhang. Eine Datei, die in den meisten Chat-Apps als „Dokument“ statt als Foto verschickt wird. Ein Bild in einem Forum, in einer Kleinanzeige, auf einer privaten Seite, in einem geteilten Laufwerk, in einem Fehlerbericht, in einem Support-Ticket. Überall dort kommt die Datei unversehrt an, und wer sie herunterlädt, liest die Tags mit Bordmitteln seines Betriebssystems.

Die realistischen Risiken sind alltäglich statt dramatisch: die Kleinanzeige, in der eigenen Wohnung fotografiert, das Bild eines Kindes, aufgenommen vor seiner Schule, ein scheinbar anonymes Konto, dessen Fotos alle dieselbe Kamera-Seriennummer tragen, ein „letzte Woche aufgenommen“, das in Wahrheit aus dem März stammt.

## Warum nicht einfach neu abspeichern?

Ein Foto durch ein Bildbearbeitungsprogramm oder einen Kompressor neu zu speichern entfernt die Metadaten tatsächlich. Das Bild wird zu Pixeln dekodiert und erneut kodiert, und ein Canvas voller Pixel trägt keine Tags. Es funktioniert also, kostet Sie aber Qualität, weil diese Neukodierung verlustbehaftet ist.

Die Metadaten ordentlich zu entfernen kostet dagegen gar nichts. Die Tags sitzen im Behälter *um* das komprimierte Bild herum und nicht darin, und sie loszuwerden heißt, Einträge aus einer Liste zu streichen und die Liste wieder herauszuschreiben. Die komprimierten Bilddaten werden Byte für Byte übernommen, und das Ergebnis dekodiert zu exakt denselben Pixeln. Das ist der ganze Grund, ein Metadaten-Werkzeug zu nehmen und keinen Konverter.

Eine Ausnahme gibt es: Sie hätten ohnehin neu kodiert. Wenn Sie das Foto sowieso komprimieren oder skalieren, fallen die Tags nebenbei weg, und ein zweiter Arbeitsschritt erübrigt sich.

## Das eine Tag, das bleiben sollte: die Ausrichtung

Handys drehen das Bild nicht mit, wenn Sie das Gerät drehen. Sie nehmen auf, was der Sensor gesehen hat, und legen ein Orientation-Tag dazu, das angibt, wie es zur Anzeige gedreht gehört. Löschen Sie wirklich jedes Tag, zeigen manche Betrachter Ihr Foto quer.

Dafür gibt es im Werkzeug die Option „das Orientierungs-Tag behalten“, von vornherein gesetzt. Sie schreibt einen winzigen EXIF-Block zurück, in dem dieses eine Tag steht und sonst nichts, und auch das nur bei Fotos, die es tatsächlich gebraucht haben. GPS, Zeitstempel, Seriennummer und der Rest sind trotzdem fort.

Schalten Sie sie ab, wenn die Datei am Ende gar kein EXIF mehr tragen soll, und sehen Sie sich das Ergebnis dann an, bevor Sie es weitergeben. Ein quer liegendes Foto ist der übliche Ausgang.

![Die Entfernen-Karte: eine Schaltfläche, die alles entfernt, mit Schaltern für das Behalten der Ausrichtung und des Farbprofils.](https://abox.tools/screens/remove-exif-and-gps-data/strip.webp)

Alles heraus — außer den beiden Dingen, die man behalten sollte. Die Ausrichtung ist die, deren Verlust den halben Satz Fotos auf die Seite legt.

## Bearbeiten statt entfernen

Alles zu entfernen ist für die meisten die richtige Antwort, aber eben nicht für alle. Eine Fotografin möchte vielleicht die Copyright-Zeile und die Kameraeinstellungen behalten und nur den Ort loswerden. Ein Archivar muss womöglich ein Datum geraderücken, das falsch war, weil die Kamerauhr falsch ging.

Beides ist möglich. Der Ort lässt sich einzeln löschen, und Text-Tags, Datumsangaben, ISO, Ausrichtung und Auflösung lassen sich an Ort und Stelle bearbeiten.

Einen Vorbehalt gibt es, und er gilt für jedes Werkzeug dieser Art und nicht nur für dieses. Beim Schreiben wird der EXIF-Block neu aufgebaut, und eine Maker Note enthält Offsets in den *ursprünglichen* Block. Eine neu aufgebaute Maker Note kann für die Software des Herstellers deshalb unlesbar werden. Falls Ihnen daran liegt, löschen Sie die Maker Note ganz, oder lassen Sie die Datei unbearbeitet.

## Formate, und die, bei denen es so nicht geht

JPEG, PNG und WebP lassen sich alle sauber neu schreiben, und das sind die drei, die das Werkzeug hier bearbeitet.

HEIC, das ein iPhone von Haus aus speichert, und AVIF sind Box-Formate aus verschachtelten Atomen und brauchen einen völlig anderen Parser. Das Werkzeug erkennt sie und sagt es Ihnen, statt eine kaputte Datei auszuspucken. Haben Sie ein HEIC, entfernt schon die Umwandlung nach JPEG die Metadaten nebenbei.

Ein reines TIFF wird ebenfalls nicht angefasst, und dafür gibt es einen interessanteren Grund: In einem TIFF werden Metadaten und Bilddaten über dieselben Offsets adressiert. Tags zu entfernen hieße also, die Adressierung des Bildes selbst neu zu schreiben. Machbar ist das, aber es ist eine andere Aufgabe.

## Eine Gewohnheit, die sich lohnt

Nachsehen, bevor Sie posten, und nicht danach. Die Tags zu lesen dauert ein paar Sekunden, und die Fundliste nennt zuerst das Wissenswerte, also Position, Zeitstempel und Seriennummern, und erst danach die vollständige Tabelle mit jedem einzelnen Tag. Sie müssen also gar nicht wissen, wonach Sie suchen.

Dass die Position zuerst in Dezimalgrad erscheint, hat einen Grund. Bei „52 Grad, 31 Minuten, 12 Sekunden“ fällt niemandem auf, dass ein Foto damit das Gebäude benennt, in dem es entstanden ist. Bei einem Zahlenpaar, das Sie in eine Karte einfügen können, schon.

## Laden Sie das Foto nicht hoch, um zu erfahren, was darin steht

In der üblichen Art, dieses Problem zu lösen, steckt eine besondere Ironie. Wer sich sorgt, was sein Foto preisgibt, lädt es auf eine Website hoch, um es herauszufinden. Und die hat nun das Foto, die Koordinaten, den Zeitstempel und die Seriennummer, nebst einer Kopie des Bildes auf einer Festplatte, die ihr gehört.

Nötig ist das nicht. Den Behälter um ein JPEG zu lesen und neu zu schreiben sind ein paar hundert Zeilen Parserei, mit denen ein Browser hervorragend zurechtkommt. Deshalb hat das Werkzeug hier überhaupt keine Netzfunktion. Kein `fetch`, kein `XMLHttpRequest`, nichts, das eine Datei senden könnte, selbst wenn etwas es versuchte. Einmal laden, Verbindung trennen, weiterarbeiten.

Wie Sie diese Behauptung hier wie überall sonst nachprüfen, steht in [Ist es sicher, Dateien zu Online-Konvertern hochzuladen?](https://abox.tools/de/ratgeber/ist-das-hochladen-von-dateien-sicher/) Und dies ist der Dateityp, bei dem sich das Nachprüfen am meisten lohnt.
