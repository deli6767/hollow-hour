// v1.8-c13 hidden DEV WARP menu (developer only; never shown to normal players).
// v2.0.3 secret openers (anyone can use them; nothing on screen hints at them):
//   desktop = on the TITLE screen hold Shift and type 1 1 5 9 1 2 0 0 (top-row or numpad digits, <= 2 s between digits)
//   mobile  = SETTINGS, press and hold the 'Hold to confirm (battle)' button for 12 s -> code keypad -> 11591200. wrong code closes quietly.
// it never touches FILES 1-3 or records: dev runs save to scratch FILE 9 and every records/endings write is held in memory,
// then dropped (and FILE 9 wiped) when you go back to the title.
const DEV = { on: false, preset: 'peace', kit: true, metaBak: null };
const DEV_SLOT = 9;
const DEV_PRESETS = {
  peace: { label: 'PEACE (no kills)', kills: 0, f: { spared_wicklow: 1, spared_grit: 1, spared_cuckoo: 1 } },
  one: { label: 'ONE KILL', kills: 1, f: { spared_wicklow: 1, spared_grit: 1, spared_cuckoo: 1 } },
  mixed: { label: 'MIXED', kills: 5, f: { killed_wicklow: 1, spared_grit: 1, spared_cuckoo: 1 } },
  violent: { label: 'VIOLENT', kills: 20, f: { killed_wicklow: 1, killed_grit: 1, killed_cuckoo: 1 } },
  twelve: { label: '12:01 (peace + ticket)', kills: 0, f: { spared_wicklow: 1, spared_grit: 1, spared_cuckoo: 1, showTicket: 1, ws_visited: 1 } },
  lowtide: { label: 'LOW TIDE (peace + tide)', kills: 0, f: { spared_wicklow: 1, spared_grit: 1, spared_cuckoo: 1, lock_result: 'spared', tide_turned: true, bilge_result: 'spared', ferry_told: true } },
  understudy: { label: 'UNDERSTUDY (mixed + Pell)', kills: 2, f: { spared_wicklow: 1, spared_grit: 1, spared_cuckoo: 1, q_pell: 3, pell_duet: true } },
};
const DEV_TOGGLES = [['lock_result', 'spared', 'LK spared'], ['lock_result', 'killed', 'LK killed'], ['tide_turned', true, 'tide turned'], ['q_pell', 3, 'Pell q done'], ['pell_duet', true, 'Pell duet'],
  ['showTicket', 1, 'ticket'], ['ws_visited', 1, 'weightworks'], ['showPhoto', 1, 'photo'], ['q_candles', 3, 'candles q'], ['quill_result', 'spared', 'Quill spared']];
const DEV_BOSSES = [['wicklow', 'wickgate'], ['grit', 'cogworks2'], ['cuckoo', 'gallery'], ['bilgewater', 'sluices'], ['lockkeeper', 'keepertower'], ['quill', 'quilloffice']];
const DEV_ENDS = [['true', 'peace', 'spare', 'THE TOWN WINDS ON'], ['quiet', 'mixed', 'spare', 'MIDNIGHT, AT LAST'], ['cracked', 'mixed', 'kill', 'A CRACKED BELL'], ['still', 'violent', 'kill', 'THE STILL HOUR'],
  ['lowtide', 'lowtide', 'spare', 'LOW TIDE'], ['understudy', 'understudy', 'spare', 'THE UNDERSTUDY'], ['twelve', 'twelve', 'spare', 'THE 12:01']];
const DEV_TOG = {};
// --- scratch-session guard: FILE 9 + records held in memory ---
const _devStore = store;
store = (k, v) => { if (DEV.on && k === LS_META) return; if (DEV.on && k.startsWith(LS_SAVE) && k !== slotKey(DEV_SLOT)) return; _devStore(k, v); };
function devEnter() {
  if (!DEV.on) { DEV.on = true; DEV.metaBak = JSON.stringify(meta); }
  slot = DEV_SLOT; showScreen('dev');
}
function devExit() {
  if (!DEV.on) return; localStorage.removeItem(slotKey(DEV_SLOT)); DEV.on = false;
  meta = load(LS_META, DEF_META()); slot = 1; DEV.metaBak = null;
}
const _devToTitle = toTitle;
toTitle = () => { devExit(); _devToTitle(); };
{ const bp = $('b-play'), o = bp.onclick; bp.onclick = (e) => { devExit(); return o && o(e); }; }
function devHero() {
  const p = DEV_PRESETS[DEV.preset]; hero = newHero('DEV');
  if (DEV.kit) { Object.assign(hero, { coil: 8, torque: 420, weapon: 'wrench', armor: 'apron', items: ['pie', 'pie', 'tea', 'tea', 'cocoa', 'ember', 'ember', 'biscuit'] }); hero.glow = maxGlow(hero); }
  hero.kills = p.kills; hero.spares = 8; Object.assign(hero.flags, { intro: true, wicklow_done: true, grit_done: true, cuckoo_done: true }, p.f);
  if (p.kills) hero.areaKills = Object.assign({}, hero.areaKills, { rustwood: p.kills });
  for (const k in DEV_TOG) hero.flags[k] = DEV_TOG[k];
  return hero;
}
function devSpawn() { // nearest walkable tile to the room centre, not on an entity
  const m = RM.def.map, cx = m[0].length / 2, cy = m.length / 2, c = [];
  for (let y = 0; y < m.length; y++) for (let x = 0; x < m[0].length; x++) c.push([x, y, (x - cx) ** 2 + (y - cy) ** 2]);
  c.sort((a, b) => a[2] - b[2]);
  for (const [x, y] of c) { const px = x * TILE + 16, py = y * TILE + 24; if (blocked(px, py)) continue; if (RM.ents.some(e => Math.abs(e.x - x) <= 1 && Math.abs(e.y - y) <= 1)) continue; hero.x = px; hero.y = py; break; }
  camUpdate(true);
}
function devRoom(id, keepHero) {
  if (!keepHero) devHero(); B = null; DLG = null; busy = 0; CUT = null; clearBullets(false);
  showScreen(null); state = 'world'; enterRoom(id); devSpawn(); return hero;
}
function devBoss(id, room, merIdx) {
  devRoom(room); hero.dir = 0;
  if (id === 'meridian') hero.flags.meridian_met = true;
  startBattle(id, { boss: true });
  if (id === 'meridian' && merIdx && B && B.mer) { const m = B.mer; m.idx = merIdx; m.cracks = Math.floor(merIdx / MER_ATTACKS.length * 5.5); B.calm = Math.round(merIdx / MER_ATTACKS.length * 100); }
  return B;
}
// v2.0-c28 REVIEW THESE: one-tap warps to the milestone fights Delon should test (own run state, CHOICES toggles ignored)
const DEV_REVIEW = [
  ['grit', 'GRIT', 'peace', 'grit', 'cogworks2', null, 'numbers pass: rule timing + hazard pace'],
  ['twins', 'BILGEWATER TWINS', 'peace', 'bilgewater', 'sluices', null, 'Bail In / Bail Out + c21 pass'],
  ['cuckoo', 'MADAM CUCKOO', 'peace', 'cuckoo', 'gallery', null, 'numbers pass'],
  ['quill', 'ARCHIVIST QUILL', 'peace', 'quill', 'quilloffice', null, 'c16/c20 passes: ~0.6 hits/run'],
  ['lkwheel', 'LOCKKEEPER · THE WHEEL', 'peace', 'lockkeeper', 'keepertower', 'gateWheel', 'first attack = The Wheel: faster rings, tighter gap'],
  ['p5peace', 'MERIDIAN P5 · KEPT TIME', 'peace', 'meridian', 'belfry', 'peace', 'Peace route final phase'],
  ['p5twelve', 'MERIDIAN P5 · ONE MINUTE PAST', 'twelve', 'meridian', 'belfry', 'twelve', '12:01 route final phase'],
  ['p5one', 'MERIDIAN P5 · ONE STOPPED CLOCK', 'one', 'meridian', 'belfry', 'one', 'One-kill route final phase'],
  ['p5mixed', "MERIDIAN P5 · CAN'T DECIDE", 'mixed', 'meridian', 'belfry', 'mixed', 'Mixed route final phase'],
  ['p5violent', 'MERIDIAN P5 · LITTLE HAMMER', 'violent', 'meridian', 'belfry', 'violent', 'Violent route, hardest fight'],
  ['p5full', 'MERIDIAN · FULL DIAL', 'peace', 'meridian', 'belfry', 'full', "v2.0.3: Time's Up, then the box fills the whole screen"],
];
function devReview(key) {
  const r = DEV_REVIEW.find(x => x[0] === key); if (!r) return null; const [, , preset, id, room, extra] = r;
  const tog = Object.assign({}, DEV_TOG); for (const k in DEV_TOG) delete DEV_TOG[k];
  const kit = DEV.kit; DEV.preset = preset; DEV.kit = true;
  try {
    if (id === 'meridian' && extra === 'full') return devBoss('meridian', 'belfry', MER_ATTACKS.length - 1); /* v2.0.3: last attack -> FULL DIAL */
    if (id === 'meridian') { const b = devBoss('meridian', 'belfry', MER_ATTACKS.findIndex(a => a.phase === 4)); if (b && b.mer) b.mer.v5 = extra; return b; }
    const b = devBoss(id, room); if (b && extra) b.forceAtk = extra; return b;
  } finally { Object.assign(DEV_TOG, tog); DEV.kit = kit; }
}
function devEnding(preset, result) { DEV.preset = preset; devRoom('belfry'); hero.flags.meridian_met = true; startEnding(result); }
// --- DOM ---
(() => {
  const s = document.createElement('div'); s.className = 'screen'; s.id = 's-dev';
  $('s-title').parentNode.appendChild(s);
  const st = document.createElement('style');
  st.textContent = '#s-dev{background:#10141e;border-color:#6ad0ff;text-align:left;min-width:min(760px,96vw)}#s-dev h2{color:#6ad0ff;text-align:center;margin:2px 0}#s-dev h3{margin:10px 0 4px;color:#ffd36e;font-size:15px}#s-dev .grid{grid-template-columns:repeat(auto-fill,minmax(150px,1fr))}#s-dev .grid button{font-size:12px;padding:4px 8px}#s-dev .grid button.sel{background:#6ad0ff;color:#10141e}#s-dev{max-height:94vh;overflow-y:auto;-webkit-overflow-scrolling:touch}#dev-review button{border-color:#ffd36e}#dev-warn{color:#9fe0ff;font-size:12px;text-align:center}';
  document.head.appendChild(st);
})();
function buildDev() {
  const s = $('s-dev'); s.innerHTML = '';
  const add = (tag, txt, cls) => { const e = document.createElement(tag); if (txt != null) e.textContent = txt; if (cls) e.className = cls; s.appendChild(e); return e; };
  const grid = () => add('div', null, 'grid');
  const btn = (g, txt, fn, id, sel) => { const b = document.createElement('button'); b.textContent = txt; if (id) b.id = id; if (sel) b.classList.add('sel'); b.onclick = fn; g.appendChild(b); return b; };
  add('h2', 'DEV WARP');
  add('div', `scratch FILE ${DEV_SLOT} · FILES 1-3 and records are not touched · leaving to the title wipes FILE ${DEV_SLOT}`, 'sub').id = 'dev-warn';
  add('h3', 'REVIEW THESE (v2.0.3: test these first · each sets its own run state + LV8 kit · NORMAL HP meter shows what you would have taken)').id = 'dev-review-h';
  let g = grid(); g.id = 'dev-review';
  for (const [k, t, , , , , hint] of DEV_REVIEW) { const b = btn(g, t, () => devReview(k), 'dev-rv-' + k); const h = document.createElement('small'); h.textContent = hint; h.style.cssText = 'display:block;opacity:.7;font-size:10px'; b.appendChild(h); }
  add('h3', 'RUN STATE (applies to every warp)');
  g = grid(); for (const k in DEV_PRESETS) btn(g, DEV_PRESETS[k].label, () => { DEV.preset = k; buildDev(); $('dev-p-' + k).focus(); }, 'dev-p-' + k, DEV.preset === k);
  btn(g, DEV.kit ? 'LV8 kit: ON' : 'LV8 kit: OFF', () => { DEV.kit = !DEV.kit; buildDev(); $('dev-kit').focus(); }, 'dev-kit', DEV.kit);
  add('h3', 'CHOICES');
  g = grid(); DEV_TOGGLES.forEach(([k, v, l], i) => btn(g, l, () => { if (DEV_TOG[k] === v) delete DEV_TOG[k]; else DEV_TOG[k] = v; buildDev(); $('dev-t-' + i).focus(); }, 'dev-t-' + i, DEV_TOG[k] === v));
  add('h3', 'MERIDIAN · PHASE SELECT');
  g = grid(); MER_PHASES.forEach((ph, i) => { const idx = MER_ATTACKS.findIndex(a => a.phase === i); btn(g, `P${i + 1} ${ph.name || ''}`.trim(), () => devBoss('meridian', 'belfry', idx), 'dev-mer-' + (i + 1)); });
  for (let i = 12; i < MER_ATTACKS.length; i++) btn(g, `P5 · ${MER_ATTACKS[i].name}`, () => devBoss('meridian', 'belfry', i), 'dev-mera-' + i);
  add('h3', 'BOSSES');
  g = grid(); for (const [id, room] of DEV_BOSSES) btn(g, ENEMIES[id] ? ENEMIES[id].name : id, () => devBoss(id, room), 'dev-b-' + id);
  add('h3', 'ENDINGS (uses its own run state)');
  g = grid(); for (const [id, p, res, t] of DEV_ENDS) btn(g, t, () => devEnding(p, res), 'dev-e-' + id);
  add('h3', 'ROOMS');
  g = grid(); for (const id in ROOMS) btn(g, ROOMS[id].name, () => devRoom(id), 'dev-r-' + id);
  const r = add('div', null, 'row'); r.style.textAlign = 'center';
  const back = document.createElement('button'); back.textContent = 'BACK TO TITLE'; back.id = 'b-dev-back'; back.setAttribute('data-back', ''); back.onclick = () => toTitle(); r.appendChild(back);
}
{ const o = showScreen; showScreen = (n) => { if (n === 'dev') buildDev(); return o(n); }; }
/* v2.0.3 DEV MODE HEALTH: every battle started while DEV is on (warps, roamers, story fights in a dev run) gets the NORMAL HP meter (50_battle.js hhDevHpBar). */
{ const _sb = startBattle; startBattle = function (id, opts = {}) { const r = _sb.apply(this, arguments);
    if (DEV.on && B && !(opts && opts.practice)) { hero.glow = maxGlow(hero); B.devHp = { died: false }; }
    return r; }; }
// --- secret openers (title screen only) ---
const devTitleOn = () => { const t = $('s-title'); return t && t.classList.contains('on'); };
const DEV_CODE = '11591200', DEV_HOLD_MS = 12000, DEV_GAP_MS = 2000;
{ let seq = '', tl = 0;
  addEventListener('keydown', e => { const m = /^(?:Digit|Numpad)(\d)$/.exec(e.code || '');
    if (!e.shiftKey) { seq = ''; return; } if (!m) { if (!/^Shift/.test(e.code || '')) seq = ''; return; }
    if (!devTitleOn()) { seq = ''; return; } const now = performance.now(); if (now - tl > DEV_GAP_MS) seq = ''; tl = now;
    seq = (seq + m[1]).slice(-DEV_CODE.length); if (seq === DEV_CODE) { seq = ''; e.preventDefault(); devEnter(); } }, true); }
// mobile: 12 s hold on the Settings 'Hold to confirm (battle)' button opens the code keypad (a shorter press is a normal toggle)
(() => { const s = document.createElement('div'); s.className = 'screen'; s.id = 's-devcode';
  s.innerHTML = '<h2>· · ·</h2><div class="sub" id="devcode-show">&nbsp;</div><div class="grid" id="devcode-pad"></div><div class="row"><button id="devcode-back" data-back>BACK</button></div>';
  $('s-title').parentNode.appendChild(s);
  const st = document.createElement('style'); st.textContent = '#s-devcode{text-align:center}#s-devcode h2{margin:0}#devcode-show{font-size:22px;letter-spacing:8px;min-height:26px;margin:2px 0}#devcode-pad{display:grid;grid-template-columns:repeat(3,64px);gap:6px;justify-content:center;margin:4px auto}#devcode-pad button{font-size:20px;height:40px;padding:0;margin:0;text-align:center;touch-action:manipulation}#s-devcode .row button{margin-top:4px;padding:4px 16px}';
  document.head.appendChild(st);
  let code = ''; const show = () => { $('devcode-show').textContent = code ? '•'.repeat(code.length) : '\u00a0'; };
  const close = () => { code = ''; show(); showScreen('settings'); };
  const submit = () => { const ok = code === DEV_CODE; code = ''; show(); if (ok) devEnter(); else close(); };
  const pad = $('devcode-pad');
  for (const k of ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', 'OK']) { const b = document.createElement('button'); b.textContent = k; b.id = 'devcode-k' + (k === '⌫' ? 'del' : k === 'OK' ? 'ok' : k);
    b.onclick = () => { if (k === '⌫') code = code.slice(0, -1); else if (k === 'OK') return submit(); else { code += k; if (code.length >= DEV_CODE.length) return submit(); } show(); }; pad.appendChild(b); }
  $('devcode-back').onclick = () => close();
  window.__hhDevCode = { open: () => { code = ''; show(); showScreen('devcode'); } };
})();
const devHoldHook = () => { const body = $('settings-body'); if (!body) return;
  const row = [...body.querySelectorAll('.set')].find(d => { const l = d.querySelector('label'); return l && /^Hold to confirm/.test(l.textContent); }); if (!row) return;
  const btn = row.querySelector('button'); if (!btn || btn.__devHold) return; btn.__devHold = true; btn.style.webkitTouchCallout = 'none'; btn.style.userSelect = 'none';
  let tm = null, fired = false; const stop = () => { if (tm) { clearTimeout(tm); tm = null; } };
  btn.addEventListener('pointerdown', () => { stop(); fired = false; tm = setTimeout(() => { tm = null; fired = true; __hhDevCode.open(); }, DEV_HOLD_MS); });
  for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) btn.addEventListener(ev, stop);
  btn.addEventListener('contextmenu', e => e.preventDefault());
  btn.addEventListener('click', e => { if (fired) { fired = false; e.stopImmediatePropagation(); e.preventDefault(); } }, true); };
{ const o = buildSettings; buildSettings = function () { const r = o.apply(this, arguments); devHoldHook(); return r; }; }
window.__hhDev = { DEV, DEV_SLOT, CODE: DEV_CODE, HOLD_MS: DEV_HOLD_MS, enter: devEnter, exit: devExit, room: devRoom, boss: devBoss, ending: devEnding, review: devReview, REVIEW: DEV_REVIEW, hero: devHero, presets: DEV_PRESETS };
