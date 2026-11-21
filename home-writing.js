(() => {
  'use strict';
  const list = document.getElementById('latest-posts');
  if (!list) return;
  const posts = Array.isArray(window.DK_BLOG_POSTS) ? window.DK_BLOG_POSTS.slice(0, 3) : [];
  function draw() {
    const lang = document.documentElement.lang === 'ne' ? 'ne' : 'en';
    list.replaceChildren();
    if (!posts.length) {
      const p = document.createElement('p');
      p.className = 'latest-loading';
      p.textContent = lang === 'ne' ? 'थप लेखहरू ब्लगमा पढ्न सक्नुहुन्छ।' : 'Discover more on the blog.';
      list.append(p);
      return;
    }
    for (const post of posts) {
      if (!post || !/^posts\/[a-z0-9-]+\.html$/.test(post.url || '')) continue;
      const a = document.createElement('a');
      a.className = 'latest-post';
      a.href = '/blog/' + post.url;
      const img = document.createElement('img');
      img.className = 'latest-thumbnail';
      img.src = '/blog/' + (post.image || '');
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      const copy = document.createElement('span');
      copy.className = 'latest-post-copy';
      const category = document.createElement('span');
      category.className = 'latest-post-category';
      category.textContent = (post.category && (post.category[lang] || post.category.ne)) || '';
      const title = document.createElement('span');
      title.className = 'latest-post-title';
      title.textContent = (post.title && (post.title[lang] || post.title.ne)) || '';
      const arrow = document.createElement('span');
      arrow.className = 'latest-post-arrow';
      arrow.textContent = '↗';
      arrow.setAttribute('aria-hidden','true');
      copy.append(category,title);
      a.append(img,copy,arrow);
      list.append(a);
    }
  }
  draw();
  document.addEventListener('dk:languagechange', draw);
})();
