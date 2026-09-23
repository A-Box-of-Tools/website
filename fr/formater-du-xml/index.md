# Formateur XML — le mettre en forme, le compacter ou le convertir en JSON

Du XML mis en forme pour être lu ou compacté pour être livré, et converti en JSON dans les deux sens. Rien de tout cela n'est collé dans le serveur de quelqu'un d'autre.

> Mettez en forme, indentez et compactez du XML, et convertissez XML en JSON ou JSON en XML. L'analyseur tourne dans votre navigateur et rien n'est envoyé, donc un flux, une facture ou un fichier de configuration ne quitte jamais votre machine.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/formater-du-xml/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos fichiers XML et JSON. Il n'y a pas de serveur.

Mettre en forme et convertir, c'est de l'arithmétique sur une chaîne de caractères, faite ici, dans cette page. L'analyseur est écrit à la main et se trouve dans `src/shared/parse-xml.js`, et il n'y a rien d'autre. Cet outil n'a aucune fonction réseau d'aucune sorte — rien à récupérer, rien à envoyer — ce qui compte ici plus que le mot « XML » ne le laisse croire : ce qui arrive dans ce format est le plus souvent une facture, un relevé bancaire, un dossier médical, ou une requête SOAP avec les identifiants de quelqu'un dans l'en-tête.

- ✗ Sans envoi
- ✗ Sans compte
- ✗ Sans limite de taille
- ✓ Fonctionne hors ligne
- ✓ Open source

## Comment mettre du XML en forme sans l'envoyer

1. **Choisissez le travail.** Deux onglets, une seule boîte : *Mettre en forme* déplie le XML ou le compacte ; *Convertir* le transforme en JSON, ou le JSON de nouveau en XML. Le XML que vous venez de mettre en forme est celui que vous convertissez, sans le coller deux fois.
2. **Collez-le, ou déposez le fichier.** Tout ce que vous pouvez sélectionner et copier convient, et un fichier `.xml`, `.svg`, `.rss` ou `.xsd` déposé sur le sélecteur est lu par votre propre navigateur et placé dans la boîte — il n'y a pas d'étape d'envoi à omettre.
3. **Choisissez l'indentation, ou compactez-le.** Deux espaces, quatre, ou une tabulation. Compacté, c'est le même document sans aucune des espaces qui n'étaient là que pour la lecture, et le résultat dit combien d'octets cela a fait gagner.
4. **Lisez l'erreur là où elle est.** Un analyseur qui échoue ici dit *quelle balise* n'a jamais été fermée, et à quelle ligne et quelle colonne, plutôt que « erreur à la ligne 1 », ce qu'un navigateur dit d'un document qu'il a lu d'un seul tenant.
5. **Emportez le résultat.** Copiez-le, ou téléchargez-le sous forme de fichier, nommé d'après le format dans lequel il est sorti.

## Aussi dans la boîte

- [Comparateur de textes](https://abox.tools/fr/comparer-des-textes/): Deux textes en entrée, chaque différence marquée, ligne à ligne et mot à mot. Rien n'est collé dans le serveur de quelqu'un d'autre.
- [Encodeur & décodeur Base64](https://abox.tools/fr/encoder-base64/): Base64, encodage pourcent, entités HTML, hexadécimal et échappements antislash, dans les deux sens. Rien n'est collé dans le serveur de quelqu'un d'autre.
- [Partager du texte et des fichiers](https://abox.tools/fr/partager-du-texte/): Le partage vit dans cet onglet ouvert. Les lecteurs le reçoivent chiffré, directement depuis votre navigateur, et fermer l'onglet y met fin - aucun serveur ne conserve quoi que ce soit.
- [Générateur de QR codes et de codes-barres](https://abox.tools/fr/generateur-de-qr-code/): Vous le tapez, cela devient un code. Rien n'est envoyé pour en fabriquer un.

## Questions

### Mon XML est-il envoyé quelque part ?

Non. L'analyseur et l'imprimeur de cette page sont des fonctions qui tournent dans votre propre navigateur, sur votre propre matériel. Cet outil n'a aucune fonction réseau d'aucune sorte — il ne récupère jamais rien et n'envoie jamais rien — et la `Content-Security-Policy` de la page nomme chaque adresse qu'elle peut contacter, dont aucune ne nous appartient. Cela compte plus pour le XML que la réputation du format ne le suggère : ce qui y arrive est le plus souvent une facture, un relevé bancaire, un dossier médical, ou une requête SOAP avec des identifiants dans l'en-tête.

### Résout-il les entités externes ?

Non, et il n'y a rien à désactiver. La résolution des entités externes est la façon dont on persuade un analyseur XML de lire des fichiers sur la machine qui l'exécute — l'attaque qu'on écrit d'ordinaire XXE — et `src/shared/parse-xml.js` est un lecteur écrit à la main sans aucune résolution d'entité. Votre texte n'est jamais confié non plus au `DOMParser` du navigateur. Un `DOCTYPE` est transporté tel quel sans jamais être exécuté.

### Que perd-on en convertissant du XML en JSON ?

L'ordre du contenu mixte, les commentaires, et la différence entre un attribut et un élément enfant — cette dernière étant adoucie plutôt qu'effacée, puisqu'un attribut devient un membre dont le nom commence par `@`. Le texte propre d'un élément devient `#text` lorsqu'il doit cohabiter avec autre chose, et les enfants répétés deviennent un tableau. Chaque valeur reste une chaîne : le XML n'a pas de types, et décider que `8080` était un nombre reviendrait à inventer une information.

### Que perd-on en convertissant du JSON en XML ?

La différence entre un objet vide, un tableau vide et une chaîne vide, qui deviennent tous trois un élément vide, et le type de chaque valeur, puisque le XML n'a pas de types. Un tableau devient un élément répété, la seule forme qui se relise, et une clé qu'un nom d'élément ne peut pas porter voit ses caractères gênants remplacés plutôt que de produire un document qu'aucun analyseur ne lira.

### Peut-il mettre en forme un SVG, un flux RSS ou un fichier POM ?

Oui. Tous les trois sont du XML, et ceci lit du XML plutôt qu'un dialecte particulier. Un SVG mis en forme ainsi est plus facile à modifier à la main ; un flux RSS ou Atom est d'ordinaire livré compacté et reste illisible tant que rien ne le déplie. La disposition ne change rien à ce que le document signifie.

### Réindenter du XML change-t-il son sens ?

Pour un document dont les éléments contiennent d'autres éléments, non. Là où cela peut compter, c'est le texte : les espaces à l'intérieur d'un élément qui contient des mots font partie de ce texte, donc un élément ne contenant que du texte est laissé sur une seule ligne plutôt que déplié. Les sections `CDATA` sont recopiées exactement telles quelles.

### Pourquoi ne pas utiliser l'analyseur XML du navigateur ?

À cause de ce qu'il dit quand le document est cassé. Le `DOMParser` renvoie un document d'erreur dont la formulation diffère dans chaque navigateur et se résume souvent à « erreur à la ligne 1 ». Un lecteur écrit à la main peut dire quelle balise n'a jamais été fermée, et où elle a été ouverte, ce qui est justement ce que vous aviez besoin de savoir. Ne pas résoudre les entités externes est l'autre raison.

### Quelle taille de fichier peut-il traiter ?

Aucune limite n'est inscrite ici, parce qu'aucun serveur ne la paie. Le plafond réel est votre propre machine : quelques mégaoctets de XML passent bien, et pour un document très long la page attend une pause dans votre frappe avant de remettre en forme, plutôt que de vous disputer le clavier.

### Est-ce gratuit, et faut-il un compte ?

C'est gratuit, et il n'y a ni compte, ni identification, ni période d'essai, ni limite à ce que vous collez. Le site affiche de la publicité, et c'est elle qui le finance ; les annonces ne reçoivent rien sur votre texte.

### Est-ce que cela fonctionne hors ligne ?

Oui. Chargez la page une fois, puis débranchez internet et elle continue de fonctionner. C'est aussi la façon la plus simple de prouver que rien n'est envoyé : un outil qui expédierait votre XML pour le mettre en forme s'arrêterait à l'instant où vous débranchez.

## Comment cette promesse se vérifie

- **Ce que vous collez n'a nulle part où aller.** La Content-Security-Policy nomme chaque adresse que cette page peut contacter, et aucune ne nous appartient. Il n'y a ici aucun point de collecte où une facture collée pourrait aboutir, et rien dans le code qui l'y enverrait s'il en existait un.
- **Rien ici ne récupère quoi que ce soit.** Il n'y a aucun `fetch`, aucun `XMLHttpRequest` et aucun `sendBeacon` nulle part dans `src/`. L'analyseur et l'imprimeur sont des fonctions de cette page qui prennent une chaîne et renvoient une chaîne.
- **Aucune entité externe n'est jamais résolue.** Un `DOCTYPE` contenant une entité externe, c'est la façon dont on persuade un analyseur XML de lire un fichier sur la machine qui analyse, et c'est le plus vieux trou du format. `src/shared/parse-xml.js` est un lecteur écrit à la main qui ne comporte aucune résolution d'entité — pas désactivée, absente — et cette page ne confie jamais votre texte au `DOMParser` du navigateur.
- **Toute valeur sortie du XML est une chaîne.** `<port>8080</port>` ne dit rien de la question de savoir si c'est un nombre, donc le JSON dit `"8080"`. Décider à votre place reviendrait à inventer une information qui voyagerait ensuite comme si elle avait été dans le fichier.
- **Ce que Google charge, et ce qu'on ne lui donne pas.** Les scripts publicitaires et de mesure viennent de Google, et le bouton de don de Buy Me a Coffee. Aucun d'eux ne reçoit un caractère de votre texte. Chaque ligne qui le lit, l'analyse ou l'écrit est servie depuis cette origine et figure dans le dépôt.
- **Cela fonctionne hors ligne.** Débranchez le réseau et l'outil est inchangé, parce qu'il n'y a jamais eu d'étape réseau dedans. C'est la preuve la plus simple qui soit.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, `src/shared/parse-xml.js` pour l'analyseur qui vous dit quelle balise n'a jamais été fermée, et `src/convert.js` pour comprendre pourquoi chaque valeur sort du XML sous forme de chaîne plutôt que d'être devinée.
