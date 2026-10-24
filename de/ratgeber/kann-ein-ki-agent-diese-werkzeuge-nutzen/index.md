# Kann ein KI-Agent diese Werkzeuge nutzen?

Agenten können die Browseroberfläche bedienen. Für die Datenwege zählen Browserort, eigene Übertragungen des Agenten und die Netzwerkfunktionen des Werkzeugs.

Zuletzt aktualisiert 23. Oktober 2026

## Die kurze Antwort

Ein Agent mit Browsersteuerung kann diese normalen Seiten bedienen: beschriftete Controls, Dateiauswahl und Downloads, ohne Seitenkonto. Seine Umgebung muss Dateizugriff, Browser-APIs und Berechtigungen unterstützen. Kamerafreigabe oder Teilen-Dialog können Ihre Beteiligung benötigen.

Bei Dateiverarbeitung ist die erste Frage, **wo der gesteuerte Browser läuft**. Prüfen Sie auch die Daten beim Agent-Anbieter und bewusste Abruf- oder Teilen-Funktionen. Ein lokaler Browser beantwortet nicht alle drei Fragen.

## Geben Sie dem Agenten eine Aufgabe, deren Ergebnis er prüfen kann

**Anhänge für eine Bewerbung vorbereiten.** Geben Sie für jede Datei die erforderlichen Maße, das zulässige Format und die Höchstgröße in Bytes an. Bitten Sie den Agenten, die Originale zu behalten und getrennte fertige Kopien zurückzugeben. Ein brauchbarer Auftrag lautet: „Machen Sie aus diesen drei Fotos JPEGs mit jeweils weniger als 200 KB; zeigen Sie mir vor dem Einreichen die Maße, tatsächlichen Größen und lesbaren Vorschauen.“ Ein erfolgreicher Download allein beweist nicht, dass das Formular die Datei annimmt.

**Eine Spesenmappe vorbereiten.** Ein Agent kann den [Belegablauf](https://abox.tools/de/ratgeber/belege-rechnungen-aus-fotos-auslesen/) bedienen. Händler, Datum, Währung, Gesamtbetrag und Zuschnitt müssen dennoch mit jedem Bild verglichen werden. Lassen Sie Bericht und Anhänge zur Prüfung vorbereiten. Einen Empfänger auszuwählen oder die Unterlagen zu senden ist eine eigene Handlung.

Dasselbe Vorgehen eignet sich für eine monatlich wiederkehrende Aufgabe. Verwenden Sie das gewünschte Ergebnis und die Prüfungen im Auftrag erneut mit den neuen Dateien. Prüfen Sie bei jeder Änderung der Umgebung, wo der Browser des Agenten läuft und wie er Daten verarbeitet.

## Zwei Sorten Agent, eine Unterscheidung

Agenten, die Werkzeuge benutzen, kommen in zwei Gestalten, und der Unterschied zwischen ihnen wiegt schwerer als alles andere auf dieser Seite.

**Ein lokal gesteuerter Browser** liest und verarbeitet auf diesem Gerät. Ein lokales Werkzeug hier fügt keinen Verarbeitungsupload hinzu. Der Agent könnte trotzdem Anweisungen, Bildschirmfotos oder Dateikontext an seinen Anbieter senden; das hängt von Umsetzung und Einstellungen des Agenten ab.

**Ein Cloud-Browser** läuft beim Agent-Anbieter. Eine dafür angehängte Datei hat Ihr Gerät bereits verlassen. Die Werkzeuge verarbeiten sie in jenem Browser und machen die vorherige Übertragung nicht rückgängig. Bewusstes Teilen und App-Übergaben sind in beiden Umgebungen weitere Aktionen.

Geben Sie einen lokalen Browser vor, wenn lokale Verarbeitung wichtig ist, prüfen Sie die Agent-Datenwege und erlauben Sie bewusste Übertragungen gesondert. [Kursabruf und E-Mail-Übergabe](https://abox.tools/de/belege-rechnungen-auslesen/), [Bild-URL-Import](https://abox.tools/de/bilder-in-video-umwandeln/), [Teilen](https://abox.tools/de/text-teilen/) und [Kamera](https://abox.tools/de/remote-camera/) dokumentieren ihre Netzwerkgrenzen.

## Wie man einem Agenten eine Arbeit übergibt

Agenten arbeiten am besten mit demselben Auftrag, den ein Kollege haben wollte: das Werkzeug, die Datei, und woran man fertig erkennt. Ein paar Muster, die funktionieren:

- **Nennen Sie das Ergebnis, nicht nur das Werkzeug.** „Öffne abox.tools/bild-komprimieren/ und bring dieses Foto unter 200 KB“ gibt dem Agenten die Zahl, nach der die Seite fragen wird. Der [Bildkompressor](https://abox.tools/de/bild-komprimieren/) nimmt eine Zielgröße beim Namen — genau die Art Anweisung, die ein Agent getreu ausführen kann.
- **Zeigen Sie ihm die Karte.** Diese Website veröffentlicht [llms.txt](https://abox.tools/llms.txt), eine Datei, die jedes Werkzeug beschreibt und auf ein separates Ratgeberverzeichnis verweist. Beide Verzeichnisse liegen als Klartext vor, sodass ein Agent ein Werkzeug oder einen Ratgeber auswählen kann, ohne die Website systematisch durchsuchen zu müssen. Und jede Werkzeug- und Ratgeberseite hat einen Zwilling unter ihrer eigenen Adresse mit `index.md` am Ende: die Seite als Markdown, ohne die Oberfläche drumherum, für einen Agenten, der wissen will, was eine Werkzeugseite sagt, und nicht, wie sie aussieht.
- **Lassen Sie ihn die Seite lesen, auf der er steht.** Jedes Werkzeug trägt seine Fragen und Antworten in der Seite selbst, und zu jedem Werkzeug liegt ein Ratgeber einen Link entfernt. Einem Agenten, der sich bei einer Einstellung unsicher wirkt, kann man sagen, er möge zuerst den Ratgeber lesen — derselbe Rat, den ein Mensch bekäme.
- **Prüfungen zwischen den Schritten nennen.** Bei Scan-zu-PDF und Bildbereinigung lassen Sie Reihenfolge, Zuschnitt, Lesbarkeit und Größe kontrollieren. OCR, Schwärzung und die Auswahl teilbarer Inhalte brauchen Urteil und Ergebnisprüfung.

## Was man nicht delegiert

Controls zu bedienen ist nur ein Teil. Prüfen Sie Entscheidungen, die ändern, was andere sehen oder bekommen. Zwei Beispiele:

**Entscheiden, was nicht gesehen werden darf.** Die Schwärzungswerkzeuge löschen, was Sie abdecken — aber zu wählen, was abzudecken ist, ist die Arbeit, und ein Agent, der eine Zeile übersieht, hat eine Datei erzeugt, die fertig aussieht und es nicht ist. Lassen Sie einen Agenten ruhig das Schwärzungswerkzeug bedienen; sehen Sie sich das Ergebnis selbst an, bevor es irgendwohin geht — dieselbe Regel, die die Ratgeber dieser Werkzeuge einem menschlichen Bediener geben.

**Gelesene Inhalte öffnen.** Der QR-Leser dieser Website folgt einer dekodierten Adresse niemals automatisch, denn Lesen und Aufrufen sind verschiedene Handlungen. Auch einem Agenten sollten Sie diese Trennung vorgeben. Liest er einen Code, einen Link oder eine Adresse in einer Datei, sollte er sie melden statt besuchen. Ein Agent, der Ihren Browser steuert, hat zudem Zugang zu dessen angemeldeten Konten. Das verdient dieselbe Prüfung wie jedes Werkzeug, um die es im nächsten Abschnitt geht.

## Auch ein Agent kann das Versprechen prüfen

Die vier Proben, die der Ratgeber über das [Hochladen](https://abox.tools/de/ratgeber/ist-das-hochladen-von-dateien-sicher/) lehrt — Stecker ziehen, Netzwerk-Tab beobachten, Content-Security-Policy lesen, Code lesen —, kann ein Agent allesamt ausführen, und ihm fallen sie sogar leichter als einem Menschen: einen CSP-Header zu lesen oder ausgelieferten Quelltext nach `fetch`-Aufrufen zu durchsuchen ist mechanische Arbeit. Wenn Sie Werkzeuge von einem Agenten prüfen lassen, bevor Sie ihnen trauen, erwartet diese Website, genauso geprüft zu werden — und das Offline-Verhalten, auf dem die Proben fußen, hat [eine eigene Seite](https://abox.tools/de/ratgeber/wie-kann-eine-webseite-offline-funktionieren/).

Die Controls sind beschriftet; [llms.txt](https://abox.tools/llms.txt) und Markdown-Kopien dienen dem Lesen. Quelltext, gemeinsame Module und Engines sind öffentlich. Der Build erzeugt und minifiziert die Seiten; vergleichen Sie ihn bei einer Prüfung mit der Veröffentlichung. DevTools und WebRTC-Diagnose hängen von der Agent-Umgebung ab.

Dieser Ratgeber garantiert nicht den Datenschutz eines Agent-Anbieters. Auch bei lokalem Browser kann der Agent Anweisungen, Bildschirmfotos und manchmal Dateien senden. Berücksichtigen Sie diesen Weg und dokumentierte Netzwerkfunktionen; der Browserort beweist sie nicht.
