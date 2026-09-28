# Phase 2 progress (multilingual + dark theme + banner slider)

Branch: `phase-2-multilingual-dark-slider`. Baseline `npm run build` passed (9 pages) before any change.

## Design plan for Phase 2 (SKILL.md pass 1)

- **Dark palette — "night air", not generic dark mode.** The Phase 1 neutrals are a cool
  blue-slate family (Graphite `#1B2124`, Paper `#FAFBFB`). Dark theme pushes the *same hue*
  down instead of dropping to near-black: base `#10171B`, surfaces `#182025`/`#1F2A30`,
  text `#E9EEF1` (soft, not pure white — no halation), secondary `#9FAEB7`. The logo red is
  lifted for dark graphics (`#E4574F` family) while buttons stay deep red so white label
  text keeps AA. Implemented with CSS `light-dark()` + `color-scheme`, so one token row
  serves both themes and JS-off still follows the system.
- **Type per locale:** fa = Estedad (unchanged); ar = IBM Plex Sans Arabic (Arabic letter
  forms, static weights); en/ru = IBM Plex Sans Variable (latin + cyrillic subsets). All
  Fontsource, self-hosted, woff2, unicode-range subsets — a fa visitor downloads no
  Cyrillic. No letter-spacing on Arabic script.
- **Slider:** content-driven from `src/data/banners.ts`; scroll-snap + tiny vanilla JS;
  direction-aware for RTL; placeholder banners are breath-inspired SVGs with dark variants.
- **Creativity budget (max 2–3 interactions):** (1) the banner slider (user-controlled),
  (2) a category filter on the home formulary index, (3) a company timeline on /about
  (real sequence → real milestones from the Persian copy only). No scroll reveals.

## Status

- [x] Preflight: SKILL/AGENTS/CLAUDE/DESIGN_PLAN/REDESIGN_NOTES read; Phase 1 confirmed;
      tree clean; branch created; baseline install + build OK
- [x] Link audit: en/ru/ar languages pointed to external subdomains (site.languages,
      Base.astro hreflang). Replaced by internal routes in this phase.
- [ ] Step 1 — i18n infra: config, dictionaries, content loader, templates, [lang] routes,
      switcher, sitemap, `npm run i18n:check`
- [ ] Step 2 — dark theme: tokens, inline script, toggle, per-scheme metas
- [ ] Step 3 — banner slider + placeholder banners + README how-to
- [ ] Step 4 — full ar/en/ru content (products, about, contact, home), 404s, GLOSSARY,
      TRANSLATION_REVIEW
- [ ] Step 5 — creative pass (filter, timeline, featured news)
- [ ] Step 6 — polish + docs (DESIGN_PLAN dark section, REDESIGN_NOTES phase 2, README)
- [ ] Verification: build, i18n:check, astro check, dev-server 200s in 4 locales,
      theme/RTL/expansion checks; commits per step; push attempt

## Resume notes

- Dictionaries: `src/i18n/dicts/*.json` (flat dotted keys; `fa` is the reference set).
- Content: `src/content/<locale>/{products,about,contact,home}.json`, loaded by
  `src/content/index.ts`. `[lang]` pages only emit locales that have content — fa-only
  until step 4 lands.
- Theme model: `data-theme` = resolved light/dark, `data-color-mode` = user choice
  (light/dark/system); inline head script sets both before first paint; toggle cycles and
  stores `nzp-theme` in localStorage.
