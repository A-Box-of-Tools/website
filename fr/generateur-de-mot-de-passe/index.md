# Mot de passe & phrase secrète — solide et aléatoire, fabriqué dans votre navigateur

Fabriqué ici, par votre propre navigateur, et envoyé nulle part. Rien n'est enregistré et il n'y a pas d'historique.

> Générez un mot de passe aléatoire solide, ou une phrase secrète diceware tirée d'une liste de 7 776 mots livrée avec la page. Tirage par le générateur cryptographique de votre navigateur, aucun envoi, aucun enregistrement. Gratuit, sans inscription.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/generateur-de-mot-de-passe/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos mots de passe et phrases secrètes. Il n'y a pas de serveur.

Chaque caractère vient de `crypto.getRandomValues`, le générateur cryptographique du navigateur lui-même, et chaque mot d'une liste livrée dans ce dossier sous le nom `src/wordlist.js`. Il n'y a ni `fetch`, ni `XMLHttpRequest`, ni `sendBeacon` nulle part dans `src/` : aucun chemin ne permet donc à un mot de passe fabriqué ici de nous parvenir, ni de parvenir à qui que ce soit. Rien n'est enregistré non plus, et recharger cette page détruit tous les mots de passe qu'elle vous a montrés.

- ✗ Aucun envoi
- ✗ Aucun compte
- ✗ Rien d'enregistré
- ✓ Fonctionne hors ligne
- ✓ Code ouvert

## Comment fabriquer un mot de passe solide sans qu'aucun site ne le voie

1. **Choisissez un mot de passe ou une phrase secrète.** Un mot de passe est une suite de caractères aléatoires : court à stocker, pénible à taper, et exactement ce qu'il faut pour les centaines de comptes que votre gestionnaire remplit à votre place. Une phrase secrète, ce sont des mots tirés au hasard dans une liste : plus longue, mais mémorisable et prononçable, ce dont vous avez besoin pour les quelques secrets que vous devez taper de tête — celui du gestionnaire lui-même, celui de votre ordinateur portable, le code de récupération de votre téléphone.
2. **Réglez la longueur, ou le nombre de mots.** C'est le réglage qui compte, et les autres pour l'essentiel non. Vingt caractères, ou six mots, est un plancher raisonnable pour tout ce qui mérite d'être protégé ; montez au-dessus pour le compte qui permettrait de réinitialiser tous les autres. L'affichage en dessous bouge pendant que vous faites glisser le curseur, vous voyez donc ce que chaque caractère supplémentaire vous apporte.
3. **Activez les règles sur lesquelles le formulaire va insister.** « Au moins un de chaque », un chiffre à la fin, un symbole pris dans la courte liste que tous les sites acceptent. Rien de tout cela ne renforce quoi que ce soit, et le premier affaiblit très légèrement, ce que la page a déjà retranché. Mais c'est ainsi qu'on passe un formulaire d'inscription sans en générer six d'affilée.
4. **Lisez le nombre, pas la couleur.** Les bits sont comptés à partir des réglages qui ont produit la chaîne : la taille de l'alphabet, le nombre de tirages, et rien d'autre. C'est une vraie mesure, contrairement à la jauge d'une page d'inscription, qui ne peut que noter les caractères qu'elle a devant elle et n'a aucun moyen de savoir si c'est vous ou un générateur qui les a choisis.
5. **Copiez-le et rangez-le quelque part avant de partir.** Il n'y a pas d'historique ici, ni moyen de le redemander ; recharger la page le détruit. Collez-le d'abord dans le gestionnaire de mots de passe, ensuite dans le formulaire d'inscription, pour que celui qui doit s'en souvenir l'ait avant que quoi que ce soit puisse mal tourner.
6. **Prenez un lot si vous en avez besoin.** Le curseur du bas en fabrique jusqu'à cent d'un coup et les enregistre en fichier texte brut, écrit par cette page à partir de ce qui est déjà à l'écran. Utile pour créer des comptes en série ou distribuer des accès initiaux, et à supprimer dès qu'ils sont ailleurs : un fichier plein de mots de passe sur un disque reste un fichier plein de mots de passe.

## Aussi dans la boîte

- [Formateur JSON](https://abox.tools/fr/formater-du-json/): JSON, XML, HTML, CSS et YAML, mis en forme ou convertis. Rien n'est collé dans le serveur de quelqu'un d'autre.
- [Convertisseur YAML vers JSON](https://abox.tools/fr/convertir-du-yaml-en-json/): Les deux sens, et il dit ce que chacun coûte. Rien de tout cela n'est collé dans le serveur de quelqu'un d'autre.
- [Formateur XML](https://abox.tools/fr/formater-du-xml/): Du XML mis en forme pour être lu ou compacté pour être livré, et converti en JSON dans les deux sens. Rien de tout cela n'est collé dans le serveur de quelqu'un d'autre.
- [Comparateur de textes](https://abox.tools/fr/comparer-des-textes/): Deux textes en entrée, chaque différence marquée, ligne à ligne et mot à mot. Rien n'est collé dans le serveur de quelqu'un d'autre.

## Questions

### Les mots de passe sont-ils envoyés quelque part, ou enregistrés ?

Ni l'un ni l'autre. Ils sont fabriqués dans votre navigateur, sur votre propre matériel, et cet outil n'a aucune fonction réseau : il ne va jamais rien chercher et n'envoie jamais rien. Rien n'est écrit non plus dans le stockage : pas de localStorage, pas de cookie, pas d'historique. Rechargez la page et tous les mots de passe qu'elle vous a montrés ont disparu, de l'écran comme de sa propre mémoire. La `Content-Security-Policy` de la page nomme chaque adresse qu'elle peut contacter et aucune n'est la nôtre : il n'y a donc nulle part où un mot de passe pourrait être collecté, même si quelque chose essayait.

### D'où vient l'aléa ?

De `crypto.getRandomValues`, le générateur que les navigateurs fournissent pour un usage cryptographique, alimenté et réalimenté par la réserve d'entropie de votre système d'exploitation. C'est la source dans laquelle le navigateur puise le matériel de clés TLS. `Math.random` n'est utilisé nulle part dans cet outil, et la distinction n'est pas du pinaillage : `Math.random` est un générateur arithmétique rapide dont l'état interne complet se reconstitue à partir de quelques sorties consécutives, si bien qu'un générateur de mots de passe bâti dessus produit des mots de passe qui ont l'air aléatoires et que peut énumérer quiconque en a vu un.

### Un mot de passe fabriqué dans un navigateur vaut-il celui d'un logiciel installé ?

Pour l'aléa, oui : c'est la même source du système d'exploitation dans les deux cas, atteinte par une autre porte. Ce qui diffère, c'est ce qu'il y a d'autre dans la pièce. Un onglet de navigateur cohabite avec vos extensions, et une extension autorisée à lire les pages peut lire celle-ci. C'est vrai de tout générateur web, celui-ci compris, et c'est la raison honnête d'utiliser le générateur intégré à votre gestionnaire de mots de passe quand vous en avez un : c'est la même arithmétique, dans un processus où il y a moins de monde autour. Cette page est pour quand vous n'en avez pas sous la main.

### Mot de passe ou phrase secrète ? Que faut-il utiliser ?

Un mot de passe pour tout ce qu'un gestionnaire tape à votre place, parce que vous ne le regarderez jamais et que la longueur ne coûte rien. Une phrase secrète pour les rares choses que vous devez taper de tête ou dire à voix haute : le mot de passe maître du gestionnaire, la clé de chiffrement d'un disque, un appareil configuré à distance. Six mots de la liste longue font 77 bits, plus qu'un mot de passe aléatoire de douze caractères, et infiniment plus faciles à saisir correctement à quatre heures du matin.

### Quelle longueur doit faire un mot de passe ?

Vingt caractères sur l'alphabet complet font environ 130 bits, bien au-delà du point où la longueur cesse d'être le sujet. Seize suffit largement. Douze est le plancher pour tout ce dont la perte vous ennuierait, et c'est le plancher, pas la cible. En dessous, vous pariez sur le fait que le site l'a stocké correctement, pari que vingt ans d'annonces de fuites déconseillent. La longueur l'emporte sur tous les autres réglages de cette page : un caractère de plus apporte davantage que n'importe quelle règle sur les caractères qui doivent y figurer.

### Combien de mots doit faire une phrase secrète ?

Six de la liste longue, et sept si elle en protège d'autres. La fameuse image à quatre mots date de 2011, vaut 51 bits et est aujourd'hui à portée d'une attaque hors ligne sérieuse. Cinq font 64. Six font 77, soit au-delà de ce qu'un attaquant dépensera pour un compte ordinaire. Chaque mot supplémentaire de la liste longue ajoute 12,9 bits, et les mots sont la seule chose qui ajoute quelque chose : ni les traits d'union, ni les majuscules.

### Qu'est-ce qu'un « bit », et pourquoi cette page les compte-t-elle ?

Un bit est un doublement. Soixante bits, cela veut dire qu'il y avait 2^60 résultats également probables que cette page aurait pu produire : celui qui sait exactement comment elle fonctionne en a donc toujours autant à essayer. C'est une propriété du *procédé*, pas de la chaîne : la page peut la donner exactement parce que c'est elle qui a choisi et qu'elle sait combien de choix elle a faits. C'est là toute la différence avec la barre colorée d'un formulaire d'inscription, qui lit les caractères et devine. Sur cette barre, `correct horse battery staple` obtient une mauvaise note et vaut 44 bits, tandis que `P@ssw0rd!` obtient une bonne note et ne vaut presque rien.

### Pourquoi « doit contenir un symbole » affaiblit-il un mot de passe ?

Parce qu'une règle ne peut que retirer des possibilités. Exiger au moins un caractère de chaque ensemble écarte tous les mots de passe auxquels il n'en était pas tombé, et un ensemble plus petit de mots de passe possibles est un ensemble plus petit à parcourir. L'effet est faible — environ un demi-bit à une longueur courante — il est réel, et cette page le retranche au lieu de citer le chiffre qui l'avantage. Il est calculé exactement, en comptant les mots de passe que la règle autorise vraiment plutôt que ceux qu'elle écarte.

### Quelle est cette liste de mots, et le fait qu'un attaquant puisse la télécharger change-t-il quelque chose ?

Ce sont les listes diceware de l'Electronic Frontier Foundation, livrées telles quelles : 7 776 mots pour la longue, 1 296 pour la courte. Elles ont été construites exactement pour cela : rien d'offensant, pas d'homophones, aucune paire qui se recolle en un troisième mot, et dans la liste courte aucun mot qui soit le début d'un autre. Et non, que la liste soit publique ne change rien : la solidité annoncée ici suppose que l'attaquant l'a, qu'il lit le code source de cette page et qu'il connaît tous vos réglages. La seule chose qu'il ignore, c'est lequel des 7 776 mots est sorti à chaque fois. C'est précisément cette hypothèse qui rend le nombre digne de confiance.

### Une phrase secrète, n'est-ce pas une attaque par dictionnaire qui s'annonce ?

Pas quand les mots sont choisis ainsi. Une attaque par dictionnaire fonctionne contre les phrases que composent des *humains*, parce que les humains choisissent des mots qui vont ensemble, dans un ordre qui a du sens, parmi les quelques milliers qu'ils emploient tous les jours. Cette page choisit chaque mot indépendamment, uniformément, dans une liste fixe, sans se soucier de savoir si le résultat se lit bien — ce qui explique qu'il ne se lise généralement pas bien. Un attaquant qui connaît la liste et le nombre de mots a encore devant lui 7 776 puissance ce nombre.

### Puis-je récupérer un mot de passe après avoir quitté la page ?

Non, et c'est délibéré. Rien n'est noté nulle part, il n'y a donc rien à récupérer : pas de panneau d'historique, pas de liste « générés récemment », pas de cache. Un générateur capable de vous montrer le mot de passe de mardi dernier serait un générateur qui l'a stocké, et stocké là où vous pouvez l'atteindre veut dire stocké là où autre chose peut l'atteindre. Copiez-le dans un gestionnaire de mots de passe avant de quitter la page.

### Le copier dans le presse-papiers, est-ce prudent ?

C'est le risque ordinaire, et il vaut mieux le connaître que s'en inquiéter. Le presse-papiers est partagé avec tout ce qui tourne sous votre compte, il survit en général jusqu'à la copie suivante, et sur certaines configurations il se synchronise entre appareils. Autant de raisons de le coller tout de suite là où il va et de copier autre chose ensuite, et aucune raison de taper à la main un mot de passe plus faible. Cette page ne peut pas lire votre presse-papiers ; elle peut seulement y écrire, et seulement quand vous appuyez sur le bouton.

### Puis-je utiliser le même à plusieurs endroits ?

Non, et c'est le seul conseil de cette page qui prime sur tous les autres. Presque tous les comptes piratés le sont avec un mot de passe qui était correct ailleurs d'abord : un site est compromis, la liste est publiée, et la même adresse avec le même mot de passe est essayée partout. Un mot de passe unique par site transforme une fuite en un seul compte plutôt qu'en la totalité, et c'est la raison d'avoir un gestionnaire de mots de passe — pas la solidité de tel ou tel mot de passe qu'il contient.

### Est-ce gratuit, et faut-il un compte ?

C'est gratuit, il n'y a pas de compte, pas de connexion, pas d'essai et pas de limite au nombre que vous générez. Le site porte de la publicité, c'est ce qui le finance ; les annonces ne reçoivent absolument rien de ce que fabrique cette page, ni sa longueur, ni sa solidité.

### Est-ce que ça marche hors ligne ?

Oui. Chargez la page une fois, débranchez-vous d'internet, et elle continue à fabriquer des mots de passe. L'aléa vient de votre propre machine et la liste de mots est déjà dans la page. C'est aussi la façon la plus simple de prouver que rien n'est demandé ni envoyé : un générateur qui irait chercher ses nombres sur un serveur s'arrêterait à la seconde où vous débranchez.

## Comment cette promesse se vérifie

- **Le mot de passe est fabriqué là où vous lisez ces lignes.** Il est tiré dans cette page, par cette page, à partir de l'aléa que votre propre système d'exploitation remet au navigateur. Rien n'est demandé pour le produire et rien n'est signalé une fois qu'il existe. La `Content-Security-Policy` nomme chaque adresse que cette page a le droit de contacter, et aucune ne nous appartient : il n'y a ici aucun point de collecte où un mot de passe généré pourrait aboutir, ni rien dans le code qui l'y enverrait s'il en existait un.
- **Rien ici ne va rien chercher.** Il n'y a ni `fetch`, ni `XMLHttpRequest`, ni `sendBeacon` nulle part dans `src/`. La liste de mots n'est pas téléchargée : c'est `src/wordlist.js`, servie depuis cette origine avec le reste de la page, et vous pouvez la lire.
- **L'aléa est celui du navigateur, et c'est le bon.** `crypto.getRandomValues` est le générateur que les navigateurs fournissent pour les clés et les jetons, alimenté et réalimenté par le système d'exploitation. `Math.random` n'apparaît nulle part dans ce dossier, et ce serait un vrai défaut s'il y était : son état interne se reconstitue à partir d'une poignée de sorties, ce qui rend calculable, pour quiconque en a vu un seul, chacun des mots de passe qu'il produira.
- **Rien n'est enregistré, il n'y a donc pas d'historique à effacer.** Pas de localStorage, pas de sessionStorage, pas de cookie, pas de paramètre d'URL et pas de `<input>` que le navigateur proposerait de retenir. Ce qui est à l'écran vit dans un seul tableau en mémoire dans cette page, et fermer l'onglet suffit à tout nettoyer. Les seules copies de ce qui est fabriqué ici sont celles que vous emportez.
- **Ce que Google charge, et ce qu'on ne lui donne pas.** Les scripts publicitaires et de mesure viennent de Google, et le bouton de don de Buy Me a Coffee. Aucun d'eux ne reçoit un caractère de ce que fabrique cette page, ni sa longueur, ni sa solidité, ni les réglages qui l'ont produite. Chaque ligne qui tire un caractère ou un mot est servie depuis cette origine et figure dans le dépôt.
- **Ça fonctionne hors ligne.** Coupez le réseau et l'outil est identique, parce qu'il n'y a jamais eu d'étape réseau dedans. C'est la preuve la plus simple qui soit : un générateur qui demanderait son aléa à un serveur s'arrêterait à la seconde où vous débranchez.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, `src/random.js` pour les quarante lignes qui séparent cette page de chaque mot de passe qu'elle fabrique — elles n'ont qu'une seule entrée, et cette entrée est le générateur du navigateur — `src/generate.js` pour la façon dont les réglages deviennent une chaîne, et `src/strength.js` pour l'arithmétique derrière le nombre, qui compte au lieu de deviner.
