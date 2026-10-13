# Comment préparer les photos du téléphone pour le web

Une photo de téléphone est au mauvais format, quatre fois trop grande, et elle sait où vous habitez. La rendre postable est une chaîne courte — convertir, cadrer, compresser — et chaque étape tourne sur votre propre machine, qui est exactement là où doivent rester des photos avec votre GPS dedans.

Dernière mise à jour 26 août 2026

## La réponse courte

1. **Les photos d'iPhone d'abord :** passez les fichiers HEIC par le [convertisseur HEIC](https://abox.tools/fr/convertir-heic-en-jpg/), et choisissez de laisser les métadonnées de côté. Il vous dit, avant de convertir quoi que ce soit, quelles photos portent des coordonnées GPS. Les photos déjà en JPEG sautent cette étape.
2. **Cadrer et dimensionner :** déposez le lot sur le [Redimensionneur d'images](https://abox.tools/fr/redimensionner-une-image/). Fixez un grand côté — 1600 pixels vont à la plupart des pages, 2000 si les lecteurs zoomeront — ou recadrez tout le lot au même format en un clic.
3. **Tenir le budget :** finissez dans le [Compresseur d'images](https://abox.tools/fr/compresser-une-image/), qui prend une cible en kilooctets plutôt qu'un curseur de qualité, et rend un lot en un seul zip.

Tout tourne dans votre navigateur. Les originaux — pleine résolution, GPS et tout — ne quittent jamais votre machine, et c'est la raison de faire cela en local plutôt que par un site de conversion.

## Où vont les métadonnées

Le risque discret d'une photo de téléphone, ce ne sont pas les pixels ; ce sont les étiquettes. Les métadonnées EXIF consignent l'appareil, les horodatages et — sur presque tous les téléphones — les coordonnées GPS du lieu de prise. Postez cela et vous publiez peut-être votre adresse dans une forme que tout visiteur sait lire.

Le fait utile de cette chaîne, c'est qu'elle règle les étiquettes toute seule. Redimensionner et compresser redessinent l'image depuis les pixels, et des pixels redessinés ne portent pas d'étiquettes — tout ce qui sort des étapes 2 ou 3 est donc propre sans qu'on le lui demande. Les deux cas qui demandent une décision :

- **Convertir du HEIC :** le convertisseur peut faire suivre les métadonnées ou les laisser — c'est une case — et il prévient quelles photos ont du GPS à bord. Pour tout ce qui est public, laissez-les.
- **Une photo que vous ne redimensionnez pas :** si les pixels doivent rester intacts, octet pour octet, prenez l'[éditeur EXIF](https://abox.tools/fr/supprimer-les-donnees-exif/), qui retire les étiquettes sans réencoder l'image. Le [guide des métadonnées](https://abox.tools/fr/guides/supprimer-les-donnees-exif-et-gps/) est la version longue.

## Pourquoi redimensionner avant de compresser

Parce que les pixels sont le budget. Une photo de 12 mégapixels serrée assez fort pour tenir dans 300 Ko a l'air visiblement pire qu'une photo de 2 mégapixels compressée doucement dans la même place — les mêmes kilooctets s'étalent sur six fois la surface. Décider d'abord de la taille d'affichage laisse le compresseur dépenser son budget en qualité plutôt qu'en résolution que personne ne verra.

Le compresseur redimensionne de lui-même quand il n'y a pas d'autre moyen d'atteindre la cible, mais il traite cela en dernier recours. Faire le cadrage vous-même dans le redimensionneur garde la décision — quoi couper, quel bord compte — là où elle doit être.

Le [guide du redimensionnement](https://abox.tools/fr/guides/redimensionner-une-image/) et le [guide de la compression](https://abox.tools/fr/guides/compresser-une-image-a-une-taille-precise/) approfondissent chacun leur moitié, y compris ce que mesurent vraiment les chiffres de qualité.

![Le redimensionneur réglé sur le plus grand côté, avec 1600 saisi et des valeurs prédéfinies à côté.](https://abox.tools/screens/get-photos-ready-for-the-web/long-edge.webp)

Le grand côté d'abord, parce que c'est le seul réglage qui traite de la même façon une photo verticale et une photo horizontale.

## Tout le lot d'un coup

Chaque outil de la chaîne prend un dossier entier en un seul dépôt : le convertisseur fait chaque HEIC, rafales comprises, le redimensionneur pose un même cadrage sur tout le lot ou vous laisse recadrer chaque photo autrement, et le compresseur rend le tout en un seul zip. Vingt photos ne coûtent guère plus de votre attention qu'une — le temps machine est celui de votre machine, et il est plus court que n'importe quel envoi ne l'aurait été.

![Trois lignes de résultat, chacune montrant une photo ramenée de plusieurs mégaoctets à environ 150 ko, avec la qualité obtenue.](https://abox.tools/screens/get-photos-ready-for-the-web/quality.webp)

Et la qualité ensuite, sur tout le lot d'un coup. L'ordre compte : la section du dessus dit pourquoi.

## Si vous faites cela chaque semaine

La chaîne vit ici sur trois ou quatre pages, à dessein — chaque page fait un travail, et chacune prouve seule que rien ne quitte votre machine. Mais chaque étape est libre : licence MIT, un dossier par outil, des modules ES sans dépendances, avec des README qui expliquent le décodeur, le rééchantillonnage et la recherche de la taille cible.

Si vos photos prennent chaque fois la même forme — même grand côté, même budget, mêmes étiquettes retirées — pointez un agent de code vers le [dépôt](https://github.com/A-Box-of-Tools/website) et demandez-lui de composer ces modules en une seule zone de dépôt avec vos préréglages incorporés. Les modules ont été écrits pour être lus, et les emporter est exactement ce à quoi sert la licence.
