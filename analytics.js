/* Anonymous first-party page views. No IP address or email is sent to the server. */
(() => {
  'use strict';
  const path = location.pathname;
  const isArticle = /^\/blog\/posts\/[a-z0-9][a-z0-9-]{0,90}\.html$/.test(path);
  const canonicalPath = path === '/index.html' ? '/' :
    (path === '/blog' || path === '/blog/index.html' ? '/blog/' : path);
  if (canonicalPath !== '/' && canonicalPath !== '/blog/' && !isArticle) return;

  let sent = false;
  function track() {
    if (sent || document.visibilityState !== 'visible') return;
    sent = true;
    fetch('/api/pageview', {
      method: 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: canonicalPath })
    }).catch(() => {
      // Tracking must never interrupt reading the site.
    });
  }
  if (document.visibilityState === 'visible') track();
  else document.addEventListener('visibilitychange', track);
})();
