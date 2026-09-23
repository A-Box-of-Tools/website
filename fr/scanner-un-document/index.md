# Scanner de documents — une photo de page, redressée

Photographiez la page. Vous récupérez quelque chose qui a l'air scanné.

> Transformez la photo d'une page prise au téléphone en un PDF redressé et éclairé uniformément. Les coins sont trouvés pour vous, la perspective est défaite, l'ombre est divisée. Tout se passe dans votre navigateur : rien n'est envoyé.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/scanner-un-document/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos documents. Il n'y a pas de serveur.

La photo est décodée, redressée, nettoyée et écrite dans un PDF par votre propre navigateur, avec rien d'autre que du calcul et les codecs qu'il embarque déjà. Cet outil n'a aucune fonction réseau, ni pour récupérer ni pour envoyer, et la raison pour laquelle cela compte ici tient à ce dont les gens photographient les pages : un passeport, une fiche de paie, un bail, un formulaire qu'une administration a demandé « scanné ».

- ✗ Aucun envoi
- ✗ Aucun compte
- ✗ Aucun filigrane
- ✓ Fonctionne hors ligne
- ✓ Code ouvert

## Comment scanner un document avec l'appareil photo du téléphone

1. **Photographiez la page.** D'au-dessus, avec la page entière dans le cadre et les quatre coins visibles ou presque. Il n'est pas nécessaire d'être perpendiculaire ni d'avoir un éclairage uniforme : l'inclinaison et l'ombre sont précisément ce à quoi sert cet outil. Ce qui compte, c'est de remplir le cadre : une page photographiée depuis l'autre bout de la pièce n'a plus de détail à récupérer.
2. **Vérifiez les quatre coins.** Ils sont trouvés pour vous à la lecture de la photo, et la page le dit quand elle n'est pas sûre : une page posée sur un bureau de la même couleur a un bord réellement difficile à voir. Appuyez n'importe où sur la photo et le coin le plus proche vient sous votre doigt, ou atteignez-en un avec `Tab` et déplacez-le avec les flèches.
3. **Décidez du sort de la lumière.** « Couleur, égalisée » mesure le papier sur toute la page et le divise, si bien que l'ombre disparaît et qu'un tampon ou une signature gardent leur couleur. « Noir et blanc » va plus loin et c'est ce qui rend un scan assez petit pour un courriel. Ce que vous voyez à l'écran est le résultat réel, produit par le code même qui écrit le fichier.
4. **Ajoutez les autres pages.** Chaque photo ajoutée devient une page de plus du même document, dans l'ordre de la liste, et chacune garde ses propres coins. Les flèches d'une page dans la bande la déplacent vers l'avant ou vers l'arrière.
5. **Enregistrez le PDF, et ouvrez-le avant de l'envoyer.** Le document est écrit ici, dans la mémoire de cette page. Rien n'a été envoyé pour le faire, et rien à son sujet n'a été rapporté nulle part.

## La version longue

[Comment scanner un document avec son téléphone](https://abox.tools/fr/guides/scanner-un-document-avec-son-telephone/): Ce qui sépare la photo d'une page d'un scan de cette même page : l'inclinaison, la lumière inégale et la taille du fichier. Comment prendre la photo, quoi corriger ensuite, et pourquoi rien de tout cela n'a besoin d'un serveur.

## Aussi dans la boîte

- [Extraire l'audio d'une vidéo](https://abox.tools/fr/extraire-l-audio-d-une-video/): Déposez une vidéo et repartez avec le son. L'image n'est jamais décodée, et rien n'est envoyé.
- [Découpeur audio](https://abox.tools/fr/couper-un-audio/): Marquez au vol les passages à garder. Ils vous reviennent en un seul fichier, coupé là où vous l'avez dit.
- [Éditeur audio](https://abox.tools/fr/modifier-un-audio/): La passer à l'envers, changer la vitesse, relever un enregistrement trop faible : tout cela ici, sur votre machine.
- [Fusion et division de PDF](https://abox.tools/fr/fusionner-des-pdf/): Des pages déplacées sans aller-retour vers un serveur.

## Questions

### Mon document est-il envoyé quelque part ?

Non. La photo est décodée, redressée, nettoyée et écrite dans un PDF par votre propre navigateur, sur votre propre matériel. Cet outil n'a aucune fonction réseau, il ne va jamais rien chercher et n'envoie jamais rien, et la `Content-Security-Policy` de la page nomme chaque adresse qu'elle peut contacter, dont aucune ne nous appartient. Chargez la page une fois, débranchez-vous d'internet : elle continue de fonctionner.

### Comment trouve-t-il les coins de la page sans modèle ?

En cherchant les quatre longues droites dont un rectangle est fait. La photo est réduite, le gradient est calculé — où l'image change, et dans quelle direction — et chaque pixel posé sur un bord vote pour la droite sur laquelle il se trouverait. Les droites fortes sont appariées en rectangles candidats, et chaque candidat est noté en parcourant ses quatre côtés : quelle part de chacun a réellement un bord dessous, et les quatre forment-ils la frontière d'une seule et même chose ? Une page est plus claire que ce qui l'entoure, ou plus sombre, mais elle l'est de la même façon sur ses quatre côtés, et c'est cela qui empêche de prendre une ligne de texte pour le bas de la page. Il n'y a aucun poids, rien n'est téléchargé, et le calcul est le même pour tous les documents qui y passent.

### Les coins trouvés sont faux. Et maintenant ?

Faites-les glisser. Les coins sont une position de départ et jamais une décision : le scan est pris là où les quatre finissent. Appuyez n'importe où sur la photo et le coin le plus proche saute sous votre doigt, ce qui est plus facile que d'atteindre une petite poignée, et les flèches déplacent le coin sélectionné pixel par pixel. La page vous dit aussi quand les coins sont une supposition plutôt qu'une trouvaille, et marque cette page dans la bande : la raison habituelle est une page posée sur un bureau à peu près de sa couleur, parce qu'il n'y a alors vraiment presque aucun bord à trouver.

### Pourquoi la page redressée sort-elle à la bonne forme et non écrasée ?

Parce que la forme est récupérée depuis la perspective plutôt que mesurée sur les bords. Une page photographiée de biais a son bord lointain raccourci, si bien que la méthode évidente — prendre la plus longue paire de bords opposés et appeler cela le rapport — produit un A4 visiblement trapu, ce que donnent la plupart des scanners en ligne. La photo d'un rectangle porte en réalité assez d'information pour récupérer à la fois les proportions du rectangle et la focale de l'appareil, pourvu que ce soit un appareil ordinaire ; c'est un résultat de Zhang et He de 2003, et c'est ce que fait `src/geometry.js`. Là où la photo a été prise perpendiculairement, il n'y a pas de perspective d'où partir et il n'en faut pas, puisque les bords sont alors exacts : l'outil s'y rabat, et la page dit laquelle des deux a répondu.

### Que fait exactement le « nettoyage » à l'image ?

Il divise la lumière. La clarté du papier lui-même est mesurée sur toute la page — une grille de tuiles, et dans chaque tuile un centile élevé de la clarté, que le texte est trop sombre et trop clairsemé pour déplacer — et chaque pixel est divisé par le papier estimé en ce point. Ce qui reste, c'est l'encre, uniformément éclairée, sans l'ombre et sans la chute vers les bords. Ce n'est pas la même chose que de monter le contraste : monter le contraste d'une page photographiée rend la partie claire blanche, la partie sombre noire et l'écriture de la partie sombre illisible, et c'est pourquoi les « niveaux automatiques » empirent ces images au lieu de les améliorer.

### Pourquoi le mode noir et blanc est-il tellement plus petit ?

Parce qu'une image à deux couleurs représente réellement une fraction des données d'une image à seize millions, et parce qu'elle est stockée ainsi ici : un bit par pixel, empaquetés par huit dans un octet et compressés exactement, plutôt qu'en JPEG d'une image en noir et blanc. Sur les mêmes pages, cela sort environ dix-huit fois plus petit que le mode couleur, si bien qu'un contrat de vingt pages passe sous le mégaoctet au lieu d'en peser une quinzaine. Le seuil est celui de Sauvola, qui décide chaque pixel face à la moyenne et à la dispersion de son propre voisinage plutôt que face à un nombre unique pour toute la page, et c'est cela qui garde lisible l'écriture prise dans une ombre. Il n'a pas de demi-teintes, une page portant une photographie devrait donc utiliser l'un des autres modes.

### Puis-je mettre plusieurs pages dans un seul PDF ?

Oui. Chaque photo ajoutée devient une page de plus, dans l'ordre de la liste, et chaque page garde ses propres coins : une pile de pages photographiées les unes après les autres devient donc un document. Les flèches de chaque page dans la bande la déplacent vers l'avant ou vers l'arrière. Le réglage de nettoyage est commun à toutes, et c'est volontaire : des pages nettoyées différemment dans un même document ressemblent à deux documents.

### Lit-il le texte, pour que je puisse chercher dans le PDF ?

Non. Il n'y a ni couche de texte ni reconnaissance de caractères : ce qui sort est une image de la page sur une page. Le faire correctement supposerait un moteur d'OCR, soit des dizaines de mégaoctets de modèle à télécharger, et un scanner de documents qui irait chercher un modèle avant de pouvoir lire votre fiche de paie serait un scanner de documents ayant une raison de téléphoner à la maison au sujet des fiches de paie. Si vous avez besoin du texte, le mode noir et blanc produit exactement le type de fichier avec lequel les logiciels d'OCR de votre propre machine travaillent le mieux.

### C'est sorti flou. Pourquoi ?

Presque toujours parce que la page était petite dans la photo. Le panneau sous l'aperçu indique quelle part du cadre la page occupait et à combien de points par pouce cela revient à peu près sur une feuille de cette taille : en dessous d'environ 150 DPI, un scan imprimé paraît mou, et contre du détail qui n'a jamais été dans le fichier, aucun outil ne peut rien. Approchez-vous plutôt que de zoomer, tenez immobile, et laissez l'appareil faire le point sur la page avant de déclencher. Le bougé est l'autre cause, et il ne se récupère pas davantage.

### Est-ce gratuit, et faut-il un compte ?

C'est gratuit, et il n'y a ni compte, ni connexion, ni période d'essai, ni limite de pages, ni filigrane. Il n'y a pas non plus de limite à la taille des photos, parce qu'aucun serveur ne les paie : le travail se fait sur votre propre machine. Le site porte de la publicité, et c'est elle qui le paie ; on ne donne rien aux annonces sur vos documents.

## Comment cette promesse se vérifie

- **Vos documents n'ont nulle part où aller.** La Content-Security-Policy nomme chaque adresse que cette page peut contacter, et aucune ne nous appartient. Il n'y a ici aucun point de collecte où vos photos pourraient atterrir, ni de code qui les enverrait s'il y en avait un.
- **Il n'y a pas de modèle, donc rien à télécharger et rien à demander.** Trouver les quatre coins d'une page est du calcul : le gradient de l'image, un vote pour les droites qu'elle contient, et une vérification de ce qui se trouve réellement sous chaque côté du rectangle gagnant. Aucun poids, aucun moteur d'inférence, rien qui se télécharge à la première utilisation, et rien qui se comporte autrement sur le document de quelqu'un d'autre que sur le vôtre. Voir `src/detect.js`.
- **Le document ne porte ni date, ni auteur, ni nom de machine.** Un scan est une chose que l'on envoie à d'autres, le plus souvent parce qu'une administration l'a demandé. La seule chose écrite dans le PDF en dehors des pages elles-mêmes est le nom de cet outil, et un titre si vous en saisissez un. Aucune date de création, aucun auteur, aucun numéro de série, et rien tiré de votre horloge, de vos noms de fichiers ou de votre ordinateur. Voir `src/document.js`.
- **Rien ici ne va chercher quoi que ce soit.** Il n'y a aucun `fetch`, aucun `XMLHttpRequest` et aucun `sendBeacon` nulle part dans `src/`. Le travail, c'est un `getImageData`, quelques boucles sur les octets et l'encodeur JPEG du navigateur lui-même : tout cela est déjà installé sur votre machine.
- **Il fonctionne hors ligne.** Débranchez-vous du réseau et l'outil ne change pas, parce qu'il n'y a jamais eu d'étape réseau dedans. C'est la preuve la plus simple de toutes, et celle qu'il vaut la peine de faire avant de scanner un passeport.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, `src/detect.js` pour la façon dont les coins sont trouvés sans le moindre modèle, `src/warp.js` pour le redressement, et `src/clean.js` pour la façon dont la lumière inégale est divisée.
