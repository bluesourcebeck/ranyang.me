# ranyang.me

Ran Yang's personal site. A one-page static site built with Astro.

- `npx astro dev`: local development.
- `npx astro build`: build the site into `dist`.
- `node scripts/check-page.mjs`: check the built page.

Page text lives in `src/data/site.ts`; links live in `src/config.ts`. Pushing to `main` builds and deploys the site with GitHub Pages.

Started from the MIT-licensed template `vito8916/simple-portfolio`; its license is kept in `LICENSE`. Fonts are under the SIL Open Font License (`public/fonts/OFL.txt`).
