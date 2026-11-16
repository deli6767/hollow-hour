/* ===================== v1.8-c2 (M3-D5) · secrets 2.0 =====================
   Mopsley turns up in the Tidelock (Turning Basin) and the Undercroft (The Stacks) between Grit and MERIDIAN.
   V.'s three new fragments (key items, kind 'gift'): recipe card (Weir Stairs), lullaby score (Lockkeeper's Tower,
   after the Lockkeeper is resolved), ticket stub with an older date (Reading Room). Ledger "No. 14" (Hall of Filed Clocks).
   Flags: mop_n_tide · mop_n_under · vfrag_recipe · vfrag_lullaby · vfrag_stub · ledger14 */
ITEMS.vrecipe = { name: 'Recipe Card', kind: 'gift', v: 0, price: 0, desc: 'TUESDAY BUNS (for T.). flour, honey, a pinch of patience. bake until the bell. "he\'ll say he isn\'t hungry. he is."' };
ITEMS.vlullaby = { name: 'Lullaby Score', kind: 'gift', v: 0, price: 0, desc: '"HUSH, LITTLE MINUTE." one page, hand-ruled. the last bar has no notes in it, only a rest, and a pencil heart.' };
ITEMS.vstub = { name: 'Old Ticket Stub', kind: 'gift', v: 0, price: 0, desc: 'ADMIT ONE · 12:01 · PLATFORM 13. torn in half and never punched. the date is forty years old.' };
const vFrags = () => ['vrecipe', 'vlullaby', 'vstub'].filter(k => has(k)).length;
{ const _ml = mopLoc; mopLoc = function () { const a = (ROOMS[hero.room] || {}).area || '', f = hero.flags;
    if (f.grit_done && !f.meridian_done) { if (a.startsWith('tide')) return 'tide'; if (a.startsWith('under')) return 'under'; } return _ml(); };
  const _mt = mopTalk; mopTalk = async function (loc) { if (loc !== 'tide' && loc !== 'under') return _mt(loc);
    const f = hero.flags, k = 'mop_n_' + loc; f[k] = (f[k] || 0) + 1; const n = f[k];
    const L = loc === 'tide' ? [
      ['Don\'t mind me. Mopping the canal.', '...Yes, the water. It gets wet. Somebody has to keep on top of it.'],
      [f.tide_turned ? 'You turned the tide. Now the mud\'s out. Do you know how long mud takes?' : 'Tide comes in at twelve. Goes out at twelve. I mop at twelve. Busy hour.'],
      has('vrecipe') ? ['Is that a Tuesday bun recipe? Give it a sniff.', '...Smells like her kitchen. I mean bread. Bread smells like bread.'] : ['Somebody used to come down here on Tuesdays. Fed the barges crumbs. Barges don\'t eat crumbs.', '...She knew that. She did it anyway.'],
    ] : [
      ['Quiet down here. Everything filed. Nobody to mop up after.', '...Lies. There\'s always somebody.'],
      ['They file a clock for every little thing. One drawer\'s just mine.', '...Don\'t open it. It\'s mostly receipts.'],
      has('vstub') && has('ticket') ? ['Two tickets now. Same train. Forty years apart.', 'She bought the first one. Didn\'t go. Said the tower needed her.', '...The second one\'s mine. I keep meaning to use it.'] : has('vstub') ? ['That stub. Where\'d you— never mind. Keep it dry.', '...She always bought the ticket. Always. She just never got on.'] : ['There\'s a reading room through there. Mind the lectern. It reads back.'],
    ];
    return say('MOPSLEY', ...L[Math.min(n - 1, L.length - 1)]); };
  ROOMS.basin.ents.push({ t: 'npc', kind: 'mopsley', name: 'MOPSLEY', x: 8, y: 3, voice: 190, show: () => mopLoc() === 'tide', run: () => mopTalk('tide') });
  ROOMS.under3.ents.push({ t: 'npc', kind: 'mopsley', name: 'MOPSLEY', x: 25, y: 8, voice: 190, show: () => mopLoc() === 'under', run: () => mopTalk('under') });
}
/* the fragments */
ROOMS.weir.ents.push({ t: 'thing', look: 'vrecipe', x: 24, y: 2, walk: true, show: () => !hero.flags.vfrag_recipe, run: async () => { hero.flags.vfrag_recipe = true; giveKey('vrecipe');
  return say('', 'Wedged under a step, dry somehow: a little card in neat, slanted handwriting.', '"TUESDAY BUNS (for T.)" Flour, honey, a pinch of patience. Bake until the bell.', 'At the bottom: "he\'ll say he isn\'t hungry. he is."', '(You got the Recipe Card.)'); } });
ROOMS.keepertower.ents.push({ t: 'thing', look: 'vlullaby', x: 6, y: 2, walk: true, show: () => !!hero.flags.lock_result && !hero.flags.vfrag_lullaby, run: async () => { hero.flags.vfrag_lullaby = true; giveKey('vlullaby');
  return say('', 'Pinned behind the tide chart, where the Lockkeeper couldn\'t see it: a sheet of music.', '"HUSH, LITTLE MINUTE." Under the notes, small words:', '"hush now, little minute / nobody\'s counting yet / the bell can wait till morning / and morning won\'t forget"', 'The last bar has no notes in it. Just a rest, and a pencil heart.', '(You got the Lullaby Score.)'); } });
ROOMS.under4.ents.push({ t: 'thing', look: 'vstub', x: 16, y: 3, walk: true, show: () => !hero.flags.vfrag_stub, run: async () => { hero.flags.vfrag_stub = true; giveKey('vstub');
  return say('', 'Pressed flat inside a book called TIMETABLES (REVISED): half a ticket.', '"ADMIT ONE · 12:01 · PLATFORM 13."', has('ticket') ? 'Same as the one in your pocket. Except this one was never punched. And the date is forty years old.' : 'It was never punched. The date on it is forty years old.', '(You got the Old Ticket Stub.)'); } });
ROOMS.under2.ents.push({ t: 'thing', look: 'ledger14', x: 26, y: 9, run: async () => { const f = hero.flags; f.ledger14 = true;
  if (!f.ledger) return say('', 'A thin ledger, filed under COGWORKS · ORDERS (CONT.).', 'It starts at No. 14. Whatever came before it is filed somewhere else.');
  return say('', 'COGWORKS · ORDERS (CONT.). The page after the Foreman\'s.', '"No. 14 · one (1) coat, extra large · one (1) cap · one (1) mop · for: whoever stays behind"', '"AUTHORIZED: V."', 'There\'s no SHIPPED stamp. Next to it, someone has written: "picked up in person."'); } });
/* art */
THING.vrecipe = (x, y) => { ctx.fillStyle = '#efe4c8'; ctx.fillRect(x - 9, y - 12, 18, 12); ctx.fillStyle = '#b06a4a'; for (let i = 0; i < 3; i++) ctx.fillRect(x - 6, y - 9 + i * 3, 12 - i * 3, 1); };
THING.vlullaby = (x, y) => { ctx.fillStyle = '#efe4c8'; ctx.fillRect(x - 10, y - 26, 20, 16); ctx.fillStyle = '#3a3040'; for (let i = 0; i < 4; i++) ctx.fillRect(x - 8, y - 23 + i * 3, 16, 1); ctx.fillRect(x - 4, y - 20, 2, 2); ctx.fillRect(x + 2, y - 17, 2, 2); ctx.fillStyle = '#c04a5a'; ctx.fillRect(x + 6, y - 14, 2, 2); };
THING.vstub = (x, y) => { ctx.fillStyle = '#5a4a3a'; ctx.fillRect(x - 10, y - 10, 20, 8); ctx.fillStyle = '#e8c870'; ctx.fillRect(x - 6, y - 14, 10, 5); };
THING.ledger14 = (x, y) => { ctx.fillStyle = '#3a2a1e'; ctx.fillRect(x - 12, y - 18, 24, 16); ctx.fillStyle = '#e8dcc0'; ctx.fillRect(x - 10, y - 22, 20, 6); ctx.fillStyle = '#8a5a2a'; ctx.font = `bold 7px ${FONT}`; ctx.textAlign = 'center'; ctx.fillText('14', x, y - 7); };
