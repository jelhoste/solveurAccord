# Format des fichiers d'export et des liens de partage

## Versions
| Quoi | Où | Rôle |
|---|---|---|
| `APP_VERSION` | `index.html` (et `VERSION` dans `sw.js`, identique) | Version de l'appli, semver. Sert aussi de nom de cache hors ligne. |
| `SCHEMA_VERSION` | `index.html` | Version du **format de fichier** (entier). +1 seulement pour un changement incompatible. |
| `CHORD_LIB_VERSION` | `index.html` | Version de la grammaire des symboles d'accords (noms -> racine / type / basse). |
| `DB_VERSION` | `index.html` | Origine des doigtés guitare (chords-db). Informatif. |

## Document (fichier `.json` ou charge utile d'un lien `#s=...`, en base64url)
```json
{
  "app": "diagrammes-accords",
  "schema": 2,
  "appVersion": "1.0.0",
  "dbVersion": "chords-db 0.5.1",
  "exportedAt": "2026-11-01T00:00:00.000Z",
  "chords": ["Am", "F/A"],
  "structure": [[9, "minor", null], [5, "major", 9]],
  "level": "full",
  "capo": 0,
  "tab": "g",
  "guitare": [{ "accord": "Am", "mesure": 1, "mesures": 1, "frettes": [-1,0,2,2,1,0], "doigts": "002310", "barre": null, "origine": "auto" }],
  "piano":   [{ "accord": "Am", "mesure": 1, "mesures": 1, "main_gauche": 57, "main_droite": [60,64,69], "origine": "auto" }]
}
```
- `chords` : symboles tels qu'écrits (lisibles par un humain).
- `structure` : **forme normalisée** `[racine 0-11 (do = 0), identifiant de type, basse 0-11 ou null]`. Elle ne dépend pas de la façon
  dont on écrit ou interprète un symbole. Les identifiants de type (`QUALITY_ID`) sont figés : on peut en ajouter, jamais en renommer.
- `guitare` / `piano` : solutions retenues. Une solution est repérée par sa position (`mesure`, à partir de 1) et **vérifiée par son
  contenu** (`frettes`, ou `main_droite` + `main_gauche`), jamais par un identifiant interne de candidat.
- `origine` (`"manuel"` ou `"auto"`, ajouté en 1.1.0, sans changement de `schema` car c'est un simple ajout) : indique si le choix vient de
  l'utilisateur ou du calcul automatique. À l'import, les choix `manuel` sont repris tels quels et restent manuels ; les autres sont
  seulement reproduits si le calcul automatique ne retombe pas dessus. Absent = comportement des fichiers plus anciens.
- Ne sont **pas** enregistrés, volontairement : le rang d'une variante (instable : il dépend du classement et de la base de doigtés)
  et la liste des variantes proposées (elle se recalcule et se figerait).
- `tab`, `appVersion`, `dbVersion`, `exportedAt` : facultatifs. Les liens de partage n'embarquent que les choix manuels.

## Règles de compatibilité
1. **Ancien fichier, appli récente** : toujours lu. Chaque changement incompatible s'accompagne d'une migration `MIGRATIONS[n]`
   (document n -> n+1), appliquée en chaîne. Un fichier sans `schema` est traité comme le format 1 (ancien champ `version`).
2. **Fichier récent, appli ancienne** : lecture au mieux (les champs inconnus sont ignorés) avec un avertissement si le format est plus récent.
3. **Accords** : la forme `structure` prime sur le symbole ; à défaut, le symbole est relu. Un accord illisible est ignoré et signalé.
4. **Solutions** : si une solution n'existe plus parmi les candidats actuels (base de doigtés ou règles modifiées), elle est recalculée
   automatiquement et l'utilisateur en est averti.
5. **Chaque accord de la grille est toujours signalé** si quelque chose ne peut pas être repris : rien n'est perdu silencieusement.

## Faire évoluer le format : mode d'emploi
- **Ajouter un type d'accord** : l'ajouter à `QMAP` et à `QUALITY_ID` avec un **nouvel** identifiant. Pas de changement de schéma.
- **Ajouter un alias d'écriture** (ex. `min` -> `m`) : l'ajouter à `QMAP`. Pas de changement de schéma.
- **Changer la grammaire des symboles** : incrémenter `CHORD_LIB_VERSION`. Les anciens fichiers restent lus grâce à `structure`.
- **Changement incompatible du document** : incrémenter `SCHEMA_VERSION`, ajouter `MIGRATIONS[ancien]`, ajouter une fixture dans
  `tests/fixtures/`, lancer `node tests/compat.test.js`. Ne jamais modifier une migration déjà publiée.
- **Publier** : mettre à jour `APP_VERSION` dans `index.html` **et** `VERSION` dans `sw.js` (même valeur), puis `CHANGELOG.md`.
