# Comment empiler des photographies pour réduire le bruit, ou retirer les gens

Une rafale contient plus d'information que chacune de ses prises. La moyenne réduit le bruit aléatoire indépendant ; la valeur centrale de chaque pixel peut retirer ce qui apparaît dans moins de la moitié des prises. Le choix dépend de ce qui a bougé.

[Ouvrir Empileur d'images](https://abox.tools/fr/empiler-des-images/): Vingt prises n'en font plus qu'une, sans vingt envois et sans dérawtiseur.

Dernière mise à jour 8 octobre 2026

## La réponse courte

Ouvrez l'[empileur d'images](https://abox.tools/fr/empiler-des-images/), déposez la rafale entière et choisissez la méthode selon ce dont vous voulez vous débarrasser :

- **Le bruit**, et rien n'a bougé — moyenne.
- **Le bruit**, et quelque chose a bougé — écrêtage sigma.
- **Des gens, des voitures, un avion** — médiane.
- **Un ciel noir que vous voulez en filés d'étoiles** — éclaircir.
- **Une macro presque sans profondeur de champ** — empilement de mise au point.

Commencez avec **Auto avec perspective** pour réduire le bruit, y compris sur des photos nocturnes prises sur trépied : les étoiles bougent même si l'appareil reste fixe. Utilisez **Non** pour des filés d'étoiles voulus ou des prises déjà alignées. Les RAW peuvent entrer directement s'ils contiennent un aperçu JPEG utilisable. La ligne indique la taille réelle de l'image.

Tout ce qui suit explique pourquoi ces cinq lignes disent ce qu'elles disent.

## Pourquoi une rafale porte plus qu'une prise

Une photographie faite dans une lumière médiocre, c'est l'image plus du bruit, et le bruit est différent à chaque fois. C'est cette dernière partie qui fait marcher l'empilement. Prenez seize fois la même vue : l'image est identique sur les seize alors que le bruit ne l'est pas, si bien que les moyenner laisse l'image et annule l'essentiel du bruit.

L'amélioration est la racine carrée du nombre de prises. Quatre prises divisent le bruit par deux. Seize, par quatre. Cent, par dix. C'est une courbe impitoyable : passer de seize à soixante-quatre prises apporte la même amélioration une seconde fois, pour quatre fois plus de déclenchements — et c'est pourquoi presque toute pile pratique se situe entre huit et trente prises.

La moyenne stabilise aussi les estimations de tons, car chaque prise bruitée a été arrondie un peu différemment. L'outil utilise des accumulateurs plus larges et arrondit la valeur combinée à la fin. Le PNG ou JPEG enregistré garde huit bits par canal : une moyenne plus propre n'ajoute pas de profondeur à la sortie.

## La question qui choisit la méthode

Non pas « que veux-je garder », mais **qu'est-ce qui différait d'une prise à l'autre**. Tout le reste en découle.

### Rien n'a bougé : la moyenne

La moyenne toute simple. C'est la réduction de bruit la plus efficace qui existe sur une série où la seule différence entre les prises est le bruit, et la plus facile à ruiner : une prise avec un oiseau dedans pose un oiseau pâle sur toute la pile, parce qu'une moyenne n'a pas d'avis sur une valeur qui contredit les autres. Elle l'inclut, tout simplement.

### Quelque chose a traversé le cadre : la médiane

Alignez une douzaine de photographies d'une place animée et regardez un pixel. Sur la plupart c'est du pavé ; sur une ou deux c'est le manteau de quelqu'un. Triez ces douze valeurs, prenez celle du milieu, et vous obtenez du pavé, parce que le manteau n'a jamais été majoritaire.

Faites cela pour chaque pixel et la place sort vide. C'est le tour de main derrière tous les articles sur « retirer les touristes de vos photos de vacances », et il n'exige rien de plus malin qu'une rafale et de la patience. La seule chose qu'il demande, c'est **qu'aucune partie de la scène ne soit occupée plus de la moitié du temps**. Une personne immobile sur huit de vos douze prises est majoritaire sur ces pixels, et la médiane la garde.

### Les deux : l'écrêtage sigma

La médiane réduit le bruit aléatoire indépendant moins efficacement que la moyenne. Sa sortie vient de la valeur centrale ou des deux valeurs centrales, plutôt que de la moyenne de toutes les valeurs. C'est le prix à payer pour être moins affectée par quelques valeurs très différentes des autres.

L'écrêtage sigma estime d'abord la moyenne et la dispersion de chaque canal, puis moyenne seulement les valeurs dans le seuil choisi. Il peut rejeter un objet apparu dans peu de prises tout en moyennant le fond restant. Il est moins fiable sur une petite série ou si l'objet revient souvent. Au seuil par défaut, une valeur différente parmi quatre identiques peut encore être acceptée. Utilisez la médiane si retirer l'objet compte davantage que réduire le bruit au maximum.

Le seuil se mesure en écarts-types et commence à deux. Le baisser rejette davantage de valeurs, parfois de vrais détails. Si toutes les valeurs d'un canal sont rejetées, l'outil garde sa moyenne initiale plutôt que de laisser un trou.

### Seul ce qui est clair compte : éclaircir

Garder la valeur la plus claire qu'ait jamais eue chaque pixel. Photographiez le ciel nocturne en deux cents poses de trente secondes et éclaircissez-les ensemble : chaque étoile trace son propre arc sur le résultat — un filé d'étoiles, assemblé à partir de poses courtes qui, prises isolément, n'ont jamais brûlé. La même méthode recompose un feu d'artifice à partir des prises de sa propre explosion, et un light painting à partir d'une promenade à la lampe torche dans une pièce noire.

Son contraire, assombrir, est le discret de la paire : un pixel ne reste clair que s'il l'était sur *toutes* les prises, si bien que les reflets dans une vitre, les phares qui passent et les gouttes de pluie éclairées au flash disparaissent tous.

### Le sujet est plus profond que la mise au point : l'empilement de mise au point

Une macro à f/8 a peut-être un millimètre de net, ce qui ne suffit pas pour un insecte. La réponse est de faire vingt prises le long de la bague de mise au point et de ne garder, de chacune, que la partie qui y était nette. L'outil mesure de combien chaque pixel diffère de ses voisins — beaucoup sur un bord, presque rien sur un flou — et retient le gagnant.

Celle-ci réclame un trépied plus que toutes les autres, parce que tourner la bague à la main déplace l'appareil, et qu'une prise faite d'un peu plus loin n'est pas la même image à une autre mise au point.

### Un mélange plus lumineux : additionner

Additionner somme les valeurs d'image décodées avant d'appliquer le multiplicateur d'Exposition. Ce sont des valeurs de huit bits ; le résultat est donc un mélange additif et ne simule pas une pose plus longue. Les zones claires peuvent être écrêtées. **Normaliser la luminosité** règle le multiplicateur sur un divisé par le nombre de prises. Vous pouvez aussi saisir directement un multiplicateur plus petit.

![Méthodes et réglages d'empilement avec taille de sortie prévue, mémoire de travail estimée, décodages prévus et lectures d'inspection.](https://abox.tools/screens/stack-photos-to-reduce-noise/plan.webp)

Le mode est la question de cette section. Le plan en dessous est l'outil qui dit ce que coûtera la passe avant de la lancer.

## Aligner les prises

L'empilement est un calcul pixel par pixel : il suppose donc qu'un pixel donné est la même partie de la scène sur toutes les prises. À main levée, il ne l'est pas : une rafale dérive de plusieurs dizaines de pixels, et moyenner cela produit un flou plutôt qu'une image nette. C'est la raison la plus fréquente pour laquelle un premier essai d'empilement déçoit.

Chaque prise est mesurée par rapport à celle marquée **Référence** et remise en place si une correction fiable est trouvée. La première est le choix par défaut. **Prendre comme référence** déplace la marque sans réordonner la liste. Choisissez une prise nette avec des détails statiques clairs. Quatre réglages d'alignement :

- **Auto avec perspective** est le choix par défaut. Il corrige décalage, rotation et échelle, puis la perspective si des mesures fiables réparties sur l'image le permettent. Cela aide les rafales nocturnes à grand champ dont le centre est aligné alors que les étoiles des bords tracent encore des traits. Si aucun ajustement de perspective stable n'est trouvé, la correction plus simple est utilisée.
- **Décalage seul** pour une rafale décalée sans rotation ni changement de perspective. Il corrige uniquement la translation.
- **Décalage, rotation et échelle** pour une série où vous tourniez légèrement ou dont le zoom a changé. Cela demande des mesures supplémentaires par prise, même si les prises sont droites.
- **Non** si les prises statiques sont déjà alignées ou si vous voulez transformer le mouvement des étoiles en filés. Un trépied ne garde pas les étoiles dans les mêmes pixels pendant une séquence nocturne.

Ce qu'aucun alignement ne peut corriger, c'est un sujet qui a bougé plutôt qu'un appareil qui a bougé, ni une photographie prise un pas plus à gauche. Se déplacer latéralement change de combien le proche se décale par rapport au lointain, et aucune correction unique ne décrit les deux à la fois. Tourner sur place, c'est bon ; marcher, non.

Après l'empilement, ouvrez **Détails d'alignement** pour voir l'état et la correction de chaque prise. Une prise impossible à aligner reste incluse à sa place initiale ; retirez-la et recommencez si elle rend le résultat flou. Le résultat s'ouvre avec la référence à gauche et l'empilement à droite. Faites glisser le séparateur avec la souris ou le doigt, ou donnez-lui le focus et utilisez les flèches gauche et droite. Amenez-le jusqu'à un bord pour voir une image entière. Le séparateur est disponible dans **Adapter à la fenêtre**. Choisir **100% — pixels réels** affiche tout le résultat empilé et retire l'option de comparaison. À 100%, faites glisser l'image pour déplacer la zone affichée, ou donnez le focus à l'aperçu et utilisez les touches fléchées. Utilisez **Afficher** pour examiner la référence ou l'empilement séparément. Revenez à Adapter à la fenêtre pour comparer à nouveau avec le séparateur.

![Une comparaison divisée avec la référence à gauche, le résultat empilé à droite et un séparateur mobile.](https://abox.tools/screens/stack-photos-to-reduce-noise/result.webp)

Déplacez le séparateur sur le bruit et les contours fins pour comparer la même zone des deux images. Vérifiez les détails d'alignement si l'empilement semble flou.

## Où les fichiers RAW s'insèrent

CR2, CR3, NEF, ARW, DNG, RAF, RW2, ORF et les formats proches peuvent être ouverts s'ils contiennent un aperçu JPEG utilisable. Il faut préciser ce qui se passe, car cela diffère du développement des données RAW du capteur.

De nombreux RAW contiennent un **aperçu JPEG rendu par l'appareil**. L'outil trouve le plus grand utilisable et le décode avec le décodeur ordinaire du navigateur. Cet aperçu peut être plus petit que l'image du capteur, et certains fichiers n'en ont aucun. Vérifiez les dimensions de chaque prise.

Deux conséquences, une bonne et une à connaître :

- **Cela évite le décodage du capteur.** Trouver l'aperçu demande généralement de petites lectures de répertoires et d'en-têtes, puis le navigateur lit la tranche JPEG pour la décoder. Le chiffre d'inspection compte ces lectures, pas tous les octets lus par le décodeur d'images.
- **C'est l'interprétation de l'appareil, pas la vôtre.** Huit bits par canal, avec la balance des blancs et le style d'image réglés sur l'appareil — et non les douze ou quatorze bits de données linéaires de capteur qu'un dérawtiseur vous donnerait.

Un aperçu utilisable peut suffire pour réduire le bruit, tracer des filés d'étoiles, retirer des passants et empiler la mise au point. Ses dimensions et le rendu de l'appareil sont les limites. Pour votre propre balance des blancs, vos réglages de tons ou la récupération d'ombres RAW, développez d'abord les prises et exportez des JPEG ou PNG à empiler ici. Le résultat enregistré reste une image de huit bits.

## Ce que cela coûte à l'exécution

Cela vaut la peine d'être su, parce que c'est la différence entre une pile qui prend huit secondes et une qui en prend deux minutes.

Six méthodes ont des accumulateurs dont la taille ne dépend pas du nombre de prises. Moyenne, éclaircir, assombrir, additionner et empilement de mise au point font une passe par bande. L'écrêtage sigma en fait deux : une pour estimer la moyenne et la dispersion, une pour moyenner les valeurs gardées. L'inspection et l'alignement décodent aussi les fichiers ; une passe d'empilement ne signifie donc pas une seule lecture au total.

La médiane doit garder les valeurs de chaque prise pour la bande en cours. Vingt prises de 24 mégapixels demanderaient environ 1,4 Go rien que pour ces valeurs. Les bandes traitent moins de lignes à la fois, au prix d'un nouveau décodage de chaque prise pour chaque bande. Les autres méthodes peuvent aussi être divisées en bandes si leurs tampons dépassent le budget.

Avant le départ, l'outil affiche la taille prévue du résultat, la mémoire de travail estimée, les décodages prévus de l'empilement et les octets lus pendant l'inspection. L'estimation comprend les tampons modélisés ; le fonctionnement interne du navigateur et la récupération de mémoire peuvent augmenter l'usage total. Réduire la résolution de travail d'un niveau divise la surface par quatre et peut réduire les décodages répétés. L'alignement peut recadrer assez le résultat pour demander moins de bandes que le plan initial.

## Photographier en vue de cela

L'essentiel de la qualité d'une pile se décide avant qu'aucun logiciel ne la voie.

- **Faites plus de prises que vous ne le croyez nécessaire.** La courbe en racine carrée est impitoyable en bas et généreuse en haut : passer de quatre à neuf prises est un changement plus visible que passer de vingt à quarante.
- **Ne changez pas l'exposition entre les prises.** L'empilement suppose que les prises montrent la même scène à la même luminosité. Bloquez l'exposition, sinon l'outil moyennera deux images différentes.
- **Pour retirer des gens, attendez entre les prises.** Une rafale prise en deux secondes attrape la même personne au même endroit sur toutes les prises, et la médiane la garde. Dix prises espacées de quelques secondes marchent bien mieux que cinquante en rafale.
- **Pour les filés d'étoiles, gardez les intervalles courts.** Éclaircir dessine exactement ce que les prises ont enregistré : une pause entre deux poses devient donc un tiret visible sur chaque filé.

## Rien de tout cela ne quitte votre machine

Une pile de vingt prises RAW fait environ un gigaoctet de photographies, ce qui fait beaucoup à confier à un site web pour qu'il en fasse la moyenne. L'[empileur d'images](https://abox.tools/fr/empiler-des-images/) lit les fichiers sur votre propre disque et fait le calcul dans votre propre navigateur. Il n'y a ni étape d'envoi, ni compte, ni file d'attente, et vous pouvez vérifier cette affirmation comme vous vérifieriez celle de n'importe qui : ouvrez le panneau réseau de votre navigateur pendant qu'il travaille, ou débranchez-vous simplement d'internet et empilez quand même.

La question voisine — comment savoir, pour n'importe quel outil, si lui confier un fichier était nécessaire — a [son propre guide](https://abox.tools/fr/guides/est-il-sur-d-envoyer-ses-fichiers/).
