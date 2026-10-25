# Comment créer un code QR et prouver qu'il se scanne

L'erreur QR qui coûte cher n'est pas de faire le code — c'est de découvrir sur place que les affiches se scannent vers une faute de frappe. Générer et vérifier sont deux outils ici, et lancer le second avant le tirage coûte une minute et attrape presque tout ce que le tirage aurait expédié.

[Ouvrir Lecteur de QR codes et de codes-barres](https://abox.tools/fr/lecteur-de-qr-code/): Visez un code, ou déposez-en une photo. La lecture se fait ici, et nulle part ailleurs.

Dernière mise à jour 13 octobre 2026

## La réponse courte

1. **Créez-le.** Ouvrez le [Générateur de QR & codes-barres](https://abox.tools/fr/generateur-de-qr-code/), choisissez la tâche — un lien, un réseau Wi-Fi, une carte de contact — et vérifiez la chaîne exacte que le code contiendra, que la page montre au lieu de la cacher. Exportez le SVG pour l'impression, le PNG pour les écrans.
2. **Imprimez-en un.** À la vraie taille, sur le vrai papier, avant le tirage de deux cents.
3. **Prouvez-le.** Photographiez le tirage avec un téléphone, en biais et dans la lumière du lieu, puis déposez la photo dans le [Lecteur QR et codes-barres](https://abox.tools/fr/lecteur-de-qr-code/). Il affiche la charge décodée et l'hôte de l'adresse encodée. Si elle correspond, testez les téléphones prévus et vérifiez séparément la destination.

Les deux outils tournent dans votre navigateur sans rien envoyer ailleurs : pour un code Wi-Fi, leur traitement n'envoie pas le mot de passe pour créer ou décoder le code.

![Le générateur de QR avec une adresse saisie, montrant le code fini et ses caractéristiques : sa version, son niveau de correction d'erreurs et la place qu'il lui reste.](https://abox.tools/screens/make-a-qr-code-and-prove-it-scans/made.webp)

Le code, fabriqué.

## Vérifier la destination autant que le tirage

Pour menu, inscription ou manuel, collez l'URL HTTPS complète, gardez quatre modules de marge et placez le SVG dans le layout final. Imprimez à la taille prévue, montez sur la surface prévue et scannez depuis l'endroit du visiteur. Lisez l'adresse, ouvrez-la volontairement sur téléphone et réalisez l'action : menu, formulaire ou bon manuel. Une chaîne correcte peut mener à une page indisponible ou une connexion inattendue.

Les cartes de contact exigent un contrôle supplémentaire : enregistrez le contact sur téléphone et vérifiez nom, numéro et e-mail. Sur une planche d'étiquettes, photographiez chaque code séparément ; le lecteur en trouve un par image. Répétez après changement d'URL, couleurs, taille ou layout et essayez plusieurs téléphones avant un grand tirage.

## Ce que la vérification attrape vraiment

- **La faute de frappe.** L'échec le plus courant n'est pas le code — c'est l'URL dedans. Le relire est la seule vérification qui teste ce qui est réellement encodé plutôt que ce que vous pensiez coller.
- **La taille et la distance.** Un code scanné à travers une salle demande de plus gros modules qu'un code sur une carte de visite. Photographier le tirage d'essai depuis l'endroit où les gens se tiendront est le test honnête ; les niveaux de correction d'erreur du générateur disent tout haut ce que chacun coûte en densité.
- **Les couleurs.** Ce lecteur lit les codes inversés, sans prouver que tous les téléphones le feront. Partez de modules sombres sur fond clair et testez les vraies couleurs de marque après impression.
- **Le pli et le reflet.** La correction Reed–Solomon répare certaines données endommagées, mais le pourcentage n'est pas une surface garantie que l'on peut couvrir. Les motifs de détection doivent rester lisibles. Un poster exposé mérite le niveau supérieur et le code un peu plus dense qu'il entraîne.

![Le lecteur, à qui la même image a été donnée : il indique l'adresse contenue dans le code, la symbologie, et l'endroit de l'image où il l'a trouvé.](https://abox.tools/screens/make-a-qr-code-and-prove-it-scans/read.webp)

Et la même image relue par un autre outil, seul essai qui attrape un code mal sorti. Le lecteur montre ce qu'il a trouvé, et ne l'ouvre pas.

## Le même lecteur, pour les codes qui ne sont pas les vôtres

Vérifier est aussi la manière sûre d'ouvrir un QR imprimé par autrui. Le lecteur montre toute l'adresse encodée et son hôte *avant toute ouverture*, avec signes à examiner : nom avant @, alphabet ressemblant ou raccourcisseur connu. Il ne suit pas les redirections et ne découvre pas le destinataire final d'un lien court. Un autocollant de parcmètre mérite ce contrôle comme un badge de conférence. Rien ne s'ouvre pour vous et rien de scanné n'est envoyé.

## Si vous faites cela chaque semaine

Créer et vérifier vivent sur deux pages à dessein — chacune fait un travail, et chacune peut prouver seule que rien ne quitte votre machine. Mais les deux sont libres : licence MIT, des modules ES sans dépendances — l'encodeur du générateur et le décodeur Reed-Solomon du lecteur, chacun avec un README qui l'explique.

Si des codes partent chaque semaine de votre bureau, pointez un agent de code vers le [dépôt](https://github.com/A-Box-of-Tools/website) et demandez-lui une page qui génère et fait aussitôt repasser le code rendu par le décodeur — un autotest à chaque export. Les modules ont été écrits pour être lus, et les emporter est exactement ce à quoi sert la licence.
