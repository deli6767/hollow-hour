/* ===================== v1.8-c3 (M3-D7) · Platform 13 epilogue =====================
   12:01 path only. The 12:01 ending's end screen gets a small "PLATFORM 13" button that opens a walk-around
   epilogue room. MERIDIAN on a bench, Mopsley with his own ticket, a timetable, the turnstile. Sitting down ends it.
   Uses the Secrets 2.0 ties (vstub, ticket, ledger14, vrecipe, vlullaby). Not saved; no encounters.
   Flags: p13_open (transient) · p13_mer · p13_mop · p13_stub_given · meta.plat13 */
ROOMS.plat13 = { name: 'Platform 13', area: 'plat13', theme: 'spire', track: 'tower', map: [
  '##########################',
  '#TTTTTTTTTTTTTTTTTTTTTTTT#',
  '#........................#',
  '#........................#',
  '#........................#',
  '#........................#',
  '#........................#',
  '#,,,,,,,,,,,,,,,,,,,,,,,,#',
  '##########################',
  '##########################'],
  exits: [], ents: [
    { t: 'sign', x: 3, y: 2, text: ['DEPARTURES · 12:01 · PLATFORM 13 · ON TIME', 'The little letters have said ON TIME for so long they have faded into the board.'] },
    { t: 'thing', look: 'p13gate', x: 6, y: 4, run: async () => p13Gate() },
    { t: 'thing', look: 'p13mer', x: 13, y: 3, run: async () => p13Mer() },
    { t: 'npc', kind: 'mopsley', name: 'MOPSLEY', x: 21, y: 4, voice: 190, run: async () => p13Mop() },
    { t: 'thing', look: 'p13edge', x: 23, y: 6, walk: true, run: async () => p13Edge() },
  ] };
async function p13Gate() {
  if (!has('vstub')) return say('', 'An old turnstile. It is not locked. Someone has wedged it open with a folded timetable.', 'It has been waiting for somebody to come through for a very long time.');
  return say('', 'An old turnstile. A slot on top for tickets.', 'You hold the Old Ticket Stub over the slot. The turnstile doesn\'t take it.', 'It is the wrong day. It has been the wrong day for forty years.');
}
async function p13Mer() {
  const f = hero.flags;
  if (has('vstub') && !f.p13_stub_given) {
    const c = await ask('MERIDIAN', '...oh. it\'s you, spark. come to wait with me?', ['SHOW THE STUB', 'JUST SIT']);
    if (c === 0) { f.p13_stub_given = true;
      return say('MERIDIAN', '...', 'that\'s her writing on the back. she always wrote the time twice. in case one of them was wrong.', '...she did buy one. huh.', 'she bought one, and she stayed. i always thought she just... forgot.', 'you keep it. i have mine. one of us should have the whole set.'); }
  }
  const n = f.p13_mer = (f.p13_mer || 0) + 1;
  const L = [
    ['it\'s 12:01, spark. i keep checking. it stays 12:01. i didn\'t know a minute could be this wide.'],
    [has('vrecipe') ? '...you smell like tuesday. like buns. never mind. don\'t tell tolly i got sentimental.' : 'tolly would like it down here. nothing\'s late here, because nothing\'s on time yet.'],
    [has('vlullaby') ? 'someone\'s humming down the tunnel. or that\'s me. it goes "hush now, little minute..." i forget the rest. i don\'t, actually.' : 'the bench is cold. good. that means somebody sat here before me.'],
    ['you don\'t have to stay. i\'m good at waiting. i\'m the best there is.'],
  ];
  return say('MERIDIAN', ...L[Math.min(n - 1, L.length - 1)]);
}
async function p13Mop() {
  const f = hero.flags, n = f.p13_mop = (f.p13_mop || 0) + 1;
  const L = [
    ['Oh. You\'re early. No. You\'re exactly on time. That\'s rarer.'],
    f.ledger14 ? ['You read No. 14. So you know whose coat this is.', '...It\'s mine. She just ordered it. Said whoever stays behind gets cold first.'] : ['Nice coat, isn\'t it? Bit big. It was ordered for somebody bigger. Then I grew into the job.'],
    has('ticket') ? ['That ticket in your pocket. Punched, ink still wet.', 'I\'ve got the same one. Never had the nerve to punch mine. Somebody had to mop up after the bell.'] : ['I\'ve got a ticket for this train. Never used it. Somebody had to mop up after the bell.'],
    ['Go on and sit if you like. The bench at the end is the good one.', '...I\'ll mop around you.'],
  ];
  return say('MOPSLEY', ...L[Math.min(n - 1, L.length - 1)]);
}
async function p13Edge() {
  const c = await ask('', 'The end of the platform. A bench. Past it, just tunnel, and the rails humming very faintly.', ['SIT AND WAIT', 'NOT YET']);
  if (c !== 0) return;
  await say('', 'You sit. MERIDIAN shuffles over and sits next to you. Mopsley leans on his mop at the far end.', 'Nobody says anything. Way down the tunnel there is a little light.', 'It might be a train. It might just be morning.', 'Up on the board, the minute finally turns over: 12:02.');
  meta.plat13 = true; saveMeta(); sfx('bigbell'); toTitle();
}
function enterPlat13() { if (!hero || !hero.flags.p13_open) return; showScreen(null); B = null; DLG = null; busy = 0; CUT = null;
  state = 'world'; enterRoom('plat13', 2, 5, 1); RM.fade = 1.5; }
{ const _se = startEnding; startEnding = function (result) { const F = hero.flags;
    F.p13_open = result === 'spare' && route() === 'peace' && !!F.showTicket && !!F.ws_visited; return _se.apply(this, arguments); };
  const _ss = showScreen; showScreen = function (id) { const r = _ss.apply(this, arguments);
    if (id === 'end') { let b = $('b-end-p13'); if (!b) { b = document.createElement('button'); b.id = 'b-end-p13'; b.textContent = 'PLATFORM 13'; b.onclick = () => enterPlat13(); $('b-end-title').before(b); }
      b.style.display = hero && hero.flags.p13_open ? '' : 'none'; } return r; }; }
Object.assign(THING, {
  p13gate: (x, y) => { ctx.fillStyle = '#4a4050'; ctx.fillRect(x - 12, y - 24, 6, 24); ctx.fillRect(x + 6, y - 24, 6, 24); ctx.fillStyle = '#8a7a60'; ctx.fillRect(x - 12, y - 14, 24, 3); ctx.fillStyle = '#e8c870'; ctx.fillRect(x - 3, y - 26, 6, 2); },
  p13mer: (x, y, t) => { ctx.fillStyle = '#3a2a22'; ctx.fillRect(x - 26, y - 6, 52, 6); ctx.fillRect(x - 24, y, 4, 8); ctx.fillRect(x + 20, y, 4, 8);
    ctx.save(); ctx.translate(x, y - 4); ctx.scale(0.32, 0.32); drawMeridian(0, -120, t, { eye: '#ffd36e', cracks: 0, dead: 0 }); ctx.restore(); },
  p13edge: (x, y, t) => { ctx.fillStyle = '#3a2a22'; ctx.fillRect(x - 20, y - 6, 40, 6); ctx.fillRect(x - 18, y, 4, 8); ctx.fillRect(x + 14, y, 4, 8); ctx.fillStyle = `rgba(255,230,160,${0.25 + 0.2 * Math.sin(t * 2)})`; ctx.fillRect(x + 30, y - 30, 4, 4); },
});
