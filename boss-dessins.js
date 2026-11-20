/* boss-dessins.js : extrait tel quel d'index.html (l.4825-5939 et 5972-5999), pour être partagé avec carnet.html. */
/* Boss du Crépuscule : 18 illustrations SVG (12 de la semaine + 6 du mois).
   bossSvg(cle, id) → chaîne <svg>. viewBox 120×130, style « jouet sombre » comme le Golem. */
const BOSS_DESSINS = {
  golem: p => `
    <defs>
      <radialGradient id="${p}r" cx="35%" cy="25%" r="80%"><stop offset="0" stop-color="#a99bb6"/><stop offset=".55" stop-color="#5e4f6e"/><stop offset="1" stop-color="#2c2338"/></radialGradient>
      <radialGradient id="${p}t" cx="40%" cy="30%" r="75%"><stop offset="0" stop-color="#9a8cab"/><stop offset="1" stop-color="#3a2f48"/></radialGradient>
      <radialGradient id="${p}f" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffd27a"/><stop offset=".5" stop-color="#ff9a3c" stop-opacity=".7"/><stop offset="1" stop-color="#ff7a1c" stop-opacity="0"/></radialGradient>
      <linearGradient id="${p}m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fb565"/><stop offset="1" stop-color="#4d6b34"/></linearGradient>
    </defs>
    <ellipse cx="60" cy="124" rx="46" ry="5" fill="#000" opacity=".45"/>
    <path d="M30 104 q-2 -10 10 -12 q12 2 12 12 v14 q0 6 -11 6 q-12 0 -11 -6z" fill="url(#${p}t)" stroke="#1d1626" stroke-width="1.6"/>
    <path d="M68 104 q0 -10 12 -12 q11 2 10 12 v14 q1 6 -11 6 q-11 0 -11 -6z" fill="url(#${p}t)" stroke="#1d1626" stroke-width="1.6"/>
    <g class="b-bras-g"><path d="M26 52 q-16 4 -18 24 q-2 16 4 26 q8 6 15 -2 q4 -12 4 -24z" fill="url(#${p}t)" stroke="#1d1626" stroke-width="1.6"/>
      <path d="M6 96 q2 -8 10 -8 q9 0 10 8 q0 9 -10 10 q-10 -1 -10 -10z" fill="url(#${p}r)" stroke="#1d1626" stroke-width="1.6"/>
      <path d="M10 70 l6 4 M12 80 l5 2" stroke="#2a2133" stroke-width="1.2"/></g>
    <g class="b-bras-d"><path d="M94 52 q16 4 18 24 q2 16 -4 26 q-8 6 -15 -2 q-4 -12 -4 -24z" fill="url(#${p}t)" stroke="#1d1626" stroke-width="1.6"/>
      <path d="M114 96 q-2 -8 -10 -8 q-9 0 -10 8 q0 9 10 10 q10 -1 10 -10z" fill="url(#${p}r)" stroke="#1d1626" stroke-width="1.6"/>
      <path d="M108 72 l-5 4" stroke="#2a2133" stroke-width="1.2"/></g>
    <path d="M24 60 q4 -20 36 -22 q32 2 36 22 q4 26 -6 40 q-30 10 -60 0 q-10 -14 -6 -40z" fill="url(#${p}r)" stroke="#1d1626" stroke-width="2"/>
    <path d="M30 56 q10 -10 28 -12" stroke="#c8bcd4" stroke-width="2" fill="none" opacity=".45" stroke-linecap="round"/>
    <circle cx="60" cy="74" r="17" fill="url(#${p}f)" class="b-lueur"/>
    <path class="b-lueur" d="M60 58 l-4 9 l7 4 l-6 9 l5 8 M44 66 l7 5 l-3 7 M77 64 l-6 6 l4 8" stroke="#ffb347" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="60" cy="74" r="9" fill="none" stroke="#ffcf7a" stroke-width="1.2" opacity=".8" class="b-lueur"/>
    <path d="M26 64 q8 -6 14 -2 q-4 6 -14 6z M78 46 q10 -4 16 4 q-8 2 -16 -4z" fill="url(#${p}m)"/>
    <path d="M38 22 q4 -12 22 -12 q18 0 22 12 q4 14 -4 22 q-18 6 -36 0 q-8 -8 -4 -22z" fill="url(#${p}r)" stroke="#1d1626" stroke-width="2"/>
    <path d="M42 12 q6 -6 14 -2 q6 -6 12 0 q-10 6 -26 2z" fill="url(#${p}m)"/>
    <path d="M42 24 q8 -4 16 0 M62 24 q8 -4 16 0" stroke="#1d1626" stroke-width="3" fill="none" stroke-linecap="round"/>
    <g class="b-oeil"><path d="M45 28 q5 3 10 0" stroke="#ffb347" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M65 28 q5 3 10 0" stroke="#ffb347" stroke-width="3" fill="none" stroke-linecap="round"/></g>
    <path d="M52 37 q8 3 16 0" stroke="#1d1626" stroke-width="2" fill="none" stroke-linecap="round"/>
    <g class="b-zz" font-family="Georgia" font-weight="700" fill="#d9cdf0"><text x="88" y="16" font-size="9">z</text><text x="96" y="9" font-size="7">z</text><text x="102" y="4" font-size="5">z</text></g>`,

  liche: p => `
    <defs>
      <linearGradient id="${p}r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b46a3"/><stop offset=".6" stop-color="#3a2263"/><stop offset="1" stop-color="#1c1033" stop-opacity=".2"/></linearGradient>
      <radialGradient id="${p}c" cx="45%" cy="35%" r="70%"><stop offset="0" stop-color="#f3eedd"/><stop offset="1" stop-color="#b9b19a"/></radialGradient>
      <radialGradient id="${p}g" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#9dffdf"/><stop offset=".45" stop-color="#3fe0b0" stop-opacity=".5"/><stop offset="1" stop-color="#3fe0b0" stop-opacity="0"/></radialGradient>
    </defs>
    <ellipse cx="60" cy="125" rx="30" ry="4" fill="#3fe0b0" opacity=".18"/>
    <path class="b-volute" d="M30 118 q-8 -6 -2 -14 M92 116 q8 -8 0 -16" stroke="#7dffcf" stroke-width="1.6" fill="none" opacity=".5" stroke-linecap="round"/>
    <path d="M60 14 Q86 20 92 50 L100 108 l-8 6 -6 -8 -7 9 -7 -9 -6 10 -6 -10 -6 9 -7 -9 -6 8 -8 -6 L28 50 Q34 20 60 14z" fill="url(#${p}r)" stroke="#140a24" stroke-width="1.8"/>
    <path d="M44 60 Q60 54 76 60 L80 108 H40z" fill="#2a1848" opacity=".7"/>
    <path d="M36 52 L60 64 L84 52" stroke="#d4ad3c" stroke-width="2" fill="none"/>
    <path d="M60 14 Q80 18 86 44 Q72 30 60 30 Q48 30 34 44 Q40 18 60 14z" fill="#24143e"/>
    <path d="M44 22 l4 -10 l5 7 l7 -10 l7 10 l5 -7 l4 10 q-16 -4 -32 0z" fill="#d4ad3c" stroke="#7a5a12" stroke-width="1"/>
    <circle cx="60" cy="13" r="2.2" fill="#7dffcf"/>
    <path d="M47 34 q13 -10 26 0 q3 14 -4 20 h-18 q-7 -6 -4 -20z" fill="url(#${p}c)" stroke="#4a4232" stroke-width="1.3"/>
    <g class="b-oeil"><ellipse cx="54" cy="40" rx="4.2" ry="4.8" fill="#0b0810"/><ellipse cx="66" cy="40" rx="4.2" ry="4.8" fill="#0b0810"/>
      <circle cx="54" cy="40" r="1.9" fill="#7dffcf"/><circle cx="66" cy="40" r="1.9" fill="#7dffcf"/></g>
    <path d="M58 46 l2 3 l2 -3z" fill="#4a4232"/>
    <path d="M53 51 h14 M55 51 v3 M58 51 v3 M61 51 v3 M64 51 v3" stroke="#4a4232" stroke-width="1.2"/>
    <circle cx="60" cy="84" r="24" fill="url(#${p}g)" class="b-lueur"/>
    <path d="M36 74 q10 -6 16 4 M84 74 q-10 -6 -16 4" stroke="url(#${p}c)" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M50 76 q-3 -2 -2 2 M70 76 q3 -2 2 2" stroke="#e8e2cf" stroke-width="2.4" fill="none"/>
    <rect x="50" y="70" width="20" height="32" rx="4" fill="#0f0f14" stroke="#7dffcf" stroke-width="1.4"/>
    <rect class="b-ecran" x="52.5" y="73" width="15" height="24" rx="2" fill="#3fe0b0"/>
    <path d="M55 77 h10 M55 81 h7 M55 85 h9 M55 89 h5" stroke="#0e5a46" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="69" cy="72" r="4" fill="#e5383b" stroke="#fff" stroke-width="1"/><text x="69" y="74.3" font-size="5.5" text-anchor="middle" fill="#fff" font-weight="700" font-family="system-ui">9</text>
    <g class="b-volute" fill="#7dffcf" opacity=".7"><circle cx="24" cy="40" r="1.6"/><circle cx="98" cy="34" r="1.3"/><circle cx="104" cy="70" r="1.8"/><circle cx="16" cy="80" r="1.2"/></g>`,

  spectre: p => `
    <defs>
      <linearGradient id="${p}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef5ff" stop-opacity=".97"/><stop offset=".55" stop-color="#a9c2f0" stop-opacity=".8"/><stop offset="1" stop-color="#6d8fd6" stop-opacity=".15"/></linearGradient>
      <radialGradient id="${p}h" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="#cfe0ff" stop-opacity=".3"/><stop offset=".7" stop-color="#cfe0ff" stop-opacity=".08"/><stop offset="1" stop-color="#cfe0ff" stop-opacity="0"/></radialGradient>
      <radialGradient id="${p}o" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#7fa8ff"/><stop offset="1" stop-color="#0d1430"/></radialGradient>
    </defs>
    <ellipse cx="60" cy="124" rx="26" ry="3.5" fill="#000" opacity=".25"/>
    <circle cx="60" cy="56" r="54" fill="url(#${p}h)"/>
    <path class="b-queue" d="M60 10 C92 10 100 38 100 62 V104 q-5 -6 -10 0 q-5 8 -10 0 q-5 -8 -10 0 q-5 8 -10 0 q-5 -8 -10 0 q-5 8 -10 0 q-5 -6 -10 0 V62 C20 38 28 10 60 10Z" fill="url(#${p}a)" stroke="#b7ccf4" stroke-width="1.2"/>
    <path d="M36 30 q8 -14 22 -16" stroke="#fff" stroke-width="3" fill="none" opacity=".55" stroke-linecap="round"/>
    <g class="b-oeil"><ellipse cx="47" cy="48" rx="7.5" ry="10" fill="url(#${p}o)"/><ellipse cx="73" cy="48" rx="7.5" ry="10" fill="url(#${p}o)"/>
      <circle cx="49" cy="46" r="1.8" fill="#e8f0ff"/><circle cx="75" cy="46" r="1.8" fill="#e8f0ff"/></g>
    <path d="M52 70 q8 -7 16 0 q-2 9 -8 9 q-6 0 -8 -9z" fill="#141c3a"/>
    <path class="b-bras-g" d="M24 66 q-14 2 -14 16 q2 6 8 2" stroke="#dbe8ff" stroke-width="6" fill="none" stroke-linecap="round" opacity=".85"/>
    <g class="b-bras-d"><path d="M96 66 q12 -4 14 -16" stroke="#dbe8ff" stroke-width="6" fill="none" stroke-linecap="round" opacity=".85"/>
      <g transform="rotate(8 106 30)"><rect x="96" y="16" width="22" height="24" rx="3" fill="#f6ecd2" stroke="#8c7a52" stroke-width="1.4"/>
      <rect x="96" y="16" width="22" height="7" rx="2" fill="#c0453a"/><circle cx="101" cy="16" r="1.6" fill="#5a4a2a"/><circle cx="113" cy="16" r="1.6" fill="#5a4a2a"/>
      <text x="107" y="35" font-size="9" font-family="Georgia" font-weight="700" fill="#5a4a2a" text-anchor="middle">J+1</text></g></g>
    <g class="b-volute" fill="#dbe8ff" opacity=".6"><circle cx="14" cy="44" r="1.6"/><circle cx="104" cy="88" r="1.4"/><circle cx="22" cy="100" r="1.2"/></g>`,

  basilic: p => `
    <defs>
      <linearGradient id="${p}a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9ad96f"/><stop offset=".5" stop-color="#4f9a45"/><stop offset="1" stop-color="#235229"/></linearGradient>
      <linearGradient id="${p}v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3e7a8"/><stop offset="1" stop-color="#c9b25c"/></linearGradient>
      <pattern id="${p}e" width="8" height="6" patternUnits="userSpaceOnUse"><path d="M0 6 q4 -6 8 0" stroke="#1f4a25" stroke-width=".8" fill="none" opacity=".55"/></pattern>
    </defs>
    <ellipse cx="60" cy="124" rx="48" ry="5" fill="#000" opacity=".45"/>
    <path class="b-queue" d="M20 108 q-12 -2 -14 -10 q0 -6 6 -6" stroke="url(#${p}a)" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M16 112 q-2 -22 26 -22 h36 q26 0 26 16 q0 16 -30 16 H30 q-14 0 -14 -10z" fill="url(#${p}a)" stroke="#173a1c" stroke-width="2"/>
    <path d="M16 112 q-2 -22 26 -22 h36 q26 0 26 16 q0 16 -30 16 H30 q-14 0 -14 -10z" fill="url(#${p}e)"/>
    <path d="M28 112 q30 8 64 -4" stroke="url(#${p}v)" stroke-width="6" fill="none" opacity=".85" stroke-linecap="round"/>
    <path d="M74 96 q20 -24 4 -48 q-8 -10 -22 -8" fill="none" stroke="url(#${p}a)" stroke-width="20" stroke-linecap="round"/>
    <path d="M74 96 q20 -24 4 -48 q-8 -10 -22 -8" fill="none" stroke="url(#${p}e)" stroke-width="20" stroke-linecap="round"/>
    <path d="M80 92 q14 -20 2 -40" fill="none" stroke="url(#${p}v)" stroke-width="6" stroke-linecap="round" opacity=".8"/>
    <path d="M44 14 l4 -10 l4 8 l5 -10 l4 10 l5 -8 l2 12z" fill="#c0453a" stroke="#6a1c14" stroke-width="1"/>
    <path d="M34 26 q14 -18 40 -4 q10 8 2 20 q-14 12 -38 6 q-14 -8 -4 -22z" fill="url(#${p}a)" stroke="#173a1c" stroke-width="2"/>
    <path d="M40 22 q10 -8 24 -6" stroke="#c9f0a8" stroke-width="2" fill="none" opacity=".6" stroke-linecap="round"/>
    <g class="b-oeil"><ellipse cx="50" cy="30" rx="6" ry="5" fill="#ffe14a" stroke="#6a5a10" stroke-width="1"/><ellipse cx="50" cy="30" rx="1.4" ry="4.2" fill="#1a1a08"/>
      <ellipse cx="66" cy="29" rx="5.4" ry="4.6" fill="#ffe14a" stroke="#6a5a10" stroke-width="1"/><ellipse cx="66" cy="29" rx="1.3" ry="3.8" fill="#1a1a08"/></g>
    <path d="M42 24 l10 2 M60 22 l10 2" stroke="#173a1c" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M38 40 q14 6 34 0" stroke="#173a1c" stroke-width="1.8" fill="none"/>
    <path d="M46 41 l2 4 l2 -3 M60 41 l2 4 l2 -3" fill="#fff6d8"/>
    <path class="b-langue" d="M38 42 q-8 2 -12 0 l-4 -3 m4 3 l-4 3" stroke="#e5383b" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <g transform="translate(94 92) rotate(-14)"><path d="M0 0 l14 -24 q4 8 -2 26z" fill="#f2c25a" stroke="#9a6a1c" stroke-width="1.2"/>
      <path d="M2 -2 l11 -20" stroke="#e0973a" stroke-width="2.2"/><circle cx="7" cy="-9" r="1.8" fill="#c0453a"/><circle cx="10" cy="-15" r="1.5" fill="#c0453a"/><circle cx="5" cy="-4" r="1.3" fill="#5a8a2a"/></g>
    <g class="b-volute" stroke="#c9b8e0" stroke-width="1.2" fill="none" opacity=".6"><path d="M100 72 q3 -4 0 -8 q-3 -4 0 -8"/><path d="M108 76 q3 -4 0 -8"/></g>`,

  harpie: p => `
    <defs><linearGradient id="${p}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b07ac9"/><stop offset="1" stop-color="#4f2f66"/></linearGradient></defs>
    <ellipse cx="60" cy="124" rx="32" ry="4" fill="#000" opacity=".4"/>
    <path d="M44 56 Q4 30 6 74 Q22 66 30 80 Q34 66 44 74 Z" fill="url(#${p}a)" stroke="#2a1838" stroke-width="2"/>
    <path d="M76 56 Q116 30 114 74 Q98 66 90 80 Q86 66 76 74 Z" fill="url(#${p}a)" stroke="#2a1838" stroke-width="2"/>
    <ellipse cx="60" cy="80" rx="20" ry="26" fill="url(#${p}a)" stroke="#2a1838" stroke-width="2"/>
    <path d="M48 104 l-4 16 m4 -16 l2 16 M72 104 l4 16 m-4 -16 l-2 16" stroke="#e0a23a" stroke-width="3" stroke-linecap="round"/>
    <circle cx="60" cy="42" r="17" fill="#e9c9a8" stroke="#5a3a2a" stroke-width="1.5"/>
    <path d="M43 40 q2 -20 17 -20 q15 0 17 20 q-6 -10 -17 -10 q-11 0 -17 10z" fill="#5b2f78"/>
    <circle cx="54" cy="40" r="3" fill="#2a1838"/><circle cx="66" cy="40" r="3" fill="#2a1838"/>
    <ellipse cx="60" cy="51" rx="6" ry="5" fill="#2a1020"/>
    <path d="M84 40 q6 6 0 12 M90 34 q10 12 0 24 M96 28 q14 18 0 36" stroke="#ffcf5a" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <path d="M36 40 q-6 6 0 12 M30 34 q-10 12 0 24" stroke="#ffcf5a" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,

  troll: p => `
    <defs><linearGradient id="${p}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7f9a7a"/><stop offset="1" stop-color="#3c4f3c"/></linearGradient></defs>
    <ellipse cx="60" cy="124" rx="44" ry="5" fill="#000" opacity=".4"/>
    <path d="M98 8 a10 10 0 1 0 8 16 a8 8 0 1 1 -8 -16z" fill="#f4e7a1"/>
    <ellipse cx="60" cy="84" rx="38" ry="34" fill="url(#${p}a)" stroke="#1f2a1f" stroke-width="2"/>
    <ellipse cx="60" cy="92" rx="22" ry="18" fill="#a9bb92" opacity=".55"/>
    <rect x="34" y="110" width="18" height="14" rx="6" fill="#3c4f3c"/><rect x="68" y="110" width="18" height="14" rx="6" fill="#3c4f3c"/>
    <ellipse cx="60" cy="46" rx="26" ry="22" fill="url(#${p}a)" stroke="#1f2a1f" stroke-width="2"/>
    <path d="M36 40 Q50 4 84 22 L100 34 L84 34 Q70 26 36 40Z" fill="#3b5ba5" stroke="#1d2e57" stroke-width="1.5"/>
    <circle cx="102" cy="36" r="5" fill="#f2f2f2"/>
    <ellipse cx="50" cy="48" rx="6" ry="4" fill="#ffefd0"/><circle cx="50" cy="48" r="2.4" fill="#c0453a"/>
    <ellipse cx="70" cy="48" rx="6" ry="4" fill="#ffefd0"/><circle cx="70" cy="48" r="2.4" fill="#c0453a"/>
    <path d="M46 58 q14 8 28 0" stroke="#1f2a1f" stroke-width="2" fill="#2a1414"/>
    <path d="M50 58 l2 6 l3 -5 M66 58 l2 6 l3 -5" fill="#f2e6c8"/>
    <rect x="10" y="78" width="16" height="18" rx="3" fill="#f2e6c8" stroke="#6b5a3a" stroke-width="1.5"/>
    <path d="M26 82 q6 4 0 10" stroke="#6b5a3a" stroke-width="2" fill="none"/>
    <path d="M14 74 q2 -6 0 -10 M20 74 q2 -6 0 -10" stroke="#c9b8e0" stroke-width="1.5" fill="none" opacity=".7"/>`,

  hydre: p => `
    <defs><linearGradient id="${p}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3fa3a3"/><stop offset="1" stop-color="#1c4f57"/></linearGradient></defs>
    <ellipse cx="60" cy="124" rx="44" ry="5" fill="#000" opacity=".4"/>
    <ellipse cx="60" cy="104" rx="38" ry="18" fill="url(#${p}a)" stroke="#0f2e33" stroke-width="2"/>
    <path d="M44 96 Q24 70 22 44" stroke="url(#${p}a)" stroke-width="12" fill="none" stroke-linecap="round"/>
    <path d="M60 92 Q60 60 60 30" stroke="url(#${p}a)" stroke-width="12" fill="none" stroke-linecap="round"/>
    <path d="M76 96 Q96 70 98 44" stroke="url(#${p}a)" stroke-width="12" fill="none" stroke-linecap="round"/>
    ${[[22, 40], [60, 24], [98, 40]].map(([x, y]) => `
      <ellipse cx="${x}" cy="${y}" rx="13" ry="10" fill="url(#${p}a)" stroke="#0f2e33" stroke-width="2"/>
      <circle cx="${x - 4}" cy="${y - 2}" r="2.6" fill="#ffe066"/><circle cx="${x + 4}" cy="${y - 2}" r="2.6" fill="#ffe066"/>
      <path d="M${x - 6} ${y + 5} q6 3 12 0" stroke="#0f2e33" stroke-width="1.6" fill="none"/>
      <circle cx="${x + 10}" cy="${y - 10}" r="6" fill="#e5383b" stroke="#fff" stroke-width="1.5"/>
      <text x="${x + 10}" y="${y - 7.6}" font-size="7" text-anchor="middle" fill="#fff" font-weight="700" font-family="system-ui">${x === 60 ? 99 : x < 60 ? 3 : 12}</text>`).join('')}`,

  necro: p => `
    <defs><linearGradient id="${p}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3a4a"/><stop offset="1" stop-color="#111118"/></linearGradient>
    <radialGradient id="${p}g"><stop offset="0" stop-color="#9dff6a"/><stop offset="1" stop-color="#9dff6a" stop-opacity="0"/></radialGradient></defs>
    <ellipse cx="60" cy="124" rx="40" ry="5" fill="#000" opacity=".4"/>
    <path d="M56 14 Q30 20 30 54 L20 122 H94 L84 54 Q84 20 56 14Z" fill="url(#${p}a)" stroke="#05050a" stroke-width="2"/>
    <path d="M40 40 Q56 26 74 40 L72 62 Q56 70 42 62Z" fill="#05050a"/>
    <circle cx="50" cy="50" r="3" fill="#9dff6a"/><circle cx="64" cy="50" r="3" fill="#9dff6a"/>
    <line x1="100" y1="22" x2="100" y2="122" stroke="#6b5a3a" stroke-width="4"/>
    <circle cx="100" cy="18" r="14" fill="url(#${p}g)"/>
    <ellipse cx="100" cy="20" rx="8" ry="9" fill="#e6dfcc" stroke="#555" stroke-width="1"/>
    <circle cx="97" cy="19" r="2" fill="#111"/><circle cx="103" cy="19" r="2" fill="#111"/>
    <path d="M6 70 h26 v16 h-16 l-6 6 v-6 h-4z" fill="#d8d4e8" stroke="#6a6680" stroke-width="1.5"/>
    <circle cx="13" cy="78" r="1.8" fill="#6a6680"/><circle cx="19" cy="78" r="1.8" fill="#6a6680"/><circle cx="25" cy="78" r="1.8" fill="#6a6680"/>
    <path d="M4 66 l30 24" stroke="#c0453a" stroke-width="3" stroke-linecap="round"/>`,

  gargouille: p => `
    <defs><linearGradient id="${p}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a7a39a"/><stop offset="1" stop-color="#5c5850"/></linearGradient></defs>
    <rect x="14" y="110" width="92" height="14" rx="2" fill="#4a463f" stroke="#2a2824" stroke-width="2"/>
    <path d="M40 60 Q0 30 4 84 Q18 74 26 88 Q30 72 40 80Z" fill="url(#${p}a)" stroke="#2a2824" stroke-width="2"/>
    <path d="M80 60 Q120 30 116 84 Q102 74 94 88 Q90 72 80 80Z" fill="url(#${p}a)" stroke="#2a2824" stroke-width="2"/>
    <path d="M34 110 Q30 70 60 64 Q90 70 86 110Z" fill="url(#${p}a)" stroke="#2a2824" stroke-width="2"/>
    <ellipse cx="60" cy="44" rx="22" ry="20" fill="url(#${p}a)" stroke="#2a2824" stroke-width="2"/>
    <path d="M42 30 l-8 -16 l14 10 M78 30 l8 -16 l-14 10" fill="#77736a" stroke="#2a2824" stroke-width="1.5"/>
    <path d="M48 42 l8 3 M72 42 l-8 3" stroke="#2a2824" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="52" cy="47" r="2.6" fill="#ff8c3a"/><circle cx="68" cy="47" r="2.6" fill="#ff8c3a"/>
    <path d="M50 56 q10 -4 20 0" stroke="#2a2824" stroke-width="2" fill="none"/>
    <path d="M60 64 l-4 10 l6 6 l-4 12 M74 82 l6 8 l-2 8" stroke="#2a2824" stroke-width="1.3" fill="none"/>
    <path d="M40 110 l-4 -10 M80 110 l4 -10" stroke="#2a2824" stroke-width="5" stroke-linecap="round"/>`,

  mimique: p => `
    <defs><linearGradient id="${p}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a0662d"/><stop offset="1" stop-color="#5a3414"/></linearGradient></defs>
    <ellipse cx="60" cy="124" rx="46" ry="5" fill="#000" opacity=".4"/>
    <rect x="14" y="74" width="92" height="46" rx="6" fill="url(#${p}a)" stroke="#2d1a08" stroke-width="2"/>
    <rect x="14" y="90" width="92" height="6" fill="#d4ad3c"/><rect x="54" y="84" width="12" height="16" rx="2" fill="#d4ad3c" stroke="#6a5320" stroke-width="1.5"/>
    <path d="M14 74 Q14 20 60 20 Q106 20 106 74 L100 62 Q60 50 20 62Z" fill="url(#${p}a)" stroke="#2d1a08" stroke-width="2"/>
    <path d="M14 74 Q60 56 106 74 L100 62 Q60 50 20 62Z" fill="#2a0c10"/>
    <path d="M22 66 l5 8 l4 -9 l5 9 l5 -10 l5 10 l5 -10 l5 10 l5 -10 l5 10 l5 -10 l5 9 l4 -9 l5 8" fill="#f2ead2" stroke="#8a7a5a" stroke-width="1"/>
    <path d="M44 72 q16 26 34 4 q-6 18 -18 18 q-12 0 -16 -22z" fill="#d6455b" stroke="#7a1f2e" stroke-width="1.5"/>
    <ellipse cx="44" cy="40" rx="7" ry="6" fill="#ffd23f"/><circle cx="44" cy="40" r="2.6" fill="#111"/>
    <ellipse cx="76" cy="40" rx="7" ry="6" fill="#ffd23f"/><circle cx="76" cy="40" r="2.6" fill="#111"/>
    <rect x="14" y="20" width="10" height="100" rx="2" fill="#d4ad3c" opacity=".6"/><rect x="96" y="20" width="10" height="100" rx="2" fill="#d4ad3c" opacity=".6"/>`,

  dragon: p => `
    <defs><linearGradient id="${p}a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7d8fb0"/><stop offset="1" stop-color="#3a4560"/></linearGradient></defs>
    <ellipse cx="60" cy="124" rx="50" ry="5" fill="#000" opacity=".4"/>
    <path d="M44 70 Q20 30 6 44 Q12 60 26 66 Q14 70 18 80Z" fill="#56637f" stroke="#1d2436" stroke-width="2"/>
    <ellipse cx="60" cy="96" rx="40" ry="24" fill="url(#${p}a)" stroke="#1d2436" stroke-width="2"/>
    <path d="M98 100 q20 6 16 -14 l-6 6" stroke="url(#${p}a)" stroke-width="9" fill="none" stroke-linecap="round"/>
    <path d="M40 84 Q36 56 56 48 L78 46 Q96 48 94 64 Q92 76 76 76 L56 80Z" fill="url(#${p}a)" stroke="#1d2436" stroke-width="2"/>
    <path d="M58 48 l-6 -14 l12 10 M70 46 l2 -14 l6 14" fill="#c9b8a0" stroke="#1d2436" stroke-width="1.5"/>
    <path d="M64 58 q6 4 12 0" stroke="#1d2436" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M64 56 q6 -2 12 0" stroke="#ffd23f" stroke-width="1.5" fill="none"/>
    <circle cx="90" cy="66" r="1.6" fill="#1d2436"/>
    <path d="M96 64 q10 -8 8 -18 q8 2 6 -10" stroke="#a7a3b5" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>
    <path d="M40 96 q20 10 40 0" stroke="#a9b7d0" stroke-width="3" fill="none" opacity=".5"/>`,

  archidemon: p => `
    <defs><linearGradient id="${p}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c0453a"/><stop offset="1" stop-color="#5a1410"/></linearGradient>
    <radialGradient id="${p}g"><stop offset="0" stop-color="#ff8c3a" stop-opacity=".6"/><stop offset="1" stop-color="#ff8c3a" stop-opacity="0"/></radialGradient></defs>
    <circle cx="60" cy="70" r="58" fill="url(#${p}g)"/>
    <ellipse cx="60" cy="124" rx="46" ry="5" fill="#000" opacity=".5"/>
    <path d="M40 64 Q-4 24 2 84 Q16 74 24 90 Q30 74 40 80Z" fill="#3a0c0a" stroke="#1a0504" stroke-width="2"/>
    <path d="M80 64 Q124 24 118 84 Q104 74 96 90 Q90 74 80 80Z" fill="#3a0c0a" stroke="#1a0504" stroke-width="2"/>
    <path d="M30 122 Q26 70 60 62 Q94 70 90 122Z" fill="url(#${p}a)" stroke="#1a0504" stroke-width="2"/>
    <ellipse cx="60" cy="44" rx="22" ry="21" fill="url(#${p}a)" stroke="#1a0504" stroke-width="2"/>
    <path d="M42 34 Q30 18 36 4 Q40 22 50 28Z M78 34 Q90 18 84 4 Q80 22 70 28Z" fill="#e8dcc0" stroke="#5a4a2a" stroke-width="1.5"/>
    <path d="M44 22 l4 -10 l6 8 l6 -12 l6 12 l6 -8 l4 10z" fill="#d4ad3c" stroke="#6a5320" stroke-width="1.5"/>
    <path d="M47 42 l9 4 M73 42 l-9 4" stroke="#1a0504" stroke-width="3" stroke-linecap="round"/>
    <circle cx="51" cy="47" r="3" fill="#ffd23f"/><circle cx="69" cy="47" r="3" fill="#ffd23f"/>
    <path d="M48 56 q12 8 24 0 q-12 3 -24 0z" fill="#1a0504"/><path d="M52 56 l2 4 l2 -4 M64 56 l2 4 l2 -4" fill="#f2e6c8"/>
    <path d="M60 80 q-6 10 0 20 q6 -10 0 -20z" fill="#ffb347" opacity=".8"/>`,

  procrastination: p => `
    <defs><linearGradient id="${p}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a6fb8"/><stop offset="1" stop-color="#3b2a5c"/></linearGradient>
    <radialGradient id="${p}g"><stop offset="0" stop-color="#b79cff" stop-opacity=".5"/><stop offset="1" stop-color="#b79cff" stop-opacity="0"/></radialGradient></defs>
    <circle cx="60" cy="66" r="58" fill="url(#${p}g)"/>
    <ellipse cx="60" cy="124" rx="40" ry="5" fill="#000" opacity=".5"/>
    <rect x="26" y="8" width="68" height="8" rx="3" fill="#d4ad3c" stroke="#6a5320" stroke-width="1.5"/>
    <rect x="26" y="112" width="68" height="8" rx="3" fill="#d4ad3c" stroke="#6a5320" stroke-width="1.5"/>
    <path d="M32 16 Q32 52 58 64 Q32 76 32 112 H88 Q88 76 62 64 Q88 52 88 16Z" fill="url(#${p}a)" stroke="#20163a" stroke-width="2" opacity=".92"/>
    <path d="M40 104 Q60 82 80 104Z" fill="#e8c77a"/><path d="M60 66 v30" stroke="#e8c77a" stroke-width="2" stroke-dasharray="2 3"/>
    <path d="M46 34 q5 -4 10 0 M64 34 q5 -4 10 0" stroke="#f4e7a1" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M50 46 q10 -5 20 0" stroke="#f4e7a1" stroke-width="2" fill="none"/>
    <path d="M32 70 q-18 4 -22 22 M88 70 q18 4 22 22" stroke="#6a5598" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M8 94 l4 -4 M12 96 l4 -2 M112 94 l-4 -4 M108 96 l-4 -2" stroke="#e8dcc0" stroke-width="2" stroke-linecap="round"/>`,

  dissipation: p => `
    <defs><radialGradient id="${p}a"><stop offset="0" stop-color="#9ff2e0"/><stop offset="1" stop-color="#2d7f7a"/></radialGradient>
    <radialGradient id="${p}g"><stop offset="0" stop-color="#5fc4a8" stop-opacity=".45"/><stop offset="1" stop-color="#5fc4a8" stop-opacity="0"/></radialGradient></defs>
    <circle cx="60" cy="64" r="58" fill="url(#${p}g)"/>
    <path d="M60 120 Q30 110 34 84 Q12 70 30 52 Q22 26 52 22 Q66 4 84 20 Q110 22 100 50 Q116 70 92 84 Q94 108 60 120Z" fill="url(#${p}a)" stroke="#1d4f4b" stroke-width="2" opacity=".9"/>
    <path d="M40 80 Q60 70 74 84 Q86 96 70 102 M46 60 Q70 44 86 64" stroke="#e6fff8" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/>
    <ellipse cx="50" cy="46" rx="6" ry="4" fill="#0d2a28"/><ellipse cx="72" cy="46" rx="6" ry="4" fill="#0d2a28"/>
    <circle cx="51" cy="46" r="1.6" fill="#fff"/><circle cx="73" cy="46" r="1.6" fill="#fff"/>
    <path d="M52 58 q9 6 18 0" stroke="#0d2a28" stroke-width="2" fill="none"/>
    ${[[10, 30], [108, 38], [14, 98], [106, 100], [96, 12]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="#d4ad3c" stroke="#6a5320" stroke-width="1.5"/><text x="${x}" y="${y + 2.6}" font-size="7" text-anchor="middle" fill="#6a5320" font-weight="700">€</text>`).join('')}`,

  oubli: p => `
    <defs><linearGradient id="${p}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8e4f0"/><stop offset="1" stop-color="#e8e4f0" stop-opacity="0"/></linearGradient>
    <radialGradient id="${p}g"><stop offset="0" stop-color="#cfd6ff" stop-opacity=".35"/><stop offset="1" stop-color="#cfd6ff" stop-opacity="0"/></radialGradient></defs>
    <circle cx="60" cy="62" r="58" fill="url(#${p}g)"/>
    <path d="M60 10 Q90 10 92 46 L100 124 H20 L28 46 Q30 10 60 10Z" fill="url(#${p}a)" stroke="#b9b3cc" stroke-width="1.5"/>
    <ellipse cx="60" cy="44" rx="20" ry="24" fill="#f6f3fb" stroke="#b9b3cc" stroke-width="1.5"/>
    <path d="M46 40 q14 -2 28 0" stroke="#d4cfe2" stroke-width="2" fill="none"/>
    <path d="M44 86 h32" stroke="#c9c3d8" stroke-width="2" stroke-dasharray="3 4"/><path d="M40 96 h40" stroke="#c9c3d8" stroke-width="2" stroke-dasharray="2 5" opacity=".6"/>
    <rect x="80" y="56" width="26" height="14" rx="3" fill="#f28fb0" stroke="#9a4a66" stroke-width="1.5" transform="rotate(-20 93 63)"/>
    <rect x="80" y="56" width="10" height="14" rx="2" fill="#7da7ff" transform="rotate(-20 93 63)"/>
    ${[[16, 30], [100, 24], [22, 70]].map(([x, y]) => `<path d="M${x} ${y} q-6 -6 -10 0 q4 6 10 0 q6 -6 10 0 q-4 6 -10 0z" fill="#d8d0b8" opacity=".8"/>`).join('')}`,

  fatigue: p => `
    <defs><radialGradient id="${p}a" cx=".5" cy=".4"><stop offset="0" stop-color="#9aa3b8"/><stop offset="1" stop-color="#4a5066"/></radialGradient>
    <radialGradient id="${p}g"><stop offset="0" stop-color="#8fa0c8" stop-opacity=".45"/><stop offset="1" stop-color="#8fa0c8" stop-opacity="0"/></radialGradient></defs>
    <circle cx="60" cy="66" r="58" fill="url(#${p}g)"/>
    <path d="M14 96 Q2 78 20 68 Q16 44 40 46 Q46 24 68 30 Q92 22 98 48 Q120 54 110 78 Q120 98 96 104 Q80 118 60 108 Q36 118 24 106 Q8 108 14 96Z" fill="url(#${p}a)" stroke="#2d3244" stroke-width="2"/>
    <path d="M36 66 q8 6 16 0 M68 66 q8 6 16 0" stroke="#1a1d28" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M36 66 q8 -8 16 0 M68 66 q8 -8 16 0" fill="#3a4056"/>
    <ellipse cx="60" cy="86" rx="8" ry="6" fill="#1a1d28"/>
    <path d="M30 76 q4 4 8 2 M82 76 q4 4 8 2" stroke="#6d7898" stroke-width="2" fill="none"/>
    <text x="92" y="28" font-size="14" fill="#cfd6ff" font-family="Georgia" font-weight="700">Z</text><text x="104" y="16" font-size="10" fill="#cfd6ff" font-family="Georgia">z</text>
    <path d="M10 116 q20 -6 40 0 t40 0 t30 0" stroke="#8f99b3" stroke-width="3" fill="none" opacity=".5"/>`,

  doute: p => `
    <defs><radialGradient id="${p}a" cx=".5" cy=".35"><stop offset="0" stop-color="#3d3550"/><stop offset="1" stop-color="#0f0c16"/></radialGradient>
    <radialGradient id="${p}g"><stop offset="0" stop-color="#d4ad3c" stop-opacity=".25"/><stop offset="1" stop-color="#d4ad3c" stop-opacity="0"/></radialGradient></defs>
    <circle cx="60" cy="64" r="58" fill="url(#${p}g)"/>
    <path d="M60 8 Q100 12 100 60 Q104 96 112 122 H8 Q16 96 20 60 Q20 12 60 8Z" fill="url(#${p}a)" stroke="#05040a" stroke-width="2"/>
    ${[[44, 40, 5], [76, 40, 5], [60, 58, 6], [36, 66, 3.5], [84, 68, 3.5], [50, 84, 3], [72, 86, 3], [60, 26, 3]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r * 1.4}" ry="${r}" fill="#f2e6c8"/><circle cx="${x}" cy="${y}" r="${r * .55}" fill="#c0453a"/>`).join('')}
    <text x="10" y="30" font-size="20" fill="#7a6a9a" font-family="Georgia" font-weight="700" opacity=".8">?</text>
    <text x="98" y="22" font-size="16" fill="#7a6a9a" font-family="Georgia" font-weight="700" opacity=".7">?</text>
    <text x="102" y="96" font-size="13" fill="#7a6a9a" font-family="Georgia" font-weight="700" opacity=".6">?</text>`,

  tentation: p => `
    <defs><linearGradient id="${p}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9658f"/><stop offset="1" stop-color="#6b1f44"/></linearGradient>
    <radialGradient id="${p}g"><stop offset="0" stop-color="#ffd23f" stop-opacity=".4"/><stop offset="1" stop-color="#ffd23f" stop-opacity="0"/></radialGradient></defs>
    <circle cx="60" cy="64" r="58" fill="url(#${p}g)"/>
    <ellipse cx="60" cy="124" rx="40" ry="5" fill="#000" opacity=".5"/>
    <path d="M30 122 Q20 100 40 92 Q70 84 84 104 Q92 120 70 122Z" fill="url(#${p}a)" stroke="#3a0c22" stroke-width="2"/>
    <path d="M42 96 Q34 70 46 58 Q60 50 72 60 Q82 72 76 96" fill="url(#${p}a)" stroke="#3a0c22" stroke-width="2"/>
    <ellipse cx="60" cy="40" rx="18" ry="19" fill="#f0c3c8" stroke="#6b2f3a" stroke-width="1.5"/>
    <path d="M42 40 Q40 14 60 14 Q82 14 78 40 Q74 24 60 24 Q46 24 42 40Z" fill="#3a0c22"/>
    <path d="M46 20 l-6 -12 l12 8 M74 20 l6 -12 l-12 8" fill="#3a0c22"/>
    <path d="M50 40 q4 -3 8 0 M62 40 q4 -3 8 0" stroke="#3a0c22" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M53 50 q7 5 14 0" stroke="#a8243e" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <path d="M76 70 Q96 64 100 76" stroke="#f0c3c8" stroke-width="6" fill="none" stroke-linecap="round"/>
    <circle cx="104" cy="80" r="9" fill="#d4ad3c" stroke="#6a5320" stroke-width="1.5"/>
    <path d="M104 72 l-2 -6 M104 72 q5 -6 8 -3" stroke="#5a7a2a" stroke-width="2" fill="none"/>
    <path d="M100 76 l3 3 l5 -5" stroke="#fff6c2" stroke-width="1.6" fill="none"/>`,
};
/* Boss redessinés (2e vague) : même cadre 120 × 130, sol vers y = 124.
   Parties animées : b-oeil, b-lueur, b-bras-g/d, b-aile-g/d, b-onde, b-badge, b-tete, b-couvercle, b-sable, b-orbite, b-volute, b-zz, b-queue */
const BOSS_DESSINS_2 = {
  harpie: p => `
    <defs>
      <linearGradient id="${p}pl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b98bff"/><stop offset="1" stop-color="#4b2a8a"/></linearGradient>
      <linearGradient id="${p}ai" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d4b5ff"/><stop offset=".5" stop-color="#7a4fd0"/><stop offset="1" stop-color="#2e1a5c"/></linearGradient>
      <radialGradient id="${p}pe" cx="45%" cy="35%" r="70%"><stop offset="0" stop-color="#f3d7c4"/><stop offset="1" stop-color="#b98b74"/></radialGradient>
    </defs>
    <ellipse cx="60" cy="125" rx="30" ry="4" fill="#000" opacity=".35"/>
    ${[-1, 1].map(sg => { // ailes de plumes : rémiges en éventail depuis l'épaule jusqu'au poignet
      const pl = (o, a, L, w, c) => { const r = a * Math.PI / 180, dx = Math.cos(r), dy = Math.sin(r), mx = o[0] + dx * L * .55, my = o[1] + dy * L * .55;
        return `<path d="M${o[0].toFixed(1)} ${o[1].toFixed(1)} Q${(mx - dy * w).toFixed(1)} ${(my + dx * w).toFixed(1)} ${(o[0] + dx * L).toFixed(1)} ${(o[1] + dy * L).toFixed(1)} Q${(mx + dy * w * .7).toFixed(1)} ${(my - dx * w * .7).toFixed(1)} ${o[0].toFixed(1)} ${o[1].toFixed(1)}Z" fill="${c}" stroke="#1e1240" stroke-width=".8"/>`; };
      const ang = a => sg < 0 ? a : 180 - a, X = x => 60 + sg * (60 - x);
      const rem = Array.from({ length: 8 }, (_, i) => { const t = i / 7; return pl([X(16 + 28 * t), 36 + 18 * t], ang(215 - i * 11), 30 - i * 2.2, 4.2, i % 2 ? '#7a4fd0' : '#9a6ee8'); }).join('');
      const couv = Array.from({ length: 5 }, (_, i) => { const t = i / 4; return pl([X(22 + 24 * t), 40 + 14 * t], ang(185 - i * 12), 15, 4, '#c9a8ff'); }).join('');
      return `<g class="b-aile-${sg < 0 ? 'g' : 'd'}">${rem}${couv}<path d="M${X(48)} 56 Q${X(30)} 40 ${X(14)} 35" stroke="#2e1a5c" stroke-width="3" fill="none" stroke-linecap="round"/></g>`; }).join('')}
    <path d="M54 94 L48 120 L56 112 L60 122 L64 112 L72 120 L66 94 Z" fill="#5a36a8" stroke="#1e1240" stroke-width="1.2"/>
    <path d="M53 98 L51 112 M67 98 L69 112" stroke="#e0a43a" stroke-width="3.4" stroke-linecap="round"/><path d="M52 104 h3 M51.5 108 h3 M66 104 h3 M66.5 108 h3" stroke="#a8781a" stroke-width=".8"/>
    <path d="M51 112 l-6 4 M51 112 l-1 6 M51 112 l4 5 M51 112 l1 -4 M69 112 l-4 5 M69 112 l1 6 M69 112 l6 4 M69 112 l-1 -4" stroke="#e0a43a" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M44 116.5 l-2 1.6 M50 118.5 l-.5 2 M55.5 117.5 l1.4 1.6 M64.5 117.5 l-1.4 1.6 M70 118.5 l.5 2 M76 116.5 l2 1.6" stroke="#2a1a10" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M48 52 Q60 46 72 52 L76 90 Q60 100 44 90z" fill="url(#${p}pl)" stroke="#1e1240" stroke-width="1.6"/>
    <path d="M50 60 q10 6 20 0 M49 70 q11 6 22 0 M48 80 q12 6 24 0" stroke="#d4b5ff" stroke-width="1.1" fill="none" opacity=".55"/>
    <path d="M44 88 q3 10 7 4 q3 10 6 4 q3 10 6 4 q3 10 6 4 q3 10 7 -4 L76 88 Q60 98 44 88 Z" fill="#7a4fd0" stroke="#1e1240" stroke-width="1"/>
    <path d="M42 30 q-10 -22 10 -24 q8 -10 18 0 q20 2 8 26 q6 6 -2 10 q-10 -14 -30 -2 q-8 -2 -4 -10z" fill="#3a1f6b"/>
    <ellipse cx="60" cy="36" rx="12" ry="14" fill="url(#${p}pe)" stroke="#5a3a2a" stroke-width="1.2"/>
    <path d="M44 22 q-8 -10 -2 -16 M76 22 q8 -10 2 -16 M60 14 q2 -12 10 -10" stroke="#3a1f6b" stroke-width="3" fill="none" stroke-linecap="round"/>
    <g class="b-oeil"><ellipse cx="55" cy="33" rx="2.6" ry="3" fill="#fff"/><ellipse cx="65" cy="33" rx="2.6" ry="3" fill="#fff"/><circle cx="55" cy="33.5" r="1.4" fill="#2a1040"/><circle cx="65" cy="33.5" r="1.4" fill="#2a1040"/></g>
    <path d="M51 28 l6 2 M69 28 l-6 2" stroke="#3a1f6b" stroke-width="1.6" stroke-linecap="round"/>
    <ellipse cx="60" cy="43" rx="4.4" ry="5" fill="#3a0f22"/><ellipse cx="60" cy="45" rx="2.6" ry="2" fill="#c0453a"/>
    <g class="b-onde" fill="none" stroke="#ffd34d" stroke-width="1.6" stroke-linecap="round"><path d="M36 40 q-6 4 0 8" opacity=".9"/><path d="M30 37 q-9 7 0 14" opacity=".6"/><path d="M84 40 q6 4 0 8" opacity=".9"/><path d="M90 37 q9 7 0 14" opacity=".6"/></g>
    <g class="b-volute" fill="#ffd34d" font-family="system-ui" font-weight="800" font-size="7"><text x="8" y="22">!</text><text x="104" y="20">?!</text><text x="100" y="92">!</text></g>`,

  troll: p => `
    <defs>
      <radialGradient id="${p}pe" cx="40%" cy="30%" r="80%"><stop offset="0" stop-color="#9fb98f"/><stop offset=".6" stop-color="#5b7a52"/><stop offset="1" stop-color="#2f4a2c"/></radialGradient>
      <linearGradient id="${p}py" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4c6fc0"/><stop offset="1" stop-color="#253d7a"/></linearGradient>
      <radialGradient id="${p}lu" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff7c8"/><stop offset="1" stop-color="#fff7c8" stop-opacity="0"/></radialGradient>
    </defs>
    <circle cx="100" cy="16" r="16" fill="url(#${p}lu)" opacity=".7"/><path d="M98 6 a10 10 0 1 0 9 15 a8 8 0 1 1 -9 -15z" fill="#f4e7a1"/>
    <ellipse cx="60" cy="124" rx="44" ry="5" fill="#000" opacity=".45"/>
    <path d="M34 108 q-2 -6 8 -6 q10 0 10 8 v10 q-9 4 -18 0z M68 110 q0 -8 10 -8 q10 0 8 6 v10 q-9 4 -18 0z" fill="url(#${p}py)" stroke="#16264d" stroke-width="1.4"/>
    <path d="M22 70 q0 -30 38 -32 q38 2 38 32 q2 30 -14 40 q-24 8 -48 0 q-16 -10 -14 -40z" fill="url(#${p}py)" stroke="#16264d" stroke-width="2"/>
    <path d="M30 72 q30 10 60 0 M32 84 q28 10 56 0 M36 96 q24 8 48 0" stroke="#7d9be0" stroke-width="1.2" fill="none" opacity=".5"/>
    <circle cx="60" cy="74" r="2" fill="#f2e6c8"/><circle cx="60" cy="86" r="2" fill="#f2e6c8"/>
    <g class="b-bras-g"><path d="M26 60 q-16 8 -16 28 q0 6 6 6 q6 -14 16 -22z" fill="url(#${p}pe)" stroke="#1f2a1f" stroke-width="1.6"/>
      <rect x="2" y="78" width="18" height="20" rx="4" fill="#f2e6c8" stroke="#6b5a3a" stroke-width="1.4"/><path d="M20 82 q7 4 0 11" stroke="#6b5a3a" stroke-width="2" fill="none"/><rect x="4" y="80" width="14" height="5" fill="#6b3a1c"/>
      <g class="b-volute" stroke="#c9b8e0" stroke-width="1.3" fill="none"><path d="M7 74 q3 -4 0 -8 q-3 -4 0 -8"/><path d="M13 74 q3 -4 0 -8"/></g></g>
    <g class="b-bras-d"><path d="M94 60 q16 8 16 28 q0 8 -8 8 q-4 -14 -14 -22z" fill="url(#${p}pe)" stroke="#1f2a1f" stroke-width="1.6"/></g>
    <ellipse cx="60" cy="42" rx="26" ry="22" fill="url(#${p}pe)" stroke="#1f2a1f" stroke-width="2"/>
    <path d="M34 36 Q40 0 76 12 Q92 18 104 34 L96 36 Q80 22 34 36z" fill="url(#${p}py)" stroke="#16264d" stroke-width="1.6"/>
    <circle cx="104" cy="36" r="5" fill="#f2f2f2" stroke="#c9c9c9"/>
    <path d="M44 40 q6 -6 12 0 M64 40 q6 -6 12 0" stroke="#1f2a1f" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <ellipse cx="50" cy="47" rx="6" ry="2.4" fill="#3d4f3b" opacity=".7"/><ellipse cx="70" cy="47" rx="6" ry="2.4" fill="#3d4f3b" opacity=".7"/>
    <g class="b-oeil"><ellipse cx="50" cy="43.5" rx="5" ry="3.6" fill="#ffefd0"/><ellipse cx="70" cy="43.5" rx="5" ry="3.6" fill="#ffefd0"/>
      <path d="M46 43 l3 1 M54 42 l-2 2 M66 43 l3 1 M74 42 l-2 2" stroke="#d04040" stroke-width=".7"/>
      <circle cx="50" cy="44" r="2" fill="#c0453a"/><circle cx="70" cy="44" r="2" fill="#c0453a"/></g>
    <ellipse cx="60" cy="51" rx="5" ry="3.4" fill="#4a6a44"/>
    <path d="M46 57 q14 8 28 0 q-2 4 -14 5 q-12 -1 -14 -5z" fill="#2a1414"/><path d="M50 57 l2 5 l3 -4 M66 57 l2 5 l3 -4" fill="#f2e6c8"/>
    <path d="M34 44 l-6 -4 l4 8 M86 44 l6 -4 l-4 8" fill="url(#${p}pe)" stroke="#1f2a1f" stroke-width="1.2"/>`,

  hydre: p => `
    <defs>
      <linearGradient id="${p}a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6fd6c8"/><stop offset=".55" stop-color="#2a8a8a"/><stop offset="1" stop-color="#134a52"/></linearGradient>
      <linearGradient id="${p}v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8f4c8"/><stop offset="1" stop-color="#8fc4a0"/></linearGradient>
    </defs>
    <ellipse cx="60" cy="124" rx="46" ry="5" fill="#000" opacity=".45"/>
    <path class="b-queue" d="M88 112 q22 0 26 -14 q-2 -6 -8 -2" stroke="url(#${p}a)" stroke-width="8" fill="none" stroke-linecap="round"/>
    <ellipse cx="60" cy="106" rx="40" ry="17" fill="url(#${p}a)" stroke="#0c2f33" stroke-width="2"/>
    <ellipse cx="60" cy="112" rx="26" ry="8" fill="url(#${p}v)" opacity=".7"/>
    <path d="M34 112 l-2 10 m10 -8 l-1 10 M78 114 l1 9 m8 -11 l2 10" stroke="#0c2f33" stroke-width="5" stroke-linecap="round"/>
    ${[[-1, 22, 44, 'a'], [0, 60, 26, 'b'], [1, 98, 44, 'c']].map(([s, x, y, k]) => `
    <g class="b-tete b-tete-${k}">
      <path d="M${60 + s * 18} 98 Q${60 + s * 26} ${y + 40} ${x} ${y + 8}" stroke="url(#${p}a)" stroke-width="13" fill="none" stroke-linecap="round"/>
      <path d="M${60 + s * 18} 98 Q${60 + s * 26} ${y + 40} ${x} ${y + 8}" stroke="url(#${p}v)" stroke-width="4" fill="none" stroke-linecap="round" opacity=".55"/>
      <path d="M${x - 14} ${y + 2} q2 -14 16 -14 q14 2 12 14 q-2 10 -14 10 q-12 0 -14 -10z" fill="url(#${p}a)" stroke="#0c2f33" stroke-width="1.8"/>
      <path d="M${x - 8} ${y - 10} l-3 -6 l6 3 M${x + 6} ${y - 10} l3 -6 l-6 3" fill="#e8d27a" stroke="#6a5a1a" stroke-width=".8"/>
      <g class="b-oeil"><ellipse cx="${x - 5}" cy="${y}" rx="2.8" ry="2.4" fill="#ffe14a"/><ellipse cx="${x + 5}" cy="${y}" rx="2.8" ry="2.4" fill="#ffe14a"/>
        <ellipse cx="${x - 5}" cy="${y}" rx=".8" ry="2" fill="#111"/><ellipse cx="${x + 5}" cy="${y}" rx=".8" ry="2" fill="#111"/></g>
      <path d="M${x - 8} ${y + 7} q8 4 16 0" stroke="#0c2f33" stroke-width="1.4" fill="none"/>
      <g class="b-badge"><circle cx="${x + 12}" cy="${y - 10}" r="6.5" fill="#e5383b" stroke="#fff" stroke-width="1.4"/>
        <text x="${x + 12}" y="${y - 7.5}" font-size="7" text-anchor="middle" fill="#fff" font-weight="800" font-family="system-ui">${k === 'b' ? '99+' : k === 'a' ? 3 : 12}</text></g>
    </g>`).join('')}
    <g class="b-onde" stroke="#ffd34d" stroke-width="1.3" fill="none" opacity=".8"><path d="M6 26 l4 -3 M6 30 l5 0 M6 34 l4 3"/><path d="M114 26 l-4 -3 M114 30 l-5 0 M114 34 l-4 3"/></g>`,

  necro: p => `
    <defs>
      <linearGradient id="${p}r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3550"/><stop offset=".7" stop-color="#16131f"/><stop offset="1" stop-color="#08070c" stop-opacity=".4"/></linearGradient>
      <radialGradient id="${p}g" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#b4ff8a"/><stop offset=".5" stop-color="#6aff4a" stop-opacity=".45"/><stop offset="1" stop-color="#6aff4a" stop-opacity="0"/></radialGradient>
      <radialGradient id="${p}os" cx="45%" cy="35%" r="70%"><stop offset="0" stop-color="#f2ecda"/><stop offset="1" stop-color="#a49c86"/></radialGradient>
    </defs>
    <ellipse cx="56" cy="125" rx="34" ry="4" fill="#6aff4a" opacity=".15"/>
    <path class="b-volute" d="M24 120 q-6 -10 2 -18 M82 118 q8 -8 2 -18" stroke="#9dff6a" stroke-width="1.4" fill="none" opacity=".5"/>
    <path d="M56 10 Q30 16 28 52 L18 120 l8 -4 6 6 6 -6 6 6 6 -6 6 6 6 -6 6 6 6 -6 8 4 L84 52 Q82 16 56 10z" fill="url(#${p}r)" stroke="#05050a" stroke-width="1.8"/>
    <path d="M56 10 Q74 14 80 44 Q68 30 56 30 Q44 30 32 44 Q38 14 56 10z" fill="#0b0a12"/>
    <path d="M34 56 L56 70 L78 56" stroke="#6aff4a" stroke-width="1" fill="none" opacity=".45"/>
    <path d="M38 38 Q56 24 74 38 L72 60 Q56 70 40 60z" fill="#04040a"/>
    <circle cx="56" cy="48" r="16" fill="url(#${p}g)" opacity=".35" class="b-lueur"/>
    <g class="b-oeil"><ellipse cx="49" cy="47" rx="3.2" ry="2.2" fill="#b4ff8a"/><ellipse cx="63" cy="47" rx="3.2" ry="2.2" fill="#b4ff8a"/></g>
    <g class="b-bras-g"><path d="M30 78 q-10 2 -16 -4" stroke="url(#${p}os)" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M14 74 l-5 -3 M14 74 l-6 1 M14 74 l-4 4" stroke="url(#${p}os)" stroke-width="2" stroke-linecap="round"/></g>
    <g class="b-bras-d"><path d="M82 78 q10 0 14 -6" stroke="url(#${p}os)" stroke-width="3" fill="none" stroke-linecap="round"/>
      <line x1="100" y1="24" x2="98" y2="122" stroke="#4a3a26" stroke-width="4" stroke-linecap="round"/>
      <circle cx="100" cy="18" r="15" fill="url(#${p}g)" class="b-lueur"/>
      <path d="M92 18 q0 -10 8 -10 q8 0 8 10 q0 5 -3 7 v4 h-10 v-4 q-3 -2 -3 -7z" fill="url(#${p}os)" stroke="#4a4232" stroke-width="1"/>
      <circle cx="97" cy="18" r="2" fill="#0b0a12"/><circle cx="103" cy="18" r="2" fill="#0b0a12"/><path d="M98 26 v2 M100 26 v2 M102 26 v2" stroke="#4a4232" stroke-width=".8"/></g>
    <g class="b-orbite">
      <g transform="translate(4 84)"><rect width="26" height="16" rx="5" fill="#d8d4e8" stroke="#6a6680" stroke-width="1.2"/><path d="M6 16 l-2 6 l7 -6" fill="#d8d4e8" stroke="#6a6680" stroke-width="1.2"/>
        <circle cx="8" cy="8" r="1.7" fill="#6a6680"/><circle cx="13" cy="8" r="1.7" fill="#6a6680"/><circle cx="18" cy="8" r="1.7" fill="#6a6680"/><path d="M-2 -2 l30 20" stroke="#c0453a" stroke-width="2.6" stroke-linecap="round"/></g>
      <g transform="translate(86 92)" opacity=".75"><rect width="22" height="13" rx="4" fill="#d8d4e8" stroke="#6a6680" stroke-width="1"/><text x="11" y="10" font-size="8" text-anchor="middle" fill="#6a6680" font-family="system-ui" font-weight="700">vu</text></g></g>`,

  gargouille: p => `
    <defs>
      <radialGradient id="${p}a" cx="40%" cy="30%" r="80%"><stop offset="0" stop-color="#c9c4b8"/><stop offset=".6" stop-color="#7a766c"/><stop offset="1" stop-color="#45423b"/></radialGradient>
      <linearGradient id="${p}w" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9a958a"/><stop offset="1" stop-color="#3e3b35"/></linearGradient>
      <radialGradient id="${p}o" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffd27a"/><stop offset="1" stop-color="#ff7a1c" stop-opacity="0"/></radialGradient>
    </defs>
    <path d="M10 110 h100 l-4 14 h-92z" fill="#4a463f" stroke="#2a2824" stroke-width="2"/><path d="M14 112 h92" stroke="#77736a" stroke-width="2"/>
    <path d="M24 118 h10 M44 116 h14 M72 119 h18" stroke="#2a2824" stroke-width="1"/>
    <g class="b-aile-g"><path d="M40 60 Q8 20 2 50 Q2 72 10 86 Q14 76 22 82 Q24 70 32 76 Q32 68 40 72z" fill="url(#${p}w)" stroke="#2a2824" stroke-width="1.8"/>
      <path d="M38 62 Q20 40 6 52 M36 66 Q20 56 10 72 M36 70 Q26 66 20 80" stroke="#2a2824" stroke-width="1.2" fill="none"/></g>
    <g class="b-aile-d"><path d="M80 60 Q112 20 118 50 Q118 72 110 86 Q106 76 98 82 Q96 70 88 76 Q88 68 80 72z" fill="url(#${p}w)" stroke="#2a2824" stroke-width="1.8"/>
      <path d="M82 62 Q100 40 114 52 M84 66 Q100 56 110 72 M84 70 Q94 66 100 80" stroke="#2a2824" stroke-width="1.2" fill="none"/></g>
    <path d="M32 110 Q26 68 60 62 Q94 68 88 110z" fill="url(#${p}a)" stroke="#2a2824" stroke-width="2"/>
    <path d="M40 110 q-6 -8 -2 -16 q8 -2 10 6 l-2 10z M80 110 q6 -8 2 -16 q-8 -2 -10 6 l2 10z" fill="url(#${p}a)" stroke="#2a2824" stroke-width="1.6"/>
    <path d="M36 110 l-3 3 m6 -3 l0 4 m4 -4 l3 3 M76 110 l-3 3 m6 -3 l0 4 m4 -4 l3 3" stroke="#2a2824" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M60 66 l-4 10 l6 6 l-4 12 M70 84 l6 8 l-2 8 M48 80 l-4 6" stroke="#2a2824" stroke-width="1.2" fill="none"/>
    <ellipse cx="60" cy="42" rx="22" ry="20" fill="url(#${p}a)" stroke="#2a2824" stroke-width="2"/>
    <path d="M42 30 l-10 -20 l16 12 M78 30 l10 -20 l-16 12" fill="#8a857a" stroke="#2a2824" stroke-width="1.6"/>
    <path d="M44 38 l10 4 M76 38 l-10 4" stroke="#2a2824" stroke-width="3" stroke-linecap="round"/>
    <circle cx="51" cy="45" r="7" fill="url(#${p}o)" class="b-lueur"/><circle cx="69" cy="45" r="7" fill="url(#${p}o)" class="b-lueur"/>
    <g class="b-oeil"><circle cx="51" cy="45" r="2.6" fill="#ff8c3a"/><circle cx="69" cy="45" r="2.6" fill="#ff8c3a"/></g>
    <path d="M54 50 q6 3 12 0 l2 6 q-8 6 -16 0z" fill="#3a3730"/><path d="M53 54 l2 3 l2 -3 M63 54 l2 3 l2 -3" fill="#e8e2cf"/>
    <path d="M40 28 q20 -10 40 0" stroke="#e2ddd2" stroke-width="2" fill="none" opacity=".45"/>`,

  mimique: p => `
    <defs>
      <linearGradient id="${p}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a6672a"/><stop offset="1" stop-color="#5a3412"/></linearGradient>
      <linearGradient id="${p}o" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe08a"/><stop offset="1" stop-color="#b8861c"/></linearGradient>
      <radialGradient id="${p}g" cx="50%" cy="55%" r="55%"><stop offset="0" stop-color="#ff5a3c"/><stop offset="1" stop-color="#3a0a0a"/></radialGradient>
    </defs>
    <ellipse cx="60" cy="124" rx="48" ry="5" fill="#000" opacity=".45"/>
    <ellipse cx="22" cy="118" rx="12" ry="5" fill="#c9a2e0"/><ellipse cx="22" cy="115" rx="9" ry="3" fill="#e6cdf2"/>
    <path d="M16 64 h88 v50 q0 8 -8 8 h-72 q-8 0 -8 -8z" fill="url(#${p}b)" stroke="#2e1a08" stroke-width="2"/>
    <path d="M16 78 h88 M16 98 h88" stroke="#2e1a08" stroke-width="1" opacity=".5"/>
    <rect x="16" y="64" width="8" height="58" fill="url(#${p}o)" stroke="#6a4a10" stroke-width="1"/><rect x="96" y="64" width="8" height="58" fill="url(#${p}o)" stroke="#6a4a10" stroke-width="1"/>
    <path d="M24 64 h72 l-6 16 q-30 10 -60 0z" fill="url(#${p}g)"/>
    <path d="M28 64 l6 10 l6 -10 l6 10 l6 -10 l6 10 l6 -10 l6 10 l6 -10 l6 10 l6 -10" fill="#fff6e0" stroke="#c9b28a" stroke-width=".8"/>
    <path class="b-langue" d="M60 76 q-6 16 6 24 q8 4 6 -6 q-2 -10 -12 -18z" fill="#e0556e" stroke="#8a2236" stroke-width="1.2"/>
    <g class="b-couvercle">
      <path d="M14 64 q0 -30 46 -32 q46 2 46 32 h-92z" fill="url(#${p}b)" stroke="#2e1a08" stroke-width="2"/>
      <path d="M14 60 h92 v6 h-92z" fill="url(#${p}o)" stroke="#6a4a10" stroke-width="1"/>
      <path d="M30 60 l5 -8 l5 8 l5 -8 l5 8 l5 -8 l5 8 l5 -8 l5 8 l5 -8 l5 8 l5 -8 l5 8" fill="#fff6e0" stroke="#c9b28a" stroke-width=".8" transform="translate(0 6) scale(1 -1) translate(0 -120)"/>
      <path d="M58 32 v28 M62 32 v28" stroke="url(#${p}o)" stroke-width="3"/>
      <g class="b-oeil"><ellipse cx="42" cy="46" rx="6" ry="5" fill="#ffe14a" stroke="#6a4a10"/><ellipse cx="78" cy="46" rx="6" ry="5" fill="#ffe14a" stroke="#6a4a10"/>
        <ellipse cx="42" cy="46" rx="1.6" ry="4" fill="#1a0a0a"/><ellipse cx="78" cy="46" rx="1.6" ry="4" fill="#1a0a0a"/></g>
      <path d="M34 38 l12 4 M86 38 l-12 4" stroke="#2e1a08" stroke-width="2.4" stroke-linecap="round"/>
    </g>
    <rect x="54" y="66" width="12" height="12" rx="2" fill="url(#${p}o)" stroke="#6a4a10" stroke-width="1"/><circle cx="60" cy="71" r="2" fill="#2e1a08"/><path d="M60 72 v3" stroke="#2e1a08" stroke-width="1.6"/>
    <g class="b-volute"><circle cx="102" cy="118" r="4" fill="url(#${p}o)" stroke="#8a6a12"/><circle cx="110" cy="120" r="3.4" fill="url(#${p}o)" stroke="#8a6a12"/><circle cx="106" cy="113" r="3" fill="url(#${p}o)" stroke="#8a6a12"/></g>`,

  dragon: p => `
    <defs>
      <linearGradient id="${p}a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8fa6d8"/><stop offset=".55" stop-color="#4e6296"/><stop offset="1" stop-color="#26304e"/></linearGradient>
      <linearGradient id="${p}v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8dcb4"/><stop offset="1" stop-color="#a99a6c"/></linearGradient>
      <linearGradient id="${p}w" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6a7fb8"/><stop offset="1" stop-color="#2e3a62"/></linearGradient>
    </defs>
    <ellipse cx="62" cy="124" rx="56" ry="5" fill="#000" opacity=".45"/>
    <!-- dragon endormi, enroulé sur son trésor : tête posée sur les pattes, aile repliée, queue qui fait le tour -->
    ${[[30, 121], [40, 123], [96, 121], [104, 119], [86, 123]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="5" ry="2.4" fill="#e2b23a" stroke="#8a6a12" stroke-width=".6"/>`).join('')}
    <path d="M30 120 C18 94 34 66 64 64 C92 62 112 82 108 110 C107 118 100 121 92 121 Z" fill="url(#${p}a)" stroke="#161c30" stroke-width="2"/>
    <path d="M36 72 C50 62 76 58 96 70 C104 76 108 86 108 96" stroke="#a8b8e6" stroke-width="1.6" fill="none" opacity=".35"/>
    ${[[42, 70], [52, 65], [63, 63], [74, 63], [85, 66], [95, 72], [102, 80]].map(([x, y], i) => `<path d="M${x - 4} ${y + 2} L${x} ${y - 7 - (i % 2) * 2} L${x + 4} ${y + 2} Z" fill="#3a4874" stroke="#161c30" stroke-width=".9"/>`).join('')}
    <g class="b-aile-d"><path d="M56 74 C64 48 88 38 108 44 C100 50 104 58 98 62 C92 60 90 68 84 70 C78 68 72 74 68 76 C64 74 60 76 56 74 Z" fill="url(#${p}w)" stroke="#161c30" stroke-width="1.6"/>
      <path d="M60 72 C72 56 90 48 106 46 M68 74 C76 64 88 58 98 60 M76 74 C80 68 86 66 90 66" stroke="#a8b8e6" stroke-width="1" fill="none" opacity=".55"/></g>
    <ellipse cx="90" cy="104" rx="15" ry="13" fill="url(#${p}a)" stroke="#161c30" stroke-width="1.6"/><path d="M80 116 l-2 5 M86 117 l-1 5 M92 117 l0 5" stroke="#e8dcb4" stroke-width="2" stroke-linecap="round"/>
    <path class="b-queue" d="M104 112 Q118 116 110 123 Q86 129 52 125" stroke="url(#${p}a)" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M54 125 l-10 -6 l3 6 l-3 6 z" fill="#3a4874" stroke="#161c30" stroke-width="1"/>
    <path d="M40 116 C46 104 62 98 78 104" stroke="url(#${p}v)" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M50 106 l2 7 M58 102 l2 7 M66 101 l1 7 M73 102 l0 7" stroke="#8a7a4c" stroke-width="1"/>
    <path d="M50 86 C36 86 28 94 30 106" stroke="url(#${p}a)" stroke-width="17" fill="none" stroke-linecap="round"/>
    <ellipse cx="30" cy="117" rx="9" ry="5" fill="url(#${p}a)" stroke="#161c30" stroke-width="1.4"/><ellipse cx="46" cy="118" rx="9" ry="5" fill="url(#${p}a)" stroke="#161c30" stroke-width="1.4"/>
    <path d="M22 120 l-2 3 M27 121 l-1 3 M38 121 l-1 3 M43 122 l-1 3" stroke="#e8dcb4" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M38 92 C46 82 56 78 64 80 C56 84 50 88 46 96 Z M34 92 C38 82 44 76 50 76 C44 80 40 86 40 94 Z" fill="#e8dcb4" stroke="#6a5a2a" stroke-width="1"/>
    <path d="M4 106 C4 96 14 90 28 91 C42 92 50 100 48 108 C46 115 36 117 22 116 C12 115 4 112 4 106 Z" fill="url(#${p}a)" stroke="#161c30" stroke-width="2"/>
    <path d="M8 108 C18 112 34 112 46 108" stroke="#161c30" stroke-width="1.4" fill="none"/><path d="M14 110 l1.4 4 l1.6 -3.6" fill="#fff6d8" stroke="#6a5a2a" stroke-width=".5"/>
    <ellipse cx="9" cy="102" rx="1.4" ry="1" fill="#161c30"/><ellipse cx="13" cy="101" rx="1.2" ry=".9" fill="#161c30"/>
    <path d="M22 96 C26 92 34 92 38 96" stroke="#161c30" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <g class="b-oeil"><path d="M25 100 q5 3 10 0" stroke="#ffd27a" stroke-width="2.2" fill="none" stroke-linecap="round"/></g>
    <g class="b-zz" fill="#c9d4f2" font-family="Georgia" font-weight="700"><text x="14" y="84" font-size="11">z</text><text x="22" y="72" font-size="9">z</text><text x="28" y="62" font-size="7">z</text></g>
    <g class="b-volute" fill="#b8c4e0" opacity=".6"><ellipse cx="2" cy="96" rx="4" ry="2.6"/><ellipse cx="5" cy="90" rx="2.6" ry="1.8"/><ellipse cx="2" cy="85" rx="1.6" ry="1.2"/></g>`,

  archidemon: p => `
    <defs>
      <radialGradient id="${p}pe" cx="45%" cy="30%" r="75%"><stop offset="0" stop-color="#e2574a"/><stop offset=".6" stop-color="#9a1f1a"/><stop offset="1" stop-color="#4a0a0a"/></radialGradient>
      <linearGradient id="${p}w" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5a1414"/><stop offset="1" stop-color="#1a0606"/></linearGradient>
      <radialGradient id="${p}f" cx="50%" cy="100%" r="80%"><stop offset="0" stop-color="#ffb347"/><stop offset=".5" stop-color="#ff4a1c" stop-opacity=".55"/><stop offset="1" stop-color="#ff4a1c" stop-opacity="0"/></radialGradient>
      <linearGradient id="${p}o" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe08a"/><stop offset="1" stop-color="#a97b16"/></linearGradient>
    </defs>
    <ellipse cx="60" cy="112" rx="58" ry="22" fill="url(#${p}f)" class="b-lueur"/>
    <ellipse cx="60" cy="124" rx="40" ry="5" fill="#000" opacity=".5"/>
    <g class="b-aile-g"><path d="M42 60 Q10 20 0 30 Q10 42 2 52 Q14 52 8 66 Q22 62 20 78 Q34 70 42 76z" fill="url(#${p}w)" stroke="#0a0202" stroke-width="1.6"/>
      <path d="M40 62 L4 32 M40 66 L6 54 M40 70 L12 70" stroke="#7a2020" stroke-width="1.2"/></g>
    <g class="b-aile-d"><path d="M78 60 Q110 20 120 30 Q110 42 118 52 Q106 52 112 66 Q98 62 100 78 Q86 70 78 76z" fill="url(#${p}w)" stroke="#0a0202" stroke-width="1.6"/>
      <path d="M80 62 L116 32 M80 66 L114 54 M80 70 L108 70" stroke="#7a2020" stroke-width="1.2"/></g>
    <path d="M38 64 Q60 54 82 64 L88 122 H32z" fill="url(#${p}w)" stroke="#0a0202" stroke-width="2"/>
    <path d="M46 66 Q60 60 74 66 L78 120 H42z" fill="#2a0808"/>
    <path d="M54 70 v48 M66 70 v48" stroke="url(#${p}o)" stroke-width="1.5" opacity=".7"/>
    <path d="M40 64 q20 10 40 0 l-2 8 q-18 8 -36 0z" fill="url(#${p}o)" stroke="#6a4a10" stroke-width="1"/>
    <g class="b-bras-g"><path d="M38 66 q-14 10 -12 30" stroke="url(#${p}pe)" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M26 96 l-3 6 M26 96 l0 7 M26 96 l3 6" stroke="#1a0606" stroke-width="2" stroke-linecap="round"/></g>
    <g class="b-bras-d"><path d="M82 66 q14 8 14 24" stroke="url(#${p}pe)" stroke-width="7" fill="none" stroke-linecap="round"/>
      <g transform="translate(88 88) rotate(12)"><rect width="22" height="28" rx="2" fill="#efe1bd" stroke="#8a7646" stroke-width="1"/><path d="M4 7 h14 M4 12 h12 M4 17 h14 M4 22 h9" stroke="#8a7646" stroke-width="1"/>
        <text x="11" y="5" font-size="3.4" text-anchor="middle" fill="#8a2020" font-family="Georgia" font-weight="700">EXCUSES</text></g></g>
    <ellipse cx="60" cy="44" rx="17" ry="19" fill="url(#${p}pe)" stroke="#2a0606" stroke-width="2"/>
    <path d="M44 34 Q30 18 34 2 Q40 18 50 26z M76 34 Q90 18 86 2 Q80 18 70 26z" fill="#2a1a10" stroke="#0a0202" stroke-width="1.2"/>
    <path d="M44 30 l4 -10 l5 6 l7 -10 l7 10 l5 -6 l4 10 q-16 -4 -32 0z" fill="url(#${p}o)" stroke="#6a4a10" stroke-width="1"/>
    <circle cx="60" cy="22" r="2.2" fill="#ff4a1c"/>
    <path d="M47 40 l9 3 M73 40 l-9 3" stroke="#2a0606" stroke-width="2.6" stroke-linecap="round"/>
    <g class="b-oeil"><ellipse cx="52" cy="45" rx="3.4" ry="2.4" fill="#ffd34d"/><ellipse cx="68" cy="45" rx="3.4" ry="2.4" fill="#ffd34d"/><circle cx="52" cy="45" r="1" fill="#2a0606"/><circle cx="68" cy="45" r="1" fill="#2a0606"/></g>
    <path d="M51 54 q9 5 18 0 q-2 6 -9 6 q-7 0 -9 -6z" fill="#2a0606"/><path d="M54 55 l1.5 3 l1.5 -3 M63 55 l1.5 3 l1.5 -3" fill="#fff6d8"/>
    <path d="M50 60 q10 8 20 0 l-4 10 q-6 3 -12 0z" fill="#2a1a10"/>
    <g class="b-volute" fill="#ffb347"><circle cx="20" cy="110" r="1.6"/><circle cx="100" cy="106" r="1.4"/><circle cx="32" cy="98" r="1.1"/><circle cx="90" cy="96" r="1.2"/></g>`,

  procrastination: p => `
    <defs>
      <linearGradient id="${p}o" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe08a"/><stop offset="1" stop-color="#a97b16"/></linearGradient>
      <linearGradient id="${p}v" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#cdb8ff" stop-opacity=".55"/><stop offset=".5" stop-color="#f3eaff" stop-opacity=".25"/><stop offset="1" stop-color="#9a7ae0" stop-opacity=".55"/></linearGradient>
      <linearGradient id="${p}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6dc8a"/><stop offset="1" stop-color="#d2a440"/></linearGradient>
      <radialGradient id="${p}h" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#b68cff" stop-opacity=".45"/><stop offset="1" stop-color="#b68cff" stop-opacity="0"/></radialGradient>
    </defs>
    <circle cx="60" cy="64" r="58" fill="url(#${p}h)"/>
    <ellipse cx="60" cy="124" rx="34" ry="4" fill="#000" opacity=".4"/>
    <rect x="28" y="6" width="64" height="9" rx="3" fill="url(#${p}o)" stroke="#6a4a10" stroke-width="1.2"/><rect x="28" y="112" width="64" height="9" rx="3" fill="url(#${p}o)" stroke="#6a4a10" stroke-width="1.2"/>
    <path d="M34 15 h52 q0 30 -22 46 q22 16 22 51 h-52 q0 -35 22 -51 q-22 -16 -22 -46z" fill="url(#${p}v)" stroke="#e8dcff" stroke-width="1.4"/>
    <path d="M40 18 h40 q-2 18 -20 32 q-18 -14 -20 -32z" fill="#5a3a96" opacity=".55"/>
    <path d="M40 112 q2 -22 20 -30 q18 8 20 30z" fill="url(#${p}s)" stroke="#a97b16" stroke-width=".8"/>
    <path class="b-sable" d="M60 52 v34" stroke="#f6dc8a" stroke-width="1.8" stroke-dasharray="2 4"/>
    <g class="b-oeil"><path d="M48 32 q5 4 10 0" stroke="#2a1648" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M62 32 q5 4 10 0" stroke="#2a1648" stroke-width="2.4" fill="none" stroke-linecap="round"/></g>
    <path d="M52 41 q8 -3 16 0" stroke="#2a1648" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <g class="b-bras-g"><path d="M34 60 q-16 -2 -22 10 q-2 6 4 6" stroke="#9a7ae0" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="12" cy="76" r="4.5" fill="#9a7ae0"/></g>
    <g class="b-bras-d"><path d="M86 60 q16 -4 22 -16" stroke="#9a7ae0" stroke-width="5" fill="none" stroke-linecap="round"/>
      <g transform="translate(108 38)"><circle r="9" fill="#f6ecd2" stroke="#6a4a10" stroke-width="1.4"/><path d="M0 0 v-6 M0 0 l4 2" stroke="#2a1648" stroke-width="1.6" stroke-linecap="round"/><text y="-11" font-size="6" text-anchor="middle" fill="#cdb8ff" font-family="Georgia">5 min…</text></g></g>
    <g class="b-volute" fill="#cdb8ff" font-family="Georgia" font-size="7" opacity=".8"><text x="6" y="30">demain</text><text x="119" y="94" text-anchor="end">plus tard</text></g>`,

  dissipation: p => `
    <defs>
      <radialGradient id="${p}a" cx="45%" cy="35%" r="70%"><stop offset="0" stop-color="#b8ffe8"/><stop offset=".5" stop-color="#3ec9a4" stop-opacity=".85"/><stop offset="1" stop-color="#147a68" stop-opacity=".2"/></radialGradient>
      <linearGradient id="${p}o" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe08a"/><stop offset="1" stop-color="#b8861c"/></linearGradient>
    </defs>
    <ellipse cx="60" cy="124" rx="26" ry="3.5" fill="#3ec9a4" opacity=".2"/>
    <!-- tourbillon qui aspire tout (sous le corps), traînées de vitesse derrière les pièces, bulles de notifications -->
    <g class="b-volute" fill="none" stroke="#7fe8c8" stroke-linecap="round"><ellipse cx="60" cy="118" rx="30" ry="6" stroke-width="2" opacity=".35"/><ellipse cx="60" cy="116" rx="20" ry="4.4" stroke-width="2" opacity=".5"/><ellipse cx="60" cy="114" rx="10" ry="2.8" stroke-width="2" opacity=".7"/>
      <path d="M60 112 q-14 -6 -6 -14 q10 -8 -2 -16" stroke-width="2.4" opacity=".6"/></g>
    <g class="b-orbite" stroke="#7fe8c8" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".55"><path d="M22 36 q-6 8 -4 16"/><path d="M110 22 q8 4 8 14"/><path d="M114 76 q2 10 -4 16"/><path d="M4 86 q-2 10 4 16"/><path d="M76 116 q10 2 18 -4"/></g>
    <g class="b-orbite"><g transform="translate(100 104)"><circle r="7" fill="#ff5a7a" stroke="#fff" stroke-width="1.2"/><path d="M-2.6 2 h5.2 l-1 -1.4 v-2.4 a1.6 1.6 0 0 0 -3.2 0 v2.4 z M-.8 3 h1.6" fill="#fff" stroke="#fff" stroke-width=".6"/></g>
      <g transform="translate(14 64)"><circle r="6.4" fill="#5ab0ff" stroke="#fff" stroke-width="1.2"/><path d="M0 2.6 C-4 -0.4 -3 -3.4 -1.2 -3.2 Q0 -3 0 -1.6 Q0 -3 1.2 -3.2 C3 -3.4 4 -.4 0 2.6 Z" fill="#fff"/></g></g>
    <path d="M60 104 q-26 -2 -30 -24 q-4 -18 8 -30 q-6 -16 8 -26 q14 -8 26 2 q16 -4 24 10 q14 10 6 28 q8 18 -6 30 q-12 10 -36 10z" fill="url(#${p}a)" stroke="#7fe8c8" stroke-width="1.2"/>
    <path d="M40 40 q4 -14 18 -14" stroke="#e8fff8" stroke-width="2.4" fill="none" opacity=".6" stroke-linecap="round"/>
    <path d="M46 62 q14 -10 28 0 q-6 6 -14 6 q-8 0 -14 -6z" fill="#0f4a40" opacity=".55"/>
    <g class="b-oeil"><ellipse cx="50" cy="52" rx="4" ry="5" fill="#0f3a34"/><ellipse cx="70" cy="52" rx="4" ry="5" fill="#0f3a34"/><circle cx="51" cy="50.5" r="1.4" fill="#e8fff8"/><circle cx="71" cy="50.5" r="1.4" fill="#e8fff8"/></g>
    <path d="M53 72 q7 5 14 0" stroke="#0f3a34" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <g class="b-orbite">${[[14, 40], [104, 30], [108, 84], [10, 92], [86, 110], [30, 16]].map(([x, y], i) => `
      <g transform="translate(${x} ${y})"><circle r="6" fill="url(#${p}o)" stroke="#7a5a10" stroke-width="1"/><circle r="3.6" fill="none" stroke="#7a5a10" stroke-width=".8"/>
        <text y="2.4" font-size="5.5" text-anchor="middle" fill="#7a5a10" font-weight="800" font-family="system-ui">${i % 2 ? '€' : '$'}</text></g>`).join('')}</g>`,

  oubli: p => `
    <defs>
      <linearGradient id="${p}v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".95"/><stop offset=".6" stop-color="#dfe3f2" stop-opacity=".7"/><stop offset="1" stop-color="#b9c0dc" stop-opacity=".05"/></linearGradient>
      <radialGradient id="${p}h" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="#ffffff" stop-opacity=".18"/><stop offset=".7" stop-color="#ffffff" stop-opacity=".05"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
    </defs>
    <circle cx="60" cy="54" r="56" fill="url(#${p}h)"/>
    <path d="M60 8 Q86 12 90 46 L98 118 q-6 -4 -10 2 q-6 -6 -10 0 q-6 -6 -10 0 q-6 -6 -8 0 q-4 -6 -10 0 q-4 -6 -10 0 q-4 -6 -10 0 q-4 -6 -8 -2 L30 46 Q34 12 60 8z" fill="url(#${p}v)" stroke="#e8ecf8" stroke-width="1"/>
    <ellipse cx="60" cy="40" rx="15" ry="18" fill="#f4f5fb" stroke="#c8cde0" stroke-width="1"/>
    <path d="M45 34 q15 -14 30 0" stroke="#c8cde0" stroke-width="1" fill="none"/>
    <g class="b-oeil"><path d="M51 41 q4 2 8 0 M61 41 q4 2 8 0" stroke="#8a90aa" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>
    <path d="M56 50 q4 2 8 0" stroke="#a0a6c0" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <!-- ce que l'Oubli efface : le bas du drap part en pixels, des souvenirs (pages, photo) s'envolent en pâlissant -->
    ${[[34, 112, 4, .5], [28, 104, 3, .35], [22, 96, 2.4, .25], [40, 122, 3.4, .45], [90, 106, 3.6, .45], [98, 98, 2.6, .3], [104, 90, 2, .2], [82, 122, 3, .4], [60, 126, 2.4, .3]].map(([x, y, s, o]) => `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="#e8ecf8" opacity="${o}"/>`).join('')}
    <g class="b-volute"><g transform="translate(14 84) rotate(-14)" opacity=".7"><rect width="14" height="17" rx="1.2" fill="#f4f1e6" stroke="#a0a6c0" stroke-width=".8"/><path d="M3 5 h8 M3 8 h7 M3 11 h5" stroke="#8a90aa" stroke-width=".8"/></g>
      <g transform="translate(6 104) rotate(10)" opacity=".4"><rect width="13" height="11" rx="1" fill="#fff" stroke="#a0a6c0" stroke-width=".8"/><rect x="2" y="2" width="9" height="6" fill="#b9c8e8"/><circle cx="5" cy="5" r="1.4" fill="#f2c94c"/></g>
      <g transform="translate(22 20) rotate(-24)" opacity=".25"><rect width="11" height="13" rx="1" fill="#f4f1e6" stroke="#a0a6c0" stroke-width=".8"/><path d="M2 4 h7 M2 7 h6" stroke="#8a90aa" stroke-width=".8"/></g></g>
    <path d="M78 28 q6 6 4 14" stroke="#ffffff" stroke-width="5" fill="none" opacity=".55" stroke-linecap="round"/>
    ${[[96, 46], [92, 50], [99, 52], [94, 56]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1" fill="#f2a3b8" opacity=".8"/>`).join('')}
    <g class="b-bras-d"><path d="M86 66 q14 -6 18 -20" stroke="#e8ecf8" stroke-width="5" fill="none" stroke-linecap="round"/>
      <g transform="translate(100 32) rotate(-25)"><rect width="18" height="10" rx="2" fill="#f2a3b8" stroke="#b0607a" stroke-width="1"/><rect width="7" height="10" rx="2" fill="#7fa8e0" stroke="#4a6aa0" stroke-width="1"/></g></g>
    <g class="b-volute" font-family="Georgia" font-weight="700" fill="#6a7090">
      <text x="8" y="70" font-size="9" opacity=".8">L</text><text x="16" y="60" font-size="7" opacity=".55">u</text><text x="10" y="48" font-size="6" opacity=".35">n</text><text x="20" y="40" font-size="5" opacity=".2">d</text></g>
    <g transform="translate(90 92)"><g class="b-aile-g"><path d="M0 0 q-8 -8 -12 0 q4 6 12 0 q8 -8 12 0 q-4 6 -12 0z" fill="#d8dcf0" opacity=".8"/><path d="M0 -3 v6" stroke="#8a90aa" stroke-width="1"/></g></g>`,

  fatigue: p => `
    <defs>
      <radialGradient id="${p}a" cx="45%" cy="30%" r="75%"><stop offset="0" stop-color="#c7cfe6"/><stop offset=".6" stop-color="#7c86a8"/><stop offset="1" stop-color="#4a5272"/></radialGradient>
    </defs>
    <ellipse cx="60" cy="124" rx="46" ry="5" fill="#000" opacity=".35"/>
    <g class="b-volute" stroke="#9fb0d8" stroke-width="1.6" stroke-linecap="round" opacity=".7"><path d="M30 102 l-2 8"/><path d="M48 106 l-2 8"/><path d="M70 104 l-2 8"/><path d="M90 100 l-2 8"/></g>
    <path d="M20 84 q-16 -2 -14 -18 q2 -16 18 -14 q0 -22 22 -24 q12 -16 32 -6 q16 -6 26 8 q16 2 14 20 q10 10 0 22 q-6 12 -22 10 q-10 8 -28 4 q-18 6 -30 -2 q-14 4 -18 0z" fill="url(#${p}a)" stroke="#3a4060" stroke-width="1.6"/>
    <path d="M30 46 q8 -14 24 -14 M78 36 q10 0 16 8" stroke="#e8ecf8" stroke-width="2.4" fill="none" opacity=".5" stroke-linecap="round"/>
    <path d="M40 58 q8 6 16 0 M66 58 q8 6 16 0" stroke="#2a3050" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <path d="M40 56 q8 -4 16 0 M66 56 q8 -4 16 0" stroke="#5a6288" stroke-width="3" fill="none" stroke-linecap="round" class="b-oeil"/>
    <ellipse cx="44" cy="64" rx="5" ry="2" fill="#5a6288" opacity=".5"/><ellipse cx="78" cy="64" rx="5" ry="2" fill="#5a6288" opacity=".5"/>
    <ellipse cx="61" cy="72" rx="7" ry="5" fill="#2a3050"/><ellipse cx="61" cy="74" rx="4" ry="2.4" fill="#4a5272"/>
    <g class="b-zz" fill="#dfe6fa" font-family="Georgia" font-weight="700"><text x="92" y="30" font-size="12">Z</text><text x="102" y="20" font-size="9">z</text><text x="109" y="12" font-size="7">z</text></g>`,

  doute: p => `
    <defs>
      <radialGradient id="${p}a" cx="50%" cy="30%" r="80%"><stop offset="0" stop-color="#3a3044"/><stop offset=".7" stop-color="#16121c"/><stop offset="1" stop-color="#0a080e"/></radialGradient>
      <radialGradient id="${p}e" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ff8a8a"/><stop offset=".6" stop-color="#c0303a"/><stop offset="1" stop-color="#4a0a10"/></radialGradient>
    </defs>
    <ellipse cx="60" cy="124" rx="40" ry="5" fill="#000" opacity=".5"/>
    <path d="M60 8 Q96 12 100 60 L106 116 l-6 6 l-6 -5 l-7 6 l-6 -6 l-7 6 l-6 -5 l-6 5 l-7 -6 l-6 6 l-7 -6 l-6 5 l-6 -6 L20 60 Q24 12 60 8z" fill="url(#${p}a)" stroke="#05040a" stroke-width="1.8"/>
    <path d="M60 9 Q93 13 98 60 L104 114 M60 9 Q27 13 22 60 L16 114" stroke="#7a6a96" stroke-width="1.4" fill="none" opacity=".55"/>
    <path d="M60 8 Q80 14 88 44 Q74 26 60 26 Q46 26 32 44 Q40 14 60 8z" fill="#060509"/>
    <!-- mains osseuses qui serrent le manteau, brume au ras du sol -->
    ${[-1, 1].map(sg => { const x = 60 + sg * 36; return `<g transform="translate(${x} 74) scale(${sg} 1)"><path d="M0 0 C-6 -2 -10 2 -10 8 L-12 16 M-6 4 L-8 15 M-2 5 L-3 15 M2 4 L2 13" stroke="#d8cfe6" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M-12 16 l-1 3 M-8 15 l-1 3 M-3 15 l0 3 M2 13 l1 3" stroke="#ff5a5a" stroke-width="1.2" stroke-linecap="round"/></g>`; }).join('')}
    <g class="b-volute" fill="#a99bc4">${[[24, 122, 16], [52, 125, 20], [84, 123, 18], [104, 120, 10]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="3.6" opacity=".22"/>`).join('')}</g>
    ${[[50, 44, 3.6, 0], [70, 44, 3.6, .4], [40, 64, 2.8, .9], [80, 62, 3, 1.6], [56, 78, 2.6, 2.2], [72, 86, 2.2, .7], [36, 92, 2.4, 1.3], [88, 96, 2.6, 2.6], [60, 100, 2, 1.9]].map(([x, y, r, d]) => `
      <g class="b-oeil" style="animation-delay:${d}s"><ellipse cx="${x}" cy="${y}" rx="${r + 1.2}" ry="${r}" fill="#f2e6d6"/><circle cx="${x}" cy="${y}" r="${r * .62}" fill="url(#${p}e)"/><circle cx="${x}" cy="${y}" r="${r * .25}" fill="#1a0408"/></g>`).join('')}
    <g class="b-volute" fill="#a99bc4" font-family="Georgia" font-weight="700"><text x="6" y="34" font-size="16">?</text><text x="102" y="26" font-size="12">?</text><text x="104" y="78" font-size="10">?</text><text x="8" y="80" font-size="9">?</text></g>`,

  tentation: p => `
    <defs>
      <linearGradient id="${p}r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2558a"/><stop offset=".7" stop-color="#8a1e52"/><stop offset="1" stop-color="#4a0a2a" stop-opacity=".2"/></linearGradient>
      <radialGradient id="${p}pe" cx="45%" cy="35%" r="70%"><stop offset="0" stop-color="#f6d2c0"/><stop offset="1" stop-color="#c48e78"/></radialGradient>
      <radialGradient id="${p}o" cx="40%" cy="35%" r="65%"><stop offset="0" stop-color="#fff2b0"/><stop offset=".6" stop-color="#e2b23a"/><stop offset="1" stop-color="#8a6a12"/></radialGradient>
      <radialGradient id="${p}h" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ff9ac8" stop-opacity=".4"/><stop offset="1" stop-color="#ff9ac8" stop-opacity="0"/></radialGradient>
    </defs>
    <circle cx="60" cy="60" r="56" fill="url(#${p}h)"/>
    <ellipse cx="60" cy="124" rx="34" ry="4" fill="#000" opacity=".35"/>
    <!-- la Tentation : charmeuse aux petites ailes, robe fluide, clin d'œil, la pomme d'or tendue -->
    <path class="b-volute" d="M76 108 C96 110 104 120 92 125" stroke="#8a1e52" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M92 125 l-7 -1 l5 -5 z" fill="#8a1e52"/>
    <g class="b-aile-g"><path d="M48 62 C36 48 20 48 14 58 C20 58 22 62 20 67 C26 65 30 69 30 74 C36 70 42 70 48 70 Z" fill="#5a0a2a" stroke="#2a0414" stroke-width="1.2"/><path d="M46 64 C38 58 28 56 18 58 M44 67 C38 64 32 64 26 66" stroke="#c0306a" stroke-width=".9" fill="none" opacity=".7"/></g>
    <g class="b-aile-d"><path d="M72 62 C84 48 100 48 106 58 C100 58 98 62 100 67 C94 65 90 69 90 74 C84 70 78 70 72 70 Z" fill="#5a0a2a" stroke="#2a0414" stroke-width="1.2"/><path d="M74 64 C82 58 92 56 102 58 M76 67 C82 64 88 64 94 66" stroke="#c0306a" stroke-width=".9" fill="none" opacity=".7"/></g>
    <path d="M40 40 C36 16 50 9 60 9 C72 9 86 16 80 40 C84 56 84 70 78 80 C72 70 48 70 42 80 C36 70 36 56 40 40 Z" fill="#3a0a2a"/><path d="M44 30 C46 50 44 64 42 76 M76 30 C76 50 78 64 80 74" stroke="#6a1a4a" stroke-width="1.6" fill="none" opacity=".8"/>
    <path d="M48 62 Q60 57 72 62 L70 78 C80 90 88 104 94 120 Q77 126 60 123 Q43 126 26 120 C32 104 40 90 50 78 Z" fill="url(#${p}r)" stroke="#3a0a1e" stroke-width="1.6"/>
    <path d="M56 80 C52 96 46 110 40 120 M64 80 C68 96 74 110 80 120 M60 82 L60 122" stroke="#4a0a2a" stroke-width="1.2" fill="none" opacity=".5"/><path d="M52 82 C48 96 42 108 34 118" stroke="#ff9ac8" stroke-width="1.4" fill="none" opacity=".45"/>
    <path d="M50 78 Q60 82 70 78" stroke="#ffd34d" stroke-width="2.4" fill="none"/><circle cx="60" cy="80.4" r="2.2" fill="#ff5a9a" stroke="#ffd34d" stroke-width=".8"/>
    <path d="M49 63 Q60 70 71 63" stroke="#ffd34d" stroke-width="1.6" fill="none"/>
    <g class="b-bras-g"><path d="M49 65 C40 70 38 78 47 82" stroke="url(#${p}pe)" stroke-width="5" fill="none" stroke-linecap="round"/></g>
    <g class="b-bras-d"><path d="M71 65 C80 66 88 70 94 76" stroke="url(#${p}pe)" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="96" cy="78" r="3.4" fill="url(#${p}pe)"/>
      <circle cx="103" cy="82" r="16" fill="#ffe08a" opacity=".22" class="b-lueur"/><circle cx="103" cy="82" r="10.5" fill="url(#${p}o)" stroke="#8a6a12" stroke-width="1.2"/>
      <path d="M103 71.5 q0 -6 4 -8" stroke="#5a3a1a" stroke-width="1.6" fill="none"/><path d="M105 67 q6 -4 9 0 q-5 3 -9 0z" fill="#6aa83a"/>
      <path d="M97.5 78 q2 -3.4 5.4 -2.4" stroke="#fff" stroke-width="1.8" fill="none" opacity=".85" stroke-linecap="round"/>
      <path d="M114 72 l1 2.6 l2.6 1 l-2.6 1 l-1 2.6 l-1 -2.6 l-2.6 -1 l2.6 -1 z M92 92 l.8 2 l2 .8 l-2 .8 l-.8 2 l-.8 -2 l-2 -.8 l2 -.8 z" fill="#fff6c8"/></g>
    <rect x="56" y="52" width="8" height="8" fill="url(#${p}pe)"/>
    <ellipse cx="60" cy="40" rx="12.5" ry="14.5" fill="url(#${p}pe)" stroke="#6a3a2a" stroke-width="1.2"/>
    <path d="M47 36 C48 24 56 22 62 24 C66 26 72 28 73 36 C68 30 62 30 58 32 C54 30 50 32 47 36 Z" fill="#3a0a2a"/>
    <path d="M50 27 C46 22 45 16 48 12 C49 18 52 22 55 24 Z M70 27 C74 22 75 16 72 12 C71 18 68 22 65 24 Z" fill="#c0306a" stroke="#5a0a2a" stroke-width="1"/>
    <path d="M51 40 q3.5 2.4 7 0" stroke="#2a0a1a" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <g class="b-oeil"><path d="M62 40 Q65.5 36.5 69 40 Q65.5 42.5 62 40 Z" fill="#fff"/><circle cx="65.5" cy="39.6" r="1.8" fill="#c0306a"/><circle cx="65.8" cy="39.4" r=".8" fill="#2a0a1a"/></g>
    <path d="M61.5 38.6 l-1.6 -1.4 M63.6 37.4 l-.8 -1.8 M66 37 l0 -1.8" stroke="#2a0a1a" stroke-width=".8" stroke-linecap="round"/>
    <path d="M50 36.4 l6 -.6 M63 35 q3 -1.6 7 0" stroke="#3a0a2a" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    <path d="M54 47.5 q6 4 12 -1 q-5 4.4 -12 1z" fill="#c0306a" stroke="#8a1e42" stroke-width="1"/>
    <ellipse cx="50.5" cy="45" rx="2.6" ry="1.6" fill="#e88a9a" opacity=".55"/><ellipse cx="69.5" cy="45" rx="2.6" ry="1.6" fill="#e88a9a" opacity=".55"/>
    <g class="b-orbite">${[[12, 36, 4], [22, 100, 3], [106, 40, 3.4]].map(([x, y, r]) => `<path d="M${x} ${y - r} l${r * .3} ${r * .7} l${r * .7} ${r * .3} l${-r * .7} ${r * .3} l${-r * .3} ${r * .7} l${-r * .3} ${-r * .7} l${-r * .7} ${-r * .3} l${r * .7} ${-r * .3} z" fill="#ffd34d"/>`).join('')}</g>`
};
Object.assign(BOSS_DESSINS, BOSS_DESSINS_2); // les 18 boss ont désormais leur version retravaillée
/* Boss du Rodage redessinés (19/11/2026) : golem, liche, spectre, basilic, harpie, troll, hydre, necro, procrastination, dissipation. */
/* Boss du RODAGE, lot 1 (Enlumineur, 19/11/2026) : golem, liche, spectre, basilic, harpie, troll redessinés.
   Même format qu'index.html : p => svg (viewBox 0 0 120 130, sol vers y 124), parties animées b-* existantes
   (durées/pivots ajustés en style en ligne), version allégée dans le bandeau 30 px (préfixe « bmini »).
   Nouveau (facultatif, voir lot1-integration.md) : classe b-fixe = garde sa couleur aux stades II/III (peau, nourriture, cloche). */
(function () {
const mini = p => /^bmini/.test(p);
// tube : trait épais avec contour (bras, cous, anneaux)
const tube = (d, w, c, o, plus) => `<path d="${d}" stroke="${o}" stroke-width="${w + 2.2}" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"${plus || ''}/>`;

Object.assign(BOSS_DESSINS, {
  /* Le Golem de la Flemme : colosse de grès assis, menton sur le poing, qui s'assoupit.
     Il n'a pas bougé depuis si longtemps qu'un oiseau a fait son nid sur son épaule et qu'un champignon pousse sur son genou. */
  golem: p => { const m = mini(p), K = '#2a2018'; return `
    <defs>
      <radialGradient id="${p}r" cx="35%" cy="22%" r="85%"><stop offset="0" stop-color="#e0d4c2"/><stop offset=".5" stop-color="#998b78"/><stop offset="1" stop-color="#483d32"/></radialGradient>
      <radialGradient id="${p}d" cx="40%" cy="25%" r="80%"><stop offset="0" stop-color="#b2a490"/><stop offset="1" stop-color="#3c3228"/></radialGradient>
      <radialGradient id="${p}f" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff2b8"/><stop offset=".4" stop-color="#ffb347" stop-opacity=".75"/><stop offset="1" stop-color="#ff7a1c" stop-opacity="0"/></radialGradient>
      <linearGradient id="${p}m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b8d67c"/><stop offset="1" stop-color="#4f6e32"/></linearGradient>
    </defs>
    <ellipse cx="60" cy="122" rx="56" ry="5" fill="#000" opacity=".45"/>
    ${m ? '' : '<path d="M108 121 q3 -5 7 0z M6 122 q2 -3 4 0z" fill="#5a4a3a"/>'}
    <g class="b-bras-g" style="animation-duration:5s"><g class="b-fixe">
      <path d="M32 46 C20 48 12 58 12 72 C16 78 26 78 32 72 C36 62 36 52 32 46Z" fill="url(#${p}d)" stroke="${K}" stroke-width="1.6"/>
      <path d="M14 70 C6 76 4 90 6 100 C12 106 24 106 30 98 C32 88 32 78 28 70 C24 66 18 66 14 70Z" fill="url(#${p}r)" stroke="${K}" stroke-width="1.6"/>
      <path d="M2 108 C0 100 6 95 15 95 C24 95 31 99 31 107 C31 116 24 121 15 121 C6 121 3 115 2 108Z" fill="url(#${p}r)" stroke="${K}" stroke-width="1.6"/>
      <path d="M7 104 q3 -2.4 6 0 M14 103 q3 -2.4 6 0 M21 104 q3 -2.4 6 0" stroke="${K}" stroke-width="1.2" fill="none" stroke-linecap="round"/>
      <path d="M10 76 q-3 10 -1 20" stroke="#fff3dc" stroke-width="1.6" fill="none" opacity=".4" stroke-linecap="round"/></g>
      <path class="b-lueur" d="M18 78 l4 5 l-3 5 l3 4" stroke="#ffb347" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
    <g class="b-fixe"><path d="M24 64 C22 44 38 32 62 32 C86 32 100 44 98 64 C98 84 92 98 84 104 L38 104 C28 98 24 84 24 64Z" fill="url(#${p}r)" stroke="${K}" stroke-width="2"/>
    <path d="M32 58 Q60 50 90 58 M36 92 q24 6 48 0" stroke="#5a4634" stroke-width="1.2" fill="none" opacity=".7"/>
    <path d="M34 46 Q50 36 72 36" stroke="#fff4e0" stroke-width="2.4" fill="none" opacity=".4" stroke-linecap="round"/></g>
    <circle cx="56" cy="74" r="21" fill="url(#${p}f)" class="b-lueur" style="animation-duration:3.6s"/>
    <path d="M56 64 l8 5 v10 l-8 5 l-8 -5 v-10z" fill="#3a1c08" fill-opacity=".35" stroke="#ffd27a" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M56 67.5 v13 M51 71 l10 6" stroke="#ffe7a8" stroke-width="1.3" stroke-linecap="round"/>
    <path class="b-lueur" style="animation-duration:3.6s" d="M48 69 l-7 -5 l-3 4 M64 79 l7 5 l1 7 M56 84 l-2 9 l3 5 M62 66 l6 -6 l6 1" stroke="#ffb347" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <g class="b-fixe"><path d="M20 52 C16 40 28 32 40 36 C48 40 46 52 38 56 C30 59 22 58 20 52Z" fill="url(#${p}r)" stroke="${K}" stroke-width="1.6"/>
    <path d="M21 45 q4 -9 14 -9 q6 0 9 4 q-6 0 -10 3 q-6 3 -13 2z" fill="url(#${p}m)"/>
    <path d="M100 52 C104 40 92 32 80 36 C72 40 74 52 82 56 C90 59 98 58 100 52Z" fill="url(#${p}r)" stroke="${K}" stroke-width="1.6"/>
    <path d="M22 96 C20 84 30 80 37 80 C45 80 52 84 51 96 L50 108 L23 108Z" fill="url(#${p}d)" stroke="${K}" stroke-width="1.6"/>
    <path d="M69 96 C68 84 75 80 83 80 C90 80 100 84 98 96 L97 108 L70 108Z" fill="url(#${p}d)" stroke="${K}" stroke-width="1.6"/>
    <path d="M28 86 q6 -4 12 -2 M75 86 q6 -4 12 -2" stroke="#fff3dc" stroke-width="1.6" fill="none" opacity=".45" stroke-linecap="round"/>
    <path d="M16 112 C16 105 24 102 36 102 C48 102 54 106 54 112 L54 118 C54 122 48 124 36 124 C24 124 16 122 16 118Z" fill="url(#${p}r)" stroke="${K}" stroke-width="1.6"/>
    <path d="M66 112 C66 106 72 102 84 102 C96 102 104 105 104 112 L104 118 C104 122 96 124 84 124 C72 124 66 122 66 118Z" fill="url(#${p}r)" stroke="${K}" stroke-width="1.6"/>
    <path d="M27 117 v6 M36 116 v7.6 M45 117 v6 M75 117 v6 M84 116 v7.6 M93 117 v6" stroke="${K}" stroke-width="1.2"/>
    ${m ? '' : `<path d="M41 83 v-5" stroke="#efe2c8" stroke-width="2.4"/><path d="M35.6 79.4 q5.4 -9 10.8 0z" fill="#d9573a" stroke="#6a1e10" stroke-width=".8"/><circle cx="39" cy="76.6" r=".9" fill="#fff"/><circle cx="42.6" cy="77.4" r=".8" fill="#fff"/>`}
    <path d="M86 50 C98 50 106 62 104 78 C102 86 94 90 88 86 C84 76 82 60 86 50Z" fill="url(#${p}d)" stroke="${K}" stroke-width="1.6"/></g>
    <g class="b-tete" style="animation-duration:4.4s"><g class="b-fixe">
      <path d="M50 22 L52 11 Q54 6 60 6 L74 6 Q80 6 82 11 L84 22 Q85 34 78 41 L56 41 Q49 34 50 22Z" fill="url(#${p}r)" stroke="${K}" stroke-width="1.8"/>
      <path d="M52 12 q6 -9 16 -6 q10 -3 14 6 q-5 -2 -14 0 q-9 -2 -16 0z" fill="url(#${p}m)"/>
      <path d="M51 20 Q58 15 66 19 Q74 15 83 20 L83 24 Q74 20 66 23 Q58 20 51 24Z" fill="#4a3a2c"/></g>
      <ellipse cx="59" cy="26.4" rx="6" ry="3.4" fill="url(#${p}f)" class="b-lueur"/><ellipse cx="75" cy="26.4" rx="6" ry="3.4" fill="url(#${p}f)" class="b-lueur"/>
      <g class="b-oeil"><path d="M55 25.6 q4 2.6 8 0 M71 25.6 q4 2.6 8 0" stroke="#ffc35a" stroke-width="2.4" fill="none" stroke-linecap="round"/></g>
      <path d="M67 26 l-2.8 6.4 h5.6z" fill="#4a3a2c"/>
      <ellipse cx="60.6" cy="35.6" rx="3" ry="2.3" fill="#1e140c"/>
      ${m ? '' : '<path d="M79 9 l-3 5 l2 3 M53 30 l3 2" stroke="#5a4634" stroke-width="1" fill="none" stroke-linecap="round"/>'}</g>
    <g class="b-fixe"><path d="M90 86 C84 76 78 64 72 54 L84 48 C88 60 96 72 104 80 C102 86 96 90 90 86Z" fill="url(#${p}r)" stroke="${K}" stroke-width="1.6"/>
    <path d="M64 46 C63 39 70 36 78 37 C86 38 89 44 87 50 C85 56 77 58 70 56 C66 55 64 51 64 46Z" fill="url(#${p}r)" stroke="${K}" stroke-width="1.6"/>
    <path d="M67 42.4 q3 -2 6 0 M73 41.4 q3 -2 6 0 M79 42.4 q3 -1.6 5 1" stroke="${K}" stroke-width="1.1" fill="none" stroke-linecap="round"/></g>
    ${m ? '' : `<g class="b-fixe"><path d="M21 37 q10 7 20 0 q-1 -5 -10 -5 q-9 0 -10 5z" fill="#7a5530" stroke="#3a2412" stroke-width="1"/><path d="M22 36 l-3 -2.4 M40 36 l3 -3 M26 39 q5 2 10 0" stroke="#b0844e" stroke-width="1" fill="none" stroke-linecap="round"/>
    <g class="b-tete" style="animation-duration:1.5s;transform-origin:50% 100%"><path d="M26 29 l-5.4 -3 l1.2 5z" fill="#6a3a22"/><ellipse cx="31" cy="29" rx="5.8" ry="4.4" fill="#c9733a" stroke="#3a1a0a" stroke-width=".8"/>
      <path d="M31 31.6 q3 1.4 5 -1.2 q-1 -2.4 -3 -1.6z" fill="#f6d8a4"/><path d="M27 28.4 q4 -2.6 7.4 .6 q-3.4 2.6 -7.4 -.6z" fill="#7a3e1e"/>
      <circle cx="35.4" cy="25.2" r="3.4" fill="#8a4a26" stroke="#3a1a0a" stroke-width=".8"/><path d="M38.4 24.6 l3.4 .9 l-3.3 1.1z" fill="#f2c94c" stroke="#7a5512" stroke-width=".5"/><circle cx="36.4" cy="24.4" r=".85" fill="#120804"/></g></g>`}`; },

  /* La Liche du Scroll : roi-squelette penché sur le téléphone, son phylactère. Le pouce fait défiler,
     la lumière de l'écran éclaire le crâne par-dessous, et un parchemin sans fin s'en déroule jusqu'au sol. */
  liche: p => { const m = mini(p), K = '#0a1418'; return `
    <defs>
      <linearGradient id="${p}r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f7488"/><stop offset=".55" stop-color="#1c3a4c"/><stop offset="1" stop-color="#0c1a24" stop-opacity=".25"/></linearGradient>
      <linearGradient id="${p}k" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a5466"/><stop offset="1" stop-color="#0e1e28"/></linearGradient>
      <radialGradient id="${p}c" cx="42%" cy="30%" r="75%"><stop offset="0" stop-color="#fbf6e6"/><stop offset=".7" stop-color="#d8ceb2"/><stop offset="1" stop-color="#9a8e70"/></radialGradient>
      <radialGradient id="${p}g" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#f2f8ff"/><stop offset=".45" stop-color="#8ec4ff" stop-opacity=".5"/><stop offset="1" stop-color="#8ec4ff" stop-opacity="0"/></radialGradient>
      <linearGradient id="${p}e" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4faff"/><stop offset="1" stop-color="#7ab4ec"/></linearGradient>
      <linearGradient id="${p}o" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8a6418"/><stop offset=".5" stop-color="#f6d27a"/><stop offset="1" stop-color="#8a6418"/></linearGradient>
      <linearGradient id="${p}p" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6ecd0"/><stop offset="1" stop-color="#c8b48a"/></linearGradient>
    </defs>
    <ellipse cx="60" cy="125" rx="34" ry="4" fill="#3fe0b0" opacity=".2"/>
    <path d="M37 56 L24 24 L38 33 L41 14 L51 29 L60 10 L69 29 L79 14 L82 33 L96 24 L83 56Z" fill="url(#${p}k)" stroke="${K}" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M26 26 L38 34 L41 16 L51 30 L60 12 L69 30 L79 16 L82 34 L94 26" stroke="url(#${p}o)" stroke-width="1.6" fill="none" stroke-linejoin="round"/>
    <path d="M38 50 Q60 43 82 50 L92 84 Q98 100 100 112 l-6 -4 l-4 8 l-6 -6 l-5 9 l-6 -7 l-6 8 l-6 -8 l-5 8 l-6 -7 l-5 7 l-5 -9 l-4 6 l-5 -5 Q22 100 28 84Z" fill="url(#${p}r)" stroke="${K}" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M53 52 L51 104 M67 52 L69 104" stroke="url(#${p}o)" stroke-width="3" fill="none"/>
    ${m ? '' : '<g fill="#3fe0b0" opacity=".8"><circle cx="52" cy="98" r="1"/><circle cx="68" cy="98" r="1"/><circle cx="52" cy="92" r=".8"/><circle cx="68" cy="92" r=".8"/></g>'}
    <path class="b-volute" d="M28 112 q-6 -4 -3 -10 M44 118 q-2 -6 2 -9 M80 118 q3 -6 -1 -10 M96 114 q6 -5 2 -11" stroke="#7dffcf" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <path d="M38 52 C27 60 25 76 29 89 L48 85 C46 74 44 62 47 54Z" fill="url(#${p}k)" stroke="${K}" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M82 52 C93 60 95 76 91 89 L72 85 C74 74 76 62 73 54Z" fill="url(#${p}k)" stroke="${K}" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M29 89 L48 85 M91 89 L72 85" stroke="url(#${p}o)" stroke-width="2.2" stroke-linecap="round"/>
    <circle cx="60" cy="72" r="30" fill="url(#${p}g)" class="b-lueur"/>
    <path d="M54 92 L67 92 C72 100 82 104 92 110 L84 116 C74 108 62 104 54 92Z" fill="url(#${p}p)" stroke="#6a5430" stroke-width="1"/>
    ${m ? '' : '<path d="M58 95.6 l6 -1 M61 99.4 l6.4 -.6 M65.6 103 l6.4 .2 M71 106.4 l5.6 .8" stroke="#8a7650" stroke-width=".8"/>'}
    <g class="b-tete" style="animation-duration:3.6s"><path d="M82 112 l20 -3 q2 0 2.4 1.8 q.2 2 -1.8 2.4 l-20 3z M84 116.6 l22 -1.6 q2 0 2 2 q0 2 -2 2 l-22 1.4z M80 121 l24 0 q2 0 2 1.6 q0 1.6 -2 1.6 h-24 q-2 0 -2 -1.6 q0 -1.6 2 -1.6z" fill="url(#${p}p)" stroke="#6a5430" stroke-width=".9"/></g>
    <rect x="48.5" y="57" width="23" height="36" rx="4" fill="#0e1418" stroke="#b8dcff" stroke-width="1.2"/>
    <rect class="b-ecran" x="51" y="60" width="18" height="29" rx="2" fill="url(#${p}e)"/>
    ${m ? '' : `<g fill="#1e4a7a" opacity=".5"><rect x="53" y="63" width="14" height="6" rx="1.4"/><rect x="53" y="71" width="14" height="6" rx="1.4"/><rect x="53" y="79" width="14" height="6" rx="1.4"/></g>
    <g fill="#ffffff" opacity=".7"><circle cx="55.4" cy="66" r="1.4"/><circle cx="55.4" cy="74" r="1.4"/><circle cx="55.4" cy="82" r="1.4"/></g>`}
    ${tube('M44 87 L47 80', 3, '#e8dfc6', '#5a5038')}${tube('M76 87 L73 80', 3, '#e8dfc6', '#5a5038')}
    ${[68, 74, 80].map(y => tube(`M46.4 ${y + 1.6} q2.4 -2.4 5.2 -1.2`, 2.4, '#efe6cc', '#5a5038')).join('')}${[78, 84].map(y => tube(`M73.6 ${y + 1.6} q-2.4 -2.4 -5.2 -1.2`, 2.4, '#efe6cc', '#5a5038')).join('')}
    <g class="b-queue" style="transform-origin:100% 100%;animation-duration:1.3s">${tube('M73 75 C70 73 67 71 64.6 69.4', 2.8, '#f2ead4', '#5a5038')}</g>
    <g class="b-badge"><circle cx="71" cy="57.5" r="4.4" fill="#e5383b" stroke="#fff" stroke-width="1"/><text x="71" y="59.9" font-size="6" text-anchor="middle" fill="#fff" font-weight="800" font-family="system-ui,sans-serif">9</text></g>
    <path d="M47 33 C46 22 52 17 60 17 C68 17 74 22 73 33 C73 40 70 44 67 46 L67 51 L53 51 L53 46 C50 44 47 40 47 33Z" fill="url(#${p}c)" stroke="#4a4232" stroke-width="1.3"/>
    <path d="M48.6 26 Q60 21.6 71.4 26" stroke="url(#${p}o)" stroke-width="2" fill="none"/><path d="M60 21.8 l2.2 2.4 l-2.2 2.4 l-2.2 -2.4z" fill="#3fe0b0" stroke="#7a5a12" stroke-width=".6"/>
    <path d="M51 34 q4.4 -2.4 8 1.2 q-1 5 -4.6 5 q-3.6 -.6 -3.4 -6.2z M69 34 q-4.4 -2.4 -8 1.2 q1 5 4.6 5 q3.6 -.6 3.4 -6.2z" fill="#0b0d10"/>
    <g class="b-oeil"><circle cx="55" cy="38.4" r="1.7" fill="#d8ecff"/><circle cx="65" cy="38.4" r="1.7" fill="#d8ecff"/></g>
    <path d="M58.6 42.6 l1.4 2.6 l1.4 -2.6z" fill="#3a3426"/>
    <path d="M54 47.4 h12 M56 46 v3.4 M58.6 46 v3.6 M61.4 46 v3.6 M64 46 v3.4" stroke="#4a4232" stroke-width="1"/>
    <ellipse cx="60" cy="47" rx="12" ry="6" fill="url(#${p}g)" class="b-lueur" opacity=".55"/>
    ${m ? '' : `<path d="M51 22 q4 -3 9 -3.4" stroke="#fff" stroke-width="1.4" fill="none" opacity=".55" stroke-linecap="round"/>
    <g class="b-volute" fill="#7dffcf"><circle cx="22" cy="46" r="1.5"/><circle cx="100" cy="40" r="1.3"/><circle cx="106" cy="74" r="1.7"/><circle cx="14" cy="78" r="1.2"/></g>`}`; },

  /* Le Spectre du « Demain » : esprit lilas avachi dans le vide, une main derrière la tête, l'autre brandissant
     son éphéméride « J+1 » dont les pages s'envolent. Air narquois, paupières lourdes, sourire en coin. */
  spectre: p => { const m = mini(p), K = '#46204e'; return `
    <defs>
      <linearGradient id="${p}a" x1="0" y1="0" x2=".5" y2="1"><stop offset="0" stop-color="#fdf8ff" stop-opacity=".98"/><stop offset=".5" stop-color="#f0c8e8" stop-opacity=".9"/><stop offset="1" stop-color="#c078b8" stop-opacity=".25"/></linearGradient>
      <radialGradient id="${p}h" cx="50%" cy="45%" r="55%"><stop offset="0" stop-color="#f8d8f8" stop-opacity=".35"/><stop offset="1" stop-color="#f8d8f8" stop-opacity="0"/></radialGradient>
      <radialGradient id="${p}f" cx="45%" cy="40%" r="60%"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#f2d8f2" stop-opacity=".6"/></radialGradient>
    </defs>
    <ellipse cx="62" cy="124" rx="26" ry="3.5" fill="#000" opacity=".22"/>
    <circle cx="58" cy="54" r="54" fill="url(#${p}h)" class="b-lueur" style="animation-duration:3.4s"/>
    <g class="b-queue" style="transform-origin:100% 100%;animation-duration:2.6s"><path d="M42 18 C36 8 26 3 15 6 C24 8 28 13 31 22Z" fill="url(#${p}a)" stroke="#d8a4d4" stroke-width="1"/></g>
    <g class="b-bras-g" style="animation-duration:4.4s">${tube('M36 52 C24 48 15 40 17 29 C19 22 29 19 40 23', 6.4, '#f4dcf0', '#c488bc')}</g>
    <path d="M50 10 C68 8 80 22 79 40 C78 54 86 66 94 78 C102 90 108 104 100 116 C96 121 89 118 91 112 C93 104 86 98 76 96 C60 94 40 92 32 78 C26 66 26 48 30 34 C34 20 40 12 50 10Z" fill="url(#${p}a)" stroke="#d8a4d4" stroke-width="1.2"/>
    <g class="b-volute" style="animation-duration:3s"><path d="M40 86 q-1 10 -7 15 q9 -2 13 -11z M54 92 q0 9 -4 14 q8 -3 9 -13z M66 95 q2 8 0 13 q6 -4 5 -12z" fill="url(#${p}a)" stroke="#d8a4d4" stroke-width=".8"/></g>
    <path d="M36 30 q6 -14 20 -16" stroke="#fff" stroke-width="2.6" fill="none" opacity=".65" stroke-linecap="round"/>
    <path d="M38 36 C38 24 46 20 54 20 C64 20 70 27 69 37 C68 47 61 53 53 53 C44 53 38 46 38 36Z" fill="url(#${p}f)"/>
    <path d="M43 31 q4 -3.4 8 -1.4 M58 29 q5 -4.4 9 -.6" stroke="${K}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <g class="b-oeil"><path d="M42 37 Q47 33 52 37 Q47 40.4 42 37Z M57 36 Q62 32 67 36 Q62 39.4 57 36Z" fill="#3a1240"/>
      <circle cx="49.4" cy="37.4" r="1.6" fill="#e6f2ff"/><circle cx="64.6" cy="36.4" r="1.6" fill="#e6f2ff"/>
      <path d="M41.4 36 Q47 32.6 52.6 36 M56.4 35 Q62 31.6 67.6 35" stroke="${K}" stroke-width="1.8" fill="none" stroke-linecap="round"/></g>
    <path d="M48 45 Q55 48.6 62 43" stroke="${K}" stroke-width="1.7" fill="none" stroke-linecap="round"/><path d="M61 42.6 l2 -1" stroke="${K}" stroke-width="1.4" stroke-linecap="round"/>
    <ellipse cx="44" cy="42.6" rx="3" ry="1.6" fill="#e8a8d0" opacity=".45"/>
    <g class="b-bras-d" style="transform-origin:0% 100%;animation-duration:3s">${tube('M74 52 C86 52 92 44 96 34', 6.4, '#f4dcf0', '#c488bc')}
      <g transform="rotate(10 104 22)"><rect x="92" y="6" width="25" height="28" rx="3" fill="#f8efd8" stroke="#7a6440" stroke-width="1.3"/>
        <path d="M92 9 q0 -3 3 -3 h19 q3 0 3 3 v5 h-25z" fill="#d0453a" stroke="#7a2a1e" stroke-width="1"/>
        <circle cx="98" cy="6" r="1.7" fill="#5a4a2a"/><circle cx="111" cy="6" r="1.7" fill="#5a4a2a"/>
        <text x="104.5" y="29" font-size="10.5" font-family="Georgia,serif" font-weight="700" fill="#4a3a1e" text-anchor="middle">J+1</text>
        ${m ? '' : '<path d="M92.6 33.6 q6 -3 9 1" stroke="#c8b48a" stroke-width=".8" fill="none"/>'}</g>
      <ellipse cx="95" cy="35" rx="4" ry="3.4" fill="#f4eaff" stroke="#c488bc" stroke-width=".9"/></g>
    ${m ? '' : `<g class="b-volute" style="animation-duration:3.6s"><g transform="rotate(-22 14 22)"><rect x="8" y="16" width="12" height="13" rx="1.4" fill="#f8efd8" stroke="#7a6440" stroke-width=".8"/><rect x="8" y="16" width="12" height="3.6" rx="1" fill="#d0453a"/></g></g>
    <g class="b-volute" style="animation-duration:4.4s;animation-delay:-1.6s"><g transform="rotate(24 108 62)"><rect x="103" y="56" width="10" height="11" rx="1.2" fill="#f8efd8" stroke="#7a6440" stroke-width=".8"/><rect x="103" y="56" width="10" height="3" rx="1" fill="#d0453a"/></g></g>
    <g class="b-volute" style="animation-duration:5s;animation-delay:-3s"><g transform="rotate(-8 16 96)"><rect x="12" y="91" width="8" height="9" rx="1" fill="#f8efd8" stroke="#7a6440" stroke-width=".7" opacity=".85"/><rect x="12" y="91" width="8" height="2.6" rx=".8" fill="#d0453a" opacity=".85"/></g></g>`}`; },

  /* Le Basilic de la Malbouffe : serpent-coq (crête et barbillons rouges, bec crochu, œil qui pétrifie)
     lové autour de son trésor : burger, frites et soda. Une patte griffue posée sur le burger, la langue qui goûte l'air. */
  basilic: p => { const m = mini(p), K = '#22300e'; return `
    <defs>
      <linearGradient id="${p}a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#dcea86"/><stop offset=".5" stop-color="#8eac3e"/><stop offset="1" stop-color="#3e5418"/></linearGradient>
      <radialGradient id="${p}t" cx="40%" cy="30%" r="75%"><stop offset="0" stop-color="#e6f29a"/><stop offset=".6" stop-color="#94b042"/><stop offset="1" stop-color="#43591a"/></radialGradient>
      <linearGradient id="${p}v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf2c8"/><stop offset="1" stop-color="#d8c07a"/></linearGradient>
      <radialGradient id="${p}y" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff59a" stop-opacity=".9"/><stop offset="1" stop-color="#ffd23a" stop-opacity="0"/></radialGradient>
      <linearGradient id="${p}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4c070"/><stop offset="1" stop-color="#c47a2a"/></linearGradient>
    </defs>
    <ellipse cx="62" cy="123" rx="54" ry="5" fill="#000" opacity=".42"/>
    <g class="b-queue" style="transform-origin:0% 100%;animation-duration:2.4s">${tube('M98 96 C110 92 116 80 112 66', 7, `url(#${p}a)`, K)}<path d="M112 66 l-5 -2 l6 -9 l5 9z" fill="#c0453a" stroke="#5a160e" stroke-width="1" stroke-linejoin="round"/></g>
    ${tube('M30 104 C30 90 56 86 80 88 C100 90 112 98 106 110', 15, `url(#${p}a)`, K)}
    <g class="b-fixe">
      ${m ? '' : `<path d="M62 112 L60 84 Q60 80 64 80 L74 80 Q78 80 77 84 L75 112Z" fill="#e6eef2" stroke="#4a5a66" stroke-width="1.2"/><path d="M61.2 95 H76.2" stroke="#6aa8c8" stroke-width="4"/>
      <path d="M60.6 82 H77.4" stroke="#8aa2b0" stroke-width="2.4" stroke-linecap="round"/><path d="M70 81 L74 66 l3 1" stroke="#7ac4d8" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <g stroke="#7a5512" stroke-width=".8"><path d="M83 92 l-2 -12 h3.4 l1 12z M87 92 l0 -14 h3.4 l-.4 14z M91 92 l1.4 -11 h3.4 l-1.6 11z M85 90 l2 -8 h3 l-1 8z" fill="#ffd34d"/></g>
      <path d="M80 90 L100 90 L97 110 L83 110Z" fill="#c8955a" stroke="#5a3a14" stroke-width="1.2" stroke-linejoin="round"/><path d="M80.6 94 H99.4" stroke="#8a5e2a" stroke-width="1"/><path d="M86 100 l3 4 l3 -4" stroke="#8a5e2a" stroke-width="1" fill="none"/>`}
      <path d="M68 104 Q68 94 84 94 Q100 94 100 104Z" fill="url(#${p}b)" stroke="#6a3a10" stroke-width="1.2"/>
      ${m ? '' : '<g fill="#fff6dc"><ellipse cx="78" cy="98" rx="1" ry=".6"/><ellipse cx="85" cy="97" rx="1" ry=".6"/><ellipse cx="91" cy="99" rx="1" ry=".6"/></g>'}
      <path d="M67 104 l3 3 l3 -3 l3 3 l3 -3 l3 3 l3 -3 l3 3 l3 -3 l3 3 l3 -3 v2 h-34z" fill="#7ac04a" stroke="#2e5a16" stroke-width=".7" stroke-linejoin="round"/>
      <path d="M69 105 h30 l-3 4 h-24z" fill="#ffc83a"/>
      <rect x="68" y="107" width="32" height="5" rx="2.4" fill="#6a3a1e" stroke="#2e160a" stroke-width="1"/>
      <path d="M69 112 Q69 117 84 117 Q99 117 99 112Z" fill="url(#${p}b)" stroke="#6a3a10" stroke-width="1.2"/></g>
    ${tube('M106 110 C102 122 70 124 50 120 C36 117 26 112 27 102', 15, `url(#${p}a)`, K)}
    ${m ? '' : `<path d="M100 117 C88 121 64 121 50 117.6" stroke="url(#${p}v)" stroke-width="4" fill="none" stroke-linecap="round" opacity=".9"/>
    <g fill="#4a2a3a" opacity=".55"><path d="M60 117 l3 -3 l3 3 l-3 3z M78 118 l3 -3 l3 3 l-3 3z M92 114 l2.6 -2.6 l2.6 2.6 l-2.6 2.6z M36 112 l2.6 -3 l2.6 3 l-2.6 3z"/></g>`}
    <path d="M23 106 C14 92 14 66 26 52 C32 45 40 42 48 44 C44 52 40 60 40 72 C40 86 42 96 38 106Z" fill="url(#${p}t)" stroke="${K}" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M33 104 C31 92 30 76 34 62 C36 56 40 52 44 49" stroke="url(#${p}v)" stroke-width="5" fill="none" stroke-linecap="round" opacity=".9"/>
    ${m ? '' : '<path d="M33 96 h5 M32.6 88 h5.4 M32.6 80 h5.6 M33.4 72 h5.4 M35 64 h5" stroke="#b09a50" stroke-width=".8"/><g fill="#4a2a3a" opacity=".5"><path d="M22 88 l3 -3 l3 3 l-3 3z M21 74 l3 -3 l3 3 l-3 3z M25 60 l3 -3 l3 3 l-3 3z"/></g>'}
    <path class="b-volute" style="animation-duration:2.4s" d="M75 47 q-2.4 4.4 0 6.4 q2.4 -2 0 -6.4z" fill="#f2e27a" opacity=".9"/>
    <path d="M36 22 l4 -10 l4 6 l4 -12 l4 9 l5 -8 l2 11 l4 -5 l-1 10z" fill="#d8402a" stroke="#6a160e" stroke-width="1.2" stroke-linejoin="round"/>
    <path d="M28 46 C24 36 28 24 40 21 C52 18 64 22 70 30 L74 36 C70 40 62 42 54 44 C44 48 34 52 28 46Z" fill="url(#${p}t)" stroke="${K}" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M68 29 C76 30 82 34 82 40 C78 38 74 38 70 39 Z" fill="#e8b84a" stroke="#6a4a10" stroke-width="1.2" stroke-linejoin="round"/>
    <path d="M70 40 C74 40 78 41 80 43 C76 45 70 45 64 44Z" fill="#c8942e" stroke="#6a4a10" stroke-width="1.1" stroke-linejoin="round"/>
    <path class="b-langue" style="transform-origin:0% 50%" d="M78 42.6 q6 0 9 -2 m-3 1.4 l4 1.6" stroke="#e5383b" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <path d="M52 44 C52 52 56 58 62 58 C66 58 66 52 62 46Z" fill="#d8402a" stroke="#6a160e" stroke-width="1.1"/>
    <path d="M34 27 q8 -6 18 -5" stroke="#f6ffc8" stroke-width="1.6" fill="none" opacity=".6" stroke-linecap="round"/>
    <circle cx="55" cy="31" r="8" fill="url(#${p}y)" class="b-lueur"/>
    <path d="M47 28 L62 26" stroke="${K}" stroke-width="2.6" stroke-linecap="round"/>
    <g class="b-oeil"><path d="M49 31.4 Q55 26.4 61 31 Q55 35.4 49 31.4Z" fill="#ffe14a" stroke="#6a5a10" stroke-width="1"/><ellipse cx="55.4" cy="31.2" rx="1.1" ry="3" fill="#1a1a08"/></g>
    ${m ? '' : '<circle cx="73" cy="34.4" r=".9" fill="#3a2a08"/><path d="M38 36 q2 3 6 3 M40 31 q2 2 4 2" stroke="#5a7a1e" stroke-width=".9" fill="none" stroke-linecap="round"/>'}`; },

  /* La Harpie du Bruit : corps d'oiseau de proie cuivré, visage de femme qui hurle, crête ébouriffée,
     ailes déployées. Dans ses serres, une cloche fêlée qu'elle fait sonner sans fin. */
  harpie: p => { const m = mini(p), K = '#2a0e06';
    // aile de plumes : rémiges en éventail sous le bras (épaule → poignet), couvertures claires par-dessus
    const plume = (o, a, L, w, c) => { const r = a * Math.PI / 180, dx = Math.cos(r), dy = Math.sin(r), mx = o[0] + dx * L * .55, my = o[1] + dy * L * .55;
      return `<path d="M${o[0].toFixed(1)} ${o[1].toFixed(1)} Q${(mx - dy * w).toFixed(1)} ${(my + dx * w).toFixed(1)} ${(o[0] + dx * L).toFixed(1)} ${(o[1] + dy * L).toFixed(1)} Q${(mx + dy * w * .7).toFixed(1)} ${(my - dx * w * .7).toFixed(1)} ${o[0].toFixed(1)} ${o[1].toFixed(1)}Z" fill="${c}" stroke="${K}" stroke-width=".8"/>`; };
    const aile = s => { const X = x => 60 + s * (60 - x), ang = a => s < 0 ? a : 180 - a, n = m ? 6 : 11;
      const rem = Array.from({ length: n }, (_, i) => { const t = i / (n - 1); return plume([X(22 + 24 * t), 30 + 22 * t], ang(224 - t * 100), 31 - t * 12, 7, i % 2 ? '#a8482a' : '#d06a34'); }).join('');
      const nc = m ? 4 : 7, couv = Array.from({ length: nc }, (_, i) => { const t = i / (nc - 1); return plume([X(24 + 22 * t), 34 + 18 * t], ang(200 - t * 66), 19, 6.4, i % 2 ? '#e89058' : '#ffc08a'); }).join('');
      return `<g class="b-aile-${s < 0 ? 'g' : 'd'}" style="animation-duration:1.8s">${rem}${couv}<path d="M${X(48)} 56 Q${X(34)} 38 ${X(22)} 30" stroke="#5a200e" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M${X(46)} 54 Q${X(34)} 38 ${X(23)} 31" stroke="#ffd2a0" stroke-width="1" fill="none" opacity=".5" stroke-linecap="round"/></g>`; };
    return `
    <defs>
      <linearGradient id="${p}w" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f2a060"/><stop offset=".5" stop-color="#b0502a"/><stop offset="1" stop-color="#4a1a0c"/></linearGradient>
      <linearGradient id="${p}c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd8a8"/><stop offset="1" stop-color="#d08848"/></linearGradient>
      <radialGradient id="${p}b" cx="45%" cy="30%" r="75%"><stop offset="0" stop-color="#f6b878"/><stop offset=".6" stop-color="#c0602e"/><stop offset="1" stop-color="#4a1a0c"/></radialGradient>
      <radialGradient id="${p}s" cx="45%" cy="35%" r="70%"><stop offset="0" stop-color="#fff0e4"/><stop offset=".7" stop-color="#ecc8b0"/><stop offset="1" stop-color="#b88a72"/></radialGradient>
      <linearGradient id="${p}o" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8a5a10"/><stop offset=".4" stop-color="#ffe08a"/><stop offset="1" stop-color="#9a6a18"/></linearGradient>
    </defs>
    <ellipse cx="60" cy="125" rx="30" ry="4" fill="#000" opacity=".35"/>
    ${aile(-1)}${aile(1)}
    <g class="b-fixe"><g class="b-orbite" style="transform-origin:50% 0%;animation-duration:1.2s">
      <ellipse cx="60" cy="104" rx="3" ry="2.4" fill="none" stroke="#7a5a10" stroke-width="1.6"/>
      <path d="M46 120 C46 110 50 105 60 105 C70 105 74 110 74 120 L78 123 H42Z" fill="url(#${p}o)" stroke="#4a2a06" stroke-width="1.3" stroke-linejoin="round"/>
      <path d="M51 110 q-1.6 5 -1.4 10" stroke="#fff6d0" stroke-width="1.2" fill="none" opacity=".7" stroke-linecap="round"/><path d="M64 107 l-2 4 l2.6 3 l-2 4" stroke="#4a2a06" stroke-width=".9" fill="none"/>
      <path d="M60 117 v5" stroke="#4a2a06" stroke-width="1.6"/><circle cx="60" cy="123.6" r="2.6" fill="#4a2a06"/></g>
      ${m ? '' : '<g class="b-onde" fill="none" stroke="#ffd34d" stroke-width="1.3" stroke-linecap="round" style="animation-duration:1.2s"><path d="M38 108 q-5 6 0 12 M82 108 q5 6 0 12"/><path d="M33 105 q-7 9 0 18 M87 105 q7 9 0 18" opacity=".6"/></g>'}</g>
    <path d="M50 88 C48 94 50 98 54 98 C58 98 59 94 58 88Z M70 88 C72 94 70 98 66 98 C62 98 61 94 62 88Z" fill="url(#${p}b)" stroke="${K}" stroke-width="1.1"/>
    <path d="M54 94 L56.6 104 M66 94 L63.4 104" stroke="#5a3a08" stroke-width="5" stroke-linecap="round"/><path d="M54 94 L56.6 104 M66 94 L63.4 104" stroke="#e8b04a" stroke-width="3.2" stroke-linecap="round"/>
    ${m ? '' : '<path d="M54.4 97 h2.4 M55 100 h2.4 M63.2 97 h2.4 M62.6 100 h2.4" stroke="#9a6a18" stroke-width=".7"/>'}
    <path d="M56.6 104 q-4 0 -4.6 3 M56.6 104 q.6 2.6 2.4 3 M63.4 104 q4 0 4.6 3 M63.4 104 q-.6 2.6 -2.4 3" stroke="#e8b04a" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M52 107 l-.6 1.4 M59 107 l.6 1.2 M68 107 l.6 1.4 M61 107 l-.6 1.2" stroke="#1a0a04" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M44 56 C40 70 42 86 52 92 C56 94 64 94 68 92 C78 86 80 70 76 56 C70 50 50 50 44 56Z" fill="url(#${p}b)" stroke="${K}" stroke-width="1.6"/>
    <path d="M50 60 C48 72 50 84 56 88 C58 89 62 89 64 88 C70 84 72 72 70 60 C64 56 56 56 50 60Z" fill="url(#${p}c)"/>
    ${m ? '' : `<path d="M52 66 l4 3 l4 -3 l4 3 l4 -3 M52 74 l4 3 l4 -3 l4 3 l4 -3 M54 82 l3 2.6 l3 -2.6 l3 2.6 l3 -2.6" stroke="#a0582a" stroke-width="1" fill="none" stroke-linejoin="round"/>`}
    <path d="M44 52 q4 6 8 2 q3 6 8 2 q5 4 8 -2 q4 4 8 -2 q-2 -8 -16 -10 q-14 2 -16 10z" fill="#fff0d8" stroke="#8a5a3a" stroke-width="1"/>
    <path d="M45 32 L35 24 L44 23 L37 12 L48 16 L47 4 L56 12 L60 0 L64 12 L73 4 L72 16 L83 12 L76 23 L85 24 L75 32 C73 25 68 21 60 21 C52 21 47 25 45 32Z" fill="#7a2e14" stroke="#2a0a04" stroke-width="1.1" stroke-linejoin="round"/>
    <path d="M44 20 L50 18 M52 10 L56 15 M66 9 L64 15 M76 16 L70 19" stroke="#d0703a" stroke-width="1.3" fill="none" opacity=".85" stroke-linecap="round"/>
    <path d="M47 33 C47 22 53 17 60 17 C67 17 73 22 73 33 C73 43 67 49 60 49 C53 49 47 43 47 33Z" fill="url(#${p}c)" stroke="#6a3a1a" stroke-width="1.3"/>
    <path d="M50 33 C50 25 55 21 60 25 C65 21 70 25 70 33 C70 41 65 46 60 46 C55 46 50 41 50 33Z" fill="#fff4e4" opacity=".9"/>
    <g class="b-oeil"><circle cx="54.6" cy="31" r="4.4" fill="#ffd34d" stroke="#2a0e06" stroke-width="1"/><circle cx="65.4" cy="31" r="4.4" fill="#ffd34d" stroke="#2a0e06" stroke-width="1"/><circle cx="55.4" cy="31.4" r="2" fill="#1a0804"/><circle cx="64.6" cy="31.4" r="2" fill="#1a0804"/><circle cx="56" cy="30.6" r=".7" fill="#fff"/><circle cx="65.2" cy="30.6" r=".7" fill="#fff"/></g>
    <path d="M49.4 25.6 l9 3.4 M70.6 25.6 l-9 3.4" stroke="#2a0e06" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M56.4 40.6 Q60 50.4 63.6 40.6Z" fill="#7a1420"/><path d="M58 45 Q60 48 62 45 Q60 46 58 45Z" fill="#e5585a"/><path d="M55.4 36.4 Q60 33.4 64.6 36.4 Q63.6 40 60 42.6 Q56.4 40 55.4 36.4Z" fill="#f2c24a" stroke="#6a4a10" stroke-width="1"/><path d="M57 46.6 Q60 51.6 63 46.6 Q60 48.4 57 46.6Z" fill="#d8a43a" stroke="#6a4a10" stroke-width=".9"/>
    
    <g class="b-onde" fill="none" stroke="#ffd34d" stroke-width="1.7" stroke-linecap="round"><path d="M38 34 q-5 5 0 10" opacity=".9"/><path d="M32 30 q-8 9 0 18" opacity=".55"/><path d="M82 34 q5 5 0 10" opacity=".9"/><path d="M88 30 q8 9 0 18" opacity=".55"/></g>
    ${m ? '' : '<g class="b-volute" fill="#f2a060" opacity=".85"><path d="M14 92 q4 -3 6 1 q-3 3 -6 -1z"/><path d="M104 96 q4 -3 6 1 q-3 3 -6 -1z"/></g>'}`; },

  /* Le Troll des Nuits Blanches : géant voûté en pyjama et bonnet, cernes violets, yeux injectés qui ne se ferment pas,
     une énorme tasse de café fumante à la main. La lune veille derrière lui (à l'aube, il redevient pierre). */
  troll: p => { const m = mini(p), K = '#1c2230'; return `
    <defs>
      <radialGradient id="${p}pe" cx="40%" cy="28%" r="80%"><stop offset="0" stop-color="#c6d0de"/><stop offset=".55" stop-color="#7a879c"/><stop offset="1" stop-color="#3a4458"/></radialGradient>
      <linearGradient id="${p}py" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c0485a"/><stop offset="1" stop-color="#5e1828"/></linearGradient>
      <radialGradient id="${p}lu" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff7c8" stop-opacity=".8"/><stop offset="1" stop-color="#fff7c8" stop-opacity="0"/></radialGradient>
      <linearGradient id="${p}bo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a5aa8"/><stop offset="1" stop-color="#1e2658"/></linearGradient>
      <linearGradient id="${p}ta" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d8d0c0"/><stop offset=".45" stop-color="#fffaf0"/><stop offset="1" stop-color="#b8ae9c"/></linearGradient>
    </defs>
    <circle cx="102" cy="16" r="18" fill="url(#${p}lu)" class="b-lueur" style="animation-duration:4s"/><path d="M100 4 a11 11 0 1 0 10 17 a9 9 0 1 1 -10 -17z" fill="#f4e7a1"/>
    ${m ? '' : '<g class="b-volute" fill="#fff6c8"><path d="M14 14 l1 2.4 l2.4 1 l-2.4 1 l-1 2.4 l-1 -2.4 l-2.4 -1 l2.4 -1z"/><path d="M84 8 l.8 1.8 l1.8 .8 l-1.8 .8 l-.8 1.8 l-.8 -1.8 l-1.8 -.8 l1.8 -.8z" style="animation-delay:-2s"/></g>'}
    <ellipse cx="60" cy="123" rx="48" ry="5" fill="#000" opacity=".45"/>
    <path d="M36 104 L34 116 L54 116 L54 104Z M66 104 L66 116 L86 116 L84 104Z" fill="url(#${p}py)" stroke="#2a0a12" stroke-width="1.3" stroke-linejoin="round"/>
    <g class="b-fixe"><path d="M28 124 C26 118 30 114 38 114 L52 114 C56 114 58 118 56 122 L56 124Z M64 124 C62 118 64 114 68 114 L82 114 C90 114 94 118 92 124Z" fill="url(#${p}pe)" stroke="${K}" stroke-width="1.4"/>
      <path d="M32 121 q2 -3 4 0 M38 120.4 q2 -3 4 0 M44 120.6 q2 -3 4 0 M72 120.6 q2 -3 4 0 M78 120.4 q2 -3 4 0 M84 121 q2 -3 4 0" stroke="${K}" stroke-width="1" fill="none"/></g>
    <path d="M24 74 C22 50 38 40 60 40 C82 40 98 50 96 74 C96 92 92 104 84 108 C68 114 52 114 36 108 C28 104 24 92 24 74Z" fill="url(#${p}py)" stroke="#2a0a12" stroke-width="2"/>
    ${m ? '' : '<path d="M36 50 v54 M48 44 v66 M60 42 v70 M72 44 v66 M84 50 v54" stroke="#f6dcc0" stroke-width="2.4" opacity=".28"/>'}
    <path d="M42 78 h12 v12 h-12z" fill="#7a2a3a" stroke="#2a0a12" stroke-width="1" transform="rotate(-6 48 84)"/>${m ? '' : '<path d="M43 79 l10 1 M42.6 89 l10.6 -.4" stroke="#f6dcc0" stroke-width=".8" stroke-dasharray="1.4 1.2" transform="rotate(-6 48 84)"/>'}
    <circle cx="60" cy="62" r="2" fill="#f2e6c8"/><circle cx="60" cy="74" r="2" fill="#f2e6c8"/><circle cx="60" cy="86" r="2" fill="#f2e6c8"/>
    <g class="b-bras-g" style="animation-duration:4.6s">${tube('M30 54 C18 62 12 78 14 98', 12, `url(#${p}py)`, '#2a0a12')}
      <g class="b-fixe">${[['M10 98 C8 102 7 106 8 110', 4.2], ['M15.6 99 C15 104 15 108 16 112', 4.4], ['M21 98 C22 102 23 105 22 108', 4]].map(([d, w]) => tube(d, w, '#8a96aa', K)).join('')}
        <path d="M6 96 C5 90 10 86 16 86 C22 86 26 90 25 96 C24 100 19 102 15 102 C10 102 6 100 6 96Z" fill="url(#${p}pe)" stroke="${K}" stroke-width="1.5"/>${tube('M24 92 C28 94 29 98 27 101', 3.6, '#8a96aa', K)}</g></g>
    <g class="b-bras-d" style="animation-duration:3.8s">${tube('M90 54 C100 60 106 72 102 84', 12, `url(#${p}py)`, '#2a0a12')}
      <g class="b-fixe"><path d="M90 82 C90 76 96 74 102 76 C108 78 110 84 106 90 C102 94 94 94 91 90Z" fill="url(#${p}pe)" stroke="${K}" stroke-width="1.5"/>
        <path d="M86 74 h22 l-2 22 q-9 4 -18 0z" fill="url(#${p}ta)" stroke="#5a5040" stroke-width="1.3" stroke-linejoin="round"/><path d="M108 78 q8 1 6 9 q-2 6 -8 5" stroke="#5a5040" stroke-width="2.4" fill="none"/><path d="M108 78 q8 1 6 9 q-2 6 -8 5" stroke="#efe6d4" stroke-width="1.2" fill="none"/>
        <ellipse cx="97" cy="74.6" rx="10.6" ry="2.2" fill="#4a2a14"/><path d="M90 84 h14" stroke="#c0485a" stroke-width="2.2"/></g></g>
    <g class="b-volute" style="animation-duration:3s" fill="none" stroke="#e8e4f0" stroke-width="1.6" stroke-linecap="round" opacity=".8"><path d="M93 70 q-3 -4 0 -8 q3 -4 0 -8"/><path d="M100 70 q3 -4 0 -8 q-3 -4 0 -9"/></g>
    <g class="b-fixe"><path d="M34 34 C34 16 46 10 60 10 C74 10 86 16 86 34 C86 50 76 60 60 60 C44 60 34 50 34 34Z" fill="url(#${p}pe)" stroke="${K}" stroke-width="1.9"/>
      <path d="M35 34 L22 26 L30 38 L24 42 L36 42Z M85 34 L98 26 L90 38 L96 42 L84 42Z" fill="url(#${p}pe)" stroke="${K}" stroke-width="1.3" stroke-linejoin="round"/>
      <ellipse cx="49" cy="38" rx="7" ry="3.4" fill="#6a4a8a" opacity=".55"/><ellipse cx="71" cy="38" rx="7" ry="3.4" fill="#6a4a8a" opacity=".55"/>
      <g class="b-oeil" style="animation-duration:2.6s"><ellipse cx="49" cy="33" rx="5.6" ry="4.6" fill="#fff4e4" stroke="${K}" stroke-width="1"/><ellipse cx="71" cy="33" rx="5.6" ry="4.6" fill="#fff4e4" stroke="${K}" stroke-width="1"/>
        ${m ? '' : '<path d="M44.4 32 l2.4 .8 M45 35 l2 -.6 M75.6 32 l-2.4 .8 M75 35 l-2 -.6" stroke="#d04040" stroke-width=".7"/>'}<circle cx="49.6" cy="33.4" r="2" fill="#c0303a"/><circle cx="70.4" cy="33.4" r="2" fill="#c0303a"/><circle cx="49.6" cy="33.4" r=".8" fill="#1a0a0a"/><circle cx="70.4" cy="33.4" r=".8" fill="#1a0a0a"/></g>
      <path d="M42 27 q6 -3 12 1 M78 27 q-6 -3 -12 1" stroke="${K}" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M56 34 C52 40 52 46 57 47 C59 48 61 48 63 47 C68 46 68 40 64 34Z" fill="url(#${p}pe)" stroke="${K}" stroke-width="1.3"/><path d="M57 44 q1.6 1 3 0" stroke="${K}" stroke-width="1" fill="none"/>
      <path d="M48 52 Q60 58 72 52" stroke="${K}" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M50 52.6 l1.6 -4 l2 4.4 M68 53 l1.6 -4.4 l2 4" fill="#f2ead0" stroke="#5a5040" stroke-width=".7" stroke-linejoin="round"/>
      ${m ? '' : '<circle cx="42" cy="46" r="1.2" fill="#4a5468"/><circle cx="79" cy="20" r="1" fill="#4a5468"/><path d="M40 22 q6 -6 14 -7" stroke="#eef2f8" stroke-width="1.6" fill="none" opacity=".5" stroke-linecap="round"/>'}</g>
    <path d="M32 26 C34 8 50 2 66 4 C82 6 90 14 94 26 C84 20 72 18 58 20 C46 22 38 24 32 26Z" fill="url(#${p}bo)" stroke="#10163a" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M32 26 C40 22 50 20 60 20 C72 20 84 22 94 26 L94 30 C84 26 72 24 60 24 C48 24 40 26 32 30Z" fill="#c8cce8" stroke="#5a4a3a" stroke-width="1"/>
    <g class="b-queue" style="transform-origin:0% 0%;animation-duration:3.4s"><path d="M86 12 C96 8 106 14 110 26 C104 22 96 20 90 20Z" fill="url(#${p}bo)" stroke="#10163a" stroke-width="1.3" stroke-linejoin="round"/><path d="M110 22 l1.6 3.6 l3.8 .4 l-2.9 2.5 l.9 3.8 l-3.4 -2 l-3.4 2 l.9 -3.8 l-2.9 -2.5 l3.8 -.4z" fill="#f6d86a" stroke="#8a6a18" stroke-width=".8" stroke-linejoin="round"/></g>`; }
});
})();
/* Boss du Rodage, lot 2 : hydre, necro, gargouille, mimique, dragon, archidemon (redessinés, 19/11/2026).
   Même format que BOSS_DESSINS : p => svg, viewBox 120×130 (sol vers y 124), tête au centre-haut (x≈60, y≈6)
   pour que la couronne, les cornes et l'œil des stades II/III tombent juste. Parties animées : classes b-* existantes. */
(function () {
const mini = p => /^bmini/.test(p);
/* trait épais en 3 couches (contour, couleur, reflet) : cous, bras, queues */
const TRAIT = (d, w, cont, coul, refl, cls) => `<g${cls ? ` class="${cls}"` : ''}><path d="${d}" stroke="${cont}" stroke-width="${w + 2.4}" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${coul}" stroke-width="${w}" fill="none" stroke-linecap="round"/>${refl ? `<path d="${d}" stroke="${refl}" stroke-width="${Math.max(1, w * .16)}" fill="none" stroke-linecap="round" opacity=".5" transform="translate(-1 -1.2)"/>` : ''}</g>`;

/* ---------- Hydre (les notifications) : tête de reptile à collerette, regard vers +x, cou en (-6, 2) ---------- */
const TETE_HYDRE = (p, ouv) => `
  <path d="M-4 -6 L-15 -19 L-9.6 -9 L-21 -10 L-11 -3.4 L-19 3 L-6 1.6Z" fill="url(#${p}f)" stroke="#5a2a08" stroke-width="1" stroke-linejoin="round"/>
  <path d="M-6 -5 L-13 -15 M-7 -3 L-17 -8 M-7 0 L-15 2" stroke="#8a4a12" stroke-width=".8" fill="none"/>
  <path d="M-3 4 Q9 ${8 + ouv} 21 ${5 + ouv} Q21.6 ${8.6 + ouv} 17 ${10 + ouv} Q5 ${11.6 + ouv} -4 8Z" fill="url(#${p}v)" stroke="#062428" stroke-width="1.1" stroke-linejoin="round"/>
  <path d="M0 2.4 L23.6 1 L20 ${5.4 + ouv} Q9 ${7.6 + ouv} 0 5Z" fill="#4a0c22"/>
  <path d="M5 2.6 l1 2.4 l1 -2.4 M10 2.4 l1 2.4 l1 -2.4 M15 2 l.9 2.2 l.9 -2.2 M8 ${7.6 + ouv} l.9 -2.2 l.9 2.2 M14 ${7.2 + ouv} l.8 -2 l.8 2" fill="#fff8e8"/>
  <path d="M-9 2 C-10 -6 -3.6 -11.4 5 -10.4 C11 -9.6 15 -7 22 -5.2 Q27.4 -4 26.8 -.8 Q26.2 1.8 22 2 L2 2.8 C-1 5.4 -7.6 5.4 -9 2Z" fill="url(#${p}a)" stroke="#062428" stroke-width="1.2" stroke-linejoin="round"/>
  <path d="M-1 -8.4 L-6 -17 L3 -9.6Z" fill="#f2ead2" stroke="#4a3a20" stroke-width=".8" stroke-linejoin="round"/>
  <path d="M1 -8 Q9 -10.4 18 -6" stroke="#c8fff0" stroke-width="1.1" fill="none" opacity=".5" stroke-linecap="round"/>
  <path d="M8 -2 q2 1.4 4 0 M13 -1.6 q2 1.4 4 0" stroke="#0f4f58" stroke-width=".7" fill="none" opacity=".7"/>
  <ellipse cx="23.4" cy="-2.6" rx="1.3" ry=".9" fill="#062428"/>
  <circle cx="5" cy="-4.4" r="4.2" fill="url(#${p}g)" class="b-lueur"/>
  <g class="b-oeil"><path d="M1.6 -4.4 Q5 -7.4 8.4 -4.4 Q5 -2 1.6 -4.4Z" fill="#ffe14a" stroke="#3a2a06" stroke-width=".5"/><ellipse cx="5.2" cy="-4.5" rx=".7" ry="1.7" fill="#1a0a04"/></g>
  <path d="M.6 -6.6 L9.4 -8.4" stroke="#062428" stroke-width="1.7" stroke-linecap="round"/>`;
const BADGE = (x, y, t, r) => `<g class="b-badge b-fixe"><circle cx="${x}" cy="${y}" r="${r}" fill="#e5383b" stroke="#fff4f0" stroke-width="1.3"/>${t ? `<text x="${x}" y="${y + r * .38}" font-size="${r * 1.05}" text-anchor="middle" fill="#fff" font-weight="800" font-family="system-ui,sans-serif">${t}</text>` : ''}</g>`;

/* ---------- Mimique : rangée de dents ---------- */
const DENTS = (x0, x1, y, h, bas) => { let d = ''; const n = Math.round((x1 - x0) / 7); const w = (x1 - x0) / n;
  for (let i = 0; i < n; i++) { const x = x0 + i * w, hh = h * (i % 3 === 1 ? 1.35 : 1); d += `M${x.toFixed(1)} ${y} L${(x + w / 2).toFixed(1)} ${(y + (bas ? -hh : hh)).toFixed(1)} L${(x + w).toFixed(1)} ${y}Z`; } return d; };

Object.assign(BOSS_DESSINS, {
  hydre: p => `
    <defs><radialGradient id="${p}a" cx="40%" cy="30%" r="80%"><stop offset="0" stop-color="#9eeedc"/><stop offset=".55" stop-color="#2f9e96"/><stop offset="1" stop-color="#0e4a54"/></radialGradient>
      <linearGradient id="${p}c" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1c6e72"/><stop offset=".45" stop-color="#3fb4a8"/><stop offset="1" stop-color="#16585e"/></linearGradient>
      <linearGradient id="${p}v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6f4d0"/><stop offset="1" stop-color="#b4cf98"/></linearGradient>
      <linearGradient id="${p}f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe08a"/><stop offset=".6" stop-color="#e8a23a"/><stop offset="1" stop-color="#a85a14"/></linearGradient>
      <radialGradient id="${p}g" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffe14a" stop-opacity=".7"/><stop offset="1" stop-color="#ffe14a" stop-opacity="0"/></radialGradient>
      <radialGradient id="${p}w" cx="50%" cy="35%" r="65%"><stop offset="0" stop-color="#2a7a8a"/><stop offset=".7" stop-color="#0f3a4a"/><stop offset="1" stop-color="#0a2430" stop-opacity="0"/></radialGradient></defs>
    <ellipse cx="60" cy="117" rx="60" ry="12" fill="url(#${p}w)"/>
    ${TRAIT('M26 112 C12 112 6 100 12 90 C14 86 18 86 18 90', 6, '#062428', `url(#${p}c)`, '#c8fff0', 'b-queue')}
    <path d="M18 118 C14 100 28 84 46 82 L74 82 C92 84 106 100 102 118Z" fill="url(#${p}a)" stroke="#062428" stroke-width="1.8"/>
    ${[[28, 94, -30], [36, 87, -15], [84, 87, 15], [92, 94, 30]].map(([x, y, r]) => `<path transform="translate(${x} ${y}) rotate(${r})" d="M-3.6 1 L0 -7 L3.6 1Z" fill="url(#${p}f)" stroke="#5a2a08" stroke-width=".9" stroke-linejoin="round"/>`).join('')}
    <path d="M38 118 C38 104 47 96 60 96 C73 96 82 104 82 118Z" fill="url(#${p}v)" stroke="#062428" stroke-width="1.2"/>
    <path d="M42 108 Q60 101 78 108 M40 114 Q60 107 80 114" stroke="#7a9a6a" stroke-width="1" fill="none"/>
    ${[[-1, 'M46 96 C40 80 42 62 30 48', 'translate(28 44) scale(-.92 .92) rotate(-14)', 'b-tete-a', 0], [1, 'M74 96 C80 80 78 62 90 48', 'translate(92 44) scale(.92) rotate(-14)', 'b-tete-c', 0],
       [0, 'M60 94 C64 72 52 52 54 30', 'translate(54 24) rotate(-24) scale(1.12)', '', 3.4]].map(([s, d, tr, c, ouv]) => `<g class="b-tete ${c}">
      ${TRAIT(d, 10.6, '#062428', `url(#${p}c)`, '')}
      <path d="${d}" stroke="url(#${p}v)" stroke-width="3.6" fill="none" stroke-linecap="round" transform="translate(${s >= 0 ? 1.6 : -1.6} 1.4)"/>
      <path d="${d}" stroke="#c8fff0" stroke-width="1.3" fill="none" stroke-linecap="round" opacity=".4" transform="translate(${s >= 0 ? -2.6 : 2.6} -.6)"/>
      <g transform="${tr}">${TETE_HYDRE(p, ouv)}</g>
      ${s === 0 ? (mini(p) ? BADGE(36, 12, '', 4.6) : BADGE(34, 10, '99+', 6.6)) : mini(p) ? '' : BADGE(s < 0 ? 15 : 105, 30, s < 0 ? '3' : '12', 5)}</g>`).join('')}
    ${mini(p) ? '' : `<g class="b-onde" stroke="#ffe3a8" stroke-width="1.5" fill="none" stroke-linecap="round"><path d="M92 4 q4 5 0 10"/><path d="M97 1 q6 8 0 16" opacity=".6"/></g>`}
    <path d="M4 118 Q22 112 40 117 Q60 121 80 117 Q98 112 116 118 Q114 126 60 127 Q6 126 4 118Z" fill="#0d3644" opacity=".88"/>
    <g stroke="#bfeef2" stroke-width="1.2" fill="none" stroke-linecap="round" opacity=".7"><path d="M10 119 q5 -2.4 10 0 M30 121 q5 -2.4 10 0 M80 121 q5 -2.4 10 0 M100 119 q5 -2.4 10 0"/></g>
    <g class="b-volute" fill="#bfeef2"><circle cx="24" cy="113" r="1.6"/><circle cx="98" cy="111" r="1.3"/><circle cx="102" cy="104" r=".9"/></g>`,

  necro: p => `
    <defs><linearGradient id="${p}r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c8506a"/><stop offset=".5" stop-color="#8a2440"/><stop offset="1" stop-color="#4a0e22"/></linearGradient>
      <linearGradient id="${p}d" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6a1a32"/><stop offset=".5" stop-color="#a8345a"/><stop offset="1" stop-color="#5a1428"/></linearGradient>
      <linearGradient id="${p}i" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a0c1e"/><stop offset="1" stop-color="#1e0610"/></linearGradient>
      <radialGradient id="${p}s" cx="45%" cy="35%" r="70%"><stop offset="0" stop-color="#f4f4f2"/><stop offset=".7" stop-color="#d0d0ce"/><stop offset="1" stop-color="#909094"/></radialGradient>
      <linearGradient id="${p}o" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f4f6"/><stop offset=".55" stop-color="#b4b4bc"/><stop offset="1" stop-color="#5e5e68"/></linearGradient>
      <linearGradient id="${p}b" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4a2a14"/><stop offset=".5" stop-color="#9a6a3a"/><stop offset="1" stop-color="#3a1e0c"/></linearGradient>
      <radialGradient id="${p}g" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#d6ffb0"/><stop offset=".45" stop-color="#7aff5a" stop-opacity=".55"/><stop offset="1" stop-color="#7aff5a" stop-opacity="0"/></radialGradient></defs>
    <ellipse cx="58" cy="122" rx="40" ry="5" fill="#000" opacity=".45"/>
    <path d="M60 30 C44 32 36 46 34 62 C32 80 26 98 20 120 H100 C94 98 88 80 86 62 C84 46 76 32 60 30Z" fill="url(#${p}r)" stroke="#2a0612" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M52 44 L48 120 H72 L68 44Z" fill="url(#${p}i)" opacity=".85"/>
    <path d="M51 46 L47 120 M69 46 L73 120" stroke="url(#${p}o)" stroke-width="1.8"/>
    <path d="M20 120 H100 L99 116 H21Z" fill="url(#${p}o)" stroke="#3a3a42" stroke-width=".8"/>
    <path d="M40 70 C38 90 32 104 28 116 M80 70 C82 90 88 104 92 116" stroke="#e0809a" stroke-width="1.1" fill="none" opacity=".5"/>
    <path d="M46 50 C36 44 30 30 32 12 C38 20 44 26 50 32Z M74 50 C84 44 90 30 88 12 C82 20 76 26 70 32Z" fill="url(#${p}d)" stroke="#2a0612" stroke-width="1.5" stroke-linejoin="round"/><path d="M45 46 C38 40 34 30 34 18 M75 46 C82 40 86 30 86 18" stroke="url(#${p}o)" stroke-width="1.2" fill="none"/>
    <path d="M49 22 C46 28 46 36 48 42 M71 22 C74 28 74 36 72 42" stroke="#eeeeee" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".9"/>
    <path d="M60 12 C52 12 48 18 48 26 C48 34 52 40 56 44 L60 50 L64 44 C68 40 72 34 72 26 C72 18 68 12 60 12Z" fill="url(#${p}s)" stroke="#3a2a2e" stroke-width="1.4"/>
    <path d="M56 44 L60 58 L64 44 Q60 47 56 44Z" fill="#e8e2de" stroke="#3a2a2e" stroke-width="1" stroke-linejoin="round"/><path d="M60 48 V56" stroke="#9a8c90" stroke-width=".8"/>
    <path d="M49 30 Q54 34 58 31 M71 30 Q66 34 62 31" stroke="#8a7a80" stroke-width="1" fill="none"/>
    <path d="M51 38 Q54 40 55 37 M69 38 Q66 40 65 37" stroke="#8a7a80" stroke-width=".8" fill="none"/>
    <path d="M50 24.6 L57 26.6 M70 24.6 L63 26.6" stroke="#2a1a1e" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="54" cy="28.6" r="4.6" fill="url(#${p}g)" class="b-lueur"/><circle cx="66" cy="28.6" r="4.6" fill="url(#${p}g)" class="b-lueur"/>
    <g class="b-oeil"><path d="M51 28.6 Q54 26.4 57 28.8 Q54 30.4 51 28.6Z M63 28.8 Q66 26.4 69 28.6 Q66 30.4 63 28.8Z" fill="#c8ff9a" stroke="#2a1a1e" stroke-width=".5"/><circle cx="54" cy="28.6" r=".8" fill="#1a3a0a"/><circle cx="66" cy="28.6" r=".8" fill="#1a3a0a"/></g>
    <path d="M60 30 L58.6 35 L60.6 35.6" stroke="#8a7a80" stroke-width=".9" fill="none"/><path d="M56 40 Q60 41.4 64 40" stroke="#5a2a32" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    <path d="M52 14 Q60 10 68 14" stroke="#ffffff" stroke-width="1.2" fill="none" opacity=".5" stroke-linecap="round"/>
    <g class="b-bras-g"><path d="M38 60 Q26 58 22 46" stroke="#2a0612" stroke-width="9.4" fill="none" stroke-linecap="round"/><path d="M38 60 Q26 58 22 46" stroke="url(#${p}d)" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M21 44 l-3 -5 M22 43 l-.6 -6 M24 43 l2 -5.4 M20 46 l-5 -1.4" stroke="url(#${p}s)" stroke-width="1.9" fill="none" stroke-linecap="round"/>
      <circle cx="18" cy="32" r="12" fill="url(#${p}g)" class="b-lueur"/></g>
    <g class="b-orbite"><g transform="translate(4 14)"><path d="M4 0 H24 Q28 0 28 4 V12 Q28 16 24 16 H17 Q15 22 11 25 Q13 20 11 16 H4 Q0 16 0 12 V4 Q0 0 4 0Z" fill="#e6ffd8" fill-opacity=".92" stroke="#4a8a3a" stroke-width="1.1"/>
      <circle cx="8" cy="8" r="1.8" fill="#4a8a3a"/><circle cx="14" cy="8" r="1.8" fill="#4a8a3a"/><circle cx="20" cy="8" r="1.8" fill="#4a8a3a"/></g></g>
    <g class="b-bras-d"><path d="M82 60 Q94 64 96 76" stroke="#2a0612" stroke-width="9.4" fill="none" stroke-linecap="round"/><path d="M82 60 Q94 64 96 76" stroke="url(#${p}d)" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M93 64 h7 v14 h-7z" fill="url(#${p}b)" stroke="#2a1606" stroke-width="1"/><ellipse cx="96.5" cy="63" rx="5" ry="3.4" fill="url(#${p}b)" stroke="#2a1606" stroke-width="1"/>
      <path d="M93 76 q3.5 3 7 0" stroke="url(#${p}s)" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M84 78 H110 L112 90 H82Z" fill="url(#${p}o)" stroke="#3a3a42" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M82 90 H112 V93 H82Z" fill="#7a1a2a" stroke="#3a0812" stroke-width="1"/>
      ${mini(p) ? '' : '<text x="97" y="88.4" font-size="8.4" text-anchor="middle" fill="#7a1a2a" font-family="Georgia,serif" font-weight="700">VU</text>'}</g>
    ${mini(p) ? '' : `<g class="b-volute"><g transform="translate(88 104) rotate(-8)"><rect width="26" height="16" rx="2" fill="#f4ecdc" stroke="#8a7656" stroke-width="1"/><path d="M0 0 L13 9 L26 0" stroke="#8a7656" stroke-width="1" fill="none"/>
      <circle cx="13" cy="10" r="4.4" fill="#b8243e" stroke="#6a0e1e" stroke-width=".8"/><text x="13" y="12" font-size="4.6" text-anchor="middle" fill="#ffe4e8" font-family="Georgia,serif" font-weight="700">VU</text></g></g>`}`
});
})();
(function () {
const etoile4 = (x, y, r, c) => `<path d="M${x} ${y - r} L${x + r * .28} ${y - r * .28} L${x + r} ${y} L${x + r * .28} ${y + r * .28} L${x} ${y + r} L${x - r * .28} ${y + r * .28} L${x - r} ${y} L${x - r * .28} ${y - r * .28} Z" fill="${c}"/>`;
Object.assign(BOSS_DESSINS, {
  procrastination: p => `
    <defs>
      <radialGradient id="${p}c" cx="42%" cy="28%" r="85%"><stop offset="0" stop-color="#dcc6ff"/><stop offset=".5" stop-color="#9a6ee6"/><stop offset="1" stop-color="#4a2a8e"/></radialGradient>
      <linearGradient id="${p}v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#efe4ff"/><stop offset="1" stop-color="#b49ae8"/></linearGradient>
      <linearGradient id="${p}o" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9a6a14"/><stop offset=".45" stop-color="#ffe08a"/><stop offset="1" stop-color="#8a5a10"/></linearGradient>
      <linearGradient id="${p}g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#cdb8ff" stop-opacity=".6"/><stop offset=".4" stop-color="#ffffff" stop-opacity=".16"/><stop offset="1" stop-color="#7a5ad0" stop-opacity=".55"/></linearGradient>
      <linearGradient id="${p}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0b8"/><stop offset="1" stop-color="#d9a238"/></linearGradient>
      <radialGradient id="${p}h" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#b68cff" stop-opacity=".42"/><stop offset="1" stop-color="#b68cff" stop-opacity="0"/></radialGradient>
    </defs>
    <circle cx="60" cy="66" r="58" fill="url(#${p}h)"/>
    <ellipse cx="60" cy="124" rx="54" ry="4.5" fill="#000" opacity=".4"/>
    <path d="M0 123 Q10 119 22 121" stroke="#e6d6ff" stroke-width="2.2" fill="none" opacity=".35" stroke-linecap="round"/>
    <g class="b-lueur">${etoile4(10, 108, 3.2, '#f2dcff')}${etoile4(20, 96, 2.2, '#ffe08a')}</g>
    <!-- corps de limace mauve : queue effilée, dos bosselé, grosse tête ronde qui s'avance -->
    <path d="M3 121 C10 118 18 110 28 104 C40 98 70 96 88 97 C92 88 98 72 107 71 C115 70 120 79 119 90 C118 102 116 112 112 119 C110 122 106 123 100 123 L10 123 C6 123 3 122 3 121 Z" fill="url(#${p}c)" stroke="#2a1452" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M12 121.4 C40 119 80 119 110 120" stroke="#e6d6ff" stroke-width="1.6" fill="none" opacity=".55" stroke-linecap="round"/>
    <path d="M22 106 C38 99 66 98 84 99" stroke="#f3eaff" stroke-width="2.4" fill="none" opacity=".5" stroke-linecap="round"/>
    <path d="M99 84 C100 78 103 75 108 74.4" stroke="#f3eaff" stroke-width="2" fill="none" opacity=".55" stroke-linecap="round"/>
    <g fill="#4a2a8e" opacity=".5"><ellipse cx="30" cy="110" rx="4" ry="1.8"/><ellipse cx="52" cy="108" rx="5.4" ry="2.1"/><ellipse cx="74" cy="109" rx="3.6" ry="1.7"/><ellipse cx="94" cy="110" rx="2.6" ry="1.6"/></g>
    <!-- visage : sourire satisfait, joue rose -->
    <path d="M103 93 q5 4.4 10.5 -.6" stroke="#2a1452" stroke-width="1.9" fill="none" stroke-linecap="round"/>
    <ellipse cx="114.6" cy="88.4" rx="2.8" ry="1.7" fill="#ff9ad0" opacity=".55"/>
    <!-- yeux au bout des cornes, mi-clos -->
    ${[[101, 75, 95, 50, 'b-tete-a', -1], [110, 74, 113, 52, 'b-tete-c', 1]].map(([bx, by, ex, ey, cl, s]) => `
    <g class="b-tete ${cl}"><path d="M${bx} ${by} C${bx + s * -1} ${by - 10} ${ex - s * 1} ${ey + 10} ${ex} ${ey}" stroke="#2a1452" stroke-width="5.4" fill="none" stroke-linecap="round"/>
      <path d="M${bx} ${by} C${bx + s * -1} ${by - 10} ${ex - s * 1} ${ey + 10} ${ex} ${ey}" stroke="#a884ee" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      <g class="b-cligne"><circle cx="${ex}" cy="${ey}" r="5.6" fill="#fffaf0" stroke="#2a1452" stroke-width="1.3"/><circle cx="${ex - 1.2}" cy="${ey + 1.6}" r="2.5" fill="#24104a"/><circle cx="${ex - .4}" cy="${ey + .9}" r=".8" fill="#fff"/>
        <path d="M${ex - 5.6} ${ey - .2} A5.6 5.6 0 0 1 ${ex + 5.6} ${ey - .2} Q${ex} ${ey + 1.8} ${ex - 5.6} ${ey - .2} Z" fill="url(#${p}c)" stroke="#2a1452" stroke-width="1.2" stroke-linejoin="round"/></g></g>`).join('')}
    <!-- le sablier porté comme une maison : or, verre, sable qui coule, montre de gousset -->
    <g class="b-fixe"><g transform="rotate(-4 60 92)">
      <path d="M40 16 H80 C80 36 66 42 62 50 C66 58 80 64 80 84 H40 C40 64 54 58 58 50 C54 42 40 36 40 16 Z" fill="url(#${p}g)" stroke="#efe4ff" stroke-width="1.3"/>
      <path d="M44 25 Q60 28.5 76 25 C74 35 64 41.5 61 48 H59 C56 41.5 46 35 44 25 Z" fill="url(#${p}s)"/>
      <path class="b-sable" d="M60 48 V78" stroke="#fff0b8" stroke-width="1.6" stroke-dasharray="2 3"/>
      <path d="M42 84 C44 76 52 71.5 60 70 C68 71.5 76 76 78 84 Z" fill="url(#${p}s)" stroke="#b8861c" stroke-width=".6"/>
      <path d="M44.5 20 C45.5 30 50 36 55 42" stroke="#fff" stroke-width="2" fill="none" opacity=".55" stroke-linecap="round"/><path d="M45 79 C46 72 49.5 66 54 62" stroke="#fff" stroke-width="1.6" fill="none" opacity=".35" stroke-linecap="round"/>
      ${[33, 83].map(x => `<rect x="${x}" y="15" width="4.4" height="70" rx="1.6" fill="url(#${p}o)" stroke="#5a3a0c" stroke-width=".9"/><path d="M${x} 24 l4.4 3 M${x} 36 l4.4 3 M${x} 48 l4.4 3 M${x} 60 l4.4 3 M${x} 72 l4.4 3" stroke="#6a4a10" stroke-width=".8"/>`).join('')}
      <rect x="29" y="83" width="62" height="9" rx="3" fill="url(#${p}o)" stroke="#5a3a0c" stroke-width="1.4"/><rect x="32" y="86.6" width="56" height="1.6" fill="#fff2c0" opacity=".45"/>
      <rect x="31" y="8" width="58" height="8.4" rx="3" fill="url(#${p}o)" stroke="#5a3a0c" stroke-width="1.4"/><rect x="34" y="10.6" width="52" height="1.5" fill="#fff2c0" opacity=".45"/>
      <ellipse cx="60" cy="7" rx="5" ry="2.4" fill="url(#${p}o)" stroke="#5a3a0c" stroke-width="1"/>
      <circle cx="60" cy="87.4" r="2.4" fill="#b48cff" stroke="#3a1c6a" stroke-width=".8"/>
      <path d="M31 12 h-3.4 v2" stroke="#5a3a0c" stroke-width="1.4" fill="none" stroke-linecap="round"/>
      <g class="b-pend"><path d="M27.6 14 V33" stroke="#e8c25a" stroke-width="1.2" stroke-dasharray="1.6 1"/>
        <circle cx="27.6" cy="41" r="7.6" fill="url(#${p}o)" stroke="#5a3a0c" stroke-width="1.2"/><circle cx="27.6" cy="41" r="5.6" fill="#f8efd8" stroke="#8a6a1c" stroke-width=".6"/>
        <rect x="26.4" y="31.6" width="2.4" height="2.4" rx=".6" fill="#e8c25a" stroke="#5a3a0c" stroke-width=".6"/>
        <path d="M27.6 41 v-3.6" stroke="#2a1452" stroke-width="1.4" stroke-linecap="round"/><path class="b-aiguille" d="M27.6 41 V36.6" stroke="#8a2a5a" stroke-width=".9" stroke-linecap="round"/><circle cx="27.6" cy="41" r=".9" fill="#2a1452"/></g>
    </g></g>`,

  dissipation: p => `
    <defs>
      <linearGradient id="${p}t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d4fff2"/><stop offset=".35" stop-color="#6eecc8"/><stop offset=".8" stop-color="#22a888"/><stop offset="1" stop-color="#147a68" stop-opacity=".55"/></linearGradient>
      <linearGradient id="${p}b" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#147a68"/><stop offset=".5" stop-color="#7ff0d0"/><stop offset="1" stop-color="#147a68"/></linearGradient>
      <radialGradient id="${p}o" cx="40%" cy="35%" r="65%"><stop offset="0" stop-color="#fff2b0"/><stop offset=".6" stop-color="#e8b83a"/><stop offset="1" stop-color="#8a6a12"/></radialGradient>
      <radialGradient id="${p}l" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff6a8" stop-opacity=".9"/><stop offset="1" stop-color="#fff6a8" stop-opacity="0"/></radialGradient>
      <radialGradient id="${p}h" cx="50%" cy="45%" r="50%"><stop offset="0" stop-color="#5ae6be" stop-opacity=".3"/><stop offset="1" stop-color="#5ae6be" stop-opacity="0"/></radialGradient>
    </defs>
    <circle cx="60" cy="58" r="58" fill="url(#${p}h)"/>
    <ellipse cx="60" cy="124" rx="24" ry="3.2" fill="#000" opacity=".35"/>
    <ellipse class="b-onde" style="animation-duration:2.6s" cx="60" cy="122" rx="20" ry="3.6" fill="none" stroke="#9ff5dc" stroke-width="1.6"/>
    <g class="b-fixe3">
    <!-- la tornade : tête large en haut, pointe qui tourne au sol -->
    <path d="M22 30 C22 11 98 11 98 30 C98 44 86 50 78 58 C72 70 68 86 65 100 C63 110 62 117 60 123 C58 117 57 110 55 100 C52 86 48 70 42 58 C34 50 22 44 22 30 Z" fill="url(#${p}t)" stroke="#0a4a3e" stroke-width="1.8" stroke-linejoin="round"/>
    <g fill="none" stroke-linecap="round">
      <path d="M36 55 Q60 66 84 53" stroke="#0e5a4c" stroke-width="2" opacity=".35"/><path d="M47 76 Q60 82 73 74" stroke="#0e5a4c" stroke-width="1.8" opacity=".3"/>
      ${[['M29 49 Q60 61 91 47', 2.6, 0], ['M43 66 Q60 73 77 63', 2.2, -.7], ['M50 84 Q60 89 70 81', 1.9, -1.4], ['M54.5 98 Q60 101 66 96', 1.6, -2], ['M57.5 110 Q60 112 62.5 109', 1.3, -.3]].map(([d, w, t]) => `<path class="b-vent" style="animation-delay:${t}s" d="${d}" stroke="#effffa" stroke-width="${w}"/>`).join('')}
    </g>
    <path d="M30 26 C32 18 40 14 50 14" stroke="#fff" stroke-width="2.6" fill="none" opacity=".55" stroke-linecap="round"/>
    <!-- mèches de vent sur le haut du crâne -->
    <g class="b-volute" stroke="#c8fff0" stroke-width="3" fill="none" stroke-linecap="round"><path d="M42 16 C38 9 43 3 50 6"/><path d="M60 12.5 C59 5 66 1 72 5"/><path d="M78 16 C82 9 89 9 90 15"/></g>
    <!-- visage : deux yeux qui ne regardent jamais au même endroit -->
    <g class="b-cligne"><ellipse cx="47" cy="30" rx="7.4" ry="8.4" fill="#fbfffd" stroke="#0a4a3e" stroke-width="1.4"/>
      <g class="b-regard"><circle cx="43.8" cy="31.6" r="3.6" fill="#0a2a26"/><circle cx="42.8" cy="30.4" r="1.2" fill="#fff"/></g></g>
    <g class="b-cligne" style="animation-delay:-.25s"><ellipse cx="73" cy="30" rx="7.4" ry="8.4" fill="#fbfffd" stroke="#0a4a3e" stroke-width="1.4"/>
      <g class="b-regard" style="animation-delay:-2.6s"><circle cx="76.4" cy="27" r="3.6" fill="#0a2a26"/><circle cx="75.4" cy="25.8" r="1.2" fill="#fff"/></g></g>
    <path d="M38 19 q7 -5.4 14 -1.4 M68 17.6 q7 -4 14 1.4" stroke="#0a4a3e" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M50 41 Q60 51 70 41 Q60 45 50 41 Z" fill="#0a3a32" stroke="#0a3a32" stroke-width="1.2" stroke-linejoin="round"/><ellipse cx="60" cy="45.4" rx="3.6" ry="1.7" fill="#ff8aa8"/>
    <ellipse cx="38.6" cy="39.6" rx="3.4" ry="2" fill="#ff9ac0" opacity=".5"/><ellipse cx="81.4" cy="39.6" rx="3.4" ry="2" fill="#ff9ac0" opacity=".5"/>
    <!-- bras de vent qui attrapent tout ce qui brille -->
    <g class="b-bras-g"><path d="M30 46 C18 52 8 48 10 34" stroke="#0a4a3e" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M30 46 C18 52 8 48 10 34" stroke="url(#${p}b)" stroke-width="4.6" fill="none" stroke-linecap="round"/>
      <path d="M10 34 l-3.4 -4.6 M10 34 l-.4 -6 M10 34 l3 -4.6" stroke="#0a4a3e" stroke-width="3.4" stroke-linecap="round"/><path d="M10 34 l-3.4 -4.6 M10 34 l-.4 -6 M10 34 l3 -4.6" stroke="#bff8e6" stroke-width="1.8" stroke-linecap="round"/></g>
    <g class="b-bras-d"><path d="M90 46 C104 52 112 60 106 70" stroke="#0a4a3e" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M90 46 C104 52 112 60 106 70" stroke="url(#${p}b)" stroke-width="4.6" fill="none" stroke-linecap="round"/>
      <path d="M106 70 l-4.4 2.6 M106 70 l-1 4.6 M106 70 l3 3.6" stroke="#0a4a3e" stroke-width="3.4" stroke-linecap="round"/><path d="M106 70 l-4.4 2.6 M106 70 l-1 4.6 M106 70 l3 3.6" stroke="#bff8e6" stroke-width="1.8" stroke-linecap="round"/></g>
    <!-- les distractions : papillon, clochette, pièce, luciole, feuilles emportées -->
    <g transform="translate(12 18)"><g class="b-aile-g"><path d="M0 0 C-6 -8 -12 -4 -9 1 C-12 5 -6 9 0 1 Z" fill="#ff8ac0" stroke="#7a1a4a" stroke-width=".9"/></g><g class="b-aile-d"><path d="M0 0 C6 -8 12 -4 9 1 C12 5 6 9 0 1 Z" fill="#7ac8ff" stroke="#1a4a7a" stroke-width=".9"/></g><path d="M0 -4 V4" stroke="#2a1a2a" stroke-width="1.4" stroke-linecap="round"/></g>
    <g class="b-pend" style="animation-duration:1.6s"><path d="M104 74 V77" stroke="#8a6a12" stroke-width="1.2"/><path d="M98 88 C98 80 100 77 104 77 C108 77 110 80 110 88 L112 90 H96 Z" fill="url(#${p}o)" stroke="#6a4a10" stroke-width="1.1" stroke-linejoin="round"/><circle cx="104" cy="91.4" r="1.8" fill="#8a6a12"/><path d="M100.4 81 q1 -2 3 -2.4" stroke="#fff6c8" stroke-width="1.1" fill="none" stroke-linecap="round"/></g>
    <g class="b-orbite"><g transform="translate(18 82)"><g class="b-piece"><circle r="6" fill="url(#${p}o)" stroke="#6a4a10" stroke-width="1.1"/><circle r="3.7" fill="none" stroke="#8a6a12" stroke-width=".8"/>${etoile4(0, 0, 2.2, '#fff2b0')}</g></g></g>
    <g class="b-lueur"><circle cx="102" cy="22" r="7" fill="url(#${p}l)"/><circle cx="102" cy="22" r="2" fill="#fffbd8"/></g>
    <g class="b-orbite" style="animation-duration:4s"><path d="M30 70 q4 -5 8 -1 q-4 4 -8 1 Z" fill="#8ad06a" stroke="#2a5a2a" stroke-width=".7"/><path d="M86 96 q4 -5 8 -1 q-4 4 -8 1 Z" fill="#e8a24a" stroke="#6a3a10" stroke-width=".7"/><path d="M26 102 q3 -4 6 -1 q-3 3 -6 1 Z" fill="#ff8ac0" opacity=".8"/></g>
    </g>`
});
})();
/* Chaque boss a sa façon de bouger (respiration lourde, flottement, ondulation…) ; certaines parties s'animent aussi */
const BOSS_MOUV = { golem: 'lourd', liche: 'flotte', spectre: 'flotte', basilic: 'ondule', harpie: 'vole', troll: 'lourd', hydre: 'balance', necro: 'flotte',
  gargouille: 'lourd', mimique: 'claque', dragon: 'respire', archidemon: 'respire', procrastination: 'balance', dissipation: 'flotte', oubli: 'flotte', fatigue: 'flotte', doute: 'flotte', tentation: 'balance' };
const BOSS_AURA = { golem: '255,154,60', liche: '63,224,176', spectre: '160,190,255', basilic: '140,220,90', harpie: '200,120,255', troll: '120,170,110', hydre: '80,200,200', necro: '150,255,110',
  gargouille: '255,140,60', mimique: '255,200,80', dragon: '120,160,255', archidemon: '255,70,50', procrastination: '190,140,255', dissipation: '90,230,190', oubli: '230,230,255', fatigue: '170,180,220', doute: '230,90,90', tentation: '255,120,170' };
function bossSvg(cle, id, b) {
  const f = BOSS_DESSINS[cle] || BOSS_DESSINS.golem;
  // Stades II et III (nouvelles règles) : couleur décalée + attribut dessiné par-dessus
  const st = b && b.stade > 1 ? b : null, p = 'b' + (id || cle) + 's';
  const filtre = st && st.teinte ? ` style="filter:hue-rotate(${Number(st.teinte) || 0}deg) saturate(1.25)"` : '';
  const haut = st && /couronne|cornes|yeux/.test(st.attribut) ? 14 : 0;
  return `<svg viewBox="0 ${-haut} 120 ${130 + haut}" class="boss-svg mv-${BOSS_MOUV[cle] || 'respire'}${st ? ' stade' + st.stade : ''}" style="--aura:${BOSS_AURA[cle] || '255,120,90'}${st && st.teinte ? `;--tinv:${-(Number(st.teinte) || 0)}deg` : ''}" aria-hidden="true">${st ? attributBoss(st.attribut, p, 'fond') : ''}<g class="b-corps"><g${filtre}>${f('b' + (id || cle))}</g>${st ? attributBoss(st.attribut, p, 'dessus') : ''}</g></svg>`;
}
/** Attribut d'un boss évolué : aura (derrière), couronne, cornes ou œil de feu (au-dessus de la tête) */
function attributBoss(a, p, couche) {
  if (a === 'aura') return couche === 'fond' ? `<defs><radialGradient id="${p}au"><stop offset=".55" style="stop-color:rgb(var(--aura));stop-opacity:0"/><stop offset=".8" style="stop-color:rgb(var(--aura));stop-opacity:.45"/><stop offset="1" style="stop-color:rgb(var(--aura));stop-opacity:0"/></radialGradient></defs>
    <ellipse class="b-aura" cx="60" cy="72" rx="62" ry="64" fill="url(#${p}au)"/>` : '';
  if (couche === 'fond') return '';
  if (a === 'couronne') return `<g class="b-attr"><path d="M44 2 L48 -10 L54 -2 L60 -13 L66 -2 L72 -10 L76 2 Z" fill="#f2c94c" stroke="#7a5512" stroke-width="1.4" stroke-linejoin="round"/>
    <circle cx="60" cy="-4" r="2.2" fill="#e0475a"/><circle cx="50" cy="-2" r="1.5" fill="#5ab0ff"/><circle cx="70" cy="-2" r="1.5" fill="#5ab0ff"/></g>`;
  if (a === 'cornes') return `<g class="b-attr" fill="#e8dcc0" stroke="#5a4630" stroke-width="1.3" stroke-linejoin="round">
    <path d="M40 8 C30 2 26 -8 30 -13 C32 -4 38 0 46 4 Z"/><path d="M80 8 C90 2 94 -8 90 -13 C88 -4 82 0 74 4 Z"/></g>`;
  if (a === 'yeux') return `<g class="b-attr"><path d="M44 -3 Q60 -16 76 -3 Q60 10 44 -3 Z" fill="#fff1d6" stroke="#b3261e" stroke-width="1.6"/>
    <circle cx="60" cy="-3" r="5" fill="#d1361f"/><ellipse class="b-oeil" cx="60" cy="-3" rx="1.6" ry="4.2" fill="#1a0505"/>
    <path d="M42 -3 L37 -6 M42 -1 L36 0 M78 -3 L83 -6 M78 -1 L84 0" stroke="#ff6a3c" stroke-width="1.3" stroke-linecap="round"/></g>`;
  return '';
}

globalThis.BOSS_DESSINS=BOSS_DESSINS;globalThis.BOSS_MOUV=BOSS_MOUV;globalThis.BOSS_AURA=BOSS_AURA;
