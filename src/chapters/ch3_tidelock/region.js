/* ===================== CHAPTER 3 · THE TIDELOCK (M2 chunk 1, v1.6-c4) =====================
   Entry from Gearholm's east wall (rows 4-5) -> The Low Steps (quiet entry, save chime) -> Lantern Canal (roamers).
   Region theme 'tide' (palette + plank/ripple tiles), region track 'tide', 2 monsters: Puddlepeep, Barnaclock. */
{ const R = ROOMS.gearholm, m = R.map; for (const y of [4, 5]) m[y] = m[y].slice(0, -1) + '.'; R.exits.push({ x: 39, y: 4, w: 1, h: 2, to: 'lowsteps', tx: 1, ty: 5 }); }
PAL.tide = { floor: '#2c3a40', floor2: '#32424a', grass: '#1e3a3a', tuft: '#4a8a7a', wall: '#0e1a20', tree: ['#3a4a50', '#5a6a6a', '#8aa0a0'], water: '#1c4a62', path: '#5a4a38', flower: ['#9ad8ff', '#e8dcc0', '#9ad8ff'] };
THEME_BG.tide = ['#06121a', '#0e2632'];
AREA_NAME.tide = 'The Tidelock';
TRACKS.tide = { bpm: 88, root: 46, bt: 'sine', bass: [0, _, _, 7, _, _, 0, _, -2, _, _, 5, _, _, -2, _, -4, _, _, 3, _, _, -4, _, -5, _, _, 2, _, 4, 5, _],
  lead: [19, _, 17, _, 15, _, _, 12, 14, _, 15, _, _, _, 10, _, 19, _, 22, _, 20, _, 19, 17, 15, _, _, _, 14, _, 12, _], lt: 'triangle', lv: 0.11, kick: 0, hat: 1 };
TRACKS.tidebattle = { bpm: 132, root: 46, bt: 'triangle', bass: [0, _, 0, 7, _, 0, 12, _, -2, _, -2, 5, _, -2, 10, _, -4, _, -4, 3, _, -4, 8, _, -5, _, 2, _, 5, _, 7, _],
  lead: [19, 22, 24, _, 22, 19, _, 17, 19, _, 15, _, 17, 19, 22, _, 20, 19, 17, _, 15, _, 12, _, 14, 15, 17, _, 19, _, 22, _], lt: 'square', lv: 0.06, kick: 1, hat: 1 };
ENC_TABLE.tide = []; AREA_POP.tide = 6;
Object.assign(ROOMS, {
  lowsteps: { name: 'The Low Steps', area: 'tide', theme: 'tide', track: 'tide', map: [
    '##########################',
    '#TTTTTTTTTTTTTTTTTTTTTTTT#',
    '#........................#',
    '#..~~~~~~~~~~...==.......#',
    '#..~~~~~~~~~~...==........',
    '................==........',
    '#..~~~~~~~~~~...==.......#',
    '#..~~~~~~~~~~............#',
    '#........................#',
    '#TTTTTTTTTTTTTTTTTTTTTTTT#',
    '##########################'],
    exits: [{ x: 0, y: 5, w: 1, h: 1, to: 'gearholm', tx: 38, ty: 5 }, { x: 25, y: 4, w: 1, h: 2, to: 'canal1', tx: 1, ty: 6 }],
    ents: [
      { t: 'save', x: 20, y: 7 },
      { t: 'sign', x: 5, y: 2, text: ['THE TIDELOCK · mind the water.', 'HIGH TIDE: 12:00. LOW TIDE: 12:00.', 'Underneath, scratched in: "it has been coming in for forty years."'] },
      { t: 'thing', look: 'tidepost', x: 14, y: 8, walk: true, run: async () => { const n = hero.flags.tidepost_n = (hero.flags.tidepost_n || 0) + 1;
        if (n === 1) return say('', 'A tide gauge. The water is at the line marked "NOW".', 'Every line on the gauge is marked "NOW".');
        return say('', 'The water laps at "NOW". It has been lapping at "NOW" for a very long time.'); } },
      { t: 'thing', look: 'ferry', x: 7, y: 8, run: async () => ferryTalk() },
    ] },
  canal1: { name: 'Lantern Canal', area: 'tide', theme: 'tide', track: 'tide', enc: 'tide', map: [
    '################################',
    '#TT..........TTTT..........TTTT#',
    '#..,,,,......~~~~.....,,,,,....#',
    '#..,,,,,.....~~~~....,,,,,,,...#',
    '#............====..............#',
    '#~~~~~~......====......~~~~~~..#',
    '.............~~~~...............',
    '..,,,,.......~~~~......,,,,,....',
    '#~~~~~~......====......~~~~~~..#',
    '#............====..............#',
    '#..,,,,,.....~~~~....,,,,,,,...#',
    '#TT..........~~~~..........TTTT#',
    '################################'],
    exits: [{ x: 0, y: 6, w: 1, h: 2, to: 'lowsteps', tx: 24, ty: 5 }],
    ents: [
      { t: 'sign', x: 29, y: 2, text: ['LANTERN CANAL. Locks ahead CLOSED for the tide.', 'Lockkeeper\'s orders. The tide does not turn without permission.', '(The rest of the canal is still flooding in. Come back later.)'] },
      { t: 'thing', look: 'bottle', x: 8, y: 9, walk: true, run: async () => { if (hero.flags.bottle1) return say('', 'An empty bottle, bobbing in place. Its note is gone. You took it. Probably.');
        hero.flags.bottle1 = true; return say('', 'A bottle is wedged against the bank. There\'s a note inside, very damp.', '"If the water ever goes down, I\'ll walk home. Keep the porch lamp lit."', 'It is signed with one letter. The ink has run too far to read which.'); } },
      { t: 'chest', x: 29, y: 10, item: 'tea', flag: 'c_tc1' },
    ] },
});
async function ferryTalk() { VOICES.FERRY = 340; const f = hero.flags, n = f.ferry_n = (f.ferry_n || 0) + 1;
  if (n === 1) return say('FERRY', 'Evening. Fare\'s one cog, one way. There\'s only one way. It\'s around.', 'I row the basin. Every lap I get a little closer to the other side.', 'Haven\'t got there yet. Water keeps coming in.');
  if (n === 2) return say('FERRY', 'The Lockkeeper won\'t open the gates. Says if the tide turns, everything that floated in floats out.', 'Some of us floated in.');
  if (f.killed_grit && !f.ferry_grit) { f.ferry_grit = true; return say('FERRY', 'Heard the foundry whistle stopped. Water got very still for a minute.', 'Then it kept coming in. It always keeps coming in.'); }
  return say('FERRY', ['Lap four thousand and... I lost count. That\'s fine. The water hasn\'t.', 'Row, row. Gently. Mostly around.', 'If you see a lamp on the far side, don\'t tell me. I like not knowing yet.'][n % 3]);
}
Object.assign(THING, {
  tidepost: (x, y, t) => { ctx.fillStyle = '#5a4a38'; ctx.fillRect(x - 3, y - 54, 6, 54); for (let i = 0; i < 5; i++) { ctx.fillStyle = i === 3 ? '#ffd36e' : '#e8dcc0'; ctx.fillRect(x + 3, y - 50 + i * 10, i === 3 ? 10 : 6, 2); } ell(x, y - 2 + Math.sin(t * 1.5) * 1.5, 12, 3, 'rgba(154,216,255,.35)'); },
  ferry: (x, y, t) => { const b = Math.sin(t * 1.4) * 2; ell(x, y + 2, 26, 6, 'rgba(0,0,0,.3)'); poly([x - 28, y - 8 + b, x + 28, y - 8 + b, x + 20, y + b, x - 20, y + b], '#6a4a2a');
    ctx.fillStyle = '#2a3a4a'; ctx.fillRect(x - 8, y - 34 + b, 16, 26); circ(x, y - 40 + b, 9, '#c8b090'); ctx.fillStyle = '#3a2a1a'; ctx.fillRect(x - 12, y - 48 + b, 24, 4); ctx.fillRect(x - 7, y - 54 + b, 14, 7);
    eyes(x, y - 41 + b, 4, 2, '#1a1020', blinkAt(t)); line(x + 8, y - 22 + b, x + 26, y + 6 + b + Math.sin(t * 1.4) * 4, '#8a6a3a', 3); },
  bottle: (x, y, t) => { const b = Math.sin(t * 2) * 2; ctx.save(); ctx.translate(x, y - 6 + b); ctx.rotate(0.5); ctx.fillStyle = 'rgba(120,190,160,.7)'; ctx.fillRect(-5, -10, 10, 18); ctx.fillRect(-2, -16, 4, 6); ctx.fillStyle = '#e8dcc0'; ctx.fillRect(-3, -6, 6, 9); ctx.restore(); },
});

/* ---- Tidelock monsters: telegraphed, bot-verified (patbot) ---- */
A.puddleDrop = { name: 'Puddle Drop', dur: 6.5, size: [260, 180], desc: 'drops fall in a curtain; two dry columns drift together',
  run(S) { const cols = 7, cw = arena.w / cols; let a = 1, b = 5;
    S.every(0.9 / S.d, n => { if (n % 2) { if (a < b - 1) a++; else a = 1; } else { if (b > a + 1) b--; else b = 5; }
      for (let i = 0; i < cols; i++) if (i !== a && i !== b) shot(-hw() + cw * (i + 0.5), -hh() - 8, 0, 115 * S.d, 5, '#9ad8ff', { warn: 0.55 }); sfx('warn'); }, 0.2, 5.8); } };
A.skipStone = { name: 'Skipping Stones', dur: 6, size: [260, 180], desc: 'stones skip across in slow hops',
  run(S) { S.every(0.75 / S.d, n => { const s = n % 2 ? 1 : -1, y0 = rand(-hh() + 30, hh() - 30), ph = rand(0, 3);
    shot(s * (hw() + 10), y0, -s * 90 * S.d, 0, 6, '#b8b0a0', { warn: 0.4, fn: b => { b.y = y0 - Math.abs(Math.sin(b.age * 2.6 + ph)) * 26; } }); }, 0.2, 5.4); } };
A.tideLines = { name: 'Tide Lines', dur: 6.5, size: [280, 180], desc: 'two of four lanes flood (marked first); the dry pair swaps',
  run(S) { const lanes = 4, lh = arena.h / lanes;
    S.every(1.1 / S.d, n => { const wet = n % 2 ? [0, 2] : [1, 3]; for (const l of wet) bar(0, -hh() + lh * (l + 0.5), arena.w + 4, lh - 8, 0, 0, '#3a8ab0', { warn: 0.8, life: 0.8 + 0.45 }); sfx('warn'); }, 0.3, 5.8); } };
A.barnacleBurst = { name: 'Barnacle Burst', dur: 6, size: [260, 190], desc: 'barnacles pop from the rim and spray slow rings',
  run(S) { S.every(1.0 / S.d, n => { const side = n % 2 ? 1 : -1, cx = side * (hw() - 10), cy = -hh() + 10 + (n % 3) * (arena.h - 20) / 2, k = 7, off = rand(0, 1);
    for (let i = 0; i < k; i++) { const a = (i + off) / k * 6.283; shot(cx, cy, Math.cos(a) * 70 * S.d, Math.sin(a) * 70 * S.d, 5, '#d8c8a0', { warn: 0.6 }); } sfx('warn'); }, 0.2, 5.3); } };
Object.assign(ENEMIES, {
  puddlepeep: { id: 'puddlepeep', name: 'Puddlepeep', hp: 46, def: 1, atk: 1.15, torque: 9, cogs: 12, d: 1.05, attacks: ['puddleDrop', 'skipStone'], art: 'puddlepeep', track: 'tidebattle', mini: 0.3,
    check: 'EDGE 5 · PLATING 1 · a puddle with eyes. watches everyone who steps over it. nobody steps IN.',
    intro: 'A Puddlepeep blinks up at you from the cobbles!', flavor: ['Puddlepeep reflects you back, slightly wrong.', 'Puddlepeep ripples nervously.', 'The water around Puddlepeep is rising. It is always rising.'], calm: 'Puddlepeep is reflecting the sky instead of you.',
    talk: ['don\'t step on me.', 'everyone steps OVER.', 'i see you. upside down.', 'am i deep? i might be deep.'],
    acts: {
      'Look In': B => ({ t: ['You look into Puddlepeep.', 'Your reflection waves. You didn\'t wave.'], c: 25, say: 'hi!!' }),
      'Step In': B => ({ t: ['You step right in. Splash.', B.n('Look In') ? 'Puddlepeep is overjoyed. Someone finally visited.' : 'Puddlepeep panics. Who ARE you?'], c: B.n('Look In') ? 60 : -10, say: B.n('Look In') ? 'a VISITOR.' : 'HEY.' }),
      'Skip a Stone': B => ({ t: ['You skip a pebble across it. Plip, plip, plip.', 'Puddlepeep counts the rings.'], c: 30, say: 'three!' }),
    }, spare: 'Puddlepeep settles flat, reflecting a little star that isn\'t in the sky.', kill: 'Puddlepeep goes still. Then it is just a puddle. Then it is just wet stone.' },
  barnaclock: { id: 'barnaclock', name: 'Barnaclock', hp: 52, def: 2, atk: 1.15, torque: 10, cogs: 13, d: 1.05, attacks: ['tideLines', 'barnacleBurst'], art: 'barnaclock', track: 'tidebattle', mini: 0.3,
    check: 'EDGE 5 · PLATING 3 · a clock face crusted shut with barnacles. it remembers being wound.',
    intro: 'A Barnaclock grinds up out of the canal!', flavor: ['Barnaclock tries to tick. It scrapes.', 'Something under the barnacles is still counting.', 'Barnaclock smells like low tide. There hasn\'t been one in years.'], calm: 'Barnaclock\'s hands twitch. Almost a tick.',
    talk: ['crrk.', 'what... time...', 'covered. COVERED.', 'wind me. or don\'t. crrk.'],
    acts: {
      'Scrape': B => ({ t: ['You scrape a few barnacles off its face.', 'Under them: the number 12. Of course.'], c: 30, say: 'crk... better.' }),
      'Wind': B => ({ t: ['You find the winding key and give it a turn.', B.n('Scrape') ? 'The hands move! One tick! Barnaclock shudders with joy.' : 'It\'s jammed with shells. Barnaclock groans.'], c: B.n('Scrape') ? 65 : -5, say: B.n('Scrape') ? 'TICK.' : 'crrrk!' }),
      'Ask the Time': B => ({ t: ['You ask Barnaclock what time it is.', 'It thinks very hard. "...wet," it says.'], c: 20, say: 'wet o\'clock.' }),
    }, spare: 'Barnaclock sinks back into the canal, ticking once, softly, as it goes.', kill: 'Barnaclock cracks open. Inside, the gears are perfectly dry.' },
});
ENC_TABLE.tide.push('puddlepeep', 'barnaclock');
ART.puddlepeep = (x, y, t, s) => { const w = Math.sin(t * 2.2) * 3; ell(x, y + 18, 48 + w, 16 - w * 0.3, '#2a5a7a'); ell(x, y + 16, 40 + w, 11, '#4a8ab0');
  ctx.save(); ctx.globalAlpha = 0.35; ell(x - 10, y + 12, 12, 3, '#e8f4ff'); ctx.restore(); eyes(x, y + 8, 9, 6, '#f4f0e0', blinkAt(t)); };
ART.barnaclock = (x, y, t, s) => { const b = Math.sin(t * 1.6) * 2, yy = y + b; circ(x, yy, 38, '#4a5a5a'); circ(x, yy, 31, '#d8d0b8');
  line(x, yy, x + Math.cos(-1.57) * 20, yy + Math.sin(-1.57) * 20, '#2a2030', 3); line(x, yy, x + 14, yy + 2, '#2a2030', 3);
  for (let i = 0; i < 9; i++) { const a = i * 0.7 + 0.3, r = 22 + (i % 3) * 7; ell(x + Math.cos(a) * r, yy + Math.sin(a) * r, 6, 5, i % 2 ? '#b8b098' : '#8a8a78'); }
  eyes(x, yy - 10, 7, 4, '#1a1020', blinkAt(t)); };
