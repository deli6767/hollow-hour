/* ===================== CHAPTER 3 · TIDELOCK chunk I (v1.6-c10): BOSS · THE LOCKKEEPER =====================
   Behind the sealed tower door in The Keeper's Walk (door at 29,4 now opens -> 'keepertower').
   Lore: he has held the gate HIGH for 14,603 days (one day per Ferry lap). He scratched out the one LOW. V. told him he could stop.
   GIMMICK · THE GATE: the battle has its own tide (b.lk.low). ACT "Turn the Wheel" lets the tide turn. At HIGH the box is short and
   wide (water up to the gate line); at LOW it is tall ("everything showing") and his attacks change shape. Arriving with the
   overworld tide already LOW (hero.flags.tide_low) means the gate is slipping: he starts at +20 calm.
   SPARE: calm 100 AND the battle tide is LOW (you have to let it turn). Calm 100 at HIGH -> he refuses ("not yet").
   KILL: HP 0. PHASE 2 "HIGH WATER" at HP <= 50% while not fully calm: he slams the gate HIGH, new track, finale attack High Water.
   Flags: lockkeeper_done, spared_lockkeeper | killed_lockkeeper, lock_result ('spared'|'worn'|'killed'), tide_turned (spared at LOW). */
VOICES.LOCKKEEPER = 120;
ROOMS.keepertower = { name: 'The Lockkeeper\'s Tower', area: 'tide4', theme: 'tide', track: 'tide', map: [
  '##############',
  '#TTTTTTTTTTTT#',
  '#~~........~~#',
  '#~~........~~#',
  '#............#',
  '.............#',
  '.............#',
  '#............#',
  '#~~........~~#',
  '#~~........~~#',
  '#TTTTTTTTTTTT#',
  '##############'],
  exits: [{ x: 0, y: 5, w: 1, h: 2, to: 'keeperwalk', tx: 28, ty: 5 }],
  ents: [
    { t: 'boss', enemy: 'lockkeeper', x: 10, y: 5, flag: 'lockkeeper_done' },
    { t: 'trigger', x: 5, y: 4, w: 1, h: 4, flag: 'lockkeeper_done', run: async () => { hero.dir = 1; shake(4, 0.5); sfx('bell');
      await say('LOCKKEEPER', 'Day fourteen thousand, six hundred and three. Tide: HIGH.');
      await say('LOCKKEEPER', 'A visitor. Nobody visits. The boat goes round, and I hold the gate, and nobody has to see the bottom.');
      if (hero.flags.ferry_told) await say('LOCKKEEPER', '...you counted his laps. Then you know how long I have been holding this.');
      await say('LOCKKEEPER', 'Do not touch the wheel. If it turns, it turns ALL the way.');
      startBattle('lockkeeper', { boss: true }); } },
    { t: 'sign', x: 3, y: 4, show: () => hero.flags.lock_result === 'killed', text: ['The wheel is still. The gate is stuck at HIGH, and nobody is holding it.', 'Out on the canal, a boat goes round.'] },
    { t: 'sign', x: 3, y: 4, show: () => !!hero.flags.lockkeeper_done && hero.flags.lock_result !== 'killed', text: ['The tide board on the wall has a fresh mark at the bottom: LOW.', 'Somebody has written it big this time.'] },
  ] };
{ const d = ROOMS.keeperwalk.ents.find(e => e.look === 'keeperdoor'); d.run = async () => {
    const f = hero.flags; if (f.lockkeeper_done) { await say('', f.lock_result === 'killed' ? 'The tower door hangs open. Inside, the wheel does not turn.' : 'The tower door stands open. The tide marks on it say HIGH, and LOW, and HIGH, and LOW.'); return enterRoom('keepertower', 1, 5); }
    await say('', 'THE LOCKKEEPER\'S TOWER. Every tide mark on the door says HIGH, except one scratched-out LOW.', 'You push. The sluice-door lifts, slowly, like it has been waiting to.');
    return enterRoom('keepertower', 1, 5); }; }
// west doorway snag fix (chunk H known issue): the 2-tile doorway sat inside a 4-tile corridor, so a hero half a tile high caught the
// wall corner at x0. Open the whole corridor width at x0 (rows 4-7) and widen the exit to match.
for (const y of [4, 7]) ROOMS.keeperwalk.map[y] = '.' + ROOMS.keeperwalk.map[y].slice(1);
Object.assign(ROOMS.keeperwalk.exits[0], { y: 4, h: 4 });
/* ---- music: slow heavy waltz (the wheel) -> phase 2 driving 7/8-ish ---- */
TRACKS.lockkeeper = { bpm: 132, root: 38, bt: 'triangle', bass: [0, _, 0, 7, _, 7, 5, _, 5, 3, _, 3, 0, _, 0, 7, _, 7, 10, _, 10, 8, _, 7, 5, _, 5, 3, _, 2, 0, _],
  lead: [12, _, 15, 14, _, 12, 10, _, _, 12, _, _, 15, _, 19, 17, _, 15, 14, _, _, 15, _, _, 24, _, 22, 19, _, 17, 15, _], lt: 'sine', lv: 0.09, kick: 1, hat: 1 };
TRACKS.lockkeeper2 = { bpm: 168, root: 38, bt: 'sawtooth', bass: [0, 0, _, 0, 7, _, 5, _, 0, 0, _, 0, 10, _, 8, _, 0, 0, _, 0, 7, _, 5, _, 3, 3, _, 3, 2, _, 7, _],
  lead: [24, _, 27, 26, 24, _, 22, _, 24, _, 31, _, 29, 27, 26, _, 24, _, 27, 26, 24, _, 22, 19, 22, _, 26, _, 27, _, 31, _], lt: 'square', lv: 0.07, kick: 2, hat: 2 };
/* ---- attacks (all telegraphed). lkLow() = battle tide is LOW ---- */
const lkLow = () => !!(typeof B !== 'undefined' && B && B.lk && B.lk.low);
// v1.8-c15: phase-1 tuning knobs (LK2 / HIGH WATER has form2 and keeps the c12 numbers). F1 = value in phase 1, else phase-2 value.
const lkF1 = (a, b) => (typeof B !== 'undefined' && B && B.e && B.e.id === 'lockkeeper' && !B.e.form2) ? a : b;
// SLUICE SLATS: the gate's slats drop as columns. 6 lanes, one safe; the safe lane moves at most 2 lanes per drop. At LOW the slats are spaced wider (5 lanes).
A.sluiceSlats = { name: 'Sluice Slats', dur: 7.5, size: [300, 190], desc: 'gate slats drop in marked lanes. one lane stays open, always next to you',
  run(S) { const N = lkLow() ? 5 : 6; S.every(lkF1(0.85, 1.0) / S.d, () => { const lw = arena.w / N, pl = clamp(Math.floor((P.x + hw()) / lw), 0, N - 1), safe = clamp(pl + irand(-1, 1), 0, N - 1); sfx('warn');
      for (let i = 0; i < N; i++) if (i !== safe) zone(-hw() + lw * (i + 0.5), 0, lw + 1, arena.h + 2, 0.8, 0.3, { col: '#6a8aa8' }); }, 0.2, 7); } };
// TIDE MARKS: painted tide lines (HIGH HIGH HIGH...) rise from the bottom, each with one gap. The gap only drifts a little.
A.tideMarks = { name: 'Tide Marks', dur: 7.5, size: [280, 220], desc: 'tide lines rise from the bottom of the box, one gap each, drifting a little',
  run(S) { let gx = 0; const gap = lkF1(26, 28);
    S.every(lkF1(0.72, 0.85) / S.d, () => { gx = clamp(gx + rand(-30, 30), -hw() + 40, hw() - 40); const L = gx - gap, R = gx + gap, y = hh() + 8, vy = -130 * S.d * (lkLow() ? 0.9 : 1);
      bar((-hw() + L) / 2, y, L + hw(), 12, 0, vy, '#c86a5a', { warn: 0.6 }); bar((R + hw()) / 2, y, hw() - R, 12, 0, vy, '#c86a5a', { warn: 0.6 }); }, 0.2, 6.6); } };
// FERRY LAPS: the boat rows round the edge of the box, lap after lap (top lane rightward, bottom lane leftward), marked 0.7 s ahead.
// The middle band is safe from the boat; day marks fall slowly through it (0.6 s marker), one at a time.
A.ferryLaps = { name: 'Ferry Laps', dur: 8, size: [290, 200], desc: 'the boat goes round and round the edge. day marks fall through the middle',
  run(S) { const lane = () => hh() - 46;
    S.every(lkF1(0.62, 0.75) / S.d, n => { const top = n % 2 === 0, y = top ? -lane() : lane(), dir = top ? 1 : -1; sfx('warn');
      shot(-dir * (hw() + 20), y, dir * 210 * S.d, 0, 18, '#b08a5a', { warn: 0.5 }); }, 0.2, 7.2);
    S.every(lkF1(0.1, 0.13) / S.d, () => shot(rand(-hw() + 20, hw() - 20), -hh() + 30, 0, 185 * S.d, 10, '#e8dcc0', { warn: 0.35 }), 0.7, 7.2); } };
// THE WHEEL: the gate wheel's rim closes in on you, one missing spoke-gap per rim (fair ringGap: gap on your side of the box,
// marked 0.75 s ahead, turns at most 0.8 rad from the last one). It turns one way, then back the other way.
A.gateWheel = { name: 'The Wheel', dur: 8, size: [240, 240], desc: 'the wheel rim closes in. one gap, marked, always on your side',
  run(S) { S.every(0.52 / S.d, n => /* c22 try A: was .6, gapHalf .37 */ ringGap(S, { sp: 185 * S.d, n: 44, r: 6, warn: 0.45, gapHalf: 0.30, maxShift: 0.8, col: n % 2 ? '#c8a050' : '#ffd36e' }), 0.2, 6.6); } };
// HIGH WATER (phase 2 finale): the box fills from the bottom in telegraphed steps (0.9 s line) up to 55%, then drains;
// slats drift across the dry part with one wide gap.
A.highWater = { name: 'High Water', dur: 9, size: [300, 220], desc: 'the box floods from the bottom in marked steps. the top always stays dry',
  run(S) { const lv = [0.25, 0.45, 0.6, 0.45, 0.25];
    lv.forEach((f, i) => S.at(0.3 + i * 1.6 / S.d, () => { const h = arena.h * f; sfx('warn'); zone(0, hh() - h / 2, arena.w + 4, h, 0.9, 1.6 / S.d - 0.85, { col: '#2a6ab8', dmg: 4 }); }));
    let gy = -40; S.every(0.7 / S.d, n => { gy = clamp(gy + rand(-36, 36), -hh() + 24, hh() - arena.h * 0.6 - 22); wallPair(n % 2 ? hw() + 10 : -hw() - 10, (n % 2 ? -1 : 1) * 175 * S.d, gy, 22, '#6a6a7a'); }, 1.2, 8.2); } };
for (const k of ['sluiceSlats', 'tideMarks', 'ferryLaps', 'gateWheel', 'highWater']) A[k].id = k;
/* ---- the Lockkeeper ---- */
ENEMIES.lockkeeper = { id: 'lockkeeper', name: 'THE LOCKKEEPER', title: 'who holds the gate', boss: true, hp: 240, def: 3, atk: 1.55, torque: 90, cogs: 85, d: 1.2, voice: 120,
  attacks: ['sluiceSlats', 'tideMarks', 'ferryLaps', 'gateWheel'], art: 'lockkeeper', track: 'lockkeeper', mini: 0.22,
  check: 'EDGE 9 · PLATING 3 · a sluice-gate automaton. has held the tide HIGH for 14,603 days. his hands are rusted to the wheel.',
  intro: 'THE LOCKKEEPER plants himself against the wheel. The tide is HIGH.',
  flavor: ['The Lockkeeper\'s wheel creaks a quarter-turn and he hauls it back.', 'Through the window, a boat goes round.', 'Smells like rust, rope, and old ink.', 'The Lockkeeper mutters a date. Then the next one.'],
  calm: 'The Lockkeeper\'s hands are loose on the wheel.',
  talk: ['HIGH. still HIGH.', 'nobody has to see the bottom.', 'the boat goes round. i hold. that is the arrangement.', 'do not touch the wheel.'],
  acts: {
    'Read the Logbook': b => ({ t: ['You read his logbook aloud. "Held. Held. Held."', b.n('Read the Logbook') > 1 ? 'He has heard it before.' : 'The Lockkeeper listens like it is someone else\'s life.'], c: b.n('Read the Logbook') > 1 ? 5 : 15, say: 'every day. every single day.' }),
    'Say the Count': b => hero.flags.ferry_told ? ({ t: ['"Fourteen thousand, six hundred and three."', 'His wheel stops creaking.'], c: 25, say: '...you counted. somebody COUNTED.' })
      : ({ t: ['You guess a number. It is wrong.'], c: 5, say: 'no. more than that. so many more.' }),
    'Turn the Wheel': b => lkTurn(b),
    'Point at the LOW': b => b.lk.low ? ({ t: ['You point at the bottom of the box. The water is gone. It\'s just... the bottom.', 'Mud. A lost boot. A bell. Nothing terrible.'], c: 20, say: '...that\'s it? that is what i was holding back?' })
      : ({ t: ['You point at the scratched-out LOW on his tide board.', 'He puts a rusted hand over it.'], c: 10, say: 'that was a mistake. i fixed it.' }),
    'He Could Stop': b => b.n('Point at the LOW') ? ({ t: ['"V. said you could stop."', 'The Lockkeeper goes very still. Then he nods, the way you nod at something you knew.'], c: 30, say: 'V. was very kind about it.' })
      : ({ t: ['"You could stop, you know."', 'He doesn\'t believe you yet.'], c: 10, say: 'and then what? everything showing?' }),
  },
  spare: 'The Lockkeeper takes his hands off the wheel. It turns all the way. Out on the canal, a boat finally stops going round.',
  kill: 'The Lockkeeper slumps against the wheel. It stays at HIGH. Nobody will ever turn it now.' };
const LK2 = Object.assign({}, ENEMIES.lockkeeper, { title: 'HIGH WATER', def: 4, atk: 1.65, d: 1.24, form2: true, track: 'lockkeeper2',
  attacks: ['highWater', 'sluiceSlats', 'gateWheel', 'tideMarks', 'ferryLaps'],
  check: 'EDGE 10 · PLATING 4 · he has thrown his whole weight on the wheel. the tide is higher than it has ever been.',
  flavor: ['The water is up to the Lockkeeper\'s chest. He doesn\'t notice.', 'The wheel is bent. He keeps turning it anyway.', 'Every window shows the same boat.'],
  turns: ['HIGH WATER! all of it! nobody sees ANYTHING!', 'fourteen thousand days and you think ONE visitor-', 'i HOLD. that is what i am FOR.', '...what am i for, if not this?'] });
function lkTurn(b) { const lk = b.lk; lk.low = !lk.low; lk.turns++; sfx('phase'); shake(6, 0.5); b.flash = 0.3; hhSting('lockkeeper', lk.low ? 1 : 2); hero.flags.lock_wheel = true;
  if (lk.low) { const first = !lk.wasLow; lk.wasLow = true; return { t: ['You grab the wheel next to his hands and turn it.', 'The tide runs out of the box. All the way. Everything is showing.'], c: first ? 15 : 0, say: first ? 'NO- no, no... ...oh.' : 'again? it keeps doing that.' }; }
  return { t: ['You turn the wheel back. The water rushes in.', 'He looks relieved, and then he looks ashamed of looking relieved.'], c: -5, say: 'there. HIGH. safe.' }; }
const lkSize = (b, def) => b && b.lk && !b.opts.practice ? [def.size[0], (b.lk.low ? Math.min(def.size[1] + 30, 220) : def.size[1] - 20)] : def.size;
{ const _sb = startBattle; startBattle = function (id, opts = {}) { const r = _sb.apply(this, arguments);
    if (id === 'lockkeeper' && B && !opts.practice) { B.lk = { low: false, wasLow: false, turns: 0, p2: false }; if (hero.flags.tide_low) { B.calm = 20; B.lk.slip = true; } }
    return r; }; }
{ const _bd = bDodge; bDodge = function (b, def, d) { if (b && b.lk && def && !b.opts.practice) def = Object.assign({}, def, { size: lkSize(b, def) }); return _bd.call(this, b, def, d); }; }
async function lkHighWater(b) { const lk = b.lk; lk.p2 = true; lk.low = false; clearBullets(true); sfx('phase'); shake(10, 0.7); b.flash = 0.6; setTrack('lockkeeper2');
  hhSting('lockkeeper', 2); hero.flags.lock_p2 = true;
  await bTalk(b, ['ENOUGH. if a little is too much, then ALL of it.', 'HIGH WATER. fourteen thousand days of it. at once.'], 120); if (!alive(b)) return;
  b.e = LK2; b.turn = 0; b.calm = Math.round(b.calm * 0.5); { const h = Math.min(5, maxGlow(hero) - hero.glow); if (h > 0) { hero.glow += h; b.glowFlash = 0.5; } }
  await bMsg(b, 'The Lockkeeper throws his whole weight on the wheel. The tide slams HIGH.'); }
{ const _et = enemyTurn; enemyTurn = async function (b) {
    if (b && b.lk && !b.opts.practice && !b.lk.p2 && b.hp <= b.maxhp * 0.5 && b.calm < 100) { await lkHighWater(b); if (!alive(b)) return; }
    return _et.apply(this, arguments); }; }
{ const _ds = doSpare; doSpare = async function (b) {
    if (b && b.lk && !b.opts.practice) { const worn = b.hp <= b.maxhp * 0.25 && b.calm < 100;
      if (!worn && !b.lk.low) { await bMsg(b, ['The Lockkeeper would stop. But his hands are still on the wheel, and the tide is HIGH.', '(Let the tide turn first.)']);
        if (alive(b)) { b.pendingSay = 'not yet. not while it is HIGH.'; await enemyTurn(b); } return lkResume(b); }
      hero.flags.lockkeeper_done = true; hero.flags.lock_result = worn ? 'worn' : 'spared'; if (b.lk.low && !worn) hero.flags.tide_turned = true;
      if (worn) b.e = Object.assign({}, b.e, { spare: 'The Lockkeeper lets go of the wheel because he can\'t hold it any more. It drifts to HIGH, and stays there.' }); }
    return _ds.apply(this, arguments); }; }
function lkResume(b) { if (!alive(b)) return; (async () => { while (alive(b)) { try { const res = await playerTurn(b); if (!alive(b) || res === 'end') return; await enemyTurn(b); } catch (e) { console.error(e); if (!alive(b)) return; b.list = null; b.typer = null; } } })(); }
{ const _dk = doKill; doKill = async function (b) { if (b && b.lk && !b.opts.practice) { hero.flags.lockkeeper_done = true; hero.flags.lock_result = 'killed'; } return _dk.apply(this, arguments); }; }
/* ---- art: tall rusted automaton with a gate-wheel chest; water line follows the battle tide ---- */
ART.lockkeeper = (x, y, t, s) => { const lk = typeof B !== 'undefined' && B && B.lk, low = (lk && lk.low) || (s && s.low), p2 = lk && lk.p2, sway = Math.sin(t * 1.3) * 2;
  ell(x, y + 50, 46, 8, 'rgba(0,0,0,.35)');
  ctx.fillStyle = '#4a5a66'; ctx.fillRect(x - 30 + sway, y - 40, 60, 90); ctx.fillStyle = '#3a4650'; ctx.fillRect(x - 22, y + 50, 14, 4); ctx.fillRect(x + 8, y + 50, 14, 4);
  ctx.fillStyle = '#5a6a76'; ctx.fillRect(x - 22 + sway, y - 78, 44, 36); eyes(x + sway, y - 62, 6, 3, p2 ? '#ff6a5a' : '#ffd36e', blinkAt(t));
  const wa = t * (p2 ? 1.6 : 0.6) * (low ? -1 : 1); circ(x + sway, y, 22, '#7a5a3a'); circ(x + sway, y, 16, '#4a5a66');
  for (let k = 0; k < 6; k++) { const a = wa + k * 1.047; line(x + sway, y, x + sway + Math.cos(a) * 22, y + Math.sin(a) * 22, '#c8a050', 3); }
  line(x - 30 + sway, y - 10, x - 18 + sway, y + 4, '#3a4650', 6); line(x + 30 + sway, y - 10, x + 18 + sway, y + 4, '#3a4650', 6);
  ctx.font = `10px ${FONT}`; ctx.textAlign = 'center'; ctx.fillStyle = low ? '#9ad8ff' : '#c86a5a'; ctx.fillText(low ? 'LOW' : 'HIGH', x + sway, y - 84);
  if (!low) { ctx.fillStyle = 'rgba(42,106,184,.35)'; ctx.fillRect(x - 60, y + 20, 120, 34); } };
