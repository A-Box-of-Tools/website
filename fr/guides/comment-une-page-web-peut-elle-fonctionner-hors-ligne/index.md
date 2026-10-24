# Comment une page web peut-elle marcher sans le wifi ?

Un service worker peut garder une copie locale. Terminer une opération déconnectée prouve un traitement local, pas tous les chemins futurs. Voici le cache et les vérifications.

Dernière mise à jour 13 octobre 2026

## La réponse courte

Un service worker peut stocker les ressources nécessaires sur votre appareil et répondre ensuite depuis cette copie. Le site conserve page, scripts et moteurs locaux de chaque outil. Le cache doit être terminé ; le navigateur peut le refuser ou l’effacer et les mises à jour nécessiter une connexion. Vérifiez d’abord l’indicateur hors ligne.

Un cache prêt permet une opération locale sans connexion. Cela montre où cette opération a eu lieu, sans garantir toutes les fonctions ni les transmissions futures. Un service worker est un mécanisme de cache, pas une frontière de confidentialité en soi.

## Préparer un vol ou une connexion peu fiable

**Avant le voyage,** ouvrez les outils exacts nécessaires, attendez que chaque indicateur hors ligne annonce sa disponibilité, puis déconnectez-vous et essayez avec un fichier local d'essai. Pour une [chaîne scan vers PDF](https://abox.tools/fr/guides/scanner-plusieurs-pages-en-un-pdf/), chargez scanner et créateur de PDF : visiter l'un ne met pas l'autre en cache. Gardez les fichiers source sur l'appareil et enregistrez chaque résultat vous-même.

**Pour les reçus avec une connexion faible,** mettez l'[extracteur de reçus](https://abox.tools/fr/guides/extraire-recus-et-factures/) et ses ressources OCR en cache avant de partir. Reconnaissance, révision, taux manuels et téléchargements peuvent ensuite fonctionner localement. Une recherche de taux en ligne et l'envoi final de l'e-mail exigent encore leurs connexions.

Revérifiez après avoir effacé le stockage du navigateur, changé de navigateur ou laissé passer une longue période. Un raccourci installé est pratique, mais ne garantit ni la conservation de toutes les ressources en cache ni celle de vos fichiers de travail.

## Ce que prouve la survie au débranchage

La vérification la plus forte du guide sur l'envoi est [débrancher](https://abox.tools/fr/guides/est-il-sur-d-envoyer-ses-fichiers/) : charger l'outil, couper la connexion, s'en servir. Il vaut la peine d'être précis sur la raison pour laquelle cela marche. Un outil qui convertit votre fichier sur un serveur a besoin du réseau à l'instant exact où il travaille — coupez le fil et le travail s'arrête. Un outil qui continue a démontré, et non affirmé, que le travail se passe sur votre machine ; et une page qui ne peut pas atteindre le réseau ne peut envoyer votre fichier nulle part, quoi que son code puisse souhaiter.

Les outils locaux indiquent si la copie est prête et si une connexion existe. Essayez l’opération avec un fichier de votre appareil. Imports d’images, taux en ligne, partage et présentation des caméras ont des étapes réseau expliquées près des commandes.

## Comment la copie reste honnête

Deux questions décident si une copie gardée pour toujours est un cadeau ou un piège, et la mécanique répond aux deux :

- **La copie vieillit-elle ?** Le worker guette une version plus récente quand une connexion existe et l'échange en bloc. Les versions vont en bloc parce que la copie doit toujours être cohérente — moitié vieille, moitié neuve est le seul état qui ne doit jamais être servi.
- **Qu'est-ce qui a été copié, exactement ?** Tout ce dont la page a besoin et rien d'autre — et chaque outil d'ici garde sa copie dans son propre casier. Le cache d'un outil contient cet outil ; en installer un n'en installe pas dix en silence. La copie est de plus inspectable : les outils de développement de votre navigateur listent chaque fichier en cache, et la liste est la même que la page a été chercher au grand jour.

Le résultat est une page qui se comporte comme une application que vous auriez installée en la visitant — ce qui est aussi, littéralement, proposé : la barre d'adresse du navigateur installe n'importe quel outil d'ici comme une application, avec l'icône propre de l'outil, s'ouvrant droit sur l'outil, sans bouton sur la page et sans script qui quémande. La même mécanique, en habit de raccourci.

## Ce que le hors-ligne ne prouve pas

La vérification est forte, pas magique, et ses limites méritent d'être dites aussi nettement que sa force :

- **Il prouve l’opération pendant la déconnexion.** Une page pourrait stocker des données pour les envoyer après. Fermer un onglet n’efface pas le stockage persistant. Examinez code, stockage et requêtes après reconnexion pour vérifier le chemin entier.
- **Il concerne une fonction, pas tout le site.** [Partager](https://abox.tools/fr/partager-du-texte/) et [Caméra distante](https://abox.tools/fr/remote-camera/) nécessitent le rendez-vous public, même en mode local. Les [URL d’images](https://abox.tools/fr/images-en-video/) et [taux en ligne facultatifs](https://abox.tools/fr/extraire-recus-factures/) nécessitent leurs serveurs ; le traitement local peut fonctionner déconnecté.
- **Il ne vous cache pas.** Charger la page a d'emblée donné votre adresse au site, comme tout chargement de page sur le web. Le hors-ligne concerne la destination de vos fichiers, pas l'anonymat.

Combinez réussite hors ligne, examen des requêtes, politique et code. Une opération terminée déconnectée n’a pas nécessité de traitement serveur à ce moment. Un échec n’explique pas seul le besoin de connexion ; aucun résultat ne remplace les limites documentées.
