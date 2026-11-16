/* CHAPTER 4: Hourspire Stair, Cuckoo Gallery */
Object.assign(ROOMS, {
  spire1: { name: 'Hourspire Stair', area: 'spire', theme: 'spire', track: 'tower', enc: 'spire', map: [
    '#############....#############',
    '#TTTTTTTTTTTT....TTTTTTTTTTTT#',
    '#T..........................T#',
    '#............................#',
    '#..____________________..._..#',
    '#..____________________......#',
    '#..T....................T....#',
    '#............................#',
    '#.,,,,,,.............,,,,,,..#',
    '#.,,,,,,,...........,,,,,,,..#',
    '#.,,,,,,.............,,,,,,..#',
    '#............................#',
    '#..T....................T....#',
    '#............................#',
    '#T..........................T#',
    '#TTTTTTTTTTTT....TTTTTTTTTTTT#',
    '#############....#############'],
    exits: [{ x: 13, y: 16, w: 4, h: 1, to: 'cogworks2', tx: 14, ty: 2 }, { x: 13, y: 0, w: 4, h: 1, to: 'gallery', tx: 14, ty: 14 }],
    ents: [
      { t: 'gate', x: 13, y: 1, w: 4, h: 1, flag: 'levers', style: 'bars' },
      { t: 'lever', x: 9, y: 3, n: 0 }, { t: 'lever', x: 14, y: 3, n: 1 }, { t: 'lever', x: 19, y: 3, n: 2 },
      { t: 'sign', x: 23, y: 7, text: ['"UP · DOWN · UP — as the pendulum swings.', 'Mind the gears. Some levers are attached to their neighbours."'] },
      { t: 'chest', x: 27, y: 4, item: 'hourhand', flag: 'c_sp1' },
      { t: 'npc', kind: 'hush', name: 'HUSH', x: 5, y: 13, voice: 980, run: async () => {
        if (route() === 'violent') return say('HUSH', '...', '(Hush is hiding behind its own sleeve.)');
        if (!hero.flags.hush1) { hero.flags.hush1 = true; return say('HUSH', 'shhh. the choir is resting.', 'we sang the 11:59 hymn so many times we forgot the 12:00 one.', 'if you get the gate open, the gallery is up there. Madame sings the loudest. she misses applause the most.'); }
        return say('HUSH', pick(['the left lever is stubborn. it drags the middle one with it.', 'gloomgongs just want to be rung. imagine never being rung.', 'stringlings dance because the strings pull. dance WITH them first.']));
      } },
    ] },
  gallery: { name: 'Cuckoo Gallery', area: 'spire', theme: 'spire', track: 'tower', map: [
    '#############....#############',
    '#TTTTTTTTTTTT....TTTTTTTTTTTT#',
    '#T..........................T#',
    '#..........................._#',
    '#..______________________....#',
    '#..______________________....#',
    '#..T....T....T....T....T.....#',
    '#............................#',
    '#............................#',
    '#..o_o_o_o_o_o__o_o_o_o_o_o..#',
    '#............................#',
    '#..o_o_o_o_o_o__o_o_o_o_o_o..#',
    '#............................#',
    '#T..........................T#',
    '#TT........................TT#',
    '#TTTTTTTTTTTT....TTTTTTTTTTTT#',
    '#############....#############'],
    exits: [{ x: 13, y: 16, w: 4, h: 1, to: 'spire1', tx: 14, ty: 2 }, { x: 13, y: 0, w: 4, h: 1, to: 'belfry', tx: 14, ty: 14 }],
    ents: [
      { t: 'save', x: 12, y: 12 },
      { t: 'chest', x: 3, y: 3, item: 'bellcharm', flag: 'c_ga1' },
      { t: 'gate', x: 13, y: 1, w: 4, h: 1, flag: 'cuckoo_done', style: 'bars' },
      { t: 'boss', enemy: 'cuckoo', x: 14, y: 4, flag: 'cuckoo_done' },
      { t: 'trigger', x: 1, y: 7, w: 28, h: 1, flag: 'cuckoo_done', run: async () => {
        hero.dir = 0; sfx('bell');
        await say('MADAME CUCKOO', 'CUCKOO! CUCKOO! It is 11:59, darlings!', '...Darlings? Is someone actually THERE?', 'An audience! A REAL audience! After forty years of empty seats!', 'Sit! SIT! You\'re going to get the FULL performance!');
        startBattle('cuckoo', { boss: true });
      } },
    ] },
});
