# Comment scanner plusieurs pages en un petit PDF

La corvée fait rarement une page. C'est un contrat et sa page de signature, ou une année de reçus, et au bout une boîte mail qui refuse tout ce qui dépasse quelques mégaoctets. Trois outils couvrent tout le chemin, et les papiers restent sur votre propre machine d'un bout à l'autre.

Dernière mise à jour 26 août 2026

## La réponse courte

Photographiez chaque page, puis déposez toutes les photos d'un coup sur le [Scanner de documents](https://abox.tools/fr/scanner-un-document/). Il trouve les coins de chaque page, redresse chaque photo et écrit *un PDF avec une page par photo* — il n'y a pas d'étape de combinaison à faire, et les pages sont dans l'ordre où vous les avez ajoutées.

Deux outils prennent le relais là où le scanner s'arrête. Si une partie du document *est* déjà un PDF — le contrat reçu par mail, autour de votre page de signature scannée — entrelacez-les avec le [Fusionneur de PDF](https://abox.tools/fr/fusionner-des-pdf/). Et si le fichier fini dépasse encore ce que la boîte accepte, le [Compresseur de PDF](https://abox.tools/fr/compresser-un-pdf/) le fait passer sous la limite.

Les deux relais sont à un clic : dès que le scanner a écrit son PDF, une ligne sous le bouton de téléchargement propose de poursuivre avec le résultat dans le fusionneur ou le compresseur, déjà chargé — et le fusionneur passe son propre résultat au compresseur de la même façon.

Rien dans la chaîne n'envoie quoi que ce soit. Cela compte ici plus que presque partout : ce qui se scanne, ce sont des contrats, des pièces d'identité et des papiers médicaux, et les applications habituelles font passer chaque page par leurs serveurs.

## Réussir les photos

Le scanner rattrape énormément — prises de biais, lampe inégale, ombre en travers de la page — mais il ne peut pas rattraper ce que l'appareil n'a jamais capturé. Trois habitudes couvrent l'essentiel :

- **Remplir le cadre**, avec une marge de table visible autour de chaque bord. Les coins se trouvent en cherchant la page contre le fond ; une page qui déborde de la photo n'a pas de coin à trouver.
- **Photographier d'au-dessus**, à peu près d'aplomb. La perspective se corrige, mais le bord lointain d'une prise rasante a moins de pixels, et la correction ne peut pas en inventer.
- **Une page par photo**, dans l'ordre de lecture. Réordonner après coup marche aussi, mais l'ordre de prise est l'ordre obtenu, et photographier dans l'ordre est gratuit.

Le [guide du scan](https://abox.tools/fr/guides/scanner-un-document-avec-son-telephone/) couvre le reste — comment les coins sont trouvés, quand les déplacer vous-même, et ce que le mode noir et blanc fait à la taille du fichier.

![Le numériseur avec trois pages photographiées dans une bande, la première ouverte et ses coins marqués.](https://abox.tools/screens/scan-multiple-pages-into-one-pdf/pages.webp)

Trois pages, photographiées et redressées ensemble. Chacune garde ses propres coins, si bien qu'une mauvaise photo ne gâche pas la série.

## Quand le fusionneur gagne sa place

Le scanner combine des *photos*. Le fusionneur combine des *PDF* — et le milieu d'une vraie corvée est souvent les deux : une page signée photographiée à l'instant, dans un document arrivé en fichier. Scannez d'abord vos pages, puis déposez le scan et le PDF d'origine ensemble dans le fusionneur, glissez les pages à leur place, et exportez un seul document. Les signets et les liens internes de l'original sont reconstruits sur les pages qui restent, et les champs de formulaire remplis suivent.

Il en va de même des scans faits à des jours différents : le PDF de chaque séance tombe comme un bloc de pages, et le fusionneur est l'endroit où les blocs deviennent un fichier.

![Le constructeur de PDF avec les trois pages nettoyées dans la liste, au-dessus des réglages de format, d'orientation et de marge.](https://abox.tools/screens/scan-multiple-pages-into-one-pdf/document.webp)

Puis ces trois mêmes pages en un seul document, l'étape par laquelle le fusionneur gagne sa place.

## Passer sous la limite de taille

Essayez d'abord le levier bon marché, et il est dans le scanner : pour les pages qui sont de l'encre sur du papier — texte, formulaires, reçus — le mode noir et blanc stocke chaque page à un bit par pixel, et le PDF atterrit en général bien sous le mégaoctet par page, sans compresser quoi que ce soit. La couleur ne vaut son coût que là où la couleur veut dire quelque chose.

Quand le fichier ne part toujours pas — pages en couleur, ou fusion qui a fait entrer le scan de quelqu'un d'autre — le compresseur commence par montrer où la taille se trouve vraiment, puis réencode les images de page à la résolution où elles s'affichent. Il vérifie aussi que le résultat s'ouvre avant de l'offrir, ce qui compte quand le fichier est un contrat sous délai.

## Si vous faites cela chaque semaine

Les étapes vivent ici sur trois pages, à dessein — chaque page fait un travail, et chacune prouve seule que les papiers n'ont jamais quitté votre machine. Mais tout cela est libre : licence MIT, un dossier par outil, des modules ES sans dépendances, avec des README qui expliquent le chercheur de coins, la copie de pages du fusionneur et le budget du compresseur.

Si la même corvée atterrit chaque semaine sur votre bureau, pointez un agent de code vers le [dépôt](https://github.com/A-Box-of-Tools/website) et demandez-lui de composer ces modules en une page faite pour elle — scanner droit vers un document fusionné, compressé, votre page de garde déjà en place. Les modules ont été écrits pour être lus, et les emporter est exactement ce à quoi sert la licence.
