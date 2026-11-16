/* ===== v1.7-c10 · Quill aftermath =====
   Hall of Filed Clocks gets a 7th cabinet (QUILL); the lectern, the ledger, the Stacks and Pell react to quill_result;
   ending cards for a spared or killed Quill (qlEndCards, called from 70_ui.js before the last card). */
UC_REC.push(['ARCHIVIST QUILL', () => { const r = hero.flags.quill_result; return r === 'spared' ? 's' : r === 'killed' ? 'k' : ''; }]);
UC_LBL.push('QUILL');
{ const E = ROOMS.under2.ents; let i = 0; for (const e of E) if (e.look === 'uccab') e.x = 3 + (i++) * 4;
  E.push({ t: 'thing', look: 'uccab', n: 6, x: 3 + 6 * 4, y: 3, run: async () => ucCabinet(6) }); }
{ const _l = ucLectern; ucLectern = async function () { await _l.apply(this, arguments); const r = hero.flags.quill_result;
    if (r === 'spared') return say('', 'A new page has been pasted in at the back, in a different hand.', '"Corrections welcome. - Q."');
    if (r === 'killed') return say('', 'The back pages are empty. Nobody is writing this down anymore.', 'You could keep reading. There is nothing more to read.'); }; }
{ const _g = ucLedger; ucLedger = async function () { await _g.apply(this, arguments);
    if (hero.flags.quill_result === 'spared') return say('', 'Tucked in the front: a blank index card, signed "Q.", and a note: "for the next one. you choose what goes on it."');
    if (hero.flags.quill_result === 'killed') return say('', 'The newest clocks are not filed at all. They just lie in a heap. Some of them are still ticking. Nobody is counting.'); }; }
ROOMS.under3.ents.push(
  { t: 'sign', x: 27, y: 5, show: () => hero.flags.quill_result === 'spared', text: ['A returns cart. A card on top: "BORROWING IS NOW PERMITTED. BRING THEM BACK DIFFERENT. - Q."'] },
  { t: 'sign', x: 27, y: 5, show: () => hero.flags.quill_result === 'killed', text: ['A returns cart, piled high. The Fileflits circle it and never land. Nothing here gets put away now.'] });
{ const _p = pellTalk; pellTalk = async function () { const f = hero.flags;
    if (f.pell_n >= 1 && f.quill_result && !f.pell_ql && route() !== 'violent') { f.pell_ql = true;
      return f.quill_result === 'spared'
        ? say('PELL', 'Did you go down to the archive? Somebody slid a card under the Loft door.', 'It says: "PELL. UNDERSTUDY. NO PERFORMANCES ON FILE." and then, in pencil: "YET."', 'I think it\'s the nicest thing anyone has ever written about me.')
        : say('PELL', 'The archive stopped scratching. You can hear it from up here, when it\'s quiet.', 'Madame Cuckoo says everybody is on file down there. Even understudies.', '...who files us now?'); }
    return _p.apply(this, arguments); }; }
function qlEndCards(cards, id, F) { const r = F.quill_result; if (!r) return; const dusk = ['#0a080e', '#1a1422'];
  let c; if (r === 'spared') c = id === 'still' ? null : { t: 'Under the Hourspire, Archivist Quill turned to a fresh page and, for the first time, left it blank. "Pending," the Archivist said. It sounded like a good word.', bg: dusk, col: '#e8dcc0' };
  else c = { t: id === 'still' ? 'Under the Hourspire, the filed clocks have all stopped. There is no one left to read them, and no one left to be read.' : 'Under the Hourspire, the pen has stopped. The record ends mid-sentence. Some of it was about you.', bg: dusk, col: '#b8b0c0' };
  if (c) cards.splice(Math.max(1, cards.length - 1), 0, c); }
