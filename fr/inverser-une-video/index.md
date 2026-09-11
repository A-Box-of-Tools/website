# Inverser une vidéo — la lire à l'envers

La dernière image en premier, le son avec.

> Lisez un MP4, MOV ou WebM à l'envers, avec le son inversé lui aussi. Tout se passe dans le navigateur : rien n'est envoyé, il n'y a pas de filigrane, et cela marche hors ligne.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/inverser-une-video/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos vidéos. Il n'y a pas de serveur.

Chaque image est décodée, retournée et réencodée par votre propre navigateur, sur votre propre matériel. Rien ici ne peut aller chercher ou envoyer quoi que ce soit : cet outil ne comporte aucune fonction réseau. Et même s'il en avait une, il n'y a, à l'autre bout de cette page, aucun serveur à qui envoyer une vidéo.

- ✗ Sans envoi
- ✗ Sans compte
- ✗ Sans filigrane
- ✓ Inverse le son
- ✓ Fonctionne hors ligne

## Comment inverser une vidéo

1. **Choisissez une vidéo.** Déposez un MP4, MOV, M4V ou WebM sur le sélecteur, ou allez le chercher à la main. Le navigateur le lit directement sur votre disque, et rien ne part nulle part pendant ce temps.
2. **Décidez du sort du son.** « Inverser le son aussi » retourne la piste échantillon par échantillon, et c'est ce qui fait ressortir la parole comme de la parole lue à l'envers plutôt que comme du silence. Désactivez-le pour un clip muet, ce qui est plus rapide.
3. **Décidez de la qualité à dépenser.** L'image doit être réencodée, car les images ressortent dans un ordre pour lequel rien dans le fichier n'avait été codé. « Équilibré » reste proche de ce que l'original dépensait ; « Qualité maximale » dépense davantage.
4. **Inversez et téléchargez.** Le travail se fait sur votre propre matériel : la durée dépend donc de votre machine et non d'une file d'attente. La vidéo finie part directement dans les téléchargements de votre navigateur.

## La version longue

[Comment inverser une vidéo](https://abox.tools/fr/guides/inverser-une-video/): Lire un clip à l'envers : ce que l'inversion fait à l'image et au son, pourquoi elle est impossible sans réencodage, pourquoi elle est plus lente qu'un découpage, et quoi faire avant.

## Aussi dans la boîte

- [Créateur de timelapse](https://abox.tools/fr/faire-un-timelapse/): Une heure de rushes en vingt secondes.
- [Extracteur d'image](https://abox.tools/fr/extraire-une-image-d-une-video/): Un arrêt sur image en pleine qualité, à n'importe quel instant.
- [Vidéo en GIF](https://abox.tools/fr/video-en-gif/): Choisissez le passage, la taille et la cadence.
- [Créateur de GIF](https://abox.tools/fr/creer-un-gif/): Transformer une série d'images en une seule animation.

## Questions

### Ma vidéo est-elle envoyée quelque part ?

Non. Elle est lue, décodée, inversée et encodée par votre propre navigateur sur votre propre matériel. Cet outil n'a aucune partie serveur, et la `Content-Security-Policy` de la page nomme chaque adresse qu'elle a le droit de contacter : aucune ne nous appartient. Si vous préférez vérifier plutôt qu'être cru sur parole, coupez la connexion et inversez un clip quand même.

### Quels formats vidéo puis-je inverser ?

MP4, M4V et MOV sont lus directement, quoi qu'ils contiennent : H.264, HEVC, AV1 ou VP9, tant que votre navigateur sait décoder ce codec. Tout ce que votre navigateur sait lire par ailleurs, WebM en tête, est inversé en faisant reculer pas à pas le lecteur du navigateur : cela marche, mais c'est plus lent. Un fichier que le navigateur ne sait ni lire ni jouer, ce qui en pratique veut dire AVI, WMV, FLV et la plupart des MKV, est refusé avec un message qui le dit plutôt que d'échouer à mi-parcours. Ce qui ressort est toujours un MP4.

### Le son est-il inversé lui aussi ?

Oui, sauf si vous le désactivez. Toute la piste est décodée, les échantillons sont remis dans l'autre sens, et elle est réencodée en AAC. Ce deuxième encodage est inévitable : un paquet audio, ce sont quelques dizaines de millisecondes de son codées par rapport au paquet précédent, si bien qu'écrire les paquets à l'envers ferait entendre de courts morceaux lus à l'endroit dans le mauvais ordre, ce qui sonne comme une panne et non comme une inversion.

### Inverser fait-il perdre de la qualité ?

L'image est encodée une deuxième fois, ce qui coûte un peu. On ne peut pas l'éviter ici comme on l'évite en découpant : un clip inversé montre ses images dans un ordre pour lequel rien dans le fichier d'origine n'avait été codé, donc chaque image doit être réécrite. Ce que l'outil ne fera pas, c'est dépenser *plus* que l'original, puisque encoder au-delà ne fait que grossir le fichier sans améliorer l'image.

### Y a-t-il une limite de taille ou de durée de la vidéo ?

Aucune limite n'est inscrite dans l'outil, et le fichier n'est pas chargé d'un coup en mémoire : il est parcouru groupe d'images par groupe d'images, à rebours. Les plafonds réels sont la vidéo finie, assemblée en mémoire avant le téléchargement, et le son, qui doit être gardé en entier puisqu'une inversion a besoin du dernier échantillon avant de pouvoir écrire le premier.

### Pourquoi est-ce plus lent sur certains fichiers ?

Parce qu'il y a deux voies d'entrée. Un MP4 ou un MOV est lu directement par cet outil et décodé un groupe d'images à la fois, ce qui va aussi vite que votre machine. Le reste est inversé en demandant au lecteur du navigateur un instant du clip après l'autre, et chacun de ces sauts oblige le navigateur à décoder depuis l'image clé précédente. La page indique laquelle des deux voies elle emprunte, et pourquoi, avant que vous ne commenciez.

### Puis-je n'inverser qu'une partie du clip ?

Pas ici. Cet outil inverse la totalité : le clip qui sort dure exactement autant que celui qui est entré, avec la dernière image en premier. Découpez d'abord la partie voulue avec le [Découpeur de vidéo](https://abox.tools/fr/couper-une-video/), qui le fait sans réencoder une seule image, puis inversez ce qui en sort.

### Est-ce gratuit, et faut-il un compte ?

C'est gratuit, et il n'y a ni compte, ni identification, ni période d'essai, ni filigrane. Le site affiche de la publicité, et c'est elle qui le finance ; les annonces ne reçoivent rien sur votre vidéo.

## Comment cette promesse se vérifie

- **Vos vidéos n'ont nulle part où aller.** La Content-Security-Policy nomme chaque adresse que cette page a le droit de contacter, et pas une seule ne nous appartient. Il n'existe ici aucun point de collecte où votre fichier pourrait atterrir, ni rien dans le code qui l'y enverrait s'il en existait un.
- **Rien ici ne va chercher quoi que ce soit.** Cet outil n'a aucune fonction réseau : pas d'adresse à coller, rien à télécharger, aucun moteur chargé à la première utilisation. Chaque octet qui touche votre vidéo est venu de cette origine au chargement de la page.
- **Le décodage et l'encodage sont locaux.** Les images passent par WebCodecs dans votre propre navigateur, ou par le moteur de lecture qui vous montrerait le clip de toute façon. Le fichier fini est assemblé en mémoire sur cette machine et remis directement à un téléchargement.
- **Le son est retourné ici aussi.** Inverser une piste suppose de la décoder, et ce décodage est celui du navigateur, sur cette machine. Rien ne l'écoute, rien ne le garde et rien ne pourrait le transmettre : il n'existe ici aucun chemin de code qui envoie un octet.
- **Ce que Google charge, et ce qu'on ne lui donne pas.** Les scripts publicitaires et de mesure viennent de Google. Aucun des deux ne reçoit quoi que ce soit sur votre vidéo : ni un fichier, ni une image, ni un nom, une taille ou une durée. Chaque ligne qui lit, décode, inverse ou encode est servie depuis cette origine et figure dans le dépôt.
- **Ce que charge le bouton de don, et ce qu'on ne lui donne pas.** Le bouton « Buy me a coffee » de l'en-tête est dessiné par un script de cdnjs.buymeacoffee.com et prend sa typographie sur Google Fonts. Ce n'est rien de plus qu'un lien : il ne signale aucune visite et ne reçoit rien sur vous ni sur votre vidéo.
- **Tout fonctionne hors ligne.** Coupez le réseau et tout sur cette page continue de marcher. C'est la preuve la plus simple de toutes.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, `src/timeline.js` pour le calcul qui décide quelle image sort à quel instant, et `src/reverse.js` pour la boucle qui remonte le fichier groupe d'images par groupe d'images. Aucun d'eux n'importe quoi que ce soit capable de faire une requête.
