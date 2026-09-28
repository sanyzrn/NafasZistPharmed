import { content, type Locale, type Product } from '../content/index';

export interface SiteContent {
  name: string;
  nameEn: string;
  tagline: string;
  claim: string;
  phone: string;
  phoneHref: string;
  email: string;
  emailHref: string;
  instagram: string;
  linkedin: string;
  bale: string;
  patientPortal: string;
  jobs: string;
  mapHq: string;
  mapFactory: string;
  hq: string;
  factory: string;
  instagramLabel: string;
  linkedinLabel: string;
  baleLabel: string;
  formEndpoint: string;
}

/** Locale site metadata; identical structure for every locale. */
export const site = (locale: Locale): SiteContent => content<SiteContent>(locale, 'site');

export type { Locale, Product };
export const products = (locale: Locale) => content<Product[]>(locale, 'products');

export type CategoryKey = Product['categoryKey'];

/** Category groups in fixed display order; empty groups are dropped. */
export const productCategories = (locale: Locale) => {
  const list = products(locale);
  const keys: CategoryKey[] = ['respiratory', 'women', 'gi', 'devices'];
  return keys
    .map((key) => ({ key, items: list.filter((p) => p.categoryKey === key) }))
    .filter((group) => group.items.length > 0);
};

/** Primary navigation. Labels are dictionary keys; hrefs are locale-prefixed by the caller. */
export const nav = (_locale: Locale) => [
  { href: '/', key: 'home' as const, short: 'homeShort' as const },
  { href: '/#products', key: 'products' as const, short: 'products' as const, hasMenu: true },
  { href: '/about', key: 'about' as const, short: 'about' as const },
  { href: '/contact', key: 'contact' as const, short: 'contact' as const },
];

export interface NewsItem {
  title: string;
  image: string;
  href: string;
  date: string;
}
export const news = (locale: Locale) => content<NewsItem[]>(locale, 'news');
