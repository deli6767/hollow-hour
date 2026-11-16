/* ===== M1-D6 · FOREMAN GRIT second form: "SECOND SHIFT" =====
   Flag default ON since v1.4 (disable: localStorage hh_feat_grit2='0'). Enable: localStorage hh_feat_grit2 = '1' or FEAT.grit2 = true.
   Trigger (enemy turn, real fights only): HP <= 50% while NOT fully calm. v1.6-c3 (DIRECTOR NOTE #2): fully calming
   him in form 1 skips SECOND SHIFT entirely and lets you spare him on the spot (pacifist reward, flag grit_calm1). b.id stays 'grit', so all
   existing flags (spared_grit / killed_grit / grit_done) keep working unchanged. */
const FEAT = (typeof window !== 'undefined' && window.FEAT) || {};
if (FEAT.grit2 === undefined) FEAT.grit2 = true; // v1.4: ON by default (D6 stage 5 signed off). Kill switch: localStorage hh_feat_grit2='0'
try { const v = localStorage.getItem('hh_feat_grit2'); if (v === '1') FEAT.grit2 = true; else if (v === '0') FEAT.grit2 = false; } catch (e) {}
if (typeof window !== 'undefined') window.FEAT = FEAT;
TRACKS.grit2 = Object.assign({}, TRACKS.grit, { bpm: 164, bt: 'square', lv: 0.07, kick: 2, hat: 2,
  lead: [24, 24, _, 27, _, 24, 22, _, 29, _, 27, 24, _, 22, 19, _, 24, _, 31, _, 29, 27, _, 24, 22, 24, _, 27, 29, _, 31, _] });
const GRIT2 = Object.assign({}, ENEMIES.grit, {
  name: 'FOREMAN GRIT', title: 'SECOND SHIFT', def: 3, atk: 1.55, d: 1.18, form2: true, track: 'grit2',
  attacks: ['conveyor', 'rivetRain', 'pistonPress'],
  check: 'EDGE 9 · PLATING 4 · nobody authorised a second shift. he authorised it himself.',
  flavor: ['The overtime siren will not stop.', 'Grit\'s time card is smoking.', 'The RULES board has a fourth line now. It\'s still wet.'],
  calm: 'Grit is holding his time card like it might bite him.',
  turns: ['SECOND SHIFT! NOBODY CLOCKS OUT!', 'I wrote a new rule. Just for you.', 'Forty years and nobody ever broke one. NOBODY.', 'Rules are what keep the floor standing, kid!', '...is the floor still standing?'],
  acts: {
    'Show Clock': B => ({ t: ['You point at the wall clock again.', 'Grit doesn\'t look. "I KNOW what it says."'], c: 15, say: 'it says the same thing. it ALWAYS says the same thing.' }),
    'Punch In': B => ({ t: ['You grab a time card and punch in next to him.', 'Grit stares. Nobody has ever joined the second shift.'], c: 25, say: '...you\'re on MY crew now? huh.' }),
  } });
async function gritSecondShift(b) {
  const g = b.g2 = { t: 0, broke4: false, saw4: false };
  clearBullets(true); sfx('phase'); shake(10, 0.6); b.flash = 0.6; setTrack('grit2');
  hhSting('grit', 2);
  const wasCalm = b.calm >= 100;
  await bTalk(b, wasCalm ? ['...no. NO. you almost had me clocking out.', 'the shift ENDS at midnight. midnight never comes. so the shift NEVER ENDS!', 'SECOND SHIFT, KID. NEW RULES.'] : ['HAH! you think a few dents stop a FOREMAN?', 'forty years on this floor! i don\'t STOP!', 'SECOND SHIFT, KID. NEW RULES.']);
  b.e = GRIT2; b.turn = 0; { const h = Math.min(5, maxGlow(hero) - hero.glow); if (h > 0) { hero.glow += h; b.glowFlash = 0.5; } } b.calm = wasCalm ? 40 : Math.round(b.calm * 0.4);
  if (!alive(b)) return;
  await bMsg(b, 'Grit tears his overalls open. Underneath: another, older pair of overalls.');
}
const _enemyTurnD5 = enemyTurn;
enemyTurn = async function (b) {
  if (b && b.id === 'grit' && FEAT.grit2 && !b.g2 && !b.opts.practice && !b.opts.rush && b.hp <= b.maxhp * 0.5 && b.calm < 100) {
    await gritSecondShift(b); if (!alive(b)) return;
  }
  return _enemyTurnD5(b);
};
const _artGrit = ART.grit;
ART.grit = (x, y, t, s) => {
  const f2 = typeof B !== 'undefined' && B && B.g2;
  if (!f2) return _artGrit(x, y, t, s);
  ctx.save(); ctx.filter = 'saturate(1.6) hue-rotate(-18deg) brightness(1.05)'; _artGrit(x, y + Math.sin(t * 9) * 1.5, t * 1.4, s); ctx.restore();
  // overtime siren on the hard hat
  ctx.save(); ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 10); circ(x, y - 128, 9, '#ff4455'); ctx.restore();
};
/* ---- D6 stage 2: second-shift attacks (each telegraphed; bot-verified in stage 5) ---- */
// OVERTIME STAMP: the box is 5 time-card columns. 3 get a stamp (column flashes 0.75 s first), 2 stay clear;
// your own column or its neighbour is always one of the clear ones (the first stamp always spares your own column).
A.overtime = { name: 'Overtime Stamp', dur: 8, size: [300, 190], desc: 'the time-card stamp comes down on 3 of 5 columns',
  run(S) { const N = 5, cw = () => arena.w / N, cx = i => -hw() + (i + 0.5) * cw();
    S.every(0.9 / S.d, n0 => { const me = clamp(Math.floor((P.x + hw()) / cw()), 0, N - 1);
      const safe = new Set([me + (n0 === 0 || Math.random() < 0.5 ? 0 : (me === 0 ? 1 : me === N - 1 ? -1 : (Math.random() < 0.5 ? -1 : 1)))]);
      while (safe.size < 2) safe.add(irand(0, N - 1)); sfx('warn');
      for (let i = 0; i < N; i++) if (!safe.has(i)) zone(cx(i), 0, cw() - 6, arena.h + 2, 0.85, 0.22, { col: '#e8a030' }); }, 0.3, 7.2);
    S.every(0.9 / S.d, n => { if (n % 2 || n % 3 === 0) shot(-hw() - 8, rand(-hh() + 10, hh() - 10), 120, 0, 4, '#ccc'); }, 0.95, 7.0); } };
// QUOTA: crates ride in on alternating belts with one gap that drifts gently; rivets drip from above.
A.quota = { name: 'Quota', dur: 8, size: [300, 190], desc: 'crates on the belt, all one way. meet the quota, or get out of the way',
  run(S) { let gy = 0;
    S.every(0.6 / S.d, n => { const side = n % 2; gy = clamp(gy + rand(-44, 44), -hh() + 34, hh() - 34);
      wallPair(-hw() - 10, 185 * S.d, gy, 32, side ? '#b07840' : '#c89050'); }, 0.2, 7);
    S.every(0.95, () => shot(rand(-hw() + 10, hw() - 10), -hh() - 8, 0, 95, 4, '#e8a030'), 0.8, 7.4); } };
// RULE 4 (finale): "NEVER CROSS THE LINE". A press plate slides in from the side you are on and holds against the line,
// so the only safe floor is across it. The plate is visible (0.8 s outline) before it moves, and moves at walking pace.
// Crossing the line counts as breaking RULE 4 (b.g2.broke4). Nothing ever flips your controls.
A.rule4 = { name: 'Rule 4', dur: 10.2, size: [300, 190], desc: 'RULE 4: NEVER CROSS THE LINE. (the press disagrees.)', rule4: true,
  run(S) { let lastSide = -1, crossed = 0;
    S.at(0, () => { S.rule = 'RULE 4: NEVER CROSS THE LINE'; sfx('warn'); shake(3, 0.15); P.x = -hw() / 2; tele(0, 0, Math.PI / 2, 5, 10.1, { col: '#ffe14a' }); });
    const plate = (t0, hold) => S.at(t0, () => { const side = P.x < 0 ? -1 : 1, w = hw(), start = side * (hw() + w / 2), stop = side * (w / 2 + 2), v = 150;
      sfx('warn'); shake(3, 0.2);
      bar(start, 0, w, arena.h + 4, 0, 0, '#c08850', { warn: 0.8, life: hold, noCull: true, dmg: 5,
        fn: (b) => { const m = Math.max(0, b.age - 0.8); b.x = side < 0 ? Math.min(stop, start + v * m) : Math.max(stop, start - v * m); b.vx = 0;
          if (b.age > hold - 0.7) b.x += side * (b.age - (hold - 0.7)) * 300; } }); });
    plate(1.0, 4.4); plate(5.4, 4.5);
    S.every(0.26 / S.d, () => shot(rand(-hw(), hw()), -hh() - 8, 0, 145, 3.5, '#ccc'), 0.6, 9.6);
    return (t) => { const side = P.x < -3 ? -1 : P.x > 3 ? 1 : lastSide;
      if (side !== lastSide && t > 0.1 && t < 10) { crossed++; if (B && B.g2) { B.g2.broke4 = (B.g2.broke4 || 0) + 1; } S.rule = 'RULE 4: NEVER CROSS THE LINE  ✗ BROKEN' + (crossed > 1 ? ' ×' + crossed : ''); sfx('warn'); shake(4, 0.2); }
      lastSide = side; if (t > 10) S.rule = null; }; } };
A.overtime.id = 'overtime'; A.quota.id = 'quota'; A.rule4.id = 'rule4';
GRIT2.attacks = ['overtime', 'quota', 'rule4'];
/* ---- D6 stage 3: second-shift ACT / SPARE ----
   Peaceful path: Punch In (join his crew) and Show Clock work, but the real key is RULE 4. Once you've crossed the line
   in his finale, a new ACT appears: "Tear Up Rule 4". Work Hard now backfires (he's already overworked). */
Object.assign(GRIT2.acts, {
  'Punch In': B => B.n('Punch In') ? ({ t: ['You punch in again.', 'Grit: "you\'re already on the clock, kid. that\'s the problem."'], c: 5, say: 'one card per worker. RULES.' })
    : ({ t: ['You grab a time card and punch in next to him.', 'Grit stares. Nobody has ever joined the second shift.'], c: 25, say: '...you\'re on MY crew now? huh.' }),
  'Work Hard': B => ({ t: ['You hammer something with great enthusiasm.', 'Grit\'s eye twitches. "MORE. FASTER. NO BREAKS."', 'That made it worse.'], c: -10, say: 'FASTER! FASTER! ...why am i shouting.' }),
  'Tear Up Rule 4': B => ({ t: ['You walk to the RULES board and tear RULE 4 off.', 'The floor does not fall in.', 'Grit watches the scrap of paper land. "...you crossed it. twice. and nothing happened."'], c: 60, say: 'forty years. i thought the floor would fall in.' }),
});
GRIT2.actIf = { 'Tear Up Rule 4': b => !!(b.g2 && b.g2.broke4) && !b.n('Tear Up Rule 4') };
Object.defineProperty(GRIT2, 'spare', { get() { const b = typeof B !== 'undefined' && B;
  return b && b.n && b.n('Tear Up Rule 4') ? 'Grit takes the RULES board off the wall and props it against a pipe, face down. "Clocking out. For real this time. ...Kid? Thanks for breaking it."'
    : 'Grit punches his own time card. It takes three tries. "Clocking out. Wake me at midnight, kid."'; } });
GRIT2.kill = 'Grit\'s drill winds down mid-shift. The overtime siren keeps going for a while after.';
const _doSpareD5 = doSpare;
doSpare = async function (b) { if (b && b.g2 && b.n('Tear Up Rule 4') && !b.opts.rush) hero.flags.grit_rule4 = true; return _doSpareD5(b); };

/* v1.6-c3: form-1 full-calm spare (pacifist reward) */
const _doSpareC3 = doSpare;
const GRIT_CALM1_PRE = ['Grit looks at the wall clock. Then at you. Then at the clock again.', '"...you know what? the floor can run itself for one night."'];
const GRIT_CALM1_SPARE = 'Grit hangs his hard hat on the RULES board. The fourth line never gets written.';
doSpare = async function (b) {
  if (b && b.id === 'grit' && !b.g2 && b.calm >= 100) {
    if (!b.opts.rush && !b.opts.practice) hero.flags.grit_calm1 = true;
    await bMsg(b, GRIT_CALM1_PRE); if (!alive(b)) return;
    b.e = Object.assign({}, b.e, { spare: GRIT_CALM1_SPARE });
  }
  return _doSpareC3(b);
};
