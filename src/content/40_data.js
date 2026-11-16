/* ===================== DATA: terms, items, enemies ===================== */
// Original terms: GLOW = health · COIL = level · TORQUE = experience · COGS = money · EDGE = attack · PLATING = defence
const TORQUE_AT = [0, 10, 30, 60, 110, 180, 280, 420, 620, 900, 99999];
const maxGlow = h => 20 + 4 * (h.coil - 1);
const edge = h => 8 + 2 * (h.coil - 1) + ITEMS[h.weapon].v;
const plating = h => Math.floor((h.coil - 1) / 3) + ITEMS[h.armor].v;
const ITEMS = {
  biscuit: { name: 'Oil Biscuit', kind: 'heal', v: 10, price: 8, desc: 'crunchy. faintly machine-flavoured.' },
  ember: { name: 'Ember Candy', kind: 'heal', v: 15, price: 15, desc: 'warm all the way down.' },
  tea: { name: 'Thermos Tea', kind: 'heal', v: 22, price: 25, desc: 'still hot after forty years.' },
  pie: { name: 'Clockberry Pie', kind: 'heal', v: 40, price: 45, desc: 'baked at 11:59. still fresh at 11:59.' },
  cocoa: { name: 'Midnight Cocoa', kind: 'heal', v: 999, price: 90, desc: 'nobody has ever tasted midnight. this is close.' },
  rose: { name: 'Paper Rose', kind: 'gift', v: 0, price: 0, desc: 'folded from an old timetable. for someone who sings.' },
  wickstub: { name: 'Wick Stub', kind: 'gift', v: 0, price: 0, desc: 'a stub of Wicklow\'s wick, still warm. it lights what the dark is hiding.' },
  waxseal: { name: 'Cold Wax Seal', kind: 'gift', v: 0, price: 0, desc: 'all that\'s left of the knight. pressed with a letter: V. you didn\'t press it.' },
  button: { name: 'Brass Button', kind: 'gift', v: 0, price: 0, desc: 'Mopsley\'s. or not. "it fell off something that hasn\'t been sewn yet," he said.' },
  ticket: { name: "Tomorrow's Ticket", kind: 'gift', v: 0, price: 0, desc: 'ADMIT ONE · 12:01 · PLATFORM 13. already punched. the ink is still wet.' },
  photo: { name: 'Worn Photograph', kind: 'gift', v: 0, price: 0, desc: 'a tortoise, a jester, and someone whose face has been rubbed away by a thumb.' },
  twig: { name: 'Bent Twig', kind: 'weapon', v: 0, price: 0, desc: 'EDGE +0. it was a stick before it was a weapon.' },
  waxblade: { name: 'Wax Blade', kind: 'weapon', v: 4, price: 40, desc: 'EDGE +4. do not use near candles. or feelings.' },
  wrench: { name: 'Big Wrench', kind: 'weapon', v: 8, price: 95, desc: 'EDGE +8. fixes things. also the opposite.' },
  hourhand: { name: 'Hour Hand', kind: 'weapon', v: 13, price: 0, desc: 'EDGE +13. the biggest hand of the biggest clock.' },
  scarf: { name: 'Old Scarf', kind: 'armor', v: 0, price: 0, desc: 'PLATING +0. long. red. yours.' },
  locket: { name: 'Tin Locket', kind: 'armor', v: 2, price: 30, desc: 'PLATING +2. holds a picture of nobody yet.' },
  apron: { name: 'Gear Apron', kind: 'armor', v: 4, price: 75, desc: 'PLATING +4. smells like oil and bread.' },
  bellcharm: { name: 'Bell Charm', kind: 'armor', v: 6, price: 0, desc: 'PLATING +6. hums when danger is near.' },
};
const SHOP_STOCK = ['biscuit', 'ember', 'tea', 'cocoa', 'waxblade', 'wrench', 'locket', 'apron'];
const BAG_MAX = 8;

/* Enemies: acts return {t:[lines], c: calm delta, say?:bubble}; B.n(name) = times that act was used before */
const ENEMIES = {
  mothwick: { name: 'Mothwick', hp: 24, def: 0, atk: 1, torque: 4, cogs: 6, d: 1, attacks: ['waxDrip', 'mothFlutter'], art: 'mothwick', track: 'battle', mini: 0.32,
    check: 'EDGE 3 · PLATING 0 · can\'t decide whether to BE the light or chase it.',
    intro: 'Mothwick flutters into your face!', flavor: ['Mothwick is circling your ember head.', 'Smells like warm wax and dust.', 'Mothwick bumps into you on purpose.'], calm: 'Mothwick is dazzled and dozy.',
    talk: ['bzz... pretty...', 'are YOU a lamp?', 'i am the lamp.', 'flutter flutter. (threatening)'],
    acts: {
      'Flap Arms': B => ({ t: ['You flap your arms.', 'Mothwick flaps back. It\'s a dance now.'], c: 50, say: 'a fellow flapper!!' }),
      'Dim Glow': B => ({ t: ['You dim your ember head.', B.n('Flap Arms') ? 'Mothwick drifts closer, sleepy and content.' : 'Mothwick looks around, confused.'], c: B.n('Flap Arms') ? 60 : 25, say: B.n('Flap Arms') ? 'so... cozy...' : 'where did the pretty go' }),
      'Blow Out': B => ({ t: ['You blow on Mothwick\'s candle.', 'It relights instantly. It is OFFENDED.'], c: -20, say: 'RUDE.' }),
    }, spare: 'Mothwick drifts off toward a nicer lamp.', kill: 'The candle goes out.' },
  rustpup: { name: 'Rustpup', hp: 30, def: 0, atk: 1, torque: 5, cogs: 8, d: 1, attacks: ['fetch', 'boltToss'], art: 'rustpup', track: 'battle', mini: 0.3,
    check: 'EDGE 3 · PLATING 1 · squeaks when it wags. wags constantly.',
    intro: 'Rustpup squeaks at you! (friendly?) (unclear)', flavor: ['Rustpup\'s tail is a blur.', 'Rustpup is chewing a bolt. It is the best bolt.', 'Squeak. Squeak. Squeak.'], calm: 'Rustpup has rolled over for belly rubs.',
    talk: ['ARF', 'arf arf (ball?)', 'squeak!!', '*happy rust noises*'],
    acts: {
      'Pet': B => { const n = B.n('Pet'); return { t: ['You pet Rustpup.', ['It squeaks with joy.', 'It squeaks LOUDER with joy.', 'Rustpup is overwhelmed with joy.'][Math.min(n, 2)]], c: 35 + n * 10, say: 'arf!' }; },
      'Throw Bolt': B => ({ t: ['You throw a bolt across the clearing.', B.n('Pet') ? 'Rustpup fetches it and drops it at your feet, proud.' : 'Rustpup stares at you instead. It wanted pets first.'], c: B.n('Pet') ? 70 : 10, say: B.n('Pet') ? 'ARF ARF!!' : '...?' }),
      'Oil Joints': B => ({ t: ['You oil Rustpup\'s creaky legs.', 'The squeaking stops. Rustpup looks... different. Nobler.'], c: 40, say: '(silent wag)' }),
    }, spare: 'Rustpup trots home, wagging.', kill: 'Rustpup stops wagging.' },
  tocklet: { name: 'Tocklet', hp: 36, def: 1, atk: 1.25, torque: 7, cogs: 10, d: 1.08, attacks: ['tickRing', 'secondHand'], art: 'tocklet', track: 'battle', mini: 0.3,
    check: 'EDGE 4 · PLATING 1 · thinks it is 11:59. it is right.',
    intro: 'Tocklet ticks into view!', flavor: ['Tocklet is checking itself. Still 11:59.', 'Tick. Tock. Tick. Tick?', 'Tocklet hops in place, impatient.'], calm: 'Tocklet\'s ticking has slowed to a lullaby.',
    talk: ['TICK!', 'what time is it? (11:59)', 'tock tock tock', 'is it later yet??'],
    acts: {
      'Tell Time': B => ({ t: ['You tell Tocklet it is 11:59.', 'Tocklet nods vigorously. Finally, someone who GETS it.'], c: 40, say: 'CORRECT!' }),
      'Wind Up': B => ({ t: ['You wind the little key on Tocklet\'s back.', 'It hums happily. It feels... fresh.'], c: 45, say: 'wheee' }),
      'Say "Midnight"': B => ({ t: ['You whisper "midnight."', 'Tocklet\'s hands spin in panic. It hides behind itself.'], c: 15, say: 'DON\'T SAY THAT' }),
    }, spare: 'Tocklet ticks away, humming.', kill: 'Tocklet stops ticking.' },
  boltbeetle: { name: 'Boltbeetle', hp: 42, def: 2, atk: 1.25, torque: 8, cogs: 12, d: 1.08, attacks: ['springBounce', 'coilSnap'], art: 'boltbeetle', track: 'battle', mini: 0.28,
    check: 'EDGE 4 · PLATING 3 · its shell is polished to a mirror finish. it knows.',
    intro: 'Boltbeetle bounces in, gleaming!', flavor: ['Boltbeetle is admiring itself in its own shell.', 'Boing.', 'Boltbeetle polishes its shell with a tiny cloth.'], calm: 'Boltbeetle is beaming at you.',
    talk: ['boing!', 'look at me. no, really LOOK.', 'shiny is a lifestyle', 'BOING (aggressive)'],
    acts: {
      'Admire Shell': B => ({ t: ['You tell Boltbeetle its shell is very shiny.', 'Boltbeetle blushes. Somehow. It\'s metal.'], c: 40, say: 'i KNOW. thank you.' }),
      'Flip Over': B => { B.flipped = true; return { t: ['You flip Boltbeetle onto its back.', 'Its spring legs wiggle helplessly.'], c: 0, say: 'HEY. HEY!!' }; },
      'Help Up': B => B.flipped ? (B.flipped = false, { t: ['You help Boltbeetle back up.', 'It looks at you like you hung the moon.'], c: 100, say: 'my hero...' }) : ({ t: ['Boltbeetle is already upright.', 'It appreciates the thought.'], c: 10 }),
    }, spare: 'Boltbeetle boings away, shining.', kill: 'Boltbeetle\'s shell goes dull.' },
  kettlewisp: { name: 'Kettlewisp', hp: 40, def: 1, atk: 1.3, torque: 8, cogs: 12, d: 1.1, attacks: ['steamRise', 'boilOver'], art: 'kettlewisp', track: 'battle', mini: 0.3,
    check: 'EDGE 5 · PLATING 1 · always just about to boil over.',
    intro: 'Kettlewisp whistles angrily!', flavor: ['Kettlewisp is rattling its lid.', 'Smells like burnt tea leaves.', 'Kettlewisp is steaming. Emotionally, too.'], calm: 'Kettlewisp is a pleasant, gentle simmer.',
    talk: ['HSSSSS', 'too HOT', 'nobody ever takes me OFF the stove', 'fweeee'],
    acts: {
      'Cool Down': B => ({ t: ['You blow gently on Kettlewisp.', 'Its rattling settles a little.'], c: 40, say: 'ahh... hm.' }),
      'Pour Tea': B => { const g = Math.min(6, maxGlow(hero) - hero.glow); hero.glow += g; return { t: ['You pour a cup from Kettlewisp. You both share it.', `It's good tea. (+${g} GLOW)`], c: 35, say: 'you LIKE it?' }; },
      'Whistle': B => ({ t: ['You whistle a little tune.', 'Kettlewisp whistles back, in harmony!'], c: 45, say: 'fwee fwee~' }),
    }, spare: 'Kettlewisp floats off to find a cooler stove.', kill: 'The steam fades away.' },
  stringling: { name: 'Stringling', hp: 50, def: 2, atk: 1.5, torque: 11, cogs: 15, d: 1.15, attacks: ['strings', 'tangle'], art: 'stringling', track: 'battle', mini: 0.26,
    check: 'EDGE 6 · PLATING 2 · dances whether or not it wants to.',
    intro: 'Stringling dangles down from the rafters!', flavor: ['Stringling is dancing. Its face is not.', 'The strings creak up into darkness.', 'Stringling\'s feet don\'t quite touch the floor.'], calm: 'Stringling is swaying to its own rhythm.',
    talk: ['...help...', 'step, step, turn.', 'they pull. i dance.', 'smile (it is painted on)'],
    acts: {
      'Dance': B => ({ t: ['You dance with Stringling.', 'For a moment, it leads.'], c: 35, say: '...oh.' }),
      'Bow': B => ({ t: ['You bow politely.', 'Stringling bows back. It was not pulled. It chose to.'], c: 30, say: 'thank... you' }),
      'Cut Strings': B => B.n('Dance') ? ({ t: ['You snip the strings.', 'Stringling slumps... then wobbles upright. On its own.'], c: 100, say: 'i can... stand?' }) : ({ t: ['You reach for the strings.', 'Stringling flinches away. It doesn\'t trust you yet.'], c: 0, say: 'no...!' }),
    }, spare: 'Stringling wobbles away on its own two feet.', kill: 'The strings go slack.' },
  gloomgong: { name: 'Gloomgong', hp: 48, def: 3, atk: 1.5, torque: 11, cogs: 15, d: 1.15, attacks: ['tollWave', 'echo'], art: 'gloomgong', track: 'battle', mini: 0.28,
    check: 'EDGE 6 · PLATING 4 · a bell nobody has ever rung. feels left out.',
    intro: 'Gloomgong sways mournfully into your path.', flavor: ['Gloomgong lets out a sad little "dong".', 'Gloomgong is staring at the big bell above.', 'An echo of an echo hangs in the air.'], calm: 'Gloomgong is ringing softly with happiness.',
    talk: ['...dong.', 'no one rings me.', 'i have a lovely voice. probably.', 'the big bell gets ALL the attention'],
    acts: {
      'Ring': B => ({ t: ['You ring Gloomgong.', 'BONNNNG. It\'s beaming. Its whole body is vibrating.'], c: 55, say: 'AGAIN!!' }),
      'Listen': B => ({ t: ['You listen to Gloomgong\'s echo.', 'It talks about its feelings for a while.'], c: 40, say: '...thanks for listening.' }),
      'Hug': B => ({ t: ['You hug Gloomgong.', 'Cold. Metallic. Deeply appreciative.'], c: 40, say: 'hmmmmmmm (happy hum)' }),
    }, spare: 'Gloomgong rings itself, happily, all the way home.', kill: 'The echo stops.' },
  mopsley: { name: 'MOPSLEY', title: 'Custodian of Everything', hp: 999, def: 99, atk: 0.7, torque: 0, cogs: 0, d: 1, attacks: ['spill', 'bucket'], art: 'mopsley', track: 'mop', mini: 0.3, noStrike: true, secret: true,
    check: 'EDGE 1 · PLATING ? · he says he\'s just the janitor. the floor is very slippery.',
    intro: 'MOPSLEY sighs and leans on his mop. "Fine. Watch where you step."', flavor: ['Mopsley is mopping a spot that was already clean.', 'The floor shines. You can see a ceiling that isn\'t there.', 'Mopsley hums something. It almost sounds like a music box.'], calm: 'Mopsley has stopped mopping. He\'s just looking at you.',
    talk: ['mind the puddle.', 'every spill is the same spill, really.', 'my knees, kid. my KNEES.', 'you dodge like the last one. ...last WHAT? last... dancer. i saw a dance once.'],
    acts: {
      'Help Mop': B => ({ t: ['You help mop.', B.n('Help Mop') ? 'You missed a spot. Mopsley points it out. Lovingly.' : 'Mopsley watches your technique. "Huh. Not bad."'], c: 34, say: 'wrist. use the WRIST.' }),
      'Ask Who He Is': B => ({ t: ['You ask who he really is.', ['"Mopsley. Custodian. I said."', '"Somebody\'s got to clean up after the minutes. They leave crumbs."', '"...I knew her. The one with the tools. No I didn\'t. Next question."'][Math.min(B.n('Ask Who He Is'), 2)]], c: 10, say: ['custodian.', 'crumbs.', '...'][Math.min(B.n('Ask Who He Is'), 2)] }),
      'Compliment Mop': B => ({ t: ['You tell him it\'s a very good mop.', '"It IS a very good mop." He seems genuinely moved.'], c: 30, say: 'thirty years, this mop.' }),
    }, spare: '"Right. Well. Floor\'s done." Mopsley wrings out his mop and wanders off, humming.', kill: '' },
  /* ---------- mid bosses ---------- */
  wicklow: { name: 'WICKLOW', title: 'the Candle Knight', boss: true, hp: 110, def: 1, atk: 1.25, torque: 40, cogs: 40, d: 1.05, attacks: ['waxLance', 'emberFall', 'shieldWall', 'wickRing', 'lastLight'], art: 'wicklow', track: 'wick', mini: 0.24,
    check: 'EDGE 6 · PLATING 2 · has guarded the Candle Gate since 11:58. is shorter than he used to be.',
    intro: 'WICKLOW raises his lance. "HALT, small flame!"', flavor: ['Wicklow\'s flame plume bends in the draft.', 'Wax drips from Wicklow\'s gauntlets.', 'Wicklow stands perfectly straight. Slightly shorter than a minute ago.'], calm: 'Wicklow has lowered his lance.',
    turns: ['NONE PASS THE CANDLE GATE!', 'I have stood here since 11:58! The finest minute!', 'Have at thee!', 'Hmph. You dodge with honour.', 'My wax... runs low. The light is going. Do you see it going?', 'I remember... a lady with tools. She lit me. I cannot see her face.', 'Why do you not strike? Strange flame.'],
    acts: {
      'Salute': B => ({ t: ['You salute Wicklow.', B.n('Salute') ? 'He salutes back again. He is very into this.' : 'Wicklow freezes... then salutes back, flame trembling.'], c: B.n('Salute') ? 10 : 30, say: 'A knight\'s greeting! I... accept!' }),
      'Shield Flame': B => ({ t: ['You cup your hands around Wicklow\'s flame to keep the draft off.', 'He stops melting. Just for a moment.'], c: 35, say: '...no one has done that before.' }),
      'Ask About Gate': B => ({ t: ['You ask what he\'s guarding.', '"The road to Gearholm! From... from..." He doesn\'t remember.'], c: 30, say: 'From DANGER! probably!' }),
    }, spare: 'Wicklow kneels. "Pass, little flame. I think... I would like to sit down."', kill: 'Wicklow melts into a puddle of wax. The flame goes out last.' },
  grit: { name: 'FOREMAN GRIT', title: 'of the Cogworks', boss: true, hp: 170, def: 2, atk: 1.45, torque: 70, cogs: 70, d: 1.12, attacks: ['conveyor', 'rivetRain', 'drillBits', 'pistonPress', 'theRules'], art: 'grit', track: 'grit', mini: 0.2,
    check: 'EDGE 8 · PLATING 3 · hasn\'t taken a break in forty years of the same minute.',
    intro: 'FOREMAN GRIT slams his drill down. "YOU\'RE LATE FOR YOUR SHIFT!"', flavor: ['The Cogworks shudders with every step Grit takes.', 'Grit\'s hard hat light sweeps the room.', 'Somewhere, a whistle that never blew is waiting.'], calm: 'Grit is staring at his drill, thinking about naps.',
    turns: ['SHIFT STARTS NOW!', 'Break? There\'s no break! Shift ends at midnight!', 'And midnight NEVER COMES! HAHA! ...ha.', 'Forty years. Same shift. Same minute.', 'RULES ARE RULES! My rules! On MY floor!', 'My arms are tired, kid. Don\'t tell anyone.', 'We made something here once we weren\'t supposed to. Don\'t ask. Back to work...'],
    acts: {
      'Work Hard': B => ({ t: ['You pretend to hammer something with great enthusiasm.', 'Grit nods approvingly. Then works HARDER.'], c: 15, say: 'THAT\'S THE SPIRIT!' }),
      'Show Clock': B => ({ t: ['You point at the wall clock. 11:59.', 'Grit squints at it. "...It\'s been 11:59 a long time, huh."'], c: 30, say: 'when DID i last clock out?' }),
      'Suggest Break': B => B.n('Show Clock') ? ({ t: ['You suggest that maybe, just maybe, he\'s earned a break.', 'Grit sits down. Heavily. The floor dents.'], c: 55, say: '...a break. what\'s that like.' }) : ({ t: ['You suggest a break.', '"A BREAK? The shift ends at MIDNIGHT!"'], c: 0, say: 'BACK TO WORK!' }),
    }, spare: 'Grit punches his own time card. "Clocking out. Wake me at midnight, kid."', kill: 'Grit\'s drill winds down. The Cogworks goes quiet.' },
  cuckoo: { name: 'MADAME CUCKOO', title: 'the Hour Diva', boss: true, hp: 210, def: 3, atk: 1.6, torque: 110, cogs: 100, d: 1.18, attacks: ['aria', 'encore', 'highNote', 'featherStorm', 'medley', 'grandFinale'], art: 'cuckoo', track: 'cuckoo', mini: 0.2,
    check: 'EDGE 10 · PLATING 4 · sings the hour every hour. it has been the same hour.',
    intro: 'MADAME CUCKOO bursts out of her clock-house! "AN AUDIENCE!"', flavor: ['Madame Cuckoo is warming up her scales.', 'The gallery is full of empty seats.', 'A spotlight finds her. She finds the spotlight.'], calm: 'Madame Cuckoo is basking. She\'s ready for her bow.',
    turns: ['CUCKOO! It is 11:59! CUCKOO!', 'Every hour, the same song. Every song, the same hour!', 'Do you know how hard it is to stay FRESH?', 'No one has clapped in forty years, darling.', 'MEDLEY', 'This next one... is the big finish.', 'Is it... is it over? Can it be over?'],
    acts: {
      'Applaud': B => ({ t: ['You applaud wildly.', 'Madame Cuckoo puts a wing to her chest. Is she... crying?'], c: 30, say: 'oh... OH! an AUDIENCE!' }),
      'Hum Along': B => B.turn >= 2 ? ({ t: ['You hum along with her melody.', 'For a moment, it\'s a duet.'], c: 40, say: 'you know the words?!' }) : ({ t: ['You try to hum along.', 'She hasn\'t started the real song yet.'], c: 5, say: 'not YET, darling!' }),
      'Request Encore': B => { B.forceAtk = 'grandFinale'; return { t: ['You shout "ENCORE!"', 'Madame Cuckoo gasps. She\'s been waiting forty years for that.'], c: 35, say: 'you asked for it!!' }; },
    }, spare: 'Madame Cuckoo takes the longest bow in history. "Thank you! Thank you! I\'ll be here all... well. Not all night. Finally."', kill: 'The music box winds down mid-note.' },
  meridian: { name: 'MERIDIAN', title: 'the Clockwork Jester', boss: true, meridian: true, hp: 720, def: 4, atk: 1.9, torque: 0, cogs: 0, d: 1, attacks: [], art: 'meridian', track: 'm1', mini: 0.24,
    check: 'EDGE ?? · PLATING ?? · keeper of the Bell of Hours. stopped every clock at 11:59.',
    intro: 'MERIDIAN bows. Every clock in the room ticks at once.', flavor: ['MERIDIAN is twirling one glove.', 'The great bell hangs silent overhead.', 'Somewhere, a minute is waiting to end.'], calm: 'MERIDIAN\'s spring is almost spent.',
    acts: {
      'Ask Why': B => ({ t: ['You ask why he stopped the clocks.', ['"why? because i\'m a clock too, spark."', '"my spring was wound for a fixed number of days."', hero.flags.ws_visited ? '"she wound me for a fixed number of days. ...who? i didn\'t say she. nobody wound me."' : '"when the bell rings midnight, i stop. forever."'][Math.min(B.n('Ask Why'), 2)]], c: 0, say: ['why do YOU care?', 'it\'s a simple deal.', 'so i stopped the bell first.'][Math.min(B.n('Ask Why'), 2)] }),
      'Laugh at Joke': B => ({ t: ['MERIDIAN tells a joke about a clock that went back four seconds.', 'You laugh. "...wait. you GOT that?"'], c: 0, say: 'finally, a crowd.' }),
      'Wind His Key': B => B.mer && B.mer.spent ? (B.oneMore ? { t: ['You turn the key again. It\'s wound as far as it goes.'], c: 0, say: 'that\'s enough, spark. that was plenty.' } : (B.oneMore = 1, { t: ['MERIDIAN is spent. You wind his key anyway.', 'Once. Twice. It won\'t make him strong enough to fight.', 'But his hands begin, very slowly, to move.'], c: 0 }))
        : ({ t: ['You reach for the key in MERIDIAN\'s back.', B.n('Ask Why') ? 'He lets you turn it once. "...that tickles. stop that."' : 'He spins away. "hands off the merchandise."'], c: 0, say: B.n('Ask Why') ? '...why would you help me?' : 'not yet, spark.' }),
      'Show Ticket': B => { hero.flags.showTicket = true; return { t: ['You hold up Tomorrow\'s Ticket.', 'Every clock in the room skips. Just once.'], c: 0, say: ['...where did you get that.', 'that train doesn\'t run. it CAN\'T run. there is no 12:01.', '...it\'s punched. somebody already rode it.'][Math.min(B.n('Show Ticket'), 2)] }; },
      'Show Photo': B => { hero.flags.showPhoto = true; return { t: ['You show him the worn photograph.', 'MERIDIAN looks for a long time at the space where a face should be.'], c: 0, say: B.n('Show Photo') ? 'put it away. please.' : 'that\'s me. and the old tortoise. and... no. no, there was nobody else. i built myself.' }; },
    }, actIf: { 'Show Ticket': () => has('ticket'), 'Show Photo': () => has('photo') }, spare: '', kill: '' },
};
for (const k in ENEMIES) ENEMIES[k].id = k;
const ENC_TABLE = { rustwood: ['mothwick', 'rustpup'], cogworks: ['tocklet', 'boltbeetle', 'kettlewisp'], spire: ['stringling', 'gloomgong', 'tocklet'] };
const AREA_POP = { rustwood: 7, cogworks: 8, spire: 8 };
const AREA_NAME = { rustwood: 'Rustwood', town: 'Gearholm', cogworks: 'The Cogworks', spire: 'Hourspire', belfry: 'The Belfry' };
