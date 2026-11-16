/* ===================== CHAPTER 3 · TIDELOCK chunk D (v1.6-c5): THE TURNING BASIN + TIDE LEVERS =====================
   Lantern Canal east edge (rows 6-7, x=31) -> The Turning Basin. Global tide state: hero.flags.tide_low (saved with the hero).
   LOW tide: stepping-stone causeway (x9-14, rows 5-8) surfaces; the pontoon (x20-23) lies on the bottom.
   HIGH tide: causeway drowned; pontoon floats level with the quays (rows 5-8).
   Every dry region (west quay, middle island, east quay) has its own tide lever on always-dry ground -> no softlock
   from any reachable tile, in either tide state. If a toggle floods the tile under the hero/roamer, they are lifted to
   the nearest dry tile. Room maps swap in enterRoom so reloads restore the right water. */
const TIDE_ROWS = (() => { const W = 32, H = 13, hi = [], lo = [];
  for (let y = 0; y < H; y++) { let a = '', b = '';
    for (let x = 0; x < W; x++) { let c;
      if (y === 0 || y === H - 1) c = '#';
      else if (x === 0) c = (y === 6 || y === 7) ? '.' : '#';
      else if (x === W - 1) c = '#';
      else if (y === 1 || y === H - 2) c = (x >= 9 && x <= 14) || (x >= 20 && x <= 23) ? '~' : 'T';
      else if (x >= 9 && x <= 14) c = 'CH';
      else if (x >= 20 && x <= 23) c = 'PO';
      else c = ((x >= 2 && x <= 6 && y >= 8 && y <= 10) || (x >= 16 && x <= 18 && y >= 8 && y <= 10) || (x >= 25 && x <= 29 && y >= 8 && y <= 10)) ? ',' : '.';
      a += c === 'CH' ? '~' : c === 'PO' ? ((y >= 5 && y <= 8) ? '=' : '~') : c;
      b += c === 'CH' ? ((y >= 5 && y <= 8) ? (x % 2 ? '=' : '.') : '~') : c === 'PO' ? '~' : c; }
    hi.push(a); lo.push(b); }
  return [hi, lo]; })();
function tideApply(silent) { const low = !!hero.flags.tide_low, R = ROOMS.basin; R.map = TIDE_ROWS[low ? 1 : 0];
  if (!RM || RM.id !== 'basin') return; RM.def = R; RM.cache = renderRoomCache(R);
  const dry = (tx, ty) => !SOLID.has(tileAt(tx, ty)), lift = (px, py) => { const tx0 = Math.floor(px / TILE), ty0 = Math.floor((py - 4) / TILE); if (dry(tx0, ty0)) return null; let best = null, bd = 1e9;
    for (let ty = 1; ty < 12; ty++) for (let tx = 1; tx < 31; tx++) if (dry(tx, ty)) { const d = Math.hypot(tx - tx0, ty - ty0); if (d < bd) { bd = d; best = [tx * TILE + 16, ty * TILE + 24]; } } return best; };
  const h = blocked(hero.x, hero.y) ? lift(hero.x, hero.y) || null : null; if (h) { hero.x = h[0]; hero.y = h[1]; }
  for (const e of RM.ents) if (e.t === 'roam' && !e.gone) { const p = lift(e.px, e.py); if (p) { e.px = e.hx = p[0]; e.py = e.hy = p[1]; e.mode = 'idle'; e.vx = e.vy = 0; } }
  if (!silent) { sfx('puzzle'); shake(5, 0.6); for (let i = 0; i < 4; i++) burst(rand(9, 24) * TILE, rand(3, 10) * TILE, 6, 'rgba(154,216,255,.7)', 60, 0.8, 3); } }
async function tideLever(which) { const low = !!hero.flags.tide_low, n = hero.flags.tide_pulls = (hero.flags.tide_pulls || 0) + 1;
  hero.flags.tide_low = !low; tideApply(); hero.flags.tide_seen_low = hero.flags.tide_seen_low || !low;
  if (n === 1) return say('', 'You haul the lever. Far under the basin, something enormous sighs.', 'The water goes OUT. Stepping stones surface, wet and blinking.', 'For the first time in forty years, it is LOW TIDE.');
  if (!low) return say('', pick(['KA-CHUNK. The basin drains. The stones come up for air.', 'The water slinks out, embarrassed, like it overstayed.']), 'LOW TIDE.');
  return say('', pick(['KA-CHUNK. The water rushes back in, as if it never left.', 'The basin fills. The pontoon bobs up, delighted to be useful.']), 'HIGH TIDE.'); }
ROOMS.canal1.exits.push({ x: 31, y: 6, w: 1, h: 2, to: 'basin', tx: 1, ty: 6 });
{ const s = ROOMS.canal1.ents.find(e => e.t === 'sign'); if (s) s.text = ['LANTERN CANAL. Turning Basin ahead, east.', 'Lockkeeper\'s orders: the tide does not turn without permission.', 'Someone has scratched underneath: "permission granted. pull it."']; }
ROOMS.basin = { name: 'The Turning Basin', area: 'tide', theme: 'tide', track: 'tide', enc: 'tide', map: TIDE_ROWS[0],
  tideMaps: TIDE_ROWS,   exits: [{ x: 0, y: 6, w: 1, h: 2, to: 'canal1', tx: 30, ty: 6 }],
  ents: [
    { t: 'thing', look: 'tidelever', x: 4, y: 3, run: async () => tideLever('w') },
    { t: 'thing', look: 'tidelever', x: 17, y: 3, run: async () => tideLever('m') },
    { t: 'thing', look: 'tidelever', x: 27, y: 3, run: async () => tideLever('e') },
    { t: 'sign', x: 7, y: 2, text: ['THE TURNING BASIN · TIDE LEVERS: ONE PULL, ONE TIDE.', 'Low tide shows the stones. High tide lifts the pontoon.', '"Pull as often as you like. The water never minds. It just waits."'] },
    { t: 'sign', x: 29, y: 5, text: ['LOCK No. 2 · SEALED.', 'By order of the LOCKKEEPER: no one goes further until the tide turns properly.', '(The gate is cold. Something on the other side is humming a very slow song.)'] },
    { t: 'chest', x: 17, y: 9, item: 'tea', flag: 'c_basin1' },
    { t: 'thing', look: 'mooring', x: 25, y: 9, walk: true, run: async () => { const f = hero.flags; if (f.mooring1) return say('', 'The mooring post. The rope still goes down into the water. Nobody pulls it up.');
      f.mooring1 = true; return say('', 'A mooring post with a rope tied in a very careful knot.', 'The rope goes down into the basin and doesn\'t come back up.', 'Someone tied it to wait for a boat. The knot is still waiting.'); } },
  ] };
{ const _er = enterRoom; enterRoom = function (id) { if (id === 'basin') ROOMS.basin.map = TIDE_ROWS[hero.flags.tide_low ? 1 : 0]; return _er.apply(this, arguments); }; }
Object.assign(THING, {
  tidelever: (x, y, t) => { const low = !!hero.flags.tide_low; ctx.fillStyle = '#2a3a44'; ctx.fillRect(x - 12, y - 10, 24, 10); ctx.fillStyle = '#5a4a38'; ctx.fillRect(x - 14, y - 2, 28, 4);
    const tx = x + (low ? 12 : -12), ty = y - 26; line(x, y - 6, tx, ty, '#b8c0c8', 4); circ(tx, ty, 6, low ? '#e8dcc0' : '#4a9ad0');
    ctx.font = `10px ${FONT}`; ctx.textAlign = 'center'; ctx.fillStyle = low ? '#e8dcc0' : '#9ad8ff'; ctx.fillText(low ? 'LOW' : 'HIGH', x, y - 38); },
  mooring: (x, y, t) => { ctx.fillStyle = '#4a3a2a'; ctx.fillRect(x - 5, y - 26, 10, 26); ctx.fillStyle = '#6a5a3a'; ctx.fillRect(x - 7, y - 28, 14, 4); line(x + 4, y - 14, x + 18, y + 4 + Math.sin(t) * 2, '#c8b890', 2); },
});
