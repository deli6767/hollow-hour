/* v1.8-c14 M4-D1: MERIDIAN phase-5 (LAST SECOND) variant per route (Delon approved Oct 29).
   One telegraphed layer on top of attacks 12-15, picked from the run. No banners, no new lore: the phase-5 intro gets one
   existing callback line (50_callbacks.js). Practice / boss rush keep the plain phase 5 (opts.v5 forces one, for tests).
     peace   KEPT TIME          slow gold pendulum rows (the first song); under the finale they turn soft (a lullaby)
     one     ONE STOPPED CLOCK  a single grey "1" clock follows you, slower than a 60%-speed player
     mixed   CAN'T DECIDE       two short hands spin opposite ways round the centre (keep off the middle)
     violent LITTLE HAMMER      a countdown bomb lands where you stand every 2.6 s (3.0 s in the finale, 3.4 s in Midnight); Midnight gets the Aftershock chain too
     twelve  ONE MINUTE PAST    one long minute hand starts at 12:01 and sweeps clockwise (run ahead of it); finale lullaby */
const MER_V5_NAMES = { peace: 'KEPT TIME', one: 'ONE STOPPED CLOCK', mixed: "CAN'T DECIDE", violent: 'LITTLE HAMMER', twelve: 'ONE MINUTE PAST' };
const MER_V5_CB = { violent: 'count', twelve: 'ticket' }; // reserved callback for the phase-5 intro (kept out of phases 1-2)
function hhMerV5(b) {
  if (!b || !b.mer) return null; if (b.opts && b.opts.v5) return b.opts.v5; if (b.opts && (b.opts.practice || b.opts.rush)) return null;
  if (b.mer.v5) return b.mer.v5; const r = route(), F = hero.flags;
  return b.mer.v5 = r === 'peace' ? (F.showTicket && F.ws_visited ? 'twelve' : 'peace') : r === 'mixed' && hero.kills === 1 ? 'one' : r; }
const pendRows = (S, from, to, soft) => S.every(1.35, () => { const gc = Math.sin(S.t * 0.9) * hw() * 0.55;
  for (let x = -hw() + 10; x < hw(); x += 30) if (Math.abs(x - gc) > 56) shot(x, -hh() - 10, 0, 56, 4, '#ffe7a8', soft ? { soft: true } : {}); }, from, to);
// like bomb(), but it lands on you, so the shell is harmless until it bursts (fair: 1.5 s countdown to step off)
const hammer = (S, x, y, n, sp, fuse) => { shot(x, y, 0, 0, 9, '#c84a3a', { soft: true, life: fuse, label: bb => String(Math.max(1, Math.ceil(fuse - bb.age))) }); sfx('tick');
  S.at(S.t + fuse, () => { sfx('hit'); const a0 = rand(0, 6.283); for (let k = 0; k < n; k++) { const q = a0 + k * 6.283 / n; shot(x, y, Math.cos(q) * sp, Math.sin(q) * sp, 4.5, '#c84a3a'); } }); };
const MER_V5 = {
  peace(S, i, a) { pendRows(S, 1.0, a.dur - 2.2, i === 15); },
  twelve(S, i, a) { S.at(0.6, () => { laser(0, 0, -Math.PI / 2 + 0.105, 8, 1.0, a.dur - 1.8, { av: 0.42, len: 220, col: '#ffe7a8' }); sfx('warn'); }); if (i === 15) pendRows(S, 1.0, a.dur - 2.2, true); },
  one(S, i, a) { S.at(0.8, () => { const cs = [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, y]) => [x * (hw() - 16), y * (hh() - 16)]); cs.sort((p, q) => Math.hypot(q[0] - P.x, q[1] - P.y) - Math.hypot(p[0] - P.x, p[1] - P.y));
    shot(cs[0][0], cs[0][1], 0, 0, 8, '#b0a8b8', { warn: 0.9, home: 2.2, spd: 72, life: a.dur - 1.2, label: () => '1' }); sfx('warn'); }); },
  mixed(S, i, a) { S.at(0.5, () => { const a0 = rand(0, 6.283); laser(0, 0, a0, 8, 0.8, a.dur - 1.6, { av: 0.55, len: 70, col: '#ffcc55' }); laser(0, 0, a0 + Math.PI, 8, 0.8, a.dur - 1.6, { av: -0.4, len: 70, col: '#ff6677' }); sfx('warn'); }); },
  violent(S, i, a) { S.every(i === 14 ? 3.4 : i === 15 ? 3.0 : 2.6, () => hammer(S, clamp(P.x, -hw() + 14, hw() - 14), clamp(P.y, -hh() + 14, hh() - 14), 8, 88 * S.d, 1.5), 1.2, a.dur - 2.5); }, // Midnight also chains Aftershock -> fewer hammers there
};
for (let i = 12; i < MER_ATTACKS.length; i++) { const a = MER_ATTACKS[i], base = a.run;
  a.run = function (S) { const r = base.call(this, S); const v = hhMerV5(B); if (v && MER_V5[v]) MER_V5[v](S, i, a); return r; }; }
const hhMerV5Chain = (b, idx) => MER_ATTACKS[idx] && MER_ATTACKS[idx].phase === 4 && hhMerV5(b) === 'violent' ? MER_CHAIN[0] : null;
{ const base = hhMerCb; hhMerCb = (b, phase) => {
    if (!b || !b.mer || (b.opts && (b.opts.practice || b.opts.rush))) return base(b, phase);
    const v = hhMerV5(b), m = b.mer, res = MER_V5_CB[v]; m.cbUsed = m.cbUsed || [];
    if (phase === 0 && res && !m.cbUsed.includes(res)) m.cbUsed.push(res); // reserve it for phase 5
    if (phase !== 4) return base(b, phase);
    const F = hero.flags, own = res && MER_CB_CH.find(c => c[0] === res && c[1](F)); if (own) return own[2];
    const pool = MER_CB_CH.filter(c => !m.cbUsed.includes(c[0]) && c[1](F)); if (!pool.length) return null;
    const c = pool[Math.floor(Math.random() * pool.length)]; m.cbUsed.push(c[0]); return c[2]; }; }
