# Wie kann eine Webseite ohne WLAN funktionieren?

Weil der Browser eine vollständige Kopie behalten hat und ein kleines Programm, das mit der Seite ausgeliefert wird, diese Kopie serviert, wann immer das Netz es nicht kann. Die Maschinerie ist Standard und lohnt das Verstehen, denn ein Werkzeug, das getrennt vom Netz arbeitet, zeigt Ihnen etwas, das keine Datenschutzerklärung zeigen kann.

Zuletzt aktualisiert 26. August 2026

## Die kurze Antwort

Eine Webseite lebt und stirbt normalerweise mit ihrer Verbindung, weil jeder Besuch sie neu holt. Aber eine Seite kann ein kleines Programm mitliefern, einen *Service Worker*, den der Browser neben der Seite installiert und der über ihren Netzwerkverkehr gebietet. Beim ersten Besuch legt dieser Worker eine vollständige Kopie von allem, woraus die Seite besteht — Markup, Stile, Skripte —, in einem Cache auf Ihrer Maschine ab. Von da an werden Anfragen aus dieser Kopie beantwortet. Stirbt das WLAN, ändert sich nichts, weil ohnehin nichts geholt wurde.

Keine Zauberei, keine Sondererlaubnis: Das ist normale Browser-Maschinerie, seit rund einem Jahrzehnt in jedem großen Browser. Ungewöhnlich ist nur, wie sehr sich diese Seite darauf stützt — denn für eine Seite, deren ganzes Versprechen ist, dass Ihre Dateien sie nie verlassen, ist offline kein Komfortmerkmal. Es ist der Beweis.

## Was das Überleben des Steckerziehens beweist

Die stärkste Prüfung im Upload-Ratgeber ist [der Stecker](https://abox.tools/de/ratgeber/ist-das-hochladen-von-dateien-sicher/): Werkzeug laden, Verbindung trennen, benutzen. Es lohnt sich, genau zu sagen, warum das funktioniert. Ein Werkzeug, das Ihre Datei auf einem Server umwandelt, braucht das Netz in exakt dem Moment seiner Arbeit — Kabel gekappt, Arbeit steht. Ein Werkzeug, das weiterarbeitet, hat vorgeführt statt behauptet, dass die Arbeit auf Ihrer Maschine passiert; und eine Seite, die das Netz nicht erreichen kann, kann Ihre Datei nirgendwohin schicken, was auch immer ihr Code sich wünschte.

Das kann keine Datenschutzerklärung bieten. Eine Erklärung beschreibt Absichten und kann sich ändern; eine Seite, die ihre Arbeit im Flugmodus tut, ist Physik. Darum arbeitet jedes Werkzeug dieser Seite offline und trägt eine Live-Anzeige, die sagt, ob Sie es gerade sind — damit Sie zusehen können, wie sie beim Umschalten kippt, und die stärkste Prüfung überhaupt in etwa zehn Sekunden laufen lassen können.

## Wie die Kopie ehrlich bleibt

Zwei Fragen entscheiden, ob für-immer-gespeichert Geschenk oder Falle ist, und die Maschinerie beantwortet beide:

- **Veraltet die Kopie?** Der Worker sieht nach einer neueren Fassung, wenn eine Verbindung da ist, und tauscht sie im Ganzen ein. Fassungen sind ganz, weil die Kopie immer stimmig sein muss — halb alt, halb neu ist der eine Zustand, der nie serviert werden darf.
- **Was genau wurde kopiert?** Alles, was die Seite braucht, und nichts sonst — und jedes Werkzeug hier hält seine Kopie in seinem eigenen Fach. Der Cache eines Werkzeugs enthält dieses Werkzeug; eines zu installieren installiert nicht still zehn. Die Kopie ist zudem einsehbar: Die Entwicklerwerkzeuge Ihres Browsers listen jede gespeicherte Datei, und die Liste ist dieselbe, die die Seite offen geholt hat.

Das Ergebnis ist eine Seite, die sich wie eine Anwendung verhält, die Sie durch bloßes Besuchen installiert haben — was auch wörtlich im Angebot ist: Die Adressleiste des Browsers installiert jedes Werkzeug hier als App, mit dem eigenen Symbol des Werkzeugs, direkt in das Werkzeug öffnend, ohne Knopf auf der Seite und ohne fragendes Skript. Dieselbe Maschinerie, als Abkürzung verkleidet.

## Was offline nicht beweist

Die Prüfung ist stark, nicht magisch, und ihre Grenzen verdienen dieselbe Deutlichkeit wie ihre Stärke:

- **Sie beweist den Moment, nicht die Zukunft.** Offline getane Arbeit blieb auf Ihrer Maschine, Punkt. Eine Seite könnte im Prinzip Daten halten und nach Rückkehr der Verbindung senden — schließen Sie für die heikelsten Dateien also den Tab vor dem Wiederverbinden, oder prüfen Sie auch die andere Richtung: den Netzwerk-Tab beobachten, während die Verbindung zurückkommt.
- **Sie beweist diese Seite, nicht die Website.** Jede Seite antwortet für sich. Die eine hier, die das Netz benutzt, sagt es auf ihrer eigenen Seite: das Werkzeug zum [Teilen von Text](https://abox.tools/de/text-teilen/), dessen ganze Aufgabe es ist, etwas zwischen zwei Geräten zu bewegen, und das genau erklärt, was seine eine Verbindung trägt.
- **Sie versteckt Sie nicht.** Die Seite überhaupt zu laden hat der Website Ihre Adresse verraten, wie jeder Seitenabruf im Netz. Offline handelt davon, wohin Ihre Dateien gehen, nicht von Anonymität.

Diese Grenzen sind der Grund, warum der Upload-Ratgeber vier Prüfungen lehrt statt einer — der Netzwerk-Tab, die Sicherheitsrichtlinie im Seitenquelltext und der lesbare Code decken ab, was das Steckerziehen nicht kann. Aber als erster Filter ist keiner schneller: Kann ein Werkzeug seine Arbeit ohne Netz nicht tun, haben Sie gelernt, wo die Arbeit passiert, und weiteres Lesen erübrigt sich.
