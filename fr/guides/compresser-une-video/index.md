# Comment compresser une vidéo à une taille qui passe

Une vidéo impossible à envoyer a un problème : elle dépasse un nombre. Voici où passent les mégaoctets, ce que coûte leur suppression et comment passer sous la limite sans envoyer d’abord le fichier déjà trop volumineux.

[Ouvrir Compression vidéo](https://abox.tools/fr/compresser-une-video/): Donnez le poids maximal. L’outil calcule le reste et mesure le résultat avant téléchargement.

Dernière mise à jour 13 octobre 2026

## La réponse rapide

Ouvrez le [compresseur vidéo](https://abox.tools/fr/compresser-une-video/), déposez la vidéo et choisissez la limite demandée — 8 Mo, 16, 25, 50, 100 — ou saisissez un autre nombre. La ligne sous le champ indique ce que cette taille permet : les dimensions et le débit compatibles avec la durée. Appuyez sur le bouton : la vidéo est encodée sur votre ordinateur, mesurée par rapport à la limite puis rouverte pour vérifier sa durée. Rien n’est envoyé.

La suite explique ce compromis : « compresser » ne coûte rien pour un zip, mais signifie autre chose pour une vidéo.

## Une pièce jointe, un envoi ou un rapport de bug

Pour un e-mail, vérifiez la limite du message entier, soustrayez les autres pièces jointes et gardez une marge. Gmail personnel autorise actuellement 25 Mo de pièces jointes ; les limites professionnelles et scolaires sont fixées par l'administrateur. Les [instructions Gmail sur les pièces jointes](https://support.google.com/mail/answer/6584?hl=en) expliquent la distinction. Un préréglage vise une taille ; il ne promet pas que tous les destinataires l'acceptent.

Pour un rapport de bug ou une courte démonstration, coupez l'attente avant de compresser. Gardez les clics qui expliquent le problème, le son s'il contribue à l'explication et une résolution suffisante pour lire le plus petit texte important. Lisez le résultat téléchargé dans l'application destinataire, vérifiez la taille réelle et la dernière seconde, puis augmentez la cible ou raccourcissez le clip si le texte est devenu illisible.

## Où passent les mégaoctets

Un fichier vidéo contient presque uniquement de l’image. Une minute en 1080p filmée au téléphone pèse entre 60 et 150 Mo, dont environ un pour le son. Le reste décrit trente images par seconde par leurs différences successives. La taille correspond donc à peu près au nombre de bits par seconde autorisés pour l’image — le *débit* — multiplié par la durée.

Une limite de taille se transforme ainsi directement en débit. Prenez la limite, retirez le son, copié tel quel, et un peu de place pour le conteneur, puis divisez le reste par la durée. Une limite de 25 Mo pour deux minutes laisse à l’image environ 1,6 mégabit par seconde. C’est tout le budget ; le reste en découle.

## Pourquoi les dimensions baissent avant que l’image se dégrade

Un débit n’a de sens que par rapport au nombre de pixels à dessiner. Répartir 1,6 mégabit par seconde sur du 1080p — deux millions de pixels, trente fois par seconde — laisse presque rien à chaque pixel. L’encodeur floute alors : les contours ramollissent, les aplats deviennent des blocs et les mouvements se brouillent. Le même débit donne une image tout à fait regardable en 720p et bonne en 480p.

L’outil descend donc les dimensions par paliers — 1080p, 720p, 480p, 360p — jusqu’à donner assez de bits à chaque image. Il l’annonce avant de commencer. Une petite image nette vaut mieux qu’une grande image brouillée, sur tout écran ; les services qui acceptent les vidéos font cela discrètement. L’outil ne fait jamais l’inverse : il n’agrandit pas la vidéo d’origine.

Vous pouvez modifier ce choix. Un enregistrement d’écran dont le texte doit rester lisible peut demander du 1080p avec une image plus douce ; une vidéo regardée seulement sur téléphone peut descendre en 480p et consacrer les bits au mouvement.

## Ce qui se perd, et comment réduire la perte

Une vidéo compressée est réencodée. L’image est décodée, redessinée plus petite puis écrite au nouveau débit : elle s’éloigne d’une génération de l’appareil d’origine. Le son n’est pas modifié : ses échantillons sont copiés exactement. La perte dépend de la limite : diviser la taille par deux perd peu ; réduire 900 Mo à 25 Mo supprime la plupart des bits, et cela se verra.

- **Demandez la taille nécessaire, pas moins.** Si la limite est 25 Mo, choisissez 25 Mo ; 8 Mo supprime inutilement les deux tiers du budget de l’image.
- **Coupez d'abord.** Retirer le temps inutile laisse plus de budget à chaque seconde restante. Le [Découpeur vidéo](https://abox.tools/fr/guides/couper-une-video/) peut copier les sélections compatibles sans réencodage ; les coupes exactes réencodent l'image. Le résultat peut porter des instructions de lecture, y compris des modifications audio après une coupe d'image exacte. Si le compresseur refuse cette chronologie, enregistrez une nouvelle vidéo avec ces modifications appliquées dans un éditeur local. Choisissez délibérément la méthode indiquée.
- **Retirez le son s’il est inutile.** Une minute stéréo pèse environ un mégaoctet. Avec une limite serrée, ce mégaoctet peut faire la différence entre une image nette et brouillée.
- **Gardez l’original.** La compression ne peut pas être annulée. Compressez une copie, envoyez la copie et gardez le fichier de l’appareil.

## Pourquoi l’envoi du fichier est la partie étrange

Un compresseur en ligne demande d’envoyer le fichier déjà trop gros pour être envoyé. Les 900 Mo passent par votre connexion pour récupérer 25 Mo ; sur la plupart des connexions domestiques, cet envoi dure plus longtemps que l’encodage. Viennent ensuite les questions de conservation, de durée et d’accès, particulièrement pertinentes pour une vidéo de vos enfants ou de votre salon.

Rien de cela n’est nécessaire. Les navigateurs récents possèdent les mêmes codecs vidéo qu’un téléphone. L’[outil proposé ici](https://abox.tools/fr/compresser-une-video/) les utilise : il lit le fichier par morceaux depuis votre disque, le décode, réduit les images et les réencode sur votre ordinateur. Le résultat reste en mémoire jusqu’à l’enregistrement. La politique de la page énumère les adresses qu’elle peut contacter ; aucune n’est celle de ce site. Il fonctionne avec le réseau débranché. Pour le prouver, déconnectez-vous et compressez quand même.

Le guide [est-il sûr d’envoyer des fichiers](https://abox.tools/fr/guides/est-il-sur-d-envoyer-ses-fichiers/) développe la question générale.

## Les vérifications avant de vous remettre le fichier

Un encodeur s'approche du débit demandé sans l'atteindre exactement : on vise donc un peu sous la limite, puis on mesure le fichier. S'il la dépasse, le débit est recalculé selon l'écart et le clip est réencodé ; la page le signale. Le fichier final est ensuite rouvert sur votre appareil et sa durée comparée à la source. Un compresseur qui perd la dernière seconde ou le son produit aussi un fichier plus petit ; seule la relecture permet de le détecter. Le résultat se lit sous le téléchargement, avant l'envoi. Si la ligne de contrôle annonce encore une cible manquée, le fichier n'est pas sous la limite : réduisez les dimensions, raccourcissez le clip ou augmentez la limite, puis réessayez.

## Les formats écrits et lus

Il écrit un MP4 avec vidéo H.264 et audio original copié. H.264 en MP4 est largement pris en charge, mais le destinataire doit accepter le codec audio et le profil vidéo. Testez le fichier dans l’application prévue. Il lit MP4 et MOV avec des codecs décodables par le navigateur ; pas WebM, MKV ni AVI. Il n’écrit pas de WebM, HEVC ni AV1.
