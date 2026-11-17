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
test('intro: tras DOMContentLoaded, intro:done no espera a load', async () => {
  // Hold images and fonts so `load` stays pending well past the click.
  await page.route(/\.(webp|woff2?)$/, async route => {
    await new Promise(r => setTimeout(r, 5000));
    try { await route.continue(); } catch { /* page already closed */ }
  });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    document.addEventListener('intro:done', () => { window.__doneState = document.readyState; });
  });
  await page.click('#intro-switch');
  await page.waitForFunction(() => window.__doneState, null, { timeout: 1500 });
  assert.notEqual(await page.evaluate(() => window.__doneState), 'complete');
});
test('intro: un clic en la zona oscura enciende', async () => {
  await page.goto(url);
  await page.mouse.click(12, 12);
  await page.waitForFunction(() => !document.documentElement.classList.contains('intro'), null, { timeout: 2000 });
});
test('intro: Escape enciende', async () => {
  await page.goto(url);
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.documentElement.classList.contains('intro'), null, { timeout: 2000 });
});
test('intro: Enter fuera del interruptor enciende', async () => {
  await page.goto(url);
  await page.evaluate(() => document.activeElement.blur());
  assert.notEqual(await page.evaluate(() => document.activeElement.id), 'intro-switch');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => !document.documentElement.classList.contains('intro'), null, { timeout: 2000 });
});
for (const key of ['PageUp', 'Home', 'End']) {
  test(`intro: ${key} enciende`, async () => {
    await page.goto(url);
    await page.keyboard.press(key);
    await page.waitForFunction(() => !document.documentElement.classList.contains('intro'), null, { timeout: 2000 });
  });
}
test('intro: si la animación de luz no termina, la página se ilumina igual', async () => {
  await page.goto(url);
  await page.click('#intro-switch');
  await page.evaluate(() => document.getElementById('intro').getAnimations().forEach(a => a.pause()));
  await page.waitForFunction(() => !document.documentElement.classList.contains('intro'), null, { timeout: 2000 });
  assert.equal(await page.locator('[inert]').count(), 0);
});
for (const p of ['impressum', 'privacy']) {
  test(`intro: la primera visita a /${p} entra iluminada y sin intro`, async () => {
    await page.goto(url + p);
    await page.waitForLoadState('load');
    assert.equal(await dark(page), false);
    assert.equal(await page.locator('#intro').count(), 0);
    assert.equal(await page.evaluate(() => localStorage.getItem('dc-intro-seen')), null);
  });
}
test('intro: al encender, un halo cálido acompaña el borde y desaparece al terminar', async () => {
  await page.goto(url);
  await page.click('#intro-switch');
  const glow = await page.evaluate(() => {
    const el = document.getElementById('intro-glow');
    if (!el) return null;
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      lighting: document.documentElement.classList.contains('intro-lighting'),
      ariaHidden: el.getAttribute('aria-hidden'),
      pointerEvents: s.pointerEvents,
      display: s.display,
      visibility: s.visibility,
      opacity: parseFloat(s.opacity),
      area: r.width * r.height,
      animated: el.getAnimations({ subtree: true }).length,
    };
  });
  assert.ok(glow, 'no #intro-glow while lighting');
  assert.equal(glow.lighting, true);
  assert.equal(glow.ariaHidden, 'true');
  assert.equal(glow.pointerEvents, 'none');
  assert.notEqual(glow.display, 'none');
  assert.equal(glow.visibility, 'visible');
  assert.ok(glow.opacity > 0);
  assert.ok(glow.area > 0);
  assert.ok(glow.animated > 0, 'the glow does not travel with the edge');
  assert.equal(await page.locator('#intro-glow').isVisible(), true);
  await page.waitForFunction(() => !document.documentElement.classList.contains('intro'), null, { timeout: 2000 });
  assert.equal(await page.locator('#intro-glow').count(), 0);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), await page.evaluate(() => innerWidth));
});
test('intro: si la animación se para, el halo no se queda en pantalla', async () => {
  await page.goto(url);
  await page.click('#intro-switch');
  await page.evaluate(() => document.getAnimations().forEach(a => a.pause()));
  await page.waitForFunction(() => !document.documentElement.classList.contains('intro'), null, { timeout: 2000 });
  assert.equal(await page.locator('#intro-glow').count(), 0);
});
