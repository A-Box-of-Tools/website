# Somme de contrôle — MD5, SHA-1, SHA-256, SHA-512

Vérifier un téléchargement face au nombre publié par son auteur, sans l’envoyer à personne.

> Calculez le MD5, SHA-1, SHA-256, SHA-384 ou SHA-512 de n’importe quel fichier et comparez-le à la somme de contrôle publiée sur la page de téléchargement. Le fichier est lu dans le navigateur et n’est jamais envoyé, quelle que soit sa taille.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/verifier-une-somme-de-controle/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos fichiers. Il n'y a pas de serveur.

Une somme de contrôle est un calcul sur les octets de votre fichier, et il se fait ici, dans cette page, sur votre propre processeur. Le fichier est lu sur le disque par tranches de quatre mégaoctets, et chaque tranche est jetée dès qu’elle a été comptée : rien n’est donc jamais reconstitué quelque part, ni en mémoire, ni encore moins sur un serveur. Il n’y a aucun serveur au bout de cette page à qui envoyer un fichier, même si quelque chose ici le voulait.

- ✗ Aucun envoi
- ✗ Aucune limite de taille
- ✓ Fonctionne hors ligne
- ✓ Code ouvert
- ✓ Vos fichiers restent sur votre appareil

## Comment vérifier un téléchargement avec sa somme de contrôle

1. **Choisissez le fichier.** Déposez-le sur la zone ou sélectionnez-le à la main. Il est lu par morceaux directement sur votre disque ; rien ne part nulle part pendant ce temps, et il n’y a pas de taille à partir de laquelle la page renonce.
2. **Laissez-la lire.** MD5 et SHA-256 sont calculés par défaut, en une seule passe. La barre indique où en est la lecture et à quelle vitesse. Une grande image disque prend à peu près le temps qu’il faudrait pour la copier, puisque c’est la même quantité de lecture.
3. **Collez ce qu’elle devrait donner.** Ce que la page de téléchargement vous a donné, sous n’importe quelle forme : de l’hexadécimal seul, une ligne de sortie de `sha256sum`, un fichier `SHA256SUMS` entier, ou l’attribut `integrity` pris sur une balise de script. L’algorithme se déduit de la longueur, et la bonne case se coche toute seule.
4. **Lisez la réponse, pas la couleur.** La page dit en une phrase si c’est bien le fichier que décrit cette somme de contrôle. Si elle correspond, les octets sont identiques à ceux qu’a mesurés l’auteur. Sinon, ils ne le sont pas, et il vaut mieux retélécharger avant d’ouvrir quoi que ce soit.
5. **Emportez les sommes si vous en avez besoin.** Copiez-en une, copiez-les toutes, ou enregistrez-les dans un petit fichier texte, sous la forme avec l’algorithme en tête qu’écrivent les outils en ligne de commande. Le nom de l’algorithme voyage ainsi avec le nombre.

## La version longue

[Comment vérifier un téléchargement avec sa somme de contrôle](https://abox.tools/fr/guides/verifier-la-somme-de-controle-d-un-telechargement/): Comment comparer une somme MD5 ou SHA-256 sous Windows, macOS et Linux ou dans le navigateur, ce qu'une correspondance prouve vraiment, et l'erreur qui vide l'exercice de son sens.

## Aussi dans la boîte

- [Générateur de mot de passe & de phrase secrète](https://abox.tools/fr/generateur-de-mot-de-passe/): Fabriqué ici, par votre propre navigateur, et envoyé nulle part. Rien n'est enregistré et il n'y a pas d'historique.
- [Formateur JSON](https://abox.tools/fr/formater-du-json/): JSON, XML, HTML, CSS et YAML, mis en forme ou convertis. Rien n'est collé dans le serveur de quelqu'un d'autre.
- [Convertisseur YAML vers JSON](https://abox.tools/fr/convertir-du-yaml-en-json/): Les deux sens, et il dit ce que chacun coûte. Rien de tout cela n'est collé dans le serveur de quelqu'un d'autre.
- [Formateur XML](https://abox.tools/fr/formater-du-xml/): Du XML mis en forme pour être lu ou compacté pour être livré, et converti en JSON dans les deux sens. Rien de tout cela n'est collé dans le serveur de quelqu'un d'autre.

## Questions

### Mon fichier est-il envoyé quelque part ?

Non. Votre propre navigateur le lit sur votre disque et le calcule sur votre propre processeur, par tranches de quatre mégaoctets. Cet outil n’a pas de partie serveur, et la `Content-Security-Policy` de la page énumère toutes les adresses qu’elle peut contacter : aucune ne nous appartient. Débranchez le réseau et cela continue de fonctionner.

### Y a-t-il une limite de taille ?

Non. Le fichier n’est jamais gardé entier : il est lu par morceaux, et chaque morceau est compté puis jeté, de sorte qu’une image disque de quarante gigaoctets consomme les mêmes quelques mégaoctets de mémoire qu’un fichier texte. Ce que cela coûte, c’est du temps, et la page vous dit combien au fur et à mesure. \
\
C’est la raison pour laquelle les algorithmes sont écrits ici plutôt que confiés au `crypto.subtle.digest` du navigateur, qui serait plus rapide. Cet appel prend le message entier dans un seul tampon et il n’existe aucun moyen de lui donner un fichier par morceaux : s’en servir aurait fait dépendre la taille du plus gros fichier vérifiable de la mémoire que cet onglet obtient. Sur un téléphone, cela fait quelques centaines de mégaoctets, et ce que les gens veulent le plus vérifier, ce sont des images disque.

### La somme correspond. Qu’est-ce que cela prouve au juste ?

Que les octets présents sur votre disque sont ceux que quelqu’un avait sous les yeux en notant ce nombre. Rien de plus, et les limites méritent d’être précises. \
\
Cela prouve que le téléchargement n’a pas été tronqué, ni abîmé par un disque défaillant, ni remplacé en chemin. Cela ne prouve **pas** que le fichier est sans danger, car un auteur peut mesurer un logiciel malveillant aussi exactement qu’autre chose. Et cela prouve très peu si la somme venait de la même page, par la même connexion, que le fichier : qui pouvait changer l’un pouvait changer l’autre. Une somme de contrôle vaut surtout quand elle vous parvient par une autre voie : un fichier `SHA256SUMS` signé, l’annonce de version d’une distribution, un second miroir, ou un gestionnaire de paquets qui la connaît déjà.

### Elle ne correspond pas. Et maintenant ?

Retéléchargez d’abord le fichier, au même endroit. Un transfert interrompu ou repris est de très loin la cause la plus fréquente, et une deuxième copie règle généralement l’affaire. \
\
Si la deuxième copie donne la même mauvaise réponse, vérifiez que vous comparez à la bonne ligne : les pages de version listent plusieurs fichiers, et la somme de la version ARM ne correspondra jamais à celle de la version x86. Vérifiez ensuite le numéro de version. Si tout cela est juste et que cela ne correspond toujours pas, n’ouvrez pas le fichier. Prenez-le sur un autre miroir et comparez les deux sommes entre elles.

### Lequel choisir ?

Celui que l’auteur a publié. Tout l’exercice consiste à comparer à son nombre, et vous ne pouvez pas choisir le sien à sa place. \
\
Si vous produisez une somme plutôt que d’en vérifier une, prenez SHA-256. MD5 et SHA-1 sont cassés au sens qui compte : deux fichiers différents ayant la même empreinte peuvent être fabriqués exprès, en quelques heures pour MD5 et pour un coût modéré pour SHA-1. Cela ne les rend pas inutiles contre les accidents, car un téléchargement tronqué ne tombera pas par hasard sur la même empreinte ; mais cela veut dire qu’aucun des deux ne peut plus vous assurer que personne n’a touché au fichier. SHA-384 et SHA-512 vont très bien et ne valent pas mieux en pratique ; ils sont là parce que certains projets les publient.

### Pourquoi MD5 est-il là s’il est cassé ?

Parce que c’est encore ce qui est imprimé. Des miroirs, des pages de micrologiciels, des serveurs universitaires et quantité de sites de constructeurs ont publié un MD5 il y a vingt ans et n’ont pas rouvert la page depuis. Un outil qui refuserait d’en calculer un refuserait de répondre à la question avec laquelle ses visiteurs arrivent vraiment. \
\
Ce qu’il peut faire, en revanche, c’est dire ce que la réponse vaut, et c’est le rôle de la note à côté de la case. Un MD5 qui correspond écarte toujours un téléchargement abîmé. Il n’écarte pas un téléchargement trafiqué.

### Quels formats puis-je coller dans le champ de comparaison ?

Tous les formats courants, et la page reconnaît elle-même lequel c’est. \
\
De l’hexadécimal seul, avec ou sans espaces. Une ligne de sortie de `md5sum` ou `sha256sum`, avec le nom de fichier derrière. Un fichier `SHA256SUMS` entier de quarante lignes : c’est alors la ligne qui nomme votre fichier qui est retenue. La forme BSD, `SHA256 (disk.iso) = …`. Une étiquette devant, comme `SHA-256 : …`. Et un attribut de subresource integrity, `sha384-…`, qui est en base64 plutôt qu’en hexadécimal et qui est décodé avant la comparaison. \
\
L’algorithme se déduit de la longueur : 32 caractères hexadécimaux font un MD5, 40 un SHA-1, 64 un SHA-256, 96 un SHA-384 et 128 un SHA-512. Aucun n’a la longueur d’un autre, il n’y a donc rien à choisir et rien à se tromper.

### Le résultat sera-t-il le même que celui de sha256sum ou de certutil ?

Oui, octet pour octet. Ce sont des spécifications exactes avec des vecteurs de test publiés, et chaque algorithme d’ici est vérifié à chaque construction face à ces vecteurs et face à l’implémentation du système d’exploitation. \
\
La seule différence visible est la présentation. Le `certutil -hashfile` de Windows écrit en majuscules avec des espaces ; cette page écrit en minuscules, ce qu’emploie la quasi-totalité des auteurs. La comparaison ignore les deux, si bien qu’une somme copiée depuis certutil correspond à une somme en minuscules collée ici.

### Puis-je comparer deux fichiers entre eux ?

Oui, avec une étape de plus : vérifiez le premier, copiez sa somme, choisissez ensuite le second et collez cette somme dans le champ. Si les deux fichiers sont identiques, la page le dira. \
\
Cela vaut d’être connu pour le cas où les sommes de contrôle sont discrètement imbattables : savoir si la copie sur le disque de sauvegarde est vraiment le même fichier que celui de l’ordinateur portable, quand les deux annoncent la même taille et la même date.

### Est-ce que cela modifie mon fichier ?

Non. Cet outil ne fait que lire. Il n’y a pas de fichier de sortie, pas de réencodage et rien qui soit réécrit : la seule chose téléchargeable est un petit fichier texte listant les sommes. Votre original reste intact sur votre disque, ce qui est aussi la réponse honnête à la question de ce qui se passe si vous fermez l’onglet.

### Est-ce gratuit, et faut-il un compte ?

C’est gratuit, et il n’y a ni compte, ni inscription, ni période d’essai. Il n’y a pas de limite de taille de fichier ni de limite au nombre de fichiers vérifiés. Le site porte de la publicité, et c’est elle qui le paie ; on ne lui donne rien sur votre fichier.

### Est-ce que cela fonctionne hors ligne ?

Oui. Chargez la page une fois, débranchez internet, et elle continue de fonctionner. C’est aussi la façon la plus simple de prouver que rien n’est envoyé : un outil qui expédierait votre fichier ailleurs pour le calculer s’arrêterait à la seconde où vous débranchez.

## Comment cette promesse se vérifie

- **Votre fichier n’a nulle part où aller.** La Content-Security-Policy énumère toutes les adresses que cette page peut contacter, et aucune ne nous appartient. Il n’y a ici aucun point de collecte pour votre fichier, et rien dans le code qui l’y enverrait s’il en existait un. Cette ligne disait autrefois `connect-src 'none'`, ce qui était absolu ; la publicité a coûté cela, et le dire fait partie du marché.
- **Le fichier n’est jamais gardé entier, quelle que soit sa taille.** Il est lu par tranches de quatre mégaoctets, et chaque tranche est intégrée à l’état courant puis jetée. La mémoire utilisée est donc la même pour une image disque de quarante gigaoctets que pour un fichier texte, et il n’existe pas de taille à partir de laquelle la page renonce. C’est aussi pourquoi le `crypto.subtle.digest` du navigateur n’est pas utilisé : il veut le fichier entier en mémoire d’un coup, ce qui est exactement le plafond que cet outil existe pour ne pas avoir.
- **Cinq algorithmes, cinq fichiers dans ce dépôt.** `src/md5.js`, `src/sha1.js`, `src/sha256.js` et `src/sha512.js` sont les spécifications publiées écrites telles quelles, une soixantaine de lignes chacune, avec les tables de constantes écrites plutôt que calculées pour que rien du résultat ne dépende de votre navigateur. Chacune est vérifiée à chaque construction face aux vecteurs de test officiels et face à l’implémentation du système d’exploitation.
- **La somme de contrôle que vous collez ne part nulle part non plus.** Elle est comparée ici, dans la page, à la valeur calculée ici. Personne n’apprend rien de cette comparaison : ni la valeur, ni le résultat, ni le nom du fichier. Cela compte plus qu’il n’y paraît : une somme de contrôle accompagnée d’un nom de fichier indique à qui la collecte exactement quelle version de quel logiciel vous venez de télécharger.
- **Ce que Google charge, et ce qu’on ne lui donne pas.** Les scripts publicitaires et de mesure viennent de Google. Ni l’un ni l’autre ne reçoit quoi que ce soit sur votre fichier : ni le fichier, ni son nom, ni sa taille, ni aucune des empreintes calculées. Chaque ligne qui lit ou traite un octet est servie depuis ce domaine et figure dans le dépôt.
- **Ce que charge le bouton de don, et ce qu’on ne lui donne pas.** Le bouton « Buy me a coffee » de l’en-tête est dessiné par un script de cdnjs.buymeacoffee.com et prend sa police chez Google Fonts. C’est un lien et rien de plus : il ne signale aucune visite et ne reçoit rien sur vous ni sur vos fichiers. Rien ne se passe tant que vous ne cliquez pas, et ce que vous ouvririez alors est le site de quelqu’un d’autre.
- **Cela fonctionne hors ligne.** Débranchez le réseau et chaque partie de cette page continue de fonctionner. C’est la preuve la plus simple qui soit : un outil qui enverrait votre fichier ailleurs pour le calculer s’arrêterait à la seconde où vous débranchez.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, `src/md5.js`, `src/sha1.js`, `src/sha256.js` et `src/sha512.js` pour les quatre fonctions de compression, `src/blocks.js` pour le remplissage qu’elles partagent, et `src/hash.js` pour la boucle qui lit votre fichier par morceaux. Aucun de ces fichiers ne contient une ligne capable d’atteindre le réseau.
