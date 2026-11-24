/* Minimal blog article enhancements. All charts and numbers remain visible without JavaScript. */
(() => {
  'use strict';
  const toggle = document.getElementById('article-lang-toggle');
  const backToTop = document.getElementById('back-to-top');
  const copyLink = document.getElementById('copy-link');
  const feedback = document.getElementById('share-status');
  let language = 'ne';

  try {
    const preferred = localStorage.getItem('dk-language');
    if (preferred === 'en' || preferred === 'ne') language = preferred;
  } catch (_) {
    // Local storage may be unavailable; Nepali is the article default.
  }

  function setLanguage(lang) {
    language = lang;
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-ne][data-en]').forEach(element => {
      element.textContent = element.getAttribute('data-' + lang);
    });
    if (toggle) {
      toggle.textContent = lang === 'ne' ? 'English' : 'नेपाली';
      toggle.setAttribute('aria-label', lang === 'ne' ? 'Read in English' : 'नेपालीमा पढ्नुहोस्');
    }
    if (backToTop) backToTop.setAttribute('aria-label', lang === 'ne' ? 'पृष्ठको माथि जानुहोस्' : 'Back to top');
    document.title = lang === 'ne'
      ? 'तथ्याङ्कमा भंगाहा: जनसंख्या, समाज र आर्थिक अवस्था | Deepak Karn'
      : 'Bhangaha in Numbers: Population, Society & Socioeconomic Insights | Deepak Karn';
  }

  toggle?.addEventListener('click', () => {
    const next = language === 'ne' ? 'en' : 'ne';
    try { localStorage.setItem('dk-language', next); } catch (_) {}
    setLanguage(next);
  });

  const pageUrl = window.location.href.split('#')[0];
  const whatsapp = document.getElementById('share-whatsapp');
  const facebook = document.getElementById('share-facebook');
  if (whatsapp) {
    whatsapp.href = 'https://wa.me/?text=' + encodeURIComponent('तथ्याङ्कमा भंगाहा: ' + pageUrl);
  }
  if (facebook) {
    facebook.href = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(pageUrl);
  }

  copyLink?.addEventListener('click', async () => {
    let copied = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(pageUrl);
        copied = true;
      } else {
        const input = document.createElement('textarea');
        input.value = pageUrl;
        input.style.position = 'fixed';
        input.style.left = '-10000px';
        document.body.appendChild(input);
        input.select();
        copied = document.execCommand('copy');
        input.remove();
      }
    } catch (_) {
      copied = false;
    }
    if (feedback) feedback.textContent = copied
      ? (language === 'ne' ? 'लिंक कपी भयो।' : 'Link copied.')
      : (language === 'ne' ? 'लिंक कपी गर्न सकिएन।' : 'Could not copy the link.');
  });

  const preferReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  backToTop?.addEventListener('click', () => {
    window.scrollTo({top:0,behavior:preferReducedMotion()?'auto':'smooth'});
  });
  let queued = false;
  function onScroll() {
    if (!backToTop || queued) return;
    queued = true;
    window.requestAnimationFrame(() => {
      backToTop.hidden = window.scrollY < 760;
      queued = false;
    });
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();
  setLanguage(language);
})();