# Comment découper un GIF en images

Sortir les images demande un glisser-déposer et un bouton. Ce qui mérite d'être compris, c'est ce qu'est vraiment une « image » de GIF, car le format enregistre autre chose que ce que vous voyez — et c'est de là que vient votre quatorzième image, ce rectangle contenant une bouche.

[Ouvrir Découpeur de GIF](https://abox.tools/fr/decouper-un-gif-en-images/): Chaque image du GIF ressort en PNG.

Dernière mise à jour 26 août 2026

## La réponse courte

Ouvrez le [Découpeur de GIF](https://abox.tools/fr/decouper-un-gif-en-images/), déposez le GIF, et chaque image apparaît en PNG à télécharger — une par une, ou toutes dans une seule archive ZIP. Laissez les réglages tranquilles et vous obtenez exactement ce que la plupart des gens veulent dire : chaque image en entier, telle qu'elle se présente à ce moment de l'animation.

Le reste de cette page parle des trois choses qui surprennent ensuite : une image qui n'est qu'un petit morceau, une transparence qui devient noire ailleurs, et des durées qui n'existent plus dès que les images sont des fichiers séparés.

## Ce qu'est vraiment une image de GIF

Un GIF n'est pas une pile d'images. C'est *une* image, suivie d'une série de rustines.

Chaque image après la première n'enregistre que le rectangle qui a changé, accompagné d'une règle sur ce qu'il faut faire de la toile ensuite. Tout le reste à l'écran est simplement ce que les images précédentes y ont laissé. Une personne qui parle devant un mur immobile coûte un rectangle de visage par image au lieu d'une image entière par image, et c'est toute la raison pour laquelle un format sans compensation de mouvement et sans étape avec perte n'est pas complètement inutilisable.

Il y a donc deux réponses différentes, et aussi honnêtes l'une que l'autre, à « donne-moi l'image 14 », et l'outil propose les deux :

**L'image telle qu'elle apparaît.** L'image entière à cet instant : la quatorzième dessinée par-dessus tout ce qui précède. C'est le réglage par défaut, et c'est ce que vous voulez pour une planche-contact, une vignette, une image à publier, ou des images qui partent dans un logiciel de montage.

**Uniquement les pixels que cette image enregistre.** La rustine elle-même, à sa taille, à sa position, tout ce qu'elle ne porte pas restant transparent. L'image 14 fait peut-être ⁦60 × 40⁩ pixels de bouche. C'est la vue qui explique où sont passés les octets du GIF, et celle qu'il vous faut si vous modifiez l'animation au lieu d'y récolter des images.

Quand une image enregistrée ressemble à un fragment, votre fichier n'a aucun problème. C'est le fichier.

![Douze images numérotées d'une animation, chacune montrée comme une image entière avec le temps pendant lequel elle reste affichée.](https://abox.tools/screens/split-a-gif-into-frames/frames.webp)

Chaque image comme une image entière, ce qui n'est pas ce que contient le fichier : cette section porte sur la différence.

## La règle d'effacement, et pourquoi certaines images laissent des trous

Chaque image porte aussi l'une des quatre instructions sur ce qui arrive à son rectangle avant que la suivante ne soit dessinée. L'outil l'affiche sous chaque image dans la vue de ce qui est enregistré :

**Reste à l'écran.** Le cas courant. La rustine reste là où elle a atterri et l'image suivante dessine par-dessus.

**Efface sa zone ensuite.** Le rectangle est nettoyé avant que l'image suivante n'arrive. C'est ce que fait une animation avec un objet transparent en mouvement, et c'est aussi la cause classique des GIF qui clignotent.

**Restaure ce qu'il y avait dessous.** La toile revient à ce qu'elle était avant que cette image ne dessine — un tampon, puis une annulation. Rare, et c'est celle que les lecteurs de GIF faits maison ratent le plus souvent.

Un détail à connaître si vous comparez des outils : la spécification dit qu'« efface sa zone » devrait restaurer la *couleur de fond*, mais tous les navigateurs depuis les années 1990 effacent vers le *transparent*, parce que c'est ce que supposaient les animations de l'époque. Cet outil suit délibérément les navigateurs, pour que les images que vous récupérez soient les images que vous avez vues.

![La carte des réglages : un choix entre l'image telle qu'elle apparaît et le fragment brut stocké dans le fichier, avec une couleur de fond pour les parties transparentes.](https://abox.tools/screens/split-a-gif-into-frames/settings.webp)

Le mode tel qu'il apparaît rejoue les règles d'effacement et vous rend des images. L'autre vous rend ce qu'il y a vraiment dans le fichier, trous compris.

## Ce que devient la transparence

La transparence du GIF tient sur un bit. Un pixel est peint ou invisible, et il n'y a rien entre les deux — pas de bord doux, pas d'ombre partielle. C'est pour cela qu'un GIF à fond transparent a ce contour dur et un peu dentelé.

Le PNG enregistre exactement cela, sans perte, si bien que les images sortent avec leur transparence intacte et que rien n'est inventé. Gardez-la si les images partent quelque part qui comprend la transparence.

Remplissez-la d'une couleur dans le cas contraire. Un logiciel qui ignore une couche alpha l'affiche en général en noir : une image qui allait très bien dans le navigateur arrive donc sur fond noir — et une rustine enregistrée, transparente presque partout, arrive en rectangle noir avec une bouche dedans. Choisir la couleur au départ règle la question. Elle est écrite dans le PNG et ne peut plus être retirée ensuite, ce qui est la seule raison pour laquelle ce n'est pas le réglage par défaut.

## Les durées, que les images ne peuvent pas porter

Un PNG n'a nulle part où noter combien de temps il est resté à l'écran. Découpez une animation en PNG et les durées disparaissent, ce qui compte dès l'instant où vous voulez tout remonter.

C'est à cela que sert le `frames.txt` de l'archive. Il liste le délai, la position et la taille de chaque image, de sorte que l'animation peut être reconstruite dans le [Créateur de GIF](https://abox.tools/fr/creer-un-gif/) ou ailleurs. Cela coûte quelques kilo-octets, et il n'y a aucun moyen de le reconstituer plus tard.

Deux choses au sujet des délais de GIF qui prennent tout le monde de court :

**L'unité est le centième de seconde**, donc le pas le plus fin du format est 0,01 s. Un GIF exactement à 30 i/s, cela n'existe pas : 0,03 s par image font 33,3 i/s et 0,04 s font 25.

**Tout ce qui est sous 0,02 s est joué à 0,10 s.** Les navigateurs plafonnent cela depuis les années 1990 — une règle écrite pour les globes tournants de l'époque et jamais retirée. Un GIF dont le fichier annonce 0,01 s par image revendique 100 i/s et se joue à 10. L'outil affiche le délai tel qu'il est réellement joué, et indique à côté ce que contient le fichier lorsque les deux diffèrent, parce que cet écart explique qu'un GIF découpé puis remonté puisse ressortir plus lent que l'original.

## Les numéros d'image, et pourquoi ils sont complétés par des zéros

Les images sortent en `nom-001.png`, `nom-002.png`, numérotées à partir de un et complétées à la largeur du dernier numéro. Ce n'est pas de la décoration : `image9.png` se classe *après* `image10.png` dans tous les gestionnaires de fichiers et dans la plupart des logiciels qui importent une séquence, parce qu'ils trient du texte et non des nombres. Des noms complétés se classent correctement partout, et tout logiciel de montage qui importe une séquence d'images les attend ainsi.

Alléger une longue animation en « gardant une image sur deux » ne renumérote rien. L'image 42 s'appelle toujours 42, si bien que les fichiers se recoupent avec l'original et avec la liste des durées.

## Pourquoi cela n'a pas besoin d'un serveur

Lire un GIF, ce sont deux travaux : parcourir les blocs du fichier, et défaire la compression LZW dans laquelle ses pixels sont emballés. Ensemble cela fait quelques centaines de lignes, elles sont écrites noir sur blanc dans le dépôt, et elles s'exécutent sur votre propre machine — c'est pourquoi la page continue de fonctionner le réseau débranché.

Votre navigateur sait déjà jouer un GIF, mais il ne vous en donne pas les morceaux : une balise `<img>` vous donne une animation, en dessiner une sur une toile vous donne la première image pour toujours, et la seule interface qui va plus loin manque à Safari. Le format est donc lu ici même, de la même façon dans tous les navigateurs — et le lire soi-même est aussi ce qui rend possible de vous montrer les rustines et les règles d'effacement.

[Est-il sûr d'envoyer ses fichiers à un convertisseur en ligne ?](https://abox.tools/fr/guides/est-il-sur-d-envoyer-ses-fichiers/) détaille quatre vérifications qui vous diront la même chose de n'importe quel outil, celui-ci compris.
