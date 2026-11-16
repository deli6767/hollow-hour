/* ===================== CHAPTER 4 · THE UNDERCROFT slice 2 (chunk P, v1.7-c6) =====================
   Hall of Filed Clocks west wall opens (rows 6-9, 4-tile doorway; the "CLOSED FOR FILING" grille is now propped open)
   -> The Stacks (aisles of shelves, roamers enc 'under2' pop 3: new FILEFLIT + metronoma) -> The Reading Room
   (save chime, lectern "YOUR RECORD, VOL. 1", Archivist's door north = sealed until the Quill chunk).
   Stacks shelves file side-quest outcomes (QUESTS done/active/unstarted). Optional wing, not on any route.
   New enemy FILEFLIT (index card with wings): attacks 'cardFile' (rows of cards slide across, one gap row that only
   moves one row at a time) and 'stampDown' (rubber-stamp squares with 0.8 s shadows, never more than 3, never all rows). */
{ const R = ROOMS.under2, m = R.map; for (const y of [6, 7, 8, 9]) m[y] = '.' + m[y].slice(1); R.exits.push({ x: 0, y: 6, w: 1, h: 4, to: 'under3', tx: 28, ty: 7 });
  const g = R.ents.find(e => e.look === 'ucshut'); if (g) { g.x = 2; g.y = 5; g.run = async () => say('', 'The grille is propped open with a very large book: "RULES FOR CLOSING THINGS, VOL. 9".', 'The scratching pen is louder now. It\'s further in.'); } }
ENC_TABLE.under2 = ['fileflit', 'metronoma']; AREA_POP.under2 = 3; AREA_NAME.under2 = 'The Undercroft';
A.cardFile = { name: 'Card File', dur: 6.5, size: [270, 180], desc: 'one wave of index cards at a time slides across; two rows stay empty and always share one row with the last wave',
  run(S) { const rows = 5, rh = arena.h / rows; let gap = 1;
    S.every(1.6 / S.d, n => { if (n) gap = Math.max(0, Math.min(rows - 2, gap + (Math.random() < 0.5 ? -1 : 1))); const dir = n % 2 ? -1 : 1;
      for (let r = 0; r < rows; r++) if (r !== gap && r !== gap + 1) bar(-dir * (hw() + 20), -hh() + rh * (r + 0.5), 26, rh - 12, dir * 200 * S.d, 0, '#e8dcc0', { warn: 0.6 }); sfx('warn'); }, 0.3, 5.6); } };
A.stampDown = { name: 'Stamp Down', dur: 6, size: [250, 180], desc: 'rubber stamps thump down where their shadows were; at most 3 at once',
  run(S) { S.every(0.85 / S.d, n => { const P = player, k = 2 + (n % 2);
      for (let i = 0; i < k; i++) { const x = clamp(P.x + rand(-90, 90), -hw() + 25, hw() - 25), y = clamp(P.y + rand(-60, 60), -hh() + 25, hh() - 25);
        zone(x, y, 46, 46, 0.8, 0.25, { col: '#c84a6a' }); } sfx('warn'); }, 0.3, 5.2); } };
ENEMIES.fileflit = { id: 'fileflit', name: 'Fileflit', hp: 54, def: 2, atk: 1.2, torque: 11, cogs: 14, d: 1.08, attacks: ['cardFile', 'stampDown'], art: 'fileflit', track: 'tidebattle', mini: 0.3,
  check: 'EDGE 6 · PLATING 2 · an index card that learned to fly. it has your name on it. in pencil, for now.',
  intro: 'A Fileflit flutters down from the top shelf!', flavor: ['Fileflit shuffles itself.', 'Fileflit is reading you. Its lips move.', 'There is a coffee ring on Fileflit. It is very ashamed of it.'], calm: 'Fileflit has stopped flapping. It is lying flat, waiting to be read.',
  talk: ['name?', 'name. date. outcome.', 'please don\'t fold me.', 'i am cross-referenced!'],
  acts: {
    'Read It': B => ({ t: ['You read the card. It\'s about you. It\'s mostly accurate.', 'Fileflit glows with the joy of being read.'], c: 30, say: 'READ!!' }),
    'Correct It': B => ({ t: ['You find a mistake and fix it, gently.', B.n('Read It') ? 'Fileflit is thrilled. Nobody ever corrects it kindly.' : 'Fileflit flinches. Who are you to edit it?'], c: B.n('Read It') ? 60 : -10, say: B.n('Read It') ? 'thank you!' : 'HEY. INK.' }),
    'File It': B => ({ t: ['You slide Fileflit back into its drawer, between "Y" and "Z".', 'It fits perfectly.'], c: 25, say: 'home...' }),
  }, spare: 'Fileflit slides itself back onto the shelf, filed under "LET GO".', kill: 'Fileflit tears down the middle. The halves are filed separately.' };
ENC_TABLE.under2.length = 0; ENC_TABLE.under2.push('fileflit', 'metronoma');
ART.fileflit = (x, y, t, s) => { const f = Math.sin(t * 9) * 0.5, b = Math.sin(t * 2) * 4, yy = y + b;
  for (const sd of [-1, 1]) poly([x + sd * 22, yy - 6, x + sd * (46 + f * 10), yy - 22 - f * 14, x + sd * 40, yy + 6], '#d8d0e8');
  ctx.fillStyle = '#f4ecd8'; ctx.fillRect(x - 26, yy - 18, 52, 36); ctx.fillStyle = '#c84a6a'; ctx.fillRect(x - 26, yy - 12, 52, 2);
  ctx.fillStyle = '#8a9ab8'; for (let i = 0; i < 3; i++) ctx.fillRect(x - 20, yy - 4 + i * 6, 40 - i * 8, 1.5); eyes(x, yy - 4, 7, 3.5, '#2a2030', blinkAt(t)); };
async function ucShelf(n) { const qs = QUESTS.filter(q => q.chapter === n); if (!qs.length) return say('', `A shelf labelled CHAPTER ${n}. It is empty, and dusted, and waiting.`);
  const lines = qs.map(q => `${q.name}: ${q.done() ? 'FILED, COMPLETE.' : q.stage() ? 'OPEN. (a bookmark sticks out)' : 'NO RECORD.'}`); hero.flags['uc_shelf' + n] = true;
  return say('', `A shelf labelled CHAPTER ${n}. Folders, each with a title.`, ...lines); }
async function ucLectern() { const f = hero.flags, r = route(); f.uc_lectern = true; const coil = hero.coil;
  return say('', 'A heavy book on a lectern, open in the middle. YOUR RECORD, VOL. 1.', `"${hero.name}. COIL ${coil}. Let go of ${hero.spares}. Ended ${hero.kills}."`,
    r === 'peace' ? '"Notes: walks softly. Apologises to furniture."' : r === 'violent' ? '"Notes: the archive has run out of red ink."' : '"Notes: complicated. Most good stories are."',
    'The next page is blank. Then the ink appears, slowly: "VOL. 2 is being written. Please wait outside."'); }
ROOMS.under3 = { name: 'The Stacks', area: 'under2', theme: 'under', track: 'tower', enc: 'under2', map: [
  '##############################',
  '#TTTTTTTTTTTTTTTTTTTTTTTTTTTT#',
  '#............................#',
  '#..TTTT..TTTT..TTTT..TTTT....#',
  '#............................#',
  '#............................#',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '#..TTTT..TTTT..TTTT..TTTT....#',
  '#TTTTTTTTTTTTTTTTTTTTTTTTTTTT#',
  '##############################'],
  exits: [{ x: 29, y: 6, w: 1, h: 4, to: 'under2', tx: 1, ty: 7 }, { x: 0, y: 6, w: 1, h: 4, to: 'under4', tx: 18, ty: 7 }],
  ents: [
    { t: 'thing', look: 'ucshelf', n: 1, x: 4, y: 4, run: async () => ucShelf(1) },
    { t: 'thing', look: 'ucshelf', n: 2, x: 10, y: 4, run: async () => ucShelf(2) },
    { t: 'thing', look: 'ucshelf', n: 3, x: 16, y: 4, run: async () => ucShelf(3) },
    { t: 'thing', look: 'ucshelf', n: 4, x: 22, y: 4, run: async () => ucShelf(4) },
    { t: 'sign', x: 26, y: 4, text: ['THE STACKS · SIDE MATTERS, BY CHAPTER.', '"Small kindnesses are filed with the large ones. The archive does not rank."'] },
  ] };
ROOMS.under4 = { name: 'The Reading Room', area: 'under2', theme: 'under', track: 'tower', map: [
  '####################',
  '#TTTTTTTT....TTTTTT#',
  '#..................#',
  '#..................#',
  '#..................#',
  '#...................',
  '#...................',
  '#...................',
  '#...................',
  '#..,,,,......,,,,..#',
  '#TTTTTTTTTTTTTTTTTT#',
  '####################'],
  exits: [{ x: 19, y: 5, w: 1, h: 4, to: 'under3', tx: 1, ty: 7 }],
  ents: [
    { t: 'gate', x: 9, y: 1, w: 4, h: 1, flag: 'archivist_open', style: 'bars' },
    { t: 'thing', look: 'ucdoor', x: 10, y: 2, walk: true, run: async () => say('', 'A door marked ARCHIVIST. A smaller sign: "DO NOT DISTURB. FILING YOU."', 'Behind it, the pen scratches. It pauses, as if listening. Then it goes on.') },
    { t: 'thing', look: 'uclectern', x: 6, y: 5, run: async () => ucLectern() },
    { t: 'save', x: 15, y: 8 },
  ] };
Object.assign(THING, {
  ucshelf: (x, y, t, e) => { const qs = QUESTS.filter(q => q.chapter === e.n); ctx.fillStyle = '#6a5040'; ctx.fillRect(x - 42, y - 26, 82, 22); ctx.fillStyle = '#3a2a22'; ctx.fillRect(x - 40, y - 24, 78, 18); for (let i = 0; i < 6; i++) { const q = qs[i]; ctx.fillStyle = !q ? '#3a3040' : q.done() ? '#c8a050' : q.stage() ? '#b0a0d8' : '#7a6a78'; ctx.fillRect(x - 38 + i * 13, y - 22, 10, 16); }
    ctx.font = `8px ${FONT}`; ctx.textAlign = 'center'; ctx.fillStyle = '#c8b8a0'; ctx.fillText('CH.' + e.n, x, y + 8); },
  uclectern: (x, y, t) => { ctx.fillStyle = '#4a3a30'; ctx.fillRect(x - 4, y - 24, 8, 24); poly([x - 18, y - 34, x + 18, y - 34, x + 14, y - 24, x - 14, y - 24], '#6a5040'); ctx.fillStyle = '#f4ecd8'; ctx.fillRect(x - 14, y - 38, 28, 6); },
  ucdoor: (x, y, t) => { ctx.fillStyle = '#e8dcc0'; ctx.fillRect(x + 6, y - 20, 20, 10); ctx.fillStyle = '#2a2030'; ctx.fillRect(x + 9, y - 16, 14, 1.5); },
});
