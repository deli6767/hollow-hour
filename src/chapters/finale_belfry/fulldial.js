/* v2.0.3 FULL DIAL (Delon: "one of the bosses (prob meridian) uses the FULL screen").
   MERIDIAN's very last move: right after TIME'S UP (attack 16, end of phase 5 / LAST SECOND) the box blooms out to the whole
   battle screen and the soul can go anywhere on it. His twelve hour marks ring the rim and fire on the beat, a long minute hand
   sweeps from the middle (keep out of its reach), loose seconds fall. Then the dial clears and the box shrinks back, and he is spent.
   Every route gets it, with that route's phase-5 layer on top (twelve: its own minute hand replaces the sweep). No banner.
   It takes TIME'S UP's follow-up slot (that was Aftershock; Aftershock still follows attacks 10 and 13). Practice/tests: window.hhFullDial. */
const FD_W = W - 16, FD_H = H - 16;
const FULL_DIAL = { name: 'Full Dial', dur: 11, size: [300, 210], full: true, ts: 1.2,
  desc: 'the whole screen is the clock face. hours fire from the rim; a long hand sweeps from the middle',
  run(S) { const v = typeof hhMerV5 === 'function' ? hhMerV5(B) : null, fw = FD_W / 2, fh = FD_H / 2;
    const mark = n => { const a = -Math.PI / 2 + (n % 12) * Math.PI / 6; return [Math.cos(a) * (fw - 24), Math.sin(a) * (fh - 24)]; };
    S.at(0.2, () => { arena.k = 2.6; setArena(FD_W, FD_H); sfx('phase'); shake(10, 0.6); if (B) B.flash = 0.35; });
    S.at(1.0, () => { for (let n = 0; n < 12; n++) { const [x, y] = mark(n); shot(x, y, 0, 0, 7, '#c8a050', { soft: true, life: 8.2, noCull: true }); } });
    S.every(0.5, n => { sfx(n % 2 ? 'tock' : 'tick'); for (const k of [n, n + 4, n + 8]) { const [x, y] = mark(k), a0 = Math.atan2(P.y - y, P.x - x); /* three hours at a time, 4 apart */
      for (const da of [-0.26, 0, 0.26]) shot(x, y, Math.cos(a0 + da) * 125 * S.d, Math.sin(a0 + da) * 125 * S.d, 5, '#ff4455', { warn: 0.55 }); } }, 1.7, 8.3);
    if (v !== 'twelve') S.at(1.8, () => { laser(0, 0, rand(0, 6.283), 12, 1.0, 6.8, { av: 0.5, len: 200, col: '#e070ff' }); sfx('warn'); });
    S.every(0.3 / S.d, () => shot(rand(-fw + 20, fw - 20), -fh - 8, 0, 95 * S.d, 4, '#ffe7a8'), 2.0, 8.3);
    if (v && typeof MER_V5 !== 'undefined' && MER_V5[v]) MER_V5[v](S, 15, Object.assign({}, FULL_DIAL, { dur: 9.3 })); /* the route layer winds down before the dial clears (no hammer burst after it) */
    S.at(9.3, () => { clearBullets(true); sfx('bell'); shake(6, 0.4); arena.k = 4.5; setArena(300, 210); }); /* shrink a bit quicker than the bloom */
    S.at(10.9, () => { arena.k = 0; });
  } };
FULL_DIAL.id = 'fullDial';
window.hhFullDial = FULL_DIAL;
function hhMerFullChain(b, idx) { return b && b.mer && !(b.opts && b.opts.practice) && idx === MER_ATTACKS.length - 1 ? FULL_DIAL : null; }
