/* ===================== CHAPTER 2 · BELT HALL conveyor puzzle (v1.4) ===================== */
// Three conveyor lanes (A, B, C) run rows 3-9. A lane runs DOWN (0) or UP (1); belts beat walking speed.
// The exit north to Sprocket's Nook is only above lane B. Valves: bottom flips A+C · A-pocket flips A+B · C-pocket flips C · B-top flips B.
// Every pocket has a valve that flips its own lane, so the player can always ride back down (no softlock).
// Solution: bottom valve (A,C up) → ride A → A-pocket valve (A down, B up) → ride A down → ride B up.
const BELT_LANES = [[1, 5], [8, 11], [14, 18]], BELT_ROWS = [3, 9], BELT_SPEED = 260;
const beltState = () => { const s = hero.flags.belts || '000'; return [0, 1, 2].map(i => s[i] === '1'); };
function flipBelts(...ix) { const b = beltState(); for (const i of ix) b[i] = !b[i]; hero.flags.belts = b.map(v => v ? '1' : '0').join(''); sfx('push'); shake(3, 0.25);
  if (b[1] && !hero.flags.belt_solved) { hero.flags.belt_solved = true; setTimeout(() => sfx('puzzle'), 250); } }
function beltLaneAt(tx, ty) { if (ty < BELT_ROWS[0] || ty > BELT_ROWS[1]) return -1; return BELT_LANES.findIndex(([a, b]) => tx >= a && tx <= b); }
const valve = (x, y, lanes, label) => ({ t: 'thing', look: 'valve', x, y, label, run: async () => { flipBelts(...lanes); const b = beltState();
  return say('', 'You spin the ' + label + ' valve. KA-CHUNK.', 'Belts now: ' + ['A', 'B', 'C'].map((n, i) => n + (b[i] ? '↑' : '↓')).join('  ')); } });
ROOMS.belthall = { name: 'Belt Hall', area: 'cogworks', theme: 'cog', track: 'cog', map: [
    '########....########',
    '#.....##....##.....#',
    '#.....##....##.....#',
    '#.....##....##.....#',
    '#.....##....##.....#',
    '#.....##....##.....#',
    '#.....##....##.....#',
    '#.....##....##.....#',
    '#.....##....##.....#',
    '#.....##....##.....#',
    '#..................#',
    '#..................#',
    '#..................#',
    '########....########'],
  exits: [{ x: 8, y: 0, w: 4, h: 1, to: 'nook', tx: 8, ty: 7 }, { x: 8, y: 13, w: 4, h: 1, to: 'boilergal', tx: 10, ty: 1 }],
  ents: [
    valve(3, 11, [0, 2], 'A·C'), valve(2, 1, [0, 1], 'A·B'), valve(18, 1, [2], 'C'), valve(11, 1, [1], 'B'),
    { t: 'sign', x: 16, y: 11, text: ['BELT HALL. All belts run DOWN unless told otherwise.', 'Under that, scratched in: "go up the side, come down the side, go up the middle." —S.'] },
    { t: 'chest', x: 15, y: 1, item: 'gearcake', flag: 'c_belt1' },
  ],
  tick(dt) { const tx = Math.floor(hero.x / TILE), ty = Math.floor((hero.y - 4) / TILE), lane = beltLaneAt(tx, ty); if (lane < 0) return;
    const up = beltState()[lane], ny = hero.y + (up ? -1 : 1) * BELT_SPEED * dt; if (!blocked(hero.x, ny)) hero.y = ny; },
  drawFloor() { const b = beltState(), t = RM.t;
    BELT_LANES.forEach(([a, z], i) => { const x0 = a * TILE - cam.x, y0 = BELT_ROWS[0] * TILE - cam.y, w = (z - a + 1) * TILE, h = (BELT_ROWS[1] - BELT_ROWS[0] + 1) * TILE;
      ctx.fillStyle = '#2a2622'; ctx.fillRect(x0, y0, w, h); ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, w, h); ctx.clip();
      const off = ((b[i] ? -1 : 1) * t * 60) % 32;
      for (let y = y0 - 32 + off; y < y0 + h + 32; y += 32) { ctx.fillStyle = '#3a342c'; ctx.fillRect(x0, y, w, 4);
        const cx = x0 + w / 2, dy = b[i] ? -1 : 1; poly([cx - 10, y + 16 - dy * 6, cx + 10, y + 16 - dy * 6, cx, y + 16 + dy * 8], b[i] ? '#7fe08a' : '#e8a050'); }
      ctx.restore(); ctx.fillStyle = '#e8dcc0'; ctx.font = `bold 12px ${FONT}`; ctx.textAlign = 'center'; ctx.fillText('ABC'[i], x0 + w / 2, y0 + h + 14); }); },
};
THING.valve = (x, y, t, e) => { ctx.fillStyle = '#4a4a5a'; ctx.fillRect(x - 3, y - 26, 6, 24); ctx.save(); ctx.translate(x, y - 30); ctx.rotate(t * 0.3); ctx.strokeStyle = '#c84a3a'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(0, 0, 10, 0, 6.283); ctx.stroke(); line(-10, 0, 10, 0, '#c84a3a', 3); line(0, -10, 0, 10, '#c84a3a', 3); ctx.restore();
  ctx.fillStyle = '#e8dcc0'; ctx.font = `9px ${FONT}`; ctx.textAlign = 'center'; ctx.fillText(e.label, x, y + 10); };
