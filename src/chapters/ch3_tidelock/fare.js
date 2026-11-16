/* ===================== CHAPTER 3 SIDE QUEST: Ferry's Fare (v1.7, chunk M) =====================
   Start: talk to Ferry (Low Steps) after you've met him twice. He won't take cogs; the fare is "something from before".
   Find: the Mooring Tag, caught on the last step of the Weir Stairs (27,9; only shows once the quest is started).
   Turn in: give it to Ferry -> he rows one lap the OTHER way (short cutscene), gives the Lap Knot (armor, PLATING +5).
   Lap-count secret (weir.js) keeps working: quest lines only take priority on a start/turn-in talk, the secret just waits one talk. */
ITEMS.mooringtag = { name: 'Mooring Tag', kind: 'gift', v: 0, price: 0, desc: 'brass. BOAT No. 1. RETURN TO: (the rest is rubbed smooth by a thumb.)' };
ITEMS.lapknot = { name: 'Lap Knot', kind: 'armor', v: 5, price: 0, desc: 'PLATING +5. a rope knot tied the other way round. it holds anyway.' };
QUESTS.push({ id: 'fare', name: "Ferry's Fare", chapter: 3,
  stage: () => { const f = hero.flags; if (!f.q_fare) return null;
    if (f.q_fare >= 3) return f.fare_owed ? 'Ferry is holding something for you. (Make room in your pockets.)' : 'Paid. He rowed the other way, once.';
    return has('mooringtag') ? 'Give Ferry the Mooring Tag at the Low Steps.' : 'Ferry won\'t take cogs. The fare is something from before. Things that float in wash down the Weir Stairs.'; },
  done: () => hero.flags.q_fare >= 3 });
let FARE_T0 = -1; // reverse-lap cutscene start (performance seconds); THING.ferry offsets while running
async function fareLap() { FARE_T0 = performance.now() / 1000; sfx('puzzle'); await sleep(2600); FARE_T0 = -1; }
function fareReward() { const f = hero.flags; if (giveItem('lapknot', true)) { f.fare_owed = false; return true; } f.fare_owed = true; return false; }
{ const _ft = ferryTalk; ferryTalk = async function () { const f = hero.flags; VOICES.FERRY = 340;
  if (f.q_fare === 1 && has('mooringtag')) { f.q_fare = 3; hero.items.splice(hero.items.indexOf('mooringtag'), 1);
    await say('FERRY', 'What\'s that you\'ve got.', '...', 'BOAT No. 1. Huh. That\'s this boat. There\'s only one boat. Still, nice of them to number it.', 'RETURN TO... rubbed off. Somebody held onto this a long time. Somebody\'s thumb.', 'That\'s the fare, all right. I didn\'t know until you held it out. Hop in.');
    await fareLap();
    await say('', 'Ferry leans on the oars the wrong way. The boat turns, slow and surprised, and goes round the basin backwards.', 'Just once. The water doesn\'t mind. The lamp in the keeper\'s window doesn\'t blink.');
    const got = fareReward();
    return say('FERRY', 'Other way round. Felt like rowing uphill. Felt like... remembering a street.', 'Here. Keep this knot. I tied it backwards, same as the lap. It\'ll hold.', got ? '(You got the Lap Knot.)' : '(Your pockets are full. Ferry says he\'ll hold onto it.)'); }
  if (f.q_fare >= 3 && f.fare_owed) { if (fareReward()) return say('FERRY', 'Room in your pockets now? Here. The knot.', '(You got the Lap Knot.)'); return say('FERRY', 'Still full up, are you. I\'ll keep it. I\'m not going anywhere. Well. Around.'); }
  if (!f.q_fare && (f.ferry_n || 0) >= 2) { f.q_fare = 1;
    return say('FERRY', 'You keep reaching for a cog. Put it away. I can\'t take cogs.', 'Fare\'s gone up. Not in price. In... age. It has to be something from before.', 'Things that float in wash down the Weir Stairs. Mostly they stop at the last step. Most things stop at the last step.'); }
  if (f.q_fare === 1 && !(f.ferry_counted && !f.ferry_told) && !(f.ferry_told && !f.ferry_after) && (f.fare_nag = (f.fare_nag || 0) + 1) % 2) return say('FERRY', 'No cogs. Something from before. The Weir Stairs, the last step.');
  if (f.q_fare >= 3 && !f.fare_after && !(f.ferry_counted && !f.ferry_told) && !(f.ferry_told && !f.ferry_after)) { f.fare_after = true; return say('FERRY', 'Back to the usual direction. It\'s easier. That\'s the trouble with it.'); }
  return _ft.apply(this, arguments); }; }
ROOMS.weir.ents.push({ t: 'thing', look: 'mooringtag', x: 27, y: 9, walk: true, show: () => hero.flags.q_fare === 1 && !hero.flags.fare_found,
  run: async () => { hero.flags.fare_found = true; giveKey('mooringtag'); sfx('item');
    return say('', 'Caught on the last step, where the water stops: a brass tag on a scrap of rope.', 'BOAT No. 1. RETURN TO: and then nothing. Worn smooth.', '(You got the Mooring Tag.)'); } });
{ const _lw = lapWatch; lapWatch = async function () { const f = hero.flags;
  if (f.q_fare >= 3 && f.ferry_counted && !f.fare_seen) { f.fare_seen = true; return say('', 'The little boat keeps going around.', 'Somewhere in the count, you\'re sure, there\'s one lap that went the other way. The tally doesn\'t have a mark for it.'); }
  return _lw.apply(this, arguments); }; }
{ const _fd = THING.ferry; THING.ferry = (x, y, t) => { if (FARE_T0 >= 0) { const p = Math.min(1, performance.now() / 1000 - FARE_T0 > 0 ? (performance.now() / 1000 - FARE_T0) / 2.4 : 0), a = -p * Math.PI * 2;
      x += Math.sin(a) * 34; y += (1 - Math.cos(a)) * -14; } return _fd(x, y, t); }; }
Object.assign(THING, {
  mooringtag: (x, y, t) => { const b = Math.sin(t * 2.2) * 1.5; ell(x, y - 2, 12, 3, 'rgba(154,216,255,.3)'); line(x - 14, y - 6 + b, x - 3, y - 12 + b, '#8a6a3a', 3); ctx.fillStyle = '#c8a050'; ctx.fillRect(x - 4, y - 20 + b, 16, 11); ctx.fillStyle = '#8a6a30'; ctx.fillRect(x - 1, y - 16 + b, 10, 2); circ(x - 1, y - 18 + b, 1.6, '#5a4020');
    if (Math.sin(t * 3) > 0.6) circ(x + 10, y - 20 + b, 2.2, '#fff4c0'); },
});
