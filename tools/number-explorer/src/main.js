import { phrase } from './shared/phrases.js';
import { MAX_COUNT, parseCount, sandModel, textModel, countingModel, VOLUME_REFERENCES, chooseReference, compareVolume, countForVolume } from './scale.js';
import { drawScene, sceneGroupSize } from './scene.js';

const $ = id => document.getElementById(id);
const locale = document.documentElement.lang || undefined;
const numeric = new Intl.NumberFormat(locale, { maximumSignificantDigits: 3 });
const compact = new Intl.NumberFormat(locale, { notation: 'compact', maximumSignificantDigits: 3 });
const exact = new Intl.NumberFormat(locale);
const scientific = new Intl.NumberFormat(locale, { notation: 'scientific', maximumSignificantDigits: 3 });
const amount = $('amount');
const source = $('source');
let view = 'sand';
let current = null;
let lastBookLength = 75000;
let guessReference = null;

function number(value) {
  if (value === 0) return numeric.format(0);
  if (Math.abs(value) < 0.001 || Math.abs(value) >= 1e15) return scientific.format(value);
  return Math.abs(value) >= 1e6 ? compact.format(value) : numeric.format(value);
}

function setText(id, text) { $(id).textContent = text; }

function stat(value, key) {
  const item = document.createElement('div');
  item.className = 'detail-stat';
  const strong = document.createElement('strong');
  strong.textContent = number(value);
  const label = document.createElement('span');
  label.textContent = phrase(key);
  item.append(strong, label);
  return item;
}

function timeUnit(seconds) {
  const units = [['seconds', 1], ['minutes', 60], ['hours', 3600], ['days', 86400], ['years', 31557600], ['centuries', 3155760000]];
  return [...units].reverse().find(([, size]) => seconds >= size) || units[0];
}

function setView(next) {
  view = next === 'books' && source.value !== 'tokens' ? 'sand' : next;
  $('step-note').textContent = '';
  render();
}

function followup(key, handler) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = phrase(key);
  button.addEventListener('click', handler);
  return button;
}

function updateFollowups() {
  const buttons = [];
  if (view !== 'time') buttons.push(followup('follow.time', () => setView('time')));
  if (view !== 'sand') buttons.push(followup('follow.sand', () => setView('sand')));
  if (source.value === 'tokens' && view !== 'books') buttons.push(followup('follow.books', () => setView('books')));
  if (view === 'sand' && Number($('grain-size').value) < 1) {
    buttons.push(followup('follow.grain', () => {
      const sizes = [0.25, 0.5, 1];
      $('grain-size').value = String(sizes[sizes.indexOf(Number($('grain-size').value)) + 1]);
      render();
    }));
  }
  if (view === 'sand') buttons.push(followup('follow.mountain', () => {
    const count = countForVolume('mountain', Number($('grain-size').value));
    amount.value = String(count);
    source.value = 'sand';
    $('reference').value = 'mountain';
    render();
    setText('step-note', phrase('inverse.note', { number: number(Number(count)) }));
  }));
  buttons.push(followup('follow.thousand', () => multiply(1000n)));
  $('followups').replaceChildren(...buttons);
}

function multiply(factor) {
  const parsed = parseCount(amount.value);
  if (!parsed.ok) { render(); amount.focus(); return; }
  let next = factor < 0n ? parsed.count / -factor : parsed.count * factor;
  let note = '';
  if (factor < 0n && parsed.count > 0n && next === 0n) {
    note = phrase('step.whole');
    next = parsed.count;
  } else if (factor < 0n && parsed.count % -factor !== 0n) {
    note = phrase('step.rounded');
  }
  if (next > MAX_COUNT) { next = MAX_COUNT; note = phrase('step.limit'); }
  amount.value = String(next);
  render();
  setText('step-note', note);
}

function render() {
  const parsed = parseCount(amount.value);
  amount.setAttribute('aria-invalid', String(!parsed.ok));
  $('amount-error').hidden = parsed.ok;
  setText('amount-error', parsed.ok ? '' : phrase(parsed.key));
  if (!parsed.ok) {
    current = null;
    $('result-card').hidden = true;
    setText('read-number', '');
    return;
  }
  $('result-card').hidden = false;
  const count = parsed.count;
  const diameter = Number($('grain-size').value);
  const enteredBookLength = Number($('book-length').value);
  const validBookLength = Number.isInteger(enteredBookLength) && enteredBookLength >= 100 && enteredBookLength <= 1000000;
  $('book-length').setAttribute('aria-invalid', String(!validBookLength));
  $('settings-error').hidden = validBookLength;
  setText('settings-error', validBookLength ? '' : phrase('settings.invalid'));
  // An unfinished edit must not silently replace an accepted book length.
  if (validBookLength) lastBookLength = enteredBookLength;
  const rate = Number($('count-rate').value);
  $('books-view').disabled = source.value !== 'tokens';
  if (view === 'books' && source.value !== 'tokens') view = 'sand';
  document.querySelectorAll('[data-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.view === view)));
  setText('read-number', phrase('input.readback', { number: exact.format(count), object: phrase(`source.${source.value}`) }));
  setText('meaning-note', phrase(view === 'sand' ? `meaning.${source.value}` : `meaning.${view}`));
  setText('model-summary', phrase('model.summary', { diameter: number(diameter) }));
  $('volume-picker').hidden = view !== 'sand';
  $('guess-box').hidden = view !== 'sand';
  $('guess-answer').hidden = true;
  setText('save-note', '');
  let ratio, kind, unit, singleUnit, story, stats;
  if (view === 'sand') {
    const model = sandModel(count, diameter);
    const reference = $('reference').value === 'auto' ? chooseReference(model.volumeM3) : VOLUME_REFERENCES.find(item => item.id === $('reference').value);
    const comparison = compareVolume(model.volumeM3, reference.id);
    ratio = comparison.ratio;
    kind = reference.id;
    singleUnit = phrase(`one.${kind}`);
    unit = phrase(Math.abs(ratio - 1) < 1e-12 ? `one.${kind}` : `ref.${kind}`);
    story = count === 0n ? phrase('zero.story') : ratio < 0.01
      ? phrase('sand.tiny', { unit: phrase(`one.${kind}`), number: number(comparison.inverse) })
      : phrase('sand.story', { number: number(ratio), unit });
    stats = [stat(model.liters, 'stat.liters'), stat(model.cubeSideM, 'stat.edge')];
    // The prediction uses the next larger reference, rather than asking about
    // a container whose answer is already written in the headline.
    guessReference = VOLUME_REFERENCES.find(item => item.volumeM3 > reference.volumeM3) || reference;
    current = { count, sand: model, reference, diameter, rate, bookLength: lastBookLength };
    setText('guess-question', phrase('guess.question', { unit: phrase(`one.${guessReference.id}`) }));
    setText('guess-detail', phrase('guess.detail'));
  } else if (view === 'books') {
    const model = textModel(count, lastBookLength);
    ratio = model.books;
    kind = 'book';
    unit = phrase('ref.book');
    singleUnit = phrase('one.book');
    story = phrase('books.story', { words: number(model.words), length: exact.format(lastBookLength) });
    stats = [stat(model.words, 'stat.words'), stat(lastBookLength, 'stat.books')];
    current = { count, diameter, rate, bookLength: lastBookLength };
  } else {
    const model = countingModel(count, rate);
    const [id, size] = timeUnit(model.seconds);
    ratio = model.seconds / size;
    kind = 'clock';
    unit = phrase(`time.${id}`);
    singleUnit = phrase(`time.one.${id}`);
    story = phrase('time.story', { rate: number(rate) });
    stats = [stat(model.seconds, 'stat.seconds'), stat(rate, 'stat.rate')];
    current = { count, diameter, rate, bookLength: lastBookLength };
  }
  // A reversed reference can land one rounding bit below a whole container.
  // Keep that numerical noise from inventing a fractional counting picture.
  const nearest = Math.round(ratio);
  if (nearest > 0 && Math.abs(ratio - nearest) <= Math.max(1, ratio) * 1e-14) ratio = nearest;
  if (ratio === 1) unit = singleUnit;
  const display = number(ratio);
  setText('result-heading', count === 0n ? phrase('result.empty') : phrase('result.approximate'));
  setText('answer-number', display);
  setText('answer-unit', unit);
  setText('answer-story', story);
  $('detail-stats').replaceChildren(...stats);
  const group = sceneGroupSize(ratio);
  const fraction = ratio / group - Math.floor(ratio / group);
  const svg = drawScene({
    kind, ratio,
    label: phrase('scene.label', { number: display, unit }),
    description: story,
    groupLabel: phrase('scene.group', { number: number(group), unit: group === 1 ? singleUnit : unit }),
    fractionLabel: phrase('scene.part', { number: number(fraction) }),
    zeroLabel: phrase('scene.zero')
  });
  $('scene').replaceChildren(svg);
  setText('group-label', phrase('scene.group', { number: number(group), unit: group === 1 ? singleUnit : unit })
    + (fraction > 0 ? ` ${phrase('scene.fraction', { number: number(fraction) })}` : ''));
  setText('scene-note', phrase('scene.note'));
  $('less').disabled = count === 0n || count === 1n;
  $('more').disabled = count >= MAX_COUNT;
  updateFollowups();
}

function guess(answer) {
  if (!current?.sand || !guessReference) return;
  const fits = current.sand.volumeM3 <= guessReference.volumeM3 * (1 + 1e-12);
  setText('guess-answer', phrase(answer === fits ? 'guess.correct' : 'guess.again', { answer: phrase(fits ? 'guess.fits' : 'guess.over') }));
  $('guess-answer').hidden = false;
}

function save() {
  if (!current) return;
  const ns = 'http://www.w3.org/2000/svg';
  const wrapper = document.createElementNS(ns, 'svg');
  const scene = $('scene').firstElementChild.cloneNode(true);
  const box = scene.viewBox.baseVal;
  const width = 900;
  const sceneHeight = box.height * width / box.width;
  const lines = [ $('read-number').textContent, `${$('answer-number').textContent} ${$('answer-unit').textContent}`, $('meaning-note').textContent, $('answer-story').textContent,
    phrase('save.assumptions', { diameter: number(current.diameter), length: exact.format(current.bookLength), rate: number(current.rate) }),
    $('scene-note').textContent ];
  if (current.reference) {
    lines.push(phrase('save.reference', { unit: phrase(`one.${current.reference.id}`), volume: number(current.reference.volumeM3) }));
    if (current.reference.id === 'mountain') lines.push(phrase('save.mountain'));
  }
  const chunks = [];
  for (const line of lines) {
    const words = line.split(/\s+/);
    let part = '';
    for (const word of words) {
      if ((part + word).length > 90) { chunks.push(part); part = ''; }
      part += `${word} `;
    }
    if (part) chunks.push(part.trim());
  }
  const textHeight = 40 + chunks.length * 25;
  wrapper.setAttribute('xmlns', ns);
  wrapper.setAttribute('width', String(width));
  wrapper.setAttribute('height', String(textHeight + sceneHeight + 20));
  wrapper.setAttribute('viewBox', `0 0 ${width} ${textHeight + sceneHeight + 20}`);
  const background = document.createElementNS(ns, 'rect');
  background.setAttribute('width', '100%'); background.setAttribute('height', '100%'); background.setAttribute('fill', '#ffffff');
  wrapper.append(background);
  chunks.forEach((line, i) => {
    const text = document.createElementNS(ns, 'text');
    text.setAttribute('x', '30'); text.setAttribute('y', String(35 + i * 25));
    text.setAttribute('font-family', 'system-ui, sans-serif'); text.setAttribute('font-size', i === 1 ? '20' : '15'); text.setAttribute('fill', '#273740');
    text.textContent = line;
    wrapper.append(text);
  });
  scene.setAttribute('x', '0'); scene.setAttribute('y', String(textHeight)); scene.setAttribute('width', String(width)); scene.setAttribute('height', String(sceneHeight));
  wrapper.append(scene);
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(wrapper)], { type: 'image/svg+xml' }));
  const link = document.createElement('a');
  link.href = url; link.download = 'number-comparison.svg'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
  setText('save-note', phrase('save.done'));
}

amount.addEventListener('input', () => { setText('step-note', ''); render(); });
source.addEventListener('change', () => { setText('step-note', ''); render(); });
['reference', 'grain-size', 'count-rate'].forEach(id => $(id).addEventListener('change', render));
$('book-length').addEventListener('input', render);
document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => setView(button.dataset.view)));
document.querySelectorAll('[data-example]').forEach(button => button.addEventListener('click', () => {
  const example = button.dataset.example;
  source.value = example;
  amount.value = example === 'tokens' ? '1 million' : example === 'count' ? '1 trillion' : '1 billion';
  view = example === 'tokens' ? 'books' : example === 'count' ? 'time' : 'sand';
  $('grain-size').value = '0.5'; $('count-rate').value = '1'; $('reference').value = 'auto';
  setText('step-note', '');
  render();
}));
$('less').addEventListener('click', () => multiply(-10n));
$('more').addEventListener('click', () => multiply(10n));
$('guess-yes').addEventListener('click', () => guess(true));
$('guess-no').addEventListener('click', () => guess(false));
$('download-svg').addEventListener('click', save);
$('privacy-toggle').addEventListener('click', () => {
  const panel = $('privacy-panel');
  const open = panel.hidden;
  panel.hidden = !open;
  $('privacy-toggle').setAttribute('aria-expanded', String(open));
});
render();
document.getElementById('boot-warning')?.remove();
