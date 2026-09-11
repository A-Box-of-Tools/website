# Comment caviarder une image pour que le masqué disparaisse vraiment

Recouvrir et supprimer se ressemblent à l'écran et ne sont pas du tout la même chose. Voici la différence, les deux traitements qui laissent plus de traces qu'on ne le croit, et les vérifications qui vous disent lequel des deux vous venez de faire.

[Ouvrir Caviardage d'image](https://abox.tools/fr/caviarder-une-image/): Ce que vous recouvrez est supprimé du fichier, pas dissimulé dedans.

Dernière mise à jour 26 août 2026

## La réponse courte

Ouvrez le [Caviardage d'image](https://abox.tools/fr/caviarder-une-image/), déposez-y l'image, tracez un cadre sur chaque chose que personne ne doit voir et appuyez sur « Caviarder et enregistrer ». Employez l'aplat noir pour tout ce qui se lit comme du texte. Le fichier que vous récupérez porte d'autres valeurs de pixels là où étaient les cadres : il n'y a rien à écarter dedans, parce qu'il n'y a aucun rectangle dedans.

Tout ce qui suit explique pourquoi cette dernière phrase est l'essentiel, et comment savoir si un logiciel que vous utilisez déjà peut en dire autant.

## Recouvrir et supprimer se ressemblent à l'écran

Tracez un rectangle noir sur un nom dans un lecteur de PDF, une présentation, un traitement de texte ou un éditeur d'images à calques. Ce que vous voyez, c'est un nom avec un rectangle noir dessus. Ce que vous avez *enregistré*, dans la plupart de ces logiciels, c'est un document contenant le nom et, séparément, un rectangle doté d'une position, d'une taille et d'une couleur.

Quiconque ouvre ce fichier peut déplacer le rectangle, le supprimer, ou ouvrir le document dans un logiciel qui dessine les calques dans un autre ordre. Le nom y est toujours. Rien à l'écran ne dit lequel des deux cas vient de se produire : c'est exactement pour cela que cela continue d'arriver à des organisations qui ont des juristes.

Des pièces de procédure, des rapports administratifs, des contrats et plus d'un document scanné de presse ont été publiés ainsi. Le schéma est toujours le même : le rectangle était l'annotation, et l'annotation n'était pas l'image.

## Ce qu'est un vrai caviardage

Une image est une grille de nombres, un par pixel. La caviarder, c'est **écrire d'autres nombres dans la grille**, puis enregistrer la grille. Après cela, il n'y a rien à récupérer, non parce que le fichier le cache bien, mais parce que les valeurs n'y sont pas. C'est la seule version de l'opération qui survive à l'ouverture par quelqu'un de curieux.

Trois conséquences valent d'être connues, car elles décrivent ce à quoi ressemble un fichier caviardé :

- **Le résultat est une image plate.** Pas de calques, pas d'objets, pas de liste d'annotations, rien à afficher ou masquer. Si votre outil rend un fichier comportant un calque, il a recouvert au lieu de supprimer.
- **C'est un nouveau fichier, pas un ancien modifié.** Les pixels sont passés par un décodeur et un encodeur : ce qui sort est écrit depuis la grille caviardée.
- **Les métadonnées disparaissent aussi**, par effet de bord. Une grille de pixels ne porte ni modèle d'appareil, ni position GPS, ni date. Ce qu'il y aurait eu sinon est décrit dans [ce qu'une photo raconte sur vous](https://abox.tools/fr/guides/supprimer-les-donnees-exif-et-gps/).

Ce dernier point mérite d'être détaillé, car il cache un piège supplémentaire. Beaucoup de photos portent une **vignette intégrée** : une petite seconde copie de l'image, écrite à la création du fichier et pas toujours régénérée lorsque l'image est modifiée. Une photo caviardée par un outil qui modifie le fichier sur place, au lieu de le réencoder, peut donc voyager avec une vignette de l'original non caviardé. C'est une petite image, et elle est largement assez grande pour qu'on y lise un nom.

![La carte d'enregistrement : un menu de format, un curseur de qualité, et une note disant que les pixels couverts sont retirés du fichier écrit.](https://abox.tools/screens/redact-an-image/save.webp)

L'enregistrement est l'étape qui rend la chose réelle. Ce qui sort est un nouveau fichier sans ces pixels, pas l'original avec un rectangle dessus.

## Noir, pixellisation ou flou : pourquoi ce n'est pas équivalent

Les trois écrasent les pixels. Un seul ne laisse rien derrière lui.

### Aplat noir

Tous les pixels du cadre prennent la même couleur. De ce qui était là, rien ne survit : ni un contour, ni une luminosité moyenne, ni le nombre de caractères, ni la longueur du mot. C'est le seul des trois pour lequel la question « cela pourrait-il être défait ? » reçoit un non franc, et c'est ce qu'il faut employer pour un nom, une adresse, un numéro de compte, une plaque d'immatriculation, une signature ou un code-barres.

### Pixellisation

Le cadre est découpé en blocs et chaque bloc prend la couleur moyenne de ce bloc. Les pixels d'origine ont réellement disparu, mais une grille de moyennes reste une mesure de ce qui se trouvait dessous, et pour du texte cette mesure peut suffire.

L'attaque n'a rien de subtil. Un texte provient d'un petit ensemble de possibilités : une police, une taille, une position, une chaîne. Qui soupçonne quel genre de donnée se trouvait là peut rendre chaque chaîne candidate de la même façon, la pixelliser avec la même grille de blocs, et comparer les moyennes aux vôtres. La correspondance est généralement unique. Cela a été démontré sur de vraies captures pixellisées, et il existe des logiciels publiés qui le font.

Ce qui décide, c'est **de combien de blocs la pixellisation est faite**. Deux blocs sur un mot, ce sont deux nombres, et deux nombres ne permettent pas d'identifier une chaîne. Quarante blocs sur le même mot, ce sont quarante nombres, et quarante suffisent largement. C'est pourquoi le Caviardage d'image indique le nombre de blocs de la pixellisation la plus fine de l'image au lieu de qualifier un réglage de « fort » : le nombre est le fait, l'adjectif n'en est qu'une opinion.

### Flou

Chaque pixel devient une moyenne pondérée de ses voisins. C'est une convolution, et les convolutions sont en principe inversibles : retrouver l'original à partir d'une copie floutée est un problème standard traité par des logiciels standards, et il réussit le mieux justement dans le cas qui compte ici, celui d'un texte net flouté avec un petit rayon.

Rien de tout cela ne rend la pixellisation et le flou inutiles. Un visage à l'arrière-plan d'une photo de rue, un numéro d'immeuble en face, l'écran d'un collègue derrière vous en visioconférence : tout cela convient très bien, et l'image continue de ressembler à une image. La règle est simple : **si cela se lit comme du texte, masquez-le en noir.**

![L'éditeur : une photo avec un rectangle opaque sur une partie, le choix entre noir, pixellisation et flou, un curseur d'intensité et un récapitulatif des zones marquées.](https://abox.tools/screens/redact-an-image/cover.webp)

Trois façons de couvrir quelque chose, et elles ne se valent pas. Cette section porte sur celle qui résiste à quelqu'un qui essaierait de la défaire.

## Quatre vérifications avant d'envoyer

Elles prennent une minute à elles toutes et fonctionnent sur le résultat de n'importe quel outil, celui-ci compris. Une affirmation vérifiable vaut mieux qu'une affirmation à croire.

1. **Essayez de sélectionner le texte.** Ouvrez le fichier et faites glisser sur la zone recouverte. Si quelque chose se surligne, le texte est toujours dans le document et vous regardez une forme posée dessus.
2. **Ouvrez-le dans un éditeur et cherchez des calques.** Un seul calque, nommé quelque chose comme « Arrière-plan », c'est l'allure d'une image caviardée. Un objet rectangle séparé signifie que l'original est dessous.
3. **Regardez la vignette.** Certains gestionnaires de fichiers et visionneuses affichent la vignette intégrée plutôt que de relire l'image. Si la petite version montre encore ce que vous avez recouvert, le fichier a été modifié au lieu d'être reconstruit.
4. **Zoomez à fond sur les bords du cadre.** Un caviardage appliqué aux pixels présente une limite franche exactement à la frontière. Un bord doux ou semi-transparent signifie que quelque chose a été dessiné par-dessus avec une opacité, et une opacité inférieure à 100 % est une copie de l'original avec une teinte dessus.

## Recadrez plutôt que de recouvrir, quand c'est possible

Si ce que vous cachez se trouve au bord de l'image — un en-tête avec un nom de compte, un onglet de navigateur, une barre des tâches portant votre identifiant — le recadrage est plus solide que le recouvrement et donne un fichier plus net. Il n'y a aucun cadre à suspecter, puisqu'il n'y a plus rien du tout.

Le [Redimensionneur d'images](https://abox.tools/fr/redimensionner-une-image/) recadre, et [son guide](https://abox.tools/fr/guides/redimensionner-une-image/) décrit ce qu'il fait d'autre. Pour ce qui est au milieu, employez le caviardage.

## Une capture d'écran est souvent le pire des cas

Sur une capture, l'image n'est presque jamais la seule chose qui vous identifie. Avant d'en envoyer une, regardez ce qui entoure la partie que vous vouliez montrer : le titre de la fenêtre, la barre d'adresse et sa liste de suggestions, les onglets ouverts, une notification, l'heure et la date, la barre des tâches, un avatar connecté dans un coin, le nom du réseau wifi. Chacun de ces éléments peut vous situer, et aucun n'est ce que vous regardiez au moment de la capture.

## Rien de tout cela n'exige un envoi

Lire une image, écrire par-dessus certains de ses pixels et la réencoder sont des choses que tous les navigateurs savent faire depuis des années. Il n'existe aucune raison technique pour que la photo de votre passeport, de votre bulletin de salaire ou de votre relevé bancaire fasse l'aller-retour vers le serveur d'un inconnu pour se voir poser un rectangle noir. Et ce sont précisément les images que reçoit un outil de caviardage.

Celui d'ici ne les envoie nulle part : la `Content-Security-Policy` de la page nomme chaque adresse qu'elle peut contacter, et aucune ne nous appartient. Chargez la page, débranchez-vous d'internet et caviardez quelque chose quand même si vous préférez vérifier plutôt que croire. [Est-il sûr d'envoyer ses fichiers à un convertisseur en ligne ?](https://abox.tools/fr/guides/est-il-sur-d-envoyer-ses-fichiers/) propose trois autres vérifications applicables à n'importe quel outil.
