# Convertir en MP4 — WebM, MKV et MOV dans un format accepté

Enregistrement d’écran, extraction ou caméra : H.264 et AAC dans MP4. Copie intacte quand possible, réencodage seulement si nécessaire.

> Transformez WebM, MKV, MOV ou MP4 en MP4 avec H.264 et AAC, accepté par téléphones, navigateurs et formulaires. H.264 et AAC restent intacts ; les autres pistes sont réencodées sur votre appareil. Aucun envoi.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/convertir-en-mp4/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos vidéos. Il n'y a pas de serveur.

Votre vidéo est lue, décomposée puis écrite en MP4 en mémoire sur votre appareil avec les codecs du navigateur et le code du site. Aucun envoi possible ni serveur pour la recevoir. Un gigaoctet ne part pas pour revenir dans un autre format.

- ✗ Sans envoi
- ✗ Sans compte
- ✓ Fonctionne hors ligne
- ✓ Open source
- ✓ Vos fichiers restent chez vous

## Comment convertir une vidéo en MP4

1. **Choisissez la vidéo.** Un fichier WebM, MKV, MOV, M4V ou MP4 à la fois, lu sur votre disque. La page indique durée, poids, dimensions et conteneur.
2. **Lisez les deux phrases.** Une pour l’image, une pour le son. Chaque piste est soit déjà conforme et copiée intacte, soit nommée avec son futur codec. Rien à régler : le fichier décide. Retirez le son s’il n’est pas lisible ou si vous souhaitez un clip muet.
3. **Convertissez et lisez la vérification.** Les pistes à copier restent intactes, les autres sont réencodées avec progression. Le résultat est rouvert pour vérifier durée, H.264 et son, puis se lit en mémoire sous le téléchargement.

## La version longue

[Comment convertir une vidéo en MP4 accepté partout](https://abox.tools/fr/guides/convertir-une-video-en-mp4/): Ce qu’est un MP4 accepté partout, pourquoi WebM, MKV ou MOV d’iPhone sont refusés, quelles conversions ne perdent rien et lesquelles réencodent, et comment procéder dans votre navigateur sans envoyer le fichier.

## Aussi dans la boîte

- [Rotation vidéo](https://abox.tools/fr/faire-pivoter-une-video/): Un quart de tour, un demi-tour, dans l’autre sens. Avec la rotation d’en-tête, les images restent intactes.
- [Images en vidéo](https://abox.tools/fr/images-en-video/): Transformer un dossier d'images en vidéo.
- [Coupeur de vidéos](https://abox.tools/fr/couper-une-video/): Marquez les passages à garder pendant la lecture. Récupérez-les en une seule vidéo.
- [Recadreur de vidéos](https://abox.tools/fr/recadrer-une-video/): Ramener un clip à ce qui compte dedans.

## Questions

### La qualité diminue-t-elle ?

Pas pour les pistes copiées : H.264 et AAC passent octet par octet. VP9, VP8, AV1, HEVC, Opus, Vorbis, MP3 ou FLAC réencodés ajoutent une génération, avec un débit adapté à la source pour limiter la perte. Gardez l’original.

### Pourquoi ne pas conserver HEVC ou VP9, plus petits ?

Le but est la compatibilité. HEVC exige parfois une licence ; VP9 et AV1 en MP4 sont encore refusés par des formulaires et courriels. H.264 et AAC sont la combinaison largement acceptée. La page annonce le coût plutôt que le masquer.

### Le son de mon enregistrement WebM sera-t-il conservé ?

Oui. Opus est décodé puis réencodé en AAC à 160 kbit/s, suffisant pour un microphone. VP8 ou VP9 devient H.264. Tout se fait sur votre appareil et le résultat est rouvert pour vérifier durée et son.

### Pourquoi convertir mon MOV, si proche de MP4 ?

MOV et MP4 ont la même conception. Avec H.264 et AAC, les pistes sont copiées en quelques secondes : le conteneur change pour satisfaire un formulaire qui vérifie l’extension. Un MOV HEVC d’iPhone doit réencoder l’image en H.264 si le navigateur sait décoder HEVC.

### Quels fichiers sont lus ?

WebM et MKV avec VP8, VP9, AV1, H.264 ou HEVC et son Opus, Vorbis, AAC, MP3 ou FLAC ; MP4, MOV et M4V avec H.264, HEVC, VP9 ou AV1 et AAC. Une image indécodable bloque, un son indécodable est retiré et annoncé. Pas d’AVI, WMV, FLV ni MPEG-2.

### Combien de temps cela prend-il ?

La copie coûte environ deux lectures du fichier, souvent quelques secondes. Le réencodage dépend du matériel : plus rapide que le clip avec encodeur dédié, plus lent sans lui, coûteux en 4K. La barre indique l’image traitée. Annuler arrête et n’écrit rien.

### Mes vidéos sont-elles envoyées ?

Non. Votre navigateur lit, décode si nécessaire, encode et écrit sur votre appareil. La `Content-Security-Policy` énumère les adresses autorisées, aucune n’appartenant au site. Déconnectez Internet pour vérifier. L’envoi serait souvent plus long que la conversion.

### Est-ce que cela marche sur téléphone ?

Oui si le navigateur du téléphone sait décoder et encoder. Le matériel est rapide mais la mémoire peut manquer pour un long résultat. Coupez d’abord avec le [coupeur vidéo](https://abox.tools/fr/couper-une-video/) ou convertissez sur ordinateur.

### Y a-t-il une limite de taille, et cela coûte-t-il quelque chose ?

L’entrée est lue par morceaux, même au-delà de la mémoire. Le résultat reste en mémoire et le MP4 ne peut dépasser 4 Go. Gratuit, sans compte, connexion ni essai limité. Les publicités ne reçoivent aucune vidéo.

### Est-ce que cela fonctionne hors ligne ?

Oui. Chargez la page puis déconnectez Internet : elle continue. Un outil envoyant votre vidéo ailleurs pour la convertir s’arrêterait.

## Comment cette promesse se vérifie

- **L’envoi est la partie lente, absente ici.** Les convertisseurs en ligne demandent souvent le gigaoctet entier pour en renvoyer un autre. L’envoi est souvent plus long que la conversion, avant la question de conservation. Ici, le navigateur lit puis écrit avec ses codecs. La `Content-Security-Policy` énumère les adresses autorisées, aucune n’appartenant au site. L’outil fonctionne déconnecté.
- **Ce que MP4 signifie ici.** Le fichier largement accepté est une image H.264 et un son AAC dans un MP4 ordinaire. WebM, MKV ou MP4 contenant HEVC, VP9 ou AV1 sont encore refusés par des destinations. La page écrit donc cette combinaison seule, sans copier un autre codec vidéo qui réduirait la compatibilité.
- **Copie quand possible, réencodage seulement si nécessaire.** H.264 dans MKV contient les mêmes octets que MP4 accepte : la copie ne perd rien, comme pour AAC. VP8, VP9, HEVC, Opus ou Vorbis doivent être décodés puis réencodés, une génération de plus. La page annonce le traitement de chaque piste avant lancement.
- **Le résultat est rouvert et vérifié.** Un MP4 ayant perdu la dernière seconde ou son audio resterait un MP4. Le lecteur rouvre le résultat et vérifie durée, H.264 et piste audio promise. Il se lit en mémoire avant enregistrement.
- **Le coût sur votre appareil est annoncé.** La copie lit la structure puis le contenu à écrire, rapidement. Le réencodage dépend du matériel : souvent plus rapide que le clip avec un encodeur dédié, plus lent sans lui, long en 4K. L’entrée est lue par morceaux ; le résultat doit tenir en mémoire. L’annulation reste disponible.
- **Formats lus et non lus.** WebM et MKV avec VP8, VP9, AV1, H.264 ou HEVC, et son Opus, Vorbis, AAC, MP3 ou FLAC. MP4, MOV et M4V avec H.264, HEVC, VP9 ou AV1 et AAC. Une image indécodable, souvent HEVC sans licence, est nommée et refusée ; un son indécodable est nommé puis retiré. AVI, WMV, FLV et MPEG-2 sont refusés clairement.
- **Ce que Google charge, et ce qu'on ne lui donne pas.** Les scripts publicitaires et de mesure de Google ne reçoivent ni vidéo, image, nom, poids, durée ni format d’origine. Tout le code de lecture, encodage et écriture vient du site et figure dans le dépôt.
- **Ce que le bouton de don charge, et ce qu'on ne lui donne pas.** Le bouton de don est dessiné par cdnjs.buymeacoffee.com avec Google Fonts. C’est un lien sans suivi de visite, qui ne reçoit rien sur vous ou vos vidéos. Il mène à un autre site uniquement si vous cliquez.
- **Cela fonctionne hors ligne.** Déconnectez le réseau : toutes les fonctions restent disponibles. Un outil envoyant votre vidéo ailleurs pour la convertir s’arrêterait.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, `src/plan.js` pour décider quelles pistes copier ou réencoder, `src/convert.js` pour la copie et l’écriture, et `src/shared/mkv-reader.js` pour lire WebM et MKV. Aucun de ces fichiers ni lecteurs et rédacteurs ne contacte le réseau.
