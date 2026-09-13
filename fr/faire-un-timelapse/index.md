# Faire un timelapse — accélérer une vidéo en ligne

Une heure de rushes en vingt secondes.

> Transformez une longue vidéo en timelapse : 10x, 60x ou la vitesse que vous tapez. Tout se passe dans votre navigateur, sans envoi, sans filigrane, et même hors ligne.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/faire-un-timelapse/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos vidéos. Il n'y a pas de serveur.

Chaque image est choisie, décodée puis réencodée par votre propre navigateur, sur votre propre matériel. Cet outil ne comporte aucune fonction réseau, si bien que rien ici ne sait aller chercher ni envoyer quoi que ce soit. Et quand bien même il en aurait une, il n'y a à l'autre bout de cette page aucun serveur à qui remettre une vidéo.

- ✗ Sans envoi
- ✗ Sans compte
- ✗ Sans filigrane
- ✓ La vitesse que vous tapez
- ✓ Fonctionne hors ligne

## Comment faire un timelapse à partir d'une vidéo

1. **Choisissez une vidéo.** Déposez un MP4, un MOV, un M4V ou un WebM sur la zone prévue, ou sélectionnez-en un à la main. Le navigateur le lit directement sur votre disque, sans que rien parte où que ce soit pendant ce temps.
2. **Dites combien de fois plus vite.** Appuyez sur l'une des vitesses, ou tapez la vôtre. Si vous préférez indiquer la durée du résultat, « que ça tienne en vingt secondes » par exemple, tapez-la et la vitesse en découle.
3. **Vérifiez l'intervalle.** La ligne sous la vitesse dit ce que l'outil s'apprête vraiment à faire : une image toutes les tant de secondes de l'original. C'est le nombre qu'on réglerait sur un appareil photo, et celui qu'il vaut mieux relire avant de lancer.
4. **Lancez, puis téléchargez.** Le travail se fait sur votre propre matériel : le temps que cela prend dépend donc de votre machine et non d'une file d'attente. La vidéo finie part directement dans les téléchargements de votre navigateur.

## La version longue

[Comment transformer une longue vidéo en timelapse](https://abox.tools/fr/guides/transformer-une-longue-video-en-timelapse/): Une heure d'images en une minute regardable : comment choisir la vitesse, pourquoi donner la durée finale vaut mieux que faire l'arithmétique, et quand le résultat doit devenir un GIF.

## Aussi dans la boîte

- [Extracteur d'image](https://abox.tools/fr/extraire-une-image-d-une-video/): Un arrêt sur image en pleine qualité, à n'importe quel instant.
- [Vidéo en GIF](https://abox.tools/fr/video-en-gif/): Choisissez le passage, la taille et la cadence.
- [Créateur de GIF](https://abox.tools/fr/creer-un-gif/): Transformer une série d'images en une seule animation.
- [Découpeur de GIF](https://abox.tools/fr/decouper-un-gif-en-images/): Chaque image du GIF ressort en PNG.

## Questions

### Ma vidéo est-elle envoyée quelque part ?

Non. Votre propre navigateur la lit, la décode, choisit les images et les encode, sur votre propre matériel. Cet outil n'a pas de partie serveur, et la `Content-Security-Policy` de la page énumère toutes les adresses qu'elle peut contacter : aucune n'appartient à ce site. Si vous préférez vérifier plutôt qu'on vous le dise, coupez la connexion et faites un timelapse quand même.

### Que veut dire la vitesse, au juste ?

Le rapport entre ce qui entre et ce qui sort. À 60×, une heure de rushes devient une minute, quelle que soit la cadence de lecture. En dessous, l'outil prend une image toutes les *vitesse ÷ cadence* secondes : 60× à 30 images par seconde, c'est une image toutes les deux secondes. La page vous montre cet intervalle avant de lancer, parce que c'est le nombre qui dit ce qui se passe réellement.

### Quels formats vidéo puis-je accélérer ?

Les MP4, M4V et MOV sont lus directement, quel que soit leur contenu : H.264, HEVC, AV1 ou VP9, du moment que votre navigateur sait décoder ce codec. Tout le reste que votre navigateur sait lire, le WebM en premier lieu, est parcouru en amenant le lecteur sur chaque instant, ce qui marche avec tous les formats qu'il ouvre. Un fichier que le navigateur ne sait ni lire ni jouer, c'est-à-dire en pratique les AVI, WMV, FLV et la plupart des MKV, est refusé avec un message qui le dit, plutôt que d'échouer à mi-parcours. Ce qui sort est toujours un MP4.

### Pourquoi le timelapse n'a-t-il pas de son ?

Parce qu'il n'y a rien à garder. Un son passé trente fois trop vite n'est ni de la parole ni de la musique, c'est un couinement ; et l'inverse, garder l'audio à sa vitesse d'origine sous une image qui a filé devant, donnerait un autre clip que celui que vous avez demandé. La piste est donc abandonnée, ce qui explique aussi pour l'essentiel qu'une heure de vidéo tienne en quelques mégaoctets. Si c'est le son que vous vouliez, l'[Éditeur audio](https://abox.tools/fr/modifier-un-audio/) l'enregistre.

### Est-ce plus rapide que de convertir la vidéo entière ?

Beaucoup plus, et c'est tout l'intérêt de lire le fichier directement. Une image ne se décode qu'en partant de l'image clé qui la précède, mais rien n'oblige à garder celles du milieu : un timelapse à 60× d'une heure décode quelques milliers d'images au lieu de cent mille. Le récapitulatif dit exactement combien il en lira avant que vous n'appuyiez sur le bouton.

### Est-ce que cela coûte de la qualité ?

Les images gardées sont encodées une seconde fois, ce qui coûte un peu. C'est inévitable : le clip fini les montre à des instants pour lesquels rien n'avait été encodé dans le fichier d'origine. Ce que cet outil dépense plus que les autres outils vidéo d'ici, c'est le débit, et c'est voulu : deux images séparées de deux secondes ont bien moins en commun que deux images séparées d'un trentième de seconde, donc le codec a moins à réutiliser, et un chiffre calibré pour des rushes ordinaires sortirait en gros carrés.

### Y a-t-il une limite de taille ou de durée ?

Aucune limite n'est inscrite dans l'outil, et le fichier n'est pas non plus chargé en mémoire d'un bloc : seules de courtes portions autour de chaque instant sont lues. Le plafond réel, c'est le timelapse fini, assemblé en mémoire avant que vous le téléchargiez, et un timelapse est court par définition. Le récapitulatif montre à peu près ce qu'il pèsera avant de lancer.

### Puis-je n'accélérer qu'une partie du clip ?

Pas ici. Cet outil prend tout, de la première image à la dernière. Découpez d'abord le passage voulu avec le [Découpeur de vidéos](https://abox.tools/fr/couper-une-video/), qui le fait sans réencoder une seule image, puis accélérez ce qui en sort.

### Est-ce gratuit, et faut-il un compte ?

C'est gratuit, et il n'y a ni compte, ni inscription, ni période d'essai, ni filigrane. Le site est financé par la publicité, et on ne donne rien aux annonces sur votre vidéo.

## Comment cette promesse se vérifie

- **Vos vidéos n'ont nulle part où aller.** La Content-Security-Policy énumère toutes les adresses que cette page peut contacter, et aucune n'appartient à ce site. Il n'existe ici aucun point de collecte où votre fichier pourrait aboutir, ni rien dans le code qui l'y enverrait s'il en existait un.
- **Rien ici ne va rien chercher.** Cet outil n'a aucune fonction réseau : pas d'adresse à coller, rien à télécharger, aucun moteur récupéré à la première utilisation. Chaque octet qui touche à votre vidéo vient de cette origine, au chargement de la page.
- **Le décodage et l'encodage sont locaux.** Les images passent par WebCodecs dans votre propre navigateur, ou par le moteur de lecture qui vous montrerait le clip de toute façon. Le fichier fini est construit en mémoire sur cette machine, puis remis directement à un téléchargement.
- **L'essentiel du fichier n'est même pas lu.** Un timelapse a besoin d'une image toutes les quelques secondes : l'outil lit donc la courte portion de fichier qui entoure chacune d'elles et saute le reste. C'est un choix de rapidité et non de confidentialité, mais il vaut la peine d'être connu : même ici, sur votre machine, la plus grande partie de votre vidéo n'est jamais ouverte.
- **Ce que Google charge, et ce qu'on ne lui donne pas.** Les scripts publicitaires et de mesure viennent de Google. Ni l'un ni l'autre ne reçoit quoi que ce soit sur votre vidéo : ni un fichier, ni une image, ni un nom, une taille ou une durée. Chaque ligne qui lit, décode, choisit ou encode est servie depuis cette origine et figure dans le dépôt.
- **Ce que le bouton de don charge, et ce qu'on ne lui donne pas.** Le bouton « Buy me a coffee » dans l'en-tête est dessiné par un script de cdnjs.buymeacoffee.com et se compose avec Google Fonts. C'est un lien, rien de plus : il ne signale aucune visite, et on ne lui donne rien sur vous ni sur votre vidéo.
- **Tout fonctionne hors ligne.** Coupez le réseau et tout, sur cette page, continue de fonctionner. C'est la preuve la plus simple de toutes.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, `src/plan.js` pour le calcul qui décide de quel instant vient chaque image, et `src/decode.js` pour la boucle qui ne lit que les portions du fichier dont ces instants ont besoin. Ni l'un ni l'autre n'importe la moindre chose capable d'émettre une requête.
