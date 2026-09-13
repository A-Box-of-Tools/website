# Comparer des tailles — un graphique côte à côte, téléchargeable

Tapez les tailles, emportez l'image. Rien n'est envoyé pour la dessiner.

> Comparez des tailles côte à côte. Ajoutez un homme, une femme, un garçon, une fille et des objets — une porte, une fenêtre, un tableau blanc, un distributeur — en centimètres ou en pieds et pouces, et téléchargez le graphique en PNG ou en SVG. Il est dessiné dans votre navigateur.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/comparer-des-tailles/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos noms, tailles et le graphique qu'ils forment. Il n'y a pas de serveur.

Un graphique de tailles, c'est de l'arithmétique et un dessin : il n'y a pas de fichier à envoyer ni de service à interroger — et le seul fichier que cette page accepte, une image à vous à poser sur la règle, est lu ici et ne va nulle part. L'homme, la femme, le garçon et la fille sont des illustrations du domaine public livrées avec cette page, et le garçon et la fille sont des dessins d'enfants réels plutôt que d'adultes rapetissés — ce qui est précisément ce qui empêche un graphique de famille de sonner faux d'une manière que personne ne sait nommer. Chacune de ces étapes se passe dans quelques centaines de lignes de JavaScript de cette page, que vous pouvez lire. Il n'y a aucune fonction réseau, et cela compte ici parce que ce que vous tapez est une liste de personnes et la taille de chacune.

- ✗ Sans envoi
- ✗ Sans compte
- ✗ Sans filigrane
- ✓ Fonctionne hors ligne
- ✓ Open source

## Comment faire un graphique de comparaison de tailles

1. **Ajoutez tout le monde d'abord, l'allure viendra après.** Une ligne, c'est une figure, un nom, une taille et une couleur. Le nom est facultatif — un graphique de deux silhouettes anonymes avec leurs tailles au-dessus est souvent exactement ce qu'on veut — et les flèches de chaque ligne la déplacent à gauche ou à droite si l'ordre compte.
2. **Tapez la taille comme vous l'écrivez.** `173`, `1,73 m`, `5'8"`, `68 in` et `5 ft 8` sont tous lus correctement. La ligne sous la case montre ce qui a été compris, dans les deux systèmes, si bien qu'une mauvaise lecture est visible avant le dessin plutôt qu'après l'impression. Un nombre nu, ce sont des centimètres sur un graphique métrique et des pouces sur un graphique impérial, et un nombre nu inférieur à trois, ce sont des mètres — personne ne mesure 1,73 cm.
3. **Choisissez la figure qui correspond à la personne.** Un enfant mesure environ six têtes et un adulte sept et demie, si bien qu'un enfant dessiné comme un adulte rétréci a l'air faux d'une manière difficile à nommer et facile à voir. Le garçon et la fille sont des dessins d'enfants réels plutôt que des adultes rapetissés, et c'est l'essentiel de ce qui fait qu'un graphique de famille ressemble à une famille. Chaque ligne arrive en outre avec une taille déjà inscrite, si bien qu'ajouter quelqu'un dessine quelqu'un — tapez simplement par-dessus.
4. **Mettez quelque chose de familier sur le graphique.** Un nombre est abstrait, une porte ne l'est pas. Ajouter un seul objet d'une taille que tout le monde connaît — une porte, une fenêtre, un tableau de classe, un distributeur — est ce qui transforme un graphique qui énonce deux tailles en un graphique qui les montre. Le menu en contient vingt, regroupés, et chacun arrive comme une ligne ordinaire par-dessus laquelle vous pouvez taper vos propres chiffres. Les objets prennent une largeur en plus d'une hauteur, si bien qu'une porte fait 203 sur 81 et non une bande.
5. **Ou posez-y votre propre dessin.** **Votre propre image** prend un fichier sur votre machine et le pose sur la règle à la hauteur que vous lui donnez — ce vers quoi se tourner quand le graphique porte sur un produit, un véhicule ou un bâtiment plutôt que sur une personne. Un SVG est dessiné dans la couleur de sa ligne, comme toute autre silhouette ; une photographie ou un PNG y va tel quel. L'un comme l'autre garde ses propres proportions, et l'un comme l'autre est lu ici plutôt qu'envoyé où que ce soit.
6. **Réglez la règle sur les unités auxquelles pense votre lecteur.** Passer des centimètres aux pieds réécrit ce qu'il y a dans les cases plutôt que de le réinterpréter, si bien que le graphique lui-même ne bouge pas : seule la notation change. Si le graphique s'adresse à deux publics, la taille écrite au-dessus de chaque figure est dans l'unité du graphique et la ligne sous chaque case porte les deux.
7. **Le PNG pour coller, le SVG pour imprimer.** Le PNG est une image à la hauteur en pixels que vous avez réglée, ce que veut une fenêtre de discussion, un document ou une diapositive. Le SVG est le graphique sous forme d'instructions, il s'imprime donc net à n'importe quelle taille et peut encore être recoloré ensuite par tout ce qui ouvre des vecteurs.

## La version longue

[Comment faire un graphique de comparaison de tailles](https://abox.tools/fr/guides/faire-un-graphique-de-tailles/): Transformer une liste de tailles en une image côte à côte : comment écrire les tailles, quelle figure choisir pour un enfant, pourquoi un objet familier fait plus qu'une troisième personne, et comment sortir le graphique en PNG ou en SVG.

## Aussi dans la boîte

- [Compresseur d'images](https://abox.tools/fr/compresser-une-image/): Vous donnez la taille. Il se charge du reste.
- [Redimensionneur d'images](https://abox.tools/fr/redimensionner-une-image/): Vous dites la taille. Vous tracez le cadre. Vous choisissez le format.
- [HEIC vers JPG](https://abox.tools/fr/convertir-heic-en-jpg/): Les photos que fait un iPhone, dans un format que tout ouvre.
- [Photo d'identité](https://abox.tools/fr/photo-d-identite/): Choisissez le pays. L'outil applique sa règle, exactement.

## Questions

### Ce que je tape est-il envoyé quelque part ?

Non. Le graphique est dessiné par du JavaScript de cette page, sur votre propre machine, et cet outil n'a aucune fonction réseau d'aucune sorte — il ne récupère jamais rien et n'envoie jamais rien. La `Content-Security-Policy` de la page nomme chaque adresse qu'elle peut contacter, dont aucune ne nous appartient. Cela vaut la peine d'être dit clairement ici, parce que l'entrée est une liste de noms de personnes et de leurs tailles, ce qui est plus personnel que la plupart de ce que traite ce site.

### Puis-je télécharger le graphique ?

Oui, en PNG ou en SVG, sans filigrane et sans compte. Le PNG est dessiné à la hauteur en pixels que vous réglez et c'est celui à coller dans un document, une diapositive ou une discussion. Le SVG est le graphique sous forme d'instructions plutôt que de pixels : il s'imprime net à n'importe quelle taille et peut être ouvert et recoloré plus tard dans n'importe quel éditeur vectoriel. Les deux sont fabriqués à partir du même balisage que celui à l'écran, aucun ne peut donc diverger de l'aperçu.

### Comment écrire la taille — en centimètres ou en pieds ?

Comme vous voulez, sur n'importe quelle ligne, de la façon dont vous l'écrivez d'habitude. `173`, `173 cm`, `1,73 m`, `5'8"`, `5 ft 8 in` et `68 in` sont tous compris, et la ligne sous la case montre ce qui a été lu dans les deux systèmes. Un nombre nu, ce sont des centimètres quand le graphique est métrique et des pouces quand il est impérial ; un nombre nu inférieur à trois est pris pour des mètres, parce que 1,73 cm n'est pas une taille que quiconque tape.

### Pourquoi les enfants ne ressemblent-ils pas à des adultes en réduction ?

Parce qu'un enfant n'en est pas un. Les proportions du corps changent avec l'âge : un enfant de deux ans mesure à peu près quatre têtes et demie, un enfant de huit ans six, un adulte sept et demie — la tête représente donc près d'un quart d'un jeune enfant et un huitième d'un adulte. Le garçon et la fille sont ici des dessins d'enfants réels plutôt qu'une seule silhouette réduite, ce qui explique qu'un graphique de famille ressemble à une famille plutôt qu'à quatre adultes de tailles différentes.

### D'où viennent les figures ?

Toutes les quatre sont des illustrations d'autres personnes, toutes dans le domaine public : l'homme par pitr, la femme par Madeleine Price Ball, la fille par OpenClipart-Vectors, et le garçon par Ryan Kissinger pour la bibliothèque NIH BioArt. Chaque fichier est livré avec cette page dans `vendor/` tel qu'il a été publié, vous pouvez donc les comparer aux originaux. Le domaine public ne demande rien, et c'est bien le point : l'illustration finit à l'intérieur d'une image que vous téléchargez, et une licence exigeant une attribution attacherait cette exigence à votre graphique.

### Puis-je mettre ma propre image sur le graphique ?

Oui — **Votre propre image** prend un dessin ou une photographie et le pose sur la règle à la hauteur que vous tapez : un logo, un plan, une pièce de machine, une voiture, ou une photo de la chose elle-même. Ses proportions sont les siennes, il n'y a donc pas de largeur à remplir. \
\
Un **SVG** est dessiné dans une seule couleur pleine, celle sur laquelle cette ligne est réglée, parce que c'est ce qu'est le reste du graphique — un dessin fait de contours fins plutôt que de formes pleines ressort donc en pâté, et ce n'est pas le bon outil pour cela. Seules les *formes* sont gardées : le fichier est reconstruit de zéro à partir de chemins, de rectangles et de cercles, et tout ce qui pourrait atteindre le réseau — une image liée, une feuille de style, une police, un script — reste derrière. \
\
Une **photo ou un PNG** y va tel quel et garde ses propres couleurs, si bien que la couleur de la ligne ne fait plus que le nommer. Il est redessiné ici avant d'y aller, ce qui borne ce qu'il ajoute au graphique et laisse derrière lui les métadonnées du fichier. La transparence est conservée, un détourage se tient donc proprement sur la règle — et une photo apporte son arrière-plan avec elle, qu'il vaut mieux rogner d'abord. \
\
Aucun des deux fichiers ne va nulle part. Cela compte deux fois, parce que le graphique que vous téléchargez est un fichier que vous enverriez peut-être à quelqu'un.

### Pourquoi n'y a-t-il ni tout-petit ni bébé ?

Parce que personne n'en a dessiné un et ne l'a versé au domaine public. Wikimedia Commons compte exactement un enfant libre utilisable — la fille — et la bibliothèque NIH BioArt le garçon ; en dessous de l'âge scolaire la recherche revient vide, et tout ensemble libre et cohérent de personnages est un pictogramme de toilettes, de la même forme à tous les âges, ce qui est justement l'erreur que cet outil tout entier existe pour éviter. Il y a eu un temps un tout-petit dessiné par le code de cette page, et c'était la seule figure du graphique que personne n'avait dessinée : cela se voyait, à côté de quatre qui l'avaient été. Pour quelqu'un de plus petit que le garçon ou la fille, réglez l'un des deux à la taille réelle — c'est la règle qui porte la comparaison, et elle sera juste.

### Combien de personnes puis-je mettre sur un graphique ?

Douze. Ce n'est pas une limite technique — le dessin en ferait volontiers trente — mais passé la douzaine les colonnes deviennent plus étroites que les noms écrits au-dessus et l'image cesse d'être lisible. S'il vous en faut davantage, désactiver les noms vous rend la largeur, ou deux graphiques le diront mieux qu'un.

### Puis-je mettre un objet sur le graphique ?

Oui — et la plupart arrivent dessinés. Le menu en propose vingt pour commencer, en quatre groupes : portes et fenêtres, école et bureau (un tableau, un bureau, un classeur, un écran de projection), choses de la ville (un distributeur, une poubelle à roulettes, un panier de basket, un conteneur de 20 ft) et choses de la maison. Dix-sept d'entre eux viennent avec un dessin — une porte avec sa poignée, un réfrigérateur avec son congélateur au-dessus, un canapé dont on voit que c'est un canapé —, et le dessin est ajusté à la hauteur et à la largeur de la ligne, si bien que ce sont toujours les nombres qui décident de la taille, et que les vôtres, tapés par-dessus, valent toujours. Les trois autres sont de simples rectangles, parce qu'aucun dessin libre de ceux-là ne s'est révélé à la fois juste et bien proportionné, et qu'un dessin faux est pire qu'un bloc honnête sur un graphique qui parle d'échelle. \
\
Certaines de ces tailles sont de véritables normes et d'autres des tailles typiques, ce que la page dit à voix haute. Un objet familier fait plus pour un graphique que n'importe quel nombre de personnes supplémentaires : c'est lui qui transforme une comparaison en sens de l'échelle.

### Y a-t-il une figure pour un chien ou un chat ?

Non, et c'est un manque délibéré plutôt qu'un oubli. Les deux ont été construits — de profil, debout, la tête à hauteur d'épaule, pour que le haut du dessin soit la taille écrite à côté, là où toute norme de race mesure un animal. Ils ne sont pas sortis assez bien pour être livrés : un quadrupède vu de côté à côté de quatre personnes vues de face se lit comme une erreur même quand le dessin est bon. Un rectangle à la hauteur du garrot de l'animal est honnête en attendant.

### Puis-je partager le graphique par un lien ?

Pas d'ici, et c'est délibéré. Les outils qui le proposent le font en mettant la liste entière dans l'adresse, ce qui veut dire que chaque nom et chaque taille finissent dans tout ce par quoi le lien voyage — les journaux d'un serveur de messagerie, un scanner de courrier, l'historique de quelqu'un, un service qui va chercher un aperçu de lien. Téléchargez l'image et envoyez-la à la place : elle dit la même chose et ne transporte aucune liste.

### Est-ce gratuit, et puis-je utiliser le graphique commercialement ?

C'est gratuit, il n'y a ni compte ni filigrane, et vous pouvez mettre le résultat dans un rapport, une présentation, une annonce ou un produit. Le site affiche de la publicité, et c'est elle qui le finance. Rien de ce que vous faites ici ne nous appartient, et rien n'est conservé.

### Pourquoi la règle est-elle en dizaines et non en unités ?

Parce que l'espacement est choisi d'après le nombre de lignes que l'image peut porter plutôt que d'après un nombre fixe. Un graphique de deux adultes reçoit une ligne tous les dix centimètres ; ajoutez-y un panier de basket et les lignes passent à vingt-cinq, parce que quatre-vingt-dix lignes sur une image font un lavis gris plutôt qu'une règle. En pieds et pouces l'échelle est de un, trois, six et douze pouces, si bien que les lignes tombent sur des pouces entiers au lieu de tomber à côté.

### Puis-je mettre le graphique sur une diapositive sombre ?

Oui. Réglez le fond sur la couleur sur laquelle il se posera et la règle et le texte basculent entre sombre et clair pour s'y accorder — calculé d'après la luminance de la couleur plutôt que deviné. Cochez ensuite « aucun fond du tout » si vous voulez l'image elle-même transparente : la couleur que vous avez choisie décide toujours de l'encre, si bien qu'un graphique transparent destiné à une diapositive bleu marine en ressort lisible.

### Est-ce que cela fonctionne hors ligne ?

Oui. Chargez la page une fois, puis débranchez internet et elle continue de fonctionner. C'est aussi la façon la plus simple de prouver que rien n'est envoyé : un outil qui expédierait votre liste pour qu'on lui dessine un graphique s'arrêterait à l'instant où vous débranchez.

## Comment cette promesse se vérifie

- **Une liste de personnes n'est pas une petite chose à confier.** La plupart des graphiques de tailles réclament un compte, et ceux qui n'en réclament pas ont tout de même un serveur qui voit chaque nom et chaque nombre que vous tapez. Ce que vous tapez ici, c'est qui compose votre famille et la taille de chacun, souvent avec l'âge d'un enfant deviné à la figure posée à côté du nom. Rien de tout cela n'est envoyé nulle part, parce qu'il n'y a ici nulle part où cela puisse aller.
- **Rien ici ne récupère quoi que ce soit.** Il n'y a aucun `fetch`, aucun `XMLHttpRequest` et aucun `sendBeacon` nulle part dans `src/`. La Content-Security-Policy nomme chaque adresse que cette page peut contacter, et aucune ne nous appartient.
- **Rien n'est mémorisé d'une visite à l'autre non plus.** Le graphique vit dans la page et nulle part ailleurs. Fermez l'onglet et la liste a disparu : aucun compte ne la conserve, aucun cookie ne la transporte, et rien n'est écrit dans le stockage de ce navigateur — c'est aussi pourquoi un graphique que vous voulez garder est un graphique que vous téléchargez.
- **Le lien ne transporte pas le graphique.** Plusieurs outils de ce genre mettent la liste entière dans la barre d'adresse pour qu'elle puisse être partagée, ce qui transforme chaque nom et chaque taille en quelque chose qu'enregistre tout ce par quoi le lien passe — un serveur de messagerie instantanée, un scanner de courrier, l'historique de quelqu'un. L'adresse de cette page ne change jamais pendant que vous tapez.
- **Le PNG est fabriqué à partir du SVG qui est à l'écran.** Le téléchargement n'est pas un second rendu qui pourrait diverger de l'aperçu. Le même balisage est remis au navigateur et peint sur un canvas, ce qui est aussi pourquoi cela se fait réseau débranché : il n'y a aucune police à récupérer et aucune image à charger dedans.
- **Une image que vous ajoutez est lue ici, et jamais envoyée.** Le fichier ne quitte jamais cette page — il est lu avec le `FileReader` du navigateur lui-même et analysé en un document inerte qui n'exécute rien. Ce qui est dessiné n'est pas ce fichier : `src/import-svg.js` construit un NOUVEAU dessin à partir d'une liste blanche de formes et de géométrie, si bien qu'un script, une feuille de style, une police, une image liée ou une référence à un autre document reste derrière au lieu d'être emporté. Cela compte deux fois, parce que le graphique que vous téléchargez est un fichier que vous envoyez à d'autres : ce qui aurait survécu serait leur navigateur appelant le serveur d'un inconnu, des jours plus tard, depuis quelque chose que cette page a écrit. Une photographie ou un PNG n'est pas un programme et n'a rien à reconstruire : le décodeur du navigateur lui-même la lit, et elle est redessinée ici sur un canvas avant d'aller sur le graphique. C'est ce redessin qui laisse derrière lui les métadonnées du fichier — l'appareil, le lieu, le profil, tout ce qui s'y trouvait —, parce que rien de cela ne survit à un canvas. Ce qui finit dans le graphique est une image que cette page a encodée elle-même, inscrite comme des données et non comme une adresse, si bien que le graphique ne pointe toujours vers rien.
- **Les illustrations sont ici, elles ne sont pas récupérées.** Les quatre figures sont des illustrations du domaine public, et elles sont servies depuis cette origine avec le reste de la page — pas de police d'icônes, pas de CDN, pas de feuille de sprites tirée du serveur de quelqu'un d'autre pendant que vous tapez. C'est aussi pourquoi le graphique se dessine encore réseau débranché.
- **Ce que Google charge, et ce qu'on ne lui donne pas.** Les scripts publicitaires et de mesure viennent de Google, et le bouton de don de Buy Me a Coffee. Aucun d'eux ne reçoit de nom ni de taille. Chaque ligne qui transforme votre liste en image est servie depuis cette origine et figure dans le dépôt.
- **Cela fonctionne hors ligne.** Débranchez le réseau et l'outil est inchangé, parce qu'il n'y a jamais eu d'étape réseau dedans. C'est la preuve la plus simple qui soit.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, `src/traced.js` et `vendor/` pour les quatre figures et la provenance de leurs illustrations, `src/figures.js` pour la liste à partir de laquelle le menu est construit, `src/units.js` pour la façon dont une taille tapée devient un nombre et dont la règle est graduée, `src/chart.js` pour la mise en page, `src/save.js` pour les deux téléchargements — à savoir le SVG à l'écran, et ce même SVG peint sur un canvas — et `src/import-svg.js` pour la liste blanche à partir de laquelle un SVG déposé est reconstruit, le seul fichier ici où se tromper aurait des conséquences.
