import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { startPreview, newPage } from './helpers.mjs';

let server, url, browser, context, page;

before(async () => {
  server = await startPreview();
  url = server.url;
  ({ browser, context, page } = await newPage());
});
// Each test gets a fresh context, so localStorage starts empty.
beforeEach(async () => {
  await context?.close();
  context = await browser.newContext();
  page = await context.newPage();
});
after(async () => {
  await browser?.close();
  await server?.stop();
});

const dark = p => p.evaluate(() => document.documentElement.classList.contains('intro'));
test('intro: primera visita a oscuras, con foco en el interruptor', async () => {
  await page.goto(url);
  assert.equal(await dark(page), true);
  assert.equal(await page.evaluate(() => document.activeElement.id), 'intro-switch');
});
test('intro: el clic enciende y se recuerda', async () => {
  await page.goto(url);
  await page.click('#intro-switch');
  await page.waitForFunction(() => !document.documentElement.classList.contains('intro'));
  assert.equal(await page.evaluate(() => localStorage.getItem('dc-intro-seen')), '1');
  assert.equal(await page.locator('#intro').isVisible(), false);
  await page.reload();
  assert.equal(await dark(page), false);
});
test('intro: Enter enciende', async () => {
  await page.goto(url);
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => !document.documentElement.classList.contains('intro'));
});
test('intro: la rueda del ratón enciende', async () => {
  await page.goto(url);
  await page.mouse.wheel(0, 200);
  await page.waitForFunction(() => !document.documentElement.classList.contains('intro'));
});
test('intro: se enciende sola antes de 6 s', async () => {
  await page.goto(url);
  await page.waitForFunction(() => !document.documentElement.classList.contains('intro'), null, { timeout: 6000 });
});
test('intro: movimiento reducido entra iluminada', async () => {
  const { page: p, browser } = await newPage({ reducedMotion: 'reduce' });
  try {
    await p.goto(url);
    assert.equal(await dark(p), false);
    assert.equal(await p.locator('h1').isVisible(), true);
  } finally {
    await browser.close();
  }
});
test('intro: sin JavaScript entra iluminada', async () => {
  const { page: p, browser } = await newPage({ javaScriptEnabled: false });
  try {
    await p.goto(url);
    assert.equal(await p.locator('#intro').isVisible(), false);
    assert.equal(await p.locator('h1').isVisible(), true);
  } finally {
    await browser.close();
  }
});
test('intro: funciona si localStorage lanza errores', async () => {
  const { page: p, browser } = await newPage();
  try {
    await p.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', { get() { throw new Error('denied'); } });
    });
    const errors = [];
    p.on('pageerror', e => errors.push(e.message));
    await p.goto(url);
    await p.click('#intro-switch');
    await p.waitForFunction(() => !document.documentElement.classList.contains('intro'));
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
  }
});
test('intro: Espacio en el interruptor enciende', async () => {
  await page.goto(url);
  assert.equal(await page.evaluate(() => document.activeElement.id), 'intro-switch');
  await page.keyboard.press(' ');
  await page.waitForFunction(() => !document.documentElement.classList.contains('intro'));
});
test('intro: Tab no sale del interruptor mientras está a oscuras', async () => {
  await page.goto(url);
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'intro-switch');
  }
  await page.click('#intro-switch');
  await page.waitForFunction(() => !document.documentElement.classList.contains('intro'));
  assert.equal(await page.locator('[inert]').count(), 0);
});
// A listener added at DOMContentLoaded stands in for any later script.
const listenLate = () => {
  document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('intro:done', () => { window.__done = (window.__done || 0) + 1; });
  });
};
test('intro: intro:done llega a quien escucha en DOMContentLoaded (visita repetida)', async () => {
  await page.addInitScript(() => localStorage.setItem('dc-intro-seen', '1'));
  await page.addInitScript(listenLate);
  await page.goto(url);
  await page.waitForFunction(() => window.__done === 1, null, { timeout: 2000 });
  assert.equal(await dark(page), false);
});
test('intro: intro:done llega a quien escucha en DOMContentLoaded (tras encender)', async () => {
  await page.addInitScript(listenLate);
  await page.goto(url);
  await page.click('#intro-switch');
  await page.waitForFunction(() => window.__done === 1);
});
test('intro: si el módulo no carga, la página acaba iluminada', async () => {
  await page.route(url, async route => {
    const res = await route.fetch();
    const html = (await res.text()).replace(/<script type="module"[^>]*>[\s\S]*?<\/script>/g, '');
    await route.fulfill({ response: res, body: html });
  });
  await page.goto(url);
  assert.equal(await page.evaluate(() => document.querySelector('script[type="module"]')), null);
  assert.equal(await dark(page), true);
  await page.waitForFunction(() => !document.documentElement.classList.contains('intro'), null, { timeout: 8000 });
  assert.equal(await page.locator('#intro').isVisible(), false);
  assert.equal(await page.evaluate(() => getComputedStyle(document.body).overflow), 'visible');
  assert.equal(await page.locator('[inert]').count(), 0);
});
