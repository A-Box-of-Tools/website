# Comment déverrouiller un PDF, et reconnaître son type de verrouillage

« Protégé » recouvre deux choses complètement différentes. L’une est un mot de passe qui bloque réellement l’accès. L’autre est une note dans le fichier demandant au lecteur de ne pas l’imprimer, demande que ce lecteur a accepté de respecter. Les distinguer prend une seconde et détermine toute la suite.

[Ouvrir Déverrouillage PDF](https://abox.tools/fr/deverrouiller-un-pdf/): Les restrictions de permissions et les mots de passe d’ouverture diffèrent. Cette page distingue ceux de votre PDF.

Dernière mise à jour 13 octobre 2026

## La réponse courte

Ouvrez le [Déverrouilleur de PDF](https://abox.tools/fr/deverrouiller-un-pdf/) et déposez le document. En une seconde, il indique laquelle des deux situations suivantes s’applique ; elles sont très différentes :

- **Le document s’ouvre, mais refuse l’impression ou la copie.** S’il ne comporte que des restrictions de permissions, aucun mot de passe n’est requis ici. Le bouton les retire.
- **Le document demande un mot de passe avant de s’ouvrir.** Fournissez un mot de passe utilisateur ou propriétaire valide. Cet outil ne le devine ni ne le récupère.

La suite explique cette différence, utile avant de confier un document à un service qui propose de le déverrouiller.

## Imprimer un relevé ou préparer un fichier verrouillé

Ajoutez votre relevé dont l'impression est bloquée et lisez le rapport. Retirez les permissions s'il s'ouvre sans mot de passe ; sinon fournissez un mot de passe utilisateur ou propriétaire valide. Téléchargez, rouvrez sans mot de passe et contrôlez nombre de pages et aperçu d'impression. Gardez l'original protégé, surtout signé. Les fichiers chiffrés par certificat exigent la clé et ne sont pas traités ici.

Déverrouiller peut aussi commencer un dossier de scans restreints. Passez au [fusionneur](https://abox.tools/fr/guides/fusionner-et-diviser-des-pdf/), retirez les pages inutiles puis [protégez la copie finale](https://abox.tools/fr/guides/proteger-un-pdf/) si un mot de passe reste nécessaire. Examinez le fichier final, pas seulement l'intermédiaire. Retirer le verrou crée une copie ouverte, sans retrouver un mot de passe perdu ni changer vos droits.

## Deux protections, mais un seul vrai verrou

Un PDF peut avoir deux mots de passe. Les lecteurs les présentent presque de la même façon, d’où la confusion.

Le **mot de passe utilisateur**, ou d’ouverture, sert à déchiffrer un document qui l’exige. Un mot de passe utilisateur ou propriétaire valide peut l’ouvrir ici. Sans l’un ou l’autre, cet outil le laisse fermé ; il ne recherche ni mot de passe ni clé.

Le **mot de passe propriétaire** contrôle les *permissions* : impression, copie, modification ou formulaires. Un mot de passe utilisateur vide permet l’ouverture sans demande, tandis que le lecteur applique les restrictions.

Voici ce qu’on explique rarement. Un fichier qui s’ouvre sans rien demander *doit contenir tout ce qui permet de calculer sa propre clé*, puisque votre lecteur vient de le faire sans votre aide. Son contenu est donc chiffré avec une clé accessible à tous. L’interdiction d’imprimer est un champ distinct — des bits d’autorisation — respecté par convention. Adobe le documente ainsi depuis le début. C’est une demande, pas une barrière.

Retirer les restrictions d’un fichier qui s’ouvre déjà ne demande aucune recherche de mot de passe. Retirer ici un mot de passe d’ouverture requis demande celui que vous fournissez. Ce sont deux opérations différentes, identifiées avant de poursuivre.

## Comment savoir lequel vous avez, sans outil

Double-cliquez sur le fichier.

- **Il demande un mot de passe.** C’est un mot de passe utilisateur. Il vous le faut.
- **Il s’ouvre mais une commande est grisée** — imprimer, copier ou remplir un formulaire — et le titre ou les propriétés indiquent “Sécurisé”. Ce sont seulement des restrictions, que l’on peut retirer.

Dans la plupart des lecteurs, les propriétés du document et l’onglet Sécurité détaillent chaque autorisation. Le [Déverrouilleur de PDF](https://abox.tools/fr/deverrouiller-un-pdf/) affiche la même liste et ajoute une information absente des lecteurs : le procédé de chiffrement et sa valeur actuelle.

## La valeur du chiffrement dépend de sa date

Deux documents peuvent annoncer “protégé par mot de passe” et avoir trente ans d’écart en sécurité. Le format a connu cinq générations :

- **RC4, 40 bits** (PDF 1.1, 1994). Conçu pour les limites d’exportation américaines de l’époque. La clé est assez courte pour être parcourue entièrement sur du matériel ordinaire.
- **RC4, 128 bits** (PDF 1.4, 2001). Personne ne parcourt une clé de 128 bits, mais RC4 lui-même est considéré cassé depuis 2013 ; TLS l’a interdit en 2015 et les navigateurs l’ont abandonné au début de l’année suivante.
- **AES-128** (PDF 1.6, 2005). Un chiffrement moderne précédé d’une dérivation de clé de 1994. Le chiffrement est solide, mais cette étape peu coûteuse permet de deviner les mots de passe bien plus vite qu’il ne le suggère.
- **AES-256, première tentative** (2008). Une extension d’Adobe retirée ensuite : son hachage de mot de passe permettait des attaques à la vitesse d’une carte graphique.
- **AES-256, PDF 2.0** (2017). Volontairement coûteux à calculer, et toujours utile. Sa sécurité dépend du mot de passe.

Si l’on vous dit qu’un document est sûr parce qu’il a un mot de passe, posez cette question. Un processus vieux de vingt ans peut encore produire la première protection de cette liste.

## Si vous avez perdu le mot de passe d’ouverture

Cet outil ne récupère pas un mot de passe d’ouverture perdu. Demandez d’abord à l’expéditeur le mot de passe ou une copie accessible et conservez l’original.

Les outils de récupération essaient des candidats ou attaquent une protection faible ou obsolète. Le succès dépend du mot de passe et du chiffrement : un mot court ou prévisible diffère d’un mot fort sous chiffrement moderne. Certains fonctionnent localement, d’autres demandent un envoi. Le déverrouilleur ici n’effectue aucune de ces recherches.

Le [Déverrouilleur de PDF](https://abox.tools/fr/deverrouiller-un-pdf/) ne devine rien et ne le propose pas. Aucun dictionnaire ni boucle d’essais n’existe dans son code, consultable. C’est une limite volontaire : une recherche pourrait réussir sur les plus vieux documents, ce qui explique pourquoi ce refus est explicite.

Essayez d’abord de contacter l’expéditeur, qui garde généralement l’original. Les documents d’entreprise partagent souvent un mot de passe de service, ou utilisent une date de naissance ou des chiffres de compte — c’est courant dans les banques et la paie. Le courriel d’accompagnement décrit presque toujours le mot de passe.

## Faut-il l’envoyer à un site ?

Pensez aux documents à déverrouiller : relevés bancaires non imprimables, fiches de paie, courriers médicaux, contrats non copiables, documents fiscaux. Presque par définition, quelqu’un a jugé leur contenu digne de protection.

Les donner à un site fait arriver le document privé intact sur son serveur, avec le mot de passe d’ouverture si nécessaire. Vous ne pouvez pas vérifier de l’extérieur ce qu’il garde, combien de temps ni qui y accède, quelles que soient ses promesses.

Rien de cela n’est nécessaire. Déverrouiller un PDF consiste à calculer sur des octets : dériver une clé, déchiffrer et réécrire le fichier. Un navigateur le fait parfaitement, comme [cet outil](https://abox.tools/fr/deverrouiller-un-pdf/) : document et mot de passe restent dans l’onglet, même sans réseau. Pour le prouver, déconnectez-vous et utilisez-le quand même.

Une version plus générale de cet argument se trouve dans [est-il sûr d'envoyer ses fichiers](https://abox.tools/fr/guides/est-il-sur-d-envoyer-ses-fichiers/), et la même question pour les documents que l’on regrette le plus d’avoir envoyés dans [est-il sûr d’envoyer un relevé bancaire](https://abox.tools/fr/guides/envoyer-un-releve-bancaire-est-il-sur/).

## Deux effets sur le fichier, et un élément préservé

**Une signature cesse d’être valide.** Retirer le chiffrement invalide la signature numérique : elle couvre les octets exacts du fichier signé et le déverrouillage écrit un nouveau fichier. Tout programme ferait pareil. Gardez l’original : c’est toujours la copie signée.

**Le fichier devient souvent légèrement plus petit.** La réécriture retire les anciennes copies d’objets ajoutées lors des modifications précédentes. C’est un effet secondaire.

**Les pages elles-mêmes restent identiques.** Aucun nouveau rendu, encodage ou réagencement : instructions de dessin, polices et images sont conservées telles quelles. Le texte reste sélectionnable, les scans gardent leur résolution et rien ne bouge. Un outil qui rend les pages floues ou transforme le texte en image a fait autre chose que les déverrouiller.

## Est-ce autorisé ?

Cela dépend de vos droits sur le document, du fichier et de votre pays, plutôt que de la technique.

Le fonctionnement du format est clair : les restrictions sont un champ respecté par convention, pas une barrière cryptographique. Les usages courants sont votre relevé non imprimable, un rapport acheté non copiable, un scan à réordonner ou un formulaire à remplir. Si vous n’avez pas le droit d’utiliser le document, retirer un bit d’autorisation ne vous donne pas ce droit.

## Ensuite

Le document déverrouillé devient ordinaire, utilisable par les autres outils : [le fusionner ou le diviser](https://abox.tools/fr/fusionner-des-pdf/), [réduire sa taille](https://abox.tools/fr/compresser-un-pdf/), ou [effacer correctement un nom](https://abox.tools/fr/caviarder-un-pdf/) — si le verrou protégeait des informations privées, c’est probablement votre prochaine opération.
