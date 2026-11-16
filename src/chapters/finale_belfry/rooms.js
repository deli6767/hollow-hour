/* FINALE: The Belfry */
Object.assign(ROOMS, {
  belfry: { name: 'The Belfry', area: 'belfry', theme: 'belfry', track: 'belfry', map: [
    '##############################',
    '#TTTTTTTTTTTTTTTTTTTTTTTTTTTT#',
    '#TT........................TT#',
    '#T..........................T#',
    '#............................#',
    '#............................#',
    '#............................#',
    '#............................#',
    '#............................#',
    '#............................#',
    '#............................#',
    '#............................#',
    '#............................#',
    '#T..........................T#',
    '#TT........................TT#',
    '#TTTTTTTTTTTT....TTTTTTTTTTTT#',
    '#############....#############'],
    exits: [{ x: 13, y: 16, w: 4, h: 1, to: 'gallery', tx: 14, ty: 2 }],
    ents: [
      { t: 'save', x: 12, y: 12 },
      { t: 'bigbell', x: 14, y: 2 },
      { t: 'boss', enemy: 'meridian', x: 14, y: 5, flag: 'meridian_done' },
      { t: 'trigger', x: 1, y: 9, w: 28, h: 1, flag: 'meridian_met', run: async () => { await meridianIntro(); } },
    ] },
});
