/* ===== v1.7-c9 · Boss difficulty pass + banner removal =====
   Bosses run their attack clock (runner + bullets) faster than real time, like MERIDIAN OVERCLOCK (HYPER 1.6).
   The player's soul keeps normal speed. Regular enemies stay at 1. Second forms get +0.05.
   Banners are gone (the draw needs window.HH_BANNERS). Phase changes call hhPhaseStinger via hhSting. */
const BOSS_TS = { wicklow: 1.4, grit: 1.45, cuckoo: 1.5, bilgewater: 1.6, lockkeeper: 1.65, quill: 1.7, meridian: 1.75 };
function hhDiffDmg() { return settings.diff === 'story' ? 0.5 : settings.diff === 'clock' ? 1.25 : 1; }
function hhTS(b) { if (!b) return 1; if (b.opts && b.opts.ts) return b.opts.ts; if (settings.diff === 'clock' && BOSS_TS[b.id] && !(b.pendingDef && b.pendingDef.noClk)) return hhTS0(b) + 0.1; return hhTS0(b); }
function hhTS0(b) {
  const base = BOSS_TS[b.id]; if (!base) return 1; const df = b.pendingDef; if (df && df.ts) return df.ts; return base + (b.e && b.e.form2 ? 0.05 : 0); }
function hhSting(id, p) { try { if (window.hhPhaseStinger) hhPhaseStinger(id, p); } catch (e) {} if (window.__hhStings) __hhStings.push([id, p]); }
/* bosses with no phase change: a stinger once at half HP or half calm */
{ const _et = enemyTurn; enemyTurn = async function (b) {
    if (b && !b.opts.practice && !b._half && ['mopsley', 'wicklow', 'cuckoo'].includes(b.id) && (b.hp <= b.maxhp / 2 || b.calm >= 50)) { b._half = true; hhSting(b.id, 2); }
    return _et.apply(this, arguments); }; }
/* per-attack clock, from the c9 sweep (pwtools patbot, /workspace/c9/*.log). Attacks not listed use the boss base. */
{ const T = { waxLance: 1.35, emberFall: 1.35, drillBits: 1.2, theRules: 1.2, overtime: 1.0, encore: 1.0, featherStorm: 1.2, medley: 1.2, grandFinale: 1.0,
    redaction: 1.5, quillStroke: 1.5, yourRecord: 1.2 };
  for (const k in T) if (A[k]) A[k].ts = T[k];
  const M = { 0: 1.0, 1: 1.0, 2: 1.0, 4: 1.2, 5: 1.2, 6: 1.2, 8: 1.0, 9: 1.0, 10: 1.2, 12: 1.0, 13: 1.0, 14: 1.0 };
  for (const i in M) if (MER_ATTACKS[i]) MER_ATTACKS[i].ts = M[i];
  for (const c of MER_CHAIN) if (c) c.ts = 1.0; /* combo follow-ups keep the shipped clock */ }
/* c17: Clockwork holds. These attacks took more bot hits with the +0.1 Clockwork clock than on Normal (c9 patbot, clock_*.log), so on Clockwork they keep their Normal clock (they still deal +25% damage). */
for (const k of ['conveyor', 'rivetRain', 'highNote', 'inkLines']) if (A[k]) A[k].noClk = true;
for (const i of [1, 3, 9, 10, 13, 14, 15]) if (MER_ATTACKS[i]) MER_ATTACKS[i].noClk = true;
