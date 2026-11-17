# Home de David Cueva en Astro: plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir la home (versión A) de la web personal de David Cueva en Astro, con la entrada "Enciende la luz", usando las fotos reales como imágenes fijas y huecos marcados para los clips.

**Architecture:** Sitio estático de Astro con una página y un componente por sección. Todo el texto vive en un único archivo de datos. La entrada y el movimiento son scripts de cliente pequeños que solo mejoran una página que ya es legible sin JavaScript.

**Tech Stack:** Astro (última estable, plantilla mínima, TypeScript estricto), GSAP con ScrollTrigger, Lenis, fuentes autoalojadas con Fontsource, pruebas con `node --test` y el Playwright ya instalado en el entorno.

**Spec:** `docs/superpowers/specs/2026-11-17-web-personal-david-cueva-design.md`. Las maquetas de referencia están en `docs/superpowers/specs/mockups/` (`HomeA.dc.html`, `Intro.dc.html`, `Main.dc.html`): mandan en composición, tamaños y textos.

**Fuera de este plan:** generar e integrar los clips de Higgsfield (plan aparte, tras revisar esta entrega), el chat con IA funcionando, el lanzamiento público con dominio.

## Global Constraints

- Idioma de la web: inglés. `<html lang="en">`.
- Colores exactos de la sección 5 del spec, como variables CSS en `src/styles/tokens.css`: `--petrol:#2f5d62`, `--petrol-hover:#244a4e`, `--petrol-deep:#234a4f`, `--petrol-light:#35696f`, `--bg:#ffffff`, `--bg-soft:#edf3f3`, `--bg-gray:#f3f4f5`, `--ink:#1e1f21`, `--ink-2:#6d6e6f`, `--line:#e4e5e7`, `--gold:#e9b93c`, `--gold-text:#8a6a12`, `--cream:#f7f5ea`, `--dark:#1d1e20`.
- El dorado `--gold` nunca se usa como color de texto sobre blanco.
- Tipografía: Geist (titulares y texto), Geist Mono (etiquetas, numeración), Inter 500 y 600 (solo logo). Autoalojadas con `@fontsource-variable/geist`, `@fontsource-variable/geist-mono` y `@fontsource/inter`. Ninguna petición a `fonts.googleapis.com` ni `fonts.gstatic.com` (riesgo legal en Alemania).
- Texto de cuerpo de 18 px o más; etiquetas en mono de 14 px o más. Titulares con `clamp()`, hasta 124 px en escritorio.
- Fondo blanco continuo: sin franjas de color ni líneas divisorias entre secciones.
- Sin peticiones a terceros en tiempo de ejecución (sin CDN, sin analítica).
- Controles reales (`<button>`, `<a href>`, `<input>` con `<label>`), objetivos táctiles de 44 px o más, contraste de texto 4.5:1.
- Textos pendientes de la propietaria se dejan entre corchetes, tal como en el spec.
- Titular provisional: "You bring your business. I make it live."

## Review Focus

1. **JavaScript desactivado o roto:** la página debe verse iluminada y completa, sin pantalla oscura. Prueba en la Tarea 4.
2. **Almacenamiento local no disponible (navegación privada):** la entrada funciona igual y no lanza errores. Prueba en la Tarea 4.
3. **Uso solo con teclado en la entrada:** el interruptor recibe el foco al cargar y se activa con Enter y con Espacio. Prueba en la Tarea 4.
4. **Móvil estrecho (360 px):** ningún titular gigante provoca scroll horizontal. Prueba en la Tarea 2.
5. **Pulsar Enter en el campo del chat:** no recarga la página ni envía nada. Prueba en la Tarea 3.

---

### Task 1: Base de Astro, marca y fuentes

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`
- Create: `src/styles/tokens.css`, `src/styles/global.css`
- Create: `src/layouts/Base.astro`, `src/components/Logo.astro`
- Create: `public/favicon.svg`
- Create: `src/pages/index.astro`
- Test: `tests/helpers.mjs`, `tests/base.test.mjs`

**Interfaces:**
- Produces: `Base.astro` con props `{ title: string; description: string }` y un `<slot />`. `Logo.astro` con prop `{ size?: number }` (px del texto, por defecto 24).
- Produces: `tests/helpers.mjs` exporta `startPreview(): Promise<{ url: string; stop(): Promise<void> }>` (lanza `astro preview` en el puerto 4321 sobre `dist/`) y `newPage(opts?): Promise<{ browser, context, page }>` (Chromium de Playwright vía `createRequire`; `opts` se pasa a `browser.newContext`).
- Produces: scripts de npm `dev`, `build`, `preview` y `test` (`astro build && node --test tests/`).

- [ ] **Step 1: Crear el proyecto** con `npm create astro@latest -- --template minimal --typescript strict --no-git --no-install .` e instalar `@fontsource-variable/geist`, `@fontsource-variable/geist-mono`, `@fontsource/inter`. Configurar `site` en `astro.config.mjs` con un marcador `https://example.com` y añadir el script `test`.

- [ ] **Step 2: Escribir la prueba que falla** en `tests/base.test.mjs`

```js
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
```

- [ ] **Step 3: Ejecutar** `npm test`. Esperado: FALLA (no existe la cabecera ni el favicon).

- [ ] **Step 4: Implementar.** `tokens.css` con las variables de Global Constraints. `global.css`: reset mínimo, `body` con Geist, color `--ink` y fondo `--bg`, y la clase `.wrap` (`max-width:1344px; margin-inline:auto; padding-inline:clamp(20px,3.4vw,48px)`). `Base.astro` importa fuentes y estilos y pinta `<head>` completo. `Logo.astro`: "David" en Inter 500, "Cueva" en Inter 600 color `--petrol`, punto dorado de 0.3em, `letter-spacing:-0.02em`. `favicon.svg`: cuadrado 64×64 con radio 15, degradado lineal a 135° de `#234a4f` a `#35696f`, "D" crema `#f7f5ea` y círculo `#e9b93c` de radio 5.5 en (46,45). `index.astro` usa `Base` y una cabecera provisional con el logo enlazado a `/`.

- [ ] **Step 5: Ejecutar** `npm test`. Esperado: 3 pruebas PASAN.

- [ ] **Step 6: Commit** `feat: scaffold Astro site with brand tokens, fonts and logo`

---

### Task 2: Contenido y secciones estáticas

**Files:**
- Create: `src/data/site.ts`
- Create: `src/assets/david/hero.jpg`, `portrait-serious.jpg`, `portrait-smile.jpg` (copias de `1.jpg`, `3.jpg`, `5.jpg` entregadas por la propietaria; en esta sesión están en la carpeta `images/` junto al scratchpad)
- Create: `src/components/Header.astro`, `Hero.astro`, `Story.astro`, `Services.astro`, `Work.astro`, `Finale.astro`, `Footer.astro`, `MediaSlot.astro`
- Create: `src/pages/impressum.astro`, `src/pages/privacy.astro`
- Modify: `src/pages/index.astro`
- Test: `tests/home.test.mjs`

**Interfaces:**
- Produces: `src/data/site.ts` exporta
  - `site: { name: 'David Cueva'; role: 'Webflow & JavaScript expert · Berlin'; headline: [string, string]; statement: string; contactHref: string }` con `headline = ['You bring your business.', 'I make it live.']`, `statement = 'Everything tailored to your needs.'` y `contactHref = '#contact'`.
  - `services: { n: string; title: string; line: string }[]` con los tres del spec y las líneas de la maqueta.
  - `projects: { slug: string; name: string; pitch: string }[]` con `prezenti`, `jade-energy`, `com-create`, `atalma`; `pitch` es `'[One-line pitch]'` salvo Prezenti: `'Website design · Webflow development'`.
  - `socials: { label: string; href: string }[]` con `[LinkedIn]` e `[Instagram]` apuntando a `#`.
- Produces: `MediaSlot.astro` con props `{ image?: ImageMetadata; alt: string; ratio: string; clip?: string; tone?: 'soft' | 'gray' }`. Pinta un `<figure>` con la proporción dada, fondo `--bg-soft` o `--bg-gray`, la imagen optimizada si existe y, si hay `clip`, una etiqueta en mono con ese texto y `data-clip-slot`.
- Produces: ids de sección `top`, `story`, `chat` (hueco vacío hasta la Tarea 3), `services`, `work`, `contact`.

- [ ] **Step 1: Escribir las pruebas que fallan** en `tests/home.test.mjs`

```js
test('home: secciones y titulares en orden', async () => {
  await page.goto(url);
  const hs = await page.locator('main h1, main h2').allInnerTexts();
  assert.deepEqual(hs.map(t => t.replace(/\s+/g, ' ').trim()), [
    'You bring your business. I make it live.',
    'Everything tailored to your needs.',
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
```

- [ ] **Step 2: Ejecutar** `npm test`. Esperado: FALLAN las cinco.

- [ ] **Step 3: Implementar** los componentes siguiendo `mockups/HomeA.dc.html` sección por sección (mismos tamaños, radios de 28 y 32 px, separaciones de 140 a 180 px entre secciones, sin líneas divisorias). El `h1` parte el titular en dos líneas con `<br>`. `Hero` usa `MediaSlot` 16/9 con `hero.jpg` y `clip="Clip 01 · David walks in and sits down to work"`. `Story` usa tres `MediaSlot` 4/5 sin imagen con los rótulos de la maqueta. `Work` pinta cada proyecto como `<a data-project>` con `MediaSlot` 16/10, `<h3>` y la frase. `Finale` lleva los dos botones ("Start a project" a `site.contactHref`, "Ask the AI first" a `#chat`). `Footer` enlaza a `/impressum`, `/privacy` y las redes. Las dos páginas legales usan `Base`, un `h1` y el texto `[Legal text pending]`.

- [ ] **Step 4: Ejecutar** `npm test`. Esperado: PASAN todas.

- [ ] **Step 5: Commit** `feat: add home sections, content data and legal placeholder pages`

---

### Task 3: Caja del chat (sin IA)

**Files:**
- Create: `src/components/ChatBox.astro`
- Modify: `src/pages/index.astro` (dentro de `#chat`)
- Test: `tests/chat.test.mjs`

**Interfaces:**
- Consumes: variables de `tokens.css`.
- Produces: `<form data-chat>` con un `<input name="q">` etiquetado "Your question", un botón con `aria-label="Send question"` y tres `<button type="button" data-chip>`.

- [ ] **Step 1: Escribir las pruebas que fallan**

```js
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
```

- [ ] **Step 2: Ejecutar** `npm test`. Esperado: FALLAN las dos. Añadir `'Ask me anything.'` a la lista esperada de `tests/home.test.mjs`, entre el `statement` y "Web development".

- [ ] **Step 3: Implementar `ChatBox.astro`** según la maqueta: tarjeta de 960 px de ancho máximo, radio 28, borde `--line`; cabecera con punto dorado, rótulo y marca; burbuja de saludo sobre `--bg-soft` con el texto de la maqueta; chips con borde `--petrol`; campo de 56 px de alto y botón redondo `--petrol`. Un script en línea hace `preventDefault()` en el `submit`. Debajo, "or continue scrolling" en mono.

- [ ] **Step 4: Ejecutar** `npm test`. Esperado: PASAN todas.

- [ ] **Step 5: Commit** `feat: add static chat box placeholder`

---

### Task 4: Entrada "Enciende la luz"

**Files:**
- Create: `src/components/Intro.astro`, `src/scripts/intro.ts`
- Modify: `src/layouts/Base.astro` (script en línea en `<head>` y el componente al inicio de `<body>`)
- Test: `tests/intro.test.mjs`

**Interfaces:**
- Produces: clave de almacenamiento `dc-intro-seen` con valor `'1'`.
- Produces: clases en `<html>`: `intro` (pantalla oscura activa) e `intro-lighting` (círculo creciendo). Al terminar se quitan las dos y se emite en `document` el evento `intro:done`. Si la entrada no se muestra, `intro:done` se emite en `DOMContentLoaded`.
- Produces: `initIntro(opts?: { autoMs?: number; growMs?: number }): void`, por defecto `autoMs = 4000` y `growMs = 900`.
- Produces: `<button id="intro-switch" aria-label="Turn on the light">`.

Comportamiento fijado:
- Un script en línea en `<head>` añade `intro` a `<html>` solo si se cumplen las tres: no hay `prefers-reduced-motion: reduce`, no existe la clave `dc-intro-seen`, y la URL no tiene ancla. Cualquier error de `localStorage` se captura y cuenta como "no vista".
- La capa `#intro` es `position:fixed; inset:0; background:var(--dark)` y solo es visible bajo `html.intro`. Sin JavaScript nunca aparece.
- El interruptor mide 56 px, es dorado, lleva el icono de encendido y dos anillos que titilan. Va en `left:32%; bottom:26%` (en pantallas de menos de 600 px, `left:50%` centrado y `bottom:22%`). Recibe el foco al iniciar.
- Disparadores, todos de un solo uso: clic o Enter/Espacio en el interruptor, `wheel`, `touchmove`, teclas de scroll (flechas, AvPág, Espacio fuera del botón) y el temporizador `autoMs`.
- Al dispararse: se añade `intro-lighting`; la capa anima `clip-path` para abrir un círculo transparente que crece desde el centro del interruptor hasta cubrir la esquina más lejana, en `growMs` ms; al acabar se quitan las clases, se guarda la clave (capturando errores), se devuelve el foco a `body` y se emite `intro:done`.
- Mientras `html.intro` está activa, `body` tiene `overflow:hidden`.

- [ ] **Step 1: Escribir las pruebas que fallan**

```js
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
  await p.goto(url);
  assert.equal(await dark(p), false);
  assert.equal(await p.locator('h1').isVisible(), true);
  await browser.close();
});
test('intro: sin JavaScript entra iluminada', async () => {
  const { page: p, browser } = await newPage({ javaScriptEnabled: false });
  await p.goto(url);
  assert.equal(await p.locator('#intro').isVisible(), false);
  assert.equal(await p.locator('h1').isVisible(), true);
  await browser.close();
});
test('intro: funciona si localStorage lanza errores', async () => {
  const { page: p, browser } = await newPage();
  await p.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('denied'); } });
  });
  const errors = [];
  p.on('pageerror', e => errors.push(e.message));
  await p.goto(url);
  await p.click('#intro-switch');
  await p.waitForFunction(() => !document.documentElement.classList.contains('intro'));
  assert.deepEqual(errors, []);
  await browser.close();
});
```

Cada prueba que usa la `page` compartida parte de un contexto nuevo, para que el almacenamiento esté vacío.

- [ ] **Step 2: Ejecutar** `npm test`. Esperado: FALLAN las de `intro.test.mjs`.

- [ ] **Step 3: Actualizar las pruebas anteriores** para que `tests/helpers.mjs` ofrezca `newPage({ seen: true })`, que inyecta `localStorage.setItem('dc-intro-seen','1')` con `addInitScript`; `base`, `home` y `chat` lo usan para saltarse la entrada.

- [ ] **Step 4: Implementar** `Intro.astro`, el script en línea de `<head>` e `intro.ts` según el comportamiento fijado.

- [ ] **Step 5: Ejecutar** `npm test`. Esperado: PASAN todas.

- [ ] **Step 6: Commit** `feat: add "turn on the light" intro with fallbacks`

---

### Task 5: Movimiento

**Files:**
- Create: `src/scripts/motion.ts`
- Modify: `src/layouts/Base.astro` (cargar el script), `src/components/Hero.astro`, `Work.astro`, `Services.astro`, `Story.astro` (atributos `data-reveal`, `data-split`)
- Modify: `src/styles/global.css`
- Test: `tests/motion.test.mjs`

**Interfaces:**
- Consumes: evento `intro:done` de la Tarea 4.
- Produces: `initMotion(): void`. Atributos: `data-reveal` (aparece subiendo 40 px con opacidad al entrar en pantalla), `data-split` (el titular entra letra a letra).

Comportamiento fijado:
- Instalar `gsap` y `lenis`. `initMotion` no hace nada con `prefers-reduced-motion: reduce`.
- El estado oculto inicial lo pone el script, nunca el CSS, para que sin JavaScript todo sea visible.
- Lenis para el scroll suave, sincronizado con `ScrollTrigger`. Los enlaces a anclas usan `lenis.scrollTo`.
- El `h1` (`data-split`) se anima tras `intro:done`: cada letra sube y aparece, 0.03 s de escalón. El texto accesible se conserva con `aria-label` en el `h1` y `aria-hidden` en las letras.
- Las tarjetas de `#work` escalan la imagen a 1.04 al pasar el ratón o recibir el foco (CSS, 400 ms).
- Los títulos de `#services` y las tarjetas llevan `data-reveal`.

- [ ] **Step 1: Escribir las pruebas que fallan**

```js
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
  const { page: p, browser } = await newPage({ reducedMotion: 'reduce' });
  await p.goto(url);
  const touched = await p.evaluate(() => [...document.querySelectorAll('[data-reveal],[data-split]')]
    .filter(e => { const s = getComputedStyle(e); return s.opacity !== '1' || s.transform !== 'none'; }).length);
  assert.equal(touched, 0);
  await browser.close();
});
test('motion: el enlace Work lleva a la sección', async () => {
  await page.goto(url);
  await page.click('header a[href="#work"]');
  await page.waitForFunction(() => document.querySelector('#work').getBoundingClientRect().top < 200);
});
```

- [ ] **Step 2: Ejecutar** `npm test`. Esperado: FALLAN las de `motion.test.mjs`.

- [ ] **Step 3: Implementar** `motion.ts` y los atributos. Actualizar la prueba de titulares de `home.test.mjs` para leer el `aria-label` del `h1`.

- [ ] **Step 4: Ejecutar** `npm test`. Esperado: PASAN todas.

- [ ] **Step 5: Commit** `feat: add smooth scroll, reveals and kinetic headline`

---

### Task 6: Revisión visual y vista previa

**Files:**
- Create: `README.md` (cómo arrancar, probar y construir; qué textos faltan)
- Create: `docs/review/` con capturas

- [ ] **Step 1: Capturar** con Playwright la home completa a 1440 y a 390 px de ancho, más la entrada a oscuras y a mitad del círculo, en `docs/review/`. Compararlas con `mockups/HomeA.dc.html` e `Intro.dc.html` y corregir las diferencias de composición.

- [ ] **Step 2: Ejecutar** `npm test`. Esperado: PASAN todas.

- [ ] **Step 3: Commit y push** `docs: add README and review screenshots`

- [ ] **Step 4: Preguntar a la propietaria** antes de publicar nada: enseñarle las capturas y pedir permiso para desplegar una vista previa en Cloudflare Pages. Solo con su sí, desplegar `dist/` y darle la dirección.
