# So teilen Sie Text und Dateien ohne gespeicherte Serverkopie

Übertragen Sie eine Notiz oder Datei ohne Kopie in einem E-Mail-Postfach, Chatverlauf oder Freigabeserver. Standardmäßig verbinden sich die Browser direkt. Wenn das nicht klappt, kann der Host eine neue Freigabe mit Cloud-Relay starten; Cloudflare leitet die verschlüsselten Inhalte weiter. Empfänger können erhaltene Inhalte weiterhin speichern.

[Text & Dateien teilen öffnen](https://abox.tools/de/text-teilen/): Teilen Sie Text und Dateien verschlüsselt aus Ihrem offenen Browser. Direkt ist der Standard; ein Cloud-Relais ist optional. Sie entscheiden, welche Leser Zugang erhalten.

Zuletzt aktualisiert 13. Oktober 2026

## Die kurze Antwort

Direct ist voreingestellt. Die folgenden Hinweise zur direkten Erreichbarkeit gelten für diesen Modus. Soll die Verbindung über Cloud relay laufen, wählt der Host dies vor dem Start und teilt die neue Einladung. Die andere Person sieht die Wahl und bestätigt sie vor dem Verbinden. Direct wechselt niemals automatisch. Cloudflare leitet verschlüsselte Inhalte weiter und sieht Adressen, Zeitpunkte und Datenvolumen. Beide Geräte brauchen dabei durchgehend Internet. Zustimmung, Passwort und Mikrofonsteuerung gelten unverändert.

Öffnen Sie [Text & Dateien teilen](https://abox.tools/de/text-teilen/) auf dem Gerät, das die Sache hat, schreiben Sie oder hängen Sie an, und drücken Sie *Freigabe starten*. Die Seite gibt der Freigabe einen Namen wie `brave-otter-42`; auf dem anderen Gerät öffnen Sie dieselbe Seite und setzen `#brave-otter-42` ans Ende der Adresse — oder folgen einfach dem kopierten Link. Das andere Gerät fragt vor dem Verbinden nach, Sie lassen es ein, und Text oder Datei wandern verschlüsselt direkt von einem Browser in den anderen. Schließen Sie den teilenden Tab, ist die Freigabe vorbei, überall.

Kein geteilter Text und keine Datei wurden auf einen Server hochgeladen. Das folgt aus der Bauform. Der Rest erklärt ihre Bedeutung und ehrlichen Grenzen.

![Die erste Karte des Teilen-Werkzeugs: ein Textfeld mit ein paar Zeilen Besprechungsnotizen, darüber ein Markdown-Schalter und eine Schaltfläche zum Anhängen einer Datei.](https://abox.tools/screens/share-text-between-devices/write.webp)

Was übergeben wird. In dasselbe Feld passt eine Einkaufsliste ebenso wie ein Dokument, und Markdown ist ein Schalter und kein eigener Modus.

## Eine Notiz aufs Telefon übertragen oder eine Workshopdatei übergeben

**Vom Laptop zum Telefon.** Legen Sie eine lange Adresse, Anweisungen oder eine Datei in die Teilen-Seite am Laptop. Lassen Sie Privat aktiv, öffnen den kopierten Link am Telefon, genehmigen den erwarteten Leser und kopieren oder laden das Benötigte herunter. Halten Sie den Tab sichtbar und wach bis zum Empfang und beenden das Teilen. Die gespeicherte Telefonkopie bleibt nach Linkende.

**Ein Liveworkshop oder Supportgespräch.** Teilen Sie Übungsdatei, Beispielkonfiguration oder Diagnoseausschnitt, während beide anwesend sind. Nutzen Sie möglichst erfundene Daten und genehmigen Leser einzeln. Die Liste im auffindbaren Lokalnetzmodus beweist keine Anwesenheit im Raum. Dateien dürfen das Limit von 200 MB pro Datei nicht überschreiten.

Testen Sie vor dem Termin im echten Netz. Vereinbaren Sie eine Ausweichlösung für blockierte Direktwege. Es ist eine Liveübergabe. Für unbeaufsichtigte Nachtzustellung braucht es einen Dienst, der Inhalte bewusst speichert.

## Wo die üblichen Wege eine Kopie hinterlassen

Mailen Sie sich eine Notiz, existiert sie jetzt in einem Gesendet-Ordner und einem Posteingang, beide synchronisiert, beide gesichert, beide noch in Jahren durchsuchbar. Fügen Sie ein Passwort in eine Chat-App ein, liegt es im Verlauf dieser Unterhaltung — und im Cloud-Backup der App —, solange es die Unterhaltung gibt. Nehmen Sie ein Pastebin oder eine Datei-Drop-Seite, liegt der Inhalt auf deren Server, hinter einer Ablaufeinstellung und einem Löschknopf, von denen Sie nur die Farbe des Knopfes prüfen können. Jeder dieser Wege ist ein Speicherdienst, der Teilen als Funktion trägt.

Manchmal ist genau das gewollt — eine Kopie, die wartet, bis der andere so weit ist. Aber die meisten schnellen Freigaben sind das Gegenteil: Das andere Gerät steht daneben, der Inhalt ist flüchtig, und jede gespeicherte Kopie ist reine Last. Das WLAN-Passwort für den Gast, eine Adresse am Telefon, eine Fehlermeldung, die ein zweites Augenpaar braucht, ein Konfigurationsschnipsel auf dem Weg zu der Maschine, auf die er gehört. Nichts davon will ein Archiv.

## Was „direkt“ wirklich heißt

Das Werkzeug nutzt WebRTC wie Browservideoanrufe. Zwei Browser öffnen einen verschlüsselten Datenkanal ohne Server im Weg. Eine funktionierende lokale Verbindung überträgt mit Netzgeschwindigkeit. Der Weg hängt auch von VPNs, Browserrichtlinien und Geräteeinstellungen ab.

Ein ehrlicher Vorbehalt steht auch auf der Werkzeugseite. Zwei Browser finden sich nicht allein. Ein kleiner Rendezvousserver verbindet Namen und teilt einige Kilobytes Verbindungsaufbau. Er speichert keine geteilten Inhalte und sie durchlaufen ihn nicht. Sein Quellcode liegt neben dem Werkzeug. Er stellt nur vor und führt kein Gespräch. Er listet auch freiwillig sichtbare lokale Linknamen zur Entdeckung auf der Startseite. Diesen Einführungsdienst verwenden dieses Werkzeug und Remote Camera. Optionale Bildabfrage, Belegwechselkurse und Plattformskripte haben eigene Netzgrenzen auf der [Datenschutzseite](https://abox.tools/de/datenschutz/). Die Teilen-Seite erklärt die Sichtbarkeit für den Dienst.

Direkt heißt auch gegenseitig: Jeder Browser erfährt die Netzadresse des anderen, wie bei einem Telefonat. Die lesende Seite erfährt das, bevor irgendeine Verbindung existiert, und verbindet sich nur durch eigene Entscheidung.

## Im selben WLAN oder Ethernet teilen

Lokalnetz ist standardmäßig aus. Wählen Sie vor dem Start *Lokales Netzwerk ohne Internet-Relay*, hängen die Datei an und lassen Privat an für einzelne Leserfreigaben. Auffindbar ist voreingestellt. Öffnen Sie am zweiten Gerät die Werkzeugseite, prüfen Sie unter *Verfügbare Verbindungen* den Verbindungstyp und wählen Sie Beitreten neben dem Namen. Dies öffnet einen Leser-Tab und startet die Anfrage. Private Freigaben warten auf Ihre Zustimmung. Schalten Sie Auffindbar vor dem Start aus für reine Linkfreigabe. Beide brauchen dasselbe WLAN oder Ethernet. Es gelten weiter 200 MB pro Datei und Leser wählen Downloads selbst.

Die Liste gruppiert nach öffentlicher IPv4-Adresse oder IPv6-Subnetz, die der Vermittler sieht. Meist ist das ein Router, aber geteilte VPNs oder Provideradressen können andere Netze einschließen. Gemischtes IPv4/IPv6 oder andere Routen können Nachbargeräte verbergen. Lassen Sie Privat in geteilten Netzen an. Listennamen sind für die Gruppe sichtbar und beweisen weder Raum noch Gebäude. Internet ist nötig. Ohne Entdeckung funktioniert der kopierte Link weiterhin.

Der Link trägt die Einstellung als `?local=1#brave-otter-42`. Nennen Sie beim Aussprechen auch Lokalnetz. `#brave-otter-42` allein verlangt normalen Modus. Bei verschiedenem Leser- und Teilermodus erklärt die Seite es und fragt vor dem Versuch mit dem Teilermodus nach der Wahl.

Lokaler Modus nutzt keinen öffentlichen Adressentdeckungsserver und bietet kein Internet-Relay. Der Vermittler braucht weiterhin Internet. Gäste-WLAN isoliert möglicherweise Geräte; Firewalls, VPNs und Browserrichtlinien können Verbindungen blockieren oder umleiten. Der Modus steuert die Direktwegsuche und beweist keine Begrenzung auf ein Gebäude.

## Der Name ist die Adresse, Privat entscheidet über den Zugang

Ein Freigabe-Link unterscheidet sich von jedem anderen in einem praktischen Punkt: Er übersteht das Aussprechen. `brave-otter-42` lässt sich durch einen Raum rufen, am Telefon vorlesen oder von einer Tafel abschreiben und am anderen Ende eintippen, ohne dass jemandem die Daumen ausgehen. Genau dafür sehen die Namen so aus, wie sie aussehen.

Wer einen aktiven Namen kennt oder errät, kann die Freigabe öffnen. Eine auffindbare lokale Freigabe listet ihn für Browser derselben öffentlichen IPv4-Adresse oder IPv6-Subnetzes. Innerhalb der Gruppe ist er öffentlich. Für Sensibles lassen Sie die Voreinstellung. Freigaben sind *privat*, bis Sie das Häkchen entfernen. Jeder Leser stellt sich vor und Sie entscheiden einzeln. Die Vorstellung reist verschlüsselt direkt. Nicht einmal der Vermittler erfährt, wer fragt.

![Die Linknamenkarte zeigt thursday-notes sowie Schalter für privat und einmalig.](https://abox.tools/screens/share-text-between-devices/name.webp)

Der Name ist die ganze Adresse. Privat heißt, dass jeder Lesende fragen muss und Sie ihn hereinlassen; einmalig heißt, dass auch auf diesem Gerät kein Entwurf bleibt.

## Was das Schließen des Tabs wirklich beendet

Die Freigabe lebt im teilenden Tab und nirgendwo sonst, deshalb ist das Schließen dieses Tabs die Löschung — kein Antrag auf eine. Der Link stirbt binnen ein, zwei Sekunden, und Leser, die noch auf die Freigabe schauen, sehen ihre Seite leer werden. Es gibt keine Serverkopie mit eigenem Lebenszyklus, keinen Papierkorb, keine dreißigtägige Aufbewahrung. Der Entwurf, den Sie getippt haben, bleibt in Ihrem eigenen Browser, damit er beim nächsten Mal da ist, und selbst das lässt sich mit der Einmalig-Einstellung abschalten.

Was es nicht beendet, ist Besitz. Ein Leser, der den Text kopiert oder die Datei heruntergeladen hat, solange die Freigabe offen war, hat sie — genau als hätten Sie sie ihm auf jedem anderen Weg gegeben. Kein Werkzeug kann zurückholen, und eines, das es behauptete, würde Sie über den Rechner eines anderen belügen. Das Beenden regelt die Zukunft — niemand Neues, nichts weiter —, und das ist der Teil, den ein Dienst mit gespeicherter Kopie Ihnen nicht geben kann.

## Ein Online-Vorstellungsgespräch ist der Idealfall

Ein Übergabe-Werkzeug will beide Seiten anwesend, und ein Vorstellungsgespräch ist der eine Termin, bei dem Anwesenheit garantiert ist: Sie sehen einander bereits. Es ist zugleich der Moment, in dem die speichernden Wege am teuersten sind. Was durch den Meeting-Chat geht, landet im Protokoll der Plattform, hängt an der Aufzeichnung und an jedem, dem sie später geschickt wird; und wer bei geteiltem Bildschirm ein Postfach oder eine Chat-App öffnet, um einen Link zu holen, legt seine Korrespondenz auf die Aufnahme eines anderen. Die Freigabeseite zeigt das Geteilte und sonst nichts.

In der Praxis: der Portfolio-Link, das Repository, das PDF der Hausaufgabe, der Code-Schnipsel, der die typografischen Anführungszeichen des Chatfensters nicht überleben würde — starten Sie die Freigabe vor dem Gespräch, und wenn der Moment kommt, sagen Sie den Namen laut. `brave-otter-42` übersteht einen Sprachanruf unversehrt, genau dafür sind die Namen geformt, und die andere Seite hat die Datei, bevor der Satz zu Ende ist. Privat belassen, macht die Freigabe den Eintritt des Gegenübers zu etwas, das Sie mitten im Gespräch freigeben, statt zu einer offen stehenden Tür; und endet der Anruf, endet mit dem Schließen des Tabs auch die Freigabe — nichts wartet in einem Protokoll darauf, später aus dem Zusammenhang gerissen zu werden.

Eine ehrliche Vorbereitung: Interviewer sitzen öfter als die meisten Leser in strengen Firmennetzen, und genau dort lebt das seltene Paar ohne direkten Pfad. Deren Netz lässt sich von zu Hause nicht testen — aber das Werkzeug meldet das Scheitern binnen zwanzig Sekunden, statt zu hängen, und so kostet der Ausweichweg Augenblicke, nicht das Gespräch.

## Wann dies das falsche Werkzeug ist

Beide Seiten müssen gleichzeitig anwesend sein, und die Freigabeseite muss offen bleiben. Teilen braucht eine Verbindung; nur der Editor funktioniert offline. Wenn Direct an einem Mobilfunk- oder Firmennetz scheitert, kann der Host die Freigabe beenden und mit Cloud relay neu beginnen. Er sendet dann die neue Einladung, deren Verbindungswahl der Leser vor dem Verbinden bestätigt. Der lokale Direct-Modus verwendet kein Relay. Schlafende Browser und Unternehmensrichtlinien können auch eine Relay-Verbindung unterbrechen.

Für alles andere — die Notiz, das Passwort, die Konfigurationsdatei, das 100-MB-Video, das einen WLAN-Sprung entfernt ist — ist der direkte Weg schneller, einfacher, und hinterlässt die Welt genau so, wie er sie vorgefunden hat.
