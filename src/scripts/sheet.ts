/**
 * Mobile product sheet: opens from the bottom bar, closes on backdrop tap,
 * Escape or link tap, and returns focus to the trigger.
 */
export function initProductSheet(): void {
  const sheet = document.getElementById('product-sheet');
  const backdrop = document.querySelector<HTMLElement>('[data-sheet-backdrop]');
  const trigger = document.querySelector<HTMLButtonElement>('[data-sheet-open]');
  if (!sheet || !backdrop || !trigger) return;

  const setOpen = (open: boolean) => {
    trigger.setAttribute('aria-expanded', String(open));
    sheet.dataset.open = String(open);
    backdrop.dataset.open = String(open);
    document.documentElement.style.overflow = open ? 'hidden' : '';
    if (open) {
      // wait for visibility to flip before moving focus into the sheet
      window.setTimeout(() => sheet.querySelector<HTMLElement>('a')?.focus({ preventScroll: true }), 60);
    } else {
      trigger.focus({ preventScroll: true });
    }
  };

  trigger.addEventListener('click', () => setOpen(sheet.dataset.open !== 'true'));
  backdrop.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && sheet.dataset.open === 'true') setOpen(false);
  });
  sheet.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setOpen(false)));
}
