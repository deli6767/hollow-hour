/* v1.8-c6 M4-D1: MERIDIAN callback lines (Delon approved 17:43 ET). Talk only, no new attacks.
   Phase 0 intro: one route line. Phases 1-2 intros: one chapter callback each (max 2 per fight, no repeats).
   Wind-down (spent): one route line. */
const MER_CB_ROUTE = { peace: 'not one clock stopped. do you know how hard that is to argue with?', one: 'one. you only needed one. i keep wondering who you picked, and why.',
  mixed: 'you spare some and stop some. like a clock that can\'t decide what time it is.', violent: 'quiet up here, isn\'t it. you did that. floor by floor.' };
const MER_CB_WIND = { peace: 'go on, spark. ring something. i\'ll keep time.', mixed: 'half a song is still a song. not a good one. still a song.',
  violent: 'there. now it\'s just us and the ticking. was that what you wanted?', twelve: 'one minute past. i didn\'t think anyone could reach it. ...hello.' };
const MER_CB_CH = [
  ['candles', F => F.q_candles === 3 && !F.killed_wicklow, 'wicklow lit a candle for you. i saw it from the belfry. it\'s very small. it\'s very stubborn.'],
  ['grit', F => !!F.spared_grit, 'the foreman clocked out early because of you. first time in forty years.'],
  ['lock', F => F.lock_result === 'spared', 'you let the lockkeeper keep his wheel. sentimental. i\'d have taken it.'],
  ['twins', F => F.bilge_result === 'spared', 'the twins still argue about you. both of them say you liked them best.'],
  ['tide', F => !!(F.tide_turned || F.tide_low), 'you pulled the tide back once. cute. try pulling back me.'],
  ['quillS', F => F.quill_result === 'spared', 'the archivist filed you under \'unexpected\'. i read it. twice.'],
  ['quillK', F => F.quill_result === 'killed', 'the archive has a blank page now. it has your handwriting on it.'],
  ['pell', F => (F.q_pell || 0) >= 3, 'you rang the cue for someone else\'s song. nobody rings for me.'],
  ['ticket', F => !!(F.showTicket || F.q_fare), 'you kept a ticket for a train that doesn\'t run. we have that in common.'],
  ['photo', F => !!F.showPhoto, '...you still have the photograph. don\'t take it out. i\'m asking nicely.'],
  ['count', () => hero.kills >= 10, 'i stopped counting your stopped clocks. you didn\'t.']];
function hhMerCb(b, phase) {
  if (!b || !b.mer || (b.opts && (b.opts.practice || b.opts.rush))) return null; const F = hero.flags, m = b.mer;
  if (phase === 0) { const r = route(); return MER_CB_ROUTE[r === 'mixed' && hero.kills === 1 ? 'one' : r] || null; }
  if (phase !== 1 && phase !== 2) return null; m.cbUsed = m.cbUsed || [];
  const pool = MER_CB_CH.filter(c => !m.cbUsed.includes(c[0]) && c[1](F)); if (!pool.length) return null;
  const c = pool[Math.floor(Math.random() * pool.length)]; m.cbUsed.push(c[0]); return c[2]; }
function hhMerWind(b) { if (!b || !b.mer || (b.opts && (b.opts.practice || b.opts.rush))) return null; const F = hero.flags, r = route();
  return r === 'peace' && F.showTicket && F.ws_visited ? MER_CB_WIND.twelve : MER_CB_WIND[r] || null; }
