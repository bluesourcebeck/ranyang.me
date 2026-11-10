import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const fail = (message) => { console.error(`FAIL: ${message}`); process.exit(1); };
if (!existsSync('dist/index.html')) fail('dist/index.html is missing; build first');
const html = readFileSync('dist/index.html', 'utf8');
const decode = (value) => value.replace(/&#(x[0-9a-f]+|[0-9]+);/gi, (_, code) =>
  String.fromCodePoint(code[0].toLowerCase() === 'x' ? parseInt(code.slice(1), 16) : Number(code)))
  .replace(/&(?:mdash|ndash);/g, (entity) => entity === '&mdash;' ? '\u2014' : '\u2013')
  .replace(/&apos;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
const text = decode(html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ');
if (/[\u3400-\u9fff]/.test(html)) { console.error('FAIL: Chinese characters in the page'); process.exit(1); }
for (const required of ['mainly work on Paso', 'What I think about', 'What would it take for an industry and the river beside it to both do well?', 'New essays and the first Open Discussion date arrive by email.', 'REVISED', 'What is the right product at the right time?', 'Open Discussion', 'practiced', 'first 2 stores', 'chain grew to 6.', '200 to 300', '78,000', 'Tap Go, first store, Shanghai', "A'GAIN, candle in spent coffee grounds"]) {
  if (!text.includes(required)) fail(`Missing required text: ${required}`);
}
for (const forbidden of ['Get the first date', 'The longer aim is ecological', 'I care about']) {
  if (text.includes(forbidden)) fail(`Forbidden text: ${forbidden}`);
}
if (/[-\u2010-\u2015\u2212]/u.test(text)) fail('Rendered page text contains dash punctuation');
if (/\bAI\b/u.test(text)) fail('Rendered page text contains AI as a whole word');
if (text.includes('!')) fail('Rendered page text contains an exclamation mark');
if (/\p{Extended_Pictographic}/u.test(text)) fail('Rendered page text contains emoji');
for (const match of html.matchAll(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)) {
  const href = decode(match[1] ?? match[2] ?? match[3]).trim();
  if (!href || href === '#') fail('An href is empty or #');
}
if (!existsSync('public/CNAME') || !existsSync('dist/CNAME')) fail('CNAME is missing');
if (/<script\b/i.test(html)) fail('dist/index.html contains a script tag');
for (const match of html.matchAll(/\b(?:src|srcset)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)) {
  if (/(?:https?:)?\/\//i.test(decode(match[1] ?? match[2] ?? match[3]))) fail('An image or resource source is external');
}
const walk = (directory) => readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(join(directory, entry.name)) : [join(directory, entry.name)]);
const styles = walk('dist').filter(path => path.endsWith('.css')).map(path => ({ path, css: readFileSync(path, 'utf8') }));
for (const match of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) styles.push({ path: 'dist/index.html inline style', css: match[1] });
if (!styles.length) fail('No built CSS found');
for (const { path, css } of styles) {
  if (/https?:|@import\b|url\(\s*['"]?\/\//i.test(css)) fail(`External URL or import in ${path}`);
  for (const match of css.matchAll(/font-weight\s*:\s*([^;}]+)/gi)) {
    const weights = match[1].trim().split(/\s+/);
    if (!weights.every(weight => ['400', '500', 'normal'].includes(weight))) fail(`Disallowed font-weight: ${match[1].trim()} in ${path}`);
  }
  for (const match of css.matchAll(/(?:^|[;{])\s*font\s*:\s*([^;}]+)/gi)) {
    const prefix = match[1].split(/\b\d+(?:\.\d+)?(?:px|rem|em|%)/)[0];
    if (/\b(?:bold|bolder|lighter|[1-9]00)\b/.test(prefix.replace(/\b(?:400|500)\b/g, ''))) fail(`Disallowed font shorthand weight in ${path}`);
  }
}
console.log('PASS: V5 required/absent copy, digits, captions, dash/emoji/AI/exclamation checks, hrefs, CNAME, no scripts, local sources/CSS, and font weights 400/500/normal');
