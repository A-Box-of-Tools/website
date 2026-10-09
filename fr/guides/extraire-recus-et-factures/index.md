# Extraire les renseignements des reçus et factures à partir de photos

Une pile de reçus devient utile lorsque chaque document a un montant lisible et que le rapport indique combien ont été comptés. L’OCR peut économiser la saisie, mais c’est votre vérification de la photo qui rend le résultat prêt à envoyer. Voici ce qu’il faut vérifier, comment garder le document entier dans une pièce jointe plus petite, ce que signifient les totaux et comment emporter les images et le rapport dans votre propre application de messagerie.

[Ouvrir Extracteur de reçus et factures](https://abox.tools/fr/extraire-recus-factures/): Lisez les photos, vérifiez les champs et les recadrages, puis envoyez les images compressées avec chaque montant et les totaux.

Dernière mise à jour 4 octobre 2026

## Commencer avec un document par photo

Photographiez le reçu ou la facture en entier, avec le texte à l’endroit et net. Remplissez le cadre, utilisez un éclairage uniforme et évitez de projeter votre ombre sur la page. Vérifiez que le nom du commerçant et le total final sont tous deux visibles. Une impression thermique effacée ou un reflet peut masquer un chiffre qu’aucun logiciel ne saura retrouver dans la photo.

Ajoutez des fichiers JPEG, PNG, WebP ou AVIF, jusqu’à 20 par lot et 20 Mo par fichier. Chaque image devient un document. Une facture de deux pages demande de l’attention : cet outil ne réunit pas les pages en une seule facture, et les ajouter comme deux documents indépendants pourrait compter le même montant deux fois. Utilisez la page contenant les renseignements d’identification et le montant final, puis joignez vous-même l’autre page au moment de l’envoi.

Une photo de plusieurs reçus ou d’une collection de modèles de reçus n’est pas divisée automatiquement. Utilisez une photo ou un recadrage distinct pour chaque document. Le texte de plusieurs reçus dans une seule image peut produire une suggestion mêlée qui ne correspond à aucun d’entre eux.

Le modèle OCR fourni lit le texte anglais imprimé. L’écriture manuscrite et les autres systèmes d’écriture ne sont pas pris en charge par ce modèle. Si votre téléphone produit des fichiers HEIC, exportez des copies JPEG ou convertissez-les avec [HEIC en JPG](https://abox.tools/fr/convertir-heic-en-jpg/) avant de les ajouter.

## Comparer les suggestions avec la photo

Lancez l’OCR, puis examinez la photo, les champs suggérés et le texte reconnu brut de chaque document. Tournez une photo de côté et relisez-la. Ajustez le recadrage pour contenir un document entier et relisez-le si nécessaire. Pour l’OCR, l’outil agrandit les petits recadrages jusqu’à trois fois et ajoute une fine bordure blanche, en limitant cette copie de travail à 2 400 pixels sur son côté le plus long. Une copie de travail plus grande peut aider le moteur, mais elle ne peut pas retrouver des détails perdus dans le flou. L’image originale et la pièce jointe ne sont pas agrandies pour l’OCR.

Une première lecture peu fiable ou l’absence de montant ou de date peut déclencher une deuxième lecture avec un réglage local du contraste pour mieux distinguer l’impression du papier. Ouvrez Texte lu sur cette photo pour comparer les deux lectures avec l’image. Des désaccords non résolus sur les montants, dates, références ou devises peuvent laisser des champs vides à vérifier. Une devise imprimée est préférée à une déduction d’après l’adresse ; une date reconnue du reçu ou de la facture est préférée à celle d’un justificatif de paiement par carte ajouté à la suite. Corrigez le texte modifiable avant de l’utiliser pour remplir les champs ou saisissez directement les champs. La deuxième lecture est présentée séparément pour comparaison, et aucune des deux ne garantit qu’un chiffre flou ou effacé est correct.

L’absence du nom du magasin ou une devise en dollars ou en yens non résolue peut aussi déclencher une lecture plus attentive de l’en-tête du magasin. Son texte apparaît sous les lectures du corps pour comparaison et ne sert qu’à suggérer le nom du magasin et la devise d’après son adresse. Vérifiez aussi ces suggestions sur la photo.

Vérifiez ces cinq champs avant de confirmer un document :

- **Commerçant.** L’entreprise ou le fournisseur nommé sur le document. Un logo stylisé peut être illisible pour le modèle de texte anglais ; saisissez vous-même le nom si le champ reste vide.
- **Date.** La date telle qu’imprimée. Une facture peut indiquer une date d’émission et une échéance ; une date numérique telle que 03/04 peut être ambiguë. Vous devez vérifier et sélectionner la date de conversion dans son champ séparé.
- **Référence.** Le numéro du reçu ou de la facture, s’il est imprimé. Un numéro de carte ou de téléphone n’est pas une référence de document. Le champ peut rester vide si aucun candidat n’est fiable.
- **Devise.** Choisissez un code de devise courant tel que USD, CAD ou EUR, ou choisissez Autre / code personnalisé et saisissez un autre code de trois lettres. Une devise imprimée associée au total final est prioritaire. Le symbole de la livre suggère GBP ; un symbole dollar seul ne distingue pas USD, CAD, AUD ou une autre devise en dollars. Un pays clairement identifié, ou un code postal et une région distinctifs dans l’adresse du magasin lui-même, peuvent fournir une suggestion de repli, avec la ligne d’adresse imprimée affichée pour comparaison. Une ville seule ou une adresse de client, de livraison ou de banque ne suffit pas. Vérifiez chaque suggestion sur le reçu ; une devise est requise avant la confirmation.
- **Total.** Le montant final du document. L’analyseur évite les libellés de remise et de montant remis, mais l’OCR peut les manquer. Vérifiez que la suggestion n’a pas choisi un sous-total, une remise, une taxe, une somme remise en espèces, la monnaie rendue ou un solde impayé.

Corrigez directement un champ lorsqu’il est faux. L’OCR économise la saisie ; il peut quand même confondre un 3 avec un 8 ou perdre un séparateur décimal. Confirmer enregistre le fait que vous avez vérifié le document. Cela ne prouve pas l’exactitude des calculs de la facture, et l’outil n’en extrait pas les articles. Les montants acceptent deux décimales au maximum.

## Garder le document entier dans le recadrage

L’outil suggère un recadrage lorsqu’il trouve des bords de document fiables. Un long reçu remplissant l’image peut être débarrassé de l’arrière-plan sur les côtés tout en conservant toute sa hauteur, afin qu’une date sous le code-barres reste visible. Sur un long reçu coloré, une couleur de papier identique au-delà d’un bord détecté peut conserver cette extrémité entière, protégeant un en-tête ou une dernière ligne tout en gardant un peu d’arrière-plan. Si les bords sont incertains, l’image entière est conservée. Comparez le recadrage avec la photo originale et ajustez-le pour retirer l’arrière-plan en gardant tous les bords du document et tout son texte. Une suggestion de recadrage peut être erronée, notamment sur un reçu sombre, une surface à motifs ou une photo comportant plusieurs feuilles.

La pièce jointe est une nouvelle copie JPEG, de 1 600 pixels au maximum sur son côté le plus long, sans agrandir un petit recadrage. La compression vise environ 350 Ko par image ; la taille réelle est affichée parce que cette cible n’est pas garantie. Examinez l’aperçu préparé et assurez-vous que les petits caractères et le total restent lisibles. Votre photo originale reste inchangée et n’est pas jointe au courriel.

Confirmez le document après avoir vérifié ses champs et son recadrage. Changer un champ, le recadrage ou la rotation efface cette confirmation pour qu’une image modifiée ne parte pas discrètement avec une ancienne vérification.

## Choisir la devise du courriel et le taux de chaque document

La devise finale du courriel est par défaut celle du plus grand nombre de documents. En cas d’égalité, c’est la première rencontrée. Une devise finale choisie manuellement reste sélectionnée ; Utiliser la devise par défaut rétablit le choix automatique.

Conservez la devise imprimée sur le document comme devise d’origine. Choisissez une seule devise finale pour le courriel, avec un code courant ou Autre / code personnalisé. La même devise finale apparaît sur chaque document ; la changer met à jour le lot et efface les taux et les vérifications faits pour la devise précédente.

Saisissez un taux manuel pour chaque document dans le sens indiqué, par exemple « 1 CAD = 0.70 USD ». Les documents déjà dans la devise finale utilisent le taux 1. La date est facultative pour un taux manuel. Pour un taux en ligne, vérifiez la date du reçu dans le champ Date de conversion, choisissez Rechercher un taux de référence historique et appuyez sur Obtenir le taux historique. Une date imprimée telle que 03/04 est ambiguë : la recherche utilise donc la date explicite que vous avez sélectionnée. Même une date imprimée non ambiguë telle que 24/09/2018 reste telle qu’imprimée ; sélectionnez vous-même le 24 septembre 2018 dans le champ Date de conversion.

La recherche facultative utilise les [taux de référence Frankfurter](https://frankfurter.dev/). Seuls la paire de devises et la date sélectionnée sont envoyés à api.frankfurter.dev ; aucune image, aucun montant, nom de fichier, texte OCR ou adresse de courriel. Le service peut voir votre requête et votre adresse IP. Vérifiez la date d’observation réellement retournée, qui peut précéder celle du reçu lorsqu’aucun taux n’a été publié. Les taux de référence peuvent différer de ceux de votre banque ou de votre carte. Si la paire ou la date n’est pas disponible, saisissez un taux manuellement. Aucun taux actuel ne remplace silencieusement un taux historique manquant.

Vérifiez le montant d’origine, le taux et le montant converti avant de confirmer. Le courriel et le CSV conservent ces renseignements pour relier le total à chaque document. Changer une devise ou une date exige un nouveau taux et une nouvelle vérification.

## Comprendre le nombre de documents et les totaux

Le rapport présente les champs et le montant de chaque document, le nombre de documents et le nombre de documents vérifiés ou restant à vérifier. Seuls les montants vérifiés entrent dans les totaux des devises d’origine et dans le total général converti. Choisissez une seule devise finale pour le courriel de tout le lot ; chaque document affiche cette même devise. Le montant converti de chaque document est arrondi à deux décimales avant l’addition, de sorte que le total général corresponde aux montants individuels imprimés dans le courriel.

Comparez le nombre de documents avec votre pile d’originaux. Une photo manquante omet une dépense et un doublon la compte deux fois. Il n’y a pas de détection automatique des doublons. Retirez ce que vous ne voulez pas compter et enregistrez ou copiez le rapport avant de fermer l’onglet : le lot reste en mémoire, sans historique de documents enregistré. Pendant la vérification, les rapports copiés et les fichiers CSV peuvent contenir des lignes incomplètes signalées comme à vérifier. Le téléchargement du courriel et des pièces jointes n’est disponible que lorsque tous les documents restants sont vérifiés et que leur copie JPEG est prête.

## Envoyer le rapport avec ses images compressées

L’objet suggéré inclut le nombre de documents, puis ajoute le total général dans la devise finale une fois tous les documents vérifiés. Modifiez l’objet avec votre propre formulation ; vos modifications sont conservées lorsque le lot change.

Utilisez Courriel avec images après avoir vérifié chaque document. Si votre navigateur prend en charge le partage de fichiers, le menu de partage de l’appareil s’ouvre avec les copies JPEG préparées et le rapport. Choisissez-y votre application de messagerie. Le rapport inclut le montant de chaque document, le nombre de documents et les totaux des devises d’origine, plus un total général converti. Vérifiez l’objet, le destinataire, le corps du message et chaque pièce jointe dans l’application de messagerie, puis envoyez vous-même le message.

Les menus de partage et les applications de messagerie diffèrent. Une application peut accepter les images sans le rapport, et la page ne peut pas y choisir de destinataire. Copiez le rapport dans le message si nécessaire. La page ne peut pas envoyer le message ni savoir si l’application l’a finalement livré.

## Télécharger un courriel ou joindre les copies vous-même

Télécharger le courriel crée un message `.eml` contenant le rapport complet et chaque pièce jointe JPEG préparée. Le destinataire facultatif saisi sur la page s’applique à ce fichier. Lorsque le partage de fichiers du navigateur n’est pas disponible, le bouton de courriel télécharge ce même fichier. Ouvrez-le dans votre application de messagerie et vérifiez la présence de chaque pièce jointe avant l’envoi.

Certaines applications ouvrent le fichier comme un brouillon ; d’autres le présentent comme un message reçu qu’il faut transférer ou renvoyer. Aucune fonction du navigateur ne garantit une fenêtre de rédaction avec les pièces jointes dans toutes les applications de messagerie. Si votre application ne peut pas utiliser ce fichier, téléchargez le ZIP, extrayez-le et joignez ses copies JPEG et son CSV à un nouveau message. Copiez le rapport dans le corps du message. Conservez les photos originales séparément si le destinataire peut avoir besoin plus tard des documents en pleine résolution.

## Où vont les renseignements

La lecture et les modifications se font dans ce navigateur. Le moteur OCR et les données anglaises sont fournis avec la page, et aucune photo ni aucun champ extrait n’est envoyé pour l’OCR. La conversion manuelle reste locale. Les taux historiques en ligne constituent l’étape réseau facultative décrite ci-dessus. Attendez que la ligne Hors ligne de la page indique prêt avant de vous déconnecter ; l’outil mis en cache peut alors lire les photos, créer le rapport, préparer les copies JPEG et enregistrer un CSV, un courriel ou un ZIP sans connexion.

Le courriel et le partage sont une étape suivante volontaire. Ces boutons transmettent le rapport ou les fichiers à l’application que vous choisissez, et celle-ci contrôle leur livraison ultérieure. Une application de messagerie peut garder un brouillon hors ligne et l’envoyer une fois connectée. Vérifiez son destinataire et ses pièces jointes comme pour tout autre message contenant des reçus ou des factures.
