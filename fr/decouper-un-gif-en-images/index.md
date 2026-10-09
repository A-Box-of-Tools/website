# Découper un GIF — chaque image dans son propre PNG

Chaque image du GIF ressort en PNG.

> Découpez un GIF animé en ses images et enregistrez chacune en PNG, gratuitement et entièrement dans le navigateur. La transparence et les durées sont conservées. Rien n'est envoyé, et cela marche hors ligne.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/decouper-un-gif-en-images/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos GIF. Il n'y a pas de serveur.

Le GIF est lu, décompressé et dessiné par votre propre navigateur, et chaque PNG est encodé en mémoire sur cette machine. Il n'y a, à l'autre bout de cette page, aucun serveur à qui envoyer une animation, quand bien même quelque chose ici le voudrait.

- ✗ Sans envoi
- ✗ Sans compte
- ✓ Fonctionne hors ligne
- ✓ Open source
- ✓ Vos fichiers restent chez vous

## Comment découper un GIF en images

1. **Choisissez le GIF.** Déposez-le sur le sélecteur ou allez le chercher à la main. Le navigateur le lit directement sur votre disque, et la page vous dit ce qu'elle a trouvé : la taille, le nombre d'images, la durée de lecture et le nombre de répétitions.
2. **Décidez de ce que contient chaque PNG.** **L'image telle qu'elle apparaît**, c'est ce que veut presque tout le monde : l'image entière à cet instant de l'animation. **Seulement les pixels que cette image stocke**, c'est la pièce que le fichier transporte réellement, à sa propre taille et à sa propre place : c'est ainsi qu'un GIF reste petit, et ce n'est pas à quoi ressemble l'animation.
3. **Décidez du sort de la transparence.** Le PNG la conserve, et c'est le choix honnête. Remplissez-la d'une couleur si les images partent vers un endroit qui ignore la transparence et la transformerait en noir.
4. **Choisissez les images voulues.** Toutes, par défaut. « Garder une image sur deux » allège un long enregistrement, et les cases de la grille l'emportent dessus. La numérotation ne change jamais : l'image 42 s'appelle toujours image 42, si peu de ses voisines que vous ayez gardées.
5. **Téléchargez-les.** Une par une depuis la grille, ou toutes dans un seul ZIP pour n'avoir qu'une demande d'enregistrement au lieu de plusieurs centaines. Le ZIP peut emporter un `frames.txt` indiquant la durée d'affichage de chaque image, la seule chose qu'un dossier de PNG ne sait pas dire tout seul.

## La version longue

[Comment découper un GIF en images](https://abox.tools/fr/guides/decouper-un-gif-en-images/): Récupérer chaque image d'un GIF animé en PNG : pourquoi certaines images ne sont qu'un petit morceau, ce que devient la transparence, et comment garder les durées pour tout remonter ensuite.

## Aussi dans la boîte

- [Analyseur de GIF](https://abox.tools/fr/analyser-un-gif/): Images, durées, palettes, et où est passé chaque octet.
- [Compression vidéo](https://abox.tools/fr/compresser-une-video/): Donnez le poids maximal. L’outil calcule le reste et mesure le résultat avant téléchargement.
- [Conversion MP4](https://abox.tools/fr/convertir-en-mp4/): Enregistrement d’écran, extraction ou caméra : H.264 et AAC dans MP4. Copie intacte quand possible, réencodage seulement si nécessaire.
- [Rotation vidéo](https://abox.tools/fr/faire-pivoter-une-video/): Un quart de tour, un demi-tour, dans l’autre sens. Avec la rotation d’en-tête, les images restent intactes.

## Questions

### Mon GIF est-il envoyé quelque part ?

Non. Le fichier est lu, décompressé et dessiné par votre propre navigateur sur votre propre matériel, et chaque PNG est encodé ici, en mémoire. Cet outil n'a aucune partie serveur, et la `Content-Security-Policy` de la page nomme chaque adresse qu'elle a le droit de contacter : aucune ne nous appartient. Coupez le réseau, il découpe toujours des GIF.

### Pourquoi une image ressemble-t-elle à un petit bout de l'image ?

Parce que c'est ce que contient le fichier. Un GIF, c'est une première image suivie de rustines : chaque image ultérieure ne stocke que le rectangle qui a changé, et tout le reste à l'écran est ce que les précédentes y ont laissé. Une tête qui parle devant un mur immobile stocke donc un visage par image plutôt qu'une image par image, et c'est toute la raison pour laquelle le format n'est pas énorme. \
\
Vous voyez cela parce que « Seulement les pixels que cette image stocke » est sélectionné. Passez à « L'image telle qu'elle apparaît » et chaque PNG sera l'image entière, telle que l'animation la montre à cet instant.

### La transparence est-elle conservée ?

Oui. La transparence d'un GIF tient dans un seul bit : un pixel est soit peint, soit invisible, sans rien entre les deux, et le PNG stocke exactement cela. Les images ressortent donc avec leurs zones transparentes intactes. Si vous préférez un fond opaque, réglez « Zones transparentes » sur un remplissage de couleur : elle est écrite dans le PNG et ne pourra plus en être retirée.

### Pourquoi les durées ne sont-elles pas celles que j'attendais ?

Un GIF stocke chaque durée en centièmes de seconde, et les navigateurs remontent depuis les années 1990 toute valeur inférieure à deux centièmes à un dixième de seconde : une règle écrite pour les globes tournants de l'époque et jamais retirée. Une image dont le fichier dit 0,01 s est donc jouée à 0,10 s partout. Cet outil affiche la durée telle qu'elle est réellement jouée, et indique à côté ce que stocke le fichier quand les deux diffèrent.

### Puis-je remonter les images ensuite ?

Oui, avec le [Créateur de GIF](https://abox.tools/fr/creer-un-gif/) de ce site ou avec n'importe quoi d'autre qui accepte un dossier d'images. C'est à cela que sert le `frames.txt` du ZIP : découper une animation jette les durées, puisqu'un PNG n'a nulle part où noter combien de temps il est resté affiché, et la liste emporte donc avec elle la durée et la position de chaque image.

### Dans quels formats les images peuvent-elles être enregistrées ?

En PNG, et délibérément en PNG seulement. Une image de GIF, c'est au plus 256 couleurs et un bit de transparence ; le PNG stocke cela exactement et sans perte, là où le JPEG jetterait la transparence, inventerait des couleurs que l'image n'a jamais eues et ferait le plus souvent un fichier *plus gros* à partir d'un aplat. S'il vous faut des JPEG, convertissez les PNG ensuite avec le [Redimensionneur d'images](https://abox.tools/fr/redimensionner-une-image/).

### Y a-t-il une limite au nombre d'images lues ?

L’outil utilise une estimation de planification de 512 MiB pour les tampons source, les fragments conservés, les aperçus et la sortie, et s’arrête avant de dépasser 128 Mi pixels décodés. Un petit fragment ne réduit pas les tampons de l’image source complète. Les plans risqués sont refusés avant le dessin ; les résultats partiels ne sont disponibles que si leurs tampons tiennent. Les planches et les PNG accumulés comptent aussi. Les allocations internes, objets JS et limites de canvas peuvent coûter plus ou refuser plus tôt : il ne s’agit ni d’une mesure de mémoire libre ni d’une garantie.

### Ouvre-t-il un GIF abîmé ?

Souvent. Les images complètes sont conservées dans les fichiers tronqués ou sans marqueur final. Dans une image partielle, les zones manquantes utilisent la première couleur de la palette sauf si elle est transparente ; la page le signale. Les fichiers sans image lisible et les plans de tampons risqués sont refusés.

### Est-ce gratuit, et faut-il un compte ?

C'est gratuit, et il n'y a ni compte, ni identification, ni période d'essai. Les images ne portent aucun filigrane non plus. Le site affiche de la publicité, et c'est elle qui le finance ; les annonces ne reçoivent rien sur vos fichiers.

### Est-ce que cela fonctionne hors ligne ?

Oui. Chargez la page une fois, coupez ensuite votre connexion et elle continue de travailler. C'est aussi la façon la plus simple de prouver que rien n'est envoyé, car un outil qui expédierait votre animation ailleurs pour la traiter s'arrêterait à l'instant où vous débranchez.

## Comment cette promesse se vérifie

- **Votre GIF n'a nulle part où aller.** La Content-Security-Policy nomme chaque adresse que cette page a le droit de contacter, et pas une seule ne nous appartient. Il n'existe ici aucun point de collecte où vos fichiers pourraient atterrir, ni rien dans le code qui les y enverrait s'il en existait un. Cette ligne disait autrefois `connect-src 'none'`, ce qui ne souffrait aucune exception ; la publicité a coûté cela, et le dire fait partie du marché.
- **Le lecteur de GIF, ce sont deux fichiers de ce dépôt.** Un navigateur lit les GIF sans exposer leurs composants. `src/shared/gif-decode.js` lit le conteneur et décompresse le LZW ; `src/shared/gif-compose.js` applique les règles de remplacement qui définissent chaque image avec celles qui la précèdent. Aucun contenu n’est récupéré pour ouvrir le fichier, aucun moteur n’est téléchargé au premier usage.
- **Ce que Google charge, et ce qu'on ne lui donne pas.** Les scripts publicitaires et de mesure viennent de Google. Aucun des deux ne reçoit quoi que ce soit sur votre animation : ni un fichier, ni une image, ni un nom, une taille ou un nombre. Chaque ligne qui lit, décompresse, dessine ou encode une image est servie depuis cette origine et figure dans le dépôt.
- **Ce que le bouton de don charge, et ce qu'on ne lui donne pas.** Le bouton « Buy me a coffee » de l'en-tête est dessiné par un script de cdnjs.buymeacoffee.com et prend sa typographie sur Google Fonts. Ce n'est rien de plus qu'un lien : il ne signale aucune visite et ne reçoit rien sur vous ni sur vos fichiers. Rien ne se produit tant que vous ne cliquez pas, et ce sur quoi vous cliqueriez alors est le site de quelqu'un d'autre.
- **Cela fonctionne hors ligne.** Coupez le réseau et chaque partie de cette page continue de marcher. C'est la preuve la plus simple de toutes : un outil qui expédierait votre animation ailleurs pour la démonter s'arrêterait à l'instant où vous débranchez.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, `src/shared/gif-decode.js` pour le lecteur qui décompresse les images et `src/shared/gif-compose.js` pour leur superposition — aucun de ces fichiers ne peut contacter le réseau.
