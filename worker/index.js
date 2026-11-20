// Cloudflare Worker for the static website and blog engagement API.
// Only /api/* reaches this script before static asset routing.
const POST_RE = /^\/blog\/posts\/[a-z0-9][a-z0-9-]{0,90}\.html$/;
const MAX_BODY_LENGTH = 8000;

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...extraHeaders
    }
  });
}
function validPost(post) { return typeof post === 'string' && POST_RE.test(post); }
function browserId(request) {
  const match = (request.headers.get('Cookie') || '').match(/(?:^|;\s*)dk_blog_reader=([0-9a-f-]{36})(?:;|$)/i);
  return match ? match[1].toLowerCase() : null;
}
function allowMutation(request) {
  const origin = request.headers.get('Origin');
  return origin && origin === new URL(request.url).origin &&
    (request.headers.get('Content-Type') || '').toLowerCase().startsWith('application/json');
}
async function bodyJson(request) {
  const len = Number(request.headers.get('Content-Length') || 0);
  if (len > MAX_BODY_LENGTH) return null;
  const raw = await request.text();
  if (raw.length > MAX_BODY_LENGTH) return null;
  try { const body = JSON.parse(raw); return body && typeof body === 'object' && !Array.isArray(body) ? body : null; }
  catch { return null; }
}
async function likeSnapshot(db, post, reader) {
  const row = await db.prepare('SELECT COUNT(*) AS total, COALESCE(MAX(visitor_id = ?), 0) AS liked FROM blog_likes WHERE post_slug = ?')
    .bind(reader || '', post).first();
  return { likes: Number(row?.total || 0), liked: Boolean(row?.liked) };
}
async function publicEngagement(request, env, url) {
  const post = url.searchParams.get('post');
  if (!validPost(post)) return json({ error: 'Invalid article' }, 400);
  const [likes, comments] = await Promise.all([
    likeSnapshot(env.BLOG_DB, post, browserId(request)),
    env.BLOG_DB.prepare("SELECT id, author_name, message, created_at FROM blog_comments WHERE post_slug = ? AND status = 'approved' ORDER BY id DESC LIMIT 50")
      .bind(post).all()
  ]);
  return json({ ...likes, comments: comments.results || [], commentsEnabled: Boolean(env.TURNSTILE_SECRET_KEY) });
}
async function changeLike(request, env) {
  if (!allowMutation(request)) return json({ error: 'Request origin not allowed' }, 403);
  const input = await bodyJson(request);
  if (!input || !validPost(input.post) || !['like','unlike'].includes(input.action)) return json({ error: 'Invalid request' }, 400);
  let id = browserId(request);
  let cookie = {};
  if (input.action === 'like') {
    if (!id) {
      id = crypto.randomUUID();
      cookie = { 'Set-Cookie': `dk_blog_reader=${id}; Path=/; Max-Age=31536000; Secure; HttpOnly; SameSite=Lax` };
    }
    await env.BLOG_DB.prepare('INSERT OR IGNORE INTO blog_likes (post_slug, visitor_id) VALUES (?, ?)')
      .bind(input.post, id).run();
  } else if (id) {
    await env.BLOG_DB.prepare('DELETE FROM blog_likes WHERE post_slug = ? AND visitor_id = ?')
      .bind(input.post, id).run();
  }
  const result = await likeSnapshot(env.BLOG_DB, input.post, id);
  return json(result, 200, cookie);
}
async function verifyTurnstile(env, token, request) {
  if (!env.TURNSTILE_SECRET_KEY) return { ready: false, success: false };
  try {
    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token }),
      signal: AbortSignal.timeout(8000)
    });
    if (!result.ok) return { ready: true, success: false };
    const data = await result.json();
    return { ready: true, success: data.success === true && data.hostname === new URL(request.url).hostname };
  } catch { return { ready: true, success: false }; }
}
async function addComment(request, env) {
  if (!allowMutation(request)) return json({ error: 'Request origin not allowed' }, 403);
  if (!env.TURNSTILE_SECRET_KEY) return json({ error: 'Comment service is being configured' }, 503);
  const data = await bodyJson(request);
  if (!data) return json({ error: 'Invalid request body' }, 400);
  const post = data.post;
  const name = typeof data.name === 'string' ? data.name.trim().replace(/\s+/g,' ') : '';
  const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
  const comment = typeof data.comment === 'string' ? data.comment.trim() : '';
  const token = typeof data.turnstileToken === 'string' ? data.turnstileToken.trim() : '';
  if (!validPost(post) || name.length < 2 || name.length > 80 ||
      email.length > 254 || !/^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/.test(email) ||
      comment.length < 3 || comment.length > 3000 || !token) {
    return json({ error: 'Name, valid email, comment and verification are required' }, 400);
  }
  // A very simple per-address throttle, additional to Turnstile verification.
  const recent = await env.BLOG_DB.prepare("SELECT COUNT(*) AS total FROM blog_comments WHERE author_email = ? AND created_at >= datetime('now', '-2 minutes')")
    .bind(email).first();
  if (Number(recent?.total || 0) >= 2) return json({ error: 'Please wait before commenting again' }, 429);
  const verified = await verifyTurnstile(env, token, request);
  if (!verified.success) return json({ error: 'Verification failed. Please try again.' }, verified.ready ? 400 : 503);
  await env.BLOG_DB.prepare("INSERT INTO blog_comments (post_slug, author_name, author_email, message, status) VALUES (?, ?, ?, ?, 'pending')")
    .bind(post, name, email, comment).run();
  return json({ ok: true, message: 'Your comment has been received and awaits approval.' }, 202);
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/health' && request.method === 'GET') {
      return json({ ok: true, service: 'deepakkarn-blog', databaseBound: Boolean(env.BLOG_DB) });
    }
    if (url.pathname.startsWith('/api/')) {
      if (!env.BLOG_DB) return json({ error: 'Database unavailable' }, 503);
      try {
        if (url.pathname === '/api/engagement' && request.method === 'GET') return await publicEngagement(request, env, url);
        if (url.pathname === '/api/likes' && request.method === 'POST') return await changeLike(request, env);
        if (url.pathname === '/api/comments' && request.method === 'POST') return await addComment(request, env);
        return json({ error: 'Not found' }, 404);
      } catch (error) {
        console.error('Blog engagement request failed', error);
        return json({ error: 'Blog interaction is temporarily unavailable' }, 503);
      }
    }
    return env.ASSETS.fetch(request);
  }
};
