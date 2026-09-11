# Text & Dateien teilen — direkt von Ihrem Browser in ihren, ohne Upload

Die Freigabe lebt in diesem offenen Tab. Leser holen sie verschlüsselt direkt aus Ihrem Browser, und mit dem Schließen des Tabs endet sie - auf keinem Server ist irgendetwas gespeichert.

> Text oder Dateien über eine direkte, verschlüsselte Verbindung von einem Browser in einen anderen schicken. Ein aussprechbarer Link-Name, Live-Aktualisierung beim Tippen, Freigabe pro Leser - und niemals etwas auf einem Server. Kostenlos, ohne Anmeldung.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/text-teilen/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre geteilte Texte und Dateien werden **nie hochgeladen**. Es gibt keinen Server.

Was Sie hier teilen, wandert über einen Ende-zu-Ende-verschlüsselten WebRTC-Kanal von Ihrem Browser in den jedes Lesers, und nirgendwohin sonst. Der eine beteiligte Server — in der `Content-Security-Policy` dieser Seite benannt, Quelltext im Repository — stellt die beiden Browser einander vor und tritt dann beiseite: Er speichert nichts, und der Inhalt läuft nie durch ihn hindurch. Es gibt keinen Verlauf und kein Konto. Schließen Sie diesen Tab, endet die Freigabe überall zugleich, auch auf den offenen Seiten der Leser.

- ✗ Nichts gespeichert
- ✗ Kein Konto
- ✓ Ende-zu-Ende-verschlüsselt
- ✓ Endet mit Ihrem Tab
- ✓ Open Source

## So teilen Sie Text und Dateien, ohne sie irgendwohin hochzuladen

1. **Schreiben Sie den Text, oder hängen Sie die Dateien an.** Der Editor ist die Freigabe: Was darin steht, wenn ein Leser sich verbindet, ist das, was er bekommt, und alles danach erreicht verbundene Leser live, während Sie tippen. Dateien reisen über denselben Kanal, bis 200 MB pro Stück; Leser sehen die Liste und holen nur, was sie anfordern — niemandes Bandbreite wird für eine Datei verbraucht, die er nicht wollte.
2. **Schalten Sie Markdown ein, wenn der Text Formatierung verdient.** Ein Schalter. Überschriften, Fettdruck, Listen, Code und Links erscheinen beim Tippen live gerendert neben dem Editor, und Leser bekommen standardmäßig die formatierte Ansicht, mit einem Umschalter zurück zum Quelltext. Der Renderer wird mit dieser Seite ausgeliefert und maskiert alles: Geteilter Text kann auf dem Rechner eines Lesers nicht zu Skript werden, egal wer ihn geschrieben hat.
3. **Benennen Sie den Link, oder behalten Sie den Vorschlag.** Der Name ist die Adresse: `brave-otter-42` lässt sich durch einen Raum rufen, am Telefon vorlesen oder von einer Tafel abtippen. Er ist auch das einzige Geheimnis — wählen Sie für alles Private entweder einen Namen, den niemand erraten würde, oder verlassen Sie sich auf den Privat-Schalter. Ein Name, unter dem gerade jemand anderes teilt, wird abgelehnt, und Ihrer wird frei, sobald Sie aufhören.
4. **Entscheiden Sie, wer hineinkommt.** Privat ist die Voreinstellung: Jeder Leser wird gebeten, sich vorzustellen — ein Name, ein Hinweis, irgendetwas, das Sie wiedererkennen —, und Sie sehen die Nachricht mit einem Knopf, ihn lesen zu lassen oder abzuweisen. Die Vorstellung reist über den Direktkanal, nicht einmal der Vermittler erfährt also, wer gefragt hat. Abgehakt wird daraus eine offene Freigabe, die jeder mit dem Namen lesen kann.
5. **Starten Sie die Freigabe, und lassen Sie den Tab offen.** Der Tab ist der Server: Die Freigabe ist erreichbar, solange er offen und wach ist, und keinen Moment länger. Auch ein zugeklappter Laptop beendet sie. Kopieren Sie den Link, oder sagen Sie einfach den Namen — ein Leser kann ihn als `#name` ans Ende der Adresse dieser Seite tippen.
6. **Auf der anderen Seite: erst zustimmen, dann anklopfen.** Wer den Link öffnet, erfährt, dass jemand teilt, wird gewarnt, dass eine Direktverbindung beiden Seiten die Netzadresse der anderen zeigt, und verbindet sich nur durch eigene Entscheidung. Bei einer privaten Freigabe stellt er sich vor und wartet auf Sie. Was er bekommt, aktualisiert sich live, während Sie schreiben, und verschwindet, wenn Sie den Tab schließen.

## Die ausführliche Fassung

[So teilen Sie Text und Dateien zwischen Geräten, ohne sie hochzuladen](https://abox.tools/de/ratgeber/text-zwischen-geraeten-teilen/): Text oder Dateien über eine direkte, verschlüsselte Verbindung von einem Browser in einen anderen bringen - ohne Mail an sich selbst, ohne Chatverlauf, ohne Konto, und ohne dass ein Server eine Kopie behält.

## Auch im Werkzeugkasten

- [QR- & Barcode-Generator](https://abox.tools/de/qr-code-erstellen/): Eintippen, und es wird ein Code. Zum Erzeugen wird nichts gesendet.
- [QR- & Barcode-Scanner](https://abox.tools/de/qr-code-scannen/): Halten Sie die Kamera drauf oder legen Sie ein Bild ab. Gelesen wird es hier und nirgendwo sonst.
- [Hash & Prüfsumme](https://abox.tools/de/pruefsumme-berechnen/): Einen Download gegen die Zahl prüfen, die der Anbieter veröffentlicht hat. Ohne sie jemandem zu schicken.
- [Passwort- & Passphrasen-Generator](https://abox.tools/de/passwort-generator/): Hier erzeugt, von Ihrem eigenen Browser, und nirgendwohin gesendet. Nichts wird gespeichert, es gibt keinen Verlauf.

## Fragen

### Wird irgendetwas hochgeladen, irgendwohin?

Nein. Text und Dateien wandern über einen verschlüsselten WebRTC-Kanal direkt von Ihrem Browser in den jedes Lesers. Der eine beteiligte Server trägt die Vorstellung — ein paar Kilobyte Verbindungsaushandlung — und nie den Inhalt. Auf ihm gibt es nichts zu erbeuten, anzufordern oder zu verlieren: Er hält kein Byte von Ihnen, und ein Raum hört auf zu existieren, sobald Sie die Verbindung trennen.

### Warum spricht dieses Werkzeug überhaupt mit einem Server, ausgerechnet auf dieser Website?

Weil zwei Browser einander nicht allein finden können: Irgendetwas muss die Person, die `brave-otter-42` eingetippt hat, mit der zusammenbringen, die darunter teilt, und das Verbindungsangebot zwischen ihnen übertragen. Dieses Etwas ist der Vermittler, die eine Netzabhängigkeit dieser Seite, benannt in ihrer `Content-Security-Policy` und veröffentlicht im selben Repository wie die Seite selbst. Er ist der kleinste Server, der die Aufgabe erfüllen könnte — er speichert nichts, liest nichts und tritt beiseite, sobald die beiden Browser einen direkten Kanal haben.

### Was genau kann dieser Server sehen?

Dass ein Link-Name in Benutzung ist, wann ein Teilender und Leser sich verbinden und gehen, ihre IP-Adressen und den Aufbau der verschlüsselten Verbindung, den sie austauschen. Nicht den Text, nicht die Dateien, nicht deren Namen oder Größen, nicht, wer bei einer privaten Freigabe eingelassen wurde, und nicht, was jemand in einer Vorstellung geschrieben hat — all das reist über den Ende-zu-Ende-verschlüsselten Direktkanal, der nicht durch den Server läuft. Cloudflare, das den Server betreibt, führt sieben Tage lang ein Protokoll jeder Verbindung: den Link-Namen, die Adresse und die Uhrzeit. Sonst überdauert nichts die Freigabe.

### Was passiert, wenn ich den Tab schließe?

Die Freigabe endet überall zugleich. Der Link hört binnen ein, zwei Sekunden auf zu funktionieren, und Leser, die die Seite noch offen haben, sehen ihre Kopie verschwinden, mit dem Hinweis, dass die Freigabe beendet wurde. Das ist keine Löschanfrage an einen Server — es gibt keine Serverkopie zu löschen. Der Tab war der einzige Ort, an dem die Freigabe existierte, und ihn zu schließen ist das ganze Aufräumen.

### Kann ein Leser behalten, was ich geteilt habe?

Solange die Freigabe offen ist, ja — das ist es, was Teilen heißt. Ein Leser kann den Text kopieren oder eine Datei herunterladen, und was er genommen hat, gehört ihm, genau als hätten Sie es ihm auf jedem anderen Weg gegeben. Was das Beenden garantiert, ist die Zukunft: Niemand Neues kommt heran, und offene Seiten zeigen es nicht mehr. Kein Werkzeug kann zurückholen, was schon angekommen ist, und diese Seite behauptet es auch nicht.

### Was ist der Privat-Modus?

Die Voreinstellung. Jeder ankommende Leser erfährt, dass die Freigabe privat ist, und wird gebeten, sich vorzustellen; Sie sehen die Nachricht — „hier ist Alice aus dem Standup“ — mit Knöpfen, ihn lesen zu lassen oder abzuweisen, und nichts wird gesendet, bevor Sie entscheiden. Die Vorstellung reist über den ohnehin verschlüsselten Direktkanal, der Server erfährt also nie, wer gefragt hat oder was Sie entschieden haben. Vor dem Teilen abgehakt, wird daraus eine offene Freigabe.

### Warum sieht der Leser meine IP-Adresse?

Weil die Verbindung wirklich direkt ist, und eine Direktverbindung zwischen zwei Adressen besteht — jedes Ende erfährt notwendigerweise das andere, wie bei einem Telefonat. Der Leser wird gewarnt, bevor irgendeine Verbindung existiert, und verbindet sich nur durch eigene Entscheidung; bis dahin haben Sie nicht einmal erfahren, dass er den Link geöffnet hat. Wenn dieser Tausch für eine bestimmte Freigabe falsch ist, ist ein Dienst, der über einen Server weiterleitet, die Alternative — mit dem umgekehrten Tausch.

### Wie groß dürfen die Dateien sein, und wie schnell ist es?

Bis 200 MB pro Datei, jeder Typ, und so schnell wie die langsamere der beiden Verbindungen — kein Server in der Mitte bremst oder deckelt. Zwei Rechner im selben WLAN übertragen mit lokaler Geschwindigkeit, und die Bytes verlassen das Gebäude nicht. Leser holen jede Datei auf Anforderung; etwas Großes anzuhängen kostet also nichts, bis jemand wirklich danach fragt.

### Funktioniert es offline?

Ehrlich gesagt: zur Hälfte. Der Editor ja — die Seite lädt, Ihr Entwurf ist da, Markdown rendert, Schreiben und Speichern gehen ganz ohne Netz. Das Teilen nicht, und das kann es nicht: Den Browser eines anderen Menschen zu erreichen ist ein Netzvorgang, und die Vorstellung braucht den Vermittler. Dies ist das eine Werkzeug dieser Website, dessen Aufgabe offline unmöglich ist, und etwas anderes anzudeuten wäre unehrlich.

### Was, wenn wir keine Verbindung bekommen?

Die meisten Browserpaare erreichen einander direkt, sobald sie vorgestellt sind; eine Minderheit nicht, typischerweise wenn eine Seite im Mobilfunknetz eines Anbieters mit geteilten Adressen oder hinter einem strengen Firmennetz sitzt. Diese Seite wechselt nie stillschweigend auf ein Relais — das würde ändern, was dieses Werkzeug ist, ohne es zu sagen —, sondern sagt nach zwanzig Sekunden klar, dass keine Direktverbindung zustande kam, und bietet dem Leser eines an: ein von Cloudflare betriebenes Relais, das die verschlüsselten Bytes zwischen den beiden Browsern weiterreicht und sie nicht lesen kann, weil der Schlüssel die beiden Enden nie verlässt. Der Leser wählt es ausdrücklich, auf seiner eigenen Seite, nachdem ihm gesagt wurde, was es sieht — beide Adressen, wie die Direktverbindung auch —, und gespeichert wird auch dort nichts. Ihre Seite der Freigabe ändert sich nicht: Ihr Browser sendet weiterhin an diesen einen Leser, so wie er es täte, säße der Leser hinter einem VPN.

### Ist das Markdown-Rendern sicher, wenn jeder alles teilen kann?

Diese Frage ist der Grund, warum der Renderer achtzig Zeilen im Quelltext dieser Seite ist und keine Bibliothek. Jedes Zeichen wird maskiert, bevor irgendein Tag ausgegeben wird, nur ein fester Satz harmloser Tags kann entstehen, und Links akzeptieren nur `http`, `https` und `mailto` — ein `javascript:`-Link bleibt lebloser Text. Geteilter Text kann auf Ihrem Rechner nicht zu Skript werden, egal wer ihn geschrieben hat, und die achtzig Zeilen können Sie lesen.

### Können zwei Leute unter demselben Namen teilen?

Nicht gleichzeitig. Eine lebende Freigabe pro Name, durchgesetzt beim Vermittler: Wer als Zweiter kommt, wird abgelehnt und um einen anderen Namen gebeten. Sobald eine Freigabe endet, ist ihr Name wieder frei — was auch heißt, dass ein aufgehobener Link nur so frisch ist wie die Freigabe dahinter: Derselbe Name kann nächste Woche jemand anderem gehören. Behandeln Sie einen Link als etwas, das zu einem Moment gehört, nicht zu einer Person.

### Ist es kostenlos, und brauche ich ein Konto?

Kostenlos, kein Konto, keine Anmeldung, und keine Grenze, die der Rede wert wäre — sechzehn gleichzeitige Leser pro Freigabe. Die Website trägt Werbung, die sie bezahlt; die Anzeigen bekommen nichts über das, was diese Seite teilt, und der Vermittler läuft bequem in einem kostenlosen Tarif, gerade weil er nichts speichert und fast nichts tut.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Der Inhalt geht zu Ihrem Leser, und nirgendwohin sonst.** Text und Dateien reisen über einen WebRTC-Datenkanal: eine direkte, DTLS-verschlüsselte Verbindung zwischen Ihrem Browser und dem jedes Lesers. In diesem Weg steht kein Server. Im selben Netz verlassen die Bytes nicht einmal das Gebäude — zwei Laptops im selben WLAN tauschen sie lokal aus. Die eine Ausnahme ist ein Leser, dessen Netz direkt nicht zu erreichen ist und der dann auf seiner eigenen Seite ein verschlüsseltes Relais wählt: Es reicht denselben Chiffretext weiter und kann ihn nicht lesen.
- **Was der Vermittler ist, und alles, was er sieht.** Eine Direktverbindung braucht eine Vorstellung, deshalb öffnet diese Seite — als einzige dieser Website — einen WebSocket zu einem eigenen Server. Er bringt die Person, die einen Link-Namen eingetippt hat, mit der zusammen, die darunter teilt, reicht ein paar Kilobyte Verbindungsaushandlung weiter und hält nichts fest: Es wird nie ein Speicher beschrieben, und ein Raum hört auf zu existieren, sobald der Teilende die Verbindung trennt. Er kann sehen, dass ein Name in Benutzung ist, wann jemand kommt und geht, und die IP-Adressen. Er kann nicht sehen: den Text, die Dateien, wer eingelassen wurde oder was jemand geschrieben hat — selbst das Anklopfen bei einer privaten Freigabe reist über den verschlüsselten Direktkanal. Sein vollständiger Quelltext liegt im Repository neben dem dieses Werkzeugs. Was eine Freigabe überdauert, ist eine einzige Sache: Cloudflare, das den Server betreibt, führt sieben Tage lang ein Protokoll jeder Verbindung, mit dem Link-Namen, der Adresse und der Uhrzeit, nie mit einer Nutzlast.
- **Nichts ist gespeichert - das Schließen des Tabs ist die Löschung.** Die Freigabe existiert nur, solange Ihr Tab offen ist. Schließen Sie ihn, finden neue Leser nichts mehr, und wer gerade liest, sieht seine Kopie verschwinden — wobei das, was jemand vorher kopiert oder heruntergeladen hat, ihm gehört, wie bei allem, das Sie jemandem in die Hand gegeben haben. Der Entwurf, den Sie tippen, liegt im Speicher Ihres eigenen Browsers, damit er beim nächsten Mal noch da ist, und nur dort; als einmalig markiert liegt er nirgendwo.
- **Der Link-Name ist das einzige Geheimnis, und der Privat-Schalter das Schloss.** Wer einen Namen kennt oder errät, kann die Freigabe dahinter öffnen. Deshalb sind die Vorschläge drei zufällige Wörter, deshalb verdient alles Heikle einen unerratbaren Namen — oder den Privat-Schalter, der standardmäßig an ist: Jeder ankommende Leser muss sich vorstellen, über den Direktkanal, und nichts wird gesendet, bevor Sie ihn einlassen.
- **Eine Direktverbindung zeigt jeder Seite die Adresse der anderen.** Das ist es, was Peer-to-Peer bedeutet, und der Leser erfährt es, bevor es passiert: Das Öffnen eines Freigabe-Links fragt nur beim Vermittler nach, ob jemand teilt; dann sagt die Seite klar, dass eine Direktverbindung beiden Seiten die IP-Adresse der jeweils anderen zeigt, und wartet auf einen Klick. Bis zu diesem Klick hat der Teilende nicht einmal erfahren, dass der Leser existiert.
- **Was Google lädt, und was es nicht bekommt.** Die Werbe- und Messskripte kommen von Google, der Spenden-Button von Buy Me a Coffee. Keines davon bekommt den Text, die Dateien, ihre Namen oder Größen oder wer sich verbunden hat. Die Ausnahme ist die Adresse dieser Seite selbst: der Link eines Lesers trägt den Link-Namen, und das Werbeskript liest die Adresse. Eine Freigabe, die für sich bleiben soll, will den Privat-Schalter. Jede Zeile, die den Inhalt berührt, wird von dieser Adresse ausgeliefert und steht im Repository.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, `src/main.js` für beide Hälften des Austauschs — der Tab des Teilenden und der des Lesers sind dieselbe Datei — und `src/markdown.js` für den Renderer, der auf Text von der anderen Seite der Leitung läuft und deshalb alles maskiert, bevor er irgendetwas ausgibt. Der vollständige Quelltext des Servers ist `workers/rendezvous/worker.js` im selben Repository: ein Raum pro Link-Name, der nichts hält als die offenen Verbindungen.
