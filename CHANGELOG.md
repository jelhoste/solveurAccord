# Journal des changements

Versionnage : `APP_VERSION` suit le semver (MAJEUR.MINEUR.CORRECTIF) ; `SCHEMA_VERSION` est le numéro entier du format des
fichiers d'export et des liens de partage (voir FORMAT.md).

## 1.8.0 - 2026-11-08 (format de fichier : 2, inchangé)
- BANQUE DE SONS PAR DÉFAUT. Le réglage « Son » (barre d'écoute) propose : « Banque : guitare acier » (défaut), « Banque : guitare nylon » et
  « Intégré (léger) » (les sons synthétisés de la 1.7.0). La banque est une SoundFont GeneralUser GS (sons/note-all.sf3, 2,7 Mo) jouée par SpessaSynth
  (vendor/, licence Apache-2.0). Guitare = canal 0, piano = canal 1 (canal 9 réservé à la batterie du mode entraînement).
- Mise en cache automatique : le service worker garde la banque et le synthé dans un cache à part (`accords-sons-1`), rempli à la première visite EN LIGNE,
  puis servi sans réseau et jamais retéléchargés lors d'une mise à jour de l'appli. La page demande aussi au navigateur de rendre le stockage durable.
- Repli : si les fichiers sont absents, refusés ou invalides (ex. artefact claude.ai), la page l'indique et joue avec les sons intégrés, sans erreur.
- Réglage temporel : le retard propre du synthé (60 à 100 ms) est mesuré et retranché, pour que les accords tombent sur le temps.
- Nouveaux tests : `tests-jsdom/audio2.js` (logique, faux synthé) et `tests-jsdom/sf-chromium.js` (vrai Chromium : cache, hors ligne, justesse du rythme).
- Préférence locale ajoutée : `accords.sound`.

## 1.7.0 - 2026-11-08 (format de fichier : 2, inchangé)
- ÉCOUTE DES ACCORDS. Un bouton « Écouter » sous chaque diagramme (guitare et piano) et dans la fenêtre de choix d'accord fait entendre l'accord
  tel qu'il est dessiné : guitare = les cordes appuyées, capo compris (la note sonne à capo + case), jouées en coup de médiator du grave à l'aigu ;
  piano = basse (main gauche) et main droite. Fonctionne aussi interface verrouillée.
- « Écouter la grille » : joue toute la suite avec le son de l'onglet affiché, une mesure de quatre temps par accord (une frappe par mesure),
  tempo réglable (50 à 160, mémorisé), option « En boucle » (mémorisée). L'accord et le diagramme en cours sont entourés. La lecture s'arrête si
  l'on modifie la grille, le capo, le niveau, un choix de variante, ou si l'on change d'onglet ou de page.
- Moteur sonore (base des futures fonctions d'entraînement) : un seul AudioContext créé au premier geste, planificateur « avec avance » sur l'horloge
  audio, sons synthétisés par la page sans aucun fichier audio (guitare pincée de type Karplus–Strong, piano par harmoniques).
  Le son donne la hauteur des notes, pas le timbre d'un vrai instrument.
- Impression : la barre d'écoute et les boutons « Écouter » sont masqués.
- Nouveau test sans dépendance : `node tests/synth.test.js` (justesse à 1 centième de ton, niveau, extinction, notes jouées).
- Préférences locales ajoutées : `accords.bpm`, `accords.loop`.

## 1.6.0 - 2026-11-03 (format de fichier : 2, inchangé)
- Bouton « Imprimer » : ouvre l'impression du navigateur avec une mise en page dédiée (aussi via Ctrl+P) : en-tête (titre, grille, instrument,
  capo, niveau, date, légende « en jaune »), diagrammes de l'onglet affiché, toujours en clair, sans les commandes ni la mention technique de variante.
- SÉCURITÉ : un nom d'accord piégé arrivant par un lien de partage, un fichier importé, la sauvegarde locale ou « Mes grilles » pouvait injecter
  du HTML dans la page. Les symboles venant de l'extérieur sont maintenant filtrés (`SAFE_SYMBOL`, accord ignoré et signalé sinon) et tout nom
  d'accord est échappé à l'affichage. Mettre à jour les installations existantes.

## 1.5.0 - 2026-11-02 (format de fichier : 2, inchangé)
- Option « Chiffres dans les ronds » (guitare) : affiche ou masque les numéros de doigts, « 1 » du barré compris. Affichés par défaut ;
  réglage mémorisé ; paramètre d'adresse `digits=0` ou `digits=1`. Le numéro de case reste affiché.

## 1.4.0 - 2026-11-02 (format de fichier : 2, inchangé)
- Mémorisation sur l'appareil : la dernière grille (accords, niveau, capo, choix manuels, onglet, verrou) est enregistrée automatiquement et
  rouverte au lancement. Un lien partagé prime et n'écrase pas la dernière grille tant qu'on n'y touche pas.
- « Mes grilles » : enregistrer, rouvrir et supprimer des grilles nommées (même nom = mise à jour ; suppression en deux temps).
- Option « Doigts en place » (masquée par défaut) : en jaune, les doigts de guitare qui gardent la même corde et la même case que l'accord
  précédent (un barré compte pour un doigt), les notes de piano déjà jouées par l'accord précédent, avec le décompte sous chaque diagramme.
  Paramètre d'adresse `pivots=1`, couleurs `pivot` et `pivotink`.

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
