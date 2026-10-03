# Passwort & Passphrase — sicher und zufällig, im Browser erzeugt

Hier erzeugt, von Ihrem eigenen Browser, und nirgendwohin gesendet. Nichts wird gespeichert, es gibt keinen Verlauf.

> Ein sicheres Zufallspasswort erzeugen, oder eine Diceware-Passphrase aus einer mitgelieferten Liste von 7.776 Wörtern. Vom Zufallsgenerator Ihres Browsers gezogen, nirgendwohin gesendet, nirgends gespeichert. Kostenlos, ohne Anmeldung.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/passwort-generator/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre Passwörter und Passphrasen werden **nie hochgeladen**. Es gibt keinen Server.

Jedes Zeichen kommt aus `crypto.getRandomValues`, dem kryptografischen Zufallsgenerator des Browsers, und jedes Wort aus einer Liste, die als `src/wordlist.js` in diesem Ordner liegt. Es gibt weder `fetch` noch `XMLHttpRequest` noch `sendBeacon` irgendwo in `src/`, also gibt es auch keinen Weg, auf dem ein hier erzeugtes Passwort zu uns oder zu sonst jemandem gelangen könnte. Gespeichert wird ebenfalls nichts, und deshalb vernichtet ein Neuladen dieser Seite jedes Passwort, das sie Ihnen je gezeigt hat.

- ✗ Kein Upload
- ✗ Kein Konto
- ✗ Nichts gespeichert
- ✓ Funktioniert offline
- ✓ Quelloffen

## So erzeugen Sie ein sicheres Passwort, ohne dass eine Website es sieht

1. **Wählen Sie Passwort oder Passphrase.** Ein Passwort ist eine Folge zufälliger Zeichen. Kurz zu speichern, unangenehm zu tippen, und genau richtig für die hunderte Konten, die Ihr Passwortmanager für Sie ausfüllt. Eine Passphrase besteht aus Wörtern, die zufällig aus einer Liste gezogen wurden. Sie ist länger, dafür merkbar und aussprechbar, und das brauchen Sie für die wenigen Geheimnisse, die Sie aus dem Kopf tippen müssen: das des Passwortmanagers selbst, das Ihres Notebooks, den Wiederherstellungscode Ihres Telefons.
2. **Setzen Sie die Länge oder die Anzahl der Wörter.** Das ist die Einstellung, auf die es ankommt, und die übrigen sind es meist nicht. Zwanzig Zeichen oder sechs Wörter sind eine vernünftige Untergrenze für alles, was schützenswert ist, und für das Konto, mit dem sich alle anderen zurücksetzen ließen, gehen Sie höher. Die Anzeige darunter bewegt sich beim Ziehen mit, Sie sehen also, was jedes zusätzliche Zeichen einbringt.
3. **Schalten Sie die Regeln ein, auf denen das Formular bestehen wird.** „Mindestens eines aus jedem Satz“, eine Ziffer am Ende, ein Sonderzeichen aus der kurzen Liste, die wirklich jede Seite annimmt. Nichts davon macht etwas stärker, das erste macht es sogar minimal schwächer, und die Seite hat das bereits abgezogen. Aber so kommen Sie durch ein Anmeldeformular, ohne sechs Passwörter hintereinander erzeugen zu müssen.
4. **Lesen Sie die Zahl, nicht die Farbe.** Die Bits werden aus den Einstellungen errechnet, die die Zeichenkette hervorgebracht haben, also aus der Größe des Zeichensatzes und der Anzahl der Ziehungen und aus sonst nichts. Das ist eine echte Messung, anders als die Anzeige auf einer Anmeldeseite, die nur die Zeichen vor sich bewerten kann und nicht wissen kann, ob Sie sie ausgesucht haben oder ein Generator.
5. **Kopieren Sie es und legen Sie es ab, bevor Sie gehen.** Es gibt hier keinen Verlauf und keine Möglichkeit, etwas zurückzuholen. Ein Neuladen der Seite vernichtet es. Fügen Sie es zuerst in den Passwortmanager ein und erst danach in das Anmeldeformular, damit die Stelle, die es sich merken muss, es hat, bevor irgendetwas schiefgehen kann.
6. **Nehmen Sie einen Stapel, wenn Sie einen brauchen.** Der Regler ganz unten erzeugt bis zu hundert auf einmal und speichert sie auf Wunsch als einfache Textdatei, von dieser Seite geschrieben aus dem, was ohnehin schon auf Ihrem Schirm steht. Praktisch für neu anzulegende Konten oder Erstzugänge, und es lohnt sich, die Datei zu löschen, sobald die Passwörter an einem besseren Ort sind. Eine Datei voller Passwörter auf der Festplatte bleibt eine Datei voller Passwörter.

## Auch im Werkzeugkasten

- [JSON-Formatierer](https://abox.tools/de/json-formatieren/): JSON, XML, HTML, CSS und YAML, formatiert oder umgewandelt. Nichts davon wird in den Server eines anderen eingefügt.
- [YAML-zu-JSON-Umwandler](https://abox.tools/de/yaml-in-json-umwandeln/): Beide Richtungen, und es sagt Ihnen, was jede davon kostet. Nichts davon wird in den Server eines anderen eingefügt.
- [XML-Formatierer](https://abox.tools/de/xml-formatieren/): XML zum Lesen ausgelegt oder zum Ausliefern flach gepresst, und in beide Richtungen zu JSON umgewandelt. Nichts davon wird in den Server eines anderen eingefügt.
- [Textvergleich](https://abox.tools/de/text-vergleichen/): Zwei Texte hinein, jeder Unterschied markiert, Zeile für Zeile und Wort für Wort. Nichts davon wird in den Server eines anderen eingefügt.

## Fragen

### Werden die Passwörter irgendwohin gesendet oder gespeichert?

Weder noch. Sie entstehen in Ihrem Browser, auf Ihrem eigenen Gerät, und Netzfunktionen hat dieses Werkzeug überhaupt keine. Es ruft nie etwas ab und sendet nie etwas. Gespeichert wird ebenso wenig: kein localStorage, kein Cookie, kein Verlauf. Laden Sie die Seite neu, und jedes Passwort, das sie Ihnen gezeigt hat, ist fort, vom Schirm und aus ihrem eigenen Speicher. In der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf, und keine davon gehört uns. Es gibt also gar keinen Ort, an dem ein Passwort landen könnte, selbst wenn etwas es versuchte.

### Woher kommt der Zufall?

Aus `crypto.getRandomValues`, dem Generator, den Browser für kryptografische Zwecke bereitstellen, gespeist aus dem Entropiepool Ihres Betriebssystems. Es ist dieselbe Quelle, aus der ein Browser das Schlüsselmaterial für TLS zieht. `Math.random` wird in diesem Werkzeug nirgends verwendet, und dieser Unterschied ist keine Wortklauberei. `Math.random` ist ein schneller arithmetischer Generator, dessen kompletter interner Zustand sich aus wenigen aufeinanderfolgenden Ausgaben rekonstruieren lässt. Ein Passwort-Generator auf dieser Grundlage erzeugt Passwörter, die zufällig aussehen und von jedem aufgezählt werden können, der eines davon gesehen hat.

### Ist ein Passwort aus dem Browser so gut wie eines aus einem Desktop-Programm?

Was den Zufall angeht, ja. Es ist in beiden Fällen dieselbe Quelle des Betriebssystems, nur durch eine andere Tür erreicht. Verschieden ist, was sonst im Raum steht. Ein Browser-Tab läuft neben Ihren Erweiterungen, und eine Erweiterung mit der Berechtigung, Seiten zu lesen, kann auch diese lesen. Das gilt für jeden webbasierten Generator, diesen eingeschlossen, und es ist der ehrliche Grund, den eingebauten Generator Ihres Passwortmanagers zu nehmen, wenn Sie einen haben. Es ist dieselbe Rechnerei, nur in einem Prozess, neben dem weniger steht. Diese Seite ist für den Fall, dass Sie keinen zur Hand haben.

### Passwort oder Passphrase, was soll ich nehmen?

Ein Passwort für alles, was ein Passwortmanager für Sie eintippt, denn Sie werden es nie ansehen und Länge kostet dort nichts. Eine Passphrase für die wenigen Dinge, die Sie aus dem Kopf tippen oder laut vorlesen müssen: das Hauptpasswort des Passwortmanagers, den Schlüssel einer Festplattenverschlüsselung, ein Gerät, das Sie aus der Ferne einrichten. Sechs Wörter aus der langen Liste sind 77 Bit, also stärker als ein zufälliges Passwort aus zwölf Zeichen, und um ein Vielfaches leichter um vier Uhr morgens richtig einzugeben.

### Wie lang sollte ein Passwort sein?

Zwanzig Zeichen über den vollen Zeichensatz sind rund 130 Bit und damit jenseits des Punktes, an dem Länge noch das Problem wäre. Sechzehn genügt völlig. Zwölf ist die Untergrenze für alles, dessen Verlust Sie ärgern würde, und zwar die Untergrenze und nicht das Ziel. Darunter verlassen Sie sich darauf, dass die Seite es ordentlich gespeichert hat, und das ist nach zwanzig Jahren Meldungen über Datenlecks keine gute Wette. Länge schlägt jede andere Einstellung auf dieser Seite. Ein Zeichen mehr bringt mehr als jede Regel darüber, welche Zeichen vorkommen müssen.

### Aus wie vielen Wörtern sollte eine Passphrase bestehen?

Aus sechs der langen Liste, und aus sieben, wenn sie andere Passwörter schützt. Das berühmte Bild mit vier Wörtern stammt aus dem Jahr 2011, ist 51 Bit wert und liegt heute in Reichweite eines ernsthaften Angriffs außerhalb der Leitung. Fünf sind 64 Bit. Sechs sind 77, und das ist mehr, als ein Angreifer je für ein gewöhnliches Konto aufwenden wird. Jedes weitere Wort aus der langen Liste bringt 12,9 Bit, und nur die Wörter bringen überhaupt etwas. Die Bindestriche und die Großbuchstaben nicht.

### Was ist ein „Bit“, und warum zählt diese Seite sie?

Ein Bit ist eine Verdopplung. Sechzig Bit heißt, dass es 2^60 gleich wahrscheinliche Ergebnisse gab, die diese Seite hätte hervorbringen können. Wer also genau weiß, wie sie arbeitet, hat immer noch so viele durchzuprobieren. Es ist eine Eigenschaft des *Verfahrens* und nicht der Zeichenkette, und die Seite kann sie exakt angeben, weil sie diejenige war, die gewählt hat, und weiß, wie viele Wahlen sie getroffen hat. Genau das unterscheidet die Zahl von dem bunten Balken auf einem Anmeldeformular, der die Zeichen ansieht und rät. Auf diesem Balken schneidet `correct horse battery staple` schlecht ab und ist 44 Bit wert, während `P@ssw0rd!` gut abschneidet und so gut wie nichts wert ist.

### Warum macht „muss ein Sonderzeichen enthalten“ ein Passwort schwächer?

Weil eine Regel immer nur Möglichkeiten wegnehmen kann. Wer mindestens ein Zeichen aus jedem Satz verlangt, schließt jedes Passwort aus, in dem zufällig keines vorkam, und eine kleinere Menge möglicher Passwörter ist eine kleinere Menge zum Durchsuchen. Der Effekt ist gering, bei üblicher Länge etwa ein halbes Bit, und er ist real, und diese Seite zieht ihn ab, statt die schmeichelhaftere Zahl zu nennen. Er wird exakt bestimmt, indem die Passwörter gezählt werden, die die Regel tatsächlich zulässt, und nicht die, die sie ausschließt.

### Welche Wortliste ist das, und macht es etwas aus, dass ein Angreifer sie herunterladen kann?

Es sind die Diceware-Listen der Electronic Frontier Foundation, unverändert mitgeliefert: 7.776 Wörter in der langen, 1.296 in der kurzen. Sie wurden für genau diesen Zweck gebaut, also ohne Anstößiges, ohne Gleichklinger, ohne Paare, die zusammengeschrieben ein drittes Wort ergeben, und in der kurzen Liste ohne Wort, das der Anfang eines anderen ist. Und nein, dass die Liste öffentlich ist, macht nichts aus. Die hier genannte Stärke setzt voraus, dass ein Angreifer sie hat, den Quelltext dieser Seite liest und jede Einstellung kennt, die Sie verwendet haben. Das Einzige, was er nicht weiß, ist, welches der 7.776 Wörter jedes Mal gezogen wurde. Diese Annahme ist es, die die Zahl vertrauenswürdig macht.

### Ist eine Passphrase nicht bloß ein Wörterbuchangriff mit Ansage?

Nicht, wenn die Wörter so gewählt werden. Ein Wörterbuchangriff funktioniert gegen Sätze, die *Menschen* sich ausdenken, weil Menschen Wörter wählen, die zusammenpassen, in einer Reihenfolge, die Sinn ergibt, aus den paar tausend, die sie täglich benutzen. Diese Seite zieht jedes Wort unabhängig und gleichverteilt aus einer festen Liste, ohne Rücksicht darauf, ob das Ergebnis sich gut liest, weshalb es das meist nicht tut. Ein Angreifer, der die Liste und die Länge kennt, steht trotzdem vor 7.776 hoch der Anzahl der Wörter.

### Kann ich ein Passwort zurückbekommen, nachdem ich die Seite verlassen habe?

Nein, und das ist Absicht. Nirgendwo wird etwas festgehalten, es gibt also nichts zurückzuholen: kein Verlaufsfenster, keine Liste „zuletzt erzeugt“, keinen Zwischenspeicher. Ein Generator, der Ihnen das Passwort vom vergangenen Dienstag zeigen könnte, wäre ein Generator, der es gespeichert hat, und dort gespeichert, wo Sie herankommen, heißt dort gespeichert, wo auch anderes herankommt. Kopieren Sie es in einen Passwortmanager, bevor Sie weiterklicken.

### Ist das Kopieren in die Zwischenablage sicher?

Es ist das gewöhnliche Risiko, und es lohnt sich, es zu kennen, statt sich davor zu fürchten. Die Zwischenablage teilen Sie mit allem, was unter Ihrem Benutzerkonto läuft, sie überdauert meist bis zum nächsten Kopieren, und in manchen Konfigurationen wird sie zwischen Geräten abgeglichen. Das ist ein guter Grund, das Passwort sofort dort einzufügen, wo es hingehört, und danach etwas anderes zu kopieren, und kein Grund, stattdessen ein schwächeres Passwort von Hand zu tippen. Diese Seite kann Ihre Zwischenablage nicht lesen. Sie kann nur hineinschreiben, und nur, wenn Sie den Knopf drücken.

### Darf ich dasselbe an mehreren Stellen verwenden?

Nein, und das ist der eine Rat auf dieser Seite, der über allen anderen steht. Fast jedes übernommene Konto wird mit einem Passwort übernommen, das vorher woanders richtig war. Eine Seite wird angegriffen, die Liste wird veröffentlicht, und dieselbe Adresse mit demselben Passwort wird überall durchprobiert. Ein eigenes Passwort je Seite macht aus einem Datenleck ein einzelnes Konto statt aller, und genau darum lohnt sich ein Passwortmanager, und nicht wegen der Stärke der einzelnen Passwörter darin.

### Ist es kostenlos, und brauche ich ein Konto?

Es ist kostenlos, es gibt kein Konto, keine Anmeldung, keine Testphase und keine Grenze dafür, wie viele Sie erzeugen. Bezahlt wird die Seite über Werbung. Den Anzeigen wird überhaupt nichts darüber übergeben, was hier entsteht, auch nicht, wie lang oder wie stark es war.

### Funktioniert es offline?

Ja. Laden Sie die Seite einmal, trennen Sie dann die Internetverbindung, und sie erzeugt weiter Passwörter. Der Zufall kommt von Ihrem eigenen Gerät, und die Wortliste liegt bereits in der Seite. Das ist zugleich der einfachste Beweis dafür, dass nichts abgerufen und nichts gesendet wird. Ein Generator, der seine Zahlen bei einem Server holt, bliebe in dem Moment stehen, in dem Sie den Stecker ziehen.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Das Passwort entsteht dort, wo Sie das hier lesen.** Es wird auf dieser Seite gezogen, von dieser Seite, aus dem Zufall, den Ihr eigenes Betriebssystem dem Browser übergibt. Für die Erzeugung wird nichts angefragt, und wenn es fertig ist, wird nichts gemeldet. In der `Content-Security-Policy` steht jede Adresse, die diese Seite kontaktieren darf, und keine einzige davon gehört uns. Es gibt hier keinen Endpunkt, an dem ein erzeugtes Passwort landen könnte, und im Code steht auch nichts, das es dorthin schicken würde, gäbe es einen.
- **Nichts hier ruft etwas ab.** Es gibt weder `fetch` noch `XMLHttpRequest` noch `sendBeacon` irgendwo in `src/`. Die Wortliste wird nicht heruntergeladen. Sie ist `src/wordlist.js`, wird mit dem Rest der Seite von dieser Domain ausgeliefert, und Sie können sie lesen.
- **Der Zufall ist der des Browsers, und es ist die richtige Sorte.** `crypto.getRandomValues` ist der Generator, den Browser für Schlüssel und Token bereitstellen, vom Betriebssystem gespeist und immer wieder neu gespeist. `Math.random` kommt in diesem Ordner nirgends vor, und es wäre ein echter Fehler, wenn doch. Sein interner Zustand lässt sich aus einer Handvoll Ausgaben rekonstruieren, womit jedes Passwort, das er je erzeugen wird, für jeden berechenbar ist, der eines davon gesehen hat.
- **Nichts wird gespeichert, also gibt es keinen Verlauf zu löschen.** Kein localStorage, kein sessionStorage, kein Cookie, kein URL-Parameter und kein `<input>`, das der Browser sich zu merken anbieten würde. Was auf dem Schirm steht, existiert in einem einzigen Array im Speicher dieser Seite, und das Schließen des Tabs ist bereits das ganze Aufräumen. Die einzigen Kopien von etwas, das hier entsteht, sind die, die Sie mitnehmen.
- **Was Google lädt und was Google nicht bekommt.** Die Werbe- und Messskripte kommen von Google, der Spenden-Button von Buy Me a Coffee. Keinem davon wird ein Zeichen dessen übergeben, was diese Seite erzeugt, auch nicht die Länge, nicht die Stärke und nicht die Einstellungen, aus denen es entstanden ist. Jede Zeile, die ein Zeichen oder ein Wort zieht, kommt von dieser Domain selbst und steht im Repository.
- **Es funktioniert offline.** Trennen Sie die Netzverbindung, und das Werkzeug bleibt unverändert, weil darin nie ein Schritt über das Netz vorgesehen war. Einen einfacheren Beweis gibt es nicht. Ein Generator, der seinen Zufall bei einem Server holt, bliebe in dem Moment stehen, in dem Sie den Stecker ziehen.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, `src/random.js` für die vierzig Zeilen, die zwischen dieser Seite und jedem Passwort stehen, das sie erzeugt. Sie haben genau eine Eingabe, und das ist der Generator des Browsers selbst. Dazu `src/generate.js` dafür, wie aus den Einstellungen eine Zeichenkette wird, und `src/strength.js` für die Rechnung hinter der Zahl, die zählt statt zu schätzen.
