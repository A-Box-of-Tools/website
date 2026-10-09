# Comment transformer une longue vidéo en timelapse

Une heure de coucher de soleil, une journée de chantier, le trajet quotidien à travers le pare-brise — des images qui valent la peine, à une vitesse que personne ne regardera. Le travail tient en une décision sur le temps et une sur la destination, et le tout tourne dans votre navigateur, sur un fichier qui ne quitte jamais votre machine.

[Ouvrir Créateur de timelapse](https://abox.tools/fr/faire-un-timelapse/): Une heure de rushes en vingt secondes.

Dernière mise à jour 26 août 2026

## La réponse courte

Ouvrez le [Créateur de timelapse](https://abox.tools/fr/faire-un-timelapse/), déposez l'enregistrement, et fixez soit une vitesse — n'importe quoi de 1,1× à 1000× — soit, sans arithmétique, la durée que doit faire le résultat. Soixante secondes est un bon défaut pour tout ce qui part vers un fil. Choisissez la cadence, réduisez la taille si l'original est en 4K, et exportez.

Si la destination n'anime que des GIF, passez ensuite le clip exporté par le convertisseur [Vidéo en GIF](https://abox.tools/fr/video-en-gif/) — mais lisez d'abord la dernière section, car un timelapse est la chose la plus chère qu'on puisse demander à un GIF de porter.

Ce trajet est prévu : après l'export, une ligne sous le bouton de téléchargement propose de poursuivre avec le résultat dans le convertisseur, et le clip y arrive déjà chargé.

## Dites la durée, pas la vitesse

« À quelle vitesse » est la mauvaise question, parce que la réponse honnête est une division que vous ne devriez pas avoir à faire : quatre-vingt-dix minutes d'images en une minute de résultat, c'est 90× ; une journée de chantier en trente secondes est plus près de 3000× que de tout ce qu'un curseur suggère. L'outil prend directement la durée finale et calcule le facteur lui-même, si bien que la réponse survit au jour où vous glissez un enregistrement plus long.

Ce à quoi un facteur de vitesse sert encore, ce sont les petits nombres. Entre 1,1× et 2×, une vidéo reste *regardable comme vidéo* — un cours, une démonstration — et au-dessus de 8× environ, elle cesse d'être une lecture rapide et devient un timelapse, où chaque image de sortie est un échantillon cueilli dans le flux du temps et où tout ce qui sépare les échantillons a simplement disparu.

Cet échantillonnage est aussi ce qui rend le travail rapide. L'outil ne lit que les instants dont la sortie a besoin — à 100×, environ un centième du fichier — au lieu de décoder une heure pour en garder une minute.

![La carte de vitesse : une vitesse de vingt fois, la durée qui en résulte, l'intervalle entre les images gardées, et une cadence d'images.](https://abox.tools/screens/turn-a-long-video-into-a-timelapse/speed.webp)

Dites la durée voulue et la vitesse suit, ou l'inverse. L'intervalle est le chiffre qui dit quelle part de l'original est sautée.

## Cadence et taille, en bref

- **La cadence.** 30 images par seconde se lit comme un mouvement fluide pour presque tout ; 60 ne mérite sa taille doublée que si le mouvement est le sujet, et 24 donne aux nuages et aux foules un joli tic-tac de cinéma.
- **La taille.** Un timelapse se regarde en général en petit. Réduire la 4K en 1080p divise par quatre les pixels que l'encodeur doit décrire, et sur un écran de téléphone personne ne le saura jamais.

![Le récapitulatif de la carte d'export : le nombre d'images, l'intervalle, la durée finale, la taille estimée et la part du fichier à lire.](https://abox.tools/screens/turn-a-long-video-into-a-timelapse/summary.webp)

La dernière ligne est celle qu'il faut remarquer : un accéléré ne lit qu'une fraction du fichier, et c'est pour cela que c'est rapide sur un plan qui mettrait une heure à être réencodé.

## Quand le timelapse veut être un GIF

La plupart du temps, il ne le veut pas. Un timelapse est un changement constant de l'image entière — exactement ce que la compression GIF fait le plus mal — si bien que même un court atterrit dans les dizaines de mégaoctets quand le MP4 en pèse le dixième, plus net. Postez la vidéo partout où la vidéo se joue.

Quand la destination n'anime vraiment que des GIF, coupez la séquence à quelques secondes bouclables dans la [timeline du convertisseur](https://abox.tools/fr/video-en-gif/), gardez la largeur modeste, et laissez la cadence descendre à ⁦10–12⁩. Le [guide du GIF partiel](https://abox.tools/fr/guides/gif-a-partir-d-un-extrait-video/) est la version longue de ce budget.

## Si vous faites cela chaque semaine

Les deux étapes vivent ici sur deux pages, à dessein — chaque page fait un travail, et chacune peut prouver seule que rien ne quitte votre machine. Mais tout ce que ces pages exécutent est libre : licence MIT, un dossier par outil, des modules ES sans dépendances avec un README qui nomme chacun.

Si une caméra sur trépied fait partie de votre routine, pointez un agent de code vers le [dépôt](https://github.com/A-Box-of-Tools/website) et demandez-lui de composer l'échantillonneur et l'encodeur GIF en une page où votre vitesse et votre taille sont déjà réglées. Les modules ont été écrits pour être lus, et les emporter est exactement ce à quoi sert la licence.
