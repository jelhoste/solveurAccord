# Journal des changements

Versionnage : `APP_VERSION` suit le semver (MAJEUR.MINEUR.CORRECTIF) ; `SCHEMA_VERSION` est le numéro entier du format des
fichiers d'export et des liens de partage (voir FORMAT.md).

## 1.3.2 - 2026-11-01 (format de fichier : 2, inchangé)
- Cordes les plus fines : le mi aigu retrouve son épaisseur d'avant (0,6) et le si est aligné dessus, donc les deux cordes fines ont la même
  épaisseur. Les quatre cordes graves gardent leur réduction de 30 %.

## 1.3.1 - 2026-11-01 (format de fichier : 2, inchangé)
- Épaisseurs réalistes des cordes réduites de 30 % (mêmes proportions entre les six cordes).
- Grille des diagrammes de guitare élargie de 10 % (écart entre cordes de 11 à 12,1).

## 1.3.0 - 2026-11-01 (format de fichier : 2, inchangé)
- Cadenas : un appui long (clic long, toucher long, ou Entrée / Espace maintenus) verrouille l'interface une fois les bons diagrammes
  choisis (accords, grilles types, import, niveau, capo et choix de variantes bloqués ; onglets, zoom, export et partage restent disponibles).
- Zoom des diagrammes (75 % à 300 %), mémorisé ; paramètre d'adresse `zoom=1.5`.
- Numéro de case des diagrammes de guitare agrandi de 25 %.
- Menus d'appui long du navigateur désactivés sur les zones interactives (champs de saisie exceptés).
- Textes de la page passés au vouvoiement.

## 1.2.0 - 2026-11-01 (format de fichier : 2, inchangé)
- Les cordes de guitare sont affichées avec des épaisseurs réalistes par défaut. Le menu « Cordes » permet de revenir aux cordes uniformes ;
  un choix déjà fait sur un appareil est respecté. Paramètre d'adresse : `strings=0` (uniformes) ou `strings=1` (réalistes).

## 1.1.0 - 2026-11-01 (format de fichier : 2, inchangé)
- Les fichiers d'export notent l'origine de chaque choix de doigté (guitare) et de renversement (piano) : `origine` = `manuel` ou `auto`.
  À l'import, les choix `manuel` sont repris tels quels et restent manuels ; les anciens fichiers (sans ce champ) se lisent comme avant.
- Les liens de partage étiquettent aussi leurs choix `manuel`.

## 1.0.0 - 2026-11-01 (format de fichier : 2)
Première version numérotée.
- Grille d'accords avec sélecteur (fondamentale / type / basse), grilles types, navigation entre accords.
- Onglets Guitare (doigtés chords-db 0.5.1 + power chords générés, choix d'enchaînement par Viterbi, suggestion de capo,
  option d'épaisseur des cordes) et Piano (renversements, basse à la main gauche).
- Regroupement des mesures identiques consécutives.
- Export / import de fichier, partage par lien (e-mail, Gmail, copie), thème personnalisable (theme.css, paramètres d'adresse).
- Format de fichier 2 : numéro de format, version de l'appli, forme normalisée des accords (`structure`), migrations.
  Les fichiers et liens du format 1 (sans numéro de format) restent lisibles.
