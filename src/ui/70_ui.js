/* ===================== DOM SCREENS ===================== */
function $(id) { return document.getElementById(id); }
let settingsBack = 'title', prevState = null;
const tableHTML = rows => rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('');
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('on'));
  uiOpen = !!name; for (const k in keys) keys[k] = false; resetTouch();
  if (!name) return;
  ({ files: buildFiles, title: buildTitle, settings: buildSettings, practice: buildPractice, records: buildRecords, rush: buildRush }[name] || (() => {}))();
  $('s-' + name).classList.add('on');
  setTimeout(() => { const f = visibleFocusables()[0]; if (f && name !== 'name') f.focus({ preventScroll: true }); if (name === 'name') { $('name-in').focus(); $('name-in').select(); } }, 30);
}
function visibleFocusables() { const s = document.querySelector('.screen.on'); return s ? [...s.querySelectorAll('button:not(:disabled),input[type=range]')] : []; }
function domNav(e) {
  const els = visibleFocusables(); if (!els.length) return; const i = els.indexOf(document.activeElement);
  const isRange = document.activeElement && document.activeElement.type === 'range';
  if (['ArrowDown', 'ArrowUp', 'KeyS', 'KeyW'].includes(e.code) || (!isRange && ['ArrowRight', 'ArrowLeft', 'KeyD', 'KeyA'].includes(e.code))) {
    e.preventDefault(); const fwd = ['ArrowDown', 'ArrowRight', 'KeyS', 'KeyD'].includes(e.code); const n = i < 0 ? 0 : (i + (fwd ? 1 : -1) + els.length) % els.length; els[n].focus(); els[n].scrollIntoView({ block: 'nearest' }); sfx('move'); return; }
  if (['KeyZ', 'Enter', 'Space'].includes(e.code)) { e.preventDefault(); if (i >= 0 && els[i].tagName === 'BUTTON') els[i].click(); return; }
  if (['KeyX', 'Escape', 'Backspace'].includes(e.code)) { e.preventDefault(); const b = document.querySelector('.screen.on [data-back]'); if (b) b.click(); }
}
document.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; audioInit(); sfx('select'); if (b.dataset.go) { if (b.dataset.go === 'settings') settingsBack = 'title'; showScreen(b.dataset.go); } });
function buildTitle() {
  const ends = Object.keys(meta.endings).length;
  $('title-hint').textContent = `endings found: ${ends}/5 · keys: arrows/WASD · Z/Enter confirm · X back · Esc menu`;
}
function toTitle() { B = null; DLG = null; busy = 0; CUT = null; clearBullets(false); state = 'title'; setTrack('title'); musicPaused = false; rush = null; showScreen('title'); }
$('b-play').onclick = () => showScreen('files');
function buildFiles() {
  const L = $('files-list'); L.innerHTML = '';
  for (const n of [1, 2, 3]) { const s = loadSlot(n), d = document.createElement('div'); d.className = 'fcard';
    const ends = (meta.fileEnds && meta.fileEnds[n]) ? meta.fileEnds[n].length : 0;
    d.innerHTML = `<span class="flab"><b>FILE ${n}</b> · ` + (s ? `${s.name} · ${ROOMS[s.room] ? ROOMS[s.room].name : s.room} · ${fmtClock(s.play)} · endings ${ends}` : '<i>empty</i>') + '</span>';
    const row = document.createElement('div'); row.className = 'row';
    const mk = (t, f, id) => { const b = document.createElement('button'); b.textContent = t; b.id = id; b.onclick = f; row.appendChild(b); };
    if (s) mk('CONTINUE', () => { slot = n; const v = loadSlot(n); hero = Object.assign(newHero(v.name), v); showScreen(null); state = 'world'; enterRoom(hero.room); }, 'f-cont-' + n);
    mk('NEW', () => { if (s && !confirm(`Overwrite FILE ${n} (${s.name})? This can't be undone.`)) return; slot = n; wipeSlot(n); showScreen('name'); $('name-msg').textContent = ''; }, 'f-new-' + n);
    if (s) mk('DELETE', () => { if (!confirm(`Delete FILE ${n} (${s.name})?`)) return; wipeSlot(n); buildFiles(); }, 'f-del-' + n);
    d.appendChild(row); L.appendChild(d); }
}
$('b-name-ok').onclick = () => {
  let n = ($('name-in').value || '').toUpperCase().replace(/[^A-Z0-9 ]/g, '').trim().slice(0, 8) || 'SPARK';
  const quips = { MERIDIAN: 'there can only be one jester.', TOLLY: 'that name is taken. by a tortoise.', TICK: 'tock.' };
  if (quips[n] && $('name-msg').dataset.last !== n) { $('name-msg').textContent = quips[n] + ' (press BEGIN again to keep it)'; $('name-msg').dataset.last = n; return; }
  $('name-msg').dataset.last = ''; hero = newHero(n); meta.runs++; saveMeta(); showScreen(null); playIntro();
};
$('b-settings-back').onclick = () => { showScreen(settingsBack === 'pause' ? 'pause' : settingsBack); if (settingsBack === 'pause') buildPause(); };
$('b-reset').onclick = () => { if (confirm('Erase your save, records and endings?')) { [1, 2, 3].forEach(n => localStorage.removeItem(slotKey(n))); meta = DEF_META(); saveMeta(); buildRecords(); } };
function buildSettings() {
  const body = $('settings-body'); body.innerHTML = '';
  const slider = (key, label, min, max, step, fmt) => { const d = document.createElement('div'); d.className = 'set';
    d.innerHTML = `<label>${label}</label><input type="range" min="${min}" max="${max}" step="${step}" value="${settings[key]}"><span class="v"></span>`;
    const inp = d.querySelector('input'), v = d.querySelector('.v'), upd = () => { v.textContent = fmt(+inp.value); }; upd();
    inp.oninput = () => { settings[key] = +inp.value; upd(); setVolumes(); saveSettings(); }; body.appendChild(d); };
  const toggle = (key, label, opts) => { const d = document.createElement('div'); d.className = 'set'; d.innerHTML = `<label>${label}</label>`;
    const b = document.createElement('button'); const lab = () => { const o = opts.find(o => o[0] === settings[key]); b.textContent = o ? o[1] : String(settings[key]); }; lab();
    b.onclick = () => { const i = opts.findIndex(o => o[0] === settings[key]); settings[key] = opts[(i + 1) % opts.length][0]; lab(); saveSettings(); }; d.appendChild(b); body.appendChild(d); };
  toggle('diff', 'Difficulty', [['story', 'STORY (half damage)'], ['normal', 'NORMAL'], ['clock', 'CLOCKWORK (+25% dmg, faster bosses)']]);
  slider('sens', 'Movement sensitivity', 0.5, 2, 0.05, v => v.toFixed(2) + 'x');
  slider('dz', 'Joystick dead zone', 0, 0.5, 0.01, v => Math.round(v * 100) + '%');
  slider('smooth', 'Movement smoothing', 0, 0.9, 0.05, v => v === 0 ? 'off' : Math.round(v * 100) + '%');
  toggle('mode', 'Touch dodge controls', [['joystick', 'JOYSTICK'], ['drag', 'RELATIVE DRAG']]);
  slider('textSpd', 'Text speed', 0.5, 3, 0.25, v => v.toFixed(2) + 'x');
  toggle('shake', 'Screen shake', [[true, 'ON'], [false, 'OFF']]);
  toggle('hitbox', 'Show hitbox', [[false, 'OFF'], [true, 'ON']]);
  slider('music', 'Music volume', 0, 1, 0.05, v => Math.round(v * 100) + '%');
  slider('sfx', 'SFX volume', 0, 1, 0.05, v => Math.round(v * 100) + '%');
  /* v1.7-c13 M4-D3 slice 1: accessibility */
  slider('gspd', 'Battle speed', 0.7, 1, 0.05, v => Math.round(v * 100) + '%');
  toggle('calmFx', 'Reduced flashing', [[false, 'OFF'], [true, 'ON']]);
  toggle('hiCon', 'High-contrast bullets', [[false, 'OFF'], [true, 'ON']]);
  toggle('holdOk', 'Hold to confirm (battle)', [[false, 'OFF'], [true, 'ON']]);
  toggle('cvd', 'Colour-blind bullets', [['off', 'OFF'], ['rg', 'RED-GREEN'], ['by', 'BLUE-YELLOW']]);
  if (navigator.vibrate) toggle('haptic', 'Vibration (phones)', [[true, 'ON'], [false, 'OFF']]);
  toggle('cap60', 'Battery saver (60 FPS cap)', [[false, 'OFF'], [true, 'ON']]);
  if (window.hhBindRows) hhBindRows(body);
  { const d = document.createElement('div'); d.className = 'set'; d.innerHTML = '<label>Reset all settings</label>'; const b = document.createElement('button'); b.id = 'b-set-reset'; b.textContent = 'DEFAULTS';
    b.onclick = () => { Object.assign(settings, JSON.parse(JSON.stringify(DEF_SET))); saveSettings(); setVolumes(); buildSettings(); const r = $('b-set-reset'); if (r) r.focus(); }; d.appendChild(b); body.appendChild(d); }
}
/* ---- pause / items / stats ---- */
function openPause() { if (!canPause()) return; prevState = state; state = 'paused'; musicPaused = state === 'paused' && prevState === 'battle'; buildPause(); showScreen('pause'); }
function buildPause() {
  const inBattle = prevState === 'battle'; $('pause-world').style.display = inBattle || !hero ? 'none' : 'flex';
  $('pause-h').textContent = inBattle ? 'PAUSED' : (hero ? hero.name : 'PAUSED');
  $('pause-info').textContent = inBattle ? (B && B.opts.practice ? `practice · ${B.opts.practice.name}` : B ? `vs ${B.e.name}` : '') : hero ? `${ROOMS[hero.room].name} · COIL ${hero.coil} · GLOW ${hero.glow}/${maxGlow(hero)} · ${hero.cogs} COGS` : '';
  $('b-quit').textContent = B && B.opts.practice ? 'END PRACTICE' : 'QUIT TO TITLE';
}
$('b-resume').onclick = () => { showScreen(null); state = prevState || 'world'; musicPaused = false; last = performance.now(); };
$('b-pause-settings').onclick = () => { settingsBack = 'pause'; showScreen('settings'); };
$('b-quit').onclick = () => { if (B && B.opts.practice) { toTitle(); showScreen('practice'); return; } if (rush || confirm('Quit to title? Anything since your last kept moment will be lost.')) toTitle(); };
$('b-items').onclick = () => { buildItems(''); showScreen('items'); };
$('b-items-back').onclick = () => { showScreen('pause'); buildPause(); };
$('b-stat').onclick = () => { buildStat(); showScreen('stat'); };
$('b-stat-back').onclick = () => { showScreen('pause'); buildPause(); };
function buildItems(msg) {
  $('items-eq').innerHTML = `WEAPON: <span class="gold">${ITEMS[hero.weapon].name}</span> · ARMOR: <span class="gold">${ITEMS[hero.armor].name}</span> · GLOW ${hero.glow}/${maxGlow(hero)}`;
  const L = $('items-list'); L.innerHTML = hero.items.length ? '' : '<div class="sub">your pockets are empty.</div>';
  hero.items.forEach((k, i) => { const it = ITEMS[k]; const d = document.createElement('div'); d.className = 'item'; d.innerHTML = `<div><b>${it.name}</b><small>${it.desc}</small></div><div class="row"></div>`;
    const row = d.querySelector('.row'); const btn = (lab, f) => { const b = document.createElement('button'); b.className = 'small'; b.textContent = lab; b.onclick = f; row.appendChild(b); };
    if (it.kind === 'heal') btn('USE', () => { const g = Math.min(it.v, maxGlow(hero) - hero.glow); hero.glow += g; hero.items.splice(i, 1); sfx('heal'); buildItems(`You ate the ${it.name}. +${g} GLOW.`); });
    if (it.kind === 'weapon' || it.kind === 'armor') btn('EQUIP', () => { equipItem(i); sfx('item'); buildItems(`Equipped the ${it.name}.`); });
    if (it.kind !== 'gift') btn('DROP', () => { hero.items.splice(i, 1); buildItems(`You left the ${it.name} on the ground. Someone will appreciate it.`); });
    L.appendChild(d); });
  $('items-msg').textContent = msg || '';
  setTimeout(() => { const f = visibleFocusables()[0]; if (f) f.focus({ preventScroll: true }); }, 20);
}
function buildStat() {
  const next = hero.coil < 10 ? TORQUE_AT[hero.coil] - hero.torque : '—';
  $('stat-h').textContent = `"${hero.name}"`;
  $('stat-table').innerHTML = tableHTML([['COIL', hero.coil], ['GLOW', `${hero.glow} / ${maxGlow(hero)}`], ['EDGE', `${edge(hero)} (${ITEMS[hero.weapon].name})`], ['PLATING', `${plating(hero)} (${ITEMS[hero.armor].name})`], ['TORQUE', `${hero.torque} (next: ${next})`], ['COGS', hero.cogs], ['Clocks stopped', hero.kills], ['Creatures released', hero.spares], ['Time played', fmtClock(hero.play)]]);
}
/* ---- shop ---- */
function openShop() { prevState = 'world'; state = 'paused'; buildShop(''); showScreen('shop'); return new Promise(r => { shopResolve = r; }); }
let shopResolve = null;
$('b-shop-back').onclick = () => { showScreen(null); state = 'world'; last = performance.now(); if (shopResolve) { const r = shopResolve; shopResolve = null; r(); } };
function buildShop(msg) {
  $('shop-h').textContent = "TESS'S TINKERY"; $('shop-q').textContent = msg || pick(['"Everything\'s on sale! Has been for forty years!"', '"Ooh, that one goes PING. Probably."', '"No refunds. No tomorrows either, ha!"']);
  $('shop-g').textContent = hero.cogs; $('shop-bag').textContent = `${bagCount()}/${BAG_MAX}`;
  const L = $('shop-list'); L.innerHTML = '';
  for (const k of (typeof shopStock === 'function' ? shopStock() : SHOP_STOCK)) { const it = ITEMS[k]; const d = document.createElement('div'); d.className = 'item';
    const owned = (hero.weapon === k || hero.armor === k) ? ' · equipped' : '';
    d.innerHTML = `<div><b>${it.name}</b> <span class="gold">${it.price}c</span>${owned}<small>${it.desc}${it.kind === 'heal' ? ` (+${it.v > 99 ? 'ALL' : it.v} GLOW)` : ''}</small></div>`;
    const b = document.createElement('button'); b.className = 'small'; b.textContent = 'BUY'; b.disabled = hero.cogs < it.price || bagCount() >= BAG_MAX;
    b.onclick = () => { if (hero.cogs < it.price || bagCount() >= BAG_MAX) return; hero.cogs -= it.price; hero.items.push(k); sfx('buy');
      buildShop(it.kind === 'weapon' || it.kind === 'armor' ? `"The ${it.name}! Equip it from your ITEMS menu, sweetie."` : `"One ${it.name}! Enjoy!"`); };
    d.appendChild(b); L.appendChild(d); }
  setTimeout(() => { const f = visibleFocusables()[0]; if (f) f.focus({ preventScroll: true }); }, 20);
}
/* ---- game over ---- */
const OVER_QUOTES = ['"Up you get, little chime." — someone, far away', 'The spark gutters... but embers remember how to burn.', 'Time hasn\'t moved an inch. Neither has your chance.', 'Somewhere, MERIDIAN snorts. "again?"', 'Your scarf is fine, at least.'];
function gameOver(b) {
  state = 'over'; setTrack('silent');
  $('over-quote').textContent = pick(OVER_QUOTES);
  const rows = [['Fell to', b.e.name], ['COIL', hero.coil]]; if (b.mer) rows.push(['MERIDIAN attacks survived', `${b.mer.idx} / ${MER_ATTACKS.length}`]);
  $('over-table').innerHTML = tableHTML(rows);
  $('b-over-load').textContent = rush ? 'RETRY RUSH' : loadSave() ? 'BACK TO KEPT MOMENT' : 'START OVER';
  B = null; clearBullets(false); showScreen('over');
}
$('b-over-load').onclick = () => { if (rush) { const m = rush.merOnly; toTitle(); startRush(m); return; } const s = loadSave(); showScreen(null); if (s) { hero = Object.assign(newHero(s.name), s); } else { const n = hero.name; hero = newHero(n); } state = 'world'; enterRoom(hero.room); };
$('b-over-title').onclick = () => toTitle();
/* ---- boss rush ---- */
let rush = null, savedHero = null;
function buildRush() { $('rush-table').innerHTML = tableHTML([['Best full rush', meta.rushBest ? fmtTime(meta.rushBest) : '--'], ['Rush clears', meta.rushWins], ['MERIDIAN clears', meta.merWins]]); }
$('b-rush-all').onclick = () => startRush(false);
$('b-rush-mer').onclick = () => startRush(true);
function startRush(merOnly) {
  savedHero = null; hero = newHero('SPARK'); Object.assign(hero, { coil: 8, torque: 420, weapon: 'wrench', armor: 'apron', items: ['pie', 'pie', 'tea', 'tea', 'cocoa', 'ember', 'ember', 'biscuit'], room: 'belfry' }); hero.glow = maxGlow(hero);
  rush = { list: merOnly ? ['meridian'] : ['wicklow', 'grit', 'cuckoo', 'meridian'], i: 0, t0: performance.now(), merOnly };
  showScreen(null); rushNext();
}
function rushNext() {
  const id = rush.list[rush.i]; const themes = { wicklow: 'forest', grit: 'cog', cuckoo: 'spire', meridian: 'belfry' };
  startBattle(id, { boss: true, rush: true, theme: themes[id], onEnd: (res) => {
    rush.i++; if (rush.i < rush.list.length) { hero.glow = Math.min(maxGlow(hero), hero.glow + Math.ceil(maxGlow(hero) / 2)); rushNext(); return; }
    const time = (performance.now() - rush.t0) / 1000; meta.merWins++; if (!rush.merOnly) { meta.rushWins++; if (!meta.rushBest || time < meta.rushBest) meta.rushBest = time; } saveMeta();
    state = 'over2'; setTrack('good');
    $('end-h').textContent = rush.merOnly ? 'MERIDIAN CLEARED' : 'BOSS RUSH CLEARED'; $('end-q').textContent = res === 'spare' ? '"...you let me go. even here."' : '"tick... tock... stop."';
    $('end-table').innerHTML = tableHTML([['Time', fmtTime(time)], ['GLOW left', `${hero.glow}/${maxGlow(hero)}`], ['Best full rush', meta.rushBest ? fmtTime(meta.rushBest) : '--']]); $('end-hint').textContent = '';
    rush = null; showScreen('end'); } });
}
/* ---- practice ---- */
function buildPractice() {
  const L = $('practice-list'); L.innerHTML = '';
  const groups = [['MERIDIAN', 'meridian', MER_ATTACKS.map((a, i) => [a, 1 + 0.07 * a.phase, `${i + 1}. `])]];
  for (const k of ['mothwick', 'rustpup', 'tocklet', 'boltbeetle', 'kettlewisp', 'stringling', 'gloomgong', 'wicklow', 'grit', 'cuckoo']) groups.push([ENEMIES[k].name, k, ENEMIES[k].attacks.map(a => [A[a], ENEMIES[k].d, ''])]);
  for (const [gname, eid, atks] of groups) {
    const h = document.createElement('div'); h.className = 'ph'; h.textContent = gname + (meta.seen[eid] ? '' : '  · not met yet'); L.appendChild(h);
    for (const [a, d, pre] of atks) { const b = document.createElement('button'); b.innerHTML = `${pre}${a.name}<br><small style="color:#aaa;font-weight:normal">${a.desc}</small>`; b.onclick = () => { if (!hero) hero = newHero('SPARK'); showScreen(null); startBattle(eid, { practice: a, d, theme: eid === 'meridian' ? 'belfry' : 'spire' }); }; L.appendChild(b); }
  }
}
function buildRecords() {
  const E = meta.endings, nm = { true: 'THE TOWN WINDS ON', quiet: 'MIDNIGHT, AT LAST', cracked: 'A CRACKED BELL', still: 'THE STILL HOUR', twelve: 'THE 12:01', lowtide: 'LOW TIDE', understudy: 'THE UNDERSTUDY' };
  const rows = Object.keys(nm).map(k => [E[k] ? nm[k] : '???', E[k] ? '✦ found' : 'not yet']);
  rows.push(['Games started', meta.runs], ['Times your spark went out', meta.deaths], ['Boss rush best', meta.rushBest ? fmtTime(meta.rushBest) : '--'], ['MERIDIAN clears', meta.merWins]);
  $('rec-table').innerHTML = tableHTML(rows);
}

/* ===================== CUTSCENES (intro + endings) ===================== */
let CUT = null;
function playCut(cards, onDone, track) { CUT = { cards, i: 0, typer: new Typer(cards[0].t, 400), t: 0, onDone }; state = 'cut'; if (track) setTrack(track); }
function updateCut(dt) {
  const c = CUT; c.t += dt; c.typer.update(dt);
  const tap = takeTap(); if (act('ok') || tap) { if (!c.typer.done) c.typer.finish(); else { c.i++; c.t = 0; if (c.i >= c.cards.length) { CUT = null; c.onDone(); return; } c.typer = new Typer(c.cards[c.i].t, 400); if (c.cards[c.i].sfx) sfx(c.cards[c.i].sfx); } }
  if (act('menu') && c.skippable) { CUT = null; c.onDone(); }
}
function drawCut() {
  const c = CUT, card = c.cards[c.i], T = c.t;
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, card.bg ? card.bg[0] : '#0a0812'); g.addColorStop(1, card.bg ? card.bg[1] : '#14101e'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalAlpha = clamp(T * 2, 0, 1); if (card.art) card.art(W / 2, 200, T); ctx.restore();
  drawParticles();
  ctx.font = `bold 23px ${FONT}`; ctx.fillStyle = card.col || '#f4ecd8'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  wrapText(c.typer.str, 760).forEach((ln, i) => ctx.fillText(ln, W / 2, 380 + i * 32));
  if (c.typer.done && Math.floor(performance.now() / 300) % 2) poly([W / 2 - 7, 500, W / 2 + 7, 500, W / 2, 509], '#ffd36e');
  if (c.skippable) { ctx.font = `12px ${FONT}`; ctx.fillStyle = '#777'; ctx.textAlign = 'right'; ctx.fillText(touch.seen ? 'tap to continue' : 'Z: next · Esc: skip', W - 16, H - 22); }
}
const ARTS = {
  lowtide: (x, y, t) => { const lvl = Math.max(0, 1 - t * 0.25); ctx.fillStyle = '#2a2018'; ctx.fillRect(x - 380, y + 10, 760, 60); ctx.fillStyle = 'rgba(42,106,184,.55)'; ctx.fillRect(x - 380, y + 10 - lvl * 70, 760, 60 + lvl * 70);
    for (let i = 0; i < 6; i++) { const sx = x - 250 + i * 100; ctx.fillStyle = '#6a6458'; ctx.fillRect(sx, y + 40 - (i % 2) * 6, 40, 12); }
    ctx.fillStyle = '#3a2a1a'; ctx.fillRect(x + 220, y - 120, 18, 190); ctx.fillRect(x + 300, y - 120, 18, 190); ctx.fillStyle = '#9ad8ff'; ctx.font = `bold 14px ${FONT}`; ctx.textAlign = 'center'; ctx.fillText('LOW', x + 269, y - 128);
    ctx.save(); ctx.translate(x - 120 + Math.sin(t) * 4, y + 30); ctx.rotate(0.12); ctx.fillStyle = '#7a5a3a'; ctx.beginPath(); ctx.ellipse(0, 0, 46, 10, 0, 0, Math.PI); ctx.fill(); ctx.restore(); },
  keeper: (x, y, t) => { ctx.save(); ctx.translate(x, y + 10); ctx.scale(1.6, 1.6); if (ART.lockkeeper) ART.lockkeeper(0, -10, t, { low: true }); ctx.restore(); },
  bell: (x, y, t, ring) => { const sw = ring ? Math.sin(t * 5) * 0.25 : Math.sin(t) * 0.03; ctx.save(); ctx.translate(x, y - 80); ctx.rotate(sw); ctx.fillStyle = '#6a4a20'; ctx.fillRect(-100, -10, 200, 10); ctx.fillStyle = '#c8a050'; ctx.beginPath(); ctx.moveTo(-34, 0); ctx.quadraticCurveTo(-44, 70, -90, 120); ctx.lineTo(90, 120); ctx.quadraticCurveTo(44, 70, 34, 0); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#a07a30'; ctx.fillRect(-92, 114, 184, 12); circ(0, 134, 10, '#5a3a10'); ctx.restore();
    if (ring && Math.random() < 0.3) burst(x + rand(-120, 120), y + rand(-60, 60), 2, '#ffe8a0', 120, 1, 3); },
  chimes: (x, y, t) => { ARTS.bell(x, y, t, true); for (let i = 0; i < 12; i++) { const a = -Math.PI / 2 + i / 12 * 6.283; circ(x + Math.cos(a) * 150, y - 20 + Math.sin(a) * 100, i < Math.floor(t * 4) ? 6 : 3, i < Math.floor(t * 4) ? '#ffd36e' : '#443'); } },
  jester: (x, y, t) => drawMeridian(x, y - 20, t, { eye: '#fff', cracks: 0 }),
  clock: (x, y, t) => { circ(x, y - 30, 110, '#b8893a'); circ(x, y - 30, 98, '#ece0c4'); for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; line(x + Math.cos(a) * 82, y - 30 + Math.sin(a) * 82, x + Math.cos(a) * 94, y - 30 + Math.sin(a) * 94, '#3a2a14', 3); } const jit = Math.sin(t * 30) * 0.02; line(x, y - 30, x + Math.cos(-1.62 + jit) * 80, y - 30 + Math.sin(-1.62 + jit) * 80, '#1a1020', 4); line(x, y - 30, x + Math.cos(-1.6) * 50, y - 30 + Math.sin(-1.6) * 50, '#1a1020', 7); circ(x, y - 30, 7, '#ffd36e'); ctx.font = `bold 20px ${FONT}`; ctx.fillStyle = '#1a1020'; ctx.textAlign = 'center'; ctx.fillText('11:59', x, y + 20); },
  town: (x, y, t) => { ctx.fillStyle = '#1a1424'; for (let i = 0; i < 9; i++) { const bx = x - 380 + i * 90, bh = 60 + hash(i, 3) * 80; ctx.fillRect(bx, y + 60 - bh, 70, bh); poly([bx - 6, y + 60 - bh, bx + 35, y + 30 - bh, bx + 76, y + 60 - bh], '#1a1424'); ctx.fillStyle = '#ffd98a'; if (hash(i, 9) > 0.4) ctx.fillRect(bx + 25, y + 70 - bh, 16, 14); ctx.fillStyle = '#1a1424'; } ctx.fillStyle = '#221a30'; ctx.fillRect(x - 20, y - 180, 40, 240); poly([x - 30, y - 180, x, y - 230, x + 30, y - 180], '#221a30'); circ(x, y - 150, 12, '#ffd36e'); },
  fall: (x, y, t) => { const fy = Math.min(y + 40, y - 200 + t * 260); ctx.save(); ctx.shadowColor = '#ffb347'; ctx.shadowBlur = 30; circ(x, fy, 10, '#ffcf5a'); ctx.restore(); for (let i = 1; i < 8; i++) circ(x, fy - i * 14, 8 - i, `rgba(255,180,80,${0.5 - i * 0.06})`); if (fy >= y + 40 && Math.random() < 0.5) burst(x, y + 40, 3, '#ffb347', 160, 0.6, 3); },
  hero: (x, y, t) => { ctx.save(); ctx.translate(x, y + 30); ctx.scale(3, 3); drawHero(0, 0, 2, 0, t); ctx.restore(); },
  shards: (x, y, t) => { for (let i = 0; i < 14; i++) { const a = i / 14 * 6.283 + t * 0.2, r = 40 + t * 30; gear(x + Math.cos(a) * r, y - 30 + Math.sin(a) * r * 0.6 + t * 10, 10 + (i % 3) * 5, 6, t * (i % 2 ? 1 : -1), '#b8893a', null); } },
  wind: (x, y, t) => { drawMeridian(x, y - 20, t, { eye: '#ffd36e', cracks: 2 }); for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283 + t * 0.5; ctx.save(); ctx.translate(x + Math.cos(a) * 170, y + Math.sin(a) * 60 + 20); ctx.scale(0.8, 0.8); drawNPC(['tolly', 'pip', 'bun', 'tess', 'sprocket', 'hush'][i], 0, 0, t); ctx.restore(); } },
  rope: (x, y, t) => { ARTS.bell(x, y - 20, t, false); line(x + 4, y + 40, x + 4, y + 150, '#8a6a3a', 3); ctx.save(); ctx.translate(x + 30, y + 160); ctx.scale(2, 2); drawHero(0, 0, 0, 0, t); ctx.restore(); ctx.fillStyle = `rgba(120,0,20,${0.15 + Math.sin(t * 2) * 0.05})`; ctx.fillRect(0, 0, W, H); },
};
function playIntro() {
  hero.flags.intro = true;
  const cards = [
    { t: 'Long ago, the town of Gearholm kept time by the great Bell of Hours.', art: (x, y, t) => ARTS.bell(x, y, t, false) },
    { t: 'Every midnight it rang twelve times, and the old day was allowed to end.', art: ARTS.chimes, sfx: 'bell' },
    { t: 'Its keeper was a clockwork jester named MERIDIAN. Smug. Theatrical. Very good with gears.', art: ARTS.jester },
    { t: 'One night, at 11:59, MERIDIAN stopped the bell. And every clock in Gearholm stopped with it.', art: ARTS.clock },
    { t: 'No midnight. No tomorrow. Forty years of the very same minute.', art: ARTS.town },
    { t: '...until the twelfth chime, the one that never got to ring, shook loose from the silent bell, and fell, glowing, into the Rustwood.', art: ARTS.fall },
    { t: 'That chime was you.', art: ARTS.hero, col: '#ffd36e' },
  ];
  playCut(cards, () => { state = 'world'; enterRoom('bellfall', 6, 8, 2); RM.fade = 1.5; shake(10, 0.5); burst(6 * 32 + 16 - cam.x, 8 * 32 - cam.y, 40, '#ffb347', 220, 0.9, 4); sfx('shatter');
    runScript(async () => { await sleep(900); const t = RM.ents.find(e => e.kind === 'tolly'); await t.run(); }); }, 'title');
  CUT.skippable = true;
}
function startEnding(result) {
  const r = route(); let id;
  if (result === 'spare') id = r === 'peace' ? 'true' : 'quiet'; else id = r === 'violent' ? 'still' : 'cracked';
  const F = hero.flags, twelve = id === 'true' && F.showTicket && F.ws_visited; if (twelve) meta.endings.twelve = true;
  // v1.7 (M2 chunk K): LOW TIDE. MERIDIAN spared + Lockkeeper spared at LOW (tide_turned), not violent. 12:01 keeps priority.
  const lowtide = !twelve && result === 'spare' && F.lock_result === 'spared' && !!F.tide_turned && r !== 'violent'; const base = id; if (lowtide) id = 'lowtide';
  // v1.8-c1 (M3-D6): THE UNDERSTUDY. MERIDIAN spared on a mixed route with Pell's duet done (q_pell 3). 12:01 and LOW TIDE keep priority.
  const understudy = !twelve && !lowtide && result === 'spare' && r === 'mixed' && (F.q_pell || 0) >= 3; if (understudy) id = 'understudy';
  meta.endings[id] = true; meta.fileEnds = meta.fileEnds || {}; const fe = meta.fileEnds[slot] = meta.fileEnds[slot] || []; if (!fe.includes(id)) fe.push(id); if (twelve && !fe.includes('twelve')) fe.push('twelve'); saveMeta();
  const sp = k => hero.flags['spared_' + k], cards = [];
  const warm = ['#1a1020', '#3a2018'], cold = ['#06060a', '#121018'], red = ['#100206', '#2a0610'];
  if (base === 'true' || base === 'quiet') {
    cards.push({ t: '"...thanks, spark. i think i was more scared of midnight than anything you threw at me."', art: ARTS.jester, bg: warm });
    cards.push({ t: 'MERIDIAN climbed to the rope, and with the last turn of his spring, he rang the Bell of Hours.', art: (x, y, t) => ARTS.bell(x, y, t, true), sfx: 'bigbell', bg: warm });
    cards.push({ t: 'BONG. BONG. BONG... twelve times. Across Gearholm, every clock ticked over to 12:00.', art: ARTS.chimes, bg: warm });
    cards.push({ t: 'Tolly finally reached the bakery. Bun had a fresh pie waiting. It was, for the first time, a new pie.', art: (x, y, t) => { drawNPC('tolly', x - 40, y + 30, t); drawNPC('bun', x + 40, y + 30, t); }, bg: warm });
    if (sp('wicklow')) cards.push({ t: 'Wicklow sat on the bakery bench in the morning sun and did not melt at all.', art: (x, y, t) => { ctx.save(); ctx.translate(x, y + 40); ctx.scale(0.6, 0.6); ART.wicklow(0, -60, t, {}); ctx.restore(); }, bg: warm });
    if (sp('grit')) cards.push({ t: 'Foreman Grit slept for three whole days. The Cogworks declared it a holiday. Then another.', art: (x, y, t) => { ctx.save(); ctx.translate(x, y + 40); ctx.scale(0.5, 0.5); ART.grit(0, -60, t, {}); ctx.restore(); }, bg: warm });
    if (sp('cuckoo')) cards.push({ t: 'Madame Cuckoo sang "one o\'clock" for the very first time. Every seat in the gallery was full.', art: (x, y, t) => { ctx.save(); ctx.translate(x, y + 40); ctx.scale(0.5, 0.5); ART.cuckoo(0, -80, t, {}); ctx.restore(); }, bg: warm });
    const tide = ['#06121e', '#12304a'], bn = F.bilge_killed1 ? (F.bilge_killed1 === 'SLOSH' ? 'TRICKLE' : 'SLOSH') : 'SLOSH';
    if (id === 'lowtide') {
      cards.push({ t: 'Far east of the square, at exactly 12:00, the Tidelock did something it had not done in forty years. It went out.', art: ARTS.lowtide, bg: tide });
      cards.push({ t: 'The Lockkeeper sat down on the dry floor of Lock No. 2 with his hands in his lap. "Day one," he said. He did not write it down.', art: ARTS.keeper, bg: tide });
      cards.push({ t: F.ferry_told ? 'Ferry rowed in a straight line, ran aground in the mud, and laughed until he cried. He stopped counting at fourteen thousand, six hundred and three.' : 'Ferry rowed in a straight line, ran aground in the mud, and laughed until he cried. Nobody had ever told him there was a bottom.', art: ARTS.lowtide, bg: tide });
      if (F.bilge_result === 'spared') cards.push({ t: 'SLOSH and TRICKLE opened their door at exactly the same time and walked out onto the canal bed together. It was nobody\'s turn. They agreed it was a good turn.', art: ARTS.lowtide, bg: tide });
      else if (F.bilge_killed1 && F.bilge_result !== 'killed') cards.push({ t: `One of the Twin Sluices stays shut. Every morning ${bn} opens it anyway, waits a while, and closes it again, so it still gets a turn.`, art: ARTS.lowtide, bg: tide, col: '#9ab8d0' });
      else if (F.bilge_result === 'killed') cards.push({ t: 'The Twin Sluices hang open and empty. With nobody left to argue, the water just goes wherever it likes.', art: ARTS.lowtide, bg: tide, col: '#9ab8d0' });
      if (base === 'true') cards.push({ t: 'And when MERIDIAN\'s spring ran down, the climbers up the Hourspire had big wet footprints with them. The Lockkeeper turned the jester\'s key the way he turns a wheel: slow, and all the way.', art: ARTS.wind, bg: warm });
      else cards.push({ t: 'MERIDIAN\'s spring ran down in the Belfry. Not many hands came. One of them was enormous, and rusty, and very patient.', art: (x, y, t) => drawMeridian(x, y - 20, 0, { eye: '#555', cracks: 3, dead: 0 }), bg: cold });
      cards.push({ t: 'In the tower, under fourteen thousand six hundred and three HIGHs, there is one LOW, written big. Underneath, smaller: "then tomorrow."', art: ARTS.keeper, bg: tide, col: '#9ad8ff' });
    } else if (id === 'understudy') {
      const pell = (x, y, t) => { ctx.save(); ctx.translate(x, y + 40); ctx.scale(2.2, 2.2); drawNPC('pell', 0, 0, t); ctx.restore(); }, stage = ['#120c1c', '#2a1a2e'];
      cards.push({ t: 'Up in the Belfry, MERIDIAN\'s spring wound down. A few hands came up the stairs. Not enough. Somebody had stopped on the way up, and everyone could feel the gap.', art: (x, y, t) => drawMeridian(x, y - 20, 0, { eye: '#777', cracks: 2, dead: 0 }), bg: cold });
      cards.push({ t: 'Then a small voice from the back of the stairwell: "I know this part." It was PELL. Nobody had cast them. They had learned it anyway.', art: pell, bg: stage });
      cards.push({ t: 'Pell had watched every show from the wings. They knew where the key went. They knew how many turns it took. They even knew which turn squeaks.', art: ARTS.wind, bg: stage });
      cards.push({ t: 'One pair of hands could not wind him all the way. But it was enough for one more night. So Pell came back the next night, and the night after. Understudies always turn up.', art: pell, bg: stage });
      if (sp('cuckoo')) cards.push({ t: 'Madame Cuckoo moved her evening show an hour later so Pell could make both. She has never done that for anyone. She insists it is purely a scheduling matter.', art: (x, y, t) => { ctx.save(); ctx.translate(x, y + 40); ctx.scale(0.5, 0.5); ART.cuckoo(0, -80, t, {}); ctx.restore(); }, bg: stage });
      cards.push({ t: '"...you\'re not who i was waiting for," said the jester, half-wound and blinking. "No," said Pell. "But I\'m the one who came."', art: ARTS.jester, bg: stage, col: '#ffd36e' });
    } else {
    if (F.lock_result === 'worn') cards.push({ t: 'Out east, the Lockkeeper let the gate drift back to HIGH. He watched it go, too tired to mind. Ferry went round. And round.', bg: cold, col: '#9ab8d0' });
    else if (F.lock_result === 'spared') cards.push({ t: 'Out east, the Lockkeeper wrote LOW on his board, big, then sat and waited for somebody to ask what came after. (Maybe the bell could tell him.)', bg: tide, col: '#9ab8d0' });
    if (F.bilge_result === 'spared') cards.push({ t: 'At the Twin Sluices, two doors opened at the same time. Neither twin has said "my turn" since. It is very strange for everyone.', bg: tide, col: '#9ab8d0' });
    if (id === 'true') {
      cards.push({ t: 'And up in the Belfry, MERIDIAN\'s spring wound down... slow... and gentle... and then a lot of small hands reached up and turned his key.', art: ARTS.wind, bg: warm });
      cards.push({ t: 'Every creature you had let go came climbing up the Hourspire to wind him back up. Not one clock had stopped on your way here. So there was no one missing.', art: ARTS.wind, bg: warm });
      cards.push({ t: '"...huh," said the jester, blinking. "tomorrow. what a strange word."', art: ARTS.jester, bg: warm, col: '#ffd36e' });
      if (F.oneMore) cards.push({ t: 'Some nights, the jester hums Pendulum Rain while he oils the bell. Slowly. The way it used to go. He doesn\'t know who taught him. He hums it anyway.', art: ARTS.jester, bg: warm });
      if (twelve) {
        cards.push({ t: 'At 12:01, MERIDIAN climbed down from the Belfry for the first time in forty years, holding a punched ticket, and walked to a platform Gearholm does not have.', art: ARTS.town, bg: ['#0a0e1a', '#1a2030'] });
        cards.push({ t: 'Platform 13 was there. It had always been there. Nobody had ever been late enough to see it.', art: ARTS.clock, bg: ['#0a0e1a', '#1a2030'] });
        cards.push({ t: 'Down the far end, a figure in a too-big coat leaned on a mop, checked a pocket watch, and nodded, like someone had finally arrived on time.', art: (x, y, t) => { ctx.save(); ctx.translate(x, y + 50); ctx.scale(2.4, 2.4); drawMopsley(0, 0, t, false); ctx.restore(); }, bg: ['#0a0e1a', '#1a2030'] });
        cards.push({ t: 'The train never came. MERIDIAN waited anyway. "she was always late," he said, to nobody. Or to the janitor. It was hard to tell.', art: ARTS.jester, bg: ['#0a0e1a', '#1a2030'], col: '#9ad8ff' });
      }
    } else {
      cards.push({ t: 'Up in the Belfry, MERIDIAN\'s spring wound down, slow and quiet. Tolly climbed up to sit with him. Nobody else came.', art: (x, y, t) => drawMeridian(x, y - 20, 0, { eye: '#555', cracks: 3, dead: 0 }), bg: cold });
      cards.push({ t: 'Some homes in Gearholm stayed dark at 12:00. Some clocks don\'t start again.', art: ARTS.town, bg: cold });
      cards.push({ t: '(Maybe, if no clocks had stopped on the way up, there would have been enough hands to wind him...)', bg: cold, col: '#aaa' });
    }
    }
  } else if (id === 'cracked') {
    cards.push({ t: 'Your last strike rang out like a cracked note. MERIDIAN came apart into a hundred tumbling gears.', art: ARTS.shards, sfx: 'shatter', bg: cold });
    cards.push({ t: 'You pulled the rope yourself. The bell rang midnight... off-key, with a split right down its side.', art: (x, y, t) => ARTS.bell(x, y, t, true), sfx: 'bigbell', bg: cold });
    cards.push({ t: 'Gearholm moved on. Tomorrow came. But nobody in town hums anymore, and no one quite knows why.', art: ARTS.town, bg: cold });
    if (F.lock_result === 'killed') cards.push({ t: 'Out east, the tide gate stayed jammed at HIGH. Ferry kept rowing in circles. There was nobody left to tell him he could stop.', bg: cold, col: '#9ab8d0' });
    if (has('photo')) cards.push({ t: 'Later, you take the photograph out of your pocket. The face that was rubbed away is gone. So is the jester\'s.', bg: cold, col: '#aaa' });
    cards.push({ t: '(There is another way. Maybe the jester only needed someone to let him go.)', bg: cold, col: '#aaa' });
  } else {
    cards.push({ t: 'MERIDIAN shattered. The gears didn\'t even bounce. The Belfry was very, very quiet.', art: ARTS.shards, sfx: 'shatter', bg: red });
    cards.push({ t: 'You took the rope in your hands... and didn\'t pull. The woods were empty. The works were empty. Who was left to have a tomorrow?', art: ARTS.rope, bg: red });
    cards.push({ t: 'It is 11:59 in Gearholm. It will always be 11:59 in Gearholm. There is a new keeper of the hours now.', art: ARTS.clock, bg: red, col: '#ff6a7a' });
    if (F.lock_result === 'killed' || F.bilge_result === 'killed') cards.push({ t: 'In the Tidelock the water stands perfectly still. No one is holding the gate. No one needs to. It is HIGH forever now, like everything else.', bg: red, col: '#ff6a7a' });
    cards.push({ t: 'Somewhere below, someone is mopping. Every time a chime falls, somebody has to.', bg: red, col: '#886' });
  }
  if (window.qlEndCards) qlEndCards(cards, id, F);
  const titles = { true: 'THE TOWN WINDS ON', quiet: 'MIDNIGHT, AT LAST', cracked: 'A CRACKED BELL', still: 'THE STILL HOUR', lowtide: 'LOW TIDE', understudy: 'THE UNDERSTUDY' };
  playCut(cards, () => {
    state = 'over2'; showScreen('end');
    $('end-h').textContent = twelve ? 'THE 12:01' : titles[id]; $('end-q').textContent = { true: twelve ? '✦ the hidden ending ✦' : '★ the true ending ★', quiet: 'a bittersweet ending', understudy: '❖ the stand-in ending ❖', lowtide: base === 'true' ? '≈ the tide ending (all hands) ≈' : '≈ the tide ending ≈', cracked: 'an unkind ending', still: 'the stillest ending' }[id];
    $('end-table').innerHTML = tableHTML([['Name', hero.name], ['COIL', hero.coil], ['Clocks stopped', hero.kills], ['Creatures released', hero.spares], ['Time played', fmtClock(hero.play)], ['Endings found', `${typeof HH_ENDS !== 'undefined' ? HH_ENDS.filter(k => meta.endings[k]).length : Object.keys(meta.endings).length} / ${typeof HH_ENDS !== 'undefined' ? HH_ENDS.length : 7}`]]);
    $('end-hint').textContent = id === 'understudy' ? 'Someone stepped in. (On a run where no clock stopped, the jester might not need a stand-in...)' : id === 'lowtide' ? 'The tide turned. (There are still other ways for the bell to ring...)' : id === 'true' ? 'You found the best ending. Try BOSS RUSH from the title, or see what happens if you choose differently...' : 'Your save is still at the Belfry. Continue to face MERIDIAN again, or start fresh for a different path.' + (Object.keys(meta.endings).length === 1 ? ' (The world may remember a few things.)' : '');
  }, id === 'true' || id === 'quiet' || id === 'lowtide' || id === 'understudy' ? 'good' : 'bad');
}
$('b-end-title').onclick = () => toTitle();
/* v1.8-c6: credits screen, from the title row or the end screen */
let credBack = 'title'; document.addEventListener('click', e => { const b = e.target.closest('button'); if (b && b.dataset.go === 'credits') credBack = 'title'; }, true);
$('b-end-credits').onclick = () => { credBack = 'end'; showScreen('credits'); };
$('b-cred-back').onclick = () => showScreen(credBack);
