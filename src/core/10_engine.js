/* ===================== PARTICLES + FLOATING TEXT ===================== */
const particles = [], floaters = [];
function burst(x, y, n, col, spd = 160, life = 0.6, size = 3, grav = false) {
  for (let i = 0; i < n && particles.length < MAX_PARTICLES; i++) {
    const a = Math.random() * 6.283, s = spd * (0.3 + Math.random() * 0.7);
    particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life, max: life, col, size, grav });
  }
}
function floatText(x, y, text, col = '#fff', size = 22, life = 1.1) { floaters.push({ x, y, text, col, size, life, max: life, vy: -60 }); }
function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]; p.life -= dt;
    if (p.life <= 0) { particles[i] = particles[particles.length - 1]; particles.pop(); continue; }
    p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.96; p.vy *= 0.96; if (p.grav) p.vy += (p.grav === true ? 300 : p.grav) * dt;
  }
  for (let i = floaters.length - 1; i >= 0; i--) { const f = floaters[i]; f.life -= dt; f.y += f.vy * dt; f.vy *= 0.94; if (f.life <= 0) floaters.splice(i, 1); }
}
function drawParticles() {
  for (const p of particles) { ctx.globalAlpha = p.life / p.max; ctx.fillStyle = p.col; ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size); }
  ctx.globalAlpha = 1;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const f of floaters) { ctx.globalAlpha = clamp(f.life / f.max * 2, 0, 1); ctx.font = `bold ${f.size}px ${FONT}`; ctx.fillStyle = '#000'; ctx.fillText(f.text, f.x + 2, f.y + 2); ctx.fillStyle = f.col; ctx.fillText(f.text, f.x, f.y); }
  ctx.globalAlpha = 1;
}
const shakeS = { t: 0, m: 0 };
function shake(m, t) { if (!settings.shake) return; if (m >= shakeS.m || shakeS.t <= 0) { shakeS.m = m; shakeS.t = t; } }

/* ===================== BULLETS (pooled; k: 0 circle, 1 rect, 2 laser; arena-local coords) ===================== */
const bullets = [], bpool = [];
const BDEF = { label: null, ux: 0, uy: 0, jtok: 0, k: 0, x: 0, y: 0, vx: 0, vy: 0, ax: 0, ay: 0, r: 5, w: 10, h: 10, ang: 0, av: 0, warn: 0, life: 8, age: 0, home: 0, spd: 0, col: '#fff', gz: false, dmg: 3, dead: false, warned: false, noCull: false, bounce: 0, shape: 0, fn: null, harmless: false, soft: false, len: 0 };
const HCAP = 420; // history samples per bullet (3.5 s at 120 Hz) for REWIND
const REC = { on: false };
function spawn(o) { const b = bpool.pop() || {}; const hb = b.hb; Object.assign(b, BDEF, o); b.hb = hb; b.hh = 0; b.hc = 0; b.rec = 0; bullets.push(b); return b; }
function recordBullet(b) { if (!b.hb) b.hb = new Float32Array(HCAP * 3); const i = b.hh * 3; b.hb[i] = b.x; b.hb[i + 1] = b.y; b.hb[i + 2] = b.ang; b.hh = (b.hh + 1) % HCAP; if (b.hc < HCAP) b.hc++; b.rec++; }
function rewindBullets(n) {
  for (const b of bullets) { if (b.dead || b.noCull || b.wall) continue; if (b.unfire) { b.dead = true; continue; } // v1.6: aimed shots are un-fired by REWIND instead of retracing at 2x
    for (let k = 0; k < n; k++) { if (b.hc <= 0) { if (b.rec <= 0) b.dead = true; break; } b.hh = (b.hh - 1 + HCAP) % HCAP; b.hc--; b.rec--; const i = b.hh * 3; b.x = b.hb[i]; b.y = b.hb[i + 1]; b.ang = b.hb[i + 2]; } }
  for (let i = bullets.length - 1; i >= 0; i--) if (bullets[i].dead) { const b = bullets[i]; burstLocal(b.x, b.y, 1, '#9ff', 40, 0.25, 2); bullets[i] = bullets[bullets.length - 1]; bullets.pop(); bpool.push(b); }
}
function histPoint(b, back) { if (!b.hb || back >= b.hc) return null; const i = ((b.hh - 1 - back + HCAP * 2) % HCAP) * 3; return [b.hb[i], b.hb[i + 1]]; }
const shot = (x, y, vx, vy, r = 5, col = '#fff', o) => spawn(Object.assign({ k: 0, x, y, vx, vy, r, col }, o));
const bar = (x, y, w, h, vx, vy, col = '#fff', o) => spawn(Object.assign({ k: 1, x, y, w, h, vx, vy, col }, o));
// beams: harmful ones always get >= 0.6 s of (real-time) warning, doubled while SKIP AHEAD runs the clock at 2x
const laser = (x, y, ang, w, warn, act, o) => { if (!(o && o.harmless)) { warn = Math.max(0.6, warn); if (typeof B !== 'undefined' && B && B.tfx && B.tfx.mode === 'ff') warn *= 2; }
  return spawn(Object.assign({ k: 2, x, y, ang, w, warn, life: warn + act, col: '#9ff', dmg: 4, noCull: true }, o)); };
const zone = (x, y, w, h, warn, act, o) => spawn(Object.assign({ k: 1, x, y, w, h, warn, life: warn + act, col: '#ff4455', dmg: 4, noCull: true }, o));
function clearBullets(pop) {
  for (const b of bullets) { if (pop && b.k === 0 && b.age >= b.warn) burstLocal(b.x, b.y, 1, '#fff', 60, 0.3, 2); bpool.push(b); }
  bullets.length = 0;
}
function burstLocal(lx, ly, n, col, spd, life, size) { const w = localToWorld(lx, ly); burst(w.x, w.y, n, col, spd, life, size); }
function bulletTouches(b, px, py, r) {
  if (b.k === 0) { const dx = px - b.x, dy = py - b.y, rr = b.r + r; return dx * dx + dy * dy < rr * rr; }
  if (b.k === 1) {
    const c = Math.cos(-b.ang), s = Math.sin(-b.ang), dx = px - b.x, dy = py - b.y;
    const lx = dx * c - dy * s, ly = dx * s + dy * c;
    const qx = Math.max(Math.abs(lx) - b.w / 2, 0), qy = Math.max(Math.abs(ly) - b.h / 2, 0);
    return qx * qx + qy * qy < r * r;
  }
  const c = Math.cos(b.ang), s = Math.sin(b.ang), dx = px - b.x, dy = py - b.y;
  if (b.len) { const along = dx * c + dy * s; if (along < 0 || along > b.len) return false; }
  return Math.abs(-dx * s + dy * c) < b.w / 2 + r;
}
function updateBullets(dt) {
  const hw = arena.w / 2, hh = arena.h / 2;
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    if (b.wall && typeof B !== 'undefined' && B && B.tfx && B.tfx.mode !== 'freeze') continue; // v1.6: wall rows hold still through REWIND / x2
    b.age += dt;
    if (b.age >= b.life || b.dead) { bullets[i] = bullets[bullets.length - 1]; bullets.pop(); bpool.push(b); continue; }
    if (b.age < b.warn) continue;
    if (!b.warned) { b.warned = true; if (b.warn > 0 && b.k !== 0) shake(3, 0.1); }
    if (b.home && b.age < b.life - 0.6) {
      const want = Math.atan2(player.y - b.y, player.x - b.x), cur = Math.atan2(b.vy, b.vx);
      let da = want - cur; while (da > Math.PI) da -= 6.283; while (da < -Math.PI) da += 6.283;
      const na = cur + clamp(da, -b.home * dt, b.home * dt); b.vx = Math.cos(na) * b.spd; b.vy = Math.sin(na) * b.spd;
    }
    if (b.fn) b.fn(b, dt);
    b.vx += b.ax * dt; b.vy += b.ay * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.ang += b.av * dt;
    if (REC.on && !b.noCull) recordBullet(b);
    if (b.bounce > 0 && b.k === 0) {
      if ((b.x < -hw + b.r && b.vx < 0) || (b.x > hw - b.r && b.vx > 0)) { b.vx *= -1; b.bounce--; }
      if ((b.y < -hh + b.r && b.vy < 0) || (b.y > hh - b.r && b.vy > 0)) { b.vy *= -(b.ay ? 0.9 : 1); b.bounce--; }
    }
    if (!b.noCull && (b.x < -hw - 320 || b.x > hw + 320 || b.y < -hh - 320 || b.y > hh + 320)) b.dead = true;
  }
}

/* ===================== ARENA + SOUL ===================== */
const arena = { w: 300, h: 200, tw: 300, th: 200, rot: 0, av: 0, rotHome: false, tiny: 1 };
function setArena(w, h) { arena.tw = w * arena.tiny; arena.th = h * arena.tiny; }
function snapArena(w, h) { setArena(w, h); arena.w = arena.tw; arena.h = arena.th; }
function updateArena(dt) {
  const dw = arena.tw - arena.w, dh = arena.th - arena.h;
  const kk = arena.k || 7, spw = Math.max(260, Math.abs(dw) * kk) * dt, sph = Math.max(260, Math.abs(dh) * kk) * dt; /* v2.0.3: arena.k = slower bloom for FULL DIAL */
  arena.w += clamp(dw, -spw, spw); arena.h += clamp(dh, -sph, sph);
  ARENA_Y = Math.min(340, H - arena.h / 2 - 8); /* v2.0.3: a box taller than 384 (MERIDIAN's FULL DIAL) slides up to stay on screen; every other box stays at 340 */
  if (arena.rotHome) {
    let r = ((arena.rot % 6.283) + 6.283) % 6.283; if (r > Math.PI) r -= 6.283;
    arena.rot = Math.abs(r) < 2.5 * dt ? 0 : r - Math.sign(r) * 2.5 * dt; if (arena.rot === 0) arena.rotHome = false;
  } else arena.rot += arena.av * dt;
}
function localToWorld(x, y) { const c = Math.cos(arena.rot), s = Math.sin(arena.rot); return { x: ARENA_X + x * c - y * s, y: ARENA_Y + x * s + y * c }; }
const player = { x: 0, y: 0, vx: 0, vy: 0, blue: false, onGround: false, inv: 0, flash: 0, focus: false };
function updateSoul(dt) {
  const inp = readInput(), hw = arena.w / 2 - SOUL_R, hh = arena.h / 2 - SOUL_R;
  const c = Math.cos(-arena.rot), s = Math.sin(-arena.rot);
  const ix = inp.x * c - inp.y * s, iy = inp.x * s + inp.y * c;
  const spd = BASE_SPEED * settings.sens * (inp.focus ? FOCUS_MUL : 1);
  const k = player.slip ? Math.min(1, dt * 2.4) : settings.smooth <= 0 ? 1 : 1 - Math.pow(settings.smooth, dt * 36);
  const ddx = touch.dragDX, ddy = touch.dragDY; touch.dragDX = touch.dragDY = 0;
  const dm = settings.sens * 1.1 * (inp.focus ? 0.5 : 1);
  const dlx = (ddx * c - ddy * s) * dm, dly = (ddx * s + ddy * c) * dm;
  if (player.blue) {
    const hx = Math.abs(arena.rot) < 0.01 ? inp.x : ix;
    player.vx += (hx * spd - player.vx) * k; player.x += player.vx * dt + dlx;
    player.vy += 950 * dt;
    if (inp.up && player.onGround) { player.vy = -400; player.onGround = false; sfx('jump'); }
    if (!inp.up && player.vy < -130) player.vy = -130;
    player.y += player.vy * dt;
    if (player.y >= hh) { player.y = hh; player.vy = 0; player.onGround = true; } else player.onGround = false;
    if (player.y < -hh) { player.y = -hh; player.vy = Math.max(0, player.vy); }
  } else {
    player.vx += (ix * spd - player.vx) * k; player.vy += (iy * spd - player.vy) * k;
    player.x += player.vx * dt + dlx; player.y += player.vy * dt + dly;
  }
  if (player.slip) { if (Math.abs(player.x) > hw) player.vx *= -0.35; if (!player.blue && Math.abs(player.y) > hh) player.vy *= -0.35; }
  player.x = clamp(player.x, -hw, hw); player.y = clamp(player.y, -hh, hh);
  player.focus = inp.focus;
  if (player.inv > 0) player.inv -= dt; if (player.flash > 0) player.flash -= dt;
}
function setBlue(on) { if (player.blue !== on) { player.blue = on; player.vy = 0; burstLocal(player.x, player.y, 14, on ? '#4af' : '#f44', 120, 0.4, 3); sfx('warn'); } }

/* ===================== RUNNER (timeline for one attack) ===================== */
class Runner {
  constructor(def, d) { this.def = def; this.t = 0; this.d = d; this.ev = []; this.alert = null; this.alertT = 0; this.upd = def.run(this) || null; }
  at(t, f) { this.ev.push({ t, f, rep: 0 }); }
  every(iv, f, t0 = 0, t1 = this.def.dur) { this.ev.push({ t: t0, f, rep: iv, end: t1, n: 0 }); }
  step(dt) {
    this.t += dt; if (this.alertT > 0) this.alertT -= dt;
    for (const e of this.ev) {
      while (!e.done && this.t >= e.t) {
        if (e.rep) { if (e.t > e.end) { e.done = true; break; } e.f(e.n++); e.t += e.rep; }
        else { e.f(0); e.done = true; }
      }
    }
    if (this.upd) this.upd(this.t, dt);
    return this.t >= this.def.dur;
  }
}
