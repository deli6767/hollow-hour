/* =====================================================================
   HOLLOW HOUR — an original bullet-hell RPG. Single file, no assets.
   Sections: CORE (config/storage/audio/input) · ENGINE (bullets/soul) ·
   PATTERNS · ART · DATA (items/enemies/maps) · BATTLE · WORLD · UI · MAIN
   ===================================================================== */
/* ===================== CONFIG / UTIL ===================== */
const W = 960, H = 540, STEP = 1 / 120, TILE = 32;
let ARENA_X = 480, ARENA_Y = 340;
const SOUL_R = 8, HIT_R = 3.5, GRAZE_R = 12;
const BASE_SPEED = 175, FOCUS_MUL = 0.45;
const IFRAMES = 1.0, MAX_PARTICLES = 400;
const rand = (a, b) => a + Math.random() * (b - a);
const irand = (a, b) => Math.floor(rand(a, b + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const fmtTime = s => s == null ? '--' : Math.floor(s / 60) + ':' + (s % 60).toFixed(1).padStart(4, '0');
const fmtClock = s => { s = Math.floor(s || 0); const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60; return (h ? h + 'h ' : '') + m + 'm ' + (s % 60) + 's'; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const FONT = 'Georgia,"Times New Roman",serif';

/* ===================== STORAGE ===================== */
const LS_SET = 'hollowhour_settings_v1', LS_SAVE = 'hollowhour_save_v1', LS_META = 'hollowhour_meta_v1';
const DEF_SET = { sens: 1, dz: 0.15, smooth: 0.25, mode: 'joystick', shake: true, hitbox: false, music: 0.5, sfx: 0.7, textSpd: 1, gspd: 1, calmFx: false, hiCon: false, bind: {}, diff: 'normal', haptic: true, cap60: false, cvd: 'off', holdOk: false };
const DEF_META = () => ({ endings: {}, rushBest: null, rushWins: 0, deaths: 0, seen: {}, merWins: 0, runs: 0 });
function load(key, def) { try { const v = JSON.parse(localStorage.getItem(key)); return v ? Object.assign(def, v) : def; } catch (e) { return def; } }
function store(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {} }
// settings carry over from the original MERIDIAN boss fight if present
const settings = load(LS_SET, load('meridian_settings_v1', Object.assign({}, DEF_SET)));
if (settings.textSpd == null) settings.textSpd = 1;
let meta = load(LS_META, DEF_META());
const saveSettings = () => store(LS_SET, settings);
const saveMeta = () => store(LS_META, meta);

/* ===================== AUDIO (WebAudio synth) ===================== */
const AU = { ctx: null, mus: null, sfx: null, noise: null, next: 0, step: 0, track: null, name: '', timer: null, duck: 1 };
function audioInit() {
  if (AU.ctx) { if (AU.ctx.state === 'suspended') AU.ctx.resume(); return; }
  const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
  const c = AU.ctx = new C();
  AU.mus = c.createGain(); AU.sfx = c.createGain();
  const comp = c.createDynamicsCompressor(); AU.mus.connect(comp); AU.sfx.connect(comp); comp.connect(c.destination);
  const buf = c.createBuffer(1, c.sampleRate, c.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  AU.noise = buf; setVolumes();
  AU.next = c.currentTime + 0.1;
  AU.timer = setInterval(musicTick, 25);
}
function setVolumes() { if (!AU.ctx) return; AU.mus.gain.value = settings.music * 0.45; AU.sfx.gain.value = settings.sfx * 0.6; }
function tone(f, t, dur, type, vol, dest, slide) {
  const c = AU.ctx, o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.03);
}
function noise(t, dur, vol, dest, hp) {
  const c = AU.ctx, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
  s.buffer = AU.noise; f.type = 'highpass'; f.frequency.value = hp;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(dest); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
}
function revTone(f, t, dur, type, vol, dest, slide) { // swells in and cuts off: sounds 'played backwards'
  const c = AU.ctx, o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur); g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.012);
  o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.03);
}
function revNoise(t, dur, vol, dest, hp) { const c = AU.ctx, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = AU.noise; f.type = 'bandpass'; f.frequency.setValueAtTime(400, t); f.frequency.exponentialRampToValueAtTime(hp, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur); g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.01); s.connect(f); f.connect(g); g.connect(dest); s.start(t, Math.random() * 0.3); s.stop(t + dur + 0.03); }
const sfxLast = {};
function sfx(name, p) {
  if (!AU.ctx || settings.sfx <= 0) return;
  const c = AU.ctx, t = c.currentTime, D = AU.sfx;
  if (sfxLast[name] && t - sfxLast[name] < 0.04) return; sfxLast[name] = t;
  switch (name) {
    case 'hit': tone(320, t, 0.25, 'square', 0.35, D, 70); noise(t, 0.18, 0.3, D, 800); break;
    case 'graze': tone(1500, t, 0.05, 'sine', 0.12, D, 1900); break;
    case 'warn': tone(880, t, 0.08, 'sawtooth', 0.12, D); tone(660, t + 0.09, 0.1, 'sawtooth', 0.12, D); break;
    case 'phase': [0, 4, 7, 12, 16].forEach((n, i) => tone(330 * Math.pow(2, n / 12), t + i * 0.07, 0.3, 'square', 0.15, D)); noise(t, 0.6, 0.15, D, 3000); break;
    case 'blip': tone((p || 520) * (0.97 + Math.random() * 0.06), t, 0.035, 'square', 0.05, D); break;
    case 'move': tone(440, t, 0.04, 'square', 0.07, D, 520); break;
    case 'select': tone(660, t, 0.06, 'square', 0.12, D, 990); break;
    case 'back': tone(500, t, 0.06, 'square', 0.1, D, 330); break;
    case 'clear': tone(500, t, 0.15, 'triangle', 0.2, D, 1000); break;
    case 'bosshurt': tone(180, t, 0.3, 'sawtooth', 0.2, D, 60); break;
    case 'slash': noise(t, 0.25, 0.35, D, 2500); tone(900, t, 0.2, 'sawtooth', 0.12, D, 200); break;
    case 'crit': [0, 7, 12].forEach((n, i) => tone(660 * Math.pow(2, n / 12), t + i * 0.04, 0.2, 'square', 0.14, D)); noise(t, 0.3, 0.3, D, 2000); break;
    case 'miss': tone(300, t, 0.15, 'triangle', 0.15, D, 200); break;
    case 'death': tone(440, t, 0.9, 'square', 0.25, D, 40); noise(t, 0.5, 0.3, D, 300); break;
    case 'dust': noise(t, 0.9, 0.3, D, 600); tone(300, t, 0.6, 'triangle', 0.15, D, 50); break;
    case 'spare': [0, 4, 7, 12].forEach((n, i) => tone(523 * Math.pow(2, n / 12), t + i * 0.06, 0.4, 'triangle', 0.14, D)); break;
    case 'flee': [12, 7, 0].forEach((n, i) => tone(523 * Math.pow(2, n / 12), t + i * 0.05, 0.12, 'square', 0.1, D)); break;
    case 'heal': [0, 4, 7, 11, 14].forEach((n, i) => tone(600 * Math.pow(2, n / 12), t + i * 0.05, 0.25, 'sine', 0.13, D)); break;
    case 'buy': tone(1046, t, 0.08, 'square', 0.12, D); tone(1568, t + 0.08, 0.15, 'square', 0.12, D); break;
    case 'save': [0, 7, 12, 16, 19, 24].forEach((n, i) => tone(392 * Math.pow(2, n / 12), t + i * 0.07, 0.5, 'sine', 0.12, D)); break;
    case 'encounter': tone(1200, t, 0.08, 'square', 0.15, D); tone(1200, t + 0.12, 0.08, 'square', 0.15, D); tone(300, t + 0.22, 0.4, 'sawtooth', 0.15, D, 900); break;
    case 'door': tone(220, t, 0.12, 'triangle', 0.2, D, 330); noise(t, 0.1, 0.1, D, 2000); break;
    case 'lvup': [0, 4, 7, 12, 7, 12, 16, 19].forEach((n, i) => tone(523 * Math.pow(2, n / 12), t + i * 0.06, 0.18, 'square', 0.11, D)); break;
    case 'push': noise(t, 0.12, 0.2, D, 300); tone(90, t, 0.1, 'sine', 0.3, D, 60); break;
    case 'puzzle': [0, 5, 9, 12, 17].forEach((n, i) => tone(440 * Math.pow(2, n / 12), t + i * 0.09, 0.4, 'triangle', 0.14, D)); break;
    case 'wrong': tone(200, t, 0.2, 'sawtooth', 0.15, D); tone(150, t + 0.2, 0.3, 'sawtooth', 0.15, D); break;
    case 'light': tone(880, t, 0.25, 'sine', 0.12, D, 1320); break;
    case 'bell': [523, 659, 784, 1046].forEach((f, i) => tone(f, t + i * 0.02, 2.5, 'sine', 0.18, D)); break;
    case 'bigbell': [131, 262, 330, 392, 523].forEach((f, i) => tone(f, t + i * 0.01, 5, 'sine', 0.2, D)); noise(t, 1.5, 0.15, D, 3000); break;
    case 'shatter': noise(t, 1.2, 0.4, D, 1200); tone(200, t, 1, 'square', 0.15, D, 30); break;
    case 'jump': tone(300, t, 0.08, 'triangle', 0.1, D, 600); break;
    case 'step': noise(t, 0.03, 0.05, D, 3000); break;
    case 'freeze': [1568, 1175, 880, 659, 440].forEach((f2, i) => tone(f2, t + i * 0.05, 0.6, 'sine', 0.12, D, f2 * 0.98)); noise(t, 0.5, 0.2, D, 5000); tone(80, t, 0.5, 'sine', 0.4, D, 30); break;
    case 'rewind': revTone(220 + Math.random() * 60, t, 0.14, 'sawtooth', 0.09, D, 900); revNoise(t, 0.14, 0.12, D, 3000); break;
    case 'resume': [0, 7, 12, 19, 24].forEach((n, i) => tone(196 * Math.pow(2, n / 12), t + i * 0.012, 0.7, 'square', 0.13, D)); noise(t, 0.5, 0.45, D, 400); tone(150, t, 0.4, 'sine', 0.7, D, 35); break;
    case 'ff': tone(900, t, 0.06, 'square', 0.08, D, 1800); break;
    case 'tick': tone(1800, t, 0.03, 'square', 0.12, D); noise(t, 0.02, 0.15, D, 6000); break;
    case 'tock': tone(1200, t, 0.04, 'square', 0.12, D); noise(t, 0.02, 0.15, D, 4000); break;
    case 'item': tone(784, t, 0.1, 'square', 0.12, D); tone(1046, t + 0.1, 0.2, 'square', 0.12, D); break;
  }
}
/* Music: step sequencer. Values are semitones over root; null = rest. */
const _ = null;
const TRACKS = {
  title: { bpm: 84, root: 45, bass: [0, _, _, _, 7, _, _, _, 3, _, _, _, 5, _, 2, _], lead: [12, _, 15, _, 19, _, 15, _, 14, _, 17, _, 15, _, 12, _], lt: 'square', kick: 0, hat: 0 },
  rust: { bpm: 96, root: 50, bass: [0, _, 7, _, 0, _, 7, _, -2, _, 5, _, -2, _, 5, _], lead: [12, _, 14, 15, _, 19, _, 17, 15, _, 14, _, 10, _, 12, _, 12, _, 14, 15, _, 19, _, 22, 21, _, 19, _, 17, _, 15, _], lt: 'triangle', lv: 0.12, kick: 0, hat: 1 },
  town: { bpm: 112, root: 53, bass: [0, _, 12, _, 5, _, 17, _, 7, _, 19, _, 5, _, 4, _], lead: [12, 16, 19, _, 17, 16, 14, _, 12, _, 14, 16, 12, _, 7, _, 9, 12, 17, _, 16, 14, 12, _, 11, _, 14, _, 12, _, _, _], lt: 'square', lv: 0.06, kick: 1, hat: 1 },
  shop: { bpm: 100, root: 57, bass: [0, _, 7, _, 5, _, 7, _], lead: [12, 14, 16, 19, 16, _, 14, _, 12, 14, 16, 12, 9, _, _, _], lt: 'triangle', lv: 0.1, kick: 0, hat: 1 },
  cog: { bpm: 122, root: 45, bass: [0, 0, 12, 0, 0, 12, 0, 10, 0, 0, 12, 0, 3, 5, 7, 10], bt: 'square', lead: [_, _, 15, _, _, 15, 17, _, _, _, 19, _, 17, 15, 12, _], lt: 'sawtooth', lv: 0.045, kick: 1, hat: 1 },
  tower: { bpm: 80, root: 47, bass: [0, _, _, _, _, _, _, _, -4, _, _, _, -2, _, _, _], lead: [12, _, _, 15, _, 14, _, _, 11, _, _, 12, _, 7, _, _, 12, _, _, 15, _, 19, _, 18, 17, _, 15, _, 14, _, _, _], lt: 'sine', lv: 0.14, kick: 0, hat: 0 },
  belfry: { bpm: 70, root: 45, bass: [0, _, _, _, _, _, _, _, 1, _, _, _, _, _, _, _], lead: [24, _, _, _, 19, _, _, _, 25, _, _, _, 18, _, _, _], lt: 'sine', lv: 0.1, kick: 0, hat: 0 },
  battle: { bpm: 136, root: 50, bass: [0, _, 0, 12, _, 0, 10, _, 0, _, 0, 12, _, 7, 10, _, 5, _, 5, 17, _, 5, 15, _, 7, _, 7, 19, _, 10, 7, _], lead: [12, 15, 17, _, 19, _, 17, 15, 22, _, 19, _, 17, 15, 12, _, 17, 20, 22, _, 24, _, 22, 20, 19, _, 22, _, 26, _, 24, _], lt: 'square', lv: 0.06, kick: 1, hat: 1 },
  wick: { bpm: 126, root: 48, bass: [0, _, 0, 7, _, 7, 3, _, 5, _, 5, 12, _, 3, 2, _], lead: [12, _, 15, _, 19, 20, 19, _, 17, 15, _, 14, 15, _, 12, _, 24, _, 22, _, 20, _, 19, _, 17, 19, 20, _, 19, _, 15, _], lt: 'square', lv: 0.07, kick: 1, hat: 1 },
  grit: { bpm: 146, root: 41, bass: [0, 0, 12, 0, 0, 12, 0, 12, 3, 3, 15, 3, 5, 5, 17, 6], bt: 'sawtooth', lead: [24, _, 22, 24, _, 27, _, 24, 22, _, 19, _, 17, 19, 22, _], lt: 'square', lv: 0.06, kick: 2, hat: 1 },
  cuckoo: { bpm: 150, root: 52, bass: [0, _, _, 7, _, _, 5, _, _, 7, _, _], lead: [12, 16, 19, 24, _, 23, 21, _, 19, 17, _, 16, 14, 17, 21, 26, _, 24, 23, _, 21, 19, _, 17], lt: 'triangle', lv: 0.12, kick: 1, hat: 0 },
  m1: { bpm: 104, root: 50, bass: [0, _, 0, 12, _, 0, 10, _, 0, _, 0, 12, _, 7, 10, _], lead: [12, 15, 17, 15, 19, _, 17, 15, 12, _, 10, 12, 15, _, _, _], lt: 'square', kick: 1, hat: 0 },
  m2: { bpm: 118, root: 43, bass: [0, 0, _, 0, 3, _, 0, _, 0, 0, _, 0, 6, _, 5, 3], lead: [_, 15, _, 15, 18, _, 15, 13, _, 15, _, 22, 20, _, 18, _], lt: 'square', kick: 1, hat: 1 },
  m3: { bpm: 128, root: 47, bass: [0, 12, 0, 11, 0, 12, 0, 10, 0, 12, 0, 8, 0, 7, 6, 5], lead: [24, _, 23, 24, _, 20, _, 19, 24, _, 23, 24, 27, _, 26, _], lt: 'square', kick: 1, hat: 1 },
  m4: { bpm: 140, root: 44, bass: [0, _, 0, 0, 12, _, 0, 0, 3, _, 3, 3, 15, _, 2, 2], lead: [12, 19, 24, 19, 15, 22, 27, 22, 14, 21, 26, 21, 17, 24, 29, 24], lt: 'square', kick: 1, hat: 1 },
  m5: { bpm: 160, root: 45, bass: [0, 0, 12, 0, 1, 1, 13, 1, 0, 0, 12, 0, 7, 6, 5, 3], lead: [24, 27, 31, 36, 24, 27, 31, 37, 24, 27, 31, 36, 34, 31, 30, 27], lt: 'square', kick: 2, hat: 1 },
  good: { bpm: 76, root: 48, bass: [0, _, _, _, 7, _, _, _, 9, _, _, _, 5, _, _, _], lead: [16, _, 19, _, 24, _, 23, _, 21, _, 19, _, 17, _, 19, _, 16, _, 14, _, 12, _, 14, _, 16, _, 17, _, 19, _, _, _], lt: 'triangle', lv: 0.14, kick: 0, hat: 0 },
  bad: { bpm: 58, root: 38, bass: [0, _, _, _, _, _, _, _, 1, _, _, _, _, _, _, _], lead: [_, _, _, _, 13, _, _, _, _, _, _, _, 12, _, _, _], lt: 'sine', lv: 0.1, kick: 0, hat: 0 },
  silent: { bpm: 60, root: 40, bass: [_], lead: [_], kick: 0, hat: 0 },
  vesper: { bpm: 64, root: 57, bass: [0, _, _, _, _, _, _, _, -5, _, _, _, _, _, _, _, -3, _, _, _, _, _, _, _, -7, _, _, _, _, _, _, _], bt: 'sine', lead: [24, _, 28, _, 31, _, 28, 26, _, 24, _, _, 19, _, _, _, 21, _, 24, _, 28, _, 26, _, 24, _, 23, _, 24, _, _, _], lt: 'sine', lv: 0.05, kick: 0, hat: 0 },
  mop: { bpm: 118, root: 55, bass: [0, _, 7, _, 0, _, 7, _, 5, _, 12, _, 7, _, 2, _], lead: [12, _, 11, 12, _, 16, 14, _, 12, _, _, 7, 9, _, 11, _], lt: 'triangle', lv: 0.1, kick: 1, hat: 0 },
};
const midi = n => 440 * Math.pow(2, (n - 69) / 12);
let musicPaused = false;
function musicTick() {
  const c = AU.ctx; if (!c || !AU.track) return;
  if (AU.next < c.currentTime - 0.5) AU.next = c.currentTime + 0.05;
  while (AU.next < c.currentTime + 0.12) {
    const tr = AU.track, t = AU.next, D = AU.mus, s = AU.step;
    if (settings.music > 0 && !musicPaused) {
      const b = tr.bass[s % tr.bass.length]; if (b != null) tone(midi(tr.root + b - 12), t, 0.2, tr.bt || 'triangle', tr.bt ? 0.12 : 0.33, D);
      const l = tr.lead[s % tr.lead.length]; if (l != null) tone(midi(tr.root + l) * (tr.detune ? 1 + (Math.random() - 0.5) * tr.detune : 1), t, tr.lt === 'sine' || tr.lt === 'triangle' ? 0.3 : 0.12, tr.lt || 'square', tr.lv || 0.07, D);
      if (tr.ctr) { const q = tr.ctr[s % tr.ctr.length]; if (q != null) tone(midi(tr.root + q), t, 0.6, 'sine', tr.cv || 0.035, D); } // c7: optional quiet countermelody layer
      const i = s % 16;
      if (tr.kick && i % 4 === 0) tone(150, t, 0.15, 'sine', 0.5, D, 40);
      if (tr.kick === 2 && i % 4 === 2) tone(150, t, 0.1, 'sine', 0.3, D, 40);
      if (tr.hat && i % 2 === 1) noise(t, 0.03, 0.07, D, 7000);
      if (tr.hat && tr.kick && i % 8 === 4) noise(t, 0.12, 0.13, D, 1500);
      if (window.hhMusicExtras) hhMusicExtras(tr, t, s); // Greg layers: undercroft / fileflit / archivist
    }
    AU.next += 60 / tr.bpm / 4; AU.step++;
  }
}
// music-box arrangements of a theme: 'warm' (spared: slowed, gentle, an octave up) or 'broken' (killed: sparse, detuned)
function variantTrack(name, kind) {
  const key = name + '_' + kind; if (TRACKS[key]) return key; const t = TRACKS[name]; if (!t) return name;
  const v = { bpm: Math.round(t.bpm * (kind === 'warm' ? 0.55 : 0.45)), root: t.root, kick: 0, hat: 0, lt: kind === 'warm' ? 'triangle' : 'sine', lv: kind === 'warm' ? 0.07 : 0.06, bt: 'sine',
    lead: t.lead.map((n, i) => n == null ? null : kind === 'broken' && (i % 3 === 1 || i % 5 === 3) ? null : n + 12), bass: t.bass.map((n, i) => i % 4 === 0 ? n : null), detune: kind === 'broken' ? 0.035 : 0 };
  TRACKS[key] = v; return key;
}
function setTrack(name) { if (AU.name === name) return; AU.name = name; AU.track = TRACKS[name] || TRACKS.silent; AU.step = 0; }

/* ===================== INPUT ===================== */
// keyboard -> held keys + one-shot actions; pointer -> taps, floating joystick, focus touches
const keys = {}, actions = new Set(), taps = [];
const touch = { joy: null, drag: null, focusIds: new Set(), seen: false, dragDX: 0, dragDY: 0, aHeld: false };
const view = { scale: 1, ox: 0, oy: 0, dpr: 1 };
const toLogical = (cx, cy) => ({ x: (cx - view.ox) / view.scale, y: (cy - view.oy) / view.scale });
const KEYMAP = { ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
  KeyZ: 'ok', Enter: 'ok', Space: 'ok', KeyX: 'back', Backspace: 'back', ShiftLeft: 'back', ShiftRight: 'back', KeyC: 'menu', Escape: 'menu', KeyP: 'menu', Tab: 'menu' };
const JOY_R = 62;
const PAUSE_BTN = { x: W - 58, y: 10, w: 48, h: 48 };
const A_BTN = { x: W - 92, y: H - 96, r: 50 };
const M_BTN = { x: W - 196, y: H - 56, r: 32 };
const FOCUS_BTN = { x: W - 95, y: H - 95, r: 62 };
let uiOpen = false; // a DOM screen has focus
addEventListener('keydown', e => {
  audioInit();
  if (e.target && e.target.type === 'range' && uiOpen && !['ArrowLeft', 'ArrowRight'].includes(e.code)) { domNav(e); return; } /* c13: sliders no longer trap Up/Down/Z/X */
  if (e.target && e.target.tagName === 'INPUT') { if (e.code === 'Enter') { e.preventDefault(); const b = document.querySelector('.screen.on #b-name-ok'); if (b) b.click(); } return; }
  if (uiOpen) { domNav(e); return; }
  if (!keys[e.code]) { const a = KEYMAP[e.code]; if (a) actions.add(a); }
  keys[e.code] = true;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Tab', 'Backspace'].includes(e.code)) e.preventDefault();
});
addEventListener('keyup', e => { keys[e.code] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; autoPause(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) autoPause(); });
addEventListener('pointerdown', audioInit, { capture: true });
addEventListener('touchstart', audioInit, { capture: true, passive: true });
const cv = document.getElementById('c'); let ctx = cv.getContext('2d');
cv.addEventListener('contextmenu', e => e.preventDefault());
cv.addEventListener('pointerdown', e => {
  e.preventDefault();
  if (uiOpen) return;
  const isTouch = e.pointerType !== 'mouse'; if (isTouch) touch.seen = true;
  const p = toLogical(e.clientX, e.clientY);
  if (p.x >= PAUSE_BTN.x - 10 && p.y <= PAUSE_BTN.y + PAUSE_BTN.h + 10 && canPause()) { actions.add('menu'); return; }
  const dodge = inDodge();
  if (isTouch && dodge) {
    const fd = Math.hypot(p.x - FOCUS_BTN.x, p.y - FOCUS_BTN.y);
    if (settings.mode === 'drag') {
      if (fd < FOCUS_BTN.r) touch.focusIds.add(e.pointerId);
      else if (!touch.drag) touch.drag = { id: e.pointerId, x: p.x, y: p.y, baseY: p.y };
    } else {
      if (p.x < W * 0.6 && !touch.joy) touch.joy = { id: e.pointerId, bx: p.x, by: p.y, cx: p.x, cy: p.y };
      else touch.focusIds.add(e.pointerId);
    }
    taps.push({ x: p.x, y: p.y, id: e.pointerId });
  } else if (isTouch && state === 'world' && !dialogOpen()) {
    if (Math.hypot(p.x - A_BTN.x, p.y - A_BTN.y) < A_BTN.r + 12) { actions.add('ok'); touch.aHeld = true; }
    else if (Math.hypot(p.x - M_BTN.x, p.y - M_BTN.y) < M_BTN.r + 12) actions.add('menu');
    else if (!touch.joy && p.x < W * 0.62) touch.joy = { id: e.pointerId, bx: p.x, by: p.y, cx: p.x, cy: p.y };
    else taps.push({ x: p.x, y: p.y, id: e.pointerId });
  } else taps.push({ x: p.x, y: p.y, id: e.pointerId });
  try { cv.setPointerCapture(e.pointerId); } catch (_) {}
});
cv.addEventListener('pointermove', e => {
  const p = toLogical(e.clientX, e.clientY);
  if (touch.joy && touch.joy.id === e.pointerId) {
    const j = touch.joy; j.cx = p.x; j.cy = p.y;
    const dx = j.cx - j.bx, dy = j.cy - j.by, m = Math.hypot(dx, dy), lim = JOY_R * 1.6;
    if (m > lim) { j.bx = j.cx - dx / m * lim; j.by = j.cy - dy / m * lim; }
  }
  if (touch.drag && touch.drag.id === e.pointerId) {
    const d = touch.drag; touch.dragDX += p.x - d.x; touch.dragDY += p.y - d.y; d.x = p.x; d.y = p.y;
    if (p.y > d.baseY) d.baseY = p.y;
  }
});
function endPointer(e) {
  if (touch.joy && touch.joy.id === e.pointerId) touch.joy = null;
  if (touch.drag && touch.drag.id === e.pointerId) touch.drag = null;
  touch.focusIds.delete(e.pointerId); touch.aHeld = false;
}
cv.addEventListener('pointerup', endPointer); cv.addEventListener('pointercancel', endPointer);
function resetTouch() { touch.joy = null; touch.drag = null; touch.focusIds.clear(); touch.dragDX = touch.dragDY = 0; actions.clear(); taps.length = 0; }
const act = a => { if (actions.has(a)) { actions.delete(a); return true; } return false; };
function takeTap(test) { for (let i = 0; i < taps.length; i++) if (!test || test(taps[i])) { const t = taps[i]; taps.splice(i, 1); return t; } return null; }
function readInput() {
  if (window.__botIn) return window.__botIn; // test hook (scripted dodge bot)
  let x = (keys.ArrowRight || keys.KeyD ? 1 : 0) - (keys.ArrowLeft || keys.KeyA ? 1 : 0);
  let y = (keys.ArrowDown || keys.KeyS ? 1 : 0) - (keys.ArrowUp || keys.KeyW ? 1 : 0);
  if (x && y) { x *= Math.SQRT1_2; y *= Math.SQRT1_2; }
  let up = !!(keys.ArrowUp || keys.KeyW || keys.Space);
  if (touch.joy) {
    const j = touch.joy; let dx = (j.cx - j.bx) / JOY_R, dy = (j.cy - j.by) / JOY_R; const m = Math.hypot(dx, dy);
    if (m < settings.dz || m === 0) { dx = dy = 0; } else { const k = clamp((m - settings.dz) / (1 - settings.dz), 0, 1) / m; dx *= k; dy *= k; }
    x = dx; y = dy; if (dy < -0.45) up = true;
  }
  if (touch.drag && touch.drag.baseY - touch.drag.y > 22) up = true;
  const focus = !!(keys.ShiftLeft || keys.ShiftRight) || touch.focusIds.size > 0;
  return { x, y, focus, up };
}
