# QR & code-barres — créer un QR code ou un code-barres, hors ligne

Vous le tapez, cela devient un code. Rien n'est envoyé pour en fabriquer un.

> Créez un QR code pour un lien, un réseau Wi-Fi ou une carte de visite, ou un code-barres EAN-13, UPC-A, Code 128 ou Code 39. Téléchargez en SVG ou en PNG. Tout se passe dans votre navigateur.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/generateur-de-qr-code/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos codes et le texte qu'ils contiennent. Il n'y a pas de serveur.

Un QR code, c'est de l'arithmétique sur une chaîne de caractères : il n'y a pas de fichier à envoyer et pas de service à interroger. Chaque étape se passe dans un millier de lignes de JavaScript que vous pouvez lire, dans cette page : le choix du mode, celui de la version, la correction d'erreurs de Reed-Solomon, le masque, les barres d'un code-barres et la clé de contrôle en dessous. Cet outil n'a aucune fonction réseau, ce qui compte ici plus que sur la plupart des pages, puisque la chose encodée est souvent un mot de passe Wi-Fi.

- ✗ Sans envoi
- ✗ Sans compte
- ✗ Sans expiration
- ✓ Fonctionne hors ligne
- ✓ Open source

## Comment créer un QR code sans rien envoyer

1. **Choisissez le type de code.** Un QR code contient n'importe quoi et c'est ce qu'un appareil photo de téléphone cherche : c'est donc la réponse, sauf si on vous a dit autre chose. Un code-barres contient un nombre, et celui qu'il vous faut est décidé par qui va le scanner : un magasin veut un EAN-13 ou un UPC-A, un carton d'expédition un ITF-14, et tout ce qui est interne relève en général du Code 128.
2. **Dites ce qui va dedans.** Un lien est le cas courant, et les champs au-dessus construisent les autres formats que les téléphones connaissent : un réseau Wi-Fi qui propose de s'y connecter, une carte de visite qui propose d'être enregistrée, un courriel, un SMS, un numéro de téléphone, un point sur une carte. Quel que soit votre choix, la chaîne finie est affichée sur la page, et c'est tout ce qu'un QR code contient jamais.
3. **Choisissez combien de dégâts il peut encaisser.** Les quatre niveaux mettent plus ou moins de correction d'erreurs, et plus de correction veut dire un code plus grand et plus dense. Le L suffit pour un écran, le M pour du papier ordinaire, et le H pour ce qui sera manipulé, imprimé petit ou collé sur une vitrine au soleil. Un code sur un menu qu'on essuie tous les jours vaut un Q ou un H.
4. **Réglez la taille, la marge et les couleurs.** La marge fait partie du code : quatre modules de silence tout autour, voilà ce que demande la spécification, et la rogner est de loin la première raison pour laquelle un code imprimé refuse de se scanner. Sombre sur clair, avec un vrai contraste, car un scanner lit la différence entre les deux ; un gris pâle sur blanc ne convient pas, et le clair sur sombre échoue carrément sur bon nombre de lecteurs.
5. **Vérifiez-le avec le téléphone que vous avez.** Avant d'en imprimer mille, scannez celui qui est à l'écran. Cela prend dix secondes et attrape toute la catégorie d'erreurs qu'un aperçu ne peut pas voir : un mot de passe Wi-Fi avec un caractère qui demandait d'être échappé, un lien à qui il manquait son `https://`, un numéro de code-barres à qui il manque un chiffre.
6. **Prenez le SVG.** C'est le code sous forme d'instructions plutôt que de pixels : il s'imprime à n'importe quelle taille sans s'adoucir, et un bord adouci est précisément ce qu'un scanner ne sait pas résoudre. Prenez aussi le PNG si ce dans quoi vous collez refuse un SVG ; il est dessiné à un nombre entier de pixels par module, il n'a donc pas de bords flous non plus.

## La version longue

[Comment créer un QR code qui se scanne encore sur le téléphone d'un autre](https://abox.tools/fr/guides/creer-un-qr-code/): Quel niveau de correction d'erreurs choisir, pourquoi la marge blanche autour d'un QR code fait partie du code, à quelle taille l'imprimer, et ce que le code « dynamique » d'un générateur gratuit vous coûtera plus tard.

## Aussi dans la boîte

- [Lecteur de QR codes et de codes-barres](https://abox.tools/fr/lecteur-de-qr-code/): Visez un code, ou déposez-en une photo. La lecture se fait ici, et nulle part ailleurs.
- [Hachage & somme de contrôle](https://abox.tools/fr/verifier-une-somme-de-controle/): Vérifier un téléchargement face au nombre publié par son auteur, sans l’envoyer à personne.
- [Générateur de mot de passe & de phrase secrète](https://abox.tools/fr/generateur-de-mot-de-passe/): Fabriqué ici, par votre propre navigateur, et envoyé nulle part. Rien n'est enregistré et il n'y a pas d'historique.
- [Formateur JSON](https://abox.tools/fr/formater-du-json/): JSON, XML, HTML, CSS et YAML, mis en forme ou convertis. Rien n'est collé dans le serveur de quelqu'un d'autre.

## Questions

### Ce que je tape est-il envoyé quelque part ?

Non. Un QR code est de l'arithmétique sur une chaîne de caractères, et cette arithmétique tourne dans votre propre navigateur sur votre propre machine. Cet outil ne comporte aucune fonction réseau, si bien qu'il ne va jamais rien chercher et n'envoie jamais rien. Sa `Content-Security-Policy` énumère par ailleurs toutes les adresses que la page peut contacter, dont aucune n'appartient à ce site. Cela vaut plus ici que sur la plupart des pages, parce que la chose que les gens mettent le plus souvent dans un QR code est le mot de passe de leur Wi-Fi.

### Ces codes expirent-ils, ou cessent-ils de fonctionner un jour ?

Non, et ils ne le peuvent pas. Ce que vous tapez est ce que le code contient : le scanner rend donc exactement cette chaîne, pour toujours. Les codes qui expirent sont ceux qui ont l'adresse de quelqu'un d'autre dedans : un QR code « dynamique » contient un lien vers le serveur du générateur, qui redirige vers le vôtre, ce qui leur permet de compter chaque scan, de changer la destination, ou de tout éteindre quand une période d'essai se termine. Rien ici ne redirige par quoi que ce soit.

### Est-ce gratuit, et puis-je m'en servir commercialement ?

C'est gratuit, il n'y a pas de compte, pas de filigrane et aucune limite au nombre que vous en faites, et vous pouvez mettre le résultat sur un produit, une affiche ou une devanture. QR Code est une marque déposée de Denso Wave, qui a déclaré ne pas la faire valoir contre les gens qui utilisent les codes ; la spécification est publiée sous le nom ISO/IEC 18004 et reste libre d'implémentation, ce que fait cette page. Le site affiche de la publicité, et c'est elle qui le finance.

### Quel niveau de correction d'erreurs choisir ?

Le M, sauf raison particulière. Le L fait le code le plus petit et convient sur un écran ; le M survit à une manipulation ordinaire ; le Q et le H sont pour un code qui sera imprimé petit, plastifié, collé sur une vitre ou partiellement recouvert par un logo. Chaque cran ajoute des données de contrôle, ce qui demande un symbole plus grand pour la même quantité de texte, au point que passer de L à H double à peu près le nombre de modules pour la même chaîne.

### Combien un QR code peut-il contenir ?

À la plus grande taille, 177 modules de côté, jusqu'à 7 089 chiffres, 4 296 majuscules et chiffres, ou 2 953 octets de n'importe quoi d'autre, et cela à la correction d'erreurs la plus faible ; à la plus forte, c'est environ un tiers de cela. En pratique, la limite n'est pas le format mais le scanner : passé quelques centaines de caractères, les modules deviennent si petits qu'un appareil photo de téléphone ordinaire ne les résout plus à bout de bras. Un code long est en général le signe qu'un lien court aurait dû y aller à la place.

### Pourquoi mon code est-il plus gros quand j'écris le lien en minuscules ?

Parce qu'un QR code a un mode pour les majuscules et les chiffres qui tasse deux caractères en onze bits, et aucun mode équivalent pour les minuscules, qui coûtent huit bits chacune. Une URL écrite `HTTPS://EXEMPLE.COM/PAGE` peut être un tiers plus petite que la même URL en minuscules. Le schéma et l'hôte sont insensibles à la casse : les crier ne change rien d'autre que la taille. Le chemin après l'hôte, lui, n'est pas insensible à la casse, alors n'y touchez pas.

### Sait-il lire un QR code aussi bien qu'en fabriquer un ?

Pas cette page, mais celle d'à côté : [le lecteur](https://abox.tools/fr/lecteur-de-qr-code/) prend une photo, une capture d'écran ou votre caméra et vous rend la chaîne. C'est un travail nettement plus gros que d'en dessiner un — trouver le symbole dans une image, corriger l'angle de la prise de vue et réparer les dégâts sont trois problèmes que cette page n'a pas —, et c'est pourquoi c'est un outil à part et non un bouton ici. Il fonctionne aux mêmes conditions que tout le reste : rien n'est envoyé, et aucune image de la caméra n'est conservée.

### À quoi sert la marge, et puis-je la réduire ?

L'espace blanc autour d'un QR code fait partie du code. Un lecteur s'en sert pour trouver où le symbole s'arrête, et la spécification demande quatre modules de chaque côté ; un code-barres en veut une dizaine. Vous pouvez la mettre à zéro ici, et l'image aura l'air plus nette, mais bon nombre de scanners ne la verront alors plus du tout, surtout sur un fond chargé. Si c'est la place qui manque, faites le code plus petit plutôt que de rogner sa marge.

### De quel code-barres ai-je besoin ?

De celui que demande la personne qui va le scanner. L'EAN-13 est le code-barres du commerce hors Amérique du Nord et l'UPC-A celui d'Amérique du Nord, tous deux exigeant un numéro qui vous est attribué par GS1, parce que le numéro identifie votre entreprise et pas seulement le produit. L'EAN-8 est la version courte pour les petits emballages. L'ITF-14 va sur le carton d'expédition. Le Code 128 et le Code 39 contiennent du texte aussi bien que des chiffres et ne demandent aucun enregistrement, ce qui en fait la bonne réponse pour tout ce qui est interne : parc matériel, rayonnages, fiches de travail.

### Qu'est-ce qu'une clé de contrôle, et pourquoi l'outil en a-t-il ajouté une ?

C'est le dernier chiffre d'un code-barres du commerce, calculé à partir de ceux qui précèdent, pour qu'un scanner puisse distinguer une mauvaise lecture d'une bonne. L'EAN-13 veut douze chiffres et calcule le treizième ; l'UPC-A en veut onze et calcule le douzième. Tapez le numéro court et cette page l'ajoute. Tapez le numéro complet et elle vérifie celui que vous avez donné, puis refuse plutôt que de le corriger en silence, parce qu'un chiffre faux discrètement réparé, c'est une étiquette qui se scanne comme le produit de quelqu'un d'autre.

### Puis-je mettre un logo au milieu d'un QR code ?

Pas ici, mais la raison pour laquelle cela marche ailleurs vaut d'être sue : c'est la correction d'erreurs qui le rend possible. Au niveau H, environ 30 % des modules peuvent être détruits sans que le code cesse d'être lisible, si bien qu'un logo qui en couvre nettement moins au centre, là où ne se trouve aucun motif de repérage, est un dégât réparable. Passez le code dans votre logiciel d'image au niveau H, gardez le logo sous environ un cinquième de la surface, et testez-le avec un vrai téléphone plutôt que de lui faire confiance.

### Pourquoi le SVG vaut-il mieux que le PNG ?

Parce qu'un code, ce sont des bords, et qu'un PNG a un nombre fixe de pixels pour les faire. Agrandissez-en un et chaque bord s'adoucit ; or un bord adouci est précisément ce qui gêne un scanner, et une imprimante à 1200 DPI à qui on donne un PNG de 512 pixels se voit demander d'inventer la différence. Un SVG, ce sont les carrés sous forme d'instructions : il s'imprime net sur une carte de visite comme sur un panneau publicitaire. Le PNG proposé ici est dessiné à un nombre entier de pixels par module, ce qui est le mieux qu'un PNG puisse faire.

### Est-ce que cela fonctionne hors ligne ?

Oui. Chargez la page une fois, coupez ensuite votre connexion et elle continue de travailler. C'est aussi la façon la plus simple de prouver que rien n'est envoyé, car un outil qui expédierait votre texte ailleurs pour qu'on y dessine un code s'arrêterait à l'instant où vous débranchez.

## Comment cette promesse se vérifie

- **Ce que vous tapez n'a nulle part où aller.** La Content-Security-Policy énumère toutes les adresses que cette page peut contacter, et aucune n'appartient à ce site. Il n'existe ici aucun point de collecte où un mot de passe Wi-Fi pourrait aboutir, ni rien dans le code qui l'y enverrait s'il en existait un.
- **Rien ici ne va rien chercher.** On ne trouve ni `fetch`, ni `XMLHttpRequest`, ni `sendBeacon` nulle part dans `src/`. Le code est construit à partir de la chaîne par arithmétique et dessiné en SVG, dans cette page, sur votre machine.
- **Le code ne pointe pas vers nous.** Ce que vous tapez est ce que le code contient. Plusieurs générateurs gratuits vous rendent un code contenant un lien vers leur propre site, qui redirige ensuite vers le vôtre ; chaque scan est donc compté par eux, et le code cesse de fonctionner le jour où ils arrêtent de payer le domaine ou décident que l'offre gratuite a expiré. Rien ici ne raccourcit, ne redirige ni ne piste : la chaîne affichée sur la page est la chaîne qui est dans l'image.
- **Le PNG est fabriqué à partir du SVG affiché.** Le téléchargement n'est pas un second rendu qui pourrait contredire l'aperçu. Le même balisage est remis au navigateur et peint sur un canvas, ce qui explique aussi que cela se fasse sans contacter quoi que ce soit : il n'y a aucune police à récupérer et aucune image à charger dedans.
- **Ce que Google charge, et ce qu'on ne lui donne pas.** Les scripts publicitaires et de mesure viennent de Google, et le bouton de don de Buy Me a Coffee. Aucun d'eux ne reçoit quoi que ce soit de ce que vous tapez. Chaque ligne qui transforme une chaîne en code est servie depuis cette origine et figure dans le dépôt.
- **Tout fonctionne hors ligne.** Coupez le réseau : l'outil reste identique, puisqu'il n'a jamais comporté la moindre étape réseau. C'est la preuve la plus simple de toutes.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, `src/qr-encode.js` et `src/qr.js` pour le QR code lui-même, les modes, la version et les blocs dans l'un, les motifs, le masque et les bits de format dans l'autre, puis `src/gf256.js` pour la correction d'erreurs et `src/barcode.js` pour les codes-barres.
