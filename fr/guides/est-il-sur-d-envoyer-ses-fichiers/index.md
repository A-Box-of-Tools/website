# Est-il sûr d'envoyer ses fichiers à un convertisseur en ligne ?

La réponse honnête est en général « probablement, mais vous ne pouvez pas le vérifier ». Voici ce que l'envoi fait réellement de votre fichier, pourquoi la plupart des outils le font encore, et quatre tests qui disent si celui que vous avez sous les yeux en a besoin.

Dernière mise à jour 26 août 2026

## La réponse courte

Pour la plupart des fichiers, la plupart du temps, envoyer ne pose pas de problème. Les convertisseurs sérieux effacent ce que vous leur envoyez au bout de quelques heures et n'ont aucun intérêt pour vos photos de vacances.

Le problème n'est pas qu'ils mentent. C'est que **vous n'avez aucun moyen de savoir s'ils mentent**. Une fois qu'un fichier a quitté votre machine, chaque promesse sur ce qui lui arrive ensuite est une promesse que vous croyez sur parole : combien de temps il est gardé, qui peut l'atteindre, s'il est copié dans une sauvegarde qui survivra au minuteur de suppression, ce qu'il en advient si l'entreprise est vendue ou piratée. Rien de tout cela n'est visible de l'extérieur.

La question utile n'est donc pas « est-ce que je fais confiance à ce site ? » C'est **« est-ce que ce travail exige que mon fichier parte ? »** Pour un nombre important et croissant de travaux, la réponse est non, et quand la réponse est non, la question de la confiance cesse d'être une question à laquelle vous devez répondre.

## Ce que l'envoi fait réellement

Quand un convertisseur vous demande de choisir un fichier puis vous montre une barre de progression, votre navigateur copie tout le fichier, octet pour octet, à travers internet, vers un ordinateur qui appartient à quelqu'un d'autre. Cet ordinateur l'écrit sur un disque, exécute la conversion, écrit le résultat sur le même disque, et vous remet un lien.

À cet instant, votre fichier existe dans au moins trois endroits que vous n'avez pas choisis : le disque du serveur, les journaux qui ont enregistré la requête, et souvent un réseau de diffusion de contenu qui a mis le résultat en cache pour que le téléchargement soit rapide. Une politique de suppression doit atteindre les trois. La plupart disent le faire. Vous ne pouvez en vérifier aucun.

À savoir également : le fichier n'est pas la seule chose qui arrive. Le nom de fichier part avec lui, et tout ce qui se trouve dans le fichier sans que vous puissiez le voir aussi. Une photo sortie tout droit d'un téléphone porte typiquement les coordonnées GPS exactes du lieu de la prise de vue, l'heure, le numéro de série de l'appareil, et parfois une vignette incorporée de l'image d'origine, d'avant votre recadrage. Les gens qui font attention à l'image ne font souvent pas attention à cela, parce que rien à l'écran ne le leur montre.

## Pourquoi la plupart des outils envoient quand même

Pas parce qu'ils veulent vos fichiers. Parce que, pendant l'essentiel de la vie du web, il n'y avait pas d'alternative. Un navigateur ne savait ni décoder une vidéo, ni réencoder une image à une qualité choisie, ni analyser un format de fichier ; un serveur avec FFmpeg et ImageMagick le savait. L'envoi n'était pas un modèle économique, c'était le seul endroit où le travail pouvait avoir lieu.

Cela a cessé d'être vrai récemment et discrètement. Les navigateurs livrent désormais WebAssembly, qui exécute les mêmes codecs compilés à une vitesse proche du natif, WebCodecs, qui expose l'encodeur vidéo matériel déjà présent dans votre machine, et une API Canvas capable de décoder et de réencoder des images directement. Le travail pour lequel un serveur était nécessaire tourne maintenant sur l'appareil qui a déjà le fichier.

Bien des outils envoient encore, et il y a des raisons honnêtes : une chaîne de traitement existante que personne ne veut réécrire, un format sans décodeur côté navigateur, un travail réellement trop lourd pour un téléphone. Il y a aussi une raison moins honnête, à savoir qu'un serveur est l'endroit où vivent les comptes, les quotas et les offres payantes. Un outil qui tourne entièrement dans votre navigateur est difficile à compter.

## Quatre vérifications que vous pouvez faire vous-même

Elles fonctionnent sur n'importe quel outil, celui-ci compris. Aucune n'exige de croire qui que ce soit sur parole, et la première prend une dizaine de secondes.

### 1. Débranchez

Chargez la page, puis coupez votre wi-fi ou débranchez le câble, et essayez de vous en servir. Un outil qui fait son travail dans votre navigateur continue exactement comme avant. Un outil qui envoie s'arrête immédiatement, parce que ce qui fait le travail n'est plus joignable.

C'est le test le plus fort qui soit, et le plus difficile à truquer, parce qu'on ne peut pas y répondre par des formulations. Ou bien la conversion s'achève sans réseau, ou bien non.

### 2. Surveillez l'onglet « Réseau »

Ouvrez les outils de développement de votre navigateur, allez dans l'onglet « Réseau », puis servez-vous de l'outil. Chaque requête que fait la page y est listée avec sa taille. Si votre photo de 4 MB a été envoyée, il y a une requête de 4 MB dans cette liste. Si la plus grosse chose qui quitte la page fait quelques kilooctets de publicité, elle ne l'a pas été.

Triez par taille et regardez le haut. Vous n'avez pas besoin de comprendre les requêtes ; vous avez besoin de remarquer si l'une d'elles fait la taille de votre fichier.

### 3. Lisez la Content-Security-Policy

Affichez le code source de la page et cherchez `Content-Security-Policy`, vers le haut. C'est la liste des adresses que cette page a le droit de contacter, et c'est votre navigateur qui l'applique, non les bonnes intentions du site : une requête vers quoi que ce soit d'absent de la liste est refusée, quoi que le code essaie.

La directive qui compte est `connect-src`, qui régit les endroits où la page peut envoyer des données. Si elle nomme une adresse appartenant au site où vous êtes, la page peut y envoyer votre fichier. Si elle ne nomme rien, ou seulement des tiers comme une régie publicitaire, elle ne le peut pas.

Une page sans aucune Content-Security-Policy n'est la preuve de rien de mauvais. Cela veut simplement dire que cette vérification-là n'a rien à vous apprendre.

### 4. Lisez le code

La moins commode, la plus concluante. Si un outil publie son source et le sert sans étape de compilation, les fichiers que votre navigateur a récupérés sont les fichiers que vous pouvez lire. Cherchez-y `fetch`, `XMLHttpRequest` et `sendBeacon`, les trois façons dont une page peut envoyer quoi que ce soit, et regardez ce qu'on leur donne.

La plupart des gens ne le feront pas. Il n'en reste pas moins important que ce soit possible, parce qu'une affirmation que personne ne peut vérifier n'est pas vraiment une affirmation.

## Ce que « tourne dans votre navigateur » ne veut pas dire

Il vaut la peine d'être précis, parce que l'expression est employée à la légère et que ce site doit se tenir au standard qu'il propose.

- **Cela ne veut pas dire aucune requête du tout.** La page elle-même est arrivée par le réseau, et la plupart des outils gratuits portent de la publicité ou de l'analytique qui parlent à quelqu'un. L'affirmation porte sur votre *fichier*, pas sur le trafic en général.
- **Cela ne cache pas votre adresse IP.** Tous les sites que vous visitez la voient, celui-ci compris. Le traitement local porte sur le contenu de vos fichiers, pas sur l'anonymat.
- **Cela ne survit pas à une fonction qui va chercher quelque chose.** Un outil qui vous laisse coller une adresse web doit contacter cette adresse, et ce serveur apprend votre IP et ce que vous avez demandé. C'est inhérent à la fonction plutôt qu'un défaut, mais c'est une vraie exception, et un outil devrait le dire franchement plutôt que de l'arrondir.
- **Ce n'est pas la même chose que « nous supprimons vos fichiers ».** La seconde phrase parle de ce qu'une entreprise choisit de faire. La première parle de ce qui est techniquement possible. Une seule des deux est vérifiable.

## Quand envoyer ne pose vraiment pas de problème

Ce n'est pas un plaidoyer selon lequel tout envoi serait une erreur. Envoyez le fichier quand le contenu n'est pas sensible et que le travail en est facilité ; quand le travail est réellement trop lourd pour votre appareil ; quand le format n'a pas de décodeur côté navigateur ; ou quand vous utilisez un service avec lequel vous avez déjà une relation et dont vous avez réellement lu les conditions.

Soyez plus prudent quand le fichier contient quelque chose que vous ne publieriez pas : pièces d'identité, examens médicaux, contrats, tout ce qui porte une adresse ou un visage que vous n'aviez pas l'intention de partager, ou une photo dont vous n'avez pas regardé les données de lieu. Pour ceux-là, un outil que vous pouvez vérifier vaut mieux qu'un outil auquel vous devez faire confiance, non parce que celui à qui l'on fait confiance risque de vous trahir, mais parce qu'avec celui qui est vérifiable la question ne se pose pas.

## Comment ce site répond à ces quatre vérifications

Ce serait un drôle de guide que celui qui vous dit de vérifier puis demande une dispense. Donc, dans l'ordre :

- **Débranchez.** Ouvrez n'importe quel outil d'ici, coupez la connexion, et il continue de fonctionner. Chaque page d'outil a un indicateur en direct qui vous dit si vous êtes actuellement en ligne : vous pouvez donc le regarder changer.
- **Onglet « Réseau ».** Convertissez quelque chose et lisez la liste. Rien ne transporte votre fichier, une vignette de celui-ci, son nom, sa taille, ni quoi que ce soit qui en soit lu. Il n'existe sur ce site aucun événement d'analytique maison qui aurait quoi que ce soit de cela à envoyer.
- **Content-Security-Policy.** Elle est en tête du code source de chaque page. `connect-src` nomme les points de mesure et de publicité de Google et le bouton de don, et rien d'autre. **Aucune adresse de cette liste n'appartient à ce site**, parce que ce site n'a pas de serveur : ce sont des fichiers statiques. Il n'y a nulle part où envoyer un fichier, même si quelque chose essayait.
- **Le code.** Chaque ligne est [publique](https://github.com/A-Box-of-Tools/website). La compilation retire les commentaires et les espaces et rien d'autre, et vous pouvez l'exécuter vous-même et comparer le résultat à ce qui est servi.

Les exceptions, dites plutôt qu'enterrées : ce site porte de la publicité Google et un compteur de visites, qui parlent tous deux à Google et dont aucun ne reçoit quoi que ce soit sur vos fichiers ; et l'outil [Images en vidéo](https://abox.tools/fr/images-en-video/) peut récupérer une image à une adresse que vous collez, ce qui veut dire que ce serveur voit votre IP. La [page Confidentialité](https://abox.tools/fr/confidentialite/) expose les deux en entier.

Tous les outils d'ici fonctionnent ainsi : un [compresseur d'images](https://abox.tools/fr/compresser-une-image/) qui atteint une taille que vous nommez, un [recadreur de vidéos](https://abox.tools/fr/recadrer-une-video/), un [lecteur et effaceur EXIF](https://abox.tools/fr/supprimer-les-donnees-exif/) pour les données cachées décrites plus haut sur cette page, [images en vidéo](https://abox.tools/fr/images-en-video/), et [images en PDF](https://abox.tools/fr/images-en-pdf/). Tous gratuits, sans compte, et aucun n'a où envoyer vos fichiers.

![Le panneau d'une page d'outil : une ligne disant que les fichiers ne quittent jamais le navigateur, les faits qui l'appuient, et une vérification en direct signalant que la page n'a fait aucune requête réseau.](https://abox.tools/screens/is-it-safe-to-upload-files/pledge.webp)

La dernière des quatre vérifications, répondue sur la page plutôt que dans un paragraphe : le compte est fait par la page à son propre sujet, et vous pouvez faire le même compte dans votre navigateur.
