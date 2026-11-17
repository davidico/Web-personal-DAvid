# David Cueva — personal website

A one-page personal website for David Cueva, Webflow & JavaScript expert in Berlin, built with [Astro](https://astro.build). It opens with a "turn on the light" intro on the first visit, then shows the hero, the story, a static chat box, services, selected work and a contact call to action. Impressum and privacy live on their own pages.

## Requirements

- Node.js 22 or newer.
- The tests drive a real browser with [Playwright](https://playwright.dev) and Chromium installed **globally**, not as a project dependency. Install them once with `npm install -g playwright && npx playwright install chromium` if your machine does not have them.

## Commands

| Command | What it does |
| --- | --- |
| `npm install` | Install dependencies. |
| `npm run dev` | Start the dev server at `http://localhost:4321`. |
| `npm run build` | Build the static site into `dist/`. |
| `npm run preview` | Serve the built `dist/` locally. |
| `npm test` | Build, then run the browser tests in `tests/`. |
| `npm run review:shots` | Build, then save review screenshots to `docs/review/` (not part of `npm test`). |

## Build settings

Two environment variables control the build:

| Variable | Default | What it does |
| --- | --- | --- |
| `SITE_URL` | `https://example.com` | The deployed origin, used for canonical URLs. Set it to the real domain, e.g. `SITE_URL=https://www.your-domain.de npm run build`. |
| `PUBLIC_INDEXABLE` | unset | Every page carries `<meta name="robots" content="noindex, nofollow">` so preview deploys stay out of search engines. Set `PUBLIC_INDEXABLE=true` only for the production build. |

## Where content lives

All texts and links are in `src/data/site.ts`: headline, statement, services, projects, social links and the contact link. Photos are in `src/assets/david/`. Text still waiting for the owner is written in square brackets, for example `[One-line pitch]`.

## Pending content

- Final headline (the current one is provisional).
- One-line pitches for Jade Energy, com-create and Atalma.
- Project screenshots for Prezenti, Jade Energy, com-create and Atalma.
- Social links (LinkedIn, Instagram).
- Contact destination for "Start a project".
- Impressum and privacy texts.
- The generated video clips (Clip 01 in the hero, Clip 02 frames in the story).
