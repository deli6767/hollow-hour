/* ===================== CHAPTER 3 · TIDELOCK chunk H (v1.6-c9): THE KEEPER'S WALK + DRIFTWICK =====================
   Twin Sluices east doorway (x15 rows 5-6; you only get there past the twins' trigger) -> The Keeper's Walk: a lamp-lit towpath
   running to the Lockkeeper's tower. Not tide-dependent. Logbook pages (keeper's lore), a lamp you can wind, save chime right
   before the sealed tower door (Lockkeeper = D5, next chunk). New enemy Driftwick (enc 'tide4', own pop so routes are unaffected). */
for (const y of [5, 6]) ROOMS.sluices.map[y] = ROOMS.sluices.map[y].slice(0, 15) + '.';
ROOMS.sluices.exits.push({ x: 15, y: 5, w: 1, h: 2, to: 'keeperwalk', tx: 1, ty: 5 });
ENC_TABLE.tide4 = []; AREA_POP.tide4 = 4; AREA_NAME.tide4 = 'The Tidelock';
ROOMS.keeperwalk = { name: 'The Keeper\'s Walk', area: 'tide4', theme: 'tide', track: 'tide', enc: 'tide4', map: [
  '################################',
  '#TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT#',
  '#~~~~~~......~~~~~~......~~~~~~#',
  '#~~~~~~..,,..~~~~~~..,,..~~~~~~#',
  '#..............................#',
  '...............................#',
  '...............................#',
  '#..............................#',
  '#~~~~~~..,,..~~~~~~..,,..~~~~~~#',
  '#~~~~~~......~~~~~~......~~~~~~#',
  '#TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT#',
  '################################'],
  exits: [{ x: 0, y: 5, w: 1, h: 2, to: 'sluices', tx: 14, ty: 5 }],
  ents: [
    { t: 'sign', x: 3, y: 4, text: ['THE KEEPER\'S WALK. Towpath to the tower.', 'Please do not wake the tide. It is resting.'] },
    { t: 'thing', look: 'logpage', x: 9, y: 8, run: async () => logPage(0) },
    { t: 'thing', look: 'logpage', x: 21, y: 8, run: async () => logPage(1) },
    { t: 'thing', look: 'walklamp', x: 15, y: 4, run: async () => { const f = hero.flags; if (f.walk_lamp) return say('', 'The lamp is wound. It blinks in time with something far away, back toward the basin.');
      f.walk_lamp = true; return say('', 'A towpath lamp with a little crank. You wind it.', 'It blinks once. Somewhere behind you, a boat seems to row a little faster.'); } },
    { t: 'save', x: 26, y: 4 },
    { t: 'thing', look: 'keeperdoor', x: 29, y: 4, run: async () => say('', 'THE LOCKKEEPER\'S TOWER. The door is a sluice gate, painted with tide marks.', 'Every mark says HIGH. Someone has scratched out one LOW, very small, near the bottom.', 'From inside: a big slow wheel, turning and turning back.', '(Not yet. Rest at the chime first.)') },
  ] };
const LOG_PAGES = [
  ['A logbook page, pinned under a stone.', '"Day 14,590. Tide HIGH. Boat passed the window. Held the gate."', '"Day 14,591. Tide HIGH. Boat passed. Held."', 'Every line is the same. The handwriting gets more careful, not less.'],
  ['Another page, damp at the edges.', '"If I let it turn, it turns all the way. Low water. Everything showing."', '"Better to hold it. Better the boat goes round. Better nobody has to see the bottom."', 'Under that, in different ink: "V. said I could stop. V. was very kind about it."'],
];
async function logPage(i) { const f = hero.flags; f.keeper_pages = (f.keeper_pages || 0) | (1 << i); return say('', ...LOG_PAGES[i]); }
Object.assign(THING, {
  logpage: (x, y, t) => { ctx.fillStyle = '#7a7268'; ell(x, y - 4, 10, 5, '#6a6258'); ctx.fillStyle = '#e8dcc0'; ctx.fillRect(x - 8, y - 18, 16, 12); line(x - 5, y - 15, x + 5, y - 15, '#8a7a60', 1); line(x - 5, y - 11, x + 3, y - 11, '#8a7a60', 1); },
  walklamp: (x, y, t) => { ctx.fillStyle = '#3a3028'; ctx.fillRect(x - 2, y - 34, 4, 34); const on = hero.flags.walk_lamp ? (Math.sin(t * 2.2) > 0 ? 1 : 0.35) : 0.2; circ(x, y - 38, 6, `rgba(255,216,122,${on})`); circ(x, y - 38, 3, '#fff4c0'); },
  keeperdoor: (x, y, t) => { ctx.fillStyle = '#2a3a4a'; ctx.fillRect(x - 18, y - 36, 36, 36); for (let i = 0; i < 5; i++) line(x - 16, y - 30 + i * 6, x + 16, y - 30 + i * 6, '#4a6a8a', 1);
    ctx.font = `10px ${FONT}`; ctx.textAlign = 'center'; ctx.fillStyle = '#c86a5a'; ctx.fillText('SEALED', x, y - 42); },
});
/* ---- Driftwick: a candle stub riding a bit of driftwood. it has been floating toward the sea for years and never arrives. ---- */
// EMBER DRIFT: embers ride in from the left on marked rows (3 of 7 rows per volley, never the same set twice), bobbing gently.
A.emberDrift = { name: 'Ember Drift', dur: 7, size: [280, 190], desc: 'embers drift in on marked rows, three at a time, slow and bobbing',
  run(S) { const N = 7; let lastK = '';
    S.every(1.0 / S.d, n => { let rs, k; do { rs = []; while (rs.length < 3) { const r = irand(0, N - 1); if (!rs.includes(r)) rs.push(r); } rs.sort(); k = rs.join(); } while (k === lastK); lastK = k;
      const side = n % 2 ? 1 : -1; sfx('warn');
      for (const r of rs) shot(side * (hw() + 6), -hh() + (arena.h / N) * (r + 0.5), -side * 105 * S.d, 0, 6, '#ffb84a', { warn: 0.7 }); }, 0.2, 6.2); } };
// LOG JAM: driftwood logs float across with one gap each; the gap only drifts a little between logs.
A.logJam = { name: 'Log Jam', dur: 7.5, size: [290, 200], desc: 'driftwood logs float across the box, each with one gap that drifts a little',
  run(S) { let gy = 0;
    S.every(1.3 / S.d, n => { gy = clamp(gy + rand(-28, 28), -hh() + 40, hh() - 40); wallPair(-hw() - 10, 100 * S.d, gy, 40, '#8a6a48'); }, 0.2, 6.8); } };
for (const k of ['emberDrift', 'logJam']) A[k].id = k;
ENEMIES.driftwick = { id: 'driftwick', name: 'Driftwick', hp: 56, def: 1, atk: 1.2, torque: 11, cogs: 14, d: 1.05, attacks: ['emberDrift', 'logJam'], art: 'driftwick', track: 'tidebattle', mini: 0.3,
  check: 'EDGE 6 · PLATING 1 · a candle on a log. has been "nearly at the sea" for eleven years.',
  intro: 'A Driftwick bobs up, flickering!', flavor: ['Driftwick is almost at the sea. It can tell.', 'Driftwick\'s flame leans toward the tower, then away.', 'Smells like wet wood and birthday cake.'], calm: 'Driftwick\'s flame has gone small and steady.',
  talk: ['nearly there.', 'is that the sea?', 'don\'t blow.', 'the water never goes DOWN, so i never get OUT.'],
  acts: {
    'Cup Flame': B => ({ t: ['You cup your hands around Driftwick\'s flame.', 'It stops guttering.'], c: 35, say: 'oh. warm. you\'re warm.' }),
    'Point Seaward': B => ({ t: ['You point the way to the sea.', B.n('Cup Flame') ? 'Driftwick turns its log carefully to face it.' : 'Driftwick spins in a confused circle.'], c: B.n('Cup Flame') ? 60 : 10, say: B.n('Cup Flame') ? 'that way? THAT way. okay.' : 'which way is "that"?' }),
    'Blow': B => ({ t: ['You blow on the flame.', 'Driftwick flares up, offended.'], c: -5, say: 'RUDE.' }),
  }, spare: 'Driftwick floats off down the towpath, flame first, toward a sea it will absolutely reach one day.', kill: 'The flame goes out with a tiny hiss. The log keeps floating. It does not know.' };
ENC_TABLE.tide4.push('driftwick', 'gullbell');
ART.driftwick = (x, y, t, s) => { const bob = Math.sin(t * 2) * 3; ell(x, y + 26, 34, 6, 'rgba(0,0,0,.3)');
  poly([x - 34, y + 10 + bob, x + 34, y + 6 + bob, x + 30, y + 20 + bob, x - 30, y + 22 + bob], '#7a5a3a'); line(x - 20, y + 14 + bob, x + 10, y + 12 + bob, '#5a4028', 2);
  ctx.fillStyle = '#efe6d0'; ctx.fillRect(x - 8, y - 18 + bob, 16, 28); eyes(x, y - 6 + bob, 3, 3, '#202020', blinkAt(t));
  const fl = Math.sin(t * 9) * 2; poly([x, y - 40 + bob + fl, x - 6, y - 22 + bob, x + 6, y - 22 + bob], '#ffb84a'); circ(x, y - 25 + bob, 3, '#fff4c0'); };
// the east doorway only opens once the twins are settled (spared, half, or killed); otherwise it stays wall.
{ const _er = enterRoom; enterRoom = function (id, ...a) { if (id === 'sluices') { const c = hero.flags.bilgewater_done ? '.' : '#'; for (const y of [5, 6]) ROOMS.sluices.map[y] = ROOMS.sluices.map[y].slice(0, 15) + c; }
    return _er.call(this, id, ...a); }; }
// v1.7 chunk K fix: the doorway only re-opened on room re-entry, so right after settling the twins in-room the east wall stayed shut
// (player had to leave and come back). Open it live the first world frame after bilgewater_done.
{ const _uw = updateWorld; updateWorld = function (dt) { if (RM && RM.id === 'sluices' && hero.flags.bilgewater_done && ROOMS.sluices.map[5][15] !== '.') {
      for (const y of [5, 6]) ROOMS.sluices.map[y] = ROOMS.sluices.map[y].slice(0, 15) + '.'; RM.def = ROOMS.sluices; RM.cache = renderRoomCache(ROOMS.sluices); }
    return _uw.apply(this, arguments); }; }
