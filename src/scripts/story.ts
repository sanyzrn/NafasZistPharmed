/**
 * "The path of one breath": a scroll-told sequence. While the steps scroll
 * past, a pinned drawing of the airway shows the dose leaving the capsule,
 * lifting on the inhaled air, breaking into fine particles and settling in
 * the alveoli. Progress is exposed as --p for CSS; particles are positioned
 * along the real SVG airway paths.
 */
export function initStory(): void {
  const story = document.querySelector<HTMLElement>('[data-story]');
  if (!story) return;
  const steps = Array.from(story.querySelectorAll<HTMLElement>('[data-step]'));
  const list = story.querySelector<HTMLElement>('[data-story-steps]');
  const svg = story.querySelector<SVGSVGElement>('[data-story-svg]');
  if (!steps.length || !list || !svg) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const paths = Array.from(svg.querySelectorAll<SVGPathElement>('[data-route]'));
  const lengths = paths.map((p) => p.getTotalLength());
  const layer = svg.querySelector<SVGGElement>('[data-dose]');
  if (!layer || !paths.length) return;

  // the dose: fine particles, a few larger red ones, each with its own route
  const NS = 'http://www.w3.org/2000/svg';
  const dose = Array.from({ length: 46 }, (_, i) => {
    const c = document.createElementNS(NS, 'circle');
    const big = i % 7 === 0;
    c.setAttribute('r', big ? '3.2' : String(1.2 + Math.random() * 1.6));
    c.setAttribute('class', big ? 'story__dot story__dot--red' : 'story__dot');
    layer.appendChild(c);
    return {
      el: c,
      route: i % paths.length,
      lag: Math.random(),
      spread: (Math.random() - 0.5) * 2,
      seed: Math.random() * Math.PI * 2,
    };
  });

  const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = (x: number) => 1 - (1 - x) ** 3;

  let active = -1;
  let raf = 0;

  const render = () => {
    raf = 0;
    const vh = window.innerHeight;
    const r = list.getBoundingClientRect();
    const p = reduced ? 1 : clamp((vh * 0.55 - r.top) / Math.max(1, r.height - vh * 0.35));
    story.style.setProperty('--p', p.toFixed(4));

    // active step = the one crossing the reading line
    let idx = 0;
    steps.forEach((s, i) => {
      if (s.getBoundingClientRect().top < vh * 0.6) idx = i;
    });
    if (reduced) idx = steps.length - 1;
    if (idx !== active) {
      active = idx;
      steps.forEach((s, i) => s.toggleAttribute('data-active', i === idx));
      story.dataset.stage = String(idx);
    }

    // 0–.22 in the capsule, .22–.5 lifted as one clump, .5–.78 breaking up,
    // .78–1 settling deep in the lung
    const t = performance.now() / 1000;
    const travel = ease(clamp((p - 0.18) / 0.72));
    const breakup = ease(clamp((p - 0.45) / 0.3));
    dose.forEach((d) => {
      const path = paths[d.route];
      const L = lengths[d.route];
      const along = clamp(travel * (1 - d.lag * (0.35 - 0.3 * travel)) * L, 0, L);
      const pt = path.getPointAtLength(along);
      const ahead = path.getPointAtLength(Math.min(L, along + 2));
      let nx = -(ahead.y - pt.y);
      let ny = ahead.x - pt.x;
      const nl = Math.hypot(nx, ny) || 1;
      nx /= nl;
      ny /= nl;
      const jiggle = p < 0.2 ? Math.sin(t * 6 + d.seed) * 1.2 : 0;
      const off = d.spread * (3 + breakup * 16);
      const x = pt.x + nx * off + (p < 0.2 ? d.spread * 9 : 0) + jiggle;
      const y = pt.y + ny * off + (p < 0.2 ? Math.cos(d.seed) * 4 : 0);
      d.el.setAttribute('cx', x.toFixed(2));
      d.el.setAttribute('cy', y.toFixed(2));
    });
  };

  const request = () => {
    if (!raf) raf = requestAnimationFrame(render);
  };

  render();
  if (reduced) return;
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
  // keep the capsule clump gently alive while it waits at the top
  const idle = () => {
    if (story.dataset.stage === '0' && isInView(story)) request();
    window.setTimeout(() => requestAnimationFrame(idle), 60);
  };
  idle();
}

function isInView(el: HTMLElement): boolean {
  const r = el.getBoundingClientRect();
  return r.bottom > 0 && r.top < window.innerHeight;
}
