import { clamp } from './paint.js';

// The clock behind every scene. A scene is told where the number currently is and
// draws that; it never knows whether the number is resting, being dragged or
// halfway through a journey, so all five worlds move the same way.

const DRAG_EASE = 0.09;
const STEP_EASE = 0.26;
const FASTEST = 7;

export function createStage(canvas, paint) {
  const ctx = canvas.getContext('2d', { alpha: false });
  const quiet = matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0;
  let height = 0;
  let ratio = 1;
  let shown = 0;
  let target = 0;
  let ease = STEP_EASE;
  let velocity = 0;
  let journey = null;
  let visible = true;
  let paused = false;
  let dirty = true;
  let queued = false;
  let last = 0;
  let clock = 0;

  const moves = () => !quiet.matches && !paused;

  // A journey does not always arrive. A new number is aimed at, the stage jumps, another
  // journey starts, or motion is turned off under it, and each of those ends it where it
  // stands. Whoever started it is told all the same, once, because a button that offers
  // to stop a journey has to stop offering when there is none. This used to drop it
  // without a word, and the page was left guessing from whether any journey was running.
  function abandon() {
    const done = journey?.done;
    journey = null;
    return done;
  }

  // Out of view the stage asks for one frame when something changed and no more,
  // so it costs nothing there and is never found blank when it is scrolled back to.
  function wake() {
    if (queued || !width || (!visible && !dirty)) return;
    queued = true;
    requestAnimationFrame(frame);
  }

  function advance(dt) {
    if (journey) {
      journey.elapsed += dt;
      const progress = clamp(journey.elapsed / journey.seconds);
      // Eased at both ends only: a camera that stayed slow in the middle would
      // spend the journey on scales that are already on the way somewhere else.
      const eased = progress < 0.1 ? 5 * progress * progress : progress > 0.9 ? 1 - 5 * (1 - progress) ** 2 : progress;
      const next = journey.from + (journey.to - journey.from) * eased;
      velocity = dt ? (next - shown) / dt : 0;
      shown = next;
      if (progress >= 1) {
        const done = journey.done;
        journey = null;
        shown = target;
        velocity = 0;
        done?.();
      }
      return true;
    }
    const gap = target - shown;
    // The tail of an exponential never arrives, and it would leave the readout
    // ticking through 9.98 and 9.99 long after the picture has stopped moving.
    if (Math.abs(gap) < 0.004) {
      shown = target;
      velocity = 0;
      return false;
    }
    const step = clamp(gap * (1 - Math.exp(-dt / ease)), -FASTEST * dt, FASTEST * dt);
    shown += step;
    velocity = dt ? step / dt : 0;
    return true;
  }

  function frame(now) {
    queued = false;
    if (!width) return;
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 0);
    last = now;
    clock += dt;
    let moving = false;
    if (moves() && visible) {
      moving = advance(dt);
    } else if (!visible) {
      moving = false;
    } else if (shown !== target || journey) {
      const done = abandon();
      shown = target;
      velocity = 0;
      dirty = true;
      done?.();
    }
    if (moving || dirty || (moves() && visible)) {
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      paint(ctx, { w: width, h: height, t: clock, dt, log: shown, velocity, moving, motion: moves(), still: false });
      dirty = false;
    }
    if (visible && (moving || moves())) wake(); else last = 0;
  }

  function resize() {
    const box = canvas.getBoundingClientRect();
    ratio = clamp(globalThis.devicePixelRatio || 1, 1, 2);
    width = box.width;
    height = box.height;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    dirty = true;
    wake();
  }

  new ResizeObserver(resize).observe(canvas);
  // A sliver at the edge of the screen does not count as in view: the opening
  // journey should not spend itself where nobody can see it.
  new IntersectionObserver(entries => {
    visible = entries[entries.length - 1].intersectionRatio >= 0.25;
    last = 0;
    wake();
  }, { threshold: [0, 0.25, 0.5] }).observe(canvas);
  document.addEventListener('visibilitychange', () => {
    last = 0;
    if (!document.hidden) wake();
  });
  quiet.addEventListener('change', () => {
    dirty = true;
    last = 0;
    wake();
  });

  return {
    get playing() { return Boolean(journey); },
    get paused() { return paused; },
    get quiet() { return quiet.matches; },
    aim(position, { dragging = false } = {}) {
      const overtaken = abandon();
      target = position;
      ease = dragging ? DRAG_EASE : STEP_EASE;
      dirty = true;
      wake();
      overtaken?.();
    },
    jump(position) {
      const overtaken = abandon();
      target = position;
      shown = position;
      velocity = 0;
      dirty = true;
      wake();
      overtaken?.();
    },
    travel(from, to, seconds, done) {
      const overtaken = abandon();
      target = to;
      if (!moves()) {
        shown = to;
        dirty = true;
        wake();
        overtaken?.();
        done?.();
        return;
      }
      shown = from;
      journey = { from, to, seconds, elapsed: 0, done };
      wake();
      // Told last, here and above, with the stage already as it is going to be, so that
      // whatever the one being told asks of the stage is true.
      overtaken?.();
    },
    pause(value) {
      paused = value;
      dirty = true;
      last = 0;
      wake();
    },
    redraw() {
      dirty = true;
      wake();
    }
  };
}
