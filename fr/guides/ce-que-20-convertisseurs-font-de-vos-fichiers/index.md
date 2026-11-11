# Ce que 20 convertisseurs en ligne font de votre fichier

Nous avons confié la même image de 542 Ko à vingt convertisseurs gratuits et mesuré les tailles des corps de requête quittant le navigateur. Dix-neuf l’ont envoyée à un serveur, treize avant le moindre clic. Tous les résultats recherchés ensuite restaient accessibles à une adresse publique.

Dernière mise à jour 13 octobre 2026

## La réponse courte

Le 17 septembre 2026, nous avons confié le même fichier à vingt convertisseurs gratuits et enregistré les tailles des corps de requête avec les mécanismes décrits ci-dessous. **Dix-neuf sur vingt l’ont envoyé.** Un ne l’a pas fait.

Ce résultat était assez prévisible. Trois constats l’étaient moins : **treize des dix-neuf ont envoyé le fichier dès sa sélection**, avant le clic sur Convertir et avant toute possibilité de changer d’avis ; **chaque fichier terminé recherché ensuite restait accessible à une simple adresse web**, sans cookie, connexion ou session ; et **deux services plaçaient le nom du fichier dans cette adresse**.

Cela ne prouve aucun comportement malveillant. La plupart fonctionnent ainsi depuis toujours, leurs politiques de conservation sont généralement courtes et précises, et garder un fichier deux heures à une adresse inconnue n’est pas un scandale. Le constat est plus ordinaire et plus utile : l’écart entre “*ce site dit qu’il supprime mon fichier*” et “*je peux voir ce qui est arrivé à mon fichier*” est beaucoup plus grand qu’il n’y paraît, et se mesure en un après-midi.

## Utiliser la comparaison pour préparer votre contrôle

**Choisir un convertisseur de document.** Prenez la table datée comme invitation à tester la fonction exacte, pas comme classement actuel de sécurité. Créez un échantillon fictif du bon format, observez sélection et conversion et examinez le résultat. Tester un PNG ne prouve rien sur un PDF bancaire ou un autre outil du même domaine.

**Écrire une note de choix pour l'équipe.** Consignez URL, date, navigateur, actions, transfert observé et conditions de conservation. Gardez fichier d’essai synthétique et capture ci-dessous pour répétition. Distinguez un envoi observé d'une promesse et un test inachevé d'une réussite.

C'est utile après un changement de fonction. Répétez le même travail inoffensif et comparez les preuves ; ne réutilisez pas ces chiffres historiques comme une mesure nouvelle.

## Comment nous avons mesuré

La méthode est volontairement simple et reproductible : cette page porte sur les chiffres, plutôt que sur notre opinion.

### Le fichier

Un PNG de ⁦450 x 350⁩ pixels aléatoires, environ 542 Ko, nommé `abox-probe-9471.png`. Le bruit aléatoire se compresse difficilement. Une charge de taille proche est un indice, mais il faut inspecter le corps de requête pour établir ce qui a été envoyé. Le nom distinctif permettait de retrouver le fichier dans une URL ensuite.

### La mesure

Avant de fournir le fichier, nous avons instrumenté ces API de requête pour enregistrer la taille des données reçues, puis effectuer leur action normale : `fetch`, `XMLHttpRequest`, `navigator.sendBeacon`, `WebSocket.send` et, surtout, `HTMLFormElement.submit`. Le fichier a ensuite été placé dans le sélecteur de la page, puis nous avons attendu dix secondes et lu l’enregistrement.

L’interception du formulaire est essentielle. Plusieurs services envoient par un formulaire HTML plutôt que par script, ce qui échappe aux interceptions de `fetch` et `XMLHttpRequest` habituellement utilisées. PicResize affiche localement l’image depuis une adresse `blob:` pendant l’envoi, ressemblant ainsi à un outil local jusqu’à ce que l’on observe le formulaire sortant.

### Le contrôle après conversion

Chaque lien de résultat disponible a été récupéré depuis une simple ligne de commande : autre programme, sans cookie ni session, sans aucun état du navigateur. Un fichier accessible ainsi l’est pour toute personne ayant l’adresse.

Les vingt sites sont ceux que nous avons pu piloter, pas les vingt plus grands. Neuf autres essais n’ont pas pu être mesurés ; ils figurent plus bas, car résister à l’automatisation ne signifie pas réussir le test.

## Le tableau

Les tailles ci-dessous sont les mesures de corps de requête rapportées le 17 septembre 2026 ; les valeurs manquantes le restent. La dernière colonne conserve les résumés de politiques rapportés ce jour-là. Les liens pointent vers des pages de référence actuelles, vérifiées le 12 octobre 2026, pas vers des preuves archivées de la rédaction antérieure.

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

## Les observations et leurs limites

Le tableau publié est disponible en [JSON avec provenance et limites](https://abox.tools/data/converter-observations-2026-09-17.json) et en [lignes CSV](https://abox.tools/data/converter-observations-2026-09-17.csv). Ces fichiers transcrivent l’article ; ce n’est pas un nouveau test. Le tableau compte treize envois à la sélection, corrigeant les onze précédemment annoncés dans le texte.

Les requêtes originales, la version du navigateur, le fichier aléatoire exact et les copies historiques des politiques n’ont pas été conservés avec l’article. Les chiffres restent donc des observations rapportées, pas des données brutes vérifiables indépendamment. Les mécanismes ne couvrent pas tous les transferts : navigation de formulaires, autres cadres, workers et WebRTC demandent une inspection séparée. Un zéro signifie que ce test n’a enregistré aucun envoi, pas qu’aucun transfert n’est possible.

Pour refaire la comparaison, créez un nouveau fichier synthétique, notez ses octets exacts et son SHA-256, puis utilisez un nouveau profil de navigateur. Conservez une capture réseau avec les corps de requête et les navigations préservées ; inspectez sélection et conversion séparément. Notez version du navigateur, URL, heure, action, destination, taille du corps et présence du fichier de test dans celui-ci. Retirez identifiants et liens privés de résultats avant de partager. Conservez texte de politique, URL et date, et consignez les tests inachevés à part.

Une URL de fichier qui répond sans session établit l’accès pour qui possède cette URL au moment du contrôle. Vérifiez à nouveau après le délai annoncé avant d’affirmer que la suppression a échoué. Ni ce contrôle ni une capture réseau n’établit ce qui reste dans les journaux ou sauvegardes internes.

## Treize envoient avant le moindre clic

Nous ne nous attendions pas à un résultat aussi déséquilibré. Dans treize des dix-neuf cas, le fichier partait déjà vers un serveur alors que la page affichait encore un bouton Convertir non utilisé.

Chez iLoveIMG, la page affichait *Compresser les IMAGES*, en attente du démarrage, alors que 542 816 octets étaient déjà partis vers `api9.iloveimg.com`. Même comportement chez iLovePDF, PDF24, PDF Candy, Sejda, TinyPNG, jpg2pdf et les quatre sites de la plateforme décrite plus bas.

La raison technique est valable : envoyer pendant la lecture des options rend la conversion presque immédiate après confirmation. Cela améliore la rapidité, mais retire discrètement une étape supposée acquise. Choisir un fichier ressemble à l’ouvrir ; cliquer sur Convertir, à l’envoyer. Sur treize de ces vingt sites, ces deux moments n’en font qu’un, le premier.

Conséquence précise : sur ces treize sites, remarquer le mauvais fichier — brouillon non expurgé, fiche de paie, photo à recadrer — n’est possible qu’après son départ.

## Le résultat reste à une adresse publique

Quatre sites fournissent un lien ordinaire vers le résultat. Nous avons récupéré les quatre depuis la ligne de commande, sans cookies ni session, dans un programme indépendant du navigateur. Tous ont rendu le fichier.

- **Ezgif** — `s1.ezgif.com/tmp/…` a rendu 542 483 octets : notre fichier test, à l’octet près.
- **Aconvert** — `s6.aconvert.com/convert/…` a rendu un PDF de 474 856 octets.
- **ResizePixel** — `resizepixel.com/Image/…` a rendu 432 111 octets.
- **IMGonline** — `srv2.imgonline.com.ua/result_img/…` a rendu un JPEG de 128 179 octets.

Les adresses testées contenaient des éléments difficiles à deviner. Toute personne les connaissant pouvait récupérer le résultat au moment du contrôle. Un lien peut circuler par historique, capture d’écran, message ou référent lorsque la politique de la page le permet. HTTPS cache le chemin à un intermédiaire réseau ordinaire ; la politique de référent détermine ce qu’un autre site reçoit ensuite. L’observation porte sur ces quatre liens, pas sur toutes les méthodes de téléchargement d’un convertisseur.

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

Le nombre d’heures ne dit pas tout. **Un lien public qui renvoie encore le fichier après le délai annoncé peut révéler une suppression manquée.** Un lien expiré ne prouve pas que toutes les copies internes ont disparu. Vous ne voyez pas si la suppression a atteint les sauvegardes, journaux, rapports d’erreur contenant le corps de requête ou le réseau qui a mis le résultat en cache. Le devenir de ces copies après un rachat ou une intrusion reste invisible. Une politique énonce des intentions sur des systèmes que vous ne pouvez inspecter ; les promesses honnêtes et malhonnêtes peuvent employer les mêmes mots.

Voilà l’intérêt d’un outil incapable d’envoyer le fichier : cela ne signifie pas que les entreprises mentent, mais qu’avec aucun envoi, il n’y a rien à promettre ni à croire sur parole.

## Celui qui n’a rien envoyé

Squoosh, le compresseur de Google, a reçu, affiché et comprimé le fichier, et **ce test n’a enregistré aucun envoi du fichier**. Zéro octet d’envoi rapporté, avec la même mesure qui avait enregistré 542 566 octets quittant TinyPNG une minute auparavant.

C’est le témoin de l’expérience : la mesure peut être négative, donc les dix-neuf résultats positifs ne viennent pas d’une méthode qui trouve toujours quelque chose. Il prouve aussi que le même travail et les mêmes formats fonctionnent dans un navigateur sans serveur, contrairement à l’idée qu’une conversion exige un envoi.

Elle ne l’exige pas. Ces outils envoient surtout parce qu’ils ont été créés quand c’était nécessaire, et parce que comptes, quotas et abonnements vivent sur les serveurs. Un outil local se mesure difficilement pour la facturation.

## Ce que nous n’avons pas pu mesurer

Neuf autres sites ont été essayés : FreeConvert, Smallpdf, Zamzar, Optimizilla, Photopea, media.io, Bulk Resize Photos, png2jpg.com et SimpleImageResizer.

Dans huit cas, notre méthode est la cause : leur commande exige un vrai clic et refuse un fichier placé par script. Rien n’a été envoyé, donc rien n’était mesurable. **Cela ne constitue pas un résultat** — et ne prouve surtout pas qu’ils gardent le fichier local. Le test n’a pas eu lieu.

SimpleImageResizer est un échec intéressant, car il révèle un piège de la méthode. Son formulaire contient un fichier mais déclare `enctype="application/x-www-form-urlencoded"`, combinaison qui fait envoyer au navigateur *seulement le nom du fichier*, pas ses octets. Une mesure naïve — la nôtre au début — additionne le contenu du formulaire et annonce 1 085 210 octets qui ne sont jamais partis. Nous avons retiré la ligne. Pour reproduire le travail, vérifiez `enctype` avant de croire un formulaire.

## Vérifiez vous-même

Les enregistrements originaux ne sont pas disponibles : le tableau historique ne peut donc pas être vérifié à partir des requêtes brutes. La méthode ci-dessus permet une nouvelle comparaison. La version rapide ne demande aucun outil particulier :

- **Débranchez.** Chargez l’outil, coupez le Wi-Fi puis utilisez-le. Le travail local continue ; le travail distant s’arrête. Aucun texte publicitaire ne peut répondre à ce test.
- **Regardez l’onglet Réseau.** Ouvrez les outils de développement, choisissez Réseau, triez par taille et utilisez le convertisseur. Inspectez les charges des requêtes, pas seulement la colonne de taille transférée, qui décrit souvent les réponses. Une miniature, un envoi par morceaux ou un fichier encodé peut avoir une autre taille. Regardez *avant* et après le clic sur Convertir.
- **Lisez la `connect-src`.** Dans le code de la page, la `Content-Security-Policy` liste les adresses autorisées. Votre navigateur l’applique quelles que soient les tentatives du code. Une adresse appartenant au site permet d’y envoyer votre fichier.

Les trois contrôles détaillés, et l’intérêt d’un quatrième, figurent dans [est-il sûr d’envoyer des fichiers aux convertisseurs en ligne ?](https://abox.tools/fr/guides/est-il-sur-d-envoyer-ses-fichiers/)

## Comment ce site répond à la même question

Le code de ce site est une preuve distincte des mesures historiques ci-dessus. L’implémentation actuelle fait les affirmations suivantes ; vérifiez la fonction voulue avec les [quatre contrôles](https://abox.tools/fr/guides/est-il-sur-d-envoyer-ses-fichiers/).

- **Hors ligne.** Le traitement local fonctionne avec ressources chargées et cache prêt. Images web, taux en ligne et présentation des navigateurs nécessitent leurs connexions.
- **Requêtes.** Le code de traitement n’envoie pas les fichiers choisis. Vues de pages et réponses fixes facultatives sont distinctes. Les taux transmettent devises et date ; les fonctions entre pairs envoient volontairement du contenu au navigateur choisi. **Politique.** La plupart héritent des destinations de plateforme. Les reçus ajoutent Frankfurter ; partage et caméra ajoutent le rendez-vous. La politique limite des destinations, sans prouver chaque donnée.
- **Conservation.** abox.tools ne reçoit pas les fichiers pour traitement ; cette opération ne crée donc pas de copie serveur à supprimer. Les données locales, journaux de rendez-vous de sept jours et copies gardées par les destinataires de partage ou messagerie sont des chemins distincts décrits dans Confidentialité.
- **Code.** Le [code est public](https://github.com/A-Box-of-Tools/website). Compilez et comparez le résultat, composants partagés et moteurs inclus compris.

La [page de confidentialité](https://abox.tools/fr/confidentialite/) décrit les limites : [imports par URL](https://abox.tools/fr/images-en-video/), [taux facultatifs et remise aux applications](https://abox.tools/fr/extraire-recus-factures/), [partage entre navigateurs](https://abox.tools/fr/partager-du-texte/) et [caméra distante](https://abox.tools/fr/remote-camera/), ainsi que publicité, Analytics et avis fixes. Transférer volontairement est distinct d’envoyer pour traitement.

Exemples locaux : [compresser vers une taille cible](https://abox.tools/fr/compresser-une-image/), [recadrer une vidéo](https://abox.tools/fr/recadrer-une-video/), [supprimer EXIF et GPS](https://abox.tools/fr/supprimer-les-donnees-exif/) et [créer un PDF à partir d’images](https://abox.tools/fr/images-en-pdf/). Vérifiez formats et résultat. Ces tâches n’exigent ni envoi pour traitement ni compte.

## Utiliser ces chiffres

Vous pouvez citer et reproduire les mesures. Pour un article, les faits utiles sont : vingt convertisseurs gratuits mesurés le 17 septembre 2026 ; dix-neuf ont envoyé le fichier ; treize l’ont fait avant le bouton Convertir ; les quatre résultats testés étaient accessibles à une adresse publique sans session.

Un lien vers cette page est apprécié, sans obligation. Si une reproduction donne un autre résultat — les sites évoluent et ceci photographie un après-midi — signalez-le. La [page de contact](https://abox.tools/fr/contact/) permet de nous joindre ; une correction accompagnée d’un nombre d’octets sera publiée ici.
