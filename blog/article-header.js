/* Shared article-header controller.
   Uses the same navigation structure and language preference as the main site.
   Published article bodies remain Nepali; only shared navigation is bilingual. */
(() => {
  'use strict';
  const toggle = document.getElementById('language-toggle');
  const label = document.getElementById('language-label');
  const menu = document.getElementById('menu-toggle');
  const mobile = document.getElementById('mobile-nav');
  if (!toggle || !label || !menu || !mobile) return;

  const texts = {
    ne: {
      navAbout: 'मेरो बारेमा', navFocus: 'मुख्य सोच', navJourney: 'यात्रा',
      navBlog: 'ब्लग', navConnect: 'सम्पर्क',
      open: 'मेनु खोल्नुहोस्', close: 'मेनु बन्द गर्नुहोस्',
      switchLanguage: 'Switch navigation to English (article remains in Nepali)'
    },
    en: {
      navAbout: 'About', navFocus: 'Focus', navJourney: 'Journey',
      navBlog: 'Blog', navConnect: 'Connect',
      open: 'Open menu', close: 'Close menu',
      switchLanguage: 'नेभिगेसन नेपालीमा बदल्नुहोस् (लेख नेपालीमै रहनेछ)'
    }
  };

  let language = 'en';
  try { if (localStorage.getItem('dk-language') === 'ne') language = 'ne'; }
  catch (_) { /* localStorage may be disabled */ }

  function closeMenu(returnFocus = false) {
    mobile.hidden = true;
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', texts[language].open);
    if (returnFocus) menu.focus();
  }

  function setLanguage(next) {
    language = next === 'ne' ? 'ne' : 'en';
    document.querySelectorAll('.site-header [data-i18n], #mobile-nav [data-i18n]').forEach(node => {
      const message = texts[language][node.dataset.i18n];
      if (message) node.textContent = message;
    });
    const navLang = language;
    document.querySelector('.desktop-nav')?.setAttribute('lang', navLang);
    mobile.setAttribute('lang', navLang);
    label.textContent = language === 'ne' ? 'EN' : 'ने';
    toggle.setAttribute('aria-pressed', String(language === 'en'));
    toggle.setAttribute('aria-label', texts[language].switchLanguage);
    toggle.setAttribute('title', texts[language].switchLanguage);
    menu.setAttribute('aria-label', mobile.hidden ? texts[language].open : texts[language].close);
    // Do not change <html lang="ne">: actual article contents are Nepali.
    try { localStorage.setItem('dk-language', language); } catch (_) {}
  }

  setLanguage(language);
  toggle.addEventListener('click', () => setLanguage(language === 'ne' ? 'en' : 'ne'));
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') === 'true';
    mobile.hidden = open;
    menu.setAttribute('aria-expanded', String(!open));
    menu.setAttribute('aria-label', open ? texts[language].open : texts[language].close);
  });
  mobile.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => closeMenu());
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !mobile.hidden) closeMenu(true);
  });
})();
