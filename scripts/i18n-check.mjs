/**
 * Fails when:
 * - a locale dictionary is missing a key present in fa (the reference), or
 *   carries keys fa does not have, or
 * - a locale lacks any of the required content files, or
 * - a products file has entries with missing/extra slugs vs fa, or
 * - dist/ (when present) is missing expected per-locale HTML pages.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const LOCALES = ['fa', 'ar', 'en', 'ru'];
const CONTENT_FILES = ['site', 'about', 'contact', '404', 'news', 'products'];

let failed = false;
const problems = [];

// 1. dictionaries
const dictsDir = 'src/i18n/dicts';
const faKeys = Object.keys(JSON.parse(readFileSync(join(dictsDir, 'fa.json'), 'utf8')));
for (const locale of LOCALES) {
  const file = join(dictsDir, `${locale}.json`);
  if (!existsSync(file)) {
    problems.push(`dicts: ${locale}.json missing`);
    failed = true;
    continue;
  }
  const keys = Object.keys(JSON.parse(readFileSync(file, 'utf8')));
  const missing = faKeys.filter((k) => !keys.includes(k));
  const extra = keys.filter((k) => !faKeys.includes(k));
  if (missing.length) {
    problems.push(`dicts ${locale}: missing ${missing.length} key(s): ${missing.slice(0, 8).join(', ')}${missing.length > 8 ? '…' : ''}`);
    failed = true;
  }
  if (extra.length) {
    problems.push(`dicts ${locale}: ${extra.length} unknown key(s): ${extra.slice(0, 8).join(', ')}`);
    failed = true;
  }
}

// 2. content files per locale
for (const locale of LOCALES) {
  const dir = `src/content/${locale}`;
  if (!existsSync(dir)) {
    problems.push(`content: ${dir} missing`);
    failed = true;
    continue;
  }
  for (const name of CONTENT_FILES) {
    if (!existsSync(join(dir, `${name}.json`))) {
      problems.push(`content ${locale}: ${name}.json missing`);
      failed = true;
    }
  }
  // 3. product parity
  const faProducts = JSON.parse(readFileSync('src/content/fa/products.json', 'utf8'));
  const locProducts = JSON.parse(readFileSync(join(dir, 'products.json'), 'utf8'));
  const faSlugs = faProducts.map((p) => p.slug).join(',');
  const locSlugs = locProducts.map((p) => p.slug).join(',');
  if (faSlugs !== locSlugs) {
    problems.push(`content ${locale}: product slugs differ from fa (${locSlugs} vs ${faSlugs})`);
    failed = true;
  }
}

// 4. built pages (when dist exists)
if (existsSync('dist')) {
  const expect = [
    'dist/index.html',
    'dist/about/index.html',
    'dist/contact/index.html',
    'dist/404.html',
    'dist/products/tio-toriva/index.html',
  ];
  for (const locale of ['ar', 'en', 'ru']) {
    expect.push(`dist/${locale}/index.html`, `dist/${locale}/about/index.html`, `dist/${locale}/contact/index.html`, `dist/${locale}/404/index.html`, `dist/${locale}/products/tio-toriva/index.html`);
  }
  for (const file of expect) {
    if (!existsSync(file)) {
      problems.push(`dist: ${file} missing`);
      failed = true;
    }
  }
}

if (problems.length) {
  console.error('i18n:check failed:\n' + problems.map((p) => ' - ' + p).join('\n'));
  process.exit(1);
}
console.log(`i18n:check OK — ${LOCALES.length} locales, dicts + content + slugs consistent${existsSync('dist') ? ', built pages verified' : ''}`);
