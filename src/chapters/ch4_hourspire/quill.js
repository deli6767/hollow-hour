/* ===================== CHAPTER 4 · UNDERCROFT chunk Q (v1.7-c7): BOSS · ARCHIVIST QUILL (fight core) =====================
   Behind the ARCHIVIST door in the Reading Room -> The Archivist's Office (boss). Save chime is in the Reading Room just outside.
   Lore: Quill files everything that happens at 11:59. It has been writing YOUR entry since you woke. It cannot stop writing
   because nobody ever told it what the record is FOR.
   GIMMICK · YOUR RECORD: attacks read your save. Density scales with hero.kills (capped at 20 -> fair caps in every attack):
   more kills = more echoes / tighter ink gaps, never below the tested minimums. Peaceful files are lighter but faster to read.
   SPARE: calm 100 (needs 'Read Your Entry' before 'Correct the Record' works; 'Sign It' only at calm >= 60).
   KILL: HP 0. PHASE 2 "VOL. 2" at HP <= 50% while calm < 100: new track, finale attack 'yourRecord'.
   Flags: quill_done, spared_quill | killed_quill (generic boss flags), quill_result ('spared'|'killed'), quill_p2.
   Difficulty target: Lockkeeper (240 HP, d 1.16/1.24) < Quill (280 HP, d 1.2/1.28) < MERIDIAN. */
VOICES.QUILL = 760;
const qK = () => Math.min(20, Math.max(0, (typeof hero !== 'undefined' && hero && hero.kills) || 0));
TRACKS.quill = { bpm: 144, root: 41, bt: 'triangle', bass: [0, _, 7, _, 12, _, 7, _, 3, _, 10, _, 15, _, 10, _, 5, _, 12, _, 17, _, 12, _, 7, _, 2, _, 7, _, 11, _],
  lead: [24, 27, 31, _, 29, 27, 26, _, 27, _, 22, _, 24, _, _, _, 29, 31, 32, _, 31, 29, 27, _, 26, _, 31, _, 30, _, 31, _], lt: 'square', lv: 0.06, kick: 1, hat: 2 };
TRACKS.quill2 = { bpm: 176, root: 41, bt: 'sawtooth', bass: [0, 0, 12, 0, 10, 0, 7, 0, 3, 3, 15, 3, 10, 3, 7, 3, 5, 5, 17, 5, 12, 5, 8, 5, 7, 7, 19, 7, 11, 7, 14, 7],
  lead: [36, _, 34, 31, 34, _, 31, 29, 31, _, 27, _, 29, 31, 34, _, 36, _, 39, 38, 36, _, 34, _, 31, 34, 36, _, 35, _, 36, _], lt: 'square', lv: 0.06, kick: 2, hat: 2 };
// INK LINES: ruled lines descend from the top, one gap each; the gap drifts at most 24 px per line (1.2 s cadence). Gap 72 px at 0 kills, 56 at 20.
A.inkLines = { name: 'Ink Lines', dur: 7.5, size: [280, 200], desc: 'ruled lines fall from the top of the page, one gap each, drifting a little',
  run(S) { let gx = 0; const gap = (60 - qK() * 0.8) / 2; // c16 72->60
    S.every(0.9 / S.d, () => { gx = clamp(gx + rand(-40, 40), -hw() + 40, hw() - 40); const L = gx - gap, R = gx + gap, y = -hh() - 8, vy = 120 * S.d;
      bar((-hw() + L) / 2, y, L + hw(), 10, 0, vy, '#9a9af0', { warn: 0.6 }); bar((R + hw()) / 2, y, hw() - R, 10, 0, vy, '#9a9af0', { warn: 0.6 }); sfx('warn'); }, 0.2, 6.6); } };
// REDACTION: bars stamp across lanes (5 lanes); one lane stays clear, always the lane you are in or next to it. Volleys never overlap (next starts after the last went dark).
A.redaction = { name: 'Redaction', dur: 7, size: [290, 190], desc: 'whole lines get blacked out. one lane stays readable, always next to you',
  run(S) { const N = 5, wn = Math.max(0.44, 0.75 / S.d); S.every(Math.max(0.82, 1.1 / S.d), () => { const lh = arena.h / N, pl = clamp(Math.floor((P.y + hh()) / lh), 0, N - 1), safe = pl === 0 ? 1 : pl === N - 1 ? N - 2 : pl + (Math.random() < 0.5 ? -1 : 1); sfx('warn');
      for (let i = 0; i < N; i++) if (i !== safe) zone(0, -hh() + lh * (i + 0.5), arena.w + 2, lh + 1, wn, 0.25, { col: '#d8d0f0' }); }, 0.2, 6.6); } };
// ECHO OF RECORD: your past choices are read back as slow aimed notes from the corners. 2 notes per volley at 0 kills, up to 5 at 20.
A.recordEcho = { name: 'Echo of Record', dur: 7, size: [250, 200], desc: 'slow notes fly at you from the corners. more of them the more you have ended',
  run(S) { const n = 3 + Math.floor(qK() / 7); S.every(0.52 / S.d, v => { const cs = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
      for (let i = 0; i < n; i++) { const [cx, cy] = cs[(v + i) % 4], x = cx * (hw() - 8), y = cy * (hh() - 8), a = Math.atan2(P.y - y, P.x - x) + (i - (n - 1) / 2) * 0.2;
        shot(x, y, Math.cos(a) * 165 * S.d, Math.sin(a) * 165 * S.d, 7, qK() ? '#c84a6a' : '#ffd36e', { warn: 0.45 }); } sfx('warn'); }, 0.2, 6.2); } };
// QUILL STROKE: one pen-stroke laser at a time, from a box edge through a point near you; 0.85 s marked line, 0.3 s live.
A.quillStroke = { name: 'Quill Stroke', dur: 7, size: [260, 220], desc: 'the pen strikes a line through the page. one stroke at a time, marked first',
  run(S) { S.every(1.0 / S.d, n => { const sx = P.x < 0 ? 1 : -1, sy = P.y < 0 ? 1 : -1, x = n % 2 ? sx * hw() : rand(-hw() + 30, hw() - 30), y = n % 2 ? rand(-hh() + 30, hh() - 30) : sy * hh(); // always from the far side, so the stroke crosses the box toward you
      const tx = P.x + rand(-6, 6), ty = P.y + rand(-6, 6); laser(x, y, Math.atan2(ty - y, tx - x), 16, 0.6, 0.3, { col: '#b8a8ff' }); sfx('warn'); }, 0.2, 6.4); } };
// YOUR RECORD (phase 2 finale): ink lines fall (wide 80 px gap) while one corner echo note flies every 1.4 s.
A.yourRecord = { name: 'Your Record', dur: 9, size: [280, 210], desc: 'the whole entry at once: ink lines and echoes, both gentler than alone',
  run(S) { let gx = 0; S.every(1.3 / S.d, () => { gx = clamp(gx + rand(-26, 26), -hw() + 45, hw() - 45); const L = gx - 40, R = gx + 40, y = -hh() - 8, vy = 90 * S.d;
      bar((-hw() + L) / 2, y, L + hw(), 10, 0, vy, '#9a9af0', { warn: 0.6 }); bar((R + hw()) / 2, y, hw() - R, 10, 0, vy, '#9a9af0', { warn: 0.6 }); sfx('warn'); }, 0.2, 8.2);
    S.every(1.4 / S.d, v => { const cx = v % 2 ? 1 : -1, x = cx * (hw() - 8), y = hh() - 8, a = Math.atan2(P.y - y, P.x - x); shot(x, y, Math.cos(a) * 75 * S.d, Math.sin(a) * 75 * S.d, 6, '#c84a6a', { warn: 0.7 }); }, 0.9, 8.2); } };
for (const k of ['inkLines', 'redaction', 'recordEcho', 'quillStroke', 'yourRecord']) A[k].id = k;
ENEMIES.quill = { id: 'quill', name: 'ARCHIVIST QUILL', title: 'who files everything', boss: true, hp: 280, def: 3, atk: 1.6, torque: 110, cogs: 95, d: 1.7, voice: 760,
  attacks: ['inkLines', 'redaction', 'recordEcho', 'quillStroke'], art: 'quill', track: 'quill', mini: 0.22,
  check: 'EDGE 10 · PLATING 3 · an archivist made of a desk lamp, a ledger and one enormous pen. it is writing you down right now.',
  intro: 'ARCHIVIST QUILL dips its pen. The page turns to your name.',
  flavor: ['Quill writes something down. It looks up. It writes something else down.', 'The scratching never stops.', 'Smells like ink, dust and lamp oil.', 'Quill underlines a word twice.'],
  calm: 'Quill\'s pen is hovering, not writing.',
  talk: ['name. date. outcome.', 'everything is filed. EVERYTHING.', 'hold still. you are blurring the entry.', 'what is it FOR? do not ask me that.'],
  acts: {
    'Read Your Entry': b => ({ t: ['You lean over the ledger and read your own entry.', hero.kills ? `It lists everyone you ended: ${hero.kills} name${hero.kills > 1 ? 's' : ''}, each crossed out. Neatly.` : 'It is short. Mostly apologies to furniture.'], c: b.n('Read Your Entry') > 1 ? 10 : 15, say: b.n('Read Your Entry') > 1 ? 'yes. still you.' : 'no peeking! ...fine. peek.' }),
    'Correct the Record': b => b.n('Read Your Entry') ? ({ t: ['You find a line that isn\'t quite true and say so, gently.', 'Quill blinks. Nobody has ever corrected it before.'], c: b.n('Correct the Record') > 1 ? 10 : 25, say: '...an ERRATUM. how exciting.' })
      : ({ t: ['You tell Quill it has your entry wrong.', 'It hasn\'t let you read it yet. It is offended.'], c: -10, say: 'you have not even READ it.' }),
    'Ask What It\'s For': b => ({ t: ['"Who reads all this?"', b.n('Ask What It\'s For') > 1 ? 'Quill doesn\'t answer. Its pen has stopped.' : 'Quill opens its mouth. Closes it. Writes "who reads all this" down.'], c: b.n('Ask What It\'s For') > 1 ? 5 : 15, say: 'it is... for... the record?' }),
    'Sign It': b => b.calm >= 60 || b.signed ? (b.signed = true, { t: ['You take the pen, very carefully, and sign the bottom of your page.', 'A record somebody signed is a record somebody READ.'], c: b.n('Sign It') > 1 ? 5 : 30, say: 'oh. OH. that is what it was for.' })
      : ({ t: ['You reach for the pen. Quill snatches it back.', '(It isn\'t ready to let you.)'], c: 0, say: 'NOT the pen.' }),
  },
  spare: 'Quill closes the ledger. For the first time in forty years, the pen stops. The archive is very, very quiet.',
  kill: 'Quill\'s lamp goes out. The pen rolls off the desk and leaves one long line across the floor. The last entry is unfinished.' };
const QL2 = Object.assign({}, ENEMIES.quill, { title: 'VOL. 2', def: 4, atk: 1.7, d: 1.8, form2: true, track: 'quill2',
  attacks: ['yourRecord', 'inkLines', 'recordEcho', 'redaction', 'quillStroke'],
  check: 'EDGE 11 · PLATING 4 · it has started a second volume. it is writing faster than you can move.',
  flavor: ['The pages fly by. Every one has your name on it.', 'Ink drips off the ceiling.', 'Quill is writing with both hands now. It only has one hand.'],
  turns: ['VOL. 2! it does not END! nothing ends! it is all FILED!', 'if i stop writing, it did not happen!', 'hold STILL-', '...who is going to read it?'] });
{ const _sb = startBattle; startBattle = function (id, opts = {}) { const r = _sb.apply(this, arguments); if (id === 'quill' && B && !opts.practice) B.ql = { p2: false }; return r; }; }
async function qlVol2(b) { b.ql.p2 = true; clearBullets(true); sfx('phase'); shake(10, 0.7); b.flash = 0.6; setTrack('quill2'); hero.flags.quill_p2 = true;
  await bTalk(b, ['VOLUME ONE IS FULL.', 'there is always a volume two. ALWAYS.'], 120); if (!alive(b)) return;
  b.e = QL2; b.turn = 0; b.calm = Math.round(b.calm * 0.5); { const h = Math.min(5, maxGlow(hero) - hero.glow); if (h > 0) { hero.glow += h; b.glowFlash = 0.5; } }
  await bMsg(b, 'Quill tears out a fresh page. The scratching doubles.'); }
{ const _et = enemyTurn; enemyTurn = async function (b) {
    if (b && b.ql && !b.opts.practice && !b.ql.p2 && b.hp <= b.maxhp * 0.5 && b.calm < 100) { await qlVol2(b); if (!alive(b)) return; }
    return _et.apply(this, arguments); }; }
{ const _ds = doSpare; doSpare = async function (b) { if (b && b.ql && !b.opts.practice) { hero.flags.quill_done = true; hero.flags.quill_result = 'spared'; } return _ds.apply(this, arguments); }; }
{ const _dk = doKill; doKill = async function (b) { if (b && b.ql && !b.opts.practice) { hero.flags.quill_done = true; hero.flags.quill_result = 'killed'; } return _dk.apply(this, arguments); }; }
ART.quill = (x, y, t, s) => { const p2 = typeof B !== 'undefined' && B && B.ql && B.ql.p2, b = Math.sin(t * 1.5) * 2, yy = y + b;
  ell(x, y + 52, 50, 8, 'rgba(0,0,0,.35)'); ctx.fillStyle = '#4a3a30'; ctx.fillRect(x - 46, y + 10, 92, 12); ctx.fillRect(x - 40, y + 22, 8, 30); ctx.fillRect(x + 32, y + 22, 8, 30);
  ctx.fillStyle = '#f4ecd8'; ctx.fillRect(x - 34, y + 2, 30, 10); ctx.fillRect(x - 2, y + 2, 30, 10); ctx.fillStyle = '#8a9ab8'; for (let i = 0; i < 3; i++) { ctx.fillRect(x - 30, y + 4 + i * 2.5, 22, 1); ctx.fillRect(x + 2, y + 4 + i * 2.5, 22, 1); }
  ctx.fillStyle = '#3a3440'; ctx.fillRect(x - 6, yy - 46, 12, 48); circ(x, yy - 52, 18, '#5a5068'); ctx.save(); ctx.globalAlpha = 0.35 + Math.sin(t * 4) * 0.08; circ(x, yy - 46, 30, p2 ? '#ff8a6a' : '#ffe8a0'); ctx.restore();
  poly([x - 20, yy - 60, x + 20, yy - 60, x + 12, yy - 76, x - 12, yy - 76], '#2a2a3a'); eyes(x, yy - 52, 6, 3, p2 ? '#ff6a5a' : '#ffd36e', blinkAt(t));
  const pa = Math.sin(t * (p2 ? 9 : 5)) * 0.25 - 0.6; ctx.save(); ctx.translate(x + 26, yy - 20); ctx.rotate(pa); poly([0, 0, 6, -54, 14, -70, 2, -50], '#e8dcc0'); line(0, 0, 3, -40, '#8a7a9a', 1.5); ctx.restore(); };
/* ---- the office (boss room) + the Reading Room door ---- */
ROOMS.quilloffice = { name: 'The Archivist\'s Office', area: 'under2', theme: 'under', track: 'tower', map: [
  '##############',
  '#TTTTTTTTTTTT#',
  '#............#',
  '#............#',
  '#............#',
  '#............#',
  '#............#',
  '#............#',
  '#............#',
  '#TTT......TTT#',
  '####......####'],
  exits: [{ x: 4, y: 10, w: 6, h: 1, to: 'under4', tx: 10, ty: 3 }],
  ents: [
    { t: 'boss', enemy: 'quill', x: 7, y: 3, flag: 'quill_done' },
    { t: 'trigger', x: 1, y: 6, w: 12, h: 1, flag: 'quill_done', run: async () => { hero.dir = 0; shake(4, 0.5); sfx('bell');
      await say('ARCHIVIST QUILL', `${hero.name}. COIL ${hero.coil}. Arrived: 11:59. Of course. Everyone arrives at 11:59.`);
      await say('ARCHIVIST QUILL', hero.kills ? `Let go of ${hero.spares}. Ended ${hero.kills}. I wrote every one. I am still writing.` : `Let go of ${hero.spares}. Ended none. A short entry. I keep checking it for mistakes.`);
      await say('ARCHIVIST QUILL', 'You are not supposed to be in the archive. You are supposed to be IN the record.', 'Hold still. I need to finish your page.');
      startBattle('quill', { boss: true }); } },
    { t: 'sign', x: 2, y: 2, show: () => hero.flags.quill_result === 'killed', text: ['The ledger lies open at your page. The last line trails off the edge.', 'Nobody will finish it now.'] },
    { t: 'sign', x: 2, y: 2, show: () => hero.flags.quill_result === 'spared', text: ['The ledger is closed. On the cover, in fresh ink: "READ."'] },
  ] };
{ const R = ROOMS.under4; R.map[1] = '#' + 'T'.repeat(18) + '#'; R.ents = R.ents.filter(e => !(e.t === 'gate' && e.flag === 'archivist_open'));
  const d = R.ents.find(e => e.look === 'ucdoor'); if (d) d.run = async () => { const f = hero.flags;
    if (!f.quill_door) { f.quill_door = true; await say('', 'ARCHIVIST. "DO NOT DISTURB. FILING YOU."', 'The handle is warm, like someone was just holding it from the other side.', 'You open the door. The scratching stops for exactly one second.'); }
    return enterRoom('quilloffice', 7, 8); }; }
