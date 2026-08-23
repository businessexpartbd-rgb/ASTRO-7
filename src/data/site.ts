/** Brand & content — video-first IT & digital agency */

export const SITE = {
  name: 'Creavix',
  brand: 'Creavix iT Solution',
  tagline: 'Video Editing Agency in Bangladesh',
  shortDesc:
    'Cinematic Human-like AI Videos, Professional Video Editing & Full Digital Solutions | 24-48 Hours Delivery',
  seoTitle:
    'Video Editing Agency in Bangladesh | Creavix iT Solution — AI Video, Editing & Digital Solutions',
  seoDescription:
    'Creavix iT Solution is a full digital partner: professional video editing, human-like AI video marketing, web development, application build, authentication, automation, SEO, Facebook page, boosting and campaigns. Video editing agency in Bangladesh — 24–48 hours delivery.',
  seoKeywords:
    'video editing agency Bangladesh, AI video Bangladesh, human-like AI video, professional video editing Dhaka, Creavix iT, video marketing agency, 24 hour video delivery, web development, digital marketing Savar, Facebook boosting Bangladesh',
  url: 'https://www.creavixit.com',
  hotline: '+880 9611-132835',
  whatsapp: '+8801890484355',
  whatsappLink: 'https://wa.me/8801890484355',
  email1: 'info@creavixit.com',
  email2: 'creavixbd@gmail.com',
  address: 'Hemayetpur, Savar, Dhaka, 1340, Bangladesh',
  addressBn: 'Hemayetpur, Savar, Dhaka 1340',
  servingSince: 2014,
  founder: {
    name: 'Hannan Khan',
    role: 'Founder & Creative Director',
  },
} as const;

export const SOCIAL_LINKS = [
  { key: 'facebook', name: 'Facebook', url: 'https://www.facebook.com/CreavixITSolution', color: '#1877F2' },
  { key: 'instagram', name: 'Instagram', url: 'https://www.instagram.com/creavixitsolution', color: '#E4405F' },
  { key: 'youtube', name: 'YouTube', url: 'https://www.youtube.com/@CreavixiTsolution', color: '#FF0000' },
  { key: 'tiktok', name: 'TikTok', url: 'https://www.tiktok.com/@creavixitsolution', color: '#010101' },
  { key: 'linkedin', name: 'LinkedIn', url: 'https://www.linkedin.com/in/creavix-it-solution', color: '#0A66C2' },
  { key: 'x', name: 'X', url: 'https://x.com/creavixit', color: '#000000' },
  { key: 'whatsapp', name: 'WhatsApp', url: 'https://wa.me/8801890484355', color: '#25D366' },
] as const;

export const SHOWCASES = [
  {
    id: 'cinematic',
    title: 'Cinematic Storytelling',
    titleBn: 'Cinematic Storytelling',
    sub: 'Story-driven brand films that move audiences and build emotional trust.',
    format: 'landscape' as const,
    ids: ['Tu9qAT9c2Ek', 'rlY4Ih68DHM', 'FvWyFDNAAPY', '6RaKnCSXZhM', '4ryJaLx6o0k', 'UlNoCAs69vg'],
  },
  {
    id: 'product-ai',
    title: 'Product AI Promotional Ads',
    titleBn: 'AI Product Promotional Ad',
    sub: 'AI-powered product promos engineered for conversion across paid social.',
    format: 'short' as const,
    ids: ['rQk_sPwkDwU', '3U3-3IgbPQc', 'zaFsO8fv2iA', 'KU7j0JhzJKI', 'tooCPxc0pnY', 'DO-SisqDTY4'],
  },
  {
    id: 'financial',
    title: 'Financial Video Ads',
    titleBn: 'Financial Video Ad',
    sub: 'Trust-first ads for banks, MFS, insurance and fintech brands.',
    format: 'short' as const,
    ids: ['Q67-Nq-fPe0', '0baTxFVpSyo', '7knZkqenPII', 'dM6YLCGOOX4', '6n2y_nrRahM', 'QdPW3bDFc5I'],
  },
  {
    id: 'brand',
    title: 'Product & Brand Ads',
    titleBn: 'Product and Brand Ad',
    sub: 'High-impact creatives for product launches and brand campaigns.',
    format: 'short' as const,
    ids: ['xwGjL_XnzDU', 'boFvTomIRrQ', 'xxXjRLIL7Xc', '6EKnfroWXQE', 'h0cnhVfsXhU', 'MtgdKWMRAPI'],
  },
  {
    id: 'custom',
    title: 'Custom Projects',
    titleBn: 'Custom Video Project',
    sub: 'Tailored campaigns for unique client requests, formats and industries.',
    format: 'landscape' as const,
    ids: ['HOnXRgkC-2Q', 'DjXhq-ScyE8', '7iJumW6HROQ', 'eEqeRIsI9oQ', 'KxFQv4M-bow', 'Szel9WlwaS8'],
  },
] as const;

export const STATS = [
  { value: '10+', label: 'Years in business', sub: 'Since 2014' },
  { value: '4,300+', label: 'Projects', sub: 'Multi-industry' },
  { value: '4.8/5', label: 'Avg rating', sub: 'Verified clients' },
  { value: '24-48h', label: 'Delivery', sub: 'Fast turnaround' },
] as const;

/** YouTube thumb — mqdefault is lighter (~shorter bytes) for grids; hq for hero */
export const ytThumb = (id: string, quality: 'mq' | 'hq' | 'sd' = 'mq') =>
  `https://i.ytimg.com/vi/${id}/${quality === 'hq' ? 'hqdefault' : quality === 'sd' ? 'sddefault' : 'mqdefault'}.jpg`;
