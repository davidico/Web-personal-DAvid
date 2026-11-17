import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startPreview, newPage } from './helpers.mjs';

// Intro and motion together: the first visit hands over from the dark screen
// to the kinetic headline and smooth scroll.
let server, url;

before(async () => {
  server = await startPreview();
  url = server.url;
});
after(async () => {
  await server?.stop();
});

const lettersShown = () => {
  const ls = [...document.querySelectorAll('[data-split] .split-letter')];
  return ls.length > 0 && ls.every(e => getComputedStyle(e).opacity === '1');
};

test('handoff: primera visita, clic, el titular aparece y Lenis arranca', async () => {
  const { browser, page } = await newPage();
  try {
    await page.goto(url);
    await page.click('#intro-switch');
    await page.waitForFunction(lettersShown, null, { timeout: 4000 });
    await page.waitForFunction(() => document.documentElement.classList.contains('lenis'), null, { timeout: 1000 });
  } finally {
    await browser.close();
  }
});
test('handoff: lo mismo con load retrasado', async () => {
  const { browser, page } = await newPage();
  try {
    await page.route(/\.(webp|woff2?)$/, async route => {
      await new Promise(r => setTimeout(r, 6000));
      try { await route.continue(); } catch { /* browser already closed */ }
    });
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.click('#intro-switch');
    await page.waitForFunction(lettersShown, null, { timeout: 4000 });
    assert.equal(await page.evaluate(() => document.documentElement.classList.contains('lenis')), true);
    assert.notEqual(await page.evaluate(() => document.readyState), 'complete');
  } finally {
    await browser.close();
  }
});
