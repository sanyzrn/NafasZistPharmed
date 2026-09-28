/** Per-locale JSON content loader with Persian fallback for missing files. */
import type { Locale } from '../i18n/index';

export type { Locale } from '../i18n/index';
export { locales, defaultLocale, localeMeta, isLocale, localeFromPath, withLocale, digits } from '../i18n/index';

export type Dict = import('../i18n/index').Dict;

/** Pre-compiled module maps: one static glob per locale, resolved at build. */
const loaders: Record<Locale, Record<string, unknown>> = {
  fa: import.meta.glob<{ default: unknown }>('../content/fa/*.json', { eager: true }),
  ar: import.meta.glob<{ default: unknown }>('../content/ar/*.json', { eager: true }),
  en: import.meta.glob<{ default: unknown }>('../content/en/*.json', { eager: true }),
  ru: import.meta.glob<{ default: unknown }>('../content/ru/*.json', { eager: true }),
};

/** Locale content; a locale lacking a file falls back to the Persian source of truth.
 * Vite keys each glob relative to the pattern's own base ("./fa/x.json"). */
export function content<T>(locale: Locale, name: string): T {
  const entry = loaders[locale]?.[`./${locale}/${name}.json`] as { default: T } | undefined;
  if (entry) return entry.default;
  const fallback = loaders.fa[`./fa/${name}.json`] as { default: T } | undefined;
  if (!fallback) throw new Error(`Missing content: ${name}.json (and no fa fallback)`);
  return fallback.default;
}

/** Product type shared by every locale's content file. */
export interface Product {
  slug: string;
  name: string;
  latinName?: string;
  genericLatin?: string;
  genericLocal?: string;
  subtitle: string;
  category: string;
  categoryKey: 'respiratory' | 'women' | 'gi' | 'devices';
  image: string;
  summary: string;
  meta: { label: string; value: string }[];
  sections: { title: string; body?: string; items?: string[] }[];
  catalogs?: { key: string; href: string }[];
}
