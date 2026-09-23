# Comment convertir un SVG en PNG à la bonne taille

Convertir est la moitié facile. La question qui décide si le résultat sert à quelque chose est celle dont personne ne vous donne la réponse : combien de pixels ? Voici d'où vient ce nombre, et ce qu'un dessin perd en chemin.

[Ouvrir SVG en image](https://abox.tools/fr/convertir-svg-en-png/): Vous donnez la taille. Un vectoriel n'en a aucune à perdre.

Dernière mise à jour 26 août 2026

## La réponse courte

Ouvrez [SVG en image](https://abox.tools/fr/convertir-svg-en-png/), déposez-y le fichier, et nommez une taille. Si rien ne vous a dit quelle taille prendre, **1024 pixels sur le plus grand côté** est un bon défaut : assez grand pour presque tout et assez petit pour un courriel. Laissez le format sur PNG, laissez le fond sur transparent, et prenez le fichier.

Tout ce qui suit est pour les cas où ce défaut ne suffit pas : quand un chiffre vous a été imposé, quand cela part à l'impression, ou quand cela revient avec l'air faux.

![La carte d'aperçu : le dessin rendu à la taille demandée, avec ses dimensions en pixels en dessous.](https://abox.tools/screens/convert-an-svg-to-png/preview.webp)

L'outil le dessine avant de l'enregistrer, et à la taille à laquelle il sera enregistré. Ce qui ne va pas dans l'export se voit ici en premier.

## Pourquoi la taille est votre décision et non celle du fichier

Un JPEG est une grille de pixels mesurés ; demander sa taille a une réponse. Un SVG n'est pas une image du tout, c'est un jeu d'instructions, du genre « dessine un cercle ici, ce tracé dans cette couleur », et des instructions n'ont pas de taille. Un navigateur peut les exécuter à 16 pixels ou à 4000 et le résultat est aussi net dans les deux cas, parce qu'il ne met rien à l'échelle. Il redessine.

C'est pourquoi la conversion ne peut pas choisir un chiffre à votre place, et pourquoi en choisir un grand ne vous coûte rien. C'est le seul travail d'image où « fais-le plus grand » est gratuit.

La plupart des fichiers SVG portent bien un attribut `width` et `height`, et un outil vous le montrera, mais c'est un défaut et non une limite. Une icône qui dit `width="24"` dit seulement que la personne qui l'a dessinée avait en tête une barre d'outils de 24 pixels.

## D'où vient réellement le chiffre

**Pour un site web.** Prenez la taille que l'image occupe sur la page en pixels CSS et multipliez par la densité des écrans qui vous importent. Un logo dans un emplacement de 200 pixels de large a besoin d'un fichier de 400 pixels pour un portable Retina et de 600 pour un téléphone récent. C'est tout ce que veulent dire `@2x` et `@3x`, et c'est pourquoi un outil qui les écrit vous évite de faire le calcul trois fois.

**Pour une icône d'application, une fiche de boutique ou un favicon.** Le chiffre est publié et il n'y a rien à calculer : ce que dit la page de la boutique, exactement. Pour un favicon, ne rastérisez pas du tout ; [fabriquez un .ico](https://abox.tools/fr/guides/creer-son-favicon/), qui contient plusieurs tailles dans un fichier, parce qu'un onglet de navigateur, un signet et un raccourci Windows en réclament chacun une différente.

**Pour l'impression.** Multipliez la taille physique en pouces par la résolution de l'imprimante. Un logo qui va sur une carte de visite sur deux pouces de large à 300 DPI fait 600 pixels ; le même logo en travers d'une page A4, soit 8,3 pouces, en fait environ 2500. Les imprimeries demandent 300 DPI par principe, et pour une bannière grand format regardée du bout d'une pièce, 150 suffit largement.

**Pour un aperçu social ou une image OG.** La plateforme nomme un cadre, en général ⁦1200 × 630⁩ pour un aperçu de lien, et ce cadre n'a pas la forme de votre logo. C'est à cela que sert le réglage « compléter » : le dessin centré à ses propres proportions, avec une couleur de fond qui remplit le reste, plutôt qu'un logo étiré qui annonce à tout le monde que vous n'avez pas vérifié.

Quand deux de ces cas s'appliquent, prenez le plus grand. Un PNG plus grand que nécessaire est un téléchargement un peu plus lourd ; un PNG trop petit ne se rattrape pas ensuite, pour la raison exposée dans la section suivante.

![La carte de taille : un menu des façons de dire la taille, réglé sur la largeur, avec 1024 saisi et des largeurs prédéfinies à côté.](https://abox.tools/screens/convert-an-svg-to-png/size.webp)

Cinq façons de dire la même chose. Laquelle est la bonne dépend de si on vous a donné un chiffre ou un endroit où le mettre.

## On ne revient pas en arrière

La rastérisation est à sens unique. Une fois le dessin devenu un PNG, ce sont des pixels comme dans n'importe quelle autre image, et l'agrandir ensuite doit inventer un détail qui n'a jamais été mesuré, avec le même résultat mou et étalé qu'on obtient en agrandissant une photographie.

Gardez donc le SVG. C'est la copie maîtresse, c'est presque toujours le fichier le plus léger, et toutes les tailles futures en sortiront parfaitement. Le PNG est un export pour un usage particulier, et quand il vous faut une autre taille, le bon geste est de réexporter plutôt que de redimensionner ce que vous aviez exporté.

Il existe des logiciels qui prétendent reconvertir un PNG en SVG. Ce qu'ils font, c'est du tracé : deviner quelles courbes pourraient expliquer une grille de pixels. Cela marche passablement sur un dessin plat à deux couleurs et produit un galimatias coûteux sur tout le reste, et cela ne retrouve jamais ce que le dessin d'origine contenait.

## Trois choses changent à l'instant où cela devient des pixels

Un SVG rastérisé qui a l'air faux a presque toujours l'air faux pour l'une de ces trois raisons, et toutes les trois valent d'être connues avant l'export plutôt qu'après.

**Le texte est dessiné dans la police que possède la machine.** Un SVG qui contient du texte ne contient pas la police : il en nomme une et laisse le moteur de rendu la trouver. Si la police n'est pas installée, une police de remplacement est utilisée, et cette remplaçante a d'autres dessins de lettres et d'autres chasses : le texte peut donc se recomposer ou déborder. Un fichier qui tire sa police d'une adresse web s'en tire encore plus mal, puisqu'un SVG rastérisé à travers un `<img>` n'a pas le droit de récupérer quoi que ce soit ; rien n'arrive.

Le remède est celui que tout graphiste connaît déjà : **convertissez le texte en contours** avant d'exporter le SVG (Illustrator appelle cela Vectoriser, Figma dit Flatten, Inkscape dit Objet en chemin). Les lettres deviennent de la géométrie, la police cesse d'importer, et l'image a la même allure sur toutes les machines. Faites-le sur une copie, car un texte vectorisé n'est plus modifiable comme texte.

**Les filets virent au gris ou disparaissent.** Un trait qui revient à moins d'un pixel à la taille choisie ne peut pas être dessiné comme une ligne pleine : il est donc dessiné faiblement. C'est pourquoi un logo délicat rastérisé à 64 pixels a l'air délavé quand le même fichier à 512 est parfait. Si une petite taille est l'exigence, la réponse est un dessin simplifié aux traits plus épais plutôt qu'un autre réglage d'export : c'est la même raison qui fait qu'un favicon est un symbole et non un mot.

**L'animation s'arrête.** Un SVG animé se rastérise en une seule image fixe : la première, quelle qu'elle soit. Aucun réglage d'export n'y change rien. S'il vous faut le mouvement, il vous faut un GIF ou une vidéo, fabriqués autrement.

## La transparence, et quel format choisir

**PNG**, sauf raison particulière. Il est sans perte, il garde la transparence, et les aplats à bords francs, dont un dessin est essentiellement fait, s'y compressent bien. Un logo rastérisé est en général un PNG *plus léger* qu'il ne serait un JPEG, en plus d'être plus propre.

**Le JPEG** n'a aucune transparence. Chaque pixel transparent doit devenir une couleur, et si personne n'en choisit une pour vous, il devient noir : c'est de là que vient le résultat du logo dans un rectangle noir que l'on prend pour un bug. Il est en outre avec perte de la façon qui se voit le plus mal sur exactement ce genre d'image : un liseré de moucheture autour de chaque bord franc. Utilisez-le quand quelque chose l'exige.

**Le WebP** fait tout ce que fait le PNG, dans un fichier plus léger, et il est lu par tous les navigateurs actuels. La raison de ne pas s'en servir est ce qui vient après le navigateur : les logiciels plus anciens, certaines imprimeries et un bon nombre de formulaires d'envoi refusent toujours d'en ouvrir un.

Choisir une couleur de fond avec du PNG est aussi une chose parfaitement ordinaire à vouloir. La transparence n'est utile que lorsque ce sur quoi l'image atterrit est une couleur que vous ne pouvez pas prévoir ; quand vous savez déjà que c'est une page blanche, l'aplatir sur du blanc évite toute une catégorie de surprises.

## Quand l'export ressort vide ou faux

**Rien que du vide.** En général un attribut `xmlns` manquant sur l'élément racine. Un fichier sans lui n'est pas du SVG pour une balise image, et il se dessine comme rien. Ouvrir le fichier dans un navigateur est le test rapide : si le navigateur ne montre rien non plus, le problème est le fichier et non le convertisseur.

**Le dessin est petit, dans le coin en haut à gauche.** Le fichier a une `width` et une `height` mais pas de `viewBox` : il n'y a donc aucun système de coordonnées à mettre à l'échelle et le dessin garde ses unités d'origine sur un canvas plus grand. Un bon convertisseur ajoute un viewBox pour vous ; si le vôtre ne l'a pas fait, ajouter à la main `viewBox="0 0 *largeur* *hauteur*"` sur l'élément racine corrige la chose, et le fichier est du texte brut, donc vous le pouvez.

**Une partie de l'image manque.** Quelque chose dans le fichier pointait vers une adresse au lieu de contenir le dessin, qu'il s'agisse d'une photographie stockée comme lien, d'une feuille de style ou d'une police. Un rastériseur qui refuse d'aller les chercher fait ce qu'il faut, et c'est le même refus qui empêche un SVG téléchargé quelque part d'aller prévenir celui qui l'a fabriqué. Réexportez depuis le logiciel de dessin avec les images incorporées.

**Il refuse une très grande taille.** Les navigateurs plafonnent la taille d'un canvas, et ils ne s'accordent pas sur l'endroit : au-delà d'environ 16 000 pixels de côté rien ne revient, et Safari sur un iPhone ou un iPad abandonne bien plus tôt, vers ⁦4096 × 4096⁩. Un outil qui vous prévient vous épargne un fichier vide, parce que c'est ce que produit un navigateur à court de ressources plutôt qu'un message d'erreur.

## Rien de tout cela ne demande un envoi

Rastériser un SVG est une chose que tous les navigateurs font des milliers de fois par jour : c'est la machinerie même qui dessine une icône sur une page web. Il n'y a aucune raison technique pour que votre dessin voyage jusqu'à un serveur et en revienne sous forme de PNG, et l'outil d'ici ne l'envoie nulle part : la `Content-Security-Policy` de la page énumère toutes les adresses qu'elle peut contacter, et aucune n'appartient à ce site.

Cela compte plus que d'habitude avec le SVG, parce qu'un SVG est un document et non une image. Il peut contenir un script et une adresse distante, et un logo qu'une agence vous a envoyé est un fichier que vous n'avez pas écrit. Dessiné à travers une balise image, il est dans ce que la spécification appelle le *mode statique sécurisé* : le script ne peut pas s'exécuter et l'adresse n'est jamais contactée. C'est le navigateur qui l'applique, pas le site web.

Chargez la page, coupez votre connexion, et convertissez quelque chose quand même, si vous préférez vérifier plutôt qu'on vous le dise. [Est-il sûr d'envoyer ses fichiers à un convertisseur en ligne ?](https://abox.tools/fr/guides/est-il-sur-d-envoyer-ses-fichiers/) expose trois autres vérifications applicables à n'importe quel outil.
