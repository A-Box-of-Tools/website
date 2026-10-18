import { phrase } from './phrases.js';
import { transportMode } from './peer-transport.js';

/** A selected route is consent for the next session, never a live switch. */
export function bindTransportControl({ onChange = () => {} } = {}) {
  const select = document.getElementById('pairing-transport');
  const note = document.getElementById('pairing-transport-note');
  const output = document.getElementById('pairing-route');
  const value = () => transportMode(select?.value);
  const refresh = () => {
    if (note) note.textContent = phrase(`transport.note.${value() === 'relay' ? 'relay' : 'direct'}`);
  };
  const changed = () => { refresh(); onChange(value()); };
  select?.addEventListener('change', changed);
  refresh();
  return {
    value,
    set(mode) {
      if (!select || transportMode(mode) === null) return false;
      select.value = transportMode(mode);
      refresh();
      return true;
    },
    lock(locked) { if (select) select.disabled = Boolean(locked); },
    route(mode) {
      if (!output) return;
      output.hidden = mode == null;
      output.textContent = mode == null ? '' : phrase(`transport.route.${['direct', 'relay'].includes(mode) ? mode : 'unknown'}`);
    },
    destroy() { select?.removeEventListener('change', changed); },
  };
}
