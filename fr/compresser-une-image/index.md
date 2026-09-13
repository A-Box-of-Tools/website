# Compresseur d'images — compresser à une taille exacte

Vous donnez la taille. Il se charge du reste.

> Compressez un JPEG, un PNG ou un WebP à une taille exacte : 100 KB, 2 MB, ce que vous voulez. Tout se passe dans votre navigateur, sans envoi, sans compte et même hors ligne.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/compresser-une-image/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos images. Il n'y a pas de serveur.

La compression se fait dans votre navigateur, sur votre propre matériel, avec les encodeurs qu'il embarque déjà. Cet outil ne comporte aucune fonction réseau, ni pour aller chercher quoi que ce soit, ni pour l'envoyer. Et quand bien même il en aurait une, il n'y a à l'autre bout de cette page aucun serveur à qui remettre une image.

- ✗ Sans envoi
- ✗ Sans compte
- ✗ Sans limite de taille
- ✓ Fonctionne hors ligne
- ✓ Open source

## Comment compresser une image à une taille précise

1. **Choisissez vos images.** Déposez-les sur la zone prévue ou sélectionnez-les à la main. Le navigateur les lit directement sur votre disque, sans que rien parte où que ce soit pendant ce temps.
2. **Tapez la taille qu'on vous a imposée.** 100 KB pour le formulaire d'envoi qui refuse obstinément votre photo, 500 KB pour le portail de candidature, 2 MB pour une page qui doit charger vite. Les quatre plus courantes sont des boutons.
3. **Appuyez sur « Compresser à la taille visée ».** Chaque image est encodée plusieurs fois pendant que l'outil resserre autour de la meilleure qualité qui tienne. Ce qui passe déjà sous la taille visée reste exactement tel quel.
4. **Regardez ce que cela a coûté, puis téléchargez.** Chaque résultat indique dans quel format il a été écrit, à quelle qualité, si les dimensions ont changé, et à quel point il correspond à l'original une fois mesuré. Le bouton « Comparer » met les deux images côte à côte.

## La version longue

[Comment compresser une image à une taille de fichier exacte](https://abox.tools/fr/guides/compresser-une-image-a-une-taille-precise/): Un formulaire d'envoi veut 500 KB et votre photo en fait 4 MB. Ce qu'une limite de taille coûte vraiment, quel réglage déplacer en premier, et pourquoi un PNG ne maigrit pas comme un JPEG.

## Aussi dans la boîte

- [Redimensionneur d'images](https://abox.tools/fr/redimensionner-une-image/): Vous dites la taille. Vous tracez le cadre. Vous choisissez le format.
- [HEIC vers JPG](https://abox.tools/fr/convertir-heic-en-jpg/): Les photos que fait un iPhone, dans un format que tout ouvre.
- [Photo d'identité](https://abox.tools/fr/photo-d-identite/): Choisissez le pays. L'outil applique sa règle, exactement.
- [Empileur d'images](https://abox.tools/fr/empiler-des-images/): Vingt prises n'en font plus qu'une, sans vingt envois et sans dérawtiseur.

## Questions

### Mon image est-elle envoyée quelque part ?

Non. Le fichier est décodé, compressé et mesuré par votre propre navigateur sur votre propre matériel, avec les encodeurs JPEG, PNG et WebP qu'il embarque déjà. Cet outil ne comporte aucune fonction réseau, si bien qu'il ne va jamais rien chercher et n'envoie jamais rien. Sa `Content-Security-Policy` énumère par ailleurs toutes les adresses qu'il peut contacter, dont aucune n'appartient à ce site.

### Comment atteint-il une taille exacte ?

En essayant. Aucune formule ne transforme un réglage de qualité en un nombre d'octets, puisque tout dépend de l'image ; l'outil encode donc celle-ci plusieurs fois et cherche la réponse. Il part du haut de la plage de qualité et resserre par dichotomie, ce qui lui fait trouver la meilleure qualité acceptable en huit encodages environ. Chaque taille affichée sur la page correspond à un vrai fichier encodé, et non à une estimation.

### Que veut dire « perte minimale » exactement, ici ?

Trois choses précises. D'abord, une image déjà sous votre taille visée est transmise octet pour octet plutôt que réencodée. Ensuite, la qualité est dépensée avant la résolution, et seulement jusqu'à un plancher où les artefacts de compression commencent à se voir. En dessous de ce plancher, l'outil réduit plutôt l'image et remonte la qualité, car moins de bons pixels valent mieux que davantage de pixels abîmés. Enfin, une fois trouvé un résultat qui tient, la recherche remonte jusqu'à épuiser le budget, ce qui vous évite un fichier de 300 KB quand vous en aviez demandé 500.

### Que sont les valeurs SSIM et PSNR sur chaque résultat ?

Ce sont des mesures de ce que la compression a coûté, prises en décodant le résultat et en le comparant à l'image d'origine. Le SSIM compare la luminosité, le contraste et la structure locales, ce qui se rapproche bien davantage de ce qui gêne l'œil que le comptage des pixels modifiés ; au-dessus de 0,98 environ, les deux images sont difficiles à distinguer côte à côte. Le PSNR est le traditionnel chiffre en décibels. L'un comme l'autre sont calculés sur votre machine et affichés, pour que l'annonce d'une faible perte se vérifie au lieu de se décréter.

### Quels formats sait-il lire et écrire ?

Il lit tout ce que votre navigateur sait décoder, ce qui revient en pratique au JPEG, au PNG, au WebP, au GIF, au BMP, ainsi qu'à l'AVIF sur la plupart des navigateurs actuels. Il écrit du JPEG, du PNG et du WebP, parce que ce sont là les encodeurs que les navigateurs embarquent. En mode « auto », il garde le format dans lequel votre fichier est arrivé et ne bascule sur WebP que lorsque le conserver aurait imposé un redimensionnement ou une baisse de qualité visible.

### Pourquoi ne peut-il pas compresser un PNG bien loin ?

Parce que le PNG est un format sans perte, dépourvu de toute molette de qualité à tourner. Le seul moyen d'alléger un PNG consiste à lui donner moins de pixels ou moins de couleurs ; avec PNG sélectionné, l'outil n'atteint donc sa cible que par le redimensionnement. Si l'image est une photographie, le JPEG ou le WebP s'approcheront bien davantage de cette cible, à une qualité dont vous verrez qu'elle convient. Et s'il s'agit d'un logo ou d'une capture d'écran avec transparence, le WebP conserve la transparence que le JPEG remplirait de blanc.

### Compresser une image supprime-t-il ses données EXIF et GPS ?

Oui, par effet de bord. Compresser revient à décoder l'image en pixels puis à réencoder ces pixels, or un canvas rempli de pixels ne porte aucune étiquette : le lieu, le modèle d'appareil, les horodatages et tout le reste ne sont tout simplement pas écrits dans le nouveau fichier. Si vous voulez faire disparaître les métadonnées en laissant l'image intacte, passez plutôt par le [lecteur et effaceur EXIF](https://abox.tools/fr/supprimer-les-donnees-exif/), qui réécrit le conteneur sans rien recompresser.

### Est-ce gratuit, et faut-il un compte ?

C'est gratuit, et il n'y a ni compte, ni identification, ni période d'essai, ni filigrane. Le nombre et la taille des fichiers ne sont pas limités non plus, parce qu'aucun serveur ne les paie et que tout le travail se fait sur votre propre machine. Le site affiche de la publicité, et c'est elle qui le finance ; les annonces ne reçoivent rien sur vos images.

### Est-ce que cela fonctionne hors ligne ?

Oui. Chargez la page une fois, coupez ensuite votre connexion et elle continue de travailler. C'est aussi la façon la plus simple de prouver que rien n'est envoyé, car un outil qui expédierait vos images ailleurs pour les compresser s'arrêterait à l'instant où vous débranchez.

## Comment cette promesse se vérifie

- **Vos images n'ont nulle part où aller.** La Content-Security-Policy énumère toutes les adresses que cette page peut contacter, et aucune n'appartient à ce site. Il n'existe ici aucun point de collecte où vos fichiers pourraient aboutir, ni rien dans le code qui les y enverrait s'il en existait un.
- **Rien ici ne va rien chercher.** On ne trouve ni `fetch`, ni `XMLHttpRequest`, ni `sendBeacon` nulle part dans `src/`. La compression passe par `canvas.toBlob`, c'est-à-dire par l'encodeur déjà installé dans votre navigateur.
- **Les chiffres sont mesurés, pas remontés.** Les tailles, la valeur de qualité et la comparaison SSIM sont toutes calculées sur cette page, puis affichées. Aucun événement d'analytique maison, dans tout ce dépôt, ne transporte un nom de fichier, une taille, un nombre ou un résultat.
- **Ce que Google charge, et ce qu'on ne lui donne pas.** Les scripts publicitaires et de mesure viennent de Google, et le bouton de don de Buy Me a Coffee. Aucun d'eux ne reçoit quoi que ce soit sur vos images. Chaque ligne qui lit, compresse ou mesure un fichier est servie depuis cette origine et figure dans le dépôt.
- **Tout fonctionne hors ligne.** Coupez le réseau : l'outil reste identique, puisqu'il n'a jamais comporté la moindre étape réseau. C'est la preuve la plus simple de toutes.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, `src/compress.js` pour la recherche qui décide de la quantité de qualité à dépenser, et `src/measure.js` pour la comparaison derrière le chiffre de « correspondance visuelle ».
