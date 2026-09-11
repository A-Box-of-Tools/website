# Recadrer une vidéo — recadrer une vidéo en ligne

Ramener un clip à ce qui compte dedans.

> Recadrez un MP4, un MOV ou un WebM dans la forme que vous voulez : carré, 9:16, ou un cadre en pixels exact. Tout se passe dans votre navigateur, le son est gardé et rien n'est envoyé.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/recadrer-une-video/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos vidéos. Il n'y a pas de serveur.

Chaque image est décodée, recadrée et encodée par votre propre navigateur, sur votre propre matériel. Cet outil ne comporte aucune fonction réseau, si bien que rien ici ne sait aller chercher ni envoyer quoi que ce soit. Et quand bien même il en aurait une, il n'y a à l'autre bout de cette page aucun serveur à qui remettre une vidéo.

- ✗ Sans envoi
- ✗ Sans compte
- ✗ Sans filigrane
- ✓ Garde le son
- ✓ Fonctionne hors ligne

## Comment recadrer une vidéo

1. **Choisissez une vidéo.** Déposez un MP4, un MOV, un M4V ou un WebM sur la zone prévue, ou sélectionnez-en un à la main. Le navigateur le lit directement sur votre disque, sans que rien parte où que ce soit pendant ce temps.
2. **Tracez le cadre sur la partie à garder.** Faites-le glisser depuis l'intérieur pour le déplacer, et par un coin pour le redimensionner. Verrouillez-le d'abord sur une forme, 1:1 pour une publication carrée, 9:16 pour un téléphone ou 16:9 pour un cadre large, ou tapez un cadre en pixels exact dans les quatre champs en dessous. Lisez le clip, ou faites glisser le curseur en dessous, pour choisir l’image sur laquelle vous alignez le cadre.
3. **Choisissez combien de qualité dépenser.** L'image doit être réencodée, parce qu'une image recadrée est une autre image. « Équilibré » reste proche de ce que le fichier dépensait déjà sur cette zone ; « Meilleure qualité » dépense davantage. Le son est gardé, sauf si vous le coupez.
4. **Recadrez et téléchargez.** Le travail se fait sur votre propre matériel : la durée dépend donc de votre machine et non d'une file d'attente. La vidéo finie est remise directement aux téléchargements de votre navigateur.

## La version longue

[Comment recadrer une vidéo dans une autre forme](https://abox.tools/fr/guides/recadrer-une-video/): Ramener un clip à un carré, à un format 9:16 vertical, ou à un cadre en pixels exact. Quelle proportion réclame chaque plateforme, pourquoi recadrer doit réencoder quand couper ne le fait pas, et ce que cela coûte.

## Aussi dans la boîte

- [Inverseur de vidéo](https://abox.tools/fr/inverser-une-video/): La dernière image en premier, le son avec.
- [Créateur de timelapse](https://abox.tools/fr/faire-un-timelapse/): Une heure de rushes en vingt secondes.
- [Extracteur d'image](https://abox.tools/fr/extraire-une-image-d-une-video/): Un arrêt sur image en pleine qualité, à n'importe quel instant.
- [Vidéo en GIF](https://abox.tools/fr/video-en-gif/): Choisissez le passage, la taille et la cadence.

## Questions

### Ma vidéo est-elle envoyée quelque part ?

Non. Elle est lue, décodée, recadrée et encodée par votre propre navigateur sur votre propre matériel. Cet outil n'a pas de côté serveur, et sa `Content-Security-Policy` énumère toutes les adresses que la page peut contacter, dont aucune n'appartient à ce site. Coupez votre connexion et recadrez un clip quand même, si vous préférez vérifier plutôt qu'on vous le dise.

### Quels formats vidéo puis-je recadrer ?

Le MP4, le M4V et le MOV sont lus directement, quel que soit leur contenu : H.264, HEVC, AV1 ou VP9, du moment que votre navigateur sait décoder ce codec. Tout le reste que votre navigateur sait lire, à commencer par le WebM, est recadré en le jouant et en enregistrant le résultat, ce qui marche mais prend le temps que dure le clip. Un fichier que le navigateur ne sait ni lire ni jouer, ce qui en pratique veut dire l'AVI, le WMV, le FLV et la plupart des MKV, est refusé avec un message qui le dit, plutôt que d'échouer à mi-course.

### Y a-t-il une limite de taille ou de durée ?

Aucune limite n'est intégrée à l'outil, et le fichier n'est pas chargé en mémoire d'un seul coup : il est parcouru quelques mégaoctets à la fois. Le plafond pratique, c'est la vidéo finie, assemblée en mémoire avant que vous la téléchargiez, et le temps que votre machine met à l'encoder.

### Le son survit-il ?

Sur le chemin MP4, exactement : l'audio est recopié échantillon par échantillon sans jamais être décodé, il est donc octet pour octet ce qu'il y avait dans le fichier. Sur le chemin par enregistrement, il est capté à la lecture et réencodé, ce qui coûte un peu de qualité. Dans les deux cas, une case permet de le laisser entièrement de côté.

### Recadrer fait-il perdre de la qualité ?

L'image est réencodée, parce qu'une image recadrée est une autre image et qu'il n'y a aucun moyen de la stocker sans réécrire les pixels. Ce que l'outil ne fera pas, c'est dépenser plus que l'original ne dépensait sur la même zone, puisque réencoder au-dessus ne fait que grossir le fichier sans l'améliorer.

### Puis-je aussi raccourcir la durée ?

Pas ici, mais juste à côté. Cet outil change la forme de l'image et rien d'autre : le clip qui sort dure exactement aussi longtemps que celui qui est entré, avec son rythme et son son intacts. Couper relève d'un autre métier et donc d'un autre outil : le [coupeur de vidéos](https://abox.tools/fr/couper-une-video/) marque les passages d'un clip qui valent d'être gardés et les enregistre en un seul fichier, sans réencoder une image.

### Pourquoi la largeur et la hauteur avancent-elles par deux ?

Le H.264, le codec d'un MP4, stocke l'image par blocs et n'a aucun moyen de décrire une image dont un côté ferait un nombre impair de pixels. Plutôt que d'arrondir votre recadrage en silence une fois posé, le cadre ne propose que des nombres pairs dès le départ.

### Est-ce gratuit, et faut-il un compte ?

C'est gratuit, et il n'y a ni compte, ni identification, ni période d'essai, ni filigrane. Le site affiche de la publicité, et c'est elle qui le finance ; les annonces ne reçoivent rien sur votre vidéo.

## Comment cette promesse se vérifie

- **Vos vidéos n'ont nulle part où aller.** La Content-Security-Policy énumère toutes les adresses que cette page peut contacter, et aucune n'appartient à ce site. Il n'existe ici aucun point de collecte où votre fichier pourrait aboutir, ni rien dans le code qui l'y enverrait s'il en existait un.
- **Rien ici ne va rien chercher.** Cet outil n'a aucune fonction réseau : pas d'adresse à coller, rien à télécharger, aucun moteur récupéré à la première utilisation. Chaque octet qui touche à votre vidéo vient de cette origine, au chargement de la page.
- **Le décodage et l'encodage sont locaux.** Les images passent par WebCodecs dans votre propre navigateur, ou par le moteur de lecture qui vous montrerait le clip de toute façon. Le fichier fini est construit en mémoire sur cette machine, puis remis directement à un téléchargement.
- **Le son est copié, pas écouté.** Sur le chemin MP4, les échantillons audio sont déplacés sans être décodés le moins du monde. Rien ici ne les retransforme jamais en son, et rien ne saurait les faire passer où que ce soit si c'était le cas.
- **Ce que Google charge, et ce qu'on ne lui donne pas.** Les scripts publicitaires et de mesure viennent de Google. Ni l'un ni l'autre ne reçoit quoi que ce soit sur votre vidéo : ni un fichier, ni une image, ni un nom, une taille, une durée ou la forme à laquelle vous l'avez recadrée. Chaque ligne qui lit, décode, recadre ou encode est servie depuis cette origine et figure dans le dépôt.
- **Ce que le bouton de don charge, et ce qu'on ne lui donne pas.** Le bouton « Buy me a coffee » dans l'en-tête est dessiné par un script de cdnjs.buymeacoffee.com et se compose avec Google Fonts. C'est un lien, rien de plus : il ne signale aucune visite, et on ne lui donne rien sur vous ni sur votre vidéo.
- **Tout fonctionne hors ligne.** Coupez le réseau et tout, sur cette page, continue de fonctionner. C'est la preuve la plus simple de toutes.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, `src/shared/mp4-reader.js` pour le lecteur qui trouve les images dans un MP4, et `src/transcode.js` pour la boucle qui les décode, les recadre et les encode. Ni l'un ni l'autre n'importe la moindre chose capable d'émettre une requête.
