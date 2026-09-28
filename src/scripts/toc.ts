/** Highlights the table-of-contents entry for the section being read. */
export function initToc(): void {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-toc-link]'));
  const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-toc-section]'));
  if (!links.length || !sections.length || !('IntersectionObserver' in window)) return;

  const setCurrent = (id: string) => {
    links.forEach((link) => {
      if (link.hash === `#${id}`) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  };

  const visible = new Set<string>();
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.add(entry.target.id);
        else visible.delete(entry.target.id);
      });
      const first = sections.find((section) => visible.has(section.id));
      if (first) setCurrent(first.id);
    },
    { rootMargin: '-20% 0px -60% 0px' },
  );

  sections.forEach((section) => observer.observe(section));
}
