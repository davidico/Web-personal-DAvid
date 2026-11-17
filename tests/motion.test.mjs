import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startPreview, newPage } from './helpers.mjs';

let server, url, browser, page;

before(async () => {
  server = await startPreview();
  url = server.url;
  ({ browser, page } = await newPage({ seen: true }));
});
after(async () => {
  await browser?.close();
  await server?.stop();
});

test('motion: al recorrer la página todo acaba visible', async () => {
  await page.goto(url);
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= h; y += 400) { await page.mouse.wheel(0, 400); await page.waitForTimeout(120); }
  await page.waitForTimeout(1200);
  const hidden = await page.evaluate(() => [...document.querySelectorAll('[data-reveal]')]
    .filter(e => parseFloat(getComputedStyle(e).opacity) < 0.99).length);
  assert.equal(hidden, 0);
});
test('motion: el titular conserva su texto accesible', async () => {
  await page.goto(url);
  assert.equal(await page.getAttribute('h1', 'aria-label'), 'You bring your business. I make it live.');
});
test('motion: con movimiento reducido nada se oculta ni se transforma', async () => {
  const { page: p, browser } = await newPage({ seen: true, reducedMotion: 'reduce' });
  try {
    await p.goto(url);
    const touched = await p.evaluate(() => [...document.querySelectorAll('[data-reveal],[data-split]')]
      .filter(e => { const s = getComputedStyle(e); return s.opacity !== '1' || s.transform !== 'none'; }).length);
    assert.equal(touched, 0);
  } finally {
    await browser.close();
  }
});
test('motion: el enlace Work lleva a la sección', async () => {
  await page.goto(url);
  await page.click('header a[href="#work"]');
  await page.waitForFunction(() => document.querySelector('#work').getBoundingClientRect().top < 200);
});
test('motion: Lenis está activo tras cargar', async () => {
  await page.goto(url);
  await page.waitForFunction(() => document.documentElement.classList.contains('lenis'), null, { timeout: 3000 });
});
test('motion: antes de recorrer, lo que está bajo el pliegue sigue oculto', async () => {
  await page.goto(url);
  const hiddenBelow = await page.evaluate(() => [...document.querySelectorAll('[data-reveal]')]
    .filter(e => e.getBoundingClientRect().top > innerHeight && parseFloat(getComputedStyle(e).opacity) < 1).length);
  assert.ok(hiddenBelow > 0, 'ningún [data-reveal] bajo el pliegue empieza oculto');
});
test('motion: el titular se parte en letras y todas acaban visibles', async () => {
  await page.goto(url);
  assert.ok(await page.locator('[data-split] .split-letter').count() > 0, 'el titular no está partido en letras');
  await page.waitForFunction(() => [...document.querySelectorAll('[data-split] .split-letter')]
    .every(e => getComputedStyle(e).opacity === '1'), null, { timeout: 5000 });
});
test('motion: el enlace Work se desplaza suavemente, sin saltar', async () => {
  await page.goto(url);
  await page.waitForFunction(() => document.documentElement.classList.contains('lenis'), null, { timeout: 3000 });
  await page.evaluate(() => {
    window.__ys = [];
    const tick = () => { window.__ys.push(scrollY); requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });
  const start = await page.evaluate(() => scrollY);
  await page.click('header a[href="#work"]');
  await page.waitForFunction(() => Math.abs(document.querySelector('#work').getBoundingClientRect().top) < 2);
  const end = await page.evaluate(() => scrollY);
  const ys = await page.evaluate(() => window.__ys);
  assert.ok(end - start > 400, `apenas hubo desplazamiento (${start} → ${end})`);
  assert.ok(ys.some(y => y > start + 1 && y < end - 1), 'el desplazamiento saltó sin valores intermedios');
});
test('motion: activar Work con el teclado lleva el foco a la sección', async () => {
  await page.goto(url);
  await page.waitForFunction(() => document.documentElement.classList.contains('lenis'), null, { timeout: 3000 });
  await page.focus('header a[href="#work"]');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => document.activeElement === document.querySelector('#work'), null, { timeout: 5000 });
  await page.keyboard.press('Tab');
  // Project cards are not links yet, so the next stop is the first control after #work.
  assert.equal(await page.evaluate(() => {
    const work = document.querySelector('#work');
    return !!(work.compareDocumentPosition(document.activeElement) & Node.DOCUMENT_POSITION_FOLLOWING)
      || work.contains(document.activeElement);
  }), true);
});
test('motion: un ancla con % mal formado no lanza errores', async () => {
  await page.goto(url);
  await page.waitForFunction(() => document.documentElement.classList.contains('lenis'), null, { timeout: 3000 });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.evaluate(() => {
    const a = document.createElement('a');
    a.href = '#%E0%A4%A';
    a.textContent = 'bad';
    document.body.append(a);
    a.click();
  });
  await page.waitForTimeout(200);
  assert.deepEqual(errors, []);
});
test('motion: en una visita repetida el titular no se pinta antes de partirse', async () => {
  const { page: p, browser } = await newPage({ seen: true });
  try {
    await p.route(/\/_astro\/.*\.js$/, async route => {
      await new Promise(r => setTimeout(r, 1500));
      try { await route.continue(); } catch { /* page already closed */ }
    });
    await p.goto(url, { waitUntil: 'commit' });
    await p.waitForSelector('h1', { state: 'attached' });
    const first = await p.evaluate(() => {
      const h = document.querySelector('h1');
      return { split: !!h.querySelector('.split-letter'), visibility: getComputedStyle(h).visibility };
    });
    assert.deepEqual(first, { split: false, visibility: 'hidden' });
    await p.waitForFunction(() => {
      const ls = [...document.querySelectorAll('[data-split] .split-letter')];
      return ls.length > 0 && ls.every(e => getComputedStyle(e).opacity === '1')
        && getComputedStyle(document.querySelector('h1')).visibility === 'visible';
    }, null, { timeout: 6000 });
  } finally {
    await browser.close();
  }
});
test('motion: si el módulo de movimiento no carga, el titular aparece tras el failsafe', async () => {
  const { page: p, browser } = await newPage({ seen: true });
  try {
    await p.route(/\/_astro\/.*\.js$/, route => route.abort());
    await p.goto(url);
    await p.waitForFunction(() => getComputedStyle(document.querySelector('h1')).visibility === 'visible'
      && !document.documentElement.classList.contains('motion-pending'), null, { timeout: 5000 });
  } finally {
    await browser.close();
  }
});
test('motion: pulsar dos veces el mismo ancla no duplica el historial', async () => {
  await page.goto(url);
  await page.waitForFunction(() => document.documentElement.classList.contains('lenis'), null, { timeout: 3000 });
  const n0 = await page.evaluate(() => history.length);
  await page.click('header a[href="#work"]');
  await page.waitForFunction(() => location.hash === '#work');
  await page.click('header a[href="#work"]');
  await page.waitForTimeout(200);
  assert.equal(await page.evaluate(() => history.length), n0 + 1);
});
test('motion: si la puesta en marcha falla, nada queda oculto', async () => {
  const { page: p, browser } = await newPage({ seen: true });
  try {
    // Lenis listens for `scrollend` on window; make that throw inside the setup.
    await p.addInitScript(() => {
      const add = window.addEventListener;
      window.addEventListener = function (type, ...rest) {
        if (type === 'scrollend') throw new Error('boom');
        return add.call(this, type, ...rest);
      };
    });
    await p.goto(url);
    await p.waitForTimeout(800);
    const state = await p.evaluate(() => ({
      pending: document.documentElement.classList.contains('motion-pending'),
      h1: getComputedStyle(document.querySelector('h1')).visibility,
      hidden: [...document.querySelectorAll('[data-reveal], [data-split] .split-letter')]
        .filter(e => parseFloat(getComputedStyle(e).opacity) < 1).length,
    }));
    assert.deepEqual(state, { pending: false, h1: 'visible', hidden: 0 });
  } finally {
    await browser.close();
  }
});
