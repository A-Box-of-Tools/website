# Vidéo en GIF — convertir une vidéo en GIF

Choisissez le passage, la taille et la cadence.

> Transformez un passage d'un MP4, d'un MOV ou d'un WebM en GIF animé. Choisissez le passage, la largeur et la cadence ; les images sont lues et le GIF est écrit dans votre navigateur. Rien n'est envoyé.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/video-en-gif/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos vidéos. Il n'y a pas de serveur.

Chaque image est lue, redimensionnée, quantifiée et écrite par votre propre navigateur, sur votre propre matériel. Cet outil ne comporte aucune fonction réseau, si bien que rien ici ne sait aller chercher ni envoyer quoi que ce soit. Et quand bien même il en aurait une, il n'y a à l'autre bout de cette page aucun serveur à qui remettre une vidéo.

- ✗ Sans envoi
- ✗ Sans compte
- ✗ Sans filigrane
- ✓ N'importe quelle durée
- ✓ Fonctionne hors ligne

## Comment transformer une vidéo en GIF

1. **Choisissez une vidéo.** Déposez un MP4, un MOV, un M4V ou un WebM sur la zone prévue, ou sélectionnez-en un à la main. Le navigateur le lit directement sur votre disque, sans que rien parte où que ce soit pendant ce temps.
2. **Marquez le passage.** Lisez le clip et appuyez sur `I` là où il doit commencer et sur `O` là où il doit finir, ou tirez les poignées sur la barre. Un GIF dure quelques secondes, et c'est ce réglage qui décide si le fichier sera petit ou énorme, bien plus que les deux autres.
3. **Choisissez la largeur et la cadence.** 480 pixels de large et 12 images par seconde conviennent à la plupart des usages d'un GIF. Diviser la largeur par deux divise les pixels par quatre ; douze images par seconde se lisent comme du mouvement sans payer pour celles que personne ne voit.
4. **Fabriquez-le, et téléchargez.** Les images sont lues, une seule palette de 256 couleurs est choisie pour toute l'animation, et chaque image n'est écrite que sur la partie qui a changé. Il joue sur la page une fois prêt, et c'est le même fichier que celui du téléchargement.

## La version longue

[Comment transformer une vidéo en GIF](https://abox.tools/fr/guides/transformer-une-video-en-gif/): Quel passage, quelle largeur et quelle cadence choisir, pourquoi un GIF tiré d'une vidéo pèse dix fois la vidéo, et quand en faire un tout court.

## Aussi dans la boîte

- [Créateur de GIF](https://abox.tools/fr/creer-un-gif/): Transformer une série d'images en une seule animation.
- [Découpeur de GIF](https://abox.tools/fr/decouper-un-gif-en-images/): Chaque image du GIF ressort en PNG.
- [Analyseur de GIF](https://abox.tools/fr/analyser-un-gif/): Images, durées, palettes, et où est passé chaque octet.
- [Images en vidéo](https://abox.tools/fr/images-en-video/): Transformer un dossier d'images en vidéo.

## Questions

### Ma vidéo est-elle envoyée quelque part ?

Non. Elle est lue, échantillonnée et convertie par votre propre navigateur sur votre propre matériel. Cet outil n'a pas de côté serveur, et sa `Content-Security-Policy` énumère toutes les adresses que la page peut contacter, dont aucune n'appartient à ce site. Coupez votre connexion et fabriquez un GIF quand même, si vous préférez vérifier plutôt qu'on vous le dise.

### Quels formats vidéo puis-je convertir ?

Le MP4, le M4V et le MOV sont lus directement, quel que soit leur contenu : H.264, HEVC, AV1 ou VP9, du moment que votre navigateur sait décoder ce codec. Tout le reste que votre navigateur sait lire, à commencer par le WebM, est lu en déplaçant le lecteur jusqu'à chaque instant, ce qui est plus lent et un peu moins précis quant à savoir quelle image atterrit où. Un fichier que le navigateur ne sait ni lire ni jouer, ce qui en pratique veut dire l'AVI, le WMV, le FLV et la plupart des MKV, est refusé avec un message qui le dit, plutôt que d'échouer à mi-course.

### Pourquoi mon GIF est-il si gros ?

Parce que le GIF est un format de 1987 qui stocke des images entières plutôt que du mouvement. Il n'existe aucun moyen d'en tirer, d'un clip de cinq secondes, un fichier aussi léger que le MP4 de cinq secondes dont il vient, et un GIF tiré d'une vidéo pèse couramment dix fois la vidéo. Les trois réglages qui décident vraiment sont, dans l'ordre : la durée du passage, la largeur de l'image, et le nombre d'images par seconde. Diviser la largeur par deux divise les pixels par quatre, et ce sont les pixels qui coûtent.

### Pourquoi seulement 256 couleurs ?

C'est le format : un GIF porte une table d'au plus 256 couleurs et stocke chaque pixel comme un numéro dans cette table. Cet outil choisit ces 256 en comptant les couleurs de chaque image de votre passage et en les répartissant en 256 groupes, par la coupe médiane, qui est la méthode classique, si bien que la palette colle à votre clip au lieu d'être un jeu de couleurs figé. Là où une couleur manque, le tramage mélange les deux plus proches pour qu'un dégradé reste un dégradé au lieu de devenir des bandes.

### Que fait le réglage de tramage ?

Il échange un peu de bruit contre beaucoup de bandes en moins. Activé, un ciel qui serait sinon devenu quatre aplats reste un dégradé, au prix d'une légère texture et d'un fichier plus gros. Désactivé, l'image est plus plate et le fichier plus léger, ce qui convient aux captures d'écran, au dessin au trait et à tout ce qui est déjà fait d'aplats. Le tramage employé ici est ordonné plutôt que du type à diffusion d'erreur : un fond inchangé reste ainsi parfaitement immobile d'une image à l'autre au lieu de scintiller.

### Y a-t-il une limite de durée ou de taille ?

C'est le passage qui est limité, et par la mémoire plutôt que par une règle : chacune de ses images est retenue en même temps pendant le choix de la palette, si bien que la page calcule ce que vos réglages coûteraient et le dit avant de commencer. Elle refuse plutôt que de laisser l'onglet manquer de mémoire et disparaître. Un passage plus court, une largeur plus petite ou une cadence plus basse font tous baisser le chiffre.

### Garde-t-il le son ?

Un GIF ne sait pas transporter de son. Il n'existe aucune version du format qui ait de l'audio, ce qui est la principale raison pour laquelle le web a essentiellement remplacé les GIF par de la vidéo muette en boucle. Si le son compte, gardez la vidéo : le [coupeur de vidéos](https://abox.tools/fr/couper-une-video/) en découpera un passage sans réencoder une seule image.

### Est-ce gratuit, et faut-il un compte ?

C'est gratuit, et il n'y a ni compte, ni identification, ni période d'essai, ni filigrane. Le site affiche de la publicité, et c'est elle qui le finance ; les annonces ne reçoivent rien sur votre vidéo.

## Comment cette promesse se vérifie

- **Vos vidéos n'ont nulle part où aller.** La Content-Security-Policy énumère toutes les adresses que cette page peut contacter, et aucune n'appartient à ce site. Il n'existe ici aucun point de collecte où votre fichier pourrait aboutir, ni rien dans le code qui l'y enverrait s'il en existait un.
- **Rien ici ne va rien chercher.** Cet outil n'a aucune fonction réseau : pas d'adresse à coller, rien à télécharger, aucun moteur récupéré à la première utilisation. Chaque octet qui touche à votre vidéo vient de cette origine, au chargement de la page.
- **Le décodage est local.** Les images passent par WebCodecs dans votre propre navigateur, ou par le moteur de lecture qui vous montrerait le clip de toute façon. Lequel des deux a servi est écrit en haut de la page, parce que cela change la façon dont les images sont choisies et que vous devez pouvoir le voir.
- **Le GIF est écrit ici, dans du code que vous pouvez lire.** La palette, le tramage et la compression LZW font environ six cents lignes dans le dossier propre à cet outil. Il n'y a aucun service d'encodage, aucune bibliothèque récupérée à l'exécution, et aucun endroit dans tout cela où une image pourrait être envoyée.
- **Ce que Google charge, et ce qu'on ne lui donne pas.** Les scripts publicitaires et de mesure viennent de Google. Ni l'un ni l'autre ne reçoit quoi que ce soit sur votre vidéo : ni un fichier, ni une image, ni un nom, une taille, une durée ou le passage que vous avez marqué. Chaque ligne qui lit, échantillonne, quantifie ou encode est servie depuis cette origine et figure dans le dépôt.
- **Ce que le bouton de don charge, et ce qu'on ne lui donne pas.** Le bouton « Buy me a coffee » dans l'en-tête est dessiné par un script de cdnjs.buymeacoffee.com et se compose avec Google Fonts. C'est un lien, rien de plus : il ne signale aucune visite, et on ne lui donne rien sur vous ni sur votre vidéo.
- **Tout fonctionne hors ligne.** Coupez le réseau et tout, sur cette page, continue de fonctionner. C'est la preuve la plus simple de toutes.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, `src/frames.js` pour les deux façons de lire les images d'une vidéo, `src/quantize.js` pour la palette, et `src/gif.js` pour le fichier lui-même, LZW compris. Aucun d'eux n'importe la moindre chose capable d'émettre une requête.
