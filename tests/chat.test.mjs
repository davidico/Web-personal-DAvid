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

test('chat: estructura y aviso de IA', async () => {
  await page.goto(url);
  const chat = page.locator('#chat');
  assert.equal((await chat.locator('h2').innerText()).trim(), 'Ask me anything.');
  assert.match(await chat.innerText(), /David's AI assistant/);
  assert.match(await chat.innerText(), /AI · coming soon/);
  assert.deepEqual(await chat.locator('[data-chip]').allInnerTexts(),
    ['Contact', 'Portfolio', 'What if I need photos?']);
  assert.equal(await chat.getByLabel('Your question').count(), 1);
});
test('chat: Enter no recarga ni envía nada', async () => {
  await page.goto(url);
  await page.evaluate(() => { window.__mark = 1; });
  const reqs = [];
  page.on('request', r => reqs.push(r.url()));
  await page.getByLabel('Your question').fill('hello');
  await page.keyboard.press('Enter');
  await page.locator('[data-chip]').first().click();
  await page.waitForTimeout(300);
  assert.equal(await page.evaluate(() => window.__mark), 1);
  assert.deepEqual(reqs, []);
  assert.equal(new URL(page.url()).search, '');
});
const NOTICE = "The assistant isn't live yet. For now, use the contact button below.";
test('chat: enviar muestra el aviso', async () => {
  await page.goto(url);
  const live = page.locator('#chat [aria-live="polite"]');
  assert.equal(await live.count(), 1);
  assert.equal((await live.innerText()).trim(), '');
  await page.getByLabel('Your question').fill('hello');
  await page.keyboard.press('Enter');
  assert.equal((await live.innerText()).trim(), NOTICE);
  assert.equal(await live.isVisible(), true);
  assert.ok(parseFloat(await live.evaluate(e => getComputedStyle(e).fontSize)) >= 18);
});
test('chat: una sugerencia muestra el aviso', async () => {
  await page.goto(url);
  await page.locator('[data-chip]').nth(1).click();
  const live = page.locator('#chat [aria-live="polite"]');
  assert.equal((await live.innerText()).trim(), NOTICE);
  assert.equal(await live.isVisible(), true);
});
