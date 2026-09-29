/**
 * Product mechanism panels (ProductMotion.astro). The chips pick a state;
 * while the panel is on screen and nobody has touched it, the states advance
 * on their own. Picking a state or pressing pause stops the auto-advance;
 * pause also freezes the looping CSS motion (WCAG 2.2.2).
 */
const STEP_MS = 5200;

export function initMotion(): void {
  document.querySelectorAll<HTMLElement>('[data-motion]').forEach((panel) => {
    const chips = Array.from(panel.querySelectorAll<HTMLButtonElement>('[data-motion-step]'));
    const pause = panel.querySelector<HTMLButtonElement>('[data-motion-pause]');
    if (!chips.length) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let state = 0;
    let auto = !reduced;
    let visible = false;
    let timer = 0;

    const show = (i: number) => {
      state = i;
      panel.dataset.state = String(i);
      chips.forEach((c, j) => c.setAttribute('aria-pressed', String(i === j)));
    };

    const schedule = () => {
      window.clearTimeout(timer);
      if (auto && visible) timer = window.setTimeout(() => {
        show((state + 1) % chips.length);
        schedule();
      }, STEP_MS);
    };

    chips.forEach((chip, i) =>
      chip.addEventListener('click', () => {
        auto = false;
        window.clearTimeout(timer);
        // announce captions only once the visitor is driving
        panel.querySelector('[data-motion-captions]')?.setAttribute('aria-live', 'polite');
        show(i);
      }),
    );

    pause?.addEventListener('click', () => {
      const paused = pause.getAttribute('aria-pressed') !== 'true';
      pause.setAttribute('aria-pressed', String(paused));
      panel.toggleAttribute('data-paused', paused);
      auto = !paused && !reduced;
      schedule();
    });

    new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        schedule();
      },
      { threshold: 0.35 },
    ).observe(panel);

    show(0);
  });
}
