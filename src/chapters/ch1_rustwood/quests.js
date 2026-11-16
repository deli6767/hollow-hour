/* ===================== CHAPTER 1 SIDE QUESTS (v1.4) ===================== */
ITEMS.losthour = { name: 'A Lost Hour', kind: 'gift', v: 0, price: 0, desc: 'a pocket watch with no hands. engraved on the back: T. (or V.?)' };
ITEMS.wickcharm = { name: 'Candle Charm', kind: 'armor', v: 3, price: 0, desc: 'PLATING +3. five wax drips on a string. warm in the dark.' };
ITEMS.qcandle = { name: 'Stray Candle', kind: 'gift', v: 0, price: 0, desc: '' };

/* ---- Quest 1: Tolly's Lost Hour (start: talk to Tolly again after meeting him; the watch is under the handcar seat in the Old Rail Cut) ---- */
QUESTS.push({ id: 'hour', name: "Tolly's Lost Hour", chapter: 1,
  stage: () => { const f = hero.flags; if (!f.q_hour) return null; if (f.q_hour === 3) return 'Tolly kept the watch. Probably.'; return has('losthour') ? 'Bring the watch back to Tolly in Bellfall.' : 'Tolly lost an hour somewhere in the Rustwood. Somewhere with rails?'; },
  done: () => hero.flags.q_hour === 3 });
{ const tolly = ROOMS.bellfall.ents.find(e => e.kind === 'tolly'), orig = tolly.run;
  tolly.run = async () => { const f = hero.flags;
    if (f.metTolly && !f.q_hour && f.talkedTolly2) { f.q_hour = 1;
      return say('TOLLY', 'Oh, you\'re back. Little chime, could I trouble you?', 'I seem to have lost an hour. I had it right here, in my waistcoat. Then I didn\'t.', 'I went for a walk along the old rails, once. Before the rails stopped. Maybe I put it down there.'); }
    if (f.q_hour === 1 && has('losthour')) { f.q_hour = 3; hero.items.splice(hero.items.indexOf('losthour'), 1); hero.cogs += 25; giveItem('pie', true);
      return say('TOLLY', 'My hour! You found it!', '...', 'It has no hands. Did it always have no hands?', 'And the initial on the back. T. That\'s me. Tolly.', '...it\'s a T. Isn\'t it? The light is bad here.', 'Well. Thank you. Have a pie. And some cogs. I won\'t need them, I\'m nearly at the bakery.'); }
    if (f.metTolly && !f.talkedTolly2) f.talkedTolly2 = true;
    return orig(); };
}
{ const hc = ROOMS.railcut.ents.find(e => e.look === 'handcar'), orig = hc.run;
  hc.run = async () => { const f = hero.flags;
    if (f.handcar && f.q_hour === 1 && !has('losthour') && !f.hour_found) { f.hour_found = true; giveKey('losthour'); sfx('item');
      return say('', 'You check under the handcar\'s seat. Wedged in the chalk dust: a pocket watch.', 'It has no hands. It\'s ticking anyway.', '(You got A Lost Hour.)'); }
    return orig(); };
}

/* ---- Quest 2: Wicklow's Candles (start: the empty candle stand at the Candle Gate after Wicklow; 5 candles hidden in Ch.1 rooms) ---- */
const QCANDLES = [['lanterns', 3, 12], ['rustwood', 3, 14], ['hollowoak', 27, 10], ['bellroot', 3, 4], ['railcut', 27, 8]];
const candlesFound = () => QCANDLES.filter((_, i) => hero.flags['qc' + i]).length;
QUESTS.push({ id: 'candles', name: "Wicklow's Candles", chapter: 1,
  stage: () => { const f = hero.flags; if (!f.q_candles) return null; if (f.q_candles === 3) return f.killed_wicklow ? 'The stand is full. Nothing is lit.' : 'All five burn at the Candle Gate.';
    const n = candlesFound(); return n >= 5 ? 'Return to the candle stand at the Candle Gate.' : `${n}/5 stray candles found in the Rustwood.`; },
  done: () => hero.flags.q_candles === 3 });
ROOMS.wickgate.ents.push({ t: 'thing', look: 'qstand', x: 9, y: 12, show: () => hero.flags.wicklow_done, run: async () => { const f = hero.flags, k = f.killed_wicklow;
  if (!f.q_candles) { f.q_candles = 1;
    return k ? say('', 'A candle stand with five empty holders. The wax in them is cold.', 'Five candles are missing. Nobody asked you to find them.') :
      say('', 'A candle stand with five empty holders. A note is pinned to it, in big careful letters:', '"Little flame. Five of my candles wandered off into the wood when the dark came. Light them for me? I would, but I am sitting down. — W."'); }
  if (f.q_candles === 1 && candlesFound() >= 5) { f.q_candles = 3; sfx('puzzle');
    if (k) return say('', 'You set the five candles in their holders. They stand there, unlit, in a neat row.', 'Somehow that feels right. And also not.');
    giveItem('wickcharm', true); shake(4, 0.4); burst(9 * TILE + 16 - cam.x, 12 * TILE - cam.y, 30, '#ffd36e', 120, 0.8, 3);
    return say('', 'You set the five candles in their holders. One by one they catch, from nothing, from each other.', 'Under the last one, a string of wax drips, like a charm. It\'s still warm.', '(You got the Candle Charm.)'); }
  if (f.q_candles === 3) return say('', k ? 'Five cold candles in a row.' : 'Five candles, burning. The gate is warm.');
  return say('', `${candlesFound()} of 5 holders filled.`); } });
QCANDLES.forEach(([room, x, y], i) => ROOMS[room].ents.push({ t: 'thing', look: 'qcandle', x, y, show: () => hero.flags.q_candles === 1 && !hero.flags['qc' + i], run: async () => {
  hero.flags['qc' + i] = true; sfx('item'); const n = candlesFound();
  if (hero.flags.killed_wicklow) return say('', 'A stray candle, fallen in the grass. You pick it up. The wick is cold and won\'t take a flame.', has('waxseal') ? 'The wax seal in your pocket is colder.' : '', `(${n}/5)`);
  return say('', 'A stray candle, fallen in the grass. When you pick it up, the wick sputters awake, as if it recognised you.', `(${n}/5)`); } }));
Object.assign(THING, {
  qstand: (x, y, t) => { ctx.fillStyle = '#6a4a20'; ctx.fillRect(x - 24, y - 18, 48, 6); ctx.fillRect(x - 2, y - 12, 4, 12);
    const lit = hero.flags.q_candles === 3 && !hero.flags.killed_wicklow, n = hero.flags.q_candles === 3 ? 5 : 0;
    for (let i = 0; i < 5; i++) { const cx = x - 20 + i * 10; if (i < n) { ctx.fillStyle = '#f4ecd8'; ctx.fillRect(cx - 2, y - 30, 4, 12); if (lit) circ(cx, y - 33 + Math.sin(t * 6 + i) * 0.8, 2.5, '#ffd36e'); } else circ(cx, y - 19, 2, '#3a2a10'); } },
  qcandle: (x, y, t) => { ctx.fillStyle = '#f4ecd8'; ctx.save(); ctx.translate(x, y - 4); ctx.rotate(1.2); ctx.fillRect(-2, -10, 4, 12); ctx.restore(); circ(x + 4, y - 10, 2 + Math.sin(t * 4) * 0.6, 'rgba(255,211,110,.5)'); },
});
