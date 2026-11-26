/* Shared light/dark theme: execute in <head> before styles to avoid a flash. */
(() => {
  'use strict';
  const key = 'dk-theme';
  const root = document.documentElement;
  const media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  let saved = null;
  try {
    const value = localStorage.getItem(key);
    if (value === 'light' || value === 'dark') saved = value;
  } catch (_) { /* private browsing / unavailable storage */ }

  const systemTheme = () => media && media.matches ? 'dark' : 'light';
  const apply = theme => {
    root.setAttribute('data-theme', theme);
    const colorMeta = document.querySelector('meta[name="theme-color"]');
    if (colorMeta) colorMeta.content = theme === 'dark' ? '#191e1c' : '#fbf7f0';
    const button = document.querySelector('.theme-toggle');
    if (!button) return;
    const ne = root.lang.toLowerCase().startsWith('ne');
    const dark = theme === 'dark';
    button.setAttribute('aria-pressed', dark ? 'true' : 'false');
    button.setAttribute('aria-label', ne ? 'डार्क मोड' : 'Dark mode');
    button.title = ne
      ? (dark ? 'लाइट मोडमा बदल्नुहोस्' : 'डार्क मोडमा बदल्नुहोस्')
      : (dark ? 'Switch to light mode' : 'Switch to dark mode');
    const glyph = button.querySelector('.theme-icon');
    if (glyph) glyph.textContent = dark ? '☀' : '☾';
  };

  apply(saved || systemTheme());

  const initialize = () => {
    const header = document.querySelector('.site-header');
    if (!header || header.querySelector('.theme-toggle')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'theme-toggle';
    button.innerHTML = '<span class="theme-icon" aria-hidden="true">☾</span>';
    const actions = header.querySelector('.header-actions');
    if (actions) {
      const menu = actions.querySelector('.menu-toggle');
      if (menu) actions.insertBefore(button, menu);
      else actions.appendChild(button);
    } else {
      const existing = header.querySelector('.language-toggle, .secondary-link');
      if (existing) {
        const group = document.createElement('div');
        group.className = 'theme-article-actions';
        existing.parentNode.insertBefore(group, existing);
        group.appendChild(existing);
        group.appendChild(button);
      } else {
        header.appendChild(button);
      }
    }
    button.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      saved = next;
      try { localStorage.setItem(key, next); } catch (_) {}
      apply(next);
    });
    apply(root.getAttribute('data-theme') || systemTheme());
    if (typeof MutationObserver !== 'undefined') {
      const observer = new MutationObserver(() => apply(root.getAttribute('data-theme') || systemTheme()));
      observer.observe(root, {attributes: true, attributeFilter: ['lang']});
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, {once: true});
  else initialize();
  const systemChange = () => {
    if (!saved) apply(systemTheme());
  };
  if (media && media.addEventListener) media.addEventListener('change', systemChange);
  else if (media && media.addListener) media.addListener(systemChange);
})();
