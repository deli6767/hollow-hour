/* ===================== CHAPTER 2 DEPTHS (v1.4): Boiler Gallery · Lost Property · Sprocket's Nook + Gaskette, Shiftwhistle ===================== */
// The Cogworks gets a gap in its west wall (rows 8-9) leading down into the Boiler Gallery.
{ const R = ROOMS.cogworks1, m = R.map; for (const y of [8, 9]) m[y] = '.' + m[y].slice(1); R.exits.push({ x: 0, y: 8, w: 1, h: 2, to: 'boilergal', tx: 28, ty: 6 }); }
Object.assign(ROOMS, {
  boilergal: { name: 'Boiler Gallery', area: 'cogworks', theme: 'cog', track: 'cog', enc: 'cogworks', map: [
    '#########....#################',
    '#TTTTTTTT....TTTTTTTTTTTTTTTT#',
    '#T..........................T#',
    '#....,,,,,.........,,,,,.....#',
    '#...,,,,,,,.......,,,,,,,.....',
    '......,,,,.........,,,,,......',
    '..............................',
    '...........................T..',
    '#T....,,,,,.......,,,,,,....T#',
    '#....,,,,,,,.....,,,,,,,,....#',
    '#T..........................T#',
    '#TTTTTTTTTTTTTTTTTTTTTTTTTTTT#',
    '##############################'],
    exits: [{ x: 29, y: 4, w: 1, h: 4, to: 'cogworks1', tx: 1, ty: 8 }, { x: 0, y: 5, w: 1, h: 3, to: 'lostfound', tx: 14, ty: 5 }, { x: 9, y: 0, w: 4, h: 1, to: 'belthall', tx: 9, ty: 12 }],
    ents: [
      { t: 'thing', look: 'boiler', x: 15, y: 2, walk: true, run: async () => { const n = hero.flags.boiler_n = (hero.flags.boiler_n || 0) + 1;
        if (n === 1) return say('', 'A boiler the size of a house. The pressure gauge reads 11:59.', 'Not PSI. Just 11:59.');
        if (n === 2) return say('', 'You knock on the boiler. Something knocks back, twice.', 'Then, politely, a third time.');
        return say('', 'The boiler is warm the way a sleeping animal is warm.'); } },
      { t: 'sign', x: 24, y: 2, text: ['SHIFT BOARD. NIGHT SHIFT: everyone. DAY SHIFT: everyone.', 'NEXT SHIFT CHANGE: 12:00.', 'Someone has added, very small: "lol"'] },
      { t: 'chest', x: 2, y: 9, item: 'gearcake', flag: 'c_bg1' },
    ] },
  lostfound: { name: 'Lost Property', area: 'cogworks', theme: 'town', track: 'vesper', map: [
    '################',
    '#BBBBBBBBBBBBBB#',
    '#..............#',
    '#..____________#',
    '#..____________.',
    '#..____________.',
    '#..............#',
    '#TT..........TT#',
    '################'],
    exits: [{ x: 15, y: 4, w: 1, h: 2, to: 'boilergal', tx: 1, ty: 6 }],
    ents: [
      { t: 'thing', look: 'punchclock', x: 7, y: 2, run: async () => dotClerk() },
      { t: 'thing', look: 'ledger', x: 11, y: 2, walk: true, run: async () => { const f = hero.flags; f.ledger_read = true;
        return say('', 'The LOST PROPERTY LEDGER. Neat handwriting, then less neat, then very neat again.',
          '· 1 umbrella (forecast unclear). UNCLAIMED.', f.q_hour === 3 ? '· 1 hour, pocket-sized. CLAIMED by T. (He signed it twice. Both are dated "now".)' : '· 1 hour, pocket-sized. Sent to "somewhere with rails".',
          '· 1 name. Lettering illegible. Starts with a tall letter. UNCLAIMED.', '· 1 ticket, Platform 1_. CLAIMED. (the signature is yours.)', f.ws_visited ? 'The ink on the last line is still wet.' : 'You have never been here before.'); } },
      { t: 'thing', look: 'umbrella', x: 3, y: 6, walk: true, run: async () => say('', 'A stand of umbrellas, all furled. It has not rained in forty years.', 'One of them is damp.') },
      { t: 'chest', x: 13, y: 6, item: 'tea', flag: 'c_lf1' },
    ] },
  nook: { name: 'Sprocket\'s Nook', area: 'cogworks', theme: 'cog', track: 'cog', map: [
    '#################',
    '#TTTTTTTTTTTTTTT#',
    '#T.............T#',
    '#...............#',
    '#...............#',
    '#...............#',
    '#T.............T#',
    '#TTTTTT....TTTTT#',
    '#######....######'],
    exits: [{ x: 7, y: 8, w: 4, h: 1, to: 'belthall', tx: 9, ty: 1 }],
    ents: [
      { t: 'thing', look: 'tarp', x: 8, y: 3, walk: true, run: async () => { const f = hero.flags; f.nook_tarp = (f.nook_tarp || 0) + 1;
        if (f.nook_tarp === 1) return say('', 'Something big under a tarp. A paper sign is taped on: "NOT AUTHORIZED. (by me.) (yet.)"', 'It is ticking. Not like a clock. Like a heartbeat that is trying to remember how.');
        return say('', 'You lift a corner of the tarp. Wheels? Fins? A bell?', 'You put it back down. It felt rude.'); } },
      { t: 'thing', look: 'scraps', x: 13, y: 2, walk: true, run: async () => say('', 'Blueprint scraps pinned to the wall, all for the same thing, all crossed out.', 'In the margin, in Sprocket\'s blocky letters: "WHAT DOES IT NEED TO GO FORWARD?"', 'Under that, in a different hand: "a reason."') },
      { t: 'sign', x: 3, y: 2, text: ['A crayon drawing of a train. The engine has a face. The face is smiling.', 'Carriage 13 is coloured in black.'] },
    ] },
});
async function dotClerk() { VOICES.DOT = 560; const f = hero.flags, n = f.dot_n = (f.dot_n || 0) + 1;
  if (n === 1) return say('DOT', 'Ka-CHUNK. Lost Property. Name and time of loss, please.', '...Time of loss is 11:59? Everybody says 11:59.', 'Fine. I\'ll put "11:59". Again.');
  if (n === 2) return say('DOT', f.ledger_read ? 'Don\'t read the ledger. It\'s confidential. ...Did you sign the last line? You did. I watched you.' : 'We have an umbrella, an hour, and a name. Nobody wants the name.', 'Ka-CHUNK.');
  if (f.killed_grit && !f.dot_grit) { f.dot_grit = true; return say('DOT', 'Foreman\'s card came in today. Nobody punched it out.', 'I filed it under "Lost". It\'s the only place I had.'); }
  if (f.mop_n_rustwood && !f.dot_mop) { f.dot_mop = true; return say('DOT', 'The janitor? He\'s never lost anything. He has lost-property tickets for EVERYTHING else, though.', 'Including me. Ticket 0001. Ka-CHUNK.'); }
  return say('DOT', ['Ka-CHUNK.', 'Lost something? Fill in a form. The form is lost. Fill in a form for the form.', 'I clock in every minute. It\'s the same minute. I get paid once.'][n % 3]);
}
Object.assign(THING, {
  boiler: (x, y, t) => { ctx.fillStyle = '#5a4030'; ell(x, y - 46, 46, 44, '#6a4a32'); ctx.fillRect(x - 46, y - 46, 92, 46); circ(x + 20, y - 60, 12, '#e8dcc0'); circ(x + 20, y - 60, 10, '#f4ecd8');
    line(x + 20, y - 60, x + 14, y - 66, '#2a2030', 2); line(x + 20, y - 60, x + 21, y - 69, '#2a2030', 2); ctx.save(); ctx.globalAlpha = 0.25 + Math.sin(t * 2) * 0.1; circ(x - 20, y - 96 - (t * 20 % 20), 10, '#d8d0c8'); ctx.restore(); },
  punchclock: (x, y, t) => { ctx.fillStyle = '#7a6a50'; ctx.fillRect(x - 14, y - 50, 28, 44); circ(x, y - 38, 9, '#f4ecd8'); line(x, y - 38, x, y - 45, '#2a2030', 2); ctx.fillStyle = '#2a2420'; ctx.fillRect(x - 8, y - 20, 16, 3); eyes(x, y - 28, 6, 3, '#1a1020', blinkAt(t)); },
  ledger: (x, y) => { ctx.fillStyle = '#5a3a1a'; ctx.fillRect(x - 18, y - 26, 36, 6); ctx.fillStyle = '#e8dcc0'; ctx.fillRect(x - 15, y - 34, 30, 9); line(x, y - 34, x, y - 25, '#8a7a5a', 1); },
  umbrella: (x, y) => { ctx.fillStyle = '#4a3a2a'; ctx.fillRect(x - 10, y - 20, 20, 18); for (let i = 0; i < 4; i++) line(x - 7 + i * 5, y - 20, x - 8 + i * 5, y - 44, ['#3a4a6a', '#6a3a3a', '#3a3a3a', '#4a6a5a'][i], 3); },
  tarp: (x, y, t) => { const b = Math.sin(t * 1.3) * 1.2; poly([x - 40, y, x + 40, y, x + 30, y - 46 + b, x - 34, y - 50 + b], '#5a6a5a'); ctx.fillStyle = '#e8dcc0'; ctx.fillRect(x - 10, y - 34, 20, 12); },
  scraps: (x, y) => { ctx.fillStyle = '#5a7aa0'; ctx.fillRect(x - 20, y - 50, 16, 12); ctx.fillRect(x - 2, y - 46, 18, 12); ctx.fillRect(x - 12, y - 32, 18, 10); line(x - 20, y - 50, x - 4, y - 38, '#c03030', 1); },
});

/* ---- two more Cogworks monsters ---- */
A.dripGrid = { name: 'Drip Grid', dur: 6.5, size: [260, 180], desc: 'leaky pipes drip in columns; the dry column moves one step at a time',
  run(S) { const cols = 6, cw = arena.w / cols; let dry = 2;
    S.every(0.8 / S.d, n => { dry = clamp(dry + (Math.random() < 0.5 ? -1 : 1), 0, cols - 1);
      for (let i = 0; i < cols; i++) if (i !== dry) shot(-hw() + cw * (i + 0.5) + rand(-8, 8), -hh() - 8, 0, 120 * S.d, 5, '#8ab8d8', { warn: 0.5 }); sfx('warn'); }, 0.2, 5.8); } };
A.gasketPop = { name: 'Gasket Pop', dur: 6, size: [260, 180], desc: 'rubber rings pop off the walls and roll across slowly',
  run(S) { S.every(0.6 / S.d, n => { const s = n % 2 ? 1 : -1, y = rand(-hh() + 14, hh() - 14); shot(s * (hw() + 10), y, -s * 95 * S.d, 0, 8, '#3a3a3a', { warn: 0.4 }); }, 0.2, 5.4); } };
A.shiftChange = { name: 'Shift Change', dur: 6.5, size: [280, 170], desc: 'whistle blasts sweep one lane; the next shift starts from the other side',
  run(S) { const lanes = 3, lh = arena.h / lanes;
    S.every(1.2 / S.d, n => { const lane = [0, 2, 1][n % lanes], s = n % 2 ? 1 : -1;
      for (const l of lane === 1 ? [1, n % 2 ? 0 : 2] : [lane]) bar(0, -hh() + lh * (l + 0.5), arena.w + 4, lh - 2, 0, 0, '#f0e0a0', { warn: 0.9, life: 0.9 + 0.4 }); sfx('warn'); }, 0.3, 5.8); } };
A.steamPuff = { name: 'Steam Puffs', dur: 6, size: [260, 180], desc: 'puffs of steam rise and wobble',
  run(S) { S.every(0.5 / S.d, () => { const x0 = rand(-hw() + 16, hw() - 16), ph = rand(0, 6.283); shot(x0, hh() + 8, 0, -60 * S.d, 7, '#d8d0c8', { fn: b => { b.x = x0 + Math.sin(b.age * 2.5 + ph) * 18; } }); }, 0, 5.4); } };
Object.assign(ENEMIES, {
  gaskette: { id: 'gaskette', name: 'Gaskette', hp: 40, def: 1, atk: 1.1, torque: 8, cogs: 11, d: 1.05, attacks: ['dripGrid', 'gasketPop'], art: 'gaskette', track: 'battle', mini: 0.3,
    check: 'EDGE 5 · PLATING 2 · a rubber gasket. terrified of leaks. is, technically, a leak.',
    intro: 'A Gaskette squeaks out from between two pipes!', flavor: ['Gaskette checks itself for drips.', 'Somewhere, a pipe goes "plink". Gaskette screams.', 'Gaskette is holding very, very tight.'], calm: 'Gaskette has stopped trembling. Mostly.',
    talk: ['IS THAT A DRIP?', 'hold. hold. hold.', 'i keep everything IN.', 'what if i let go... no. NO.'],
    acts: {
      'Tighten': B => ({ t: ['You give the Gaskette a gentle quarter-turn.', 'It squeaks. It feels secure.'], c: 35, say: 'snug.' }),
      'Mop Up': B => ({ t: ['You mop up the drips around it.', hero.flags.mop_n_rustwood ? 'You do it the way the janitor does. Gaskette is deeply impressed.' : 'You use your sleeve. It works.'], c: hero.flags.mop_n_rustwood ? 60 : 30, say: 'DRY. dry!' }),
      'Let Go': B => ({ t: ['You tell it it\'s okay to let go a little.', B.n('Tighten') ? 'It trusts you. It loosens. A single drop falls. Nothing bad happens.' : 'It does NOT trust you yet. It clamps down harder.'], c: B.n('Tighten') ? 55 : -15, say: B.n('Tighten') ? '...oh.' : 'NEVER.' }),
    }, spare: 'Gaskette rolls back between the pipes, a little looser than before.', kill: 'Gaskette splits. Everything it was holding in leaks out at once.' },
  shiftwhistle: { id: 'shiftwhistle', name: 'Shiftwhistle', hp: 44, def: 1, atk: 1.1, torque: 9, cogs: 12, d: 1.05, attacks: ['shiftChange', 'steamPuff'], art: 'shiftwhistle', track: 'battle', mini: 0.3,
    check: 'EDGE 5 · PLATING 1 · the factory whistle. has been waiting forty years to blow for the end of a shift.',
    intro: 'A Shiftwhistle shrieks into view!', flavor: ['Shiftwhistle takes a deep breath. Holds it.', 'Shiftwhistle stares at a clock that isn\'t there.', 'Steam hisses. Nobody clocks out.'], calm: 'Shiftwhistle is humming instead of shrieking.',
    talk: ['NOT YET.', 'almost... almost...', 'END OF SHI- no.', 'who decides when it\'s over?'],
    acts: {
      'Clock Out': B => ({ t: ['You mime punching a time card.', B.n('Clock Out') ? 'You do it again, with feeling. Shiftwhistle trembles with joy.' : 'Shiftwhistle gasps. Is it... time?'], c: B.n('Clock Out') ? 50 : 30, say: 'IS IT?!' }),
      'Cover Ears': B => ({ t: ['You cover your ears.', 'Shiftwhistle is flattered. It has never been taken this seriously.'], c: 20, say: 'thank you.' }),
      'Say "It\'s Over"': B => ({ t: ['You tell Shiftwhistle the shift is over.', B.n('Clock Out') ? 'It blows one long, beautiful note. Somewhere far off, the Belfry almost answers.' : 'It doesn\'t believe you. Nobody has clocked out.'], c: B.n('Clock Out') ? 70 : 5, say: B.n('Clock Out') ? 'FWEEEEEEEE.' : 'liar.' }),
    }, spare: 'Shiftwhistle drifts off, quietly whistling, off the clock at last.', kill: 'The whistle cracks mid-note. The shift never ends.' },
});
ENC_TABLE.cogworks.push('gaskette', 'shiftwhistle'); AREA_POP.cogworks += 2;
ART.gaskette = (x, y, t, s) => { const sq = Math.sin(t * 6) * 2, yy = y;
  ctx.save(); ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 16; ctx.beginPath(); ctx.ellipse(x, yy, 34 + sq, 34 - sq, 0, 0, 6.283); ctx.stroke(); ctx.restore();
  eyes(x, yy - 34, 7, 4, '#f4f0e0', blinkAt(t)); circ(x + 20, yy + 40 + (t * 30 % 18), 3, '#8ab8d8'); };
ART.shiftwhistle = (x, y, t, s) => { const b = Math.sin(t * 3) * 2, yy = y + b;
  ctx.fillStyle = '#c8a050'; ctx.fillRect(x - 14, yy - 50, 28, 80); ell(x, yy - 50, 14, 6, '#e8c870'); ctx.fillStyle = '#8a6a30'; ctx.fillRect(x - 18, yy + 26, 36, 10);
  ctx.fillStyle = '#2a2420'; ctx.fillRect(x - 6, yy - 10, 12, 8); eyes(x, yy - 28, 7, 4, '#1a1020', blinkAt(t));
  ctx.save(); ctx.globalAlpha = 0.3; circ(x, yy - 70 - (t * 25 % 25), 9, '#d8d0c8'); ctx.restore(); };
