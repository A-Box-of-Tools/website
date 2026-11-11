# La navigation privée protège-t-elle les fichiers téléchargés ?

Fermer toutes les fenêtres privées termine cette session privée. Le sort d'un document téléchargé dépend du navigateur, de ses réglages et de l'endroit où vous l'avez enregistré. Vérifiez ces points séparément avant d'utiliser un appareil partagé.

Dernière mise à jour 22 octobre 2026

## Une session privée et un fichier enregistré ont des durées de vie différentes

Imaginez que vous téléchargiez un projet de budget d'événement sur un ordinateur partagé. Vous fermez la fenêtre privée et la page disparaît. Cela vous dit que la fenêtre est fermée ; cela ne vous dit pas qui peut ouvrir le budget depuis les dossiers de l'ordinateur.

Séparez trois questions : ce que le navigateur conserve de la session, l'endroit où le fichier téléchargé est stocké et l'existence d'une copie dans une autre application ou un autre service. Effacer l'un ne prouve pas que les autres sont effacés. Ce guide concerne les navigateurs de bureau et une vérification sans risque à effectuer avant de traiter un vrai document.

## Vérifiez ce que votre navigateur efface réellement

Une entrée d'historique de téléchargement est la trace que le navigateur garde d'un téléchargement. Le fichier téléchargé est le document ou l'image enregistré. Retirer l'entrée et retirer le fichier sont deux opérations distinctes.

- **Chrome en navigation privée :** la session se termine lorsque toutes les fenêtres privées sont fermées. Chrome retire les cookies et données de site de cette session, tandis que les fichiers téléchargés restent sur l'appareil jusqu'à leur suppression. Consultez [les conseils de Google sur le mode privé](https://support.google.com/chrome/answer/95464?hl=en).
- **Microsoft Edge InPrivate :** fermer toutes les fenêtres InPrivate efface les données de session, y compris l'historique des téléchargements. Les téléchargements enregistrés restent disponibles. Microsoft décrit les deux comportements dans [ses conseils sur InPrivate](https://support.microsoft.com/en-us/edge/browse-inprivate-in-microsoft-edge).
- **Navigation privée Firefox :** Firefox permet de choisir de garder ou de supprimer les téléchargements privés à la fin de la session. Vérifiez la préférence de téléchargement dans votre navigateur installé ; ne supposez aucun des deux résultats. Mozilla décrit ce choix dans les [notes de version de Firefox 143](https://www.firefox.com/en-US/firefox/143.0/releasenotes/).

Un fichier conservé peut exposer des informations, tandis qu'un réglage de nettoyage peut retirer un fichier que vous pensiez garder. Vérifiez le comportement avec un fichier jetable avant de vous y fier.

## Vous connecter vous identifie toujours auprès du service

Si vous vous connectez à un service de documents dans une fenêtre privée, le service connaît le compte utilisé. La navigation privée ne rend pas anonyme une action liée à un compte. Mozilla l'explique dans ses [conseils sur la navigation privée](https://support.mozilla.org/en-US/kb/common-myths-about-private-browsing).

Dans l'exemple du budget d'événement, fermer le navigateur ne signifie pas que l'original conservé par le service a disparu. Traitez le document en ligne et la copie téléchargée séparément. Déconnectez-vous du site à la fin et fermez toutes les fenêtres privées que vous avez ouvertes.

La navigation privée ne rend pas non plus l'activité invisible aux sites ni aux organisations qui fournissent votre réseau. [Les conseils de Google](https://support.google.com/chrome/answer/95464?hl=en) expliquent cette limite. Utilisez le mode privé pour la séparation de sessions qu'il apporte, et décidez séparément si l'appareil et le service conviennent à votre tâche.

## Regardez le dossier de destination

Avant le téléchargement, identifiez l'emplacement réel d'enregistrement. Un fichier dans un dossier accessible à une autre personne utilisant l'ordinateur peut rester lisible, quelle que soit la fenêtre qui l'a créé. Un nom comme `event-budget-draft.pdf` peut lui-même révéler le sujet.

Vérifiez si la destination est synchronisée. Enregistrer dans un dossier OneDrive peut synchroniser le fichier vers le cloud ; la [documentation OneDrive de Microsoft](https://support.microsoft.com/en-us/onedrive/sync-your-computer-s-files-and-folders-with-onedrive) explique comment les modifications du dossier se synchronisent avec le service. Fermer une fenêtre privée ne contrôle pas cette application distincte.

Comptez aussi les copies créées volontairement : un autre export, une pièce jointe de courriel ou une version enregistrée dans un éditeur de bureau. Vérifiez chaque destination plutôt que de supposer que le navigateur gère toutes les copies. Savoir si un outil envoie des fichiers pour les traiter est encore une autre question ; consultez le [guide sur l'envoi de fichiers pour traitement](https://abox.tools/fr/guides/est-il-sur-d-envoyer-ses-fichiers/).

## Essayez le processus avec un fichier de test

Utilisez une image ou un document contenant uniquement des données fictives. Cet exercice vérifie un comportement observable sur votre ordinateur ; ce n'est pas un test d'effacement sécurisé.

1. Notez le navigateur utilisé. Dans Firefox, examinez la préférence de téléchargement privé pour savoir quel résultat attendre.
2. Ouvrez une fenêtre privée et confirmez que le navigateur indique le mode privé. Effectuez le travail prévu sur les données fictives.
3. Téléchargez explicitement le résultat dans un dossier que vous saurez retrouver. Donnez-lui un nom de test reconnaissable et attendez la fin du téléchargement. Afficher un document dans un onglet n'est pas la même vérification que l'enregistrer.
4. Ouvrez le dossier de destination dans le gestionnaire de fichiers du système et confirmez la présence du fichier de test.
5. Terminez tout autre travail de la session privée, puis fermez toutes ses fenêtres privées. Revenez au même dossier et vérifiez si le fichier de test reste présent et peut être ouvert.

S'il reste, le fichier a survécu à la session. S'il disparaît, vous avez observé le nettoyage de ce fichier avec cette configuration. Cela ne prouve rien sur les copies d'un autre dossier ou service. Retirez votre résultat de test jetable une fois terminé.

## Choisissez le processus avant d'utiliser un vrai fichier

Décidez où doit vivre la copie nécessaire et qui doit y accéder. Privilégiez un appareil et un compte du système dont vous contrôlez l'accès. Si vous ne pouvez pas établir un emplacement adapté sur un ordinateur partagé, reportez cette partie du travail ou utilisez un autre appareil.

Ensuite, examinez séparément la source, le téléchargement final et les exports intermédiaires. Supprimez les copies inutiles par le système concerné en respectant les règles de conservation applicables à votre travail. Un fichier placé dans une corbeille peut y rester récupérable ; par exemple, [Apple précise que la corbeille du Mac conserve les éléments jusqu'à ce qu'elle soit vidée](https://support.apple.com/en-ie/guide/mac-help/mchlp1093/mac). Un nettoyage ordinaire ne garantit pas l'effacement de toutes les copies.

Le résultat utile est une décision délibérée concernant le fichier enregistré : vous savez quel document reste, où il se trouve et si cet emplacement convient. Un historique de navigateur vide ne répond pas à ces questions.
