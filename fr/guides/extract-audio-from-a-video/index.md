# Comment extraire le son d’une vidéo

Choisissez une vidéo et enregistrez sa piste décodée en WAV dans le navigateur. La sortie ne contient que du son ; taille et précision dépendent de la profondeur et des canaux.

[Ouvrir Extraire l'audio d'une vidéo](https://abox.tools/fr/extraire-l-audio-d-une-video/): Déposez une vidéo et repartez avec le son. L'image n'est jamais décodée, et rien n'est envoyé.

Dernière mise à jour 13 octobre 2026

## Choisir la vidéo et écouter le résultat

Ouvrez l’extracteur et choisissez ou déposez la vidéo. Le navigateur décode son audio et crée automatiquement un WAV. Écoutez le résultat avant de le télécharger. Une vidéo muette n’a aucune piste à extraire ; un codec non décodable par votre navigateur exige un autre décodeur.

La conversion se déroule sur votre appareil, sans envoi du fichier pour décodage. Les grandes vidéos nécessitent de la mémoire pour l’entrée, les échantillons décodés et la sortie ; le traitement local ne rend pas la mémoire illimitée.

![Profondeur WAV et choix des canaux à côté du lecteur audio extrait.](https://abox.tools/screens/extract-audio-from-a-video/output.webp)

Le lecteur utilise le WAV proposé au téléchargement. Modifier la profondeur ou les canaux crée un nouveau résultat.

## Une conférence à écouter ou une piste à modifier

Pour écouter un cours, une présentation enregistrée ou un entretien loin de l'écran, gardez d'abord les canaux source et le PCM 16 bits par défaut. Écoutez le début et la fin, puis passez le WAV au [découpeur audio](https://abox.tools/fr/couper-un-audio/) si seul un extrait compte. Le WAV peut être bien plus gros que la piste compressée : vérifiez ce que l'application d'écoute accepte avant le transfert.

Pour monter une voix off ou un podcast, choisissez Float32 sans changer les canaux et gardez ce WAV comme copie de travail. L'extraction prend la piste mixée existante ; elle ne sépare pas une voix de la musique, ne supprime pas le bruit et ne transcrit pas les paroles. Essayez mono après avoir écouté les deux canaux : cela peut alléger une voix, mais deux microphones peuvent porter des voix différentes ou s'annuler en partie lors de la moyenne.

## Choisir 16 bits ou Float32

Le PCM 16 bits est le réglage par défaut pour une large compatibilité. L’écriture arrondit et limite les échantillons décodés. Float32 conserve ces valeurs lorsque les canaux sont inchangés, y compris celles dépassant la pleine échelle, et sert pour un montage ultérieur. Il ne restaure pas les détails déjà perdus par compression.

WAV contient de l’audio non compressé et peut être bien plus grand que la piste compressée de la vidéo. L’extracteur ne produit pas de MP3, car il n’inclut aucun encodeur MP3. Une autre application avec un encodeur local peut créer du MP3 sans envoyer le fichier.

## Garder les canaux ou passer en mono

Gardez les canaux d’origine pour conserver leur séparation. Le mono en fait la moyenne dans un seul canal : le fichier peut diminuer, mais la position stéréo disparaît et des sons peuvent s’annuler si les canaux s’opposent. Écoutez après toute modification.

L’outil lit la fréquence d’échantillonnage source lorsque l’en-tête l’indique et décode à cette fréquence. S’il doit en supposer une, les informations de sortie le précisent. Vérifiez-les si la durée ou la fréquence compte pour l’application suivante.

## Enregistrer, annuler ou réessayer

Changer la profondeur ou les canaux remplace automatiquement l’ancien résultat. Téléchargez la version écoutée. Annuler retire le travail courant ; un décodage en cours peut finir en interne, mais son résultat tardif ne remplacera pas un nouveau choix. Après un échec d’écriture, utilisez à nouveau Créer WAV avec la source actuelle.

Pour raccourcir la piste, poursuivez dans le [découpeur audio](https://abox.tools/fr/couper-un-audio/). Pour des fondus, le gain ou l’inversion, utilisez l’[éditeur audio](https://abox.tools/fr/modifier-un-audio/).
