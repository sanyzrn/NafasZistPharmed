/**
 * Small, answer-the-user interactions shared by every page:
 * header hide/show, the mobile "inhale" menu, the cursor-following product
 * preview, image tilt, one-shot reveals, the pinned horizontal timeline and
 * form tabs. Each is a no-op when its markup is absent.
 */

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/** Header: condenses after the first scroll, hides while reading down,
 *  returns on the first scroll up. Also drives the red progress hairline. */
export function initHeader(): void {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return;
  let lastY = window.scrollY;
  let ticking = false;
  const update = () => {
    ticking = false;
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.style.setProperty('--progress', max > 0 ? (y / max).toFixed(4) : '0');
    header.toggleAttribute('data-scrolled', y > 12);
    const open = header.querySelector('[aria-expanded="true"]');
    if (!open) header.toggleAttribute('data-hidden', y > lastY && y > 320);
    lastY = y;
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  header.addEventListener('focusin', () => header.removeAttribute('data-hidden'));
  update();
}

/** Mobile menu: a compact popover under the menu button. The two lines of
 *  the button fold into a cross; outside click, Escape, a link tap or
 *  reaching desktop width close it. Focus moves in on open, is kept inside
 *  (panel + button) while open, and returns to the button on close. */
export function initDrawer(): void {
  const header = document.querySelector<HTMLElement>('[data-header]');
  const pop = document.querySelector<HTMLElement>('[data-pop]');
  const toggle = document.querySelector<HTMLButtonElement>('[data-pop-toggle]');
  if (!header || !pop || !toggle) return;

  const focusables = () =>
    [toggle, ...pop.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')].filter(
      (el) => el.offsetParent !== null,
    );

  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

  const set = (open: boolean, returnFocus = true) => {
    if (open === isOpen()) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', (open ? toggle.dataset.labelClose : toggle.dataset.labelOpen) ?? '');
    pop.toggleAttribute('inert', !open);
    pop.dataset.open = String(open);
    header.toggleAttribute('data-menu-open', open);
    document.documentElement.toggleAttribute('data-scroll-lock', open);
    if (open) {
      header.removeAttribute('data-hidden');
      window.setTimeout(() => pop.querySelector<HTMLElement>('a[href]')?.focus({ preventScroll: true }), 30);
    } else if (returnFocus) {
      toggle.focus({ preventScroll: true });
    }
  };

  toggle.addEventListener('click', () => set(!isOpen()));

  document.addEventListener('keydown', (e) => {
    if (!isOpen()) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      set(false);
      return;
    }
    if (e.key !== 'Tab') return;
    const items = focusables();
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  const outside = (e: Event) => {
    if (!isOpen()) return;
    const target = e.target as Node;
    if (pop.contains(target) || toggle.contains(target)) return;
    set(false, false);
  };
  document.addEventListener('mousedown', outside);
  document.addEventListener('touchstart', outside, { passive: true });

  pop.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) set(false, false);
  });

  window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => {
    if (e.matches) set(false, false);
  });
}

/** Product rows: on precise pointers a product photo floats after the
 *  cursor, leaning into the direction of travel. */
export function initPreview(): void {
  const lists = document.querySelectorAll<HTMLElement>('[data-preview-list]');
  if (!lists.length || !finePointer() || reduced()) return;

  const card = document.createElement('div');
  card.className = 'preview';
  card.setAttribute('aria-hidden', 'true');
  const img = document.createElement('img');
  img.alt = '';
  img.decoding = 'async';
  card.appendChild(img);
  document.body.appendChild(card);

  let x = 0;
  let y = 0;
  let tx = 0;
  let ty = 0;
  let raf = 0;
  let on = false;

  const loop = () => {
    const dx = tx - x;
    x += dx * 0.16;
    y += (ty - y) * 0.16;
    const tilt = Math.max(-14, Math.min(14, dx * 0.12));
    card.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) rotate(${tilt}deg)`;
    raf = on || Math.abs(dx) > 0.5 ? requestAnimationFrame(loop) : 0;
  };

  lists.forEach((list) => {
    list.addEventListener('pointermove', (e) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!raf) raf = requestAnimationFrame(loop);
    });
    list.querySelectorAll<HTMLElement>('[data-preview]').forEach((row) => {
      row.addEventListener('pointerenter', (e) => {
        const src = row.dataset.preview;
        if (src && img.getAttribute('src') !== src) img.src = src;
        if (!on) {
          x = tx = e.clientX;
          y = ty = e.clientY;
        }
        on = true;
        card.dataset.on = 'true';
        if (!raf) raf = requestAnimationFrame(loop);
      });
      row.addEventListener('pointerleave', () => {
        on = false;
        card.dataset.on = 'false';
      });
    });
  });
}

/** Pointer tilt for product imagery. */
export function initTilt(): void {
  if (!finePointer() || reduced()) return;
  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--ry', `${(px * 14).toFixed(2)}deg`);
      el.style.setProperty('--rx', `${(-py * 14).toFixed(2)}deg`);
      el.style.setProperty('--gx', `${((px + 0.5) * 100).toFixed(1)}%`);
      el.style.setProperty('--gy', `${((py + 0.5) * 100).toFixed(1)}%`);
    });
    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    });
  });
}

/** One-shot reveals for the few elements that earn one (images, drawn
 *  lines). Hidden state only exists under html.js, so JS-off shows all. */
export function initReveal(): void {
  const items = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (!items.length) return;
  if (reduced() || !('IntersectionObserver' in window)) {
    items.forEach((el) => (el.dataset.inview = 'true'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        (entry.target as HTMLElement).dataset.inview = 'true';
        io.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -12% 0px' },
  );
  items.forEach((el) => io.observe(el));
}

/** About timeline: on wide screens the section pins and vertical scrolling
 *  moves the years sideways, in reading direction. */
export function initHorizontal(): void {
  const section = document.querySelector<HTMLElement>('[data-hscroll]');
  const track = section?.querySelector<HTMLElement>('[data-hscroll-track]');
  if (!section || !track) return;
  const wide = window.matchMedia('(min-width: 1024px)');
  const rtl = getComputedStyle(section).direction === 'rtl';
  let extra = 0;
  let raf = 0;

  const measure = () => {
    if (!wide.matches || reduced()) {
      section.removeAttribute('data-pinned');
      section.style.removeProperty('--extra');
      track.style.transform = '';
      return;
    }
    section.setAttribute('data-pinned', '');
    extra = Math.max(0, track.scrollWidth - track.clientWidth);
    section.style.setProperty('--extra', `${extra}px`);
    render();
  };

  const render = () => {
    raf = 0;
    if (!section.hasAttribute('data-pinned')) return;
    const r = section.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    const p = Math.min(1, Math.max(0, -r.top / Math.max(1, total)));
    section.style.setProperty('--hp', p.toFixed(4));
    track.style.transform = `translate3d(${(rtl ? 1 : -1) * p * extra}px, 0, 0)`;
  };

  window.addEventListener('scroll', () => {
    if (!raf) raf = requestAnimationFrame(render);
  }, { passive: true });
  window.addEventListener('resize', measure);
  wide.addEventListener('change', measure);
  measure();
}

/** Home forms: a segmented switch between "report" and "consult". Without
 *  JS both forms simply stand side by side. */
export function initTabs(): void {
  document.querySelectorAll<HTMLElement>('[data-tabs]').forEach((root) => {
    const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls') ?? ''));
    if (!tabs.length) return;
    root.dataset.enhanced = 'true';
    const select = (i: number, focus = false) => {
      tabs.forEach((t, j) => {
        t.setAttribute('aria-selected', String(i === j));
        t.tabIndex = i === j ? 0 : -1;
        panels[j]?.toggleAttribute('hidden', i !== j);
      });
      root.style.setProperty('--tab', String(i));
      if (focus) tabs[i].focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(i));
      t.addEventListener('keydown', (e) => {
        const rtl = getComputedStyle(root).direction === 'rtl';
        const next = rtl ? 'ArrowLeft' : 'ArrowRight';
        const prev = rtl ? 'ArrowRight' : 'ArrowLeft';
        if (e.key === next) select((i + 1) % tabs.length, true);
        if (e.key === prev) select((i - 1 + tabs.length) % tabs.length, true);
      });
    });
    select(0);
  });
}

/** Split a display heading into words that rise one after another the first
 *  time it enters the viewport. Used on page titles only. */
export function initSplit(): void {
  document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
    if (el.dataset.splitDone) return;
    el.dataset.splitDone = 'true';
    const full = (el.textContent ?? '').trim();
    const words = full.split(/\s+/);
    el.textContent = '';
    const sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = full;
    el.appendChild(sr);
    words.forEach((w, i) => {
      const outer = document.createElement('span');
      outer.className = 'split-word';
      outer.setAttribute('aria-hidden', 'true');
      const inner = document.createElement('span');
      inner.textContent = w;
      inner.style.setProperty('--i', String(i));
      outer.appendChild(inner);
      el.appendChild(outer);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
    requestAnimationFrame(() => (el.dataset.inview = 'true'));
  });
}
