/* ARCHIVIST QUILL boss theme. Original composition by Add ons for Hollow Hour.
   Drop in after src/core/00_core.js. Uses that file's TRACKS, tone(), noise(), AU, settings.
   Feel: dusty archive, slow and eerie, D Phrygian with a tritone and a b2 sigh,
   over a quill-scratch rhythm (filtered noise strokes that slide like a nib on paper). */
(function () {
  const _ = null;
  // 64 steps = 4 bars of 16ths at 76 bpm.
  TRACKS.archivist = {
    bpm: 76, root: 50, bt: 'triangle', lt: 'sine', lv: 0.11, kick: 0, hat: 0,
    bass: [0, _, _, _, _, _, 0, _, 1, _, _, _, _, _, _, _,
           -2, _, _, _, _, _, -2, _, -4, _, _, _, 1, _, _, _,
           0, _, _, _, _, _, 0, _, 1, _, _, _, _, _, _, _,
           6, _, _, _, 5, _, _, _, 1, _, _, _, 0, _, _, _],
    lead: [12, _, _, 13, _, 12, _, _, 10, _, 8, _, 7, _, _, _,
           15, _, _, 13, _, 12, _, 13, 12, _, _, _, _, _, _, _,
           12, _, _, 13, _, 15, _, 17, 18, _, _, 17, _, 15, _, 13,
           12, _, _, _, 13, _, _, _, 12, _, _, _, _, _, _, _],
    // quill strokes: 1 = short scratch, 2 = long dragged stroke, 3 = nib tap
    quill: [2, _, 1, _, _, 1, 3, _, 1, _, _, 1, _, 3, 1, _],
    // high 'dust mote' bell, sparse and slightly detuned
    dust: [_, _, _, _, _, _, _, _, _, _, _, _, 31, _, _, _,
           _, _, _, _, _, _, _, _, _, _, _, _, _, _, 30, _]
  };

  function quillStroke(t, kind, D) {
    const c = AU.ctx, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    const dur = kind === 2 ? 0.32 : kind === 3 ? 0.03 : 0.09;
    s.buffer = AU.noise; f.type = 'bandpass'; f.Q.value = 6;
    const f0 = 2600 + Math.random() * 900;
    f.frequency.setValueAtTime(f0, t);
    f.frequency.exponentialRampToValueAtTime(kind === 2 ? f0 * 1.9 : f0 * 0.7, t + dur);
    const v = kind === 3 ? 0.09 : 0.06;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.006);
    if (kind === 2) { // scratchy flutter, like paper fibers
      for (let k = 1; k < 8; k++) g.gain.setValueAtTime(v * (k % 2 ? 0.35 : 1), t + k * dur / 8);
    }
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(D); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
    if (kind === 3) tone(1900, t, 0.03, 'square', 0.025, D);
  }

  // Call once per music step: archivistExtras(AU.track, AU.next, AU.step).
  window.archivistExtras = function (tr, t, s) {
    if (!tr || tr !== TRACKS.archivist || !AU.ctx || settings.music <= 0) return;
    const D = AU.mus, q = tr.quill[s % tr.quill.length];
    if (q) quillStroke(t, q, D);
    const d = tr.dust[s % tr.dust.length];
    if (d != null) tone(440 * Math.pow(2, (tr.root + d - 69) / 12) * (1 + (Math.random() - 0.5) * 0.012), t, 1.6, 'sine', 0.035, D);
    if (s % 64 === 0) noise(t, 2.5, 0.025, D, 5500); // page-turn air at the top of each loop
  };
})();
