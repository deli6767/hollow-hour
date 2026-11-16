/* ===================== CHAPTER 4 · HOURSPIRE chunk N (v1.7-c4): THE WEIGHTWORKS + UNDERSTUDY'S LOFT =====================
   Optional side wing off the Hourspire Stair east wall (rows 7-8). Main path (spire1 -> gallery) is untouched.
   Weightworks: lever-train puzzle. A counterweight car runs from the depot over 3 track switches (MAIN/BRANCH).
   Ring the dispatch bell to send it; only MAIN, BRANCH, MAIN reaches the LIFT and raises the bars to the Loft.
   Wrong routes end at a buffer and the car rolls home. Switches + bell sit on the open floor (row 9), both exits stay
   reachable at all times -> no softlock. Roamers: enc 'spire2' (own pop, existing spire monsters, attacks already bot-verified).
   Loft: Pell (Madame Cuckoo's understudy) arc start: q_pell 1. */
ENC_TABLE.spire2 = ['metronoma', 'hymnal']; AREA_POP.spire2 = 3; AREA_NAME.spire2 = AREA_NAME.spire || 'Hourspire';
{ const m = ROOMS.spire1.map; for (const y of [6, 7, 8, 9]) m[y] = m[y].slice(0, -1) + '.'; ROOMS.spire1.exits.push({ x: 29, y: 6, w: 1, h: 4, to: 'spire2', tx: 1, ty: 7 }); }
const TRAIN_T = 32, tp = (x, y) => [x * TRAIN_T + 16, y * TRAIN_T + 16];
const TRAIN_NODES = { D: tp(3, 3), J1: tp(9, 3), J2: tp(15, 3), J3: tp(21, 4), ASH: tp(9, 5), DEAD: tp(19, 2), LIFT: tp(26, 4), LOOP: tp(21, 2) };
const TRAIN_OUT = { ASH: ['ASH BIN', 'The car tips neatly into the ash bin. A cloud of very old soot says hello.'],
  DEAD: ['DEAD END', 'The car rolls up to a buffer painted with the words "NOT THIS WAY". It agrees.'],
  LOOP: ['LOST & FOUND', 'The car stops under a sign: LOST & FOUND. Someone has left an umbrella there for forty years.'] };
function trainPath(s) { const N = TRAIN_NODES, p = [N.D, N.J1]; if (s[0]) return [p.concat([N.ASH]), 'ASH'];
  p.push(N.J2); if (!s[1]) return [p.concat([N.DEAD]), 'DEAD']; p.push(tp(15, 4), N.J3); if (s[2]) return [p.concat([N.LOOP]), 'LOOP']; return [p.concat([N.LIFT]), 'LIFT']; }
let TRAIN = null; // { pts, t0, dur } while the car is moving
function trainPos(pts, f) { let L = 0; const seg = []; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); L += d; }
  let r = f * L; for (let i = 0; i < seg.length; i++) { if (r <= seg[i]) { const k = seg[i] ? r / seg[i] : 0; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k]; } r -= seg[i]; } return pts[pts.length - 1]; }
const trainSw = () => { const f = hero.flags; return [f.tsw0 ? 1 : 0, f.tsw1 ? 1 : 0, f.tsw2 ? 1 : 0]; };
async function trainSwitch(n) { const f = hero.flags; if (f.spire_train) return say('', 'The switch is locked in place with a little brass tag: "ROUTE SET. THANK YOU."');
  if (TRAIN) return; f['tsw' + n] = !f['tsw' + n]; sfx('puzzle'); return say('', `Clunk. Switch ${'ABC'[n]} now points ${f['tsw' + n] ? 'BRANCH' : 'MAIN'}.`); }
async function trainBell() { const f = hero.flags; if (f.spire_train) return say('', 'The car is parked at the LIFT. The bars are up. The bell has nothing left to say.');
  if (TRAIN) return; const [pts, end] = trainPath(trainSw()); f.train_runs = (f.train_runs || 0) + 1; sfx('bell');
  TRAIN = { pts, t0: performance.now() / 1000, dur: 2.2 }; await sleep(2300);
  if (end === 'LIFT') { f.spire_train = true; TRAIN = null; sfx('puzzle'); shake(5, 0.6); burst(26 * TRAIN_T + 16 - cam.x, 4 * TRAIN_T - cam.y, 24, '#ffd36e', 120, 0.8, 3);
    return say('', 'The counterweight car rolls onto the LIFT and sinks with a satisfied CLONK.', 'Somewhere above, chains wind. The bars on the east door rise.', '(The way to the Loft is open.)'); }
  const o = TRAIN_OUT[end]; await say('', o[1], f.train_runs >= 3 ? '(The sign by the door might help. The car does not mind trying again.)' : '(The car trundles home on its own.)'); TRAIN = null; }
ROOMS.spire2 = { name: 'The Weightworks', area: 'spire2', theme: 'spire', track: 'tower', enc: 'spire2', map: [
  '##############################',
  '#TTTTTTTTTTTTTTTTTTTTTTTTTTTT#',
  '#............................#',
  '#............................#',
  '#............................#',
  '#............................#',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '#..,,,,..................,,,.#',
  '#TTTTTTTTTTTTTTTTTTTTTTTTTTTT#',
  '##############################'],
  exits: [{ x: 0, y: 6, w: 1, h: 4, to: 'spire1', tx: 28, ty: 7 }, { x: 29, y: 6, w: 1, h: 4, to: 'spire3', tx: 1, ty: 6 }],
  ents: [
    { t: 'gate', x: 28, y: 6, w: 1, h: 4, flag: 'spire_train', style: 'bars' },
    { t: 'thing', look: 'traintrack', x: 3, y: 2, walk: true, run: async () => say('', 'The depot. A squat iron counterweight car waits on the rails, patient as a paperweight.') },
    { t: 'thing', look: 'trainbell', x: 4, y: 9, run: async () => trainBell() },
    { t: 'thing', look: 'trainswitch', n: 0, x: 9, y: 9, run: async () => trainSwitch(0) },
    { t: 'thing', look: 'trainswitch', n: 1, x: 15, y: 9, run: async () => trainSwitch(1) },
    { t: 'thing', look: 'trainswitch', n: 2, x: 21, y: 9, run: async () => trainSwitch(2) },
    { t: 'sign', x: 25, y: 9, text: ['THE WEIGHTWORKS · DISPATCH ORDERS', '"Send the weight to the LIFT. Mind the switches."', '"Stay on the line. Step off it once. Then get back on and keep going."'] },
  ] };
ITEMS.cuebell = { name: 'Cue Bell', kind: 'armor', v: 4, price: 0, desc: 'PLATING +4. a tiny bell for telling someone it\'s their turn.' };
QUESTS.push({ id: 'pell', name: "Pell's Cue", chapter: 4,
  stage: () => { const f = hero.flags; if (!f.q_pell) return null; return 'Pell, the understudy, has never been given a cue. Madame Cuckoo performs in the Gallery.'; },
  done: () => hero.flags.q_pell >= 3 });
async function pellTalk() { VOICES.PELL = 1240; const f = hero.flags, n = f.pell_n = (f.pell_n || 0) + 1;
  if (route() === 'violent') return say('PELL', '...', '(A small cuckoo pulls a curtain across itself. The curtain is a sock.)');
  if (n === 1) { f.q_pell = 1;
    return say('PELL', 'Oh! You came up the weights! Nobody comes up the weights. I\'m PELL.', 'I\'m the understudy. If Madame Cuckoo can\'t go on, I go on.', 'She has gone on every night for forty years. Every night is the same night. So that\'s... once? Lots? Once, lots.', 'I know all her lines. I\'ve never said one out loud. Nobody\'s ever given me my cue.', '...If you see her, could you... no. Never mind. Unless.'); }
  if (f.cuckoo_done) return say('PELL', f.killed_cuckoo ? 'The Gallery is very quiet. I keep waiting for the cue. I think the cue isn\'t coming.' : 'You saw her! Was she wonderful? She\'s always wonderful. That\'s the problem with her.');
  return say('PELL', ['I practise in the mirror. The mirror always claps. Mirrors are easy.', 'Her big number is at 11:59. Mine would be at 12:00. Nobody has ever got there.', 'Do you think a cue can be a person? Like... someone just looking at you and nodding?'][n % 3]); }
ROOMS.spire3 = { name: 'The Understudy\'s Loft', area: 'spire2', theme: 'spire', track: 'tower', map: [
  '####################',
  '#TTTTTTTTTTTTTTTTTT#',
  '#..................#',
  '#..________________#',
  '#..................#',
  '...................#',
  '...................#',
  '...................#',
  '...o_o_o...........#',
  '#..................#',
  '#TTTTTTTTTTTTTTTTTT#',
  '####################'],
  exits: [{ x: 0, y: 5, w: 1, h: 4, to: 'spire2', tx: 27, ty: 7 }],
  ents: [
    { t: 'npc', kind: 'pell', name: 'PELL', x: 13, y: 5, voice: 1240, run: async () => pellTalk() },
    { t: 'chest', x: 17, y: 8, item: 'cuebell', flag: 'c_loft1' },
    { t: 'thing', look: 'loftmirror', x: 8, y: 2, run: async () => { const f = hero.flags; if (f.loft_mirror) return say('', 'The mirror. Your reflection nods at you. It feels like being given a cue.');
      f.loft_mirror = true; return say('', 'A dressing mirror ringed with little bulbs. Most are out.', 'Taped to the corner: a programme. "TONIGHT: MADAME CUCKOO." Under it, in tiny pencil: "and P."'); } },
  ] };
Object.assign(THING, {
  traintrack: (x, y, t) => { const N = TRAIN_NODES, sw = trainSw(), done = hero.flags.spire_train, ox = -cam.x + (x - (3 * TRAIN_T + 16)) * 0 , rail = (pts, c) => { for (let i = 1; i < pts.length; i++) line(pts[i - 1][0] - cam.x, pts[i - 1][1] - cam.y, pts[i][0] - cam.x, pts[i][1] - cam.y, c, 4); };
    const all = [[N.D, N.J1, N.J2, N.DEAD], [N.J1, N.ASH], [N.J2, tp(15, 4), N.J3, N.LIFT], [N.J3, N.LOOP]]; for (const p of all) hhRail(p, 'idle', t);
    hhRail(trainPath(sw)[0], done ? 'done' : 'route', t);
    ctx.font = `9px ${FONT}`; ctx.textAlign = 'center'; for (const [k, lbl] of [['ASH', 'ASH'], ['DEAD', 'END'], ['LOOP', 'L&F'], ['LIFT', 'LIFT']]) { const p = N[k]; ctx.fillStyle = '#2a2430'; ctx.fillRect(p[0] - cam.x - 12, p[1] - cam.y - 4, 24, 8); ctx.fillStyle = k === 'LIFT' ? '#ffd36e' : '#b8a8c8'; ctx.fillText(lbl, p[0] - cam.x, p[1] - cam.y - 8); }
    ['J1', 'J2', 'J3'].forEach((k, i) => { const p = N[k]; circ(p[0] - cam.x, p[1] - cam.y, 5, sw[i] ? '#e8a05a' : '#7fe08a'); ctx.fillStyle = '#ddd'; ctx.fillText('ABC'[i], p[0] - cam.x, p[1] - cam.y + 16); });
    let cp = done ? N.LIFT : N.D; if (TRAIN) cp = trainPos(TRAIN.pts, Math.min(1, (performance.now() / 1000 - TRAIN.t0) / TRAIN.dur));
    const cx = cp[0] - cam.x, cy = cp[1] - cam.y; ctx.fillStyle = '#3a3440'; ctx.fillRect(cx - 12, cy - 12, 24, 16); ctx.fillStyle = '#6a5a7a'; ctx.fillRect(cx - 9, cy - 18, 18, 7); circ(cx - 7, cy + 5, 3, '#222'); circ(cx + 7, cy + 5, 3, '#222'); },
  trainbell: (x, y, t) => { ctx.fillStyle = '#4a3a2a'; ctx.fillRect(x - 3, y - 34, 6, 34); const s = TRAIN ? Math.sin(t * 18) * 0.4 : 0; ctx.save(); ctx.translate(x, y - 34); ctx.rotate(s); poly([-9, 14, 9, 14, 6, 0, -6, 0], '#d8b050'); ctx.restore();
    ctx.font = `9px ${FONT}`; ctx.textAlign = 'center'; ctx.fillStyle = '#ffd36e'; ctx.fillText('SEND', x, y + 10); },
  trainswitch: (x, y, t, e) => { const on = hero.flags['tsw' + e.n]; ctx.fillStyle = '#3a3a4a'; ctx.fillRect(x - 10, y - 8, 20, 8); line(x, y - 6, x + (on ? 12 : -12), y - 24, '#aaa', 4); circ(x + (on ? 12 : -12), y - 24, 5, on ? '#e8a05a' : '#7fe08a');
    ctx.font = `9px ${FONT}`; ctx.textAlign = 'center'; ctx.fillStyle = on ? '#e8a05a' : '#7fe08a'; ctx.fillText(`${'ABC'[e.n]}:${on ? 'BRANCH' : 'MAIN'}`, x, y + 10); },
  loftmirror: (x, y, t) => { ctx.fillStyle = '#5a4a3a'; ctx.fillRect(x - 16, y - 44, 32, 40); ctx.fillStyle = '#9ab0c8'; ctx.fillRect(x - 12, y - 40, 24, 32); for (let i = 0; i < 6; i++) circ(x - 14 + i * 5.6, y - 46, 2, i === 2 ? '#ffe8a0' : '#555'); },
});
{ const _dn = drawNPC; drawNPC = function (kind, x, y, t, look) { if (kind !== 'pell') return _dn.apply(this, arguments);
  const b = Math.sin(t * 2.2) * 1.2, bl = blinkAt(t, x); ell(x, y + 1, 12, 4, 'rgba(0,0,0,.3)');
  ctx.fillStyle = '#7a5a3a'; ctx.fillRect(x - 3, y - 6, 2, 6); ctx.fillRect(x + 1, y - 6, 2, 6);
  ell(x, y - 16 + b, 11, 11, '#b07a4a'); ell(x + 2, y - 13 + b, 6, 7, '#e8d0a8');
  poly([x + 9, y - 22 + b, x + 18, y - 19 + b, x + 9, y - 17 + b], '#e8a030');
  eyes(x + 3, y - 22 + b, 3, 1.6, '#2a1a10', bl); poly([x - 6, y - 26 + b, x - 2, y - 34 + b, x + 1, y - 26 + b], '#7a4a2a');
  ctx.fillStyle = '#c84a6a'; ctx.fillRect(x - 8, y - 9 + b, 16, 3); }; }
