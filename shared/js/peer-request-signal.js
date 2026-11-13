/**
 * What a host is told when somebody asks to join and nobody is looking.
 *
 * WHY THE POPUP IS NOT ENOUGH
 *
 * A request to join opens a popup, and only on a page that is in front:
 * peer-approval-ui.js opens none on a hidden page or behind another dialog,
 * and Remote Camera's own controller keeps the same rule. That is deliberate.
 * A dialog must not take focus from a decision already in progress, and one
 * opened behind the host's back would be sitting under their first click when
 * they came back.
 *
 * What that left out was everything else. A request that arrived while the
 * page was in the background added a row to a list and the page said nothing:
 * not in the tab, not out loud, and not on the way back. For a host sharing a
 * tab that is the normal case rather than the exception - they are looking at
 * the tab being shared - and the person who asked sits on "waiting for
 * approval" with nothing telling the host there is anything to approve.
 *
 * WHAT THIS SAYS INSTEAD
 *
 * Three things, none of which asks the browser for a permission or makes a
 * request:
 *
 *   - THE TAB'S TITLE carries the count for as long as a request is waiting,
 *     in the words the list's own heading uses, so they are already
 *     translated. A title is the one part of a background tab that is still
 *     on the screen, and it is what a screen reader says on the way back.
 *   - A SOUND, in the tools that hand this a chime. `KNOCK` below says what
 *     it is, and `arm()` why the tool has to ask for it early.
 *   - ON THE WAY BACK, the list is brought into view and marked, once. The
 *     list and not the popup: a request received while the page was hidden
 *     opens no popup on return, which Remote Camera's README records as
 *     intended, and tools that answer alike are easier to trust.
 *
 * A system notification would be the fourth, and is left out on purpose. It
 * is the only one that needs the browser's permission prompt, on pages whose
 * hosts are otherwise asked for nothing they did not come to give, and it
 * leaves a line in the system's own list after the session it was about has
 * ended.
 *
 * WHAT IT CANNOT DO
 *
 * A phone that has put the browser away has usually stopped the page as
 * well. Nothing here runs then, and only the third part is any use once the
 * host is back.
 */

/**
 * What a request to join sounds like: two notes falling a third, the shape of
 * a doorbell, and on a phone that allows it a short buzz and then a longer
 * one.
 *
 * Falling, where the other two sounds this site makes both rise - the QR
 * reader's "that scanned" and Remote Camera's "something moved" - and lower
 * and slower than either, so that none can be taken for another. Hand it to
 * `createChime` as it is.
 */
export const KNOCK = {
  notes: [
    { hertz: 659.25, starts: 0, lasts: 0.18 },
    { hertz: 523.25, starts: 0.22, lasts: 0.3 },
  ],
  buzz: [70, 90, 140],
};

/**
 * New requests closer together than this share one sound, in milliseconds. A
 * class joining a pager is one thing to its host, not thirty.
 */
const QUIET_MS = 4000;

/** How many requests that have had their sound are remembered. */
const REMEMBERED = 64;

/** How long the list stays marked after the host returns, in milliseconds. */
const NOTICE_MS = 3000;

/** The class the list wears while it is marked. paired-tools.css draws it. */
const NOTICED = 'paired-requests-noticed';

/** Where a host's "no sound" is kept. Nothing else is ever written there. */
const STORE = 'abox.pairing-request-sound.v1';

/**
 * @param {object} options
 * @param {HTMLElement} options.panel  the list's region with its heading: the
 *   element that carries `data-pairing-requests`
 * @param {{chime: {arm(): void, play(): boolean, release(): void}, toggle: HTMLInputElement}} [options.sound]
 *   a chime made from `KNOCK`, and the checkbox that turns it off. Leave it
 *   out for a tool that stays silent
 */
export function createRequestSignal({
  panel,
  sound = null,
  document = panel.ownerDocument,
  storage = () => globalThis.localStorage,
  now = () => Date.now(),
  later = (callback, wait) => setTimeout(callback, wait),
  cancel = (timer) => clearTimeout(timer),
}) {
  const heading = panel.querySelector('h2, h3, h4');
  const option = sound?.toggle.closest('label') ?? null;
  let waiting = new Set();
  // Requests that arrived while the page was hidden and are still waiting.
  const unseen = new Set();
  // Requests that have had their sound, so that one withdrawn and sent again
  // by a page with a poor connection does not ring every few seconds.
  const heard = new Set();
  let hosting = false;
  let lastSound = -Infinity;
  let noticeTimer = null;
  let ownTitle = null;
  let pageTitle = null;

  /**
   * Put the count in the tab's title, or take it out again.
   *
   * The page's own title is put back only while the title is still the one
   * written here, so a title something else has set since is never replaced
   * by an old one.
   */
  function title(count) {
    if (ownTitle !== null && document.title !== ownTitle) ownTitle = pageTitle = null;
    if (count === 0) {
      if (ownTitle !== null) document.title = pageTitle;
      ownTitle = pageTitle = null;
      return;
    }
    if (ownTitle === null) pageTitle = document.title;
    const label = heading?.textContent.trim();
    const next = label ? `(${count}) ${label} — ${pageTitle}` : `(${count}) ${pageTitle}`;
    if (next !== ownTitle) document.title = ownTitle = next;
  }

  /** Whether the host wants the sound. The box starts ticked. */
  const wanted = () => Boolean(sound?.toggle.checked);

  function knock(fresh) {
    if (!sound) return;
    const unheard = fresh.filter((id) => !heard.has(id));
    if (!unheard.length) return;
    for (const id of unheard) {
      heard.add(id);
      if (heard.size > REMEMBERED) heard.delete(heard.values().next().value);
    }
    if (!wanted()) return;
    const at = now();
    if (at - lastSound < QUIET_MS) return;
    lastSound = at;
    // Asked for again here, in case the context was never made or has been
    // let go. Where a browser allows that without a tap, this request still
    // gets its sound; where it does not, play() refuses a context that is not
    // running, so nothing is left scheduled to turn up late.
    sound.chime.arm();
    sound.chime.play();
  }

  /** Bring the list into view and mark it, without taking focus. */
  function notice() {
    if (panel.hidden) return;
    panel.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
    panel.classList.remove(NOTICED);
    // Reading a layout property between the two is what makes a class taken
    // off and put straight back start its animation again.
    void panel.offsetWidth;
    panel.classList.add(NOTICED);
    cancel(noticeTimer);
    noticeTimer = later(() => panel.classList.remove(NOTICED), NOTICE_MS);
  }

  /**
   * Hear what is waiting now: the id of every request still undecided, each
   * time the list changes.
   */
  function update(ids) {
    const fresh = ids.filter((id) => !waiting.has(id));
    waiting = new Set(ids);
    for (const id of unseen) if (!waiting.has(id)) unseen.delete(id);
    if (document.hidden) for (const id of fresh) unseen.add(id);
    title(waiting.size);
    knock(fresh);
  }

  /**
   * Get the sound ready. Call it from the click that starts hosting, before
   * anything is awaited: a browser lets a page make a sound only once it has
   * been touched, and the request the sound is for arrives minutes later from
   * a socket, which no browser counts as a touch.
   */
  function arm() {
    if (wanted()) sound.chime.arm();
  }

  /**
   * Say whether there is a session somebody could ask to join. The switch for
   * the sound is on the page for exactly that long, and the audio device is
   * let go when the session ends.
   */
  function host(active) {
    if (option) option.hidden = !active;
    if (Boolean(active) === hosting) return;
    hosting = Boolean(active);
    if (hosting) return;
    sound?.chime.release();
    heard.clear();
    lastSound = -Infinity;
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden || !unseen.size) return;
    unseen.clear();
    notice();
  });

  // A page kept for the Back button is stored with its title. One stored with
  // a count in it would go on showing that count in the history list after
  // the request had gone.
  const view = document.defaultView;
  view?.addEventListener('pagehide', () => title(0));
  view?.addEventListener('pageshow', () => title(waiting.size));

  if (sound) {
    // Only "off" is ever written down, the way the QR reader keeps its own
    // answer. The markup says on, so a host who never touches the box leaves
    // nothing behind, and one who turns it off is not rung at on the next
    // visit by a page that forgot.
    try {
      if (storage()?.getItem(STORE) === 'off') sound.toggle.checked = false;
    } catch {
      // Storage is refused in some private windows. The box keeps the
      // markup's answer and the choice lasts as long as the page does.
    }
    sound.toggle.addEventListener('change', () => {
      try {
        if (sound.toggle.checked) storage()?.removeItem(STORE);
        else storage()?.setItem(STORE, 'off');
      } catch {
        // As above: remembered until the page is closed, and no longer.
      }
      // Ticking the box is itself a tap, which is when a sound may be asked for.
      if (!sound.toggle.checked) sound.chime.release();
      else if (hosting) sound.chime.arm();
    });
    // A context can be suspended again after it was armed - by a call, by a
    // permission sheet over the page - and is let back only from a gesture.
    // The click that started the session has been spent by then; any later
    // one will do.
    document.addEventListener('pointerdown', () => { if (hosting) arm(); }, { passive: true });
  }

  return { update, clear: () => update([]), arm, host };
}
