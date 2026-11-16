/* ===== v1.7-c11 · ROADMAP M3-D4: Cuckoo rework, the Pell duet (FLAG FOR DELON REVIEW: boss change + new spare path) =====
   Pell's Cue: q_pell 1 (met Pell) -> talk to Pell with the Cue Bell (from the Loft chest, held or worn), before Cuckoo -> q_pell 2
   (Pell waits in the Gallery wings). In the Cuckoo fight, once calm >= 50 or after Hum Along (director decision, c12), a new ACT 'Ring the Cue Bell' appears: Pell joins,
   the music switches to 'pell_duet', calm goes to 100, and sparing her is the duet spare (flags pell_duet, q_pell 3).
   Killing Cuckoo after the cue: q_pell stays 2, flag pell_cue_lost. Routes are unchanged: duet spare still sets spared_cuckoo. */
const hasCueBell = () => hero.items.includes('cuebell') || hero.armor === 'cuebell';
{ const q = QUESTS.find(q => q.id === 'pell'); const _st = q.stage;
  q.stage = () => { const f = hero.flags; if (f.q_pell >= 3) return 'Pell sang a line out loud. In the Gallery. To an audience.';
    if (f.q_pell === 2) return f.cuckoo_done ? 'Madame Cuckoo\'s show is over. Pell never got the cue.' : 'Pell is waiting in the Gallery wings. Ring the Cue Bell during Madame Cuckoo\'s show.';
    if (f.q_pell === 1 && !f.cuckoo_done) return 'Pell has never been given a cue. Maybe the little bell in the Loft could help.'; return _st(); }; }
{ const _p = pellTalk; pellTalk = async function () { const f = hero.flags;
    if (route() !== 'violent' && f.q_pell === 1 && f.pell_n >= 1 && !f.cuckoo_done && hasCueBell()) { f.q_pell = 2; f.pell_n++;
      return say('PELL', 'Is that... the cue bell? From my chest? You found it!', 'Okay. Okay okay okay. Here\'s the plan. I\'ll wait in the wings of the Gallery.', 'When she\'s really singing, when she means it, ring it. Just once.', 'That\'s my cue. Then I go on. ...Then I go ON.'); }
    if (f.q_pell >= 3 && !f.pell_after && route() !== 'violent') { f.pell_after = true; f.pell_n++;
      return say('PELL', 'I SAID A LINE. OUT LOUD. She did the high part and I did the low part and it was 12:00 for one whole bar!', 'She called me "darling." She calls everybody darling. But she looked at me when she said it.'); }
    if (f.q_pell === 2 && f.cuckoo_done && !f.pell_after) { f.pell_after = true; f.pell_n++;
      return say('PELL', f.killed_cuckoo ? '...I heard the bell. Then I heard nothing.' : 'I waited in the wings. Nobody rang it.', 'That\'s okay. Understudies are good at waiting.'); }
    return _p.apply(this, arguments); }; }
ENEMIES.cuckoo.acts['Ring the Cue Bell'] = B => { B.duet = true; B.calm = 100; hero.flags.pell_rang = true; try { setTrack('pell_duet'); } catch (e) {}
  return { t: ['You ring the tiny bell. Ding.', 'From the wings, a small voice comes in on the low part. PELL!', 'Madame Cuckoo falters, then turns the solo into a duet.'], c: 0, say: 'an UNDERSTUDY?! ...in MY key?! ...oh, darling. take the low line.' }; };
ENEMIES.cuckoo.actIf = Object.assign(ENEMIES.cuckoo.actIf || {}, { 'Ring the Cue Bell': B => !B.opts.practice && hero.flags.q_pell === 2 && hasCueBell() && (B.calm >= 50 || B.n('Hum Along') >= 1) && !B.duet });
{ const _ds = doSpare; doSpare = async function (b) {
    if (b && b.id === 'cuckoo' && b.duet && b.calm >= 100) { hero.flags.pell_duet = true; hero.flags.q_pell = 3;
      b.e = Object.assign({}, b.e, { spare: 'Madame Cuckoo and Pell hold the last note together. It is 12:00 for one whole bar. She takes a bow, then pushes Pell forward to take one too.' }); }
    return _ds.apply(this, arguments); }; }
{ const _dk = doKill; doKill = async function (b) { if (b && b.id === 'cuckoo' && b.duet) hero.flags.pell_cue_lost = true; return _dk.apply(this, arguments); }; }
{ const _q = qlEndCards; qlEndCards = function (cards, id, F) { _q.apply(this, arguments);
    if (F.pell_duet && F.spared_cuckoo && id !== 'still') cards.splice(Math.max(1, cards.length - 1), 0, { t: 'In the Gallery, the show has two names on the bill now. The smaller one is underlined twice, in pencil.', bg: ['#1a0e1e', '#3a1a30'], col: '#ffb8e0' }); }; }
/* Pell in the wings while the duet is on (drawn after the stage, beside Cuckoo) */
{ const _dbs = drawBossStage; drawBossStage = function (b) { const r = _dbs.apply(this, arguments);
    if (b && b.id === 'cuckoo' && b.duet && window.hhDrawPell) { ctx.save(); hhDrawPell(EX + 150, EY + 40, b.t); ctx.restore(); } return r; }; }
