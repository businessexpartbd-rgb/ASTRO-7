/** Serve Astro static build from Workers Assets */
export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request);
  },
};
