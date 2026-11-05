/**
 * La Compagnie de l'Aube — serveur de la mini-app (Google Apps Script)
 * À coller dans Extensions → Apps Script, fichier « Code.gs ».
 * Le Google Sheet reste le moteur : ce script lit l'état et écrit dans le Journal.
 *
 * À chaque ouverture de l'app, un contrôle rattrape les jours passés :
 *  - ratés automatiques (routine non faite le jour prévu, rythme en retard), avec joker hebdo ;
 *  - séries et bonus de paliers (3 j, 7 j, 30 j, 3 mois… 10 ans) ;
 *  - archivage du bilan de chaque semaine terminée dans l'onglet Bilans ;
 *  - points de vie : soin actif, état Épuisé (XP réduite), arc d'entraînement à 0 PV ;
 *  - mode vacances : aucun raté, séries gelées.
 */

const ONGLET_HABITUDES = 'Quêtes du quotidien';
const ONGLET_ANNEXES = 'Quêtes annexes';
const ONGLET_OBJECTIFS = 'Quêtes épiques';
const ONGLET_JOURNAL = 'Journal';
const ONGLET_PERSONNAGE = 'Personnage';
const ONGLET_PARAMETRES = 'Paramètres';
const ONGLET_BILANS = 'Chroniques';
const LIGNE_QUETES = 4; // première ligne de données des onglets de quêtes (bannière + en-tête au-dessus)
/*
 * Journal, une ligne par saisie (A → N) :
 *  A Date · B Quête · C Statut · D Note · E Catégorie · F Carac. principale · G Carac. secondaire · H XP de base
 *  I N° du jour · J Rendement · K XP gagnée (formules) · L XP bonus · M Multiplicateur état · N Héros
 * E à H sont FIGÉES au moment de la saisie : renommer, supprimer ou rééquilibrer une quête ne réécrit pas le passé.
 */
const COLS_JOURNAL = 14;

const CODES_JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
/** Version du moteur (affichée en bas des réglages de l'app, avec celle de l'app). */
const VERSION_MOTEUR = '2026-11-05-2';
const NUMERO_MOTEUR = '3.4'; // numéro de version du moteur : +0.1 à chaque livraison

/** Adresse de l'app installable (GitHub Pages). Le lien des e-mails de rappel y mène. */
const APP_PUBLIC_URL = 'https://theoperion.github.io/01_Compagnie_de_l_Aube/';

/* ====================== API de l'app installable ======================
 * L'app (hébergée sur GitHub Pages) envoie { fn, args, cle } en POST.
 * La clé secrète désigne le héros : impossible de jouer pour l'autre sans sa clé.
 * Les clés sont dans Paramètres → Fiches des héros, colonne P.
 */
function apiFonctions_() {
  return { getState: getState, getProfil: getProfil, logAction: logAction, undoToday: undoToday, toggleVacances: toggleVacances,
    planifierVacances: planifierVacances, supprimerVacances: supprimerVacances, basculerPause: basculerPause, decalerSeance: decalerSeance,
    annulerDecalage: annulerDecalage, reglerRappel: reglerRappel, testerRappel: testerRappel, changerDifficulte: changerDifficulte,
    reglerConfort: reglerConfort, choisirTitre: choisirTitre, encourager: encourager, proposerPacte: proposerPacte,
    accepterPacte: accepterPacte, chroniqueSemaine: chroniqueSemaine, recitEvenement: recitEvenement, maitreDuJeu: maitreDuJeu, voterMJ: voterMJ, rebondissement: rebondissement, chapitreEvolution: chapitreEvolution, retrospective: retrospective, paroleBoss: paroleBoss, motDuCoach: motDuCoach, reglerDevise: reglerDevise, sauvegarderMaintenant: sauvegarderMaintenant, renommerQuete: renommerQuete,
    lancerD20: lancerD20, preparerSort: preparerSort, utiliserRestauration: utiliserRestauration,
    voirCompagnon: voirCompagnon, carnetCharger: carnetCharger, carnetSauver: carnetSauver, carnetClaude: carnetClaude,
    carnetConfig: carnetConfig, carnetReglages: carnetReglages, carnetTest: carnetTest, carnetIntervals: carnetIntervals,
    signalerErreurs: signalerErreurs, saisirHorsLigne: saisirHorsLigne, equiperOrnement: equiperOrnement,
    planifierVoyage: planifierVoyage, annulerVoyage: annulerVoyage,
    journalRecent: journalRecent, corrigerJour: corrigerJour, retirerSaisie: retirerSaisie };
}
function herosParCle_(cle) {
  cle = String(cle || '').trim();
  if (cle.length < 8) return null;
  MEMO_ = {}; HEROS_ = null;
  return lireHeros_(SpreadsheetApp.getActive()).filter(function (h) { return h.cle && h.cle === cle; })[0] || null;
}
function doPost(e) {
  let rep;
  try {
    PROPS_ = null;
    var q = JSON.parse((e && e.postData && e.postData.contents) || '{}'), t0 = Date.now();
    var h = herosParCle_(q.cle);
    if (!h) {
      rep = { ok: false, erreur: 'CLE', message: 'Clé de héros inconnue' };
      const c = String(q.cle || '');
      journalErreur_('serveur', '?', 'CLE ' + (q.fn || ''), 'Clé refusée : « ' + (c ? c.slice(0, 4) + '…' : 'vide') + ' » (' + c.length + ' caractères)', '');
    }
    else if (q.fn === 'verifierCle') rep = { ok: true, data: { nom: h.nom, classe: h.classe } };
    else {
      const f = apiFonctions_()[q.fn];
      if (!f) rep = { ok: false, message: 'Action inconnue : ' + q.fn };
      else {
        const args = (Array.isArray(q.args) ? q.args : []).slice(0, f.length - 1);
        while (args.length < f.length - 1) args.push(null);
        args.push(h.nom); // le héros vient toujours de la clé, jamais de l'app
        rep = { ok: true, data: f.apply(null, args) };
        const duree = Date.now() - t0;
        if (duree > 20000 && !/^(signalerErreurs|maitreDuJeu|rebondissement|retrospective|chapitreEvolution|chroniqueSemaine|paroleBoss|motDuCoach|recitEvenement|carnetClaude|carnetTest)$/.test(q.fn)) journalErreur_('serveur', h.nom, q.fn, 'Lent : ' + Math.round(duree / 1000) + ' s', '');
      }
    }
  } catch (err) {
    rep = { ok: false, message: err && err.message ? err.message : String(err) };
    // les refus normaux (« plus de joker », « déjà fait »…) ne sont pas des pannes : on ne garde que l'inattendu
    if (!/^(OCCUPE|Plus de joker|Seules|On ne|Le décalage|Cette quête|Ce jour|Jours invalides|Palier|C'est déjà|Nom trop|Le nouveau nom|Plus rien|Déjà|Tu as déjà|Une fois)/.test(rep.message))
      journalErreur_('serveur', (h && h.nom) || '?', (q && q.fn) || '?', rep.message, err && err.stack ? String(err.stack).slice(0, 400) : '');
    else if (/^OCCUPE/.test(rep.message)) journalErreur_('serveur', (h && h.nom) || '?', (q && q.fn) || '?', 'Verrou occupé (attente > 28 s)', '');
  }
  return ContentService.createTextOutput(JSON.stringify(rep)).setMimeType(ContentService.MimeType.JSON);
}

/** Point d'entrée web : l'ancienne interface n'est servie qu'avec une clé valide (?cle=…). */
function doGet(e) {
  if (e && e.parameter && e.parameter.diag === '1') {
    let r; try { r = diagnostic(); } catch (x) { r = 'diagnostic impossible : ' + x.message; }
    return ContentService.createTextOutput('Diagnostic : ' + r + ' (détail dans l\'onglet « Diagnostic » du Sheet)');
  }
  // L'ancienne interface (fichier HTML d'Apps Script) n'existe plus : l'adresse mène toujours vers l'app GitHub
  return HtmlService.createHtmlOutput('<div style="font:16px Georgia,serif;text-align:center;padding:40px;color:#d4ad3c;background:#110e15;min-height:100vh">' +
    '<h2>☀ La Compagnie de l\'Aube</h2><p style="color:#efe3c8">L\'app se trouve ici :</p>' +
    '<p><a style="color:#d4ad3c" href="' + APP_PUBLIC_URL + '" target="_top">' + APP_PUBLIC_URL + '</a></p></div>')
    .setTitle('La Compagnie de l\'Aube').addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Icône de l'app (onglet du navigateur, raccourci sur l'écran d'accueil) : un d20 doré.
 * Au premier lancement, le script la dépose dans ton Drive (« Icône · La Compagnie de l'Aube.png »)
 * et la rend lisible par lien, sinon le navigateur ne peut pas l'afficher.
 */
function urlIcone_() {
  const props = props_();
  let id = props.getProperty('iconeId');
  try {
    if (id) { DriveApp.getFileById(id); return 'https://lh3.googleusercontent.com/d/' + id + '=s192'; }
  } catch (e) { id = null; } // fichier supprimé : on le recrée
  if (!ICONE_B64) return '';
  try {
    const blob = Utilities.newBlob(Utilities.base64Decode(ICONE_B64), 'image/png', 'Icône · La Compagnie de l\'Aube.png');
    const f = DriveApp.createFile(blob);
    f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    props.setProperty('iconeId', f.getId());
    return 'https://lh3.googleusercontent.com/d/' + f.getId() + '=s192';
  } catch (e) {
    console.warn('Icône non créée : ' + e.message);
    return '';
  }
}
/* L'icône d20 est déjà dans ton Drive (créée au premier lancement, id gardé dans les propriétés du script).
 * L'ancienne copie de l'image collée ici (très longue, plus utilisée par l'app GitHub) a été retirée pour alléger le fichier.
 * Si l'icône du Drive était supprimée, urlIcone_ renvoie simplement une adresse vide. */
const ICONE_B64 = '';

/* ====================== Journal des erreurs (pour tout réparer sans deviner) ======================
 * Chaque panne du serveur, chaque clé refusée et chaque erreur de l'app sur un téléphone est notée
 * dans l'onglet « Erreurs de l'app » (500 dernières lignes). Rien de secret n'y est écrit.
 */
const ONGLET_ERREURS = 'Erreurs de l\'app';
function journalErreur_(source, heros, contexte, message, detail, version) {
  try {
    const ss = SpreadsheetApp.getActive();
    let sh = ss.getSheetByName(ONGLET_ERREURS);
    if (!sh) {
      sh = ss.insertSheet(ONGLET_ERREURS);
      sh.getRange(1, 1, 1, 9).setValues([['Quand', 'Traité ?', 'Version', 'Source', 'Héros', 'Action', 'Message', 'Détail', 'Commentaire']]).setFontWeight('bold');
      sh.setFrozenRows(1);
    }
    const propre = function (t, n) { return String(t == null ? '' : t).replace(/sk-ant-[\w-]+/g, 'sk-ant-…').replace(/[A-Z]{3}-[A-Z0-9]{4}-[A-Z0-9]{4}/g, '•••').slice(0, n); };
    // Les colonnes sont retrouvées par leur titre (ligne 1) : on peut les réordonner dans le Sheet sans rien casser
    const titres = sh.getRange(1, 1, 1, Math.max(6, sh.getLastColumn())).getValues()[0].map(function (t) { return String(t).toLowerCase(); });
    const val = {
      quand: Utilities.formatDate(new Date(), tz_(ss), 'yyyy-MM-dd HH:mm:ss'), 'traité ?': 'Non', version: version || 'moteur v' + NUMERO_MOTEUR + ' · ' + VERSION_MOTEUR,
      source: source, 'héros': propre(heros, 40),
      action: propre(contexte, 80), message: propre(message, 500), 'détail': propre(detail, 500)
    };
    const ligne = titres.map(function (t) { return Object.prototype.hasOwnProperty.call(val, t) ? val[t] : ''; });
    if (titres.indexOf('quand') < 0) ligne.splice(0, 6, val.quand, source, val['héros'], val.action, val.message, val['détail']); // en-têtes absents : ancien ordre
    sh.appendRow(ligne);
    const n = sh.getLastRow();
    if (n > 600) sh.deleteRows(2, n - 500);
  } catch (e) { console.warn('journalErreur_ : ' + e.message); }
}
/** L'app envoie les erreurs vues sur le téléphone (au plus 20 à la fois). */
function signalerErreurs(liste, heros) {
  (Array.isArray(liste) ? liste : []).slice(0, 20).forEach(function (x) {
    x = x || {};
    journalErreur_('app ' + String(x.ou || '').slice(0, 20), heros, x.fn || x.ctx || '', x.msg || '', x.detail || '', (x.v ? 'app ' + x.v + ' · ' : '') + 'moteur v' + NUMERO_MOTEUR);
  });
  return true;
}

/**
 * Bilan de santé complet sur les VRAIES données : chaque fonction de l'app pour chaque héros,
 * le Journal, les onglets, les formules et les réglages. Résultat dans l'onglet « Diagnostic ».
 * À lancer depuis l'éditeur (fonction diagnostic) ou en ouvrant l'adresse de l'app avec ?diag=1.
 */
function diagnostic() {
  const ss = SpreadsheetApp.getActive(), out = [], t00 = Date.now();
  const note = function (zone, ok, msg, ms) { out.push([zone, ok ? '✅' : '❌', String(msg || '').slice(0, 400), ms == null ? '' : ms]); };
  const essai = function (zone, f) {
    const t0 = Date.now();
    try { const r = f(); note(zone, true, typeof r === 'string' ? r : 'ok', Date.now() - t0); return r; }
    catch (e) { note(zone, false, (e && e.message) || e, Date.now() - t0); return null; }
  };
  const heros = essai('Héros (Paramètres)', function () { const l = lireHeros_(ss); return l.map(function (h) { return h.nom + (h.cle ? ' (clé ok)' : ' (SANS CLÉ)') + (h.email ? '' : ' (sans e-mail)'); }).join(' · '); }) && lireHeros_(ss);
  (heros || []).forEach(function (h, i) {
    const autre = heros[(i + 1) % heros.length];
    const st = essai(h.nom + ' · getState', function () { const s = getState(h.nom); return 'niveau ' + s.niveau + ', ' + s.pv + ' PV, ' + s.habitudes.length + ' quêtes, ' + s.annexes.length + ' annexes'; });
    essai(h.nom + ' · getProfil (Life Grid)', function () { const p = getProfil(h.nom); return p.grille ? 'Life Grid ok (' + p.grille.length + ' cases)' : 'pas de Life Grid (date de naissance ? onglet ' + ongletHeros_('Life Grid') + ' ?)'; });
    if (autre && autre.nom !== h.nom) essai(h.nom + ' · fiche de ' + autre.nom, function () { const c = voirCompagnon(autre.nom, h.nom); return c.stats.length + ' caractéristiques, ' + c.habitudes.length + ' quêtes'; });
    if (h.nom === carnetHeros_(ss)) essai(h.nom + ' · Carnet', function () { const c = carnetCharger(h.nom); return c && c.json ? 'sauvegarde ' + Math.round(c.json.length / 1024) + ' ko' : 'vide'; });
    essai(h.nom + ' · doPost (vraie clé)', function () {
      const r = JSON.parse(doPost({ postData: { contents: JSON.stringify({ fn: 'verifierCle', args: [], cle: h.cle }) } }).getContent());
      if (!r.ok) throw new Error(r.message); return 'clé reconnue';
    });
  });
  essai('Déclencheurs', function () {
    const t = ScriptApp.getProjectTriggers().map(function (x) { return x.getHandlerFunction(); });
    if (t.indexOf('sauvegardeHebdo') < 0) throw new Error('sauvegarde du dimanche absente : exécuter installerSauvegarde (elle lance aussi le ménage)');
    return t.join(', ');
  });
  essai('Mémoire du script', function () {
    const o = PropertiesService.getScriptProperties().getProperties();
    const ko = Math.round(Object.keys(o).reduce(function (t, k) { return t + k.length + String(o[k]).length; }, 0) / 1024);
    if (ko > 400) throw new Error(ko + ' Ko sur 500 : le ménage du dimanche ne suffit plus');
    return ko + ' Ko sur 500 · ' + Object.keys(o).length + ' entrées';
  });
  // Journal
  essai('Journal', function () {
    const ctx = contexteJournal_(ss, tz_(ss)), noms = catalogue_(ss), pb = [];
    let orph = 0, inconnues = {}, doublons = 0; const vus = {};
    const v = ctx.journal.getRange(2, 1, ctx.journal.getMaxRows() - 1, 3).getValues();
    v.forEach(function (r) { if (r[0] !== '' && r[1] === '') orph++; });
    ctx.toutes.forEach(function (e) {
      if (e.quete && !noms[e.quete] && !/^(Trophée|Pacte|Encouragement|Retour du héros|Lexique|Bonus)/.test(e.quete) && e.statut !== 'Bonus') inconnues[e.quete] = 1;
      if (e.statut === 'Fait' && !e.archive) { const k = e.date + '|' + e.quete + '|' + (e.heros || ''); if (vus[k]) doublons++; vus[k] = 1; }
    });
    if (orph) pb.push(orph + ' ligne(s) vide(s) avec une date');
    if (Object.keys(inconnues).length) pb.push('quêtes inconnues : ' + Object.keys(inconnues).slice(0, 6).join(', '));
    if (doublons) pb.push(doublons + ' doublon(s) « Fait » le même jour');
    if (pb.length) throw new Error(pb.join(' · '));
    return ctx.toutes.length + ' saisies, rien d\'anormal';
  });
  // Formules en erreur dans les onglets
  ss.getSheets().forEach(function (sh) {
    const nom = sh.getName();
    if (nom === ONGLET_ERREURS || nom === 'Diagnostic' || nom === ONGLET_MEMOIRE || nom === ONGLET_SAGA_ARCHIVES) return;
    const n = Math.min(sh.getLastRow(), 400), c = Math.min(sh.getLastColumn(), 60);
    if (!n || !c) return;
    const d = sh.getRange(1, 1, n, c).getDisplayValues(), err = [];
    d.forEach(function (r, i) { r.forEach(function (x, j) { if (/^#(ERROR|REF|N\/A|VALUE|NAME|DIV\/0|NUM)/.test(x)) err.push(String.fromCharCode(65 + (j % 26)) + (i + 1) + ' ' + x); }); });
    if (err.length) note('Formules · ' + nom, false, err.length + ' cellule(s) en erreur : ' + err.slice(0, 6).join(', '));
  });
  note('Formules (tous les onglets)', true, 'vérifiées');
  // Quêtes : champs manquants
  essai('Quêtes du quotidien', function () {
    const pb = [];
    lireHabitudes_(ss).forEach(function (q) {
      if (!q.dd) pb.push(q.nom + ' : DD vide');
      if (q.type === 'Routine' && !q.jours.length) pb.push(q.nom + ' : routine sans jours');
      if (q.type !== 'Routine' && q.type !== 'Rythme') pb.push(q.nom + ' : type « ' + q.type + ' »');
      if (CARACS_.indexOf(q.carac) < 0) pb.push(q.nom + ' : caractéristique inconnue');
    });
    if (pb.length) throw new Error(pb.join(' · '));
    return 'ok';
  });
  // Réglages enregistrés lisibles
  essai('Mémoire de l\'app', function () {
    const all = props_().getProperties(), casses = [];
    Object.keys(all).forEach(function (k) { const v = all[k]; if (/^[\[{]/.test(v)) { try { JSON.parse(v); } catch (e) { casses.push(k); } } });
    if (casses.length) throw new Error('illisibles : ' + casses.join(', '));
    return Object.keys(all).length + ' entrées lisibles' + (all.CARNET_CLAUDE_KEY ? ', clé Claude présente' : ', PAS de clé Claude');
  });
  essai('Envois automatiques', function () { return ScriptApp.getProjectTriggers().map(function (t) { return t.getHandlerFunction(); }).join(', ') || 'aucun'; });
  note('Durée totale', true, Math.round((Date.now() - t00) / 1000) + ' s');
  let sh = ss.getSheetByName('Diagnostic');
  if (!sh) sh = ss.insertSheet('Diagnostic'); else sh.clearContents();
  sh.getRange(1, 1, 1, 4).setValues([['Zone (' + Utilities.formatDate(new Date(), tz_(ss), 'dd/MM HH:mm') + ')', 'État', 'Détail', 'ms']]).setFontWeight('bold');
  sh.getRange(2, 1, out.length, 4).setValues(out);
  return out.filter(function (r) { return r[1] === '❌'; }).length + ' problème(s) sur ' + out.length + ' contrôles';
}

/* ====================== Outils de date (texte AAAA-MM-JJ) ====================== */

function aujourdhui_() {
  return memo_('today', function () { return Utilities.formatDate(new Date(), tz_(SpreadsheetApp.getActive()), 'yyyy-MM-dd'); });
}
function versIso_(valeur, tz) {
  if (valeur instanceof Date) return Utilities.formatDate(valeur, tz, 'yyyy-MM-dd');
  return valeur === null || valeur === undefined ? '' : String(valeur);
}
function partiesIso_(iso) { return iso.split('-').map(Number); }
function isoPlus_(iso, n) {
  const p = partiesIso_(iso);
  const d = new Date(Date.UTC(p[0], p[1] - 1, p[2] + n));
  return d.getUTCFullYear() + '-' + ('0' + (d.getUTCMonth() + 1)).slice(-2) + '-' + ('0' + d.getUTCDate()).slice(-2);
}
/** Nombre de jours de a vers b (positif si b est après a). */
function ecart_(a, b) {
  const pa = partiesIso_(a), pb = partiesIso_(b);
  return Math.round((Date.UTC(pb[0], pb[1] - 1, pb[2]) - Date.UTC(pa[0], pa[1] - 1, pa[2])) / 864e5);
}
/** 0 = lundi … 6 = dimanche. */
function jourSemaine_(iso) {
  const p = partiesIso_(iso);
  return (new Date(Date.UTC(p[0], p[1] - 1, p[2])).getUTCDay() + 6) % 7;
}
function lundi_(iso) { return isoPlus_(iso, -jourSemaine_(iso)); }
function versDateSheet_(iso, tz) { return Utilities.parseDate(iso, tz, 'yyyy-MM-dd'); }

/* ====================== Mémoire de la requête (vitesse) ======================
 * Chaque appel au Sheet coûte ~50 à 150 ms. On lit donc chaque onglet une seule fois
 * par requête, et on garde le résultat ici. La mémoire repart de zéro à chaque appel de l'app.
 */
let MEMO_ = {};
/* Réglages du script (ScriptProperties) lus en UNE fois par requête puis gardés en mémoire :
 * une trentaine d'appels lents en moins à chaque ouverture. Les écritures partent tout de suite. */
let PROPS_ = null;
function props_() {
  if (PROPS_) return PROPS_;
  const P = PropertiesService.getScriptProperties();
  let tout = null;
  const charge = function () { if (!tout) tout = P.getProperties() || {}; return tout; };
  PROPS_ = {
    getProperty: function (k) { const a = charge(); return Object.prototype.hasOwnProperty.call(a, k) ? a[k] : null; },
    setProperty: function (k, v) { charge()[k] = String(v); P.setProperty(k, String(v)); return PROPS_; },
    deleteProperty: function (k) { delete charge()[k]; P.deleteProperty(k); return PROPS_; },
    getProperties: function () { return Object.assign({}, charge()); },
    getKeys: function () { return Object.keys(charge()); }
  };
  return PROPS_;
}
function memo_(cle, fn) { if (!(cle in MEMO_)) MEMO_[cle] = fn(); return MEMO_[cle]; }
function oublier_() { for (let i = 0; i < arguments.length; i++) delete MEMO_[arguments[i]]; }
function tz_(ss) { return memo_('tz', function () { return ss.getSpreadsheetTimeZone(); }); }

/* ====================== Lecture des données ====================== */

/**
 * Les réglages sont lus par plages nommées (Données → Plages nommées) : on peut réorganiser l'onglet Paramètres
 * sans casser le code. Pour aller vite, on lit tout l'onglet Paramètres d'un coup, et l'emplacement de chaque
 * plage nommée est gardé en cache (6 h). Si une ligne a bougé, le libellé de la colonne A ne correspond plus
 * et le plan est reconstruit tout seul.
 */
const CLE_PLAN = 'planParams-v3'; // v2 : P_HEROS va jusqu'à la colonne O (équilibrage)
function planNomme_(ss, forcer) {
  if (forcer) oublier_('plan');
  return memo_('plan', function () {
    const cache = CacheService.getScriptCache();
    if (!forcer) {
      const brut = cache.get(CLE_PLAN);
      if (brut) { try { return JSON.parse(brut); } catch (e) { /* on reconstruit */ } }
    }
    const plan = {}, g = grilleParams_(ss);
    const col = function (lettres) { let c = 0; for (let i = 0; i < lettres.length; i++) c = c * 26 + lettres.charCodeAt(i) - 64; return c; };
    ss.getSheetByName(ONGLET_PARAMETRES).getNamedRanges().forEach(function (n) {
      // Une seule lecture par plage : son adresse A1 (ex. « B4 » ou « R4:T39 »)
      const m = n.getRange().getA1Notation().match(/^([A-Z]+)(\d+)(?::([A-Z]+)(\d+))?$/);
      if (!m) return;
      const c1 = col(m[1]), r1 = Number(m[2]), c2 = m[3] ? col(m[3]) : c1, r2 = m[4] ? Number(m[4]) : r1;
      const une = r1 === r2 && c1 === c2;
      plan[n.getName()] = [r1, c1, r2 - r1 + 1, c2 - c1 + 1, une ? String((g[r1 - 1] || [])[0] || '') : null];
    });
    cache.put(CLE_PLAN, JSON.stringify(plan), 21600);
    return plan;
  });
}
function grilleParams_(ss) {
  return memo_('params', function () { return ss.getSheetByName(ONGLET_PARAMETRES).getDataRange().getValues(); });
}
/** Valeurs (tableau 2D) d'une plage nommée de Paramètres, sans nouvel appel au Sheet. null si elle n'existe pas. */
function bloc_(ss, nom, dejaReconstruit) {
  const plan = planNomme_(ss);
  const p = plan[nom];
  if (!p) {
    if (plan._absents && plan._absents[nom]) return null;          // déjà cherchée : elle n'existe pas
    if (!dejaReconstruit && !MEMO_.planRefait) {                    // plan en cache peut-être ancien : on le refait une fois
      MEMO_.planRefait = true; planNomme_(ss, true); return bloc_(ss, nom, true);
    }
    plan._absents = plan._absents || {}; plan._absents[nom] = true;  // retenue comme absente (jusqu'au prochain plan)
    CacheService.getScriptCache().put(CLE_PLAN, JSON.stringify(plan), 21600);
    return null;
  }
  const g = grilleParams_(ss);
  if (p[4] !== null && String((g[p[0] - 1] || [])[0] || '') !== p[4] && !dejaReconstruit && !MEMO_.planRefait) {
    MEMO_.planRefait = true; planNomme_(ss, true); return bloc_(ss, nom, true); // une ligne a bougé : on refait le plan
  }
  const out = [];
  for (let i = 0; i < p[2]; i++) {
    const ligne = g[p[0] - 1 + i] || [], r = [];
    for (let j = 0; j < p[3]; j++) { const v = ligne[p[1] - 1 + j]; r.push(v === undefined ? '' : v); }
    out.push(r);
  }
  return out;
}
/** Plage nommée pour ÉCRIRE : la copie mémoire de Paramètres est oubliée, elle sera relue ensuite. */
function param_(ss, nom) {
  const r = ss.getRangeByName(nom);
  if (!r) throw new Error('Plage nommée introuvable : ' + nom + ' (onglet Paramètres)');
  oublier_('params', 'Pbase');
  return r;
}
function val_(ss, nom) {
  const b = bloc_(ss, nom);
  if (!b) throw new Error('Plage nommée introuvable : ' + nom + ' (onglet Paramètres)');
  return b[0][0];
}
/** Variante tolérante : renvoie la valeur par défaut si la plage nommée n'existe pas. */
function valOpt_(ss, nom, defaut) { const b = bloc_(ss, nom); return b ? b[0][0] : defaut; }
/** À lancer depuis l'éditeur si un réglage semble ignoré après avoir déplacé des cellules de Paramètres. */
function viderCache() { CacheService.getScriptCache().removeAll([CLE_PLAN, 'urlSheet']); }

/* ====================== Héros de la Compagnie ======================
 * Paramètres → bloc « Fiches des héros » (plage nommée P_HEROS), une ligne par héros :
 *  A Nom · B Classe · C Favorite 1 · D Favorite 2 · E Bonus de classe · F Bonus épiques · G Bonus annexes
 *  H Naissance · I Devise · J E-mail du rappel · K Début du suivi · L Difficulté · M Difficulté depuis · N Apparence
 *  O Équilibrage XP (multiplie l'XP de base de toutes ses quêtes ; 1 = normal) · P Clé secrète de l'app
 * Sans ce bloc (ancien Sheet), un seul héros est lu dans les cases de Paramètres : tout marche comme avant.
 * Le 1er héros garde les noms historiques (onglet « Personnage », réglages « reglages »…) ;
 * le 2e utilise « Personnage 2 », « Life Grid 2 », « reglages|Nom »…
 */
let HEROS_ = null; // héros de la requête en cours

function lireHeros_(ss) {
  return memo_('listeHeros', function () {
    const tz = tz_(ss), liste = [];
    const b = bloc_(ss, 'P_HEROS');
    if (b) b.forEach(function (r, i) {
      const nom = String(r[0] || '').trim();
      if (!nom) return;
      liste.push({
        index: liste.length, ligne: i, nom: nom, classe: String(r[1] || ''), fav1: String(r[2] || ''), fav2: String(r[3] || ''),
        bonus: Number(r[4]) || 1, epiques: Number(r[5]) || 1, annexes: Number(r[6]) || 1,
        naissance: versIso_(r[7], tz), devise: String(r[8] || ''), email: String(r[9] || '').trim(), debut: versIso_(r[10], tz),
        difficulte: String(r[11] || 'Normal'), diffDepuis: versIso_(r[12], tz), look: String(r[13] || ''),
        equilibrage: r.length > 14 && Number(r[14]) > 0 ? Number(r[14]) : 1,
        cle: r.length > 15 ? String(r[15] || '').trim() : ''
      });
    });
    if (!liste.length) {
      liste.push({
        index: 0, ligne: -1, nom: String(ss.getSheetByName(ONGLET_PERSONNAGE).getRange('C4').getValue() || 'Héros'),
        classe: String(valOpt_(ss, 'P_CLASSE', '') || ''), fav1: String(valOpt_(ss, 'P_FAV1', '') || ''), fav2: String(valOpt_(ss, 'P_FAV2', '') || ''),
        bonus: Number(valOpt_(ss, 'P_BONUS_CLASSE', 1)) || 1, epiques: Number(valOpt_(ss, 'P_BONUS_EPIQUES', 1)) || 1, annexes: 1,
        naissance: versIso_(valOpt_(ss, 'P_NAISSANCE', ''), tz), devise: String(valOpt_(ss, 'P_DEVISE', '') || ''), email: '',
        debut: versIso_(valOpt_(ss, 'P_DEBUT_SUIVI', ''), tz), difficulte: String(valOpt_(ss, 'P_DIFFICULTE', 'Normal') || 'Normal'),
        diffDepuis: versIso_(valOpt_(ss, 'P_DIFFICULTE_DEPUIS', ''), tz), look: '', equilibrage: 1
      });
    }
    return liste;
  });
}
/** Fixe le héros de la requête (par son nom ; à défaut, le premier). */
function choisirHeros_(ss, nom) {
  const l = lireHeros_(ss);
  HEROS_ = l.filter(function (h) { return h.nom === nom; })[0] || l[0];
  return HEROS_;
}
function hc_() { return HEROS_ || choisirHeros_(SpreadsheetApp.getActive()); }
/** Clé de propriété du héros courant (le 1er garde les clés historiques). */
function cle_(k, h) { h = h || hc_(); return h.index === 0 ? k : k + '|' + h.nom; }
/** Onglet propre au héros courant : « Personnage », « Personnage 2 »… */
function ongletHeros_(nom, h) { h = h || hc_(); return h.index === 0 ? nom : nom + ' ' + (h.index + 1); }
/** Une quête (ou une période) appartient-elle au héros courant ? Vide = 1er héros ; « Les deux » / « Tous » = chacun. */
function estAMoi_(proprio, h) {
  h = h || hc_();
  const p = String(proprio === undefined || proprio === null ? '' : proprio).trim();
  return p === h.nom || p === 'Les deux' || p === 'Tous' || (p === '' && h.index === 0);
}
/** Écrit une case de la fiche du héros courant (colonne 0-based du bloc P_HEROS), ou l'ancienne case de Paramètres. */
function ecrireHeros_(ss, col, valeur) {
  const h = hc_();
  if (h.ligne >= 0) param_(ss, 'P_HEROS').offset(h.ligne, col, 1, 1).setValue(valeur);
  else {
    const anciens = { 8: 'P_DEVISE', 11: 'P_DIFFICULTE', 12: 'P_DIFFICULTE_DEPUIS' };
    if (!anciens[col]) throw new Error('Réglage indisponible sans le bloc Fiches des héros');
    param_(ss, anciens[col]).setValue(valeur);
  }
  oublier_('listeHeros');
  const nom = h.nom; HEROS_ = null; choisirHeros_(ss, nom);
}

/* ====================== Réglages de l'app (stockés côté script) ====================== */

/** Effets des modes de difficulté sur les règles de base de l'onglet Paramètres. */
const DIFFICULTES = {
  'Détendu': { pen: 0.5, jokers: 1, xp: 1, resume: 'PV perdus par raté ÷ 2 · 1 joker de plus par semaine' },
  'Normal': { pen: 1, jokers: 0, xp: 1, resume: 'Les règles de l\'onglet Paramètres, telles quelles' },
  'Héroïque': { pen: 1.5, jokers: -99, xp: 1.1, resume: 'PV perdus par raté × 1,5 · aucun joker · +10 % d\'XP' }
};
const DELAI_DIFFICULTE = 30; // jours minimum entre deux changements de difficulté

function lireReglages_(props, h) {
  let r = {};
  try { r = JSON.parse(props.getProperty(cle_('reglages', h)) || '{}'); } catch (e) { r = {}; }
  r.pauses = r.pauses || {};
  r.decalages = r.decalages || [];
  r.rappel = Object.assign({ actif: true, heure: 20, dimanche: true }, r.rappel || {});
  r.confort = Object.assign({ animations: true, vibrations: true }, r.confort || {});
  return r;
}
function ecrireReglages_(props, r, h) { props.setProperty(cle_('reglages', h), JSON.stringify(r)); }

/** Une période {debut, fin} contient-elle le jour d ? (fin vide = en cours) */
function dansPeriode_(p, d) { return ecart_(p.debut, d) >= 0 && (!p.fin || ecart_(d, p.fin) >= 0); }
function pausesDe_(P, nom) { return (P.pauses && P.pauses[nom]) || []; }
function enPause_(P, nom, d) { return pausesDe_(P, nom).some(function (p) { return dansPeriode_(p, d); }); }
/** Jours « gelés » pour une quête entre a et b inclus : vacances ou pause. */
function joursGeles_(P, nom, a, b) {
  let n = 0;
  for (let d = a; ecart_(d, b) >= 0; d = isoPlus_(d, 1)) if (enVacances_(P.vacances, d) || enPause_(P, nom, d)) n++;
  return n;
}
/** Une routine est-elle prévue le jour d, en tenant compte des séances décalées ? */
function estPrevu_(h, d, P) {
  const decs = (P.decalages || []).filter(function (x) { return x.nom === h.nom; });
  if (decs.some(function (x) { return x.a === d; })) return true;
  if (decs.some(function (x) { return x.de === d; })) return false;
  return h.jours.indexOf(CODES_JOURS[jourSemaine_(d)]) >= 0;
}

function lireVacances_(ss) {
  const tz = tz_(ss);
  return bloc_(ss, 'P_VACANCES')
    .map(function (r, i) { return { index: i, debut: versIso_(r[0], tz), fin: versIso_(r[1], tz), heros: r.length > 2 ? String(r[2] || '') : '' }; })
    .filter(function (v) { return v.debut !== '' && estAMoi_(v.heros); });
}
/** Ligne à écrire dans le tableau des vacances (3e colonne = héros, si le tableau l'a). */
function ligneVacances_(plage, debut, fin) {
  return plage.getNumColumns() > 2 ? [debut, fin, hc_().nom] : [debut, fin];
}
function enVacances_(vac, iso) {
  return vac.some(function (v) { return ecart_(v.debut, iso) >= 0 && (v.fin === '' || ecart_(iso, v.fin) >= 0); });
}
/** Nombre de jours de vacances entre a et b inclus. */
function joursVacances_(vac, a, b) {
  let n = 0;
  for (let d = a; ecart_(d, b) >= 0; d = isoPlus_(d, 1)) if (enVacances_(vac, d)) n++;
  return n;
}
/** Dernier jour de vacances strictement avant d (ou '' s'il n'y en a pas). */
function dernierJourVacances_(vac, d) {
  let res = '';
  const veille = isoPlus_(d, -1);
  vac.forEach(function (v) {
    if (ecart_(v.debut, veille) < 0) return;
    const fin = v.fin === '' || ecart_(veille, v.fin) > 0 ? veille : v.fin;
    if (res === '' || ecart_(res, fin) > 0) res = fin;
  });
  return res;
}

function lireParams_(ss, reglages) {
  const R = reglages || lireReglages_(props_());
  const base = memo_('Pbase', function () { return lireParamsSheet_(ss); });
  const H = hc_();
  const difficulte = DIFFICULTES[H.difficulte] ? H.difficulte : 'Normal';
  const D = DIFFICULTES[difficulte];
  const penBase = base.penBase;
  // Historique des changements de difficulté : un changement ne s'applique qu'à partir de sa date
  const histo = (R.histoDiff || []).filter(function (x) { return DIFFICULTES[x.niveau]; });
  const penJour = function (d) {
    let niv = difficulte;
    if (histo.length) {
      niv = histo[0].niveau;
      histo.forEach(function (x) { if (ecart_(x.depuis, d) >= 0) niv = x.niveau; });
    }
    return Math.round(penBase * (DIFFICULTES[niv] || D).pen);
  };
  const capa = capacitesHeros_(ss);
  return Object.assign({}, base, {
    capa: capa, // { niveau, roublard, depuis: {5: iso, 20: iso…} } : date à laquelle chaque capacité a été débloquée
    penJour: penJour, pauses: R.pauses, decalages: R.decalages,
    pen: Math.round(penBase * D.pen), jokers: Math.max(0, base.jokersBase + D.jokers), difficulte: difficulte, xpMult: D.xp,
    vacances: lireVacances_(ss),
    classe: { nom: H.classe, fav1: H.fav1, fav2: H.fav2, bonus: H.bonus, epiques: H.epiques, annexes: H.annexes }
  });
}

/** Partie de P qui ne dépend que de l'onglet Paramètres (lue une fois par requête). */
function lireParamsSheet_(ss) {
  const jokersBase = Number(val_(ss, 'P_JOKERS')) || 0;
  const paliers = bloc_(ss, 'P_PALIERS')
    .filter(function (r) { return r[0] !== '' && r[2] !== '' && !isNaN(Number(r[0])); })
    .map(function (r) { return { jours: Number(r[0]), nom: String(r[1]), bonus: Number(r[2]) }; })
    .sort(function (a, b) { return a.jours - b.jours; });
  return {
    penBase: Number(val_(ss, 'P_PV_RATE')) || 0, jokersBase: jokersBase,
    xpDD: Number(valOpt_(ss, 'P_XP_DD', 10)) || 10,
    mult: { Routine: Number(valOpt_(ss, 'P_MULT_ROUTINE', 0.75)) || 0.75, Rythme: Number(valOpt_(ss, 'P_MULT_RYTHME', 1)) || 1,
      Annexe: Number(valOpt_(ss, 'P_MULT_ANNEXE', 1.5)) || 1.5 },
    rend: [Number(valOpt_(ss, 'P_REND_1', 1)) || 1, Number(valOpt_(ss, 'P_REND_2', 0.5)) || 0.5, Number(valOpt_(ss, 'P_REND_3', 0.25)) || 0.25],
    a: Number(val_(ss, 'P_COURBE_A')), k: Number(val_(ss, 'P_COURBE_K')),
    xpParPoint: val_(ss, 'P_XP_POINT'), pvMax: val_(ss, 'P_PV_MAX'),
    soinHab: Number(val_(ss, 'P_SOIN_HABITUDE')) || 0,
    soinAnnexe: Number(val_(ss, 'P_SOIN_ANNEXE')) || 0,
    seuil: Number(val_(ss, 'P_SEUIL_EPUISE')) || 0,
    malus: Number(val_(ss, 'P_MALUS_EPUISE')) || 1,
    joursRelever: Number(val_(ss, 'P_JOURS_RELEVER')) || 3,
    pvReveil: Number(val_(ss, 'P_PV_RELEVE')) || 50,
    bonusRetour: Number(val_(ss, 'P_BONUS_RETOUR')) || 0,
    tolerance: Number(val_(ss, 'P_TOLERANCE')) || 0,
    paliers: paliers
  };
}

function lireHabitudes_(ss) {
  const brut = ss.getSheetByName(ONGLET_HABITUDES).getRange(LIGNE_QUETES, 1, 30, Math.min(18, ss.getSheetByName(ONGLET_HABITUDES).getMaxColumns())).getValues();
  const habs = brut
    .map(function (r, i) {
      return {
        ligne: i + LIGNE_QUETES, nom: r[0], proprio: String(r[16] || ''), dd: Number(r[4]) || 0, categorie: r[1], carac: r[2], carac2: r[3], type: r[5],
        joursTexte: String(r[6] || ''),
        jours: String(r[6] || '').split(',').map(function (s) { return s.trim(); }).filter(String),
        tousLes: Number(r[7]) || 0, xp: r[8], semaine: r[9], objectif: Number(r[10]) || 0,
        derniere: r[12], aFaire: r[13] === 'Oui', record: Number(r[15]) || 0, sous: String(r[17] || '')
      };
    })
    .filter(function (h) { return h.nom !== '' && estAMoi_(h.proprio); });
  habs.forEach(function (h) { h.xp = xpHeros_(ss, h.dd, h.type, h.carac, false, h.xp); });
  habs.brut = brut;
  return habs;
}

/** Lit le Journal : entrées existantes + lignes libres où écrire. */
function contexteJournal_(ss, tz) {
  const journal = ss.getSheetByName(ONGLET_JOURNAL);
  migrationRang_(journal);
  assouplirValidation_(journal);
  const valeurs = journal.getRange(2, 1, journal.getMaxRows() - 1, COLS_JOURNAL).getValues();
  const entrees = [], vides = [], toutes = [], orphelins = [];
  valeurs.forEach(function (r, i) {
    if (r[0] === '' && r[1] === '') { vides.push(i + 2); return; }
    // date sans quête (ligne à moitié effacée) : on la réutilise comme une ligne libre
    if (r[1] === '' && r[2] === '') { vides.push(i + 2); orphelins.push(i + 2); return; }
    const bonus = Number(r[11]) || 0;
    const e = {
      ligne: i + 2, date: versIso_(r[0], tz), quete: r[1], statut: r[2], note: String(r[3] || ''),
      xpFait: (Number(r[10]) || 0) - bonus, bonus: bonus, heros: String(r[13] || ''), carac: String(r[5] || ''), xpBase: Number(r[7]) || 0, mult: Number(r[12]) || 1,
      rang: r[8], incomplet: r[4] === '' || r[13] === '' // ligne tapée à la main, ou d'avant le figeage
    };
    const aMoi = e.heros === hc_().nom || (e.heros === '' && hc_().index === 0);
    // Ligne de cumul (Journal compacté) : rejouée comme ses n saisies d'origine pour les compteurs (titres, records, annexes faites)
    const n = Number(r[8]) || 0;
    if (e.note.indexOf(MARQUE_ARCHIVE) === 0 && n > 0) {
      const xp = Number(r[10]) || 0, noteOrig = e.statut === 'Bonus' ? e.note.replace(/^📦 \d+ × /, '') : '';
      for (let k = 0; k < n; k++) {
        const v = Object.assign({}, e, { note: noteOrig, archive: true, incomplet: false,
          xpFait: e.statut === 'Fait' ? xp / n : 0, bonus: e.statut === 'Bonus' ? xp / n : 0 });
        toutes.push(v); if (aMoi) entrees.push(v);
      }
      return;
    }
    toutes.push(e);
    // Une ligne sans héros appartient au 1er héros (historique d'avant la Compagnie)
    if (aMoi) entrees.push(e);
  });
  return { journal: journal, tz: tz, entrees: entrees, toutes: toutes, vides: vides, orphelins: orphelins, sale: false };
}

/**
 * XP de base d'une quête POUR LE HÉROS COURANT : DD × 10 × type × bonus de classe (carac. principale favorite)
 * × passif annexes (Opportuniste). Même calcul que la colonne « XP de base » du Sheet pour le 1er héros.
 */
function xpHeros_(ss, dd, type, carac, annexe, defaut) {
  if (!dd) return Number(defaut) || 0;
  const B = memo_('Pbase', function () { return lireParamsSheet_(ss); }), H = hc_();
  const m = annexe ? B.mult.Annexe : (B.mult[type] || 1);
  const fav = carac && (carac === H.fav1 || carac === H.fav2) ? H.bonus : 1;
  // Équilibrage : coefficient du héros (Paramètres → Fiches des héros, colonne O) pour que chacun progresse au même rythme
  return Math.round(dd * B.xpDD * m * fav * (annexe ? H.annexes : 1) * (H.equilibrage || 1));
}
/** Catalogue des quêtes (quotidien + annexes) : ce qu'on fige dans le Journal à chaque saisie. */
function catalogue_(ss) {
  return memo_('catalogue', function () {
    const cat = {};
    [[ONGLET_HABITUDES, 30, false], [ONGLET_ANNEXES, 40, true]].forEach(function (o) {
      ss.getSheetByName(o[0]).getRange(LIGNE_QUETES, 1, o[1], 9).getValues().forEach(function (r) {
        if (r[0] !== '' && !cat[r[0]]) cat[r[0]] = { cat: r[1], c1: r[2], c2: r[3], xp: Number(r[8]) || 0, dd: Number(r[4]) || 0, type: r[5], annexe: o[2] };
      });
    });
    try {
      const mj = lireMJ_(lundi_(aujourdhui_()));
      Object.keys((mj && mj.destins) || {}).forEach(function (h) {
        const q = mj.destins[h];
        if (q && q.nom && !cat[q.nom]) cat[q.nom] = { cat: 'Perso', c1: q.carac, c2: '', xp: 0, dd: q.dd, type: '', annexe: true, destin: true };
      });
    } catch (e) {}
    return cat;
  });
}
/** Valeurs figées E:H d'une saisie : catégorie, caracs et XP de base du héros courant à cet instant. */
function figer_(ss, quete, statut) {
  const q = catalogue_(ss)[quete];
  if (q) return [q.cat, q.c1, q.c2, xpHeros_(ss, q.dd, q.type, q.c1, q.annexe, q.xp)];
  return statut === 'Bonus' ? ['Bonus', '', '', 0] : ['?', '', '', 0];
}
/** Nom du héros courant, inscrit en colonne N du Journal. */
function heros_() { return hc_().nom; }

/** Ajoute une ligne dans le Journal (première ligne libre). */
function ajouter_(ctx, iso, quete, statut, note, bonus, mult) {
  if (!ctx.vides.length) {
    const avant = ctx.journal.getMaxRows();
    ctx.journal.insertRowsAfter(avant, 500);
    for (let r = avant + 1; r <= avant + 500; r++) ctx.vides.push(r);
  }
  const ligne = ctx.vides.shift();
  ctx.sale = true;
  const ss = SpreadsheetApp.getActive();
  const fige = figer_(ss, quete, statut);
  const rang = statut === 'Fait' ? rangDuJour_(ctx, iso, quete, heros_()) : '';
  ctx.journal.getRange(ligne, 1, 1, 9).setValues([[versDateSheet_(iso, ctx.tz), quete, statut, note].concat(fige).concat([rang])]);
  ctx.journal.getRange(ligne, 12, 1, 3).setValues([[bonus || '', mult && mult !== 1 ? mult : '', heros_()]]);
  // XP estimée tout de suite (la colonne K du Sheet la recalcule) : utile au journal des coups du boss
  ctx.entrees.push({ ligne: ligne, date: iso, quete: quete, statut: statut, note: note, heros: heros_(), carac: fige[1] || '', rang: rang,
    xpFait: statut === 'Fait' ? Math.round((Number(fige[3]) || 0) * (mult || 1)) : 0, bonus: bonus || 0 });
}

/** Efface une ligne du Journal et la rend disponible. */
function effacer_(ctx, entree) {
  ctx.sale = true;
  ctx.journal.getRange(entree.ligne, 1, 1, 9).clearContent();
  ctx.journal.getRange(entree.ligne, 12, 1, 3).clearContent();
  ctx.entrees.splice(ctx.entrees.indexOf(entree), 1);
  ctx.vides.unshift(entree.ligne);
  if (entree.statut === 'Fait') renumeroter_(ctx, entree.date, entree.quete, entree.heros || heros_());
}

/* ---------- Rang du jour (colonne I « N° du jour ») ----------
 * 1re validation d'une quête dans la journée = 100 %, 2e = 50 %, puis 25 % (colonne J).
 * Calculé à l'écriture : l'ancienne formule comparait chaque ligne à toutes les autres et ralentissait avec les années. */
const MARQUE_ARCHIVE = '📦 ';
function rangDuJour_(ctx, iso, quete, heros) {
  return 1 + ctx.entrees.concat(ctx.toutes || []).filter(function (e, i, t) {
    return t.indexOf(e) === i && !e.archive && e.statut === 'Fait' && e.date === iso && e.quete === quete && (e.heros || heros_()) === heros;
  }).length;
}
function renumeroter_(ctx, iso, quete, heros) {
  const l = ctx.entrees.filter(function (e) { return !e.archive && e.statut === 'Fait' && e.date === iso && e.quete === quete && (e.heros || heros_()) === heros; })
    .sort(function (a, b) { return a.ligne - b.ligne; });
  l.forEach(function (e, k) { if (Number(e.rang) !== k + 1) { e.rang = k + 1; ctx.journal.getRange(e.ligne, 9).setValue(k + 1); } });
}
/** Une fois : la formule de la colonne I est remplacée par ses valeurs (même règle, par héros). */
function migrationRang_(journal) {
  const props = props_();
  if (props.getProperty('migrationRang') === 'v1') return;
  const n = journal.getMaxRows() - 1;
  const v = journal.getRange(2, 1, n, COLS_JOURNAL).getValues();
  const vus = {};
  const rangs = v.map(function (r) {
    if (r[1] === '' || r[2] !== 'Fait') return [''];
    if (String(r[3] || '').indexOf(MARQUE_ARCHIVE) === 0) return [Number(r[8]) || 1];
    const k = String(r[0] instanceof Date ? r[0].getTime() : r[0]) + '|' + r[1] + '|' + r[13];
    vus[k] = (vus[k] || 0) + 1;
    return [vus[k]];
  });
  journal.getRange(2, 9, n, 1).setValues(rangs); // remplace l'ARRAYFORMULA de I2
  props.setProperty('migrationRang', 'v1');
}

/**
 * Colonne B du Journal : la liste déroulante des quêtes reste, mais elle n'est plus BLOQUANTE.
 * Sinon les lignes écrites par le moteur (« Encouragement de… », « Trophée : … », « Pacte tenu », « Lexique : … »,
 * quêtes du destin) étaient refusées par Google : erreur « ne respectent pas les règles de validation ».
 */
function assouplirValidation_(journal) {
  const props = props_();
  if (props.getProperty('validationJournal') === 'v1') return;
  try {
    const r = journal.getRange(2, 2, journal.getMaxRows() - 1, 1), v = r.getDataValidation();
    if (v && !v.getAllowInvalid()) r.setDataValidation(v.copy().setAllowInvalid(true).build());
  } catch (e) { journalErreur_('serveur', '', 'assouplirValidation', e.message, ''); }
  props.setProperty('validationJournal', 'v1');
}

function nomsAnnexes_(ss) {
  return memo_('nomsAnnexes', function () {
    const noms = {};
    ss.getSheetByName(ONGLET_ANNEXES).getRange(LIGNE_QUETES, 1, 40, 1).getValues()
      .forEach(function (r) { if (r[0] !== '') noms[r[0]] = true; });
    return noms;
  });
}

/**
 * Rejoue les points de vie jour par jour depuis le début, jusqu'au jour inclus.
 * Raté : −PV. Première validation du jour d'une habitude : +PV (plus pour une annexe).
 * À 0 PV : arc d'entraînement. Il faut X jours avec au moins une quête faite pour se relever.
 */
function simulerPV_(ctx, P, annexes, debut, jusqua) {
  let pv = P.pvMax, arc = null;
  // Journal compacté : on repart de l'état des PV mémorisé à la date de coupure (le détail d'avant n'existe plus)
  try {
    const cp = JSON.parse(props_().getProperty(cle_('pvDepart')) || 'null');
    if (cp && estIso_(cp.date) && ecart_(debut, cp.date) > 0 && ecart_(cp.date, isoPlus_(jusqua, 1)) >= 0) {
      debut = cp.date; pv = cp.pv; arc = cp.arc || null;
    }
  } catch (e) {}
  const retours = [], parJour = {}, esquives = {};
  ctx.entrees.forEach(function (e) {
    if (ecart_(debut, e.date) >= 0 && ecart_(e.date, jusqua) >= 0) (parJour[e.date] = parJour[e.date] || []).push(e);
  });
  for (let d = debut; ecart_(d, jusqua) >= 0; d = isoPlus_(d, 1)) {
    const ev = parJour[d] || [];
    if (arc) {
      if (ev.some(function (e) { return e.statut === 'Fait'; })) arc.jours++;
      if (arc.jours >= P.joursRelever) { pv = P.pvReveil; retours.push(d); arc = null; }
      continue;
    }
    const soignes = {};
    ev.forEach(function (e) {
      if (e.statut === 'Raté' && esquive_(P, e, esquives)) return; // Esquive : ce raté ne coûte aucun PV
      if (e.statut === 'Raté') pv -= P.penJour ? P.penJour(d) : P.pen;
      else if (e.statut === 'Fait' && !soignes[e.quete]) {
        soignes[e.quete] = true;
        pv += annexes[e.quete] ? P.soinAnnexe : P.soinHab;
      }
    });
    pv = Math.max(0, Math.min(P.pvMax, pv));
    if (pv === 0) arc = { debut: d, jours: 0 };
  }
  return { pv: pv, arc: arc, retours: retours };
}

/** Multiplicateur d'XP selon l'état du héros ce jour-là (Épuisé ou à terre). */
function multiplicateurEtat_(ctx, P, annexes, debut, iso) {
  const s = simulerPV_(ctx, P, annexes, debut, iso);
  return (s.arc || s.pv < P.seuil) ? P.malus : 1;
}

function jokersUtilises_(ctx, iso) {
  const lun = lundi_(iso), dim = isoPlus_(lun, 6);
  return ctx.entrees.filter(function (e) {
    return e.statut === 'Repos' && e.note.indexOf('Joker') === 0 && e.note.indexOf('Joker (relique') !== 0
      && ecart_(lun, e.date) >= 0 && ecart_(e.date, dim) >= 0;
  }).length;
}
/** Relique du boss du mois : +1 joker utilisable une fois pendant le mois qui suit la victoire. */
function reliqueDispo_(ctx, iso) {
  const bn = beneditionDu_(iso);
  if (bn && bn.type === 'joker') {
    const lun = lundi_(iso);
    const pris = ctx.entrees.some(function (e) { return e.statut === 'Repos' && e.note.indexOf('Joker (relique') === 0 && ecart_(lun, e.date) >= 0 && ecart_(e.date, isoPlus_(lun, 6)) >= 0; });
    if (!pris) return { mois: String(iso).slice(0, 7), nom: 'Bénédiction du Maître du Jeu' };
  }
  let r = null;
  try { r = JSON.parse(props_().getProperty(cle_('relique')) || 'null'); } catch (e) {}
  if (!r || r.mois !== String(iso).slice(0, 7)) return null;
  const utilisee = ctx.entrees.some(function (e) {
    return e.statut === 'Repos' && e.note.indexOf('Joker (relique') === 0 && String(e.date).slice(0, 7) === r.mois;
  });
  return utilisee ? null : r;
}

/* ====================== Règle unique : la quête est-elle due ? ======================
 * Une seule fonction décide, pour l'écran Quêtes, le rappel du soir et les ratés automatiques.
 * Ce qui est affiché « à faire » est exactement ce qui sera compté raté si ce n'est pas fait.
 */

/** Dernière saisie (Fait, Raté ou Repos) d'une quête strictement avant le jour d, ou ''. */
function derniereSaisie_(ctx, nom, d) {
  if (!ctx.parQuete) {
    ctx.parQuete = {};
    ctx.entrees.forEach(function (e) {
      if (['Fait', 'Raté', 'Repos'].indexOf(e.statut) >= 0) (ctx.parQuete[e.quete] = ctx.parQuete[e.quete] || []).push(e.date);
    });
  }
  let res = '';
  (ctx.parQuete[nom] || []).forEach(function (x) { if (ecart_(x, d) > 0 && (res === '' || ecart_(res, x) > 0)) res = x; });
  return res;
}

/**
 * Échéance d'une quête du quotidien le jour d :
 *  { du: true/false, gele: vacances ou pause, marge: (Rythme) jours restants avant un raté, 0 = dernier jour }
 */
function echeance_(h, d, ctx, P, debut) {
  if (enVacances_(P.vacances, d) || enPause_(P, h.nom, d)) return { du: false, gele: true };
  if (h.type === 'Routine') return { du: estPrevu_(h, d, P) };
  if (h.type === 'Rythme' && h.tousLes > 0) {
    let ref = isoPlus_(debut, -1); // au début du suivi, on compte comme si la quête venait d'être faite
    const der = derniereSaisie_(ctx, h.nom, d);
    if (der !== '' && ecart_(ref, der) > 0) ref = der;
    const retour = dernierJourVacances_(P.vacances, d); // le compteur repart au retour de vacances…
    if (retour !== '' && ecart_(ref, retour) > 0) ref = retour;
    const repriseP = dernierJourVacances_(pausesDe_(P, h.nom), d); // … et à la fin d'une pause
    if (repriseP !== '' && ecart_(ref, repriseP) > 0) ref = repriseP;
    const e = ecart_(ref, d);
    return { du: e >= h.tousLes, marge: h.tousLes + P.tolerance + (maitrise_(P, h) ? 1 : 0) - e };
  }
  return { du: false };
}

/** Prochain jour (après d) où la quête sera due, dans les 60 jours, ou ''. */
function prochaineEcheance_(h, d, ctx, P, debut) {
  for (let k = 1; k <= 60; k++) {
    const j = isoPlus_(d, k);
    if (echeance_(h, j, ctx, P, debut).du) return j;
  }
  return '';
}

/* ====================== Mécaniques automatiques ====================== */

/** Ratés automatiques pour chaque jour entre le dernier contrôle et hier. */
function controlerRates_(ctx, habs, P, annexes, debut, depuis, hier) {
  for (let d = depuis; ecart_(d, hier) >= 0; d = isoPlus_(d, 1)) {
    if (ecart_(debut, d) < 0) continue;
    // Pendant les vacances et l'arc d'entraînement, pas de ratés automatiques
    if (enVacances_(P.vacances, d)) continue;
    if (simulerPV_(ctx, P, annexes, debut, isoPlus_(d, -1)).arc) continue;
    habs.forEach(function (h) {
      const dejaSaisi = ctx.entrees.some(function (e) { return e.quete === h.nom && e.date === d; });
      if (dejaSaisi) return;
      const ech = echeance_(h, d, ctx, P, debut); // même règle que l'écran Quêtes
      // Routine : raté si elle était prévue · Rythme : raté le dernier jour de la marge (tolérance comprise)
      const rate = !ech.gele && (h.type === 'Routine' ? ech.du : ech.marge !== undefined && ech.marge <= 0);
      if (!rate) return;
      if (jokersUtilises_(ctx, d) < P.jokers) ajouter_(ctx, d, h.nom, 'Repos', 'Joker (auto)', 0);
      else if (reliqueDispo_(ctx, d)) ajouter_(ctx, d, h.nom, 'Repos', 'Joker (relique, auto)', 0);
      else ajouter_(ctx, d, h.nom, 'Raté', 'Raté (auto)', 0);
      ctx.parQuete = null; // la nouvelle saisie compte pour les jours suivants
    });
  }
}

/** Calcule la série de chaque habitude et attribue les bonus de paliers. */
function calculerSeries_(ctx, habs, P, today) {
  const series = {}, nouveaux = [];
  const ombre = ratesPasDeLOmbre_(ctx, P);
  habs.forEach(function (h) {
    const e = ctx.entrees.filter(function (x) { return x.quete === h.nom; });
    let dernierRate = '';
    e.forEach(function (x) {
      if (x.statut === 'Raté' && ombre.indexOf(x) < 0 && (dernierRate === '' || ecart_(dernierRate, x.date) > 0)) dernierRate = x.date;
    });
    const faits = e.filter(function (x) {
      return x.statut === 'Fait' && (dernierRate === '' || ecart_(dernierRate, x.date) > 0);
    }).map(function (x) { return x.date; });
    if (!faits.length) { series[h.nom] = { jours: 0, nb: 0, record: h.record }; return; }
    let debutSerie = faits[0];
    faits.forEach(function (f) { if (ecart_(f, debutSerie) > 0) debutSerie = f; });
    const nb = faits.filter(function (f, i) { return faits.indexOf(f) === i; }).length;
    const jours = ecart_(debutSerie, today) + 1 - joursGeles_(P, h.nom, debutSerie, today);
    series[h.nom] = { jours: jours, nb: nb, record: Math.max(h.record, jours) };
    if (nb < 2) return; // un bonus de série demande au moins 2 validations
    P.paliers.forEach(function (p) {
      if (p.jours > jours) return;
      const note = 'Série ' + p.nom;
      const deja = e.some(function (x) { return x.statut === 'Bonus' && x.note === note && ecart_(debutSerie, x.date) >= 0; });
      if (deja) return;
      const bonus = maitrise_(P, h) ? Math.round(p.bonus * 1.5) : p.bonus;
      ajouter_(ctx, today, h.nom, 'Bonus', note, bonus);
      nouveaux.push({ titre: '🔥 Série ' + p.nom, texte: h.nom + ' · +' + bonus + ' XP' });
    });
  });
  return { series: series, nouveaux: nouveaux };
}

/** Résumé d'une semaine (lundi → dimanche). */
function bilan_(ctx, habs, lun, P) {
  const dim = isoPlus_(lun, 6);
  // Une quête mise en pause pendant la semaine ne compte pas dans « habitudes à jour »
  if (P) habs = habs.filter(function (h) {
    for (let d = lun; ecart_(d, dim) >= 0; d = isoPlus_(d, 1)) if (enPause_(P, h.nom, d)) return false;
    return true;
  });
  const e = ctx.entrees.filter(function (x) { return ecart_(lun, x.date) >= 0 && ecart_(x.date, dim) >= 0; });
  const xp = e.reduce(function (s, x) { return s + (x.statut === 'Fait' ? x.xpFait : 0) + x.bonus; }, 0);
  const aJour = habs.filter(function (h) {
    return e.filter(function (x) { return x.quete === h.nom && x.statut === 'Fait'; }).length >= h.objectif;
  }).length;
  return {
    lundi: lun, dimanche: dim, xp: Math.round(xp),
    faits: e.filter(function (x) { return x.statut === 'Fait'; }).length,
    rates: e.filter(function (x) { return x.statut === 'Raté'; }).length,
    jokers: e.filter(function (x) { return x.statut === 'Repos' && x.note.indexOf('Joker') === 0; }).length,
    bonus: e.filter(function (x) { return x.statut === 'Bonus'; }).length,
    aJour: aJour, total: habs.length
  };
}

/** Archive dans l'onglet Bilans chaque semaine terminée et pas encore archivée. */
function archiverSemaines_(ss, ctx, habs, P, props, debut, hier) {
  const onglet = ss.getSheetByName(ONGLET_BILANS);
  if (!onglet) return;
  const derniere = props.getProperty(cle_('semaineArchivee'));
  let w = derniere ? isoPlus_(derniere, 7) : lundi_(debut);
  while (ecart_(isoPlus_(w, 6), hier) >= 0) {
    const b = bilan_(ctx, habs, w, P);
    const cumul = ctx.entrees.reduce(function (s, x) {
      return ecart_(x.date, b.dimanche) >= 0 ? s + (x.statut === 'Fait' ? x.xpFait : 0) + x.bonus : s;
    }, 0);
    const niveau = Math.max(1, Math.floor(Math.pow(cumul / P.a, 1 / P.k)));
    // Première ligne vide de la colonne A sous l'en-tête (le résumé à droite ne gêne pas)
    const colA = onglet.getRange(LIGNE_QUETES, 1, Math.max(1, onglet.getMaxRows() - LIGNE_QUETES + 1), 1).getValues();
    let libre = colA.findIndex(function (r) { return r[0] === ''; });
    if (libre < 0) { onglet.insertRowsAfter(onglet.getMaxRows(), 100); libre = colA.length; }
    onglet.getRange(LIGNE_QUETES + libre, 1, 1, 9).setValues([[versDateSheet_(b.lundi, ctx.tz), versDateSheet_(b.dimanche, ctx.tz), b.xp, b.faits,
      b.rates, b.jokers, b.aJour + ' / ' + b.total, Math.round(cumul), niveau]]);
    if (onglet.getMaxColumns() >= 10 && lireHeros_(ss).length > 1) onglet.getRange(LIGNE_QUETES + libre, 10).setValue(heros_());
    props.setProperty(cle_('semaineArchivee'), w);
    w = isoPlus_(w, 7);
  }
}

/** Date de début du suivi du héros : sa fiche (ou P_DEBUT_SUIVI) si elle est remplie, sinon sa première ouverture de l'app. */
function debutSuivi_(ss, props, today) {
  const saisie = hc_().debut;
  let debut = /^\d{4}-\d{2}-\d{2}$/.test(saisie) ? saisie : props.getProperty(cle_('debut'));
  if (!debut) debut = today;
  if (props.getProperty(cle_('debut')) !== debut) {
    props.setProperty(cle_('debut'), debut);
    props.setProperty(cle_('verifie'), isoPlus_(debut, -1));
    props.deleteProperty(cle_('semaineArchivee'));
  }
  return debut;
}

/** Contrôle complet : ratés, séries, bonus, archives. */
function entretien_(ss) {
  const tz = tz_(ss);
  const today = aujourdhui_();
  const hier = isoPlus_(today, -1);
  const props = props_();
  const debut = debutSuivi_(ss, props, today);
  const reglages = lireReglages_(props);
  // Les séances décalées de plus de 2 semaines ne servent plus : on les oublie
  const avantNettoyage = reglages.decalages.length;
  reglages.decalages = reglages.decalages.filter(function (x) { return ecart_(x.a, today) <= 14 || ecart_(x.de, today) <= 14; });
  if (reglages.decalages.length !== avantNettoyage) ecrireReglages_(props, reglages);
  const P = lireParams_(ss, reglages);
  const habs = lireHabitudes_(ss);
  const ctx = contexteJournal_(ss, tz);
  const annexes = nomsAnnexes_(ss);

  // Lignes à moitié effacées (date sans quête) : on les vide pour de bon
  (ctx.orphelins || []).forEach(function (l) { ctx.journal.getRange(l, 1, 1, COLS_JOURNAL).clearContent(); ctx.sale = true; });
  ctx.orphelins = [];
  // Lignes du Journal sans valeurs figées (tapées à la main dans le Sheet) : on les complète
  ctx.entrees.forEach(function (e) {
    if (!e.incomplet) return;
    ctx.sale = true;
    ctx.journal.getRange(e.ligne, 5, 1, 4).setValues([figer_(ss, e.quete, e.statut)]);
    ctx.journal.getRange(e.ligne, 14).setValue(heros_());
    e.incomplet = false;
    e.heros = heros_();
  });
  ctx.entrees.filter(function (e) { return !e.archive && e.statut === 'Fait' && e.rang === ''; })
    .forEach(function (e) { ctx.sale = true; renumeroter_(ctx, e.date, e.quete, e.heros || heros_()); });
  // Ménage de la semaine (mémoire du script, calendrier des boss) si le déclencheur du dimanche n'est pas passé
  const menage = props.getProperty('menageLe');
  if (!estIso_(menage) || ecart_(menage, today) >= 7) { try { menageLeger_(ss); } catch (e) { journalErreur_('serveur', heros_(), 'menage', e.message, ''); } }

  // Les ratés automatiques ne se contrôlent qu'une fois par jour (à la première ouverture)
  const verifie = props.getProperty(cle_('verifie'));
  if (verifie !== hier) {
    let depuis = isoPlus_(verifie || hier, 1);
    if (ecart_(depuis, hier) > 31) depuis = isoPlus_(hier, -31);
    controlerRates_(ctx, habs, P, annexes, debut, depuis, hier);
    props.setProperty(cle_('verifie'), hier);
  }

  const res = calculerSeries_(ctx, habs, P, today);
  // Échéance du jour, par la règle unique
  const echeances = {};
  habs.forEach(function (h) {
    const ech = echeance_(h, today, ctx, P, debut);
    ech.prochaine = prochaineEcheance_(h, today, ctx, P, debut);
    echeances[h.nom] = ech;
  });
  // Colonnes N (à faire), O (série) et P (record) de l'onglet : écrites seulement si quelque chose a changé
  let change = false;
  const sortie = habs.brut.map(function (r) {
    const s = res.series[r[0]], ech = echeances[r[0]];
    const partageAutre = hc_().index > 0 && String(r[16] || '').trim() !== hc_().nom;
    if (!s || partageAutre) return [r[13], r[14], r[15]];
    const v = s ? [ech.gele ? (enVacances_(P.vacances, today) ? 'Vacances' : 'Pause') : ech.du ? 'Oui' : 'Non', s.jours, s.record] : ['', '', ''];
    if (String(r[13]) !== String(v[0]) || String(r[14]) !== String(v[1]) || String(r[15]) !== String(v[2])) change = true;
    return v;
  });
  if (change) ss.getSheetByName(ONGLET_HABITUDES).getRange(LIGNE_QUETES, 14, 30, 3).setValues(sortie);

  // Points de vie : bonus « Retour du héros » à chaque sortie d'arc, puis PV du jour dans Personnage
  let pvEtat = simulerPV_(ctx, P, annexes, debut, today);
  pvEtat.retours.forEach(function (d) {
    const deja = ctx.entrees.some(function (x) { return x.statut === 'Bonus' && x.note === 'Retour du héros' && x.date === d; });
    if (deja) return;
    ajouter_(ctx, d, 'Retour du héros', 'Bonus', 'Retour du héros', P.bonusRetour);
    res.nouveaux.push({ titre: '⚔️ Le héros se relève', texte: '+' + P.bonusRetour + ' XP · PV remontés à ' + P.pvReveil });
  });
  // Boss du Crépuscule : victoire détectée ici (XP de la victoire ajoutée au Journal avant la lecture du bloc Personnage)
  let bossEtat = null;
  try { bossEtat = combatsDuJour_(ss, ctx, today, res.nouveaux); } catch (e) { console.warn('Boss : ' + e); }
  // Titres (hauts faits) : vérifiés après toutes les saisies du jour
  let titresEtat = null;
  try { titresEtat = titres_(ss, { ctx: ctx, habs: habs, P: P, series: res.series, echeances: echeances, debut: debut, props: props }, today, res.nouveaux); }
  catch (e) { console.warn('Titres : ' + e); }
  // Bloc Personnage B4:G24 lu en une fois, après toutes les écritures du Journal
  const perso = ss.getSheetByName(ongletHeros_(ONGLET_PERSONNAGE));
  if (!perso) throw new Error('Onglet « ' + ongletHeros_(ONGLET_PERSONNAGE) + ' » introuvable : il faut créer le moteur de ce héros.');
  const blocPerso = perso.getRange('B4:G24').getValues();
  if (Number(blocPerso[2][5]) !== pvEtat.pv || blocPerso[2][5] === '') perso.getRange('G6').setValue(pvEtat.pv);

  if (verifie !== hier || !props.getProperty(cle_('semaineArchivee'))) archiverSemaines_(ss, ctx, habs, P, props, debut, hier);
  return { boss: bossEtat, titres: titresEtat, ctx: ctx, habs: habs, P: P, series: res.series, nouveaux: res.nouveaux, today: today, pvEtat: pvEtat, debut: debut,
    reglages: reglages, props: props, blocPerso: blocPerso, habsAJour: !ctx.sale, echeances: echeances };
}

/* ====================== État renvoyé à l'app ====================== */

function etat_(ss, nouveauxEnPlus) {
  const ent = entretien_(ss);
  const tz = ent.ctx.tz, today = ent.today, P = ent.P;
  const bp = ent.blocPerso; // B4:G24 → bp[ligne - 4][colonne - B]

  // Saisies du jour, par quête
  const duJour = {};
  ent.ctx.entrees.forEach(function (e) {
    if (e.date !== today) return;
    const h = duJour[e.quete] || (duJour[e.quete] = { fait: 0, rate: 0, repos: 0 });
    if (e.statut === 'Fait') h.fait++;
    else if (e.statut === 'Raté') h.rate++;
    else if (e.statut === 'Repos') h.repos++;
  });
  const vide = function () { return { fait: 0, rate: 0, repos: 0 }; };

  // Faites cette semaine, dernière fois, nombre total : comptés pour CE héros (une quête peut être partagée)
  const lunCourant = lundi_(today), dimCourant = isoPlus_(lunCourant, 6);
  const bilanCourant = moisBilan_(today);
  const compte = {};
  ent.ctx.entrees.forEach(function (e) {
    if (e.statut !== 'Fait') return;
    const c = compte[e.quete] || (compte[e.quete] = { semaine: 0, total: 0, mois: 0, bilan: 0, derniere: '' });
    c.total++;
    if (String(e.date).slice(0, 7) === today.slice(0, 7)) c.mois++;
    if (moisBilan_(e.date) === bilanCourant) c.bilan++;
    if (ecart_(lunCourant, e.date) >= 0 && ecart_(e.date, dimCourant) >= 0) c.semaine++;
    if (c.derniere === '' || ecart_(c.derniere, e.date) > 0) c.derniere = e.date;
  });
  const cpt = function (nom) { return compte[nom] || { semaine: 0, total: 0, mois: 0, bilan: 0, derniere: '' }; };
  const habitudes = (ent.habsAJour ? ent.habs : lireHabitudes_(ss)).map(function (h) {
    const s = ent.series[h.nom] || { jours: 0, nb: 0, record: h.record };
    const pause = enPause_(P, h.nom, today);
    const decs = P.decalages.filter(function (x) {
      return x.nom === h.nom && (ecart_(lunCourant, x.de) >= 0 || ecart_(lunCourant, x.a) >= 0) && (ecart_(x.de, dimCourant) >= 0 || ecart_(x.a, dimCourant) >= 0);
    });
    const ech = ent.echeances[h.nom] || echeance_(h, today, ent.ctx, P, ent.debut);
    return {
      enPause: pause, decalages: decs,
      prochaine: ech.prochaine || '', marge: ech.marge === undefined ? null : ech.marge,
      nom: h.nom, sous: h.sous || '', categorie: h.categorie, carac: h.carac, carac2: h.carac2, type: h.type,
      jours: h.joursTexte, tousLes: h.tousLes, xp: h.xp, semaine: cpt(h.nom).semaine, objectif: h.objectif,
      derniere: cpt(h.nom).derniere || 'Jamais', aFaire: ech.du,
      serie: s.jours, serieNb: s.nb, record: s.record, jour: duJour[h.nom] || vide()
    };
  });

  const shA = ss.getSheetByName(ONGLET_ANNEXES);
  const lignesA = shA.getRange(LIGNE_QUETES, 1, 40, Math.min(15, shA.getMaxColumns())).getValues();
  // Colonne L « Palier de » : les quêtes d'un même groupe s'excluent (un seul palier validé par mois)
  const groupeFait = {};
  lignesA.forEach(function (r) {
    const g = String(r[11] || '').trim();
    if (g && r[0] !== '' && estAMoi_(r[12]) && (r[5] === 'Fin de mois' ? cpt(r[0]).bilan : cpt(r[0]).mois) > 0) groupeFait[g] = true;
  });
  const annexes = lignesA
    .filter(function (r) {
      if (r[0] === '' || !estAMoi_(r[12])) return false;
      if (duJour[r[0]]) return true;
      const des = versIso_(r[14], tz); // « Disponible dès le » : cachée avant
      if (estIso_(des) && ecart_(today, des) > 0) return false;
      // quête d'événement (fenêtre « dès le » + échéance, ex. un voyage) : cachée une fois la fenêtre passée
      const ech = versIso_(r[6], tz);
      if (estIso_(des) && estIso_(ech) && ecart_(ech, today) > 0) return false;
      if (String(r[11] || '').trim() && groupeFait[String(r[11]).trim()]) return false; // un autre palier a déjà été choisi ce mois-ci
      if (r[5] === 'Mensuel') return cpt(r[0]).mois === 0; // une fois par mois calendaire
      if (r[5] === 'Fin de mois') return fenetreBilan_(today) && cpt(r[0]).bilan === 0; // bilan du mois qui se termine
      return r[5] === 'Oui' || cpt(r[0]).total === 0;
    })
    .map(function (r) {
      return {
        nom: r[0], sous: String(r[13] || ''), categorie: r[1], carac: r[2], carac2: r[3], repetable: r[5] === 'Oui', mensuel: r[5] === 'Mensuel' || r[5] === 'Fin de mois', finDeMois: r[5] === 'Fin de mois',
        moisBilan: r[5] === 'Fin de mois' ? bilanCourant : '', groupe: String(r[11] || '').trim(),
        echeance: versIso_(r[6], tz), note: r[7], xp: xpHeros_(ss, Number(r[4]) || 0, '', r[2], true, r[8]), fois: cpt(r[0]).total, statut: r[10],
        jour: duJour[r[0]] || vide()
      };
    });

  // Quêtes annexes qui ouvrent dans les 14 prochains jours (ex. un voyage) : montrées en aperçu, pas encore validables
  const annexesAVenir = lignesA.filter(function (r) {
    if (r[0] === '' || !estAMoi_(r[12])) return false;
    const des = versIso_(r[14], tz);
    return estIso_(des) && ecart_(today, des) > 0 && ecart_(today, des) <= 14;
  }).map(function (r) {
    return { nom: r[0], sous: String(r[13] || ''), carac: r[2], des: versIso_(r[14], tz), echeance: versIso_(r[6], tz),
      xp: xpHeros_(ss, Number(r[4]) || 0, '', r[2], true, r[8]) };
  }).sort(function (a, b) { return a.des < b.des ? -1 : 1; }).slice(0, 15);

  // Quête du destin de la semaine (écrite par le Maître du Jeu) : une quête annexe unique, valable jusqu'à dimanche
  try {
    const qd = queteDestin_(today, hc_().nom);
    if (qd) {
      const lunQ = lundi_(today);
      const faiteSemaine = ent.ctx.entrees.some(function (e) { return e.quete === qd.nom && e.statut === 'Fait' && ecart_(lunQ, e.date) >= 0; });
      if (!faiteSemaine || duJour[qd.nom]) annexes.unshift({
        nom: qd.nom, sous: qd.desc, categorie: 'Perso', carac: qd.carac, carac2: '', repetable: false, mensuel: false, finDeMois: false, groupe: '',
        destin: true, echeance: isoPlus_(lunQ, 6), note: '', xp: xpHeros_(ss, qd.dd, '', qd.carac, true, 0), fois: faiteSemaine ? 1 : 0, statut: '', jour: duJour[qd.nom] || vide()
      });
    }
  } catch (e) { console.warn('Destin : ' + e); }

  const shO = ss.getSheetByName(ONGLET_OBJECTIFS);
  const objectifs = shO.getRange(LIGNE_QUETES, 1, 20, Math.min(17, shO.getMaxColumns())).getValues()
    .filter(function (r) {
      if (r[0] === '' || !estAMoi_(r[15])) return false;
      const deb = versIso_(r[3], tz); // une quête épique apparaît 7 jours avant son début (« Commence le … »)
      return !(estIso_(deb) && ecart_(today, deb) > 7);
    })
    .map(function (r) {
      return {
        nom: r[0], sous: String(r[16] || ''), categorie: r[1], habitude: r[2], debut: versIso_(r[3], tz), echeance: versIso_(r[4], tz),
        visees: r[5], recompense: r[6], faites: r[7], progression: Number(r[8]) || 0,
        temps: Number(r[9]) || 0, statut: estIso_(versIso_(r[3], tz)) && ecart_(today, versIso_(r[3], tz)) > 0 ? 'À venir' : r[10]
      };
    });

  const stats = bp.slice(14, 21).map(function (r) {
    return { nom: r[0], xp: r[1], score: r[2] };
  });
  // État calculé ici (même règle que Personnage!F8) : pas besoin d'attendre le recalcul du Sheet
  const pvJ = ent.pvEtat.pv;
  const etatTexte = pvJ <= 0 ? 'À terre : arc d\'entraînement'
    : pvJ < P.seuil ? 'Épuisé (XP ×' + String(P.malus).replace('.', ',') + ')' : 'En forme';

  const lun = lundi_(today);
  return {
    today: today,
    heros: bp[0][1],
    titre: bp[1][1],
    niveau: bp[2][1],
    xpTotale: bp[3][1],
    xpSuivant: bp[4][1],
    progression: bp[5][2],
    pv: ent.pvEtat.pv,
    pvMax: P.pvMax,
    debutSuivi: ecart_(today, ent.debut) > 0 ? ent.debut : null,
    seuilEpuise: P.seuil,
    classe: P.classe,
    vacances: (function () {
      const v = P.vacances.filter(function (x) { return ecart_(x.debut, today) >= 0 && (x.fin === '' || ecart_(today, x.fin) >= 0); })[0];
      return v ? { depuis: v.debut } : null;
    })(),
    malus: P.malus,
    arc: ent.pvEtat.arc ? { jours: ent.pvEtat.arc.jours, requis: P.joursRelever } : null,
    etat: etatTexte,
    regles: { rend: P.rend, soinHab: P.soinHab, soinAnnexe: P.soinAnnexe, pen: P.penJour(today), xpMult: P.xpMult },
    xpParPoint: P.xpParPoint,
    jokersRestants: Math.max(0, P.jokers - jokersUtilises_(ent.ctx, today)) + (reliqueDispo_(ent.ctx, today) ? 1 : 0),
    jokersParSemaine: P.jokers,
    bilan: { semaine: bilan_(ent.ctx, ent.habs, lun, P), precedente: bilan_(ent.ctx, ent.habs, isoPlus_(lun, -7), P) },
    nouveauxBonus: (nouveauxEnPlus || []).concat(ent.nouveaux),
    stats: stats,
    habitudes: habitudes,
    annexes: annexes, annexesAVenir: annexesAVenir,
    objectifs: objectifs,
    reglages: reglagesPublics_(ss, ent, today),
    sheetUrl: urlSheet_(ss),
    look: hc_().look,
    compagnie: lireHeros_(ss).map(function (h) { return { nom: h.nom, classe: h.classe, moi: h.index === hc_().index }; }),
    compagnons: compagnons_(ss, ent.ctx, today),
    camp: (function () { try { return camp_(ss, ent, today); } catch (e) { console.warn('Camp : ' + e); return null; } })(),
    d20: d20DuJour_(ent.props, today),
    capacites: etatCapacites_(ss, ent, today),
    boss: ent.boss,
    titres: ent.titres,
    evenement: evenementPublic_(today),
    mj: mjPublic_(today, hc_().nom),
    legende: lireLegende_(),
    retro: (function () { const an = retroAnnee_(today); if (!an) return null; try { return JSON.parse(props_().getProperty('retro|' + an) || 'null') || { annee: an, pret: false }; } catch (e) { return null; } })(),
    calendrier: calendrierSeries_(ent, today),
    carnet: carnetPourMoi_(ss)
  };
}

/* ====================== Boss du Crépuscule ======================
 * Les onglets Combats et Bestiaire calculent PV, dégâts et ripostes depuis le Journal.
 * Ici : la victoire devient DÉFINITIVE (colonne Q « Vaincu le »), l'XP de victoire est versée
 * aux deux héros, la relique du boss du mois donne +1 joker le mois suivant, et l'app reçoit l'état du combat.
 */
const ONGLET_COMBATS = 'Combats', ONGLET_BESTIAIRE = 'Bestiaire';
const COMBATS_SEMAINE = [4, 55], COMBATS_MOIS = [60, 71];
const COL_VAINCU = 21; // colonne U « Vaincu le » (Q = jauge, R = trophée, S-T = salle des trophées)

/** Une seule fois : colonne « Vaincu le » et formules qui figent la victoire ; l'XP des trophées ne blesse pas les boss. */
function migrationBoss_(ss) {
  const props = props_();
  if (/^v[2-9]$/.test(props.getProperty('migrationBoss') || '')) return; // v2 faite (v3 = calendrier daté, voir roulerBoss_)
  const sh = ss.getSheetByName(ONGLET_COMBATS);
  if (!sh) return;
  [COMBATS_SEMAINE, COMBATS_MOIS].forEach(function (z) {
    const n = z[1] - z[0] + 1;
    const plage = sh.getRange(z[0], 8, n, 2);
    const sep = /;/.test(plage.getFormulas()[0][0]) ? ';' : ','; // séparateur de la langue du Sheet
    plage.setFormulas(plage.getFormulas().map(function (r) {
      return r.map(function (f) {
        if (!f || f.indexOf('Trophée') >= 0) return f;
        return f.replace(/sel([,;])\(d>=/, function (m, sep) { return 'sel' + sep + '(LEFT(Journal!$B$2:$B' + sep + '8)<>"Trophée ")*(d>='; });
      });
    }));
    const kl = [];
    for (let r = z[0]; r <= z[1]; r++) {
      kl.push(['=IF($U' + r + '<>"",0,MAX(0,G' + r + '-N(H' + r + ')-N(I' + r + ')+J' + r + '))',
        '=IF($U' + r + '<>"","⚔ Vaincu",IF(TODAY()<$A' + r + ',"À venir",IF(G' + r + '=0,"Trêve",IF(K' + r + '=0,"⚔ Vaincu",IF(TODAY()>$B' + r + ',"Enfui","En cours")))))']
        .map(function (f) { return f.replace(/,/g, sep); }));
    }
    sh.getRange(z[0], 11, n, 2).setFormulas(kl);
    if (sh.getMaxColumns() < COL_VAINCU) sh.insertColumnsAfter(sh.getMaxColumns(), COL_VAINCU - sh.getMaxColumns());
    sh.getRange(z[0] - 1, COL_VAINCU).setValue('Vaincu le');
    sh.getRange(z[0], COL_VAINCU, n, 1).setNumberFormat('dd/mm/yyyy');
  });
  props.setProperty('migrationBoss', 'v2');
}

function reglesBoss_(ss) {
  return memo_('reglesBoss', function () {
    const v = ss.getSheetByName('Paramètres').getRange('B62:B76').getValues().map(function (r) { return r[0]; });
    const n = function (x, d) { const y = Number(x); return isNaN(y) || x === '' ? d : y; };
    return { ripSemaine: n(v[3], 0.05), ripMois: n(v[4], 0.02), recompenseRang: n(v[6], 100), recompenseMois: n(v[7], 500),
      faible: n(v[9], 1.5), faibleMage: n(v[10], 2), resiste: n(v[11], 0.5), sort: n(v[12], 2), annexeRoublard: n(v[13], 1.5) };
  });
}

/** Journal des coups d'un combat : qui a frappé, avec quelle quête, et les ripostes (12 derniers). */
function coupsDuCombat_(ctx, heros, debut, fin, faible, resiste, R, riposte) {
  const moi = heros_(), annexes = nomsAnnexes_(SpreadsheetApp.getActive());
  const mages = {};
  heros.forEach(function (h) { mages[h.nom] = /magicien/i.test(String(h.classe || '')); });
  const premier = heros[0] ? heros[0].nom : '';
  const autres = ctx.toutes.filter(function (e) { const h = e.heros || premier; return h !== moi; });
  const miens = ctx.entrees.map(function (e) { return Object.assign({}, e, { heros: moi }); });
  return autres.concat(miens).filter(function (e) {
    return ecart_(debut, e.date) >= 0 && ecart_(e.date, fin) >= 0 && (e.statut === 'Fait' || e.statut === 'Raté') && String(e.quete).indexOf('Trophée ') !== 0;
  }).map(function (e) {
    const h = e.heros || premier, mage = !!mages[h];
    if (e.statut === 'Raté') return { date: e.date, heros: h, quete: e.quete, type: 'riposte', valeur: riposte, ligne: e.ligne };
    const f = (e.carac === faible ? (mage ? R.faibleMage : R.faible) : e.carac === resiste ? R.resiste : 1)
      * (mage && e.note.indexOf('Sort préparé') >= 0 ? R.sort : 1) * (!mage && annexes[e.quete] ? R.annexeRoublard : 1);
    return { date: e.date, heros: h, quete: e.quete, type: 'coup', valeur: Math.round(((e.xpFait || Math.round((e.xpBase || 0) * (e.mult || 1))) + (e.bonus || 0)) * f),
      faible: e.carac === faible, resiste: e.carac === resiste, ligne: e.ligne };
  }).sort(function (a, b) { return ecart_(a.date, b.date) || b.ligne - a.ligne; }).slice(0, 12)
    .map(function (c) { delete c.ligne; return c; });
}

/** Ajoute une ligne de Journal pour un héros donné (pas forcément le héros courant). */
function ajouterPour_(ctx, iso, quete, statut, note, bonus, nomHeros) {
  ajouter_(ctx, iso, quete, statut, note, bonus);
  if (nomHeros === heros_()) return;
  const e = ctx.entrees.pop();
  ctx.journal.getRange(e.ligne, 14).setValue(nomHeros);
}

function combatsDuJour_(ss, ctx, today, nouveaux) {
  migrationBoss_(ss);
  const sh = ss.getSheetByName(ONGLET_COMBATS), sb = ss.getSheetByName(ONGLET_BESTIAIRE);
  if (!sh || !sb) return null;
  const tz = ctx.tz, R = reglesBoss_(ss), heros = lireHeros_(ss);
  const bestiaire = {};
  sb.getRange(4, 1, 37, 11).getValues().forEach(function (r) {
    if (r[0]) bestiaire[r[0]] = { incarne: r[5], description: r[6], conseil: r[7], recompense: r[8], trophee: r[9], visuel: r[10] };
  });
  const entete = sh.getRange(3, 8, 1, 2).getValues()[0]; // noms des héros (colonnes H et I)
  const lire = function (z, type) {
    const lignes = sh.getRange(z[0], 1, z[1] - z[0] + 1, COL_VAINCU).getValues();
    let i = -1;
    lignes.forEach(function (r, k) {
      const a = versIso_(r[0], tz), b = versIso_(r[1], tz);
      if (estIso_(a) && estIso_(b) && ecart_(a, today) >= 0 && ecart_(today, b) >= 0) i = k;
    });
    let avenir = false;
    if (i < 0) { // pas encore de combat : on montre le prochain boss
      let prochain = -1;
      lignes.forEach(function (r, k) {
        const a = versIso_(r[0], tz);
        if (prochain < 0 && estIso_(a) && ecart_(today, a) > 0 && r[2]) prochain = k;
      });
      if (prochain < 0) return null;
      i = prochain; avenir = true;
    }
    const r = lignes[i], ligne = z[0] + i, nom = r[2];
    const pvMax = Number(r[6]) || 0, pv = Number(r[10]) || 0;
    let vaincuLe = versIso_(r[COL_VAINCU - 1], tz);
    const B = bestiaire[nom] || {};
    const rang = type === 'mois' ? 0 : Number(r[3]) || 1;
    const xp = type === 'mois' ? R.recompenseMois : rang * R.recompenseRang;
    const degats = {};
    [0, 1].forEach(function (k) { if (entete[k]) degats[entete[k]] = Number(r[7 + k]) || 0; });
    // Victoire : immédiate et définitive
    if (!avenir && !estIso_(vaincuLe) && pvMax > 0 && pv <= 0) {
      vaincuLe = today;
      sh.getRange(ligne, COL_VAINCU).setValue(versDateSheet_(today, tz));
      // XP de victoire × équilibrage du héros (même rythme de progression pour chacun)
      const xpDe = function (h) { return Math.round(xp * (Number(h.equilibrage) || 1)); };
      heros.forEach(function (h) { ajouterPour_(ctx, today, 'Trophée : ' + nom, 'Bonus', 'Boss vaincu', xpDe(h), h.nom); });
      const fleau = Object.keys(degats).sort(function (x, y) { return degats[y] - degats[x]; })[0] || '';
      const feteDe = function (h) { return { type: 'boss', titre: '⚔️ ' + nom + ' est vaincu !', texte: '+' + xpDe(h) + ' XP' + (type === 'mois' ? ' · relique : +1 joker le mois prochain' : ''),
        xp: xpDe(h), visuel: B.visuel || '', trophee: B.trophee || '', fleau: fleau, mois: type === 'mois' }; };
      const fete = feteDe(hc_());
      if (type === 'mois') {
        const m = Number(today.slice(5, 7)), a = Number(today.slice(0, 4));
        const suivant = m === 12 ? (a + 1) + '-01' : a + '-' + String(m + 1).padStart(2, '0');
        heros.forEach(function (h) { props_().setProperty(cle_('relique', h), JSON.stringify({ mois: suivant, nom: B.trophee || 'Relique' })); });
      }
      nouveaux.push(fete);
      // L'autre héros verra la victoire à sa prochaine ouverture
      heros.forEach(function (h) {
        if (h.index === hc_().index) return;
        const props = props_(), k = cle_('celebrationsEnAttente', h);
        let file = []; try { file = JSON.parse(props.getProperty(k) || '[]'); } catch (x) {}
        props.setProperty(k, JSON.stringify(file.concat([feteDe(h)]).slice(-20)));
      });
    }
    const coups = coupsDuCombat_(ctx, heros, versIso_(r[0], tz), versIso_(r[1], tz), r[4], r[5], R,
      Math.round(pvMax * (type === 'mois' ? R.ripMois : R.ripSemaine)));
    return {
      coups: coups,
      type: type, nom: nom, rang: rang, faible: r[4], resiste: r[5], debut: versIso_(r[0], tz), fin: versIso_(r[1], tz),
      pvMax: pvMax, pv: avenir ? pvMax : estIso_(vaincuLe) ? 0 : pv, riposte: Number(r[9]) || 0, degats: degats,
      statut: avenir ? 'À venir' : estIso_(vaincuLe) ? 'Vaincu' : pvMax === 0 ? 'Trêve' : 'En cours', vaincuLe: estIso_(vaincuLe) ? vaincuLe : '',
      xp: Math.round(xp * (Number(hc_().equilibrage) || 1)), visuel: B.visuel || '', incarne: B.incarne || '', description: B.description || '', conseil: B.conseil || '', trophee: B.trophee || ''
    };
  };
  return { semaine: lire(COMBATS_SEMAINE, 'semaine'), mois: lire(COMBATS_MOIS, 'mois'),
    regles: { faible: R.faible, faibleMage: R.faibleMage, resiste: R.resiste, sort: R.sort, annexeRoublard: R.annexeRoublard, ripSemaine: R.ripSemaine, ripMois: R.ripMois } };
}

/**
 * Quêtes « Fin de mois » (bilan) : visibles du 25 du mois au 5 du mois suivant,
 * une fois par bilan. Une saisie du 1er au 5 compte pour le mois précédent.
 */
const BILAN_DEBUT = 28, BILAN_FIN = 5;
function moisBilan_(iso) {
  const a = Number(String(iso).slice(0, 4)), m = Number(String(iso).slice(5, 7)), j = Number(String(iso).slice(8, 10));
  if (j > BILAN_FIN) return String(iso).slice(0, 7);
  return m === 1 ? (a - 1) + '-12' : a + '-' + String(m - 1).padStart(2, '0');
}
function fenetreBilan_(iso) { const j = Number(String(iso).slice(8, 10)); return j >= BILAN_DEBUT || j <= BILAN_FIN; }

/** Résumé des autres héros de la Compagnie (onglet Compagnie de l'app). Lecture légère : leur fiche + leurs saisies. */
function compagnons_(ss, ctx, today) {
  const moi = hc_(), lun = lundi_(today);
  return lireHeros_(ss).filter(function (h) { return h.index !== moi.index; }).map(function (h) {
    const sh = ss.getSheetByName(ongletHeros_(ONGLET_PERSONNAGE, h));
    const b = sh ? sh.getRange('B4:G9').getValues() : null;
    const siens = ctx.toutes.filter(function (e) { return e.heros === h.nom || (e.heros === '' && h.index === 0); });
    const pv = b ? Number(b[2][5]) : 0;
    return {
      nom: h.nom, classe: h.classe, look: h.look, surnom: titreChoisiDe_(h), ornements: (lireReglages_(props_(), h).ornements || {}),
      niveau: b ? b[2][1] : 1, titre: b ? b[1][1] : '', xpTotale: b ? b[3][1] : 0, pv: pv,
      faitsAujourdhui: siens.filter(function (e) { return e.date === today && e.statut === 'Fait'; }).length,
      ratesAujourdhui: siens.filter(function (e) { return e.date === today && e.statut === 'Raté'; }).length,
      xpSemaine: Math.round(siens.reduce(function (t, e) {
        return ecart_(lun, e.date) >= 0 ? t + (e.statut === 'Fait' ? e.xpFait : 0) + e.bonus : t;
      }, 0))
    };
  });
}

function urlSheet_(ss) {
  const cache = CacheService.getScriptCache();
  let u = cache.get('urlSheet');
  if (!u) { u = ss.getUrl(); cache.put('urlSheet', u, 21600); }
  return u;
}

/** Ce que la page Réglages a besoin de savoir. */
function reglagesPublics_(ss, ent, today) {
  const tz = tz_(ss), R = ent.reglages, P = ent.P;
  const depuis = hc_().diffDepuis;
  const prochain = /^\d{4}-\d{2}-\d{2}$/.test(depuis) ? isoPlus_(depuis, DELAI_DIFFICULTE) : '';
  return {
    vacances: P.vacances.filter(function (v) { return !v.fin || ecart_(today, v.fin) >= 0; })
      .map(function (v) { return { index: v.index, debut: v.debut, fin: v.fin, enCours: dansPeriode_(v, today) }; }),
    pauses: Object.keys(R.pauses).filter(function (n) { return enPause_(P, n, today); })
      .map(function (n) { return { nom: n, depuis: R.pauses[n].filter(function (p) { return dansPeriode_(p, today); })[0].debut }; }),
    decalages: R.decalages.filter(function (x) { return ecart_(today, x.a) >= 0 || ecart_(today, x.de) >= 0; }),
    rappel: R.rappel, confort: R.confort, ornements: R.ornements || {}, versionMoteur: VERSION_MOTEUR, numeroMoteur: NUMERO_MOTEUR,
    montre: (function () { try { return JSON.parse(props_().getProperty(cle_('montreRecu')) || '[]').filter(function (x) { return ecart_(x.date, today) <= 2; }).slice(0, 4); } catch (e) { return []; } })(),
    pas: (function () { try { const x = JSON.parse(props_().getProperty(cle_('pasDuJour')) || 'null'); return x && x.date === today ? x.pas : null; } catch (e) { return null; } })(),
    voyages: Object.keys(R.pauses).reduce(function (l, n) {
      R.pauses[n].forEach(function (p) { if (p.fin && ecart_(today, p.fin) >= 0 && p.voyage) { let v = l.filter(function (x) { return x.debut === p.debut && x.fin === p.fin; })[0]; if (!v) l.push(v = { debut: p.debut, fin: p.fin, quetes: [] }); v.quetes.push(n); } });
      return l;
    }, []),
    difficulte: {
      niveau: P.difficulte, depuis: depuis,
      prochainChangement: prochain && ecart_(today, prochain) > 0 ? prochain : '',
      modes: Object.keys(DIFFICULTES).map(function (k) { return { nom: k, resume: DIFFICULTES[k].resume }; })
    },
    devise: hc_().devise,
    naissance: hc_().naissance,
    sauvegarde: {
      derniere: ent.props.getProperty('derniereSauvegarde') || '',
      dossier: ent.props.getProperty('dossierSauvegardesUrl') || '',
      gardees: SAUVEGARDES_GARDEES
    }
  };
}

function avecVerrou_(fn) {
  MEMO_ = {}; // chaque appel de l'app repart d'une lecture fraîche
  const lock = LockService.getScriptLock();
  // Le verrou de Google tombe parfois en panne passagère (« Une erreur est survenue sur le serveur… ») : 3 nouvelles tentatives
  let pris = false;
  for (let essai = 0; essai < 4 && !pris; essai++) {
    try { pris = lock.tryLock(essai ? 9000 : 28000); if (!pris) break; }
    catch (e) { if (essai === 3) throw new Error('OCCUPE : Google a eu un raté, réessaie dans un instant.'); Utilities.sleep(400 * (essai + 1)); }
  }
  if (!pris) throw new Error('OCCUPE : le Sheet termine une autre action, réessaie dans un instant.');
  PROPS_ = null; MEMO_ = {}; // ce qu'une autre action vient d'écrire est relu
  try { return fn(); } finally { lock.releaseLock(); }
}
/** Verrou + choix du héros de la requête (nom envoyé par l'app ; vide = 1er héros). */
function avecHeros_(heros, fn) {
  return avecVerrou_(function () {
    HEROS_ = null;
    choisirHeros_(SpreadsheetApp.getActive(), heros);
    return fn();
  });
}

/** Appelé par l'app à l'ouverture. */
function getState(heros) {
  return avecHeros_(heros, function () {
    try { verifierPreparation_(); } catch (e) {}
    try { pasMontre_(SpreadsheetApp.getActive()); } catch (e) { console.warn('Pas de la montre : ' + e.message); }
    try { montreActivites_(SpreadsheetApp.getActive()); } catch (e) { console.warn('Activités de la montre : ' + e.message); }
    const props = props_(), k = cle_('celebrationsEnAttente');
    let attente = null; try { attente = JSON.parse(props.getProperty(k) || 'null'); } catch (x) {}
    if (attente) props.deleteProperty(k);
    return etat_(SpreadsheetApp.getActive(), attente || []);
  });
}

/**
 * Fiche d'un compagnon en LECTURE SEULE (onglet Compagnie → toucher sa carte).
 * La clé sert à agir pour soi ; regarder la feuille de l'autre est permis à tout membre de la Compagnie.
 * Renvoie seulement ce qu'il faut pour l'afficher (pas ses réglages ni ses rappels).
 */
function voirCompagnon(nom, heros) {
  const h = lireHeros_(SpreadsheetApp.getActive()).filter(function (x) { return x.nom === nom; })[0];
  if (!h) throw new Error('Compagnon inconnu : ' + nom);
  if (heros && h.nom === heros) throw new Error('C\'est ta propre fiche.');
  const s = avecHeros_(h.nom, function () {
    const ss = SpreadsheetApp.getActive(), e = etat_(ss);
    // Ses célébrations (bonus de série…) restent pour lui : il les verra à sa prochaine ouverture
    if (e.nouveauxBonus && e.nouveauxBonus.length) {
      const props = props_(), k = cle_('celebrationsEnAttente');
      let file = []; try { file = JSON.parse(props.getProperty(k) || '[]'); } catch (x) {}
      props.setProperty(k, JSON.stringify(file.concat(e.nouveauxBonus).slice(-20)));
    }
    return e;
  });
  return { heros: s.heros, titre: s.titre, niveau: s.niveau, xpTotale: s.xpTotale, pv: s.pv, pvMax: s.pvMax,
    classe: s.classe, look: s.look, d20: s.d20, habitudes: s.habitudes, annexes: s.annexes, objectifs: s.objectifs,
    stats: s.stats, xpParPoint: s.xpParPoint, legende: s.legende, ornements: (s.reglages && s.reglages.ornements) || {} };
}

/* ====================== Événements saisonniers ======================
 * Les règles sont fixes (et prudentes) ; Claude leur donne un nom et un récit.
 * Chaque mois, un événement surprise de 3 jours tombe à une date tenue secrète jusqu'au jour J.
 */
const EVENEMENTS_FIXES = [
  { id: 'aube', debut: '01-01', fin: '01-07', effet: { type: 'tout', mult: 1.5 }, theme: 'la nouvelle année : relancer la Compagnie après les fêtes', nom: 'L\'Aube nouvelle' },
  { id: 'compagnons', debut: '02-13', fin: '02-15', effet: { type: 'pacte', mult: 2 }, theme: 'la fête des compagnons d\'armes (Saint-Valentin)', nom: 'La Fête des Compagnons' },
  { id: 'equinoxe', debut: '03-20', fin: '03-22', effet: { type: 'avantage' }, theme: 'l\'équinoxe de printemps, quand la chance tourne', nom: 'L\'Équinoxe' },
  { id: 'solstice', debut: '06-20', fin: '06-22', effet: { type: 'carac', carac: 'Endurance', mult: 1.5 }, theme: 'le solstice d\'été, le jour le plus long', nom: 'Le Grand Solstice' },
  { id: 'anniv', debut: '10-26', fin: '10-26', effet: { type: 'tout', mult: 2 }, theme: 'l\'anniversaire de la fondation de la Compagnie', nom: 'L\'Anniversaire de la Compagnie' },
  { id: 'samhain', debut: '10-31', fin: '11-01', effet: { type: 'annexes', mult: 1.5 }, theme: 'Halloween, la nuit où les esprits rôdent', nom: 'La Nuit des Spectres' },
  { id: 'nuit', debut: '12-21', fin: '12-27', effet: { type: 'annexes', mult: 1.5 }, theme: 'la plus longue nuit de l\'année et Noël', nom: 'La Plus Longue Nuit' }
];
const EFFETS_SURPRISE = [
  { type: 'tout', mult: 1.25 }, { type: 'annexes', mult: 1.5 }, { type: 'avantage' },
  { type: 'carac', mult: 1.5 }, { type: 'carac', mult: 1.5 }
];
const CARACS_ = ['Force', 'Endurance', 'Agilité', 'Intelligence', 'Sagesse', 'Volonté', 'Charisme'];
function hash_(t) { let h = 2166136261; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0); }
function surpriseDuMois_(ym) {
  let jour = 4 + (hash_('jour' + ym) % 18); // entre le 4 et le 21 (loin des bilans de fin de mois)
  // jamais en même temps qu'un événement fixe
  const chevauche = function (j) { for (let k = 0; k < 3; k++) { const md = ym.slice(5) + '-' + String(j + k).padStart(2, '0'); if (EVENEMENTS_FIXES.some(function (e) { return md >= e.debut && md <= e.fin; })) return true; } return false; };
  if (chevauche(jour)) jour = jour > 12 ? jour - 8 : jour + 8;
  const debut = ym + '-' + String(jour).padStart(2, '0');
  const e = Object.assign({}, EFFETS_SURPRISE[hash_('effet' + ym + 'x') % EFFETS_SURPRISE.length]);
  if (e.type === 'carac') e.carac = CARACS_[hash_('carac' + ym) % CARACS_.length];
  return { id: 'surprise-' + ym, debut: debut, fin: isoPlus_(debut, 2), effet: e, surprise: true, theme: 'un événement surprise du mois', nom: 'Événement surprise' };
}
function evenementDu_(iso) {
  const md = iso.slice(5), an = iso.slice(0, 4);
  const f = EVENEMENTS_FIXES.filter(function (e) { return md >= e.debut && md <= e.fin; })[0];
  if (f) return Object.assign({}, f, { debut: an + '-' + f.debut, fin: an + '-' + f.fin, cle: f.id + '-' + an });
  const sp = surpriseDuMois_(iso.slice(0, 7));
  if (ecart_(sp.debut, iso) >= 0 && ecart_(iso, sp.fin) >= 0) return Object.assign({}, sp, { cle: sp.id });
  return null;
}
function texteEffet_(e) {
  const f = function (x) { return String(x).replace('.', ','); };
  if (e.type === 'tout') return 'XP ×' + f(e.mult) + ' sur toutes les quêtes';
  if (e.type === 'annexes') return 'XP ×' + f(e.mult) + ' sur les quêtes annexes';
  if (e.type === 'carac') return 'XP ×' + f(e.mult) + ' sur les quêtes ' + (/^[AEIOUÉ]/.test(e.carac) ? 'd\'' : 'de ') + e.carac;
  if (e.type === 'avantage') return 'd20 avec avantage : deux dés, tu gardes le meilleur';
  if (e.type === 'pacte') return 'pacte de la semaine doublé (+300 XP chacun)';
  return '';
}
/** Multiplicateur d'XP d'une quête validée ce jour-là, selon l'événement en cours. */
function multEvenement_(ss, quete, iso) {
  const q0 = catalogue_(ss)[quete] || {};
  const b = beneditionDu_(iso);
  let mb = 1;
  if (b && b.type === 'tout') mb = b.mult;
  else if (b && b.type === 'carac' && (q0.c1 === b.carac || q0.c2 === b.carac)) mb = b.mult;
  const rb = rebondDu_(iso);
  let mr = 1;
  if (rb && (rb.type === 'tout' || (rb.type === 'carac' && (q0.c1 === rb.carac || q0.c2 === rb.carac)))) mr = rb.mult;
  const fx = function (x) { return String(Math.round(x * 100) / 100).replace('.', ','); };
  const tagsMJ = [];
  if (mb !== 1) tagsMJ.push('Bénédiction ×' + fx(mb));
  if (mr !== 1) tagsMJ.push('Rebondissement ×' + fx(mr));
  mb *= mr;
  const ev = evenementDu_(iso);
  if (!ev) return { mult: mb, tag: tagsMJ.join(' · ') };
  const q = q0;
  const e = ev.effet;
  let m = 1;
  if (e.type === 'tout') m = e.mult;
  else if (e.type === 'annexes' && q.annexe) m = e.mult;
  else if (e.type === 'carac' && (q.c1 === e.carac || q.c2 === e.carac)) m = e.mult;
  const tags = [];
  if (m !== 1) tags.push((recitEvenement_(ev).nom || ev.nom) + ' ×' + String(m).replace('.', ','));
  return { mult: m * mb, tag: tags.concat(tagsMJ).join(' · ') };
}
function recitEvenement_(ev) {
  try { return JSON.parse(props_().getProperty('evenement|' + ev.cle) || '{}'); } catch (e) { return {}; }
}
function evenementPublic_(today) {
  const ev = evenementDu_(today);
  // les événements fixes s'annoncent 3 jours avant ; les surprises restent secrètes
  let prochain = null;
  if (!ev) for (let k = 1; k <= 3 && !prochain; k++) { const e = evenementDu_(isoPlus_(today, k)); if (e && !e.surprise) prochain = e; }
  const pub = function (e) { if (!e) return null; const r = recitEvenement_(e);
    return { cle: e.cle, nom: r.nom || e.nom, texte: r.texte || '', effet: e.effet, effetTexte: texteEffet_(e.effet), debut: e.debut, fin: e.fin, surprise: !!e.surprise }; };
  return { actuel: pub(ev), prochain: pub(prochain) };
}
/** Claude écrit le nom et le récit de l'événement (une seule fois, partagé par la Compagnie). */
function recitEvenement(heros) {
  const today = aujourdhui_(), ev = evenementDu_(today) || (function () { for (let k = 1; k <= 3; k++) { const e = evenementDu_(isoPlus_(today, k)); if (e && !e.surprise) return e; } return null; })();
  if (!ev) return null;
  const props = props_(), k = 'evenement|' + ev.cle;
  const deja = recitEvenement_(ev);
  if (deja.texte) return deja;
  const brut = claudeCourt_('Tu es le maître du jeu de « La Compagnie de l\'Aube », un jeu de rôle où deux héros (un mage, Theron, et un roublard, Alterzio) gagnent de l\'XP en tenant leurs bonnes habitudes. ' +
    'Un événement commence : ' + ev.theme + '. Effet de jeu : ' + texteEffet_(ev.effet) + ' (du ' + ev.debut + ' au ' + ev.fin + '). ' +
    (ev.surprise ? 'Invente un nom d\'événement original et mystérieux. ' : 'Son nom est « ' + ev.nom + ' ». ') +
    'Réponds UNIQUEMENT en JSON : {"nom":"nom de l\'événement","texte":"2 phrases épiques en français qui l\'annoncent et donnent envie d\'en profiter, en citant l\'effet mot pour mot (n\'invente aucun autre chiffre)"}');
  let r = {};
  r = jsonClaude_(brut) || {};
  const out = { nom: String(ev.surprise ? (r.nom || ev.nom) : ev.nom).slice(0, 60), texte: String(r.texte || '').slice(0, 400) };
  if (out.texte) props.setProperty(k, JSON.stringify(out));
  return out;
}

/* ====================== Le Maître du Jeu (Claude) ======================
 * Chaque lundi, Claude écrit le chapitre suivant de la Saga de l'Aube à partir de votre vraie semaine,
 * propose deux bénédictions (choix à voter, le MJ tranche en cas de désaccord ou au mercredi),
 * et invente une Quête du destin personnelle pour chaque héros. Les effets restent dans un cadre sûr.
 */
const BENEDICTIONS = [
  { id: 'tout', type: 'tout', mult: 1.1, texte: 'XP ×1,1 sur toutes les quêtes' },
  { id: 'joker', type: 'joker', texte: '+1 joker cette semaine' },
  { id: 'avantage', type: 'avantage', texte: 'd20 avec avantage toute la semaine' }
].concat(['Force', 'Endurance', 'Agilité', 'Intelligence', 'Sagesse', 'Volonté', 'Charisme'].map(function (c) {
  return { id: 'carac_' + c, type: 'carac', carac: c, mult: 1.2, texte: 'XP ×1,2 sur les quêtes ' + (/^[AEIOUÉ]/.test(c) ? 'd\'' : 'de ') + c };
}));
function lireMJ_(lundi) { try { return JSON.parse(props_().getProperty('mj|' + lundi) || 'null'); } catch (e) { return null; } }
function ecrireMJ_(lundi, m) { props_().setProperty('mj|' + lundi, JSON.stringify(m)); }
function sagaResumes_() { try { return JSON.parse(props_().getProperty('sagaResumes') || '[]'); } catch (e) { return []; } }

/** Bénédiction en vigueur ce jour-là (décidée par les votes ou par le MJ). */
function beneditionDu_(iso) {
  const lun = lundi_(iso), m = lireMJ_(lun);
  if (!m || !m.choix) return null;
  const d = decisionMJ_(m, iso);
  return d == null ? null : BENEDICTIONS.filter(function (b) { return b.id === m.choix[d].effet; })[0] || null;
}
/** Tous les héros ont voté pareil → ce choix ; sinon, à partir du mercredi, le MJ tranche (au hasard, mais fixe). */
function decisionMJ_(m, iso) {
  const heros = lireHeros_(SpreadsheetApp.getActive()).map(function (h) { return h.nom; });
  const votes = m.votes || {};
  const v = heros.map(function (h) { return votes[h]; });
  if (v.every(function (x) { return x === 0 || x === 1; }) && v.every(function (x) { return x === v[0]; })) return v[0];
  if (iso && jourSemaine_(iso) >= 2) return v.filter(function (x) { return x === 0 || x === 1; }).length === 1 ? v.filter(function (x) { return x === 0 || x === 1; })[0] : hash_('mj' + m.lundi) % 2;
  return null;
}
function queteDestin_(iso, nom) { const m = lireMJ_(lundi_(iso)); return m && m.destins ? m.destins[nom] || null : null; }
function mjPublic_(today, moi) {
  const lun = lundi_(today), m = lireMJ_(lun);
  if (!m) return { lundi: lun, pret: false };
  const d = decisionMJ_(m, today);
  return { lundi: lun, pret: true, titre: m.titre, texte: m.texte, choix: (m.choix || []).map(function (c) { return { texte: c.texte, effet: c.effet, effetTexte: (BENEDICTIONS.filter(function (b) { return b.id === c.effet; })[0] || {}).texte || '' }; }),
    monVote: (m.votes || {})[moi], votes: m.votes || {}, decision: d, parMJ: d != null && !(m.votes && Object.keys(m.votes).length && Object.keys(m.votes).every(function (k) { return m.votes[k] === d; })),
    destin: m.destins ? m.destins[moi] || null : null, numero: m.numero || 1,
    rebond: m.rebond && jourSemaine_(today) >= 3 ? m.rebond : null, rebondPossible: !m.rebond && jourSemaine_(today) >= 3 };
}
/* Rebondissement du jeudi : si le boss tient encore plus de la moitié de ses PV, le Maître du Jeu fait entrer un allié. */
function rebondDu_(iso) {
  if (jourSemaine_(iso) < 3) return null;
  const m = lireMJ_(lundi_(iso));
  return m && m.rebond ? m.rebond.effet : null;
}
function rebondissement(heros) {
  const today = aujourdhui_(), lun = lundi_(today), m = lireMJ_(lun);
  if (!m || m.rebond || jourSemaine_(today) < 3) return m ? mjPublic_(today, heros) : null;
  const st = getState(heros), b = st.boss && st.boss.semaine;
  if (!b || b.statut !== 'En cours' || !b.pvMax || b.pv / b.pvMax <= 0.5) return mjPublic_(today, heros); // le combat avance bien : pas besoin
  const effet = hash_('rebond' + lun) % 2 ? { type: 'carac', carac: b.faible, mult: 1.5 } : { type: 'tout', mult: 1.25 };
  const effetTexte = effet.type === 'tout' ? 'XP ×1,25 sur toutes les quêtes jusqu\'à dimanche' : 'XP ×1,5 sur les quêtes ' + (/^[AEIOUÉ]/.test(effet.carac) ? 'd\'' : 'de ') + effet.carac + ' (sa faiblesse) jusqu\'à dimanche';
  const texte = claudeCourt_('Tu es le Maître du Jeu de « La Compagnie de l\'Aube ». Nous sommes jeudi et le boss ' + b.nom + ' (' + b.incarne + ') a encore ' + Math.round(b.pv) + ' PV sur ' + Math.round(b.pvMax) +
    ' : le combat s\'enlise. Chapitre en cours : « ' + m.titre + ' ». Raconte en 3 phrases un rebondissement : un allié inattendu, une faille, un artefact… qui donne aux héros cet avantage : ' + effetTexte + '. Ton épique, un peu d\'humour. Pas de markdown.') ||
    'Un allié inattendu surgit des brumes : la Compagnie reprend courage. ' + effetTexte + '.';
  return avecVerrou_(function () {
    const mm = lireMJ_(lun);
    if (!mm.rebond) { mm.rebond = { texte: texte, effet: effet, effetTexte: effetTexte, date: today }; ecrireMJ_(lun, mm); ajouterFil_('⚡ Rebondissement : ' + effetTexte, today); }
    MEMO_ = {};
    return mjPublic_(today, heros);
  });
}

/* ====================== Légende personnelle : un chapitre à chaque évolution de classe ====================== */
function lireLegende_(h) { try { return JSON.parse(props_().getProperty(cle_('legende', h)) || '{}'); } catch (e) { return {}; } }
function chapitreEvolution(info, heros) {
  info = info || {};
  const n = Number(info.n) || 0;
  // 1) lecture rapide sous verrou
  const pre = avecHeros_(heros, function () {
    const ss = SpreadsheetApp.getActive();
    const niveau = Number(ss.getSheetByName(ongletHeros_(ONGLET_PERSONNAGE)).getRange('C6').getValue()) || 1;
    if (!n || niveau < n) throw new Error('Palier pas encore atteint.');
    const L = lireLegende_(), H = hc_();
    return { deja: L[n] || null, nom: H.nom, classe: H.classe, precedents: Object.keys(L).sort(function (a, b) { return a - b; }).map(function (k) { return L[k].resume || L[k].titre; }) };
  });
  if (pre.deja) return pre.deja;
  // 2) Claude écrit (quelques secondes) sans bloquer le reste de la Compagnie
  const brut = claudeCourt_('Tu écris la légende personnelle de ' + pre.nom + ', ' + pre.classe + ' de « La Compagnie de l\'Aube » (un jeu de rôle de bonnes habitudes, dans la vraie vie il progresse grâce à ses efforts quotidiens). ' +
    'Il vient d\'atteindre le niveau ' + n + ' et devient « ' + String(info.titre || '') + ' » : ' + String(info.desc || '') + '. Chapitres précédents : ' + (pre.precedents.join(' / ') || 'aucun') + '. ' +
    'Réponds UNIQUEMENT en JSON : {"titre":"titre du chapitre","texte":"4 à 6 phrases épiques, à la 2e personne (tu), sur cette transformation et ce qu\'elle dit de sa persévérance","resume":"1 phrase"}');
  let r = {};
  r = jsonClaude_(brut) || {};
  if (!r.texte) return null;
  // 3) écriture sous verrou
  return avecHeros_(heros, function () {
    const L = lireLegende_();
    if (L[n]) return L[n];
    L[n] = { titre: String(r.titre || info.titre).slice(0, 80), texte: String(r.texte).slice(0, 1500), resume: String(r.resume || '').slice(0, 200), date: aujourdhui_(), palier: String(info.titre || '') };
    props_().setProperty(cle_('legende'), JSON.stringify(L));
    ajouterFil_('📖 ' + pre.nom.split(' ')[0] + ' devient ' + String(info.titre || ''), aujourdhui_());
    return L[n];
  });
}

/* ====================== Rétrospective de l'année (31 décembre → 6 janvier) ====================== */
function retroAnnee_(today) {
  const md = today.slice(5);
  if (md === '12-31') return today.slice(0, 4);
  if (md >= '01-01' && md <= '01-06') return String(Number(today.slice(0, 4)) - 1);
  return '';
}
function retrospective(heros) {
  const today = aujourdhui_(), an = retroAnnee_(today);
  if (!an) return null;
  const props = props_(), k = 'retro|' + an;
  try { const d = JSON.parse(props.getProperty(k) || 'null'); if (d) return d; } catch (e) {}
  const ss = SpreadsheetApp.getActive(), ctx = contexteJournal_(ss, tz_(ss)), heros_l = lireHeros_(ss), premier = (heros_l[0] || {}).nom;
  const E = toutesEntrees_(ctx).filter(function (e) { return String(e.date).slice(0, 4) === an; });
  const parHeros = heros_l.map(function (h) {
    const mes = E.filter(function (e) { return (e.heros || premier) === h.nom; });
    const faits = mes.filter(function (e) { return e.statut === 'Fait'; });
    const parQuete = {};
    faits.forEach(function (e) { parQuete[e.quete] = (parQuete[e.quete] || 0) + 1; });
    const top = Object.keys(parQuete).sort(function (a, b) { return parQuete[b] - parQuete[a]; }).slice(0, 3).map(function (q) { return q + ' (' + parQuete[q] + ')'; });
    const xp = mes.reduce(function (t, e) { return t + (e.statut === 'Fait' ? e.xpFait : 0) + (e.bonus || 0); }, 0);
    const titres = Object.keys(titresAcquis_(h)).filter(function (id) { return String(titresAcquis_(h)[id]).slice(0, 4) === an; })
      .map(function (id) { return (TITRES.filter(function (t) { return t.id === id; })[0] || {}).nom; }).filter(Boolean);
    return { nom: h.nom, faits: faits.length, rates: mes.filter(function (e) { return e.statut === 'Raté'; }).length, xp: Math.round(xp), top: top, titres: titres };
  });
  const boss = E.filter(function (e) { return String(e.quete).indexOf('Trophée : ') === 0; }).map(function (e) { return e.quete.replace('Trophée : ', ''); })
    .filter(function (v, i, a) { return a.indexOf(v) === i; });
  const lignes = parHeros.map(function (h) { return h.nom + ' : ' + h.faits + ' quêtes, ' + h.rates + ' ratés, ' + h.xp + ' XP, quêtes phares : ' + h.top.join(', ') + (h.titres.length ? ', titres gagnés : ' + h.titres.join(', ') : ''); }).join(' ; ');
  const brut = claudeCourt_('Tu es le Maître du Jeu de « La Compagnie de l\'Aube ». Écris la rétrospective de l\'année ' + an + ' de la Compagnie : ' + lignes + '. Boss abattus : ' + (boss.join(', ') || 'aucun') + '. ' +
    'Résumés de la saga : ' + sagaResumes_().slice(-8).join(' / ') + '. ' +
    'Réponds UNIQUEMENT en JSON : {"texte":"6 à 8 phrases chaleureuses et épiques, tutoiement collectif, qui célèbrent l\'année et ouvrent sur la suivante","honneurs":{"<nom du héros>":"un titre d\'honneur unique et personnel pour l\'année"}}');
  let r = {};
  r = jsonClaude_(brut) || {};
  const out = { annee: an, heros: parHeros, boss: boss, texte: String(r.texte || ''), honneurs: r.honneurs || {} };
  if (out.texte) props.setProperty(k, JSON.stringify(out));
  return out;
}

/* ====================== Lecture des réponses JSON de Claude ====================== */

/** Lit le JSON renvoyé par Claude, même entouré de texte ou de ```json, avec virgules en trop. null si illisible. */
function jsonClaude_(t) {
  t = String(t || '').replace(/```(?:json)?/g, '');
  const a = t.indexOf('{'), b = t.lastIndexOf('}');
  if (a < 0 || b <= a) return null;
  const brut = t.slice(a, b + 1);
  try { return JSON.parse(brut); } catch (e) {}
  try { return JSON.parse(brut.replace(/,\s*([}\]])/g, '$1').replace(/[“”]/g, '"')); } catch (e) { return null; }
}
/** Chapitre écrit sans Claude, à partir de la vraie semaine (jamais de Saga bloquée). */
function chapitreSecours_(etats, boss) {
  const lignes = etats.map(function (e) { const b = e.bilan.precedente; return e.heros.split(' ')[0] + ' a tenu ' + b.faits + ' quête' + (b.faits > 1 ? 's' : ''); });
  return {
    titre: boss ? 'L\'ombre de ' + boss.nom : 'La marche continue',
    texte: 'Le vent se lève sur le camp de l\'Aube. ' + lignes.join(', ') + ' la semaine passée. ' +
      (boss ? boss.nom + ' approche, et l\'on murmure qu\'il craint ' + (/^[AEIOUÉ]/.test(boss.faible) ? 'l\'' : 'la ') + boss.faible + '. ' : '') +
      'Le Maître du Jeu pose deux chemins devant la Compagnie : à vous de choisir.',
    resume: 'La Compagnie repart au combat.',
    choix: [{ texte: 'Foncer ensemble vers le combat', effet: boss ? 'carac_' + boss.faible : 'tout' }, { texte: 'Avancer prudemment, un joker en poche', effet: 'joker' }],
    destins: {}
  };
}
/** Écrit le chapitre de la semaine s'il n'existe pas encore (appelé par l'app à la première ouverture du lundi). */
function maitreDuJeu(heros) {
  const ss = SpreadsheetApp.getActive(), today = aujourdhui_(), lun = lundi_(today);
  const deja = lireMJ_(lun);
  if (deja) return mjPublic_(today, heros);
  const tous = lireHeros_(ss);
  // Ce qui s'est passé la semaine dernière, pour chaque héros
  const etats = tous.map(function (h) { try { return getState(h.nom); } catch (e) { return null; } }).filter(Boolean);
  const st = etats.filter(function (x) { return x.heros === heros; })[0] || etats[0];
  const lignes = etats.map(function (e) {
    const b = e.bilan.precedente;
    const faibles = e.habitudes.filter(function (h) { return h.objectif && h.semaine < h.objectif; }).map(function (h) { return h.nom; }).slice(0, 3);
    const series = e.habitudes.filter(function (h) { return h.serie >= 3; }).map(function (h) { return h.nom + ' ' + h.serie + ' j'; }).slice(0, 3);
    return e.heros + ' (' + ((e.classe || {}).nom || '') + ', niveau ' + e.niveau + ') : ' + b.faits + ' quêtes, ' + b.rates + ' ratés, ' + b.xp + ' XP la semaine passée' +
      (series.length ? ' ; séries : ' + series.join(', ') : '') + (faibles.length ? ' ; quêtes en retard : ' + faibles.join(', ') : '') +
      ' ; ses quêtes : ' + e.habitudes.map(function (h) { return h.nom + ' (' + h.carac + ')'; }).join(', ');
  });
  const boss = st.boss && st.boss.semaine, bossPrec = '';
  const fil = st.camp ? st.camp.fil.slice(0, 6).map(function (f) { return f.texte; }).join(' ; ') : '';
  const resumes = sagaResumes_().slice(-4);
  const ids = BENEDICTIONS.map(function (b) { return b.id + ' = ' + b.texte; }).join(' | ');
  const prompt = 'Tu es le Maître du Jeu de « La Compagnie de l\'Aube », un jeu de rôle où des héros réels gagnent de l\'XP en tenant leurs bonnes habitudes. ' +
    'Écris le chapitre ' + ((resumes.length) + 1) + ' de la Saga de l\'Aube, qui continue l\'histoire et s\'inspire de leur VRAIE semaine passée.\n' +
    'Chapitres précédents (résumés) : ' + (resumes.join(' / ') || 'aucun, c\'est le début de la saga') + '\n' +
    'Héros : ' + lignes.join('\n') + '\n' +
    'Boss de la semaine qui commence : ' + (boss ? boss.nom + ' (' + boss.incarne + '), faible à ' + boss.faible : 'aucun') + '.\n' +
    'Faits marquants récents : ' + (fil || 'aucun') + '.\n' +
    'Règles : ton épique, chaleureux, un peu d\'humour ; tutoiement collectif ; jamais de reproche ; les habitudes réelles apparaissent sous forme fantasy mais reconnaissable. ' +
    'Termine sur un dilemme : DEUX choix pour la semaine, chacun lié à une bénédiction de cette liste (utilise exactement l\'identifiant) : ' + ids + '. ' +
    'Choisis des bénédictions qui aident les héros là où ils ont été faibles. ' +
    'Invente aussi pour CHAQUE héros une « Quête du destin » : une action concrète, réaliste, faisable en une fois cette semaine, utile à sa vie (santé, relations, esprit, pro), différente de ses quêtes habituelles, avec une caractéristique parmi Force, Endurance, Agilité, Intelligence, Sagesse, Volonté, Charisme et une difficulté (DD) de 8 à 18.\n' +
    'Réponds UNIQUEMENT en JSON : {"titre":"titre du chapitre","texte":"5 à 7 phrases","resume":"1 phrase","choix":[{"texte":"choix 1 en 1 phrase","effet":"identifiant"},{"texte":"choix 2","effet":"identifiant"}],' +
    '"destins":{' + etats.map(function (e) { return '"' + e.heros + '":{"nom":"nom court de la quête (max 50 caractères)","desc":"ce qu\'il faut faire concrètement, 1 phrase","carac":"…","dd":12}'; }).join(',') + '}}';
  // Pas plus d'un essai toutes les 20 minutes : un échec ne doit pas ralentir chaque ouverture
  const P = props_(), kEssai = 'mjEssai|' + lun, dernierEssai = Number(P.getProperty(kEssai) || 0);
  let r = null;
  if (P.getProperty('CARNET_CLAUDE_KEY') && Date.now() - dernierEssai > 20 * 60000) {
    P.setProperty(kEssai, String(Date.now()));
    // 1er essai complet ; s'il est coupé ou illisible, 2e essai plus court
    [[prompt, 3500], [prompt + '\nIMPORTANT : JSON compact et valide, texte de 4 phrases maximum, rien avant ni après le JSON.', 2500]].some(function (e) {
      try { r = jsonClaude_(carnetDemander_(JSON.stringify({ tier: 'default', maxTokens: e[1], messages: [{ role: 'user', content: e[0] }] })).text); }
      catch (x) { r = null; journalErreur_('serveur', heros || '', 'maitreDuJeu', 'Claude : ' + x.message, ''); }
      return r && r.texte;
    });
    if (!r || !r.texte) journalErreur_('serveur', heros || '', 'maitreDuJeu', 'Chapitre illisible après 2 essais : chapitre de secours', '');
  }
  // Sans Claude (pas de clé, ou réponses illisibles) : un chapitre de secours, pour que la Saga et le vote ne restent jamais bloqués
  if (!r || !r.texte) {
    if (P.getProperty('CARNET_CLAUDE_KEY') && Date.now() - dernierEssai <= 20 * 60000 && dernierEssai) return mjPublic_(today, heros);
    r = chapitreSecours_(etats, boss);
  }
  const okIds = BENEDICTIONS.map(function (b) { return b.id; });
  const choix = (r.choix || []).slice(0, 2).map(function (c, i) { return { texte: String(c.texte || '').slice(0, 200), effet: okIds.indexOf(c.effet) >= 0 ? c.effet : (i ? 'joker' : 'tout') }; });
  while (choix.length < 2) choix.push({ texte: choix.length ? 'Prendre le chemin prudent' : 'Foncer tête baissée', effet: choix.length ? 'joker' : 'tout' });
  if (choix[0].effet === choix[1].effet) choix[1].effet = choix[0].effet === 'joker' ? 'tout' : 'joker';
  const destins = {};
  etats.forEach(function (e) {
    const q = (r.destins || {})[e.heros];
    if (!q || !q.nom) return;
    let nom = '✨ ' + String(q.nom).replace(/^✨\s*/, '').slice(0, 50);
    if (catalogue_(ss)[nom]) nom += ' ·' + lun.slice(5);
    destins[e.heros] = { nom: nom, desc: String(q.desc || '').slice(0, 200), carac: CARACS_.indexOf(q.carac) >= 0 ? q.carac : 'Volonté', dd: Math.max(8, Math.min(18, Number(q.dd) || 12)) };
  });
  return avecVerrou_(function () {
    if (lireMJ_(lun)) return mjPublic_(today, heros); // un compagnon l'a écrit entre-temps
    const resumesTous = sagaResumes_();
    const m = { lundi: lun, numero: resumesTous.length + 1, titre: String(r.titre || 'Chapitre ' + (resumesTous.length + 1)).slice(0, 80), texte: String(r.texte).slice(0, 1500), choix: choix, votes: {}, destins: destins };
    ecrireMJ_(lun, m);
    props_().setProperty('sagaResumes', JSON.stringify(resumesTous.concat([String(r.resume || m.titre).slice(0, 200)]).slice(-30)));
    ajouterFil_('📜 Chapitre ' + m.numero + ' de la Saga : « ' + m.titre + ' »', today);
    MEMO_ = {};
    return mjPublic_(today, heros);
  });
}
function voterMJ(choixIdx, heros) {
  return avecHeros_(heros, function () {
    const today = aujourdhui_(), lun = lundi_(today), m = lireMJ_(lun);
    if (!m) throw new Error('Le chapitre de la semaine n\'est pas encore écrit.');
    if (decisionMJ_(m, today) != null && (m.votes || {})[hc_().nom] != null) throw new Error('Le destin de la semaine est déjà scellé.');
    m.votes = m.votes || {}; m.votes[hc_().nom] = Number(choixIdx) === 1 ? 1 : 0;
    ecrireMJ_(lun, m);
    MEMO_ = {};
    return etat_(SpreadsheetApp.getActive());
  });
}

/* ====================== Calendrier des séries ======================
 * 12 semaines, une case par jour : quêtes faites, ratés, vacances.
 */
function calendrierSeries_(ent, today) {
  const lunFin = lundi_(today), debut = isoPlus_(lunFin, -77), jours = [];
  const par = {};
  ent.ctx.entrees.forEach(function (e) {
    if (ecart_(debut, e.date) < 0 || ecart_(e.date, today) < 0) return;
    const j = par[e.date] || (par[e.date] = { f: 0, r: 0 });
    if (e.statut === 'Fait') j.f++; else if (e.statut === 'Raté') j.r++;
  });
  for (let d = debut; ecart_(d, isoPlus_(lunFin, 6)) >= 0; d = isoPlus_(d, 1)) {
    const j = par[d] || { f: 0, r: 0 };
    jours.push({ d: d, f: j.f, r: j.r, v: enVacances_(ent.P.vacances, d) ? 1 : 0, futur: ecart_(today, d) > 0 ? 1 : 0, avant: estIso_(ent.debut) && ecart_(d, ent.debut) > 0 ? 1 : 0 });
  }
  // jours d'affilée sans raté (vacances comprises, depuis le début du suivi)
  let sansRate = 0;
  for (let d = today, i = 0; i < 400; i++, d = isoPlus_(d, -1)) {
    if (estIso_(ent.debut) && ecart_(d, ent.debut) > 0) break;
    const j = par[d] || ent.ctx.entrees.filter(function (e) { return e.date === d && e.statut === 'Raté'; }).length;
    const r = typeof j === 'number' ? j : j.r;
    if (r) break; sansRate++;
  }
  return { jours: jours, sansRate: sansRate };
}

/* ====================== Le camp de la Compagnie ======================
 * Aujourd'hui au camp, encouragements, pacte de la semaine, fil des faits marquants, récap du dimanche.
 */
const PACTES = [
  { id: 'zero_rate', texte: 'Zéro raté dans toute la Compagnie cette semaine' },
  { id: 'chaque_jour', texte: 'Chacun valide au moins une quête chaque jour (vacances exceptées)' },
  { id: 'annexes', texte: 'Au moins 3 quêtes annexes chacun' },
  { id: 'boss', texte: 'Abattre le boss de la semaine avant dimanche soir' }
];
const PACTE_XP = 150, ENCOURAGEMENT_XP = 10;
const MESSAGES_ENCOURAGEMENT = ['Courage, on lâche rien ! ⚔️', 'Bien joué aujourd\'hui ! 👏', 'Le boss tremble, continue ! 🐉', 'Fier de toi, compagnon. 🌅'];

function toutesEntrees_(ctx) {
  // toutes les lignes du Journal (tous les héros), y compris celles ajoutées pendant cet appel
  const vues = {}, out = [];
  ctx.toutes.concat(ctx.entrees).forEach(function (e) { if (!vues[e.ligne]) { vues[e.ligne] = 1; out.push(e); } });
  return out;
}
function herosDe_(e, premier) { return e.heros || premier; }
function vacancesDe_(ss, nom) {
  const tz = tz_(ss), premier = (lireHeros_(ss)[0] || {}).nom;
  return (bloc_(ss, 'P_VACANCES') || []).map(function (r) { return { debut: versIso_(r[0], tz), fin: versIso_(r[1], tz), heros: r.length > 2 ? String(r[2] || '') : '' }; })
    .filter(function (v) { return v.debut && (v.heros === nom || v.heros === 'Les deux' || v.heros === 'Tous' || (v.heros === '' && nom === premier)); });
}
function pacteCle_(lundi) { return 'pacte|' + lundi; }
function lirePacte_(lundi) { try { return JSON.parse(props_().getProperty(pacteCle_(lundi)) || 'null'); } catch (e) { return null; } }
function ecrirePacte_(lundi, p) { props_().setProperty(pacteCle_(lundi), JSON.stringify(p)); }

/** Le pacte est-il tenu (ou en bonne voie) ? Renvoie { ok, detail } sur la semaine lun..min(dim, jusquA). */
function evaluerPacte_(ss, ctx, id, lundi, jusqua) {
  const heros = lireHeros_(ss), premier = (heros[0] || {}).nom, dim = isoPlus_(lundi, 6);
  const fin = ecart_(jusqua, dim) < 0 ? jusqua : dim;
  const E = toutesEntrees_(ctx).filter(function (e) { return ecart_(lundi, e.date) >= 0 && ecart_(e.date, dim) >= 0; });
  if (id === 'zero_rate') {
    const r = E.filter(function (e) { return e.statut === 'Raté'; }).length;
    return { ok: r === 0, detail: r ? r + ' raté' + (r > 1 ? 's' : '') + ' dans la Compagnie' : 'aucun raté pour l\'instant' };
  }
  if (id === 'chaque_jour') {
    const manques = [];
    heros.forEach(function (h) {
      const vac = vacancesDe_(ss, h.nom);
      for (let d = lundi; ecart_(d, fin) >= 0; d = isoPlus_(d, 1)) {
        if (enVacances_(vac, d)) continue;
        const ok = E.some(function (e) { return e.date === d && e.statut === 'Fait' && herosDe_(e, premier) === h.nom; });
        if (!ok && d !== jusqua) manques.push(h.nom.split(' ')[0] + ' ' + JOURS_COURTS_[(new Date(d + 'T12:00:00').getDay() + 6) % 7]);
      }
    });
    return { ok: manques.length === 0, detail: manques.length ? 'jour manqué : ' + manques.join(', ') : 'tenu chaque jour jusqu\'ici' };
  }
  if (id === 'annexes') {
    const noms = nomsAnnexes_(ss);
    const parts = heros.map(function (h) {
      const n = E.filter(function (e) { return e.statut === 'Fait' && noms[e.quete] && herosDe_(e, premier) === h.nom; }).length;
      return { nom: h.nom.split(' ')[0], n: n };
    });
    return { ok: parts.every(function (p) { return p.n >= 3; }), detail: parts.map(function (p) { return p.nom + ' ' + Math.min(p.n, 3) + '/3'; }).join(' · ') };
  }
  if (id === 'boss') {
    const v = E.some(function (e) { return String(e.quete).indexOf('Trophée : ') === 0; });
    return { ok: v, detail: v ? 'boss abattu' : 'le boss tient encore' };
  }
  return { ok: false, detail: '' };
}
const JOURS_COURTS_ = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'];

function camp_(ss, ent, today) {
  const ctx = ent.ctx, heros = lireHeros_(ss), premier = (heros[0] || {}).nom, moi = hc_().nom;
  const props = props_();
  const E = toutesEntrees_(ctx);
  const lun = lundi_(today), lunPrec = isoPlus_(lun, -7);
  // Pacte de la semaine précédente : clôturé et récompensé une seule fois
  const pp = lirePacte_(lunPrec);
  if (pp && pp.accepte && !pp.statut) {
    const r = evaluerPacte_(ss, ctx, pp.id, lunPrec, isoPlus_(lunPrec, 6));
    pp.statut = r.ok ? 'Tenu' : 'Manqué'; pp.detail = r.detail;
    ecrirePacte_(lunPrec, pp);
    if (r.ok) {
      // L'XP du pacte est datée du lundi : elle frappe aussi le nouveau boss
      let x2 = 1;
      for (let d = lunPrec; ecart_(d, isoPlus_(lunPrec, 6)) >= 0; d = isoPlus_(d, 1)) { const ev = evenementDu_(d); if (ev && ev.effet.type === 'pacte') x2 = 2; }
      heros.forEach(function (h) { ajouterPour_(ctx, lun, 'Pacte tenu', 'Bonus', 'Pacte : ' + pp.texte, Math.round(PACTE_XP * x2 * (Number(h.equilibrage) || 1)), h.nom); });
      ajouterFil_('🤝 Pacte tenu : « ' + pp.texte + ' »', today);
    }
  }
  const pacte = lirePacte_(lun);
  const etatPacte = pacte ? Object.assign({}, pacte, pacte.accepte ? evaluerPacte_(ss, ctx, pacte.id, lun, today) : {}) : null;
  // Aujourd'hui au camp
  const aujourdhui = heros.map(function (h) {
    const n = E.filter(function (e) { return e.date === today && e.statut === 'Fait' && herosDe_(e, premier) === h.nom; }).length;
    return { nom: h.nom, faits: n, moi: h.nom === moi };
  });
  // Jours d'affilée où toute la Compagnie a agi
  let ensemble = 0;
  for (let d = today, i = 0; i < 60; i++, d = isoPlus_(d, -1)) {
    const tous = heros.every(function (h) { return E.some(function (e) { return e.date === d && e.statut === 'Fait' && herosDe_(e, premier) === h.nom; }); });
    if (tous) ensemble++; else if (i > 0) break;
  }
  // Fil des faits marquants (14 derniers jours)
  const fil = [];
  const vus = {};
  E.forEach(function (e) {
    if (ecart_(e.date, today) > 14) return;
    const qui = herosDe_(e, premier).split(' ')[0];
    if (String(e.quete).indexOf('Trophée : ') === 0) { const k = 'T' + e.quete; if (!vus[k]) { vus[k] = 1; fil.push({ date: e.date, texte: '⚔️ La Compagnie a abattu ' + e.quete.replace('Trophée : ', '') }); } }
    else if (e.statut === 'Bonus' && /^Série/.test(e.note)) fil.push({ date: e.date, texte: '🔥 ' + qui + ' : ' + e.note.toLowerCase() + ' sur « ' + e.quete + ' »' });
    else if (e.statut === 'Bonus' && e.note === 'Retour du héros') fil.push({ date: e.date, texte: '💪 ' + qui + ' se relève après être tombé' });
    else if (e.statut === 'Bonus' && /^Lexique/.test(e.quete)) fil.push({ date: e.date, texte: '📖 ' + qui + ' : ' + e.quete.replace('Lexique : ', '') + ' maîtrisés' });
  });
  heros.forEach(function (h) {
    const a = titresAcquis_(h);
    Object.keys(a).forEach(function (id) {
      const t = TITRES.filter(function (x) { return x.id === id; })[0];
      if (t && ecart_(a[id], today) <= 14) fil.push({ date: a[id], texte: '🏅 ' + h.nom.split(' ')[0] + ' a gagné le titre « ' + t.nom + ' »' });
    });
  });
  lireFil_().forEach(function (f) { if (ecart_(f.date, today) <= 14) fil.push(f); });
  fil.sort(function (a, b) { return ecart_(a.date, b.date); });
  // Encouragement déjà envoyé aujourd'hui ?
  const dernierEnc = props.getProperty(cle_('encourageLe')) || '';
  // Récap de la semaine passée
  const recap = heros.map(function (h) {
    const xp = E.filter(function (e) { return herosDe_(e, premier) === h.nom && ecart_(lunPrec, e.date) >= 0 && ecart_(e.date, isoPlus_(lunPrec, 6)) >= 0; })
      .reduce(function (t, e) { return t + (e.statut === 'Fait' ? e.xpFait : 0) + (e.bonus || 0); }, 0);
    const faits = E.filter(function (e) { return herosDe_(e, premier) === h.nom && e.statut === 'Fait' && ecart_(lunPrec, e.date) >= 0 && ecart_(e.date, isoPlus_(lunPrec, 6)) >= 0; }).length;
    return { nom: h.nom, xp: Math.round(xp), faits: faits };
  });
  return {
    aujourdhui: aujourdhui, ensemble: ensemble, fil: fil.slice(0, 10),
    pacte: etatPacte, pactePrecedent: pp, modeles: PACTES, lundi: lun,
    encourage: dernierEnc === today, messages: MESSAGES_ENCOURAGEMENT,
    recap: { lundi: lunPrec, heros: recap, chronique: props.getProperty('chronique|' + lunPrec) || '', pacte: pp }
  };
}
function lireFil_() { try { return JSON.parse(props_().getProperty('campFil') || '[]'); } catch (e) { return []; } }
function ajouterFil_(texte, date) {
  const f = lireFil_().concat([{ date: date, texte: texte }]).slice(-30);
  props_().setProperty('campFil', JSON.stringify(f));
}

function encourager(message, heros) {
  return avecHeros_(heros, function () {
    const ss = SpreadsheetApp.getActive(), props = props_(), today = aujourdhui_();
    if (props.getProperty(cle_('encourageLe')) === today) throw new Error('Tu as déjà encouragé ta Compagnie aujourd\'hui.');
    const msg = String(message || '').trim().slice(0, 120) || MESSAGES_ENCOURAGEMENT[0];
    const ctx = contexteJournal_(ss, tz_(ss));
    lireHeros_(ss).forEach(function (h) {
      if (h.index === hc_().index) return;
      ajouterPour_(ctx, today, 'Encouragement de ' + hc_().nom.split(' ')[0], 'Bonus', 'Moral', ENCOURAGEMENT_XP, h.nom);
      const k = cle_('celebrationsEnAttente', h);
      let file = []; try { file = JSON.parse(props.getProperty(k) || '[]'); } catch (x) {}
      props.setProperty(k, JSON.stringify(file.concat([{ titre: '⚔️ ' + hc_().nom.split(' ')[0] + ' t\'encourage', texte: msg + ' · +' + ENCOURAGEMENT_XP + ' XP de moral' }]).slice(-20)));
    });
    props.setProperty(cle_('encourageLe'), today);
    ajouterFil_('📣 ' + hc_().nom.split(' ')[0] + ' encourage la Compagnie : « ' + msg + ' »', today);
    MEMO_ = {};
    return etat_(ss);
  });
}
function proposerPacte(id, heros) {
  return avecHeros_(heros, function () {
    const modele = PACTES.filter(function (p) { return p.id === id; })[0];
    if (!modele) throw new Error('Pacte inconnu');
    const lun = lundi_(aujourdhui_()), actuel = lirePacte_(lun);
    if (actuel && actuel.accepte) throw new Error('Le pacte de la semaine est déjà scellé.');
    ecrirePacte_(lun, { id: modele.id, texte: modele.texte, par: hc_().nom, accepte: false });
    return etat_(SpreadsheetApp.getActive());
  });
}
function accepterPacte(heros) {
  return avecHeros_(heros, function () {
    const lun = lundi_(aujourdhui_()), p = lirePacte_(lun);
    if (!p) throw new Error('Aucun pacte proposé cette semaine.');
    if (p.par === hc_().nom) throw new Error('C\'est à ton compagnon d\'accepter ton pacte.');
    p.accepte = true; p.scelleLe = aujourdhui_();
    ecrirePacte_(lun, p);
    ajouterFil_('🤝 Pacte scellé : « ' + p.texte + ' »', aujourdhui_());
    return etat_(SpreadsheetApp.getActive());
  });
}

/* ---------- Claude dans la Compagnie : chronique, paroles du boss, mot du coach (une génération, gardée) ---------- */
function claudeCourt_(prompt) {
  if (!props_().getProperty('CARNET_CLAUDE_KEY')) return '';
  try {
    let t = carnetDemander_(JSON.stringify({ tier: 'quick', maxTokens: 1500, messages: [{ role: 'user', content: prompt + ' Reste bref et termine toujours ta dernière phrase.' }] })).text.trim();
    // si la réponse a été coupée en pleine phrase, on s'arrête à la dernière phrase complète
    if (t && !/[.!?…»)"]$/.test(t)) { const k = Math.max(t.lastIndexOf('. '), t.lastIndexOf('! '), t.lastIndexOf('? ')); if (k > 40) t = t.slice(0, k + 1); }
    return t;
  }
  catch (e) { return ''; }
}
function chroniqueSemaine(heros) {
  const ss = SpreadsheetApp.getActive(), props = props_();
  const vite = props.getProperty('chronique|' + isoPlus_(lundi_(aujourdhui_()), -7));
  if (vite) return vite;
  const st = getState(heros), c = st.camp;
  if (!c) return '';
  const k = 'chronique|' + c.recap.lundi;
  const deja = props.getProperty(k);
  if (deja) return deja;
  const lignes = c.recap.heros.map(function (h) { return h.nom + ' : ' + h.faits + ' quêtes, ' + h.xp + ' XP'; }).join(' ; ');
  const fil = c.fil.map(function (f) { return f.texte; }).slice(0, 6).join(' ; ');
  const texte = claudeCourt_('Écris en français la chronique épique (4 phrases maximum, ton de conte, un peu d\'humour, tutoiement collectif « vous ») de la semaine de la Compagnie de l\'Aube, deux héros qui tiennent leurs bonnes habitudes : ' + lignes +
    '. Faits marquants : ' + (fil || 'aucun') + '. Pacte : ' + (c.recap.pacte ? c.recap.pacte.texte + ' (' + (c.recap.pacte.statut || 'en cours') + ')' : 'aucun') + '. Pas de markdown, pas de titre.');
  if (texte) props.setProperty(k, texte);
  return texte;
}
function paroleBoss(fin, heros) {
  const props = props_();
  const vite = props.getProperty('bossParole|' + lundi_(aujourdhui_()) + (fin ? '|fin' : ''));
  if (vite) return vite;
  const st = getState(heros), b = st.boss && st.boss.semaine;
  if (!b || b.statut === 'À venir') return '';
  const vaincu = b.statut === 'Vaincu';
  const k = 'bossParole|' + b.debut + (vaincu ? '|fin' : '');
  const deja = props.getProperty(k);
  if (deja) return deja;
  const texte = claudeCourt_(vaincu
    ? 'Tu es ' + b.nom + ' (' + b.incarne + '), un boss vaincu par la Compagnie de l\'Aube. Écris en français ta dernière réplique (2 phrases, théâtrale et drôle, beau perdant). Pas de markdown.'
    : 'Tu es ' + b.nom + ' (' + b.incarne + '), un boss de jeu de rôle qui affronte cette semaine deux héros qui tiennent leurs bonnes habitudes. Faible à : ' + b.faible + ' ; résiste à : ' + b.resiste + '. Écris en français ta provocation de début de semaine (2 phrases, menaçante et drôle, sans dévoiler ta faiblesse directement). Pas de markdown.');
  if (texte) props.setProperty(k, texte);
  return texte;
}
function motDuCoach(heros) {
  const props = props_();
  const vite = heros && props.getProperty('coach|' + isoPlus_(lundi_(aujourdhui_()), -7) + '|' + heros);
  if (vite) return vite;
  const st = getState(heros), b = st.bilan && st.bilan.precedente;
  if (!b) return '';
  const k = 'coach|' + b.lundi + '|' + st.heros;
  const deja = props.getProperty(k);
  if (deja) return deja;
  const series = st.habitudes.map(function (h) { return h.nom + ' (' + h.semaine + '/' + h.objectif + ' cette semaine, série ' + h.serie + ' j)'; }).join(' ; ');
  const texte = claudeCourt_('Tu es le mentor bienveillant mais exigeant de ' + st.heros + '. Bilan de sa semaine passée : ' + b.faits + ' quêtes faites, ' + b.rates + ' ratés, ' + b.aJour + '/' + b.total + ' habitudes à jour, ' + b.xp + ' XP. Ses quêtes : ' + series +
    '. En 3 phrases en français (tutoiement) : ce qui a bien marché, ce qui a coincé, et LA quête à sécuriser en priorité cette semaine. Pas de markdown.');
  if (texte) props.setProperty(k, texte);
  return texte;
}

/* ====================== Titres (hauts faits) ======================
 * Des titres à MÉRITER : longues séries, semaines parfaites, boss abattus… Une fois gagné, un titre est acquis pour toujours.
 * Les titres secrets restent cachés (« ??? ») tant qu'ils ne sont pas débloqués.
 * Le héros choisit celui qui s'affiche sous son nom (visible par la Compagnie).
 */
const TITRES = [
  { id: 'golem', nom: 'Pourfendeur de Golems', desc: 'Abattre un boss de la semaine avec la Compagnie.' },
  { id: 'chasseur', nom: 'Chasseur du Crépuscule', desc: 'Abattre 10 boss de la semaine.' },
  { id: 'lunes', nom: 'Briseur de Lunes', desc: 'Abattre 3 boss du mois.' },
  { id: 'fleau', nom: 'Fléau du Crépuscule', desc: 'Être le meilleur frappeur de la Compagnie sur 5 boss abattus.' },
  { id: 'tenace', nom: 'Le Tenace', desc: 'Tenir une série de 30 jours sur une quête.' },
  { id: 'inebranlable', nom: 'L\'Inébranlable', desc: 'Tenir une série de 100 jours sur une quête.' },
  { id: 'fer', nom: 'Main de fer', desc: '4 semaines parfaites : toutes les quêtes à jour, zéro raté.' },
  { id: 'polyglotte', nom: 'Polyglotte de l\'Aube', desc: '40 séances d\'anglais accomplies.', quete: /anglais/i },
  { id: 'foulee', nom: 'Foulée d\'acier', desc: '50 sorties de course accomplies.', quete: /course|footing|courir/i },
  { id: 'revenant', nom: 'Le Revenant', desc: 'Tomber à 0 PV… et se relever.' },
  { id: 'defieur', nom: 'Celui qui défie le destin', desc: 'Un échec critique au d20, et toutes les quêtes du jour accomplies quand même.', secret: true },
  { id: 'infaillible', nom: 'L\'Aube infaillible', desc: '30 jours d\'affilée sans le moindre raté.', secret: true },
  { id: 'sommeil', nom: 'Gardien du sommeil', desc: 'Une série de 21 jours sur le coucher.', secret: true, quete: /coucher|sommeil/i },
  { id: 'pur', nom: 'Le Pur', desc: 'Un mois entier sans raté ni joker.', secret: true },
  { id: 'tresorier', nom: 'Le Trésorier', desc: '6 bilans budget au palier 300 €.', secret: true, quete: /300 ?€/ },
  { id: 'lexique', nom: 'Le Lexicographe', desc: '100 mots d\'anglais avancés (B2+) maîtrisés.', secret: true },
  { id: 'freres', nom: 'Frères d\'armes', desc: 'Toute la Compagnie a agi chaque jour pendant 14 jours d\'affilée.', secret: true }
];
function titresAcquis_(h) {
  try { return JSON.parse(props_().getProperty(cle_('titres', h)) || '{}'); } catch (e) { return {}; }
}
function titreChoisiDe_(h) {
  const id = props_().getProperty(cle_('titreChoisi', h)) || '';
  const t = TITRES.filter(function (x) { return x.id === id; })[0];
  return t && titresAcquis_(h)[id] ? t.nom : '';
}
function choisirTitre(id, heros) {
  return avecHeros_(heros, function () {
    const props = props_();
    if (id && !titresAcquis_()[id]) throw new Error('Ce titre n\'est pas encore gagné.');
    if (id) props.setProperty(cle_('titreChoisi'), id); else props.deleteProperty(cle_('titreChoisi'));
    return etat_(SpreadsheetApp.getActive());
  });
}

function titres_(ss, ent, today, nouveaux) {
  const props = ent.props, k = cle_('titres');
  const acquis = titresAcquis_();
  const ctx = ent.ctx, debut = ent.debut;
  const faits = function (re) { return ctx.entrees.filter(function (e) { return e.statut === 'Fait' && re.test(e.quete); }).length; };
  const record = function (re) {
    return ent.habs.reduce(function (m, h) {
      if (re && !re.test(h.nom)) return m;
      const s = ent.series[h.nom] || {};
      return Math.max(m, Number(s.record) || 0, Number(s.jours) || 0);
    }, 0);
  };
  const tests = {
    golem: function () { return stats().semaine >= 1; },
    chasseur: function () { return stats().semaine >= 10; },
    lunes: function () { return stats().mois >= 3; },
    fleau: function () { return stats().fleau >= 5; },
    tenace: function () { return record() >= 30; },
    inebranlable: function () { return record() >= 100; },
    fer: function () { return semainesParfaites() >= 4; },
    polyglotte: function () { return faits(/anglais/i) >= 40; },
    foulee: function () { return faits(/course|footing|courir/i) >= 50; },
    revenant: function () { return ctx.entrees.some(function (e) { return e.statut === 'Bonus' && e.note === 'Retour du héros'; }); },
    defieur: function () {
      const d = lireD20_(props)[today];
      if (!d || d.de !== 1) return false;
      const dues = ent.habs.filter(function (h) { const ech = ent.echeances[h.nom]; return ech && ech.du && !enPause_(ent.P, h.nom, today); });
      return dues.length > 0 && dues.every(function (h) { return ctx.entrees.some(function (e) { return e.quete === h.nom && e.date === today && e.statut === 'Fait'; }); });
    },
    infaillible: function () {
      if (!estIso_(debut) || ecart_(debut, today) < 30) return false;
      let dernier = '';
      ctx.entrees.forEach(function (e) { if (e.statut === 'Raté' && (dernier === '' || ecart_(dernier, e.date) > 0)) dernier = e.date; });
      const depuis = dernier ? isoPlus_(dernier, 1) : debut;
      return ecart_(depuis, today) >= 30 && ctx.entrees.some(function (e) { return e.statut === 'Fait' && ecart_(depuis, e.date) >= 0; });
    },
    sommeil: function () { return record(/coucher|sommeil/i) >= 21; },
    pur: function () {
      // mois calendaire terminé, entièrement après le début du suivi
      const m = Number(today.slice(5, 7)), a = Number(today.slice(0, 4));
      const prec = m === 1 ? (a - 1) + '-12' : a + '-' + String(m - 1).padStart(2, '0');
      const premier = prec + '-01';
      if (!estIso_(debut) || ecart_(debut, premier) < 0) return false;
      const du = ctx.entrees.filter(function (e) { return String(e.date).slice(0, 7) === prec; });
      return du.some(function (e) { return e.statut === 'Fait'; }) && !du.some(function (e) { return e.statut === 'Raté' || e.statut === 'Repos'; });
    },
    tresorier: function () { return faits(/300 ?€/) >= 6; },
    lexique: function () { return Number(props.getProperty(cle_('lexiqueMots')) || 0) >= 100; },
    freres: function () {
      const heros = lireHeros_(ss);
      if (heros.length < 2) return false;
      const premier = heros[0].nom;
      let suite = 0;
      for (let d = today, i = 0; i < 40; i++, d = isoPlus_(d, -1)) {
        if (estIso_(debut) && ecart_(debut, d) < 0) break;
        const tous = heros.every(function (h) {
          return ctx.toutes.concat(ctx.entrees).some(function (e) { return e.date === d && e.statut === 'Fait' && (e.heros || premier) === h.nom; });
        });
        if (tous) suite++; else if (i > 0) break; // aujourd'hui peut ne pas être encore fini
        if (suite >= 14) return true;
      }
      return false;
    }
  };
  let st = null;
  function stats() {
    if (st) return st;
    st = { semaine: 0, mois: 0, fleau: 0 };
    const sh = ss.getSheetByName(ONGLET_COMBATS);
    if (!sh) return st;
    [[COMBATS_SEMAINE, 'semaine'], [COMBATS_MOIS, 'mois']].forEach(function (z) {
      sh.getRange(z[0][0], 1, z[0][1] - z[0][0] + 1, 13).getValues().forEach(function (r) {
        if (r[11] !== '⚔ Vaincu') return;
        st[z[1]]++;
        if (r[12] === hc_().nom) st.fleau++;
      });
    });
    // boss sortis du calendrier (il avance tout seul) : comptés dans les archives
    const A = sh.getRange(4, COL_ARCHIVES_BOSS, 7, 1).getValues().map(function (r) { return Number(r[0]) || 0; });
    st.semaine += A[0]; st.mois += A[2]; st.fleau += hc_().index === 0 ? A[4] : hc_().index === 1 ? A[5] : 0;
    return st;
  }
  function semainesParfaites() {
    if (!estIso_(debut)) return 0;
    let n = 0;
    for (let w = lundi_(debut); ecart_(isoPlus_(w, 6), isoPlus_(today, -1)) >= 0; w = isoPlus_(w, 7)) {
      const b = bilan_(ctx, ent.habs, w, ent.P);
      if (b.total > 0 && b.aJour === b.total && b.rates === 0) n++;
    }
    return n;
  }
  let change = false;
  TITRES.forEach(function (t) {
    if (acquis[t.id]) return;
    let ok = false;
    try { ok = tests[t.id](); } catch (e) {}
    if (!ok) return;
    acquis[t.id] = today; change = true;
    nouveaux.push({ titre: '🏅 Titre débloqué' + (t.secret ? ' (secret !)' : ''), texte: '« ' + t.nom + ' » · ' + t.desc });
  });
  if (change) props.setProperty(k, JSON.stringify(acquis));
  const choisi = props.getProperty(cle_('titreChoisi')) || '';
  return {
    choisi: acquis[choisi] ? choisi : '',
    liste: TITRES.map(function (t) {
      const a = !!acquis[t.id];
      return { id: t.id, nom: a || !t.secret ? t.nom : '???', desc: a || !t.secret ? t.desc : 'Titre secret : à toi de le découvrir.', secret: !!t.secret, obtenu: a ? acquis[t.id] : '' };
    })
  };
}

/* ====================== Carnet de quêtes (anglais, course, renfo) ======================
 * Onglet réservé à un seul héros (Paramètres du script « CARNET_HEROS », sinon le 1er héros).
 * Sa progression est un bloc JSON dans l'onglet caché « Carnet (sauvegarde) » de ce Sheet.
 * L'IA passe par l'API Claude : la clé reste dans les propriétés du script, jamais sur le téléphone.
 * Une mission, une conversation, une séance de course ou de renfo terminée valide la quête de la Compagnie correspondante.
 */
const CARNET_SAUVEGARDE = 'Carnet (sauvegarde)', CARNET_HISTORIQUE = 'Carnet · historique';
const CARNET_ANCIEN_SHEET = '1hv1mPF20osewk2gxkeVxZoPHrIM6uONIQZ9iLRfAqeo'; // ancien Carnet : repris une fois au premier lancement
const CARNET_MODELE_SOIGNE = 'claude-sonnet-5-5', CARNET_MODELE_RAPIDE = 'claude-haiku-5-5', CARNET_MAX_TOKENS = 6000, CARNET_MORCEAU = 40000;
const CARNET_QUETES = { en: /^anglais/i, run: /^course/i, str: /^renfo/i };

function carnetHeros_(ss) {
  const p = props_().getProperty('CARNET_HEROS');
  if (p) return p;
  const h = lireHeros_(ss)[0];
  return h ? h.nom : '';
}
function carnetPourMoi_(ss) { try { return hc_().nom === carnetHeros_(ss); } catch (e) { return false; } }
function carnetGarde_(heros) {
  const ss = SpreadsheetApp.getActive();
  if (!heros || heros !== carnetHeros_(ss)) throw new Error('Le Carnet de quêtes est réservé à ' + carnetHeros_(ss) + '.');
  return ss;
}
/** À exécuter UNE fois depuis l'éditeur (bouton Exécuter) : Google demande l'autorisation d'appeler l'API Claude. */
function autoriserCarnet() {
  UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', { method: 'get', muteHttpExceptions: true });
  try { SpreadsheetApp.openById(CARNET_ANCIEN_SHEET).getName(); } catch (e) {}
  UrlFetchApp.fetch('https://intervals.icu/api/v1/athlete/0', { muteHttpExceptions: true });
  Logger.log('Carnet autorisé ✔');
}

function carnetLire_(ss) {
  const sh = ss.getSheetByName(CARNET_SAUVEGARDE);
  if (!sh || sh.getLastRow() === 0) return '';
  return sh.getRange(1, 1, sh.getLastRow(), 1).getValues().map(function (r) { return String(r[0]).replace(/^~/, ''); }).join('');
}
function carnetEcrire_(ss, json) {
  let sh = ss.getSheetByName(CARNET_SAUVEGARDE);
  if (!sh) { sh = ss.insertSheet(CARNET_SAUVEGARDE); sh.hideSheet(); }
  const rows = [];
  for (let i = 0; i < json.length; i += CARNET_MORCEAU) rows.push(['~' + json.slice(i, i + CARNET_MORCEAU)]);
  sh.clearContents();
  sh.getRange(1, 1, rows.length, 1).setNumberFormat('@').setValues(rows);
}

function carnetCharger(heros) {
  const ss = carnetGarde_(heros);
  let json = carnetLire_(ss);
  if (!json) { // premier lancement : on reprend la sauvegarde de l'ancien Carnet
    try {
      const old = SpreadsheetApp.openById(CARNET_ANCIEN_SHEET).getSheetByName('Sauvegarde (ne pas modifier)');
      if (old && old.getLastRow() > 0) {
        json = old.getRange(1, 1, old.getLastRow(), 1).getValues().map(function (r) { return String(r[0]).replace(/^~/, ''); }).join('');
        JSON.parse(json);
        carnetEcrire_(ss, json);
      }
    } catch (e) { json = ''; }
  }
  // Vacances du héros : le programme de course et de renfo se met en pause pendant ces semaines
  let vacances = [];
  try {
    vacances = avecHeros_(heros, function () {
      const v = lireVacances_(ss).map(function (v) { return { debut: v.debut, fin: v.fin || '' }; });
      // Pauses de la quête « Course » (voyage compris) : le plan saute aussi ces semaines
      const P = lireReglages_(props_()).pauses || {};
      Object.keys(P).filter(function (n) { return CARNET_QUETES.run.test(n); }).forEach(function (n) {
        (P[n] || []).forEach(function (p) { if (p && p.debut) v.push({ debut: p.debut, fin: p.fin || '', pause: true }); });
      });
      return v;
    });
  } catch (e) {}
  return { json: json || null, vacances: vacances };
}

/** Nombre d'entrées datées d'un jour donné, par type (anglais, course, renfo). */
function carnetCompte_(st, iso) {
  const n = { en: 0, run: 0, str: 0 };
  ((st && st.en && st.en.sessions) || []).forEach(function (s) { if (s.date === iso) n.en++; });
  const logs = function (o, k) { Object.keys(o || {}).forEach(function (x) { if (o[x] && o[x].date === iso) n[k]++; }); };
  logs(st && st.run && st.run.logs, 'run');
  logs(st && st.str && st.str.logs, 'str');
  return n;
}

function carnetSauver(json, heros) {
  const ss = carnetGarde_(heros);
  if (typeof json !== 'string' || json.length > 5000000) throw new Error('Sauvegarde invalide');
  const neuf = JSON.parse(json);
  let ancien = null, brutAncien = '';
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) throw new Error('OCCUPE : le Sheet termine une autre action, réessaie dans un instant.');
  try {
    brutAncien = carnetLire_(ss);
    try { ancien = JSON.parse(brutAncien || 'null'); } catch (e) {}
    // Version de base (Carnet 2.4) : un appareil qui envoie une copie plus ancienne que celle de la Sheet ne l'écrase plus.
    // On lui renvoie la version de la Sheet : il fusionne les deux et renvoie le tout.
    const majAncien = (ancien && Number(ancien._maj)) || 0;
    if (majAncien && neuf._base !== undefined && neuf._base !== null && Number(neuf._base) < majAncien) {
      return { conflit: true, json: brutAncien, maj: majAncien, valides: [] };
    }
    neuf._maj = Math.max(Date.now(), majAncien + 1);
    json = JSON.stringify(neuf);
    carnetEcrire_(ss, json);
  } finally { lock.releaseLock(); }
  // Quêtes de la Compagnie à valider : une entrée nouvelle aujourd'hui (ou hier) dans le Carnet
  const today = aujourdhui_();
  const aValider = [];
  // Jusqu'à 7 jours en arrière : une sortie de la montre synchronisée en retard remplace le raté automatique
  [0, 1, 2, 3, 4, 5, 6].map(function (k) { return [isoPlus_(today, -k), k]; }).forEach(function (j) {
    const a = carnetCompte_(ancien, j[0]), b = carnetCompte_(neuf, j[0]);
    Object.keys(CARNET_QUETES).forEach(function (k) { if (b[k] > a[k]) aValider.push({ type: k, hier: j[1], date: j[0] }); });
  });
  const changeHisto = (
    ((ancien && ancien.en && ancien.en.sessions) || []).length !== ((neuf.en && neuf.en.sessions) || []).length ||
    Object.keys((ancien && ancien.run && ancien.run.logs) || {}).length !== Object.keys((neuf.run && neuf.run.logs) || {}).length ||
    Object.keys((ancien && ancien.str && ancien.str.logs) || {}).length !== Object.keys((neuf.str && neuf.str.logs) || {}).length);
  if (changeHisto || !ss.getSheetByName(CARNET_HISTORIQUE)) { try { carnetHistorique_(ss, neuf); } catch (e) {} }
  // Lexique avancé : paliers d'XP d'Intelligence (25, 50, 100 puis tous les 100 mots B2+ maîtrisés)
  const lexique = carnetLexique_(ss, neuf, heros);
  if (!aValider.length && !lexique.length) return { valides: [], maj: neuf._maj };
  if (!aValider.length) return { valides: lexique, etat: getState(heros), maj: neuf._maj };
  // Quelles quêtes, et pas déjà faites ce jour-là
  const choix = avecHeros_(heros, function () {
    const ctx = contexteJournal_(ss, tz_(ss));
    const noms = lireHabitudes_(ss).map(function (h) { return h.nom; });
    return aValider.map(function (v) {
      const nom = noms.filter(function (n) { return CARNET_QUETES[v.type].test(n); })[0];
      if (!nom) return null;
      const deja = ctx.entrees.some(function (e) { return e.quete === nom && e.date === v.date && e.statut === 'Fait'; });
      return deja || compteeAilleurs_(ctx, nom, v.date) ? null : { nom: nom, recul: v.hier, date: v.date };
    }).filter(Boolean);
  });
  let etat = null;
  const valides = [];
  choix.forEach(function (c) {
    try {
      if (c.recul <= 1) etat = logAction(c.nom, 'Fait', c.recul === 1, heros);
      else etat = rattraperSeance_(c.nom, c.date, heros);
      valides.push(c.nom);
    } catch (e) {}
  });
  return { valides: valides.concat(lexique), etat: etat || getState(heros), maj: neuf._maj };
}

/** Séance faite il y a 2 à 6 jours (montre synchronisée en retard) : le raté ou le joker automatique est remplacé. */
function rattraperSeance_(quete, date, heros) {
  return avecHeros_(heros, function () {
    const ss = SpreadsheetApp.getActive(), ctx = contexteJournal_(ss, tz_(ss));
    ctx.entrees.filter(function (e) { return e.quete === quete && e.date === date && /\(auto\)$/.test(e.note); })
      .forEach(function (e) { effacer_(ctx, e); });
    const comp = compenserSeance_(ss, ctx, quete, date);
    ajouter_(ctx, date, quete, 'Fait', (comp ? comp + ' · ' : '') + 'Montre (saisie le ' + aujourdhui_().slice(8, 10) + '/' + aujourdhui_().slice(5, 7) + ')', 0);
    MEMO_ = {};
    return etat_(ss);
  });
}
const LEXIQUE_PALIERS = [[25, 150], [50, 250], [100, 500]];
function carnetLexique_(ss, st, heros) {
  const rang = { B2: 4, C1: 5, C2: 6 };
  const n = ((st.en && st.en.deck) || []).filter(function (c) { return rang[c.lvl] && c.reps > 0 && Number(c.stab) >= 21; }).length;
  const gagnes = [];
  // Rien à faire (cas le plus courant) : pas de lecture du Journal
  const h0 = lireHeros_(ss).filter(function (h) { return h.nom === heros; })[0];
  const P0 = props_();
  const dejaPaye = Number(P0.getProperty(cle_('lexiquePalier', h0)) || 0);
  const prochain = dejaPaye < 25 ? 25 : dejaPaye < 50 ? 50 : dejaPaye < 100 ? 100 : dejaPaye + 100;
  if (String(n) !== P0.getProperty(cle_('lexiqueMots', h0))) P0.setProperty(cle_('lexiqueMots', h0), String(n));
  if (n < prochain) return gagnes;
  avecHeros_(heros, function () {
    const props = props_();
    props.setProperty(cle_('lexiqueMots'), String(n));
    let deja = Number(props.getProperty(cle_('lexiquePalier')) || 0); // dernier palier payé (nombre de mots)
    const paliers = LEXIQUE_PALIERS.slice();
    for (let p = 200; p <= n; p += 100) paliers.push([p, 500]);
    const ctx = contexteJournal_(ss, tz_(ss)), today = aujourdhui_();
    paliers.forEach(function (pl) {
      if (pl[0] <= deja || pl[0] > n) return;
      const nom = 'Lexique : ' + pl[0] + ' mots avancés';
      ajouter_(ctx, today, nom, 'Bonus', 'Carnet de quêtes', pl[1]);
      const e = ctx.entrees[ctx.entrees.length - 1];
      ctx.journal.getRange(e.ligne, 6).setValue('Intelligence'); // l'XP nourrit l'Intelligence
      deja = pl[0]; gagnes.push(nom + ' (+' + pl[1] + ' XP d\'Intelligence)');
    });
    props.setProperty(cle_('lexiquePalier'), String(deja));
  });
  return gagnes;
}

function carnetHistorique_(ss, st) {
  const MONDES = { travail: 'Travail', voyage: 'Voyage', series: 'Séries' };
  const rows = [];
  ((st.en && st.en.sessions) || []).forEach(function (s) {
    const res = s.won === undefined ? '' : (s.won ? 'Boss vaincu' : 'Boss invaincu');
    const etoiles = s.stars != null ? '★'.repeat(s.stars) + '☆'.repeat(3 - s.stars) : '';
    rows.push([s.date, 'Anglais', s.mod === 'conv' ? 'Conversation orale' + (s.tours ? ' · ' + s.tours + ' répliques' : '') : 'Mission ' + (MONDES[s.mod] || s.mod || '') + ' · chapitre ' + ((s.unit || 0) + 1),
      [etoiles, res, s.xp != null ? '+' + s.xp + ' XP' : ''].filter(Boolean).join(' · '), s.min ? s.min + ' min' : '', '']);
  });
  Object.keys((st.run && st.run.logs) || {}).forEach(function (k) {
    const l = st.run.logs[k], p = k.split('-').map(Number);
    rows.push([l.date, 'Course', 'Semaine ' + (p[0] + 1) + ' · séance ' + (p[1] + 1), l.rpe ? 'Effort ' + l.rpe + '/10' : '', '', l.note || '']);
  });
  Object.keys((st.str && st.str.logs) || {}).forEach(function (k) {
    const l = st.str.logs[k];
    rows.push([l.date, 'Renfo', 'Jeudi · semaine ' + (Number(k) + 1), l.rpe ? 'Effort ' + l.rpe + '/10' : '', l.min ? l.min + ' min' : '', '']);
  });
  rows.sort(function (a, b) { return String(b[0]).localeCompare(String(a[0])); });
  let sh = ss.getSheetByName(CARNET_HISTORIQUE);
  if (!sh) sh = ss.insertSheet(CARNET_HISTORIQUE);
  sh.clear();
  sh.getRange(1, 1, 1, 6).setValues([['Date', 'Quête', 'Séance', 'Résultat', 'Durée', 'Note']]).setFontWeight('bold').setBackground('#2d2150').setFontColor('#d3a84a');
  if (rows.length) sh.getRange(2, 1, rows.length, 6).setValues(rows);
  sh.setFrozenRows(1);
}

/* ---------- Montre Garmin via intervals.icu (clé personnelle, jamais sur le téléphone) ---------- */
const QUETE_PAS = /10[ .  ]?000 pas/i;
/**
 * Pas du jour lus sur la montre (données « wellness » d'intervals.icu) : une quête « 10 000 pas » du héros
 * se valide toute seule dès 10 000 pas (aujourd'hui, et hier si la montre a synchronisé en retard).
 * Lecture au plus toutes les 20 minutes. Seulement pour le héros relié à intervals.icu (celui du Carnet).
 */
function pasMontre_(ss) {
  const props = props_();
  if (!props.getProperty('CARNET_INTERVALS_ID') || !props.getProperty('CARNET_INTERVALS_KEY')) return null;
  if (hc_().nom !== carnetHeros_(ss)) return null;
  const today = aujourdhui_(), cache = CacheService.getScriptCache();
  const quetes = lireHabitudes_(ss).map(function (h) { return h.nom; }).concat(Object.keys(catalogue_(ss)))
    .filter(function (n, i, a) { return QUETE_PAS.test(n) && a.indexOf(n) === i && estAMoiQuete_(ss, n); });
  const lire = function (d) {
    const k = 'pas|' + d, c = cache.get(k);
    if (c !== null) return Number(c);
    let n = 0;
    try { const w = intervalsAppel_('/wellness/' + d); n = Number(w && w.steps) || 0; } catch (e) { n = 0; }
    cache.put(k, String(n), d === today ? 1200 : 21600);
    return n;
  };
  const pas = { aujourdhui: lire(today) };
  props.setProperty(cle_('pasDuJour'), JSON.stringify({ date: today, pas: pas.aujourdhui }));
  if (!quetes.length) return pas;
  const ctx = contexteJournal_(ss, tz_(ss));
  [isoPlus_(today, -1), today].forEach(function (d) {
    const n = d === today ? pas.aujourdhui : lire(d);
    if (n < 10000) return;
    quetes.forEach(function (q) {
      if (ctx.entrees.some(function (e) { return e.quete === q && e.date === d && e.statut === 'Fait'; })) return;
      if (!quetePossibleCeJour_(ss, q, d)) return;
      saisir_(ss, q, 'Fait', d, '⌚ Montre : ' + n.toLocaleString('fr-FR') + ' pas');
      ctx.entrees.push({ quete: q, date: d, statut: 'Fait' });
    });
  });
  MEMO_ = {};
  return pas;
}
/**
 * Activités reçues de la montre (course, renfo) : au plus toutes les 20 minutes, à l'ouverture de l'app.
 * Une course valide la quête « Course » du jour (si elle n'est pas déjà faite ni comptée pour un autre jour),
 * et l'app l'annonce sur l'écran d'accueil (« ⌚ Course reçue de ta montre… »). Sans ouvrir le Carnet.
 */
function montreActivites_(ss) {
  const P = props_();
  if (!P.getProperty('CARNET_INTERVALS_ID') || !P.getProperty('CARNET_INTERVALS_KEY')) return;
  if (hc_().nom !== carnetHeros_(ss)) return;
  const today = aujourdhui_(), cache = CacheService.getScriptCache(), kc = 'act|' + today;
  if (cache.get(kc)) return;
  cache.put(kc, '1', 1200);
  let liste = [];
  try { liste = intervalsAppel_('/activities?oldest=' + isoPlus_(today, -2) + '&newest=' + today) || []; } catch (e) { return; }
  const k = cle_('montreRecu');
  let recus = []; try { recus = JSON.parse(P.getProperty(k) || '[]'); } catch (e) {}
  const vus = {}; recus.forEach(function (x) { vus[x.id] = true; });
  const habs = lireHabitudes_(ss);
  const ctx = contexteJournal_(ss, tz_(ss));
  let change = false;
  liste.forEach(function (a) {
    const id = String(a.id), type = String(a.type || '');
    const course = /run/i.test(type), renfo = /weight|strength/i.test(type) && !course;
    if (vus[id] || (!course && !renfo)) return;
    const d = String(a.start_date_local || '').slice(0, 10);
    if (!estIso_(d)) return;
    const q = habs.filter(function (h) { return (course ? CARNET_QUETES.run : CARNET_QUETES.str).test(h.nom); })[0];
    const item = { id: id, date: d, type: course ? 'course' : 'renfo', nom: String(a.name || ''), km: a.distance ? Math.round(a.distance / 100) / 10 : null,
      min: a.moving_time ? Math.round(a.moving_time / 60) : null, allure: course && a.average_speed ? Math.round(1000 / a.average_speed) : null, quete: q ? q.nom : '', valide: '' };
    if (q) {
      const fait = ctx.entrees.some(function (e) { return e.quete === q.nom && e.date === d && e.statut === 'Fait'; });
      const ailleurs = compteeAilleurs_(ctx, q.nom, d);
      if (fait) item.valide = 'deja';
      else if (ailleurs) item.valide = 'ailleurs:' + ailleurs;
      else if (ecart_(d, today) <= 1) {
        const resume = [item.km ? String(item.km).replace('.', ',') + ' km' : '', item.min ? item.min + ' min' : ''].filter(String).join(' · ');
        saisir_(ss, q.nom, 'Fait', d, '⌚ Montre' + (resume ? ' : ' + resume : ''));
        ctx.entrees.push({ quete: q.nom, date: d, statut: 'Fait', note: '' });
        item.valide = 'ok';
      }
    }
    recus.unshift(item); change = true;
  });
  if (change) { P.setProperty(k, JSON.stringify(recus.slice(0, 20))); MEMO_ = {}; }
}
/** Une séance déjà comptée pour un autre jour (ex. « Course officielle du 01/11, comptée pour lundi ») : renvoie ce jour. */
function compteeAilleurs_(ctx, quete, d) {
  const marque = 'du ' + d.slice(8, 10) + '/' + d.slice(5, 7);
  const e = ctx.entrees.filter(function (x) { return x.quete === quete && x.statut === 'Fait' && x.date !== d && String(x.note).indexOf(marque) >= 0; })[0];
  return e ? e.date : '';
}
/** La quête appartient-elle au héros courant (quotidienne ou annexe) ? */
function estAMoiQuete_(ss, nom) {
  if (lireHabitudes_(ss).some(function (h) { return h.nom === nom; })) return true;
  const r = ss.getSheetByName(ONGLET_ANNEXES).getRange(LIGNE_QUETES, 1, 40, 15).getValues().filter(function (x) { return x[0] === nom; })[0];
  return !!r && estAMoi_(r[12]);
}
/** Une annexe d'événement n'est validable que dans sa fenêtre (« dès le » → échéance). */
function quetePossibleCeJour_(ss, nom, d) {
  const tz = tz_(ss);
  const r = ss.getSheetByName(ONGLET_ANNEXES).getRange(LIGNE_QUETES, 1, 40, 15).getValues().filter(function (x) { return x[0] === nom; })[0];
  if (!r) return true; // quête quotidienne
  const des = versIso_(r[14], tz), ech = versIso_(r[6], tz);
  if (estIso_(des) && ecart_(des, d) < 0) return false;
  if (estIso_(ech) && ecart_(d, ech) < 0) return false;
  return true;
}
function intervalsAppel_(chemin, options) {
  const props = props_();
  const id = props.getProperty('CARNET_INTERVALS_ID'), cle = props.getProperty('CARNET_INTERVALS_KEY');
  if (!id || !cle) throw new Error('Montre non reliée : ajoute ton identifiant et ta clé intervals.icu.');
  return intervalsBrut_(id, cle, chemin, options);
}
function intervalsBrut_(id, cle, chemin, options) {
  options = options || {};
  const req = {
    method: options.method || 'get', muteHttpExceptions: true, contentType: 'application/json',
    headers: { Authorization: 'Basic ' + Utilities.base64Encode('API_KEY:' + cle) },
    payload: options.payload ? JSON.stringify(options.payload) : undefined
  };
  let r = null, code = 0;
  for (let essai = 0; essai < 2; essai++) {
    try { r = UrlFetchApp.fetch('https://intervals.icu/api/v1/athlete/' + encodeURIComponent(id) + chemin, req); code = r.getResponseCode(); }
    catch (e) { if (essai) throw new Error('intervals.icu injoignable : ' + e.message); Utilities.sleep(800); continue; }
    if (code === 429 || code >= 500) { if (!essai) { Utilities.sleep(1200); continue; } }
    break;
  }
  if (code === 401 || code === 403) throw new Error('intervals.icu refuse la clé ou l\'identifiant (vérifie-les).');
  if (code >= 300) throw new Error('intervals.icu ' + code + ' : ' + r.getContentText().slice(0, 160));
  try { return JSON.parse(r.getContentText() || 'null'); } catch (e) { return null; }
}
function carnetIntervals(action, data, heros) {
  carnetGarde_(heros);
  const props = props_();
  data = data || {};
  if (action === 'config') {
    const id = String(data.id || '').trim(), cle = String(data.key || '').trim();
    const a = intervalsBrut_(id, cle, '', {});
    props.setProperty('CARNET_INTERVALS_ID', id); props.setProperty('CARNET_INTERVALS_KEY', cle);
    return { ok: true, athlete: (a && (a.name || a.firstname)) || id };
  }
  if (action === 'etat') return { ok: !!(props.getProperty('CARNET_INTERVALS_ID') && props.getProperty('CARNET_INTERVALS_KEY')) };
  if (action === 'envoyer') {
    // data : liste d'événements, ou { events, oldest, newest } pour aussi retirer du calendrier
    // les séances du Carnet devenues caduques sur cette période (plan décalé, mis en pause, jours changés)
    const ev = (Array.isArray(data) ? data : (Array.isArray(data.events) ? data.events : [])).slice(0, 20);
    let retires = 0;
    if (!Array.isArray(data) && estIso_(data.oldest) && estIso_(data.newest)) {
      const garder = {}; ev.forEach(function (e) { garder[String(e.external_id)] = true; });
      const prevus = intervalsAppel_('/events?oldest=' + data.oldest + '&newest=' + data.newest + '&category=WORKOUT') || [];
      prevus.filter(function (e) {
        return /^carnet-/.test(String(e.external_id || '')) && !garder[String(e.external_id)] &&
          String(e.start_date_local || '').slice(0, 10) >= data.oldest;
      }).slice(0, 30).forEach(function (e) {
        try { intervalsAppel_('/events/' + encodeURIComponent(e.id), { method: 'delete' }); retires++; } catch (x) {}
      });
    }
    if (ev.length) intervalsAppel_('/events/bulk?upsert=true', { method: 'post', payload: ev });
    return { envoyes: ev.length, retires: retires };
  }
  if (action === 'historique') {
    // Toutes les sorties course enregistrées par la montre sur la période (dans le plan ou non)
    const liste = intervalsAppel_('/activities?oldest=' + data.oldest + '&newest=' + data.newest) || [];
    return liste.filter(function (a) { return /run/i.test(String(a.type || '')); }).map(function (a) {
      return {
        id: String(a.id), nom: String(a.name || ''), date: String(a.start_date_local || '').slice(0, 10),
        km: a.distance ? Math.round(a.distance / 100) / 10 : null,
        min: a.moving_time ? Math.round(a.moving_time / 60) : null,
        allure: a.average_speed ? Math.round(1000 / a.average_speed) : null,
        fc: a.average_heartrate ? Math.round(a.average_heartrate) : null,
        course: String(a.sub_type || '') === 'RACE' || /course|race|10 ?km|semi|marathon|trail/i.test(String(a.name || ''))
      };
    }).sort(function (x, y) { return x.date < y.date ? 1 : -1; }).slice(0, 60);
  }
  if (action === 'activites') {
    const liste = intervalsAppel_('/activities?oldest=' + data.oldest + '&newest=' + data.newest) || [];
    const connus = {}; (data.connus || []).forEach(function (x) { connus[String(x)] = true; });
    let detail = 0;
    return liste.filter(function (a) { return /run/i.test(String(a.type || '')) && !connus[String(a.id)]; }).slice(0, 30).map(function (a) {
      const out = {
        id: String(a.id), type: a.type, date: String(a.start_date_local || '').slice(0, 10),
        km: a.distance ? Math.round(a.distance / 100) / 10 : null,
        min: a.moving_time ? Math.round(a.moving_time / 60) : null,
        allure: a.average_speed ? Math.round(1000 / a.average_speed) : null,
        fc: a.average_heartrate ? Math.round(a.average_heartrate) : null,
        rpe: a.icu_rpe || a.perceived_exertion || null
      };
      // Allure moyenne des fractions (intervalles « WORK » détectés par intervals.icu), si disponible
      if (detail++ < 6) try {
        const iv = UrlFetchApp.fetch('https://intervals.icu/api/v1/activity/' + encodeURIComponent(a.id) + '/intervals', {
          muteHttpExceptions: true, headers: { Authorization: 'Basic ' + Utilities.base64Encode('API_KEY:' + props.getProperty('CARNET_INTERVALS_KEY')) } });
        if (iv.getResponseCode() === 200) {
          const w = ((JSON.parse(iv.getContentText()) || {}).icu_intervals || []).filter(function (x) { return x.type === 'WORK' && x.average_speed; });
          if (w.length >= 2) out.travail = Math.round(1000 / (w.reduce(function (t, x) { return t + x.average_speed; }, 0) / w.length));
        }
      } catch (e) {}
      return out;
    });
  }
  throw new Error('Action inconnue');
}

/* IA : pas de verrou (un appel peut durer 30 s : les autres actions de la Compagnie ne doivent pas attendre) */
function carnetApi_(cle, modele, maxTokens, messages) {
  const req = {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { 'x-api-key': cle, 'anthropic-version': '2023-06-01' },
    payload: JSON.stringify({ model: modele, max_tokens: Math.min(maxTokens || 2000, CARNET_MAX_TOKENS), messages: messages })
  };
  // surcharge (429, 529), erreur passagère (5xx) ou coupure réseau : jusqu'à 2 nouvelles tentatives
  let r = null, code = 0;
  for (let essai = 0; essai < 3; essai++) {
    try { r = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', req); code = r.getResponseCode(); }
    catch (e) { r = null; code = 0; if (essai === 2) { journalErreur_('serveur', '', 'Claude', 'Réseau : ' + e.message, ''); throw new Error('API réseau : ' + e.message); } }
    if (code === 200 || code === 401 || (code >= 400 && code < 500 && code !== 429)) break;
    if (essai < 2) Utilities.sleep(essai ? 2500 : 1000);
  }
  if (code && code !== 200 && code !== 401) journalErreur_('serveur', '', 'Claude ' + modele, 'API ' + code, r ? r.getContentText().slice(0, 200) : '');
  let body = {};
  try { body = JSON.parse(r.getContentText() || '{}'); } catch (e) {}
  if (code === 401) throw new Error('KEY_REFUSED');
  if (code !== 200) throw new Error('API ' + code + ' : ' + ((body.error && body.error.message) || 'erreur inconnue'));
  if (body.stop_reason === 'max_tokens') journalErreur_('serveur', '', 'Claude ' + modele, 'Réponse coupée (max_tokens = ' + Math.min(maxTokens || 2000, CARNET_MAX_TOKENS) + ')', '');
  return (body.content || []).filter(function (b) { return b.type === 'text'; }).map(function (b) { return b.text; }).join('');
}
function carnetDemander_(payloadJson) {
  const p = JSON.parse(payloadJson), props = props_();
  const cle = props.getProperty('CARNET_CLAUDE_KEY');
  if (!cle) throw new Error('NO_KEY');
  const soigne = p.tier !== 'quick' && props.getProperty('CARNET_MISSION') === 'quality';
  if (!soigne) return { text: carnetApi_(cle, CARNET_MODELE_RAPIDE, p.maxTokens, p.messages), model: 'Haiku' };
  try { return { text: carnetApi_(cle, CARNET_MODELE_SOIGNE, p.maxTokens, p.messages), model: 'Sonnet' }; }
  catch (err) {
    if (/KEY_REFUSED|API 4\d\d/.test(String(err.message)) && !/API 429/.test(String(err.message))) throw err;
    return { text: carnetApi_(cle, CARNET_MODELE_RAPIDE, p.maxTokens, p.messages), model: 'Haiku (repli automatique)' };
  }
}
function carnetClaude(payloadJson, heros) { carnetGarde_(heros); return carnetDemander_(payloadJson).text; }
function carnetConfig(heros) {
  carnetGarde_(heros);
  const props = props_(), cle = props.getProperty('CARNET_CLAUDE_KEY') || '';
  return { hasKey: !!cle, keyEnd: cle.slice(-4), mission: props.getProperty('CARNET_MISSION') || 'fast' };
}
function carnetReglages(cfg, heros) {
  carnetGarde_(heros);
  cfg = cfg || {};
  const props = props_();
  if (cfg.apiKey) {
    const cle = String(cfg.apiKey).trim();
    if (!/^sk-ant-/.test(cle)) throw new Error('KEY_REFUSED');
    carnetApi_(cle, CARNET_MODELE_RAPIDE, 5, [{ role: 'user', content: 'OK' }]);
    props.setProperty('CARNET_CLAUDE_KEY', cle);
  }
  if (cfg.mission === 'fast' || cfg.mission === 'quality') props.setProperty('CARNET_MISSION', cfg.mission);
  return carnetConfig(heros);
}
function carnetTest(heros) {
  carnetGarde_(heros);
  const t0 = Date.now();
  const r = carnetDemander_(JSON.stringify({ tier: 'default', maxTokens: 1500, messages: [{ role: 'user',
    content: 'Écris en JSON 4 questions QCM d\'anglais niveau A2 sur un laboratoire de chimie, avec 4 choix et la bonne réponse.' }] }));
  return { ms: Date.now() - t0, model: r.model };
}

/** Liste des héros pour l'écran « Qui rejoint la Compagnie ? ». */
function getHeros() {
  MEMO_ = {}; HEROS_ = null;
  const ss = SpreadsheetApp.getActive();
  return lireHeros_(ss).map(function (h) {
    const sh = ss.getSheetByName(ongletHeros_(ONGLET_PERSONNAGE, h));
    const b = sh ? sh.getRange('C5:C6').getValues() : [[''], [1]];
    return { nom: h.nom, classe: h.classe, look: h.look, titre: b[0][0], niveau: b[1][0] };
  });
}

/**
 * Ajoute une saisie : Fait, Raté ou Repos (un Repos consomme le joker de la semaine).
 * hier = true : saisie pour la veille (oubli de saisie). Elle remplace un raté ou joker automatique de la veille.
 */
function logAction(quete, statut, hier, heros) {
  if (['Fait', 'Raté', 'Repos'].indexOf(statut) < 0) throw new Error('Statut inconnu : ' + statut);
  return avecHeros_(heros, function () {
    const ss = SpreadsheetApp.getActive(), today = aujourdhui_();
    saisir_(ss, quete, statut, hier ? isoPlus_(today, -1) : today, hier ? 'Saisi le lendemain' : '');
    return etat_(ss);
  });
}
/** Écrit une saisie à une date donnée (aujourd'hui ou un jour passé). Un jour passé remplace le raté ou joker automatique. */
function saisir_(ss, quete, statut, date, noteBase) {
  if (['Fait', 'Raté', 'Repos'].indexOf(statut) < 0) throw new Error('Statut inconnu : ' + statut);
  const tz = tz_(ss);
  const ctx = contexteJournal_(ss, tz);
  const P = lireParams_(ss);
  const props = props_();
  const today = aujourdhui_();
  const debut = debutSuivi_(ss, props, today);
  if (ecart_(date, today) > 0) {
    ctx.entrees.filter(function (e) {
      return e.quete === quete && e.date === date && /\(auto\)$/.test(e.note);
    }).forEach(function (e) { effacer_(ctx, e); });
  }
  let note = noteBase || '';
  if (statut === 'Repos') {
    if (jokersUtilises_(ctx, date) < P.jokers) note = [note, 'Joker'].filter(String).join(' · ');
    else if (reliqueDispo_(ctx, date)) note = [note, 'Joker (relique)'].filter(String).join(' · ');
    else throw new Error('Plus de joker cette semaine');
  }
  let mult = 1;
  if (statut === 'Fait') {
    const comp = compenserSeance_(ss, ctx, quete, date);
    if (comp) note = [note, comp].filter(String).join(' · ');
    const ext = bonusAction_(ss, ctx, props, P, quete, date);
    const evt = multEvenement_(ss, quete, date);
    mult = Math.round(multiplicateurEtat_(ctx, P, nomsAnnexes_(ss), debut, date) * P.xpMult * ext.mult * evt.mult * 1000) / 1000;
    note = [note].concat(ext.tags, evt.tag ? [evt.tag] : []).filter(String).join(' · ');
  }
  ajouter_(ctx, date, quete, statut, note, 0, mult);
}

/* ====================== Hors connexion ======================
 * Le téléphone garde les saisies faites sans réseau (avec leur vraie date) et les envoie ici d'un coup au retour du réseau.
 * Chaque saisie porte un identifiant : renvoyée deux fois (réponse perdue), elle n'est comptée qu'une fois.
 * Fenêtre : 7 jours en arrière au plus.
 */
function saisirHorsLigne(liste, heros) {
  return avecHeros_(heros, function () {
    const ss = SpreadsheetApp.getActive(), props = props_(), today = aujourdhui_();
    const k = cle_('horsLigneIds');
    let vus = []; try { vus = JSON.parse(props.getProperty(k) || '[]'); } catch (e) {}
    const resultats = [];
    // le d20 d'un jour passe avant les quêtes de ce jour-là (son bonus doit s'appliquer), le reste garde son ordre
    const lot = (Array.isArray(liste) ? liste : []).slice(0, 60).map(function (x, i) { return { x: x || {}, i: i }; });
    lot.sort(function (a, b) {
      const da = String(a.x.date || ''), db = String(b.x.date || '');
      if (a.x.type === 'd20' && b.x.type !== 'd20' && da === db) return -1;
      if (b.x.type === 'd20' && a.x.type !== 'd20' && da === db) return 1;
      return a.i - b.i;
    });
    lot.map(function (o) { return o.x; }).forEach(function (x) {
      x = x || {};
      const id = String(x.id || '');
      if (!id || vus.indexOf(id) >= 0) { resultats.push({ id: id, ok: true, deja: true }); return; }
      try {
        // saisie en direct : la date est celle du Sheet (le téléphone peut être sur un autre fuseau, en voyage)
        let date = x.direct ? (x.hier ? isoPlus_(today, -1) : today) : (estIso_(x.date) ? x.date : today);
        if (ecart_(date, today) === -1) date = today; // téléphone un peu en avance (fuseau horaire)
        const ecart = ecart_(date, today);
        if (ecart < 0) throw new Error('Date dans le futur');
        if (ecart > 7) throw new Error('Saisie de plus de 7 jours : trop ancienne');
        const quand = x.direct ? (ecart === 0 ? '' : 'Saisi le lendemain')
          : ecart === 0 ? 'Hors connexion' : 'Hors connexion (' + date.slice(8, 10) + '/' + date.slice(5, 7) + ')';
        if (x.type === 'd20') jetD20_(ss, props, x, date);
        else if (x.type === 'undo') annuler_(ss, String(x.quete || ''), date);
        else saisir_(ss, String(x.quete || ''), String(x.statut || ''), date, quand);
        MEMO_ = {};
        resultats.push({ id: id, ok: true });
      } catch (e) {
        resultats.push({ id: id, ok: false, message: e.message });
        journalErreur_('serveur', hc_().nom, 'saisirHorsLigne', (x.quete || x.type || '?') + ' (' + x.date + ') : ' + e.message, '');
      }
      vus.push(id);
    });
    props.setProperty(k, JSON.stringify(vus.slice(-300)));
    MEMO_ = {};
    const etat = etat_(ss);
    etat.horsLigne = resultats;
    return etat;
  });
}

/** Course / renfo : seules ces séances peuvent changer de jour (menu de la quête et Carnet). */
const SEANCES_MOBILES = /^(course|renfo)/i;
/**
 * Séance faite un jour où elle n'était pas prévue (course du lundi faite le mardi) :
 * si une séance prévue plus tôt dans la semaine a été comptée ratée (ou joker) automatiquement,
 * elle est déplacée à ce jour-là. Le raté s'efface, le joker revient, la série tient.
 * Renvoie le texte à ajouter à la note, ou ''.
 */
function compenserSeance_(ss, ctx, quete, date) {
  if (!SEANCES_MOBILES.test(quete)) return '';
  const h = lireHabitudes_(ss).filter(function (x) { return x.nom === quete; })[0];
  if (!h || h.type !== 'Routine') return '';
  const props = props_(), R = lireReglages_(props);
  const P = { decalages: R.decalages };
  if (estPrevu_(h, date, P)) return '';
  const lun = lundi_(date);
  const rate = ctx.entrees.filter(function (e) {
    return e.quete === quete && /\(auto\)$/.test(e.note) && (e.statut === 'Raté' || e.statut === 'Repos') &&
      ecart_(lun, e.date) >= 0 && ecart_(e.date, date) > 0 &&
      !R.decalages.some(function (x) { return x.nom === quete && (x.de === e.date || x.a === e.date); });
  }).sort(function (a, b) { return a.date < b.date ? 1 : -1; })[0];
  if (!rate) return '';
  const de = rate.date;
  ctx.entrees.filter(function (e) { return e.quete === quete && e.date === de && /\(auto\)$/.test(e.note); })
    .forEach(function (e) { effacer_(ctx, e); });
  R.decalages.push({ nom: quete, de: de, a: date });
  ecrireReglages_(props, R);
  oublier_('params', 'Pbase');
  ctx.parQuete = null;
  return 'Séance du ' + JOURS_LONGS_[jourSemaine_(de)] + ' rattrapée';
}
const JOURS_LONGS_ = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

/** Efface la dernière saisie du jour (hors bonus) pour cette quête. */
function undoToday(quete, heros) {
  return avecHeros_(heros, function () {
    const ss = SpreadsheetApp.getActive();
    annuler_(ss, quete, aujourdhui_());
    return etat_(ss);
  });
}
function annuler_(ss, quete, date) {
  const journal = ss.getSheetByName(ONGLET_JOURNAL);
  const tz = tz_(ss);
  const valeurs = journal.getRange(2, 1, journal.getMaxRows() - 1, COLS_JOURNAL).getValues();
  for (let i = valeurs.length - 1; i >= 0; i--) {
    const sienne = valeurs[i][13] === heros_() || (valeurs[i][13] === '' && hc_().index === 0);
    if (sienne && valeurs[i][1] === quete && valeurs[i][2] !== 'Bonus' && versIso_(valeurs[i][0], tz) === date) {
      journal.getRange(i + 2, 1, 1, 9).clearContent();
      journal.getRange(i + 2, 12, 1, 3).clearContent();
      break;
    }
  }
}

/** Active ou désactive le mode vacances (à partir d'aujourd'hui / jusqu'à hier). */
function toggleVacances(heros) {
  return avecHeros_(heros, function () {
    const ss = SpreadsheetApp.getActive();
    const tz = tz_(ss);
    const plage = param_(ss, 'P_VACANCES');
    const today = aujourdhui_();
    const vac = lireVacances_(ss);
    const encours = vac.filter(function (v) { return ecart_(v.debut, today) >= 0 && (v.fin === '' || ecart_(today, v.fin) >= 0); })[0];
    if (encours) {
      if (encours.debut === today) plage.offset(encours.index, 0, 1, plage.getNumColumns()).clearContent();
      else plage.offset(encours.index, 1, 1, 1).setValue(versDateSheet_(isoPlus_(today, -1), tz));
    } else {
      const lignes = plage.getValues();
      const i = lignes.findIndex(function (r) { return r[0] === ''; });
      if (i < 0) throw new Error('Tableau des vacances plein (onglet Paramètres)');
      const l = ligneVacances_(plage, versDateSheet_(today, tz), '');
      plage.offset(i, 0, 1, l.length).setValues([l]);
    }
    oublier_('params', 'Pbase');
    return etat_(ss);
  });
}

/* ====================== Réglages modifiables depuis l'app ====================== */

function estIso_(d) { return /^\d{4}-\d{2}-\d{2}$/.test(String(d || '')); }
function avecReglages_(fn, heros) {
  return avecHeros_(heros, function () {
    const ss = SpreadsheetApp.getActive();
    const props = props_();
    const R = lireReglages_(props);
    fn(ss, props, R, aujourdhui_());
    ecrireReglages_(props, R);
    oublier_('params', 'Pbase', 'listeHeros'); // fn a pu écrire dans Paramètres
    const nom = hc_().nom; HEROS_ = null; choisirHeros_(ss, nom);
    return etat_(ss);
  });
}

/** Planifie des vacances à l'avance (dates AAAA-MM-JJ, fin incluse). */
function planifierVacances(debut, fin, heros) {
  if (!estIso_(debut) || !estIso_(fin)) throw new Error('Dates invalides');
  if (ecart_(debut, fin) < 0) throw new Error('La fin doit être après le début');
  return avecReglages_(function (ss, props, R, today) {
    if (ecart_(today, fin) < 0) throw new Error('Ces dates sont déjà passées');
    const tz = tz_(ss);
    const vac = lireVacances_(ss);
    const chevauche = vac.some(function (v) {
      const finV = v.fin || '9999-12-31';
      return ecart_(debut, finV) >= 0 && ecart_(v.debut, fin) >= 0;
    });
    if (chevauche) throw new Error('Ces dates chevauchent une période de vacances existante');
    const plage = param_(ss, 'P_VACANCES');
    const i = plage.getValues().findIndex(function (r) { return r[0] === ''; });
    if (i < 0) throw new Error('Tableau des vacances plein (onglet Paramètres)');
    const l = ligneVacances_(plage, versDateSheet_(debut, tz), versDateSheet_(fin, tz));
    plage.offset(i, 0, 1, l.length).setValues([l]);
  }, heros);
}

/** Supprime une période de vacances à venir, ou termine celle en cours (fin = hier). */
function supprimerVacances(index, heros) {
  return avecReglages_(function (ss, props, R, today) {
    const tz = tz_(ss);
    const v = lireVacances_(ss).filter(function (x) { return x.index === Number(index); })[0];
    if (!v) throw new Error('Période introuvable');
    const plage = param_(ss, 'P_VACANCES');
    if (ecart_(today, v.debut) >= 0) plage.offset(v.index, 0, 1, plage.getNumColumns()).clearContent();
    else plage.offset(v.index, 1, 1, 1).setValue(versDateSheet_(isoPlus_(today, -1), tz));
  }, heros);
}

/** Met une quête du quotidien en pause à partir d'aujourd'hui, ou la reprend. */
function basculerPause(nom, heros) {
  return avecReglages_(function (ss, props, R, today) {
    if (!lireHabitudes_(ss).some(function (h) { return h.nom === nom; })) throw new Error('Quête introuvable : ' + nom);
    const liste = R.pauses[nom] = R.pauses[nom] || [];
    const enCours = liste.filter(function (p) { return dansPeriode_(p, today); })[0];
    if (enCours) {
      if (enCours.debut === today) liste.splice(liste.indexOf(enCours), 1);
      else enCours.fin = isoPlus_(today, -1);
    } else liste.push({ debut: today, fin: '' });
    if (!liste.length) delete R.pauses[nom];
  }, heros);
}

/** Voyage : met des quêtes quotidiennes en pause sur des dates précises (sans raté, séries gelées). */
function planifierVoyage(debut, fin, noms, heros) {
  if (!estIso_(debut) || !estIso_(fin) || ecart_(debut, fin) < 0) throw new Error('Dates de voyage invalides');
  return avecReglages_(function (ss, props, R, today) {
    if (ecart_(today, fin) < 0) throw new Error('Ces dates sont déjà passées');
    const habs = lireHabitudes_(ss).map(function (h) { return h.nom; });
    (Array.isArray(noms) ? noms : []).forEach(function (nom) {
      if (habs.indexOf(nom) < 0) return;
      const liste = R.pauses[nom] = R.pauses[nom] || [];
      if (liste.some(function (p) { return ecart_(p.debut, fin) >= 0 && (!p.fin || ecart_(debut, p.fin) >= 0); })) return; // déjà en pause sur ces dates
      liste.push({ debut: debut, fin: fin, voyage: true });
    });
  }, heros);
}
function annulerVoyage(debut, fin, heros) {
  return avecReglages_(function (ss, props, R) {
    Object.keys(R.pauses).forEach(function (n) {
      R.pauses[n] = R.pauses[n].filter(function (p) { return !(p.voyage && p.debut === debut && p.fin === fin); });
      if (!R.pauses[n].length) delete R.pauses[n];
    });
  }, heros);
}

/** Décale une séance de routine d'un jour prévu (de) vers un autre jour (a) de la même semaine. */
function decalerSeance(nom, de, a, heros) {
  if (!estIso_(de) || !estIso_(a) || de === a) throw new Error('Jours invalides');
  return avecReglages_(function (ss, props, R, today) {
    const h = lireHabitudes_(ss).filter(function (x) { return x.nom === nom; })[0];
    if (!h || h.type !== 'Routine') throw new Error('Seules les routines (jours fixes) se décalent');
    if (ecart_(today, de) < 0 || ecart_(today, a) < 0) throw new Error('On ne décale que vers aujourd\'hui ou plus tard');
    if (lundi_(de) !== lundi_(a)) throw new Error('Le décalage doit rester dans la même semaine');
    const P = { decalages: R.decalages };
    if (!estPrevu_(h, de, P)) throw new Error('Cette quête n\'est pas prévue ce jour-là');
    if (estPrevu_(h, a, P)) throw new Error('Cette quête est déjà prévue ce jour-là');
    if (R.decalages.some(function (x) { return x.nom === nom && [x.de, x.a].some(function (j) { return j === de || j === a; }); }))
      throw new Error('Ce jour est déjà concerné par un décalage : annule-le d\'abord');
    R.decalages.push({ nom: nom, de: de, a: a });
  }, heros);
}
function annulerDecalage(nom, de, a, heros) {
  return avecReglages_(function (ss, props, R) {
    R.decalages = R.decalages.filter(function (x) { return !(x.nom === nom && x.de === de && x.a === a); });
  }, heros);
}

/**
 * Renomme une quête partout d'un coup : onglet de la quête, tout le Journal, quête épique liée,
 * pauses et séances décalées. L'historique (XP, séries) suit la quête.
 */
function renommerQuete(ancien, nouveau, heros) {
  nouveau = String(nouveau || '').replace(/\s+/g, ' ').trim();
  if (!nouveau) throw new Error('Le nouveau nom est vide');
  if (nouveau.length > 60) throw new Error('Nom trop long (60 caractères au plus)');
  if (nouveau === ancien) throw new Error('C\'est déjà son nom');
  return avecReglages_(function (ss, props, R) {
    // 1. Onglet de la quête (quotidien ou annexes) + contrôle des doublons
    let cellule = null;
    const tous = [];
    [[ONGLET_HABITUDES, 30], [ONGLET_ANNEXES, 40]].forEach(function (o) {
      const sh = ss.getSheetByName(o[0]);
      sh.getRange(LIGNE_QUETES, 1, o[1], 1).getValues().forEach(function (r, i) {
        tous.push(String(r[0]).toLowerCase());
        if (r[0] === ancien && !cellule) cellule = sh.getRange(LIGNE_QUETES + i, 1);
      });
    });
    if (!cellule) throw new Error('Quête introuvable : ' + ancien);
    if (tous.indexOf(nouveau.toLowerCase()) >= 0) throw new Error('Une quête porte déjà ce nom');
    cellule.setValue(nouveau);
    // 2. Journal (colonne B), en une seule écriture
    const journal = ss.getSheetByName(ONGLET_JOURNAL);
    const colB = journal.getRange(2, 2, journal.getMaxRows() - 1, 1).getValues();
    let n = 0;
    colB.forEach(function (r) { if (r[0] === ancien) { r[0] = nouveau; n++; } });
    if (n) journal.getRange(2, 2, colB.length, 1).setValues(colB);
    // 3. Quêtes épiques : colonne « habitude liée »
    const epi = ss.getSheetByName(ONGLET_OBJECTIFS).getRange(LIGNE_QUETES, 3, 20, 1);
    const liees = epi.getValues();
    if (liees.some(function (r) { return r[0] === ancien; })) {
      epi.setValues(liees.map(function (r) { return [r[0] === ancien ? nouveau : r[0]]; }));
    }
    // 4. Réglages de l'app (pauses et décalages de chaque héros)
    const renommer = function (Rh) {
      if (Rh.pauses[ancien]) { Rh.pauses[nouveau] = Rh.pauses[ancien]; delete Rh.pauses[ancien]; }
      Rh.decalages.forEach(function (x) { if (x.nom === ancien) x.nom = nouveau; });
    };
    renommer(R);
    lireHeros_(ss).forEach(function (h) {
      if (h.index === hc_().index) return;
      const Rh = lireReglages_(props, h);
      renommer(Rh);
      ecrireReglages_(props, Rh, h);
    });
    oublier_('catalogue', 'nomsAnnexes');
  }, heros);
}

/**
 * À lancer depuis l'éditeur, seulement si tu veux VRAIMENT réécrire le passé (ex. corriger un DD mal saisi) :
 * recopie dans tout le Journal la catégorie, les caracs et l'XP de base actuelles des quêtes.
 */
function recalculerHistorique() {
  const ss = SpreadsheetApp.getActive();
  const journal = ss.getSheetByName(ONGLET_JOURNAL);
  const plage = journal.getRange(2, 2, journal.getMaxRows() - 1, 7); // B:H
  const v = plage.getValues();
  const fige = v.map(function (r) { return r[0] === '' ? ['', '', '', ''] : figer_(ss, r[0], r[1]); });
  journal.getRange(2, 5, fige.length, 4).setValues(fige);
}

/** Réglages du rappel : { actif, heure (0-23), dimanche }. Réinstalle l'envoi automatique. */
function reglerRappel(cfg, heros) {
  return avecReglages_(function (ss, props, R) {
    const h = Math.max(0, Math.min(23, Math.round(Number(cfg.heure))));
    R.rappel = { actif: !!cfg.actif, heure: isNaN(h) ? 20 : h, dimanche: !!cfg.dimanche };
    ecrireReglages_(props, R);
    installerDeclencheur_();
  }, heros);
}
function testerRappel(heros) {
  rappelDuSoir(true, heros);
  return getState(heros);
}

/** Change le mode de difficulté (une fois par période de 30 jours). */
function changerDifficulte(niveau, heros) {
  if (!DIFFICULTES[niveau]) throw new Error('Mode inconnu : ' + niveau);
  return avecReglages_(function (ss, props, R, today) {
    const tz = tz_(ss);
    const actuel = hc_().difficulte || 'Normal';
    if (actuel === niveau) return;
    const depuis = hc_().diffDepuis;
    if (estIso_(depuis) && ecart_(depuis, today) < DELAI_DIFFICULTE)
      throw new Error('Prochain changement possible le ' + isoPlus_(depuis, DELAI_DIFFICULTE).split('-').reverse().join('/'));
    R.histoDiff = R.histoDiff || [];
    if (!R.histoDiff.length) R.histoDiff.push({ depuis: '2000-01-01', niveau: actuel });
    R.histoDiff.push({ depuis: today, niveau: niveau });
    ecrireHeros_(ss, 11, niveau);
    ecrireHeros_(ss, 12, versDateSheet_(today, tz));
  }, heros);
}

function reglerConfort(cfg, heros) {
  return avecReglages_(function (ss, props, R) {
    R.confort = { animations: !!cfg.animations, vibrations: !!cfg.vibrations };
  }, heros);
}

/** Ornements (cosmétiques discrets gagnés en jouant) : un par emplacement. */
const EMPLACEMENTS_ORNEMENTS = ['familier', 'sol', 'embleme', 'lueur'];
function equiperOrnement(emplacement, id, heros) {
  if (EMPLACEMENTS_ORNEMENTS.indexOf(emplacement) < 0) throw new Error('Emplacement inconnu');
  return avecReglages_(function (ss, props, R) {
    R.ornements = R.ornements || {};
    R.ornements[emplacement] = String(id || '').slice(0, 30);
  }, heros);
}

function reglerDevise(texte, heros) {
  return avecReglages_(function (ss) {
    ecrireHeros_(ss, 8, String(texte || '').trim().slice(0, 140));
  }, heros);
}

/** Semaine de vie selon la Life Grid : 52 cases par année, la ligne repart à chaque anniversaire. */
function semaineGrille_(naissance, today) {
  const n = partiesIso_(naissance), t = partiesIso_(today);
  const ans = t[0] - n[0] - (t[1] < n[1] || (t[1] === n[1] && t[2] < n[2]) ? 1 : 0);
  const anniv = isoPlus_(n[0] + ans + '-' + ('0' + n[1]).slice(-2) + '-' + ('0' + n[2]).slice(-2), 0);
  return ans * 52 + Math.min(52, Math.floor(ecart_(anniv, today) / 7) + 1);
}

/* ====================== Étape 2 : d20 du jour et capacités de classe ====================== */

const SEUILS_CAPACITES = [5, 20, 50, 100];
function estRoublard_(h) { return /voleur|assassin|roublard/i.test(String((h || hc_()).classe || '')); }
function fr_(x) { return String(x).replace('.', ','); }

/** Niveau du héros courant, et date à laquelle chaque capacité a été débloquée (jamais rétroactif). */
function capacitesHeros_(ss) {
  return memo_('capa|' + hc_().nom, function () {
    const sh = ss.getSheetByName(ongletHeros_(ONGLET_PERSONNAGE));
    const niveau = sh ? Number(sh.getRange('C6').getValue()) || 1 : 1;
    const props = props_();
    let depuis = {};
    try { depuis = JSON.parse(props.getProperty(cle_('capacites')) || '{}'); } catch (e) { depuis = {}; }
    let change = false;
    SEUILS_CAPACITES.forEach(function (n) { if (niveau >= n && !depuis[n]) { depuis[n] = aujourdhui_(); change = true; } });
    if (change) props.setProperty(cle_('capacites'), JSON.stringify(depuis));
    return { niveau: niveau, roublard: estRoublard_(), depuis: depuis };
  });
}
/** La capacité du niveau n était-elle débloquée le jour d ? */
function capaActive_(P, n, d) {
  const dep = P.capa && P.capa.depuis[n];
  return !!dep && (!d || ecart_(dep, d) >= 0);
}
/** Esquive (roublard 20) : les 2 premiers ratés de chaque mois ne coûtent aucun PV. */
function esquive_(P, e, compteur) {
  if (!P.capa || !P.capa.roublard || !capaActive_(P, 20, e.date)) return false;
  const mois = e.date.slice(0, 7);
  if ((compteur[mois] || 0) >= 2) return false;
  compteur[mois] = (compteur[mois] || 0) + 1;
  return true;
}
/** Maîtrise des sorts (mage 50) : s'applique aux rythmes Intelligence et Sagesse. */
function maitrise_(P, h) {
  return !!P.capa && !P.capa.roublard && capaActive_(P, 50) && h.type === 'Rythme' && (h.carac === 'Intelligence' || h.carac === 'Sagesse');
}
/** Pas de l'ombre (roublard 50) : le 1er raté de chaque mois ne casse pas la série. Renvoie ces ratés. */
function ratesPasDeLOmbre_(ctx, P) {
  if (!P.capa || !P.capa.roublard) return [];
  const vus = {}, res = [];
  ctx.entrees.filter(function (e) { return e.statut === 'Raté' && capaActive_(P, 50, e.date); })
    .sort(function (a, b) { return ecart_(b.date, a.date); })
    .forEach(function (e) { const m = e.date.slice(0, 7); if (!vus[m]) { vus[m] = true; res.push(e); } });
  return res;
}
/** Une saisie portant cette mention existe-t-elle entre a et b ? */
function capaUtilisee_(ctx, tag, a, b) {
  return ctx.entrees.filter(function (e) { return e.note.indexOf(tag) >= 0 && ecart_(a, e.date) >= 0 && ecart_(e.date, b) >= 0; });
}
function bornesMois_(d) {
  const p = partiesIso_(d);
  const suivant = p[1] === 12 ? (p[0] + 1) + '-01-01' : p[0] + '-' + ('0' + (p[1] + 1)).slice(-2) + '-01';
  return [d.slice(0, 8) + '01', isoPlus_(suivant, -1)];
}

/** Multiplicateurs d'une quête accomplie : d20 du jour et capacités offensives. */
function bonusAction_(ss, ctx, props, P, quete, date) {
  const tags = [];
  let m = 1;
  const d = lireD20_(props)[date];
  if (d && d.mult !== 1) { m *= d.mult; tags.push('d20 ' + d.de + ' ×' + fr_(d.mult)); }
  const lun = lundi_(date), dim = isoPlus_(lun, 6);
  const libre = function (tag) { return capaUtilisee_(ctx, tag, lun, dim).length === 0; };
  const rb = P.capa.roublard, R = lireReglages_(props);
  if (!rb && capaActive_(P, 5, date) && R.sort && R.sort.lundi === lun && R.sort.quete === quete && libre('Sort préparé')) {
    m *= 1.5; tags.push('Sort préparé ×1,5');
  }
  if (rb && capaActive_(P, 5, date) && nomsAnnexes_(ss)[quete] && libre('Attaque sournoise')) {
    m *= 2; tags.push('Attaque sournoise ×2');
  }
  const ultime = rb ? 'Assassinat' : 'Archimage';
  if (capaActive_(P, 100, date) && libre(ultime)) { m *= 2; tags.push(ultime + ' ×2'); }
  return { mult: m, tags: tags };
}

/* ---------- d20 ---------- */
function lireD20_(props) { try { return JSON.parse(props.getProperty(cle_('d20')) || '{}'); } catch (e) { return {}; } }
const MALADRESSES = {
  mage: ['Ton grimoire t\'est tombé sur le pied.', 'Ta baguette a fait pousser une fleur au lieu d\'un éclair.', 'Le chat de la tour s\'est assis sur ton parchemin.'],
  roublard: ['Tu as trébuché sur ta propre cape.', 'Ta dague est restée coincée dans le fourreau.', 'Un pigeon a révélé ta cachette.']
};
function resultatD20_(de, total, roublard) {
  if (de === 20) return { mult: 1.5, titre: 'COUP CRITIQUE !', texte: 'Les dieux sont avec toi : XP ×1,5 sur toutes tes quêtes du jour.' };
  if (de === 1) {
    const l = MALADRESSES[roublard ? 'roublard' : 'mage'];
    return { mult: 0.8, titre: 'Échec critique…', texte: l[Math.floor(Math.random() * l.length)] + ' XP ×0,8 aujourd\'hui : le destin rit, à toi de lui prouver qu\'il a tort.' };
  }
  if (total >= 18) return { mult: 1.25, titre: 'Inspiration héroïque', texte: 'XP ×1,25 sur toutes tes quêtes du jour.' };
  if (total >= 10) return { mult: 1.1, titre: 'Bon présage', texte: 'XP ×1,1 sur toutes tes quêtes du jour.' };
  return { mult: 1, titre: 'Journée ordinaire', texte: 'Ni bonus ni malus : aujourd\'hui, c\'est toi qui fais la différence.' };
}
/** Lance le d20 du jour (une seule fois par jour et par héros : relancer renvoie le même résultat). */
function lancerD20(jet, heros) {
  // jet : dés tirés par l'app ({ d1, d2 }) pour un résultat affiché tout de suite ; le serveur garde les règles
  return avecHeros_(heros, function () {
    const ss = SpreadsheetApp.getActive(), props = props_();
    jetD20_(ss, props, jet || {}, aujourdhui_());
    return etat_(ss);
  });
}
function jetD20_(ss, props, jet, date) {
  const valide = function (x) { x = Number(x); return x >= 1 && x <= 20 && Math.floor(x) === x ? x : 0; };
  const today = aujourdhui_();
  const tous = lireD20_(props);
  if (tous[date]) return tous[date];
  const H = hc_();
  const stats = ss.getSheetByName(ongletHeros_(ONGLET_PERSONNAGE)).getRange('B18:D24').getValues();
  const ligne = stats.filter(function (r) { return r[0] === H.fav1; })[0];
  // Modificateur de la carac favorite, comme en D&D : 8-9 → −1, 10-11 → +0, 12-13 → +1, 14-15 → +2…
  const mod = ligne ? Math.floor((Number(ligne[2]) - 10) / 2) : 0;
  const ev = evenementDu_(date);
  const bn = beneditionDu_(date);
  const avantage = !!((ev && ev.effet.type === 'avantage') || (bn && bn.type === 'avantage'));
  const d1 = valide(jet.d1) || 1 + Math.floor(Math.random() * 20), d2 = valide(jet.d2) || 1 + Math.floor(Math.random() * 20);
  const de = avantage ? Math.max(d1, d2) : d1;
  const r = resultatD20_(de, de + mod, estRoublard_());
  tous[date] = { de: de, mod: mod, carac: H.fav1 || '', total: de + mod, mult: r.mult, titre: r.titre, texte: r.texte, avantage: avantage ? [d1, d2] : null };
  Object.keys(tous).forEach(function (d) { if (!estIso_(d) || ecart_(d, today) > 7) delete tous[d]; });
  props.setProperty(cle_('d20'), JSON.stringify(tous));
  return tous[date];
}
function d20DuJour_(props, today) { return lireD20_(props)[today] || null; }

/* ---------- Capacités : état pour l'app et actions ---------- */
function etatCapacites_(ss, ent, today) {
  const P = ent.P, ctx = ent.ctx, rb = P.capa.roublard, R = ent.reglages;
  const lun = lundi_(today), dim = isoPlus_(lun, 6), mois = bornesMois_(today);
  const sem = function (tag) { return capaUtilisee_(ctx, tag, lun, dim)[0]; };
  const duMois = function (tag) { return capaUtilisee_(ctx, tag, mois[0], mois[1]); };
  const liste = [];
  const ajoute = function (n, statut, action) { liste.push({ n: n, debloquee: capaActive_(P, n), statut: statut, action: action || '' }); };
  let sortPrepare = '', restaurables = [];
  if (!rb) {
    const u = sem('Sort préparé');
    sortPrepare = !u && R.sort && R.sort.lundi === lun ? R.sort.quete : '';
    ajoute(5, u ? 'Lancé cette semaine sur « ' + u.quete + ' »' : sortPrepare ? 'Préparé sur « ' + sortPrepare + ' » : accomplis-la pour ×1,5' : 'À préparer : choisis la quête de la semaine', u ? '' : 'preparer');
    const r = duMois('Restauration arcanique');
    if (!r.length && capaActive_(P, 20)) {
      const vus = {};
      restaurables = ctx.entrees.filter(function (e) { return e.statut === 'Raté' && ecart_(e.date, today) <= 7; })
        .sort(function (a, b) { return ecart_(a.date, b.date); })
        .filter(function (e) { if (vus[e.quete]) return false; vus[e.quete] = true; return true; }) // le plus récent de chaque quête
        .map(function (e) { return { quete: e.quete, date: e.date }; });
    }
    ajoute(20, r.length ? 'Utilisée ce mois-ci (« ' + r[0].quete + ' »)' : restaurables.length ? '1 disponible : choisis un raté à effacer' : '1 disponible ce mois-ci · aucun raté récent', restaurables.length ? 'restaurer' : '');
    ajoute(50, 'Toujours active : rythmes Intelligence et Sagesse');
    const a = sem('Archimage');
    ajoute(100, a ? 'Utilisé cette semaine (« ' + a.quete + ' »)' : 'Prêt : ta prochaine quête compte ×2');
  } else {
    const u = sem('Attaque sournoise');
    ajoute(5, u ? 'Frappée cette semaine sur « ' + u.quete + ' »' : 'Prête : ta prochaine quête annexe rapporte ×2');
    const rates = ctx.entrees.filter(function (e) { return e.statut === 'Raté' && capaActive_(P, 20, e.date) && ecart_(mois[0], e.date) >= 0 && ecart_(e.date, mois[1]) >= 0; }).length;
    ajoute(20, Math.min(2, rates) + ' / 2 esquive(s) utilisée(s) ce mois-ci');
    const o = ratesPasDeLOmbre_(ctx, P).filter(function (e) { return ecart_(mois[0], e.date) >= 0; });
    ajoute(50, o.length ? 'Utilisé ce mois-ci : ta série « ' + o[0].quete + ' » a survécu' : 'Prêt : le prochain raté du mois ne cassera pas ta série');
    const a = sem('Assassinat');
    ajoute(100, a ? 'Utilisé cette semaine (« ' + a.quete + ' »)' : 'Prêt : ta prochaine quête compte ×2');
  }
  return { niveau: P.capa.niveau, roublard: rb, liste: liste, sortPrepare: sortPrepare, restaurables: restaurables };
}

/** Magicien niv 5 : prépare le sort de la semaine sur une quête. */
function preparerSort(quete, heros) {
  return avecReglages_(function (ss, props, R, today) {
    const P = lireParams_(ss, R), lun = lundi_(today);
    if (P.capa.roublard || !capaActive_(P, 5)) throw new Error('Sort préparé : réservé au magicien de niveau 5');
    const ctx = contexteJournal_(ss, tz_(ss));
    if (capaUtilisee_(ctx, 'Sort préparé', lun, isoPlus_(lun, 6)).length) throw new Error('Le sort de la semaine a déjà été lancé');
    if (!catalogue_(ss)[quete]) throw new Error('Quête introuvable : ' + quete);
    R.sort = { lundi: lun, quete: quete };
  }, heros);
}

/** Magicien niv 20 : efface un raté des 7 derniers jours (une fois par mois). Le raté devient un repos. */
function utiliserRestauration(quete, heros) {
  return avecHeros_(heros, function () {
    const ss = SpreadsheetApp.getActive(), today = aujourdhui_();
    const P = lireParams_(ss);
    if (P.capa.roublard || !capaActive_(P, 20)) throw new Error('Restauration arcanique : réservée au magicien de niveau 20');
    const ctx = contexteJournal_(ss, tz_(ss)), mois = bornesMois_(today);
    if (capaUtilisee_(ctx, 'Restauration arcanique', mois[0], mois[1]).length) throw new Error('Déjà utilisée ce mois-ci');
    const cible = ctx.entrees.filter(function (e) { return e.quete === quete && e.statut === 'Raté' && ecart_(e.date, today) <= 7; })
      .sort(function (a, b) { return ecart_(a.date, b.date); })[0];
    if (!cible) throw new Error('Aucun raté récent pour « ' + quete + ' »');
    ctx.journal.getRange(cible.ligne, 3, 1, 2).setValues([['Repos', 'Restauration arcanique']]);
    return etat_(ss);
  });
}

/** Profil mis en cache 30 min (Life Grid + records) : l'onglet Profil s'ouvre sans attendre. */
function getProfil(heros) {
  MEMO_ = {}; HEROS_ = null;
  const cache = CacheService.getScriptCache(), k = 'profil|' + String(heros || '') + '|' + aujourdhui_();
  const vu = cache.get(k);
  if (vu) { try { return JSON.parse(vu); } catch (e) {} }
  const p = getProfilCalcul_(heros);
  try { const t = JSON.stringify(p); if (t.length < 95000) cache.put(k, t, 1800); } catch (e) {}
  return p;
}
/** Données de la page Profil : Life Grid, records, histoire. */
function getProfilCalcul_(heros) {
  MEMO_ = {}; HEROS_ = null;
  const ss = SpreadsheetApp.getActive();
  choisirHeros_(ss, heros);
  const tz = tz_(ss);
  const today = aujourdhui_();
  const naissance = hc_().naissance;
  let grille = '';
  const lg = ss.getSheetByName(ongletHeros_('Life Grid'));
  if (lg && estIso_(naissance)) {
    grille = lg.getRange(6, 2, 80, 52).getValues().map(function (r) {
      return r.map(function (v) { return v === '' ? '0' : String(Number(v) || 0); }).join('');
    }).join('');
  }
  const ctx = contexteJournal_(ss, tz);
  const habs = lireHabitudes_(ss);
  const record = habs.reduce(function (m, h) { return h.record > m.jours ? { nom: h.nom, jours: h.record } : m; }, { nom: '', jours: 0 });
  const chron = ss.getSheetByName(ONGLET_BILANS);
  const lignes = chron.getRange(LIGNE_QUETES, 1, Math.max(1, chron.getMaxRows() - LIGNE_QUETES + 1), Math.min(10, chron.getMaxColumns())).getValues()
    .filter(function (r) { return r[0] !== '' && estAMoi_(r.length > 9 ? r[9] : ''); });
  const meilleure = lignes.reduce(function (m, r) { return Number(r[2]) > m.xp ? { xp: Number(r[2]), lundi: versIso_(r[0], tz) } : m; }, { xp: 0, lundi: '' });
  const props = props_();
  const debut = props.getProperty(cle_('debut')) || '';
  const fiche = ss.getSheetByName(hc_().index === 0 ? 'Fiche du héros' : 'Fiche du compagnon');
  return {
    naissance: naissance,
    semaineVie: estIso_(naissance) ? semaineGrille_(naissance, today) : 0,
    grille: grille,
    records: {
      quetes: ctx.entrees.filter(function (e) { return e.statut === 'Fait'; }).length,
      bonusSerie: ctx.entrees.filter(function (e) { return e.statut === 'Bonus' && e.note.indexOf('Série') === 0; }).length,
      meilleureSerie: record,
      meilleureSemaine: meilleure,
      semainesChroniquees: lignes.length,
      parfaites: (grille.match(/4/g) || []).length,
      reussies: (grille.match(/3/g) || []).length,
      jours: estIso_(debut) && ecart_(debut, today) >= 0 ? ecart_(debut, today) + 1 : 0
    },
    histoire: histoire_(fiche)
  };
}

/** Les deux paragraphes sous « QUI EST TON HÉROS » (ou « QUI EST TON COMPAGNON ») dans la fiche. */
function histoire_(fiche) {
  if (!fiche) return [];
  const col = fiche.getRange(1, 2, Math.min(80, fiche.getMaxRows()), 1).getValues().map(function (r) { return String(r[0] || ''); });
  const i = col.findIndex(function (t) { return /QUI EST TON/i.test(t); });
  if (i < 0) return [];
  return col.slice(i + 1, i + 3).filter(String);
}

/* ====================== Sauvegarde automatique ======================
 * Chaque dimanche à 3 h, une copie complète du Sheet part dans un dossier Drive.
 * On garde les 8 dernières (2 mois). L'historique des versions de Google reste disponible en plus.
 */

const DOSSIER_SAUVEGARDES = 'La Compagnie de l\'Aube — Sauvegardes';
const SAUVEGARDES_GARDEES = 8;

/**
 * À lancer UNE fois depuis l'éditeur (menu des fonctions → installerSauvegarde → Exécuter).
 * Google demande l'accès à Drive (nécessaire pour créer les copies), puis une première sauvegarde est faite.
 */
function installerSauvegarde() {
  ScriptApp.getProjectTriggers()
    .filter(function (t) { return t.getHandlerFunction() === 'sauvegardeHebdo'; })
    .forEach(function (t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('sauvegardeHebdo').timeBased().onWeekDay(ScriptApp.WeekDay.SUNDAY).atHour(3)
    .inTimezone(SpreadsheetApp.getActive().getSpreadsheetTimeZone()).create();
  sauvegarder_(true);
}

/** Déclencheur hebdomadaire. */
function sauvegardeHebdo() {
  sauvegarder_(false); // la copie du Sheet passe toujours avant le ménage
  avecVerrou_(function () { menageComplet_(SpreadsheetApp.getActive()); });
}

/* =====================================================================
 * TENIR DANS LE TEMPS : ménage du dimanche (après la sauvegarde) et, à défaut, à la 1re ouverture de la semaine
 *  1. Mémoire du script (500 Ko max chez Google) : les textes de Claude des semaines passées sont effacés,
 *     les chapitres de la saga recopiés d'abord dans l'onglet « Saga (archives) ».
 *  2. Calendrier des boss : il avance tout seul (52 semaines et 12 mois visibles), les boss tournent en boucle.
 *  3. Journal : au-delà de JOURNAL_MAX lignes, les saisies de plus d'un an sont regroupées en lignes de cumul
 *     (une par héros, quête et statut) : l'XP, les caractéristiques et les compteurs restent exacts.
 * ===================================================================== */
const ONGLET_SAGA_ARCHIVES = 'Saga (archives)';
const MEMOIRE_SEMAINES = 6;             // textes de Claude gardés (semaines)
const JOURNAL_MAX = 20000;              // lignes remplies avant compactage
const JOURNAL_DETAIL_JOURS = 365;       // détail gardé (jours)
const COL_ARCHIVES_BOSS = 23;           // colonne W de Combats : compteurs des boss sortis du calendrier

function menageLeger_(ss) {
  const props = props_(), today = aujourdhui_();
  menageMemoire_(ss, props, today);
  roulerBoss_(ss, props, today);
  props.setProperty('menageLe', today);
}
function menageComplet_(ss) {
  menageLeger_(ss);
  compacterJournal_(ss, false);
}

/** 1. Mémoire du script */
function menageMemoire_(ss, props, today) {
  const P = PropertiesService.getScriptProperties(), tout = P.getProperties();
  const limite = isoPlus_(lundi_(today), -7 * MEMOIRE_SEMAINES), an = Number(today.slice(0, 4));
  const archives = [];
  Object.keys(tout).forEach(function (k) {
    let m = k.match(/^(mj|mjEssai|chronique|bossParole|coach|pacte)\|(\d{4}-\d{2}-\d{2})/);
    if (m) {
      if (ecart_(m[2], limite) <= 0) return;
      if (m[1] === 'mj') { try { const c = JSON.parse(tout[k]); archives.push([m[2], c.titre || '', c.texte || '', c.resume || '']); } catch (e) {} }
      P.deleteProperty(k); return;
    }
    m = k.match(/^evenement\|.*-(\d{4})$/);
    if (m && Number(m[1]) < an) { P.deleteProperty(k); return; }
    m = k.match(/^retro\|(\d{4})$/);
    if (m && Number(m[1]) < an - 1) P.deleteProperty(k);
  });
  PROPS_ = null;
  if (archives.length) {
    let sh = ss.getSheetByName(ONGLET_SAGA_ARCHIVES);
    if (!sh) {
      sh = ss.insertSheet(ONGLET_SAGA_ARCHIVES);
      sh.getRange(1, 1, 1, 4).setValues([['Semaine du', 'Chapitre', 'Texte', 'Résumé']]).setFontWeight('bold');
      sh.setFrozenRows(1); sh.setColumnWidth(3, 600); sh.getRange(1, 3, sh.getMaxRows(), 1).setWrap(true);
    }
    archives.sort(function (a, b) { return a[0] < b[0] ? -1 : 1; });
    sh.getRange(sh.getLastRow() + 1, 1, archives.length, 4).setValues(archives.map(function (r) { return [versDateSheet_(r[0], tz_(ss))].concat(r.slice(1)); }));
  }
}

/** 2. Calendrier des boss : noms et rangs calculés depuis une date d'origine fixe, fenêtre qui avance par trimestre */
function roulerBoss_(ss, props, today) {
  const sh = ss.getSheetByName(ONGLET_COMBATS), par = ss.getSheetByName('Paramètres');
  if (!sh || !par) return;
  migrationBossDates_(ss, sh, par, props);
  const tz = tz_(ss);
  const debut = versIso_(par.getRange('B76').getValue(), tz);
  if (!estIso_(debut)) return;
  const semaines = Math.floor(ecart_(debut, lundi_(today)) / 7);
  if (semaines < 17) return; // il reste au moins 35 semaines devant : rien à faire
  const s = semaines - 4;     // on garde les 4 dernières semaines visibles
  const nouveau = isoPlus_(debut, 7 * s);
  const mois = function (iso) { return Number(iso.slice(0, 4)) * 12 + Number(iso.slice(5, 7)) - 1; };
  const m = mois(nouveau) - mois(debut);
  const nW = COMBATS_SEMAINE[1] - COMBATS_SEMAINE[0] + 1, nM = COMBATS_MOIS[1] - COMBATS_MOIS[0] + 1;
  const W = sh.getRange(COMBATS_SEMAINE[0], 1, nW, COL_VAINCU).getValues(), M = sh.getRange(COMBATS_MOIS[0], 1, nM, COL_VAINCU).getValues();
  const noms = sh.getRange(3, 8, 1, 2).getValues()[0];
  // compteurs des boss qui sortent du calendrier (salle des trophées, titres)
  const A = sh.getRange(4, COL_ARCHIVES_BOSS, 7, 1).getValues().map(function (r) { return Number(r[0]) || 0; });
  const compter = function (lignes, k, iV, iE) {
    lignes.slice(0, k).forEach(function (r) {
      if (r[11] === '⚔ Vaincu') { A[iV]++; A[6] += Number(r[13]) || 0; if (r[12] && r[12] === noms[0]) A[4]++; if (r[12] && r[12] === noms[1]) A[5]++; }
      if (r[11] === 'Enfui') A[iE]++;
    });
  };
  compter(W, Math.min(s, nW), 0, 1); compter(M, Math.min(m, nM), 2, 3);
  // la colonne « Vaincu le » (seule valeur figée par ligne) suit son boss
  const decaler = function (lignes, k) { return lignes.map(function (r, i) { return [i + k < lignes.length ? lignes[i + k][COL_VAINCU - 1] : '']; }); };
  sh.getRange(COMBATS_SEMAINE[0], COL_VAINCU, nW, 1).setValues(decaler(W, s));
  sh.getRange(COMBATS_MOIS[0], COL_VAINCU, nM, 1).setValues(decaler(M, m));
  sh.getRange(4, COL_ARCHIVES_BOSS, 7, 1).setValues(A.map(function (x) { return [x]; }));
  par.getRange('B76').setValue(versDateSheet_(nouveau, tz));
  journalErreur_('serveur', '', 'roulerBoss', 'Calendrier des boss avancé de ' + s + ' semaines (début ' + nouveau + ')', '');
}
function migrationBossDates_(ss, sh, par, props) {
  if (props.getProperty('migrationBoss') === 'v3') return;
  if (props.getProperty('migrationBoss') !== 'v2') migrationBoss_(ss);
  const sep = /;/.test(sh.getRange(COMBATS_SEMAINE[0], 3).getFormula()) ? ';' : ',';
  const f = function (t) { return sep === ';' ? t : t.replace(/;/g, ','); };
  const o = "'Paramètres'!$B$77";
  par.getRange('A77').setValue('Origine du calendrier des boss (ne pas modifier)');
  if (!par.getRange('B77').getValue()) par.getRange('B77').setValue(par.getRange('B76').getValue());
  const cw = [], cm = [];
  for (let r = COMBATS_SEMAINE[0]; r <= COMBATS_SEMAINE[1]; r++) {
    const k = 'ROUND(($A' + r + '-' + o + ')/7)';
    cw.push([f('=IFERROR(INDEX(FILTER(Bestiaire!$A$4:$A$40;Bestiaire!$B$4:$B$40="Semaine");MOD(' + k + ';COUNTIF(Bestiaire!$B$4:$B$40;"Semaine"))+1);"")'),
      f('=MIN(5;IFERROR(VLOOKUP($C' + r + ';Bestiaire!$A$4:$C$40;3;FALSE);1)+INT(' + k + '/MAX(1;COUNTIF(Bestiaire!$B$4:$B$40;"Semaine"))))')]);
  }
  for (let r = COMBATS_MOIS[0]; r <= COMBATS_MOIS[1]; r++) {
    const k = '((YEAR($A' + r + ')-YEAR(' + o + '))*12+MONTH($A' + r + ')-MONTH(' + o + '))';
    cm.push([f('=IFERROR(INDEX(FILTER(Bestiaire!$A$4:$A$40;Bestiaire!$B$4:$B$40="Mois");MOD(' + k + ';COUNTIF(Bestiaire!$B$4:$B$40;"Mois"))+1);"")')]);
  }
  sh.getRange(COMBATS_SEMAINE[0], 3, cw.length, 2).setFormulas(cw);
  sh.getRange(COMBATS_MOIS[0], 3, cm.length, 1).setFormulas(cm);
  // compteurs des boss passés (colonne W) et salle des trophées qui en tient compte
  sh.getRange(3, COL_ARCHIVES_BOSS).setValue('Archives');
  const lib = ['Semaine : vaincus', 'Semaine : enfuis', 'Mois : vaincus', 'Mois : enfuis', 'Fléau 1er héros', 'Fléau 2e héros', 'XP de récompense'];
  const v = sh.getRange(4, COL_ARCHIVES_BOSS, 7, 1).getValues();
  sh.getRange(4, COL_ARCHIVES_BOSS, 7, 1).setValues(v.map(function (r) { return [Number(r[0]) || 0]; }));
  sh.getRange(4, COL_ARCHIVES_BOSS + 1, 7, 1).setValues(lib.map(function (x) { return [x]; }));
  sh.getRange('T4').setFormula(f('=(COUNTIF(L4:L55;"⚔ Vaincu")+N($W$4))&" / "&(COUNTIF(L4:L55;"⚔ Vaincu")+COUNTIF(L4:L55;"Enfui")+N($W$4)+N($W$5))'));
  sh.getRange('T5').setFormula(f('=(COUNTIF(L60:L71;"⚔ Vaincu")+N($W$6))&" / "&(COUNTIF(L60:L71;"⚔ Vaincu")+COUNTIF(L60:L71;"Enfui")+N($W$6)+N($W$7))'));
  sh.getRange('T6').setFormula(f('=(COUNTIF(M4:M71;H3)+N($W$8))&" fois"'));
  sh.getRange('T7').setFormula(f('=IF(I3="";"";(COUNTIF(M4:M71;I3)+N($W$9))&" fois")'));
  sh.getRange('T8').setFormula(f('=(SUM(N4:N55)+SUM(N60:N71)+N($W$10))&" XP"'));
  props.setProperty('migrationBoss', 'v3');
}

/** 3. Journal : regroupe les saisies anciennes en lignes de cumul (après la sauvegarde du dimanche) */
function compacterJournal_(ss, force) {
  const journal = ss.getSheetByName(ONGLET_JOURNAL), tz = tz_(ss), today = aujourdhui_(), props = props_();
  migrationRang_(journal);
  const nLignes = journal.getMaxRows() - 1;
  const v = journal.getRange(2, 1, nLignes, COLS_JOURNAL).getValues();
  const remplies = v.filter(function (r) { return r[1] !== ''; }).length;
  if (!force && remplies < JOURNAL_MAX) return { fait: false, lignes: remplies };
  const coupure = isoPlus_(today, -JOURNAL_DETAIL_JOURS);
  // Ne pas toucher : les séances d'une quête épique dans sa fenêtre (son statut compte les lignes),
  // et pour une habitude, tout depuis son dernier raté (la série en cours se calcule dessus).
  const epiques = ss.getSheetByName(ONGLET_OBJECTIFS) ? ss.getSheetByName(ONGLET_OBJECTIFS).getRange(4, 1, 20, 5).getValues()
    .filter(function (r) { return r[0] !== '' && r[2] !== ''; })
    .map(function (r) { return { q: r[2], d: versIso_(r[3], tz), f: versIso_(r[4], tz) }; }) : [];
  const habs = {}; // toutes les habitudes, des deux héros (lireHabitudes_ ne rend que celles du héros courant)
  ss.getSheetByName(ONGLET_HABITUDES).getRange(LIGNE_QUETES, 1, 30, 1).getValues().forEach(function (r) { if (r[0] !== '') habs[r[0]] = true; });
  const premier = (lireHeros_(ss)[0] || {}).nom || '';
  const qui = function (r) { return String(r[13] || '') || premier; };
  const dernierRate = {};
  v.forEach(function (r) {
    if (r[1] === '' || r[2] !== 'Raté') return;
    const k = qui(r) + '|' + r[1], d = versIso_(r[0], tz);
    if (!dernierRate[k] || ecart_(dernierRate[k], d) > 0) dernierRate[k] = d;
  });
  const eligible = function (r) {
    if (r[1] === '') return false;
    const d = versIso_(r[0], tz);
    if (!estIso_(d) || ecart_(d, coupure) <= 0) return false;
    if (epiques.some(function (e) { return e.q === r[1] && ecart_(e.d, d) >= 0 && ecart_(d, e.f) >= 0; })) return false;
    if (habs[r[1]]) { const dr = dernierRate[qui(r) + '|' + r[1]]; if (!dr || ecart_(d, dr) <= 0) return false; }
    return true;
  };
  // Points de vie : état mémorisé à la date de coupure, pour chaque héros, AVANT de toucher au détail
  const anciens = HEROS_;
  lireHeros_(ss).forEach(function (h) {
    HEROS_ = null; choisirHeros_(ss, h.nom);
    const ctx = contexteJournal_(ss, tz), P = lireParams_(ss, lireReglages_(props));
    const debut = props.getProperty(cle_('debut')) || '';
    if (!estIso_(debut) || ecart_(debut, coupure) <= 0) return;
    const e = simulerPV_(ctx, P, nomsAnnexes_(ss), debut, isoPlus_(coupure, -1));
    props.setProperty(cle_('pvDepart'), JSON.stringify({ date: coupure, pv: e.pv, arc: e.arc }));
  });
  HEROS_ = anciens;
  const groupes = {}, ordre = [], gardees = [];
  v.forEach(function (r) {
    if (r[1] === '') return;
    if (!eligible(r)) { gardees.push(r); return; }
    const archive = String(r[3] || '').indexOf(MARQUE_ARCHIVE) === 0;
    const n = archive ? (Number(r[8]) || 1) : 1;
    const noteOrig = r[2] === 'Bonus' ? (archive ? String(r[3]).replace(/^📦 \d+ × /, '') : String(r[3] || '')) : '';
    const k = [qui(r), r[1], r[2], r[4], r[5], r[6], noteOrig].join('|');
    if (!groupes[k]) { groupes[k] = { r: r, n: 0, xp: 0, d: '', note: noteOrig }; ordre.push(k); }
    const g = groupes[k], d = versIso_(r[0], tz);
    g.n += n; g.xp += Number(r[10]) || 0;
    if (!g.d || ecart_(g.d, d) > 0) g.d = d;
  });
  if (!ordre.length) return { fait: false, lignes: remplies };
  const cumuls = ordre.map(function (k) {
    const g = groupes[k], r = g.r;
    const note = MARQUE_ARCHIVE + g.n + (r[2] === 'Bonus' ? ' × ' + (g.note || 'Bonus') : ' saisies jusqu\'au ' + g.d.split('-').reverse().join('/'));
    return [versDateSheet_(g.d, tz), r[1], r[2], note, r[4], r[5], r[6], 0, g.n, '', '', g.xp ? Math.round(g.xp * 100) / 100 : '', '', qui(r)];
  }).sort(function (a, b) { return a[0] - b[0]; });
  const final = cumuls.concat(gardees);
  // écriture : colonnes A-I et L-N (J et K restent des formules) ; le reste est vidé
  const AI = final.map(function (r) { return r.slice(0, 9); }), LN = final.map(function (r) { return r.slice(11, 14); });
  journal.getRange(2, 1, nLignes, 9).clearContent(); journal.getRange(2, 12, nLignes, 3).clearContent();
  journal.getRange(2, 1, AI.length, 9).setValues(AI); journal.getRange(2, 12, LN.length, 3).setValues(LN);
  const garder = final.length + 500;
  if (journal.getMaxRows() - 1 > garder) journal.deleteRows(garder + 2, journal.getMaxRows() - 1 - garder);
  props.setProperty('dernierCompactage', today);
  journalErreur_('serveur', '', 'compacterJournal', remplies + ' lignes → ' + final.length + ' (' + cumuls.length + ' lignes de cumul)', '');
  return { fait: true, avant: remplies, apres: final.length, cumuls: cumuls.length };
}
/** À lancer à la main depuis l'éditeur si besoin (après une sauvegarde) : compacte sans attendre le seuil. */
function compacterJournalMaintenant() { sauvegarder_(true); return avecVerrou_(function () { return compacterJournal_(SpreadsheetApp.getActive(), true); }); }

/** Bouton « Sauvegarder maintenant » de l'app. */
function sauvegarderMaintenant(heros) {
  sauvegarder_(true);
  return getState(heros);
}

function dossierSauvegardes_(props) {
  const id = props.getProperty('dossierSauvegardes');
  if (id) {
    try { const d = DriveApp.getFolderById(id); if (!d.isTrashed()) return d; } catch (e) { /* dossier supprimé : on le recrée */ }
  }
  const it = DriveApp.getFoldersByName(DOSSIER_SAUVEGARDES);
  const d = it.hasNext() ? it.next() : DriveApp.createFolder(DOSSIER_SAUVEGARDES);
  props.setProperty('dossierSauvegardes', d.getId());
  props.setProperty('dossierSauvegardesUrl', d.getUrl());
  return d;
}

function sauvegarder_(manuel) {
  const ss = SpreadsheetApp.getActive();
  const props = props_();
  const today = aujourdhui_();
  if (!manuel && props.getProperty('derniereSauvegarde') === today) return;
  const dossier = dossierSauvegardes_(props);
  try { exporterMemoire_(ss, props); } catch (e) { console.warn('Mémoire non exportée : ' + e); }
  const heure = Utilities.formatDate(new Date(), tz_(ss), 'HH\'h\'mm');
  DriveApp.getFileById(ss.getId()).makeCopy('Sauvegarde ' + today + ' ' + heure + ' · ' + ss.getName(), dossier);
  // Rotation : on ne garde que les plus récentes
  const fichiers = [];
  const it = dossier.getFiles();
  while (it.hasNext()) { const f = it.next(); if (f.getName().indexOf('Sauvegarde ') === 0) fichiers.push(f); }
  fichiers.sort(function (a, b) { return b.getDateCreated() - a.getDateCreated(); });
  fichiers.slice(SAUVEGARDES_GARDEES).forEach(function (f) { f.setTrashed(true); });
  props.setProperty('derniereSauvegarde', today);
}

/**
 * La « mémoire » de l'app (réglages, titres, pactes, d20, reliques, chroniques…) vit dans les propriétés du script,
 * qu'une copie du Sheet n'emporte pas. On la recopie dans un onglet caché avant chaque sauvegarde.
 * Les clés secrètes (Claude, intervals.icu, codes) ne sont JAMAIS recopiées.
 */
const ONGLET_MEMOIRE = 'Mémoire de l\'app (sauvegarde)';
function exporterMemoire_(ss, props) {
  const tout = props.getProperties();
  const lignes = Object.keys(tout).filter(function (k) { return !/KEY|TOKEN|CLE|SECRET/i.test(k); }).sort()
    .map(function (k) { return [k, String(tout[k]).slice(0, 49000)]; });
  let sh = ss.getSheetByName(ONGLET_MEMOIRE);
  if (!sh) { sh = ss.insertSheet(ONGLET_MEMOIRE); sh.hideSheet(); }
  sh.clearContents();
  sh.getRange(1, 1, 1, 2).setValues([['Propriété', 'Valeur (copie du ' + aujourdhui_() + ')']]);
  if (lignes.length) sh.getRange(2, 1, lignes.length, 2).setNumberFormat('@').setValues(lignes);
}
/** Dépannage : à exécuter depuis l'éditeur pour remettre la mémoire de l'app depuis l'onglet caché (après une restauration). */
function restaurerMemoire() {
  const ss = SpreadsheetApp.getActive(), sh = ss.getSheetByName(ONGLET_MEMOIRE);
  if (!sh || sh.getLastRow() < 2) { Logger.log('Aucune mémoire sauvegardée.'); return; }
  const props = props_();
  sh.getRange(2, 1, sh.getLastRow() - 1, 2).getValues().forEach(function (r) { if (r[0]) props.setProperty(String(r[0]), String(r[1])); });
  Logger.log('Mémoire restaurée ✔ (' + (sh.getLastRow() - 1) + ' entrées). Recolle tes clés Claude et intervals.icu dans le Carnet.');
}

/* ====================== Rappel du soir par e-mail ====================== */

const HEURE_RAPPEL = 20; // heure par défaut (modifiable depuis l'app : Profil → Réglages)
/* Adresse de secours des rappels du 1er héros (si sa fiche n'a pas d'e-mail, colonne J de Fiches des héros).
 * Elle n'est plus écrite ici (dépôt GitHub public) : Apps Script → Paramètres du projet → Propriétés du script → EMAIL_RAPPEL. */
function emailRappel_() { return String(props_().getProperty('EMAIL_RAPPEL') || '').trim(); }

/**
 * À lancer UNE fois depuis l'éditeur (menu déroulant des fonctions → installerRappel → Exécuter).
 * Crée l'envoi automatique chaque soir. Relancer cette fonction remplace l'ancien réglage.
 */
function installerRappel() {
  MEMO_ = {}; HEROS_ = null;
  const props = props_();
  const R = lireReglages_(props);
  R.rappel.actif = true;
  ecrireReglages_(props, R);
  installerDeclencheur_();
  rappelDuSoir(true); // e-mail de test immédiat
}

/** (Ré)installe les déclencheurs : un par heure de rappel utilisée par au moins un héros. */
function installerDeclencheur_() {
  const ss = SpreadsheetApp.getActive(), props = props_();
  ScriptApp.getProjectTriggers()
    .filter(function (t) { return t.getHandlerFunction() === 'rappelDuSoir'; })
    .forEach(function (t) { ScriptApp.deleteTrigger(t); });
  const heures = {};
  lireHeros_(ss).forEach(function (h) { const c = lireReglages_(props, h).rappel; if (c.actif) heures[c.heure] = true; });
  Object.keys(heures).forEach(function (hr) {
    ScriptApp.newTrigger('rappelDuSoir').timeBased().everyDays(1).atHour(Number(hr)).inTimezone(ss.getSpreadsheetTimeZone()).create();
  });
}

/** Pour arrêter les rappels (de tous les héros). */
function desinstallerRappel() {
  MEMO_ = {}; HEROS_ = null;
  const ss = SpreadsheetApp.getActive(), props = props_();
  lireHeros_(ss).forEach(function (h) { const R = lireReglages_(props, h); R.rappel.actif = false; ecrireReglages_(props, R, h); });
  ScriptApp.getProjectTriggers()
    .filter(function (t) { return t.getHandlerFunction() === 'rappelDuSoir'; })
    .forEach(function (t) { ScriptApp.deleteTrigger(t); });
}

/**
 * Déclencheur du soir : envoie le rappel à chaque héros dont c'est l'heure.
 * rappelDuSoir(true, 'Nom') : e-mail de test immédiat pour ce héros (le 1er par défaut).
 */
function rappelDuSoir(test, heros) {
  test = test === true; // un déclencheur automatique passe un objet « événement » : ce n'est pas un test
  MEMO_ = {}; HEROS_ = null;
  const ss = SpreadsheetApp.getActive();
  const props = props_();
  const heure = Number(Utilities.formatDate(new Date(), ss.getSpreadsheetTimeZone(), 'H'));
  lireHeros_(ss).forEach(function (h) {
    const cible = test ? (heros ? h.nom === heros : h.index === 0) : lireReglages_(props, h).rappel.heure === heure;
    if (!cible) return;
    try { rappelHeros_(test, h); } catch (e) { console.error('Rappel ' + h.nom + ' : ' + e.message); }
  });
}

function rappelHeros_(test, h) {
  const s = getState(h.nom);
  const email = h.email || (h.index === 0 ? emailRappel_() : '');
  if (!email) return;
  const cfg = s.reglages.rappel;
  if (!cfg.actif && !test) return;
  if (s.vacances && !test) return;
  const touche = function (h) { return h.jour.fait || h.jour.rate || h.jour.repos; };
  const restantes = s.habitudes.filter(function (h) { return h.aFaire && !touche(h); });
  const dimanche = jourSemaine_(s.today) === 6 && cfg.dimanche;
  if (!restantes.length && !test && !dimanche) return;

  const prenom = String(s.heros || 'Héros').split(' ')[0];
  const sujet = '[Compagnie de l\'Aube] ' + (restantes.length
    ? '⚔️ ' + prenom + ', ' + restantes.length + (restantes.length > 1 ? ' quêtes t\'attendent' : ' quête t\'attend') + ' ce soir'
    : dimanche ? '📜 ' + prenom + ', ton bilan de la semaine'
    : '✨ ' + prenom + ', toutes tes quêtes du jour sont faites (e-mail de test)');
  const b = s.bilan.semaine;
  const blocBilan = dimanche ? '<div style="background:#f6efe0;border-radius:8px;padding:10px 12px;margin:12px 0">' +
    '<b style="color:#6e1e1e">📜 Bilan de la semaine</b><br>' + b.xp + ' XP · ' + b.faits + ' quêtes faites · ' +
    b.aJour + '/' + b.total + ' habitudes à jour · ' + b.rates + ' raté' + (b.rates > 1 ? 's' : '') + '</div>' : '';

  const lignes = restantes.map(function (h) {
    const serie = h.serieNb > 0 && h.serie > 0 ? ' <span style="color:#e07a2c">🔥 série de ' + h.serie + ' j en jeu</span>' : '';
    return '<li style="margin:6px 0"><b>' + h.nom + '</b> · ' + Math.round(h.xp) + ' XP' + serie + '</li>';
  }).join('');

  const alertes = [];
  if (s.arc) alertes.push('⚔️ Tu es à terre : une seule quête aujourd\'hui te rapproche de la relève (' + s.arc.jours + '/' + s.arc.requis + ').');
  else if (s.pv < s.seuilEpuise) alertes.push('😮‍💨 Tu es Épuisé (' + s.pv + ' PV) : chaque quête faite te soigne.');
  if (s.jokersRestants > 0 && restantes.length) alertes.push('🃏 Il te reste un joker cette semaine si la journée est vraiment impossible.');
  alertes.push('🌙 Pense à valider ton coucher le soir même, avant de dormir.');

  // Le rappel étoffé : boss, Compagnie, pacte, d20, événement, Carnet, et un mot du mentor
  const carte = function (titre, corps, fond) { return '<div style="background:' + (fond || '#f4f0fa') + ';border-radius:8px;padding:10px 12px;margin:10px 0"><b style="color:#4b2a7a">' + titre + '</b><br><span style="font-size:13px;color:#333">' + corps + '</span></div>'; };
  const blocs = [];
  try {
    const b = s.boss && s.boss.semaine;
    if (b && b.statut === 'En cours') {
      const faibles = restantes.filter(function (q) { return q.carac === b.faible; }).map(function (q) { return q.nom; });
      const j = Math.max(0, ecart_(s.today, b.fin));
      blocs.push(carte('🐉 ' + b.nom, Math.round(b.pv) + ' / ' + Math.round(b.pvMax) + ' PV · ' + (j ? 'encore ' + j + ' jour' + (j > 1 ? 's' : '') : 'dernier jour !') +
        (faibles.length ? '<br>⚡ Frappe sa faiblesse ce soir : ' + faibles.join(', ') + '.' : '') +
        (b.degats ? '<br>Dégâts : ' + Object.keys(b.degats).map(function (n) { return n.split(' ')[0] + ' ' + Math.round(b.degats[n]); }).join(' · ') : ''), '#fbeeee'));
    } else if (b && b.statut === 'Vaincu') blocs.push(carte('🐉 ' + b.nom + ' est vaincu', 'Trophée : ' + (b.trophee || '') + '. Le prochain arrive lundi.', '#f6efe0'));
    const C = s.camp;
    if (C) {
      const autres = C.aujourdhui.filter(function (x) { return !x.moi; });
      let t = autres.map(function (x) { return x.nom.split(' ')[0] + ' : ' + (x.faits ? x.faits + ' quête' + (x.faits > 1 ? 's' : '') + ' aujourd\'hui' : 'pas encore de quête aujourd\'hui'); }).join('<br>');
      if (C.ensemble > 1) t += '<br>🔥 ' + C.ensemble + ' jours d\'affilée où toute la Compagnie a agi : ne casse pas la chaîne.';
      if (C.pacte && C.pacte.accepte) t += '<br>🤝 Pacte : « ' + C.pacte.texte + ' » · ' + (C.pacte.ok ? 'en bonne voie' : 'compromis') + (C.pacte.detail ? ' (' + C.pacte.detail + ')' : '');
      else if (C.pacte && !C.pacte.accepte && C.pacte.par !== s.heros) t += '<br>🤝 ' + C.pacte.par.split(' ')[0] + ' te propose un pacte : « ' + C.pacte.texte + ' ». Scelle-le dans l\'app.';
      if (!C.encourage) t += '<br>📣 Tu n\'as encouragé personne aujourd\'hui.';
      blocs.push(carte('🤝 La Compagnie', t));
    }
    const ev = s.evenement && s.evenement.actuel;
    if (ev) blocs.push(carte('✨ ' + ev.nom, ev.effetTexte + ' jusqu\'au ' + ev.fin.slice(8, 10) + '/' + ev.fin.slice(5, 7) + '.' + (ev.texte ? '<br><i>' + ev.texte + '</i>' : ''), '#fff8e6'));
    if (s.d20) blocs.push(carte('🎲 Ton d20 du jour : ' + s.d20.de, s.d20.titre + (s.d20.mult !== 1 ? ' · XP ×' + String(s.d20.mult).replace('.', ',') + ' sur tes quêtes de ce soir' : ''), '#f6efe0'));
    else blocs.push(carte('🎲 Ton d20 n\'est pas lancé', 'Lance-le avant de valider tes quêtes : il peut multiplier ton XP.', '#f6efe0'));
    if (s.carnet) {
      const st = JSON.parse(carnetLire_(SpreadsheetApp.getActive()) || 'null');
      if (st && st.en) {
        const dus = (st.en.deck || []).filter(function (c) { return c.reps && c.due && c.due <= s.today; }).length;
        const der = (st.en.sessions || []).map(function (x) { return x.date; }).sort().pop();
        const t = (dus ? dus + ' mot' + (dus > 1 ? 's' : '') + ' à réviser (5 min suffisent)' : 'aucune révision en attente') +
          (der ? '<br>Dernière séance d\'anglais : le ' + der.slice(8, 10) + '/' + der.slice(5, 7) + '.' : '<br>Ta première séance d\'anglais t\'attend (mission ou conversation orale).');
        blocs.push(carte('📖 Carnet', t));
      }
    }
    const mot = claudeCourt_('Tu es le mentor de ' + s.heros + ' dans un jeu de rôle de bonnes habitudes. Il est ' + cfg.heure + ' h. ' +
      (restantes.length ? 'Il lui reste : ' + restantes.map(function (q) { return q.nom; }).join(', ') + '.' : 'Il a tout fait aujourd\'hui.') +
      (s.boss && s.boss.semaine && s.boss.semaine.statut === 'En cours' ? ' Le boss ' + s.boss.semaine.nom + ' a encore ' + Math.round(s.boss.semaine.pv) + ' PV.' : '') +
      ' Écris UNE phrase en français, tutoiement, ton épique et complice (pas de reproche), pour le motiver ce soir. Pas de guillemets, pas de markdown.');
    if (mot) blocs.unshift('<p style="font-style:italic;color:#6e1e1e;font-size:15px">« ' + mot + ' »</p>');
  } catch (e) { console.warn('Rappel étoffé : ' + e); }

  const url = APP_PUBLIC_URL || ScriptApp.getService().getUrl();
  const html =
    '<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;color:#222">' +
    '<div style="font-size:11px;letter-spacing:2px;color:#8a6d1a;text-transform:uppercase">La Compagnie de l\'Aube</div>' +
    '<div style="font-size:12px;color:#999;font-style:italic;margin-bottom:10px">Ce que l\'on tient chaque jour forge ce que l\'on devient.</div>' +
    '<h2 style="color:#4b2a7a;margin-bottom:4px">' + s.heros + '</h2>' +
    '<div style="color:#8a6d1a;font-style:italic;margin-bottom:14px">' + s.titre + ' · niveau ' + s.niveau + ' · ' + s.pv + '/' + s.pvMax + ' PV</div>' +
    blocBilan +
    (restantes.length ? '<p>Encore à faire aujourd\'hui :</p><ul style="padding-left:18px">' + lignes + '</ul>'
      : '<p>Aucune quête en attente : journée parfaite.</p>') +
    blocs.join('') +
    '<p style="font-size:13px;color:#555">' + alertes.join('<br>') + '</p>' +
    (url ? '<p><a href="' + url + '" style="display:inline-block;background:#4b2a7a;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">Ouvrir l\'app</a></p>' : '') +
    '<p style="font-size:11px;color:#999">Rappel envoyé vers ' + cfg.heure + ' h seulement s\'il reste des quêtes' + (cfg.dimanche ? ', et le dimanche avec ton bilan' : '') + '. Réglages : app → ton profil → Rappel du soir.</p></div>';

  MailApp.sendEmail({ to: email, subject: sujet, htmlBody: html });
}

/* ====================== Journal des quêtes (onglet « Journal » de l'app) ======================
 * Les 8 derniers jours, jour par jour : ce qui a été fait, raté, mis en joker, et les bonus.
 * On peut corriger un oubli de la veille (ou des 7 derniers jours) sans ouvrir le Sheet :
 * « Je l'avais faite » remplace le raté ou le joker automatique, « Retirer » efface une saisie.
 */
const JOURNAL_JOURS = 7; // 7 jours glissants : aujourd'hui et les 6 jours d'avant
function journalRecent(jours, heros) {
  MEMO_ = {}; HEROS_ = null; PROPS_ = null;
  const ss = SpreadsheetApp.getActive();
  choisirHeros_(ss, heros);
  return journalPour_(ss, Math.max(1, Math.min(14, Number(jours) || JOURNAL_JOURS)));
}
function journalPour_(ss, n) {
  const tz = tz_(ss), today = aujourdhui_(), debut = isoPlus_(today, -(n - 1));
  const ctx = contexteJournal_(ss, tz);
  const parJour = {};
  ctx.entrees.forEach(function (e) {
    if (e.archive || !estIso_(e.date) || ecart_(debut, e.date) < 0 || ecart_(e.date, today) < 0) return;
    (parJour[e.date] = parJour[e.date] || []).push({
      quete: String(e.quete), statut: e.statut, note: e.note,
      xp: Math.round((e.statut === 'Fait' ? e.xpFait : 0) + (e.bonus || 0)),
      auto: /\(auto\)$/.test(e.note), ligne: e.ligne
    });
  });
  const habs = lireHabitudes_(ss).map(function (h) { return h.nom; });
  const annexes = ss.getSheetByName(ONGLET_ANNEXES).getRange(LIGNE_QUETES, 1, 40, 13).getValues()
    .filter(function (r) { return r[0] !== '' && estAMoi_(r[12]); }).map(function (r) { return String(r[0]); });
  const jours = [];
  for (let k = 0; k < n; k++) {
    const d = isoPlus_(today, -k);
    jours.push({ date: d, saisies: (parJour[d] || []).sort(function (a, b) { return a.ligne - b.ligne; }).map(function (x) { delete x.ligne; return x; }) });
  }
  return { today: today, jours: jours, quotidiennes: habs, annexes: annexes };
}
/** Corrige un jour passé (7 jours au plus) : la quête est comptée faite (ou ratée) ce jour-là. */
function corrigerJour(quete, statut, date, heros) {
  quete = String(quete || ''); statut = String(statut || 'Fait');
  if (!quete) throw new Error('Quête manquante');
  if (statut !== 'Fait' && statut !== 'Raté') throw new Error('Statut inconnu : ' + statut);
  if (!estIso_(date)) throw new Error('Date invalide');
  return avecHeros_(heros, function () {
    const ss = SpreadsheetApp.getActive(), today = aujourdhui_(), ecart = ecart_(date, today);
    if (ecart < 0) throw new Error('On ne corrige pas un jour à venir');
    if (ecart > JOURNAL_JOURS - 1) throw new Error('Une fois passés 7 jours, la correction se fait dans le Sheet');
    if (!catalogue_(ss)[quete]) throw new Error('Cette quête n\'existe plus : ' + quete);
    // La nouvelle saisie remplace ce qui était noté ce jour-là pour cette quête (fait, raté ou joker ; les bonus restent)
    const ctx = contexteJournal_(ss, tz_(ss));
    ctx.entrees.filter(function (e) { return !e.archive && e.quete === quete && e.date === date && e.statut !== 'Bonus'; })
      .forEach(function (e) { effacer_(ctx, e); });
    MEMO_ = {};
    saisir_(ss, quete, statut, date, ecart === 0 ? '' : 'Corrigé le ' + today.slice(8, 10) + '/' + today.slice(5, 7));
    MEMO_ = {};
    const etat = etat_(ss);
    etat.journalQuetes = journalPour_(ss, JOURNAL_JOURS);
    return etat;
  });
}
/** Retire une saisie (la dernière de cette quête ce jour-là, hors bonus). */
function retirerSaisie(quete, date, heros) {
  if (!estIso_(date)) throw new Error('Date invalide');
  return avecHeros_(heros, function () {
    const ss = SpreadsheetApp.getActive(), today = aujourdhui_();
    if (ecart_(date, today) > JOURNAL_JOURS - 1 || ecart_(date, today) < 0) throw new Error('Une fois passés 7 jours, la correction se fait dans le Sheet');
    annuler_(ss, String(quete || ''), date);
    MEMO_ = {};
    const etat = etat_(ss);
    etat.journalQuetes = journalPour_(ss, JOURNAL_JOURS);
    return etat;
  });
}

/* ====================== Préparation de la journée (vers 0 h 30) ======================
 * Le premier calcul du jour (ratés automatiques, séries, bilans, ménage) est le plus long :
 * il est fait pendant la nuit, pour que l'app s'ouvre vite le matin.
 * Les célébrations calculées la nuit (bonus de série, titre…) sont gardées pour la prochaine ouverture.
 * Le déclencheur s'installe tout seul au premier appel de l'app (ou à la main : installerPreparation).
 */
function preparerJournee() {
  const ss = SpreadsheetApp.getActive();
  MEMO_ = {}; HEROS_ = null; PROPS_ = null;
  lireHeros_(ss).forEach(function (h) {
    try {
      avecHeros_(h.nom, function () {
        const ent = entretien_(SpreadsheetApp.getActive());
        if (ent.nouveaux && ent.nouveaux.length) {
          const props = props_(), k = cle_('celebrationsEnAttente');
          let file = []; try { file = JSON.parse(props.getProperty(k) || '[]'); } catch (x) {}
          props.setProperty(k, JSON.stringify(file.concat(ent.nouveaux).slice(-20)));
        }
      });
      CacheService.getScriptCache().remove('profil|' + h.nom + '|' + aujourdhui_());
    } catch (e) { journalErreur_('serveur', h.nom, 'preparerJournee', e.message, ''); }
  });
}
function installerPreparation() {
  ScriptApp.getProjectTriggers()
    .filter(function (t) { return t.getHandlerFunction() === 'preparerJournee'; })
    .forEach(function (t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('preparerJournee').timeBased().everyDays(1).atHour(0).nearMinute(30)
    .inTimezone(SpreadsheetApp.getActive().getSpreadsheetTimeZone()).create();
  props_().setProperty('preparationInstallee', 'v1');
}
/** Appelé à l'ouverture : installe la préparation de nuit si elle manque (une seule fois). */
function verifierPreparation_() {
  const props = props_();
  if (props.getProperty('preparationInstallee') === 'v1') return;
  try {
    if (!ScriptApp.getProjectTriggers().some(function (t) { return t.getHandlerFunction() === 'preparerJournee'; })) installerPreparation();
    else props.setProperty('preparationInstallee', 'v1');
  } catch (e) { journalErreur_('serveur', '', 'installerPreparation', e.message, ''); props.setProperty('preparationInstallee', 'v1'); }
}