/* ===== v1.7-c13 · M4-D3 options slice 1: battle speed 70-100%, reduced flashing, high-contrast bullets =====
   Settings persist with the others (localStorage LS_SET via saveSettings). Battle speed scales the whole dodge phase
   (attack clock, bullets AND the soul), so the game is slower, not easier to out-run. */
for (const k of ['gspd', 'calmFx', 'hiCon']) if (settings[k] == null) settings[k] = DEF_SET[k];
{ const _ub = updateBattle; updateBattle = function (dt) { const b = B; if (b && b.st === 'dodge' && settings.gspd < 1) dt *= Math.max(0.7, settings.gspd); return _ub.call(this, dt); }; }
{ const _db = drawBattle; drawBattle = function () { const b = B; if (b && settings.calmFx) { if (b.flash > 0.08) b.flash = 0.08; } return _db.apply(this, arguments); }; }
{ const _dl = drawBullet; drawBullet = function (b) { _dl.apply(this, arguments);
    if (!settings.hiCon || b.k !== 0 || b.age < b.warn || b.soft || b.harmless) return;
    ctx.save(); ctx.globalAlpha = 1; ctx.lineWidth = 3; ctx.strokeStyle = '#000'; ctx.beginPath(); ctx.arc(b.x, b.y, b.r + 2.5, 0, 6.283); ctx.stroke();
    ctx.lineWidth = 1.5; ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.arc(b.x, b.y, b.r + 1, 0, 6.283); ctx.stroke(); ctx.restore(); }; }
/* v1.7-c17 M4-D4: haptics. Short buzz when the soul is hit, a double buzz on a core break. Phones only (navigator.vibrate); toggle in Settings. */
if (settings.haptic == null) settings.haptic = true;
function hhBuzz(p) { try { if (settings.haptic && navigator.vibrate && touchUsed()) { navigator.vibrate(p); window.__hhBuzz = (window.__hhBuzz || 0) + 1; } } catch (e) {} }
function touchUsed() { return !!(window.__hhTouchSeen || ('ontouchstart' in window && navigator.maxTouchPoints > 0)); }
addEventListener('touchstart', () => { window.__hhTouchSeen = true; }, { passive: true, capture: true });
{ const _sh = soulHit; soulHit = function (bl) { const b = B, before = b && player.inv <= 0; const r = _sh.apply(this, arguments); if (before && b && !b.opts.practice) hhBuzz(hero.glow <= 0 ? [60, 60, 120] : 35); return r; }; }

/* v1.7-c19 polish: title hint counted endings out of a hardcoded 5 (there are 6, so LOW TIDE players saw 6/5). Count from the real list; touch players get a touch hint instead of key names. */
const HH_ENDS = ['true', 'twelve', 'quiet', 'cracked', 'still', 'lowtide', 'understudy'];
{ const _bt0 = buildTitle; buildTitle = function () { _bt0(); const n = HH_ENDS.filter(k => meta.endings[k]).length;
  $('title-hint').textContent = `endings found: ${n}/${HH_ENDS.length} · ` + (touchUsed() ? 'tap to choose · drag to move · \u23F8 pauses' : 'keys: arrows/WASD · Z/Enter confirm · X back · Esc menu'); }; }
/* v1.7-c23 M4-D3: colour-blind bullet palettes. 'rg' (protan/deutan): reds -> pink-magenta, greens -> sky blue, so red vs green
   hazards stay apart. 'by' (tritan): blues/cyans -> pink, yellows -> orange-red. Draw-time only (b.col restored after draw), so
   hitboxes, timing and gameplay are untouched. Warn rings, lasers and labels keep their shapes. */
if (settings.cvd == null) settings.cvd = 'off';
const HH_CVD_CACHE = { rg: {}, by: {} };
function hhCvdCol(c, m) { if (typeof c !== 'string' || c[0] !== '#' || (c.length !== 7 && c.length !== 4)) return c; const C = HH_CVD_CACHE[m]; if (C[c]) return C[c];
  const h6 = c.length === 4 ? c.replace(/#(.)(.)(.)/, '#$1$1$2$2$3$3') : c, r = parseInt(h6.slice(1, 3), 16) / 255, g = parseInt(h6.slice(3, 5), 16) / 255, b = parseInt(h6.slice(5, 7), 16) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; let h = 0; if (d > 0.08) { h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h = (h * 60 + 360) % 360; } else return (C[c] = c);
  let o = c; if (m === 'rg') { if (h < 18 || h >= 330) o = '#ff6ad5'; else if (h >= 75 && h < 165) o = '#56b4e9'; }
  else { if (h >= 165 && h < 260) o = '#ff7eb6'; else if (h >= 45 && h < 75) o = '#ff7a3c'; }
  return (C[c] = o); }
{ const _dl2 = drawBullet; drawBullet = function (b) { const m = settings.cvd; if (m !== 'rg' && m !== 'by' || !b) return _dl2.apply(this, arguments);
    const c0 = b.col; b.col = hhCvdCol(c0, m); try { return _dl2.apply(this, arguments); } finally { b.col = c0; } }; }
/* v1.7-c24 M4-D3: hold-to-confirm. Settings 'Hold to confirm (battle)': when ON, battle command buttons and list picks
   (FIGHT/ACT/ITEM/MERCY and the option lists) need Z/Enter or a finger held ~0.35 s, with a gold fill bar, so a stray tap
   can't commit a kill or waste an item. Text boxes, aiming and dodging are unchanged. Back still works instantly. */
if (settings.holdOk == null) settings.holdOk = false;
const HH_HOLD_T = 0.35; let hhHold = null; const hhUp = new Set();
addEventListener('pointerup', e => hhUp.add(e.pointerId), true); addEventListener('pointercancel', e => hhUp.add(e.pointerId), true);
function hhOkHeld() { for (const k in KEYMAP) if (KEYMAP[k] === 'ok' && keys[k]) return true; return false; }
{ const _ub = updateBattle; updateBattle = function (dt) { const b = B;
    if (!settings.holdOk || !b || (b.st !== 'menu' && !(b.st === 'list' && b.list))) { hhHold = null; return _ub.apply(this, arguments); }
    const isList = b.st === 'list', hadOk = actions.delete('ok');
    for (let i = taps.length - 1; i >= 0; i--) { const t = taps[i]; let hit = -1;
      if (isList) { hit = listHit(t); if (hit === -2) continue; } else for (let j = 0; j < 4; j++) { const r = btnRect(j); if (t.x >= r.x && t.x <= r.x + r.w && t.y >= r.y - 6 && t.y <= r.y + r.h + 6) hit = j; }
      if (hit >= 0) { taps.splice(i, 1); if (isList) b.list.sel = hit; else b.sel = hit; hhUp.delete(t.id); hhHold = { src: 'touch', id: t.id, st: b.st, t: 0 }; sfx('move'); } }
    if (!hhHold && hadOk && hhOkHeld()) hhHold = { src: 'key', st: b.st, t: 0 };
    if (hhHold) { const still = hhHold.st === b.st && (hhHold.src === 'key' ? hhOkHeld() : !hhUp.has(hhHold.id));
      if (!still) hhHold = null; else { hhHold.t += dt; if (hhHold.t >= HH_HOLD_T) { hhHold = null; actions.add('ok'); window.__hhHoldFired = (window.__hhHoldFired || 0) + 1; } } }
    return _ub.apply(this, arguments); }; }
{ const _db3 = drawBattle; drawBattle = function () { const r0 = _db3.apply(this, arguments); const b = B;
    if (settings.holdOk && b && hhHold && hhHold.st === b.st) { const p = Math.min(1, hhHold.t / HH_HOLD_T); let x, y, w;
      if (b.st === 'list' && b.list) { const { x0, y0, cw, ch } = listLayout(), i = b.list.sel; x = x0 + 40 + (i % 2) * cw; y = y0 + 22 + Math.floor(i / 2) * ch + ch - 8; w = cw - 60; }
      else { const r = btnRect(b.sel); x = r.x + 6; y = r.y + r.h - 5; w = r.w - 12; }
      ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(x, y, w, 4); ctx.fillStyle = '#ffd36e'; ctx.fillRect(x, y, w * p, 4); ctx.restore(); }
    return r0; }; }
/* v1.7-c25 menu feel: menus open with a short 160 ms rise-and-fade, and buttons dip slightly when pressed (CSS in head.html).
   Reduced flashing or the OS reduced-motion setting turns both off. */
function hhCalmClass() { document.documentElement.classList.toggle('hh-calm', !!settings.calmFx); }
{ const _ss = showScreen; showScreen = function () { hhCalmClass(); return _ss.apply(this, arguments); }; }
document.addEventListener('click', () => setTimeout(hhCalmClass, 0)); hhCalmClass();

/* v1.7-c28 save-point feedback: when you choose KEEP IT, the bell gives off two soft gold rings and a small "kept" tag rises
   over it for 1.6 s (wall-clock, so it plays while the confirmation text is open). Reduced flashing gives one dim ring and no sparkle. */
function hhKept(e) { e.keptAt = performance.now(); sfx('heal'); if (!settings.calmFx) burst(e.px - cam.x, e.py - 30 - cam.y, 24, '#fff4c8', 90, 0.9, 2); }
{ const _de = drawEnt; drawEnt = function (e) { const r = _de.apply(this, arguments);
  if (e && e.t === 'save' && e.keptAt) { const k = (performance.now() - e.keptAt) / 1600; if (k >= 1) { e.keptAt = 0; return r; }
    const x = e.px - cam.x, y = e.py - 30 - cam.y; ctx.save(); ctx.lineWidth = 2;
    for (const [d, a] of settings.calmFx ? [[0, 0.35]] : [[0, 0.8], [0.22, 0.55]]) { const q = k - d; if (q <= 0 || q >= 0.8) continue; const t = q / 0.8; ctx.globalAlpha = a * (1 - t); ctx.strokeStyle = '#ffd36e'; ctx.beginPath(); ctx.arc(x, y, 10 + t * 46, 0, 6.283); ctx.stroke(); }
    ctx.globalAlpha = Math.min(1, (1 - k) * 3); ctx.font = `bold 14px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; const ty = y - 34 - k * 14;
    ctx.fillStyle = '#000'; ctx.fillText('kept', x + 1, ty + 1); ctx.fillStyle = '#ffe8a0'; ctx.fillText('kept', x, ty); ctx.restore(); }
  return r; }; }
/* v1.7-c31 talk prompt: a small bobbing gold bubble over whatever Z / tap would talk to or use (same pick as interact()). Hidden in dialog, fades, battles, and for roaming monsters. */
function hhNearEnt() { if (!RM || !hero) return null; const fx = [0, 1, 0, -1][hero.dir], fy = [-1, 0, 1, 0][hero.dir], px = hero.x + fx * 24, py = hero.y - 6 + fy * 24; let best = null, bd = 1e9;
  for (const e of RM.ents) { if (!entShown(e) || e.t === 'trigger' || e.t === 'crate' || e.t === 'roam' || (e.t === 'crater' && !e.run) || e.t === 'candles') continue; let d;
    if (e.t === 'gate') { const inside = px >= e.x * TILE - 8 && px <= (e.x + e.w) * TILE + 8 && py >= e.y * TILE - 8 && py <= (e.y + e.h) * TILE + 16; d = inside ? 0 : 1e9; } else d = Math.hypot(e.px - px, e.py - 8 - py);
    const lim = e.t === 'boss' ? 60 : 30; if (d < lim && d < bd) { bd = d; best = e; } } return best; }
{ const _dw = drawWorld; drawWorld = function () { const r = _dw.apply(this, arguments);
  try { if (state === 'world' && !DLG && !busy && !pendingExit && !(roomFade > 0) && !(RM.fade > 0) && !(encFX > 0)) { const e = hhNearEnt(); if (e) {
    const t = performance.now() / 1000, ex = (e.t === 'gate' ? (e.x + e.w / 2) * TILE : e.px) - cam.x, ey = (e.t === 'gate' ? e.y * TILE : e.py - 56) - cam.y - (settings.calmFx ? 0 : Math.abs(Math.sin(t * 3)) * 4);
    ctx.save(); ctx.globalAlpha = 0.92; ctx.fillStyle = '#140c08'; ctx.strokeStyle = '#ffd36e'; ctx.lineWidth = 2; rrect(ex - 13, ey - 10, 26, 18, 7); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ex - 4, ey + 8); ctx.lineTo(ex + 4, ey + 8); ctx.lineTo(ex, ey + 13); ctx.closePath(); ctx.fillStyle = '#ffd36e'; ctx.fill();
    ctx.fillStyle = '#ffd36e'; for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.arc(ex + i * 6, ey - 1, 1.8, 0, Math.PI * 2); ctx.fill(); } ctx.restore(); window.__hhPrompt = e; } else window.__hhPrompt = null; } else window.__hhPrompt = null; } catch (err) {}
  return r; }; }
