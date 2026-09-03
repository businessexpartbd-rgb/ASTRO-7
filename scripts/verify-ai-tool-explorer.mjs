import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const component = readFileSync(join(root, 'src/components/AIToolExplorer.astro'), 'utf8');
const home = readFileSync(join(root, 'src/pages/index.astro'), 'utf8');
const rendered = readFileSync(join(root, 'dist/index.html'), 'utf8');
const failures = [];
const check = (condition, message) => condition ? console.log(`PASS: ${message}`) : failures.push(message);

const names = ['Kling AI', 'Hunyuan', 'ElevenLabs', 'Gemini', 'ChatGPT', 'Claude', 'Higgsfield', 'Grok', 'HeyGen', 'Luma AI'];
check(home.includes("import AIToolExplorer") && home.includes('<AIToolExplorer />'), 'homepage uses the dedicated AI tool explorer');
check(names.every((name) => component.includes(`name: '${name}'`)), 'all ten AI platforms have a guide');
check((rendered.match(/data-ai-open=/g) || []).length === 10, 'production homepage renders ten interactive tool buttons');
check(rendered.includes('role="dialog"') && rendered.includes('aria-modal="true"'), 'tool guide uses an accessible modal dialog');
check(component.includes("event.key === 'Escape'") && component.includes("event.key !== 'Tab'"), 'Escape close and keyboard focus loop are implemented');
check(component.includes('previousFocus.focus') && component.includes("document.body.style.overflow = 'hidden'"), 'focus restoration and background scroll lock are implemented');
check(component.includes('@media(min-width:640px)') && component.includes('align-items:flex-end'), 'mobile bottom sheet and desktop centered modal layouts are present');
check(component.includes('@media(prefers-reduced-motion:reduce)'), 'modal respects reduced-motion preferences');
check((component.match(/href: 'https:\/\//g) || []).length === 10, 'each guide includes a secure official platform link');
check(component.includes('loading="lazy"') && component.includes('fetchpriority="low"'), 'tool imagery keeps the site performance policy');
check(component.includes('Core capabilities') && component.includes('Best for') && component.includes('Creavix workflow'), 'each guide explains capability, fit and Creavix use');

if (failures.length) {
  failures.forEach((failure) => console.error(`FAIL: ${failure}`));
  process.exit(1);
}
console.log('AI tool explorer verification complete.');
