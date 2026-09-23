# Analyseur de GIF — ce qu'il y a vraiment dans un GIF

Images, durées, palettes, et où est passé chaque octet.

> Démontez un GIF dans votre navigateur : chaque image avec sa durée et son effacement, les tables de couleurs, le nombre de boucles, et le détail octet par octet de la taille du fichier. Rien n'est envoyé.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/analyser-un-gif/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos GIF. Il n'y a pas de serveur.

Le fichier est ouvert et démonté par votre propre navigateur : la structure en blocs, la décompression LZW et chaque image dessinée sur cette page se font sur cette machine. Il n'y a, à l'autre bout de cette page, aucun serveur à qui envoyer un fichier, quand bien même quelque chose ici le voudrait.

- ✗ Sans envoi
- ✗ Sans compte
- ✓ Fonctionne hors ligne
- ✓ Open source
- ✓ Vos fichiers restent chez vous

## Comment analyser un GIF

1. **Choisissez un GIF.** Déposez-le sur le sélecteur ou allez le chercher à la main. Le navigateur le lit directement sur votre disque, et rien ne part nulle part pendant ce temps.
2. **Lisez d'abord le résumé.** La taille du canevas, le nombre d'images, la durée que l'animation annonce et celle qu'elle joue réellement. Ces deux dernières diffèrent plus souvent qu'on ne le croit, et la raison se trouve dans la section suivante.
3. **Regardez ce qui ressort.** Chaque ligne y est mesurée sur votre fichier : des durées qu'aucun navigateur ne respectera, un bloc de boucle manquant, des tables de couleurs que rien n'utilise, des métadonnées plus grosses que certaines images. Rien n'est une supposition sur ce que vous vouliez faire.
4. **Voyez où sont passés les octets.** Chaque octet du fichier est dans exactement une ligne, et les lignes font le fichier. Si l'essentiel n'est pas dans « pixels compressés », le reste du tableau dit où il se trouve à la place.
5. **Parcourez les images.** Chacune affiche sa durée, son rectangle, son mode d'effacement et sa taille. Basculez entre « le canevas après chaque image » et « seulement ce que chaque image stocke » : la seconde vue vous dit si le fichier est optimisé, car un GIF bien fait stocke de tout petits rectangles et un GIF mal fait stocke l'image entière à chaque fois.
6. **Emportez le rapport s'il vous sert.** L'analyse complète en texte brut, à coller dans un message ou à garder à côté du fichier. Il est construit dans la page à partir de ce qui est déjà à l'écran.

## La version longue

[Ce qu'il y a vraiment dans un GIF](https://abox.tools/fr/guides/ce-qu-il-y-a-dans-un-gif/): Images, délais, méthodes d'effacement et tables de couleurs expliqués, pourquoi les navigateurs refusent les délais les plus courts, et comment savoir où est passé le poids d'un GIF.

## Aussi dans la boîte

- [Images en vidéo](https://abox.tools/fr/images-en-video/): Transformer un dossier d'images en vidéo.
- [Coupeur de vidéos](https://abox.tools/fr/couper-une-video/): Marquez les passages à garder pendant la lecture. Récupérez-les en une seule vidéo.
- [Recadreur de vidéos](https://abox.tools/fr/recadrer-une-video/): Ramener un clip à ce qui compte dedans.
- [Inverseur de vidéo](https://abox.tools/fr/inverser-une-video/): La dernière image en premier, le son avec.

## Questions

### Mon GIF est-il envoyé quelque part ?

Non. Le fichier est lu, décompressé et dessiné par votre propre navigateur sur votre propre matériel. Cet outil n'a aucune partie serveur, et la `Content-Security-Policy` de la page nomme chaque adresse qu'elle a le droit de contacter : aucune ne nous appartient. Coupez le réseau, il analyse toujours des GIF.

### Pourquoi mon GIF joue-t-il plus lentement que ne le disent les durées ?

Parce que tous les navigateurs refusent de respecter une durée inférieure à deux centièmes de seconde et maintiennent l'image un dixième à la place. La règle a été écrite dans Netscape en 1996, pour les globes tournants et les panneaux « en construction » de l'époque, et elle a été recopiée dans tous les navigateurs depuis ; personne ne l'a jamais enlevée. \
\
Un GIF dont toutes les images annoncent 0,01 s ne joue donc pas à 100 images par seconde. Il joue à 10, soit cinq à dix fois plus lentement que ce que voulait le logiciel qui l'a fabriqué. Cette page affiche les deux chiffres, ce que dit le fichier et ce qu'il fera vraiment, et marque les images concernées. Le remède, dans le logiciel qui a écrit le fichier, est d'écrire 0,02 plutôt que 0,01.

### Que veut dire « effacement » ?

Ce qu'il faut laisser à l'écran quand le temps d'une image est écoulé. C'est le champ qui décide si une animation est propre ou si elle bave. \
\
**Laisser en place** veut dire que l'image suivante peint par-dessus celle-ci, ce que l'on veut quand les images sont opaques et se recouvrent. **Effacer jusqu'au fond** nettoie d'abord le rectangle de l'image, ce dont la transparence a besoin : sans cela, les parties transparentes de l'image suivante laissent voir la précédente en dessous. **Restaurer ce qu'il y avait dessous** remet ce qui était là avant que cette image ne se dessine, et c'est ainsi qu'on stocke un petit objet mobile sur un fond fixe. Enfin, **non précisé** signifie que le fichier n'a rien dit, et toutes les visionneuses le traitent comme « laisser en place ».

### Pourquoi mon GIF est-il aussi gros ?

Le tableau « Où sont passés les octets » répond à cela pour votre fichier plutôt qu'en général, et il n'y a que quelques réponses possibles. \
\
Si presque tout est en **pixels compressés**, le fichier est simplement beaucoup d'image : un GIF stocke chaque image en pixels entiers, sans compensation de mouvement ni réglage de qualité, si bien que la taille vaut à peu près la surface multipliée par le nombre d'images. Moins d'images, un format plus petit ou moins de couleurs sont les seuls leviers. \
\
Si une grosse part est en **tables de couleurs**, le fichier écrit une palette par image, à 768 octets pièce. Si une grosse part est en **métadonnées**, un logiciel de retouche a laissé derrière lui un paquet XMP, et il peut être retiré sans toucher à l'image. Et si toutes les images couvrent le canevas entier, l'encodeur n'a jamais cherché quelle partie avait réellement changé : sur une captation ou un enregistrement, c'est l'essentiel du fichier.

### Quelle est la différence entre les deux vues d'image ?

**Le canevas après chaque image**, c'est ce qu'une visionneuse montre à cet instant : cette image dessinée par-dessus ce que les précédentes ont laissé. **Seulement ce que chaque image stocke**, c'est le rectangle que le fichier détient vraiment pour cette image, seul, sans rien dessous. \
\
C'est la seconde qui est intéressante. Un GIF peut ne stocker d'une image que la partie du dessin qui a changé, et c'est pour cela qu'un enregistrement d'écran d'une fenêtre presque immobile peut être petit. Si chaque image de votre fichier occupe le canevas entier, personne n'a fait ce travail ; et regarder l'animation ne vous l'apprendra pas, seul l'examen de ce qui est stocké le fera.

### Il dit que mon fichier contient un commentaire ou du XMP. Qu'est-ce que c'est ?

Du texte qui voyage avec l'image et qu'aucune visionneuse ne dessine. Un bloc de commentaire est le plus souvent le nom du logiciel qui a écrit le fichier. Un paquet XMP est le XML qu'un logiciel de retouche écrit pour consigner ce qu'il a fait, et il peut contenir l'historique des modifications, la version du logiciel et parfois le nom de l'auteur. \
\
Cette page les imprime tous deux en entier, parce que la question intéressante sur les métadonnées est ce qu'elles disent, pas le fait qu'elles existent. Elles vous sont montrées, à vous et à personne d'autre : rien dans ce dépôt n'en lit quoi que ce soit à qui que ce soit.

### Peut-il ouvrir un GIF abîmé ?

Il essaie, et il vous dit où il a renoncé. Un fichier qui s'arrête au milieu d'un bloc, qui a un octet là où un marqueur devrait se trouver, ou qui porte une image dont les données compressées s'épuisent trop tôt, affichera quand même tout ce qui était lisible jusque-là, avec le problème nommé en haut. C'est justement le cas où l'on veut le plus un analyseur, alors jeter le fichier entier pour un octet fautif serait le mauvais comportement.

### Est-ce qu'il modifie mon fichier ?

Non. Cet outil ne fait que lire. Il n'y a pas de fichier de sortie, pas de réencodage et aucun bouton ici qui écrive un GIF : la seule chose téléchargeable est une copie de l'analyse en texte brut. Votre original reste intact sur votre disque, ce qui est aussi la réponse honnête à la question de ce qui se passe si vous fermez l'onglet.

### Est-ce gratuit, et faut-il un compte ?

C'est gratuit, et il n'y a ni compte, ni identification, ni période d'essai. La taille des fichiers n'est limitée que par la mémoire de votre machine. Le site affiche de la publicité, et c'est elle qui le finance ; les annonces ne reçoivent rien sur votre fichier.

### Est-ce que cela fonctionne hors ligne ?

Oui. Chargez la page une fois, coupez ensuite votre connexion et elle continue de travailler. C'est aussi la façon la plus simple de prouver que rien n'est envoyé, car un outil qui expédierait votre GIF ailleurs pour l'analyser s'arrêterait à l'instant où vous débranchez.

## Comment cette promesse se vérifie

- **Votre GIF n'a nulle part où aller.** La Content-Security-Policy nomme chaque adresse que cette page a le droit de contacter, et pas une seule ne nous appartient. Il n'existe ici aucun point de collecte où votre fichier pourrait atterrir, ni rien dans le code qui l'y enverrait s'il en existait un. Cette ligne disait autrefois `connect-src 'none'`, ce qui ne souffrait aucune exception ; la publicité a coûté cela, et le dire fait partie du marché.
- **Le lecteur, ce sont quatre fichiers de ce dépôt.** Rien ici n'utilise le décodeur GIF du navigateur pour savoir ce que contient le fichier, parce que ce décodeur ne dira jamais où est passé un octet. Le format est donc lu à la main : `src/gif.js` parcourt les blocs, `src/lzw.js` déplie les pixels, `src/frames.js` les empile, et `src/budget.js` rassemble les morceaux et vérifie qu'ils font bien la taille du fichier.
- **Les commentaires et les métadonnées vous sont montrés, à vous seul.** Un GIF peut transporter un bloc de commentaire, un paquet XMP décrivant une retouche ou un profil de couleurs, et cette page les imprime tous. Ils sont mis à l'écran devant vous et ne vont nulle part ailleurs : il n'existe dans ce dépôt aucun événement de mesure qui en transporte quoi que ce soit, et la page ne pourrait pas en envoyer un s'il en existait.
- **Ce que Google charge, et ce qu'on ne lui donne pas.** Les scripts publicitaires et de mesure viennent de Google. Aucun des deux ne reçoit quoi que ce soit sur votre fichier : ni le fichier, ni une vignette, ni un nom, une taille, un nombre d'images ou un commentaire. Chaque ligne qui lit, décompresse ou dessine un GIF est servie depuis cette origine et figure dans le dépôt.
- **Ce que charge le bouton de don, et ce qu'on ne lui donne pas.** Le bouton « Buy me a coffee » de l'en-tête est dessiné par un script de cdnjs.buymeacoffee.com et prend sa typographie sur Google Fonts. Ce n'est rien de plus qu'un lien : il ne signale aucune visite et ne reçoit rien sur vous ni sur vos fichiers. Rien ne se produit tant que vous ne cliquez pas, et ce sur quoi vous cliqueriez alors est le site de quelqu'un d'autre.
- **Tout fonctionne hors ligne.** Coupez le réseau et chaque partie de cette page continue de marcher. C'est la preuve la plus simple de toutes : un outil qui expédierait votre GIF ailleurs pour l'analyser s'arrêterait à l'instant où vous débranchez.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, `src/gif.js` pour le lecteur de blocs qui parcourt le fichier, `src/lzw.js` pour le décompresseur et `src/budget.js` pour la comptabilité des octets : aucun des trois ne comporte une ligne capable d'atteindre le réseau.
