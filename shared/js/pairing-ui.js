import { pairingChoice } from './pairing-choice.js';
import { phrase } from './phrases.js';

const $ = (id) => document.getElementById(id);
const value = (read) => typeof read === 'function' ? read() : Boolean(read);

// Selection is advisory and has no transport or media authority. Adapters
// explicitly refresh at their own Start/Stop boundary and retain their own
// recovery rules while busy, including pending permission and capture work.
export function pairingOptions({ busy = () => false, invitation = () => false,
  invitationLink = () => false, onChange = () => {} } = {}) {
  const requested = new URL(location.href).searchParams.get('pairing');
  let preference = ['auto', 'online', 'offline'].includes(requested) ? requested : 'auto';
  let method = pairingChoice({ preference, online: navigator.onLine }).method;
  let introductionFailed = false, refreshing = false, lastNotice = '';
  const listeners = [];
  const listen = (target, event, callback) => {
    target?.addEventListener(event, callback);
    listeners.push(() => target?.removeEventListener(event, callback));
  };
  const refresh = () => {
    if (refreshing) return method;
    refreshing = true;
    try {
      const locked = Boolean(value(busy));
      const before = method;
      if (!locked) {
        const choice = pairingChoice({ preference, online: navigator.onLine,
          invitation: value(invitation), invitationLink: value(invitationLink),
          manualDraft: method === 'offline' && Boolean($('offline-offer-input')?.value.trim()), introductionFailed });
        method = choice.method;
        lastNotice = choice.notice;
      }
      for (const name of ['auto', 'online', 'offline']) {
        const radio = $(`pairing-${name}`);
        if (radio) { radio.checked = preference === name; radio.disabled = locked; }
      }
      const options = $('pairing-options');
      if (options) options.dataset.pairingMode = method;
      const notice = $('pairing-status');
      if (notice) { notice.textContent = lastNotice ? phrase(lastNotice) : ''; notice.hidden = locked || !lastNotice; }
      const help = $('offline-help');
      if (help) help.hidden = method !== 'offline';
      if (before !== method) document.dispatchEvent(new CustomEvent('pairing-method-change'));
      onChange({ method, preference, notice: lastNotice, busy: locked });
      return method;
    } finally { refreshing = false; }
  };
  for (const name of ['auto', 'online', 'offline']) listen($(`pairing-${name}`), 'change', () => {
    if (value(busy)) return;
    preference = name;
    introductionFailed = false;
    refresh();
  });
  for (const event of ['online', 'offline', 'pageshow']) listen(window, event, refresh);
  listen(document, 'input', refresh);
  return {
    get method() { return method; }, get preference() { return preference; }, refresh,
    fail() {
      if (preference === 'auto') {
        introductionFailed = true;
        if ($('pairing-options')) $('pairing-options').open = true;
      }
      refresh();
    },
    reset() { introductionFailed = false; refresh(); },
    dispose() { listeners.forEach((remove) => remove()); },
  };
}

// Block I/O is shared, but the adapter alone decides when a button is enabled,
// what a connection authorizes, and which participant an accepted reply owns.
export function pairingBlocks({ createReply, acceptReply, newOffer, onError = () => {}, onChange = () => {} } = {}) {
  let epoch = 0;
  const pending = new Set();
  const disposers = [];
  const listen = (target, event, callback) => {
    target?.addEventListener(event, callback);
    disposers.push(() => target?.removeEventListener(event, callback));
  };
  const setOffer = (text) => {
    epoch += 1;
    if ($('offline-offer')) $('offline-offer').value = String(text ?? '');
    if ($('offline-answer-input')) $('offline-answer-input').value = '';
    onChange();
  };
  const setAnswer = (text) => {
    epoch += 1;
    if ($('offline-answer')) $('offline-answer').value = String(text ?? '');
    onChange();
  };
  const perform = async (id, action, output) => {
    if (!action || pending.has(id) || $(id)?.disabled) return;
    const ticket = epoch;
    pending.add(id);
    try {
      const result = await action();
      if (ticket === epoch && typeof result === 'string') output?.(result);
    } catch (error) { if (ticket === epoch) onError(error, id); }
    finally { pending.delete(id); }
  };
  listen($('offline-reply'), 'click', () => perform('offline-reply', () => createReply?.($('offline-offer-input').value.trim()), setAnswer));
  listen($('offline-accept'), 'click', () => perform('offline-accept', () => acceptReply?.($('offline-answer-input').value.trim())));
  listen($('offline-new'), 'click', () => perform('offline-new', newOffer, setOffer));
  for (const kind of ['offer', 'answer']) {
    listen($(`copy-${kind}`), 'click', async () => {
      const field = $(`offline-${kind}`), status = $(`${kind}-copy-status`), ticket = epoch;
      if (!field?.value) return;
      try {
        await navigator.clipboard.writeText(field.value);
        if (ticket === epoch && status) status.textContent = phrase('offline.copied');
      } catch {
        if (ticket !== epoch) return;
        field.focus(); field.select();
        if (status) status.textContent = phrase('offline.copy-failed');
      }
    });
    listen($(`save-${kind}`), 'click', () => {
      const text = $(`offline-${kind}`)?.value;
      if (!text) return;
      const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = url; link.download = `pairing-${kind}.json`; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 0);
    });
    const input = $(`load-${kind}`), target = $(`offline-${kind}-input`);
    listen($(`choose-${kind}`), 'click', () => { if (!target?.disabled && !target?.readOnly) input?.click(); });
    listen(input, 'change', async () => {
      const file = input.files?.[0], ticket = epoch;
      input.value = '';
      if (!file || target?.disabled || target?.readOnly) return;
      try {
        if (file.size > 65536) throw new Error('offline.file-invalid');
        const text = await file.text();
        if (ticket !== epoch || target?.disabled || target?.readOnly) return;
        if (text.length > 65536) throw new Error('offline.file-invalid');
        target.value = text;
        target.dispatchEvent(new Event('input', { bubbles: true }));
      } catch (error) { if (ticket === epoch) onError(error, `load-${kind}`); }
    });
  }
  listen(document, 'pairing-method-change', () => { epoch += 1; });
  return {
    setOffer, setAnswer,
    clear() {
      epoch += 1;
      setOffer(''); setAnswer('');
      for (const id of ['offer-copy-status', 'answer-copy-status', 'offline-accept-status']) if ($(id)) $(id).textContent = '';
    },
    dispose() { epoch += 1; disposers.forEach((remove) => remove()); },
  };
}
