"""Dependency-free checks for the built Creavix site. Not a browser/Lighthouse test."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse, unquote
import json
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / 'dist'

class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids = []
        self.links = []
        self.assets = []
        self.images = []
        self.metas = {}
        self.title = ''
        self.h1 = 0
        self.main = 0
        self.in_title = False
        self.in_json = False
        self.json_text = ''
        self.schemas = []
        self.canonical = None

    def handle_starttag(self, tag, attributes):
        a = dict(attributes)
        if 'id' in a:
            self.ids.append(a['id'])
        if tag == 'h1': self.h1 += 1
        if tag == 'main': self.main += 1
        if tag == 'title': self.in_title = True
        if tag == 'a' and a.get('href'): self.links.append(a['href'])
        if tag == 'img': self.images.append(a)
        if tag in ('img', 'script') and a.get('src'): self.assets.append(a['src'])
        if tag == 'link' and a.get('rel') == 'stylesheet': self.assets.append(a['href'])
        if tag == 'link' and a.get('rel') == 'canonical': self.canonical = a['href']
        if tag == 'meta' and a.get('name'): self.metas[a['name']] = a.get('content', '')
        if tag == 'script' and a.get('type') == 'application/ld+json':
            self.in_json = True
            self.json_text = ''

    def handle_data(self, value):
        if self.in_title: self.title += value
        if self.in_json: self.json_text += value

    def handle_endtag(self, tag):
        if tag == 'title': self.in_title = False
        if tag == 'script' and self.in_json:
            self.schemas.append(json.loads(self.json_text))
            self.in_json = False

def check(condition, message):
    if not condition: errors.append(message)

def local_target(url, current):
    parsed = urlparse(url)
    if parsed.scheme or parsed.netloc: return None
    if not parsed.path: return current
    target = DIST / unquote(parsed.path).lstrip('/')
    return target if target.suffix else target / 'index.html'

errors = []
warnings = []
pages = {}
for file in sorted(DIST.rglob('index.html')):
    page = Page()
    page.feed(file.read_text())
    pages[file] = page
    name = str(file.relative_to(DIST))
    check(page.h1 == 1, f'{name}: expected one H1, got {page.h1}')
    check(page.main == 1, f'{name}: expected one main, got {page.main}')
    check(page.ids.count('main-content') == 1, f'{name}: main-content target missing')
    check(20 <= len(page.title) <= 68, f'{name}: title length {len(page.title)}')
    check(80 <= len(page.metas.get('description', '')) <= 165, f'{name}: description length')
    check(page.canonical and page.canonical.startswith('https://www.creavixit.com/'), f'{name}: canonical')
    check(len(page.schemas) >= 1, f'{name}: missing structured data')
    check(all('alt' in img for img in page.images), f'{name}: image without alt attribute')
    check('noindex' not in page.metas.get('robots', ''), f'{name}: noindex')
    for asset in page.assets:
        target = local_target(asset, file)
        if target: check(target.exists(), f'{name}: missing asset {asset}')
    duplicates = [key for key, count in Counter(page.ids).items() if count > 1]
    check(not duplicates, f'{name}: duplicate IDs {duplicates}')

for file, page in pages.items():
    name = str(file.relative_to(DIST))
    for href in page.links:
        target = local_target(href, file)
        if not target: continue
        check(target.exists(), f'{name}: missing link {href}')
        fragment = unquote(urlparse(href).fragment)
        if fragment and target in pages and fragment not in pages[target].ids:
            warnings.append(f'{name}: unresolved anchor {href}')

check(len(pages) == 24, f'Expected 24 pages, got {len(pages)}')
check(len(set(p.title for p in pages.values())) == len(pages), 'Duplicate page titles')
check(len(set(p.metas['description'] for p in pages.values())) == len(pages), 'Duplicate descriptions')
sitemap = ET.parse(DIST / 'sitemap.xml')
locations = [el.text for el in sitemap.findall('.//{*}loc')]
check(len(locations) == len(pages), 'Sitemap route count mismatch')
check('https://www.creavixit.com/services' in locations, 'Services hub missing from sitemap')
for file, page in pages.items():
    check(page.canonical.rstrip('/') in {loc.rstrip('/') for loc in locations}, f'{file.name}: canonical missing from sitemap')
    if '/services/' in str(file) and file.parent.name != 'services':
        check('related-services-title' in page.ids, f'{file.parent.name}: related services missing')

def luminance(colour):
    values = [int(colour[i:i+2], 16) / 255 for i in (1, 3, 5)]
    linear = [v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4 for v in values]
    return sum(a*b for a, b in zip(linear, (.2126, .7152, .0722)))

colours = {'orange': '#c44b0b', 'blue': '#175cd3', 'green': '#137849', 'navy': '#0a2540', 'body': '#536478'}
ratios = {name: round(1.05 / (luminance(value) + .05), 2) for name, value in colours.items()}
for name, ratio in ratios.items(): check(ratio >= 4.5, f'{name}: text contrast {ratio}')
print(json.dumps({'pages': len(pages), 'titles': 'unique', 'contrast_on_white': ratios, 'errors': sorted(set(errors)), 'anchor_warnings': sorted(set(warnings)), 'scope': 'Static build checks; not browser, accessibility certification or Lighthouse'}, indent=2))
sys.exit(1 if errors else 0)
