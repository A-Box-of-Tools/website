# Compresser une vidéo — atteindre un poids réellement envoyable

Donnez le poids maximal. L’outil calcule le reste et mesure le résultat avant téléchargement.

> Réduisez une vidéo sous 8, 16, 25 Mo ou le poids choisi dans votre navigateur. L’outil calcule dimensions et débit, encode puis mesure. Aucun envoi, son copié intact.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/compresser-une-video/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos vidéos. Il n'y a pas de serveur.

La vidéo est décodée, dessinée plus petite, réencodée puis écrite en mémoire sur votre appareil avec les codecs du navigateur et le code du site. Aucun envoi possible ni serveur pour la recevoir. Un gigaoctet n’a pas à partir pour revenir réduit.

- ✗ Sans envoi
- ✗ Sans compte
- ✓ Fonctionne hors ligne
- ✓ Open source
- ✓ Vos fichiers restent chez vous

## Comment compresser une vidéo à un poids envoyable

1. **Choisissez la vidéo.** Un clip MP4 ou MOV à la fois, lu directement sur votre disque. La page indique durée, poids, dimensions et débit.
2. **Donnez le poids maximal.** Saisissez des mégaoctets ou choisissez 8, 16, 25, 50, 100, la moitié ou le quart du poids actuel. La page affiche dimensions, débit et estimation selon durée et son. Retirez le son pour donner tout le budget à l’image.
3. **Changez les dimensions si nécessaire.** L’outil choisit un palier. Vous pouvez imposer un cadre pour garder une capture lisible à 1080p ou viser un téléphone. Le débit est réparti sur ce cadre. C’est un plafond : aucune image n’est agrandie.
4. **Compressez et lisez la mesure.** L’image est décodée, réduite et réencodée avec progression. Le poids final est mesuré et le fichier rouvert pour vérifier sa durée. S’il dépasse, un second encodage est annoncé. Le résultat se lit en mémoire sous le téléchargement.

## La version longue

[Comment compresser une vidéo à une taille qui passe](https://abox.tools/fr/guides/compresser-une-video/): Ce qu’une limite de taille coûte à une vidéo, où passent les mégaoctets, pourquoi les dimensions baissent avant que l’image ne se dégrade et comment limiter les pertes dans votre navigateur sans envoyer le fichier.

## Aussi dans la boîte

- [Conversion MP4](https://abox.tools/fr/convertir-en-mp4/): Enregistrement d’écran, extraction ou caméra : H.264 et AAC dans MP4. Copie intacte quand possible, réencodage seulement si nécessaire.
- [Rotation vidéo](https://abox.tools/fr/faire-pivoter-une-video/): Un quart de tour, un demi-tour, dans l’autre sens. Inscrit dans l’en-tête sans décoder une image ni perdre de qualité.
- [Images en vidéo](https://abox.tools/fr/images-en-video/): Transformer un dossier d'images en vidéo.
- [Coupeur de vidéos](https://abox.tools/fr/couper-une-video/): Marquez les passages à garder pendant la lecture. Récupérez-les en une seule vidéo.

## Questions

### Jusqu’où peut-on réduire une vidéo ?

Jusqu’à la limite où aucune image regardable ne tient, annoncée par la page. Le son garde son poids, environ un mégaoctet par minute en stéréo courante. La petite image nécessite quelques centaines de kilobits par seconde. Retirer le son peut suffire pour un clip court à limite serrée.

### Pourquoi les dimensions ont-elles changé ?

Le débit dépend du nombre de pixels. Deux mégabits par seconde conviennent à 720p mais brouillent la 4K. Le cadre descend donc pour garder une image nette plutôt qu’une grande image floue. Le choix est annoncé et modifiable.

### La qualité diminue-t-elle ?

Oui, selon la réduction demandée. L’image est réencodée à débit inférieur, une génération de plus ; le son reste intact. Passer de 900 à 25 Mo coûte davantage que réduire de moitié. Dimensions et débit rendent ce compromis visible.

### Quel format est écrit ?

MP4 avec H.264 et piste audio copiée intacte, pour la compatibilité avec téléphones, navigateurs, messageries et courriels. Pas de WebM, HEVC ni AV1, plus efficaces mais moins largement acceptés.

### Quels fichiers sont lus ?

MP4 et MOV avec H.264, HEVC, VP9 ou AV1 si le navigateur les décode. HEVC exige une licence sur l’appareil. WebM, MKV et AVI sont clairement refusés car non pris en charge ici.

### Combien de temps cela prend-il ?

Le temps d’encodage de votre appareil. Avec le matériel dédié, une minute de 1080p prend généralement moins d’une minute ; sans lui, plus longtemps. La 4K reste coûteuse. La barre indique l’image traitée et l’annulation arrête sans écrire de résultat.

### Pourquoi deux passages ?

L’encodeur approche le débit demandé et peut dépasser sur un clip animé. Le résultat est mesuré ; s’il est trop gros, le débit est recalculé depuis l’écart et un second passage est lancé. La page indique quand il a été nécessaire.

### Mes vidéos sont-elles envoyées ?

Non. Votre navigateur lit, décode, encode et écrit sur votre appareil. La `Content-Security-Policy` énumère les adresses autorisées, aucune n’appartenant au site. Déconnectez Internet pour vérifier. Pour ces gros fichiers, l’envoi serait souvent plus long que l’encodage.

### Est-ce que cela marche sur téléphone ?

Oui si le navigateur du téléphone sait encoder. Son encodeur matériel est rapide, mais la mémoire peut manquer pour un long résultat. Coupez d’abord avec le [coupeur vidéo](https://abox.tools/fr/couper-une-video/) ou utilisez un ordinateur.

### Y a-t-il une limite de taille, et cela coûte-t-il quelque chose ?

Aucune limite imposée par l’outil. L’entrée est lue par morceaux ; le résultat doit tenir en mémoire jusqu’au téléchargement, généralement quelques centaines de mégaoctets sur ordinateur. Gratuit, sans compte, connexion ni essai limité. Les publicités ne reçoivent aucune vidéo.

### Est-ce que cela fonctionne hors ligne ?

Oui. Chargez la page puis déconnectez Internet : elle continue. Un outil envoyant votre vidéo ailleurs pour la compresser s’arrêterait.

## Comment cette promesse se vérifie

- **L’envoi est la partie lente, absente ici.** Une vidéo de 900 Mo destinée à devenir 25 Mo devrait d’abord partir entière vers un compresseur en ligne. Cet envoi prend souvent plus longtemps que l’encodage, avant même la question de conservation. Ici, les codecs du navigateur travaillent sur votre appareil. La `Content-Security-Policy` énumère les adresses autorisées, aucune n’appartenant au site. L’outil fonctionne déconnecté.
- **Le poids demandé est le point de départ.** Messagerie, courriel ou formulaire imposent un poids. Le son copié et le conteneur prennent leur part ; le reste, divisé par la durée, donne le débit vidéo. L’outil descend les dimensions usuelles jusqu’à donner assez de bits à chaque pixel, sans agrandissement. Il annonce le choix avant lancement et vous laisse changer le cadre.
- **Compresser une vidéo signifie la réencoder.** Contrairement au ZIP, ce n’est pas sans perte. L’image est décodée, réduite puis réencodée en H.264 au débit permis, une génération de plus depuis la caméra. Le son reste intact. Le résultat est MP4, lisible par téléphones, navigateurs et messageries.
- **Le résultat est mesuré, puis resserré une fois si nécessaire.** Un encodeur approche le débit sans l’atteindre exactement. L’outil vise un peu sous la cible puis mesure. En cas de dépassement, il recalcule le débit depuis l’écart et encode une seconde fois, en le signalant. Le résultat est rouvert pour vérifier durée et son : un fichier tronqué serait aussi plus petit.
- **Le coût sur votre appareil est annoncé.** L’encodage dépend du matériel : souvent plus rapide que la durée avec un encodeur matériel, plus lent sans lui, et long en 4K. L’entrée est lue par morceaux, même au-delà de la mémoire. Le résultat reste en mémoire jusqu’au téléchargement, ce qui fixe la limite pratique. L’annulation reste disponible.
- **Formats lus et non lus.** MP4 et MOV avec H.264, HEVC, VP9 ou AV1, selon les codecs du navigateur. HEVC d’iPhone nécessite une licence sur l’appareil. WebM, MKV et AVI ne sont pas encore lus ici et sont refusés clairement.
- **Ce que Google charge, et ce qu'on ne lui donne pas.** Les scripts publicitaires et de mesure de Google ne reçoivent ni vidéo, image, nom, taille, durée ni poids demandé. Tout le code de lecture, encodage et écriture vient du site et figure dans le dépôt.
- **Ce que le bouton de don charge, et ce qu'on ne lui donne pas.** Le bouton de don est dessiné par cdnjs.buymeacoffee.com avec Google Fonts. C’est un lien qui ne signale aucune visite et ne reçoit rien sur vous ou vos vidéos. Il mène à un autre site uniquement si vous cliquez.
- **Cela fonctionne hors ligne.** Déconnectez le réseau : toutes les fonctions restent disponibles. Un outil envoyant votre vidéo ailleurs pour la compresser s’arrêterait.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, `src/plan.js` pour calculer dimensions et débit depuis le poids, et `src/encode.js` pour décoder, dessiner, encoder et copier le son. Aucun de ces fichiers ni lecteurs et rédacteurs ne contacte le réseau.
