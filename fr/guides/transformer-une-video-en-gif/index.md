# Comment transformer une vidéo en GIF

Le GIF est un format de 1987 qui stocke des images entières plutôt que du mouvement : celui qu'on tire d'une vidéo est donc toujours gros. Voici lequel des trois réglages déplacer quand il est trop gros, et ce que chacun vous rapporte.

[Ouvrir Vidéo en GIF](https://abox.tools/fr/video-en-gif/): Choisissez le passage, la taille et la cadence.

Dernière mise à jour 26 août 2026

## La réponse courte

Ouvrez le [convertisseur de vidéo en GIF](https://abox.tools/fr/video-en-gif/), déposez-y le clip, marquez les secondes voulues, et laissez la largeur à 480 et la cadence à 12 images par seconde. C'est le réglage que veulent la plupart des GIF. Si le fichier ressort trop gros, baissez la largeur avant de toucher à quoi que ce soit d'autre : c'est le réglage qui paie deux fois.

Le reste de cette page explique pourquoi, parce que « mon GIF fait 14 MB » est le problème que tout le monde a réellement, et que le bouton à tourner n'est pas évident.

## Pourquoi un GIF tiré d'une vidéo est si énorme

Un codec vidéo stocke du *mouvement*. Il écrit une image complète toutes les deux secondes environ puis, pour chaque image intermédiaire, une description de la façon dont cette image a bougé : ce bloc de pixels a glissé de quatre vers la gauche, cette zone s'est un peu assombrie. Un clip de cinq secondes peut faire quelques centaines de kilooctets parce que l'essentiel est fait d'instructions à propos d'une image que vous avez déjà.

Le GIF n'a rien de tout cela. Il a été achevé en 1989, avant que rien de cela n'existe. Chaque image est une image, compressée pour elle-même avec un procédé conçu pour des captures d'écran de tableur. Il n'y a aucune estimation de mouvement nulle part dans le format, et aucun moyen d'en ajouter une.

Le chiffre à attendre est donc **dix fois le poids de la vidéo**, et aucun convertisseur ne vous en dissuadera. Ce qu'un bon convertisseur peut faire, c'est ne rien gaspiller par-dessus, et vous donner les trois réglages qui en décident réellement.

![La carte de section : une image de vidéo avec un code temporel, et une barre montrant un morceau de quatre secondes marqué dans un plan de vingt.](https://abox.tools/screens/turn-a-video-into-a-gif/section.webp)

La section d'abord, parce que chaque réglage du dessous est multiplié par le nombre de secondes gardées.

## Les trois réglages, et ce que chacun coûte

Tout ce qui fait le poids d'un GIF se ramène au nombre de pixels qu'il contient, c'est-à-dire la durée multipliée par la cadence multipliée par la surface d'une image.

- **Le passage, effet linéaire.** Deux fois plus long, c'est deux fois plus d'images et à peu près deux fois le fichier. C'est celui que la plupart des gens comprennent déjà, et il vaut la peine d'être impitoyable : un GIF qui fait son effet en trois secondes est un meilleur GIF en plus d'être un GIF plus léger.
- **La largeur, effet quadratique.** Diviser la largeur par deux divise la hauteur avec elle : c'est donc le *quart* des pixels. Passer de 640 à 320 n'économise pas un peu moins de la moitié ; cela économise environ les trois quarts. C'est le réglage vers lequel personne ne tend la main en premier et celui qui paie le mieux.
- **La cadence, effet linéaire.** Dix images par seconde, c'est les deux tiers du poids de quinze. C'est aussi le réglage où la perte est la plus visible, parce qu'un mouvement trop lent se lit comme cassé plutôt que comme léger.

Un exemple chiffré. Six secondes d'un clip de téléphone à ses ⁦1080 × 1920⁩ et 30 images par seconde, ce sont 180 images de deux millions de pixels, soit environ 350 millions de pixels, ce qui n'est pas un GIF mais une prise d'otages. Les mêmes six secondes à 480 de large et 12 images par seconde font 72 images de 400 000 pixels, soit 30 millions, environ un douzième, et cela ressemble à ce que les gens appellent un GIF.

![La carte d'export : une largeur de 480, une cadence d'images, un choix de tramage et un récapitulatif estimant les images et la taille.](https://abox.tools/screens/turn-a-video-into-a-gif/size.webp)

Trois réglages et une estimation qui bouge avec eux. Lequel dépenser en premier, c'est le sujet de cette section.

## Quelle cadence choisir

Douze est le défaut ici et la bonne réponse étonnamment souvent. C'est la cadence qu'emploie l'animation dessinée à la main depuis un siècle : assez rapide pour que l'œil la lise comme un mouvement continu, assez lente pour que vous ne payiez pas des images que personne ne voit.

- **5 à 8**, un air de diaporama. Convient pour un panoramique lent ou une capture d'écran où rien ne bouge vite.
- **10 à 15**, la zone normale. Se lit comme du mouvement. À peu près tout GIF qui vaut la peine d'être fait est là-dedans.
- **20 à 25**, fluide, et à peu près le double du poids de 12 pour une différence que la plupart des spectateurs ne sauront pas nommer. Cela vaut le coup pour du mouvement rapide, un clip sportif, tout ce qui contient un panoramique filé.

Il existe un plafond absolu, et autant le savoir : le GIF stocke la durée d'affichage de chaque image en centièmes de seconde, et tous les navigateurs traitent un délai inférieur à deux centièmes comme s'il en valait dix. Le vrai maximum est donc de 50 images par seconde, et un fichier qui en demande 100 jouera en silence à 10. Un convertisseur qui vous propose du 60 images par seconde soit l'ignore, soit s'apprête à vous surprendre.

## 256 couleurs, et à quoi sert le tramage

L'autre moitié de l'âge du format : un GIF porte une table d'au plus 256 couleurs, et chaque pixel est un numéro qui pointe dedans. Une image de vidéo en a jusqu'à seize millions. Presque tout cela est jeté, et la façon dont c'est jeté fait l'essentiel de l'allure d'un GIF.

Un bon convertisseur compte les couleurs de *votre* clip et en choisit 256 qui lui conviennent, plutôt que d'utiliser un jeu figé. Un plan de forêt reçoit 256 verts ; un plan de coucher de soleil reçoit 256 oranges. C'est ce que fait l'outil d'ici, sur chaque image du passage plutôt que sur la première seulement, si bien qu'une couleur qui n'apparaît qu'à la fin a quand même sa place.

**Le tramage** est ce qui se passe là où la couleur dont vous avez besoin manque encore. Au lieu d'arrondir toute une zone à la couleur disponible la plus proche, ce qui transforme un ciel doux en quatre aplats aux marches visibles, il alterne les deux couleurs les plus proches selon un motif fin, et à une distance de vue normale votre œil les mélange en celle qui n'est pas là.

- **Laissez-le activé** pour tout ce qui est photographique : ciels, peau, dégradés, ombres, film.
- **Désactivez-le** pour les aplats : captures d'écran, dessin au trait, logos, dessins animés, tout ce qui a de grandes zones d'une seule teinte. Il n'y a pas de dégradé à protéger, et le fichier est plus léger et plus propre sans lui.

Un détail à connaître si vous comparez des convertisseurs. La façon évidente de tramer, la diffusion d'erreur qu'utilisent la plupart des logiciels d'image, fait dépendre le résultat de chaque pixel des pixels qui l'entourent. Dans une animation, cela veut dire qu'un fond qui ne bouge pas est tramé différemment à chaque image : il grouille visiblement, et chaque image doit être stockée en entier parce que chaque pixel a techniquement changé. L'autre solution, un tramage ordonné, ne dépend que de la position du pixel : un fond immobile reste donc parfaitement immobile. C'est ce qu'utilise cet outil, et c'est pourquoi ses fichiers sont à la fois plus légers et plus calmes.

## Quand ne pas faire de GIF du tout

La question mérite d'être posée, parce que la réponse honnête est souvent « ne le faites pas ». Un MP4 ou un WebM muet en boucle pèse environ un dixième de la même animation en GIF, se lit de la même façon, et c'est de toute manière ce en quoi toutes les plateformes sociales convertissent votre GIF après l'envoi.

Gardez le GIF là où la destination en a réellement besoin :

- un endroit qui n'accepte qu'une image, comme beaucoup de messageries, de forums, de wikis et de logiciels de courriel ;
- un README ou une page de documentation, où un GIF joue dans le fil du texte quand une vidéo réclame un lecteur ;
- une présentation ou un document qui doit continuer de bouger hors ligne ;
- un emoji, un autocollant ou une réaction, assez petits pour que rien de l'arithmétique ci-dessus ne compte.

Là où le son compte, la question se répond d'elle-même : le GIF n'a jamais eu d'audio et n'en aura jamais. Coupez plutôt la vidéo, car le [coupeur de vidéos](https://abox.tools/fr/couper-une-video/) en extrait un passage sans réencoder une seule image.

## Passer sous une limite de taille

La raison principale pour laquelle on règle un GIF est une limite à l'autre bout. Dans l'ordre approximatif de leur dureté :

- **Le courriel**, 10 à 25 MB pour tout le message, et une pièce jointe proche de cela se fait retirer ou rejeter par quelque chose en chemin. Visez bien en dessous.
- **Les messageries et les forums**, couramment 8 à 10 MB, parfois bien moins pour un aperçu en ligne plutôt qu'un téléchargement.
- **Un README GitHub**, 10 MB par fichier, et tout ce qui dépasse deux mégaoctets donne à la page l'air d'être cassée sur un téléphone.
- **Les emplacements d'autocollants et d'emojis**, souvent quelques centaines de kilooctets, ce qui veut dire une petite largeur et un passage court, pas une cadence plus basse.

L'ordre à essayer quand vous dépassez : raccourcir le passage, puis diviser la largeur par deux, puis baisser la cadence, puis désactiver le tramage. Les deux premiers valent plus que les deux derniers réunis.

## Rien de tout cela ne demande un envoi

Convertir une vidéo en GIF, c'est décoder, redimensionner, compter des couleurs et compresser, quatre choses qu'un navigateur sait faire tout seul depuis des années. L'outil lié en haut fait tout cela sur votre machine : le fichier est lu sur votre disque, les images sont décodées par votre navigateur, et le GIF est assemblé en mémoire puis remis à vos téléchargements.

Cela mérite plus d'attention ici qu'ailleurs. Les clips que les gens transforment en GIF sont des clips personnels : un moment d'une vidéo de famille, une capture d'écran de quelque chose au travail, quelques secondes d'un appel. Un convertisseur qui veut qu'on les lui envoie demande une copie de tout cela, et il ne reste plus aucune raison technique de dire oui.
