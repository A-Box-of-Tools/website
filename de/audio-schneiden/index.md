# Audio schneiden — Tonaufnahmen online kürzen

Markieren Sie beim Abspielen, was bleiben soll. Zurück kommt eine Datei, geschnitten genau dort, wo Sie es gesagt haben.

> Eine Aufnahme abspielen und im Vorbeigehen jeden Teil markieren, der bleiben soll, und diese Teile dann als eine Datei speichern. Samplegenaue Schnitte, kein Knacken an den Übergängen, kein Upload.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/audio-schneiden/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre Aufnahmen werden **nie hochgeladen**. Es gibt keinen Server.

Ihre Aufnahme wird von Ihrem eigenen Browser auf Ihrer eigenen Hardware gelesen, markiert, geschnitten und geschrieben. Abrufen oder senden kann hier nichts, denn eine Netzfunktion hat dieses Werkzeug überhaupt nicht. Und selbst wenn es einen Weg nach draußen gäbe, stünde am anderen Ende dieser Seite kein Server, an den eine Aufnahme gehen könnte.

- ✗ Kein Upload
- ✗ Kein Konto
- ✗ Kein Wasserzeichen
- ✓ Beliebig viele Teile
- ✓ Schneidet genau dort, wo Sie markiert haben
- ✓ Funktioniert offline

## So schneiden Sie eine Audiodatei

1. **Wählen Sie eine Aufnahme aus.** Ziehen Sie eine MP3-, WAV-, FLAC-, M4A-, Ogg- oder Opus-Datei auf das Auswahlfeld, oder ein Video, wenn Sie ein Stück von dessen Ton haben wollen. Der Browser liest sie direkt von Ihrer Festplatte und zeichnet sie als Wellenform, und dabei geht nichts nach draußen.
2. **Spielen Sie ab und markieren Sie die gewünschten Teile.** Drücken Sie `I`, wo ein Teil anfangen soll, und `O`, wo er aufhören soll. Tun Sie das so oft Sie mögen. Jedes Paar wird zu einer Zeile in der Tabelle darunter und zu einem Band auf der Wellenform. `U` nimmt das letzte zurück, `Leertaste` spielt ab und pausiert, die Pfeiltasten springen fünf Sekunden, und mit gehaltener `Umschalttaste` gehen sie zehn Millisekunden weiter. Wenn die Stelle schwer zu treffen ist, spielen Sie langsamer ab.
3. **Bessern Sie die Marken nach.** Jede Zeile lässt sich einzeln abspielen, durch Eintippen einer genauen Zeit neu setzen, in der Reihenfolge nach oben oder unten schieben oder löschen. Die beiden Enden des ausgewählten Teils lassen sich außerdem auf der Wellenform ziehen, und das ist der schnellste Weg, eine Marke auf die Stille statt auf das Atmen davor zu setzen. Die Summe oben ist das, worauf die fertige Aufnahme kommen wird.
4. **Behalten oder herausschneiden.** Behalten ist der übliche Weg: Die fertige Aufnahme sind die markierten Teile, der Reihe nach aneinander gehängt. Herausschneiden ist die andere Aufgabe, die man oft will und selten findet. Markieren Sie die Ähs, das klingelnde Telefon oder die Fehlstarts, und was übrig bleibt, wird ohne sie zusammengesetzt.
5. **Schneiden und herunterladen.** Jeder Schnitt landet auf dem Sample, das Sie markiert haben. Auf ein Schlüsselbild gerundet wird hier nichts, denn Ton hat keine. Zu entscheiden ist einzig, wie viel Blende auf jeden Übergang kommt. Fünf Millisekunden genügen, um ein Knacken zu verhindern, und sind viel zu kurz, um als Blende hörbar zu sein. Heraus kommt ein WAV, das erst auf der Seite abgespielt und dann direkt an die Downloads Ihres Browsers übergeben wird.

## Die ausführliche Fassung

[Audio schneiden, ohne Qualität zu verlieren](https://abox.tools/de/ratgeber/audiodatei-kuerzen/): Wo ein Audioschnitt wirklich landet, warum er exakt sein kann und ein Videoschnitt nicht, warum eine Naht manchmal knackt, und was fünf Millisekunden Blende in Wahrheit tun.

## Auch im Werkzeugkasten

- [Audio-Editor](https://abox.tools/de/audio-bearbeiten/): Rückwärts abspielen, das Tempo ändern, eine leise Aufnahme anheben. Alles hier, auf Ihrem Gerät.
- [PDF-Zusammenfügen & Teilen](https://abox.tools/de/pdf-zusammenfuegen/): Seiten umsortieren, ohne den Umweg über einen Server.
- [PDF-Kompressor](https://abox.tools/de/pdf-verkleinern/): Ein Dokument verkleinern, ohne es irgendwohin zu schicken.
- [PDF-Schwärzer](https://abox.tools/de/pdf-schwaerzen/): Die Buchstaben werden aus der Datei gelöscht, und danach wird die Datei durchsucht, um es zu belegen.

## Fragen

### Wird mein Ton irgendwohin hochgeladen?

Nein. Ihr eigener Browser liest, markiert, schneidet und schreibt ihn auf Ihrer eigenen Hardware. Eine Serverseite hat dieses Werkzeug nicht, und in der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf; keine davon gehört uns. Wer lieber prüft als glaubt, trennt die Internetverbindung und schneidet trotzdem eine Aufnahme.

### Kann ich mehrere Teile derselben Aufnahme behalten?

Genau dafür ist das hier da. Drücken Sie beim Abspielen `I` und `O`, so oft Sie mögen. Jedes Paar wird eine Zeile, und die fertige Datei ist jede Zeile der Reihe nach, ohne alles andere. Die meisten Online-Schneider geben Ihnen ein Paar Griffe und fragen, welchen einen Abschnitt Sie behalten wollen. Das reicht, um einen Jingle vorn und hinten zu stutzen, und nützt gar nichts, wenn man ein einstündiges Interview einmal anhören und die sechs guten Antworten behalten will.

### Landet der Schnitt genau dort, wo ich markiert habe?

Ja, bei jedem Teil und in jedem Abspielprogramm. Das ist die eine Stelle, an der Ton einfacher ist als Video: Eine dekodierte Aufnahme ist eine Folge von Zahlen, und jede steht für sich. Es gibt also nichts, was einem Schlüsselbild entspräche und auf das zurückgerundet würde, und keinen Grund, warum ein Schnitt zu früh anfangen sollte. Die Seite zeigt die Sample-Nummer, bei der das Ergebnis beginnt, und das ist Ihre Marke mal der Abtastrate, gerundet auf das nächste ganze Sample.

### Warum sollte ein Übergang knacken, und wozu ist die Blende da?

Weil ein Schnitt aus der Mitte eines Wortes in die Mitte eines anderen zwei Wellenformen nebeneinanderstellt, die nichts miteinander zu tun haben, und ein Lautsprecher, der dazwischen springen soll, macht ein Knacken. Das ist kein Fehler im Schnitt, so klingt eine Unstetigkeit. Der Ausweg ist eine Blende von wenigen Millisekunden zu beiden Seiten jedes Übergangs: lang genug, damit die Membran hinterherkommt, viel zu kurz, um als Blende gehört zu werden. Fünf Millisekunden sind voreingestellt und lassen sich abschalten. Eine Blende kommt nur auf eine Kante, die wirklich ein Schnitt ist, eine Kante ganz am Anfang oder Ende der Aufnahme bleibt also genau so, wie sie war.

### Kann ich stattdessen die schlechten Stellen herausschneiden?

Ja. Markieren Sie sie und wählen Sie dann „Herausschneiden“: Alles, was Sie *nicht* markiert haben, wird stattdessen der Reihe nach zusammengesetzt. Dieselbe Markenliste beantwortet beide Fragen, Sie können also hin und her schalten und die Länge sich ändern sehen, ohne etwas zweimal zu markieren.

### Kann ich meine Marken speichern und später weitermachen?

Ja. „Marken speichern“ schreibt eine reine Textdatei, eine Zeile je Teil, Anfang und Ende durch ein Komma getrennt, und „Marken laden“ liest eine wieder ein. Angeboten werden zwei Formate, schlichte Sekunden und `HH:MM:SS.mmm`, und beide sind das Layout, das auch der Video-Schneider auf dieser Seite schreibt. Eine gegen das Video erstellte Datei lässt sich also auf dessen Ton legen und umgekehrt. Markieren ist sorgfältige Arbeit, und niemand sollte sie zweimal machen müssen.

### Welche Formate kann ich öffnen?

Alles, was Ihr Browser dekodiert, in der Praxis also MP3, WAV, FLAC, M4A und AAC, Ogg Vorbis und Opus sowie den Ton in MP4-, M4V-, MOV- und WebM-Videos. Draußen bleibt dieselbe kurze Liste wie überall sonst: AVI, WMA und die meisten MKVs. Eine Datei, die dieser Browser nicht liest, wird mit einer entsprechenden Meldung abgelehnt, statt auf halbem Weg zu scheitern.

### Warum wird ein WAV gespeichert und kein MP3?

Weil kein Browser einen MP3-Kodierer mitbringt und dieses Werkzeug sich weigert, Ihre Aufnahme an einen Server zu schicken, der einen hat. Ein WAV braucht überhaupt keinen Kodierer, es sind die Samples mit einem kurzen Kopf davor. Damit ist es zugleich die ehrliche Möglichkeit und die einzige, die auf dem Weg hinaus keine Qualität kosten kann. Größer ist es allerdings: rund zehn Megabyte je Minute in Stereo. Öffnen kann es jeder Player, jedes Telefon und jedes Schnittprogramm, und was ein MP3 will, kann daraus eines machen. Ein MP3 stattdessen durch Kopieren seiner Frames zu schneiden, hielte die Datei klein, verschöbe aber jeden Schnitt auf die nächste Framegrenze, und genau dieses Runden zu vermeiden, ist der Zweck dieses Werkzeugs.

### Gibt es eine Grenze für die Länge der Aufnahme?

Im Werkzeug ist keine Grenze eingebaut. Die praktische Obergrenze ist der Arbeitsspeicher: Die ganze Aufnahme wird auf einmal in diese Seite dekodiert, und das WAV entsteht vor dem Download im Arbeitsspeicher. Eine Stunde Stereo braucht also knapp unter einem Gigabyte Platz zum Arbeiten. Ein WAV von vier Gigabyte wird rundheraus abgelehnt, weil das Größenfeld des Formats selbst eines gar nicht beschreiben kann.

### Ist es kostenlos, und brauche ich ein Konto?

Es ist kostenlos, und es gibt kein Konto, keine Anmeldung, keine Testphase und kein Wasserzeichen. Bezahlt wird die Seite über Werbung, und den Anzeigen wird nichts über Ihre Aufnahme übergeben.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Ihre Aufnahmen haben keinen Weg nach draußen.** In der Content-Security-Policy steht jede Adresse, die diese Seite kontaktieren darf, und keine einzige davon gehört uns. Es gibt hier keinen Endpunkt, an dem Ihre Datei landen könnte, und im Code steht auch nichts, das sie dorthin schicken würde, gäbe es einen.
- **Nichts hier ruft etwas ab.** Eine Netzfunktion hat dieses Werkzeug überhaupt nicht. Es gibt keine Adresse zum Einfügen, nichts herunterzuladen und keine Engine, die beim ersten Gebrauch nachgeladen wird. Jedes Byte, das Ihren Ton berührt, kam beim Laden der Seite von dieser Domain selbst.
- **Der Dekoder ist der, den Ihr Browser ohnehin schon hat.** Die Datei wird an `decodeAudioData` übergeben, also an denselben Code, der ein Stück in einem `<audio>`-Element abspielt. Hier wird nichts ausgeliefert, um Ihr Format zu lesen, und dafür wird auch nichts außerhalb dieser Seite gefragt.
- **Das Bild eines Videos wird gar nicht erst dekodiert.** Wenn Sie ein Video hineinziehen, wird nur seine Tonspur angefordert. Die Einzelbilder werden nicht gelesen, nicht dekodiert, nicht gezeichnet und nicht angesehen. Es gibt auf dieser Seite keinen Code, der das könnte, und in der Datei, die herauskommt, ist Ton und sonst nichts.
- **Der Schnitt ist eine Kopie, im Arbeitsspeicher, auf diesem Gerät.** Schneiden heißt hier ein `set` je Teil und Kanal: Die behaltenen Samples werden in der von Ihnen gewählten Reihenfolge in ein neues Feld geschoben. Multipliziert werden einzig die paar hundert Samples in jeder Blende, und die Seite sagt Ihnen deren Zahl, bevor Sie den Knopf drücken.
- **Die Samples werden aufgeschrieben, nicht neu kodiert.** Ein WAV sind die Samples, die diese Seite hält, mit einem Kopf davor. In der Schleife sitzt kein Kodierer, der Entscheidungen über Ihre Aufnahme trifft, und es gibt nichts, was man als Upload beschreiben könnte, auf dem so etwas passieren würde.
- **Die Markendatei entsteht auf der Seite.** Beim Speichern Ihrer Marken wird aus den Zahlen, die ohnehin schon auf dem Bildschirm stehen, eine Textdatei geschrieben, direkt in Ihre Downloads. Beim Laden wird sie hier gelesen. Weder das eine noch das andere kommt einem Netzwerk nahe, und getragen werden dabei nur Zeitangaben.
- **Was Google lädt und was Google nicht bekommt.** Die Werbe- und Messskripte kommen von Google. Keinem von beiden wird irgendetwas über Ihre Aufnahme übergeben, weder eine Datei noch ein Sample, ein Name, eine Größe, eine Länge oder die Stelle, an der Sie geschnitten haben. Jede Zeile, die liest, schneidet und schreibt, kommt von dieser Domain selbst und steht im Repository.
- **Was der Spenden-Button lädt und was er nicht bekommt.** Der Button „Buy me a coffee“ in der Kopfzeile wird von einem Skript von cdnjs.buymeacoffee.com gezeichnet und holt seine Schrift von Google Fonts. Mehr als ein Link ist er nicht. Er meldet keinen Besuch, und über Sie oder Ihre Aufnahme bekommt er nichts.
- **Es funktioniert offline.** Trennen Sie die Netzverbindung, und alles auf dieser Seite arbeitet weiter. Einen einfacheren Beweis gibt es nicht.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, `src/segments.js` für die Marken und die Datei, in der sie landen, `src/shared/audio-decode.js` für die zwanzig Zeilen, die Ihre Datei dem Dekoder des Browsers übergeben, `src/trim.js` für die Rechnung, die aus einer Marke einen Sample-Abschnitt macht, und für die Schleife, die ihn kopiert, sowie `src/shared/wav.js` für den Kopf, der davor geschrieben wird. Keines davon importiert etwas, das eine Anfrage stellen könnte.
