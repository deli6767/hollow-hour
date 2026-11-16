/* Undercroft area theme + Fileflit battle loop. Original, by Add ons for Hollow Hour. Load after src/core/00_core.js. */
(function () {
  const _ = null;
  // UNDERCROFT: quiet, papery, slow. F lydian-ish, open fifths, long gaps. No scratch motif (that's the Archivist's).
  TRACKS.undercroft = {
    bpm: 58, root: 53, bt: 'sine', lt: 'triangle', lv: 0.07, kick: 0, hat: 0,
    bass: [0, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, 7, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _,
           -3, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, 2, _, _, _, _, _, _, _, 7, _, _, _, _, _, _, _],
    lead: [_, _, 19, _, _, _, 18, _, 16, _, _, _, _, _, _, _, _, _, 14, _, _, _, 16, _, _, _, _, _, _, _, _, _,
           _, _, 21, _, _, _, 19, _, _, _, 18, _, _, _, _, _, _, _, 16, _, 14, _, _, _, 12, _, _, _, _, _, _, _]
  };
  // FILEFLIT: short, fluttery battle loop. Bright and skittish, E dorian, 8th-note card flicks.
  TRACKS.fileflit = {
    bpm: 144, root: 52, bt: 'square', lt: 'square', lv: 0.055, kick: 1, hat: 1,
    bass: [0, _, 0, 12, _, 0, 7, _, 5, _, 5, 17, _, 5, 7, _, 3, _, 3, 15, _, 3, 10, _, 2, _, 7, _, 9, _, 10, _],
    lead: [19, 21, 24, _, 21, _, 19, 17, 19, _, _, 26, 24, _, 21, _, 22, 24, 26, _, 24, _, 22, 19, 21, _, 19, _, 17, 19, 21, _]
  };
  function paper(t, D) { // soft page rustle
    const c = AU.ctx, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = AU.noise; f.type = 'lowpass'; f.frequency.value = 1800 + Math.random() * 600;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.03, t + 0.25); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    s.connect(f); f.connect(g); g.connect(D); s.start(t, Math.random() * 0.4); s.stop(t + 1);
  }
  function flick(t, D) { noise(t, 0.025, 0.05, D, 4500); tone(2400 + Math.random() * 400, t, 0.02, 'triangle', 0.02, D); }
  // Call once per music step from musicTick (same line as archivist): hhMusicExtras(tr, t, s)
  window.hhMusicExtras = function (tr, t, s) {
    if (!AU.ctx || settings.music <= 0 || !tr) return;
    const D = AU.mus;
    if (tr === TRACKS.undercroft) {
      if (s % 32 === 12 || s % 64 === 44) paper(t, D);
      if (s % 64 === 0) tone(440 * Math.pow(2, (tr.root + 31 - 69) / 12), t, 3, 'sine', 0.02, D); // distant air tone
    } else if (tr === TRACKS.fileflit) {
      if (s % 4 === 1 || s % 8 === 6) flick(t, D);
    } else if (window.archivistExtras) archivistExtras(tr, t, s);
  };
})();
