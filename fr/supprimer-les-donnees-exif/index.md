# Lecteur et effaceur EXIF — supprimer les métadonnées d'une photo

Voyez ce qu'une photo raconte sur vous. Puis retirez-le.

> Consultez, modifiez ou retirez les données EXIF et GPS. JPEG, PNG et WebP gardent leur encodage ; le nettoyage AVIF crée un nouveau PNG. Aucun envoi.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/supprimer-les-donnees-exif/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos photos. Il n'y a pas de serveur.

Le fichier est ouvert, analysé et réécrit par votre propre navigateur. Cet outil ne comporte aucune fonction réseau, si bien qu'il n'a rien à aller chercher et rien à envoyer. Et quand bien même il en aurait une, il n'y a à l'autre bout de cette page aucun serveur à qui remettre une photo.

- ✗ Sans envoi
- ✗ Sans compte
- ✓ Fonctionne hors ligne
- ✓ Open source
- ✓ AVIF est nettoyé en PNG ; JPEG, PNG et WebP gardent leur encodage

## Comment supprimer les données EXIF d'une photo

1. **Choisissez vos photos.** Déposez-les sur la zone prévue ou sélectionnez-les à la main. Le navigateur les lit directement sur votre disque, sans que rien parte où que ce soit pendant ce temps.
2. **Lisez ce qu'il y a dedans, si vous voulez.** La liste des trouvailles nomme d'abord ce qui vaut d'être su, à savoir la position GPS, les horodatages et les numéros de série, avant le tableau complet de toutes les étiquettes. Pour JPEG, PNG et WebP, ces blocs sont inventoriés. AVIF montre seulement l’EXIF extrait disponible ; les autres métadonnées AVIF ne sont pas inventoriées.
3. **Appuyez sur « Tout supprimer ».** Pour JPEG, PNG et WebP : C'est tout le travail pour la plupart des gens. Chaque étiquette, les blocs XMP et IPTC, les commentaires et la vignette incorporée partent, sur toutes les photos de la liste d'un coup. AVIF est décodé par votre navigateur et enregistré dans un nouveau PNG sans copier les métadonnées d’origine. Les balises EXIF disponibles sont consultables ici, mais ne peuvent pas être modifiées. Le PNG peut être plus gros et la conversion peut changer les couleurs ou le HDR. Votre original reste inchangé.
4. **Ou modifiez au lieu de supprimer.** Pour JPEG, PNG et WebP : Changez une date, corrigez une ligne de copyright, retirez le lieu en gardant les réglages de l'appareil, puis enregistrez cette photo seule.

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

Pour JPEG, PNG et WebP : L'EXIF est un bloc d'étiquettes qu'un appareil écrit à côté de l'image : la marque et le modèle, les réglages d'exposition, la date et l'heure à la seconde près, souvent une position GPS, et parfois un numéro de série. Les photos portent fréquemment davantage : un paquet XMP de XML laissé par un logiciel de retouche, un bloc IPTC de légendes et de signatures, un profil colorimétrique, une petite deuxième copie de l'image en vignette, et une note de fabricant remplie de données non documentées. Cet outil liste tout cela. Pour JPEG, PNG et WebP, ces blocs sont inventoriés. AVIF montre seulement l’EXIF extrait disponible ; les autres métadonnées AVIF ne sont pas inventoriées.

### Supprimer les métadonnées réduit-il la qualité de l'image ?

Le nettoyage JPEG, PNG et WebP modifie leurs conteneurs et copie les données d’image compressées octet pour octet sans décodage ni recompression. AVIF est décodé et sa première image est écrite dans un nouveau PNG sans perte et sans métadonnées d’origine. Le PNG peut être plus gros et le décodage du navigateur peut changer les couleurs ou le HDR. L’original reste inchangé.

### Quels formats de fichier prend-il en charge ?

JPEG, PNG et WebP permettent de consulter, modifier et nettoyer les métadonnées dans leur conteneur. AVIF permet un aperçu de l’EXIF extrait disponible et un nettoyage vers un nouveau PNG. Les balises AVIF sont en lecture seule ; les autres métadonnées ne sont pas inventoriées. AVIF animé utilise la première image. HEIC et TIFF brut sont reconnus, mais ne sont pas réécrits.

### Ma photo apparaîtra-t-elle tournée une fois les métadonnées retirées ?

Pour JPEG, PNG et WebP, conserver l’orientation écrit au besoin un petit bloc EXIF avec cette seule balise. Désactivez l’option pour la retirer. AVIF est nettoyé à partir de l’image décodée dans le bon sens par le navigateur, puis converti en PNG. Les options d’orientation et de profil colorimétrique concernent seulement JPEG, PNG et WebP.

### Supprime-t-il la position GPS ?

Le nettoyage retire les données GPS. Pour JPEG, PNG et WebP, vous pouvez aussi supprimer seulement la position et garder le reste. Les balises AVIF sont en lecture seule ; la conversion PNG ne copie aucune métadonnée d’origine.

### Puis-je modifier une étiquette au lieu de la supprimer ?

JPEG, PNG et WebP permettent de modifier et d’ajouter des balises. Reconstruire une note du fabricant peut invalider ses décalages internes ; gardez l’original si cela compte. L’EXIF AVIF est en lecture seule. Le nettoyage crée un PNG sans métadonnées d’origine au lieu de réécrire le conteneur AVIF.

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
