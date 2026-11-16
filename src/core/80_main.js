/* ===================== MAIN ===================== */
let state = 'title';
const canPause = () => (state === 'world' || state === 'battle') && !uiOpen && !CUT && !(B && B.st === 'broken');
const inDodge = () => state === 'battle' && B && B.st === 'dodge';
function autoPause() { if (canPause() && !DLG && !(state === 'world' && busy)) openPause(); }
function resize() {
  view.dpr = Math.min(window.devicePixelRatio || 1, 2);
  const vw = innerWidth, vh = innerHeight;
  cv.width = Math.round(vw * view.dpr); cv.height = Math.round(vh * view.dpr);
  view.scale = Math.min(vw / W, vh / H); view.ox = (vw - W * view.scale) / 2; view.oy = (vh - H * view.scale) / 2;
}
addEventListener('resize', resize); addEventListener('orientationchange', () => setTimeout(resize, 200)); resize();
let titleT = 0;
function drawTitleBg(dt) {
  titleT += dt; const T = titleT;
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0a0614'); g.addColorStop(1, '#1e1028'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (const [gx, gy, gr, sp] of [[120, 110, 100, 0.15], [850, 430, 140, -0.1], [880, 80, 60, 0.3], [80, 470, 80, -0.2], [480, 600, 220, 0.05]]) gear(gx, gy, gr, 14, T * sp, 'rgba(200,160,80,0.06)', null);
  ARTS.town(W / 2, 470, T);
  ctx.save(); ctx.translate(W / 2, 112); ctx.scale(0.85, 0.85); drawMeridian(0, 0, T, { eye: '#fff', cracks: 0 }); ctx.restore();
  if (Math.random() < 0.15) particles.push({ x: rand(0, W), y: -5, vx: rand(-8, 8), vy: rand(20, 50), life: 9, max: 9, col: pick(['#ffd36e', '#ffb347', '#e8c070']), size: 2, grav: 0 });
  drawParticles();
}
function render(dt) {
  const d = view.dpr, s = view.scale;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, cv.width, cv.height);
  let sx = 0, sy = 0; if (shakeS.t > 0 && settings.shake) { sx = rand(-shakeS.m, shakeS.m); sy = rand(-shakeS.m, shakeS.m); }
  ctx.setTransform(d * s, 0, 0, d * s, d * (view.ox + sx * s), d * (view.oy + sy * s));
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
  const st = state === 'paused' ? prevState : state;
  if (st === 'title' || st === 'over2' && !RM) drawTitleBg(dt);
  else if (st === 'cut' && CUT) drawCut();
  else if (st === 'world' && RM) drawWorld();
  else if (st === 'battle' || (st === 'over' && !RM)) { drawBattle(); drawParticles(); }
  else if ((st === 'over' || st === 'over2') && RM) { drawWorld(); ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(0, 0, W, H); }
  else drawTitleBg(dt);
  if (st === 'world' && RM && !uiOpen && !DLG) drawPauseBtn();
  ctx.restore();
}
let acc = 0, last = performance.now();
let lastR = 0; // v1.7-c18 M4-D4: battery saver caps drawing at 60 Hz on 90/120 Hz screens (sim is fixed-step, so speed is unchanged)
function frame(now) {
  if (settings.cap60 && now - lastR < 15) { requestAnimationFrame(frame); return; }
  lastR = now; window.__hhFrames = (window.__hhFrames || 0) + 1;
  const dt = Math.min(0.1, Math.max(0, (now - last) / 1000)); last = now;
  let stepped = true;
  try {
    if (state === 'battle' || state === 'world') {
      stepped = false;
      if (state === 'battle' && act('menu') && canPause()) openPause();
      acc += dt; let guard = 0;
      while (acc >= STEP && guard++ < 24 && (state === 'battle' || state === 'world')) {
        if (state === 'battle') updateBattle(STEP); else updateWorld(STEP);
        updateParticles(STEP); if (shakeS.t > 0) shakeS.t -= STEP; acc -= STEP; stepped = true;
      }
      if (guard >= 24) acc = 0;
    } else {
      acc = 0; updateParticles(dt); if (shakeS.t > 0) shakeS.t -= dt;
      if (state === 'cut' && CUT) updateCut(dt);
      if (state === 'over' && B === null) updateArena(dt);
    }
    render(dt);
  } catch (err) { console.error(err); }
  if (stepped) { actions.clear(); taps.length = 0; }
  requestAnimationFrame(frame);
}
setTrack('title'); showScreen('title'); requestAnimationFrame(frame);
// test/debug hooks (used by the automated smoke test)
window.__hh = { get state() { return state; }, get B() { return B; }, get hero() { return hero; }, set hero(v) { hero = v; }, get RM() { return RM; }, get DLG() { return DLG; }, get CUT() { return CUT; }, get busy() { return busy; },
  startBattle, enterRoom, newHero, bDone, get cam() { return cam; }, ROOMS, ENEMIES, A, MER_ATTACKS, bullets, player, actions, startEnding, route, showScreen, saveGame, loadSave, toTitle,
  setState(s) { state = s; }, runScript, giveKey, has, get meta() { return meta; }, AU, TRACKS, variantTrack, mopLoc, interact, keys, settings, arena, bulletTouches, MER_CHAIN, startTfx, blocked, tileAt, spareable, get slot() { return slot; }, set slot(v) { slot = v; }, loadSlot, wipeSlot, buildFiles, route, migrateSave, SAVE_VER, ROOMS, get meta() { return meta; } };
