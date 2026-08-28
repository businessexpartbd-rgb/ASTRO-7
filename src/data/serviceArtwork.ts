// Homepage artwork registry. Preserve supplied art; change only the asset path.
// All entries use ServiceCardArt: 112px desktop / 94px mobile and the original
// Video Editing float, glow and hover. Do not add per-service size/motion options.
// Artwork canvases must be transparent; no white/colored background panels.
export const serviceArtwork: Readonly<Record<string, string>> = {
  video: '/media/service-icons/video-editing-ai.svg',
  web: '/media/service-icons/web-development-code.svg',
};
