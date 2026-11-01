# Journal des changements

Versionnage : `APP_VERSION` suit le semver (MAJEUR.MINEUR.CORRECTIF) ; `SCHEMA_VERSION` est le numéro entier du format des
fichiers d'export et des liens de partage (voir FORMAT.md).

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
