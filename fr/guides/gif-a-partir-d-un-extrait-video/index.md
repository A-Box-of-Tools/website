# Comment faire un GIF à partir d'une partie d'une vidéo

Un GIF fait du clip entier est énorme, et presque tout dedans n'intéressait personne. Le travail tient en réalité en deux décisions — quelles secondes, puis quels réglages — et les deux se font sur votre propre machine, car aucun des deux outils n'envoie quoi que ce soit.

Dernière mise à jour 26 août 2026

## La réponse courte

Pour un seul moment continu, ouvrez le convertisseur [Vidéo en GIF](https://abox.tools/fr/video-en-gif/), déposez la vidéo et marquez la section sur sa timeline — il ne convertit que ce qui se trouve entre les marques, il n'y a donc rien à couper d'avance. Choisissez une largeur et une cadence, puis exportez.

Pour tout ce qui dépasse un seul moment — deux buts du même match, la préparation et la chute — assemblez d'abord le clip avec le [Découpeur vidéo](https://abox.tools/fr/couper-une-video/), puis confiez le résultat au convertisseur. Le découpeur joint autant de parties marquées que vous voulez en un seul fichier sans les réencoder : ce premier pas ne coûte rien en qualité et quelques secondes en temps.

Le passage se fait en un clic : une fois l'export terminé, une ligne sous le bouton de téléchargement propose de poursuivre avec le résultat dans le convertisseur, et le clip y arrive déjà chargé — rien à enregistrer ni à redéposer entre les deux.

Dans les deux cas, l'ordre est le même : décider des secondes d'abord, dépenser les réglages ensuite. Le reste de cette page explique pourquoi cet ordre compte tellement plus pour un GIF que pour tout ce que ce site fabrique d'autre.

## Pourquoi chaque seconde de GIF coûte si cher

Un GIF n'est pas de la vidéo. C'est une pile d'images complètes, chacune tirée d'une palette d'au plus 256 couleurs, compressée par un procédé de 1987 qui ignore tout du mouvement. Un codec moderne décrit ce qui a *changé* entre les images ; un GIF répète en grande partie ce qui est resté pareil.

Conséquence pratique : un GIF de dix secondes, large de 480 pixels, à 12 images par seconde, pèse couramment 5 à 10 Mo — dix fois le même clip en MP4, pour une fraction de la qualité. Le convertisseur n'y est pour rien ; le format est ainsi. Le [guide de conversion en GIF](https://abox.tools/fr/guides/transformer-une-video-en-gif/) explique quand un GIF vaut encore le coup, et quand une vidéo muette en boucle sert mieux.

Comme la taille grandit à chaque image, les mégaoctets les moins chers à économiser sont des secondes entières. Réduire la largeur de moitié divise la taille par quatre environ ; réduire la cadence de moitié la divise par deux environ ; mais couper des images qui n'auraient jamais dû être là économise leur coût entier et améliore le résultat — un GIF qui commence à l'action se lit mieux qu'un GIF qui passe deux secondes à y marcher.

## Quand la timeline du convertisseur suffit

La timeline du convertisseur marque une section : un début, une fin, et tout ce qui est entre les deux devient le GIF. Si le moment que vous voulez est continu — quelle que soit sa longueur — c'est tout le travail, et mettre le découpeur devant ne ferait que donner un second logis aux deux mêmes marques.

Posez les marques un rien trop serrées plutôt qu'un rien trop larges. Une boucle cache sa couture quand la dernière image se tient près de la première, et chaque image rasée aux extrémités se rembourse en taille de fichier.

![La carte de section : une image de vidéo avec un code temporel, et des points d'entrée et de sortie marqués à onze et quatorze secondes sur la barre du dessous.](https://abox.tools/screens/make-a-gif-from-part-of-a-video/marks.webp)

Le convertisseur a ses propres points d'entrée et de sortie, et pour un morceau de trois secondes tiré d'un plan plus long ils suffisent à eux seuls.

## Quand couper d'abord avec le Découpeur vidéo

Le découpeur gagne sa place dès que le GIF a besoin de plus d'un morceau :

- **Plusieurs moments, un GIF.** Marquez chaque partie avec `I` et `O` pendant que la vidéo joue, réordonnez si le meilleur passage doit ouvrir, et exportez un seul fichier. Les parties sont copiées, pas réencodées : l'assemblage ne perd rien.
- **Deux vidéos, un GIF.** Le découpeur accepte plusieurs fichiers et joint des parties marquées à travers eux — il copie quand les fichiers s'accordent sur leur format, réencode quand ils ne s'accordent pas, et dit ce qu'il a fait.
- **Vous voulez aussi le clip en vidéo.** Le MP4 assemblé vaut d'être gardé : il est plus petit et plus net que n'importe quel GIF qui en sortira, et c'est la bonne chose à poster partout où la vidéo se joue.

Déposez ensuite le clip assemblé dans le convertisseur et ne marquez rien : le fichier entier est désormais exactement le GIF que vous vouliez.

## Dépenser les réglages

Les secondes décidées, trois commandes fixent la taille, par ordre de coût :

- **La largeur.** Le plus gros levier. 480 pixels suffisent largement pour un chat ou un forum ; 320 reste lisible pour une capture d'écran sans texte. La taille tombe avec le carré de la largeur.
- **La cadence.** 10 à 12 images par seconde est le pays des GIF ; le mouvement se lit encore, et le fichier est moitié moindre qu'à 25. Sous 8, cela commence à ressembler à un diaporama.
- **Le tramage.** Avec 256 couleurs, les dégradés doux font des bandes. Le tramage ordonné échange ces bandes contre un motif fin ; c'est en général plus joli et un peu moins compressible. Essayez l'export des deux façons — c'est votre machine qui travaille, un second essai ne coûte rien et n'envoie rien.

## Si vous faites cela chaque semaine

Les deux étapes vivent ici sur deux pages, à dessein — chaque page fait un travail, et chacune peut prouver seule que rien ne quitte votre machine. Mais tout ce que ces pages exécutent est libre : licence MIT, un dossier par outil, des modules ES sans dépendances avec un README qui nomme chacun.

Alors si la même chaîne fait partie de votre semaine, inutile de la refaire à la main. Pointez un agent de code vers le [dépôt](https://github.com/A-Box-of-Tools/website) et demandez-lui de composer la logique de segments du découpeur et l'encodeur GIF en une seule page taillée pour votre cas. Les modules ont été écrits pour être lus, et les emporter est exactement ce à quoi sert la licence.
