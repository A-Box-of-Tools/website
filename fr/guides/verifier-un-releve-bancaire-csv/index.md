# Comment vérifier le CSV d’un relevé bancaire avant de lui faire confiance

Un tableur peut paraître parfait tout en contenant un montant erroné ou une transaction manquante. Comparez-le au relevé, en utilisant les soldes imprimés pour vérifier les nombres et les lignes d’origine pour vérifier le reste.

Dernière mise à jour 29 septembre 2026

## La réponse courte

Un CSV bien présenté dans un tableur peut encore contenir un montant erroné, une opération manquante ou une date inversée. Comparez-le au relevé original : lignes, dates et descriptions, puis soldes courants imprimés pour contrôler les montants.

Gardez le PDF à côté du fichier converti. Un téléchargement réussi prouve seulement qu’un fichier a été produit ; ces contrôles aident à vérifier sa fidélité au relevé.

## Avant de convertir, cherchez un export

Si votre banque fournit un CSV pour la période voulue, commencez par lui. L’export direct évite de reconstruire un tableau depuis des mots placés sur une page PDF. Vérifiez le compte, les dates et le sens des colonnes ; une étape susceptible d’erreur disparaît.

Parfois, vous n’avez que le PDF : ancien relevé, compte fermé ou document reçu. La conversion devient alors utile.

## Examinez un petit relevé

Ce relevé fictif de compte courant commence avec **1,250.00**. Les montants positifs ajoutent de l’argent ; les négatifs en retirent. La dernière colonne est imprimée sur le relevé, pas calculée ensuite dans le tableur.

Quatre opérations fictives, avec un solde initial de 1 250,00

| Date | Description | Montant | Solde imprimé |
| --- | --- | --- | --- |
| 2026-08-03 | Versement de salaire | +800.00 | 2,050.00 |
| 2026-08-04 | Courses | -43.20 | 2,006.80 |
| 2026-08-05 | Café | -6.80 | 2,000.00 |
| 2026-08-06 | Virement | -125.00 | 1,875.00 |

Chaque ligne se vérifie ainsi : **solde précédent + montant signé = nouveau solde**. Pour les courses, `2050.00 + (-43.20) = 2006.80`. Pour le café, `2006.80 + (-6.80) = 2000.00`.

Supposons que le CSV lise les courses comme **-48.20**. Toutes les cellules sont remplies, mais `2050.00 + (-48.20) = 2001.80`. L’écart avec le solde imprimé est de **5.00**, ce qui donne une ligne précise à comparer au PDF.

Gardez les soldes imprimés pendant le contrôle. Les remplacer par des formules utilisant les montants convertis rend le tableur cohérent avec lui-même, erreurs comprises.

Vérifiez le sens du solde avant les signes. Un relevé de carte peut afficher une dette : les achats l’augmentent et les remboursements la réduisent. Ses signes ne signifient pas forcément la même chose que dans cet exemple de compte courant.

## Pourquoi le total final ne suffit pas

Comparer le solde initial plus tous les montants au solde final est utile, mais des erreurs peuvent se compenser : un paiement supérieur de 5,00 et un autre inférieur de 5,00 laissent un total concordant.

Vérifier chaque solde courant disponible fournit davantage de comparaisons. Si un solde n’apparaît qu’en fin de journée, comparez-le au solde imprimé précédent augmenté de tous les montants intermédiaires.

Même ce contrôle a des limites. Deux opérations manquantes de **-20.00 et +20.00** laissent le solde inchangé, et la comparaison peut réussir. Comparez aussi l’ordre des lignes à l’original.

Un solde concordant ne prouve ni la fidélité d’une date ou d’un bénéficiaire, ni l’authenticité du relevé. Il contrôle seulement la relation entre les montants et soldes disponibles.

## Vérifiez les dates avant de trier

`03/04/2026` peut signifier le 3 avril ou le 4 mars. Une date comme `18/04/2026` peut établir la convention, mais un court relevé peut n’en contenir aucune. Vérifiez la période et la présentation de la banque au lieu d’accepter une supposition.

Vérifiez encore après ouverture du CSV : le tableur peut interpréter les dates autrement que le convertisseur. Gardez l’ordre original jusqu’à la fin du contrôle. Trier des dates mal lues complique la comparaison et détruit l’ordre des soldes courants.

Les dates sans année exigent aussi de vérifier la période, surtout entre décembre et janvier. Vérifiez les conventions numériques : `1,240.00` et `1.240,00` peuvent représenter le même montant ; les cellules importées doivent préserver cette valeur.

## Lisez les descriptions et séparez les totaux

Une description sur deux lignes reste une opération. Vérifiez que sa suite lui est restée attachée, surtout aux changements de page où en-têtes répétés et reports de solde peuvent ressembler à des opérations.

Le PDF peut contenir résumés du compte, sous-totaux et détails de paiement. Ils font partie du document extrait, mais ne doivent pas devenir des opérations supplémentaires. Identifiez le tableau des opérations et séparez les résumés avant l’import.

Deux paiements de même date, bénéficiaire et montant peuvent être réels. Comparez leur position et leurs références au relevé avant d’en retirer un. Une extraction dupliquée et un paiement répété nécessitent des corrections différentes.

## Ce que ce convertisseur contrôle

[PDF en CSV](https://abox.tools/fr/pdf-en-csv/) repère les tableaux grâce à l’alignement du texte, réunit les cellules sur plusieurs lignes et garde les totaux et libellés. S’il y a plusieurs tableaux, choisissez le bon. L’ordre des dates ambiguës est réglable ; les dates sans année restent telles qu’imprimées.

Lorsqu’une suite de soldes courants est reconnue, l’outil indique si les comparaisons disponibles concordent. Vérifiez vous-même les montants avant le premier solde avec le solde initial, puis ceux après le dernier. Un message positif ne couvre que les comparaisons effectuées.

Sans suite de soldes utilisable reconnue, aucun verdict n’est donné. **Le silence n’est pas une confirmation.** Un résultat silencieux ou un contrôle positif ne garantit pas l’exactitude du fichier entier. L’aperçu montre au plus 25 lignes par tableau ; examinez le téléchargement pour les autres.

Les pages numérisées exigent une reconnaissance du texte, absente de cet outil. La conversion fonctionne dans votre navigateur ; le guide sur [l’envoi d’un relevé bancaire à un convertisseur](https://abox.tools/fr/guides/envoyer-un-releve-bancaire-est-il-sur/) traite la confidentialité.

## Avant d’importer le CSV ailleurs

Examinez l’aperçu d’import aussi attentivement que le fichier. Choisissez le bon compte bancaire ou de carte, confirmez le format des dates et associez les colonnes de date, description et montant. Ces choix sont distincts de l’extraction du PDF ; consultez [les instructions d’import CSV d’Intuit](https://quickbooks.intuit.com/learn-support/en-uk/help-article/bank-transactions/prepare-csv-file-bank-upload-quickbooks/L4BjLWckq_GB_en_GB) pour les exigences d’un produit.

- Confirmez le compte et la période du relevé.
- Vérifiez dates, signes et formats numériques après ouverture.
- Comparez les opérations à l’original, changements de page compris.
- Vérifiez les soldes initial, courants et final disponibles.
- Examinez les écarts et les répétitions avant de les corriger.
- Gardez l’original et une copie du CSV vérifié.
