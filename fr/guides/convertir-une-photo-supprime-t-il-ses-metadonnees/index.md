# Convertir une photo supprime-t-il ses métadonnées ?

Parfois, et les deux réponses ont déjà brûlé du monde. Réencoder par un canevas décape tout ; un convertisseur soigneux transporte tout ; l'image est identique dans les deux cas. Le seul geste fiable est d'arrêter de prédire et de regarder le fichier.

Dernière mise à jour 13 octobre 2026

## La réponse courte

Parfois. Convertir, redimensionner ou compresser une photo retire ses métadonnées quand l'outil reconstruit l'image à partir des pixels, et les garde quand l'outil les recopie exprès — et rien à l'écran ne dit lequel des deux s'est produit. L'image a le même air dans les deux cas, parce que les métadonnées n'ont jamais fait partie de l'image.

Les deux issues surprennent, en sens opposés. Quelqu'un compte sur « juste un redimensionnement » pour effacer la position — elle survit. Quelqu'un d'autre compte sur un changement de format pour préserver la date de prise de vue — elle a disparu. Les deux erreurs ont le même remède : cesser de prédire ce qu'un outil a probablement fait, et regarder ce que le fichier contient réellement.

## Garder une copie d'archive et une copie de partage

**Pour une photothèque,** gardez l'original et utilisez une conversion qui préserve délibérément les dates de prise de vue utiles. Le [convertisseur HEIC](https://abox.tools/fr/guides/convertir-un-heic-en-jpg/) peut garder les métadonnées prises en charge dans le JPEG ; testez un échantillon avant toute la collection. La date de modification du système de fichiers est distincte de la date de prise de vue.

**Pour une annonce ou un portfolio public,** créez une copie de partage distincte. Redimensionnez ou compressez-la selon le besoin, [retirez volontairement les balises indésirables](https://abox.tools/fr/guides/supprimer-les-donnees-exif-et-gps/) et examinez le fichier final téléchargé. Gardez l'original d'archive hors de cet envoi.

Cela repère aussi le cas facile à manquer où un redimensionneur ou compresseur juge qu'aucun changement n'est nécessaire et rend les octets originaux. Un fichier déjà assez petit peut encore contenir sa position GPS malgré son passage par une page de nettoyage d'images.

## Ce qui voyage à côté, et pourquoi c'est séparé

Un fichier photo est deux choses dans un même conteneur : l'image encodée, et un bloc d'étiquettes à son sujet — EXIF, souvent accompagné de XMP et d'un profil colorimétrique. Les étiquettes disent typiquement quand la photo a été prise, l'appareil et l'objectif, l'exposition, les coordonnées GPS de l'endroit où vous étiez, et souvent une petite miniature embarquée — parfois de l'image telle qu'elle était *avant* une retouche, ce qui explique qu'un recadrage puisse manquer ce qu'il recadrait. La visite complète de ce bloc est dans [le guide EXIF](https://abox.tools/fr/guides/supprimer-les-donnees-exif-et-gps/).

Le point qui décide de tout : les étiquettes sont *à côté* des pixels, pas dedans. Un outil qui décode l'image reçoit des pixels et pas d'étiquettes ; ce qu'il écrit en sortie ne contient que ce qu'il choisit d'y remettre. Un outil qui modifie le fichier sans réencoder peut laisser les étiquettes intactes — ou retirer exactement elles et rien d'autre.

## Pourquoi réencoder décape, et recopier conserve

La plupart des opérations d'image dans le navigateur utilisent un canevas : décoder en pixels bruts, les transformer, encoder un nouveau fichier. Ce nouvel encodage ne copie les balises de l'appareil que si l'outil les rétablit explicitement. Lorsque le [Compresseur d'images](https://abox.tools/fr/compresser-une-image/) et le [Redimensionneur d'images](https://abox.tools/fr/redimensionner-une-image/) réencodent réellement ici, leurs sorties n'ont ni EXIF, ni GPS, ni XMP. Mais les deux peuvent rendre l'original inchangé si aucune réduction n'est nécessaire. Ce passage intact conserve les métadonnées. Vérifiez le fichier téléchargé sans déduire leur suppression du nom de la page.

Un convertisseur, à l'inverse, peut se donner du mal pour préserver. Le [convertisseur HEIC vers JPG](https://abox.tools/fr/convertir-heic-en-jpg/) de ce site fait exactement cela : il soulève le bloc de métadonnées hors du conteneur HEIC et l'installe dans le JPEG, dates, GPS et tout — parce qu'une conversion est censée être la même photo dans un autre manteau. (Une étiquette est réécrite à dessein : l'orientation, pour que l'image ne bascule pas ; et le bloc ne tient que dans la sortie JPEG — le menu des formats le précise.) Deux outils honnêtes, comportements opposés, chacun juste pour sa tâche — et c'est précisément pourquoi deviner d'après le genre d'outil ne marche pas.

Hors du navigateur, le tableau est tout aussi mêlé, avec la même logique dessous. Captures d'écran et exports sont des encodages neufs : pas de métadonnées d'appareil. Les messageries recompressent fort, donc les photos envoyées comme photos perdent en général leurs étiquettes — mais le même fichier envoyé « en document » voyage octet pour octet, étiquettes comprises. Pièces jointes de courriel et disques en ligne déplacent les fichiers tels quels. Le motif tient : reconstruit veut dire décapé, copié veut dire conservé.

## Vérifier au lieu de supposer

La vérification prend moins d'une minute : ouvrez le fichier de sortie — pas l'original — dans le [lecteur-suppresseur EXIF](https://abox.tools/fr/supprimer-les-donnees-exif/) et lisez ce qui s'y trouve. Il analyse le fichier sur votre propre machine et montre chaque étiquette, miniature embarquée comprise. Rien dedans, rien de fui. Encore dedans, et vous voyez exactement quoi.

Trois habitudes découlent de tout ce qui précède :

- **Quand le but est la vie privée, retirez délibérément.** Décapez les étiquettes avec l'outil EXIF — il modifie le fichier sans réencoder, l'image ne perd donc rien — puis vérifiez le résultat. Ne comptez pas sur un redimensionnement qui décape par accident.
- **Quand le but est de garder la trace, convertissez avec un outil qui annonce préserver** — et vérifiez aussi, parce que « il a probablement gardé » échoue dans l'autre sens : une photothèque aux dates évaporées est aussi une perte.
- **Vérifiez le fichier que vous envoyez vraiment**, après la dernière étape de votre chaîne. Chaque outil décide pour lui-même, et seul le contenu du fichier final compte.

Et si l'outil de vérification est lui-même une page web, la question habituelle s'applique à lui aussi — un lecteur de métadonnées reçoit votre photo, GPS compris. Celui d'ici tourne entièrement dans votre navigateur, sans rien envoyer nulle part, et [le guide sur l'envoi de fichiers](https://abox.tools/fr/guides/est-il-sur-d-envoyer-ses-fichiers/) montre comment vérifier cette affirmation plutôt que la croire.
