// Bundles index.html, styles.css and js/*.js into one self-contained HTML file.
//   node scripts/build.mjs             -> dist/marginal-notes.html (full document)
//   node scripts/build.mjs --fragment  -> page body only, without doctype/html/head/body tags
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');
const fragment = process.argv.includes('--fragment');

let html = read('index.html')
  .replace('<link rel="stylesheet" href="styles.css">', () => `<style>\n${read('styles.css')}</style>`)
  .replace(/<script src="(js\/[^"]+)"><\/script>/g, (_, p) => `<script>\n${read(p)}</script>`);

if (fragment) {
  html = html
    .replace(/<!doctype html>\s*/i, '')
    .replace(/<\/?html[^>]*>\s*/g, '')
    .replace(/<\/?head>\s*/g, '')
    .replace(/<\/?body>\s*/g, '')
    .replace(/<meta (charset|name="viewport")[^>]*>\s*/g, '');
}

const out = join(root, 'dist', fragment ? 'marginal-notes.fragment.html' : 'marginal-notes.html');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, html);
console.log('Wrote', out);
