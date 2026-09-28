# Redesign notes

## Phase 3 — "Particle & Breath" (current)
- New visual system and tokens (`src/styles/tokens.css`), all pages rebuilt: see `DESIGN_PLAN.md`.
- New scripts: `particles.ts` (powder-field canvas: hero word, product halo, 404),
  `story.ts` (pinned breath story), `interactions.ts` (header, mobile dialog menu, cursor
  preview, tilt, reveals, horizontal timeline, form tabs, split titles).
- New component `BreathStory.astro`; `Header`, `Footer`, `ProductIndex`, `PageIntro` and all
  templates rewritten.
- Removed: the placeholder banner slider (`HeroSlider`, `BannerSlider`, `slider.ts`,
  `data/banners.ts`, `public/banners/*`), `BreathField`, `BottomNav` + product sheet
  (the sheet script looked up a wrong id, so it never opened), and the unused
  `header.css`/`bottom-nav.css`. All recoverable from git history.
- Fixed: 28px horizontal overflow on phones.
- New dictionary keys (all four locales): `heroWord`, `heroHint*`, `menuOpen/Close`,
  `formsTabs`, `story*`, `productsCount`, `notFoundHint`. Slider keys removed.
  Please have the ar/ru story copy reviewed by a native medical translator.

---

## Phase 1 notes (historical)

## Assumptions (one line each)
- Only the 5 products present in `src/data/site.ts` are shown. The brief's Budesonide/Formoterol/etc. are not in the repo, so none were added.
- The site stays Persian-only (`lang="fa" dir="rtl"`). EN/RU/AR remain links to the existing external subdomains, so no in-repo i18n was built.
- Product and gallery images stay hotlinked from the company's own domain (nafaspharmed.com). They are company assets, not stock.
- The unused `@astrojs/react` integration is left in place so `package.json` and the lock file stay untouched.
- AGENTS.md/CLAUDE.md contain only Astro docs pointers, with no rules that conflict with the brief.

## What changed and why
- **Visual system:** replaced the old red-banner and slider look with a quiet "air" system (cool Paper/Air surfaces, Graphite text, logo red for action only), token-driven. See DESIGN_PLAN.md.
- **Signature:** `BreathField.astro`, an SVG made from the logo's arcs. It takes one inhale/exhale on load, in sync with the hero headline's variable weight. This replaces `BannerSlider` (auto-rotating slides are a usability and accessibility cost).
- **Header:** TopBar merged into a single glass sticky header with a products disclosure menu (keyboard: Esc closes, focus returns). Desktop nav shows from 1024px; below that a floating glass bottom bar plus a products bottom-sheet.
- **Products:** the card grid became a formulary index (`ProductIndex.astro`) grouped by category. Product pages gained breadcrumbs, a spec list (generic name, group, class, form), a sticky TOC with scrollspy, a disclaimer and "other products".
- **Forms:** accessible labels, Persian inline validation, specific CTA labels, progressive enhancement (`src/scripts/forms.ts`). Without JS they post normally.
- **Fonts:** removed Google Fonts/jsdelivr (both unreliable in Iran). Estedad is now self-hosted.
- **New route:** `/404`. All existing routes (`/`, `/about`, `/contact`, `/products/[slug]` ×5) are preserved, with the same titles and descriptions.
- **CSS:** one layered stylesheet (`@layer tokens, base, layout, components, utilities`) with no scoped `<style>` blocks. Only `.section` owns vertical padding, which avoids specificity fights.
- **Critique pass:** removed the repeated arcs behind inner-page titles so the breath motif lives in one place.

## File structure
```
src/
  components/  Bidi, BottomNav, BreathField, Field, Footer, Header, Icon, Langs, Logo,
               PageIntro, ProductIndex, SiteForm
  data/site.ts            all content (+ formEndpoint, latinName, genericLatin, nav)
  layouts/Base.astro      meta/OG/hreflang, font preload, skip link, scripts
  pages/                  index, about, contact, 404, products/[slug]
  scripts/                menu.ts, sheet.ts, forms.ts, toc.ts  (only JS on the site)
  styles/                 global.css → fonts, tokens, base, layout, components
public/
  favicon.svg, favicon.ico
  fonts/estedad/Estedad-wght.subset.woff2, OFL.txt
```
Removed components: `BannerSlider`, `TopBar`, and the old `header.css`/`bottom-nav.css`.

## Design tokens (src/styles/tokens.css)
- Colour: `--c-red #B61615`, `--c-red-deep #86100F`, `--c-ink #1B2124`, `--c-slate #55616A`, `--c-air #EDF1F2`, `--c-paper #FAFBFB`, plus color-mix lines and tints.
- Type: `--font-sans` Estedad; sizes `--fs-xs…--fs-hero`; `--lh-body 1.95`; `--measure 38rem`; weights 250–650.
- Space: `--sp-1…--sp-9` (4px base), `--section-y`, `--gutter`, `--container 78rem`.
- Radius: `--r-s 10px`, `--r-m 18px`, `--r-l 32px`, `--r-pill`.
- Elevation: `--shadow-float` (floating layers only), `--shadow-glow` (primary button hover), `--blur-glass`.
- Motion: `--ease-breath`, `--ease-out`, `--dur-quick 160ms`, `--dur-soft 320ms`, `--dur-inhale 2.2s`, `--dur-exhale 3.2s`.

## Fonts and licences
- **Estedad** v8.5, variable wght 100–900, © 2026 The Estedad Project Authors, **SIL Open Font License 1.1** (`public/fonts/estedad/OFL.txt`). Subset with fontTools to Arabic/Persian, Basic Latin, Latin-1 punctuation and the ZWNJ/bidi marks. The result is an 84 KB woff2 with `font-display: swap` and preloaded.
- System fallback: Segoe UI / Tahoma.

## Placeholder copy to replace (all new, neutral text)
- Home products lead: «فهرست فرآورده‌ها بر اساس گروه درمانی. برای دیدن شکل فرآورده، نحوه مصرف و کاتالوگ، روی هر محصول بزنید.»
- Section heading «گزارش و مشاوره» and its lead.
- Reworded form intros (report: «ثبت عوارض دارویی محصولات نفس. …», consult: «درخواست مشاوره. …»).
- CTA labels «ثبت گزارش عارضه» and «ثبت درخواست مشاوره» (previously «ثبت» / «ثبت درخواست»).
- Form states: offline notice (shows phone and email), success, error, and all field validation messages. Also the «(اختیاری)» labels and the field label «محصول استفاده‌شده».
- Product disclaimer: «اطلاعات این صفحه برای آشنایی است و جایگزین تجویز و راهنمایی پزشک یا داروساز نیست.»
- All 404 page copy.
- Gallery alt text «گالری نفس زیست فارمد، تصویر N از ۶».
- About: values lead «اصول مشترک ما».
- Menu link «فهرست کامل محصولات».
- Screen-reader-only strings (menu/sheet labels, "opens in new tab").
- **Latin names added for display (verify!):** Tiotoriva / Tiotropium bromide; Coldanese Plus / Carrageenan + Xylitol; Folinozit / Myo-inositol + Folic acid; Meglozek / Esomeprazole; Capsulizer / Dry powder inhaler device.

### Removed decorative labels (restore if they matter)
«در ارتباط باشیم», «مسیر ما», «نگاه ما به آینده», «در کنار هم», «فرصت‌های شغلی», «نشانی‌های نفس», «گفت‌وگو با نفس», «نفس؛ پیوند دانش و زندگی», «آموزش و حمایت بیماران», the about-hero tag «شرکت دانش‌بنیان نفس زیست فارمد». «دانش و رویدادها» is now an h2. Also removed:
- The slider eyebrows and titles: «نخستین DPI تولید انبوه ایران», «تیوتوریوا؛ هدف اول درمان COPD», «کلدانیز پلاس؛ سپر ویروس‌ها», «پیشگیری و درمان سرماخوردگی», «از سال ۱۳۹۸», «دانش‌بنیان نوع ۱ در حوزه داروهای استنشاقی و نانوداروها».
- The stat **«۴ فرآورده دارویی و تجهیزات»**, because it contradicts the 5 listed items. Confirm the real number.
- The unused `nameSpaced` field.

## Could not verify
- **No `npm install`, `npm run build` or `astro check`.** The build environment had no internet access or npm registry. Pages were rendered through a local esbuild-based Astro-syntax preview, then screenshotted in Chromium at 360/375, 768, 1024, 1280 and 1440px. There is no horizontal overflow at any width and no console errors. Run `npm install && npx astro check && npm run build` before deploying.
- **`package-lock.json` is not in this zip.** It could not be downloaded in full (144 KB). `package.json` is byte-identical to the repo, so keep your existing lock file (copy it in) or let `npm install` regenerate it.
- **`SKILL.md`** is unchanged. Keep the repo copy.
- No Lighthouse run. Remote company images were stubbed in screenshots, so real image crops and sizes are unchecked.
- Latin/generic names above, and whether the product categories are clinically accurate.
- The Estedad licence was read from the bundled font metadata (OFL 1.1). Please double-check it against the upstream repo.

## Suggested next steps
1. Set `site.formEndpoint` in `src/data/site.ts` to a real handler. Until then the forms show the phone/email fallback instead of pretending to submit.
2. Add `site: 'https://nafaspharmed.com'` to `astro.config.mjs` so canonical and OG URLs become absolute.
3. Self-host product and gallery images through `astro:assets` (AVIF/WebP, width/height) for performance and resilience.
4. Remove the unused `@astrojs/react`, `react` and `react-dom` if no islands are planned.
5. Add a `/products` index page (the menu currently links to the home formulary anchor).
6. Consider bringing EN/RU/AR into this repo with Astro i18n. The CSS already uses logical properties, so an LTR locale needs no style rewrite.
