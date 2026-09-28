/** Locale system: locale list, direction, localized paths, digits, dictionaries. */

export const locales = ['fa', 'ar', 'en', 'ru'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'fa';

export const localeMeta: Record<Locale, { dir: 'rtl' | 'ltr'; name: string; og: string }> = {
  fa: { dir: 'rtl', name: 'فارسی', og: 'fa_IR' },
  ar: { dir: 'rtl', name: 'العربية', og: 'ar_AR' },
  en: { dir: 'ltr', name: 'English', og: 'en_US' },
  ru: { dir: 'ltr', name: 'Русский', og: 'ru_RU' },
};

export const isLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

/** Parses the first path segment into a locale; fa pages live without prefix. */
export function localeFromPath(pathname: string): Locale {
  const first = pathname.split('/')[1];
  return isLocale(first ?? '') ? (first as Locale) : defaultLocale;
}

/** '/about' + 'ar' -> '/ar/about'; fa keeps unprefixed URLs. */
export function withLocale(path: string, locale: Locale): string {
  const bare = path.replace(/\/+$/, '') || '/';
  return locale === defaultLocale ? bare : `/${locale}${bare === '/' ? '' : bare}`;
}

/**
 * One place for every digit decision: Persian digits in fa, Western (0–9)
 * everywhere else. Change the policy here only.
 */
export function digits(input: string | number, locale: Locale): string {
  const s = String(input);
  if (locale === 'fa') {
    return s.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
  }
  return s;
}

import { makeT as makeTTyped, loadDict as loadDictTyped, dicts as allDicts, type Dict as DictT, type DictKey as DictKeyT } from './keys';

export type Dict = DictT;
export type DictKey = DictKeyT;

/** Dotted-key dictionaries; every locale must carry the full key set. */
export const dicts = allDicts;

export const loadDict = loadDictTyped;
export const makeT = makeTTyped;
