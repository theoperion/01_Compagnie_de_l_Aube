# Rework des boss — plan d'action

> **Pour l'exécutant :** méthode requise : superpowers:subagent-driven-development (recommandé) ou superpowers:executing-plans, tâche par tâche. Cases `- [ ]` pour le suivi.

**But :** des boss calés sur le rythme de la Compagnie, avec coups spéciaux annoncés (mardi/jeudi, samedi pour le mois), phases, fuite enhardie et évolutions en 3 stades, tout calculé par le moteur.

**Architecture :** la logique de combat est une suite de fonctions **pures** dans un nouveau fichier du moteur `Boss.js` (testable dans Node, sans Google). `Code.js` les appelle depuis `combatsDuJour_`, écrit les résultats en valeurs dans l'onglet Combats et envoie à l'app un objet `boss` enrichi. L'app (`index.html`) affiche stade, coup spécial, contre, phase, sbire, et applique les effets dans sa prédiction instantanée.

**Technique :** Google Apps Script (V8, plusieurs fichiers `.js` dans `app_scripts/compagnie-de-l-aube/`, mise en ligne `clasp push --force` puis `python3 ../outils/deployer.py "…"`), app HTML/JS en un fichier, tests Node (`node:vm` + `node:assert`), navigateur Playwright pour l'app.

**Design :** `docs/superpowers/specs/2026-11-16-rework-boss-design.md` (approuvé par Théo le 16/11/2026).

## Contraintes globales
- Nouvelles règles : boss de la semaine à partir du **lundi 2026-11-23**, boss du mois à partir du **2026-12-01**. Avant : calcul actuel, inchangé.
- PV : semaine = rythme × jours présents prévus × **1,10** × **1,05^(stade−1)** ; mois = × **1,08** ; bornes **70 %–150 %** des PV du boss précédent du même type ; moins de **14 jours** d'historique → PV actuels.
- Rythme : dégâts moyens par héros et par jour présent sur **28 jours** (jour présent = ni vacances ni voyage pour ce héros).
- Coups spéciaux : semaine **mardi et jeudi** (deux coups différents), mois **samedi** ; annoncés la veille ; tirage déterministe (date + nom du boss).
- Effets : Carapace (DD ≤ 9 → ×0,5) · Régénération (+4 % PV max à minuit) · Malédiction (vraie XP ×0,85, une caractéristique, un héros) · Bouclier (absorbe 6 % PV max) · Sbire (6 % PV max, à tuer d'abord, +20 XP chacun) · Vol de joker (héros qui rate, 1/semaine, rendu à la victoire) · Hurlement (riposte ×2 ce jour).
- Contres jugés **sur la journée** ; contre réussi → **Brèche** ×1,25 sur les autres quêtes du jour (pour ce boss). Bouclier : contré si chaque héros fait ≥ 1 quête ce jour.
- Phases : ≤ 50 % **Enragé** (ripostes ×2) ; ≤ 20 % **Aux abois** : une fois, le lendemain, « Dernier recours » +8 % sauf quête de faiblesse.
- Faveurs : Étourdi (chaque héros ≥ 3 quêtes la veille d'un coup → coup annulé) ; d20 = 20 → quête la plus forte du jour ×2 ; Rebondissement du jeudi conservé.
- Plafond : capacités ≤ **15 %** des PV max par boss et par semaine calendaire (ripostes normales exclues).
- Défaite : > 10 % PV restants → suivant du même type **+10 % PV** + malédiction de départ 2 jours ; ≤ 10 % → **+5 %** seulement ; boss du mois : relique perdue.
- Stades I/II/III (rang 1 → I, 2-3 → II, 4-5 → III) ; XP victoire semaine **200/300/400**, mois **500/650/800**.
- Les effets des deux boss ne se cumulent pas ; une seule malédiction XP par jour et par héros (celle du boss de la semaine prime).
- Jamais de perte d'XP déjà gagnée ; tout texte d'effet tient en une phrase.

## Points de vigilance (non couverts par le design, à tester)
1. **Saisie tardive** (« C'était hier », montre en retard, correction du journal) : le combat est rejoué depuis le début du boss, le résultat doit être identique à une saisie le jour même → test dans la tâche 3.
2. **Vacances en plein combat** (un héros, puis les deux) : les PV ne sont pas recalculés en cours de route, aucun coup spécial un jour où toute la Compagnie est en vacances → tests tâches 2 et 3.
3. **Victoire le jour d'un coup spécial** ou par le sbire : la victoire est détectée une seule fois, l'XP versée une fois → test tâche 4.
4. **Fiche préparée** (moteur 4.2) : un coup spécial ou une phase qui change à minuit doit jeter la fiche gardée (nouveau jour = nouvelle clé, déjà le cas) → test tâche 4.
5. **Ancienne app** (téléphone pas encore mis à jour) qui reçoit le nouvel objet `boss` : rien ne casse (champs ajoutés, pas renommés) → test tâche 5.

---

### Tâche 1 : Récupérer les formules actuelles des combats ✅ (16/11)

**Fichiers :** modifier `app_scripts/compagnie-de-l-aube/Code.js` (fonction temporaire).

**Interfaces :** produit le fichier Drive « Compagnie · formules des combats.txt » (lu par Claude via Google Drive).

- [ ] Ajouter `exporterFormulesCombats_()` : écrit dans un fichier texte Drive les formules de `Combats!A3:X5`, `Combats!A60:X61`, `Bestiaire!A3:K6`, `Paramètres!A60:B77` (`getFormulas()` + `getValues()`), appelée une seule fois par `getState` (drapeau de propriété `formulesExportees`).
- [ ] Mettre en ligne, demander à Théo d'ouvrir l'app une fois, lire le fichier par Google Drive.
- [ ] Noter dans `Boss.js` (commentaire en tête) les formules de PV, dégâts et riposte actuelles ; retirer la fonction temporaire à la tâche 4.

### Tâche 2 : Données des boss (`Boss.js`, partie données) ✅ (16/11)

**Fichiers :** créer `app_scripts/compagnie-de-l-aube/Boss.js` ; tests `app_scripts/compagnie-de-l-aube/tests/boss.test.js`.

**Interfaces :**
- Produit `BOSS_FICHES_` : `{ [visuel]: { type: 'semaine'|'mois', capacites: string[], stades: [{ nom, teinte, attribut }] } }` pour les 18 visuels (golem … archidemon, procrastination … tentation), capacités de base selon le tableau §4.6 du design, + 1 capacité par stade suivant.
- Produit `CAPACITES_` : `{ carapace, regeneration, malediction, bouclier, sbire, vol, hurlement }` → `{ nom, annonce(boss), contre(boss), effet }` (textes d'une phrase).
- Produit `stadeDepuisRang_(rang: number) -> 1|2|3` et `xpVictoire_(type, stade) -> number`.

- [ ] Test : `stadeDepuisRang_(1)===1`, `(3)===2`, `(5)===3` ; `xpVictoire_('semaine',2)===300` ; `xpVictoire_('mois',3)===800` ; chaque visuel a 3 stades, des noms différents, 2 (semaine) ou 3 (mois) capacités au stade I et une de plus par stade, toutes présentes dans `CAPACITES_`.
- [ ] Lancer `node tests/boss.test.js` → échec attendu.
- [ ] Écrire les données (noms des stades II/III et textes par Claude).
- [ ] Relancer → succès. Commit.

### Tâche 3 : Moteur de combat pur (`Boss.js`, partie calcul) ✅ (16/11, 18 tests)

**Fichiers :** modifier `Boss.js` ; tests `tests/boss.test.js`.

**Interfaces :**
- Consomme : `BOSS_FICHES_`, `CAPACITES_` (tâche 2).
- Produit :
  - `rythme_(coups, presences, jusqua) -> number` — `coups` = `[{ date, heros, valeur }]` (valeur = dégâts « nus » : XP × faiblesse/résistance × sort/sournoise, comme `coupsDuCombat_`), `presences` = `{ [heros]: Set(iso) }`.
  - `pvDepart_({ type, rythme, joursPresents, stade, enhardi, pvPrecedent, pvSecours }) -> number`.
  - `coupsSpeciaux_({ boss, debut, fin, type }) -> [{ date, capacite, cible, carac, remede }]` (mardi/jeudi ou samedis ; 2 différents par semaine ; déterministe).
  - `rejouerCombat_({ boss, pvMax, debut, jusqua, coups, rates, quetesParJour, d20, presences }) -> { pv, degats: {heros:n}, ripostes, phase, effetsDuJour, sbire, brisés, plafondAtteint, historique }`.
- Valeurs : toutes celles des Contraintes globales.

- [ ] Tests (assertions chiffrées) :
  - `rythme_` : 2 héros, 28 jours, un héros 7 jours en vacances → moyenne sur les seuls jours présents.
  - `pvDepart_` : rythme 100, 14 jours présents, stade II → `100*14*1.10*1.05` arrondi ; borné à 150 % de `pvPrecedent` ; `pvSecours` si historique < 14 jours ; enhardi +10 % / +5 %.
  - `coupsSpeciaux_` : semaine du 2026-11-23 → dates `2026-11-24` et `2026-11-26`, capacités différentes ; même entrée → même sortie ; boss du mois de décembre → 4 samedis ; aucun coup un jour où tous les héros sont en vacances.
  - `rejouerCombat_` sans aucune capacité active → dégâts identiques à la somme actuelle (`coupsDuCombat_`).
  - Carapace non contrée : une quête DD 8 de valeur 100 → 50 ; contrée par une quête de faiblesse → l'autre quête du jour vaut 125 (Brèche).
  - Régénération non contrée → +4 % à minuit ; plafond : 5 régénérations dans la semaine → total capacités ≤ 15 %.
  - Bouclier : absorbe 6 % ; annulé si chaque héros a ≥ 1 quête ce jour.
  - Sbire : les premiers 6 % de dégâts vont au sbire, `sbire.vaincu` passe à vrai.
  - Phases : passage ≤ 50 % → ripostes ×2 ; ≤ 20 % → un seul « Dernier recours » le lendemain.
  - Étourdi : 3 quêtes chacun la veille → coup du lendemain annulé.
  - Saisie tardive : même liste de coups ajoutée un jour plus tard → résultat identique (point de vigilance 1).
- [ ] Lancer → échecs attendus. Implémenter. Relancer → succès. Commit.

### Tâche 4 : Brancher le moteur (`Code.js`) ✅ (16/11, moteur 5.0 en service, actif le 23/11 ; 5 tests d'intégration)

> Suivi : avant mars 2027, adapter `roulerBoss_` (il ne décale que la colonne U ; les lignes écrites en valeurs par le moteur ne doivent pas se décaler mal).

**Fichiers :** modifier `app_scripts/compagnie-de-l-aube/Code.js` (`combatsDuJour_`, `reglesBoss_`, `multEvenement_`, `jokersUtilises_`, `roulerBoss_`, `titres_` stats si besoin) ; tests `tests/integration.test.js` (fausse Sheet, comme les tests du 05/11).

**Interfaces :**
- Consomme : tâche 3.
- Produit, dans `etat.boss.semaine` / `etat.boss.mois` (champs **ajoutés**, rien de renommé) : `stade, nomStade, phase, coupDuJour, coupDemain, effets[], sbire{pv,pvMax,vaincu}|null, enhardi, nouvellesRegles:true`.
- Propriétés du script : `bossPv|<type>|<debut>` (PV fixés au lancement), `bossFin|<type>|<debut>` (`{issue:'victoire'|'fuite'|'fuiteJuste', pvRestant}`), `jokerVole|<heros>|<lundi>`.

- [ ] Tests d'intégration : boss commencé avant le 23/11 → calcul inchangé ; après → valeurs écrites dans Combats (G PV max, H/I dégâts, J ripostes, K PV, L statut, D stade) ; victoire détectée une seule fois avec XP 200/300/400 ; fuite → `bossFin` noté et boss suivant +10 % avec malédiction de départ (fuite à ≤ 10 % → +5 % sans malédiction ; boss du mois en fuite → pas de relique) ; malédiction → multiplicateur 0,85 dans la saisie concernée, rétabli après contre ; vol de joker → `jokersRestants` diminue pour le héros qui a raté, rendu à la victoire ; fiche préparée jetée au changement de jour (point 4).
- [ ] Implémenter ; retirer `exporterFormulesCombats_`. Monter la version du moteur (5.0).
- [ ] Tests au vert. Commit (pas encore de mise en ligne).

### Tâche 5 : Affichage dans l'app (`index.html`)

**Fichiers :** modifier `01_Compagnie_de_l_Aube/index.html` (`carteBoss`, petite carte des Quêtes, `degatsQuete`, `predire`, Nouvelles, étiquette des quêtes) et `config.js`.

**Interfaces :** consomme les champs de la tâche 4.

- [ ] Carte du boss : stade et nom du stade, phase (badge), coup du jour (ou de demain, la veille au soir) en une phrase + son contre, effets actifs en icônes, barre du sbire.
- [ ] Écran des quêtes : étiquette « 🗡 brise la Carapace » sur les quêtes qui contrent le coup du jour.
- [ ] `degatsQuete` applique Carapace, Brèche, Bouclier restant et sbire, pour une prédiction juste.
- [ ] Petite animation quand un coup est brisé (éclat doré) ou subi (secousse violette).
- [ ] Test Playwright (mode aperçu, objet `boss` simulé) : la carte affiche coup/contre/phase ; une quête de faiblesse porte l'étiquette ; la prédiction d'une quête DD 8 sous Carapace donne la moitié ; un objet `boss` **sans** les nouveaux champs s'affiche comme avant (point 5) ; comparaison des règles CSS avant/après (seules les nouvelles s'ajoutent).
- [ ] Version de l'app 4.1. Commit.

### Tâche 6 : Apparence des stades

**Fichiers :** modifier `index.html` (`bossSvg`, styles).

- [ ] `bossSvg(visuel, cle, stade)` : stade II/III → teinte (`teinte` de `BOSS_FICHES_`, filtre de couleur) + attribut dessiné par-dessus (couronne, cornes, aura, yeux brillants).
- [ ] Captures des 18 boss aux 3 stades (planche Playwright) vérifiées à l'œil ; aucune forme illisible. Commit.

### Tâche 7 : Annonce des nouvelles règles (pour Kevin)

**Fichiers :** `index.html` (fenêtre unique), `Code.js` (message dans le fil, une fois).

- [ ] Fenêtre « ⚔ Les boss changent ! » à la première ouverture après la mise en ligne, chez chaque héros (mémorisée sur le téléphone), 5 lignes : PV calés sur votre rythme · coups spéciaux mardi et jeudi (samedi pour le mois), annoncés la veille, à contrer · Enragé et Aux abois · un boss non battu revient enhardi · les boss évoluent en 3 stades ; départ le 23 novembre. Consultable ensuite dans les Nouvelles.
- [ ] Message dans le fil de la Compagnie (propriété `annonceBoss2026` pour ne l'écrire qu'une fois).
- [ ] Test Playwright : la fenêtre s'ouvre une fois, pas la deuxième. Commit.

### Tâche 8 : Simulation d'équilibrage

**Fichiers :** `app_scripts/compagnie-de-l-aube/tests/simulation.js`.

- [ ] Simuler 8 semaines avec `Boss.js` : rythme régulier, semaine de voyage à quêtes faciles, semaine creuse (−30 %), Compagnie qui contre la moitié des coups.
- [ ] Attendu : rythme normal sans contre → défaite de justesse ou victoire dimanche ; rythme normal avec contres → victoire jeudi–samedi ; semaine creuse → fuite ; jamais de victoire avant mercredi à rythme normal. Ajuster les coefficients **seulement** si ces attentes ne tiennent pas, et le noter dans le design.
- [ ] Commit du script et du tableau de résultats.

### Tâche 9 : Mise en ligne et suivi

- [ ] `clasp push --force` puis `python3 ../outils/deployer.py "moteur 5.0 : rework des boss"` ; vérifier par l'API que l'adresse est sur la nouvelle version.
- [ ] Publier l'app (main), mettre à jour l'audit `app_scripts/audits/compagnie-2026-11.md`, le mode d'emploi Claude et le README.
- [ ] Checklist pour Théo et Kevin : fenêtre d'annonce vue ; le 23/11, carte du boss avec stade et PV ; le 23/11 au soir, coup du mardi annoncé ; mardi, l'étiquette « brise… » sur la bonne quête et la Brèche après contre.
