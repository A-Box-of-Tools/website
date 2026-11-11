# Comment convertir entre YAML et JSON

Convertissez un document localement puis vérifiez ses valeurs. JSON perd les commentaires YAML ; ce lecteur refuse volontairement les constructions non prises en charge.

[Ouvrir Convertisseur YAML vers JSON](https://abox.tools/fr/convertir-du-yaml-en-json/): Les deux sens, et il dit ce que chacun coûte. Rien de tout cela n'est collé dans le serveur de quelqu'un d'autre.

Dernière mise à jour 13 octobre 2026

## Choisir le sens et ajouter le texte

Collez un document ou choisissez un fichier. Le menu sélectionne YAML vers JSON ou JSON vers YAML ; importer un fichier `.json`, `.yaml` ou `.yml` choisit le sens correspondant. Vérifiez le résultat avant Copier ou Télécharger.

La conversion se déroule dans le navigateur sans envoyer la configuration. Gardez l’original : formatage et commentaires peuvent compter pour sa maintenance, même sans changement des données.

![Entrée YAML et sortie JSON avec le nombre de commentaires supprimés.](https://abox.tools/screens/convert-yaml-and-json/values.webp)

Le commentaire disparaît ; no reste une chaîne et le grand entier garde ses chiffres.

## Transférer une configuration entre formats

Si une application attend YAML et une autre JSON, partez d'une copie d'un seul document de configuration. Choisissez le sens et deux espaces ; laissez le tri désactivé si les groupes existants facilitent l'examen. Vérifiez que les identifiants entre guillemets restent des chaînes, les commutateurs des booléens et les listes les éléments attendus. Enregistrez sous un nouveau nom, puis utilisez la validation de l'application destinataire avant de remplacer son fichier fonctionnel. Une conversion réussie prouve que ce parseur comprend la syntaxe prise en charge, pas que les réglages sont valides pour l'application.

Un autre usage utile consiste à examiner deux environnements écrits dans des formats différents. Convertissez la copie YAML en JSON, puis suivez le [parcours de comparaison JSON](https://abox.tools/fr/guides/comparer-deux-fichiers-json/) avec les deux copies formatées pareil. Vérifiez noms d'hôte, limites et commutateurs ; gardez l'original YAML pour ses commentaires. Convertissez les documents YAML séparément et utilisez un parseur plus complet si la configuration emploie ancres, alias ou balises.

## Utiliser le sous-ensemble YAML pris en charge

Le lecteur traite les associations, séquences et valeurs scalaires courantes avec une résolution de type YAML 1.2. Il n’implémente pas tout YAML 1.2. Ancres, alias, balises personnalisées et flux de documents multiples arrêtent la conversion. Utilisez un parseur adapté si le fichier en a besoin ; retirer un alias sans garder son sens change la configuration.

Une erreur propose Aller à l’erreur. Corrigez l’entrée signalée plutôt que d’utiliser l’ancienne sortie, indisponible après modification.

## Vérifier commentaires, chaînes et nombres

```
enabled: true
country: no
account: 12345678901234567890
```

Ici `no` reste la chaîne `"no"`, sans devenir false comme en YAML 1.1. Le convertisseur garde le texte numérique sans arrondir ce long numéro de compte via les nombres flottants de JavaScript. L’application lisant le résultat peut imposer ses propres limites numériques.

JSON n’a pas de commentaires : ceux de YAML sont supprimés et l’outil signale ceux qu’il a lus. Un `#` dans une chaîne entre guillemets ou un scalaire de bloc est du contenu, pas un commentaire.

## Reconvertir JSON en YAML

Le modèle de données est conservé, mais le YAML est nouvellement écrit : il ne retrouve ni commentaires ni formatage antérieurs. Les mots ambigus sont cités pour les lecteurs YAML 1.1. Vérifiez version et schéma de l’application destinataire, surtout pour les configurations de déploiement.

La [spécification YAML](https://yaml.org/spec/1.2.2/) décrit la langue complète. Pour vérifier ou minimiser JSON seul, utilisez le [formateur JSON](https://abox.tools/fr/formater-du-json/).
