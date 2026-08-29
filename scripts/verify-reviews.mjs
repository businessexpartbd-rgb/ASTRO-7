import fs from 'node:fs';

const component = fs.readFileSync('src/components/Reviews.astro', 'utf8');
const worker = fs.readFileSync('worker.js', 'utf8');
const homepage = fs.readFileSync('dist/index.html', 'utf8');
const checks = [
  ['five accessible rating choices', (component.match(/class="star-btn"/g) || []).length === 5 && component.includes('role="radiogroup"')],
  ['gold official star color', component.toLowerCase().includes('#fbbc04')],
  ['three featured cards then all-review dialog', component.includes('reviews.slice(0,3)') && component.includes('aria-modal="true"')],
  ['keyboard arrows, Escape and dialog focus loop', component.includes("'ArrowDown'") && component.includes("e.key==='Escape'") && component.includes("e.key==='Tab'")],
  ['mobile 44px targets and responsive single-column layout', component.includes('min-width:44px') && component.includes('@media(max-width:700px)')],
  ['reduced motion safety', component.includes('prefers-reduced-motion:reduce')],
  ['Cloudflare Turnstile production-only interaction challenge', component.includes('challenges.cloudflare.com/turnstile') && component.includes("key.startsWith('1x000000')") && component.includes("appearance:'interaction-only'")],
  ['D1 binding remains configured', worker.includes('env.DB') && worker.includes('env.ASSETS')],
  ['only approved reviews are public', worker.includes("WHERE status = 'approved'")],
  ['new reviews enter moderation', worker.includes("'pending'") && worker.includes("status: 'pending'")],
  ['one-to-five server validation', worker.includes('stars < 1 || stars > 5')],
  ['service allowlist validation', worker.includes('REVIEW_SERVICES.has(service)')],
  ['privacy hash, honeypot, duplicate and hourly limits', worker.includes('SHA-256') && worker.includes('input.company') && worker.includes('duplicate') && worker.includes("'-1 hour'")],
  ['homepage contains premium review experience', homepage.includes('Trusted work.') && homepage.includes('Protected submissions') && homepage.includes('reviews-dashboard')],
];

let failed = false;
for (const [label, pass] of checks) {
  console.log(`${pass ? 'PASS' : 'FAIL'}: ${label}`);
  if (!pass) failed = true;
}
if (failed) process.exit(1);
console.log('Reviews verification complete.');
