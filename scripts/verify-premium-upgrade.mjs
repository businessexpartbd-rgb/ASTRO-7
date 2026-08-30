import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const checks = [];
const expect = (label, condition) => checks.push({ label, ok: Boolean(condition) });

const layout = read('src/layouts/Layout.astro');
const brand = read('src/styles/brand-system.css');
const home = read('src/pages/index.astro');
const meta = read('src/components/MetaTargeting.astro');
const pricing = read('src/components/EngagementModels.astro');
const brief = read('src/components/ProjectBrief.astro');
const popup = read('src/components/PromoPopup.astro');
const support = read('src/components/SiteChrome.astro');
const worker = read('worker.js');
const headers = read('public/_headers');

expect('External Google Fonts removed', !/fonts\.(googleapis|gstatic)\.com/.test(layout));
expect('System-local font stack is configured', /Segoe UI Variable/.test(brand) && /Noto Sans Bengali/.test(brand));
expect('Premium black brand token exists', /--brand-black:\s*#0b0f19/.test(brand));
expect('SEO-focused IT-company H1 exists', /AI Video Marketing, SEO &amp;/.test(home) && /Complete IT Solutions/.test(home));
expect('Astro Picture outputs AVIF and WebP', /<Picture/.test(meta) && /formats=\{\['avif',\s*'webp'\]\}/.test(meta));
expect('Six-video stack component stays in place once', (home.match(/<FeaturedVideoStack\s*\/>/g) || []).length === 1);
expect('Three honest engagement models exist', /Focused Sprint/.test(pricing) && /Project Partnership/.test(pricing) && /Ongoing Support/.test(pricing) && /Custom scope/.test(pricing));
expect('Secure project brief posts to contact API', /fetch\('\/api\/contact'/.test(brief) && /brief-company/.test(brief));
expect('Popup is delayed and session-scoped', /18000/.test(popup) && /sessionStorage/.test(popup) && /Escape/.test(popup));
expect('Chatbot focus is trapped and Escape closes', /focusable/.test(support) && /e\.key==='Escape'/.test(support));
expect('Contact leads use D1 storage and rate limits', /CREATE TABLE IF NOT EXISTS leads/.test(worker) && /idx_leads_visitor_created/.test(worker) && /Please wait before sending another/.test(worker));
expect('Contact API validates same-origin and honeypot', /Sec-Fetch-Site/.test(worker) && /input\.company/.test(worker));
expect('CSP, HSTS, frame and permission headers exist', /Content-Security-Policy/.test(worker) && /Strict-Transport-Security/.test(worker) && /X-Frame-Options/.test(worker) && /Permissions-Policy/.test(worker));
expect('Static fallback headers mirror Worker security', /Content-Security-Policy/.test(headers) && /Strict-Transport-Security/.test(headers));
expect('No duplicate v2 homepage route introduced', !fs.existsSync(path.join(root, 'src/pages/v2.astro')) && !fs.existsSync(path.join(root, 'src/pages/v2')));

for (const check of checks) console.log(`${check.ok ? 'PASS' : 'FAIL'}  ${check.label}`);
const failed = checks.filter((check) => !check.ok);
if (failed.length) {
  console.error(`\n${failed.length} premium upgrade check(s) failed.`);
  process.exit(1);
}
console.log(`\n${checks.length} premium upgrade checks passed.`);
