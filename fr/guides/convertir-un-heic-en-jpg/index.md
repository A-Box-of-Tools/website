# La photo qu'a enregistrée votre téléphone, et le format que rien n'ouvre

Un iPhone enregistre les photos en HEIC, format plus léger et meilleur que le JPEG, et qu'une grande quantité de logiciels refuse toujours d'ouvrir. Voici ce qu'est réellement ce format, ce que la conversion coûte à l'image, et pourquoi presque tous les convertisseurs veulent que vous l'envoyiez d'abord.

[Ouvrir HEIC vers JPG](https://abox.tools/fr/convertir-heic-en-jpg/): Les photos que fait un iPhone, dans un format que tout ouvre.

Dernière mise à jour 26 août 2026

## La réponse courte

Ouvrez le [convertisseur HEIC vers JPG](https://abox.tools/fr/convertir-heic-en-jpg/), déposez-y les photos, et appuyez sur « Convertir ». Laissez le curseur de qualité où il est et laissez cochée la case « garder la date, l'appareil et les réglages », sauf raison contraire. Vous récupérez des JPEG, un bouton de téléchargement chacun, ou un zip s'il y en a plusieurs.

Rien n'est envoyé pendant ce temps. C'est inhabituel pour ce travail-là en particulier, et la raison est la moitié intéressante de cette page.

![La carte des options : un menu de format sur JPEG, un curseur de qualité à 85 et un interrupteur pour conserver la date, l'appareil et le lieu de la photo d'origine.](https://abox.tools/screens/convert-heic-to-jpg/options.webp)

Toute la conversion tient dans ces trois réglages. L'interrupteur des métadonnées mérite qu'on s'y arrête, et la section plus bas dit pourquoi.

## Ce qu'est réellement le HEIC

Le HEIC n'est pas vraiment un format d'image au sens où le JPEG en est un. C'est un conteneur, la même structure à boîtes dont est fait un MP4, avec à l'intérieur une image fixe de vidéo **HEVC**. Le HEVC, aussi appelé H.265, est le codec qui a remplacé celui de votre vieux caméscope, et il est très bon : une photo d'iPhone en HEIC pèse à peu près la moitié de la même photo en JPEG à qualité égale.

Apple y est passé dans iOS 11, en 2017, et l'a mis par défaut. Ce qui veut dire qu'à moins d'être allé dans les Réglages choisir « Le plus compatible », chaque photo prise par son téléphone depuis près d'une décennie est dans un format que :

- Windows ne prévisualise pas sans une extension du Store ;
- la plupart des formulaires d'envoi web rejettent d'emblée ;
- quantité de logiciels de bureau plus anciens n'ont jamais connu ;
- et qu'aucun navigateur web sauf Safari n'affiche.

La photo va très bien. C'est un meilleur fichier que ne l'aurait été le JPEG. Elle est simplement écrite dans une langue que la plus grande partie du monde n'a jamais apprise.

## Pourquoi seul Safari en ouvre un

C'est la partie qui explique tous les convertisseurs que vous avez jamais utilisés : elle vaut donc un paragraphe.

Décoder du HEVC demande un décodeur HEVC, et le HEVC est breveté. Les licences sont administrées par plus d'un consortium de brevets, et livrer un décodeur veut dire payer quelqu'un. Les navigateurs s'en tirent en s'appuyant sur le système d'exploitation, et Chrome lit ainsi de la *vidéo* HEVC sur une machine dont le matériel a déjà un décodeur sous licence ; mais ce chemin est câblé pour la lecture vidéo et non pour les images fixes. Un HEIC remis à `<img>` est donc refusé, dans Chrome, Firefox et Edge pareillement, sur tous les systèmes d'exploitation.

Safari sur du matériel Apple est l'exception, parce que macOS et iOS ont le décodeur et que Safari a le droit de le lui demander. Partout ailleurs, l'image est tout simplement indécodable par le navigateur.

Ce qui ne laisse à un convertisseur qu'exactement deux possibilités, et le choix entre les deux est toute l'histoire de ce genre d'outil.

## Pourquoi presque tous les convertisseurs HEIC veulent un envoi

Première possibilité : mettre le décodeur sur un serveur. La photo est envoyée, décodée sur une machine que vous n'avez jamais vue, réencodée en JPEG, et renvoyée. C'est ce que fait à peu près tout « convertisseur HEIC en ligne gratuit », et c'est pourquoi ils ont tous besoin de vos fichiers. Ce n'est pas de la paresse : le navigateur en est réellement incapable tout seul.

Ce que cela coûte mérite d'être dit sans détour. Les photos d'un téléphone sont les fichiers les plus personnels que possèdent la plupart des gens, et un HEIC sorti tout droit d'un iPhone porte typiquement les coordonnées du lieu de la prise de vue, précises à quelques mètres, avec la date à la seconde et un identifiant d'appareil. En envoyer un dossier à un service gratuit, c'est remettre les images et cela avec. Ce qui se passe ensuite est régi par une politique de confidentialité que vous n'avez pas lue, sur un serveur que vous ne pouvez pas inspecter, dans une juridiction que vous n'avez pas choisie.

Seconde possibilité : mettre le décodeur dans la page. C'est ce que fait [celui-ci](https://abox.tools/fr/convertir-heic-en-jpg/). Il emporte `libheif`, compilé en WebAssembly, comme un fichier servi depuis ce site, soit environ 1,4 MB, téléchargés une fois puis mis en cache. Votre navigateur l'exécute sur votre propre machine, sur votre propre matériel, et la photo ne va nulle part. Chargez la page une fois et vous pouvez couper entièrement votre connexion sans qu'elle cesse de fonctionner, ce qu'aucun convertisseur qui envoie ne sait faire et la preuve la plus simple qui soit.

Ces 1,4 MB sont tout le prix à payer. Si vous êtes sur une connexion facturée au volume, c'est un coût réel et il vaut la peine de le savoir : c'est pourquoi la page le dit à voix haute au lieu de le télécharger en douce.

## Ce que la conversion coûte à l'image

Le HEIC et le JPEG sont des codecs différents : il n'y a donc aucun passage de l'un à l'autre qui n'implique pas de décoder l'image et de la réencoder. Ce second encodage est avec perte. En pratique, cela compte bien moins que cela n'en a l'air :

- **À la qualité 92**, là où le convertisseur commence, une photographie est très difficile à distinguer de l'original à toute taille de visionnage normale. Vous cherchez des différences dans les dégradés doux, comme un ciel dégagé, et vous n'en trouverez généralement pas.
- **Le JPEG sera plus gros.** En général entre un tiers de plus et le double, parce que le JPEG est un codec de 1992 et que le HEVC n'en est pas un. C'est le marché : un fichier plus gros que tout ouvre.
- **Ce qu'il faut éviter, c'est convertir deux fois.** Chaque encodage avec perte coûte un peu. Convertissez depuis le HEIC d'origine, pas depuis un JPEG que quelqu'un a déjà fabriqué pour vous, et faites-le une seule fois.

Si vous ne voulez aucune perte, le PNG est au menu des formats. Préparez-vous pour le fichier : une photographie en PNG pèse couramment cinq à dix fois le JPEG, parce que la compression du PNG a été conçue pour les aplats et le dessin au trait plutôt que pour l'herbe et la peau.

## La date, l'appareil et les coordonnées

Le reproche habituel fait aux convertisseurs HEIC est que les photos reviennent en ayant perdu leur jour de prise de vue : toute une photothèque de vacances se range alors en bas de la bibliothèque, à la date du jour. Cela arrive parce que convertir à travers un canvas ne donne que des pixels, et qu'un canvas ne contient aucune étiquette ; à moins qu'un convertisseur n'aille chercher les métadonnées à part, elles ont donc simplement disparu.

L'outil d'ici copie le bloc EXIF depuis le HEIC et l'écrit dans le JPEG : la date survit donc. Il y a une case, et elle est cochée par défaut. Décochez-la et le JPEG ressort avec l'image et rien d'autre.

Avant de décider, regardez la liste : la ligne de chaque photo dit si le fichier porte des coordonnées GPS, et elle le dit avant que quoi que ce soit soit converti. Si les photos partent quelque part de public, c'est la ligne à lire. Si elles partent dans votre propre bibliothèque, garder les métadonnées est presque certainement ce que vous voulez.

Une étiquette est changée quel que soit votre choix, et il vaut la peine de savoir pourquoi. Un HEIC enregistre sa rotation à deux endroits : dans le conteneur, et dans le bloc EXIF. Le décodeur applique la rotation du conteneur pendant le décodage : les pixels remis sont donc déjà dans le bon sens. Si l'EXIF disait encore « tournez ceci de 90 degrés », une visionneuse le ferait une seconde fois et toutes les photos verticales ressortiraient couchées. L'étiquette d'orientation est donc remise sur « image à l'endroit », et tout le reste est recopié exactement comme le téléphone l'avait écrit.

Si ce que vous voulez, c'est parcourir les étiquettes en détail, ou les retirer de photos qui sont déjà des JPEG, c'est un autre travail et il y a [un guide pour cela](https://abox.tools/fr/guides/supprimer-les-donnees-exif-et-gps/).

## Ce qui prend les gens au dépourvu

- **Un HEIC nommé « .jpg ».** Extrêmement courant : quelque chose l'a renommé en chemin sans le convertir, et c'est pourquoi il refuse toujours de s'ouvrir. Chaque fichier déposé sur le convertisseur est identifié par ses premiers octets plutôt que par son nom : celui-là fonctionne donc très bien. C'est aussi pourquoi un fichier qui est vraiment un JPEG se le fait dire au lieu d'être converti en une copie de lui-même.
- **Un fichier, plusieurs images.** Une rafale ou une Live Photo peut contenir plus d'une image fixe. Toutes sont converties, et les supplémentaires sont numérotées d'après le nom d'origine. La moitié vidéo d'une Live Photo est un fichier séparé que le téléphone garde à côté du HEIC : elle n'est donc pas là pour être convertie.
- **L'AVIF n'est pas du HEIC.** Ils se ressemblent, même conteneur et autre codec dedans, mais tous les navigateurs actuels ouvrent un AVIF nativement : il n'y a donc rien à convertir, et l'outil le dit au lieu de faire semblant de travailler.
- **Arrêter le problème à la source.** Sur le téléphone : Réglages → Appareil photo → Formats → Le plus compatible. Les nouvelles photos sont des JPEG à partir de là. Cela consomme plus de stockage et cela ne touche pas aux photos que vous avez déjà, mais cela veut dire ne plus jamais recommencer.
- **Le partage convertit, parfois.** Envoyer une photo par AirDrop ou par courriel vers un appareil non Apple remet souvent un JPEG, parce qu'iOS convertit en sortie. Si une photo est arrivée en HEIC quand même, c'est qu'elle est passée par un chemin qui ne le faisait pas.

## Comment savoir si un convertisseur envoie vos fichiers

Cela vaut pour n'importe quel outil, pas seulement celui-ci, et cela prend une quinzaine de secondes.

1. Ouvrez la page, puis ouvrez les outils de développement de votre navigateur et allez dans l'onglet « Réseau ».
2. Convertissez une photo, et regardez. Un outil qui décode sur votre machine ne fait aucune requête à cet instant. Un outil qui envoie en fait une de la taille de votre photo, et vous en voyez la taille.
3. Ou, plus simplement : chargez la page, coupez votre connexion, et essayez de convertir quelque chose. Un outil qui expédiait votre photo ailleurs pour la décoder s'arrête. Un outil qui emporte le décodeur non.

Le convertisseur d'ici est construit pour passer les deux vérifications, et il existe une version plus longue de cet argument dans [est-il sûr d'envoyer ses fichiers](https://abox.tools/fr/guides/est-il-sur-d-envoyer-ses-fichiers/).
