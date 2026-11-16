/* ===== v1.7-c15 · M4-D3 options slice 2: key rebinding =====
   Each action keeps its default keys and can get ONE extra custom key (settings.bind[action] = KeyboardEvent.code).
   A bound key is translated (capture phase) into the action's canonical key, so movement, menus, dodge, focus and
   DOM navigation all work unchanged. Escape cancels a capture; DEFAULTS clears all custom keys. */
const BIND_ACT = [['up', 'Move up', 'ArrowUp'], ['down', 'Move down', 'ArrowDown'], ['left', 'Move left', 'ArrowLeft'], ['right', 'Move right', 'ArrowRight'],
  ['ok', 'Confirm', 'KeyZ'], ['back', 'Back', 'KeyX'], ['menu', 'Menu / pause', 'Escape'], ['focus', 'Focus (slow)', 'ShiftLeft']];
if (!settings.bind || typeof settings.bind !== 'object') settings.bind = {};
let bindCap = null; // action being captured
const keyName = c => !c ? '-' : /^Arrow/.test(c) ? c.slice(5) : c.replace(/^Key/, '').replace(/^Digit/, '').replace(/^(Shift|Control|Alt|Meta)(Left|Right)$/, '$1');
function bindCanon(code) { for (const [a, , canon] of BIND_ACT) if (settings.bind[a] === code) return canon; return null; }
for (const type of ['keydown', 'keyup']) addEventListener(type, e => {
  if (e.__hhSyn) return;
  if (bindCap && type === 'keydown') { e.preventDefault(); e.stopImmediatePropagation(); const a = bindCap; bindCap = null;
    if (e.code !== 'Escape') { for (const k in settings.bind) if (settings.bind[k] === e.code) delete settings.bind[k]; settings.bind[a] = e.code; saveSettings(); sfx('select'); }
    const body = document.getElementById('settings-body'); if (body && document.querySelector('#s-settings.on')) { buildSettings(); const b = document.getElementById('b-bind-' + a); if (b) b.focus(); } return; }
  if (bindCap) return;
  const canon = bindCanon(e.code); if (!canon || (e.target && e.target.tagName === 'INPUT' && e.target.type !== 'range')) return;
  e.preventDefault(); e.stopImmediatePropagation(); const ev = new KeyboardEvent(type, { code: canon, key: canon, bubbles: true }); ev.__hhSyn = true; dispatchEvent(ev);
}, { capture: true });
function hhBindRows(body) {
  const h = document.createElement('div'); h.className = 'set'; h.innerHTML = '<label><b>Controls</b> (extra key per action)</label>'; body.appendChild(h);
  for (const [a, label, canon] of BIND_ACT) { const d = document.createElement('div'); d.className = 'set'; d.innerHTML = `<label>${label} <small style="opacity:.6">${keyName(canon)}</small></label>`;
    const b = document.createElement('button'); b.id = 'b-bind-' + a; b.textContent = bindCap === a ? 'PRESS A KEY...' : (settings.bind[a] ? keyName(settings.bind[a]) : 'ADD KEY');
    b.onclick = () => { bindCap = a; b.textContent = 'PRESS A KEY...'; }; d.appendChild(b); body.appendChild(d); } }
