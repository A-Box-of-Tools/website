# Ist Base64 eine Verschlüsselung?

Nein. Base64 ist ein Kostümwechsel, kein Schloss: Wer es erkennt, macht es in Millisekunden rückgängig, ganz ohne Schlüssel. Aber die Frage verdient eine richtige Antwort, denn Kodierung, Verschlüsselung und Hashing sehen auf dem Bildschirm gleich aus und könnten in dem, was sie versprechen, kaum verschiedener sein.

Zuletzt aktualisiert 26. August 2026

## Die kurze Antwort

Nein. Base64 ist eine *Kodierung*: eine Art, beliebige Daten mit nur vierundsechzig unverfänglichen Zeichen aufzuschreiben, damit sie den Transport durch Systeme überstehen, die für schlichten Text gebaut sind. Sie hat keinen Schlüssel, kein Geheimnis und keinerlei Sicherheitseigenschaft. Zum Dekodieren muss man sie erkennen, sonst nichts — ein Mensch braucht dafür einen Blick, ein Rechner eine Millisekunde.

Die Frage lohnt sich trotzdem, denn die Verwechslung ist universell und gelegentlich teuer. Eine Base64-Zeichenkette *sieht* verwürfelt aus — `cGFzc3dvcmQ=` verrät dem Auge nichts —, und was verwürfelt aussieht, wird unter „sicher“ abgelegt. Echte Produkte sind mit derart „geschützten“ Passwörtern ausgeliefert worden. Die Kur ist eine einmal gelernte Unterscheidung: **Kodierung ist für Maschinen, Verschlüsselung für Geheimnisse, Hashing für Fingerabdrücke.** Drei Aufgaben, drei Werkzeuge, und nur eines davon schützt irgendetwas.

## Kodierung: für jeden umkehrbar

Eine Kodierung ändert, wie Daten *geschrieben* werden, nie, was sie besagen. E-Mail-Anhänge, in Stylesheets eingebettete Bilder, Tokens in Adressen — überall müssen beliebige Bytes durch Kanäle, die nur Text zuverlässig tragen, und Base64 ist das Standardkostüm: drei Bytes hinein, vier Zeichen heraus, aus Buchstaben, Ziffern und zwei Satzzeichen, mit `=` als Auffüllung am Ende. Dieses `=` ist das Erkennungszeichen, und wer es einmal kennt, sieht Base64 überall.

Die entscheidende Eigenschaft: Das Rezept ist öffentlich und läuft rückwärts genauso. Es gibt nichts zu wissen, also gibt es nichts nicht zu wissen. Prozent-Kodierung in Adressen (`%20` für ein Leerzeichen), HTML-Entitäten (`&amp;`), Hex-Darstellungen und Backslash-Escapes sind dieselbe Idee in anderem Gewand, und der [Base64-Kodierer und -Dekodierer](https://abox.tools/de/base64-kodieren/) hier spricht sie alle, in beide Richtungen, auf Ihrer eigenen Maschine. Eine gefundene Zeichenkette zu dekodieren ist exakt so legitim wie sie zu lesen, denn eine Kodierung war nie ein Schloss.

## Verschlüsselung: umkehrbar für den Schlüsselinhaber

Verschlüsselung ist die, die Inhalte tatsächlich schützt. Sie transformiert Daten mit einem *Schlüssel*, und die Mathematik ist so eingerichtet, dass die Umkehr ohne Schlüssel nicht bloß schwierig, sondern rechnerisch außer Reichweite ist — mit Schlüssel dagegen sofort gelingt. Das Geheimnis wohnt ganz im Schlüssel, nicht in der Methode: Die Verfahren sind veröffentlicht, genormt und gerade deshalb stark.

Hier beißt die optische Verwechslung, denn verschlüsselte Bytes werden routinemäßig Base64-kodiert, damit sie reisen können — erst vom Schlüssel verwürfelt, dann für den Transport kostümiert. Zwei Schichten, zwei Aufgaben. Das JSON-Web-Token ist der Klassiker: drei Base64-Stücke, durch Punkte verbunden, von denen sich die ersten beiden für jeden, der es versucht, in lesbares JSON *dekodieren*. Täglich fügen Menschen Tokens in öffentliche Web-Dekodierer ein, im Glauben, das Ganze sei versiegelt; die ehrliche Beschreibung ist, dass ein JWT eine Postkarte mit fälschungssicherer Unterschrift ist, kein Umschlag.

## Hashing: für niemanden umkehrbar

Ein Hash läuft nur in eine Richtung. Beliebig viele Daten durch SHA-256 geschickt ergeben eine Zahl fester Größe — dieselbe Zahl jedes Mal für dieselben Daten, eine völlig andere für Daten, die sich um ein Bit unterscheiden, und kein Weg zurück von der Zahl zu den Daten, für niemanden, Schlüssel hin oder her. Das ist kein Kostüm und kein Schloss; es ist ein *Fingerabdruck*.

Genau das macht ihn zum richtigen Werkzeug für die zwei Aufgaben, die ihm gehören. Prüfen, dass eine heruntergeladene Datei exakt die des Herausgebers ist — Fingerabdrücke vergleichen, was das Werkzeug [Prüfsumme berechnen](https://abox.tools/de/pruefsumme-berechnen/) auf Ihrer Maschine tut, mit [eigenem Ratgeber](https://abox.tools/de/ratgeber/pruefsumme-vergleichen/). Und Passwörter aufbewahren: Ein gut geführter Dienst behält nur den Hash Ihres Passworts, sodass selbst seine gestohlene Datenbank das Passwort nicht enthält. Kann eine Seite Ihnen Ihr vergessenes Passwort mailen, hat sie Ihnen mitgeteilt, dass sie es nie gehasht hat — und „sichert“ eine Konfiguration eines als `cGFzc3dvcmQ=`, hat sie mitgeteilt, dass sie es nur je kodiert hat.

## Sie in freier Wildbahn auseinanderhalten

Eine brauchbare Abkürzung für die Zeichenkette vor Ihnen:

- **Dekodiert zu etwas Lesbarem?** Es war Kodierung. Buchstaben, Ziffern, vielleicht `+` und `/`, oft `=` am Ende — durch einen Dekodierer schicken und nachsehen.
- **Dekodiert zu binärem Rauschen?** Dann war das Base64 nur das Kostüm, und darunter ist etwas Verschlüsseltes, Komprimiertes oder nie Textgewesenes — die Kodierung sagt so oder so nichts darüber.
- **Feste Länge, Hex-Zeichen, dekodiert nie?** 64 Hex-Zeichen sind die Gestalt von SHA-256, 32 die von MD5. Hashes dekodieren nicht; sie stimmen nur überein oder eben nicht.

Und die praktische Moral zu jedem: Verlassen Sie sich für Geheimhaltung nie auf Kodierung; bauen Sie Verschlüsselung nie selbst, wenn Ihre Plattform sie mitliefert; speichern Sie ein Passwort nie anders als gehasht. Die Zeichenkette, die Sie zum Prüfen dekodieren, kann derweil selbst der heikle Teil sein — bei einem Token im Debugging ist sie es meist —, weshalb der [Dekodierer hier](https://abox.tools/de/base64-kodieren/) dort läuft, wo das Geheimnis ohnehin ist, auf Ihrer Maschine, und weshalb [das Einfügen in Web-Werkzeuge](https://abox.tools/de/ratgeber/ist-das-einfuegen-in-online-tools-sicher/) eine eigene Seite hat.
