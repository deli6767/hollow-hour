/* CHAPTER 1: Bellfall, Rustwood, Lantern Grove, Candle Gate */
Object.assign(ROOMS, {
  bellfall: { name: 'Bellfall Clearing', area: 'rustwood', theme: 'forest', track: 'rust', map: [
    '##############################',
    '#TTT....TT.........TT....TTTT#',
    '#TT.........o..........o...TT#',
    '#T....o...........T.........T#',
    '#...........,,,,.............#',
    '#....T.....,,,,,,.....o......#',
    '#...........,,,,.......T......',
    '#T............................',
    '#.............................',
    '#T............................',
    '#.....o.............T.........',
    '#..T........................T#',
    '#..........o.......o.........#',
    '#TT.....T..............o....T#',
    '#TTT........TTT..........TTTT#',
    '#TTTTTT...TTTTTTTT.....TTTTTT#',
    '##############################'],
    exits: [{ x: 29, y: 6, w: 1, h: 5, to: 'rustwood', tx: 1, ty: 8 }],
    ents: [
      { t: 'crater', x: 6, y: 8 },
      { t: 'save', x: 10, y: 11 },
      { t: 'npc', kind: 'tolly', name: 'TOLLY', x: 15, y: 8, voice: 220, run: async () => {
        if (!hero.flags.metTolly) { hero.flags.metTolly = true;
          await say('TOLLY', 'Oh! Oh my. You fell right out of the Bell of Hours, didn\'t you?', 'I heard it. A little "ding". First new sound in forty years.',
            'I\'m Tolly. I\'ve been walking to the bakery since 11:59. Almost there. Any decade now.',
            'Listen, little chime. Folk out here are stuck. Same minute, over and over. It makes them... prickly.',
            'If one jumps out at you, you can STRIKE them... or CHAT with them. You have to talk first. Even the big ones. Then calm them enough, or wear them down after you\'ve talked, and you can RELEASE them. Let them go home.',
            'And when things get dangerous, your spark curls up into its core. Dodge, dodge, dodge!',
            'That little bell on the post? Ring it. It keeps the moment safe. Very handy, being kept.',
            'The jester lives up in the Belfry, past town. If anyone can get midnight moving again... it might be a fresh chime like you.');
          giveItem('biscuit', true); return; }
        if (hero.kills > 0) return say('TOLLY', 'You\'ve got a cold look about you, little chime. Hm. Careful. Stopped clocks don\'t start again.');
        return say('TOLLY', pick(['East is Rustwood. Tall grass hides the stuck-in-time. Walk the paths if you want peace and quiet.', 'Still walking to the bakery. Don\'t wait up.', 'If you STRIKE, aim for the middle of the gauge. Not that I\'d know. I\'m very peaceful. Mostly.']));
      } },
      { t: 'sign', x: 24, y: 8, text: ['→ RUSTWOOD → GEARHOLM', '(someone carved underneath: "it\'s always 11:59. stop checking.")'] },
    ] },
  rustwood: { name: 'Rustwood Trail', area: 'rustwood', theme: 'forest', track: 'rust', enc: 'rustwood', map: [
    '########################################',
    '#TTTT,,,,....TTTT......,,,,,,,..TTTTTTT#',
    '#TT,,,,,,,.....TT....,,,,,,,,,,,...TTTT#',
    '#T,,,,,,,,,.........,,,,,,,,,,,,,....TT#',
    '#..,,,,,,,......T.....,,,,,,,,,,......T#',
    '#.........................,,,,.........#',
    '#....T........~~~~~~...................#',
    '.............~~~~~~~~~..................',
    '...........===========..................',
    '.............~~~~~~~~~..................',
    '#....T........~~~~~~.......,,,,,.......#',
    '#.............................,,,,,,..T#',
    '#T.....,,,,,,.........T.....,,,,,,,,..T#',
    '#TT...,,,,,,,,,.............,,,,,,...TT#',
    '#TTT..,,,,,,,,,....TTT..........T..TTTT#',
    '#TTTTT,,,,,TTTTTTTTTTTTTTT..TTTTTTTTTTT#',
    '########################################'],
    exits: [{ x: 0, y: 7, w: 1, h: 3, to: 'bellfall', tx: 28, ty: 8 }, { x: 39, y: 7, w: 1, h: 3, to: 'lanterns', tx: 1, ty: 8 }],
    ents: [
      { t: 'save', x: 24, y: 11 },
      { t: 'sign', x: 3, y: 6, text: ['RUSTWOOD. Tall grass hides the stuck-in-time.', 'Stick to the open ground if you\'d rather not be bothered.'] },
      { t: 'chest', x: 36, y: 4, item: 'ember', flag: 'c_rw1' },
      { t: 'chest', x: 8, y: 13, item: 'locket', flag: 'c_rw2' },
      { t: 'npc', kind: 'pip', name: 'PIP', x: 25, y: 8, voice: 760, run: async () => {
        if (hero.areaKills.rustwood >= 3) return say('PIP', '...you\'re the one making the woods quiet.', 'my cousin went to find a lamp and didn\'t come back.');
        if (!hero.flags.pip1) { hero.flags.pip1 = true; return say('PIP', 'whoa!! your head is ON FIRE!! that\'s so cool!!', 'i\'m Pip! i\'m gonna be a big scary Mothwick one day!', 'grown-up moths get SO weird around lights. if you flap your arms at them they think you\'re family. true fact.'); }
        return say('PIP', pick(['are you going to see the jester? tell him i said boo.', 'the lantern grove is east! the lanterns are SUPER old.', 'rustpups love pets. but they love pets AND fetch even more.']));
      } },
    ] },
  lanterns: { name: 'Lantern Grove', area: 'rustwood', theme: 'forest', track: 'rust', enc: 'rustwood', map: [
    '#############....#############',
    '#TTTTTTTTTTTT....TTTTTTTTTTTT#',
    '#TT........................TT#',
    '#T..........................T#',
    '#............................#',
    '#....T..................T....#',
    '#............................#',
    '.............................#',
    '.............................#',
    '.............................#',
    '#............................#',
    '#.....,,,,..........,,,,.....#',
    '#....,,,,,,........,,,,,,....#',
    '#T....,,,,..........,,,,....T#',
    '#TT........................TT#',
    '#TTTTTTTTTTTTTTTTTTTTTTTTTTTT#',
    '##############################'],
    exits: [{ x: 0, y: 7, w: 1, h: 3, to: 'rustwood', tx: 38, ty: 8 }, { x: 13, y: 0, w: 4, h: 1, to: 'wickgate', tx: 14, ty: 14 }],
    ents: [
      { t: 'gate', x: 13, y: 1, w: 4, h: 1, flag: 'lanterns', style: 'vines' },
      { t: 'lantern', x: 8, y: 5, n: 0 }, { t: 'lantern', x: 14, y: 4, n: 1 }, { t: 'lantern', x: 20, y: 5, n: 2 },
      { t: 'sign', x: 14, y: 9, text: ['"The moon crosses the sky from east to west.', 'Light the way as she walks, and the vines will bow."', '(east is the sunrise side. on this sign, that\'s the right.)'] },
      { t: 'sign', x: 4, y: 6, text: ['LANTERN GROVE. Please do not eat the lanterns.'] },
    ] },
  wickgate: { name: 'The Candle Gate', area: 'rustwood', theme: 'forest', track: 'rust', map: [
    '#############....#############',
    '#TTTTTTTTTTT......TTTTTTTTTTT#',
    '#TTTTTTTT............TTTTTTTT#',
    '#TTTT....................TTTT#',
    '#TT........................TT#',
    '#T..........................T#',
    '#............................#',
    '#............................#',
    '#............................#',
    '#............................#',
    '#..o......................o..#',
    '#............................#',
    '#............................#',
    '#T..........................T#',
    '#TT........................TT#',
    '#TTTTTTTTTTTTT....TTTTTTTTTTT#',
    '#############....#############'],
    exits: [{ x: 13, y: 16, w: 4, h: 1, to: 'lanterns', tx: 14, ty: 2 }, { x: 13, y: 0, w: 4, h: 1, to: 'gearholm', tx: 21, ty: 14 }],
    ents: [
      { t: 'save', x: 12, y: 12 },
      { t: 'candles', x: 11, y: 2 }, { t: 'candles', x: 18, y: 2 },
      { t: 'gate', x: 13, y: 1, w: 4, h: 1, flag: 'wicklow_done', style: 'wax' },
      { t: 'boss', enemy: 'wicklow', x: 14, y: 4, flag: 'wicklow_done' },
      { t: 'trigger', x: 1, y: 8, w: 28, h: 1, flag: 'wicklow_done', run: async () => {
        hero.dir = 0; shake(4, 0.3);
        await say('WICKLOW', 'HALT! Who approaches the Candle Gate?', 'A... flame? A tiny walking flame? With a SCARF?', 'No matter! I am WICKLOW, Knight of the Candle Gate, guardian since the glorious minute of 11:58!',
          'None shall pass into Gearholm! Not until... until...', '...I have forgotten the until. EN GARDE!');
        startBattle('wicklow', { boss: true });
      } },
    ] },
});
