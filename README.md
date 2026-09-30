# Mon carnet de repas

Page statique prête pour GitHub Pages. Le fichier d'entrée est `index.html`.

La liste des repas est lue depuis une feuille Google Sheets publiée au format CSV. Les colonnes attendues sont `Nom`, `Emoji` et `Ingrédients`. Les ingrédients d'une cellule peuvent être séparés par des virgules ou des points-virgules. Pour modifier la liste partagée, éditez la feuille Google Sheets ; le bouton **Actualiser la liste** recharge son contenu. Le fichier `repas-de-depart.csv` contient les 40 repas initiaux à importer dans la feuille.

La feuille est publiée sur le Web pour permettre à la page GitHub Pages de la lire sans connexion Google. Son contenu est donc consultable publiquement. Si la feuille ne contient aucune recette, le carnet affiche une liste vide.

## Ajouter un repas

Le bouton **Ajouter un repas** ouvre un formulaire intégré à la page. Les données sont envoyées au script Google Apps défini dans `SHEET_WRITE_URL` des deux fichiers HTML. Le script de déploiement est fourni dans `apps-script/Code.gs`. Déployez-le comme application Web en l’exécutant en tant qu’utilisateur qui accède à l’application, avec accès réservé aux comptes Google. Le script n’ajoute une ligne que si l’adresse Google connectée est propriétaire ou éditrice de la feuille ; ajoutez donc les quatre utilisateurs autorisés comme éditeurs de la feuille. Après toute modification du script, ouvrez **Déployer → Gérer les déploiements**, modifiez le déploiement existant en sélectionnant une **Nouvelle version**, puis déployez. Ouvrir l’URL dans un onglet affiche la page `doGet` et permet de vérifier que le compte est autorisé ; l’ajout d’un repas continue d’utiliser `doPost`.

## Publier sur GitHub Pages

1. Créez un dépôt GitHub et ajoutez-y `index.html`, `manifest.webmanifest`, `sw.js` et `icon.svg` (ce README peut aussi être ajouté).
2. Dans le dépôt, ouvrez **Settings → Pages**.
3. Dans **Build and deployment**, choisissez **Deploy from a branch**, la branche `main` et le dossier `/ (root)`, puis enregistrez.
4. Une fois le déploiement terminé, ouvrez l'adresse Pages fournie par GitHub sur l'iPhone ou l'iPad.
5. Dans Safari, touchez **Partager → Sur l’écran d’accueil**.

Le site publié est accessible à toute personne disposant de son adresse. La feuille fournit la liste partagée entre les appareils ; une connexion Internet est nécessaire pour charger les dernières modifications. La dernière liste récupérée reste disponible hors ligne sur chaque appareil.
