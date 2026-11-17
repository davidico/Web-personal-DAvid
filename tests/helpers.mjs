import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL('..', import.meta.url));
const PORT = 4321;
const URL_BASE = `http://localhost:${PORT}/`;

async function waitForServer(url, child, timeoutMs = 20000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`astro preview exited with code ${child.exitCode}`);
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(`astro preview did not answer at ${url} within ${timeoutMs} ms`);
}

/**
 * Starts `astro preview` on port 4321 over dist/ as a foreground child.
 * `--ignore-lock` stops Astro from detaching into a background daemon,
 * so stop() can kill it and `node --test` exits cleanly.
 */
export async function startPreview() {
  const child = spawn(
    process.execPath,
    [join(root, 'node_modules/astro/bin/astro.mjs'), 'preview', '--port', String(PORT), '--host', 'localhost', '--ignore-lock'],
    { cwd: root, stdio: 'ignore' },
  );
  try {
    await waitForServer(URL_BASE, child);
  } catch (err) {
    child.kill();
    throw err;
  }
  return {
    url: URL_BASE,
    stop() {
      if (child.exitCode !== null) return Promise.resolve();
      return new Promise((resolve) => {
        child.once('exit', () => resolve());
        child.kill();
      });
    },
  };
}

/** Launches Playwright Chromium; `opts` goes to browser.newContext. */
export async function newPage(opts) {
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  const context = await browser.newContext(opts);
  const page = await context.newPage();
  return { browser, context, page };
}
