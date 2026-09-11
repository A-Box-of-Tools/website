# Extraire une image — enregistrer une image d'une vidéo

Un arrêt sur image en pleine qualité, à n'importe quel instant.

> Enregistrez n'importe quelle image d'un MP4, MOV ou WebM en PNG ou JPEG pleine taille. Avancez image par image, ou prenez-en une toutes les quelques secondes. Tout se passe dans le navigateur, rien n'est envoyé.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/extraire-une-image-d-une-video/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos vidéos. Il n'y a pas de serveur.

Les images sont trouvées, décodées et dessinées par votre propre navigateur, sur votre propre matériel. Rien ici ne peut aller chercher ou envoyer quoi que ce soit : cet outil ne comporte aucune fonction réseau. Et même s'il en avait une, il n'y a, à l'autre bout de cette page, aucun serveur à qui envoyer une vidéo.

- ✗ Sans envoi
- ✗ Sans compte
- ✗ Sans filigrane
- ✓ Pleine résolution
- ✓ Fonctionne hors ligne

## Comment extraire une image d'une vidéo

1. **Choisissez une vidéo.** Déposez un MP4, MOV, M4V ou WebM sur le sélecteur, ou allez le chercher à la main. Le navigateur le lit directement sur votre disque, et rien ne part nulle part pendant ce temps.
2. **Trouvez le moment.** Lisez le clip et arrêtez-vous où vous voulez, ou faites glisser le curseur : sur un MP4, le curseur avance d'une image par cran, il n'y a donc pas d'arrondi entre ce que vous voyez et ce que vous enregistrez. Les flèches avancent d'une image, et `Maj` enfoncée de dix.
3. **Choisissez un format.** Le PNG conserve l'image exactement telle qu'elle a été décodée, et c'est ce que veut dire ici « pleine qualité ». JPEG et WebP sont plus petits et ajoutent une deuxième compression par-dessus celle de la vidéo, ce qui convient pour un aperçu et pas pour une photo qui sera retravaillée ensuite.
4. **Extrayez-en une, ou une série.** Une image seule part directement dans vos téléchargements. « Toutes les N secondes » parcourt le clip une fois et prend un arrêt sur image à chaque repère, ce qui est pratique pour les planches-contacts et les vignettes, et le tout arrive dans un seul ZIP plutôt qu'en cent demandes d'enregistrement.

## La version longue

[Comment enregistrer une image d'une vidéo en photo](https://abox.tools/fr/guides/extraire-une-image-d-une-video/): Sortir une image d'une vidéo à sa vraie résolution : pourquoi une capture d'écran d'un lecteur en pause n'est pas la même image, dans quel format l'enregistrer, et comment tomber sur l'image exacte que vous visiez.

## Aussi dans la boîte

- [Vidéo en GIF](https://abox.tools/fr/video-en-gif/): Choisissez le passage, la taille et la cadence.
- [Créateur de GIF](https://abox.tools/fr/creer-un-gif/): Transformer une série d'images en une seule animation.
- [Découpeur de GIF](https://abox.tools/fr/decouper-un-gif-en-images/): Chaque image du GIF ressort en PNG.
- [Analyseur de GIF](https://abox.tools/fr/analyser-un-gif/): Images, durées, palettes, et où est passé chaque octet.

## Questions

### Ma vidéo est-elle envoyée quelque part ?

Non. Elle est lue et décodée par votre propre navigateur sur votre propre matériel. Cet outil n'a aucune partie serveur, et la `Content-Security-Policy` de la page nomme chaque adresse qu'elle a le droit de contacter : aucune ne nous appartient. Si vous préférez vérifier plutôt qu'être cru sur parole, coupez la connexion et extrayez une image quand même.

### Que veut dire au juste « pleine qualité » ?

Deux choses. L'image est enregistrée à la résolution de la vidéo, pas à la taille de l'aperçu sur la page : un clip 4K donne une photo de 3840 x 2160. Et avec le PNG, l'image est stockée exactement telle qu'elle est sortie du décodeur, si bien que le fichier contient la photo que contient la vidéo, sans une deuxième passe de compression par-dessus. Une capture d'écran d'une fenêtre de lecteur ne vous donne ni l'une ni l'autre : elle fait la taille de la fenêtre, et elle est prise après que le lecteur l'a redimensionnée et lui a appliqué sa gestion des couleurs.

### De quels formats vidéo puis-je extraire une image ?

MP4, M4V et MOV sont lus directement, quoi qu'ils contiennent : H.264, HEVC, AV1 ou VP9, tant que votre navigateur sait décoder ce codec. C'est la voie exacte, celle où l'outil s'adresse à des images précises. Tout ce que votre navigateur sait lire par ailleurs, WebM en tête, est traité en déplaçant le lecteur et en dessinant ce qu'il montre : cela enregistre toujours une photo pleine taille, mais tombe sur l'image que le lecteur a choisie plutôt que sur celle que vous avez demandée. Un fichier que le navigateur ne sait ni lire ni jouer, ce qui en pratique veut dire AVI, WMV, FLV et la plupart des MKV, est refusé avec un message qui le dit.

### Puis-je avancer image par image ?

Sur un MP4, oui, et exactement : l'outil lit la liste des images du fichier lui-même, si bien que les flèches se déplacent entre les images qui s'y trouvent réellement, y compris sur un clip dont la cadence varie, où un pas fixe d'un trentième de seconde dériverait. Sur la voie de lecture, cette liste n'existe pas : un pas y vaut environ une image, et la page le dit.

### Pourquoi ma vidéo verticale de téléphone est-elle à l'endroit ici ?

Parce que la rotation a été appliquée exprès. Un téléphone filme en paysage et inscrit un quart de tour dans le fichier plutôt que de tourner les pixels ; l'image que rend un décodeur est donc couchée, et chaque lecteur la redresse en route vers votre écran. Un outil qui saute cette étape enregistre une photo plausible du bon moment, mais de travers. Celui-ci lit la rotation sur la piste et l'applique avant de dessiner quoi que ce soit.

### Y a-t-il une limite de taille ou de durée de la vidéo ?

Aucune limite n'est inscrite dans l'outil, et le fichier n'est pas chargé d'un coup en mémoire : il est parcouru par tranches de quelques mégaoctets, ce qui explique qu'un long clip s'ouvre aussi vite qu'un court. Les arrêts sur image que vous prenez restent dans la page jusqu'au téléchargement ; le plafond réel, c'est donc quelques centaines de PNG en 4K, et non la vidéo elle-même.

### Puis-je redimensionner ou recadrer l'image ensuite ?

Pas ici, mais juste à côté. Cet outil enregistre l'image telle quelle ; en changer la taille ou la forme est un travail à part, avec ses propres décisions, et le [Redimensionneur d'images](https://abox.tools/fr/redimensionner-une-image/) fait les deux, sans rien envoyer non plus. Pour alléger le fichier sans changer la photo, c'est le [Compresseur d'images](https://abox.tools/fr/compresser-une-image/).

### Est-ce gratuit, et faut-il un compte ?

C'est gratuit, et il n'y a ni compte, ni identification, ni période d'essai, ni filigrane. Le site affiche de la publicité, et c'est elle qui le finance ; les annonces ne reçoivent rien sur votre vidéo.

## Comment cette promesse se vérifie

- **Vos vidéos n'ont nulle part où aller.** La Content-Security-Policy nomme chaque adresse que cette page a le droit de contacter, et pas une seule ne nous appartient. Il n'existe ici aucun point de collecte où votre fichier pourrait atterrir, ni rien dans le code qui l'y enverrait s'il en existait un.
- **Rien ici ne va chercher quoi que ce soit.** Cet outil n'a aucune fonction réseau : pas d'adresse à coller, rien à télécharger, aucun moteur chargé à la première utilisation. Chaque octet qui touche votre vidéo est venu de cette origine au chargement de la page.
- **Le décodage est local.** Les images passent par WebCodecs dans votre propre navigateur, ou par le moteur de lecture qui vous montrerait le clip de toute façon. La photo est dessinée sur un canevas de cette machine et remise directement à un téléchargement.
- **Le fichier est lu par tranches de quelques mégaoctets.** Une vidéo est le seul type de fichier ici qui ne tient pas de façon fiable en mémoire ; elle n'est donc jamais chargée en entier. Le lecteur prend une fenêtre autour de l'image demandée, ce qui explique aussi qu'un clip de deux gigaoctets s'ouvre aussi vite qu'un petit.
- **Ce que Google charge, et ce qu'on ne lui donne pas.** Les scripts publicitaires et de mesure viennent de Google. Aucun des deux ne reçoit quoi que ce soit sur votre vidéo : ni un fichier, ni une image, ni un nom, une taille, une durée, ou l'instant où vous vous êtes arrêté. Chaque ligne qui lit, décode ou dessine est servie depuis cette origine et figure dans le dépôt.
- **Ce que charge le bouton de don, et ce qu'on ne lui donne pas.** Le bouton « Buy me a coffee » de l'en-tête est dessiné par un script de cdnjs.buymeacoffee.com et prend sa typographie sur Google Fonts. Ce n'est rien de plus qu'un lien : il ne signale aucune visite et ne reçoit rien sur vous ni sur votre vidéo.
- **Tout fonctionne hors ligne.** Coupez le réseau et tout sur cette page continue de marcher. C'est la preuve la plus simple de toutes.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, `src/shared/mp4-reader.js` pour le lecteur qui repère les images dans un MP4, et `src/frames.js` pour la partie qui décode celle que vous avez demandée. Ni l'un ni l'autre n'importe quoi que ce soit capable de faire une requête.
