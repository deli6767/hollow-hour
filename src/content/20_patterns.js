/* ===================== PATTERNS ===================== */
// Each attack: { name, dur, size:[w,h], desc, blue?, run(S) } — S = Runner (S.at, S.every, S.d difficulty)
const hw = () => arena.w / 2, hh = () => arena.h / 2;
const P = player;
function wallPair(x, vx, gy, gap, col = '#fff') { const top = gy - gap, bot = gy + gap; bar(x, (-hh() + top) / 2, 14, top + hh(), vx, 0, col); bar(x, (bot + hh()) / 2, 14, hh() - bot, vx, 0, col); }
const tele = (x, y, ang, w, warn, o) => laser(x, y, ang, w, warn, 0.02, Object.assign({ harmless: true }, o));

/* ---------- fair rings ----------
   A ring centred on the box that closes in (or spreads out) with ONE gap.
   - the gap is aimed at the side of the box the player is already on (±0.35 rad), so it is never across the box;
   - consecutive gaps on one runner turn at most maxShift rad from the previous one;
   - the gap is telegraphed (a dashed line of markers from the centre) for `warn` s before the ring spawns;
   - inward bullets die at the centre (they used to fly through and re-expand with the gap on the OPPOSITE side). */
function ringGap(S, o) {
  const n = o.n || 30, sp = o.sp, R = o.R || 260, gh = o.gapHalf || 0.6, warn = o.noMark ? 0 : (o.warn ?? 0.7), maxShift = o.maxShift ?? 1.0;
  let g; const pr = Math.hypot(P.x, P.y), pa = Math.atan2(P.y, P.x);
  g = pr > 18 ? pa + rand(-0.35, 0.35) : (S._gap ?? rand(0, 6.283));
  if (S._gap != null) { let d = Math.atan2(Math.sin(g - S._gap), Math.cos(g - S._gap)); d = clamp(d, -maxShift, maxShift); g = S._gap + d; }
  S._gap = g;
  const lim = Math.min(hw(), hh()) - 6;
  if (o.noMark) { S._gapT = S.t; } else { for (let r = 22; r <= lim; r += 26) shot(Math.cos(g) * r, Math.sin(g) * r, 0, 0, 6, '#ffe7a8', { warn, life: warn, harmless: true }); sfx('warn'); }
  S.at(S.t + warn, () => {
    for (let i = 0; i < n; i++) { const a = g + (i + 0.5) * 6.283 / n; const d = Math.abs(Math.atan2(Math.sin(a - g), Math.cos(a - g))); if (d < gh) continue;
      if (o.inward !== false) shot(Math.cos(a) * R, Math.sin(a) * R, -Math.cos(a) * sp, -Math.sin(a) * sp, o.r || 5, typeof o.col === 'function' ? o.col(i) : o.col, { life: (R - 4) / sp });
      else shot(Math.cos(a) * 8, Math.sin(a) * 8, Math.cos(a) * sp, Math.sin(a) * sp, o.r || 4.5, o.col); }
    if (o.onSpawn) o.onSpawn();
  });
  return g;
}

/* ---------- TIME CONTROL (MERIDIAN's signature): freeze · rewind · skip ahead · resume ---------- */
// tfx(S, t, mode, dur, opts): telegraphs 0.75 s early on the alert line + the battle timer, then hands control to the battle loop.
const TFX_ALERT = { freeze: 'TIME STOP', rewind: 'REWIND', ff: 'SKIP AHEAD' };
function tfx(S, t, mode, dur, opts = {}) {
  S.at(Math.max(0, t - 0.75), () => { S.alert = TFX_ALERT[mode]; S.alertT = 0.75; S.tfxWarn = { mode, t: 0.75 }; sfx('warn'); });
  S.at(t, () => { if (typeof startTfx === 'function') startTfx(mode, dur, opts); });
}
// tfxJump: every live bullet shows a ghost where it will be `ahead` seconds from now, then teleports there.
let _jt = 0;
function tfxJump(S, t, ahead = 0.55) {
  S.at(Math.max(0, t - 0.8), () => { S.alert = 'SKIP AHEAD'; S.alertT = 0.8; S.tfxWarn = { mode: 'ff', t: 0.8 }; sfx('warn'); const tok = ++_jt;
    for (const b of bullets.slice()) { if (b.k !== 0 || b.age < b.warn || b.harmless || b.soft || b.home || b.wall) continue; b.jtok = tok;
      shot(b.x + b.vx * (ahead + 0.8), b.y + b.vy * (ahead + 0.8), 0, 0, b.r + 1, '#ff9a3c', { warn: 0.8, life: 0.8, harmless: true }); }
    S.at(t, () => { sfx('ff'); shake(5, 0.2); for (const b of bullets) if (b.jtok === tok) { b.x += b.vx * ahead; b.y += b.vy * ahead; b.age += ahead; b.jtok = 0; } }); });
}
/* ---------- MERIDIAN (the original 14 + 3 time-bending attacks) ---------- */
/* ---- MERIDIAN-only toolkit: ticks, echoes, countdown bombs, time zones ---- */
const TICK = 0.45, TICK_ON = 0.16; // tick-synced bullets only move during the first 0.16 s of every 0.45 s tick
function tickShot(S, x, y, a, step, r, col) { const v = step / TICK_ON; return shot(x, y, 0, 0, r || 5, col || '#e8c070', { ux: Math.cos(a) * v, uy: Math.sin(a) * v, life: 6, fn: b => { const on = (S.t % TICK) < TICK_ON; b.vx = on ? b.ux : 0; b.vy = on ? b.uy : 0; } }); }
function bomb(S, x, y, n, sp, fuse = 1.8, col = '#ff6677') { // countdown bomb: shows 3..2..1, then bursts into a ring
  const b = shot(x, y, 0, 0, 9, col, { life: fuse, label: bb => String(Math.max(1, Math.ceil(fuse - bb.age))) }); sfx('tick');
  S.at(S.t + fuse, () => { sfx('hit'); const a0 = rand(0, 6.283); for (let k = 0; k < n; k++) { const a = a0 + k * 6.283 / n; shot(x, y, Math.cos(a) * sp, Math.sin(a) * sp, 4.5, col); } }); return b; }
function echoGhost(S, hist, delay, col, mirror) { // a spark that walks exactly where YOU walked `delay` seconds ago
  const g = shot(P.x, P.y, 0, 0, 7, col || '#9fd8ff', { warn: 0.8, life: 99, noCull: true, fn: b => { const i = hist.length - 1 - Math.round(delay * 120); if (i >= 0) { b.x = hist[i][0] * (mirror ? -1 : 1); b.y = hist[i][1]; } b.vx = b.vy = 0; } });
  return g; }
const MER_ATTACKS = [
  { name: 'Tick Tock', phase: 0, dur: 8, size: [300, 200], desc: 'bullets only move on the TICK; walk between ticks',
    run(S) { S.every(TICK, n => { sfx(n % 2 ? 'tock' : 'tick'); if (n % 2) return; const side = (n >> 1) % 4, gap = rand(-0.6, 0.6);
      for (let k = -3; k <= 3; k++) { const f = k / 3.5; if (Math.abs(f - gap) < 0.22) continue;
        if (side === 0) tickShot(S, f * hw(), -hh() - 6, Math.PI / 2, 26 * S.d); else if (side === 1) tickShot(S, hw() + 6, f * hh(), Math.PI, 26 * S.d);
        else if (side === 2) tickShot(S, f * hw(), hh() + 6, -Math.PI / 2, 26 * S.d); else tickShot(S, -hw() - 6, f * hh(), 0, 26 * S.d); } }, 0.2, 7.2); } },
  { name: 'Clock Face', phase: 0, dur: 8, size: [240, 240], desc: 'the numerals strike in order; each one blinks first',
    run(S) { S.every(0.5 / S.d, n => { const h = n % 12, a = -Math.PI / 2 + (h + 1) * Math.PI / 6, x = Math.cos(a) * 108, y = Math.sin(a) * 108;
      shot(x, y, 0, 0, 10, '#ffe7a8', { warn: 0.55, life: 0.55, harmless: true });
      S.at(S.t + 0.55, () => { const t = Math.atan2(P.y - y, P.x - x); for (const d of [-0.34, 0, 0.34]) shot(x, y, Math.cos(t + d) * 100 * S.d, Math.sin(t + d) * 100 * S.d, 4.5, '#ffcc55'); sfx('tick'); }); }, 0.2, 7.2); } },
  { name: 'Pendulum Rain', phase: 0, dur: 7, size: [300, 200], desc: 'rows fall; follow the swinging gap',
    run(S) { S.every(0.45 / S.d, () => { const gc = Math.sin(S.t * 1.25) * hw() * 0.6; for (let x = -hw() + 10; x < hw(); x += 24) if (Math.abs(x - gc) > 34) shot(x, -hh() - 10, 0, 140 * S.d, 5); }, 0, 5.6); } },
  { name: 'Clock Hands', phase: 1, dur: 9.4, size: [260, 260], desc: 'the hands spin, then STOP: ghost lines show where; stand in a wedge',
    // Fixed v1.3: the old version had two full-length lasers spinning opposite ways and crossing, so the wedge between them
    // closed to zero. Now: short hands spin (keep off the centre), then both hands stop at shown angles and become long beams.
    run(S) { for (let c = 0; c < 3; c++) { const t0 = 0.2 + c * 3.0;
        S.at(t0, () => { const s0 = rand(0, 6.283); laser(0, 0, s0, 8, 0.6, 1.5, { len: 46, av: 1.6 * S.d, col: '#ffcc55' }); laser(0, 0, s0 + 2, 10, 0.6, 1.5, { len: 30, av: -1.5 * S.d, col: '#ff9a3c' }); sfx('warn'); /* tip speed <= 1.6*1.3*50 = 104 px/s */ });
        S.at(t0 + 1.4, () => { const pa = Math.atan2(P.y, P.x), a1 = pa + rand(0.9, 1.5) * (Math.random() < 0.5 ? 1 : -1), a2 = a1 + rand(2.2, 3.4);
          laser(0, 0, a1, 12, 0.7, 0.75, { len: 200, col: '#ffcc55' }); laser(0, 0, a2, 14, 0.7, 0.75, { len: 200, col: '#ff9a3c' }); sfx('tock'); }); }
      S.every(0.36 / S.d, () => { const a = rand(0, 6.283); shot(Math.cos(a) * 185, Math.sin(a) * 185, -Math.cos(a) * 95, -Math.sin(a) * 95, 4, '#fff', { life: 1.3 }); }, 0.8, 9); } },
  { name: 'Echo', phase: 1, dur: 9, size: [300, 210], desc: 'your own past self walks your path one second behind you. keep moving',
    run(S) { const hist = []; S.at(0, () => echoGhost(S, hist, 1.0, '#9fd8ff'));
      S.every(0.7 / S.d, () => { const x = rand(-hw(), hw()); for (const sy of [-1, 1]) shot(x, sy * (hh() + 8), 0, -sy * 85 * S.d, 4.5, '#ffd36e'); }, 1, 8.5);
      return () => { hist.push([P.x, P.y]); if (hist.length > 600) hist.shift(); }; } },
  { name: 'Countdown', phase: 1, dur: 9, size: [300, 210], desc: 'bombs count 3-2-1 near you, then ring out',
    run(S) { S.every(0.85 / S.d, () => { const a = rand(0, 6.283), r = rand(55, 90); bomb(S, clamp(P.x + Math.cos(a) * r, -hw() + 14, hw() - 14), clamp(P.y + Math.sin(a) * r, -hh() + 14, hh() - 14), 10, 115 * S.d); }, 0.2, 7.2); } },
  { name: 'Stopwatch', phase: 2, dur: 9, size: [300, 200], desc: 'TIME STOP: bullets freeze mid-air, then all resume at once', rec: true, timeplay: true,
    run(S) { S.every(0.3 / S.d, n => { const e = n % 4, L = 120; let x, y; if (e < 2) { x = rand(-hw(), hw()); y = e ? -hh() - 10 : hh() + 10; } else { y = rand(-hh(), hh()); x = e === 2 ? -hw() - 10 : hw() + 10; }
        const a = Math.atan2(P.y - y, P.x - x) + rand(-0.25, 0.25); shot(x, y, Math.cos(a) * L, Math.sin(a) * L, 4.5, '#9ad8ff'); }, 0.3, 8.2);
      S.every(1.1, () => { const gc = rand(-hw() * 0.5, hw() * 0.5); for (let x = -hw() + 12; x < hw(); x += 26) if (Math.abs(x - gc) > 40) shot(x, -hh() - 8, 0, 90, 4.5, '#ffcc55'); }, 0.8, 8);
      tfx(S, 2.4, 'freeze', 1.3, { boost: 1.25 }); tfx(S, 4.9, 'freeze', 1.2, { boost: 1.3 }); tfx(S, 7.2, 'freeze', 0.9, { boost: 1.35 }); } },
  { name: 'Time Zones', phase: 2, dur: 9.5, size: [330, 200], desc: 'SLOW and FAST zones: bullets crawl in blue, race in orange; zones swap',
    run(S) { const setZ = flip => { S.zones = flip ? [{ x0: -hw(), x1: -hw() / 3, f: 1.75 }, { x0: hw() / 3, x1: hw(), f: 0.45 }] : [{ x0: -hw(), x1: -hw() / 3, f: 0.45 }, { x0: hw() / 3, x1: hw(), f: 1.75 }]; };
      const zf = x => { for (const z of S.zones || []) if (x >= z.x0 && x < z.x1) return z.f; return 1; };
      S.at(0, () => setZ(false)); S.at(4.4, () => { S.alert = 'ZONES SWAP'; S.alertT = 0.7; sfx('warn'); }); S.at(5.1, () => setZ(true));
      S.every(0.3 / S.d, () => { const x = rand(-hw() + 6, hw() - 6), v = 80 * S.d; shot(x, -hh() - 8, 0, v, 4.5, '#ffd36e', { uy: v, fn: b => { b.vy = b.uy * zf(b.x); } }); }, 0.3, 8.8);
      S.every(1.1 / S.d, n => { const y = clamp(P.y + rand(-30, 30), -hh() + 10, hh() - 10), d = n % 2 ? -1 : 1, v = 110 * S.d; shot(-d * (hw() + 8), y, d * v, 0, 5, '#ff6677', { ux: d * v, fn: b => { b.vx = b.ux * zf(b.x); } }); }, 0.8, 8.8);
      S.at(9.4, () => { S.zones = null; }); } },
  { name: 'Shrinking Dial', phase: 2, dur: 9.5, size: [170, 170], desc: 'the box shrinks; a spiral reverses',
    run(S) { let a = 0, dir = 1; S.at(0, () => { shot(0, 0, 0, 0, 26, '#ff9a3c', { warn: 1.3, life: 1.3 }); sfx('warn'); });
      S.at(4.8, () => { dir = -1; sfx('warn'); });
      S.every(0.1, () => { for (let k = 0; k < 3; k++) { const aa = a + k * 2.094; shot(0, 0, Math.cos(aa) * 95 * S.d, Math.sin(aa) * 95 * S.d, 4.5, '#ffcc55'); } }, 1.3, 8.6);
      return (t, dt) => { if (t > 1.3) a += dir * 1.9 * dt; }; } },
  { name: 'Rewind', phase: 3, dur: 9.5, size: [280, 210], desc: 'REWIND: the spiral runs backwards into the centre, then fires again', rec: true, timeplay: true,
    run(S) { let a = 0; S.at(0, () => { shot(0, 0, 0, 0, 22, '#e070ff', { warn: 0.9, life: 0.9 }); sfx('warn'); });
      S.every(0.18, () => { for (let k = 0; k < 3; k++) { const aa = a + k * 2.094; shot(0, 0, Math.cos(aa) * 100 * S.d, Math.sin(aa) * 100 * S.d, 4.5, k ? '#e070ff' : '#fff'); } }, 0.9, 8.6); /* v2.0.3 tone-down: spiral 0.11 -> 0.18 s so an arm can be crossed (was a solid line: you had to out-run its turn) */
      S.every(1.4, n => { const side = n % 2; wallPair(side ? hw() + 10 : -hw() - 10, (side ? -1 : 1) * 150, clamp(P.y, -hh() + 40, hh() - 40), 46, '#c0a8ff'); }, 1.5, 8.4); /* v2.0.3: wall gap 38 -> 46 */
      tfx(S, 3.4, 'rewind', 1.4, {}); tfx(S, 6.4, 'rewind', 1.1, { boost: 1.1, dup: true });
      return (t, dt) => { if (t > 0.9) a += 1.4 * dt; }; } }, /* v2.0.3: turn 1.7 -> 1.4 rad/s */
  { name: 'Echo Chorus', phase: 3, dur: 9.5, size: [300, 210], desc: 'three past selves at 0.8 s, 1.6 s, 2.4 s, and one in the mirror',
    run(S) { const hist = []; S.at(0, () => { echoGhost(S, hist, 0.8, '#9fd8ff'); }); S.at(1.2, () => echoGhost(S, hist, 1.6, '#c0a8ff')); S.at(2.4, () => echoGhost(S, hist, 2.4, '#e070ff')); S.at(4.5, () => { S.alert = 'MIRROR'; S.alertT = 0.7; echoGhost(S, hist, 0.5, '#ff9a3c', true); });
      S.every(0.6 / S.d, () => { const a = rand(0, 6.283); tickShot(S, Math.cos(a) * 190, Math.sin(a) * 190, a + Math.PI, 30 * S.d, 4.5, '#e8c070'); }, 1, 9); 
      return () => { hist.push([P.x, P.y]); if (hist.length > 600) hist.shift(); }; } },
  { name: 'Twelve Strokes', phase: 3, dur: 10, size: [260, 220], desc: 'DESPERATION: twelve beams through the dial, one stroke at a time (0.7 s warning each); stay off the centre',
    run(S) { let k = 0; S.every(0.5 / S.d, () => { k = (k + 5) % 12; laser(0, 0, k * Math.PI / 6, 12, 0.7, 0.22, { col: '#e070ff' }); sfx('tick'); }, 0.3, 8.6);
      S.every(0.55 / S.d, n => { const e = n % 4; let x, y; if (e < 2) { x = rand(-hw(), hw()); y = e ? -hh() - 10 : hh() + 10; } else { y = rand(-hh(), hh()); x = e === 2 ? -hw() - 10 : hw() + 10; }
        const a = Math.atan2(P.y - y, P.x - x) + rand(-0.15, 0.15); shot(x, y, Math.cos(a) * 125, Math.sin(a) * 125, 4.5, '#ff6677'); }, 1, 9.2); } },
  { name: 'Desperation', phase: 4, dur: 12, size: [280, 200], desc: 'DESPERATION: freeze, rewind into DOUBLE bullets, then skip ahead (ghosts show where they land)', rec: true, timeplay: true,
    run(S) { let a = 0; S.at(0, () => { shot(0, 0, 0, 0, 24, '#e070ff', { warn: 0.9, life: 0.9 }); sfx('warn'); }); S.every(0.24 / S.d, () => { for (let k = 0; k < 3; k++) { const aa = a + k * 2.094; shot(0, 0, Math.cos(aa) * 85 * S.d, Math.sin(aa) * 85 * S.d, 4.5, k ? '#ff9a3c' : '#fff'); } }, 0.9, 10.6); /* v2.0.3 tone-down: spiral 0.18 -> 0.24 /d, turn 1.5 -> 1.25 */
      S.every(1.5, n => { const side = n % 2; wallPair(side ? hw() + 10 : -hw() - 10, (side ? -1 : 1) * 150, clamp(P.y, -hh() + 40, hh() - 40), 40, '#c0a8ff'); }, 1.2, 10.4);
      tfx(S, 2.6, 'freeze', 1.2, { boost: 1.25 }); tfx(S, 5.0, 'rewind', 1.2, { dup: true }); tfxJump(S, 8.4, 0.5);
      return (t, dt) => { a += 1.25 * dt; }; } },
  { name: 'Last Countdown', phase: 4, dur: 11, size: [300, 210], desc: 'countdown bombs, then TIME STOP mid-blast; the rings resume faster',
    run(S) { S.every(0.62 / S.d, () => { const a = rand(0, 6.283), r = rand(60, 95); bomb(S, clamp(P.x + Math.cos(a) * r, -hw() + 14, hw() - 14), clamp(P.y + Math.sin(a) * r, -hh() + 14, hh() - 14), 12, 110 * S.d, 1.6, '#e070ff'); }, 0.2, 9.2);
      S.every(TICK, n => { if (n % 3) return; const x = rand(-hw(), hw()); tickShot(S, x, -hh() - 6, Math.PI / 2, 28 * S.d); }, 0.5, 9.5);
      tfx(S, 3.8, 'freeze', 1.1, { boost: 1.25 }); tfx(S, 7.4, 'freeze', 1.0, { boost: 1.3 }); } },
  { name: 'Midnight', phase: 4, dur: 11, size: [260, 260], desc: 'the clock face turns; hands stop on the hour; tick bullets march',
    run(S) { S.at(0, () => { arena.av = 0.3; });
      for (let c = 0; c < 3; c++) { const t0 = 0.4 + c * 3.2; S.at(t0, () => { const pa = Math.atan2(P.y, P.x), a1 = pa + rand(0.9, 1.4) * (Math.random() < 0.5 ? 1 : -1); for (const a of [a1, a1 + 2.1, a1 + 4.2]) laser(0, 0, a, 12, 0.75, 0.7, { len: 200, col: '#e070ff' }); sfx('warn'); }); }
      S.every(TICK, n => { sfx(n % 2 ? 'tock' : 'tick'); if (n % 2) return; const a0 = rand(0, 6.283); for (let k = 0; k < 6; k++) { const a = a0 + k * 1.047; tickShot(S, Math.cos(a) * 180, Math.sin(a) * 180, a + Math.PI, 24 * S.d, 4.5, '#ffcc55'); } }, 0.2, 10);
      S.at(10.5, () => { arena.av = 0; arena.rotHome = true; }); } },
  { name: "Time's Up", phase: 4, dur: 15, size: [300, 200], desc: 'FINALE: freeze, rewind, skip ahead, resume... all of it', rec: true, timeplay: true, finale: true,
    run(S) { S.at(0, () => { arena.av = 0.25; });
      S.every(0.26 / S.d, n => { if (B && B.tfx && B.tfx.mode === 'ff') return; if (S.t > 9.9 && S.t < 10.9) return; /* v1.6: quiet window around the skip-ahead jump */ /* v1.5: the aimed stream holds fire during x2 (was every other shot) */ const L = 125; let x, y; for (let k = 0; k < 8; k++) { const e = (n + k) % 4; if (e < 2) { x = rand(-hw(), hw()); y = e ? -hh() - 10 : hh() + 10; } else { y = rand(-hh(), hh()); x = e === 2 ? -hw() - 10 : hw() + 10; } if (Math.hypot(P.x - x, P.y - y) > 120) break; } /* v1.6: never spawn an aimed shot point-blank */
        const a = Math.atan2(P.y - y, P.x - x) + rand(-0.2, 0.2); shot(x, y, Math.cos(a) * L, Math.sin(a) * L, 4.5, '#ff6677', { unfire: 1 }); }, 0.4, 13.6);
      let gc = 0; S.every(0.9, () => { gc = clamp(gc + rand(-40, 40), -hw() * 0.5, hw() * 0.5); /* v1.5: the gap drifts from the last row instead of jumping, so x2 rows stay reachable */ for (let x = -hw() + 12; x < hw(); x += 28) if (Math.abs(x - gc) > 52) shot(x, -hh() - 8, 0, 85, 4.5, '#ffd36e', { wall: 1 }); /* v1.6: gap 88 -> 104 px */ }, 1, 13.4); /* v1.6: wall rows freeze during REWIND / x2 */
      S.every(2.4, () => { for (const sx of [-hw(), hw()]) shot(sx, -hh() - 8, 0, 90, 6, '#ffcc55', { home: 1.8, spd: 98, life: 3.2 }); }, 4.4, 9); /* v1.6: birds 110 -> 98 px/s (slower than a 60%-speed player) */ /* v1.5: pairs at 4.4 + 6.8 only, so no homing bird is ever boosted by a resume */
      tfx(S, 3.0, 'freeze', 1.5, { boost: 1.2, skipCol: '#ff6677' }); tfx(S, 5.8, 'rewind', 1.4, {}); tfx(S, 8.2, 'ff', 0.8, { bx1: 1 }); /* v1.6: x2 skips the clock (spawns), live bullets keep 1x speed */ tfxJump(S, 10.6, 0.5); /* v1.5: x2 ends (~9.8) before the skip-ahead ghosts appear */ tfx(S, 11.6, 'freeze', 1.6, { boost: 1.3, last: true, skipCol: '#ff6677', skipWall: 1 }); /* v1.6: aimed shots are not boosted by the final resume */ /* v1.5: resume boosts 1.3/1.4 -> 1.2/1.3 */
      S.at(14, () => { arena.av = 0; arena.rotHome = true; }); } },
];
// phase 4-5 chains: a short follow-up fired straight after the main attack, no menu in between
const MER_CHAIN = [
  { name: 'Aftershock', dur: 3.6, size: [280, 200], desc: 'chain: aimed volleys from the corners',
    run(S) { const cs = [[-1, -1], [1, -1], [-1, 1], [1, 1]]; S.every(0.45 / S.d, n => { const [cx, cy] = cs[n % 4], x = cx * hw(), y = cy * hh(), a0 = Math.atan2(P.y - y, P.x - x);
      for (const da of [-0.3, 0, 0.3]) shot(x, y, Math.cos(a0 + da) * 135, Math.sin(a0 + da) * 135, 4.5, '#ff6677'); }, 0.3, 3.0); } },
  { name: 'Second Hand', dur: 3.6, size: [260, 200], desc: 'chain: a single beam sweeps (slower than you), spiral behind it',
    run(S) { S.at(0, () => { laser(0, 0, rand(0, 6.283), 10, 0.8, 2.6, { av: 0.8, len: 85, col: '#ffcc55' }); sfx('warn'); }); S.every(0.5 / S.d, () => { const a = rand(0, 6.283); shot(Math.cos(a) * 190, Math.sin(a) * 190, -Math.cos(a) * 90, -Math.sin(a) * 90, 4.5); }, 0.6, 3.2); } },
  null,
];
const MER_PHASES = [
  { name: 'WIND-UP', eye: '#ffffff', track: 'm1', intro: ['ah. a visitor. right on time.', "i'm MERIDIAN. i keep the hours here.", 'want past me? then dance to my beat, little spark.'] },
  { name: 'HEAVY HANDS', eye: '#5ee7ff', track: 'm2', intro: ["you're still moving? how rude.", "let's put some weight in your steps."] },
  { name: 'OFF THE CLOCK', eye: '#ffcc55', track: 'm3', intro: ['fine. no more manners.', 'no more warm-ups either.'] },
  { name: 'MIDNIGHT', eye: '#e070ff', track: 'm4', intro: ['...do you hear that?', "it's almost midnight. i hate midnight."] },
  { name: 'LAST SECOND', eye: '#ff4455', track: 'm5', intro: ["THE CLOCK DOESN'T STOP FOR ANYONE.", 'not for you. not even for me.'] },
];
const MER_PRE = ['tick. tock. tick.', 'every hour has a number.', 'round and round we go.', 'hands off the dial.', 'oh, you\'ve got a shadow. it\'s a bit slow.', 'three. two. one.',
  'let\'s take a little... pause.', 'time runs differently over there.', 'the dial is shrinking. so is your luck.', 'wait. let me try that again.', 'all of you. all your yesterdays.', 'twelve. strokes. COUNT THEM.',
  'no. no no no. AGAIN. AGAIN!', 'stop. STOP. everything STOP.', 'midnight.', 'time\'s up, spark. whose time? we\'ll see.'];

/* ---------- REGULAR MONSTERS ---------- */
const A = {}; // attack library by id
A.waxDrip = { name: 'Wax Drip', dur: 6, size: [240, 170], desc: 'hot drops fall and splash',
  run(S) { S.every(0.22 / S.d, n => { const big = n % 5 === 4; shot(rand(-hw() + 8, hw() - 8), -hh() - 8, 0, 40, big ? 7 : 4.5, big ? '#ffb347' : '#fff3c4', { ay: 260 * S.d, fn: big ? (b) => { if (b.y > hh() - 8) { b.dead = true; for (const vx of [-90, 0, 90]) shot(b.x, b.y - 4, vx, -160, 3.5, '#ffb347', { ay: 300 }); } } : null }); }, 0, 5.2); } };
A.mothFlutter = { name: 'Moth Flutter', dur: 6, size: [260, 170], desc: 'moths flutter across in waves',
  run(S) { S.every(0.55 / S.d, n => { const side = n % 2, y0 = rand(-hh() + 20, hh() - 20), ph = rand(0, 6);
    for (let k = 0; k < 2; k++) shot(side ? hw() + 10 + k * 26 : -hw() - 10 - k * 26, y0, (side ? -1 : 1) * 95 * S.d, 0, 5, '#e8d8ff', { fn: (b) => { b.vy = Math.cos(b.age * 5 + ph) * 110; } }); }, 0, 5.3); } };
A.fetch = { name: 'Fetch!', dur: 6, size: [260, 170], desc: 'bouncy bolts ricochet around',
  run(S) { S.every(1.3 / S.d, n => { const s = Math.random() < 0.5; shot(s ? -hw() + 10 : hw() - 10, -hh() + 12, (s ? 1 : -1) * rand(90, 150) * S.d, 0, 7, '#c9a27a', { ay: 380, bounce: 9, life: 5.5 }); }, 0, 4.5); } };
A.boltToss = { name: 'Bolt Toss', dur: 6, size: [280, 170], desc: 'bolts arc in from both sides',
  run(S) { S.every(0.4 / S.d, n => { const s = n % 2; shot(s ? hw() + 8 : -hw() - 8, rand(0, hh()), (s ? -1 : 1) * rand(110, 190), rand(-330, -230), 4.5, '#aab', { ay: 360 }); }, 0, 5.3); } };
A.tickRing = { name: 'Tick Ring', dur: 6.5, size: [250, 190], desc: 'rings burst out of marked spots',
  run(S) { S.every(0.9 / S.d, () => { const x = clamp(P.x + rand(-60, 60), -hw() + 20, hw() - 20), y = clamp(P.y + rand(-50, 50), -hh() + 20, hh() - 20);
    shot(x, y, 0, 0, 12, '#ff9a3c', { warn: 0.6, life: 0.6 }); S.at(S.t + 0.6, () => { const off = rand(0, 6.283); for (let i = 0; i < 12; i++) { const a = off + i / 12 * 6.283; shot(x, y, Math.cos(a) * 110 * S.d, Math.sin(a) * 110 * S.d, 4, '#ffd36e'); } sfx('blip', 900); }); }, 0, 5.4); } };
A.secondHand = { name: 'Second Hand', dur: 7, size: [220, 220], desc: 'one hand sweeps; stay behind it',
  run(S) { S.at(0, () => { laser(0, 0, -1.57, 10, 0.9, 6, { av: 1.15 * S.d, len: 200, col: '#ffcc55' }); sfx('warn'); });
    S.every(0.7, () => { const a = rand(0, 6.283); shot(Math.cos(a) * 160, Math.sin(a) * 160, -Math.cos(a) * 70, -Math.sin(a) * 70, 4); }, 1.2, 6.4); } };
A.springBounce = { name: 'Spring Bounce', dur: 6.5, size: [260, 180], desc: 'beetles ricochet off the walls',
  run(S) { S.every(0.8 / S.d, () => { const a = rand(0, 6.283), sp = 130 * S.d; shot(Math.cos(a) * (hw() - 12) * 0.95, -hh() + 12, Math.cos(a + 1) * sp, Math.abs(Math.sin(a + 1)) * sp + 30, 6.5, '#7fe08a', { bounce: 5, life: 6 }); }, 0, 4.8); } };
A.coilSnap = { name: 'Coil Snap', dur: 6.5, size: [280, 180], desc: 'springs snap up from the floor',
  run(S) { S.every(0.75 / S.d, n => { const x = n % 2 ? clamp(P.x, -hw() + 18, hw() - 18) : rand(-hw() + 18, hw() - 18); zone(x, 0, 34, arena.h + 4, 0.6, 0.22, { col: '#7fe08a' }); sfx('warn'); }, 0.2, 5.6);
    S.every(1.1, () => shot(rand(-hw(), hw()), hh() + 8, 0, -170, 4.5, '#7fe08a'), 0.6, 5.6); } };
A.steamRise = { name: 'Steam Rise', dur: 6.5, size: [250, 180], desc: 'steam puffs drift up and swell',
  run(S) { S.every(0.24 / S.d, () => { const ph = rand(0, 6); shot(rand(-hw(), hw()), hh() + 8, 0, -rand(70, 110) * S.d, 4, '#dfe8f0', { fn: (b, dt) => { b.vx = Math.sin(b.age * 3 + ph) * 50; b.r = Math.min(11, b.r + dt * 3); } }); }, 0, 5.5); } };
A.boilOver = { name: 'Boil Over', dur: 6.5, size: [250, 190], desc: 'bubbles swell, then pop',
  run(S) { S.every(0.7 / S.d, () => { const x = rand(-hw() + 20, hw() - 20), y = rand(-hh() + 20, hh() - 20);
    shot(x, y, 0, 0, 10, '#9fd8ff', { warn: 0.7, life: 0.7 }); S.at(S.t + 0.7, () => { for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283 + 0.3; shot(x, y, Math.cos(a) * 120 * S.d, Math.sin(a) * 120 * S.d, 4.5, '#9fd8ff'); } }); }, 0, 5.5); } };
A.strings = { name: 'Puppet Strings', dur: 7, size: [280, 190], desc: 'strings drop where you stand',
  run(S) { S.every(0.55 / S.d, n => { const x = n % 3 === 0 ? P.x : rand(-hw() + 10, hw() - 10); laser(clamp(x, -hw() + 6, hw() - 6), 0, Math.PI / 2, 8, 0.65, 0.25, { col: '#ffd0f0' }); if (n % 3 === 0) sfx('warn'); }, 0, 6.2);
    S.every(1.4, () => { const y = rand(-hh() + 20, hh() - 20); laser(0, y, 0, 8, 0.8, 0.25, { col: '#ffd0f0' }); }, 1.5, 6); } };
A.tangle = { name: 'Tangle', dur: 6.5, size: [280, 180], desc: 'dangling dolls swing as they fall',
  run(S) { S.every(0.35 / S.d, () => { const x0 = rand(-hw() + 20, hw() - 20), ph = rand(0, 6); shot(x0, -hh() - 8, 0, 85 * S.d, 5.5, '#ffb0d8', { fn: (b) => { b.x = x0 + Math.sin(b.age * 3 + ph) * 46; } }); }, 0, 5.4); } };
A.tollWave = { name: 'Toll Wave', dur: 6.5, size: [250, 200], desc: 'sound rings spread from the centre; the gap is marked first',
  run(S) { S.every(1.15 / S.d, () => { ringGap(S, { n: 28, gapHalf: 0.6, sp: 95 * S.d, col: '#b8c8ff', inward: false, warn: 0.6, maxShift: 0.9, onSpawn: () => sfx('blip', 300) }); }, 0, 5.0); } };
A.echo = { name: 'Echo', dur: 6.5, size: [250, 200], desc: 'echoes rush in... and bounce back out',
  run(S) { S.every(0.8 / S.d, () => { const off = rand(0, 6.283); for (let i = 0; i < 10; i++) { const a = off + i / 10 * 6.283, R = 170; shot(Math.cos(a) * R, Math.sin(a) * R, -Math.cos(a) * 140 * S.d, -Math.sin(a) * 140 * S.d, 4.5, '#c0a8ff', { fn: (b) => { if (!b.rev && b.age > 0.95) { b.rev = true; b.vx *= -1; b.vy *= -1; } }, rev: false }); } }, 0, 5); } };

/* ---------- MID BOSSES ---------- */
A.waxLance = { name: 'Wax Lance', dur: 7, size: [300, 180], desc: 'lances charge after a warning line',
  run(S) { S.every(0.65 / S.d, n => { const s = n % 2, y = clamp(n % 3 === 0 ? P.y : rand(-hh() + 12, hh() - 12), -hh() + 10, hh() - 10);
    tele(0, y, 0, 14, 0.5, { col: '#ffcf70' }); sfx('warn');
    S.at(S.t + 0.5, () => bar(s ? hw() + 40 : -hw() - 40, y, 70, 12, (s ? -1 : 1) * 520, 0, '#ffe7a8')); }, 0, 6.2); } };
A.emberFall = { name: 'Ember Fall', dur: 7, size: [300, 190], desc: 'embers drift down; follow the gap',
  run(S) { S.every(0.32 / S.d, () => { const gc = Math.sin(S.t * 0.9) * hw() * 0.55; for (let x = -hw() + 12; x < hw(); x += 30) if (Math.abs(x - gc) > 40) { const ph = rand(0, 6); shot(x + rand(-6, 6), -hh() - 8, 0, 105 * S.d, 4.5, '#ff8a3c', { fn: (b) => { b.vx = Math.sin(b.age * 4 + ph) * 30; } }); } }, 0, 6); } };
A.shieldWall = { name: 'Shield Wall', dur: 7, size: [320, 190], desc: 'shields slam in; slip through',
  run(S) { let gy = 0; S.every(0.75 / S.d, n => { const side = n % 2; gy = clamp(gy + rand(-60, 60), -hh() + 34, hh() - 34); wallPair(side ? hw() + 10 : -hw() - 10, (side ? -1 : 1) * 210 * S.d, gy, 32, '#ffe7a8'); }, 0, 5.8);
    S.every(1.6, () => shot(rand(-hw(), hw()), -hh() - 8, 0, 120, 5, '#ff8a3c'), 1, 5.8); } };
A.wickRing = { name: 'Wick Ring', dur: 7.5, size: [260, 220], desc: 'rings of flame close in from the edge; read the gap (always on your side) and slip through',
  run(S) { S.every(1.25 / S.d, n => ringGap(S, { R: Math.hypot(hw(), hh()) + 6, noMark: true, n: 30, gapHalf: 0.68, sp: 110 * S.d, col: n % 2 ? '#ff8a3c' : '#ffe7a8', maxShift: 0.8 }), 0, 5.2); } };
A.conveyor = { name: 'Conveyor', dur: 8, size: [320, 160], desc: 'GRAVITY: hop the crates on the belt', blue: true,
  run(S) { S.every(0.6 / S.d, n => { const h = rand(20, 40), w = n % 4 === 3 ? 48 : 22; bar(hw() + 30, hh() - h / 2, w, h, -255 * S.d, 0, '#c08850'); }, 0.5, 7);
    S.every(0.5, () => shot(rand(-hw(), hw()), -hh() - 8, 0, 145, 4, '#ccc'), 1.5, 7); } };
A.rivetRain = { name: 'Rivet Rain', dur: 7, size: [300, 190], desc: 'rivet columns hammer down',
  run(S) { S.every(0.4 / S.d, n => { const x = clamp(n % 2 === 0 ? P.x : rand(-hw() + 20, hw() - 20), -hw() + 20, hw() - 20); tele(x, 0, Math.PI / 2, 30, 0.45, { col: '#ffcc55' });
    S.at(S.t + 0.45, () => { for (let k = 0; k < 4; k++) shot(x + rand(-8, 8), -hh() - 10 - k * 22, 0, 420, 5, '#ddd'); }); }, 0, 6.2); } };
A.drillBits = { name: 'Drill Bits', dur: 7.5, size: [300, 200], desc: 'drills burrow after you',
  run(S) { S.every(0.85 / S.d, n => { for (let i = 0; i < (n > 2 ? 3 : 2); i++) shot(rand(-hw(), hw()), hh() + 10, 0, -100, 6, '#ffb347', { home: 2.4, spd: 140 * S.d, life: 3.4 }); }, 0, 6.3);
    S.every(0.45, () => shot(-hw() - 8, rand(-hh(), hh()), 140, 0, 4), 0.5, 6.5); } };
A.pistonPress = { name: 'Piston Press', dur: 8, size: [300, 200], desc: 'presses crush all but one lane',
  run(S) { S.every(1.1 / S.d, n => { sfx('warn'); const lanes = 5, lw = arena.w / lanes, pl = clamp(Math.floor((P.x + hw()) / lw), 0, lanes - 1); const safe = pl === 0 ? 1 : pl === lanes - 1 ? lanes - 2 : pl + (Math.random() < 0.5 ? -1 : 1);
    for (let i = 0; i < lanes; i++) if (i !== safe) zone(-hw() + lw * (i + 0.5), 0, lw + 1, arena.h + 2, 0.72, 0.3, { col: '#c08850' }); }, 0.2, 7); } };
A.aria = { name: 'Aria', dur: 7, size: [300, 190], desc: 'notes ride waves across the stage',
  run(S) { S.every(0.13 / S.d, n => { /* c19: was 0.16 @150, wave 26 */ const lane = n % 4, y0 = -hh() + (lane + 0.5) * arena.h / 4; shot(hw() + 10, y0, -170 * S.d, 0, 4.5, ['#ff9ad8', '#9ad8ff', '#ffd36e', '#c0a8ff'][lane], { fn: (b) => { b.y = y0 + Math.sin(b.age * 4 + lane) * 30; } }); }, 0, 6); } };
A.encore = { name: 'Encore', dur: 7.5, size: [300, 210], desc: 'her chorus chases you; feathers fall',
  run(S) { S.every(1.0 / S.d, n => { for (const x of [-hw() + 10, hw() - 10]) shot(x, -hh() - 8, 0, 100, 6, '#ffcc55', { home: 2.2, spd: 130 * S.d, life: 3.4 }); }, 0, 6.3);
    S.every(0.25, () => { const ph = rand(0, 6); shot(rand(-hw(), hw()), -hh() - 8, 0, 80, 3.5, '#fff', { fn: (b) => { b.vx = Math.sin(b.age * 3 + ph) * 60; } }); }, 0.3, 6.5); } };
A.highNote = { name: 'High Note', dur: 8, size: [300, 210], desc: 'a fan of notes sweeps the stage',
  run(S) { S.at(0, () => { sfx('warn'); for (const a0 of [0.9, 1.57, 2.24]) laser(0, -hh() - 2, a0, 9, 1.0, 6.4, { len: 600, col: '#ff9ad8', fn: (b) => { b.ang = a0 + Math.sin(b.age * 0.9 * S.d) * 0.6; } }); });
    S.every(0.8, () => shot(rand(-hw(), hw()), hh() + 8, 0, -110, 4.5, '#ffd36e'), 1.2, 7.2); } };
A.featherStorm = { name: 'Feather Storm', dur: 8.5, size: [220, 220], desc: 'a twin spiral reverses mid-song',
  run(S) { let a = 0, dir = 1; S.at(0, () => { shot(0, 0, 0, 0, 22, '#ff9ad8', { warn: 1.0, life: 1.0 }); sfx('warn'); });
    S.at(4.4, () => { dir = -1; sfx('warn'); });
    S.every(0.12, () => { for (let k = 0; k < 2; k++) { const aa = a + k * Math.PI; shot(0, 0, Math.cos(aa) * 105 * S.d, Math.sin(aa) * 105 * S.d, 4.5, k ? '#ff9ad8' : '#fff'); } }, 1.0, 7.8);
    return (t, dt) => { if (t > 1) a += dir * 2.2 * dt; }; } };
A.grandFinale = { name: 'Grand Finale', dur: 9, size: [300, 200], desc: 'everything at once. bravo.',
  run(S) { S.every(0.18 / S.d, n => { /* c19: was 0.22 @140, homers 1.5, laser 2.0 */ const lane = n % 3, y0 = -hh() + (lane + 0.5) * arena.h / 3; shot(-hw() - 10, y0, 160, 0, 4, '#9ad8ff', { fn: (b) => { b.y = y0 + Math.sin(b.age * 5) * 22; } }); }, 0, 8);
    S.every(1.25, () => { for (const x of [-hw() + 10, hw() - 10]) shot(x, -hh() - 8, 0, 100, 6, '#ffcc55', { home: 2, spd: 120, life: 3 }); }, 1, 7.5);
    S.every(1.6, () => { sfx('warn'); laser(rand(-hw() + 20, hw() - 20), 0, Math.PI / 2, 14, 0.8, 0.3, { col: '#ff9ad8' }); }, 1.5, 8); } };
/* ---------- boss finales: each one breaks a different rule ---------- */
// WICKLOW · memory & loss: the light goes out. Only what's near your core (and his last flame) stays lit.
A.lastLight = { name: 'Last Light', dur: 9, size: [280, 200], desc: 'the candle is going out. bullets glow faintly in the dark.', dark: true,
  run(S) { S.at(0, () => { S.alert = 'THE LIGHT IS GOING'; S.alertT = 1.4; });
    S.every(0.5 / S.d, n => { const gc = Math.sin(S.t * 0.8) * hw() * 0.5; for (let x = -hw() + 14; x < hw(); x += 30) if (Math.abs(x - gc) > 42) shot(x, -hh() - 8, 0, 85 * S.d, 4.5, '#ffb070'); }, 0.8, 7.6);
    S.every(1.7, n => { const s = n % 2, y = clamp(P.y, -hh() + 12, hh() - 12); tele(0, y, 0, 12, 0.7, { col: '#ffcf70' }); sfx('warn'); S.at(S.t + 0.7, () => bar(s ? hw() + 40 : -hw() - 40, y, 60, 10, (s ? -1 : 1) * 380, 0, '#ffe7a8')); }, 2, 7.5);
    return (t) => { S.dark = Math.min(1, t / 2.5) * (t > 8.2 ? Math.max(0, (9 - t) / 0.8) : 1); }; } };
// FOREMAN GRIT · control & obedience: he posts RULES. Break one and the floor punishes you (always warned first).
A.theRules = { name: 'The Rules', dur: 11, size: [300, 190], desc: 'RULE 1 keep moving · RULE 2 stay left · RULE 3 obey the belt',
  run(S) { let still = 0, lx = P.x, ly = P.y, cool = 0;
    const post = (t, r) => S.at(t, () => { S.rule = r; sfx('warn'); shake(3, 0.15); });
    post(0, 'RULE 1: KEEP MOVING'); post(3.6, 'RULE 2: LEFT SIDE ONLY'); post(7.2, 'RULE 3: OBEY THE BELT');
    S.every(0.3 / S.d, () => shot(rand(-hw(), hw()), -hh() - 8, 0, 165, 4, '#ccc'), 0.5, 10.4);
    S.at(4.4, () => zone(hw() / 2, 0, hw() + 2, arena.h + 2, 0.9, 2.3, { col: '#c08850' }));
    S.every(0.32, () => bar(-hw() - 10, rand(-hh() + 12, hh() - 12), 26, 10, 300, 0, '#c08850'), 7.6, 10.4);
    return (t, dt) => { cool -= dt;
      if (t < 3.6) { const m = Math.hypot(P.x - lx, P.y - ly); lx = P.x; ly = P.y; still = m < 0.25 ? still + dt : 0; S.meter = still / 0.8;
        if (still > 0.8 && cool <= 0) { zone(P.x, P.y, 46, 46, 0.45, 0.25, { col: '#ffcc55' }); cool = 0.9; still = 0; } } else S.meter = 0;
      if (t >= 7.2 && t < 10.6) P.x += 85 * dt;
      if (t > 10.6) S.rule = null; }; } };
// CUCKOO · performance & identity: she performs YOUR story back at you; the curtains close in.
A.medley = { name: 'Your Song', dur: 10, size: [320, 200], desc: 'a medley of your journey. the curtains close as she sings.', stage: true,
  run(S) { const f = (hero && hero.flags) || {};
    const wk = f.killed_wicklow, gk = f.killed_grit;
    S.at(0, () => { S.alert = wk ? 'VERSE I: THE SNUFFED CANDLE' : 'VERSE I: THE CANDLE THAT STAYED LIT'; S.alertT = 1.6; });
    S.every((wk ? 0.55 : 0.75) / S.d, n => { const s = n % 2, y = clamp(n % 3 === 0 ? P.y : rand(-hh() + 12, hh() - 12), -hh() + 10, hh() - 10);
      tele(0, y, 0, 12, 0.5, { col: '#ff9ad8' }); S.at(S.t + 0.5, () => bar(s ? hw() + 40 : -hw() - 40, y, 60, 10, (s ? -1 : 1) * (wk ? 480 : 360), 0, wk ? '#ff6677' : '#ffc0e8')); }, 0.4, 4.6);
    S.at(5, () => { S.alert = gk ? 'VERSE II: THE SILENCED FLOOR' : 'VERSE II: THE SHIFT THAT ENDED'; S.alertT = 1.6; setArena(240, 200); });
    S.every((gk ? 0.45 : 0.6) / S.d, n => { const x = clamp(n % 3 === 0 ? P.x : rand(-hw() + 20, hw() - 20), -hw() + 20, hw() - 20); tele(x, 0, Math.PI / 2, 26, 0.5, { col: '#ff9ad8' });
      S.at(S.t + 0.5, () => { for (let k = 0; k < 3; k++) shot(x + rand(-6, 6), -hh() - 10 - k * 22, 0, 380, 5, gk ? '#ff6677' : '#ffc0e8'); }); }, 5.4, 9.2); } };
/* ---------- MOPSLEY (secret) · slippery floor ---------- */
A.spill = { name: 'Spill', dur: 7, size: [280, 190], desc: 'puddles spread; the floor is slippery', slip: true,
  run(S) { S.every(0.9 / S.d, () => { const x = rand(-hw() + 20, hw() - 20), y = rand(-hh() + 20, hh() - 20); shot(x, y, 0, 0, 16, '#7fc8ff', { warn: 0.8, life: 2.4, fn: (b) => { if (b.age > 0.8) b.r = 16 + (b.age - 0.8) * 9; } }); }, 0.3, 6);
    S.every(0.6, () => { const a = rand(0, 6.283); shot(Math.cos(a) * 180, Math.sin(a) * 180, -Math.cos(a) * 70, -Math.sin(a) * 70, 4, '#cfe8ff'); }, 0.5, 6.4); } };
A.bucket = { name: 'Bucket', dur: 7, size: [300, 190], desc: 'a wave of suds sloshes across; skate through the gap', slip: true,
  run(S) { let gy = 0; S.every(1.4 / S.d, n => { const side = n % 2; gy = clamp(gy + rand(-50, 50), -hh() + 40, hh() - 40); wallPair(side ? hw() + 10 : -hw() - 10, (side ? -1 : 1) * 110, gy, 42, '#cfe8ff'); }, 0.2, 6);
    S.every(0.35, () => shot(rand(-hw(), hw()), -hh() - 8, 0, 70, 3.5, '#9ad8ff'), 0.5, 6.4); } };
/* MERIDIAN's encore: Pendulum Rain again, but gentle. It can't hurt you. It's a lullaby. */
A.oneMore = { name: 'One More Minute', dur: 9, size: [300, 200], desc: 'the first song.',
  run(S) { S.every(0.6, () => { const gc = Math.sin(S.t * 1.0) * hw() * 0.6; for (let x = -hw() + 10; x < hw(); x += 30) if (Math.abs(x - gc) > 40) shot(x, -hh() - 10, 0, 70, 4, '#ffe7a8', { soft: true }); }, 0.5, 7.6); } };
for (const k in A) A[k].id = k;
