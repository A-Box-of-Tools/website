# Rotation vidéo — faire pivoter sans envoi

Un quart de tour, un demi-tour, dans l’autre sens. Inscrit dans l’en-tête sans décoder une image ni perdre de qualité.

> Faites pivoter une vidéo de côté ou à l’envers dans votre navigateur. La rotation est inscrite dans l’en-tête, sans réencodage ni perte, ou dans les pixels pour les anciens lecteurs. MP4, MOV, WebM et MKV en entrée, MP4 en sortie. Aucun envoi.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/faire-pivoter-une-video/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos vidéos. Il n'y a pas de serveur.

Votre vidéo est lue, dotée d’un nouvel en-tête puis écrite en mémoire sur votre appareil, par le code de ce site. Si vous inscrivez la rotation dans les pixels, les codecs du navigateur dessinent les images. Aucun envoi possible, aucun serveur pour recevoir votre vidéo : un gigaoctet n’a pas à partir puis revenir tourné.

- ✗ Aucun envoi
- ✗ Aucun compte
- ✓ Aucune perte de qualité
- ✓ Fonctionne hors ligne
- ✓ Code ouvert

## Comment faire pivoter une vidéo

1. **Choisissez la vidéo.** Un fichier à la fois : MP4, MOV, M4V, WebM ou MKV. Le navigateur le lit sur votre disque et indique son format et son orientation actuelle.
2. **Choisissez la rotation et regardez l’aperçu.** Un quart de tour à droite, à gauche, ou un demi-tour. La première image utilise le même calcul que l’en-tête final. Inscrivez la rotation dans les pixels uniquement si un lecteur affiche le clip de côté. Retirez le son si vous le souhaitez.
3. **Faites pivoter et lisez la vérification.** Le nouvel en-tête et la copie prennent quelques secondes. La rotation dans les pixels prend le temps d’un encodage, avec une barre de progression. Le résultat est rouvert pour vérifier durée, orientation et son, puis se lit depuis la mémoire.

## La version longue

[Comment faire pivoter une vidéo sans perdre de qualité](https://abox.tools/fr/guides/faire-pivoter-une-video/): Pourquoi une vidéo de téléphone apparaît de côté, à quoi servent les neuf nombres de son en-tête, quand réencoder est inutile, quand inscrire la rotation dans les pixels et comment procéder dans votre navigateur sans envoyer le fichier.

## Aussi dans la boîte

- [Images en vidéo](https://abox.tools/fr/images-en-video/): Transformer un dossier d'images en vidéo.
- [Coupeur de vidéos](https://abox.tools/fr/couper-une-video/): Marquez les passages à garder pendant la lecture. Récupérez-les en une seule vidéo.
- [Recadreur de vidéos](https://abox.tools/fr/recadrer-une-video/): Ramener un clip à ce qui compte dedans.
- [Inverseur de vidéo](https://abox.tools/fr/inverser-une-video/): La dernière image en premier, le son avec.

## Questions

### La rotation réduit-elle la qualité ?

Non pour la méthode ordinaire : chaque image est copiée octet par octet et seule la matrice de l’en-tête change. Le poids reste presque identique. Seule la rotation inscrite dans les pixels réencode, avec un avertissement avant de l’activer.

### Pourquoi un lecteur affiche-t-il encore le clip de côté ?

Il ignore la matrice d’affichage, contrairement aux téléphones, navigateurs et lecteurs modernes. Inscrivez la rotation dans l’image pour réencoder les pixels en H.264 : tous les lecteurs verront la même orientation, au prix d’une génération de qualité.

### Dans quel sens est un quart de tour à droite ?

Dans le sens des aiguilles d’une montre, comme si vous tourniez votre téléphone à droite. Choisissez le bouton dont l’aperçu remet la première image à l’endroit, puis lancez.

### Quels fichiers lit-il ?

MP4, MOV et M4V avec tout codec vidéo pour une rotation d’en-tête. WebM et MKV avec H.264 copié et les autres images réencodées. AAC est copié ; Opus, Vorbis, MP3 et FLAC deviennent AAC. Un son indécodable est annoncé et retiré. Le résultat est toujours MP4.

### Combien de temps cela prend-il ?

Quelques secondes pour l’en-tête : une lecture de la structure puis une autre pour la copie, à la vitesse du disque. La rotation dans les pixels prend le temps d’un encodage, souvent plus court que le clip avec un encodeur matériel, plus long sans lui.

### Mes vidéos sont-elles envoyées ?

Non. Votre navigateur lit et écrit sur votre appareil. La `Content-Security-Policy` énumère les adresses autorisées et aucune n’appartient au site. Déconnecter le réseau le prouve. L’envoi d’un gros fichier prendrait plus de temps que toute la rotation.

### Fonctionne-t-il sur téléphone ?

Oui. La rotation d’en-tête ne décode rien et reste rapide. Le résultat attend en mémoire le téléchargement : quelques centaines de mégaoctets passent généralement sur téléphone. Pour réencoder les pixels, l’encodeur matériel du téléphone est rapide.

### Quelle limite de taille et quel prix ?

Le fichier d’entrée est lu par morceaux, même s’il dépasse la mémoire. Le résultat est conservé en mémoire et le MP4 écrit ici ne peut dépasser 4 Go. L’outil est gratuit, sans compte, connexion ni essai limité. Les publicités ne reçoivent aucune vidéo.

### Fonctionne-t-il hors ligne ?

Oui. Chargez la page une fois, puis déconnectez Internet : elle continue. Un outil qui envoyait votre vidéo à un serveur s’arrêterait.

## Comment cette promesse se vérifie

- **La rotation est neuf nombres dans l’en-tête.** Un téléphone conserve les images telles que son capteur les voit et inscrit un quart de tour dans une matrice de neuf nombres. Le lecteur l’applique à l’affichage. Cette page modifie cette matrice puis copie chaque image et paquet sans décodage. Un gigaoctet prend donc quelques secondes : la qualité et le poids restent presque identiques.
- **L’envoi est la partie lente, qui n’a pas lieu ici.** Les outils en ligne demandent souvent le fichier entier avant de le renvoyer tourné, puis réencodent un travail qui ne nécessitait que neuf nombres. Ici, les octets passent du disque à la mémoire puis reviennent. La `Content-Security-Policy` énumère les adresses autorisées, aucune n’appartenant au site. L’outil fonctionne réseau déconnecté.
- **Pour les lecteurs qui ignorent l’en-tête.** Téléphones, navigateurs, lecteurs modernes et éditeurs appliquent la matrice, utilisée pour les vidéos de téléphone depuis 2010. Certains vieux lecteurs l’ignorent. Pour eux, ou une destination impossible à vérifier, inscrivez la rotation dans les pixels : chaque image est dessinée tournée et réencodée en H.264. Cela ajoute une génération de perte et prend le temps d’un encodage.
- **Le résultat est rouvert et vérifié.** Une matrice incorrecte peut produire un fichier lisible mais mal orienté. Le fichier terminé est relu et doit garder sa durée, afficher l’orientation et les dimensions demandées et porter le son prévu. Il se lit depuis la mémoire sous le téléchargement, avant l’enregistrement.
- **Formats lus et format écrit.** MP4, MOV et M4V acceptent toute image, H.264, HEVC, VP9 ou AV1, car une rotation d’en-tête ne dépend pas du codec. Pour WebM et MKV, H.264 est copié et les autres codecs réencodés. AAC est copié ; Opus, Vorbis, MP3 et FLAC deviennent AAC. Le son que le navigateur ne peut décoder est nommé puis retiré. Le résultat est un MP4.
- **Ce que Google charge, et ce qu’il ne reçoit pas.** Les scripts publicitaires et de mesure de Google ne reçoivent ni fichier vidéo, image, nom, taille, durée ni rotation choisie. Tout le code qui lit, tourne et écrit vient du site et figure dans son dépôt.
- **Ce que le bouton de don charge.** Le bouton de don est dessiné par cdnjs.buymeacoffee.com avec Google Fonts. C’est un lien : il ne signale aucune visite et ne reçoit rien sur vous ou vos vidéos. Il mène à un autre site uniquement si vous cliquez.
- **Fonctionne hors ligne.** Déconnectez le réseau : toutes les fonctions restent disponibles. Un outil envoyant votre vidéo ailleurs s’arrêterait.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, `src/plan.js` pour les neuf nombres de la rotation, `src/rotate.js` pour la copie et l’écriture, et `src/shared/copy-tracks.js` pour déplacer une image sans la décoder. Aucun de ces fichiers, ni les lecteurs et le rédacteur voisins, ne contacte le réseau.
