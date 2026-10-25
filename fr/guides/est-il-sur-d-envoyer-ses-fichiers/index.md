# Est-il sûr d'envoyer ses fichiers à un convertisseur en ligne ?

La réponse honnête est en général « probablement, mais vous ne pouvez pas le vérifier ». Voici ce que l'envoi fait réellement de votre fichier, pourquoi la plupart des outils le font encore, et quatre tests qui disent si celui que vous avez sous les yeux en a besoin.

Dernière mise à jour 13 octobre 2026

## La réponse courte

Un envoi peut convenir à un fichier non sensible et à un service aux conditions adaptées. Conservation et accès varient selon le prestataire et la fonction ; un compte à rebours de suppression ne prouve pas le sort de chaque copie.

Le problème n'est pas qu'ils mentent. C'est que **vous n'avez aucun moyen de savoir s'ils mentent**. Une fois qu'un fichier a quitté votre machine, chaque promesse sur ce qui lui arrive ensuite est une promesse que vous croyez sur parole : combien de temps il est gardé, qui peut l'atteindre, s'il est copié dans une sauvegarde qui survivra au minuteur de suppression, ce qu'il en advient si l'entreprise est vendue ou piratée. Rien de tout cela n'est visible de l'extérieur.

La question utile n'est donc pas « est-ce que je fais confiance à ce site ? » C'est **« est-ce que ce travail exige que mon fichier parte ? »** Pour un nombre important et croissant de travaux, la réponse est non, et quand la réponse est non, la question de la confiance cesse d'être une question à laquelle vous devez répondre.

## Commencer par la tâche, puis vérifier sa frontière

**Une pièce jointe trop grande.** Suivez le guide [image](https://abox.tools/fr/guides/compresser-une-image-a-une-taille-precise/), [PDF](https://abox.tools/fr/guides/reduire-la-taille-d-un-pdf/) ou [vidéo](https://abox.tools/fr/guides/compresser-une-video/). Travaillez sur une copie, utilisez la limite réelle du destinataire et vérifiez texte lisible ou mouvement jouable dans le téléchargement. Plusieurs pièces peuvent partager une seule limite totale.

**Un dossier de documents ou un exemple d'assistance.** [Sélectionnez et ordonnez les pages demandées](https://abox.tools/fr/guides/fusionner-et-diviser-des-pdf/), [retirez les détails des captures](https://abox.tools/fr/guides/caviarder-une-image/) ou [caviardez le texte PDF pris en charge](https://abox.tools/fr/guides/caviarder-un-pdf/) avant un transfert délibéré. La préparation locale ne décide pas du destinataire.

Pour un convertisseur inconnu, essayez d'abord le parcours exact avec un contenu fictif et les contrôles ci-dessous. Cette répétition peut révéler formats incompatibles, envois prématurés et résultats illisibles avant d'utiliser le vrai document.

## Ce que l'envoi fait réellement

Un envoi transmet des données du fichier du navigateur à un autre ordinateur. Il peut s’agir de l’original ou d’une copie transformée. Choisir un fichier n’est pas l’envoyer : un outil local peut le lire sans le transmettre.

Un traitement serveur peut créer fichiers de travail, journaux de requêtes, résultats en cache et sauvegardes. Ce sont des possibilités à vérifier dans les conditions, pas trois copies nécessairement créées par chaque service. Un test externe de navigateur ne vérifie pas la suppression interne.

Nom et métadonnées peuvent accompagner l’envoi. Une photo peut contenir lieu, heure, appareil, logiciel et vignette ; les champs dépendent du dispositif, des réglages et des modifications. Examinez le fichier sans supposer que chaque photo de téléphone contient tout cela.

## Pourquoi la plupart des outils envoient quand même

Pas parce qu'ils veulent vos fichiers. Parce que, pendant l'essentiel de la vie du web, il n'y avait pas d'alternative. Un navigateur ne savait ni décoder une vidéo, ni réencoder une image à une qualité choisie, ni analyser un format de fichier ; un serveur avec FFmpeg et ImageMagick le savait. L'envoi n'était pas un modèle économique, c'était le seul endroit où le travail pouvait avoir lieu.

Cela a cessé d'être vrai récemment et discrètement. Les navigateurs livrent désormais WebAssembly, qui exécute les mêmes codecs compilés à une vitesse proche du natif, WebCodecs, qui expose l'encodeur vidéo matériel déjà présent dans votre machine, et une API Canvas capable de décoder et de réencoder des images directement. Le travail pour lequel un serveur était nécessaire tourne maintenant sur l'appareil qui a déjà le fichier.

Bien des outils envoient encore, et il y a des raisons honnêtes : une chaîne de traitement existante que personne ne veut réécrire, un format sans décodeur côté navigateur, un travail réellement trop lourd pour un téléphone. Il y a aussi une raison moins honnête, à savoir qu'un serveur est l'endroit où vivent les comptes, les quotas et les offres payantes. Un outil qui tourne entièrement dans votre navigateur est difficile à compter.

## Quatre vérifications que vous pouvez faire vous-même

Vérifiez l’opération et l’entrée que vous comptez utiliser. Chaque contrôle apporte une partie de la réponse ; leur combinaison est plus forte qu’un seul.

### 1. Déconnectez-vous pour l’opération locale

Chargez l’outil complètement et attendez, si nécessaire, son indicateur de cache prêt. Déconnectez-vous puis traitez un fichier de l’appareil. La réussite prouve que cette opération n’a pas nécessité de serveur pendant la déconnexion. Un échec peut venir de ressources manquantes ou du navigateur ; il ne prouve pas un envoi. La réussite ne décrit pas la reconnexion ; le [guide hors ligne](https://abox.tools/fr/guides/comment-une-page-web-peut-elle-fonctionner-hors-ligne/) explique cette limite.

### 2. Examinez les requêtes

Ouvrez DevTools avant, videz la liste et conservez le journal. Examinez destinations, paramètres, corps des requêtes et messages WebSocket. Les tailles affichées décrivent souvent les réponses ; de petites requêtes peuvent transmettre des données extraites ou compressées. Une comparaison avec la taille du fichier ne suffit pas. Les listes ordinaires ne montrent pas les données WebRTC ; lisez le transport et utilisez les diagnostics WebRTC du navigateur.

### 3. Lisez la Content-Security-Policy

La [directive connect-src](https://www.w3.org/TR/CSP3/#directive-connect-src) limite les destinations d’API comme fetch et WebSocket. Un tiers autorisé peut recevoir des données. D’autres directives régissent images, formulaires et ressources ; cette liste ne décrit pas le trafic WebRTC entre pairs. CSP est une contrainte, pas un audit des données ni une preuve isolée d’absence d’envoi.

### 4. Suivez les données dans le code

Comparez code publié et généré. Suivez les fichiers dans fetch, XMLHttpRequest, sendBeacon, WebSocket et RTCPeerConnection ; vérifiez aussi formulaires, URL de ressources et remises à une application. Ce sont des exemples, pas une liste exhaustive. L’essentiel est la donnée remise à chaque chemin, y compris scripts de plateforme et d’avis.

## Ce que « tourne dans votre navigateur » ne veut pas dire

Il vaut la peine d'être précis, parce que l'expression est employée à la légère et que ce site doit se tenir au standard qu'il propose.

- **Cela ne veut pas dire aucune requête du tout.** La page elle-même est arrivée par le réseau, et la plupart des outils gratuits portent de la publicité ou de l'analytique qui parlent à quelqu'un. L'affirmation porte sur votre *fichier*, pas sur le trafic en général.
- **Cela ne cache pas votre adresse IP.** Tous les sites que vous visitez la voient, celui-ci compris. Le traitement local porte sur le contenu de vos fichiers, pas sur l'anonymat.
- **Cela ne survit pas à une fonction qui va chercher quelque chose.** Un outil qui vous laisse coller une adresse web doit contacter cette adresse, et ce serveur apprend votre IP et ce que vous avez demandé. C'est inhérent à la fonction plutôt qu'un défaut, mais c'est une vraie exception, et un outil devrait le dire franchement plutôt que de l'arrondir.
- **Ce n’est pas « nous supprimons vos fichiers ».** Le traitement local indique où s’exécute une opération. La conservation décrit ce qu’un prestataire fait après réception. Lisez l’implémentation et les limites réseau avant de prendre l’une des phrases pour une garantie.

## Quand envoyer ne pose vraiment pas de problème

Ce n'est pas un plaidoyer selon lequel tout envoi serait une erreur. Envoyez le fichier quand le contenu n'est pas sensible et que le travail en est facilité ; quand le travail est réellement trop lourd pour votre appareil ; quand le format n'a pas de décodeur côté navigateur ; ou quand vous utilisez un service avec lequel vous avez déjà une relation et dont vous avez réellement lu les conditions.

Soyez plus prudent quand le fichier contient quelque chose que vous ne publieriez pas : pièces d'identité, examens médicaux, contrats, tout ce qui porte une adresse ou un visage que vous n'aviez pas l'intention de partager, ou une photo dont vous n'avez pas regardé les données de lieu. Pour ceux-là, un outil que vous pouvez vérifier vaut mieux qu'un outil auquel vous devez faire confiance, non parce que celui à qui l'on fait confiance risque de vous trahir, mais parce qu'avec celui qui est vérifiable la question ne se pose pas.

## Comment ce site répond à ces quatre vérifications

Ce serait un drôle de guide que celui qui vous dit de vérifier puis demande une dispense. Donc, dans l'ordre :

- **Hors ligne.** Le traitement local fonctionne avec ressources chargées et cache prêt. Images web, taux en ligne et présentation des navigateurs nécessitent leurs connexions.
- **Requêtes.** Le code de traitement n’envoie pas les fichiers choisis. Vues de pages et réponses fixes facultatives sont distinctes. Les taux transmettent devises et date ; les fonctions entre pairs envoient volontairement du contenu au navigateur choisi.
- **Politique.** La plupart héritent des destinations de plateforme. Les reçus ajoutent Frankfurter ; partage et caméra ajoutent le rendez-vous. La politique limite des destinations, sans prouver chaque donnée.
- **Code.** Le [code est public](https://github.com/A-Box-of-Tools/website). Compilez et comparez le résultat, composants partagés et moteurs inclus compris.

La [page de confidentialité](https://abox.tools/fr/confidentialite/) décrit les limites : [imports par URL](https://abox.tools/fr/images-en-video/), [taux facultatifs et remise aux applications](https://abox.tools/fr/extraire-recus-factures/), [partage entre navigateurs](https://abox.tools/fr/partager-du-texte/) et [caméra distante](https://abox.tools/fr/remote-camera/), ainsi que publicité, Analytics et avis fixes. Transférer volontairement est distinct d’envoyer pour traitement.

Exemples locaux : [compresser vers une taille cible](https://abox.tools/fr/compresser-une-image/), [recadrer une vidéo](https://abox.tools/fr/recadrer-une-video/), [supprimer EXIF et GPS](https://abox.tools/fr/supprimer-les-donnees-exif/) et [créer un PDF à partir d’images](https://abox.tools/fr/images-en-pdf/). Vérifiez formats et résultat. Ces tâches n’exigent ni envoi pour traitement ni compte.

![Panneau de confidentialité montrant le traitement local, les références au code et le résumé des ressources chargées.](https://abox.tools/screens/is-it-safe-to-upload-files/pledge.webp)

Le panneau affiche l’affirmation et les sources correspondantes. Le résumé aide à examiner les requêtes du navigateur, mais n’inspecte pas lui-même les données.
