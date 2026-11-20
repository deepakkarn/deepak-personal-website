// Minimal server-side entrypoint. Blog pages and other existing files remain static.
// Only /api/* routes enter this Worker before Cloudflare checks static assets.
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/health" && request.method === "GET") {
      return json({ ok: true, service: "deepakkarn-blog", databaseBound: Boolean(env.BLOG_DB) });
    }
    if (url.pathname.startsWith("/api/")) {
      return json({ error: "API endpoint is not enabled yet" }, 404);
    }
    return env.ASSETS.fetch(request);
  }
};
