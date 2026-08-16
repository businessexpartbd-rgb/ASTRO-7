export default {
  async fetch(request, env) {
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return new Response("Assets binding missing", { status: 500 });
  },
};
