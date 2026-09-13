# Compresser un PDF — alléger un document

Alléger un document sans l'envoyer où que ce soit.

> Alléger un PDF sans l'envoyer. Votre navigateur lit, recompresse et réécrit le fichier lui-même, après vous avoir montré où se trouve vraiment son poids.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/compresser-un-pdf/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos documents. Il n'y a pas de serveur.

Le document est ouvert, démonté et réécrit en mémoire sur cette machine, par du code servi depuis cette adresse. Rien ici ne sait faire un envoi, et il n'y a à l'autre bout de cette page aucun serveur pour en recevoir un.

- ✗ Sans envoi
- ✗ Sans compte
- ✓ Fonctionne hors ligne
- ✓ Open source
- ✓ Les fichiers restent sur votre appareil

## Comment alléger un PDF

1. **Choisissez un PDF.** Déposez-le sur la zone prévue ou sélectionnez-le à la main. Le navigateur le lit directement sur votre disque, sans que rien parte où que ce soit pendant ce temps.
2. **Regardez où est le poids.** La répartition fait tout l'intérêt de la deuxième étape. Si la barre est surtout faite d'images, cet outil a de quoi travailler. Si elle est surtout faite de polices et de contenu de page, il le dira, et l'économie honnête se comptera en quelques pour cent : autant le savoir avant d'y passer une minute.
3. **Dites jusqu'où serrer.** Les réglages nommés sont des résolutions, et non des mentions vagues : 96 DPI pour lire à l'écran, 130 pour envoyer par courriel, 220 pour ce qui doit encore s'imprimer. Chacun est comparé à la taille à laquelle l'image est réellement dessinée sur la page, si bien qu'une photo posée en vignette n'est pas traitée comme un scan pleine page.
4. **Compressez, puis lisez la ligne qui dit que c'est vérifié.** Une fois la réécriture faite, le fichier fini est rouvert par le même lecteur, sur cette page, et ses pages sont comptées. Si le compte ne correspond pas à l'original, l'opération est signalée comme échouée et aucun téléchargement n'est proposé.

## La version longue

[Comment alléger un PDF, et pourquoi certains ne maigrissent pas](https://abox.tools/fr/guides/reduire-la-taille-d-un-pdf/): Où se trouve vraiment le poids d'un PDF, pourquoi un scan perd 80 % et un contrat bouge à peine, ce que veut dire le DPI ici, et ce qu'un compresseur ne devrait jamais faire à votre document.

## Aussi dans la boîte

- [Caviardeur de PDF](https://abox.tools/fr/caviarder-un-pdf/): Les lettres sont supprimées du fichier, puis le fichier est fouillé pour le prouver.
- [Images en PDF](https://abox.tools/fr/images-en-pdf/): Réunir vos images dans un seul document.
- [Scanner de documents](https://abox.tools/fr/scanner-un-document/): Photographiez la page. Vous récupérez quelque chose qui a l'air scanné.
- [Extraire l'audio d'une vidéo](https://abox.tools/fr/extraire-l-audio-d-une-video/): Déposez une vidéo et repartez avec le son. L'image n'est jamais décodée, et rien n'est envoyé.

## Questions

### Mon PDF est-il envoyé quelque part ?

Non. Le fichier est lu, recompressé et écrit par votre propre navigateur sur votre propre matériel. Cet outil n'a pas de côté serveur, et sa `Content-Security-Policy` énumère toutes les adresses que la page peut contacter, dont aucune n'appartient à ce site. Il ne comporte aucune fonction réseau, pas même facultative.

### De combien mon PDF va-t-il maigrir ?

Cela dépend entièrement de ce qu'il contient, et c'est pour cela que l'outil mesure et vous montre avant de compresser quoi que ce soit. Un document numérisé n'est presque que des photographies et ressort couramment 60 à 90 % plus léger. Un contrat ou une thèse, en revanche, c'est du texte, du dessin vectoriel et des polices incorporées, tous déjà compressés par ce qui les a produits ; là, l'économie se limite en général à quelques pour cent, obtenus en réempaquetant le fichier et en jetant ce que plus rien ne référence. Tout outil qui promet un pourcentage fixe sans regarder votre fichier devine.

### Compresser un PDF fait-il perdre de la qualité ?

Les images qu'il contient sont réencodées, donc oui, pour elles. Rien d'autre n'y touche : le texte reste du texte, que l'on peut toujours sélectionner et rechercher, les polices sont gardées entières, et le dessin vectoriel est recopié à l'identique. L'outil refuse d'ailleurs d'abîmer une image pour rien, car si un réencodage ne ressort pas plus petit que l'original, ce sont les octets d'origine qui retournent dans le document, intacts.

### Qu'est-ce que le DPI ici, et pourquoi le demande-t-il ?

Un PDF enregistre la taille à laquelle chaque image est dessinée sur la page, ce qui permet à l'outil d'en déduire la résolution effective : un scan de 4000 pixels étalé sur vingt centimètres de papier transporte 500 pixels par pouce. Rien à l'écran et très peu de choses sur le papier ne savent en faire quoi que ce soit ; les pixels au-dessus du réglage que vous choisissez partent donc en premier, puisqu'ils coûtent une qualité que personne ne voit. C'est cette mesure qui fait qu'un logo posé en petit n'est pas traité comme un scan pleine page.

### Peut-il ouvrir un PDF protégé par mot de passe ?

Non, et c'est délibéré. Un document chiffré est refusé avec un message qui le dit, même quand le mot de passe est vide, ce qui est justement la façon dont enregistrent beaucoup de scanners et de photocopieurs. Retirer la protection d'un fichier est un autre métier que le compresser, et un outil qui s'en chargerait en silence ferait quelque chose que vous n'avez pas demandé.

### Y a-t-il des PDF qu'il ne sait pas compresser ?

Certaines images à l'intérieur, oui. Les images JPEG 2000, JBIG2 et codées fax (CCITT) n'ont de décodeur dans aucun navigateur : elles sont transmises intactes et signalées comme telles, les deux dernières étant des codecs bitonaux déjà proches de leur plus petite taille possible. Les images CMJN sont laissées tranquilles elles aussi, parce que les réencoder risquerait de déplacer les couleurs qu'une imprimerie produirait. Tout ce que l'outil laisse de côté est signalé dans les résultats, avec le motif.

### Le fichier compressé s'ouvrira-t-il encore partout ?

Oui. La sortie est écrite en PDF 1.5, que comprend tout lecteur sorti depuis 2003, et l'outil le prouve sur votre propre machine : il rouvre le fichier fini et compte ses pages avant de vous le proposer. Les formulaires, les liens, les signets, la structure d'accessibilité et les pièces jointes incorporées sont repris ; seule est laissée de côté la matière à laquelle plus rien dans le document ne renvoyait.

### Est-ce gratuit, et faut-il un compte ?

C'est gratuit, et il n'y a ni compte, ni identification, ni période d'essai, ni d'autre limite de taille que ce que permet la mémoire de votre propre machine. Le site affiche de la publicité, et c'est elle qui le finance ; les annonces ne reçoivent rien sur votre document.

### Est-ce que cela fonctionne hors ligne ?

Oui. Chargez la page une fois, coupez ensuite votre connexion et elle continue de travailler. C'est aussi la façon la plus simple de prouver que rien n'est envoyé, car un outil qui expédierait votre document ailleurs pour le compresser s'arrêterait à l'instant où vous débranchez.

## Comment cette promesse se vérifie

- **Votre document n'a nulle part où aller.** La Content-Security-Policy énumère toutes les adresses que cette page peut contacter, et aucune n'appartient à ce site. Cet outil n'ajoute rien à cette liste, puisqu'il n'a aucune fonction réseau propre, pas même facultative. Il n'existe ici aucun point de collecte où votre fichier pourrait aboutir, ni rien dans le code qui l'y enverrait s'il en existait un.
- **Le format entier tient dans ce dépôt.** Un PDF, c'est une liste d'objets et une table qui dit où chacun commence. `src/objects.js` lit cette syntaxe, `src/reader.js` suit la table et `src/writer.js` en écrit une nouvelle ; aucun des trois n'importe la moindre chose capable d'émettre une requête. Aucune bibliothèque n'est récupérée et rien n'est rendu sur un serveur.
- **Les fichiers chiffrés sont refusés plutôt qu'ouverts.** Un PDF protégé par mot de passe est refusé, y compris celui que produisent les scanners avec un mot de passe vide et qui s'ouvrirait techniquement. Retirer la protection d'un document est un autre métier que l'alléger, et le faire en douce serait une drôle d'initiative pour un outil.
- **Il enlève des choses plutôt qu'il n'en ajoute.** Le fichier fini ne porte ni date de création, ni ligne de producteur, ni nom de l'outil qui l'a fabriqué. Avec la case cochée, il perd aussi le paquet XMP et les blocs privés que laissent derrière elles les applications de mise en page, soit le même raisonnement que celui de l'outil EXIF, appliqué à un autre conteneur.
- **Ce que Google charge, et ce qu'on ne lui donne pas.** Les scripts publicitaires et de mesure viennent de Google. Ni l'un ni l'autre ne reçoit quoi que ce soit sur votre document : ni un fichier, ni une page, ni un nom, une taille ou un nombre de pages. Chaque ligne qui lit, décode ou écrit un PDF est servie depuis cette origine et figure dans le dépôt.
- **Ce que le bouton de don charge, et ce qu'on ne lui donne pas.** Le bouton « Buy me a coffee » dans l'en-tête est dessiné par un script de cdnjs.buymeacoffee.com et se compose avec Google Fonts. C'est un lien, rien de plus : il ne signale aucune visite, et on ne lui donne rien sur vous ni sur votre document. Rien ne se passe tant que vous ne cliquez pas, et ce vers quoi vous cliqueriez est le site de quelqu'un d'autre.
- **Tout fonctionne hors ligne.** Coupez le réseau et tout, sur cette page, continue de fonctionner. C'est la preuve la plus simple de toutes, car un outil qui expédierait votre document ailleurs pour le compresser s'arrêterait.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, ainsi que `src/reader.js` et `src/writer.js` pour la totalité de la lecture et de la réécriture, dont aucun des deux ne peut atteindre le réseau.
