# Über abox.tools

Eine Person in Ontario, die genau die Werkzeuge baut, die sie ständig brauchte und denen sie nicht traute. Alles hier läuft auf Ihrem eigenen Gerät, der Quelltext ist öffentlich, und auf dieser Seite stehen die Gründe für beides.

Zuletzt aktualisiert 27. August 2026

## Was das hier ist

abox.tools ist eine Sammlung kleiner Werkzeuge, die jeweils eine Sache erledigen. Ein Foto verkleinern, ein Video kürzen, zwei PDFs zusammenfügen, nachsehen, was in einem QR-Code wirklich steht. Es sind derzeit 44, dazu kommt eine [Sammlung von Ratgebern](https://abox.tools/de/ratgeber/) zu den Aufgaben, für die sie gedacht sind.

Das Ungewöhnliche daran ist nicht, was sie tun, sondern wo sie es tun. Jedes einzelne läuft vollständig in Ihrem Browser, auf Ihrer eigenen Hardware, mit den Decodern und Encodern, die Ihr Browser ohnehin mitbringt. Nichts, was Sie öffnen, wird irgendwohin übertragen. Es gibt hinter diesen Seiten auch keinen Server, an den es gehen könnte, denn die ganze Seite besteht aus statischen Dateien, und die Werkzeuge sind einfache JavaScript-Module, die daneben liegen.

Das ist das Produkt. Alles Weitere auf dieser Seite erklärt, warum sich diese Bauweise lohnt und wer dahintersteht.

## Wer das macht

Eine Person, allein, in Ontario in Kanada. Das hier ist keine Firma. Es gibt kein Team, keinen Investor, keinen Mutterkonzern und keinen Plan, von einem übernommen zu werden. Post geht an [hi@abox.tools](mailto:hi@abox.tools) und landet bei der Person, die den Quelltext geschrieben hat. Auf der [Kontaktseite](https://abox.tools/de/kontakt/) steht, wofür sich das eignet und wofür nicht.

Die Seite erscheint bewusst ohne persönliche Namenszeile. Es ist ein kleines Projekt und keine persönliche Marke, und vertrauenswürdig sein soll hier nicht ein Name unter einer Seite, sondern [der Quelltext](https://github.com/A-Box-of-Tools/website), den jeder lesen kann, und das Verhalten der Seiten selbst, das sich mit geöffneten Entwicklerwerkzeugen in etwa dreißig Sekunden überprüfen lässt. Diese beiden Dinge sind nachprüfbar. Eine Namenszeile ist es nicht.

## Warum es so gebaut ist

Der übliche Weg für solche Werkzeuge geht so: Datei hochladen, Arbeit auf einem Server erledigen, Ergebnis zurückschicken. Das ist einfacher, es funktioniert auf jedem Gerät, und fast jeder „kostenlose Online-Converter“ macht es genau so.

Es bedeutet aber auch, einem Fremden die eigene Datei zu geben. Bei einem Meme ist das belanglos, beim Scan eines Reisepasses, bei einer medizinischen Aufnahme, bei einem unterschriebenen Vertrag oder bei einem Foto, in dessen Metadaten die eigene Adresse steht, ist es das nicht. Sobald die Datei auf dem Gerät eines anderen liegt, hängt ihr weiteres Schicksal an dessen Richtlinien und dessen Sorgfalt, und weder das eine noch das andere können Sie prüfen. Die Datenschutzerklärung einer solchen Seite ist ein Versprechen und keine technische Schranke.

Browser sind inzwischen gut genug, dass es dieses Versprechen nicht mehr braucht. Sie können JPEG, PNG und WebP lesen und schreiben, Videos entpacken und decodieren, eine Datei hashen, einen QR-Code lesen und ein PDF erzeugen. Wenn die Arbeit auf Ihrem eigenen Gerät stattfinden kann, dann ist „behalten die meine Datei?“ keine Frage nach den Absichten irgendeines Anbieters mehr, sondern eine Frage danach, wozu der Quelltext technisch überhaupt in der Lage ist. Und die können Sie selbst beantworten.

Das ist das ganze Argument, und ein Ratgeber führt es in Ruhe aus: [Ist es sicher, Dateien auf eine Website hochzuladen?](https://abox.tools/de/ratgeber/ist-das-hochladen-von-dateien-sicher/)

## Prüfen statt glauben

Jede Aussage weiter oben ist zum Nachprüfen gedacht. Vier Wege, nach Aufwand geordnet:

- **Ziehen Sie den Stecker.** Laden Sie eine beliebige Werkzeugseite, trennen Sie die Verbindung und arbeiten Sie trotzdem damit. Es funktioniert weiter, weil nie ein Netzwerkschritt darin war. Ein Werkzeug, das Ihre Datei zur Verarbeitung wegschickt, würde stehenbleiben.
- **Sehen Sie dem Netzwerk zu.** Öffnen Sie die Entwicklerwerkzeuge, gehen Sie auf den Reiter „Netzwerk“ und verarbeiten Sie eine Datei. Keine einzige Anfrage trägt Ihre Datei, ein Vorschaubild davon, ihren Namen oder ein Byte ihres Inhalts. Zu sehen sind die Seite, ihre Skripte, die Werbung und der Besuchszähler.
- **Lesen Sie die Regel, die sich die Seite selbst auferlegt.** Jede Seite trägt eine `Content-Security-Policy`, die jede Adresse benennt, die sie kontaktieren darf, und keine davon gehört zu dieser Seite. Selbst ein Fehler im Quelltext könnte eine Datei nirgends hinschicken, weil der Browser die Verbindung verweigern würde.
- **Lesen Sie den Quelltext.** Er ist [vollständig öffentlich](https://github.com/A-Box-of-Tools/website), ohne Build-Schritt und ohne Bundler. Was im Repository steht, ist Byte für Byte das, was Ihr Browser ausführt. Zu jedem Werkzeug gehört eine README, die erklärt, wie es arbeitet, und jede Werkzeugseite nennt die Dateien, die man zuerst lesen sollte.

Es gibt genau eine gewollte Ausnahme von „kein Netz“, und sie steht ausführlich auf ihrer eigenen Seite. [Text teilen](https://abox.tools/de/text-teilen/) bewegt Text zwischen zwei Ihrer eigenen Geräte, was ohne Netz nicht geht. Dafür wird eine einzige Verbindung zu einer Vermittlungsstelle geöffnet, die nichts speichert und der nur gesagt wird, dass zwei Browser einander kennenlernen möchten.

## Wie die Werkzeuge gebaut und geprüft werden

Ein Werkzeug erscheint, wenn es mit echten Dateien zurechtkommt, und nicht schon dann, wenn es mit der Datei zurechtkommt, gegen die es geschrieben wurde. Praktisch heißt das, dass jedes von Hand im Browser an sperrigen Fällen durchgespielt wird. Am Video ohne Keyframe an der Stelle, an der man schneiden möchte. An der HEIC-Datei eines Telefons, das den Container leicht falsch schreibt. Am PDF mit einer eingebetteten Teilschrift. Genau das haben Menschen nämlich auf ihren Geräten, und genau das findet ein Test nicht, den dieselbe Person geschrieben hat wie den Fehler.

Darunter liegt eine automatische Testsuite für beide Hälften, für den Generator, der die Seite baut, und für die Module, die der Browser ausführt. Sie läuft bei jeder Änderung, und nichts wird nach einem Fehlschlag veröffentlicht. Wo dieselbe Arbeit in mehreren Werkzeugen steckt, mehrere von ihnen lesen MP4-Dateien, prüft ein Test, dass die Kopien noch übereinstimmen. So kann eine Korrektur an einer Stelle die anderen nicht stillschweigend falsch zurücklassen.

Die Ratgeber entstehen nach derselben Regel. Ihre Bildschirmfotos werden von einem Skript aus der gebauten Seite aufgenommen und nicht gezeichnet oder nachgestellt. Ein Bild in einem Ratgeber zeigt also die Seite so, wie sie heute tatsächlich aussieht.

## Wie sich das trägt

Durch Werbung und durch Spenden von Menschen, denen die Werkzeuge nützen. Das ist das gesamte Geschäftsmodell, und es lohnt sich, genau zu sagen, was dazugehört und was nicht.

**Es gibt nichts zu kaufen.** Kein Konto, keine Anmeldung, keine kostenlose Stufe mit einer bezahlten darüber, kein Wasserzeichen, das man wegkaufen muss, keine Größenbeschränkung, kein Tageslimit und keine zurückgehaltene Funktion. Was auf der Seite steht, ist alles.

**Ihre Dateien sind nicht Teil des Geschäfts.** Die Werbung kommt von Google, gezählt wird mit Google Analytics, und keines von beiden erfährt, was Sie öffnen, was Sie erzeugen, wie es hieß oder wie groß es war. Kein Skript bekommt das jemals zu sehen, und die Sicherheitsrichtlinie der Seite würde die Übertragung verweigern, falls es eines versuchte. Was die beiden tatsächlich erheben und wie Sie jedes davon abschalten, steht auf der [Datenschutzseite](https://abox.tools/de/datenschutz/). Jedes Werkzeug funktioniert weiter, wenn beide blockiert sind.

**Die Werkzeuge werden nicht für die Werbung geschrieben.** Kein Werkzeug hier existiert, weil ein Suchbegriff Geld wert war, und keines wurde langsamer, umständlicher oder seitenreicher gemacht, um mehr Anzeigen auszuliefern. Worüber als Nächstes gearbeitet wird, wird offen diskutiert, in [ROADMAP.md](https://github.com/A-Box-of-Tools/website/blob/main/ROADMAP.md), ein Absatz je Idee, einschließlich der Gründe, aus denen mehrere naheliegende Vorschläge abgelehnt wurden.

## Sprachen

Die Seite erscheint in fünfzehn Sprachen. Jede davon ist eine echte Übersetzung und keine Maschinenausgabe, die man liegengelassen hat. Die Namen der Werkzeuge, die Erklärungen, die Ratgeber und die Adressen selbst sind übersetzt, und eine Seite wird in einer Sprache erst gelistet, wenn diese Sprache tatsächlich geschrieben wurde. Eine Sprache, an der noch gearbeitet wird, bleibt lesbar, wird aber aus der Sitemap und aus der Sprachauswahl herausgehalten. So wird niemand auf eine Seite eingeladen, die zur Hälfte englisch ist.

Beantwortet wird Post auf Englisch. Bei einem Projekt dieser Größe ist das die einzige ehrliche Auskunft.

## Was diese Seite nicht tut

- Nach einem Konto oder nach Ihrer E-Mail-Adresse fragen.
- Eine Datei hochladen, speichern, durchsehen oder aufbewahren, die Sie hier öffnen.
- Ein Wasserzeichen auf ein Ergebnis setzen oder eine Funktion für eine Bezahlstufe zurückhalten.
- Einem Werkzeug einen Netzwerkschritt hinzufügen, der nicht gebraucht wird.
- Auf einer Werkzeugseite etwas behaupten, was der Quelltext im Repository nicht tut.

Sollte etwas davon doch geschehen, ist das ein Fehler und ein gebrochenes Versprechen zugleich, und dann lohnt sich eine Nachricht. Am schnellsten geht das über die [Kontaktseite](https://abox.tools/de/kontakt/).
