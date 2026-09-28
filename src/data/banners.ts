/**
 * Home banner slider content — the ONE file to edit to add or change banners.
 * Drop images into `public/banners/` and reference them as `/banners/<file>`.
 *
 * How to add a banner (also in README):
 * 1. Add an image to public/banners/ — desktop ≈ 2400×1080 (20:9), mobile
 *    ≈ 1080×1350 (4:5). WebP or SVG recommended.
 * 2. Optionally add a dark-theme variant (imageDark / imageDarkMobile) with
 *    the same composition but colours tuned for a dark background.
 * 3. Add an entry below. `alt` is required; title/subtitle/cta are optional.
 *    cta.href must be an internal path (it is locale-prefixed automatically).
 * 4. `order` controls the sequence (ascending); `enabled: false` hides a
 *    banner without deleting it.
 */
import type { Locale } from '../i18n/index';

export interface Banner {
  /** Desktop image, e.g. /banners/tiotoriva.svg (required). */
  image: string;
  /** Optional mobile art direction variant (portrait crop). */
  imageMobile?: string;
  /** Optional dark-theme variant of the desktop image. */
  imageDark?: string;
  /** Optional dark-theme variant of the mobile image. */
  imageDarkMobile?: string;
  /** Image fallback used when nothing else matches (required). */
  fallback?: string;
  /** Required for accessibility: describe the image meaningfully. */
  alt: Record<Locale, string>;
  /** Optional overlay text, translated per locale. */
  title?: Record<Locale, string>;
  subtitle?: Record<Locale, string>;
  /** Optional call to action; href is internal and locale-prefixed. */
  cta?: { label: Record<Locale, string>; href: string };
  /** Sequence control, ascending. */
  order: number;
  /** Hidden without deleting. */
  enabled: boolean;
}

/**
 * PLACEHOLDER banners (clearly marked): breath-inspired SVG art, no product
 * claims. Replace each entry with real imagery when available.
 */
export const banners: Banner[] = [
  {
    image: '/banners/breath-1.svg',
    imageMobile: '/banners/breath-1-mobile.svg',
    imageDark: '/banners/breath-1-dark.svg',
    imageDarkMobile: '/banners/breath-1-dark-mobile.svg',
    fallback: '/banners/breath-1.svg',
    alt: {
      fa: 'نماد نفس: نيم‌دایره‌های هوا که از دهانه‌ دستگاه استنشاق برمی‌خیزند (تصویر جایگزین)',
      ar: 'رمز النَّفَس: أنصاف دوائر هوائية تنهض من فجّة الاستنشاق (صورة مؤقتة)',
      en: 'Breath motif: arcs of air rising from an inhaler mouthpiece (placeholder art)',
      ru: 'Мотив дыхания: дуги воздуха, поднимающиеся из мундштука ингалятора (заполнитель)',
    },
    title: {
      fa: 'مراقب شما، در هر نفس',
      ar: 'معك في كل نَفَس',
      en: 'With you, with every breath',
      ru: 'С вами на каждом дыхании',
    },
    subtitle: {
      fa: 'تصویر جایگزین؛ بنر واقعی محصول بعداً اینجا قرار می‌گیرد.',
      ar: 'صورة مؤقتة؛ سيُستبدل لاحقًا ببانر المنتج الحقيقي.',
      en: 'Placeholder slide; the real product banner will replace this.',
      ru: 'Заполнитель; позже здесь появится реальный баннер продукта.',
    },
    order: 1,
    enabled: true,
  },
  {
    image: '/banners/breath-2.svg',
    imageMobile: '/banners/breath-2-mobile.svg',
    imageDark: '/banners/breath-2-dark.svg',
    imageDarkMobile: '/banners/breath-2-dark-mobile.svg',
    fallback: '/banners/breath-2.svg',
    alt: {
      fa: 'نماد ذرات دارو در جریان هوای ملایم (تصویر جایگزین)',
      ar: 'رمز جزيئات الدواء في تيار هواء لطيف (صورة مؤقتة)',
      en: 'Motif of particles carried on a gentle air stream (placeholder art)',
      ru: 'Мотив частиц в мягком потоке воздуха (заполнитель)',
    },
    order: 2,
    enabled: true,
  },
  {
    image: '/banners/breath-3.svg',
    imageMobile: '/banners/breath-3-mobile.svg',
    imageDark: '/banners/breath-3-dark.svg',
    imageDarkMobile: '/banners/breath-3-dark-mobile.svg',
    fallback: '/banners/breath-3.svg',
    alt: {
      fa: 'نماد سپیده‌دم و هوای پاک (تصویر جایگزین)',
      ar: 'رمز الفجر والهواء النقي (صورة مؤقتة)',
      en: 'Motif of dawn and clean air (placeholder art)',
      ru: 'Мотив рассвета и чистого воздуха (заполнитель)',
    },
    order: 3,
    enabled: true,
  },
];
