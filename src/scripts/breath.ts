/**
 * The footer's breathing line — a spirometer trace.
 *
 * A red pen draws a breath curve in real time: a short inhale, a long
 * exhale, about fifteen breaths a minute, like a resting adult. Press and
 * hold anywhere on it to take over: holding inhales, letting go exhales, and
 * after a few quiet seconds the line settles back into its own rhythm.
 * Beside it, a sentence counts roughly how many breaths the visitor has
 * taken since arriving on the site ("مراقب شما، در هر نفس").
 */

const ARRIVED_KEY = 'nzp-arrived';
const BREATHS_PER_MIN = 15;
const INHALE_MS = 1500;
const EXHALE_MS = 2500;
const RED = '#b61615';

export function initBreathLine(): void {
  const root = document.querySelector<HTMLElement>('[data-breathline]');
  if (!root) return;
  const canvas = root.querySelector('canvas');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rtl = getComputedStyle(root).direction === 'rtl';

  // ── counter ──
  const countEl = root.querySelector<HTMLElement>('[data-breath-count]');
  const locale = document.documentElement.lang;
  const nf = new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : locale);
  let arrived = Date.now();
  try {
    const stored = Number(sessionStorage.getItem(ARRIVED_KEY));
    if (stored && stored < arrived) arrived = stored;
    else sessionStorage.setItem(ARRIVED_KEY, String(arrived));
  } catch {
    /* storage blocked: count from this page view */
  }
  const updateCount = () => {
    if (!countEl) return;
    const n = Math.max(1, Math.round(((Date.now() - arrived) / 60000) * BREATHS_PER_MIN));
    countEl.textContent = nf.format(n);
  };
  updateCount();
  window.setInterval(updateCount, INHALE_MS + EXHALE_MS);

  // ── phase label ──
  const phaseEl = root.querySelector<HTMLElement>('[data-breath-phase]');
  const setPhase = (inhale: boolean) => {
    if (!phaseEl) return;
    const text = (inhale ? phaseEl.dataset.in : phaseEl.dataset.out) ?? '';
    if (phaseEl.textContent !== text) phaseEl.textContent = text;
    phaseEl.dataset.inhale = String(inhale);
  };

  let W = 0;
  let H = 0;
  const history: number[] = [];
  const resize = () => {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width;
    H = r.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (reduced) drawStatic();
    else fill();
  };

  const penX = () => (rtl ? W * 0.18 : W * 0.82);
  const yOf = (v: number) => H - 14 - v * (H - 34);

  const draw = (v: number) => {
    ctx.clearRect(0, 0, W, H);
    const px = penX();
    const step = 2;
    const dir = rtl ? 1 : -1;

    // baseline
    ctx.strokeStyle = 'rgba(227,236,238,0.14)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, yOf(0) + 0.5);
    ctx.lineTo(W, yOf(0) + 0.5);
    ctx.stroke();

    if (history.length > 1) {
      // soft fill under the trace
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, 'rgba(182,22,21,0.28)');
      grad.addColorStop(1, 'rgba(182,22,21,0)');
      ctx.beginPath();
      ctx.moveTo(px, yOf(0));
      for (let i = 0; i < history.length; i++) ctx.lineTo(px + dir * i * step, yOf(history[i]));
      ctx.lineTo(px + dir * (history.length - 1) * step, yOf(0));
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // the trace
      ctx.beginPath();
      for (let i = 0; i < history.length; i++) {
        const x = px + dir * i * step;
        const y = yOf(history[i]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = RED;
      ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round';
      ctx.shadowColor = RED;
      ctx.shadowBlur = 14;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // the pen
    const py = yOf(v);
    ctx.fillStyle = 'rgba(182,22,21,0.25)';
    ctx.beginPath();
    ctx.arc(px, py, 12 + v * 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = RED;
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(px, py, 2.2, 0, Math.PI * 2);
    ctx.fill();
  };

  /** The same rhythm simulated offline, newest sample first; used to fill
   *  the trace up front and as the still image under reduced motion. */
  function simulate(count: number): number[] {
    let sv = 0.06;
    let inh = true;
    let f = 0;
    const series: number[] = [];
    for (let i = 0; i < count; i++) {
      if (f++ > (inh ? INHALE_MS : EXHALE_MS) / 16.7) {
        inh = !inh;
        f = 0;
      }
      sv += ((inh ? 0.92 : 0.06) - sv) * (inh ? 0.055 : 0.028);
      series.push(sv);
    }
    return series.reverse();
  }

  function fill() {
    const need = Math.ceil(W / 2) + 4;
    if (history.length >= need) return;
    const older = simulate(need - history.length);
    history.push(...older);
  }

  function drawStatic() {
    history.length = 0;
    fill();
    draw(history[0] ?? 0);
  }

  new ResizeObserver(resize).observe(canvas);
  resize();
  setPhase(true);
  if (reduced) return;

  // ── motion: the value chases a target; the target is the rhythm, or the
  //    visitor's own press-and-hold ──
  // pick up where the pre-filled trace ends: at the bottom of an exhale
  let v = history[0] ?? 0.06;
  let inhale = true;
  let phaseStart = performance.now();
  let held = false;
  let manualUntil = 0;
  let raf = 0;
  let running = false;

  const frame = (now: number) => {
    let target: number;
    if (held) {
      target = 1;
      inhale = true;
    } else if (now < manualUntil) {
      target = 0.06;
      inhale = false;
    } else {
      const len = inhale ? INHALE_MS : EXHALE_MS;
      if (now - phaseStart > len) {
        inhale = !inhale;
        phaseStart = now;
      }
      target = inhale ? 0.92 : 0.06;
    }
    // inhale fills fast, exhale empties slowly
    v += (target - v) * (inhale ? 0.055 : 0.028);
    setPhase(inhale);
    history.unshift(v);
    if (history.length > W / 2 + 4) history.length = Math.ceil(W / 2 + 4);
    draw(v);
    raf = running ? requestAnimationFrame(frame) : 0;
  };

  const start = () => {
    if (running) return;
    running = true;
    raf = requestAnimationFrame(frame);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  new IntersectionObserver(([e]) => (e.isIntersecting && !document.hidden ? start() : stop())).observe(root);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
  });

  const press = (e: PointerEvent) => {
    if ((e.target as HTMLElement).closest('a, button')) return;
    held = true;
    root.dataset.held = 'true';
  };
  const release = () => {
    if (!held) return;
    held = false;
    root.dataset.held = 'false';
    manualUntil = performance.now() + 2600;
    // resume the rhythm from a fresh exhale once the visitor lets go
    inhale = false;
    phaseStart = manualUntil;
  };
  root.addEventListener('pointerdown', press);
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);
  // keyboard: Space on the focused line does the same
  root.addEventListener('keydown', (e) => {
    if (e.key === ' ' && !e.repeat) {
      e.preventDefault();
      held = true;
      root.dataset.held = 'true';
    }
  });
  root.addEventListener('keyup', (e) => {
    if (e.key === ' ') release();
  });
}
