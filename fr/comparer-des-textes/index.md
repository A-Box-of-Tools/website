# Comparateur de textes — comparer deux textes, côte à côte

Deux textes en entrée, chaque différence marquée, ligne à ligne et mot à mot. Rien n'est collé dans le serveur de quelqu'un d'autre.

> Comparez deux textes et voyez chaque différence, ligne à ligne et mot à mot, côte à côte ou en une colonne. La comparaison tourne dans votre navigateur, rien n'est envoyé - du code non publié ne quitte donc jamais votre machine.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/comparer-des-textes/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos textes. Il n'y a pas de serveur.

Une comparaison est de l'arithmétique sur deux chaînes de caractères, faite ici, dans cette page. L'algorithme est celui de Myers — celui-là même qu'utilise `git diff` —, écrit à la main dans `src/diff.js`, où vous pouvez le lire. Cet outil n'a aucune fonction réseau : rien à aller chercher, rien à envoyer. Cela compte ici : ce que les gens comparent, ce sont des contrats, des fichiers de configuration et du code non publié, et toujours par paires.

- ✗ Sans envoi
- ✗ Sans compte
- ✗ Sans limite de taille
- ✓ Fonctionne hors ligne
- ✓ Open source

## Comment comparer deux textes sans les envoyer

1. **Collez les deux textes, ou déposez les deux fichiers.** L'original à gauche, la version modifiée à droite. Deux fichiers déposés en même temps sur le sélecteur atterrissent un de chaque côté, dans l'ordre où vous les avez déposés ; échangez les côtés si c'était à l'envers.
2. **Choisissez comment le lire.** Côte à côte, ou en une colonne. Un téléphone commence en une colonne, car côte à côte demande deux colonnes de texte et un téléphone a la place d'environ une ; le menu est juste là de toute façon.
3. **Ignorez ce qui ne compte pas.** Les espaces, les majuscules et minuscules, les lignes vides — chacun peut être ignoré, pour qu'un fichier reformaté ne se lise pas comme cent changements. Par défaut, la partie inchangée du milieu est repliée en un compte, avec trois lignes gardées de part et d'autre de chaque changement.
4. **Lisez ce qui a changé.** Les lignes supprimées sont marquées à gauche, les lignes ajoutées à droite, et dans une ligne modifiée, les mots qui diffèrent sont surlignés — un diff de deux paragraphes montre donc le mot qui a bougé plutôt que deux paragraphes entiers.
5. **Emportez le correctif.** Le téléchargement est un `.patch` au format unifié, ce qu'attendent une revue de code, `git apply` et toutes les visionneuses de différences. Copier met la même chose dans votre presse-papiers.

## La version longue

[Comment comparer deux fichiers JSON](https://abox.tools/fr/guides/comparer-deux-fichiers-json/): Formater les deux fichiers de la même façon, trier les clés, puis les comparer. Pourquoi un diff JSON brut n'est presque que du bruit, comment canoniser les deux côtés dans le navigateur, et ce qui survit jusqu'au correctif.

## Aussi dans la boîte

- [Encodeur & décodeur Base64](https://abox.tools/fr/encoder-base64/): Base64, encodage pourcent, entités HTML, hexadécimal et échappements antislash, dans les deux sens. Rien n'est collé dans le serveur de quelqu'un d'autre.
- [Partager du texte et des fichiers](https://abox.tools/fr/partager-du-texte/): Le partage vit dans cet onglet ouvert. Les lecteurs le reçoivent chiffré, directement depuis votre navigateur, et fermer l'onglet y met fin - aucun serveur ne conserve quoi que ce soit.
- [Générateur de QR codes et de codes-barres](https://abox.tools/fr/generateur-de-qr-code/): Vous le tapez, cela devient un code. Rien n'est envoyé pour en fabriquer un.
- [Lecteur de QR codes et de codes-barres](https://abox.tools/fr/lecteur-de-qr-code/): Visez un code, ou déposez-en une photo. La lecture se fait ici, et nulle part ailleurs.

## Questions

### Mes textes sont-ils envoyés quelque part ?

Non. La comparaison est une fonction qui s'exécute dans votre propre navigateur, sur votre propre matériel. Cet outil n'a aucune fonction réseau : il ne va jamais rien chercher et n'envoie jamais rien, et la `Content-Security-Policy` de la page nomme chaque adresse qu'elle a le droit de contacter, dont aucune ne nous appartient. C'est la raison de s'en servir pour un contrat, un fichier de configuration ou du code non publié : coller ceux-là dans le comparateur de quelqu'un d'autre, c'est donner les deux versions à la fois.

### Que fait la comparaison, au juste ?

Elle trouve le plus petit ensemble de modifications qui transforme le texte de gauche en celui de droite, avec l'algorithme de Myers — celui qu'utilise `git diff`. C'est le fait d'être le plus court qui rend une comparaison lisible : une ligne insérée au milieu doit apparaître comme une insertion, et non comme si toutes les lignes suivantes avaient changé. À l'intérieur d'une ligne modifiée, les mots qui diffèrent sont marqués aussi, si bien que comparer deux paragraphes montre le mot qui a bougé plutôt que deux paragraphes entiers.

### Peut-il comparer deux fichiers plutôt que deux collages ?

Oui. Déposez les deux en même temps sur le sélecteur et ils atterrissent un de chaque côté, dans l'ordre où vous les avez déposés. Votre navigateur les lit dans cette page, qui est le seul endroit où ils vont. Échangez les côtés si vous les avez déposés à l'envers.

### Que sort-il d'une comparaison, et puis-je l'appliquer ?

Le téléchargement est un diff unifié — le format `@@ -3,5 +3,5 @@` que lisent `git apply`, `patch` et tous les outils de revue de code. Copier fait la même chose vers votre presse-papiers. Ce qui est à l'écran en est une vue : côte à côte, ou sur une colonne, avec les parties inchangées repliées en un décompte, sauf si vous demandez à les voir toutes.

### Peut-il ignorer les espaces, la casse ou les lignes vides ?

Oui, chacun séparément. Ignorer les espaces fait qu'un fichier reformaté se compare comme inchangé ; ignorer la casse traite `Error` et `error` comme le même mot ; ignorer les lignes vides saute les lignes qui ne contiennent rien. Les compteurs au-dessus du résultat disent alors que les deux sont identiques une fois ignorées les différences que vous avez demandé d'ignorer — ce qui n'est pas la même affirmation que « identiques », et la page garde les deux affirmations distinctes.

### Quelle taille de comparaison peut-il traiter ?

Aucune limite n'est fixée ici, puisqu'aucun serveur ne la paie. Deux textes de vingt mille lignes avec une poignée de changements se comparent instantanément, car le début et la fin communs sont retirés avant que le vrai travail commence. La comparaison de deux textes qui n'ont absolument rien en commun s'arrête tôt et le dit, plutôt que de passer une minute à démontrer l'évidence ; et une comparaison très longue affiche les premiers milliers de lignes et laisse le reste au correctif téléchargé.

### Est-ce gratuit, et faut-il un compte ?

C'est gratuit, et il n'y a ni compte, ni identification, ni période d'essai, ni limite sur ce que vous collez. Le site affiche de la publicité, et c'est elle qui le finance ; les annonces ne reçoivent rien sur votre texte.

### Est-ce que cela fonctionne hors ligne ?

Oui. Chargez la page une fois, coupez ensuite votre connexion et elle continue de travailler. C'est aussi la façon la plus simple de prouver que rien n'est envoyé, car un outil qui expédierait vos textes ailleurs pour les comparer s'arrêterait à l'instant où vous débranchez.

## Comment cette promesse se vérifie

- **Ce que vous collez n'a nulle part où aller.** La Content-Security-Policy nomme chaque adresse que cette page a le droit de contacter, et pas une seule ne nous appartient. Il n'existe ici aucun point de collecte où un jeton collé pourrait atterrir, ni rien dans le code qui l'y enverrait s'il en existait un.
- **Rien ici ne va chercher quoi que ce soit.** Il n'y a nulle part dans `src/` ni `fetch`, ni `XMLHttpRequest`, ni `sendBeacon`. La comparaison est une fonction de cette page qui prend deux chaînes et renvoie ce qui a changé.
- **L'algorithme est le classique, lisible en entier.** L'algorithme du plus court script d'édition de Myers, celui-là même qu'utilise `git diff`, écrit à la main dans `src/diff.js` avec les décisions commentées. Les tests dans `tests/js/text-diff.test.js` prouvent que les suppressions reconstruisent le texte de gauche et les insertions celui de droite, ce qui est la définition même de « correct » pour un diff.
- **Ce que Google charge, et ce qu'on ne lui donne pas.** Les scripts publicitaires et de mesure viennent de Google, et le bouton de don de Buy Me a Coffee. Aucun d'eux ne reçoit un caractère de votre texte. Chaque ligne qui le lit, l'analyse ou l'écrit est servie depuis cette origine et figure dans le dépôt.
- **Tout fonctionne hors ligne.** Coupez le réseau : l'outil reste identique, puisqu'il n'a jamais comporté la moindre étape réseau. C'est la preuve la plus simple de toutes.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy et `src/diff.js` pour l'algorithme de Myers, la passe mot à mot dans chaque ligne modifiée et les trois garde-fous qui empêchent une comparaison pathologique de figer la page.
