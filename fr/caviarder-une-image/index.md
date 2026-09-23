# Caviarder une image — masquer, pixelliser ou flouter

Ce que vous recouvrez est supprimé du fichier, pas dissimulé dedans.

> Recouvrez un nom, une adresse ou un numéro de compte sur une photo ou une capture, puis réenregistrez l'image : les pixels masqués disparaissent du fichier au lieu de rester sous un rectangle. Tout se passe dans le navigateur.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/caviarder-une-image/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos images. Il n'y a pas de serveur.

L'image est décodée, repeinte et réencodée par votre propre navigateur, avec les codecs qu'il embarque déjà. Cet outil n'a aucune fonction réseau, ni pour récupérer ni pour envoyer, et cela compte ici plus que presque partout ailleurs sur ce site : les images que l'on apporte à un outil de caviardage sont précisément celles où un nom, une adresse ou un numéro de compte reste lisible.

- ✗ Aucun envoi
- ✗ Aucun compte
- ✗ Aucun filigrane
- ✓ Fonctionne hors ligne
- ✓ Code ouvert

## Comment caviarder une image pour que le masqué disparaisse vraiment

1. **Choisissez l'image.** Une capture, un scan ou une photo : tout ce que votre navigateur sait ouvrir. Elle est lue directement sur votre disque et rien ne part nulle part pendant ce temps.
2. **Tracez un cadre sur ce que personne ne doit voir.** Puis un autre pour la suite. Un cadre se déplace en le faisant glisser, se redimensionne par ses poignées, ou s'atteint avec la touche Tab et se déplace avec les flèches. Ce qui apparaît sous le cadre est le résultat réel, dessiné par le code qui écrira le fichier.
3. **Choisissez le noir, la pixellisation ou le flou — et préférez le noir.** Un aplat noir ne laisse rien du tout. Pixelliser et flouter remplacent les pixels par des moyennes d'eux-mêmes : cela suffit pour un visage à l'arrière-plan, cela ne suffit pas pour ce qui se lit comme du texte.
4. **Appuyez sur « Caviarder et enregistrer », puis vérifiez le fichier.** L'image affichée ensuite est le fichier terminé, redécodé. Ouvrez-le dans un éditeur et cherchez un calque, ou essayez de sélectionner le texte masqué : il n'y a qu'une image plate, et ce que vous avez recouvert a été écrasé avant son écriture.

## La version longue

[Comment caviarder une image pour que le masqué disparaisse vraiment](https://abox.tools/fr/guides/caviarder-une-image/): Les rectangles noirs tracés par la plupart des logiciels reposent sur l'image et peuvent être écartés. Ce qui sépare un vrai caviardage d'un simple recouvrement, pourquoi un texte pixellisé peut être relu, et comment vérifier un fichier avant de l'envoyer.

## Aussi dans la boîte

- [Lecteur et effaceur EXIF](https://abox.tools/fr/supprimer-les-donnees-exif/): Voyez ce qu'une photo raconte sur vous. Puis retirez-le.
- [Visionneuse DICOM](https://abox.tools/fr/visionneuse-dicom/): Scanner, IRM, radio et échographie, avec le fenêtrage, l'en-tête et les mesures.
- [Image en ICO](https://abox.tools/fr/creer-un-favicon/): Une image en entrée. Toutes les tailles qu'un navigateur, Windows ou un Mac réclame, en sortie.
- [Image en data URI](https://abox.tools/fr/image-en-base64/): L'image entière en une ligne de texte. À coller directement dans du CSS ou du HTML.

## Questions

### Mon image est-elle envoyée quelque part ?

Non. Le fichier est décodé, caviardé et encodé par votre propre navigateur, sur votre propre matériel. Cet outil n'a aucune fonction réseau, il ne va jamais rien chercher et n'envoie jamais rien, et la `Content-Security-Policy` de la page nomme chaque adresse qu'elle peut contacter, dont aucune ne nous appartient. Chargez la page une fois, débranchez-vous d'internet : elle continue de fonctionner.

### La partie masquée a-t-elle vraiment disparu du fichier ?

Oui, et c'est la raison d'être de cet outil. L'image est décodée dans un tampon de pixels ; les cadres écrasent les pixels situés à l'intérieur ; le tampon est ensuite encodé en un nouveau fichier. Les valeurs d'origine ont quitté la mémoire avant que l'encodeur ne reçoive quoi que ce soit : il n'y a donc aucun calque à cacher, aucune annotation à retirer et aucun historique à annuler. Vous pouvez le vérifier comme vous vérifieriez l'affirmation de n'importe qui d'autre : ouvrez le résultat dans un éditeur d'images et cherchez un second calque, ou essayez de sélectionner le texte que vous avez recouvert.

### Une zone pixellisée ou floutée peut-elle être récupérée ?

Parfois, et c'est le point à lire avant de choisir. Un aplat noir remplace tout ce qui se trouve dessous par une couleur unie : rien ne survit, ni un contour, ni une moyenne, ni le nombre de caractères. La pixellisation remplace chaque bloc par la moyenne de ce bloc, et une grille de moyennes reste une mesure de ce qui se trouvait dessous : pour du texte dans une police ordinaire à une taille prévisible, des travaux publiés ont reconstitué l'original en rendant des chaînes candidates puis en comparant leurs moyennes. Le flou est une convolution, et les convolutions sont en principe inversibles. Pixellisez donc un visage à l'arrière-plan si vous le souhaitez, et masquez en noir tout ce qui se lit comme du texte.

### Pourquoi un rectangle noir tracé dans un logiciel de bureautique n'est-il pas la même chose ?

Parce que la plupart des logiciels enregistrent le rectangle à côté de l'image et non dedans. Une forme tracée dans un lecteur de PDF, une présentation, un traitement de texte ou un éditeur d'images à calques est un objet doté d'une position, posé sur la page : le déplacer, le supprimer ou ouvrir le fichier dans un autre logiciel restitue exactement ce qu'il recouvrait. Des tribunaux, des administrations et plus d'un journal ont publié des documents caviardés de cette façon. Ici, le rectangle n'est pas enregistré du tout : ce sont des valeurs de pixels écrites par-dessus celles qui s'y trouvaient.

### Les données EXIF et GPS sont-elles retirées aussi ?

Oui, par effet de bord. Enregistrer revient à encoder un canevas rempli de pixels, et un canevas ne porte aucune balise : le lieu, le modèle d'appareil, les dates et la vignette intégrée ne sont tout simplement pas écrits dans le nouveau fichier. La vignette compte ici : c'est une petite seconde copie de l'image, elle n'est pas toujours régénérée quand la photo est modifiée, et une photo caviardée qui voyage avec une vignette non caviardée annule tout le travail. Si vous voulez retirer les métadonnées sans que l'image soit réencodée, le [Lecteur et nettoyeur EXIF](https://abox.tools/fr/supprimer-les-donnees-exif/) réécrit le conteneur à la place.

### Quels formats sait-il lire et écrire ?

Il lit tout ce que votre navigateur sait décoder, c'est-à-dire en pratique JPEG, PNG, WebP, GIF, BMP et, sur la plupart des navigateurs actuels, AVIF. Il écrit JPEG, PNG et WebP, parce que ce sont les encodeurs livrés avec les navigateurs. En mode automatique, un JPEG ressort en JPEG et tout le reste en PNG : une photo garde ainsi un poids de photo, et le texte resté visible sur une capture reste net. Ce choix ne change rien au caviardage : les pixels ont déjà disparu quand l'encodeur les voit.

### Puis-je le faire sans souris ?

Oui. « Ajouter un cadre au centre » en pose un sur l'image, Tab passe d'un cadre à l'autre, les flèches déplacent celui qui a le focus et Alt avec les flèches le redimensionne ; Maj porte chaque pas à dix pixels et Suppr le retire. Chaque cadre dispose en outre, sous l'image, d'une ligne indiquant sa taille, sa position, son traitement et un bouton pour le supprimer : l'outil entier s'utilise au clavier et se lit avec un lecteur d'écran.

### Est-ce que cela marche sur téléphone ?

Oui. Tracer, déplacer et redimensionner passent par des événements de pointeur et non de souris : un doigt fonctionne pareil, et les poignées sont dessinées plus grandes sur un écran tactile. L'image à l'écran est redessinée à la taille de l'écran pendant que vous travaillez ; le fichier, lui, est toujours caviardé à sa pleine résolution au moment où vous appuyez sur le bouton.

### Est-ce gratuit, et faut-il un compte ?

C'est gratuit, et il n'y a ni compte, ni inscription, ni période d'essai, ni filigrane. Il n'y a pas non plus de limite de taille d'image, parce qu'aucun serveur ne la paie : le travail se fait sur votre propre machine. Le site affiche de la publicité, et c'est elle qui le finance ; les annonces ne reçoivent rien de vos images.

## Comment cette promesse se vérifie

- **Vos images n'ont nulle part où aller.** La Content-Security-Policy nomme chaque adresse que cette page peut contacter, et aucune ne nous appartient. Il n'existe ici aucun point de collecte où vos fichiers pourraient arriver, ni rien dans le code qui les y enverrait s'il en existait un.
- **Les pixels recouverts disparaissent ici, pas en chemin.** L'image est décodée dans un tampon de pixels, les cadres sont écrits dans ce tampon, et le tampon est remis à l'encodeur. Il n'existe dans cette page aucune version de l'image où les cadres seraient un calque séparé, parce qu'une telle version n'est jamais créée : voir `src/redact.js`.
- **Rien ici ne va chercher quoi que ce soit.** Il n'y a ni `fetch`, ni `XMLHttpRequest`, ni `sendBeacon` nulle part dans `src/`. Le travail, c'est `getImageData`, trois boucles sur les octets et `canvas.toBlob`, tout cela déjà installé dans votre navigateur.
- **Les cadres ne sont signalés nulle part.** Où vous avez tracé, combien de cadres, de quelle taille et avec quel traitement : tout cela reste dans la mémoire de cette page jusqu'à ce que vous la fermiez. Aucun événement de mesure de ce dépôt ne transporte quoi que ce soit de tout cela, et l'unique question posée après un téléchargement envoie un pouce levé ou baissé et le nom de l'outil, rien d'autre.
- **Cela fonctionne hors ligne.** Débranchez le réseau : l'outil est identique, parce qu'il n'a jamais comporté d'étape réseau. C'est la preuve la plus simple de toutes, et celle qu'il vaut mieux faire avant de caviarder un passeport.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, `src/redact.js` pour les trois fonctions qui écrasent les pixels, et `src/preview.js` pour comprendre pourquoi ce qui s'affiche à l'écran est dessiné par ces mêmes trois fonctions.
