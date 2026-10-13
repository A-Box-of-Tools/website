# Comment formater et vérifier XML

Réindentez XML sans l’envoyer, retrouvez la source d’une erreur et comprenez ce qui change lors de la conversion en JSON.

[Ouvrir Formateur XML](https://abox.tools/fr/formater-du-xml/): Du XML mis en forme pour être lu ou compacté pour être livré, et converti en JSON dans les deux sens. Rien de tout cela n'est collé dans le serveur de quelqu'un d'autre.

Dernière mise à jour 12 octobre 2026

## Coller ou importer le XML

Ouvrez le formateur et collez XML ou choisissez un fichier texte. Sélectionnez deux espaces, quatre ou une tabulation, ou la sortie minimisée. Copiez ou téléchargez le résultat valide. Toute saisie rend l’ancienne sortie indisponible pendant la vérification de la nouvelle entrée.

Le parseur fonctionne localement. Il vérifie la syntaxe, sans valider XSD ou DTD, prouver que la configuration convient à votre application ni visiter une URL citée dans le texte.

![Entrée XML et conversion JSON avec un attribut, une chaîne et des éléments répétés.](https://abox.tools/screens/format-and-check-xml/mapping.webp)

L’attribut devient @region, le port reste une chaîne et les éléments feature répétés deviennent un tableau.

## Suivre une erreur d’analyse

Une balise non fermée, une mauvaise fermeture ou une référence de caractère invalide bloque formatage et conversion. Aller à l’erreur place le curseur à la position signalée. Le document exige un élément extérieur unique : deux racines ou du texte hors racine sont refusés.

```
<settings>
  <port>8080</port>
</settings>
```

Le texte DOCTYPE est conservé littéralement. Les entités externes ne sont pas résolues ; citer un fichier ou un site dans une déclaration ne le charge pas.

## Comprendre les espaces avant de réindenter

Les valeurs textuelles, CDATA et éléments à contenu mixte gardent leur texte. Les espaces uniquement entre éléments enfants sont considérés comme mise en page, sauf si `xml:space="preserve"` s’applique. C’est utile pour lire une configuration, mais une application traitant ces espaces comme données exige une vérification avant réutilisation.

## Ce que XML vers JSON change

Choisissez le sens avant de lire le résultat. Les attributs deviennent des clés commençant par `@`, les éléments répétés des tableaux et le texte voisin d’autres contenus utilise `#text`. Les valeurs XML restent des chaînes : `<port>8080</port>` n’est pas interprété comme nombre.

La conversion JSON perd les commentaires et l’ordre entrelacé du texte mixte et des éléments enfants. Le retour ne promet donc pas le document original. Conservez une copie et comparez les champs utilisés par votre application.

Pour formater JSON sans cette conversion, utilisez le [formateur JSON](https://abox.tools/fr/formater-du-json/).
