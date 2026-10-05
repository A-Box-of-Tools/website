export function wireCurrencyHelp(details) {
  const summary = details?.querySelector(':scope > summary');
  if (!summary) return;

  let pinned = details.open;
  let keyboardFocus = false;
  let leaveTimer;
  const clearLeave = () => clearTimeout(leaveTimer);
  const close = () => {
    clearLeave();
    pinned = false;
    keyboardFocus = false;
    details.open = false;
  };

  details.addEventListener('toggle', () => {
    delete details.dataset.placement;
    if (!details.open) return;
    const note = details.querySelector('#default-currency-note');
    const viewport = details.ownerDocument.defaultView;
    if (!note || !viewport || note.getBoundingClientRect().bottom <= viewport.innerHeight - 12) return;
    details.dataset.placement = 'above';
    if (note.getBoundingClientRect().top < 12) delete details.dataset.placement;
  });

  details.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse') return;
    clearLeave();
    details.open = true;
  });
  details.addEventListener('pointerleave', event => {
    if (event.pointerType !== 'mouse' || pinned || keyboardFocus) return;
    // A small gap beside the bubble must not close it before the pointer
    // reaches its text, which belongs to the same explanation.
    leaveTimer = setTimeout(() => {
      if (!pinned && !keyboardFocus) close();
    }, 150);
  });
  summary.addEventListener('focus', () => {
    keyboardFocus = summary.matches(':focus-visible');
    if (keyboardFocus) {
      clearLeave();
      details.open = true;
    }
  });
  details.addEventListener('focusout', event => {
    if (!details.contains(event.relatedTarget)) close();
  });
  summary.addEventListener('click', () => {
    clearLeave();
    keyboardFocus = summary.matches(':focus-visible');
    if (!details.open) pinned = true;
    else if (!pinned) {
      // Native summary activation will toggle this open again. Its first
      // activation pins a hover or focus preview rather than closing it.
      details.open = false;
      pinned = true;
    } else pinned = false;
  });
  details.ownerDocument.addEventListener('pointerdown', event => {
    if (!details.contains(event.target)) close();
  });
  details.ownerDocument.addEventListener('keydown', event => {
    if (event.key === 'Escape' && details.open) {
      close();
      event.preventDefault();
    }
  });
}
