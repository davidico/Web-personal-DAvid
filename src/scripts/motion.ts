import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

/**
 * Wraps every letter of `el` in an `aria-hidden` span (words kept together so
 * they never break mid-word) and returns the letters. `<br>` and other element
 * children are left in place. The accessible name comes from the `aria-label`
 * the heading already carries.
 */
function splitLetters(el: HTMLElement): HTMLElement[] {
  const letters: HTMLElement[] = [];
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType !== Node.TEXT_NODE) continue;
    const frag = document.createDocumentFragment();
    for (const part of (node.textContent ?? '').split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        frag.append(' ');
        continue;
      }
      const word = document.createElement('span');
      word.className = 'split-word';
      word.setAttribute('aria-hidden', 'true');
      for (const ch of part) {
        const letter = document.createElement('span');
        letter.className = 'split-letter';
        letter.textContent = ch;
        word.append(letter);
        letters.push(letter);
      }
      frag.append(word);
    }
    node.replaceWith(frag);
  }
  return letters;
}

/** Same-page anchors scroll with Lenis instead of jumping. */
function bindAnchors(lenis: Lenis): void {
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const link = (e.target as Element | null)?.closest?.('a[href^="#"]');
    if (!(link instanceof HTMLAnchorElement) || link.hash.length < 2) return;
    let id: string;
    try {
      id = decodeURIComponent(link.hash.slice(1));
    } catch {
      return; // malformed % sequence: leave it to the browser
    }
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    history.pushState(null, '', link.hash);
    // Like a native fragment jump, move the sequential-focus start to the target.
    lenis.scrollTo(target, {
      onComplete: () => {
        if (!target.hasAttribute('tabindex')) {
          target.setAttribute('tabindex', '-1');
          target.setAttribute('data-anchor-focus', '');
        }
        target.focus({ preventScroll: true });
      },
    });
  });
}

export function initMotion(): void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.registerPlugin(ScrollTrigger);

  // The script sets the hidden starting state, so without JavaScript all is visible.
  const headline = document.querySelector<HTMLElement>('[data-split]');
  const letters = headline ? splitLetters(headline) : [];
  const reveals = gsap.utils.toArray<HTMLElement>('[data-reveal]');
  gsap.set(letters, { yPercent: 60, opacity: 0 });
  gsap.set(reveals, { y: 40, opacity: 0 });

  // Wait for the intro: before it, the page is dark and its own wheel/touch/key
  // triggers must reach intro.ts untouched by Lenis.
  document.addEventListener(
    'intro:done',
    () => {
      const lenis = new Lenis();
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
      bindAnchors(lenis);

      gsap.to(letters, {
        yPercent: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.03,
        clearProps: 'transform',
      });
      for (const el of reveals) {
        gsap.to(el, {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'power3.out',
          clearProps: 'transform',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        });
      }
    },
    { once: true },
  );
}
