/* Weightworks rail art by Greg for Hollow Hour. Drop in after src/core/30_art.js.
   hhRail(pts, state, t): pts are world [x,y] points, state is 'idle' | 'route' | 'done'.
   Draws gravel bed, wooden sleepers, twin iron rails with highlights, and bolts at joints.
   'route' rails get a soft violet pulse running along them, 'done' glows gold. */
function hhRail(pts, state, t) {
  if (!pts || pts.length < 2) return;
  const P = pts.map(p => [p[0] - cam.x, p[1] - cam.y]);
  const G = 3.5, SL = 9, SW = 3, GAP = 8; // rail half-gauge, sleeper half-length, sleeper width, sleeper spacing
  const rail = state === 'done' ? ['#c8a050', '#ffe6a0'] : state === 'route' ? ['#7a6a8a', '#c8b8e0'] : ['#4a4452', '#6e6678'];
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const path = (off) => { ctx.beginPath(); for (let i = 0; i < P.length; i++) { const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L * off, ny = dx / L * off; i ? ctx.lineTo(P[i][0] + nx, P[i][1] + ny) : ctx.moveTo(P[i][0] + nx, P[i][1] + ny); } };
  // ballast bed
  path(0); ctx.strokeStyle = '#231e28'; ctx.lineWidth = 16; ctx.stroke();
  path(0); ctx.strokeStyle = '#2e2834'; ctx.lineWidth = 12; ctx.stroke();
  // gravel specks + sleepers
  let carry = 0;
  for (let i = 1; i < P.length; i++) {
    const [ax, ay] = P[i - 1], [bx, by] = P[i], dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
    for (let d = GAP - carry; d < L; d += GAP) {
      const x = ax + ux * d, y = ay + uy * d, h = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453 % 1;
      ctx.strokeStyle = h > 0.5 ? '#5a4030' : '#4e3828'; ctx.lineWidth = SW;
      ctx.beginPath(); ctx.moveTo(x - nx * SL, y - ny * SL); ctx.lineTo(x + nx * SL, y + ny * SL); ctx.stroke();
      ctx.fillStyle = '#3e3844'; ctx.fillRect(x + nx * (h * 14 - 7) + ux * 4, y + ny * (h * 14 - 7) + uy * 4, 1, 1);
    }
    carry = (carry + L) % GAP;
  }
  // rails: shadow, body, top highlight
  for (const s of [-G, G]) {
    path(s + 0.8); ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.lineWidth = 2.5; ctx.stroke();
    path(s); ctx.strokeStyle = rail[0]; ctx.lineWidth = 2; ctx.stroke();
    path(s - 0.6); ctx.strokeStyle = rail[1]; ctx.lineWidth = 0.8; ctx.stroke();
  }
  // bolts at joints
  ctx.fillStyle = '#8a8090';
  for (let i = 1; i < P.length - 1; i++) { ctx.fillRect(P[i][0] - 1, P[i][1] - 1, 2, 2); }
  // live pulse / gold glow
  if (state !== 'idle') {
    ctx.globalCompositeOperation = 'lighter';
    path(0); ctx.strokeStyle = state === 'done' ? 'rgba(255,211,110,.18)' : 'rgba(180,150,230,.12)'; ctx.lineWidth = 10; ctx.stroke();
    if (state === 'route') { ctx.setLineDash([6, 30]); ctx.lineDashOffset = -t * 60; path(0); ctx.strokeStyle = 'rgba(210,190,255,.55)'; ctx.lineWidth = 3; ctx.stroke(); ctx.setLineDash([]); }
  }
  ctx.restore();
}
