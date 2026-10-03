# Datenschutz & Cookies

Die kurze Fassung: Ihre Dateien werden nie hochgeladen, weil es gar nichts gibt, wohin sie gehen könnten. Alles Weitere auf dieser Seite betrifft die Werbung, den Besuchszähler und das Hosting, also die Teile, an denen andere Unternehmen beteiligt sind.

Zuletzt aktualisiert 3. September 2026

## Ihre Dateien

Jedes Werkzeug auf dieser Seite erledigt seine Arbeit in Ihrem eigenen Browser, auf Ihrer eigenen Hardware. Wenn Sie eine Datei auswählen, wird sie von der Seite gelesen, die Sie ohnehin schon offen haben. An uns gesendet wird sie nicht, denn es gibt gar keinen Server von uns, an den sie gehen könnte. Diese Seite besteht aus statischen Dateien, ohne Backend, ohne Datenbank und ohne Speicher.

Das heißt, wir empfangen, sehen, speichern, protokollieren und verarbeiten niemals:

- Ihre Dateien, ganz oder in Teilen
- Vorschaubilder davon
- ihre Namen, Größen, Abmessungen oder Formate
- wie viele Sie ausgewählt und was Sie damit gemacht haben
- irgendetwas, was daraus gelesen wurde, einschließlich EXIF- und GPS-Daten

Das ist kein Versprechen über unsere Absichten. Jede Seite trägt eine `Content-Security-Policy`, in der jede Adresse steht, die die Seite kontaktieren darf, und durchgesetzt wird sie vom Browser. Keine dieser Adressen gehört uns. Lesen können Sie die Richtlinie oben im Quelltext jeder Seite. Oder Sie öffnen den Netzwerk-Tab Ihres Browsers und sehen zu: Keine einzige Anfrage trägt Ihre Datei.

Dateien, die Sie mit einem Werkzeug erzeugen, werden an den Download-Mechanismus Ihres eigenen Browsers übergeben und dort gespeichert, wo Sie es ihm sagen. Auch an diesem Schritt sind wir nicht beteiligt.

## Die eine Ausnahme, und wo sie gilt

Das Werkzeug [Bilder in Video](https://abox.tools/de/bilder-in-video-umwandeln/) hat eine Funktion „von einer Webadresse hinzufügen“. Fügen Sie dort eine Adresse ein, holt Ihr Browser das Bild von dem Server, den Sie genannt haben, und **dieser Server sieht Ihre IP-Adresse** sowie, welche Datei Sie angefordert haben. Das lässt sich nicht vermeiden und ist das Wesen dieser Funktion.

Es passiert ausschließlich bei Adressen, die Sie selbst eintippen, und es ist so gebaut, dass Bilder hereinkommen, aber keine Daten hinausgehen können. Ausführlicher erklärt das die Seite jenes Werkzeugs. Kein anderes Werkzeug auf dieser Seite kann eine ausgehende Anfrage stellen, in der irgendetwas von Ihnen steckt.

## Was erhoben wird, und von wem

Diese Seite ist kostenlos und wird durch Werbung bezahlt. Das heißt, auf diesen Seiten laufen zwei Google-Produkte, und auf den meisten davon ein Spenden-Button. Hier ist die vollständige Liste.

### Google AdSense: die Werbung

Google liefert die Anzeigen aus und entscheidet, welche Sie sehen. Dazu kann Google Cookies oder ähnliche Kennungen in Ihrem Browser setzen und lesen, und es erhält Ihre IP-Adresse, einen daraus abgeleiteten ungefähren Standort, Ihren User-Agent und die Angabe, auf welcher Seite Sie waren. Je nach Ihren Einstellungen und Ihrem Aufenthaltsort können die Anzeigen anhand eines Profils personalisiert werden, das Google über Sie führt und das größtenteils aus Ihrer Aktivität auf anderen Websites stammt.

Nichts davon erreicht uns, wir können es nicht einsehen, und wir senden Google nie irgendetwas über Ihre Dateien. Googles eigene Darstellung, wie es Daten von Seiten nutzt, die seine Werbung ausspielen, finden Sie unter [policies.google.com/technologies/partner-sites](https://policies.google.com/technologies/partner-sites).

### Google Analytics: der Besuchszähler

Wir nutzen Google Analytics 4, um Seitenaufrufe zu zählen, damit wir wissen, an welchen Werkzeugen zu arbeiten sich lohnt. Erfasst werden die aufgerufene Seite, ungefähr wann, eine zufällig erzeugte Kennung, die in Ihrem Browser gespeichert wird, ein ungefährer Standort, Ihr Geräte- und Browsertyp sowie die Seite, die Sie verwiesen hat.

Es ist so eingerichtet, dass es sonst nichts tut, und die Einrichtung ist eine Datei, die Sie lesen können. `analytics.js` neben jeder Seite richtet einen Seitenaufruf-Zähler ein und enthält überhaupt keine eigenen Ereignisse. Nichts auf dieser Seite übergibt ihm eine Datei, einen Dateinamen, eine Abmessung oder eine Anzahl, denn es gibt hier gar keinen Code, der das könnte.

### Buy Me a Coffee: der Spenden-Button

Die Startseite und die Werkzeugseiten tragen einen Spenden-Button, der von den Servern von Buy Me a Coffee geladen wird. Ihn zu laden bedeutet, dass deren CDN Ihre IP-Adresse sieht und weiß, dass Sie auf dieser Seite waren. Die Schrift des Buttons wird von Google Fonts geholt, das Ihre IP-Adresse ebenfalls sieht. Mehr wird nicht gesendet, und solange Sie ihn nicht tatsächlich anklicken, passiert auch sonst nichts. Ab da sind Sie auf deren Seite und unter deren Richtlinien. Diese Seite und die [Nutzungsbedingungen](https://abox.tools/de/nutzungsbedingungen/) zeichnen den Button nicht.

### Hosting

Die Seite wird von GitHub Pages ausgeliefert, hinter Cloudflare. Wie jeder Webhoster verarbeiten die beiden die Anfragen, die Ihr Browser stellt, darunter Ihre IP-Adresse, die angeforderte Seite und Ihren User-Agent, um die Seite auszuliefern und den Dienst verfügbar und sicher zu halten. Auf besucherbezogene Protokolle haben wir bei keinem der beiden Zugriff.

### Der Vermittler des Teilen-Werkzeugs

Ein Werkzeug, [Text & Dateien teilen](https://abox.tools/de/text-teilen/), bringt Text und Dateien direkt von einem Browser zum anderen, und eine Direktverbindung braucht eine Vorstellung. Deshalb öffnet diese Seite, als einzige dieser Website, einen WebSocket zu einem kleinen eigenen Server, der die beiden Enden eines Link-Namens zusammenbringt und den Verbindungsaufbau zwischen ihnen weiterreicht. Den Text und die Dateien sieht er nie; die reisen über die verschlüsselte Verbindung, die er vermittelt hat. Er sieht den Link-Namen, wann sich jede Seite verbindet und wieder geht, und die IP-Adressen, und Cloudflare, das ihn betreibt, führt sieben Tage lang ein Protokoll jeder Verbindung. Es ist das einzige besucherbezogene Protokoll dieser Website, das wir lesen können. Die Seite des Werkzeugs beschreibt ihn vollständig, und sein gesamter Quelltext liegt im Repository.

## Cookies

Wir setzen keine eigenen Cookies. Wir haben keine Anmeldung und keine Sitzung, und es gibt genau eine Einstellung, die wir uns merken.

**Die Sprache, die Sie wählen.** Wenn Sie im Umschalter eine Sprache auswählen, wird diese Wahl im lokalen Speicher Ihres Browsers abgelegt, unter dem Namen `abox-lang`, damit die nächste Seite in der gewünschten Sprache erscheint. Ein Cookie ist das nicht. Es wird weder an uns noch an sonst jemanden gesendet, es bleibt auf dem Gerät, auf dem Sie dies lesen, und das Löschen der Websitedaten Ihres Browsers entfernt es. Wählen Sie nie eine Sprache, wird auch nichts gespeichert. Eine Seite, die in der Sprache Ihres Browsers erscheint, wurde im Moment des Aufrufs zugeordnet und danach wieder vergessen.

Jedes Cookie und jede ähnliche Kennung, die Sie hier finden, gehört Google und wird von den oben beschriebenen Werbe- und Analyseskripten gesetzt. Sie dienen dazu, Besuche zu messen, Anzeigen auszuwählen und deren Häufigkeit zu begrenzen.

### Wie Sie es abschalten

- Die Personalisierung von Werbung lässt sich für alle Seiten auf einmal abschalten, unter [My Ad Center](https://myadcenter.google.com/).
- Google Analytics lässt sich überall blockieren, mit Googles [Browser-Add-on zur Deaktivierung](https://tools.google.com/dlpage/gaoptout).
- Die Einstellungen Ihres Browsers können Cookies von Drittanbietern blockieren oder löschen, und jeder Inhaltsblocker verhindert, dass diese Skripte überhaupt geladen werden.

Alles davon zu blockieren ist für uns völlig in Ordnung. **Jedes Werkzeug auf dieser Seite funktioniert mit blockierten Skripten, und es funktioniert mit vollständig getrennter Netzverbindung.** Nichts hier wird hinter einer Anzeige zurückgehalten.

## Ihre Rechte an den Daten

Wir halten keine personenbezogenen Daten über Sie, es gibt also nichts, was wir Ihnen zeigen, berichtigen, exportieren oder löschen könnten. Eine Anfrage an uns käme, ehrlich gesagt, leer zurück.

Die oben beschriebenen Daten liegen bei Google, das dafür als eigener Verantwortlicher auftritt. Anfragen dazu müssen an Google gehen, über [Ihr Google-Konto](https://myaccount.google.com/) oder die dortigen Datenschutzkontakte.

## Kinder

Diese Seite richtet sich nicht an Kinder und fragt niemanden nach seinem Alter, weil sie niemanden nach irgendetwas fragt. Wir erheben wissentlich keine personenbezogenen Daten von irgendjemandem, gleich welchen Alters.

## Änderungen, und wie Sie uns erreichen

Ändert sich diese Seite, ändert sich das Datum oben mit ihr, und die Änderung steht wie alles andere in der öffentlichen Commit-Historie.

Fragen dazu können an [hi@abox.tools](mailto:hi@abox.tools) gehen oder als Issue im [Repository](https://github.com/A-Box-of-Tools/website) gestellt werden, wo die Antwort für alle anderen sichtbar ist, die sich dasselbe fragen.
