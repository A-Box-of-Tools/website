/**
 * Dragging a page tile to a new place in the running order.
 *
 * This was written with the HTML drag-and-drop API - `draggable="true"`, a
 * dataTransfer, dragover and drop - and that API is the wrong one for the job
 * in two ways that a person meets immediately.
 *
 * It does not exist on a touch screen. There is no dragstart from a finger in
 * any mobile browser, so on a phone or a tablet dragging a tile did nothing at
 * all, anywhere on it, and the only way to move a page was the two arrows
 * under it, one position at a time.
 *
 * And with a mouse it worked over some of a tile and not the rest: only an
 * element carrying the attribute can be picked up, so the paper and the little
 * grip could be dragged and the whole lower band of the tile - the file name,
 * the paper size, the four buttons - was dead. A tile that answers to the
 * pointer over two thirds of itself reads as broken, because the part a person
 * happens to grab is the part that decides.
 *
 * Pointer events have neither problem: one code path for mouse, pen and touch,
 * and the whole tile is the handle. What they do not bring is the two things
 * the browser used to do for free, so both are here - the tile follows the
 * pointer, and the page scrolls when the drag reaches its edge.
 *
 * A finger is the exception to "the whole tile is the handle". A list of pages
 * is taller than the screen and has to be scrollable, and a touch that starts
 * a drag is a touch that cannot scroll - so from a finger the drag starts on
 * the grip alone, which is the one part of the tile whose `touch-action` says
 * the page must not pan. Everything else on the tile scrolls the way the rest
 * of the page does.
 */

/** How far the pointer must travel before this is a drag and not a click. */
const SLOP = 5;

/** How close to the edge of the window a drag has to be to scroll it. */
const EDGE = 70;
const EDGE_SPEED = 14;

/**
 * @param {HTMLElement} list      the container the tiles are children of
 * @param {object} options
 * @param {string} options.item   selector for one tile
 * @param {string} options.handle selector for the grip inside it
 * @param {() => boolean} options.blocked  true while the tool is busy
 * @param {(from: number, to: number) => void} options.onMove
 */
export function wireReorder(list, { item, handle, blocked, onMove }) {
  /** The drag in progress: null between them. */
  let drag = null;

  const tileAt = (node) => node?.closest?.(item) ?? null;
  const indexOf = (tile) => Number(tile.dataset.index);

  const clearMarkers = () => {
    for (const node of list.querySelectorAll('.insert-before, .insert-after')) {
      node.classList.remove('insert-before', 'insert-after');
    }
  };

  /**
   * Which tile the pointer is over, and which side of it.
   *
   * The tile being dragged is out of the way of the hit test - it carries
   * `pointer-events: none` while it is lifted - so what comes back is always
   * something to land beside.
   */
  const landing = (x, y) => {
    const over = tileAt(document.elementFromPoint(x, y));
    if (!over) return null;
    const box = over.getBoundingClientRect();
    // Which side the pointer is on decides where it goes, so the marker reads
    // as "it lands here" rather than "it swaps with this one". Right of centre
    // is later in the order in Arabic only if you read from the left, which is
    // why the answer is turned round there: the fourteenth page of a document
    // is drawn to the left of the thirteenth, and a bar on the right of a tile
    // that means "after" would be pointing at the page before it.
    const past = x > box.left + box.width / 2;
    return { index: indexOf(over), after: drag?.rtl ? !past : past, tile: over };
  };

  const showMarker = (spot) => {
    clearMarkers();
    if (spot) spot.tile.classList.add(spot.after ? 'insert-after' : 'insert-before');
  };

  /*
    The tile, under the pointer. The offset is measured in page coordinates
    rather than the window's, because the window moves: while the edge scroll
    below is running the tile's own layout position slides up with the
    document, and a translation of "how far the pointer has moved on screen"
    would leave it further behind with every frame.
  */
  const follow = () => {
    const x = drag.x + scrollX - drag.startX;
    const y = drag.y + scrollY - drag.startY;
    drag.tile.style.transform = `translate(${x}px, ${y}px)`;
  };

  /* The window scrolls itself while a drag sits near its edge, which the drag
     API used to do and pointer events do not. Without it a page cannot be
     carried past the fold of a long document at all: the pointer reaches the
     bottom of the screen and there is nowhere further to go. */
  let scrolling = 0;
  const edgeScroll = () => {
    if (!drag?.lifted) { scrolling = 0; return; }
    const { y } = drag;
    const push = y < EDGE ? -EDGE_SPEED : (y > innerHeight - EDGE ? EDGE_SPEED : 0);
    if (push) {
      scrollBy(0, push);
      follow();
      drag.spot = landing(drag.x, drag.y);
      showMarker(drag.spot);
    }
    scrolling = requestAnimationFrame(edgeScroll);
  };

  const lift = () => {
    drag.lifted = true;
    drag.tile.classList.add('dragging');
    scrolling = requestAnimationFrame(edgeScroll);
  };

  const finish = (apply) => {
    if (!drag) return;
    const { tile, from, spot, lifted } = drag;
    drag = null;
    cancelAnimationFrame(scrolling);
    tile.classList.remove('dragging');
    tile.style.transform = '';
    clearMarkers();
    if (!lifted || !apply || !spot) return;

    let to = spot.after ? spot.index + 1 : spot.index;
    // Taking the tile out first shifts everything after it down by one.
    if (from < to) to -= 1;
    if (to !== from) onMove(from, to);
  };

  list.addEventListener('pointerdown', (event) => {
    if (drag || blocked() || event.button !== 0) return;

    const tile = tileAt(event.target);
    if (!tile) return;

    const grip = event.target.closest(handle);
    // A press that lands on one of the tile's own buttons is that button's,
    // not a drag - except the grip, which is a button whose whole job is this.
    if (!grip && event.target.closest('button, a, input, select')) return;
    // A finger may only start a drag on the grip; anywhere else on the tile it
    // is the visitor scrolling the list.
    if (event.pointerType === 'touch' && !grip) return;

    drag = {
      tile,
      pointerId: event.pointerId,
      // Read once: the answer cannot change during a drag, and reading it on
      // every move would be a style recalculation per pointer event.
      rtl: getComputedStyle(list).direction === 'rtl',
      from: indexOf(tile),
      // Where the grab happened on the page, not on the screen - see follow().
      startX: event.clientX + scrollX,
      startY: event.clientY + scrollY,
      x: event.clientX,
      y: event.clientY,
      lifted: false,
      spot: null,
    };
    // Captured on the list rather than the tile, so the tile is free to take
    // itself out of the hit test once it is lifted. A pointer that has already
    // gone cannot be captured and throws saying so, which is not a reason to
    // leave a drag half-started.
    try {
      list.setPointerCapture(event.pointerId);
    } catch {
      drag = null;
    }
  });

  list.addEventListener('pointermove', (event) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    drag.x = event.clientX;
    drag.y = event.clientY;

    if (!drag.lifted) {
      const moved = Math.hypot(
        drag.x + scrollX - drag.startX, drag.y + scrollY - drag.startY);
      if (moved < SLOP) return;
      lift();
    }
    // A touch that has become a drag must stop being a scroll as well.
    event.preventDefault();
    follow();
    drag.spot = landing(drag.x, drag.y);
    showMarker(drag.spot);
  });

  for (const type of ['pointerup', 'pointercancel']) {
    list.addEventListener(type, (event) => {
      if (!drag || event.pointerId !== drag.pointerId) return;
      finish(type === 'pointerup');
    });
  }

  // Somewhere to put a drag down that is not a decision, for a person who has
  // picked up the wrong tile.
  addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && drag?.lifted) finish(false);
  });

  // A tile lifted and then removed under us - the tool cleared the list, or a
  // file went - would leave the drag pointing at a node no longer on the page.
  return () => finish(false);
}
