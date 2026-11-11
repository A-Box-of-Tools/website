# Images en vidéo

Créez un MP4 à partir d’une séquence de rendu, de photos de timelapse ou d’un diaporama.

> Convertissez une séquence d’images en MP4 dans le navigateur. Une image par fichier pour les rendus et les timelapses, ou des secondes par photo pour un diaporama. Sans envoi ni compte.

Cette page est un outil interactif de navigateur à l’adresse https://abox.tools/fr/images-en-video/. Les fichiers sont traités sur l’appareil qui exécute ce navigateur. Tout partage volontaire ou fonction réseau facultative est expliqué sur la page. Voici son explication écrite ; ouvrez l’adresse pour l’utiliser.

## Vos images sont **traités dans votre navigateur**. Aucun envoi pour traitement.

Chaque image est encodée par votre propre navigateur et la vidéo est construite en mémoire sur cette machine. L'encodeur ne touche jamais au réseau et, quand bien même il y toucherait, il n'y a à l'autre bout de cette page aucun serveur à qui remettre une image.

- ✗ Sans envoi
- ✗ Sans compte
- ✓ Fonctionne hors ligne
- ✓ Open source
- ✓ Les fichiers restent sur votre appareil

## Comment convertir une séquence d’images ou un diaporama en MP4

1. **Choisissez vos images.** Déposez un dossier sur la zone prévue, ou sélectionnez les fichiers à la main. Le navigateur les lit directement sur votre disque, sans que rien parte où que ce soit pendant ce temps.
2. **Choisissez des images pour une séquence, ou des secondes pour un diaporama.** Utilisez « Trier par nom » pour des images de rendu numérotées et vérifiez la première et la dernière vignette. Gardez une image par fichier pour une séquence de rendu ou un timelapse photo ; adaptez la cadence à votre source. Pour un diaporama, passez en secondes, saisissez une durée comme trois et appuyez sur « Appliquer à toutes ». Faites glisser pour réordonner ou modifiez la durée d’une image précise.
3. **Choisissez une résolution et une cadence.** Choisissez 1080p pour un premier export, ou la forme carrée ou verticale de la destination. « Suivre la plus haute résolution » prend la plus grande largeur et la plus grande hauteur parmi les images. « Tenir dedans » garde l’image entière ; « Remplir l’image » rogne les bords. Vérifiez le résumé de durée et de taille de sortie avant l’encodage.
4. **Créez la vidéo et téléchargez-la.** L'encodage tourne sur votre propre matériel : la durée dépend donc de votre machine et non d'une file d'attente. Le MP4 fini est remis directement aux téléchargements de votre navigateur.

## La version longue

[Convertir une séquence d’images ou un diaporama photo en MP4](https://abox.tools/fr/guides/transformer-des-images-en-video/): Convertissez des images de rendu numérotées ou des photos en accéléré en MP4, ou créez un diaporama. Choisissez images ou secondes, vérifiez l’ordre et évitez recadrages et durées incorrectes.

## Aussi dans la boîte

- [Coupeur de vidéos](https://abox.tools/fr/couper-une-video/): Marquez les passages à garder pendant la lecture. Récupérez-les en une seule vidéo.
- [Recadreur de vidéos](https://abox.tools/fr/recadrer-une-video/): Ramener un clip à ce qui compte dedans.
- [Inverseur de vidéo](https://abox.tools/fr/inverser-une-video/): La dernière image en premier, le son avec.
- [Créateur de timelapse](https://abox.tools/fr/faire-un-timelapse/): Une heure de rushes en vingt secondes.

## Questions

### Mes images sont-elles envoyées quelque part ?

Non. Vos images sont lues, composées et encodées par votre propre navigateur sur votre propre matériel. Cet outil n'a pas de côté serveur, et sa `Content-Security-Policy` énumère toutes les adresses que la page peut contacter, dont aucune n'appartient à ce site. La seule exception est la fonction facultative « ajouter depuis une adresse web », qui récupère une image que vous collez, et ce serveur-là voit votre adresse IP.

### Quels formats d'image puis-je utiliser ?

Tout format d'image fixe que votre navigateur sait décoder, ce qui en pratique veut dire le JPG, le PNG, le WebP, le GIF, l'AVIF et, sur les appareils Apple, le HEIC. Il n'y a pas ici de liste séparée à tenir à jour, puisque le décodage est le travail du navigateur et non le nôtre.

### Quel format vidéo produit-il ?

La sortie privilégiée est le MP4 avec vidéo H.264. La solution de repli enregistre en temps réel, généralement en WebM, que moins de logiciels de montage acceptent. Gardez l’onglet visible pendant cet enregistrement ; le minutage est approximatif et des images peuvent être sautées si le décodage prend du retard. Utilisez l’encodeur MP4 pour les séquences numérotées exactes lorsque votre navigateur le prend en charge.

### Puis-je m'en servir pour une séquence de rendu Blender ou After Effects ?

Oui, une séquence de rendu numérotée est exactement ce à quoi cela sert. Ajoutez les images écrites par votre moteur de rendu, laissez la durée d'affichage à une image chacune, et réglez la cadence sur celle du rendu. « Trier par nom » compte comme vous vous y attendez, si bien que `frame_2` se place avant `frame_10` et non après. \
\
Une chose à savoir avant de commencer : le H.264 n'a pas de canal alpha, la transparence est donc aplatie sur la couleur de fond plutôt que reportée. Si vous devez garder l'alpha, composez plutôt les images dans votre logiciel de montage.

### Puis-je faire un timelapse à partir de photos ?

Oui, et c'est le même travail qu'une séquence de rendu : tenez chaque photo une seule image et choisissez une cadence. À 30 images par seconde, chaque trentaine de photos devient une seconde de vidéo ; à 12, ces mêmes photos durent deux secondes et demie. \
\
« Trier par date » utilise les dates de modification des fichiers, qui peuvent changer quand les photos sont copiées ou modifiées. Vérifiez l’ordre quand les noms de fichiers sont repartis à 0001. Des photos de tailles différentes ne posent aucun problème, puisque « Suivre la plus haute résolution » part de la plus grande largeur et de la plus grande hauteur, limite ensuite le plus grand côté à 7680 pixels et arrondit à des dimensions paires. Vérifiez le résumé de la taille de sortie ; de très grands originaux peuvent tout de même être réduits.

### Y a-t-il une limite au nombre d'images ou à la durée de la vidéo ?

Il n’y a pas de limite fixe au nombre d’images, mais les exports MP4 doivent rester sous 4 Gio (environ 4,3 Go). La vidéo terminée est assemblée en mémoire avant le téléchargement, votre appareil peut donc manquer de mémoire bien avant ce plafond. L’encodeur du navigateur limite aussi les dimensions de sortie. Si un gros export échoue, réduisez la résolution, raccourcissez la séquence ou divisez-la en parties.

### Est-ce gratuit, et faut-il un compte ?

C'est gratuit, et il n'y a ni compte, ni identification, ni période d'essai. Le site affiche de la publicité, et c'est elle qui le finance ; les annonces ne reçoivent rien sur vos images.

### Est-ce que cela fonctionne hors ligne ?

Oui. Chargez la page une fois, coupez ensuite votre connexion et elle continue de travailler. C'est aussi la façon la plus simple de prouver que rien n'est envoyé, car un outil qui expédierait vos images ailleurs pour les traiter s'arrêterait à l'instant où vous débranchez.

### Puis-je ajouter de la musique ou une bande-son ?

Pas encore. L'outil ne produit que de la vidéo : le MP4 qu'il écrit a une seule piste vidéo et aucune piste audio. Ajoutez une bande-son ensuite dans un logiciel de montage s'il vous en faut une.

## Comment cette promesse se vérifie

- **Le traitement se fait dans ce navigateur.** L’outil traite entrées et résultats dans le navigateur. Son code ne les envoie pas pour traitement. Content-Security-Policy limite ressources et destinations, mais les hôtes autorisés peuvent recevoir des requêtes : elle n’inspecte pas les données et ne prouve pas seule une absence d’envoi. Comparez code et requêtes de l’opération ou terminez l’opération locale déconnecté.
- **L'encodage est local.** WebCodecs tourne dans votre navigateur et le fichier fini est remis directement à un téléchargement. Cette application n'a pas de côté serveur.
- **Ce que Google charge, et ce qu'on ne lui donne pas.** Les scripts publicitaires et de mesure viennent de Google. Ni l'un ni l'autre ne reçoit quoi que ce soit sur vos images : ni un fichier, ni une vignette, ni un nom, une taille ou un nombre. Chaque ligne qui lit, décode, compose ou encode une image est servie depuis cette origine et figure dans le dépôt.
- **Le bouton de don ne charge rien et ne reçoit rien.** Le bouton « Buy me a coffee » dans l'en-tête est dessiné par la page elle-même et ne charge rien de nulle part. C'est un lien, rien de plus : il ne signale aucune visite, et on ne lui donne rien sur vous ni sur vos images. Rien ne se passe tant que vous ne cliquez pas, et ce vers quoi vous cliqueriez est le site de quelqu'un d'autre.
- **Une exception délibérée.** Si vous utilisez « Ajouter depuis une adresse web », le serveur concerné est contacté pour récupérer l'image et verra votre adresse IP. Seules les images que vous collez sont récupérées, et seulement en entrée : `img-src` est ouvert, `connect-src` ne l'est pas. Le compteur ci-dessous liste toutes les origines extérieures contactées.
- **Tout fonctionne hors ligne.** Coupez le réseau et tout continue de fonctionner, à la seule exception du chargement depuis une adresse web. C'est la preuve la plus simple de toutes.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, ainsi que `src/encoder.js` pour la boucle d'encodage, qui ne touche jamais au réseau.
