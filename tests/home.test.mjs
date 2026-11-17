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

test('home: secciones y titulares en orden', async () => {
  await page.goto(url);
  // The h1 is split letter by letter; its accessible text lives in aria-label.
  const hs = await page.locator('main h1, main h2')
    .evaluateAll(els => els.map(e => (e.tagName === 'H1' ? e.getAttribute('aria-label') : e.innerText)));
  assert.deepEqual(hs.map(t => t.replace(/\s+/g, ' ').trim()), [
    'You bring your business. I make it live.',
    'Everything tailored to your needs.',
    'Ask me anything.',
    'Web development', 'Photo shoots', 'Video editing',
    'Selected work',
    "Let's build yours.",
  ]);
});
test('home: cuatro proyectos con nombre', async () => {
  await page.goto(url);
  assert.deepEqual(await page.locator('#work [data-project] h3').allInnerTexts(),
    ['Prezenti', 'Jade Energy', 'com-create', 'Atalma']);
});
test('home: los enlaces legales cargan', async () => {
  for (const p of ['/impressum', '/privacy']) {
    const r = await page.goto(url + p);
    assert.equal(r.status(), 200);
    assert.equal(await page.locator('h1').count(), 1);
  }
});
test('home: sin scroll horizontal a 360, 768 y 1440', async () => {
  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto(url);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    assert.ok(over <= 0, `desborde de ${over}px a ${width}`);
  }
});
test('home: cuerpo de 18 px o más e imágenes con alt', async () => {
  await page.goto(url);
  const small = await page.evaluate(() => [...document.querySelectorAll('main p')]
    .filter(p => parseFloat(getComputedStyle(p).fontSize) < 18).length);
  assert.equal(small, 0);
  assert.equal(await page.locator('img:not([alt])').count(), 0);
});
