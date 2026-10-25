# Video-Schneider

Beim Abspielen markieren, was bleiben soll. Und alles davon als ein Video zurückbekommen.

> Markieren Sie die Teile, die bleiben sollen, und speichern Sie sie im Browser als ein Video. Kopieren erhält kodierte Bilder; exakte Schnitte und Aufnahmen kodieren neu. Kein Upload, auch offline.

Dies ist ein interaktives Browser-Werkzeug unter https://abox.tools/de/video-schneiden/. Dateien werden auf dem Gerät verarbeitet, auf dem dieser Browser läuft. Bewusstes Teilen und optionale Netzwerkfunktionen werden auf der Seite erklärt. Hier folgt die schriftliche Erklärung; zum Benutzen öffnen Sie die Adresse.

## Ihre Videos werden **in Ihrem Browser verarbeitet**. Kein Upload zur Verarbeitung.

Ihr Video wird von Ihrem eigenen Browser auf Ihrer eigenen Hardware gelesen, markiert, geschnitten und geschrieben. Abrufen oder senden kann hier nichts, denn eine Netzfunktion hat dieses Werkzeug überhaupt nicht. Und selbst wenn es einen Weg nach draußen gäbe, stünde am anderen Ende dieser Seite kein Server, an den ein Video gehen könnte.

- ✗ Kein Upload
- ✗ Kein Konto
- ✗ Kein Wasserzeichen
- ✓ Beliebig viele Teile
- ✓ Verlustfreie Kopie bei Kompatibilität
- ✓ Funktioniert offline

## So schneiden Sie ein Video

1. **Wählen Sie ein Video aus.** Ziehen Sie ein MP4, MOV, M4V oder WebM auf das Auswahlfeld. Der Browser liest es direkt von Ihrer Festplatte, und dabei geht nichts nach draußen. Ziehen Sie mehrere hinein, werden sie zusammengefügt, in der Reihenfolge, in der Sie sie abgelegt haben.
2. **Spielen Sie es ab und markieren Sie die gewünschten Teile.** Drücken Sie `I`, wo ein Teil beginnen soll, und `O`, wo er enden soll, und das so oft Sie wollen. Jedes Paar wird zu einer Zeile in der Tabelle darunter und zu einem Band auf der Zeitleiste. `U` nimmt das letzte zurück, die `Leertaste` spielt ab und pausiert, und die Pfeiltasten springen in Fünf-Sekunden-Schritten. Ist der Moment schwer zu treffen, verlangsamen Sie die Wiedergabe.
3. **Bessern Sie die Markierungen nach.** Jede Zeile lässt sich einzeln abspielen, durch Eintippen einer genauen Zeit neu takten, in der Reihenfolge nach oben oder unten schieben oder löschen. Die beiden Enden des ausgewählten Teils lassen sich außerdem auf der Zeitleiste ziehen. Die Summe oben ist die Laufzeit, auf die das fertige Video kommt.
4. **Behalten Sie sie, oder schneiden Sie sie heraus.** Behalten ist der übliche Weg. Das fertige Video besteht dann aus den markierten Teilen, der Reihe nach zusammengefügt. Sie herauszuschneiden ist die andere Aufgabe, die Menschen wollen und selten finden. Markieren Sie die Werbung, die Stillen oder die Fehlstarts, und was übrig bleibt, wird ohne sie zusammengefügt.
5. **Schneiden und herunterladen.** „Jedes Byte behalten“ übernimmt die Frames unverändert. Der erste Teil kann nicht abgespielte Frames ab einem früheren Keyframe enthalten; jeder spätere Teil muss auf einem Keyframe beginnen. „Genau hier schneiden“ dekodiert und kodiert jeden behaltenen Videoframe neu, damit die gewählten Schnittzeiten erhalten bleiben. Die Seite nennt das Verfahren und seine Auswirkungen, bevor Sie die Schaltfläche drücken.

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

„Jedes Byte behalten“ erhält die ursprünglich kodierten Frames und den Ton, ohne die Qualität zu verringern. Das ist für einen Abschnitt möglich oder für mehrere, wenn jeder spätere Abschnitt auf einem Keyframe beginnt. „Genau hier schneiden“ kodiert jeden behaltenen Videoframe neu und kopiert den Ton, soweit möglich. „Beim Abspielen aufzeichnen“ kodiert Bild und Ton neu. Das gewählte Verfahren zeigt Ihnen vor dem Export, was davon geschieht.

### Warum beginnt ein Teil früher, als ich ihn markiert habe?

Ein kopierter erster Abschnitt kann Frames ab dem vorherigen Keyframe enthalten, weil spätere Frames sie zum Dekodieren benötigen. Eine Schnittmarke weist den Player an, diese anfänglichen Frames zu überspringen; ignoriert er sie, kann die Wiedergabe zu früh beginnen. Browser können auch nicht abgespielte Frames an einer späteren Schnittstelle falsch behandeln. Deshalb ist Kopieren nicht verfügbar, wenn ein späterer Abschnitt zwischen Keyframes beginnt. Wählen Sie dafür „Genau hier schneiden“. Dieses Verfahren kodiert jeden behaltenen Videoframe neu. Die Seite zeigt vor dem Export das Verfahren und die Dauer eventuell mitgeführter Frames am Anfang an.

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

- **Die Verarbeitung findet in diesem Browser statt.** Dieses Werkzeug verarbeitet Eingaben und Ergebnisse im Browser. Sein Verarbeitungscode lädt sie nicht zur Verarbeitung hoch. Content-Security-Policy begrenzt Ressourcen und Verbindungsziele; erlaubte Hosts können jedoch Anfragen empfangen. Die Richtlinie prüft keine Nutzdaten und beweist allein keine ausbleibende Übertragung. Vergleichen Sie Quelltext und konkrete Anfragen oder führen Sie die lokale Operation ohne Verbindung aus.
- **Nichts hier ruft etwas ab.** Eine Netzfunktion hat dieses Werkzeug überhaupt nicht. Es gibt keine Adresse zum Einfügen, nichts herunterzuladen und keine Engine, die beim ersten Gebrauch nachgeladen wird. Jedes Byte, das Ihr Video berührt, kam beim Laden der Seite von dieser Domain selbst.
- **Auf dem normalen Weg wird nicht einmal dekodiert.** Beim Kopieren werden kompatible kodierte Bilder unverändert in die Ausgabe verschoben. Dateiausschnitte verweisen auf die Originalbytes statt sie zu dekodieren. Exakte Schnitte und Aufnahmen dekodieren und kodieren das Bild lokal neu; die Exportsteuerung zeigt diese Wahl.
- **Die Markierungsdatei entsteht in der Seite.** Beim Speichern Ihrer Markierungen wird aus den Zahlen, die ohnehin auf dem Bildschirm stehen, eine Textdatei geschrieben, direkt in Ihre Downloads. Beim Laden wird eine solche hier gelesen. Keines von beidem kommt einem Netz nahe, und keines trägt etwas anderes als Zeiten.
- **Kompatibler Ton wird kopiert.** Beim MP4-Kopieren und exakten Schneiden werden kompatible Audiosamples unverändert kopiert. Inkompatibler Ton beim Verbinden kann lokal dekodiert, neu abgetastet und kodiert werden; Aufnahmen kodieren Ton ebenfalls neu. Die Seite benennt das vor dem Export. Kein Audio-Upload.
- **Wo Einzelbilder dekodiert werden, passiert das hier.** Der exakte Schnitt und die Vorschau für eine Datei, die dieser Browser nicht abspielt, laufen über WebCodecs auf Ihrem eigenen Gerät. Das ist derselbe Decoder, der Ihnen das Video ohnehin zeigen würde, am selben Ort ausgeführt.
- **Was Google lädt und was Google nicht bekommt.** Die Werbe- und Messskripte kommen von Google. Keinem von beiden wird irgendetwas über Ihr Video übergeben, weder eine Datei noch ein Einzelbild, ein Name, eine Größe, eine Länge oder die Stelle, an der Sie geschnitten haben. Jede Zeile, die liest, schneidet und schreibt, kommt von dieser Domain selbst und steht im Repository.
- **Was der Spenden-Button lädt und was er nicht bekommt.** Der Button „Buy me a coffee“ in der Kopfzeile wird von einem Skript von cdnjs.buymeacoffee.com gezeichnet und holt seine Schrift von Google Fonts. Mehr als ein Link ist er nicht. Er meldet keinen Besuch, und über Sie oder Ihr Video bekommt er nichts.
- **Es funktioniert offline.** Trennen Sie die Netzverbindung, und alles auf dieser Seite arbeitet weiter. Einen einfacheren Beweis gibt es nicht.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, `src/segments.js` für die Markierungen und die Datei, in die sie gespeichert werden, `src/shared/mp4-reader.js` für den Leser, der die Einzelbilder in einem MP4 findet, `src/ranges.js` für die Rechnung, die aus einer Markierung eine Folge von Samples macht, und `src/copy.js` für die Schleife, die diese Samples in die neue Datei bewegt. Keines davon importiert etwas, das eine Anfrage stellen könnte.
