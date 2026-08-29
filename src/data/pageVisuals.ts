export type PageVisual = {
  profile: string;
  kind: 'home' | 'hub' | 'service' | 'proof' | 'company' | 'contact' | 'editorial';
  accent: string;
  accent2: string;
  wash: string;
  ink: string;
};

const visual = (profile: string, kind: PageVisual['kind'], accent: string, accent2: string, wash: string, ink = '#0A2540'): PageVisual => ({
  profile,
  kind,
  accent,
  accent2,
  wash,
  ink,
});

const ROUTE_VISUALS: Record<string, PageVisual> = {
  '/': visual('home', 'home', '#C44B0B', '#175CD3', '#FFF5EC'),
  '/services': visual('services', 'hub', '#175CD3', '#C44B0B', '#F2F7FF'),
  '/services/ai-video-marketing': visual('ai-video', 'service', '#2563EB', '#7C3AED', '#F3F5FF'),
  '/services/video-editing': visual('video-editing', 'service', '#7C3AED', '#DB2777', '#FAF4FF'),
  '/services/human-like-content': visual('human-content', 'service', '#E4572E', '#0EA5E9', '#FFF5F1'),
  '/services/web-development': visual('web-development', 'service', '#0284C7', '#0A2540', '#EFF9FF'),
  '/services/application-build': visual('application-build', 'service', '#2563EB', '#4F46E5', '#F1F5FF'),
  '/services/authentication': visual('authentication', 'service', '#059669', '#0A2540', '#EFFAF6'),
  '/services/automation': visual('automation', 'service', '#0F766E', '#0891B2', '#EEFBFA'),
  '/services/digital-marketing': visual('digital-marketing', 'service', '#C44B0B', '#175CD3', '#FFF6EC'),
  '/services/seo': visual('seo', 'service', '#15803D', '#2563EB', '#F1FAF4'),
  '/services/facebook-page': visual('facebook', 'service', '#1877F2', '#06B6D4', '#EFF7FF'),
  '/services/boosting': visual('boosting', 'service', '#D97706', '#EA580C', '#FFF8EB'),
  '/services/campaign': visual('campaign', 'service', '#2563EB', '#F97316', '#F3F7FF'),
  '/portfolio': visual('portfolio', 'proof', '#7C3AED', '#C44B0B', '#F8F4FF'),
  '/about': visual('about', 'company', '#0A2540', '#C44B0B', '#F4F7FA'),
  '/contact': visual('contact', 'contact', '#137849', '#175CD3', '#F1FAF6'),
  '/blog': visual('blog', 'editorial', '#C44B0B', '#0A2540', '#FFF7F0'),
};

export const getPageVisual = (pathname: string): PageVisual => {
  const normalized = pathname.replace(/\/$/, '') || '/';
  if (ROUTE_VISUALS[normalized]) return ROUTE_VISUALS[normalized];
  if (normalized.startsWith('/blog/')) return visual('article', 'editorial', '#C44B0B', '#175CD3', '#FFF8F2');
  return visual('general', 'hub', '#175CD3', '#C44B0B', '#F4F8FC');
};
