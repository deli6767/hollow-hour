/* ===================== TEXT HELPERS ===================== */
function wrapText(s, maxW) { const out = []; for (const para of String(s).split('\n')) { const words = para.split(' '); let line = ''; for (const w of words) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; } out.push(line); } return out; }
class Typer {
  constructor(text, voice = 520) { this.text = text; this.shown = 0; this.t = 0; this.voice = voice; }
  update(dt) { if (this.shown >= this.text.length) return; if (this.hold > 0) { this.hold -= dt * (settings.textSpd || 1); return; } /* v1.7-c32: brief beats after punctuation */
    this.t += dt * 42 * (settings.textSpd || 1); const n = Math.min(this.text.length, Math.floor(this.t)); if (n <= this.shown) return; const a = this.shown;
    for (let k = a + 1; k <= n; k++) { const c = this.text[k - 1], nx = this.text[k]; if (k < this.text.length && nx === ' ' && /[.!?…,;:—]/.test(c)) { this.hold = /[.!?…]/.test(c) ? 0.2 : 0.08; this.t = k; this.shown = k; break; } this.shown = k; }
    if (/\S/.test(this.text[this.shown - 1]) && (this.shown % 2 === 0 || this.hold > 0)) sfx('blip', this.voice); }
  get done() { return this.shown >= this.text.length; }
  finish() { this.shown = this.text.length; }
  get str() { return this.text.slice(0, this.shown); }
}
function drawPanel(x, y, w, h, glow) {
  ctx.save(); rrect(x, y, w, h, 10); ctx.fillStyle = 'rgba(14,12,30,.94)'; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = glow || '#c8a050'; ctx.stroke(); rrect(x + 5, y + 5, w - 10, h - 10, 6); ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(200,160,80,.35)'; ctx.stroke();
  for (const [cx, cy] of [[x + 9, y + 9], [x + w - 9, y + 9], [x + 9, y + h - 9], [x + w - 9, y + h - 9]]) circ(cx, cy, 2.5, '#e8c070');
  ctx.restore();
}

/* ===================== BATTLE ===================== */
const EX = 480, EY = 140, TBOX = [880, 150];
const BTN_Y = 480, BTN_H = 50, BTNS = ['STRIKE', 'CHAT', 'POCKET', 'RELEASE'];
const btnRect = i => ({ x: 34 + i * 228, y: BTN_Y, w: 210, h: BTN_H });
let B = null;
function startBattle(id, opts = {}) {
  const e = ENEMIES[id];
  resetTouch(); clearBullets(false); particles.length = 0; floaters.length = 0;
  B = { e, id, hp: e.hp, maxhp: e.hp, calm: 0, talked: false, st: 'trans', transT: 0, turn: 0, counts: {}, sel: 0, sub: 0, list: null, typer: null, lines: [], bubble: null, bubbleT: 0, runner: null,
    resolve: null, opts, alpha: 1, hurt: 0, shownHp: e.hp, hpBarT: 0, aim: 0, aimDir: 1, slashT: 0, t: 0, flipped: false, forceAtk: null, pendingSay: null, dead: false, bannerT: 0, banner: '', flash: 0, glowFlash: 0, token: {} ,
    n(k) { return this.counts[k] || 0; },
    mer: e.meridian ? { idx: 0, phase: -1, cracks: 0, eye: '#fff', dead: 0, raise: 0, spent: false, final: false } : null };
  meta.seen[id] = true; saveMeta();
  arena.rot = 0; arena.av = 0; arena.rotHome = false; snapArena(60, 20); setArena(...TBOX);
  Object.assign(player, { x: 0, y: 0, vx: 0, vy: 0, blue: false, onGround: false, inv: 0, flash: 0 });
  state = 'battle'; sfx('encounter'); setTrack(e.track);
  if (opts.practice) { practiceLoop(B); return; }
  battleLoop(B);
}
const alive = b => B === b && !b.over;
function bWait(b, st, extra) { return new Promise(res => { b.st = st; b.resolve = res; if (extra) Object.assign(b, extra); }); }
function bDone(v) { if (!B || !B.resolve) return; const r = B.resolve; B.resolve = null; r(v); }
async function bMsg(b, lines) { for (const l of [].concat(lines)) { if (!alive(b)) return; b.typer = new Typer(l, 520); setArena(...TBOX); await bWait(b, 'msg'); } b.typer = null; }
async function bTalk(b, lines, voice) { for (const l of [].concat(lines)) { if (!alive(b)) return; b.bubble = new Typer(l, voice || b.e.voice || 300); b.bubbleT = 0; await bWait(b, 'talk'); } b.bubble = null; }
async function bDodge(b, def, d) {
  if (!alive(b)) return;
  b.typer = null; setArena(def.size[0], def.size[1]); Object.assign(player, { x: 0, y: def.blue ? 30 : 0, vx: 0, vy: 0, inv: 0.3 }); setBlue(def.blue === true);
  resetTouch(); b.runner = null; b.preT = 0.45; b.pendingDef = def; b.pendingD = d; b.tfx = null; b.timerBack = 0; REC.on = !!def.rec; player.slip = !!def.slip;
  await bWait(b, 'dodge');
  if (b.tfx) endTfx(b, true); REC.on = false; player.slip = false; b.runner = null; clearBullets(true); setBlue(false); arena.av = 0; if (arena.rot) arena.rotHome = true; setArena(...TBOX);
}
function flavor(b) { if (b.mer && b.mer.spent) return 'MERIDIAN can barely stand. His spring is spent. The bell waits.'; return spareable(b) ? b.e.calm : pick(b.e.flavor); }
const spareable = b => b.mer ? b.mer.spent : (b.calm >= 100 || (b.talked && b.hp <= b.maxhp * 0.25));
async function battleLoop(b) {
  await sleep(10);
  b.st = 'trans'; await bWait(b, 'trans');
  if (!alive(b)) return;
  await bMsg(b, b.e.intro);
  while (alive(b)) {
    try {
      const res = await playerTurn(b);
      if (!alive(b) || res === 'end') return;
      await enemyTurn(b);
    } catch (err) { console.error(err); if (!alive(b)) return; b.list = null; b.typer = null; }
  }
}
async function playerTurn(b) {
  while (alive(b)) {
    b.flavorText = flavor(b); b.typer = new Typer(b.flavorText, 520); b.typer.finish(); b.list = null;
    const cmd = await bWait(b, 'menu');
    if (!alive(b)) return;
    if (cmd === 0) { // STRIKE
      const mult = await bWait(b, 'aim', { aim: -1, aimSpd: 1.25 + Math.random() * 0.3 });
      if (!alive(b)) return;
      const res = await doStrike(b, mult); if (res) return res; return;
    }
    const opts = cmd === 1 ? ['Check', ...Object.keys(b.e.acts).filter(k => !b.e.actIf || !b.e.actIf[k] || b.e.actIf[k](b))] : cmd === 2 ? hero.items.map(k => ITEMS[k].name) : ['Let Go', ...(b.e.boss ? [] : ['Slip Away'])];
    if (cmd === 2 && !opts.length) { await bMsg(b, 'Your pockets are empty. Just lint and a little ash.'); continue; }
    b.list = { cmd, opts, sel: 0 };
    const pickI = await bWait(b, 'list');
    b.list = null;
    if (!alive(b) || pickI < 0) continue; // back
    if (cmd === 1) { const name = opts[pickI];
      if (name === 'Check') { await bMsg(b, `${b.e.name}${b.e.title ? ', ' + b.e.title : ''} · ${b.e.check}`); return; }
      const r = b.e.acts[name](b); b.counts[name] = (b.counts[name] || 0) + 1;
      const was = spareable(b); b.talked = true; b.calm = clamp(b.calm + r.c, 0, 100); if (r.say) b.pendingSay = r.say;
      if (r.c > 0) burst(EX, EY + 20, 10, '#ffd36e', 120, 0.6, 3); if (r.c < 0) shake(4, 0.2);
      await bMsg(b, r.t); if (!was && spareable(b) && !b.mer) { sfx('spare'); await bMsg(b, `${b.e.name} seems calm now. You could RELEASE them.`); }
      return;
    }
    if (cmd === 2) { const key = hero.items[pickI]; await useItem(b, pickI, key); return; }
    if (cmd === 3) {
      if (pickI === 0) {
        if (spareable(b)) { await doSpare(b); return 'end'; }
        await bMsg(b, b.mer ? 'MERIDIAN laughs. "let go? i\'m not done yet, spark."' : (!b.talked ? `${b.e.name} won't listen until you've talked to it.` : `${b.e.name} isn't calm enough to let go yet.`)); return;
      }
      if (b.id === 'mopsley') { sfx('flee'); hero.flags.mop_fight = 'slip'; giveKey('button');
        await bMsg(b, ['You try to slip away...', '...and you DO slip. On the wet floor. You skid right out of the fight on your back.', 'Mopsley laughs so hard he has to sit down on his bucket.', '"Oh, that\'s the one. That\'s the one I was waiting for." He tosses you a brass button. "Here. For the trouble."', '(You got the Brass Button.)']);
        endBattle(b, 'flee'); return 'end'; }
      if (Math.random() < 0.6) { sfx('flee'); await bMsg(b, 'You slipped away into the grass!'); endBattle(b, 'flee'); return 'end'; }
      await bMsg(b, 'You tried to slip away... but tripped on your own scarf.'); return;
    }
  }
}
async function useItem(b, idx, key) {
  const it = ITEMS[key];
  if (it.kind === 'heal') { hero.items.splice(idx, 1); const g = Math.min(it.v, maxGlow(hero) - hero.glow); hero.glow += g; sfx('heal'); b.glowFlash = 0.6;
    await bMsg(b, [`You ate the ${it.name}.`, hero.glow >= maxGlow(hero) ? 'Your GLOW is full!' : `You recovered ${g} GLOW.`]); return; }
  if (it.kind === 'gift') {
    if (b.id === 'cuckoo') { hero.items.splice(idx, 1); b.calm = clamp(b.calm + 60, 0, 100); b.pendingSay = 'a ROSE?! for ME?! oh, darling...'; burst(EX, EY, 30, '#ff9ad8', 200, 0.8, 4); sfx('spare');
      await bMsg(b, ['You toss the Paper Rose onto the stage.', 'Madame Cuckoo catches it in her beak. She is overcome.']); return; }
    await bMsg(b, `You show ${b.e.name} the ${it.name}. They don't get it.`); return; }
  if (it.kind === 'weapon' || it.kind === 'armor') { equipItem(idx); sfx('item'); await bMsg(b, `You equipped the ${it.name}.`); return; }
}
async function doStrike(b, mult) {
  if (b.e.noStrike) { sfx('miss'); floatText(EX, EY - 30, 'MISS', '#aaa', 26); await bMsg(b, ['You swing.', 'Mopsley leans out of the way without looking up. "Missed a spot."']); return; }
  if (mult <= 0) { sfx('miss'); floatText(EX, EY - 30, 'MISS', '#aaa', 26); await bMsg(b, 'You swung at the air. The air is fine.'); return; }
  let dmg = Math.max(1, Math.round(edge(hero) * mult * rand(0.92, 1.08)) - b.e.def);
  if (b.mer && !b.mer.spent) { dmg = Math.min(dmg, b.hp - 1); }
  if (b.mer && b.mer.spent) dmg = b.hp;
  b.slashT = 0.5; sfx(mult > 2 ? 'crit' : 'slash'); await sleep(0); 
  const old = b.hp; b.hp = Math.max(0, b.hp - dmg); b.shownHp = old; b.hpBarT = 1.6; b.hurt = 0.6; shake(mult > 2 ? 9 : 5, 0.3);
  floatText(EX + rand(-30, 30), EY - 40, dmg > 0 ? String(dmg) : '0', mult > 2 ? '#ffd36e' : '#ff6a5a', mult > 2 ? 34 : 28);
  if (mult > 2) floatText(EX, EY - 80, 'CRITICAL!', '#ffd36e', 22);
  burst(EX, EY, 18, '#ffe0a0', 220, 0.5, 3);
  await bWait(b, 'pause', { pauseT: 0.9 });
  if (!alive(b)) return 'end';
  if (b.mer && !b.mer.spent && dmg === 0 || (b.mer && !b.mer.spent && b.hp <= 1)) { b.pendingSay = 'not before midnight, spark.'; }
  if (b.hp <= 0) { await doKill(b); return 'end'; }
  b.calm = Math.max(0, b.calm - 10);
  return null;
}
async function doKill(b) {
  b.dying = 0.001; sfx('dust'); shake(8, 0.6);
  for (let i = 0; i < 40; i++) setTimeout(() => { if (B === b) burst(EX + rand(-70, 70), EY + rand(-70, 70), 3, pick(['#c8a050', '#888', '#e8c070', '#555']), 160, 1.2, 4, 200); }, i * 25);
  await bWait(b, 'pause', { pauseT: 1.6 });
  if (!alive(b)) return;
  const e = b.e; const lines = [e.kill || `${e.name}'s clock stopped.`];
  if (b.mer) { endBattle(b, 'kill'); return; }
  if (!b.opts.rush) {
    hero.kills++; const area = ROOMS[hero.room] ? ROOMS[hero.room].area : 'rustwood'; hero.areaKills[area] = (hero.areaKills[area] || 0) + 1;
    if (e.boss) hero.flags['killed_' + b.id] = true;
    hero.torque += e.torque; hero.cogs += e.cogs;
    lines.push(`The fight is over. You gained ${e.torque} TORQUE and ${e.cogs} COGS.`);
    let up = false; while (hero.coil < 10 && hero.torque >= TORQUE_AT[hero.coil]) { hero.coil++; up = true; }
    if (up) { sfx('lvup'); hero.glow = Math.min(maxGlow(hero), hero.glow + 4); lines.push(`Your spring winds tighter. COIL ${hero.coil}! (max GLOW ${maxGlow(hero)}, EDGE ${edge(hero)})`); }
  }
  await bMsg(b, lines); endBattle(b, 'kill');
}
async function doSpare(b) {
  b.sparing = 0.001; sfx('spare'); burst(EX, EY, 40, '#ffe8a0', 180, 1.2, 3);
  await bWait(b, 'pause', { pauseT: 1.0 });
  if (!alive(b)) return;
  if (b.mer) { endBattle(b, 'spare'); return; }
  const e = b.e, cg = Math.ceil(e.cogs * 0.7); const lines = [e.spare];
  if (b.id === 'mopsley') hero.flags.mop_fight = hero.flags.mop_fight || 'spare';
  if (!b.opts.rush) { hero.spares++; hero.cogs += cg; if (e.boss) hero.flags['spared_' + b.id] = true; lines.push(`You let ${e.name} go. You found ${cg} COGS they left behind as thanks.`); }
  await bMsg(b, lines); endBattle(b, 'spare');
}
async function enemyTurn(b) {
  if (!alive(b)) return;
  const e = b.e;
  if (b.mer) return meridianTurn(b);
  let line = b.pendingSay || (e.turns ? e.turns[Math.min(b.turn, e.turns.length - 1)] : pick(e.talk)); b.pendingSay = null;
  if (line === 'MEDLEY') line = hero.flags.killed_wicklow ? 'A little bird told me what you did to the candle knight. Shall I SING it?' : 'You let the candle knight keep his light. The whole tower heard. Let me sing it for you!';
  if (spareable(b) && !e.turns) line = pick(['...', '(content humming)', '(it seems happy)']);
  await bTalk(b, line);
  let atkId = b.forceAtk || (e.boss ? e.attacks[b.turn % e.attacks.length] : pick(e.attacks)); b.forceAtk = null;
  if (e.boss && b.turn >= e.attacks.length && !b.forceAtk) atkId = pick(e.attacks);
  const def = A[atkId]; meta.seen['atk_' + atkId] = true;
  const calmEase = spareable(b) ? 0.85 : 1;
  await bDodge(b, def, e.d * calmEase);
  b.turn++;
}
const MER_D = ph => 1.22 + 0.08 * ph; // v1.3: 1.22..1.54 (Madame Cuckoo is 1.18 flat; was 1 + 0.07 * phase)
async function meridianTurn(b) {
  const m = b.mer;
  if (m.spent && b.oneMore === 1) { b.oneMore = 2; hero.flags.oneMore = true; await bTalk(b, b.pendingSay || '...oh. oh, i know this one.'); b.pendingSay = null; setTrack('vesper');
    await bDodge(b, A.oneMore, 1); if (!alive(b)) return; setTrack('mer_spent');
    await bTalk(b, ['...that was the first one.', 'the first song anyone wound into me. pendulum rain. i made it hurt, later. it didn\'t used to hurt.', 'somebody hummed it while they worked. i can\'t remember who.']); return; }
  if (m.spent) { const ws = b.windSay; b.windSay = null; await bTalk(b, b.pendingSay || ws || pick(['...go on, spark.', 'my hands are so heavy.', 'the bell is right there.', 'decide.'])); b.pendingSay = null; return; }
  const def = MER_ATTACKS[m.idx];
  if (def.phase !== m.phase) {
    const ph = MER_PHASES[def.phase]; m.phase = def.phase; m.eye = ph.eye; m.final = def.phase === 4; setTrack(ph.track);
    if (def.phase > 0) { const h = Math.min(5, maxGlow(hero) - hero.glow); hero.glow += h; b.glowFlash = 0.5; }
    b.flash = 0.5; sfx('phase'); shake(8, 0.4); if (def.phase > 0) hhSting('meridian', def.phase + 1);
    const intro = ph.intro.slice(); if (def.phase === 0 && route() === 'violent') intro[2] = 'let\'s see how a hammer dances.';
    await bTalk(b, intro);
    { const cb = hhMerCb(b, def.phase); if (cb) await bTalk(b, cb); } /* v1.8-c6 M4-D1 callbacks */
  }
  if (b.pendingSay) { await bTalk(b, b.pendingSay); b.pendingSay = null; }
  await bTalk(b, MER_PRE[m.idx]);
  meta.seen['mer_' + m.idx] = true;
  m.raise = 1; await bDodge(b, def, MER_D(def.phase)); m.raise = 0;
  if (!alive(b)) return;
  { const ch = MER_CHAIN[m.idx % MER_CHAIN.length] || (typeof hhMerV5Chain === 'function' ? hhMerV5Chain(b, m.idx) : null); /* v1.8-c14 violent phase 5 */ if (def.phase >= 3 && ch && !b.opts.practice) await bDodge(b, ch, MER_D(def.phase)); }
  if (!alive(b)) return;
  m.idx++; m.cracks = Math.floor(m.idx / MER_ATTACKS.length * 5.5); b.calm = Math.round(m.idx / MER_ATTACKS.length * 100); b.hurt = 0.4; sfx('bosshurt'); burst(EX, EY, 25, '#ffd36e', 220, 0.7, 3);
  if (m.idx >= MER_ATTACKS.length) {
    m.spent = true; b.windSay = hhMerWind(b); clearBullets(true); sfx('bell'); shake(6, 0.6); setTrack('mer_spent');
    await bTalk(b, ['...huh.', 'my gears are spent, spark. i can\'t lift another hand.', 'so. here we are. the twelfth chime and the broken jester.', route() === 'violent' ? 'go on. you\'re good at this part.' : 'strike me, or let me go. either way... the bell rings.']);
  }
}
async function practiceLoop(b) {
  b.st = 'trans'; await bWait(b, 'trans');
  b.loops = 0; b.pdeaths = 0;
  while (alive(b)) { await bDodge(b, b.opts.practice, b.opts.d || 1); if (!alive(b)) return; b.loops++; sfx('clear'); burst(ARENA_X, ARENA_Y, 30, '#ffd36e', 200, 0.6, 3); await bWait(b, 'pause', { pauseT: 0.5 }); }
}
function endBattle(b, result) {
  b.over = true; clearBullets(false); setBlue(false); B = null;
  const cb = b.opts.onEnd; if (cb) cb(result, b); else backToWorld(result, b);
}
function soulHit(bl) {
  const b = B; if (!b || player.inv > 0) return;
  const mul = b.e.atk * (b.mer && route() === 'violent' ? 1.3 : 1);
  const dmg = b.opts.practice ? 0 : Math.max(1, Math.round(bl.dmg * mul * (1 - plating(hero) * 0.05) * hhDiffDmg()));
  player.inv = IFRAMES; player.flash = 0.25; sfx('hit'); shake(7, 0.25); burstLocal(player.x, player.y, 18, '#ff9a3c', 200, 0.5, 3);
  if (b.opts.practice) { b.phits = (b.phits || 0) + 1; return; }
  hero.glow -= dmg; floatText(localToWorld(player.x, player.y).x, localToWorld(player.x, player.y).y - 20, '-' + dmg, '#ff9a3c', 18, 0.7);
  if (hero.glow <= 0) { hero.glow = 0; coreBreak(b); }
}
function coreBreak(b) {
  b.st = 'broken'; b.brokenT = 0; b.runner = null; sfx('death'); shake(12, 0.6);
  const w = localToWorld(player.x, player.y); burst(w.x, w.y, 70, '#ff9a3c', 260, 1.4, 4); burst(w.x, w.y, 20, '#e8c070', 160, 1.4, 5, 200);
  meta.deaths++; saveMeta();
}
/* ---- MERIDIAN's time control ---- */
function startTfx(mode, dur, opts) {
  const b = B; if (!b || b.st !== 'dodge') return;
  b.tfx = { mode, dur, t: 0, opts: opts || {} }; musicPaused = mode !== 'ff';
  if (mode === 'freeze') { sfx('freeze'); shake(5, 0.3); b.flash = 0.25; burstLocal(0, 0, 30, '#bfe4ff', 260, 0.6, 3); }
  if (mode === 'rewind') { sfx('rewind'); shake(4, 0.2); }
  if (mode === 'ff') { sfx('ff'); for (const bl of bullets) if (bl.home) bl.home = 0; } // homing would outrun you at 2x: birds fly straight while the clock skips
  if (b.runner) b.runner.alertT = 0;
}
function endTfx(b, quiet) {
  const tf = b.tfx; if (!tf) return; b.tfx = null; musicPaused = false;
  if (quiet) return;
  const boost = tf.opts.boost || 1;
  if (boost !== 1) for (const bl of bullets) { if ((tf.opts.skipCol && bl.col === tf.opts.skipCol) || (tf.opts.skipWall && bl.wall)) continue; bl.vx *= boost; bl.vy *= boost; if (bl.spd) bl.spd *= boost; }
  if (tf.mode === 'freeze' || tf.opts.boost) { sfx('resume'); shake(tf.opts.last ? 14 : 10, 0.45); b.flash = 0.35; burstLocal(0, 0, 40, '#ffe8a0', 300, 0.6, 3); }
  b.timerGlitch = 0.5;
  if (tf.mode === 'rewind') b.timerBack = 0;
  if (tf.opts.dup) { // RESUME x2: every bullet splits; the twin waits 0.45 s (dashed ring) before it moves
    for (const bl of bullets.slice()) { if (bl.k !== 0 || bl.age < bl.warn || bl.harmless || bl.soft || bl.home) continue; const c = Math.cos(0.4), s2 = Math.sin(0.4);
      shot(bl.x, bl.y, bl.vx * c - bl.vy * s2, bl.vx * s2 + bl.vy * c, bl.r, '#ff9a3c', { warn: 0.45, life: 0.45 + 3.2 }); }
    sfx('resume'); shake(9, 0.35); b.flash = 0.3; }
}
function drawTimer(b) { // the on-screen turn timer (MERIDIAN messes with this one)
  const r = b.runner; if (!r || b.st !== 'dodge') return;
  const tf = b.tfx, mode = tf ? tf.mode : null, warn = r.tfxWarn && r.alertT > 0;
  const x = Math.min(W - 60, ARENA_X + arena.w / 2 + 62), y = ARENA_Y - arena.h / 2 + 34, R = 24;
  let left = Math.max(0, r.def.dur - r.t + (b.timerBack || 0));
  const col = mode === 'freeze' ? '#9fd8ff' : mode === 'rewind' ? '#e070ff' : mode === 'ff' ? '#ff9a3c' : warn ? (Math.floor(b.t * 12) % 2 ? '#ff9a3c' : '#fff') : '#e8c070';
  ctx.save(); ctx.translate(x, y);
  if (mode === 'rewind' || (b.timerGlitch > 0)) ctx.translate(rand(-2, 2), rand(-1, 1));
  circ(0, 0, R + 4, '#120c1e'); ctx.lineWidth = 3; ctx.strokeStyle = col; ctx.beginPath(); ctx.arc(0, 0, R, 0, 6.283); ctx.stroke();
  const frac = clamp(left / r.def.dur, 0, 1); ctx.fillStyle = col; ctx.globalAlpha = 0.25; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, R - 3, -Math.PI / 2, -Math.PI / 2 + frac * 6.283); ctx.fill(); ctx.globalAlpha = 1;
  for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; line(Math.cos(a) * (R - 6), Math.sin(a) * (R - 6), Math.cos(a) * (R - 2), Math.sin(a) * (R - 2), col, 2); }
  const ha = -Math.PI / 2 + (mode === 'rewind' ? -b.t * 14 : mode === 'ff' ? b.t * 30 : (1 - frac) * 6.283) + (mode === 'freeze' ? Math.sin(b.t * 40) * 0.04 : 0);
  line(0, 0, Math.cos(ha) * (R - 5), Math.sin(ha) * (R - 5), '#fff', 2.5); circ(0, 0, 3, col);
  ctx.font = `bold 16px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  let txt = left.toFixed(1) + 's';
  if (mode === 'freeze') txt = Math.floor(b.t * 6) % 3 === 0 ? '--.-' : (r.def.dur - r.t).toFixed(1) + 's';
  if (b.timerGlitch > 0 || (r.def.finale && Math.random() < 0.04)) txt = pick(['11:59', '??.?', '0.0s', '99.9s', '-' + left.toFixed(1)]);
  ctx.fillStyle = col; ctx.fillText(txt, 0, R + 18);
  ctx.font = `bold 11px ${FONT}`; const tag = mode === 'freeze' ? '❚❚ STOPPED' : mode === 'rewind' ? '◀◀ REWIND' : mode === 'ff' ? '▶▶ x2' : warn ? '! ! !' : 'TIME';
  ctx.fillText(tag, 0, -R - 12);
  ctx.restore();
  // countdown to resume
  if (mode === 'freeze') { const lft = tf.dur - tf.t; if (lft < 0.9) { const n = Math.ceil(lft / 0.3); ctx.font = `bold ${60 + (lft % 0.3) * 80}px ${FONT}`; ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(n), ARENA_X, ARENA_Y); } }
}
function drawTimeFxOverlay(b) {
  const tf = b.tfx; if (!tf) return; const T = b.t, mode = tf.mode;
  if (mode === 'freeze') {
    ctx.fillStyle = 'rgba(90,150,255,.14)'; ctx.fillRect(0, 0, W, H);
    const x0 = ARENA_X - arena.w / 2, y0 = ARENA_Y - arena.h / 2; ctx.strokeStyle = 'rgba(220,240,255,.55)'; ctx.lineWidth = 1.5;
    for (const [cx, cy, dx, dy] of [[x0, y0, 1, 1], [x0 + arena.w, y0, -1, 1], [x0, y0 + arena.h, 1, -1], [x0 + arena.w, y0 + arena.h, -1, -1]]) { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + dx * 26, cy + dy * 10); ctx.lineTo(cx + dx * 40, cy + dy * 22); ctx.moveTo(cx + dx * 26, cy + dy * 10); ctx.lineTo(cx + dx * 18, cy + dy * 30); ctx.stroke(); }
    ctx.font = `bold 22px ${FONT}`; ctx.textAlign = 'center'; ctx.fillStyle = '#cfe8ff'; ctx.fillText('— TIME STOPPED —', ARENA_X, ARENA_Y - arena.h / 2 - 30);
  } else if (mode === 'rewind') {
    ctx.fillStyle = 'rgba(80,0,90,.10)'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(0,0,0,.18)'; for (let y = (T * 120) % 4; y < H; y += 4) ctx.fillRect(0, y, W, 1.5);
    const by = (T * 300) % (H + 40) - 20; ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(0, by, W, 14);
    ctx.font = `bold 24px ${FONT}`; ctx.textAlign = 'left'; ctx.fillStyle = Math.floor(T * 4) % 2 ? '#fff' : '#e070ff'; ctx.fillText('◀◀ REWIND', 24, 74);
    ctx.font = `14px ${FONT}`; ctx.fillStyle = '#ddd'; ctx.fillText('11:59:' + String(59 - Math.floor(T * 30) % 60).padStart(2, '0'), 30, 98);
  } else if (mode === 'ff') {
    ctx.fillStyle = 'rgba(255,140,40,.08)'; ctx.fillRect(0, 0, W, H);
    ctx.font = `bold 24px ${FONT}`; ctx.textAlign = 'left'; ctx.fillStyle = '#ff9a3c'; ctx.fillText('▶▶ SKIP AHEAD', 24, 74);
  }
}
/* ---- per-step battle update ---- */
function updateBattle(dt) {
  const b = B; if (!b) return;
  b.t += dt; if (b.hurt > 0) b.hurt -= dt; if (b.slashT > 0) b.slashT -= dt; if (b.hpBarT > 0) b.hpBarT -= dt; if (b.bannerT > 0) b.bannerT -= dt; if (b.flash > 0) b.flash -= dt; if (b.glowFlash > 0) b.glowFlash -= dt; if (b.timerGlitch > 0) b.timerGlitch -= dt;
  b.shownHp += (b.hp - b.shownHp) * Math.min(1, dt * 5);
  if (b.dying) b.dying += dt; if (b.sparing) b.sparing += dt;
  if (b.mer) { b.mer.raiseS = (b.mer.raiseS || 0) + ((b.mer.raise || 0) - (b.mer.raiseS || 0)) * Math.min(1, dt * 4); }
  const tmode = b.tfx ? b.tfx.mode : null;
  if (tmode === 'rewind') arena.rot -= arena.av * dt * 2; else if (tmode !== 'freeze') updateArena(dt);
  if (b.typer) b.typer.update(dt);
  if (b.bubble) { b.bubble.update(dt); b.bubbleT += dt; }
  const ok = act('ok'), back = act('back');
  const tap = b.st === 'dodge' ? null : takeTap();
  switch (b.st) {
    case 'trans': b.transT += dt; if (b.transT > 0.7) bDone(); break;
    case 'msg': if ((ok || tap) && b.typer) { if (!b.typer.done) b.typer.finish(); else { sfx('select'); bDone(); } } break;
    case 'talk': if (b.bubble) { const need = 1.0 + b.bubble.text.length * 0.045; if ((ok || tap) && b.bubbleT > 0.15) { if (!b.bubble.done) b.bubble.finish(); else bDone(); } else if (b.bubble.done && b.bubbleT > need + 0.6) bDone(); } break;
    case 'pause': b.pauseT -= dt; if (b.pauseT <= 0) bDone(); break;
    case 'menu': {
      if (act('left')) { b.sel = (b.sel + 3) % 4; sfx('move'); } if (act('right')) { b.sel = (b.sel + 1) % 4; sfx('move'); }
      if (tap) { for (let i = 0; i < 4; i++) { const r = btnRect(i); if (tap.x >= r.x && tap.x <= r.x + r.w && tap.y >= r.y - 6 && tap.y <= r.y + r.h + 6) { b.sel = i; sfx('select'); bDone(i); return; } } }
      if (ok) { sfx('select'); bDone(b.sel); }
      break; }
    case 'list': {
      const L = b.list; if (!L) break; const n = L.opts.length;
      if (act('up')) { L.sel = (L.sel - 2 + n * 2) % n; sfx('move'); } if (act('down')) { L.sel = (L.sel + 2) % n; sfx('move'); }
      if (act('left') || act('right')) { L.sel = L.sel % 2 ? L.sel - 1 : Math.min(n - 1, L.sel + 1); sfx('move'); }
      if (tap) { const hit = listHit(tap); if (hit === -2) { sfx('back'); bDone(-1); return; } if (hit >= 0) { L.sel = hit; sfx('select'); bDone(hit); return; } }
      if (ok) { sfx('select'); bDone(L.sel); } else if (back) { sfx('back'); bDone(-1); }
      break; }
    case 'aim': {
      b.aim += dt * b.aimSpd * 1.4;
      if (ok || tap) { const d = Math.abs(b.aim); const mult = d > 0.97 ? 0 : d < 0.04 ? 2.4 : 2.1 * (1 - d) + 0.15; b.aimHit = b.aim; b.aimHitT = 0.6; bDone(mult); }
      else if (b.aim > 1.05) bDone(0);
      break; }
    case 'dodge': {
      const ts = hhTS(b); if (b.preT > 0) { b.preT -= dt; if (b.preT <= 0) b.runner = new Runner(b.pendingDef, b.pendingD); updateBullets(dt * ts); }
      else if (b.runner) {
        const tf = b.tfx, mode = tf ? tf.mode : null;
        if (tf) { tf.t += dt; const left = tf.dur - tf.t;
          if (mode === 'freeze') { const n = Math.ceil(left / 0.3); if (left < 0.9 && n !== tf.lastN) { tf.lastN = n; sfx(n % 2 ? 'tick' : 'tock'); shake(2, 0.08); } }
          if (mode === 'rewind') { tf.sT = (tf.sT || 0) - dt; if (tf.sT <= 0) { tf.sT = 0.13; sfx('rewind'); } }
          if (mode === 'ff') { tf.sT = (tf.sT || 0) - dt; if (tf.sT <= 0) { tf.sT = 0.09; sfx('ff'); } } }
        if (mode === 'freeze') { /* the world holds its breath */ }
        else if (mode === 'rewind') { rewindBullets(2); b.timerBack += dt * 2; }
        else { const reps = mode === 'ff' ? 2 : 1, bx1 = mode === 'ff' && tf.opts.bx1; let fin = false; for (let i = 0; i < reps && !fin; i++) { fin = b.runner.step(dt * ts); if (!bx1 || i === 0) updateBullets(dt * ts); } if (fin && !b.tfx) { bDone(); break; } }
        if (b.tfx && b.tfx.t >= b.tfx.dur) endTfx(b);
      }
      updateSoul(dt * (b.tfx && b.tfx.mode === 'freeze' ? 0.75 : 1));
      for (const bl of bullets) { if (bl.age < bl.warn || bl.harmless || bl.soft) continue;
        if (bulletTouches(bl, player.x, player.y, HIT_R)) { soulHit(bl); if (b.st !== 'dodge') break; }
        else if (!bl.gz && player.inv <= 0 && bulletTouches(bl, player.x, player.y, GRAZE_R)) { bl.gz = true; sfx('graze'); burstLocal(player.x, player.y, 3, '#fff', 90, 0.25, 2); } }
      break; }
    case 'broken': b.brokenT += dt; updateBullets(dt); if (b.brokenT > 1.8 && !b.overShown) { b.overShown = true; gameOver(b); } break;
  }
}
function listLayout() { const x0 = ARENA_X - TBOX[0] / 2, y0 = ARENA_Y - TBOX[1] / 2; return { x0, y0, cw: 400, ch: 32 }; }
function listHit(tap) {
  const L = B.list; if (!L) return -1; const { x0, y0, cw, ch } = listLayout();
  if (tap.x > x0 + TBOX[0] - 110 && tap.y < y0 + 40 && tap.y > y0 - 10) return -2;
  for (let i = 0; i < L.opts.length; i++) { const cx = x0 + 40 + (i % 2) * cw, cy = y0 + 22 + Math.floor(i / 2) * ch; if (tap.x >= cx - 30 && tap.x <= cx + cw - 20 && tap.y >= cy - 4 && tap.y <= cy + ch - 2) return i; }
  // tapping outside the box = back
  if (tap.y > y0 + TBOX[1] + 4 && tap.y < BTN_Y - 4) return -2;
  for (let i = 0; i < 4; i++) { const r = btnRect(i); if (tap.x >= r.x && tap.x <= r.x + r.w && tap.y >= r.y) return -2; }
  return -1;
}
/* ---- battle render ---- */
const THEME_BG = { forest: ['#0d1a10', '#1a2a14'], town: ['#1a1220', '#2a1a2a'], cog: ['#141010', '#2a1e14'], spire: ['#120a1e', '#221436'], belfry: ['#0a0612', '#1a0a1e'] };
function drawBattle() {
  const b = B, T = b ? b.t : 0, room = ROOMS[hero.room], th = (b && b.opts.theme) || (room ? room.theme : 'forest');
  const ph = b && b.mer ? b.mer.phase : -1;
  const bg = ph >= 0 ? [['#0b0816', '#16102a'], ['#07111a', '#0e2030'], ['#140f06', '#2a1e08'], ['#120618', '#260c30'], ['#1a0508', '#300a10']][ph] : THEME_BG[th] || THEME_BG.forest;
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, bg[0]); g.addColorStop(1, bg[1]); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (const [gx, gy, gr, sp] of [[110, 120, 90, 0.2], [860, 400, 120, -0.15], [880, 90, 60, 0.3], [70, 430, 70, -0.25]]) gear(gx, gy, gr, 12, T * sp, 'rgba(255,255,255,0.035)', null);
  if (!b) return;
  // enemy
  const e = b.e; ctx.save();
  let ex = EX, ey = EY; if (b.hurt > 0) ex += Math.sin(b.t * 60) * b.hurt * 10;
  let alpha = 1; if (b.dying) alpha = clamp(1 - b.dying / 1.2, 0, 1); if (b.sparing) alpha = clamp(1 - b.sparing * 0.6, 0.25, 1);
  ctx.globalAlpha = alpha;
  if (b.sparing) { ctx.filter = 'grayscale(0.6) brightness(1.3)'; }
  if (b.mer) { const m = b.mer; drawMeridian(ex, ey - 10, b.t, { hurt: b.hurt, final: m.final, eye: m.eye, cracks: m.cracks, raise: m.raiseS, dead: m.dead }); }
  else ART[e.art](ex, ey, b.t, { hurt: b.hurt });
  ctx.filter = 'none'; ctx.restore();
  drawBossStage(b);
  if (b.slashT > 0) { const p = 1 - b.slashT / 0.5; ctx.save(); ctx.globalAlpha = 1 - p; ctx.strokeStyle = '#ffe8a0'; ctx.lineWidth = 6; for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(EX - 80 + i * 24, EY - 70 + p * 10); ctx.lineTo(EX + 80 + i * 24, EY + 70 * Math.min(1, p * 3) - 30); ctx.stroke(); } ctx.restore(); }
  // calm meter + hp bar
  if (!b.dying && !b.sparing && !b.opts.practice) {
    ctx.font = `bold 17px ${FONT}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; /* v1.8-c5: bigger for small phones */
    const cx = 20, cy = 22; ctx.fillStyle = spareable(b) ? '#ffd36e' : '#ddd'; ctx.fillText(e.name + (spareable(b) ? '  ✦ CALM' : ''), cx, cy);
    ctx.fillStyle = '#332a1a'; ctx.fillRect(cx, cy + 13, 150, 9); ctx.fillStyle = '#ffd36e'; ctx.fillRect(cx, cy + 13, 150 * (spareable(b) ? 1 : b.calm / 100), 9);
    ctx.fillStyle = '#c8c0d8'; ctx.font = `bold 14px ${FONT}`; ctx.fillText(b.mer ? 'WIND-DOWN' : 'CALM', cx + 158, cy + 18);
    if (b.hpBarT > 0) { const bw = 180; ctx.fillStyle = '#400'; ctx.fillRect(EX - bw / 2, EY + 96, bw, 10); ctx.fillStyle = '#7fe08a'; ctx.fillRect(EX - bw / 2, EY + 96, bw * clamp(b.shownHp / b.maxhp, 0, 1), 10); }
  }
  // bubble
  if (b.bubble) {
    ctx.font = `bold 16px ${FONT}`; const lines = wrapText(b.bubble.str || ' ', 250), bw = 280, bh = 24 + Math.max(1, wrapText(b.bubble.text, 250).length) * 20;
    const bx = EX + (b.mer ? 140 : 120), by = EY - 80;
    ctx.fillStyle = '#fff8e8'; rrect(bx, by, bw, bh, 10); ctx.fill(); poly([bx + 2, by + 26, bx - 16, by + 36, bx + 2, by + 40], '#fff8e8');
    ctx.fillStyle = '#1a1020'; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; lines.forEach((ln, i) => ctx.fillText(ln, bx + 12, by + 12 + i * 20));
  }
  // box
  ctx.save(); ctx.translate(ARENA_X + (b.tfx && b.tfx.mode === 'rewind' ? rand(-2.5, 2.5) : 0), ARENA_Y); ctx.rotate(arena.rot);
  const aw = arena.w, ah = arena.h;
  ctx.fillStyle = '#05040a'; ctx.fillRect(-aw / 2, -ah / 2, aw, ah);
  ctx.save(); ctx.beginPath(); ctx.rect(-aw / 2, -ah / 2, aw, ah); ctx.clip();
  if (b.st === 'dodge' || b.st === 'broken') {
    ctx.strokeStyle = 'rgba(200,160,80,.08)'; ctx.lineWidth = 1; for (let x = -aw / 2; x < aw / 2; x += 20) line(x, -ah / 2, x, ah / 2, 'rgba(200,160,80,.06)', 1); for (let y = -ah / 2; y < ah / 2; y += 20) line(-aw / 2, y, aw / 2, y, 'rgba(200,160,80,.06)', 1);
    const md = b.tfx ? b.tfx.mode : null;
    if (md === 'rewind') { for (const bl of bullets) { if (bl.k !== 0 || !bl.hc) continue; ctx.fillStyle = 'rgba(224,112,255,.35)'; for (let k = 12; k < 180; k += 24) { const hp = histPoint(bl, k); if (!hp) break; ctx.fillRect(hp[0] - 1.5, hp[1] - 1.5, 3, 3); } }
      ctx.save(); ctx.globalAlpha = 0.45; ctx.translate(-3, 0); for (const bl of bullets) if (bl.k === 0) circ(bl.x, bl.y, bl.r, '#ff3355'); ctx.translate(6, 0); for (const bl of bullets) if (bl.k === 0) circ(bl.x, bl.y, bl.r, '#33e0ff'); ctx.restore(); }
    if (md === 'ff') { for (const bl of bullets) if (bl.k === 0) line(bl.x - bl.vx * 0.08, bl.y - bl.vy * 0.08, bl.x, bl.y, 'rgba(255,154,60,.5)', bl.r * 1.4); }
    if (b.runner && b.runner.zones) for (const z of b.runner.zones) { ctx.fillStyle = z.f < 1 ? 'rgba(90,150,255,.17)' : 'rgba(255,140,60,.17)'; ctx.fillRect(z.x0, -arena.h / 2, z.x1 - z.x0, arena.h);
      ctx.fillStyle = z.f < 1 ? 'rgba(159,216,255,.55)' : 'rgba(255,170,90,.55)'; ctx.font = 'bold 12px Georgia,serif'; ctx.textAlign = 'center'; ctx.fillText(z.f < 1 ? 'SLOW' : 'FAST', (z.x0 + z.x1) / 2, -arena.h / 2 + 14); }
    // v1.7-c21 perf: the freeze tint used ctx.filter on every bullet draw (one filter pass per bullet => 150-1300ms hitches
    // at 6x CPU throttle in MERIDIAN time-stops). Now bullets go to one offscreen layer, filtered once in a single drawImage.
    if (md === 'freeze') { const L = frzLayer(), g = L.getContext('2d'), m = ctx.getTransform(); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, L.width, L.height); g.setTransform(m);
      const c0 = ctx; ctx = g; try { for (const bl of bullets) drawBullet(bl); } finally { ctx = c0; }
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.filter = 'grayscale(0.85) brightness(1.25)'; ctx.drawImage(L, 0, 0); ctx.restore(); }
    else for (const bl of bullets) drawBullet(bl);
    if (md === 'freeze') { ctx.fillStyle = 'rgba(120,180,255,.16)'; ctx.fillRect(-aw / 2, -ah / 2, aw, ah); }
    if (b.st === 'dodge') { const blink = player.inv > 0 && Math.floor(player.inv * 16) % 2 === 0;
      if (!blink) { ctx.save(); ctx.translate(player.x, player.y); ctx.rotate(-arena.rot); drawCore(0, 0, b.t, player.blue, player.flash > 0); ctx.restore(); }
      if (settings.hitbox || player.focus) { circ(player.x, player.y, HIT_R, '#fff'); }
      if (settings.hitbox) { ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.arc(player.x, player.y, GRAZE_R, 0, 6.283); ctx.stroke(); ctx.setLineDash([]); } }
    const dk = b.runner && b.runner.dark || 0;
    if (dk > 0) { const g2 = ctx.createRadialGradient(player.x, player.y, 40, player.x, player.y, 95); g2.addColorStop(0, 'rgba(5,4,10,0)'); g2.addColorStop(1, `rgba(5,4,10,${0.86 * dk})`);
      ctx.fillStyle = g2; ctx.fillRect(-aw / 2, -ah / 2, aw, ah); }
  }
  ctx.restore();
  ctx.strokeStyle = player.blue && b.st === 'dodge' ? '#7fb6ff' : '#c8a050'; ctx.lineWidth = 5; ctx.strokeRect(-aw / 2 - 2.5, -ah / 2 - 2.5, aw + 5, ah + 5);
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) circ(sx * (aw / 2 + 2), sy * (ah / 2 + 2), 4.5, '#e8c070');
  ctx.restore();
  const x0 = ARENA_X - aw / 2, y0 = ARENA_Y - ah / 2, boxReady = Math.abs(aw - TBOX[0]) < 4;
  // box contents
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  if (boxReady && (b.st === 'msg' || b.st === 'menu' || b.st === 'pause' && b.typer) && b.typer) {
    ctx.font = `bold 20px ${FONT}`; ctx.fillStyle = '#f4ecd8'; wrapText(b.typer.str, aw - 70).slice(0, 4).forEach((ln, i) => ctx.fillText(ln, x0 + 36, y0 + 20 + i * 28));
    drawCore(x0 + 20, y0 + 32, b.t, false, false);
    if (b.st === 'msg' && b.typer.done && Math.floor(b.t * 3) % 2) poly([x0 + aw - 34, y0 + ah - 26, x0 + aw - 22, y0 + ah - 26, x0 + aw - 28, y0 + ah - 18], '#ffd36e');
  }
  if (boxReady && b.st === 'list' && b.list) {
    const L = b.list, { cw, ch } = listLayout(); ctx.font = `bold 19px ${FONT}`;
    L.opts.forEach((o, i) => { const cx = x0 + 40 + (i % 2) * cw, cy = y0 + 22 + Math.floor(i / 2) * ch;
      const gold = L.cmd === 3 && i === 0 && spareable(b); ctx.fillStyle = i === L.sel ? '#ffd36e' : gold ? '#ffd36e' : '#f4ecd8'; if (i === L.sel) drawCore(cx - 14, cy + 10, b.t, false, false);
      let lab = o; if (L.cmd === 2) { const it = ITEMS[hero.items[i]]; lab = o + (it.kind === 'heal' ? ` (+${it.v > 99 ? 'ALL' : it.v})` : ''); } ctx.fillText(lab, cx + 4, cy); });
    ctx.font = `13px ${FONT}`; ctx.fillStyle = '#aaa'; ctx.textAlign = 'right'; ctx.fillText(touch.seen ? '✕ BACK' : 'X: back', x0 + aw - 18, y0 + 12); ctx.textAlign = 'left';
    if (L.cmd === 2) { const it = ITEMS[hero.items[L.sel]]; if (it) { ctx.fillStyle = '#bba'; ctx.font = `italic 14px ${FONT}`; ctx.fillText(it.desc, x0 + 40, y0 + ah - 26); } }
  }
  if (boxReady && b.st === 'aim') {
    const gx = x0 + 40, gw = aw - 80, gy = y0 + 30, gh = ah - 60, mid = gx + gw / 2;
    for (let i = 0; i < 40; i++) { const f = 1 - Math.abs(i - 19.5) / 20; ctx.fillStyle = `rgb(${Math.round(60 + 195 * f)},${Math.round(40 + 170 * f)},${Math.round(30 + 60 * f)})`; ctx.fillRect(gx + i * gw / 40, gy + gh / 2 - 10 - f * 30, gw / 40 - 2, 20 + f * 60); }
    ctx.fillStyle = '#fff'; ctx.fillRect(mid - 2, gy, 4, gh);
    const cx = mid + b.aim * gw / 2; ctx.fillStyle = '#05040a'; ctx.fillRect(cx - 6, gy - 8, 12, gh + 16); ctx.fillStyle = '#ffd36e'; ctx.fillRect(cx - 4, gy - 6, 8, gh + 12);
    ctx.font = `14px ${FONT}`; ctx.fillStyle = '#aaa'; ctx.fillText(touch.seen ? 'tap when the needle is in the middle' : 'Z / Enter when the needle is in the middle', x0 + 40, y0 + ah - 22);
  }
  // stat line
  const sy = 453; ctx.font = `bold 17px ${FONT}`; ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.fillStyle = '#f4ecd8';
  ctx.fillText(b.opts.practice ? 'PRACTICE' : `${hero.name}`, 40, sy); ctx.fillStyle = '#c8a050'; ctx.fillText(b.opts.practice ? '' : `COIL ${hero.coil}`, 180, sy);
  if (!b.opts.practice) { ctx.fillStyle = '#ddd'; ctx.fillText('GLOW', 300, sy); const mg = maxGlow(hero), bw = Math.min(200, 60 + mg * 2.4);
    ctx.fillStyle = '#3a1a0a'; ctx.fillRect(360, sy - 10, bw, 20); hhGhostBar(b, mg, 360, sy - 10, bw, 20); ctx.fillStyle = b.glowFlash > 0 ? '#fff' : '#ff9a3c'; ctx.fillRect(360, sy - 10, bw * hero.glow / mg, 20); ctx.fillStyle = '#f4ecd8'; ctx.fillText(`${hero.glow} / ${mg}`, 370 + bw, sy); }
  else { ctx.fillStyle = '#ccc'; ctx.fillText(`${b.opts.practice.name} · clears ${b.loops || 0} · hits ${b.phits || 0}`, 180, sy); }
  if (player.blue && b.st === 'dodge') { ctx.fillStyle = '#7fb6ff'; ctx.textAlign = 'right'; ctx.font = `bold 14px ${FONT}`; ctx.fillText('WEIGHTED · jump: ↑ / W / Space', W - 30, sy); }
  // buttons
  if (!b.opts.practice) for (let i = 0; i < 4; i++) { const r = btnRect(i), on = b.st === 'menu' && b.sel === i, active = b.st === 'menu' || b.st === 'list';
    ctx.globalAlpha = active ? 1 : 0.45; rrect(r.x, r.y, r.w, r.h, 8); ctx.fillStyle = on ? '#3a2a10' : '#120c1e'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = on ? '#ffd36e' : '#c8a050'; ctx.stroke();
    drawBtnIcon(i, r.x + 30, r.y + r.h / 2, on ? '#ffd36e' : '#c8a050', b.t); ctx.font = `bold 20px ${FONT}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = on ? '#ffd36e' : '#e8d8b0'; ctx.fillText(BTNS[i], r.x + 58, r.y + r.h / 2 + 1); ctx.globalAlpha = 1; }
  drawTimeFxOverlay(b); drawTimer(b);
  // banner / alerts
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (b.bannerT > 0 && window.HH_BANNERS) { ctx.globalAlpha = clamp(b.bannerT, 0, 1); ctx.font = `bold 34px ${FONT}`; ctx.fillStyle = b.mer ? b.mer.eye : '#ffd36e'; ctx.fillText(`— ${b.banner} —`, W / 2, 230); ctx.globalAlpha = 1; }
  if (b.runner && b.runner.alertT > 0) { ctx.font = `bold 28px ${FONT}`; ctx.fillStyle = Math.floor(b.runner.alertT * 10) % 2 ? '#ff9a3c' : '#fff'; ctx.fillText(b.runner.alert, W / 2, 200); }
  if (b.st === 'dodge' && b.runner && b.runner.rule) { const ry = ARENA_Y - arena.h / 2 - 40; ctx.font = `bold 18px ${FONT}`; ctx.fillStyle = '#ffcc55'; ctx.fillText('⚠ ' + b.runner.rule + ' ⚠', W / 2, ry);
    if (b.runner.meter > 0.05) { ctx.fillStyle = '#332a1a'; ctx.fillRect(W / 2 - 60, ry + 12, 120, 6); ctx.fillStyle = '#ff6677'; ctx.fillRect(W / 2 - 60, ry + 12, 120 * clamp(b.runner.meter, 0, 1), 6); } }
  if (b.st === 'dodge' && b.runner && !b.tfx && !b.runner.rule) { ctx.font = `13px ${FONT}`; ctx.fillStyle = 'rgba(232,216,176,.6)'; ctx.fillText(b.runner.def.name, W / 2, ARENA_Y - arena.h / 2 - 16); }
  if (b.mer && b.st !== 'trans' && !b.opts.practice) { ctx.font = `12px ${FONT}`; ctx.fillStyle = '#aaa'; ctx.textAlign = 'right'; ctx.fillText(`attack ${Math.min(b.mer.idx + 1, MER_ATTACKS.length)} / ${MER_ATTACKS.length}`, W - 70, 22); }
  if (b.flash > 0) { ctx.fillStyle = `rgba(255,255,255,${b.flash})`; ctx.fillRect(0, 0, W, H); }
  if (b.st === 'trans') { const p = clamp(b.transT / 0.7, 0, 1); ctx.fillStyle = `rgba(0,0,0,${1 - p})`; ctx.fillRect(0, 0, W, H); }
  if (b.st === 'broken') { ctx.fillStyle = `rgba(0,0,0,${clamp(b.brokenT / 1.6, 0, 0.85)})`; ctx.fillRect(0, 0, W, H); }
  drawPauseBtn();
  if (touch.seen && b.st === 'dodge') drawDodgeTouch();
}
function drawBtnIcon(i, x, y, col, t) {
  ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 3;
  if (i === 0) { line(x - 9, y + 9, x + 9, y - 9, col, 4); line(x - 10, y + 2, x - 2, y + 10, col, 3); }
  else if (i === 1) { rrect(x - 11, y - 9, 22, 15, 5); ctx.stroke(); poly([x - 5, y + 6, x - 9, y + 12, x + 1, y + 6], col); }
  else if (i === 2) { rrect(x - 10, y - 5, 20, 15, 4); ctx.stroke(); ctx.beginPath(); ctx.arc(x, y - 5, 6, Math.PI, 0); ctx.stroke(); }
  else { gear(x, y, 8, 6, t, col, '#120c1e'); }
  ctx.restore();
}
function drawBullet(b) {
  const warn = b.age < b.warn, fade = b.home && b.life - b.age < 0.35 ? (b.life - b.age) / 0.35 : 1;
  ctx.globalAlpha = fade;
  if (b.k === 0) {
    if (warn) { const p = b.age / b.warn; ctx.strokeStyle = '#ff9a3c'; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.arc(b.x, b.y, b.r * (1.6 - p * 0.6), 0, 6.283); ctx.stroke(); ctx.setLineDash([]); }
    else if (b.soft) { circ(b.x, b.y, b.r * 2.6, 'rgba(255,231,168,.12)'); circ(b.x, b.y, b.r, b.col); }
    else { circ(b.x, b.y, b.r, b.col); if (b.label) { ctx.fillStyle = '#1a0f20'; ctx.font = 'bold 11px Georgia,serif'; ctx.textAlign = 'center'; ctx.fillText(b.label(b), b.x, b.y + 4); } else circ(b.x, b.y, b.r * 0.45, 'rgba(0,0,0,.35)'); }
  } else if (b.k === 1) {
    ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.ang);
    if (warn) { const p = b.age / b.warn, bl = Math.floor(b.age * 14) % 2; ctx.fillStyle = `rgba(255,${bl ? 154 : 70},60,${0.12 + p * 0.25})`; ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h); ctx.strokeStyle = '#ff9a3c'; ctx.lineWidth = 2; ctx.strokeRect(-b.w / 2 + 2, -b.h / 2 + 2, b.w - 4, b.h - 4); }
    else { ctx.fillStyle = b.col; ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h); if (b.w < 40 && b.h > 14) { ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(-b.w / 2 + 3, -b.h / 2 + 3, b.w - 6, b.h - 6); } }
    ctx.restore();
  } else {
    ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.ang); const L0 = b.len ? 0 : -800, L1 = b.len || 800;
    if (warn || b.harmless) { const p = clamp(b.age / Math.max(0.01, b.warn), 0, 1); ctx.strokeStyle = Math.floor(b.age * 14) % 2 ? '#ff9a3c' : '#ffe0a0'; ctx.lineWidth = 1 + p * 2; ctx.setLineDash([10, 6]); ctx.beginPath(); ctx.moveTo(L0, 0); ctx.lineTo(L1, 0); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = `rgba(255,150,60,${p * 0.18})`; ctx.fillRect(L0, -b.w / 2, L1 - L0, b.w); }
    else { const fl = 0.8 + Math.random() * 0.2; ctx.fillStyle = b.col; ctx.globalAlpha = 0.45 * fade; ctx.fillRect(L0, -b.w / 2 - 4, L1 - L0, b.w + 8); ctx.globalAlpha = fade; ctx.fillStyle = '#fff'; ctx.fillRect(L0, -b.w * fl / 2, L1 - L0, b.w * fl); }
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}
function drawPauseBtn() { const pb = PAUSE_BTN; ctx.globalAlpha = 0.8; ctx.strokeStyle = '#c8a050'; ctx.lineWidth = 2; rrect(pb.x, pb.y, pb.w, pb.h, 8); ctx.stroke(); ctx.fillStyle = '#e8d8b0'; ctx.fillRect(pb.x + 15, pb.y + 13, 6, 22); ctx.fillRect(pb.x + 27, pb.y + 13, 6, 22); ctx.globalAlpha = 1; }
function drawJoy() { if (!touch.joy) return; const j = touch.joy; ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(j.bx, j.by, JOY_R, 0, 6.283); ctx.stroke(); const dx = j.cx - j.bx, dy = j.cy - j.by, m = Math.hypot(dx, dy), k = m > JOY_R ? JOY_R / m : 1; circ(j.bx + dx * k, j.by + dy * k, 24, 'rgba(255,255,255,.45)'); }
function drawDodgeTouch() {
  drawJoy();
  if (!touch.joy && settings.mode === 'joystick') { ctx.font = `12px ${FONT}`; ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.textAlign = 'center'; ctx.fillText('touch left side to move', 150, H - 30); }
  ctx.strokeStyle = touch.focusIds.size ? '#ffd36e' : 'rgba(255,255,255,.3)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(FOCUS_BTN.x, FOCUS_BTN.y, 46, 0, 6.283); ctx.stroke();
  ctx.font = `bold 14px ${FONT}`; ctx.fillStyle = touch.focusIds.size ? '#ffd36e' : 'rgba(255,255,255,.5)'; ctx.textAlign = 'center'; ctx.fillText('FOCUS', FOCUS_BTN.x, FOCUS_BTN.y);
}

/* per-boss stagecraft: each finale bends the battle screen differently */
function drawBossStage(b) {
  const id = b.e.id, tr = b.turn || 0;
  if (id === 'wicklow') { // the light is going out as the fight goes on
    const a = Math.min(0.55, tr * 0.09 + (b.runner && b.runner.dark ? 0.2 : 0)); if (a <= 0) return;
    const g = ctx.createRadialGradient(EX, EY - 30, 30, EX, EY, 520); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  } else if (id === 'cuckoo') { // curtains close in; a spotlight follows you
    const cw = Math.min(170, 20 + tr * 22) + (b.runner && b.runner.def.stage ? 30 : 0);
    for (const side of [0, 1]) { const x = side ? W - cw : 0; const g = ctx.createLinearGradient(x, 0, x + cw, 0); g.addColorStop(side ? 1 : 0, '#5a0f22'); g.addColorStop(side ? 0 : 1, '#2a0510');
      ctx.fillStyle = g; ctx.fillRect(x, 0, cw, H); ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 3; for (let k = 12; k < cw; k += 18) line(x + k, 0, x + k + Math.sin(b.t + k) * 3, H, 'rgba(0,0,0,.22)', 3); }
    if (b.st === 'dodge') { const px = ARENA_X + player.x, py = ARENA_Y + player.y; ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(px, py, 5, px, py, 70); g.addColorStop(0, 'rgba(255,240,200,.16)'); g.addColorStop(1, 'rgba(255,240,200,0)'); ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(W / 2 - 20, 0); ctx.lineTo(W / 2 + 20, 0); ctx.lineTo(px + 60, py + 20); ctx.lineTo(px - 60, py + 20); ctx.closePath(); ctx.fillStyle = 'rgba(255,240,200,.05)'; ctx.fill(); ctx.restore(); }
  } else if (id === 'grit' && b.runner && b.runner.rule) { // the factory floor lights up with hazard stripes
    ctx.save(); ctx.globalAlpha = 0.18; for (let x = -40; x < W; x += 40) poly([x + (b.t * 40) % 40, H - 18, x + 20 + (b.t * 40) % 40, H - 18, x + 40 + (b.t * 40) % 40, H, x + 20 + (b.t * 40) % 40, H], '#ffcc55'); ctx.restore();
  }
}

let _frzL = null;
function frzLayer() { const c = ctx.canvas; if (!_frzL) _frzL = document.createElement('canvas'); if (_frzL.width !== c.width || _frzL.height !== c.height) { _frzL.width = c.width; _frzL.height = c.height; } return _frzL; }

/* v1.7-c29 hit feedback: damage-trail GLOW bar. On a hit, the lost part stays as a pale red ghost for 0.45 s and then drains
   (about 60% of max GLOW per second), so you can see how much that hit cost. Heals snap the ghost up. Wall-clock based. */
function hhGhostBar(b, mg, x, y, w, h) { const now = performance.now(), g = hero.glow;
  if (b.ghost == null || g >= b.ghost) { b.ghost = g; b.ghostHold = 0; b.ghostT = now; return; }
  const dt = Math.min(0.1, (now - (b.ghostT || now)) / 1000); b.ghostT = now;
  if (b.ghostLast !== g) { b.ghostLast = g; b.ghostHold = 0.45; }
  if (b.ghostHold > 0) b.ghostHold -= dt; else b.ghost = Math.max(g, b.ghost - mg * 0.6 * dt);
  ctx.fillStyle = '#e8b0a0'; ctx.fillRect(x, y, w * Math.min(1, b.ghost / mg), h); }
