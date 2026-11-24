/* Reusable blog Like and Comment UI. Only uses same-origin /api routes. */
(() => {
  const root = document.querySelector('[data-blog-engagement]');
  if (!root) return;
  const canonical = document.querySelector('link[rel="canonical"]')?.href;
  const post = canonical ? new URL(canonical).pathname : window.location.pathname;
  if (!/^\/blog\/posts\/[a-z0-9][a-z0-9-]{0,90}\.html$/.test(post)) return;

  root.innerHTML = `
    <div class="engagement-header">
      <div><h2>तपाईंको प्रतिक्रिया</h2>
      <p>लेख मन पर्‍यो? Like गर्नुहोस् वा आफ्नो विचार राख्नुहोस्।</p></div>
    </div>
    <div class="engagement-actions">
      <div class="engagement-likes"><button type="button" class="engagement-like" disabled aria-pressed="false">♡ <span>Like</span></button><span class="engagement-like-count" aria-live="polite">— likes</span></div>
      <button type="button" class="engagement-view-comments" aria-controls="engagement-discussion-panel" aria-expanded="false" disabled>▤ Comments <span class="engagement-comment-count">(0)</span></button>
      <button type="button" class="engagement-comment-toggle" aria-controls="engagement-compose-panel" aria-expanded="false" disabled>✎ Comment लेख्नुहोस्</button>
    </div>
    <p class="engagement-load-status" role="status" aria-live="polite">Comments लोड हुँदैछन्…</p>
    <div class="engagement-discussion" id="engagement-discussion-panel" hidden>
      <div class="engagement-comment-list"></div>
    </div>
    <form class="engagement-form" id="engagement-compose-panel" novalidate hidden>
      <h3>Leave a Comment</h3>
      <p>Login आवश्यक छैन। सबै विवरण अनिवार्य छन्।</p>
      <div class="engagement-fields">
        <label>नाम <span aria-hidden="true">*</span><input name="name" type="text" maxlength="80" minlength="2" required autocomplete="name" placeholder="Your name"></label>
        <label>Email <span aria-hidden="true">*</span><input name="email" type="email" maxlength="254" required autocomplete="email" placeholder="you@example.com"></label>
        <label class="engagement-comment-field">Comment <span aria-hidden="true">*</span><textarea name="comment" minlength="3" maxlength="3000" rows="5" required placeholder="तपाईंको विचार लेख्नुहोस्…"></textarea></label>
      </div>
      <p class="engagement-privacy">तपाईंको Email सार्वजनिक हुँदैन। Submit गरेपछि Comment तुरुन्त प्रकाशित हुन्छ।</p>
      <div class="engagement-turnstile" aria-label="Spam verification"></div>
      <button class="engagement-submit" type="submit" disabled>Submit Comment</button>
      <p class="engagement-submit-status" role="status" aria-live="polite"></p>
    </form>`;

  // Every published blog uses ONE shared floating navigation component.
  // Keep the Up arrow usable throughout every section below the first screen.
  // The reactions shortcut disappears when the reactions area comes into view.
  root.id = 'article-reactions';
  const reactionsHeading = root.querySelector('.engagement-header h2');
  const floatingActions = document.createElement('nav');
  floatingActions.className = 'blog-floating-actions';
  floatingActions.setAttribute('aria-label', 'लेखमा छिटो जानुहोस्');

  const backToTop = document.createElement('button');
  backToTop.className = 'blog-back-to-top';
  backToTop.type = 'button';
  backToTop.setAttribute('aria-label', 'लेखको सुरुमा फर्कनुहोस्');
  backToTop.title = 'लेखको सुरुमा फर्कनुहोस्';
  backToTop.textContent = '↑';
  backToTop.hidden = true;

  const jumpLink = document.createElement('a');
  jumpLink.className = 'engagement-jump';
  jumpLink.href = '#article-reactions';
  jumpLink.setAttribute('aria-label', 'लाइक र कमेन्टमा जानुहोस्');
  jumpLink.title = 'लाइक र कमेन्टमा जानुहोस्';
  jumpLink.innerHTML = '<span class="engagement-jump-label">प्रतिक्रिया</span><span class="engagement-jump-arrow" aria-hidden="true">↓</span>';
  jumpLink.hidden = true;

  floatingActions.append(backToTop, jumpLink);
  document.body.append(floatingActions);
  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let floatingUpdateQueued = false;
  function updateFloatingActions() {
    floatingUpdateQueued = false;
    backToTop.hidden = window.scrollY < 320;
    const reactionsTop = root.getBoundingClientRect().top;
    jumpLink.hidden = reactionsTop <= window.innerHeight - 72;
    floatingActions.hidden = backToTop.hidden && jumpLink.hidden;
  }
  function queueFloatingActions() {
    if (floatingUpdateQueued) return;
    floatingUpdateQueued = true;
    window.requestAnimationFrame(updateFloatingActions);
  }
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion() ? 'auto' : 'smooth' });
    queueFloatingActions();
  });
  jumpLink.addEventListener('click', event => {
    event.preventDefault();
    if (reactionsHeading) {
      reactionsHeading.tabIndex = -1;
      reactionsHeading.focus({ preventScroll: true });
    }
    root.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
    queueFloatingActions();
  });
  window.addEventListener('scroll', queueFloatingActions, { passive: true });
  window.addEventListener('resize', queueFloatingActions);
  window.addEventListener('pageshow', queueFloatingActions);
  queueFloatingActions();

  const likeButton = root.querySelector('.engagement-like');
  const likeCount = root.querySelector('.engagement-like-count');
  const commentList = root.querySelector('.engagement-comment-list');
  const commentCount = root.querySelector('.engagement-comment-count');
  const loadStatus = root.querySelector('.engagement-load-status');
  const discussion = root.querySelector('.engagement-discussion');
  const viewCommentsButton = root.querySelector('.engagement-view-comments');
  const commentToggleButton = root.querySelector('.engagement-comment-toggle');
  const form = root.querySelector('.engagement-form');
  const submitButton = root.querySelector('.engagement-submit');
  const submitStatus = root.querySelector('.engagement-submit-status');
  const turnstileHost = root.querySelector('.engagement-turnstile');
  let liked = false;
  let token = '';
  let widgetId = null;
  let busy = false;
  let turnstileScriptAdded = false;
  let commentsEnabled = false;
  // Form and public comments stay collapsed until a reader asks to open them.

  function setLikes(count, active) {
    liked = Boolean(active);
    likeCount.textContent = `${Number(count) || 0} likes`;
    likeButton.setAttribute('aria-pressed', String(liked));
    likeButton.classList.toggle('is-liked', liked);
    likeButton.querySelector('span').textContent = liked ? 'Liked' : 'Like';
    likeButton.firstChild.textContent = liked ? '♥ ' : '♡ ';
    likeButton.disabled = false;
  }
  function showComments(items) {
    commentList.replaceChildren();
    commentCount.textContent = `(${items.length})`;
    if (!items.length) {
      const empty = document.createElement('p');
      empty.className = 'engagement-empty';
      empty.textContent = 'अहिलेसम्म सार्वजनिक comment छैन। आफ्नो विचार राख्न सक्नुहुन्छ।';
      commentList.append(empty);
      return;
    }
    for (const item of items) {
      const box = document.createElement('article');
      box.className = 'engagement-comment';
      const header = document.createElement('header');
      header.className = 'engagement-comment-meta';
      const readerName = String(item.author_name || 'Reader').trim() || 'Reader';
      const avatar = document.createElement('span');
      avatar.className = 'engagement-comment-avatar';
      avatar.setAttribute('aria-hidden', 'true');
      avatar.textContent = Array.from(readerName)[0].toLocaleUpperCase();
      const identity = document.createElement('div');
      identity.className = 'engagement-comment-identity';
      const name = document.createElement('strong');
      name.textContent = readerName;
      const kind = document.createElement('span');
      kind.className = 'engagement-comment-kind';
      kind.textContent = 'Reader comment';
      identity.append(name, kind);
      const date = document.createElement('time');
      const utc = String(item.created_at || '').replace(' ', 'T') + 'Z';
      const value = new Date(utc);
      if (!Number.isNaN(value.valueOf())) {
        date.dateTime = value.toISOString();
        date.textContent = value.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      }
      header.append(avatar, identity, date);
      const message = document.createElement('p');
      message.className = 'engagement-comment-message';
      message.textContent = String(item.message || ''); // Never interpret reader content as HTML.
      box.append(header, message);
      if (Array.isArray(item.replies) && item.replies.length) {
        const replies = document.createElement('div');
        replies.className = 'engagement-replies';
        for (const reply of item.replies) {
          const replyBox = document.createElement('div');
          replyBox.className = 'engagement-reply';
          const replyHeader = document.createElement('div');
          replyHeader.className = 'engagement-reply-meta';
          const authorName = String(reply.author_name || 'Deepak Kumar Karn').trim() || 'Deepak Kumar Karn';
          const authorAvatar = document.createElement('span');
          authorAvatar.className = 'engagement-reply-avatar';
          authorAvatar.setAttribute('aria-hidden', 'true');
          authorAvatar.textContent = Array.from(authorName.split(/\s+/).filter(Boolean).map(part => Array.from(part)[0]).slice(0, 2).join('')).join('').toLocaleUpperCase();
          const authorIdentity = document.createElement('div');
          authorIdentity.className = 'engagement-reply-identity';
          const author = document.createElement('strong');
          author.textContent = authorName;
          const label = document.createElement('span');
          label.textContent = 'Author';
          label.className = 'engagement-author-label';
          authorIdentity.append(author, label);
          const replyDate = document.createElement('time');
          const replyValue = new Date(String(reply.created_at || '').replace(' ', 'T') + 'Z');
          if (!Number.isNaN(replyValue.valueOf())) {
            replyDate.dateTime = replyValue.toISOString();
            replyDate.textContent = replyValue.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
          }
          replyHeader.append(authorAvatar, authorIdentity, replyDate);
          const replyText = document.createElement('p');
          replyText.className = 'engagement-reply-message';
          replyText.textContent = String(reply.message || '');
          replyBox.append(replyHeader, replyText);
          if (reply.updated_at) {
            const edited = document.createElement('small');
            edited.className = 'engagement-reply-edited';
            edited.textContent = 'Edited';
            replyBox.append(edited);
          }
          replies.append(replyBox);
        }
        box.append(replies);
      }
      commentList.append(box);
    }
  }
  async function send(path, data) {
    const response = await fetch(path, {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || 'Please try again.');
    return payload;
  }
  likeButton.addEventListener('click', async () => {
    if (likeButton.disabled) return;
    likeButton.disabled = true;
    try {
      const response = await send('/api/likes', { post, action: liked ? 'unlike' : 'like' });
      setLikes(response.likes, response.liked);
    } catch {
      likeCount.textContent = 'Like unavailable, please retry';
      likeButton.disabled = false;
    }
  });
  async function loadComments() {
    try {
      const response = await fetch(`/api/engagement?post=${encodeURIComponent(post)}`, { credentials: 'same-origin', cache: 'no-store' });
      if (!response.ok) throw Error('Unavailable');
      const payload = await response.json();
      setLikes(payload.likes, payload.liked);
      showComments(Array.isArray(payload.comments) ? payload.comments : []);
      loadStatus.hidden = true;
      viewCommentsButton.disabled = false;
      commentsEnabled = Boolean(payload.commentsEnabled);
      commentToggleButton.disabled = !commentsEnabled;
      if (!commentsEnabled) {
        loadStatus.hidden = false;
        loadStatus.textContent = 'Comment form को सुरक्षा सेटअप पूरा हुँदैछ।';
      }
    } catch {
      loadStatus.textContent = 'Like र Comment प्रणाली सेटअप हुँदैछ।';
      likeCount.textContent = 'Unavailable';
      commentCount.textContent = '';
    }
  }
  viewCommentsButton.addEventListener('click', () => {
    discussion.hidden = !discussion.hidden;
    viewCommentsButton.setAttribute('aria-expanded', String(!discussion.hidden));
    if (!discussion.hidden) discussion.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
  commentToggleButton.addEventListener('click', () => {
    if (!commentsEnabled) return;
    form.hidden = !form.hidden;
    commentToggleButton.setAttribute('aria-expanded', String(!form.hidden));
    commentToggleButton.textContent = form.hidden ? '✎ Comment लेख्नुहोस्' : '✕ Form बन्द गर्नुहोस्';
    if (!form.hidden) {
      if (!turnstileScriptAdded) {
        turnstileScriptAdded = true;
        document.head.appendChild(script);
      } else if (window.turnstile && widgetId === null) {
        setupTurnstile();
      }
      form.elements.name.focus({ preventScroll: true });
    }
  });

  function updateSubmit() {
    const fields = form.elements;
    const valid = fields.name.value.trim().length >= 2 && fields.name.validity.valid &&
      fields.email.value.trim().length > 0 && fields.email.validity.valid &&
      fields.comment.value.trim().length >= 3 && fields.comment.validity.valid;
    submitButton.disabled = busy || !valid || !token;
  }
  form.addEventListener('input', updateSubmit);
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || !form.reportValidity() || !token) return;
    busy = true;
    updateSubmit();
    submitStatus.textContent = 'Comment पठाउँदैछ…';
    try {
      await send('/api/comments', {
        post, name: form.elements.name.value.trim(), email: form.elements.email.value.trim(),
        comment: form.elements.comment.value.trim(), turnstileToken: token
      });
      form.reset();
      submitStatus.textContent = 'धन्यवाद! तपाईंको comment प्रकाशित भयो।';
      submitStatus.classList.add('is-success');
      await loadComments();
      discussion.hidden = false;
      viewCommentsButton.setAttribute('aria-expanded', 'true');
    } catch (error) {
      submitStatus.textContent = error.message || 'Comment पठाउन सकिएन।';
      submitStatus.classList.remove('is-success');
    } finally {
      busy = false;
      token = '';
      if (widgetId !== null && window.turnstile) window.turnstile.reset(widgetId);
      updateSubmit();
    }
  });
  function setupTurnstile() {
    if (widgetId !== null || form.hidden) return;
    if (!window.turnstile) {
      submitStatus.textContent = 'Verification लोड हुन सकेन। पेज refresh गर्नुहोस्।';
      return;
    }
    widgetId = window.turnstile.render(turnstileHost, {
      sitekey: '0x4AAAAAAGKEIxTMfCUHTMHe',
      theme: 'light',
      size: 'flexible',
      callback: value => { token = value; updateSubmit(); },
      'expired-callback': () => { token = ''; updateSubmit(); },
      'error-callback': () => { token = ''; updateSubmit(); }
    });
  }
  const script = document.createElement('script');
  script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
  script.async = true;
  script.onload = setupTurnstile;
  script.onerror = () => { submitStatus.textContent = 'Verification लोड हुन सकेन। पेज refresh गर्नुहोस्।'; };
  loadComments();
})();
