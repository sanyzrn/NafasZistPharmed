/**
 * Liquid ("gooey") interactions. Shapes inside a `.liquid` layer are blurred
 * and their alpha is thresholded by the SVG filters in Base.astro (#goo,
 * #goo-s), so when two of them come close they fuse like drops of liquid and
 * stretch apart before they separate. Text and icons always live in a crisp
 * layer above, so the effect never blurs anything you read.
 *
 * - GooTrack: an indicator made of a fast "head", a "mid" and a lagging "tail"; while
 *   it travels the chain stretches into one elongated drop (nav, dock, chips, tabs).
 * - initDock: the mobile bottom bar; products drip up out of it.
 * - initGoDots: product-row arrows pull a small drop toward the cursor.
 */

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export class GooTrack {
  private parts: HTMLElement[];
  private root: HTMLElement;
  private target: HTMLElement | null = null;

  /** `parts` run from fastest (head) to slowest (tail). */
  constructor(root: HTMLElement, parts: HTMLElement[]) {
    this.root = root;
    this.parts = parts;
    new ResizeObserver(() => this.place(this.target, true)).observe(root);
  }

  /** Moves the drop under `el` (or melts it away when null). */
  place(el: HTMLElement | null, instant = false): void {
    this.target = el;
    const parts = this.parts;
    if (instant || reduced()) parts.forEach((p) => p.setAttribute('data-instant', ''));
    if (!el) {
      parts.forEach((p) => (p.dataset.on = 'false'));
    } else {
      const r = this.root.getBoundingClientRect();
      const e = el.getBoundingClientRect();
      parts.forEach((p) => {
        p.style.setProperty('--x', `${e.left - r.left}px`);
        p.style.setProperty('--y', `${e.top - r.top}px`);
        p.style.setProperty('--w', `${e.width}px`);
        p.style.setProperty('--h', `${e.height}px`);
        p.dataset.on = 'true';
      });
    }
    if (instant || reduced()) {
      // flush, then restore transitions for the next move
      void this.root.offsetWidth;
      requestAnimationFrame(() => parts.forEach((p) => p.removeAttribute('data-instant')));
    }
  }
}

/** Builds a GooTrack from `[data-goo-head|mid|tail]` inside `scope`. */
export function trackIn(scope: HTMLElement, root: HTMLElement = scope): GooTrack | null {
  const parts = ['head', 'mid', 'tail']
    .map((k) => scope.querySelector<HTMLElement>(`[data-goo-${k}]`))
    .filter((el): el is HTMLElement => !!el);
  return parts.length ? new GooTrack(root, parts) : null;
}

/** Desktop header nav: the drop rests under the current page and flows to
 *  whatever you point at or focus. */
export function initNavGoo(): void {
  const list = document.querySelector<HTMLElement>('[data-nav-goo]');
  if (!list) return;
  const track = trackIn(list);
  if (!track) return;
  const links = Array.from(list.querySelectorAll<HTMLElement>('.nav__link'));
  const current = () =>
    links.find((l) => l.getAttribute('aria-current') === 'page' || l.dataset.current === 'true') ?? null;
  track.place(current(), true);
  links.forEach((l) => {
    l.addEventListener('pointerenter', () => track.place(l));
    l.addEventListener('focus', () => track.place(l));
  });
  list.addEventListener('pointerleave', () => track.place(current()));
  list.addEventListener('focusout', (e) => {
    if (!list.contains(e.relatedTarget as Node)) track.place(current());
  });
}

/** Any group of toggle chips / tabs: the drop follows the pressed one. */
export function initChipGoo(): void {
  document.querySelectorAll<HTMLElement>('[data-chip-goo]').forEach((group) => {
    const track = trackIn(group);
    if (!track) return;
    const chips = Array.from(group.querySelectorAll<HTMLElement>('[aria-pressed], [role="tab"]'));
    const pressed = () =>
      chips.find((c) => c.getAttribute('aria-pressed') === 'true' || c.getAttribute('aria-selected') === 'true') ?? null;
    group.dataset.gooReady = 'true';
    track.place(pressed(), true);
    new MutationObserver(() => track.place(pressed())).observe(group, {
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-pressed', 'aria-selected'],
    });
  });
}

/** Mobile bottom bar. */
export function initDock(): void {
  const dock = document.querySelector<HTMLElement>('[data-dock]');
  if (!dock) return;
  const toggle = dock.querySelector<HTMLButtonElement>('[data-dock-toggle]');
  const sheet = dock.querySelector<HTMLElement>('[data-dock-products]');
  const scrim = document.querySelector<HTMLElement>('[data-dock-scrim]');
  const bar = dock.querySelector<HTMLElement>('[data-goo-track]');
  if (!toggle || !sheet || !bar) return;
  const track = trackIn(dock, dock);
  const items = Array.from(dock.querySelectorAll<HTMLElement>('[data-goo-item]'));
  const current = () =>
    items.find((i) => i.getAttribute('aria-current') === 'page' || i.dataset.current === 'true') ?? null;
  // wait a frame so the bar has its final size
  requestAnimationFrame(() => track?.place(current(), true));

  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';
  const set = (open: boolean, focusBack = true) => {
    if (open === isOpen()) return;
    toggle.setAttribute('aria-expanded', String(open));
    dock.dataset.open = String(open);
    scrim?.setAttribute('data-open', String(open));
    sheet.toggleAttribute('inert', !open);
    track?.place(open ? toggle : current());
    if (open) {
      window.setTimeout(() => sheet.querySelector<HTMLElement>('a')?.focus({ preventScroll: true }), 380);
    } else if (focusBack) {
      toggle.focus({ preventScroll: true });
    }
  };

  toggle.addEventListener('click', () => set(!isOpen()));
  scrim?.addEventListener('click', () => set(false, false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) set(false);
  });
  sheet.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) set(false, false);
  });

  // page links: let the drop flow to the tapped item, then navigate
  items.forEach((item) => {
    if (!(item instanceof HTMLAnchorElement)) return;
    item.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || reduced()) return;
      e.preventDefault();
      set(false, false);
      track?.place(item);
      window.setTimeout(() => (window.location.href = item.href), 260);
    });
  });

  window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => {
    if (e.matches) set(false, false);
  });
}

/** Product-row arrows: a small drop leans out of the circle toward the
 *  pointer, stretches, and snaps back when you move away. */
export function initGoDots(): void {
  if (reduced() || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  document.querySelectorAll<HTMLElement>('.index__row').forEach((row) => {
    const dot = row.querySelector<HTMLElement>('[data-go-drop]');
    const core = row.querySelector<HTMLElement>('.index__go');
    if (!dot || !core) return;
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let raf = 0;
    const loop = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      dot.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.2 ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    row.addEventListener('pointermove', (e) => {
      const r = core.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy) || 1;
      // pulls up to 34px, a little less the farther the pointer is
      const reach = d < 260 ? Math.min(34, d * 0.35) : 0;
      tx = (dx / d) * reach;
      ty = (dy / d) * reach;
      kick();
    });
    row.addEventListener('pointerleave', () => {
      tx = 0;
      ty = 0;
      kick();
    });
  });
}
