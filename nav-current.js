/* Shared navigation location indicator. Subpage semantics are also in HTML. */
(() => {
  'use strict';
  const links = [...document.querySelectorAll('.desktop-nav a[data-i18n], #mobile-nav a[data-i18n]')];
  const logo = document.querySelector('.site-header .wordmark');
  const path = location.pathname.replace(/\/index\.html$/, '/');
  const set = (key, kind) => {
    links.forEach(link => {
      if (link.dataset.i18n === key) link.setAttribute('aria-current', kind);
      else link.removeAttribute('aria-current');
    });
    if (logo) {
      if (path === '/' && !key) logo.setAttribute('aria-current', 'page');
      else logo.removeAttribute('aria-current');
    }
  };
  if (/^\/blog(?:\/|$)/.test(path)) { set('navBlog', /^\/blog\/?$/.test(path) ? 'page' : 'location'); return; }
  if (/^\/data(?:\/|$)/.test(path)) { set('navData', /^\/data\/?$/.test(path) ? 'page' : 'location'); return; }
  if (path !== '/') return;
  const sections = [['about','navAbout'], ['focus','navFocus'], ['journey','navJourney'], ['connect','navConnect']].map(([id,key])=>({el:document.getElementById(id),key})).filter(s=>s.el);
  let pending = false;
  function sync() {
    pending = false;
    const header = document.querySelector('.site-header');
    const marker = (header?.getBoundingClientRect().bottom || 0) + Math.min(120, window.innerHeight * .2);
    let key = null;
    for (const section of sections) if (section.el.getBoundingClientRect().top <= marker) key = section.key;
    if (window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4 && sections.length) key = sections[sections.length-1].key;
    set(key,'location');
  }
  const queue = () => { if (!pending) { pending = true; requestAnimationFrame(sync); } };
  window.addEventListener('scroll', queue, {passive:true});
  window.addEventListener('resize', queue);
  window.addEventListener('hashchange', queue);
  window.addEventListener('pageshow', queue);
  window.addEventListener('load', queue);
  sync();
})();
