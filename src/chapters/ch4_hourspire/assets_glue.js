/* chunk R (v1.7-c8): wire Greg assets (src/assets/*, copied from /workspace/hh-assets, unedited).
   Undercroft rooms -> 'undercroft'; Fileflit battle -> 'fileflit'; Quill phase 1 -> Greg 'archivist' (phase 2 keeps 'quill2');
   Pell's Loft -> 'pell'; Stacks shelves -> hhShelf; Pell sprite -> hhDrawPell; Quill VOL. 2 -> hhPhaseStinger('quill', 2).
   Rails: hhRail in weightworks.js. Music layers: hhMusicExtras hook in musicTick (00_core.js). */
for (const id of ['under1', 'under2', 'under3', 'under4', 'quilloffice']) ROOMS[id].track = 'undercroft';
ROOMS.spire3.track = 'pell';
ENEMIES.fileflit.track = 'fileflit';
ENEMIES.quill.track = 'archivist';
THING.ucshelf = (x, y, t, e) => { hhShelf(x, y, t, e); /* c14: CH.n label (Greg request 7 still open) */ ctx.font = `bold 11px ${FONT}`; ctx.textAlign = 'center'; ctx.fillStyle = '#d8c8a0'; ctx.fillText('CH.' + e.n, x, y + 10); };
{ const _dn = drawNPC; drawNPC = function (kind, x, y, t, look) { if (kind !== 'pell') return _dn.apply(this, arguments); return hhDrawPell(x, y, t); }; }
{ const _v = qlVol2; qlVol2 = async function (b) { hhSting('quill', 2); return _v.apply(this, arguments); }; }
