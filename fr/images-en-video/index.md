# Images en vidéo — faire un diaporama MP4

Transformer un dossier d'images en vidéo.

> Transformez des images JPG, PNG ou WebP en un diaporama vidéo MP4, gratuitement et entièrement dans votre navigateur. Rien n'est envoyé, aucune inscription, et cela fonctionne hors ligne.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/images-en-video/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos images. Il n'y a pas de serveur.

Chaque image est encodée par votre propre navigateur et la vidéo est construite en mémoire sur cette machine. L'encodeur ne touche jamais au réseau et, quand bien même il y toucherait, il n'y a à l'autre bout de cette page aucun serveur à qui remettre une image.

- ✗ Sans envoi
- ✗ Sans compte
- ✓ Fonctionne hors ligne
- ✓ Open source
- ✓ Les fichiers restent sur votre appareil

## Comment transformer des images en vidéo

1. **Choisissez vos images.** Déposez un dossier sur la zone prévue, ou sélectionnez les fichiers à la main. Le navigateur les lit directement sur votre disque, sans que rien parte où que ce soit pendant ce temps.
2. **Mettez-les en ordre et dites combien de temps chacune est tenue.** Faites glisser pour réordonner. La durée d'affichage peut être donnée en images ou en secondes, pour toutes les images d'un coup ou une par une.
3. **Choisissez une résolution et une cadence.** « Suivre la plus haute résolution » se règle sur votre plus grande image ; les préréglages couvrent la 4K, le 1080p, le 720p, le carré et le vertical, et il y a un format personnalisé si aucun ne convient.
4. **Créez la vidéo et téléchargez-la.** L'encodage tourne sur votre propre matériel : la durée dépend donc de votre machine et non d'une file d'attente. Le MP4 fini est remis directement aux téléchargements de votre navigateur.

## La version longue

[Comment transformer un dossier d'images en vidéo](https://abox.tools/fr/guides/transformer-des-images-en-video/): Faire un diaporama MP4 à partir de photos : ce que contrôlent vraiment la cadence et la durée, comment traiter les images qui n'ont pas la bonne forme, et pourquoi le résultat n'a pas de bande-son.

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

Du MP4 avec de la vidéo H.264, qui se lit sur à peu près n'importe quoi. Dans un navigateur sans WebCodecs, l'outil se rabat sur un enregistrement WebM, soit les mêmes images dans un conteneur que moins d'éditeurs acceptent.

### Puis-je m'en servir pour une séquence de rendu Blender ou After Effects ?

Oui, une séquence de rendu numérotée est exactement ce à quoi cela sert. Ajoutez les images écrites par votre moteur de rendu, laissez la durée d'affichage à une image chacune, et réglez la cadence sur celle du rendu. « Trier par nom » compte comme vous vous y attendez, si bien que `frame_2` se place avant `frame_10` et non après. \
\
Une chose à savoir avant de commencer : le H.264 n'a pas de canal alpha, la transparence est donc aplatie sur la couleur de fond plutôt que reportée. Si vous devez garder l'alpha, composez plutôt les images dans votre logiciel de montage.

### Puis-je faire un timelapse à partir de photos ?

Oui, et c'est le même travail qu'une séquence de rendu : tenez chaque photo une seule image et choisissez une cadence. À 30 images par seconde, chaque trentaine de photos devient une seconde de vidéo ; à 12, ces mêmes photos durent deux secondes et demie. \
\
« Trier par date » remet une pellicule dans l'ordre où elle a été prise, ce qui compte quand les noms de fichiers sont repartis à 0001. Des photos de tailles différentes ne posent aucun problème, puisque « Suivre la plus haute résolution » dimensionne la vidéo pour qu'aucune ne soit réduite.

### Y a-t-il une limite au nombre d'images ou à la durée de la vidéo ?

Aucune limite n'est intégrée à l'outil. Le plafond pratique est la mémoire de votre propre machine, parce que la vidéo finie y est assemblée avant que vous la téléchargiez. Les très grands diaporamas en 4K commencent à s'y faire sentir les premiers.

### Est-ce gratuit, et faut-il un compte ?

C'est gratuit, et il n'y a ni compte, ni identification, ni période d'essai. Le site affiche de la publicité, et c'est elle qui le finance ; les annonces ne reçoivent rien sur vos images.

### Est-ce que cela fonctionne hors ligne ?

Oui. Chargez la page une fois, coupez ensuite votre connexion et elle continue de travailler. C'est aussi la façon la plus simple de prouver que rien n'est envoyé, car un outil qui expédierait vos images ailleurs pour les traiter s'arrêterait à l'instant où vous débranchez.

### Puis-je ajouter de la musique ou une bande-son ?

Pas encore. L'outil ne produit que de la vidéo : le MP4 qu'il écrit a une seule piste vidéo et aucune piste audio. Ajoutez une bande-son ensuite dans un logiciel de montage s'il vous en faut une.

## Comment cette promesse se vérifie

- **Vos images n'ont nulle part où aller.** La Content-Security-Policy énumère toutes les adresses que cette page peut contacter, et aucune n'appartient à ce site. Il n'existe ici aucun point de collecte où vos fichiers pourraient aboutir, ni rien dans le code qui les y enverrait s'il en existait un. Cette ligne disait autrefois `connect-src 'none'`, ce qui était absolu ; ajouter la publicité a coûté cela, et le dire fait partie du marché.
- **L'encodage est local.** WebCodecs tourne dans votre navigateur et le fichier fini est remis directement à un téléchargement. Cette application n'a pas de côté serveur.
- **Ce que Google charge, et ce qu'on ne lui donne pas.** Les scripts publicitaires et de mesure viennent de Google. Ni l'un ni l'autre ne reçoit quoi que ce soit sur vos images : ni un fichier, ni une vignette, ni un nom, une taille ou un nombre. Chaque ligne qui lit, décode, compose ou encode une image est servie depuis cette origine et figure dans le dépôt.
- **Ce que le bouton de don charge, et ce qu'on ne lui donne pas.** Le bouton « Buy me a coffee » dans l'en-tête est dessiné par un script de cdnjs.buymeacoffee.com et se compose avec Google Fonts. C'est un lien, rien de plus : il ne signale aucune visite, et on ne lui donne rien sur vous ni sur vos images. Rien ne se passe tant que vous ne cliquez pas, et ce vers quoi vous cliqueriez est le site de quelqu'un d'autre.
- **Une exception délibérée.** Si vous utilisez « Ajouter depuis une adresse web », le serveur concerné est contacté pour récupérer l'image et verra votre adresse IP. Seules les images que vous collez sont récupérées, et seulement en entrée : `img-src` est ouvert, `connect-src` ne l'est pas. Le compteur ci-dessous liste toutes les origines extérieures contactées.
- **Tout fonctionne hors ligne.** Coupez le réseau et tout continue de fonctionner, à la seule exception du chargement depuis une adresse web. C'est la preuve la plus simple de toutes.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, ainsi que `src/encoder.js` pour la boucle d'encodage, qui ne touche jamais au réseau.
