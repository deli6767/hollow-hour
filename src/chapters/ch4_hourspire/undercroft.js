/* ===================== CHAPTER 4 · THE UNDERCROFT slice 1 (chunk O, v1.7-c5) =====================
   Beneath the Hourspire: an archive of stopped clocks that files what YOU did.
   Entry: Hourspire Stair WEST wall (rows 6-9, 4-tile doorway) -> The Archive Stair (roamers, enc 'under', own pop 3,
   reuses metronoma/hymnal = no new attacks) -> The Hall of Filed Clocks (save chime, 6 boss record cabinets + ledger drawer).
   Each cabinet shows a clock: ticking + warm = spared, stopped + cracked = killed, half-wound = other outcome, blank = not filed yet.
   West wall of the Hall: "CLOSED FOR FILING" (the rest of the Undercroft + Archivist Quill come in later chunks). Optional, not on any route. */
ENC_TABLE.under = ['metronoma', 'hymnal']; AREA_POP.under = 3; AREA_NAME.under = 'The Undercroft';
PAL.under = Object.assign({}, PAL.spire || {}, { floor: '#2a2630', floor2: '#302a36', wall: '#120e16' }); THEME_BG.under = ['#0a080e', '#1a1422'];
{ const m = ROOMS.spire1.map; for (const y of [6, 7, 8, 9]) m[y] = '.' + m[y].slice(1); ROOMS.spire1.exits.push({ x: 0, y: 6, w: 1, h: 4, to: 'under1', tx: 28, ty: 7 }); }
const UC_REC = [ // [name, outcome()]
  ['WICKLOW', () => hero.flags.killed_wicklow ? 'k' : hero.flags.spared_wicklow ? 's' : ''],
  ['GRIT', () => hero.flags.killed_grit ? 'k' : hero.flags.spared_grit ? 's' : ''],
  ['MADAME CUCKOO', () => hero.flags.killed_cuckoo ? 'k' : hero.flags.spared_cuckoo ? 's' : ''],
  ['SLOSH & TRICKLE', () => { const r = hero.flags.bilge_result; return !r ? '' : r === 'spared' ? 's' : r === 'killed' ? 'k' : 'h'; }],
  ['THE LOCKKEEPER', () => { const r = hero.flags.lock_result; return !r ? '' : r === 'spared' ? 's' : r === 'killed' ? 'k' : 'h'; }],
  ['MERIDIAN', () => hero.flags.killed_meridian ? 'k' : hero.flags.spared_meridian ? 's' : ''],
];
const UC_LBL = ['WICKLOW', 'GRIT', 'CUCKOO', 'TWINS', 'LOCKKEEPER', 'MERIDIAN'];
async function ucCabinet(i) { const [nm, f] = UC_REC[i], o = f(); hero.flags.uc_read = (hero.flags.uc_read || 0) | (1 << i);
  if (!o) return say('', `A drawer labelled ${nm}. The card inside is blank.`, '"PENDING. The archive does not file what has not happened. Yet."');
  if (o === 's') return say('', `A drawer labelled ${nm}. Inside, a small clock is still ticking.`, 'The filing card reads: "LET GO." Someone has drawn a tiny sun in the corner.');
  if (o === 'k') return say('', `A drawer labelled ${nm}. Inside, a small clock has stopped. The glass is cracked.`, 'The filing card reads: "ENDED." The handwriting is very neat. It looks like yours.');
  return say('', `A drawer labelled ${nm}. Inside, a clock is half wound, ticking in fits.`, 'The filing card reads: "UNFINISHED." Underneath: "see also: later."'); }
async function ucLedger() { const k = hero.kills, s = hero.spares; hero.flags.uc_ledger = true;
  return say('', 'A long ledger drawer marked SMALL MATTERS. It is full of tiny filed clocks.', `${s} of them are ticking. ${k} of them are not.`, k === 0 ? 'The archivist\'s note: "A quiet file. Hard to read. Easy to hold."' : s === 0 ? 'The archivist\'s note: "A heavy file. It will be read aloud."' : 'The archivist\'s note: "A mixed file. Most are."'); }
ROOMS.under1 = { name: 'The Archive Stair', area: 'under', theme: 'under', track: 'tower', enc: 'under', map: [
  '##############################',
  '#TTTTTTTTTTTTTTTTTTTTTTTTTTTT#',
  '#............................#',
  '#..,,,,,,,..........,,,,,,,..#',
  '#............................#',
  '#............................#',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '#............................#',
  '#TTTTTTTTTTTTTTTTTTTTTTTTTTTT#',
  '##############################'],
  exits: [{ x: 29, y: 6, w: 1, h: 4, to: 'spire1', tx: 1, ty: 7 }, { x: 0, y: 6, w: 1, h: 4, to: 'under2', tx: 28, ty: 7 }],
  ents: [
    { t: 'sign', x: 24, y: 4, text: ['THE UNDERCROFT · ARCHIVE OF RECORD.', '"Everything that happens at 11:59 is filed here. Please do not unfile anything."', '(The stairs go down further than the tower goes up.)'] },
    { t: 'thing', look: 'ucclock', x: 6, y: 2, run: async () => say('', 'A stopped clock on a shelf, tagged with a number. Hundreds more behind it, all tagged.', 'None of them say what time it is. They say what time it WAS.') },
    { t: 'thing', look: 'ucclock', x: 22, y: 2, run: async () => say('', 'This clock\'s tag says: "No. 14". Somebody has crossed it out and written "No. 14" again.') },
  ] };
ROOMS.under2 = { name: 'The Hall of Filed Clocks', area: 'under', theme: 'under', track: 'tower', map: [
  '##############################',
  '#TTTTTTTTTTTTTTTTTTTTTTTTTTTT#',
  '#............................#',
  '#............................#',
  '#............................#',
  '#............................#',
  '#.............................',
  '#.............................',
  '#.............................',
  '#.............................',
  '#............................#',
  '#TTTTTTTTTTTTTTTTTTTTTTTTTTTT#',
  '##############################'],
  exits: [{ x: 29, y: 6, w: 1, h: 4, to: 'under1', tx: 1, ty: 7 }],
  ents: [
    { t: 'save', x: 24, y: 10 },
    ...UC_REC.map((r, i) => ({ t: 'thing', look: 'uccab', n: i, x: 4 + i * 4, y: 3, run: async () => ucCabinet(i) })),
    { t: 'thing', look: 'ucledger', x: 14, y: 9, run: async () => ucLedger() },
    { t: 'thing', look: 'ucshut', x: 1, y: 7, run: async () => say('', 'A brass grille across the far wall. A card hangs on it: "CLOSED FOR FILING."', 'Behind it, a pen is scratching. It has not stopped scratching since you came in.') },
  ] };
function ucDial(x, y, r, o, t) { circ(x, y, r + 2, '#3a3040'); circ(x, y, r, o === 's' ? '#f4e8c0' : o === 'k' ? '#8a8490' : o === 'h' ? '#d8c8a0' : '#4a4252');
  if (!o) return; const a = o === 's' ? t * 2 : o === 'h' ? Math.floor(t * 1.3) * 0.9 : 2.2; line(x, y, x + Math.cos(a - 1.57) * r * 0.8, y + Math.sin(a - 1.57) * r * 0.8, '#2a2030', 2); line(x, y, x + r * 0.5, y, '#2a2030', 2);
  if (o === 'k') { line(x - r * 0.7, y - r * 0.5, x + r * 0.1, y + r * 0.2, '#f4f0f4', 1); line(x + r * 0.1, y + r * 0.2, x + r * 0.6, y - r * 0.1, '#f4f0f4', 1); }
  if (o === 's') { ctx.save(); ctx.globalAlpha = 0.25 + Math.sin(t * 3) * 0.1; circ(x, y, r + 6, '#ffd36e'); ctx.restore(); } }
Object.assign(THING, {
  ucclock: (x, y, t) => { ctx.fillStyle = '#3a2a2a'; ctx.fillRect(x - 40, y - 10, 80, 6); for (let i = 0; i < 5; i++) ucDial(x - 32 + i * 16, y - 18, 6, 'k', t); },
  uccab: (x, y, t, e) => { const o = UC_REC[e.n][1](); ctx.fillStyle = '#4a3a30'; ctx.fillRect(x - 18, y - 50, 36, 50); ctx.fillStyle = '#5a4a3e'; ctx.fillRect(x - 15, y - 22, 30, 16); ctx.fillStyle = '#c8a050'; ctx.fillRect(x - 4, y - 15, 8, 3);
    ucDial(x, y - 36, 10, o, t); ctx.font = `bold 11px ${FONT}`; ctx.textAlign = 'center'; ctx.fillStyle = o === 's' ? '#ffd36e' : o === 'k' ? '#b8b0c0' : '#9a90a8'; ctx.fillText(UC_LBL[e.n], x, y + 10); },
  ucledger: (x, y, t) => { ctx.fillStyle = '#4a3a30'; ctx.fillRect(x - 40, y - 22, 80, 22); const s = Math.min(hero.spares, 12), k = Math.min(hero.kills, 12);
    for (let i = 0; i < s; i++) circ(x - 36 + i * 6, y - 15, 2.4, '#ffd36e'); for (let i = 0; i < k; i++) circ(x - 36 + i * 6, y - 7, 2.4, '#7a7480'); ctx.font = `8px ${FONT}`; ctx.textAlign = 'center'; ctx.fillStyle = '#c8b8a0'; ctx.fillText('SMALL MATTERS', x, y + 10); },
  ucshut: (x, y, t) => { ctx.fillStyle = '#6a5a30'; for (let i = 0; i < 4; i++) ctx.fillRect(x - 14, y - 60 + i * 2 + i * 30 * 0, 4, 120); for (let i = -1; i < 3; i++) ctx.fillRect(x - 16 + 0, y - 56 + i * 30 + 30, 22, 3); ctx.fillStyle = '#e8dcc0'; ctx.fillRect(x - 2, y - 18, 14, 10); },
});
