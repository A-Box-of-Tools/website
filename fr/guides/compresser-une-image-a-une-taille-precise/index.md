# Comment compresser une image à une taille de fichier exacte

On vous a donné un chiffre, 100 KB, 500 KB ou 2 MB, et votre photo en est très loin. Voici ce que ce chiffre coûte, à quoi le dépenser, et comment savoir si le résultat est encore assez bon pour être envoyé.

[Ouvrir Compresseur d'images](https://abox.tools/fr/compresser-une-image/): Vous donnez la taille. Il se charge du reste.

Dernière mise à jour 26 août 2026

## La réponse courte

Ouvrez le [compresseur d'images](https://abox.tools/fr/compresser-une-image/), déposez-y la photo, tapez le chiffre qu'on vous a donné et appuyez sur le bouton. Il encode l'image plusieurs fois, garde le meilleur résultat qui tienne sous votre cible, et vous dit ce que cela a coûté. Pour la plupart des photographies et la plupart des cibles, le résumé honnête est que vous ne verrez pas la différence.

Le reste de cette page est pour les fois où cela ne se passe pas ainsi : quand le résultat paraît mou, quand un PNG bouge à peine, ou quand vous voulez savoir ce que l'outil fait réellement à votre image avant de l'envoyer à quelqu'un.

![La carte de l'objectif : 200 ko saisis, des boutons pour les limites courantes, un menu de format et une note indiquant ce que l'outil va tenter.](https://abox.tools/screens/compress-an-image-to-a-target-size/target.webp)

Indiquez le chiffre qu'on vous a donné. Tout ce qui suit est l'outil qui travaille vers lui, plutôt que vous qui devinez sur un curseur de qualité.

## Ce qu'une limite de taille demande vraiment

Un JPEG ou un WebP ne stocke pas votre photographie. Il en stocke une description, et le réglage de qualité décide du niveau de détail auquel cette description a droit. Baissez-le et le fichier rétrécit parce que la description devient plus vague : les textures fines sont moyennées, les dégradés se mettent en bandes, et les bords se couvrent d'un léger halo de blocs.

Une limite de taille est donc un budget de détail. La question utile n'est pas « puis-je atteindre 500 KB », puisqu'on peut toujours atteindre n'importe quel chiffre, mais bien « quelle part de l'image dois-je abandonner pour y arriver, et est-ce que cela compte pour l'usage que j'en fais ? »

Deux règles empiriques. Une photographie d'une scène réelle, avec ses visages, son feuillage et ses tissus, cache bien la compression, parce que l'œil n'y trouve aucune zone parfaitement plate où remarquer les dégâts. Une capture d'écran, un graphique, un logo ou tout ce qui a de grands aplats et des bords de texte francs la montre immédiatement, et devrait en général être un PNG ou un WebP plutôt qu'un JPEG.

## Pourquoi il n'y a pas de formule, et que faire à la place

Il n'existe aucun moyen de calculer le réglage de qualité qui produit un fichier de 500 KB. Le rapport entre les deux dépend entièrement du contenu de l'image : au même réglage, une photographie d'un mur nu peut ressortir dix fois plus légère qu'une photographie de forêt. Tout outil qui vous propose « qualité : 60 » et croise les doigts devine à votre place.

La seule méthode fiable est d'essayer. Encoder l'image, regarder la taille, ajuster, encoder à nouveau. Le faire à la main est fastidieux, et c'est pourquoi les compresseurs demandent plutôt un chiffre de qualité, ce qui vous refile le fastidieux. Le faire automatiquement, c'est environ huit encodages, et huit encodages d'une photo de téléphone représentent une fraction de seconde sur toute machine construite cette décennie : c'est pourquoi l'outil de ce site demande la taille et fait la recherche lui-même.

Chaque taille qu'il rapporte est un vrai fichier encodé, pas une estimation. Cela compte quand un formulaire a une limite dure : une estimation optimiste de 2 %, c'est un envoi refusé.

## Dépensez la qualité avant de dépenser les pixels

Il n'y a que deux façons d'alléger un fichier image. Décrire la même image moins précisément, c'est la qualité. Ou décrire moins de pixels, c'est le redimensionnement. Ce n'est pas équivalent, et l'ordre compte.

La qualité passe en premier, parce que la première tranche de 30 % de réduction est réellement invisible sur une photographie : vous y jetez du détail que le format conservait plus soigneusement qu'aucun œil ne peut le vérifier. Les pixels passent en second, parce qu'une fois la qualité descendue assez bas pour que les artefacts se voient, une image plus petite à une qualité correcte est plus belle qu'une image en taille pleine mais abîmée. Moins de bons pixels valent mieux que davantage de mauvais.

C'est toute la stratégie, et elle vaut d'être connue même si vous utilisez un autre outil : baissez la qualité jusqu'à ce que cela commence à avoir l'air faux, puis réduisez l'image au lieu de la baisser davantage.

### Quand redimensionner exprès

Parfois, les pixels n'ont jamais été nécessaires. Une photo de 4000 pixels de large affichée dans une colonne de 600 pixels sur une page web transporte six fois le détail que quiconque verra. Si vous connaissez la destination finale de l'image, redimensionnez-la d'abord et le problème de taille disparaît souvent sans qu'une once de qualité soit dépensée. Le [redimensionneur d'images](https://abox.tools/fr/redimensionner-une-image/) est l'outil pour cela, et [son propre guide](https://abox.tools/fr/guides/redimensionner-une-image/) traite du choix d'une taille.

## Choisir un format

Trois formats valent d'être connus, et les navigateurs savent écrire les trois.

- **Le JPEG** est fait pour les photographies. Il est avec perte, il est compris par tout ce qui a jamais été fabriqué, et pour une image de scène réelle il reste un excellent choix. Il ne sait pas stocker de transparence.
- **Le WebP** fait le même travail, en mieux : environ 25 à 35 % plus léger que le JPEG à une qualité qu'on ne distingue pas, et il garde la transparence. Tous les navigateurs actuels le lisent. Quelques vieilles applications de bureau et certains formulaires d'envoi d'entreprise ne le font toujours pas, ce qui est la seule vraie raison de ne pas s'en servir.
- **Le PNG** est sans perte, c'est-à-dire exact et lourd. C'est la bonne réponse pour les captures d'écran, les logos, le dessin au trait et tout ce qui a des bords francs ou des aplats, et la mauvaise réponse pour une photographie.

Si celui qui vous a demandé le fichier ne vous impose rien, le WebP vous amènera à la cible avec moins de dégâts visibles que le JPEG. Si le fichier part dans quelque chose d'ancien, ou dans un système que vous ne pouvez pas tester, le JPEG est la réponse sûre.

## Pourquoi votre PNG ne maigrira pas beaucoup

C'est la surprise la plus courante, et ce n'est pas un défaut de l'outil que vous utilisez. Le PNG est un format sans perte : il stocke les pixels exacts, et il n'a aucune molette de qualité à tourner, parce que tourner une telle molette en ferait un autre format. Tout ce qu'un compresseur PNG peut faire, c'est empaqueter les mêmes pixels plus astucieusement, ce qui vaut en général quelques pour cent.

Donc, s'il vous faut un fichier bien plus léger et qu'il doit rester un PNG, le seul levier restant est la taille, c'est-à-dire moins de pixels ou moins de couleurs. S'il a le droit de cesser d'être un PNG, la question est ce qu'il y a dedans :

- **Une photographie enregistrée en PNG.** Très courant, en général par accident, et le gain le plus facile de cette page : la convertir en JPEG ou en WebP la rendra souvent cinq à dix fois plus légère sans changement visible.
- **Une capture d'écran ou un schéma.** Convertissez en WebP, qui est sans perte lui aussi quand vous le lui demandez, et qui est généralement plus léger que le PNG pour les mêmes pixels. Passer en JPEG rendra les bords du texte flous.
- **Un logo avec transparence.** Le WebP garde la transparence ; le JPEG la remplira d'une couleur unie, ce qui n'est presque jamais ce que vous vouliez.

## Comment savoir si le résultat est assez bon

Regarder une vignette ne prouve rien, puisque tout a l'air correct en vignette. Deux vérifications valent mieux :

**Regardez-la en taille réelle, sur la zone la plus plate de l'image.** Le ciel, la peau, un mur peint. Les dégâts de compression apparaissent d'abord dans les dégradés doux, sous forme de blocs ou de bandes légères, bien avant de toucher les zones détaillées.

**Lisez la mesure, si l'outil vous en donne une.** Le compresseur d'ici décode son propre résultat, le compare à l'original et rapporte le SSIM : un chiffre qui compare la luminosité, le contraste et la structure locales plutôt que de compter les pixels modifiés, ce qui se rapproche bien davantage de ce qui gêne l'œil. Au-dessus de 0,98 environ, les deux images sont difficiles à séparer côte à côte. En dessous de 0,95 environ, regardez avant d'envoyer. Il rapporte aussi le PSNR, le traditionnel chiffre en décibels, pour qui le préfère.

Les deux sont calculés sur votre propre machine et vous sont montrés, et c'est tout l'intérêt de les avoir : cela fait de la « perte de qualité minimale » un chiffre vérifiable plutôt qu'une affirmation.

![Une ligne de résultat montrant l'original à 1,4 Mo et la copie compressée à 196 ko, avec la qualité qui y est parvenue et un lien pour les comparer.](https://abox.tools/screens/compress-an-image-to-a-target-size/results.webp)

Ce qui est réellement sorti, à côté de ce qui est entré. Le lien de comparaison est la façon de savoir si le chiffre vous a coûté quelque chose de visible.

## Trois choses à savoir avant d'envoyer le fichier

**Compresser efface les métadonnées.** Réencoder, c'est décoder l'image en pixels puis réencoder ces pixels, or un canvas rempli de pixels ne porte aucune étiquette : la position GPS, le modèle d'appareil, les horodatages et le reste ne sont donc simplement pas écrits dans le nouveau fichier. C'est généralement un bonus. Si vous vouliez les étiquettes disparues mais l'image intacte, c'est un autre travail : le [lecteur et effaceur EXIF](https://abox.tools/fr/supprimer-les-donnees-exif/) réécrit le conteneur sans rien recompresser, et [son guide](https://abox.tools/fr/guides/supprimer-les-donnees-exif-et-gps/) explique ce qu'il y a dedans.

**Ne compressez jamais deux fois le même fichier.** Chaque encodage avec perte jette du détail définitivement, et encoder une image déjà compressée en jette davantage, y compris les artefacts de la première passe, qu'il conserve fidèlement au prix du vrai détail. Repartez toujours de l'original et compressez une seule fois.

**Gardez l'original.** Il n'y a pas de retour possible après un encodage avec perte. Quoi que vous envoyiez, gardez quelque part le fichier de départ.

## Rien de tout cela ne demande un envoi

Tous les navigateurs livrent un encodeur JPEG, PNG et WebP depuis des années, et c'est le même code qui enregistre une image depuis un canvas. Compresser une image fait partie des travaux qui n'ont aucune raison technique de faire intervenir un serveur, et c'est pourquoi l'outil d'ici n'en a pas : l'image est décodée, encodée et mesurée sur votre propre machine, et il n'y a dans la `Content-Security-Policy` de la page aucune adresse appartenant à ce site vers laquelle elle pourrait être envoyée.

La façon la plus simple de le confirmer, ici comme ailleurs, est de charger la page, de couper la connexion, et de compresser quelque chose quand même. Si cela fonctionne encore, rien n'était envoyé. [Est-il sûr d'envoyer ses fichiers à un convertisseur en ligne ?](https://abox.tools/fr/guides/est-il-sur-d-envoyer-ses-fichiers/) expose trois autres vérifications du même genre.
