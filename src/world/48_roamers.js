/* ===== M1-V1 · VISIBLE OVERWORLD ENEMIES (director request 2026-10-19) =====
   Replaces step-counter random encounters. Kill switch: localStorage hh_roam = '0' restores the old step encounters.
   - Each monster room (def.enc) spawns up to 2-3 wandering monsters from ENC_TABLE[area], capped by the area's remaining
     population (AREA_POP - areaKills), so "nobody left" and the violent route still work.
   - Aggro inside 4.5 tiles: "!" pop (0.45 s freeze), then chase at 120 px/s (hero walks 150). Leash: give up past 8 tiles
     from the hero or 10 tiles from home, and walk back home.
   - Touch = battle with THAT monster. After the battle it is removed. Fleeing gives 2.5 s of no-aggro/no-contact.
   - Monsters are never solid (they can't block a path), never enter exit tiles, and don't spawn near the hero/exits/NPCs.
   - The 3 scripted ambushes (Burrlock, Spannerkin, Metronoma) now stand visibly on the path and charge when you get close. */
const ROAM = { on: true };
try { if (localStorage.getItem('hh_roam') === '0') ROAM.on = false; } catch (e) {}
const ROAM_AGGRO = 4.5 * TILE, ROAM_LEASH = 8 * TILE, ROAM_HOME = 10 * TILE, ROAM_CHASE = 120, ROAM_WANDER = 34, ROAM_TOUCH = 22;
const AMBUSHES = {};
for (const R of Object.values(ROOMS)) { const keep = [];
  for (const e of R.ents) { if (e.t === 'trigger' && /^ambush_/.test(e.flag || '')) { continue; } keep.push(e); }
  if (keep.length !== R.ents.length && ROAM.on) R.ents = keep; }
for (const [room, foe, line] of [['rustwood', 'burrlock', 'Something spiky is rolling down the path toward you!'], ['cogworks1', 'spannerkin', 'A little wrench-creature hops off a conveyor and blocks the way!'], ['spire1', 'metronoma', 'Tick. Tock. Something on the stair is keeping time... at you.']]) AMBUSHES[room] = { foe, line, flag: 'ambush_' + room };
const roamTileOK = (tx, ty) => { const c = tileAt(tx, ty); if (SOLID.has(c)) return false; for (const ex of RM.def.exits) if (tx >= ex.x - 1 && tx < ex.x + ex.w + 1 && ty >= ex.y - 1 && ty < ex.y + ex.h + 1) return false; return true; };
function roamFree(x, y) { for (const [dx, dy] of [[-8, -8], [8, -8], [-8, 0], [8, 0]]) { const px = x + dx, py = y + dy; if (px < 0 || py < 0 || px >= RM.w || py >= RM.h) return false; if (!roamTileOK(Math.floor(px / TILE), Math.floor(py / TILE))) return false; } return true; }
function roamSpawnAt(tx, ty, id, o) { const e = Object.assign({ t: 'roam', walk: true, id, look: id, x: tx, y: ty, px: tx * TILE + 16, py: ty * TILE + 24, hx: tx * TILE + 16, hy: ty * TILE + 24, mode: 'idle', wt: rand(0.5, 2), vx: 0, vy: 0, bang: 0, run: async () => {} }, o || {}); e.def = e; RM.ents.push(e); return e; }
function roamPopulate() {
  RM.roamInv = 1.0; // a beat of grace on entry
  const amb = AMBUSHES[RM.id];
  if (amb && !hero.flags[amb.flag]) { const m = RM.def.map, cx = Math.floor(m[0].length / 2), cy = Math.floor(m.length / 2); let best = null, bd = 1e9;
    for (let ty = 1; ty < m.length - 1; ty++) for (let tx = 1; tx < m[0].length - 1; tx++) { if (!roamTileOK(tx, ty) || (tx !== cx && ty !== cy)) continue; const d = Math.hypot(tx - cx, ty - cy), dh = Math.hypot(tx * TILE + 16 - hero.x, ty * TILE + 24 - hero.y);
      if (dh < 6 * TILE) continue; if (d < bd) { bd = d; best = [tx, ty]; } }
    if (best) roamSpawnAt(best[0], best[1], amb.foe, { ambush: amb, still: true }); }
  const area = RM.def.enc; if (!area || !ENC_TABLE[area]) return;
  const left = (AREA_POP[area] || 0) - (hero.areaKills[area] || 0);
  if (left <= 0) { if (!hero.flags['empty_' + area]) { hero.flags['empty_' + area] = true; runScript(() => say('', 'The grass rustles... but nothing comes out.', 'It\'s very quiet here now.')); } return; }
  roamSpawnWild(Math.min(left, 3), true); RM.roamRe = 18;
}
// spawn up to n wanderers far from the hero (also used to trickle respawns while you stay in a room)
function roamSpawnWild(n, initial) { const area = RM.def.enc; if (!area) return 0;
  const m = RM.def.map, cands = [], grass = [];
  for (let ty = 1; ty < m.length - 1; ty++) for (let tx = 1; tx < m[0].length - 1; tx++) {
    if (!roamTileOK(tx, ty)) continue; const px = tx * TILE + 16, py = ty * TILE + 24; if (Math.hypot(px - hero.x, py - hero.y) < 6 * TILE) continue;
    if (RM.ents.some(e => e.t !== 'trigger' && e.px != null && Math.hypot(e.px - px, e.py - py) < 2.5 * TILE)) continue;
    (m[ty][tx] === ',' ? grass : cands).push([tx, ty]); }
  const pool = grass.length >= 3 ? grass : grass.concat(cands); n = Math.min(n, grass.length > 40 ? 3 : 2, pool.length); let made = 0;
  for (let i = 0; i < n; i++) { made++; const k = irand(0, pool.length - 1), [tx, ty] = pool.splice(k, 1)[0]; roamSpawnAt(tx, ty, pick(ENC_TABLE[area]));
    for (let j = pool.length - 1; j >= 0; j--) if (Math.hypot(pool[j][0] - tx, pool[j][1] - ty) < 4) pool.splice(j, 1); if (!pool.length) break; }
  return made;
}
function roamRespawn(dt) { const area = RM.def.enc; if (!area || !ENC_TABLE[area]) return; RM.roamRe = (RM.roamRe == null ? 18 : RM.roamRe) - dt; if (RM.roamRe > 0) return; RM.roamRe = 12;
  const left = (AREA_POP[area] || 0) - (hero.areaKills[area] || 0), live = RM.ents.filter(e => e.t === 'roam' && !e.gone && !e.ambush).length;
  if (left > live && live < 2) roamSpawnWild(1); }
function roamMove(e, vx, vy, dt) { const nx = e.px + vx * dt; if (roamFree(nx, e.py)) e.px = nx; else e.vx = -e.vx; const ny = e.py + vy * dt; if (roamFree(e.px, ny)) e.py = ny; else e.vy = -e.vy; }
function roamTick(dt) {
  if (RM.roamInv > 0) RM.roamInv -= dt; roamRespawn(dt);
  for (const e of RM.ents) { if (e.t !== 'roam' || e.gone) continue; e.anim = (e.anim || 0) + dt; if (e.lost > 0) e.lost -= dt;
    const dh = Math.hypot(hero.x - e.px, hero.y - e.py), dHome = Math.hypot(e.px - e.hx, e.py - e.hy);
    if (e.mode === 'bang') { e.bang -= dt; if (e.bang <= 0) e.mode = 'chase'; continue; }
    if (e.mode === 'chase') { if (dh > ROAM_LEASH || dHome > ROAM_HOME || RM.roamInv > 0) { e.mode = 'home'; if (RM.roamInv <= 0) e.lost = 0.9; continue; } /* c27: '?' when you shake it off */
      const sp = e.ambush ? 125 : ROAM_CHASE; roamMove(e, (hero.x - e.px) / dh * sp, (hero.y - e.py) / dh * sp, dt); }
    else if (e.mode === 'home') { if (dHome < 6) { e.mode = 'idle'; e.wt = 1; } else roamMove(e, (e.hx - e.px) / dHome * 70, (e.hy - e.py) / dHome * 70, dt); }
    else { if (!e.still) { e.wt -= dt; if (e.wt <= 0) { e.wt = rand(1, 2.6); const a = rand(0, 6.283), go = Math.random() < 0.65 && dHome < 2.5 * TILE; e.vx = go ? Math.cos(a) * ROAM_WANDER : (e.hx - e.px) * 0.5; e.vy = go ? Math.sin(a) * ROAM_WANDER : (e.hy - e.py) * 0.5; } roamMove(e, e.vx, e.vy, dt); }
      if (dh < ROAM_AGGRO && RM.roamInv <= 0) { e.mode = 'bang'; e.bang = 0.45; sfx('warn'); } }
    if (dh < ROAM_TOUCH && RM.roamInv <= 0 && e.mode !== 'home') { roamFight(e); return; } }
}
function roamFight(e) { RM.roamFight = e; e.gone = true;
  if (e.ambush) { hero.flags[e.ambush.flag] = true; runScript(async () => { await say('', e.ambush.line); RM.encEnemy = e.id; encFX = 0.55; sfx('encounter'); resetTouch(); }); return; }
  RM.encEnemy = e.id; encFX = 0.55; sfx('encounter'); resetTouch(); }
if (ROAM.on) {
  tryEncounter = function () {}; // step-counter encounters off (code path kept for hh_roam = '0')
  const _enterRoomV0 = enterRoom; enterRoom = function (...a) { const r = _enterRoomV0(...a); try { roamPopulate(); } catch (err) { console.error(err); } return r; };
  const _updWorldV0 = updateWorld; updateWorld = function (dt) { _updWorldV0(dt); if (state === 'world' && RM && !busy && !DLG && !pendingExit && !(encFX > 0)) roamTick(dt); };
  const _btwV0 = backToWorld; backToWorld = function (result, b) { _btwV0(result, b); const e = RM && RM.roamFight; if (e) { RM.ents = RM.ents.filter(x => x !== e); RM.roamFight = null; if (result === 'flee') RM.roamInv = 2.5; }
    const area = RM && RM.def.enc; if (area && result === 'kill' && (hero.areaKills[area] || 0) >= (AREA_POP[area] || 0) && !hero.flags['empty_' + area]) { hero.flags['empty_' + area] = true; runScript(() => say('', 'The grass rustles... but nothing comes out.', 'It\'s very quiet here now.')); } };
  const _drawEntV0 = drawEnt; drawEnt = function (e) { if (e.t !== 'roam') return _drawEntV0(e); if (e.gone) return;
    const x = e.px - cam.x, y = e.py - cam.y, en = ENEMIES[e.id], s = Math.min(0.32, en.mini || 0.3) * 0.9, hop = e.mode === 'chase' ? Math.abs(Math.sin(e.anim * 12)) * 4 : Math.abs(Math.sin(e.anim * 4)) * 1.5;
    ell(x, y + 1, 14, 5, 'rgba(0,0,0,.35)'); ctx.save(); ctx.translate(x, y - hop); ctx.scale(s, s); ART[en.art](0, -60, RM.t, { hurt: 0, eye: '#fff' }); ctx.restore();
    if (e.mode === 'bang' || e.mode === 'chase') { const a = e.mode === 'bang' ? 1 : 0.85, yy = y - 62 - (e.mode === 'bang' ? (0.45 - e.bang) * 20 : 9); ctx.font = `bold 26px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#000'; ctx.globalAlpha = a; ctx.fillText('!', x + 2, yy + 2); ctx.fillStyle = '#ffd36e'; ctx.fillText('!', x, yy); ctx.globalAlpha = 1; }
    if (e.lost > 0) { const a = Math.min(1, e.lost / 0.3), yy = y - 66 - (0.9 - e.lost) * 10; ctx.font = `bold 24px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha = a; ctx.fillStyle = '#000'; ctx.fillText('?', x + 2, yy + 2); ctx.fillStyle = '#b8c4e0'; ctx.fillText('?', x, yy); ctx.globalAlpha = 1; } };
  const _interactV0 = interact; interact = function () { // talking to a monster just starts the fight
    const fx = [0, 1, 0, -1][hero.dir], fy = [-1, 0, 1, 0][hero.dir], px = hero.x + fx * 24, py = hero.y - 6 + fy * 24;
    const e = RM.ents.find(e => e.t === 'roam' && !e.gone && Math.hypot(e.px - px, e.py - py) < 26); if (e && RM.roamInv <= 0) return roamFight(e); return _interactV0(); };
}
