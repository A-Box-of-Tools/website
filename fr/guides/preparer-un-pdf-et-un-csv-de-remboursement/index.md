# Préparer un PDF et un CSV de remboursement à partir de photos de reçus

Une demande de remboursement nécessite souvent des reçus lisibles et une liste de dépenses. Partez d'un même ensemble de photos vérifiées pour que le PDF et le CSV décrivent les mêmes documents dans le même ordre.

Dernière mise à jour 22 octobre 2026

## Créez les justificatifs et les lignes à partir des mêmes dossiers

Un PDF fournit au destinataire des reçus à lire. Un CSV lui fournit des champs à vérifier ou à ouvrir dans un tableur. Commencez dans l'[extracteur de reçus et factures](https://abox.tools/fr/extraire-recus-factures/), vérifiez les dossiers, puis utilisez ses pièces jointes JPEG préparées dans [Images en PDF](https://abox.tools/fr/images-en-pdf/). Ne compressez le PDF que s'il doit respecter une limite de pièce jointe plus petite.

Cet exemple utilise trois reçus fictifs en dollars canadiens :

| Reçu, dans l'ordre des dossiers | Total confirmé |
| --- | --- |
| 1. North Street Print | CAD 12,40 |
| 2. Market Car Park | CAD 8,00 |
| 3. Harbour Stationery | CAD 17,60 |

Le total attendu est de CAD 38,00. Vérifiez d'abord les champs et formats de pièces jointes exigés par le destinataire. Cet article assemble deux fichiers concordants ; il ne détermine pas si une dépense donne droit à un remboursement.

## Commencez par une photo par document

Gardez les originaux et sélectionnez des copies dans l'[extracteur](https://abox.tools/fr/extraire-recus-factures/). Il accepte les images JPEG, PNG, WebP et AVIF prises en charge par le navigateur, jusqu'à 20 images par lot et 20 Mo par image. La reconnaissance utilise un modèle local de texte imprimé en anglais. Convertissez d'abord les images non prises en charge et obtenez une photo plus nette si une date ou un montant est illisible.

Une image devient un dossier documentaire. Trois pages d'une même facture ne sont pas automatiquement regroupées en une dépense. Des totaux répétés sur ces pages peuvent créer plusieurs dossiers pour la même somme ; ce processus simple suppose un reçu complet par photo. Le [guide d'extraction](https://abox.tools/fr/guides/extraire-recus-et-factures/) décrit le périmètre de l'outil et les étapes de vérification.

## Vérifiez ensemble les champs et les recadrages

La reconnaissance propose des valeurs ; comparez-les à l'image. Vérifiez le commerçant, la date, la référence, le total et la devise. Un sous-total, une taxe, la somme remise en espèces ou la monnaie rendue peuvent sembler plausibles sans être le montant final du reçu. N'inventez pas une valeur manquante pour donner l'impression qu'une ligne est complète.

Gardez tout le document dans le recadrage de la pièce jointe, y compris le numéro du reçu, le montant final et le détail des taxes pertinent. Ne confirmez les champs et le recadrage qu'après les avoir lus. Une modification ultérieure d'un champ ou du recadrage peut annuler la confirmation ; revérifiez donc l'état avant l'export.

Dans cet exemple, choisissez CAD comme devise finale et vérifiez que les trois devises d'origine sont CAD. Les dossiers dans la même devise utilisent un taux de un ; aucune recherche de taux en ligne n'est nécessaire. Pour des devises différentes, suivez la vérification des taux du guide d'extraction plutôt que d'additionner des montants de devises différentes.

Seuls les dossiers confirmés entrent dans les totaux. Une somme apparemment correcte peut encore omettre un reçu inachevé. Vérifiez à la fois les trois dossiers confirmés et le total de CAD 38,00. Les avertissements de doublons ne comparent que le nom et la taille du fichier : examinez les images, car un doublon renommé peut échapper à l'avertissement et des images différentes peuvent en déclencher un.

## Exportez des lignes et des images concordantes

Téléchargez le CSV vérifié et les pièces jointes JPEG préparées, ou le ZIP contenant les deux. Décompressez le ZIP avant de sélectionner les images pour l'outil suivant. Les noms des pièces jointes comprennent des numéros de dossier stables, tandis que la colonne de nom de fichier du CSV contient le nom de la photo d'origine. Gardez aussi une copie du rapport texte : il rapproche les noms des originaux et des pièces jointes préparées. Utilisez cette correspondance, le commerçant, la date et le montant pour associer lignes et images, surtout lorsque les noms attribués par l'appareil photo se répètent.

Un CSV peut être exporté avant la fin des vérifications. Ouvrez le téléchargement réel et examinez l'état et les champs de chaque dossier ; l'export ne signifie pas que tout a été confirmé. Ici, vous devez trouver les trois dépenses prévues, chacune avec une image correspondante et le montant CAD vérifié du tableau ci-dessus. Le CSV se termine aussi par des lignes de nombre de documents, de nombre vérifié et de total général ; ce sont des récapitulatifs, pas des reçus supplémentaires. Excluez-les si vous additionnez vous-même les lignes de dépenses.

Conservez le tout sous `workshop-expenses.csv` et dans un dossier de travail d'images de reçus numérotées. Gardez les photos originales à part. Un tableur peut appliquer sa propre interprétation des dates ou des nombres à l'ouverture du CSV ; comparez donc son affichage au texte exporté et au reçu avant de vous fier à une valeur importée.

## Construisez le PDF dans l'ordre des dossiers

Choisissez les JPEG préparés dans [Images en PDF](https://abox.tools/fr/images-en-pdf/). Ce passage nécessite de télécharger puis de sélectionner les fichiers ; reprendre les photos d'origine de l'appareil ferait perdre les recadrages vérifiés et leur correspondance avec ces pièces jointes.

Disposez les images comme les lignes de dépenses du CSV : impression, stationnement, puis papeterie. Vérifiez la correspondance des noms dans le rapport plutôt que de faire confiance au tri du sélecteur de fichiers. Choisissez une mise en page qui garde chaque reçu entier et lisible, puis enregistrez `workshop-receipts.pdf`. Le [guide Images en PDF](https://abox.tools/fr/guides/reunir-des-images-dans-un-pdf/) explique les formats de page et la qualité d'image.

![Les commandes de mise en page d'Images en PDF pour choisir le format du papier et l'ajustement de l'image sur la page.](https://abox.tools/screens/prepare-a-reimbursement-pdf-and-csv/layout.webp)

Les commandes de mise en page. Gardez les longs reçus entiers et vérifiez leurs petits caractères dans le PDF exporté, pas seulement dans l'aperçu.

Ouvrez le PDF téléchargé et lisez chaque page. Vérifiez l'orientation, l'intégralité des bords, les dates et les petits montants de taxes. Ce PDF composé d'images n'acquiert pas de couche de texte consultable simplement parce que l'OCR a servi à produire le CSV.

## Compressez seulement si la limite du destinataire l'impose

Si le PDF convient, gardez-le. L'extracteur prépare déjà des JPEG compressés ; un nouveau passage peut apporter peu tout en rendant les petits caractères moins lisibles. Sinon, essayez une copie dans le [compresseur de PDF](https://abox.tools/fr/compresser-un-pdf/), comparez les tailles et relisez chaque reçu. La compression ne garantit pas une économie précise. Le [guide de compression PDF](https://abox.tools/fr/guides/reduire-la-taille-d-un-pdf/) explique les compromis.

## Vérifiez les deux fichiers que vous allez remettre

- Le CSV contient les trois dépenses prévues et confirmées, avec les bonnes devises.
- Chaque reçu correspond à un dossier et apparaît dans l'ordre correspondant du PDF.
- Chaque page finale du PDF conserve les détails qui justifient son montant.
- Les montants CAD confirmés totalisent CAD 38,00.
- Les pièces jointes exactes respectent les formats et tailles exigés par le destinataire.

Dans cet exemple, l'OCR et la vérification manuelle sont locaux. Une recherche facultative de taux historiques est une action réseau distincte ; envoyer les fichiers par courriel ou par un autre service en est une autre. Gardez les originaux pour d'éventuelles questions. Un PDF et un CSV concordants facilitent la vérification, mais ne prouvent pas que la reconnaissance était juste et ne garantissent pas leur acceptation.
