/* ===================== QUEST LOG (v1.4): chapters register side quests; the pause screen lists them ===================== */
// QUESTS entry: { id, name, chapter, stage: () => string|null (null = not started), done: () => bool }
const QUESTS = [];
function questLines() { return QUESTS.map(q => { const s = q.stage(); if (s == null) return null; return (q.done() ? '✓ ' : '• ') + q.name + ': ' + s; }).filter(Boolean); }
{ const base = buildPause;
  buildPause = function () { base();
    let el = document.getElementById('pause-quests');
    if (!el) { el = document.createElement('div'); el.id = 'pause-quests'; el.className = 'sub'; el.style.cssText = 'text-align:left;max-width:560px;margin:6px auto;font-size:14px;line-height:1.5';
      const info = document.getElementById('pause-info'); info.parentNode.insertBefore(el, info.nextSibling); }
    const inBattle = prevState === 'battle'; const L = hero && !inBattle ? questLines() : [];
    el.style.display = L.length ? 'block' : 'none'; el.innerHTML = L.length ? '<b>SIDE QUESTS</b><br>' + L.map(l => l.replace(/</g, '&lt;')).join('<br>') : ''; };
}
