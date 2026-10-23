import { phrase } from './phrases.js';
import { transportMode } from './peer-transport.js';

/** A selected route is consent for the next session, never a live switch. */
export function bindTransportControl({ onChange = () => {} } = {}) {
  const controls = [...document.querySelectorAll('[data-pairing-transport]')].map((element, index) => {
    const toggle = element.querySelector('.paired-transport-toggle');
    const input = element.querySelector('[data-transport-toggle]');
    const note = element.querySelector('[data-transport-note]');
    input.id = index ? `pairing-transport-${index}` : 'pairing-transport';
    note.id = `${input.id}-note`;
    input.setAttribute('aria-describedby', note.id);
    return { toggle, input, note };
  });
  const badges = [...document.querySelectorAll('[data-transport-badge]')];
  const output = document.getElementById('pairing-route');
  let mode = 'direct';
  let locked = false;
  const value = () => mode;
  const refresh = () => {
    for (const { toggle, input, note } of controls) {
      input.checked = mode === 'relay';
      input.disabled = locked;
      toggle.hidden = locked;
      note.textContent = phrase(`transport.note.${mode}`);
    }
    // A locked choice describes this session's selected mode. The separate
    // route output still reports whether a peer connection actually succeeded.
    for (const badge of badges) {
      badge.hidden = !locked;
      for (const label of badge.querySelectorAll('[data-transport-mode]')) {
        label.hidden = label.dataset.transportMode !== mode;
      }
    }
  };
  const changed = event => {
    if (locked) { refresh(); return; }
    mode = event.currentTarget.checked ? 'relay' : 'direct';
    refresh();
    onChange(mode);
  };
  for (const { input } of controls) input.addEventListener('change', changed);
  refresh();
  return {
    value,
    set(next) {
      if (!controls.length || transportMode(next) === null) return false;
      mode = transportMode(next);
      refresh();
      return true;
    },
    lock(next) { locked = Boolean(next); refresh(); },
    route(mode) {
      if (!output) return;
      output.hidden = mode == null;
      output.textContent = mode == null ? '' : phrase(`transport.route.${['direct', 'relay'].includes(mode) ? mode : 'unknown'}`);
    },
    destroy() { for (const { input } of controls) input.removeEventListener('change', changed); },
  };
}
