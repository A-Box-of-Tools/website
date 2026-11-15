import { phrase } from './shared/phrases.js';
import {
  KEEN_EYE_ARCMIN, binoculars, clamp, dialPosition, dialPower, dialSpan, eyepieceFor, feetAt1000Yards, fieldFromFeet,
  fieldFromMetres, firstFault, magnifier, magnifierFocal, magnifierValue, metresAt1000, microscope,
  telescope, tidy, zoneEdges
} from './optics.js';
import { SUBJECTS, faintestStar, seen, shownBrightness } from './subjects.js';
import { CLOSE_PX_PER_ARCMIN, frameFor, paint } from './view.js';
import { caption, fault, figure, fit, how, millimetres, objectiveName, pair, power, readings, roughly, row, stats, story, verdict } from './words.js';

const $ = id => document.getElementById(id);
const page = $('main');
const dial = $('dial');
const quiet = matchMedia('(prefers-reduced-motion: reduce)');

const WORLDS = ['telescope', 'binoculars', 'microscope', 'magnifier'];

// The objectives on a school microscope's turret, by the name of the chip that picks
// each: its magnification and its numerical aperture.
const OBJECTIVES = { 4: [4, 0.1], 10: [10, 0.25], 40: [40, 0.65], 100: [100, 1.25] };

// The zones of each instrument's dial, lowest first, and the colour each is drawn in.
// Binoculars and magnifiers have zones of their own, in the same colours, because
// what limits them is not what limits a telescope.
const ZONES = {
  telescope: ['wasted', 'spare', 'sharp', 'full', 'empty'],
  binoculars: ['steady', 'care', 'tripod'],
  microscope: ['spare', 'sharp', 'full', 'empty'],
  magnifier: ['reading', 'inspect', 'loupe', 'beyond']
};
const TONES = { steady: 'sharp', care: 'full', tripod: 'empty', reading: 'spare', inspect: 'sharp', loupe: 'full', beyond: 'empty' };
const toneOf = zone => TONES[zone] || zone;

// What "the same instrument at other powers" lists: eyepieces every telescope owner
// meets, the binoculars on a shop's shelf, the turret, and the usual magnifiers.
const EYEPIECES = [40, 32, 25, 20, 15, 12, 10, 8, 6, 5, 4];
const PAIRS = [[8, 21], [8, 32], [8, 42], [10, 42], [10, 50], [7, 50], [12, 50], [15, 70]];
const LENSES = [2, 3, 5, 10, 15, 20];

// Which box holds each number, so a fault can be pinned on the box that caused it.
const BOXES = {
  telescope: { aperture: 'tel-aperture', focal: 'tel-focal', eyepiece: 'tel-eyepiece' },
  binoculars: { magnification: 'bin-power', objective: 'bin-objective', field: 'bin-field' },
  microscope: { objective: 'mic-power', na: 'mic-na', eyepiece: 'mic-eyepiece', fieldNumber: 'mic-fn' },
  magnifier: { power: 'mag-value', dioptre: 'mag-value', focal: 'mag-value', lens: 'mag-lens' }
};

// What was last chosen in each group of radio buttons. A language switch puts the
// choices back one button at a time, unchecking the old before checking the new, so
// for a moment a group has nothing chosen, and the page must not fall over in it.
const chosen = { world: 'telescope', telescope: 'moon', binoculars: 'bird-day', microscope: 'onion', magnifier: 'print', objective: '10' };
const results = {};
let shown = null;
let dragging = false;
let tween = null;
let announceTimer = 0;

const printed = [phrase('print.line.1'), phrase('print.line.2'), phrase('print.line.3'), phrase('print.micro')];
const face = getComputedStyle(document.body).fontFamily;

function setText(id, text) { $(id).textContent = text; }

function radio(name, otherwise) {
  const node = document.querySelector(`input[name="${name}"]:checked`);
  return node ? node.value : otherwise;
}

// A box's number, null when it is empty, and not a number when the browser could not
// read what is in it.
function typed(id) {
  const box = $(id);
  if (box.validity && box.validity.badInput) return Number.NaN;
  const text = box.value.trim();
  return text === '' ? null : Number(text);
}

const fieldTo = { degrees: value => value, metres: metresAt1000, feet: feetAt1000Yards };
const fieldFrom = { degrees: value => value, metres: fieldFromMetres, feet: fieldFromFeet };

// Everything one instrument's boxes say, read fresh every time. Nothing is taken from
// the event that prompted the reading: a language switch fires one for every box it
// puts back, in the page's order, and only the page as a whole is ever right.
function read(world) {
  const eyePupil = Number($('eye-pupil').value);
  if (world === 'telescope') {
    const values = {
      aperture: typed('tel-aperture'),
      focal: typed('tel-focal'),
      eyepiece: typed('tel-eyepiece'),
      barlow: Number($('tel-barlow').value),
      apparentField: Number($('apparent-field').value),
      barrel: Number($('barrel').value),
      eyePupil
    };
    return { values, checked: values };
  }
  if (world === 'binoculars') {
    const unit = $('bin-field-unit').value;
    const written = typed('bin-field');
    const values = {
      magnification: typed('bin-power'),
      objective: typed('bin-objective'),
      field: written === null || Number.isNaN(written) ? written : fieldFrom[unit](written),
      eyePupil,
      unit
    };
    return { values, checked: values };
  }
  if (world === 'microscope') {
    const preset = OBJECTIVES[chosen.objective];
    const values = {
      objective: preset ? preset[0] : typed('mic-power'),
      na: preset ? preset[1] : typed('mic-na'),
      eyepiece: typed('mic-eyepiece'),
      fieldNumber: typed('mic-fn')
    };
    return { values, checked: values };
  }
  const unit = $('mag-unit').value;
  // A lens marked in diopters is a lamp or reading magnifier, which is sold counted
  // with one added; a loupe marked with a power is not. Unless somebody has chosen a
  // rule, the page takes the one that goes with the kind of number typed.
  const rule = $('mag-rule').value;
  const close = rule === 'close' || (rule === 'auto' && unit === 'dioptre');
  const value = typed('mag-value');
  const values = { value, unit, close, lens: typed('mag-lens') };
  const usable = Number.isFinite(value) && value > (close && unit === 'power' ? 1 : 0);
  return { values, checked: { [unit]: value, lens: values.lens, close, focalLength: usable ? magnifierFocal(value, unit, close) : 0 } };
}

function work(world) {
  const { values, checked } = read(world);
  const wrong = firstFault(world, checked);
  if (wrong) return { values, checked, wrong };
  const id = chosen[world];
  const subject = SUBJECTS[id];
  let numbers;
  if (world === 'telescope') numbers = telescope(values);
  else if (world === 'binoculars') numbers = binoculars({ ...values, eyePupil: subject.pupil ?? values.eyePupil });
  else if (world === 'microscope') numbers = microscope(values);
  else numbers = magnifier(values);
  return { values, checked, numbers, id, subject, sight: seen(subject, numbers), span: dialSpan(world, values) };
}

// Canvases to draw small in, kept by size, so dragging the dial does not make a new
// one for every frame.
const layers = new Map();
function layerFor(wide, tall) {
  const key = `${wide}x${tall}`;
  if (!layers.has(key)) {
    if (layers.size > 24) layers.clear();
    const layer = document.createElement('canvas');
    layer.width = wide;
    layer.height = tall;
    layers.set(key, layer);
  }
  return layers.get(key);
}

function draw() {
  const state = results[chosen.world];
  if (!state || state.wrong || !shown) return;
  const { subject, id, numbers } = state;
  const common = { subject, id, backdrop: chosen.world === 'magnifier' ? 'paper' : 'slide', words: printed, face };
  const through = {
    ...common,
    power: shown.power,
    // The blur grows with the magnification, so on the way to a new one it is the
    // blur of wherever the picture has got to.
    blurArcmin: numbers.blurArcmin * shown.power / numbers.magnification,
    brightness: shownBrightness(subject, numbers.brightness),
    lit: chosen.world === 'microscope',
    faintest: faintestStar(numbers.lightGrasp ?? 1)
  };
  const wide = $('view').getBoundingClientRect().width;
  if (!wide) return;
  paint($('view'), { ...through, shownField: numbers.shownField, pxPerArcmin: wide / (frameFor(numbers.shownField) * 60) }, layerFor);
  paint($('close'), { ...through, shownField: 0, pxPerArcmin: CLOSE_PX_PER_ARCMIN }, layerFor);
  paint($('bare'), { ...common, power: 1, blurArcmin: KEEN_EYE_ARCMIN, brightness: 1, shownField: 0, pxPerArcmin: CLOSE_PX_PER_ARCMIN, lit: false, faintest: faintestStar(1) }, layerFor);
}

// Move the pictures to a new magnification. A change of instrument or of subject is a
// cut, since there is nothing in between to show; a change of power in the same view
// is a short zoom, eased in powers rather than in steps, so 20 to 40 takes as long as
// 200 to 400.
function aim(state, jump) {
  const target = state.numbers.magnification;
  const same = shown && shown.world === chosen.world && shown.id === state.id;
  if (jump || dragging || !same || quiet.matches) {
    tween = null;
    shown = { world: chosen.world, id: state.id, power: target };
    draw();
    return;
  }
  if (Math.abs(Math.log(target / shown.power)) < 1e-4) {
    draw();
    return;
  }
  const running = Boolean(tween);
  tween = { from: shown.power, to: target, started: performance.now() };
  if (!running) requestAnimationFrame(step);
}

function step(now) {
  if (!tween) return;
  const along = clamp((now - tween.started) / 320);
  const eased = 1 - (1 - along) ** 3;
  shown.power = Math.exp(Math.log(tween.from) + (Math.log(tween.to) - Math.log(tween.from)) * eased);
  draw();
  if (along < 1) requestAnimationFrame(step);
  else tween = null;
}

function renderDial(world, state, spoken, moveDial) {
  const edges = zoneEdges(world, state.numbers).map(edge => dialPosition(edge, state.span));
  const zones = ZONES[world];
  const stops = zones.map((zone, i) => `var(--z-${toneOf(zone)}) ${(i ? edges[i - 1] : 0) * 100}% ${(i < edges.length ? edges[i] : 1) * 100}%`);
  dial.style.setProperty('--track', `linear-gradient(90deg, ${stops.join(', ')})`);
  page.style.setProperty('--zone', `var(--z-${spoken.tone || toneOf(spoken.zone)})`);
  const ticks = zoneEdges(world, state.numbers).map((edge, i) => {
    const tick = document.createElement('span');
    tick.textContent = roughly(edge);
    tick.style.setProperty('--at', String(edges[i]));
    // An edge that falls off the end of the dial has no place to be written.
    tick.hidden = edges[i] <= 0.02 || edges[i] >= 0.98;
    return tick;
  });
  $('dial-ticks').replaceChildren(...ticks);
  $('dial-legend').replaceChildren(...zones.map(zone => {
    const item = document.createElement('li');
    item.textContent = phrase(`zone.${zone}`);
    item.style.setProperty('--dot', `var(--z-${toneOf(zone)})`);
    if (zone === spoken.zone) item.setAttribute('aria-current', 'true');
    return item;
  }));
  if (moveDial) dial.value = String(Math.round(dialPosition(state.numbers.magnification, state.span) * 1000));
  // The boxes say what the magnification is and the dial only follows them. Left
  // looking moved, it would travel with a language switch and rewrite a typed
  // eyepiece with its own rounder one.
  dial.defaultValue = dial.value;
  dial.setAttribute('aria-valuetext', phrase('dial.value', { power: power(state.numbers.magnification), zone: spoken.name }));
}

// One row of the ladder, as a button that puts its numbers in the boxes.
function rung(world, label, numbers, here, apply) {
  const spoken = verdict(world, numbers);
  const said = row(world, label, numbers, spoken);
  const item = document.createElement('li');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'mc-rung';
  button.setAttribute('aria-label', here ? phrase('row.here', { row: said.aloud }) : said.aloud);
  if (here) button.setAttribute('aria-current', 'true');
  const name = document.createElement('span');
  name.className = 'mc-rung-name';
  name.textContent = label;
  const facts = document.createElement('span');
  facts.className = 'mc-rung-facts';
  facts.textContent = said.facts.join(' · ');
  const zone = document.createElement('span');
  zone.className = 'mc-rung-zone';
  zone.textContent = spoken.name;
  zone.style.setProperty('--dot', `var(--z-${spoken.tone || toneOf(spoken.zone)})`);
  button.append(name, facts, zone);
  button.addEventListener('click', () => {
    apply();
    update();
  });
  item.append(button);
  return item;
}

function renderLadder(world, state) {
  const { values } = state;
  const near = (a, b) => Math.abs(a - b) < 1e-9;
  let rows;
  if (world === 'telescope') {
    rows = EYEPIECES.map(eyepiece => rung(world, millimetres(eyepiece), telescope({ ...values, eyepiece }), near(eyepiece, values.eyepiece), () => put('tel-eyepiece', eyepiece)));
  } else if (world === 'binoculars') {
    const eyePupil = state.subject.pupil ?? values.eyePupil;
    rows = PAIRS.map(([magnification, objective]) => rung(world, pair(magnification, objective), binoculars({ magnification, objective, eyePupil }), near(magnification, values.magnification) && near(objective, values.objective), () => {
      put('bin-power', magnification);
      put('bin-objective', objective);
      put('bin-field', '');
    }));
  } else if (world === 'microscope') {
    rows = Object.entries(OBJECTIVES).map(([pick, [objective, na]]) => rung(world, objectiveName(objective, na), microscope({ ...values, objective, na }), near(objective, values.objective) && near(na, values.na), () => put('mic-objective', pick)));
  } else {
    rows = LENSES.map(strength => rung(world, power(strength), magnifier({ value: strength, close: values.close }), near(strength, state.numbers.magnification), () => {
      put('mag-value', tidy(magnifierValue(strength, values.unit, values.close)));
      put('mag-lens', '');
    }));
  }
  // Pressing a row rebuilds the rows, and a keyboard's place in them would go with
  // the old ones.
  const list = $('ladder');
  const held = [...list.querySelectorAll('button')].indexOf(document.activeElement);
  list.replaceChildren(...rows);
  if (held >= 0) list.querySelectorAll('button')[held]?.focus();
}

// A box left empty takes a typical value, and shows it faintly so that the number
// being used is never a secret.
function renderHints(world, state) {
  const { values, numbers } = state;
  if (world === 'binoculars') $('bin-field').placeholder = figure(fieldTo[values.unit](numbers.trueField));
  if (world === 'microscope') $('mic-fn').placeholder = figure(numbers.fieldNumber);
  if (world === 'magnifier') $('mag-lens').placeholder = figure(numbers.lens);
  for (const [id, text] of Object.entries(readings(world, values, numbers))) setText(id, text);
}

function showFault(world, state) {
  const { wrong, values } = state;
  const id = BOXES[world][wrong.name];
  const name = document.querySelector(`label[for="${id}"]`).textContent;
  let { low, high } = wrong;
  // A field of view is checked as an angle and was typed as whatever is printed.
  if (wrong.name === 'field') [low, high] = [fieldTo[values.unit](low), fieldTo[values.unit](high)];
  $(id).setAttribute('aria-invalid', 'true');
  setText('input-error', fault(name, low, high, wrong.missing));
  $('input-error').hidden = false;
}

function update({ moveDial = true, jump = false } = {}) {
  chosen.world = radio('world', chosen.world);
  for (const name of WORLDS) chosen[name] = radio(`look-${name}`, chosen[name]);
  chosen.objective = radio('mic-objective', chosen.objective);
  const world = chosen.world;
  page.dataset.world = world;
  $('microscope-form').dataset.custom = String(chosen.objective === 'custom');
  for (const name of WORLDS) {
    results[name] = work(name);
    setText(`tab-${name}`, results[name].wrong ? '' : power(results[name].numbers.magnification));
  }
  for (const id of new Set(Object.values(BOXES[world]))) $(id).removeAttribute('aria-invalid');
  const state = results[world];
  if (state.wrong) {
    // The picture stays as it was: a half-typed number is not a reason to blank it.
    showFault(world, state);
    return;
  }
  $('input-error').hidden = true;
  setText('input-error', '');
  const { numbers, values, id, sight } = state;
  const spoken = verdict(world, numbers);
  const told = story(id, numbers, sight);
  const fits = fit(id, numbers, sight);
  setText('power', power(numbers.magnification));
  setText('power-how', how(world, values, numbers));
  setText('verdict-zone', spoken.name);
  setText('verdict-text', spoken.text);
  renderDial(world, state, spoken, moveDial);
  renderHints(world, state);
  for (const [place, text] of Object.entries(stats(world, values, numbers))) setText(place, text);
  renderLadder(world, state);
  setText('stage-caption', caption(world, id));
  setText('answer-story', told);
  setText('answer-fit', fits);
  $('view').setAttribute('aria-label', phrase('aria.view', { power: power(numbers.magnification), fit: fits }));
  $('close').setAttribute('aria-label', phrase('aria.close', { story: told }));
  $('bare').setAttribute('aria-label', phrase('aria.bare'));
  clearTimeout(announceTimer);
  announceTimer = setTimeout(() => {
    setText('announce', phrase('said.aloud', { power: power(numbers.magnification), zone: spoken.name, verdict: spoken.text, story: told, fit: fits }));
  }, 700);
  aim(state, jump);
}

// Write a number into a box, or choose a radio button by its group's name.
function put(key, value) {
  const box = $(key);
  if (box) {
    box.value = String(value);
    return;
  }
  for (const node of document.querySelectorAll(`input[name="${key}"]`)) node.checked = node.value === String(value);
}

// The eyepieces a dial can land on: tenths of a millimetre for short ones, and
// coarser as they lengthen, the way they are sold.
function snapEyepiece(length) {
  const grain = length < 10 ? 0.1 : length < 30 ? 0.5 : 1;
  return tidy(clamp(Math.round(length / grain) * grain, 2, 60), 4);
}
const snapPower = (value, low, high) => tidy(clamp(Math.round(value * 2) / 2, low, high), 4);

// The dial moves in magnification, and each instrument has one number that sets it:
// the eyepiece, in a telescope and a microscope, and the printed power otherwise.
// Moving the dial rewrites that number, which is the one place a control here writes
// to another, and it only ever happens under somebody's hand.
function turnDial() {
  const world = chosen.world;
  const state = results[world];
  if (!state || state.wrong) return;
  const { values, numbers, span } = state;
  const target = dialPower(Number(dial.value) / 1000, span);
  if (world === 'telescope') {
    put('tel-eyepiece', snapEyepiece(eyepieceFor(target, values.focal, values.barlow)));
  } else if (world === 'binoculars') {
    const next = snapPower(target, 2, 100);
    put('bin-power', next);
    // A printed field belongs to the printed power. At another power the same
    // eyepieces show the same circle, so the field is rewritten to keep it.
    if (values.field !== null) put('bin-field', tidy(fieldTo[values.unit](numbers.trueField * numbers.magnification / next)));
  } else if (world === 'microscope') {
    put('mic-eyepiece', snapPower(target / values.objective, 2, 40));
  } else {
    put('mag-value', tidy(magnifierValue(snapPower(target, 1.5, 60), values.unit, values.close)));
  }
  update({ moveDial: false });
}

dial.addEventListener('input', () => {
  dragging = true;
  turnDial();
});
dial.addEventListener('change', () => {
  dragging = false;
  update();
});
// The browser's own arrow step is a thousandth of the track, which would take forty
// presses to cross one zone.
dial.addEventListener('keydown', event => {
  const steps = { ArrowRight: 20, ArrowUp: 20, ArrowLeft: -20, ArrowDown: -20, PageUp: 100, PageDown: -100 };
  const move = steps[event.key];
  if (!move) return;
  event.preventDefault();
  dial.value = String(clamp(Number(dial.value) + move, 0, 1000));
  turnDial();
  dragging = false;
  update();
});

page.addEventListener('input', event => {
  if (event.target !== dial) update();
});
page.addEventListener('change', event => {
  if (event.target !== dial) update({ jump: event.target.type === 'radio' });
});

// An example is a row of settings written as the page would be asked for them: the
// name of a box or of a group of radio buttons, and what goes in it.
for (const button of document.querySelectorAll('[data-example]')) {
  button.addEventListener('click', () => {
    for (const part of button.dataset.example.split(' ')) {
      const [key, value] = part.split('=');
      put(key, value);
    }
    update({ jump: true });
    $('power').scrollIntoView({ block: 'nearest', behavior: quiet.matches ? 'auto' : 'smooth' });
  });
}

$('privacy-toggle').addEventListener('click', () => {
  const panel = $('privacy-panel');
  const open = panel.hidden;
  panel.hidden = !open;
  $('privacy-toggle').setAttribute('aria-expanded', String(open));
});

// The pictures are sized by the page, so they are drawn again whenever it resizes
// them, and for the first time once it has given them a size at all.
new ResizeObserver(() => draw()).observe($('view'));
quiet.addEventListener('change', () => draw());

update({ jump: true });
document.getElementById('boot-warning')?.remove();
