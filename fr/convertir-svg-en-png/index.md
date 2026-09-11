# SVG en image — rastériser un vectoriel en PNG, JPEG ou WebP, à n'importe quelle taille

Vous donnez la taille. Un vectoriel n'en a aucune à perdre.

> Convertissez un SVG en PNG, JPEG ou WebP à n'importe quelle taille, dans votre navigateur. Donnez la largeur, un multiple ou un cadre ; récupérez aussi les copies @2x et @3x. Transparence gardée, rien n'est envoyé.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/convertir-svg-en-png/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos fichiers SVG. Il n'y a pas de serveur.

Le dessin est rastérisé par le moteur même qui vient de le mettre à votre écran. Votre fichier est lu sur votre disque, sa balise racine est réécrite à la taille demandée par une centaine de lignes dans `src/svg.js` que vous pouvez lire, et il est dessiné sur un canvas que votre navigateur embarque déjà. Cet outil ne comporte aucune fonction réseau, si bien qu'il n'a rien à aller chercher et rien à envoyer. Et quand bien même il en aurait une, il n'y a à l'autre bout de cette page aucun serveur à qui remettre un logo.

- ✗ Sans envoi
- ✗ Sans compte
- ✗ Sans filigrane
- ✓ Fonctionne hors ligne
- ✓ Open source

## Comment convertir un SVG en PNG sans l'envoyer

1. **Choisissez le SVG.** Déposez-en un sur la zone prévue, ou prenez-en un dossier entier et convertissez le tout d'un coup. Le navigateur lit le fichier directement sur votre disque, sans que rien parte où que ce soit pendant ce temps. Chaque ligne dit quelle taille le fichier croit avoir, et le dit différemment selon que cette taille vient de son `viewBox` ou a été supposée parce que le fichier n'en déclare aucune.
2. **Dites quelle taille.** Un multiple de la taille propre du fichier est la réponse la plus rapide et la bonne pour un lot : chaque dessin est mis à l'échelle depuis son propre point de départ, si bien qu'un jeu d'icônes reste en proportion. Sinon, nommez une largeur, une hauteur, le plus grand côté, ou un cadre dont les deux côtés sont donnés. Contrairement à une photographie, donner un grand nombre ne coûte rien ici, puisque le dessin est redessiné à cette taille plutôt qu'étiré jusqu'à elle.
3. **Ajoutez les copies haute densité s'il vous en faut.** Un téléphone et un portable Retina dessinent deux ou trois pixels physiques pour chaque pixel CSS : un logo de 200 pixels a donc besoin d'un fichier de 400 ou 600 pixels derrière lui. Demandez `@2x` et `@3x` et ils ressortent nommés comme Xcode, les outils Android et `image-set()` en CSS l'attendent tous, et chacun fait exactement le double ou le triple du premier plutôt que d'être arrondi séparément.
4. **Choisissez le format et tranchez sur la transparence.** PNG, sauf si vous avez une raison : il est sans perte, il garde la transparence, et les aplats s'y compressent bien. Le JPEG n'a aucune transparence, si bien qu'une couleur de fond est peinte que vous en choisissiez une ou non ; sans elle, chaque pixel transparent ressortirait noir. Le WebP fait les deux et donne un fichier plus léger, au prix des logiciels assez anciens pour ne pas le lire.
5. **Regardez l'aperçu avant de télécharger.** Il est dessiné par le code même qui écrit le fichier, depuis votre fichier, sur votre machine. Deux choses changent quand un dessin devient des pixels, et les deux se voient ici : un filet large d'un demi-pixel vire au gris, et tout texte est dessiné dans une police que cet ordinateur possède, et non dans une police récupérée sur le web.
6. **Prenez les fichiers.** Un téléchargement par fichier, ou tout le lot en un seul zip. Les noms suivent le SVG dont ils viennent, avec `@2x` et `@3x` sur les copies, et deux fichiers qui auraient porté le même nom sont numérotés plutôt que l'un ne remplace discrètement l'autre.

## La version longue

[Comment convertir un SVG en PNG à la bonne taille](https://abox.tools/fr/guides/convertir-un-svg-en-png/): Un vectoriel n'a pas de taille en pixels à lui : le nombre est à vous de le choisir. D'où vient ce nombre pour un écran, une icône d'application et une imprimante, et ce qui change quand un dessin devient des pixels.

## Aussi dans la boîte

- [Image en SVG](https://abox.tools/fr/convertir-image-en-svg/): Une forme, un contour. Pointez ce qui ne devrait pas y être.
- [Comparateur de tailles](https://abox.tools/fr/comparer-des-tailles/): Tapez les tailles, emportez l'image. Rien n'est envoyé pour la dessiner.
- [Compresseur d'images](https://abox.tools/fr/compresser-une-image/): Vous donnez la taille. Il se charge du reste.
- [Redimensionneur d'images](https://abox.tools/fr/redimensionner-une-image/): Vous dites la taille. Vous tracez le cadre. Vous choisissez le format.

## Questions

### Mon SVG est-il envoyé quelque part ?

Non. Le fichier est lu par votre propre navigateur sur votre propre matériel, dessiné sur un canvas par le moteur même qui rend toutes les autres images que vous voyez, puis rendu sous forme de téléchargement. Cet outil ne comporte aucune fonction réseau, si bien qu'il ne va jamais rien chercher et n'envoie jamais rien. Sa `Content-Security-Policy` énumère par ailleurs toutes les adresses que la page peut contacter, dont aucune n'appartient à ce site.

### À quelle taille faut-il rastériser un SVG ?

À celle que demande ce qui va le lire, multipliée par le rapport de pixels de l'écran où il sera vu. Un logo qui occupe 200 pixels CSS en demande 400 pour un portable Retina et 600 pour un téléphone récent, ce que sont ici les copies `@2x` et `@3x`. Pour une icône d'application ou une fiche de boutique, la boutique nomme un nombre exact et c'est ce nombre-là. Quand rien ne vous a rien dit, 1024 sur le plus grand côté est un défaut utile : assez grand pour presque tout usage et assez petit pour un courriel.

### L'agrandir fait-il perdre de la qualité ?

Non, et c'est le seul endroit où cette réponse est honnêtement non. Un vectoriel, ce sont des instructions et non des pixels : le navigateur redessine donc les courbes à la taille demandée. 4000 pixels tirés d'une icône de 24 pixels sont exactement aussi nets que l'étaient les 24. Ce que vous ne pouvez pas faire, c'est le chemin inverse : une fois que c'est un PNG, ce sont des pixels comme tout le reste, aussi vaut-il mieux rastériser à la taille dont vous avez besoin que redimensionner le résultat ensuite.

### Mon SVG n'a ni largeur ni hauteur. Quelle taille vais-je obtenir ?

Celle du `viewBox`, s'il y en a un : sa largeur et sa hauteur sont des unités utilisateur plutôt que des pixels, mais ce sont les seuls nombres du fichier et un navigateur les traite comme la taille naturelle du dessin. S'il n'y a pas de viewBox non plus, la page affiche *supposée* à côté de la ligne et utilise ⁦300 × 150⁩, ce à quoi un `<img>` l'aurait dessiné. Dans les deux cas, vous pouvez nommer la taille voulue et le fichier est dessiné à celle-là.

### Pourquoi le texte a-t-il l'air différent dans le PNG ?

Parce que la police n'est pas dans le SVG. Un SVG qui dessine du texte nomme une police et laisse la machine la trouver, et un fichier qui en tire une de Google Fonts avec un `@import` n'obtient rien ici : un SVG dessiné à travers un `<img>` n'a pas le droit de récupérer quoi que ce soit, ce qui est la règle même qui l'empêche de contacter l'extérieur avec votre fichier. Le remède est celui que tout graphiste connaît déjà : convertissez le texte en tracés dans le logiciel de dessin avant d'exporter. C'est alors de la géométrie, et cela a la même allure partout.

### Peut-il convertir plusieurs fichiers à la fois ?

Oui. Chaque SVG de la liste est rendu avec les mêmes réglages et le lot arrive en un seul zip. Un multiple, du genre « 4× la taille que le fichier demande », est en général le bon réglage pour un lot, parce que chaque dessin est mis à l'échelle depuis sa propre taille au lieu que tous soient forcés au même nombre de pixels. Cliquez sur une ligne pour mettre celle-là dans l'aperçu.

### Y a-t-il une limite de taille ?

Celle du navigateur, pas la nôtre. Un canvas abandonne quelque part au-delà de 16 384 pixels de côté, et Safari sur un iPhone ou un iPad s'arrête à environ 16,7 mégapixels de surface, soit ⁦4096 × 4096⁩. Au-dessus, la page vous prévient plutôt que de vous rendre une image vide, ce que fait un navigateur à court de ressources : `toBlob` ne rend rien du tout, sans la moindre erreur pour s'expliquer. Passé 100 mégapixels, l'outil refuse, parce que cela ferait 400 MB de canvas avant qu'un seul octet ait été encodé.

### Qu'advient-il de la transparence ?

Elle est gardée, en PNG et en WebP. Le JPEG n'a aucun canal alpha, si bien qu'une couleur est peinte derrière toute l'image que vous en demandiez une ou non ; sans elle, tout ce qui est transparent ressortirait noir, ce qui a l'air d'un bug plutôt que du JPEG. Choisir une couleur de fond avec du PNG est aussi une chose parfaitement ordinaire à vouloir : cela aplatit le dessin sur cette couleur au lieu de laisser un trou.

### Peut-il lire un SVG qui contient un script ou une image externe ?

Il peut en lire un, et il dessinera exactement les parties qu'un navigateur veut bien dessiner. Un SVG chargé à travers un `<img>` est en *mode statique sécurisé* : les scripts ne s'exécutent pas, les références externes ne sont pas récupérées, et l'animation ne joue pas, si bien que c'est la première image que vous obtenez. Un fichier avec une `<image>` distante ressort donc avec cette partie manquante. C'est le navigateur qui refuse pour votre compte, et c'est ce qui permet à cette page d'ouvrir sans danger un fichier qu'elle n'a jamais vu.

### Quelle différence avec le redimensionneur d'images ?

La nature de la source. Le redimensionneur d'images part de pixels, ceux d'un JPEG ou d'un PNG, si bien que l'agrandir doit inventer un détail qui n'a jamais existé. Celui-ci part d'un dessin : il n'y a rien à inventer et aucune limite haute dont il faille se soucier. Si ce que vous avez est un SVG, c'est celui-ci qui vous donne un résultat net ; si ce que vous avez est une photographie, c'est l'autre.

### Est-ce gratuit, et faut-il un compte ?

C'est gratuit, et il n'y a ni compte, ni identification, ni période d'essai, ni filigrane. Le nombre et la taille des fichiers ne sont pas limités non plus, parce qu'aucun serveur ne les paie et que tout le travail se fait sur votre propre machine. Le site affiche de la publicité, et c'est elle qui le finance ; les annonces ne reçoivent rien sur vos fichiers.

### Est-ce que cela fonctionne hors ligne ?

Oui. Chargez la page une fois, coupez ensuite votre connexion et elle continue de travailler. C'est aussi la façon la plus simple de prouver que rien n'est envoyé, car un outil qui expédierait votre dessin ailleurs pour le faire rastériser s'arrêterait à l'instant où vous débranchez.

## Comment cette promesse se vérifie

- **Votre dessin n'a nulle part où aller.** La Content-Security-Policy énumère toutes les adresses que cette page peut contacter, et aucune n'appartient à ce site. Il n'existe ici aucun point de collecte où vos fichiers pourraient aboutir, ni rien dans le code qui les y enverrait s'il en existait un.
- **Rien ici ne va rien chercher.** On ne trouve ni `fetch`, ni `XMLHttpRequest`, ni `sendBeacon` nulle part dans `src/`. Le rastériseur tout entier, c'est un `<img>` qui tient un blob de votre propre fichier, un `drawImage` sur un canvas, et un `canvas.toBlob`.
- **Un SVG est un document, et voici le mode où il ne peut pas agir.** Un SVG peut porter un `<script>`, une `<image href="https://…">` distante, une feuille de style et une police web. Dessiné à travers un `<img>`, il se trouve dans ce que la spécification appelle le *mode statique sécurisé* : le script ne s'exécute pas et pas une seule de ces adresses n'est contactée. C'est une garantie du navigateur, et non une promesse de notre part, ce qui permet à cette page d'ouvrir un fichier qu'elle n'a jamais vu sans que ce fichier puisse contacter l'extérieur.
- **Ce que Google charge, et ce qu'on ne lui donne pas.** Les scripts publicitaires et de mesure viennent de Google, et le bouton de don de Buy Me a Coffee. Aucun d'eux ne reçoit quoi que ce soit sur votre dessin. Chaque ligne qui lit, dimensionne ou dessine un fichier est servie depuis cette origine et figure dans le dépôt.
- **Tout fonctionne hors ligne.** Coupez le réseau : l'outil reste identique, puisqu'il n'a jamais comporté la moindre étape réseau. C'est la preuve la plus simple de toutes.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, `src/svg.js` pour la façon dont la taille propre d'un fichier est lue et dont sa balise racine est réécrite, et `src/render.js` pour les huit lignes qui font la rastérisation, à savoir un <img>, un `drawImage` et un `toBlob`, sans rien entre les deux.
