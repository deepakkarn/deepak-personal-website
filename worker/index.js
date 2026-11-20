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
  const rows = comments.results || [];
  // A missing replies table during first-time setup must not break existing blog comments.
  if (rows.length) {
    try {
      const placeholders = rows.map(() => '?').join(',');
      const sql = 'SELECT id, comment_id, author_name, message, created_at, updated_at FROM blog_replies WHERE comment_id IN (' + placeholders + ') ORDER BY id ASC';
      const replyRows = await env.BLOG_DB.prepare(sql).bind(...rows.map(item => item.id)).all();
      const byComment = new Map();
      for (const reply of replyRows.results || []) {
        if (!byComment.has(reply.comment_id)) byComment.set(reply.comment_id, []);
        byComment.get(reply.comment_id).push(reply);
      }
      for (const item of rows) item.replies = byComment.get(item.id) || [];
    } catch (error) {
      if (!String(error?.message || error).includes('no such table: blog_replies')) throw error;
      for (const item of rows) item.replies = [];
    }
  }
  return json({ ...likes, comments: rows, commentsEnabled: Boolean(env.TURNSTILE_SECRET_KEY) });
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
  await env.BLOG_DB.prepare("INSERT INTO blog_comments (post_slug, author_name, author_email, message, status) VALUES (?, ?, ?, ?, 'approved')")
    .bind(post, name, email, comment).run();
  return json({ ok: true, message: 'Your comment is now published.' }, 201);
}

// Private editor portal. Credentials are configured only as Cloudflare Worker secrets.
const PORTAL_MAX_AGE = 8 * 60 * 60;
const LOGIN_WINDOW = 15 * 60;
const MAX_FAILURES = 5;
const ADMIN_NAME = 'Deepak Kumar Karn';

function portalConfigured(env) {
  return Boolean(env.PORTAL_USERNAME && env.PORTAL_PASSWORD);
}
function portalCookie(token, maxAge) {
  return 'dk_portal=' + (token || '') +
    '; Path=/api/portal; Secure; HttpOnly; SameSite=Strict; Max-Age=' + maxAge;
}
function readPortalToken(request) {
  return (request.headers.get('Cookie') || '').match(/(?:^|;\s*)dk_portal=([0-9a-f]{64})(?:;|$)/)?.[1] || '';
}
async function sha256(value) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, '0')).join('');
}
async function secretEquals(a, b) {
  const [x, y] = await Promise.all([sha256(a), sha256(b)]);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return diff === 0;
}
function newToken() {
  const buf = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(buf, byte => byte.toString(16).padStart(2, '0')).join('');
}
function parseId(value) {
  const id = Number(value);
  return /^\d+$/.test(String(value)) && Number.isSafeInteger(id) && id > 0 ? id : null;
}
async function sessionFromRequest(request, env) {
  const raw = readPortalToken(request);
  if (!raw) return null;
  const tokenHash = await sha256(raw);
  const entry = await env.BLOG_DB.prepare('SELECT expires_at FROM portal_sessions WHERE token_hash = ?')
    .bind(tokenHash).first();
  return entry && Number(entry.expires_at) > Math.floor(Date.now() / 1000) ? { tokenHash } : null;
}
async function portalLogin(request, env) {
  if (!allowMutation(request)) return json({ error: 'Invalid request origin' }, 403);
  if (!portalConfigured(env)) return json({ error: 'Portal credentials have not been configured in Cloudflare.' }, 503);
  const input = await bodyJson(request);
  if (!input || typeof input.username !== 'string' || typeof input.password !== 'string' ||
      input.username.length > 120 || input.password.length > 512) {
    return json({ error: 'Invalid credentials' }, 400);
  }
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const ipHash = await sha256(ip + ':' + env.PORTAL_PASSWORD);
  const now = Math.floor(Date.now() / 1000);
  const failed = await env.BLOG_DB.prepare('SELECT COUNT(*) AS total FROM portal_login_attempts WHERE ip_hash = ? AND created_at > ?')
    .bind(ipHash, now - LOGIN_WINDOW).first();
  if (Number(failed?.total || 0) >= MAX_FAILURES) {
    return json({ error: 'Too many attempts. Try again in 15 minutes.' }, 429);
  }
  const [usernameOk, passwordOk] = await Promise.all([
    secretEquals(input.username, env.PORTAL_USERNAME),
    secretEquals(input.password, env.PORTAL_PASSWORD)
  ]);
  if (!usernameOk || !passwordOk) {
    await env.BLOG_DB.prepare('INSERT INTO portal_login_attempts (ip_hash, created_at) VALUES (?, ?)')
      .bind(ipHash, now).run();
    return json({ error: 'Invalid username or password' }, 401);
  }
  await env.BLOG_DB.batch([
    env.BLOG_DB.prepare('DELETE FROM portal_login_attempts WHERE ip_hash = ?').bind(ipHash),
    env.BLOG_DB.prepare('DELETE FROM portal_sessions WHERE expires_at <= ?').bind(now)
  ]);
  const token = newToken();
  await env.BLOG_DB.prepare('INSERT INTO portal_sessions (token_hash, created_at, expires_at) VALUES (?, ?, ?)')
    .bind(await sha256(token), now, now + PORTAL_MAX_AGE).run();
  return json({ ok: true, loggedIn: true }, 200, { 'Set-Cookie': portalCookie(token, PORTAL_MAX_AGE) });
}
async function portalSession(request, env) {
  if (!portalConfigured(env)) return json({ loggedIn: false, configured: false });
  const session = await sessionFromRequest(request, env);
  return json({ loggedIn: Boolean(session), configured: true });
}
async function portalLogout(request, env) {
  if (!allowMutation(request)) return json({ error: 'Invalid request origin' }, 403);
  const token = readPortalToken(request);
  if (token) await env.BLOG_DB.prepare('DELETE FROM portal_sessions WHERE token_hash = ?')
    .bind(await sha256(token)).run();
  return json({ ok: true }, 200, { 'Set-Cookie': portalCookie('', 0) });
}
async function portalList(env) {
  const [comments, replies] = await Promise.all([
    env.BLOG_DB.prepare('SELECT id, post_slug, author_name, author_email, message, status, created_at FROM blog_comments ORDER BY id DESC LIMIT 200').all(),
    env.BLOG_DB.prepare('SELECT id, comment_id, post_slug, author_name, message, created_at, updated_at FROM blog_replies ORDER BY id ASC').all()
  ]);
  const byComment = new Map();
  for (const reply of replies.results || []) {
    if (!byComment.has(reply.comment_id)) byComment.set(reply.comment_id, []);
    byComment.get(reply.comment_id).push(reply);
  }
  return json({ comments: (comments.results || []).map(c => ({ ...c, replies: byComment.get(c.id) || [] })) });
}
async function portalAddReply(request, env) {
  const input = await bodyJson(request);
  const id = parseId(input?.commentId);
  const message = typeof input?.message === 'string' ? input.message.trim() : '';
  if (!id || message.length < 1 || message.length > 3000) return json({ error: 'Valid comment and reply are required (max 3000 characters).' }, 400);
  const parent = await env.BLOG_DB.prepare('SELECT id, post_slug, status FROM blog_comments WHERE id = ?')
    .bind(id).first();
  if (!parent) return json({ error: 'Comment not found' }, 404);
  if (parent.status !== 'approved') return json({ error: 'Publish the comment before replying.' }, 409);
  await env.BLOG_DB.prepare('INSERT INTO blog_replies (comment_id, post_slug, author_name, message) VALUES (?, ?, ?, ?)')
    .bind(id, parent.post_slug, ADMIN_NAME, message).run();
  return json({ ok: true }, 201);
}
async function portalEditReply(request, env, replyId) {
  const input = await bodyJson(request);
  const message = typeof input?.message === 'string' ? input.message.trim() : '';
  if (message.length < 1 || message.length > 3000) return json({ error: 'Reply must contain 1 to 3000 characters.' }, 400);
  const result = await env.BLOG_DB.prepare("UPDATE blog_replies SET message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(message, replyId).run();
  return json({ ok: true, updated: result.meta.changes > 0 }, result.meta.changes ? 200 : 404);
}
async function portalDeleteReply(env, replyId) {
  const result = await env.BLOG_DB.prepare('DELETE FROM blog_replies WHERE id = ?').bind(replyId).run();
  return json({ ok: true, deleted: result.meta.changes > 0 }, result.meta.changes ? 200 : 404);
}
async function portalDeleteComment(env, commentId) {
  const parent = await env.BLOG_DB.prepare('SELECT id FROM blog_comments WHERE id = ?').bind(commentId).first();
  if (!parent) return json({ error: 'Comment not found' }, 404);
  await env.BLOG_DB.batch([
    env.BLOG_DB.prepare('DELETE FROM blog_replies WHERE comment_id = ?').bind(commentId),
    env.BLOG_DB.prepare('DELETE FROM blog_comments WHERE id = ?').bind(commentId)
  ]);
  return json({ ok: true });
}
async function portalChangeStatus(request, env, commentId) {
  const input = await bodyJson(request);
  if (!input || !['approved', 'rejected'].includes(input.status)) return json({ error: 'Invalid status' }, 400);
  const result = await env.BLOG_DB.prepare('UPDATE blog_comments SET status = ? WHERE id = ?')
    .bind(input.status, commentId).run();
  return json({ ok: true }, result.meta.changes ? 200 : 404);
}
async function portalApi(request, env, url) {
  if (url.pathname === '/api/portal/login' && request.method === 'POST') return portalLogin(request, env);
  if (url.pathname === '/api/portal/session' && request.method === 'GET') return portalSession(request, env);
  if (url.pathname === '/api/portal/logout' && request.method === 'POST') return portalLogout(request, env);
  if (!portalConfigured(env)) return json({ error: 'Portal credentials not configured' }, 503);
  const session = await sessionFromRequest(request, env);
  if (!session) return json({ error: 'Please sign in to the portal.' }, 401);
  if (url.pathname === '/api/portal/comments' && request.method === 'GET') return portalList(env);
  if (!['POST', 'PATCH', 'DELETE'].includes(request.method) || !allowMutation(request)) {
    return json({ error: 'Invalid request' }, 403);
  }
  if (url.pathname === '/api/portal/replies' && request.method === 'POST') return portalAddReply(request, env);
  const replyMatch = url.pathname.match(/^\/api\/portal\/replies\/(\d+)$/);
  if (replyMatch) {
    const id = parseId(replyMatch[1]);
    if (!id) return json({ error: 'Invalid reply id' }, 400);
    if (request.method === 'PATCH') return portalEditReply(request, env, id);
    if (request.method === 'DELETE') return portalDeleteReply(env, id);
  }
  const commentMatch = url.pathname.match(/^\/api\/portal\/comments\/(\d+)$/);
  if (commentMatch) {
    const id = parseId(commentMatch[1]);
    if (!id) return json({ error: 'Invalid comment id' }, 400);
    if (request.method === 'DELETE') return portalDeleteComment(env, id);
    if (request.method === 'PATCH') return portalChangeStatus(request, env, id);
  }
  return json({ error: 'Not found' }, 404);
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
        if (url.pathname.startsWith('/api/portal/')) return await portalApi(request, env, url);
        if (url.pathname === '/api/engagement' && request.method === 'GET') return await publicEngagement(request, env, url);
        if (url.pathname === '/api/likes' && request.method === 'POST') return await changeLike(request, env);
        if (url.pathname === '/api/comments' && request.method === 'POST') return await addComment(request, env);
        return json({ error: 'Not found' }, 404);
      } catch (error) {
        console.error('Blog engagement request failed', error);
        return json({ error: 'Blog interaction is temporarily unavailable' }, 503);
      }
    }
    if (url.pathname === '/portal') {
      return new Response(null, { status: 302, headers: { 'Location': '/portal/', 'Cache-Control': 'no-store' } });
    }
    return env.ASSETS.fetch(request);
  }
};
