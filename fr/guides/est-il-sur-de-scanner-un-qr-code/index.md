# Est-il sûr de scanner un QR code ?

Le scan lui-même, oui. Un QR code est un morceau de texte, et pointer un appareil photo dessus ne fait rien d'autre que lire ce texte. Tout ce qui peut mal tourner arrive une pression plus tard, quand quelque chose ouvre ce qui a été lu — et cette pression-là, vous pouvez la retenir.

Dernière mise à jour 26 août 2026

## La réponse courte

Scanner est sans danger. Un QR code est un court morceau de texte dessiné en petits carrés, et pointer un appareil photo dessus fait exactement une chose : relire ce texte. Cette lecture ne peut rien installer, ne peut rien visiter et ne peut toucher à rien sur votre téléphone, pour la même raison que regarder une adresse écrite ne vous y transporte pas.

Le danger commence une étape plus tard, quand quelque chose *ouvre* ce qui a été lu — et toute l'astuce de chaque arnaque au QR code consiste à faire arriver cette étape avant que vous ayez vu où vous alliez. Le texte du code est une adresse que personne ne peut lire à l'œil nu, et la plupart des téléphones y répondent d'une seule pression empressée. Séparez la lecture de l'ouverture, et l'arnaque n'a plus rien sur quoi s'appuyer.

## Ce qu'est vraiment un QR code

Sous les carrés, il n'y a rien d'autre qu'une chaîne de caractères — quelques milliers tout au plus, généralement bien moins. Une adresse web, un nom de réseau Wi-Fi avec son mot de passe, une fiche de contact, une ligne de texte. Le format a été conçu en 1994 pour suivre des pièces automobiles dans une usine Toyota, et il ne contient aucune instruction d'aucune sorte. Un QR code ne peut pas plus « contenir un virus » qu'un panneau indicateur.

Ce qu'il peut contenir, c'est un texte qui *demande* quelque chose à votre téléphone : ouvrir cette adresse, rejoindre ce réseau, enregistrer ce contact. Chacune de ces choses est une demande, pas un ordre. Le code propose ; ce qui l'a scanné décide. Un lecteur qui vous montre le texte et attend est parfaitement sûr. Un lecteur qui agit de lui-même sur le texte a remis la décision à celui qui a imprimé le code — et c'est là toute la différence entre un scan sûr et un scan dangereux.

Une note de bas de page, par honnêteté : le programme qui décode peut avoir des bogues, comme tout programme qui analyse une entrée, et il y en a eu dans des lecteurs au fil des ans. Mais ce risque appartient au lecteur, pas au code, et ce n'est pas là-dessus que reposent les arnaques. Elles reposent sur la pression du doigt.

## L'astuce de l'autocollant

L'arnaque devenue assez courante pour mériter un nom — le quishing — est d'une simplicité presque gênante : imprimer son propre code, le coller par-dessus un vrai, attendre. Sur un horodateur, où le faux mène à une page de paiement qui ressemble à celle de la mairie. Sur une table de restaurant, par-dessus le menu. Sur un avis de passage dans la boîte aux lettres, à côté des mots « nous vous avons manqué ».

Remarquez ce qui la fait fonctionner. Ce n'est pas la sophistication technique — il n'y en a aucune. C'est qu'un QR code est la seule sorte d'adresse qu'une personne ne peut pas lire avant de la suivre. Une adresse web louche écrite en lettres se trahit à quiconque la regarde ; la même adresse dessinée en carrés ressemble exactement à une honnête. Le temps de voir où menait le code, vous y êtes déjà, sur une page construite pour ressembler à celle que vous attendiez, et qui demande votre numéro de carte.

La défense n'est pas d'arrêter de scanner. C'est de regarder l'adresse *entre* le scan et la visite, ce qui coûte environ deux secondes et met l'astuce complètement en échec.

## Trois façons dont une adresse ment

Deux secondes de regard suffisent, mais seulement si vous savez quoi regarder. Il y a trois formes d'apparence honnête que prend une adresse louche, et les trois valent d'être connues de vue.

### 1. Le nom avant le @

Une adresse web peut porter un nom d'utilisateur, écrit avant un signe `@` : tout ce qui précède le `@` est de la décoration, et la vraie destination commence après. `votrebanque.fr@evil.example` ne va pas à votre banque. Elle va à `evil.example`, en transportant « votrebanque.fr » comme identifiant sans aucun sens. L'œil lit le début d'une adresse ; le navigateur en lit la fin.

### 2. Des lettres qui ne sont pas celles qu'elles imitent

Les alphabets se recouvrent. Un `а` cyrillique se dessine exactement comme un `a` latin, et une adresse écrite avec l'un est une adresse différente qui paraît identique à l'écran. Le procédé a un nom — attaque par homographes — et c'est pourquoi une destination peut être la copie lettre à lettre de celle en qui vous avez confiance, et se trouver quand même ailleurs.

### 3. La première étape honnête

L'adresse du code peut être authentiquement respectable — un raccourcisseur de liens, une redirection marketing, le suivi de clics d'un moteur de recherche — et se contenter de vous *renvoyer* vers un endroit qui ne l'est pas. La première adresse passe l'examen ; la destination est décidée par un serveur alors que vous êtes déjà en route. Une adresse raccourcie dans un code imprimé ne prouve rien de mal, mais elle signifie que l'adresse que vous pouvez vérifier n'est pas celle où vous arriverez.

## Comment en scanner un sans risque

La règle tient en une phrase : **lire d'abord, ouvrir ensuite, et ne jamais laisser un seul geste faire les deux.** En pratique :

- Utilisez un lecteur qui vous montre le texte décodé et s'arrête là. La plupart des appareils photo de téléphone affichent la destination dans un petit bandeau avant de l'ouvrir — lisez le bandeau au lieu de le toucher par réflexe, et lisez la *fin* de l'adresse, pas le début.
- Soyez le plus méfiant là où l'enjeu est le plus haut et la surface publique : tout ce qui se termine par un paiement, tout ce qui vit dehors. Le code d'un horodateur mérite plus de réflexion que celui d'un cartel de musée.
- Un code qui mène droit à une page de connexion ou de coordonnées bancaires est le moment de s'arrêter et de taper à la place l'adresse que vous connaissez déjà. La version légitime de cette page n'est jamais à plus de quelques touches de clavier.
- Les codes Wi-Fi et les fiches de contact méritent la même pause : l'un demande à votre téléphone de retenir un réseau, l'autre d'enregistrer une personne. Les deux s'acceptent très bien en connaissance de cause, et ni l'un ni l'autre ne devrait se produire en silence.

## Comment se comporte le lecteur d'ici

Ce site a un [lecteur de QR codes et de codes-barres](https://abox.tools/fr/lecteur-de-qr-code/), et il est bâti sur la règle que cette page vient de défendre : **il n'ouvre jamais rien.** Le texte décodé est affiché en entier, l'hôte que l'adresse atteindrait réellement est extrait sur sa propre ligne, et les trois déguisements ci-dessus sont vérifiés et nommés quand ils apparaissent. Ouvrir le lien est un bouton séparé, pressé après lecture — ou jamais.

La lecture elle-même se fait sur votre propre machine. L'image que vous scannez est décodée dans votre navigateur et n'est envoyée nulle part, si bien qu'un code qui vous inspire de la méfiance peut être examiné sans que personne — ce site compris — apprenne ce qu'il disait ; la page continue de fonctionner une fois le Wi-Fi coupé, ce qui est la façon la plus simple de vérifier cette affirmation. Et une charge ouvertement hostile, comme une adresse `javascript:` qui exécuterait du code chez celui qui l'ouvre, se voit refuser tout lien et est nommée pour ce qu'elle est.

L'autre moitié existe aussi : un [générateur de QR codes](https://abox.tools/fr/generateur-de-qr-code/) qui dessine les codes sur votre propre machine, et un guide compagnon sur la façon de [créer un code et prouver qu'il se scanne](https://abox.tools/fr/guides/creer-un-code-qr-et-prouver-qu-il-se-scanne/) avant de l'envoyer à l'impression. Et si derrière votre question se cachait la plus large — ce que confier quoi que ce soit à un site web fait réellement — celle-là a [sa propre page](https://abox.tools/fr/guides/est-il-sur-d-envoyer-ses-fichiers/).
