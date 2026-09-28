/**
 * Products menu in the desktop header: click / Enter / Space toggles,
 * Escape and outside clicks close it, focus returns to the trigger.
 */
export function initProductMenu(): void {
  document.querySelectorAll<HTMLElement>('[data-menu]').forEach((item) => {
    const trigger = item.querySelector<HTMLButtonElement>('button[aria-controls]');
    const panel = item.querySelector<HTMLElement>('.menu');
    if (!trigger || !panel) return;

    const setOpen = (open: boolean) => {
      trigger.setAttribute('aria-expanded', String(open));
      panel.dataset.open = String(open);
    };

    trigger.addEventListener('click', () => {
      setOpen(trigger.getAttribute('aria-expanded') !== 'true');
    });

    item.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && trigger.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        trigger.focus();
      }
    });

    item.addEventListener('focusout', (event) => {
      const next = event.relatedTarget as Node | null;
      if (next && !item.contains(next)) setOpen(false);
    });

    document.addEventListener('click', (event) => {
      if (!item.contains(event.target as Node)) setOpen(false);
    });
  });
}
