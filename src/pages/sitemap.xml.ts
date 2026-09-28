import { locales } from '../i18n/index';
import { products } from '../data/site';

const pages = ['/', '/about', '/contact'];

export function GET({ site }: { site: URL }) {
  const entries: { path: string; locales: string[] }[] = [
    ...pages.map((path) => ({ path, locales: [...locales] })),
  ];
  for (const locale of locales) {
    for (const product of products(locale)) {
      const entry = entries.find((e) => e.path === `/products/${product.slug}`);
      if (!entry) entries.push({ path: `/products/${product.slug}`, locales: [...locales] });
    }
  }

  const urls = entries
    .map((entry) => {
      const alts = locales
        .map((l) => {
          const href = entry.path === '/' && l === 'fa' ? site.origin : `${site.origin}${l === 'fa' ? '' : `/${l}`}${entry.path}`;
          return `    <xhtml:link rel="alternate" hreflang="${l}" href="${href}"/>`;
        })
        .join('\n');
      const xdefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${site.origin}${entry.path === '/' ? '' : entry.path}"/>`;
      return `  <url>\n    <loc>${site.origin}${entry.path === '/' ? '' : entry.path}</loc>\n${alts}\n${xdefault}\n  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
