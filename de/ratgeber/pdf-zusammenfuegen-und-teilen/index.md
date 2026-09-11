# PDF-Seiten zusammenfügen, teilen und umsortieren

Zwei Dokumente aneinanderzuhängen ist das Gewöhnlichste, was man mit einem PDF tut — und das, was am häufigsten dadurch geschieht, dass man beide Dateien dem Server eines Fremden übergibt. Nötig ist das nicht. Hier steht, wie es geht und was still verlorengeht, wenn ein Werkzeug Seiten umsortiert.

[PDF-Zusammenfügen & Teilen öffnen](https://abox.tools/de/pdf-zusammenfuegen/): Seiten umsortieren, ohne den Umweg über einen Server.

Zuletzt aktualisiert 26. August 2026

## Die kurze Antwort

Das [PDF-Zusammenfügen & Teilen](https://abox.tools/de/pdf-zusammenfuegen/) öffnen, jede Datei hineinziehen, die Sie verwenden wollen, und die Seiten in die gewünschte Reihenfolge ziehen. Dann sagen Sie, ob ein Dokument oder mehrere herauskommen sollen, und drücken den Knopf. Nichts wird hochgeladen: Die Dateien werden von Ihrem eigenen Browser geöffnet, zerlegt und wieder herausgeschrieben.

Die drei Aufgaben, nach denen getrennt gesucht wird — zusammenfügen, teilen, umsortieren —, sind ein einziger Bildschirm, weil es eine einzige Operation mit einer anderen Antwort am Ende ist: Seiten auswählen, in eine Reihenfolge bringen und entscheiden, als wie viele Dateien sie herauskommen.

## Zwei oder mehr Dokumente zusammenfügen

Wählen Sie die erste Datei, dann die zweite; die Seiten jeder Datei kommen ans Ende der laufenden Reihenfolge, Sie können also weiter Dateien aus verschiedenen Ordnern hinzufügen, ohne von vorn anzufangen. Ist etwas in der falschen Reihenfolge, ziehen Sie eine Seite an ihrem Griff oder nutzen die Pfeile auf der Kachel.

Beim Zusammenfügen wird nichts neu kodiert. Der Inhalt jeder Seite und jede Schrift, jedes Bild und jede Vektorzeichnung, auf die sie sich bezieht, werden exakt übernommen, also bleibt Text markierbar und durchsuchbar, und ein Scan ist derselbe Scan. Die zusammengefügte Datei ist meist etwas kleiner als die beiden Eingaben zusammen, was keine Kompression ist — es ist die Struktur um die Seiten herum, die einmal statt zweimal geschrieben wird.

Seiten behalten ihre eigene Größe. Fügen Sie einen A4-Bericht mit einem Anhang in US Letter zusammen, bekommen Sie ein Dokument mit beidem darin — genau das, was in den Dateien steht. Fremde Seiten auf ein Papierformat zu skalieren ist eine andere Operation und keine, die ein Zusammenfüger still erledigen sollte.

## Ein Dokument in mehrere teilen

Es gibt vier Arten zu schneiden, und welche Sie wollen, hängt davon ab, warum Sie schneiden:

- **Alle so und so viele Seiten.** Für einen langen Scan von etwas, das ursprünglich ein Stapel getrennter Dokumente war — zwölf Gehaltsabrechnungen zu je zwei Seiten.
- **An Seitenzahlen, die Sie nennen.** Für einen Bericht mit Kapiteln, die auf sichtbaren Seiten beginnen. Jede Zahl, die Sie eintippen, beginnt eine neue Datei.
- **Eine Datei pro Seite.** Um ein einzelnes Unterschriftenblatt oder eine Bescheinigung aus einem Stapel zu ziehen.
- **Zurück in die Dateien, aus denen sie kamen.** Wird nur angeboten, wenn Sie mehr als eine Datei zusammengefügt haben, und ist nützlich nach dem Bearbeiten: die leeren Seiten aus drei Scans auf einmal entfernen und drei Dateien zurückbekommen.

Wenn Sie nur ein paar Seiten aus einem langen Dokument wollen, müssen Sie es gar nicht teilen. Tippen Sie die gewünschten Seiten in das Bereichsfeld — `1-3, 8, 12-` —, drücken Sie „Nur diese behalten“ und bauen Sie ein Dokument.

Mehr als eine Ausgabedatei wird als eine einzige ZIP-Datei übergeben. Fünfzig Downloads sind fünfzig Speicherabfragen, und ungefähr da gibt jeder auf.

![Die Ausgabekarte: Optionen für ein Dokument oder mehrere, Teilen nach Größe, an einer Seitenzahl oder zurück in die Dateien, aus denen es entstand.](https://abox.tools/screens/merge-and-split-pdf-files/output.webp)

Teilen ist dieselbe Handlung wie Zusammenführen, andersherum ausgeführt, und deshalb eine Einstellung hier statt eines eigenen Werkzeugs.

## Umsortieren, drehen und Seiten entfernen

Ziehen Sie eine Kachel an ihrem Griff, um sie zu verschieben. Die Pfeile auf jeder Kachel schieben sie um einen Platz oder drehen sie um eine Vierteldrehung — das ist der Ausweg für die Seite, die quer aus dem Scanner kam. Das × entfernt sie.

Sobald mehr als ein, zwei Seiten betroffen sind, nehmen Sie stattdessen das Bereichsfeld. Es versteht, was Sie auf Papier schreiben würden: `1-3, 8, 12-`, und ebenso `ungerade`, `gerade`, `alle` und `letzte`. Die behalten, die entfernen oder die drehen. Ein häufiger Fall: Bei einem beidseitigen Scan, bei dem jede zweite Seite auf dem Kopf steht, sind das `gerade` und zwei Drehungen.

Die Nummern auf den Kacheln werden beim Arbeiten neu vergeben, sie bedeuten also immer „Position im fertigen Dokument“ und nicht „Seite in der Datei, aus der sie stammt“. Geschrieben wird nichts, bis Sie den Knopf drücken, es gibt also nichts rückgängig zu machen — und „zurück in den Zustand beim Laden“ stellt die ursprüngliche Reihenfolge von allem wieder her.

![Das Seitenraster: jede Seite zweier Dokumente als Miniatur, in der Reihenfolge des Ergebnisses, mit Bedienelementen zum Drehen, Umkehren und Entfernen.](https://abox.tools/screens/merge-and-split-pdf-files/pages.webp)

Beide Dokumente, Seite für Seite. Umsortieren heißt ziehen; das Bereichsfeld darüber ist für die Dokumente, bei denen Ziehen einen ganzen Nachmittag dauern würde.

## Was eine Umsortierung übersteht und was nicht

Das ist der Teil, den kein Werkzeug erzählt, und der Grund, warum sich ein zusammengefügtes Dokument manchmal auf feine Weise kaputt anfühlt.

Ein PDF ist kein Stapel Seiten. Es ist ein Graph, und ein guter Teil davon betrifft das Dokument und nicht irgendeine Seite: die Lesezeichenleiste, die Verweise, das Formular, die Lesereihenfolge, der ein Screenreader folgt, die Nummerierung, die die ersten vier Seiten „i, ii, iii, iv“ nennt. Verschieben Sie die Seiten, und jedes davon muss neu gebaut oder fallen gelassen werden.

- **Lesezeichen werden neu gebaut.** Ein Eintrag, dessen Seite noch da ist, zeigt dorthin, wohin sie gewandert ist. Ein Eintrag, dessen Seite Sie entfernt haben, verschwindet — es sei denn, darunter liegen überlebende Einträge, dann bleibt er als Überschrift stehen, denn ein Kapiteltitel ist immer noch dort, wo das Kapitel ist. Beim Zusammenfügen mehrerer Dateien werden die Lesezeichen jeder Datei unter eine Überschrift mit dem Dateinamen einsortiert — das ist es, was einen zusammengefügten Bericht überhaupt erst navigierbar macht.
- **Verweisen wird nachgegangen.** Ein Verweis von Seite 2 auf Seite 40 weiß, wohin Seite 40 gegangen ist, samt der benannten Ziele, die Word und LaTeX für jede Überschrift schreiben. Ein Verweis, dessen Ziel nicht mitgekommen ist, bleibt ohne Inhalt zurück, statt auf die Seite zu zeigen, die jetzt zufällig an dieser Stelle liegt.
- **Ausgefüllte Formulare überleben**, und das neue Dokument wird als Formular angemeldet, damit Leseprogramme es auch als eines behandeln. Eine Eigenheit, die man kennen sollte: Zwei Felder mit demselben Namen sind für jedes Leseprogramm *ein* Feld, das Zusammenfügen zweier Kopien desselben Formulars verknüpft sie also — was Sie in das eine tippen, füllt das andere.
- **Die getaggte Lesereihenfolge überlebt nicht.** Sie beschreibt eine Abfolge, die es nicht mehr gibt, und eine falsche ist für einen Screenreader schlimmer als gar keine. Wenn die Barrierefreiheits-Auszeichnung eines Dokuments zählt, behalten Sie das Original daneben.
- **Seitenbezeichnungen überleben nicht.** Die Nummerierung „iii, iv, 1, 2“ ist eine Aussage über eine Reihenfolge, die Sie gerade geändert haben.
- **Anhänge und Dokumentskripte überleben nicht.** An das Dokument angehängte Dateien gehören ihm, nicht einer Seite. Aktionen, die JavaScript ausführen, ein Formular irgendwohin schicken oder ein Programm starten, werden nicht in Ihre neue Datei übernommen, und das ist die richtige Voreinstellung für Seiten, die von jemand anderem stammen.

Eine digitale Signatur ist ein Sonderfall und keine Einschränkung irgendeines Werkzeugs: Eine Signatur bescheinigt ein Dokument so, wie es stand. Verschieben Sie eine Seite, ist sie gebrochen — denn genau das soll sie Ihnen sagen.

## Passwortgeschützte Dateien

Ein verschlüsseltes PDF wird abgelehnt, auch die Sorte mit leerem Passwort, die viele Bürokopierer erzeugen. Den Schutz eines Dokuments zu entfernen ist eine andere Aufgabe als seine Seiten zu verschieben, und ein Werkzeug, das das still täte, täte etwas, das Sie nicht verlangt haben. Öffnen Sie die Datei mit dem Passwort in einem Leseprogramm und speichern Sie zuerst eine ungeschützte Kopie.

## Das Ergebnis prüfen

Öffnen Sie es und prüfen Sie drei Dinge: die Seitenzahl, die Reihenfolge und — falls das Dokument sie hatte — die Lesezeichenleiste und ein, zwei Verweise.

Das Erste davon erledigt das Werkzeug hier für Sie, bevor es die Datei anbietet. Jedes fertige Dokument wird von demselben Code noch einmal geöffnet, der Ihre Originale gelesen hat, und seine Seiten werden gezählt, indem der Seitenbaum abgelaufen wird — nicht, indem der in der Datei eingetragenen Zahl geglaubt wird. Weicht das von dem ab, was Sie verlangt haben, wird gar kein Download angeboten.

## Warum das keinen Server braucht

Zusammenfügen klingt nach Serverarbeit, und die längste Zeit des Webs war es das auch. Tatsächlich besteht es darin, die Dateistruktur zu lesen, die Objekte, von denen eine Seite abhängt, in eine neue Datei zu kopieren und eine frische Querverweistabelle zu schreiben. Kein Pixel wird dekodiert, und gerendert wird nichts. Ein Browser kann das alles seit Jahren.

Und das zählt hier mehr als fast überall sonst, wegen dem, *was* die Leute zusammenfügen. Zusammengefügt wird, was von irgendwo kam: ein Vertrag und seine Unterschriftenseite, ein Passscan und ein Kontoauszug, ein Arztbrief und ein Antragsformular. Ein Online-Zusammenfüger bekommt sie alle auf einmal, bereits sortiert, von einer Person. Es ist der aufschlussreichste Upload, den die meisten Menschen je machen.

Das Werkzeug hier hat überhaupt keine Netzfunktion, und die `Content-Security-Policy` der Seite nennt jede Adresse, die sie kontaktieren darf — keine davon gehört zu dieser Site. Laden Sie sie, ziehen Sie den Stecker, und fügen Sie trotzdem etwas zusammen.

[Ist es sicher, Dateien zu Online-Konvertern hochzuladen?](https://abox.tools/de/ratgeber/ist-das-hochladen-von-dateien-sicher/) nennt drei weitere Prüfungen dieser Art.
