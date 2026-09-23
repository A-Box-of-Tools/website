# Ce qu'un PDF retient

Plus que ses pages. Un PDF transporte couramment le nom de son auteur, le logiciel qui l'a produit, le fichier qu'il était avant de devenir un PDF — et, s'il a été modifié d'une certaine façon très répandue, chaque version antérieure de lui-même, suppressions comprises. Rien de tout cela ne s'affiche à l'écran.

Dernière mise à jour 26 août 2026

## La réponse courte

Un PDF n'est pas une image de ses pages. C'est un conteneur, et les pages ne sont que la partie de la cargaison qui s'affiche. Autour d'elles, le format a de la place pour un bloc d'informations sur le document, une seconde copie XML du même, des commentaires, des données de formulaire, des fichiers joints — et, par une façon très répandue d'enregistrer les modifications, des versions antérieures complètes du document, empilées sous la version courante.

Rien de tout cela n'est un défaut. Chaque pièce a été conçue pour un travail raisonnable, et à l'intérieur d'une organisation, la plupart sont inoffensives ou utiles. Le problème est le passage de frontière : à l'instant où un PDF s'en va — vers une partie adverse, une liste de diffusion, un dossier public — tout ce dont il se souvient part avec lui, et ce dont il se souvient ne s'affiche sur aucune page. On vérifie ce qu'un document dit, et on envoie ce que le fichier contient — deux choses différentes.

## L'étiquette : /Info et le paquet XMP

Tout PDF peut porter un dictionnaire d'informations — auteur, titre, dates de création et de modification, et les noms des programmes qui l'ont créé et produit. La plupart portent une seconde copie, plus riche, des mêmes faits en XML embarqué, appelée XMP. Ni l'une ni l'autre ne s'affiche avec les pages ; les deux sont à un panneau de propriétés de distance.

Les valeurs se remplissent automatiquement, et c'est ce qui les rend fuyantes. *Auteur* est typiquement le nom de compte avec lequel le système a été installé — un vrai nom complet, sur des documents que leurs auteurs croyaient anonymes : candidatures, expertises, plaintes, offres. *Titre* est couramment le nom du fichier dont le PDF a été exporté, si bien que `Brouillon-v7-réserves-juridiques.docx` survit à l'intérieur du PDF poli qui devait le remplacer. La ligne du producteur date le logiciel ; les dates contredisent les versions officielles. Des études entières ont été écrites sur ce que les PDF institutionnels avouent dans ce bloc.

## La corbeille qui rend tout : les enregistrements incrémentaux

La pièce la plus tranchante du conteneur est celle dont le format est le plus fier. Le PDF permet les *mises à jour incrémentales* : au lieu de réécrire le fichier, un éditeur peut ajouter ses changements à la fin et laisser tout ce qui précède intact. Le lecteur lit le fichier par la fin et montre la version la plus récente ; les anciennes sont encore là, octet pour octet, dans le même fichier.

Enregistrer en ajoutant est rapide et résistant aux plantages — et cela signifie qu'un document modifié ainsi contient sa propre histoire. Le texte « supprimé » n'est pas parti : il est périmé, et le récupérer revient à lire le fichier tel qu'il était avant le dernier ajout. Un rectangle noir tiré sur un nom dans un éditeur qui enregistre incrémentalement produit un fichier qui contient le nom *deux fois* — une fois sous le rectangle, une fois dans l'histoire — ce qui redouble l'échec décrit dans [le guide du caviardage](https://abox.tools/fr/guides/peut-on-recuperer-un-texte-caviarde/).

Le remède est une réécriture complète : ouvrir le fichier, garder ce que la version courante utilise vraiment, écrire un fichier neuf sans passé. C'est ce que fait par construction le [compresseur de PDF](https://abox.tools/fr/compresser-un-pdf/) d'ici — une réécriture ne peut pas faire autrement que d'abandonner l'histoire, et l'outil compte la matière périmée qu'il a laissée derrière lui dans sa ventilation des tailles, qui est aussi la façon la plus simple de découvrir que votre fichier avait une histoire.

## La soute : commentaires, champs, pièces jointes, calques

Le reste de la mémoire est plus ordinaire, et fuit quand même :

- **Commentaires et annotations** — la conversation de relecture, voyageant avec le document relu, visible pour quiconque pense à regarder.
- **Les champs de formulaire** gardent leurs valeurs saisies comme données, même là où une page aplatie ne les affiche plus.
- **Les pièces jointes** : un PDF peut embarquer des fichiers entiers, de n'importe quel type, et les lecteurs les montrent dans un panneau latéral que la plupart des gens n'ont jamais ouvert. Le tableur derrière le graphique est parfois joint au graphique.
- **Les calques de contenu optionnel** peuvent porter du contenu de page éteint plutôt que retiré — présent en entier, affiché jamais.

Chacun de ces éléments est une donnée que les pages ne montrent pas, dans un fichier qu'on juge à ses pages.

## Envoyer un PDF sans sa mémoire

Le motif dans tout cela : ce qui survit dépend de la façon dont le fichier a été écrit, donc le remède est de le faire passer par quelque chose qui écrit sans mémoire, sur votre propre machine — l'histoire d'un document est exactement ce qu'il ne faut pas téléverser vers le serveur d'un inconnu, argument que [le guide sur l'envoi de fichiers](https://abox.tools/fr/guides/est-il-sur-d-envoyer-ses-fichiers/) déroule en entier. Trois outils de ce site écrivent des PDF, et tous trois ont été bâtis pour laisser la mémoire dehors :

- L'outil pour [fusionner et diviser des PDF](https://abox.tools/fr/fusionner-des-pdf/) écrit une sortie **sans aucun dictionnaire d'informations** — pas d'auteur, pas de dates, pas de ligne nommant le logiciel. Ce qu'il copie de vos originaux, c'est ce que leurs pages utilisent, pas leurs bagages. Il y a [un guide](https://abox.tools/fr/guides/fusionner-et-diviser-des-pdf/).
- Le [compresseur de PDF](https://abox.tools/fr/compresser-un-pdf/) réécrit le fichier complètement — histoire périmée abandonnée, paquet XMP et données privées d'applications non repris — et détaille ce qu'il a retiré. Avec [un guide](https://abox.tools/fr/guides/reduire-la-taille-d-un-pdf/) aussi.
- L'outil pour [caviarder un PDF](https://abox.tools/fr/caviarder-un-pdf/), pour quand la mémoire est justement le sujet : à chaque passage il nettoie le bloc d'informations, le paquet XMP, les signets, les commentaires, les valeurs de champs et les pièces jointes, en plus du caviardage lui-même — [son guide](https://abox.tools/fr/guides/caviarder-un-pdf/) déroule le tout.

Et le test de réception reflète la fuite : jugez le fichier, pas les pages. Ouvrez le panneau des propriétés et lisez ce qui reste ; cherchez dans le fichier brut un mot retiré ; regardez la ventilation du compresseur sur ce que votre document transportait. Un PDF sans mémoire n'a rien à avouer, quel que soit son lecteur.
