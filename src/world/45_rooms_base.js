/* ===================== WORLD DATA: rooms, NPCs, scripts ===================== */
// tiles: # wall · T solid deco · ~ water · R roof · B building · d door · . floor · , tall grass (encounters) · = path · o flowers · _ carpet · p plate
const route = () => { const bk = ['wicklow', 'grit', 'cuckoo'].filter(b => hero.flags['killed_' + b]).length; return hero.kills === 0 ? 'peace' : (bk >= 3 && hero.kills >= 12) ? 'violent' : 'mixed'; };
const killedAny = () => hero.kills > 0;
const ROOMS = {}; // chapters register their rooms below (Object.assign keeps the v1.3 key order)
