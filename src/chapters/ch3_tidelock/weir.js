/* ===================== CHAPTER 3 · TIDELOCK chunk F (v1.6-c7): THE WEIR STAIRS + FERRY'S LAPS =====================
   Long Lock east landing (x33, rows 6-7, open in BOTH tide states) -> The Weir Stairs: a terraced spillway stepping down east.
   Not tide-dependent (always fully connected). Save chime before the sealed Twin Sluices door (mid-boss next milestone day).
   New enemy Gullbell (enc 'tide3', its own pop so routes are unaffected). Secret: the lap-watch ledge lets you count Ferry's
   laps; tell him the number and it matches the keeper's logbook (Day 14,600). */
for (const st of [0, 1]) for (const y of [6, 7]) { const r = LOCK2_ROWS[st][y]; LOCK2_ROWS[st][y] = r.slice(0, 33) + '.'; }
ROOMS.lock2.exits.push({ x: 33, y: 6, w: 1, h: 2, to: 'weir', tx: 1, ty: 5 });
{ const i = ROOMS.lock2.ents.findIndex(e => e.t === 'sign' && e.x === 31); if (i >= 0) ROOMS.lock2.ents[i] = { t: 'sign', x: 31, y: 5, text: ['WEIR STAIRS · this way down.', '(Someone has unwedged the door. They left one of the two polite notes. It says KEEP.)'] }; }
ENC_TABLE.tide3 = []; AREA_POP.tide3 = 4; AREA_NAME.tide3 = 'The Tidelock';
ROOMS.weir = { name: 'The Weir Stairs', area: 'tide3', theme: 'tide', track: 'tide', enc: 'tide3', map: [
  '##############################',
  '#TTTTTTTTTTTTTTTTTTTTTTTTTTTT#',
  '#......~~~~......~~~~........#',
  '#..,,..~~~~..,,..~~~~..,,....#',
  '#......====......====........#',
  '.............................#',
  '.............................#',
  '#......====......====........#',
  '#..,,..~~~~..,,..~~~~..,,....#',
  '#......~~~~......~~~~........#',
  '#TTTTTTTTTTTTTTTTTTTTTTTTTTTT#',
  '##############################'],
  exits: [{ x: 0, y: 5, w: 1, h: 2, to: 'lock2', tx: 32, ty: 6 }],
  ents: [
    { t: 'sign', x: 3, y: 2, text: ['THE WEIR STAIRS. Each step is a little lower than the last.', 'The water goes down them. It never quite reaches the bottom.'] },
    { t: 'thing', look: 'lapledge', x: 13, y: 2, run: async () => lapWatch() },
    { t: 'thing', look: 'tally', x: 21, y: 9, run: async () => say('', 'Tally marks are scratched into the weir wall. Thousands of them, in bundles of five.', hero.flags.ferry_told ? 'You know whose they are now. You add one more, gently.' : 'Two hands made them. One neat, one wobbly. They take turns.') },
    { t: 'save', x: 25, y: 4 },
    { t: 'thing', look: 'twindoor', x: 28, y: 6, run: async () => say('', 'THE TWIN SLUICES. Two doors, side by side, sharing one hinge.', 'From behind them: two voices arguing about whose turn it is to open.', '(Not yet. Rest at the chime first.)') },
  ] };
// sealed door: the wall tile right of it stays solid; exit added in the mid-boss chunk
async function lapWatch() { const f = hero.flags, n = f.ferry_watch = Math.min(3, (f.ferry_watch || 0) + 1); VOICES.FERRY = 340;
  if (n === 1) return say('', 'From this ledge you can see all the way back to the basin. A little boat is going around in it.', 'You start counting. One lap.');
  if (n === 2) return say('', 'Two laps. Every time the boat passes the lock, a lamp in the keeper\'s window blinks.', 'Blink. A mark. Blink. A mark.');
  if (!f.ferry_counted) { f.ferry_counted = true; return say('', 'Three. You lose the thread, then find it again in the tally on the wall.', 'Fourteen thousand, six hundred... and three.', '(Ferry might want to know.)'); }
  return say('', 'The little boat keeps going around. The lamp keeps blinking.'); }
{ const _ft = ferryTalk; ferryTalk = async function () { const f = hero.flags;
  if (f.ferry_counted && !f.ferry_told) { f.ferry_told = true; VOICES.FERRY = 340;
    const c = await ask('FERRY', 'You\'ve got a look. Like you counted something.', ['TELL HIM', 'DON\'T']);
    if (c !== 0) { f.ferry_told = false; return say('FERRY', 'Good. Don\'t tell me. I like not knowing yet.'); }
    return say('FERRY', 'Fourteen thousand six hundred and three.', '...', 'That\'s the keeper\'s number. He writes a day each time I pass the window.', 'So I wasn\'t getting nowhere. I was getting him somewhere. One day at a time.', 'Huh. Wish I\'d known I was a clock.', '...Keep the count for me, would you? My arms are fine. It\'s the remembering that\'s heavy.'); }
  if (f.ferry_told && !f.ferry_after) { f.ferry_after = true; return say('FERRY', 'Lap fourteen thousand six hundred and four. Thank you for that. I mean it.'); }
  return _ft.apply(this, arguments); }; }
Object.assign(THING, {
  lapledge: (x, y, t) => { ctx.fillStyle = '#5a4a38'; ctx.fillRect(x - 14, y - 6, 28, 6); const a = t * 0.8; circ(x + Math.cos(a) * 8, y - 18 + Math.sin(a) * 3, 3, '#e8dcc0');
    ctx.font = `10px ${FONT}`; ctx.textAlign = 'center'; ctx.fillStyle = '#9ad8ff'; ctx.fillText('LOOKOUT', x, y - 28); },
  tally: (x, y, t) => { ctx.strokeStyle = '#c8b898'; ctx.lineWidth = 1.5; for (let g = 0; g < 3; g++) { const gx = x - 14 + g * 10; for (let i = 0; i < 4; i++) line(gx + i * 2, y - 22, gx + i * 2, y - 10, '#c8b898', 1.5); line(gx - 1, y - 12, gx + 8, y - 20, '#c8b898', 1.5); } },
  twindoor: (x, y, t) => { ctx.fillStyle = '#3a2a1a'; ctx.fillRect(x - 16, y - 34, 14, 34); ctx.fillRect(x + 2, y - 34, 14, 34); ctx.fillStyle = '#c8a050'; ctx.fillRect(x - 2, y - 30, 4, 26);
    ctx.font = `10px ${FONT}`; ctx.textAlign = 'center'; ctx.fillStyle = '#c86a5a'; ctx.fillText('SEALED', x, y - 40); },
});
/* ---- Gullbell: new Tidelock monster (patbot-verified) ---- */
A.gullDive = { name: 'Gull Dive', dur: 6.5, size: [270, 180], desc: 'gulls drop down marked lanes, two at a time, never the same lane twice in a row',
  run(S) { let last = -1; const lanes = 7;
    S.every(0.75 / S.d, n => { let a; do a = Math.floor(rand(0, lanes)); while (a === last); last = a; const b = (a + 2 + Math.floor(rand(0, lanes - 3))) % lanes; const lw = arena.w / lanes;
      for (const k of [a, b]) shot(-hw() + lw * (k + 0.5), -hh() - 6, 0, 150 * S.d, 7, '#e8e4d8', { warn: 0.65 }); sfx('warn'); }, 0.2, 5.8); } };
A.tollRipple = { name: 'Toll Ripple', dur: 6.5, size: [260, 190], desc: 'a bell tolls from a corner; slow rings of notes spread with wide spacing',
  run(S) { S.every(1.4 / S.d, n => { const cx = (n % 2 ? 1 : -1) * (hw() - 4), cy = -hh() + 4, k = 9, off = n * 0.17;
      for (let i = 0; i < k; i++) { const q = Math.PI / 2 * (n % 2 ? 1 : 0) + off + (Math.PI / 2) * (i / (k - 1)) * (n % 2 ? 1 : -1) + (n % 2 ? 0 : Math.PI);
        shot(cx, cy, Math.cos(q) * 70 * S.d, Math.abs(Math.sin(q)) * 70 * S.d, 5, '#ffd87a', { warn: 0.5 }); } sfx('warn'); }, 0.2, 5.6); } };
ENEMIES.gullbell = { id: 'gullbell', name: 'Gullbell', hp: 52, def: 1, atk: 1.2, torque: 10, cogs: 13, d: 1.05, attacks: ['gullDive', 'tollRipple'], art: 'gullbell', track: 'tidebattle', mini: 0.3,
  check: 'EDGE 6 · PLATING 1 · a gull wearing a bell. rings when hungry. is always hungry.',
  intro: 'A Gullbell swoops down, clanging!', flavor: ['Gullbell rings once for every boat it has ever seen leave. It has not rung in a while.', 'Gullbell eyes your pockets.', 'Gullbell hums the tide song slightly off-key.'], calm: 'Gullbell\'s bell has gone quiet.',
  talk: ['MINE.', 'mine?', 'ding.', 'boats used to have chips.'],
  acts: {
    'Share': B => ({ t: ['You offer a crumb from your pocket.', 'Gullbell takes it and rings very softly.'], c: 35, say: 'ding...' }),
    'Hum': B => ({ t: ['You hum the tide song.', B.n('Share') ? 'Gullbell joins in, on key this time.' : 'Gullbell clangs over you.'], c: B.n('Share') ? 60 : 10, say: B.n('Share') ? 'ding ding.' : 'MINE!' }),
    'Wave': B => ({ t: ['You wave like a boat leaving.', 'Gullbell watches you for a long time.'], c: 15, say: '...come back.' }),
  }, spare: 'Gullbell flies off toward the basin and rings once over Ferry\'s boat.', kill: 'Gullbell\'s bell rolls into the water. It rings once more, on the way down.' };
ENC_TABLE.tide3.push('gullbell', 'sluicesnail');
ART.gullbell = (x, y, t, s) => { const f = Math.sin(t * 6) * 10; ell(x, y + 24, 30, 6, 'rgba(0,0,0,.3)'); poly([x - 6, y - 4, x - 46, y - 10 - f, x - 10, y + 6], '#d8d4c8'); poly([x + 6, y - 4, x + 46, y - 10 - f, x + 10, y + 6], '#d8d4c8');
  ell(x, y, 16, 20, '#f0ece0'); poly([x + 10, y - 12, x + 24, y - 8, x + 10, y - 6], '#e8a040'); eyes(x + 4, y - 12, 3, 3, '#202020', blinkAt(t));
  const sw = Math.sin(t * 3) * 0.3; ctx.save(); ctx.translate(x, y + 18); ctx.rotate(sw); poly([-8, 0, 8, 0, 6, 14, -6, 14], '#c8a050'); circ(0, 16, 2, '#6a5030'); ctx.restore(); };
