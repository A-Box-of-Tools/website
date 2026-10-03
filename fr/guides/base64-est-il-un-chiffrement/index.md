# Base64 est-il un chiffrement ?

Non. Base64 est un changement de costume, pas une serrure : quiconque le reconnaît le défait en quelques millisecondes, sans aucune clé. Mais la question mérite une vraie réponse, parce qu'encodage, chiffrement et hachage se ressemblent à l'écran et ne pourraient pas promettre des choses plus différentes.

Dernière mise à jour 26 août 2026

## La réponse courte

Non. Base64 est un *encodage* : une façon d'écrire n'importe quelles données avec seulement soixante-quatre caractères sans danger, pour qu'elles survivent au passage dans des systèmes bâtis pour du texte simple. Il n'a pas de clé, pas de secret et aucune propriété de sécurité d'aucune sorte. Le décoder exige de le reconnaître, rien d'autre — environ un coup d'œil pour une personne, une milliseconde pour un ordinateur.

La question vaut pourtant d'être posée, parce que la confusion est universelle et parfois coûteuse. Une chaîne base64 *a l'air* brouillée — `cGFzc3dvcmQ=` ne révèle rien à l'œil — et ce qui a l'air brouillé se range sous « sécurisé ». De vrais produits ont été livrés avec des mots de passe « protégés » de cette façon. Le remède est une distinction, apprise une fois : **l'encodage est pour les machines, le chiffrement pour les secrets, le hachage pour les empreintes.** Trois travaux, trois outils, et un seul des trois protège quoi que ce soit.

## L'encodage : réversible par tout le monde

Un encodage change la façon dont les données sont *écrites*, jamais ce qu'elles disent. Pièces jointes de courriel, images embarquées dans des feuilles de style, jetons dans des adresses — partout, des octets arbitraires doivent traverser des canaux qui ne transportent fiablement que du texte, et base64 est le costume standard : trois octets entrent, quatre caractères sortent, faits de lettres, de chiffres et de deux signes, avec `=` pour combler la fin. Ce `=` final est le signe distinctif, et une fois qu'on le connaît, on voit du base64 partout.

La propriété qui définit tout : la recette est publique et tourne pareil à l'envers. Il n'y a rien à savoir, donc rien à ne pas savoir. Le pourcent-encodage des adresses (`%20` pour une espace), les entités HTML (`&amp;`), l'hexadécimal et les échappements à barre oblique inverse sont la même idée en d'autres habits, et l'[encodeur- décodeur base64](https://abox.tools/fr/encoder-base64/) d'ici les parle tous, dans les deux sens, sur votre propre machine. Décoder une chaîne trouvée est exactement aussi légitime que la lire, parce qu'un encodage n'a jamais été une serrure.

## Le chiffrement : réversible par le détenteur de la clé

Le chiffrement est celui qui protège vraiment un contenu. Il transforme les données avec une *clé*, et les mathématiques sont arrangées pour que défaire la transformation sans la clé ne soit pas simplement difficile mais hors de portée du calcul — tandis qu'avec la clé, c'est immédiat. Le secret loge entièrement dans la clé, pas dans la méthode : les algorithmes sont publiés, normalisés, et plus forts pour cela.

C'est ici que la confusion visuelle mord, parce que des octets chiffrés sont routinièrement encodés en base64 pour voyager — brouillés par une clé, puis costumés pour le transport. Deux couches, deux travaux. Le JSON Web Token est le cas d'école : trois morceaux de base64 joints par des points, dont les deux premiers se *décodent* en JSON lisible pour quiconque essaie. Des gens collent des jetons dans des décodeurs web publics tous les jours, en ayant supposé que le tout était scellé ; la description honnête est qu'un JWT est une carte postale à signature infalsifiable, pas une enveloppe.

## Le hachage : réversible par personne

Un hachage ne tourne que dans un sens. Faites passer n'importe quelle quantité de données par SHA-256 et il en sort un nombre de taille fixe — le même nombre à chaque fois pour les mêmes données, un nombre complètement différent pour des données qui diffèrent d'un bit, et aucun chemin du nombre vers les données, pour personne, clé ou pas. Ce n'est ni un costume ni une serrure ; c'est une *empreinte*.

C'est ce qui en fait l'outil des deux travaux qui lui appartiennent. Vérifier qu'un fichier téléchargé est exactement celui que l'éditeur a publié — comparer les empreintes, ce que l'outil de [somme de contrôle](https://abox.tools/fr/verifier-une-somme-de-controle/) fait sur votre machine, avec [son guide](https://abox.tools/fr/guides/verifier-la-somme-de-controle-d-un-telechargement/). Et conserver des mots de passe : un service bien tenu ne garde que le hachage du vôtre, si bien que même sa base volée ne contient pas le mot de passe. Quand un site peut vous renvoyer par courriel votre mot de passe oublié, il vous a dit qu'il ne l'a jamais haché — et quand une configuration « sécurise » le sien en `cGFzc3dvcmQ=`, elle vous a dit qu'elle n'a jamais fait que l'encoder.

## Les distinguer sur le terrain

Un raccourci qui marche, pour la chaîne devant vous :

- **Elle se décode en quelque chose de lisible ?** C'était de l'encodage. Lettres, chiffres, peut-être `+` et `/`, souvent `=` à la fin — passez-la dans un décodeur et regardez.
- **Elle se décode en bruit binaire ?** Alors le base64 n'était que le costume, et ce qu'il habille est chiffré, compressé, ou n'a jamais été du texte — l'encodage ne vous dit rien dans les deux cas.
- **Longueur fixe, caractères hexadécimaux, ne se décode jamais ?** 64 caractères hexadécimaux, c'est la silhouette de SHA-256 ; 32, celle de MD5. Les hachages ne se décodent pas ; ils coïncident, ou pas.

Et la morale pratique de chacun : ne comptez jamais sur un encodage pour le secret ; ne construisez jamais votre propre chiffrement quand votre plateforme le fournit ; ne stockez jamais un mot de passe autrement que haché. La chaîne que vous décodez pour vérifier peut d'ailleurs être elle-même la partie sensible — un jeton en cours de débogage l'est en général — et c'est pourquoi le [décodeur d'ici](https://abox.tools/fr/encoder-base64/) tourne là où le secret se trouve déjà, sur votre machine, et pourquoi [ce que coller dans un outil web fait vraiment](https://abox.tools/fr/guides/est-il-sur-de-coller-du-texte-dans-un-outil-en-ligne/) a une page à lui.
