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
  assert.equal(await page.evaluate(() => !!document.activeElement.closest('#work')), true);
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
