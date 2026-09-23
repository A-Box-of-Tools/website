# Comment créer un QR code qui se scanne encore sur le téléphone d'un autre

Créer un QR code prend une seconde. En créer un qui fonctionne sur un menu mouillé, un abribus, ou un téléphone tenu à bout de bras dans une mauvaise lumière demande quatre décisions, et toutes les quatre se prennent avant que vous imprimiez quoi que ce soit. Voici ce que chacune fait.

[Ouvrir Générateur de QR codes et de codes-barres](https://abox.tools/fr/generateur-de-qr-code/): Vous le tapez, cela devient un code. Rien n'est envoyé pour en fabriquer un.

Dernière mise à jour 26 août 2026

## La réponse courte

Ouvrez le [générateur de QR codes et de codes-barres](https://abox.tools/fr/generateur-de-qr-code/), collez votre lien, laissez le niveau sur **M** et la marge sur **4**, et téléchargez le SVG. Imprimez-le sur au moins deux centimètres de large, sur un support mat, sombre sur clair. Scannez ensuite l'exemplaire imprimé avec un téléphone qui n'est pas le vôtre avant d'en commander mille.

Cela couvre à peu près tous les cas. Le reste de cette page est pour les autres : un code qui doit survivre à la manipulation, un code avec un logo dessus, un code destiné à un petit support, et la seule décision facile à rater d'une façon dont vous ne vous apercevrez qu'un an plus tard.

## Ce qu'il y a réellement dans un QR code

Une chaîne de caractères. C'est tout. Scanner un QR code remet au téléphone un morceau de texte, et tout le reste, qu'il s'agisse d'ouvrir une page, de rejoindre un réseau ou de proposer d'enregistrer un contact, c'est le téléphone qui reconnaît la forme de ce texte et propose d'agir dessus.

Il n'existe donc pas de « QR code Wi-Fi » comme genre de code. Il existe un QR code contenant `WIFI:T:WPA;S:Mon Réseau;P:le mot de passe;;`, que tous les téléphones fabriqués depuis dix ans savent lire. Le générateur vous montre la chaîne finie pour exactement cette raison : quand un code ne fait pas ce que vous attendiez, la chaîne est la seule chose qui vaille d'être regardée.

Cela veut dire aussi qu'un QR code ne peut pas être changé une fois imprimé, ne peut prévenir personne, et ne peut pas expirer, sauf si quelqu'un y a mis un lien vers son propre serveur, ce qui est le sujet de la dernière section d'ici.

![Un code QR fini avec ses caractéristiques en dessous : la symbologie, la version, le niveau de correction d'erreurs et le nombre de caractères qu'il contient.](https://abox.tools/screens/make-a-qr-code/result.webp)

Ce qu'il y a dans le code, dit dans les termes qu'emploie le reste de ce guide. La version grandit avec le contenu, et c'est pour cela que les deux réglages du dessous comptent.

## Décision un : le niveau de correction d'erreurs

Un QR code transporte un jeu de mots de contrôle à côté des données, calculés pour qu'un lecteur puisse reconstruire ce qu'il n'a pas pu voir. C'est pourquoi un code auquel il manque un coin se scanne encore. Le nombre de ces mots de contrôle, c'est le niveau, et il y en a quatre :

- **L**, environ 7 % du code peut être perdu.
- **M**, environ 15 %.
- **Q**, environ 25 %.
- **H**, environ 30 %.

Plus de correction n'est pas gratuit : les données de contrôle vont dans le même carré, si bien que le même texte au niveau H demande un code plus grand et plus dense qu'au niveau L. En gros, passer de L à H double le nombre de modules pour la même chaîne, et des modules plus denses sont plus difficiles à résoudre pour un appareil photo. Il y a là un vrai marché, et la réponse dépend de la destination du code.

**L** est pour un écran : un code dans une diapositive, un courriel, une page web. Rien ne va l'abîmer et chaque module supplémentaire le rend plus difficile à lire de loin.

**M** est le défaut et la bonne réponse pour la plupart des impressions. Du papier qui sera un peu manipulé, un prospectus, une carte de visite.

**Q et H** sont pour les codes qui vont être malmenés : un menu essuyé tous les jours, un autocollant sur une machine d'atelier, une étiquette sur une caisse, un code en vitrine qui prend le soleil direct. Le H est aussi ce qui rend possible un logo au milieu, comme on le verra plus bas.

![Les options du QR : un menu de niveau de correction d'erreurs réglé sur moyen, et une zone de silence de quatre modules.](https://abox.tools/screens/make-a-qr-code/options.webp)

Les deux servent à ce que le code survive au monde réel, un pli, un logo, une mauvaise impression, et les deux se règlent avant qu'il ne soit dessiné.

## Décision deux : la marge, qui fait partie du code

L'espace blanc autour d'un QR code n'est pas du remplissage, et ce n'est pas un choix graphique. Un lecteur s'en sert pour trouver où le symbole s'arrête. La spécification demande quatre modules de silence de chaque côté, et un code rogné au ras du bord est de loin la première raison pour laquelle un code imprimé échoue.

Cela mérite d'être dit sans détour parce que le rognage est une chose si naturelle à faire. Le code a l'air d'avoir trop de blanc autour : il se fait donc recadrer dans la maquette, ou poser sur un aplat de couleur qui vient jusqu'aux carrés, ou posé sur une photographie. Chacune de ces opérations retire la frontière dont le lecteur allait se servir.

Si le code paraît trop grand avec sa marge, faites le code plus petit. Ne retirez pas la marge.

## Décision trois : à quelle taille l'imprimer

La règle empirique qui a survécu au contact du réel est **un pour dix** : un code doit faire environ un dixième de la distance depuis laquelle il sera scanné.

- Une carte de visite ou un menu, lus à 30 cm : environ 2 cm de côté.
- Une affiche lue à deux mètres : environ 20 cm.
- Un abribus ou une vitrine lus à cinq mètres : environ 50 cm.

Deux centimètres est un plancher plutôt qu'une cible. En dessous d'environ 1,5 cm, un téléphone ordinaire commence à peiner quelle que soit la qualité de l'impression, parce que les modules individuels approchent la taille d'un pixel de son capteur.

Moins de texte veut dire moins de modules, ce qui veut dire un code qui se lit de loin pour une taille imprimée donnée : bonne raison de pointer un code vers `exemple.com/x` plutôt que vers une URL avec cent caractères de paramètres de suivi à la fin.

Et imprimez depuis le **SVG**. Un QR code est fait de bords, et un PNG a un nombre fixe de pixels pour les faire ; agrandissez-en un et chaque bord s'adoucit, ce qui est précisément ce qui gêne un scanner. Un SVG, ce sont les carrés sous forme d'instructions : il ressort net sur une carte de visite comme sur un panneau publicitaire.

## Couleur, contraste, et les deux erreurs

Un lecteur mesure la différence entre les modules sombres et les clairs : le contraste, c'est tout. Deux choses tournent mal régulièrement :

**Un code clair sur fond sombre.** C'est spectaculaire, et bon nombre de lecteurs le refusent d'emblée : ils cherchent du sombre sur clair et n'essaient pas l'inversion. Certains le font. Vous ne saurez pas lesquels vos clients ont.

**Pas assez d'écart.** Un gris moyen sur blanc, ou deux couleurs de marque de poids voisin, peuvent très bien se mesurer à l'écran et échouer sur le papier une fois l'étalement de l'encre et l'exposition automatique d'un téléphone entrés en jeu. Si vous colorez un code, gardez la partie sombre réellement sombre.

Le mat bat le brillant pour tout ce qui sera scanné sous une lampe, et les deux battent l'impression sur une photographie. Les fonds transparents sont utiles pour poser un code sur un aplat de couleur, mais vérifiez ce qui finit derrière, parce qu'un code transparent sur un aplat sombre est la première erreur ci-dessus avec des étapes en plus.

## Un logo au milieu

Cela fonctionne, et cela fonctionne grâce à la correction d'erreurs plutôt que malgré elle. Au niveau H, environ 30 % des modules peuvent être détruits sans que le code cesse d'être lisible : un logo qui en couvre nettement moins, au centre, là où ne se trouve aucun motif de repérage, est un dégât que le lecteur répare.

Trois règles à tenir. Utilisez le niveau H. Gardez le logo sous environ un cinquième de la surface, bien en deçà de la limite théorique, parce que l'impression n'est pas la seule chose à grignoter votre marge. Et ne couvrez jamais les trois grands carrés des coins ni les plus petits qui les accompagnent : c'est ainsi qu'un lecteur trouve et oriente le symbole en premier lieu, et aucune correction d'erreurs ne les reconstruit.

Testez-le ensuite sur de vrais téléphones. Un logo fait passer un code de « marche toujours » à « marche avec cette marge-là », et le seul moyen de savoir combien de marge il reste est d'essayer.

## La décision qu'on regrette : statique ou « dynamique »

Cherchez un générateur de QR code et la plupart des résultats voudront que vous créiez un compte, parce qu'ils vendent des codes *dynamiques*. Un code dynamique ne contient pas votre lien. Il contient un lien court vers le serveur du générateur, qui redirige vers le vôtre.

Ce que cela vous rapporte est réel : vous pouvez changer la destination du code après l'impression, et vous obtenez un décompte de chaque scan. Pour une campagne à six chiffres d'exemplaires, cela vaut qu'on paie.

Ce que cela coûte est réel aussi, et vaut d'être su avant plutôt qu'après :

- **Le code cesse de fonctionner quand ils cessent de fonctionner.** Si le service ferme, si le domaine expire, ou si l'offre gratuite se termine, chaque code que vous avez imprimé meurt, et à ce moment-là ils sont sur dix mille menus.
- **Chaque scan est la donnée de quelqu'un d'autre.** La redirection voit l'adresse IP, l'heure et l'appareil de chaque personne qui scanne votre code.
- **Le lien est le leur, pas le vôtre.** Quiconque le scanne voit passer un domaine inconnu, ce dont on dit précisément aux gens de se méfier.

La voie du milieu ne coûte rien : faites un QR code statique autour d'une URL courte *sur votre propre domaine*, et redirigez-la vous-même. Vous gardez la possibilité de changer la destination, vous gardez les statistiques, et rien du code ne dépend de la survie, l'an prochain, d'une entreprise que vous n'avez jamais rencontrée.

Le [générateur d'ici](https://abox.tools/fr/generateur-de-qr-code/) ne fait que des codes statiques, et il n'y a aucun compte à créer. Ce que vous tapez est ce que le code contient.

## Avant d'en imprimer mille

Scannez le code. Pas celui de votre écran, mais l'épreuve imprimée, à l'endroit où elle va, avec un téléphone qui n'est pas celui sur lequel vous l'avez fabriqué. Cela prend une minute et attrape toute la catégorie de problèmes dont parle cette page : une marge mangée par la maquette, un lien à qui il manque son `https://`, une couleur qui s'est mesurée autrement sur le papier, un code imprimé à une taille qui marche sur un bureau et pas sur un mur.

Et vérifiez ce qui se passe après le scan. Un code qui ouvre une page illisible sur un téléphone est un code qui a échoué, même s'il s'est scanné.

## Rien de tout cela n'exige d'envoyer quoi que ce soit

Un QR code est de l'arithmétique sur une chaîne de caractères. Il n'y a aucun fichier à envoyer et rien qu'un serveur puisse faire qu'un navigateur ne puisse pas, et c'est pourquoi [l'outil d'ici](https://abox.tools/fr/generateur-de-qr-code/) fait tout sur votre propre machine et fonctionne réseau débranché.

Cela compte plus que cela n'en a l'air, à cause de ce que les gens mettent dans les QR codes. L'usage le plus courant du format Wi-Fi, c'est le mot de passe réel d'un réseau, tapé dans une page web. Il vaut la peine de savoir si cette page avait quelque part où l'envoyer.
