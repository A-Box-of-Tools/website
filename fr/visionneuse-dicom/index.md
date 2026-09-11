# Visionneuse DICOM — ouvrir un examen .dcm dans le navigateur

Scanner, IRM, radio et échographie, avec le fenêtrage, l'en-tête et les mesures.

> Ouvrez des examens de scanner, d'IRM, de radiologie et d'échographie dans votre navigateur. Fenêtrage, parcours d'une série entière, mesures en millimètres, lecture de chaque étiquette DICOM et liste exacte de ce qui, dans le fichier, identifie le patient. Rien n'est envoyé.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/visionneuse-dicom/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos examens. Il n'y a pas de serveur.

L'examen est ouvert et décodé par votre propre navigateur : l'en-tête, les pixels, le fenêtrage, les mesures. Il n'y a au bout de cette page aucun serveur à qui envoyer des données de santé, quand bien même quelque chose ici le voudrait, et rien du fichier n'est rapporté à personne : ni le nom du patient, ni l'examen, ni le nom du fichier.

- ✗ Aucun envoi
- ✗ Aucun compte
- ✓ Fonctionne hors ligne
- ✓ Code ouvert
- ✓ Vos fichiers restent sur votre appareil

## Comment ouvrir un fichier DICOM

1. **Choisissez les fichiers.** Un seul fichier `.dcm`, ou le dossier entier du disque : un scanner ou une IRM, c'est un fichier par coupe, et les déposer tous d'un coup est ce qui remet la série en place. Le navigateur les lit directement sur votre disque ; rien n'est envoyé nulle part pendant ce temps.
2. **Choisissez la série.** Un examen en contient généralement plusieurs : le scout, puis chaque acquisition. Chacune est empilée dans l'ordre où la machine l'a prise, déduit de la position de chaque coupe dans le patient plutôt que de la numérotation, qui ne va pas toujours dans le même sens.
3. **Réglez le fenêtrage.** C'est la commande qui rend un examen lisible, et celle qu'un logiciel de retouche n'a pas. Faites glisser sur l'image pour élargir la fenêtre et vers le haut ou le bas pour déplacer son centre, ou prenez l'une des fenêtres nommées — poumon, os, cerveau, parties molles — sur un scanner, où les unités sont les mêmes sur toutes les machines du monde.
4. **Parcourez la pile.** Le curseur sous l'image avance dans les coupes, et les flèches du clavier font la même chose une fois que vous avez cliqué sur l'image. Un fichier multi-image — une boucle d'échographie, une angiographie — se lit avec le bouton d'à côté.
5. **Mesurez quelque chose.** Passez sur Mesurer et tracez une ligne. Là où le fichier indique l'écartement de ses pixels, la réponse est en millimètres et tient compte des pixels non carrés ; là où il ne l'indique pas, la réponse est en pixels et le dit, plutôt que d'inventer une échelle.
6. **Lisez l'en-tête.** Chaque élément du fichier, avec son numéro, le nom que lui donne la norme et son contenu, le tout consultable. Au-dessus, la liste de ce qui, dans ce fichier précis, identifie le patient : bien davantage que le nom.
7. **Emportez ce dont vous avez besoin.** L'image à l'écran en PNG, avec le fenêtrage que vous avez réglé et sans rien d'incrusté dessus, ou l'en-tête entier en texte brut. Les deux sont construits dans la page à partir de ce qui s'y trouve déjà.

## La version longue

[Comment ouvrir un fichier DICOM, et ce qu'il y a dedans](https://abox.tools/fr/guides/ouvrir-un-fichier-dicom/): Ce que contient un disque hospitalier, pourquoi les fichiers n'ont pas d'extension, comment ouvrir un examen .dcm dans un navigateur, ce que fait vraiment le fenêtrage, et ce qu'un examen transporte sur le patient en plus de l'image.

## Aussi dans la boîte

- [Image en ICO](https://abox.tools/fr/creer-un-favicon/): Une image en entrée. Toutes les tailles qu'un navigateur, Windows ou un Mac réclame, en sortie.
- [Image en data URI](https://abox.tools/fr/image-en-base64/): L'image entière en une ligne de texte. À coller directement dans du CSS ou du HTML.
- [SVG en image](https://abox.tools/fr/convertir-svg-en-png/): Vous donnez la taille. Un vectoriel n'en a aucune à perdre.
- [Image en SVG](https://abox.tools/fr/convertir-image-en-svg/): Une forme, un contour. Pointez ce qui ne devrait pas y être.

## Questions

### Mon examen est-il envoyé quelque part ?

Non. Le fichier est lu, décodé et dessiné par votre propre navigateur, sur votre propre matériel. Cet outil n'a pas de partie serveur, et la `Content-Security-Policy` de la page nomme chaque adresse qu'elle peut contacter, dont aucune ne nous appartient. Débranchez-vous du réseau : elle continue d'ouvrir des examens. \
\
Cela vaut ici plus que sur toute autre page du site. Un fichier DICOM porte dans son en-tête le nom du patient, sa date de naissance et son numéro de dossier ; envoyer un tel fichier à une visionneuse revient donc à remettre à un inconnu un dossier médical, pas une image.

### Quels fichiers DICOM peut-elle ouvrir ?

Les fichiers non compressés dans les trois syntaxes de transfert de base — implicit et explicit little endian, ainsi que la big-endian retirée — plus deflated, RLE Lossless, JPEG baseline et JPEG Lossless, avec lequel est compressée la majorité des examens de scanner et d'IRM d'un disque hospitalier. \
\
Elle ne sait décoder ni JPEG 2000, ni JPEG-LS, ni les syntaxes MPEG et HEVC employées pour la vidéo. Celles-ci exigent des codecs qui pèsent plusieurs mégaoctets de bibliothèque compilée, et une page qui en téléchargerait un à la demande ne serait pas une page qui fonctionne hors ligne. Un fichier dans l'une d'elles s'ouvre quand même : l'en-tête est lu et affiché en entier, et l'image est remplacée par une ligne qui nomme le codec, plutôt que par une icône d'image cassée qui ne vous apprend rien.

### Qu'est-ce que le « fenêtrage », et pourquoi en ai-je besoin ?

Une coupe de scanner contient environ quatre mille valeurs distinctes et votre écran affiche deux cent cinquante-six gris. La fenêtre est le choix de la tranche de cette plage qui les reçoit tous : tout ce qui est en dessous est noir, tout ce qui est au-dessus est blanc, et ce qui se trouve entre les deux se répartit sur les gris. \
\
C'est pourquoi le même fichier ressemble à deux examens différents sous deux réglages, et pourquoi le poumon et l'os ne peuvent pas être vus en même temps. Sur un scanner, les nombres sont des unités Hounsfield, définies de façon absolue — l'eau vaut 0 et l'air −1000 —, si bien que les fenêtres nommées de cette page portent les nombres mêmes qu'emploie un radiologue sur sa console. Sur une IRM ou une échographie, une telle échelle n'existe pas, et la fenêtre d'ouverture est celle que demande le fichier lui-même.

### Pourquoi indique-t-elle que ma mesure est en pixels ?

Parce que ce fichier n'indique pas la taille d'un pixel. C'est Pixel Spacing (0028,0030) qui la porte, en millimètres, et quantité d'images d'échographie, de documents numérisés et de captures secondaires ne l'ont tout simplement pas. \
\
Là où il est présent, la mesure est en millimètres et chaque axe est mesuré avec son propre écartement, ce qui compte sur les images dont les pixels ne sont pas carrés. Là où il est absent, la réponse honnête est un décompte de pixels, et c'est celle qui s'affiche, plutôt que de choisir une échelle et de présenter le résultat comme une longueur.

### Elle a ouvert mon dossier en plusieurs séries. Pourquoi ?

Parce que c'est ce qu'il contient. Un examen est fait de séries — le scout, puis chaque acquisition ou reconstruction — et chaque fichier indique à laquelle il appartient dans Series Instance UID (0020,000E). La liste déroulante est construite à partir de cela et non du dossier, qui les mélange le plus souvent dans une seule liste de noms. \
\
À l'intérieur d'une série, les coupes sont ordonnées par leur position dans le patient, déduite d'Image Position et d'Image Orientation. Instance Number serait la clé évidente et n'est ici que le recours : elle est attribuée par ce qui a écrit les fichiers et n'a pas à suivre le sens dans lequel le patient est allongé.

### Que signifie la liste « ce qui identifie le patient » ?

C'est chaque champ de votre fichier qui nomme la personne concernée, ou qui réduit le cercle de qui elle peut être, lu depuis ce fichier sur votre machine. La liste vient de PS3.15 de la norme DICOM, la partie qui énonce ce qui doit disparaître avant qu'un jeu de données puisse être dit dé-identifié. \
\
Elle est là parce que ce que les gens sous-estiment n'est pas qu'un examen contienne un nom. C'est tout ce qu'il contient en plus : la date de naissance, le numéro de demande, le médecin prescripteur, l'établissement, le numéro de série de la machine et les UID de l'examen, qui sont des clés parfaites vers l'archive dont il provient. Un examen dont on a seulement effacé le nom n'est pas anonyme. \
\
Cet outil se contente de vous les montrer. Il n'écrit rien et ne modifie rien, il ne peut donc rien en retirer.

### Peut-elle anonymiser un examen ?

Non, et elle ne fait délibérément pas semblant. Cette page lit ; elle n'a aucun code qui écrive un fichier DICOM. Ce qu'elle fait, c'est vous dire exactement ce que contient le vôtre, et c'est la partie difficile à découvrir et celle sur laquelle on se trompe. \
\
Un outil qui retire les identifiants est un autre travail, avec une barre bien plus haute : il doit réécrire le fichier sans toucher aux pixels, remplacer les UID de façon cohérente sur un examen entier, et voir juste sur les éléments privés dans lesquels certaines machines cachent une seconde copie du nom. Il est à la feuille de route de ce site, plutôt que greffé sur une visionneuse.

### Peut-elle ouvrir un fichier sans extension .dcm, ou un fichier abîmé ?

Les deux, oui. L'extension n'est pas regardée : ce qui est vérifié, c'est le fichier lui-même. Un jeu de données écrit sans le préambule habituel de 128 octets — ce à quoi ressemble un examen tiré directement du réseau — est lu en déduisant son encodage de son premier élément, et la page dit que c'est ce qu'elle a fait. \
\
Un fichier qui s'arrête en cours de route est lu jusqu'où il va. Tout ce qui précède la coupure est affiché, avec une note indiquant à quel octet cela s'est arrêté. C'est précisément le cas où l'on veut le plus une visionneuse, et jeter le fichier entier pour ses douze derniers octets serait le mauvais comportement.

### Est-ce une visionneuse de diagnostic ?

Non. Ce n'est pas un dispositif médical, elle n'a fait l'objet d'aucune évaluation réglementaire, et rien ici ne devrait servir à prendre une décision clinique. Votre écran n'est pas calibré, le navigateur n'est pas une chaîne de rendu validée, et ni l'un ni l'autre ne se corrige depuis l'intérieur d'une page web. \
\
Ce à quoi elle sert, c'est à tout le reste pour quoi on ouvre un examen : vérifier ce qu'il y a sur un disque, extraire une coupe pour un cours ou un article, lire un en-tête, comprendre pourquoi un autre logiciel refuse le fichier, et voir ce qu'un examen transporte sur la personne concernée.

### Modifie-t-elle mon fichier ?

Non. Cet outil ne fait que lire. Il n'y a pas de fichier de sortie, pas de réencodage et aucun bouton qui écrive un DICOM : ce que vous pouvez télécharger, c'est un PNG de l'image à l'écran et une copie en texte brut de l'en-tête. Votre original reste intact sur votre disque.

### Est-ce gratuit, et faut-il un compte ?

C'est gratuit, et il n'y a ni compte, ni connexion, ni période d'essai. Il n'y a pas non plus de limite de taille de fichier ni de nombre de fichiers ouverts, hormis la mémoire de votre propre machine. Le site porte de la publicité, et c'est elle qui le paie ; on ne donne rien aux annonces sur votre fichier.

### Fonctionne-t-elle hors ligne ?

Oui. Chargez la page une fois, débranchez-vous ensuite d'internet : elle continue de fonctionner. C'est aussi la façon la plus simple de prouver que rien n'est envoyé : un outil qui expédierait votre examen ailleurs pour l'afficher s'arrêterait à l'instant où vous tirez la prise.

## Comment cette promesse se vérifie

- **Votre examen n'a nulle part où aller.** La Content-Security-Policy nomme chaque adresse que cette page peut contacter, et aucune ne nous appartient. Il n'y a ici aucun point de collecte où votre fichier pourrait atterrir, ni de code qui l'enverrait s'il y en avait un. On lisait autrefois ici `connect-src 'none'`, ce qui était absolu ; la publicité a coûté cela, et le dire fait partie du marché.
- **Ici, cela compte davantage que sur les autres pages.** Un fichier DICOM n'est pas une image avec quelques métadonnées dessus. C'est un dossier médical avec une image dedans : le nom du patient, sa date de naissance, son numéro de dossier, le numéro de demande, le médecin prescripteur, l'établissement et le numéro de série de la machine sont autant de champs de l'en-tête, et ils voyagent avec le fichier partout où il va. Envoyer un tel fichier à un site web pour le regarder revient à remettre tout cela à qui exploite ce site. C'est précisément ce que cette page existe pour ne pas faire.
- **Le lecteur, ce sont quatorze fichiers de ce dépôt.** Rien ici n'utilise une bibliothèque récupérée ailleurs. `src/dicom.js` parcourt le fichier, `src/dictionary.js` sait comment s'appellent les étiquettes, `src/pixels.js` retransforme les octets en mesures, `src/rle.js` et `src/jpeg-lossless.js` décompressent les deux formes compressées que cette page sait décoder, et `src/window.js` projette le mesuré sur les gris de votre écran.
- **Les identifiants vous sont énumérés, à vous et à personne d'autre.** La page affiche chaque champ de votre fichier qui nomme la personne concernée ou qui réduit le cercle de qui elle peut être, parce que c'est la question à laquelle quelqu'un sur le point de partager une coupe a besoin d'une réponse et qu'aucune visionneuse ne la donne. Cela apparaît sur l'écran devant vous et ne va nulle part ailleurs : il n'existe dans ce dépôt aucun événement de mesure qui transporte quoi que ce soit de cela, et la page ne pourrait pas l'envoyer même s'il en existait un.
- **Elle lit. Elle n'écrit pas.** Il n'y a ici aucun bouton qui modifie votre fichier, ni de code qui le pourrait. Ce que vous pouvez emporter, c'est un PNG de l'image à l'écran et une copie texte de l'en-tête, construits tous deux dans la page à partir de ce qui s'y trouve déjà. Votre original reste intact sur votre disque, ce qui est aussi la réponse honnête à la question de ce qui se passe si vous fermez l'onglet.
- **Ce que Google charge, et ce qu'on ne lui donne pas.** Les scripts de publicité et de mesure viennent de Google. Ni l'un ni l'autre ne reçoit quoi que ce soit sur votre fichier : ni les pixels, ni une vignette, ni un nom, ni une étiquette, ni un patient, ni un nom de fichier. Chaque ligne qui analyse, décode ou dessine un examen est servie depuis cette origine et figure dans le dépôt.
- **Ce que charge le bouton de don, et ce qu'on ne lui donne pas.** Le bouton « Buy me a coffee » de l'en-tête est dessiné par un script de cdnjs.buymeacoffee.com et va chercher sa police chez Google Fonts. C'est un lien et rien de plus : il ne signale aucune visite, et on ne lui donne rien sur vous ni sur vos fichiers. Rien ne se produit tant que vous ne cliquez pas, et ce vers quoi vous cliquez alors est le site de quelqu'un d'autre.
- **Elle fonctionne hors ligne.** Débranchez-vous du réseau et chaque partie de cette page continue de fonctionner. C'est la preuve la plus simple de toutes : un outil qui enverrait votre examen ailleurs pour l'afficher s'arrêterait à l'instant où vous tirez la prise.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, `src/dicom.js` pour l'analyseur qui parcourt le fichier, `src/pixels.js` pour le décodage des pixels, `src/jpeg-lossless.js` pour le codec qu'emploient la plupart des exports hospitaliers, et `src/window.js` pour le fenêtrage. Aucun d'eux n'a une ligne qui puisse atteindre le réseau.
