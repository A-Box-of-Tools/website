# JSON formatieren, ohne es jemandem zu geben

JSON zu formatieren sollte die Leerzeichen ändern und sonst nichts. Die meisten Werkzeuge, die das anbieten, ändern mehr, und keines sagt es dazu. Hier steht, worauf zu achten ist, wie man den Fehler liest, wenn die Datei sich nicht lesen lässt, und warum das Eingabefeld, in das eine Konfigurationsdatei wandert, einen Gedanken wert ist.

[JSON-Formatierer öffnen](https://abox.tools/de/json-formatieren/): JSON, XML, HTML, CSS und YAML, formatiert oder umgewandelt. Nichts davon wird in den Server eines anderen eingefügt.

Zuletzt aktualisiert 26. August 2026

## Die kurze Antwort

[Text & Code](https://abox.tools/de/json-formatieren/) öffnen, das JSON in das Feld einfügen und lesen. Die Einrückung passiert beim Tippen, die Sprache wird aus dem Text erkannt, und eingerückt wird mit zwei Leerzeichen, solange Sie nichts anderes sagen. Nichts wird hochgeladen, denn es gibt keinen Ort, wohin: Der Parser sind ein paar hundert Zeilen JavaScript, die in dem Tab laufen, den Sie ohnehin offen haben.

Alles Folgende ist das, was zu wissen sich lohnt, bevor Sie eine Konfigurationsdatei in irgendeine der Alternativen einfügen: was ein Formatierer ändern darf, was die meisten trotzdem ändern, und wie man den Fehler liest, wenn sich die Datei gar nicht erst lesen lässt.

![Zwei Bereiche: links eine einzige Zeile JSON, rechts dasselbe Dokument mit zwei Leerzeichen Einrückung formatiert.](https://abox.tools/screens/format-json-without-uploading-it/panes.webp)

Eine Zeile hinein, etwas Lesbares heraus. Dafür wurde nichts irgendwohin geschickt.

## Was Formatieren ist und was nicht

JSON hat fast keine Syntax. Ein Objekt, ein Array, eine Zeichenkette, eine Zahl und die drei Wörter `true`, `false` und `null`. Zwischen diesen Teilen bedeutet Leerraum nichts: die Datei

```
{"name":"thing","tags":["local","offline"]}
```

und die Datei

```
{
  "name": "thing",
  "tags": [
    "local",
    "offline"
  ]
}
```

sind dasselbe Dokument. Formatieren ist der Weg von der ersten zur zweiten, und *das ist die ganze Aufgabe*. Alles andere, was ein Formatierer mit Ihrer Datei anstellt — umsortieren, runden, weglassen — ist eine Änderung dessen, was das Dokument sagt, ungefragt vorgenommen.

Drei dieser Änderungen sind häufig genug, um sie beim Namen zu nennen, denn sie geschehen still, und sie sind das, was ein an einem Nachmittag geschriebener Formatierer von Haus aus tut.

## Die drei Dinge, die ein Formatierer nicht ändern darf

### Die Reihenfolge Ihrer Schlüssel

Das ist die Falle, in die alle tappen. Der naheliegende Weg, einen JSON-Formatierer in JavaScript zu schreiben, ist `JSON.parse` und danach `JSON.stringify` mit einer Einrückung — und dieses Paar erhält die Reihenfolge von Schlüsseln nicht, die wie ganze Zahlen aussehen:

```
Object.keys(JSON.parse('{"10":"a","2":"b","x":"c"}'))
// ['2', '10', 'x']
```

Das ist kein Fehler in irgendjemandes Code. JavaScript-Objekte sind so spezifiziert, dass ganzzahlartige Schlüssel zuerst kommen, aufsteigend sortiert, und jeder Wert, der durch `JSON.parse` geht, wird zu einem JavaScript-Objekt. Ein so gebauter Formatierer stellt eine Datei um, die nach ID, Portnummer, Jahr oder HTTP-Statuscode geschlüsselt ist — und sagt kein Wort dazu.

Ob das zählt, hängt von der Datei ab. JSON-Objekte sind im Prinzip ungeordnet, technisch ist also nichts kaputt — aber der Diff gegen die Fassung in Ihrem Repository wird riesig, das Review unlesbar, und wenn irgendetwas weiter unten die Datei der Reihe nach liest, ändert sich das Verhalten.

### Die Ziffern Ihrer Zahlen

JSON sagt nicht, wie groß eine Zahl sein darf, JavaScript schon: Jede Zahl ist ein Double. Ein Formatierer, der zu einem Double parst und es zurückschreibt, verliert also alles, was ein Double nicht halten kann.

```
JSON.stringify(JSON.parse('{"id":123456789012345678901}'))
// {"id":123456789012345680000}

JSON.stringify(JSON.parse('{"size":1e999}'))
// {"size":null}
```

Eine einundzwanzigstellige ID — eine Twitter-ID, eine Snowflake-ID, eine Bankreferenz — kommt als andere Zahl zurück, und ein Wert, der für ein Double zu groß ist, kommt als `null` zurück. Beide Dateien lassen sich weiterhin lesen, und keine ist die Datei, mit der Sie angefangen haben.

Der Ausweg ist, Zahlen gar nicht erst zu parsen. Ein Formatierer muss nur wissen, wo eine Zahl anfängt und aufhört, um das Dokument zu setzen; ihren Wert braucht er nie. Das Sichere ist also, die Ziffern exakt so zu übernehmen, wie sie geschrieben standen. Genau das tut das Werkzeug hier.

### Ihre doppelten Schlüssel

`{"a": 1, "a": 2}` ist gültiges JSON, und der Standard sagt nicht, welcher der beiden gewinnt. In der Praxis sind sich die Parser uneins: Die meisten behalten den letzten, manche den ersten, einige lehnen das Dokument ab. Ein Formatierer, der still einen davon ausgibt, hat diese Entscheidung für Sie getroffen — und die weit nützlichere Tatsache verschwiegen, dass es zwei gab. Das ist fast immer ein Fehler in der Datei, und einer, den man sehen möchte.

## Wenn sich die Datei nicht lesen lässt

Das meiste JSON, das scheitert, ist nicht exotisch. Es ist eine von etwa sechs Sachen, und der Fehler sagt Ihnen welche — sofern er die Stelle so nennt, dass Sie sie finden. Ein Versatz wie `Position 4193` tut das nicht; Zeile und Spalte schon.

- **Ein Komma zu viel am Ende.** `{"a": 1,}` ist in JavaScript erlaubt und in JSON nicht. Die häufigste einzelne Ursache, meist übrig geblieben, weil der letzte Eintrag einer Liste gelöscht wurde.
- **Einfache Anführungszeichen.** `{'a': 1}` ist ein JavaScript-Objektliteral, kein JSON. Zeichenketten und Schlüssel stehen beide in doppelten Anführungszeichen, und Schlüssel stehen immer in Anführungszeichen.
- **Ein Schlüssel ohne Anführungszeichen.** `{a: 1}`, derselbe Fehler von der anderen Seite — meist davon, dass etwas aus Code statt aus einer Datei kopiert wurde.
- **Kommentare.** `// so etwas` ist ebenfalls kein JSON. Das ist JSONC, das die VS-Code-Einstellungen und `tsconfig.json` verwenden, und es lässt sich sonst nirgends lesen. Muss ein Kommentar überleben, ist ein Schlüssel die Konvention: `"_comment": "..."`.
- **Ein echter Zeilenumbruch oder Tabulator in einer Zeichenkette.** Sie müssen als `\n` und `\t` geschrieben werden. Das geht meist schief, wenn ein Shell-Befehl oder ein Zertifikat von Hand in einen Wert eingefügt wurde.
- **Eine Zahl, die JSON nicht erlaubt.** Führende Nullen (`01`), ein nackter Dezimalpunkt (`.5`), `NaN`, `Infinity` und `+1` schreiben Leute alle, und keines davon ist JSON.

Eines, das kein Fehler ist und wie einer aussieht: eine Datei, die mit einer Bytereihenfolge-Markierung beginnt. In den meisten Editoren ist sie unsichtbar, sie ist kein Leerraum, und sie macht das allererste Zeichen des Dokuments unerwartet. Steht der Fehler bei Zeile 1, Spalte 1 in einer Datei, die makellos aussieht, dann ist es das.

![Dasselbe Werkzeug mit einem kaputten Dokument: eine Fehlermeldung mit Zeile und Spalte eines überzähligen Kommas, und links die betroffene Zeile.](https://abox.tools/screens/format-json-without-uploading-it/error.webp)

Wenn es sich nicht lesen lässt, sagt die Meldung, wo. Ein überzähliges Komma ist die häufigste Ursache und mit bloßem Auge am schwersten zu finden.

## Minifizieren, und wie wenig es meist bringt

Den Leerraum herauszuquetschen ist dieselbe Operation rückwärts, und es lohnt sich, nüchtern zu sehen, was sie einbringt. Leerraum ist hochgradig wiederholt, und jeder Server und Browser zwischen Ihnen und einem Leser komprimiert die Antwort ohnehin mit gzip oder Brotli, was genau in solchen Wiederholungen sehr gut ist.

Minifiziertes JSON ist deshalb als Datei oft dreißig Prozent kleiner und auf der Leitung nur ein paar Prozent. Wo es sich wirklich verdient, sind die Orte ohne Kompression davor: ein Wert in einer Datenbankspalte, ein Feld in einer Logzeile, eine Nutzlast in einem QR-Code oder ein Dokument, das Sie gleich als Base64 in einen Header schreiben.

Es kostet Lesbarkeit, und liegt die Datei in einem Repository, kostet es Sie zusätzlich die Diffs — eine einzeilige Datei ändert sich vollständig, sobald sich irgendetwas darin ändert. Minifizieren Sie auf dem Weg aus dem Editor heraus, nicht hinein.

## Die Schlüssel sortieren, und wann besser nicht

Die Schlüssel jedes Objekts zu sortieren, wird hier als Option angeboten und nicht von selbst gemacht, denn es ist eine echte Änderung an der Datei, und ihr Wert hängt ganz davon ab, was Sie als Nächstes vorhaben.

Es hilft, wenn Sie zwei Dokumente vergleichen, die dasselbe sagen sollen — die Konfiguration zweier Umgebungen, eine API-Antwort vor und nach einer Änderung — und eines davon seine Schlüssel in anderer Reihenfolge führt. Beide vorher zu sortieren macht aus einem Diff von allem einen Diff der zwei Zeilen, die sich wirklich unterscheiden.

Es schadet, wenn die Reihenfolge etwas bedeutet hat. Eine `package.json` hat Konventionen dafür, was zuerst kommt; eine handgeschriebene Konfiguration gruppiert oft Zusammengehöriges; und eine Datei, deren Schlüssel ein Werkzeug sortiert und die dann eingecheckt wurde, ergibt einen einzigen riesigen, nichtssagenden Commit. Sortieren Sie eine Kopie, nicht das Original.

Eine Einzelheit, die zu kennen sich lohnt: Sortiert wird hier danach, wie die Schlüssel sich lesen, und nicht nach ihren Codepunkten, also kommt `item2` vor `item10` und nicht dahinter. Nach Codepunkten zu sortieren ist das, was `item10` mitten unter die Einer stellt — technisch korrekt und für einen Leser nutzlos.

## Zwei JSON-Dateien vergleichen

Der verlässliche Weg ist, beide zuerst gleich zu formatieren. Zwei Dokumente, die dasselbe sagen, können sich in jeder Zeile unterscheiden, wenn eines minifiziert war und das andere nicht, und kein Diff kann daran vorbeisehen.

Also: das erste formatieren, das zweite formatieren, dann die beiden Ergebnisse vergleichen. Alle drei Schritte sind hier auf derselben Seite — der Reiter *Vergleichen* teilt sich das Feld mit *Formatieren*, genau deshalb. Führen die beiden ihre Schlüssel auch noch in unterschiedlicher Reihenfolge, sortieren Sie beim Formatieren beide, und der Vergleich schrumpft auf den Unterschied zusammen, den Sie gesucht haben.

## Der Teil, den niemand auf die Seite schreibt

Suchen Sie nach einem JSON-Formatierer, und Sie finden Dutzende Seiten mit einem Feld darauf. In dieses Feld einzufügen ist ein Hochladen. Was auch immer in Ihrer Zwischenablage lag — eine API-Antwort mit der Adresse eines Kunden darin, eine Konfigurationsdatei mit einer Verbindungszeichenkette, ein Token, an dem Sie gerade fehlersuchen — ist an eine Maschine gegangen, die Ihnen nicht gehört, und ist jetzt deren Logdatei, deren Fehlerbericht und deren Sicherung.

Das ist keine Vermutung über böse Absichten. Auch eine völlig wohlmeinende Seite führt Zugriffsprotokolle, betreibt Analytik und hat einen Hoster. Die sichersten Daten sind die, die nie gegangen sind, und für eine Aufgabe, die reine Zeichenkettenarbeit ist, gibt es überhaupt keinen Grund zu gehen.

Zwei Prüfungen, und sie funktionieren bei jeder Seite, die das behauptet, nicht nur bei dieser:

1. **DevTools öffnen, den Netzwerk-Reiter beobachten und etwas formatieren.** Wird Ihr Text verschickt, gibt es eine Anfrage, die ihn trägt. Etwas anderes kann gleichzeitig nicht wahr sein.
2. **Die Internetverbindung trennen und es noch einmal versuchen.** Ein Werkzeug, das die Arbeit in Ihrem Browser erledigt, merkt davon nichts. Ein Werkzeug, das Ihren Text irgendwohin schickt, hört sofort und vollständig auf zu arbeiten.

Eine längere Fassung von beidem, mit zwei weiteren Prüfungen, steht in [Ist es sicher, Dateien hochzuladen?](https://abox.tools/de/ratgeber/ist-das-hochladen-von-dateien-sicher/)

## Und YAML, XML und der Rest?

Dieselbe Seite liest XML, HTML, CSS und YAML und wandelt zwischen JSON und dem ersten und dem letzten davon um. Zwei Dinge von oben lohnt es sich mitzunehmen, denn sie sind dasselbe Argument in anderem Gewand:

- **YAML nach JSON zu wandeln verliert die Kommentare**, denn JSON hat keinen Platz für einen. Anker und Aliasse — YAMLs Art zu sagen „derselbe Knoten zweimal“ — lassen sich ebenfalls nicht ausdrücken und werden hier abgelehnt, statt geraten zu werden.
- **`no` ist eine Zeichenkette.** In YAML 1.1 waren `yes`, `no`, `on` und `off` Wahrheitswerte, weshalb eine Liste von Ländercodes mit Norwegen darin früher mit `false` zurückkam. YAML 1.2 hat das fallen lassen, und hier ebenso — aber diese Wörter werden trotzdem in Anführungszeichen zurückgeschrieben, denn was die Datei als Nächstes öffnet, kann ein 1.1-Leser sein.
