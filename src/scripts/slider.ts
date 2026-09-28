/**
 * Home hero slider controller. CSS scroll-snap does the scrolling; this
 * module adds prev/next, dots, keyboard support, autoplay (pausing on hover,
 * focus, touch; disabled under prefers-reduced-motion) and a live region.
 * Direction-aware: in RTL, "next" moves to the inline-end (visually left).
 */
const AUTOPLAY_MS = 7000;

export function initHeroSlider(): void {
  document.querySelectorAll<HTMLElement>('[aria-roledescription="carousel"]').forEach((root) => {
    const viewport = root.querySelector<HTMLElement>('[data-slider-viewport]');
    const track = root.querySelector<HTMLElement>('[data-slider-track]');
    const slides = Array.from(root.querySelectorAll<HTMLElement>('[data-slider-slide]'));
    const dots = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-slider-dot]'));
    const prev = root.querySelector<HTMLButtonElement>('[data-slider-prev]');
    const next = root.querySelector<HTMLButtonElement>('[data-slider-next]');
    const status = root.querySelector<HTMLElement>('[data-slider-status]');
    if (!viewport || !track || slides.length === 0) return;

    const rtl = getComputedStyle(root).direction === 'rtl';
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let index = 0;
    let timer: number | undefined;
    let hovered = false;
    let focused = false;
    let touching = false;

    const scrollToSlide = (i: number, smooth = true) => {
      index = (i + slides.length) % slides.length;
      const slide = slides[index];
      viewport.scrollTo({
        left: rtl ? -slide.offsetLeft : slide.offsetLeft,
        behavior: smooth && !reduceMotion.matches ? 'smooth' : 'auto',
      });
    };

    const sync = () => {
      const slideW = slides[0].offsetWidth || 1;
      const raw = Math.round(Math.abs(viewport.scrollLeft) / slideW);
      index = Math.min(slides.length - 1, raw);
      dots.forEach((dot, i) => {
        if (i === index) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
    };

    const announce = (text: string) => {
      if (!status) return;
      // live region stays silent while autoplay runs; used for manual actions
      status.setAttribute('aria-live', 'off');
      status.textContent = text;
    };

    const stopAutoplay = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = undefined;
      }
    };

    const startAutoplay = () => {
      stopAutoplay();
      if (slides.length < 2 || reduceMotion.matches || hovered || focused || touching) return;
      timer = window.setInterval(() => {
        if (document.visibilityState !== 'visible') return;
        scrollToSlide(index + 1);
      }, AUTOPLAY_MS);
    };

    prev?.addEventListener('click', () => {
      scrollToSlide(index - 1);
      announce(prev.getAttribute('aria-label') ?? '');
      startAutoplay();
    });
    next?.addEventListener('click', () => {
      scrollToSlide(index + 1);
      announce(next.getAttribute('aria-label') ?? '');
      startAutoplay();
    });

    dots.forEach((dot, i) => dot.addEventListener('click', () => scrollToSlide(i)));

    root.addEventListener('keydown', (event) => {
      if (event.target !== viewport && !root.contains(event.target as Node)) return;
      if (event.key === 'ArrowRight') {
        // visually right: previous in RTL, next in LTR
        event.preventDefault();
        rtl ? scrollToSlide(index - 1) : scrollToSlide(index + 1);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        rtl ? scrollToSlide(index + 1) : scrollToSlide(index - 1);
      }
    });

    viewport.addEventListener('scroll', () => window.requestAnimationFrame(sync), { passive: true });
    viewport.addEventListener('mouseenter', () => {
      hovered = true;
      stopAutoplay();
    });
    viewport.addEventListener('mouseleave', () => {
      hovered = false;
      startAutoplay();
    });
    viewport.addEventListener('focusin', () => {
      focused = true;
      stopAutoplay();
    });
    viewport.addEventListener('focusout', () => {
      focused = false;
      startAutoplay();
    });
    viewport.addEventListener('touchstart', () => {
      touching = true;
      stopAutoplay();
    }, { passive: true });
    viewport.addEventListener('touchend', () => {
      touching = false;
      startAutoplay();
    }, { passive: true });

    reduceMotion.addEventListener?.('change', () => {
      reduceMotion.matches ? stopAutoplay() : startAutoplay();
    });

    sync();
    startAutoplay();
  });
}
