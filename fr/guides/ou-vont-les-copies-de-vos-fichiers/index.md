# Où vont les copies de vos fichiers ?

Le traitement local décrit ce qui se passe dans l'outil. Les copies enregistrées, synchronisées et partagées ont leurs propres destinations. Suivez un document anodin pour comprendre ces limites.

Dernière mise à jour 22 octobre 2026

## Commencez par un fichier sans données sensibles

Le traitement local décrit l'endroit où un outil travaille sur votre fichier. L'emplacement d'enregistrement du navigateur, les logiciels de synchronisation cloud et les réglages de sauvegarde déterminent ce qui arrive ensuite au résultat enregistré. Fermer l'outil ne gère pas ces copies à votre place. Le [guide sur l'envoi de fichiers pour traitement](https://abox.tools/fr/guides/est-il-sur-d-envoyer-ses-fichiers/) explique cette première limite ; ce guide suit les fichiers enregistrés.

Imaginez `workshop-handout.pdf`, contenant un horaire fictif et un dessin. Vous exportez une version plus petite sous `workshop-handout-small.pdf`, puis copiez ce résultat dans un dossier pour l'événement. Vous avez un original, un export téléchargé et une autre copie enregistrée avant même de considérer les sauvegardes.

Utilisez un fichier tout aussi anodin pour comprendre votre configuration. L'objectif est de savoir où vivent les copies utiles, quels comptes ou appareils peuvent y accéder et quels fichiers intermédiaires ont fini de servir.

## Repérez le résultat téléchargé

Trouvez le fichier exporté dans votre gestionnaire de fichiers et notez le chemin complet de son dossier. Ne déduisez pas son emplacement de son nom ni du fait que le navigateur l'a ouvert.

Chrome permet de choisir un dossier de téléchargement par défaut ou de demander une destination à chaque fois. Il s'agit normalement du dossier Téléchargements de l'utilisateur, mais les réglages peuvent le modifier. La [documentation de Google sur les téléchargements](https://support.google.com/chrome/answer/95759?hl=en) distingue la trace du navigateur du fichier : retirer une entrée de l'historique de téléchargement laisse le fichier enregistré sur l'ordinateur.

Dans l'exemple, notez `Downloads/workshop-handout-small.pdf`. Si vous l'avez copié ailleurs, inscrivez séparément ce deuxième emplacement. Ouvrez les deux fichiers avant de décider que l'un est superflu.

## Vérifiez si le dossier de destination est synchronisé

Un dossier visible dans votre gestionnaire de fichiers peut aussi être relié à un compte cloud. Vérifiez son emplacement réel et les réglages de l'application de synchronisation, plutôt que de supposer que Documents signifie que le fichier existe uniquement sur cet ordinateur.

OneDrive peut sauvegarder des dossiers sélectionnés et rendre leur contenu disponible sur d'autres appareils. La [documentation Microsoft sur la sauvegarde des dossiers](https://support.microsoft.com/en-us/onedrive/back-up-your-folders-with-onedrive) explique comment voir lesquels sont inclus. Cela s'applique lorsque la fonction est configurée ; cela ne signifie pas que tous les dossiers Documents sont automatiquement synchronisés.

Supposons que le dossier de l'événement se trouve dans un dossier Documents sauvegardé vers OneDrive. Ajoutez le compte cloud à votre inventaire. Vérifiez aussi les partages : savoir où un fichier existe et savoir qui peut y accéder sont deux questions distinctes.

## Dressez un petit inventaire des copies

Notez ce que vous avez réellement trouvé et marquez les emplacements incertains à vérifier. Votre configuration peut comporter moins ou plus d'entrées que cet exemple.

| Emplacement et copie | Décision à prendre |
| --- | --- |
| Dossier du projet : document original | Le garder s'il sert à des modifications ultérieures |
| Téléchargements : export réduit | L'examiner après vérification de la copie retenue pour l'événement |
| Dossier de l'événement : export vérifié | Le garder comme copie de travail pour l'événement |
| Compte cloud : dossier synchronisé, si activé | Vérifier le compte et les accès partagés |
| Sauvegarde : versions antérieures, si enregistrées | Vérifier son rôle et sa conservation |
| Corbeille : exports supprimés, si conservés | Examiner uniquement les éléments concernés |

Des noms identiques ne prouvent pas que deux fichiers contiennent la même version. Vérifiez leur contenu et identifiez la copie à utiliser avant de retirer un export intermédiaire.

## Incluez les sauvegardes et les versions antérieures

Les sauvegardes servent à éviter que la perte ou la modification d'un fichier de travail fasse disparaître définitivement son contenu. Cette protection est utile, et elle signifie qu'une ancienne version peut rester accessible après le remplacement de la version actuelle.

L'Historique des fichiers de Windows peut enregistrer des versions sur un disque externe ou un emplacement réseau lorsqu'il est configuré. Microsoft explique ce qu'il couvre et son fonctionnement de restauration dans [Sauvegarder et restaurer avec l'Historique des fichiers](https://support.microsoft.com/en-us/windows/experience/backup-recovery/backup-and-restore-with-file-history).

Vérifiez les dossiers couverts et la durée de conservation des versions. Notez ces informations plutôt que de supprimer des dossiers de sauvegarde pour ranger un seul document. Une sauvegarde peut contenir l'unique copie récupérable d'un autre travail. Sur un ordinateur administré, suivez la procédure de l'organisation pour modifier la conservation ou supprimer des documents.

## Comprenez ce que change une action de suppression

Des actions différentes touchent des emplacements différents. Dans OneDrive, rendre un fichier disponible uniquement en ligne retire son contenu téléchargé de l'appareil tout en préservant le fichier cloud. Supprimer un fichier synchronisé peut affecter le cloud et les autres appareils synchronisés. La [documentation Microsoft sur les fichiers à la demande](https://support.microsoft.com/en-us/onedrive/save-disk-space-with-onedrive-files-on-demand-for-windows) explique ces différences. Vérifiez l'action avant de l'utiliser pour gérer une copie.

Des fichiers supprimés peuvent rester récupérables. OneDrive a sa propre corbeille et la conservation dépend du type de compte et des réglages ; un fichier uniquement dans le cloud n'apparaît pas nécessairement dans la corbeille de l'ordinateur. Consultez les [conseils Microsoft de récupération des fichiers supprimés](https://support.microsoft.com/en-us/onedrive/restore-your-onedrive-files).

Retirer un fichier d'un dossier visible établit seulement ce qui s'est passé à cet emplacement. Cela ne prouve pas que les exports distincts, les sauvegardes ou les copies déjà partagées ont disparu.

## Choisissez ce que vous gardez, puis vérifiez-le

Pour l'atelier, gardez la source nécessaire aux futures modifications et la copie vérifiée pour l'événement. Examinez le téléchargement en trop après avoir confirmé que l'export conservé s'ouvre correctement. Gardez les sauvegardes utiles selon leur politique de conservation et laissez les éléments incertains tranquilles jusqu'à ce que vous les compreniez.

- Ouvrez le fichier choisi pour être conservé et confirmez son contenu.
- Vérifiez son dossier, son compte cloud et ses modalités de partage.
- Retirez uniquement les copies précises dont l'utilité a pris fin, après avoir vérifié l'effet de l'action.
- Notez toute sauvegarde ou tout autre emplacement restant à examiner.

Pour le prochain export, choisissez délibérément sa destination et donnez-lui un nom clair. Refaites cette vérification en fin de tâche, tant que vous vous souvenez des originaux, des essais et des résultats finaux.
