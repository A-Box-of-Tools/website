# Comment redimensionner une image sans l'abîmer

Le redimensionnement est le seul travail d'image où les dégâts sont décidés avant d'appuyer sur le bouton, par le chiffre que vous tapez et la forme que vous demandez. Voici ce que chaque choix fait à l'image, et lesquels vous pouvez défaire.

[Ouvrir Redimensionneur d'images](https://abox.tools/fr/redimensionner-une-image/): Vous dites la taille. Vous tracez le cadre. Vous choisissez le format.

Dernière mise à jour 26 août 2026

## La réponse courte

Ouvrez le [redimensionneur d'images](https://abox.tools/fr/redimensionner-une-image/), déposez-y votre image, tapez un seul chiffre, la largeur en général, et laissez l'autre vide. La hauteur découle de la forme de l'image, ce qui est presque toujours ce qu'on voulait : « 1920 de large » veut dire « 1920 de large et la hauteur que cela donne ».

Tout ce qui suit est pour les cas où un seul chiffre ne suffit pas : quand on vous a donné un cadre à deux côtés, quand l'image doit grossir, ou quand tout un dossier de fichiers doit ressortir pareil.

![L'étape 3 du redimensionneur : une largeur de 1920, une hauteur laissée vide affichant automatique, et en dessous une ligne disant que photo.jpg fait 2400 sur 1600 et sortira en 1920 sur 1280.](https://abox.tools/screens/resize-an-image/one-number.webp)

Un seul nombre saisi. L'outil calcule l'autre et le dit avant que quoi que ce soit ne soit redimensionné.

## Réduire est sans danger. Agrandir ne l'est pas.

Ce ne sont pas deux sens d'une même opération, et il vaut la peine de dire clairement pourquoi.

**Réduire une image** jette de l'information, et dans le seul sens bénin du terme : il entre plus de pixels qu'il n'en sort, et chaque pixel du résultat est donc une moyenne de détail réellement mesuré. Une copie réduite proprement est en général *plus belle* que l'original regardé à cette taille, parce que le moyennage supprime le bruit. Rien n'est inventé.

**Agrandir une image** doit inventer. Le détail ne manque pas dans le fichier ; il n'a jamais été photographié. Tout ce qu'un agrandisseur peut faire, c'est deviner les pixels intermédiaires d'après leurs voisins, or une supposition entre deux valeurs connues donne une rampe douce, et c'est pourquoi une photo agrandie paraît molle plutôt que nette. C'est une copie plus grande de la même image, pas une copie plus détaillée.

C'est pourquoi « ne jamais agrandir une image au-delà de sa taille de départ » est actif par défaut dans l'outil d'ici. Décochez-le si vous avez réellement besoin du nombre de pixels, pour une imprimerie qui exige une taille minimale ou un gabarit qui refuse tout ce qui passe sous une largeur, mais faites-le en sachant que vous achetez des pixels et non du détail.

Les agrandisseurs par apprentissage automatique qui semblent, eux, ajouter du détail sont une tout autre chose : ils inventent une texture plausible à partir d'un modèle de ce à quoi les images ressemblent d'habitude. Pour un fond d'écran, c'est très bien. Pour la photographie d'une personne, d'un document, ou de tout ce dont quelqu'un tirera une conclusion, comprenez que le détail supplémentaire est une fiction.

## Trois façons de dire la taille voulue

La plupart des outils, celui-ci compris, acceptent les mêmes trois, et elles conviennent à des travaux différents.

- **Des pixels exacts.** À utiliser quand quelqu'un a précisé le nombre : un avatar qui doit faire ⁦400 × 400⁩, une bannière qui doit faire 1500 de large. Remplissez un côté et laissez l'autre suivre, sauf si on vous a donné les deux.
- **Un pourcentage.** À utiliser quand vous voulez tout proportionnellement plus petit sans vous soucier du chiffre exact, par exemple « moitié moins » pour un jeu de photos destinées à un document.
- **Un plus grand côté.** La plus utile des trois pour un lot mêlé. « Plus grand côté 1600 » fait tenir chaque image dans un carré de 1600 pixels, qu'elle soit verticale ou horizontale, ce qui est en pratique ce que veut dire « mets-moi tout ça à une taille raisonnable ».

## Quand le cadre n'a pas la forme de l'image

C'est là que le redimensionnement se décide réellement. Si vous donnez une largeur et une hauteur qui ne correspondent pas aux proportions de votre image, quelque chose doit céder, et il n'y a exactement que quatre choses qui le peuvent :

- **Tenir dans le cadre.** L'image entière est gardée et ressort plus petite que le cadre sur un axe. Rien n'est perdu et rien n'est déformé ; vous n'obtenez simplement pas les dimensions exactes demandées. C'est le bon comportement par défaut pour à peu près tout.
- **Remplir le cadre et couper ce qui dépasse.** Vous obtenez exactement les dimensions demandées, et les parties de l'image qui débordent ont disparu. Bon pour les vignettes, les avatars et les couvertures, où la forme est imposée et le sujet est au milieu. Mauvais quand ce qui compte est près d'un bord.
- **Compléter.** L'image entière est gardée, centrée, et l'espace restant est rempli d'une couleur que vous choisissez. Bon quand un système exige des dimensions exactes et que vous ne pouvez rien perdre de l'image, comme c'est souvent le cas des fiches produit.
- **Étirer.** L'image est écrasée ou tirée pour entrer. Ce n'est jamais ce que vous voulez, sauf à le faire exprès, et c'est celui que tout le monde reconnaît instantanément comme faux.

Si vous vous surprenez à tendre la main vers l'étirement, ce que vous voulez sans doute, c'est recadrer.

![Les mêmes champs avec 1200 dans les deux, et en dessous un menu disant : si les formats ne concordent pas, tenir dedans, la photo entière et un côté plus court que demandé.](https://abox.tools/screens/resize-an-image/fit.webp)

Remplissez les deux côtés et le menu apparaît. C'est le seul réglage de cette page qui puisse perdre une partie de la photo, d'où l'intérêt de lire les quatre réponses ci-dessous avant d'y toucher.

## Recadrer est un autre travail, et souvent le bon

Redimensionner change le nombre de pixels qui décrivent l'image entière. Recadrer change la partie de l'image que vous gardez. Les gens tendent la main vers le premier en pensant au second étonnamment souvent : « il faut que ce soit carré » est un problème de recadrage, pas de redimensionnement.

Faites-les dans cet ordre : recadrez d'abord selon le cadrage voulu, puis redimensionnez le résultat à la taille voulue. Faire l'inverse revient à choisir le recadrage dans une image qui a déjà perdu des pixels.

L'outil d'ici fait les deux en une passe pour cette raison : tracez un cadre, verrouillez-le sur une forme s'il vous faut une proportion précise, puis dites la taille de sortie voulue. Le faire en une passe veut aussi dire que l'image n'est encodée qu'une fois, ce qui compte pour la raison exposée dans la section suivante.

### Recadrer tout un lot

Un cadre tracé sur une image est appliqué aux autres comme la même zone *relative* : les mêmes fractions de la largeur et de la hauteur propres à chaque fichier. Pour un dossier de captures ou d'exports tous de la même taille, c'est exactement le même rectangle. Pour un lot mêlé, c'est le même cadrage plutôt que le même rectangle, ce qui est en général ce qu'on voulait, mais vaut d'être su avant de lui confier cinquante fichiers.

## Ce que coûte le réencodage, et comment n'en faire qu'un

Redimensionner un JPEG ou un WebP, c'est le décoder, mettre les pixels à l'échelle, puis les réencoder, et c'est cette dernière étape qui est avec perte. Ce n'est pas la mise à l'échelle elle-même qui vous coûte de la qualité ; c'est le réencodage.

Deux conséquences. D'abord, le réglage de qualité en sortie compte : quelque part autour de 80 à 85, c'est invisible pour une photographie et considérablement plus léger que 100. Ensuite, ne le faites qu'une fois. Redimensionner une image déjà redimensionnée deux fois, ce sont trois générations d'encodage avec perte, et cela se voit.

Un PNG n'a pas ce coût, parce qu'il est sans perte : un PNG redimensionné, ce sont exactement les pixels mis à l'échelle. Si vous travaillez en plusieurs étapes et que le format final n'est pas encore décidé, passer par du PNG au milieu évite d'empiler les générations.

Un détail vaut d'être connu à propos de l'outil d'ici : un fichier que vous ne changez pas réellement vous est rendu octet pour octet plutôt que réencodé. Demandez « plus grand côté 1600 » sur un lot et ceux qui sont déjà sous 1600 ressortent intacts, étiquettes comprises. Un outil qui les réencoderait discrètement vous coûterait de la qualité sur des fichiers que personne ne lui avait demandé de changer.

## La transparence, et ce qu'elle devient

Le PNG et le WebP savent stocker la transparence. Le JPEG, non, faute de canal alpha dans ce format. Enregistrer une image transparente en JPEG oblige donc à mettre quelque chose derrière, et ce quelque chose est une couleur unie.

La plupart des outils prennent du blanc sans le dire, ce qui va très bien jusqu'au jour où votre logo atterrit sur une page sombre avec un rectangle blanc autour. Choisissez la couleur délibérément, ou enregistrez en PNG ou en WebP et gardez la transparence. La même couleur sert derrière un cadre complété, l'autre endroit où l'on rencontre cela par surprise.

## Quel outil, si on vous a donné un chiffre

Deux chiffres différents circulent, et ils appellent des outils différents.

**« 1200 pixels de large »** est un problème de dimensions. Le [redimensionneur d'images](https://abox.tools/fr/redimensionner-une-image/) est le bon : vous dites combien de pixels vous voulez et il vous les donne.

**« Sous 500 KB »** est un problème de taille de fichier, et le redimensionnement n'est qu'une des façons de le résoudre. Le [compresseur d'images](https://abox.tools/fr/compresser-une-image/) cherche la meilleure qualité qui tienne dans votre cible et ne redimensionne que si la qualité seule n'y arrive pas ; [son guide](https://abox.tools/fr/guides/compresser-une-image-a-une-taille-precise/) traite de ce que cela coûte.

## Rien de tout cela ne demande un envoi

Décoder une image, la mettre à l'échelle et la réencoder sont des choses que tous les navigateurs savent faire depuis des années, et c'est la machinerie même dont une page web se sert pour dessiner une image à une autre taille. Il n'y a aucune raison technique pour que votre photo voyage jusqu'à un serveur et en revienne pour ressortir plus petite, et l'outil d'ici ne l'envoie nulle part : la `Content-Security-Policy` de la page énumère toutes les adresses qu'elle peut contacter, et aucune n'appartient à ce site.

Chargez la page, coupez votre connexion, et redimensionnez quelque chose quand même, si vous préférez vérifier plutôt qu'on vous le dise. [Est-il sûr d'envoyer ses fichiers à un convertisseur en ligne ?](https://abox.tools/fr/guides/est-il-sur-d-envoyer-ses-fichiers/) expose trois autres vérifications applicables à n'importe quel outil.
