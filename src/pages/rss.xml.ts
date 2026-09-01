import { news } from '../data/news';

export function GET({ site }: { site: URL }) {
  const origin = site ?? new URL('http://localhost:4321');
  const items = news.map(item => `<item><title><![CDATA[${item.title}]]></title><link>${new URL(`/news/${item.slug}/`, origin)}</link><guid>${new URL(`/news/${item.slug}/`, origin)}</guid><pubDate>${new Date(item.publishedAt).toUTCString()}</pubDate><description><![CDATA[${item.excerpt}]]></description></item>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>দৈনিক নিউজ</title><link>${origin}</link><description>বাংলাদেশের জাতীয়, জেলা ও গ্রামবাংলার সংবাদ</description><language>bn-BD</language>${items}</channel></rss>`, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
