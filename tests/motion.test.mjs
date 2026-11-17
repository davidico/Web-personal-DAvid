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
