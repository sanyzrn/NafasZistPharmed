# Design plan: Nafas Zist Pharmed — "Particle & Breath" (phase 3)

**Subject:** a knowledge-based Iranian maker of dry-powder inhaled medicines (DPI). *Nafas* means breath.
**Audience:** clinicians, pharmacists, distributors, partners, patients.
**Primary job:** make the company memorable and credible, then get people to products and contact fast.

## Concept
The company's real know-how is *particle aerodynamics*: micronised powder that only works if an
inhaled stream of air lifts it, breaks it apart and carries it deep into the lung. The whole
identity is built from that: powder particles, airflow, and the path of one breath.

## Colour
| Name | Hex | Role |
|---|---|---|
| Oxygen | `#E8EEEE` | page (cool clean-room mineral, not cream, not white) |
| Petrol | `#0C2A35` | ink; and the always-dark "inside the lung" sections |
| Nafas Red | `#B61615` | the only red: actions, marks, the active dose particle |
| Slate | `#45606A` | secondary text (AA) |

Dark theme pushes the same petrol hue down (`#081C24`); red stays `#B61615` (red text turns to ink on dark for contrast).

## Type
Estedad variable (fa) / IBM Plex Sans Arabic (ar) / IBM Plex Sans variable (en, ru).
Contrast of weight is the personality: display headings at 850–900, leads at a hairline 200.
The variable axis is used as motion: the four company values gain weight when you reach for
them. The footer ends with a live breath trace the visitor can take over (press and hold).

## Signature moments (motion budget)
1. **Home hero — the powder word.** «نفس» (or *Nafas*) rendered as ~3,000 particles on canvas.
   They are puffed in from a corner and condense on load (the one orchestrated page-load moment),
   the pointer acts as a stream of air (push + swirl + drag), a click is a puff, an idle gust
   sweeps through when nobody touches it, and scrolling away exhales the cloud upward.
2. **"The path of one breath"** — a pinned, scroll-told 4-step sequence (a real sequence, so it is
   numbered): capsule opens → inhaled air lifts the powder → particles de-agglomerate → the dose
   reaches the alveoli. Particles travel along the actual SVG airway paths.
3. Answering motion only elsewhere: floating product preview that follows the cursor over the
   formulary, product-name morph between pages (cross-document View Transitions), iris-reveal
   images, pinned horizontal timeline on /about, compact popover mobile menu, particle halo
   around product images, a scatterable 404.

Everything runs off-screen-paused and collapses to a still frame under `prefers-reduced-motion`.
Without JS the content is complete (fallback word, both forms, all story steps).

## Layout
Content aligns to the inline-start edge (right in fa/ar). Products are a typographic index
(huge names, hairline rows), not cards. Night sections (story, timeline, footer, menu) are the
only dark planes, so the page reads as "outside air → inside the lung → outside air".
