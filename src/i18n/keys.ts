import type { Locale } from './index';
import fa from './dicts/fa.json';
import ar from './dicts/ar.json';
import en from './dicts/en.json';
import ru from './dicts/ru.json';

export type Dict = typeof fa;
export type DictKey = keyof Dict;

export const dicts: Record<Locale, Dict> = {
  fa,
  ar: ar as Dict,
  en: en as Dict,
  ru: ru as Dict,
};

export function loadDict(locale: Locale): Dict {
  return dicts[locale];
}
export function makeT(locale: Locale): (key: DictKey) => string {
  const dict = loadDict(locale);
  return (key: DictKey) => dict[key];
}
