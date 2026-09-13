# Kann geschwärzter Text wiederhergestellt werden?

Unangenehm oft: ja — mit dem Textauswahl-Werkzeug, nicht mit einem Labor. Die meisten schwarzen Rechtecke werden *über* die Wörter gezeichnet und neben ihnen gespeichert, und die Wörter reisen darunter mit. Diese Seite ist der Katalog der Arten, auf die das passiert — und dessen, was Entfernen stattdessen heißen muss.

Zuletzt aktualisiert 26. August 2026

## Die kurze Antwort

Unangenehm oft: ja. Nicht mit Forensik — mit Markieren des geschwärzten Bereichs und Drücken von Kopieren. Die meisten Werkzeuge, zu denen Menschen greifen, wenn etwas verborgen werden soll, zeichnen ein Rechteck *über* den Inhalt und speichern es *neben* ihm, und alles darunter reist in der Datei mit, geduldig, bis jemand nachsieht.

Das ist kein seltener Fehler nachlässiger Leute. Er hat Namen aus Gerichtsakten veröffentlicht, ungeschwärzte Zahlen aus Regierungsberichten — und in einer Massenfreigabe von Fallakten im Dezember 2025 geschwärzte Namen, die binnen Stunden lesbar waren. Die Leute hinter diesen Fehlern hatten Anwälte und Verfahren. Was sie nicht hatten, ist die Unterscheidung, um die es auf dieser Seite geht: der Unterschied zwischen Verdecken und Entfernen.

## Das Rechteck, das ein Objekt ist

In einem PDF-Reader, einer Textverarbeitung, einem Foliensatz oder einem Ebenen-Bildeditor ist ein gezeichneter schwarzer Kasten keine Farbe. Er ist ein *Objekt* — eine Form mit Position, Größe und Füllung, in der Datei als eigenes Ding abgelegt, vor Text, der vollständig vorhanden bleibt. Das Dokument sagt nicht „dieses Wort ist weg“; es sagt „dieses Wort ist hier, und davor steht ein Rechteck“.

Alles Weitere folgt daraus. Bereich markieren, kopieren — und die Zwischenablage bekommt den Text, denn Kopieren liest die Textebene und ignoriert die Dekoration davor. In einem Editor lässt sich das Rechteck schlicht beiseiteschieben. Beim Export in ein anderes Format werden die Ebenen womöglich in anderer Reihenfolge plattgedrückt. Auf dem Bildschirm sieht der Kasten exakt aus wie eine echte Schwärzung, und genau deshalb überlebt der Fehler jede Durchsicht: Das Auge prüft die Seite, und die Seite sieht richtig aus.

PDF kennt noch eine leisere Variante. Ein PDF darf erklären, dass eine Folge von Glyphen etwas anderes „buchstabiert“ als das, was gezeichnet ist — ein Barrierefreiheits-Merkmal namens `/ActualText` — und Kopieren liest die Erklärung statt der Tinte. Ein Dokument kann also ein Wort verlieren, das nicht einmal sichtbar auf der Seite steht.

## Die Unschärfe, die Arithmetik ist

Verpixeln fühlt sich sicherer an, als es ist. Ein Mosaik ist ein Raster aus Mittelwerten, und ein Mittelwert ist eine *Messung* dessen, was darunter lag — klein und verlustbehaftet, aber eine Messung. Für Text in bekannter Schrift und vorhersagbarer Größe hat das gereicht, um ihn zurückzulesen: jede plausible Zeichenkette rendern, jede auf dieselbe Art verpixeln, und den Kandidaten behalten, dessen Mosaik passt. Nichts daran braucht ein Labor; es ist eine Schleife und ein Vergleich.

Weichzeichnen ist im Prinzip schlimmer. Eine Unschärfe ist eine Faltung — jedes Ausgabepixel ein gewichteter Mittelwert seiner Nachbarn —, und Faltungen lassen sich oft gut genug rückwärts rechnen; Entfaltung ist in der Fotografie Standardwerkzeug, kein exotischer Angriff. Beide Effekte teilen zudem ein Versagen, das mit Mathematik nichts zu tun hat: Sie zeigen an, dass etwas verborgen ist und ungefähr wie lang es ist — was bei einem Passwort aus sechs Zeichen bereits ein Hinweis ist.

Eine flache Füllung hat keine dieser Eigenschaften. Eine Farbe, von Kante zu Kante, trägt keine Messung von irgendetwas. Darum ist sie im [Bild-Schwärzer](https://abox.tools/de/bild-schwaerzen/) hier die Voreinstellung, darum sagen dessen Verpixeln- und Weichzeichnen-Optionen in ihrer eigenen Beschriftung, was sie nicht versprechen, und darum meldet der Stärkeregler eine Zahl statt eines Adjektivs.

## Die Kopien, die eine Datei von ihrer Vergangenheit behält

Die dritte Familie von Fehlern hat mit dem Verdecken gar nichts zu tun. Dateien erinnern sich, auf Arten, die kein Bildschirm zeigt:

- **Die Metadaten eines Fotos enthalten oft ein Vorschaubild** des Bildes vor der Bearbeitung. Schneiden Sie Ihre Adresse aus einem Foto, und der EXIF-Block hält womöglich noch eine Miniatur des unbeschnittenen Originals. Der [EXIF-Betrachter und -Entferner](https://abox.tools/de/exif-daten-entfernen/) zeigt diesen Block und nimmt ihn heraus; es gibt [einen Ratgeber dazu](https://abox.tools/de/ratgeber/exif-und-gps-daten-entfernen/).
- **Manche Editoren speichern an Ort und Stelle, ohne zu kürzen.** Ein berühmtes Fehlerpaar von 2023 — im Screenshot-Markup eines Telefons und im Snipping-Werkzeug eines Desktops — ließ nach dem Zuschneiden die Bytes des Originals in der Datei zurück, sodass sich der „weggeschnittene“ Teil aus den Resten rekonstruieren ließ.
- **PDFs können ihre eigene Geschichte tragen.** Ein mit inkrementellen Speicherungen bearbeitetes PDF hängt Änderungen ans Dateiende und lässt die frühere Fassung darin intakt — Löschungen eingeschlossen.

Der rote Faden: Was ein Betrachter anzeigt und was eine Datei enthält, sind zwei verschiedene Fragen, und eine Schwärzung, die nur durch Hinsehen geprüft wurde, hat nur die erste beantwortet.

## Was Entfernen wirklich braucht

Eine echte Schwärzung ändert die Daten, nicht die Ansicht, und sie lässt sich auf demselben Weg prüfen, auf dem sie scheitern kann: indem man die Datei fragt, nicht den Bildschirm.

Für ein Bild heißt das: Die Pixel unter dem Kasten hören auf zu existieren, bevor irgendeine Datei geschrieben wird. Genau das tut der [Bild-Schwärzer](https://abox.tools/de/bild-schwaerzen/) — die verdeckten Werte werden im Speicher überschrieben und erst dann dem Encoder übergeben, sodass die Ausgabe schwarze Pixel enthält, wo der Inhalt war, keine schwarze Tinte davor. Die Schritt-für-Schritt-Fassung steht im [Ratgeber zum Schwärzen von Bildern](https://abox.tools/de/ratgeber/bild-unkenntlich-machen/).

Für ein PDF heißt es: Die Glyphen werden aus den Anweisungen gelöscht, die die Seite zeichnen, mitsamt den verborgenen Trägern — `/ActualText`-Erklärungen, Lesezeichen, Kommentaren, Formularfeldern. Das tut der [PDF-Schwärzer](https://abox.tools/de/pdf-schwaerzen/), und dann tut er das Wichtigste: Er öffnet seine eigene Ausgabe wieder und durchsucht sie nach den entfernten Wörtern, und **hat etwas überlebt, gibt es keinen Download**. Der Rundgang steht im [Ratgeber zum Schwärzen von PDFs](https://abox.tools/de/ratgeber/pdf-schwaerzen/).

Und welches Werkzeug auch immer Sie nehmen, wo auch immer: Die Abnahmeprüfung gehört Ihnen. Über den geschwärzten Bereich markieren und kopieren; die Datei nach dem entfernten Wort durchsuchen; sie in einem anderen Betrachter öffnen. Wurde der Inhalt entfernt, findet ihn nichts — und ob ein Werkzeug das im Browser tut, ohne dass Ihre Datei die Maschine verlässt, ist ebenfalls eine Behauptung, die Sie prüfen statt glauben können: [der Ratgeber zum Hochladen](https://abox.tools/de/ratgeber/ist-das-hochladen-von-dateien-sicher/) zeigt wie. Schwärzen ist die eine Aufgabe, bei der die Datei per Definition heikel ist — also die letzte, die über den Server eines Fremden laufen sollte.
