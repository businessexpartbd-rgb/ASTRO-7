import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const source = readFileSync(join(root, 'src/pages/index.astro'), 'utf8');
const html = readFileSync(join(root, 'dist/index.html'), 'utf8');
const block = source.match(/const aiTools = \[([\s\S]*?)\n\];/)?.[1] ?? '';
const tools = [...block.matchAll(/name: '([^']+)'[\s\S]*?icon: '([^']+)'[\s\S]*?href: '([^']+)'/g)]
  .map(([, name, icon, href]) => ({ name, icon, href }));

const fail = (message) => {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
};
const pass = (message) => console.log(`PASS: ${message}`);

if (tools.length === 10) pass('ten AI platform cards fill the two-column mobile grid');
else fail(`expected 10 AI platform cards, found ${tools.length}`);

if (new Set(tools.map((tool) => tool.name)).size === tools.length) pass('platform names are unique');
else fail('duplicate platform name found');

if (tools.every((tool) => /^https:\/\//.test(tool.href))) pass('all platform cards use secure official links');
else fail('a platform link is not HTTPS');

if (tools.every((tool) => /-official\.(?:svg|ico)$/.test(tool.icon))) pass('all cards use the transparent official asset set');
else fail('a legacy dark-canvas asset remains in the card data');

let totalBytes = 0;
for (const tool of tools) {
  const path = join(root, 'public', tool.icon.slice(1));
  if (!existsSync(path)) {
    fail(`missing logo asset: ${tool.icon}`);
    continue;
  }
  totalBytes += statSync(path).size;
  const bytes = readFileSync(path);
  if (tool.icon.endsWith('.svg')) {
    const svg = bytes.toString('utf8');
    if (!/<svg\b/.test(svg) || !/viewBox=/.test(svg) || /<image\b/.test(svg)) fail(`invalid vector logo: ${tool.icon}`);
  } else if (bytes.subarray(0, 4).toString('hex') !== '00000100') {
    fail(`invalid ICO logo: ${tool.icon}`);
  }
}
if (totalBytes <= 55_000) pass(`logo payload is lightweight (${totalBytes} bytes)`);
else fail(`logo payload is too large (${totalBytes} bytes)`);

const sourceChecks = [
  ['section has a stable anchor', 'id="ai-production-stack"'],
  ['mobile uses two equal columns', 'grid-template-columns:repeat(2,minmax(0,1fr))'],
  ['wide layouts use five equal columns', '@media(min-width:640px){.ai-tools-grid{grid-template-columns:repeat(5,minmax(0,1fr))'],
  ['cards have a usable mobile touch area', 'min-height:152px'],
  ['focus state is visible', '.ai-tool-card:focus-visible'],
  ['reduced motion is respected', '@media(prefers-reduced-motion:reduce)'],
];
for (const [label, token] of sourceChecks) source.includes(token) ? pass(label) : fail(label);

const renderedLogos = [...html.matchAll(/src="(\/ai-tools\/[^\"]+-official\.(?:svg|ico))"/g)];
if (renderedLogos.length === 10) pass('production HTML renders all ten official logos');
else fail(`production HTML rendered ${renderedLogos.length} official logos`);

if (!html.includes('/ai-tools/kling.webp') && !html.includes('/ai-tools/heygen.webp')) pass('legacy black-canvas logos are absent from rendered HTML');
else fail('legacy black-canvas logos remain in rendered HTML');

if (!process.exitCode) console.log('AI tool grid verification complete.');
