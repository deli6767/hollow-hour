/* CHAPTER 2: Gearholm, the Cogworks, Foreman's Floor */
Object.assign(ROOMS, {
  gearholm: { name: 'Gearholm Square', area: 'town', theme: 'town', track: 'town', map: [
    '###################....#################',
    '#RRRRRRR...........=..=...........RRRRR#',
    '#BBBBBBB...........=..=...........BBBBB#',
    '#BBBdBBB.....o.....=..=.....o.....BdBBB#',
    '#...................==.................#',
    '#......................................#',
    '#.......RRRRR.................RRRRR....#',
    '#.......BBBBB......TTTT.......BBBBB....#',
    '#.......BBdBB.....T~~~~T......BBdBB....#',
    '#.................T~~~~T...............#',
    '#..o...............TTTT..........o.....#',
    '#......................................#',
    '#......................................#',
    '#......................................#',
    '#..T.....o.......=====......o......T...#',
    '#...............=.....=................#',
    '####################....################'],
    exits: [{ x: 19, y: 0, w: 4, h: 1, to: 'cogworks1', tx: 14, ty: 14 }, { x: 20, y: 16, w: 4, h: 1, to: 'wickgate', tx: 14, ty: 2 }],
    ents: [
      { t: 'save', x: 24, y: 12 },
      { t: 'npc', kind: 'tess', name: 'TESS', x: 35, y: 4, voice: 640, run: async () => {
        if (!hero.flags.tess1) { hero.flags.tess1 = true; await say('TESS', 'A customer! A real one! With a head made of FIRE!', 'Welcome to Tess\'s Tinkery. Everything\'s been on sale since 11:59.'); }
        openShop();
      } },
      { t: 'npc', kind: 'bun', name: 'BUN', x: 4, y: 4, voice: 420, run: async () => {
        const c = await ask('BUN', 'Welcome to the Snoozing Biscuit! A nap is 15 cogs. You look tired. Everyone looks tired. It\'s been one minute for forty years.', ['NAP (15c)', 'NO THANKS']);
        if (c !== 0) return say('BUN', 'Come back any time! Literally. It\'s always the same time.');
        if (hero.cogs < 15) return say('BUN', 'Ah... you\'re a little short. Next time, sweetie.');
        hero.cogs -= 15; await fadeNap(); hero.glow = maxGlow(hero); sfx('heal');
        return say('BUN', 'Good nap? You were out for one whole minute. Same minute, but still.');
      } },
      { t: 'npc', kind: 'lumen', name: 'LUMEN', x: 12, y: 11, voice: 520, run: async () => {
        if (!hero.flags.rose && !hero.flags.killed_cuckoo) { hero.flags.rose = true;
          await say('LUMEN', 'Oh, a little light! We lamps have to stick together.', 'Are you climbing the Hourspire? Up there, Madame Cuckoo sings to an empty gallery.', 'Take this. I folded it from an old timetable. Everyone should get flowers after a show.');
          giveItem('rose'); return; }
        if (route() === 'violent') return say('LUMEN', '...', 'The square is so quiet. I keep my light low now.');
        return say('LUMEN', pick(['I light this corner every evening. It\'s always evening.', 'A Paper Rose means "bravo" in lamp. Also in bird.']));
      } },
      { t: 'npc', kind: 'rivet', name: 'SGT. RIVET', x: 17, y: 3, voice: 300, run: async () => {
        if (hero.flags.killed_wicklow) return say('SGT. RIVET', 'Wicklow didn\'t come to drills today. Wicklow always comes to drills.', 'Move along, flame.');
        if (hero.flags.spared_wicklow) return say('SGT. RIVET', 'You got past Wicklow without a scratch on him? Ha! Most folk just wait for him to melt.', 'North is the Cogworks. Foreman Grit runs it. Runs it into the GROUND.');
        return say('SGT. RIVET', 'Halt! ...Actually, carry on. I\'ve been saying halt for forty years. My heart isn\'t in it.');
      } },
      { t: 'npc', kind: 'mini', look: 'wicklow', name: 'WICKLOW', x: 30, y: 12, voice: 260, show: () => hero.flags.spared_wicklow, run: async () => say('WICKLOW', 'Ah, little flame! I am now the Knight of the Bakery Bench. A noble post.', 'The bread is warm. My wax is not melting. I believe this is called "relaxing".') },
      { t: 'npc', kind: 'pip', name: 'PIP', x: 27, y: 4, voice: 760, show: () => hero.flags.pip1 && hero.areaKills.rustwood < 3, run: async () => say('PIP', 'i followed you to town!! don\'t tell my mom.', 'the jester\'s tower is SO tall. you can see the Belfry from the fountain.') },
      { t: 'door', x: 32, y: 8, text: ['THE CLOCKMAKER\'S. "Closed until midnight."', 'The sign is very dusty.'] },
      { t: 'door', x: 10, y: 8, text: ['A sleepy voice from inside: "Is it tomorrow yet?"', '"...no? Okay. Five more minutes. One more minute. This minute."'] },
      { t: 'door', x: 4, y: 3, text: ['THE SNOOZING BISCUIT · INN · ask Bun out front.'] },
      { t: 'door', x: 35, y: 3, text: ['TESS\'S TINKERY · gears, snacks, things that go "ping".'] },
      { t: 'sign', x: 21, y: 11, text: ['The fountain\'s water is frozen mid-splash. It has been for forty years.', 'Someone tossed a cog in for luck. It\'s still in the air.'] },
    ] },
  cogworks1: { name: 'The Cogworks', area: 'cogworks', theme: 'cog', track: 'cog', enc: 'cogworks', map: [
    '#############....#############',
    '#TTTTTTTTTTTT....TTTTTTTTTTTT#',
    '#T..........................T#',
    '#...p....................p...#',
    '#............................#',
    '#......,,,,..........,,,,....#',
    '#.....,,,,,,........,,,,,,...#',
    '#......,,,,..........,,,,....#',
    '#............................#',
    '#............................#',
    '#..T......................T..#',
    '#............................#',
    '#....,,,,,..........,,,,,....#',
    '#....,,,,,..........,,,,,....#',
    '#T..........................T#',
    '#TTTTTTTTTTTT....TTTTTTTTTTTT#',
    '#############....#############'],
    exits: [{ x: 13, y: 16, w: 4, h: 1, to: 'gearholm', tx: 21, ty: 1 }, { x: 13, y: 0, w: 4, h: 1, to: 'cogworks2', tx: 14, ty: 14 }],
    ents: [
      { t: 'gate', x: 13, y: 1, w: 4, h: 1, flag: 'plates', style: 'shutter' },
      { t: 'crate', x: 12, y: 9 }, { t: 'crate', x: 17, y: 9 },
      { t: 'lever', x: 2, y: 11, n: -1, reset: true },
      { t: 'npc', kind: 'sprocket', name: 'SPROCKET', x: 24, y: 11, voice: 880, run: async () => {
        if (hero.flags.plates) return say('SPROCKET', 'You did it! The shutter\'s open! Grit\'s office is right through there.', 'He\'s... a lot. Good luck.');
        return say('SPROCKET', 'BEEP. Hi! The shutter only opens when BOTH pressure plates are pressed.', 'Push the crates onto the plates! Walk into a crate to push it.', 'If you jam one into a corner, pull the RESET lever by the wall. I do that a lot. BEEP.');
      } },
      { t: 'sign', x: 8, y: 14, text: ['SAFETY FIRST! Days without an accident: 1', '(it has been the same day for forty years.)'] },
    ] },
  cogworks2: { name: 'Foreman\'s Floor', area: 'cogworks', theme: 'cog', track: 'cog', map: [
    '#############....#############',
    '#TTTTTTTTTTTT....TTTTTTTTTTTT#',
    '#TT........................TT#',
    '#T..........................T#',
    '#............................#',
    '#...T....................T...#',
    '#............................#',
    '#............................#',
    '#............................#',
    '#............................#',
    '#...T....................T...#',
    '#............................#',
    '#............................#',
    '#T..........................T#',
    '#TT........................TT#',
    '#TTTTTTTTTTTT....TTTTTTTTTTTT#',
    '#############....#############'],
    exits: [{ x: 13, y: 16, w: 4, h: 1, to: 'cogworks1', tx: 14, ty: 2 }, { x: 13, y: 0, w: 4, h: 1, to: 'spire1', tx: 14, ty: 14 }],
    ents: [
      { t: 'save', x: 12, y: 12 },
      { t: 'chest', x: 25, y: 12, item: 'tea', flag: 'c_cw1' },
      { t: 'gate', x: 13, y: 1, w: 4, h: 1, flag: 'grit_done', style: 'shutter' },
      { t: 'boss', enemy: 'grit', x: 14, y: 4, flag: 'grit_done' },
      { t: 'trigger', x: 1, y: 8, w: 28, h: 1, flag: 'grit_done', run: async () => {
        hero.dir = 0; shake(6, 0.4);
        await say('FOREMAN GRIT', 'WHO\'S THAT ON MY FLOOR?!', 'A new hire! FINALLY! Grab a wrench, kid. Shift started forty years ago.',
          'What do you mean you\'re "just passing through"? NOBODY passes through! We WORK through!', 'Fine! Let\'s see if you can handle a REAL day\'s work!');
        startBattle('grit', { boss: true });
      } },
    ] },
});
