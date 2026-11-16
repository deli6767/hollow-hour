/* ===================== HERO / SAVE ===================== */
let hero = null;
function newHero(name) {
  return { name: name || 'SPARK', coil: 1, torque: 0, cogs: 5, glow: 20, weapon: 'twig', armor: 'scarf', items: [], kills: 0, spares: 0, flags: {}, areaKills: { rustwood: 0, cogworks: 0, spire: 0 },
    room: 'bellfall', x: 6 * TILE + 16, y: 8 * TILE + 24, dir: 2, play: 0, lev: [0, 0, 0], ver: 2 };
}
// three save files. File 1 uses the old single-save key, so a pre-v1.3 save simply shows up as File 1.
let slot = 1;
const slotKey = n => n === 1 ? LS_SAVE : LS_SAVE + '_f' + n;
function saveGame() { const s = JSON.parse(JSON.stringify(hero)); s.savedAt = Date.now(); s.slot = slot; s.ver = SAVE_VER; store(slotKey(slot), s); }
// save format versioning: v1 = v1.0-1.3 saves (no `ver`), v2 = current. migrateSave upgrades in steps and never throws.
const SAVE_VER = 2;
function migrateSave(v) {
  if (!v || typeof v !== 'object' || !v.room) return null;
  if (!ROOMS[v.room]) { v.room = 'bellfall'; v.x = 6 * TILE + 16; v.y = 8 * TILE + 24; }
  const ver = v.ver || 1;
  if (ver < 2) { // v1 -> v2: make every field explicit
    const d = newHero(v.name);
    for (const k in d) if (v[k] == null) v[k] = d[k];
    v.flags = v.flags || {}; v.items = Array.isArray(v.items) ? v.items.filter(k => ITEMS[k]) : [];
    v.areaKills = Object.assign({ rustwood: 0, cogworks: 0, spire: 0 }, v.areaKills || {});
    v.ver = 2;
  }
  // every version: drop unknown item ids (renamed/removed items) but keep valid items and all flags
  if (Array.isArray(v.items)) v.items = v.items.filter(k => ITEMS[k]); else v.items = [];
  // every version (v1.7-c22): repair wrong types in damaged/partial files so they can't crash a battle (ITEMS[weapon].v)
  // or corrupt play time ('abc' + dt string-concats). Valid values are left untouched.
  const d = newHero('SPARK');
  if (typeof v.name !== 'string' || !v.name) v.name = d.name;
  for (const k of ['coil', 'torque', 'cogs', 'glow', 'kills', 'spares', 'play', 'dir']) { const n = typeof v[k] === 'boolean' ? NaN : +v[k]; v[k] = Number.isFinite(n) ? n : d[k]; }
  if (v.coil < 1) v.coil = 1;
  if (!Number.isFinite(+v.x) || !Number.isFinite(+v.y)) { v.room = d.room; v.x = d.x; v.y = d.y; } else { v.x = +v.x; v.y = +v.y; }
  if (!v.flags || typeof v.flags !== 'object' || Array.isArray(v.flags)) v.flags = {};
  if (!Array.isArray(v.lev)) v.lev = d.lev.slice(); else v.lev = v.lev.map(n => +n === 1 ? 1 : 0);
  while (v.lev.length < d.lev.length) v.lev.push(0);
  const ak = v.areaKills && typeof v.areaKills === 'object' && !Array.isArray(v.areaKills) ? v.areaKills : {};
  v.areaKills = Object.assign({}, d.areaKills, ak); for (const k in v.areaKills) { const n = +v.areaKills[k]; v.areaKills[k] = Number.isFinite(n) ? n : 0; }
  if (!ITEMS[v.weapon] || ITEMS[v.weapon].kind !== 'weapon') v.weapon = d.weapon;
  if (!ITEMS[v.armor] || ITEMS[v.armor].kind !== 'armor') v.armor = d.armor;
  return v;
}
function loadSlot(n) { try { return migrateSave(JSON.parse(localStorage.getItem(slotKey(n)))); } catch (e) { return null; } }
function loadSave() { return loadSlot(slot); }
function wipeSlot(n) { localStorage.removeItem(slotKey(n)); if (meta.fileEnds) { delete meta.fileEnds[n]; saveMeta(); } }
const bagCount = () => hero.items.filter(k => ITEMS[k] && ITEMS[k].kind !== 'gift').length;
const has = k => hero.items.includes(k);
function giveKey(k) { if (!has(k)) hero.items.push(k); }
function giveItem(k, quiet) {
  if (bagCount() >= BAG_MAX) { if (!quiet) say('', `You found a ${ITEMS[k].name}... but your pockets are full.`); return false; }
  hero.items.push(k); sfx('item'); floatText(heroScreen().x, heroScreen().y - 50, '+ ' + ITEMS[k].name, '#ffd36e', 16, 1.4); return true;
}
function equipItem(idx) { const k = hero.items[idx], it = ITEMS[k]; const slot = it.kind === 'weapon' ? 'weapon' : 'armor'; hero.items[idx] = hero[slot]; hero[slot] = k; }

/* ===================== DIALOGUE ===================== */
const VOICES = { TOLLY: 220, TESS: 640, BUN: 420, LUMEN: 520, PIP: 760, 'SGT. RIVET': 300, WICKLOW: 260, SPROCKET: 880, HUSH: 980, 'FOREMAN GRIT': 160, 'MADAME CUCKOO': 700, MERIDIAN: 340, MOPSLEY: 190, GERALD: 900 };
let DLG = null;
const dialogOpen = () => !!DLG;
// v1.7-c20 (D6 softlock fix): a second say() while a box is open used to overwrite DLG, so the first script never resumed and busy stayed >0 (player frozen; found by rwb.js at the Lantern Grove: wrong lantern + quick Z). Now it waits its turn.
function say(name, ...lines) { if (DLG) { const d = DLG, prev = d.res; return new Promise(res => { d.res = v => { prev(v); Promise.resolve().then(() => say(name, ...lines).then(res)); }; }); }
  return new Promise(res => { DLG = { name, lines: lines.flat(), i: 0, typer: new Typer(lines.flat()[0], VOICES[name] || 480), res, choice: null }; }); }
function ask(name, text, opts) { return new Promise(res => { DLG = { name, lines: [text], i: 0, typer: new Typer(text, VOICES[name] || 480), res, choice: { opts, sel: 0 } }; }); }
function updateDialog(dt) {
  const d = DLG; d.typer.update(dt);
  const tap = takeTap(), ok = act('ok') || !!tap;
  if (d.choice && d.typer.done) {
    if (act('left') || act('up')) { d.choice.sel = (d.choice.sel + d.choice.opts.length - 1) % d.choice.opts.length; sfx('move'); }
    if (act('right') || act('down')) { d.choice.sel = (d.choice.sel + 1) % d.choice.opts.length; sfx('move'); }
    if (tap) { for (let i = 0; i < d.choice.opts.length; i++) { const r = choiceRect(i, d.choice.opts.length); if (tap.x >= r.x && tap.x <= r.x + r.w && tap.y >= r.y && tap.y <= r.y + r.h) { d.choice.sel = i; sfx('select'); DLG = null; d.res(i); return; } } return; }
    if (ok) { sfx('select'); DLG = null; d.res(d.choice.sel); }
    if (act('back')) { sfx('back'); DLG = null; d.res(d.choice.opts.length - 1); }
    return;
  }
  if (ok) { if (!d.typer.done) d.typer.finish(); else { d.i++; if (d.i >= d.lines.length) { DLG = null; d.res(); } else d.typer = new Typer(d.lines[d.i], d.typer.voice); } }
}
const DLG_BOX = { x: 40, y: 368, w: 880, h: 150 };
const choiceRect = (i, n) => ({ x: DLG_BOX.x + DLG_BOX.w - 30 - (n - i) * 200, y: DLG_BOX.y - 56, w: 186, h: 46 });
function drawDialog() {
  const d = DLG; if (!d) return; const bx = DLG_BOX; drawPanel(bx.x, bx.y, bx.w, bx.h);
  let tx = bx.x + 28;
  if (d.name) { ctx.font = `bold 15px ${FONT}`; const nw = ctx.measureText(d.name).width + 24; ctx.fillStyle = '#c8a050'; rrect(bx.x + 20, bx.y - 16, nw, 28, 6); ctx.fill(); ctx.fillStyle = '#140c06'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(d.name, bx.x + 32, bx.y - 2); }
  ctx.font = `bold 21px ${FONT}`; ctx.fillStyle = '#f4ecd8'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  wrapText(d.typer.str, bx.w - 60).slice(0, 4).forEach((ln, i) => ctx.fillText(ln, tx, bx.y + 24 + i * 29));
  if (d.typer.done && !d.choice && Math.floor(performance.now() / 300) % 2) poly([bx.x + bx.w - 34, bx.y + bx.h - 26, bx.x + bx.w - 20, bx.y + bx.h - 26, bx.x + bx.w - 27, bx.y + bx.h - 17], '#ffd36e');
  if (d.choice && d.typer.done) d.choice.opts.forEach((o, i) => { const r = choiceRect(i, d.choice.opts.length), on = i === d.choice.sel; rrect(r.x, r.y, r.w, r.h, 8); ctx.fillStyle = on ? '#3a2a10' : 'rgba(14,12,30,.95)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = on ? '#ffd36e' : '#c8a050'; ctx.stroke();
    ctx.font = `bold 17px ${FONT}`; ctx.fillStyle = on ? '#ffd36e' : '#f4ecd8'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(o, r.x + r.w / 2, r.y + r.h / 2 + 1); if (on) drawCore(r.x + 14, r.y + r.h / 2, performance.now() / 1000, false, false); });
}

/* ===================== ROOMS ===================== */
const SOLID = new Set(['#', 'T', 'B', 'R', 'd', '~']);
let RM = null; // runtime room
function tileAt(tx, ty) { const m = RM.def.map; if (ty < 0 || ty >= m.length || tx < 0 || tx >= m[0].length) return '#'; return m[ty][tx]; }
function enterRoom(id, tx, ty, dir) {
  const def = ROOMS[id]; hero.room = id;
  if (tx != null) { hero.x = tx * TILE + 16; hero.y = ty * TILE + 24; }
  if (dir != null) hero.dir = dir;
  RM = { id, def, w: def.map[0].length * TILE, h: def.map.length * TILE, ents: [], cache: null, lanternSeq: [], t: 0, encAcc: 0, encNext: rand(260, 480), fade: 1, nameT: 2.5 };
  for (const e of def.ents) { const o = Object.assign({}, e, { px: e.x * TILE + 16, py: e.y * TILE + 24, def: e }); RM.ents.push(o); }
  if (id === 'cogworks1') { const crates = RM.ents.filter(e => e.t === 'crate'); if (hero.flags.plates) { crates[0].x = 4; crates[0].y = 3; crates[1].x = 25; crates[1].y = 3; } for (const c of crates) { c.rx = c.x; c.ry = c.y; } }
  for (const e of RM.ents) if (e.t === 'lantern') e.lit = !!hero.flags.lanterns;
  RM.cache = renderRoomCache(def); setTrack(roomTrackFor(id)); musicPaused = false;
  particles.length = 0; floaters.length = 0; camUpdate(true);
}
const entShown = e => (e.t !== 'boss' || !hero.flags[e.flag]) && (!e.show || e.show()) && (e.t !== 'gate' || !hero.flags[e.flag]);
function entSolidRect(e) {
  if (!entShown(e) || e.t === 'trigger' || e.t === 'crater' || e.walk) return null;
  if (e.t === 'gate') return { x: e.x * TILE, y: e.y * TILE, w: e.w * TILE, h: e.h * TILE };
  if (e.t === 'crate') return { x: e.rx * TILE + 1, y: e.ry * TILE + 1, w: TILE - 2, h: TILE - 2 };
  if (e.t === 'boss') return { x: e.px - 40, y: e.py - 30, w: 80, h: 40 };
  if (e.t === 'door') return null;
  return { x: e.px - 12, y: e.py - 14, w: 24, h: 16 };
}
function blocked(x, y, ignore) { // hero feet box
  const x0 = x - 9, x1 = x + 9, y0 = y - 9, y1 = y + 1;
  for (const [px, py] of [[x0, y0], [x1, y0], [x0, y1], [x1, y1], [x, y0], [x, y1]]) {
    const tx = Math.floor(px / TILE), ty = Math.floor(py / TILE);
    if (px < 0 || py < 0 || px >= RM.w || py >= RM.h) { if (!exitAt(px, py)) return { wall: true }; continue; }
    if (SOLID.has(tileAt(tx, ty))) return { wall: true };
  }
  for (const e of RM.ents) { if (e === ignore) continue; const r = entSolidRect(e); if (r && x1 > r.x && x0 < r.x + r.w && y1 > r.y && y0 < r.y + r.h) return { ent: e }; }
  return null;
}
function exitAt(px, py) { const tx = Math.floor(px / TILE), ty = Math.floor(py / TILE); for (const ex of RM.def.exits) { if (tx >= ex.x - (ex.x === 0 ? 1 : 0) && tx < ex.x + ex.w + (ex.x + ex.w >= RM.def.map[0].length ? 1 : 0) && ty >= ex.y - (ex.y === 0 ? 1 : 0) && ty < ex.y + ex.h + (ex.y + ex.h >= RM.def.map.length ? 1 : 0)) return ex; } return null; }
const cam = { x: 0, y: 0 };
function camUpdate(snap) {
  const tx = clamp(hero.x - W / 2, 0, Math.max(0, RM.w - W)), ty = clamp(hero.y - 16 - H / 2, 0, Math.max(0, RM.h - H));
  if (snap) { cam.x = tx; cam.y = ty; } else { cam.x += (tx - cam.x) * 0.15; cam.y += (ty - cam.y) * 0.15; }
  if (RM.w < W) cam.x = (RM.w - W) / 2; if (RM.h < H) cam.y = (RM.h - H) / 2;
}
const heroScreen = () => ({ x: hero.x - cam.x, y: hero.y - cam.y });

/* ===================== WORLD UPDATE ===================== */
let busy = 0, walkT = 0, pushT = 0, encFX = 0, roomFade = 0, pendingExit = null;
async function runScript(fn) { busy++; try { await fn(); } catch (e) { console.error(e); } busy = Math.max(0, busy - 1); }
function updateWorld(dt) {
  hero.play += dt; RM.t += dt; if (RM.nameT > 0) RM.nameT -= dt;
  if (RM.fade > 0) RM.fade = Math.max(0, RM.fade - dt * 3);
  if (pendingExit) { roomFade += dt * 4; if (roomFade >= 1) { const ex = pendingExit; pendingExit = null; enterRoom(ex.to, ex.tx, ex.ty); RM.iris = true; sfx('door'); roomFade = 0; } return; }
  if (encFX > 0) { encFX -= dt; if (encFX <= 0) startBattle(RM.encEnemy); return; }
  if (DLG) { updateDialog(dt); return; }
  if (busy) return;
  if (RM.def.tick) RM.def.tick(dt); // v1.4: per-room hook (conveyors); undefined for every older room
  if (act('menu')) { openPause(); return; }
  const inp = readInput(); let mx = inp.x, my = inp.y; const m = Math.hypot(mx, my);
  if (m > 1) { mx /= m; my /= m; }
  const spd = 150 * (inp.focus && !touch.joy ? 1.45 : 1);
  if (m > 0.15) {
    if (Math.abs(mx) > Math.abs(my)) hero.dir = mx > 0 ? 1 : 3; else hero.dir = my > 0 ? 2 : 0;
    const ox = hero.x, oy = hero.y; let pushed = null;
    const nx = hero.x + mx * spd * dt; const bx = blocked(nx, hero.y); if (!bx) hero.x = nx; else if (bx.ent && bx.ent.t === 'crate' && Math.abs(mx) > 0.6) pushed = [bx.ent, Math.sign(mx), 0];
    const ny = hero.y + my * spd * dt; const by = blocked(hero.x, ny); if (!by) hero.y = ny; else if (by.ent && by.ent.t === 'crate' && Math.abs(my) > 0.6) pushed = [by.ent, 0, Math.sign(my)];
    if (pushed) { pushT += dt; if (pushT > 0.18) { tryPush(...pushed); pushT = 0; } } else pushT = 0;
    const moved = Math.hypot(hero.x - ox, hero.y - oy); walkT += moved / 150;
    if (moved > 0 && Math.floor(walkT * 4) !== Math.floor((walkT - moved / 150) * 4)) { sfx('step'); if (Math.random() < 0.5) burst(hero.x + rand(-4, 4), hero.y, 1, 'rgba(200,180,140,.6)', 20, 0.4, 3); }
    // tall grass encounters
    const tx = Math.floor(hero.x / TILE), ty = Math.floor((hero.y - 4) / TILE);
    if (moved > 0 && RM.def.enc) { // v1.3: tall grass = full rate (~12-20 steps), plain paths in monster areas = 35%
      const grass = tileAt(tx, ty) === ',';
      if (grass && Math.random() < 0.08) burst(hero.x + rand(-8, 8), hero.y - 6, 1, '#6a8a3a', 40, 0.4, 3);
      RM.encAcc += moved * (grass ? 1 : 0.35); if (RM.encAcc > RM.encNext) { RM.encAcc = 0; RM.encNext = rand(380, 640); tryEncounter(); }
    }
    const ex = exitAt(hero.x, hero.y - 4); if (ex) { pendingExit = ex; roomFade = 0; }
    for (const e of RM.ents) if (e.t === 'trigger' && !hero.flags[e.flag] && tx >= e.x && tx < e.x + e.w && ty >= e.y && ty < e.y + e.h) { runScript(e.run); break; }
  } else { walkT = 0; pushT = 0; }
  if (act('ok')) interact();
  takeTap();
  camUpdate(false);
}
function tryEncounter() {
  const area = RM.def.enc, pop = AREA_POP[area];
  if ((hero.areaKills[area] || 0) >= pop) { if (!hero.flags['empty_' + area]) { hero.flags['empty_' + area] = true; runScript(() => say('', 'The grass rustles... but nothing comes out.', 'It\'s very quiet here now.')); } return; }
  RM.encEnemy = pick(ENC_TABLE[area]); encFX = 0.55; sfx('encounter'); resetTouch();
}
function tryPush(c, dx, dy) {
  const nx = c.rx + dx, ny = c.ry + dy; const ch = tileAt(nx, ny);
  if (SOLID.has(ch)) return;
  for (const e of RM.ents) { if (e === c) continue; const r = entSolidRect(e); if (r && nx * TILE + 16 > r.x && nx * TILE + 16 < r.x + r.w && ny * TILE + 16 > r.y && ny * TILE + 16 < r.y + r.h) return; }
  if (hero.flags.plates) return;
  c.rx = nx; c.ry = ny; c.animT = 0.15; sfx('push'); shake(2, 0.1);
  const plates = []; RM.def.map.forEach((row, y) => [...row].forEach((ch2, x) => { if (ch2 === 'p') plates.push([x, y]); }));
  const crates = RM.ents.filter(e => e.t === 'crate');
  if (plates.every(([x, y]) => crates.some(k => k.rx === x && k.ry === y))) { hero.flags.plates = true; setTimeout(() => { sfx('puzzle'); shake(6, 0.5); burst(15 * TILE - cam.x, 1.5 * TILE - cam.y, 40, '#ffd36e', 200, 0.9, 3); runScript(() => say('', 'CLUNK. Both plates click down. The shutter grinds open!')); }, 200); }
}
function interact() {
  const fx = [0, 1, 0, -1][hero.dir], fy = [-1, 0, 1, 0][hero.dir];
  const px = hero.x + fx * 24, py = hero.y - 6 + fy * 24;
  let best = null, bd = 1e9;
  for (const e of RM.ents) { if (!entShown(e) || e.t === 'trigger' || e.t === 'crate' || (e.t === 'crater' && !e.run) || e.t === 'candles') continue;
    let d; if (e.t === 'gate') { const inside = px >= e.x * TILE - 8 && px <= (e.x + e.w) * TILE + 8 && py >= e.y * TILE - 8 && py <= (e.y + e.h) * TILE + 16; d = inside ? 0 : 1e9; }
    else d = Math.hypot(e.px - px, e.py - 8 - py);
    const lim = e.t === 'boss' ? 60 : e.t === 'door' ? 30 : 30; if (d < lim && d < bd) { bd = d; best = e; } }
  if (!best) return;
  const e = best;
  if (e.t === 'npc') { const dx = hero.x - e.px; e.face = dx > 0 ? 1 : 3; runScript(e.run); }
  else if (e.t === 'thing' || e.t === 'crater') runScript(e.run);
  else if (e.t === 'sign' || e.t === 'door') runScript(() => say('', ...e.text));
  else if (e.t === 'chest') runScript(async () => { if (hero.flags[e.flag]) return say('', 'The chest is empty. It\'s a very nice empty, though.'); if (bagCount() >= BAG_MAX) return say('', 'There\'s something inside, but your pockets are full.'); hero.flags[e.flag] = true; giveItem(e.item, true); burst(e.px - cam.x, e.py - 20 - cam.y, 20, '#ffd36e', 120, 0.7, 3); await say('', `You found the ${ITEMS[e.item].name}!`, ITEMS[e.item].desc); });
  else if (e.t === 'save') runScript(async () => { sfx('save'); hero.glow = maxGlow(hero); burst(e.px - cam.x, e.py - 30 - cam.y, 30, '#ffe8a0', 120, 1, 3);
    const c = await ask('', `You ring the little bell. Ting. The moment hangs in the air, waiting to be kept. (GLOW restored)`, ['KEEP IT', 'NOT NOW']);
    if (c === 0) { saveGame(); hhKept(e); await say('', `Moment kept at ${saveClock()}. · ${hero.name} · COIL ${hero.coil} · ${ROOMS[hero.room].name}`); } });
  else if (e.t === 'lantern') lanternUse(e);
  else if (e.t === 'lever') leverUse(e);
  else if (e.t === 'gate') runScript(() => say('', { vines: 'Thorny vines block the path north. The three lanterns seem connected to them.', wax: 'A wall of hardened wax. It is very knightly.', shutter: 'A heavy metal shutter. Firmly shut.', bars: 'Iron bars. Something above is keeping them closed.' }[e.style]));
  else if (e.t === 'boss') runScript(() => say('', 'They\'re waiting for you to come closer.'));
  else if (e.t === 'bigbell') runScript(() => say('', 'The Bell of Hours. Enormous, silent, and very slightly dented where something small fell out.'));
}
function lanternUse(e) {
  if (hero.flags.lanterns) return runScript(() => say('', 'The lantern burns warm and steady.'));
  if (e.lit) return runScript(() => say('', 'This one is already lit.'));
  e.lit = true; sfx('light'); burst(e.px - cam.x, e.py - 30 - cam.y, 14, '#ffd36e', 90, 0.6, 3); RM.lanternSeq.push(e.n);
  const seq = RM.lanternSeq;
  if (seq.some((v, i) => v !== LANTERN_ORDER[i])) { setTimeout(() => { for (const l of RM.ents) if (l.t === 'lantern') l.lit = false; RM.lanternSeq = []; sfx('wrong'); shake(3, 0.2); hero.flags.lanternFails = (hero.flags.lanternFails || 0) + 1;
    runScript(() => say('', hero.flags.lanternFails >= 2 ? ['The lanterns gutter out together.', '(The sign said east to west. East is on the RIGHT. Start there.)'] : ['The lanterns gutter out together. Wrong order, maybe?'])); }, 350); return; }
  if (seq.length === 3) { hero.flags.lanterns = true; setTimeout(() => { sfx('puzzle'); shake(6, 0.5); for (let i = 0; i < 4; i++) burst((13.5 + i) * TILE - cam.x, 1.5 * TILE - cam.y, 12, '#7fe08a', 160, 0.9, 4); runScript(() => say('', 'All three lanterns blaze up. The vines to the north unknot themselves and bow aside.')); }, 300); }
}
function leverUse(e) {
  if (e.reset) { if (hero.flags.plates) return runScript(() => say('', 'The reset lever. No need now; the shutter is open.')); sfx('push'); for (const c of RM.ents.filter(k => k.t === 'crate')) { c.rx = c.x; c.ry = c.y; } return runScript(() => say('', 'KA-CHUNK. The crates slide back to where they started.')); }
  if (hero.flags.levers) return runScript(() => say('', 'The levers are locked in place now.'));
  const L = hero.lev, flip = i => { L[i] = 1 - L[i]; };
  if (e.n === 0) { flip(0); flip(1); } else if (e.n === 1) flip(1); else { flip(2); flip(1); }
  sfx('push'); shake(2, 0.1);
  if (L[0] === 1 && L[1] === 0 && L[2] === 1) { hero.flags.levers = true; setTimeout(() => { sfx('puzzle'); shake(6, 0.5); runScript(() => say('', 'Up, down, up. Somewhere above, a pendulum swings free. The bars rise!')); }, 250); }
}
async function fadeNap() { RM.fade = 2.2; sfx('save'); await sleep(900); }
function backToWorld(result, b) {
  state = 'world'; resetTouch(); clearBullets(false); particles.length = 0; floaters.length = 0;
  if (!b) return;
  setTrack(roomTrackFor(hero.room));
  if (result === 'flee') { RM.encAcc = -200; return; }
  if (b.e.boss && !b.mer) {
    hero.flags[b.id + '_done'] = true;
    const post = { wicklow: result === 'spare' ? ['WICKLOW', 'You fight like no knight I know. You barely fight at all!', 'Pass, little flame. I shall go sit somewhere warm. Perhaps the bakery has a bench.'] : ['', 'The wax wall behind where Wicklow stood slumps and melts away.'],
      grit: result === 'spare' ? ['FOREMAN GRIT', 'A break... a real break...', 'Shutter\'s open, kid. Go on up. I\'m gonna lie down on this very comfortable pile of gears.'] : ['', 'The shutter rattles open on its own. The machines have stopped.'],
      cuckoo: result === 'spare' ? ['MADAME CUCKOO', 'Bravo, darling. BRAVO to YOU.', 'The Belfry is just above. Tell that jester... tell him I want to sing a NEW hour.'] : ['', 'The bars rise. The gallery is silent now.'] }[b.id];
    if (b.id === 'wicklow') { giveKey(result === 'spare' ? 'wickstub' : 'waxseal'); post.push(result === 'spare' ? '(Wicklow pressed something warm into your hand: a stub of his wick.)' : '(In the cooling wax, something small and hard: a seal. It is stamped with a V.)'); }
    if (post) runScript(() => say(post[0], ...post.slice(1)));
    for (let i = 0; i < 30; i++) burst(rand(300, 660), rand(80, 200), 1, result === 'spare' ? '#ffe8a0' : '#888', 100, 1, 3);
  }
  if (b.mer) { startEnding(result); return; }
  RM.encAcc = -150;
}

/* ===================== ROOM RENDER ===================== */
const PAL = {
  forest: { floor: '#2e4a26', floor2: '#36552c', grass: '#1f3a18', tuft: '#4a7a30', wall: '#14200f', tree: ['#7a3a1a', '#b85a2a', '#d88a3a'], water: '#1a3a5a', path: '#6a5a3a', flower: ['#ffd36e', '#ff9ad8', '#9ad8ff'] },
  town: { floor: '#5a4a5a', floor2: '#665566', grass: '#3a4a2a', tuft: '#5a7a3a', wall: '#2a1a2a', tree: ['#3a5a2a', '#5a8a3a', '#7aaa4a'], water: '#4a7aa8', path: '#8a7a6a', flower: ['#ffd36e', '#ff9ad8', '#fff'], brick: '#8a4a3a', roof: '#4a2a5a' },
  cog: { floor: '#3a3430', floor2: '#443c36', grass: '#1a1612', tuft: '#5a4a2a', wall: '#1a1410', tree: ['#5a4a3a', '#8a6a4a', '#c8a050'], water: '#2a2a3a', path: '#5a5048', flower: ['#c8a050', '#888', '#c8a050'] },
  spire: { floor: '#2a2236', floor2: '#30283e', grass: '#3a1a3a', tuft: '#6a3a6a', wall: '#120c1a', tree: ['#3a3048', '#5a4a6a', '#8a7aa8'], water: '#1a1a3a', path: '#4a3a5a', carpet: '#6a1a2a', flower: ['#ffd36e', '#c8a050', '#ffd36e'] },
  belfry: { floor: '#1e1826', floor2: '#241e2c', grass: '#1e1826', tuft: '#3a2a4a', wall: '#0a0610', tree: ['#2a2234', '#3a3046', '#5a4a6a'], water: '#100a1a', path: '#3a2a4a', carpet: '#4a1020', flower: ['#ffd36e', '#c8a050', '#ffd36e'] },
};
function hash(x, y) { let h = x * 374761393 + y * 668265263; h = (h ^ (h >> 13)) * 1274126177; return ((h ^ (h >> 16)) >>> 0) / 4294967295; }
function renderRoomCache(def) {
  const c = document.createElement('canvas'); c.width = def.map[0].length * TILE; c.height = def.map.length * TILE;
  const g = c.getContext('2d'), pal = PAL[def.theme], th = def.theme, saved = ctx;
  const R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  def.map.forEach((row, ty) => [...row].forEach((ch, tx) => {
    const x = tx * TILE, y = ty * TILE, h1 = hash(tx, ty);
    R(x, y, TILE, TILE, (tx + ty) % 2 ? pal.floor : pal.floor2);
    if (th === 'cog' && ch !== '#') { g.strokeStyle = 'rgba(0,0,0,.25)'; g.strokeRect(x + 0.5, y + 0.5, TILE - 1, TILE - 1); if (h1 < 0.3) { g.fillStyle = 'rgba(200,160,80,.25)'; g.beginPath(); g.arc(x + 4, y + 4, 1.5, 0, 6.283); g.arc(x + 28, y + 28, 1.5, 0, 6.283); g.fill(); } }
    if (th === 'town' && (ch === '.' || ch === 'o')) { g.strokeStyle = 'rgba(0,0,0,.18)'; g.strokeRect(x + 1 + (ty % 2) * 8, y + 1, 14, 14); g.strokeRect(x + 17 - (ty % 2) * 8, y + 17, 14, 14); }
    if (th === 'tide' && (ch === '.' || ch === '=')) { g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(x, y + 10, TILE, 1); g.fillRect(x, y + 21, TILE, 1); if (h1 < 0.2) { g.fillStyle = 'rgba(154,216,255,.18)'; g.fillRect(x + 6, y + 13, 12, 5); } }
    if ((th === 'forest') && ch === '.' && h1 < 0.25) { R(x + h1 * 80 % 28, y + (h1 * 300) % 28, 2, 4, pal.tuft); }
    if (ch === ',') { R(x, y, TILE, TILE, pal.grass); g.fillStyle = pal.tuft; for (let i = 0; i < 6; i++) { const gx = x + hash(tx * 7 + i, ty) * 28 + 2, gy = y + hash(tx, ty * 7 + i) * 24 + 6; g.beginPath(); g.moveTo(gx - 3, gy + 6); g.lineTo(gx, gy - 4); g.lineTo(gx + 3, gy + 6); g.fill(); } }
    if (ch === '=') { R(x, y + 2, TILE, TILE - 4, pal.path); g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(x + 15, y + 2, 2, TILE - 4); }
    if (ch === '_') { R(x, y, TILE, TILE, pal.carpet || '#6a1a2a'); g.fillStyle = 'rgba(255,211,110,.25)'; g.fillRect(x, y + 3, TILE, 2); g.fillRect(x, y + TILE - 5, TILE, 2); }
    if (ch === 'o') { for (let i = 0; i < 3; i++) { g.fillStyle = pal.flower[i]; g.beginPath(); g.arc(x + 8 + i * 8, y + 10 + (i % 2) * 12, 3, 0, 6.283); g.fill(); } }
    if (ch === 'p') { g.fillStyle = '#2a2420'; g.fillRect(x + 3, y + 3, 26, 26); g.strokeStyle = '#c8a050'; g.lineWidth = 2; g.strokeRect(x + 5, y + 5, 22, 22); g.fillStyle = '#c8a050'; g.beginPath(); g.arc(x + 16, y + 16, 5, 0, 6.283); g.fill(); }
    if (ch === '~') { R(x, y, TILE, TILE, pal.water); g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(x + 4 + h1 * 10, y + 10, 10, 2); g.fillRect(x + 14, y + 22, 8, 2); }
    if (ch === '~' && th === 'tide') { g.fillStyle = 'rgba(154,216,255,.2)'; g.fillRect(x, y, TILE, 2); g.fillStyle = 'rgba(0,20,40,.25)'; g.fillRect(x, y + 28, TILE, 4); }
    if (ch === '#') { R(x, y, TILE, TILE, pal.wall); if (th === 'forest' || th === 'town') { g.fillStyle = pal.tree[0]; g.beginPath(); g.arc(x + 16, y + 16, 16 + h1 * 4, 0, 6.283); g.fill(); } else { g.fillStyle = 'rgba(255,255,255,.04)'; g.fillRect(x, y, TILE, 3); } }
    if (ch === 'B') { R(x, y, TILE, TILE, pal.brick || '#5a3a3a'); g.fillStyle = 'rgba(0,0,0,.2)'; for (let i = 0; i < 4; i++) g.fillRect(x, y + i * 8 + 7, TILE, 1); g.fillRect(x + (ty % 2 ? 8 : 24), y, 1, TILE); if (h1 < 0.35) { g.fillStyle = '#ffd98a'; g.fillRect(x + 9, y + 8, 14, 12); g.fillStyle = '#5a3a2a'; g.fillRect(x + 15, y + 8, 2, 12); } }
    if (ch === 'R') { R(x, y, TILE, TILE, pal.roof || '#3a2a4a'); g.fillStyle = 'rgba(255,255,255,.08)'; for (let i = 0; i < 4; i++) g.fillRect(x, y + i * 8, TILE, 3); }
    if (ch === 'd') { R(x, y, TILE, TILE, pal.brick || '#5a3a3a'); g.fillStyle = '#3a2214'; g.fillRect(x + 6, y + 4, 20, 28); g.fillStyle = '#ffd36e'; g.beginPath(); g.arc(x + 21, y + 19, 2, 0, 6.283); g.fill(); }
  }));
  // tall things after (trees / pillars / pipes overlap upward)
  def.map.forEach((row, ty) => [...row].forEach((ch, tx) => {
    if (ch !== 'T' && !(ch === '#' && (th === 'forest') && hash(tx, ty) < 0.5)) return;
    const x = tx * TILE + 16, y = ty * TILE + 28, h1 = hash(tx + 3, ty + 9);
    if (th === 'forest' || th === 'town') { g.fillStyle = '#3a2414'; g.fillRect(x - 4, y - 18, 8, 18); const cols = pal.tree; for (let i = 0; i < 3; i++) { g.fillStyle = cols[i]; g.beginPath(); g.arc(x + (i - 1) * 5 * h1, y - 26 - i * 7, 16 - i * 4, 0, 6.283); g.fill(); } if (th === 'forest' && h1 < 0.4) { g.fillStyle = '#c8a050'; g.beginPath(); g.arc(x + 6, y - 30, 3, 0, 6.283); g.fill(); } }
    else if (th === 'cog') { g.fillStyle = '#4a3a2a'; g.fillRect(x - 12, y - 30, 24, 30); g.fillStyle = '#6a5a4a'; g.fillRect(x - 14, y - 34, 28, 6); g.fillStyle = '#8a6a3a'; g.beginPath(); g.arc(x, y - 16, 7, 0, 6.283); g.fill(); g.fillStyle = '#3a2a1a'; g.beginPath(); g.arc(x, y - 16, 3, 0, 6.283); g.fill(); }
    else { g.fillStyle = pal.tree[1]; g.fillRect(x - 10, y - 44, 20, 44); g.fillStyle = pal.tree[2]; g.fillRect(x - 13, y - 48, 26, 6); g.fillRect(x - 13, y - 4, 26, 6); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x + 4, y - 42, 4, 38); }
  }));
  void saved; return c;
}
function drawGate(e) {
  const x = e.x * TILE - cam.x, y = e.y * TILE - cam.y, w = e.w * TILE, h = e.h * TILE + 6, t = RM.t;
  if (e.style === 'vines') { for (let i = 0; i < e.w * 3; i++) { const vx = x + i * 11 + 4; ctx.strokeStyle = i % 2 ? '#3a6a2a' : '#2a5a1a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(vx, y - 10); ctx.quadraticCurveTo(vx + Math.sin(t + i) * 6, y + h / 2, vx, y + h); ctx.stroke(); circ(vx + 3, y + 10 + (i % 3) * 8, 2.5, '#9a3a5a'); } }
  else if (e.style === 'wax') { ctx.fillStyle = '#efe0bc'; ctx.fillRect(x, y - 8, w, h + 6); for (let i = 0; i < 8; i++) ell(x + 8 + i * 15, y + h - 2, 6, 8 + (i % 3) * 3, '#efe0bc'); ctx.fillStyle = '#c8b898'; ctx.fillRect(x, y + 6, w, 3); }
  else if (e.style === 'shutter') { ctx.fillStyle = '#5a5048'; ctx.fillRect(x, y - 6, w, h + 2); ctx.fillStyle = '#3a342e'; for (let i = 0; i < 5; i++) ctx.fillRect(x, y - 4 + i * 8, w, 3); ctx.fillStyle = '#e8a030'; for (let i = 0; i < 6; i++) poly([x + i * 22, y + h - 8, x + i * 22 + 11, y + h - 8, x + i * 22 + 4, y + h - 2, x + i * 22 - 7, y + h - 2], '#e8a030'); }
  else { for (let i = 0; i <= e.w * 2; i++) { ctx.fillStyle = '#6a6a7a'; ctx.fillRect(x + i * 16 - 2, y - 8, 5, h + 4); } ctx.fillStyle = '#4a4a5a'; ctx.fillRect(x, y + 2, w, 5); }
}
function drawEnt(e) {
  const x = e.px - cam.x, y = e.py - cam.y, t = RM.t;
  switch (e.t) {
    case 'npc': if (e.kind === 'mini') { ctx.save(); ctx.translate(x, y); const en = ENEMIES[e.look]; ctx.scale(en.mini, en.mini); ART[en.art](0, -110, t, { hurt: 0, eye: '#fff' }); ctx.restore(); } else { ctx.save(); ctx.translate(x, y); ctx.scale(1.25, 1.25); drawNPC(e.kind, 0, 0, t); ctx.restore(); } break;
    case 'save': drawChimePost(x, y, t); break;
    case 'sign': ell(x, y + 1, 10, 4, 'rgba(0,0,0,.3)'); ctx.fillStyle = '#5a3a1a'; ctx.fillRect(x - 2, y - 14, 4, 14); ctx.fillStyle = '#9a6a3a'; rrect(x - 13, y - 28, 26, 16, 3); ctx.fill(); ctx.fillStyle = '#5a3a1a'; ctx.fillRect(x - 8, y - 23, 16, 2); ctx.fillRect(x - 8, y - 18, 12, 2); break;
    case 'chest': { const open = hero.flags[e.flag]; ell(x, y + 1, 13, 4, 'rgba(0,0,0,.3)'); ctx.fillStyle = '#7a4a22'; ctx.fillRect(x - 13, y - 16, 26, 16); ctx.fillStyle = open ? '#3a2010' : '#9a5a2a'; ctx.fillRect(x - 14, y - (open ? 26 : 22), 28, open ? 6 : 8); ctx.fillStyle = '#ffd36e'; ctx.fillRect(x - 2, y - 14, 4, 5); if (!open && Math.floor(t * 2) % 4 === 0) circ(x + 9, y - 20, 1.5, '#fff'); break; }
    case 'lantern': { ell(x, y + 1, 9, 3, 'rgba(0,0,0,.3)'); ctx.fillStyle = '#2a2a2a'; ctx.fillRect(x - 2, y - 26, 4, 26); ctx.fillRect(x - 8, y - 2, 16, 3);
      ctx.save(); if (e.lit) { ctx.shadowColor = '#ffd36e'; ctx.shadowBlur = 24; } ctx.fillStyle = e.lit ? '#ffd36e' : '#3a3a2a'; rrect(x - 8, y - 42, 16, 18, 4); ctx.fill(); ctx.restore(); poly([x - 10, y - 42, x + 10, y - 42, x, y - 50], '#2a2a2a');
      ctx.font = `10px ${FONT}`; ctx.fillStyle = '#aaa'; ctx.textAlign = 'center'; ctx.fillText(['W', 'MID', 'E'][e.n], x, y + 12); break; }
    case 'lever': { const st = e.reset ? 0 : hero.lev[e.n]; ctx.fillStyle = '#3a3a4a'; ctx.fillRect(x - 10, y - 8, 20, 8); line(x, y - 6, x + (st ? 0 : 0), y - (st ? 26 : 4) , '#aaa', 4); circ(x, y - (st ? 26 : 4), 5, e.reset ? '#e85a3a' : st ? '#7fe08a' : '#e85a3a'); if (e.reset) { ctx.font = `9px ${FONT}`; ctx.fillStyle = '#ccc'; ctx.textAlign = 'center'; ctx.fillText('RESET', x, y + 10); } else { line(x, y - 4, x, y - (st ? 26 : 4), '#aaa', 4); ctx.font = `10px ${FONT}`; ctx.fillStyle = st ? '#7fe08a' : '#e88'; ctx.textAlign = 'center'; ctx.fillText(st ? 'UP' : 'DOWN', x, y + 10); } break; }
    case 'crate': { if (e.animT > 0) e.animT -= 1 / 60; const cx = lerp(e.lx ?? e.rx, e.rx, 1) * TILE + 16 - cam.x, cy = e.ry * TILE + 16 - cam.y; ctx.fillStyle = '#8a5a2a'; ctx.fillRect(cx - 15, cy - 15, 30, 30); ctx.strokeStyle = '#5a3a1a'; ctx.lineWidth = 3; ctx.strokeRect(cx - 13, cy - 13, 26, 26); line(cx - 13, cy - 13, cx + 13, cy + 13, '#5a3a1a', 3); line(cx + 13, cy - 13, cx - 13, cy + 13, '#5a3a1a', 3); break; }
    case 'boss': { const en = ENEMIES[e.enemy]; ctx.save(); ctx.translate(x, y); ctx.scale(en.mini * 1.6, en.mini * 1.6); if (en.meridian) drawMeridian(0, -90, t, { eye: '#fff', cracks: 0 }); else ART[en.art](0, -80, t, { hurt: 0 }); ctx.restore(); break; }
    case 'crater': ell(x, y - 4, 26, 10, 'rgba(0,0,0,.35)'); ell(x, y - 5, 18, 6, 'rgba(255,160,60,.15)'); break;
    case 'thing': THING[e.look](x, y, t, e); break;
    case 'candles': for (let i = 0; i < 3; i++) { const cx = x - 14 + i * 14, h = 18 + i % 2 * 8; ctx.fillStyle = '#efe0bc'; ctx.fillRect(cx - 4, y - h, 8, h); if (hero.flags.killed_wicklow) { line(cx, y - h, cx + 1, y - h - 4, '#222', 1.5); continue; } ctx.save(); ctx.shadowColor = '#ffb347'; ctx.shadowBlur = 10; poly([cx - 3, y - h, cx + Math.sin(t * 8 + i) * 2, y - h - 10, cx + 3, y - h], '#ffb347'); ctx.restore(); } break;
    case 'bigbell': { const sw = Math.sin(t * 0.6) * 0.04; ctx.save(); ctx.translate(x, y - 40); ctx.rotate(sw); ctx.fillStyle = '#6a4a20'; ctx.fillRect(-90, -50, 180, 10); ctx.fillStyle = '#c8a050'; ctx.beginPath(); ctx.moveTo(-30, -40); ctx.quadraticCurveTo(-40, 20, -80, 60); ctx.lineTo(80, 60); ctx.quadraticCurveTo(40, 20, 30, -40); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#a07a30'; ctx.fillRect(-82, 54, 164, 10); ctx.fillStyle = '#3a2a10'; ctx.beginPath(); ctx.arc(8, 0, 6, 0, 6.283); ctx.fill(); ctx.restore(); break; }
  }
}
function drawWorld() {
  const pal = PAL[RM.def.theme]; ctx.fillStyle = pal.wall; ctx.fillRect(0, 0, W, H);
  ctx.drawImage(RM.cache, -Math.round(cam.x), -Math.round(cam.y));
  if (RM.def.drawFloor) RM.def.drawFloor(); // v1.4: per-room floor overlay (conveyor belts)
  // y-sorted sprites
  const list = [];
  for (const e of RM.ents) { if (!entShown(e) && e.t !== 'gate') continue; if (e.t === 'trigger') continue; if (e.t === 'gate') { if (!hero.flags[e.flag]) list.push({ y: e.y * TILE + TILE, f: () => drawGate(e) }); continue; } list.push({ y: e.t === 'crate' ? e.ry * TILE + 30 : e.t === 'crater' ? 0 : e.py, f: () => drawEnt(e) }); }
  list.push({ y: hero.y, f: () => { const s = heroScreen(); ctx.save(); ctx.translate(s.x, s.y); ctx.scale(1.25, 1.25); drawHero(0, 0, hero.dir, walkT, RM.t); ctx.restore(); } });
  list.sort((a, b) => a.y - b.y).forEach(o => o.f());
  // ambience
  const th = RM.def.theme;
  if (Math.random() < 0.08 && particles.length < 120) { if (th === 'forest') particles.push({ x: rand(0, W), y: rand(0, H), vx: rand(-10, 10), vy: rand(-10, 10), life: 3, max: 3, col: '#ffe8a0', size: 2, grav: 0 }); else if (th === 'cog') particles.push({ x: rand(0, W), y: -5, vx: 0, vy: 30, life: 6, max: 6, col: 'rgba(200,160,80,.6)', size: 2, grav: 0 }); else if (th === 'tide') particles.push({ x: rand(0, W), y: rand(0, H), vx: rand(-6, 6), vy: 6, life: 4, max: 4, col: 'rgba(154,216,255,.45)', size: 2, grav: 0 }); else if (th !== 'town') particles.push({ x: rand(0, W), y: H + 5, vx: rand(-5, 5), vy: -20, life: 6, max: 6, col: 'rgba(200,180,255,.5)', size: 2, grav: 0 }); }
  drawParticles();
  // vignette
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.95); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, th === 'belfry' ? 'rgba(0,0,0,.7)' : 'rgba(0,0,0,.45)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  if (encFX > 0) { const s = heroScreen(); ctx.font = `bold 34px ${FONT}`; ctx.fillStyle = '#ffd36e'; ctx.textAlign = 'center'; ctx.fillText('!', s.x, s.y - 58); ctx.fillStyle = `rgba(255,255,255,${(1 - encFX / 0.55) * 0.7})`; if (Math.floor(encFX * 20) % 2) ctx.fillRect(0, 0, W, H); }
  // room name
  if (RM.nameT > 0) { ctx.globalAlpha = clamp(RM.nameT, 0, 1); ctx.font = `bold 22px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#000'; ctx.fillText(RM.def.name, W / 2 + 2, 42); ctx.fillStyle = '#ffd36e'; ctx.fillText(RM.def.name, W / 2, 40); ctx.font = `13px ${FONT}`; ctx.fillStyle = '#ccc'; ctx.fillText(AREA_NAME[RM.def.area] || '', W / 2, 64); ctx.globalAlpha = 1; }
  // HUD chip
  if (!DLG) { ctx.font = `bold 13px ${FONT}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; drawPanel(10, 10, 210, 36); ctx.fillStyle = '#ff9a3c'; ctx.fillText(`GLOW ${hero.glow}/${maxGlow(hero)}`, 24, 28); ctx.fillStyle = '#ffd36e'; ctx.fillText(`${hero.cogs}c`, 140, 28); ctx.fillStyle = '#c8a050'; ctx.fillText(`C${hero.coil}`, 186, 28); }
  drawDialog();
  if (touch.seen && !DLG) { drawJoy();
    ctx.globalAlpha = 0.75; ctx.lineWidth = 3; ctx.strokeStyle = touch.aHeld ? '#ffd36e' : 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.arc(A_BTN.x, A_BTN.y, A_BTN.r, 0, 6.283); ctx.stroke(); ctx.font = `bold 22px ${FONT}`; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('A', A_BTN.x, A_BTN.y);
    ctx.beginPath(); ctx.arc(M_BTN.x, M_BTN.y, M_BTN.r, 0, 6.283); ctx.stroke(); ctx.font = `bold 12px ${FONT}`; ctx.fillText('MENU', M_BTN.x, M_BTN.y); ctx.globalAlpha = 1;
    if (!touch.joy) { ctx.font = `12px ${FONT}`; ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillText('drag left side to walk', 150, H - 24); } }
  if (RM.fade > 0) { if (RM.iris && RM.fade <= 1) hhIris(1 - RM.fade); else { ctx.fillStyle = `rgba(0,0,0,${clamp(RM.fade, 0, 1)})`; ctx.fillRect(0, 0, W, H); } } else RM.iris = false;
  if (roomFade > 0) hhIris(1 - roomFade);
}
/* v1.7-c30 door transitions: an iris that closes on the hero and opens again in the new room (same timing as the old fade). Calm FX keeps the plain fade. */
function hhIris(open) { open = clamp(open, 0, 1); if (settings.calmFx) { ctx.fillStyle = `rgba(0,0,0,${1 - open})`; ctx.fillRect(0, 0, W, H); return; }
  const hx = hero.x - cam.x, hy = hero.y - 16 - cam.y, R = Math.hypot(Math.max(hx, W - hx), Math.max(hy, H - hy)) + 8, r = R * open * open;
  ctx.save(); ctx.fillStyle = '#000'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(W, 0); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.moveTo(hx + r, hy); ctx.arc(hx, hy, Math.max(0, r), 0, Math.PI * 2, true); ctx.closePath(); ctx.fill();
  if (r > 1 && open < 0.98) { ctx.globalAlpha = 0.55 * (1 - open); ctx.strokeStyle = '#ffd36e'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(hx, hy, r, 0, 6.283); ctx.stroke(); }
  ctx.restore(); }
