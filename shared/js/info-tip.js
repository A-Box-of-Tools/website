/**
 * The information mark: an i beside a control, opening a sentence or two about
 * it in a bubble over the page. The markup and the look are under `.info-tip` in
 * shared/css/tool-frame.css. A <details> opens and closes on a click by itself,
 * so this file is the rest of what a reader expects of a popup:
 *
 *   - a mouse resting on the mark shows the bubble, and moving away takes it back;
 *   - reaching the mark by keyboard shows it, and moving on takes it back;
 *   - a click or a tap keeps it, until the mark is pressed again, something else
 *     is pressed or focused, or Escape;
 *   - it stays on screen, moved along or turned above the mark as it has to be;
 *   - there is one at a time.
 *
 * THE FRAME LOADS THIS, NOT THE TOOL
 *
 * templates/tool.html loads it beside src/main.js, so a tool asks for the part
 * in js_parts and calls nothing. It used to be a function each tool called on
 * each of its marks, and that is how the mark in the frame came to be half-wired:
 * every paired tool wears one beside its version, one tool of the five remembered
 * to call the function on it, and on the other four it was a plain fold. A tool
 * whose own script fails to boot still gets working marks this way, too.
 *
 * THE LISTENERS ARE THE DOCUMENT'S
 *
 * One set rather than one per mark, so a mark drawn after the page loads works
 * with nothing to call, and "one at a time" is a single variable rather than
 * every mark listening for the others. They capture, because a tool that stops an
 * event for a reason of its own should not leave a bubble it knows nothing about
 * stuck open.
 */

const TIP = 'details.info-tip';
const MARK = `${TIP} > summary`;

// How near the edge of the window a bubble may come.
const EDGE = 12;

// A small gap beside the bubble must not close it before the pointer reaches its
// words, which belong to the same explanation.
const LINGER = 150;

export function watchInfoTips(document, window) {
  let showing = null;
  // Asked for by a click or the keyboard, rather than only passed over by a
  // mouse. Such a bubble stays when the pointer leaves, and a passing mouse does
  // not take its place: scrolling can bring another mark under a resting pointer.
  let held = false;
  let lingering;

  const place = tip => {
    const note = tip.querySelector(':scope > [role="tooltip"]');
    if (!note) return;
    // Measured from where the stylesheet puts it, or last time's correction would
    // be taken for room that is not there.
    delete tip.dataset.placement;
    note.style.marginInlineStart = '';
    const box = note.getBoundingClientRect();
    // It starts where the mark starts, so only its far end can run off the window.
    // A margin rather than a transform: Chromium goes on counting a translated
    // box where it was, and the page gains a sideways scroll the bubble has left.
    const past = window.getComputedStyle(note).direction === 'rtl'
      ? EDGE - box.left
      : box.right - (document.documentElement.clientWidth - EDGE);
    if (past > 0) note.style.marginInlineStart = `${-past}px`;
    if (box.bottom <= window.innerHeight - EDGE) return;
    tip.dataset.placement = 'above';
    // Below can at least be scrolled to, so a bubble that fits neither way stays.
    if (note.getBoundingClientRect().top < EDGE) delete tip.dataset.placement;
  };

  const hide = () => {
    clearTimeout(lingering);
    held = false;
    if (showing) showing.open = false;
    showing = null;
  };

  const show = (tip, hold = false) => {
    clearTimeout(lingering);
    if (tip !== showing) hide();
    showing = tip;
    if (hold) held = true;
    tip.open = true;
    place(tip);
  };

  const on = (type, handler) => document.addEventListener(type, handler, true);

  on('click', event => {
    const mark = event.target.closest?.(MARK);
    if (!mark) return;
    // The browser's own toggle comes after this and would paint the bubble once
    // before it could be placed. A first click on a bubble the mouse has already
    // opened keeps it: a reader who clicks because they think that is how it opens
    // should not see it vanish.
    event.preventDefault();
    if (mark.parentElement === showing && held) hide();
    else show(mark.parentElement, true);
  });

  on('pointerover', event => {
    const tip = event.target.closest?.(TIP);
    if (event.pointerType !== 'mouse' || !tip || tip.contains(event.relatedTarget)) return;
    clearTimeout(lingering);
    if (!held) show(tip);
  });

  on('pointerout', event => {
    if (event.pointerType !== 'mouse' || held) return;
    if (!showing?.contains(event.target) || showing.contains(event.relatedTarget)) return;
    lingering = setTimeout(hide, LINGER);
  });

  on('pointerdown', event => {
    if (!showing) return;
    if (!showing.contains(event.target)) hide();
    // A press on the words is somebody selecting them, and the drag may well
    // carry the pointer outside the bubble.
    else if (!event.target.closest(MARK)) held = true;
  });

  on('focusin', event => {
    // Focus going nowhere fires nothing here: a click on the bubble's own words,
    // or the window losing focus, and neither is the reader moving on.
    if (showing && !showing.contains(event.target)) hide();
    // A mark focused by a mouse does not match, and its click is coming anyway.
    if (event.target.matches?.(`${MARK}:focus-visible`)) show(event.target.parentElement, true);
  });

  on('keydown', event => {
    if (event.key !== 'Escape' || !showing) return;
    hide();
    event.preventDefault();
  });

  // Whatever else opens or closes one: the browser's find-in-page opens a closed
  // <details> to show a match, and a tool may set `open` itself.
  on('toggle', event => {
    const tip = event.target;
    if (!tip.matches?.(TIP) || tip.open === (tip === showing)) return;
    if (tip.open) show(tip);
    else hide();
  });

  window.addEventListener('resize', () => { if (showing) place(showing); });
}

// The tests import the function and never reach here, because there is no
// document for it to watch.
if (typeof document !== 'undefined') watchInfoTips(document, window);
