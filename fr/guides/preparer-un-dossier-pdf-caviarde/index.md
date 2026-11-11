# Préparer un dossier PDF caviardé pour un destinataire

Un dossier utile contient les pages nécessaires sans les détails privés superflus. Suivez un dossier d'atelier fictif, du choix des pages à la pièce jointe finale vérifiée.

Dernière mise à jour 22 octobre 2026

## Assemblez le dossier, retirez les détails privés, puis finalisez-le

Commencez par l'[outil de fusion PDF](https://abox.tools/fr/fusionner-des-pdf/) pour choisir et ordonner les pages. Utilisez le [caviardeur de PDF](https://abox.tools/fr/caviarder-un-pdf/) pour retirer le texte privé du document assemblé. Ajoutez un filigrane indiquant le destinataire s'il aide à comprendre l'usage du dossier, puis compressez uniquement si le fichier final doit être plus petit.

Ces outils traitent les fichiers localement dans votre navigateur. Téléchargez chaque résultat et ouvrez ce fichier dans l'outil suivant ; lorsqu'un lien pour poursuivre le travail est proposé, il peut vous transmettre le résultat. Conservez les originaux et les copies de travail dans un dossier distinct de la pièce jointe que vous comptez envoyer.

## L'exemple : quatre pages pour examiner un atelier

Morgan examine le programme d'un atelier fictif. Les sources contiennent aussi un numéro de téléphone personnel et un coût interne dont Morgan n'a pas besoin. Établissez la liste des pages avant d'ouvrir un outil :

| Pages sources | Utilité |
| --- | --- |
| `outline.pdf`, pages 1 et 3 | Présentation et horaires |
| `delivery.pdf`, page 2 | Modalités de livraison |
| `equipment.pdf`, page 1 | Liste du matériel |

Le résultat doit contenir quatre pages dans cet ordre. Écarter une page inutile est plus simple à vérifier que la conserver en essayant d'en retirer tous les détails privés. Gardez assez de contexte pour que le lecteur comprenne ce qui reste.

## 1. Sélectionnez et ordonnez les pages

Chargez les PDF sources dans l'[outil de fusion](https://abox.tools/fr/fusionner-des-pdf/). Conservez les pages nécessaires et placez-les dans l'ordre de lecture. Les numéros de la liste de travail changent à mesure que vous retirez ou déplacez des pages ; vérifiez le nom du fichier source et son contenu par rapport à votre liste, au lieu d'appliquer les numéros d'origine à une liste déjà modifiée.

Enregistrez `01-selected.pdf`, puis ouvrez-le. Vérifiez qu'il contient quatre pages dans le bon ordre, que les horaires sont complets et qu'aucune note supplémentaire sur le matériel ne s'est glissée dedans. Les renvois tels que « voir la page suivante » doivent rester cohérents. Le [guide de fusion et de découpage](https://abox.tools/fr/guides/fusionner-et-diviser-des-pdf/) explique ce que l'assemblage préserve et ce qu'il ne peut pas reprendre.

## 2. Retirez le texte privé du dossier assemblé

Chargez `01-selected.pdf` dans le [caviardeur de PDF](https://abox.tools/fr/caviarder-un-pdf/). Recherchez le numéro de téléphone et le coût interne, examinez les résultats et sélectionnez chaque occurrence à retirer. Vérifiez aussi les en-têtes, pieds de page et coordonnées répétées. Les motifs automatiques aident à repérer des éléments possibles ; ils ne décident pas de ce que ce destinataire doit voir.

Le caviardeur retire les instructions de texte prises en charge et vérifie sa sortie avant de proposer le téléchargement. Un rectangle sombre dessiné dans un éditeur PDF ordinaire peut laisser les mots d'origine en dessous. Suivez le [guide de caviardage des PDF](https://abox.tools/fr/guides/caviarder-un-pdf/) et arrêtez si l'outil signale du texte illisible ou ne peut pas traiter le document de manière fiable.

Enregistrez `02-redacted.pdf` et rouvrez ce fichier téléchargé. Examinez chaque suppression et les informations voisines. Recherchez les valeurs retirées et essayez de sélectionner et de copier les zones concernées. Ces vérifications sont utiles, sans constituer une preuve universelle : les images, les encodages de polices illisibles et les contenus non pris en charge peuvent échapper à la recherche de texte.

![Le champ de recherche du caviardeur de PDF et les motifs facultatifs de données sensibles, avec des identifiants de facture fictifs saisis.](https://abox.tools/screens/prepare-a-redacted-pdf-pack/find.webp)

Recherchez les valeurs que vous avez décidé de retirer, puis examinez les résultats. Les termes de facture montrés ici ne constituent pas une liste exhaustive pour un autre document.

## Si une page est numérisée, caviardez d'abord ses pixels

Une numérisation est une image. Retirer sa couche de texte OCR consultable n'efface pas les mots visibles dans cette image. Une recherche sans résultat ne prouve pas qu'une page numérisée a été caviardée.

Pour des photos sources, utilisez le [caviardeur d'images](https://abox.tools/fr/caviarder-une-image/) avant d'assembler les images exportées avec [Images en PDF](https://abox.tools/fr/images-en-pdf/). Examinez les pixels exportés, puis le PDF obtenu. Les guides de [caviardage d'images](https://abox.tools/fr/guides/caviarder-une-image/) et d'[assemblage d'images](https://abox.tools/fr/guides/reunir-des-images-dans-un-pdf/) présentent cette solution. Un PDF numérisé existant n'est pas une image que ces outils acceptent en entrée : repartez d'images sources adaptées ou d'un processus qui le prend en charge.

## 3. Ajoutez le destinataire et l'usage, si cela aide

Chargez `02-redacted.pdf` dans [Filigrane PDF](https://abox.tools/fr/filigrane-pdf/) et ajoutez « Examen de l'atelier pour Morgan ». Enregistrez `03-marked.pdf`. Vérifiez chaque page pour vous assurer que la marque laisse les dates, schémas et petits tableaux lisibles. Le [guide des filigranes](https://abox.tools/fr/guides/ajouter-un-filigrane-a-un-pdf/) explique le placement et les limites de cette marque.

La marque indique au lecteur l'usage prévu. Elle n'empêche ni la transmission, ni la copie, ni la photographie, et ne remplace pas le caviardage. Omettez-la si cette indication n'apporte rien d'utile.

## 4. Compressez uniquement si le fichier final en a besoin

Vérifiez la limite de taille des pièces jointes à destination. Si le fichier marqué reste largement en dessous, conservez-le. Sinon, essayez une copie dans le [compresseur de PDF](https://abox.tools/fr/compresser-un-pdf/) et comparez le résultat à l'entrée. Un court document texte peut à peine diminuer.

Lisez le tableau du matériel et les petits caractères à une taille d'affichage pratique. Une pièce jointe plus petite n'est pas un progrès si Morgan ne peut pas la lire. Le [guide de compression](https://abox.tools/fr/guides/reduire-la-taille-d-un-pdf/) explique d'où viennent les économies. Nommez la version finale retenue `workshop-review-morgan.pdf`.

## Vérifiez la pièce jointe exacte que vous allez envoyer

Ouvrez le fichier final téléchargé, plutôt qu'un aperçu antérieur. Chaque opération a produit une sortie différente ; la dernière pièce jointe doit donc être vérifiée à son tour :

- Comptez et lisez les quatre pages dans leur ordre final.
- Examinez les zones supprimées et répétez les vérifications par recherche et copie.
- Vérifiez l'indication du destinataire et la lisibilité après compression.
- Examinez la taille, les propriétés et le nom du fichier pour repérer des détails involontaires.
- Joignez ce fichier vérifié, et non une copie de travail.

Sélectionner les pages d'abord limite ce qu'il faut examiner. Le caviardage vient ensuite ; le filigrane et la compression finalisent la copie. Si le destinataire accepte les PDF protégés par mot de passe et que vous en avez besoin, terminez ces modifications avant d'ajouter la protection. Gardez les originaux à part et n'envoyez que la pièce jointe vérifiée.
