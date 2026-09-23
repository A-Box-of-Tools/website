# Image en ICO — créer un favicon et des icônes Windows et macOS

Une image en entrée. Toutes les tailles qu'un navigateur, Windows ou un Mac réclame, en sortie.

> Convertissez un PNG, un JPEG ou un SVG en un vrai .ico multi-tailles ou en .icns macOS, dans votre navigateur. Favicon, icône d'application Windows ou Mac, plus les fichiers Apple et Android d'un site. Rien n'est envoyé.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/creer-un-favicon/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos images. Il n'y a pas de serveur.

La mise à l'échelle et les fichiers d'icônes eux-mêmes sont faits dans votre propre navigateur. L'image est dessinée par le canvas que votre navigateur embarque déjà, et chaque conteneur, qu'il s'agisse du `.ico` de Windows ou du `.icns` de macOS, est assemblé à partir de ces pixels par quelques centaines de lignes que vous pouvez lire, dans `src/ico.js` et `src/icns.js`. Cet outil ne comporte aucune fonction réseau, si bien qu'il n'a rien à aller chercher et rien à envoyer. Et quand bien même il en aurait une, il n'y a à l'autre bout de cette page aucun serveur à qui remettre un logo.

- ✗ Sans envoi
- ✗ Sans compte
- ✗ Sans filigrane
- ✓ Fonctionne hors ligne
- ✓ Open source

## Comment créer un fichier .ico sans rien envoyer

1. **Choisissez l'image.** Déposez un PNG, un JPEG, un WebP ou un SVG sur la zone prévue, ou prenez-en plusieurs et convertissez-les d'un coup. Le carré est le plus simple, et tout ce qui fait 256 pixels ou plus a assez de détail pour toutes les tailles. Le navigateur la lit directement sur votre disque, sans que rien parte où que ce soit pendant ce temps.
2. **Choisissez les fichiers qu'il vous faut.** Windows et un navigateur lisent le `.ico` ; un Mac lit le `.icns` et ne regardera pas l'autre. Cochez l'un, ou les deux si ce que vous fabriquez sort sur les deux. Un site web veut en plus les images Apple, Android et tuile, et c'est la troisième case.
3. **Dites à quoi sert l'icône.** Un favicon de site fait 16, 32 et 48 pixels ; une application Windows veut aussi 256 ; une application qui doit être correcte sur un portable haute densité veut les tailles intermédiaires que Windows réclame aux échelles 125 % et 150 %. Prenez celle qui correspond au travail, ou cochez les tailles vous-même. Chaque taille de la liste dit qui la réclame. Le `.icns` n'offre pas ce choix : Apple nomme exactement dix emplacements et les dix y vont.
4. **Réglez la forme et le fond.** Une icône est carrée et la plupart des logos ne le sont pas. Complétez et l'image entière est gardée, avec de l'espace au-dessus et au-dessous ; recadrez et c'est le milieu qui est pris ; étirez et elle est écrasée. La transparence est gardée comme transparence, sauf si vous choisissez une couleur à mettre derrière.
5. **Regardez celle de 16 pixels avant de télécharger.** C'est la taille à laquelle l'icône sera le plus souvent vue, et c'est là que les traits fins et les petites lettres disparaissent. Chaque carré de l'aperçu est dessiné à sa taille réelle depuis votre propre fichier. Si la plus petite est une tache, le remède est un dessin plus simple, pas un autre réglage.
6. **Prenez les fichiers.** Un .ico avec toutes les tailles dedans, nommé `favicon.ico` quand c'est ce que vous avez demandé, parce que c'est l'adresse que les navigateurs cherchent. Un .icns à côté si vous avez coché cela, prêt à entrer dans un bundle d'application Mac. Cochez en plus le jeu pour site web et vous obtenez aussi les images Apple, Android et tuile Windows, le manifeste, et le bloc de HTML à coller dans votre page. Tout ce qui dépasse un fichier unique arrive en un seul zip.

## La version longue

[Comment créer un favicon qui se lise encore à seize pixels](https://abox.tools/fr/guides/creer-son-favicon/): Quelles tailles un favicon.ico réclame vraiment, quels fichiers supplémentaires demandent les iPhone, Android et un Mac, et pourquoi un logo qui marche sur une affiche disparaît à seize pixels.

## Aussi dans la boîte

- [Image en data URI](https://abox.tools/fr/image-en-base64/): L'image entière en une ligne de texte. À coller directement dans du CSS ou du HTML.
- [SVG en image](https://abox.tools/fr/convertir-svg-en-png/): Vous donnez la taille. Un vectoriel n'en a aucune à perdre.
- [Image en SVG](https://abox.tools/fr/convertir-image-en-svg/): Une forme, un contour. Pointez ce qui ne devrait pas y être.
- [Comparateur de tailles](https://abox.tools/fr/comparer-des-tailles/): Tapez les tailles, emportez l'image. Rien n'est envoyé pour la dessiner.

## Questions

### Mon image est-elle envoyée quelque part ?

Non. L'image est décodée et mise à l'échelle par votre propre navigateur sur votre propre matériel, et le .ico est assemblé à partir de ces pixels par du code servi depuis cette page. Cet outil ne comporte aucune fonction réseau, si bien qu'il ne va jamais rien chercher et n'envoie jamais rien. Sa `Content-Security-Policy` énumère par ailleurs toutes les adresses que la page peut contacter, dont aucune n'appartient à ce site.

### Quelles tailles un favicon.ico doit-il contenir ?

16, 32 et 48. Ce n'est pas une préférence : 16 est ce qu'un navigateur dessine dans un onglet, 32 ce que Windows utilise pour un raccourci de bureau et ce que plusieurs navigateurs utilisent pour un signet, et 48 la taille à laquelle Google lit l'icône d'un site. Tout ce qui est plus grand a sa place dans un PNG à côté du .ico plutôt que dedans, et c'est justement ce que produit ici le jeu pour site web.

### De quelles tailles une icône d'application Windows a-t-elle besoin ?

16, 32, 48 et 256, ce que contient l'app.ico livrée par défaut avec Visual Studio. 16 est la barre de titre et la petite vue de l'Explorateur, 32 le bureau et la barre des tâches, 48 les icônes moyennes de l'Explorateur, et 256 le menu Démarrer et la vue très grande. Sur un écran haute densité, Windows réclame aussi 20, 24, 40, 64 et 96, et les rééchantillonne depuis la taille la plus proche s'ils manquent ; le préréglage « toutes les échelles » les met dedans.

### Pourquoi le fichier est-il plus gros que l'image de départ ?

Parce qu'un .ico n'est pas une image mais plusieurs, et que les petites y sont stockées sans compression pour que n'importe quoi puisse les lire. Une entrée ⁦32×32⁩ fait exactement 4 264 octets quel qu'en soit le contenu, et une entrée ⁦256×256⁩ non compressée fait 264 KB : c'est pourquoi les tailles au-dessus de 64 sont stockées en PNG par défaut. Choisir « PNG pour toutes les tailles » donne le plus petit fichier possible ; choisir le non compressé partout donne le plus compatible.

### Quelle différence entre les entrées PNG et non compressées ?

Seulement la façon dont les pixels sont stockés dans le .ico. Une entrée non compressée est l'arrangement Windows d'origine, avec un en-tête bitmap, les pixels à l'envers et un masque de transparence d'un bit, et toutes les versions de Windows jamais sorties savent la lire. Une entrée PNG est un fichier PNG entier glissé dans l'icône, trois à dix fois plus petit aux grandes tailles, mais compris seulement à partir de Windows Vista. Le réglage par défaut utilise chacun là où il gagne : non compressé jusqu'à 64 pixels, PNG au-dessus.

### Peut-il faire une icône plus grande que 256 pixels ?

Non, et rien ne le peut. Le format stocke chaque côté sur un seul octet, et 0 est déjà pris, puisqu'il veut dire 256. C'est le plafond : un .ico contenant une image de 512 pixels n'est pas une icône plus grande, c'est une icône cassée. S'il vous faut du 512, il vous faut un PNG, ce que le jeu pour site web inclut pour Android et pour l'écran de démarrage d'une application web.

### Garde-t-il la transparence ?

Oui, dans les deux sortes d'entrées, et il écrit aussi l'ancien masque d'un bit à côté du canal alpha, pour qu'un logiciel trop ancien pour lire l'alpha découpe quand même l'icône au lieu de dessiner un carré noir. Le seul fichier rendu opaque délibérément est l'icône Apple touch du jeu pour site web : iOS la compose sur sa propre tuile et transforme la transparence en noir, elle est donc aplatie sur votre couleur de fond, blanche par défaut.

### Mon logo est un mot large. Que lui arrive-t-il ?

Quelque chose, forcément, puisqu'une icône est carrée. Compléter garde le tout et le rend petit, si bien qu'un mot complété dans un carré de 16 pixels fait environ trois pixels de haut et reste illisible. Recadrer au milieu marche généralement mieux : sortez le symbole de l'ensemble et servez-vous-en, comme le font presque toutes les marques pour leur favicon. L'aperçu vous montre lequel survit avant que vous téléchargiez quoi que ce soit.

### Que contient le jeu pour site web, et faut-il tout ?

Sept PNG, un manifeste d'application web, un browserconfig.xml et un bloc de HTML à coller. Il vous les faut parce qu'un .ico couvre les navigateurs et Windows, et rien d'autre : un écran d'accueil d'iPhone lit un PNG de 180 pixels portant un nom à lui, Android et toutes les invites d'installation lisent le manifeste, et une tuile épinglée au menu Démarrer lit le XML. Aucun d'eux n'ira regarder dans un .ico. Tout est produit ici, sur votre machine, et le zip contient une note disant à quoi sert chaque fichier.

### Peut-il faire aussi une icône macOS ?

Oui : cochez *icône macOS* et vous obtenez un `.icns` à côté du `.ico`, ou à sa place. C'est un autre conteneur pour la même idée, et aucun des deux systèmes ne lira celui de l'autre, Windows voulant du .ico et un bundle d'application Mac du .icns. Les tailles n'y sont pas un choix, parce qu'Apple publie exactement dix emplacements, de 16 à 1024 pixels en passant par 32, 64, 128, 256 et 512, dont trois apparaissent deux fois comme version Retina de la taille inférieure. Les dix y vont, tirés de sept rendus, et c'est pourquoi un .icns est le fichier le plus gros.

### Comment utiliser le fichier .icns ?

Pour une application, il va dans le bundle, à `VotreApp.app/Contents/Resources/`, et il est nommé dans `Info.plist` sous `CFBundleIconFile` ; tous les outils d'empaquetage Mac ont un champ pour cela. Pour le reste, sélectionnez le fichier dans le Finder, faites Commande-C, puis Lire les informations sur le dossier ou l'image disque à changer, cliquez la petite icône en haut à gauche et faites Commande-V.

### Le .icns est-il identique à celui que fabrique iconutil ?

Les mêmes dix emplacements avec les mêmes types de quatre lettres, et du PNG dans chacun, ce que produit `iconutil` à partir d'un dossier `.iconset`. Une différence est délibérée : l'outil d'Apple écrit aussi un élément `TOC` , un index des types et des longueurs qui suivent. C'est une optimisation plutôt qu'une partie du format, puisqu'un lecteur sans index parcourt les éléments de bout en bout et arrive au même résultat, et un index faux étant pire que pas d'index du tout, il est laissé de côté.

### Puis-je convertir plusieurs images à la fois ?

Oui. Chaque image de la liste devient son propre .ico avec les mêmes réglages, et le lot arrive en un zip avec un dossier par image, faute de quoi deux d'entre eux s'appelleraient favicon.ico et l'un écraserait l'autre. Chaque sortie que vous avez cochée est produite pour chaque image. Cliquez sur une ligne pour mettre cette image dans l'aperçu.

### Est-ce gratuit, et faut-il un compte ?

C'est gratuit, et il n'y a ni compte, ni identification, ni période d'essai, ni filigrane. Le nombre et la taille des fichiers ne sont pas limités non plus, parce qu'aucun serveur ne les paie et que tout le travail se fait sur votre propre machine. Le site affiche de la publicité, et c'est elle qui le finance ; les annonces ne reçoivent rien sur vos images.

### Est-ce que cela fonctionne hors ligne ?

Oui. Chargez la page une fois, coupez ensuite votre connexion et elle continue de travailler. C'est aussi la façon la plus simple de prouver que rien n'est envoyé, car un outil qui expédierait votre logo ailleurs pour le convertir s'arrêterait à l'instant où vous débranchez.

## Comment cette promesse se vérifie

- **Votre logo n'a nulle part où aller.** La Content-Security-Policy énumère toutes les adresses que cette page peut contacter, et aucune n'appartient à ce site. Il n'existe ici aucun point de collecte où vos fichiers pourraient aboutir, ni rien dans le code qui les y enverrait s'il en existait un.
- **Rien ici ne va rien chercher.** On ne trouve ni `fetch`, ni `XMLHttpRequest`, ni `sendBeacon` nulle part dans `src/`. La mise à l'échelle est un `drawImage` sur un canvas ; chaque icône est un en-tête écrit devant ces pixels par `src/ico.js` ou `src/icns.js`, dans cette page.
- **Le fichier est décrit à partir de ses propres octets.** La liste des tailles montrée à côté d'une icône finie n'est pas la liste des tailles que vous avez demandées : elle est relue dans le fichier qui vient d'être écrit, par `readIcoDirectory` ou `readIcnsElements`. Si ce qui écrit le fichier contredisait un jour les réglages, la page le dirait, plutôt que vous ne l'appreniez en voyant Windows ne rien dessiner et macOS afficher une feuille blanche.
- **Ce que Google charge, et ce qu'on ne lui donne pas.** Les scripts publicitaires et de mesure viennent de Google, et le bouton de don de Buy Me a Coffee. Aucun d'eux ne reçoit quoi que ce soit sur votre image. Chaque ligne qui lit, met à l'échelle ou écrit un fichier est servie depuis cette origine et figure dans le dépôt.
- **Tout fonctionne hors ligne.** Coupez le réseau : l'outil reste identique, puisqu'il n'a jamais comporté la moindre étape réseau. C'est la preuve la plus simple de toutes.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, `src/ico.js` et `src/icns.js` pour les deux formats d'icône, le répertoire, les entrées et le masque dans l'un, les dix emplacements nommés par Apple dans l'autre, et `src/sizes.js` pour l'origine de chaque taille affichée sur la page.
