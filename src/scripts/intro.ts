const KEY = 'dc-intro-seen';
const SCROLL_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageDown', ' ']);

const INERT = 'data-intro-inert';

/**
 * Emits `intro:done` once DOMContentLoaded has fired, never earlier, so scripts
 * that run after this module still hear it. In 'interactive' we cannot tell
 * whether DOMContentLoaded already fired, so `load` backs it up.
 */
function done(): void {
  const emit = () => document.dispatchEvent(new Event('intro:done'));
  if (document.readyState === 'complete') {
    setTimeout(emit, 0);
    return;
  }
  let sent = false;
  const once = () => {
    if (sent) return;
    sent = true;
    emit();
  };
  document.addEventListener('DOMContentLoaded', once, { once: true });
  window.addEventListener('load', once, { once: true });
}

function circle(w: number, h: number, cx: number, cy: number, r: number): string {
  // Even-odd path: the full viewport minus a circle, so the circle is a hole.
  return `path(evenodd, "M0 0H${w}V${h}H0Z M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z")`;
}

export function initIntro(opts: { autoMs?: number; growMs?: number } = {}): void {
  const { autoMs = 4000, growMs = 900 } = opts;
  const root = document.documentElement;

  if (!root.classList.contains('intro')) {
    done();
    return;
  }

  const layer = document.getElementById('intro');
  const btn = document.getElementById('intro-switch');
  if (!layer || !btn) {
    root.classList.remove('intro');
    done();
    return;
  }

  // Keep keyboard focus off the page behind the dark layer.
  for (const el of Array.from(document.body.children)) {
    if (el === layer || el instanceof HTMLScriptElement || el.hasAttribute('inert')) continue;
    el.setAttribute('inert', '');
    el.setAttribute(INERT, '');
  }

  let fired = false;
  let timer = 0;

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      btn.focus();
      return;
    }
    if (e.target === btn && (e.key === ' ' || e.key === 'Enter')) return; // the button's own click handles these
    if (SCROLL_KEYS.has(e.key)) {
      e.preventDefault();
      light();
    }
  };
  const onScroll = () => light();

  function finish(): void {
    root.classList.remove('intro', 'intro-lighting');
    for (const el of Array.from(document.querySelectorAll(`[${INERT}]`))) {
      el.removeAttribute('inert');
      el.removeAttribute(INERT);
    }
    try {
      localStorage.setItem(KEY, '1');
    } catch {
      // storage unavailable (private mode): the intro will simply show again next time
    }
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    done();
  }

  function light(): void {
    if (fired) return;
    fired = true;
    clearTimeout(timer);
    btn!.removeEventListener('click', light);
    window.removeEventListener('wheel', onScroll);
    window.removeEventListener('touchmove', onScroll);
    window.removeEventListener('keydown', onKey);

    root.classList.add('intro-lighting');
    const b = btn!.getBoundingClientRect();
    const cx = b.left + b.width / 2;
    const cy = b.top + b.height / 2;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const r = Math.ceil(Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy)));

    if (typeof layer!.animate !== 'function') {
      finish();
      return;
    }
    const anim = layer!.animate([{ clipPath: circle(w, h, cx, cy, 0) }, { clipPath: circle(w, h, cx, cy, r) }], {
      duration: growMs,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      fill: 'forwards',
    });
    anim.onfinish = () => {
      finish();
      anim.cancel();
    };
  }

  btn.addEventListener('click', light);
  window.addEventListener('wheel', onScroll, { passive: true });
  window.addEventListener('touchmove', onScroll, { passive: true });
  window.addEventListener('keydown', onKey);
  timer = window.setTimeout(light, autoMs);
  btn.focus();
  // Tells the failsafe in Base.astro's <head> script that the intro is running.
  root.dataset.introStarted = '';
}
