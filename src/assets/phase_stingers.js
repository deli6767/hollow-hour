/* Boss phase stingers by Add ons for Hollow Hour. Replace PHASE banners with a sound cue. Load after 00_core.js.
   hhPhaseStinger(id, phase?) - id: mopsley|wicklow|grit|cuckoo|meridian|quill(archivist)|lockkeeper|bilgewater|vesper, unknown ids get a generic cue.
   Uses the sfx bus (respects sfx volume). Each ~0.6-1.4s, rises in pitch with phase number. */
function hhPhaseStinger(id, phase) {
  if (!AU.ctx || settings.sfx <= 0) return;
  const t = AU.ctx.currentTime + 0.01, D = AU.sfx, k = Math.pow(2, Math.min(4, Math.max(0, (phase || 1) - 1)) / 12);
  const st = (notes, root, gap, dur, type, vol) => notes.forEach((n, i) => tone(root * k * Math.pow(2, n / 12), t + i * gap, dur, type, vol, D));
  switch (id) {
    case 'mopsley': // squeaky mop wring + splash
      tone(700 * k, t, 0.18, 'square', 0.1, D, 1100); tone(1100 * k, t + 0.18, 0.15, 'square', 0.1, D, 600); noise(t + 0.3, 0.4, 0.2, D, 1500); break;
    case 'wicklow': // candle flare: whoosh up into a bright chord
      noise(t, 0.35, 0.15, D, 900); st([0, 3, 7, 12], 392, 0.05, 0.6, 'triangle', 0.12); break;
    case 'grit': // industrial clank, hammer double-hit + steam hiss
      tone(110 * k, t, 0.25, 'sawtooth', 0.25, D, 55); noise(t, 0.08, 0.35, D, 400); tone(110 * k, t + 0.16, 0.25, 'sawtooth', 0.25, D, 55); noise(t + 0.16, 0.08, 0.35, D, 400); noise(t + 0.3, 0.7, 0.12, D, 4000); break;
    case 'cuckoo': // off-kilter cuckoo call, two falling thirds
      st([16, 12, 16, 12], 523, 0.13, 0.12, 'triangle', 0.16); tone(1800, t + 0.55, 0.05, 'square', 0.08, D); break;
    case 'meridian': // overclock: rising saw run, hard tick, low boom
      st([0, 5, 7, 12, 17, 19, 24], 220, 0.035, 0.12, 'sawtooth', 0.09); tone(1800, t + 0.26, 0.03, 'square', 0.15, D); tone(90, t + 0.28, 0.9, 'sine', 0.5, D, 30); noise(t + 0.28, 0.5, 0.25, D, 2500); break;
    case 'lockkeeper': // heavy lock: key turn ratchet, bolt slam, chain rattle
      for (let i = 0; i < 4; i++) { noise(t + i * 0.05, 0.02, 0.25, D, 3500); tone(1400 - i * 120, t + i * 0.05, 0.03, 'square', 0.08, D); }
      tone(80 * k, t + 0.25, 0.6, 'sine', 0.5, D, 40); noise(t + 0.25, 0.12, 0.4, D, 250); for (let i = 0; i < 6; i++) tone(2600 + Math.random() * 800, t + 0.4 + i * 0.04, 0.04, 'triangle', 0.04, D); break;
    case 'bilgewater': case 'twins': // twin sluices: two gurgles answering, then water rush
      tone(220 * k, t, 0.25, 'sine', 0.2, D, 110); tone(330 * k, t + 0.18, 0.25, 'sine', 0.2, D, 165); revNoise(t + 0.3, 0.5, 0.18, D, 900); noise(t + 0.8, 0.6, 0.15, D, 600); break;
    case 'quill': case 'archivist': // long quill stroke, page slam
      revNoise(t, 0.45, 0.14, D, 5000); noise(t + 0.46, 0.15, 0.35, D, 300); tone(147 * k, t + 0.46, 0.8, 'sine', 0.3, D, 70); tone(156 * k, t + 0.5, 1, 'sine', 0.08, D); break;
    case 'vesper': // tidal swell into a soft bell
      revNoise(t, 0.6, 0.12, D, 1200); st([0, 7, 12], 440, 0.02, 1.4, 'sine', 0.1); break;
    default:
      st([0, 7, 12], 330, 0.06, 0.4, 'square', 0.12); noise(t, 0.4, 0.12, D, 3000);
  }
}
