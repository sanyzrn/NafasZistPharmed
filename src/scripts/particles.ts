/**
 * Powder field — the site's signature.
 *
 * A DPI capsule holds micronised powder that only works when airflow lifts it
 * and carries it deep into the lung. This canvas does the same thing with a
 * word: thousands of particles settle into a shape (the word "نفس", "404", or
 * a halo around a product), the pointer behaves like a stream of air that
 * lifts and swirls them, a click is a puff, and scrolling away "exhales" the
 * whole cloud upward.
 *
 * Markup: <canvas data-particles data-shape="text|halo" data-text="…"> placed
 * inside a positioned container; an optional [data-particles-box] sibling
 * decides where the shape sits (layout stays in CSS). The canvas `color`
 * gives the ink; `--particle-accent` gives the red dose particles.
 *
 * Quiet by design: stops when off-screen or the tab is hidden, and renders a
 * single still frame under prefers-reduced-motion.
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hx: number;
  hy: number;
  r: number;
  tone: 0 | 1 | 2;
  phase: number;
  delay: number;
  lift: number;
}

interface Pointer {
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
  last: number;
}

const TAU = Math.PI * 2;

export function initParticles(): void {
  document.querySelectorAll<HTMLCanvasElement>('canvas[data-particles]').forEach((canvas) => {
    if (canvas.dataset.ready) return;
    canvas.dataset.ready = 'true';
    createField(canvas);
  });
}

function createField(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const host = canvas.parentElement as HTMLElement;
  const shape = canvas.dataset.shape === 'halo' ? 'halo' : 'text';
  const text = canvas.dataset.text ?? '';
  const scrollExhale = canvas.dataset.exhale !== 'false';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rtl = getComputedStyle(host).direction === 'rtl';

  let W = 0;
  let H = 0;
  let dpr = 1;
  let particles: Particle[] = [];
  let colors: [string, string, string] = ['#0c2a35', '#b61615', '#45606a'];
  let box = { x: 0, y: 0, w: 0, h: 0, cx: 0, cy: 0 };
  let running = false;
  let visible = true;
  let raf = 0;
  let born = performance.now();
  let lastInteraction = performance.now();
  let gust: { t0: number; y: number; dir: number } | null = null;
  const pointer: Pointer = { x: -9999, y: -9999, vx: 0, vy: 0, active: false, last: 0 };

  const readColors = () => {
    // custom properties come back unresolved (e.g. light-dark()), so let
    // the browser resolve them through a probe element's `color`
    const probe = document.createElement('span');
    probe.style.display = 'none';
    host.appendChild(probe);
    const resolve = (v: string, fallback: string) => {
      probe.style.color = '';
      probe.style.color = v;
      return getComputedStyle(probe).color || fallback;
    };
    colors = [
      getComputedStyle(canvas).color || colors[0],
      resolve('var(--particle-accent)', colors[1]),
      resolve('var(--particle-soft)', colors[2]),
    ];
    probe.remove();
  };

  const measureBox = () => {
    const hostRect = canvas.getBoundingClientRect();
    const target = host.querySelector<HTMLElement>('[data-particles-box]');
    if (target) {
      const r = target.getBoundingClientRect();
      box = { x: r.left - hostRect.left, y: r.top - hostRect.top, w: r.width, h: r.height, cx: 0, cy: 0 };
    } else {
      box = { x: 0, y: 0, w: W, h: H, cx: 0, cy: 0 };
    }
    box.cx = box.x + box.w / 2;
    box.cy = box.y + box.h / 2;
  };

  /** Home positions for the text shape: rasterise the word, sample on a grid. */
  const sampleText = (): { x: number; y: number }[] => {
    const off = document.createElement('canvas');
    const w = Math.max(1, Math.floor(box.w));
    const h = Math.max(1, Math.floor(box.h));
    off.width = w;
    off.height = h;
    const o = off.getContext('2d', { willReadFrequently: true });
    if (!o) return [];
    const family = getComputedStyle(canvas).fontFamily;
    const weight = canvas.dataset.weight ?? '900';
    let size = h * 0.92;
    o.font = `${weight} ${size}px ${family}`;
    const measured = o.measureText(text).width;
    if (measured > w * 0.98) size *= (w * 0.98) / measured;
    o.font = `${weight} ${size}px ${family}`;
    o.direction = rtl ? 'rtl' : 'ltr';
    o.textAlign = 'center';
    o.textBaseline = 'middle';
    o.fillStyle = '#000';
    o.fillText(text, w / 2, h / 2 + size * 0.04);
    const data = o.getImageData(0, 0, w, h).data;

    // pick a grid gap so the particle count follows the area, capped for phones
    let filled = 0;
    for (let i = 3; i < data.length; i += 16) if (data[i] > 128) filled++;
    filled *= 4;
    const budget = Math.min(W < 640 ? 1700 : 3800, Math.max(700, (W * H) / 320));
    const gap = Math.max(2, Math.sqrt(filled / budget));
    const pts: { x: number; y: number }[] = [];
    for (let y = 0; y < h; y += gap) {
      for (let x = 0; x < w; x += gap) {
        const jx = x + (Math.random() - 0.5) * gap * 0.9;
        const jy = y + (Math.random() - 0.5) * gap * 0.9;
        const ix = Math.min(w - 1, Math.max(0, Math.round(jx)));
        const iy = Math.min(h - 1, Math.max(0, Math.round(jy)));
        if (data[(iy * w + ix) * 4 + 3] > 128) pts.push({ x: box.x + jx, y: box.y + jy });
      }
    }
    return pts;
  };

  /** Home positions for the halo: a soft annulus, denser near its middle. */
  const sampleHalo = (): { x: number; y: number }[] => {
    const R = Math.min(box.w, box.h) / 2;
    const n = Math.round(Math.min(W < 640 ? 700 : 1300, (box.w * box.h) / 160));
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU;
      const g = (Math.random() + Math.random() + Math.random()) / 3; // bell-ish
      const rr = R * (1.12 + (g - 0.5) * 0.45 + Math.random() * Math.random() * 0.35);
      pts.push({ x: box.cx + Math.cos(a) * rr, y: box.cy + Math.sin(a) * rr * 0.92 });
    }
    return pts;
  };

  const build = () => {
    const rect = canvas.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    measureBox();
    readColors();
    const homes = shape === 'halo' ? sampleHalo() : sampleText();
    const fresh = particles.length === 0;
    // the cloud is "puffed" in from the mouthpiece: bottom, inline-end corner
    const ox = rtl ? W * 0.12 : W * 0.88;
    const oy = H * 1.05;
    particles = homes.map((p, i) => {
      const old = particles[i];
      const tone: 0 | 1 | 2 = Math.random() < 0.075 ? 1 : Math.random() < 0.3 ? 2 : 0;
      return {
        x: old ? old.x : fresh && !reduced ? ox + (Math.random() - 0.5) * 120 : p.x,
        y: old ? old.y : fresh && !reduced ? oy + (Math.random() - 0.5) * 60 : p.y,
        vx: old ? old.vx : fresh && !reduced ? (rtl ? 1 : -1) * (4 + Math.random() * 16) : 0,
        vy: old ? old.vy : fresh && !reduced ? -(8 + Math.random() * 18) : 0,
        hx: p.x,
        hy: p.y,
        r: tone === 1 ? 1.4 + Math.random() * 1.6 : 0.7 + Math.random() * Math.random() * 2,
        tone,
        phase: Math.random() * TAU,
        delay: Math.random() * 0.9,
        lift: 0.4 + Math.random() * 1.2,
      };
    });
  };

  const exhaleAmount = () => {
    if (!scrollExhale) return 0;
    const r = host.getBoundingClientRect();
    const d = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height * 0.85)));
    return d;
  };

  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    for (let tone = 0 as 0 | 1 | 2; tone <= 2; tone = (tone + 1) as 0 | 1 | 2) {
      ctx.fillStyle = colors[tone];
      ctx.globalAlpha = tone === 2 ? 0.55 : 1;
      ctx.beginPath();
      for (const p of particles) {
        if (p.tone !== tone) continue;
        ctx.moveTo(p.x + p.r, p.y);
        ctx.arc(p.x, p.y, p.r, 0, TAU);
      }
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  const step = (now: number) => {
    const t = (now - born) / 1000;
    const exhale = exhaleAmount();
    // one breath ≈ 5.6 s: the shape swells and settles
    const breath = 1 + 0.016 * Math.sin((t * TAU) / 5.6);
    const spin = shape === 'halo' ? t * 0.06 : 0;
    const cos = Math.cos(spin);
    const sin = Math.sin(spin);

    // idle gust: when nobody has touched the field for a while, a soft
    // stream of air sweeps across it so the page still feels alive
    if (!gust && now - lastInteraction > 6500 && t > 3) {
      gust = { t0: now, y: box.y + box.h * (0.25 + Math.random() * 0.5), dir: Math.random() < 0.5 ? 1 : -1 };
    }
    let gx = -9999;
    let gy = -9999;
    if (gust) {
      const g = (now - gust.t0) / 2200;
      if (g >= 1) {
        gust = null;
        lastInteraction = now;
      } else {
        const span = box.w + 400;
        gx = gust.dir > 0 ? box.x - 200 + span * g : box.x + box.w + 200 - span * g;
        gy = gust.y + Math.sin(g * Math.PI * 2) * box.h * 0.12;
      }
    }

    // pointer velocity decays so a still cursor stops "blowing"
    pointer.vx *= 0.9;
    pointer.vy *= 0.9;
    const R = Math.max(90, Math.min(170, W * 0.1));
    const R2 = R * R;

    for (const p of particles) {
      // spring strength ramps up per particle: the cloud condenses, not snaps
      const age = Math.max(0, t - p.delay);
      const k = 0.012 + 0.034 * Math.min(1, age / 1.4);

      let dx0 = p.hx - box.cx;
      let dy0 = p.hy - box.cy;
      if (spin) {
        const rx = dx0 * cos - dy0 * sin;
        dy0 = dx0 * sin + dy0 * cos;
        dx0 = rx;
      }
      let tx = box.cx + dx0 * breath + Math.sin(t * 0.8 + p.phase) * 0.7;
      let ty = box.cy + dy0 * breath + Math.cos(t * 0.9 + p.phase) * 0.7;

      if (exhale > 0) {
        const e = exhale * exhale;
        tx += dx0 * e * 1.4 + Math.sin(p.phase * 3 + t) * 40 * e;
        ty -= e * H * 0.55 * p.lift;
      }

      p.vx += (tx - p.x) * k;
      p.vy += (ty - p.y) * k;

      if (pointer.active) airflow(p, pointer.x, pointer.y, pointer.vx, pointer.vy, R, R2, 1);
      if (gust) airflow(p, gx, gy, 9 * (gust.dir || 1), 0, R * 1.2, R2 * 1.44, 0.55);

      p.vx *= 0.86;
      p.vy *= 0.86;
      p.x += p.vx;
      p.y += p.vy;
    }
    draw();
  };

  /** Air, not a magnet: particles are pushed out, swirled, and dragged along
   *  with the stream's own velocity. */
  const airflow = (p: Particle, ax: number, ay: number, avx: number, avy: number, R: number, R2: number, s: number) => {
    const dx = p.x - ax;
    const dy = p.y - ay;
    const d2 = dx * dx + dy * dy;
    if (d2 > R2) return;
    const d = Math.sqrt(d2) || 1;
    const f = (1 - d / R) ** 2 * s;
    const push = 5.5 * f;
    const swirl = 2.2 * f;
    p.vx += (dx / d) * push + (-dy / d) * swirl + avx * 0.16 * f;
    p.vy += (dy / d) * push + (dx / d) * swirl + avy * 0.16 * f - 0.6 * f;
  };

  const puff = (x: number, y: number) => {
    for (const p of particles) {
      const dx = p.x - x;
      const dy = p.y - y;
      const d = Math.hypot(dx, dy) || 1;
      if (d > 320) continue;
      const f = (1 - d / 320) ** 1.5 * 22;
      p.vx += (dx / d) * f + (Math.random() - 0.5) * 3;
      p.vy += (dy / d) * f - Math.random() * 4;
    }
  };

  const loop = (now: number) => {
    step(now);
    raf = running ? requestAnimationFrame(loop) : 0;
  };
  const start = () => {
    if (running || reduced || !visible || document.hidden) return;
    running = true;
    raf = requestAnimationFrame(loop);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  const local = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const init = () => {
    build();
    if (reduced) {
      draw();
      return;
    }
    born = performance.now();
    start();
  };

  if (!reduced) {
    host.addEventListener('pointermove', (e) => {
      const { x, y } = local(e);
      if (pointer.active) {
        pointer.vx = pointer.vx * 0.5 + (x - pointer.x) * 0.5;
        pointer.vy = pointer.vy * 0.5 + (y - pointer.y) * 0.5;
      }
      pointer.x = x;
      pointer.y = y;
      pointer.active = true;
      lastInteraction = performance.now();
      gust = null;
    });
    host.addEventListener('pointerleave', () => {
      pointer.active = false;
    });
    host.addEventListener('pointerdown', (e) => {
      if ((e.target as HTMLElement).closest('a, button, input, select, textarea')) return;
      const { x, y } = local(e);
      puff(x, y);
      lastInteraction = performance.now();
    });

    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    }).observe(host);

    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  }

  // theme switches change the ink colour
  new MutationObserver(() => {
    readColors();
    if (reduced) draw();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  let resizeTimer = 0;
  let lastW = 0;
  new ResizeObserver(() => {
    const w = canvas.getBoundingClientRect().width;
    if (Math.abs(w - lastW) < 2 && particles.length) return; // mobile URL-bar height jitter
    lastW = w;
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      build();
      if (reduced) draw();
    }, 120);
  }).observe(canvas);

  // wait for the display face, otherwise the word is sampled in a fallback font
  const family = getComputedStyle(canvas).fontFamily.split(',')[0].replace(/['"]/g, '').trim();
  const weight = canvas.dataset.weight ?? '900';
  const ready = shape === 'text' && document.fonts ? document.fonts.load(`${weight} 80px "${family}"`, text) : Promise.resolve();
  ready.catch(() => undefined).then(() => {
    lastW = canvas.getBoundingClientRect().width;
    init();
  });
}
