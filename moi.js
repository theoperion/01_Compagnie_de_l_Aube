/* ============================================================
   MOI · module privé de Versus
   Lit TON fichier « Portefeuille & Épargne » (son API Apps Script), directement depuis cet appareil.
   Rien de ce module ne passe par le fichier Versus partagé : l'adresse et la clé restent
   dans le stockage local de l'appareil, les chiffres ne sont envoyés à personne.
   Chargé à la demande (premier passage sur l'onglet Moi).
   Dépend des fonctions communes de Versus : eur, pct, esc, sens, ok, tracer, boiteGraphe,
   teinte, couleur, toast, stock, ETAT, MOIS, F0, F1, NB, MOINS, nf, reduit.
   ============================================================ */
(function () {
"use strict";
const K = { api: "versus.moi.api", cle: "versus.moi.cle", cache: "versus.moi.cache", pref: "versus.moi.pref" };
const PREF = Object.assign({ onglet: "jour", patri: "net", million: "financier", tri: "env", mode: "valeur", per: "6m", serie: "ip", moisMode: "pct", rep: "classe", acc: {} },
  (() => { try { return JSON.parse(stock.get(K.pref) || "{}"); } catch (e) { return {}; } })());
function garderPref() { stock.set(K.pref, JSON.stringify(PREF)); }

let M = null;            // dernières données reçues de ton fichier
let RAW = null;          // profil simple : réponse brute de l'API (comptes, soldes, réglages)
let SRC = "";            // "api" | "cache"
let enCours = false, dernierAppel = 0, dernierFlap = "", erreur = "";

/* ---------- Format (complète ceux de Versus) ---------- */
const $m = s => document.querySelector("#v-moi " + s);
function cours(v) { return !ok(v) ? "—" : ETAT.discret === "oui" ? "•••" + NB + "€" : (v < 1 ? nf(4, 4) : nf(2, 2)).format(v) + NB + "€"; }
function qte(v) { return !ok(v) ? "—" : ETAT.discret === "oui" ? "•••" : nf(0, 6).format(v); }
function fleche(v) { const s = sens(v); return s === "up" ? "▲" : s === "down" ? "▼" : "■"; }
function dateNum(n) { const s = String(n); return new Date(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8)); }
function dateCourte(d) { return String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0"); }
function dateLongue(d) { return d.getDate() + " " + MOIS[d.getMonth()] + " " + d.getFullYear(); }
function frDate(iso) { return iso ? iso.slice(8, 10) + "/" + iso.slice(5, 7) + "/" + iso.slice(0, 4) : ""; }
function isoJour(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
function kEur(v) { return ETAT.discret === "oui" ? "•••" : (Math.abs(v) >= 1000 ? sgn(v) + F1.format(Math.abs(v) / 1000) + "k" : sgn(Math.round(v)) + F0.format(Math.abs(v))); }
function sgn(v) { return v > 0 ? "+" : v < 0 ? MOINS : ""; }
function maCouleur() { try { return D ? couleur(M && M.personne ? M.personne : ETAT.moi) : "var(--p0)"; } catch (e) { return "var(--p0)"; } }

/* ---------- Styles (injectés une fois, tous préfixés par .moi) ---------- */
function injecterStyle() {
  if (document.getElementById("style-moi")) return;
  const st = document.createElement("style"); st.id = "style-moi";
  st.textContent = `
.moi { --s1: var(--mc, var(--p0)); --s2: var(--gold); --s3: var(--accent);
  --e1: #E8B341; --e2: #34C3AE; --e3: #C084FC; --e4: #FF8A5B; --e5: #7DD3FC;
  --flap: #1C222B; --flap-2: #262E39; --flap-ink: #F2F4F7; --flap-line: #0B0E12; --flap-acc: #B8A9FF; }
.moi .m-onglets { position: sticky; top: calc(env(safe-area-inset-top, 0px) + 62px); z-index: 15; box-shadow: 0 6px 10px -6px var(--shade); }
.moi .m-hero { display: grid; gap: 10px; }
.moi .m-flaps { display: flex; flex-wrap: wrap; gap: 4px; }
.moi .m-flap { position: relative; width: clamp(26px, 8.4vw, 44px); height: clamp(40px, 12.6vw, 64px); display: grid; place-items: center; border-radius: 6px;
  background: linear-gradient(to bottom, var(--flap-2) 0 50%, var(--flap) 50% 100%); color: var(--flap-ink); font: 600 clamp(22px, 7.4vw, 40px)/1 var(--f-num);
  box-shadow: 0 1px 0 var(--flap-line), 0 4px 10px var(--shade); }
.moi .m-flap::after { content: ""; position: absolute; left: 0; right: 0; top: 50%; height: 2px; margin-top: -1px; background: var(--flap-line); }
.moi .m-flap.u, .moi .m-flap.s { color: var(--flap-acc); }
.moi .m-flap.sep { width: clamp(6px, 2vw, 10px); background: none; box-shadow: none; } .moi .m-flap.sep::after { display: none; }
.moi .m-flap.go { animation: mBascule .32s cubic-bezier(.3, .7, .3, 1) both; }
@keyframes mBascule { from { transform: rotateX(-88deg); } to { transform: rotateX(0); } }
.moi .m-flap.af-laiton { --flap: #3B2C12; --flap-2: #4B3A1A; --flap-ink: #F3DDA4; --flap-line: #1C1406; --flap-acc: #FFD27A; }
.moi .m-flap.af-ivoire { --flap: #E6DDC6; --flap-2: #F1EAD6; --flap-ink: #1B1F1C; --flap-line: #B3A88C; --flap-acc: #A35E0B; }
.moi .m-flap.af-nuit { --flap: #0E1C33; --flap-2: #172B4D; --flap-ink: #DCE7FF; --flap-line: #060D1A; --flap-acc: #7FB2FF; }
.moi .m-flap.af-gare { --flap: #5B1611; --flap-2: #701F17; --flap-ink: #F7E8CF; --flap-line: #2A0806; --flap-acc: #FFC15E; }
.moi .m-flap.af-terminal { overflow: hidden; border-radius: 3px; background: #021208; color: #39FF7A; font-weight: 500; text-shadow: 0 0 4px rgba(57,255,122,.9), 0 0 12px rgba(57,255,122,.45); box-shadow: inset 0 0 14px rgba(57,255,122,.14), 0 0 0 1px rgba(57,255,122,.22), 0 4px 10px var(--shade); }
.moi .m-flap.af-terminal::after { top: 0; bottom: 0; height: auto; margin: 0; background: repeating-linear-gradient(to bottom, transparent 0 2px, rgba(0,0,0,.38) 2px 3px); }
.moi .m-flap.af-terminal.u, .moi .m-flap.af-terminal.s { color: #C8FFD8; }
.moi .m-flap.af-terminal.go { animation: mTerm .5s steps(4) both; }
@keyframes mTerm { 0% { opacity: 0; } 50% { opacity: .6; } 75% { opacity: .2; } 100% { opacity: 1; } }
.moi .m-flap.af-led { overflow: hidden; border-radius: 4px; background: #0a0705; color: #FFB21E; font-weight: 800; text-shadow: 0 0 6px rgba(255,170,30,.9); box-shadow: inset 0 0 0 1px #2a1d0e, 0 4px 10px var(--shade); }
.moi .m-flap.af-led::after { top: 0; bottom: 0; height: auto; margin: 0; background: radial-gradient(circle at center, transparent 0 1.15px, #0a0705 1.6px) 0 0 / 4px 4px; }
.moi .m-flap.af-led.u, .moi .m-flap.af-led.s { color: #FF5A3C; text-shadow: 0 0 6px rgba(255,90,60,.9); }
.moi .m-flap.af-compteur { overflow: hidden; border-radius: 2px; background: linear-gradient(to bottom, #050505 0%, #2d2d2d 18%, #161616 50%, #2d2d2d 82%, #050505 100%); color: #F4F1EA; box-shadow: inset 0 0 0 1px #000, 0 0 0 2px #3a3a3a, 0 4px 10px var(--shade); }
.moi .m-flap.af-compteur::after { display: none; }
.moi .m-flap.af-compteur.u, .moi .m-flap.af-compteur.s { background: linear-gradient(to bottom, #2a0000, #9a0c0c 20%, #5a0606 50%, #9a0c0c 80%, #2a0000); color: #fff; }
.moi .m-flap.af-compteur.go { animation: mRoule .7s cubic-bezier(.2, .8, .3, 1) both; }
@keyframes mRoule { from { color: transparent; text-shadow: 0 -1.1em 0 #F4F1EA, 0 -2.2em 0 #F4F1EA, 0 -3.3em 0 #F4F1EA; } to { color: #F4F1EA; text-shadow: 0 0 0 transparent; } }
.moi .m-flap.af-neon { border-radius: 8px; background: #0b0614; color: #fff; font-weight: 400; text-shadow: 0 0 2px #fff, 0 0 6px #FF4FD8, 0 0 14px #FF4FD8, 0 0 28px #C026D3; box-shadow: inset 0 0 0 1px rgba(255,79,216,.35), 0 0 16px rgba(255,79,216,.22); }
.moi .m-flap.af-neon::after { display: none; }
.moi .m-flap.af-neon.u, .moi .m-flap.af-neon.s { text-shadow: 0 0 2px #fff, 0 0 6px #22D3EE, 0 0 14px #22D3EE, 0 0 28px #0891B2; box-shadow: inset 0 0 0 1px rgba(34,211,238,.35), 0 0 16px rgba(34,211,238,.22); }
.moi .m-flap.af-neon.go { animation: mNeon 1.1s linear both; }
@keyframes mNeon { 0% { opacity: 0; } 10% { opacity: .9; } 14% { opacity: .1; } 22% { opacity: 1; } 30% { opacity: .3; } 38%, 100% { opacity: 1; } }
.moi .m-flap.af-nixie { overflow: hidden; border-radius: 45% 45% 10px 10px / 22% 22% 10px 10px; background: radial-gradient(ellipse at 50% 35%, #2c1b12 0%, #120a06 60%, #050302 100%); color: #FFA05A; font-weight: 300;
  text-shadow: 0 0 4px #FF7A1A, 0 0 10px #FF5A00, 0 0 22px rgba(255,80,0,.6); box-shadow: inset 0 0 0 1px rgba(255,200,160,.18), inset 0 8px 12px rgba(255,255,255,.06), 0 4px 12px var(--shade); }
.moi .m-flap.af-nixie::after { top: 6%; bottom: 6%; left: 8%; right: 8%; height: auto; margin: 0; border-radius: inherit; background: repeating-linear-gradient(60deg, rgba(255,170,100,.09) 0 1px, transparent 1px 4px), repeating-linear-gradient(-60deg, rgba(255,170,100,.09) 0 1px, transparent 1px 4px); }
.moi .m-flap.af-nixie.go { animation: mNixie .9s ease-out both; }
@keyframes mNixie { from { color: #3a1d0a; text-shadow: none; } to { color: #FFA05A; } }
.moi .m-flap.af-lingot { overflow: hidden; border-radius: 0; clip-path: polygon(10% 0, 90% 0, 100% 100%, 0 100%); box-shadow: none; color: #5B3A0A; font-weight: 800;
  background: linear-gradient(160deg, #FFF3C4 0%, #F2C94C 25%, #B7832F 55%, #F7D774 75%, #9A6A1E 100%); text-shadow: 0 1px 0 rgba(255,255,255,.6), 0 -1px 0 rgba(0,0,0,.25); }
.moi .m-flap.af-lingot::after { top: 0; bottom: 0; height: auto; margin: 0; left: -60%; right: auto; width: 45%; background: linear-gradient(100deg, transparent, rgba(255,255,255,.75), transparent); animation: mLingot 3.6s ease-in-out infinite; }
@keyframes mLingot { 0% { left: -60%; } 55%, 100% { left: 130%; } }
.moi .m-flap.af-lingot.u, .moi .m-flap.af-lingot.s { color: #3B2405; }
.moi .m-flap.af-prisme { border-radius: 8px; color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,.5); box-shadow: 0 4px 14px rgba(185,140,255,.35);
  background: linear-gradient(120deg, #FF6B9A, #FFC15E, #E9F27A, #5CF0B5, #5AB8FF, #B98CFF, #FF6B9A); background-size: 300% 300%; animation: mPrisme 6s linear infinite; }
.moi .m-flap.af-prisme::after { background: rgba(255,255,255,.45); }
.moi .m-flap.af-prisme.go { animation: mBascule .32s cubic-bezier(.3, .7, .3, 1) both, mPrisme 6s linear infinite; }
@keyframes mPrisme { from { background-position: 0% 50%; } to { background-position: 300% 50%; } }
.moi .aff-g { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.moi .aff-c { position: relative; display: grid; gap: 3px; justify-items: center; align-content: start; text-align: center; padding: 10px 4px 8px; border-radius: 12px; border: 1px solid var(--rule); background: var(--panel); color: var(--ink); cursor: pointer; }
.moi .aff-c.on { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent); }
.moi .aff-c .aff-v { position: relative; display: grid; place-items: center; height: 34px; }
.moi .aff-c .m-flaps { gap: 2px; flex-wrap: nowrap; }
.moi .aff-c .m-flap { width: 17px; height: 26px; font-size: 16px; border-radius: 3px; }
.moi .aff-c .m-flap.af-nixie { border-radius: 45% 45% 4px 4px / 22% 22% 4px 4px; }
.moi .aff-c.verrou .m-flaps { filter: saturate(.4) brightness(.55); }
.moi .aff-c .aff-l { position: absolute; font-style: normal; font-size: 15px; text-shadow: 0 1px 4px rgba(0,0,0,.6); }
.moi .aff-c b { font: italic 800 12.5px/1.1 var(--f-display); letter-spacing: .06em; text-transform: uppercase; }
.moi .aff-c small { font-size: 10.5px; line-height: 1.25; color: var(--ink-3); }
.moi .aff-c.on small { color: var(--accent-ink); font-weight: 600; }
.moi .aff-c .jauge { display: block; width: 80%; height: 3px; border-radius: 2px; background: var(--rule-2); overflow: hidden; }
.moi .aff-c .jauge i { display: block; height: 100%; background: var(--gold); }
.m-fete .mf-af { color: #F5C542; font-weight: 600; } .m-fete .wr-btn { justify-self: center; }
/* Thème de Moi : la carte du haut prend le fond du thème, l'onglet actif sa couleur */
#v-moi.th .m-hero { position: relative; padding: 14px 14px 16px; border-radius: 16px; background: var(--th-fond); color: #F4F5F8; box-shadow: inset 0 0 0 1px rgba(255,255,255,.08), 0 8px 20px var(--shade);
  --ink: #F4F5F8; --ink-2: rgba(244,245,248,.8); --ink-3: rgba(244,245,248,.58); --rule: rgba(255,255,255,.14); --rule-2: rgba(255,255,255,.1); --panel: rgba(255,255,255,.06); --panel-2: rgba(255,255,255,.08); --up: #4ADE80; --down: #FF6B6B; --up-bg: rgba(74,222,128,.14); --down-bg: rgba(255,107,107,.14); }
#v-moi.th .m-onglets button[aria-pressed="true"] { background: var(--mc); color: #0B0D12; }
.moi .m-hero { position: relative; }
.moi .m-emb { font-style: normal; font-size: 15px; line-height: 1; margin-right: 6px; letter-spacing: 0; vertical-align: -1px; }
/* Profil */
.moi .vs-prof { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 12px; align-items: center; padding: 12px 14px; border-radius: 16px; border: 1px solid var(--rule); background: var(--panel); }
.moi .vs-prof.th { color: #F4F5F8; border-color: transparent; box-shadow: inset 0 0 0 1px rgba(255,255,255,.08); }
.moi .vs-av { width: 48px; height: 48px; display: grid; place-items: center; border-radius: 50%; font-size: 27px; line-height: 1; background: var(--panel-2); box-shadow: inset 0 0 0 2px var(--mc); }
.moi .vs-prof.th .vs-av { background: rgba(255,255,255,.08); }
.moi .vs-prof b { display: block; font: italic 800 19px/1.1 var(--f-display); letter-spacing: .05em; text-transform: uppercase; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.moi .vs-prof small { display: block; margin-top: 3px; font-size: 13px; color: var(--ink-2); }
.moi .vs-prof.th small { color: rgba(244,245,248,.75); }
.moi .vs-n { text-align: right; font: 600 13px/1.1 var(--f-num); color: var(--ink-3); }
.moi .vs-n b { display: inline; font: 700 18px/1 var(--f-num); color: var(--ink); letter-spacing: 0; text-transform: none; font-style: normal; }
.moi .vs-prof.th .vs-n, .moi .vs-prof.th .vs-n b { color: #F4F5F8; }
.moi .vs-n small { display: block; font: 500 11px/1.2 var(--f-text); margin: 2px 0 0; }
/* Vestiaire */
.moi .vs-o { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 5px; }
.moi .vs-o .chip { display: grid; justify-items: center; gap: 3px; padding: 7px 3px 6px; border-radius: 10px; min-width: 0; }
.moi .vs-o .chip b { font-size: 12px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
.moi .vs-o .chip small { font: 500 10.5px/1 var(--f-num); color: var(--ink-3); }
.moi .vs-o .chip[aria-pressed="true"] small { color: inherit; opacity: .75; }
.moi .vs-g { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; }
.moi .vs-t { position: relative; min-width: 0; }
.moi .vs-b { all: unset; box-sizing: border-box; width: 100%; display: grid; justify-items: center; gap: 4px; padding: 8px 2px 7px; border-radius: 10px; border: 1px solid var(--rule); background: var(--panel); cursor: pointer; text-align: center; }
.moi .vs-b:focus-visible { outline: 2px solid var(--accent); }
.moi .vs-t.on .vs-b { border-color: var(--mc); box-shadow: 0 0 0 1.5px var(--mc); }
.moi .vs-t.vs-sel:not(.on) .vs-b { border-color: var(--ink-3); }
.moi .vs-p { position: relative; height: 30px; width: 100%; display: grid; place-items: center; overflow: hidden; }
.moi .vs-t.verrou .vs-p > :not(.vs-l) { filter: saturate(.35) brightness(.6); opacity: .8; }
.moi .vs-t.secret .vs-p > .vs-em { filter: none; opacity: 1; color: var(--ink-3); font: 800 20px/1 var(--f-display); }
.moi .vs-l { position: absolute; font-style: normal; font-size: 12px; right: 6px; bottom: 0; text-shadow: 0 1px 3px rgba(0,0,0,.5); }
.moi .vs-nm { max-width: 100%; padding: 0 3px; font-size: 10.5px; font-weight: 600; line-height: 1.15; color: var(--ink-2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.moi .vs-t.verrou .vs-nm { color: var(--ink-3); }
.moi .vs-ok { position: absolute; top: 4px; left: 6px; font-size: 10px; font-weight: 800; color: var(--mc); }
.moi .vs-q { position: absolute; top: 3px; right: 3px; width: 18px; height: 18px; padding: 0; display: grid; place-items: center; border-radius: 50%; border: 1px solid var(--rule); background: var(--panel-2); color: var(--ink-3); font: 700 10.5px/1 var(--f-text); cursor: pointer; }
.moi .vs-q:focus-visible { outline: 2px solid var(--accent); }
.moi .vs-t.vs-sel .vs-q { background: var(--ink); color: var(--bg); border-color: var(--ink); }
/* aperçus */
.moi .vs-p .m-flaps { --fh: 17px; gap: 1px; flex-wrap: nowrap; }
.moi .vs-p .m-flap { width: 12px; height: 19px; font-size: 12px; border-radius: 2px; box-shadow: none; }
.moi .vs-p .m-flap::after { height: 1px; }
.moi .vs-p .m-af { max-width: none; } .moi .vs-p .t-ticket .tk-h, .moi .vs-p .t-billet .bl-c, .moi .vs-p .t-billet::after { display: none; }
.moi .vs-p .t-ticket { margin-bottom: 3px; padding: 2px 5px 3px; } .moi .vs-p .t-ticket::after { height: 3px; bottom: -3px; background-size: 5px 5px; }
.moi .vs-p .t-billet { padding: 2px 6px; } .moi .vs-p .t-carte { padding: 3px 6px; gap: 3px; }
.moi .vs-sw { position: relative; width: 44px; height: 26px; border-radius: 7px; box-shadow: inset 0 0 0 1px rgba(255,255,255,.12); overflow: hidden; }
.moi .vs-sw.base { background: var(--panel-2); box-shadow: inset 0 0 0 1px var(--rule); }
.moi .vs-sw i { position: absolute; left: 6px; right: 14px; height: 3px; border-radius: 2px; background: rgba(255,255,255,.55); top: 8px; }
.moi .vs-sw.base i { background: var(--ink-3); }
.moi .vs-sw i + i { top: 15px; right: 22px; background: var(--sw); }
.moi .vs-cb { width: 52px; height: 24px; overflow: visible; }
.moi .vs-cb path { fill: none; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
.moi .vs-cb path.x { display: none; }
.moi .vs-cb.fx-halo path.x { display: block; stroke-width: 6; opacity: .3; }
.moi .vs-cb.fx-comete path.x { display: block; stroke-width: 6; opacity: .45; filter: blur(1.5px); }
.moi .vs-cb.fx-etincelles path.x { display: block; stroke: var(--gold) !important; stroke-width: 3; stroke-dasharray: .1 5; animation: fxDefile 1.4s linear infinite; }
.moi .vs-cb.fx-flammes path.x { display: block; stroke-width: 4.5; opacity: .6; stroke-dasharray: 2 4; animation: fxDefile .9s linear infinite; }
.moi .vs-em { font-size: 22px; line-height: 1; }
.moi .vs-g2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.moi .vs-g2 .vs-b { min-height: 44px; align-content: center; padding: 9px 24px 9px 26px; }
.moi .vs-ti { max-width: 100%; font: italic 700 13px/1.15 var(--f-display); letter-spacing: .04em; color: var(--ink); text-wrap: balance; }
.moi .vs-t.verrou .vs-ti { color: var(--ink-3); }
.moi .vs-g2 .vs-l { left: 8px; right: auto; bottom: auto; top: 50%; transform: translateY(-50%); }
.moi .vs-g2 .vs-ok { top: 50%; left: 8px; transform: translateY(-50%); }
/* détail (le « ? ») */
.moi .vs-d { display: grid; gap: 10px; padding: 12px; border-radius: 12px; background: var(--panel-2); border: 1px solid var(--rule-2); }
.moi .vs-aide { margin: 0; font-size: 12.5px; color: var(--ink-3); }
.moi .vs-dl { display: grid; grid-template-columns: 34px minmax(0, 1fr); gap: 10px; align-items: start; }
.moi .vs-di { width: 34px; height: 34px; display: grid; place-items: center; border-radius: 10px; background: var(--panel); font: 800 17px/1 var(--f-display); color: var(--ink-3); }
.moi .vs-dl b { font: italic 800 15px/1.15 var(--f-display); letter-spacing: .05em; text-transform: uppercase; }
.moi .vs-dl small { font-size: 11.5px; color: var(--ink-3); }
.moi .vs-dl p { margin: 4px 0 0; font-size: 13px; line-height: 1.4; color: var(--ink-2); }
.moi .vs-dl .jauge { display: block; height: 5px; margin-top: 6px; } .moi .vs-dl .jauge i { background: var(--gold); }
.moi .vs-da { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; } .moi .vs-da:empty { display: none; }
.moi .vs-da .btn { padding: 9px 14px; font-size: 13px; }
.moi .vs-eq { font-size: 13px; font-weight: 600; color: var(--up); }
/* paliers : récompenses */
.moi .pl-r .pl-rec { display: flex; flex-wrap: wrap; gap: 4px 8px; }
.moi .pl-r .pl-rec span { white-space: nowrap; }
.moi .pl-r .pl-rec span.cache { color: var(--ink-3); }
/* fête : récompenses débloquées */
.m-fete .mf-recs { display: grid; gap: 8px; width: min(320px, 86vw); }
.m-fete .mf-rec { display: grid; grid-template-columns: 34px minmax(0, 1fr); grid-template-rows: auto auto; column-gap: 10px; align-items: center; text-align: left; padding: 10px 12px; border-radius: 12px; border: 1px solid rgba(245,197,66,.45); background: rgba(255,255,255,.06); color: #F4F5F8; cursor: pointer; }
.m-fete .mf-rec span { grid-row: span 2; font-size: 24px; line-height: 1; text-align: center; }
.m-fete .mf-rec b { font: italic 800 15px/1.15 var(--f-display); letter-spacing: .05em; text-transform: uppercase; }
.m-fete .mf-rec small { font-size: 12px; opacity: .7; }
.m-fete .mf-rec.fait { border-color: #3DDC97; } .m-fete .mf-rec.fait small { color: #3DDC97; opacity: 1; }
@media (max-width: 360px) { .moi .vs-g { gap: 5px; } .moi .vs-nm { font-size: 10px; } }
.moi .m-flaps { --fh: clamp(40px, 12.6vw, 64px); }
.m-million .mm-flaps { --fh: clamp(32px, 10vw, 48px); }
.moi .aff-c .m-flaps { --fh: 24px; }
.moi .m-af { position: relative; display: inline-flex; flex-wrap: wrap; align-items: center; max-width: 100%; }
/* Tambours (compteur à rouleaux) */
.moi .t-tambour { gap: 2px; padding: calc(var(--fh) * .07); border-radius: calc(var(--fh) * .1); background: linear-gradient(#4a4a4a, #141414); box-shadow: inset 0 0 0 1px #000, 0 0 0 2px #8a8a8a, 0 0 0 3px #2a2a2a, 0 4px 12px var(--shade); }
.moi .od { position: relative; width: calc(var(--fh) * .6); height: var(--fh); overflow: hidden; border-radius: 2px; background: #0d0d0d; color: #F4F1EA; font: 600 calc(var(--fh) * .6)/var(--fh) var(--f-num); text-align: center; }
.moi .od b { display: block; height: var(--fh); font-weight: 600; }
.moi .od-r { display: block; transform: translateY(calc(var(--d) * var(--fh) * -1)); }
.moi .od-r.go { animation: mOd 1.3s cubic-bezier(.2, .75, .25, 1) both; }
@keyframes mOd { from { transform: translateY(0); } }
.moi .od::after { content: ""; position: absolute; inset: 0; pointer-events: none; background: linear-gradient(to bottom, rgba(0,0,0,.8), rgba(0,0,0,0) 32%, rgba(255,255,255,.07) 50%, rgba(0,0,0,0) 68%, rgba(0,0,0,.8)); }
.moi .od.u { background: #8a0d0d; }
.moi .od-sep { width: calc(var(--fh) * .14); }
/* Sept segments */
.moi .t-seg { gap: calc(var(--fh) * .06); padding: calc(var(--fh) * .12) calc(var(--fh) * .16); border-radius: calc(var(--fh) * .1); }
.moi .t-seg svg { height: calc(var(--fh) * .82); width: calc(var(--fh) * .82 * 44 / 70); overflow: visible; }
.moi .t-seg .sg-x { font: 600 calc(var(--fh) * .58)/1 var(--f-num); min-width: calc(var(--fh) * .3); text-align: center; }
.moi .t-seg .sg-sep { width: calc(var(--fh) * .12); }
.moi .t-seg.calc { background: linear-gradient(170deg, #b4c29d, #95a57e); box-shadow: inset 0 2px 7px rgba(0,0,0,.4), 0 0 0 3px #44474b, 0 0 0 5px #1f2022, 0 4px 12px var(--shade); }
.moi .t-seg.calc rect { fill: rgba(28,40,24,.09); } .moi .t-seg.calc rect.l { fill: #1c2818; } .moi .t-seg.calc .sg-x { color: #1c2818; }
.moi .t-seg.reveil { background: #0c0303; box-shadow: inset 0 0 0 1px #2a0b08, 0 0 0 3px #1b1b1b, 0 4px 12px var(--shade); }
.moi .t-seg.reveil rect { fill: rgba(255,58,40,.08); } .moi .t-seg.reveil rect.l { fill: #ff3a28; }
.moi .t-seg.reveil svg { filter: drop-shadow(0 0 3px rgba(255,58,40,.75)); } .moi .t-seg.reveil .sg-x { color: #ff3a28; text-shadow: 0 0 6px rgba(255,58,40,.8); }
.moi .t-seg.go svg, .moi .t-seg.go .sg-x { animation: mSeg .6s steps(1) both; }
@keyframes mSeg { 0% { opacity: 0; } 30% { opacity: 1; } 45% { opacity: .15; } 60%, 100% { opacity: 1; } }
/* Matrice de points */
.moi .t-mat { gap: calc(var(--fh) * .1); padding: calc(var(--fh) * .14) calc(var(--fh) * .18); border-radius: calc(var(--fh) * .08); background: #0b0705; box-shadow: inset 0 0 0 1px #2a1d0e, 0 0 0 2px #151515, 0 4px 12px var(--shade); }
.moi .t-mat svg { height: calc(var(--fh) * .78); width: calc(var(--fh) * .78 * 5 / 7); filter: drop-shadow(0 0 2px rgba(255,170,30,.7)); }
.moi .t-mat circle { fill: #170f05; } .moi .t-mat circle.l { fill: #FFB21E; }
.moi .t-mat .mt-sep { width: calc(var(--fh) * .1); }
.moi .t-mat.go svg { animation: mMat .5s steps(3) both; }
@keyframes mMat { from { opacity: 0; } to { opacity: 1; } }
/* Ticket de caisse */
.moi .t-ticket { flex-direction: column; align-items: stretch; flex-wrap: nowrap; margin-bottom: 7px; padding: calc(var(--fh) * .16) calc(var(--fh) * .32) calc(var(--fh) * .22); background: #FBF8F1; color: #1d1d1b; transform: rotate(-1.2deg); box-shadow: 0 6px 12px var(--shade); }
.moi .t-ticket::after { content: ""; position: absolute; left: 0; right: 0; bottom: -6px; height: 6px; background: linear-gradient(135deg, #FBF8F1 33%, transparent 33%) 0 0 / 8px 8px repeat-x, linear-gradient(225deg, #FBF8F1 33%, transparent 33%) 0 0 / 8px 8px repeat-x; }
.moi .t-ticket .tk-h { display: flex; justify-content: space-between; gap: 12px; padding-bottom: 3px; margin-bottom: 4px; border-bottom: 1px dashed #8a877f; font: 700 calc(var(--fh) * .2)/1.2 "Courier New", ui-monospace, monospace; letter-spacing: .18em; color: #55534d; }
.moi .t-ticket .tk-v { font: 700 calc(var(--fh) * .66)/1.05 "Courier New", ui-monospace, monospace; letter-spacing: -.02em; white-space: nowrap; }
.moi .t-ticket .tk-v i { font-style: normal; } .moi .t-ticket .tk-v i.tk-s { display: inline-block; width: .3em; }
.moi .t-ticket.go .tk-v i { animation: mTk .01s steps(1) both; }
@keyframes mTk { from { visibility: hidden; } }
/* Billet de banque */
.moi .t-billet { flex-direction: column; align-items: flex-start; flex-wrap: nowrap; overflow: hidden; padding: calc(var(--fh) * .14) calc(var(--fh) * .9) calc(var(--fh) * .14) calc(var(--fh) * .26); border-radius: 4px; color: #23473a;
  background: radial-gradient(circle at calc(100% - var(--fh) * .45) 50%, rgba(35,71,58,.18) 0 calc(var(--fh) * .3), transparent calc(var(--fh) * .31)),
    repeating-radial-gradient(circle at 0 120%, transparent 0 3px, rgba(35,71,58,.12) 3px 4px), repeating-radial-gradient(circle at 100% -20%, transparent 0 3px, rgba(120,80,40,.1) 3px 4px),
    linear-gradient(120deg, #ECE6CC, #D8DFC4 45%, #EADBBD);
  box-shadow: inset 0 0 0 3px #ECE6CC, inset 0 0 0 4px #23473a, inset 0 0 0 6px #ECE6CC, inset 0 0 0 7px rgba(35,71,58,.5), 0 4px 12px var(--shade); }
.moi .t-billet::after { content: "€"; position: absolute; right: calc(var(--fh) * .3); top: 50%; transform: translateY(-50%); font: 700 calc(var(--fh) * .32)/1 Georgia, "Times New Roman", serif; color: rgba(35,71,58,.55); }
.moi .t-billet .bl-c { font: 700 calc(var(--fh) * .15)/1.2 Georgia, "Times New Roman", serif; letter-spacing: .32em; color: rgba(35,71,58,.75); }
.moi .t-billet .bl-v { font: 700 calc(var(--fh) * .66)/1.05 Georgia, "Times New Roman", serif; letter-spacing: .01em; white-space: nowrap; text-shadow: 0 1px 0 rgba(255,255,255,.7), 0 -1px 0 rgba(0,0,0,.12); }
.moi .t-billet.go .bl-v { animation: mEncre 1s ease-out both; }
@keyframes mEncre { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
/* Carte black */
.moi .t-carte { gap: calc(var(--fh) * .22); flex-wrap: nowrap; overflow: hidden; padding: calc(var(--fh) * .2) calc(var(--fh) * .32); border-radius: calc(var(--fh) * .16);
  background: repeating-linear-gradient(115deg, rgba(255,255,255,.025) 0 2px, transparent 2px 5px), linear-gradient(135deg, #2b2b2e, #0d0d0f 55%, #222226); box-shadow: inset 0 0 0 1px rgba(255,255,255,.12), 0 6px 14px var(--shade); }
.moi .t-carte .ca-puce { flex: none; width: calc(var(--fh) * .48); height: calc(var(--fh) * .36); border-radius: calc(var(--fh) * .06);
  background: linear-gradient(90deg, transparent 32%, rgba(0,0,0,.28) 32% 36%, transparent 36% 64%, rgba(0,0,0,.28) 64% 68%, transparent 68%), linear-gradient(transparent 46%, rgba(0,0,0,.28) 46% 54%, transparent 54%), linear-gradient(135deg, #f3dc95, #b9913f 55%, #e8cd7d); }
.moi .t-carte .ca-v { font: 600 calc(var(--fh) * .56)/1 var(--f-num); letter-spacing: .06em; white-space: nowrap; color: #d9d9de;
  background: linear-gradient(180deg, #ffffff, #b9bac2 55%, #8d8e96); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(1px 1px 0 rgba(0,0,0,.9)) drop-shadow(-1px -1px 0 rgba(255,255,255,.18)); }
.moi .t-carte::after { content: ""; position: absolute; top: 0; bottom: 0; left: -60%; width: 40%; background: linear-gradient(100deg, transparent, rgba(255,255,255,.14), transparent); animation: mLingot 5s ease-in-out infinite; }
/* Cartes de choix */
.moi .aff-c .t-ticket .tk-h, .moi .aff-c .t-billet .bl-c { display: none; }
.moi .aff-c .t-ticket { margin-bottom: 4px; }
.moi .aff-c .t-ticket::after { height: 4px; bottom: -4px; background-size: 6px 6px; }
.moi .aff-c .m-af { max-width: none; }
.moi .aff-c .aff-v { height: 40px; }
.moi .aff-c i.aff-t { font-style: normal; font-size: 9.5px; letter-spacing: .1em; text-transform: uppercase; color: var(--ink-3); }
@media (prefers-reduced-motion: reduce) { .moi .od-r.go, .moi .t-seg.go svg, .moi .t-seg.go .sg-x, .moi .t-mat.go svg, .moi .t-ticket.go .tk-v i, .moi .t-billet.go .bl-v, .moi .t-carte::after { animation: none; } }
/* Paliers en blocs dépliables */
.moi .pl-blocs { display: grid; gap: 8px; }
.moi details.pl-bloc { border: 1px solid var(--rule); border-radius: 12px; background: var(--panel); }
.moi details.pl-bloc > summary { list-style: none; cursor: pointer; display: grid; grid-template-columns: minmax(0, 1fr) auto 14px; gap: 5px 10px; align-items: center; padding: 11px 12px; }
.moi details.pl-bloc > summary::-webkit-details-marker { display: none; }
.moi details.pl-bloc > summary::after { content: ""; grid-column: 3; grid-row: 1; width: 8px; height: 8px; border-right: 2px solid var(--ink-3); border-bottom: 2px solid var(--ink-3); transform: rotate(45deg) translate(-2px, -2px); transition: transform .2s; }
.moi details.pl-bloc[open] > summary::after { transform: rotate(225deg) translate(-2px, -2px); }
.moi details.pl-bloc > summary:focus-visible { outline: 2px solid var(--accent); border-radius: 12px; }
.moi .pl-bloc .pb-t { font: italic 800 14.5px/1.15 var(--f-display); letter-spacing: .06em; text-transform: uppercase; }
.moi .pl-bloc .pb-n { font: 600 12.5px/1 var(--f-num); color: var(--ink-2); }
.moi .pl-bloc.complet .pb-n { color: var(--up); }
.moi .pl-bloc .jauge { grid-column: 1 / -1; height: 4px; }
.moi .pl-bloc .jauge i { background: var(--gold); }
.moi .pl-bloc .pb-s { grid-column: 1 / -1; font-size: 12px; line-height: 1.35; color: var(--ink-3); }
.moi .pl-bloc .pb-s b { color: var(--ink-2); font-weight: 600; }
.moi .pl-bloc .pb-r { color: var(--gold); font-weight: 600; white-space: nowrap; }
.moi .pl-bloc > .pl-liste { padding: 0 12px 6px; border-top: 1px solid var(--rule-2); }
.moi .pl-bloc > .pl-liste .pl-r:last-child { border-bottom: 0; }
.moi .pl-r .pl-rec { font-style: normal; font-size: 11.5px; font-weight: 600; color: var(--gold); }
.moi .m-jour { display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px 12px; font-size: 13px; color: var(--ink-2); }
.moi .m-status { display: flex; flex-wrap: wrap; gap: 4px 14px; font-size: 12px; color: var(--ink-3); }
.moi .m-status i { font-style: normal; display: inline-flex; align-items: center; gap: 6px; }
.moi .m-status i::before { content: ""; width: 7px; height: 7px; border-radius: 50%; background: var(--ink-3); }
.moi .m-status i.on::before { background: var(--up); box-shadow: 0 0 0 3px var(--up-bg); }
.moi .tuiles > .m-def-t { cursor: pointer; }
.moi .tuiles .lab .qm { display: inline-grid; place-items: center; width: 14px; height: 14px; margin-left: 4px; border-radius: 50%; border: 1px solid var(--rule); font: 700 9px/1 var(--f-num); font-style: normal; color: var(--ink-3); vertical-align: 1px; }
.moi .tuiles .m-def { display: none; font-size: 12px; line-height: 1.4; color: var(--ink-2); padding-top: 4px; }
.moi .tuiles .ouvert .m-def { display: block; }
.moi .m-notes { display: grid; gap: 6px; }
.moi .m-note { display: flex; gap: 10px; align-items: flex-start; font-size: 13px; color: var(--ink-2); padding: 9px 12px; border-radius: 10px; background: var(--panel); border: 1px solid var(--rule); }
.moi .m-note .ic { flex: none; width: 18px; height: 18px; border-radius: 50%; display: grid; place-items: center; font: 700 11px/1 var(--f-num); }
.moi .m-note.ok .ic { background: var(--up-bg); color: var(--up); }
.moi .m-note.warn { border-color: var(--down); color: var(--ink); } .moi .m-note.warn .ic { background: var(--down-bg); color: var(--down); }
.moi .m-note.rappel .ic { background: color-mix(in srgb, var(--gold) 18%, transparent); color: var(--gold); }
.moi .badge.big-b { font-size: 15px; padding: 5px 11px; }
.moi .badge.warn { background: color-mix(in srgb, #F0A030 20%, transparent); color: #C77A10; }
.moi .ms-r { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 3px 10px; align-items: baseline; padding: 10px 2px; border-bottom: 1px solid var(--rule-2); }
.moi .ms-r:last-child { border-bottom: 0; }
.moi .ms-r b { font: italic 700 16px/1.1 var(--f-display); letter-spacing: .04em; text-transform: uppercase; }
.moi .ms-r .v { font: 700 16px/1.1 var(--f-num); text-align: right; }
.moi .ms-r small { font-size: 11.5px; color: var(--ink-3); }
.moi .ms-r .s { text-align: right; font-family: var(--f-num); }
.moi .ms-r .s i { font-style: normal; }
.moi .ms-r .s .badge { font-size: 11px; }
.moi .ms-liste { display: grid; gap: 8px; }
.moi .ms-l { display: grid; grid-template-columns: minmax(0, 1fr) 118px; gap: 4px 10px; align-items: center; padding: 10px 12px; border-radius: 12px; background: var(--panel); border: 1px solid var(--rule); }
.moi .ms-n b { display: block; font: italic 700 15px/1.15 var(--f-display); letter-spacing: .04em; text-transform: uppercase; }
.moi .ms-n small { display: block; font-size: 11.5px; color: var(--ink-3); }
.moi .ms-l input[type="text"] { font: 600 16px/1.2 var(--f-num); padding: 10px; border-radius: 10px; border: 1px solid var(--rule); background: var(--bg); color: var(--ink); width: 100%; min-width: 0; text-align: right; }
.moi .ms-int { grid-column: 2; justify-self: end; display: flex; gap: 5px; align-items: center; font-size: 11.5px; color: var(--ink-3); }
.moi .ms-int input { accent-color: var(--accent); margin: 0; }
.moi .rang2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.moi .m-carte { display: flex; flex-wrap: wrap; gap: 3px; }
.moi .m-tuile { all: unset; box-sizing: border-box; cursor: pointer; flex: 1 1 64px; min-width: 64px; min-height: 54px; padding: 7px 8px; border-radius: 8px; background: var(--panel); border: 1px solid var(--rule); display: grid; align-content: space-between; gap: 2px; }
.moi .m-tuile:focus-visible { outline: 2px solid var(--accent); }
.moi .m-tuile b { font: 700 13px/1.1 var(--f-num); letter-spacing: .02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.moi .m-tuile span { font: 600 12px/1.1 var(--f-num); font-variant-numeric: tabular-nums; white-space: nowrap; }
.moi .m-tri { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 8px 10px; border-bottom: 1px solid var(--rule); padding-bottom: 8px; }
.moi .m-tri .m-coche { padding-bottom: 0; }
@media (max-width: 400px) { .moi .m-tri .sel { width: 100% !important; order: 3; } }
.moi .m-tri h2.sec { border: 0; padding: 0; white-space: nowrap; }
.moi .m-tri .sel { min-width: 0; width: min(190px, 44%); }
.moi .m-env { display: grid; }
.moi .m-env.total .m-env-h { border-bottom: 0; border-top: 2px solid var(--ink); margin-top: 6px; }
.moi .m-env-h .pv { font: 500 12px/1.1 var(--f-num); font-variant-numeric: tabular-nums; }
.moi .m-coche { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: var(--ink-2); cursor: pointer; margin-left: auto; padding-bottom: 8px; white-space: nowrap; }
.moi .m-coche input { width: 18px; height: 18px; accent-color: var(--accent); margin: 0; }
.moi .m-debut-w { display: grid; gap: 6px; }
.moi .m-debut { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1px; background: var(--rule); border: 1px solid var(--rule); border-radius: 12px; overflow: hidden; }
.moi .m-debut button { all: unset; box-sizing: border-box; cursor: pointer; background: var(--panel); padding: 8px 8px 7px; display: grid; gap: 2px; min-width: 0; }
.moi .m-debut button[aria-pressed="true"] { background: var(--panel-2); box-shadow: inset 0 -2px 0 var(--accent); }
.moi .m-debut button:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }
.moi .m-debut .lab { font: 700 10px/1.1 var(--f-display); letter-spacing: .08em; text-transform: uppercase; color: var(--ink-3); }
.moi .m-debut b { font: 600 13.5px/1.15 var(--f-num); font-variant-numeric: tabular-nums; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.moi .m-debut small { font: 400 10.5px/1.2 var(--f-num); color: var(--ink-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.moi .m-def-l { margin: 0; font-size: 12.5px; line-height: 1.45; color: var(--ink-2); padding: 8px 10px; border-left: 3px solid var(--accent); background: color-mix(in srgb, var(--accent) 8%, transparent); border-radius: 0 8px 8px 0; }
@media (max-width: 359px) { .moi .m-debut { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.moi .m-env-h { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 2px 10px; align-items: baseline; padding: 14px 0 6px; border-bottom: 2px solid var(--ce, var(--rule)); }
.moi .m-env-h b::before { content: ""; display: inline-block; width: 5px; height: 14px; margin-right: 8px; border-radius: 1px; transform: skewX(-12deg); background: var(--ce, var(--rule)); vertical-align: -1px; }
.moi .m-env.total .m-env-h b::before { display: none; }
.moi .m-env-h b { font: italic 800 16px/1.1 var(--f-display); letter-spacing: .06em; text-transform: uppercase; min-width: 0; }
.moi .m-env-h .v { font: 600 14px/1.1 var(--f-num); font-variant-numeric: tabular-nums; text-align: right; }
.moi .m-env-h .j { justify-self: end; font: 600 12.5px/1.1 var(--f-num); font-variant-numeric: tabular-nums; }
.moi .m-l { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 3px 10px; padding: 10px 2px; border-bottom: 1px solid var(--rule-2); cursor: pointer; transition: background .3s; }
.moi .m-l:hover, .moi .m-l.eclair { background: var(--panel-2); }
.moi .m-l .g { min-width: 0; display: grid; gap: 2px; }
.moi .m-l .g b { font: 700 15px/1.1 var(--f-num); letter-spacing: .02em; }
.moi .m-l .g b .tag { font-style: normal; background: var(--rule-2); color: var(--ink-3); }
.moi .m-l .g small { font-size: 12px; color: var(--ink-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.moi .m-l .d { display: grid; gap: 3px; justify-items: end; }
.moi .m-l .d .badge { font-size: 14px; padding: 3px 9px; }
.moi .m-l .d small { font: 600 12px/1.1 var(--f-num); font-variant-numeric: tabular-nums; }
.moi .m-l .d .v { font: 600 14px/1.1 var(--f-num); }
.moi .m-l .b { grid-column: 1 / -1; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 2px 12px; font: 400 11.5px/1.3 var(--f-num); font-variant-numeric: tabular-nums; color: var(--ink-3); }
.moi .m-l .b i { font-style: normal; opacity: .75; }
.moi .m-l.especes { cursor: default; color: var(--ink-3); } .moi .m-l.especes:hover { background: none; }
.moi .m-l.especes .g b { font: 500 13px/1.1 var(--f-text); }
.moi .m-idx { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 1px; background: var(--rule); border: 1px solid var(--rule); border-radius: 12px; overflow: hidden; }
.moi .m-idx div { background: var(--panel); padding: 8px 10px; display: flex; justify-content: space-between; align-items: baseline; gap: 8px; min-width: 0; }
.moi .m-idx span { font-size: 12.5px; color: var(--ink-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.moi .m-idx b { font: 600 12.5px/1 var(--f-num); font-variant-numeric: tabular-nums; white-space: nowrap; }
.moi .tuiles.m-petit .val { font-size: 15.5px; }
.moi .tuiles.m-petit > div { padding: 9px 11px; }
.moi .mini p { grid-column: 1 / -1; margin: 2px 0 0; font-size: 12px; color: var(--ink-2); }
.moi .m-ligne-det { grid-column: 1 / -1; padding-top: 4px; cursor: default; }
.moi .m-tri { display: flex; justify-content: space-between; align-items: end; gap: 10px; }
.moi .m-tri .sel { min-width: 0; width: min(240px, 60%); }
.moi .m-big { font: 700 clamp(32px, 10vw, 46px)/1 var(--f-num); font-variant-numeric: tabular-nums; letter-spacing: -.03em; }
.moi .m-leg3 { display: grid; }
.moi .m-leg3 button { all: unset; box-sizing: border-box; cursor: pointer; display: grid; grid-template-columns: 12px minmax(0, 1fr) auto 46px; gap: 10px; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--rule); font-size: 13.5px; }
.moi .m-leg3 button i { width: 12px; height: 12px; border-radius: 3px; transform: skewX(-12deg); }
.moi .m-leg3 .num { text-align: right; font-family: var(--f-num); font-variant-numeric: tabular-nums; } .moi .m-leg3 .pc { text-align: right; color: var(--ink-3); font-size: 12.5px; font-family: var(--f-num); }
.moi .m-bloc { position: relative; padding-left: 12px; display: grid; gap: 10px; scroll-margin-top: 130px; }
.moi .m-bloc::before { content: ""; position: absolute; left: 0; top: 2px; bottom: 2px; width: 4px; border-radius: 2px; background: var(--c, var(--rule)); }
.moi .m-bloc h2.sec { border-bottom-color: var(--c, var(--rule)); }
.moi h3.m-sous { margin: 6px 0 0; font: italic 800 14px/1 var(--f-display); letter-spacing: .08em; text-transform: uppercase; color: var(--ink-2); }
.moi .m-liste { display: grid; }
.moi .m-liste .r { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 2px 12px; padding: 10px 0; border-bottom: 1px solid var(--rule); }
.moi .m-liste .r .a { font-weight: 600; font-size: 14px; min-width: 0; }
.moi .m-liste .r .b { text-align: right; font: 600 14px/1.2 var(--f-num); font-variant-numeric: tabular-nums; }
.moi .m-liste .r .c { font-size: 12px; color: var(--ink-3); min-width: 0; }
.moi .m-liste .r .d { text-align: right; font: 400 12px/1.2 var(--f-num); color: var(--ink-2); }
.moi .m-liste .r.total { border-top: 2px solid var(--c, var(--ink)); }
.moi .m-liste .r.total .a { font: italic 800 14px/1.2 var(--f-display); letter-spacing: .08em; text-transform: uppercase; }
.moi .m-pret { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1px; background: var(--rule); border: 1px solid var(--rule); border-radius: 12px; overflow: hidden; }
.moi .m-pret div { background: var(--panel); padding: 10px 12px; display: grid; gap: 3px; min-width: 0; }
.moi .m-pret span { font-size: 11.5px; color: var(--ink-3); }
.moi .m-pret b { font: 600 15px/1.15 var(--f-num); font-variant-numeric: tabular-nums; }
.moi .m-pret small { font-size: 11.5px; color: var(--ink-2); }
.moi .m-barres svg { width: 100%; display: block; }
.moi .m-barres text { font: 500 10.5px var(--f-num); fill: var(--ink-3); }
.moi .legend i.carre { width: 10px; height: 10px; border: 0; border-radius: 2px; display: inline-block; margin-right: 6px; vertical-align: -1px; transform: skewX(-12deg); }
.moi .m-rep { display: grid; }
.moi .m-rep > div { display: grid; grid-template-columns: minmax(64px, 28%) minmax(0, 1fr) 46px 72px; gap: 8px; align-items: center; padding: 7px 0; border-bottom: 1px solid var(--rule); font-size: 13px; }
.moi .m-rep .n { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 600; }
.moi .m-rep .b { height: 8px; background: var(--rule-2); border-radius: 4px; overflow: hidden; }
.moi .m-rep .b i { display: block; height: 100%; background: var(--s1); border-radius: 4px; }
.moi .m-rep .p, .moi .m-rep .e { text-align: right; font: 500 12px/1 var(--f-num); font-variant-numeric: tabular-nums; } .moi .m-rep .e { color: var(--ink-3); }
.moi .grille td.m-c { cursor: pointer; min-width: 46px; height: 34px; font-size: 11px; }
.moi .grille td.m-c.sel { box-shadow: inset 0 0 0 2px var(--ink); }
.moi .m-jr { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.moi .m-jr b { display: block; font: 700 12px/1 var(--f-display); letter-spacing: .1em; text-transform: uppercase; color: var(--ink-2); margin-bottom: 4px; }
.moi .m-jr .l { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 0 8px; padding: 5px 0; border-bottom: 1px solid var(--rule-2); font-size: 12px; }
.moi .m-jr .l span:first-child { grid-column: 1 / -1; color: var(--ink-2); }
.moi .m-jr .l span:not(:first-child) { font: 500 11.5px/1.2 var(--f-num); white-space: nowrap; }
.moi .m-jr .l span:last-child { text-align: right; }
.moi .acc > div { display: grid; gap: 10px; }
.moi .acc.m-compact > summary { padding: 9px 12px; align-items: center; }
.moi .acc.m-compact > summary::after { grid-row: 1; align-self: center; margin-top: 0; }
.moi .acc.m-compact > summary .t { font-size: 14px; }
.moi .m-cp-r { grid-column: 1; grid-row: 2; display: flex; flex-wrap: wrap; gap: 4px 12px; font-size: 12px; color: var(--ink-3); }
.moi .m-cp-r b { font: 600 12px/1 var(--f-num); }
.moi .m-perf-t th, .moi .m-perf-t td { font-size: 11.5px; padding-top: 6px; padding-bottom: 6px; }
.moi .m-jc > summary { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto; gap: 8px; }
.moi .m-jc > summary::after { grid-column: 3; }
.moi .m-jc-p { display: grid; gap: 1px; min-width: 0; padding: 2px 0 2px 9px; border-left: 3px solid var(--up); }
.moi .m-jc-p.down { border-left-color: var(--down); }
.moi .m-jc-p i { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font: 700 10px/1.2 var(--f-display); letter-spacing: .1em; text-transform: uppercase; color: var(--ink-3); font-style: normal; }
.moi .m-jc-p b { font: 700 16px/1.1 var(--f-num); }
.moi .m-jc-p.up b { color: var(--up); } .moi .m-jc-p.down b { color: var(--down); }
.moi .m-jc-p small { font: 500 11px/1.2 var(--f-num); color: var(--ink-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.moi .m-h4 { margin: 10px 0 0; font: italic 800 14px/1 var(--f-display); letter-spacing: .08em; text-transform: uppercase; color: var(--ink-2); }
.moi .m-vide { display: grid; gap: 14px; justify-items: start; padding: 26px 0 10px; }
.moi .m-vide p { margin: 0; font-size: 14px; color: var(--ink-2); }
.moi .tab td small { color: var(--ink-3); }
@media (prefers-color-scheme: light) { :root:not([data-theme="dark"]) .moi { --e1: #B7791F; --e2: #0F8F7E; --e3: #8B3FD9; --e4: #D35A1F; --e5: #1E88B8; } }
:root[data-theme="light"] .moi { --e1: #B7791F; --e2: #0F8F7E; --e3: #8B3FD9; --e4: #D35A1F; --e5: #1E88B8; }
@media (max-width: 430px) {
  .moi .m-rep > div { grid-template-columns: minmax(60px, 26%) minmax(0, 1fr) 44px 66px; }
}

/* signal levier (repris de Cote) */
.moi .sig { border: 1px solid var(--rule); border-radius: 12px; overflow: hidden; background: var(--panel); --sc: var(--up); }
.moi .sig.hors { --sc: var(--down); } .moi .sig.x1 { --sc: var(--p0); } .moi .sig.creux { --sc: var(--accent); }
.moi .sig-tete { all: unset; box-sizing: border-box; cursor: pointer; display: flex; align-items: center; gap: 10px; width: 100%; padding: 11px 12px 11px 10px; border-left: 4px solid var(--sc); }
.moi .sig-tete:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }
.moi .sig-lab { font: 700 11px/1.1 var(--f-display); letter-spacing: .1em; text-transform: uppercase; color: var(--accent-ink); }
.moi .sig-pos { margin-left: auto; font: 700 13px/1 var(--f-num); padding: 6px 9px; border-radius: 6px; white-space: nowrap; color: var(--sc); background: color-mix(in srgb, var(--sc) 15%, transparent); }
.moi .sig-tete .chev { font: 600 18px/1 var(--f-num); color: var(--ink-3); transition: transform .2s; }
.moi .sig-tete[aria-expanded="true"] .chev { transform: rotate(90deg); }
.moi .sig-cells { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); border-bottom: 1px solid var(--rule); margin: 0 -12px; }
.moi .pc-c { padding: 10px 12px; display: grid; gap: 4px; border-right: 1px solid var(--rule); min-width: 0; }
.moi .pc-c:last-child { border-right: 0; }
.moi .pc-c .lab { font: 700 11px/1.1 var(--f-display); letter-spacing: .1em; text-transform: uppercase; color: var(--accent-ink); }
.moi .pc-c .val { font: 600 15px/1.15 var(--f-num); font-variant-numeric: tabular-nums; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.moi .pc-c .sub { font-size: 11px; color: var(--ink-3); }
.moi .sig-msg { margin: 0; padding: 9px 12px; font-size: 13px; border-top: 1px solid var(--rule); color: var(--ink-2); }
.moi .sig-msg.ordre { font-weight: 600; color: var(--ink); background: color-mix(in srgb, var(--gold) 18%, transparent); }
.moi .sig-msg.alerte { color: var(--ink); background: var(--down-bg); }
.moi .sig-detail { border-top: 1px solid var(--rule); padding: 0 12px 12px; display: grid; gap: 4px; }
.moi .sig-detail .m-liste .r { padding: 8px 0; }
.moi .sig-detail .t-ACHAT, .moi .sig-detail .t-RELAIS, .moi .sig-detail .t-x2 { color: var(--up); }
.moi .sig-detail .t-VENTE { color: var(--down); } .moi .sig-detail .t-x1 { color: var(--p0); }
.moi .sig-detail .t-CREUX, .moi .sig-detail .t-EVITEE { color: var(--accent-ink); } .moi .sig-detail .t-REFUS { color: var(--gold); }
.moi .sig-pied { font-size: 11px; color: var(--ink-3); padding-top: 6px; }
.moi .sig-cto { display: flex; align-items: center; gap: 10px; padding: 8px 12px 8px 14px; border-top: 1px solid var(--rule); min-width: 0; flex-wrap: wrap; }
.moi .sig-cto .sig-pos { margin-left: 0; }
.moi .sig-cto .sub { font-size: 11.5px; color: var(--ink-3); min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
.moi .sig-pos.cto-x3 { --sc: #E0841A; } .moi .sig-pos.cto-x2 { --sc: var(--up); } .moi .sig-pos.cto-x1 { --sc: var(--p0); } .moi .sig-pos.cto-or { --sc: #B8962E; }
.moi .sig-h { margin: 12px 0 2px; font: 700 12px/1.2 var(--f-display); letter-spacing: .1em; text-transform: uppercase; color: var(--ink-2); display: flex; justify-content: space-between; gap: 8px; align-items: baseline; }
.moi .sig-h small { font: 400 11px/1.2 var(--f-text); letter-spacing: 0; text-transform: none; color: var(--ink-3); text-align: right; }
.moi .sig-detail .b.acc { color: var(--accent-ink); } .moi .sig-detail .b.down { color: var(--down); }
.moi .ck { font-style: normal; font-weight: 700; margin-left: 4px; } .moi .ck.up { color: var(--up); } .moi .ck.down { color: var(--down); }
.moi .qm-b { all: unset; box-sizing: border-box; cursor: pointer; display: inline-grid; place-items: center; width: 17px; height: 17px; margin-left: 6px; border-radius: 50%; border: 1px solid var(--rule); font: 700 10.5px/1 var(--f-num); color: var(--ink-3); vertical-align: 1px; letter-spacing: 0; text-transform: none; }
.moi .qm-b:focus-visible { outline: 2px solid var(--accent); }
.moi [data-aide].aide-on > .a .qm-b, .moi [data-aide].aide-on .sig-lab .qm-b, .moi [data-aide].aide-on .sig-h .qm-b, .moi .qm-b.on { background: var(--accent); border-color: var(--accent); color: #fff; }
.moi .aide { display: none; font: 400 12.5px/1.45 var(--f-text); color: var(--ink); background: color-mix(in srgb, var(--accent) 9%, transparent); border-left: 3px solid var(--accent); padding: 7px 9px; border-radius: 0 6px 6px 0; margin-top: 6px; letter-spacing: 0; text-transform: none; }
.moi [data-aide].aide-on .aide { display: block; }
.moi .aide-l { padding: 0; }
.moi .sig-cto .aide { flex-basis: 100%; }
.moi .sig-case-aide { padding: 8px 0; border-bottom: 1px solid var(--rule); }
.moi .sig-case-aide .aide { display: block; margin-top: 0; }
.moi .m-status { display: flex; flex-wrap: wrap; gap: 4px 14px; font-size: 12.5px; color: var(--ink-2); }
/* saisie (feuille ➕) */
.moi.m-feuille { min-height: 70vh; }
.moi .m-seg4 button { font-size: 12.5px; padding: 10px 4px; }
.moi .form { display: grid; gap: 14px; }
.moi .rang.trois { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.moi .champ select, .moi .champ input[type="date"], .moi .champ input[type="text"] { font: 500 15px/1.2 var(--f-text); padding: 11px 12px; border-radius: 10px; border: 1px solid var(--rule); background: var(--panel); color: var(--ink); width: 100%; min-width: 0; }
.moi .champ input[inputmode="decimal"] { font-family: var(--f-num); font-variant-numeric: tabular-nums; }
.moi .aide.lie, .moi .champ .aide { display: block; background: none; border: 0; padding: 0; margin: 0; font-size: 11.5px; color: var(--ink-3); }
.moi .aide.lie { margin-top: -8px; }
.moi .types { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; }
.moi .type-btn { border: 1px solid var(--rule); background: var(--panel); border-radius: 10px; padding: 11px 4px; cursor: pointer; font: italic 800 14px/1 var(--f-display); letter-spacing: .06em; text-transform: uppercase; color: var(--ink-2); }
.moi .type-btn[aria-pressed="true"] { background: var(--ink); color: var(--bg); border-color: var(--ink); box-shadow: inset 0 -3px 0 var(--accent); }
.moi .raccourcis { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.moi .raccourcis > span:first-child { font-size: 12px; color: var(--ink-3); }
.moi .chip.suppr { border-color: var(--down); color: var(--down); }
.moi .coche { display: flex; gap: 10px; align-items: center; font-size: 14px; cursor: pointer; }
.moi .coche input { width: 20px; height: 20px; accent-color: var(--accent); }
.moi .mini-btn { border: 1px solid var(--rule); background: var(--panel); border-radius: 8px; padding: 6px 10px; font-size: 12.5px; cursor: pointer; color: var(--ink); }
.moi .recap { display: grid; gap: 0; background: var(--panel); border: 1px solid var(--rule); border-radius: 10px; padding: 4px 12px; }
.moi .recap div { display: flex; justify-content: space-between; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--rule-2); font-size: 13px; color: var(--ink-2); align-items: center; }
.moi .recap div:last-child { border-bottom: 0; }
.moi .recap b { font: 600 13px/1.2 var(--f-num); font-variant-numeric: tabular-nums; color: var(--ink); text-align: right; }
.moi .alertes { display: grid; gap: 6px; }
.moi .alertes:empty, .moi .recap[hidden] { display: none; }
.moi .pied-form { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; }
.moi .nommer { display: flex; gap: 8px; align-items: center; flex: 1; min-width: 0; }
.moi .nommer input { flex: 1; min-width: 0; font: 500 14px/1.2 var(--f-text); padding: 8px 10px; border-radius: 8px; border: 1px solid var(--rule); background: var(--panel); color: var(--ink); }
.moi .m-jo { display: grid; }
.moi .jr { display: grid; grid-template-columns: 46px minmax(0, 1fr) auto; gap: 2px 10px; padding: 10px 0; border-bottom: 1px solid var(--rule); align-items: start; }
.moi .jr .jd { font: 600 13px/1.1 var(--f-num); }
.moi .jr .jd small { display: block; font-size: 10.5px; color: var(--ink-3); font-weight: 400; }
.moi .jr .jm { min-width: 0; display: grid; gap: 2px; }
.moi .jr .jm b { font-size: 14px; }
.moi .jr .jm span { font-size: 12px; color: var(--ink-3); overflow-wrap: anywhere; }
.moi .jr .jv { font: 600 13.5px/1.1 var(--f-num); font-variant-numeric: tabular-nums; text-align: right; }
.moi .jr .ja { grid-column: 2 / -1; display: flex; gap: 14px; }
.moi .jr.envoi { opacity: .6; }
.moi .tag.prog { background: var(--rule-2); color: var(--ink-2); }
.moi .tag.app { background: color-mix(in srgb, var(--accent) 16%, transparent); color: var(--accent-ink); }
.moi .raps { display: grid; }
.moi .rap { border-bottom: 1px solid var(--rule); }
.moi .rap-h { all: unset; box-sizing: border-box; cursor: pointer; width: 100%; display: grid; grid-template-columns: 10px minmax(0, 1fr) auto; gap: 10px; align-items: center; padding: 11px 0; }
.moi .rap-h.fixe { cursor: default; }
.moi .rap-h:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.moi .rap-n { font-weight: 600; font-size: 14px; display: grid; gap: 2px; min-width: 0; }
.moi .rap-n small { font-weight: 400; font-size: 12px; color: var(--ink-3); }
.moi .pt { width: 8px; height: 8px; border-radius: 50%; background: var(--ink-3); }
.moi .pt.ok { background: var(--up); } .moi .pt.faire { background: #F59E0B; box-shadow: 0 0 0 3px color-mix(in srgb, #F59E0B 25%, transparent); }
.moi .st { font: 700 11px/1 var(--f-display); letter-spacing: .08em; text-transform: uppercase; padding: 4px 7px; border-radius: 5px; background: var(--rule-2); color: var(--ink-2); }
.moi .st.ok { background: var(--up-bg); color: var(--up); } .moi .st.faire { background: color-mix(in srgb, #F59E0B 18%, transparent); color: #D97706; }
.moi .rap-c { padding: 0 0 14px 20px; }
.moi .ligne-champ { display: flex; gap: 8px; }
.moi .ligne-champ input { flex: 1; min-width: 0; font: 500 15px/1.2 var(--f-num); padding: 11px 12px; border-radius: 10px; border: 1px solid var(--rule); background: var(--panel); color: var(--ink); }
.moi .m-h4 small { font: 400 12px/1.2 var(--f-text); letter-spacing: 0; text-transform: none; color: var(--ink-3); margin-left: 6px; }
.moi .m-actions { grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 8px; margin: 4px 0 0; }
@media (max-width: 380px) { .moi .rang.trois { grid-template-columns: 1fr 1fr; } .moi .types .type-btn { font-size: 12.5px; } }
/* jauge du millionnaire */
.m-million { --gold: #F5C542; position: relative; overflow: hidden; border-radius: 18px; padding: 18px 16px 16px; display: grid; gap: 12px; color: #F4F5F8;
  background: radial-gradient(120% 90% at 100% 0%, color-mix(in srgb, var(--gold) 34%, transparent), transparent 55%), radial-gradient(90% 80% at 0% 100%, color-mix(in srgb, var(--mc) 40%, transparent), transparent 60%), #0B0D12;
  border: 1px solid color-mix(in srgb, var(--gold) 45%, #0B0D12); box-shadow: 0 10px 30px rgba(0,0,0,.35); }
.m-million .mm-h { display: flex; justify-content: space-between; align-items: center; }
.m-million .mm-k { font: italic 800 15px/1 var(--f-display); letter-spacing: .14em; text-transform: uppercase; color: var(--gold); }
.m-million .mm-prive { font: 700 10px/1.4 var(--f-display); letter-spacing: .12em; text-transform: uppercase; padding: 2px 8px; border-radius: 999px; border: 1px solid rgba(255,255,255,.25); color: rgba(255,255,255,.7); }
.m-million .mm-pct { display: flex; align-items: baseline; gap: 4px; }
.m-million .mm-pct b { font: italic 800 clamp(64px, 22vw, 96px)/.9 var(--f-display); letter-spacing: -.01em; background: linear-gradient(180deg, #FFF3C4, var(--gold) 60%, #B7791F); -webkit-background-clip: text; background-clip: text; color: transparent; }
.m-million .mm-pct span { font: italic 800 28px/1 var(--f-display); color: var(--gold); }
.m-million .mm-flaps .m-flap { width: clamp(22px, 7vw, 34px); height: clamp(32px, 10vw, 48px); font-size: clamp(18px, 6vw, 28px); }
.m-million .mm-piste { position: relative; height: 54px; margin: 6px 4px 0 2px; }
.m-million .mm-rail { position: absolute; left: 0; right: 0; top: 10px; height: 14px; border-radius: 7px; background: rgba(255,255,255,.08); box-shadow: inset 0 0 0 1px rgba(255,255,255,.08); }
.m-million .mm-rail i { position: absolute; inset: 0 auto 0 0; border-radius: 7px; background: linear-gradient(90deg, var(--mc), var(--gold)); box-shadow: 0 0 18px color-mix(in srgb, var(--gold) 60%, transparent); }
.m-million .mm-rail em { position: absolute; top: -7px; width: 12px; height: 28px; margin-left: -6px; border-radius: 3px; background: #fff; transform: skewX(-12deg); box-shadow: 0 0 0 3px var(--mc), 0 0 16px #fff; }
.m-million .mj { position: absolute; top: 0; transform: translateX(-50%); display: grid; justify-items: center; gap: 22px; }
.m-million .mj i { width: 2px; height: 34px; background: rgba(255,255,255,.25); position: absolute; top: 4px; }
.m-million .mj b { margin-top: 36px; font: 600 10.5px/1 var(--f-num); color: rgba(255,255,255,.55); }
.m-million .mj.passe b { color: var(--gold); } .m-million .mj.passe i { background: var(--gold); }
.m-million .mj.fin { transform: translateX(-100%); }
.m-million .mj.fin i { width: 14px; height: 34px; background: repeating-conic-gradient(#fff 0 25%, #0B0D12 0 50%) 0 0 / 7px 7px; border-radius: 2px; }
.m-million .mj.fin b { color: var(--gold); font-weight: 800; }
.m-million .mm-seg { background: rgba(255,255,255,.06); border-color: rgba(255,255,255,.14); }
.m-million .mm-seg button { color: rgba(255,255,255,.75); }
.m-million .mm-seg button[aria-pressed="true"] { background: var(--gold); color: #17110A; }
.m-million .mm-eta { margin: 0; font-size: 16px; line-height: 1.4; }
.m-million .mm-eta b { color: var(--gold); font-weight: 700; }
.m-million .mm-sub { margin: 0; font-size: 13px; color: rgba(255,255,255,.75); }
.m-million .mm-sub b { font-family: var(--f-num); color: #fff; }
.m-million .mm-d { display: flex; align-items: center; gap: 10px; }
.m-million .mm-coche { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; color: rgba(255,255,255,.7); cursor: pointer; }
.m-million .mm-coche input { width: 16px; height: 16px; margin: 0; accent-color: var(--gold); }
.m-million.reduit { gap: 8px; padding: 12px 14px; }
.m-million .mm-ligne { margin: 0; display: flex; align-items: baseline; gap: 10px; }
.m-million .mm-ligne b { font: italic 800 28px/1 var(--f-display); color: var(--gold); }
.m-million .mm-ligne span { font-size: 13.5px; color: rgba(255,255,255,.8); }
.m-million .mm-rail.mini { position: relative; top: 0; height: 8px; }
.m-million .mm-sim { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.m-million .mm-sim label { display: grid; gap: 5px; font-size: 12px; color: rgba(255,255,255,.75); }
.m-million .mm-sim input { font: 600 16px/1.2 var(--f-num); padding: 10px 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,.2); background: rgba(255,255,255,.07); color: #fff; width: 100%; min-width: 0; }
.m-million .mm-sim input:focus { outline: 2px solid var(--gold); outline-offset: 1px; }
.m-million .mm-graph { display: grid; gap: 4px; }
.m-million .mm-svg { width: 100%; height: auto; display: block; }
.m-million .mm-svg text { font: 500 9.5px var(--f-num); fill: rgba(255,255,255,.55); }
.m-million .mm-leg { display: flex; flex-wrap: wrap; gap: 4px 14px; font-size: 11.5px; color: rgba(255,255,255,.7); }
.m-million .mm-leg i { display: inline-block; width: 14px; height: 0; border-top: 2.4px solid #F5C542; vertical-align: middle; margin-right: 6px; }
.m-million .mm-leg i.sans { border-top: 1.6px dashed rgba(255,255,255,.6); }
.m-million .mm-raz { all: unset; cursor: pointer; color: var(--gold); text-decoration: underline; }
.m-million .mm-badge { margin: 0; padding: 9px 11px; border-radius: 10px; font-size: 12.5px; line-height: 1.4; color: rgba(255,255,255,.85); background: rgba(245,197,66,.1); border: 1px dashed rgba(245,197,66,.45); }
.m-million .mm-badge b { color: #F5C542; }
.m-million .mm-note { margin: 0; font-size: 11.5px; color: rgba(255,255,255,.5); }

/* missions : série, paliers, fête (repris de Cote) */
.moi .m-onglets button { font-size: 12.5px; padding: 10px 2px; }
.moi .m-bilans { display: flex; flex-wrap: wrap; gap: 8px; }
.wr .cl-flaps { display: flex; flex-wrap: wrap; justify-content: center; align-self: stretch; width: 100%; margin: 14px 0 6px; gap: 3px; }
.wr .cl-flaps .m-flap { width: clamp(22px, 7vw, 40px); height: clamp(34px, 10.6vw, 60px); font-size: clamp(22px, 7vw, 40px); }
.wr .cl-serie { display: flex; align-items: center; justify-content: center; gap: 10px; margin: 10px 0; } .wr .cl-serie .cl-flaps { margin: 0; width: auto; align-self: auto; }
.wr .cl-fl { font: 800 28px/1 var(--f-display); opacity: .7; }
.wr .cl-jauge { height: 8px; border-radius: 4px; background: rgba(255,255,255,.18); overflow: hidden; margin: 6px 0 2px; } .wr .cl-jauge i { display: block; height: 100%; background: var(--c, #9B87FF); border-radius: 4px; }
.moi .m-serie { display: flex; align-items: baseline; gap: 10px; padding: 10px 12px; border-radius: 12px; background: var(--panel); border: 1px solid var(--rule); font-size: 12.5px; color: var(--ink-2); }
.moi .m-serie b { font: italic 800 20px/1 var(--f-display); letter-spacing: .04em; white-space: nowrap; color: var(--ink); }
.moi .m-serie:not(.ok) { border-color: color-mix(in srgb, #F59E0B 55%, var(--rule)); }
.moi .mois12 { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 4px; }
.moi .mois12 span { display: grid; gap: 4px; justify-items: center; }
.moi .mois12 i { width: 100%; height: 22px; border-radius: 4px; background: var(--rule-2); }
.moi .mois12 .ok i { background: linear-gradient(to bottom, var(--gold) 0 50%, color-mix(in srgb, var(--gold) 82%, #000) 50% 100%); }
.moi .mois12 .cours i { outline: 2px solid var(--ink); outline-offset: 1px; }
.moi .mois12 b { font: 600 10px/1 var(--f-num); color: var(--ink-3); }
.moi .paliers { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.moi .palier { all: unset; box-sizing: border-box; display: grid; gap: 7px; align-content: start; padding: 12px; border: 1px solid var(--rule); border-radius: 12px; background: var(--panel); min-width: 0; }
.moi .palier.fait { cursor: pointer; border-color: color-mix(in srgb, var(--gold) 50%, var(--rule)); }
.moi .palier.fait:focus-visible, .moi .pl-r.fait:focus-visible { outline: 2px solid var(--accent); }
.moi .pastille { justify-self: start; position: relative; padding: 7px 9px; border-radius: 6px; background: linear-gradient(to bottom, var(--flap-2) 0 50%, var(--flap) 50% 100%); color: var(--flap-ink); font: 600 15px/1 var(--f-num); letter-spacing: .04em; }
.moi .palier.fait .pastille, .moi .pl-r.fait .pastille { color: #F5C542; }
.moi .palier:not(.fait) .pastille, .moi .pl-r:not(.fait) .pastille { opacity: .55; }
.moi .palier .pl-t { font-size: 13px; font-weight: 600; line-height: 1.3; }
.moi .palier .pl-s { font-size: 11.5px; color: var(--ink-3); line-height: 1.35; }
.moi .palier.fait .pl-s { color: var(--up); font-weight: 600; }
.moi .palier .jauge { height: 6px; }
.moi .palier .jauge i, .moi .pl-r .jauge i { background: var(--gold); }
.moi .tous-paliers { display: grid; gap: 10px; }
.moi .tous-paliers h3.m-sous { display: flex; justify-content: space-between; align-items: baseline; }
.moi .tous-paliers h3.m-sous small { font: 500 12px/1 var(--f-num); color: var(--ink-3); }
.moi .pl-liste { display: grid; }
.moi .pl-r { all: unset; box-sizing: border-box; display: grid; grid-template-columns: 62px minmax(0, 1fr) auto; gap: 10px; align-items: center; padding: 7px 0; border-bottom: 1px solid var(--rule-2); }
.moi .pl-r .pastille { padding: 5px 7px; font-size: 12.5px; }
.moi .pl-r.fait { cursor: pointer; }
.moi .pl-r .pl-t { font-size: 13px; line-height: 1.3; display: grid; gap: 4px; min-width: 0; }
.moi .pl-r .pl-t .jauge { height: 4px; }
.moi .pl-r .pl-t small { font-size: 11px; color: var(--ink-3); }
.moi .pl-r:not(.fait) .pl-t { color: var(--ink-2); }
.moi .pl-r .pl-s { font: 500 12px/1 var(--f-num); color: var(--ink-3); white-space: nowrap; }
.moi .pl-r.fait .pl-s { color: var(--up); }
.m-fete { position: fixed; inset: 0; z-index: 95; display: flex; overflow-y: auto; -webkit-overflow-scrolling: touch; padding: 24px 16px; text-align: center; color: #F4F5F8;
  background: radial-gradient(circle at 50% 30%, rgba(245,197,66,.35), transparent 60%), #0B0D12; }
.m-fete > div { display: grid; gap: 16px; justify-items: center; max-width: 480px; margin: auto; }
.m-fete .mf-k { font: 700 13px/1 var(--f-display); letter-spacing: .16em; text-transform: uppercase; color: #F5C542; }
.m-fete .m-flaps { justify-content: center; }
.m-fete h3 { margin: 0; font: italic 800 24px/1.15 var(--f-display); letter-spacing: .05em; text-transform: uppercase; }
.m-fete p { margin: 0; opacity: .75; font-size: 14px; }
@media (max-width: 380px) { .moi .paliers { grid-template-columns: minmax(0, 1fr); } }
@media (prefers-reduced-motion: reduce) { .moi .m-flap.go, .moi .m-flap.af-prisme, .moi .m-flap.af-lingot::after { animation: none; } }
`;
  document.head.appendChild(st);
}

/* ---------- Connexion à ton fichier ---------- */
/* Simulation (l'admin regarde l'appli à une autre date ou comme un joueur) : rien ne part vers les fichiers */
function simulationM() { return !!window.DATE_SIM || (typeof vueJoueur === "function" && vueJoueur()); }
const MSG_SIM = "👁️ Simulation : rien n'est envoyé. Repasse en admin, aujourd'hui (Réglages ou barre du Podium) pour agir pour de vrai.";
function adresse() { return (stock.get(K.api) || "").trim(); }
function cle() { return stock.get(K.cle) || ""; }
function configure() { return !!(adresse() && cle()); }
function lireCache() { if (M) { assurerSimple(); return; } const c = stock.get(K.cache); if (c) { try { recevoir(JSON.parse(c)); SRC = "cache"; } catch (e) { stock.del(K.cache); } } }

async function charger(frais) {
  if (!configure() || enCours) return;
  enCours = true; erreur = "";
  const ctrl = window.AbortController ? new AbortController() : null;
  const minuteur = setTimeout(() => { if (ctrl) ctrl.abort(); }, 25000);
  try {
    const url = adresse();
    const rep = await fetch(url + (url.includes("?") ? "&" : "?") + "action=data&cle=" + encodeURIComponent(cle()) + (frais ? "&frais=1" : ""), { cache: "no-store", signal: ctrl ? ctrl.signal : undefined });
    const json = await rep.json();
    if (!json.ok) {
      if (json.erreur === "cle") { stock.del(K.cle); erreur = json.message || "Clé refusée par ton fichier."; return; }
      throw new Error(json.message || "Réponse inattendue de ton fichier");
    }
    recevoir(json); SRC = "api"; dernierAppel = Date.now();
    stock.set(K.cache, JSON.stringify(json));
    setTimeout(() => { verifierPaliers(); partagerLignes(); revendiquerMillion(); revendiquerFichier(); }, 0);
  } catch (e) {
    erreur = e && e.name === "AbortError" ? "Ton fichier met trop de temps à répondre." : (e && e.message) || String(e);
    if (M) SRC = "cache";
  } finally {
    clearTimeout(minuteur); enCours = false;
    signalerCloche();
    if (vueMoi()) rendre();
  }
}
function vueMoi() { const s = document.getElementById("v-moi"); return s && !s.hidden; }

/* ---------- Rendu ---------- */
const ONGLETS = [["jour", "Aujourd'hui"], ["patrimoine", "Patrimoine"], ["stats", "Stats"], ["missions", "Missions"]];

function rendre() {
  injecterStyle();
  const v = document.getElementById("v-moi"); if (!v) return;
  v.style.setProperty("--mc", couleurMoi());
  { const th = M ? themeActif() : null; v.classList.toggle("th", !!(th && th[3])); if (th && th[3]) v.style.setProperty("--th-fond", th[3]); else v.style.removeProperty("--th-fond"); }
  if (!configure()) { v.innerHTML = ecranConnexion(); brancherConnexion(v); return; }
  lireCache(); signalerCloche();
  if (!M) {
    v.innerHTML = erreur ? '<div class="m-vide"><p>Impossible de lire ton fichier.</p><p class="info">' + esc(erreur) + '</p><button class="btn" type="button" id="m-reessayer">Réessayer</button></div>'
      : '<div class="m-vide"><div class="m-flaps" aria-hidden="true">' + flaps("MOI", !reduit) + "</div><p>Ouverture de ton fichier…</p><p class=\"info\">La première lecture prend quelques secondes. Ensuite, les derniers chiffres s'affichent tout de suite pendant la mise à jour.</p></div>";
    const r = v.querySelector("#m-reessayer"); if (r) r.addEventListener("click", () => { erreur = ""; rendre(); charger(true); });
    if (!erreur) charger(false);
    return;
  }
  if (Date.now() - dernierAppel > 5 * 60e3 && !enCours && !erreur) setTimeout(() => charger(false), 0);
  noterVisite();
  const o = ONGLETS.some(x => x[0] === PREF.onglet) ? PREF.onglet : "jour";
  const bandeau = SRC === "cache" ? '<div class="demo-band">' + (enCours ? "Mise à jour de ton fichier…" : erreur ? "Ton fichier n'a pas répondu (" + esc(erreur) + ") · chiffres de la dernière ouverture." : "Chiffres de la dernière ouverture · mise à jour…") + " <small>" + esc(M.majTexte || "") + "</small></div>" : "";
  v.innerHTML =
    '<div class="seg m-onglets" role="tablist" aria-label="Moi">' + ONGLETS.map(([k, l]) => '<button type="button" role="tab" data-m-ong="' + k + '" aria-pressed="' + (o === k) + '" aria-selected="' + (o === k) + '">' + l + "</button>").join("") + "</div>" +
    bandeau +
    ({ jour: M.simple ? htmlJourSimple : htmlJour, patrimoine: htmlPatrimoine, stats: htmlStats, missions: htmlMissions })[o]();
  v.querySelectorAll("[data-m-ong]").forEach(b => b.addEventListener("click", () => { PREF.onglet = b.dataset.mOng; garderPref(); rendre(); window.scrollTo(0, 0); }));
  v.querySelectorAll("details.acc[data-acc]").forEach(d => d.addEventListener("toggle", () => { PREF.acc[d.dataset.acc] = d.open; garderPref(); if (d.open && d.dataset.acc === "m-courbe") dessinerCourbe(); }));
  ({ jour: M.simple ? brancherJourSimple : brancherJour, patrimoine: brancherPatrimoine, stats: brancherStats, missions: brancherMissions })[o](v);
  if (SRC === "api") verifierPaliers();
  verifierCloture();
}

function acc(id, titre, sous, contenu, defaut) {
  const ouvert = PREF.acc[id] === undefined ? !!defaut : PREF.acc[id];
  return '<details class="acc" data-acc="' + id + '"' + (ouvert ? " open" : "") + '><summary><span class="t">' + titre + (sous ? " <small>" + sous + "</small>" : "") + "</span></summary><div>" + contenu + "</div></details>";
}

function ecranConnexion() {
  return '<div class="m-vide"><div class="m-flaps" aria-hidden="true">' + flaps("MOI", false) + "</div>" +
    "<p>Ton espace privé : tes enveloppes, tes lignes, ton épargne, ton immobilier et tes stats détaillées, lus directement depuis ton fichier « Portefeuille &amp; Épargne ».</p>" +
    '<p class="info">Connecte-le une fois dans Réglages › Mon fichier : l\'adresse et la clé restent sur cet appareil et ne passent jamais par le fichier Versus partagé. Les autres ne voient que ta bourse dans le classement.</p>' +
    '<button class="btn acc" type="button" id="m-connecter">Connecter mon fichier</button></div>';
}
function brancherConnexion(v) {
  const b = v.querySelector("#m-connecter");
  if (b) b.addEventListener("click", () => { if (typeof ouvrirReglages === "function") ouvrirReglages("regl-moi"); });
}

/* Afficheurs : palettes (repris de Cote) et autres types (tambours, segments, matrice, ticket, billet, carte) */
const estSepAff = ch => ch === NB || ch === " " || ch === "\u202F" || ch === "\u00A0";
const MATRICE = {
  "0": "01110100011001110101110011000101110", "1": "00100011000010000100001000010001110", "2": "01110100010000100010001000100011111",
  "3": "11111000100010000010000011000101110", "4": "00010001100101010010111110001000010", "5": "11111100001111000001000011000101110",
  "6": "00110010001000011110100011000101110", "7": "11111000010001000100010000100001000", "8": "01110100011000101110100011000101110",
  "9": "01110100011000101111000010001001100", "A": "01110100011000111111100011000110001", "B": "11110100011000111110100011000111110",
  "C": "01110100011000010000100001000101110", "D": "11100100101000110001100011001011100", "E": "11111100001000011110100001000011111",
  "F": "11111100001000011110100001000010000", "G": "01110100011000010111100011000101111", "H": "10001100011000111111100011000110001",
  "I": "01110001000010000100001000010001110", "J": "00111000100001000010000101001001100", "K": "10001100101010011000101001001010001",
  "L": "10000100001000010000100001000011111", "M": "10001110111010110101100011000110001", "N": "10001100011100110101100111000110001",
  "O": "01110100011000110001100011000101110", "P": "11110100011000111110100001000010000", "Q": "01110100011000110001101011001001101",
  "R": "11110100011000111110101001001010001", "S": "01111100001000001110000010000111110", "T": "11111001000010000100001000010000100",
  "U": "10001100011000110001100011000101110", "V": "10001100011000110001100010101000100", "W": "10001100011000110101101011010101010",
  "X": "10001100010101000100010101000110001", "Y": "10001100010101000100001000010000100", "Z": "11111000010001000100010001000011111",
  "€": "00111010001111001000111100100000111", "+": "00000001000010011111001000010000000", "-": "00000000000000011111000000000000000",
  "•": "00000000000111001110011100000000000", "%": "11000110010001000100010001001100011", ">": "01000001000001000001000100010001000",
  ":": "00000011000110000000011000110000000", ",": "00000000000000000000011000010001000", ".": "00000000000000000000000000110001100"
};
const SEGMENTS = { "0": "abcdef", "1": "bc", "2": "abged", "3": "abgcd", "4": "fgbc", "5": "afgcd", "6": "afgedc", "7": "abc", "8": "abcdefg", "9": "abcdfg",
  "-": "g", "•": "g", "A": "abcefg", "B": "cdefg", "C": "adef", "D": "bcdeg", "E": "adefg", "F": "aefg", "G": "acdef", "H": "bcefg", "I": "bc", "J": "bcde",
  "L": "def", "N": "ceg", "O": "abcdef", "P": "abefg", "R": "eg", "S": "acdfg", "T": "defg", "U": "bcdef", "Y": "bcdfg" };
const SEG_R = { a: [7, 2, 26, 5], b: [33, 7, 5, 26], c: [33, 37, 5, 26], d: [7, 63, 26, 5], e: [2, 37, 5, 26], f: [2, 7, 5, 26], g: [7, 32.5, 26, 5] };
const majAff = ch => ch === MOINS ? "-" : ch.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
function rendreAff(type, style, texte, animer) {
  const ch = Array.from(texte), go = animer ? " go" : "", aDesChiffres = /\d/.test(texte);
  if (type === "tambour") return '<span class="m-af t-tambour" aria-hidden="true">' + ch.map((c, i) => {
    if (estSepAff(c)) return '<i class="od-sep"></i>';
    if (/\d/.test(c)) return '<span class="od"><span class="od-r' + go + '" style="--d:' + (10 + +c) + (animer ? ";animation-delay:" + i * 90 + "ms" : "") + '">' + "01234567890123456789".split("").map(x => "<b>" + x + "</b>").join("") + "</span></span>";
    return '<span class="od' + (c === "€" ? " u" : "") + '"><b>' + esc(c) + "</b></span>";
  }).join("") + "</span>";
  if (type === "seg") return '<span class="m-af t-seg ' + style + go + '" aria-hidden="true">' + ch.map((c, i) => {
    const dl = animer ? ' style="animation-delay:' + i * 70 + 'ms"' : "";
    if (estSepAff(c)) return '<i class="sg-sep"></i>';
    const on = SEGMENTS[majAff(c)];
    if (!on) return '<span class="sg-x"' + dl + ">" + esc(c) + "</span>";
    return '<svg viewBox="0 0 44 70"' + dl + '><g transform="translate(5 0) skewX(-6)">' + Object.keys(SEG_R).map(k => { const r = SEG_R[k]; return '<rect x="' + r[0] + '" y="' + r[1] + '" width="' + r[2] + '" height="' + r[3] + '" rx="2.5"' + (on.includes(k) ? ' class="l"' : "") + "/>"; }).join("") + "</g></svg>";
  }).join("") + "</span>";
  if (type === "matrice") return '<span class="m-af t-mat' + go + '" aria-hidden="true">' + ch.map((c, i) => {
    if (estSepAff(c)) return '<i class="mt-sep"></i>';
    const m = MATRICE[majAff(c)] || "0".repeat(35);
    let ronds = ""; for (let k = 0; k < 35; k++) ronds += '<circle cx="' + (k % 5 + .5) + '" cy="' + (Math.floor(k / 5) + .5) + (m[k] === "1" ? '" r=".44" class="l"/>' : '" r=".32"/>');
    return '<svg viewBox="0 0 5 7"' + (animer ? ' style="animation-delay:' + i * 80 + 'ms"' : "") + ">" + ronds + "</svg>";
  }).join("") + "</span>";
  if (type === "ticket") return '<span class="m-af t-ticket' + go + '" aria-hidden="true"><span class="tk-h"><span>' + (aDesChiffres ? "TOTAL" : "VERSUS") + "</span><span>" + (aDesChiffres ? "EUR" : "MOI") + '</span></span><span class="tk-v">' +
    ch.map((c, i) => "<i" + (estSepAff(c) ? ' class="tk-s"' : "") + (animer ? ' style="animation-delay:' + (150 + i * 75) + 'ms"' : "") + ">" + (estSepAff(c) ? "" : esc(c)) + "</i>").join("") + "</span></span>";
  if (type === "billet") return '<span class="m-af t-billet' + go + '" aria-hidden="true"><span class="bl-c">VERSUS</span><span class="bl-v">' + esc(texte.replace(/\s*€$/, "")) + "</span></span>";
  if (type === "carte") return '<span class="m-af t-carte" aria-hidden="true"><span class="ca-puce"></span><span class="ca-v">' + esc(texte) + "</span></span>";
  return "";
}
function flaps(texte, animer, style) {
  let i = 0;
  const st = style || afficheurActif(), def = AFFICHEURS.find(a => a[0] === st), type = def && def[2] ? def[2] : "palette";
  if (type !== "palette") return rendreAff(type, st, texte, animer);
  const af = " af-" + st;
  return Array.from(texte).map(ch => {
    if (estSepAff(ch)) return '<span class="m-flap sep" aria-hidden="true"></span>';
    const cls = (ch === "€" ? "m-flap u" : (ch === MOINS || ch === "+") ? "m-flap s" : "m-flap") + af;
    const delai = animer ? ' style="animation-delay:' + (i++ * 55) + 'ms"' : "";
    return '<span class="' + cls + (animer ? " go" : "") + '"' + delai + ' aria-hidden="true">' + esc(ch) + "</span>";
  }).join("");
}
function marches(txt) {
  if (!txt) return "";
  return txt.split("·").map(p => p.trim()).filter(Boolean).map(p => {
    const on = p.includes("🟢") || /continu/.test(p);
    return '<i class="' + (on ? "on" : "") + '">' + esc(p.replace(/[🟢⚪🌙]/gu, "").replace(/\s+/g, " ").trim()) + "</i>";
  }).join("");
}
function note(txt, type) {
  if (!txt) return "";
  const propre = txt.replace(/^[✓⚠🔔✏️\s]+/u, "").trim();
  return '<div class="m-note ' + type + '"><span class="ic">' + (type === "ok" ? "✓" : type === "warn" ? "!" : "◷") + "</span><span>" + esc(propre).replace(/ +▸ /g, "<br>▸ ") + "</span></div>";
}
function tuile(lab, val, cls, sub, def) {
  return '<div' + (def ? ' class="m-def-t" role="button" tabindex="0" aria-expanded="false"' : "") + '><span class="lab">' + lab + (def ? '<i class="qm" aria-hidden="true">?</i>' : "") + '</span><span class="val ' + (cls || "") + '">' + val + '</span><span class="sub">' + (sub || "&nbsp;") + "</span>" + (def ? '<span class="m-def">' + esc(def) + "</span>" : "") + "</div>";
}
function brancherDefs(v) {
  v.querySelectorAll(".m-def-t").forEach(t => {
    const f = () => { t.classList.toggle("ouvert"); t.setAttribute("aria-expanded", t.classList.contains("ouvert")); };
    t.addEventListener("click", f); t.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); f(); } });
  });
}

/* ================= Onglet Aujourd'hui : la bourse du jour, toutes les lignes visibles d'emblée ================= */
function patrimoineNet() {
  const imm = M.immo || [], s = M.synthese || {};
  const l = imm.find(x => /^Patrimoine net/.test(x.nom));
  return l ? { avecImmo: true, montant: l.montant, note: l.note } : { avecImmo: false, montant: s.financier, note: "" };
}
function lignesTenues() {
  const out = [];
  (M.groupes || []).forEach(g => g.lignes.forEach(l => { if (!l.especes) out.push(Object.assign({ env: g.env }, l)); }));
  return out;
}
function htmlJour() {
  const s = M.synthese || {};
  const texteFlap = ETAT.discret === "oui" ? "•••" + NB + "€" : eur(s.valeur);
  const animer = !reduit && texteFlap !== dernierFlap; dernierFlap = texteFlap;
  const suffixe = (s.jourLibelle || "").replace(/^Variation du jour\s*·?\s*/, "");
  const toutes = lignesTenues();
  const detail = PREF.lignes !== false;
  const tri = detail ? (PREF.tri || "env") : "env";
  const hausse = toutes.filter(l => l.pct > 1e-9).length, baisse = toutes.filter(l => l.pct < -1e-9).length;
  // carte du jour : une tuile par ligne, taille = poids dans le portefeuille, couleur = variation du jour
  const maxP = Math.max(.01, ...toutes.map(l => Math.abs(l.pct || 0)));
  const totalV = toutes.reduce((a, l) => a + (l.valeur || 0), 0) || 1;
  const carte = toutes.slice().sort((a, b) => (b.valeur || 0) - (a.valeur || 0)).map(l =>
    '<button type="button" class="m-tuile" data-aller-ligne="' + esc(l.env + "|" + l.code) + '" style="flex:' + Math.max(1, Math.round((l.valeur || 0) / totalV * 100)) + " 1 calc(" + Math.max(0, ((l.valeur || 0) / totalV * 100) - 2).toFixed(1) + '% - 3px);' + (Math.abs(l.pct || 0) > 1e-9 ? teinte(l.pct, maxP) : "") + '">' +
    "<b>" + esc(l.code) + "</b><span>" + pct(l.pct, 2) + "</span></button>").join("");
  // liste : par enveloppe (en-tête avec le jour de l'enveloppe) ou toutes ensemble triées
  let liste;
  if (tri === "env") {
    liste = (M.groupes || []).map((g, gi) => {
      const t = g.total || {};
      return '<div class="m-env" style="--ce:var(--e' + (gi % 5 + 1) + ')">' + enteteEnv(g.env, t.valeur, t.jour, t.pct, t.pv, t.pvPct) +
        (detail ? g.lignes.filter(l => !l.especes || Math.abs(l.valeur || 0) >= 0.5).map(l => ligneJour(Object.assign({ env: g.env }, l))).join("") : "") + "</div>";
    }).join("") + (detail ? "" : '<div class="m-env total">' + enteteEnv("Portefeuille", s.valeur, s.jour, s.jourPct, s.latente, s.latentePct) + "</div>");
  } else {
    const cle = { poids: l => -(l.valeur || 0), jour: l => -(l.pct || 0), pv: l => -(l.pvPct || 0) }[tri];
    liste = '<div class="m-env">' + toutes.slice().sort((a, b) => cle(a) - cle(b)).map(l => ligneJour(l, true)).join("") + "</div>";
  }
  const indices = (M.indices || []).filter(i => i.nom !== "1 USD en EUR");
  const nomIdx = n => n.replace(/\s*\((ETF\s)?([^)]*)\)/, "");
  return '<div class="m-hero">' +
      '<span class="eyebrow">' + embHero() + 'Bourse aujourd\'hui' + (heureCours() ? " · " + esc(heureCours()) : "") + "</span>" +
      '<div class="m-flaps" role="img" aria-label="' + esc(texteFlap) + '">' + flaps(texteFlap, animer) + "</div>" +
      '<div class="m-jour"><span class="badge big-b ' + sens(s.jour) + '">' + fleche(s.jour) + " " + eur(s.jour, 0, true) + " · " + pct(s.jourPct, 2) + "</span>" +
        "<span>" + (suffixe ? esc(suffixe) : hausse + " en hausse · " + baisse + " en baisse") + "</span></div>" +
    "</div>" +
    bandeDebut(s) +
    '<div class="m-carte" role="group" aria-label="Carte du jour : une tuile par ligne">' + carte + "</div>" +
    blocSignal() +
    "<div>" +
      '<div class="m-tri"><h2 class="sec">' + (detail ? "Mes lignes" : "Mes enveloppes") + "</h2>" +
        '<label class="m-coche"><input type="checkbox" id="m-detail"' + (detail ? " checked" : "") + "> Lignes</label>" +
        (detail ? '<label class="sel"><span>Classer</span><select id="m-tri">' + [["env", "Par enveloppe"], ["jour", "Par variation du jour"], ["poids", "Par montant"], ["pv", "Par plus-value"]].map(([k, l]) => '<option value="' + k + '"' + (tri === k ? " selected" : "") + ">" + l + "</option>").join("") + "</select></label>" : "") + "</div>" +
      liste +
      (detail ? '<p class="info" style="margin-top:6px">Touche une ligne pour ses performances et son prix de revient.</p>' : "") +
    "</div>" +
    (indices.length ? '<div><h2 class="sec">Marchés <small>variation du jour</small></h2><div class="m-idx">' + indices.map(i => '<div><span>' + esc(nomIdx(i.nom)) + '</span><b class="' + sens(i.pct) + '">' + pct(i.pct, 2) + "</b></div>").join("") + "</div></div>" : "") +
    "";
}
function enteteEnv(nom, valeur, jour, jourPct, pv, pvPct) {
  return '<div class="m-env-h"><b>' + esc(nom) + '</b><span class="v">' + eur(valeur) + "</span>" +
    '<span class="pv ' + sens(pv) + '">PV ' + eur(pv, 0, true) + " · " + pct(pvPct) + '</span><span class="j ' + sens(jour) + '">' + eur(jour, 0, true) + " · " + pct(jourPct, 2) + "</span></div>";
}
function heureCours() { return String(M.majTexte || "").replace(/^Cours du /, "").replace(/\s*\(.*\)$/, "").replace(/^.* à /, ""); }
/* « Depuis le début » : bande compacte sous le chiffre du jour, définition au toucher */
const DEFS = {
  gain: "Résultat total : valeur actuelle moins apports nets, ce que tes placements t'ont rapporté ou coûté, frais et ventes compris.",
  latente: "Plus-value latente : écart entre la valeur des lignes encore détenues et leur prix de revient. Elle devient « réalisée » quand tu vends.",
  mwr: "MWR : rendement de ton argent en tenant compte des dates et montants de tes versements. Non annualisé avant un an de recul.",
  twr: "TWR : performance des placements eux-mêmes, sans l'effet de tes versements. C'est elle qu'on compare au S&P 500."
};
function bandeDebut(s) {
  const c = (k, lab, val, cls, sub) => '<button type="button" data-def="' + k + '"><span class="lab">' + lab + '</span><b class="' + cls + '">' + val + "</b><small>" + sub + "</small></button>";
  return '<div class="m-debut-w"><span class="eyebrow">Depuis le début</span><div class="m-debut">' +
    c("gain", "Résultat", eur(s.gain, 0, true), sens(s.gain), pct(s.gainPct)) +
    c("latente", "Latente", eur(s.latente, 0, true), sens(s.latente), pct(s.latentePct)) +
    c("mwr", "MWR", pct(s.mwr), sens(s.mwr), "timing " + esc(s.timing || "—")) +
    c("twr", "TWR", pct(s.twr), sens(s.twr), "S&amp;P " + pct(s.sp500)) +
    '</div><p class="m-def-l" hidden></p></div>';
}
function ligneJour(l, avecEnv) {
  if (l.especes) return '<div class="m-l especes"><div class="g"><b>Espèces</b></div><div class="d"><span class="v">' + eur(l.valeur) + "</span></div></div>";
  return '<div class="m-l" role="button" tabindex="0" aria-expanded="false" data-code="' + esc(l.code) + '" data-env="' + esc(l.env) + '">' +
    '<div class="g"><b>' + esc(l.code) + (avecEnv ? '<span class="tag">' + esc(String(l.env).split(" ")[0]) + "</span>" : "") + "</b><small>" + esc(l.nom || "") + "</small></div>" +
    '<div class="d"><span class="badge ' + sens(l.pct) + '">' + pct(l.pct, 2) + '</span><small class="' + sens(l.jour) + '">' + eur(l.jour, 0, true) + "</small></div>" +
    '<div class="b"><span>' + cours(l.cours) + "</span><span>" + eur(l.valeur) + ' <i>' + pct(l.poids, 0, false) + '</i></span><span class="' + sens(l.pv) + '">PV ' + eur(l.pv, 0, true) + " · " + pct(l.pvPct) + "</span></div>" +
    "</div>";
}
function basculerLigne(el) {
  const ouvert = el.querySelector(".m-ligne-det");
  if (ouvert) { ouvert.remove(); el.setAttribute("aria-expanded", "false"); return; }
  const env = el.dataset.env, code = el.dataset.code;
  const p = (M.perfLignes || {})[env + "|" + code] || {};
  const pos = (((M.ref || {}).detenu) || []).find(d => d.env === env && d.code === code) || {};
  const l = lignesTenues().find(x => x.env === env && x.code === code) || {};
  const m = (lab, v) => "<div><span>" + lab + '</span><b class="' + sens(v) + '">' + pct(v) + "</b></div>";
  const e = (lab, v, sig) => "<div><span>" + lab + '</span><b class="' + (sig ? sens(v) : "") + '">' + (ok(v) ? eur(v, 2, sig) : "—") + "</b></div>";
  const d = document.createElement("div");
  d.className = "m-ligne-det";
  d.innerHTML = '<div class="mini">' + m("1 semaine", p.s1) + m("1 mois", p.m1) + m("6 mois", p.m6) + m("Depuis janv.", p.ytd) + m("1 an", p.a1) +
    "<div><span>Quantité × PRU</span><b>" + qte(l.qte) + " × " + cours(l.pru) + "</b></div>" +
    e("Coût de revient", pos.cout) + e("Plus-value réalisée", pos.pvr, true) + e("Frais payés", pos.frais) +
    '<p style="grid-column:1/-1;margin:0;font-size:12px;color:var(--ink-2)">' + (p.ticker ? "Performance du cours (" + esc(p.ticker) + "), indépendante de tes dates d'achat." : "Pas de cotation Google Finance pour cette ligne : performances du cours indisponibles.") + "</p>" +
    '<p class="m-actions"><button class="mini-btn" type="button" data-ordre="Achat">Acheter</button><button class="mini-btn" type="button" data-ordre="Vente">Vendre</button><button class="mini-btn" type="button" data-alerte="1">Alerte de cours</button></p></div>';
  el.appendChild(d);
  d.querySelectorAll("[data-ordre]").forEach(b => b.addEventListener("click", ev => { ev.stopPropagation(); ouvrirSaisieM({ type: b.dataset.ordre, env: env, actif: code }); }));
  d.querySelector("[data-alerte]").addEventListener("click", ev => {
    ev.stopPropagation();
    const c = (refData().cours || {})[code];
    alertePre = { code: code, seuil: c ? saisieNombre(c, c < 10 ? 2 : 0) : "" };
    reglageOuvert = null; ouvrirSaisieM(null, "maj");
    setTimeout(() => { const el2 = document.querySelector('#m-pane-maj [data-reg="alertes"]'); if (el2) el2.scrollIntoView({ block: "start" }); }, 40);
  });
  el.setAttribute("aria-expanded", "true");
}
function alertesDeclenchees() {
  const r = M.ref || {}, out = [];
  (M.alertes || []).forEach(a => {
    let c = (r.cours || {})[a.code];
    (M.groupes || []).forEach(g => g.lignes.forEach(l => { if (l.code === a.code && l.cours) c = l.cours; }));
    if (c && (a.sens === "sous" ? c < a.seuil : c > a.seuil)) out.push(a.code + (a.sens === "sous" ? " est passé sous " : " a dépassé ") + cours(a.seuil) + " (cours " + cours(c) + ")");
  });
  return out;
}
function brancherJour(v) {
  brancherDefs(v); brancherSignal(v);
  v.querySelectorAll(".m-l[data-code]").forEach(el => {
    el.addEventListener("click", e => { if (!e.target.closest(".m-ligne-det")) basculerLigne(el); });
    el.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && e.target === el) { e.preventDefault(); basculerLigne(el); } });
  });
  v.querySelectorAll("[data-aller-ligne]").forEach(b => b.addEventListener("click", () => {
    const [env, code] = b.dataset.allerLigne.split("|");
    const el = Array.from(v.querySelectorAll(".m-l[data-code]")).find(x => x.dataset.env === env && x.dataset.code === code);
    if (!el) return;
    if (!el.querySelector(".m-ligne-det")) basculerLigne(el);
    el.scrollIntoView({ block: "center", behavior: reduit ? "auto" : "smooth" });
    el.classList.add("eclair"); setTimeout(() => el.classList.remove("eclair"), 1200);
  }));
  const t = v.querySelector("#m-tri"); if (t) t.addEventListener("change", () => { PREF.tri = t.value; garderPref(); rendre(); });
  const dt = v.querySelector("#m-detail"); if (dt) dt.addEventListener("change", () => { PREF.lignes = dt.checked; garderPref(); rendre(); });
  const def = v.querySelector(".m-def-l");
  v.querySelectorAll("[data-def]").forEach(b => b.addEventListener("click", () => {
    const on = b.getAttribute("aria-pressed") !== "true";
    v.querySelectorAll("[data-def]").forEach(x => x.setAttribute("aria-pressed", "false"));
    b.setAttribute("aria-pressed", String(on)); def.hidden = !on; def.textContent = on ? DEFS[b.dataset.def] : "";
  }));
}

/* ================= Onglet Patrimoine ================= */
function htmlPatrimoine() {
  const s = M.synthese || {}, imm = M.immo || [], ep = M.epargne || [], sup = M.supports || [], fis = M.fiscalite || [];
  const net = patrimoineNet();
  const immoNet = (imm.find(x => /^Valeur nette/.test(x.nom)) || {}).montant || 0;
  const parts = [["Épargne", s.epargne || 0, "--s2", "p-epargne"]].concat(net.avecImmo ? [["Immobilier net", immoNet, "--s3", "p-immo"]] : []).concat([["Bourse", s.valeur || 0, "--s1", "p-bourse"]]);
  const tot = parts.reduce((a, p) => a + Math.max(0, p[1]), 0) || 1;
  const envs = (M.enveloppes || []).filter(e => e.type === "env");
  const liste = (rows, f) => '<div class="m-liste">' + rows.map(f).join("") + "</div>";
  const rEnv = e => '<div class="r"><span class="a">' + esc(e.nom) + '</span><span class="b">' + eur(e.valeur) + "</span>" +
    '<span class="c">Résultat ' + pct(e.gainPct) + " · TWR " + pct(e.twr) + '</span><span class="d ' + sens(e.gain) + '">' + eur(e.gain, 0, true) + "</span></div>";
  const rEp = r => { const t = /^Total/.test(r.nom);
    return '<div class="r' + (t ? " total" : "") + '"><span class="a">' + esc(r.nom) + '</span><span class="b">' + eur(r.solde) + "</span>" +
      (M.simple ? '<span class="c">' + (t ? "tous tes comptes" : esc(r.type || "") + " · saisi le " + frDate(r.date)) + '</span><span class="d"></span></div>'
      : '<span class="c">' + (t ? "Intérêts acquis " + eur(r.acquis) : "Taux moyen " + pct(r.taux, 2, false) + (r.fiscal && r.fiscal !== "—" ? " · fiscalité allégée le " + esc(r.fiscal) : "")) + "</span>" +
      '<span class="d">fin d\'année ≈ ' + eur(r.fin31) + "</span></div>"); };
  const rSup = r => { const t = /^Total/.test(r.nom);
    return '<div class="r' + (t ? " total" : "") + '"><span class="a">' + esc(r.nom) + '</span><span class="b">' + eur(r.valeur) + "</span>" +
      '<span class="c">' + (r.note ? esc(r.note) : "Investi " + eur(r.investi)) + '</span><span class="d ' + sens(r.pv) + '">' + eur(r.pv, 2, true) + " · " + pct(r.pvPct, 2) + "</span></div>"; };
  const rImm = r => { const t = /^Patrimoine net/.test(r.nom);
    return '<div class="r' + (t ? " total" : "") + '"><span class="a">' + esc(r.nom) + '</span><span class="b">' + eur(r.montant) + "</span>" +
      (r.note ? '<span class="c" style="grid-column:1/-1">' + esc(r.note) + "</span>" : "") + "</div>"; };
  const rFis = r => { const t = r.nom === "Portefeuille";
    return '<div class="r' + (t ? " total" : "") + '"><span class="a">' + esc(r.nom) + '</span><span class="b ' + sens(r.gainNet) + '">' + eur(r.gainNet, 0, true) + "</span>" +
      '<span class="c">' + (r.fiscal && r.fiscal !== "—" ? "Fiscalité allégée le " + esc(r.fiscal) : t ? "Après impôt estimé" : "Pas d'avantage fiscal de durée") + '</span><span class="d">impôt ≈ ' + eur(r.impot) + "</span></div>"; };
  const bloc = (id, c, titre, sous, contenu) => '<section class="m-bloc" id="' + id + '" style="--c:var(' + c + ')"><h2 class="sec">' + titre + " <small>" + sous + "</small></h2>" + contenu + "</section>";
  return '<div class="hero"><span class="eyebrow">' + (net.avecImmo ? "Patrimoine net (avec immobilier)" : "Patrimoine financier") + '</span><span class="m-big">' + eur(net.montant) + '</span><div class="sous">' + esc(net.note || "") + "</div></div>" +
    '<div><div class="stack" role="img" aria-label="Répartition du patrimoine">' + parts.map(p => '<i style="flex:' + Math.max(p[1], 0) + ";background:var(" + p[2] + ')"></i>').join("") + "</div>" +
      '<div class="m-leg3">' + parts.map(p => '<button type="button" data-cible="' + p[3] + '"><i style="background:var(' + p[2] + ')"></i><span>' + p[0] + '</span><span class="num">' + eur(p[1]) + '</span><span class="pc">' + pct(p[1] / tot, 0, false) + "</span></button>").join("") + "</div></div>" +
    bloc("p-epargne", "--s2", "Épargne", esc(s.epargneLibelle || ""), liste(ep, rEp) + (sup.length ? '<h3 class="m-sous">Assurance-vie · supports</h3>' + liste(sup, rSup) : "")) +
    (net.avecImmo ? bloc("p-immo", "--s3", "Immobilier", "prix d'achat, prêts restants", pretHtml() + liste(imm, rImm)) : "") +
    bloc("p-bourse", "--s1", "Bourse", "portefeuille", liste(envs, rEnv)) +
    (fis.length ? acc("m-fis", "Si tout était retiré", "résultat net d'impôt estimé", liste(fis, rFis), false) : "");
}
function pretHtml() {
  const p = M.prets;
  if (!p || (!p.prochaine && !p.actuel)) return "";
  const cell = (lab, val, sous) => "<div><span>" + lab + "</span><b>" + val + "</b>" + (sous ? "<small>" + sous + "</small>" : "") + "</div>";
  return '<div class="m-pret">' +
    (p.prochaine ? cell("Prochaine échéance", eur(p.prochaine.echeance, 2), "le " + frDate(p.prochaine.date) + " · hors assurance") : "") +
    (p.actuel ? cell("Capital restant dû", eur(p.actuel.restant), "après l'échéance du " + frDate(p.actuel.date)) : "") +
    cell("Intérêts payés en " + new Date().getFullYear(), eur(p.interetsAnnee), "prêt classique") +
    (p.fin ? cell("Fin des prêts", frDate(p.fin), p.interetsRestants ? "encore " + eur(p.interetsRestants) + " d'intérêts" : "") : (p.prochaine ? cell("Après la prochaine", eur(p.prochaine.restant), "restant dû") : "")) +
    "</div>";
}
function seriePatrimoine() {
  const mpm = M.moisParMois || [];
  const app = (M.parametres || {}).appart || null;
  const mens = (M.prets || {}).mensuel || [];
  const MOISN = { "janv.": 1, "févr.": 2, "mars": 3, "avr.": 4, "mai": 5, "juin": 6, "juil.": 7, "août": 8, "sept.": 9, "oct.": 10, "nov.": 11, "déc.": 12 };
  return mpm.map(r => {
    let an, mo;
    if (/^\d{4}-\d{2}/.test(String(r.mois))) { an = +String(r.mois).slice(0, 4); mo = +String(r.mois).slice(5, 7); }
    else { const p = String(r.mois).split(" "); mo = MOISN[p[0]]; an = +p[1]; }
    if (!an || !mo) return null;
    const finIso = isoJour(new Date(an, mo, 0));
    let immo = 0;
    if (app && app.prix && app.date && finIso >= app.date) {
      let restant = null;
      mens.forEach(x => { if (x[0] <= finIso) restant = x[1]; });
      if (mens.length) immo = app.prix - (restant === null ? mens[0][1] : restant);
      else immo = ((M.immo || []).find(x => /^Valeur nette/.test(x.nom)) || {}).montant || 0;
    }
    const bourse = r.bourse || 0, epargne = (r.epargne || 0) + (r.uc || 0);
    return { an, mo, bourse, epargne, immo, complet: r.epargne !== null && r.epargne !== undefined, total: bourse + epargne + immo };
  }).filter(Boolean);
}
function graduations(mn, mx, n) {
  const brut = (mx - mn) / n || 1, p = Math.pow(10, Math.floor(Math.log10(brut)));
  const pas = [1, 2, 2.5, 5, 10].map(x => x * p).find(x => x >= brut) || 10 * p;
  const a = Math.floor(mn / pas) * pas, b = Math.ceil(mx / pas) * pas;
  const t = []; for (let v = a; v <= b + pas / 2; v += pas) t.push(+v.toFixed(6));
  return t;
}
function brancherPatrimoine(v) {
  v.querySelectorAll("[data-cible]").forEach(b => b.addEventListener("click", () => { const c = document.getElementById(b.dataset.cible); if (c) c.scrollIntoView({ block: "start", behavior: reduit ? "auto" : "smooth" }); }));
}

/* ================= Onglet Stats ================= */
const PERIODES_M = [["1m", "1 mois"], ["3m", "3 mois"], ["6m", "6 mois"], ["ytd", "Depuis janv."], ["1a", "1 an"], ["tout", "Tout"]];
function seriesDisponibles() {
  const noms = (M.enveloppes || []).filter(e => e.type === "env").map(e => e.nom);
  const cols = (M.historique || {}).cols || [];
  const out = [["ip", "Portefeuille"]];
  [["pea", /PEA/], ["cto", /CTO/], ["av", /^AV/], ["cr", /Crypto/i]].forEach(([k, re]) => { const n = noms.find(x => re.test(x)); if (n && cols.includes(k)) out.push([k, n]); });
  return out;
}
function fenetre(rows, per) {
  if (!rows.length || per === "tout") return rows;
  const fin = dateNum(rows[rows.length - 1][0]);
  const debut = per === "ytd" ? new Date(fin.getFullYear() - 1, 11, 31) : new Date(fin.getFullYear(), fin.getMonth() - ({ "1m": 1, "3m": 3, "6m": 6, "1a": 12 }[per] || 6), fin.getDate());
  const cle = debut.getFullYear() * 10000 + (debut.getMonth() + 1) * 100 + debut.getDate();
  let i0 = 0; rows.forEach((r, i) => { if (r[0] <= cle) i0 = i; });
  return rows.slice(i0);
}
function htmlStats() {
  const h = M.historique, envs = M.enveloppes || [];
  const mode = PREF.mode, per = PREF.per, choix = seriesDisponibles();
  const derniere = h && h.rows && h.rows.length ? dateNum(h.rows[h.rows.length - 1][0]) : null;
  const perfLigne = e => '<tr class="' + (e.type === "indice" ? "indice" : "") + '"><td>' + esc(e.nom) + "</td>" +
    ["s1", "m1", "m6", "ytd", "a1", "twr", "mwr"].map(k => '<td class="' + (e.type === "indice" ? "" : sens(e[k])) + '">' + pct(e[k]) + "</td>").join("") + "<td>" + pct(e.vol, 1, false) + "</td></tr>";
  const courbe = h && h.rows && h.rows.length > 1 ?
    '<div class="seg" role="group" aria-label="Type de courbe"><button type="button" data-m-mode="valeur" aria-pressed="' + (mode === "valeur") + '">Valeur et apports</button><button type="button" data-m-mode="base" aria-pressed="' + (mode === "base") + '">Performance vs indices</button></div>' +
    (mode === "base" && choix.length > 1 ? '<div class="chips" role="group" aria-label="Ce que tu compares">' + choix.map(([k, l]) => '<button class="chip" type="button" data-m-serie="' + k + '" aria-pressed="' + (PREF.serie === k) + '">' + esc(l) + "</button>").join("") + "</div>" : "") +
    '<div class="chips" role="group" aria-label="Période">' + PERIODES_M.map(([k, l]) => '<button class="chip" type="button" data-m-per="' + k + '" aria-pressed="' + (per === k) + '">' + l + "</button>").join("") + "</div>" +
    '<div id="m-courbe-box"></div><p class="resume" id="m-resume"></p>' : '<div class="vide">Pas encore assez de relevés pour tracer une courbe.</div>';
  const pf = envs.find(e => e.type === "total") || envs[0] || {};
  const resume = ["m1", "ytd", "twr"].map((k, i) => '<span>' + ["1 mois", "janv.", "début"][i] + ' <b class="' + sens(pf[k]) + '">' + pct(pf[k]) + "</b></span>").join("");
  return blocJours() +
    '<div><h2 class="sec">Courbe <small>' + (derniere ? "relevé du " + dateLongue(derniere) : "") + "</small></h2></div>" + courbe +
    '<details class="acc m-compact" data-acc="m-perf"' + (PREF.acc["m-perf"] ? " open" : "") + '><summary><span class="t">Performances</span><span class="m-cp-r">' + resume + "</span></summary>" +
      '<div><div class="scroll-x"><table class="tab m-perf-t"><thead><tr><th>Enveloppe</th><th>1 sem.</th><th>1 mois</th><th>6 mois</th><th>Janv.</th><th>1 an</th><th>Début</th><th>MWR</th><th>Vol.</th></tr></thead><tbody>' + envs.map(perfLigne).join("") + "</tbody></table></div></div></details>" +
    blocPatrimoineTemps() + blocEpargneTemps() + blocPret() +
    (M.simple ? blocMois() : blocRisque() + blocMois() + blocRepartition() + blocFrais());
}
function dessinerCourbe() {
  const zone = document.getElementById("m-courbe-box"); if (!zone) return;
  const h = M.historique; if (!h || !h.rows || h.rows.length < 2) return;
  const C = n => h.cols.indexOf(n);
  const rows = fenetre(h.rows, PREF.per), mc = couleurMoi(), cb = defObj("courbe", actifM("courbe")) || COURBES_M[0];
  let series;
  if (PREF.mode === "valeur") {
    series = [{ nom: "Valeur", k: C("v"), c: cb[2] || mc, w: 2.2, aire: true, fx: cb[3] }, { nom: "Apports cumulés", k: C("a"), c: "var(--idx)", w: 1.6, marche: true, dash: true }];
  } else {
    const ch = seriesDisponibles().find(x => x[0] === PREF.serie) || ["ip", "Portefeuille"];
    series = [{ nom: ch[1], k: C(ch[0]) >= 0 ? C(ch[0]) : C("ip"), c: cb[2] || mc, w: 2.2, base: true, fx: cb[3] },
      { nom: "S&P 500", k: C("isp"), c: "var(--idx)", w: 1.6, base: true, dash: "5 4" },
      { nom: "Nasdaq-100", k: C("inq"), c: "var(--gold)", w: 1.6, base: true, dash: "1.5 3.5" }];
  }
  series = series.filter(s => s.k >= 0);
  series.forEach(s => { const b = rows[0][s.k] || 1; s.v = rows.map(r => ok(r[s.k]) ? (s.base ? r[s.k] / b - 1 : r[s.k]) : null); });
  zone.innerHTML = boiteGraphe("g-moi", series.map(s => ({ nom: s.nom, c: s.c, dash: s.dash === "1.5 3.5" ? "dot" : !!s.dash })));
  const court = PREF.per === "1m";
  const etiqX = (k, kp) => {
    if (kp === null) return "";
    const d = dateNum(k), p = dateNum(kp);
    if (court) return d.getDay() < p.getDay() ? dateCourte(d) : "";
    return d.getMonth() !== p.getMonth() ? (d.getMonth() === 0 ? String(d.getFullYear()) : MOIS[d.getMonth()]) : "";
  };
  const base = PREF.mode === "base";
  tracer(document.getElementById("g-moi"), { x: rows.map(r => r[0]), zeroMin: !base, base, finEtiq: base,
    series: series.map(s => ({ nom: s.nom, v: s.v, c: s.c, w: s.w, aire: s.aire, marche: s.marche, dash: s.dash, fx: s.fx })),
    fmt: base ? (x => pct(x)) : (x => eur(x)), fmtAxe: base ? (t => pct(t, 0)) : axeEur, titreX: k => dateLongue(dateNum(k)), etiqX });
  const n = rows.length, d0 = dateNum(rows[0][0]), d1 = dateNum(rows[n - 1][0]);
  const r = document.getElementById("m-resume");
  if (!base) {
    const dv = series[0].v[n - 1] - series[0].v[0], da = series[1] ? series[1].v[n - 1] - series[1].v[0] : 0;
    r.innerHTML = "Du " + dateLongue(d0) + " au " + dateLongue(d1) + " : valeur <b>" + eur(dv, 0, true) + "</b>, dont apports <b>" + eur(da, 0, true) + '</b>, soit un gain de <b class="' + sens(dv - da) + '">' + eur(dv - da, 0, true) + "</b>.";
  } else {
    const p = series[0].v[n - 1], sp = series[1] ? series[1].v[n - 1] : null;
    r.innerHTML = "Du " + dateLongue(d0) + " au " + dateLongue(d1) + ' : <b class="' + sens(p) + '">' + pct(p) + "</b>" +
      (ok(sp) ? ", S&amp;P 500 <b>" + pct(sp) + '</b>, écart <b class="' + sens(p - sp) + '">' + pts(p - sp) + "</b>" : "") + ". Indices rebasés au début de la période, apports neutralisés.";
  }
}
function blocRisque() {
  const h = M.historique; if (!h || !h.rows || h.rows.length < 2) return "";
  const k = h.cols.indexOf("ip"); if (k < 0) return "";
  let max = -Infinity, dateMax = null, pire = 0, datePire = null, dateHaut = null;
  h.rows.forEach(r => { if (r[k] > max) { max = r[k]; dateMax = r[0]; } const dd = r[k] / max - 1; if (dd < pire) { pire = dd; datePire = r[0]; dateHaut = dateMax; } });
  const actuel = h.rows[h.rows.length - 1][k] / max - 1;
  const pf = (M.enveloppes || []).find(e => e.type === "total") || {}, sp = (M.synthese || {}).sp500;
  const dc = n => dateCourte(dateNum(n)) + "/" + String(n).slice(2, 4);
  return '<div><h2 class="sec">Risque <small>portefeuille, relevés du soir</small></h2></div><div class="tuiles">' +
    tuile("Baisse actuelle", pct(actuel), sens(actuel), actuel > -0.0005 ? "au plus haut" : "depuis le plus haut du " + dc(dateMax)) +
    tuile("Pire baisse", pct(pire), "down", datePire ? "du " + dc(dateHaut) + " au " + dc(datePire) : "—") +
    tuile("Volatilité 1 an", pct(pf.vol, 1, false), "", "écart type annualisé") +
    tuile("Sharpe 1 an", ok(pf.sharpe) ? F2.format(pf.sharpe) : "—", sens(pf.sharpe), "rendement / risque, &gt; 1 = bon") +
    tuile("Jours en hausse", pct(pf.hausse, 0, false), "", "sur les 12 derniers mois") +
    tuile("Écart avec le S&amp;P 500", ok(pf.twr) && ok(sp) ? pts(pf.twr - sp) : "—", sens(pf.twr - sp), "depuis le début (TWR)") +
    "</div>";
}
function joursRecords() {
  const h = M.historique; if (!h || !h.rows || h.rows.length < 2) return [];
  const ki = h.cols.indexOf("ip"), kv = h.cols.indexOf("v"), ka = h.cols.indexOf("a"), out = [];
  for (let i = 1; i < h.rows.length; i++) {
    const a = h.rows[i - 1], b = h.rows[i];
    if ((dateNum(b[0]) - dateNum(a[0])) / 864e5 > 4.5 || !(a[ki] > 0) || !(b[ki] > 0)) continue;
    out.push({ j: b[0], p: b[ki] / a[ki] - 1, e: (b[kv] - a[kv]) - (b[ka] - a[ka]) });
  }
  return out;
}
function blocJours() {
  const l = joursRecords(); if (l.length < 5) return "";
  const tri = l.slice().sort((x, y) => y.p - x.p), best = tri.slice(0, 5), pire = tri.slice(-5).reverse();
  const date = j => dateLongue(dateNum(j));
  const liste = (titre, xs) => "<div><b>" + titre + "</b>" + xs.map((x, i) => '<div class="l"><span>' + (i + 1) + ". " + date(x.j) + '</span><span class="' + sens(x.p) + '">' + pct(x.p, 2) + '</span><span class="' + sens(x.e) + '">' + eur(x.e, 0, true) + "</span></div>").join("") + "</div>";
  const pastille = (lib, x, cls) => '<span class="m-jc-p ' + cls + '"><i>' + lib + '</i><b>' + pct(x.p, 2) + "</b><small>" + dateCourte(dateNum(x.j)) + "/" + String(x.j).slice(2, 4) + " · " + eur(x.e, 0, true) + "</small></span>";
  return '<details class="acc m-compact m-jc" data-acc="m-jours"' + (PREF.acc["m-jours"] ? " open" : "") + "><summary>" + pastille("▲ Meilleur jour", best[0], "up") + pastille("▼ Pire jour", pire[0], "down") + "</summary>" +
    '<div><div class="m-jr">' + liste("Top 5", best) + liste("Flop 5", pire) + "</div>" +
    '<p class="info">Sur ' + l.length + " jours de bourse, classés en performance (sans l'effet de tes versements). Le montant en euros dépend de la taille du portefeuille ce jour-là.</p></div></details>";
}
function moisParMois() {
  const h = M.historique; if (!h || !h.rows || h.rows.length < 2) return [];
  const kv = h.cols.indexOf("v"), ka = h.cols.indexOf("a"), ki = h.cols.indexOf("ip");
  const fins = [];
  h.rows.forEach((r, i) => { const m = Math.floor(r[0] / 100), s = h.rows[i + 1]; if (!s || Math.floor(s[0] / 100) !== m) fins.push(r); });
  let prec = null;
  return fins.map(r => {
    const twr = prec ? r[ki] / prec[ki] - 1 : r[ki] / h.rows[0][ki] - 1;
    const eurM = prec ? (r[kv] - prec[kv]) - (r[ka] - prec[ka]) : r[kv] - r[ka];
    prec = r;
    return { an: Math.floor(r[0] / 10000), mois: Math.floor(r[0] / 100) % 100, twr, eur: eurM };
  });
}
function blocMois() {
  const m = moisParMois(); if (!m.length) return "";
  const enEur = PREF.moisMode === "eur";
  const ans = Array.from(new Set(m.map(x => x.an))).sort().reverse();
  const maxP = Math.max(.04, ...m.map(x => Math.abs(x.twr))), maxE = Math.max(500, ...m.map(x => Math.abs(x.eur)));
  const lignes = ans.map(an => {
    const ms = m.filter(x => x.an === an);
    const tot = ms.reduce((p, x) => p * (1 + x.twr), 1) - 1, totE = ms.reduce((p, x) => p + x.eur, 0);
    return '<tr><td class="nom">' + an + "</td>" + MOIS.map((nm, i) => {
      const x = ms.find(y => y.mois === i + 1);
      if (!x) return '<td class="vide">·</td>';
      const det = esc("<b>" + MOIS_L[i] + " " + an + "</b> : " + pct(x.twr) + " (TWR) · résultat " + eur(x.eur, 0, true));
      return '<td class="m-c" tabindex="0" style="' + teinte(enEur ? x.eur : x.twr, enEur ? maxE : maxP) + '" data-cel="' + det + '">' + (enEur ? kEur(x.eur) : pct(x.twr)) + "</td>";
    }).join("") + '<td style="' + teinte(enEur ? totE : tot, enEur ? maxE * 3 : maxP * 3) + '"><b>' + (enEur ? kEur(totE) : pct(tot)) + "</b></td></tr>";
  }).join("");
  return '<div><h2 class="sec">Mois par mois <small>' + (enEur ? "résultat en euros" : "TWR, sans l'effet des versements") + "</small></h2></div>" +
    '<div class="seg" role="group" aria-label="Unité"><button type="button" data-m-mois="pct" aria-pressed="' + !enEur + '">Performance (%)</button><button type="button" data-m-mois="eur" aria-pressed="' + enEur + '">Résultat (€)</button></div>' +
    '<div class="scroll-x"><table class="grille"><thead><tr><th></th>' + MOIS.map(x => "<th>" + x + "</th>").join("") + "<th>Année</th></tr></thead><tbody>" + lignes + "</tbody></table></div>" +
    '<p class="resume" id="m-mois-sel">Touche un mois pour le détail.</p>';
}
function blocRepartition() {
  const rep = PREF.rep || "classe";
  const actifs = (M.ref || {}).actifs || [];
  const info = c => actifs.find(a => a.code === c) || {};
  const cle = { classe: l => info(l.code).classe || "Non classé", zone: l => info(l.code).zone || "Non renseignée", ligne: l => l.code, levier: l => { const v = Number(info(l.code).levier) || 1; return v > 1 ? "Levier ×" + v : "Sans levier"; } }[rep] || (l => l.code);
  const groupes = {};
  (M.groupes || []).forEach(g => g.lignes.forEach(l => { if (!l.especes && l.valeur > 0) { const k = cle(l); groupes[k] = (groupes[k] || 0) + l.valeur; } }));
  const tot = Object.values(groupes).reduce((a, b) => a + b, 0) || 1;
  const tri = Object.entries(groupes).sort((a, b) => b[1] - a[1]);
  if (!tri.length) return "";
  const max = tri[0][1];
  return '<div><h2 class="sec">Répartition <small>lignes du portefeuille</small></h2></div>' +
    '<div class="chips" role="group" aria-label="Répartir par">' + [["classe", "Classe"], ["zone", "Zone"], ["ligne", "Ligne"], ["levier", "Levier"]].map(([k, l]) => '<button class="chip" type="button" data-m-rep="' + k + '" aria-pressed="' + (rep === k) + '">' + l + "</button>").join("") + "</div>" +
    '<div class="m-rep">' + tri.map(([k, v]) => '<div><span class="n">' + esc(k) + '</span><span class="b"><i style="width:' + (v / max * 100).toFixed(1) + '%"></i></span><span class="p">' + pct(v / tot, 1, false) + '</span><span class="e">' + eur(v) + "</span></div>").join("") + "</div>";
}
function blocFrais() {
  const f = M.frais || []; if (!f.length) return "";
  const tot = f.find(r => /^Total/.test(r.nom));
  return acc("m-frais", "Frais payés", tot ? eur(tot.total, 0) + " au total" : "courtage, gestion", '<div class="m-liste">' +
    f.map(r => '<div class="r' + (/^Total/.test(r.nom) ? " total" : "") + '"><span class="a">' + esc(r.nom) + '</span><span class="b">' + eur(r.total, 2) + "</span>" +
      '<span class="c">cette année ' + eur(r.annee, 2) + '</span><span class="d">' + pct(r.pct, 2, false) + " des versements</span></div>").join("") + "</div>", false);
}
function brancherStats(v) {
  brancherDefs(v);
  const re = () => { rendre(); };
  v.querySelectorAll("[data-m-mode]").forEach(b => b.addEventListener("click", () => { PREF.mode = b.dataset.mMode; garderPref(); re(); }));
  v.querySelectorAll("[data-m-per]").forEach(b => b.addEventListener("click", () => { PREF.per = b.dataset.mPer; garderPref(); re(); }));
  v.querySelectorAll("[data-m-serie]").forEach(b => b.addEventListener("click", () => { PREF.serie = b.dataset.mSerie; garderPref(); re(); }));
  v.querySelectorAll("[data-m-mois]").forEach(b => b.addEventListener("click", () => { PREF.moisMode = b.dataset.mMois; garderPref(); re(); }));
  v.querySelectorAll("[data-m-rep]").forEach(b => b.addEventListener("click", () => { PREF.rep = b.dataset.mRep; garderPref(); re(); }));
  v.querySelectorAll("td[data-cel]").forEach(td => {
    const f = () => { v.querySelectorAll("td.m-c.sel").forEach(x => x.classList.remove("sel")); td.classList.add("sel"); v.querySelector("#m-mois-sel").innerHTML = td.dataset.cel; };
    td.addEventListener("click", f); td.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); f(); } });
  });
  const g = v.querySelector(".grille"); if (g) { const sx = g.closest(".scroll-x"); if (sx) sx.scrollLeft = sx.scrollWidth; }
  v.querySelectorAll("[data-m-patri]").forEach(b => b.addEventListener("click", () => { PREF.patri = b.dataset.mPatri; garderPref(); re(); }));
  dessinerCourbe(); dessinerPatrimoine(); dessinerEpargne(); dessinerPret();
}

/* ================= Signal levier Nasdaq (repris tel quel de Cote V5.6 : mêmes données, mêmes règles, mêmes textes) ================= */
let signalOuvert = false;
function blocSignal() {
  const g = M.signal;
  if (!g || !g.position) return "";
  const NNBSP = NB;
  const cls = !g.expose ? "hors" : g.reduit ? "x1" : g.creux ? "creux" : "x2";
  const court = s => s ? s.slice(8, 10) + "/" + s.slice(5, 7) + "/" + s.slice(2, 4) : "—";
  const p = v => v === null || v === undefined ? "—" : pct(v / 100);
  const p1 = v => v === null || v === undefined ? "—" : F1.format(v) + NNBSP + "%";
  const coche = ok2 => ok2 === null || ok2 === undefined ? '<i class="ck">?</i>' : ok2 ? '<i class="ck up">✓</i>' : '<i class="ck down">✕</i>';
  const qm = '<button type="button" class="qm-b" aria-label="Que veut dire cette donnée ?">?</button>';
  const aide = t => t ? '<span class="aide">' + t + "</span>" : "";
  const qmCase = k => '<button type="button" class="qm-b" data-case="' + k + '" aria-label="Que veut dire cette donnée ?">?</button>';
  const cell = (lab, val, c, sub, k) => '<span class="pc-c"><span class="lab">' + lab + (k ? qmCase(k) : "") + '</span><span class="val ' + (c || "") + '">' + val + '</span><span class="sub">' + sub + "</span></span>";
  const ligne = (a, b, c, bCls, ex) => '<div class="r" data-aide><span class="a">' + a + (ex ? qm : "") + '</span><span class="b ' + (bCls || "") + '">' + b + "</span>" + (c ? '<span class="c" style="grid-column:1/-1">' + c + "</span>" : "") + (ex ? '<span class="c aide-l" style="grid-column:1/-1">' + aide(ex) + "</span>" : "") + "</div>";
  const EX = {
    distance: "Écart entre le Nasdaq-100 (dernière clôture) et le seuil qui déclencherait un ordre. En position, ce seuil est la vente : la moyenne mobile 45 semaines (EMA) moins 5 %. +11 % veut dire que le Nasdaq peut encore baisser d'environ 11 % avant un signal de vente. Hors marché, c'est la distance au seuil d'achat (l'EMA) : un chiffre négatif veut dire qu'il est encore en dessous.",
    vol: "Amplitude des variations quotidiennes du Nasdaq sur les 20 dernières séances, ramenée à l'année. Au-dessus de 30 %, la règle passe en ×1, parce qu'un ETF à levier perd beaucoup quand le marché secoue. Elle ne revient au levier que sous 25 %, pour éviter les allers-retours. Un marché calme est autour de 15 à 20 %.",
    depuis: "Date du dernier changement d'exposition (entrée en position ou sortie du marché) et variation du Nasdaq depuis cette date. Une bascule ×2 ↔ ×1 ne remet pas ce compteur à zéro.",
    cto: "Ce que la même règle dit pour le compte-titres, le même jour que le PEA : QQQ3 (×3) en position, Nasdaq-100 ×1 quand l'alarme de volatilité est allumée, or quand le signal est hors marché (au lieu du cash du PEA). Au CTO, chaque bascule est une vente imposée à 31,4 % sur la plus-value.",
    apport: "Où placer l'argent nouveau du mois selon la formule d'espérance du Pine : ×1 (ETF Nasdaq au PEA), ×2 (LQQ au PEA) ou ×3 (QQQ3 au CTO), après impôt. Ça ne change rien à ce que tu détiens déjà : c'est seulement pour le nouvel argent.",
    verdict: "Le levier qui donne le meilleur rendement attendu après impôt avec la croissance (μ), la volatilité (σ) et le taux (r) du jour. « Avance » = écart avec le deuxième meilleur choix : sous 1 point par an, les deux se valent. Hors marché, la règle prime : pas d'apport en actions (cash au PEA, or au CTO).",
    donnees: "μ : croissance annuelle de fond du Nasdaq, mesurée par la pente des 5 dernières années, dividendes compris. C'est l'hypothèse la plus fragile : elle est au plus haut juste avant les retournements (fin 1999, fin 2021). σ : volatilité du Nasdaq sur un an. Plus elle est haute, plus le levier perd (le coût grimpe avec le carré du levier). r : taux directeur de la Fed (FRED, DFF). C'est le coût d'emprunt payé par les ETF à levier sur la part empruntée : une fois sur un ×2, deux fois sur un ×3.",
    net: "Rendement annuel attendu de chaque option si μ, σ et r restaient constants, frais et impôts déduits. PEA : 18,6 % prélevés une seule fois à la sortie (horizon 15 ans). CTO : 31,4 % sur la plus-value à chaque vente, environ tous les 1,2 an au rythme de la stratégie. Ces chiffres servent à comparer les options entre elles, pas à prévoir ton rendement.",
    x21: "Gain (ou perte) annuel attendu du LQQ ×2 par rapport à un Nasdaq sans levier, au PEA. ✓ = le ×2 vaut le coup. « Taux max » = taux de la Fed au-delà duquel le ×2 ne battrait plus le ×1.",
    x32: "Le QQQ3 ×3 au CTO face au LQQ ×2 au PEA, impôts compris. ✓ = le ×3 rapporterait plus malgré l'impôt du CTO. « Taux max » = taux de la Fed au-delà duquel le ×3 perd (« aucun » = il perd même à taux zéro, à cause de l'impôt). « σ ≤ … » = volatilité au-dessus de laquelle le ×3 perd au taux actuel.",
    museuil: "Croissance annuelle minimale du Nasdaq pour que le ×3 batte le ×2. Brut = sans impôt ; net = en comptant l'impôt du CTO à chaque vente et celui du PEA à la sortie. ✓ si la pente des 5 dernières années dépasse le seuil net. L'écart entre brut et net, c'est ce que coûte la fiscalité du CTO.",
    vol20: "Même volatilité que la case du haut. Au-dessus de 30 % : passage en ×1 au PEA (LQQ → Nasdaq ×1) et au CTO (QQQ3 → Nasdaq ×1). Retour au levier sous 25 %. Une position prise sur un creux n'est pas concernée, pour ne pas vendre au pire moment.",
    omen: "Le Pine utilise une deuxième alarme, le Hindenburg Omen, qui détecte une bourse de New York fragile (beaucoup de plus hauts et de plus bas en même temps). Ses données ne sont pas disponibles gratuitement, donc elle n'est pas suivie ici. Tu passeras un peu moins souvent en ×1 que le Pine.",
    creux: "Règle d'entrée anticipée, utile seulement hors marché après une forte baisse. PRÊT = toutes les sécurités sont au vert, il n'attend qu'une baisse assez large. BLOQUÉ = une sécurité est au rouge (la raison est indiquée). DÉSARMÉ = déjà utilisée pendant cet épisode. EN CREUX = la position a été prise ainsi. En position normale, la règle ne sert pas.",
    largeur: "Profondeur de la baisse : écart entre le Nasdaq et sa moyenne des 150 dernières séances. Le creux se déclenche à −10 % ou moins. Un ✕ en marché haussier est normal : il n'y a pas de baisse.",
    bulle: "Combien de fois le Nasdaq a été multiplié sur 5 ans, au plus haut des 2 dernières années. Au-dessus de ×4, le marché est jugé en bulle et l'entrée sur creux est refusée (en 2000, c'était ×10,5).",
    sahm: "Indicateur de récession de la Fed de Saint-Louis : hausse du chômage américain (moyenne 3 mois) par rapport à son plus bas de l'année. Vers 0,50, la récession est en général déjà là ; la règle refuse le creux dès 0,30. 0,00 = le chômage est à son plus bas de l'année.",
    prime: "Même logique, sur le taux d'emploi des 25-54 ans, moins bruité que le chômage : baisse depuis son plus haut de l'année. Refus du creux à partir de 0,50.",
    arme: "L'entrée sur creux ne sert qu'une fois par épisode de baisse. Elle se réarme quand la tendance redevient acheteuse.",
    journal: "ACHAT / VENTE : signal de tendance (EMA 45 semaines). ×1 / ×2 : alarme de volatilité (au CTO, ×2 veut dire retour au QQQ3 ×3). CREUX : entrée anticipée. RELAIS : la tendance reprend une position creux, rien à acheter. VENTE ÉVITÉE : vente et creux le même jour, position gardée. REFUS : un creux bloqué par une sécurité."
  };
  const seuil = g.creux ? "relais par l'EMA" : g.expose ? "avant la vente" : "avant l'achat";
  const vol = g.vol20 === null || g.vol20 === undefined ? "—" : F1.format(g.vol20) + NNBSP + "%";
  const volCls = g.vol20 !== null && g.vol20 >= g.volHaut ? "down" : "";
  let msg = "";
  if (g.transition) msg = '<p class="sig-msg ordre">⏵ PEA : ' + esc(g.ordre) + "</p>" + (g.positionCTO && g.ordreCTO && g.ordreCTO !== "Aucun" ? '<p class="sig-msg ordre">⏵ CTO : ' + esc(g.ordreCTO) + "</p>" : "");
  else if (g.provisoire && g.provisoire.changement) msg = '<p class="sig-msg alerte">Séance US en cours : ' + esc(g.provisoire.position) + " si la clôture reste à ce niveau (provisoire)</p>";
  else if (g.zoneTendance) msg = '<p class="sig-msg alerte">Zone d\'alerte : le Nasdaq est à ' + F1.format(Math.abs(g.distance)) + NNBSP + "% du seuil " + (g.expose ? "de vente" : "d'achat") + "</p>";
  else if (g.zoneVol) msg = '<p class="sig-msg alerte">Zone d\'alerte : volatilité proche de ' + g.volHaut + NNBSP + "%, passage en ×1 possible</p>";
  else msg = '<p class="sig-msg">Aucun ordre · séance du ' + esc(court(g.date)) + "</p>";

  /* une VENTE et un CREUX le même jour = la vente n'a pas lieu (anciens journaux) : une seule ligne */
  const bruts = g.signaux || [], fusion = [];
  bruts.forEach(x => {
    const jumeau = bruts.find(y => y !== x && y.date === x.date && ((x.type === "VENTE" && y.type === "CREUX") || (x.type === "CREUX" && y.type === "VENTE")));
    if (!jumeau) { fusion.push(x); return; }
    if (x.type === "VENTE") fusion.push({ type: "VENTE ÉVITÉE", date: x.date, detail: "Creux détecté le même jour : la position est gardée, aucun ordre." });
  });
  const typeCls = t => t === "VENTE ÉVITÉE" ? "t-EVITEE" : "t-" + String(t).replace("×1", "x1").replace("×2", "x2");
  const journal = fusion.slice(0, 8).map(x =>
    '<div class="r"><span class="a ' + typeCls(x.type) + '">' + esc(x.type) + '</span><span class="b">' + esc(court(x.date)) + '</span><span class="c" style="grid-column:1/-1">' + esc(x.detail) + "</span></div>").join("");

  /* arbitrage du DCA : ×1 / ×2 au PEA, ×3 au CTO, nets d'impôt (formule d'espérance du Pine) */
  const a = g.arbitrage;
  let arb = "";
  if (a) {
    const tMax = x => x === undefined || x === null ? "" : x < 0 ? "taux max : aucun" : x >= 50 ? "taux max > 50 %" : "taux max " + F1.format(x) + NNBSP + "%";
    const ou = a.optimal === 3 ? "CTO · QQQ3" : a.optimal === 2 ? "PEA · LQQ" : "PEA · ETF ×1";
    arb = '<h4 class="sig-h">Apport du mois <small>formule d\'espérance, pas une prévision</small></h4>' +
      ligne(g.expose ? "Verdict" : "Hors marché", g.expose ? "×" + a.optimal + " · " + ou : "cash PEA · or CTO", g.expose && a.avance !== undefined ? "avance de " + F1.format(a.avance) + " pt/an sur le deuxième choix, après impôt" : "le DCA ne va jamais sur ce que le signal dit de ne pas détenir", g.expose ? "acc" : "down", EX.verdict) +
      ligne("Données", "μ " + F1.format(a.mu) + " · σ " + F1.format(a.sigma) + " · r " + F2.format(a.taux) + " %", "μ = pente " + "5 ans du Nasdaq, dividendes compris · σ sur 252 séances · r = taux Fed (" + esc(a.tauxSource || "FRED") + ")", "", EX.donnees) +
      (a.rendX1 !== undefined ? ligne("Net/an", "×1 " + F1.format(a.rendX1) + " · ×2 " + F1.format(a.rendX2) + (a.cto ? " · ×3 " + F1.format(a.rendX3) : "") + " %", "rendement annuel attendu après impôt : ×1 et ×2 au PEA (impôt à la sortie), ×3 au CTO (" + (g.tauxCTO ? F1.format(g.tauxCTO) : "31,4") + " % à chaque vente, tous les " + F1.format(a.H || 1.2) + " an)", "", EX.net) : "") +
      ligne("×2 contre ×1 (PEA)", pct(a.ecart / 100, 1) + "/an " + coche(a.ecart > 0), tMax(a.tauxMax), "", EX.x21) +
      (a.cto && a.ecart32 !== undefined ? ligne("×3 CTO contre ×2 PEA", pct(a.ecart32 / 100, 1) + "/an " + coche(a.ecart32 > 0), tMax(a.tauxMax32) + (a.sigmaMax3 === undefined ? "" : " · " + (a.sigmaMax3 < 0 ? "×3 : jamais, quelle que soit la volatilité" : a.sigmaMax3 >= 100 ? "×3 quelle que soit la volatilité" : "×3 seulement si σ ≤ " + F1.format(a.sigmaMax3) + " %")), "", EX.x32) : "") +
      (a.cto && a.muReqBrut !== undefined ? ligne("μ seuil ×3", (a.muReqBrut >= 200 ? "> 200" : F1.format(a.muReqBrut)) + " / " + (a.muReqNet === null ? "n/d" : a.muReqNet >= 200 ? "> 200" : F1.format(a.muReqNet)) + " %/an " + coche(a.muReqNet === null ? null : a.pente >= a.muReqNet), "pente minimale du Nasdaq pour que le ×3 batte le ×2, brut / net d'impôt · pente 5 ans actuelle : " + F1.format(a.pente) + " % (un repère sur le passé : records juste avant les retournements)", "", EX.museuil) : "");
  }

  /* creux : les 4 conditions du Pine */
  const j = g.jauges;
  const creux = '<h4 class="sig-h">Entrée sur creux <small>utile seulement hors marché</small></h4>' +
    ligne("Verdict", esc(g.creuxVerdict || "—"), g.expose && !g.creux ? "en position : la règle ne sert pas" : "", g.creux ? "acc" : "", EX.creux) +
    (j ? ligne("Largeur (proxy)", p1(j.ecartSMA) + " " + coche(j.declLargeur), "déclenche quand le Nasdaq est à " + F1.format(Math.abs(j.seuilEcart)) + " % ou plus sous sa moyenne " + j.smaLen + " séances", "", EX.largeur) +
      ligne("1 · Bulle", (j.bulle === null ? "—" : "×" + F2.format(j.bulle)) + " " + coche(j.bulle === null ? null : j.okBulle), "montée sur 5 ans au pic des 2 ans, doit rester < ×" + F2.format(j.seuilBulle), "", EX.bulle) +
      ligne("2 · Sahm", (j.sahm === null ? "—" : F2.format(j.sahm)) + " " + coche(j.sahm === null ? null : j.okSahm), "chômage US, doit rester < " + F2.format(j.seuilSahm), "", EX.sahm) +
      ligne("3 · Sahm 25-54 ans", (j.prime === null ? "—" : F2.format(j.prime)) + " " + coche(j.prime === null ? null : j.okPrime), "emploi des 25-54 ans, doit rester < " + F2.format(j.seuilPrime), "", EX.prime) +
      ligne("Armée", j.arme ? "oui" : "non", "une seule entrée par épisode : se réarme quand la tendance repasse acheteuse", "", EX.arme) : "");

  const levier = '<h4 class="sig-h">Levier <small>PEA ×2 / CTO ×3 ↔ ×1</small></h4>' +
    ligne("Volatilité 20 séances", vol + " " + coche(g.vol20 === null ? null : g.vol20 < g.volHaut), "passe en ×1 au-dessus de " + g.volHaut + " %, revient sous " + (g.volBas || 25) + " % · position creux exemptée", "", EX.vol20) +
    ligne("Alarme Omen", "non suivie", "données NYSE introuvables gratuitement : seule la volatilité pilote le ×1", "", EX.omen);

  const detail = '<div class="sig-detail"' + (signalOuvert ? "" : " hidden") + ">" +
    '<div class="sig-cells">' +
      cell("Distance", p(g.distance), g.distance < 0 && g.expose ? "down" : "", seuil, "distance") +
      cell("Volatilité", vol, volCls, "20 j · ×1 au-dessus de " + g.volHaut + NNBSP + "%", "vol") +
      cell("Depuis", esc(court(g.depuis)), "", g.expose ? "Nasdaq " + p(g.perfDepuis) : g.joursDepuis + " j hors marché", "depuis") +
    "</div>" +
    ["distance", "vol", "depuis"].map(k => '<div class="sig-case-aide" data-pour="' + k + '" hidden><span class="aide">' + EX[k] + "</span></div>").join("") +
    '<div class="m-liste">' + arb + levier + creux + '<div data-aide><h4 class="sig-h"><span>Journal' + qm + '</span><small>8 derniers signaux</small></h4>' + aide(EX.journal) + "</div>" + journal + "</div>" +
    '<div class="sig-pied">Calcul du ' + esc(g.majLe || "") + " · données " + esc(g.source || "") + " · EMA " + (g.emaSem || 45) + " sem. " + F0.format(g.ema) + " · seuil de vente " + F0.format(g.bandeSortie) + "</div>" +
  "</div>";

  /* vue courte : la position à tenir sur chaque compte, l'apport du mois, et l'ordre éventuel */
  return '<div class="sig ' + cls + '">' +
    '<button type="button" class="sig-tete" aria-expanded="' + signalOuvert + '">' +
      '<span class="sig-lab">' + (g.positionCTO ? "Levier · PEA + CTO" : "Signal levier · PEA") + '</span><span class="sig-pos">' + esc(g.position) + '</span><span class="chev" aria-hidden="true">›</span>' +
    "</button>" +
    (g.positionCTO ? '<div class="sig-cto" data-aide><span class="sig-lab">CTO' + qm + '</span><span class="sig-pos cto-' + (g.positionCTO === "OR" ? "or" : /×1/.test(g.positionCTO) ? "x1" : "x3") + '">' + esc(g.positionCTO) + '</span><span class="sub">même signal · ×1 si alarme · or hors marché</span>' + aide(EX.cto) + "</div>" : "") +
    (a && g.expose ? '<div class="sig-cto" data-aide><span class="sig-lab">Apport' + qm + '</span><span class="sig-pos cto-' + (a.optimal === 3 ? "x3" : a.optimal === 2 ? "x2" : "x1") + '">×' + a.optimal + '</span><span class="sub">' + (a.optimal === 3 ? "CTO · QQQ3" : a.optimal === 2 ? "PEA · LQQ" : "PEA · ETF ×1") + " · net d'impôt</span>" + aide(EX.apport) + "</div>" : "") +
    msg + detail +
  "</div>";
}
function brancherSignal(v) {
  const carte = v.querySelector(".sig"); if (!carte) return;
  carte.addEventListener("click", e => {
    const q = e.target.closest(".qm-b"); if (!q) return;
    e.stopPropagation();
    if (q.dataset.case) {   // cases du détail : explication en pleine largeur sous les cases
      carte.querySelectorAll(".sig-case-aide").forEach(d => { d.hidden = d.dataset.pour !== q.dataset.case || !d.hidden; });
      carte.querySelectorAll("[data-case]").forEach(b => b.classList.toggle("on", b === q && !carte.querySelector('.sig-case-aide[data-pour="' + q.dataset.case + '"]').hidden));
      return;
    }
    const z = q.closest("[data-aide]"); if (z) z.classList.toggle("aide-on");
  });
  const t = carte.querySelector(".sig-tete");
  t.addEventListener("click", () => { signalOuvert = !signalOuvert; t.setAttribute("aria-expanded", String(signalOuvert)); carte.querySelector(".sig-detail").hidden = !signalOuvert; });
}

/* ================= Graphiques du patrimoine (onglet Stats) ================= */
function cleMoisIso(iso) { return +String(iso).slice(0, 4) * 100 + +String(iso).slice(5, 7); }
function libMoisK(k) { return MOIS[k % 100 - 1] + " " + Math.floor(k / 100); }
/* aires empilées : couches positives au-dessus de zéro, dettes en dessous, ligne du total net par-dessus */
function empile(box, conf) {
  const svg = box.querySelector("svg"), tip = box.querySelector(".tip");
  const xs = conf.x, n = xs.length; if (n < 2) { box.hidden = true; return; }
  const W = Math.max(280, box.clientWidth - 20), H = W < 420 ? 220 : 250, m = { l: 46, r: 10, t: 10, b: 24 };
  const iw = W - m.l - m.r, ih = H - m.t - m.b;
  const haut = xs.map((_, i) => conf.couches.reduce((a, c) => a + Math.max(0, c.v[i] || 0), 0));
  const bas = xs.map((_, i) => (conf.negs || []).reduce((a, c) => a - Math.max(0, c.v[i] || 0), 0));
  let mn = Math.min(0, ...bas), mx = Math.max(...haut, ...(conf.ligne ? conf.ligne.v.filter(ok) : []));
  const pad = (mx - mn) * .06 || 1; mx += pad; if (mn < 0) mn -= pad;
  const ticks = graduations(mn, mx, 4); mn = Math.min(mn, ticks[0]); mx = Math.max(mx, ticks[ticks.length - 1]);
  const X = i => m.l + i / (n - 1) * iw, Y = v => m.t + ih - (v - mn) / (mx - mn) * ih;
  let o = "";
  ticks.forEach(t => {
    o += '<line x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + Y(t).toFixed(1) + '" y2="' + Y(t).toFixed(1) + '" style="stroke:var(' + (Math.abs(t) < 1e-9 ? "--ink-3" : "--rule") + ')"/>';
    o += '<text x="' + (m.l - 6) + '" y="' + (Y(t) + 3.5).toFixed(1) + '" text-anchor="end">' + esc(axeEur(t)) + "</text>";
  });
  let dx = -99;
  xs.forEach((k, i) => {
    const lab = i === 0 || k % 100 === 1 ? (k % 100 === 1 ? String(Math.floor(k / 100)) : MOIS[k % 100 - 1]) : (n <= 14 ? MOIS[k % 100 - 1] : "");
    if (!lab) return; const x = X(i); if (x - dx < 40) return; dx = x;
    o += '<text x="' + x.toFixed(1) + '" y="' + (H - 6) + '" text-anchor="middle">' + esc(lab) + "</text>";
  });
  const aire = (bas0, haut1, c, op) => {
    let d = "M" + X(0).toFixed(1) + " " + Y(haut1[0]).toFixed(1);
    for (let i = 1; i < n; i++) d += "L" + X(i).toFixed(1) + " " + Y(haut1[i]).toFixed(1);
    for (let i = n - 1; i >= 0; i--) d += "L" + X(i).toFixed(1) + " " + Y(bas0[i]).toFixed(1);
    return '<path d="' + d + 'Z" style="fill:' + c + ';fill-opacity:' + (op || .78) + '"/>';
  };
  let base = xs.map(() => 0);
  conf.couches.forEach(c => { const h = base.map((b, i) => b + Math.max(0, c.v[i] || 0)); o += aire(base, h, c.c, c.op); base = h; });
  base = xs.map(() => 0);
  (conf.negs || []).forEach(c => { const h = base.map((b, i) => b - Math.max(0, c.v[i] || 0)); o += aire(base, h, c.c, c.op || .45); base = h; });
  if (conf.ligne) {
    let d = ""; conf.ligne.v.forEach((v, i) => { if (ok(v)) d += (d ? "L" : "M") + X(i).toFixed(1) + " " + Y(v).toFixed(1); });
    o += '<path d="' + d + '" fill="none" style="stroke:var(--ink)" stroke-width="2" stroke-dasharray="5 4" stroke-linejoin="round"/>';
  }
  o += '<line class="cross" x1="0" x2="0" y1="' + m.t + '" y2="' + (m.t + ih) + '" style="stroke:var(--ink-3)" visibility="hidden"/>';
  o += '<rect class="hit" x="' + m.l + '" y="0" width="' + iw + '" height="' + H + '" fill="transparent"/>';
  svg.setAttribute("viewBox", "0 0 " + W + " " + H); svg.setAttribute("height", H); svg.innerHTML = o;
  const cross = svg.querySelector(".cross"), hit = svg.querySelector(".hit");
  const montrer = ev => {
    const r = svg.getBoundingClientRect();
    const i = Math.max(0, Math.min(n - 1, Math.round(((ev.clientX - r.left) * W / r.width - m.l) / iw * (n - 1))));
    const x = X(i); cross.setAttribute("x1", x); cross.setAttribute("x2", x); cross.setAttribute("visibility", "visible");
    const rows = conf.couches.concat(conf.negs || []).filter(c => ok(c.v[i]) && c.v[i]).map(c => '<div class="row" style="--c:' + c.c + '"><span>' + esc(c.nom) + "</span><span>" + (conf.negs && conf.negs.includes(c) ? MOINS : "") + eur(c.v[i]) + "</span></div>").join("");
    tip.hidden = false;
    tip.innerHTML = "<b>Fin " + esc(libMoisK(xs[i])) + "</b>" + rows + (conf.ligne && ok(conf.ligne.v[i]) ? '<div class="row" style="--c:var(--ink)"><span>' + esc(conf.ligne.nom) + "</span><span>" + eur(conf.ligne.v[i]) + "</span></div>" : "");
    const bx = box.getBoundingClientRect(), px = x / W * r.width + (r.left - bx.left), tw = tip.offsetWidth;
    let left = px + 14; if (left + tw > bx.width - 6) left = px - tw - 14;
    tip.style.left = Math.max(6, left) + "px"; tip.style.top = "38px";
  };
  hit.addEventListener("pointermove", montrer); hit.addEventListener("pointerdown", montrer);
  hit.addEventListener("pointerleave", () => { cross.setAttribute("visibility", "hidden"); tip.hidden = true; });
}
function boiteEmpile(id, leg) {
  return '<div class="chart-box" id="' + id + '"><div class="legend">' + leg.map(l => '<span><i class="carre" style="background:' + l.c + (l.op ? ";opacity:" + l.op : "") + '"></i>' + esc(l.nom) + "</span>").join("") +
    '</div><svg class="chart" role="img" aria-label="Graphique empilé"></svg><div class="tip" hidden></div></div>';
}
/* A · patrimoine dans le temps, brut ou net */
function donneesPatrimoine() {
  const s = seriePatrimoine(); if (s.length < 2) return null;
  const app = (M.parametres || {}).appart || null, mens = (M.prets || {}).mensuel || [];
  return s.map(x => {
    const finIso = isoJour(new Date(x.an, x.mo, 0));
    let prix = 0, dette = 0;
    if (app && app.prix && app.date && finIso >= app.date) {
      prix = app.prix;
      let restant = null; mens.forEach(r => { if (r[0] <= finIso) restant = r[1]; });
      dette = mens.length ? (restant === null ? mens[0][1] : restant) : Math.max(0, prix - x.immo);
    }
    return Object.assign({ k: x.an * 100 + x.mo, prix, dette }, x);
  });
}
function blocPatrimoineTemps() {
  const d = donneesPatrimoine(); if (!d) return "";
  const brut = PREF.patri === "brut", aImmo = d.some(x => x.prix > 0);
  const leg = [{ nom: "Bourse", c: "var(--s1)" }, { nom: "Épargne", c: "var(--s2)" }]
    .concat(aImmo ? (brut ? [{ nom: "Appartement", c: "var(--s3)" }, { nom: "Prêts restants", c: "var(--down)", op: .5 }] : [{ nom: "Immobilier net", c: "var(--s3)" }]) : []);
  const der = d[d.length - 1], prem = d.find(x => x.complet) || d[0];
  const net = x => x.bourse + x.epargne + x.immo;
  return '<div><h2 class="sec">Patrimoine dans le temps <small>fin de mois</small></h2></div>' +
    (aImmo ? '<div class="seg" role="group" aria-label="Brut ou net"><button type="button" data-m-patri="net" aria-pressed="' + !brut + '">Net</button><button type="button" data-m-patri="brut" aria-pressed="' + brut + '">Brut (dette à part)</button></div>' : "") +
    boiteEmpile("g-patri", leg) +
    '<p class="resume">' + (brut ? "Brut : l'appartement compté à son prix, les prêts restants en dessous de zéro. Les pointillés suivent ton patrimoine net. " : "Net : l'immobilier compte pour son prix moins les prêts restants. ") +
      "Depuis fin " + esc(libMoisK(prem.k)) + " : <b class=\"" + sens(net(der) - net(prem)) + "\">" + eur(net(der) - net(prem), 0, true) + "</b>.</p>";
}
function dessinerPatrimoine() {
  const box = document.getElementById("g-patri"); if (!box) return;
  const d = donneesPatrimoine(), brut = PREF.patri === "brut", aImmo = d.some(x => x.prix > 0);
  const couches = [{ nom: "Bourse", v: d.map(x => x.bourse), c: "var(--s1)" }, { nom: "Épargne", v: d.map(x => x.epargne), c: "var(--s2)" }];
  if (aImmo) couches.push(brut ? { nom: "Appartement", v: d.map(x => x.prix), c: "var(--s3)" } : { nom: "Immobilier net", v: d.map(x => x.immo), c: "var(--s3)" });
  empile(box, { x: d.map(x => x.k), couches, negs: brut && aImmo ? [{ nom: "Prêts restants", v: d.map(x => x.dette), c: "var(--down)" }] : [],
    ligne: brut && aImmo ? { nom: "Patrimoine net", v: d.map(x => x.bourse + x.epargne + x.immo) } : null });
}
/* C · épargne livret par livret (soldes envoyés par l'API V10 ; l'assurance-vie = total épargne du mois moins les livrets) */
const COUL_EP = ["var(--gold)", "var(--p1)", "var(--p2)", "var(--p3)", "var(--accent)", "var(--idx)"];
function donneesEpargne() {
  const em = M.epargneMois; if (!em || !em.rows || !em.rows.length) return null;
  const mpm = {}; (M.moisParMois || []).forEach(r => { mpm[String(r.mois).slice(0, 7)] = r; });
  const rows = em.rows.filter(r => { const t = mpm[String(r[0]).slice(0, 7)]; return t && ok(t.epargne); });
  if (rows.length < 2) return null;
  const av = rows.map(r => { const t = mpm[String(r[0]).slice(0, 7)]; return Math.max(0, (t.epargne || 0) + (t.uc || 0) - r.slice(1).reduce((a, b) => a + b, 0)); });
  const couches = em.comptes.map((nom, j) => ({ nom: nom.replace(/\s+Banque Pop\.?$/, ""), v: rows.map(r => r[j + 1]), c: COUL_EP[j % COUL_EP.length] })).filter(c => c.v.some(x => x > 0.5));
  if (av.some(x => x > 0.5)) couches.push({ nom: "Assurance-vie et autres", v: av, c: "var(--s3)" });
  return { x: rows.map(r => cleMoisIso(r[0])), couches };
}
function blocEpargneTemps() {
  const d = donneesEpargne();
  if (!d) return M.epargneMois === undefined && (M.epargne || []).length ? '<div><h2 class="sec">Épargne livret par livret</h2></div><p class="info">Ce graphique a besoin de la version 10 de ton API patrimoine (nouveau déploiement).</p>' : "";
  const der = d.couches.map(c => c.v[c.v.length - 1]), tot = der.reduce((a, b) => a + b, 0);
  return '<div><h2 class="sec">Épargne livret par livret <small>fin de mois</small></h2></div>' + boiteEmpile("g-epargne", d.couches) +
    '<p class="resume">Aujourd\'hui : ' + d.couches.map((c, i) => esc(c.nom) + " <b>" + eur(der[i]) + "</b>").join(" · ") + " · total <b>" + eur(tot) + "</b>.</p>";
}
function dessinerEpargne() { const box = document.getElementById("g-epargne"); const d = donneesEpargne(); if (box && d) empile(box, { x: d.x, couches: d.couches }); }
/* B · prêt : capital restant dû, passé plein, à venir en pointillés */
function blocPret() {
  const p = M.prets; if (!p || !(p.mensuel || []).length) return "";
  const mens = p.mensuel, emprunte = Math.max(...mens.map(r => r[1])), auj = isoJour(new Date());
  const restant = p.actuel ? p.actuel.restant : mens[0][1], rembourse = emprunte - restant;
  const t = (lab, val, cls, sub) => "<div><span class=\"lab\">" + lab + '</span><span class="val ' + (cls || "") + '">' + val + '</span><span class="sub">' + sub + "</span></div>";
  return '<div><h2 class="sec">Ton prêt immobilier <small>capital restant dû</small></h2></div>' +
    boiteGraphe("g-pret", [{ nom: "Déjà remboursé", c: "var(--accent)" }, { nom: "À venir", c: "var(--accent)", dash: true }]) +
    '<div class="tuiles">' +
      t("Remboursé", pct(rembourse / emprunte, 1, false), "up", eur(rembourse) + " sur " + eur(emprunte)) +
      t("Restant dû", eur(restant), "", p.actuel ? "au " + frDate(p.actuel.date) : "") +
      t("Intérêts restants", eur(p.interetsRestants), "", "payés en " + new Date().getFullYear() + " : " + eur(p.interetsAnnee)) +
      t("Fin des prêts", p.fin ? frDate(p.fin) : "—", "", p.fin ? "dans " + Math.max(0, Math.round((new Date(p.fin) - new Date()) / (365.25 * 864e5))) + " ans" : "") +
    "</div>";
}
function dessinerPret() {
  const box = document.getElementById("g-pret"); if (!box) return;
  const mens = M.prets.mensuel, auj = isoJour(new Date());
  let iAuj = -1; mens.forEach((r, i) => { if (r[0] <= auj) iAuj = i; });
  tracer(box, { x: mens.map(r => cleMoisIso(r[0])), zeroMin: true,
    series: [{ nom: "Restant dû", v: mens.map((r, i) => i <= iAuj ? r[1] : null), c: "var(--accent)", aire: true, w: 2.4 },
      { nom: "À venir", v: mens.map((r, i) => i >= Math.max(0, iAuj) ? r[1] : null), c: "var(--accent)", dash: true, w: 1.6 }],
    fmt: x => eur(x), fmtAxe: axeEur, titreX: k => libMoisK(k),
    etiqX: (k, kp) => kp === null ? "" : (Math.floor(k / 100) !== Math.floor(kp / 100) && Math.floor(k / 100) % 2 === 0 ? String(Math.floor(k / 100)) : "") });
}

/* ================= Jauge du millionnaire (privée : Moi › Missions, seulement sur ton appareil) ================= */
const CIBLE = 1e6, JALONS = [100000, 250000, 500000, 750000];
function valeurMillion(mode) {
  const s = M.synthese || {};
  return mode === "net" ? patrimoineNet().montant : s.financier;
}
/* rythme d'épargne estimé : médiane des apports mensuels en bourse sur 12 mois (la médiane ignore les gros transferts ponctuels) */
function effortMensuel() {
  const h = M.historique; if (!h || !h.rows || h.rows.length < 2) return null;
  const ka = h.cols.indexOf("a"); if (ka < 0) return null;
  const fins = {}; h.rows.forEach(r => { fins[Math.floor(r[0] / 100)] = r[ka]; });
  const ks = Object.keys(fins).map(Number).sort((x, y) => x - y), d = [];
  for (let i = 1; i < ks.length; i++) d.push(fins[ks[i]] - fins[ks[i - 1]]);
  const der = d.slice(-12).sort((x, y) => x - y); if (!der.length) return null;
  const med = der.length % 2 ? der[(der.length - 1) / 2] : (der[der.length / 2 - 1] + der[der.length / 2]) / 2;
  return Math.max(0, Math.round(med / 10) * 10);
}
function moisPourMillion(v0, c, rAn) {
  if (v0 >= CIBLE) return 0;
  const i = Math.pow(1 + rAn, 1 / 12) - 1;
  let v = v0;
  for (let n = 1; n <= 12 * 80; n++) { v = v * (1 + i) + c; if (v >= CIBLE) return n; }
  return null;
}
function paramsMillion() {
  const mode = PREF.million === "net" ? "net" : "financier";
  const v = valeurMillion(mode) || 0, c0 = effortMensuel();
  const c = ok(PREF.effort) ? PREF.effort : (c0 || 0), R = ok(PREF.rendement) ? PREF.rendement : 0.05;
  return { mode, v, c0, c, R };
}
/* projection mois par mois jusqu'au million (40 ans au plus), avec et sans épargne nouvelle */
function projection(v, c, R) {
  const i = Math.pow(1 + R, 1 / 12) - 1, avec = [v], sans = [v];
  let a = v, z = v;
  for (let n = 1; n <= 480; n++) { a = a * (1 + i) + c; z = z * (1 + i); avec.push(a); sans.push(z); if (a >= CIBLE && n % 12 === 0) break; }
  return { avec, sans };
}
function svgProjection(v, c, R) {
  const { avec, sans } = projection(v, c, R), n = avec.length - 1;
  const W = 320, H = 150, m = { l: 34, r: 8, t: 8, b: 18 }, iw = W - m.l - m.r, ih = H - m.t - m.b;
  const mx = Math.max(CIBLE * 1.05, ...avec.slice(0, n + 1)), X = k => m.l + k / n * iw, Y = val => m.t + ih - Math.min(val, mx) / mx * ih;
  const d = arr => arr.map((val, k) => (k ? "L" : "M") + X(k).toFixed(1) + " " + Y(val).toFixed(1)).join("");
  const discret = ETAT.discret === "oui";
  let o = "";
  [0, 250000, 500000, 750000, 1000000].forEach(t => {
    o += '<line x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + Y(t).toFixed(1) + '" y2="' + Y(t).toFixed(1) + '" stroke="rgba(255,255,255,' + (t === CIBLE ? ".55" : ".08") + ')"' + (t === CIBLE ? ' stroke-dasharray="4 3"' : "") + "/>";
    o += '<text x="' + (m.l - 5) + '" y="' + (Y(t) + 3.5).toFixed(1) + '" text-anchor="end">' + (t === 0 ? "0" : t === CIBLE ? "1M" : (t / 1000) + "k") + "</text>";
  });
  const an0 = new Date().getFullYear(), mo0 = new Date().getMonth();
  let dx = -99;
  for (let k = 0; k <= n; k++) { if ((mo0 + k) % 12 !== 0) continue; const y = an0 + Math.floor((mo0 + k) / 12), x = X(k); if (x - dx < 44) continue; dx = x; o += '<text x="' + x.toFixed(1) + '" y="' + (H - 4) + '" text-anchor="middle">' + y + "</text>"; }
  o += '<path d="' + d(avec) + "L" + X(n).toFixed(1) + " " + Y(0).toFixed(1) + "L" + X(0).toFixed(1) + " " + Y(0).toFixed(1) + 'Z" fill="url(#mm-deg)" stroke="none"/>';
  o += '<path d="' + d(sans) + '" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="1.4" stroke-dasharray="3 3"/>';
  o += '<path d="' + d(avec) + '" fill="none" stroke="#F5C542" stroke-width="2.4" stroke-linejoin="round"/>';
  const kM = avec.findIndex(val => val >= CIBLE);
  if (kM > 0) o += '<circle cx="' + X(kM).toFixed(1) + '" cy="' + Y(CIBLE).toFixed(1) + '" r="4.5" fill="#fff" stroke="#F5C542" stroke-width="2"/>';
  return '<svg class="mm-svg" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Projection jusqu\'au million"><defs><linearGradient id="mm-deg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#F5C542" stop-opacity=".35"/><stop offset="1" stop-color="#F5C542" stop-opacity="0"/></linearGradient></defs>' + o + "</svg>" +
    '<div class="mm-leg"><span><i></i>avec ' + (discret ? "ton épargne" : F0.format(Math.round(c)) + " €/mois") + '</span><span><i class="sans"></i>sans rien ajouter</span></div>';
}
function textesMillion(P) {
  const n = moisPourMillion(P.v, P.c, P.R), discret = ETAT.discret === "oui";
  const quand = n === null ? null : new Date(new Date().getFullYear(), new Date().getMonth() + n, 1);
  const prochain = JALONS.concat([CIBLE]).find(j => j > P.v);
  const nProchain = prochain ? moisPourMillion(P.v * CIBLE / prochain, P.c * CIBLE / prochain, P.R) : null;   // même calcul, mis à l'échelle du jalon
  const eta = quand ? 'À ce rythme, <b>millionnaire en ' + MOIS_L[quand.getMonth()] + " " + quand.getFullYear() + "</b>" + (n > 0 ? " · dans " + (n >= 24 ? Math.floor(n / 12) + " ans" + (n % 12 ? " et " + (n % 12) + " mois" : "") : n + " mois") : "") + "."
    : "Avec ces hypothèses, le million reste hors de portée en 40 ans : augmente l'épargne ou le rendement pour voir.";
  const sub = prochain && prochain < CIBLE && nProchain !== null ? "Prochain jalon : <b>" + F0.format(prochain / 1000) + " 000 €</b>" + (discret ? "" : ", encore " + eur(prochain - P.v)) + (nProchain ? " · ≈ " + (nProchain >= 24 ? Math.round(nProchain / 12) + " ans" : nProchain + " mois") : "") : "";
  return { n, quand, eta, sub };
}
function htmlMillion() {
  if (!M) return "";
  const P = paramsMillion(), part = Math.max(0, Math.min(1, P.v / CIBLE)), T = textesMillion(P);
  const discret = ETAT.discret === "oui", reduitM = !!PREF.millionReduit;
  const texteFlap = discret ? "•••" : F0.format(Math.round(P.v));
  const piste = JALONS.map(j => '<span class="mj' + (P.v >= j ? " passe" : "") + '" style="left:' + (j / CIBLE * 100) + '%"><i></i><b>' + (j / 1000) + "k</b></span>").join("");
  const tete = '<div class="mm-h"><span class="mm-k">Cap sur le million</span><span class="mm-d"><span class="mm-prive">privé</span>' +
    '<label class="mm-coche"><input type="checkbox" id="mm-reduire"' + (reduitM ? " checked" : "") + '> réduire</label></span></div>';
  if (reduitM) return '<section class="m-million reduit" style="--mc:' + couleurMoi() + '">' + tete +
    '<p class="mm-ligne"><b>' + F1.format(part * 100) + ' %</b><span>' + (T.quand ? "millionnaire en " + T.quand.getFullYear() : "hors de portée à ce rythme") + "</span></p>" +
    '<div class="mm-rail mini"><i style="width:' + (part * 100).toFixed(2) + '%"></i></div></section>';
  return '<section class="m-million" style="--mc:' + couleurMoi() + '">' + tete +
    '<div class="mm-pct"><b>' + F1.format(part * 100) + '</b><span>%</span></div>' +
    '<div class="m-flaps mm-flaps" aria-label="' + esc(texteFlap) + ' euros">' + flaps(texteFlap + NB + "€", false) + "</div>" +
    '<div class="mm-piste" role="img" aria-label="' + F1.format(part * 100) + ' % du million"><div class="mm-rail"><i style="width:' + (part * 100).toFixed(2) + '%"></i><em style="left:' + (part * 100).toFixed(2) + '%"></em></div>' + piste + '<span class="mj fin" style="left:100%"><i></i><b>1M</b></span></div>' +
    '<div class="seg mm-seg" role="group" aria-label="Ce qui compte"><button type="button" data-m-million="financier" aria-pressed="' + (P.mode === "financier") + '">Financier</button><button type="button" data-m-million="net" aria-pressed="' + (P.mode === "net") + '">Net, avec l\'appartement</button></div>' +
    '<p class="mm-eta" id="mm-eta">' + T.eta + "</p>" +
    '<p class="mm-sub" id="mm-sub">' + T.sub + "</p>" +
    '<div class="mm-sim"><label><span>Épargne par mois (€)</span><input id="mm-effort" type="text" inputmode="numeric" autocomplete="off" value="' + Math.round(P.c) + '"></label>' +
      '<label><span>Rendement par an (%)</span><input id="mm-rend" type="text" inputmode="decimal" autocomplete="off" value="' + String(+(P.R * 100).toFixed(1)).replace(".", ",") + '"></label></div>' +
    '<p class="mm-note" id="mm-rythme">' + (P.c0 !== null ? "Ton rythme estimé : ≈ " + (discret ? "•••" : F0.format(P.c0)) + " €/mois (apports médians en bourse sur 12 mois)" + (ok(PREF.effort) || ok(PREF.rendement) ? ' · <button type="button" class="mm-raz" id="mm-raz">revenir à ton rythme et 5 %</button>' : "") : "") + "</p>" +
    '<div class="mm-graph" id="mm-graph">' + svgProjection(P.v, P.c, P.R) + "</div>" +
    '<p class="mm-badge">' + badgeMillion() + "</p>" +
    '<p class="mm-note">Simulation : épargne et rendement constants, intérêts composés chaque mois. Un repère pour se motiver, pas une prévision.</p>' +
  "</section>";
}
function badgeMillion() {
  const pm = typeof D !== "undefined" && D && D.premierMillion;
  if (!pm) return "👑 Le badge <b>Premier millionnaire</b> est encore à prendre : unique, gardé pour toujours, et seul le fait est partagé, jamais ton montant.";
  return pm.nom === (estAdmin() ? ETAT.moi : SESSION.nom) ? "👑 Tu es le <b>premier millionnaire</b> du groupe. Personne d'autre ne l'aura." : "👑 <b>" + esc(pm.nom) + "</b> a pris le badge Premier millionnaire. Il reste le million pour toi.";
}
/* le premier à 1 000 000 € de patrimoine financier revendique le badge (le montant ne quitte pas l'appareil) */
async function revendiquerMillion() {
  try {
    if (!M || SRC !== "api" || !((M.synthese || {}).financier >= 1e6) || typeof D === "undefined" || !D || D.premierMillion || SOURCE !== "api" || simulationM()) return;
    if (M.simple && (estAdmin() || !M.personne)) return;
    const qui = M.simple ? M.personne : estAdmin() ? ETAT.moi : SESSION.nom;
    if (stock.get("versus.moi.million") === qui) return;
    const rep2 = await (await fetch(apiUrl(), { method: "POST", body: JSON.stringify({ cle: stock.get(CLES.cle), action: "million", personne: qui }) })).json();
    if (rep2.ok) { stock.set("versus.moi.million", qui); toast(rep2.message); if (typeof window.charger === "function") window.charger(true); }
  } catch (e) { /* réessai à la prochaine ouverture */ }
}
function majSimulation(el) {
  const P = paramsMillion(), T = textesMillion(P);
  el.querySelector("#mm-eta").innerHTML = T.eta;
  el.querySelector("#mm-sub").innerHTML = T.sub;
  el.querySelector("#mm-graph").innerHTML = svgProjection(P.v, P.c, P.R);
}
function brancherMillion(el) {
  el.querySelectorAll("[data-m-million]").forEach(b => b.addEventListener("click", () => { PREF.million = b.dataset.mMillion; garderPref(); afficherMillion(el); }));
  const r = el.querySelector("#mm-reduire"); if (r) r.addEventListener("change", () => { PREF.millionReduit = r.checked; garderPref(); afficherMillion(el); });
  const e = el.querySelector("#mm-effort"), t = el.querySelector("#mm-rend");
  if (e) e.addEventListener("input", () => { const x = lireNombre(e.value); if (x >= 0 && x <= 100000) { PREF.effort = x; garderPref(); majSimulation(el); } });
  if (t) t.addEventListener("input", () => { const x = lireNombre(t.value); if (x >= -10 && x <= 30) { PREF.rendement = x / 100; garderPref(); majSimulation(el); } });
  const z = el.querySelector("#mm-raz"); if (z) z.addEventListener("click", () => { delete PREF.effort; delete PREF.rendement; garderPref(); afficherMillion(el); });
}
function afficherMillion(el) {
  injecterStyle(); lireCache();
  if (!M) { el.innerHTML = ""; return; }
  el.classList.add("moi");
  el.innerHTML = htmlMillion(); brancherMillion(el);
}

/* ================= Saisie : ordres, journal, mises à jour du fichier (repris de Cote) ================= */
const AVEC_ACTIF = ["Achat", "Vente", "Frais en parts", "Relevé"];
const AVEC_QTE = ["Achat", "Vente", "Frais en parts"];
const AVEC_FRAIS = ["Achat", "Vente"];
const PRINCIPAUX = ["Achat", "Vente", "Apport", "Retrait"];
const LIB_MONTANT = {
  "Achat": "Montant débité, frais compris", "Vente": "Montant crédité, net de frais", "Apport": "Montant viré sur l'enveloppe",
  "Retrait": "Montant retiré", "Relevé": "Valeur indiquée sur le relevé", "Intérêts": "Intérêts versés",
  "Frais en parts": "Valeur des parts prélevées", "Frais": "Frais débités", "Ajustement espèces": "Écart d'espèces (négatif si sortie)",
  "Solde initial": "Solde à la date choisie"
};
let F = null, confirmeSuppr = null, tousRaccourcis = false, gererRaccourcis = false, nommerRaccourci = false;
let reglageOuvert = null, reglageMsg = {}, alertePre = null;
const $f = id => document.getElementById(id);
function aujourdhuiISO() { return isoJour(new Date()); }
function lireNombre(v) {
  if (v === null || v === undefined) return null;
  const t = String(v).replace(/[\s  €]/g, "").replace(",", ".");
  if (t === "") return null;
  const n = Number(t);
  return isFinite(n) ? n : NaN;
}
function saisieNombre(n, dec) { return n === null || n === undefined || !isFinite(n) ? "" : String(+n.toFixed(dec)).replace(".", ","); }
function refData() { return (M && M.ref) || { enveloppes: [], types: [], actifs: [], cours: {}, detenu: [], journal: [], raccourcis: [] }; }
function quantiteTenue(env, code) { const x = refData().detenu.find(d => d.env === env && d.code === code); return x ? x.qte : 0; }
function typeInfo(nom) { return refData().types.find(t => t.nom === nom) || { tresorerie: 0, quantite: 0, flux: 0 }; }
function qteBrute(v) { return !ok(v) ? "—" : nf(0, 6).format(v); }   // quantités de la saisie : jamais masquées

/** Dernière enveloppe utilisée si elle existe encore dans le fichier, sinon la première */
function envParDefaut() {
  const l = (refData().enveloppes || []).map(e => typeof e === "string" ? e : e.nom), der = stock.get("versus.moi.derniereEnv");
  return der && (!l.length || l.includes(der)) ? der : (l[0] || der || "");
}
function formulaire(partiel) {
  const f = Object.assign({ type: "Achat", date: aujourdhuiISO(), env: envParDefaut(), actif: "", qte: "", prix: "", pilote: "", montant: "", frais: "", apport: false, montantApport: "", forcer: null, erreur: "" }, partiel || {});
  if (!f.pilote) f.pilote = f.qte ? "qte" : "prix";
  if (AVEC_QTE.includes(f.type) && f.actif && !f.prix && !f.qte) { const c = refData().cours[f.actif]; if (c) f.prix = saisieNombre(c, c < 10 ? 4 : 2); }
  return f;
}
function depuisRaccourci(rc) {
  return { type: rc.type, env: rc.env, actif: rc.actif || "", montant: rc.montant !== null && rc.montant !== undefined ? saisieNombre(rc.montant, 2) : "", frais: rc.frais ? saisieNombre(rc.frais, 2) : "", qte: rc.quantite ? saisieNombre(rc.quantite, 6) : "", apport: !!rc.apport, montantApport: rc.montantApport ? saisieNombre(rc.montantApport, 2) : "" };
}
function assurerFeuille() {
  if ($f("m-saisie")) return;
  const d = document.createElement("div");
  d.className = "voile"; d.id = "m-saisie"; d.hidden = true;
  d.innerHTML = '<div class="feuille moi m-feuille" role="dialog" aria-modal="true" aria-labelledby="m-titre-saisie">' +
    '<h3 id="m-titre-saisie">Saisir <button class="icon-btn" type="button" id="m-fermer-saisie" aria-label="Fermer"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></h3>' +
    '<div class="seg m-seg4" role="group" aria-label="Saisie">' +
      '<button type="button" data-m-pane="ordre">Ordre</button><button type="button" data-m-pane="journal">Journal</button>' +
      '<button type="button" data-m-pane="maj">Mises à jour</button><button type="button" data-m-pane="versus">Relevé Versus</button></div>' +
    '<div id="m-pane-ordre"></div><div id="m-pane-journal" hidden></div><div id="m-pane-maj" hidden></div></div>';
  document.body.appendChild(d);
  d.addEventListener("click", e => { if (e.target === d) fermerSaisieM(); });
  $f("m-fermer-saisie").addEventListener("click", fermerSaisieM);
  d.querySelectorAll("[data-m-pane]").forEach(b => b.addEventListener("click", () => {
    confirmeSuppr = null;
    if (b.dataset.mPane === "versus") { fermerSaisieM(); if (typeof ouvrirSaisie === "function") ouvrirSaisie(); return; }
    paneSaisie(b.dataset.mPane);
  }));
  document.addEventListener("keydown", e => { if (e.key === "Escape") fermerSaisieM(); });
}
function ouvrirSaisieM(partiel, onglet) {
  injecterStyle(); assurerFeuille(); lireCache();
  if (!M) { toast("Lecture de ton fichier en cours, réessaie dans un instant."); charger(false); return; }
  F = formulaire(partiel);
  synchroniser();
  nommerRaccourci = false;
  $f("m-saisie").hidden = false;
  paneSaisie(onglet || "ordre");
}
function fermerSaisieM() { const s = $f("m-saisie"); if (s) s.hidden = true; confirmeSuppr = null; gererRaccourcis = false; }
function paneSaisie(o) {
  document.querySelectorAll("[data-m-pane]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.mPane === o)));
  ["ordre", "journal", "maj"].forEach(k => { $f("m-pane-" + k).hidden = k !== o; });
  if (o === "ordre") rendreFormulaire(); else if (o === "journal") rendreJournal(); else rendreMaj();
}
/* quantité <-> prix par part : celui que tu as saisi en dernier pilote l'autre */
function netOrdre() {
  const m = lireNombre(F.montant), fr = lireNombre(F.frais) || 0;
  if (!(m > 0)) return null;
  return m + (isNaN(fr) ? 0 : fr) * typeInfo(F.type).tresorerie;
}
function synchroniser() {
  if (!AVEC_QTE.includes(F.type)) return;
  const net = netOrdre();
  if (!(net > 0)) return;
  if (F.pilote === "prix") { const p = lireNombre(F.prix); if (p > 0) F.qte = saisieNombre(net / p, 6); }
  else { const q = lireNombre(F.qte); if (q > 0) F.prix = saisieNombre(net / q, 4); }
}
function rendreRaccourcis() {
  const liste = refData().raccourcis || [];
  const visibles = tousRaccourcis || gererRaccourcis ? liste : liste.slice(0, 3);
  return '<div class="raccourcis"><span>Raccourcis</span>' +
    visibles.map((r, i) => '<button class="chip' + (gererRaccourcis ? " suppr" : "") + '" type="button" data-rac="' + i + '">' + (gererRaccourcis ? "✕ " : "") + esc(r.nom) + "</button>").join("") +
    (liste.length > 3 && !gererRaccourcis ? '<button class="lien" type="button" id="rac-plus">' + (tousRaccourcis ? "Voir moins" : "Voir + (" + (liste.length - 3) + ")") + "</button>" : "") +
    (liste.length ? '<button class="lien" type="button" id="rac-gerer">' + (gererRaccourcis ? "Terminé" : "Gérer") + "</button>" : '<span class="info">aucun pour l\'instant : « Enregistrer comme raccourci » en bas</span>') +
    "</div>";
}
function rendreFormulaire() {
  const r = refData();
  const ouvertes = r.enveloppes.filter(e => !e.statut || e.statut === "Ouvert");
  if (!ouvertes.find(e => e.nom === F.env) && ouvertes.length) F.env = ouvertes[0].nom;
  const groupeEnv = (liste, lab) => liste.length ? '<optgroup label="' + lab + '">' + liste.map(e => '<option value="' + esc(e.nom) + '"' + (e.nom === F.env ? " selected" : "") + ">" + esc(e.nom) + "</option>").join("") + "</optgroup>" : "";
  const autres = r.types.map(t => t.nom).filter(n => !PRINCIPAUX.includes(n));
  const tenus = r.detenu.filter(d => d.env === F.env && d.qte > 1e-9).map(d => d.code);
  const nomA = c => (r.actifs.find(a => a.code === c) || {}).nom || "";
  const optA = c => '<option value="' + esc(c) + '"' + (c === F.actif ? " selected" : "") + ">" + esc(c) + (nomA(c) ? " · " + esc(nomA(c)) : "") + "</option>";
  const autresActifs = r.actifs.map(a => a.code).filter(c => !tenus.includes(c));
  if (AVEC_ACTIF.includes(F.type) && !F.actif && F.type !== "Achat" && tenus.length) { F.actif = tenus[0]; F = formulaire(F); }
  const avecActif = AVEC_ACTIF.includes(F.type), avecQte = AVEC_QTE.includes(F.type), avecFrais = AVEC_FRAIS.includes(F.type);
  $f("m-pane-ordre").innerHTML =
    '<form class="form" id="m-form-ordre" novalidate>' +
      rendreRaccourcis() +
      '<div class="types" role="group" aria-label="Type d\'ordre">' + PRINCIPAUX.map(t => '<button type="button" class="type-btn" data-type="' + t + '" aria-pressed="' + (F.type === t) + '">' + t + "</button>").join("") + "</div>" +
      '<div class="rang">' +
        '<div class="champ"><label for="f-date">Date</label><input id="f-date" type="date" value="' + esc(F.date) + '"></div>' +
        '<div class="champ"><label for="f-autre">Autre type</label><select id="f-autre"><option value="">Choisir…</option>' + autres.map(t => '<option value="' + esc(t) + '"' + (F.type === t ? " selected" : "") + ">" + esc(t) + "</option>").join("") + "</select></div>" +
      "</div>" +
      '<div class="champ"><label for="fo-env">Enveloppe</label><select id="fo-env">' +
        groupeEnv(ouvertes.filter(e => e.perimetre === "Portefeuille"), "Bourse") + groupeEnv(ouvertes.filter(e => e.perimetre !== "Portefeuille"), "Épargne") + "</select></div>" +
      (avecActif ? '<div class="champ"><label for="f-actif">Actif</label><select id="f-actif"><option value="">Choisir l\'actif…</option>' +
        (tenus.length ? '<optgroup label="Détenus dans cette enveloppe">' + tenus.map(optA).join("") + "</optgroup>" : "") +
        '<optgroup label="Autres actifs">' + autresActifs.map(optA).join("") + "</optgroup></select>" +
        '<span class="aide">Actif absent de la liste ? <button class="lien" type="button" id="f-nouvel-actif">Ajouter un nouvel actif</button></span></div>' : "") +
      '<div class="champ"><label for="f-montant">' + esc(LIB_MONTANT[F.type] || "Montant") + ' (€)</label><input id="f-montant" type="text" inputmode="decimal" autocomplete="off" value="' + esc(F.montant) + '" placeholder="0,00"></div>' +
      (avecQte ? '<div class="rang">' +
        '<div class="champ"><label for="f-qte">Quantité</label><input id="f-qte" type="text" inputmode="decimal" autocomplete="off" value="' + esc(F.qte) + '" placeholder="0"></div>' +
        '<div class="champ"><label for="f-prix">Prix par part (€)</label><input id="f-prix" type="text" inputmode="decimal" autocomplete="off" value="' + esc(F.prix) + '" placeholder="0,00"></div>' +
        '</div><span class="aide lie">Saisis la quantité ou le prix par part : l\'autre se calcule à partir du montant' + (avecFrais ? " hors frais" : "") + ".</span>" : "") +
      (avecFrais ? '<div class="champ"><label for="f-frais">Dont frais (€)</label><input id="f-frais" type="text" inputmode="decimal" autocomplete="off" value="' + esc(F.frais) + '" placeholder="0,00"></div>' : "") +
      (F.type === "Achat" ? '<label class="coche"><input type="checkbox" id="f-apport"' + (F.apport ? " checked" : "") + '> Enregistrer aussi l\'apport qui finance cet achat</label>' +
        (F.apport ? '<div class="champ"><label for="f-mapport">Montant de l\'apport (€)</label><input id="f-mapport" type="text" inputmode="decimal" autocomplete="off" value="' + esc(F.montantApport) + '" placeholder="Identique au montant de l\'achat"></div>' : "") : "") +
      '<div class="recap" id="m-recap"></div>' +
      '<div class="alertes" id="m-alertes"></div>' +
      '<button class="btn plein acc" type="submit" id="f-envoyer">Enregistrer l\'ordre</button>' +
      '<div class="pied-form">' +
        (nommerRaccourci
          ? '<div class="nommer"><input id="f-nom-rac" type="text" maxlength="40" aria-label="Nom du raccourci" value="' + esc(nomParDefaut()) + '"><button class="mini-btn" type="button" id="rac-ok">Créer</button><button class="lien" type="button" id="rac-annuler">Annuler</button></div>'
          : '<button class="lien" type="button" id="rac-creer">Enregistrer comme raccourci</button>') +
        '<button class="lien" type="button" id="f-vider">Vider le formulaire</button>' +
      "</div>" +
    "</form>";
  const form = $f("m-form-ordre");
  form.querySelectorAll("[data-type]").forEach(b => b.addEventListener("click", () => { F = formulaire({ type: b.dataset.type, date: F.date, env: F.env, actif: AVEC_ACTIF.includes(b.dataset.type) ? F.actif : "", montant: F.montant }); synchroniser(); rendreFormulaire(); }));
  $f("f-autre").addEventListener("change", e => { if (e.target.value) { F = formulaire({ type: e.target.value, date: F.date, env: F.env, montant: F.montant }); rendreFormulaire(); } });
  $f("fo-env").addEventListener("change", e => { F = formulaire({ type: F.type, date: F.date, env: e.target.value, montant: F.montant, frais: F.frais }); rendreFormulaire(); });
  if ($f("f-actif")) $f("f-actif").addEventListener("change", e => { F = formulaire({ type: F.type, date: F.date, env: F.env, actif: e.target.value, montant: F.montant, frais: F.frais, apport: F.apport, montantApport: F.montantApport }); synchroniser(); rendreFormulaire(); });
  if ($f("f-apport")) $f("f-apport").addEventListener("change", e => { F.apport = e.target.checked; rendreFormulaire(); });
  if ($f("f-nouvel-actif")) $f("f-nouvel-actif").addEventListener("click", () => { reglageOuvert = null; paneSaisie("maj"); setTimeout(() => { const el = document.querySelector('#m-pane-maj [data-reg="actif"]'); if (el) el.scrollIntoView({ block: "start" }); }, 40); });
  [["f-date", "date"], ["f-montant", "montant"], ["f-frais", "frais"], ["f-mapport", "montantApport"], ["f-qte", "qte"], ["f-prix", "prix"]].forEach(([id, k]) => {
    const el = $f(id);
    if (!el) return;
    el.addEventListener("input", () => {
      F[k] = el.value; F.forcer = null; F.erreur = "";
      if (k === "qte" || k === "prix") F.pilote = k;
      synchroniser();
      if (k !== "qte" && $f("f-qte")) $f("f-qte").value = F.qte;
      if (k !== "prix" && $f("f-prix")) $f("f-prix").value = F.prix;
      majRecap();
    });
  });
  form.querySelectorAll("[data-rac]").forEach(b => b.addEventListener("click", () => {
    const i = +b.dataset.rac, liste = (refData().raccourcis || []).slice();
    if (gererRaccourcis) { liste.splice(i, 1); sauverRaccourcis(liste); rendreFormulaire(); return; }
    F = formulaire(depuisRaccourci(liste[i])); synchroniser(); rendreFormulaire();
  }));
  if ($f("rac-plus")) $f("rac-plus").addEventListener("click", () => { tousRaccourcis = !tousRaccourcis; rendreFormulaire(); });
  if ($f("rac-gerer")) $f("rac-gerer").addEventListener("click", () => { gererRaccourcis = !gererRaccourcis; rendreFormulaire(); });
  if ($f("rac-creer")) $f("rac-creer").addEventListener("click", () => { nommerRaccourci = true; rendreFormulaire(); setTimeout(() => { const i = $f("f-nom-rac"); if (i) { i.focus(); i.select(); } }, 30); });
  if ($f("rac-annuler")) $f("rac-annuler").addEventListener("click", () => { nommerRaccourci = false; rendreFormulaire(); });
  if ($f("rac-ok")) $f("rac-ok").addEventListener("click", () => {
    const nom = ($f("f-nom-rac").value || "").trim() || nomParDefaut();
    const liste = (refData().raccourcis || []).slice();
    liste.push({ nom: nom, type: F.type, env: F.env, actif: AVEC_ACTIF.includes(F.type) ? F.actif : "", montant: lireNombre(F.montant), frais: lireNombre(F.frais), quantite: F.pilote === "qte" ? lireNombre(F.qte) : null, apport: F.type === "Achat" && F.apport, montantApport: lireNombre(F.montantApport) });
    nommerRaccourci = false;
    sauverRaccourcis(liste);
    rendreFormulaire();
    toast("Raccourci « " + nom + " » créé.");
  });
  $f("f-vider").addEventListener("click", () => { F = formulaire({ type: F.type, env: F.env }); nommerRaccourci = false; rendreFormulaire(); });
  form.addEventListener("submit", e => { e.preventDefault(); envoyerOrdre(false); });
  majRecap();
}
function nomParDefaut() {
  const m = lireNombre(F.montant);
  return (F.type + (F.actif ? " " + F.actif : "") + (m > 0 ? " " + saisieNombre(m, 0) + " €" : "")).slice(0, 40);
}
async function posterFichier(corps) {
  if (simulationM()) return { ok: false, erreur: "simulation", message: MSG_SIM };
  const ctrl = window.AbortController ? new AbortController() : null;
  const minuteur = setTimeout(() => { if (ctrl) ctrl.abort(); }, 45000);
  try {
    const rep = await fetch(adresse(), { method: "POST", body: JSON.stringify(Object.assign({ cle: cle() }, corps)), signal: ctrl ? ctrl.signal : undefined });
    return await rep.json();
  } catch (e) {
    return { ok: false, erreur: "reseau", message: "Impossible de joindre ton fichier : vérifie ta connexion puis réessaie." };
  } finally { clearTimeout(minuteur); }
}
async function sauverRaccourcis(liste) {
  if (M && M.ref) M.ref.raccourcis = liste;
  stock.set(K.cache, JSON.stringify(M));
  const rep = await posterFichier({ action: "raccourcis", raccourcis: liste });
  if (!rep.ok) toast("Raccourcis non enregistrés sur ton fichier : " + (rep.message || "erreur"));
}
function analyser() {
  const r = refData(), t = typeInfo(F.type);
  const q = lireNombre(F.qte), m = lireNombre(F.montant), fr = lireNombre(F.frais) || 0;
  const msg = [], lignes = [];
  let bloque = false;
  if (!F.date) { bloque = true; msg.push(["err", "Choisis une date."]); }
  if (AVEC_ACTIF.includes(F.type) && !F.actif) bloque = true;
  if (m === null) bloque = true;
  else if (isNaN(m)) { bloque = true; msg.push(["err", "Montant illisible."]); }
  else if (F.type !== "Ajustement espèces" && m <= 0) { bloque = true; msg.push(["err", "Le montant doit être positif : c'est le type qui donne le sens."]); }
  if (AVEC_QTE.includes(F.type)) {
    if (q === null) bloque = true;
    else if (isNaN(q) || q <= 0) { bloque = true; msg.push(["err", "La quantité doit être supérieure à 0."]); }
  }
  if (isNaN(fr) || (fr && m > 0 && fr > m)) { bloque = true; msg.push(["err", "Les frais doivent être positifs et inférieurs au montant."]); }
  const tenu = F.actif ? quantiteTenue(F.env, F.actif) : 0;
  const c = F.actif ? r.cours[F.actif] : null;
  if ((F.type === "Vente" || F.type === "Frais en parts") && F.actif) {
    lignes.push(["Détenu aujourd'hui", qteBrute(tenu) + " " + esc(F.actif) + (tenu > 0 && F.type === "Vente" ? ' <button class="mini-btn" type="button" id="tout-vendre">Tout</button>' : "")]);
    if (q > tenu + 1e-9) { bloque = true; msg.push(["err", "Tu ne détiens que " + qteBrute(tenu) + " " + F.actif + " dans " + F.env + "."]); }
  }
  if ((F.type === "Achat" || F.type === "Vente") && q > 0 && m > 0 && c) {
    const pu = (m + fr * t.tresorerie) / q;
    lignes.push(["Cours actuel", nf(c < 1 ? 4 : 2, c < 1 ? 4 : 2).format(c) + NB + "€ · écart " + pct(pu / c - 1)]);
    if (Math.abs(pu / c - 1) > .5) msg.push(["warn", "Écart de plus de 50 % avec le cours actuel : vérifie la quantité et le montant (virgule mal placée ?)."]);
  }
  if (F.actif && q > 0 && t.quantite) lignes.push(["Détenu après l'ordre", qteBrute(+(tenu + q * t.quantite).toFixed(6)) + " " + esc(F.actif)]);
  if (F.type === "Achat" && F.apport) {
    const ma = lireNombre(F.montantApport);
    if (ma !== null && (isNaN(ma) || ma <= 0)) { bloque = true; msg.push(["err", "Montant de l'apport illisible."]); }
    lignes.push(["Apport enregistré avant l'achat", nf(2, 2).format(ma === null ? m : ma) + NB + "€"]);
  }
  if (F.date && F.date > aujourdhuiISO()) msg.push(["warn", "Ordre programmé : il restera ignoré par les calculs jusqu'au " + frDate(F.date) + "."]);
  return { bloque, msg, lignes };
}
function majRecap() {
  const a = analyser();
  $f("m-recap").innerHTML = a.lignes.map(l => "<div><span>" + l[0] + "</span><b>" + l[1] + "</b></div>").join("");
  $f("m-recap").hidden = !a.lignes.length;
  let al = a.msg.map(m => '<div class="alerte ' + m[0] + '">' + esc(m[1]) + "</div>").join("");
  if (F.erreur) al += '<div class="alerte err">' + esc(F.erreur) + "</div>";
  if (F.forcer) al += '<div class="alerte warn">' + esc(F.forcer) + '<br><button class="btn" type="button" id="forcer">Enregistrer quand même</button></div>';
  $f("m-alertes").innerHTML = al;
  const btn = $f("f-envoyer");
  btn.disabled = a.bloque;
  btn.textContent = F.type === "Achat" && F.apport ? "Enregistrer l'apport et l'achat" : "Enregistrer l'ordre";
  if ($f("tout-vendre")) $f("tout-vendre").addEventListener("click", () => { F.qte = saisieNombre(quantiteTenue(F.env, F.actif), 8); F.pilote = "qte"; synchroniser(); $f("f-qte").value = F.qte; if ($f("f-prix")) $f("f-prix").value = F.prix; majRecap(); });
  if ($f("forcer")) $f("forcer").addEventListener("click", () => envoyerOrdre(true));
}
/* Envoi optimiste : la feuille se ferme tout de suite, l'enregistrement continue en arrière-plan */
async function envoyerOrdre(forcer) {
  const a = analyser();
  if (a.bloque) return;
  const base = { date: F.date, enveloppe: F.env };
  const ordres = [];
  if (F.type === "Achat" && F.apport) {
    const ma = lireNombre(F.montantApport);
    ordres.push(Object.assign({}, base, { type: "Apport", montant: ma === null ? lireNombre(F.montant) : ma }));
  }
  ordres.push(Object.assign({}, base, {
    type: F.type, actif: AVEC_ACTIF.includes(F.type) ? F.actif : "",
    quantite: AVEC_QTE.includes(F.type) ? lireNombre(F.qte) : null,
    montant: lireNombre(F.montant), frais: AVEC_FRAIS.includes(F.type) ? lireNombre(F.frais) : null
  }));
  stock.set("versus.moi.derniereEnv", F.env);
  const sauvegarde = Object.assign({}, F);
  fermerSaisieM();
  toast("Enregistrement de l'ordre…");
  const enAttente = ordres.map(o => Object.assign({ app: false, envoi: true, ligne: 0 }, o, { quantite: o.quantite === undefined ? null : o.quantite }));
  if (M && M.ref) M.ref.journal = enAttente.reverse().concat(M.ref.journal || []);
  const rep = await posterFichier({ action: "ordre", ordres: ordres, forcer: !!forcer });
  if (M && M.ref) M.ref.journal = (M.ref.journal || []).filter(o => !o.envoi);
  if (rep.ok) { toast(rep.message || "Ordre enregistré."); charger(true); return; }
  if (rep.erreur === "cle") { stock.del(K.cle); toast(rep.message || "Clé refusée par ton fichier."); return; }
  toast(rep.erreur === "avertissement" ? "Ordre à confirmer." : "Ordre non enregistré.");
  F = sauvegarde;
  if (rep.erreur === "avertissement") F.forcer = rep.message; else F.erreur = rep.message || "Erreur inattendue.";
  $f("m-saisie").hidden = false;
  paneSaisie("ordre");
}
function rendreJournal() {
  const j = refData().journal || [];
  const auj = aujourdhuiISO();
  const z = $f("m-pane-journal");
  if (!j.length) { z.innerHTML = '<div class="vide">Aucun ordre pour l\'instant.</div>'; return; }
  z.innerHTML = '<p class="info">Les 30 derniers ordres de ton onglet Ordres. « Refaire » reprend un ordre à la date du jour ; seuls les ordres saisis depuis l\'app depuis moins de 7 jours peuvent être supprimés.</p><div class="m-jo">' +
    j.map((o, i) => '<div class="jr' + (o.envoi ? " envoi" : "") + '"><div class="jd">' + o.date.slice(8, 10) + "/" + o.date.slice(5, 7) + "<small>" + o.date.slice(0, 4) + "</small></div>" +
      '<div class="jm"><b>' + esc(o.type) + (o.actif ? " " + esc(o.actif) : "") + (o.envoi ? '<span class="tag app">envoi…</span>' : "") + (o.date > auj ? '<span class="tag prog">programmé</span>' : "") + (o.app ? '<span class="tag app">saisi ici</span>' : "") + "</b>" +
      "<span>" + esc(o.enveloppe) + (o.quantite !== null && o.quantite !== undefined ? " · " + qteBrute(o.quantite) + " part" + (o.quantite > 1 ? "s" : "") : "") + (o.frais ? " · frais " + eur(o.frais, 2) : "") + "</span></div>" +
      '<div class="jv">' + eur(o.montant, 2) + "</div>" +
      (o.envoi ? "" : '<div class="ja"><button class="lien" type="button" data-refaire="' + i + '">Refaire</button>' +
      (o.app ? '<button class="lien danger" type="button" data-suppr="' + i + '">' + (confirmeSuppr === i ? "Confirmer la suppression" : "Supprimer") + "</button>" : "") + "</div>") + "</div>").join("") + "</div>";
  z.querySelectorAll("[data-refaire]").forEach(b => b.addEventListener("click", () => {
    const o = j[+b.dataset.refaire];
    ouvrirSaisieM({ type: o.type, env: o.enveloppe, actif: o.actif || "", qte: o.quantite !== null && o.quantite !== undefined ? saisieNombre(o.quantite, 8) : "", montant: saisieNombre(o.montant, 2), frais: o.frais ? saisieNombre(o.frais, 2) : "" }, "ordre");
  }));
  z.querySelectorAll("[data-suppr]").forEach(b => b.addEventListener("click", async () => {
    const i = +b.dataset.suppr;
    if (confirmeSuppr !== i) { confirmeSuppr = i; rendreJournal(); return; }
    confirmeSuppr = null;
    const o = j[i];
    M.ref.journal = j.filter((x, k) => k !== i);
    rendreJournal();
    toast("Suppression en cours…");
    const rep = await posterFichier({ action: "supprimer", ordre: o });
    if (rep.ok) { toast(rep.message || "Ordre supprimé."); charger(true); }
    else { toast(rep.message || "Suppression impossible."); M.ref.journal = j; if (!$f("m-saisie").hidden) rendreJournal(); }
  }));
}

/* ---- Mises à jour du fichier : rappels (taux, fonds euros, Artema, appartement), nouvel actif, alertes de cours ---- */
function nomRappel(n) { return String(n || "").replace(/\s*\((bloc ci-contre|Ordres[^)]*|fixe)\)/g, "").trim(); }
function cleRappel(n) {
  if (/^Taux des livrets/.test(n)) return "taux";
  if (/fonds euros/i.test(n)) return "fondsEuros";
  if (/Artema : niveau initial/.test(n)) return "artemaInitial";
  if (/Artema : niveau actuel/.test(n)) return "artemaActuel";
  if (/^Relevé Quintessa/.test(n)) return "releve";
  if (/^Intérêts annuels/.test(n)) return "interets";
  if (/appartement/i.test(n)) return "appart";
  if (/^Versement Quintessa/.test(n)) return "versement";
  if (/Calendrier/.test(n)) return "calendrier";
  return "";
}
function pourcent(v) { return v === null || v === undefined || v === "" ? "" : saisieNombre(v * 100, 3); }
function champ(id, lab, val, attrs) {
  return '<div class="champ"><label for="' + id + '">' + lab + '</label><input id="' + id + '" type="' + ((attrs && attrs.type) || "text") + '"' + (attrs && attrs.type === "date" ? "" : ' inputmode="decimal"') + ' autocomplete="off" value="' + esc(val === null || val === undefined ? "" : val) + '"' + (attrs && attrs.ph ? ' placeholder="' + esc(attrs.ph) + '"' : "") + "></div>";
}
function formReglage(k) {
  const p = (M && M.parametres) || {};
  const msg = reglageMsg[k] ? '<div class="alerte ' + reglageMsg[k][0] + '">' + esc(reglageMsg[k][1]) + "</div>" : "";
  const btn = '<button class="btn" type="submit">Enregistrer</button>';
  const rap = rappelsFichier().find(r => cleRappel(r.nom) === k) || {};
  if (k === "taux") {
    const t = p.taux || {};
    return '<form class="form reg-form" data-form="taux"><p class="info">Dernier changement le ' + frDate(t.date) + ". Saisis les nouveaux taux annoncés par l'État (en %)." + (t.place !== undefined ? " Place restante : " + t.place + " ligne(s)." : "") + "</p>" +
      champ("r-date", "Date d'effet", rap.prochaine || "", { type: "date" }) +
      '<div class="rang trois">' + (t.livretA !== null && t.livretA !== undefined ? champ("r-la", "Livret A (%)", pourcent(t.livretA)) : "") + (t.ldds !== null && t.ldds !== undefined ? champ("r-ld", "LDDS (%)", pourcent(t.ldds)) : "") + (t.lep !== null && t.lep !== undefined ? champ("r-le", "LEP (%)", pourcent(t.lep)) : "") + "</div>" + msg + btn + "</form>";
  }
  if (k === "fondsEuros") {
    const f = p.fondsEuros || {};
    return '<form class="form reg-form" data-form="fondsEuros"><p class="info">Taux servi par Quintessa pour l\'année écoulée, net de frais, avant bonus et prélèvements sociaux. Dernier saisi : ' + pct(f.taux, 2, false) + " pour " + (f.annee || "—") + ".</p>" +
      '<div class="rang">' + champ("r-an", "Année", f.annee ? f.annee + 1 : "") + champ("r-taux", "Taux net (%)", "") + "</div>" + msg + btn + "</form>";
  }
  if (k === "artemaInitial") {
    const a = p.artema || {};
    return '<form class="form reg-form" data-form="artemaInitial"><p class="info">Niveau de l\'indice à la date de constatation initiale (indiqué par la banque après le 5 décembre 2026).</p>' +
      champ("r-niv", "Niveau initial", a.initial === null || a.initial === undefined ? "" : saisieNombre(a.initial, 4)) + msg + btn + "</form>";
  }
  if (k === "artemaActuel") {
    const a = p.artema || {};
    return '<form class="form reg-form" data-form="artemaActuel"><p class="info">Niveau actuel de l\'indice, une fois par an avant chaque date de constatation.</p>' +
      '<div class="rang">' + champ("r-niv", "Niveau actuel", a.actuel === null || a.actuel === undefined ? "" : saisieNombre(a.actuel, 4)) + champ("r-date", "Relevé le", a.date || aujourdhuiISO(), { type: "date" }) + "</div>" + msg + btn + "</form>";
  }
  if (k === "appart") {
    const a = p.appart || {};
    return '<form class="form reg-form" data-form="appart"><p class="info">Valeur utilisée pour le patrimoine net. Par défaut, le prix d\'achat hors frais de notaire.</p>' +
      champ("r-prix", "Valeur de l'appartement (€)", a.prix ? saisieNombre(a.prix, 0) : "") + msg + btn + "</form>";
  }
  if (k === "calendrier") return '<p class="info reg-info">La liste des jours fériés d\'Euronext et de Wall Street se complète directement dans Paramètres du Sheet (colonnes « Bourses fermées »), une fois par an.</p>';
  return "";
}
function coursConnu(c) { const r = refData(); let v = r.cours[c]; (M.groupes || []).forEach(g => g.lignes.forEach(l => { if (l.code === c && l.cours) v = l.cours; })); return v; }
function rendreMaj() {
  const z = $f("m-pane-maj"); const p = (M && M.parametres) || null;
  if (!p) { z.innerHTML = '<p class="info">Paramètres de ton fichier indisponibles.</p>'; return; }
  const r = refData();
  const rappels = rappelsFichier().map(x => {
    const k = cleRappel(x.nom);
    const etat = /À faire|mettre à jour/i.test(x.statut) ? "faire" : /À jour|Fait/.test(x.statut) ? "ok" : "neutre";
    const quand = x.prochaine && /^\d{4}-/.test(x.prochaine) ? "prochaine le " + frDate(x.prochaine) : (x.derniere && !/^\d{4}-/.test(String(x.derniere)) ? String(x.derniere) : (x.derniere ? "dernière le " + frDate(x.derniere) : ""));
    const ouvert = reglageOuvert === k;
    return '<div class="rap' + (ouvert ? " ouvert" : "") + '" data-reg="' + k + '">' +
      (k ? '<button type="button" class="rap-h" data-rap="' + k + '" aria-expanded="' + ouvert + '">' : '<div class="rap-h fixe">') + '<span class="pt ' + etat + '"></span><span class="rap-n">' + esc(nomRappel(x.nom)) + "<small>" + esc(quand) + "</small></span>" +
      '<span class="st ' + etat + '">' + (etat === "faire" ? "À faire" : etat === "ok" ? "À jour" : "—") + "</span>" + (k ? "</button>" : "</div>") +
      (ouvert ? '<div class="rap-c">' + formReglage(k) + "</div>" : "") + "</div>";
  }).join("");
  const alertes = M.alertes || [];
  const codesAlerte = Array.from(new Set((r.detenu || []).map(d => d.code).concat(r.actifs.filter(a => r.cours[a.code]).map(a => a.code))));
  const classes = Array.from(new Set((p.classes || []).concat(["Actions", "Obligations", "Or", "Crypto", "Monétaire", "Immobilier"])));
  const zones = Array.from(new Set((p.zones || []).concat(["Monde", "États-Unis", "Europe", "France", "Émergents", "Asie"])));
  const opt = (l, v) => l.map(x => '<option value="' + esc(x) + '"' + (x === v ? " selected" : "") + ">" + esc(x) + "</option>").join("");
  const mA = reglageMsg.actif ? '<div class="alerte ' + reglageMsg.actif[0] + '">' + esc(reglageMsg.actif[1]) + "</div>" : "";
  const mAl = reglageMsg.alertes ? '<div class="alerte ' + reglageMsg.alertes[0] + '">' + esc(reglageMsg.alertes[1]) + "</div>" : "";
  const pre = alertePre || {};
  z.innerHTML =
    '<h4 class="m-h4">Rappels de ton fichier <small>touche pour mettre à jour</small></h4><div class="raps">' + rappels + "</div>" +
    '<h4 class="m-h4" data-reg="actif">Nouvel actif <small>avant un premier achat</small></h4>' +
      '<form class="form reg-form" data-form="actif">' +
        '<div class="rang">' + champ("a-code", "Code (court, unique)", "", { ph: "ex. CW8" }) + champ("a-nom", "Nom", "", { ph: "ex. Amundi MSCI World" }) + "</div>" +
        '<div class="champ"><label for="a-ticker">Ticker Google Finance</label><div class="ligne-champ"><input id="a-ticker" type="text" autocomplete="off" autocapitalize="characters" placeholder="ex. EPA:CW8"><button class="mini-btn" type="button" id="a-verif">Vérifier</button></div><span class="aide" id="a-verif-res">EPA: pour Paris, ETR: pour Xetra, CURRENCY:ETHEUR pour une crypto. Sans ticker, saisis un cours manuel.</span></div>' +
        '<div class="rang">' +
          '<div class="champ"><label for="a-classe">Classe</label><select id="a-classe">' + opt(classes, "Actions") + "</select></div>" +
          '<div class="champ"><label for="a-zone">Zone</label><select id="a-zone">' + opt(zones, "Monde") + "</select></div>" +
        "</div>" +
        '<div class="rang">' +
          '<div class="champ"><label for="a-levier">Levier</label><select id="a-levier"><option>1</option><option>2</option><option>3</option></select></div>' +
          champ("a-manuel", "Cours manuel (€)", "", { ph: "si pas de ticker" }) +
        "</div>" + mA +
        '<button class="btn" type="submit">Ajouter l\'actif</button>' +
      "</form>" +
    '<h4 class="m-h4" data-reg="alertes">Alertes de cours <small>la cloche passe au rouge si l\'une se déclenche</small></h4>' +
      (alertes.length ? '<div class="m-liste">' + alertes.map((a, i) => {
        const c = coursConnu(a.code), declenchee = c && (a.sens === "sous" ? c < a.seuil : c > a.seuil);
        return '<div class="r"><span class="a">' + esc(a.code) + " " + (a.sens === "sous" ? "sous" : "au-dessus de") + " " + cours(a.seuil) + '</span><span class="b"><button class="lien danger" type="button" data-suppr-alerte="' + i + '">Retirer</button></span>' +
          '<span class="c">' + (c ? "cours actuel " + cours(c) : "cours inconnu") + '</span><span class="d ' + (declenchee ? "down" : "") + '">' + (declenchee ? "déclenchée" : "en veille") + "</span></div>";
      }).join("") + "</div>" : '<p class="info">Aucune alerte. Exemple : LQQ sous 9 €.</p>') +
      '<form class="form reg-form" data-form="alerte">' +
        '<div class="rang trois">' +
          '<div class="champ"><label for="al-code">Actif</label><select id="al-code">' + codesAlerte.map(c => '<option' + (c === pre.code ? " selected" : "") + ">" + esc(c) + "</option>").join("") + "</select></div>" +
          '<div class="champ"><label for="al-sens">Quand</label><select id="al-sens"><option value="sous">passe sous</option><option value="dessus">passe au-dessus</option></select></div>' +
          champ("al-seuil", "Seuil (€)", pre.seuil || "") +
        "</div>" + mAl +
        '<button class="btn ghost" type="submit">Ajouter l\'alerte</button>' +
      "</form>";
  alertePre = null;
  z.querySelectorAll("[data-rap]").forEach(b => b.addEventListener("click", () => {
    const k = b.dataset.rap;
    const quint = (r.enveloppes.find(e => /Quintessa/.test(e.nom)) || {}).nom;
    if (k === "releve") { F = formulaire({ type: "Relevé", env: quint, actif: "ARTEMA" }); paneSaisie("ordre"); return; }
    if (k === "interets") { F = formulaire({ type: "Intérêts", env: (r.enveloppes.find(e => /Livret A/.test(e.nom)) || {}).nom, date: (new Date().getFullYear() - 1) + "-12-31" }); paneSaisie("ordre"); return; }
    if (k === "versement") { const rc = (r.raccourcis || []).find(x => /Quintessa/.test(x.env)); F = formulaire(rc ? depuisRaccourci(rc) : { env: quint }); synchroniser(); paneSaisie("ordre"); return; }
    reglageOuvert = reglageOuvert === k ? null : k;
    delete reglageMsg[k];
    rendreMaj();
  }));
  z.querySelectorAll("form[data-form]").forEach(f => f.addEventListener("submit", e => { e.preventDefault(); soumettreReglage(f.dataset.form, f); }));
  z.querySelectorAll("[data-suppr-alerte]").forEach(b => b.addEventListener("click", () => {
    const liste = alertes.slice(); liste.splice(+b.dataset.supprAlerte, 1);
    envoyerReglage("alertes", { action: "alertes", alertes: liste }, null, () => { M.alertes = liste; });
  }));
  const v = $f("a-verif");
  if (v) v.addEventListener("click", async () => {
    const t = ($f("a-ticker").value || "").trim().toUpperCase();
    const res = $f("a-verif-res");
    if (!t) { res.textContent = "Saisis d'abord un ticker."; return; }
    v.disabled = true; res.textContent = "Vérification auprès de Google Finance…";
    const rep = await posterFichier({ action: "verifierTicker", ticker: t });
    v.disabled = false;
    if (rep.ok) { res.textContent = "✓ " + t + " reconnu : " + cours(rep.cours) + (rep.nom ? " · " + rep.nom : ""); if (!$f("a-nom").value && rep.nom) $f("a-nom").value = rep.nom; }
    else res.textContent = rep.message || "Ticker introuvable.";
  });
}
function lireChamp(id) { const el = $f(id); return el ? el.value.trim() : ""; }
function soumettreReglage(type, form) {
  const n = id => lireNombre(lireChamp(id));
  const p = M.parametres || {};
  if (type === "taux") {
    const ids = [["r-la", "livretA"], ["r-ld", "ldds"], ["r-le", "lep"]].filter(x => $f(x[0]));
    const vals = ids.map(x => n(x[0]));
    if (!lireChamp("r-date") || !ids.length || vals.some(x => !(x >= 0 && x < 20))) { reglageMsg.taux = ["err", "Saisis la date et les taux en % (ex. 1,5)."]; rendreMaj(); return; }
    const corps = { action: "taux", date: lireChamp("r-date") };
    ids.forEach((x, i) => { corps[x[1]] = vals[i] / 100; });
    return envoyerReglage("taux", corps, form, () => { p.taux = Object.assign({}, p.taux, corps, { date: lireChamp("r-date") }); propagerTaux(corps); });
  }
  if (type === "fondsEuros") {
    const an = n("r-an"), t = n("r-taux");
    if (!(an >= 2020) || !(t >= 0 && t < 20)) { reglageMsg.fondsEuros = ["err", "Saisis l'année et le taux en % (ex. 3,1)."]; rendreMaj(); return; }
    return envoyerReglage("fondsEuros", { action: "fondsEuros", annee: an, taux: t / 100 }, form, () => { p.fondsEuros = { annee: an, taux: t / 100 }; });
  }
  if (type === "artemaInitial" || type === "artemaActuel") {
    const niv = n("r-niv");
    if (!(niv > 0)) { reglageMsg[type] = ["err", "Saisis le niveau de l'indice."]; rendreMaj(); return; }
    return envoyerReglage(type, { action: "artema", quoi: type === "artemaInitial" ? "initial" : "actuel", niveau: niv, date: lireChamp("r-date") }, form);
  }
  if (type === "appart") {
    const v = n("r-prix");
    if (!(v > 1000)) { reglageMsg.appart = ["err", "Saisis une valeur en euros."]; rendreMaj(); return; }
    return envoyerReglage("appart", { action: "appart", prix: v }, form);
  }
  if (type === "actif") {
    const a = { code: lireChamp("a-code").toUpperCase(), nom: lireChamp("a-nom"), ticker: lireChamp("a-ticker").toUpperCase(), classe: lireChamp("a-classe"), zone: lireChamp("a-zone"), levier: n("a-levier") || 1, coursManuel: n("a-manuel") };
    if (!/^[A-Z0-9_]{2,12}$/.test(a.code) || !a.nom) { reglageMsg.actif = ["err", "Code (2 à 12 lettres ou chiffres) et nom obligatoires."]; rendreMaj(); return; }
    if (refData().actifs.some(x => x.code === a.code)) { reglageMsg.actif = ["err", "Le code " + a.code + " existe déjà."]; rendreMaj(); return; }
    if (!a.ticker && !(a.coursManuel > 0)) { reglageMsg.actif = ["err", "Indique un ticker Google Finance ou un cours manuel."]; rendreMaj(); return; }
    return envoyerReglage("actif", { action: "actif", actif: a }, form, () => { refData().actifs.push({ code: a.code, nom: a.nom, classe: a.classe }); });
  }
  if (type === "alerte") {
    const s = n("al-seuil"), code = lireChamp("al-code");
    if (!code || !(s > 0)) { reglageMsg.alertes = ["err", "Choisis l'actif et un seuil en euros."]; rendreMaj(); return; }
    const liste = (M.alertes || []).concat([{ code: code, sens: lireChamp("al-sens"), seuil: s }]);
    return envoyerReglage("alertes", { action: "alertes", alertes: liste }, form, () => { M.alertes = liste; });
  }
}
/** Administrateur : les taux des livrets (les mêmes pour tous) sont recopiés par le Versus dans les fichiers des autres */
async function propagerTaux(corps) {
  try {
    if (!estAdmin() || typeof SOURCE === "undefined" || SOURCE !== "api") return;
    const rep = await (await fetch(apiUrl(), { method: "POST", body: JSON.stringify(Object.assign({ cle: stock.get(CLES.cle) }, corps, { action: "tauxLivrets" })) })).json();
    toast(rep.message || (rep.ok ? "Taux recopiés chez les autres." : "Taux non recopiés chez les autres."));
  } catch (e) { toast("Taux enregistrés chez toi, mais pas recopiés chez les autres (Versus injoignable)."); }
}
async function envoyerReglage(k, corps, form, local) {
  const btn = form ? form.querySelector('button[type="submit"]') : null;
  if (btn) { btn.disabled = true; btn.textContent = "Enregistrement…"; }
  const rep = await posterFichier(corps);
  if (rep.ok) {
    if (local) local();
    delete reglageMsg[k];
    if (k !== "alertes" && k !== "actif") reglageOuvert = null;
    toast(rep.message || "Enregistré.");
    rendreMaj(); signalerCloche();
    charger(true);
  } else {
    if (rep.erreur === "cle") { stock.del(K.cle); fermerSaisieM(); toast(rep.message || "Clé refusée."); return; }
    reglageMsg[k] = ["err", rep.message || "Erreur inattendue."];
    rendreMaj();
  }
}

/* ================= Missions (privé) : le million, la série de versements, les paliers (repris de Cote) ================= */
const SERIES = [3, 6, 12, 18, 24, 36, 48, 60];
function cleMoisD(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0"); }
function moisSuivant(m, n) { return cleMoisD(new Date(+m.slice(0, 4), +m.slice(5, 7) - 1 + n, 1)); }
function libMois(m, long) { const i = +m.slice(5, 7) - 1; return (long ? MOIS_L[i] : MOIS[i]) + " " + m.slice(0, 4); }
function kEurP(v) { return v >= 1e6 ? F0.format(v / 1e6) + " M€" : v >= 1000 ? F0.format(v / 1000) + " k€" : F0.format(v) + " €"; }
function isoPlus(iso, ans, jours) {
  const d0 = new Date(iso + "T00:00:00"), an = d0.getFullYear() + (ans || 0);
  const d = new Date(an, d0.getMonth(), Math.min(d0.getDate(), new Date(an, d0.getMonth() + 1, 0).getDate()));   // 29/02 + 1 an = 28/02
  d.setDate(d.getDate() + (jours || 0)); return isoJour(d);
}
/* Mois de versement : un versement (n'importe quel compte, n'importe quel montant) suffit */
function serieVersements() {
  const p = ((M && M.ref) || {}).parcours || {};
  const vers = {}; (p.mois || []).forEach(x => { vers[x.m] = x.apports > 0; });
  const auj = cleMoisD(new Date());
  const debut = p.premier ? p.premier.slice(0, 7) : null;
  if (!debut) return { actuelle: 0, record: 0, moisEnCours: false, liste: [], atteintes: {} };
  const liste = [];
  for (let m = debut; m <= auj; m = moisSuivant(m, 1)) liste.push({ m: m, ok: !!vers[m] });
  let run = 0, record = 0; const atteintes = {};
  liste.forEach(x => { run = x.ok ? run + 1 : 0; if (run > record) record = run; SERIES.forEach(n => { if (run >= n && !atteintes[n]) atteintes[n] = x.m; }); });
  const moisEnCours = !!vers[auj];
  let actuelle = 0;
  for (let i = liste.length - 1 - (moisEnCours ? 0 : 1); i >= 0 && liste[i].ok; i--) actuelle++;
  return { actuelle, record, moisEnCours, liste, atteintes };
}
/* Gain de marché (bourse) et versements d'une année, à partir des relevés du soir */
function bilanAnneeM(an) {
  const h = M.historique; if (!h || !h.rows || h.rows.length < 2) return null;
  const kv = h.cols.indexOf("v"), ka = h.cols.indexOf("a"), ki = h.cols.indexOf("ip"), ks = h.cols.indexOf("isp");
  const rows = h.rows.filter(r => Math.floor(r[0] / 10000) === an);
  if (!rows.length) return null;
  const avant = h.rows.filter(r => Math.floor(r[0] / 10000) < an).pop();
  const r0 = avant || null, r1 = rows[rows.length - 1];
  const verse = r1[ka] - (r0 ? r0[ka] : 0);
  const gain = (r1[kv] - (r0 ? r0[kv] : 0)) - verse;
  const base = r0 || rows[0];
  const twr = r1[ki] / base[ki] - 1, sp = ks >= 0 ? r1[ks] / base[ks] - 1 : null;
  const mois = moisParMois().filter(x => x.an === an);
  const tri = mois.slice().sort((a, b) => b.eur - a.eur);
  return { an, verse, gain, twr, sp, meilleur: tri[0] || null, pire: tri.length > 1 ? tri[tri.length - 1] : null, fin: dateNum(r1[0]), valeurFin: r1[kv] };
}
/* Paliers : chaque famille est une suite de seuils */
const FAMILLES = [
  ["pat", "Patrimoine financier", true], ["serie", "Séries de versements", true], ["vente", "Sans vendre", true], ["gainsAn", "Année en cours", true],
  ["bourse", "Portefeuille bourse", false], ["verse", "Argent versé en bourse", false], ["gains", "Gains cumulés", false],
  ["mois", "Mois avec un versement (au total)", false], ["annee", "Ancienneté", false], ["fisc", "Fiscalité allégée", false]
];
function paliers() {
  const s = M.synthese || {}, p = (M.ref || {}).parcours || {}, out = [];
  const auj = isoJour(new Date()), moisAuj = cleMoisD(new Date());
  const ajoute = (groupe, id, court, titre, atteint, quand, part, reste, grand) => out.push({ groupe, id, court, titre, atteint, quand, part, reste: atteint ? "" : reste, grand: grand || court });
  /* seuils en euros : premier mois où la série dépasse le seuil */
  const parSeuil = (groupe, seuils, serie, actuel, titre, unite) => seuils.forEach(seuil => {
    const premier = serie.find(x => x.v >= seuil);
    const atteint = !!premier || actuel >= seuil;
    ajoute(groupe, groupe + seuil, kEurP(seuil).replace(" ", ""), titre(seuil), atteint, atteint ? (premier ? premier.m : moisAuj) : null,
      actuel / seuil, "encore " + eur(Math.max(0, seuil - actuel)) + (unite ? " " + unite : ""), kEurP(seuil));
  });
  const pat = seriePatrimoine().map(x => ({ m: x.an + "-" + String(x.mo).padStart(2, "0"), v: x.bourse + x.epargne }));
  parSeuil("pat", [5000, 10000, 25000, 50000, 75000, 100000, 150000, 200000, 250000, 300000, 500000, 750000, 1000000], pat, s.financier || 0, x => F0.format(x) + " € de patrimoine financier", "(bourse + épargne)");
  const h = M.historique, rows = h && h.rows ? h.rows : [];
  const kv = h ? h.cols.indexOf("v") : -1, ka = h ? h.cols.indexOf("a") : -1;
  const sh = k => rows.map(r => ({ m: String(r[0]).slice(0, 4) + "-" + String(r[0]).slice(4, 6), v: k(r) }));
  if (rows.length && kv >= 0 && ka >= 0) {
    parSeuil("bourse", [1000, 5000, 10000, 25000, 50000, 100000, 250000, 500000], sh(r => r[kv]), s.valeur || 0, x => F0.format(x) + " € en bourse");
    parSeuil("verse", [5000, 10000, 25000, 50000, 100000, 200000], sh(r => r[ka]), s.apports || 0, x => F0.format(x) + " € versés en bourse au total");
    parSeuil("gains", [500, 1000, 5000, 10000, 25000, 50000, 100000], sh(r => r[kv] - r[ka]), s.gain || 0, x => F0.format(x) + " € de gains cumulés", "de gains");
  }
  const sv = serieVersements();
  SERIES.forEach(n => {
    const atteint = sv.record >= n;
    let quand = null, run = 0;
    if (atteint) for (const x of sv.liste) { run = x.ok ? run + 1 : 0; if (run >= n) { quand = x.m; break; } }
    ajoute("serie", "serie" + n, n + "M", n + " mois d'affilée avec un versement", atteint, quand, sv.actuelle / n, "série actuelle : " + sv.actuelle + " / " + n + " mois", n + " MOIS");
  });
  let total = 0; const cumul = {};
  sv.liste.forEach(x => { if (x.ok) { total++; if (!cumul[total]) cumul[total] = x.m; } });
  [12, 24, 36, 50, 100].forEach(n => ajoute("mois", "mois" + n, n + "×", n + " mois avec un versement depuis le début", total >= n, cumul[n] || null, total / n, total + " / " + n + " mois", n + " MOIS"));
  if (p.premier) {
    const depuis = p.derniereVente || p.premier;
    const jours = Math.floor((Date.now() - new Date(depuis + "T00:00:00")) / 864e5);
    (M.simple ? [] : [[6, "6M", "6 mois sans vendre"], [12, "1AN", "1 an sans vendre"], [24, "2ANS", "2 ans sans vendre"], [36, "3ANS", "3 ans sans vendre"]]).forEach(([mo, court, titre]) => {
      const d0 = new Date(depuis + "T00:00:00"), d = new Date(d0.getFullYear(), d0.getMonth() + mo, 1);
      d.setDate(Math.min(d0.getDate(), new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()));   // 31/08 + 6 mois = 28/02
      const date = isoJour(d), tot = Math.round((d - new Date(depuis + "T00:00:00")) / 864e5), atteint = date <= auj;
      ajoute("vente", "vente" + mo + "-" + depuis, court, titre, atteint, atteint ? date.slice(0, 7) : null, jours / tot,
        (p.derniereVente ? "dernière vente le " + frDate(p.derniereVente) + " · " : "") + jours + " j / " + tot + " · le " + frDate(date) + " sans vente", court.replace(/(\d)([A-Z])/, "$1 $2"));
    });
    [1, 2, 3, 5, 10].forEach(n => {
      const date = isoPlus(p.premier, n, 0), atteint = date <= auj;
      const part = (Date.now() - new Date(p.premier + "T00:00:00")) / (new Date(date + "T00:00:00") - new Date(p.premier + "T00:00:00"));
      ajoute("annee", "annee" + n, n + "A", n + (n > 1 ? " ans" : " an") + " d'investissement", atteint, atteint ? date.slice(0, 7) : null, part, "le " + frDate(date), n + (n > 1 ? " ANS" : " AN"));
    });
  }
  ((M.ref || {}).enveloppes || []).filter(e => e.ouverture && e.statut !== "Fermé" && (e.regime === "PEA" || e.regime === "AV")).forEach(e => {
    const n = e.regime === "PEA" ? 5 : 8, date = isoPlus(e.ouverture, n, 0), atteint = date <= auj;
    const part = (Date.now() - new Date(e.ouverture + "T00:00:00")) / (new Date(date + "T00:00:00") - new Date(e.ouverture + "T00:00:00"));
    ajoute("fisc", "fisc-" + e.nom, e.regime + n, e.nom + " a " + n + " ans : fiscalité allégée", atteint, atteint ? date.slice(0, 7) : null, part, "le " + frDate(date), e.regime + " " + n + " ANS");
  });
  const an = new Date().getFullYear(), b = bilanAnneeM(an);
  if (b && b.verse > 0) {
    const atteint = b.gain > b.verse;
    ajoute("gainsAn", "gains" + an, "G>V", "Les gains " + an + " dépassent tes versements de l'année", atteint, atteint ? moisAuj : null,
      Math.max(0, b.gain) / b.verse, "gains " + eur(b.gain, 0, true) + " · versements " + eur(b.verse), "GAINS > VERSÉ");
  }
  return out;
}
/* le plus haut palier franchi et le suivant, par famille */
function paliersCles(liste, familles) {
  return liste.filter((x, i) => familles.includes(x.groupe) &&
    (x.atteint ? !liste.slice(i + 1).some(y => y.groupe === x.groupe && y.atteint) : !liste.slice(0, i).some(y => y.groupe === x.groupe && !y.atteint)));
}
/* fête d'un palier franchi : une seule fois par palier et par appareil (au premier lancement, on note sans fêter) */
/* ================= Récompenses de Moi (privées : calculées et gardées sur cet appareil) =================
   Une récompense tous les deux paliers de chaque famille, et toujours une sur le dernier palier.
   Six sortes d'objets : afficheur, thème, courbe, fête, emblème, titre. Plus des récompenses cachées. */
// [id, nom, type de rendu, famille d'afficheur]
const AFFICHEURS = [
  ["classique", "Palettes", "palette", "Palettes"], ["laiton", "Laiton", "palette", "Palettes"], ["calc", "Calculatrice", "seg", "Segments"],
  ["ticket", "Ticket de caisse", "ticket", "Papier"], ["compteur", "Compteur", "tambour", "Rouleaux"], ["led", "LED de gare", "matrice", "Matrice"],
  ["billet", "Billet", "billet", "Papier"], ["neon", "Néon", "palette", "Lumière"], ["nixie", "Nixie", "palette", "Lumière"],
  ["carte", "Carte black", "carte", "Métal"], ["lingot", "Lingot", "palette", "Métal"], ["prisme", "Prisme", "palette", "Lumière"],
  ["terminal", "Terminal", "palette", "Écran"], ["reveil", "Réveil", "seg", "Segments"]
];
// [id, nom, couleur d'accent, fond de la carte du haut]
const THEMES_M = [
  ["classique", "Classique", null, null],
  ["minuit", "Minuit", "#7FB2FF", "linear-gradient(150deg, #0A1430, #17306A 62%, #0C1838)"],
  ["emeraude", "Émeraude", "#34D399", "linear-gradient(150deg, #04241D, #0F5743 60%, #062C23)"],
  ["bordeaux", "Bordeaux", "#FF7A93", "linear-gradient(150deg, #26050D, #631426 60%, #2C0710)"],
  ["glacier", "Glacier", "#67E8F9", "linear-gradient(150deg, #071F29, #1A5B6E 60%, #0A2733)"],
  ["carbone", "Carbone", "#E5E7EB", "repeating-linear-gradient(135deg, rgba(255,255,255,.035) 0 2px, transparent 2px 6px), linear-gradient(150deg, #141416, #2A2A2E 60%, #111113)"],
  ["or", "Or", "#F5C542", "radial-gradient(120% 90% at 85% 0%, rgba(245,197,66,.35), transparent 60%), linear-gradient(150deg, #171004, #3D2C0B 60%, #140E04)"],
  ["aurore", "Aurore", "#FFB37A", "linear-gradient(150deg, #241036, #6E2550 55%, #A64E2A)"]
];
// [id, nom, couleur (null = celle du thème), effet de la courbe]
const COURBES_M = [["classique", "Classique", null, null], ["etincelles", "Étincelles", null, "etincelles"], ["or", "Or", "#E8B931", "halo"],
  ["neon", "Néon", "#FF4FD8", "halo"], ["comete", "Comète", "#2FD1C0", "comete"], ["flammes", "Flammes", "#FF7A1A", "flammes"]];
// [id, nom, aperçu, style passé à confettis()]
const FETES_M = [["confettis", "Confettis", "🎊", null], ["damier", "Damier", "🏁", "damier"], ["feu", "Feu d'artifice", "🎆", "feu"], ["billets", "Pluie de billets", "💸", "billets"],
  ["lingots", "Lingots", "🪙", "lingots"], ["etoiles", "Étoiles", "✨", "etoiles"], ["fusees", "Fusées", "🚀", "fusees"]];
const EMBLEMES_M = [["pousse", "Pousse", "🌱"], ["abeille", "Abeille", "🐝"], ["hibou", "Hibou", "🦉"], ["tortue", "Tortue", "🐢"], ["renard", "Renard", "🦊"],
  ["aigle", "Aigle", "🦅"], ["lion", "Lion", "🦁"], ["dragon", "Dragon", "🐉"], ["couronne", "Couronne", "👑"], ["taureau", "Taureau", "🐂"]];
const TITRES_M = [["investisseur", "Investisseur"], ["metronome", "Le Métronome"], ["diamant", "Main de diamant"], ["batisseur", "Bâtisseur"], ["rentier", "Rentier"],
  ["veteran", "Vétéran"], ["optimiseur", "Optimiseur fiscal"], ["legende", "Légende"], ["millionnaire", "Millionnaire"], ["increvable", "Increvable"]];
const SORTES = [["aff", "Afficheur", "🔢", "afficheur"], ["theme", "Thème", "🎨", "themeM"], ["courbe", "Courbe", "📈", "courbe"],
  ["fete", "Fête", "🎉", "fete"], ["emb", "Emblème", "🛡️", "emb"], ["titre", "Titre", "🏷️", "titre"]];
const CATALOGUE = { aff: AFFICHEURS, theme: THEMES_M, courbe: COURBES_M, fete: FETES_M, emb: EMBLEMES_M, titre: TITRES_M };
const BASE_M = { aff: "classique", theme: "classique", courbe: "classique", fete: "confettis", emb: "pousse", titre: "investisseur" };
/* Récompenses par famille de paliers : la k-ième case va au k-ième palier pair (2e, 4e…), la dernière au dernier palier. */
const REC_FAM = {
  pat: [[["aff", "led"]], [["aff", "neon"]], [["aff", "nixie"]], [["theme", "or"], ["courbe", "or"]], [["aff", "lingot"]], [["aff", "prisme"]], [["emb", "couronne"], ["titre", "millionnaire"]]],
  serie: [[["aff", "laiton"]], [["emb", "abeille"], ["fete", "damier"]], [["theme", "bordeaux"]], [["titre", "metronome"]]],
  vente: [[["theme", "minuit"]], [["emb", "tortue"], ["titre", "diamant"]]],
  gainsAn: [[["fete", "feu"]]],
  bourse: [[["aff", "ticket"]], [["theme", "emeraude"]], [["theme", "carbone"], ["emb", "lion"]], [["emb", "dragon"], ["titre", "legende"]]],
  verse: [[["aff", "calc"]], [["aff", "billet"], ["fete", "billets"]], [["titre", "batisseur"]]],
  gains: [[["courbe", "etincelles"]], [["aff", "carte"]], [["fete", "lingots"]], [["titre", "rentier"]]],
  mois: [[["aff", "compteur"]], [["emb", "renard"], ["courbe", "comete"]], [["emb", "aigle"]]],
  annee: [[["emb", "hibou"]], [["theme", "glacier"]], [["titre", "veteran"]]],
  fisc: [[["courbe", "neon"]], [["titre", "optimiseur"]]]
};
/* Récompenses cachées : calculées sur tes relevés (ou sur tes visites, pour deux d'entre elles) */
const SECRETS_M = [
  { id: "sangfroid", nom: "Sang-froid", indice: "Garde la main quand tout baisse.", quoi: "Un versement un mois où ton portefeuille a perdu 5 % ou plus.", rec: [["courbe", "flammes"]] },
  { id: "rond", nom: "Compte rond", indice: "Un chiffre bien net…", quoi: "Une bourse qui tombe à 2 € près sur un millier tout rond.", rec: [["aff", "reveil"]] },
  { id: "verte", nom: "Sept à la suite", indice: "Encore, encore, encore…", quoi: "Sept relevés en hausse d'affilée.", rec: [["emb", "taureau"]] },
  { id: "increvable", nom: "Increvable", indice: "Tomber, puis remonter plus haut.", quoi: "Une baisse de 10 % depuis un sommet, puis un nouveau sommet.", rec: [["titre", "increvable"]] },
  { id: "noctambule", nom: "Noctambule", indice: "Les marchés dorment, pas toi.", quoi: "Ouvrir Moi entre minuit et 5 h.", rec: [["aff", "terminal"]] },
  { id: "fidele", nom: "Fidèle", indice: "Passe voir tes chiffres…", quoi: "Ouvrir Moi sept jours d'affilée.", rec: [["fete", "etoiles"]] },
  { id: "nouvelan", nom: "Bonne année", indice: "Commence l'année du bon pied.", quoi: "Un premier relevé de l'année au-dessus du dernier de l'année d'avant.", rec: [["fete", "fusees"]] },
  { id: "parfaite", nom: "Année parfaite", indice: "Douze sur douze.", quoi: "Un versement chacun des douze mois d'une année.", rec: [["theme", "aurore"]] }
];
const cleObj = (t, id) => t + "." + id;
const cleStock = k => "versus.moi." + k + "." + ((M && M.personne) || ETAT.moi || "moi");   // une liste par personne (l'admin peut ouvrir le fichier d'un autre)
/** On sait à qui est le fichier : son propriétaire (profil simple) ou, pour le profil complet, dès que le Versus a répondu (ETAT.moi est alors fiable) */
function identiteSure() { return !!(M && (M.personne || dVersus())); }
const defObj = (t, id) => (CATALOGUE[t] || []).find(x => x[0] === id);
function nomObj(t, id) { const d = defObj(t, id); return d ? d[1] : id; }
function apercuEmb(id) { const d = defObj("emb", id) || EMBLEMES_M[0]; return d[2]; }

/* Visites de Moi (pour Noctambule et Fidèle) : seulement des dates, gardées sur l'appareil */
function noterVisite() {
  const d = new Date(), j = isoJour(d);
  if (d.getHours() < 5) stock.set("versus.moi.nuit", "1");
  let l = []; try { l = JSON.parse(stock.get("versus.moi.jours") || "[]"); } catch (e) { l = []; }
  if (l[l.length - 1] !== j) { l.push(j); stock.set("versus.moi.jours", JSON.stringify(l.slice(-14))); }
}
function secretsAtteints() {
  const ok = new Set(), h = M && M.historique, rows = h && h.rows ? h.rows : [];
  const C = n => h ? h.cols.indexOf(n) : -1, kv = C("v"), ka = C("a"), ki = C("ip");
  if (rows.length > 1 && ki >= 0) {
    const fins = []; rows.forEach(r => { const m = Math.floor(r[0] / 100); if (fins.length && Math.floor(fins[fins.length - 1][0] / 100) === m) fins[fins.length - 1] = r; else fins.push(r); });
    if (ka >= 0) for (let i = 1; i < fins.length; i++) if (fins[i][ki] / fins[i - 1][ki] - 1 <= -0.05 && fins[i][ka] - fins[i - 1][ka] > 0.5) ok.add("sangfroid");
    if (kv >= 0 && rows.some(r => r[kv] >= 1000 && Math.abs(r[kv] - Math.round(r[kv] / 1000) * 1000) <= 2)) ok.add("rond");
    let run = 0; for (let i = 1; i < rows.length; i++) { run = rows[i][ki] > rows[i - 1][ki] ? run + 1 : 0; if (run >= 7) { ok.add("verte"); break; } }
    let pic = rows[0][ki], creux = false;
    for (const r of rows) { if (r[ki] > pic) { if (creux) { ok.add("increvable"); break; } pic = r[ki]; } else if (r[ki] <= pic * 0.9) creux = true; }
    for (let i = 1; i < rows.length; i++) if (Math.floor(rows[i][0] / 10000) > Math.floor(rows[i - 1][0] / 10000) && rows[i][ki] > rows[i - 1][ki]) { ok.add("nouvelan"); break; }
  }
  try {
    const parAn = {}; serieVersements().liste.forEach(x => { const a = x.m.slice(0, 4); parAn[a] = (parAn[a] || 0) + (x.ok ? 1 : 0); });
    if (Object.values(parAn).some(n => n >= 12)) ok.add("parfaite");
  } catch (e) { /* pas de parcours */ }
  if (stock.get("versus.moi.nuit") === "1") ok.add("noctambule");
  let l = []; try { l = JSON.parse(stock.get("versus.moi.jours") || "[]"); } catch (e) { l = []; }
  let suite = 1; for (let i = 1; i < l.length; i++) { suite = (new Date(l[i] + "T12:00:00") - new Date(l[i - 1] + "T12:00:00")) / 864e5 === 1 ? suite + 1 : 1; if (suite >= 7) { ok.add("fidele"); break; } }
  return ok;
}
/* Palier → récompenses (selon la règle « un palier sur deux + le dernier ») */
function recompensesPaliers(pal) {
  const map = new Map();
  FAMILLES.forEach(([g]) => {
    const l = pal.filter(x => x.groupe === g), R = REC_FAM[g]; if (!R || !l.length) return;
    const cases = l.map((x, i) => i).filter(i => i % 2 === 1 || i === l.length - 1);
    cases.forEach((i, j) => { const r = j === cases.length - 1 ? R[R.length - 1] : j < R.length - 1 ? R[j] : null; if (r) map.set(l[i].id, r); });
  });
  return map;
}
let MEMO_OBJ = { m: null, ok: null, pal: null, rec: null, sec: null };
function etatObjets() {
  if (MEMO_OBJ.m === M && M) return MEMO_OBJ;
  const ok = new Set(Object.entries(BASE_M).map(([t, id]) => cleObj(t, id)));
  let vus = []; try { vus = JSON.parse(stock.get(cleStock("objets")) || "[]"); } catch (e) { vus = []; }
  if (!M || !M.personne || M.personne === ETAT.moi) try { JSON.parse(stock.get("versus.moi.afficheurs") || "[]").forEach(id => { if (defObj("aff", id)) ok.add(cleObj("aff", id)); }); } catch (e) { /* ancien format */ }
  vus.forEach(k => ok.add(k));
  let pal = [], rec = new Map(), sec = new Set();
  if (M) {
    try { pal = paliers(); rec = recompensesPaliers(pal); pal.forEach(x => { if (x.atteint && rec.has(x.id)) rec.get(x.id).forEach(([t, id]) => ok.add(cleObj(t, id))); }); } catch (e) { /* données incomplètes */ }
    try { sec = secretsAtteints(); SECRETS_M.forEach(s => { if (sec.has(s.id)) s.rec.forEach(([t, id]) => ok.add(cleObj(t, id))); }); } catch (e) { /* idem */ }
    if (identiteSure()) stock.set(cleStock("objets"), JSON.stringify(Array.from(ok)));
  }
  MEMO_OBJ = { m: M, ok, pal, rec, sec };
  return MEMO_OBJ;
}
function oublierObjets() { MEMO_OBJ = { m: null, ok: null, pal: null, rec: null, sec: null }; }
function actifM(t) { const s = SORTES.find(x => x[0] === t), v = PREF[s[3]] || BASE_M[t]; return M && etatObjets().ok.has(cleObj(t, v)) && defObj(t, v) ? v : BASE_M[t]; }
function afficheurActif() { return actifM("aff"); }
function themeActif() { return defObj("theme", actifM("theme")); }
function couleurMoi() { const t = themeActif(); return t && t[2] ? t[2] : maCouleur(); }
function equiper(t, id) { const s = SORTES.find(x => x[0] === t); PREF[s[3]] = id; garderPref(); if (t === "aff") dernierFlap = ""; }
/* D'où vient un objet (pour le « ? ») */
function origineObj(t, id) {
  if (BASE_M[t] === id) return { base: true };
  const E = etatObjets();
  for (const s of SECRETS_M) if (s.rec.some(r => r[0] === t && r[1] === id)) return { secret: s, ok: E.sec.has(s.id) };
  for (const [pid, l] of E.rec) if (l.some(r => r[0] === t && r[1] === id)) return { palier: E.pal.find(x => x.id === pid) };
  for (const [g, R] of Object.entries(REC_FAM)) if (R.some(c => c.some(r => r[0] === t && r[1] === id))) return { famille: (FAMILLES.find(f => f[0] === g) || [, g])[1] };
  return {};
}
function apercuObj(t, id) {
  const d = defObj(t, id);
  if (t === "aff") return '<span class="m-flaps">' + flaps("128€", false, id) + "</span>";
  if (t === "theme") return '<span class="vs-sw' + (d[3] ? "" : " base") + '" style="' + (d[3] ? "background:" + d[3] + ";" : "") + "--sw:" + (d[2] || maCouleur()) + '"><i></i><i></i></span>';
  if (t === "courbe") { const c = d[2] || couleurMoi(); return '<svg class="vs-cb' + (d[3] ? " fx-" + d[3] : "") + '" viewBox="0 0 56 26" aria-hidden="true"><path class="x" d="M3 21 L13 16 L21 18 L31 9 L40 12 L53 4" stroke="' + c + '"/><path d="M3 21 L13 16 L21 18 L31 9 L40 12 L53 4" stroke="' + c + '"/></svg>'; }
  if (t === "fete" || t === "emb") return '<span class="vs-em">' + d[2] + "</span>";
  if (t === "titre") return '<span class="vs-ti">« ' + esc(d[1]) + " »</span>";
  return "";
}
let vsSel = null;
function htmlVestiaire() {
  const E = etatObjets(), t = SORTES.some(x => x[0] === PREF.vest) ? PREF.vest : "aff";
  const tot = Object.values(CATALOGUE).reduce((n, l) => n + l.length, 0), nb = Object.entries(CATALOGUE).reduce((n, [s, l]) => n + l.filter(d => E.ok.has(cleObj(s, d[0]))).length, 0);
  const th = themeActif(), nom = (M && M.personne) || ETAT.moi || "Moi";
  const prof = '<div class="vs-prof' + (th && th[3] ? " th" : "") + '"' + (th && th[3] ? ' style="background:' + th[3] + '"' : "") + '><span class="vs-av">' + apercuEmb(actifM("emb")) + "</span>" +
    "<div><b>" + esc(nom) + "</b><small>« " + esc(nomObj("titre", actifM("titre"))) + " »</small></div>" +
    '<span class="vs-n"><b>' + nb + "</b> / " + tot + "<small>objets</small></span></div>";
  const onglets = '<div class="chips vs-o" role="tablist" aria-label="Sortes d\'objets">' + SORTES.map(([s, l, ic]) => {
    const n = CATALOGUE[s].filter(d => E.ok.has(cleObj(s, d[0]))).length;
    return '<button class="chip" type="button" role="tab" data-vt="' + s + '" aria-pressed="' + (s === t) + '">' + "<b>" + ic + " " + l + "</b><small>" + n + " / " + CATALOGUE[s].length + "</small></button>";
  }).join("") + "</div>";
  const actif = actifM(t);
  const tuiles = CATALOGUE[t].map(d => {
    const id = d[0], o = E.ok.has(cleObj(t, id)), org = o ? null : origineObj(t, id), cache = !o && org.secret;
    const lab = cache ? "???" : d[1];
    return '<div class="vs-t' + (o ? "" : " verrou") + (cache ? " secret" : "") + (id === actif ? " on" : "") + (vsSel === cleObj(t, id) ? " vs-sel" : "") + '">' +
      '<button type="button" class="vs-b" data-vs="' + t + "." + id + '" aria-label="' + esc(lab) + (id === actif ? " (équipé)" : o ? " (équiper)" : " (verrouillé)") + '">' +
        (t === "titre" ? '<span class="vs-ti">' + esc(lab) + "</span>" + (o ? "" : '<i class="vs-l" aria-hidden="true">🔒</i>') :
        '<span class="vs-p">' + (cache ? '<span class="vs-em">?</span>' : apercuObj(t, id)) + (o ? "" : '<i class="vs-l" aria-hidden="true">🔒</i>') + "</span>" +
        '<span class="vs-nm">' + esc(lab) + "</span>") + (id === actif ? '<span class="vs-ok" aria-hidden="true">✓</span>' : "") + "</button>" +
      '<button type="button" class="vs-q" data-vsq="' + t + "." + id + '" aria-label="D\'où vient ' + esc(lab) + ' ?">?</button></div>';
  }).join("");
  return prof + '<div><h2 class="sec">Vestiaire <small>privé · rien ne sort de ton appareil</small></h2></div>' + onglets +
    '<div class="vs-g' + (t === "titre" ? " vs-g2" : "") + '">' + tuiles + '</div><div class="vs-d" id="vs-d" aria-live="polite">' + htmlDetailObj() + "</div>";
}
function htmlDetailObj() {
  if (!vsSel) return '<p class="vs-aide">Touche un objet pour l\'équiper, ou « ? » pour savoir d\'où il vient.</p>';
  const [t, id] = vsSel.split("."), d = defObj(t, id); if (!d) return "";
  const E = etatObjets(), o = E.ok.has(vsSel), org = origineObj(t, id), cache = !o && org.secret;
  const sorte = SORTES.find(x => x[0] === t);
  let quoi;
  if (org.base) quoi = "Fourni de base.";
  else if (org.secret) quoi = o || org.ok ? "Récompense cachée « " + esc(org.secret.nom) + " » : " + esc(org.secret.quoi) : "Récompense cachée. Indice : <i>" + esc(org.secret.indice) + "</i>";
  else if (org.palier) { const p = org.palier; quoi = p.atteint ? "Gagné avec le palier « " + esc(p.titre) + " »" + (p.quand ? ", franchi en " + esc(libMois(p.quand)) : "") + "."
      : "À gagner : « " + esc(p.titre) + " » · " + pct(Math.max(0, Math.min(1, p.part)), 0, false) + (p.reste ? " · " + esc(p.reste) : "") + '<span class="jauge"><i style="width:' + Math.round(Math.max(0, Math.min(1, p.part)) * 100) + '%"></i></span>'; }
  else if (org.famille) quoi = o ? "Gagné avec un palier « " + esc(org.famille) + " »." : "À gagner dans les paliers « " + esc(org.famille) + " ».";
  else quoi = o ? "Déjà à toi." : "Pas encore disponible pour ton profil.";
  const actif = actifM(t) === id;
  return '<div class="vs-dl"><span class="vs-di">' + (cache ? "?" : sorte[2]) + "</span><div><b>" + esc(cache ? "???" : d[1]) + "</b> <small>" + esc(sorte[1]) + "</small><p>" + quoi + "</p></div></div>" +
    '<div class="vs-da">' + (o && !actif ? '<button class="btn" type="button" data-vs-eq="' + vsSel + '">Équiper</button>' : o ? '<span class="vs-eq">✓ Équipé</span>' : "") +
      (t === "fete" && !cache ? '<button class="btn ghost" type="button" data-vs-essai="' + id + '">Essayer</button>' : "") + "</div>";
}
function embHero() { return '<i class="m-emb" title="' + esc(nomObj("emb", actifM("emb"))) + '">' + apercuEmb(actifM("emb")) + "</i>"; }
function lancerFete(id) { const d = defObj("fete", id || actifM("fete")); if (typeof confettis === "function" && !reduit) confettis(d && d[3] ? d[3] : undefined); }
function brancherVestiaire(v) {
  const maj = () => { const z = v.querySelector("#vs-d"); if (z) { z.innerHTML = htmlDetailObj(); brancherDetail(); } v.querySelectorAll(".vs-t").forEach(x => x.classList.toggle("vs-sel", !!vsSel && x.querySelector("[data-vs]").dataset.vs === vsSel)); };
  const brancherDetail = () => {
    const eq = v.querySelector("[data-vs-eq]"); if (eq) eq.addEventListener("click", () => { const [t, id] = eq.dataset.vsEq.split("."); equiper(t, id); rendre(); toast(nomObj(t, id) + " équipé."); });
    const es = v.querySelector("[data-vs-essai]"); if (es) es.addEventListener("click", () => lancerFete(es.dataset.vsEssai));
  };
  v.querySelectorAll("[data-vt]").forEach(b => b.addEventListener("click", () => { PREF.vest = b.dataset.vt; garderPref(); vsSel = null; rendre(); }));
  v.querySelectorAll("[data-vs]").forEach(b => b.addEventListener("click", () => {
    const k = b.dataset.vs, [t, id] = k.split(".");
    vsSel = k;
    if (etatObjets().ok.has(k)) { equiper(t, id); rendre(); if (t === "fete") lancerFete(id); else toast(nomObj(t, id) + " équipé."); }
    else maj();
  }));
  v.querySelectorAll("[data-vsq]").forEach(b => b.addEventListener("click", () => { vsSel = vsSel === b.dataset.vsq ? null : b.dataset.vsq; maj(); }));
  brancherDetail();
}

/* fête d'un palier franchi ou d'une récompense cachée : une seule fois par appareil (au premier lancement, on note sans fêter) */
let paliersVerifies = false;
function verifierPaliers() {
  if (!M || paliersVerifies || !identiteSure()) return;
  if (!vueMoi()) return;   // la fête attend qu'on soit sur Moi (sinon elle tomberait sur le Classement au démarrage)
  paliersVerifies = true;
  noterVisite(); oublierObjets();
  const E = etatObjets();
  const faits = E.pal.filter(x => x.atteint), ids = faits.map(x => x.id);
  let vus = null; try { vus = JSON.parse(stock.get(cleStock("paliers")) || stock.get("versus.moi.paliers") || "null"); } catch (e) { vus = null; }
  const nouveaux = vus === null ? [] : faits.filter(x => !vus.includes(x.id));
  stock.set(cleStock("paliers"), JSON.stringify(Array.from(new Set((vus || []).concat(ids)))));
  let sv = null; try { sv = JSON.parse(stock.get(cleStock("secrets")) || "null"); } catch (e) { sv = null; }
  const secrets = sv === null ? [] : SECRETS_M.filter(s => E.sec.has(s.id) && !sv.includes(s.id));
  stock.set(cleStock("secrets"), JSON.stringify(Array.from(new Set((sv || []).concat(Array.from(E.sec))))));
  const file = nouveaux.concat(secrets.map(secret => ({ secret, titre: secret.nom, grand: "?!", quand: null, id: null })));
  if (file.length) feter(file[0], file.slice(1));
}
function feter(x, suite) {
  injecterStyle();
  const o = document.createElement("div");
  o.className = "m-fete moi"; o.setAttribute("role", "dialog"); o.setAttribute("aria-modal", "true");
  const recs = x.secret ? x.secret.rec : (etatObjets().rec.get(x.id) || []);
  const aff = recs.find(r => r[0] === "aff");
  o.innerHTML = '<div><span class="mf-k">' + (x.secret ? "Récompense cachée trouvée" : "Palier franchi") + '</span><div class="m-flaps">' + flaps(x.grand, !reduit, aff ? aff[1] : null) + "</div><h3>" + esc(x.titre) + "</h3>" +
    (x.secret ? "<p>" + esc(x.secret.quoi) + "</p>" : x.quand ? "<p>Franchi en " + esc(libMois(x.quand, true)) + ".</p>" : "") +
    (recs.length ? '<p class="mf-af">Débloque :</p><div class="mf-recs">' + recs.map(([t, id]) => {
      const s = SORTES.find(y => y[0] === t);
      return '<button class="mf-rec" type="button" data-mf-eq="' + t + "." + id + '"><span>' + (t === "emb" || t === "fete" ? defObj(t, id)[2] : s[2]) + "</span><b>" + esc(nomObj(t, id)) + "</b><small>" + esc(s[1]) + " · équiper</small></button>";
    }).join("") + "</div>" : "") +
    '<button class="wr-btn" type="button" data-continuer>Continuer</button></div>';
  document.body.appendChild(o);
  const fermer = () => { o.remove(); if (suite && suite.length) feter(suite[0], suite.slice(1)); };   // enchaîne sans trou (la clôture attend la fin des fêtes)
  o.querySelector("[data-continuer]").addEventListener("click", fermer);
  o.querySelectorAll("[data-mf-eq]").forEach(b => b.addEventListener("click", () => {
    const [t, id] = b.dataset.mfEq.split("."); oublierObjets(); equiper(t, id);
    b.classList.add("fait"); b.querySelector("small").textContent = "équipé ✓";
    if (t === "fete") lancerFete(id);
    if (vueMoi()) rendre();
  }));
  o.addEventListener("click", e => { if (e.target === o) fermer(); });
  lancerFete();
}
const palOuverts = new Set();
function htmlBilansMoi() {
  const k = moisPrecedentK(), i = k % 100 - 1, ans = anneesPrivees().slice(0, 2);
  return '<div><h2 class="sec">Mes bilans <small>privés</small></h2></div><div class="m-bilans">' +
    (diaposCloture(k).length > 1 ? '<button class="bilan-b prive" type="button" data-m-cloture="' + k + '">🔒 Revoir la clôture ' + deMois(i) + esc(MOIS_L[i]) + " " + Math.floor(k / 100) + "</button>" : "") +
    ans.map(an => '<button class="bilan-b prive" type="button" data-m-bilan="' + an + '">🔒 Mon patrimoine ' + an + "</button>").join("") + "</div>";
}
function htmlMissions() {
  const sv = serieVersements(), auj = cleMoisD(new Date());
  const finM = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
  const pal = paliers(), nbFaits = pal.filter(x => x.atteint).length;
  const carte = x => '<button type="button" class="palier' + (x.atteint ? " fait" : "") + '" data-palier="' + esc(x.id) + '"' + (x.atteint ? "" : " disabled") + '>' +
    '<span class="pastille">' + esc(x.court) + '</span><span class="pl-t">' + esc(x.titre) + "</span>" +
    (x.atteint ? '<span class="pl-s">✓ franchi en ' + esc(libMois(x.quand)) + "</span>"
               : '<span class="jauge"><i style="width:' + Math.round(Math.max(0, Math.min(1, x.part)) * 100) + '%"></i></span><span class="pl-s">' + esc(x.reste) + "</span>") + "</button>";
  const E = etatObjets(), recDe = id => E.rec.get(id) || [];
  const icone = (t, id) => t === "emb" || t === "fete" ? defObj(t, id)[2] : SORTES.find(x => x[0] === t)[2];
  const htmlRecs = x => { const l = recDe(x.id); return l.length ? '<em class="pl-rec">' + l.map(([t, id]) => "<span>" + icone(t, id) + " " + esc(nomObj(t, id)) + "</span>").join("") + "</em>" : ""; };
  const ligneP = x => '<button type="button" class="pl-r' + (x.atteint ? " fait" : "") + '" data-palier="' + esc(x.id) + '"' + (x.atteint ? "" : " disabled") + '>' +
    '<span class="pastille">' + esc(x.court) + '</span><span class="pl-t">' + esc(x.titre) + htmlRecs(x) + (x.atteint ? "" : '<span class="jauge"><i style="width:' + Math.round(Math.max(0, Math.min(1, x.part)) * 100) + '%"></i></span><small>' + esc(x.reste) + "</small>") + "</span>" +
    (x.atteint ? '<span class="pl-s">✓ ' + esc(libMois(x.quand)) + "</span>" : '<span class="pl-s">' + pct(Math.max(0, Math.min(1, x.part)), 0, false) + "</span>") + "</button>";
  const blocs = FAMILLES.map(([g, nom]) => {
    const l = pal.filter(x => x.groupe === g); if (!l.length) return "";
    const faits = l.filter(x => x.atteint).length, suiv = l.find(x => !x.atteint);
    const recs = l.filter(x => !x.atteint).reduce((n, x) => n + recDe(x.id).length, 0);
    return '<details class="pl-bloc' + (suiv ? "" : " complet") + '" data-fam="' + g + '"' + (palOuverts.has(g) ? " open" : "") + "><summary>" +
      '<span class="pb-t">' + esc(nom) + '</span><span class="pb-n">' + faits + " / " + l.length + "</span>" +
      '<span class="jauge"><i style="width:' + Math.round(faits / l.length * 100) + '%"></i></span>' +
      '<span class="pb-s">' + (suiv ? "Prochain : <b>" + esc(suiv.titre) + "</b> · " + pct(Math.max(0, Math.min(1, suiv.part)), 0, false) : "Tout est franchi ✓") +
        (recs ? ' · <span class="pb-r">🎁 ' + recs + (recs > 1 ? " récompenses" : " récompense") + " à gagner</span>" : "") + "</span>" +
      '</summary><div class="pl-liste">' + l.map(ligneP).join("") + "</div></details>";
  }).join("");
  return '<div id="m-million-z"></div>' +
    '<div class="m-serie' + (sv.moisEnCours ? " ok" : "") + '"><b>' + sv.actuelle + " mois</b><span>de versements d'affilée · record " + sv.record + " · " +
      (sv.moisEnCours ? "versement de " + MOIS_L[new Date().getMonth()] + " fait ✓" : "pas encore de versement en " + MOIS_L[new Date().getMonth()] + " (même 10 € comptent, jusqu'au " + dateCourte(finM) + ")") + "</span></div>" +
    htmlBilansMoi() +
    htmlVestiaire() +
    '<div><h2 class="sec">Paliers <small>' + nbFaits + " franchis sur " + pal.length + "</small></h2></div>" +
    '<div class="pl-blocs">' + blocs + "</div>" +
    '<p class="info">Un palier sur deux, et toujours le dernier de chaque famille, débloque une récompense pour ton onglet Moi : afficheur, thème, courbe, fête, emblème ou titre. D\'autres sont cachées. Tout reste privé et à toi, même si tu repasses sous le palier. Touche un palier franchi pour revoir sa fête.</p>';
}
function brancherMissions(v) {
  const z = v.querySelector("#m-million-z"); if (z) afficherMillion(z);
  v.querySelectorAll("details.pl-bloc").forEach(d => d.addEventListener("toggle", () => { if (d.open) palOuverts.add(d.dataset.fam); else palOuverts.delete(d.dataset.fam); }));
  const pal = paliers();
  brancherVestiaire(v);
  v.querySelectorAll("[data-m-cloture]").forEach(b => b.addEventListener("click", () => ouvrirCloture(+b.dataset.mCloture)));
  v.querySelectorAll("[data-m-bilan]").forEach(b => b.addEventListener("click", () => ouvrirDiapos("Mon patrimoine · " + b.dataset.mBilan, diaposPrivees(+b.dataset.mBilan))));
  v.querySelectorAll("[data-palier]").forEach(b => b.addEventListener("click", () => { const x = pal.find(p => p.id === b.dataset.palier); if (x && x.atteint) feter(x); }));
}

/* ================= Bilan de patrimoine de l'année (privé : seulement sur ton appareil) ================= */
function anneesPrivees() {
  if (!M || !M.historique || !M.historique.rows) return [];
  return Array.from(new Set(M.historique.rows.map(r => Math.floor(r[0] / 10000)))).sort((a, b) => b - a);
}
function diaposPrivees(an) {
  const L = [], b = bilanAnneeM(an), enCours = an === new Date().getFullYear();
  const cls = v => sens(v) === "flat" ? "" : sens(v);
  const s = seriePatrimoine(), av = s.filter(x => x.an < an).pop(), fin = s.filter(x => x.an === an).pop();
  const net = x => x ? x.bourse + x.epargne + x.immo : null;
  const nom = esc(ETAT.moi || "toi");
  L.push({ c: "#F5C542", h: '<div class="wr-k">🔒 Privé · ' + nom + '</div><div class="wr-big titre">Mon patrimoine<br>' + an + '</div><p class="wr-p">' + (enCours ? "Ton année jusqu'ici, au " + dateLongue(b ? b.fin : new Date()) + "." : "Ton année en bourse, en épargne et en pierre.") + " Ces écrans ne sont visibles que sur ton téléphone.</p>" });
  if (fin) {
    const d = av ? net(fin) - net(av) : null;
    L.push({ c: "#9B87FF", h: '<div class="wr-k">Patrimoine net</div><div class="wr-big">' + eur(net(fin)) + "</div>" +
      (d !== null ? '<p class="wr-p">' + (d >= 0 ? "En hausse de" : "En baisse de") + ' <b class="' + cls(d) + '">' + eur(Math.abs(d)) + "</b> sur l'année, de " + eur(net(av)) + " à " + eur(net(fin)) + ".</p>" : '<p class="wr-p">Première année suivie : la comparaison viendra l\'an prochain.</p>') +
      '<div class="wr-g"><div class="wr-c"><span>Bourse</span><b>' + eur(fin.bourse) + '</b></div><div class="wr-c"><span>Épargne</span><b>' + eur(fin.epargne) + "</b></div>" + (fin.immo ? '<div class="wr-c" style="grid-column:1/-1"><span>Immobilier net</span><b>' + eur(fin.immo) + "</b></div>" : "") + "</div>" });
  }
  if (b) {
    const ecart = ok(b.sp) ? b.twr - b.sp : null;
    const lecture = ecart === null ? "" : ecart > 0.02 ? "Tu as battu le S&P 500 : année réussie." : ecart < -0.02 ? "Le S&P 500 a fait mieux que toi cette année : ça arrive, c'est sur la durée que ça se joue." : "Au coude-à-coude avec le S&P 500.";
    L.push({ c: couleurM(), h: '<div class="wr-k">En bourse</div><div class="wr-big"><span class="' + cls(b.gain) + '">' + eur(b.gain, 0, true) + '</span></div><p class="wr-p">' + (b.gain >= 0 ? "Ce que le marché t'a rapporté" : "Ce que le marché t'a repris") + ", en plus des <b>" + eur(b.verse) + "</b> que tu as versés.</p>" +
      '<div class="wr-g"><div class="wr-c"><span>Ta performance</span><b class="' + cls(b.twr) + '">' + pct(b.twr) + '</b></div><div class="wr-c"><span>S&amp;P 500</span><b>' + pct(b.sp) + "</b></div></div>" + (lecture ? '<p class="wr-p">' + lecture + "</p>" : "") });
    if (b.meilleur) L.push({ c: "#2FD1C0", h: '<div class="wr-k">Tes mois</div><div class="wr-g"><div class="wr-c"><span>Meilleur mois</span><b class="up">' + esc(MOIS_L[b.meilleur.mois - 1]) + "</b><em>" + eur(b.meilleur.eur, 0, true) + " · " + pct(b.meilleur.twr) + "</em></div>" +
      (b.pire ? '<div class="wr-c"><span>Pire mois</span><b class="down">' + esc(MOIS_L[b.pire.mois - 1]) + "</b><em>" + eur(b.pire.eur, 0, true) + " · " + pct(b.pire.twr) + "</em></div>" : "") + "</div>" +
      (b.pire && b.pire.eur < 0 ? '<p class="wr-p">Et tu as continué. C\'est ça qui compte.</p>' : "") });
  }
  const mpm = (M.moisParMois || []).filter(r => String(r.mois).slice(0, 4) === String(an) && ok(r.epargne));
  if (mpm.length) {
    const prevE = (M.moisParMois || []).filter(r => +String(r.mois).slice(0, 4) < an && ok(r.epargne)).pop();
    const e0 = prevE ? prevE.epargne + (prevE.uc || 0) : mpm[0].epargne + (mpm[0].uc || 0), e1 = mpm[mpm.length - 1].epargne + (mpm[mpm.length - 1].uc || 0);
    const tot = (M.epargne || []).find(x => /^Total/.test(x.nom));
    L.push({ c: "#F5C542", h: '<div class="wr-k">Ton épargne</div><div class="wr-big">' + eur(e1) + '</div><p class="wr-p">' + (e1 >= e0 ? "En hausse de" : "En baisse de") + " <b>" + eur(Math.abs(e1 - e0)) + "</b> sur l'année (livrets et assurance-vie)." + (e1 < e0 ? " Une partie a sans doute servi à un projet ou à la bourse." : "") + "</p>" +
      (enCours && tot && tot.acquis ? '<div class="wr-g"><div class="wr-c" style="grid-column:1/-1"><span>Intérêts acquis cette année</span><b class="up">' + eur(tot.acquis, 0, true) + "</b></div></div>" : "") });
  }
  const mens = (M.prets || {}).mensuel || [];
  if (mens.length) {
    const debutAn = an + "-01-01", finAn = an + "-12-31", auj = isoJour(new Date());
    let r0 = null, r1 = null;
    mens.forEach(x => { if (x[0] < debutAn) r0 = x[1]; if (x[0] <= finAn && x[0] <= auj) r1 = x[1]; });
    if (r0 === null) { const prem = mens.find(x => x[0] >= debutAn); r0 = prem ? Math.max(...mens.map(x => x[1])) : null; }
    if (r0 !== null && r1 !== null && r0 > r1) L.push({ c: "#9B87FF", h: '<div class="wr-k">Ton appartement</div><div class="wr-big"><span class="up">' + eur(r0 - r1) + '</span></div><p class="wr-p">de capital remboursé cette année. Il reste <b>' + eur(r1) + "</b> à rembourser" + ((M.prets || {}).fin ? ", jusqu'en " + String(M.prets.fin).slice(0, 4) : "") + ".</p>" });
  }
  const g = M.signal;
  if (g && g.position) {
    const sig = (g.signaux || []).filter(x => String(x.date).slice(0, 4) === String(an));
    const expose = g.expose && String(g.depuis || "") < an + "-01-01";
    L.push({ c: "#4ADE80", h: '<div class="wr-k">Ton levier</div><div class="wr-mid">' + esc(g.position) + "</div>" +
      '<p class="wr-p">' + (sig.length ? sig.length + (sig.length > 1 ? " signaux" : " signal") + " cette année : " + sig.slice(0, 4).map(x => esc(x.type) + " le " + esc(frDate(x.date))).join(", ") + (sig.length > 4 ? "…" : "") + "." : "Aucun signal cette année : la règle t'a laissé tranquille.") + "</p>" +
      (expose ? '<p class="wr-p">En position toute l\'année : le Nasdaq a fait <b>' + pct((g.perfDepuis || 0) / 100) + "</b> depuis l'entrée du " + esc(frDate(g.depuis)) + ".</p>" : "") +
      (b ? '<p class="wr-p">' + (b.twr > (b.sp || 0) ? "Avec le levier, ton portefeuille a fait mieux que le S&P 500 : il a fait son travail." : "Cette année, le levier n'a pas suffi à battre le S&P 500.") + "</p>" : "") });
  }
  const sv = serieVersements(), moisAn = sv.liste.filter(x => +x.m.slice(0, 4) === an);
  if (moisAn.length) {
    let run = 0, longue = 0; moisAn.forEach(x => { run = x.ok ? run + 1 : 0; longue = Math.max(longue, run); });
    const nbV = moisAn.filter(x => x.ok).length;
    L.push({ c: "#FF8A3D", h: '<div class="wr-k">Ta régularité</div><div class="wr-big">' + nbV + " / " + moisAn.length + '</div><p class="wr-p">mois avec au moins un versement. Plus longue série de l\'année : <b>' + longue + " mois</b>." + (nbV === moisAn.length ? " Sans faute." : "") + "</p>" });
  }
  const franchis = paliers().filter(x => x.atteint && x.quand && +x.quand.slice(0, 4) === an).filter((x, i, l) => !l.slice(i + 1).some(y => y.groupe === x.groupe));
  L.push({ c: "#F5C542", h: '<div class="wr-k">Paliers franchis · ' + franchis.length + "</div>" + (franchis.length ? '<div class="wr-l">' + franchis.slice(0, 8).map(x => '<div class="wr-r"><span class="rk">✓</span><b style="font-size:15px">' + esc(x.titre) + "</b><span></span></div>").join("") + "</div>" : '<p class="wr-p">Pas de nouveau palier cette année : le prochain n\'est pas loin.</p>') +
    '<button class="wr-btn" type="button" data-wr-fermer>Fermer</button>' });
  return L;
}
function couleurM() { try { return D ? couleur(ETAT.moi) : "#4C9AFF"; } catch (e) { return "#4C9AFF"; } }

/* ================= Clôture du mois (privée : calculée et gardée sur cet appareil, rien n'est envoyé) =================
   Rien n'est recalculé ici : marché = moisParMois (grille des Stats), versement = serieVersements (Missions),
   paliers et récompenses = paliers + etatObjets (Missions/Vestiaire), palettes = flaps, écran = ouvrirDiapos (bilans). */
function moisPrecedentK() { const d = new Date(), p = new Date(d.getFullYear(), d.getMonth() - 1, 1); return p.getFullYear() * 100 + p.getMonth() + 1; }
function deMois(i) { return /^[aeiouyéèâ]/i.test(MOIS_L[i]) ? "d'" : "de "; }   // d'avril, d'août, d'octobre
function diaposCloture(k) {
  const an = Math.floor(k / 100), mo = k % 100, i = mo - 1, nomM = MOIS_L[i], mm = an + "-" + String(mo).padStart(2, "0");
  const cls = v => sens(v) === "flat" ? "" : sens(v), p2 = n => String(Math.min(99, n)).padStart(2, "0");
  const palette = (t, anim) => '<div class="moi m-flaps cl-flaps">' + flaps(t, anim) + "</div>";
  const L = [];
  // 1. le mois en palettes
  L.push({ c: couleurM(), h: '<div class="wr-k">🔒 Privé · ' + esc(ETAT.moi || "toi") + "</div>" + palette(nomM.toUpperCase(), !reduit) +
    '<div class="wr-mid">Clôture ' + deMois(i) + esc(nomM) + " " + an + '</div><p class="wr-p">Ton mois à toi : le marché, ton versement, tes paliers. Visible seulement sur ce téléphone.</p>' });
  // 2. le marché : résultat hors versements et TWR du mois, comme la grille « Mois par mois »
  let x = null; try { x = moisParMois().find(z => z.an === an && z.mois === mo) || null; } catch (e) { x = null; }
  L.push({ c: "#4C9AFF", h: '<div class="wr-k">Le marché en ' + esc(nomM) + "</div>" + (x
    ? '<div class="wr-big"><span class="' + cls(x.eur) + '">' + eur(x.eur, 0, true) + '</span></div><p class="wr-p">' + (x.eur >= 0 ? "Ce que le marché t'a rapporté" : "Ce que le marché t'a repris") + " sur ta bourse, hors versements.</p>" +
      '<div class="wr-g"><div class="wr-c" style="grid-column:1/-1"><span>Performance du mois (TWR)</span><b class="' + cls(x.twr) + '">' + pct(x.twr) + "</b></div></div>"
    : '<p class="wr-p">' + (M.simple ? "Ta bourse se suit dans le Versus : son bilan du mois est dans l'onglet Mois." : "Pas de relevé de bourse pour ce mois dans ton fichier.") + "</p>") });
  // 3. le versement : la série de Missions, arrêtée à la fin du mois
  let sv = null; try { sv = serieVersements(); } catch (e) { sv = null; }
  const idx = sv ? sv.liste.findIndex(z => z.m === mm) : -1;
  if (idx >= 0) {
    let run = 0, avant = 0, rec = 0;
    for (let j = 0; j <= idx; j++) { avant = run; run = sv.liste[j].ok ? run + 1 : 0; rec = Math.max(rec, run); }
    L.push({ c: "#FF8A3D", h: '<div class="wr-k">Ton versement</div>' + (sv.liste[idx].ok
      ? '<div class="wr-mid">Fait ✓</div><div class="cl-serie">' + palette(p2(avant), false) + '<span class="cl-fl" aria-hidden="true">→</span>' + palette(p2(run), !reduit) + "</div>" +
        '<p class="wr-p"><b>' + run + " mois</b> d'affilée avec un versement" + (run > 1 && run >= rec ? " : c'est ton record !" : (rec > run ? " · record " + rec + " mois" : "") + ".") + "</p>"
      : '<div class="wr-mid">Pas ce mois-là</div><p class="wr-p">' + (avant ? "Ta série de <b>" + avant + " mois</b> repart de zéro." : "La série repart de zéro.") + " Un versement ce mois-ci, même 10 €, la relance.</p>") });
  }
  // 4. paliers franchis pendant le mois, 5. le plus proche, 6. récompenses débloquées
  let E = null; try { E = etatObjets(); } catch (e) { E = null; }
  const pal = E && E.pal ? E.pal : [];
  if (pal.length) {
    const franchis = pal.filter(z => z.atteint && z.quand === mm);
    L.push({ c: "#F5C542", h: '<div class="wr-k">Paliers franchis en ' + esc(nomM) + " · " + franchis.length + "</div>" + (franchis.length
      ? '<div class="wr-l">' + franchis.slice(0, 8).map(z => '<div class="wr-r"><span class="rk">✓</span><b style="font-size:15px">' + esc(z.titre) + "</b><span></span></div>").join("") + "</div>"
      : '<p class="wr-p">Pas de nouveau palier ce mois-ci.</p>') });
    const proche = pal.filter(z => !z.atteint && z.part < 1).sort((a, b) => b.part - a.part)[0];
    if (proche) L.push({ c: "#9B87FF", h: '<div class="wr-k">Le palier le plus proche</div><div class="wr-mid">' + esc(proche.titre) + '</div><div class="wr-big">' + pct(Math.max(0, proche.part), 0, false) +
      '</div><div class="cl-jauge"><i style="width:' + Math.round(Math.max(0, Math.min(1, proche.part)) * 100) + '%"></i></div><p class="wr-p">du chemin fait · ' + esc(proche.reste) + ".</p>" });
    const recs = []; franchis.forEach(z => (E.rec.get(z.id) || []).forEach(r => recs.push(r)));
    if (recs.length) L.push({ c: "#2FD1C0", h: '<div class="wr-k">Débloqué en ' + esc(nomM) + '</div><div class="wr-l">' + recs.map(([t, id]) => {
      const so = SORTES.find(y => y[0] === t); return '<div class="wr-r"><span class="rk">' + (t === "emb" || t === "fete" ? defObj(t, id)[2] : so[2]) + '</span><b style="font-size:15px">' + esc(nomObj(t, id)) + "</b><span>" + esc(so[1]) + "</span></div>";
    }).join("") + '</div><p class="wr-p">À équiper dans Missions › Vestiaire.</p>' });
  }
  L[L.length - 1].h += '<button class="wr-btn" type="button" data-wr-fermer>Fermer</button>';
  return L;
}
function ouvrirCloture(k) { lireCache(); if (!M) return; injecterStyle(); ouvrirDiapos("Clôture · " + MOIS_L[k % 100 - 1] + " " + Math.floor(k / 100), diaposCloture(k)); }
/* Une seule fois par mois, par appareil et par personne : à la première arrivée sur Moi, avec les données fraîches du fichier */
let clotureVerifiee = 0;   // dernier mois vérifié (une PWA peut rester ouverte d'un mois à l'autre)
function verifierCloture() {
  const k = moisPrecedentK();
  if (clotureVerifiee === k || !M || SRC !== "api" || !vueMoi() || !configure() || !identiteSure()) return;   // copie locale : on attend la réponse du fichier
  clotureVerifiee = k;
  const cleC = cleStock("cloture"), vu = +(stock.get(cleC) || 0);
  if (!vu) { stock.set(cleC, String(k)); return; }          // premier lancement : on note le mois, sans rien afficher
  if (vu >= k) return;
  if (diaposCloture(k).length < 2) { stock.set(cleC, String(k)); return; }   // fichier sans historique ni parcours : rien à raconter
  apresLesFetes(() => { if (!vueMoi()) { clotureVerifiee = 0; return; } stock.set(cleC, String(k)); ouvrirCloture(k); }, () => { clotureVerifiee = 0; });
}
/* jamais par-dessus une fête de palier (ni un autre écran plein) : on attend qu'il soit fermé */
function apresLesFetes(fn, abandon) {
  const occupe = () => document.querySelector(".m-fete, .wr, .tuto, .revel, .regles");
  let essais = 0;
  const attendre = () => { if (!vueMoi()) { if (abandon) abandon(); return; } if (occupe() && essais++ < 300) { setTimeout(attendre, 400); return; } fn(); };
  setTimeout(attendre, 600);
}

/* ================= Lignes partagées pour le récap mensuel (lignes de bourse seulement) ================= */
/* Fenêtre de fin de mois : du dernier jour ouvré à 18 h jusqu'à l'ouverture du premier jour ouvré du mois suivant (9 h) */
function moisDeFenetre(now) {
  for (const dec of [0, -1]) {
    const d = new Date(now.getFullYear(), now.getMonth() + dec, 1), y = d.getFullYear(), m = d.getMonth() + 1;
    const debut = jourReleve(y, m); debut.setHours(18, 0, 0, 0);
    const fin = new Date(y, m, 1, 9); while (fin.getDay() === 0 || fin.getDay() === 6) fin.setDate(fin.getDate() + 1);
    if (now >= debut && now < fin) return y * 100 + m;
  }
  return null;
}
function partageActif() { return stock.get("versus.moi.partage") !== "non"; }
async function partagerLignes() {
  try {
    if (!M || SRC !== "api" || !partageActif() || typeof D === "undefined" || !D || SOURCE !== "api" || simulationM()) return;
    const k = moisDeFenetre(new Date()); if (!k) return;
    const qui = estAdmin() ? ETAT.moi : SESSION.nom;
    if (!D.personnes.some(p => p.nom === qui)) return;
    const jour = String(M.genere || "").slice(0, 10) || isoJour(new Date()), marque = k + "|" + jour + "|" + qui;
    if (stock.get("versus.moi.lignesEnvoyees") === marque) return;
    const perf = M.perfLignes || {};
    const lignes = [];
    (M.groupes || []).forEach(g => g.lignes.forEach(l => { if (!l.especes && l.valeur > 0) lignes.push({ env: g.env, code: l.code, nom: l.nom, cours: l.cours, qte: l.qte, valeur: l.valeur, pv: l.pv, pvPct: l.pvPct, m1: (perf[g.env + "|" + l.code] || {}).m1 }); }));
    if (!lignes.length) return;
    const rep = await (await fetch(apiUrl(), { method: "POST", body: JSON.stringify({ cle: stock.get(CLES.cle), action: "lignes", personne: qui, mois: k, date: jour, lignes }) })).json();
    if (rep.ok) { stock.set("versus.moi.lignesEnvoyees", marque); if (typeof window.charger === "function") window.charger(true); }
  } catch (e) { /* réessai à la prochaine ouverture */ }
}

/* ---------- Notifications (cloche de l'en-tête) ----------
   rouge : anomalie dans les saisies ou alerte de cours déclenchée ; orange : rappel à faire ou dans les 2 jours ; rien sinon */
function dateRappel(txt) { const m = /(\d{2})\/(\d{2})\/(\d{4})\s*$/.exec(String(txt || "")); return m ? new Date(+m[3], +m[2] - 1, +m[1], 23, 59) : null; }
/* le bloc Rappels du fichier s'arrête avant le tableau « Mes actifs » */
function rappelsFichier() {
  const out = [];
  for (const r of ((M.parametres || {}).rappels || [])) { if (/^Mes actifs/.test(r.nom || "")) break; if (r.nom) out.push(r); }
  return out;
}
function notifications() {
  if (!M) return { niveau: "", items: [] };
  const items = [];
  const anomalie = M.anomalies && !/^\s*✓/.test(M.anomalies);
  if (anomalie) items.push({ t: "rouge", txt: M.anomalies });
  alertesDeclenchees().forEach(a => items.push({ t: "rouge", txt: "Alerte de cours : " + a }));
  const d = dateRappel(M.rappel);
  const aFaire = /À mettre à jour/.test(M.rappel || "") || (d && d - Date.now() < 2 * 864e5);
  rappelsFichier().filter(r => /mettre à jour|à faire|retard|⚠|✏/i.test(r.statut || "")).forEach(r => items.push({ t: "orange", txt: r.nom + " : " + String(r.statut).replace(/^[^\wÀ-ÿ]+/u, "") + (r.prochaine ? " (prévu le " + frDate(String(r.prochaine).slice(0, 10)) + ")" : "") }));
  if (aFaire && !items.some(x => x.t === "orange")) items.push({ t: "orange", txt: M.rappel });
  const niveau = items.some(x => x.t === "rouge") ? "rouge" : items.some(x => x.t === "orange") ? "orange" : "";
  return { niveau, items };
}
function signalerCloche() { if (typeof majCloche === "function") majCloche(configure() ? notifications().niveau : null); }
function htmlNotifications() {
  if (!configure()) return '<p class="info">Connecte ton fichier dans Réglages › Mon fichier pour recevoir tes rappels et alertes ici.</p>';
  if (!M) return '<p class="info">Lecture de ton fichier en cours…</p>';
  const n = notifications(), propre = t => esc(String(t || "").replace(/^[✓⚠🔔✏️\s]+/u, "").trim()).replace(/ +▸ /g, "<br>▸ ");
  const ligne = (cls, ic, txt) => '<div class="m-note ' + cls + '"><span class="ic">' + ic + "</span><span>" + txt + "</span></div>";
  const rap = rappelsFichier();
  return '<div class="moi" style="display:grid;gap:10px"><div class="m-notes">' +
    (n.items.length ? n.items.map(x => ligne(x.t === "rouge" ? "warn" : "rappel", x.t === "rouge" ? "!" : "◷", propre(x.txt))).join("") : ligne("ok", "✓", "Rien à signaler : aucune anomalie, aucun rappel à faire.")) +
    (!n.items.some(x => x.txt === M.anomalies) && M.anomalies ? ligne("ok", "✓", propre(M.anomalies)) : "") +
    (M.rappel && !n.items.some(x => x.txt === M.rappel) ? ligne("rappel", "◷", propre(M.rappel)) : "") + "</div>" +
    (M.marches ? '<h4 class="m-h4">Marchés</h4><div class="m-status">' + marches(M.marches) + "</div>" : "") +
    (rap.length ? '<h4 class="m-h4">Rappels de ton fichier</h4><div class="m-liste">' + rap.map(r => '<div class="r"><span class="a">' + esc(r.nom) + '</span><span class="b">' + esc(String(r.statut || "").replace(/^[^\wÀ-ÿ]+/u, "")) + '</span><span class="c">dernière : ' + esc(/^\d{4}-/.test(r.derniere || "") ? frDate(r.derniere.slice(0, 10)) : r.derniere || "—") + '</span><span class="d">prochaine : ' + esc(/^\d{4}-/.test(r.prochaine || "") ? frDate(r.prochaine.slice(0, 10)) : r.prochaine || "—") + "</span></div>").join("") + "</div>" : "") + "</div>";
}

/* ================= Profil simple (Kévin) : épargne saisie à la main, bourse lue dans le Versus =================
   Son fichier (API « Moi simple ») ne donne que ses comptes, ses soldes datés et ses réglages
   (appartement, prêt). Le reste est reconstruit ici, au format des autres fichiers, pour que
   les onglets Patrimoine, Stats et Missions marchent à l'identique. Pas de lignes de bourse. */
function recevoir(json) {
  if (json && json.profil === "simple") { RAW = json; M = adapterSimple(json); }
  else { RAW = null; M = json; }
}
function dVersus() { return typeof D !== "undefined" && D ? D : null; }
/** Propriétaire d'un fichier simple : le nom enregistré dans le fichier ; à défaut, la personne connectée avec son code (jamais l'admin) */
function proprietaire(raw) {
  const Dv = dVersus(), nom = ((raw && raw.reglages) || {}).personne;
  if (nom && (!Dv || Dv.personnes.some(x => x.nom === nom))) return nom;
  if (Dv && !estAdmin() && SESSION && SESSION.nom && Dv.personnes.some(x => x.nom === SESSION.nom)) return SESSION.nom;
  return null;
}
/** À la première ouverture par son propriétaire (connecté avec son code), le fichier retient à qui il est */
let revendique = false;
async function revendiquerFichier() {
  if (!RAW || revendique || estAdmin() || simulationM() || (RAW.reglages || {}).personne || typeof SOURCE === "undefined" || SOURCE !== "api") return;
  const qui = proprietaire(RAW); if (!qui) return;
  revendique = true;
  const rep = await posterFichier({ action: "reglages", reglages: { "versus.nom": qui } });
  if (rep.ok) { recevoir(Object.assign({ profil: "simple" }, rep)); stock.set(K.cache, JSON.stringify(RAW)); }
}
function assurerSimple() { if (RAW && M && M._d !== dVersus()) M = adapterSimple(RAW); }
function finMoisIso(an, mo) { return isoJour(new Date(an, mo, 0)); }
function moisPlus(an, mo, n) { const d = new Date(an, mo - 1 + n, 1); return [d.getFullYear(), d.getMonth() + 1]; }
/** Échéancier d'un prêt à mensualités constantes, ramené à « ma part » */
function echeancier(pr) {
  if (!pr || !(pr.capital > 0) || !(pr.duree > 0) || !pr.debut) return null;
  const part = (ok(pr.part) && pr.part > 0 ? pr.part : 100) / 100, n = Math.round(pr.duree * 12), i = (pr.taux || 0) / 100 / 12;
  const C = pr.capital, mens = i ? C * i / (1 - Math.pow(1 + i, -n)) : C / n;
  const d0 = new Date(pr.debut + "T12:00:00"), jour = d0.getDate();
  let restant = C;
  const L = [];
  for (let k = 0; k < n; k++) {
    const an = d0.getFullYear(), mo = d0.getMonth() + k, d = new Date(an, mo, Math.min(jour, new Date(an, mo + 1, 0).getDate()));
    const interet = restant * i, capital = Math.min(restant, mens - interet);
    restant = Math.max(0, restant - capital);
    L.push({ date: isoJour(d), restant: restant * part, echeance: mens * part, interet: interet * part });
  }
  const avant = new Date(d0.getFullYear(), d0.getMonth() - 1, Math.min(jour, 28));
  const auj = isoJour(new Date()), an = String(new Date().getFullYear());
  const passees = L.filter(x => x.date <= auj), futures = L.filter(x => x.date > auj);
  const a = passees[passees.length - 1], p = futures[0];
  return {
    actuel: a ? { date: a.date, restant: a.restant, echeance: a.echeance } : null,
    prochaine: p ? { date: p.date, restant: p.restant, echeance: p.echeance } : null,
    interetsAnnee: passees.filter(x => x.date.slice(0, 4) === an).reduce((s, x) => s + x.interet, 0),
    interetsRestants: futures.reduce((s, x) => s + x.interet, 0),
    fin: L[L.length - 1].date, mensuel: [[isoJour(avant), C * part]].concat(L.map(x => [x.date, x.restant])),
    restantAuj: a ? a.restant : C * part, part, mensualite: mens * part
  };
}
function adapterSimple(raw) {
  const Dv = dVersus(), qui = proprietaire(raw);
  const p = Dv && qui ? Dv.personnes.find(x => x.nom === qui) : null;
  const noms = (Dv && Dv.enveloppes) || ["Portefeuille", "PEA", "Assurance vie", "CTO", "Crypto"];
  const fin = Dv ? finGlobale(Dv, 0) : 0;
  const iR = Dv ? Math.max(0, Dv.marche.indices.findIndex(n => /S&P\s*500/i.test(n))) : 0;
  const st = (e, deb) => p ? stats(Dv, p, e, deb || 0, fin, iR, null) : {};
  const tot = st(0);
  const sTot = p ? serie(p, 0).filter(z => z.k <= fin && z.val > 0) : [];
  const dernierR = e => { const s = p ? serie(p, e).filter(z => z.k <= fin && typeof z.r === "number") : []; return s.length ? s[s.length - 1].r : null; };
  const debAn = fin ? (Math.floor(fin / 100) - 1) * 100 + 12 : 0;
  // bourse : une enveloppe par colonne du Versus
  const envs = [1, 2, 3, 4].map(e => {
    const s = st(e); if (!(s.valeur > 0) && !(s.verse > 0)) return null;
    const premier = p ? serie(p, e).find(z => z.val > 0) : null;
    return { nom: noms[e], type: "env", regime: e === 1 ? "PEA" : e === 2 ? "AV" : e === 3 ? "CTO" : "Crypto", valeur: s.valeur, gain: s.pvLatente, gainPct: s.pvLatentePct, latente: s.pvLatente,
      twr: s.twr, mwr: s.mwr, vol: s.vol, m1: dernierR(e), ytd: st(e, debAn).twr, s1: null, m6: null, a1: null, ouverture: premier ? premier.d : null };
  }).filter(Boolean);
  // épargne : dernier solde de chaque compte
  const comptes = raw.comptes || [], soldes = raw.soldes || [];
  const dernier = {}; soldes.forEach(s => { dernier[s[1]] = { solde: s[2], date: s[0] }; });
  const vus = comptes.filter(c => dernier[c.nom] && (c.statut !== "Fermé" || dernier[c.nom].solde > 0.5));
  const totalEp = vus.reduce((a, c) => a + dernier[c.nom].solde, 0);
  const epargne = vus.map(c => ({ nom: c.nom, type: c.type, solde: dernier[c.nom].solde, date: dernier[c.nom].date, taux: null, acquis: null, fin31: null, fiscal: null }));
  if (epargne.length) epargne.push({ nom: "Total épargne", solde: totalEp, acquis: null, fin31: null });
  // mois couverts : du premier relevé (bourse) ou du premier solde jusqu'au mois en cours
  const now = new Date(), kAuj = now.getFullYear() * 100 + now.getMonth() + 1;
  const kPrem = Math.min(sTot.length ? sTot[0].k : kAuj, soldes.length ? +soldes[0][0].slice(0, 4) * 100 + +soldes[0][0].slice(5, 7) : kAuj);
  const ks = []; for (let [a, m] = [Math.floor(kPrem / 100), kPrem % 100]; a * 100 + m <= kAuj; [a, m] = moisPlus(a, m, 1)) ks.push(a * 100 + m);
  const nomsEp = comptes.filter(c => soldes.some(s => s[1] === c.nom)).map(c => c.nom);
  const soldeA = (nom, iso) => { let v = null; soldes.forEach(s => { if (s[1] === nom && s[0] <= iso) v = s[2]; }); return v; };
  const premierSolde = soldes.length ? soldes[0][0] : null;
  const bourseA = k => { let v = null; sTot.forEach(z => { if (z.k <= k) v = z.val; }); return v; };
  const moisParMois = ks.map(k => {
    const iso = finMoisIso(Math.floor(k / 100), k % 100);
    const ep = premierSolde && iso >= premierSolde.slice(0, 7) + "-01" ? nomsEp.reduce((a, n) => a + (soldeA(n, iso) || 0), 0) : null;
    const b = bourseA(k);
    return { mois: iso, bourse: b || 0, epargne: ep, uc: 0, patrimoine: (b || 0) + (ep || 0) };
  });
  const epargneMois = nomsEp.length ? { comptes: nomsEp, rows: moisParMois.filter(r => r.epargne !== null).map(r => [r.mois].concat(nomsEp.map(n => soldeA(n, r.mois) || 0))) } : null;
  // historique de la bourse : un point par relevé mensuel du Versus (indice de performance et S&P 500 rebasés)
  const mi = Dv ? rendementsIndice(Dv, iR) : {};
  let ip = 100, isp = 100;
  const rows = sTot.map((z, j) => {
    if (j > 0 && typeof z.r === "number") ip *= 1 + z.r;
    if (j > 0 && typeof mi[z.k] === "number") isp *= 1 + mi[z.k];
    return [+String(z.d).replace(/-/g, ""), z.val, z.cum, ip, isp];
  });
  const prets = echeancier((raw.reglages || {}).pret);
  const ap = (raw.reglages || {}).appart || {}, partA = (ok(ap.part) && ap.part > 0 ? ap.part : 100) / 100;
  const financier = (tot.valeur || 0) + totalEp;
  let immo = [], appart = null;
  if (ap.prix > 0) {
    const prix = ap.prix * partA, dette = prets ? prets.restantAuj : 0;
    appart = { prix, date: ap.date || (prets ? prets.mensuel[0][0] : null) };
    immo = [{ nom: "Appartement (ma part)", montant: prix, note: partA < 1 ? F0.format(partA * 100) + " % de " + eur(ap.prix) : null },
      { nom: "Crédit immobilier : restant dû (ma part)", montant: dette, note: prets ? "fin du crédit : " + frDate(prets.fin) + " · mensualité (ma part) " + eur(prets.mensualite, 2) : "prêt pas encore saisi (➕ › Comptes et prêt)" },
      { nom: "Valeur nette immobilière", montant: prix - dette, note: null },
      { nom: "Patrimoine net (avec immobilier)", montant: financier + prix - dette, note: "L'immobilier pèse " + pct((prix - dette) / Math.max(1, financier + prix - dette), 0, false) + " du total" }];
  }
  // mois avec un versement : bourse (relevés du Versus) ou hausse d'un compte saisie comme « mise à jour »
  const vers = {};
  if (p) serie(p, 0).forEach(z => { if (z.k <= fin && (z.verse || 0) > 0) { const m = String(z.k).slice(0, 4) + "-" + String(z.k).slice(4, 6); vers[m] = (vers[m] || 0) + z.verse; } });
  const prec = {};
  soldes.forEach(s => { const av = prec[s[1]]; prec[s[1]] = s[2]; if (av !== undefined && s[3] !== "Intérêts" && s[2] - av > 0.5) { const m = s[0].slice(0, 7); vers[m] = (vers[m] || 0) + s[2] - av; } });
  const premier = [sTot.length ? sTot[0].d : null, premierSolde].filter(Boolean).sort()[0] || null;
  const derSaisie = soldes.length ? soldes.map(s => s[0]).sort().pop() : null;
  const vieux = derSaisie && (Date.now() - new Date(derSaisie + "T12:00:00")) / 864e5 > 31;
  const total = { nom: "Portefeuille", type: "total", valeur: tot.valeur, gain: tot.pvLatente, gainPct: tot.pvLatentePct, twr: tot.twr, mwr: tot.mwr, vol: tot.vol, sharpe: tot.sharpe, m1: dernierR(0), ytd: st(0, debAn).twr, s1: null, m6: null, a1: null };
  return {
    simple: true, profil: "simple", _d: Dv, ok: true, genere: raw.genere, personne: qui,
    majTexte: (fin ? "Bourse : relevé de " + MOIS_L[fin % 100 - 1] + " " + Math.floor(fin / 100) : "Bourse : pas encore de relevé") + (derSaisie ? " · épargne saisie le " + frDate(derSaisie) : ""),
    anomalies: "", marches: "",
    rappel: !comptes.length ? "🔔 À mettre à jour : ajoute tes comptes d'épargne et leurs soldes (➕ › Comptes et prêt)" : vieux ? "🔔 À mettre à jour : tes soldes d'épargne (dernière saisie il y a plus d'un mois)" : derSaisie ? "✓ Soldes à jour (saisis le " + frDate(derSaisie) + ")." : "🔔 À mettre à jour : saisis le solde de tes comptes (➕ › Mes soldes)",
    synthese: { valeur: tot.valeur || 0, apports: tot.verse || 0, gain: tot.pvLatente, gainPct: tot.pvLatentePct, latente: tot.pvLatente, latentePct: tot.pvLatentePct, mwr: tot.mwr, twr: tot.twr,
      sp500: tot.i1 ? tot.i1.twr : null, epargne: totalEp, financier, jour: null, jourPct: null, timing: "—", releve: fin },
    indices: [], enveloppes: envs.concat([total]), groupes: [], fiscalite: [], supports: [], frais: [], cibles: [], alertes: [], perfLignes: {}, signal: null,
    epargne, epargneMois, moisParMois, immo, prets,
    parametres: { rappels: [], appart },
    historique: { cols: ["d", "v", "a", "ip", "isp"], rows },
    ref: { enveloppes: envs.map(e => ({ nom: e.nom, regime: e.regime, ouverture: e.ouverture, statut: "Ouvert", perimetre: "Portefeuille" })), types: [], actifs: [], cours: {}, detenu: [], journal: [], raccourcis: [],
      parcours: { premier, derniereVente: null, mois: Object.keys(vers).map(m => ({ m, apports: vers[m] })) } },
    comptes, soldes, reglages: raw.reglages || {}
  };
}

/* ---- Aujourd'hui (profil simple) ---- */
function ilYa(iso) { const j = Math.floor((Date.now() - new Date(iso + "T12:00:00")) / 864e5); return j <= 0 ? "aujourd'hui" : j === 1 ? "hier" : "il y a " + j + " j"; }
function htmlJourSimple() {
  const s = M.synthese || {};
  const texteFlap = ETAT.discret === "oui" ? "•••" + NB + "€" : eur(s.financier);
  const animer = !reduit && texteFlap !== dernierFlap; dernierFlap = texteFlap;
  const envs = (M.enveloppes || []).filter(e => e.type === "env"), ep = (M.epargne || []).filter(x => !/^Total/.test(x.nom));
  const c = (k, lab, val, cls, sub) => '<button type="button" data-def="' + k + '"><span class="lab">' + lab + '</span><b class="' + cls + '">' + val + "</b><small>" + sub + "</small></button>";
  const rel = s.releve ? MOIS_L[s.releve % 100 - 1] + " " + Math.floor(s.releve / 100) : null;
  const ligne = (nom, val, a, aCls, b, bCls) => '<div class="m-env-h"><b>' + esc(nom) + '</b><span class="v">' + eur(val) + '</span><span class="pv ' + (aCls || "") + '">' + a + '</span><span class="j ' + (bCls || "") + '">' + b + "</span></div>";
  const Dv = dVersus();
  const apercu = !M.personne ? '<div class="m-note warn"><span class="ic">!</span><span>Ce fichier ne sait pas encore à qui il est, donc la bourse n\'est pas affichée. ' +
      (estAdmin() && Dv ? "Choisis son propriétaire :</span></div>" + '<div class="chips ms-proprio">' + Dv.personnes.map(x => '<button class="chip" type="button" data-ms-proprio="' + esc(x.nom) + '">' + esc(x.nom) + "</button>").join("") + "</div>"
        : "Il le saura dès que son propriétaire l'ouvrira avec son code.</span></div>") : "";
  return apercu + '<div class="m-hero"><span class="eyebrow">' + embHero() + 'Patrimoine financier</span>' +
      '<div class="m-flaps" role="img" aria-label="' + esc(texteFlap) + '">' + flaps(texteFlap, animer) + "</div>" +
      '<div class="m-jour"><span class="badge big-b flat">' + (M.personne ? esc(M.personne) + " · " : "") + 'Bourse ' + eur(s.valeur) + " · épargne " + eur(s.epargne) + "</span><span>" + (rel ? "relevé de " + esc(rel) : "pas encore de relevé") + "</span></div></div>" +
    (envs.length ? '<div class="m-debut-w"><span class="eyebrow">Bourse depuis le début</span><div class="m-debut">' +
      c("gain", "Résultat", eur(s.gain, 0, true), sens(s.gain), pct(s.gainPct)) + c("verse", "Versé", eur(s.apports), "", "au total") +
      c("twr", "TWR", pct(s.twr), sens(s.twr), "S&amp;P " + pct(s.sp500)) + c("mwr", "MWR", pct(s.mwr), sens(s.mwr), "ton argent") +
      '</div><p class="m-def-l" hidden></p></div>' : "") +
    "<div>" + '<div class="m-tri"><h2 class="sec">Mes comptes</h2></div>' +
      (envs.length ? '<div class="m-env" style="--ce:var(--e1)"><div class="m-env-h"><b>Bourse</b><span class="v">' + eur(s.valeur) + '</span><span class="pv">relevé Versus de ' + esc(rel || "—") + '</span><span class="j"></span></div>' +
        envs.map(e => '<div class="ms-r"><b>' + esc(e.nom) + '</b><span class="v">' + eur(e.valeur) + "</span><small>" + (e.ouverture ? "depuis " + frDate(e.ouverture).slice(3) : "") + '</small><small class="s">mois <i class="' + sens(e.m1) + '">' + pct(e.m1) + '</i> · total <i class="' + sens(e.gain) + '">' + eur(e.gain, 0, true) + " · " + pct(e.gainPct) + "</i></small></div>").join("") + "</div>" : "") +
      '<div class="m-env" style="--ce:var(--e2)">' + ligne("Épargne", s.epargne, ep.length ? ep.length + " compte" + (ep.length > 1 ? "s" : "") : "aucun compte", "", "", "") +
        ep.map(x => { const vieux = (Date.now() - new Date(x.date + "T12:00:00")) / 864e5 > 31;
          return '<div class="ms-r"><b>' + esc(x.nom) + '</b><span class="v">' + eur(x.solde) + "</span><small>" + esc(x.type || "") + '</small><small class="s"><span class="badge ' + (vieux ? "warn" : "flat") + '">mis à jour ' + ilYa(x.date) + "</span></small></div>"; }).join("") + "</div>" +
    "</div>" +
    '<button class="btn acc plein" type="button" id="ms-ouvrir">✏️ Mettre à jour mes soldes</button>' +
    '<p class="info">Ton épargne, c\'est toi qui la saisis, quand tu veux : seul le dernier solde compte, les anciens servent aux courbes. Ta bourse vient de tes relevés du Versus (➕ › Relevé Versus).</p>';
}
function brancherJourSimple(v) {
  const def = v.querySelector(".m-def-l");
  const TXT = Object.assign({}, DEFS, { verse: "Versé : total de ce que tu as mis en bourse (PEA, assurance-vie), d'après tes relevés du Versus." });
  v.querySelectorAll("[data-def]").forEach(b => b.addEventListener("click", () => {
    const on = b.getAttribute("aria-pressed") !== "true";
    v.querySelectorAll("[data-def]").forEach(x => x.setAttribute("aria-pressed", "false"));
    b.setAttribute("aria-pressed", String(on)); def.hidden = !on; def.textContent = on ? TXT[b.dataset.def] : "";
  }));
  const b = v.querySelector("#ms-ouvrir"); if (b) b.addEventListener("click", () => ouvrirSoldes("soldes"));
  v.querySelectorAll("[data-ms-proprio]").forEach(x => x.addEventListener("click", () => envoyerSimple({ action: "reglages", reglages: { "versus.nom": x.dataset.msProprio } }, x)));
}

/* ---- Saisie (profil simple) : soldes, historique, comptes et prêt ---- */
let paneS = "soldes", confirmeS = null;
function assurerFeuilleSimple() {
  if ($f("ms-saisie")) return;
  const d = document.createElement("div");
  d.className = "voile"; d.id = "ms-saisie"; d.hidden = true;
  d.innerHTML = '<div class="feuille moi m-feuille" role="dialog" aria-modal="true" aria-labelledby="ms-titre">' +
    '<h3 id="ms-titre">Mes chiffres <button class="icon-btn" type="button" id="ms-fermer" aria-label="Fermer"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></h3>' +
    '<div class="seg m-seg4" role="group" aria-label="Saisie"><button type="button" data-ms-pane="soldes">Mes soldes</button><button type="button" data-ms-pane="historique">Historique</button>' +
      '<button type="button" data-ms-pane="comptes">Comptes et prêt</button><button type="button" data-ms-pane="versus">Relevé Versus</button></div>' +
    '<div id="ms-corps"></div></div>';
  document.body.appendChild(d);
  const fermer = () => { d.hidden = true; confirmeS = null; };
  d.addEventListener("click", e => { if (e.target === d) fermer(); });
  $f("ms-fermer").addEventListener("click", fermer);
  d.querySelectorAll("[data-ms-pane]").forEach(b => b.addEventListener("click", () => {
    if (b.dataset.msPane === "versus") { fermer(); if (typeof ouvrirSaisie === "function") ouvrirSaisie(); return; }
    paneS = b.dataset.msPane; confirmeS = null; rendreSimple();
  }));
  document.addEventListener("keydown", e => { if (e.key === "Escape") fermer(); });
}
function ouvrirSoldes(o) {
  injecterStyle(); assurerFeuilleSimple(); lireCache();
  if (!M) { toast("Lecture de ton fichier en cours, réessaie dans un instant."); charger(false); return; }
  paneS = o || (M.comptes && M.comptes.length ? "soldes" : "comptes");
  $f("ms-saisie").hidden = false; rendreSimple();
}
async function envoyerSimple(corps, btn) {
  if (btn) { btn.disabled = true; btn.dataset.lib = btn.textContent; btn.textContent = "Envoi…"; }
  const rep = await posterFichier(corps);
  if (btn) { btn.disabled = false; btn.textContent = btn.dataset.lib; }
  if (!rep.ok) { toast(rep.message || "Enregistrement impossible."); return false; }
  recevoir(Object.assign({ profil: "simple" }, rep)); SRC = "api"; dernierAppel = Date.now();
  stock.set(K.cache, JSON.stringify(RAW));
  toast(rep.message || "Enregistré.");
  signalerCloche(); if (vueMoi()) rendre();
  return true;
}
function rendreSimple() {
  const z = $f("ms-corps"); if (!z) return;
  document.querySelectorAll("[data-ms-pane]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.msPane === paneS)));
  const comptes = (M.comptes || []), ouverts = comptes.filter(c => c.statut !== "Fermé"), soldes = M.soldes || [];
  const der = {}; soldes.forEach(s => { der[s[1]] = s; });
  if (paneS === "soldes") {
    z.innerHTML = !ouverts.length ? '<p class="info">Aucun compte pour l\'instant. Ajoute d\'abord tes livrets et assurances-vie dans « Comptes et prêt ».</p><button class="btn acc" type="button" id="ms-aller-comptes">Ajouter un compte</button>'
      : '<form class="form" id="ms-form" novalidate><div class="champ"><label for="ms-date">Date des soldes</label><input id="ms-date" type="date" value="' + aujourdhuiISO() + '" max="' + aujourdhuiISO() + '"></div>' +
        '<div class="ms-liste">' + ouverts.map((c, i) => { const d = der[c.nom];
          return '<div class="ms-l"><div class="ms-n"><b>' + esc(c.nom) + "</b><small>" + (d ? "dernier : " + eur(d[2], 2) + " le " + frDate(d[0]) : "pas encore de solde") + "</small></div>" +
            '<input type="text" inputmode="decimal" autocomplete="off" data-ms-compte="' + i + '" placeholder="' + (d ? saisieNombre(d[2], 2) : "Solde") + '" aria-label="Nouveau solde de ' + esc(c.nom) + '">' +
            '<label class="ms-int"><input type="checkbox" data-ms-int="' + i + '"> intérêts</label></div>'; }).join("") + "</div>" +
        '<button class="btn acc plein" type="submit" id="ms-envoyer">Enregistrer</button>' +
        '<p class="info">Remplis seulement les comptes qui ont changé : les autres gardent leur dernier solde. Coche « intérêts » quand la hausse vient des intérêts (en janvier en général) : elle ne comptera pas comme un versement dans tes séries.</p></form>';
    const a = z.querySelector("#ms-aller-comptes"); if (a) a.addEventListener("click", () => { paneS = "comptes"; rendreSimple(); });
    const f = z.querySelector("#ms-form");
    if (f) f.addEventListener("submit", async e => {
      e.preventDefault();
      const date = z.querySelector("#ms-date").value, entrees = [];
      let faux = null;
      z.querySelectorAll("[data-ms-compte]").forEach(inp => {
        if (!inp.value.trim()) return;
        const v = lireNombre(inp.value), c = ouverts[+inp.dataset.msCompte];
        if (!(v >= 0)) { faux = c.nom; return; }
        entrees.push({ date, compte: c.nom, solde: v, nature: z.querySelector('[data-ms-int="' + inp.dataset.msCompte + '"]').checked ? "Intérêts" : "Mise à jour" });
      });
      if (faux) { toast("Montant illisible pour " + faux + "."); return; }
      if (!entrees.length) { toast("Rien à enregistrer : remplis au moins un solde."); return; }
      if (await envoyerSimple({ action: "soldes", entrees }, z.querySelector("#ms-envoyer"))) $f("ms-saisie").hidden = true;
    });
  } else if (paneS === "historique") {
    const l = soldes.slice().reverse().slice(0, 60);
    z.innerHTML = !l.length ? '<p class="info">Pas encore de saisie.</p>' : '<div class="m-liste">' + l.map(s => '<div class="r"><span class="a">' + esc(s[1]) + '</span><span class="b">' + eur(s[2], 2) + '</span><span class="c">' + frDate(s[0]) + (s[3] === "Intérêts" ? " · intérêts" : "") + '</span><span class="d"><button class="lien danger" type="button" data-ms-suppr="' + s[5] + '">' + (confirmeS === s[5] ? "Confirmer" : "Supprimer") + "</button></span></div>").join("") + "</div>" +
      '<p class="info">Une erreur ? Supprime la ligne puis ressaisis le bon solde. Les 60 dernières saisies sont listées.</p>';
    z.querySelectorAll("[data-ms-suppr]").forEach(b => b.addEventListener("click", async () => {
      const n = +b.dataset.msSuppr;
      if (confirmeS !== n) { confirmeS = n; rendreSimple(); return; }
      const s = soldes.find(x => x[5] === n); confirmeS = null;
      if (s && await envoyerSimple({ action: "supprimerSolde", solde: { ligne: n, date: s[0], compte: s[1] } }, b)) rendreSimple();
    }));
  } else {
    const r = M.reglages || {}, ap = r.appart || {}, pr = r.pret || {};
    const val = (v, dec) => ok(v) ? saisieNombre(v, dec === undefined ? 2 : dec) : "";
    z.innerHTML = '<h4 class="m-h4">Mes comptes d\'épargne</h4><div class="m-liste">' + (comptes.length ? comptes.map((c, i) => '<div class="r"><span class="a">' + esc(c.nom) + '</span><span class="b">' + (der[c.nom] ? eur(der[c.nom][2]) : "—") + '</span><span class="c">' + esc(c.type) + (c.statut === "Fermé" ? " · fermé" : "") + '</span><span class="d"><button class="lien' + (c.statut === "Fermé" ? "" : " danger") + '" type="button" data-ms-ferme="' + i + '">' + (c.statut === "Fermé" ? "Rouvrir" : confirmeS === "f" + i ? "Confirmer" : "Fermer") + "</button></span></div>").join("") : '<div class="r"><span class="a">Aucun compte</span></div>') + "</div>" +
      '<form class="form" id="ms-ajout" novalidate><div class="rang2"><div class="champ"><label for="ms-nom">Nouveau compte</label><input id="ms-nom" type="text" maxlength="40" placeholder="Livret A, LDDS, AV…"></div>' +
        '<div class="champ"><label for="ms-type">Type</label><select id="ms-type"><option>Livret</option><option>Assurance-vie</option><option>Autre épargne</option></select></div></div>' +
        '<button class="btn ghost" type="submit">Ajouter ce compte</button><p class="info">Seulement l\'épargne : ton PEA et ton assurance-vie en bourse sont déjà suivis par tes relevés du Versus.</p></form>' +
      '<h4 class="m-h4">Appartement</h4><form class="form" id="ms-reg" novalidate>' +
        '<div class="rang2"><div class="champ"><label for="mr-prix">Prix d\'achat total (€)</label><input id="mr-prix" type="text" inputmode="decimal" value="' + val(ap.prix, 0) + '"></div>' +
        '<div class="champ"><label for="mr-apart">Ma part (%)</label><input id="mr-apart" type="text" inputmode="decimal" value="' + (ok(ap.part) ? val(ap.part) : "33,33") + '"></div></div>' +
        '<div class="champ"><label for="mr-adate">Date d\'achat</label><input id="mr-adate" type="date" value="' + (ap.date || "") + '"></div>' +
        '<h4 class="m-h4">Prêt immobilier</h4>' +
        '<div class="rang2"><div class="champ"><label for="mr-cap">Capital emprunté total (€)</label><input id="mr-cap" type="text" inputmode="decimal" value="' + val(pr.capital, 0) + '"></div>' +
        '<div class="champ"><label for="mr-ppart">Ma part (%)</label><input id="mr-ppart" type="text" inputmode="decimal" value="' + (ok(pr.part) ? val(pr.part) : "33,33") + '"></div></div>' +
        '<div class="rang2"><div class="champ"><label for="mr-taux">Taux nominal (% / an)</label><input id="mr-taux" type="text" inputmode="decimal" value="' + val(pr.taux, 3) + '"></div>' +
        '<div class="champ"><label for="mr-duree">Durée (années)</label><input id="mr-duree" type="text" inputmode="decimal" value="' + val(pr.duree, 0) + '"></div></div>' +
        '<div class="rang2"><div class="champ"><label for="mr-debut">1re échéance</label><input id="mr-debut" type="date" value="' + (pr.debut || "") + '"></div>' +
        '<div class="champ"><label for="mr-ass">Assurance / mois, ma part (€)</label><input id="mr-ass" type="text" inputmode="decimal" value="' + val(pr.assurance) + '"></div></div>' +
        '<button class="btn acc plein" type="submit" id="mr-envoyer">Enregistrer l\'appartement et le prêt</button>' +
        '<p class="info">Prêt à plusieurs : saisis le capital et le prix totaux, et ta part (1/3 = 33,33 %). L\'app calcule l\'échéancier et ne compte que ta part dans ton patrimoine net. Tout est dans l\'offre de prêt.</p></form>';
    z.querySelectorAll("[data-ms-ferme]").forEach(b => b.addEventListener("click", async () => {
      const i = +b.dataset.msFerme, c = comptes[i];
      if (c.statut !== "Fermé" && confirmeS !== "f" + i) { confirmeS = "f" + i; rendreSimple(); return; }
      confirmeS = null;
      if (await envoyerSimple({ action: "compte", op: c.statut === "Fermé" ? "rouvrir" : "fermer", nom: c.nom }, b)) rendreSimple();
    }));
    z.querySelector("#ms-ajout").addEventListener("submit", async e => {
      e.preventDefault();
      const nom = z.querySelector("#ms-nom").value.trim(); if (!nom) { toast("Donne un nom au compte."); return; }
      if (await envoyerSimple({ action: "compte", op: "ajouter", nom, type: z.querySelector("#ms-type").value }, e.submitter)) rendreSimple();
    });
    z.querySelector("#ms-reg").addEventListener("submit", async e => {
      e.preventDefault();
      const n = id => { const t = z.querySelector(id).value.trim(); return t === "" ? null : lireNombre(t); };
      const reglages = { "appart.prix": n("#mr-prix"), "appart.part": n("#mr-apart"), "appart.date": z.querySelector("#mr-adate").value || null,
        "pret.capital": n("#mr-cap"), "pret.part": n("#mr-ppart"), "pret.taux": n("#mr-taux"), "pret.duree": n("#mr-duree"), "pret.debut": z.querySelector("#mr-debut").value || null, "pret.assurance": n("#mr-ass") };
      if (Object.values(reglages).some(x => typeof x === "number" && !(x >= 0))) { toast("Un montant est illisible."); return; }
      if ((reglages["appart.part"] || 0) > 100 || (reglages["pret.part"] || 0) > 100) { toast("Une part ne peut pas dépasser 100 %."); return; }
      await envoyerSimple({ action: "reglages", reglages }, z.querySelector("#mr-envoyer"));
    });
  }
}

/* ---------- Interface publique ---------- */
window.Moi = {
  rendre,
  prechauffer() { injecterStyle(); if (!configure()) { signalerCloche(); return; } lireCache(); signalerCloche(); if (Date.now() - dernierAppel > 5 * 60e3) charger(false); },
  notifications: htmlNotifications,
  saisir(partiel, onglet) { lireCache(); if (M && M.simple) ouvrirSoldes(); else ouvrirSaisieM(partiel, onglet); },
  anneesPrivees() { lireCache(); return configure() ? anneesPrivees() : []; },
  bilanPrive(an) { lireCache(); if (M) ouvrirDiapos("Mon patrimoine · " + an, diaposPrivees(an)); },
  million(el) { afficherMillion(el); },
  rafraichir(frais) { if (configure()) { rendre(); charger(!!frais); } },
  configure,
  connecter(url, k) {
    url = String(url || "").trim();
    if (url) stock.set(K.api, url);
    if (k) stock.set(K.cle, k);
    if (url || k) { M = null; SRC = ""; erreur = ""; dernierAppel = 0; stock.del(K.cache); }
  },
  oublier() { [K.api, K.cle, K.cache].forEach(k => stock.del(k)); M = null; SRC = ""; erreur = ""; signalerCloche(); },
  async tester(url, k) {
    try {
      const j = await (await fetch(url + (url.includes("?") ? "&" : "?") + "action=ping&cle=" + encodeURIComponent(k), { cache: "no-store" })).json();
      return j.ok ? { ok: true, message: "Ton fichier répond (API version " + (j.version || "?") + ")." } : { ok: false, message: j.message || "Clé refusée." };
    } catch (e) { return { ok: false, message: "Impossible de joindre cette adresse : vérifie qu'elle finit par /exec et que le déploiement est en accès « Tout le monde »." }; }
  },
  etat() { return { configure: configure(), adresse: adresse(), aUneCle: !!cle(), maj: M ? M.majTexte : "" }; }
};
})();
