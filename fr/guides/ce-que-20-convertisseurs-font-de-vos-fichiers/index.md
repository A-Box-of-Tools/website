# Ce que 20 convertisseurs en ligne font de votre fichier

Nous avons confié la même image de 542 Ko à vingt convertisseurs gratuits en ligne et mesuré chaque octet quittant le navigateur. Dix-neuf l’ont envoyé à un serveur. Onze l’ont fait avant que nous appuyions sur un seul bouton, et tous les fichiers de résultat recherchés ensuite étaient encore accessibles à une adresse publique.

Dernière mise à jour 17 septembre 2026

## La réponse courte

Le 17 septembre 2026, nous avons donné le même fichier à vingt convertisseurs gratuits en ligne et mesuré chaque octet quittant le navigateur. **Dix-neuf l’ont envoyé.** Un ne l’a pas fait.

Ce résultat était assez prévisible. Trois constats l’étaient moins : **onze des dix-neuf ont envoyé le fichier dès sa sélection**, avant le clic sur Convertir et avant toute possibilité de changer d’avis ; **chaque fichier terminé recherché ensuite restait accessible à une simple adresse web**, sans cookie, connexion ou session ; et **deux services plaçaient le nom du fichier dans cette adresse**.

Cela ne prouve aucun comportement malveillant. La plupart fonctionnent ainsi depuis toujours, leurs politiques de conservation sont généralement courtes et précises, et garder un fichier deux heures à une adresse inconnue n’est pas un scandale. Le constat est plus ordinaire et plus utile : l’écart entre “*ce site dit qu’il supprime mon fichier*” et “*je peux voir ce qui est arrivé à mon fichier*” est beaucoup plus grand qu’il n’y paraît, et se mesure en un après-midi.

## Comment nous avons mesuré

La méthode est volontairement simple et reproductible : cette page porte sur les chiffres, plutôt que sur notre opinion.

### Le fichier

Un PNG de 450 × 350 rempli de pixels aléatoires, environ 542 Ko, nommé `abox-probe-9471.png`. Le bruit aléatoire ne se compresse pas : sa taille reste stable et révèle clairement une requête qui le transporte. Le nom distinctif permet de le retrouver dans une URL, ce qui s’est avéré utile.

### La mesure

Avant de fournir le fichier, chaque moyen d’envoi de données du navigateur a été remplacé par une version qui enregistre la taille reçue puis effectue l’opération normale : `fetch`, `XMLHttpRequest`, `navigator.sendBeacon`, `WebSocket.send`, et — point essentiel — `HTMLFormElement.submit`. Le fichier a ensuite été placé dans le champ de la page, qui est restée inactive dix secondes, puis l’enregistrement a été lu.

L’interception du formulaire est essentielle. Plusieurs services envoient par un formulaire HTML plutôt que par script, ce qui échappe aux interceptions de `fetch` et `XMLHttpRequest` habituellement utilisées. PicResize affiche localement l’image depuis une adresse `blob:` pendant l’envoi, ressemblant ainsi à un outil local jusqu’à ce que l’on observe le formulaire sortant.

### Le contrôle après conversion

Chaque lien de résultat disponible a été récupéré depuis une simple ligne de commande : autre programme, sans cookie ni session, sans aucun état du navigateur. Un fichier accessible ainsi l’est pour toute personne ayant l’adresse.

Les vingt sites sont ceux que nous avons pu piloter, pas les vingt plus grands. Neuf autres essais n’ont pas pu être mesurés ; ils figurent plus bas, car résister à l’automatisation ne signifie pas réussir le test.

## Le tableau

Chaque nombre d’octets ci-dessous a été mesuré sur le réseau le 17 septembre 2026. La dernière colonne résume la politique publiée par le site ce jour-là.

| Convertisseur | Le fichier est-il parti ? | Octets mesurés | Destination | Conservation annoncée |
| --- | --- | --- | --- | --- |
| Squoosh | Non | 0 | — | rien à conserver |
| TinyPNG | Oui, dès la sélection | 542,566 | `tinypng.com/backend/opt/store` | 48 heures |
| iLoveIMG | Oui, dès la sélection | 542,816 | `api9.iloveimg.com/v1/upload` | 2 heures |
| iLovePDF | Oui, dès la sélection | 542,801 | `api4.ilovepdf.com/v1/upload` | 2 heures |
| Sejda | Oui, dès la sélection | 542,537 | `sejda.com/api/files/upload` | après traitement ; liens partagés 7 jours |
| PDF24 | Oui, dès la sélection | 542,531 | `filetools24.pdf24.org/client.php` | “généralement” 1 heure |
| PDF Candy | Oui, dès la sélection | 542,522 | `s35.api.pdfcandy.com/uploadcbc/…` | 2 heures |
| jpg2pdf.com | Oui, dès la sélection | 542,570 | `jpg2pdf.com/api/upload` | 1 heure, dans les conditions |
| Img2Go | Oui, dès la sélection | 542,589 | `www21.img2go.com/v2/dl/web7/…` | 72 heures |
| Online-Convert | Oui, dès la sélection | 542,423 | `www8.online-convert.com/v2/dl/web7/…` | 72 heures |
| PDF2Go | Oui, dès la sélection | 542,542 | `www15.pdf2go.com/v2/dl/web7/…` | 72 heures |
| Compress2Go | Oui, dès la sélection | 542,492 | `www6.compress2go.com/v2/dl/web7/…` | 72 heures |
| PicResize | Oui, dès la sélection | 542,568 | `picresize.com/en/edit`, formulaire POST | 20 minutes |
| ResizePixel | Oui, dès la sélection | formulaire POST | `resizepixel.com/` | sous 1 heure |
| CloudConvert | Oui, à la conversion | 543,218 | `eu-central.storage.cloudconvert.com/…` | 24 heures |
| Convertio | Oui, à la conversion | non capturé | `convertio.co/process/…` | 24 heures |
| Ezgif | Oui, à la conversion | 542,483 | `ezgif.com/optimize`, formulaire POST | 1 heure après la dernière utilisation |
| Aconvert | Oui, à la conversion | formulaire POST | `aconvert.com/results.php` | 2 heures |
| Online2PDF | Oui, à la conversion | 547,330 | `online2pdf.com/conversion/frame` | “immédiatement” |
| IMGonline | Oui, à la conversion | 542,633 | `imgonline.com.ua/eng/…-result.php` | aucune politique trouvée |

Vingt convertisseurs, un fichier de 542 Ko, 17 septembre 2026. “Dès la sélection” signifie que l’envoi commence au choix du fichier ; “à la conversion”, après le bouton. Convertio a changé de page avant la lecture du compteur : sa taille est indiquée non capturée, sans estimation.

## Onze envoient avant le moindre clic

Nous ne nous attendions pas à un résultat aussi déséquilibré. Dans onze des dix-neuf cas, le fichier partait déjà vers un serveur alors que la page affichait encore un bouton Convertir non utilisé.

Chez iLoveIMG, la page affichait *Compresser les IMAGES*, en attente du démarrage, alors que 542 816 octets étaient déjà partis vers `api9.iloveimg.com`. Même comportement chez iLovePDF, PDF24, PDF Candy, Sejda, TinyPNG, jpg2pdf et les quatre sites de la plateforme décrite plus bas.

La raison technique est valable : envoyer pendant la lecture des options rend la conversion presque immédiate après confirmation. Cela améliore la rapidité, mais retire discrètement une étape supposée acquise. Choisir un fichier ressemble à l’ouvrir ; cliquer sur Convertir, à l’envoyer. Sur onze de ces vingt sites, ces deux moments n’en font qu’un, le premier.

Conséquence précise : sur ces onze sites, remarquer le mauvais fichier — brouillon non expurgé, fiche de paie, photo à recadrer — n’est possible qu’après son départ.

## Le résultat reste à une adresse publique

Quatre sites fournissent un lien ordinaire vers le résultat. Nous avons récupéré les quatre depuis la ligne de commande, sans cookies ni session, dans un programme indépendant du navigateur. Tous ont rendu le fichier.

- **Ezgif** — `s1.ezgif.com/tmp/…` a rendu 542 483 octets : notre fichier test, à l’octet près.
- **Aconvert** — `s6.aconvert.com/convert/…` a rendu un PDF de 474 856 octets.
- **ResizePixel** — `resizepixel.com/Image/…` a rendu 432 111 octets.
- **IMGonline** — `srv2.imgonline.com.ua/result_img/…` a rendu un JPEG de 128 179 octets.

C’est une pratique web ordinaire, pas une intrusion : les adresses comportent une longue partie aléatoire impossible à deviner en pratique. Mais précisons ce qui protège le fichier : ni mot de passe, ni compte. **C’est le secret de l’URL** — et une URL est peu secrète sur le Web. Elle passe dans l’historique, les captures de la barre d’adresse, un en-tête `Referer` vers la page suivante, les éventuels proxys et les messages où l’on partage le lien plutôt que le fichier.

Aconvert avertit sur sa page de résultat que les fichiers ne restent pas plus de deux heures et qu’il ne faut pas créer de liens depuis d’autres sites. C’est le bon avertissement, au bon endroit et au bon moment. C’est aussi le seul des quatre à le donner.

## Le nom du fichier voyage aussi

On pense au contenu d’un fichier. Le convertisseur reçoit davantage ; deux de ces vingt services rendent ce supplément visible.

PDF Candy a envoyé le nôtre à une adresse finissant par `/uploadcbc/1789652849416-abox-probe-9471.png` — horodatage puis nom original dans l’URL. ResizePixel a servi l’aperçu depuis `/Image/<id>/Preview/abox-probe-9471.png`, de même.

Notre fichier s’appelait `abox-probe-9471.png` et ne révélait rien. Les vrais fichiers s’appellent `passport-scan.jpg`, `contract-signed-final.pdf`, `scan-12wk.png`. Le nom est souvent la métadonnée la plus descriptive ; l’adresse est la partie d’une requête la plus longtemps enregistrée, mise en cache et conservée, souvent par plus d’acteurs que le fichier lui-même.

Cela vaut aussi pour les données jamais affichées. Une photo de téléphone contient généralement les coordonnées, l’heure, le numéro de série et parfois une miniature telle qu’elle était *avant* le recadrage. Quelle que soit la conversion, le service reçoit tout cela.

## Quatre noms, une plateforme

Img2Go, Online-Convert, PDF2Go et Compress2Go paraissent indépendants. Le fichier est allé vers quatre hôtes différents — `www21.img2go.com`, `www8.online-convert.com`, `www15.pdf2go.com` et `www6.compress2go.com` — mais chaque fois au même chemin :

```
/v2/dl/web7/upload-file/<uuid>
```

Même point d’entrée, comportement, politique et conservation de 72 heures. Ce sont quatre portes d’une seule plateforme, comme l’expliquent leurs politiques.

Ce n’est pas une critique : plusieurs marques sur un même système sont ordinaires et efficaces. Mais remplacer un convertisseur peu rassurant par un autre peut ne rien changer. “Je prendrai un autre site” n’est une précaution que s’il est réellement différent.

Un détail similaire : CloudConvert a envoyé le fichier vers `eu-central.storage.cloudconvert.com`. Le nom indique la région de stockage, une information plus précise que celles de la plupart des vingt sites.

## Les politiques et leur valeur

Les durées annoncées sont généralement courtes, précises et meilleures que la réputation de ce secteur : suppression immédiate chez Online2PDF, vingt minutes chez PicResize, deux heures chez iLovePDF, iLoveIMG, PDF Candy et Aconvert, jusqu’à 72 heures pour la plateforme de quatre sites.

Deux sites méritent d’être cités pour la raison inverse. **jpg2pdf.com** n’a pas de politique de confidentialité à l’adresse habituelle : le seul lien juridique est `/terms`, où la promesse d’une heure figure dans un document “Conditions et confidentialité”. Bonne promesse, emplacement étrange. Pour **IMGonline** nous n’avons trouvé aucune politique : ni lien en page d’accueil anglaise, ni document aux adresses habituelles, ni indication de stockage ou suppression dans l’outil. Ses résultats restent accessibles à toute personne ayant le lien.

Le nombre d’heures n’est pourtant pas le point essentiel du tableau. **Aucune de ces promesses ne peut être réfutée depuis votre position.** Vous ne voyez ni la suppression, ni son application aux sauvegardes, journaux, rapports d’erreur contenant la requête ou réseaux de diffusion ayant mis le résultat en cache. Vous ne voyez pas leur devenir lors d’un rachat ou d’une intrusion. La politique décrit l’intention d’inconnus sur une machine inaccessible ; les politiques honnêtes et malhonnêtes peuvent employer les mêmes mots.

Voilà l’intérêt d’un outil incapable d’envoyer le fichier : cela ne signifie pas que les entreprises mentent, mais qu’avec aucun envoi, il n’y a rien à promettre ni à croire sur parole.

## Celui qui n’a rien envoyé

Squoosh, le compresseur Google, a reçu, affiché et comprimé le fichier sans **aucune requête réseau**. Pas une requête réduite ou hachée : zéro octet, selon la méthode qui avait détecté les 542 566 octets de TinyPNG une minute avant.

C’est le témoin de l’expérience : la mesure peut être négative, donc les dix-neuf résultats positifs ne viennent pas d’une méthode qui trouve toujours quelque chose. Il prouve aussi que le même travail et les mêmes formats fonctionnent dans un navigateur sans serveur, contrairement à l’idée qu’une conversion exige un envoi.

Elle ne l’exige pas. Ces outils envoient surtout parce qu’ils ont été créés quand c’était nécessaire, et parce que comptes, quotas et abonnements vivent sur les serveurs. Un outil local se mesure difficilement pour la facturation.

## Ce que nous n’avons pas pu mesurer

Neuf autres sites ont été essayés : FreeConvert, Smallpdf, Zamzar, Optimizilla, Photopea, media.io, Bulk Resize Photos, png2jpg.com et SimpleImageResizer.

Dans huit cas, notre méthode est la cause : leur commande exige un vrai clic et refuse un fichier placé par script. Rien n’a été envoyé, donc rien n’était mesurable. **Cela ne constitue pas un résultat** — et ne prouve surtout pas qu’ils gardent le fichier local. Le test n’a pas eu lieu.

SimpleImageResizer est un échec intéressant, car il révèle un piège de la méthode. Son formulaire contient un fichier mais déclare `enctype="application/x-www-form-urlencoded"`, combinaison qui fait envoyer au navigateur *seulement le nom du fichier*, pas ses octets. Une mesure naïve — la nôtre au début — additionne le contenu du formulaire et annonce 1 085 210 octets qui ne sont jamais partis. Nous avons retiré la ligne. Pour reproduire le travail, vérifiez `enctype` avant de croire un formulaire.

## Vérifiez vous-même

La méthode est publiée pour que chacun puisse reconstruire le tableau et contester nos résultats. Le test le plus rapide ne demande aucun outil :

- **Débranchez.** Chargez l’outil, coupez le Wi-Fi puis utilisez-le. Le travail local continue ; le travail distant s’arrête. Aucun texte publicitaire ne peut répondre à ce test.
- **Observez l’onglet Réseau.** Ouvrez les outils de développement, choisissez Réseau, triez par taille et utilisez l’outil. Si une photo de 4 Mo est partie, une requête de 4 Mo apparaît en haut. Regardez *avant* le clic sur Convertir aussi bien qu’après — c’est tout le constat expliqué plus haut.
- **Lisez la `connect-src`.** Dans le code de la page, la `Content-Security-Policy` liste les adresses autorisées. Votre navigateur l’applique quelles que soient les tentatives du code. Une adresse appartenant au site permet d’y envoyer votre fichier.

Les trois contrôles détaillés, et l’intérêt d’un quatrième, figurent dans [est-il sûr d’envoyer des fichiers aux convertisseurs en ligne ?](https://abox.tools/fr/guides/est-il-sur-d-envoyer-ses-fichiers/)

## Comment ce site répond à la même question

Après avoir mesuré vingt sites, il serait étrange de nous dispenser du même test. Voici les mêmes colonnes :

- **Octets envoyés : zéro.** Chaque outil travaille dans votre navigateur. Aucune requête ne transporte fichier, miniature, nom, taille ou contenu extrait.
- **Destination : aucune.** Aucun serveur ne peut le recevoir. Le site ne contient que des fichiers statiques ; la `connect-src` de sa Content-Security-Policy nomme les services publicitaires et de mesure Google et le bouton de don, et **aucune adresse de cette liste n’appartient à ce site**.
- **Conservation : sans objet**, la seule réponse qui n’exige aucune promesse. Rien n’arrive, donc aucun délai de suppression à croire.
- **Vérifiable : oui.** Chaque ligne est [publique](https://github.com/A-Box-of-Tools/website), le build retire seulement commentaires et espaces superflus. Vous pouvez l’exécuter et comparer le résultat à la version servie.

Les exceptions sont explicites : publicités Google et compteur de visites contactent Google sans rien recevoir sur vos fichiers ; l’outil [Images en vidéo](https://abox.tools/fr/images-en-video/) peut récupérer une image depuis l’adresse collée, dont le serveur voit alors votre IP ; et [Partager du texte](https://abox.tools/fr/partager-du-texte/) ouvre une connexion pour présenter deux navigateurs, sans stockage ni transport de votre contenu. La [page Confidentialité](https://abox.tools/fr/confidentialite/) explique les trois en détail.

Si vous cherchiez un des vingt sites, nos équivalents sont un [compresseur d'images](https://abox.tools/fr/compresser-une-image/) qui atteint la taille demandée, [images en PDF](https://abox.tools/fr/images-en-pdf/), [fusionneur PDF](https://abox.tools/fr/fusionner-des-pdf/), un [compresseur de PDF](https://abox.tools/fr/compresser-un-pdf/), et un [lecteur et effaceur EXIF](https://abox.tools/fr/supprimer-les-donnees-exif/) pour les données cachées décrites plus haut. Gratuits, sans compte et sans destination où envoyer vos fichiers.

## Utiliser ces chiffres

Vous pouvez citer et reproduire les mesures. Pour un article, les faits utiles sont : vingt convertisseurs gratuits mesurés le 17 septembre 2026 ; dix-neuf ont envoyé le fichier ; onze l’ont fait avant le bouton Convertir ; les quatre résultats testés étaient accessibles à une adresse publique sans session.

Un lien vers cette page est apprécié, sans obligation. Si une reproduction donne un autre résultat — les sites évoluent et ceci photographie un après-midi — signalez-le. La [page de contact](https://abox.tools/fr/contact/) permet de nous joindre ; une correction accompagnée d’un nombre d’octets sera publiée ici.
