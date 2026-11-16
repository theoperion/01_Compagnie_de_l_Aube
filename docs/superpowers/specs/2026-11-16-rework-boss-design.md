# Rework des boss — design

*La Compagnie de l'Aube · 16 novembre 2026 · proposition à valider par Théo avant tout code*

## 1. Pourquoi

Les boss sont aujourd'hui des « sacs à PV » : seuls leur dessin, leur faiblesse et leur résistance les distinguent.
Ils tombent trop vite (boss de la semaine battu jeudi pendant un voyage plein de quêtes faciles ; boss du mois presque
mort avec 14 jours restants), une défaite n'a aucune conséquence, et un boss qui revient n'est qu'une copie avec plus de PV.

**But** : des boss vivants, avec des coups spéciaux qui vous gênent ou vous aident, un combat qui tient jusqu'au bout,
une défaite qui compte un peu — **sans jamais devenir impossible ni frustrant**.

### Objectifs
- PV calés sur le vrai rythme de la Compagnie : à votre rythme habituel, la victoire se joue en fin de période, pas avant.
- La victoire n'est **pas garantie** : il faut faire un peu mieux que d'habitude ou jouer intelligemment (faiblesse, contres).
- Capacités spéciales annoncées à l'avance, toujours contrables par une quête précise.
- Une défaite donne un petit malus, jamais une punition lourde.
- Un boss qui revient **évolue** : nouveau nom, nouvelle apparence, une capacité de plus.
- Tout le calcul des combats est fait par le moteur (choix de Théo, pour le long terme).

### Non-objectifs (pour ce chantier)
- Animations de victoire propres à chaque boss (chantier 2), salle des trophées (chantier 3), récap animé du dimanche (chantier 4).
- Changer les quêtes, l'XP des quêtes ou les règles de PV des héros.

### Anti-objectifs (ce qui serait un échec même si « ça marche »)
- Un boss qu'on ne peut pas battre en faisant ses quêtes habituelles avec un peu plus d'effort.
- Perdre de l'XP déjà gagnée, ou une malédiction qu'on ne peut pas contrer.
- Devoir lire un manuel : chaque effet s'explique en une phrase sur la carte du boss.

## 2. Approches considérées

| | Garder les formules de la Sheet + une colonne « capacités » | **Tout calculer dans le moteur (choisi)** |
|---|---|---|
| Principe | Le moteur ajoute une colonne d'effets que les formules prennent en compte | Le moteur calcule PV, dégâts, capacités, statut et **écrit les valeurs** dans l'onglet Combats |
| Pour | Changement limité | Une seule source de vérité, facile à faire évoluer, logique testable |
| Contre | Logique coupée en deux (formules + moteur), difficile à faire évoluer | Réécriture du calcul des combats, à tester soigneusement |

Effets seulement visuels dans l'app : écarté, les capacités doivent compter vraiment.
**Choix de Théo : tout dans le moteur.** L'onglet Combats reste lisible : il affiche les valeurs écrites par le moteur
(plus de formules pour PV, dégâts, ripostes, statut). Les salles des trophées, titres et archives continuent de lire les mêmes colonnes.

## 3. PV calés sur votre rythme

**Rythme de la Compagnie** = dégâts moyens **par héros et par jour présent**, sur les **28 derniers jours**, calculés avec la même
règle de dégâts qu'aujourd'hui (XP × faiblesse/résistance × sort/sournoise). Un « jour présent » = un jour où ce héros n'est
ni en vacances ni en voyage (*choix de Claude* : un héros absent ne fait pas baisser le rythme de l'autre).

- **Boss de la semaine** : PV = rythme × (jours présents prévus de tous les héros sur la semaine) × **1,10** × bonus d'évolution (section 6).
- **Boss du mois** : PV = rythme × (jours présents prévus sur le mois) × **1,08** × bonus d'évolution. Ses dégâts sont ceux de toutes les quêtes du mois.
- **Garde-fous** : les PV restent entre 70 % et 150 % de ceux du boss précédent du même type (pas de saut brutal après une semaine creuse ou exceptionnelle).
  Moins de 14 jours d'historique : on garde les PV actuels de la Sheet.
- Les PV sont **fixés au lancement** du boss (lundi ou 1er du mois) et ne bougent ensuite que par les capacités (soin, régénération).

Effet attendu : à votre rythme habituel, il manque ~10 % le dernier jour. Frapper la faiblesse (×1,5, ×2 pour le mage),
briser les capacités (« Brèche », section 4) et ne pas rater de quêtes suffisent à gagner. Une semaine de voyage à quêtes faciles
élève aussi le rythme des semaines suivantes : le boss suit votre forme.

## 4. Capacités spéciales

### 4.1 Les coups spéciaux annoncés (deux fois par semaine)
*Décision de Théo : pas d'annonce tous les jours, c'est trop lourd.*
- **Boss de la semaine** : un coup spécial le **mardi** et un le **jeudi**.
- **Boss du mois** : un coup spécial chaque **samedi**.
- Le coup est **annoncé dès la veille au soir** (carte du boss, Nouvelles), pour pouvoir s'organiser.

Le boss **annonce** une action tirée de ses capacités (tirage fixe d'avance, le même pour les deux héros).
Elle s'affiche sur la carte du boss et en pastille sur l'écran des quêtes :

> ⚠ *Le Golem prépare **Carapace de pierre** : vos petites quêtes font moitié dégâts aujourd'hui.*
> *Brisez-la : une quête d'**Endurance** (sa faiblesse).*

- **Contre réussi** (un des héros fait la quête demandée) : l'effet est annulé pour la journée **et** la Compagnie gagne
  **« Brèche »** : dégâts ×1,25 sur toutes les quêtes suivantes du jour. Petite animation sur la carte.
- Pas de contre : l'effet s'applique toute la journée (ou à minuit pour les effets « de nuit »).
- Les deux coups d'une même semaine sont différents.

### 4.1 bis Règles « à la journée » (*choix de Claude*)
Le Journal note la date d'une quête, pas l'heure (et une quête peut être saisie le lendemain, ou arriver de la montre en retard).
Toutes les règles se jugent donc **sur la journée entière**, jamais sur l'ordre des quêtes :
- **Brèche** : si l'intention est contrée ce jour-là, toutes les quêtes du jour (sauf celle qui a contré) font ×1,25 de dégâts.
- **Bouclier** : contré si les deux héros font au moins une quête ce jour-là (plus de condition d'heure).
- **d20 = 20** : la quête la plus forte du jour fait double dégâts.
- **Vol de joker / Hurlement** : déclenchés s'il y a au moins un raté ce jour-là.

### 4.1 ter Boss de la semaine et boss du mois en même temps (*choix de Claude*)
- Chacun a son intention ; ses effets de combat (Carapace, Bouclier, Sbire, Brèche) ne touchent **que ses propres dégâts**. Rien ne se cumule entre les deux.
- **Malédiction sur l'XP** : une seule active par jour et par héros ; si les deux boss en tirent une le même jour, seule celle du boss de la semaine compte.
- Une même quête peut contrer les deux intentions si elle remplit les deux conditions.
- Le garde-fou des 15 % s'applique à chaque boss, par semaine du calendrier.

### 4.2 Catalogue (effets chiffrés)
| Effet | Ce qui se passe | Contre |
|---|---|---|
| **Carapace** | Quêtes de DD ≤ 9 : dégâts ×0,5 aujourd'hui | Une quête de sa faiblesse |
| **Régénération** | À minuit, +4 % de ses PV max | Une quête de sa faiblesse dans la journée |
| **Malédiction** | Un héros désigné : **vraie XP** ×0,85 aujourd'hui sur une caractéristique désignée (même circuit que les bénédictions du Maître du Jeu, qui changent déjà la vraie XP ; *choix de Claude*). Contrée : l'XP des quêtes du jour est rétablie | Ce héros fait une quête de la caractéristique « remède » indiquée |
| **Bouclier** | Absorbe les dégâts jusqu'à 6 % de ses PV max aujourd'hui | Les deux héros font chacun au moins une quête avant 14 h |
| **Sbire** | Un sbire apparaît (6 % des PV du boss) ; les dégâts le frappent d'abord | Le tuer (+20 XP chacun) |
| **Vol de joker** | S'il y a un raté aujourd'hui, il vole le joker restant de la semaine **du héros qui a raté** (un seul joker volé par héros et par semaine, rendu à la victoire) | Ne rien rater aujourd'hui |
| **Hurlement** | Au prochain raté, la riposte est doublée | Ne rien rater aujourd'hui |

**Ripostes** (raté) : comme aujourd'hui, le boss se soigne d'un % de ses PV max ; en phase « Enragé », ×2.

### 4.3 Phases
- **> 50 % PV** : normal.
- **≤ 50 %** : **Enragé** — ses ripostes (ratés) sont doublées. Pas d'annonce supplémentaire.
- **≤ 20 %** : **Aux abois** — **une seule fois**, le lendemain du passage sous 20 %, coup « Dernier recours » annoncé : +8 % PV à minuit sauf si une quête de sa faiblesse est faite ce jour-là.

### 4.4 Effets en votre faveur
- **Brèche** (contre réussi) : ×1,25 dégâts le reste du jour.
- **Étourdi** : si les deux héros font chacun 3 quêtes ou plus la veille d'un coup spécial, le coup est annulé.
- **d20 = 20** : la première quête du jour fait double dégâts au boss.
- Le **Rebondissement du jeudi** (allié du Maître du Jeu si le boss a plus de 50 % PV) reste.

### 4.5 Garde-fous
- Toutes les capacités réunies ne peuvent pas ajouter plus de **15 % de ses PV max par semaine** (régénération, part doublée des ripostes, dernier recours, sbires). Les ripostes normales d'aujourd'hui (soin quand on rate) ne comptent pas dans ce plafond : elles sont la conséquence directe d'un raté (*choix de Claude*).
- Jamais de perte d'XP déjà gagnée ; une malédiction ne touche que l'XP *future* du jour, une seule caractéristique, ×0,85 au pire.
- Tout effet négatif a un contre faisable le jour même par une quête courante.

### 4.6 Capacités de chaque boss (forme de base)
| Boss | Capacités | Esprit |
|---|---|---|
| Golem | Carapace, Régénération | la pierre encaisse et se reforme |
| Liche | Malédiction, Sbire (squelette) | |
| Spectre | Bouclier, Malédiction | intangible |
| Basilic | Malédiction (pétrification), Carapace | |
| Harpie | Vol de joker, Sbire | |
| Troll | Régénération, Hurlement | régénère fort |
| Hydre | Sbire (une tête), Régénération | |
| Nécromancien | Sbire, Malédiction | |
| Gargouille | Carapace, Bouclier | |
| Mimique | Vol de joker, Bouclier | trompeuse |
| Dragon | Bouclier, Hurlement | |
| Archidémon | Malédiction, Hurlement, Sbire | rang le plus haut |
| Procrastination (mois) | Bouclier, Vol de joker, Malédiction | |
| Dissipation (mois) | Malédiction, Sbire, Régénération | |
| Oubli (mois) | Régénération, Malédiction, Carapace | |
| Fatigue (mois) | Carapace, Hurlement, Régénération | |
| Doute (mois) | Malédiction, Bouclier, Hurlement | |
| Tentation (mois) | Vol de joker, Sbire, Malédiction | |

## 5. Défaite : le boss s'échappe
Si le boss n'est pas vaincu à la fin de sa période :
- **Il lui restait plus de 10 % de PV** : il s'échappe **enhardi**. Le boss suivant du même type arrive avec **+10 % PV** et
  une **malédiction de départ** sur les deux premiers jours (contrable comme les autres). Le boss du mois emporte aussi sa relique (pas de joker bonus).
- **Il lui restait 10 % ou moins** : « Fuite in extremis » — seulement +5 % PV au suivant, pas de malédiction.
- Un message dans le fil de la Compagnie et dans les Nouvelles raconte la fuite.

## 6. Évolutions au lieu de « mêmes boss avec plus de PV »
Quand un boss revient dans le calendrier, il revient **évolué** :
- **3 stades** : Forme de base → **Stade II** → **Stade III**, puis il reste au stade III.
- Chaque stade : **nouveau nom** (ex. Golem de Pierre → Golem de Lave → Colosse Ardent), **nouvelle apparence**
  (nouvelle palette de couleurs + un attribut visuel : couronne, cornes, aura, yeux brillants), **une capacité de plus** du catalogue,
  faiblesse et résistance qui tournent, PV ×1,05 par stade (en plus du calage sur le rythme).
- **XP de victoire** (*choix de Claude*, proche d'aujourd'hui) : boss de la semaine **200 / 300 / 400** XP aux stades I / II / III ; boss du mois **500 / 650 / 800**.
- **Passage aux stades** pour les boss existants : rang 1 → stade I, rangs 2-3 → stade II, rangs 4-5 → stade III.
- 18 boss × 3 stades = 54 formes, sans dessiner 36 nouveaux monstres de zéro. De nouveaux boss pourront s'ajouter plus tard.
- Le « rang » actuel (1 à 5) est remplacé par le stade.

## 7. Dans l'app
- Carte du boss (Compagnie et petite carte des Quêtes) : stade, **intention du jour** + son contre, effets actifs (icônes), phase, sbire éventuel.
- L'écran des quêtes signale les quêtes qui **contrent** l'intention du jour (petite étiquette « 🗡 brise la Carapace »).
- La prédiction instantanée des dégâts dans l'app applique les effets du jour (Carapace, Brèche, Bouclier, sbire), pour rester juste avant la réponse du moteur.
- Petites animations quand une capacité se déclenche ou est brisée (secousse, éclat violet / doré). Les grosses animations par boss = chantier 2.

### 7 bis Annonce des nouvelles règles (pour Kevin)
- Une fenêtre unique « ⚔ Les boss changent ! » s'ouvre chez **chaque héros** à sa prochaine ouverture de l'app,
  avec les nouveautés en 5 lignes (PV calés, coups spéciaux mardi/jeudi/samedi et contres, phases, fuite enhardie, évolutions)
  et la date de départ (23 novembre). Elle reste consultable dans les Nouvelles. Un message dans le fil de la Compagnie aussi.

## 8. Fonctionnement dans le moteur
- Nouvelle fonction de combat qui, à chaque calcul de la fiche : lit les coups (Journal), applique faiblesse/résistance, capacités du jour,
  contres, Brèche, sbire, ripostes et phases **jour par jour depuis le début du boss** (rejouable, donc toujours cohérent),
  puis écrit PV max, dégâts par héros, ripostes, PV restants, statut et fléau dans l'onglet Combats.
- Intention du jour : tirage déterministe (date + nom du boss), donc identique pour les deux héros et recalculable.
- Défaite, enhardi, stade : notés à la clôture du boss (même moment que la victoire aujourd'hui).
- Le calendrier des boss continue d'avancer tout seul (fonction existante) ; le stade remplace le rang.

## 9. Mise en place sans casser les combats en cours
- Le boss de la semaine en cours et le boss de novembre **gardent leurs règles actuelles** jusqu'à leur fin.
- Nouvelles règles : boss de la semaine à partir du **lundi 23 novembre**, boss du mois à partir du **1er décembre**.
- Les colonnes déjà utilisées par les titres, trophées et archives gardent leur sens.

## 10. Vérifications avant mise en ligne
- Préalable : récupérer les formules actuelles des onglets Combats (colonnes G à N) et Bestiaire (export de la Sheet par Google Drive ;
  à défaut, Théo copie une ligne de formules). Elles servent à la comparaison ci-dessous et au calcul de secours des PV.
- Tests de chaque capacité, contre, phase, garde-fou des 15 %, défaite enhardie / in extremis, évolution.
- Simulation sur 8 semaines fictives (rythmes réguliers, semaine de voyage, semaine creuse) : jour de victoire attendu entre jeudi et dimanche
  à rythme normal, défaite possible si rythme en baisse.
- Comparaison : pour un boss sans capacité, le nouveau calcul de dégâts doit donner exactement les mêmes chiffres que les formules actuelles.

## 11. Laissé au constructeur
- Textes exacts des intentions et noms des stades II et III (Claude peut les écrire une fois, puis ils sont gardés).
- Palettes de couleurs et attributs visuels des stades.
- Détail de l'affichage des icônes d'effets.

## Ajustement après simulation (16/11/2026, tâche 8)

La simulation (`app_scripts/compagnie-de-l-aube/tests/simulation.js`, 200 semaines par scénario, rythme réel de novembre)
montrait 0 % de victoire avec un coefficient de 1,10 : les ratés habituels (≈ 9 par semaine à deux, 5 % de PV chacun) soignaient
le boss de près de moitié. Corrections :
- les PV de départ divisent par `1 + riposte × ratés attendus` (ratés par jour de présence sur les 28 derniers jours) ;
- coefficients ramenés à 0,82 (semaine) et 0,80 (mois).

Résultat : rythme normal sans contrer → une victoire sur deux, le samedi ou le dimanche (sinon il reste ≈ 13 % de PV) ;
en contrant → 78 % de victoires, surtout du vendredi au dimanche ; semaine creuse (−30 %) → le boss s'enfuit ; jamais de victoire avant mercredi.
