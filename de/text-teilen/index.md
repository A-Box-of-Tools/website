# Text & Dateien teilen — direkt von Ihrem Browser in ihren, ohne Upload

Die Freigabe lebt in diesem offenen Tab. Leser holen sie verschlüsselt direkt aus Ihrem Browser, und mit dem Schließen des Tabs endet sie - auf keinem Server ist irgendetwas gespeichert.

> Text oder Dateien über eine direkte, verschlüsselte Verbindung von einem Browser in einen anderen schicken. Ein aussprechbarer Link-Name, Live-Aktualisierung beim Tippen, Freigabe pro Leser - und niemals etwas auf einem Server. Kostenlos, ohne Anmeldung.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/text-teilen/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre geteilte Texte und Dateien werden **nie hochgeladen**. Es gibt keinen Server.

Was Sie hier teilen, wandert über einen Ende-zu-Ende-verschlüsselten WebRTC-Kanal von Ihrem Browser in den jedes Lesers, und nirgendwohin sonst. Der eine beteiligte Server — in der `Content-Security-Policy` dieser Seite benannt, Quelltext im Repository — stellt die Browser einander vor und listet auffindbare lokale Link-Namen. Er hält weder geteilten Text noch Dateien; der Inhalt läuft nie durch ihn. Die Namen in der Suche bestehen nur, solange der Teilende verbunden ist. Es gibt keinen Inhaltsverlauf und kein Konto. Schließen Sie diesen Tab, endet die Freigabe überall zugleich, auch auf den offenen Seiten der Leser.

- ✗ Nichts gespeichert
- ✗ Kein Konto
- ✓ Ende-zu-Ende-verschlüsselt
- ✓ Endet mit Ihrem Tab
- ✓ Open Source

## So teilen Sie Text und Dateien, ohne sie irgendwohin hochzuladen

1. **Schreiben Sie den Text, oder hängen Sie die Dateien an.** Der Editor ist die Freigabe: Was darin steht, wenn ein Leser sich verbindet, ist das, was er bekommt, und alles danach erreicht verbundene Leser live, während Sie tippen. Dateien reisen über denselben Kanal, bis 200 MB pro Stück; Leser sehen die Liste und holen nur, was sie anfordern — niemandes Bandbreite wird für eine Datei verbraucht, die er nicht wollte.
2. **Schalten Sie Markdown ein, wenn der Text Formatierung verdient.** Ein Schalter. Überschriften, Fettdruck, Listen, Code und Links erscheinen beim Tippen live gerendert neben dem Editor, und Leser bekommen standardmäßig die formatierte Ansicht, mit einem Umschalter zurück zum Quelltext. Der Renderer wird mit dieser Seite ausgeliefert und maskiert alles: Geteilter Text kann auf dem Rechner eines Lesers nicht zu Skript werden, egal wer ihn geschrieben hat.
3. **Benennen Sie den Link, oder behalten Sie den Vorschlag.** Der Name ist die Adresse: `brave-otter-42` lässt sich durch einen Raum rufen, am Telefon vorlesen oder von einer Tafel abtippen. Auffindbare lokale Freigaben listen ihren Namen, daher sollte Privat für sensible Inhalte an bleiben. Für eine Freigabe nur per Link ist auch ein unerratbarer Name hilfreich. Ein bereits aktiv genutzter Name wird abgelehnt und wird frei, sobald Sie aufhören.
4. **Entscheiden Sie, wer hineinkommt.** Privat ist die Voreinstellung: Jeder Leser wird gebeten, sich vorzustellen — ein Name, ein Hinweis, irgendetwas, das Sie wiedererkennen —, und Sie sehen die Nachricht mit einem Knopf, ihn lesen zu lassen oder abzuweisen. Die Vorstellung reist über den Direktkanal, nicht einmal der Vermittler erfährt also, wer gefragt hat. Abgehakt wird daraus eine offene Freigabe, die jeder mit dem Namen lesen kann.
5. **Starten Sie die Freigabe, und lassen Sie den Tab offen.** Der Tab ist der Server: Die Freigabe ist erreichbar, solange er offen und wach ist, und keinen Moment länger. Auch ein zugeklappter Laptop beendet sie. Kopieren Sie den Link, oder sagen Sie einfach den Namen — ein Leser kann ihn als `#name` ans Ende der Adresse dieser Seite tippen. Kopieren Sie für den Modus Lokales Netzwerk den Link: Er enthält `?local=1` vor dem Namen. Ein Leser mit einem anderen Modus wird gefragt, bevor er es mit Ihrem Modus erneut versucht.
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

Kein Text und keine Datei werden hochgeladen. Sie reisen direkt über einen verschlüsselten WebRTC-Kanal von Ihrem Browser in den jedes Lesers. Der Server trägt die Vorstellung und veröffentlichte lokale Link-Namen, niemals den Inhalt. Räume und Sucheinträge enden mit ihren offenen Verbindungen. Cloudflares siebentägige Verbindungsprotokolle enthalten Metadaten, niemals eine Nutzlast.

### Warum spricht dieses Werkzeug überhaupt mit einem Server, ausgerechnet auf dieser Website?

Weil zwei Browser einander nicht allein finden: Der Vermittler verbindet die Person, die `brave-otter-42` eingegeben hat, mit der, die darunter teilt, und trägt den Verbindungsaufbau. Er ist in der `Content-Security-Policy` dieser Seite benannt, und sein Quelltext liegt im selben Repository. Er zeigt auch veröffentlichte lokale Link-Namen für Browser mit derselben öffentlichen IPv4-Adresse oder im selben IPv6-Subnetz. Er hält keinen Inhalt und kann den verschlüsselten Peer-Kanal nicht lesen.

### Was genau kann dieser Server sehen?

Er sieht genutzte Link-Namen, wann Teilende und Leser kommen und gehen, ihre IP-Adressen und den Verbindungsaufbau. Die Suche gruppiert veröffentlichte Namen nach öffentlicher IPv4-Adresse oder IPv6-Subnetz sowie Seitenherkunft. Er sieht keinen Text, keine Dateien oder deren Namen und Größen, keine private Zulassung und keine Vorstellung. All das reist über den Ende-zu-Ende-verschlüsselten Peer-Kanal. Cloudflare hält Verbindungsprotokolle sieben Tage vor: Link-Name, Adresse und Zeit, niemals eine Nutzlast.

### Was passiert, wenn ich den Tab schließe?

Die Freigabe endet überall zugleich. Der Link hört binnen ein, zwei Sekunden auf zu funktionieren, und Leser, die die Seite noch offen haben, sehen ihre Kopie verschwinden, mit dem Hinweis, dass die Freigabe beendet wurde. Das ist keine Löschanfrage an einen Server — es gibt keine Serverkopie zu löschen. Der Tab war der einzige Ort, an dem die Freigabe existierte, und ihn zu schließen ist das ganze Aufräumen.

### Kann ein Leser behalten, was ich geteilt habe?

Solange die Freigabe offen ist, ja — das ist es, was Teilen heißt. Ein Leser kann den Text kopieren oder eine Datei herunterladen, und was er genommen hat, gehört ihm, genau als hätten Sie es ihm auf jedem anderen Weg gegeben. Was das Beenden garantiert, ist die Zukunft: Niemand Neues kommt heran, und offene Seiten zeigen es nicht mehr. Kein Werkzeug kann zurückholen, was schon angekommen ist, und diese Seite behauptet es auch nicht.

### Was ist der Privat-Modus?

Die Voreinstellung. Jeder ankommende Leser erfährt, dass die Freigabe privat ist, und wird gebeten, sich vorzustellen; Sie sehen die Nachricht — „hier ist Alice aus dem Standup“ — mit Knöpfen, ihn lesen zu lassen oder abzuweisen, und nichts wird gesendet, bevor Sie entscheiden. Die Vorstellung reist über den ohnehin verschlüsselten Direktkanal, der Server erfährt also nie, wer gefragt hat oder was Sie entschieden haben. Vor dem Teilen abgehakt, wird daraus eine offene Freigabe.

### Warum sieht der Leser meine IP-Adresse?

Weil die Verbindung wirklich direkt ist, und eine Direktverbindung zwischen zwei Adressen besteht — jedes Ende erfährt notwendigerweise das andere, wie bei einem Telefonat. Der Leser wird gewarnt, bevor irgendeine Verbindung existiert, und verbindet sich nur durch eigene Entscheidung; bis dahin haben Sie nicht einmal erfahren, dass er den Link geöffnet hat. Wenn dieser Tausch für eine bestimmte Freigabe falsch ist, ist ein Dienst, der über einen Server weiterleitet, die Alternative — mit dem umgekehrten Tausch.

### Wie groß dürfen die Dateien sein, und wie schnell ist es?

Bis 200 MB pro Datei, jeder Typ, und so schnell wie die langsamere der beiden Verbindungen. Eine funktionierende lokale Verbindung überträgt mit der Geschwindigkeit dieses Netzes; VPNs und Browser-Routing können den Weg beeinflussen. Leser holen jede Datei auf Anforderung, sodass eine große angehängte Datei erst übertragen wird, wenn jemand sie anfordert.

### Funktioniert es offline?

Ehrlich gesagt: zur Hälfte. Der Editor ja — die Seite lädt, Ihr Entwurf ist da, Markdown rendert, Schreiben und Speichern gehen ganz ohne Netz. Das Teilen nicht, und das kann es nicht: Den Browser eines anderen Menschen zu erreichen ist ein Netzvorgang, und die Vorstellung braucht den Vermittler. Dies ist das eine Werkzeug dieser Website, dessen Aufgabe offline unmöglich ist, und etwas anderes anzudeuten wäre unehrlich.

### Was, wenn wir keine Verbindung bekommen?

Das folgende Relais-Angebot gilt nur für den normalen Verbindungsmodus. Die meisten Browserpaare erreichen einander direkt, sobald sie vorgestellt sind; eine Minderheit nicht, typischerweise wenn eine Seite im Mobilfunknetz eines Anbieters mit geteilten Adressen oder hinter einem strengen Firmennetz sitzt. Diese Seite wechselt nie stillschweigend auf ein Relais — das würde ändern, was dieses Werkzeug ist, ohne es zu sagen —, sondern sagt nach zwanzig Sekunden klar, dass keine Direktverbindung zustande kam, und bietet dem Leser eines an: ein von Cloudflare betriebenes Relais, das die verschlüsselten Bytes zwischen den beiden Browsern weiterreicht und sie nicht lesen kann, weil der Schlüssel die beiden Enden nie verlässt. Der Leser wählt es ausdrücklich, auf seiner eigenen Seite, nachdem ihm gesagt wurde, was es sieht — beide Adressen, wie die Direktverbindung auch —, und gespeichert wird auch dort nichts. Ihre Seite der Freigabe ändert sich nicht: Ihr Browser sendet weiterhin an diesen einen Leser, so wie er es täte, säße der Leser hinter einem VPN. Der Modus Lokales Netzwerk bietet nie ein Relais an. Prüfen Sie, ob beide Geräte dasselbe WLAN oder Ethernet-Netz nutzen und ob die Geräteisolierung im Gastnetz, eine Firewall oder ein VPN die Verbindung blockiert.

### Ist das Markdown-Rendern sicher, wenn jeder alles teilen kann?

Diese Frage ist der Grund, warum der Renderer achtzig Zeilen im Quelltext dieser Seite ist und keine Bibliothek. Jedes Zeichen wird maskiert, bevor irgendein Tag ausgegeben wird, nur ein fester Satz harmloser Tags kann entstehen, und Links akzeptieren nur `http`, `https` und `mailto` — ein `javascript:`-Link bleibt lebloser Text. Geteilter Text kann auf Ihrem Rechner nicht zu Skript werden, egal wer ihn geschrieben hat, und die achtzig Zeilen können Sie lesen.

### Können zwei Leute unter demselben Namen teilen?

Nicht gleichzeitig. Eine lebende Freigabe pro Name, durchgesetzt beim Vermittler: Wer als Zweiter kommt, wird abgelehnt und um einen anderen Namen gebeten. Sobald eine Freigabe endet, ist ihr Name wieder frei — was auch heißt, dass ein aufgehobener Link nur so frisch ist wie die Freigabe dahinter: Derselbe Name kann nächste Woche jemand anderem gehören. Behandeln Sie einen Link als etwas, das zu einem Moment gehört, nicht zu einer Person.

### Ist es kostenlos, und brauche ich ein Konto?

Kostenlos, kein Konto, keine Anmeldung, und keine Grenze, die der Rede wert wäre — sechzehn gleichzeitige Leser pro Freigabe. Die Website trägt Werbung, die sie bezahlt; die Anzeigen bekommen nichts über das, was diese Seite teilt, und der Vermittler läuft bequem in einem kostenlosen Tarif, gerade weil er nichts speichert und fast nichts tut.

### Kann ich Dateien über mein lokales Netzwerk teilen?

Ja. Wählen Sie vor dem Start Lokales Netzwerk — kein Internet-Relais, verbinden Sie beide Geräte mit demselben WLAN oder Ethernet-Netz und kopieren Sie den Link für den Leser. Der Link enthält den Modus; ein Leser mit einem anderen Modus muss ausdrücklich wählen, bevor er es mit dem Modus des Teilenden erneut versucht. Internet bleibt für die Vermittlung zwischen den Browsern nötig. Dieser Modus nutzt keine öffentliche Adressermittlung und wechselt nie auf ein Internet-Relais. Ein VPN oder Browser-Netzwerkrichtlinien können den Weg ändern oder die Verbindung verhindern; die Einstellung beweist nicht, dass Bytes in einem Gebäude bleiben. Private Freigabe bleibt die Voreinstellung, und Dateien sind weiterhin auf 200 MB pro Stück begrenzt. Eine Freigabe kann bis zu 256 Dateien enthalten. Auffindbar ist in diesem Modus standardmäßig an: Der andere Browser kann die Startseite öffnen und Ihren Namen aus der Liste an diesem Anschluss wählen. Schalten Sie Auffindbar aus, um nur per Link zu teilen. Lassen Sie Privat in gemeinsam genutzten Netzen an.

### Wie findet die Liste lokale Freigaben?

Diese Liste zeigt Link-Namen von Browsern mit derselben öffentlichen IPv4-Adresse oder im selben IPv6-Subnetz. Meist bedeutet das denselben Router; ein gemeinsames VPN oder eine vom Internetanbieter geteilte Adresse kann andere Netze einschließen. IPv4- und IPv6-Verbindungen oder andere Routen können Geräte in der Nähe ausblenden. Internet ist erforderlich. Beim Öffnen einer Freigabe wird vor dem Verbinden gefragt; private Freigaben brauchen weiterhin die Zustimmung des Teilenden. Lokale Freigaben werden standardmäßig veröffentlicht; schalten Sie Auffindbar aus, um nur per Link zu teilen. Das Wählen eines Namens öffnet die Zustimmungsseite und stellt nie automatisch eine Verbindung her oder umgeht die private Freigabe. Die Suche hält nur Link-Namen, solange der Teilende verbunden ist, niemals Text, Dateinamen oder Dateiinhalte. Ist die Suche nicht verfügbar, funktioniert der Freigabe-Link weiterhin. In der Liste erscheinen nur Freigaben im Modus Lokales Netzwerk. Wählen Sie ihn vor dem Start; er ist standardmäßig aus.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Der Inhalt geht zu Ihrem Leser, und nirgendwohin sonst.** Text und Dateien reisen über einen WebRTC-Datenkanal: eine direkte, DTLS-verschlüsselte Verbindung zwischen Ihrem Browser und dem jedes Lesers. In diesem Weg steht kein Server. Der Modus Lokales Netzwerk nutzt die eigenen Netzwerkadressen der Browser ohne öffentliche Adressermittlung oder Internet-Relais. Ein VPN oder die Netzwerkrichtlinien des Browsers können den Weg dieser Adressen beeinflussen; das ist keine Garantie für ein bestimmtes Gebäude. Im normalen Modus kann ein direkt nicht erreichbarer Leser auf seiner Seite ein verschlüsseltes Relais wählen, das denselben Chiffretext weiterreicht und nicht lesen kann.
- **Was der Vermittler ist, und alles, was er sieht.** Eine Direktverbindung braucht eine Vorstellung. Diese Startseite öffnet automatisch einen WebSocket zum Vermittler für auffindbare lokale Link-Namen; das Starten einer Freigabe öffnet einen weiteren für die Freigabe selbst. Ein Leser nutzt einen Vermittlungssocket. Der Server bringt den Leser mit dem Teilenden unter dem Link-Namen zusammen und reicht einige Kilobyte Verbindungsaushandlung weiter. Er schreibt keinen Speicher; Räume und Sucheinträge enden mit ihren offenen Verbindungen. Er sieht Namen, Verbindungszeiten, IP-Adressen und Verbindungsaufbau, aber keinen Text, keine Dateien, keine Zulassungsentscheidung und keine private Vorstellung. Die Suche zeigt nur Namen verbundener Teilender mit derselben öffentlichen IPv4-Adresse oder im selben IPv6-Subnetz. Gemeinsame VPNs oder vom Anbieter geteilte Adressen können andere Netze einschließen; Geräte in der Nähe mit IPv4- und IPv6-Verbindungen oder anderen Routen fehlen möglicherweise. Der vollständige Quelltext liegt im Repository. Cloudflare hält Verbindungsprotokolle sieben Tage vor: Adresse, Link-Name und Zeit, niemals eine Nutzlast.
- **Nichts ist gespeichert - das Schließen des Tabs ist die Löschung.** Die Freigabe existiert nur, solange Ihr Tab offen ist. Schließen Sie ihn, finden neue Leser nichts mehr, und wer gerade liest, sieht seine Kopie verschwinden — wobei das, was jemand vorher kopiert oder heruntergeladen hat, ihm gehört, wie bei allem, das Sie jemandem in die Hand gegeben haben. Der Entwurf, den Sie tippen, liegt im Speicher Ihres eigenen Browsers, damit er beim nächsten Mal noch da ist, und nur dort; als einmalig markiert liegt er nirgendwo.
- **Der Link-Name ist eine Adresse, und Privat ist das Schloss.** Wer einen Namen kennt oder errät, kann die Freigabe dahinter öffnen. Auffindbare lokale Freigaben zeigen ihren Namen anderen Browsern mit derselben öffentlichen IPv4-Adresse oder im selben IPv6-Subnetz. Der Name ist dann innerhalb dieser Gruppe öffentlich. Lassen Sie Privat für alles Sensible an. Es ist standardmäßig aktiv: Jeder Leser stellt sich über den verschlüsselten Peer-Kanal vor, und nichts wird gesendet, bevor Sie ihn einlassen.
- **Eine Direktverbindung zeigt jeder Seite die Adresse der anderen.** Das ist es, was Peer-to-Peer bedeutet, und der Leser erfährt es, bevor es passiert: Das Öffnen eines Freigabe-Links fragt nur beim Vermittler nach, ob jemand teilt; dann sagt die Seite klar, dass eine Direktverbindung beiden Seiten die IP-Adresse der jeweils anderen zeigt, und wartet auf einen Klick. Bis zu diesem Klick hat der Teilende nicht einmal erfahren, dass der Leser existiert.
- **Was Google lädt, und was es nicht bekommt.** Die Werbe- und Messskripte kommen von Google, der Spenden-Button von Buy Me a Coffee. Keines davon bekommt den Text, die Dateien, ihre Namen oder Größen oder wer sich verbunden hat. Die Ausnahme ist die Adresse dieser Seite selbst: der Link eines Lesers trägt den Link-Namen, und das Werbeskript liest die Adresse. Eine Freigabe, die für sich bleiben soll, will den Privat-Schalter. Jede Zeile, die den Inhalt berührt, wird von dieser Adresse ausgeliefert und steht im Repository.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy , `src/main.js` für beide Hälften des Austauschs — der Tab des Teilenden und der des Lesers sind dieselbe Datei — und `src/markdown.js` für den Renderer, der auf Text von der anderen Seite der Leitung läuft und deshalb alles maskiert, bevor er irgendetwas ausgibt. Der vollständige Quelltext des Servers ist `workers/rendezvous/worker.js` im selben Repository: ein Raum pro Link-Name, der nichts hält als die offenen Verbindungen. Die zusätzliche Suche hält nur veröffentlichte Link-Namen an offenen Verbindungen, niemals Text oder Dateien.
