/* ===================== v1.8-c7 (M4-D2) · music pass =====================
   Audio only. Two new original synth themes so no region/boss shares another's theme:
   - plat13: Platform 13 (was reusing Hourspire's 'tower').
   - mer_spent: MERIDIAN spent / wind-down (was reusing the Belfry region theme).
   Three themes carry a short, quiet music-box countermelody ('ctr' layer, see musicTick): tide, pell_duet, mer_spent.
   Keep it that way: exactly three. */
(function () {
  const _ = null;
  const seq = (n, m) => { const a = new Array(n).fill(null); for (const k in m) a[k] = m[k]; return a; };
  TRACKS.plat13 = { bpm: 76, root: 49, bt: 'sine', lt: 'sine', lv: 0.09, kick: 0, hat: 1,
    bass: [0, _, _, _, _, _, 7, _, 5, _, _, _, _, _, 4, _, 2, _, _, _, _, _, 9, _, 7, _, _, _, _, _, _, _],
    lead: [16, _, 18, _, 19, _, _, _, 23, _, 21, _, 19, _, 18, _, 16, _, _, _, 14, _, 16, _, 11, _, _, _, _, _, _, _] };
  TRACKS.mer_spent = { bpm: 66, root: 50, bt: 'sine', lt: 'triangle', lv: 0.08, kick: 0, hat: 0,
    bass: seq(64, { 0: 0, 8: -4, 16: -2, 24: -5, 32: 0, 40: -4, 48: 3, 56: 2 }),
    lead: seq(64, { 0: 12, 4: 15, 8: 17, 12: 15, 14: 14, 16: 12, 20: 10, 24: 7, 32: 12, 36: 15, 40: 19, 44: 17, 46: 15, 48: 14 }),
    ctr: seq(64, { 50: 39, 52: 43, 54: 46, 56: 43, 58: 41, 60: 39 }), cv: 0.03 };
  // quiet quotes layered on existing themes (the melody/bass lines are untouched)
  TRACKS.tide.ctr = seq(128, { 96: 39, 98: 43, 100: 46, 102: 43, 104: 41, 108: 39 }); TRACKS.tide.cv = 0.028;
  TRACKS.pell_duet.ctr = seq(64, { 48: 24, 50: 28, 52: 31, 54: 28, 56: 26, 58: 24 }); TRACKS.pell_duet.cv = 0.03;
  ROOMS.plat13.track = 'plat13';
})();
