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
    if (typeof displayWard === 'function') displayWard();
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

  // One shared data viewport; the article below remains an ordinary reading experience.
  const explorer = document.getElementById('data-explorer');
  const dataTabs = Array.from(explorer?.querySelectorAll('[data-dx-tab]') || []);
  const dataPanels = Array.from(explorer?.querySelectorAll('[data-dx-panel]') || []);
  const tabViewport = document.getElementById('dx-tab-viewport');
  const panelByTopic = new Map(dataPanels.map(panel => [panel.dataset.dxPanel, panel]));
  let activeTopic = 'overview';
  let wardSelection = 'all';

  function activateTopic(topic, updateHash = false) {
    if (!explorer || !panelByTopic.has(topic)) return;
    activeTopic = topic;
    for (const tab of dataTabs) {
      const selected = tab.dataset.dxTab === topic;
      tab.setAttribute('aria-selected', selected ? 'true' : 'false');
      tab.tabIndex = selected ? 0 : -1;
    }
    for (const panel of dataPanels) {
      const selected = panel.dataset.dxPanel === topic;
      panel.dataset.active = String(selected);
      panel.hidden = !selected;
    }
    const activeTab = dataTabs.find(tab => tab.dataset.dxTab === topic);
    if (activeTab && tabViewport) {
      const start = activeTab.offsetLeft - tabViewport.offsetLeft;
      const end = start + activeTab.offsetWidth;
      if (start < tabViewport.scrollLeft) {
        tabViewport.scrollTo({left: Math.max(0, start - 12), behavior: preferReducedMotion() ? 'auto' : 'smooth'});
      } else if (end > tabViewport.scrollLeft + tabViewport.clientWidth) {
        tabViewport.scrollTo({left: Math.max(0, end - tabViewport.clientWidth + 12), behavior: preferReducedMotion() ? 'auto' : 'smooth'});
      }
    }
    if (updateHash) {
      const hash = '#data-' + topic;
      if (window.location.hash !== hash) {
        window.history.pushState(null, '', hash);
      }
    }
  }

  for (let index = 0; index < dataTabs.length; index++) {
    const tab = dataTabs[index];
    tab.addEventListener('click', () => {
      activateTopic(tab.dataset.dxTab, true);
    });
    tab.addEventListener('keydown', event => {
      let nextIndex;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % dataTabs.length;
      else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + dataTabs.length) % dataTabs.length;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = dataTabs.length - 1;
      else return;
      event.preventDefault();
      const next = dataTabs[nextIndex];
      next.focus({preventScroll: true});
      activateTopic(next.dataset.dxTab, true);
    });
  }

  function updateFromHash() {
    const match = /^#data-([a-z]+)$/.exec(window.location.hash);
    if (match && panelByTopic.has(match[1])) activateTopic(match[1], false);
  }
  window.addEventListener('hashchange', updateFromHash);
  window.addEventListener('popstate', updateFromHash);
  document.getElementById('dx-left')?.addEventListener('click', () => {
    tabViewport?.scrollBy({left: -Math.max(160, tabViewport.clientWidth * .68), behavior: preferReducedMotion() ? 'auto' : 'smooth'});
  });
  document.getElementById('dx-right')?.addEventListener('click', () => {
    tabViewport?.scrollBy({left: Math.max(160, tabViewport.clientWidth * .68), behavior: preferReducedMotion() ? 'auto' : 'smooth'});
  });

  const wardButtons = Array.from(explorer?.querySelectorAll('[data-ward]') || []);
  const wardRows = Array.from(explorer?.querySelectorAll('[data-ward-row]') || []);
  const wardFigure = document.getElementById('dx-ward-figure');
  const wardDescription = document.getElementById('dx-ward-description');

  function displayWard() {
    for (const button of wardButtons) {
      button.setAttribute('aria-pressed', button.dataset.ward === wardSelection ? 'true' : 'false');
    }
    for (const row of wardRows) {
      row.hidden = wardSelection !== 'all' && row.dataset.wardRow !== wardSelection;
    }
    if (!wardFigure || !wardDescription) return;
    if (wardSelection === 'all') {
      const sum = wardRows.reduce((total, row) => {
        const number = Number((row.cells[1]?.textContent || '').replaceAll(',', '').trim());
        return Number.isFinite(number) ? total + number : total;
      }, 0);
      wardFigure.textContent = sum.toLocaleString('en-US');
      wardDescription.textContent = language === 'ne' ? 'सबै नौ वडा, जनगणना २०२१' : 'All nine wards, Census 2021';
    } else {
      const selected = wardRows.find(row => row.dataset.wardRow === wardSelection);
      if (!selected) return;
      wardFigure.textContent = selected.cells[1]?.textContent.trim() || '';
      const share = selected.cells[2]?.textContent.trim() || '';
      wardDescription.textContent = language === 'ne'
        ? 'वडा ' + wardSelection + ' · कुल जनसंख्याको ' + share
        : 'Ward ' + wardSelection + ' · ' + share + ' of residents';
    }
  }
  for (const button of wardButtons) {
    button.addEventListener('click', () => {
      wardSelection = button.dataset.ward;
      displayWard();
    });
  }

  if (explorer && dataTabs.length === 13 && dataPanels.length === 13) {
    document.body.classList.add('dx-enhanced');
    const hash = /^#data-([a-z]+)$/.exec(window.location.hash);
    activateTopic(hash && panelByTopic.has(hash[1]) ? hash[1] : 'overview');
    displayWard();
  }
  onScroll();
  setLanguage(language);
})();