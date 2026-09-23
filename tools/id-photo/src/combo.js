/**
 * One control for a long list: a box that is typed into, and the list it narrows.
 *
 * The country chooser used to be two controls - a search box and, under it, the
 * menu the box narrowed. That was chosen for a reason that held at fifteen
 * rules: the menu is the phone's own picker and needs no code. At forty-four
 * countries it reads as two questions where there is one, and the answer to
 * the first appears inside the second, a line further down, in a control that
 * has not visibly changed. This is the usual shape instead - the ARIA "editable
 * combobox with list autocomplete" - written out because there is no element
 * for it: a <datalist> hands back free text where a key is needed, and offers
 * nothing until something has been typed.
 *
 * WHAT IT PROMISES THE CALLER
 *
 * The choice moves only when somebody makes one: Enter on a row, or a press on
 * one. Typing never changes it, and neither does leaving - Escape, Tab or a
 * press anywhere else puts the chosen name back in the box. The rule the crop
 * box is obeying must not change because a word was half typed.
 *
 * Nothing here is a sentence, so nothing here needs translating: the rows'
 * names and the line that counts them are the caller's.
 *
 * FOCUS STAYS IN THE BOX. The rows are never focused; the active one is named
 * by aria-activedescendant, which is what lets a screen reader announce it
 * while the caret stays where the typing is. A press on a row is stopped from
 * taking the focus for the same reason - otherwise the box blurs, the list
 * closes on the blur, and the press lands on nothing.
 *
 * @typedef {{ value: string, label: string, data?: Record<string, string> }} Row
 *   `data` is written onto the row as data- attributes, for whoever reads the
 *   list from outside - see where main.js fills it in.
 *
 * @param {object} parts
 * @param {HTMLElement} parts.root        wraps all three, for "was the press outside?"
 * @param {HTMLInputElement} parts.input
 * @param {HTMLElement} parts.list        role="listbox"
 * @param {HTMLButtonElement} parts.toggle
 * @param {(typed: string) => Row[]} parts.rowsFor  '' asks for every row
 * @param {() => Row} parts.chosen
 * @param {(value: string) => void} parts.onChoose
 * @param {(count: number|null) => void} parts.onNarrow  null once nothing is typed
 */
export function createCombo({ root, input, list, toggle, rowsFor, chosen, onChoose, onNarrow }) {
  /** @type {Row[]} */
  let rows = [];
  let active = -1;

  const isOpen = () => !list.hidden;
  const rowId = (index) => `${list.id}-${index}`;

  function setActive(index) {
    active = index;
    for (const [at, node] of [...list.children].entries()) {
      node.classList.toggle('active', at === index);
    }
    if (index < 0) {
      input.removeAttribute('aria-activedescendant');
      return;
    }
    input.setAttribute('aria-activedescendant', rowId(index));
    // Inside the list only. scrollIntoView would move the page as well, and a
    // page that jumps while somebody holds the down arrow is worse than a row
    // they have to scroll to.
    const node = list.children[index];
    if (node.offsetTop < list.scrollTop) list.scrollTop = node.offsetTop;
    const over = node.offsetTop + node.offsetHeight - list.clientHeight;
    if (over > list.scrollTop) list.scrollTop = over;
  }

  /** Draw the rows for some text. The list is drawn even while it is closed. */
  function draw(typed) {
    rows = rowsFor(typed);
    const current = chosen().value;
    list.replaceChildren(...rows.map((row, index) => {
      const node = document.createElement('li');
      node.id = rowId(index);
      node.setAttribute('role', 'option');
      node.setAttribute('aria-selected', String(row.value === current));
      Object.assign(node.dataset, row.data);
      node.dataset.value = row.value;
      node.textContent = row.label;
      return node;
    }));
  }

  function open(typed) {
    draw(typed);
    list.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    // With nothing typed the list opens on the choice already made, so the
    // arrows start from where the reader is. With something typed it opens on
    // the best answer, which is the one Enter should take.
    const at = typed ? 0 : rows.findIndex((row) => row.value === chosen().value);
    setActive(rows.length ? Math.max(0, at) : -1);
    onNarrow(typed ? rows.length : null);
  }

  /** Close, and put the chosen name back: whatever was typed was a question. */
  function close() {
    list.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    setActive(-1);
    input.value = chosen().label;
    onNarrow(null);
    // The closed list holds every row again, for whoever reads it next.
    draw('');
  }

  function choose(value) {
    onChoose(value);
    close();
    // Chosen from the keys, the caret is still in the box: select the name, so
    // that a second thought replaces it instead of being typed onto its end.
    if (document.activeElement === input) input.select();
  }

  /** What the box holds, as a question: the chosen name itself is not one. */
  const typedText = () => (input.value === chosen().label ? '' : input.value.trim());

  input.addEventListener('input', () => open(input.value.trim()));

  // A press in the box opens the whole list, the way a menu would. Focus alone
  // does not - tabbing through the page should not throw a list open on the way
  // past - but it does select the name, so the first key typed replaces it.
  input.addEventListener('focus', () => input.select());
  input.addEventListener('click', () => { if (!isOpen()) open(typedText()); });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!isOpen()) { open(typedText()); return; }
      if (!rows.length) return;
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActive(Math.min(rows.length - 1, Math.max(0, active + step)));
    } else if (event.key === 'Enter') {
      if (!isOpen()) return;
      event.preventDefault();
      if (active >= 0) choose(rows[active].value);
    } else if (event.key === 'Escape') {
      if (isOpen() || input.value !== chosen().label) {
        event.preventDefault();
        close();
        input.select();
      }
    }
  });

  input.addEventListener('blur', () => { if (isOpen() || input.value !== chosen().label) close(); });

  // Keep the focus where it is: see the header. On `mousedown` and not on
  // `pointerdown`, which is the same moment and not the same thing: WebKit
  // answers a cancelled pointerdown from a finger by never sending the click,
  // so the list opened for a mouse and did nothing at all on a phone. A
  // cancelled mousedown keeps the focus and costs nothing - a touch sends one
  // too, after the fact, and the click still follows it.
  list.addEventListener('mousedown', (event) => event.preventDefault());
  list.addEventListener('click', (event) => {
    const node = event.target instanceof Element ? event.target.closest('[role="option"]') : null;
    if (node) choose(node.dataset.value);
  });

  // The arrow at the end of the box. It opens the list without focusing the
  // box, which on a phone is the difference between a list and a list with a
  // keyboard over the bottom half of it. It is out of the tab order because the
  // down arrow already does its job for anybody using keys.
  toggle.addEventListener('mousedown', (event) => event.preventDefault());
  toggle.addEventListener('click', () => { if (isOpen()) close(); else open(''); });

  document.addEventListener('pointerdown', (event) => {
    if (isOpen() && event.target instanceof Node && !root.contains(event.target)) close();
  });

  close();
  return {
    /** The choice was changed from somewhere else: show it. */
    refresh: close,
  };
}
