# Über abox.tools

Eine Person in Ontario, die genau die Werkzeuge baut, die sie ständig brauchte und denen sie nicht traute. Alles hier läuft auf Ihrem eigenen Gerät, der Quelltext ist öffentlich, und auf dieser Seite stehen die Gründe für beides.

Zuletzt aktualisiert 12. Oktober 2026

## Was das hier ist

abox.tools ist eine Sammlung kleiner Werkzeuge, die jeweils eine Sache erledigen. Ein Foto verkleinern, ein Video kürzen, zwei PDFs zusammenfügen, nachsehen, was in einem QR-Code wirklich steht. Es sind derzeit 56, dazu kommt eine [Sammlung von Ratgebern](https://abox.tools/de/ratgeber/) zu den Aufgaben, für die sie gedacht sind.

Jedes Werkzeug verarbeitet Dateien im Browser, auf der Hardware des Geräts, auf dem er läuft. Meist werden native Browser-Codecs genutzt; einige Werkzeuge enthalten lokale JavaScript- oder WebAssembly-Engines, etwa für HEIC und Beleg-OCR. Dateien werden nicht zur Verarbeitung hochgeladen. Die Seite liefert statische Seiten und Code; bewusstes Teilen und optionale Onlinefunktionen haben eigene, unten erklärte Grenzen.

Das ist das Produkt. Alles Weitere auf dieser Seite erklärt, warum sich diese Bauweise lohnt und wer dahintersteht.

## Wer das macht

Eine Person, allein, in Ontario in Kanada. Das hier ist keine Firma. Es gibt kein Team, keinen Investor, keinen Mutterkonzern und keinen Plan, von einem übernommen zu werden. Post geht an [hi@abox.tools](mailto:hi@abox.tools) und landet bei der Person, die den Quelltext geschrieben hat. Auf der [Kontaktseite](https://abox.tools/de/kontakt/) steht, wofür sich das eignet und wofür nicht.

Die Seite erscheint bewusst ohne persönliche Namenszeile. Es ist ein kleines Projekt und keine persönliche Marke, und vertrauenswürdig sein soll hier nicht ein Name unter einer Seite, sondern [der Quelltext](https://github.com/A-Box-of-Tools/website), den jeder lesen kann, und das Verhalten der Seiten selbst, das sich mit geöffneten Entwicklerwerkzeugen in etwa dreißig Sekunden überprüfen lässt. Diese beiden Dinge sind nachprüfbar. Eine Namenszeile ist es nicht.

## Warum es so gebaut ist

Viele Online-Converter laden die Datei hoch, verarbeiten sie auf einem Server und geben das Ergebnis zurück. Andere arbeiten lokal. Entscheidend ist, wo die Arbeit stattfindet und ob die Datei dafür den Browser verlassen muss.

Serververarbeitung übergibt dem Anbieter eine Kopie Ihrer Datei. Bei Passscan, medizinischer Aufnahme, unterschriebenem Vertrag oder Foto mit Standortdaten lohnt sich eine Prüfung. Veröffentlichte Richtlinien, Sicherheitsunterlagen, Audits und beobachtbares Verhalten können Belege liefern. Die Webseite allein zeigt nicht jede interne Kopie, Sicherung oder jeden Zugriff nach dem Upload. Eine Datenschutzrichtlinie beschreibt den Umgang des Anbieters; sie ist nicht dieselbe Einschränkung wie eine lokale Operation ohne Verbindung.

Browser sind inzwischen gut genug, dass es dieses Versprechen nicht mehr braucht. Sie können JPEG, PNG und WebP lesen und schreiben, Videos entpacken und decodieren, eine Datei hashen, einen QR-Code lesen und ein PDF erzeugen. Wenn die Arbeit auf Ihrem eigenen Gerät stattfinden kann, dann ist „behalten die meine Datei?“ keine Frage nach den Absichten irgendeines Anbieters mehr, sondern eine Frage danach, wozu der Quelltext technisch überhaupt in der Lage ist. Und die können Sie selbst beantworten.

Das ist das ganze Argument, und ein Ratgeber führt es in Ruhe aus: [Ist es sicher, Dateien auf eine Website hochzuladen?](https://abox.tools/de/ratgeber/ist-das-hochladen-von-dateien-sicher/)

## Prüfen statt glauben

Vier Prüfungen liefern unterschiedliche Belege. Nutzen Sie sie zusammen und prüfen Sie die Funktion, die Sie tatsächlich verwenden wollen:

- **Für lokale Verarbeitung die Verbindung trennen.** Warten Sie, bis alles geladen ist und die Offline-Anzeige bereit meldet. Verarbeiten Sie dann eine Datei vom Gerät. Ein fertiges Ergebnis belegt die lokale Ausführung ohne Verbindung, aber nicht das Verhalten nach erneutem Verbinden.
- **Netzwerkanfragen prüfen.** Sehen Sie sich URLs, Anfrageinhalte und WebSocket-Nachrichten an, nicht nur Übertragungsgrößen. Lokale Verarbeitung sendet keine Dateien. Seitenressourcen, Plattformskripte, optionale Abfragen und bewusstes Teilen sind andere, auf den Seiten erklärte Vorgänge.
- **Content-Security-Policy lesen.** Sie begrenzt Ressourcen und Verbindungsziele. Sie prüft keine Nutzdaten, verhindert keine Übertragung an erlaubte Hosts und beschreibt keinen WebRTC-Peer-Verkehr. Vergleichen Sie sie mit Quelltext und beobachtetem Verhalten.
- **Quelltext und Build lesen.** Das [Repository](https://github.com/A-Box-of-Tools/website) enthält Vorlagen, Module, gemeinsame Teile und mitgelieferte Engines. Der Build erzeugt Seiten und minifiziert eigenen Code. Jedes Werkzeug nennt die zuerst lesenswerten Dateien; Sie können selbst bauen und mit der Veröffentlichung vergleichen.

Die Netzwerkfunktionen haben einen ausdrücklichen Zweck. [Bilder zu Video](https://abox.tools/de/bilder-in-video-umwandeln/) kann eine Bild-URL abrufen. Der [Beleg- und Rechnungsextraktor](https://abox.tools/de/belege-rechnungen-auslesen/) kann Währungspaar und Datum bei Frankfurter abfragen und einen Bericht an Ihre gewählte E-Mail- oder Teilen-App übergeben. [Text und Dateien teilen](https://abox.tools/de/text-teilen/) und [Remote-Kamera](https://abox.tools/de/remote-camera/) übertragen Inhalte zwischen Browsern. Die Vermittlungsstelle trägt Such- und Verbindungsmetadaten, niemals geteilte Dateien oder Kameravideo. Diese Funktionen benötigen eine Verbindung; die Werkzeugseiten und die [Datenschutzseite](https://abox.tools/de/datenschutz/) erklären, was jeder Beteiligte sieht.

## Wie die Werkzeuge gebaut und geprüft werden

Ein Werkzeug erscheint, wenn es mit echten Dateien zurechtkommt, und nicht schon dann, wenn es mit der Datei zurechtkommt, gegen die es geschrieben wurde. Praktisch heißt das, dass jedes von Hand im Browser an sperrigen Fällen durchgespielt wird. Am Video ohne Keyframe an der Stelle, an der man schneiden möchte. An der HEIC-Datei eines Telefons, das den Container leicht falsch schreibt. Am PDF mit einer eingebetteten Teilschrift. Genau das haben Menschen nämlich auf ihren Geräten, und genau das findet ein Test nicht, den dieselbe Person geschrieben hat wie den Fehler.

Eine automatische Suite prüft Generator und Browsermodule in CI; ein Fehler stoppt die Veröffentlichung. Gemeinsame Parser und Writer, etwa der MP4-Reader, liegen in gemeinsamen Modulen und werden beim Build in jedes Werkzeug kopiert. Eine Duplikatprüfung verhindert auseinanderlaufende separate Kopien.

Die Ratgeber entstehen nach derselben Regel. Ihre Bildschirmfotos werden von einem Skript aus der gebauten Seite aufgenommen und nicht gezeichnet oder nachgestellt. Ein Bild in einem Ratgeber zeigt also die Seite so, wie sie heute tatsächlich aussieht.

## Wie sich das trägt

Durch Werbung und durch Spenden von Menschen, denen die Werkzeuge nützen. Das ist das gesamte Geschäftsmodell, und es lohnt sich, genau zu sagen, was dazugehört und was nicht.

**Es gibt nichts zu kaufen.** Kein Konto, keine Bezahlstufe, kein freizukaufendes Wasserzeichen und keine Funktion gegen Aufpreis. Unterstützte Formate, Browserspeicher und bewusste Grenzen bleiben wichtig; jedes Werkzeug erklärt sie.

**Ihre Dateien sind nicht Teil des Geschäfts.** Werbung und Besuchszählung nutzen Google-Dienste. Freiwilliges Feedback sendet Werkzeugnamen, eine feste Ja- oder Nein-Antwort und einen festen Grund, aber keine Datei, keinen Namen, keine Größe und keinen Inhalt. Der Quelltext übergibt diesen Diensten keine Dateidaten. Erlaubte Endpunkte bleiben dennoch Netzwerkziele; die Sicherheitsrichtlinie allein garantiert keine Nutzdaten. Die [Datenschutzseite](https://abox.tools/de/datenschutz/) erklärt Erhebung und Blockieren. Lokale Verarbeitung funktioniert mit blockierten Skripten.

**Die Werkzeuge werden nicht für die Werbung geschrieben.** Kein Werkzeug hier existiert, weil ein Suchbegriff Geld wert war, und keines wurde langsamer, umständlicher oder seitenreicher gemacht, um mehr Anzeigen auszuliefern. Worüber als Nächstes gearbeitet wird, wird offen diskutiert, in [ROADMAP.md](https://github.com/A-Box-of-Tools/website/blob/main/ROADMAP.md), ein Absatz je Idee, einschließlich der Gründe, aus denen mehrere naheliegende Vorschläge abgelehnt wurden.

## Sprachen

Englisch, vereinfachtes Chinesisch, Deutsch, Spanisch, brasilianisches Portugiesisch, Französisch und Japanisch werden hier gepflegt. Acht ältere Übersetzungen bleiben als archivierte Seiten lesbar und erhalten keine aktuellen Änderungen. Gepflegte Seiten erscheinen erst nach vollständiger Übersetzung in Sitemap und Sprachauswahl; unfertige bleiben lesbar, ohne als fertige Übersetzung angeboten zu werden.

Beantwortet wird Post auf Englisch. Bei einem Projekt dieser Größe ist das die einzige ehrliche Auskunft.

## Was diese Seite nicht tut

- Für die Dateiverarbeitung ein Konto oder eine E-Mail-Adresse verlangen.
- Dateien auf einem Server zur Verarbeitung empfangen oder aufbewahren.
- Ein Wasserzeichen auf ein Ergebnis setzen oder eine Funktion für eine Bezahlstufe zurückhalten.
- Einem Werkzeug einen Netzwerkschritt hinzufügen, der nicht gebraucht wird.
- Auf einer Werkzeugseite etwas behaupten, was der Quelltext im Repository nicht tut.

Sollte etwas davon doch geschehen, ist das ein Fehler und ein gebrochenes Versprechen zugleich, und dann lohnt sich eine Nachricht. Am schnellsten geht das über die [Kontaktseite](https://abox.tools/de/kontakt/).
