# Video schneiden — online kürzen und zusammenfügen

Beim Abspielen markieren, was bleiben soll. Und alles davon als ein Video zurückbekommen.

> Ein Video ansehen und beim Abspielen jeden behaltenswerten Teil markieren, dann diese Teile als eine Datei speichern. Läuft im Browser: kein Upload, nichts wird neu kodiert, auch offline.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/video-schneiden/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre Videos werden **nie hochgeladen**. Es gibt keinen Server.

Ihr Video wird von Ihrem eigenen Browser auf Ihrer eigenen Hardware gelesen, markiert, geschnitten und geschrieben. Abrufen oder senden kann hier nichts, denn eine Netzfunktion hat dieses Werkzeug überhaupt nicht. Und selbst wenn es einen Weg nach draußen gäbe, stünde am anderen Ende dieser Seite kein Server, an den ein Video gehen könnte.

- ✗ Kein Upload
- ✗ Kein Konto
- ✗ Kein Wasserzeichen
- ✓ Beliebig viele Teile
- ✓ Kein Qualitätsverlust
- ✓ Funktioniert offline

## So schneiden Sie ein Video

1. **Wählen Sie ein Video aus.** Ziehen Sie ein MP4, MOV, M4V oder WebM auf das Auswahlfeld. Der Browser liest es direkt von Ihrer Festplatte, und dabei geht nichts nach draußen. Ziehen Sie mehrere hinein, werden sie zusammengefügt, in der Reihenfolge, in der Sie sie abgelegt haben.
2. **Spielen Sie es ab und markieren Sie die gewünschten Teile.** Drücken Sie `I`, wo ein Teil beginnen soll, und `O`, wo er enden soll, und das so oft Sie wollen. Jedes Paar wird zu einer Zeile in der Tabelle darunter und zu einem Band auf der Zeitleiste. `U` nimmt das letzte zurück, die `Leertaste` spielt ab und pausiert, und die Pfeiltasten springen in Fünf-Sekunden-Schritten. Ist der Moment schwer zu treffen, verlangsamen Sie die Wiedergabe.
3. **Bessern Sie die Markierungen nach.** Jede Zeile lässt sich einzeln abspielen, durch Eintippen einer genauen Zeit neu takten, in der Reihenfolge nach oben oder unten schieben oder löschen. Die beiden Enden des ausgewählten Teils lassen sich außerdem auf der Zeitleiste ziehen. Die Summe oben ist die Laufzeit, auf die das fertige Video kommt.
4. **Behalten Sie sie, oder schneiden Sie sie heraus.** Behalten ist der übliche Weg. Das fertige Video besteht dann aus den markierten Teilen, der Reihe nach zusammengefügt. Sie herauszuschneiden ist die andere Aufgabe, die Menschen wollen und selten finden. Markieren Sie die Werbung, die Stillen oder die Fehlstarts, und was übrig bleibt, wird ohne sie zusammengefügt.
5. **Schneiden und herunterladen.** „Jedes Byte behalten“ bewegt die Einzelbilder unangetastet hinüber. Das ist schnell und kann keine Qualität kosten, dafür beginnt jeder Teil am Keyframe vor Ihrer Markierung. „Genau hier schneiden“ dekodiert und schreibt das Bild neu, damit jeder Teil auf dem Einzelbild beginnt, das Sie gewählt haben. Was von beidem Sie gleich bekommen und was es kostet, sagt Ihnen die Seite vor dem Klick.

## Die ausführliche Fassung

[So kürzen Sie ein Video, ohne es neu zu kodieren](https://abox.tools/de/ratgeber/video-kuerzen/): Einen Clip zu schneiden muss kein einziges Byte Qualität kosten. Warum ein Schnitt manchmal früher sitzt als markiert, was ein Keyframe damit zu tun hat und wann eine Neukodierung die bessere Wahl ist.

## Auch im Werkzeugkasten

- [Video-Zuschneider](https://abox.tools/de/video-zuschneiden/): Einen Clip auf den Teil zurechtschneiden, auf den es ankommt.
- [Video-Umkehrer](https://abox.tools/de/video-rueckwaerts-abspielen/): Das letzte Einzelbild zuerst, samt Ton.
- [Zeitraffer-Generator](https://abox.tools/de/zeitraffer-erstellen/): Eine Stunde Aufnahme in zwanzig Sekunden.
- [Standbild-Greifer](https://abox.tools/de/standbild-aus-video/): Ein Standbild in voller Qualität, von jeder Stelle.

## Fragen

### Wird mein Video irgendwohin hochgeladen?

Nein. Ihr eigener Browser liest, markiert, schneidet und schreibt es auf Ihrer eigenen Hardware. Eine Serverseite hat dieses Werkzeug nicht, und in der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf; keine davon gehört uns. Wer lieber prüft als glaubt, trennt die Internetverbindung und schneidet trotzdem ein Video.

### Kann ich mehrere Teile desselben Videos behalten?

Genau dafür ist das hier da. Drücken Sie `I` und `O` so oft Sie wollen, während es läuft. Jedes Paar wird zu einer Zeile, und das fertige Video besteht aus allen Zeilen, der Reihe nach zusammengefügt, während alles andere verschwindet. Die meisten Online-Schneider geben Ihnen ein einziges Paar Griffe und fragen, welchen einen Abschnitt Sie behalten wollen. Das reicht, um einen Clip vorn und hinten zu stutzen, und nützt überhaupt nichts, wenn man eine Stunde Material einmal durchsieht und die sechs lohnenden Momente behalten will.

### Kostet das Schneiden Qualität?

Auf dem normalen Weg nicht, jedenfalls nicht in der Hinsicht, auf die es ankommt. Schneiden ändert nichts daran, wie ein Einzelbild aussieht, also wandern die Einzelbilder genau so in die neue Datei, wie sie waren: dieselben Bytes, dieselben Encoder-Einstellungen, dasselbe alles. Der einzige Weg hier, der überhaupt etwas neu kodiert, ist der exakte Schnitt, und das steht auf der Schaltfläche.

### Warum beginnt ein Teil früher, als ich ihn markiert habe?

Das liegt daran, wie Video gespeichert wird, und es passiert nur bei Playern, die einen genormten Teil des Formats ignorieren. Die meisten Einzelbilder werden als Beschreibung dessen gehalten, worin sie sich von ihren Nachbarn unterscheiden, und lassen sich ohne diese gar nicht dekodieren. Nur ein Keyframe steht für sich, und Keyframes liegen typischerweise eine bis zehn Sekunden auseinander. Ein Schnitt, der Einzelbilder kopiert, muss deshalb die Strecke ab dem Keyframe vor Ihrer Markierung mitnehmen. In der Datei steht dazu *ab Ihrer Markierung abspielen*, und daran hält sich jeder gängige Player. Brauchen Sie es in jedem Player exakt, wählen Sie „Genau hier schneiden“, das neu kodiert. In welchem Fall Sie sind und um wie viel, sagt Ihnen die Seite vor dem Export.

### Kann ich stattdessen die Werbung herausschneiden?

Ja. Markieren Sie sie und wählen Sie dann „Sie herausschneiden“. Zusammengefügt wird dann alles, was Sie *nicht* markiert haben, der Reihe nach. Dieselbe Liste von Markierungen beantwortet beide Fragen, Sie können also zwischen ihnen hin und her schalten und die Länge sich ändern sehen, ohne irgendetwas zweimal zu markieren.

### Kann ich meine Markierungen speichern und später weitermachen?

Ja. „Markierungen speichern“ schreibt eine reine Textdatei mit einer Zeile je Teil, Anfang und Ende durch ein Komma getrennt, und „Markierungen laden“ liest eine solche zurück. Angeboten werden zwei Formate, glatte Sekunden und `HH:MM:SS.mmm`, und beide halten sich an das Layout, das andere Werkzeuge dieser Art bereits verwenden. Eine hier geschriebene Datei lässt sich also an eines von jenen übergeben, und eine dort geschriebene auf diese Seite ziehen. Markieren ist sorgfältige Arbeit, und niemand sollte sie zweimal machen müssen.

### Welche Videoformate kann ich schneiden?

MP4, M4V und MOV werden direkt gelesen, egal was darin steckt, also H.264, HEVC, AV1 oder VP9. Einzelbilder zu kopieren heißt nicht, sie zu dekodieren, dieser Weg funktioniert also selbst bei einem Codec, für den Ihr Browser überhaupt keinen Decoder hat. Alles andere, was Ihr Browser abspielen kann, allen voran WebM, wird stattdessen abgespielt und dabei aufgezeichnet. Das funktioniert, dauert so lange, wie das Ergebnis lang ist, und kann nur einen Teil behalten. Was der Browser weder lesen noch abspielen kann, in der Praxis AVI, WMV, FLV und die meisten MKVs, wird gleich mit einer entsprechenden Meldung abgelehnt, statt auf halbem Weg zu scheitern.

### Gibt es eine Grenze für Größe oder Länge des Videos?

Im Werkzeug ist keine Grenze eingebaut, und auf dem Kopierweg wird die Datei kaum gelesen. Auf die Einzelbilder, die Sie behalten, wird nur gezeigt, statt sie zu laden. Vier Minuten aus einer vier Gigabyte großen Aufnahme zu behalten kostet damit etwa so viel, wie diese vier Minuten auf die Festplatte zu schreiben. Der exakte Schnitt läuft die Datei in Häppchen von wenigen Megabyte ab. So oder so setzt die fertige Datei die praktische Obergrenze, denn die wird vor dem Download im Arbeitsspeicher zusammengesetzt.

### Bleibt der Ton erhalten?

Auf beiden MP4-Wegen wird er Sample für Sample übernommen, ohne je dekodiert zu werden, und ist damit Byte für Byte das, was in der Datei stand. Eine Edit-Markierung hält jeden Teil auf eine Tausendstelsekunde genau mit seinem Bild in Deckung. Eine Ausnahme gibt es: das Zusammenfügen getrennter Videos, deren Ton unterschiedlich beschrieben ist, etwa mit verschiedenen Abtastraten. Dann lassen sich beide ohne Dekodierung nicht in eine Spur bringen, und die Seite sagt das, bevor sie es tut. Auf dem Aufzeichnungsweg wird er von der Wiedergabe abgegriffen und neu kodiert. So oder so gibt es ein Häkchen, um ihn ganz wegzulassen.

### Ist es kostenlos, und brauche ich ein Konto?

Es ist kostenlos, und es gibt kein Konto, keine Anmeldung, keine Testphase und kein Wasserzeichen. Bezahlt wird die Seite über Werbung, und den Anzeigen wird nichts über Ihr Video übergeben.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Ihre Videos haben keinen Weg nach draußen.** In der Content-Security-Policy steht jede Adresse, die diese Seite kontaktieren darf, und keine einzige davon gehört uns. Es gibt hier keinen Endpunkt, an dem Ihre Datei landen könnte, und im Code steht auch nichts, das sie dorthin schicken würde, gäbe es einen.
- **Nichts hier ruft etwas ab.** Eine Netzfunktion hat dieses Werkzeug überhaupt nicht. Es gibt keine Adresse zum Einfügen, nichts herunterzuladen und keine Engine, die beim ersten Gebrauch nachgeladen wird. Jedes Byte, das Ihr Video berührt, kam beim Laden der Seite von dieser Domain selbst.
- **Auf dem normalen Weg wird nicht einmal dekodiert.** Schneiden ändert nichts daran, wie ein Einzelbild aussieht, also wandern die kodierten Einzelbilder der von Ihnen markierten Teile genau so in die neue Datei, wie sie vorgefunden wurden. Gehalten wird jedes als Ausschnitt der Datei auf Ihrer Festplatte, also als Notiz, welche Bytes es sind, und nicht als die Bytes selbst. Ihr Browser liest sie zum ersten Mal, während er den Download schreibt. Ein Bild macht hier nie wieder jemand aus Ihrem Video.
- **Die Markierungsdatei entsteht in der Seite.** Beim Speichern Ihrer Markierungen wird aus den Zahlen, die ohnehin auf dem Bildschirm stehen, eine Textdatei geschrieben, direkt in Ihre Downloads. Beim Laden wird eine solche hier gelesen. Keines von beidem kommt einem Netz nahe, und keines trägt etwas anderes als Zeiten.
- **Der Ton wird kopiert, nicht angehört.** Auf beiden MP4-Wegen werden die Audio-Samples übernommen, ohne überhaupt dekodiert zu werden. Nichts hier macht daraus je wieder Klang, und selbst wenn, könnte nichts ihn weiterreichen.
- **Wo Einzelbilder dekodiert werden, passiert das hier.** Der exakte Schnitt und die Vorschau für eine Datei, die dieser Browser nicht abspielt, laufen über WebCodecs auf Ihrem eigenen Gerät. Das ist derselbe Decoder, der Ihnen das Video ohnehin zeigen würde, am selben Ort ausgeführt.
- **Was Google lädt und was Google nicht bekommt.** Die Werbe- und Messskripte kommen von Google. Keinem von beiden wird irgendetwas über Ihr Video übergeben, weder eine Datei noch ein Einzelbild, ein Name, eine Größe, eine Länge oder die Stelle, an der Sie geschnitten haben. Jede Zeile, die liest, schneidet und schreibt, kommt von dieser Domain selbst und steht im Repository.
- **Was der Spenden-Button lädt und was er nicht bekommt.** Der Button „Buy me a coffee“ in der Kopfzeile wird von einem Skript von cdnjs.buymeacoffee.com gezeichnet und holt seine Schrift von Google Fonts. Mehr als ein Link ist er nicht. Er meldet keinen Besuch, und über Sie oder Ihr Video bekommt er nichts.
- **Es funktioniert offline.** Trennen Sie die Netzverbindung, und alles auf dieser Seite arbeitet weiter. Einen einfacheren Beweis gibt es nicht.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, `src/segments.js` für die Markierungen und die Datei, in die sie gespeichert werden, `src/shared/mp4-reader.js` für den Leser, der die Einzelbilder in einem MP4 findet, `src/ranges.js` für die Rechnung, die aus einer Markierung eine Folge von Samples macht, und `src/copy.js` für die Schleife, die diese Samples in die neue Datei bewegt. Keines davon importiert etwas, das eine Anfrage stellen könnte.
