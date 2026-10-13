# Comment protéger un PDF par mot de passe, et ce que cette protection vaut réellement

Un mot de passe sur un PDF empêche réellement les autres de l’ouvrir. Une restriction d’impression ou de copie leur demande gentiment de s’abstenir. Les deux peuvent être utiles, et leur différence détermine ce que vous pouvez promettre à la personne qui reçoit le fichier.

[Ouvrir Protection PDF](https://abox.tools/fr/proteger-un-pdf/): Verrouillez un document sans le confier à un site pour le protéger.

Dernière mise à jour 12 septembre 2026

## La réponse courte

Ouvrez le [Protecteur PDF](https://abox.tools/fr/proteger-un-pdf/), déposez le document, saisissez deux fois un mot de passe et appuyez sur le bouton. Le fichier est chiffré en AES-256 dans votre navigateur, puis rouvert — sans le mot de passe, où il doit être refusé, puis avec lui — avant le téléchargement. Aucun envoi ; cela fonctionne aussi sans Internet.

La suite explique ce que vous venez de faire : un mot de passe et une restriction sont différents, et cette différence détermine les promesses que vous pouvez tenir.

## Les deux protections d’un PDF

Un PDF peut avoir deux mots de passe. Les lecteurs les présentent si pareillement que beaucoup de gens ignorent leur différence.

Le **mot de passe d’ouverture** — le mot de passe *utilisateur* — est un verrou. Le contenu est réellement chiffré, la clé provient du mot de passe et celui-ci n’est enregistré nulle part dans le document. Sans lui, personne ne lit le fichier : ni le destinataire, ni un site, ni le programme qui l’a créé.

Les **restrictions** — interdire l’impression, la copie ou la modification, sous le contrôle du mot de passe *propriétaire* — sont une demande. Voici ce qu’on explique rarement : un document qui s’ouvre sans demander de mot de passe *doit contenir tout ce qui permet de calculer sa propre clé*, puisque votre lecteur vient de le faire. L’interdiction d’imprimer est donc un autre champ du fichier, des bits d’autorisation respectés par convention. Adobe l’a documenté ainsi dès le début, et un lecteur peut les ignorer. Le [déverrouilleur de ce site](https://abox.tools/fr/guides/deverrouiller-un-pdf/) le fait.

Cela ne rend pas les restrictions inutiles. La plupart des lecteurs les respectent ; cocher “interdire l’impression” exprime votre souhait. Cela explique seulement pourquoi il ne faut pas *compter* sur elles. Si le document doit rester illisible pour une mauvaise personne, définissez un mot de passe d’ouverture. Si vous préférez empêcher l’impression, cochez la case en sachant qu’il s’agit d’une demande, pas d’une garantie.

## Quel chiffrement choisir

L’outil en propose deux. Le choix par défaut convient sauf raison précise.

- **AES-256**, le procédé PDF 2.0 de 2017, est le choix par défaut. Le mot de passe passe par un hachage volontairement coûteux, avec un nombre de tours variable selon les données, ce qui complique la construction de matériel de recherche. Tous les lecteurs depuis Acrobat X en 2010 l’ouvrent — navigateurs, téléphones et lecteurs actuels. Sa sécurité dépend du mot de passe.
- **AES-128**, le procédé de 2005, sert à un lecteur antérieur à 2010 qui doit ouvrir le fichier. Le chiffrement est solide. La transformation du mot de passe en clé, datant de 1994, est moins robuste et permet des essais bien plus rapides que ne le laisse penser le chiffrement. Si vous ignorez quel lecteur sera utilisé, choisissez 256.

Ces deux procédés diffèrent énormément du premier chiffrement PDF : une clé de 40 bits de 1994 qu’un portable peut parcourir entièrement. Les lecteurs leur donnent pourtant la même mention. Si l’on affirme qu’un document est sûr parce qu’il a un mot de passe, demandez de quelle génération il s’agit. Le [Déverrouilleur de PDF](https://abox.tools/fr/deverrouiller-un-pdf/) l’indique pour chaque fichier déposé.

## Pourquoi le mot de passe compte plus que le procédé

Avec AES-256, aucun raccourci ne traverse le chiffrement : sans le mot de passe, il faut le deviner. Le hachage ralentit chaque essai, mais lent ne signifie pas impossible. Un mot de six caractères représente quelques millions d’essais ; une phrase mémorisable, beaucoup plus. La page compte les caractères et signale un mot de passe court. Retenez ceci : le document est aussi sûr que son mot de passe, et la longueur ne coûte rien.

Deux conséquences : saisissez-le deux fois — la page l’exige, car une faute dans un mot de passe fort rend le document inaccessible. Gardez aussi l’original. Protéger crée un nouveau fichier et laisse l’original intact ; c’est lui qui vous servira si le mot de passe est perdu.

## Si vous l’oubliez

Le document est alors perdu. Mieux vaut le savoir ici que chez un site de “récupération de mot de passe PDF” qui reçoit d’abord votre fichier. Ces sites essaient un dictionnaire, des motifs, puis toutes les possibilités. Avec un vrai mot de passe et le procédé actuel, ils n’aboutissent pas. La plupart envoient le document à un serveur, et beaucoup facturent avant d’annoncer le résultat.

Ce site ne devine rien. Le déverrouilleur ne contient aucune boucle pour le faire, et le protecteur demande deux saisies précisément parce qu’il n’y a pas de retour possible. C’est une limite volontaire.

## Pourquoi l’envoi est la partie étrange

Pensez à ce que vous protégez : relevé bancaire, contrat, courrier médical, documents fiscaux, passeport numérisé pour un bailleur. Presque par définition, un document auquel vous ajoutez un mot de passe ne doit pas traîner chez d’autres personnes.

Chaque outil en ligne demande pourtant d’abord l’original déverrouillé et le mot de passe choisi, sur un serveur dont la conservation reste invisible. Quelles que soient ses intentions, vous envoyez le document privé intact et sa clé à un inconnu pour le rendre privé.

Rien de cela n’est nécessaire. Protéger un PDF consiste à calculer sur des octets — dériver une clé, chiffrer, réécrire le fichier — et un navigateur fait ces trois opérations. C’est ce que [cet outil](https://abox.tools/fr/proteger-un-pdf/) fait. Document et mot de passe restent dans l’onglet. La politique de la page nomme toutes les adresses joignables, aucune sur ce site, et elle fonctionne sans réseau. Pour le vérifier, déconnectez-vous et utilisez-la quand même.

Une version plus générale de cet argument se trouve dans [est-il sûr d'envoyer ses fichiers](https://abox.tools/fr/guides/est-il-sur-d-envoyer-ses-fichiers/), et la même question pour le document que l’on regrette le plus d’avoir envoyé dans [est-il sûr d’envoyer un relevé bancaire](https://abox.tools/fr/guides/envoyer-un-releve-bancaire-est-il-sur/).

## Deux effets sur le fichier, et un élément préservé

**Une signature cesse d’être valide.** Protéger un document signé numériquement invalide sa signature : celle-ci couvre les octets exacts du fichier original, et la protection écrit un nouveau fichier. Tout programme aurait le même effet. Si vous avez besoin des deux, protégez d’abord puis signez la copie protégée.

**La taille change légèrement.** Le chiffrement ajoute seize octets à chaque flux et chaîne ; la réécriture retire les anciennes copies d’objets ajoutées par des modifications précédentes. L’effet net dépend du fichier.

**Les pages elles-mêmes restent identiques.** Aucun nouveau rendu, encodage ou réagencement : instructions de dessin, polices intégrées et images sont chiffrées telles quelles. Avec le mot de passe, le texte reste sélectionnable, les scans gardent leur résolution et rien ne bouge.

## Changer un mot de passe existant

Le format ne permet qu’un verrou : un document demandant déjà un mot de passe ne peut pas en recevoir un second. L’outil le refuse et propose le [Déverrouilleur de PDF](https://abox.tools/fr/deverrouiller-un-pdf/), qui retire l’ancienne protection dans le même navigateur. Revenez avec la copie déverrouillée pour lui donner le nouveau mot de passe. Un document avec seulement des restrictions — ouvert à tous mais non imprimable — est accepté, avec l’avertissement que vos réglages remplacent les précédents.

## Avant de le protéger

Un document verrouillé doit passer par le déverrouilleur avant les autres outils. Faites donc d’abord les autres opérations — [le fusionner ou le diviser](https://abox.tools/fr/fusionner-des-pdf/), [réduire sa taille](https://abox.tools/fr/compresser-un-pdf/), et surtout [supprimer tout contenu qui ne devrait pas y figurer](https://abox.tools/fr/caviarder-un-pdf/), car un mot de passe protège contre les inconnus mais ne limite pas ce que votre destinataire peut lire.
