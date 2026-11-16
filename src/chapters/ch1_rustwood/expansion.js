/* ===================== CHAPTER 1 EXPANSION (v1.4): Hollow Oak · Bell-Root Cave · Old Rail Cut + Rootling, Clinker ===================== */
// Rustwood gets a gap in its north treeline (x 30-31) leading up to the Hollow Oak.
{ const m = ROOMS.rustwood.map; m[0] = m[0].slice(0, 30) + '..' + m[0].slice(32); ROOMS.rustwood.exits.push({ x: 30, y: 0, w: 2, h: 1, to: 'hollowoak', tx: 14, ty: 13 }); }
ITEMS.roottea = { name: 'Root Tea', kind: 'heal', v: 22, price: 20, desc: 'steeped from a root that hums. tastes like a held breath.' };
Object.assign(ROOMS, {
  hollowoak: { name: 'The Hollow Oak', area: 'rustwood', theme: 'forest', track: 'rust', enc: 'rustwood', map: [
    '##############################',
    '#TTTTTTTTTT..........TTTTTTTT#',
    '#TTT....................,,,TT#',
    '#T....,,,,..........,,,,,,,..#',
    '.....,,,,,,.........,,,,,,,...',
    '.....,,,,,..........,,,,,.....',
    '......,,.....................#',
    '#...........................T#',
    '#T.....,,,,.......,,,,,.....T#',
    '#.....,,,,,,.....,,,,,,,....T#',
    '#......,,,,.......,,,,,.....T#',
    '#T..........................T#',
    '#TTT.......................TT#',
    '#TTTTTTTTTTTT....TTTTTTTTTTTT#',
    '#############....#############'],
    exits: [{ x: 13, y: 14, w: 4, h: 1, to: 'rustwood', tx: 30, ty: 1 }, { x: 0, y: 4, w: 1, h: 3, to: 'bellroot', tx: 16, ty: 6 }, { x: 29, y: 4, w: 1, h: 2, to: 'railcut', tx: 1, ty: 6 }],
    ents: [
      { t: 'thing', look: 'oak', x: 15, y: 2, walk: true, run: async () => {
        const n = hero.flags.oak_n = (hero.flags.oak_n || 0) + 1;
        if (n === 1) return say('', 'An enormous oak, hollow all the way up. A clock face has grown into the bark, like the tree swallowed it whole.', 'Its hands point to 11:59. The bark around them is smooth, as if someone touched it every day.');
        if (n === 2) return say('', 'You put your ear to the hollow. Far, far up, something ticks.', 'Not the clock. Something smaller.');
        return say('', 'The hollow smells of oil and warm bread.', hero.flags.ws_visited ? 'Like the workshop. You are almost sure of it.' : 'You can\'t think why that would be.');
      } },
      { t: 'thing', look: 'owl', x: 22, y: 7, run: async () => ottoline() },
      { t: 'chest', x: 3, y: 10, item: 'roottea', flag: 'c_oak1' },
    ] },
  bellroot: { name: 'Bell-Root Cave', area: 'rustwood', theme: 'spire', track: 'vesper', map: [
    '####################',
    '#TTTTTTTTTTTTTTTTTT#',
    '#TT..............TT#',
    '#T................T#',
    '#..................#',
    '#...................',
    '#...................',
    '#...................',
    '#T................T#',
    '#TT..............TT#',
    '####################'],
    exits: [{ x: 19, y: 5, w: 1, h: 3, to: 'hollowoak', tx: 1, ty: 5 }],
    ents: [
      { t: 'thing', look: 'root', x: 6, y: 3, walk: true, run: async () => { hero.flags.root_heard = true; sfx('item');
        return say('', 'A root as thick as a barrel comes down through the ceiling and curls into the floor like a bell clapper.', 'It is warm. When you touch it, it hums one note.', hero.flags.oneMore ? 'It\'s the first note of the song MERIDIAN called the first one.' : 'You feel like you should know the next note.'); } },
      { t: 'thing', look: 'tally', x: 12, y: 2, walk: true, run: async () => {
        hero.flags.tally_seen = true;
        return say('', 'Scratches on the wall. Tally marks, in groups of eleven, not five.', 'You stop counting at a few thousand. The very last group has only ten marks.', 'The last mark is fresh. The stone dust hasn\'t settled.'); } },
      { t: 'chest', x: 16, y: 8, item: 'tea', flag: 'c_br1' },
    ] },
  railcut: { name: 'Old Rail Cut', area: 'rustwood', theme: 'forest', track: 'rust', enc: 'rustwood', map: [
    '##############################',
    '#TTTTTTTTTTTTTTTTTTTTTTTTTTTT#',
    '#TT.......................TTT#',
    '#..........,,,,.......,,,..TT#',
    '#..........,,,,,,....,,,,,..T#',
    '...==========================#',
    '...==========================#',
    '#..........,,,,......,,,,,..T#',
    '#..........,,,,,,....,,,,...T#',
    '#TT.......................TTT#',
    '#TTTTTTTTTTTTTTTTTTTTTTTTTTTT#',
    '##############################'],
    exits: [{ x: 0, y: 5, w: 1, h: 2, to: 'hollowoak', tx: 28, ty: 4 }],
    ents: [
      { t: 'thing', look: 'railsign', x: 26, y: 4, walk: true, run: async () => say('', 'A station sign, bolted to the rock where the rails just... stop.', '"PLATFORM 1_". The last digit has rusted off.', has('ticket') ? 'The ticket in your pocket is warm.' : 'There is no platform. There is barely a wall.') },
      { t: 'thing', look: 'handcar', x: 18, y: 6, walk: true, run: async () => {
        if (!hero.flags.handcar) { hero.flags.handcar = true; sfx('push'); shake(3, 0.3); return say('', 'An old handcar. You pump the lever once. It creaks forward an inch and stops.', 'The rails hum, very faintly, like something far away is still coming.'); }
        return say('', 'The handcar won\'t budge. Someone has chalked on the seat: "WAITING."'); } },
      { t: 'thing', look: 'timetable', x: 8, y: 2, walk: true, run: async () => say('', 'A timetable under cracked glass. Every line says the same thing.', 'DEPARTS 12:01. DEPARTS 12:01. DEPARTS 12:01.', hero.flags.mop_n_rustwood ? 'In the corner, in pencil: "M. - don\'t wait up."' : 'Nothing has ever arrived.') },
    ] },
});
async function ottoline() {
  const n = hero.flags.otto_n = (hero.flags.otto_n || 0) + 1, V = 600;
  VOICES.OTTOLINE = 600;
  if (n === 1) return say('OTTOLINE', 'Hoo. A visitor. I am Ottoline. I am a sundial owl.', 'I tell the time by the shadow of my beak. It has said "almost noon" for forty years.', 'I have been told this is the middle of the night. I have chosen not to believe it.');
  if (n === 2) return say('OTTOLINE', 'The tree has a clock in it. The clock has a tree around it. Which came first? Hoo. Don\'t answer.', hero.flags.tally_seen ? 'You saw the marks in the cave? Not mine. I only count to almost.' : 'There is a cave to the west. Something down there keeps count.');
  if (hero.kills > 0 && !hero.flags.otto_kill) { hero.flags.otto_kill = true; return say('OTTOLINE', '...the shadow of my beak moved, just now. A little. When you walked up.', 'I did not like it.'); }
  return say('OTTOLINE', ['Almost noon. Almost noon.', 'If you see the janitor, tell him the owl says hoo.', 'Somebody used to read under this tree. She dog-eared every page at eleven.'][n % 3]);
}
Object.assign(THING, {
  oak: (x, y, t) => { ctx.fillStyle = '#4a3420'; ctx.fillRect(x - 40, y - 120, 80, 118); ctx.fillStyle = '#1a1008'; ell(x, y - 30, 16, 26, '#1a1008');
    circ(x, y - 82, 18, '#e8dcc0'); circ(x, y - 82, 15, '#f4ecd8'); line(x, y - 82, x - 1, y - 95, '#2a2030', 2); line(x, y - 82, x + 3, y - 94, '#2a2030', 2);
    for (let i = 0; i < 5; i++) circ(x - 48 + i * 24, y - 130 + Math.sin(i) * 8, 26, i % 2 ? '#2f5a2a' : '#3a6a30'); },
  owl: (x, y, t) => { const b = Math.sin(t * 2) * 1.5; ctx.fillStyle = '#5a3a1a'; ctx.fillRect(x - 3, y - 18, 6, 18); ell(x, y - 30 + b, 12, 14, '#a8885a'); circ(x - 5, y - 34 + b, 4, '#fff'); circ(x + 5, y - 34 + b, 4, '#fff');
    circ(x - 5, y - 34 + b, 2, '#1a1020'); circ(x + 5, y - 34 + b, 2, '#1a1020'); poly([x - 2, y - 30 + b, x + 2, y - 30 + b, x, y - 25 + b], '#e8a030'); line(x, y - 25 + b, x + 10, y - 20, 'rgba(0,0,0,.35)', 2); },
  root: (x, y, t) => { ctx.fillStyle = '#5a3a20'; ctx.fillRect(x - 14, y - 90, 28, 70); ell(x, y - 18, 22, 10, '#5a3a20'); ctx.save(); ctx.globalAlpha = 0.15 + Math.sin(t * 1.7) * 0.08; circ(x, y - 50, 30, '#ffd36e'); ctx.restore(); },
  tally: (x, y) => { ctx.strokeStyle = 'rgba(232,220,192,.6)'; ctx.lineWidth = 1; for (let r = 0; r < 3; r++) for (let i = 0; i < 16; i++) { ctx.beginPath(); ctx.moveTo(x - 20 + i * 2.6, y - 40 + r * 8); ctx.lineTo(x - 20 + i * 2.6, y - 34 + r * 8); ctx.stroke(); } },
  railsign: (x, y) => { ctx.fillStyle = '#3a342e'; ctx.fillRect(x - 2, y - 40, 4, 40); ctx.fillStyle = '#2a4a3a'; ctx.fillRect(x - 22, y - 50, 44, 14); ctx.fillStyle = '#e8dcc0'; ctx.font = `bold 9px ${FONT}`; ctx.textAlign = 'center'; ctx.fillText('PLATFORM 1_', x, y - 40); },
  handcar: (x, y) => { ctx.fillStyle = '#6a5040'; ctx.fillRect(x - 22, y - 14, 44, 10); circ(x - 14, y - 2, 6, '#3a342e'); circ(x + 14, y - 2, 6, '#3a342e'); line(x, y - 14, x, y - 30, '#8a7a5a', 3); line(x - 12, y - 30, x + 12, y - 30, '#8a7a5a', 3); },
  timetable: (x, y) => { ctx.fillStyle = '#4a3a2a'; ctx.fillRect(x - 16, y - 50, 32, 28); ctx.fillStyle = '#e8dcc0'; ctx.fillRect(x - 13, y - 47, 26, 22); ctx.fillStyle = '#3a342e'; for (let i = 0; i < 5; i++) ctx.fillRect(x - 10, y - 44 + i * 4, 20, 1.5); },
});

/* ---- two more Rustwood monsters ---- */
A.rootSnare = { name: 'Root Snare', dur: 6.5, size: [260, 180], desc: 'roots burst up where the ground glows; they stay a moment',
  run(S) { S.every(0.7 / S.d, n => { const x = clamp(P.x + rand(-50, 50), -hw() + 12, hw() - 12); const k = n % 3 === 2 ? 2 : 1;
      for (let j = 0; j < k; j++) { const xx = clamp(x + (j ? (Math.random() < 0.5 ? -70 : 70) : 0), -hw() + 12, hw() - 12); bar(xx, 0, 16, arena.h + 4, 0, 0, '#7a5a2a', { warn: 0.7, life: 1.15 }); } sfx('warn'); }, 0.2, 5.6); } };
A.seedSpin = { name: 'Seed Spin', dur: 6, size: [260, 180], desc: 'helicopter seeds spin down in slow spirals',
  run(S) { S.every(0.45 / S.d, () => { const x0 = rand(-hw() + 20, hw() - 20), ph = rand(0, 6.283), sp = 50 * S.d; shot(x0, -hh() - 8, 0, sp, 5, '#c8a050', { fn: b => { b.x = x0 + Math.sin(b.age * 3 + ph) * 22; } }); }, 0, 5.4); } };
A.spikeLine = { name: 'Spike Line', dur: 6.5, size: [280, 170], desc: 'rail spikes shoot along the tracks; the gap moves one track at a time',
  run(S) { let gap = 1; S.every(0.75 / S.d, n => { gap = clamp(gap + (Math.random() < 0.5 ? -1 : 1), 0, 3); const lanes = 4, lh = arena.h / lanes;
      for (let i = 0; i < lanes; i++) { if (i === gap) continue; const y = -hh() + lh * (i + 0.5), s = n % 2; shot(s ? hw() + 10 : -hw() - 10, y, (s ? -1 : 1) * 150 * S.d, 0, 6, '#b8b0a0', { warn: 0.45 }); } sfx('warn'); }, 0.2, 5.8); } };
A.cinderHop = { name: 'Cinder Hop', dur: 6, size: [260, 180], desc: 'cinders bounce off the walls; their trails cool and fade',
  run(S) { S.every(0.9 / S.d, () => { const a = rand(0, 6.283); shot(Math.cos(a) * 30, Math.sin(a) * 30, Math.cos(a) * 85 * S.d, Math.sin(a) * 85 * S.d, 5, '#ff8a3c', { bounce: 3, life: 4.2, warn: 0.4 }); }, 0.2, 5.2); } };
Object.assign(ENEMIES, {
  rootling: { id: 'rootling', name: 'Rootling', hp: 32, def: 0, atk: 1, torque: 6, cogs: 8, d: 1, attacks: ['rootSnare', 'seedSpin'], art: 'rootling', track: 'battle', mini: 0.3,
    check: 'EDGE 3 · PLATING 1 · a sprout of the bell-root. hums one note. would like to hum two.',
    intro: 'A Rootling pushes up out of the path, humming.', flavor: ['Rootling hums one note. Then the same note.', 'Rootling stretches toward a sun that isn\'t moving.', 'The ground under you hums in sympathy.'], calm: 'Rootling\'s hum has gone soft and happy.',
    talk: ['mmmmmm.', 'mmm? (that was the second note. did you hear it?)', 'roots remember.', 'the bell is up. we are down. mmm.'],
    acts: {
      'Hum Back': B => ({ t: ['You hum the note back.', B.n('Hum Back') ? 'You try the NEXT note. Rootling goes very still, then wiggles with joy.' : 'Rootling sways. It wasn\'t expecting an answer.'], c: B.n('Hum Back') ? 55 : 30, say: B.n('Hum Back') ? 'TWO NOTES.' : 'mm!' }),
      'Water It': B => ({ t: ['You pour a little tea on the Rootling.', has('tea') || has('roottea') ? 'It seems refreshed, and slightly caffeinated.' : 'You have no tea. You mime it. Rootling appreciates the effort.'], c: 25, say: 'refreshing.' }),
      'Pull It': B => ({ t: ['You try to pull the Rootling out.', 'It is attached to something VERY deep. Something hums back, annoyed.'], c: -20, say: 'NO PULL.' }),
    }, spare: 'Rootling sinks back into the ground, humming two notes now.', kill: 'The humming stops. The ground is very quiet.' },
  clinker: { id: 'clinker', name: 'Clinker', hp: 36, def: 1, atk: 1, torque: 7, cogs: 10, d: 1, attacks: ['spikeLine', 'cinderHop'], art: 'clinker', track: 'battle', mini: 0.3,
    check: 'EDGE 4 · PLATING 2 · a rail spike that got bored waiting for a train and grew legs.',
    intro: 'A Clinker clanks off the rails and stands at attention!', flavor: ['Clinker checks a watch it doesn\'t have.', 'Clinker taps the rail. Nothing taps back.', 'Clinker smells like hot iron and patience.'], calm: 'Clinker has sat down on the rail, content to wait.',
    talk: ['ALL ABOARD. (nobody?)', 'the 12:01 is running late.', 'i was hammered in for a REASON.', 'clank.'],
    acts: {
      'Punch Ticket': B => ({ t: ['You pretend to punch Clinker\'s ticket.', has('ticket') ? 'You show it your REAL ticket. Clinker salutes so hard it falls over.' : 'Clinker accepts. It has never been so proud.'], c: has('ticket') ? 100 : 40, say: has('ticket') ? 'PLATFORM... THIRTEEN?' : 'VALID.' }),
      'Wait With It': B => ({ t: ['You wait with Clinker for the train.', B.n('Wait With It') ? 'You keep waiting. It\'s companionable.' : 'No train comes. Clinker seems glad of the company anyway.'], c: 35, say: 'any minute now.' }),
      'Make Train Noise': B => ({ t: ['You go "choo choo".', B.n('Wait With It') ? 'Clinker\'s whole body rings like a bell. It\'s overjoyed.' : 'Clinker looks around wildly for the train.'], c: B.n('Wait With It') ? 50 : 10, say: 'WHERE.' }),
    }, spare: 'Clinker hops back onto the rails and waits there, patiently, happily.', kill: 'Clinker falls over with a clank. It never sees a train.' },
});
ENC_TABLE.rustwood.push('rootling', 'clinker'); AREA_POP.rustwood += 2;
ART.rootling = (x, y, t, s) => { const b = Math.sin(t * 2.5) * 3, yy = y + b;
  for (let i = -2; i <= 2; i++) line(x + i * 10, yy + 30, x + i * 18, yy + 58, '#5a3a20', 5);
  ell(x, yy, 30, 36, '#7a5a2a'); ell(x, yy - 4, 24, 28, '#9a7a3a'); line(x, yy - 34, x, yy - 60, '#5a8a3a', 4); ell(x - 10, yy - 62, 12, 6, '#6aa04a'); ell(x + 10, yy - 58, 12, 6, '#6aa04a');
  eyes(x, yy - 6, 10, 5, '#1a1020', blinkAt(t)); ell(x, yy + 12, 6, 4 + Math.abs(Math.sin(t * 4)) * 3, '#2a1a0a'); };
ART.clinker = (x, y, t, s) => { const b = Math.abs(Math.sin(t * 4)) * 4, yy = y - b;
  line(x - 10, yy + 40, x - 18, yy + 60, '#5a5048', 5); line(x + 10, yy + 40, x + 18, yy + 60, '#5a5048', 5);
  ctx.fillStyle = '#7a7268'; ctx.fillRect(x - 12, yy - 40, 24, 82); ctx.fillStyle = '#9a9288'; ctx.fillRect(x - 26, yy - 50, 52, 14); ctx.fillStyle = '#5a5048'; ctx.fillRect(x - 12, yy + 30, 24, 12);
  eyes(x, yy - 18, 8, 5, '#ff9a3c', blinkAt(t)); line(x - 6, yy - 2, x + 6, yy - 2, '#2a2420', 3); };
