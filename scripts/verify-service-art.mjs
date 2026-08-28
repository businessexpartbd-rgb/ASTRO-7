// Static build/contract tests; not browser-computed layout or visual QA.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import vm from 'node:vm';
import { transformSync } from 'esbuild';
import postcss from 'postcss';
import sharp from 'sharp';

const read = path => fs.readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const component = read('src/components/ServiceCardArt.astro');
const css = postcss.parse(component.match(/<style>([\s\S]*?)<\/style>/)[1]);
const rules = css.nodes.filter(n => n.type === 'rule');
const values = rule => Object.fromEntries(rule.nodes.filter(n => n.type === 'decl').map(n => [n.prop, n.value]));
const frame = values(rules.find(n => n.selector === '.service-card-art'));
assert.equal(frame.width, '112px'); assert.equal(frame.height, '112px');
assert.equal(frame.animation, 'service-art-float 5.2s cubic-bezier(.45,0,.55,1) infinite');
const mobile = css.nodes.find(n => n.type === 'atrule' && n.params === '(max-width:639px)');
assert.equal(values(mobile.nodes[0]).width, '94px'); assert.equal(values(mobile.nodes[0]).height, '94px');
const image = values(rules.find(n => n.selector === '.service-card-art img'));
assert.equal(image['object-fit'], 'contain'); assert.equal(image.transform, 'rotate(-1.5deg)');
assert.equal(values(rules.find(n => n.selector.includes(':hover'))).transform, 'scale(1.08) rotate(1.5deg)');
const float = css.nodes.find(n => n.type === 'atrule' && n.name === 'keyframes' && n.params === 'service-art-float');
assert.equal(values(float.nodes.find(n => n.selector === '50%')).transform, 'translate3d(0,-6px,0)');
assert.equal(values(rules.find(n => n.selector === '.service-card-art:before')).animation, 'service-art-glow 3.8s ease-in-out infinite');
assert(css.nodes.some(n => n.type === 'atrule' && n.params === '(prefers-reduced-motion:reduce)'));
assert(!component.includes('<script'), 'No runtime JS added for card artwork');
assert(!component.includes('size?:'), 'No per-artwork size overrides');
const module = { exports: {} };
vm.runInNewContext(transformSync(read('src/data/serviceArtwork.ts'), { loader: 'ts', format: 'cjs' }).code, { module, exports: module.exports });
const sources = Object.values(module.exports.serviceArtwork);
assert.equal(sources.length, 12, 'All twelve homepage cards must use shared artwork');
const serviceSlugs = {
  video: 'video-editing', ai: 'ai-video-marketing', human: 'human-like-content',
  web: 'web-development', app: 'application-build', auth: 'authentication',
  automation: 'automation', marketing: 'digital-marketing', seo: 'seo',
  facebook: 'facebook-page', boosting: 'boosting', campaign: 'campaign',
};
assert.deepEqual(Object.keys(module.exports.serviceArtwork).sort(), Object.keys(serviceSlugs).sort());
let outlineBytes = 0;
for (const [key, src] of Object.entries(module.exports.serviceArtwork)) {
  if (key === 'video' || key === 'web') continue;
  const buffer = fs.readFileSync(new URL('../public' + src, import.meta.url));
  outlineBytes += buffer.length;
  const svg = buffer.toString('utf8');
  assert(svg.includes('viewBox="0 0 28 28"'), key + ': consistent icon canvas');
  assert(!/<(?:image|script|foreignObject|animate)\b/.test(svg), key + ': native vector, no embedded bitmap or private motion');
  const { data, info } = await sharp(buffer).resize(112, 112).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const alpha = (x, y) => data[(y * info.width + x) * info.channels + info.channels - 1];
  for (const [x, y] of [[0, 0], [111, 0], [0, 111], [111, 111]]) assert.equal(alpha(x, y), 0, key + ': transparent corners');
  let clear = 0;
  for (let i = info.channels - 1; i < data.length; i += info.channels) if (data[i] === 0) clear++;
  assert(clear > 112 * 112 * .5, key + ': no painted background panel');
  assert(clear < 112 * 112 * .95, key + ': visible icon geometry');
}
assert(outlineBytes < 20000, 'Ten SVGs must stay below 20 KB combined');
// Render the actual vector pixels: a painted white/checkerboard canvas must fail.
const webPath = new URL('../public' + module.exports.serviceArtwork.web, import.meta.url);
const { data: webPixels, info: webInfo } = await sharp(fs.readFileSync(webPath)).resize(112, 112).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const alphaAt = (x, y) => webPixels[(y * webInfo.width + x) * webInfo.channels + webInfo.channels - 1];
for (const [x, y] of [[0, 0], [111, 0], [0, 111], [111, 111], [55, 52]]) assert.equal(alphaAt(x, y), 0, 'Web icon background must be transparent');
let clearPixels = 0;
for (let i = webInfo.channels - 1; i < webPixels.length; i += webInfo.channels) if (webPixels[i] === 0) clearPixels++;
assert(clearPixels > 112 * 112 * .6, 'No filled background panel');
assert(clearPixels < 112 * 112 * .95, 'Icon strokes must remain visible');
const html = read('dist/index.html');
const art = [...html.matchAll(/<span\b[^>]*data-service-card-art[^>]*>([\s\S]*?)<\/span>/g)].map(m => m[1]);
assert.equal(art.length, sources.length, 'Every registered artwork renders once');
for (const src of sources) {
  const matches = art.filter(markup => markup.includes(`src="${src}"`));
  assert.equal(matches.length, 1, src);
  for (const attribute of ['width="320"', 'height="320"', 'loading="lazy"', 'decoding="async"', 'alt=""']) assert(matches[0].includes(attribute), src + ': ' + attribute);
  assert(fs.existsSync(new URL('../public' + src, import.meta.url)));
}
const cards = [...html.matchAll(/<a\b([^>]*class="[^"]*\bservice-card\b[^"]*"[^>]*)>([\s\S]*?)<\/a>/g)];
for (const [key, slug] of Object.entries(serviceSlugs)) {
  const src = module.exports.serviceArtwork[key];
  const card = cards.find(m => m[1].includes(`href="/services/${slug}"`));
  assert(card && card[2].includes(`src="${src}"`), 'Correct service card: ' + slug);
}
const oldVideo = fs.readFileSync(new URL('../public/media/service-icons/video-editing-ai.svg', import.meta.url));
assert.equal(crypto.createHash('sha1').update('blob ' + oldVideo.length + '\0').update(oldVideo).digest('hex'), '7033c0282a1b57cb2382cc50a9eabe12393ffffd', 'Existing Video Editing artwork unchanged');
const oldWeb = fs.readFileSync(webPath);
assert.equal(crypto.createHash('sha1').update('blob ' + oldWeb.length + '\0').update(oldWeb).digest('hex'), 'a1a77c53c050c956942c2e18bb696bd32ecd8860', 'Existing Web Development artwork unchanged');
console.log(`PASS: 10 new transparent native SVGs, ${outlineBytes} bytes combined; all twelve card mappings checked.`);
console.log(`PASS: ${sources.length} artworks share 112px/94px frames, original float/glow/hover, reduced motion, lazy loading and correct service links. Original Video Editing asset unchanged.`);
