/** Brand & content from creavix-next-live (site-data.ts) */

export const SITE = {
  name: 'Creavix',
  brand: 'Creavix iT Solution',
  tagline: 'AI Video Marketing Agency',
  shortDesc:
    "Bangladesh's premier AI-powered video marketing studio. Cinematic ads for Meta, YouTube and TikTok, storytelling films and bilingual brand campaigns.",
  url: 'https://www.creavixit.com',
  hotline: '+880 9611-132835',
  whatsapp: '+8801890484355',
  whatsappLink: 'https://wa.me/8801890484355',
  email1: 'info@creavixit.com',
  email2: 'creavixbd@gmail.com',
  address: 'Hemayetpur, Savar, Dhaka, 1340, Bangladesh',
  addressBn: 'হেমায়েতপুর, সাভার, ঢাকা, ১৩৪০',
  servingSince: 2014,
  founder: {
    name: 'Hannan Khan',
    role: 'Founder & Creative Director',
  },
} as const;

export const SOCIAL_LINKS = [
  { key: 'facebook', name: 'Facebook', url: 'https://www.facebook.com/CreavixITSolution' },
  { key: 'instagram', name: 'Instagram', url: 'https://www.instagram.com/creavixitsolution' },
  { key: 'youtube', name: 'YouTube', url: 'https://www.youtube.com/@CreavixiTsolution' },
  { key: 'tiktok', name: 'TikTok', url: 'https://www.tiktok.com/@creavixitsolution' },
  { key: 'linkedin', name: 'LinkedIn', url: 'https://www.linkedin.com/in/creavix-it-solution' },
  { key: 'x', name: 'X', url: 'https://x.com/creavixit' },
  { key: 'whatsapp', name: 'WhatsApp', url: 'https://wa.me/8801890484355' },
] as const;

export const SHOWCASES = [
  {
    id: 'cinematic',
    title: 'Cinematic Storytelling',
    titleBn: 'সিনেম্যাটিক স্টোরিটেলিং',
    sub: 'Story-driven brand films that move audiences and build emotional trust.',
    ids: ['Tu9qAT9c2Ek', 'rlY4Ih68DHM', 'FvWyFDNAAPY', '6RaKnCSXZhM', '4ryJaLx6o0k', 'UlNoCAs69vg'],
  },
  {
    id: 'product-ai',
    title: 'Product AI Promotional Ads',
    titleBn: 'এআই প্রোডাক্ট প্রমোশনাল অ্যাড',
    sub: 'AI-powered product promos engineered for conversion across paid social.',
    ids: ['rQk_sPwkDwU', '3U3-3IgbPQc', 'zaFsO8fv2iA', 'KU7j0JhzJKI', 'tooCPxc0pnY', 'DO-SisqDTY4'],
  },
  {
    id: 'financial',
    title: 'Financial Video Ads',
    titleBn: 'ফাইন্যান্সিয়াল ভিডিও অ্যাড',
    sub: 'Trust-first ads for banks, MFS, insurance and fintech brands.',
    ids: ['Q67-Nq-fPe0', '0baTxFVpSyo', '7knZkqenPII', 'dM6YLCGOOX4', '6n2y_nrRahM', 'QdPW3bDFc5I'],
  },
  {
    id: 'brand',
    title: 'Product & Brand Ads',
    titleBn: 'প্রোডাক্ট ও ব্র্যান্ড অ্যাড',
    sub: 'High-impact creatives for product launches and brand campaigns.',
    ids: ['xwGjL_XnzDU', 'boFvTomIRrQ', 'xxXjRLIL7Xc', '6EKnfroWXQE', 'h0cnhVfsXhU', 'MtgdKWMRAPI'],
  },
  {
    id: 'custom',
    title: 'Custom Projects',
    titleBn: 'কাস্টম ভিডিও প্রজেক্ট',
    sub: 'Tailored campaigns for unique client requests, formats and industries.',
    ids: ['HOnXRgkC-2Q', 'DjXhq-ScyE8', '7iJumW6HROQ', 'eEqeRIsI9oQ', 'KxFQv4M-bow', 'Szel9WlwaS8'],
  },
] as const;

export const STATS = [
  { value: '10+', label: 'Years in business', sub: 'Since 2014' },
  { value: '4,300+', label: 'Projects', sub: 'Multi-industry' },
  { value: '4.8/5', label: 'Avg rating', sub: 'Verified clients' },
  { value: '24h', label: 'Delivery target', sub: 'Short videos' },
] as const;

export const ytThumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
