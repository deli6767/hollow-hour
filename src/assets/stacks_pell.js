/* Stacks bookshelf + Pell polish + Pell motif. Add ons, for Hollow Hour. Load after 30_art.js, 00_core.js and weightworks.js. */

/* hhShelf(x, y, t, e): drop-in for the ucshelf look. Same footprint as before (about x-42..x+40, y-26..y-4).
   Posts sit OUTSIDE the backing (no overlap), top cap and base board overhang both, books vary in height,
   open quests get a bookmark ribbon, done quests get a gilt spine band. */
function hhShelf(x, y, t, e) {
  const qs = QUESTS.filter(q => q.chapter === e.n), L = x - 42, R = x + 40, T = y - 28, B = y - 4;
  ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.fillRect(L + 2, B, R - L, 3);                  // floor shadow
  ctx.fillStyle = '#2a1e1a'; ctx.fillRect(L + 4, T + 3, R - L - 8, B - T - 5);          // backing, inset between posts
  ctx.fillStyle = 'rgba(255,255,255,.03)'; for (let i = 0; i < 4; i++) ctx.fillRect(L + 4, T + 6 + i * 5, R - L - 8, 1); // plank grain
  ctx.fillStyle = '#5a4234'; ctx.fillRect(L, T + 2, 4, B - T - 2); ctx.fillRect(R - 4, T + 2, 4, B - T - 2); // posts
  ctx.fillStyle = '#7a5a44'; ctx.fillRect(L, T + 2, 1, B - T - 2); ctx.fillRect(R - 4, T + 2, 1, B - T - 2);   // post highlights
  ctx.fillStyle = '#6a4e3c'; ctx.fillRect(L - 2, T, R - L + 4, 3);                      // top cap
  ctx.fillStyle = '#8a6a50'; ctx.fillRect(L - 2, T, R - L + 4, 1);
  for (let i = 0; i < 6; i++) {
    const q = qs[i], bx = L + 6 + i * 12, hgt = 13 + ((i * 7 + e.n * 3) % 4), by = B - 3 - hgt;
    const col = !q ? '#3a3040' : q.done() ? '#c8a050' : q.stage() ? '#b0a0d8' : '#7a6a78';
    if (!q) { ctx.fillStyle = 'rgba(160,140,170,.08)'; ctx.fillRect(bx, B - 6, 9, 1); continue; } // empty slot: just dust
    ctx.fillStyle = col; ctx.fillRect(bx, by, 9, hgt);
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(bx + 7, by, 2, hgt);                // spine shade
    ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(bx + 1, by + 1, 1, hgt - 2);
    if (q.done()) { ctx.fillStyle = '#ffe6a0'; ctx.fillRect(bx, by + 3, 9, 1); ctx.fillRect(bx, by + hgt - 4, 9, 1); }
    else if (q.stage()) { const s = Math.sin(t * 2 + i) * 0.6; ctx.fillStyle = '#d84a6a'; ctx.fillRect(bx + 3, by - 4, 2, 5 + s); } // bookmark
  }
  ctx.fillStyle = '#6a4e3c'; ctx.fillRect(L - 2, B - 3, R - L + 4, 3);                  // base board
  ctx.fillStyle = '#8a6a50'; ctx.fillRect(L - 2, B - 3, R - L + 4, 1);
  ctx.fillStyle = '#c8b088'; ctx.fillRect(x - 8, B - 2, 14, 2);                          // label plate
}

/* Pell, polished: same size and anchor as the old sprite. Rounder body, wing, tail, feathered crest,
   proper beak with highlight, cheek blush, and the red stage ribbon now a scarf with a trailing end. */
function hhDrawPell(x, y, t) {
  const b = Math.sin(t * 2.2) * 1.2, bl = blinkAt(t, x), hop = Math.max(0, Math.sin(t * 1.1)) > 0.995 ? -2 : 0, Y = y + hop;
  ell(x, y + 1, 12, 4, 'rgba(0,0,0,.3)');
  ctx.fillStyle = '#6a4a30'; ctx.fillRect(x - 4, Y - 6, 2, 6); ctx.fillRect(x + 2, Y - 6, 2, 6);  // legs
  ctx.fillRect(x - 6, Y - 1, 5, 1); ctx.fillRect(x + 1, Y - 1, 5, 1);                              // toes
  poly([x - 9, Y - 14 + b, x - 17, Y - 9 + b, x - 15, Y - 6 + b, x - 8, Y - 10 + b], '#7a4e2c');   // tail
  ell(x, Y - 16 + b, 11, 11, '#b07a4a');                                                           // body
  ell(x - 3, Y - 18 + b, 6, 4, 'rgba(255,230,190,.18)');                                          // body sheen
  ell(x + 2, Y - 12 + b, 6, 7, '#e8d0a8');                                                         // belly
  for (let i = 0; i < 3; i++) ctx.fillStyle = '#d0b48a', ctx.fillRect(x - 1 + i * 2, Y - 14 + b + i * 3, 3, 1); // belly bars
  ell(x - 5, Y - 15 + b + Math.sin(t * 5) * 0.4, 6, 4, '#8a5a34', -0.4);                         // wing
  poly([x + 9, Y - 22 + b, x + 18, Y - 20 + b, x + 9, Y - 17 + b], '#e8a030');                    // beak
  ctx.fillStyle = '#ffd070'; ctx.fillRect(x + 10, Y - 21 + b, 5, 1);
  eyes(x + 3, Y - 22 + b, 3, 1.6, '#2a1a10', bl);
  circ(x + 7, Y - 18 + b, 1.6, 'rgba(230,110,120,.45)');                                          // blush
  poly([x - 6, Y - 26 + b, x - 3, Y - 35 + b, x, Y - 27 + b], '#7a4a2a');                         // crest
  poly([x - 2, Y - 26 + b, x + 2, Y - 32 + b, x + 3, Y - 26 + b], '#8a5a34');
  ctx.fillStyle = '#c84a6a'; ctx.fillRect(x - 8, Y - 9 + b, 16, 3);                              // scarf
  poly([x - 7, Y - 8 + b, x - 11, Y - 2 + b + Math.sin(t * 3) , x - 8, Y - 2 + b], '#a83a58');
}

/* Pell's motif: a hesitant cuckoo call that keeps almost finishing. Built off Madame Cuckoo's E root
   so the duet can layer under/over 'cuckoo'. setTrack('pell') for the solo; setTrack('pell_duet') for the duet,
   where the missing answer note finally lands on the last bar. */
(function () {
  const _ = null;
  TRACKS.pell = { bpm: 92, root: 52, bt: 'sine', lt: 'triangle', lv: 0.12, kick: 0, hat: 0,
    bass: [0, _, _, _, _, _, _, _, 5, _, _, _, _, _, _, _, 0, _, _, _, _, _, _, _, 7, _, _, _, _, _, _, _],
    lead: [19, _, 16, _, _, _, _, _, 19, _, 16, _, 19, _, _, _, 21, _, 19, _, 16, _, 14, _, 16, _, _, _, _, _, _, _] };
  TRACKS.pell_duet = { bpm: 92, root: 52, bt: 'triangle', lt: 'triangle', lv: 0.12, kick: 0, hat: 1,
    bass: [0, _, 7, _, 12, _, 7, _, 5, _, 12, _, 17, _, 12, _, 0, _, 7, _, 12, _, 7, _, 7, _, 14, _, 19, _, 14, _],
    lead: [19, _, 16, _, 24, _, 19, _, 19, _, 16, _, 19, _, 24, _, 21, _, 19, _, 16, _, 14, _, 12, _, 16, _, 19, _, 24, _] };
})();
