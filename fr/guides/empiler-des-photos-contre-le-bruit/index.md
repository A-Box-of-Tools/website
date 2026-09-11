# Comment empiler des photographies pour réduire le bruit, ou retirer les gens

Une rafale de prises porte plus d'information que n'importe laquelle d'entre elles. Les moyenner annule le bruit ; prendre la valeur centrale de chaque pixel efface tout ce qui n'était là qu'une partie du temps. Laquelle des deux vous voulez dépend entièrement de ce qui a bougé.

[Ouvrir Empileur d'images](https://abox.tools/fr/empiler-des-images/): Vingt prises n'en font plus qu'une, sans vingt envois et sans dérawtiseur.

Dernière mise à jour 26 août 2026

## La réponse courte

Ouvrez l'[empileur d'images](https://abox.tools/fr/empiler-des-images/), déposez la rafale entière et choisissez la méthode selon ce dont vous voulez vous débarrasser :

- **Le bruit**, et rien n'a bougé — moyenne.
- **Le bruit**, et quelque chose a bougé — écrêtage sigma.
- **Des gens, des voitures, un avion** — médiane.
- **Un ciel noir que vous voulez en filés d'étoiles** — éclaircir.
- **Une macro presque sans profondeur de champ** — empilement de mise au point.

Laissez l'alignement activé si l'appareil était dans vos mains, et désactivez-le s'il était sur un trépied. Les fichiers RAW peuvent entrer directement ; il n'est pas nécessaire de les développer d'abord.

Tout ce qui suit explique pourquoi ces cinq lignes disent ce qu'elles disent.

## Pourquoi une rafale porte plus qu'une prise

Une photographie faite dans une lumière médiocre, c'est l'image plus du bruit, et le bruit est différent à chaque fois. C'est cette dernière partie qui fait marcher l'empilement. Prenez seize fois la même vue : l'image est identique sur les seize alors que le bruit ne l'est pas, si bien que les moyenner laisse l'image et annule l'essentiel du bruit.

L'amélioration est la racine carrée du nombre de prises. Quatre prises divisent le bruit par deux. Seize, par quatre. Cent, par dix. C'est une courbe impitoyable : passer de seize à soixante-quatre prises apporte la même amélioration une seconde fois, pour quatre fois plus de déclenchements — et c'est pourquoi presque toute pile pratique se situe entre huit et trente prises.

Il y a un second gain, plus discret. Moyenner seize prises de huit bits donne un résultat aux dégradés plus fins que n'en avait aucune d'elles, parce que le bruit qui faisait arrondir chaque prise différemment est précisément ce qui permet à la moyenne de tomber entre les niveaux. Empiler une série bruitée ne fait pas que retirer du bruit : cela récupère des nuances qu'une prise unique avait quantifiées.

## La question qui choisit la méthode

Non pas « que veux-je garder », mais **qu'est-ce qui différait d'une prise à l'autre**. Tout le reste en découle.

### Rien n'a bougé : la moyenne

La moyenne toute simple. C'est la réduction de bruit la plus efficace qui existe sur une série où la seule différence entre les prises est le bruit, et la plus facile à ruiner : une prise avec un oiseau dedans pose un oiseau pâle sur toute la pile, parce qu'une moyenne n'a pas d'avis sur une valeur qui contredit les autres. Elle l'inclut, tout simplement.

### Quelque chose a traversé le cadre : la médiane

Alignez une douzaine de photographies d'une place animée et regardez un pixel. Sur la plupart c'est du pavé ; sur une ou deux c'est le manteau de quelqu'un. Triez ces douze valeurs, prenez celle du milieu, et vous obtenez du pavé, parce que le manteau n'a jamais été majoritaire.

Faites cela pour chaque pixel et la place sort vide. C'est le tour de main derrière tous les articles sur « retirer les touristes de vos photos de vacances », et il n'exige rien de plus malin qu'une rafale et de la patience. La seule chose qu'il demande, c'est **qu'aucune partie de la scène ne soit occupée plus de la moitié du temps**. Une personne immobile sur huit de vos douze prises est majoritaire sur ces pixels, et la médiane la garde.

### Les deux : l'écrêtage sigma

La médiane jette l'essentiel de l'information pour obtenir sa robustesse — onze de vos douze valeurs sont écartées à chaque pixel —, elle réduit donc bien moins le bruit qu'une moyenne de la même série ne le ferait.

L'écrêtage sigma est le compromis, et c'est en général le réglage par défaut qui convient à toute série du monde réel. Il regarde chaque pixel sur toutes les prises, détermine ce qu'il est habituellement et de combien il varie, puis ne moyenne que les valeurs qui concordent. Une voiture qui a traversé une prise est exclue sur ces pixels ; toutes les autres prises comptent encore partout. Vous obtenez l'immunité de la médiane à ce qui a bougé et l'essentiel de la réduction de bruit de la moyenne.

Le seuil est en écarts-types, et deux est le point de départ habituel. Plus bas écarte davantage, et commence à écarter du détail réel avec la voiture.

### Seul ce qui est clair compte : éclaircir

Garder la valeur la plus claire qu'ait jamais eue chaque pixel. Photographiez le ciel nocturne en deux cents poses de trente secondes et éclaircissez-les ensemble : chaque étoile trace son propre arc sur le résultat — un filé d'étoiles, assemblé à partir de poses courtes qui, prises isolément, n'ont jamais brûlé. La même méthode recompose un feu d'artifice à partir des prises de sa propre explosion, et un light painting à partir d'une promenade à la lampe torche dans une pièce noire.

Son contraire, assombrir, est le discret de la paire : un pixel ne reste clair que s'il l'était sur *toutes* les prises, si bien que les reflets dans une vitre, les phares qui passent et les gouttes de pluie éclairées au flash disparaissent tous.

### Le sujet est plus profond que la mise au point : l'empilement de mise au point

Une macro à f/8 a peut-être un millimètre de net, ce qui ne suffit pas pour un insecte. La réponse est de faire vingt prises le long de la bague de mise au point et de ne garder, de chacune, que la partie qui y était nette. L'outil mesure de combien chaque pixel diffère de ses voisins — beaucoup sur un bord, presque rien sur un flou — et retient le gagnant.

Celle-ci réclame un trépied plus que toutes les autres, parce que tourner la bague à la main déplace l'appareil, et qu'une prise faite d'un peu plus loin n'est pas la même image à une autre mise au point.

![La liste des modes, moyenne, médiane, plus clair, plus sombre, avec en dessous un plan donnant la taille de sortie, la mémoire nécessaire et la part de chaque fichier à lire.](https://abox.tools/screens/stack-photos-to-reduce-noise/plan.webp)

Le mode est la question de cette section. Le plan en dessous est l'outil qui dit ce que coûtera la passe avant de la lancer.

## Aligner les prises

L'empilement est un calcul pixel par pixel : il suppose donc qu'un pixel donné est la même partie de la scène sur toutes les prises. À main levée, il ne l'est pas : une rafale dérive de plusieurs dizaines de pixels, et moyenner cela produit un flou plutôt qu'une image nette. C'est la raison la plus fréquente pour laquelle un premier essai d'empilement déçoit.

Les prises sont donc mesurées par rapport à l'une d'elles et remises en place d'abord, à une fraction de pixel près. Trois réglages :

- **Décalage seul** convient à presque tout ce qui est pris à main levée. Il corrige la dérive et le tremblement.
- **Décalage, rotation et échelle** pour une série où vous tourniez aussi légèrement, ou dans laquelle un zoom a glissé. Cela coûte une mesure de plus par prise et rien du tout lorsque les prises se révèlent droites.
- **Aucun** pour un trépied fixe ou une séquence d'intervallomètre, où les prises sont déjà alignées et où les mesurer est du temps perdu.

Ce qu'aucun alignement ne peut corriger, c'est un sujet qui a bougé plutôt qu'un appareil qui a bougé, ni une photographie prise un pas plus à gauche. Se déplacer latéralement change de combien le proche se décale par rapport au lointain, et aucune correction unique ne décrit les deux à la fois. Tourner sur place, c'est bon ; marcher, non.

![Le résultat : l'image empilée, avec une note indiquant de combien chaque image a dû être déplacée pour s'aligner sur la première.](https://abox.tools/screens/stack-photos-to-reduce-noise/result.webp)

Les chiffres d'alignement méritent d'être lus. Une rafale à main levée bouge de quelques pixels par image, et c'est cela que l'aligneur défait sans rien dire.

## Où les fichiers RAW s'insèrent

Vous pouvez déposer directement des CR2, CR3, NEF, ARW, DNG, RAF, RW2, ORF et le reste, et il vaut la peine d'être exact sur ce qui leur arrive, car ce n'est pas ce que fait un dérawtiseur.

Tout fichier RAW contient déjà un **JPEG pleine taille que l'appareil a développé au déclenchement**. C'est ce que vous montre le dos de l'appareil et ce que votre système d'exploitation dessine en vignette. L'empileur trouve cette image et l'emploie. Il ne décode pas les données du capteur.

Deux conséquences, une bonne et une à connaître :

- **C'est rapide.** Trouver l'aperçu revient à lire quelques kilooctets de répertoire puis une seule tranche, si bien qu'une prise de 60 Mo s'ouvre à peu près aussi vite qu'un JPEG. Vingt d'entre elles s'ouvrent dans le temps qu'un dérawtiseur consacrerait à une seule. La page vous montre le peu de vos fichiers qu'elle a réellement lu.
- **C'est l'interprétation de l'appareil, pas la vôtre.** Huit bits par canal, avec la balance des blancs et le style d'image réglés sur l'appareil — et non les douze ou quatorze bits de données linéaires de capteur qu'un dérawtiseur vous donnerait.

Pour la réduction de bruit, les filés d'étoiles, le retrait des passants et l'empilement de mise au point, ce compromis vaut presque toujours la peine : les aperçus sont en pleine résolution et ils sont ce que vous auriez obtenu en JPEG de toute façon. Si vous poussez fort les ombres, ou si vous empilez pour de l'astrophotographie où le dernier bit de dynamique est tout l'enjeu, développez d'abord les prises dans un dérawtiseur et empilez les TIFF ou les JPEG qu'il donne. Ils entrent de la même façon.

## Ce que cela coûte à l'exécution

Cela vaut la peine d'être su, parce que c'est la différence entre une pile qui prend huit secondes et une qui en prend deux minutes.

Six des sept méthodes n'ont jamais besoin de se souvenir que d'une chose. Un maximum courant se moque des prises qu'il a déjà vues, et un total courant aussi : ces méthodes lisent donc chaque prise exactement une fois et emploient autant de mémoire pour cent prises que pour deux.

La médiane ne peut pas fonctionner ainsi, parce qu'on ne peut connaître la valeur centrale d'un ensemble qu'une fois qu'on l'a tout entier. Vingt prises de 24 mégapixels font environ 1,4 Go de pixels gardés à la fois, ce qu'aucun navigateur ne vous accordera : l'image est donc découpée en bandes horizontales et empilée bande par bande — correct, et plus lent, parce que les prises sont relues pour chaque bande.

L'outil calcule tout cela avant que vous n'appuyiez sur le bouton et vous le dit : la taille du résultat, la mémoire qu'il demandera à peu près, et combien de fois vos prises seront décodées. S'il annonce un passage en bandes, baisser la résolution de travail d'un cran divise la mémoire par quatre et le ramène presque toujours à un seul passage — et si vous empilez pour retirer du bruit, la demi-résolution allait de toute façon paraître plus propre que la pleine.

## Photographier en vue de cela

L'essentiel de la qualité d'une pile se décide avant qu'aucun logiciel ne la voie.

- **Faites plus de prises que vous ne le croyez nécessaire.** La courbe en racine carrée est impitoyable en bas et généreuse en haut : passer de quatre à neuf prises est un changement plus visible que passer de vingt à quarante.
- **Ne changez pas l'exposition entre les prises.** L'empilement suppose que les prises montrent la même scène à la même luminosité. Bloquez l'exposition, sinon l'outil moyennera deux images différentes.
- **Pour retirer des gens, attendez entre les prises.** Une rafale prise en deux secondes attrape la même personne au même endroit sur toutes les prises, et la médiane la garde. Dix prises espacées de quelques secondes marchent bien mieux que cinquante en rafale.
- **Pour les filés d'étoiles, gardez les intervalles courts.** Éclaircir dessine exactement ce que les prises ont enregistré : une pause entre deux poses devient donc un tiret visible sur chaque filé.

## Rien de tout cela ne quitte votre machine

Une pile de vingt prises RAW fait environ un gigaoctet de photographies, ce qui fait beaucoup à confier à un site web pour qu'il en fasse la moyenne. L'[empileur d'images](https://abox.tools/fr/empiler-des-images/) lit les fichiers sur votre propre disque et fait le calcul dans votre propre navigateur. Il n'y a ni étape d'envoi, ni compte, ni file d'attente, et vous pouvez vérifier cette affirmation comme vous vérifieriez celle de n'importe qui : ouvrez le panneau réseau de votre navigateur pendant qu'il travaille, ou débranchez-vous simplement d'internet et empilez quand même.

La question voisine — comment savoir, pour n'importe quel outil, si lui confier un fichier était nécessaire — a [son propre guide](https://abox.tools/fr/guides/est-il-sur-d-envoyer-ses-fichiers/).
