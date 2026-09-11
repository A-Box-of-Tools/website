# Est-il sûr d'utiliser un générateur de mots de passe en ligne ?

Votre soupçon est juste, gardez-le : une page qui fabrique des mots de passe est exactement la page qui ne doit pas s'en souvenir. La bonne nouvelle, c'est que cela se vérifie — le hasard naît sur votre machine, l'envoi se voit, et un générateur qui garde ce qu'il a fabriqué peut être pris sur le fait.

Dernière mise à jour 26 août 2026

## La réponse courte

Le soupçon derrière cette question est exactement le bon, alors gardez-le. Une page qui fabrique des mots de passe est la seule page du web qui n'a rien de sensible à recevoir et tout de sensible à *garder* : sa sortie est le secret, et un générateur qui transmettrait ce qu'il fabrique ne serait pas un outil faible mais une collection de mots de passe. La question n'est jamais de savoir si une page de générateur a l'air digne de confiance. C'est de savoir si elle *pourrait* garder le mot de passe si elle le voulait — et cela, chose inhabituelle, se vérifie.

Trois choses en décident : d'où vient le hasard, si le résultat peut quitter la page, et si quoi que ce soit du résultat est prévisible. Les trois ont des réponses honnêtes qu'un visiteur peut contrôler — ce qui est plus qu'on ne peut en dire d'une application téléchargée qui fabrique dans une fenêtre où personne ne voit.

## D'où vient le hasard d'un navigateur

Tout générateur sérieux dans un navigateur puise au même puits : `crypto.getRandomValues`, le générateur aléatoire cryptographique du navigateur, alimenté et réalimenté par le système d'exploitation à partir de bruit matériel. C'est la même source où le navigateur puise ses clés TLS — le chiffrement sur lequel roule votre connexion bancaire. Il n'existe aucun sens utile dans lequel un programme de bureau aurait accès à un meilleur hasard qu'une page web ; les deux finissent au même puits du système.

Ce qu'une page ne doit *pas* utiliser, c'est `Math.random()`, la fonction à tout faire pour lancer un dé. Les navigateurs l'implémentent avec un générateur rapide dont l'état interne se reconstruit à partir d'une poignée de sorties consécutives — les mots de passe bâtis dessus ont l'air aléatoires et sont calculables par quiconque en a vu un. Ce n'est pas théorique ; cela a été démontré contre des générateurs en service plus d'une fois. Et c'est invisible de l'extérieur, ce qui est le plus fort argument pour les générateurs dont le code se lit : la différence entre les deux fonctions tient en un mot dans la source.

Il existe un cran de soin plus fin encore. Transformer des mots aléatoires de 32 bits en « un nombre au-dessous de 26 » par un simple reste est très légèrement biaisé vers les premières lettres ; un générateur soigneux retire au sort plutôt que de prendre le reste. Le [générateur d'ici](https://abox.tools/fr/generateur-de-mot-de-passe/) le fait — le biais évité est d'environ un sur 165 millions, invisible à l'usage, et exactement le genre de détail qui sépare un outil bâti pour la tâche d'un bout de code recopié d'un forum.

## Ce qu'une mauvaise page de générateur pourrait faire

Nommons les défaillances franchement, parce que chacune se vérifie :

- **Expédier le mot de passe.** La page fabrique en local, puis poste ce qu'elle a fabriqué — au clic, avec la télémétrie, ou par lots plus tard. C'est la faute éliminatoire, et elle se voit : il faut que ce soit une requête réseau, et les requêtes s'observent.
- **Fabriquer sur le serveur.** Le mot de passe arrive par le réseau au lieu d'en partir — l'exploitant l'a donc vu le premier, et vous n'apprenez rien de sa fabrication. Même vérification, autre sens.
- **Fabriquer faiblement.** `Math.random`, une graine d'horodatage, une liste de quelques centaines de mots présentée comme forte. Aucun onglet Réseau n'attrape celle-ci ; seul du code lisible le peut, ou un affichage de force honnête, compté à partir des réglages réels.
- **Tenir un historique.** Se souvenir obligeamment de vos vingt derniers mots de passe — dans un stockage qui survit à l'onglet, sur une machine peut-être partagée.

Le [générateur de mots de passe et de phrases de passe](https://abox.tools/fr/generateur-de-mot-de-passe/) de ce site est bâti contre les quatre par construction : `crypto.getRandomValues` et rien d'autre, fabrication dans la page, aucun stockage d'aucune sorte, pas d'historique, et une ligne de force qui annonce exactement combien de résultats vos réglages rendaient possibles. Les listes de mots des phrases de passe sont les listes Diceware de l'EFF, livrées inchangées dans le dossier de l'outil.

## Comment vérifier n'importe quel générateur, celui-ci compris

La méthode complète est écrite dans [le guide sur l'envoi de fichiers](https://abox.tools/fr/guides/est-il-sur-d-envoyer-ses-fichiers/), et voici la page à laquelle l'appliquer avant toute autre :

- **Débranchez d'abord.** Chargez la page, passez hors ligne, *puis* générez. Un mot de passe fabriqué sans connexion n'a pas pu être récupéré, ni envoyé à l'instant de sa fabrication. Cette page continue de fonctionner hors ligne ; c'est sa raison d'être.
- **Regardez l'onglet Réseau pendant que vous générez.** Appuyez sur le bouton et lisez la liste : rien ne doit partir. Copiez ensuite le mot de passe, et regardez encore — la copie est l'instant qu'une page malhonnête choisirait.
- **Cherchez ce dont une collection aurait besoin.** Un compte, une synchronisation, une liste « récemment générés ». Un générateur doté de mémoire possède une copie.

Une réserve honnête a sa place à la fin. Une vérification dit ce que la page a fait pendant que vous regardiez ; un code publié et servi lisible — comme tout sur ce site — dit ce qu'elle fait en général. Reste la machine elle-même : aucune page web ne protège un mot de passe d'un navigateur compromis ni d'un logiciel espion, et un générateur pas davantage. Ce que les vérifications vous achètent est plus petit et bien réel — un mot de passe qu'aucun serveur n'a jamais vu, fabriqué par une arithmétique qu'on vous a laissé lire.
