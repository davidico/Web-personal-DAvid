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
