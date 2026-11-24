/* La Compagnie de l'Aube : données fictives du mode aperçu (sans moteur).
 * Chargé par index.html seulement quand l'app tourne sans adresse de moteur (chargerDemo) : jamais sur les téléphones des héros.
 * Sorti d'index.html le 24/11/2026 (app 11.5) pour alléger l'app. */
window.demo = (() => {
  const a = 10, k = 2.3, seuil = 5000;
  const TITRES = [[1, "l'Apprenti"], [5, "l'Aventurier"], [10, 'le Vagabond'], [20, 'le Chevalier'], [27, 'le Preux'], [35, 'le Champion'], [50, 'le Héros'], [75, 'le Légendaire'], [100, "l'Ascendant"]];
  const now = new Date();
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const today = iso(now);
  const ilYa = n => iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() - n));
  const jourAuj = JOURS[(now.getDay() + 6) % 7];
  const vide = () => ({ fait: 0, rate: 0, repos: 0 });
  const habs = [
    { nom: 'La Course des Éclaireurs', sous: 'Course à pied', categorie: 'Perso', carac: 'Endurance', carac2: 'Agilité', type: 'Routine', jours: 'Lun, Mer, Sam', tousLes: 0, xp: 113, objectif: 3, semaine: 1, derniere: ilYa(2), serie: 5, serieNb: 5, record: 9 },
    { nom: 'Forger l\'armure', sous: 'Renforcement musculaire', categorie: 'Perso', carac: 'Force', carac2: 'Endurance', type: 'Routine', jours: 'Jeu', tousLes: 0, xp: 90, objectif: 1, semaine: 0, derniere: 'Jamais', serie: 0, serieNb: 0, record: 0 },
    { nom: 'Maîtrise de la Langue Ancienne', sous: 'Anglais 20 min', categorie: 'Perso', carac: 'Intelligence', carac2: 'Sagesse', type: 'Rythme', jours: '', tousLes: 2, xp: 100, objectif: 4, semaine: 1, derniere: ilYa(2), serie: 3, serieNb: 3, record: 6 },
    { nom: 'Le Couvre-feu du Mage', sous: 'Coucher avant 22 h 30', categorie: 'Perso', carac: 'Endurance', carac2: 'Volonté', type: 'Routine', jours: 'Dim, Lun, Mar, Mer, Jeu', tousLes: 0, xp: 60, objectif: 5, semaine: 3, derniere: ilYa(1), serie: 3, serieNb: 3, record: 4 }
  ].map(h => Object.assign(h, { jour: vide() }));
  // Pour que l'aperçu montre une routine du jour, la course tombe aujourd'hui
  habs[0].jours = jourAuj === 'Lun' || jourAuj === 'Mer' || jourAuj === 'Sam' ? 'Lun, Mer, Sam' : `Lun, Mer, ${jourAuj}`;
  const annexes = [
    { nom: 'Taverne de la Compagnie', sous: 'Voir des amis', categorie: 'Perso', carac: 'Charisme', carac2: '', repetable: true, echeance: '', xp: 90, fois: 0 },
    { nom: 'Déchiffrer un grimoire', sous: 'Lire un chapitre', categorie: 'Perso', carac: 'Sagesse', carac2: 'Intelligence', repetable: true, echeance: '', xp: 120, fois: 2 },
    { nom: 'L\'Alchimie des fourneaux', sous: 'Cuisiner un vrai repas maison', categorie: 'Perso', carac: 'Volonté', carac2: '', repetable: true, echeance: '', xp: 75, fois: 0 },
    { nom: 'Pèlerinage aux Anciens', sous: 'Aller voir mes grands-parents à Perpignan', categorie: 'Perso', carac: 'Charisme', carac2: 'Sagesse', repetable: true, echeance: '', xp: 225, fois: 0 }
  ].map(x => Object.assign(x, { jour: vide() }));
  const objectifs = [
    { nom: 'Le Codex des Langues Oubliées', sous: 'Anglais : 60 séances avant fin mars', categorie: 'Perso', habitude: 'Maîtrise de la Langue Ancienne', debut: ilYa(20), echeance: ilYa(-140), visees: 60, recompense: 1500, faites: 9 },
    { nom: 'La Traversée des Contrées', sous: 'Course : 70 sorties avant fin avril', categorie: 'Perso', habitude: 'La Course des Éclaireurs', debut: ilYa(20), echeance: ilYa(-170), visees: 70, recompense: 1500, faites: 7 }
  ];
  const stats = { Force: 520, Endurance: 6300, 'Agilité': 1400, Intelligence: 2900, Sagesse: 1650, 'Volonté': 980, Charisme: 270 };
  const regDemo = { vacances: [], pauses: [], decalages: [], rappel: { actif: true, heure: 20, dimanche: true, quotidien: true },
    confort: { animations: true, vibrations: true }, devise: '', sauvegarde: { derniere: '', dossier: '', gardees: 8 },
    difficulte: { niveau: 'Normal', depuis: '', prochainChangement: '', modes: [
      { nom: 'Détendu', resume: 'PV perdus par raté ÷ 2 · 1 joker de plus par semaine' },
      { nom: 'Normal', resume: 'Les règles de l\'onglet Paramètres, telles quelles' },
      { nom: 'Héroïque', resume: 'PV perdus par raté × 1,5 · aucun joker · +10 % d\'XP' }] } };
  let d20Demo = null, sortDemo = '', restauDemo = false;
  const rbDemo = () => location.hash === '#voleur' || herosActif === 'Kael';
  function capaDemo() {
    const rb = rbDemo();
    return { niveau: 12, roublard: rb, sortPrepare: rb ? '' : sortDemo,
      restaurables: [],
      liste: rb ? [{ n: 5, debloquee: true, statut: 'Prête : ta prochaine quête annexe rapporte ×2' }, { n: 20, debloquee: false, statut: '' }, { n: 50, debloquee: false, statut: '' }, { n: 100, debloquee: false, statut: '' }]
        : [{ n: 5, debloquee: true, statut: sortDemo ? `Préparé sur « ${sortDemo} » : accomplis-la pour ×1,5` : 'À préparer : choisis la quête de la semaine', action: 'preparer' },
          { n: 20, debloquee: false, statut: '' }, { n: 50, debloquee: false, statut: '' }, { n: 100, debloquee: false, statut: '' }] };
  }
  let vacDemo = false, xp = 3400, rates = 0, pvDemo = 35, jokers = 1, log = [], nouveaux = [];
  const lundi = ilYa((now.getDay() + 6) % 7);
  function etat() {
    const niv = Math.max(1, Math.floor(Math.pow(xp / a, 1 / k)));
    const bas = niv === 1 ? 0 : a * Math.pow(niv, k), haut = a * Math.pow(niv + 1, k);
    const pv = Math.max(0, Math.min(100, pvDemo));
    const titre = TITRES.filter(t => t[0] <= niv).pop()[1];
    objectifs.forEach(o => {
      o.progression = o.faites / o.visees;
      o.temps = ecartJours(o.debut, today) / ecartJours(o.debut, o.echeance);
      o.statut = o.faites >= o.visees ? 'Accompli' : o.progression >= o.temps ? 'Dans les temps' : 'En retard';
    });
    habs.forEach(h => {
      h.decalages = regDemo.decalages.filter(x => x.nom === h.nom);
      h.enPause = regDemo.pauses.some(x => x.nom === h.nom);
      h.aFaire = !h.enPause && (h.type === 'Routine' ? prevu(Object.assign({}, h), today)
        : h.derniere === 'Jamais' || ecartJours(h.derniere, today) >= h.tousLes);
    });
    regDemo.vacances.forEach(v => { v.enCours = v.debut <= today && (!v.fin || today <= v.fin); });
    return { today, heros: location.hash === '#duo' ? (herosActif || 'Theron Corvane') : 'Ton nom de héros', titre, niveau: niv, xpTotale: xp, xpSuivant: Math.round(haut - xp),
      progression: Math.max(0, Math.min(1, (xp - bas) / (haut - bas))), pv, pvMax: 100,
      etat: pv <= 0 ? 'À terre' : pv >= 40 ? 'En forme' : 'Épuisé (XP ×0,85)', xpParPoint: seuil,
      stats: Object.keys(stats).map(n => ({ nom: n, xp: stats[n], score: Math.min(20, 8 + Math.floor(stats[n] / seuil)) })),
      habitudes: JSON.parse(JSON.stringify(habs)),
      annexes: JSON.parse(JSON.stringify(annexes.filter(x => x.repetable || x.fois === 0 || x.jour.fait))),
      objectifs: JSON.parse(JSON.stringify(objectifs)),
      vacances: vacDemo || regDemo.vacances.some(v => v.enCours) ? { depuis: today } : null,
      reglages: JSON.parse(JSON.stringify(regDemo)), sheetUrl: 'https://docs.google.com/spreadsheets/',
      regles: { rend: [1, 0.5, 0.25], soinHab: 5, soinAnnexe: 10, pen: 10, xpMult: 1 },
      classe: location.hash === '#voleur' || herosActif === 'Kael' ? { nom: 'Roublard assassin', fav1: 'Volonté', fav2: 'Charisme', bonus: 1.1 }
        : { nom: 'Magicien', fav1: 'Intelligence', fav2: 'Sagesse', bonus: 1.1, epiques: 1.2 },
      look: herosActif === 'Kael' ? '#c99a74,#2b1d14,#3d6e9e' : '',
      compagnie: location.hash === '#duo' ? [{ nom: 'Theron Corvane', classe: 'Magicien' }, { nom: 'Kael', classe: 'Voleur assassin' }] : [{ nom: 'Ton nom de héros', classe: 'Magicien' }],
      compagnons: location.hash !== '#duo' ? [] : [herosActif === 'Kael'
        ? { nom: 'Theron Corvane', classe: 'Magicien', look: '', niveau: 14, titre: 'le Vagabond', pv: 85, faitsAujourdhui: 2, quetesDuJour: 4, xpSemaine: 1240 }
        : { nom: 'Kael', classe: 'Voleur assassin', look: '#c99a74,#2b1d14,#3d6e9e', niveau: 9, titre: "l'Aventurier", pv: 70, faitsAujourdhui: 0, quetesDuJour: 3, xpSemaine: 860 }],
      jokersRestants: jokers, jokersParSemaine: 1, nouveauxBonus: nouveaux.splice(0), seuilEpuise: 40, malus: 0.85, arc: null, // ×0,85 : même valeur que le moteur (migration du 19/11/2026)
      d20: d20Demo, capacites: capaDemo(),
      bilan: { semaine: { lundi, dimanche: ilYa((now.getDay() + 6) % 7 - 6), xp: Math.round(xp - 1220), faits: 7 + log.filter(l => l.statut === 'Fait').length,
          rates: rates, jokers: 1 - jokers, bonus: 2, aJour: 2, total: 4 },
        precedente: { lundi: ilYa((now.getDay() + 6) % 7 + 7), dimanche: ilYa((now.getDay() + 6) % 7 + 1), xp: 540, faits: 9, rates: 1, jokers: 1, bonus: 1, aJour: 2, total: 4 } } };
  }
  const trouver = nom => habs.find(x => x.nom === nom) || annexes.find(x => x.nom === nom);
  function gain(q) { const n = q.jour.fait; return q.xp * (n === 1 ? 1 : n === 2 ? 0.5 : 0.25); }
  return {
    getState: etat,
    getHeros() {
      return location.hash === '#duo' ? [{ nom: 'Theron Corvane', classe: 'Magicien', titre: 'le Vagabond', niveau: 12, look: '' },
        { nom: 'Kael', classe: 'Voleur assassin', titre: "l'Aventurier", niveau: 9, look: '#c99a74,#2b1d14,#3d6e9e' }]
        : [{ nom: 'Ton nom de héros', classe: 'Magicien', titre: 'le Vagabond', niveau: 12, look: '' }];
    },
    toggleVacances() { vacDemo = !vacDemo; return etat(); },
    journalRecent() {
      const j = k => ilYa(k);
      return { today, quotidiennes: ['Anglais 20 min', 'Course', 'Coucher avant minuit'], annexes: ['Ranger le bureau'], jours: [0, 1, 2, 3, 4, 5, 6, 7].map(k => ({ date: j(k),
        saisies: k === 1 ? [{ quete: 'Course', statut: 'Fait', note: '', xp: 45 }, { quete: 'Coucher avant minuit', statut: 'Raté', note: 'Raté (auto)', xp: 0, auto: true }]
          : k === 2 ? [{ quete: 'Anglais 20 min', statut: 'Repos', note: 'Joker (auto)', xp: 0, auto: true }, { quete: 'Course', statut: 'Bonus', note: 'Série 3 jours', xp: 30 }]
          : k === 0 ? [] : [{ quete: 'Coucher avant minuit', statut: 'Fait', note: '', xp: 23 }] })) };
    },
    corrigerJour() { const e = etat(); e.journalQuetes = demo.journalRecent(); return e; },
    retirerSaisie() { const e = etat(); e.journalQuetes = demo.journalRecent(); return e; },
    getProfil() {
      const naiss = '1998-11-30', sem = Math.floor(ecartJours(naiss, today) / 7) + 1;
      let g = '';
      for (let i = 0; i < 4160; i++) g += i < sem - 1 - 3 ? '1' : i < sem - 1 ? '3423'[i % 4] : i === sem - 1 ? '6' : '0';
      return { naissance: naiss, semaineVie: sem, grille: g, records: { quetes: 87, bonusSerie: 9, meilleureSerie: { nom: 'La Course des Éclaireurs', jours: 12 },
        meilleureSemaine: { xp: 1340, lundi: ilYa(14) }, semainesChroniquees: 3, parfaites: 1, reussies: 2, jours: 24 },
        histoire: ['Ton héros est un mage de la Ville Rose. (Texte de démonstration : en vrai, il vient de ta Fiche du héros.)', 'Point fort : la soif d\'apprendre · Ennemi juré : la procrastination.'] };
    },
    planifierVacances(d, f) { if (f < d) throw new Error('La fin doit être après le début'); regDemo.vacances.push({ index: regDemo.vacances.length, debut: d, fin: f }); return etat(); },
    supprimerVacances(i) { regDemo.vacances = regDemo.vacances.filter(v => v.index !== i); return etat(); },
    basculerPause(nom) { const k = regDemo.pauses.findIndex(x => x.nom === nom); if (k >= 0) regDemo.pauses.splice(k, 1); else regDemo.pauses.push({ nom, depuis: today }); return etat(); },
    decalerSeance(nom, de, a) { regDemo.decalages.push({ nom, de, a }); return etat(); },
    annulerDecalage(nom, de, a) { regDemo.decalages = regDemo.decalages.filter(x => !(x.nom === nom && x.de === de && x.a === a)); return etat(); },
    reglerRappel(cfg) { regDemo.rappel = cfg; return etat(); },
    testerRappel() { return etat(); },
    changerDifficulte(n) { regDemo.difficulte.niveau = n; regDemo.difficulte.prochainChangement = ilYa(-30); return etat(); },
    reglerConfort(c) { regDemo.confort = c; return etat(); },
    renommerQuete(a, n) { if (habs.concat(annexes).some(q => q.nom === n)) throw new Error('Une quête porte déjà ce nom'); const q = habs.concat(annexes).find(x => x.nom === a); q.nom = n; return etat(); },
    sauvegarderMaintenant() { regDemo.sauvegarde.derniere = today; regDemo.sauvegarde.dossier = 'https://drive.google.com/'; return etat(); },
    reglerDevise(t) { regDemo.devise = String(t || '').trim(); return etat(); },
    lancerD20(o) {
      if (!d20Demo) {
        const forcer = /d20=(\d+)/.exec(location.hash), recu = o && Number(o.d1) ? d20Local(state, Number(o.d1), Number(o.d2) || Number(o.d1)).de : 0; // le dé tiré sur le téléphone : pas de faux « autre appareil »
        const de = forcer ? Number(forcer[1]) : recu >= 1 && recu <= 20 ? recu : 1 + Math.floor(Math.random() * 20), mod = 0, total = de + mod;
        const r = de === 20 ? [1.5, 'COUP CRITIQUE !', 'Les dieux sont avec toi : XP ×1,5 sur toutes tes quêtes du jour.']
          : de === 1 ? [0.8, 'Échec critique…', 'Ton grimoire t\'est tombé sur le pied. XP ×0,8 aujourd\'hui : le destin rit, à toi de lui prouver qu\'il a tort.']
          : total >= 18 ? [1.25, 'Inspiration héroïque', 'XP ×1,25 sur toutes tes quêtes du jour.']
          : total >= 10 ? [1.1, 'Bon présage', 'XP ×1,1 sur toutes tes quêtes du jour.'] : [1, 'Journée ordinaire', 'Ni bonus ni malus : aujourd\'hui, c\'est toi qui fais la différence.'];
        d20Demo = { de, mod, carac: rbDemo() ? 'Volonté' : 'Intelligence', total, mult: r[0], titre: r[1], texte: r[2] };
      }
      return etat();
    },
    preparerSort(q) { sortDemo = q; return etat(); },
    utiliserRestauration() { restauDemo = true; return etat(); },
    saisirHorsLigne(liste) {
      const res = [];
      (liste || []).forEach(x => {
        try { if (x.type === 'd20') this.lancerD20(); else if (x.type === 'undo') this.undoToday(x.quete); else this.logAction(x.quete, x.statut); res.push({ id: x.id, ok: true }); }
        catch (e) { res.push({ id: x.id, ok: false, message: e.message }); }
      });
      return Object.assign(etat(), { horsLigne: res });
    },
    logAction(nom, statut) {
      const q = trouver(nom);
      if (statut === 'Fait') {
        const mult = pvDemo < 40 ? 0.75 : 1; if (!q.jour.fait) pvDemo += q.fois !== undefined ? 10 : 5;
        q.jour.fait++; const g = gain(q) * mult; xp += g; stats[q.carac] += g; if (q.carac2) stats[q.carac2] += g / 2;
        if (q.semaine !== undefined) { q.semaine++; q.derniere = today; }
        if (q.fois !== undefined) q.fois++;
        const o = objectifs.find(o => o.habitude === nom); if (o) o.faites++;
        if (q.serie !== undefined) { q.serieNb++; q.serie = q.serieNb; q.record = Math.max(q.record || 0, q.serie); if (q.nom === 'Maîtrise de la Langue Ancienne' && q.serie === 4) { nouveaux.push({ titre: '🔥 Série 7 jours', texte: q.nom + ' · 4 validations d\'affilée · +75 XP' }); xp += 75; } }
        log.push({ nom, statut, g });
      } else if (statut === 'Raté') { q.jour.rate++; rates++; pvDemo -= 10; log.push({ nom, statut }); }
      else { if (jokers <= 0) throw new Error('Plus de joker cette semaine'); jokers--; q.jour.repos++; log.push({ nom, statut }); }
      return etat();
    },
    undoToday(nom) {
      const i = log.map(l => l.nom).lastIndexOf(nom); if (i < 0) return etat();
      const l = log.splice(i, 1)[0], q = trouver(nom);
      if (l.statut === 'Fait') {
        q.jour.fait--; xp -= l.g; if (!q.jour.fait) pvDemo -= q.fois !== undefined ? 10 : 5; stats[q.carac] -= l.g; if (q.carac2) stats[q.carac2] -= l.g / 2;
        if (q.semaine !== undefined) q.semaine--; if (q.fois !== undefined) q.fois--;
        const o = objectifs.find(o => o.habitude === nom); if (o) o.faites--;
      } else if (l.statut === 'Raté') { q.jour.rate--; rates--; pvDemo += 10; } else { q.jour.repos--; jokers++; }
      return etat();
    }
  };
})();
/* Aperçu : une armurerie de démonstration (le vrai catalogue vient du moteur) */
(function () {
  const CAT = {"liste":[{"id":"cape_rouge","slot":"cape","rarete":"commun","nom":"Cape de laine rouge","butin":true,"saison":"pre","comment":"Coffres et marchand"},{"id":"cape_verte","slot":"cape","rarete":"commun","nom":"Cape du chasseur","butin":true,"saison":"pre","comment":"Coffres et marchand"},{"id":"cape_bleue","slot":"cape","rarete":"commun","nom":"Cape du voyageur","butin":true,"saison":"pre","comment":"Coffres et marchand"},{"id":"bandeau","slot":"tete","rarete":"commun","nom":"Diadème de bronze","saison":"pre","comment":"Palier 2 de la pré-saison"},{"id":"fleurs","slot":"tete","rarete":"commun","nom":"Couronne de fleurs","butin":true,"saison":"pre","comment":"Coffres et marchand"},{"id":"aura_etincelles","slot":"aura","rarete":"rare","nom":"Aura d'étincelles","saison":"pre","comment":"Palier 7 de la pré-saison"},{"id":"tr_etincelles","slot":"trainee","rarete":"rare","nom":"Traînée d'étincelles","saison":"pre","comment":"Palier 4 de la pré-saison"},{"id":"tr_petales","slot":"trainee","rarete":"rare","nom":"Traînée de pétales","butin":true,"saison":"pre","comment":"Coffres et marchand"},{"id":"tr_flammes","slot":"trainee","rarete":"epique","nom":"Traînée de flammes","butin":true,"saison":"reserve","comment":"Une prochaine saison"},{"id":"vi_etoiles","slot":"victoire","rarete":"epique","nom":"Coup de grâce : pluie d'étoiles","butin":true,"saison":"pre","comment":"Coffres et marchand"},{"id":"sc_givre","slot":"sceau","rarete":"commun","nom":"Rune de givre","butin":true,"saison":"pre","comment":"Coffres et marchand"},{"id":"sc_laurier","slot":"sceau","rarete":"rare","nom":"Couronne de laurier","butin":true,"saison":"pre","comment":"Coffres et marchand"},{"id":"sc_braise","slot":"sceau","rarete":"epique","nom":"Braise de la forge","butin":true,"saison":"pre","comment":"Coffres et marchand"},{"id":"sc_aube","slot":"sceau","rarete":"legendaire","nom":"Soleil de l'Aube","butin":true,"horsCoffre":true,"saison":"pre","comment":"Chez le marchand"},{"id":"vi_foudre","slot":"victoire","rarete":"legendaire","nom":"Coup de grâce : foudre","butin":true,"saison":"reserve","comment":"Une prochaine saison"},{"id":"fa_dragon","slot":"familier","rarete":"epique","nom":"Dragon de l'Aube","comment":"Une série de 7 jours sur une quête","saison":"pre"},{"id":"fa_loup","slot":"familier","rarete":"epique","nom":"Loup des neiges","butin":true,"saison":"reserve","comment":"Une prochaine saison"},{"id":"fa_chouette","slot":"familier","rarete":"epique","nom":"Chouette astrale","butin":true,"saison":"reserve","comment":"Une prochaine saison"},{"id":"cape_aube","slot":"cape","rarete":"epique","nom":"Cape de l'Aube","comment":"Palier 9 de la pré-saison","saison":"pre"},{"id":"aura_aube","slot":"aura","rarete":"legendaire","nom":"Aura de l'Aube","butin":true,"saison":"pre","comment":"Coffres et marchand"},{"id":"tete_aube","slot":"tete","rarete":"legendaire","nom":"Couronne de l'Aube","comment":"Palier 15 de la pré-saison","saison":"pre"},{"id":"mo_destrier","slot":"monture","rarete":"epique","nom":"Destrier","comment":"Niveau 25","saison":"pre"},{"id":"mo_griffon","slot":"monture","rarete":"legendaire","nom":"Griffon","comment":"Niveau 50","saison":"pre"},{"id":"re_clairiere","slot":"repaire","rarete":"commun","nom":"La clairière","niveau":1,"saison":"pre","comment":"Niveau 1"},{"id":"re_campement","slot":"repaire","rarete":"rare","nom":"Le campement","niveau":10,"saison":"pre","comment":"Niveau 10"},{"id":"re_taverne","slot":"repaire","rarete":"epique","nom":"La taverne","niveau":20,"saison":"pre","comment":"Niveau 20"},{"id":"re_tour","slot":"repaire","rarete":"epique","nom":"La tour","niveau":35,"saison":"pre","comment":"Niveau 35"},{"id":"re_trone","slot":"repaire","rarete":"legendaire","nom":"La salle du trône","niveau":50,"saison":"pre","comment":"Niveau 50"},{"id":"cape_corsaire","slot":"cape","rarete":"epique","nom":"Cape du corsaire","saison":"reserve"},{"id":"plumes","slot":"tete","rarete":"rare","nom":"Coiffe de plumes","saison":"reserve"},{"id":"cornes","slot":"tete","rarete":"epique","nom":"Cornes du conquérant","saison":"reserve"},{"id":"aura_lune","slot":"aura","rarete":"rare","nom":"Aura lunaire","butin":true,"saison":"reserve","comment":"Une prochaine saison"},{"id":"aura_abysses","slot":"aura","rarete":"epique","nom":"Aura des abysses","saison":"reserve"},{"id":"tr_bulles","slot":"trainee","rarete":"rare","nom":"Traînée de bulles","butin":true,"saison":"reserve","comment":"Une prochaine saison"},{"id":"fa_renard","slot":"familier","rarete":"epique","nom":"Renard des braises","butin":true,"saison":"reserve","comment":"Une prochaine saison"},{"id":"fa_golem","slot":"familier","rarete":"epique","nom":"Petit golem","butin":true,"saison":"reserve","comment":"Une prochaine saison"},{"id":"cape_procrastination","slot":"cape","rarete":"epique","nom":"Cape du Sablier","butin":true,"panoplie":"procrastination","saison":"reserve","comment":"Boss du mois"},{"id":"tete_procrastination","slot":"tete","rarete":"legendaire","nom":"Couronne du Sablier","butin":true,"panoplie":"procrastination","saison":"reserve","comment":"Boss du mois"},{"id":"aura_procrastination","slot":"aura","rarete":"legendaire","nom":"Aura du Sablier","butin":true,"panoplie":"procrastination","saison":"reserve","comment":"Boss du mois"},{"id":"cape_dissipation","slot":"cape","rarete":"epique","nom":"Cape des Tourbillons","butin":true,"panoplie":"dissipation","saison":"reserve","comment":"Boss du mois"},{"id":"tete_dissipation","slot":"tete","rarete":"legendaire","nom":"Couronne des Tourbillons","butin":true,"panoplie":"dissipation","saison":"reserve","comment":"Boss du mois"},{"id":"aura_dissipation","slot":"aura","rarete":"legendaire","nom":"Aura des Tourbillons","butin":true,"panoplie":"dissipation","saison":"reserve","comment":"Boss du mois"},{"id":"cape_oubli","slot":"cape","rarete":"epique","nom":"Cape du Néant","butin":true,"panoplie":"oubli","saison":"reserve","comment":"Boss du mois"},{"id":"tete_oubli","slot":"tete","rarete":"legendaire","nom":"Couronne du Néant","butin":true,"panoplie":"oubli","saison":"reserve","comment":"Boss du mois"},{"id":"aura_oubli","slot":"aura","rarete":"legendaire","nom":"Aura du Néant","butin":true,"panoplie":"oubli","saison":"reserve","comment":"Boss du mois"},{"id":"cape_fatigue","slot":"cape","rarete":"epique","nom":"Cape des Brumes","butin":true,"panoplie":"fatigue","saison":"reserve","comment":"Boss du mois"},{"id":"tete_fatigue","slot":"tete","rarete":"legendaire","nom":"Couronne des Brumes","butin":true,"panoplie":"fatigue","saison":"reserve","comment":"Boss du mois"},{"id":"aura_fatigue","slot":"aura","rarete":"legendaire","nom":"Aura des Brumes","butin":true,"panoplie":"fatigue","saison":"reserve","comment":"Boss du mois"},{"id":"cape_doute","slot":"cape","rarete":"epique","nom":"Cape des Mille Yeux","butin":true,"panoplie":"doute","saison":"reserve","comment":"Boss du mois"},{"id":"tete_doute","slot":"tete","rarete":"legendaire","nom":"Couronne des Mille Yeux","butin":true,"panoplie":"doute","saison":"reserve","comment":"Boss du mois"},{"id":"aura_doute","slot":"aura","rarete":"legendaire","nom":"Aura des Mille Yeux","butin":true,"panoplie":"doute","saison":"reserve","comment":"Boss du mois"},{"id":"cape_tentation","slot":"cape","rarete":"epique","nom":"Cape de la Pomme d'Or","butin":true,"panoplie":"tentation","saison":"reserve","comment":"Boss du mois"},{"id":"tete_tentation","slot":"tete","rarete":"legendaire","nom":"Couronne de la Pomme d'Or","butin":true,"panoplie":"tentation","saison":"reserve","comment":"Boss du mois"},{"id":"aura_tentation","slot":"aura","rarete":"legendaire","nom":"Aura de la Pomme d'Or","butin":true,"panoplie":"tentation","saison":"reserve","comment":"Boss du mois"}],"prix":{"commun":40,"rare":100,"epique":250,"legendaire":600},"panoplies":{"procrastination":{"nom":"du Sablier","couleur":"#b48cff","saison":"reserve"},"dissipation":{"nom":"des Tourbillons","couleur":"#5ae6be","saison":"reserve"},"oubli":{"nom":"du Néant","couleur":"#dfe3ff","saison":"reserve"},"fatigue":{"nom":"des Brumes","couleur":"#9fb0e0","saison":"reserve"},"doute":{"nom":"des Mille Yeux","couleur":"#ff5a5a","saison":"reserve"},"tentation":{"nom":"de la Pomme d'Or","couleur":"#ff78aa","saison":"reserve"}},"chemins":{"pre":{"1":{"item":"cape_rouge"},"2":{"item":"bandeau"},"3":{"coffre":"commun"},"4":{"item":"tr_etincelles"},"5":{"coffre":"rare"},"6":{"eclats":60},"7":{"item":"aura_etincelles"},"8":{"coffre":"rare"},"9":{"item":"cape_aube"},"10":{"coffre":"epique"},"11":{"eclats":60},"12":{"coffre":"rare"},"13":{"eclats":60},"14":{"coffre":"legendaire"},"15":{"item":"tete_aube"}}}};
  const arm = { saison: { id: 'pre', nom: 'Pré-saison · le Rodage', paliers: 15, palier: 4, xp: 2180, cout: 500, dansPalier: 180, prochaine: { coffre: 'rare' } },
    possede: ['cape_rouge', 'bandeau', 're_clairiere', 're_campement', 'fa_dragon', 'sc_givre', 'sc_aube'], eclats: 120, ouverts: 0, joursActifs: 15,
    coffres: [{ source: 'palier|4', type: 'commun', origine: 'Palier 4' }, { source: 'boss|2026-11-12|La Liche du Scroll', type: 'rare', origine: 'La Liche du Scroll' }] };
  const ornDemo = {};
  Object.keys(demo).forEach(k => { const f = demo[k]; if (typeof f !== 'function') return;
    demo[k] = function () { const r = f.apply(this, arguments); if (r && r.habitudes && r.heros) { r.trophees = [{ date: '2026-11-12', nom: 'La Liche du Scroll', visuel: 'liche', type: 'semaine', trophee: 'Écran brisé', xp: 300 }, { date: '2026-11-08', nom: 'Le Golem de la Flemme', visuel: 'golem', type: 'semaine', trophee: 'Cœur de pierre', xp: 200 }, { date: '2026-10-31', nom: 'La Procrastination', visuel: 'procrastination', type: 'mois', trophee: 'Sablier brisé', xp: 500 }]; r.catalogueCosm = CAT; r.armurerie = JSON.parse(JSON.stringify(arm)); if (r.reglages) r.reglages.ornements = Object.assign({}, r.reglages.ornements, ornDemo); } return r; }; });
  /* Un boss de la semaine et un du mois (boss du Rodage, déjà publics), même forme que le moteur (Code.js, état d'un combat) :
   * l'onglet Combat existe ainsi en mode aperçu, et le script de publication le contrôle comme les autres (24/11/2026). */
  const jIso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const bossDemo = r => {
    const n = new Date(), lun = new Date(n.getFullYear(), n.getMonth(), n.getDate() - (n.getDay() + 6) % 7), plus = k => jIso(new Date(lun.getFullYear(), lun.getMonth(), lun.getDate() + k));
    const moi = r.heros, lui = ((demo.getHeros() || []).find(h => h.nom !== moi) || {}).nom || 'ton compagnon d\'armes';
    const auj = jIso(n), dem = jIso(new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1));
    const coups = [{ date: auj, heros: moi, quete: 'Lire 20 pages', type: 'coup', valeur: 312, faible: true, resiste: false, lien: true },
      { date: auj, heros: lui, quete: 'Course à pied', type: 'coup', valeur: 268, faible: false, resiste: false, lien: true },
      { date: plus(0), heros: lui, quete: 'Sommeil', type: 'riposte', valeur: 180 },
      { date: plus(0), heros: moi, quete: 'Anglais', type: 'coup', valeur: 205, faible: false, resiste: true }];
    const semaine = { coups, type: 'semaine', nom: 'La Liche du Scroll', rang: 1, faible: 'Intelligence', resiste: 'Sagesse', debut: plus(0), fin: plus(6),
      pvMax: 3200, pv: 1420, riposte: 180, degats: { [moi]: 1030, [lui]: 930 }, statut: 'En cours', vaincuLe: '', xp: 600, visuel: 'liche',
      incarne: 'Le défilement sans fin', description: 'Elle se nourrit des minutes perdues à faire défiler l\'écran.', conseil: 'Pose le téléphone, ouvre un livre.', trophee: '',
      nouvellesRegles: true, stade: 1, nomStade: 'La Liche du Scroll', teinte: 0, attribut: '', phase: 'normal', sbire: null, enhardi: '', coupDuJour: null,
      coupDemain: { date: dem, capacite: 'malediction', nom: 'Malédiction', icone: '💀', annonce: 'La Liche du Scroll prépare une malédiction pour demain.', contre: 'Brisez-la : ' + moi + ' fait une quête de Intelligence.', cible: moi, carac: 'Sagesse', remede: 'Intelligence', faible: 'Intelligence' },
      capacites: [{ id: 'malediction', nom: 'Malédiction', icone: '💀' }, { id: 'sbire', nom: 'Sbire', icone: '👹' }] };
    const m1 = jIso(new Date(n.getFullYear(), n.getMonth(), 1)), mFin = jIso(new Date(n.getFullYear(), n.getMonth() + 1, 0));
    const mois = { coups: coups.slice(0, 2), type: 'mois', nom: 'La Procrastination', rang: 0, faible: 'Endurance', resiste: 'Charisme', debut: m1, fin: mFin,
      pvMax: 14000, pv: 9800, riposte: 540, degats: { [moi]: 2300, [lui]: 1900 }, statut: 'En cours', vaincuLe: '', xp: 2000, visuel: 'procrastination',
      incarne: 'Le « je le ferai demain »', description: 'Plus on la repousse, plus elle grandit.', conseil: 'Commence par cinq minutes.', trophee: '',
      nouvellesRegles: true, stade: 1, nomStade: 'La Procrastination', teinte: 0, attribut: '', phase: 'normal', sbire: null, enhardi: '', coupDuJour: null, coupDemain: null,
      capacites: [{ id: 'bouclier', nom: 'Bouclier', icone: '🔰' }, { id: 'vol', nom: 'Vol de joker', icone: '🃏' }, { id: 'malediction', nom: 'Malédiction', icone: '💀' }] };
    return { semaine, mois };
  };
  Object.keys(demo).forEach(k => { const f = demo[k]; if (typeof f !== 'function' || k === 'getHeros') return;
    demo[k] = function () { const r = f.apply(this, arguments); if (r && r.habitudes && r.heros && !r.boss) r.boss = bossDemo(r); return r; }; });
  demo.equiperOrnement = (slot, id) => { ornDemo[slot] = id || ''; return demo.getState(); };
  demo.ouvrirCoffre = src => { const c = arm.coffres.shift(); const item = ['tr_petales', 'cape_procrastination', 'fa_loup'][arm.ouverts++ % 3];
    if (!arm.possede.includes(item)) arm.possede.push(item); const e = demo.getState(); e.coffreOuvert = { source: src, type: c ? c.type : 'rare', origine: c ? c.origine : '', item, eclats: 0 }; return e; };
  demo.acheterCosmetique = id => { arm.possede.push(id); arm.eclats -= 100; return demo.getState(); };
})();
window.dispatchEvent(new Event('demo-pret'));
