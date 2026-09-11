# Comment fusionner, diviser et réordonner des pages PDF

Réunir deux documents est la chose la plus ordinaire qu'on fasse à un PDF, et celle qu'on fait le plus souvent en confiant les deux fichiers au serveur d'un inconnu. Il n'en faut aucun. Voici comment procéder, et ce qui disparaît discrètement quand un outil réordonne des pages.

[Ouvrir Fusion et division de PDF](https://abox.tools/fr/fusionner-des-pdf/): Des pages déplacées sans aller-retour vers un serveur.

Dernière mise à jour 26 août 2026

## La réponse courte

Ouvrez la [Fusion et division de PDF](https://abox.tools/fr/fusionner-des-pdf/), déposez-y tous les fichiers que vous voulez utiliser, et faites glisser les pages dans l'ordre voulu. Dites ensuite si cela ressort en un document ou en plusieurs, et appuyez sur le bouton. Rien n'est envoyé : les fichiers sont ouverts, démontés et réécrits par votre propre navigateur.

Les trois tâches que l'on cherche séparément — fusionner, diviser, réordonner — tiennent sur un seul écran, parce que c'est une seule opération avec une réponse différente à la fin : choisir des pages, les mettre dans un ordre, et décider en combien de fichiers elles ressortent.

## Fusionner deux documents ou plus

Choisissez le premier fichier, puis le second : les pages de chacun se placent à la suite de l'ordre en cours, vous pouvez donc continuer à ajouter des fichiers venus de dossiers différents sans tout recommencer. Si l'ordre est mauvais, faites glisser une page par sa poignée, ou utilisez les flèches de chaque vignette.

La fusion ne réencode rien. Le contenu de chaque page et chaque police, image et dessin vectoriel auxquels elle renvoie sont recopiés à l'identique : le texte reste sélectionnable et cherchable, et un scan reste le même scan. Le fichier fusionné est en général un peu plus léger que la somme des deux entrées, ce qui n'est pas de la compression — c'est la structure autour des pages, écrite une fois au lieu de deux.

Les pages gardent leur propre format. Fusionnez un rapport A4 avec une annexe au format Lettre et vous obtenez un document contenant les deux, ce que disent les fichiers. Mettre les pages de quelqu'un à l'échelle d'un seul format de papier est une autre opération, et pas de celles qu'un outil de fusion devrait faire en silence.

## Diviser un document en plusieurs

Il y a quatre façons de couper, et celle qu'il vous faut dépend de la raison pour laquelle vous coupez :

- **Toutes les tant de pages.** Pour un long scan de ce qui était à l'origine une pile de documents séparés — douze bulletins de paie de deux pages chacun.
- **Aux numéros de page que vous indiquez.** Pour un rapport dont les chapitres commencent à des pages que vous voyez. Chaque numéro saisi ouvre un nouveau fichier.
- **Un fichier par page.** Pour extraire une seule feuille de signatures ou une attestation d'un lot.
- **De nouveau dans les fichiers d'origine.** Proposé uniquement quand vous avez fusionné plus d'un fichier, et utile après modification : retirer les pages blanches de trois scans d'un coup, puis récupérer trois fichiers.

Si vous ne voulez que quelques pages d'un long document, inutile de le diviser. Tapez les pages voulues dans le champ d'intervalles — `1-3, 8, 12-` —, appuyez sur « Ne garder que celles-ci », et construisez un document.

Quand il y a plus d'un fichier en sortie, tout est remis dans une seule archive ZIP. Cinquante téléchargements, ce sont cinquante boîtes d'enregistrement, et c'est à peu près là que tout le monde abandonne.

![La carte de sortie : des options pour un document ou plusieurs, une découpe par taille, à un numéro de page, ou de retour vers les fichiers d'origine.](https://abox.tools/screens/merge-and-split-pdf-files/output.webp)

Découper est la même opération que fusionner, faite à l'envers, et c'est pourquoi c'est un réglage ici et non un outil à part.

## Réordonner, pivoter et retirer des pages

Faites glisser une vignette par sa poignée pour la déplacer. Les flèches de chaque vignette la décalent d'une place, ou la font pivoter d'un quart de tour à la fois — c'est le remède pour la page sortie de travers du scanner. La × la retire.

Dès qu'il s'agit de plus de deux ou trois pages, utilisez plutôt le champ d'intervalles. Il accepte ce que vous écririez sur papier : `1-3, 8, 12-`, ainsi que `impaires`, `paires`, `toutes` et `dernière`. Gardez celles-là, retirez celles-là, ou faites-les pivoter. Un cas courant : un scan recto verso où une page sur deux est à l'envers, c'est `paires` et deux quarts de tour.

Les numéros sur les vignettes se renumérotent au fur et à mesure, ils veulent donc toujours dire « position dans le document fini » et non « page dans le fichier d'où elle vient ». Rien n'est écrit tant que vous n'avez pas appuyé sur le bouton, il n'y a donc rien à annuler — et « revenir à l'état d'origine » rétablit l'ordre initial de tout.

![La grille des pages : chaque page de deux documents en vignette, dans l'ordre où elles sortiront, avec des commandes pour pivoter, inverser et retirer.](https://abox.tools/screens/merge-and-split-pdf-files/pages.webp)

Les deux documents, page par page. Réordonner, c'est déplacer ; le champ de plage au-dessus est pour les documents où déplacer prendrait tout l'après-midi.

## Ce qui survit à un remaniement, et ce qui n'y survit pas

C'est la partie qu'aucun outil ne vous dit, et la raison pour laquelle un document fusionné paraît parfois subtilement cassé.

Un PDF n'est pas une pile de pages. C'est un graphe, et une bonne part concerne le document plutôt qu'une page en particulier : le panneau de signets, les liens, le formulaire, l'ordre de lecture que suit un lecteur d'écran, la numérotation qui appelle les quatre premières pages « i, ii, iii, iv ». Déplacez les pages et chacune de ces choses doit être reconstruite ou abandonnée.

- **Les signets sont reconstruits.** Une entrée dont la page est toujours là pointe vers l'endroit où celle-ci est allée. Une entrée dont vous avez retiré la page disparaît — sauf si des entrées lui survivent en dessous, auquel cas elle reste comme titre, car un titre de chapitre est toujours là où est le chapitre. En fusionnant plusieurs fichiers, les signets de chacun sont rangés sous un titre portant le nom du fichier, et c'est ce qui rend un rapport fusionné navigable.
- **Les liens sont suivis.** Un lien de la page 2 vers la page 40 sait où la page 40 est passée, y compris les destinations nommées que Word et LaTeX écrivent pour chaque titre. Un lien dont la cible n'a pas suivi se retrouve sans rien derrière lui, plutôt que de pointer vers la page qui occupe désormais cette position.
- **Les formulaires remplis survivent**, et le nouveau document est déclaré comme formulaire pour que les lecteurs le traitent comme tel. Une bizarrerie à connaître : deux champs portant le même nom sont *un seul* champ pour n'importe quel lecteur, donc fusionner deux copies du même formulaire les relie — taper dans l'un remplit l'autre.
- **L'ordre de lecture balisé, non.** Il décrit une séquence qui n'existe plus, et un mauvais ordre est pire pour un lecteur d'écran que pas d'ordre du tout. Si le balisage d'accessibilité d'un document compte, gardez l'original à côté.
- **Les étiquettes de page, non plus.** La numérotation « iii, iv, 1, 2 » est une affirmation sur un ordre que vous venez de changer.
- **Les pièces jointes et les scripts du document, non plus.** Les fichiers joints appartiennent au document, pas à une page. Les actions qui exécutent du JavaScript, envoient un formulaire quelque part ou lancent un programme ne sont pas reportées dans votre nouveau fichier, ce qui est le bon réglage par défaut pour des pages venues de quelqu'un d'autre.

Une signature numérique est un cas à part, et non la limite d'un outil : une signature certifie un document tel qu'il était. Déplacez une page et elle est rompue, car c'est exactement ce qu'elle est là pour vous dire.

## Les fichiers protégés par mot de passe

Un PDF chiffré est refusé, y compris ceux à mot de passe vide que produisent beaucoup de photocopieurs de bureau. Retirer la protection d'un document est un travail différent de celui de déplacer ses pages, et un outil qui le ferait en silence ferait quelque chose que vous n'avez pas demandé. Ouvrez-le dans un lecteur avec le mot de passe et enregistrez d'abord une copie non protégée.

## Vérifier le résultat

Ouvrez-le et vérifiez trois choses : le nombre de pages, l'ordre, et — si le document en avait — le panneau de signets et un ou deux liens.

L'outil d'ici fait le premier point pour vous avant de proposer le fichier. Chaque document fini est rouvert par le code même qui a lu vos originaux, et ses pages sont comptées en parcourant l'arbre des pages plutôt qu'en croyant le compte inscrit dans le fichier. Si cela ne correspond pas à ce que vous avez demandé, aucun téléchargement n'est proposé.

## Pourquoi cela n'a pas besoin d'un serveur

La fusion a des airs de travail de serveur, et pendant l'essentiel de la vie du web c'en était un. Ce qu'elle demande en réalité, c'est analyser la structure du fichier, copier dans un nouveau fichier les objets dont dépend chaque page, et écrire une table de références croisées neuve. Aucun pixel n'est décodé et rien n'est rendu à l'écran. Un navigateur sait tout faire depuis des années.

Et cela compte ici plus que presque partout ailleurs, à cause de *ce que* les gens fusionnent. Les documents que l'on réunit sont ceux qui viennent de quelque part : un contrat et sa page de signature, le scan d'un passeport et un relevé bancaire, un courrier médical et un formulaire de demande. Un service de fusion en ligne les reçoit tous d'un coup, déjà rassemblés, d'une même personne. C'est l'envoi le plus révélateur que la plupart des gens feront jamais.

L'outil d'ici n'a aucune fonction réseau, et la `Content-Security-Policy` de la page nomme chaque adresse qu'elle a le droit de contacter ; aucune n'appartient à ce site. Chargez-la, débranchez, et fusionnez quelque chose quand même.

[Est-il sûr d'envoyer ses fichiers à un convertisseur en ligne ?](https://abox.tools/fr/guides/est-il-sur-d-envoyer-ses-fichiers/) propose trois autres vérifications de ce genre.
