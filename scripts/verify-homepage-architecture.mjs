import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const home = readFileSync(join(root, 'src/pages/index.astro'), 'utf8');
const compass = readFileSync(join(root, 'src/components/ServiceCompass.astro'), 'utf8');
const catalog = readFileSync(join(root, 'src/data/services.ts'), 'utf8');
const seo = readFileSync(join(root, 'src/data/pageSeo.ts'), 'utf8');
const layout = readFileSync(join(root, 'src/layouts/Layout.astro'), 'utf8');
const rendered = readFileSync(join(root, 'dist/index.html'), 'utf8');

const failures = [];
const check = (condition, message) => condition ? console.log(`PASS: ${message}`) : failures.push(message);

check(home.includes('AI Video Marketing, SEO &amp;<br /><span class="brand-accent">Complete IT Solutions</span>'), 'H1 states the primary offer and full IT scope');
check(home.includes('Bangladesh-based technology and video marketing company') && home.includes('grow worldwide'), 'hero identifies company type and global market');
check(['Video &amp; AI', 'Web &amp; Apps', 'SEO &amp; Growth'].every((label) => home.includes(label)), 'hero exposes three core capabilities');
check(home.includes('href="/services"') && home.includes('href="/portfolio"') && home.includes('href={SITE.whatsappLink}'), 'hero offers service, proof and contact paths');

const sectionOrder = ['<BrandStrip />', '<ServiceCompass />', '<MarketingSpotlight />', '<FeaturedVideoStack />', 'id="services"', '<ProcessFlow />', 'id="about"', '<Reviews />', '<FAQ />', '<EngagementModels />', '<ProjectBrief />'];
let previous = -1;
for (const marker of sectionOrder) {
  const current = home.indexOf(marker);
  check(current > previous, `homepage order includes ${marker}`);
  previous = current;
}
check((home.match(/<FeaturedVideoStack \/>/g) || []).length === 1, 'existing video stack remains a single unchanged component');

const slugs = [...catalog.matchAll(/slug: '([^']+)'/g)].map((match) => match[1]);
check(slugs.length === 12 && new Set(slugs).size === 12, 'service catalog contains twelve unique routes');
check(compass.includes("key: 'Creative'") && compass.includes("key: 'Technology'") && compass.includes("key: 'Growth'"), 'service compass groups work into three clear disciplines');
check(compass.includes('SERVICE_CATALOG.filter') && compass.includes('href={`/services/${service.slug}`}'), 'service compass creates crawlable links from the canonical catalog');
check(compass.includes('min-height:43px'), 'service links provide a mobile-friendly touch target');
check(compass.includes('class="compass-stage reveal"') && compass.includes('12 specialized services'), 'service cards sit inside a premium unified white stage');
check(compass.includes("count: '03 services'") && compass.includes("count: '04 services'") && compass.includes("count: '05 services'"), 'each discipline displays an accurate service count');
check(compass.includes('box-shadow:0 32px 80px') && compass.includes('inset 0 1px 0 #fff'), 'white surfaces use layered elevation and highlight');
check(compass.includes('@media(prefers-reduced-motion:reduce)'), 'service compass respects reduced-motion preferences');

check(seo.includes("IT Company in Bangladesh | AI Video, Web, App & SEO | Creavix"), 'homepage SEO title targets company and core service intent');
check(layout.includes('Mobile and Web Application Development') && layout.includes('Meta and YouTube Campaigns'), 'organization schema describes the complete service scope');
check(home.includes("'@type': 'ItemList'") && home.includes('numberOfItems: services.length'), 'homepage publishes a twelve-service ItemList schema');

const renderedServiceLinks = new Set([...rendered.matchAll(/href="\/services\/([^\"#?]+)"/g)].map((match) => match[1]));
check(slugs.every((slug) => renderedServiceLinks.has(slug)), 'production homepage links to every service page');
check((rendered.match(/<h1\b/g) || []).length === 1, 'production homepage has exactly one H1');
check(rendered.includes('id="what-we-do"') && rendered.includes('id="featured-videos"'), 'production homepage exposes service and video anchors');
check(rendered.includes('id="contact"') && rendered.includes('id="project-brief"'), 'production homepage exposes secure contact anchors');

if (failures.length) {
  for (const failure of failures) console.error(`FAIL: ${failure}`);
  process.exit(1);
}
console.log('Homepage architecture verification complete.');
