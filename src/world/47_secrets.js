/* ===================== HOLLOW HOUR · the secret network =====================
   Nothing in here announces itself. Flags (hero.flags unless noted):
   mop_n_<loc>  talks with Mopsley per spot · mop_fight 'spare'|'slip' · ws_visited · mirror_seen · cog_lv · ticket via drawer
   closet · photo · showTicket/showPhoto/oneMore (MERIDIAN) · meta.endings (post-ending world) */
// post-ending world changes are PER FILE (meta.fileEnds[slot]); the endings gallery/records stay global.
const everEnded = () => !!(meta.fileEnds && meta.fileEnds[slot] && meta.fileEnds[slot].length);
const SECRET_BOSS_ROOM = { wickgate: 'wicklow', cogworks2: 'grit', gallery: 'cuckoo' };
function roomTrackFor(id) {
  const boss = SECRET_BOSS_ROOM[id]; const def = ROOMS[id];
  if (id === 'workshop' || id === 'room3') return 'vesper';
  if (boss && hero.flags[boss + '_done']) return variantTrack(ENEMIES[boss].track, hero.flags['killed_' + boss] ? 'broken' : 'warm');
  return def.track;
}
function saveClock() { // the chime posts keep a time. it should always be 11:59. it isn't, always.
  if (hero.room === 'belfry') return everEnded() ? '12:01' : '12:00';
  if (hero.room === 'bellfall' && hero.flags.ws_visited) return '11:58';
  return '11:59';
}
function goRoom(id, tx, ty, dir) { pendingExit = { to: id, tx, ty, dir }; roomFade = 0; }

/* ---------------- MOPSLEY: custodian of everything ---------------- */
function mopLoc() {
  if (everEnded() && !hero.flags.wicklow_done) return 'crater';
  if (!hero.flags.wicklow_done) return 'rustwood';
  if (!hero.flags.grit_done) return 'town';
  if (!hero.flags.cuckoo_done) return 'stair';
  return 'gallery';
}
async function mopTalk(loc) {
  const f = hero.flags, k = 'mop_n_' + loc; f[k] = (f[k] || 0) + 1; const n = f[k];
  RM.mopStreak = (RM.mopStreak || 0) + 1;
  if (has('ticket') && !f.mop_ticket) { f.mop_ticket = true; return say('MOPSLEY', 'Oh, you found my ticket.', '...No, keep it. I\'ve got another. I\'ve always got another.'); }
  if (RM.mopStreak >= 3 && !f.mop_fight) {
    const c = await ask('MOPSLEY', 'You\'re still here. You\'re REALLY still here. Fine. You want to see how a professional mops?', ['YES', 'NO']);
    if (c === 0) { RM.mopStreak = 0; await say('MOPSLEY', 'Mind your step.'); startBattle('mopsley', {}); return; }
    RM.mopStreak = 0; return say('MOPSLEY', 'Smart. Floor\'s wet.');
  }
  const L = {
    rustwood: [
      ['Oh. It\'s you again.', '...No? We haven\'t met? Huh. Must\'ve been the other one.', 'I\'m mopping the grass. Somebody has to. Look at it. Green. EVERYWHERE.'],
      ['Mopsley. Custodian.', 'Custodian of what? Everything, technically. It\'s a big job. Mostly grass.'],
      f.lanternFails ? [`Right, middle, left. You'd think after ${f.lanternFails + 1} tries...`, '...What? I didn\'t say anything. I\'m mopping.'] : ['Lanterns down south. East to west. Not that anyone asked the janitor.'],
    ],
    town: [
      [f.killed_wicklow ? 'Wax is murder to get out of grass. Don\'t ask how I know.' : 'Knight took the bakery bench. Good for him. That bench needed someone.'],
      ['Ever notice the door on the Clockmaker\'s?', 'Me neither. Don\'t notice it. Lot of people don\'t notice it. Good habit.'],
      ['12:01. Don\'t be late.', '...For what? I didn\'t say anything. I was humming.'],
    ],
    stair: [
      ['Never been up the tower. First time. Lovely stairs.'],
      f.ws_visited ? ['You\'ve been in the shop. Smells like her in there, doesn\'t it.', '...Smells like OIL. I said oil.'] : ['Factory\'s quiet now. Quiet\'s harder to clean than noise. Noise you can sweep.'],
      [`Mind the puddle, ${hero.name}.`, '...How do I know your name? It\'s on your scarf.', '(Your scarf has nothing written on it.)'],
    ],
    gallery: [
      ['Back when I mopped the Belfry, the bell was cleaner.', '...What? No. I said I\'ve never been up there. Keep up.'],
      ['When it rings, somebody has to sweep up what\'s left of the minute.', '...Also my knees hurt. Nobody ever asks about the knees.'],
      [f.killed_cuckoo ? 'Nobody\'s going to clean that stage. I\'m not going to clean that stage.' : 'Best seat in the house, this. Always has been. I\'ve had it a long time.'],
    ],
    crater: [
      ['Big mess, this one. Every time a chime falls, somebody\'s got to—', '...Every time it RAINS. I said rains.'],
      ['Don\'t look at me like that. You\'ve never met me. Remember?'],
      ['Tag\'s still there, if you were wondering. Nobody ever reads the tag.'],
    ],
  }[loc];
  return say('MOPSLEY', ...L[Math.min(n - 1, L.length - 1)]);
}
const MOP_SPOTS = { rustwood: ['rustwood', 26, 15], town: ['gearholm', 38, 13], stair: ['spire1', 27, 13], gallery: ['gallery', 3, 12], crater: ['bellfall', 7, 10] };
for (const loc in MOP_SPOTS) { const [room, x, y] = MOP_SPOTS[loc];
  ROOMS[room].ents.push({ t: 'npc', kind: 'mopsley', name: 'MOPSLEY', x, y, voice: 190, show: () => mopLoc() === loc && !(loc === 'gallery' && hero.flags.meridian_done), run: () => mopTalk(loc) }); }

/* ---------------- GEARHOLM: the door, the fountain cog, Bun, Rivet ---------------- */
{ const G = ROOMS.gearholm.ents;
  const door = G.find(e => e.t === 'door' && e.x === 32); door.t = 'thing'; door.look = 'none'; door.walk = true;
  door.run = async () => {
    if (!hero.flags.grit_done) return say('', 'THE CLOCKMAKER\'S. "Closed until midnight."', 'The sign is very dusty.');
    if (!hero.flags.ws_visited) await say('', 'The sign has slipped on its nail: "CLOSED UNTIL MIDNI—"', 'The door is open. Just a crack. Was it always?');
    goRoom('workshop', 8, 8, 0); hero.flags.ws_visited = true;
  };
  const fountain = G.find(e => e.t === 'sign' && e.x === 21); fountain.t = 'thing'; fountain.look = 'none'; fountain.walk = true;
  fountain.run = async () => {
    const f = hero.flags;
    if (everEnded() && f.ws_visited) return say('', 'The fountain\'s water has finished its splash.', 'The cog that hung in the air for forty years is gone. Nobody saw it land.');
    if (f.ws_visited && (has('photo') || has('ticket'))) { f.cog_lv = 2; return say('', 'The cog hanging over the fountain turns, just slightly, toward you.', 'Engraved on its rim: "FOR V. — SEE YOU AT 12:01."'); }
    if (f.ws_visited) { f.cog_lv = 1; return say('', 'The fountain\'s water is frozen mid-splash.', 'The cog in the air has something engraved on its rim. A letter, and a time. You can\'t quite read it from here. Not yet.'); }
    return say('', 'The fountain\'s water is frozen mid-splash. It has been for forty years.', 'Someone tossed a cog in for luck. It\'s still in the air.');
  };
  const bun = G.find(e => e.name === 'BUN'); const bunOld = bun.run;
  bun.run = async () => {
    if (!hero.flags.ws_visited) return bunOld();
    const c = await ask('BUN', 'Welcome back, sweetie! Nap\'s 15 cogs. Or... hm. Room 3 is free. Room 3 is always free.', ['NAP (15c)', 'ROOM 3?', 'NO THANKS']);
    if (c === 1) { await say('BUN', 'I make it up every night. Fresh sheets. Forty years.', '...I don\'t remember who it\'s for. Isn\'t that funny? Go on up. Don\'t tell them I let you.'); return goRoom('room3', 6, 6, 0); }
    if (c !== 0) return say('BUN', 'Come back any time! Literally. It\'s always the same time.');
    if (hero.cogs < 15) return say('BUN', 'Ah... you\'re a little short. Next time, sweetie.');
    hero.cogs -= 15; await fadeNap(); hero.glow = maxGlow(hero); sfx('heal');
    const f = hero.flags; f.town_night = !f.town_night; f.naps = (f.naps || 0) + 1; // same day/night flip as the normal inn nap (hub.js)
    return say('BUN', 'Good nap? You were out for one whole minute. Same minute, but still.', f.town_night ? 'It\'s "night" now. We all agreed to be quieter about it.' : 'And it\'s morning again. Lovely, isn\'t it?');
  };
  const rivet = G.find(e => e.name === 'SGT. RIVET'); const rivOld = rivet.run;
  rivet.run = async () => { if (hero.flags.grit_done && !hero.flags.ws_visited) return say('SGT. RIVET', 'Huh. The Clockmaker\'s door is open.', 'Nobody\'s been in there since... since...', '...Huh. Since who?'); return rivOld(); };
}
/* Tolly, after any ending, in any new game */
{ const T = ROOMS.bellfall.ents.find(e => e.name === 'TOLLY'); const old = T.run;
  T.run = async () => { if (everEnded() && hero.flags.metTolly && !hero.flags.tollyEcho) { hero.flags.tollyEcho = true; return say('TOLLY', 'Funny. I keep thinking I\'ve told you all this before.', 'We were walking to the bakery, weren\'t we? We. ...I always say "we". I don\'t know why I say "we".'); }
    if (hero.flags.metTolly && has('photo') && !hero.flags.tollyPhoto) { hero.flags.tollyPhoto = true; return say('TOLLY', 'Where did you find this? That\'s me! Look at my little legs.', 'And that\'s the jester, before the bell. And that\'s...', '...', 'Huh. Must be a smudge.'); }
    return old(); };
  const cr = ROOMS.bellfall.ents.find(e => e.t === 'crater');
  cr.run = async () => {
    if (everEnded()) { hero.flags.tag = true; return say('', 'A small crater, shaped like you.', 'Half-buried in the dirt is a paper tag you never noticed before.', '"COGWORKS · ORDER No. 12 · ONE (1) CHIME · FRAGILE · DELIVER TO: BELFRY"', 'The signature line is blank. Nobody ever signed for it.'); }
    return say('', 'A small crater, shaped like you. It\'s still a little warm.');
  };
}
/* the Cogworks: Door 13 (the fake lead) and the ledger */
ROOMS.cogworks1.ents.push({ t: 'thing', look: 'door13', x: 28, y: 14, walk: true, run: async () => {
  if (!hero.flags.grit_done) return say('', 'DOOR 13 · MAINTENANCE', 'A hand-painted sign: "DO NOT OPEN: THE TRUTH ABOUT MIDNIGHT."', 'Locked. Foreman Grit has the only key.');
  if (!hero.flags.closet) await say('', 'With the machines stopped, Door 13 has rattled loose. THE TRUTH ABOUT MIDNIGHT is right behind it.');
  goRoom('closet', 4, 4, 0); } });
ROOMS.cogworks2.ents.push(
  { t: 'thing', look: 'ledger', x: 25, y: 3, show: () => hero.flags.grit_done, run: async () => { hero.flags.ledger = true;
    return say('', 'The Foreman\'s order ledger. Every page says the same thing: "SHIFT CONTINUES."', 'Except two lines, near the front, in a different hand:', '"No. 12 · one (1) chime, small · SHIPPED"', '"No. 13 · one (1) heart-spring · NOT AUTHORIZED · for V."', 'Number 13 is crossed out so hard the pen went through the page.'); } },
  { t: 'thing', look: 'remnant_grit', x: 14, y: 4, walk: true, show: () => hero.flags.grit_done, run: async () => hero.flags.killed_grit
    ? say('', 'The big drill stopped mid-turn. The whole floor is holding its breath.', 'Nobody will ever finish this shift now. That was the point, wasn\'t it?')
    : say('', 'A hard hat hangs on a gear. A sign, in very careful letters: "ON BREAK."', 'Under it, smaller: "(indefinitely) (thank you)"') });
ROOMS.wickgate.ents.push({ t: 'thing', look: 'remnant_wicklow', x: 14, y: 4, walk: true, show: () => hero.flags.wicklow_done, run: async () => hero.flags.killed_wicklow
  ? say('', 'A puddle of cold wax. The wick lies in it, curled like a question mark.', 'The candles by the gate have gone out. You don\'t remember them going out.')
  : say('', 'A note, pinned under a stone, in looping knightly script:', '"Gone to the bakery bench. Do not wait up. — W."', '"P.S. If you see the lady with the tools, tell her the candle is still lit."') });
ROOMS.gallery.ents.push(
  { t: 'thing', look: 'remnant_cuckoo', x: 14, y: 4, walk: true, show: () => hero.flags.cuckoo_done, run: async () => hero.flags.killed_cuckoo
    ? say('', 'An empty spotlight, still on.', 'Nobody is left to switch it off.')
    : say('', 'A single paper rose on the stage.', has('rose') ? 'Wait, you still have yours. This one is folded from a different timetable. An older one.' : 'It isn\'t the one you threw. This one is folded from an older timetable. The fold marks are worn soft.') },
  { t: 'thing', look: 'portrait', x: 8, y: 2, walk: true, run: async () => { const n = hero.flags.portrait = (hero.flags.portrait || 0) + 1;
    if (n === 1) return say('', 'A painting of the Hourspire choir. Twelve singers in a row.', 'You count the faces. Thirteen.', '...You count again. Twelve.');
    if (n === 2) return say('', 'Twelve singers. Under the frame, a brass plate with thirteen names. One has been polished away.');
    return say('', 'Twelve.'); } });

/* ---------------- NEW ROOMS ---------------- */
ROOMS.workshop = { name: 'The Clockmaker\'s', area: 'town', theme: 'cog', track: 'vesper', map: [
  '##################',
  '#TTTT..TTTT..TTTT#',
  '#................#',
  '#................#',
  '#................#',
  '#................#',
  '#................#',
  '#................#',
  '#................#',
  '#######....#######',
  '#######....#######'],
  exits: [{ x: 7, y: 10, w: 4, h: 1, to: 'gearholm', tx: 32, ty: 9 }],
  ents: [
    { t: 'trigger', x: 1, y: 7, w: 16, h: 2, flag: 'ws_intro', run: async () => { hero.flags.ws_intro = true; await say('', 'Dust. Brass. The smell of oil and something like warm bread.', 'Somewhere in the room, a music box is playing very, very quietly.'); } },
    { t: 'thing', look: 'bench', x: 4, y: 4, run: async () => say('', 'A workbench. Tiny tools laid out in order, smallest to largest.', 'In the vise: a half-finished chime. Spark-shaped. It looks a lot like you.', hero.flags.ledger ? 'Its maker\'s mark is a V. Order No. 12, you think. You don\'t know why you think that.' : 'There\'s a maker\'s mark on it you can\'t read.') },
    { t: 'thing', look: 'blueprint', x: 9, y: 2, walk: true, run: async () => say('', 'Blueprints pinned to the wall. "MERIDIAN · rev. 12."', 'In the margin: "make his hands gentler." Then, crossed out: "he wants to keep the minute. don\'t let him keep the minute."', 'Then, in a hurried hand: "he only wants to keep ME."') },
    { t: 'thing', look: 'chair', x: 12, y: 4, run: async () => say('', 'An empty chair, pulled out from the bench like someone just stood up.', 'The cushion is still dented.') },
    { t: 'thing', look: 'mirror', x: 14, y: 2, walk: true, run: async () => {
      if (!has('wickstub') && !has('waxseal')) return say('', 'A tall mirror, gone dark with dust. You can barely make out your own glow.');
      hero.flags.mirror_seen = true;
      return say('', has('wickstub') ? 'You hold up Wicklow\'s wick. The mirror brightens.' : 'The wax seal in your pocket goes cold. The mirror clears.', 'In the reflection, the chair is not empty.', 'Someone is sitting there, working on something very small. A chime. You.', 'They don\'t look up. You turn around. The chair is empty.'); } },
    { t: 'thing', look: 'musicbox', x: 2, y: 6, run: async () => { sfx('item'); return say('', 'A music box. Its little drum turns by itself.', hero.flags.oneMore ? 'You know this song now. MERIDIAN called it the first one.' : 'The tune is almost familiar. Like something someone hummed to you before you had ears.'); } },
    { t: 'thing', look: 'drawer', x: 6, y: 4, run: async () => {
      if (hero.flags.ticket_got) return say('', 'The drawer is empty except for the smell of train smoke. There are no trains in Gearholm.');
      const h = await ask('', 'A drawer with a little clock-face lock. Two dials. Set the hour:', ['11', '12', '13']);
      const m = await ask('', 'Set the minute:', [':58', ':59', ':00', ':01']);
      if (h === 1 && m === 3) { hero.flags.ticket_got = true; sfx('puzzle'); giveKey('ticket'); return say('', 'Click.', 'Inside: a single train ticket. ADMIT ONE · 12:01 · PLATFORM 13.', 'It has already been punched. The ink is still wet.', '(You got Tomorrow\'s Ticket.)'); }
      sfx('wrong'); return say('', 'Click. Nope.', h === 0 && m === 1 ? 'Of course not. That\'s just now. It\'s always now.' : '');
    } },
  ] };
ROOMS.room3 = { name: 'Room 3', area: 'town', theme: 'spire', track: 'vesper', map: [
  '##############',
  '#TT..........#',
  '#............#',
  '#............#',
  '#............#',
  '#............#',
  '#............#',
  '######..######',
  '######..######'],
  exits: [{ x: 6, y: 8, w: 2, h: 1, to: 'gearholm', tx: 5, ty: 5 }],
  ents: [
    { t: 'thing', look: 'bed', x: 4, y: 2, run: async () => say('', 'A made bed. Fresh sheets, folded tight. Nobody has slept in it.', 'On the pillow, a single long grey hair. Bun is a white rabbit.') },
    { t: 'thing', look: 'window', x: 8, y: 1, walk: true, run: async () => say('', 'From up here you can see the whole square, and the Belfry, and the fountain cog hanging in the air.', 'From this angle, the cog lines up exactly with the dent in the bell.') },
    { t: 'thing', look: 'coat', x: 11, y: 2, run: async () => {
      if (hero.flags.photo_got) return say('', 'A long work coat on a hook. All its buttons are there now.');
      if (!has('button')) return say('', 'A long work coat on a hook, patched at the elbows. Oil on the cuffs.', 'One button is missing. Just one. The thread is still there, waiting.');
      hero.flags.photo_got = true; sfx('puzzle'); hero.items.splice(hero.items.indexOf('button'), 1); giveKey('photo');
      return say('', 'You hold the brass button up to the empty thread. It\'s a perfect match. Of course it is.', 'As it clicks into place, something slides out of the coat\'s pocket.', 'A photograph: a tortoise, a jester, and someone between them whose face has been rubbed away by a thumb. Many times.', '(You got the Worn Photograph.)'); } },
  ] };
ROOMS.closet = { name: 'Door 13', area: 'cogworks', theme: 'cog', track: 'silent', map: [
  '##########',
  '#TT....TT#',
  '#........#',
  '#........#',
  '#........#',
  '####..####',
  '####..####'],
  exits: [{ x: 4, y: 6, w: 2, h: 1, to: 'cogworks1', tx: 27, ty: 13 }],
  ents: [
    { t: 'trigger', x: 1, y: 3, w: 8, h: 2, flag: 'closet', run: async () => { hero.flags.closet = true; await say('GERALD', '...', 'This is my break room. Do you mind?'); } },
    { t: 'npc', kind: 'mini', look: 'tocklet', name: 'GERALD', x: 5, y: 2, voice: 900, run: async () => say('GERALD', pick(['The truth about midnight? Sign\'s right there. Read the sign.', 'Forty-year lunch break. Union rules. Grit never checked.', 'Ham and cheese. Same sandwich. It never runs out. I don\'t ask questions.'])) },
    { t: 'sign', x: 2, y: 3, text: ['THE TRUTH ABOUT MIDNIGHT:', 'it\'s when the sandwich place closes.', '(so it never closes. so it\'s fine. so DON\'T OPEN THIS DOOR.)'] },
    { t: 'thing', look: 'mop', x: 7, y: 3, run: async () => say('', 'A mop in a bucket. A tag tied to the handle:', '"SPARE · DO NOT USE · HIS."', hero.flags.mop_n_rustwood ? 'It\'s exactly the same mop as Mopsley\'s. Exactly. Down to the bent bristle.' : 'Whose?') },
  ] };

/* ---------------- art ---------------- */
function drawMopsley(x, y, t, mopping) {
  const b = Math.sin(t * 2) * 1, sw = mopping ? Math.sin(t * 3) * 6 : 0;
  ell(x, y + 1, 12, 4, 'rgba(0,0,0,.3)');
  line(x + 10 + sw * 0.3, y - 34, x + 16 + sw, y - 2, '#8a6a3a', 3); ell(x + 17 + sw, y - 1, 8, 3, '#d8d0b0');
  poly([x - 11, y - 2, x + 11, y - 2, x + 9, y - 30, x - 9, y - 30], '#6a4a2a'); ctx.fillStyle = '#4a3218'; ctx.fillRect(x - 1, y - 28, 2, 26);
  circ(x - 1, y - 20, 1.5, '#c8a050'); circ(x - 1, y - 13, 1.5, '#c8a050');
  circ(x, y - 36 + b, 8, '#c8b090'); ctx.fillStyle = '#3a3040'; ctx.fillRect(x - 10, y - 44 + b, 20, 4); ctx.fillRect(x - 7, y - 50 + b, 14, 7);
  line(x - 5, y - 36 + b, x - 1, y - 36 + b, '#222', 2); line(x + 2, y - 36 + b, x + 6, y - 36 + b, '#222', 2); line(x - 3, y - 31 + b, x + 3, y - 31 + b, '#7a5a4a', 1.5);
}
ART.mopsley = (x, y, t, s) => { ctx.save(); ctx.translate(x, y + 60); ctx.scale(3.2, 3.2); drawMopsley(0, 0, t, true); ctx.restore(); };
const THING = {
  none: () => {},
  door13: (x, y) => { ctx.fillStyle = '#3a342e'; ctx.fillRect(x - 12, y - 40, 24, 38); ctx.fillStyle = '#c8a050'; ctx.font = `bold 10px ${FONT}`; ctx.textAlign = 'center'; ctx.fillText('13', x, y - 28); circ(x + 7, y - 18, 2, '#c8a050'); },
  ledger: (x, y) => { ctx.fillStyle = '#5a3a1a'; ctx.fillRect(x - 12, y - 18, 24, 16); ctx.fillStyle = '#e8dcc0'; ctx.fillRect(x - 10, y - 22, 20, 6); },
  remnant_wicklow: (x, y, t) => { if (hero.flags.killed_wicklow) { ell(x, y - 4, 20, 7, '#d8cba8'); line(x - 4, y - 6, x + 6, y - 10, '#222', 2); }
    else { ctx.fillStyle = '#f4ecd8'; ctx.fillRect(x - 8, y - 14, 16, 12); circ(x, y - 2, 4, '#777'); } },
  remnant_grit: (x, y, t) => { if (hero.flags.killed_grit) { gear(x, y - 22, 18, 10, 0.3, '#5a5048', '#2a2420'); }
    else { gear(x, y - 22, 14, 8, t * 0.2, '#8a7a5a', '#3a342e'); ctx.fillStyle = '#ffcc33'; ctx.beginPath(); ctx.arc(x, y - 34, 9, Math.PI, 0); ctx.fill(); } },
  remnant_cuckoo: (x, y, t) => { if (hero.flags.killed_cuckoo) { ctx.save(); ctx.globalAlpha = 0.18 + Math.sin(t * 1.3) * 0.03; poly([x - 8, y - 200, x + 8, y - 200, x + 30, y, x - 30, y], '#fff8d8'); ctx.restore(); ell(x, y, 30, 8, 'rgba(255,248,216,.25)'); }
    else { line(x, y - 2, x, y - 10, '#5a8a3a', 2); circ(x, y - 12, 5, '#ff9ad8'); circ(x, y - 12, 2, '#ffd0ea'); } },
  portrait: (x, y) => { ctx.fillStyle = '#6a4a20'; ctx.fillRect(x - 22, y - 46, 44, 30); ctx.fillStyle = '#2a2030'; ctx.fillRect(x - 19, y - 43, 38, 24); for (let i = 0; i < 6; i++) circ(x - 15 + i * 6, y - 32, 2.2, '#c8b090'); for (let i = 0; i < 6; i++) circ(x - 15 + i * 6, y - 25, 2.2, '#c8b090'); },
  bench: (x, y) => { ctx.fillStyle = '#6a4a2a'; ctx.fillRect(x - 30, y - 22, 60, 8); ctx.fillRect(x - 28, y - 14, 4, 14); ctx.fillRect(x + 24, y - 14, 4, 14); circ(x - 12, y - 25, 3, '#ff9a3c'); line(x + 4, y - 24, x + 18, y - 24, '#aaa', 2); },
  blueprint: (x, y) => { ctx.fillStyle = '#2a4a7a'; ctx.fillRect(x - 16, y - 50, 32, 24); ctx.strokeStyle = '#9ad8ff'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y - 38, 7, 0, 6.283); ctx.stroke(); line(x, y - 45, x, y - 31, '#9ad8ff', 1); },
  chair: (x, y) => { ctx.fillStyle = '#5a3a1a'; ctx.fillRect(x - 9, y - 16, 18, 4); ctx.fillRect(x - 9, y - 34, 3, 32); ctx.fillRect(x + 6, y - 14, 3, 12); ctx.fillRect(x - 9, y - 14, 3, 12); },
  mirror: (x, y, t) => { ctx.fillStyle = '#6a4a20'; ctx.fillRect(x - 15, y - 62, 30, 58); ctx.fillStyle = '#1a2030'; ctx.fillRect(x - 12, y - 59, 24, 52);
    if (has('wickstub') || has('waxseal')) { ctx.save(); ctx.globalAlpha = 0.25 + Math.sin(t * 2.3) * 0.12; ctx.fillStyle = '#c8c0d8'; circ(x + 2, y - 40, 4, '#c8c0d8'); ctx.fillRect(x - 3, y - 36, 10, 14); ctx.restore(); }
    line(x - 8, y - 55, x - 2, y - 48, 'rgba(255,255,255,.2)', 2); },
  musicbox: (x, y, t) => { ctx.fillStyle = '#7a3a2a'; ctx.fillRect(x - 10, y - 14, 20, 12); ctx.fillStyle = '#c8a050'; ctx.fillRect(x - 10, y - 16, 20, 3); circ(x + 11, y - 8, 2, '#c8a050');
    if (Math.floor(t * 1.2) % 3 === 0) { ctx.font = `12px ${FONT}`; ctx.fillStyle = 'rgba(255,230,180,.6)'; ctx.textAlign = 'center'; ctx.fillText('♪', x + 4 + Math.sin(t) * 4, y - 22 - (t * 10) % 12); } },
  drawer: (x, y) => { ctx.fillStyle = '#5a3a1a'; ctx.fillRect(x - 12, y - 20, 24, 18); ctx.fillStyle = '#c8a050'; circ(x, y - 11, 4, '#c8a050'); circ(x, y - 11, 2.5, '#2a1a0a'); },
  bed: (x, y) => { ctx.fillStyle = '#5a3a1a'; ctx.fillRect(x - 26, y - 22, 52, 22); ctx.fillStyle = '#e8dcc0'; ctx.fillRect(x - 24, y - 26, 48, 12); ctx.fillStyle = '#fff'; ctx.fillRect(x - 22, y - 28, 14, 7); },
  window: (x, y) => { ctx.fillStyle = '#c8a050'; ctx.fillRect(x - 14, y - 48, 28, 26); ctx.fillStyle = '#1a2a4a'; ctx.fillRect(x - 12, y - 46, 24, 22); circ(x + 5, y - 40, 2, '#ffd36e'); line(x, y - 46, x, y - 24, '#c8a050', 2); },
  coat: (x, y) => { ctx.fillStyle = '#3a2a1a'; ctx.fillRect(x - 2, y - 50, 4, 6); poly([x - 10, y - 44, x + 10, y - 44, x + 12, y - 6, x - 12, y - 6], '#4a5a6a'); ctx.fillStyle = '#c8a050'; for (let i = 0; i < 3; i++) if (i !== 1 || hero.flags.photo_got) circ(x, y - 36 + i * 10, 1.8, '#c8a050'); },
  mop: (x, y) => { line(x - 6, y - 40, x, y - 10, '#8a6a3a', 3); ctx.fillStyle = '#7a7a8a'; ctx.fillRect(x - 9, y - 12, 18, 12); ell(x, y - 10, 7, 3, '#d8d0b0'); },
};

/* v1.3: one scripted (unmissable) monster fight on each main path; bands across the room's middle row and column */
for (const [room, foe, line] of [['rustwood', 'burrlock', 'Something spiky is rolling down the path toward you!'], ['cogworks1', 'spannerkin', 'A little wrench-creature hops off a conveyor and blocks the way!'], ['spire1', 'metronoma', 'Tick. Tock. Something on the stair is keeping time... at you.']]) {
  const R = ROOMS[room]; if (!R) continue; const H = R.map.length, Wd = R.map[0].length, flag = 'ambush_' + room;
  const run = async () => { hero.flags[flag] = true; await say('', line); RM.encEnemy = foe; encFX = 0.55; sfx('encounter'); resetTouch(); };
  R.ents.push({ t: 'trigger', x: Math.floor(Wd / 2), y: 1, w: 1, h: H - 2, flag, run }, { t: 'trigger', x: 1, y: Math.floor(H / 2), w: Wd - 2, h: 1, flag, run });
}
