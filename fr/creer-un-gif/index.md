# Créer un GIF — des images en GIF animé

Transformer une série d'images en une seule animation.

> Transformez des images JPG, PNG ou WebP en GIF animé, gratuitement et entièrement dans le navigateur. Vous fixez l'ordre, la vitesse et la taille. Rien n'est envoyé, et cela marche hors ligne.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/creer-un-gif/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos images. Il n'y a pas de serveur.

Chaque image est dessinée, quantifiée et compressée par votre propre navigateur, et le GIF fini est assemblé en mémoire sur cette machine. Il n'y a, à l'autre bout de cette page, aucun serveur à qui envoyer une image, quand bien même quelque chose ici le voudrait.

- ✗ Sans envoi
- ✗ Sans compte
- ✓ Fonctionne hors ligne
- ✓ Open source
- ✓ Vos fichiers restent chez vous

## Comment créer un GIF à partir d'images

1. **Choisissez vos images.** Déposez un dossier sur le sélecteur, ou allez chercher les fichiers à la main. Le navigateur les lit directement sur votre disque, et rien ne part nulle part pendant ce temps.
2. **Mettez-les dans l'ordre de lecture.** Faites glisser par la poignée, ou servez-vous des flèches. « Trier par nom » compte comme on s'y attend, si bien que `frame_2` arrive avant `frame_10`.
3. **Fixez la durée d'affichage de chaque image.** Une demi-seconde chacune, c'est un diaporama ; un vingtième de seconde, c'est de l'animation. Donnez la même durée à toutes d'un coup, ou laissez-en une s'attarder.
4. **Choisissez une taille, et la façon de choisir les couleurs.** Un GIF grossit avec sa surface et son nombre d'images, et aucun curseur de qualité ne vient le faire redescendre : la taille est donc le réglage qui compte le plus. 256 couleurs par image est le meilleur rendu et la valeur par défaut ; une palette unique donne un fichier plus léger et plus stable.
5. **Fabriquez le GIF et téléchargez-le.** Il est construit sur votre propre matériel : la durée dépend donc de votre machine et non d'une file d'attente. L'animation finie se joue dans la page avant que vous ne l'enregistriez.

## La version longue

[Comment créer un GIF animé à partir d'images](https://abox.tools/fr/guides/creer-un-gif-a-partir-d-images/): Transformer une série d'images en un GIF animé : à quelle vitesse un GIF peut réellement défiler, ce que change le réglage de la palette, et les trois choses qui allègent vraiment le fichier.

## Aussi dans la boîte

- [Découpeur de GIF](https://abox.tools/fr/decouper-un-gif-en-images/): Chaque image du GIF ressort en PNG.
- [Analyseur de GIF](https://abox.tools/fr/analyser-un-gif/): Images, durées, palettes, et où est passé chaque octet.
- [Images en vidéo](https://abox.tools/fr/images-en-video/): Transformer un dossier d'images en vidéo.
- [Coupeur de vidéos](https://abox.tools/fr/couper-une-video/): Marquez les passages à garder pendant la lecture. Récupérez-les en une seule vidéo.

## Questions

### Mes images sont-elles envoyées quelque part ?

Non. Vos images sont lues, dessinées, quantifiées et compressées par votre propre navigateur sur votre propre matériel. Cet outil n'a aucune partie serveur, et la `Content-Security-Policy` de la page nomme chaque adresse qu'elle a le droit de contacter : aucune ne nous appartient. Coupez le réseau, il fabrique toujours des GIF.

### Quels formats d'image puis-je utiliser ?

Tout format d'image fixe que votre navigateur sait décoder, ce qui en pratique veut dire JPG, PNG, WebP, GIF, AVIF et, sur les appareils Apple, HEIC. Il n'y a ici aucune liste séparée à tenir à jour, parce que le décodage est le travail du navigateur et non le nôtre.

### Pourquoi mon GIF est-il aussi gros ?

Parce qu'un GIF stocke chaque image en pixels entiers. Il n'y a pas de compensation de mouvement, rien n'est stocké comme « pareil qu'avant mais décalé », et il n'y a pas de réglage de qualité : la taille vaut à peu près la surface multipliée par le nombre d'images, et seules trois choses la font baisser. \
\
Réduisez-le : diviser la taille par deux divise le fichier par quatre. Utilisez moins d'images, ou gardez chacune plus longtemps. Descendez à 64 ou 32 couleurs et coupez le tramage, ce qui coûte moins qu'on ne le croit sur un aplat et beaucoup sur une photographie. Si cela ne rentre toujours pas, la réponse honnête est que ce que vous fabriquez est une vidéo, et qu'un MP4 de la même chose fera peut-être un dixième de la taille.

### À quelle vitesse un GIF peut-il jouer ?

Pas aussi vite que le chiffre le laisse croire. Le format stocke la durée de chaque image en centièmes de seconde, et les navigateurs remontent depuis les années 1990 toute valeur inférieure à deux centièmes à un dixième de seconde : une règle écrite pour les globes tournants de l'époque et jamais retirée. Une durée de 0,01 s ne joue donc pas à 100 images par seconde, mais à 10. C'est pour cela que cet outil ne vous propose rien en dessous de 0,02 s, et que 0,05 s, soit 20 images par seconde, est à peu près la limite de ce qu'il vaut la peine de demander.

### Que change le réglage de la palette ?

Une image de GIF contient au plus 256 couleurs, et il faut bien que quelqu'un les choisisse. \
\
**Les meilleures couleurs pour chaque image** en choisit 256 pour chaque dessin séparément : c'est le rendu le plus net, et la bonne réponse pour une série de photographies sans lien entre elles. **Une palette pour tout le GIF** construit une table unique à partir de toutes les images à la fois. Le fichier est plus léger, et cela supprime le scintillement qui apparaît quand la palette saute d'une image à l'autre au sein d'une même scène : c'est donc le choix à faire quand les images sont une séquence plutôt qu'une collection.

### Puis-je garder un fond transparent ?

Oui, si vos images en ont un : réglez « Transparence » sur « Garder les zones transparentes ». Une chose à savoir avant. La transparence d'un GIF tient dans un seul bit — un pixel est soit invisible, soit entièrement peint, sans rien entre les deux — si bien que les bords lissés, les ombres douces et tout ce qui s'estompe se retrouvent avec un bord dur. Si votre animation part sur un fond dont vous connaissez la couleur, l'aplatir sur cette couleur donnera un meilleur résultat.

### Y a-t-il une limite au nombre d'images ?

Aucune limite n'est inscrite dans l'outil. Le plafond réel, c'est la mémoire de votre machine et votre patience face au fichier qui en sort : les images sont lues une par une, donc cent images ne posent pas de problème, mais cent images en 640 px font aussi un très gros GIF. Voyez plus haut, « Pourquoi mon GIF est-il aussi gros ? »

### Est-ce gratuit, et faut-il un compte ?

C'est gratuit, et il n'y a ni compte, ni identification, ni période d'essai. Il n'y a pas non plus de filigrane sur le résultat. Le site affiche de la publicité, et c'est elle qui le finance ; les annonces ne reçoivent rien sur vos images.

### Est-ce que cela fonctionne hors ligne ?

Oui. Chargez la page une fois, coupez ensuite votre connexion et elle continue de travailler. C'est aussi la façon la plus simple de prouver que rien n'est envoyé, car un outil qui expédierait vos images ailleurs pour les traiter s'arrêterait à l'instant où vous débranchez.

## Comment cette promesse se vérifie

- **Vos images n'ont nulle part où aller.** La Content-Security-Policy nomme chaque adresse que cette page a le droit de contacter, et pas une seule ne nous appartient. Il n'existe ici aucun point de collecte où vos fichiers pourraient atterrir, ni rien dans le code qui les y enverrait s'il en existait un. Cette ligne disait autrefois `connect-src 'none'`, ce qui ne souffrait aucune exception ; la publicité a coûté cela, et le dire fait partie du marché.
- **L'encodeur, ce sont quatre fichiers de ce dépôt.** Un GIF a besoin d'un quantificateur de couleurs et d'un compresseur LZW, et le navigateur ne fournit ni l'un ni l'autre : les deux sont donc écrits ici, dans `src/quantize.js` et `src/lzw.js`, avec le conteneur dans `src/gif.js`. Rien n'est téléchargé pour en fabriquer un, et aucun moteur ne se charge à la première utilisation.
- **Ce que Google charge, et ce qu'on ne lui donne pas.** Les scripts publicitaires et de mesure viennent de Google. Aucun des deux ne reçoit quoi que ce soit sur vos images : ni un fichier, ni une vignette, ni un nom, une taille ou un nombre. Chaque ligne qui lit, décode, dessine ou compresse une image est servie depuis cette origine et figure dans le dépôt.
- **Ce que charge le bouton de don, et ce qu'on ne lui donne pas.** Le bouton « Buy me a coffee » de l'en-tête est dessiné par un script de cdnjs.buymeacoffee.com et prend sa typographie sur Google Fonts. Ce n'est rien de plus qu'un lien : il ne signale aucune visite et ne reçoit rien sur vous ni sur vos images. Rien ne se produit tant que vous ne cliquez pas, et ce sur quoi vous cliqueriez alors est le site de quelqu'un d'autre.
- **Tout fonctionne hors ligne.** Coupez le réseau et chaque partie de cette page continue de marcher. C'est la preuve la plus simple de toutes : un outil qui expédierait vos images ailleurs pour en faire un GIF s'arrêterait à l'instant où vous débranchez.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, `src/quantize.js` pour la palette à laquelle chaque image est réduite, ainsi que `src/lzw.js` et `src/gif.js` pour le compresseur et le fichier qui l'accueille. Aucun d'eux ne comporte une ligne capable d'atteindre le réseau.
