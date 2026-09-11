# Comment modifier un GIF image par image

Il n'y a pas d'éditeur de GIF ici, et il n'en faut pas : un découpeur qui décompose l'animation en images, et un fabricant qui en bâtit une à partir d'images, forment un éditeur avec un dossier au milieu — et le dossier est l'endroit où vous faites la retouche, avec ce que vous utilisez déjà pour les images.

Dernière mise à jour 26 août 2026

## La réponse courte

1. **Décomposez-le.** Ouvrez le [Découpeur de GIF](https://abox.tools/fr/decouper-un-gif-en-images/) et déposez le GIF. Chaque image devient son propre PNG — telle qu'elle apparaît à l'écran, transparence gardée — et le ZIP contient une liste des temps, les délais par image notés pour le remontage.
2. **Retouchez le dossier.** Supprimez les images de trop, retouchez celles qui doivent changer dans n'importe quel éditeur d'images, renommez pour réordonner. Un dossier de PNG est un format que tout comprend.
3. **Remontez-le.** Déposez le dossier sur le [Fabricant de GIF](https://abox.tools/fr/creer-un-gif/), réglez les temps de pose — ou appuyez-vous sur la liste — choisissez la palette, et exportez.

Les trois étapes tournent dans votre navigateur. Rien n'est envoyé à aucun moment, ce qui compte plus que d'habitude ici : les GIF que l'on répare sont si souvent des captures d'écran où quelque chose de sensible reste à moitié visible.

## Ce que le découpeur peut vous dire avant la retouche

Le découpeur montre, pour chaque image, son délai, sa position, sa taille et sa règle d'effacement — et ce panneau mérite un regard avant de toucher à quoi que ce soit, parce qu'il explique les deux surprises de la plupart des GIF.

D'abord : les images ne sont pas toutes entières. Beaucoup de GIF ne stockent que les pixels qui ont changé, rapiécés sur l'image d'avant — le découpeur offre chaque image *telle qu'elle apparaît* ou *telle qu'elle est stockée*, et pour la retouche vous voulez presque toujours *telle qu'elle apparaît*, pour que chaque PNG tienne debout seul. Ensuite : les délais vont par image, pas en un seul chiffre. La pause sur la chute est un vrai délai sur une vraie image, et la liste des temps est ce qui la fait traverser l'aller-retour.

Pour les coupes courantes, l'étape du dossier est même facultative : garder une image sur deux ou sur cinq, ou cocher celles à garder, est intégré au découpeur — et diviser les images par deux est l'amaigrissement le plus efficace qu'un GIF puisse recevoir.

![Le séparateur montrant douze images numérotées d'une animation, chacune avec le temps pendant lequel elle reste affichée.](https://abox.tools/screens/edit-a-gif-frame-by-frame/apart.webp)

Chaque image, numérotée, avec son propre délai. C'est la moitié qui vous dit ce que vous modifiez avant que vous ne le modifiiez.

## Ce que coûte le remontage, honnêtement

Un GIF tient au plus 256 couleurs, choisies à la construction. Le remontage quantifie les images de nouveau — une palette partagée, ou les meilleures couleurs par image — et sur de la matière photographique cette seconde quantification peut se voir. Sur les captures d'écran et les dessins, la cargaison habituelle, elle ne se voit pas : ils n'ont jamais utilisé 256 couleurs.

Les autres leviers du fabricant sont ceux que décrit le [guide du budget GIF](https://abox.tools/fr/guides/gif-a-partir-d-un-extrait-video/) : moins de couleurs, le tramage de Floyd-Steinberg pour les dégradés, et le comportement de boucle — toujours, une fois, ou un nombre.

Pour voir si l'opération a réussi — et où vivent vraiment les octets — déposez le résultat sur l'[Analyseur de GIF](https://abox.tools/fr/analyser-un-gif/) : il trace les images contre les octets, et l'image lourde est en général un repeint complet que quelqu'un aurait pu recadrer.

Le créateur propose lui-même le trajet : après l'export, une ligne sous son bouton de téléchargement porte le GIF tout frais droit dans l'analyseur, déjà chargé.

![Le créateur de GIF avec six images dans l'ordre, chacune avec un champ de délai, et une ligne pour régler tous les délais d'un coup.](https://abox.tools/screens/edit-a-gif-frame-by-frame/together.webp)

Et le retour. Les délais doivent être remis à la main, et c'est la partie de l'aller-retour qu'il vaut mieux connaître d'avance.

## Si vous faites cela chaque semaine

Découper, dossier, remonter — les étapes vivent sur des pages séparées parce que chacune fait un travail, et que chacune peut prouver seule que rien ne quitte votre machine. Mais tout cela est libre : licence MIT, un dossier par outil, des modules ES sans dépendances dont les README expliquent le décodeur, les règles d'effacement et le quantificateur.

Si la chirurgie de GIF est une corvée récurrente, pointez un agent de code vers le [dépôt](https://github.com/A-Box-of-Tools/website) et demandez-lui de plier la table d'images du découpeur et l'encodeur du fabricant en une page où supprimer une image est un clic. Les modules ont été écrits pour être lus, et les emporter est exactement ce à quoi sert la licence.
