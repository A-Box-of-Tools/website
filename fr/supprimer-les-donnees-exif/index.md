# Lecteur et effaceur EXIF — supprimer les métadonnées d'une photo

Voyez ce qu'une photo raconte sur vous. Puis retirez-le.

> Voyez les données EXIF et GPS cachées dans une photo, modifiez-les, ou retirez tout d'un clic. Tout se passe dans votre navigateur, sans envoi et sans jamais réencoder la photo.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/supprimer-les-donnees-exif/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos photos. Il n'y a pas de serveur.

Le fichier est ouvert, analysé et réécrit par votre propre navigateur. Cet outil ne comporte aucune fonction réseau, si bien qu'il n'a rien à aller chercher et rien à envoyer. Et quand bien même il en aurait une, il n'y a à l'autre bout de cette page aucun serveur à qui remettre une photo.

- ✗ Sans envoi
- ✗ Sans compte
- ✓ Fonctionne hors ligne
- ✓ Open source
- ✓ Ne réencode jamais l'image

## Comment supprimer les données EXIF d'une photo

1. **Choisissez vos photos.** Déposez-les sur la zone prévue ou sélectionnez-les à la main. Le navigateur les lit directement sur votre disque, sans que rien parte où que ce soit pendant ce temps.
2. **Lisez ce qu'il y a dedans, si vous voulez.** La liste des trouvailles nomme d'abord ce qui vaut d'être su, à savoir la position GPS, les horodatages et les numéros de série, avant le tableau complet de toutes les étiquettes.
3. **Appuyez sur « Tout supprimer ».** C'est tout le travail pour la plupart des gens. Chaque étiquette, les blocs XMP et IPTC, les commentaires et la vignette incorporée partent, sur toutes les photos de la liste d'un coup.
4. **Ou modifiez au lieu de supprimer.** Changez une date, corrigez une ligne de copyright, retirez le lieu en gardant les réglages de l'appareil, puis enregistrez cette photo seule.

## La version longue

[Ce qu'une photo raconte sur vous, et comment le retirer](https://abox.tools/fr/guides/supprimer-les-donnees-exif-et-gps/): Une photo sortie d'un téléphone porte en général l'endroit exact où elle a été prise, l'heure à la seconde, et le numéro de série de l'appareil. Ce qu'il y a dedans, qui peut le lire, et comment le retirer sans toucher à l'image.

## Aussi dans la boîte

- [Visionneuse DICOM](https://abox.tools/fr/visionneuse-dicom/): Scanner, IRM, radio et échographie, avec le fenêtrage, l'en-tête et les mesures.
- [Image en ICO](https://abox.tools/fr/creer-un-favicon/): Une image en entrée. Toutes les tailles qu'un navigateur, Windows ou un Mac réclame, en sortie.
- [Image en data URI](https://abox.tools/fr/image-en-base64/): L'image entière en une ligne de texte. À coller directement dans du CSS ou du HTML.
- [SVG en image](https://abox.tools/fr/convertir-svg-en-png/): Vous donnez la taille. Un vectoriel n'en a aucune à perdre.

## Questions

### Ma photo est-elle envoyée quelque part ?

Non. Le fichier est lu, analysé et réécrit par votre propre navigateur sur votre propre matériel. Cet outil ne comporte aucune fonction réseau, si bien qu'il ne va jamais rien chercher et n'envoie jamais rien. Sa `Content-Security-Policy` énumère par ailleurs toutes les adresses que la page peut contacter, dont aucune n'appartient à ce site.

### Qu'est-ce que l'EXIF, et quoi d'autre se cache dans une photo ?

L'EXIF est un bloc d'étiquettes qu'un appareil écrit à côté de l'image : la marque et le modèle, les réglages d'exposition, la date et l'heure à la seconde près, souvent une position GPS, et parfois un numéro de série. Les photos portent fréquemment davantage : un paquet XMP de XML laissé par un logiciel de retouche, un bloc IPTC de légendes et de signatures, un profil colorimétrique, une petite deuxième copie de l'image en vignette, et une note de fabricant remplie de données non documentées. Cet outil liste tout cela.

### Supprimer les métadonnées réduit-il la qualité de l'image ?

Non, et c'est la principale raison d'utiliser un outil comme celui-ci plutôt que de réenregistrer la photo. Les métadonnées se trouvent dans le conteneur autour de l'image compressée, et non dedans. Les supprimer revient à effacer des entrées d'une liste puis à réécrire la liste ; les données d'image compressées, elles, sont recopiées octet pour octet, si bien que le résultat décode exactement les mêmes pixels. Rien n'est décodé et rien n'est recompressé.

### Quels formats de fichier prend-il en charge ?

Le JPEG, le PNG et le WebP. Le HEIC et l'AVIF sont reconnus mais pas réécrits : ce sont des formats à boîtes faits d'atomes imbriqués, qui demandent un autre analyseur, si bien que l'outil le dit plutôt que de produire un fichier cassé. Un TIFF nu n'est pas pris en charge non plus, parce que dans un TIFF les métadonnées et les pixels sont adressés par les mêmes décalages.

### Ma photo apparaîtra-t-elle tournée une fois les métadonnées retirées ?

C'est possible, et il y a un réglage pour cela. Les téléphones enregistrent d'habitude l'image telle que le capteur l'a vue et ajoutent une étiquette d'orientation qui dit comment la tourner. Retirez cette étiquette et certaines visionneuses montreront la photo couchée. L'option « garder l'étiquette d'orientation », active par défaut, réécrit un minuscule bloc EXIF ne contenant que cette seule étiquette, et seulement quand la photo en avait réellement besoin. Décochez-la si vous préférez que le fichier ne porte plus le moindre EXIF.

### Supprime-t-il la position GPS ?

Oui. Tout supprimer supprime le répertoire GPS entier, et vous pouvez aussi effacer le lieu seul en gardant le reste. La position est d'abord montrée en degrés décimaux, parce que « 51 degrés, 30 minutes, 26 secondes » ne rend pas évident qu'une photo nomme le bâtiment où elle a été prise.

### Puis-je modifier une étiquette au lieu de la supprimer ?

Oui. Les étiquettes de texte, les dates, l'ISO, l'orientation et la résolution peuvent toutes être modifiées, et quelques étiquettes courantes peuvent être ajoutées à une photo qui n'en a aucune. Une réserve, toutefois : écrire le fichier reconstruit le bloc EXIF, or une note de fabricant contient des décalages vers le bloc d'origine ; une note reconstruite peut donc ne plus être lisible ensuite par le logiciel du fabricant. Supprimez-la, ou laissez le fichier tel quel, si cela compte pour vous.

### Est-ce gratuit, et faut-il un compte ?

C'est gratuit, et il n'y a ni compte, ni identification, ni période d'essai. Le site affiche de la publicité, et c'est elle qui le finance ; les annonces ne reçoivent rien sur vos photos.

### Est-ce que cela fonctionne hors ligne ?

Oui. Chargez la page une fois, coupez ensuite votre connexion et elle continue de travailler. C'est aussi la façon la plus simple de prouver que rien n'est envoyé, car un outil qui expédierait vos photos ailleurs pour les traiter s'arrêterait à l'instant où vous débranchez.

## Comment cette promesse se vérifie

- **Vos photos n'ont nulle part où aller.** La Content-Security-Policy énumère toutes les adresses que cette page peut contacter, et aucune n'appartient à ce site. Il n'existe ici aucun point de collecte où vos fichiers pourraient aboutir, ni rien dans le code qui les y enverrait s'il en existait un.
- **Rien ici ne va rien chercher.** Contrairement aux autres outils de cette boîte, celui-ci n'a pas de fonction « charger depuis une adresse web » ni la moindre étape réseau facultative. On ne trouve ni `fetch`, ni `XMLHttpRequest`, ni `sendBeacon` nulle part dans `src/`.
- **Les métadonnées que nous lisons ne sont jamais relayées.** Votre position GPS est affichée sur cette page et ne va nulle part ailleurs. Aucun événement d'analytique maison, dans tout ce dépôt, ne transporte une étiquette, un nom de fichier, une taille ou un nombre.
- **Ce que Google charge, et ce qu'on ne lui donne pas.** Les scripts publicitaires et de mesure viennent de Google. Ni l'un ni l'autre ne reçoit quoi que ce soit sur vos photos. Chaque ligne qui lit, analyse ou réécrit un fichier est servie depuis cette origine et figure dans le dépôt.
- **Ce que le bouton de don charge, et ce qu'on ne lui donne pas.** Le bouton « Buy me a coffee » dans l'en-tête est dessiné par un script de cdnjs.buymeacoffee.com et se compose avec Google Fonts. C'est un lien, rien de plus : il ne signale aucune visite, et on ne lui donne rien sur vous ni sur vos fichiers. Rien ne se passe tant que vous ne cliquez pas, et ce vers quoi vous cliqueriez est le site de quelqu'un d'autre.
- **Tout fonctionne hors ligne.** Coupez le réseau : l'outil reste identique, puisqu'il n'a jamais comporté la moindre étape réseau. C'est la preuve la plus simple de toutes.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, `src/tiff.js` pour l'analyseur EXIF, et `src/jpeg.js` pour la preuve que l'image elle-même n'est jamais que copiée.
