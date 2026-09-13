# Kann ein KI-Agent diese Werkzeuge nutzen?

Ja. Es sind gewöhnliche Webseiten, ohne Konten, ohne Captchas und mit beschrifteten Bedienelementen, und ein Agent steuert sie so, wie er alles andere steuert. Die Frage, die eine Seite verdient, steckt dahinter: Wenn Sie eine Dateiarbeit an einen Agenten abgeben, wohin geht die Datei? Die Antwort hängt allein davon ab, wo der Browser des Agenten läuft.

Zuletzt aktualisiert 6. September 2026

## Die kurze Antwort

Ja. Jedes Werkzeug hier ist eine gewöhnliche Webseite: eine Dateiauswahl, ein paar beschriftete Bedienelemente, ein Download-Knopf. Es gibt kein Konto, in das man sich einloggen müsste, kein Captcha, keinen Schritt, der eigens einen Menschen verlangt. Ein KI-Agent mit einem Browser steuert diese Seiten so, wie er jede andere steuert — und einiges, was diese Website ohnehin für Menschen tut, kommt Agenten nebenbei zugute; der letzte Abschnitt zählt es auf.

Aber „kann er die Knöpfe drücken“ ist die kleine Frage. Die, die eine Seite verdient, lautet: Was wird aus dem Versprechen dieser Website — *Ihre Datei verlässt Ihre Maschine nie* —, wenn die Maschine, die die Knöpfe drückt, nicht Sie sind? Die Antwort: Das Versprechen übersteht die Delegation vollkommen oder gar nicht, und zwar abhängig von genau einer Sache — **davon, wo der Browser des Agenten läuft.**

## Zwei Sorten Agent, eine Unterscheidung

Agenten, die Werkzeuge benutzen, kommen in zwei Gestalten, und der Unterschied zwischen ihnen wiegt schwerer als alles andere auf dieser Seite.

**Ein lokaler Agent** läuft auf Ihrer Maschine: ein Assistent, der auf Ihrem Rechner installiert ist, oder einer, der den Browser steuert, in den Sie gerade schauen. Wenn so ein Agent hier ein Werkzeug öffnet und ihm Ihre Datei reicht, geschieht die Arbeit dort, wo sie bei diesen Seiten immer geschieht — in einem Browser, auf Ihrer Hardware. Die Datei wird von Ihrer Platte gelesen, im Speicher Ihres Browsers verarbeitet und auf Ihre Platte zurückgeschrieben. An dem Weg, den die Bytes nehmen, hat die Delegation nichts geändert. Eine KI hat die Einstellungen gewählt; die Datei ist trotzdem nie fortgegangen.

**Ein Cloud-Agent** betreibt einen Browser auf dem Rechner seines Anbieters. Sie hängen eine Datei an einen Chat, der Agent arbeitet in einer virtuellen Maschine irgendwo anders, und was immer er mit diesen Werkzeugen tut, geschieht dort. Die Werkzeuge verhalten sich weiterhin exakt wie versprochen — die Datei kommt nicht weiter als bis zu dem Browser, in dem sie liegt —, aber dieser Browser ist nicht Ihrer, und das Hochladen ist bereits in dem Moment geschehen, in dem Sie die Datei angehängt haben, bevor irgendein Werkzeug geöffnet war. Keine Seite kann ein Hochladen ungeschehen machen, das ihr vorausging.

Die Frage, die diese Website immer wieder stellt — braucht diese Arbeit, dass meine Datei überhaupt fortgeht? —, verschwindet also nicht, wenn ein Agent die Arbeit tut. Sie rückt nur eine Stufe vor, zur Wahl des Agenten. Ein lokaler Agent, der ein reines Browser-Werkzeug steuert, ist die seltene Anordnung, in der Delegation gar keine Privatsphäre kostet: Die KI macht die Arbeit, und die Datei bleibt zu Hause.

## Wie man einem Agenten eine Arbeit übergibt

Agenten arbeiten am besten mit demselben Auftrag, den ein Kollege haben wollte: das Werkzeug, die Datei, und woran man fertig erkennt. Ein paar Muster, die funktionieren:

- **Nennen Sie das Ergebnis, nicht nur das Werkzeug.** „Öffne abox.tools/bild-komprimieren/ und bring dieses Foto unter 200 KB“ gibt dem Agenten die Zahl, nach der die Seite fragen wird. Der [Bildkompressor](https://abox.tools/de/bild-komprimieren/) nimmt eine Zielgröße beim Namen — genau die Art Anweisung, die ein Agent getreu ausführen kann.
- **Zeigen Sie ihm die Karte.** Diese Website veröffentlicht [llms.txt](https://abox.tools/llms.txt) — jedes Werkzeug und jeden Ratgeber, mit je einer Zeile Beschreibung, als reinen Text in einem einzigen Abruf. Ein Agent, der sie liest, weiß, was es hier gibt, ohne irgendetwas abzugrasen. Und jede Seite hat einen Zwilling unter ihrer eigenen Adresse mit `index.md` am Ende: die Seite als Markdown, ohne die Oberfläche drumherum, für einen Agenten, der wissen will, was eine Werkzeugseite sagt, und nicht, wie sie aussieht.
- **Lassen Sie ihn die Seite lesen, auf der er steht.** Jedes Werkzeug trägt seine Fragen und Antworten in der Seite selbst, und zu jedem Werkzeug liegt ein Ratgeber einen Link entfernt. Einem Agenten, der sich bei einer Einstellung unsicher wirkt, kann man sagen, er möge zuerst den Ratgeber lesen — derselbe Rat, den ein Mensch bekäme.
- **Ketten funktionieren.** Die Arbeiten, die die Workflow-Ratgeber dieser Website Menschen beschreiben — scannen, dann zu einem [PDF](https://abox.tools/de/bilder-in-pdf-umwandeln/) zusammenfügen; [EXIF](https://abox.tools/de/exif-daten-entfernen/) entfernen, dann verkleinern —, sind die Arbeiten, in denen Agenten am besten sind, weil das Ergebnis jedes Schritts die Eingabe des nächsten ist und dazwischen nichts Urteilskraft braucht.

## Was man nicht delegiert

Ein Agent kann jedes Werkzeug hier steuern. An zwei Stellen ist das Steuern nicht die ganze Arbeit, und der Rest sollte bei Ihnen bleiben.

**Entscheiden, was nicht gesehen werden darf.** Die Schwärzungswerkzeuge löschen, was Sie abdecken — aber zu wählen, was abzudecken ist, *ist* die Arbeit, und ein Agent, der eine Zeile übersieht, hat eine Datei erzeugt, die fertig aussieht und es nicht ist. Lassen Sie einen Agenten ruhig das Schwärzungswerkzeug bedienen; sehen Sie sich das Ergebnis selbst an, bevor es irgendwohin geht — dieselbe Regel, die die Ratgeber dieser Werkzeuge einem menschlichen Bediener geben.

**Öffnen, was gelesen wurde.** Der QR-Leser dieser Website weigert sich, zu öffnen, was er entschlüsselt, weil Lesen und Folgen zwei verschiedene Handlungen sind. Dieselbe Trennung lohnt es, einem Agenten aufzuerlegen: Ein Agent, der einen Code, einen Link oder eine Adresse in einer Datei liest, soll sie melden, nicht besuchen. Und ein Agent, der Ihren eigenen Browser steuert, hält alles in der Hand, worin dieser Browser angemeldet ist — ein Grund, ihn so prüfend anzusehen wie jedes Werkzeug, wovon der nächste Abschnitt handelt.

## Auch ein Agent kann das Versprechen prüfen

Die vier Proben, die der Ratgeber über das [Hochladen](https://abox.tools/de/ratgeber/ist-das-hochladen-von-dateien-sicher/) lehrt — Stecker ziehen, Netzwerk-Tab beobachten, Content-Security-Policy lesen, Code lesen —, kann ein Agent allesamt ausführen, und ihm fallen sie sogar leichter als einem Menschen: einen CSP-Header zu lesen oder ausgelieferten Quelltext nach `fetch`-Aufrufen zu durchsuchen ist mechanische Arbeit. Wenn Sie Werkzeuge von einem Agenten prüfen lassen, bevor Sie ihnen trauen, erwartet diese Website, genauso geprüft zu werden — und das Offline-Verhalten, auf dem die Proben fußen, hat [eine eigene Seite](https://abox.tools/de/ratgeber/wie-kann-eine-webseite-offline-funktionieren/).

Was diese Website für einen Agenten tut, tut sie mit Absicht und für alle: Jedes Bedienelement ist beschriftet, weil Screenreader Namen brauchen und ein Agent dieselben Namen liest; die Seiten kennen keine Konten, keine Popups und keine Zustimmungswände, um die man herumsteuern müsste; der Quelltext ist öffentlich und wird ohne Build-Schritt ausgeliefert, sodass der Code, den ein Agent prüft, der Code ist, der läuft; und [llms.txt](https://abox.tools/llms.txt) ist die ganze Kiste in einem Abruf. Nichts davon wurde für Maschinen hinzugefügt. Eine Seite, die für einen Menschen mit Screenreader lesbar ist, erweist sich als lesbar für alles andere ebenso.

Eine ehrliche Grenze: Diese Seite handelt von Agenten, die diese Werkzeuge benutzen, nicht von den Agenten selbst. Was der Anbieter eines Agenten sieht — Ihre Anweisungen, Ihre Bildschirmfotos, manchmal Ihre Dateien —, ist eine eigene Frage, und die Gewohnheit, bei der diese ganze Ratgebergruppe immer wieder ankommt, ist auch für sie der richtige Blick: Fragen Sie, was Ihre Maschine wirklich verlassen muss, und in welchem Zustand.
