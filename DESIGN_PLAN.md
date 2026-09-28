# Design plan: Nafas Zist Pharmed

**Subject:** a knowledge-based Iranian maker of inhaled (DPI) medicines. The name means *breath*.
**Audience:** clinicians, pharmacists, distributors, partners, regulators, investors.
**Primary job:** establish credibility; get people to the company, the products and contact details fast.

## Concept: "one breath, then stillness"
The logo is two soft arcs over a dot, like air leaving a DPI mouthpiece. The whole identity grows from that mark. It is spent loudly **once**, in the home hero: the arcs repeat outward as a *breath field* and take a single inhale and exhale on load. Everything else is still air: generous space, hairlines, light-weight type, and red used only where it means "act here".

## Colour (derived from the logo red, not a medical blue)
| Name | Hex | Role |
|---|---|---|
| Nafas Red | `#B61615` | logo, primary action, focus ring, current page (6.5:1 on Paper) |
| Ember | `#86100F` | hover/pressed, red text on tint |
| Graphite | `#1B2124` | body and heading text |
| Slate | `#55616A` | secondary text, ≥5.5:1 on every surface |
| Air | `#EDF1F2` | quiet panels, footer, table stripes |
| Paper | `#FAFBFB` | page background (cool, not cream) |

All text pairs pass WCAG AA. Lines and tints are derived with `color-mix` and never carry text.

## Type
- **Estedad** (variable 100–900, SIL OFL 1.1), self-hosted and subset (Arabic/Persian + Basic Latin + punctuation, 84 KB woff2). Its built-in Latin is drawn on the same skeleton, so drug names like <bdi>Tiotropium</bdi> share the baseline and weight. No second family is needed.
- Roles: hero 250 weight at `clamp(2.5rem…6rem)`, line-height 1.32. h1/h2 light 300. Body 17px, line-height 1.95, measure 38rem. Labels 13–15px medium, Slate.
- Rules: no letter-spacing, italic or caps. Emphasis by weight only. Persian digits in copy. Latin names wrapped in `<bdi dir="ltr">`.
- Type as design: the hero headline's own weight breathes (variable `wght` 120 → 330 → 250) with the arcs.

## Layout
Twelve-column fluid container (78rem max). Content sits on the **inline-start (right) edge**. Body text is right-aligned and ragged-left; nothing is centred except the bottom bar and the breath field's own axis. Sections are separated by space and single hairlines, not boxes.

### Home
```
┌──────────────────────────────────────────────────────────┐
│ [logo] نفس زیست فارمد   نخست  محصولات▾  درباره  تماس   FA EN RU AR │  glass header
├──────────────────────────────────────────────────────────┤
│                                    مراقب شما،            │
│      ((( ((( breath field )))            در هر نفس        │  ← the one bold place
│        (( (  ●  ) ))              lead (2 lines)          │
│                          [درباره نفس] [محصولات نفس ←]     │
│  ──────────────────────────────────────────────────────  │
│                    DPI       نوع ۱        ۱۳۹۸           │  quiet facts row
├──────────────────────────────────────────────────────────┤
│ محصولات نفس                                              │
│ ── تنفسی ─────────────────────────────────────────────── │  formulary index
│  تیوتوریوا  Tiotoriva   کپسول DPI   Tiotropium       ←   │  (rows, not cards)
│  کپسولایزر  Capsulizer  دستگاه      …                 ←   │
│ ── گوارش / زنان / … ──────────────────────────────────── │
├──────────────────────────────────────────────────────────┤
│ about excerpt + image      │  news list (hairline rows)  │
├──────────────────────────────────────────────────────────┤
│ گزارش و مشاوره: two forms side by side (stack on mobile) │
├──────────────────────────────────────────────────────────┤
│ footer on Air: contact, addresses, links, languages      │
└──────────────────────────────────────────────────────────┘
 mobile/tablet (<1024px): floating glass bottom bar  [خانه][محصولات][درباره][تماس]
```

### Product page
```
┌──────────────────────────────────────────────────────────┐
│ صفحه نخست / محصولات / تیوتوریوا                           │
│ تنفسی                                                    │
│ تیوتوریوا  Tiotoriva                     ┌─────────────┐ │
│ کپسول استنشاقی DPI …                     │  product    │ │
│ summary                                  │  image      │ │
│ ─ نام ژنریک ─── Tiotropium bromide       └─────────────┘ │
│ ─ گروه دارویی ─ …                                        │
│ [کاتالوگ انگلیسی] [کاتالوگ فارسی] [آموزش نحوه استفاده]    │
├───────────────┬──────────────────────────────────────────┤
│ sticky TOC    │ sections: indications, usage, …          │
│ (scrollspy)   │ disclaimer                               │
├───────────────┴──────────────────────────────────────────┤
│ other products (formulary rows)                          │
└──────────────────────────────────────────────────────────┘
```

## Principles
1. **One breath.** The breath field and headline weight are the only non-user-triggered motion, once per load, disabled under `prefers-reduced-motion`.
2. **Softness only where it is physical.** Blur/glass only on layers that float (header, bottom bar, sheet backdrop). Shadows only on floating layers. Glow only in the breath field.
3. **Structure is information.** Hairlines separate records, categories group products, numbering only where there is a real sequence (none on the site today).
4. **Radius by hierarchy:** 10 inputs · 18 panels · 32 imagery · pill for actions.
5. **Say exactly what happens.** CTAs name the result ("ثبت گزارش عارضه"), and errors say what to fix.

## Plan review (against the brief)
| First instinct | Why it read as generic | Change |
|---|---|---|
| Product **card grid** with image, title, button | The SaaS card kit the skill warns about; hides the data professionals scan for | **Formulary index**: rows grouped by therapeutic class with Persian name, Latin name, form and generic |
| Hero headline with **one word in red** | The most common generated-headline tell | Whole headline in Graphite. Emphasis comes from the variable-weight breath, not colour |
| **Big-number stat band** (۱۳۹۸ · ۴ products · …) with gradient | Default hero treatment; the "۴ فرآورده" figure also contradicts the 5 listed items | Quiet three-item facts row below a hairline; the contradictory stat removed |
| **Eyebrow tags** above every heading (old site had 10+) | Template chrome, no information | Removed. Where a tag carried meaning it became the h2 or a lead sentence |
| Teal/blue "medical" palette | Pharma cliché, unrelated to the brand | Palette derived from the logo red plus cool neutrals ("air") |
| Vazirmatn | The default Persian choice | Estedad: lighter, rounder, with a real variable axis that the hero animates |
| Fade-up on each section, hover-lift on cards | Generic motion | No scroll reveals. Micro-interactions only (menu, sheet, row hover tint, focus) |
| Hamburger drawer on mobile | Adds a hidden layer for 4 links | Floating bottom bar + products sheet |

**Critique pass (Chanel rule):** removed the faint "quiet arcs" that echoed the breath field behind every inner-page title. Repeating the signature diluted it; it now lives only on the home hero.
