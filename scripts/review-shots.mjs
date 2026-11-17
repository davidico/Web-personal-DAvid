// Captures review screenshots of the built site into docs/review/.
// Run `npm run review:shots` (it builds first). Not part of `npm test`.
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { startPreview, newPage } from '../tests/helpers.mjs';

const out = fileURLToPath(new URL('../docs/review/', import.meta.url));
const size = (width) => ({ viewport: { width, height: width >= 1000 ? 900 : 844 }, deviceScaleFactor: 1 });

/** Full page, intro already seen, after every scroll reveal has run. */
async function home(url, width) {
  const { browser, page } = await newPage({ seen: true, ...size(width) });
  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y <= height; y += 300) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(120);
    }
    await page.waitForTimeout(1200);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${out}home-${width}.png`, fullPage: true });
  } finally {
    await browser.close();
  }
}

/** First visit: the dark intro, optionally frozen halfway through the light circle. */
async function intro(url, width, lighting) {
  const { browser, page } = await newPage(size(width));
  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    if (lighting) {
      await page.click('#intro-switch');
      await page.evaluate(() => {
        const [anim] = document.getElementById('intro').getAnimations();
        anim.pause();
        anim.currentTime = Number(anim.effect.getTiming().duration) / 2;
      });
    }
    const name = lighting ? 'intro-lighting' : 'intro-dark';
    await page.screenshot({ path: `${out}${name}-${width}.png` });
  } finally {
    await browser.close();
  }
}

await mkdir(out, { recursive: true });
const server = await startPreview();
try {
  await home(server.url, 1440);
  await home(server.url, 390);
  await intro(server.url, 1440, false);
  await intro(server.url, 1440, true);
  await intro(server.url, 390, false);
  console.log(`Screenshots written to ${out}`);
} finally {
  await server.stop();
}
