/* ===================== CHAPTER 2 HUB (v1.4): shop tiers + Gearholm bulletin board ===================== */
ITEMS.gearcake = { name: 'Gear Cake', kind: 'heal', v: 60, price: 70, desc: 'layered like a clock. the middle layer is still ticking.' };
ITEMS.pendulum = { name: 'Pendulum', kind: 'weapon', v: 10, price: 150, desc: 'EDGE +10. swings back whether you want it to or not.' };
ITEMS.brassplate = { name: 'Brass Plate', kind: 'armor', v: 5, price: 120, desc: 'PLATING +5. polished so bright you can see yesterday in it.' };
// Tess restocks as the town wakes up: tier 1 always · tier 2 after Wicklow · tier 3 after Grit
function shopTier() { return hero.flags.grit_done ? 3 : hero.flags.wicklow_done ? 2 : 1; }
function shopStock() { const t = shopTier(), s = SHOP_STOCK.slice(); if (t >= 2) s.splice(3, 0, 'roottea', 'pie', 'gearcake'); if (t >= 3) s.push('pendulum', 'brassplate'); return s; }
// bulletin board: side-quest hints + town notices (no quest is started here; it just points)
ROOMS.gearholm.ents.push({ t: 'thing', look: 'board', x: 15, y: 4, walk: true, run: async () => { const f = hero.flags, notes = [];
  notes.push('TOWN MEETING AT MIDNIGHT. (Postponed.) (Again.)');
  if (!f.q_hour) notes.push('LOST: one (1) hour. If found please return to Tolly. He is on his way to the bakery.');
  else if (f.q_hour !== 3) notes.push('LOST: one (1) hour. (Tolly says it\'s "somewhere with rails".)');
  if (f.wicklow_done && f.q_candles !== 3) notes.push(f.killed_wicklow ? 'MISSING: five candles from the Candle Gate. No reward offered.' : 'MISSING: five candles. Reward: warmth. — W. (he wrote this one very large)');
  if (shopTier() === 2 && !f.board_tier2) { f.board_tier2 = true; notes.push('TESS\'S TINKERY: NEW STOCK! (it is old stock. but new.)'); }
  if (shopTier() === 3 && !f.board_tier3) { f.board_tier3 = true; notes.push('TESS\'S TINKERY: EVEN NEWER STOCK. the factory is quiet so we raided the stockroom.'); }
  if (f.ws_visited) notes.push('Pinned at the very bottom, almost hidden: "ROOM 3 · PAID IN FULL · until 12:01".');
  else if ((f.board_n = (f.board_n || 0) + 1) >= 3) notes.push('A pin with nothing on it. There\'s a little torn corner of paper still stuck under it.');
  return say('', 'The town bulletin board. Most notices are forty years old. A few are new.', ...notes.map(n => '· ' + n)); } });
THING.board = (x, y) => { ctx.fillStyle = '#5a3a1a'; ctx.fillRect(x - 3, y - 20, 6, 20); ctx.fillStyle = '#7a5a3a'; ctx.fillRect(x - 24, y - 56, 48, 36); ctx.fillStyle = '#c8a050'; ctx.fillRect(x - 24, y - 58, 48, 3);
  ctx.fillStyle = '#e8dcc0'; ctx.fillRect(x - 20, y - 52, 14, 12); ctx.fillRect(x - 3, y - 50, 16, 10); ctx.fillRect(x + 6, y - 36, 14, 12); ctx.fillStyle = '#f4f0e0'; ctx.fillRect(x - 18, y - 36, 18, 12); circ(x - 13, y - 51, 1.5, '#c03030'); circ(x + 5, y - 49, 1.5, '#c03030'); };
// ---- Inn upgrade (Snoozing Biscuit) + NPC "schedules": every nap flips Gearholm between "day" and "night".
// Both are the same minute; only the townsfolk act differently. Flag: hero.flags.town_night.
function innTier() { return hero.flags.grit_done ? 3 : hero.flags.wicklow_done ? 2 : 1; }
{ const E = n => ROOMS.gearholm.ents.find(e => e.kind === n);
  const bun = E('bun'), bunSecret = bun.run; // 47_secrets wraps Bun for the Room 3 secret (after the workshop); keep it intact
  bun.run = async () => { const f = hero.flags, t = innTier(); if (f.ws_visited) return bunSecret();
    const opts = ['NAP (15c)'], acts = ['nap'];
    if (t >= 2) { opts.push('BREAKFAST (25c)'); acts.push('bfast'); }
    if (t >= 3) { opts.push('ROOM 3?'); acts.push('room3'); }
    opts.push('NO THANKS'); acts.push('no');
    const greet = t === 1 ? 'Welcome to the Snoozing Biscuit! A nap is 15 cogs. You look tired. Everyone looks tired. It\'s been one minute for forty years.'
      : t === 2 ? 'The Snoozing Biscuit, now serving BREAKFAST! A nap plus a biscuit for the road. Breakfast is whenever. It\'s always whenever.'
      : 'The factory\'s quiet, so I finally fixed the beds. Best naps in Gearholm! The ONLY naps in Gearholm.';
    const a = acts[await ask('BUN', greet, opts)];
    if (a === 'no') return say('BUN', f.town_night ? 'Shh. Guests are sleeping. ...Nobody\'s sleeping. But shh.' : 'Come back any time! Literally. It\'s always the same time.');
    if (a === 'room3') return say('BUN', 'Room 3? Oh, that one\'s taken, sweetie.', 'Paid in full. Has been for... ages. I dust it every day.', 'Funny. You\'re the second person this minute to ask.');
    const cost = a === 'bfast' ? 25 : 15;
    if (hero.cogs < cost) return say('BUN', 'Ah... you\'re a little short. Next time, sweetie.');
    hero.cogs -= cost; await fadeNap(); hero.glow = maxGlow(hero); sfx('heal');
    f.town_night = !f.town_night; f.naps = (f.naps || 0) + 1;
    const gotB = a === 'bfast' && giveItem('biscuit', true);
    const wake = f.town_night ? 'Good nap? It\'s "night" now. Same minute, but we all agreed to be quieter about it.' : 'Morning! Same minute as last night. Lovely, isn\'t it?';
    return say('BUN', wake, ...(a === 'bfast' ? [gotB ? 'Here, an Oil Biscuit for the road. Fresh from forty years ago.' : 'Your pockets are full! I\'ll... eat your biscuit for you. Hospitality.'] : []), ...(f.naps === 7 ? ['...You talk in your sleep, did you know? You kept saying "one more".'] : []));
  };
  const night = (n, lines, ok) => { const e = E(n), base = e.run; e.run = async () => hero.flags.town_night && (!ok || ok()) ? lines() : base(); };
  night('rivet', () => say('SGT. RIVET', hero.flags.killed_wicklow ? '...Night watch. I keep a spot open in the line. For Wicklow.' : 'Night watch! Same post, same minute, but now I\'m whispering "halt".', 'halt.'));
  night('lumen', () => say('LUMEN', route() === 'violent' ? '...' : 'Night shift! I turn myself up a little. Not too much. The moths get ideas.'), () => hero.flags.rose || hero.flags.killed_cuckoo); // never skip the Paper Rose gift
  night('tess', async () => { await say('TESS', 'We\'re technically closed. It\'s night. ...It\'s the same minute. Fine, come in.'); openShop(); });
}
