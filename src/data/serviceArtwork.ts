// Homepage artwork registry. Preserve supplied art; change only the asset path.
// All entries use ServiceCardArt: 112px desktop / 94px mobile and the original
// Video Editing float, glow and hover. Do not add per-service size/motion options.
// Artwork canvases must be transparent; no white/colored background panels.
export const serviceArtwork: Readonly<Record<string, string>> = {
  video: '/media/service-icons/video-editing-ai.svg',
  web: '/media/service-icons/web-development-code.svg',
  ai: '/media/service-icons/ai-video-marketing-outline.svg',
  human: '/media/service-icons/human-like-content-outline.svg',
  app: '/media/service-icons/application-build-outline.svg',
  auth: '/media/service-icons/authentication-outline.svg',
  automation: '/media/service-icons/automation-outline.svg',
  marketing: '/media/service-icons/digital-marketing-outline.svg',
  seo: '/media/service-icons/seo-outline.svg',
  facebook: '/media/service-icons/facebook-page-outline.svg',
  boosting: '/media/service-icons/boosting-outline.svg',
  campaign: '/media/service-icons/campaign-outline.svg',
};
