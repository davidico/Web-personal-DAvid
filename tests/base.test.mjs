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

test('base: título, idioma y marca', async () => {
  await page.goto(url);
  assert.equal(await page.title(), 'David Cueva · Webflow & JavaScript expert');
  assert.equal(await page.getAttribute('html', 'lang'), 'en');
  assert.equal(await page.locator('header a[aria-label="David Cueva, home"]').count(), 1);
  assert.match(await page.getAttribute('link[rel="icon"]', 'href'), /favicon\.svg$/);
});
test('base: ninguna petición a terceros', async () => {
  const hosts = new Set();
  page.on('request', r => hosts.add(new URL(r.url()).host));
  await page.goto(url, { waitUntil: 'networkidle' });
  assert.deepEqual([...hosts], [new URL(url).host]);
});
test('base: Geist se aplica al cuerpo', async () => {
  await page.goto(url);
  const ff = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  assert.match(ff, /Geist/);
});
test('base: por defecto la página no se indexa', async () => {
  await page.goto(url);
  assert.equal(await page.getAttribute('meta[name="robots"]', 'content'), 'noindex, nofollow');
});
