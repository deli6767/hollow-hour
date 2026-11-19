/* ===================== CHAPTER 3 · TIDELOCK chunk G (v1.6-c8): MID-BOSS · THE BILGEWATER TWINS =====================
   Behind the Twin Sluices door in The Weir Stairs (weir x29 rows 5-6 -> 'sluices'). OPTIONAL (not on any ending's critical path).
   Gimmick: two bodies, ONE hinge. They take turns: each round you face whichever twin's TURN it is (STRIKE/CHAT hit that twin),
   then that twin attacks and the turn passes to the other. Each twin has its own HP + calm. Every 3rd round they share the hinge (joint attack).
   SPARE: both twins must be spareable (calm 100, or HP <= 25% after you have ACTed with that twin). Releasing early only gets a polite refusal.
   KILL ONE: the survivor changes ("alone" form): new track, new attack, new ACTs, calm resets. Spare the survivor -> bilge_half; kill -> killed_bilgewater.
   Flags: bilgewater_done, spared_bilgewater | killed_bilgewater, bilge_half, bilge_result ('spared'|'half'|'killed'). */
for (const y of [5, 6]) ROOMS.weir.map[y] = ROOMS.weir.map[y].slice(0, 29) + '.';
ROOMS.weir.exits.push({ x: 29, y: 5, w: 1, h: 2, to: 'sluices', tx: 1, ty: 5 });
{ const d = ROOMS.weir.ents.find(e => e.look === 'twindoor'); d.y = 4; d.run = async () => hero.flags.bilgewater_done
    ? say('', 'THE TWIN SLUICES. Two doors, one hinge.', hero.flags.bilge_result === 'spared' ? 'Both doors stand open, politely, at exactly the same time.' : 'One door hangs open. The other one will not move on its own any more.')
    : say('', 'THE TWIN SLUICES. Two doors, side by side, sharing one hinge.', 'From behind them: two voices arguing about whose turn it is to open.', '(The doorway to the east is ajar. Rest at the chime first.)'); }
// Tier S (v1.7-c3): the doorway at x29 is passable since this chunk, so the weir.js 'SEALED' label was stale. Before the Twins: 'AJAR'; after: doors drawn open, no label.
THING.twindoor = (x, y, t) => { const f = hero.flags; ctx.fillStyle = '#3a2a1a';
  if (!f.bilgewater_done) { ctx.fillRect(x - 16, y - 34, 14, 34); ctx.fillRect(x + 4, y - 34, 12, 34); ctx.fillStyle = '#c8a050'; ctx.fillRect(x, y - 30, 4, 26);
    ctx.font = `10px ${FONT}`; ctx.textAlign = 'center'; ctx.fillStyle = '#d8b060'; ctx.fillText('AJAR', x, y - 40); return; }
  ctx.fillStyle = '#1a1410'; ctx.fillRect(x - 12, y - 34, 24, 34); ctx.fillStyle = '#3a2a1a';
  if (f.bilge_result === 'spared') { ctx.fillRect(x - 18, y - 34, 6, 34); ctx.fillRect(x + 12, y - 34, 6, 34); }
  else { ctx.fillRect(x - 18, y - 34, 6, 34); ctx.fillRect(x + 2, y - 34, 14, 34); } ctx.fillStyle = '#c8a050'; ctx.fillRect(x - 1, y - 36, 2, 4); };
ROOMS.sluices = { name: 'The Twin Sluices', area: 'tide3', theme: 'tide', track: 'tide', map: [
  '################',
  '#TTTTTTTTTTTTTT#',
  '#..~~~~..~~~~..#',
  '#..====..====..#',
  '#..............#',
  '...............#',
  '...............#',
  '#..............#',
  '#..====..====..#',
  '#..~~~~..~~~~..#',
  '#TTTTTTTTTTTTTT#',
  '################'],
  exits: [{ x: 0, y: 5, w: 1, h: 2, to: 'weir', tx: 28, ty: 5 }],
  ents: [
    { t: 'boss', enemy: 'bilgewater', x: 11, y: 5, flag: 'bilgewater_done' },
    { t: 'trigger', x: 6, y: 4, w: 1, h: 4, flag: 'bilgewater_done', run: async () => { hero.dir = 1; shake(5, 0.4); VOICES.SLOSH = 190; VOICES.TRICKLE = 620;
      await say('SLOSH', 'Ah! A visitor! Trickle, a VISITOR. Open the door for them.');
      await say('TRICKLE', 'It is YOUR turn to open the door. I opened it last time.');
      await say('SLOSH', 'Last time was forty years ago!'); await say('TRICKLE', 'Exactly. So it is YOUR turn.');
      await say('SLOSH', 'Visitor! You settle it. Whose turn is it?'); await say('TRICKLE', '(whispering) say Slosh. say Slosh.');
      startBattle('bilgewater', { boss: true }); } },
    { t: 'sign', x: 3, y: 4, text: ['A rota is nailed to the wall. Every day for forty years says "S" and then "T" and then "S?" and then "T??".', 'The last entry just says "BOTH".'] , show: () => !!hero.flags.bilgewater_done },
  ] };
VOICES.SLOSH = 190; VOICES.TRICKLE = 620;
/* ---- music: call-and-response (low twin / high twin), plus a hollow solo variant ---- */
TRACKS.bilge = { bpm: 154, root: 43, bt: 'sawtooth', bass: [0, _, 0, _, 7, _, 0, _, 5, _, 5, _, 12, _, 5, _, 3, _, 3, _, 10, _, 3, _, 7, _, 7, _, 2, 5, 7, _],
  lead: [12, 15, 17, _, _, _, 24, 27, 29, _, _, _, 12, 15, 19, _, _, _, 24, 27, 31, _, 29, 27, 17, _, 15, _, 29, _, 27, _], lt: 'square', lv: 0.065, kick: 2, hat: 2 };
TRACKS.bilgeLone = { bpm: 104, root: 43, bt: 'triangle', bass: [0, _, _, _, 7, _, _, _, 5, _, _, _, 3, _, _, _, 0, _, _, _, 7, _, _, _, 8, _, _, _, 7, _, _, _],
  lead: [12, _, 15, _, 17, _, _, _, _, _, _, _, 12, _, 15, _, 19, _, _, _, _, _, _, _, 17, _, 15, _, 12, _, _, _], lt: 'sine', lv: 0.1, kick: 0, hat: 0 };
/* ---- attacks (all telegraphed; patbot-verified) ---- */
// SLOSH · BAIL IN: he tips bucket after bucket into the box; the water line rises in marked steps (0.8 s outline), then drains.
// The top 40% of the box is always dry. Sparse drips fall from above (0.5 s marker).
A.bailIn = { name: 'Bail In', dur: 8, size: [280, 200], desc: 'Slosh fills the box. the water line rises in marked steps; the top stays dry',
  run(S) { const lv = [0.36, 0.56, 0.7, 0.56, 0.36]; /* c19: was 0.3/0.5/0.66 */ /* c10 tune: was 0.22/0.4/0.58, drips 0.9 s @95 */
    lv.forEach((f, i) => S.at(0.3 + i * 1.45 / S.d, () => { const h = arena.h * f; sfx('warn'); zone(0, hh() - h / 2, arena.w + 4, h, 0.8, 1.45 / S.d - 0.75, { col: '#3a8ad8', dmg: 4 }); }));
    S.every(0.08 / S.d, () => shot(rand(-hw() + 12, hw() - 12), -hh() - 6, 0, 210 * S.d /* c21: was .09 @195 */, 6, '#9ad8ff', { warn: 0.35 }), 0.6, 7.4); } };
// TRICKLE · BAIL OUT: she flings ladlefuls sideways out of the box. 5 rows; each volley marks 2 rows (never the same pair twice).
A.bailOut = { name: 'Bail Out', dur: 7, size: [280, 190], desc: 'Trickle ladles water out sideways along marked rows',
  run(S) { const N = 5, rh = () => arena.h / N; let lastK = '';
    S.every(0.25 / S.d, n => { let a, b, k; /* c21: was 0.34 @300 */ /* c19: was 0.42 @270 */ /* c10 tune: was 0.8 s @165 */ do { a = irand(0, N - 1); b = irand(0, N - 1); k = Math.min(a, b) + ',' + Math.max(a, b); } while (a === b || k === lastK); lastK = k;
      const side = n % 2 ? 1 : -1; sfx('warn');
      for (const r of [a, b]) { const y = -hh() + rh() * (r + 0.5); /* v2.0.3: 2x lead (0.45 -> 0.9 s) + a lit lane across the whole row; speed unchanged (340) */
        laser(side * (hw() + 6), y, side > 0 ? Math.PI : 0, rh() * 0.7, 0.9, 0, { harmless: true, len: arena.w + 12, col: '#bfe8ff' });
        shot(side * (hw() + 6), y, -side * 340 * S.d, 0, 10, '#bfe8ff', { warn: 0.9 }); } }, 0.2, 5.75); } };
// BOTH · SHARED HINGE: the twin doors swing in from alternating sides; each door has one gap that drifts gently.
A.sharedHinge = { name: 'Shared Hinge', dur: 8, size: [300, 200], desc: 'two doors, one hinge. they swing in from alternating sides, each door pair shares one gap',
  run(S) { let gy = 0;
    S.every(0.62 / S.d, n => { /* c21: was 0.85 @140, drift 50 */ /* c19: was 1.2 @108, drift 30, gap 38 */ if (n % 2 === 0) gy = clamp(gy + rand(-74, 74), -hh() + 40, hh() - 40); const side = n % 2 ? 1 : -1;
      wallPair(side * (hw() + 10), -side * 160 * S.d, gy, 30, side > 0 ? '#8a6a48' : '#6a8aa8'); }, 0.2, 7.2);
  } };
// ALONE · HALF A HINGE: only one door now, always from the survivor's side; a shallow marked flood covers the floor.
A.halfHinge = { name: 'Half a Hinge', dur: 8, size: [300, 200], desc: 'one door, swinging alone. the water does not go down any more',
  run(S) { let gy = -20;
    S.at(0.1, () => { sfx('warn'); zone(0, hh() - arena.h * 0.11, arena.w + 4, arena.h * 0.22, 0.9, 7.6, { col: '#3a6aa8', dmg: 4 }); });
    S.every(0.6 / S.d, n => { /* c21: was 0.7 @150, drift 46 */ /* c19: was 0.95 @118, drift 30, gap 32 */ gy = clamp(gy + rand(-54, 54), -hh() + 34, hh() - arena.h * 0.22 - 30); wallPair(-hw() - 10, 165 * S.d, gy, 27, '#7a7a8a'); }, 0.9, 7.2); } };
for (const k of ['bailIn', 'bailOut', 'sharedHinge', 'halfHinge']) A[k].id = k;
/* ---- the twins ---- */
const BILGE_BASE = { boss: true, hp: 70, critHits: 8, def: 1, atk: 1.25, torque: 40, cogs: 45, d: 1.12, art: 'bilgewater', track: 'bilge', mini: 0.32,
  intro: 'THE BILGEWATER TWINS block the sluice! It is SLOSH\'s turn. (Probably.)' };
const TWIN_E = [
  Object.assign({}, BILGE_BASE, { id: 'bilgewater', name: 'SLOSH', title: 'the Bilgewater Twin who bails in', voice: 190, attacks: ['bailIn'],
    check: 'EDGE 7 · PLATING 1 · the big twin. bails water IN so the lock never empties. thinks it is Trickle\'s turn.',
    flavor: ['Slosh tips a bucket into the bilge. Trickle immediately ladles it back out.', 'Slosh is counting on his fingers. He keeps getting "your turn".', 'Smells like canal water and peppermint.'],
    calm: 'Slosh has set his bucket down, very gently.',
    talk: ['IT\'S YOUR TURN!', 'i opened it in the spring of... some spring!', 'visitor, tell her!', 'one hinge. TWO of us. you do the maths.'],
    acts: {
      'Bail Together': b => ({ t: ['You grab a bucket and bail alongside Slosh.', 'For a moment you are both very wet and very in time.'], c: 35, say: 'HA! a natural!' }),
      'Agree With Slosh': b => b.n('Agree With Trickle') ? ({ t: ['You tell Slosh he\'s right.', 'You already told Trickle SHE was right.', 'Slosh opens his mouth to argue and finds nothing in it.'], c: 45, say: '...we\'re BOTH right? is that allowed?' })
        : ({ t: ['You tell Slosh he\'s right. It\'s Trickle\'s turn.', 'Slosh beams. Trickle, offstage, gasps.'], c: 20, say: 'SEE?! the visitor KNOWS.' }),
      'Admire Bucket': b => ({ t: ['You admire Slosh\'s bucket. It has forty years of dents in it.', 'He holds it up to the light.'], c: 25, say: 'this dent is from the flood of... ah, every flood.' }),
    }, spare: '', kill: '' }),
  Object.assign({}, BILGE_BASE, { id: 'bilgewater', name: 'TRICKLE', title: 'the Bilgewater Twin who bails out', voice: 620, attacks: ['bailOut'],
    check: 'EDGE 7 · PLATING 1 · the small twin. bails water OUT so the lock never fills. thinks it is Slosh\'s turn.',
    flavor: ['Trickle ladles a spoonful out of the box. Very precisely.', 'Trickle is keeping score on her sleeve. Both columns say forty.', 'Trickle hums the tide song a tiny bit too fast.'],
    calm: 'Trickle has hung her ladle on the hinge.',
    talk: ['it is HIS turn.', 'i keep a rota. the rota is clear.', 'he always says that.', 'one of us has to go first. it is not going to be me.'],
    acts: {
      'Hold Ladle': b => ({ t: ['You hold the ladle steady while Trickle measures.', 'She nods. "Exactly one ladle. Good."'], c: 35, say: 'you have very steady hands. for a visitor.' }),
      'Agree With Trickle': b => b.n('Agree With Slosh') ? ({ t: ['You tell Trickle she\'s right.', 'You already told Slosh HE was right.', 'Trickle checks the rota. The rota does not cover this.'], c: 45, say: '...both of us? at once? oh.' })
        : ({ t: ['You tell Trickle she\'s right. It\'s Slosh\'s turn.', 'Trickle writes this down. Twice.'], c: 20, say: 'thank you. it\'s going in the rota.' }),
      'Read the Rota': b => ({ t: ['You read Trickle\'s rota out loud. Forty years of S, T, S, T.', 'Near the end the letters get smaller, like someone was tired.'], c: 25, say: '...i was tired. don\'t tell him.' }),
    }, spare: '', kill: '' }),
];
ENEMIES.bilgewater = TWIN_E[0];
const LONE_E = i => Object.assign({}, BILGE_BASE, { id: 'bilgewater', name: TWIN_E[i].name, title: 'alone', voice: TWIN_E[i].voice, d: 1.2, atk: 1.35, track: 'bilgeLone', attacks: ['halfHinge', TWIN_E[i].attacks[0]],
  check: `EDGE 8 · PLATING 1 · ${TWIN_E[i].name} has nobody to argue with. it is always ${i ? 'her' : 'his'} turn now.`,
  flavor: [`${TWIN_E[i].name} keeps turning to the empty side of the hinge.`, 'The water in the box does not go down any more.', `${TWIN_E[i].name} says "your turn" to nobody.`],
  calm: `${TWIN_E[i].name} is sitting by the other door.`,
  turns: ['...your turn.', '...your turn?', 'it was always going to be one of us first.', 'i would have let them go first. i would have.'],
  acts: {
    'Hold the Other Door': b => ({ t: [`You put your hand on the other door. It is heavier than it looks.`, `${TWIN_E[i].name} watches you hold it.`], c: 40, say: 'that\'s how it goes. like that.' }),
    'Sit With Them': b => ({ t: [`You sit by the hinge with ${TWIN_E[i].name}. Neither of you says whose turn it is.`], c: 35, say: '...' }),
    'Say Sorry': b => ({ t: ['You say sorry.', `${TWIN_E[i].name} nods, slowly, like that is a word that needs both hands.`], c: 25, say: 'me too.' }),
  },
  spare: `${TWIN_E[i].name} props both doors open with the two buckets and walks off toward the basin, keeping one hand on the wall.`,
  kill: 'The hinge creaks once and goes still. Water fills the bilge, slowly, and nobody bails it.' });
const twinsOK = tw => [0, 1].every(i => tw.dead === i || tw.calm[i] >= 100 || ((tw.talked && tw.talked[i]) && tw.hp[i] <= tw.max * 0.25));
function twinLoop(b) { (async () => { try { await enemyTurn(b); } catch (e) { console.error(e); }
  while (alive(b)) { try { const res = await playerTurn(b); if (!alive(b) || res === 'end') return; await enemyTurn(b); } catch (err) { console.error(err); if (!alive(b)) return; b.list = null; b.typer = null; } } })(); }
const twinSet = (b, i) => { const tw = b.tw; tw.cur = i; b.e = tw.dead >= 0 ? tw.lone : TWIN_E[i]; b.hp = b.shownHp = tw.hp[i]; b.calm = tw.calm[i]; b.talked = !!(tw.talked && tw.talked[i]); };
const twinStore = b => { const tw = b.tw; tw.hp[tw.cur] = b.hp; tw.calm[tw.cur] = b.calm; if (!tw.talked) tw.talked = [false, false]; tw.talked[tw.cur] = !!b.talked; };
{ const _sb = startBattle; startBattle = function (id, opts = {}) { const r = _sb.apply(this, arguments);
    if (id === 'bilgewater' && B && !opts.practice) B.tw = { cur: 0, hp: [B.maxhp, B.maxhp], calm: [0, 0], max: B.maxhp, dead: -1, round: 0, lone: null, talked: [false, false] };
    return r; }; }
{ const _et = enemyTurn; enemyTurn = async function (b) {
    if (!b || !b.tw || !alive(b)) return _et.apply(this, arguments);
    const tw = b.tw; twinStore(b); tw.round++;
    if (tw.dead < 0) {
      const joint = tw.round % 3 === 0; if (joint) { b.forceAtk = 'sharedHinge'; b.pendingSay = b.pendingSay || 'SLOSH & TRICKLE: ...ON THREE! one, two-' ; hhSting('bilgewater', 2); }
      const own = b.e; if (joint) b.e = Object.assign({}, own, { attacks: ['sharedHinge'], turns: null }); // base enemyTurn ignores forceAtk for bosses after turn 1
      await _et.call(this, b); if (!alive(b)) return; b.e = own; twinStore(b);
      const nx = 1 - tw.cur; twinSet(b, nx); sfx('blip', TWIN_E[nx].voice); return;
    }
    await _et.call(this, b); if (alive(b)) twinStore(b); }; }
{ const _ds = doSpare; doSpare = async function (b) {
    if (b && b.tw && b.tw.dead < 0) { twinStore(b); const tw = b.tw;
      if (!twinsOK(tw)) { const o = 1 - tw.cur; await bMsg(b, [`${TWIN_E[tw.cur].name} would happily stop. But ${TWIN_E[o].name} isn't ready.`, '(One hinge. They only stop together.)']); if (alive(b)) twinLoop(b); return; }
      hero.flags.bilge_result = 'spared';
      b.e = Object.assign({}, TWIN_E[tw.cur], { name: 'THE BILGEWATER TWINS', spare: 'SLOSH & TRICKLE: "...on three?" They open both doors at exactly the same time. It is, they agree, nobody\'s turn.' }); }
    else if (b && b.tw) hero.flags.bilge_result = 'half', hero.flags.bilge_half = true;
    return _ds.apply(this, arguments); }; }
{ const _dk = doKill; doKill = async function (b) {
    if (b && b.tw && b.tw.dead < 0) { const tw = b.tw, i = tw.cur, s = 1 - i;
      b.dying = 0.001; sfx('dust'); shake(8, 0.6); await bWait(b, 'pause', { pauseT: 1.2 }); if (!alive(b)) return; b.dying = 0;
      tw.dead = i; tw.hp[i] = 0; hero.kills++; hero.areaKills.tide3 = (hero.areaKills.tide3 || 0) + 1; hero.flags.bilge_killed1 = TWIN_E[i].name;
      tw.lone = LONE_E(s); tw.calm[s] = 0; twinSet(b, s); b.turn = 0; clearBullets(true); setTrack('bilgeLone'); sfx('phase'); b.flash = 0.5; hhSting('bilgewater', 3);
      await bMsg(b, [`${TWIN_E[i].name}'s ${i ? 'ladle' : 'bucket'} rolls across the floor and stops against the hinge.`]); if (!alive(b)) return;
      await bTalk(b, [`...${TWIN_E[i].name.toLowerCase()}?`, 'it was your turn.', 'it was your turn!'], TWIN_E[s].voice); if (!alive(b)) return;
      twinLoop(b); return; }
    if (b && b.tw) hero.flags.bilge_result = 'killed';
    return _dk.apply(this, arguments); }; }
/* ---- art: two figures on one hinge; the active twin bobs + gets a TURN arrow ---- */
ART.bilgewater = (x, y, t, s) => { const tw = typeof B !== 'undefined' && B && B.tw, cur = tw ? tw.cur : -1, dead = tw ? tw.dead : -1;
  ctx.fillStyle = '#5a4a38'; ctx.fillRect(x - 3, y - 70, 6, 110); circ(x, y - 72, 6, '#c8a050');
  for (const i of [0, 1]) { const sx = x + (i ? 58 : -58), on = cur === i, bob = on ? Math.sin(t * 5) * 4 : 0, yy = y + bob;
    ell(sx, y + 40, 30, 6, 'rgba(0,0,0,.3)');
    if (dead === i) { poly([sx - 16, y + 36, sx + 16, y + 30, sx + 20, y + 40, sx - 12, y + 44], '#6a6a72'); continue; }
    if (!i) { ell(sx, yy + 8, 30, 32, '#c8a032'); ell(sx, yy - 30, 20, 18, '#e8c8a0'); poly([sx - 24, yy - 38, sx + 24, yy - 38, sx + 16, yy - 52, sx - 16, yy - 52], '#d8b040');
      eyes(sx, yy - 30, 4, 3, '#202020', blinkAt(t)); poly([sx + 22, yy + 4, sx + 44, yy + 2, sx + 40, yy + 26, sx + 26, yy + 26], '#7a8a9a'); }
    else { ell(sx, yy + 10, 16, 30, '#4a7aa8'); ell(sx, yy - 30, 14, 15, '#e8c8a0'); poly([sx - 18, yy - 36, sx + 18, yy - 36, sx, yy - 56], '#3a6a98');
      eyes(sx, yy - 30, 3, 3, '#202020', blinkAt(t + 0.7)); line(sx - 16, yy - 6, sx - 34, yy + 22, '#c8c8d0', 3); circ(sx - 35, yy + 24, 6, '#c8c8d0'); }
    if (on) { ctx.font = `12px ${FONT}`; ctx.textAlign = 'center'; ctx.fillStyle = '#ffe14a'; ctx.fillText('▼ TURN', sx, yy - 66); } } };
