/** Blog posts for SEO — Creavix iT */

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  readMin: number;
  tags: string[];
  body: string[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'ai-video-marketing-bangladesh-2026',
    title: 'AI Video Marketing in Bangladesh: What Actually Works in 2026',
    description:
      'How human-like AI video ads help Bangladesh businesses get messages and sales on Facebook, Instagram and YouTube — without empty hype.',
    date: '2026-08-18',
    category: 'AI & Video',
    readMin: 6,
    tags: ['AI video', 'Bangladesh', 'Meta ads', 'YouTube'],
    body: [
      'AI video is no longer a novelty. For Bangladesh sellers and service brands, the real question is simple: does the creative earn attention and inbox messages?',
      'At Creavix iT Solution we combine AI-assisted generation with professional editing so ads feel human — clear offers, readable text on mobile, and hooks in the first seconds.',
      'Use AI video when you need volume tests: multiple hooks, product angles and sizes for feed, story and landscape. Keep claims honest so Meta and Google delivery stays healthy.',
      'Pair creatives with a clean Facebook Page, fast Messenger replies (or automation) and a realistic budget. AI does not replace strategy — it speeds production.',
      'If you are starting out, brief us with product photos, offer and target area. We return platform-ready files aligned with local buying behaviour and international brand standards.',
    ],
  },
  {
    slug: 'facebook-boosting-vs-campaign',
    title: 'Facebook Boosting vs Full Campaign: Which Should You Choose?',
    description:
      'Clear difference between boosting a post and running a structured Meta campaign — budgets, goals and when each fits Bangladesh businesses.',
    date: '2026-08-12',
    category: 'Growth',
    readMin: 5,
    tags: ['Boosting', 'Campaign', 'Facebook', 'ROI'],
    body: [
      'Boosting is the fast path: take a post or Reel that already works and push it to a defined audience. It is ideal for offers, page heat and small tests from about $5.',
      'A full campaign is a system — objective, audiences, placements, creative tests, retargeting and weekly optimization. It fits sustained leads, messages and sales.',
      'Many brands waste money by only boosting “likes”. Tie spend to messages, calls or purchases. Track cost per result in plain language.',
      'Creavix publishes a transparent service dollar rate on the Boosting page so BDT estimates include tax and payment costs — not only the open-market USD number.',
      'Not sure which path? Send your Page link and goal on WhatsApp. We recommend boost, campaign, or a mix with YouTube when video reach matters.',
    ],
  },
  {
    slug: 'seo-for-local-business-bangladesh',
    title: 'SEO for Local Businesses in Bangladesh: A Practical Starter Guide',
    description:
      'How local SEO, Google Business signals and on-page basics help Dhaka and nationwide brands get found — alongside Facebook growth.',
    date: '2026-08-05',
    category: 'SEO',
    readMin: 7,
    tags: ['SEO', 'Local search', 'Google', 'Dhaka'],
    body: [
      'Facebook brings messages; Google brings intent. People searching “near me” or service + city names are often closer to buying.',
      'Start with a fast website, clear service pages, accurate NAP (name, address, phone) and useful Bangla/English content that answers real questions.',
      'Technical basics matter: mobile layout, HTTPS, sensible titles and descriptions, internal links between services such as video editing, web development and digital marketing.',
      'SEO compounds. Ads can fill the pipeline while rankings build. Creavix aligns SEO with your service pages and blog topics so content supports both humans and search engines.',
      'Avoid miracle ranking promises. Ask for a priority list: fixes this month, content next month, and how progress will be reported.',
    ],
  },
  {
    slug: 'creavix-services-overview',
    title: 'What Creavix iT Solution Offers: Video, AI, Web, Apps & Growth',
    description:
      'Full stack from Creavix — video editing, AI marketing, human-like content, web, apps, authentication, automation, SEO, Facebook page, boosting and campaigns.',
    date: '2026-07-28',
    category: 'Company',
    readMin: 5,
    tags: ['Services', 'Creavix', 'Agency'],
    body: [
      'Creavix iT Solution is a video-first digital and IT partner based in Hemayetpur, Savar, Dhaka — serving Bangladesh marketplaces and remote international clients since 2014.',
      'Creative production: professional video editing, AI video marketing and human-like product content built for Meta, YouTube and TikTok.',
      'Product engineering: web development, application build and authentication systems for secure login and roles.',
      'Growth layer: digital marketing, SEO, Facebook page setup and verification guidance, boosting, campaigns and Messenger automation.',
      'One team means fewer handoffs. Explore each service page for process, FAQ and WhatsApp contact — or start at the portfolio to see on-screen work.',
    ],
  },
  {
    slug: 'messenger-automation-human-replies',
    title: 'Messenger Automation That Still Feels Human',
    description:
      'How automation on Facebook Messenger and related channels answers FAQs, captures leads and hands off to humans without sounding robotic.',
    date: '2026-07-20',
    category: 'Automation',
    readMin: 5,
    tags: ['Automation', 'Messenger', 'Leads'],
    body: [
      'In Bangladesh, many purchases start in the inbox. If replies are slow, competitors win the chat.',
      'Automation should cover the repetitive layer: hours, pricing ranges, location, catalogue links — then pass hot leads to a person.',
      'Creavix designs flows that match your tone, with clear escapes to human chat. Pair automation with a healthy Facebook Page and honest ads.',
      'Measure success by conversations that turn into calls or orders — not by how many bot messages were sent.',
      'See the Automation service page for channels, benefits and FAQ, then message us with your Page link to map a flow.',
    ],
  },
  {
    slug: 'why-human-like-content-beats-stock',
    title: 'Why Human-like Content Beats Generic Stock Ads',
    description:
      'Viewers trust faces, hands and real product use. How Creavix builds authentic creatives for local and global brands.',
    date: '2026-07-10',
    category: 'Creative',
    readMin: 4,
    tags: ['Content', 'UGC', 'Trust'],
    body: [
      'Stock footage looks polished and forgettable. Human-like content feels closer to a recommendation from someone who used the product.',
      'We structure demos, spokesperson-style clips and lifestyle inserts so the offer stays clear on a small phone screen.',
      'Language can be Bangla, English or mixed — matched to audience. Captions help sound-off viewing on public transport and in offices.',
      'These assets plug directly into boosting and campaigns. Better creative lowers cost per result more often than budget alone.',
      'Share product samples or phone footage; we handle pacing, titles and export sizes.',
    ],
  },
];

export function getPost(slug: string) {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
