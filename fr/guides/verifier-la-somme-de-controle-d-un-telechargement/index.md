# Comment vérifier un téléchargement avec sa somme de contrôle

La ligne hexadécimale sous un lien de téléchargement est là pour que vous puissiez prouver que le fichier est arrivé intact. La comparer prend une minute. Savoir ce que vaut cette comparaison — et quelle habitude la rend sans valeur — prend le reste de cette page.

[Ouvrir Hachage & somme de contrôle](https://abox.tools/fr/verifier-une-somme-de-controle/): Vérifier un téléchargement face au nombre publié par son auteur, sans l’envoyer à personne.

Dernière mise à jour 26 août 2026

## La réponse courte

Ouvrez [Hachage & somme de contrôle](https://abox.tools/fr/verifier-une-somme-de-controle/), déposez dessus le fichier téléchargé et collez dans le champ du bas la somme donnée par la page de téléchargement. La page déduit de la longueur de quel algorithme il s'agit et répond par une phrase.

Si cela correspond, les octets sur votre disque sont ceux que l'auteur a mesurés. Sinon, retéléchargez le fichier avant de l'ouvrir. Tout ce qui suit est ce que cette phrase laisse de côté.

## Ce qu'est le nombre sous le lien de téléchargement

La sortie d'une fonction de hachage : un calcul qui lit chaque octet d'un fichier et produit une réponse courte, de longueur fixe. Le même fichier donne toujours la même réponse, et un fichier qui diffère d'un seul bit en donne une complètement différente : pas une réponse presque identique, une réponse sans rapport. Toute l'affaire repose sur cette propriété.

Comme la réponse est courte et le fichier ne l'est pas, le calcul jette de l'information, et il existe forcément beaucoup de fichiers qui partagent une même réponse. En trouver un exprès est la partie difficile, et sa difficulté est ce qui sépare les algorithmes ci-dessous les uns des autres.

Une somme de contrôle n'a rien de secret et ne s'inverse pas. C'est une empreinte, publiée pour que deux personnes puissent s'accorder sur le fait qu'elles tiennent la même chose.

## Quel algorithme vous avez sous les yeux

Vous n'avez pas à choisir : l'auteur l'a déjà fait, et votre travail est de calculer le même. La longueur suffit à le reconnaître :

- **32 caractères hexadécimaux** — MD5.
- **40** — SHA-1.
- **64** — SHA-256, et c'est celui que vous verrez le plus.
- **96** — SHA-384.
- **128** — SHA-512.

Aucun n'a la longueur d'un autre, ce qui permet à l'outil d'identifier une valeur collée sans qu'on le lui dise. Une chaîne de 63 caractères n'est la somme de rien du tout : c'est un SHA-256 qui a perdu un caractère en chemin vers le presse-papiers.

![La carte des résultats : les empreintes MD5, SHA-1, SHA-256 et SHA-512 d'un fichier, chacune avec un bouton de copie.](https://abox.tools/screens/verify-a-file-checksum/digests.webp)

Toutes d'un coup, parce que laquelle employer est décidé par qui a publié le fichier, et non par vous.

## Sur votre propre machine, sans navigateur

Chaque système d'exploitation embarque de quoi faire cela, et connaître la commande vaut la peine même si vous passez par une page. À la question « comment savoir si votre site a calculé honnêtement », il n'y a pas de meilleure réponse que de passer le même fichier dans l'outil livré avec votre ordinateur.

**Windows**, dans PowerShell :

```
Get-FileHash .\disk.iso -Algorithm SHA256
```

Les machines plus anciennes ont à la place `certutil -hashfile disk.iso SHA256`, qui écrit en majuscules avec des espaces. La casse ne compte jamais dans une comparaison de sommes : ces lettres sont des chiffres, pas des mots.

**macOS**:

```
shasum -a 256 disk.iso
```

**Linux**:

```
sha256sum disk.iso
```

Les trois impriment la même chaîne pour le même fichier, et ce site aussi. Ce sont des spécifications exactes avec des vecteurs de test publiés ; il n'y a pas de place pour qu'une implémentation ait un avis.

## Comparer sans y laisser ses yeux

Ne lisez pas soixante-quatre caractères sur deux écrans pour décider qu'ils se ressemblent. Les gens vérifient les quatre premiers et les quatre derniers puis s'arrêtent, ce qui est exactement la comparaison qu'un attaquant s'arrangerait pour passer, et c'est aussi ainsi qu'une erreur de bonne foi passe.

Collez les deux dans quelque chose qui compare pour vous. En ligne de commande, c'est à cela que sert l'option `-c` :

```
sha256sum -c SHA256SUMS
```

Dans un navigateur, c'est le champ de comparaison de [Hachage & somme de contrôle](https://abox.tools/fr/verifier-une-somme-de-controle/), qui prend la valeur sous la forme où l'auteur l'a écrite : hexadécimal seul, ligne de `sha256sum`, fichier `SHA256SUMS` entier, forme `SHA256 (disk.iso) = …`, ou `integrity="sha384-…"` pris sur une balise de script. Il répond oui ou non, en une phrase.

![La carte de comparaison : une empreinte collée dans un champ, et un verdict disant qu'elle correspond au fichier.](https://abox.tools/screens/verify-a-file-checksum/compare.webp)

Collez ce que disait la page de téléchargement et laissez l'outil comparer. Lire soixante-quatre caractères à l'écran est l'étape que cela supprime.

## Ce qu'une correspondance prouve, exactement

Que les octets sur votre disque sont ceux que quelqu'un avait devant lui en notant ce nombre. C'est vraiment utile à savoir, et c'est plus étroit que la plupart des gens ne le supposent : la liste vaut donc la peine.

**Une correspondance écarte :**

- un téléchargement qui s'est arrêté trop tôt en laissant un fichier d'apparence complète ;
- une corruption en transit, sur un disque en fin de vie ou par un mauvais câble USB ;
- le mauvais fichier : la version ARM au lieu de la x86, ou la publication du mois dernier ;
- un miroir qui sert discrètement autre chose que ce qu'il annonce.

**Une correspondance n'écarte pas :**

- **que le fichier soit malveillant.** Un auteur peut mesurer un logiciel malveillant aussi exactement qu'autre chose. Une somme dit « voilà ce qui a été publié », jamais « c'est sans danger » ;
- **que l'auteur ait été compromis.** Si quelqu'un a remplacé le fichier sur le serveur, il a remplacé la somme imprimée dessous dans la même minute. Ce qui nous amène à la section suivante.

## L'erreur qui vide tout l'exercice de son sens

Prendre la somme de contrôle sur la même page, par la même connexion, que le fichier.

Demandez-vous contre quoi vous vous protégez. Si c'est contre un téléchargement abîmé, la somme peut venir de n'importe où et la vérification fonctionne. Si c'est contre quelqu'un qui aurait trafiqué le fichier, alors celui qui pouvait changer le fichier pouvait changer la ligne hexadécimale imprimée dessous, puisque les deux venaient du même serveur par la même connexion. Vous demanderiez au faussaire de confirmer la signature.

Une somme de contrôle vaut le plus quand elle vous parvient par une voie que le fichier n'a pas prise :

- un fichier `SHA256SUMS` avec une signature GPG détachée, vérifiée contre une clé que vous aviez déjà : c'est ce que publient les distributions et c'est la vraie réponse ;
- l'annonce de version sur une liste de diffusion, ou une étiquette dans un dépôt de code, plutôt que la page de téléchargement ;
- un second miroir sur un autre domaine, les deux étant ensuite comparés entre eux ;
- un gestionnaire de paquets, qui fait cela pour vous contre des clés livrées avec le système d'exploitation.

Rien de tout cela ne rend inutile la vérification d'une somme publiée sur la même page. Elle attrape le téléchargement abîmé, qui est la panne qui arrive vraiment aux gens. Ne vous racontez simplement pas qu'elle a attrapé autre chose.

## MD5 et SHA-1 sont cassés. Servez-vous-en quand même, parfois

Tous deux sont cassés au sens le plus fort qui compte ici : on peut construire des *collisions* exprès. Deux fichiers différents ayant le même MD5 se fabriquent sur du matériel ordinaire depuis 2004, et en 2017 une équipe a produit deux PDF différents ayant le même SHA-1. En 2020, la version à préfixe choisi de cette attaque est descendue à quelques dizaines de milliers de dollars de calcul loué.

En pratique : un MD5 qui correspond ne vous dit plus que personne n'a touché au fichier, puisque quelqu'un qui l'aurait voulu aurait pu fabriquer un autre fichier portant le même nombre. Il vous dit toujours que le téléchargement n'a pas été tronqué ni corrompu, car un accident au hasard ne tombera pas sur une collision : aucun accident n'a jamais eu cette probabilité.

Donc si l'auteur n'a imprimé qu'un MD5, vérifiez-le : cela vaut mieux que de ne rien vérifier. Et si c'est vous qui publiez, imprimez un SHA-256.

## Cela ne correspond pas. Et maintenant ?

1. **Retéléchargez**, au même endroit. Un transfert interrompu ou repris est de très loin la cause la plus fréquente, et une deuxième copie règle généralement l'affaire.
2. **Vérifiez que vous êtes sur la bonne ligne.** Les pages de version listent plusieurs fichiers : la somme de l'installeur ne correspondra jamais à celle de l'archive, ni celle de l'ARM à celle du x86.
3. **Vérifiez la version.** Une page de sommes mise en favori est périmée le jour où sort une révision.
4. **Essayez un autre miroir** et comparez entre elles les sommes des deux fichiers. Deux miroirs qui s'accordent entre eux et divergent du nombre publié, c'est un problème différent d'un miroir qui diverge des deux.
5. **N'ouvrez rien entre-temps.** Un fichier qui rate sa somme de contrôle est au mieux abîmé et au pire pas le fichier demandé.

## Pourquoi faire cela dans un navigateur

Parce que la ligne de commande n'est pas là où se trouve la plupart des gens, et parce que l'autre solution évidente, un site qui vous demande d'envoyer le fichier, est une chose étrange à faire avec un installeur dont on doute déjà. Expédier un fichier quelque part pour savoir s'il a été trafiqué en route ajoute un endroit de plus où il peut l'être.

[Hachage & somme de contrôle](https://abox.tools/fr/verifier-une-somme-de-controle/) lit le fichier par tranches de quatre mégaoctets sur votre propre machine : pas d'envoi, pas de limite de taille, et rien à qui faire confiance en dehors de la page elle-même, que vous pouvez lire et qui continue de fonctionner réseau débranché. Si vous préférez faire confiance à votre système d'exploitation, lancez la commande de la section plus haut et comparez les deux réponses. Elles seront identiques.
