# Protéger, transférer et vérifier un PDF

Préparez d'abord le document, protégez son contenu final, puis vérifiez le fichier exact reçu. Un mot de passe contrôle l'ouverture du PDF ; une somme de contrôle vérifie que les octets reçus correspondent à la copie envoyée.

Dernière mise à jour 22 octobre 2026

## Terminez le document avant de le protéger

Vous devez envoyer un fichier fictif `committee-papers.pdf` à une autre personne. Vous souhaitez imposer un mot de passe à l'ouverture et vérifier que la copie téléchargée correspond au fichier final envoyé. Ce sont des fonctions distinctes : la protection contrôle l'ouverture, une somme de contrôle compare les octets, et le transfert amène ces octets au destinataire.

1. Terminez et examinez le document.
2. Générez un mot de passe unique et protégez une copie du PDF.
3. Calculez le SHA-256 de cette copie protégée exacte.
4. Transférez-la et demandez au destinataire de comparer la somme de contrôle.

Terminez d'abord les modifications, la sélection des pages, le caviardage et la compression. Un mot de passe ne retire pas un détail que vous avez oublié de supprimer ; une somme de contrôle ne dit pas si le dossier contient les bonnes pages. Gardez l'original en sécurité. Toute modification ultérieure du fichier protégé exige une nouvelle empreinte.

## Exigez un mot de passe à l'ouverture du PDF

Utilisez le [générateur de mots et phrases de passe](https://abox.tools/fr/generateur-de-mot-de-passe/) pour créer un mot de passe aléatoire, long et unique. Conservez-le dans un endroit où vous pourrez le retrouver en sécurité, par exemple votre gestionnaire de mots de passe. Ne réutilisez pas un mot de passe de compte ni un exemple publié dans un guide. Le [guide du générateur](https://abox.tools/fr/guides/les-generateurs-de-mots-de-passe-en-ligne-sont-ils-surs/) explique la génération locale.

Chargez le document terminé dans l'[outil de protection PDF](https://abox.tools/fr/proteger-un-pdf/) et définissez le mot de passe d'ouverture. Les restrictions d'impression ou de copie sont une autre fonction : un document qui s'ouvre sans mot de passe ne répond pas à l'objectif de ce processus. Gardez le réglage AES-256 par défaut, sauf si une exigence de compatibilité vérifiée impose une autre approche. Le [guide de protection](https://abox.tools/fr/guides/proteger-un-pdf/) décrit les réglages et leurs limites.

Téléchargez `committee-papers-protected.pdf`. Donnez-lui un nom qui ne révèle pas lui-même d'informations privées : chiffrer un document ne masque pas le nom de sa pièce jointe.

## Testez le téléchargement protégé

Ouvrez le fichier téléchargé dans un lecteur PDF et vérifiez qu'il exige le mot de passe d'ouverture. Utilisez le mot de passe conservé, puis lisez les pages. Si le lecteur mémorise les mots de passe, démarrez une nouvelle session ; un aperçu déjà déverrouillé ne montre pas ce que verra le destinataire à la première ouverture.

Confirmez que le destinataire peut utiliser des PDF protégés par mot de passe et que le fichier respecte la limite de l'outil de transfert. Partager du texte et des fichiers limite actuellement chaque fichier à 200 Mo. S'il faut réduire le document, repartez de l'original, compressez-le et examinez-le, puis protégez cette nouvelle version. Faites-le avant de calculer son empreinte.

Gardez l'original et le mot de passe en sécurité. Perdre le mot de passe peut laisser la copie protégée illisible. Pour les étapes suivantes, la pièce jointe est la copie chiffrée ; ne sélectionnez pas l'original par erreur.

## Calculez l'empreinte des octets chiffrés définitifs

Sélectionnez `committee-papers-protected.pdf` dans [Empreinte et somme de contrôle](https://abox.tools/fr/verifier-une-somme-de-controle/) et utilisez son résultat SHA-256. Copiez l'empreinte complète : le SHA-256 compte 64 caractères hexadécimaux. Comparer seulement son début ou sa fin constitue une vérification moins solide. Le [guide des sommes de contrôle](https://abox.tools/fr/guides/verifier-la-somme-de-controle-d-un-telechargement/) explique comment comparer une empreinte attendue.

Deux PDF peuvent sembler identiques et avoir des empreintes différentes. Même chiffrer séparément le même original peut produire des octets différents. Calculez l'empreinte du téléchargement protégé réel, pas d'une version antérieure ni d'une copie non chiffrée enregistrée par un lecteur.

| Élément de travail | Usage |
| --- | --- |
| PDF original | Le garder en sécurité pour de futures modifications |
| PDF protégé | Calculer l'empreinte, transférer et vérifier ce fichier exact |
| Mot de passe d'ouverture | Le donner uniquement au destinataire prévu |
| SHA-256 attendu | Le communiquer par un canal de confiance pour comparaison |

## Transférez la copie protégée

Ouvrez [Partager du texte et des fichiers](https://abox.tools/fr/partager-du-texte/), sélectionnez le téléchargement protégé et invitez le destinataire. Conservez l'accès privé et approuvez l'appareil de réception prévu. Laissez l'onglet émetteur ouvert jusqu'à la fin du téléchargement. Le [guide de partage](https://abox.tools/fr/guides/partager-du-texte-entre-appareils/) présente les choix de connexion et le dépannage.

Cette étape utilise volontairement le réseau. Dans le processus habituel entre appareils, un service de rendez-vous public met les navigateurs en relation ; même le mode réseau local a besoin de cette introduction. Direct transmet le fichier entre les pairs. Choisir Cloud relay fait plutôt passer le trafic WebRTC chiffré par le relais. Le service de mise en relation ne transporte pas le contenu du fichier. Le mot de passe continue aussi de protéger le PDF téléchargé.

Donnez le mot de passe par un canal de confiance distinct. Communiquez aussi l'empreinte attendue par un canal authentifié, par exemple votre conversation habituelle avec le destinataire. Remplacer ensemble un fichier et son empreinte pourrait les faire correspondre ; une empreinte fournie seulement à côté d'un téléchargement non fiable n'établit donc pas son origine.

## Comparez le fichier reçu avant de le modifier

Sur l'appareil de réception, téléchargez le fichier et ouvrez [Empreinte et somme de contrôle](https://abox.tools/fr/verifier-une-somme-de-controle/). Sélectionnez ce PDF reçu, utilisez SHA-256 et comparez toute l'empreinte à la valeur attendue obtenue par un canal de confiance. Le champ de comparaison évite de chercher un caractère erroné à l'œil.

Un SHA-256 identique constitue un indice très solide que les octets reçus correspondent à la copie dont l'expéditeur a calculé l'empreinte. Il n'identifie pas à lui seul l'auteur, ne prouve pas que le contenu est exact et ne rend pas l'ouverture du fichier sûre. Ce processus suppose un document attendu d'un expéditeur connu.

Si les empreintes diffèrent, vérifiez d'abord que les deux personnes ont choisi le même algorithme et la copie protégée. Un original au nom similaire, un nouvel export chiffré ou une version enregistrée plus tard peut expliquer l'écart. Résolvez-le avant de déclarer la copie reçue vérifiée. Ne déchiffrez pas puis ne réenregistrez pas le fichier avant la comparaison : cela changerait ses octets.

Une fois la comparaison réussie, ouvrez ce même fichier avec le mot de passe et confirmez que les pages prévues sont lisibles. Calculer une empreinte et lire répondent à des questions différentes ; cette dernière vérification reste nécessaire.

## Terminez le transfert après confirmation de réception

Fermez l'onglet émetteur après que le destinataire a téléchargé, vérifié et ouvert le document. Cela arrête l'hébergement en direct. Cela n'efface pas une copie déjà téléchargée, et le mot de passe PDF n'offre ni expiration ni révocation à distance. Une personne qui possède le fichier et le mot de passe peut en conserver l'accès.

La remise terminée se vérifie concrètement : le PDF demande un mot de passe d'ouverture, le fichier chiffré reçu correspond au SHA-256 attendu et le destinataire prévu peut lire les pages prévues. Limitez l'invitation au transfert et le partage du mot de passe à ce destinataire.
