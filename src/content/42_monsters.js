/* ===================== MORE REGULAR MONSTERS (2 per region) ===================== */
let _tok = 0;
const popLater = (S, b, t, fn) => { const tok = b.tok = ++_tok; S.at(S.t + t, () => { if (b.tok === tok && !b.dead && bullets.includes(b)) fn(b); }); };
/* ---- Rustwood ---- */
A.burrs = { name: 'Burr Drop', dur: 6.5, size: [260, 180], desc: 'burrs drift down, flash, then pop into four seeds',
  run(S) { S.every(0.85 / S.d, () => { const b = shot(rand(-hw() + 20, hw() - 20), -hh() - 6, 0, 55 * S.d, 7, '#8a6a2a');
    popLater(S, b, 1.1, b => { b.col = '#ffcf70'; });
    popLater(S, b, 1.55, b => { b.dead = true; for (const [vx, vy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) shot(b.x, b.y, vx * 95, vy * 95, 3.5, '#c8a050'); }); }, 0.2, 5.4); } };
A.thistle = { name: 'Thistledown', dur: 6, size: [260, 180], desc: 'fluff floats sideways on the breeze',
  run(S) { S.every(0.32 / S.d, n => { const y0 = rand(-hh() + 10, hh() - 10), ph = rand(0, 6), s = n % 2; shot(s ? hw() + 8 : -hw() - 8, y0, (s ? -1 : 1) * 70 * S.d, 0, 4, '#f4ecd8', { fn: b => { b.y = y0 + Math.sin(b.age * 2.5 + ph) * 18; } }); }, 0, 5.4); } };
A.slimeTrail = { name: 'Slime Trail', dur: 7, size: [260, 180], desc: 'a very slow snail chases you and leaves sticky slime',
  run(S) { let sn = null; S.at(0, () => { sn = shot(0, -hh() + 14, 0, 0, 9, '#c8b0e0', { home: 1.2, spd: 48 * S.d, life: 6.6 }); });
    S.every(0.28, () => { if (sn && !sn.dead && bullets.includes(sn)) shot(sn.x, sn.y, 0, 0, 5, '#9ad88a', { warn: 0.25, life: 2.4 }); }, 0.6, 6.4);
    S.every(1.5, () => { for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283 + S.t; shot(Math.cos(a) * 160, Math.sin(a) * 160, -Math.cos(a) * 60, -Math.sin(a) * 60, 4, '#d8c8f0', { life: 2.6 }); } }, 1.5, 6); } };
A.shellSpin = { name: 'Shell Spin', dur: 6.5, size: [240, 200], desc: 'a lazy spiral from the shell. lazy, but long.',
  run(S) { let a = 0; S.every(0.16 / S.d, () => { for (let k = 0; k < 2; k++) { const aa = a + k * Math.PI; shot(0, 0, Math.cos(aa) * 70 * S.d, Math.sin(aa) * 70 * S.d, 4.5, k ? '#c8b0e0' : '#9ad88a'); } }, 0.4, 5.8);
    return (t, dt) => { a += 1.3 * dt; }; } };
/* ---- Cogworks ---- */
A.wrenchSpin = { name: 'Wrench Spin', dur: 7, size: [300, 190], desc: 'spinning wrenches tumble across. watch the long end.',
  run(S) { S.every(0.9 / S.d, n => { const s = n % 2, y = clamp(n % 3 ? rand(-hh() + 30, hh() - 30) : P.y, -hh() + 30, hh() - 30);
    bar(s ? hw() + 40 : -hw() - 40, y, 56, 9, (s ? -1 : 1) * 150 * S.d, 0, '#b8b8c8', { av: (s ? 1 : -1) * 3.2 }); }, 0.2, 6);
    S.every(1.6, () => shot(rand(-hw(), hw()), -hh() - 8, 0, 110, 4, '#c8a050'), 0.8, 6); } };
A.boltSpray = { name: 'Bolt Spray', dur: 6.5, size: [280, 190], desc: 'three-bolt fans, aimed at you, from the corners',
  run(S) { const cs = [[-1, -1], [1, -1], [-1, 1], [1, 1]]; S.every(0.75 / S.d, n => { const [cx, cy] = cs[n % 4], x = cx * hw(), y = cy * hh(), a0 = Math.atan2(P.y - y, P.x - x);
    for (const da of [-0.32, 0, 0.32]) shot(x, y, Math.cos(a0 + da) * 125 * S.d, Math.sin(a0 + da) * 125 * S.d, 4.5, '#ddd'); sfx('blip', 500); }, 0.3, 5.8); } };
A.fuseDive = { name: 'Fuse Dive', dur: 7, size: [280, 200], desc: 'bats dive, stop, fizz (watch the ring), and burst',
  run(S) { S.every(1.3 / S.d, n => { const b = shot(n % 2 ? hw() - 10 : -hw() + 10, -hh() - 8, 0, 90, 7, '#c0a8e8', { home: 2.4, spd: 120 * S.d, life: 4 });
    popLater(S, b, 1.2, b => { b.home = 0; b.vx = b.vy = 0; b.col = '#ff9a3c'; shot(b.x, b.y, 0, 0, 30, '#ff9a3c', { warn: 0.6, life: 0.6, harmless: true }); sfx('warn'); });
    popLater(S, b, 1.8, b => { b.dead = true; for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; shot(b.x, b.y, Math.cos(a) * 120, Math.sin(a) * 120, 4, '#ffcf70'); } }); }, 0.2, 5.4); } };
A.sparkRain = { name: 'Spark Rain', dur: 6.5, size: [280, 180], desc: 'sparks fall from the fuse; sweep the gap',
  run(S) { S.every(0.4 / S.d, () => { const gc = Math.sin(S.t * 1.1) * hw() * 0.55; for (let x = -hw() + 12; x < hw(); x += 26) if (Math.abs(x - gc) > 36) shot(x + rand(-4, 4), -hh() - 8, 0, 120 * S.d, 3.5, '#ffcf70'); }, 0, 5.6); } };
/* ---- Hourspire ---- */
A.tempo = { name: 'Tempo', dur: 8, size: [280, 200], desc: 'a pendulum beam ticks side to side; beats arrive in time',
  run(S) { S.at(0, () => { sfx('warn'); laser(0, -hh() - 2, Math.PI / 2, 10, 1.0, 6.6, { len: 400, col: '#ffd36e', fn: b => { b.ang = Math.PI / 2 + Math.sin(b.age * 1.6 * S.d) * 0.85; } }); });
    S.every(0.6 / S.d, n => { const s = n % 2; shot(s ? hw() + 8 : -hw() - 8, hh() - 14 - (n % 3) * 30, (s ? -1 : 1) * 140, 0, 4.5, '#ff9ad8'); sfx('tick'); }, 1.2, 7.4); } };
A.allegro = { name: 'Allegro', dur: 6.5, size: [300, 190], desc: 'rows of notes rush in; one lane is always rest',
  run(S) { S.every(0.7 / S.d, n => { const lanes = 5, lh = arena.h / lanes, rest = irand(0, lanes - 1); for (let i = 0; i < lanes; i++) if (i !== rest) shot(hw() + 10, -hh() + lh * (i + 0.5), -170 * S.d, 0, 6, '#9ad8ff'); }, 0.2, 5.6); } };
A.pageTurn = { name: 'Page Turn', dur: 7, size: [280, 200], desc: 'pages flip down in rows with a gap; then the next page',
  run(S) { let gx = 0; S.every(0.85 / S.d, () => { gx = clamp(gx + rand(-70, 70), -hw() + 40, hw() - 40); const l = gx - 34 - -hw(), r = hw() - (gx + 34);
    bar(-hw() + l / 2, -hh() - 8, l, 10, 0, 120 * S.d, '#f4ecd8'); bar(hw() - r / 2, -hh() - 8, r, 10, 0, 120 * S.d, '#f4ecd8'); }, 0, 6); } };
A.psalm = { name: 'Psalm', dur: 7, size: [260, 200], desc: 'letters fall out of the book in a slow four-arm spiral',
  run(S) { let a = 0; S.every(0.2 / S.d, () => { for (let k = 0; k < 4; k++) { const aa = a + k * 1.5708; shot(0, -hh() + 20, Math.cos(aa) * 80 * S.d, Math.sin(aa) * 80 * S.d, 4, k % 2 ? '#c8a050' : '#f4ecd8'); } }, 0.3, 6.2);
    return (t, dt) => { a += 0.9 * dt; }; } };
for (const k in A) A[k].id = k;

const NEW_ENEMIES = {
  burrlock: { name: 'Burrlock', hp: 28, def: 0, atk: 1, torque: 5, cogs: 7, d: 1, attacks: ['burrs', 'thistle'], art: 'burrlock', track: 'battle', mini: 0.3,
    check: 'EDGE 3 · PLATING 2 · a seed burr with a keyhole. sticks to things. wants to be held. is spiky. tragic.',
    intro: 'Burrlock rolls out of the grass and sticks to your boot!', flavor: ['Burrlock is stuck to a twig. It\'s fine. It meant to do that.', 'Burrlock bristles defensively.', 'The keyhole on Burrlock\'s front rattles.'], calm: 'Burrlock has gone soft and fuzzy.',
    talk: ['DON\'T TOUCH. (touch?)', 'i\'m very sharp. (i\'m lonely)', 'stick. stick. stick.', 'who has my key?'],
    acts: {
      'Compliment Spikes': B => ({ t: ['You tell Burrlock its spikes are very well-organized.', B.n('Compliment Spikes') ? 'Burrlock puffs up. Two spikes fall off from pride.' : 'Burrlock pretends not to hear. It is blushing, somehow.'], c: 40, say: 'they ARE organized.' }),
      'Pick It Off': B => ({ t: ['You carefully pick Burrlock off your boot.', 'Ouch. Ow. It sticks to your hand instead. It seems happier there.'], c: 25, say: 'hand. better.' }),
      'Ask About Key': B => ({ t: ['You ask what the keyhole opens.', B.n('Ask About Key') ? '"...i don\'t know. i was hoping you\'d know."' : '"none of your business." It rattles the keyhole sadly.'], c: B.n('Compliment Spikes') ? 45 : 10, say: '...nobody ever asks.' }),
    }, spare: 'Burrlock rolls away, clinging to a passing leaf like a tiny boat.', kill: 'Burrlock\'s spikes go limp.' },
  dawdle: { name: 'Dawdle', hp: 40, def: 1, atk: 0.9, torque: 6, cogs: 9, d: 0.95, attacks: ['slimeTrail', 'shellSpin'], art: 'dawdle', track: 'battle', mini: 0.3,
    check: 'EDGE 2 · PLATING 3 · a snail with a clock for a shell. running 40 years slow. on purpose.',
    intro: 'Dawdle arrives. Eventually.', flavor: ['Dawdle has moved one inch. Dawdle is exhausted.', 'Dawdle\'s shell ticks... very... slowly.', 'There is a slime trail behind Dawdle that goes back for miles.'], calm: 'Dawdle is having a lovely little rest.',
    talk: ['heyyyyy...', 'what\'s... the... rush...', 'i\'m... almost... there...', '...zzz... oh. hi.'],
    acts: {
      'Wait Patiently': B => { const n = B.n('Wait Patiently'); return { t: ['You wait for Dawdle to finish its sentence.', ['It does not finish its sentence.', 'It\'s getting closer to finishing the sentence.', 'Dawdle finishes the sentence. "...nice." You both feel accomplished.'][Math.min(n, 2)]], c: [20, 30, 60][Math.min(n, 2)], say: ['...', '...nnn...', '...nice.'][Math.min(n, 2)] }; },
      'Race It': B => ({ t: ['You challenge Dawdle to a race.', 'You win by a lot. Dawdle is thrilled for you.'], c: 25, say: 'wow... so fast...' }),
      'Admire Shell': B => ({ t: ['You admire Dawdle\'s clock shell.', 'It\'s running 40 years slow. Dawdle says that makes it "basically new".'], c: 30, say: 'still... under... warranty...' }),
    }, spare: 'Dawdle begins leaving. You will be here a while. That\'s okay.', kill: 'Dawdle\'s shell stops ticking. It was already so slow.' },
  spannerkin: { name: 'Spannerkin', hp: 42, def: 1, atk: 1.25, torque: 8, cogs: 11, d: 1.08, attacks: ['wrenchSpin', 'boltSpray'], art: 'spannerkin', track: 'battle', mini: 0.3,
    check: 'EDGE 4 · PLATING 2 · a wrench-headed sprite. tightens everything. has tightened itself into a bad mood.',
    intro: 'Spannerkin clanks over, tightening things!', flavor: ['Spannerkin tightens a bolt that was already tight.', 'Spannerkin tightens the air. Somehow.', 'Spannerkin is very, very wound up.'], calm: 'Spannerkin has loosened up. Visibly.',
    talk: ['RIGHTY TIGHTY!', 'too loose! TOO LOOSE!', 'quarter turn! QUARTER TURN!', 'everything must be SNUG.'],
    acts: {
      'Loosen Up': B => ({ t: ['You suggest Spannerkin loosen up a little.', B.n('Hand a Bolt') ? 'It tries. It turns its own head a quarter-turn left. "...oh. OH. that\'s nice."' : '"LOOSEN?!" It tightens itself even more out of spite.'], c: B.n('Hand a Bolt') ? 60 : -10, say: B.n('Hand a Bolt') ? 'lefty... loosey...?' : 'NEVER!' }),
      'Hand a Bolt': B => ({ t: ['You hand Spannerkin a bolt.', 'It tightens it lovingly. It hasn\'t had a new bolt in forty years.'], c: 35, say: 'a NEW one?!' }),
      'Righty-Tighty': B => ({ t: ['You chant "righty-tighty" with Spannerkin.', 'It is moved. You are bonded now.'], c: 25, say: 'RIGHTY TIGHTY!!' }),
    }, spare: 'Spannerkin clanks off, loosening one thing at a time. Baby steps.', kill: 'Spannerkin comes undone.' },
  fusebat: { name: 'Fusebat', hp: 34, def: 0, atk: 1.3, torque: 8, cogs: 10, d: 1.1, attacks: ['fuseDive', 'sparkRain'], art: 'fusebat', track: 'battle', mini: 0.3,
    check: 'EDGE 5 · PLATING 0 · a bat with a lit fuse for a tail. has been about to explode for forty years. very stressed.',
    intro: 'Fusebat flaps down, fizzing nervously!', flavor: ['Fusebat\'s fuse fizzes. It has not gotten shorter.', 'Fusebat hangs upside down to calm itself.', 'Fusebat is counting down from three. It keeps starting over.'], calm: 'Fusebat\'s fuse is a gentle little glow.',
    talk: ['three... two... three...', 'IS IT TIME?! no?', 'fizz fizz FIZZ', 'don\'t look at the fuse.'],
    acts: {
      'Blow on Fuse': B => ({ t: ['You blow gently on Fusebat\'s fuse.', B.n('Hang Upside Down') ? 'It dims to a soft glow. Fusebat sighs with relief.' : 'It flares up. Fusebat SCREAMS. Wrong order, maybe.'], c: B.n('Hang Upside Down') ? 65 : -15, say: B.n('Hang Upside Down') ? 'ohhh. ohh that\'s better.' : 'AAAA' }),
      'Hang Upside Down': B => ({ t: ['You hang upside down from the nearest pipe, in solidarity.', 'Fusebat looks at you with deep respect.'], c: 30, say: 'you GET it.' }),
      'Count With It': B => ({ t: ['You count down with Fusebat: three, two...', '...and you both start again at three. It\'s nice. Nothing explodes.'], c: 25, say: 'three... two... three!' }),
    }, spare: 'Fusebat flutters off to hang somewhere quiet. Its fuse glows like a nightlight.', kill: 'Fusebat\'s fuse goes out. That\'s all. That\'s all that happens.' },
  metronoma: { name: 'Metronoma', hp: 48, def: 1, atk: 1.35, torque: 10, cogs: 13, d: 1.12, attacks: ['tempo', 'allegro'], art: 'metronoma', track: 'battle', mini: 0.28,
    check: 'EDGE 5 · PLATING 2 · a metronome. keeps perfect time. there has only been one time for forty years.',
    intro: 'Metronoma ticks in, perfectly on the beat!', flavor: ['Metronoma swings. Tick. Swing. Tock.', 'Metronoma glares at you for being off-beat.', 'Metronoma is at 120 bpm. It is always at 120 bpm.'], calm: 'Metronoma has slowed to a gentle andante.',
    talk: ['TICK. TOCK. ON THE BEAT.', 'you are DRAGGING.', 'and-a-one, and-a-two', 'tempo is LAW.'],
    acts: {
      'Keep Time': B => ({ t: ['You clap along, exactly on the beat.', B.n('Keep Time') ? 'Perfect again. Metronoma\'s pendulum wobbles with emotion.' : 'Metronoma nods once. Approval, in metronome.'], c: 40, say: 'ACCEPTABLE.' }),
      'Play Rubato': B => ({ t: ['You speed up and slow down, expressively.', B.n('Keep Time') >= 2 ? 'Metronoma... sways. "...oh. oh, that\'s FEELING, isn\'t it."' : 'Metronoma is horrified. "THAT IS NOT A TEMPO."'], c: B.n('Keep Time') >= 2 ? 60 : -15, say: B.n('Keep Time') >= 2 ? '...again?' : 'UNACCEPTABLE.' }),
      'Tap Foot': B => ({ t: ['You tap your foot.', 'Slightly off. Metronoma corrects you. You let it. It needed that.'], c: 20, say: 'closer. CLOSER.' }),
    }, spare: 'Metronoma ticks away at a slightly slower tempo than before. It seems to like it.', kill: 'Metronoma\'s pendulum stops in the middle.' },
  hymnal: { name: 'Hymnal', hp: 44, def: 2, atk: 1.25, torque: 10, cogs: 12, d: 1.1, attacks: ['pageTurn', 'psalm'], art: 'hymnal', track: 'battle', mini: 0.3,
    check: 'EDGE 4 · PLATING 3 · a choir book with nobody left to sing from it. one page is torn out.',
    intro: 'Hymnal flutters open at you!', flavor: ['Hymnal flips to page 13. There is no page 13.', 'Hymnal hums a hymn with one line missing.', 'Dust drifts from Hymnal\'s spine.'], calm: 'Hymnal lies open, peaceful, at a favorite page.',
    talk: ['(rustle)', 'turn to page... page...', 'sing. SING.', 'someone used to read me.'],
    acts: {
      'Read Aloud': B => ({ t: ['You read a hymn aloud.', B.n('Read Aloud') ? 'You get the tune wrong. Hymnal doesn\'t mind at all.' : 'Hymnal\'s pages tremble. Nobody\'s read it in forty years.'], c: 35, say: 'more. please.' }),
      'Hum Along': B => ({ t: ['You hum along to the missing line.', 'You don\'t know the words. Neither does Hymnal anymore. You hum it together.'], c: 40, say: '...yes. like that.' }),
      'Ask About Page': B => ({ t: ['You ask about the torn-out page.', '"someone took it. to remember a song by. i hope it helped."'], c: 20, say: 'page thirteen.' }),
    }, spare: 'Hymnal flutters up to a high shelf, humming the missing line.', kill: 'Hymnal\'s pages scatter. None of them are page thirteen.' },
};
for (const k in NEW_ENEMIES) { ENEMIES[k] = NEW_ENEMIES[k]; ENEMIES[k].id = k; }
ENC_TABLE.rustwood.push('burrlock', 'dawdle'); ENC_TABLE.cogworks.push('spannerkin', 'fusebat'); ENC_TABLE.spire.push('metronoma', 'hymnal');
for (const a in AREA_POP) AREA_POP[a] += 2;

/* ---- art (battle scale, drawn around x,y like the others) ---- */
ART.burrlock = (x, y, t, s) => { const b = Math.sin(t * 3) * 3, yy = y + b;
  for (let i = 0; i < 22; i++) { const a = i / 22 * 6.283 + Math.sin(t * 2 + i) * 0.04; line(x + Math.cos(a) * 34, yy + Math.sin(a) * 34, x + Math.cos(a) * 56, yy + Math.sin(a) * 56, '#6a4a1a', 4); }
  circ(x, yy, 40, '#8a6a2a'); circ(x, yy, 32, '#a8823a'); eyes(x, yy - 10, 12, 6, '#1a1020', blinkAt(t)); ell(x, yy + 14, 5, 8, '#2a1a0a'); circ(x, yy + 9, 6, '#2a1a0a');
  line(x - 18, yy - 22, x - 6, yy - 18, '#2a1a0a', 3); line(x + 18, yy - 22, x + 6, yy - 18, '#2a1a0a', 3); };
ART.dawdle = (x, y, t, s) => { const st = Math.sin(t * 0.8) * 4;
  ell(x - 10 + st, y + 40, 80, 14, '#c8b0e0'); ell(x - 64 + st, y + 14, 14, 30, '#c8b0e0', -0.3); line(x - 70 + st, y - 14, x - 80 + st, y - 40, '#c8b0e0', 3); line(x - 60 + st, y - 14, x - 56 + st, y - 42, '#c8b0e0', 3);
  circ(x - 80 + st, y - 42, 5, '#fff'); circ(x - 56 + st, y - 44, 5, '#fff'); circ(x - 80 + st, y - 42, 2.5, '#222'); circ(x - 56 + st, y - 44, 2.5, '#222');
  circ(x + 14, y - 4, 48, '#b8893a'); circ(x + 14, y - 4, 40, '#f2e6c8'); for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; line(x + 14 + Math.cos(a) * 32, y - 4 + Math.sin(a) * 32, x + 14 + Math.cos(a) * 37, y - 4 + Math.sin(a) * 37, '#3a2a14', 2); }
  line(x + 14, y - 4, x + 14 + Math.cos(t * 0.05 - 1.5) * 26, y - 4 + Math.sin(t * 0.05 - 1.5) * 26, '#3a2a14', 4); line(x + 14, y - 4, x + 14 + Math.cos(t * 0.3) * 18, y - 4 + Math.sin(t * 0.3) * 18, '#3a2a14', 3); };
ART.spannerkin = (x, y, t, s) => { const tw = Math.sin(t * 4) * 0.25;
  ctx.fillStyle = '#5a5048'; rrect(x - 22, y - 10, 44, 54, 8); ctx.fill(); line(x - 14, y + 44, x - 18, y + 62, '#3a342e', 6); line(x + 14, y + 44, x + 18, y + 62, '#3a342e', 6);
  ctx.save(); ctx.translate(x, y - 34); ctx.rotate(tw); ctx.fillStyle = '#b8b8c8'; ctx.fillRect(-8, -10, 16, 40); ctx.beginPath(); ctx.arc(0, -22, 26, 0, 6.283); ctx.fill();
  ctx.fillStyle = '#16121e'; ctx.fillRect(-10, -52, 20, 30); ctx.restore(); eyes(x, y - 26, 10, 5, '#1a1020', blinkAt(t)); line(x - 8, y - 14, x + 8, y - 14, '#1a1020', 3);
  line(x + 22, y + 4, x + 48, y - 10 + Math.sin(t * 8) * 6, '#5a5048', 6); gear(x + 50, y - 12 + Math.sin(t * 8) * 6, 9, 6, t * 6, '#c8a050', '#2a2420'); };
ART.fusebat = (x, y, t, s) => { const f = Math.sin(t * 12) * 0.5, bob = Math.sin(t * 3) * 6, yy = y + bob;
  for (const sd of [-1, 1]) { ctx.save(); ctx.translate(x + sd * 24, yy - 4); ctx.scale(sd, 1); ctx.rotate(-0.3 + f); poly([0, 0, 70, -26, 58, 0, 70, 18, 40, 10, 30, 26], '#4a3a5a'); ctx.restore(); }
  ell(x, yy, 28, 30, '#5a4a6a'); poly([x - 20, yy - 22, x - 14, yy - 46, x - 4, yy - 26], '#5a4a6a'); poly([x + 20, yy - 22, x + 14, yy - 46, x + 4, yy - 26], '#5a4a6a');
  eyes(x, yy - 8, 10, 6, '#ffcf70', blinkAt(t)); poly([x - 6, yy + 8, x - 3, yy + 15, x, yy + 8], '#fff'); poly([x + 6, yy + 8, x + 3, yy + 15, x, yy + 8], '#fff');
  ctx.strokeStyle = '#8a6a3a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, yy + 28); ctx.quadraticCurveTo(x + 20, yy + 50, x + 8, yy + 64); ctx.stroke();
  ctx.save(); ctx.shadowColor = '#ff9a3c'; ctx.shadowBlur = 16; circ(x + 8 + rand(-1.5, 1.5), yy + 66 + rand(-1.5, 1.5), 5, '#ffcf70'); ctx.restore(); };
ART.metronoma = (x, y, t, s) => { const sw = Math.sin(t * 3.2) * 0.6;
  poly([x - 46, y + 56, x + 46, y + 56, x + 22, y - 70, x - 22, y - 70], '#6a3a20'); poly([x - 36, y + 46, x + 36, y + 46, x + 17, y - 58, x - 17, y - 58], '#8a5a30');
  ctx.save(); ctx.translate(x, y + 36); ctx.rotate(sw); line(0, 0, 0, -96, '#e8d8b0', 4); ctx.fillStyle = '#c8a050'; ctx.fillRect(-8, -64, 16, 12); ctx.restore();
  for (let i = 0; i < 5; i++) line(x - 12, y - 40 + i * 14, x + 12, y - 40 + i * 14, 'rgba(232,216,176,.4)', 1);
  eyes(x, y + 22, 14, 6, '#1a1020', blinkAt(t)); line(x - 7, y + 38, x + 7, y + 38, '#1a1020', 3); };
ART.hymnal = (x, y, t, s) => { const fl = Math.sin(t * 2.4) * 0.15, bob = Math.sin(t * 2) * 5, yy = y + bob;
  for (const sd of [-1, 1]) { ctx.save(); ctx.translate(x, yy); ctx.scale(sd, 1); ctx.rotate(sd * 0 + fl); poly([0, -40, 60, -48, 64, 30, 0, 40], '#5a1a2a'); poly([2, -36, 56, -43, 60, 26, 2, 34], '#f4ecd8');
    for (let i = 0; i < 5; i++) line(10, -26 + i * 11, 50, -30 + i * 11, 'rgba(60,40,30,.45)', 2); ctx.restore(); }
  line(x, yy - 40, x, yy + 40, '#3a0a1a', 4); eyes(x - 30, yy - 6, 8, 4.5, '#1a1020', blinkAt(t)); eyes(x + 30, yy - 6, 8, 4.5, '#1a1020', blinkAt(t + 0.1));
  if (Math.floor(t * 1.5) % 2) { ctx.font = `16px ${FONT}`; ctx.fillStyle = 'rgba(255,230,180,.7)'; ctx.textAlign = 'center'; ctx.fillText('♪', x + 50, yy - 56 - (t * 12) % 14); } };
