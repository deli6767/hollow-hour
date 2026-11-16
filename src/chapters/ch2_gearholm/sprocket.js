/* ===================== CHAPTER 2 SIDE QUEST: Sprocket's Unauthorized Project, part 1 of 4 (v1.4) ===================== */
// Start: talk to Sprocket (Cogworks) after the shutter plates are solved. Gather 3 parts:
//   Mainspring: Belt Hall, C pocket (ride C up) · Whistle: ask DOT in Lost Property · Clapper: Boiler Gallery floor.
// Turn in at the tarp in Sprocket's Nook → it ticks once and asks for "a reason". The arc continues in later chapters (q_spr = 2).
ITEMS.sp_spring = { name: 'Mainspring', kind: 'gift', v: 0, price: 0, desc: 'tightly wound. it wants to let go, but politely.' };
ITEMS.sp_whistle = { name: 'Brass Whistle', kind: 'gift', v: 0, price: 0, desc: 'lost property tag: "found at 11:59. owner: departed."' };
ITEMS.sp_clapper = { name: 'Bell Clapper', kind: 'gift', v: 0, price: 0, desc: 'from a bell much larger than you. maybe the one you fell out of.' };
ITEMS.sp_iou = { name: "Sprocket's IOU", kind: 'gift', v: 0, price: 0, desc: '"I.O.U. ONE (1) RIDE. NOT AUTHORIZED (YET)." signed with a little gear.' };
const SP_PARTS = ['sp_spring', 'sp_whistle', 'sp_clapper'];
const spHave = () => SP_PARTS.filter(k => has(k) || hero.flags['spg_' + k]).length;
QUESTS.push({ id: 'sprocket', name: "Sprocket's Unauthorized Project", chapter: 2,
  stage: () => { const f = hero.flags; if (!f.q_spr) return null;
    if (f.q_spr >= 2) return 'It ticked once, then asked for "a reason." Sprocket is thinking about it. (part 1 of 4)';
    const n = spHave(); return n >= 3 ? "Bring the three parts to the tarp in Sprocket's Nook." : `${n}/3 parts (a spring, a whistle, a clapper). Somewhere below the Cogworks.`; },
  done: () => hero.flags.q_spr >= 2 });
{ const sp = ROOMS.cogworks1.ents.find(e => e.kind === 'sprocket'), orig = sp.run;
  sp.run = async () => { const f = hero.flags;
    if (f.plates && !f.q_spr) { f.q_spr = 1;
      return say('SPROCKET', 'BEEP. Hey. You\'re good at puzzles. Can you keep a secret?', 'I\'m building something. Downstairs. It\'s NOT AUTHORIZED.', '...by me. I haven\'t decided if I\'m allowed yet.',
        'It needs three parts: a mainspring, a whistle, and a bell clapper. I dropped them all. Separately. On purpose? No.', 'Bring them to my Nook! Past the boilers, up the belts. Go up the side, come down the side, go up the middle. BEEP.'); }
    if (f.q_spr === 1) return say('SPROCKET', spHave() >= 3 ? 'You got them ALL? Put them under the tarp! I can\'t watch. I\'ll watch.' : `${spHave()} of 3! The belts are the worst part. I built the belts. Sorry.`);
    if (f.q_spr >= 2) return say('SPROCKET', f.killed_grit ? 'Nobody\'s telling me what I\'m allowed to do anymore. That\'s worse, somehow.' : 'It asked me for a reason. I don\'t HAVE a reason. I just wanted it to go.',
      'I\'ll think of one. Things can wait for a reason. Everything here is good at waiting. BEEP.');
    return orig(); };
}
ROOMS.belthall.ents.push({ t: 'thing', look: 'sp_part', x: 17, y: 1, part: 'sp_spring', show: () => hero.flags.q_spr === 1 && !hero.flags.spg_sp_spring,
  run: async () => { hero.flags.spg_sp_spring = true; giveKey('sp_spring'); sfx('item'); return say('', 'Wedged under the C belt\'s top roller: a fat coil of spring steel. It hums.', `(You got the Mainspring. ${spHave()}/3)`); } });
ROOMS.boilergal.ents.push({ t: 'thing', look: 'sp_part', x: 5, y: 10, part: 'sp_clapper', show: () => hero.flags.q_spr === 1 && !hero.flags.spg_sp_clapper,
  run: async () => { hero.flags.spg_sp_clapper = true; giveKey('sp_clapper'); sfx('item'); return say('', 'A bell clapper the size of your head, rolled up against the wall. It\'s cold. It has a dent where it hit something, over and over.', `(You got the Bell Clapper. ${spHave()}/3)`); } });
{ const dot = ROOMS.lostfound.ents.find(e => e.look === 'punchclock'), orig = dot.run;
  dot.run = async () => { const f = hero.flags;
    if (f.q_spr === 1 && !f.spg_sp_whistle) { VOICES.DOT = 560; f.spg_sp_whistle = true; giveKey('sp_whistle'); sfx('item');
      return say('DOT', 'Ka-CHUNK. A whistle? We have one whistle. Owner: departed.', 'Departed on what, the form doesn\'t say. Sign here. ...You already signed. Fine.', `(You got the Brass Whistle. ${spHave()}/3)`); }
    return orig(); };
}
{ const tarp = ROOMS.nook.ents.find(e => e.look === 'tarp'), orig = tarp.run;
  tarp.run = async () => { const f = hero.flags;
    if (f.q_spr === 1 && SP_PARTS.every(has)) { for (const k of SP_PARTS) hero.items.splice(hero.items.indexOf(k), 1); f.q_spr = 2; hero.cogs += 30; giveKey('sp_iou'); sfx('puzzle'); shake(5, 0.6);
      return say('', 'You slide the spring, the whistle and the clapper under the tarp. Something inside takes them.', 'TICK.', '...', 'Just the one.', 'A paper strip feeds out from under the tarp. Typed on it: "PURPOSE OF JOURNEY?"',
        'Under the tarp the ticking waits, the way someone waits when they\'ve asked you a question.', 'Taped to the strip, in crayon: an IOU and 30 cogs. (You got Sprocket\'s IOU.)'); }
    if (f.q_spr >= 2) return say('', 'Under the tarp, the thing is holding its breath. The paper strip still asks: "PURPOSE OF JOURNEY?"', has('ticket') ? 'Your ticket feels warmer when you stand here.' : '');
    return orig(); };
}
THING.sp_part = (x, y, t, e) => { const c = { sp_spring: '#c8c8d0', sp_whistle: '#d8b040', sp_clapper: '#7a6a5a' }[e.part]; circ(x, y - 10 + Math.sin(t * 3) * 1.5, 7, c);
  ctx.save(); ctx.globalAlpha = 0.3 + 0.2 * Math.sin(t * 4); circ(x, y - 10, 12, '#ffd36e'); ctx.restore(); };
