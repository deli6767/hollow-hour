/* ===================== ART (all procedural) ===================== */
function circ(x, y, r, col) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill(); }
function ell(x, y, rx, ry, col, rot = 0) { ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, 6.283); ctx.fill(); }
function rrect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function poly(pts, col) { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]); ctx.closePath(); ctx.fill(); }
function line(x1, y1, x2, y2, col, w = 2) { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
function eyes(x, y, sep, r, col = '#1a1020', blink = false, lx = 0, ly = 0) {
  for (const s of [-1, 1]) { if (blink) { line(x + s * sep - r, y, x + s * sep + r, y, col, 2); continue; } circ(x + s * sep, y, r, col); circ(x + s * sep + lx + r * 0.3, y + ly - r * 0.35, r * 0.35, '#fff'); }
}
function gear(x, y, r, teeth, rot, col, hole = '#000') {
  ctx.fillStyle = col; ctx.beginPath();
  for (let i = 0; i < teeth * 2; i++) { const a = rot + i / (teeth * 2) * 6.283, rr = i % 2 ? r : r * 1.22; const a2 = a + 6.283 / (teeth * 2); ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); ctx.lineTo(x + Math.cos(a2) * rr, y + Math.sin(a2) * rr); }
  ctx.closePath(); ctx.fill(); if (hole) circ(x, y, r * 0.38, hole);
}
const blinkAt = (t, seed = 0) => ((t + seed * 1.7) % 3.6) < 0.12;
/* ---- the player's battle avatar: a wound-up spark core ---- */
function drawCore(x, y, t, heavy, flash) {
  const col = flash ? '#fff' : heavy ? '#5aa8ff' : '#ff9a3c';
  ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 12;
  gear(x, y, 6.6, 7, t * (heavy ? 1 : 3), heavy ? '#a8c8e8' : '#e8c070', null);
  circ(x, y, 4.6, col); circ(x - 1.2, y - 1.4, 1.6, '#fff8e0');
  ctx.restore();
}
/* ---- overworld hero: a little spark-kid with an ember head and a long scarf ---- */
function drawHero(x, y, dir, walk, t) {
  const bob = walk ? Math.abs(Math.sin(walk * 9)) * 2 : 0, leg = walk ? Math.sin(walk * 9) * 3 : 0;
  ell(x, y + 1, 10, 4, 'rgba(0,0,0,.3)');
  // scarf tail
  const sx = dir === 1 ? -1 : dir === 3 ? 1 : 0; ctx.fillStyle = '#e8553a';
  ctx.beginPath(); ctx.moveTo(x - 3, y - 20 - bob); ctx.quadraticCurveTo(x + sx * 12 + Math.sin(t * 6) * 3, y - 18, x + sx * 14 + Math.sin(t * 7) * 4, y - 10); ctx.lineTo(x + sx * 10, y - 9); ctx.quadraticCurveTo(x + sx * 6, y - 15, x + 3, y - 18 - bob); ctx.fill();
  // legs + coat
  ctx.fillStyle = '#2b2440'; ctx.fillRect(x - 6, y - 7, 4, 7 + leg * 0.5); ctx.fillRect(x + 2, y - 7, 4, 7 - leg * 0.5);
  ctx.fillStyle = '#3a4a8a'; rrect(x - 8, y - 20 - bob, 16, 14, 4); ctx.fill();
  circ(x, y - 14 - bob, 1.4, '#ffd36e'); circ(x, y - 10 - bob, 1.4, '#ffd36e');
  ctx.fillStyle = '#e8553a'; ctx.fillRect(x - 8, y - 22 - bob, 16, 4);
  // ember head
  const hy = y - 30 - bob, fl = Math.sin(t * 12) * 1.5;
  ctx.save(); ctx.shadowColor = '#ffb347'; ctx.shadowBlur = 10;
  poly([x - 6, hy - 4, x + Math.sin(t * 9) * 2, hy - 17 - fl, x + 6, hy - 4], '#ffcf5a');
  circ(x, hy, 9, '#ffb347'); ctx.restore(); circ(x, hy + 1, 7, '#ffd98a');
  if (dir !== 0) { const ex = dir === 1 ? 3 : dir === 3 ? -3 : 0; eyes(x + ex, hy + 1, 3, 1.6, '#3a1a0a', blinkAt(t)); }
}
/* ---- NPCs ---- */
function drawNPC(kind, x, y, t, look = 0) {
  const b = Math.sin(t * 2.2) * 1.2, bl = blinkAt(t, x);
  ell(x, y + 1, 12, 4, 'rgba(0,0,0,.3)');
  switch (kind) {
    case 'tolly': { // old tortoise with a pocket-watch shell
      ell(x - 10, y - 4, 4, 4, '#7a9a5a'); ell(x + 10, y - 4, 4, 4, '#7a9a5a');
      ell(x, y - 12, 16, 12, '#b8893a'); ell(x, y - 13, 12, 9, '#ece0c4');
      line(x, y - 13, x, y - 20, '#3a2a14', 2); line(x, y - 13, x + 5, y - 13, '#3a2a14', 2);
      circ(x + 15, y - 18 + b, 6, '#8aaa6a'); eyes(x + 16, y - 19 + b, 2, 1.2, '#222', bl); line(x + 12, y - 24 + b, x + 20, y - 24 + b, '#ddd', 2); break; }
    case 'tess': { // tinker mouse with goggles
      ell(x, y - 10, 10, 11, '#9a8a9a'); ctx.fillStyle = '#5a3a2a'; ctx.fillRect(x - 9, y - 12, 18, 8);
      circ(x, y - 26 + b, 9, '#aa9aaa'); circ(x - 8, y - 33 + b, 5, '#aa9aaa'); circ(x + 8, y - 33 + b, 5, '#aa9aaa'); circ(x - 8, y - 33 + b, 3, '#e8b8c8'); circ(x + 8, y - 33 + b, 3, '#e8b8c8');
      circ(x - 4, y - 28 + b, 3.5, '#ffd36e'); circ(x + 4, y - 28 + b, 3.5, '#ffd36e'); circ(x - 4, y - 28 + b, 2, bl ? '#ffd36e' : '#223'); circ(x + 4, y - 28 + b, 2, bl ? '#ffd36e' : '#223'); circ(x, y - 22 + b, 1.5, '#e88'); break; }
    case 'bun': { // rabbit baker
      ell(x, y - 11, 11, 12, '#f0e6d8'); ctx.fillStyle = '#fff'; ctx.fillRect(x - 8, y - 16, 16, 12);
      circ(x, y - 27 + b, 9, '#f0e6d8'); ell(x - 4, y - 42 + b, 3, 9, '#f0e6d8', -0.2); ell(x + 5, y - 41 + b, 3, 9, '#f0e6d8', 0.4);
      eyes(x, y - 28 + b, 3.5, 1.5, '#422', bl); circ(x, y - 24 + b, 1.4, '#e89'); break; }
    case 'pip': { // tiny moth kid
      const f = Math.sin(t * 10) * 0.3; ell(x - 9, y - 18, 8, 6, '#d8c8f0', -0.5 + f); ell(x + 9, y - 18, 8, 6, '#d8c8f0', 0.5 - f);
      ell(x, y - 14 + b, 7, 10, '#f0e8ff'); eyes(x, y - 18 + b, 3, 1.6, '#333', bl); line(x - 2, y - 26 + b, x - 6, y - 32 + b, '#888', 1.5); line(x + 2, y - 26 + b, x + 6, y - 32 + b, '#888', 1.5); break; }
    case 'rivet': { // tin soldier
      ctx.fillStyle = '#3a5aa8'; ctx.fillRect(x - 8, y - 22, 16, 16); ctx.fillStyle = '#ddd'; ctx.fillRect(x - 6, y - 6, 4, 6); ctx.fillRect(x + 2, y - 6, 4, 6);
      circ(x, y - 28, 7, '#e8d0b0'); ctx.fillStyle = '#222'; ctx.fillRect(x - 7, y - 44, 14, 13); eyes(x, y - 28, 3, 1.3, '#222', bl);
      line(x - 3, y - 24, x + 3, y - 24, '#a33', 2); circ(x + 13, y - 20, 2, '#ffd36e'); line(x + 13, y - 18, x + 13, y - 4, '#ccc', 2); break; }
    case 'lumen': { // lamp-post lady
      ctx.fillStyle = '#2a2a3a'; ctx.fillRect(x - 2, y - 30, 4, 30); ctx.fillRect(x - 7, y - 3, 14, 3);
      ctx.save(); ctx.shadowColor = '#ffe8a0'; ctx.shadowBlur = 18; poly([x - 9, y - 32, x + 9, y - 32, x + 6, y - 48, x - 6, y - 48], '#ffe8a0'); ctx.restore();
      poly([x - 11, y - 48, x + 11, y - 48, x, y - 56], '#2a2a3a'); eyes(x, y - 40, 3, 1.4, '#553', bl); break; }
    case 'sprocket': { // little worker bot
      ctx.fillStyle = '#c8a050'; rrect(x - 10, y - 22, 20, 18, 4); ctx.fill(); ctx.fillStyle = '#555'; ctx.fillRect(x - 7, y - 4, 4, 4); ctx.fillRect(x + 3, y - 4, 4, 4);
      ctx.fillStyle = '#ddd'; rrect(x - 8, y - 38 + b, 16, 14, 3); ctx.fill(); ctx.fillStyle = '#5ee7ff'; ctx.fillRect(x - 5, y - 34 + b, 3, bl ? 1 : 4); ctx.fillRect(x + 2, y - 34 + b, 3, bl ? 1 : 4);
      gear(x, y - 42 + b, 4, 6, t * 2, '#888', '#ddd'); break; }
    case 'hush': { // ghostly choir kid
      ctx.globalAlpha = 0.85; ctx.fillStyle = '#e8e8ff'; ctx.beginPath(); ctx.arc(x, y - 24 + b, 11, Math.PI, 0); ctx.lineTo(x + 11, y - 6 + b);
      for (let i = 0; i < 4; i++) ctx.lineTo(x + 11 - (i + 0.5) * 5.5, y - 6 + b + (i % 2 ? -3 : 3)); ctx.lineTo(x - 11, y - 6 + b); ctx.fill(); ctx.globalAlpha = 1;
      eyes(x, y - 24 + b, 4, 1.8, '#557', bl); ell(x, y - 18 + b, 2.5, 3, '#557'); ctx.fillStyle = '#a33'; ctx.fillRect(x - 6, y - 14 + b, 12, 3); break; }
    case 'mopsley': drawMopsley(x, y, t, true); break;
    case 'mini': { const e = ENEMIES[look]; if (e) { ctx.save(); ctx.translate(x, y); ctx.scale(e.mini || 0.3, e.mini || 0.3); ART[e.art](0, -60, t, { hurt: 0, eye: '#fff' }); ctx.restore(); } break; }
  }
}
/* ---- battle enemies (drawn around (x,y); s = {hurt, calm}) ---- */
const ART = {};
ART.mothwick = (x, y, t, s) => {
  const f = Math.sin(t * 9) * 0.35;
  for (const sd of [-1, 1]) { ell(x + sd * 44, y - 20, 42, 26, '#cbb8ec', sd * (0.5 - f)); ell(x + sd * 40, y + 14, 26, 16, '#b8a0dc', sd * (-0.4 + f)); circ(x + sd * 50, y - 22, 9, '#8a6ab8'); circ(x + sd * 50, y - 22, 4, '#ffd36e'); }
  ctx.fillStyle = '#f6eed8'; rrect(x - 20, y - 36, 40, 80, 10); ctx.fill();
  ctx.fillStyle = '#fff8e8'; ctx.fillRect(x - 14, y - 34, 6, 70); poly([x + 6, y - 36, x + 14, y - 36, x + 12, y - 16, x + 8, y - 22], '#fff8e8');
  ctx.save(); ctx.shadowColor = '#ffb347'; ctx.shadowBlur = 20; const fl = Math.sin(t * 13) * 3;
  poly([x - 8, y - 40, x + Math.sin(t * 7) * 3, y - 70 - fl, x + 8, y - 40], '#ffb347'); poly([x - 4, y - 40, x, y - 58 - fl, x + 4, y - 40], '#fff3c4'); ctx.restore();
  eyes(x, y - 8, 8, 4, '#2a1a3a', blinkAt(t)); ctx.strokeStyle = '#2a1a3a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y + 4, 5, 0.3, 2.8); ctx.stroke();
};
ART.rustpup = (x, y, t, s) => {
  const wag = Math.sin(t * 14) * 0.6, hop = Math.abs(Math.sin(t * 3)) * 6;
  ctx.save(); ctx.translate(x + 48, y + 10 - hop); ctx.rotate(-0.8 + wag); ctx.fillStyle = '#9a9aa8'; ctx.fillRect(-3, -30, 6, 30); gear(0, -32, 6, 6, t * 4, '#aab', '#555'); ctx.restore();
  ell(x, y + 14 - hop, 48, 28, '#c46a32'); ell(x - 10, y + 22 - hop, 30, 14, '#d88a4a');
  for (const lx of [-30, -12, 14, 32]) { ctx.fillStyle = '#8a4a22'; ctx.fillRect(x + lx - 5, y + 30 - hop, 10, 22 + hop); }
  for (const rv of [[-20, 2], [6, -4], [24, 8]]) circ(x + rv[0], y + rv[1] - hop, 3, '#7a3a1a');
  const hx = x - 46, hy = y - 22 - hop;
  poly([hx - 22, hy - 6, hx - 30, hy - 36, hx - 6, hy - 18], '#8a4a22'); poly([hx + 22, hy - 6, hx + 26, hy - 36, hx + 6, hy - 18], '#8a4a22');
  circ(hx, hy, 26, '#d0783a'); ell(hx - 4, hy + 12, 16, 11, '#e8a070'); circ(hx - 6, hy + 6, 5, '#2a1a10');
  eyes(hx + 2, hy - 6, 9, 4, '#2a1a10', blinkAt(t)); ell(hx - 2, hy + 22, 5, 7 + Math.sin(t * 8), '#e85a6a');
};
ART.tocklet = (x, y, t, s) => {
  const hop = Math.abs(Math.sin(t * 5)) * 10, yy = y - hop;
  line(x - 18, y + 30, x - 22, y + 50, '#3a2a14', 5); line(x + 18, y + 30, x + 22, y + 50, '#3a2a14', 5); ell(x - 24, y + 52, 9, 4, '#3a2a14'); ell(x + 24, y + 52, 9, 4, '#3a2a14');
  gear(x, yy, 46, 12, t * 0.6, '#b8893a', null); circ(x, yy, 40, '#f2e6c8');
  for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; line(x + Math.cos(a) * 32, yy + Math.sin(a) * 32, x + Math.cos(a) * 37, yy + Math.sin(a) * 37, '#3a2a14', 2); }
  const a1 = t * 3, a2 = t * 0.25; line(x, yy, x + Math.cos(a1) * 70, yy + Math.sin(a1) * 70, '#3a2a14', 4); line(x, yy, x + Math.cos(a2) * 22, yy + Math.sin(a2) * 22, '#3a2a14', 5);
  circ(x + Math.cos(a1) * 72, yy + Math.sin(a1) * 72, 7, '#f2ecdf');
  eyes(x, yy - 10, 12, 6, '#1a1020', blinkAt(t)); ctx.strokeStyle = '#1a1020'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, yy + 8, 14, 0.2, Math.PI - 0.2); ctx.stroke();
  poly([x - 8, yy + 20, x - 4, yy + 26, x, yy + 20], '#fff'); poly([x + 2, yy + 20, x + 6, yy + 26, x + 10, yy + 20], '#fff');
};
ART.boltbeetle = (x, y, t, s) => {
  const sq = Math.sin(t * 6), yy = y + sq * 6;
  for (const lx of [-34, 0, 34]) { ctx.strokeStyle = '#9aa'; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i <= 8; i++) ctx.lineTo(x + lx + (i % 2 ? 7 : -7), yy + 20 + i * (4 + sq * 0.8)); ctx.stroke(); }
  ctx.fillStyle = '#3a8a4a'; ctx.beginPath(); ctx.arc(x, yy + 18, 60, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#5ab86a'; ctx.beginPath(); ctx.arc(x, yy + 18, 50, Math.PI, 0); ctx.fill(); line(x, yy - 32, x, yy + 18, '#2a6a3a', 4);
  for (const sp of [[-26, -10], [24, -14], [-10, -26], [14, 2]]) circ(x + sp[0], yy + sp[1], 5, '#9ae0a8');
  circ(x - 64, yy + 8, 18, '#2a5a3a'); eyes(x - 66, yy + 4, 6, 3.5, '#fff', blinkAt(t)); circ(x - 72, yy + 4, 1.5, '#000'); circ(x - 60, yy + 4, 1.5, '#000');
  line(x - 70, yy - 8, x - 84, yy - 30, '#2a5a3a', 2); line(x - 62, yy - 8, x - 56, yy - 32, '#2a5a3a', 2); circ(x - 84, yy - 30, 3, '#ffd36e'); circ(x - 56, yy - 32, 3, '#ffd36e');
};
ART.kettlewisp = (x, y, t, s) => {
  const wob = Math.sin(t * 2) * 8;
  ctx.globalAlpha = 0.8; for (let i = 0; i < 5; i++) { const a = t * 1.5 + i; circ(x + Math.sin(a) * 10 + wob * (i / 5), y - 50 - i * 16, 16 - i * 2, '#e8f0f8'); } ctx.globalAlpha = 1;
  eyes(x + wob, y - 70, 9, 4, '#4a5a7a', blinkAt(t)); ell(x + wob, y - 56, 5, 4, '#4a5a7a');
  ell(x, y + 24, 54, 40, '#6a8aa8'); ell(x - 12, y + 12, 18, 12, '#8aaac8');
  ctx.fillStyle = '#6a8aa8'; ctx.beginPath(); ctx.moveTo(x + 40, y + 20); ctx.quadraticCurveTo(x + 82, y + 16, x + 84, y - 14); ctx.lineTo(x + 74, y - 14); ctx.quadraticCurveTo(x + 70, y + 4, x + 40, y + 38); ctx.fill();
  ctx.strokeStyle = '#4a6a88'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(x - 56, y + 24, 20, 1.6, 4.7); ctx.stroke();
  ell(x, y - 14, 30, 7, '#4a6a88'); circ(x, y - 22, 6, '#ffd36e');
};
ART.stringling = (x, y, t, s) => {
  const sw = Math.sin(t * 2.4) * 0.25;
  ctx.fillStyle = '#6a4a2a'; ctx.fillRect(x - 60, y - 110, 120, 8);
  const pts = { hl: [x - 40, y + 4 + Math.sin(t * 3) * 14], hr: [x + 40, y + 4 + Math.cos(t * 3) * 14], fl: [x - 16, y + 70], fr: [x + 16, y + 70], h: [x + sw * 30, y - 46] };
  ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1;
  for (const [k, sx] of [['hl', -55], ['hr', 55], ['h', 0], ['fl', -25], ['fr', 25]]) { ctx.beginPath(); ctx.moveTo(x + sx, y - 104); ctx.lineTo(pts[k][0], pts[k][1]); ctx.stroke(); }
  line(x - 14, y - 10, pts.hl[0], pts.hl[1], '#c89a6a', 7); line(x + 14, y - 10, pts.hr[0], pts.hr[1], '#c89a6a', 7);
  line(x - 8, y + 30, pts.fl[0], pts.fl[1], '#c89a6a', 8); line(x + 8, y + 30, pts.fr[0], pts.fr[1], '#c89a6a', 8);
  ctx.fillStyle = '#b84a6a'; rrect(x - 20, y - 26, 40, 58, 8); ctx.fill(); for (let i = 0; i < 3; i++) circ(x, y - 14 + i * 14, 3, '#ffd36e');
  circ(pts.h[0], pts.h[1], 22, '#e8c8a0'); circ(pts.h[0] - 10, pts.h[1] + 6, 5, '#f0a0a0'); circ(pts.h[0] + 10, pts.h[1] + 6, 5, '#f0a0a0');
  eyes(pts.h[0], pts.h[1] - 4, 8, 4, '#222', false); line(pts.h[0] - 6, pts.h[1] + 10, pts.h[0] + 6, pts.h[1] + 10, '#622', 3);
  for (const lx of [-1, 1]) for (let i = 0; i < 4; i++) line(pts.h[0] + lx * (6 + i * 4), pts.h[1] - 20, pts.h[0] + lx * (12 + i * 5), pts.h[1] - 34 + i * 3, '#e86a3a', 3);
};
ART.gloomgong = (x, y, t, s) => {
  const sw = Math.sin(t * 1.6) * 0.18;
  ctx.save(); ctx.translate(x, y - 60); ctx.rotate(sw);
  line(0, -40, 0, 0, '#6a5a3a', 4); ctx.fillStyle = '#8a7ab0'; ctx.beginPath(); ctx.moveTo(-18, 10); ctx.quadraticCurveTo(-22, 50, -54, 104); ctx.lineTo(54, 104); ctx.quadraticCurveTo(22, 50, 18, 10); ctx.quadraticCurveTo(0, -6, -18, 10); ctx.fill();
  ctx.fillStyle = '#6a5a90'; ctx.fillRect(-56, 98, 112, 10); circ(0, 118 + Math.sin(t * 3) * 3, 10, '#5a4a80');
  const bl = blinkAt(t); for (const sd of [-1, 1]) { if (bl) line(sd * 16 - 6, 52, sd * 16 + 6, 52, '#2a2040', 3); else { ell(sd * 16, 52, 5, 7, '#2a2040'); circ(sd * 16 + 1, 50, 1.8, '#fff'); } line(sd * 10, 38, sd * 22, 42 - (sd > 0 ? 0 : 0), '#2a2040', 2); }
  ctx.strokeStyle = '#2a2040'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 80, 9, Math.PI + 0.4, -0.4); ctx.stroke();
  ell(-26, 68, 3, 5 + Math.sin(t * 2) * 1, '#9ad8ff'); ctx.restore();
};
ART.wicklow = (x, y, t, s) => {
  const br = Math.sin(t * 1.5) * 3;
  // shield + lance
  ctx.save(); ctx.translate(x + 74, y - 20); ctx.rotate(-0.3); ctx.fillStyle = '#c8b898'; ctx.fillRect(-4, -110, 8, 190); poly([-10, -110, 10, -110, 0, -150], '#ffe7a8'); ctx.restore();
  ctx.fillStyle = '#8a6a3a'; ctx.beginPath(); ctx.moveTo(x - 110, y - 40); ctx.lineTo(x - 50, y - 40); ctx.lineTo(x - 54, y + 30); ctx.quadraticCurveTo(x - 80, y + 70, x - 80, y + 70); ctx.quadraticCurveTo(x - 108, y + 40, x - 110, y - 40); ctx.fill();
  circ(x - 80, y, 12, '#ffd36e');
  // waxy body with drips
  ctx.fillStyle = '#f3e6c4'; rrect(x - 48, y - 50 + br, 96, 120, 14); ctx.fill();
  for (let i = 0; i < 5; i++) { const dx = -36 + i * 18, dl = 12 + ((t * 6 + i * 7) % 18); ell(x + dx, y + 70 + br + dl * 0.3, 5, 6 + dl * 0.4, '#f3e6c4'); }
  ctx.fillStyle = '#c8a050'; ctx.fillRect(x - 48, y + 6 + br, 96, 8);
  // helmet
  ctx.fillStyle = '#d8c8a8'; rrect(x - 36, y - 110 + br, 72, 64, 18); ctx.fill(); ctx.fillStyle = '#2a2018'; ctx.fillRect(x - 26, y - 86 + br, 52, 8);
  const lit = s.hurt > 0 ? 0 : 1; circ(x - 12, y - 82 + br, 3, '#ffcf5a'); circ(x + 12, y - 82 + br, 3, '#ffcf5a');
  ctx.save(); ctx.shadowColor = '#ff9a3c'; ctx.shadowBlur = 24; const fl = Math.sin(t * 11) * 4;
  poly([x - 14, y - 110 + br, x + Math.sin(t * 6) * 5, y - 170 - fl + br, x + 14, y - 110 + br], '#ff8a3c'); poly([x - 7, y - 110 + br, x, y - 145 - fl + br, x + 7, y - 110 + br], '#fff3c4'); ctx.restore();
  void lit;
};
ART.grit = (x, y, t, s) => {
  const br = Math.sin(t * 2) * 3;
  gear(x - 120, y - 40, 34, 10, t * 0.7, 'rgba(180,150,90,.5)', null); gear(x + 124, y + 10, 26, 8, -t, 'rgba(180,150,90,.5)', null);
  ell(x, y + 30, 92, 70, '#6a4a3a'); ell(x, y + 40, 60, 46, '#8a6a5a');
  ctx.fillStyle = '#e8a030'; ctx.fillRect(x - 70, y - 4, 140, 14); for (let i = -3; i <= 3; i++) ctx.fillRect(x + i * 20 - 4, y - 4, 8, 14);
  // drill arm
  ctx.save(); ctx.translate(x + 84, y + 20); ctx.rotate(-0.5 + Math.sin(t * 2) * 0.1); ctx.fillStyle = '#888'; ctx.fillRect(-10, -16, 40, 32);
  ctx.fillStyle = '#ccc'; ctx.beginPath(); ctx.moveTo(30, -16); ctx.lineTo(90, 0); ctx.lineTo(30, 16); ctx.fill();
  for (let i = 0; i < 4; i++) line(36 + i * 14 + (t * 60 % 14), -12 + i * 3, 30 + i * 14 + (t * 60 % 14), 12 - i * 3, '#777', 2); ctx.restore();
  ell(x - 80, y + 30, 26, 18, '#5a3a2a'); for (let i = 0; i < 3; i++) poly([x - 100 + i * 10, y + 40, x - 96 + i * 10, y + 56, x - 92 + i * 10, y + 40], '#ddd');
  // head
  ell(x, y - 54 + br, 60, 44, '#7a5a4a'); ell(x, y - 30 + br, 18, 12, '#e8a0a0');
  ctx.fillStyle = '#ffcc33'; ctx.beginPath(); ctx.arc(x, y - 74 + br, 50, Math.PI, 0); ctx.fill(); ctx.fillRect(x - 62, y - 76 + br, 124, 10); circ(x, y - 108 + br, 8, '#fff6a0');
  for (const sd of [-1, 1]) { circ(x + sd * 22, y - 52 + br, 14, '#555'); circ(x + sd * 22, y - 52 + br, 10, s.hurt > 0 ? '#fff' : '#9ae0ff'); circ(x + sd * 22 + 3, y - 55 + br, 3, '#fff'); }
  line(x - 8, y - 52 + br, x + 8, y - 52 + br, '#555', 4);
};
ART.cuckoo = (x, y, t, s) => {
  const pop = Math.sin(t * 1.3) * 6;
  // clock-house
  ctx.fillStyle = '#5a3a2a'; ctx.fillRect(x - 90, y - 60, 180, 150); poly([x - 110, y - 60, x, y - 140, x + 110, y - 60], '#7a4a32');
  ctx.fillStyle = '#2a1a12'; ctx.fillRect(x - 46, y - 56, 92, 74);
  for (const sd of [-1, 1]) { line(x + sd * 30, y + 90, x + sd * 30, y + 130 + Math.sin(t * 2 + sd) * 8, '#c8a050', 2); ell(x + sd * 30, y + 140 + Math.sin(t * 2 + sd) * 8, 8, 16, '#8a6a3a'); }
  circ(x, y + 50, 30, '#ece0c4'); line(x, y + 50, x + Math.cos(t) * 24, y + 50 + Math.sin(t) * 24, '#222', 2); line(x, y + 50, x, y + 34, '#222', 3);
  // the diva
  const by = y - 40 + pop; ctx.save(); ctx.translate(0, 0);
  for (let i = 0; i < 7; i++) { const a = -2.6 + i * 0.36; ell(x + Math.cos(a) * 60, by + 30 + Math.sin(a) * 30, 22, 8, i % 2 ? '#ff9ad8' : '#e070b8', a); }
  ell(x, by + 20, 38, 34, '#4a7ab8'); ell(x, by + 26, 26, 22, '#f0e0c8');
  circ(x, by - 18, 30, '#4a7ab8'); poly([x + 18, by - 22, x + 54, by - 12 + Math.sin(t * 8) * 3, x + 18, by - 6], '#ffb347');
  for (const sd of [-1, 1]) { circ(x + sd * 12 - 2, by - 22, 7, '#fff'); circ(x + sd * 12, by - 22, 3.5, '#222'); for (let k = 0; k < 3; k++) line(x + sd * 12 - 5 + k * 5, by - 29, x + sd * 12 - 8 + k * 7, by - 35, '#222', 1.5); }
  for (let i = 0; i < 3; i++) ell(x - 10 + i * 10, by - 50 - i % 2 * 6, 4, 14, '#ff9ad8', -0.4 + i * 0.4); ctx.restore();
  ctx.font = `bold 22px ${FONT}`; ctx.fillStyle = '#ff9ad8'; ctx.textAlign = 'center';
  for (let i = 0; i < 3; i++) { const a = t * 1.2 + i * 2.1; ctx.fillText('♪', x + Math.cos(a) * 120, y - 50 + Math.sin(a * 1.3) * 40); }
};
/* ---- MERIDIAN (original clockwork jester art, parameterised) ---- */
function drawMeridian(x0, y0, T, st) {
  const final = st.final;
  let x = x0 + Math.sin(T * 0.9) * 8, y = y0 + Math.sin(T * 1.7) * 5;
  if (st.hurt > 0) x += rand(-5, 5);
  if (final && !st.dead) { x += rand(-1.2, 1.2); y += rand(-1.2, 1.2); }
  const fall = st.dead || 0; y += fall * fall * 40;
  ctx.save(); ctx.globalAlpha *= clamp(1 - (fall - 1.5), 0, 1);
  const pa = Math.sin(T * 2.2) * 0.45, bx = x + Math.sin(pa) * 70, by = y + 40 + Math.cos(pa) * 70;
  ctx.strokeStyle = '#b8893a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, y + 40); ctx.lineTo(bx, by); ctx.stroke();
  circ(bx, by, 13, '#d9a645'); circ(bx, by, 6, '#7a5a20');
  ctx.fillStyle = '#4b2a66'; for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(x + i * 14 - 8, y + 36); ctx.lineTo(x + i * 14 + 8, y + 36); ctx.lineTo(x + i * 14, y + 56 - Math.abs(i) * 3); ctx.fill(); }
  for (const sd of [-1, 1]) {
    const hx = x + sd * (95 + Math.sin(T * 1.3 + sd) * 8), hy = y + 20 - (st.raise || 0) * 30 + Math.sin(T * 2 + sd * 2) * 8;
    ell(hx, hy, 17, 14, '#f2ecdf', sd * 0.3);
    for (let f = 0; f < 3; f++) ell(hx + sd * (6 + f * 5) * 0.6, hy - 14 + f * 2, 4.5, 8, '#f2ecdf', sd * 0.4);
    ctx.fillStyle = '#4b2a66'; ctx.fillRect(hx - 12, hy + 10, 24, 6);
  }
  for (const sd of [-1, 1]) {
    const tipx = x + sd * 62 + Math.sin(T * 1.8 + sd) * 6, tipy = y - 78 + Math.cos(T * 2.1 + sd) * 4;
    ctx.fillStyle = sd < 0 ? '#7a2d8a' : '#2d5a8a'; ctx.beginPath(); ctx.moveTo(x - sd * 4, y - 38); ctx.quadraticCurveTo(x + sd * 40, y - 90 + Math.sin(T * 1.8) * 3, tipx, tipy); ctx.lineTo(x + sd * 44, y - 30); ctx.fill();
    circ(tipx, tipy, 6, '#ffd36e');
  }
  circ(x, y, 50, '#b8893a'); circ(x, y, 43, final ? '#e8c8b8' : '#ece0c4');
  if (final) { ctx.strokeStyle = 'rgba(255,60,80,.5)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 54 + Math.sin(T * 8) * 2, 0, 6.283); ctx.stroke(); }
  ctx.strokeStyle = '#3a2a14'; ctx.lineWidth = 2;
  for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283, r1 = i % 3 ? 38 : 34; line(x + Math.cos(a) * r1, y + Math.sin(a) * r1, x + Math.cos(a) * 41, y + Math.sin(a) * 41, '#3a2a14', 2); }
  const crack = [[18, -40, 8, -22, 14, -8], [-30, -28, -14, -18, -20, 0], [34, 20, 18, 14, 22, 30], [-36, 18, -20, 24, -10, 40], [0, 43, 4, 28, -6, 18]];
  ctx.lineWidth = 1.5; ctx.strokeStyle = '#3a2a14';
  for (let i = 0; i < Math.min(crack.length, st.cracks || 0); i++) { const c = crack[i]; ctx.beginPath(); ctx.moveTo(x + c[0], y + c[1]); ctx.lineTo(x + c[2], y + c[3]); ctx.lineTo(x + c[4], y + c[5]); ctx.stroke(); }
  const bl = blinkAt(T), eye = st.eye || '#fff';
  for (const sd of [-1, 1]) {
    ell(x + sd * 16, y - 10, 9, bl ? 1.5 : 11, '#1a1020');
    if (!bl) { ctx.save(); ctx.fillStyle = eye; ctx.shadowColor = eye; ctx.shadowBlur = 12; const lx = clamp(P.x * 0.02, -3, 3), ly = clamp(P.y * 0.02, -3, 3); ctx.beginPath(); ctx.arc(x + sd * 16 + lx, y - 9 + ly, final ? 4.5 : 3.2, 0, 6.283); ctx.fill(); ctx.restore(); }
  }
  const mA = st.dead ? -1.57 : T * (final ? 6 : 2), hA = st.dead ? -1.57 : T * 0.3;
  ctx.strokeStyle = '#1a1020'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y + 8, 22, 0.25, Math.PI - 0.25); ctx.stroke();
  line(x, y + 14, x + Math.cos(mA) * 26, y + 14 + Math.sin(mA) * 26, '#1a1020', 2); line(x, y + 14, x + Math.cos(hA) * 15, y + 14 + Math.sin(hA) * 15, '#1a1020', 3.5);
  circ(x, y + 14, 3.5, '#ffd36e');
  ctx.restore();
  return { x, y };
}
ART.meridian = (x, y, t, s) => drawMeridian(x, y + 10, t, s);
/* ---- overworld objects ---- */
function drawChimePost(x, y, t) { // save point: a little bell on a post
  ell(x, y + 2, 10, 4, 'rgba(0,0,0,.3)'); ctx.fillStyle = '#5a4a3a'; ctx.fillRect(x - 2, y - 22, 4, 24);
  const sw = Math.sin(t * 2) * 0.2; ctx.save(); ctx.translate(x, y - 24); ctx.rotate(sw); ctx.shadowColor = '#ffd36e'; ctx.shadowBlur = 14 + Math.sin(t * 3) * 6;
  ctx.fillStyle = '#ffd36e'; ctx.beginPath(); ctx.moveTo(-4, 0); ctx.quadraticCurveTo(-5, 8, -10, 14); ctx.lineTo(10, 14); ctx.quadraticCurveTo(5, 8, 4, 0); ctx.closePath(); ctx.fill(); circ(0, 16, 2.5, '#c8902a'); ctx.restore();
  if (Math.random() < 0.05) burst(x + rand(-10, 10), y - 24 + rand(-8, 8), 1, '#ffe8a0', 20, 0.8, 2);
}
