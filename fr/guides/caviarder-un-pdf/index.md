# Comment caviarder un PDF pour que le texte disparaisse vraiment

Un rectangle noir sur un nom et un nom supprimé sont identiques à l'écran. L'un des deux survit à une sélection et un copier. Voici la différence, les endroits où un mot se cache et qui ne sont pas du tout la page, et la vérification de trente secondes qui vous dit lequel des deux vous avez.

[Ouvrir Caviardeur de PDF](https://abox.tools/fr/caviarder-un-pdf/): Les lettres sont supprimées du fichier, puis le fichier est fouillé pour le prouver.

Dernière mise à jour 26 août 2026

## La réponse courte

Ouvrez le [caviardeur de PDF](https://abox.tools/fr/caviarder-un-pdf/), déposez le document, tapez les mots qui doivent disparaître, cochez ceux que vous visez et appuyez sur « Les retirer ». Les lettres sont supprimées des instructions de dessin de la page, les mêmes mots sont retirés des signets, des commentaires, des champs de formulaire et des propriétés du document, et le fichier terminé est rouvert et fouillé devant vous avant de vous être proposé.

Tout ce qui suit explique pourquoi cette dernière proposition est l'importante, et comment savoir si l'outil que vous employez déjà peut en dire autant.

## De quel échec il s'agit

Dessinez un rectangle noir sur un nom dans une visionneuse PDF. Ce que vous voyez est un nom avec un rectangle noir dessus. Ce que la plupart des visionneuses *enregistrent*, c'est un document contenant le nom et, séparément, un rectangle doté d'une position, d'une taille et d'une couleur.

Un rectangle dessiné ainsi est une **annotation** : un objet posé à côté de la page et non dedans. Le texte dessous est exactement tel qu'il était. Sélectionnez la zone et copiez, ou ouvrez le fichier dans un logiciel qui dessine les annotations autrement, ou passez-y n'importe quel extracteur de texte : le nom revient. Rien à l'écran ne distingue cela d'un vrai caviardage, ce qui est précisément pourquoi cela continue d'arriver à des organisations qui emploient des juristes.

Cela a publié des dossiers judiciaires, des analyses de renseignement, des contrats et, en décembre 2025, des noms caviardés dans une publication massive de documents du ministère de la Justice américain, lisibles quelques heures après leur parution. Le schéma est toujours le même. Le rectangle était l'annotation, et l'annotation n'a jamais été le texte.

## Ce que fait un vrai caviardage à la place

Une page d'un PDF est une liste d'instructions : prends cette police, déplace la plume ici, dessine ces glyphes. Les mots de la page existent à un seul endroit, comme opérandes de ces instructions de dessin :

```
BT /F1 12 Tf 72 700 Td (Cher Monsieur Martin) Tj ET
```

Caviarder le nom, cela veut dire **supprimer ces lettres de cette instruction** et réécrire la page. Après quoi il n'y a rien à récupérer, non parce que le fichier le cache bien, mais parce que les lettres ne sont pas dans le fichier. Il n'y a pas de rectangle avec quelque chose dessous, parce qu'il n'y a rien dessous.

Une chose doit être remise, sinon le résultat est visiblement faux. Le texte est dessiné en faisant avancer une plume sur la page : supprimer cinq lettres tire donc le reste de la ligne de cinq lettres vers la gauche, les colonnes cessent d'être alignées et les totaux glissent sous le mauvais titre. Un outil qui fait cela correctement mesure de combien les lettres retirées auraient fait avancer la plume et remet cette distance sous forme d'instruction d'espacement, qui déplace la plume sans rien dessiner.

Le cadre noir, s'il y en a un, est peint *ensuite*, sur un vide déjà vide. C'est une politesse envers qui lira le document — le signe que quelque chose a été retiré — et non le caviardage. Voilà toute la distinction en une phrase : dans un vrai caviardage, le cadre est un ornement ; dans un faux, le cadre *est* le caviardage.

![La carte de recherche : deux termes saisis, avec un décompte des correspondances et la liste de chaque endroit où ils apparaissent dans le document.](https://abox.tools/screens/redact-a-pdf/find.webp)

Vous dites ce qui doit disparaître et l'outil trouve chaque occurrence, y compris celles de la page trois dont personne ne se souvenait.

## Les quatre endroits où un mot se cache et qui ne sont pas la page

C'est la partie qui piège ceux qui ont bien fait la première. Un PDF transporte du texte à plusieurs endroits à la fois, et une visionneuse les montre, les cherche ou les copie tous. Retirer un nom de la page et le laisser dans l'un d'eux, c'est ne pas l'avoir retiré.

- **Les propriétés du document.** Titre, auteur, et le nom du fichier dont celui-ci a été exporté. Un document dont on a retiré un nom des pages et dont les propriétés annoncent toujours `Accord Martin brouillon 3.docx` n'est pas caviardé. Il y a généralement une seconde copie des mêmes informations dans un paquet XMP, qui doit disparaître aussi.
- **Les signets.** Le plan latéral d'une visionneuse est une liste de titres assortis de numéros de page — et un titre est une ligne de texte que rien sur la page ne commande.
- **Les champs de formulaire et les commentaires.** Ce que quelqu'un a saisi dans un formulaire est enregistré deux fois : une fois comme valeur du champ et une fois comme l'apparence que dessine la visionneuse. Les deux doivent disparaître. Un pense-bête porte son texte et le nom de qui l'a écrit.
- **Le texte de remplacement.** Un PDF peut déclarer qu'une suite de glyphes « épelle » autre chose, pour qu'une ligature ou un mot coupé se copie comme le mot qu'il représente. Autrement dit un document peut montrer une chose et en remettre une autre à qui fait Ctrl+C, et un caviardage qui n'aurait retiré que ce qui est dessiné laisserait la phrase intacte pour quiconque sélectionne le paragraphe.

Les pièces jointes sont le cinquième. Un PDF peut contenir des fichiers entiers, et rien de ce que vous faites aux pages ne les touche.

![La carte de page : le texte d'une page, extrait et sélectionnable, avec les termes trouvés surlignés.](https://abox.tools/screens/redact-a-pdf/page.webp)

C'est la partie qui surprend. Un PDF n'est pas une image : ses mots peuvent être sélectionnés, cherchés et copiés par quiconque le reçoit.

## Comment vérifier un fichier, en trente secondes

Faites-le sur tout ce que vous vous apprêtez à envoyer, quel que soit l'outil qui l'a produit. C'est la vérification qui aurait attrapé chacun des échecs publiés.

1. **Ouvrez le fichier terminé et appuyez sur Ctrl+F** (Cmd+F sur un Mac). Cherchez le mot que vous avez retiré. Un vrai caviardage ne renvoie rien. Si la visionneuse saute à un rectangle noir, le mot est toujours là et le rectangle est posé dessus.
2. **Sélectionnez la zone noircie et copiez-la.** Glissez sur le rectangle, faites Ctrl+C et collez dans un champ de texte. Si quelque chose arrive, vous avez trouvé le même échec par l'autre bout.
3. **Sélectionnez le document entier et copiez cela.** Ctrl+A puis Ctrl+C, collez dans n'importe quel éditeur de texte et lisez ce qui en sort. C'est la plus utile des trois, parce qu'elle vous montre le document tel que le voit un extracteur de texte — y compris du texte dont vous ignoriez la présence, ce qui est courant sur une page numérisée.
4. **Regardez les propriétés** — Fichier → Propriétés dans la plupart des visionneuses — et le panneau des signets. Ce sont deux endroits où un nom survit à un caviardage parfait sur la page.

Le [caviardeur de PDF](https://abox.tools/fr/caviarder-un-pdf/) exécute la première et la troisième pour vous et affiche le décompte, parce qu'un outil qui affirme avoir retiré quelque chose n'est pas une preuve, et qu'une fouille du fichier terminé en est une.

## Les documents numérisés sont un autre problème

Un scan est la photo d'une page. Les mots qu'elle porte sont des pixels et non du texte, et modifier la couche de texte n'y touche pas — parce qu'il n'y a pas de couche de texte, ou parce que celle qui s'y trouve décrit l'image au lieu d'en être une.

La plupart des scanners et des outils PDF actuels ajoutent une couche de texte invisible par-dessus l'image, écrite par reconnaissance optique de caractères, pour rendre la page consultable. Cette couche est du vrai texte et peut être retirée. Cela vaut la peine de la retirer : c'est ce qu'auraient trouvé une recherche, un copier et tout système automatique qui lit des documents. Cela ne change rien à l'image, où les mots restent parfaitement lisibles pour qui regarde la page.

Pour un scan, la séquence honnête est donc : retirer les mots de la couche de texte, puis s'occuper de l'image séparément, ce qui veut dire écraser des pixels. C'est ce que fait le [caviardeur d'images](https://abox.tools/fr/guides/caviarder-une-image/), et le guide d'à côté explique pourquoi un flou ou une mosaïque ne suffisent pas pour du texte.

## Pourquoi ne pas simplement imprimer et renumériser

Parce que cela marche, et que cela vous coûte tout le reste. Imprimer une page caviardée et la renumériser produit bien un document sans couche de texte susceptible de fuir — et un document que personne ne peut chercher, qu'aucun lecteur d'écran ne peut lire, cinq à cinquante fois plus gros, et dont la qualité est celle qu'a bien voulu donner le photocopieur du bureau. Cela suppose en outre que la page se soit imprimée telle qu'elle s'affichait : une annotation peut être marquée « afficher à l'écran, ne pas imprimer », et quand c'était le cas de votre cadre noir, la feuille qui sort de l'imprimante porte le nom.

Le même argument vaut pour l'« aplatir en image » que certains outils proposent comme caviardage. Cela transforme chaque page en photographie d'elle-même. Si les mots étaient recouverts plutôt que supprimés, le recouvrement est désormais définitif — mais tout le reste du document est parti avec, et le fichier que vous envoyez est un fichier avec lequel personne ne peut travailler.

## Pourquoi c'est le travail qui mérite le moins un envoi

À un service de caviardage, il faut remettre le fichier non caviardé. C'est toute la transaction : la version privée arrive d'abord, entière, et c'est elle qui se trouve sur le disque de quelqu'un d'autre. Quoi que dise la politique de confidentialité, l'ordre des choses ne se discute pas : le document dont vous preniez soin est celui que vous avez remis.

Ce que les gens caviardent aggrave cela plus qu'il n'y paraît. Des témoignages, des courriers médicaux, des relevés bancaires destinés à un propriétaire, un contrat portant le nom d'un client et destiné à un autre, un mémoire portant une adresse personnelle. Ce sont ces documents-là, et c'est exactement pourquoi l'outil qui les traite ne devrait pas avoir de serveur au bout.

Tout, dans le [caviardeur de ce site](https://abox.tools/fr/caviarder-un-pdf/), se passe dans votre propre navigateur : le fichier est lu, modifié, écrit et vérifié sur votre machine, et les mots que vous cherchez ne quittent pas l'onglet non plus. Débranchez-vous d'internet et il continue de fonctionner, ce qui est la preuve la plus simple qui soit que rien n'est envoyé nulle part. Ce qu'implique réellement un envoi est expliqué dans [est-il sûr d'envoyer ses fichiers](https://abox.tools/fr/guides/est-il-sur-d-envoyer-ses-fichiers/).
