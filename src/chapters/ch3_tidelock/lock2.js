/* ===================== CHAPTER 3 · TIDELOCK chunk E (v1.6-c6): LOCK No. 2 -> THE LONG LOCK =====================
   Lock No. 2 (basin east wall, rows 6-7) only opens when the levels match = LOW tide (reach the east quay at HIGH via
   the pontoon, then pull the east lever). Inside, the tide works in REVERSE: the lock holds what the basin lets go.
   LOW (tide_low): chamber is full -> the moored barges (rows 2-4) float level and make a north walkway; the south floor is under water.
   HIGH: chamber drained -> barges sit on the mud (gone), the south floor (rows 8-10) is a dry walkway with a chest.
   West landing (x1-6) and east landing (x27-32) are always dry and connected in BOTH states -> no softlock even though
   the sluice wheel inside flips the global tide. New enemy: Sluicesnail (enc 'tide2', its own pop so routes are unaffected). */
const LOCK2_ROWS = (() => { const W = 34, H = 13, hi = [], lo = [];
  for (let y = 0; y < H; y++) { let a = '', b = '';
    for (let x = 0; x < W; x++) { let c;
      if (y === 0 || y === H - 1) c = '#';
      else if (x === 0) c = (y === 6 || y === 7) ? '.' : '#';
      else if (x === W - 1) c = '#';
      else if (x <= 6 || x >= 27) c = (y === 1 || y === H - 2) ? 'T' : ((x === 2 || x === 31) && y >= 9 ? ',' : '.');
      else if (y === 1 || y === H - 2) c = '#';
      else if (y >= 2 && y <= 4) c = 'BA';
      else if (y >= 8 && y <= 10) c = 'FL';
      else c = '~';
      a += c === 'BA' ? '~' : c === 'FL' ? (x % 5 === 0 && y === 10 ? ',' : '.') : c;   // HIGH: drained floor
      b += c === 'BA' ? '=' : c === 'FL' ? '~' : c; }                                    // LOW: barges float
    hi.push(a); lo.push(b); }
  return [hi, lo]; })();
// open the basin's east wall at LOW tide only (the gate is a wall at HIGH)
for (const y of [6, 7]) { const r = TIDE_ROWS[1][y]; TIDE_ROWS[1][y] = r.slice(0, 31) + '.' + r.slice(32); }
ROOMS.basin.exits.push({ x: 31, y: 6, w: 1, h: 2, to: 'lock2', tx: 1, ty: 6 });
{ const i = ROOMS.basin.ents.findIndex(e => e.t === 'sign' && e.x === 29); if (i >= 0) ROOMS.basin.ents[i] = { t: 'thing', look: 'lockgate', x: 29, y: 5, run: async () => hero.flags.tide_low
  ? say('', 'LOCK No. 2 · the levels match. The gate stands open.', '(Through it, something hums a very slow song. It is closer now.)')
  : say('', 'LOCK No. 2 · SEALED. "The gate opens when the levels match."', 'The basin is high. On the other side, it is low. Or the other way round.') }; }
function lock2Apply() { const R = ROOMS.lock2; R.map = LOCK2_ROWS[hero.flags.tide_low ? 1 : 0]; if (!RM || RM.id !== 'lock2') return; RM.def = R; RM.cache = renderRoomCache(R);
  const dry = (tx, ty) => !SOLID.has(tileAt(tx, ty)), lift = (px, py) => { const tx0 = Math.floor(px / TILE), ty0 = Math.floor((py - 4) / TILE); if (dry(tx0, ty0)) return null; let best = null, bd = 1e9;
    for (let ty = 1; ty < 12; ty++) for (let tx = 1; tx < 33; tx++) if (dry(tx, ty)) { const d = Math.hypot(tx - tx0, ty - ty0); if (d < bd) { bd = d; best = [tx * TILE + 16, ty * TILE + 24]; } } return best; };
  const h = lift(hero.x, hero.y); if (h) { hero.x = h[0]; hero.y = h[1]; }
  for (const e of RM.ents) if (e.t === 'roam' && !e.gone) { const p = lift(e.px, e.py); if (p) { e.px = e.hx = p[0]; e.py = e.hy = p[1]; e.mode = 'idle'; e.vx = e.vy = 0; } } }
async function sluiceWheel() { const low = !!hero.flags.tide_low; hero.flags.tide_low = !low; hero.flags.tide_pulls = (hero.flags.tide_pulls || 0) + 1; lock2Apply();
  sfx('puzzle'); shake(5, 0.6); for (let i = 0; i < 4; i++) burst(rand(8, 26) * TILE, rand(3, 10) * TILE, 6, 'rgba(154,216,255,.7)', 60, 0.8, 3);
  if (!hero.flags.lock2_wheel) { hero.flags.lock2_wheel = true; return say('', 'You spin the sluice wheel. It turns backwards. Everything here turns backwards.', low ? 'The chamber DRAINS. Out in the basin, you hear it fill.' : 'The chamber FILLS. Out in the basin, you hear it empty.'); }
  return say('', low ? 'The chamber drains. The barges settle in the mud like sleeping dogs.' : 'The chamber fills. The barges lift, bumping gently into each other.', low ? '(Basin: HIGH TIDE.)' : '(Basin: LOW TIDE.)'); }
ENC_TABLE.tide2 = []; AREA_POP.tide2 = 4; AREA_NAME.tide2 = 'The Tidelock';
ROOMS.lock2 = { name: 'The Long Lock', area: 'tide2', theme: 'tide', track: 'tide', enc: 'tide2', map: LOCK2_ROWS[1], tideMaps: [LOCK2_ROWS[0], LOCK2_ROWS[1]],
  exits: [{ x: 0, y: 6, w: 1, h: 2, to: 'basin', tx: 30, ty: 6 }],
  ents: [
    { t: 'sign', x: 4, y: 2, text: ['LOCK No. 2 · THE LONG LOCK.', 'Notice: water in this chamber runs the OTHER way.', '"When the basin is low, we are high. Somebody has to be."'] },
    { t: 'thing', look: 'sluicewheel', x: 5, y: 7, run: async () => sluiceWheel() },
    { t: 'thing', look: 'sluicewheel', x: 29, y: 7, run: async () => sluiceWheel() },
    { t: 'chest', x: 16, y: 10, item: 'cocoa', flag: 'c_lock2' },
    { t: 'thing', look: 'logbook', x: 30, y: 3, run: async () => { const n = hero.flags.lock2_log = (hero.flags.lock2_log || 0) + 1;
      if (n === 1) return say('', 'A keeper\'s logbook, open on a lectern. Every page has one line.', '"Day 1. Tide in. Waiting for the turn."', '"Day 2. Tide in. Waiting for the turn."', '...', '"Day 14,600. Tide in. I have started keeping the gate shut so it cannot leave without saying goodbye."');
      return say('', 'The last page is blank except for a small drawing of a boat.', 'It is rowing in a circle.'); } },
    { t: 'sign', x: 31, y: 5, text: ['WEIR STAIRS · beyond: the Twin Sluices.', '(The door is wedged with two of everything: two bolts, two padlocks, two very polite notes saying KEEP OUT.)'] },
  ] };
{ const _er = enterRoom; enterRoom = function (id) { if (id === 'lock2') ROOMS.lock2.map = LOCK2_ROWS[hero.flags.tide_low ? 1 : 0]; return _er.apply(this, arguments); }; }
Object.assign(THING, {
  sluicewheel: (x, y, t) => { const a = (hero.flags.tide_low ? 1 : -1) * t * 0.6; ctx.fillStyle = '#2a3a44'; ctx.fillRect(x - 3, y - 18, 6, 18);
    circ(x, y - 24, 13, '#5a4a38'); circ(x, y - 24, 9, '#2c3a40'); for (let i = 0; i < 6; i++) { const q = a + i * 1.047; line(x, y - 24, x + Math.cos(q) * 13, y - 24 + Math.sin(q) * 13, '#b8c0c8', 2); }
    ctx.font = `10px ${FONT}`; ctx.textAlign = 'center'; ctx.fillStyle = '#9ad8ff'; ctx.fillText('SLUICE', x, y - 42); },
  logbook: (x, y, t) => { ctx.fillStyle = '#4a3a2a'; ctx.fillRect(x - 3, y - 16, 6, 16); ctx.fillStyle = '#e8dcc0'; ctx.fillRect(x - 12, y - 24, 11, 8); ctx.fillRect(x + 1, y - 24, 11, 8); ctx.fillStyle = '#6a5a4a'; ctx.fillRect(x - 1, y - 25, 2, 10); },
  lockgate: (x, y, t) => { const open = !!hero.flags.tide_low; ctx.fillStyle = '#3a2a1a'; ctx.fillRect(x - 3, y - 22, 6, 22); ctx.fillStyle = open ? '#9ad8ff' : '#c86a5a'; circ(x, y - 26, 5, ctx.fillStyle);
    ctx.font = `10px ${FONT}`; ctx.textAlign = 'center'; ctx.fillText(open ? 'OPEN' : 'SEALED', x, y - 36); },
});
/* ---- Sluicesnail: new Tidelock monster (patbot-verified) ---- */
A.sluiceGate = { name: 'Sluice Gate', dur: 6.5, size: [270, 180], desc: 'gates of water slide across; each has a marked gap that drifts a little',
  run(S) { let gy = 0; const gap = 62, step = 14;
    S.every(1.3 / S.d, n => { gy = Math.max(-hh() + gap / 2 + 8, Math.min(hh() - gap / 2 - 8, gy + rand(-45, 45))); const s = n % 2 ? 1 : -1;
      for (let y = -hh() + 6; y <= hh() - 6; y += step) if (Math.abs(y - gy) > gap / 2) shot(s * (hw() + 8), y, -s * 85 * S.d, 0, 5, '#6ab8d8', { warn: 0.6 }); sfx('warn'); }, 0.2, 5.6); } };
A.slimeTrail = { name: 'Slime Trail', dur: 6, size: [260, 180], desc: 'slow shells roll down in a staggered drizzle',
  run(S) { S.every(0.45 / S.d, n => { const x = -hw() + 14 + ((n * 0.618) % 1) * (arena.w - 28); shot(x, -hh() - 6, (n % 2 ? 18 : -18) * S.d, 85 * S.d, 6, '#c8d8a0', { warn: 0.5 }); }, 0.2, 5.4); } };
ENEMIES.sluicesnail = { id: 'sluicesnail', name: 'Sluicesnail', hp: 58, def: 2, atk: 1.2, torque: 11, cogs: 14, d: 1.05, attacks: ['sluiceGate', 'slimeTrail'], art: 'sluicesnail', track: 'tidebattle', mini: 0.3,
  check: 'EDGE 6 · PLATING 3 · carries a sluice gate on its back. opens it for nobody. very, very slowly.',
  intro: 'A Sluicesnail creeps out from under a barge!', flavor: ['Sluicesnail is on its way somewhere. It set off in spring.', 'Sluicesnail\'s gate creaks open a crack. Then closes again.', 'There is a little brass plate on its shell: KEEP SHUT.'], calm: 'Sluicesnail\'s gate is open a finger\'s width.',
  talk: ['not... yet...', 'wait your turn.', 'everyone is always in a HURRY.', 'the keeper said keep shut. so.'],
  acts: {
    'Wait': B => ({ t: ['You wait. And wait.', 'Sluicesnail looks at you with enormous respect.'], c: 30, say: 'finally. someone gets it.' }),
    'Knock': B => ({ t: ['You knock politely on the gate.', B.n('Wait') ? 'After a respectful pause, it creaks open.' : 'Sluicesnail retreats into its shell. Too soon.'], c: B.n('Wait') ? 65 : -10, say: B.n('Wait') ? '...come in.' : 'RUDE.' }),
    'Race': B => ({ t: ['You challenge it to a race.', 'You both stay perfectly still. It is a tie. Somehow this is very moving.'], c: 25, say: 'good race.' }),
  }, spare: 'Sluicesnail leaves its gate open behind it. Just a little. Just for you.', kill: 'Sluicesnail\'s gate swings shut for good. The brass plate still says KEEP SHUT.' };
ENC_TABLE.tide2.push('sluicesnail', 'barnaclock');
ART.sluicesnail = (x, y, t, s) => { const b = Math.sin(t * 1.2) * 2; ell(x, y + 22, 52, 12, '#6a7a5a'); ell(x - 26, y + 6 + b, 12, 16, '#8a9a6a');
  ctx.fillStyle = '#3a4a50'; ctx.fillRect(x - 10, y - 26, 44, 44); ctx.fillStyle = '#5a6a70'; for (let i = 0; i < 4; i++) ctx.fillRect(x - 6 + i * 10, y - 22, 4, 36);
  ctx.fillStyle = '#c8a050'; ctx.fillRect(x + 4, y - 4, 16, 6); eyes(x - 28, y - 2 + b, 5, 4, '#f4f0e0', blinkAt(t)); };
