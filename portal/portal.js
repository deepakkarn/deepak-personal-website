(() => {
  'use strict';
  const loginPanel = document.querySelector('#login-panel');
  const dashboard = document.querySelector('#dashboard');
  const loginForm = document.querySelector('#login-form');
  const loginMessage = document.querySelector('#login-message');
  const portalMessage = document.querySelector('#portal-message');
  const commentRows = document.querySelector('#comment-rows');
  const summary = document.querySelector('#summary');
  const trafficStatus = document.querySelector('#traffic-status');
  const trafficMetrics = document.querySelector('#traffic-metrics');
  const trafficArticles = document.querySelector('#traffic-articles');
  const commentTab = document.querySelector('#tab-comments');
  const analyticsTab = document.querySelector('#tab-analytics');
  const commentPanel = document.querySelector('#panel-comments');
  const analyticsPanel = document.querySelector('#panel-analytics');
  const analyticsRefresh = document.querySelector('#refresh-analytics-button');
  const tablist = document.querySelector('.portal-tabs');
  let trafficLoaded = false;
  const search = document.querySelector('#comment-search');
  const filter = document.querySelector('#comment-filter');
  const loginButton = document.querySelector('#login-button');
  const articleNames = {
    'rsp-naya-netritwa': 'RSP ले नयाँ नेतृत्व खोज्नुपर्छ',
    'shreenagar-tin-mudha-ek-khola': 'तीनवटा मुढा, एउटा खोला र श्रीनगरका प्रश्नहरू',
    'eutai-palika-dui-nirwachan-kshetra': 'एउटै पालिका, दुई निर्वाचन क्षेत्र'
  };
  let comments = [];

  function node(tag, className, text) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = String(text);
    return item;
  }
  function note(el, message, success) {
    el.textContent = message || '';
    el.classList.toggle('success', Boolean(success));
  }
  function setSignedIn(signedIn) {
    loginPanel.hidden = signedIn;
    dashboard.hidden = !signedIn;
  }
  function showTab(section) {
    const analytics = section === 'analytics';
    commentTab.classList.toggle('is-active', !analytics);
    analyticsTab.classList.toggle('is-active', analytics);
    commentTab.setAttribute('aria-selected', String(!analytics));
    analyticsTab.setAttribute('aria-selected', String(analytics));
    commentTab.tabIndex = analytics ? -1 : 0;
    analyticsTab.tabIndex = analytics ? 0 : -1;
    commentPanel.hidden = analytics;
    analyticsPanel.hidden = !analytics;
    if (analytics && !trafficLoaded) void loadTraffic();
  }
  async function api(path, method, data) {
    const options = { method: method || 'GET', credentials: 'same-origin', cache: 'no-store' };
    if (method && method !== 'GET') {
      options.headers = { 'Content-Type': 'application/json' };
      options.body = JSON.stringify(data || {});
    }
    const response = await fetch(path, options);
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || 'Request failed (' + response.status + ')');
    return body;
  }
  function niceDate(value) {
    if (!value) return '';
    const date = new Date(String(value).replace(' ', 'T') + 'Z');
    return Number.isNaN(date.valueOf()) ? '' : date.toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  }
  function articleTitle(path) {
    const slug = String(path || '').split('/').pop().replace(/\.html$/, '');
    return articleNames[slug] || slug || 'Article';
  }
  function button(text, className, onClick) {
    const b = node('button', className, text);
    b.type = 'button';
    b.addEventListener('click', onClick);
    return b;
  }
  async function mutate(path, method, data, successMessage) {
    try {
      note(portalMessage, 'Saving…');
      await api(path, method, data);
      await load();
      note(portalMessage, successMessage, true);
      return true;
    } catch (error) {
      note(portalMessage, error.message);
      return false;
    }
  }
  function replyEditor(commentId, oldReply, host) {
    host.replaceChildren();
    const container = node('form', 'compose-reply');
    const label = node('label', '', oldReply ? 'Edit your reply' : 'Write a reply');
    const area = node('textarea');
    area.maxLength = 3000;
    area.required = true;
    area.value = oldReply ? oldReply.message : '';
    area.setAttribute('aria-label', 'Reply text');
    const actions = node('div', 'actions');
    const save = node('button', 'primary-button', oldReply ? 'Save changes' : 'Publish reply');
    save.type = 'submit';
    const cancel = button('Cancel', 'small-button', () => host.replaceChildren());
    actions.append(save, cancel);
    container.append(label, area, actions);
    host.append(container);
    area.focus();
    container.addEventListener('submit', async (event) => {
      event.preventDefault();
      const message = area.value.trim();
      if (!message || message.length > 3000) return;
      save.disabled = true;
      const ok = oldReply ?
        await mutate('/api/portal/replies/' + oldReply.id, 'PATCH', { message }, 'Reply updated.') :
        await mutate('/api/portal/replies', 'POST', { commentId, message }, 'Reply published.');
      if (!ok) save.disabled = false;
    });
  }
  function replyView(reply) {
    const box = node('div', 'reply-item');
    const header = node('div', 'reply-meta');
    header.append(node('strong', '', reply.author_name || 'Deepak Kumar Karn'));
    header.append(node('small', '', niceDate(reply.created_at) + (reply.updated_at ? ' · edited' : '')));
    box.append(header, node('p', '', reply.message || ''));
    const actions = node('div', 'actions');
    const editSpace = node('div');
    actions.append(
      button('Edit reply', 'small-button', () => replyEditor(reply.comment_id, reply, editSpace)),
      button('Delete reply', 'danger-button', async () => {
        if (!confirm('Delete this reply permanently?')) return;
        await mutate('/api/portal/replies/' + reply.id, 'DELETE', {}, 'Reply deleted.');
      })
    );
    box.append(actions, editSpace);
    return box;
  }
  function commentCard(comment) {
    const box = node('article', 'comment-card');
    const head = node('div', 'comment-top');
    const authorBox = node('div');
    authorBox.append(node('div', 'comment-author', comment.author_name || 'Reader'));
    authorBox.append(node('small', 'comment-email', comment.author_email || ''));
    head.append(authorBox, node('time', 'comment-meta', niceDate(comment.created_at)));
    box.append(head);

    const link = node('a', 'article-link', articleTitle(comment.post_slug) + ' ↗');
    link.href = /^\/blog\/posts\/[a-z0-9-]+\.html$/.test(comment.post_slug) ? comment.post_slug : '/blog/';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    box.append(link, node('p', 'comment-text', comment.message || ''));

    const actions = node('div', 'actions');
    actions.append(node('span', 'status ' + comment.status, comment.status));
    if (comment.status === 'pending' || comment.status === 'rejected') {
      actions.append(button('Publish', 'small-button', () =>
        mutate('/api/portal/comments/' + comment.id, 'PATCH', { status: 'approved' }, 'Comment published.')));
    }
    if (comment.status === 'approved') {
      actions.append(button('Hide', 'small-button', () =>
        mutate('/api/portal/comments/' + comment.id, 'PATCH', { status: 'rejected' }, 'Comment hidden.')));
    }
    actions.append(button('Delete comment', 'danger-button', async () => {
      if (!confirm('Permanently delete this comment and all its replies?')) return;
      await mutate('/api/portal/comments/' + comment.id, 'DELETE', {}, 'Comment deleted.');
    }));
    box.append(actions);

    const replyArea = node('div', 'reply-section');
    replyArea.append(node('h3', '', 'Your replies (' + (comment.replies || []).length + ')'));
    for (const reply of comment.replies || []) replyArea.append(replyView(reply));
    const composeHost = node('div');
    if (comment.status === 'approved') {
      replyArea.append(button('+ Reply to this comment', 'small-button', () =>
        replyEditor(comment.id, null, composeHost)), composeHost);
    }
    box.append(replyArea);
    return box;
  }
  function render() {
    const term = search.value.trim().toLowerCase();
    const status = filter.value;
    const filtered = comments.filter(c => {
      if (status !== 'all' && c.status !== status) return false;
      if (!term) return true;
      return [c.author_name, c.author_email, c.message, articleTitle(c.post_slug), c.post_slug]
        .join(' ').toLowerCase().includes(term);
    });
    commentRows.replaceChildren();
    if (!filtered.length) {
      commentRows.append(node('p', 'empty', 'No matching comments.'));
      return;
    }
    for (const comment of filtered) commentRows.append(commentCard(comment));
  }
  function paintSummary() {
    summary.replaceChildren();
    const groups = [
      ['Total comments', comments.length],
      ['Published', comments.filter(c => c.status === 'approved').length],
      ['Needs review', comments.filter(c => c.status === 'pending').length]
    ];
    for (const group of groups) {
      const card = node('div', 'summary-card');
      card.append(node('strong', '', group[1]), node('span', '', group[0]));
      summary.append(card);
    }
  }
  function renderTraffic(info) {
    trafficStatus.textContent = '';
    const tiles = [
      ['Unique visitors', info.visitors],
      ['Total page views', info.pageViews],
      ['Blog post views', info.blogViews]
    ];
    trafficMetrics.replaceChildren();
    for (const [label, number] of tiles) {
      const tile = node('div', 'traffic-metric');
      tile.append(
        node('strong', '', Number(number || 0).toLocaleString('en-US')),
        node('span', '', label)
      );
      trafficMetrics.append(tile);
    }

    const known = [
      '/blog/posts/rsp-naya-netritwa.html',
      '/blog/posts/shreenagar-tin-mudha-ek-khola.html',
      '/blog/posts/eutai-palika-dui-nirwachan-kshetra.html'
    ];
    const found = new Map((Array.isArray(info.articles) ? info.articles : [])
      .filter(item => /^\/blog\/posts\/[a-z0-9-]+\.html$/.test(item.path))
      .map(item => [item.path, item]));
    const pages = [...new Set([...known, ...found.keys()])].map(path => ({
      path, views: Number(found.get(path)?.views || 0),
      visitors: Number(found.get(path)?.visitors || 0)
    })).sort((a, b) => b.views - a.views);

    trafficArticles.replaceChildren();
    for (const article of pages) {
      const line = node('div', 'traffic-article');
      const link = node('a', 'traffic-article-title', articleTitle(article.path));
      link.href = article.path;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      const views = node('div', 'traffic-article-count');
      views.append(
        node('strong', '', article.views.toLocaleString('en-US') + ' views'),
        node('span', '', article.visitors.toLocaleString('en-US') + ' visitors')
      );
      line.append(link, views);
      trafficArticles.append(line);
    }
  }
  async function loadTraffic() {
    try {
      const info = await api('/api/portal/traffic');
      renderTraffic(info);
      trafficLoaded = true;
    } catch (error) {
      trafficStatus.textContent = 'Statistics not ready. Run the D1 analytics table migration, then refresh.';
      trafficMetrics.replaceChildren();
      trafficArticles.replaceChildren();
    }
  }
  async function load() {
    const response = await api('/api/portal/comments');
    comments = Array.isArray(response.comments) ? response.comments : [];
    paintSummary();
    render();
  }
  loginForm.addEventListener('submit', async event => {
    event.preventDefault();
    loginButton.disabled = true;
    note(loginMessage, 'Signing in…');
    try {
      await api('/api/portal/login', 'POST', {
        username: loginForm.elements.username.value.trim(),
        password: loginForm.elements.password.value
      });
      loginForm.reset();
      setSignedIn(true);
      showTab('comments');
      await load();
      note(loginMessage, '');
    } catch (error) {
      note(loginMessage, error.message);
      setSignedIn(false);
    } finally {
      loginButton.disabled = false;
    }
  });
  document.querySelector('#logout-button').addEventListener('click', async () => {
    try { await api('/api/portal/logout', 'POST', {}); } catch {}
    comments = [];
    commentRows.replaceChildren();
    trafficLoaded = false;
    trafficMetrics.replaceChildren();
    trafficArticles.replaceChildren();
    showTab('comments');
    setSignedIn(false);
    note(portalMessage, '');
  });
  document.querySelector('#refresh-button').addEventListener('click', async () => {
    try { await load(); note(portalMessage, 'Updated.', true); }
    catch (error) { note(portalMessage, error.message); }
  });
  commentTab.addEventListener('click', () => showTab('comments'));
  analyticsTab.addEventListener('click', () => showTab('analytics'));
  analyticsRefresh.addEventListener('click', () => {
    trafficLoaded = false;
    trafficStatus.textContent = 'Refreshing website statistics…';
    void loadTraffic();
  });
  tablist.addEventListener('keydown', event => {
    const current = document.activeElement === analyticsTab ? 1 : 0;
    let next;
    if (event.key === 'ArrowRight') next = (current + 1) % 2;
    else if (event.key === 'ArrowLeft') next = (current + 1) % 2;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = 1;
    else return;
    event.preventDefault();
    const target = next ? analyticsTab : commentTab;
    target.focus();
    showTab(next ? 'analytics' : 'comments');
  });
  search.addEventListener('input', render);
  filter.addEventListener('change', render);
  (async () => {
    try {
      const state = await api('/api/portal/session');
      if (!state.configured) {
        note(loginMessage, 'Portal credentials are not configured yet. Set PORTAL_USERNAME and PORTAL_PASSWORD in Cloudflare.');
      }
      if (state.loggedIn) {
        setSignedIn(true);
        showTab('comments');
        await load();
      } else setSignedIn(false);
    } catch (error) {
      note(loginMessage, error.message);
      setSignedIn(false);
    }
  })();
})();
