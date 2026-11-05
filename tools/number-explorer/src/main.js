import { phrase } from './shared/phrases.js';
import { saveBlob } from './shared/download.js';
import { MAX_COUNT, countForSize, countText, dialCount, ladderFor, log10Count, parseCount, placeOnLadder, sizePerUnit } from './scale.js';
import { chip, chipBox, fittedSize, fontFor, useFont, widthOf, wrapLines, write } from './paint.js';
import { createStage } from './stage.js';
import { createBooksScene } from './scene-books.js';
import { createFillScene } from './scene-fill.js';
import { circleGroup, createStarsScene, starLevel } from './scene-stars.js';
import { createTimeScene } from './scene-time.js';
import { cached, capital, describe, duration, durationLong, exact, hud, joined, length, percent, pretty, readback, reading, rungName, sizeOf, times, volume } from './say.js';

const $ = id => document.getElementById(id);
const amount = $('amount');
const dial = $('dial');
const page = $('main');

let world = 'books';
let unit = 'book';
let count = 1000000000n;
let committed = count;
let previous = null;
let lastBookLength = 75000;
let showAllRungs = false;
let dragging = false;
let aimed = null;
let tallyFrom = 0;
let clockNow = 0;
let badgeTimer = 0;
let announceTimer = 0;

const scenes = {
  books: createBooksScene(),
  water: createFillScene('water'),
  sand: createFillScene('sand'),
  stars: createStarsScene(),
  time: createTimeScene()
};

function settings() {
  return {
    unit,
    thicknessM: Number($('book-thickness').value),
    wordsPerBook: lastBookLength,
    dropMl: Number($('drop-size').value),
    diameterMm: Number($('grain-size').value),
    rate: Number($('count-rate').value)
  };
}

function setText(id, text) { $(id).textContent = text; }

function stageWords() {
  return {
    name: id => capital(rungName(world, id)),
    length,
    duration,
    volume,
    top: value => (world === 'books' ? length(value) : world === 'time' ? duration(value) : volume(value)),
    long: durationLong,
    before: value => phrase('stage.before', { value: world === 'books' ? length(value) : world === 'time' ? duration(value) : world === 'stars' ? pretty(value) : volume(value) }),
    full: share => phrase('stage.full', { share: percent(share) }),
    times,
    passed: (id, ratio) => phrase('stage.passed', { name: rungName(world, id), times: times(ratio) }),
    share: share => phrase('stage.share', { share: percent(share) }),
    level: id => cached(`level.${id}`),
    tally: (counted, fraction) => phrase('stage.tally', { count: pretty(counted), share: percent(fraction) })
  };
}

function paint(ctx, frame) {
  const current = settings();
  const perUnit = sizePerUnit(world, current);
  const rungs = ladderFor(world, current);
  const zero = count === 0n;
  const measure = zero ? 0 : 10 ** frame.log * perUnit;
  if (!frame.still) clockNow = frame.t;
  const corner = zero ? null : readoutCorner(ctx, frame, hud(world, frame.log, current, perUnit), measure, rungs);
  const drawn = scenes[world].draw(ctx, {
    ...frame,
    amount: measure,
    perUnit,
    zero,
    rungs,
    readout: corner?.box ?? null,
    thickness: current.thicknessM,
    words: stageWords(),
    previous: previous === null || stage.playing ? null : Number(previous) * perUnit,
    sinceOpened: frame.t - tallyFrom
  });
  if (zero) return;
  const pale = drawn.dark <= 0.5;
  const fill = pale ? '#121a24' : '#f5f8fd';
  const halo = pale ? 'rgba(255,255,255,.8)' : 'rgba(3,6,16,.78)';
  const { line, size, next, nextAt, nextChip } = corner;
  write(ctx, line.big, 14, 24, { size, weight: 800, fill, halo, within: frame.w });
  if (line.small) write(ctx, line.small, 14, 46, { size: 13, weight: 600, fill, halo, within: frame.w });
  if (next) chip(ctx, next, 14, nextAt, { ...nextChip, fill: pale ? 'rgba(255,255,255,.88)' : 'rgba(255,255,255,.14)', ink: pale ? '#121a24' : '#f5f8fd', stroke: pale ? 'rgba(18,26,36,.18)' : 'rgba(255,255,255,.24)' });
}

// The readout is written last, over the scene, so the scene has to be told where it will be.
function readoutCorner(ctx, frame, line, measure, rungs) {
  const size = fittedSize(ctx, line.big, frame.w < 480 ? 16 : 19, 800, frame.w - 22);
  // What the number is climbing toward, always in view: most of the sky between two
  // landmarks is otherwise empty, and the next one is the reason to keep going.
  const { above, share } = world === 'water' || world === 'sand' ? {} : placeOnLadder(measure, rungs);
  const next = above ? phrase('stage.next', { name: rungName(world, above.id), share: percent(share) }) : '';
  const nextAt = line.small ? 72 : 50;
  const nextChip = { size: 12, weight: 600, within: frame.w };
  const nextBox = next ? chipBox(ctx, next, 14, nextAt, nextChip) : null;
  const words = Math.max(widthOf(ctx, line.big, size, 800), line.small ? widthOf(ctx, line.small, 13, 600) : 0);
  const box = { left: 0, right: Math.min(frame.w, Math.max(words + 18, nextBox?.right ?? 0)), top: 0, bottom: nextBox?.bottom ?? (line.small ? 54 : 36) };
  return { line, size, next, nextAt, nextChip, box };
}

const stage = createStage($('stage'), paint);

function showBadge(ratio) {
  clearTimeout(badgeTimer);
  const badge = $('magnify');
  if (!(ratio >= 2 || ratio <= 0.5)) {
    badge.hidden = true;
    return;
  }
  badge.textContent = ratio >= 1 ? `× ${pretty(Math.round(ratio))}` : `÷ ${pretty(Math.round(1 / ratio))}`;
  badge.hidden = false;
  badge.classList.remove('ne-pop');
  void badge.offsetWidth;
  badge.classList.add('ne-pop');
  badgeTimer = setTimeout(() => { badge.hidden = true; }, 1900);
}

// One gesture, however many values it passes through, is one change: the marker
// left behind shows where the number stood before the whole drag or the typing.
function commit() {
  if (count === committed) return;
  previous = committed;
  if (previous > 0n && count > 0n) showBadge(Number(count) / Number(previous));
  committed = count;
  stage.redraw();
}

function renderTabs(current) {
  for (const name of Object.keys(scenes)) {
    const said = describe(name, count, current, sizePerUnit(name, current), ladderFor(name, current));
    setText(`tab-${name}`, said.tab);
    document.querySelector(`[data-world="${name}"]`).setAttribute('aria-pressed', String(name === world));
  }
}

function renderLadder(said, rungs, perUnit) {
  const value = Number(count) * perUnit;
  const here = said.place.index;
  const low = showAllRungs ? 0 : Math.max(0, here - 2);
  const high = showAllRungs ? rungs.length - 1 : Math.min(rungs.length - 1, here + 3);
  const rows = [];
  for (let i = high; i >= low; i--) {
    if (i === here) rows.push(hereRow(said));
    rows.push(rungRow(rungs[i], value, perUnit));
  }
  if (here < low) rows.push(hereRow(said));
  $('ladder').replaceChildren(...rows);
  $('ladder-all').hidden = rungs.length <= 6;
  $('ladder-all').setAttribute('aria-expanded', String(showAllRungs));
  setText('ladder-all', cached(showAllRungs ? 'ladder.fewer' : 'ladder.all'));
}

function hereRow(said) {
  const row = document.createElement('li');
  row.className = 'ne-here';
  const label = document.createElement('span');
  label.textContent = cached('ladder.here');
  const value = document.createElement('strong');
  value.textContent = said.tab;
  row.append(label, value);
  return row;
}

function rungRow(rung, value, perUnit) {
  const row = document.createElement('li');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'ne-rung';
  const reach = countForSize(rung.size, perUnit);
  if (reach === null || reach < 1n) button.disabled = true;
  const name = document.createElement('span');
  name.className = 'ne-rung-name';
  name.textContent = capital(rungName(world, rung.id));
  const size = document.createElement('span');
  size.className = 'ne-rung-size';
  size.textContent = sizeOf(world, rung.size);
  const ratio = document.createElement('span');
  ratio.className = 'ne-rung-ratio';
  ratio.textContent = value >= rung.size ? times(value / rung.size) : percent(value / rung.size);
  button.append(name, size, ratio);
  button.addEventListener('click', () => {
    setCount(reach);
    commit();
    setText('step-note', phrase('jump.note', { number: pretty(Number(reach)), name: rungName(world, rung.id) }));
  });
  row.append(button);
  return row;
}

function followup(key, handler) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = phrase(key);
  button.addEventListener('click', handler);
  return button;
}

function renderFollowups(current) {
  const buttons = [];
  const go = (key, next, change) => buttons.push(followup(key, () => { change?.(); switchWorld(next); }));
  if (world !== 'stars') go('follow.stars', 'stars');
  if (world !== 'water') go('follow.water', 'water');
  if (world !== 'time') go('follow.time', 'time');
  if (world !== 'books') go('follow.books', 'books', () => setUnit('book'));
  if (world === 'books' && unit !== 'token') buttons.push(followup('follow.tokens', () => setUnit('token')));
  if (world === 'sand' && current.diameterMm < 1) {
    buttons.push(followup('follow.grain', () => {
      const sizes = [0.25, 0.5, 1];
      $('grain-size').value = String(sizes[sizes.indexOf(current.diameterMm) + 1]);
      update();
    }));
  }
  buttons.push(followup('follow.thousand', () => multiply(1000n)));
  $('followups').replaceChildren(...buttons.slice(0, 4));
}

function renderGuess(place, perUnit) {
  const rung = place.above;
  const next = count * 10n;
  const box = $('guess-box');
  // Asked about the step still to come, because the answer to anything about the
  // present is already written in the ladder right beside this box.
  box.hidden = !rung || next > MAX_COUNT || count === 0n;
  if (box.hidden) return;
  const family = world === 'water' || world === 'sand' ? 'fill' : world;
  setText('guess-question', phrase(`guess.${family}`, { name: rungName(world, rung.id) }));
  box.dataset.reaches = String(Number(next) * perUnit >= rung.size * (1 - 1e-12));
}

function guess(answer) {
  const reaches = $('guess-box').dataset.reaches === 'true';
  const said = phrase(answer === reaches ? 'guess.right' : 'guess.wrong', { fact: phrase(reaches ? 'guess.yes' : 'guess.no') });
  multiply(10n);
  setText('guess-answer', said);
  $('guess-answer').hidden = false;
}

function renderCaption() {
  const key = {
    books: 'caption.books',
    water: 'caption.fill',
    sand: 'caption.fill',
    time: 'caption.time'
  }[world];
  if (key) {
    const lines = [phrase(key)];
    if (world === 'books' && unit !== 'book') lines.unshift(phrase(`meaning.${unit}`));
    setText('stage-caption', joined(lines));
    return;
  }
  const stars = Number(count);
  const level = starLevel(stars);
  setText('stage-caption', phrase(`caption.stars.${level.id}`, { number: pretty(level.id === 'multi' ? circleGroup(stars / 1e23) : level.perDot) }));
}

function aloud(said) {
  return phrase('said.aloud', { kicker: said.kicker, number: said.number, unit: said.unit, story: said.story });
}

function announce(said) {
  clearTimeout(announceTimer);
  announceTimer = setTimeout(() => {
    setText('announce', aloud(said));
  }, 500);
}

function update({ moveDial = true, jump = false } = {}) {
  const parsed = parseCount(amount.value, reading);
  amount.setAttribute('aria-invalid', String(!parsed.ok));
  $('amount-error').hidden = parsed.ok;
  setText('amount-error', parsed.ok ? '' : phrase(parsed.key));
  if (!parsed.ok) {
    setText('read-number', '');
    return;
  }
  if (parsed.count !== count) tallyFrom = clockNow;
  count = parsed.count;
  const enteredBookLength = Number($('book-length').value);
  const validBookLength = Number.isInteger(enteredBookLength) && enteredBookLength >= 100 && enteredBookLength <= 1000000;
  $('book-length').setAttribute('aria-invalid', String(!validBookLength));
  $('settings-error').hidden = validBookLength;
  setText('settings-error', validBookLength ? '' : phrase('settings.invalid'));
  // An unfinished edit must not silently replace an accepted book length.
  if (validBookLength) lastBookLength = enteredBookLength;
  const current = settings();
  const perUnit = sizePerUnit(world, current);
  const rungs = ladderFor(world, current);
  const said = describe(world, count, current, perUnit, rungs);
  const position = log10Count(count);
  setText('read-number', readback(count));
  if (moveDial) dial.value = String(position);
  // The box says what the number is, and the dial only follows it. Left looking moved,
  // the dial would travel with a language switch and rewrite the exact count it found
  // there in its own two significant digits.
  dial.defaultValue = dial.value;
  dial.style.setProperty('--fill', `${position / 30 * 100}%`);
  dial.setAttribute('aria-valuetext', readback(count));
  page.dataset.scene = world;
  setText('answer-kicker', said.kicker);
  setText('answer-number', said.number);
  setText('answer-unit', said.unit);
  setText('answer-story', said.story);
  $('stage').setAttribute('aria-label', aloud(said));
  $('unit-row').hidden = world !== 'books';
  document.querySelectorAll('[data-unit]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.unit === unit)));
  $('less').disabled = count === 0n || count === 1n;
  $('more').disabled = count >= MAX_COUNT;
  renderTabs(current);
  renderLadder(said, rungs, perUnit);
  renderFollowups(current);
  renderGuess(said.place, perUnit);
  renderCaption();
  setText('model-summary', phrase('model.summary', { diameter: pretty(current.diameterMm) }));
  announce(said);
  // Only a new position moves the camera: a setting or a fold changing must not
  // cut short a journey that is on its way to the same number.
  if (jump) stage.jump(position);
  else if (position !== aimed) stage.aim(position, { dragging });
  aimed = position;
  setPlaying(stage.playing);
}

function setCount(next) {
  amount.value = countText(next, reading);
  $('guess-answer').hidden = true;
  setText('step-note', '');
  setText('save-note', '');
  update();
}

function setUnit(next) {
  unit = next;
  previous = null;
  update();
  stage.redraw();
}

function multiply(factor) {
  const parsed = parseCount(amount.value, reading);
  if (!parsed.ok) { update(); amount.focus(); return; }
  let next = factor < 0n ? parsed.count / -factor : parsed.count * factor;
  let note = '';
  if (factor < 0n && parsed.count > 0n && next === 0n) {
    note = phrase('step.whole');
    next = parsed.count;
  } else if (factor < 0n && parsed.count % -factor !== 0n) {
    note = phrase('step.rounded');
  }
  if (next > MAX_COUNT) { next = MAX_COUNT; note = phrase('step.limit'); }
  setCount(next);
  commit();
  setText('step-note', note);
}

function switchWorld(next) {
  world = next;
  previous = null;
  tallyFrom = clockNow;
  $('magnify').hidden = true;
  $('guess-answer').hidden = true;
  setText('step-note', '');
  update();
  // Each world opens by growing into the number, so changing the picture is also
  // seeing this number's size again rather than a cut to a finished image. It is
  // too short to offer a Stop for.
  if (count > 0n) stage.travel(Math.max(0, log10Count(count) - 2.2), log10Count(count), 0.9);
  setPlaying(false);
}

function journey(from, seconds) {
  const to = log10Count(count);
  setPlaying(true);
  stage.travel(from, to, seconds, () => setPlaying(false));
}

function setPlaying(playing) {
  $('play').setAttribute('aria-pressed', String(playing));
  setText('play-label', cached(playing ? 'play.stop' : 'play.start'));
}

function play() {
  if (stage.playing) {
    stage.jump(log10Count(count));
    setPlaying(false);
    return;
  }
  previous = null;
  journey(0, Math.min(14, Math.max(1.8, log10Count(count) * 0.55)));
}

function caption() {
  const current = settings();
  return [
    $('read-number').textContent,
    `${$('answer-number').textContent} ${$('answer-unit').textContent}`,
    $('answer-story').textContent,
    $('stage-caption').textContent,
    phrase('save.assumptions', { thickness: pretty(current.thicknessM * 100), length: exact(current.wordsPerBook), drop: pretty(current.dropMl), diameter: pretty(current.diameterMm), rate: pretty(current.rate) })
  ];
}

function savePicture() {
  const scale = 2;
  const width = 1000;
  const height = 562;
  const measure = document.createElement('canvas').getContext('2d');
  const lines = caption().flatMap(sentence => wrapLines(measure, sentence, width - 48, 15, 500));
  const textHeight = 28 + lines.length * 23;
  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = (height + textHeight) * scale;
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, width, height);
  ctx.clip();
  paint(ctx, { w: width, h: height, t: 2.5, dt: 0, log: log10Count(count), velocity: 0, moving: false, motion: false, still: true });
  ctx.restore();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, height, width, textHeight);
  ctx.fillStyle = '#273740';
  ctx.textBaseline = 'middle';
  lines.forEach((line, i) => {
    ctx.font = fontFor(i === 1 ? 17 : 15, i === 1 ? 700 : 500);
    ctx.fillText(line, 24, height + 26 + i * 23);
  });
  canvas.toBlob(blob => {
    if (!blob) return;
    saveBlob(blob, `number-explorer-${world}.png`);
    setText('save-note', phrase('save.done'));
  }, 'image/png');
}

function drawTicks() {
  const ticks = $('dial-ticks');
  const short = new Intl.NumberFormat(document.documentElement.lang || undefined, { notation: 'compact', compactDisplay: 'short' });
  for (const power of [0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30]) {
    // Labels rather than buttons: the dial is the control, and these are a shortcut
    // along it for a pointer, too close together to be targets for a finger.
    const tick = document.createElement('span');
    tick.textContent = power === 0 ? '1' : power <= 12 ? short.format(10 ** power) : pretty(10 ** power);
    tick.style.setProperty('--at', String(power / 30));
    if (power % 6) tick.classList.add('ne-tick-minor');
    if (power === 24) tick.classList.add('ne-tick-spare');
    tick.addEventListener('click', () => {
      setCount(10n ** BigInt(power));
      commit();
    });
    ticks.append(tick);
  }
}

amount.addEventListener('input', () => {
  dragging = false;
  $('guess-answer').hidden = true;
  setText('step-note', '');
  update();
});
amount.addEventListener('change', commit);
// A language switch carries what is in the box as text, and the same text can be
// another number on the far side: "2 billion" is 2 × 10^12 in German. Plain digits read
// alike in every language, so they are what goes, ahead of the switcher's own listener.
document.addEventListener('click', event => {
  if (!event.target.closest?.('a[hreflang]') || amount.value === amount.defaultValue) return;
  const parsed = parseCount(amount.value, reading);
  if (parsed.ok) amount.value = parsed.count.toString();
}, true);

dial.addEventListener('input', () => {
  dragging = true;
  amount.value = countText(dialCount(Number(dial.value)), reading);
  $('guess-answer').hidden = true;
  setText('step-note', '');
  update({ moveDial: false });
});
dial.addEventListener('change', () => {
  dragging = false;
  commit();
});
// The browser's own arrow step is the dial's finest, a hundredth of a power of ten,
// which would take a hundred presses to do what one drag does.
dial.addEventListener('keydown', event => {
  const steps = { ArrowRight: 0.25, ArrowUp: 0.25, ArrowLeft: -0.25, ArrowDown: -0.25, PageUp: 1, PageDown: -1 };
  const step = steps[event.key];
  if (!step) return;
  event.preventDefault();
  dial.value = String(Math.max(0, Math.min(30, Number(dial.value) + step)));
  dial.dispatchEvent(new Event('input', { bubbles: true }));
  dial.dispatchEvent(new Event('change', { bubbles: true }));
});

document.querySelectorAll('[data-world]').forEach(button => button.addEventListener('click', () => {
  if (button.dataset.world !== world) switchWorld(button.dataset.world);
}));
document.querySelectorAll('[data-unit]').forEach(button => button.addEventListener('click', () => setUnit(button.dataset.unit)));
document.querySelectorAll('[data-example]').forEach(button => button.addEventListener('click', () => {
  const [next, value, nextUnit] = button.dataset.example.split(':');
  unit = nextUnit || 'book';
  amount.value = value;
  world = next;
  previous = null;
  $('guess-answer').hidden = true;
  setText('step-note', '');
  update();
  committed = count;
  $('magnify').hidden = true;
  journey(0, Math.min(10, Math.max(1.6, log10Count(count) * 0.42)));
}));

$('ladder-all').addEventListener('click', () => {
  showAllRungs = !showAllRungs;
  update();
});
$('less').addEventListener('click', () => multiply(-10n));
$('more').addEventListener('click', () => multiply(10n));
$('guess-yes').addEventListener('click', () => guess(true));
$('guess-no').addEventListener('click', () => guess(false));
$('download-picture').addEventListener('click', savePicture);
$('play').addEventListener('click', play);
$('still').addEventListener('click', () => {
  const pausing = !stage.paused;
  stage.pause(pausing);
  $('still').setAttribute('aria-pressed', String(pausing));
  setText('still-label', cached(pausing ? 'still.resume' : 'still.pause'));
});
['book-thickness', 'drop-size', 'grain-size', 'count-rate'].forEach(id => $(id).addEventListener('change', () => { update(); stage.redraw(); }));
$('book-length').addEventListener('input', () => { update(); stage.redraw(); });
$('privacy-toggle').addEventListener('click', () => {
  const panel = $('privacy-panel');
  const open = panel.hidden;
  panel.hidden = !open;
  $('privacy-toggle').setAttribute('aria-expanded', String(open));
});

useFont(getComputedStyle(document.body).fontFamily);
drawTicks();
update({ jump: true });
if (stage.quiet) {
  $('stage-controls').hidden = true;
} else {
  // The first thing the page does is the thing it is for.
  journey(0, Math.min(5.5, Math.max(1.8, log10Count(count) * 0.5)));
}
document.getElementById('boot-warning')?.remove();
